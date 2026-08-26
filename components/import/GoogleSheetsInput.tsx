"use client";

import React, { useState } from "react";
import {
  FileText,
  Link2,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Info,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { fetchAndParseGoogleSheets, GoogleSheetsParseResult } from "@/lib/import/parsers/google-sheets-parser";
import { ParsedSheetData } from "@/lib/import/parsers/excel-csv-parser";

interface GoogleSheetsInputProps {
  onSheetsParsed: (result: { fileName: string; sheetData: ParsedSheetData }) => void;
  onBack: () => void;
}

export function GoogleSheetsInput({ onSheetsParsed, onBack }: GoogleSheetsInputProps) {
  const [sheetsUrl, setSheetsUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [parsedResult, setParsedResult] = useState<GoogleSheetsParseResult | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!sheetsUrl.trim()) {
      setErrorMessage("Veuillez saisir l'URL ou le lien de partage de votre document Google Sheets.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await fetchAndParseGoogleSheets(sheetsUrl);
      setParsedResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || "Impossible de charger le document Google Sheets.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!parsedResult) return;
    onSheetsParsed({
      fileName: parsedResult.spreadsheetTitle,
      sheetData: parsedResult.sheetData,
    });
  };

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulaire de saisie d'URL */}
      <form onSubmit={handleFetch} className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Lien Google Sheets</h3>
            <p className="text-xs text-slate-500">Collez le lien de partage de votre feuille de calcul</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            URL du document Google Sheets :
          </label>
          <div className="relative">
            <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="url"
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs.../edit"
              value={sheetsUrl}
              onChange={(e) => setSheetsUrl(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-400">
            Le document doit être partagé avec l&apos;option <em>&quot;Tous les utilisateurs disposant du lien&quot;</em>
          </span>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Chargement...</span>
              </>
            ) : (
              <>
                <span>Charger la feuille</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Résultat du chargement si réussi */}
      {parsedResult && (
        <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-extrabold text-emerald-950 text-sm">{parsedResult.spreadsheetTitle}</h4>
            </div>
            <span className="text-xs font-extrabold text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-300">
              {parsedResult.sheetData.totalRows} ligne(s) détectée(s)
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-emerald-200/60">
            <span className="text-emerald-700 text-xs font-semibold">Colonnes :</span>
            {parsedResult.sheetData.headers.map((h, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-white border border-emerald-200 rounded font-semibold text-emerald-900 text-[11px]"
              >
                {h}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Guide & Alternative */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Comment préparer votre Google Sheet ?</span>
        </div>
        <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-1 pl-2">
          <li>Ouvrez votre document sur Google Sheets.</li>
          <li>Cliquez en haut à droite sur <strong>Partager</strong> → Choisissez <em>&quot;Tous les utilisateurs disposant du lien&quot;</em>.</li>
          <li>Copiez le lien et collez-le ci-dessus.</li>
          <li><em>Alternative :</em> Dans Google Sheets, faites <strong>Fichier → Télécharger → Microsoft Excel (.xlsx)</strong> puis importez-le dans l&apos;onglet Excel.</li>
        </ol>
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

        {parsedResult && (
          <button
            type="button"
            onClick={handleConfirm}
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
