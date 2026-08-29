"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Clock, AlertTriangle, ArrowRight, X, ShieldCheck } from "lucide-react";
import { useScoly } from "@/lib/store";
import { getTrialTimeRemaining } from "@/lib/subscription/features";

export function TrialCountdownBanner() {
  const { subscription } = useScoly();
  const [isDismissed, setIsDismissed] = useState(false);

  if (!subscription || subscription.status !== "trialing" || isDismissed) {
    return null;
  }

  const trialInfo = getTrialTimeRemaining(subscription);
  const isUrgent = trialInfo.daysRemaining <= 3;
  const isHalfTime = trialInfo.daysRemaining <= 7 && !isUrgent;

  // Banner color theme based on urgency
  let bgClasses = "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 border-emerald-300 text-emerald-950";
  let badgeClasses = "bg-emerald-100 text-emerald-800 border-emerald-200";
  let buttonClasses = "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20";
  let IconComponent = Sparkles;

  if (trialInfo.isExpired) {
    bgClasses = "bg-gradient-to-r from-rose-500/15 via-red-500/15 to-rose-500/15 border-rose-300 text-rose-950";
    badgeClasses = "bg-rose-100 text-rose-800 border-rose-200";
    buttonClasses = "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20";
    IconComponent = AlertTriangle;
  } else if (isUrgent) {
    bgClasses = "bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/15 border-amber-300 text-amber-950";
    badgeClasses = "bg-amber-100 text-amber-900 border-amber-200";
    buttonClasses = "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20";
    IconComponent = Clock;
  } else if (isHalfTime) {
    bgClasses = "bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-amber-200 text-amber-900";
    badgeClasses = "bg-amber-100 text-amber-800 border-amber-200";
    buttonClasses = "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20";
    IconComponent = Clock;
  }

  return (
    <div
      className={`relative w-full border-b transition-all animate-in slide-in-from-top duration-300 ${bgClasses}`}
      role="region"
      aria-label="Statut de l'essai gratuit"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        {/* Left Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`p-1.5 rounded-lg border shrink-0 ${badgeClasses}`}>
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <span className="font-bold">
              {trialInfo.isExpired
                ? "Période d'essai terminée"
                : `Essai gratuit SCOLY PRO : encore ${trialInfo.daysRemaining} jour${trialInfo.daysRemaining > 1 ? "s" : ""}`}
            </span>
            <span className="text-slate-600 text-xs hidden md:inline">
              — {trialInfo.message}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1 text-[11px] text-slate-600 bg-white/60 px-2 py-1 rounded-md border border-black/5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>30 jours d&apos;essai gratuit</span>
          </div>

          <Link
            href="/subscription"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95 ${buttonClasses}`}
          >
            <span>{trialInfo.isExpired ? "Choisir un forfait" : "Voir les forfaits"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {!trialInfo.isExpired && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-500 hover:text-slate-800 rounded-md hover:bg-black/5 transition-colors"
              title="Masquer le bandeau"
              aria-label="Masquer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
