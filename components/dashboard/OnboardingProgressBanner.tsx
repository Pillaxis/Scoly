"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, ArrowRight, X, Sparkles } from "lucide-react";
import { useScoly } from "@/lib/store";

export function OnboardingProgressBanner() {
  const { students, tuitionPlans, payments } = useScoly();
  const [isDismissed, setIsDismissed] = useState(false);

  const hasStudents = students.length > 0;
  const hasTuition = tuitionPlans.some((tp) => tp.total_amount > 0);
  const hasPayments = payments.length > 0;

  const isAllComplete = hasStudents && hasTuition && hasPayments;

  // Don't show if all 3 actions are completed or if dismissed
  if (isAllComplete || isDismissed) {
    return null;
  }

  const completedCount = [hasStudents, hasTuition, hasPayments].filter(Boolean).length;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0 font-bold">
          {completedCount}/3
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">Guide de démarrage :</span>
            <span className="text-slate-500 hidden md:inline">
              Configurez votre établissement à votre rythme.
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 flex-wrap">
            <span className={`inline-flex items-center gap-1 ${hasStudents ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
              {hasStudents ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 text-slate-400" />}
              <span>1. Élèves {hasStudents ? `(${students.length})` : ""}</span>
            </span>

            <span className="text-slate-300">•</span>

            <span className={`inline-flex items-center gap-1 ${hasTuition ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
              {hasTuition ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 text-slate-400" />}
              <span>2. Tarifs</span>
            </span>

            <span className="text-slate-300">•</span>

            <span className={`inline-flex items-center gap-1 ${hasPayments ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
              {hasPayments ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Circle className="w-3.5 h-3.5 text-slate-400" />}
              <span>3. Paiements</span>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <Link
          href="/onboarding"
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center gap-1.5"
        >
          <span>Continuer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title="Masquer le rappel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
