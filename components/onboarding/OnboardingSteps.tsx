"use client";

import React, { useState, useMemo } from "react";
import {
  FileSpreadsheet,
  FileText,
  Camera,
  Link2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  Calculator,
  ShieldCheck,
  School as SchoolIcon,
  Users,
  Check,
  CreditCard,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SchoolClass, TuitionPlan, TuitionInstallment } from "@/types/scoly";
import { ImportModal } from "@/components/import/ImportModal";
import { ImportSourceType } from "@/types/import";
import { useScoly } from "@/lib/store";
import { validateTuitionPlan, saveTuitionPlan } from "@/lib/services/tuition.service";

import { parseExcelOrCsvFile, ParsedSheetData } from "@/lib/import/parsers/excel-csv-parser";

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 1 : IMPORTER LES ÉLÈVES
// ─────────────────────────────────────────────────────────────────────────────
export function Step1ImportStudents({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const { students, classes } = useScoly();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importSource, setImportSource] = useState<ImportSourceType>("excel");
  const [initialSheetData, setInitialSheetData] = useState<ParsedSheetData | null>(null);
  const [initialFileName, setInitialFileName] = useState<string>("");
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string>("");

  const excelInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);

  const openImport = (source: ImportSourceType) => {
    setInitialSheetData(null);
    setInitialFileName("");
    setImportSource(source);
    setIsImportModalOpen(true);
  };

  // Direct device file handler: Opens file immediately, parses it, and launches preview
  const handleDeviceFile = async (file: File, isPdf = false) => {
    setParseError("");
    setIsParsing(true);
    try {
      if (isPdf || file.name.toLowerCase().endsWith(".pdf")) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/import/pdf", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || "Impossible d'extraire les données du fichier PDF.");
        }

        const sheetData: ParsedSheetData = {
          sheetName: "Document PDF",
          headers: data.headers || ["Nom & Prénom", "Classe", "Genre", "Matricule", "Parent / Contact"],
          rows: data.rows || [],
          totalRows: data.totalRows || 0,
        };

        setInitialSheetData(sheetData);
        setInitialFileName(file.name);
        setImportSource("excel");
        setIsImportModalOpen(true);
      } else {
        const result = await parseExcelOrCsvFile(file);
        if (result.sheetNames.length === 0) {
          throw new Error("Aucune donnée lisible détectée dans ce fichier.");
        }
        const sheet = result.sheets[result.selectedSheetName];
        if (!sheet || sheet.rows.length === 0) {
          throw new Error("La feuille sélectionnée ne contient aucune ligne.");
        }

        setInitialSheetData(sheet);
        setInitialFileName(file.name);
        setImportSource("excel");
        setIsImportModalOpen(true);
      }
    } catch (err: any) {
      setParseError(err.message || "Erreur lors de la lecture du fichier.");
    } finally {
      setIsParsing(false);
    }
  };

  const hasStudents = students.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hidden file inputs for direct device selection */}
      <input
        ref={excelInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleDeviceFile(e.target.files[0], false);
            e.target.value = "";
          }
        }}
      />
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleDeviceFile(e.target.files[0], true);
            e.target.value = "";
          }
        }}
      />

      {/* Header */}
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Étape 1 sur 3</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          1. Importez vos élèves
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
          Sélectionnez directement votre fichier depuis votre appareil. Vos élèves et vos classes seront automatiquement détectés.
        </p>
      </div>

      {parseError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {/* If students are already present */}
      {hasStudents ? (
        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-emerald-950">
                  ✓ {students.length} élève{students.length > 1 ? "s" : ""} déjà importé{students.length > 1 ? "s" : ""}
                </h3>
                <p className="text-xs text-emerald-700">
                  Répartis dans {classes.length} classe{classes.length > 1 ? "s" : ""} détectée{classes.length > 1 ? "s" : ""}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => excelInputRef.current?.click()}
              className="px-3.5 py-2 bg-white hover:bg-emerald-100/50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Importer d&apos;autres élèves</span>
            </button>
          </div>

          {/* Classes pill list preview */}
          {classes.length > 0 && (
            <div className="pt-2 border-t border-emerald-200/60 flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] font-bold text-emerald-900 mr-1">Classes créées :</span>
              {classes.slice(0, 8).map((c) => (
                <span
                  key={c.id}
                  className="px-2.5 py-1 bg-white text-emerald-900 border border-emerald-200 rounded-lg text-xs font-bold"
                >
                  {c.name}
                </span>
              ))}
              {classes.length > 8 && (
                <span className="text-xs text-emerald-700 font-semibold">
                  +{classes.length - 8} autres
                </span>
              )}
            </div>
          )}

          <div className="pt-3 flex justify-end">
            <button
              type="button"
              onClick={onContinue}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Continuer vers les tarifs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* 4 Simple Direct Import Cards */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {/* Option 1: Excel / CSV (Direct Device File Selector) */}
          <button
            type="button"
            onClick={() => excelInputRef.current?.click()}
            disabled={isParsing}
            className="p-5 bg-white hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-500 rounded-3xl text-left transition-all duration-200 group cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                {isParsing ? "Lecture..." : "Depuis l'appareil"}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Choisir un fichier Excel ou CSV
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ouvre directement les fichiers de votre ordinateur ou téléphone (.xlsx, .csv).
              </p>
            </div>
          </button>

          {/* Option 2: Google Sheets */}
          <button
            type="button"
            onClick={() => openImport("google_sheets")}
            className="p-5 bg-white hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-500 rounded-3xl text-left transition-all duration-200 group cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between min-h-[140px]"
          >
            <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Link2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Google Sheets
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Collez simplement le lien de partage de votre tableau Google en ligne.
              </p>
            </div>
          </button>

          {/* Option 3: Document PDF (Direct Device File Selector) */}
          <button
            type="button"
            onClick={() => pdfInputRef.current?.click()}
            disabled={isParsing}
            className="p-5 bg-white hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-500 rounded-3xl text-left transition-all duration-200 group cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between min-h-[140px]"
          >
            <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Choisir un Document PDF
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Sélectionnez une liste d&apos;élèves ou un registre PDF de votre appareil.
              </p>
            </div>
          </button>

          {/* Option 4: Photo / Caméra */}
          <button
            type="button"
            onClick={() => openImport("photo_ocr")}
            className="p-5 bg-white hover:bg-blue-50/50 border-2 border-slate-200 hover:border-blue-500 rounded-3xl text-left transition-all duration-200 group cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between min-h-[140px]"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                Photo de registre (OCR)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Prenez en photo une feuille de classe ou un registre papier avec la caméra.
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Modal d'importation unifiée */}
      <ImportModal
        isOpen={isImportModalOpen}
        initialSource={importSource}
        initialSheetData={initialSheetData}
        initialFileName={initialFileName}
        onClose={() => {
          setIsImportModalOpen(false);
          setInitialSheetData(null);
          setInitialFileName("");
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 2 : CONFIGURER LES TARIFS
// ─────────────────────────────────────────────────────────────────────────────
export function Step2SetupTuition({
  onContinue,
}: {
  onContinue: () => void;
}) {
  const { classes, tuitionPlans, academicYear, school, updateTuitionPlans } = useScoly();

  // Local editable plans keyed by class_id
  const [plansState, setPlansState] = useState<Record<string, { total: number; installments: TuitionInstallment[] }>>(() => {
    const map: Record<string, { total: number; installments: TuitionInstallment[] }> = {};
    for (const c of classes) {
      const existing = tuitionPlans.find((tp) => tp.class_id === c.id);
      if (existing && existing.total_amount > 0) {
        map[c.id] = {
          total: existing.total_amount,
          installments: existing.installments || [
            { id: "1", tuition_plan_id: existing.id, title: "Tranche 1", amount: Math.round(existing.total_amount / 3), due_date: "2025-10-15", installment_order: 1 },
            { id: "2", tuition_plan_id: existing.id, title: "Tranche 2", amount: Math.round(existing.total_amount / 3), due_date: "2026-01-15", installment_order: 2 },
            { id: "3", tuition_plan_id: existing.id, title: "Tranche 3", amount: existing.total_amount - 2 * Math.round(existing.total_amount / 3), due_date: "2026-04-15", installment_order: 3 },
          ],
        };
      } else {
        const defaultTotal = 120000;
        const t1 = 40000;
        const t2 = 40000;
        const t3 = 40000;
        map[c.id] = {
          total: defaultTotal,
          installments: [
            { id: "1", tuition_plan_id: "", title: "Tranche 1", amount: t1, due_date: "2025-10-15", installment_order: 1 },
            { id: "2", tuition_plan_id: "", title: "Tranche 2", amount: t2, due_date: "2026-01-15", installment_order: 2 },
            { id: "3", tuition_plan_id: "", title: "Tranche 3", amount: t3, due_date: "2026-04-15", installment_order: 3 },
          ],
        };
      }
    }
    return map;
  });

  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [globalAmountInput, setGlobalAmountInput] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Update total amount for a class and auto-distribute into 3 balanced installments
  const handleTotalChange = (classId: string, newTotal: number) => {
    const validTotal = Math.max(0, newTotal || 0);
    const t1 = Math.round(validTotal / 3);
    const t2 = Math.round(validTotal / 3);
    const t3 = validTotal - (t1 + t2);

    setPlansState((prev) => ({
      ...prev,
      [classId]: {
        total: validTotal,
        installments: [
          { id: "1", tuition_plan_id: "", title: "Tranche 1", amount: t1, due_date: "2025-10-15", installment_order: 1 },
          { id: "2", tuition_plan_id: "", title: "Tranche 2", amount: t2, due_date: "2026-01-15", installment_order: 2 },
          { id: "3", tuition_plan_id: "", title: "Tranche 3", amount: t3, due_date: "2026-04-15", installment_order: 3 },
        ],
      },
    }));
  };

  // Update specific installment amount
  const handleInstallmentAmountChange = (classId: string, index: number, amount: number) => {
    setPlansState((prev) => {
      const current = prev[classId];
      if (!current) return prev;
      const updated = [...current.installments];
      if (updated[index]) {
        updated[index] = { ...updated[index], amount: Math.max(0, amount || 0) };
      }
      return {
        ...prev,
        [classId]: {
          ...current,
          installments: updated,
        },
      };
    });
  };

  // Apply a single amount to all classes in 1 click
  const handleApplyToAll = () => {
    const val = Number(globalAmountInput);
    if (!val || val <= 0) return;
    classes.forEach((c) => handleTotalChange(c.id, val));
    setGlobalAmountInput("");
  };

  // Check validity for every class
  const validityMap = useMemo(() => {
    const res: Record<string, { isValid: boolean; error?: string; sum: number }> = {};
    for (const c of classes) {
      const p = plansState[c.id];
      if (!p) {
        res[c.id] = { isValid: false, error: "Tarif manquant", sum: 0 };
        continue;
      }
      const sum = (p.installments || []).reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
      const isValid = p.total > 0 && sum === p.total;
      let error = undefined;
      if (p.total <= 0) {
        error = "Le montant doit être supérieur à 0.";
      } else if (sum !== p.total) {
        error = `Le total des tranches (${sum.toLocaleString("fr-FR")} FCFA) doit être égal au montant annuel (${p.total.toLocaleString("fr-FR")} FCFA).`;
      }
      res[c.id] = { isValid, error, sum };
    }
    return res;
  }, [classes, plansState]);

  const isAllValid = classes.length > 0 && classes.every((c) => validityMap[c.id]?.isValid);

  const handleSaveAndContinue = async () => {
    if (!isAllValid) return;
    setIsSaving(true);
    try {
      const newPlans: TuitionPlan[] = [];
      for (const c of classes) {
        const p = plansState[c.id];
        if (!p) continue;
        const planObj: TuitionPlan = {
          id: `plan-${c.id}`,
          school_id: school.id,
          academic_year_id: academicYear.id,
          class_id: c.id,
          total_amount: p.total,
          installments: p.installments,
        };
        newPlans.push(planObj);
        await saveTuitionPlan(planObj, school.id, academicYear.id);
      }
      updateTuitionPlans(newPlans);
      onContinue();
    } finally {
      setIsSaving(false);
    }
  };

  if (classes.length === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-3xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Aucune classe détectée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Veuillez d&apos;abord importer vos élèves à l&apos;étape 1 pour que vos classes soient automatiquement créées.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1.5 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-200">
          <Calculator className="w-3.5 h-3.5" />
          <span>Étape 2 sur 3</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          2. Configurez vos tarifs
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
          Indiquez combien chaque élève doit payer pour l&apos;année scolaire. La somme des tranches doit correspondre exactement au montant annuel.
        </p>
      </div>

      {/* Quick Apply to All Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700">Appliquer un tarif unique à toutes les classes :</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="number"
            placeholder="Ex: 120000"
            value={globalAmountInput}
            onChange={(e) => setGlobalAmountInput(e.target.value)}
            className="w-32 px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="button"
            onClick={handleApplyToAll}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
          >
            Appliquer partout
          </button>
        </div>
      </div>

      {/* Classes Tuition List */}
      <div className="space-y-3">
        {classes.map((c) => {
          const plan = plansState[c.id] || { total: 0, installments: [] };
          const validity = validityMap[c.id] || { isValid: true, sum: 0 };
          const isExpanded = expandedClassId === c.id;

          return (
            <div
              key={c.id}
              className={`border rounded-2xl p-4 transition-all duration-150 ${
                !validity.isValid
                  ? "bg-rose-50/40 border-rose-300"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Row header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                    {c.name.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{c.name}</h3>
                    <span className="text-[11px] text-slate-500 font-medium">{c.level || "Classe standard"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Scolarité annuelle :</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={plan.total || ""}
                        onChange={(e) => handleTotalChange(c.id, Number(e.target.value))}
                        className="w-32 px-3 py-1.5 bg-slate-50 border border-slate-300 focus:bg-white focus:ring-2 focus:ring-blue-600 rounded-xl font-black text-slate-900 text-xs focus:outline-none text-right pr-7"
                      />
                      <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-bold">F</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedClassId(isExpanded ? null : c.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Détail des tranches"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error banner if unequal */}
              {!validity.isValid && validity.error && (
                <div className="mt-3 p-2.5 bg-rose-100/70 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validity.error}</span>
                </div>
              )}

              {/* Installments details (Always visible if expanded or if error) */}
              {(isExpanded || !validity.isValid) && (
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {plan.installments.map((inst, idx) => (
                    <div key={inst.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                        <span>{inst.title || `Tranche ${idx + 1}`}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{inst.due_date}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={inst.amount || ""}
                          onChange={(e) => handleInstallmentAmountChange(c.id, idx, Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 text-right pr-6"
                        />
                        <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-bold">F</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer validation button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={!isAllValid || isSaving}
          className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white rounded-2xl text-xs font-black shadow-lg shadow-blue-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <span>{isSaving ? "Enregistrement des tarifs..." : "Valider mes tarifs & continuer"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 3 : ENREGISTRER LES PAIEMENTS (FINALISATION)
// ─────────────────────────────────────────────────────────────────────────────
export function Step3ReadyPayments({
  onFinish,
  onOpenPayment,
}: {
  onFinish: () => void;
  onOpenPayment: () => void;
}) {
  const { students, classes, tuitionPlans } = useScoly();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-center max-w-xl mx-auto py-4">
      {/* Header Badge */}
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
        <Check className="w-8 h-8 stroke-[3]" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Étape 3 sur 3 • Établissement prêt</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          3. Commencez à enregistrer les paiements
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Votre établissement est parfaitement configuré. Vos élèves et leurs tarifs sont prêts. Vous pouvez immédiatement encaisser votre premier versement.
        </p>
      </div>

      {/* Summary Checklist */}
      <div className="p-5 bg-slate-50 border border-slate-200/90 rounded-3xl text-left space-y-3 shadow-2xs">
        <div className="flex items-center gap-3 text-xs text-slate-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{students.length} élève{students.length > 1 ? "s" : ""} enregistré{students.length > 1 ? "s" : ""} avec succès</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{classes.length} classe{classes.length > 1 ? "s" : ""} et leurs grilles tarifaires activées</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-700 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Moteur de caisse transactionnel & reçus certifiés prêts</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onOpenPayment}
          className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Enregistrer un paiement</span>
        </button>

        <button
          type="button"
          onClick={onFinish}
          className="w-full sm:w-auto px-7 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Accéder au tableau de bord</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
