"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Sparkles,
  School as SchoolIcon,
  LogOut,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import {
  Step1SchoolInfo,
  Step2EducationType,
  Step3AcademicYear,
  Step4Classes,
  Step5TuitionPlans,
  Step6Users,
  Step7Notifications,
  Step8ImportData,
  Step9FinishSummary,
} from "@/components/onboarding/OnboardingSteps";
import { StaffRole, School, AcademicYear } from "@/types/scoly";

export default function OnboardingPage() {
  const router = useRouter();
  const {
    school: storeSchool,
    academicYear: storeAcademicYear,
    classes: storeClasses,
    tuitionPlans: storeTuitionPlans,
    students,
    currentUser,
    isLoaded,
    saveOnboardingStep,
    completeOnboarding,
    updateSchool,
    updateAcademicYear,
    updateClasses,
    updateTuitionPlans,
    inviteStaffMember,
    logoutUser,
  } = useScoly();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isMathValidInStep5, setIsMathValidInStep5] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Local editable state initialized from store
  const [localSchool, setLocalSchool] = useState(storeSchool);
  const [localAcademicYear, setLocalAcademicYear] = useState(storeAcademicYear);
  const [localClasses, setLocalClasses] = useState(storeClasses);
  const [localTuitionPlans, setLocalTuitionPlans] = useState(storeTuitionPlans);
  const [invitedUsers, setInvitedUsers] = useState<{ name: string; email: string; role: StaffRole }[]>([]);
  const isInitializedRef = React.useRef(false);

  // Sync state once store is loaded
  useEffect(() => {
    if (isLoaded && !isInitializedRef.current) {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      if (storeSchool.onboarding_completed) {
        router.push("/dashboard");
        return;
      }

      isInitializedRef.current = true;


      const cleanSchool: School = {
        ...storeSchool,
        name:
          storeSchool.name === "Mon Établissement Scolaire" || storeSchool.name === "Complexe Scolaire Lumière d'Afrique"
            ? ""
            : (storeSchool.name || ""),
        phone:
          !storeSchool.phone ||
          storeSchool.phone === "+228 90 00 00 00" ||
          storeSchool.phone.startsWith("+228 90 00") ||
          storeSchool.phone === "+228 90 12 34 56"
            ? ""
            : storeSchool.phone,
        address:
          storeSchool.address === "Quartier Administratif" ||
          storeSchool.address === "Boulevard du 13 Janvier, Quartier Administratif" ||
          storeSchool.address === "Rue des Écoles, Quartier Administratif"
            ? ""
            : (storeSchool.address || ""),
        city: storeSchool.city === "Lomé" ? "" : (storeSchool.city || ""),
        country: storeSchool.country === "Togo" ? "" : (storeSchool.country || ""),
      };
      setLocalSchool(cleanSchool);

      const cleanYear: AcademicYear = {
        ...storeAcademicYear,
        name:
          storeAcademicYear.name === "2025-2026" ||
          storeAcademicYear.name === "2026-2027" ||
          storeAcademicYear.name === "Année Scolaire 2025-2026"
            ? ""
            : (storeAcademicYear.name || ""),
        start_date:
          storeAcademicYear.start_date === "2025-09-15" ||
          storeAcademicYear.start_date === "2026-09-15" ||
          storeAcademicYear.start_date === "2025-09-01"
            ? ""
            : (storeAcademicYear.start_date || ""),
        end_date:
          storeAcademicYear.end_date === "2026-06-30" ||
          storeAcademicYear.end_date === "2027-06-30" ||
          storeAcademicYear.end_date === "2027-07-31" ||
          storeAcademicYear.end_date === "2026-07-31"
            ? ""
            : (storeAcademicYear.end_date || ""),
      };
      setLocalAcademicYear(cleanYear);

      const isSeedClasses =
        storeClasses.length > 0 &&
        (storeClasses.some((c) => c.name === "CI" || c.name === "6ème A" || c.name === "2nde CD") ||
          storeClasses.length === 13);
      setLocalClasses(isSeedClasses && !storeSchool.onboarding_completed ? [] : storeClasses);
      setLocalTuitionPlans(storeTuitionPlans);

      // Resume from saved step if valid
      if (storeSchool.onboarding_current_step && storeSchool.onboarding_current_step >= 1 && storeSchool.onboarding_current_step <= 9) {
        setCurrentStep(storeSchool.onboarding_current_step);
      }
    }
  }, [isLoaded, currentUser, storeSchool, storeAcademicYear, storeClasses, storeTuitionPlans, router]);

  const totalSteps = 9;

  // Step titles & meta
  const stepsMeta = [
    { number: 1, title: "Établissement", optional: false },
    { number: 2, title: "Type d'école", optional: true },
    { number: 3, title: "Année scolaire", optional: false },
    { number: 4, title: "Classes", optional: true },
    { number: 5, title: "Scolarité", optional: true },
    { number: 6, title: "Équipe", optional: true },
    { number: 7, title: "Notifications", optional: true },
    { number: 8, title: "Données", optional: true },
    { number: 9, title: "Finalisation", optional: false },
  ];

  const currentMeta = stepsMeta[currentStep - 1] || stepsMeta[0];

  // Validation before going to next step
  const canContinue = (): boolean => {
    if (currentStep === 1) {
      return Boolean(localSchool.name && localSchool.name.trim().length > 0);
    }
    if (currentStep === 3) {
      return Boolean(localAcademicYear.name && localAcademicYear.name.trim().length > 0);
    }
    if (currentStep === 5) {
      return isMathValidInStep5;
    }
    return true;
  };

  const handleNext = async () => {
    if (!canContinue()) return;

    setIsSubmitting(true);
    try {
      // 1. Update main store state immediately
      updateSchool(localSchool);
      updateAcademicYear(localAcademicYear);
      updateClasses(localClasses);
      updateTuitionPlans(localTuitionPlans);

      if (currentStep === 6 && invitedUsers.length > 0) {
        invitedUsers.forEach((u) => {
          inviteStaffMember({
            full_name: u.name,
            email: u.email,
            phone: "",
            role: u.role,
            permissions: {
              can_collect_payments: true,
              can_manage_students: true,
              can_manage_tuition: u.role === "directeur",
              can_send_reminders: true,
              can_view_financial_stats: u.role !== "secretaire",
              can_manage_settings: u.role === "directeur",
            },
          });
        });
      }

      if (currentStep < totalSteps) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        // Autosave progress
        await saveOnboardingStep(nextStep, localSchool);
      } else {
        // Step 9: Finalize onboarding with exact customized configuration
        await completeOnboarding({
          school: localSchool,
          academicYear: localAcademicYear,
          classes: localClasses,
          tuitionPlans: localTuitionPlans,
        });
        startTransition(() => {
          router.push("/dashboard?welcome=true");
        });

      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await saveOnboardingStep(nextStep, localSchool);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveOnboardingStep(prevStep, localSchool);
    }
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-900">
      
      {/* ── Top Header ────────────────────────────────────────────────────── */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-slate-900 tracking-tight">SCOLY</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-600 border border-blue-200 uppercase">
                Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Configuration de votre établissement</p>
          </div>
        </div>

        {/* User Info & Logout option */}
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
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Se déconnecter et reprendre plus tard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quitter</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl flex flex-col relative">
          
          {/* Wizard Progress Bar (Pinned / Sticky on scroll) */}
          <div className="sticky top-16 z-20 rounded-t-3xl p-5 sm:p-7 bg-slate-900 text-white space-y-3.5 shadow-lg border-b border-slate-800 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400 block mb-1">
                  Étape {currentStep} sur {totalSteps} • {currentMeta.title}
                </span>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Configuration de votre établissement
                </h1>
              </div>
              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-300">
                  {Math.round((currentStep / totalSteps) * 100)}%
                </span>
              </div>
            </div>

            {/* Stepper Progress Bar Visual */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>

            {/* Step Pills on Desktop */}
            <div className="hidden sm:flex items-center justify-between text-[10px] font-semibold text-slate-400 pt-1 overflow-x-auto">
              {stepsMeta.map((s) => {
                const isDone = currentStep > s.number;
                const isCurrent = currentStep === s.number;
                return (
                  <span
                    key={s.number}
                    className={`transition-colors whitespace-nowrap px-1 ${
                      isCurrent
                        ? "text-blue-400 font-bold"
                        : isDone
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {isDone ? `✓ ${s.title}` : s.title}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Wizard Step Content */}
          <div className="p-6 sm:p-8 lg:p-10 flex-1">
            {currentStep === 1 && (
              <Step1SchoolInfo school={localSchool} setSchool={setLocalSchool} />
            )}
            {currentStep === 2 && (
              <Step2EducationType school={localSchool} setSchool={setLocalSchool} />
            )}
            {currentStep === 3 && (
              <Step3AcademicYear academicYear={localAcademicYear} setAcademicYear={setLocalAcademicYear} />
            )}
            {currentStep === 4 && (
              <Step4Classes classes={localClasses} setClasses={setLocalClasses} school={localSchool} />
            )}
            {currentStep === 5 && (
              <Step5TuitionPlans
                classes={localClasses}
                tuitionPlans={localTuitionPlans}
                setTuitionPlans={setLocalTuitionPlans}
                currency={localSchool.currency || "FCFA"}
                onValidityChange={setIsMathValidInStep5}
              />
            )}
            {currentStep === 6 && (
              <Step6Users invitedUsers={invitedUsers} setInvitedUsers={setInvitedUsers} />
            )}
            {currentStep === 7 && (
              <Step7Notifications school={localSchool} setSchool={setLocalSchool} />
            )}
            {currentStep === 8 && (
              <Step8ImportData studentsCount={students.length} />
            )}
            {currentStep === 9 && (
              <Step9FinishSummary
                school={localSchool}
                academicYear={localAcademicYear}
                classes={localClasses}
                tuitionPlans={localTuitionPlans}
                invitedUsers={invitedUsers}
                studentsCount={students.length}
              />
            )}
          </div>

          {/* ── Wizard Footer Navigation ──────────────────────────────────── */}
          <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Précédent</span>
                </button>
              ) : (
                <div />
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentMeta.optional && currentStep < totalSteps && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-4 py-2.5 text-slate-500 hover:text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Ignorer pour le moment
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue() || isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? "Enregistrement..."
                    : currentStep === totalSteps
                    ? "Terminer la configuration"
                    : "Continuer"}
                </span>
                {currentStep === totalSteps ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ── Bottom Subtext ────────────────────────────────────────────────── */}
      <footer className="py-4 text-center text-xs text-slate-400">
        SCOLY • Vos modifications sont automatiquement sauvegardées en arrière-plan.
      </footer>

    </div>
  );
}
