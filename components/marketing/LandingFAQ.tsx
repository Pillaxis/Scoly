"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: "Comment fonctionne l'essai gratuit de 15 jours ?",
      a: "Dès votre inscription, votre école bénéficie de 15 jours d'accès complet à toutes les fonctionnalités de SCOLY (y compris les fonctionnalités PRO comme le scanner IA). Aucune carte bancaire n'est demandée pour démarrer.",
    },
    {
      q: "Mes données scolaires sont-elles sécurisées ?",
      a: "Oui, absolument. Vos données sont hébergées sur des serveurs hautement sécurisés avec sauvegardes automatiques quotidiennes et conformité totale aux normes de confidentialité et de protection des données scolaires.",
    },
    {
      q: "Puis-je utiliser SCOLY sur mobile et tablette ?",
      a: "Oui, SCOLY fonctionne parfaitement sur n'importe quel smartphone (Android et iPhone), tablette ou ordinateur sans aucune installation complexe requise.",
    },
    {
      q: "Y a-t-il un engagement ?",
      a: "Non, aucun. Vous êtes totalement libre d'arrêter ou de modifier votre abonnement à tout moment sans frais ni pénalité. Vos données restent conservées en toute sécurité.",
    },
    {
      q: "Quels sont les moyens de paiement acceptés ?",
      a: "Nous acceptons les paiements Mobile Money populaires dans la sous-région (TMoney au Togo, Flooz, Orange Money, MTN Moov) ainsi que les cartes bancaires internationales (Visa, Mastercard).",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Centered Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] sm:text-xs font-black uppercase tracking-wider mb-4 border border-blue-100">
            FAQ
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Questions fréquentes
          </h2>

          <p className="mt-3.5 text-sm sm:text-base text-slate-500 leading-relaxed">
            Tout ce que vous devez savoir sur SCOLY
          </p>
        </div>

        {/* Accordion FAQ Items */}
        <div className="mt-12 space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-blue-400 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-200 shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-extrabold text-slate-900">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
