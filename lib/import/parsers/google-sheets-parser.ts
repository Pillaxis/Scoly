import { ParsedSheetData } from "./excel-csv-parser";

export interface GoogleSheetsParseResult {
  spreadsheetTitle: string;
  sheetData: ParsedSheetData;
  sourceUrl: string;
}

/**
 * Télécharge et parse une feuille Google Sheets via notre proxy serveur anti-CORS
 */
export async function fetchAndParseGoogleSheets(url: string): Promise<GoogleSheetsParseResult> {
  const cleanUrl = url.trim();

  if (!cleanUrl.includes("docs.google.com/spreadsheets")) {
    throw new Error(
      "L'URL fournie ne semble pas être un lien Google Sheets valide. Format attendu : https://docs.google.com/spreadsheets/d/..."
    );
  }

  try {
    const response = await fetch("/api/import/google-sheets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url: cleanUrl }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.error ||
          "Impossible de charger ce document Google Sheets. Assurez-vous que le lien est configuré en mode 'Tous les utilisateurs disposant du lien : Lecteur'."
      );
    }

    const headers: string[] = (data.headers || []).map((h: any, idx: number) => {
      const str = String(h || "").trim();
      return str || `Colonne_${idx + 1}`;
    });

    const rows: Record<string, any>[] = [];
    const rawRows: any[][] = data.rows || [];

    for (const rowArray of rawRows) {
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
      spreadsheetTitle: `Google Sheet (${headers.length} colonnes, ${rows.length} élèves)`,
      sheetData: {
        sheetName: "Google Sheets",
        headers,
        rows,
        totalRows: rows.length,
      },
      sourceUrl: cleanUrl,
    };
  } catch (err: any) {
    throw new Error(
      err.message || "Erreur de connexion au serveur pour l'import Google Sheets."
    );
  }
}
