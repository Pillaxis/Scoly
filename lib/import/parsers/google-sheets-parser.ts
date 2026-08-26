import * as XLSX from "xlsx";
import { ParsedSheetData } from "./excel-csv-parser";

export interface GoogleSheetsParseResult {
  spreadsheetTitle: string;
  sheetData: ParsedSheetData;
  sourceUrl: string;
}

/**
 * Extrait l'identifiant (ID) et le GID d'une feuille Google Sheets depuis son URL
 */
export function extractGoogleSheetsInfo(url: string): { spreadsheetId: string | null; gid: string | null } {
  const matchId = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const spreadsheetId = matchId ? matchId[1] : null;

  const matchGid = url.match(/[#&?]gid=([0-9]+)/);
  const gid = matchGid ? matchGid[1] : "0";

  return { spreadsheetId, gid };
}

/**
 * Télécharge et parse une feuille Google Sheets partagée publiquement ou via lien export
 */
export async function fetchAndParseGoogleSheets(url: string): Promise<GoogleSheetsParseResult> {
  const { spreadsheetId, gid } = extractGoogleSheetsInfo(url.trim());

  if (!spreadsheetId) {
    throw new Error(
      "L'URL fournie ne semble pas être un lien Google Sheets valide. Format attendu : https://docs.google.com/spreadsheets/d/..."
    );
  }

  const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid || "0"}`;

  try {
    const response = await fetch(exportUrl, {
      method: "GET",
      headers: {
        Accept: "text/csv, application/json, text/plain, */*",
      },
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 401 || response.status === 403) {
        throw new Error(
          "Impossible d'accéder à ce document Google Sheets. Assurez-vous que le lien est configuré en mode 'Tous les utilisateurs disposant du lien peuvent lire' ou téléchargez-le en fichier .xlsx pour l'importer."
        );
      }
      throw new Error(`Erreur lors du téléchargement du document Google Sheets (Code ${response.status}).`);
    }

    const csvText = await response.text();

    if (!csvText || csvText.trim().startsWith("<!DOCTYPE html>")) {
      throw new Error(
        "Le document Google Sheets nécessite une connexion privée. Veuillez activer le partage avec le lien ('Tous les utilisateurs disposant du lien') ou exporter votre feuille en fichier Excel (.xlsx)."
      );
    }

    // Parser le CSV via SheetJS
    const workbook = XLSX.read(csvText, { type: "string" });
    const firstSheetName = workbook.SheetNames[0] || "Feuille 1";
    const sheet = workbook.Sheets[firstSheetName];

    if (!sheet) {
      throw new Error("La feuille Google Sheets est vide ou illisible.");
    }

    const rawJson = XLSX.utils.sheet_to_json<any[]>(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });

    if (rawJson.length === 0) {
      throw new Error("Aucune donnée trouvée dans ce document Google Sheets.");
    }

    // Trouver l'en-tête
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(rawJson.length, 10); i++) {
      const row = rawJson[i];
      if (Array.isArray(row) && row.filter((c) => String(c).trim().length > 0).length >= 2) {
        headerRowIndex = i;
        break;
      }
    }

    const rawHeaders = (rawJson[headerRowIndex] || []) as any[];
    const headers: string[] = rawHeaders.map((h, idx) => {
      const str = String(h || "").trim();
      return str || `Colonne_${idx + 1}`;
    });

    const rows: Record<string, any>[] = [];

    for (let i = headerRowIndex + 1; i < rawJson.length; i++) {
      const rowArray = rawJson[i] as any[];
      if (!Array.isArray(rowArray)) continue;

      const hasContent = rowArray.some((val) => val !== undefined && val !== null && String(val).trim().length > 0);
      if (!hasContent) continue;

      const rowObj: Record<string, any> = {};
      headers.forEach((header, colIdx) => {
        const val = rowArray[colIdx];
        rowObj[header] = val !== undefined && val !== null ? String(val).trim() : "";
      });

      rows.push(rowObj);
    }

    return {
      spreadsheetTitle: `Google Sheet (${spreadsheetId.substring(0, 8)}...)`,
      sheetData: {
        sheetName: "Google Sheets",
        headers,
        rows,
        totalRows: rows.length,
      },
      sourceUrl: url,
    };
  } catch (err: any) {
    if (err.message && err.message.includes("Failed to fetch")) {
      throw new Error(
        "Impossible de charger directement l'URL Google Sheets en raison des restrictions CORS de Google. Téléchargez votre feuille au format Excel (.xlsx) ou CSV et glissez-la dans l'onglet 'Importer Excel / CSV'."
      );
    }
    throw err;
  }
}
