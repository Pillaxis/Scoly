"use client";

import React, { useMemo } from "react";
import { DollarSign, Users, AlertCircle, Clock, CheckCircle2, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA } from "@/lib/utils";

export function MetricCards() {
  const { dashboardMetrics, payments, students, getStudentFinancialSummary } = useScoly();

  // Real calculation of today vs yesterday
  const { trendText, trendPositive, todayCount } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const activePayments = payments.filter((p) => p.status !== "cancelled");
    const todayAmt = activePayments
      .filter((p) => p.payment_date === todayStr)
      .reduce((sum, p) => sum + Math.round(p.amount), 0);

    const yesterdayAmt = activePayments
      .filter((p) => p.payment_date === yesterdayStr)
      .reduce((sum, p) => sum + Math.round(p.amount), 0);

    const count = activePayments.filter((p) => p.payment_date === todayStr).length;

    if (yesterdayAmt > 0) {
      const pct = ((todayAmt - yesterdayAmt) / yesterdayAmt) * 100;
      const formatted = Math.abs(pct).toFixed(1).replace(".", ",");
      return {
        trendText: pct >= 0 ? `↑ +${formatted} % vs hier` : `↓ -${formatted} % vs hier`,
        trendPositive: pct >= 0,
        todayCount: count,
      };
    }

    if (count > 0) {
      return {
        trendText: `↑ ${count} versement${count > 1 ? "s" : ""} aujourd'hui`,
        trendPositive: true,
        todayCount: count,
      };
    }

    return {
      trendText: "0 versement aujourd'hui",
      trendPositive: null,
      todayCount: 0,
    };
  }, [payments]);

  const totalStudents = students.length;
  const upToDatePct =
    totalStudents > 0
      ? ((dashboardMetrics.students_up_to_date / totalStudents) * 100).toFixed(1).replace(".", ",")
      : "0";

  return (
    <div className="space-y-4">
      {/* Primary KPI Grid (Level 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Encaissements Aujourd'hui */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Encaissé Aujourd&apos;hui
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="text-2xl font-black font-mono text-slate-900 tabular-nums">
              {formatFCFA(dashboardMetrics.collected_today)}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {trendPositive === true ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded-md">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  {trendText}
                </span>
              ) : trendPositive === false ? (
                <span className="inline-flex items-center gap-0.5 text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded-md">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {trendText}
                </span>
              ) : (
                <span className="text-slate-400 font-medium">{trendText}</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Total année :</span>
              <strong className="font-mono text-slate-700 font-bold">
                {formatFCFA(dashboardMetrics.collected_total)}
              </strong>
            </p>
          </div>
        </div>

        {/* 2. Total à Récupérer (Reste Dû) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Reste à Récupérer
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="text-2xl font-black font-mono text-rose-700 tabular-nums">
              {formatFCFA(dashboardMetrics.total_remaining)}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-medium">Taux de recouvrement :</span>
              <span className="font-bold font-mono text-blue-600">
                {dashboardMetrics.recovery_rate.toString().replace(".", ",")} %
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(dashboardMetrics.recovery_rate, 0))}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
              <span>Attendu total :</span>
              <strong className="font-mono text-slate-700 font-bold">
                {formatFCFA(dashboardMetrics.total_expected)}
              </strong>
            </p>
          </div>
        </div>

        {/* 3. Élèves à Jour */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Élèves à Jour
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="text-2xl font-black font-mono text-emerald-700 tabular-nums">
              {dashboardMetrics.students_up_to_date}{" "}
              <span className="text-xs font-bold text-slate-400 font-sans">
                / {totalStudents} élèves
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>{upToDatePct} % des effectifs en règle</span>
            </div>

            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Soldés à 100% :</span>
              <strong className="font-mono text-emerald-600 font-bold">
                {students.filter(s => getStudentFinancialSummary(s.id).balance_due === 0).length} élève(s)
              </strong>
            </p>
          </div>
        </div>

        {/* 4. Dossiers en Retard */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dossiers en Retard
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-2xs group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="text-2xl font-black font-mono text-amber-700 tabular-nums">
              {dashboardMetrics.students_late + dashboardMetrics.students_critical}{" "}
              <span className="text-xs font-bold text-rose-600 font-sans">
                ({dashboardMetrics.students_critical} critique{dashboardMetrics.students_critical > 1 ? "s" : ""})
              </span>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1">
              <span className="text-rose-600 font-bold">
                {dashboardMetrics.students_critical}
              </span>
              <span>retard(s) &gt; 15 jours</span>
            </div>

            <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100 flex items-center justify-between">
              <span>Échéance proche :</span>
              <strong className="font-mono text-amber-600 font-bold">
                {dashboardMetrics.students_upcoming} dossier(s)
              </strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
