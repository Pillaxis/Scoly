"use client";

import React from "react";
import Link from "next/link";
import { PlusCircle, FileSpreadsheet, UserPlus, Layers, Sparkles } from "lucide-react";
import { useGlobalModals } from "@/app/(dashboard)/layout";

export function DashboardEmptyState() {
  const { openPaymentModal, openImportModal, openStudentModal } = useGlobalModals();

  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-8 sm:p-12 text-center shadow-2xs space-y-6 max-w-3xl mx-auto my-6 animate-in fade-in">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto font-bold shadow-xs">
        <Sparkles className="w-7 h-7" />
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
          Bienvenue sur le Tableau de Bord SCOLY
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Votre espace financier est prêt. Enregistrez vos premières inscriptions ou importez vos données pour activer les analyses en temps réel.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => openImportModal("excel")}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-extrabold transition-all shadow-md cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          <span>Importer un fichier Excel / CSV</span>
        </button>

        <button
          type="button"
          onClick={() => openStudentModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-blue-600/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inscrire un élève</span>
        </button>

        <Link
          href="/tuition"
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Définir les grilles tarifaires</span>
        </Link>
      </div>
    </div>
  );
}
