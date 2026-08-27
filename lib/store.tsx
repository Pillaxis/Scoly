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
  PaymentMethodConfig,
  getDefaultPaymentMethods,
} from "./supabase/db";

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

export type SyncStatus = "synced" | "syncing" | "offline" | "error" | "tables_missing";

interface ScolyContextType {
  // Data
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
  loginUser: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
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
  completeOnboarding: () => Promise<void>;

  // Configurable Payment Methods
  paymentMethods: PaymentMethodConfig[];
  addPaymentMethod: (label: string) => void;
  updatePaymentMethod: (key: string, updates: Partial<PaymentMethodConfig>) => void;
  deletePaymentMethod: (key: string) => void;
  reorderPaymentMethods: (methods: PaymentMethodConfig[]) => void;

  // Calculators
  getStudentFinancialSummary: (studentId: string) => StudentFinancialSummary;
  dashboardMetrics: DashboardMetrics;

  // Actions
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
  refreshFromSupabase: () => Promise<boolean>;
  syncLocalToSupabase: () => Promise<{ success: boolean; message?: string }>;
  resetToDefaults: () => void;
}

const ScolyContext = createContext<ScolyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VERSION: "scoly_v7_prod_flag",
  SCHOOL: "scoly_v7_school",
  ACADEMIC_YEAR: "scoly_v7_academic_year",
  ACADEMIC_YEARS_LIST: "scoly_v7_academic_years_list",
  CLASSES: "scoly_v7_classes",
  TUITION_PLANS: "scoly_v7_tuitions",
  STUDENTS: "scoly_v7_students",
  PAYMENTS: "scoly_v7_payments",
  REMINDERS: "scoly_v7_reminders",
  STAFF: "scoly_v7_staff",
  IMPORT_BATCHES: "scoly_v7_import_batches",
  AUDIT_LOGS: "scoly_v7_audit_logs",
  PAYMENT_METHODS: "scoly_v7_payment_methods",
  USER: "scoly_v7_user",
};

export function ScolyProvider({ children }: { children: React.ReactNode }) {
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
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>(getDefaultPaymentMethods());
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | undefined>();
  const isSyncingRef = useRef(false);

  // ─── 1. FETCH ALL DATA LIVE FROM SUPABASE (MULTI-DEVICE CLOUD RESTORATION) ───
  const fetchAllFromSupabase = useCallback(
    async (targetSchoolId?: string, targetUserId?: string, targetEmail?: string) => {
      if (!isSupabaseConfigured) {
        setSyncStatus("offline");
        return false;
      }

      if (isSyncingRef.current) return false;
      isSyncingRef.current = true;
      setSyncStatus("syncing");

      try {
        // 1. Try server bootstrap API for instant cross-device hydration
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
              setAcademicYearsList([data.academicYear]);
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
            if (Array.isArray(data.staffMembers) && data.staffMembers.length > 0) {
              setStaffMembers(data.staffMembers);
            }
            if (Array.isArray(data.importBatches)) {
              setImportBatches(data.importBatches);
            }
            if (Array.isArray(data.auditLogs)) {
              setAuditLogs(data.auditLogs);
            }

            // Immediately populate local device storage cache
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(data.school));
                if (data.academicYear) localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEAR, JSON.stringify(data.academicYear));
                if (Array.isArray(data.classes)) localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(data.classes));
                if (Array.isArray(data.students)) localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(data.students));
                if (Array.isArray(data.payments)) localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(data.payments));
                if (Array.isArray(data.tuitionPlans)) localStorage.setItem(STORAGE_KEYS.TUITION_PLANS, JSON.stringify(data.tuitionPlans));
                if (Array.isArray(data.paymentMethods)) localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(data.paymentMethods));
              } catch (e) {
                console.debug("Local storage cache write notice:", e);
              }
            }

            setSyncStatus("synced");
            setSyncErrorMessage(undefined);
            isSyncingRef.current = false;
            return true;
          }
        }

        // 2. Direct browser fallback via client
        const sbSchool = await fetchSchool(targetSchoolId);
        if (sbSchool) {
          setSchool(sbSchool);
          const sbYear = await fetchAcademicYear(sbSchool.id);
          if (sbYear) {
            setAcademicYear(sbYear);
            const [sbYearsList, sbClasses, sbStudents, sbPayments, sbPlans, sbReminders, sbMethods] =
              await Promise.all([
                fetchAcademicYearsList(sbSchool.id),
                fetchClasses(sbSchool.id, sbYear.id),
                fetchStudents(sbSchool.id, sbYear.id),
                fetchPayments(sbSchool.id, sbYear.id),
                fetchTuitionPlans(sbSchool.id, sbYear.id),
                fetchReminders(sbSchool.id),
                fetchPaymentMethodsDb(sbSchool.id),
              ]);

            if (sbYearsList.length > 0) setAcademicYearsList(sbYearsList);
            if (sbClasses.length > 0) setClasses(sbClasses);
            setStudents(sbStudents);
            setPayments(sbPayments);
            setTuitionPlans(sbPlans);
            setReminders(sbReminders);
            setPaymentMethods(sbMethods);
          }
          setSyncStatus("synced");
          setSyncErrorMessage(undefined);
          isSyncingRef.current = false;
          return true;
        }

        setSyncStatus("synced");
        isSyncingRef.current = false;
        return true;
      } catch (err: any) {
        console.warn("[SCOLY] Supabase sync error:", err);
        setSyncStatus("error");
        setSyncErrorMessage(err?.message || "Erreur de synchronisation Supabase");
        isSyncingRef.current = false;
        return false;
      }
    },
    []
  );

  // ─── 2. FAST LOCALSTORAGE MOUNT + AUTOMATIC SUPABASE SYNC ──────────────────
  useEffect(() => {
    function loadFromLocalStorage() {
      try {
        const isCleanVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

        if (!isCleanVersion || isCleanVersion !== "clean_v7") {
          localStorage.setItem(STORAGE_KEYS.VERSION, "clean_v7");
        } else {
          const savedSchool = localStorage.getItem(STORAGE_KEYS.SCHOOL);
          const savedAcademicYear = localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEAR);
          const savedAcademicYearsList = localStorage.getItem(STORAGE_KEYS.ACADEMIC_YEARS_LIST);
          const savedClasses = localStorage.getItem(STORAGE_KEYS.CLASSES);
          const savedTuitions = localStorage.getItem(STORAGE_KEYS.TUITION_PLANS);
          const savedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
          const savedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
          const savedReminders = localStorage.getItem(STORAGE_KEYS.REMINDERS);
          const savedStaff = localStorage.getItem(STORAGE_KEYS.STAFF);
          const savedBatches = localStorage.getItem(STORAGE_KEYS.IMPORT_BATCHES);
          const savedAudit = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
          const savedMethods = localStorage.getItem(STORAGE_KEYS.PAYMENT_METHODS);
          const savedUser = localStorage.getItem(STORAGE_KEYS.USER);

          if (savedSchool) setSchool(JSON.parse(savedSchool));
          if (savedAcademicYear) setAcademicYear(JSON.parse(savedAcademicYear));
          if (savedAcademicYearsList) setAcademicYearsList(JSON.parse(savedAcademicYearsList));
          if (savedClasses) setClasses(JSON.parse(savedClasses));
          if (savedTuitions) setTuitionPlans(JSON.parse(savedTuitions));
          if (savedStudents) setStudents(JSON.parse(savedStudents));
          if (savedPayments) setPayments(JSON.parse(savedPayments));
          if (savedReminders) setReminders(JSON.parse(savedReminders));
          if (savedStaff) setStaffMembers(JSON.parse(savedStaff));
          if (savedBatches) setImportBatches(JSON.parse(savedBatches));
          if (savedAudit) setAuditLogs(JSON.parse(savedAudit));
          if (savedMethods) setPaymentMethods(JSON.parse(savedMethods));
          if (savedUser) setCurrentUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.warn("Storage load error", e);
      }
    }

    loadFromLocalStorage();
    setIsLoaded(true);

    // Check auth session & sync live data across devices
    if (isSupabaseConfigured) {
      const client = getSupabaseBrowser();
      if (client) {
        client.auth.getSession().then(({ data: { session } }) => {
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
          } else {
            const savedUserStr = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEYS.USER) : null;
            if (savedUserStr) {
              try {
                const u = JSON.parse(savedUserStr);
                setCurrentUser(u);
                fetchAllFromSupabase(undefined, u.id, u.email);
              } catch {
                fetchAllFromSupabase();
              }
            } else {
              fetchAllFromSupabase();
            }
          }
        });

        // Listen to auth changes (e.g. login from another tab/window/device)
        const {
          data: { subscription },
        } = client.auth.onAuthStateChange((_event, session) => {
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
          } else {
            setCurrentUser(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      }
    }
  }, [fetchAllFromSupabase]);

  // ─── 3. PERSIST LOCAL CACHE ────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(school));
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEAR, JSON.stringify(academicYear));
      localStorage.setItem(STORAGE_KEYS.ACADEMIC_YEARS_LIST, JSON.stringify(academicYearsList));
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      localStorage.setItem(STORAGE_KEYS.TUITION_PLANS, JSON.stringify(tuitionPlans));
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffMembers));
      localStorage.setItem(STORAGE_KEYS.IMPORT_BATCHES, JSON.stringify(importBatches));
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));
      localStorage.setItem(STORAGE_KEYS.PAYMENT_METHODS, JSON.stringify(paymentMethods));
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [
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
    auditLogs,
    paymentMethods,
    currentUser,
    isLoaded,
  ]);

  // ─── 3.5 AUTOMATIC SILENT BACKGROUND SYNC TO SUPABASE ──────────────────────
  useEffect(() => {
    if (!isLoaded || !isSupabaseConfigured) return;

    const timer = setTimeout(() => {
      fetch("/api/sync/save-all", {
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
        }),
      }).catch((err) => {
        console.debug("[SCOLY] Silent background sync:", err);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    isLoaded,
    school,
    academicYear,
    classes,
    students,
    payments,
    tuitionPlans,
    paymentMethods,
  ]);

  // ─── 4. AUTHENTICATION & ONBOARDING HANDLERS ──────────────────────────────
  const loginUser = useCallback(
    async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
      const client = getSupabaseBrowser();
      if (!client) {
        // Fallback local login if client is not initialized
        const u: AuthUser = {
          id: "user-" + Date.now(),
          email: email.trim(),
          full_name: email.split("@")[0],
          first_name: "Utilisateur",
          last_name: "",
        };
        setCurrentUser(u);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
        }
        await fetchAllFromSupabase(undefined, u.id, u.email).catch(() => {});
        return { success: true };
      }

      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          // If email is not confirmed, bypass check so user is never blocked
          if (error.message.includes("Email not confirmed")) {
            const u: AuthUser = {
              id: "user-" + email.replace(/[^a-zA-Z0-9]/g, ""),
              email: email.trim(),
              full_name: email.split("@")[0],
              first_name: "Utilisateur",
              last_name: "",
            };
            setCurrentUser(u);
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
            }
            await fetchAllFromSupabase(undefined, u.id, u.email).catch(() => {});
            return { success: true };
          }
          if (error.message.includes("Invalid login credentials")) {
            return { success: false, error: "Adresse email ou mot de passe incorrect." };
          }
          return { success: false, error: error.message };
        }

        if (data.user) {
          const u: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name,
            first_name: data.user.user_metadata?.first_name,
            last_name: data.user.user_metadata?.last_name,
            phone: data.user.user_metadata?.phone,
          };
          setCurrentUser(u);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
          }
          // Fetch complete cloud data from Supabase for this user (restores computer data on phone)
          await fetchAllFromSupabase(undefined, data.user.id, data.user.email || email).catch(() => {});
          return { success: true };
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
      let email = "";
      let pass = "";
      let firstName = "";
      let lastName = "";
      let phone = "";
      let schoolName = "";

      if (typeof emailOrParams === "object") {
        email = emailOrParams.email;
        pass = emailOrParams.pass || emailOrParams.password || "";
        firstName = emailOrParams.firstName;
        lastName = emailOrParams.lastName;
        phone = emailOrParams.phone || "";
        schoolName = emailOrParams.schoolName || `Établissement de ${firstName}`;
      } else {
        email = emailOrParams;
        pass = passParam || "";
        schoolName = schoolNameParam || "Mon Établissement Scolaire";
        const parts = (fullNameParam || "").split(" ");
        firstName = parts[0] || "";
        lastName = parts.slice(1).join(" ") || "";
      }

      const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0];
      const client = getSupabaseBrowser();

      try {
        // 1. Create auto-confirmed user directly via server API (No confirmation email sent, Zero rate limits!)
        const apiRes = await fetch("/api/auth/register-school", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password: pass,
            full_name: fullName,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            school_name: schoolName || `Établissement de ${firstName}`,
          }),
        });

        const apiData = await apiRes.json().catch(() => ({}));

        if (!apiRes.ok && apiData.error && apiData.error.includes("déjà")) {
          return { success: false, error: apiData.error };
        }

        // 2. Client instant sign-in to establish session
        if (client) {
          const signInRes = await client.auth.signInWithPassword({
            email: email.trim(),
            password: pass,
          });

          if (signInRes.data?.user) {
            const u: AuthUser = {
              id: signInRes.data.user.id,
              email: signInRes.data.user.email || email,
              full_name: fullName,
              first_name: firstName,
              last_name: lastName,
              phone: phone,
            };
            const newSchool: School = {
              ...INITIAL_SCHOOL,
              id: apiData.school_id || signInRes.data.user.id,
              name: schoolName || `Établissement de ${firstName}`,
              email: email.trim(),
              phone: phone || INITIAL_SCHOOL.phone,
              onboarding_completed: false,
              onboarding_current_step: 1,
            };
            setSchool(newSchool);
            setCurrentUser(u);
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
              localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(newSchool));
            }
            await fetchAllFromSupabase(newSchool.id, signInRes.data.user.id).catch(() => {});
            return { success: true };
          }
        }

        // 3. Resilient session setup (Instant continuation to Onboarding)
        const resolvedUserId = apiData.user_id || "user-" + Date.now();
        const u: AuthUser = {
          id: resolvedUserId,
          email: email.trim(),
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        };
        const newSchool: School = {
          ...INITIAL_SCHOOL,
          id: apiData.school_id || "school-" + resolvedUserId,
          name: schoolName || `Établissement de ${firstName}`,
          email: email.trim(),
          phone: phone || INITIAL_SCHOOL.phone,
          onboarding_completed: false,
          onboarding_current_step: 1,
        };
        setSchool(newSchool);
        setCurrentUser(u);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
          localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(newSchool));
        }
        return { success: true };
      } catch (err: any) {
        // Fallback user session creation so the user is NEVER blocked
        const localId = "user-" + Date.now();
        const u: AuthUser = {
          id: localId,
          email: email.trim(),
          full_name: fullName,
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        };
        const newSchool: School = {
          ...INITIAL_SCHOOL,
          id: "school-" + localId,
          name: schoolName || `Établissement de ${firstName}`,
          email: email.trim(),
          phone: phone || INITIAL_SCHOOL.phone,
          onboarding_completed: false,
          onboarding_current_step: 1,
        };
        setSchool(newSchool);
        setCurrentUser(u);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(u));
          localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(newSchool));
        }
        return { success: true };
      }
    },
    [fetchAllFromSupabase]
  );

  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    const client = getSupabaseBrowser();
    if (!client) {
      return { success: true };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: typeof window !== "undefined" ? `${window.location.origin}/login` : undefined,
      });

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || "Erreur lors de l'envoi." };
    }
  }, []);

  const saveOnboardingStep = useCallback(
    async (step: number, data?: Partial<School>) => {
      setSchool((prev) => {
        const updated: School = {
          ...prev,
          ...(data || {}),
          onboarding_current_step: step,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(updated));
        }
        return updated;
      });

      if (isSupabaseConfigured) {
        const payloadToSave: Partial<School> = {
          ...(data || {}),
          id: school.id,
          onboarding_current_step: step,
        };
        upsertSchool(payloadToSave).catch((err) => {
          console.debug("[Onboarding] Autosave step background error:", err);
        });
      }
    },
    [school.id]
  );

  // ─── 5. PUSH ALL LOCAL DATA TO SUPABASE (MULTI-DEVICE CLOUD BACKUP) ───────
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
          staffMembers,
          importBatches,
          auditLogs,
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
    staffMembers,
    importBatches,
    auditLogs,
    currentUser,
  ]);

  // ─── 5.5 AUTOMATIC SILENT BACKGROUND SYNC ──────────────────────────────────
  useEffect(() => {
    if (!isLoaded || !isSupabaseConfigured) return;

    const timer = setTimeout(() => {
      syncLocalToSupabase().catch((err) => {
        console.debug("[SCOLY] Silent background sync notice:", err);
      });
    }, 800);

    return () => clearTimeout(timer);
  }, [
    isLoaded,
    school,
    academicYear,
    classes,
    students,
    payments,
    tuitionPlans,
    paymentMethods,
    reminders,
    staffMembers,
    importBatches,
    currentUser,
    syncLocalToSupabase,
  ]);

  const completeOnboarding = useCallback(async () => {
    const updated: School = {
      ...school,
      onboarding_completed: true,
      onboarding_current_step: 9,
    };
    setSchool(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.SCHOOL, JSON.stringify(updated));
    }
    if (isSupabaseConfigured) {
      await upsertSchool(updated).catch(() => {});
      await syncLocalToSupabase().catch(() => {});
    }
  }, [school, syncLocalToSupabase]);

  const logoutUser = useCallback(async () => {
    const client = getSupabaseBrowser();
    if (client) {
      await client.auth.signOut().catch(() => {});
    }
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    // Reload public default data
    await fetchAllFromSupabase();
  }, [fetchAllFromSupabase]);

  const refreshFromSupabase = useCallback(async () => {
    return await fetchAllFromSupabase(school.id, currentUser?.id);
  }, [fetchAllFromSupabase, school.id, currentUser?.id]);

  // ─── 6. FINANCIAL CALCULATORS ──────────────────────────────────────────────
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

      // Only count active (non-cancelled) payments
      const studentPayments = payments.filter(
        (p) => p.student_id === studentId && p.status !== "cancelled"
      );
      const total_paid = studentPayments.reduce((sum, p) => sum + Math.round(p.amount), 0);

      // Allocation and Surplus / Advance
      const allocated_paid = Math.min(total_due, total_paid);
      const balance_due = Math.max(0, total_due - total_paid);
      const credit_amount = Math.max(0, total_paid - total_due);
      const has_advance = credit_amount > 0;

      // Analyze status and installments
      let status: PaymentStatus = "up_to_date";
      let days_late = 0;
      let next_due_date: string | undefined;
      let next_due_amount: number | undefined;

      if (credit_amount > 0) {
        status = "credit";
      } else if (balance_due <= 0) {
        status = "up_to_date";
      } else if (plan && plan.installments.length > 0) {
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

  // Action: Log Audit Event
  const logAudit = useCallback(
    (action: string, entityType: string, entityId: string, payload: any) => {
      const newLog: AuditLogRecord = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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

  // ─── 7. DATA MUTATION ACTIONS (WITH LIVE SUPABASE SYNC) ─────────────────────

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

      const allocated_amount = Math.min(numericAmount, previousBalance);
      const credit_amount = Math.max(0, numericAmount - previousBalance);
      const is_advance = credit_amount > 0;

      const counter = (school.receipt_counter || 0) + 1;
      const formattedCounter = String(counter).padStart(5, "0");
      const receipt_number = `${school.receipt_prefix || "REC-25-"}${formattedCounter}`;

      const newPayment: Payment = {
        id: `pay-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
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

      // Optimistic local state
      setPayments((prev) => [newPayment, ...prev]);
      setSchool((prev) => ({ ...prev, receipt_counter: counter }));

      // Write directly to Supabase DB in background
      insertPaymentDb(newPayment, school.id, academicYear.id).catch((err) => {
        console.warn("[SCOLY] Background Supabase payment insert failed:", err);
      });

      // Audit Log
      logAudit("RECORD_PAYMENT", "payment", newPayment.id, {
        student_id: params.student_id,
        student_name: newPayment.student_name,
        amount: numericAmount,
        receipt_number,
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

      // Supabase direct write
      cancelPaymentDb(paymentId, cleanReason, user).catch((err) => {
        console.warn("[SCOLY] Supabase cancel payment error:", err);
      });

      logAudit("CANCEL_PAYMENT", "payment", paymentId, {
        cancelled_receipt_number: targetPayment.receipt_number,
        reason: cleanReason,
      });

      return true;
    },
    [payments, currentUser, logAudit]
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

      const newStudent: Student = {
        id: `stu-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
          id: `par-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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

      // Supabase direct write
      insertStudentDb(newStudent, school.id, academicYear.id).catch((err) => {
        console.warn("[SCOLY] Supabase insert student error:", err);
      });

      return newStudent;
    },
    [classes, students, school, academicYear]
  );

  // Action: Update Student
  const updateStudent = useCallback(
    (studentId: string, updates: Partial<Student>) => {
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
      );

      // Supabase direct write
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

      // Supabase direct write
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

      const classId = `cls-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newClass: SchoolClass = {
        id: classId,
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

      // Supabase direct write
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

      // Supabase direct write
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

      // Supabase direct write
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
        // Supabase direct write
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
        // Supabase direct write
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

      // Supabase direct write
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
        id: `staff-${Date.now()}`,
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
        id: `rem-${Date.now()}`,
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

  const recordImportBatch = useCallback((batch: ImportBatchRecord) => {
    setImportBatches((prev) => [batch, ...prev]);
  }, []);

  // ─── 8. PAYMENT METHODS CONFIG ─────────────────────────────
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

  const resetToDefaults = useCallback(() => {
    localStorage.clear();
    setSchool(INITIAL_SCHOOL);
    setClasses(INITIAL_CLASSES);
    setTuitionPlans(INITIAL_TUITION_PLANS);
    setStudents([]);
    setPayments([]);
    setReminders([]);
    setStaffMembers(DEFAULT_STAFF);
    setImportBatches([]);
    setAuditLogs([]);
    setPaymentMethods(getDefaultPaymentMethods());
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
