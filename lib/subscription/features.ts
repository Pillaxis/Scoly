import {
  ScolySubscription,
  SubscriptionPlan,
  SubscriptionBillingPeriod,
  FeatureKey,
  FeatureAccessResult,
  PricingTier,
  PLAN_STUDENT_LIMITS,
} from "@/types/subscription";

/**
 * SCOLY Official Pricing Grid
 * - START : 5 000 FCFA/mois | 42 000 FCFA/an (-30%) | 100 élèves max
 * - PRO : 10 000 FCFA/mois | 84 000 FCFA/an (-30%) | 500 élèves max
 * - PREMIUM : 25 000 FCFA/mois | 210 000 FCFA/an (-30%) | 1 500 élèves max
 * - Essai gratuit : 30 jours
 */
export const PLAN_PRICING: Record<
  SubscriptionPlan,
  {
    monthly: number;
    yearly: number;
    yearlyOriginal: number;
    yearlySavings: number;
    currency: string;
    maxStudents: number;
  }
> = {
  start: {
    monthly: 5000,
    yearly: 42000,
    yearlyOriginal: 60000,
    yearlySavings: 18000,
    currency: "FCFA",
    maxStudents: 100,
  },
  pro: {
    monthly: 10000,
    yearly: 84000,
    yearlyOriginal: 120000,
    yearlySavings: 36000,
    currency: "FCFA",
    maxStudents: 500,
  },
  premium: {
    monthly: 25000,
    yearly: 210000,
    yearlyOriginal: 300000,
    yearlySavings: 90000,
    currency: "FCFA",
    maxStudents: 1500,
  },
};

/**
 * Detailed Feature Definitions (Based exclusively on REAL SCOLY features)
 */
export const FEATURE_DEFINITIONS: Record<
  FeatureKey,
  {
    title: string;
    description: string;
    proPitch?: string;
    category: "essentials" | "analytics" | "automation" | "security";
  }
> = {
  // START, PRO & PREMIUM Features
  students_management: {
    title: "Gestion des Élèves & Classes",
    description: "Inscriptions, fiches élèves complètes, gestion des classes et remises personnalisées.",
    category: "essentials",
  },
  parents_contacts: {
    title: "Répertoire Parents & Tuteurs",
    description: "Coordonnées téléphoniques, WhatsApp et liens de parenté de chaque élève.",
    category: "essentials",
  },
  tuition_management: {
    title: "Grilles Tarifaires & Échéanciers",
    description: "Définition des montants de scolarité et calendrier des tranches par classe.",
    category: "essentials",
  },
  cash_receipts: {
    title: "Encaissements & Règlements",
    description: "Enregistrement direct en caisse et contrôle strict du solde dû.",
    category: "essentials",
  },
  receipt_generation: {
    title: "Reçus Numérotés & Partage WhatsApp",
    description: "Reçus conformes REC-25-XXXXX avec ventilation du solde et partage direct.",
    category: "essentials",
  },
  basic_reminders: {
    title: "Relances Individuelles WhatsApp",
    description: "Envoi unitaire de rappels personnalisés aux parents en retard.",
    category: "essentials",
  },
  basic_dashboard: {
    title: "Tableau de Bord Standard",
    description: "Indicateurs clés : Total encaissé, reste à recouvrer et taux de recouvrement global.",
    category: "essentials",
  },
  excel_import: {
    title: "Import Fichiers Excel / CSV / PDF",
    description: "Importation de listes d'élèves depuis des fichiers tableurs et documents.",
    category: "essentials",
  },
  basic_notifications: {
    title: "Centre de Notifications Standard",
    description: "Alertes sur les paiements et retards directement dans l'application.",
    category: "essentials",
  },

  // PRO & PREMIUM Features
  advanced_analytics: {
    title: "Graphiques & Statistiques Avancées",
    description: "Graphiques d'évolution du chiffre d'affaires, comparaison mensuelle et prévision.",
    proPitch: "Visualisez la santé financière de votre école avec des graphiques d'évolution interactifs.",
    category: "analytics",
  },
  student_status_donut: {
    title: "Analyse Visuelle du Statut des Élèves",
    description: "Répartition dynamique en camembert (À jour, En retard, Critiques).",
    proPitch: "Analysez instantanément la proportion d'élèves en règle et ciblez précisément vos actions.",
    category: "analytics",
  },
  smart_action_center: {
    title: "Centre d'Actions Urgentes Intelligent",
    description: "Priorisation algorithmique des dossiers à relancer en priorité selon l'ancienneté et le montant.",
    proPitch: "Gagnez un temps précieux grâce à la sélection automatique des relances prioritaires chaque matin.",
    category: "automation",
  },
  mobile_money_fedapay: {
    title: "Paiement Mobile Money Automatisé (FedaPay)",
    description: "Encaissement direct en ligne via TMoney, Flooz, Orange Money, Moov et Cartes Bancaires.",
    proPitch: "Permettez aux parents de payer les frais de scolarité à distance 24/7 par Mobile Money.",
    category: "automation",
  },
  ai_ocr_scanner: {
    title: "Numérisation & Scan OCR des Registres Papier",
    description: "Prise de photo par caméra et reconnaissance optique avec vérification assistée.",
    proPitch: "Numérisez vos registres papier avec l'écran de revue assistée SCOLY.",
    category: "automation",
  },
  google_sheets_sync: {
    title: "Synchronisation Google Sheets en Direct",
    description: "Connexion et importation via le proxy serveur dédié anti-CORS.",
    proPitch: "Connectez votre comptabilité à vos feuilles Google Sheets partagées.",
    category: "automation",
  },
  batch_reminders: {
    title: "Relances Groupées d'Impayés",
    description: "Envoi massif de relances et export des listes complètes de relance pour la direction.",
    proPitch: "Relancez les parents d'une classe en un seul clic.",
    category: "automation",
  },
  unlimited_staff: {
    title: "Équipe & Permissions Rôles Fines",
    description: "Comptes d'accès séparés pour le Directeur, le Comptable et le Secrétariat avec restrictions.",
    proPitch: "Sécurisez vos données confidentielles en attribuant à chaque collaborateur les droits stricts.",
    category: "security",
  },
  realtime_multidevice: {
    title: "Synchronisation Multi-Appareils Temps Réel",
    description: "Mise à jour instantanée en direct entre ordinateurs, tablettes et smartphones sans recharger.",
    proPitch: "Travaillez simultanément en caisse et à la direction avec synchronisation immédiate.",
    category: "security",
  },
  advanced_notifications: {
    title: "Notifications Push Navigateur & Synthèse Quotidienne",
    description: "Alertes push natives sur mobile/PC et récapitulatif quotidien automatique de la caisse.",
    proPitch: "Restez informé des encaissements en temps réel à chaque encaissement.",
    category: "automation",
  },

  // PREMIUM Exclusive Features
  multi_campus_management: {
    title: "Gestion Multi-Établissements & Campus",
    description: "Gestion centralisée de plusieurs sites scolaires sous un même compte groupe.",
    proPitch: "Supervisez plusieurs campus ou complexes scolaires depuis une vue consolidée.",
    category: "security",
  },
  priority_dedicated_support: {
    title: "Support Dédié Prioritaire 24/7",
    description: "Assistance téléphonique et WhatsApp directe avec un gestionnaire de compte dédié.",
    proPitch: "Bénéficiez d'un accompagnement personnalisé pour la formation de vos équipes.",
    category: "essentials",
  },
};

/**
 * Included features per plan
 */
export const PLAN_FEATURES: Record<SubscriptionPlan, Record<FeatureKey, boolean>> = {
  start: {
    students_management: true,
    parents_contacts: true,
    tuition_management: true,
    cash_receipts: true,
    receipt_generation: true,
    basic_reminders: true,
    basic_dashboard: true,
    excel_import: true,
    basic_notifications: true,
    // PRO features (Locked in START)
    advanced_analytics: false,
    student_status_donut: false,
    smart_action_center: false,
    mobile_money_fedapay: false,
    ai_ocr_scanner: false,
    google_sheets_sync: false,
    batch_reminders: false,
    unlimited_staff: false,
    realtime_multidevice: false,
    advanced_notifications: false,
    multi_campus_management: false,
    priority_dedicated_support: false,
  },
  pro: {
    students_management: true,
    parents_contacts: true,
    tuition_management: true,
    cash_receipts: true,
    receipt_generation: true,
    basic_reminders: true,
    basic_dashboard: true,
    excel_import: true,
    basic_notifications: true,
    // PRO features (All unlocked in PRO)
    advanced_analytics: true,
    student_status_donut: true,
    smart_action_center: true,
    mobile_money_fedapay: true,
    ai_ocr_scanner: true,
    google_sheets_sync: true,
    batch_reminders: true,
    unlimited_staff: true,
    realtime_multidevice: true,
    advanced_notifications: true,
    multi_campus_management: false,
    priority_dedicated_support: false,
  },
  premium: {
    students_management: true,
    parents_contacts: true,
    tuition_management: true,
    cash_receipts: true,
    receipt_generation: true,
    basic_reminders: true,
    basic_dashboard: true,
    excel_import: true,
    basic_notifications: true,
    advanced_analytics: true,
    student_status_donut: true,
    smart_action_center: true,
    mobile_money_fedapay: true,
    ai_ocr_scanner: true,
    google_sheets_sync: true,
    batch_reminders: true,
    unlimited_staff: true,
    realtime_multidevice: true,
    advanced_notifications: true,
    multi_campus_management: true,
    priority_dedicated_support: true,
  },
};

/**
 * Pricing Tiers for Display (Monthly & Yearly with -30%)
 */
export const PRICING_TIERS: PricingTier[] = [
  {
    id: "start",
    name: "START",
    tagline: "Idéal pour informatiser simplement une école jusqu'à 100 élèves.",
    maxStudents: 100,
    monthlyPrice: 5000,
    yearlyPrice: 42000,
    yearlySavings: 18000,
    currency: "FCFA",
    features: [
      { name: "Jusqu'à 100 élèves enregistrés", included: true },
      { name: "Gestion complète des classes & scolarités", included: true },
      { name: "Répertoire & contacts parents WhatsApp", included: true },
      { name: "Encaissements & reçus officiels REC-25", included: true },
      { name: "Relances individuelles WhatsApp / SMS", included: true },
      { name: "Tableau de bord financier de base", included: true },
      { name: "Import fichiers Excel, CSV & PDF", included: true },
      { name: "Graphiques & statistiques avancées", included: false, isProHighlight: true },
      { name: "Numérisation caméra OCR des registres", included: false, isProHighlight: true },
      { name: "Paiement Mobile Money automatisé", included: false, isProHighlight: true },
    ],
    ctaText: "Choisir START",
  },
  {
    id: "pro",
    name: "PRO",
    tagline: "Pour les établissements en croissance jusqu'à 500 élèves avec toute la puissance d'analyse.",
    badge: "Recommandé",
    popular: true,
    maxStudents: 500,
    monthlyPrice: 10000,
    yearlyPrice: 84000,
    yearlySavings: 36000,
    currency: "FCFA",
    features: [
      { name: "Jusqu'à 500 élèves enregistrés", included: true },
      { name: "Toutes les fonctionnalités du forfait START", included: true },
      { name: "Graphiques d'évolution du CA & camembert financier", included: true },
      { name: "Centre d'actions urgentes avec priorisation", included: true },
      { name: "Encaissement Mobile Money en ligne (FedaPay)", included: true },
      { name: "Numérisation par caméra OCR des cahiers", included: true },
      { name: "Synchronisation Google Sheets en direct", included: true },
      { name: "Relances groupées par classe", included: true },
      { name: "Multi-utilisateurs & permissions fines", included: true },
      { name: "Synchronisation temps réel multi-appareils", included: true },
    ],
    ctaText: "Passer à PRO",
  },
  {
    id: "premium",
    name: "PREMIUM",
    tagline: "La solution intégrale pour les grands groupes scolaires jusqu'à 1 500 élèves.",
    maxStudents: 1500,
    monthlyPrice: 25000,
    yearlyPrice: 210000,
    yearlySavings: 90000,
    currency: "FCFA",
    features: [
      { name: "Jusqu'à 1 500 élèves enregistrés", included: true },
      { name: "Toutes les fonctionnalités du forfait PRO", included: true },
      { name: "Gestion multi-campus & complexes scolaires", included: true },
      { name: "Support prioritaire dédié 24/7 sur WhatsApp", included: true },
      { name: "Formation personnalisée de l'équipe administrative", included: true },
      { name: "Accompagnement à l'import initial de données", included: true },
    ],
    ctaText: "Choisir PREMIUM",
  },
];

/**
 * Centralized Permission Engine: canAccessFeature
 */
export function canAccessFeature(
  subscription: ScolySubscription | null | undefined,
  feature: FeatureKey
): FeatureAccessResult {
  const def = FEATURE_DEFINITIONS[feature] || {
    title: "Fonctionnalité",
    description: "",
    proPitch: "",
  };

  // If no subscription object at all, default to an active trial
  if (!subscription) {
    return {
      allowed: true,
      requiredPlan: "pro",
      featureTitle: def.title,
      featureDescription: def.proPitch || def.description,
    };
  }

  const now = new Date();

  // 1. TRIALING STATE (30 days)
  if (subscription.status === "trialing") {
    if (!subscription.trial_end_at) {
      return {
        allowed: false,
        reason: "TRIAL_EXPIRED",
        requiredPlan: "start",
        featureTitle: def.title,
        featureDescription: "Votre période d'essai de 30 jours est terminée. Choisissez un forfait pour continuer.",
      };
    }
    const trialEnd = new Date(subscription.trial_end_at);
    if (now > trialEnd) {
      return {
        allowed: false,
        reason: "TRIAL_EXPIRED",
        requiredPlan: "start",
        featureTitle: def.title,
        featureDescription: "Votre période d'essai de 30 jours est terminée. Choisissez un forfait pour continuer.",
      };
    }

    // Trial is ACTIVE: grant full access to explore the complete software
    return {
      allowed: true,
      requiredPlan: "pro",
      featureTitle: def.title,
      featureDescription: def.proPitch || def.description,
    };
  }

  // 2. ACTIVE PAID SUBSCRIPTION
  if (subscription.status === "active") {
    if (subscription.subscription_end_at) {
      const subEnd = new Date(subscription.subscription_end_at);
      if (now > subEnd) {
        return {
          allowed: false,
          reason: "SUBSCRIPTION_EXPIRED",
          requiredPlan: subscription.plan,
          featureTitle: def.title,
          featureDescription: "Votre abonnement a expiré. Veuillez renouveler votre formule pour continuer.",
        };
      }
    }

    const currentPlan = subscription.plan || "start";
    const isIncluded = PLAN_FEATURES[currentPlan]?.[feature] ?? false;

    if (isIncluded) {
      return {
        allowed: true,
        requiredPlan: currentPlan,
        featureTitle: def.title,
        featureDescription: def.description,
      };
    }

    return {
      allowed: false,
      reason: "PRO_REQUIRED",
      requiredPlan: "pro",
      featureTitle: def.title,
      featureDescription: def.proPitch || def.description,
    };
  }

  // 3. PAST DUE (Grace period)
  if (subscription.status === "past_due") {
    const isIncludedInStart = PLAN_FEATURES.start[feature] ?? false;
    if (isIncludedInStart) {
      return {
        allowed: true,
        reason: "PAST_DUE_WARNING",
        requiredPlan: subscription.plan,
        featureTitle: def.title,
        featureDescription: "Attention : votre renouvellement est en attente.",
      };
    }
    return {
      allowed: false,
      reason: "PRO_REQUIRED",
      requiredPlan: "pro",
      featureTitle: def.title,
      featureDescription: def.proPitch || def.description,
    };
  }

  // 4. EXPIRED OR CANCELLED
  return {
    allowed: false,
    reason: subscription.status === "expired" ? "SUBSCRIPTION_EXPIRED" : "SUBSCRIPTION_CANCELLED",
    requiredPlan: "start",
    featureTitle: def.title,
    featureDescription: "Un abonnement actif est requis pour utiliser cette fonctionnalité.",
  };
}

/**
 * Calculates trial time remaining in days and hours
 */
export function getTrialTimeRemaining(subscription: ScolySubscription | null | undefined): {
  daysRemaining: number;
  hoursRemaining: number;
  isExpired: boolean;
  message: string;
  badgeLabel: string;
} {
  if (!subscription || subscription.status !== "trialing" || !subscription.trial_end_at) {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: false,
      message: "",
      badgeLabel: "",
    };
  }

  const now = Date.now();
  const trialEnd = new Date(subscription.trial_end_at).getTime();
  if (isNaN(trialEnd)) {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: false,
      message: "",
      badgeLabel: "",
    };
  }
  const diffMs = trialEnd - now;

  if (diffMs <= 0) {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      message: "Votre période d'essai est terminée. Choisissez un forfait pour continuer.",
      badgeLabel: "Essai expiré",
    };
  }

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));

  let message = "";
  if (days > 1) {
    message = `Il vous reste ${days} jours d'essai gratuit`;
  } else if (days === 1) {
    message = "Il vous reste 1 jour d'essai gratuit";
  } else {
    message = `Votre essai se termine dans ${hours}h. Choisissez votre forfait pour continuer`;
  }

  return {
    daysRemaining: days,
    hoursRemaining: hours,
    isExpired: false,
    message,
    badgeLabel: days > 0 ? `Essai (${days}j)` : `Essai (<24h)`,
  };
}

/**
 * Helper to calculate subscription dates for a new period
 */
export function calculateSubscriptionDates(
  plan: SubscriptionPlan,
  billingPeriod: SubscriptionBillingPeriod,
  fromDate: Date = new Date()
): {
  subscriptionStartAt: string;
  subscriptionEndAt: string;
  amount: number;
} {
  const start = new Date(fromDate);
  const end = new Date(fromDate);

  if (billingPeriod === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  const amount = PLAN_PRICING[plan][billingPeriod];

  return {
    subscriptionStartAt: start.toISOString(),
    subscriptionEndAt: end.toISOString(),
    amount,
  };
}

/**
 * Creates default 30-day trial subscription object for a school
 */
export function getDefaultTrialSubscription(schoolId: string, createdAt?: string): ScolySubscription {
  const startDate = createdAt ? new Date(createdAt) : new Date();
  const trialEnd = new Date(startDate);
  trialEnd.setDate(trialEnd.getDate() + 30);

  return {
    id: `sub-${schoolId.slice(0, 8)}`,
    school_id: schoolId,
    plan: "start",
    billing_period: "monthly",
    status: "trialing",
    price_amount: 0,
    currency: "FCFA",
    trial_start_at: startDate.toISOString(),
    trial_end_at: trialEnd.toISOString(),
    subscription_start_at: null,
    subscription_end_at: null,
    cancelled_at: null,
    last_payment_reference: null,
    last_payment_method: null,
    payment_provider: "fedapay",
    created_at: startDate.toISOString(),
  };
}

/**
 * Check if the student limit has been reached for the current subscription plan
 */
export function checkStudentLimitReached(
  currentStudentCount: number,
  subscription: ScolySubscription | null | undefined
): { isReached: boolean; maxAllowed: number; currentCount: number; requiredPlan?: SubscriptionPlan } {
  if (!subscription || subscription.status === "trialing") {
    // In 30-day trial, allow testing up to 500 students
    const maxAllowed = 500;
    return {
      isReached: currentStudentCount >= maxAllowed,
      maxAllowed,
      currentCount: currentStudentCount,
      requiredPlan: "pro",
    };
  }

  const plan = subscription.plan || "start";
  const maxAllowed = PLAN_STUDENT_LIMITS[plan] || 100;
  const isReached = currentStudentCount >= maxAllowed;

  let requiredPlan: SubscriptionPlan | undefined;
  if (isReached) {
    if (plan === "start") requiredPlan = "pro";
    else if (plan === "pro") requiredPlan = "premium";
  }

  return {
    isReached,
    maxAllowed,
    currentCount: currentStudentCount,
    requiredPlan,
  };
}
