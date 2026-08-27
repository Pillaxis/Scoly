"use client";

import React from "react";
import { XCircle, CheckCircle2, AlertTriangle, ShieldCheck, FileSpreadsheet, Sparkles } from "lucide-react";

export function LandingProblemSolution() {
  const problems = [
    {
      title: "Registres & Cahiers Papier Perdus",
      desc: "Pages déchirées, écriture illisible, risques de perte totale en cas d'incident et impossibilité de vérifier les antécédents rapidement.",
    },
    {
      title: "Paiements Éparpillés & Calculs Manuels",
      desc: "Espèces, chèques, transferts TMoney ou Flooz notés sur des bouts de papier avec erreurs fréquentes lors du bouclage de caisse.",
    },
    {
      title: "Impayés Oubliés & Pertes de Trésorerie",
      desc: "Des millions de FCFA de scolarités non recouvrées chaque année parce que les relances ne sont pas suivies de manière rigoureuse.",
    },
  ];

  const solutions = [
    {
      title: "Traçabilité Intégrale & Données Sécurisées",
      desc: "Chaque élève dispose d'une fiche complète avec historique des versements, solde en direct et sauvegarde automatique dans le cloud.",
    },
    {
      title: "Reçus Officiels & Clôture de Caisse Instantanée",
      desc: "Générez des reçus numérotés infalsifiables en 1 clic et consultez le total exact encaissé par mode de paiement chaque soir.",
    },
    {
      title: "Relances Ciblées & Taux de Recouvrement Record",
      desc: "Identifiez immédiatement les retards critiques et envoyez des relances WhatsApp ou SMS personnalisées pour assainir votre trésorerie.",
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-teal-400">
            Pourquoi abandonner les registres papier ?
          </span>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight text-white">
            La gestion traditionnelle vous coûte du temps et de l&apos;argent
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            SCOLY a été conçu spécialement pour résoudre les défis quotidiens des écoles privées et offrir une visibilité financière totale.
          </p>
        </div>

        {/* 2-Column Grid: Avant vs Avec SCOLY */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Column 1: AVANT (Le Calvaire) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-800/60 border border-rose-500/20 space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-slate-700/60">
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Sans SCOLY : Les Risques Quotidiens</h3>
                  <span className="text-xs text-rose-300">Cahiers physiques et bricolage manuel</span>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {problems.map((prob, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5 font-mono text-xs font-bold">
                      ✕
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{prob.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{prob.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
              ⚠️ Résultat : Pertes financières, contestations de parents et stress continu pour la direction.
            </div>
          </div>

          {/* Column 2: AVEC SCOLY (La Sérénité) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-800/90 to-teal-950/40 border border-teal-500/30 space-y-6 flex flex-col justify-between shadow-xl shadow-teal-950/30">
            <div>
              <div className="flex items-center gap-3 pb-4 border-b border-teal-500/20">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">Avec SCOLY : La Sérénité Totale</h3>
                  <span className="text-xs text-teal-400 font-medium">Clarté, rapidité et traçabilité</span>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {solutions.map((sol, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-teal-200">{sol.title}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{sol.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Bénéfice : 100% de clarté sur la trésorerie et un recouvrement optimisé dès le premier mois.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
