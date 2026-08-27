"use client";

import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  AlertTriangle,
  CheckCircle2,
  RotateCw,
  Sparkles,
  RefreshCw,
  ArrowRight,
  Info,
  Sliders,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { diagnoseImageQuality, preprocessImageForOcr } from "@/lib/ocr/image-preprocessor";
import { performRegisterOCR, OCROutputResult } from "@/lib/ocr/ocr-engine";
import { ImageQualityDiagnosis } from "@/types/import";
import { ParsedSheetData } from "@/lib/import/parsers/excel-csv-parser";
import { useScoly } from "@/lib/store";
import { useGlobalModals } from "@/app/(dashboard)/layout";
import { Crown } from "lucide-react";

interface CameraScannerZoneProps {
  onOCRCompleted: (result: { fileName: string; sheetData: ParsedSheetData }) => void;
  onBack: () => void;
}

export function CameraScannerZone({ onOCRCompleted, onBack }: CameraScannerZoneProps) {
  const { hasFeature } = useScoly();
  const { openProModal } = useGlobalModals();
  const isProOcr = hasFeature("ai_ocr_scanner");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [rotationAngle, setRotationAngle] = useState(0);

  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<ImageQualityDiagnosis | null>(null);

  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrProgressText, setOcrProgressText] = useState("");
  const [ocrProgressPct, setOcrProgressPct] = useState(0);
  const [ocrResult, setOcrResult] = useState<OCROutputResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleImageSelected = async (file: File) => {
    setErrorMessage("");
    setOcrResult(null);
    setRotationAngle(0);

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Format d'image non supporté. Veuillez choisir une photo JPG, PNG ou WebP.");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Diagnostic qualité instantané
    setIsDiagnosing(true);
    try {
      const diag = await diagnoseImageQuality(file);
      setDiagnosis(diag);
    } catch (e) {
      console.warn("Quality diagnosis error", e);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleRotate = async () => {
    const nextAngle = (rotationAngle + 90) % 360;
    setRotationAngle(nextAngle);
  };

  const handleRunOCR = async () => {
    if (!selectedFile) return;
    setErrorMessage("");
    setIsProcessingOCR(true);
    setOcrProgressPct(5);
    setOcrProgressText("Pré-traitement du contraste de la photo...");

    try {
      // 1. Pré-traitement de l'image (rotation, niveaux de gris, contraste)
      const { processedBlob } = await preprocessImageForOcr(selectedFile, rotationAngle);

      // 2. Reconnaissance optique réelle avec Tesseract
      setOcrProgressText("Lecture optique des lignes manuscrites...");
      const result = await performRegisterOCR(processedBlob, (progress) => {
        setOcrProgressText(progress.status);
        setOcrProgressPct(Math.round(progress.progress * 100));
      });

      if (result.structuredRows.length === 0) {
        throw new Error(
          "Aucun texte ou tableau n'a pu être extrait de cette photo. Essayez avec un meilleur éclairage ou un cadrage plus rapproché."
        );
      }

      setOcrResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || "Erreur lors de la lecture optique du registre.");
    } finally {
      setIsProcessingOCR(false);
    }
  };

  const handleConfirmOCR = () => {
    if (!ocrResult || !selectedFile) return;

    onOCRCompleted({
      fileName: `Registre papier (${selectedFile.name})`,
      sheetData: {
        sheetName: "Registre Numérisé",
        headers: ocrResult.detectedHeaders,
        rows: ocrResult.structuredRows,
        totalRows: ocrResult.structuredRows.length,
      },
    });
  };

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-in fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!selectedFile ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center bg-slate-50/60 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 shadow-xs flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 mb-2">
                <Crown className="w-3 h-3 text-amber-600 fill-amber-500" />
                <span>Fonctionnalité SCOLY PRO</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900">
                Numériser un cahier ou registre papier
              </h3>
              <p className="text-xs text-slate-500 max-w-md mt-1">
                Prenez en photo votre cahier d&apos;inscription ou registre de paiements pour en extraire automatiquement les lignes.
              </p>
            </div>

            {/* Inputs cachés pour Photo ou Fichier */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImageSelected(e.target.files[0])}
            />

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isProOcr) {
                    openProModal(
                      "ai_ocr_scanner",
                      "Scanner IA & OCR de Documents",
                      "Le scanner intelligent par caméra est réservé aux établissements disposant du forfait SCOLY PRO."
                    );
                    return;
                  }
                  cameraInputRef.current?.click();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Prendre une photo (Appareil)</span>
                {!isProOcr && <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300 ml-1" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isProOcr) {
                    openProModal(
                      "ai_ocr_scanner",
                      "Scanner IA & OCR de Documents",
                      "Le scanner intelligent par photo est réservé aux établissements disposant du forfait SCOLY PRO."
                    );
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Choisir une photo existante</span>
                {!isProOcr && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-400 ml-1" />}
              </button>
            </div>
          </div>


          {/* Conseils de prise de vue */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 text-xs text-purple-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Conseils pour une lecture optique optimale :</span>
            </div>
            <ul className="list-disc list-inside text-[11px] text-purple-800 space-y-1 pl-2">
              <li>Placez le registre bien à plat sur une table bien éclairée.</li>
              <li>Cadrez le tableau de face sans inclinaison excessive.</li>
              <li>Évitez les ombres de votre main ou de votre téléphone sur les écritures.</li>
            </ul>
          </div>
        </div>
      ) : (
        /* Image chargée avec outils & Diagnostic */
        <div className="space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
                    {selectedFile.name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRotate}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  title="Pivoter l'image de 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Pivoter</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setOcrResult(null);
                    setDiagnosis(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Changer de photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Diagnostic Qualité */}
            {diagnosis && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-3 ${
                  diagnosis.isAcceptable
                    ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                    : "bg-amber-50/80 border-amber-200 text-amber-900"
                }`}
              >
                {diagnosis.isAcceptable ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold">
                      {diagnosis.isAcceptable
                        ? "Qualité de la photo : Bonne"
                        : "Attention : Photo difficile à lire"}
                    </span>
                    <span className="text-[10px] font-bold opacity-80">
                      Netteté {diagnosis.sharpnessScore}% • Lumière {diagnosis.brightnessScore}%
                    </span>
                  </div>
                  {diagnosis.recommendations.map((rec, i) => (
                    <p key={i} className="text-[11px] leading-tight opacity-90">
                      {rec}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Aperçu de l'image */}
            <div className="relative max-h-72 overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center p-2">
              <img
                src={previewUrl}
                alt="Aperçu registre"
                className="max-h-68 object-contain rounded-lg transition-transform duration-200"
                style={{ transform: `rotate(${rotationAngle}deg)` }}
              />
            </div>

            {/* Bouton de déclenchement OCR */}
            {!ocrResult && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleRunOCR}
                  disabled={isProcessingOCR}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-purple-600/20 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isProcessingOCR ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{ocrProgressText} ({ocrProgressPct}%)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Lancer la reconnaissance optique du registre</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Résultat OCR si disponible */}
          {ocrResult && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {ocrResult.structuredRows.length} ligne(s) détectée(s) dans le registre
                  </h4>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800">
                  Confiance moyenne : {ocrResult.confidenceAverage}%
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Vérification humaine obligatoire :</strong> La reconnaissance optique de cahiers manuscrits nécessite un contrôle visuel. Vous pourrez corriger chaque case à l&apos;étape suivante.
                </p>
              </div>

              {/* Tableau d'aperçu rapide */}
              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Nom</th>
                      <th className="p-2.5">Prénom</th>
                      <th className="p-2.5">Classe</th>
                      <th className="p-2.5">Téléphone</th>
                      <th className="p-2.5">Montant</th>
                      <th className="p-2.5">Fiabilité</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ocrResult.lines.slice(0, 8).map((line) => (
                      <tr key={line.id} className="hover:bg-slate-50/80">
                        <td className="p-2.5 font-bold text-slate-900">
                          {line.detectedFields.last_name || "—"}
                        </td>
                        <td className="p-2.5 text-slate-700">
                          {line.detectedFields.first_name || "—"}
                        </td>
                        <td className="p-2.5 text-slate-700">
                          {line.detectedFields.class_name || "—"}
                        </td>
                        <td className="p-2.5 font-mono text-slate-600">
                          {line.detectedFields.parent_phone || "—"}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">
                          {line.detectedFields.payment_amount || "—"}
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              line.confidence >= 70
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {line.confidence >= 70 ? "✓ Élevée" : "⚠️ À vérifier"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Boutons de navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          Retour
        </button>

        {ocrResult && (
          <button
            type="button"
            onClick={handleConfirmOCR}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <span>Vérifier & Valider les lignes</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
