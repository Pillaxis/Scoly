import {
  School,
  Student,
  Payment,
  TuitionPlan,
  StudentFinancialSummary,
  ScolySubscription,
} from "@/types/scoly";
import { ScolyNotification, NotificationPriority } from "@/types/notifications";
import { formatFCFA } from "@/lib/utils";

export interface AnalysisContext {
  school: School;
  students: Student[];
  payments: Payment[];
  tuitionPlans: TuitionPlan[];
  getStudentFinancialSummary: (studentId: string) => StudentFinancialSummary;
  existingNotifications: ScolyNotification[];
  userRole?: string;
  subscription?: ScolySubscription | null;
}


/**
 * Normalise les dénominations de rôles (FR <-> EN)
 */
export function normalizeRole(role?: string): "owner" | "director" | "accountant" | "secretary" {
  if (!role) return "director";
  const r = role.toLowerCase().trim();
  if (r === "owner" || r === "proprietaire" || r === "fondateur") return "owner";
  if (r === "director" || r === "directeur" || r === "direction" || r === "admin") return "director";
  if (r === "accountant" || r === "comptable" || r === "caisse") return "accountant";
  if (r === "secretary" || r === "secretaire" || r === "administratif") return "secretary";
  return "director";
}

/**
 * Filtre les notifications en fonction du rôle de l'utilisateur connecté
 */
export function filterNotificationsByRole(
  notifications: ScolyNotification[],
  rawRole?: string
): ScolyNotification[] {
  const role = normalizeRole(rawRole);

  return notifications.filter((notif) => {
    // Si aucun rôle spécifique n'est ciblé ou tableau vide -> visible par tous
    if (!notif.target_roles || notif.target_roles.length === 0) {
      return true;
    }

    const normalizedTargets = notif.target_roles.map((r) => normalizeRole(r));
    return normalizedTargets.includes(role);
  });
}

/**
 * Analyse dynamique des données réelles de l'école pour générer des notifications proactives,
 * dédupliquées et anti-spam.
 */
export function analyzeSchoolState(ctx: AnalysisContext): ScolyNotification[] {
  const {
    school,
    students,
    payments,
    getStudentFinancialSummary,
    existingNotifications,
  } = ctx;

  const newNotifications: ScolyNotification[] = [];
  const todayStr = new Date().toISOString().split("T")[0];
  const existingKeys = new Set(
    existingNotifications
      .map((n) => n.dedup_key)
      .filter(Boolean) as string[]
  );

  const activePayments = payments.filter((p) => p.status !== "cancelled");

  // ──────────────────────────────────────────────────────────────────────────
  // 1. ACCOMPAGNEMENT BIENVEILLANT DES COMPTES SANS DONNÉES (0 spam, 0 culpabilité)
  // ──────────────────────────────────────────────────────────────────────────
  if (students.length === 0) {
    // A. Message de Bienvenue
    const welcomeKey = `welcome_${school.id}`;
    if (!existingKeys.has(welcomeKey)) {
      newNotifications.push({
        id: `notif-welcome-${school.id}`,
        school_id: school.id,
        type: "onboarding_welcome",
        priority: "info",
        title: "Bienvenue sur SCOLY 👋",
        message: "Votre espace est prêt. Ajoutez vos premiers élèves pour commencer à suivre votre école.",
        action_url: "/students",
        action_label: "Ajouter un élève",
        entity_type: "system",
        is_read: false,
        dedup_key: welcomeKey,
        target_roles: ["owner", "director", "accountant", "secretary"],
        created_at: new Date().toISOString(),
      });
      existingKeys.add(welcomeKey);
    }

    // B. Suggestion d'import rapide
    const importSuggestKey = `onboarding_import_${school.id}`;
    if (!existingKeys.has(importSuggestKey)) {
      newNotifications.push({
        id: `notif-import-suggest-${school.id}`,
        school_id: school.id,
        type: "onboarding_no_students",
        priority: "info",
        title: "Démarrage rapide avec Excel",
        message: "Vous pouvez importer votre registre existant en quelques secondes pour initialiser vos classes.",
        action_url: "/students",
        action_label: "Importer mes données",
        entity_type: "import_batch",
        is_read: false,
        dedup_key: importSuggestKey,
        target_roles: ["owner", "director", "secretary"],
        created_at: new Date().toISOString(),
      });
      existingKeys.add(importSuggestKey);
    }
  }

  // C. Élèves présents mais aucun paiement enregistré

  if (students.length > 0 && activePayments.length === 0) {
    const firstPayKey = `onboarding_first_pay_${school.id}`;
    if (!existingKeys.has(firstPayKey)) {
      newNotifications.push({
        id: `notif-first-pay-${school.id}`,
        school_id: school.id,
        type: "onboarding_no_payments",
        priority: "info",
        title: "Votre suivi financier est prêt",
        message: "Enregistrez votre premier paiement pour commencer à suivre vos encaissements et la trésorerie.",
        action_url: "/payments",
        action_label: "Enregistrer un paiement",
        entity_type: "payment",
        is_read: false,
        dedup_key: firstPayKey,
        target_roles: ["owner", "director", "accountant"],
        created_at: new Date().toISOString(),
      });
      existingKeys.add(firstPayKey);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ANALYSE FINANCIÈRE DES ÉLÈVES (Vraies Données Calculées)
  // ──────────────────────────────────────────────────────────────────────────
  const criticalDebtors: Array<{ student: Student; summary: StudentFinancialSummary }> = [];
  const lateDebtors: Array<{ student: Student; summary: StudentFinancialSummary }> = [];
  const upcomingDebtors: Array<{ student: Student; summary: StudentFinancialSummary }> = [];

  students.forEach((student) => {
    const summary = getStudentFinancialSummary(student.id);
    if (summary.balance_due > 0) {
      if (summary.days_late >= 15) {
        criticalDebtors.push({ student, summary });
      } else if (summary.days_late >= 7) {
        lateDebtors.push({ student, summary });
      } else if (summary.status === "upcoming") {
        upcomingDebtors.push({ student, summary });
      }
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. RETARDS CRITIQUES (>= 15 jours) — Avec Anti-Spam
  // ──────────────────────────────────────────────────────────────────────────
  if (criticalDebtors.length > 0) {
    if (criticalDebtors.length <= 2) {
      // 1 ou 2 élèves : notifications individuelles précises
      criticalDebtors.forEach(({ student, summary }) => {
        const singleKey = `critical_student_${student.id}_${todayStr}`;
        if (!existingKeys.has(singleKey)) {
          newNotifications.push({
            id: `notif-crit-${student.id}-${todayStr}`,
            school_id: school.id,
            type: "debt_critical",
            priority: "critical",
            title: "Impayé critique",
            message: `${student.first_name} ${student.last_name} — ${formatFCFA(summary.balance_due)} (${summary.days_late}j de retard)`,
            action_url: "/debts?filter=critical",
            action_label: "Relancer maintenant",
            entity_type: "student",
            entity_id: student.id,
            metadata: {
              student_id: student.id,
              student_name: `${student.first_name} ${student.last_name}`,
              balance_due: summary.balance_due,
              days_late: summary.days_late,
            },
            is_read: false,
            dedup_key: singleKey,
            target_roles: ["owner", "director", "accountant"],
            created_at: new Date().toISOString(),
          });
          existingKeys.add(singleKey);
        }
      });
    } else {
      // 3+ élèves : AGRÉGATION INTELLIGENTE ANTI-SPAM
      const totalCriticalDue = criticalDebtors.reduce((sum, item) => sum + item.summary.balance_due, 0);
      const aggregateKey = `critical_aggregate_${todayStr}_${school.id}`;
      if (!existingKeys.has(aggregateKey)) {
        newNotifications.push({
          id: `notif-crit-agg-${todayStr}`,
          school_id: school.id,
          type: "debt_critical",
          priority: "critical",
          title: `${criticalDebtors.length} impayés critiques (> 15j)`,
          message: `${criticalDebtors.length} dossiers dépassent 15 jours de retard (${formatFCFA(totalCriticalDue)} à recouvrer).`,
          action_url: "/debts?filter=critical",
          action_label: "Voir les impayés",
          entity_type: "debt",
          metadata: {
            count: criticalDebtors.length,
            total_amount: totalCriticalDue,
          },
          is_read: false,
          dedup_key: aggregateKey,
          target_roles: ["owner", "director", "accountant"],
          created_at: new Date().toISOString(),
        });
        existingKeys.add(aggregateKey);
      }
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. RETARDS DE PAIEMENT (7 à 14 jours) — Agrégation
  // ──────────────────────────────────────────────────────────────────────────
  if (lateDebtors.length > 0) {
    const lateKey = `late_aggregate_${todayStr}_${school.id}`;
    if (!existingKeys.has(lateKey)) {
      const totalLate = lateDebtors.reduce((sum, item) => sum + item.summary.balance_due, 0);
      newNotifications.push({
        id: `notif-late-agg-${todayStr}`,
        school_id: school.id,
        type: "debt_late",
        priority: "warning",
        title: `${lateDebtors.length} retard(s) de paiement`,
        message: `${lateDebtors.length} paiement(s) accusent plus de 7 jours de retard (${formatFCFA(totalLate)} attendus).`,
        action_url: "/debts?filter=late",
        action_label: "Relancer",
        entity_type: "debt",
        metadata: {
          count: lateDebtors.length,
          total_amount: totalLate,
        },
        is_read: false,
        dedup_key: lateKey,
        target_roles: ["owner", "director", "accountant"],
        created_at: new Date().toISOString(),
      });
      existingKeys.add(lateKey);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. ÉCHÉANCES PROCHES (3 à 7 jours) — Agrégation
  // ──────────────────────────────────────────────────────────────────────────
  if (upcomingDebtors.length > 0) {
    const upcomingKey = `upcoming_aggregate_${todayStr}_${school.id}`;
    if (!existingKeys.has(upcomingKey)) {
      const totalUpcoming = upcomingDebtors.reduce((sum, item) => sum + item.summary.balance_due, 0);
      newNotifications.push({
        id: `notif-upcoming-agg-${todayStr}`,
        school_id: school.id,
        type: "due_upcoming",
        priority: "warning",
        title: "Échéances proches",
        message: `${upcomingDebtors.length} paiement(s) arrivent à échéance dans les 3 à 7 jours (${formatFCFA(totalUpcoming)}).`,
        action_url: "/debts?filter=upcoming",
        action_label: "Voir les échéances",
        entity_type: "debt",
        metadata: {
          count: upcomingDebtors.length,
          total_amount: totalUpcoming,
        },
        is_read: false,
        dedup_key: upcomingKey,
        target_roles: ["owner", "director", "accountant"],
        created_at: new Date().toISOString(),
      });
      existingKeys.add(upcomingKey);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. ACTIVITÉ DU JOUR & ENCAISSEMENTS
  // ──────────────────────────────────────────────────────────────────────────
  const todayPayments = activePayments.filter((p) => p.payment_date === todayStr);
  if (todayPayments.length > 0) {
    const todayTotal = todayPayments.reduce((sum, p) => sum + Math.round(p.amount), 0);
    const summaryKey = `daily_summary_${todayStr}_${todayPayments.length}_${school.id}`;
    if (!existingKeys.has(summaryKey)) {
      newNotifications.push({
        id: `notif-summary-${todayStr}-${todayPayments.length}`,
        school_id: school.id,
        type: "daily_collection_summary",
        priority: "info",
        title: "Activité d'encaissement du jour",
        message: `${todayPayments.length} paiement(s) enregistré(s) aujourd'hui pour un total de ${formatFCFA(todayTotal)}.`,
        action_url: "/payments",
        action_label: "Voir le journal",
        entity_type: "payment",
        metadata: {
          count: todayPayments.length,
          total_amount: todayTotal,
        },
        is_read: false,
        dedup_key: summaryKey,
        target_roles: ["owner", "director", "accountant"],
        created_at: new Date().toISOString(),
      });
      existingKeys.add(summaryKey);
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. SUIVI INTELLIGENT DE L'ABONNEMENT & DE L'ESSAI (Rappels sans harcèlement)
  // ──────────────────────────────────────────────────────────────────────────
  if (ctx.subscription) {
    const sub = ctx.subscription;
    const nowMs = Date.now();

    // A. Période d'essai (Trialing)
    if (sub.status === "trialing" && sub.trial_end_at) {
      const trialEndMs = new Date(sub.trial_end_at).getTime();
      const diffDays = Math.ceil((trialEndMs - nowMs) / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        // Essai expiré
        const expiredKey = `trial_expired_${school.id}`;
        if (!existingKeys.has(expiredKey)) {
          newNotifications.push({
            id: `notif-trial-exp-${school.id}`,
            school_id: school.id,
            type: "system_warning",
            priority: "warning",
            title: "Votre période d'essai est terminée",
            message: "Toutes vos données sont conservées. Choisissez un forfait START ou PRO pour continuer à utiliser SCOLY.",
            action_url: "/subscription",
            action_label: "Choisir un forfait",
            entity_type: "subscription",
            is_read: false,
            dedup_key: expiredKey,
            target_roles: ["owner", "director"],
            created_at: new Date().toISOString(),
          });
          existingKeys.add(expiredKey);
        }
      } else if (diffDays <= 1) {
        // J-1
        const key1d = `trial_remind_1d_${school.id}`;
        if (!existingKeys.has(key1d)) {
          newNotifications.push({
            id: `notif-trial-1d-${school.id}`,
            school_id: school.id,
            type: "system_warning",
            priority: "warning",
            title: "Votre essai se termine demain",
            message: "Choisissez votre forfait pour continuer à utiliser SCOLY sans interruption.",
            action_url: "/subscription",
            action_label: "Choisir mon forfait",
            entity_type: "subscription",
            metadata: { days_remaining: 1 },
            is_read: false,
            dedup_key: key1d,
            target_roles: ["owner", "director"],
            created_at: new Date().toISOString(),
          });
          existingKeys.add(key1d);
        }
      } else if (diffDays <= 3) {
        // J-3
        const key3d = `trial_remind_3d_${school.id}`;
        if (!existingKeys.has(key3d)) {
          newNotifications.push({
            id: `notif-trial-3d-${school.id}`,
            school_id: school.id,
            type: "system_warning",
            priority: "warning",
            title: "Votre essai arrive bientôt à son terme",
            message: `Il vous reste ${diffDays} jours pour profiter de votre essai gratuit.`,
            action_url: "/subscription",
            action_label: "Voir les forfaits",
            entity_type: "subscription",
            metadata: { days_remaining: diffDays },
            is_read: false,
            dedup_key: key3d,
            target_roles: ["owner", "director"],
            created_at: new Date().toISOString(),
          });
          existingKeys.add(key3d);
        }
      } else if (diffDays <= 7) {
        // J-7
        const key7d = `trial_remind_7d_${school.id}`;
        if (!existingKeys.has(key7d)) {
          newNotifications.push({
            id: `notif-trial-7d-${school.id}`,
            school_id: school.id,
            type: "system_info",
            priority: "info",
            title: "Votre essai SCOLY se poursuit",
            message: `Il vous reste ${diffDays} jours pour découvrir SCOLY.`,
            action_url: "/subscription",
            action_label: "Découvrir les forfaits",
            entity_type: "subscription",
            metadata: { days_remaining: diffDays },
            is_read: false,
            dedup_key: key7d,
            target_roles: ["owner", "director"],
            created_at: new Date().toISOString(),
          });
          existingKeys.add(key7d);
        }
      }
    }

    // B. Abonnement Actif payé (Renouvellement à J-7)
    if (sub.status === "active" && sub.subscription_end_at) {
      const subEndMs = new Date(sub.subscription_end_at).getTime();
      const daysUntilEnd = Math.ceil((subEndMs - nowMs) / (1000 * 60 * 60 * 24));

      if (daysUntilEnd <= 0) {
        const subExpKey = `sub_expired_${school.id}_${todayStr.slice(0, 7)}`;
        if (!existingKeys.has(subExpKey)) {
          newNotifications.push({
            id: `notif-sub-exp-${school.id}`,
            school_id: school.id,
            type: "system_warning",
            priority: "warning",
            title: "Votre abonnement a expiré",
            message: "Réactivez votre espace pour continuer à utiliser toutes vos fonctionnalités.",
            action_url: "/subscription",
            action_label: "Réactiver",
            entity_type: "subscription",
            is_read: false,
            dedup_key: subExpKey,
            target_roles: ["owner", "director"],
            created_at: new Date().toISOString(),
          });
          existingKeys.add(subExpKey);
        }
      } else if (daysUntilEnd <= 7) {
        const renewKey = `sub_renew_7d_${school.id}_${todayStr.slice(0, 7)}`;
        if (!existingKeys.has(renewKey)) {
          newNotifications.push({
            id: `notif-sub-renew-${school.id}`,
            school_id: school.id,
            type: "system_info",
            priority: "info",
            title: "Renouvellement d'abonnement proche",
            message: `Votre abonnement ${sub.plan.toUpperCase()} expire dans ${daysUntilEnd} jour(s).`,
            action_url: "/subscription",
            action_label: "Gérer l'abonnement",
            entity_type: "subscription",
            metadata: { days_remaining: daysUntilEnd },
            is_read: false,
            dedup_key: renewKey,
            target_roles: ["owner", "director"],
            created_at: new Date().toISOString(),
          });
          existingKeys.add(renewKey);
        }
      }
    }
  }

  return newNotifications;
}

