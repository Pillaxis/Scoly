/**
 * SCOLY SaaS Subscription System Type Definitions
 * 
 * Defines plans (START, PRO), billing periods (Monthly, Yearly with -30%),
 * subscription lifecycle states, feature permission keys, and guarantees.
 */

export type SubscriptionPlan = 'start' | 'pro';

export type SubscriptionBillingPeriod = 'monthly' | 'yearly';

export type SubscriptionStatus =
  | 'trialing'   // Période d'essai gratuit de 15 jours
  | 'active'      // Abonnement payé actif
  | 'past_due'    // Échéance dépassée / paiement en attente
  | 'expired'     // Essai ou abonnement expiré sans renouvellement
  | 'cancelled';  // Abonnement résilié

export interface ScolySubscription {
  id?: string;
  school_id: string;
  plan: SubscriptionPlan;
  billing_period: SubscriptionBillingPeriod;
  status: SubscriptionStatus;
  price_amount: number;
  currency: string;
  trial_start_at?: string | null;
  trial_end_at?: string | null;
  subscription_start_at?: string | null;
  subscription_end_at?: string | null;
  refund_eligible_until?: string | null;
  cancelled_at?: string | null;
  last_payment_reference?: string | null;
  last_payment_method?: string | null;
  payment_provider?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}


/**
 * Feature keys based strictly on REAL SCOLY features
 */
export type FeatureKey =
  // --- START & PRO Features ---
  | 'students_management'       // Fiches élèves, classes, remises personnalisées
  | 'parents_contacts'          // Répertoire et coordonnées parents
  | 'tuition_management'        // Grilles tarifaires et tranches par classe
  | 'cash_receipts'             // Encaissements Espèces / Chèque / Virement & Reçus
  | 'receipt_generation'        // Reçus PDF numérotés et partage WhatsApp
  | 'basic_reminders'           // Relances individuelles WhatsApp / SMS
  | 'basic_dashboard'           // Indicateurs clés (Total encaissé, Reste, Taux)
  | 'excel_import'              // Import standard fichier Excel / CSV
  | 'basic_notifications'       // Centre de notifications standard
  
  // --- EXCLUSIVE PRO Features ---
  | 'advanced_analytics'        // Graphique d'évolution du CA & ventilation avancée
  | 'student_status_donut'      // Camembert visuel d'état financier des élèves
  | 'smart_action_center'       // Centre d'actions urgentes avec priorisation algorithmique
  | 'mobile_money_fedapay'      // Encaissement en ligne automatisé Mobile Money via FedaPay
  | 'ai_ocr_scanner'            // Numérisation caméra OCR des registres papier
  | 'google_sheets_sync'        // Synchronisation directe avec Google Sheets
  | 'batch_reminders'           // Relances groupées d'impayés par lot
  | 'unlimited_staff'           // Gestion multi-utilisateurs avancée et rôles fins
  | 'realtime_multidevice'      // Synchronisation temps réel multi-appareils
  | 'advanced_notifications';   // Notifications push navigateur et bilans journaliers

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  requiredPlan?: SubscriptionPlan;
  featureTitle?: string;
  featureDescription?: string;
}

export interface PricingTier {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  badge?: string;
  popular?: boolean;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlySavings: number;
  currency: string;
  features: {
    name: string;
    description?: string;
    included: boolean;
    isProHighlight?: boolean;
  }[];
  ctaText: string;
}
