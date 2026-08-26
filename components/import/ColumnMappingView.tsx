"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Columns,
  Eye,
} from "lucide-react";
import {
  ColumnMappingRule,
  TargetFieldKey,
} from "@/types/import";
import { TARGET_FIELDS_REGISTRY } from "@/lib/import/mappers/column-detector";

interface ColumnMappingViewProps {
  mappings: ColumnMappingRule[];
  sampleRows: Record<string, any>[];
  onChangeMapping: (updatedMappings: ColumnMappingRule[]) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export function ColumnMappingView({
  mappings,
  sampleRows,
  onChangeMapping,
  onConfirm,
  onBack,
}: ColumnMappingViewProps) {
  const [errorMessage, setErrorMessage] = useState("");

  const handleSelectField = (sourceHeader: string, targetKey: TargetFieldKey | "") => {
    const updated = mappings.map((m) => {
      if (m.sourceHeader === sourceHeader) {
        return {
          ...m,
          targetKey,
          isAutoDetected: false,
        };
      }
      // If targetKey is already used elsewhere, clear it to avoid duplicate mapping
      if (targetKey && m.targetKey === targetKey) {
        return {
          ...m,
          targetKey: "" as TargetFieldKey | "",
          isAutoDetected: false,
        };
      }
      return m;
    });

    onChangeMapping(updated);
  };

  const handleValidateMapping = () => {
    setErrorMessage("");

    const hasLastName = mappings.some((m) => m.targetKey === "last_name" || m.targetKey === "full_name");
    const hasClassName = mappings.some((m) => m.targetKey === "class_name");

    if (!hasLastName) {
      setErrorMessage("Veuillez associer au moins la colonne 'Nom de l'élève' (ou 'Nom & Prénom Combinés').");
      return;
    }

    if (!hasClassName) {
      setErrorMessage("Veuillez associer la colonne 'Classe' de l'élève.");
      return;
    }

    onConfirm();
  };

  const assignedCount = mappings.filter((m) => Boolean(m.targetKey)).length;

  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-900 text-sm">
              Correspondance des Colonnes
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {assignedCount} / {mappings.length} colonnes associées
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            SCOLY a reconnu automatiquement les colonnes ci-dessous. Vous pouvez ajuster chaque correspondance.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span className="font-bold">Détection IA intelligente</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Grille de Mapping des Colonnes */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
        <div className="grid grid-cols-12 gap-3 p-3 bg-slate-50 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
          <div className="col-span-4">Colonne de votre fichier</div>
          <div className="col-span-4">Exemples de valeurs</div>
          <div className="col-span-4">Correspondance SCOLY</div>
        </div>

        {mappings.map((mapping, idx) => {
          // Extraire des exemples de données pour cette colonne
          const examples = sampleRows
            .slice(0, 3)
            .map((r) => r[mapping.sourceHeader])
            .filter((v) => v !== undefined && v !== null && String(v).trim().length > 0)
            .map((v) => String(v).trim());

          const targetDef = TARGET_FIELDS_REGISTRY.find((f) => f.key === mapping.targetKey);

          return (
            <div
              key={idx}
              className={`grid grid-cols-12 gap-3 p-3.5 items-center transition-colors ${
                mapping.targetKey ? "bg-white hover:bg-slate-50/60" : "bg-slate-50/50 hover:bg-slate-100/50"
              }`}
            >
              {/* Colonne Source */}
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <Columns className="w-3.5 h-3.5" />
                </div>
                <div className="truncate">
                  <span className="font-extrabold text-xs text-slate-900 block truncate">
                    {mapping.sourceHeader}
                  </span>
                  {mapping.isAutoDetected && (
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      ✓ Auto-détecté ({mapping.confidence}%)
                    </span>
                  )}
                </div>
              </div>

              {/* Exemples de Valeurs */}
              <div className="col-span-4 text-xs text-slate-500">
                {examples.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {examples.map((ex, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-100 border border-slate-200/80 rounded text-[11px] font-mono text-slate-700 truncate max-w-[120px]"
                        title={ex}
                      >
                        {ex}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">Aucune donnée</span>
                )}
              </div>

              {/* Sélecteur de Champ SCOLY */}
              <div className="col-span-4">
                <select
                  value={mapping.targetKey}
                  onChange={(e) =>
                    handleSelectField(mapping.sourceHeader, e.target.value as TargetFieldKey | "")
                  }
                  className={`w-full px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    mapping.targetKey
                      ? "bg-blue-50/70 border-blue-300 text-blue-900"
                      : "bg-white border-slate-200 text-slate-400"
                  }`}
                >
                  <option value="">— Ignorer cette colonne —</option>

                  <optgroup label="Élève">
                    <option value="last_name">Nom de l&apos;élève *</option>
                    <option value="first_name">Prénom de l&apos;élève *</option>
                    <option value="full_name">Nom & Prénom Combinés</option>
                    <option value="class_name">Classe / Niveau *</option>
                    <option value="matricule">Matricule</option>
                    <option value="gender">Sexe (M / F)</option>
                    <option value="birth_date">Date de naissance</option>
                  </optgroup>

                  <optgroup label="Parent / Tuteur">
                    <option value="parent_name">Nom du parent / tuteur</option>
                    <option value="parent_phone">Téléphone principal</option>
                    <option value="parent_whatsapp">WhatsApp parent</option>
                    <option value="parent_relationship">Lien de parenté (Père, Mère...)</option>
                    <option value="parent_profession">Profession</option>
                    <option value="parent_address">Adresse / Quartier</option>
                  </optgroup>

                  <optgroup label="Scolarité & Remises">
                    <option value="tuition_amount">Montant scolarité annuelle</option>
                    <option value="discount_amount">Montant de la remise</option>
                    <option value="discount_reason">Motif de la remise</option>
                  </optgroup>

                  <optgroup label="Paiements & Encaissements">
                    <option value="payment_amount">Montant versé / acompte</option>
                    <option value="payment_date">Date du paiement</option>
                    <option value="payment_method">Mode de paiement (Espèces, Flooz...)</option>
                    <option value="payment_ref">Référence / N° Reçu</option>
                    <option value="payment_notes">Notes de paiement</option>
                  </optgroup>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour</span>
        </button>

        <button
          type="button"
          onClick={handleValidateMapping}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <span>Prévisualiser les données</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
