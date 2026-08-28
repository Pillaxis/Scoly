"use client";

import React, { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { LandingCTAButton } from "@/components/marketing/LandingCTAButton";

export function LandingPricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="tarifs" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4 border border-blue-100">
            Tarifs
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Choisissez votre plan
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Commencez gratuitement, évoluez selon vos besoins
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-8 inline-flex items-center gap-2 p-1.5 rounded-full bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                !isYearly
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Mensuel
            </button>

            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                isYearly
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Annuel</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${
                  isYearly ? "bg-amber-400 text-slate-950" : "bg-blue-100 text-blue-800"
                }`}
              >
                -30%
              </span>
            </button>
          </div>
        </div>

        {/* 2 Pricing Cards Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Card 1: START (Left, Standard) */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-left">
            <div>
              {/* Plan Title */}
              <h3 className="text-xl font-black text-slate-900 text-center">
                START
              </h3>

              {/* Price Display */}
              <div className="mt-4 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                    {isYearly ? "42 000" : "5 000"}
                  </span>
                  <span className="text-xs font-bold text-slate-500">FCFA</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {isYearly ? "/ an" : "/ mois"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isYearly
                    ? "Économisez 18 000 FCFA (soit 3 500 FCFA / mois)"
                    : "Pour gérer simplement vos élèves et encaissements"}
                </p>
              </div>

              {/* Features List */}
              <div className="mt-8 space-y-3.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Gestion complète des élèves et classes</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Encaissements Espèces, Chèques et Virements</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Reçus certifiés et impression instantanée</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Grilles tarifaires et tranches de scolarité</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Relances individuelles d&apos;impayés</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Importation de fichiers Excel et CSV</span>
                </div>
              </div>
            </div>

            {/* Bottom Button with Snappy Feedback */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center">
              <LandingCTAButton
                href="/register?plan=start"
                variant="secondary"
                showArrow={false}
                className="w-full py-3.5 rounded-2xl"
              >
                Commencer gratuitement
              </LandingCTAButton>
              <p className="mt-2.5 text-center text-[11px] text-slate-400 font-medium">
                15 jours d&apos;essai gratuit inclus
              </p>
            </div>
          </div>

          {/* Card 2: PRO (Right, Highlighted with 'Le plus populaire') */}
          <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-blue-600 shadow-xl shadow-blue-900/5 flex flex-col justify-between text-left relative">
            {/* Top Badge: 'Le plus populaire' */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black tracking-wide shadow-sm uppercase">
              Le plus populaire
            </div>

            <div>
              {/* Plan Title */}
              <h3 className="text-xl font-black text-slate-900 text-center">
                PRO
              </h3>

              {/* Price Display */}
              <div className="mt-4 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                    {isYearly ? "84 000" : "10 000"}
                  </span>
                  <span className="text-xs font-bold text-blue-700">FCFA</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {isYearly ? "/ an" : "/ mois"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isYearly
                    ? "Économisez 36 000 FCFA (soit 7 000 FCFA / mois)"
                    : "Pour les établissements exigeants"}
                </p>
              </div>

              {/* Features List */}
              <div className="mt-8 space-y-3.5 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-3 font-semibold text-blue-900">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Tout ce qui est inclus dans START</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Scanner IA & OCR pour registres papier</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Encaissements Mobile Money (TMoney, Flooz)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Tableau de bord financier et prévisions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Centre d&apos;actions urgentes et alertes</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Synchronisation Google Sheets automatique</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Relances groupées WhatsApp et SMS</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Multi-utilisateurs et permissions par rôle</span>
                </div>
              </div>
            </div>

            {/* Bottom Button with Snappy Feedback */}
            <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center">
              <LandingCTAButton
                href="/register?plan=pro"
                variant="primary"
                showArrow={false}
                className="w-full py-3.5 rounded-2xl"
              >
                Essayer PRO gratuitement
              </LandingCTAButton>
              <p className="mt-2.5 text-center text-[11px] text-blue-700 font-medium">
                15 jours d&apos;essai gratuit complet • Sans carte
              </p>
            </div>
          </div>
        </div>

        {/* 30-Day Guarantee Banner */}
        <div className="mt-12 max-w-xl mx-auto p-4 rounded-2xl bg-blue-50 border border-blue-200 text-center flex items-center justify-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
          <span className="text-xs text-blue-900 font-bold">
            Garantie 30 jours satisfait ou remboursé après tout paiement
          </span>
        </div>
      </div>
    </section>
  );
}
