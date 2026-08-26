"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { AlertCircle, Clock, CheckCircle2, ArrowRight, BellRing, Receipt, ShieldAlert, Sparkles, Layers } from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA } from "@/lib/utils";

export function UrgentActionCenter() {
  const { dashboardMetrics, payments, students, tuitionPlans, classes } = useScoly();

  const todayStr = new Date().toISOString().split("T")[0];
  const activePayments = useMemo(() => payments.filter((p) => p.status !== "cancelled"), [payments]);
  const todayPayments = useMemo(() => activePayments.filter((p) => p.payment_date === todayStr), [activePayments, todayStr]);

  // Unconfigured classes
  const unconfiguredClassesCount = useMemo(() => {
    return classes.filter((c) => !tuitionPlans.some((tp) => tp.class_id === c.id)).length;
  }, [classes, tuitionPlans]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">
              Centre d&apos;Actions — À Traiter Aujourd&apos;hui
            </h2>
            <p className="text-xs text-slate-400">
              Actions prioritaires recommandées selon l&apos;état réel de votre trésorerie
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
          {dashboardMetrics.students_critical +
            dashboardMetrics.students_upcoming +
            (unconfiguredClassesCount > 0 ? 1 : 0) +
            (todayPayments.length > 0 ? 1 : 0)}{" "}
          action(s)
        </span>
      </div>

      {/* Action Cards Grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Critique (Retards > 15j) */}
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col justify-between hover:bg-rose-50/80 transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                Critique
              </span>
              <span className="font-mono font-black text-rose-700 text-lg">
                {dashboardMetrics.students_critical}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs mt-2.5">
              {dashboardMetrics.students_critical} dossier(s) avec &gt; 15j de retard
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Comptes scolaires avec échéance largement dépassée.
            </p>
          </div>

          <Link
            href="/debts?filter=critical"
            className="mt-4 inline-flex items-center justify-between w-full px-3 py-2 bg-rose-600 group-hover:bg-rose-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>Relancer les parents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2. À Anticiper (Échéances 3-7j) */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between hover:bg-amber-50/80 transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                À Anticiper
              </span>
              <span className="font-mono font-black text-amber-700 text-lg">
                {dashboardMetrics.students_upcoming}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs mt-2.5">
              {dashboardMetrics.students_upcoming} échéance(s) dans 3 à 7 jours
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Rappels préventifs pour sécuriser les rentrées de fonds.
            </p>
          </div>

          <Link
            href="/debts?filter=upcoming"
            className="mt-4 inline-flex items-center justify-between w-full px-3 py-2 bg-amber-600 group-hover:bg-amber-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>Préparer les rappels</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 3. À Vérifier (Grilles Tarifaires / Crédits) */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col justify-between hover:bg-blue-50/80 transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                À Vérifier
              </span>
              <span className="font-mono font-black text-blue-700 text-lg">
                {unconfiguredClassesCount > 0
                  ? unconfiguredClassesCount
                  : dashboardMetrics.students_credit}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs mt-2.5">
              {unconfiguredClassesCount > 0
                ? `${unconfiguredClassesCount} classe(s) sans grille définie`
                : `${dashboardMetrics.students_credit} élève(s) avec avance/crédit`}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              {unconfiguredClassesCount > 0
                ? "Définissez le calendrier et montant pour ces classes."
                : "Vérifier l'imputation des versements anticipés."}
            </p>
          </div>

          <Link
            href={unconfiguredClassesCount > 0 ? "/tuition" : "/students"}
            className="mt-4 inline-flex items-center justify-between w-full px-3 py-2 bg-blue-600 group-hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>{unconfiguredClassesCount > 0 ? "Configurer les tarifs" : "Vérifier les comptes"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4. Journal de Caisse du Jour */}
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 flex flex-col justify-between hover:bg-emerald-50/80 transition-colors group">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                Journal de Caisse
              </span>
              <span className="font-mono font-black text-emerald-700 text-lg">
                {todayPayments.length}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-xs mt-2.5">
              {todayPayments.length} paiement(s) reçu(s) aujourd&apos;hui
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              Total du jour : <strong>{formatFCFA(dashboardMetrics.collected_today)}</strong>
            </p>
          </div>

          <Link
            href="/payments"
            className="mt-4 inline-flex items-center justify-between w-full px-3 py-2 bg-slate-900 group-hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <span>Consulter le journal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
