"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Sparkles } from "lucide-react";

export function LandingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Comment fonctionne l'essai gratuit de 15 jours ?",
      a: "Dès votre inscription, votre école bénéficie de 15 jours d'accès complet à toutes les fonctionnalités de SCOLY (y compris les fonctionnalités PRO comme le scanner OCR et le paiement Mobile Money). Aucune carte bancaire n'est demandée pour démarrer.",
    },
    {
      q: "Que se passe-t-il avec mes données à la fin de la période d'essai ?",
      a: "Toutes vos données (fiches élèves, grilles, historique de paiements, classes) sont conservées et restent 100% sécurisées. Rien n'est supprimé. Il vous suffit de choisir la formule START ou PRO pour continuer à utiliser SCOLY.",
    },
    {
      q: "Puis-je utiliser SCOLY sur smartphone, tablette et ordinateur ?",
      a: "Oui, absolument ! SCOLY a été conçu selon les standards Mobile-First les plus modernes. Vous et votre équipe pouvez encaisser, imprimer ou consulter les bilans indifféremment depuis votre téléphone Android/iPhone, une tablette ou un ordinateur de bureau.",
    },
    {
      q: "Comment fonctionne le scanner IA de cahiers et registres papier ?",
      a: "Disponible avec la formule PRO, le scanner vous permet de photographier directement les pages de votre cahier d'inscription ou registre de caisse. Notre système OCR extrait automatiquement les noms, matricules et montants pour vous éviter des heures de saisie manuelle.",
    },
    {
      q: "Comment fonctionne la garantie satisfait ou remboursé de 30 jours ?",
      a: "Lorsque vous souscrivez à un abonnement payant, vous bénéficiez d'une période de garantie de 30 jours consécutifs. Si pour une quelconque raison le service ne correspond pas à vos attentes, vous recevez un remboursement intégral sans justification requise.",
    },
    {
      q: "Quels sont les moyens de paiement acceptés pour s'abonner ?",
      a: "Nous acceptons les paiements Mobile Money populaires dans la sous-région (TMoney au Togo, Flooz de Moov, Orange Money, MTN Moov) ainsi que les cartes bancaires internationales (Visa, Mastercard) via une passerelle certifiée et sécurisée.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 bg-slate-50 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Foire Aux Questions</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Des réponses simples à vos questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Tout ce que vous devez savoir avant de commencer à moderniser votre établissement.
          </p>
        </div>

        {/* Accordion FAQ Items */}
        <div className="mt-10 sm:mt-12 space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? "bg-white border-teal-400 shadow-md shadow-teal-900/5"
                    : "bg-white/80 border-slate-200 hover:border-slate-300"
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
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4 animate-in fade-in duration-150">
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
