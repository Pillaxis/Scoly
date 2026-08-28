"use client";

import React from "react";
import {
  GraduationCap,
  Receipt,
  FileText,
  Play,
  Check,
} from "lucide-react";
import { LandingCTAButton } from "@/components/marketing/LandingCTAButton";

export function LandingHero() {
  return (
    <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden">
      {/* Background Soft Glow & Grid Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[450px] bg-gradient-to-tr from-blue-200/30 via-indigo-100/20 to-sky-100/30 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 1. Top Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-800 text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-2xs hover:bg-blue-100/70 transition-colors animate-in fade-in slide-in-from-top-2 duration-300">
          <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Pour les directeurs et fondateurs d&apos;écoles</span>
        </div>

        {/* 2. Main H1 Headline (Bref, Sobre & Percutant) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.12] max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
          Gérez votre école en{" "}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent block sm:inline">
            toute simplicité
          </span>
        </h1>

        {/* 3. Subheadline (Court & Direct) */}
        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed font-normal animate-in fade-in slide-in-from-bottom-3 duration-500">
          Suivez vos élèves, encaissez les scolarités et éditez vos reçus officiels en quelques clics.
        </p>

        {/* 4. CTA Buttons Area with Instant Micro-Feedback */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-600">
          <LandingCTAButton
            href="/register"
            variant="primary"
            className="w-full sm:w-auto"
          >
            Essayer gratuitement
          </LandingCTAButton>

          <a
            href="#comment-ca-marche"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-slate-700 hover:text-slate-950 font-bold text-sm sm:text-base hover:bg-slate-100/80 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 text-blue-600 fill-blue-600" />
            <span>Voir comment ça marche</span>
          </a>
        </div>

        {/* 5. Social Proof / Review Strip */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500 font-medium">
          {/* Overlapping Avatars */}
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
              AK
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-700 text-white font-bold flex items-center justify-center text-[10px]">
              DM
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-600 text-white font-bold flex items-center justify-center text-[10px]">
              EB
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
              SL
            </div>
          </div>

          {/* Stars & Text */}
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {"★★★★★"}
            </div>
            <span className="font-extrabold text-slate-900">4.8 / 5</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-semibold">
              Recommandé par plus de 150 établissements
            </span>
          </div>
        </div>

        {/* 6. Refined Minimalist Product Window & Floating Popups */}
        <div className="mt-12 sm:mt-16 relative max-w-2xl mx-auto">
          {/* Floating Popup 1: Top Right ('Reçu généré !') */}
          <div className="absolute -top-6 -right-2 sm:-right-8 z-20 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-900/5 text-xs font-bold text-slate-800 animate-in fade-in zoom-in-95 duration-500 hover:scale-105 transition-transform select-none">
            <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-extrabold text-slate-900 text-sm">Reçu généré !</span>
          </div>

          {/* Floating Popup 2: Bottom Left ('Taux de recouvrement 94%') */}
          <div className="absolute -bottom-6 -left-2 sm:-left-8 z-20 flex flex-col items-start px-5 py-3.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl shadow-slate-900/5 text-left animate-in fade-in zoom-in-95 duration-500 hover:scale-105 transition-transform select-none">
            <span className="text-[11px] text-slate-400 font-bold">Taux de recouvrement</span>
            <span className="font-mono font-black text-2xl sm:text-3xl text-blue-600 tracking-tight leading-tight mt-0.5">
              94%
            </span>
          </div>

          {/* Clean macOS Window Frame */}
          <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 p-4 sm:p-7 text-left space-y-4">
            {/* macOS Window Header Bar */}
            <div className="flex items-center gap-2 pb-2">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs font-semibold text-slate-400 ml-1.5">Mes Registres & Encaissements</span>
            </div>

            {/* List Item 1 */}
            <div className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Terminale D • Tranche 2
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    38 élèves inscrits • 75 000 FCFA / élève
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold shrink-0">
                À jour
              </span>
            </div>

            {/* List Item 2 */}
            <div className="p-4 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 transition-all">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 shadow-2xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900">
                    3ème A • Scolarité & Examens
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    42 élèves inscrits • 50 000 FCFA / élève
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-extrabold shrink-0">
                À jour
              </span>
            </div>
          </div>

          {/* Trust Caption Below Mockup */}
          <div className="mt-4 text-center text-xs text-slate-400 font-medium">
            Utilisé par plus de 150 directeurs et fondateurs d&apos;écoles
          </div>
        </div>
      </div>
    </section>
  );
}
