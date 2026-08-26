"use client";

import React, { useState, useMemo } from "react";
import { CreditCard, Smartphone, Landmark, DollarSign, Wallet, FileText } from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA } from "@/lib/utils";
import { PaymentMethod } from "@/types/scoly";

type MethodViewMode = "by_method" | "by_period";

export function PaymentMethodsBreakdown() {
  const { payments } = useScoly();
  const [viewMode, setViewMode] = useState<MethodViewMode>("by_method");

  const activePayments = useMemo(() => {
    return payments.filter((p) => p.status !== "cancelled");
  }, [payments]);

  const totalCollected = useMemo(() => {
    return activePayments.reduce((sum, p) => sum + Math.round(p.amount), 0);
  }, [activePayments]);

  // Method Breakdown
  const methodStats = useMemo(() => {
    const config: Record<
      PaymentMethod,
      { label: string; icon: any; color: string; bgBadge: string; barColor: string }
    > = {
      tmoney: {
        label: "TMoney (Mobile Money)",
        icon: Smartphone,
        color: "text-amber-600",
        bgBadge: "bg-amber-100 text-amber-900 border-amber-200",
        barColor: "bg-amber-500",
      },
      flooz: {
        label: "Flooz (Moov Money)",
        icon: Smartphone,
        color: "text-blue-600",
        bgBadge: "bg-blue-100 text-blue-900 border-blue-200",
        barColor: "bg-blue-500",
      },
      cash: {
        label: "Espèces (Caisse établissement)",
        icon: DollarSign,
        color: "text-emerald-600",
        bgBadge: "bg-emerald-100 text-emerald-900 border-emerald-200",
        barColor: "bg-emerald-500",
      },
      bank_transfer: {
        label: "Virement bancaire",
        icon: Landmark,
        color: "text-purple-600",
        bgBadge: "bg-purple-100 text-purple-900 border-purple-200",
        barColor: "bg-purple-500",
      },
      cheque: {
        label: "Chèque bancaire",
        icon: FileText,
        color: "text-indigo-600",
        bgBadge: "bg-indigo-100 text-indigo-900 border-indigo-200",
        barColor: "bg-indigo-500",
      },
      other: {
        label: "Autre moyen",
        icon: Wallet,
        color: "text-slate-600",
        bgBadge: "bg-slate-100 text-slate-800 border-slate-200",
        barColor: "bg-slate-500",
      },
    };

    const counts: Record<PaymentMethod, { amount: number; count: number }> = {
      tmoney: { amount: 0, count: 0 },
      flooz: { amount: 0, count: 0 },
      cash: { amount: 0, count: 0 },
      bank_transfer: { amount: 0, count: 0 },
      cheque: { amount: 0, count: 0 },
      other: { amount: 0, count: 0 },
    };

    activePayments.forEach((p) => {
      const m = p.payment_method || "cash";
      if (counts[m]) {
        counts[m].amount += Math.round(p.amount);
        counts[m].count += 1;
      } else {
        counts.other.amount += Math.round(p.amount);
        counts.other.count += 1;
      }
    });

    return (Object.keys(config) as PaymentMethod[])
      .map((key) => {
        const item = counts[key];
        const pct = totalCollected > 0 ? (item.amount / totalCollected) * 100 : 0;
        return {
          key,
          ...config[key],
          amount: item.amount,
          count: item.count,
          pct: Number(pct.toFixed(1)),
        };
      })
      .filter((item) => item.count > 0 || totalCollected === 0)
      .sort((a, b) => b.amount - a.amount);
  }, [activePayments, totalCollected]);

  // Period breakdown (Aujourd'hui, 7 derniers jours, 30 derniers jours, Plus ancien)
  const periodStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayAmt = 0;
    let todayCount = 0;
    let weekAmt = 0;
    let weekCount = 0;
    let monthAmt = 0;
    let monthCount = 0;
    let olderAmt = 0;
    let olderCount = 0;

    activePayments.forEach((p) => {
      if (!p.payment_date) return;
      const d = new Date(p.payment_date);
      d.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));

      const amt = Math.round(p.amount);
      if (diffDays === 0) {
        todayAmt += amt;
        todayCount++;
      } else if (diffDays <= 7) {
        weekAmt += amt;
        weekCount++;
      } else if (diffDays <= 30) {
        monthAmt += amt;
        monthCount++;
      } else {
        olderAmt += amt;
        olderCount++;
      }
    });

    const getP = (v: number) => (totalCollected > 0 ? Number(((v / totalCollected) * 100).toFixed(1)) : 0);

    return [
      {
        label: "Aujourd'hui",
        amount: todayAmt,
        count: todayCount,
        pct: getP(todayAmt),
        barColor: "bg-emerald-500",
      },
      {
        label: "7 derniers jours",
        amount: weekAmt,
        count: weekCount,
        pct: getP(weekAmt),
        barColor: "bg-blue-500",
      },
      {
        label: "Ce mois (30 jours)",
        amount: monthAmt,
        count: monthCount,
        pct: getP(monthAmt),
        barColor: "bg-indigo-500",
      },
      {
        label: "Périodes précédentes",
        amount: olderAmt,
        count: olderCount,
        pct: getP(olderAmt),
        barColor: "bg-slate-400",
      },
    ];
  }, [activePayments, totalCollected]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Répartition des Encaissements
            </h3>
            <p className="text-xs text-slate-400">
              Canaux de versement et distribution temporelle
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("by_method")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === "by_method"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Par Méthode
          </button>
          <button
            type="button"
            onClick={() => setViewMode("by_period")}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              viewMode === "by_period"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Par Période
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {viewMode === "by_method"
            ? methodStats.map((item) => (
                <div key={item.key} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
                      <span className="font-bold text-slate-800">{item.label}</span>
                      <span className="text-[10px] text-slate-400">
                        ({item.count} versement{item.count > 1 ? "s" : ""})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {formatFCFA(item.amount)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 font-mono w-12 text-right">
                        {item.pct.toString().replace(".", ",")} %
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(item.pct, item.amount > 0 ? 3 : 0))}%` }}
                    />
                  </div>
                </div>
              ))
            : periodStats.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{item.label}</span>
                      <span className="text-[10px] text-slate-400">
                        ({item.count} versement{item.count > 1 ? "s" : ""})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {formatFCFA(item.amount)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 font-mono w-12 text-right">
                        {item.pct.toString().replace(".", ",")} %
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.barColor} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, Math.max(item.pct, item.amount > 0 ? 3 : 0))}%` }}
                    />
                  </div>
                </div>
              ))}
      </div>
    </div>
  );
}
