"use client";

import React from "react";
import Link from "next/link";
import { UserPlus, FileSpreadsheet, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

export function LandingHowItWorks() {
  const steps = [
    {
      number: "01",
      icon: UserPlus,
      title: "Créez votre espace en 2 minutes",
      description:
        "Renseignez le nom de votre école, vos classes et votre contact. Votre compte est prêt immédiatement avec 15 jours d'essai gratuit complet.",
      badge: "Gratuit & Sans CB",
    },
    {
      number: "02",
      icon: FileSpreadsheet,
      title: "Ajoutez ou importez vos données",
      description:
        "Saisissez vos élèves directement, importez votre fichier Excel existant ou scannez vos registres papier en photo grâce à notre OCR.",
      badge: "Import Excel & Photo",
    },
    {
      number: "03",
      icon: CheckCircle2,
      title: "Encaissez et pilotez en toute sérénité",
      description:
        "Enregistrez chaque paiement, éditez des reçus officiels instantanés et relancez facilement les impayés pour sécuriser votre trésorerie.",
      badge: "Résultats Immédiats",
    },
  ];

  return (
    <section id="comment-ca-marche" className="py-16 sm:py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-teal-600">
            Démarrage ultra-rapide
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Comment fonctionne SCOLY en 3 étapes simples
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            Aucune installation lourde, aucun serveur à maintenir. Tout fonctionne directement dans votre navigateur web sur ordinateur et smartphone.
          </p>
        </div>

        {/* 3 Steps Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-200 flex flex-col justify-between relative group"
              >
                {/* Step Number Watermark */}
                <div className="absolute top-4 right-6 text-3xl sm:text-4xl font-black text-slate-100 group-hover:text-teal-50 transition-colors pointer-events-none">
                  {step.number}
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-200 shadow-2xs group-hover:bg-teal-600 group-hover:text-white transition-all">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-extrabold text-teal-800 bg-teal-50/80 px-2.5 py-1 rounded-full border border-teal-200/70">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg sm:text-xl font-black text-slate-900 leading-snug">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-slate-400">
                  <span>Étape {step.number} sur 03</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-extrabold text-sm shadow-md shadow-teal-600/25 hover:shadow-lg transition-all cursor-pointer"
          >
            <span>Démarrer mon essai de 15 jours</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="mt-2 text-xs text-slate-500 font-medium">
            Prêt en moins de 2 minutes • Aucune carte bancaire requise
          </p>
        </div>
      </div>
    </section>
  );
}
