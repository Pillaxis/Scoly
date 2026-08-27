"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileSpreadsheet,
  FileText,
  Camera,
  Layers,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import {
  ImportSourceType,
  ColumnMappingRule,
  ValidatedImportRow,
  BatchProgress,
  ImportSummary,
} from "@/types/import";
import { SourceSelector } from "./SourceSelector";
import { FileUploadZone } from "./FileUploadZone";
import { GoogleSheetsInput } from "./GoogleSheetsInput";
import { CameraScannerZone } from "./CameraScannerZone";
import { ColumnMappingView } from "./ColumnMappingView";
import { PreviewValidationGrid } from "./PreviewValidationGrid";
import { BatchProgressView } from "./BatchProgressView";
import { ImportSummaryView } from "./ImportSummaryView";
import { detectColumnMapping } from "@/lib/import/mappers/column-detector";
import { validateImportRows } from "@/lib/import/validation/data-validator";
import { checkDuplicatesAgainstExistingStudents } from "@/lib/import/validation/duplicate-checker";
import { executeBatchImport } from "@/lib/import/batch/batch-processor";
import { ParsedSheetData, ExcelWorkbookResult } from "@/lib/import/parsers/excel-csv-parser";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSource?: ImportSourceType;
}

type ImportStep =
  | "SELECT_SOURCE"
  | "INPUT_DATA"
  | "COLUMN_MAPPING"
  | "PREVIEW_VALIDATION"
  | "BATCH_PROGRESS"
  | "SUMMARY";

export function ImportModal({ isOpen, onClose, initialSource = "excel" }: ImportModalProps) {
  const {
    school,
    academicYear,
    classes,
    students,
    addStudent,
    updateStudent,
    addPayment,
    logAudit,
    recordImportBatch,
    syncLocalToSupabase,
  } = useScoly();

  // Wizard state
  const [currentStep, setCurrentStep] = useState<ImportStep>("SELECT_SOURCE");
  const [selectedSource, setSelectedSource] = useState<ImportSourceType>(initialSource);

  // Parsed data state
  const [sourceFileName, setSourceFileName] = useState<string>("");
  const [activeSheetData, setActiveSheetData] = useState<ParsedSheetData | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMappingRule[]>([]);
  const [validatedRows, setValidatedRows] = useState<ValidatedImportRow[]>([]);

  // Processing state
  const [batchProgress, setBatchProgress] = useState<BatchProgress>({
    currentBatch: 0,
    totalBatches: 0,
    processedRows: 0,
    totalRows: 0,
    percentage: 0,
    status: "idle",
    currentActionDescription: "",
  });

  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setCurrentStep("SELECT_SOURCE");
      setSelectedSource(initialSource);
      setSourceFileName("");
      setActiveSheetData(null);
      setColumnMappings([]);
      setValidatedRows([]);
      setImportSummary(null);
    }
  }, [isOpen, initialSource]);

  if (!isOpen) return null;

  // Step 2 -> Step 3 : Handler when File / Sheets / Photo is parsed
  const handleSheetDataReady = (fileName: string, sheetData: ParsedSheetData) => {
    setSourceFileName(fileName);
    setActiveSheetData(sheetData);

    // 1. Détection automatique des colonnes
    const detectedMappings = detectColumnMapping(sheetData.headers);
    setColumnMappings(detectedMappings);

    // Passer à l'étape de mapping
    setCurrentStep("COLUMN_MAPPING");
  };

  // Step 3 -> Step 4 : Handler when column mapping is confirmed
  const handleConfirmMapping = () => {
    if (!activeSheetData) return;

    // 1. Valider les données selon le mapping
    const basicValidated = validateImportRows(
      activeSheetData.rows,
      columnMappings,
      classes
    );

    // 2. Détecter les doublons par rapport aux élèves existants
    const withDuplicates = checkDuplicatesAgainstExistingStudents(
      basicValidated,
      students
    );

    setValidatedRows(withDuplicates);
    setCurrentStep("PREVIEW_VALIDATION");
  };

  // Step 4 -> Step 5 : Handler to start batch import
  const handleStartImport = async () => {
    if (validatedRows.length === 0) return;

    setCurrentStep("BATCH_PROGRESS");

    try {
      const summary = await executeBatchImport({
        rows: validatedRows,
        sourceType: selectedSource,
        fileName: sourceFileName,
        academicYearId: academicYear.id,
        academicYearName: academicYear.name,
        school,
        existingStudents: students,
        availableClasses: classes,
        batchSize: 25,
        onProgress: (progress) => {
          setBatchProgress(progress);
        },
        onAddStudent: addStudent,
        onUpdateStudent: updateStudent,
        onAddPayment: addPayment,
        onLogAudit: logAudit,
      });

      // Sauvegarde dans l'historique des lots
      recordImportBatch({
        id: summary.batchId,
        school_id: school.id,
        academic_year_id: academicYear.id,
        source_type: selectedSource,
        file_name: sourceFileName,
        total_rows: summary.totalDetected,
        imported_students_count: summary.studentsImported,
        imported_payments_count: summary.paymentsImported,
        errors_count: summary.errorsCount,
        duplicates_count: summary.rowsSkipped,
        payload_summary: summary,
        created_at: summary.importedAt,
      });

      setImportSummary(summary);
      setCurrentStep("SUMMARY");
      syncLocalToSupabase().catch((err) => console.debug("Cloud sync post-import notice:", err));
    } catch (err: any) {
      console.error("Batch import error:", err);
      alert(`Erreur lors de l'importation par lots : ${err.message || "Erreur inconnue"}`);
      setCurrentStep("PREVIEW_VALIDATION");
    }
  };

  const handleResetImport = () => {
    setCurrentStep("SELECT_SOURCE");
    setSourceFileName("");
    setActiveSheetData(null);
    setColumnMappings([]);
    setValidatedRows([]);
    setImportSummary(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh] sm:max-h-[90vh]">
        {/* Header Élégant */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Importer vos données
              </h2>
              <p className="text-xs text-slate-500">
                Importez vos élèves et vos paiements depuis Excel, Google Sheets ou même une photo de votre registre papier.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicateur d'Étapes */}
        {currentStep !== "BATCH_PROGRESS" && currentStep !== "SUMMARY" && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  currentStep === "SELECT_SOURCE"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                1
              </span>
              <span className={currentStep === "SELECT_SOURCE" ? "text-blue-900 font-extrabold" : ""}>
                Méthode
              </span>
            </div>

            <span className="text-slate-300">→</span>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  currentStep === "INPUT_DATA"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                2
              </span>
              <span className={currentStep === "INPUT_DATA" ? "text-blue-900 font-extrabold" : ""}>
                Fichier / Photo
              </span>
            </div>

            <span className="text-slate-300">→</span>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  currentStep === "COLUMN_MAPPING"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                3
              </span>
              <span className={currentStep === "COLUMN_MAPPING" ? "text-blue-900 font-extrabold" : ""}>
                Colonnes
              </span>
            </div>

            <span className="text-slate-300">→</span>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-full ${
                  currentStep === "PREVIEW_VALIDATION"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                4
              </span>
              <span className={currentStep === "PREVIEW_VALIDATION" ? "text-blue-900 font-extrabold" : ""}>
                Validation
              </span>
            </div>
          </div>
        )}

        {/* Corps Déroulant */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Étape 1 : Choix de la Source */}
          {currentStep === "SELECT_SOURCE" && (
            <SourceSelector
              selectedSource={selectedSource}
              onSelectSource={setSelectedSource}
              academicYear={academicYear}
              onNext={() => setCurrentStep("INPUT_DATA")}
            />
          )}

          {/* Étape 2 : Entrée des Données selon la Source */}
          {currentStep === "INPUT_DATA" && selectedSource === "excel" && (
            <FileUploadZone
              onFileParsed={(wbResult: ExcelWorkbookResult) => {
                const sheet = wbResult.sheets[wbResult.selectedSheetName];
                if (sheet) {
                  handleSheetDataReady(wbResult.fileName, sheet);
                }
              }}
              onBack={() => setCurrentStep("SELECT_SOURCE")}
            />
          )}

          {currentStep === "INPUT_DATA" && selectedSource === "google_sheets" && (
            <GoogleSheetsInput
              onSheetsParsed={(res) => {
                handleSheetDataReady(res.fileName, res.sheetData);
              }}
              onBack={() => setCurrentStep("SELECT_SOURCE")}
            />
          )}

          {currentStep === "INPUT_DATA" && selectedSource === "photo_ocr" && (
            <CameraScannerZone
              onOCRCompleted={(res) => {
                handleSheetDataReady(res.fileName, res.sheetData);
              }}
              onBack={() => setCurrentStep("SELECT_SOURCE")}
            />
          )}

          {/* Étape 3 : Mapping des Colonnes */}
          {currentStep === "COLUMN_MAPPING" && activeSheetData && (
            <ColumnMappingView
              mappings={columnMappings}
              sampleRows={activeSheetData.rows}
              onChangeMapping={setColumnMappings}
              onConfirm={handleConfirmMapping}
              onBack={() => setCurrentStep("INPUT_DATA")}
            />
          )}

          {/* Étape 4 : Prévisualisation & Contrôle des Doublons */}
          {currentStep === "PREVIEW_VALIDATION" && (
            <PreviewValidationGrid
              rows={validatedRows}
              onUpdateRows={setValidatedRows}
              onProceedToImport={handleStartImport}
              onBack={() => setCurrentStep("COLUMN_MAPPING")}
            />
          )}

          {/* Étape 5 : Barre de Progression par Lots */}
          {currentStep === "BATCH_PROGRESS" && (
            <BatchProgressView progress={batchProgress} />
          )}

          {/* Étape 6 : Résumé Final Post-Import */}
          {currentStep === "SUMMARY" && importSummary && (
            <ImportSummaryView
              summary={importSummary}
              onReset={handleResetImport}
              onClose={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
