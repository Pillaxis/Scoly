"use client";

import React from "react";
import {
  CreditCard,
  Receipt,
  BellRing,
  Layers,
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: CreditCard,
      title: "Encaissements rapides",
      description:
        "Enregistrez les règlements en espèces, chèques et Mobile Money (TMoney, Flooz) en quelques secondes avec calcul automatique du reste dû.",
    },
    {
      icon: Receipt,
      title: "Reçus certifiés",
      description:
        "Éditez instantanément des reçus numérotés infalsifiables, imprimables en 1 clic ou partageables directement sur le WhatsApp des parents.",
    },
    {
      icon: BellRing,
      title: "Suivi & Relances",
      description:
        "Visualisez les retards de scolarité en temps réel et envoyez des relances personnalisées sans stress ni calculs manuels.",
    },
    {
      icon: Layers,
      title: "Numérisation IA",
      description:
        "Photographiez vos anciens registres et cahiers papier : notre intelligence artificielle extrait automatiquement les données des élèves.",
    },
  ];

  return (
    <section id="fonctionnalites" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4 border border-blue-100">
            Fonctionnalités
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Tout ce qu&apos;il faut pour gérer votre école
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            Des outils simples et intelligents qui s&apos;adaptent au quotidien de votre établissement.
          </p>
        </div>

        {/* 4 Cards in 1 Horizontal Row */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-200 flex flex-col justify-start text-left group"
              >
                {/* Icon in Rounded Blue Box */}
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform shadow-2xs">
                  <Icon className="w-6 h-6 stroke-[2.2]" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-900 transition-colors">
                  {feat.title}
                </h3>

                {/* Description */}
                <p className="mt-2.5 text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
