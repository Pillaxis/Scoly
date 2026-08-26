"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, ExternalLink } from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA, getStatusBadge } from "@/lib/utils";
import { Student } from "@/types/scoly";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { SmsIcon } from "@/components/icons/SmsIcon";

interface DebtorsPreviewSectionProps {
  onOpenReminderModal: (student: Student, channel?: "whatsapp" | "sms") => void;
}

export function DebtorsPreviewSection({
  onOpenReminderModal,
}: DebtorsPreviewSectionProps) {
  const { students, getStudentFinancialSummary } = useScoly();

  // Filter and sort top 5 debtors
  const { topDebtors, totalDebtorsCount } = useMemo(() => {
    const debtors = students
      .map((s) => ({
        student: s,
        summary: getStudentFinancialSummary(s.id),
      }))
      .filter((item) => item.summary.status === "late" || item.summary.status === "critical")
      .sort((a, b) => {
        // 1. Critical first
        if (a.summary.status === "critical" && b.summary.status !== "critical") return -1;
        if (b.summary.status === "critical" && a.summary.status !== "critical") return 1;
        // 2. Highest balance due
        if (b.summary.balance_due !== a.summary.balance_due) {
          return b.summary.balance_due - a.summary.balance_due;
        }
        // 3. Most days late
        return b.summary.days_late - a.summary.days_late;
      });

    return {
      topDebtors: debtors.slice(0, 5),
      totalDebtorsCount: debtors.length,
    };
  }, [students, getStudentFinancialSummary]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold shadow-2xs">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Top des Impayés</h3>
            <p className="text-xs text-slate-400">Les 5 dossiers prioritaires à recouvrer</p>
          </div>
        </div>

        <Link
          href="/debts"
          className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
        >
          <span>Voir tous les impayés ({totalDebtorsCount})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table / List */}
      <div className="mt-4 divide-y divide-slate-100">
        {topDebtors.length === 0 ? (
          <div className="py-12 text-center text-emerald-600 text-xs font-bold flex flex-col items-center justify-center space-y-1">
            <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm mb-1">
              ✓
            </span>
            <span>Tous les élèves sont parfaitement à jour de leurs règlements !</span>
            <span className="text-slate-400 font-normal text-[11px]">Aucun dossier en retard de paiement à ce jour.</span>
          </div>
        ) : (
          topDebtors.map(({ student, summary }) => {
            const badge = getStatusBadge(summary.status);

            return (
              <div
                key={student.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-100">
                    {student.first_name[0]}
                    {student.last_name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/students/${student.id}`}
                        className="font-extrabold text-slate-900 hover:text-blue-600 text-xs transition-colors truncate"
                      >
                        {student.first_name} {student.last_name}
                      </Link>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {student.class_name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Parent : {student.parent.full_name || "Non renseigné"} •{" "}
                      <span className="text-rose-600 font-bold">
                        {summary.days_late} jours de retard
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-mono font-black text-rose-700 text-xs sm:text-sm tabular-nums block">
                      {formatFCFA(summary.balance_due)}
                    </span>
                    <span
                      className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${badge.badge}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* View Student */}
                    <Link
                      href={`/students/${student.id}`}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer shadow-2xs"
                      title="Ouvrir la fiche de l'élève"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    {/* WhatsApp Reminder Button with Official WhatsApp Icon */}
                    <button
                      type="button"
                      onClick={() => onOpenReminderModal(student, "whatsapp")}
                      className="p-2 bg-[#25D366]/10 hover:bg-[#25D366] text-[#075E54] hover:text-white rounded-xl transition-all cursor-pointer shadow-2xs"
                      title="Relancer via WhatsApp"
                    >
                      <WhatsAppIcon className="w-3.5 h-3.5" />
                    </button>

                    {/* Simple Message (SMS) Reminder Button */}
                    <button
                      type="button"
                      onClick={() => onOpenReminderModal(student, "sms")}
                      className="p-2 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all cursor-pointer shadow-2xs"
                      title="Relancer par Message Simple (SMS)"
                    >
                      <SmsIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Link */}
      {topDebtors.length > 0 && (
        <div className="pt-3 mt-2 border-t border-slate-100 text-right">
          <Link
            href="/debts"
            className="text-xs font-bold text-slate-600 hover:text-rose-600 inline-flex items-center gap-1"
          >
            <span>Accéder au module des relances & impayés</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
