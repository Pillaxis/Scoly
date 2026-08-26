"use client";

import React from "react";
import {
  FileSpreadsheet,
  FileText,
  Camera,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { ImportSourceType } from "@/types/import";
import { AcademicYear } from "@/types/scoly";

interface SourceSelectorProps {
  selectedSource: ImportSourceType;
  onSelectSource: (source: ImportSourceType) => void;
  academicYear: AcademicYear;
  onNext: () => void;
}

export function SourceSelector({
  selectedSource,
  onSelectSource,
  academicYear,
  onNext,
}: SourceSelectorProps) {
  const methods: {
    id: ImportSourceType;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    badge: string;
    accentColor: string;
    borderActive: string;
    bgActive: string;
    details: string[];
  }[] = [
    {
      id: "excel",
      title: "📊 Importer Excel / CSV",
      subtitle: "Importez un fichier existant depuis votre ordinateur ou clé USB",
      icon: FileSpreadsheet,
      badge: ".xlsx, .xls, .csv",
      accentColor: "text-emerald-600",
      borderActive: "border-emerald-500 ring-2 ring-emerald-500/20",
      bgActive: "bg-emerald-50/50",
      details: ["Détection automatique des colonnes", "Support multi-feuilles", "Validation avant écriture"],
    },
    {
      id: "google_sheets",
      title: "📄 Importer Google Sheets",
      subtitle: "Connectez ou importez vos données directement depuis Google Sheets",
      icon: FileText,
      badge: "Lien & Export Sheets",
      accentColor: "text-blue-600",
      borderActive: "border-blue-500 ring-2 ring-blue-500/20",
      bgActive: "bg-blue-50/50",
      details: ["Lien de partage direct", "Compatible Google Drive", "Conversion instantanée"],
    },
    {
      id: "photo_ocr",
      title: "📷 Scanner un registre papier",
      subtitle: "Prenez une photo de votre cahier d'inscription ou registre de paiements",
      icon: Camera,
      badge: "Photo & OCR Mobile",
      accentColor: "text-purple-600",
      borderActive: "border-purple-500 ring-2 ring-purple-500/20",
      bgActive: "bg-purple-50/50",
      details: ["Reconnaissance optique réelle", "Vérification humaine obligatoire", "Prise de vue smartphone"],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Contextuel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/90">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Année Scolaire Cible
            </span>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                {academicYear.name || "2025-2026"}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                Active
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Toutes les données importées seront vérifiées et prévisualisées avant enregistrement.</span>
        </div>
      </div>

      {/* 3 Cartes de Sélection des Méthodes */}
      <div className="space-y-3">
        <label className="block text-xs font-extrabold text-slate-900 uppercase tracking-wider">
          Choisissez votre méthode d&apos;importation
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {methods.map((m) => {
            const isSelected = selectedSource === m.id;
            const Icon = m.icon;

            return (
              <div
                key={m.id}
                onClick={() => onSelectSource(m.id)}
                className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? `${m.borderActive} ${m.bgActive} shadow-sm bg-white`
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                        isSelected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm mb-1">{m.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{m.subtitle}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-1">
                  {m.details.map((d, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                      <span className="text-emerald-600 font-black">✓</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Suivant */}
      <div className="flex items-center justify-end pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <span>Continuer vers l&apos;importation</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
