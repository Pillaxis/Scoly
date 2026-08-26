"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Users,
  CreditCard,
  Phone,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ImportSummary } from "@/types/import";

interface ImportSummaryViewProps {
  summary: ImportSummary;
  onReset: () => void;
  onClose: () => void;
}

export function ImportSummaryView({ summary, onReset, onClose }: ImportSummaryViewProps) {
  const router = useRouter();

  const handleGoToStudents = () => {
    onClose();
    router.push("/students");
  };

  const handleGoToPayments = () => {
    onClose();
    router.push("/payments");
  };

  return (
    <div className="space-y-6 animate-in fade-in max-w-xl mx-auto py-4">
      {/* Header Succès */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h3 className="text-xl font-black text-slate-900 tracking-tight">
          Importation Terminée !
        </h3>
        <p className="text-xs text-slate-500">
          Vos données scolaires ont été intégrées et calculées avec succès dans SCOLY.
        </p>
      </div>

      {/* Cartes de Bilan Détaillé */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center">
          <Users className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Élèves créés</span>
          <p className="text-lg font-black text-emerald-800">{summary.studentsImported}</p>
        </div>

        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-center">
          <Phone className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Parents liés</span>
          <p className="text-lg font-black text-blue-800">{summary.parentsAssociated}</p>
        </div>

        <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-center">
          <CreditCard className="w-5 h-5 text-purple-600 mx-auto mb-1.5" />
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Paiements</span>
          <p className="text-lg font-black text-purple-800">{summary.paymentsImported}</p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center">
          <AlertTriangle className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
          <span className="text-[10px] font-bold uppercase text-slate-500 block">Lignes ignorées</span>
          <p className="text-lg font-black text-slate-700">{summary.rowsSkipped}</p>
        </div>
      </div>

      {/* Traçabilité & Année Scolaire */}
      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
        <div className="flex items-center justify-between">
          <span>Source importée :</span>
          <strong className="text-slate-900 capitalize font-mono">{summary.sourceType}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Année scolaire :</span>
          <strong className="text-slate-900">{summary.academicYearName}</strong>
        </div>
        <div className="flex items-center justify-between">
          <span>Identifiant d&apos;audit :</span>
          <code className="text-[10px] text-slate-500">{summary.batchId}</code>
        </div>
      </div>

      {/* Boutons d'Action & Navigation */}
      <div className="space-y-2.5 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleGoToStudents}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Users className="w-4 h-4" />
            <span>Voir la liste des élèves</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleGoToPayments}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Voir le journal des paiements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Faire un autre import</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
