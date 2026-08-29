"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  School,
  AcademicYear,
  SchoolClass,
  TuitionPlan,
  Student,
  Payment,
  Reminder,
  StudentFinancialSummary,
  DashboardMetrics,
  PaymentMethod,
  PaymentStatus,
  AuditLogRecord,
  StaffMember,
  StaffRole,
  StaffPermission,
  ScolyNotification,
  ScolySubscription,
  SubscriptionPlan,
  SubscriptionBillingPeriod,
  FeatureKey,
  FeatureAccessResult,
} from "@/types/scoly";
import { ImportBatchRecord } from "@/types/import";
import {
  INITIAL_SCHOOL,
  INITIAL_ACADEMIC_YEAR,
  INITIAL_CLASSES,
  INITIAL_TUITION_PLANS,
  INITIAL_STUDENTS,
  INITIAL_PAYMENTS,
  INITIAL_REMINDERS,
} from "./mock-data";
import {
  isSupabaseConfigured,
  getSupabaseBrowser,
} from "./supabase/client";
import {
  fetchSchool,
  fetchAcademicYear,
  fetchAcademicYearsList,
  fetchClasses,
  fetchStudents,
  fetchPayments,
  fetchTuitionPlans,
  fetchReminders,
  fetchPaymentMethodsDb,
  fetchImportBatchesDb,
  fetchNotificationsDb,
  fetchSubscriptionDb,
  insertNotificationDb,
  markNotificationAsReadDb,
  markAllNotificationsAsReadDb,
  deleteNotificationDb,
  upsertSchool,
  upsertAcademicYearDb,
  upsertClassDb,
  deleteClassDb,
  insertStudentDb,
  updateStudentDb,
  deleteStudentDb,
  insertPaymentDb,
  cancelPaymentDb,
  saveTuitionPlanDb,
  deleteTuitionPlanDb,
  insertReminderDb,
  savePaymentMethodsDb,
  insertImportBatchDb,
  batchImportToPostgres,
  PaymentMethodConfig,
  getDefaultPaymentMethods,
  upsertSubscriptionDb,
  activatePaidSubscriptionDb,
} from "./supabase/db";
import {
  analyzeSchoolState,
  filterNotificationsByRole,
} from "./notifications/analyzer";
import {
  createPaymentNotification,
  createPaymentCancelledNotification,
  createImportCompletedNotification,
  createStudentEnrolledNotification,
  createOperationErrorNotification,
  createTrialStartedNotification,
  createTrialExpiringNotification,
  createTrialExpiredNotification,
  createSubscriptionActivatedNotification,
  createProFeatureSuggestionNotification,
} from "./notifications/engine";
import {
  subscribeToSchoolNotifications,
  broadcastNotificationEvent,
} from "./notifications/realtime";
import {
  canAccessFeature,
  getDefaultTrialSubscription,
  calculateSubscriptionDates,
  FEATURE_DEFINITIONS,
} from "./subscription/features";




export const DEFAULT_STAFF: StaffMember[] = [
  {
    id: "staff-owner",
    school_id: "sch-001",
    full_name: "Directeur / Administrateur",
    email: "",
    phone: "",
    role: "directeur",
    permissions: {
      can_collect_payments: true,
      can_manage_students: true,
      can_manage_tuition: true,
      can_send_reminders: true,
      can_view_financial_stats: true,
      can_manage_settings: true,
    },
    status: "actif",
    invited_at: new Date().toISOString(),
  },
];

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role?: string;
}

export type SyncStatus = "synced" | "syncing" | "offline" | "error";

interface ScolyContextType {
  // Data (Single Source of Truth: Supabase PostgreSQL)
  school: School;
  academicYear: AcademicYear;
  academicYearsList: AcademicYear[];
  classes: SchoolClass[];
  tuitionPlans: TuitionPlan[];
  students: Student[];
  payments: Payment[];
  reminders: Reminder[];
  staffMembers: StaffMember[];
  importBatches: ImportBatchRecord[];
  isLoaded: boolean;
  isSupabaseConnected: boolean;
  syncStatus: SyncStatus;
  syncErrorMessage?: string;

  // Authentication & Account
  currentUser: AuthUser | null;
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error?: string; school?: School }>;
  registerUser: (
    emailOrParams:
      | string
      | {
          email: string;
          pass?: string;
          password?: string;
          firstName: string;
          lastName: string;
          phone?: string;
          schoolName?: string;
        },
    pass?: string,
    schoolName?: string,
    fullName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;

  // Onboarding
  saveOnboardingStep: (step: number, data?: Partial<School>) => Promise<void>;
  completeOnboarding: (setupData?: {
    school?: School;
    academicYear?: AcademicYear;
    classes?: SchoolClass[];
    tuitionPlans?: TuitionPlan[];
  }) => Promise<void>;
  updateClasses: (newClasses: SchoolClass[]) => void;
  updateTuitionPlans: (newPlans: TuitionPlan[]) => void;

  // Configurable Payment Methods
  paymentMethods: PaymentMethodConfig[];
  addPaymentMethod: (label: string) => void;
  updatePaymentMethod: (key: string, updates: Partial<PaymentMethodConfig>) => void;
  deletePaymentMethod: (key: string) => void;
  reorderPaymentMethods: (methods: PaymentMethodConfig[]) => void;

  // Calculators
  getStudentFinancialSummary: (studentId: string) => StudentFinancialSummary;
  dashboardMetrics: DashboardMetrics;

  // Actions (Direct PostgreSQL Operations)
  addPayment: (params: {
    student_id: string;
    amount: number;
    payment_method: PaymentMethod;
    payment_date?: string;
    transaction_ref?: string;
    notes?: string;
    recorded_by_name?: string;
    idempotency_key?: string;
  }) => Payment;

  cancelPayment: (
    paymentId: string,
    reason: string,
    cancelledByName?: string
  ) => boolean;

  addStudent: (params: {
    first_name: string;
    last_name: string;
    gender: "M" | "F";
    birth_date?: string;
    class_id: string;
    class_name?: string;
    matricule?: string;
    discount_amount?: number;
    discount_reason?: string;
    custom_tuition?: number;
    parent_name: string;
    parent_relationship: "Père" | "Mère" | "Tuteur" | "Autre";
    parent_phone: string;
    parent_whatsapp?: string;
    parent_profession?: string;
    parent_address?: string;
  }) => Student;

  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  deleteStudent: (studentId: string) => void;
  addClass: (params: {
    name: string;
    level: string;
    series?: string;
    cycle_year?: string;
    branch?: string;
    description?: string;
    order_index?: number;
  }) => SchoolClass;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => boolean;
  updateSchool: (updates: Partial<School>) => void;
  updateAcademicYear: (updates: Partial<AcademicYear>) => void;
  addAcademicYear: (year: AcademicYear) => void;
  updateTuitionPlan: (plan: TuitionPlan) => void;
  deleteTuitionPlan: (planIdOrClassId: string) => void;
  inviteStaffMember: (params: {
    full_name: string;
    email: string;
    phone: string;
    role: StaffRole;
    permissions: StaffPermission;
  }) => StaffMember;
  updateStaffMember: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaffMember: (id: string) => void;
  recordReminder: (reminder: Omit<Reminder, "id" | "sent_at">) => Reminder;
  logAudit: (action: string, entityType: string, entityId: string, payload: any) => void;
  recordImportBatch: (batch: ImportBatchRecord) => void;
  searchGlobal: (query: string) => {
    students: (Student & { balance_due: number; class_name: string })[];
    payments: Payment[];
  };
  // Notifications (Système Intelligent, Réel & Contextuel)
  notifications: ScolyNotification[];
  unreadNotificationsCount: number;
  addNotification: (notif: ScolyNotification) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  triggerProactiveAnalysis: () => void;

  // Abonnements & Forfaits (START, PRO, PREMIUM, Essai 30j)
  subscription: ScolySubscription;
  hasFeature: (feature: FeatureKey) => boolean;
  canAccess: (feature: FeatureKey) => FeatureAccessResult;
  upgradeSubscription: (
    plan: SubscriptionPlan,
    billingPeriod: SubscriptionBillingPeriod,
    transactionRef?: string
  ) => Promise<{ success: boolean; error?: string }>;
  cancelCurrentSubscription: () => Promise<{ success: boolean; error?: string }>;
  suggestProFeature: (featureKey: FeatureKey) => void;

  refreshFromSupabase: () => Promise<boolean>;

  syncLocalToSupabase: () => Promise<{ success: boolean; message?: string }>;
  resetToDefaults: () => void;
}

const ScolyContext = createContext<ScolyContextType | undefined>(undefined);

export function ScolyProvider({ children }: { children: React.ReactNode }) {
  // Pure In-Memory React State backed exclusively by Supabase PostgreSQL
  const [school, setSchool] = useState<School>(INITIAL_SCHOOL);
  const [academicYear, setAcademicYear] = useState<AcademicYear>(INITIAL_ACADEMIC_YEAR);
  const [academicYearsList, setAcademicYearsList] = useState<AcademicYear[]>([INITIAL_ACADEMIC_YEAR]);
  const [classes, setClasses] = useState<SchoolClass[]>(INITIAL_CLASSES);
  const [tuitionPlans, setTuitionPlans] = useState<TuitionPlan[]>(INITIAL_TUITION_PLANS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [importBatches, setImportBatches] = useState<ImportBatchRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<ScolyNotification[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(getDefaultPaymentMethods());
  const [subscription, setSubscription] = useState<ScolySubscription>(() =>
    getDefaultTrialSubscription(INITIAL_SCHOOL.id)
  );
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | undefined>();
  const syncPromiseRef = useRef<Promise<{ success: boolean; school?: School; studentsCount?: number }> | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);
  const proFeatureSuggestionCooldownRef = useRef<Record<string, number>>({});

  // ─── 1. FETCH ALL DATA LIVE DIRECTLY FROM SUPABASE POSTGRESQL ───────────────
  const fetchAllFromSupabase = useCallback(
    async (targetSchoolId?: string, targetUserId?: string, targetEmail?: string): Promise<{ success: boolean; school?: School; studentsCount?: number }> => {
      if (!isSupabaseConfigured) {
        setSyncStatus("offline");
        setIsLoaded(true);
        return { success: false };
      }

      if (syncPromiseRef.current) {
        return syncPromiseRef.current;
      }

      setSyncStatus("syncing");

      const executeFetch = async (): Promise<{ success: boolean; school?: School; studentsCount?: number }> => {
        try {
          // 1. Direct Server Bootstrap API (Fetches all relations in parallel from PostgreSQL)
          const res = await fetch("/api/sync/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              school_id: targetSchoolId,
              user_id: targetUserId,
              email: targetEmail,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success && data.school) {
              setSchool(data.school);
              if (data.academicYear) {
                setAcademicYear(data.academicYear);
              }
              if (Array.isArray(data.academicYearsList) && data.academicYearsList.length > 0) {
                setAcademicYearsList(data.academicYearsList);
              }
              if (Array.isArray(data.classes)) {
                setClasses(data.classes);
              }
              if (Array.isArray(data.students)) {
                setStudents(data.students);
              }
              if (Array.isArray(data.payments)) {
                setPayments(data.payments);
              }
              if (Array.isArray(data.tuitionPlans)) {
                setTuitionPlans(data.tuitionPlans);
              }
              if (Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
                setPaymentMethods(data.paymentMethods);
              }
              if (Array.isArray(data.reminders)) {
                setReminders(data.reminders);
              }
              if (Array.isArray(data.importBatches)) {
                setImportBatches(data.importBatches);
              }
              if (Array.isArray(data.auditLogs)) {
                setAuditLogs(data.auditLogs);
              }
              if (Array.isArray(data.notifications)) {
                let localReadIds: string[] = [];
                if (typeof window !== "undefined" && data.school?.id) {
                  try {
                    const stored = localStorage.getItem(`scoly_read_notifs_${data.school.id}`);
                    if (stored) localReadIds = JSON.parse(stored);
                  } catch {}
                }
                const localReadSet = new Set(localReadIds);
                const mergedNotifs = data.notifications.map((n: any) => ({
                  ...n,
                  is_read: n.is_read || localReadSet.has(n.id) || (n.dedup_key && localReadSet.has(n.dedup_key)),
                }));
                setNotifications(mergedNotifs);
              }
              if (data.subscription) {
                setSubscription(data.subscription);
              } else if (data.school?.id) {
                setSubscription(getDefaultTrialSubscription(data.school.id, data.school?.created_at));
              }
              if (data.userRole) {
                setCurrentUser((prev) => (prev ? { ...prev, role: data.userRole } : null));
              }

              setSyncStatus("synced");
              setSyncErrorMessage(undefined);
              setIsLoaded(true);
              return {
                success: true,
                school: data.school,
                studentsCount: Array.isArray(data.students) ? data.students.length : 0,
              };
            }
          }

          // 2. Direct Browser Supabase client query fallback
          const sbSchool = await fetchSchool(targetSchoolId);
          if (sbSchool) {
            setSchool(sbSchool);
            const sbYear = await fetchAcademicYear(sbSchool.id);
            if (sbYear) {
              setAcademicYear(sbYear);
              const [sbYearsList, sbClasses, sbStudents, sbPayments, sbPlans, sbReminders, sbMethods, sbBatches, sbNotifications, sbSub] =
                await Promise.all([
                  fetchAcademicYearsList(sbSchool.id),
                  fetchClasses(sbSchool.id, sbYear.id),
                  fetchStudents(sbSchool.id, sbYear.id),
                  fetchPayments(sbSchool.id, sbYear.id),
                  fetchTuitionPlans(sbSchool.id, sbYear.id),
                  fetchReminders(sbSchool.id),
                  fetchPaymentMethodsDb(sbSchool.id),
                  fetchImportBatchesDb(sbSchool.id),
                  fetchNotificationsDb(sbSchool.id),
                  fetchSubscriptionDb(sbSchool.id),
                ]);

              if (sbYearsList.length > 0) setAcademicYearsList(sbYearsList);
              if (sbClasses.length > 0) setClasses(sbClasses);
              setStudents(sbStudents);
              setPayments(sbPayments);
              setTuitionPlans(sbPlans);
              if (sbMethods.length > 0) setPaymentMethods(sbMethods);
              setReminders(sbReminders);
              setImportBatches(sbBatches);

              let localReadIds: string[] = [];
              if (typeof window !== "undefined" && sbSchool.id) {
                try {
                  const stored = localStorage.getItem(`scoly_read_notifs_${sbSchool.id}`);
                  if (stored) localReadIds = JSON.parse(stored);
                } catch {}
              }
              const localReadSet = new Set(localReadIds);
              const mergedSbNotifs = sbNotifications.map((n: any) => ({
                ...n,
                is_read: n.is_read || localReadSet.has(n.id) || (n.dedup_key && localReadSet.has(n.dedup_key)),
              }));
              setNotifications(mergedSbNotifs);

              if (sbSub) {
                setSubscription(sbSub);
              } else {
                setSubscription(getDefaultTrialSubscription(sbSchool.id, sbSchool.created_at));
              }

              setSyncStatus("synced");
              setSyncErrorMessage(undefined);
              setIsLoaded(true);
              return { success: true, school: sbSchool, studentsCount: sbStudents.length };
            }
          }

          setSyncStatus("synced");
          setIsLoaded(true);
          return { success: false };
        } catch (err: any) {
          console.warn("[SCOLY] Supabase PostgreSQL sync error:", err);
          setSyncStatus("error");
          setSyncErrorMessage(err?.message || "Erreur de synchronisation Supabase");
          setIsLoaded(true);
          return { success: false };
        } finally {
          syncPromiseRef.current = null;
        }
      };

      const p = executeFetch();
      syncPromiseRef.current = p;
      return p;
    },
    []
  );

  // ─── 2. AUTH SESSION LISTENER (CROSS-DEVICE CLOUD HYDRATION) ────────────────
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoaded(true);
      return;
    }

    const client = getSupabaseBrowser();
    if (!client) {
      setIsLoaded(true);
      return;
    }

    let isMounted = true;
    let initialHandled = false;

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        const u: AuthUser = {
          id: session.user.id,
          email: session.user.email || "",
          full_name: session.user.user_metadata?.full_name,
          first_name: session.user.user_metadata?.first_name,
          last_name: session.user.user_metadata?.last_name,
          phone: session.user.user_metadata?.phone,
        };
        setCurrentUser(u);
        fetchAllFromSupabase(undefined, session.user.id, session.user.email || "");
        initialHandled = true;
      } else {
        setCurrentUser(null);
        if (!initialHandled) {
          setIsLoaded(true);
          initialHandled = true;
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchAllFromSupabase]);

  // ─── 3. AUTHENTICATION & REGISTRATION HANDLERS ────────────────────────────
  const loginUser = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string; school?: School }> => {
      const client = getSupabaseBrowser();
      if (!client) {
        return { success: false, error: "Client Supabase non initialisé." };
      }

      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !pass) {
        return { success: false, error: "Veuillez saisir votre email et votre mot de passe." };
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            return { success: false, error: "Adresse e-mail ou mot de passe incorrect." };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          const u: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            full_name: data.user.user_metadata?.full_name,
            first_name: data.user.user_metadata?.first_name,
            last_name: data.user.user_metadata?.last_name,
            phone: data.user.user_metadata?.phone,
          };
          setCurrentUser(u);

          // Force a fresh direct fetch from Supabase for this logged-in user and wait for it
          syncPromiseRef.current = null;
          const syncRes = await fetchAllFromSupabase(undefined, data.user.id, data.user.email || cleanEmail);
          return {
            success: true,
            school: syncRes?.school,
          };
        }
        return { success: false, error: "Connexion échouée." };
      } catch (err: any) {
        return { success: false, error: err?.message || "Erreur de connexion." };
      }
    },
    [fetchAllFromSupabase]
  );

  const registerUser = useCallback(
    async (
      emailOrParams:
        | string
        | {
            email: string;
            pass?: string;
            password?: string;
            firstName: string;
            lastName: string;
            phone?: string;
            schoolName?: string;
          },
      passParam?: string,
      schoolNameParam?: string,
      fullNameParam?: string
    ): Promise<{ success: boolean; error?: string }> => {
      let rawEmail = "";
      let pass = "";
      let firstName = "";
      let lastName = "";
      let phone = "";
      let schoolName = "";

      if (typeof emailOrParams === "object") {
        rawEmail = emailOrParams.email;
        pass = emailOrParams.pass || emailOrParams.password || "";
        firstName = emailOrParams.firstName;
        lastName = emailOrParams.lastName;
        phone = emailOrParams.phone || "";
        schoolName = emailOrParams.schoolName || `Établissement de ${firstName}`;
      } else {
        rawEmail = emailOrParams;
        pass = passParam || "";
        schoolName = schoolNameParam || "Mon Établissement Scolaire";
        const parts = (fullNameParam || "").split(" ");
        firstName = parts[0] || "";
        lastName = parts.slice(1).join(" ") || "";
      }

      const cleanEmail = rawEmail.trim().toLowerCase();
      if (!cleanEmail) {
        return { success: false, error: "Adresse email requise." };
      }
      if (!pass || pass.length < 6) {
        return { success: false, error: "Le mot de passe doit comporter au moins 6 caractères." };
      }

      const fullName = `${firstName} ${lastName}`.trim() || cleanEmail.split("@")[0];
      const client = getSupabaseBrowser();

      try {
        // 1. Create real auto-confirmed user directly via server API in Supabase Auth
        const apiRes = await fetch("/api/auth/register-school", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: cleanEmail,
            password: pass,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            school_name: schoolName || `Établissement de ${firstName}`,
          }),
        });

        const apiData = await apiRes.json().catch(() => ({}));

        // Strict verification: If the server API failed, try client fallback if service role key is missing on host
        if (!apiRes.ok || !apiData.success) {
          if (client && (apiData?.error?.includes("SUPABASE_SERVICE_ROLE_KEY") || apiRes.status === 500)) {
            const clientSignUp = await client.auth.signUp({
              email: cleanEmail,
              password: pass,
              options: {
                data: {
                  full_name: fullName,
                  first_name: firstName,
                  last_name: lastName,
                  phone: phone || null,
                  school_name: schoolName || `Établissement de ${firstName}`,
                },
              },
            });

            if (clientSignUp.error) {
              return { success: false, error: clientSignUp.error.message };
            }

            if (clientSignUp.data?.user) {
              const u: AuthUser = {
                id: clientSignUp.data.user.id,
                email: cleanEmail,
                full_name: fullName,
                first_name: firstName,
                last_name: lastName,
                phone: phone,
              };
              setCurrentUser(u);
              await fetchAllFromSupabase(undefined, clientSignUp.data.user.id, cleanEmail).catch(() => {});
              return { success: true };
            }
          }

          return {
            success: false,
            error: apiData?.error || "La création du compte a échoué sur le serveur.",
          };
        }

        // 2. Client instant sign-in using the verified credentials
        if (!client) {
          return { success: false, error: "Client Supabase non initialisé." };
        }

        const signInRes = await client.auth.signInWithPassword({
          email: cleanEmail,
          password: pass,
        });

        if (signInRes.error || !signInRes.data?.user) {
          return {
            success: false,
            error: signInRes.error?.message || "Compte créé avec succès, mais la connexion automatique a échoué. Veuillez vous connecter.",
          };
        }

        const u: AuthUser = {
          id: signInRes.data.user.id,
          email: signInRes.data.user.email || cleanEmail,
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        };
        setCurrentUser(u);
        await fetchAllFromSupabase(apiData.school_id, signInRes.data.user.id, cleanEmail).catch(() => {});
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err?.message || "Erreur lors de la création du compte." };
      }
    },
    [fetchAllFromSupabase]
  );

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseBrowser();
    if (!client) return { success: false, error: "Client Supabase non initialisé." };

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return { success: false, error: "Veuillez saisir votre adresse e-mail." };

    try {
      const { error } = await client.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Erreur lors de l'envoi." };
    }
  }, []);

  const saveOnboardingStep = useCallback(
    async (step: number, data?: Partial<School>) => {
      setSchool((prev) => ({
        ...prev,
        ...(data || {}),
        onboarding_current_step: step,
      }));

      if (isSupabaseConfigured) {
        const payloadToSave: Partial<School> = {
          ...(data || {}),
          id: school.id,
          onboarding_current_step: step,
        };
        upsertSchool(payloadToSave).catch((err) => {
          console.debug("[Onboarding] Autosave step error:", err);
        });
      }
    },
    [school.id]
  );

  const updateClasses = useCallback((newClasses: SchoolClass[]) => {
    setClasses(newClasses);
  }, []);

  const updateTuitionPlans = useCallback((newPlans: TuitionPlan[]) => {
    setTuitionPlans(newPlans);
  }, []);

  const completeOnboarding = useCallback(
    async (setupData?: {
      school?: School;
      academicYear?: AcademicYear;
      classes?: SchoolClass[];
      tuitionPlans?: TuitionPlan[];
    }) => {
      const finalSchool: School = {
        ...(setupData?.school || school),
        onboarding_completed: true,
        onboarding_current_step: 3,
      };
      setSchool(finalSchool);

      let finalYear = academicYear;
      if (setupData?.academicYear) {
        finalYear = { ...academicYear, ...setupData.academicYear };
        setAcademicYear(finalYear);
      }

      let finalClasses = classes;
      if (Array.isArray(setupData?.classes)) {
        finalClasses = setupData.classes;
        setClasses(finalClasses);
      }

      let finalPlans = tuitionPlans;
      if (Array.isArray(setupData?.tuitionPlans)) {
        finalPlans = setupData.tuitionPlans;
        setTuitionPlans(finalPlans);
      }

      // 1. Write updated state to Supabase PostgreSQL immediately
      setSyncStatus("syncing");
      try {
        const res = await fetch("/api/sync/save-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            school: finalSchool,
            academicYear: finalYear,
            classes: finalClasses,
            students,
            payments,
            tuitionPlans: finalPlans,
            paymentMethods,
            reminders,
            importBatches,
            notifications,
            user_id: currentUser?.id,
            email: currentUser?.email || finalSchool?.email,
          }),
        });

        if (res.ok) {
          setSyncStatus("synced");
          await fetchAllFromSupabase(finalSchool.id, currentUser?.id, currentUser?.email || finalSchool?.email);
        }
      } catch (err) {
        console.warn("[Onboarding] Sync error on completion:", err);
      }
    },
    [school, academicYear, classes, students, payments, tuitionPlans, paymentMethods, reminders, importBatches, notifications, currentUser, fetchAllFromSupabase]
  );

  const logoutUser = useCallback(async () => {
    const client = getSupabaseBrowser();
    if (client) {
      await client.auth.signOut().catch(() => {});
    }
    syncPromiseRef.current = null;
    setCurrentUser(null);
    setSchool(INITIAL_SCHOOL);
    setClasses(INITIAL_CLASSES);
    setTuitionPlans(INITIAL_TUITION_PLANS);
    setStudents([]);
    setPayments([]);
    setReminders([]);
    setImportBatches([]);
    setNotifications([]);
    setIsLoaded(true);
    setSyncStatus("synced");
  }, []);

  const refreshFromSupabase = useCallback(async (): Promise<boolean> => {
    syncPromiseRef.current = null;
    const res = await fetchAllFromSupabase(school.id, currentUser?.id, currentUser?.email);
    return res.success;
  }, [fetchAllFromSupabase, school.id, currentUser]);

  const syncLocalToSupabase = useCallback(async (): Promise<{ success: boolean; message?: string }> => {
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/sync/save-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school,
          academicYear,
          classes,
          students,
          payments,
          tuitionPlans,
          paymentMethods,
          reminders,
          importBatches,
          notifications,
          user_id: currentUser?.id,
          email: currentUser?.email || school?.email,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSyncStatus("synced");
        setSyncErrorMessage(undefined);
        return { success: true, message: data.message };
      } else {
        setSyncStatus("error");
        setSyncErrorMessage(data.error || "Erreur lors de l'enregistrement dans Supabase.");
        return { success: false, message: data.error };
      }
    } catch (err: any) {
      setSyncStatus("error");
      setSyncErrorMessage(err?.message || "Erreur de communication avec le serveur.");
      return { success: false, message: err?.message };
    }
  }, [
    school,
    academicYear,
    classes,
    students,
    payments,
    tuitionPlans,
    paymentMethods,
    reminders,
    importBatches,
    notifications,
    currentUser,
  ]);


  // ─── 4. FINANCIAL CALCULATORS ──────────────────────────────────────────────
  const getStudentFinancialSummary = useCallback(
    (studentId: string): StudentFinancialSummary => {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        return {
          student_id: studentId,
          gross_tuition: 0,
          discount_amount: 0,
          net_tuition: 0,
          total_due: 0,
          total_paid: 0,
          allocated_paid: 0,
          balance_due: 0,
          credit_amount: 0,
          has_advance: false,
          status: "up_to_date",
          days_late: 0,
        };
      }

      const plan = tuitionPlans.find((tp) => tp.class_id === student.class_id);
      const defaultTuition = plan ? plan.total_amount : 150000;
      const net_tuition =
        typeof student.custom_tuition === "number" && student.custom_tuition >= 0
          ? Math.round(student.custom_tuition)
          : student.discount_amount
          ? Math.max(0, Math.round(defaultTuition - student.discount_amount))
          : Math.round(defaultTuition);
      const gross_tuition = net_tuition;
      const discount_amount = student.discount_amount || 0;
      const total_due = net_tuition;

      // Active payments strictly from Supabase
      const studentPayments = payments.filter(
        (p) => p.student_id === studentId && p.status !== "cancelled"
      );
      const total_paid = studentPayments.reduce((sum, p) => sum + Math.round(p.amount), 0);

      const allocated_paid = Math.min(total_due, total_paid);
      const balance_due = Math.max(0, total_due - total_paid);
      const credit_amount = Math.max(0, total_paid - total_due);
      const has_advance = credit_amount > 0;

      let status: PaymentStatus = "up_to_date";
      let days_late = 0;
      let next_due_date: string | undefined;
      let next_due_amount: number | undefined;

      if (credit_amount > 0) {
        status = "credit";
      } else if (balance_due <= 0) {
        status = "up_to_date";
      } else if (plan && plan.installments && plan.installments.length > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let cumulativeTarget = 0;
        let cumulativePaid = total_paid;

        for (const inst of plan.installments) {
          cumulativeTarget += Math.round(inst.amount);
          const instDate = new Date(inst.due_date);
          instDate.setHours(0, 0, 0, 0);

          if (cumulativePaid < cumulativeTarget) {
            const diffTime = today.getTime() - instDate.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
              days_late = Math.max(days_late, diffDays);
              if (diffDays >= 15) {
                status = "critical";
              } else {
                status = "late";
              }
            } else if (diffDays >= -7 && diffDays <= 0) {
              if (status !== "critical" && status !== "late") {
                status = "upcoming";
              }
              next_due_date = inst.due_date;
              next_due_amount = Math.max(0, cumulativeTarget - cumulativePaid);
            }
          }
        }
      } else {
        status = balance_due > 0 ? "late" : "up_to_date";
      }

      return {
        student_id: studentId,
        gross_tuition,
        discount_amount,
        net_tuition,
        total_due,
        total_paid,
        allocated_paid,
        balance_due,
        credit_amount,
        has_advance,
        status,
        days_late,
        next_due_date,
        next_due_amount,
      };
    },
    [students, tuitionPlans, payments]
  );

  const dashboardMetrics = useMemo((): DashboardMetrics => {
    const todayStr = new Date().toISOString().split("T")[0];
    const activePayments = payments.filter((p) => p.status !== "cancelled");

    const collected_today = activePayments
      .filter((p) => p.payment_date === todayStr)
      .reduce((sum, p) => sum + Math.round(p.amount), 0);

    const collected_total = activePayments.reduce((sum, p) => sum + Math.round(p.amount), 0);

    let total_expected = 0;
    let total_remaining = 0;
    let total_credit = 0;
    let total_allocated_collected = 0;
    let upToDateCount = 0;
    let creditCount = 0;
    let upcomingCount = 0;
    let lateCount = 0;
    let criticalCount = 0;

    students.forEach((s) => {
      const summary = getStudentFinancialSummary(s.id);
      total_expected += summary.total_due;
      total_remaining += summary.balance_due;
      total_credit += summary.credit_amount;
      total_allocated_collected += summary.allocated_paid;

      switch (summary.status) {
        case "credit":
          creditCount++;
          upToDateCount++;
          break;
        case "up_to_date":
          upToDateCount++;
          break;
        case "upcoming":
          upcomingCount++;
          break;
        case "late":
          lateCount++;
          break;
        case "critical":
          criticalCount++;
          break;
      }
    });

    const recovery_rate =
      total_expected > 0
        ? Math.min(100, Math.round((total_allocated_collected / total_expected) * 1000) / 10)
        : 0;

    return {
      collected_today,
      collected_total,
      total_expected,
      total_remaining,
      total_credit,
      recovery_rate,
      students_count: students.length,
      students_up_to_date: upToDateCount,
      students_credit: creditCount,
      students_upcoming: upcomingCount,
      students_late: lateCount,
      students_critical: criticalCount,
      critical_alerts_count: criticalCount + upcomingCount,
    };
  }, [payments, students, getStudentFinancialSummary]);

  // ─── 4.1 NOTIFICATIONS SYSTEM (INTELLIGENT, RÉEL & CONTEXTUEL) ─────────────

  // Unread count calculated dynamically with role-based filtering
  const unreadNotificationsCount = useMemo(() => {
    const roleFiltered = filterNotificationsByRole(notifications, currentUser?.role);
    return roleFiltered.filter((n) => !n.is_read).length;
  }, [notifications, currentUser?.role]);

  // Realtime multi-device subscription (PC <-> Mobile instantaneous sync)
  useEffect(() => {
    if (!school.id) return;

    const unsubscribe = subscribeToSchoolNotifications(school.id, (event) => {
      if (event.type === "NEW_NOTIFICATION" && event.notification) {
        const newNotif = event.notification;
        setNotifications((prev) => {
          if (
            prev.some(
              (n) =>
                n.id === newNotif.id ||
                (newNotif.dedup_key && n.dedup_key === newNotif.dedup_key)
            )
          ) {
            return prev;
          }
          return [newNotif, ...prev];
        });
      } else if (event.type === "NOTIFICATION_READ" && event.notificationId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === event.notificationId
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        );
      } else if (event.type === "MARK_ALL_READ") {
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            is_read: true,
            read_at: new Date().toISOString(),
          }))
        );
      } else if (event.type === "NOTIFICATION_DELETED" && event.notificationId) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== event.notificationId)
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, [school.id]);

  // Proactive analysis of real school state (debts, upcoming, 0-data guidance, anti-spam)
  const triggerProactiveAnalysis = useCallback(() => {
    if (!school.id || !isLoaded) return;

    let localReadIds: string[] = [];
    if (typeof window !== "undefined" && school.id) {
      try {
        const stored = localStorage.getItem(`scoly_read_notifs_${school.id}`);
        if (stored) localReadIds = JSON.parse(stored);
      } catch {}
    }
    const localReadSet = new Set(localReadIds);

    const generated = analyzeSchoolState({
      school,
      students,
      payments,
      tuitionPlans,
      getStudentFinancialSummary,
      existingNotifications: notifications,
      userRole: currentUser?.role,
      subscription,
    });

    if (generated.length > 0) {
      setNotifications((prev) => {
        const existingIds = new Set(prev.map((n) => n.id));
        const existingDedups = new Set(
          prev.map((n) => n.dedup_key).filter(Boolean) as string[]
        );

        const toAdd = generated.filter(
          (n) =>
            !existingIds.has(n.id) &&
            (!n.dedup_key || !existingDedups.has(n.dedup_key)) &&
            !localReadSet.has(n.id) &&
            (!n.dedup_key || !localReadSet.has(n.dedup_key))
        );

        if (toAdd.length === 0) return prev;

        // Persist new proactive alerts to Supabase in background
        toAdd.forEach((notif) => {
          insertNotificationDb(notif, school.id).catch(() => {});
        });

        return [...toAdd, ...prev];
      });
    }
  }, [
    school,
    students,
    payments,
    tuitionPlans,
    getStudentFinancialSummary,
    notifications,
    currentUser?.role,
    subscription,
    isLoaded,
  ]);

  // Trigger proactive analysis safely with rate limiter
  useEffect(() => {
    if (isLoaded && school.id) {
      const now = Date.now();
      if (now - lastAnalysisTimeRef.current > 8000) {
        lastAnalysisTimeRef.current = now;
        triggerProactiveAnalysis();
      }
    }
  }, [isLoaded, school.id, students.length, payments.length, triggerProactiveAnalysis]);

  const addNotification = useCallback(
    async (notif: ScolyNotification) => {
      setNotifications((prev) => {
        if (
          prev.some(
            (n) =>
              n.id === notif.id ||
              (notif.dedup_key && n.dedup_key === notif.dedup_key)
          )
        ) {
          return prev;
        }
        return [notif, ...prev];
      });

      insertNotificationDb(notif, school.id).catch(() => {});

      broadcastNotificationEvent({
        type: "NEW_NOTIFICATION",
        notification: notif,
        schoolId: school.id,
        senderUserId: currentUser?.id,
      });
    },
    [school.id, currentUser?.id]
  );

  const markNotificationAsRead = useCallback(
    async (notificationId: string) => {
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: now } : n
        )
      );

      if (typeof window !== "undefined" && school.id) {
        try {
          const key = `scoly_read_notifs_${school.id}`;
          const existing: string[] = JSON.parse(localStorage.getItem(key) || "[]");
          if (!existing.includes(notificationId)) {
            existing.push(notificationId);
            localStorage.setItem(key, JSON.stringify(existing));
          }
        } catch {}
      }

      fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_READ", notification_id: notificationId, school_id: school.id }),
      }).catch(() => {});

      markNotificationAsReadDb(notificationId, currentUser?.id).catch(() => {});

      broadcastNotificationEvent({
        type: "NOTIFICATION_READ",
        notificationId,
        schoolId: school.id,
        senderUserId: currentUser?.id,
      });
    },
    [school.id, currentUser?.id]
  );

  const markAllNotificationsAsRead = useCallback(async () => {
    const now = new Date().toISOString();
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: now }))
    );

    if (typeof window !== "undefined" && school.id) {
      try {
        const key = `scoly_read_notifs_${school.id}`;
        const allIds = notifications.map((n) => n.id);
        const existing: string[] = JSON.parse(localStorage.getItem(key) || "[]");
        const merged = Array.from(new Set([...existing, ...allIds]));
        localStorage.setItem(key, JSON.stringify(merged));
      } catch {}
    }

    fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "MARK_ALL_READ", school_id: school.id }),
    }).catch(() => {});

    markAllNotificationsAsReadDb(school.id, currentUser?.id).catch(() => {});

    broadcastNotificationEvent({
      type: "MARK_ALL_READ",
      schoolId: school.id,
      senderUserId: currentUser?.id,
    });
  }, [school.id, currentUser?.id, notifications]);

  const deleteNotification = useCallback(
    async (notificationId: string) => {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      deleteNotificationDb(notificationId).catch(() => {});

      broadcastNotificationEvent({
        type: "NOTIFICATION_DELETED",
        notificationId,
        schoolId: school.id,
        senderUserId: currentUser?.id,
      });
    },
    [school.id, currentUser?.id]
  );

  // Action: Log Audit Event
  const logAudit = useCallback(
    (action: string, entityType: string, entityId: string, payload: any) => {
      const newLog: AuditLogRecord = {
        id: crypto.randomUUID(),
        school_id: school.id,
        user_id: currentUser?.id || "user-current",
        user_name: currentUser?.full_name || "Direction",
        action,
        entity_type: entityType,
        entity_id: entityId,
        payload,
        created_at: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [school.id, currentUser]
  );

  // ─── 5. DATA MUTATION ACTIONS (DIRECT POSTGRESQL TRANSACTIONS) ───────────────


  // Action: Add Payment
  const addPayment = useCallback(
    (params: {
      student_id: string;
      amount: number;
      payment_method: PaymentMethod;
      payment_date?: string;
      transaction_ref?: string;
      notes?: string;
      recorded_by_name?: string;
      idempotency_key?: string;
    }): Payment => {
      const numericAmount = Math.round(Number(params.amount));
      if (isNaN(numericAmount) || numericAmount <= 0) {
        throw new Error("Le montant du versement doit être strictement supérieur à 0 FCFA.");
      }

      if (params.idempotency_key) {
        const alreadyProcessed = payments.find(
          (p) => p.idempotency_key === params.idempotency_key && p.status !== "cancelled"
        );
        if (alreadyProcessed) {
          return alreadyProcessed;
        }
      }

      const student = students.find((s) => s.id === params.student_id);
      const summary = getStudentFinancialSummary(params.student_id);
      const previousBalance = summary.balance_due;

      if (previousBalance <= 0) {
        throw new Error(
          "La scolarité de cet élève est déjà intégralement soldée (0 FCFA restant dû). Aucun nouveau paiement ne peut être encaissé."
        );
      }

      if (numericAmount > previousBalance) {
        throw new Error(
          `Montant trop élevé : Le solde restant dû est de ${previousBalance.toLocaleString("fr-FR")} FCFA. Vous ne pouvez pas enregistrer plus que le montant restant.`
        );
      }

      const allocated_amount = numericAmount;
      const credit_amount = 0;
      const is_advance = false;

      const counter = (school.receipt_counter || 0) + 1;
      const formattedCounter = String(counter).padStart(5, "0");
      const receipt_number = `${school.receipt_prefix || "REC-25-"}${formattedCounter}`;

      const newPayment: Payment = {
        id: crypto.randomUUID(),
        school_id: school.id,
        student_id: params.student_id,
        student_name: student ? `${student.first_name} ${student.last_name}` : "Élève",
        matricule: student ? student.matricule : "—",
        class_name: student ? student.class_name : "—",
        academic_year_id: academicYear.id,
        amount: numericAmount,
        allocated_amount,
        credit_amount,
        is_advance,
        payment_date: params.payment_date || new Date().toISOString().split("T")[0],
        payment_method: params.payment_method,
        transaction_ref: params.transaction_ref ? params.transaction_ref.trim() : undefined,
        receipt_number,
        notes: params.notes ? params.notes.trim() : undefined,
        recorded_by_name: params.recorded_by_name || currentUser?.full_name || "Direction / Caisse",
        parent_name: student?.parent?.full_name,
        parent_phone: student?.parent?.phone_primary,
        status: "completed",
        idempotency_key: params.idempotency_key || `idemp-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        created_at: new Date().toISOString(),
      };

      // Optimistic update
      setPayments((prev) => [newPayment, ...prev]);
      setSchool((prev) => ({ ...prev, receipt_counter: counter }));

      // Direct write to Supabase PostgreSQL
      insertPaymentDb(newPayment, school.id, academicYear.id).then((res) => {
        if (res.success && res.data?.payment_id) {
          setPayments((prev) =>
            prev.map((p) =>
              p.id === newPayment.id
                ? {
                    ...p,
                    id: res.data.payment_id,
                    receipt_number: res.data.receipt_number || p.receipt_number,
                  }
                : p
            )
          );
        }
      }).catch((err) => {
        console.warn("[SCOLY] Supabase payment insert warning:", err);
      });

      logAudit("RECORD_PAYMENT", "payment", newPayment.id, {
        student_id: params.student_id,
        student_name: newPayment.student_name,
        amount: numericAmount,
        receipt_number,
      });

      // Generate intelligent notification
      const payNotif = createPaymentNotification({
        payment: newPayment,
        schoolId: school.id,
        studentName: newPayment.student_name,
        className: newPayment.class_name,
      });
      setNotifications((prev) => [payNotif, ...prev]);
      insertNotificationDb(payNotif, school.id).catch(() => {});
      broadcastNotificationEvent({
        type: "NEW_NOTIFICATION",
        notification: payNotif,
        schoolId: school.id,
        senderUserId: currentUser?.id,
      });

      return newPayment;
    },
    [students, school, academicYear, payments, getStudentFinancialSummary, currentUser, logAudit]
  );

  // Action: Cancel Payment
  const cancelPayment = useCallback(
    (paymentId: string, reason: string, cancelledByName?: string): boolean => {
      const cleanReason = String(reason || "").trim();
      if (!cleanReason) {
        throw new Error("Le motif d'annulation est obligatoire.");
      }

      const targetPayment = payments.find((p) => p.id === paymentId);
      if (!targetPayment) {
        throw new Error("Paiement introuvable.");
      }
      if (targetPayment.status === "cancelled") {
        return true;
      }

      const now = new Date().toISOString();
      const user = cancelledByName || currentUser?.full_name || "Direction / Caisse";

      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: "cancelled",
                cancelled_at: now,
                cancellation_reason: cleanReason,
                cancelled_by_name: user,
              }
            : p
        )
      );

      // Direct write to Supabase PostgreSQL
      cancelPaymentDb(paymentId, cleanReason, user).catch((err) => {
        console.warn("[SCOLY] Supabase cancel payment error:", err);
      });

      logAudit("CANCEL_PAYMENT", "payment", paymentId, {
        cancelled_receipt_number: targetPayment.receipt_number,
        reason: cleanReason,
      });

      // Generate cancel notification
      const cancelNotif = createPaymentCancelledNotification({
        payment: targetPayment,
        schoolId: school.id,
        reason: cleanReason,
        cancelledByName: user,
      });
      setNotifications((prev) => [cancelNotif, ...prev]);
      insertNotificationDb(cancelNotif, school.id).catch(() => {});
      broadcastNotificationEvent({
        type: "NEW_NOTIFICATION",
        notification: cancelNotif,
        schoolId: school.id,
        senderUserId: currentUser?.id,
      });

      return true;
    },
    [payments, school.id, currentUser, logAudit]
  );

  // Action: Add Student
  const addStudent = useCallback(
    (params: {
      first_name: string;
      last_name: string;
      gender: "M" | "F";
      birth_date?: string;
      class_id: string;
      class_name?: string;
      matricule?: string;
      discount_amount?: number;
      discount_reason?: string;
      custom_tuition?: number;
      parent_name: string;
      parent_relationship: "Père" | "Mère" | "Tuteur" | "Autre";
      parent_phone: string;
      parent_whatsapp?: string;
      parent_profession?: string;
      parent_address?: string;
    }): Student => {
      const targetClass = classes.find((c) => c.id === params.class_id);
      const className = params.class_name || (targetClass ? targetClass.name : "Non assigné");

      const countInClass = students.filter((s) => s.class_id === params.class_id).length + 1;
      const classCode = className.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const matricule =
        params.matricule || `2025-${classCode}-${String(countInClass).padStart(3, "0")}`;

      const studentId = crypto.randomUUID();
      const parentId = crypto.randomUUID();

      const newStudent: Student = {
        id: studentId,
        school_id: school.id,
        academic_year_id: academicYear.id,
        class_id: params.class_id,
        class_name: className,
        matricule,
        first_name: params.first_name,
        last_name: params.last_name,
        gender: params.gender,
        birth_date: params.birth_date,
        is_active: true,
        discount_amount: params.discount_amount || 0,
        discount_reason: params.discount_reason,
        custom_tuition: params.custom_tuition,
        parent: {
          id: parentId,
          school_id: school.id,
          full_name: params.parent_name,
          relationship: params.parent_relationship,
          phone_primary: params.parent_phone,
          phone_whatsapp: params.parent_whatsapp || params.parent_phone,
          profession: params.parent_profession,
          address: params.parent_address,
        },
        created_at: new Date().toISOString(),
      };

      setStudents((prev) => [newStudent, ...prev]);

      // Direct write to Supabase PostgreSQL
      insertStudentDb(newStudent, school.id, academicYear.id).catch((err) => {
        console.warn("[SCOLY] Supabase insert student error:", err);
      });

      // Generate student enrolled notification
      const studentNotif = createStudentEnrolledNotification({
        student: newStudent,
        schoolId: school.id,
      });
      setNotifications((prev) => [studentNotif, ...prev]);
      insertNotificationDb(studentNotif, school.id).catch(() => {});
      broadcastNotificationEvent({
        type: "NEW_NOTIFICATION",
        notification: studentNotif,
        schoolId: school.id,
        senderUserId: currentUser?.id,
      });

      return newStudent;
    },
    [classes, students, school, academicYear, currentUser]
  );


  // Action: Update Student
  const updateStudent = useCallback(
    (studentId: string, updates: Partial<Student>) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
      );

      // Direct write to Supabase PostgreSQL
      updateStudentDb(studentId, updates).catch((err) => {
        console.warn("[SCOLY] Supabase update student error:", err);
      });
    },
    []
  );

  // Action: Delete Student
  const deleteStudent = useCallback(
    (studentId: string) => {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      setPayments((prev) => prev.filter((p) => p.student_id !== studentId));
      setReminders((prev) => prev.filter((r) => r.student_id !== studentId));

      // Direct write to Supabase PostgreSQL
      deleteStudentDb(studentId).catch((err) => {
        console.warn("[SCOLY] Supabase delete student error:", err);
      });
    },
    []
  );

  // Action: Add Class
  const addClass = useCallback(
    (params: {
      name: string;
      level: string;
      series?: string;
      cycle_year?: string;
      branch?: string;
      description?: string;
      order_index?: number;
    }): SchoolClass => {
      const cleanName = params.name.trim();
      if (!cleanName) {
        throw new Error("Le nom de la classe est obligatoire.");
      }

      const existing = classes.find(
        (c) => c.name.toLowerCase().trim() === cleanName.toLowerCase()
      );
      if (existing) {
        throw new Error(`Une classe nommée "${cleanName}" existe déjà.`);
      }

      const newClass: SchoolClass = {
        id: crypto.randomUUID(),
        school_id: school.id,
        academic_year_id: academicYear.id,
        name: cleanName,
        level: params.level.trim() || "Général",
        series: params.series?.trim() || undefined,
        cycle_year: params.cycle_year?.trim() || undefined,
        branch: params.branch?.trim() || undefined,
        description: params.description?.trim() || undefined,
        order_index: params.order_index ?? classes.length + 1,
        is_custom: true,
      };

      setClasses((prev) => [...prev, newClass]);

      // Direct write to Supabase PostgreSQL
      upsertClassDb(newClass).catch((err) => {
        console.warn("[SCOLY] Supabase add class error:", err);
      });

      logAudit("ADD_CLASS", "class", newClass.id, {
        class_name: newClass.name,
        level: newClass.level,
      });

      return newClass;
    },
    [classes, school.id, academicYear.id, logAudit]
  );

  // Action: Update Class
  const updateClass = useCallback(
    (id: string, updates: Partial<SchoolClass>) => {
      const cleanName = updates.name ? updates.name.trim() : undefined;
      if (cleanName !== undefined && !cleanName) {
        throw new Error("Le nom de la classe ne peut pas être vide.");
      }

      if (cleanName) {
        const existing = classes.find(
          (c) => c.id !== id && c.name.toLowerCase().trim() === cleanName.toLowerCase()
        );
        if (existing) {
          throw new Error(`Une autre classe nommée "${cleanName}" existe déjà.`);
        }
      }

      setClasses((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                ...updates,
                ...(cleanName ? { name: cleanName } : {}),
              }
            : c
        )
      );

      if (cleanName) {
        setStudents((prev) =>
          prev.map((s) => (s.class_id === id ? { ...s, class_name: cleanName } : s))
        );
        setTuitionPlans((prev) =>
          prev.map((tp) => (tp.class_id === id ? { ...tp, class_name: cleanName } : tp))
        );
      }

      // Direct write to Supabase PostgreSQL
      upsertClassDb({ id, ...updates, ...(cleanName ? { name: cleanName } : {}) }).catch(
        (err) => {
          console.warn("[SCOLY] Supabase update class error:", err);
        }
      );

      logAudit("UPDATE_CLASS", "class", id, updates);
    },
    [classes, logAudit]
  );

  // Action: Delete Class
  const deleteClass = useCallback(
    (id: string): boolean => {
      const targetClass = classes.find((c) => c.id === id);
      if (!targetClass) {
        throw new Error("Classe introuvable.");
      }

      const attachedStudents = students.filter((s) => s.class_id === id);
      if (attachedStudents.length > 0) {
        throw new Error(
          `Impossible de supprimer la classe "${targetClass.name}" car ${attachedStudents.length} élève(s) y sont inscrit(s). Déplacez ou supprimez les élèves d'abord.`
        );
      }

      setClasses((prev) => prev.filter((c) => c.id !== id));
      setTuitionPlans((prev) => prev.filter((tp) => tp.class_id !== id));

      // Direct write to Supabase PostgreSQL
      deleteClassDb(id).catch((err) => {
        console.warn("[SCOLY] Supabase delete class error:", err);
      });

      logAudit("DELETE_CLASS", "class", id, {
        class_name: targetClass.name,
      });

      return true;
    },
    [classes, students, logAudit]
  );

  // Action: Update School Profile & Settings
  const updateSchool = useCallback(
    (updates: Partial<School>) => {
      setSchool((prev) => {
        const next = { ...prev, ...updates };
        // Direct write to Supabase PostgreSQL
        upsertSchool(next).catch((err) => {
          console.warn("[SCOLY] Supabase update school error:", err);
        });
        return next;
      });
    },
    []
  );

  // Action: Update Academic Year & Calendar
  const updateAcademicYear = useCallback(
    (updates: Partial<AcademicYear>) => {
      setAcademicYear((prev) => {
        const updated = { ...prev, ...updates };
        setAcademicYearsList((list) =>
          list.map((y) => (y.id === updated.id ? updated : y))
        );
        // Direct write to Supabase PostgreSQL
        upsertAcademicYearDb(updated).catch((err) => {
          console.warn("[SCOLY] Supabase update academic year error:", err);
        });
        return updated;
      });
      logAudit("UPDATE_ACADEMIC_YEAR", "academic_year", academicYear.id, updates);
    },
    [academicYear.id, logAudit]
  );

  // Action: Add / Switch Academic Year
  const addAcademicYear = useCallback(
    (newYear: AcademicYear) => {
      setAcademicYearsList((prev) => {
        const exists = prev.some((y) => y.id === newYear.id);
        if (exists) return prev.map((y) => (y.id === newYear.id ? newYear : y));
        return [...prev, newYear];
      });
      if (newYear.is_current) {
        setAcademicYear(newYear);
      }
      upsertAcademicYearDb(newYear).catch((err) => {
        console.warn("[SCOLY] Supabase add academic year error:", err);
      });
      logAudit("CREATE_ACADEMIC_YEAR", "academic_year", newYear.id, newYear);
    },
    [logAudit]
  );

  // Action: Update Tuition Plan
  const updateTuitionPlan = useCallback(
    (plan: TuitionPlan) => {
      const totalAmount = Math.round(Number(plan.total_amount) || 0);
      if (totalAmount <= 0) {
        throw new Error("Le montant total de la scolarité annuelle doit être supérieur à 0 FCFA.");
      }

      if (!plan.installments || plan.installments.length === 0) {
        throw new Error("Veuillez définir au moins une tranche d'échéance pour la grille tarifaire.");
      }

      let totalInstallments = 0;
      for (let i = 0; i < plan.installments.length; i++) {
        const inst = plan.installments[i];
        if (!inst.title || !inst.title.trim()) {
          throw new Error(`La tranche #${i + 1} doit posséder un libellé (ex: 1ère Tranche).`);
        }
        if (!inst.due_date || !inst.due_date.trim()) {
          throw new Error(`La tranche #${i + 1} (« ${inst.title.trim()} ») doit posséder une date d'échéance.`);
        }
        const instAmount = Number(inst.amount);
        if (isNaN(instAmount) || instAmount <= 0) {
          throw new Error(
            `Le montant de la tranche #${i + 1} (« ${inst.title.trim()} ») doit être supérieur à 0 FCFA.`
          );
        }
        totalInstallments += Math.round(instAmount);
      }

      if (totalInstallments > totalAmount) {
        const overflow = totalInstallments - totalAmount;
        throw new Error(
          `Le total des tranches (${totalInstallments.toLocaleString("fr-FR")} FCFA) dépasse la scolarité annuelle (${totalAmount.toLocaleString("fr-FR")} FCFA) de ${overflow.toLocaleString("fr-FR")} FCFA. Veuillez réduire le montant d'une ou plusieurs tranches.`
        );
      }

      const sanitizedPlan: TuitionPlan = {
        ...plan,
        total_amount: totalAmount,
        installments: plan.installments.map((inst, index) => ({
          ...inst,
          title: inst.title.trim(),
          amount: Math.round(Number(inst.amount)),
          installment_order: index + 1,
        })),
      };

      setTuitionPlans((prev) => {
        const idx = prev.findIndex((p) => p.id === sanitizedPlan.id || p.class_id === sanitizedPlan.class_id);
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = sanitizedPlan;
          return copy;
        }
        return [...prev, sanitizedPlan];
      });

      // Direct write to Supabase PostgreSQL
      saveTuitionPlanDb(sanitizedPlan, school.id, academicYear.id).catch((err) => {
        console.warn("[SCOLY] Supabase save tuition plan error:", err);
      });

      logAudit("SAVE_TUITION_PLAN", "tuition_plan", sanitizedPlan.id, {
        class_id: sanitizedPlan.class_id,
        total_amount: sanitizedPlan.total_amount,
      });
    },
    [school.id, academicYear.id, logAudit]
  );

  // Action: Delete Tuition Plan
  const deleteTuitionPlan = useCallback(
    (planIdOrClassId: string) => {
      setTuitionPlans((prev) =>
        prev.filter((p) => p.id !== planIdOrClassId && p.class_id !== planIdOrClassId)
      );

      deleteTuitionPlanDb(planIdOrClassId, school.id).catch((err) => {
        console.warn("[SCOLY] Supabase delete tuition plan error:", err);
      });
    },
    [school.id]
  );

  // Action: Invite Staff Member
  const inviteStaffMember = useCallback(
    (params: {
      full_name: string;
      email: string;
      phone: string;
      role: StaffRole;
      permissions: StaffPermission;
    }): StaffMember => {
      const newStaff: StaffMember = {
        id: crypto.randomUUID(),
        school_id: school.id,
        full_name: params.full_name,
        email: params.email,
        phone: params.phone,
        role: params.role,
        permissions: params.permissions,
        status: "actif",
        invited_at: new Date().toISOString(),
      };
      setStaffMembers((prev) => [...prev, newStaff]);
      return newStaff;
    },
    [school.id]
  );

  const updateStaffMember = useCallback((id: string, updates: Partial<StaffMember>) => {
    setStaffMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  const deleteStaffMember = useCallback((id: string) => {
    setStaffMembers((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Action: Record Sent Reminder
  const recordReminder = useCallback(
    (reminderData: Omit<Reminder, "id" | "sent_at">): Reminder => {
      const newReminder: Reminder = {
        ...reminderData,
        id: crypto.randomUUID(),
        sent_at: new Date().toISOString(),
      };
      setReminders((prev) => [newReminder, ...prev]);

      insertReminderDb(reminderData, school.id).catch((err) => {
        console.warn("[SCOLY] Supabase insert reminder error:", err);
      });

      return newReminder;
    },
    [school.id]
  );

  // Action: Global Search
  const searchGlobal = useCallback(
    (query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return { students: [], payments: [] };

      const matchedStudents = students
        .filter(
          (s) =>
            s.first_name.toLowerCase().includes(q) ||
            s.last_name.toLowerCase().includes(q) ||
            s.matricule.toLowerCase().includes(q) ||
            s.class_name?.toLowerCase().includes(q) ||
            s.parent?.full_name?.toLowerCase().includes(q) ||
            s.parent?.phone_primary?.includes(q)
        )
        .map((s) => ({
          ...s,
          balance_due: getStudentFinancialSummary(s.id).balance_due,
        }));

      const matchedPayments = payments.filter(
        (p) =>
          p.receipt_number.toLowerCase().includes(q) ||
          p.student_name.toLowerCase().includes(q) ||
          p.matricule.toLowerCase().includes(q) ||
          p.class_name?.toLowerCase().includes(q) ||
          (p.transaction_ref && p.transaction_ref.toLowerCase().includes(q))
      );

      return {
        students: matchedStudents.slice(0, 10),
        payments: matchedPayments.slice(0, 10),
      };
    },
    [students, payments, getStudentFinancialSummary]
  );

  const recordImportBatch = useCallback(
    (batch: ImportBatchRecord) => {
      setImportBatches((prev) => [batch, ...prev]);
      insertImportBatchDb(batch).catch(() => {});

      // Generate import completed notification
      const importNotif = createImportCompletedNotification({
        batch,
        schoolId: school.id,
      });
      setNotifications((prev) => [importNotif, ...prev]);
      insertNotificationDb(importNotif, school.id).catch(() => {});
      broadcastNotificationEvent({
        type: "NEW_NOTIFICATION",
        notification: importNotif,
        schoolId: school.id,
        senderUserId: currentUser?.id,
      });
    },
    [school.id, currentUser]
  );

  // ─── 6. PAYMENT METHODS CONFIG ─────────────────────────────
  const addPaymentMethod = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;
      const key = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "_");
      setPaymentMethods((prev) => {
        if (prev.some((m) => m.key === key)) return prev;
        const next = [...prev, { key, label: trimmed, is_active: true, order_index: prev.length }];
        savePaymentMethodsDb(school.id, next).catch(() => {});
        return next;
      });
    },
    [school.id]
  );

  const updatePaymentMethod = useCallback(
    (key: string, updates: Partial<PaymentMethodConfig>) => {
      setPaymentMethods((prev) => {
        const next = prev.map((m) => (m.key === key ? { ...m, ...updates } : m));
        savePaymentMethodsDb(school.id, next).catch(() => {});
        return next;
      });
    },
    [school.id]
  );

  const deletePaymentMethod = useCallback(
    (key: string) => {
      setPaymentMethods((prev) => {
        const next = prev.filter((m) => m.key !== key);
        savePaymentMethodsDb(school.id, next).catch(() => {});
        return next;
      });
    },
    [school.id]
  );

  const reorderPaymentMethods = useCallback(
    (methods: PaymentMethodConfig[]) => {
      const next = methods.map((m, i) => ({ ...m, order_index: i }));
      setPaymentMethods(next);
      savePaymentMethodsDb(school.id, next).catch(() => {});
    },
    [school.id]
  );

  // ─── 7. SUBSCRIPTION & FEATURE ACCESS ENGINE ─────────────────
  const hasFeature = useCallback(
    (feature: FeatureKey): boolean => {
      return canAccessFeature(subscription, feature).allowed;
    },
    [subscription]
  );

  const canAccess = useCallback(
    (feature: FeatureKey): FeatureAccessResult => {
      return canAccessFeature(subscription, feature);
    },
    [subscription]
  );

  const upgradeSubscription = useCallback(
    async (
      plan: SubscriptionPlan,
      billingPeriod: SubscriptionBillingPeriod,
      transactionRef?: string
    ): Promise<{ success: boolean; error?: string }> => {
      if (!school.id) return { success: false, error: "Établissement non sélectionné." };

      try {
        const res = await fetch("/api/subscription/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            school_id: school.id,
            plan,
            billing_period: billingPeriod,
            transaction_id: transactionRef,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          return { success: false, error: data.error || "Échec de l'activation." };
        }

        const updatedSub: ScolySubscription = data.subscription;
        setSubscription(updatedSub);

        const endDateFormatted = updatedSub.subscription_end_at
          ? new Date(updatedSub.subscription_end_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          : "1 an";

        const notif = createSubscriptionActivatedNotification({
          schoolId: school.id,
          plan,
          billingPeriod,
          formattedEndDate: endDateFormatted,
        });

        setNotifications((prev) => [notif, ...prev]);
        insertNotificationDb(notif, school.id).catch(() => {});
        broadcastNotificationEvent({
          type: "NEW_NOTIFICATION",
          notification: notif,
          schoolId: school.id,
          senderUserId: currentUser?.id,
        });

        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || "Erreur de connexion." };
      }
    },
    [school.id, currentUser]
  );

  const cancelCurrentSubscription = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    if (!school.id) return { success: false, error: "Établissement non sélectionné." };

    try {
      const now = new Date().toISOString();
      const updated = await upsertSubscriptionDb({
        school_id: school.id,
        status: "cancelled",
        cancelled_at: now,
      });

      if (updated) {
        setSubscription(updated);
        return { success: true };
      }
      return { success: false, error: "Erreur lors de la résiliation." };
    } catch (err: any) {
      return { success: false, error: err.message || "Erreur serveur." };
    }
  }, [school.id]);

  const suggestProFeature = useCallback(
    (featureKey: FeatureKey) => {
      if (!school.id) return;
      const def = FEATURE_DEFINITIONS[featureKey];
      if (!def) return;

      const now = Date.now();
      const lastSuggested = proFeatureSuggestionCooldownRef.current[featureKey] || 0;
      // Anti-spam cooldown: 24h
      if (now - lastSuggested < 24 * 60 * 60 * 1000) {
        return;
      }
      proFeatureSuggestionCooldownRef.current[featureKey] = now;

      const notif = createProFeatureSuggestionNotification({
        schoolId: school.id,
        featureTitle: def.title,
        featureKey,
      });

      setNotifications((prev) => {
        if (prev.some((n) => n.dedup_key === notif.dedup_key)) return prev;
        return [notif, ...prev];
      });

      insertNotificationDb(notif, school.id).catch(() => {});
    },
    [school.id]
  );

  const resetToDefaults = useCallback(() => {
    setSchool(INITIAL_SCHOOL);
    setClasses(INITIAL_CLASSES);
    setTuitionPlans(INITIAL_TUITION_PLANS);
    setStudents([]);
    setPayments([]);
    setReminders([]);
    setStaffMembers(DEFAULT_STAFF);
    setImportBatches([]);
    setAuditLogs([]);
    setNotifications([]);
    setPaymentMethods(getDefaultPaymentMethods());
    setSubscription(getDefaultTrialSubscription(INITIAL_SCHOOL.id));
    setCurrentUser(null);
  }, []);

  return (
    <ScolyContext.Provider
      value={{
        school,
        academicYear,
        academicYearsList,
        classes,
        tuitionPlans,
        students,
        payments,
        reminders,
        staffMembers,
        importBatches,
        notifications,
        unreadNotificationsCount,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        triggerProactiveAnalysis,
        subscription,
        hasFeature,
        canAccess,
        upgradeSubscription,
        cancelCurrentSubscription,
        suggestProFeature,
        isLoaded,
        isSupabaseConnected: isSupabaseConfigured,
        syncStatus,
        syncErrorMessage,
        currentUser,
        loginUser,
        registerUser,
        logoutUser,
        resetPassword,
        saveOnboardingStep,
        completeOnboarding,
        updateClasses,
        updateTuitionPlans,
        paymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
        reorderPaymentMethods,
        getStudentFinancialSummary,
        dashboardMetrics,
        addPayment,
        cancelPayment,
        addStudent,
        updateStudent,
        deleteStudent,
        addClass,
        updateClass,
        deleteClass,
        updateSchool,
        updateAcademicYear,
        addAcademicYear,
        updateTuitionPlan,
        deleteTuitionPlan,
        inviteStaffMember,
        updateStaffMember,
        deleteStaffMember,
        recordReminder,
        logAudit,
        recordImportBatch,
        searchGlobal,
        refreshFromSupabase,
        syncLocalToSupabase,
        resetToDefaults,
      }}
    >
      {children}
    </ScolyContext.Provider>
  );

}


export function useScoly() {
  const context = useContext(ScolyContext);
  if (!context) {
    throw new Error("useScoly must be used within a ScolyProvider");
  }
  return context;
}
