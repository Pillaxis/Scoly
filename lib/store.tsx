"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
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
  fetchSchool,
  fetchAcademicYear,
  fetchClasses,
  fetchStudents,
  fetchPayments,
  fetchTuitionPlans,
  fetchReminders,
  upsertSchool,
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

interface ScolyContextType {
  // Data
  school: School;
  academicYear: AcademicYear;
  classes: SchoolClass[];
  tuitionPlans: TuitionPlan[];
  students: Student[];
  payments: Payment[];
  reminders: Reminder[];
  staffMembers: StaffMember[];
  importBatches: ImportBatchRecord[];
  isLoaded: boolean;
  isSupabaseConnected: boolean;

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
  academicYearsList: AcademicYear[];
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
  resetToDefaults: () => void;
}

const ScolyContext = createContext<ScolyContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VERSION: "scoly_v6_clean_flag",
  SCHOOL: "scoly_v6_school",
  ACADEMIC_YEAR: "scoly_v6_academic_year",
  ACADEMIC_YEARS_LIST: "scoly_v6_academic_years_list",
  CLASSES: "scoly_v6_classes",
  TUITION_PLANS: "scoly_v6_tuitions",
  STUDENTS: "scoly_v6_students",
  PAYMENTS: "scoly_v6_payments",
  REMINDERS: "scoly_v6_reminders",
  STAFF: "scoly_v6_staff",
  IMPORT_BATCHES: "scoly_v6_import_batches",
  AUDIT_LOGS: "scoly_v6_audit_logs",
  PAYMENT_METHODS: "scoly_v6_payment_methods",
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
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage on mount & optionally from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        // --- SUPABASE HYBRID MODE ---
        if (isSupabaseConfigured) {
          console.log("[SCOLY] Supabase configured — loading from cloud...");
          try {
            const sbSchool = await fetchSchool();
            if (sbSchool) {
              setSchool(sbSchool);

              const sbYear = await fetchAcademicYear(sbSchool.id);
              if (sbYear) {
                setAcademicYear(sbYear);
                setAcademicYearsList([sbYear]);

                const [sbClasses, sbStudents, sbPayments, sbPlans, sbReminders] = await Promise.all([
                  fetchClasses(sbSchool.id, sbYear.id),
                  fetchStudents(sbSchool.id, sbYear.id),
                  fetchPayments(sbSchool.id, sbYear.id),
                  fetchTuitionPlans(sbSchool.id, sbYear.id),
                  fetchReminders(sbSchool.id),
                ]);

                if (sbClasses.length > 0) setClasses(sbClasses);
                if (sbStudents.length > 0) setStudents(sbStudents);
                if (sbPayments.length > 0) setPayments(sbPayments);
                if (sbPlans.length > 0) setTuitionPlans(sbPlans);
                if (sbReminders.length > 0) setReminders(sbReminders);
              }
            }
            console.log("[SCOLY] Supabase data loaded successfully.");
          } catch (sbErr) {
            console.warn("[SCOLY] Supabase load failed, falling back to localStorage", sbErr);
            loadFromLocalStorage();
          }
        } else {
          // --- LOCAL STORAGE MODE ---
          loadFromLocalStorage();
        }
      } catch (e) {
        console.warn("Storage load error, using clean defaults", e);
      } finally {
        setIsLoaded(true);
      }
    }

    function loadFromLocalStorage() {
      const isCleanVersion = localStorage.getItem(STORAGE_KEYS.VERSION);

      if (!isCleanVersion || isCleanVersion !== "clean_v6") {
        localStorage.clear();
        localStorage.setItem(STORAGE_KEYS.VERSION, "clean_v6");
        setSchool(INITIAL_SCHOOL);
        setClasses(INITIAL_CLASSES);
        setTuitionPlans([]);
        setStudents([]);
        setPayments([]);
        setReminders([]);
        setStaffMembers(DEFAULT_STAFF);
        setImportBatches([]);
        setAuditLogs([]);
        setPaymentMethods(getDefaultPaymentMethods());
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
      }
    }

    loadData();
  }, []);

  // Save changes to LocalStorage (always, as cache)
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
    } catch (e) {
      console.warn("Storage save error", e);
    }
  }, [school, academicYear, academicYearsList, classes, tuitionPlans, students, payments, reminders, staffMembers, importBatches, auditLogs, paymentMethods, isLoaded]);

  // Calculate detailed financial breakdown for any student
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
          : (student.discount_amount
              ? Math.max(0, Math.round(defaultTuition - student.discount_amount))
              : Math.round(defaultTuition));
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

  // Compute live Dashboard Metrics
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

    // Recovery rate based on allocated collection vs expected debt
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
        user_id: "user-current",
        user_name: "Direction",
        action,
        entity_type: entityType,
        entity_id: entityId,
        payload,
        created_at: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    },
    [school.id]
  );

  // Action: Add Payment (Atomic & Audited)
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

      // Check duplicate idempotency key if provided
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

      // Allocation calculation
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
        recorded_by_name: params.recorded_by_name || "Direction / Caisse",
        parent_name: student?.parent?.full_name,
        parent_phone: student?.parent?.phone_primary,
        status: "completed",
        idempotency_key: params.idempotency_key || `idemp-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`,
        created_at: new Date().toISOString(),
      };

      setPayments((prev) => [newPayment, ...prev]);
      setSchool((prev) => ({ ...prev, receipt_counter: counter }));

      // Audit Log
      logAudit("RECORD_PAYMENT", "payment", newPayment.id, {
        student_id: params.student_id,
        student_name: newPayment.student_name,
        matricule: newPayment.matricule,
        amount: numericAmount,
        allocated_amount,
        credit_amount,
        is_advance,
        previous_balance: previousBalance,
        new_balance: Math.max(0, previousBalance - numericAmount),
        payment_method: params.payment_method,
        transaction_ref: params.transaction_ref,
        receipt_number,
      });

      return newPayment;
    },
    [students, school, academicYear, payments, getStudentFinancialSummary, logAudit]
  );

  // Action: Cancel Payment (With mandatory reason & audit preservation)
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
        return true; // Already cancelled
      }

      const now = new Date().toISOString();
      const user = cancelledByName || "Direction / Caisse";

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

      // Audit log
      logAudit("CANCEL_PAYMENT", "payment", paymentId, {
        cancelled_receipt_number: targetPayment.receipt_number,
        student_id: targetPayment.student_id,
        student_name: targetPayment.student_name,
        cancelled_amount: targetPayment.amount,
        reason: cleanReason,
        cancelled_by: user,
        cancelled_at: now,
      });

      return true;
    },
    [payments, logAudit]
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

      // Auto generate matricule if not provided (e.g. 2025-6A-001)
      const countInClass = students.filter((s) => s.class_id === params.class_id).length + 1;
      const classCode = className.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      const matricule =
        params.matricule || `2025-${classCode}-${String(countInClass).padStart(3, "0")}`;

      const newStudent: Student = {
        id: `stu-${Date.now()}`,
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
          id: `par-${Date.now()}`,
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
      return newStudent;
    },
    [classes, students, school, academicYear]
  );

  // Action: Update Student
  const updateStudent = useCallback((studentId: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, ...updates } : s))
    );
  }, []);

  // Action: Delete Student & associated records
  const deleteStudent = useCallback((studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setPayments((prev) => prev.filter((p) => p.student_id !== studentId));
    setReminders((prev) => prev.filter((r) => r.student_id !== studentId));
  }, []);

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

      // Check if a class with the exact same name exists
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

      // If class name changed, update students & tuition plans
      if (cleanName) {
        setStudents((prev) =>
          prev.map((s) => (s.class_id === id ? { ...s, class_name: cleanName } : s))
        );
        setTuitionPlans((prev) =>
          prev.map((tp) => (tp.class_id === id ? { ...tp, class_name: cleanName } : tp))
        );
      }

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

      logAudit("DELETE_CLASS", "class", id, {
        class_name: targetClass.name,
      });

      return true;
    },
    [classes, students, logAudit]
  );

  // Action: Update School Profile & Settings
  const updateSchool = useCallback((updates: Partial<School>) => {
    setSchool((prev) => ({ ...prev, ...updates }));
  }, []);

  // Action: Update Academic Year & Calendar (Personnalisable)
  const updateAcademicYear = useCallback(
    (updates: Partial<AcademicYear>) => {
      setAcademicYear((prev) => {
        const updated = { ...prev, ...updates };
        setAcademicYearsList((list) =>
          list.map((y) => (y.id === updated.id ? updated : y))
        );
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
      logAudit("CREATE_ACADEMIC_YEAR", "academic_year", newYear.id, newYear);
    },
    [logAudit]
  );

  // Action: Update Tuition Plan (avec validation métier stricte et anti-dépassement)
  const updateTuitionPlan = useCallback(
    (plan: TuitionPlan) => {
      // 1. Validation du montant global annuel
      const totalAmount = Math.round(Number(plan.total_amount) || 0);
      if (totalAmount <= 0) {
        throw new Error("Le montant total de la scolarité annuelle doit être supérieur à 0 FCFA.");
      }

      // 2. Validation de la présence d'au moins une tranche
      if (!plan.installments || plan.installments.length === 0) {
        throw new Error("Veuillez définir au moins une tranche d'échéance pour la grille tarifaire.");
      }

      // 3. Validation détaillée de chaque tranche
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

      // 4. Règle financière absolue : Le total des tranches ne doit JAMAIS dépasser la scolarité annuelle
      if (totalInstallments > totalAmount) {
        const overflow = totalInstallments - totalAmount;
        throw new Error(
          `Le total des tranches (${totalInstallments.toLocaleString("fr-FR")} FCFA) dépasse la scolarité annuelle (${totalAmount.toLocaleString("fr-FR")} FCFA) de ${overflow.toLocaleString("fr-FR")} FCFA. Veuillez réduire le montant d'une ou plusieurs tranches.`
        );
      }

      // 5. Nettoyage et normalisation du plan
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

      logAudit("SAVE_TUITION_PLAN", "tuition_plan", sanitizedPlan.id, {
        class_id: sanitizedPlan.class_id,
        class_name: sanitizedPlan.class_name,
        total_amount: sanitizedPlan.total_amount,
        installments_count: sanitizedPlan.installments.length,
        total_installments: totalInstallments,
        remaining_amount: totalAmount - totalInstallments,
      });
    },
    [logAudit]
  );

  // Action: Delete Tuition Plan
  const deleteTuitionPlan = useCallback((planIdOrClassId: string) => {
    setTuitionPlans((prev) =>
      prev.filter((p) => p.id !== planIdOrClassId && p.class_id !== planIdOrClassId)
    );
  }, []);

  // Action: Invite / Add Staff Member
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

  // Action: Update Staff Member
  const updateStaffMember = useCallback((id: string, updates: Partial<StaffMember>) => {
    setStaffMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );
  }, []);

  // Action: Delete Staff Member
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
      return newReminder;
    },
    []
  );

  // Action: Global Search (Cmd+K)
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

  // Action: Record Import Batch
  const recordImportBatch = useCallback((batch: ImportBatchRecord) => {
    setImportBatches((prev) => [batch, ...prev]);
  }, []);

  // ─── CONFIGURABLE PAYMENT METHODS ──────────────────────
  const addPaymentMethod = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    setPaymentMethods((prev) => {
      if (prev.some((m) => m.key === key)) return prev;
      return [...prev, { key, label: trimmed, is_active: true, order_index: prev.length }];
    });
  }, []);

  const updatePaymentMethod = useCallback((key: string, updates: Partial<PaymentMethodConfig>) => {
    setPaymentMethods((prev) =>
      prev.map((m) => (m.key === key ? { ...m, ...updates } : m))
    );
  }, []);

  const deletePaymentMethod = useCallback((key: string) => {
    setPaymentMethods((prev) => prev.filter((m) => m.key !== key));
  }, []);

  const reorderPaymentMethods = useCallback((methods: PaymentMethodConfig[]) => {
    setPaymentMethods(methods.map((m, i) => ({ ...m, order_index: i })));
  }, []);

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
