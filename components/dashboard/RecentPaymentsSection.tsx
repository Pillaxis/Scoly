"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { Receipt, ArrowRight, Printer, Smartphone, DollarSign, Landmark, FileText, Wallet } from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";
import { Payment, PaymentMethod } from "@/types/scoly";

interface RecentPaymentsSectionProps {
  onSelectPaymentReceipt: (payment: Payment) => void;
}

export function RecentPaymentsSection({
  onSelectPaymentReceipt,
}: RecentPaymentsSectionProps) {
  const { payments } = useScoly();

  const { recentPayments, totalPaymentsCount } = useMemo(() => {
    const active = payments.filter((p) => p.status !== "cancelled");
    return {
      recentPayments: active.slice(0, 5),
      totalPaymentsCount: active.length,
    };
  }, [payments]);

  const getMethodBadge = (method: PaymentMethod) => {
    switch (method) {
      case "tmoney":
        return { label: "TMoney", bg: "bg-amber-50 text-amber-800 border-amber-200" };
      case "flooz":
        return { label: "Flooz", bg: "bg-blue-50 text-blue-800 border-blue-200" };
      case "cash":
        return { label: "Espèces", bg: "bg-emerald-50 text-emerald-800 border-emerald-200" };
      case "bank_transfer":
        return { label: "Virement", bg: "bg-purple-50 text-purple-800 border-purple-200" };
      case "cheque":
        return { label: "Chèque", bg: "bg-indigo-50 text-indigo-800 border-indigo-200" };
      default:
        return { label: "Autre", bg: "bg-slate-100 text-slate-700 border-slate-200" };
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-2xs">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Derniers Encaissements</h3>
            <p className="text-xs text-slate-400">Transactions enregistrées récemment en caisse</p>
          </div>
        </div>

        <Link
          href="/payments"
          className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
        >
          <span>Voir tous les paiements ({totalPaymentsCount})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Table / List */}
      <div className="mt-4 divide-y divide-slate-100">
        {recentPayments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-1">
            <Receipt className="w-8 h-8 text-slate-300 mb-1" />
            <span className="font-semibold">Aucun paiement enregistré pour l&apos;instant.</span>
            <span className="text-[11px] text-slate-400">Les nouveaux versements apparaîtront ici en temps réel.</span>
          </div>
        ) : (
          recentPayments.map((p) => {
            const methodBadge = getMethodBadge(p.payment_method);

            return (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => onSelectPaymentReceipt(p)}
                    className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-emerald-100 group-hover:text-emerald-700 flex items-center justify-center text-slate-500 font-mono text-xs transition-colors cursor-pointer shrink-0 shadow-2xs"
                    title="Voir et imprimer le reçu officiel"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-xs truncate">
                        {p.student_name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded shrink-0">
                        {p.class_name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${methodBadge.bg}`}
                      >
                        {methodBadge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      Reçu : <strong className="font-mono text-slate-700">{p.receipt_number}</strong> • {formatDate(p.payment_date)}
                      {p.parent_name ? ` • Parent : ${p.parent_name}` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span className="font-mono font-black text-emerald-700 text-xs sm:text-sm tabular-nums block">
                    +{formatFCFA(p.amount)}
                  </span>
                  {p.is_advance && (
                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                      Avance incluse
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Link */}
      {recentPayments.length > 0 && (
        <div className="pt-3 mt-2 border-t border-slate-100 text-right">
          <Link
            href="/payments"
            className="text-xs font-bold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1"
          >
            <span>Consulter le journal de caisse complet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
