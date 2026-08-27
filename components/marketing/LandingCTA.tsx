"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck } from "lucide-react";

export function LandingCTA() {
  return (
    <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-tr from-slate-950 via-slate-900 to-teal-950 text-white p-8 sm:p-14 text-center relative overflow-hidden border border-teal-500/30 shadow-2xl shadow-slate-900/20">
          {/* Subtle Glow Accents */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Passez à la gestion moderne dès aujourd&apos;hui</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Prêt à simplifier la gestion de votre école ?
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Rejoignez les dizaines d&apos;établissements qui ont éliminé les pertes de scolarité et automatisé leurs encaissements avec SCOLY.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-teal-500 hover:bg-teal-600 active:scale-98 text-slate-950 font-black text-sm sm:text-base shadow-lg shadow-teal-500/30 hover:shadow-xl transition-all cursor-pointer group"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Reassurance points */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>15 jours d&apos;essai gratuit complet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Sans carte bancaire requise</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Garantie 30 jours satisfait ou remboursé</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
