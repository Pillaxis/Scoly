/**
 * SCOLY SaaS Subscription System Type Definitions
 * 
 * Defines plans:
 * - START : 5 000 FCFA/mois | 42 000 FCFA/an (-30%) | 100 élèves max
 * - PRO : 10 000 FCFA/mois | 84 000 FCFA/an (-30%) | 500 élèves max
 * - PREMIUM : 25 000 FCFA/mois | 210 000 FCFA/an (-30%) | 1 500 élèves max
 * - Essai Gratuit : 30 jours
 */

export type SubscriptionPlan = 'start' | 'pro' | 'premium';

export type SubscriptionBillingPeriod = 'monthly' | 'yearly';

export type SubscriptionStatus =
  | 'trialing'   // Période d'essai gratuit de 30 jours
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
  cancelled_at?: string | null;
  last_payment_reference?: string | null;
  last_payment_method?: string | null;
  payment_provider?: string | null;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

/**
 * Plan Student Quotas
 */
export const PLAN_STUDENT_LIMITS: Record<SubscriptionPlan, number> = {
  start: 100,
  pro: 500,
  premium: 1500,
};

/**
 * Feature keys based on REAL SCOLY features
 */
export type FeatureKey =
  // --- START, PRO & PREMIUM Features ---
  | 'students_management'       // Fiches élèves, classes
  | 'parents_contacts'          // Répertoire et coordonnées parents
  | 'tuition_management'        // Grilles tarifaires et tranches par classe
  | 'cash_receipts'             // Encaissements & Reçus
  | 'receipt_generation'        // Reçus numérotés et partage WhatsApp
  | 'basic_reminders'           // Relances individuelles WhatsApp / SMS
  | 'basic_dashboard'           // Indicateurs clés (Total encaissé, Reste, Taux)
  | 'excel_import'              // Import standard fichier Excel / CSV
  | 'basic_notifications'       // Centre de notifications standard
  
  // --- PRO & PREMIUM Features ---
  | 'advanced_analytics'        // Graphique d'évolution du CA & ventilation avancée
  | 'student_status_donut'      // Camembert visuel d'état financier des élèves
  | 'smart_action_center'       // Centre d'actions urgentes avec priorisation
  | 'mobile_money_fedapay'      // Encaissement en ligne automatisé Mobile Money
  | 'ai_ocr_scanner'            // Numérisation caméra OCR des registres
  | 'google_sheets_sync'        // Synchronisation directe avec Google Sheets
  | 'batch_reminders'           // Relances groupées d'impayés
  | 'unlimited_staff'           // Gestion multi-utilisateurs et permissions
  | 'realtime_multidevice'      // Synchronisation temps réel multi-appareils
  | 'advanced_notifications'    // Notifications push navigateur et bilans
  
  // --- PREMIUM Exclusive Features ---
  | 'multi_campus_management'   // Gestion multi-sites / campus
  | 'priority_dedicated_support'; // Support prioritaire dédié 24/7

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
  maxStudents: number;
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
