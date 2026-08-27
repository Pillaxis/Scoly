"use client";

import React from "react";
import {
  CreditCard,
  Receipt,
  MessageSquare,
  Camera,
  Users,
  BarChart3,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from "lucide-react";

export function LandingFeatures() {
  const features = [
    {
      icon: CreditCard,
      badge: "Encaissements",
      title: "Encaissement Multi-Modes Rapide",
      description:
        "Enregistrez les versements en quelques secondes : espèces, chèques, virements bancaires, et Mobile Money (TMoney, Flooz). Calcul automatique du reste dû.",
      color: "from-teal-500 to-emerald-600",
    },
    {
      icon: Receipt,
      badge: "Reçus",
      title: "Reçus Officiels PDF & Partage WhatsApp",
      description:
        "Éditez instantanément des reçus numérotés professionnels aux couleurs de votre école, imprimables en 1 clic ou partageables directement sur le WhatsApp des parents.",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: MessageSquare,
      badge: "Recouvrement",
      title: "Gestion des Impayés & Relances WhatsApp",
      description:
        "Identifiez en un coup d'œil les élèves en retard et envoyez des relances personnalisées et bienveillantes sans passer des heures au téléphone.",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Camera,
      badge: "PRO • Scanner IA",
      title: "Numérisation Photo de vos Cahiers Papier (OCR)",
      description:
        "Prenez simplement en photo vos anciens registres ou cahiers d'inscription : notre intelligence artificielle extrait automatiquement les lignes et élèves.",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: BarChart3,
      badge: "Trésorerie",
      title: "Tableau de Bord & Évolution Financière",
      description:
        "Graphiques en temps réel, taux de recouvrement par classe, bilan journalier des encaissements et prévisions fiables pour la direction.",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Users,
      badge: "Collaborateurs",
      title: "Accès Équipe & Permissions Sécurisées",
      description:
        "Comptes séparés pour le Fondateur, le Directeur, le Comptable et le Secrétariat. Chacun accède uniquement aux données nécessaires à son rôle.",
      color: "from-slate-700 to-slate-900",
    },
  ];

  return (
    <section id="fonctionnalites" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Fonctionnalités Puissantes & Intuitives</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Tout ce dont votre établissement a besoin au même endroit
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            SCOLY combine la rigueur d&apos;un logiciel comptable avec la simplicité d&apos;une application moderne accessible sur ordinateur et téléphone.
          </p>
        </div>

        {/* Features 3x2 Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-3xl bg-slate-50/70 hover:bg-white border border-slate-200 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/5 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base sm:text-lg font-black text-slate-900 group-hover:text-teal-900 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center text-xs font-bold text-teal-700 group-hover:text-teal-900">
                  <span>En savoir plus</span>
                  <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
