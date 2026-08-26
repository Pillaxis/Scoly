"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  ArrowRight,
  ArrowLeft,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  DollarSign,
  Phone,
  HelpCircle,
} from "lucide-react";
import { ValidatedImportRow, DuplicateMatchInfo } from "@/types/import";
import { formatFCFA } from "@/lib/utils";

interface PreviewValidationGridProps {
  rows: ValidatedImportRow[];
  onUpdateRows: (updatedRows: ValidatedImportRow[]) => void;
  onProceedToImport: () => void;
  onBack: () => void;
}

type FilterTab = "ALL" | "VALID" | "WARNING" | "ERROR" | "DUPLICATE";

export function PreviewValidationGrid({
  rows,
  onUpdateRows,
  onProceedToImport,
  onBack,
}: PreviewValidationGridProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  // Statistiques globales
  const stats = useMemo(() => {
    let validCount = 0;
    let warningCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    let excludedCount = 0;

    rows.forEach((r) => {
      if (r.isExcluded) {
        excludedCount++;
      } else if (r.status === "error") {
        errorCount++;
      } else if (r.status === "duplicate") {
        duplicateCount++;
      } else if (r.status === "warning") {
        warningCount++;
      } else {
        validCount++;
      }
    });

    return {
      total: rows.length,
      valid: validCount,
      warning: warningCount,
      error: errorCount,
      duplicate: duplicateCount,
      excluded: excludedCount,
      importable: rows.length - errorCount - excludedCount,
    };
  }, [rows]);

  // Lignes filtrées
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Tab filter
      let matchTab = true;
      if (activeTab === "VALID") matchTab = row.status === "valid" && !row.isExcluded;
      if (activeTab === "WARNING") matchTab = row.status === "warning" && !row.isExcluded;
      if (activeTab === "ERROR") matchTab = row.status === "error" && !row.isExcluded;
      if (activeTab === "DUPLICATE") matchTab = row.status === "duplicate" && !row.isExcluded;

      // Search query
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        row.parsedStudent.first_name.toLowerCase().includes(q) ||
        row.parsedStudent.last_name.toLowerCase().includes(q) ||
        (row.parsedStudent.matricule && row.parsedStudent.matricule.toLowerCase().includes(q)) ||
        row.parsedStudent.class_name.toLowerCase().includes(q) ||
        (row.parsedParent?.phone_primary && row.parsedParent.phone_primary.includes(q));

      return matchTab && matchSearch;
    });
  }, [rows, activeTab, searchQuery]);

  // Gestion des actions de doublons
  const handleSetDuplicateAction = (
    rowIndex: number,
    action: DuplicateMatchInfo["action"]
  ) => {
    const updated = rows.map((r) => {
      if (r.rowIndex === rowIndex && r.duplicateInfo) {
        return {
          ...r,
          duplicateInfo: {
            ...r.duplicateInfo,
            action,
          },
        };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  // Action globale pour tous les doublons
  const handleBulkDuplicateAction = (action: DuplicateMatchInfo["action"]) => {
    const updated = rows.map((r) => {
      if (r.status === "duplicate" && r.duplicateInfo) {
        return {
          ...r,
          duplicateInfo: {
            ...r.duplicateInfo,
            action,
          },
        };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  // Toggle exclusion d'une ligne
  const handleToggleExclude = (rowIndex: number) => {
    const updated = rows.map((r) => {
      if (r.rowIndex === rowIndex) {
        return { ...r, isExcluded: !r.isExcluded };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  // Modification inline d'une cellule
  const handleInlineChange = (rowIndex: number, field: string, value: any) => {
    const updated = rows.map((r) => {
      if (r.rowIndex === rowIndex) {
        const student = { ...r.parsedStudent };
        const parent = { ...(r.parsedParent || { full_name: "", relationship: "Père" as const, phone_primary: "" }) };

        if (field === "first_name") student.first_name = value;
        if (field === "last_name") student.last_name = value;
        if (field === "class_name") student.class_name = value;
        if (field === "matricule") student.matricule = value;
        if (field === "parent_phone") parent.phone_primary = value;

        // Re-check basic errors
        const errors: string[] = [];
        if (!student.last_name) errors.push("Le nom de l'élève est manquant.");
        if (!student.first_name) errors.push("Le prénom de l'élève est manquant.");
        if (!student.class_name) errors.push("La classe n'est pas spécifiée.");

        return {
          ...r,
          parsedStudent: student,
          parsedParent: parent,
          errors,
          status: errors.length > 0 ? ("error" as const) : r.status === "error" ? ("valid" as const) : r.status,
        };
      }
      return r;
    });
    onUpdateRows(updated);
  };

  return (
    <div className="space-y-4">
      {/* Metric Cards de Contrôle */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setActiveTab("VALID")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "VALID"
              ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Lignes Valides</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black text-emerald-700 mt-1">✓ {stats.valid}</p>
        </div>

        <div
          onClick={() => setActiveTab("WARNING")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "WARNING"
              ? "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Avertissements</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-lg font-black text-amber-700 mt-1">⚠️ {stats.warning}</p>
        </div>

        <div
          onClick={() => setActiveTab("DUPLICATE")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "DUPLICATE"
              ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Doublons Détectés</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-lg font-black text-blue-700 mt-1">👥 {stats.duplicate}</p>
        </div>

        <div
          onClick={() => setActiveTab("ERROR")}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "ERROR"
              ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500">Erreurs Bloquantes</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-lg font-black text-rose-700 mt-1">❌ {stats.error}</p>
        </div>
      </div>

      {/* Barre d'action rapide pour Doublons */}
      {stats.duplicate > 0 && (
        <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-blue-950 font-bold">
            <Users className="w-4 h-4 text-blue-600" />
            <span>
              {stats.duplicate} élève(s) semblent déjà exister dans votre établissement.
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] text-blue-800 font-semibold mr-1">Règle globale :</span>
            <button
              type="button"
              onClick={() => handleBulkDuplicateAction("skip")}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px] shadow-2xs"
            >
              Tout ignorer
            </button>
            <button
              type="button"
              onClick={() => handleBulkDuplicateAction("update")}
              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] shadow-2xs"
            >
              Tout mettre à jour
            </button>
            <button
              type="button"
              onClick={() => handleBulkDuplicateAction("create_anyway")}
              className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px] shadow-2xs"
            >
              Créer quand même
            </button>
          </div>
        </div>
      )}

      {/* Barre de Recherche & Onglets */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        {/* Onglets */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Tous ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("VALID")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "VALID" ? "bg-white text-emerald-800 shadow-2xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Valides ({stats.valid})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("WARNING")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "WARNING" ? "bg-white text-amber-800 shadow-2xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Avertissements ({stats.warning})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("DUPLICATE")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "DUPLICATE" ? "bg-white text-blue-800 shadow-2xs" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Doublons ({stats.duplicate})
          </button>
          {stats.error > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("ERROR")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === "ERROR" ? "bg-white text-rose-800 shadow-2xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Erreurs ({stats.error})
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrer nom, matricule, classe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Grille Interactive de Prévisualisation */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs max-h-96 overflow-y-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-extrabold sticky top-0 border-b border-slate-200 z-10">
            <tr>
              <th className="p-3 w-10 text-center">#</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Nom de l&apos;élève</th>
              <th className="p-3">Prénom</th>
              <th className="p-3">Classe</th>
              <th className="p-3">Matricule</th>
              <th className="p-3">Parent & Téléphone</th>
              <th className="p-3">Paiement Initial</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRows.map((row) => {
              const isExcluded = row.isExcluded;
              const isEditing = editingRowIndex === row.rowIndex;

              return (
                <tr
                  key={row.rowIndex}
                  className={`transition-colors ${
                    isExcluded
                      ? "opacity-40 bg-slate-100/60 line-through"
                      : row.status === "error"
                      ? "bg-rose-50/50 hover:bg-rose-50"
                      : row.status === "duplicate"
                      ? "bg-blue-50/40 hover:bg-blue-50/70"
                      : row.status === "warning"
                      ? "bg-amber-50/30 hover:bg-amber-50/60"
                      : "hover:bg-slate-50/80"
                  }`}
                >
                  {/* N° de ligne */}
                  <td className="p-3 text-center font-mono text-slate-400 font-bold text-[11px]">
                    {row.rowIndex}
                  </td>

                  {/* Statut Badge */}
                  <td className="p-3 whitespace-nowrap">
                    {isExcluded ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                        Ignoré
                      </span>
                    ) : row.status === "valid" ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valide</span>
                      </span>
                    ) : row.status === "warning" ? (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Incomplet</span>
                        </span>
                        {row.warnings.slice(0, 1).map((w, i) => (
                          <p key={i} className="text-[10px] text-amber-700 max-w-[150px] truncate" title={w}>
                            {w}
                          </p>
                        ))}
                      </div>
                    ) : row.status === "duplicate" ? (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                          <Users className="w-3 h-3" />
                          <span>Doublon ({row.duplicateInfo?.matchReason})</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <select
                            value={row.duplicateInfo?.action}
                            onChange={(e) =>
                              handleSetDuplicateAction(
                                row.rowIndex,
                                e.target.value as DuplicateMatchInfo["action"]
                              )
                            }
                            className="text-[10px] font-bold bg-white border border-blue-300 rounded px-1.5 py-0.5 text-blue-900 focus:outline-none"
                          >
                            <option value="skip">Ignorer</option>
                            <option value="update">Mettre à jour</option>
                            <option value="create_anyway">Créer quand même</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          <span>Erreur</span>
                        </span>
                        {row.errors.map((e, i) => (
                          <p key={i} className="text-[10px] text-rose-700 max-w-[150px] truncate" title={e}>
                            {e}
                          </p>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Nom */}
                  <td className="p-3 font-extrabold text-slate-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.parsedStudent.last_name}
                        onChange={(e) => handleInlineChange(row.rowIndex, "last_name", e.target.value)}
                        className="px-2 py-1 border rounded text-xs w-28 bg-white"
                      />
                    ) : (
                      row.parsedStudent.last_name || <span className="text-rose-500 font-bold">Manquant</span>
                    )}
                  </td>

                  {/* Prénom */}
                  <td className="p-3 text-slate-700">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.parsedStudent.first_name}
                        onChange={(e) => handleInlineChange(row.rowIndex, "first_name", e.target.value)}
                        className="px-2 py-1 border rounded text-xs w-28 bg-white"
                      />
                    ) : (
                      row.parsedStudent.first_name || <span className="text-rose-500 font-bold">Manquant</span>
                    )}
                  </td>

                  {/* Classe */}
                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.parsedStudent.class_name}
                        onChange={(e) => handleInlineChange(row.rowIndex, "class_name", e.target.value)}
                        className="px-2 py-1 border rounded text-xs w-24 bg-white"
                      />
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-100 rounded-md font-bold text-slate-800 text-[11px]">
                        {row.parsedStudent.class_name || "Non assigné"}
                      </span>
                    )}
                  </td>

                  {/* Matricule */}
                  <td className="p-3 font-mono text-slate-600 text-[11px]">
                    {isEditing ? (
                      <input
                        type="text"
                        value={row.parsedStudent.matricule || ""}
                        onChange={(e) => handleInlineChange(row.rowIndex, "matricule", e.target.value)}
                        className="px-2 py-1 border rounded text-xs w-24 bg-white"
                      />
                    ) : (
                      row.parsedStudent.matricule || <span className="text-slate-400 italic">Auto</span>
                    )}
                  </td>

                  {/* Parent & Tél */}
                  <td className="p-3 text-slate-600 text-xs">
                    <div className="font-semibold text-slate-800">
                      {row.parsedParent?.full_name || "—"}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {row.parsedParent?.phone_primary || "—"}
                    </div>
                  </td>

                  {/* Paiement Initial */}
                  <td className="p-3 font-mono">
                    {row.parsedPayment ? (
                      <div>
                        <span className="font-extrabold text-emerald-700">
                          {formatFCFA(row.parsedPayment.amount)}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {row.parsedPayment.payment_method}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingRowIndex(isEditing ? null : row.rowIndex)
                        }
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isEditing
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                        title={isEditing ? "Valider la modification" : "Modifier la ligne"}
                      >
                        {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleExclude(row.rowIndex)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                          isExcluded
                            ? "bg-slate-200 text-slate-700 border-slate-300"
                            : "bg-white border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                        title={isExcluded ? "Réinclure la ligne" : "Ignorer cette ligne"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Barre de confirmation finale */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ajuster les colonnes</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-extrabold text-slate-900 block">
              Prêt pour l&apos;importation : {stats.importable} élève(s)
            </span>
            {stats.error > 0 && (
              <span className="text-[11px] text-rose-600 font-bold">
                {stats.error} ligne(s) avec erreurs seront ignorées
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onProceedToImport}
            disabled={stats.importable === 0}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Lancer l&apos;importation ({stats.importable})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
