"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
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

  // Sync and smart resume based on existing real data
  useEffect(() => {
    if (isLoaded && !isInitializedRef.current) {
      if (!currentUser) {
        router.replace("/login");
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

  const handleStepChange = async (newStep: number) => {
    setCurrentStep(newStep);
    await saveOnboardingStep(newStep, school);
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
      startTransition(() => {
        router.replace("/dashboard?welcome=true");
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipAll = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding();
      startTransition(() => {
        router.replace("/dashboard");
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPayment = () => {
    setIsPaymentModalOpen(true);
  };

  // Synchronous protection: NEVER render onboarding while loading or unauthenticated
  if (!isLoaded || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900">
      {/* ── Top Header Sobre ────────────────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-xs">
            S
          </div>
          <div>
            <span className="font-extrabold text-xs text-slate-900 tracking-tight">SCOLY</span>
            <span className="text-[10px] text-slate-400 font-medium ml-2 hidden sm:inline">
              {school.name || "Mon Établissement"}
            </span>
          </div>
        </div>

        {/* Right Actions: Skip & Logout */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSkipAll}
            disabled={isSubmitting}
            className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-semibold transition-colors cursor-pointer border border-slate-200"
          >
            Passer pour l&apos;instant
          </button>

          <button
            type="button"
            onClick={async () => {
              await logoutUser();
              router.replace("/login");
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* ── Stepper Header Sobre ────────────────────────────────────────── */}
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Étape {currentStep} sur {totalSteps}
              </span>
              <span className="text-xs font-extrabold text-slate-700">
                {Math.round((currentStep / totalSteps) * 100)}%
              </span>
            </div>

            {/* Stepper Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-200 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* 3 Step Tabs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {stepsMeta.map((s) => {
                const isDone = currentStep > s.number;
                const isCurrent = currentStep === s.number;
                return (
                  <button
                    key={s.number}
                    type="button"
                    onClick={() => {
                      if (s.number < currentStep || (s.number === 2 && students.length > 0)) {
                        handleStepChange(s.number);
                      }
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl text-left transition-all ${
                      isCurrent
                        ? "bg-white text-slate-900 font-bold border border-slate-300 shadow-2xs"
                        : isDone
                        ? "text-emerald-700 font-semibold hover:bg-white/80 cursor-pointer"
                        : "text-slate-400 opacity-60 cursor-not-allowed"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold ${
                        isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : isCurrent
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : s.number}
                    </div>
                    <span className="truncate hidden sm:inline">{s.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Step Body Content ────────────────────────────────────────── */}
          <div className="p-5 sm:p-7 flex-1">
            {currentStep === 1 && (
              <Step1ImportStudents
                onContinue={() => handleStepChange(2)}
                onSkip={handleSkipAll}
              />
            )}
            {currentStep === 2 && (
              <Step2SetupTuition
                onContinue={() => handleStepChange(3)}
                onSkip={handleSkipAll}
              />
            )}
            {currentStep === 3 && (
              <Step3ReadyPayments
                onFinish={handleFinish}
                onOpenPayment={handleOpenPayment}
              />
            )}
          </div>

          {/* ── Step Footer Navigation ───────────────────────────────────── */}
          {currentStep > 1 && currentStep < 3 && (
            <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleStepChange(currentStep - 1)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Étape précédente</span>
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Bottom Subtext Sobre ──────────────────────────────────────────── */}
      <footer className="py-3 text-center text-[11px] text-slate-400">
        SCOLY • Gestion scolaire simplifiée
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
          handleFinish();
        }}
      />
    </div>
  );
}
