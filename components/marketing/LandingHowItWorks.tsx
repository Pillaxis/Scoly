"use client";

import React from "react";

export function LandingHowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Créez",
      description: "Créez votre espace école en 2 minutes sans carte bancaire.",
    },
    {
      number: "2",
      title: "Importez",
      description: "Ajoutez vos élèves manuellement, par fichier Excel ou photo de registre.",
    },
    {
      number: "3",
      title: "Pilotez",
      description: "Suivez votre trésorerie en direct et relancez les impayés en toute sérénité.",
    },
  ];

  return (
    <section id="comment-ca-marche" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4 border border-blue-100">
            Comment ça marche
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Simple comme 1, 2, 3
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-500 max-w-xl mx-auto leading-relaxed">
            De vos registres à votre comptabilité en quelques minutes
          </p>
        </div>

        {/* 3 Centered Cards in 1 Row */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 sm:p-10 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-200 flex flex-col items-center justify-center text-center group"
            >
              {/* Solid Blue Circle with Step Number */}
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black text-lg flex items-center justify-center mb-6 shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
                {step.number}
              </div>

              {/* Step Title */}
              <h3 className="text-xl font-black text-slate-900 mb-3 group-hover:text-blue-900 transition-colors">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
