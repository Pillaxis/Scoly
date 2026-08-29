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
  Calculator,
  Check,
  CreditCard,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
  FileUp,
} from "lucide-react";
import { SchoolClass, TuitionPlan, TuitionInstallment } from "@/types/scoly";
import { ImportSourceType, ValidatedImportRow } from "@/types/import";
import { useScoly } from "@/lib/store";
import { validateTuitionPlan, saveTuitionPlan } from "@/lib/services/tuition.service";
import { parseExcelOrCsvFile, ParsedSheetData } from "@/lib/import/parsers/excel-csv-parser";
import { detectColumnMapping } from "@/lib/import/mappers/column-detector";
import { validateImportRows } from "@/lib/import/validation/data-validator";
import { checkDuplicatesAgainstExistingStudents } from "@/lib/import/validation/duplicate-checker";
import { executeBatchImport } from "@/lib/import/batch/batch-processor";

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 1 : IMPORTER LES ÉLÈVES (ANALYSE SOBRE DIRECTE SANS FENÊTRE CLIGNOTANTE)
// ─────────────────────────────────────────────────────────────────────────────
export function Step1ImportStudents({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip?: () => void;
}) {
  const {
    students,
    classes,
    school,
    academicYear,
    addStudent,
    updateStudent,
    addPayment,
    logAudit,
    recordImportBatch,
    syncLocalToSupabase,
  } = useScoly();

  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");

  // In-step file analysis state
  const [analyzedFile, setAnalyzedFile] = useState<{
    fileName: string;
    sourceType: ImportSourceType;
    rows: ValidatedImportRow[];
    classesDetected: string[];
    paymentsCount: number;
    paymentsTotal: number;
    parentsCount: number;
  } | null>(null);

  // Sheets modal state (inline)
  const [isSheetsInputOpen, setIsSheetsInputOpen] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState("");

  const excelInputRef = React.useRef<HTMLInputElement>(null);
  const pdfInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Analyze file and compute summary directly
  const processSheetData = (fileName: string, sheetData: ParsedSheetData, sourceType: ImportSourceType) => {
    const detectedMappings = detectColumnMapping(sheetData.headers);
    const validated = validateImportRows(sheetData.rows, detectedMappings, classes);
    const withDuplicates = checkDuplicatesAgainstExistingStudents(validated, students);

    // Extract unique classes
    const uniqueClasses = Array.from(
      new Set(
        withDuplicates
          .map((r) => r.parsedStudent.class_name?.trim())
          .filter((c): c is string => Boolean(c && c.length > 0))
      )
    );

    // Compute payments
    const paymentsRows = withDuplicates.filter((r) => r.parsedPayment && r.parsedPayment.amount > 0);
    const totalPaymentsAmount = paymentsRows.reduce((sum, r) => sum + (r.parsedPayment?.amount || 0), 0);

    // Compute parents with phones
    const parentsWithPhone = withDuplicates.filter(
      (r) => r.parsedParent?.phone_primary && r.parsedParent.phone_primary !== "—"
    );

    setAnalyzedFile({
      fileName,
      sourceType,
      rows: withDuplicates,
      classesDetected: uniqueClasses,
      paymentsCount: paymentsRows.length,
      paymentsTotal: totalPaymentsAmount,
      parentsCount: parentsWithPhone.length,
    });
  };

  // Direct device file handler
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

        processSheetData(file.name, sheetData, "excel");
      } else {
        const result = await parseExcelOrCsvFile(file);
        if (result.sheetNames.length === 0) {
          throw new Error("Aucune donnée lisible détectée dans ce fichier.");
        }
        const sheet = result.sheets[result.selectedSheetName];
        if (!sheet || sheet.rows.length === 0) {
          throw new Error("La feuille sélectionnée ne contient aucune ligne.");
        }

        processSheetData(file.name, sheet, "excel");
      }
    } catch (err: any) {
      setParseError(err.message || "Erreur lors de la lecture du fichier.");
    } finally {
      setIsParsing(false);
    }
  };

  // Google Sheets import handler
  const handleFetchGoogleSheets = async () => {
    if (!sheetsUrl.trim()) return;
    setParseError("");
    setIsParsing(true);
    try {
      const res = await fetch("/api/import/google-sheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sheetsUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Impossible d'importer le tableau Google Sheets.");
      }
      const sheetData: ParsedSheetData = {
        sheetName: "Google Sheets",
        headers: data.headers || [],
        rows: data.rows || [],
        totalRows: (data.rows || []).length,
      };
      processSheetData("Google Sheets en ligne", sheetData, "google_sheets");
      setIsSheetsInputOpen(false);
    } catch (err: any) {
      setParseError(err.message || "Erreur lors de la récupération du Google Sheets.");
    } finally {
      setIsParsing(false);
    }
  };

  // Confirm import and batch execute
  const handleConfirmImport = async () => {
    if (!analyzedFile || analyzedFile.rows.length === 0) return;
    setIsImporting(true);
    setImportProgress("Importation en cours...");

    try {
      const summary = await executeBatchImport({
        rows: analyzedFile.rows,
        sourceType: analyzedFile.sourceType,
        fileName: analyzedFile.fileName,
        academicYearId: academicYear.id,
        academicYearName: academicYear.name,
        school,
        existingStudents: students,
        availableClasses: classes,
        batchSize: 50,
        onProgress: (p) => {
          setImportProgress(`Importation : ${p.processedRows}/${p.totalRows} élèves...`);
        },
        onAddStudent: addStudent,
        onUpdateStudent: updateStudent,
        onAddPayment: addPayment,
        onLogAudit: logAudit,
      });

      // Record batch record
      recordImportBatch({
        id: summary.batchId,
        school_id: school.id,
        academic_year_id: academicYear.id,
        source_type: analyzedFile.sourceType,
        file_name: analyzedFile.fileName,
        total_rows: summary.totalDetected,
        imported_students_count: summary.studentsImported,
        imported_payments_count: summary.paymentsImported,
        errors_count: summary.errorsCount,
        duplicates_count: summary.rowsSkipped,
        payload_summary: summary,
        created_at: summary.importedAt,
      });

      syncLocalToSupabase().catch(() => {});
      setAnalyzedFile(null);
      onContinue();
    } catch (err: any) {
      setParseError(err.message || "Erreur lors de l'enregistrement des données.");
    } finally {
      setIsImporting(false);
    }
  };

  const hasStudents = students.length > 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
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
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleDeviceFile(e.target.files[0], false);
            e.target.value = "";
          }
        }}
      />

      {/* Header épuré */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          1. Importer les élèves
        </h2>
        <p className="text-xs text-slate-500 max-w-lg">
          Ajoutez votre liste d&apos;élèves depuis un fichier de votre appareil ou collez un lien.
        </p>
      </div>

      {parseError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{parseError}</span>
          </div>
          <button
            type="button"
            onClick={() => setParseError("")}
            className="p-1 hover:bg-rose-100 rounded text-rose-700 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* State A: File Analyzed - Display Clean Sober Analysis */}
      {analyzedFile ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          {/* File Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-slate-900">{analyzedFile.fileName}</h3>
                <span className="text-[11px] text-slate-400">Analyse terminée avec succès</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAnalyzedFile(null)}
              disabled={isImporting}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer px-2.5 py-1 rounded-lg hover:bg-slate-100"
            >
              Changer de fichier
            </button>
          </div>

          {/* Analysis Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Élèves détectés</span>
              <p className="text-base font-black text-slate-900">
                {analyzedFile.rows.length} élève{analyzedFile.rows.length > 1 ? "s" : ""}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Classes identifiées</span>
              <p className="text-xs font-bold text-slate-800 truncate">
                {analyzedFile.classesDetected.length > 0
                  ? analyzedFile.classesDetected.join(", ")
                  : "Classe par défaut"}
              </p>
            </div>

            {analyzedFile.paymentsCount > 0 && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Paiements initiaux</span>
                <p className="text-xs font-bold text-emerald-700">
                  {analyzedFile.paymentsCount} versement{analyzedFile.paymentsCount > 1 ? "s" : ""} (
                  {analyzedFile.paymentsTotal.toLocaleString("fr-FR")} FCFA)
                </p>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Contacts parents</span>
              <p className="text-xs font-bold text-slate-800">
                {analyzedFile.parentsCount} numéro{analyzedFile.parentsCount > 1 ? "s" : ""} associé{analyzedFile.parentsCount > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                disabled={isImporting}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
              >
                Passer pour l&apos;instant
              </button>
            )}

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={isImporting}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ml-auto shadow-sm"
            >
              {isImporting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{importProgress || "Importation..."}</span>
                </>
              ) : (
                <>
                  <span>Importer ces {analyzedFile.rows.length} élèves</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      ) : hasStudents ? (
        /* State B: Students already in store */
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-emerald-950">
                  {students.length} élève{students.length > 1 ? "s" : ""} enregistré{students.length > 1 ? "s" : ""}
                </h3>
                <p className="text-[11px] text-emerald-700">
                  Dans {classes.length} classe{classes.length > 1 ? "s" : ""}.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => excelInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-white text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>Ajouter d&apos;autres élèves</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
            {onSkip && (
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold transition-colors cursor-pointer"
              >
                Passer pour l&apos;instant
              </button>
            )}

            <button
              type="button"
              onClick={onContinue}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ml-auto"
            >
              <span>Continuer vers les tarifs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* State C: 4 Simple Clean Import Options */
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option 1: Excel / CSV (Direct Device File Selector) */}
            <button
              type="button"
              onClick={() => excelInputRef.current?.click()}
              disabled={isParsing}
              className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900">
                  Fichier Excel ou CSV
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Depuis votre ordinateur ou téléphone
                </p>
              </div>
            </button>

            {/* Option 2: Document PDF (Direct Device File Selector) */}
            <button
              type="button"
              onClick={() => pdfInputRef.current?.click()}
              disabled={isParsing}
              className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900">
                  Document PDF
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Liste imprimée ou registre PDF
                </p>
              </div>
            </button>

            {/* Option 3: Google Sheets */}
            <button
              type="button"
              onClick={() => setIsSheetsInputOpen(!isSheetsInputOpen)}
              disabled={isParsing}
              className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <Link2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900">
                  Google Sheets
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Lien de partage en ligne
                </p>
              </div>
            </button>

            {/* Option 4: Photo / Caméra */}
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              disabled={isParsing}
              className="p-3.5 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 rounded-xl text-left transition-all group cursor-pointer shadow-2xs flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center shrink-0">
                <Camera className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-extrabold text-slate-900">
                  Photo de registre (OCR)
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Photo de registre papier
                </p>
              </div>
            </button>
          </div>

          {/* Inline Google Sheets input */}
          {isSheetsInputOpen && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in">
              <label className="text-[11px] font-bold text-slate-700 block">
                Collez le lien Google Sheets :
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  value={sheetsUrl}
                  onChange={(e) => setSheetsUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleFetchGoogleSheets}
                  disabled={isParsing || !sheetsUrl.trim()}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  {isParsing ? "Chargement..." : "Analyser"}
                </button>
              </div>
            </div>
          )}

          {/* Action passer pour l'instant */}
          {onSkip && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={onSkip}
                className="text-xs text-slate-500 hover:text-slate-900 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
              >
                Passer pour l&apos;instant et aller au tableau de bord
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 2 : CONFIGURER LES TARIFS
// ─────────────────────────────────────────────────────────────────────────────
export function Step2SetupTuition({
  onContinue,
  onSkip,
}: {
  onContinue: () => void;
  onSkip?: () => void;
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
      <div className="p-6 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Aucune classe détectée</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Veuillez d&apos;abord importer vos élèves à l&apos;étape 1 pour créer vos classes automatiquement.
          </p>
        </div>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-4 cursor-pointer"
          >
            Passer pour l&apos;instant
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* Header épuré */}
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          2. Configurer les tarifs
        </h2>
        <p className="text-xs text-slate-500 max-w-lg">
          Définissez le montant annuel de la scolarité par classe.
        </p>
      </div>

      {/* Quick Apply to All Bar */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-2.5 text-xs">
        <span className="font-bold text-slate-700">Appliquer un tarif à toutes les classes :</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="number"
            placeholder="Ex: 120000"
            value={globalAmountInput}
            onChange={(e) => setGlobalAmountInput(e.target.value)}
            className="w-32 px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="button"
            onClick={handleApplyToAll}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            Appliquer
          </button>
        </div>
      </div>

      {/* Classes Tuition List */}
      <div className="space-y-2.5">
        {classes.map((c) => {
          const plan = plansState[c.id] || { total: 0, installments: [] };
          const validity = validityMap[c.id] || { isValid: true, sum: 0 };
          const isExpanded = expandedClassId === c.id;

          return (
            <div
              key={c.id}
              className={`border rounded-xl p-3.5 transition-all ${
                !validity.isValid
                  ? "bg-rose-50/40 border-rose-300"
                  : "bg-white border-slate-200"
              }`}
            >
              {/* Row header */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {c.name.slice(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{c.name}</h3>
                    <span className="text-[10px] text-slate-400 font-medium">{c.level || "Classe standard"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-bold text-slate-600">Scolarité :</label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={plan.total || ""}
                        onChange={(e) => handleTotalChange(c.id, Number(e.target.value))}
                        className="w-28 px-2 py-1 bg-slate-50 border border-slate-300 focus:bg-white rounded-lg font-bold text-slate-900 text-xs focus:outline-none text-right pr-6"
                      />
                      <span className="absolute right-2 top-1.5 text-[10px] text-slate-400 font-bold">F</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedClassId(isExpanded ? null : c.id)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                    title="Détail des tranches"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error banner if unequal */}
              {!validity.isValid && validity.error && (
                <div className="mt-2 p-2 bg-rose-100 border border-rose-200 text-rose-900 rounded-lg text-[11px] flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                  <span>{validity.error}</span>
                </div>
              )}

              {/* Installments details */}
              {(isExpanded || !validity.isValid) && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {plan.installments.map((inst, idx) => (
                    <div key={inst.id || idx} className="p-2 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                        <span>{inst.title || `Tranche ${idx + 1}`}</span>
                        <span className="text-[9px] text-slate-400">{inst.due_date}</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1000"
                          value={inst.amount || ""}
                          onChange={(e) => handleInstallmentAmountChange(c.id, idx, Number(e.target.value))}
                          className="w-full px-2 py-1 bg-white border border-slate-300 rounded-md text-xs font-bold text-slate-900 focus:outline-none text-right pr-5"
                        />
                        <span className="absolute right-1.5 top-1.5 text-[9px] text-slate-400 font-bold">F</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer buttons */}
      <div className="pt-3 flex items-center justify-between flex-wrap gap-3">
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-4 transition-colors cursor-pointer"
          >
            Passer pour l&apos;instant
          </button>
        )}

        <button
          type="button"
          onClick={handleSaveAndContinue}
          disabled={!isAllValid || isSaving}
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ml-auto"
        >
          <span>{isSaving ? "Enregistrement..." : "Valider et continuer"}</span>
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
  const { students, classes } = useScoly();

  return (
    <div className="space-y-5 animate-in fade-in duration-150 text-center max-w-md mx-auto py-2">
      {/* Icon */}
      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xs">
        <Check className="w-6 h-6 stroke-[3]" />
      </div>

      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          3. Enregistrer les paiements
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Votre établissement est prêt. Vous pouvez commencer à enregistrer les encaissements ou accéder au tableau de bord.
        </p>
      </div>

      {/* Summary Box */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
        <div className="flex items-center gap-2.5 font-bold text-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{students.length} élève{students.length > 1 ? "s" : ""} enregistré{students.length > 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2.5 font-bold text-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{classes.length} classe{classes.length > 1 ? "s" : ""} avec tarifs configurés</span>
        </div>
        <div className="flex items-center gap-2.5 font-bold text-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Reçus et caisse prêts</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
        <button
          type="button"
          onClick={onOpenPayment}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span>Enregistrer un paiement</span>
        </button>

        <button
          type="button"
          onClick={onFinish}
          className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>Aller au tableau de bord</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
