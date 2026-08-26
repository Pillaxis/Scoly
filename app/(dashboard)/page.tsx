"use client";

import React from "react";
import { PlusCircle, FileSpreadsheet } from "lucide-react";
import { MetricCards } from "@/components/dashboard/MetricCards";
import { UrgentActionCenter } from "@/components/dashboard/UrgentActionCenter";
import { RevenueEvolutionChart } from "@/components/dashboard/RevenueEvolutionChart";
import { StudentStatusDonut } from "@/components/dashboard/StudentStatusDonut";
import { PaymentMethodsBreakdown } from "@/components/dashboard/PaymentMethodsBreakdown";
import { RecentPaymentsSection } from "@/components/dashboard/RecentPaymentsSection";
import { DebtorsPreviewSection } from "@/components/dashboard/DebtorsPreviewSection";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { useGlobalModals } from "./layout";
import { useScoly } from "@/lib/store";

export default function DashboardPage() {
  const { openPaymentModal, openReceiptModal, openReminderModal, openImportModal } = useGlobalModals();
  const { isLoaded } = useScoly();

  if (!isLoaded) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Tableau de Bord Financier
            </h1>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              En direct
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Situation globale de la trésorerie et suivi des scolarités en temps réel.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openImportModal("excel")}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Importer des données</span>
          </button>

          <button
            type="button"
            onClick={() => openPaymentModal()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 hover:shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouvel Encaissement</span>
          </button>
        </div>
      </div>

      {/* NIVEAU 1 : 4 KPI Cards */}
      <MetricCards />

      {/* NIVEAU 2 : Graphique Principal + Donut (Camembert) Statut Élèves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueEvolutionChart />
        </div>
        <div className="lg:col-span-1">
          <StudentStatusDonut />
        </div>
      </div>

      {/* NIVEAU 3 : Centre d'Actions — À Traiter Aujourd'hui */}
      <UrgentActionCenter />

      {/* NIVEAU 4 : Répartition des Encaissements */}
      <PaymentMethodsBreakdown />

      {/* NIVEAU 5 : Top des Impayés & Derniers Encaissements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentPaymentsSection
          onSelectPaymentReceipt={(payment) => openReceiptModal(payment)}
        />
        <DebtorsPreviewSection
          onOpenReminderModal={(student) => openReminderModal(student)}
        />
      </div>
    </div>
  );
}
