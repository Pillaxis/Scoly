import { createWorker } from "tesseract.js";
import { OCRLineResult, TargetFieldKey } from "@/types/import";

export interface OCRProcessingProgress {
  status: string;
  progress: number; // 0 to 1
}

export interface OCROutputResult {
  lines: OCRLineResult[];
  rawText: string;
  confidenceAverage: number;
  detectedHeaders: string[];
  structuredRows: Record<string, any>[];
}

/**
 * Exécute une véritable reconnaissance optique de caractères (OCR) sur une image de registre
 */
export async function performRegisterOCR(
  imageSource: Blob | File | string,
  onProgress?: (progress: OCRProcessingProgress) => void
): Promise<OCROutputResult> {
  // Initialisation du worker Tesseract.js en français avec support chiffres et symboles
  const worker = await createWorker("fra", 1, {
    logger: (m) => {
      if (onProgress && m.status && typeof m.progress === "number") {
        onProgress({
          status: m.status === "recognizing text" ? "Lecture optique du registre..." : "Chargement du modèle...",
          progress: m.progress,
        });
      }
    },
  });

  try {
    const ret = await worker.recognize(imageSource);
    await worker.terminate();

    const rawText = ret.data.text || "";
    const words: Array<{ text: string; confidence: number }> = (ret.data as any).words || [];
    const avgConfidence = typeof ret.data.confidence === "number" ? ret.data.confidence : 80;

    // Découpage par lignes textuelles
    const textLines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 2);

    const ocrLines: OCRLineResult[] = [];
    const structuredRows: Record<string, any>[] = [];

    // Détection de colonnes typiques dans un cahier scolaire
    const defaultHeaders = [
      "Nom",
      "Prénom",
      "Classe",
      "Téléphone",
      "Montant Versé",
      "Date",
    ];

    textLines.forEach((lineText, idx) => {
      // Calcul confiance approximative de la ligne
      const lineWords = words.filter((w: { text: string; confidence: number }) => lineText.includes(w.text));
      const lineConf =
        lineWords.length > 0
          ? Math.round(
              lineWords.reduce((s: number, w: { text: string; confidence: number }) => s + (w.confidence || 75), 0) /
                lineWords.length
            )
          : Math.round(avgConfidence);

      const parsedFields = extractFieldsFromLine(lineText);

      ocrLines.push({
        id: `ocr-line-${idx + 1}`,
        rawText: lineText,
        confidence: lineConf,
        detectedFields: parsedFields,
      });

      structuredRows.push({
        Nom: parsedFields.last_name || "",
        Prénom: parsedFields.first_name || "",
        Classe: parsedFields.class_name || "",
        Téléphone: parsedFields.parent_phone || "",
        "Montant Versé": parsedFields.payment_amount || "",
        Date: parsedFields.payment_date || "",
        Matricule: parsedFields.matricule || "",
      });
    });

    return {
      lines: ocrLines,
      rawText,
      confidenceAverage: Math.round(avgConfidence),
      detectedHeaders: defaultHeaders,
      structuredRows,
    };
  } catch (err: any) {
    try {
      await worker.terminate();
    } catch {}
    throw new Error(
      `Erreur lors de la lecture optique : ${err?.message || "Assurez-vous que l'image est bien lisible."}`
    );
  }
}

/**
 * Analyse heuristique d'une ligne de cahier d'inscription ou registre de caisse
 */
function extractFieldsFromLine(line: string): Partial<Record<TargetFieldKey, string>> {
  const fields: Partial<Record<TargetFieldKey, string>> = {};

  // Découpage par séparateurs usuels (tabulation, virgule, point-virgule, barre verticale ou multi-espaces)
  let parts = line.split(/[;\t|,]+/).map((p) => p.trim()).filter(Boolean);

  if (parts.length < 2) {
    // Si pas de séparateurs explicites, essayer par espaces multiples
    parts = line.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
  }

  // 1. Détection de date (JJ/MM/AAAA ou AAAA-MM-JJ)
  const dateMatch = line.match(/\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b/);
  if (dateMatch) {
    fields.payment_date = normalizeDateString(dateMatch[1]);
  }

  // 2. Détection de montant (ex: 50 000, 25000, 150.000 F)
  const amountMatch = line.match(/\b(\d{1,3}(?:[\s\.]\d{3})+|\d{4,6})\s*(?:f|fcfa|cfa)?\b/i);
  if (amountMatch) {
    const rawNum = amountMatch[1].replace(/[\s\.]/g, "");
    const parsedAmount = parseInt(rawNum, 10);
    if (!isNaN(parsedAmount) && parsedAmount >= 1000) {
      fields.payment_amount = String(parsedAmount);
    }
  }

  // 3. Détection de numéro de téléphone (ex: +228 90 12 34 56, 90123456, 91-23-45-67)
  const phoneMatch = line.match(/(?:\+?228\s*)?(?:9[0-9]|7[0-9])[0-9\s\-]{6,10}/);
  if (phoneMatch) {
    fields.parent_phone = phoneMatch[0].replace(/[\s\-]/g, "");
  }

  // 4. Détection de classe usuelle (Maternelle, CI, CP1, CP2, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e, 2nde, 1ere, Tle, etc.)
  const classMatch = line.match(
    /\b(CI|CP1|CP2|CE1|CE2|CM1|CM2|6[èe]me?|5[èe]me?|4[èe]me?|3[èe]me?|2nde|Seconde|1[èe]re|Premi[èe]re|Terminale|Tle|L1|L2|L3|M1|M2)\s*([A-Z0-9]*)\b/i
  );
  if (classMatch) {
    fields.class_name = classMatch[0].trim().toUpperCase();
  }

  // 5. Détection de matricule (ex: 2025-001, MAT-12, #123)
  const matMatch = line.match(/\b(?:MAT|ID|N°)?\s*([0-9]{4}-[A-Z0-9]+-[0-9]{3}|[0-9]{3,6})\b/i);
  if (matMatch && matMatch[1] !== fields.payment_amount) {
    fields.matricule = matMatch[1];
  }

  // 6. Détection des noms & prénoms
  // Nettoyer la ligne des éléments déjà reconnus
  let nameSegment = line;
  if (fields.payment_date) nameSegment = nameSegment.replace(dateMatch![0], "");
  if (fields.payment_amount && amountMatch) nameSegment = nameSegment.replace(amountMatch[0], "");
  if (fields.parent_phone && phoneMatch) nameSegment = nameSegment.replace(phoneMatch[0], "");
  if (fields.class_name && classMatch) nameSegment = nameSegment.replace(classMatch[0], "");
  if (fields.matricule && matMatch) nameSegment = nameSegment.replace(matMatch[0], "");

  const words = nameSegment
    .replace(/[^a-zA-ZÀ-ÿ\s\-']/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (words.length >= 2) {
    // Si premier mot en majuscule -> Nom, suite -> Prénoms
    fields.last_name = words[0].toUpperCase();
    fields.first_name = words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  } else if (words.length === 1) {
    fields.last_name = words[0].toUpperCase();
    fields.first_name = "—";
  }

  return fields;
}

function normalizeDateString(dateStr: string): string {
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    let d = parts[0];
    let m = parts[1];
    let y = parts[2];

    if (y.length === 2) y = "20" + y;
    if (d.length === 1) d = "0" + d;
    if (m.length === 1) m = "0" + m;

    // Vérifier si format YYYY-MM-DD
    if (d.length === 4) {
      return `${d}-${m}-${y}`;
    }
    return `${y}-${m}-${d}`;
  }
  return dateStr;
}
