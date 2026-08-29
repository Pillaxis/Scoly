"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
  RefreshCw,
  Info,
} from "lucide-react";
import { parseExcelOrCsvFile, ExcelWorkbookResult } from "@/lib/import/parsers/excel-csv-parser";

interface FileUploadZoneProps {
  onFileParsed: (result: ExcelWorkbookResult) => void;
  onBack: () => void;
}

export function FileUploadZone({ onFileParsed, onBack }: FileUploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [parsedWorkbook, setParsedWorkbook] = useState<ExcelWorkbookResult | null>(null);
  const [selectedSheet, setSelectedSheet] = useState("");

  const handleFile = async (file: File) => {
    setErrorMessage("");
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["xlsx", "xls", "csv", "pdf"].includes(ext)) {
      setErrorMessage("Format non supporté. Veuillez sélectionner un fichier .xlsx, .xls, .csv ou .pdf");
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage("Le fichier est trop volumineux (limite max: 25 Mo).");
      return;
    }

    setIsLoading(true);
    try {
      if (ext === "pdf") {
        // Use server-side PDF parser route
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

        const result: ExcelWorkbookResult = {
          fileName: file.name,
          sheetNames: ["Document PDF"],
          selectedSheetName: "Document PDF",
          sheets: {
            "Document PDF": {
              sheetName: "Document PDF",
              headers: data.headers || ["Nom & Prénom", "Classe", "Genre", "Matricule", "Parent / Contact"],
              rows: data.rows || [],
              totalRows: data.totalRows || 0,
            },
          },
        };

        setParsedWorkbook(result);
        setSelectedSheet("Document PDF");
      } else {
        // Parse Excel or CSV
        const result = await parseExcelOrCsvFile(file);
        if (result.sheetNames.length === 0) {
          throw new Error("Aucune feuille de données détectée dans le fichier.");
        }

        setParsedWorkbook(result);
        setSelectedSheet(result.selectedSheetName);
      }
    } catch (err: any) {
      setErrorMessage(`Erreur de lecture du fichier : ${err.message || "Fichier illisible"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleConfirmSheet = () => {
    if (!parsedWorkbook) return;
    const updated = {
      ...parsedWorkbook,
      selectedSheetName: selectedSheet,
    };
    onFileParsed(updated);
  };

  const currentSheetData = parsedWorkbook ? parsedWorkbook.sheets[selectedSheet] : null;

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!parsedWorkbook ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? "border-blue-500 bg-blue-50/60 scale-99"
              : "border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-white"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv,.pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFile(e.target.files[0]);
              }
            }}
          />

          <div className="w-16 h-16 rounded-2xl bg-white shadow-md border border-slate-200/80 flex items-center justify-center text-blue-600 mb-2">
            {isLoading ? (
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-base font-extrabold text-slate-900">
            {isLoading
              ? "Analyse du document en cours..."
              : "Glissez votre fichier Excel, CSV ou PDF ici"}
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            Formats acceptés : <strong>.xlsx</strong>, <strong>.xls</strong>, <strong>.csv</strong> ou <strong>.pdf</strong> (jusqu&apos;à 25 Mo).
          </p>

          <button
            type="button"
            className="mt-3 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all pointer-events-none"
          >
            Parcourir les fichiers
          </button>
        </div>
      ) : (
        /* Résumé du fichier sélectionné & Choix de la feuille */
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">{parsedWorkbook.fileName}</h4>
                <p className="text-xs text-slate-500">
                  {parsedWorkbook.sheetNames.length} source(s) détectée(s)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setParsedWorkbook(null);
                setErrorMessage("");
              }}
              className="text-xs font-bold text-slate-500 hover:text-rose-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Changer de fichier
            </button>
          </div>

          {/* Sélecteur de feuille si plusieurs */}
          {parsedWorkbook.sheetNames.length > 1 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Sélectionnez la feuille à importer :
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {parsedWorkbook.sheetNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedSheet(name)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                      selectedSheet === name
                        ? "bg-blue-50 border-blue-500 text-blue-900 ring-1 ring-blue-500"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Aperçu rapide des lignes de la feuille */}
          {currentSheetData && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Aperçu du document :</span>
                <span className="font-extrabold text-blue-700">
                  {currentSheetData.totalRows} ligne(s) détectée(s)
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <span className="text-slate-400 font-medium">Colonnes détectées :</span>
                {currentSheetData.headers.slice(0, 7).map((h, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 bg-white border border-slate-200 rounded font-semibold text-slate-700 text-[11px]"
                  >
                    {h}
                  </span>
                ))}
                {currentSheetData.headers.length > 7 && (
                  <span className="text-slate-400 text-[11px] font-bold">
                    +{currentSheetData.headers.length - 7} autres
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Guide & Conseils */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-900 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Conseils pour un import sans erreur :</span>
        </div>
        <p className="text-[11px] text-blue-800 leading-relaxed pl-5">
          Assurez-vous que le document contient les colonnes essentielles (ex : <em>Nom, Prénom, Classe, Téléphone</em>). Vous pourrez vérifier chaque ligne avant d&apos;enregistrer.
        </p>
      </div>

      {/* Boutons de navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          Retour
        </button>

        {parsedWorkbook && (
          <button
            type="button"
            onClick={handleConfirmSheet}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>Analyser les colonnes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
