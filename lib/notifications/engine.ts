import { School, Student, Payment, StaffMember } from "@/types/scoly";
import { ImportBatchRecord } from "@/types/import";
import { ScolyNotification } from "@/types/notifications";
import { formatFCFA } from "@/lib/utils";

/**
 * Génère une notification lors de l'enregistrement confirmé d'un paiement
 */
export function createPaymentNotification(params: {
  payment: Payment;
  schoolId: string;
  studentName?: string;
  className?: string;
}): ScolyNotification {
  const { payment, schoolId, studentName, className } = params;
  const name = studentName || payment.student_name || "Élève";
  const formattedAmount = formatFCFA(payment.amount);
  const methodUpper = (payment.payment_method || "Espèces").toUpperCase();

  return {
    id: `notif-pay-${payment.id}`,
    school_id: schoolId,
    type: "payment_recorded",
    priority: "success",
    title: "Paiement enregistré",
    message: `${name} — ${formattedAmount} (${methodUpper})`,
    action_url: `/payments`,
    action_label: "Voir le reçu",
    entity_type: "payment",
    entity_id: payment.id,
    metadata: {
      payment_id: payment.id,
      amount: payment.amount,
      receipt_number: payment.receipt_number,
      student_name: name,
      class_name: className || payment.class_name,
    },
    is_read: false,
    target_roles: ["owner", "director", "accountant"],
    created_at: new Date().toISOString(),
  };
}

/**
 * Génère une notification lors de l'annulation d'un paiement
 */
export function createPaymentCancelledNotification(params: {
  payment: Payment;
  schoolId: string;
  reason: string;
  cancelledByName?: string;
}): ScolyNotification {
  const { payment, schoolId, reason, cancelledByName } = params;
  const name = payment.student_name || "Élève";
  const formattedAmount = formatFCFA(payment.amount);

  return {
    id: `notif-cancel-${payment.id}-${Date.now()}`,
    school_id: schoolId,
    type: "payment_cancelled",
    priority: "warning",
    title: "Paiement annulé",
    message: `Reçu ${payment.receipt_number} de ${name} (${formattedAmount}) annulé. Motif: ${reason}`,
    action_url: "/payments",
    action_label: "Voir le journal",
    entity_type: "payment",
    entity_id: payment.id,
    metadata: {
      payment_id: payment.id,
      receipt_number: payment.receipt_number,
      reason,
      cancelled_by: cancelledByName,
    },
    is_read: false,
    target_roles: ["owner", "director", "accountant"],
    created_at: new Date().toISOString(),
  };
}

/**
 * Génère une notification lors de la finalisation d'un lot d'importation
 */
export function createImportCompletedNotification(params: {
  batch: ImportBatchRecord;
  schoolId: string;
}): ScolyNotification {
  const { batch, schoolId } = params;
  const hasErrors = (batch.errors_count || 0) > 0 || (batch.duplicates_count || 0) > 0;
  const count = batch.imported_students_count || batch.total_rows || 0;

  let title = "Import terminé";
  let message = `${count} élève(s) ont été importés avec succès.`;
  let priority: "success" | "warning" = "success";

  if (hasErrors) {
    title = "Import terminé avec attention";
    priority = "warning";
    const issues = (batch.errors_count || 0) + (batch.duplicates_count || 0);
    message = `${count} élèves importés, ${issues} ligne(s) nécessitent une vérification.`;
  }

  return {
    id: `notif-import-${batch.id}`,
    school_id: schoolId,
    type: hasErrors ? "import_warning" : "import_completed",
    priority,
    title,
    message,
    action_url: "/students",
    action_label: "Voir les élèves",
    entity_type: "import_batch",
    entity_id: batch.id,
    metadata: {
      batch_id: batch.id,
      total_rows: batch.total_rows,
      imported_students: batch.imported_students_count,
      errors_count: batch.errors_count,
    },
    is_read: false,
    target_roles: ["owner", "director", "secretary", "accountant"],
    created_at: new Date().toISOString(),
  };
}

/**
 * Génère une notification lors de l'inscription d'un nouvel élève
 */
export function createStudentEnrolledNotification(params: {
  student: Student;
  schoolId: string;
}): ScolyNotification {
  const { student, schoolId } = params;

  return {
    id: `notif-student-${student.id}`,
    school_id: schoolId,
    type: "student_enrolled",
    priority: "info",
    title: "Nouvel élève inscrit",
    message: `${student.first_name} ${student.last_name} (${student.class_name || "Classe"}) — Matricule ${student.matricule}`,
    action_url: "/students",
    action_label: "Voir la fiche",
    entity_type: "student",
    entity_id: student.id,
    metadata: {
      student_id: student.id,
      matricule: student.matricule,
      class_name: student.class_name,
    },
    is_read: false,
    target_roles: ["owner", "director", "secretary"],
    created_at: new Date().toISOString(),
  };
}

/**
 * Génère une notification lors d'une erreur d'enregistrement critique
 */
export function createOperationErrorNotification(params: {
  actionName: string;
  errorMessage: string;
  schoolId: string;
}): ScolyNotification {
  const { actionName, errorMessage, schoolId } = params;

  return {
    id: `notif-err-${Date.now()}`,
    school_id: schoolId,
    type: "system_error",
    priority: "critical",
    title: "Impossible d'enregistrer",
    message: `L'opération « ${actionName} » a échoué. ${errorMessage}`,
    action_url: undefined,
    action_label: undefined,
    entity_type: "system",
    metadata: {
      action: actionName,
      error: errorMessage,
    },
    is_read: false,
    target_roles: ["owner", "director", "accountant", "secretary"],
    created_at: new Date().toISOString(),
  };
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NOTIFICATIONS D'ABONNEMENT ET D'ESSAI
 * ─────────────────────────────────────────────────────────────────────────────
 */

export function createTrialStartedNotification(params: {
  schoolId: string;
}): ScolyNotification {
  return {
    id: `notif-trial-start-${params.schoolId}`,
    school_id: params.schoolId,
    type: "system_info",
    priority: "info",
    title: "Bienvenue sur SCOLY 👋",
    message: "Votre essai gratuit de 15 jours commence aujourd'hui. Profitez de toutes les fonctionnalités PRO.",
    action_url: "/subscription",
    action_label: "Voir mon essai",
    entity_type: "subscription",
    metadata: { days_remaining: 15 },
    is_read: false,
    target_roles: ["owner", "director"],
    dedup_key: `trial_start_${params.schoolId}`,
    created_at: new Date().toISOString(),
  };
}

export function createTrialExpiringNotification(params: {
  schoolId: string;
  daysRemaining: number;
}): ScolyNotification {
  const { schoolId, daysRemaining } = params;
  let title = "Votre essai SCOLY se poursuit";
  let message = `Il vous reste ${daysRemaining} jours pour découvrir SCOLY.`;
  let priority: "info" | "warning" = "info";

  if (daysRemaining <= 1) {
    title = "Votre essai se termine demain";
    message = "Choisissez votre forfait pour continuer à utiliser SCOLY sans interruption.";
    priority = "warning";
  } else if (daysRemaining <= 3) {
    title = "Votre essai arrive bientôt à son terme";
    message = `Il vous reste ${daysRemaining} jours. Choisissez votre forfait START ou PRO.`;
    priority = "warning";
  }

  return {
    id: `notif-trial-exp-${schoolId}-${daysRemaining}`,
    school_id: schoolId,
    type: "system_warning",
    priority,
    title,
    message,
    action_url: "/subscription",
    action_label: "Choisir un forfait",
    entity_type: "subscription",
    metadata: { days_remaining: daysRemaining },
    is_read: false,
    target_roles: ["owner", "director"],
    dedup_key: `trial_remind_${daysRemaining}d_${schoolId}`,
    created_at: new Date().toISOString(),
  };
}

export function createTrialExpiredNotification(params: {
  schoolId: string;
}): ScolyNotification {
  return {
    id: `notif-trial-expired-${params.schoolId}`,
    school_id: params.schoolId,
    type: "system_warning",
    priority: "warning",
    title: "Votre période d'essai est terminée",
    message: "Toutes vos données sont conservées. Choisissez un forfait START ou PRO pour continuer.",
    action_url: "/subscription",
    action_label: "Choisir un forfait",
    entity_type: "subscription",
    is_read: false,
    target_roles: ["owner", "director"],
    dedup_key: `trial_expired_${params.schoolId}`,
    created_at: new Date().toISOString(),
  };
}

export function createSubscriptionActivatedNotification(params: {
  schoolId: string;
  plan: "start" | "pro" | "premium" | string;
  billingPeriod: "monthly" | "yearly";
  formattedEndDate: string;
}): ScolyNotification {
  const { schoolId, plan, billingPeriod, formattedEndDate } = params;
  const planLabel = plan === "premium" ? "SCOLY PREMIUM" : plan === "pro" ? "SCOLY PRO" : "SCOLY START";
  const periodLabel = billingPeriod === "yearly" ? "annuel" : "mensuel";

  return {
    id: `notif-sub-active-${Date.now()}`,
    school_id: schoolId,
    type: "system_info",
    priority: "success",
    title: `Votre abonnement ${planLabel} est actif !`,
    message: `Formule ${periodLabel} activée avec succès. Vous êtes couvert jusqu'au ${formattedEndDate}.`,
    action_url: "/subscription",
    action_label: "Mon abonnement",
    entity_type: "subscription",
    metadata: { plan, billing_period: billingPeriod, end_date: formattedEndDate },
    is_read: false,
    target_roles: ["owner", "director"],
    created_at: new Date().toISOString(),
  };
}

export function createProFeatureSuggestionNotification(params: {
  schoolId: string;
  featureTitle: string;
  featureKey: string;
}): ScolyNotification {
  return {
    id: `notif-pro-sugg-${params.featureKey}-${Date.now()}`,
    school_id: params.schoolId,
    type: "system_info",
    priority: "info",
    title: `Disponible avec SCOLY PRO`,
    message: `La fonctionnalité « ${params.featureTitle} » est accessible avec la formule PRO.`,
    action_url: "/subscription",
    action_label: "Découvrir PRO",
    entity_type: "subscription",
    metadata: { feature_key: params.featureKey },
    is_read: false,
    target_roles: ["owner", "director"],
    dedup_key: `pro_sugg_${params.featureKey}_${new Date().toISOString().split("T")[0]}`,
    created_at: new Date().toISOString(),
  };
}

