import {
  ScolySubscription,
  SubscriptionPlan,
  SubscriptionBillingPeriod,
  SubscriptionStatus,
  FeatureKey,
  FeatureAccessResult,
  PricingTier,
} from "@/types/subscription";

/**
 * SCOLY Official Pricing Grid
 * - START : 5 000 FCFA/mois | 42 000 FCFA/an (-30% soit 18 000 FCFA d'économie)
 * - PRO : 10 000 FCFA/mois | 84 000 FCFA/an (-30% soit 36 000 FCFA d'économie)
 */
export const PLAN_PRICING = {
  start: {
    monthly: 5000,
    yearly: 42000,
    yearlyOriginal: 60000,
    yearlySavings: 18000,
    currency: "FCFA",
  },
  pro: {
    monthly: 10000,
    yearly: 84000,
    yearlyOriginal: 120000,
    yearlySavings: 36000,
    currency: "FCFA",
  },
} as const;

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
  // START & PRO Features
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
    title: "Encaissements Espèces & Virements",
    description: "Enregistrement direct en caisse, gestion des avances et génération de reçus.",
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
    title: "Import Fichiers Excel / CSV",
    description: "Importation standard de listes d'élèves depuis des fichiers tableurs.",
    category: "essentials",
  },
  basic_notifications: {
    title: "Centre de Notifications Standard",
    description: "Alertes sur les paiements et retards directement dans l'application.",
    category: "essentials",
  },

  // EXCLUSIVE PRO Features
  advanced_analytics: {
    title: "Graphiques & Statistiques Avancées",
    description: "Graphiques d'évolution du chiffre d'affaires, comparaison mensuelle et prévision de trésorerie.",
    proPitch: "Visualisez la santé financière de votre école avec des graphiques d'évolution interactifs et anticipez vos rentrées.",
    category: "analytics",
  },
  student_status_donut: {
    title: "Analyse Visuelle du Statut des Élèves",
    description: "Répartition dynamique en camembert (À jour, En retard, Critiques, Avances).",
    proPitch: "Analysez instantanément la proportion d'élèves en règle et ciblez précisément vos actions de recouvrement.",
    category: "analytics",
  },
  smart_action_center: {
    title: "Centre d'Actions Urgentes Intelligent",
    description: "Priorisation algorithmique des dossiers à relancer en priorité selon l'ancienneté et le montant.",
    proPitch: "Gagnez un temps précieux grâce à l'algorithme SCOLY qui sélectionne chaque matin les relances les plus rentables.",
    category: "automation",
  },
  mobile_money_fedapay: {
    title: "Paiement Mobile Money Automatisé (FedaPay)",
    description: "Encaissement direct en ligne via TMoney, Flooz, Orange Money, Moov et Cartes Bancaires.",
    proPitch: "Permettez aux parents de payer les frais de scolarité à distance 24/7 par Mobile Money avec confirmation instantanée.",
    category: "automation",
  },
  ai_ocr_scanner: {
    title: "Numérisation & Scan OCR des Registres Papier",
    description: "Prise de photo par caméra et reconnaissance optique intelligente de vos cahiers scolaires.",
    proPitch: "Numérisez vos registres papier en quelques secondes sans aucune saisie manuelle grâce à l'OCR intégré.",
    category: "automation",
  },
  google_sheets_sync: {
    title: "Synchronisation Google Sheets en Direct",
    description: "Connexion et synchronisation bidirectionnelle avec vos feuilles de calcul Google en ligne.",
    proPitch: "Connectez votre comptabilité à Google Sheets pour des mises à jour automatiques en temps réel.",
    category: "automation",
  },
  batch_reminders: {
    title: "Relances Groupées d'Impayés",
    description: "Envoi massif de relances et export des listes complètes de relance pour la direction.",
    proPitch: "Relancez 50 parents en un seul clic et suivez le taux de conversion de vos campagnes de recouvrement.",
    category: "automation",
  },
  unlimited_staff: {
    title: "Équipe & Permissions Rôles Fines",
    description: "Comptes d'accès séparés pour le Directeur, le Comptable et le Secrétariat avec restrictions.",
    proPitch: "Sécurisez vos données confidentielles en attribuant à chaque collaborateur les droits stricts nécessaires.",
    category: "security",
  },
  realtime_multidevice: {
    title: "Synchronisation Multi-Appareils Temps Réel",
    description: "Mise à jour instantanée en direct entre ordinateurs, tablettes et smartphones sans recharger.",
    proPitch: "Travaillez simultanément en caisse et à la direction avec une synchronisation parfaite à la seconde.",
    category: "security",
  },
  advanced_notifications: {
    title: "Notifications Push Navigateur & Synthèse Quotidienne",
    description: "Alertes push natives sur mobile/PC et récapitulatif quotidien automatique de la caisse.",
    proPitch: "Restez informé des encaissements en temps réel même lorsque l'application n'est pas au premier plan.",
    category: "automation",
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
  },
};

/**
 * Pricing Tiers for Display (Monthly & Yearly with -30%)
 */
export const PRICING_TIERS: PricingTier[] = [
  {
    id: "start",
    name: "START",
    tagline: "L'essentiel pour informatiser et sécuriser les encaissements scolaires.",
    monthlyPrice: 5000,
    yearlyPrice: 42000,
    yearlySavings: 18000,
    currency: "FCFA",
    features: [
      { name: "Gestion complète des élèves & classes", included: true },
      { name: "Répertoire & contacts parents WhatsApp", included: true },
      { name: "Grilles de scolarité & échéances", included: true },
      { name: "Paiements espèces, chèques, virements", included: true },
      { name: "Génération & impression de reçus officiels", included: true },
      { name: "Relances individuelles WhatsApp / SMS", included: true },
      { name: "Tableau de bord financier de base", included: true },
      { name: "Import standard fichiers Excel & CSV", included: true },
      { name: "Graphiques & statistiques avancées", included: false, isProHighlight: true },
      { name: "Centre d'actions urgentes intelligent", included: false, isProHighlight: true },
      { name: "Paiement en ligne Mobile Money (FedaPay)", included: false, isProHighlight: true },
      { name: "Numérisation caméra OCR des registres", included: false, isProHighlight: true },
      { name: "Multi-utilisateurs & permissions fines", included: false, isProHighlight: true },
    ],
    ctaText: "Choisir START",
  },
  {
    id: "pro",
    name: "PRO",
    tagline: "La puissance maximale : analyse avancée, OCR, Mobile Money et synchronisation en direct.",
    badge: "Recommandé",
    popular: true,
    monthlyPrice: 10000,
    yearlyPrice: 84000,
    yearlySavings: 36000,
    currency: "FCFA",
    features: [
      { name: "Toutes les fonctionnalités du forfait START", included: true },
      { name: "Graphiques d'évolution du CA & ventilation avancée", included: true },
      { name: "Camembert dynamique de santé financière", included: true },
      { name: "Centre d'actions urgentes & priorisation IA", included: true },
      { name: "Encaissement en ligne Mobile Money (TMoney, Flooz...)", included: true },
      { name: "Numérisation par caméra OCR des registres", included: true },
      { name: "Synchronisation Google Sheets en direct", included: true },
      { name: "Relances groupées & exports comptables", included: true },
      { name: "Gestion d'équipe multi-utilisateurs avancée", included: true },
      { name: "Synchronisation temps réel multi-appareils (PC/Mobile)", included: true },
      { name: "Notifications push natives & récapitutifs de caisse", included: true },
    ],
    ctaText: "Passer à PRO",
  },
];

/**
 * Centralized Permission Engine: canAccessFeature
 * 
 * Evaluates whether the school subscription allows access to a specific feature.
 * 
 * Rules:
 * 1. During 15-day Trial: All features (including PRO) are unlocked to let the school discover SCOLY.
 * 2. If Trial Expired: Returns false with reason TRIAL_EXPIRED.
 * 3. If Active PRO: All features are unlocked.
 * 4. If Active START: START features are unlocked; PRO features return PRO_REQUIRED.
 * 5. If Subscription Expired: Returns false with SUBSCRIPTION_EXPIRED.
 * 6. If Subscription Cancelled / Inactive: Returns false with SUBSCRIPTION_REQUIRED.
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

  // If no subscription object at all, default to a safe 15-day trial mock
  if (!subscription) {
    return {
      allowed: true,
      requiredPlan: "pro",
      featureTitle: def.title,
      featureDescription: def.proPitch || def.description,
    };
  }

  const now = new Date();

  // 1. TRIALING STATE
  if (subscription.status === "trialing") {
    if (!subscription.trial_end_at) {
      return {
        allowed: false,
        reason: "TRIAL_EXPIRED",
        requiredPlan: "start",
        featureTitle: def.title,
        featureDescription: "Votre période d'essai de 15 jours est terminée. Choisissez un forfait pour continuer.",
      };
    }
    const trialEnd = new Date(subscription.trial_end_at);
    if (now > trialEnd) {
      return {
        allowed: false,
        reason: "TRIAL_EXPIRED",
        requiredPlan: "start",
        featureTitle: def.title,
        featureDescription: "Votre période d'essai de 15 jours est terminée. Choisissez un forfait pour continuer.",
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
    // Check expiration date if present
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

    // PRO plan has access to EVERYTHING
    if (subscription.plan === "pro") {
      return {
        allowed: true,
        requiredPlan: "pro",
        featureTitle: def.title,
        featureDescription: def.proPitch || def.description,
      };
    }

    // START plan: check if feature is included in START
    const isIncludedInStart = PLAN_FEATURES.start[feature] ?? false;
    if (isIncludedInStart) {
      return {
        allowed: true,
        requiredPlan: "start",
        featureTitle: def.title,
        featureDescription: def.description,
      };
    }

    // Feature requires PRO
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
    // Allow basic START operations while warning for renewal
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

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));

  let message = "";
  if (days >= 14) {
    message = "Essai gratuit — Il vous reste 15 jours pour découvrir SCOLY";
  } else if (days > 1) {
    message = `Il vous reste ${days} jours d'essai gratuit`;
  } else {
    message = "Votre essai se termine demain. Choisissez votre forfait pour continuer";
  }

  return {
    daysRemaining: days,
    hoursRemaining: hours,
    isExpired: false,
    message,
    badgeLabel: `Essai : ${days}j`,
  };
}

/**
 * Checks if the subscription is currently eligible for the 30-day money-back guarantee.
 * 
 * STRICT INVARIANT:
 * - Free trial of 15 days is NEVER eligible.
 * - Applies ONLY after a paid subscription activation.
 * - Lasts for exactly 30 days after subscription_start_at.
 */
export function isEligibleForRefund(subscription: ScolySubscription | null | undefined): {
  isEligible: boolean;
  eligible: boolean;
  daysRemaining: number;
  eligibleUntil: string | null;
  formattedEndDate: string | null;
  message: string;
} {
  if (
    !subscription ||
    subscription.status !== "active" ||
    !subscription.refund_eligible_until ||
    !subscription.price_amount ||
    subscription.price_amount <= 0
  ) {
    return {
      isEligible: false,
      eligible: false,
      daysRemaining: 0,
      eligibleUntil: null,
      formattedEndDate: null,
      message: "",
    };
  }

  const now = Date.now();
  const refundUntil = new Date(subscription.refund_eligible_until).getTime();
  const diffMs = refundUntil - now;

  const formattedEndDate = new Date(subscription.refund_eligible_until).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (diffMs <= 0) {
    return {
      isEligible: false,
      eligible: false,
      daysRemaining: 0,
      eligibleUntil: subscription.refund_eligible_until,
      formattedEndDate,
      message: "Période de garantie de 30 jours terminée.",
    };
  }

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return {
    isEligible: true,
    eligible: true,
    daysRemaining: days,
    eligibleUntil: subscription.refund_eligible_until,
    formattedEndDate,
    message: `Garantie satisfait ou remboursé pendant 30 jours (encore ${days} jour(s) restant(s)).`,
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
  refundEligibleUntil: string;
  amount: number;
} {
  const start = new Date(fromDate);
  const end = new Date(fromDate);

  if (billingPeriod === "yearly") {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }

  // 30 days money-back guarantee starts exactly on payment date
  const refundUntil = new Date(start);
  refundUntil.setDate(refundUntil.getDate() + 30);

  const amount = PLAN_PRICING[plan][billingPeriod];

  return {
    subscriptionStartAt: start.toISOString(),
    subscriptionEndAt: end.toISOString(),
    refundEligibleUntil: refundUntil.toISOString(),
    amount,
  };
}

/**
 * Creates default 15-day trial subscription object for a school
 */
export function getDefaultTrialSubscription(schoolId: string): ScolySubscription {
  const now = new Date();
  const trialEnd = new Date(now);
  trialEnd.setDate(trialEnd.getDate() + 15);

  return {
    id: `sub-${schoolId.slice(0, 8)}`,
    school_id: schoolId,
    plan: "start",
    billing_period: "monthly",
    status: "trialing",
    price_amount: 0,
    currency: "FCFA",
    trial_start_at: now.toISOString(),
    trial_end_at: trialEnd.toISOString(),
    subscription_start_at: null,
    subscription_end_at: null,
    refund_eligible_until: null,
    cancelled_at: null,
    last_payment_reference: null,
    last_payment_method: null,
    payment_provider: "fedapay",
    created_at: now.toISOString(),
  };
}
