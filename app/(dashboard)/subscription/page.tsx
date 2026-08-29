"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Clock,
  Check,
  X,
  CreditCard,
  Smartphone,
  PhoneCall,
  Lock,
  Calendar,
  Layers,
  FileSpreadsheet,
  Users,
  BellRing,
  QrCode,
  LineChart,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import {
  PLAN_PRICING,
  FEATURE_DEFINITIONS,
  PLAN_FEATURES,
  getTrialTimeRemaining,
} from "@/lib/subscription/features";
import { SubscriptionPlan, SubscriptionBillingPeriod, FeatureKey } from "@/types/subscription";

function SubscriptionPageContent() {
  const searchParams = useSearchParams();
  const { subscription, school, currentUser, upgradeSubscription } = useScoly();

  const [billingPeriod, setBillingPeriod] = useState<SubscriptionBillingPeriod>("yearly");
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [phoneForPayment, setPhoneForPayment] = useState(currentUser?.phone || school?.phone || "");

  // Auto-select plan from URL query param if present
  useEffect(() => {
    const planParam = searchParams?.get("plan") as SubscriptionPlan;
    if (planParam === "start" || planParam === "pro" || planParam === "premium") {
      setSelectedPlanForCheckout(planParam);
    }
  }, [searchParams]);

  const isTrial = subscription?.status === "trialing";
  const isExpired =
    subscription?.status === "expired" ||
    (isTrial && subscription?.trial_end_at && new Date() > new Date(subscription.trial_end_at));
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";
  const isStart = subscription?.plan === "start" && subscription?.status === "active";
  const isPremium = subscription?.plan === "premium" && subscription?.status === "active";

  const trialInfo = isTrial ? getTrialTimeRemaining(subscription) : null;

  // Handle Checkout submission
  const handleProceedPayment = async (plan: SubscriptionPlan) => {
    setIsProcessing(true);
    setCheckoutError(null);

    try {
      // 1. Request FedaPay checkout creation
      const res = await fetch("/api/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: school.id,
          school_name: school.name,
          plan,
          billing_period: billingPeriod,
          customer_name: currentUser?.full_name || school.name || "Directeur",
          customer_email: currentUser?.email || school.email || "directeur@scoly.tg",
          customer_phone: phoneForPayment || school.phone || "+22890000000",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible d'initialiser la transaction.");
      }

      // If FedaPay returned a redirect payment URL, redirect
      if (data.payment_url && !data.is_mock) {
        window.location.href = data.payment_url;
        return;
      }

      // 2. Instant server-side confirmation (for mock/sandbox mode or validated payments)
      const upgradeRes = await upgradeSubscription(plan, billingPeriod, data.transaction_id);
      if (!upgradeRes.success) {
        throw new Error(upgradeRes.error || "Échec de l'activation de l'abonnement.");
      }

      setCheckoutSuccess(true);
      setTimeout(() => {
        setCheckoutSuccess(false);
        setSelectedPlanForCheckout(null);
      }, 3000);
    } catch (err: any) {
      setCheckoutError(err.message || "Une erreur est survenue lors du paiement.");
    } finally {
      setIsProcessing(false);
    }
  };

  const featureList: { key: FeatureKey; name: string; icon: any; start: boolean; pro: boolean; premium: boolean }[] = [
    { key: "students_management", name: "Gestion des élèves, classes & scolarités", icon: Users, start: true, pro: true, premium: true },
    { key: "cash_receipts", name: "Encaissement en caisse & reçus REC-25 officiels", icon: QrCode, start: true, pro: true, premium: true },
    { key: "receipt_generation", name: "Génération de reçus thermiques et A4 WhatsApp", icon: Layers, start: true, pro: true, premium: true },
    { key: "basic_reminders", name: "Relances WhatsApp individuelles aux parents", icon: PhoneCall, start: true, pro: true, premium: true },
    { key: "excel_import", name: "Importation listes d'élèves Excel, CSV & PDF", icon: FileSpreadsheet, start: true, pro: true, premium: true },
    { key: "basic_dashboard", name: "Tableau de bord financier & indicateurs clés", icon: LineChart, start: true, pro: true, premium: true },
    { key: "mobile_money_fedapay", name: "Paiements en ligne Mobile Money (TMoney, Flooz)", icon: Smartphone, start: false, pro: true, premium: true },
    { key: "ai_ocr_scanner", name: "Scanner Caméra OCR des registres papier", icon: Sparkles, start: false, pro: true, premium: true },
    { key: "advanced_analytics", name: "Graphiques d'évolution et camembert financier", icon: LineChart, start: false, pro: true, premium: true },
    { key: "google_sheets_sync", name: "Synchronisation Cloud Google Sheets directe", icon: FileSpreadsheet, start: false, pro: true, premium: true },
    { key: "batch_reminders", name: "Campagnes de relances groupées par classe", icon: BellRing, start: false, pro: true, premium: true },
    { key: "unlimited_staff", name: "Comptes collaborateurs & permissions fines", icon: Users, start: false, pro: true, premium: true },
    { key: "realtime_multidevice", name: "Synchronisation temps réel multi-appareils", icon: Layers, start: false, pro: true, premium: true },
    { key: "multi_campus_management", name: "Gestion multi-campus & établissements", icon: Crown, start: false, pro: false, premium: true },
    { key: "priority_dedicated_support", name: "Support dédié prioritaire 24/7 sur WhatsApp", icon: ShieldCheck, start: false, pro: false, premium: true },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* ─── 1. PAGE HEADER ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
              <Crown className="w-5 h-5 fill-amber-500" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Abonnements & Forfaits SCOLY
            </h1>
          </div>
          <p className="text-slate-600 text-sm">
            Choisissez la formule adaptée à la taille de votre école. Essai gratuit de 30 jours complet sans engagement.
          </p>
        </div>

        {/* Security & Reliability Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-semibold shadow-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <div>Période d&apos;essai 30 jours</div>
            <div className="text-[10px] text-emerald-700 font-normal">Données sauvegardées en continu</div>
          </div>
        </div>
      </div>

      {/* ─── 2. CURRENT PLAN OVERVIEW CARD ──────────────────────────────── */}
      <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-amber-100/40 via-orange-50/20 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Votre formule actuelle
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-slate-900">
                {isExpired
                  ? "Période d'essai expirée"
                  : isPremium
                  ? "SCOLY PREMIUM"
                  : isPro
                  ? "SCOLY PRO"
                  : isStart
                  ? "SCOLY START"
                  : "Essai Gratuit 30 Jours"}
              </h2>

              <span
                className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                  isExpired
                    ? "bg-rose-100 text-rose-800 border border-rose-200"
                    : isPremium
                    ? "bg-purple-100 text-purple-900 border border-purple-300"
                    : isPro
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : isStart
                    ? "bg-blue-100 text-blue-800 border border-blue-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                {subscription?.status === "active" ? "Actif" : isTrial ? "Essai" : "Inactif"}
              </span>
            </div>

            <p className="text-slate-600 text-xs sm:text-sm mt-1">
              {isExpired ? (
                <span className="text-rose-600 font-medium">
                  Votre période d&apos;essai de 30 jours est terminée. Vos données sont conservées. Choisissez un forfait pour débloquer votre espace.
                </span>
              ) : isTrial ? (
                <span>
                  Il vous reste <strong className="text-emerald-700 font-bold">{trialInfo?.daysRemaining} jour(s)</strong> pour tester toutes les fonctionnalités sans restriction.
                </span>
              ) : isPremium ? (
                <span>
                  Formule intégrale active. Gestion multi-campus et support prioritaire 24/7.
                </span>
              ) : isPro ? (
                <span>
                  Vous bénéficiez de toutes les fonctionnalités avancées, Mobile Money et scanner OCR.
                </span>
              ) : (
                <span>
                  Forfait START actif jusqu&apos;à 100 élèves. Encaissements et reçus certifiés en caisse.
                </span>
              )}
            </p>
          </div>

          {/* Details / Dates */}
          <div className="flex flex-wrap items-center gap-4 text-xs">
            {isTrial && subscription?.trial_end_at && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-400 font-medium flex items-center gap-1 mb-0.5">
                  <Clock className="w-3.5 h-3.5" /> Fin de l&apos;essai gratuit
                </div>
                <div className="font-bold text-slate-800">
                  {new Date(subscription.trial_end_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}

            {subscription?.status === "active" && subscription.subscription_end_at && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-slate-400 font-medium flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3.5 h-3.5" /> Prochain renouvellement
                </div>
                <div className="font-bold text-slate-800">
                  {new Date(subscription.subscription_end_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── 3. BILLING PERIOD TOGGLE (-30% ANNUEL) ────────────────────── */}
      <div className="flex flex-col items-center justify-center gap-3 pt-2">
        <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl border border-slate-300">
          <button
            type="button"
            onClick={() => setBillingPeriod("monthly")}
            className={`px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              billingPeriod === "monthly"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Paiement Mensuel
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod("yearly")}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              billingPeriod === "yearly"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Paiement Annuel</span>
            <span className="px-2 py-0.5 text-[10px] font-black uppercase bg-amber-400 text-slate-950 rounded-md tracking-wider">
              -30%
            </span>
          </button>
        </div>

        <p className="text-xs text-slate-500 text-center">
          {billingPeriod === "yearly" ? (
            <span className="text-emerald-700 font-semibold">
              ✨ 12 mois payés en 1 fois avec 30% d&apos;économie par rapport au tarif mensuel.
            </span>
          ) : (
            <span>Paiement au mois le mois, renouvelable sans engagement.</span>
          )}
        </p>
      </div>

      {/* ─── 4. PRICING CARDS (START, PRO, PREMIUM) ──────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
        {/* 1. START TIER */}
        <div
          className={`relative p-6 sm:p-7 bg-white border-2 rounded-3xl shadow-sm transition-all flex flex-col justify-between ${
            isStart ? "border-blue-500 ring-4 ring-blue-50" : "border-slate-200 hover:border-slate-300"
          }`}
        >
          {isStart && (
            <div className="absolute -top-3.5 left-6 px-3 py-1 bg-blue-600 text-white text-[11px] font-bold uppercase rounded-full shadow-sm">
              Votre formule
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                100 élèves max
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">SCOLY START</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              L&apos;essentiel pour informatiser vos inscriptions, gérer vos scolarités et émettre des reçus officiels.
            </p>

            {/* Price calculation */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl mb-5">
              {billingPeriod === "monthly" ? (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">5 000</span>
                    <span className="text-xs font-semibold text-slate-600">FCFA / mois</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Facturé 5 000 FCFA chaque mois
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">42 000</span>
                    <span className="text-xs font-semibold text-slate-600">FCFA / an</span>
                  </div>
                  <div className="text-xs text-emerald-700 font-bold mt-0.5">
                    Soit 3 500 FCFA / mois (-30%)
                  </div>
                </div>
              )}
            </div>

            {/* Features list */}
            <div className="space-y-2.5 mb-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Inclus dans START :
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Jusqu&apos;à 100 élèves</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Encaissement caisse & reçus REC-25</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Relances WhatsApp individuelles</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Import fichiers Excel, CSV & PDF</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedPlanForCheckout("start")}
            disabled={isStart && subscription?.billing_period === billingPeriod}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isStart && subscription?.billing_period === billingPeriod
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
            }`}
          >
            <span>
              {isStart
                ? subscription?.billing_period === billingPeriod
                  ? "Forfait Actif"
                  : "Basculer vers START " + (billingPeriod === "yearly" ? "Annuel" : "Mensuel")
                : "Choisir START"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. PRO TIER */}
        <div
          className={`relative p-6 sm:p-7 bg-gradient-to-b from-amber-50/40 via-white to-orange-50/20 border-2 rounded-3xl shadow-lg transition-all flex flex-col justify-between ${
            isPro ? "border-amber-500 ring-4 ring-amber-100" : "border-amber-400 hover:border-amber-500"
          }`}
        >
          <div className="absolute -top-3.5 right-6 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Recommandé
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-amber-100 text-amber-900 rounded-lg border border-amber-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                500 élèves max
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">SCOLY PRO</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Pour automatiser la collecte, encaisser par Mobile Money et numériser par caméra OCR.
            </p>

            {/* Price calculation */}
            <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl mb-5">
              {billingPeriod === "monthly" ? (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">10 000</span>
                    <span className="text-xs font-semibold text-slate-600">FCFA / mois</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Facturé 10 000 FCFA chaque mois
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">84 000</span>
                    <span className="text-xs font-semibold text-slate-600">FCFA / an</span>
                  </div>
                  <div className="text-xs text-emerald-700 font-bold mt-0.5">
                    Soit 7 000 FCFA / mois (-30%)
                  </div>
                </div>
              )}
            </div>

            {/* Features list */}
            <div className="space-y-2.5 mb-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 font-semibold">
                Tout START, plus :
              </div>
              <ul className="space-y-2 text-xs text-slate-800 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 font-black shrink-0" />
                  <span>Jusqu&apos;à 500 élèves enregistrés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 font-black shrink-0" />
                  <span>Paiements en ligne FedaPay (TMoney, Flooz)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 font-black shrink-0" />
                  <span>Scanner Caméra OCR des registres</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-amber-600 font-black shrink-0" />
                  <span>Synchronisation temps réel multi-postes</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedPlanForCheckout("pro")}
            disabled={isPro && subscription?.billing_period === billingPeriod}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isPro && subscription?.billing_period === billingPeriod
                ? "bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-300"
                : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-500/25"
            }`}
          >
            <Crown className="w-3.5 h-3.5 fill-white" />
            <span>
              {isPro
                ? subscription?.billing_period === billingPeriod
                  ? "Forfait Actif"
                  : "Renouveler PRO " + (billingPeriod === "yearly" ? "Annuel" : "Mensuel")
                : "Passer à PRO"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. PREMIUM TIER */}
        <div
          className={`relative p-6 sm:p-7 bg-white border-2 rounded-3xl shadow-sm transition-all flex flex-col justify-between ${
            isPremium ? "border-purple-500 ring-4 ring-purple-50" : "border-slate-200 hover:border-purple-300"
          }`}
        >
          {isPremium && (
            <div className="absolute -top-3.5 left-6 px-3 py-1 bg-purple-600 text-white text-[11px] font-bold uppercase rounded-full shadow-sm">
              Votre formule
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase bg-purple-50 text-purple-700 rounded-lg border border-purple-200">
                1 500 élèves max
              </span>
            </div>

            <h3 className="text-xl font-black text-slate-900 mb-1">SCOLY PREMIUM</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              La solution intégrale pour les grands groupes scolaires, complexes et multi-établissements.
            </p>

            {/* Price calculation */}
            <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-2xl mb-5">
              {billingPeriod === "monthly" ? (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">25 000</span>
                    <span className="text-xs font-semibold text-slate-600">FCFA / mois</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Facturé 25 000 FCFA chaque mois
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">210 000</span>
                    <span className="text-xs font-semibold text-slate-600">FCFA / an</span>
                  </div>
                  <div className="text-xs text-emerald-700 font-bold mt-0.5">
                    Soit 17 500 FCFA / mois (-30%)
                  </div>
                </div>
              )}
            </div>

            {/* Features list */}
            <div className="space-y-2.5 mb-6">
              <div className="text-[10px] font-bold uppercase tracking-wider text-purple-900 font-semibold">
                Tout PRO, plus :
              </div>
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 font-black shrink-0" />
                  <span>Jusqu&apos;à 1 500 élèves</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 font-black shrink-0" />
                  <span>Gestion multi-campus centralisée</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 font-black shrink-0" />
                  <span>Support prioritaire dédié 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600 font-black shrink-0" />
                  <span>Formation complète de vos équipes</span>
                </li>
              </ul>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedPlanForCheckout("premium")}
            disabled={isPremium && subscription?.billing_period === billingPeriod}
            className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isPremium && subscription?.billing_period === billingPeriod
                ? "bg-purple-100 text-purple-700 cursor-not-allowed border border-purple-300"
                : "bg-purple-600 hover:bg-purple-700 text-white shadow-sm shadow-purple-600/20"
            }`}
          >
            <span>
              {isPremium
                ? subscription?.billing_period === billingPeriod
                  ? "Forfait Actif"
                  : "Renouveler PREMIUM " + (billingPeriod === "yearly" ? "Annuel" : "Mensuel")
                : "Choisir PREMIUM"}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── 5. FULL FEATURES COMPARISON MATRIX ──────────────────────── */}
      <div className="max-w-6xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-2">
          Tableau comparatif détaillé
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Comparez en un coup d&apos;œil toutes les capacités des formules SCOLY.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Fonctionnalité</th>
                <th className="py-3 px-4 text-center w-28">START</th>
                <th className="py-3 px-4 text-center w-28 text-amber-700 bg-amber-50/50 rounded-t-xl">
                  PRO
                </th>
                <th className="py-3 px-4 text-center w-28 text-purple-700 bg-purple-50/50 rounded-t-xl">
                  PREMIUM
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {featureList.map((f) => {
                const Icon = f.icon;
                return (
                  <tr key={f.key} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-slate-800">{f.name}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {f.start ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 inline-block" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 inline-block" />
                      )}
                    </td>

                    <td className="py-3 px-4 text-center bg-amber-50/30">
                      {f.pro ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-600 inline-block" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 inline-block" />
                      )}
                    </td>

                    <td className="py-3 px-4 text-center bg-purple-50/30">
                      {f.premium ? (
                        <CheckCircle2 className="w-5 h-5 text-purple-600 inline-block" />
                      ) : (
                        <X className="w-5 h-5 text-slate-300 inline-block" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── 6. CHECKOUT MODAL (FEDAPAY MOBILE MONEY) ────────────────── */}
      {selectedPlanForCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-lg overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Règlement de votre abonnement</h4>
                  <p className="text-xs text-slate-400">Paiement sécurisé via Mobile Money</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPlanForCheckout(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {checkoutSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h5 className="text-lg font-bold text-slate-900">Abonnement activé avec succès !</h5>
                  <p className="text-xs text-slate-600">
                    Votre établissement bénéficie désormais de la formule SCOLY {selectedPlanForCheckout.toUpperCase()}.
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Formule choisie :</span>
                      <strong className="text-slate-900 uppercase">SCOLY {selectedPlanForCheckout}</strong>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Fréquence :</span>
                      <span className="font-semibold text-slate-900">
                        {billingPeriod === "yearly" ? "Annuel (-30%)" : "Mensuel"}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-slate-900">Montant à régler :</span>
                      <span className="text-xl font-black text-slate-900">
                        {PLAN_PRICING[selectedPlanForCheckout][billingPeriod].toLocaleString("fr-FR")} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Phone input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Numéro Mobile Money (T-Money, Flooz, MoMo, Orange, Moov) :
                    </label>
                    <input
                      type="tel"
                      value={phoneForPayment}
                      onChange={(e) => setPhoneForPayment(e.target.value)}
                      placeholder="+228 90 00 00 00"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  {checkoutError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                      {checkoutError}
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanForCheckout(null)}
                      className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleProceedPayment(selectedPlanForCheckout)}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Paiement en cours...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Confirmer le paiement</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SubscriptionPageContent />
    </React.Suspense>
  );
}
