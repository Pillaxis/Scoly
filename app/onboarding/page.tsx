"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  School as SchoolIcon,
  LogOut,
  FileSpreadsheet,
  Calculator,
  CreditCard,
  Check,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import {
  Step1ImportStudents,
  Step2SetupTuition,
  Step3ReadyPayments,
} from "@/components/onboarding/OnboardingSteps";
import { Payment } from "@/types/scoly";

const PaymentModal = dynamic(
  () => import("@/components/payments/PaymentModal").then((m) => ({ default: m.PaymentModal })),
  { ssr: false }
);
const ReceiptModal = dynamic(
  () => import("@/components/payments/ReceiptModal").then((m) => ({ default: m.ReceiptModal })),
  { ssr: false }
);

export default function OnboardingPage() {
  const router = useRouter();
  const {
    school,
    students,
    classes,
    tuitionPlans,
    currentUser,
    isLoaded,
    saveOnboardingStep,
    completeOnboarding,
    logoutUser,
  } = useScoly();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Payment modal state for Step 3 instant payment
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [lastPayment, setLastPayment] = useState<Payment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const isInitializedRef = React.useRef(false);

  // Sync and smart resume based on existing data
  useEffect(() => {
    if (isLoaded && !isInitializedRef.current) {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (school.onboarding_completed) {
        router.push("/dashboard");
        return;
      }

      isInitializedRef.current = true;

      // Smart resume logic:
      // If user already has students & tuition plans configured -> Step 3
      // Else if user already has students -> Step 2
      // Else -> Step 1 (or stored step)
      if (students.length > 0 && tuitionPlans.some((tp) => tp.total_amount > 0)) {
        setCurrentStep(3);
      } else if (students.length > 0) {
        setCurrentStep(2);
      } else if (school.onboarding_current_step && school.onboarding_current_step >= 1 && school.onboarding_current_step <= 3) {
        setCurrentStep(school.onboarding_current_step);
      } else {
        setCurrentStep(1);
      }
    }
  }, [isLoaded, currentUser, school, students.length, tuitionPlans, router]);

  const totalSteps = 3;

  const stepsMeta = [
    { number: 1, title: "Importer les élèves", icon: FileSpreadsheet },
    { number: 2, title: "Configurer les tarifs", icon: Calculator },
    { number: 3, title: "Enregistrer les paiements", icon: CreditCard },
  ];

  const currentMeta = stepsMeta[currentStep - 1] || stepsMeta[0];

  const handleStepChange = async (newStep: number) => {
    setCurrentStep(newStep);
    await saveOnboardingStep(newStep, school);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
      startTransition(() => {
        router.push("/dashboard?welcome=true");
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPayment = () => {
    setIsPaymentModalOpen(true);
  };

  if (!isLoaded || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Chargement de votre espace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-between font-sans text-slate-900">
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">SCOLY</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Démarrage rapide
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {school.name || "Mon Établissement Scolaire"}
            </p>
          </div>
        </div>

        {/* Right Info & Logout */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 hidden sm:inline">
            Connecté en tant que <strong className="text-slate-800 font-bold">{currentUser.email}</strong>
          </span>
          <button
            type="button"
            onClick={async () => {
              await logoutUser();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
            title="Se déconnecter et reprendre plus tard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline font-semibold">Quitter</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl flex flex-col overflow-hidden">
          {/* ── Stepper Header (3 Steps) ─────────────────────────────────── */}
          <div className="bg-slate-900 text-white p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 block mb-1">
                  Étape {currentStep} sur {totalSteps} • {currentMeta.title}
                </span>
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white">
                  {currentStep === 1 && "Importez vos données d'élèves"}
                  {currentStep === 2 && "Définissez la scolarité par classe"}
                  {currentStep === 3 && "Votre école est prête à encaisser"}
                </h1>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-blue-400">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* 3 Step Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-xs">
              {stepsMeta.map((s) => {
                const isDone = currentStep > s.number;
                const isCurrent = currentStep === s.number;
                const Icon = s.icon;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      // Allow jumping to previous completed steps
                      if (s.number < currentStep || (s.number === 2 && students.length > 0)) {
                        handleStepChange(s.number);
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                      isCurrent
                        ? "bg-white/15 text-white font-bold border border-white/20"
                        : isDone
                        ? "text-emerald-400 font-semibold hover:bg-white/5 cursor-pointer"
                        : "text-slate-500 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-400"
                          : isCurrent
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.number}
                    </div>
                    <span className="truncate hidden sm:inline">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Step Body Content ────────────────────────────────────────── */}
          <div className="p-6 sm:p-8 lg:p-10 flex-1">
            {currentStep === 1 && (
              <Step1ImportStudents onContinue={() => handleStepChange(2)} />
            )}
            {currentStep === 2 && (
              <Step2SetupTuition onContinue={() => handleStepChange(3)} />
            )}
            {currentStep === 3 && (
              <Step3ReadyPayments
                onFinish={handleFinish}
                onOpenPayment={handleOpenPayment}
              />
            )}
          </div>

          {/* ── Step Footer Navigation ───────────────────────────────────── */}
          {currentStep < 3 && (
            <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => handleStepChange(currentStep - 1)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Étape précédente</span>
                  </button>
                )}
              </div>

              <div>
                {currentStep === 1 && students.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleStepChange(2)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <span>Passer aux tarifs</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ── Bottom Subtext ────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-xs text-slate-400">
        SCOLY • Vos données sont automatiquement enregistrées en temps réel dans votre espace sécurisé.
      </footer>

      {/* Payment Modal if launched from Step 3 */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={(newPayment) => {
          setLastPayment(newPayment);
          setIsReceiptModalOpen(true);
        }}
      />

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        payment={lastPayment}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setLastPayment(null);
          // Redirect to dashboard after completing first payment test
          handleFinish();
        }}
      />
    </div>
  );
}
