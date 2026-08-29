"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Check, Sparkles, Crown, ArrowRight } from "lucide-react";
import { useScoly } from "@/lib/store";

interface TrialExpiredModalProps {
  isOpen?: boolean;
}

export function TrialExpiredModal({ isOpen }: TrialExpiredModalProps) {
  const router = useRouter();
  const { subscription } = useScoly();

  const isTrial = subscription?.status === "trialing";
  const isExpired =
    subscription?.status === "expired" ||
    (isTrial && subscription?.trial_end_at && new Date() > new Date(subscription.trial_end_at));

  const shouldShow = isOpen !== undefined ? isOpen : isExpired;

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-3xl overflow-hidden bg-white border border-slate-200 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 md:p-8 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

          <div className="relative z-10 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500/20 border border-amber-400/30 rounded-2xl mb-4 text-amber-400 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>

            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
              Votre période d&apos;essai de 30 jours est terminée
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              Toutes vos données (élèves, paiements, reçus et classes) sont <span className="text-emerald-400 font-semibold">intégralement conservées et sécurisées</span>.
            </p>

            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs rounded-full">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Vos données scolaires et reçus d&apos;encaissement restent intacts</span>
            </div>
          </div>
        </div>

        {/* Plan Selection Cards */}
        <div className="p-6 md:p-8 bg-slate-50">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 text-center mb-6">
            Choisissez votre formule pour continuer à utiliser SCOLY
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* START CARD */}
            <div className="relative p-5 bg-white border-2 border-slate-200 hover:border-blue-500 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md border border-blue-200">
                    Jusqu&apos;à 100 élèves
                  </span>
                </div>

                <div className="text-base font-black text-slate-900">SCOLY START</div>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Idéal pour informatiser simplement une école jusqu&apos;à 100 élèves.
                </p>

                <div className="mb-4">
                  <span className="text-xl font-black text-slate-900">
                    5 000 <span className="text-xs font-normal text-slate-600">F/mois</span>
                  </span>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    ou 42 000 FCFA / an (-30%)
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Jusqu&apos;à 100 élèves</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Encaissement caisse & reçus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Relances WhatsApp</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => router.push("/subscription?plan=start")}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Choisir START</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PRO CARD */}
            <div className="relative p-5 bg-gradient-to-b from-amber-50/50 to-orange-50/30 border-2 border-amber-400 rounded-2xl shadow-md flex flex-col justify-between">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Recommandé
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-amber-100 text-amber-900 rounded-md border border-amber-300 flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                    Jusqu&apos;à 500 élèves
                  </span>
                </div>

                <div className="text-base font-black text-slate-900">SCOLY PRO</div>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Mobile Money, Scanner OCR, Analytics & Multi-postes.
                </p>

                <div className="mb-4">
                  <span className="text-xl font-black text-slate-900">
                    10 000 <span className="text-xs font-normal text-slate-600">F/mois</span>
                  </span>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    ou 84 000 FCFA / an (-30%)
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 mb-6">
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Jusqu&apos;à 500 élèves</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Mobile Money & Scanner OCR</span>
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Synchronisation temps réel</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => router.push("/subscription?plan=pro")}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 fill-white" />
                <span>Passer à PRO</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* PREMIUM CARD */}
            <div className="relative p-5 bg-white border-2 border-slate-200 hover:border-purple-500 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md border border-purple-200">
                    Jusqu&apos;à 1 500 élèves
                  </span>
                </div>

                <div className="text-base font-black text-slate-900">SCOLY PREMIUM</div>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Pour les grands groupes scolaires et multi-campus.
                </p>

                <div className="mb-4">
                  <span className="text-xl font-black text-slate-900">
                    25 000 <span className="text-xs font-normal text-slate-600">F/mois</span>
                  </span>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                    ou 210 000 FCFA / an (-30%)
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600 mb-6">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Jusqu&apos;à 1 500 élèves</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Gestion Multi-Campus</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>Support dédié 24/7</span>
                  </li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => router.push("/subscription?plan=premium")}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-900 bg-slate-100 hover:bg-purple-100 hover:text-purple-900 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Choisir PREMIUM</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
