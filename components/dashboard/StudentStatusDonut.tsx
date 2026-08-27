"use client";

import React from "react";
import { PieChart as PieIcon, CheckCircle2, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { useScoly } from "@/lib/store";

export function StudentStatusDonut() {
  const { dashboardMetrics, students } = useScoly();

  const total = students.length;

  // Breakdown metrics
  const upToDate = dashboardMetrics.students_up_to_date;
  const upcoming = dashboardMetrics.students_upcoming;
  const lateAndCritical = dashboardMetrics.students_late + dashboardMetrics.students_critical;
  const creditOrOthers = dashboardMetrics.students_credit;

  // Calculate percentages
  const getPct = (val: number) => {
    if (total === 0) return 0;
    return Number(((val / total) * 100).toFixed(1));
  };

  const pctUpToDate = getPct(upToDate);
  const pctUpcoming = getPct(upcoming);
  const pctLate = getPct(lateAndCritical);
  const pctCredit = getPct(creditOrOthers);

  // SVG Donut Calculations
  const radius = 62;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius; // ~389.55

  // Arc lengths
  const lenUpToDate = (pctUpToDate / 100) * circumference;
  const lenUpcoming = (pctUpcoming / 100) * circumference;
  const lenLate = (pctLate / 100) * circumference;
  const lenCredit = (pctCredit / 100) * circumference;

  // Offsets
  const offsetUpToDate = 0;
  const offsetUpcoming = -lenUpToDate;
  const offsetLate = -(lenUpToDate + lenUpcoming);
  const offsetCredit = -(lenUpToDate + lenUpcoming + lenLate);

  const categories = [
    {
      id: "up_to_date",
      label: "À jour",
      count: upToDate,
      pct: pctUpToDate,
      color: "#10b981", // emerald-500
      bgColor: "bg-emerald-500",
      textColor: "text-emerald-700",
      icon: CheckCircle2,
    },
    {
      id: "upcoming",
      label: "Échéance proche",
      count: upcoming,
      pct: pctUpcoming,
      color: "#f59e0b", // amber-500
      bgColor: "bg-amber-500",
      textColor: "text-amber-700",
      icon: Clock,
    },
    {
      id: "late",
      label: "En retard",
      count: lateAndCritical,
      pct: pctLate,
      color: "#f43f5e", // rose-500
      bgColor: "bg-rose-500",
      textColor: "text-rose-700",
      icon: AlertTriangle,
    },
    {
      id: "credit",
      label: "Avance / Autres",
      count: creditOrOthers,
      pct: pctCredit,
      color: "#3b82f6", // blue-500
      bgColor: "bg-blue-500",
      textColor: "text-blue-700",
      icon: Sparkles,
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <PieIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Répartition des Élèves par Statut
            </h3>
            <p className="text-xs text-slate-400">
              Vision globale de la conformité des paiements
            </p>
          </div>
        </div>
      </div>

      {/* Donut & Legend Display (Always visible) */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-5">
        {/* Donut SVG */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full -rotate-90 transform"
          >
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />

            {/* Arc 1: À Jour */}
            {lenUpToDate > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lenUpToDate} ${circumference}`}
                strokeDashoffset={offsetUpToDate}
                className="transition-all duration-500 ease-out"
              />
            )}

            {/* Arc 2: Échéance proche */}
            {lenUpcoming > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lenUpcoming} ${circumference}`}
                strokeDashoffset={offsetUpcoming}
                className="transition-all duration-500 ease-out"
              />
            )}

            {/* Arc 3: En retard */}
            {lenLate > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#f43f5e"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lenLate} ${circumference}`}
                strokeDashoffset={offsetLate}
                className="transition-all duration-500 ease-out"
              />
            )}

            {/* Arc 4: Crédit / Avance */}
            {lenCredit > 0 && (
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke="#3b82f6"
                strokeWidth={strokeWidth}
                strokeDasharray={`${lenCredit} ${circumference}`}
                strokeDashoffset={offsetCredit}
                className="transition-all duration-500 ease-out"
              />
            )}
          </svg>

          {/* Donut Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">
              TOTAL
            </span>
            <span className="text-xl font-black text-slate-900 font-mono leading-tight">
              {total}
            </span>
            <span className="text-[10px] font-medium text-slate-500">
              élèves
            </span>
          </div>
        </div>

        {/* Right Detailed Legend */}
        <div className="flex-1 w-full space-y-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50/80 hover:bg-slate-50 border border-slate-100 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${cat.bgColor} shrink-0`} />
                <span className="font-bold text-slate-800">{cat.label}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-slate-900">
                  {cat.count}
                </span>
                <span className="text-[11px] font-semibold text-slate-400 font-mono w-12 text-right">
                  ({cat.pct.toString().replace(".", ",")} %)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
