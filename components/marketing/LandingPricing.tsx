"use client";

import React, { useState } from "react";
import { Check, ShieldCheck, Sparkles, Crown, Award } from "lucide-react";
import { LandingCTAButton } from "@/components/marketing/LandingCTAButton";

export function LandingPricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="tarifs" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4 border border-blue-100">
            Tarifs Transparents
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Des forfaits simples et adaptés à chaque école
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            30 jours d&apos;essai gratuit sans engagement. Choisissez la formule adaptée à la taille de votre école.
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

        {/* 3 Pricing Cards Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {/* Card 1: START */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-left">
            <div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                  Jusqu&apos;à 100 élèves
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  START
                </h3>
              </div>

              <div className="mt-4 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-mono text-3xl font-black text-slate-900">
                    {isYearly ? "42 000" : "5 000"}
                  </span>
                  <span className="text-xs font-bold text-slate-500">FCFA</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {isYearly ? "/ an" : "/ mois"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isYearly ? "Soit 3 500 FCFA / mois (-30%)" : "Pour démarrer simplement"}
                </p>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Jusqu&apos;à 100 élèves enregistrés</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Gestion complète des classes & scolarités</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Encaissements caisse & reçus REC-25</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Relances individuelles WhatsApp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Tableau de bord financier de base</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
                  <span>Import fichiers Excel, CSV & PDF</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
              <LandingCTAButton
                href="/register?plan=start"
                variant="secondary"
                showArrow={false}
                className="w-full py-3 rounded-xl text-xs"
              >
                Essayer 30 jours gratuits
              </LandingCTAButton>
              <p className="mt-2 text-center text-[10px] text-slate-400 font-medium">
                Sans carte bancaire requise
              </p>
            </div>
          </div>

          {/* Card 2: PRO */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white border-2 border-blue-600 shadow-xl shadow-blue-900/5 flex flex-col justify-between text-left relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wide shadow-sm uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Recommandé
            </div>

            <div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200">
                  Jusqu&apos;à 500 élèves
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  PRO
                </h3>
              </div>

              <div className="mt-4 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-mono text-3xl font-black text-slate-900">
                    {isYearly ? "84 000" : "10 000"}
                  </span>
                  <span className="text-xs font-bold text-blue-700">FCFA</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {isYearly ? "/ an" : "/ mois"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isYearly ? "Économisez 36 000 FCFA (-30%)" : "Pour les écoles en croissance"}
                </p>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 font-bold text-blue-900">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Jusqu&apos;à 500 élèves enregistrés</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Toutes les fonctionnalités START incluses</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Scanner Caméra OCR des registres papier</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Encaissement Mobile Money en ligne (FedaPay)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Synchronisation Google Sheets en direct</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Relances groupées par classe</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  <span>Multi-utilisateurs & Synchronisation temps réel</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
              <LandingCTAButton
                href="/register?plan=pro"
                variant="primary"
                showArrow={false}
                className="w-full py-3 rounded-xl text-xs"
              >
                Essayer PRO 30 jours
              </LandingCTAButton>
              <p className="mt-2 text-center text-[10px] text-blue-700 font-medium">
                Accès complet immédiat • Sans engagement
              </p>
            </div>
          </div>

          {/* Card 3: PREMIUM */}
          <div className="p-7 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between text-left">
            <div>
              <div className="text-center">
                <span className="text-[10px] font-bold uppercase px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full border border-purple-200">
                  Jusqu&apos;à 1 500 élèves
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-2">
                  PREMIUM
                </h3>
              </div>

              <div className="mt-4 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-mono text-3xl font-black text-slate-900">
                    {isYearly ? "210 000" : "25 000"}
                  </span>
                  <span className="text-xs font-bold text-slate-500">FCFA</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {isYearly ? "/ an" : "/ mois"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {isYearly ? "Économisez 90 000 FCFA (-30%)" : "Pour les grands groupes scolaires"}
                </p>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 font-bold text-purple-900">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>Jusqu&apos;à 1 500 élèves enregistrés</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>Toutes les fonctionnalités PRO incluses</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>Gestion multi-campus & établissements</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>Support dédié prioritaire 24/7 sur WhatsApp</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>Formation complète de vos équipes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-purple-600 shrink-0 stroke-[3]" />
                  <span>Accompagnement à l&apos;import initial</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center">
              <LandingCTAButton
                href="/register?plan=premium"
                variant="secondary"
                showArrow={false}
                className="w-full py-3 rounded-xl text-xs hover:bg-purple-50 hover:text-purple-900"
              >
                Choisir PREMIUM
              </LandingCTAButton>
              <p className="mt-2 text-center text-[10px] text-slate-400 font-medium">
                Accompagnement personnalisé
              </p>
            </div>
          </div>
        </div>

        {/* Security & Reliability Banner */}
        <div className="mt-12 max-w-2xl mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center flex items-center justify-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs text-slate-700 font-semibold">
            Essai gratuit de 30 jours complet sans carte bancaire • Vos données restent protégées et sauvegardées
          </span>
        </div>
      </div>
    </section>
  );
}
