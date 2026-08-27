"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Crown, Zap, ShieldCheck, Sparkles, ArrowRight, HelpCircle } from "lucide-react";
import { formatFCFA } from "@/lib/utils";

export function LandingPricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="tarifs" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Tarifs Transparents & Accessibles</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Un investissement rentabilisé dès le premier impayé recouvré
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Profitez de 15 jours d&apos;essai gratuit pour tester toutes les fonctionnalités. Choisissez ensuite la formule adaptée à la taille de votre école.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-slate-100 border border-slate-200">
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
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <span>Annuel</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                isYearly ? "bg-amber-400 text-slate-950 font-black" : "bg-teal-100 text-teal-800"
              }`}>
                -30%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {/* Card 1: START */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black text-slate-900">START</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    L&apos;essentiel pour sécuriser vos encaissements
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-slate-900">
                    {isYearly ? "42 000" : "5 000"}
                  </span>
                  <span className="text-sm font-bold text-slate-500">FCFA</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {isYearly ? "/ an" : "/ mois"}
                  </span>
                </div>

                {isYearly ? (
                  <div className="mt-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block border border-emerald-200">
                    Économisez 18 000 FCFA (soit 3 500 FCFA / mois)
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-400">
                    Ou 42 000 FCFA / an avec -30%
                  </div>
                )}
              </div>

              {/* Feature List */}
              <div className="mt-6 space-y-3 text-xs sm:text-sm text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                  <span>Gestion complète des élèves & classes</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                  <span>Grilles tarifaires & tranches de scolarité</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                  <span>Encaissements Espèces, Chèques & Virements</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                  <span>Génération & impression de reçus officiels</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                  <span>Relances individuelles WhatsApp / SMS</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                  <span>Import standard fichiers Excel & CSV</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-teal-600 shrink-0 stroke-[3]" />
                  <span>Tableau de bord financier de base</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/register?plan=start"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-extrabold text-xs sm:text-sm transition-all shadow-sm"
              >
                <span>Choisir START</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="mt-2 text-center text-[11px] text-slate-400 font-medium">
                15 jours d&apos;essai gratuit inclus
              </p>
            </div>
          </div>

          {/* Card 2: PRO (Recommended) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-teal-900 to-slate-900 text-white border-2 border-teal-500 shadow-xl shadow-teal-950/20 relative flex flex-col justify-between">
            {/* Top Recommended Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 text-[11px] font-black uppercase tracking-wider shadow-md">
              👑 Recommandé
            </div>

            <div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">PRO</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40">
                      Complet
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    La puissance maximale pour piloter et développer l&apos;école
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <Crown className="w-5 h-5 fill-slate-950" />
                </div>
              </div>

              {/* Price Display */}
              <div className="mt-6 pt-6 border-t border-slate-700/60">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-3xl sm:text-4xl font-black text-white">
                    {isYearly ? "84 000" : "10 000"}
                  </span>
                  <span className="text-sm font-bold text-teal-300">FCFA</span>
                  <span className="text-xs text-slate-400 font-medium">
                    {isYearly ? "/ an" : "/ mois"}
                  </span>
                </div>

                {isYearly ? (
                  <div className="mt-2 text-xs font-bold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg inline-block border border-amber-400/20">
                    Économisez 36 000 FCFA (soit 7 000 FCFA / mois)
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-400">
                    Ou 84 000 FCFA / an avec -30%
                  </div>
                )}
              </div>

              {/* Feature List */}
              <div className="mt-6 space-y-3 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-2.5 text-teal-300 font-semibold">
                  <Check className="w-4 h-4 text-teal-400 shrink-0 stroke-[3]" />
                  <span>Tout ce qui est inclus dans START, plus :</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />
                  <span><strong>Scanner IA & OCR</strong> pour cahiers et registres papier</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />
                  <span><strong>Paiement Mobile Money</strong> automatisé (TMoney, Flooz)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />
                  <span>Graphiques d&apos;évolution du CA & statistiques avancées</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />
                  <span>Centre d&apos;actions urgentes avec priorisation IA</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />
                  <span>Synchronisation bidirectionnelle Google Sheets</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />
                  <span>Relances groupées & exports comptables</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 stroke-[3]" />
                  <span>Gestion multi-utilisateurs & permissions illimitées</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/60">
              <Link
                href="/register?plan=pro"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 active:scale-98 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-teal-500/25"
              >
                <span>Passer à SCOLY PRO</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="mt-2 text-center text-[11px] text-teal-300 font-medium">
                15 jours d&apos;essai gratuit complet • Sans engagement
              </p>
            </div>
          </div>
        </div>

        {/* 30-Day Guarantee Banner */}
        <div className="mt-12 max-w-2xl mx-auto p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <div className="text-xs text-emerald-900 text-left">
            <strong className="font-extrabold block">Garantie 30 jours satisfait ou remboursé</strong>
            <span>Essayez votre abonnement payant en toute confiance. Si vous n&apos;êtes pas convaincu, nous vous remboursons intégralement sur simple demande.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
