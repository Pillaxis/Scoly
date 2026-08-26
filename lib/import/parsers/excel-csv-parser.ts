import * as XLSX from "xlsx";

export interface ParsedSheetData {
  sheetName: string;
  headers: string[];
  rows: Record<string, any>[];
  totalRows: number;
}

export interface ExcelWorkbookResult {
  fileName: string;
  sheetNames: string[];
  selectedSheetName: string;
  sheets: Record<string, ParsedSheetData>;
}

/**
 * Lit et parse un fichier Excel (.xlsx, .xls) ou CSV en mémoire
 */
export async function parseExcelOrCsvFile(file: File): Promise<ExcelWorkbookResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, {
    type: "array",
    cellDates: true,
    raw: false,
    dateNF: "yyyy-mm-dd",
  });

  const sheets: Record<string, ParsedSheetData> = {};
  const sheetNames = workbook.SheetNames;

  for (const name of sheetNames) {
    const sheet = workbook.Sheets[name];
    if (!sheet) continue;

    // Convert to JSON with header array
    const rawJson = XLSX.utils.sheet_to_json<any[]>(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });

    if (rawJson.length === 0) {
      sheets[name] = {
        sheetName: name,
        headers: [],
        rows: [],
        totalRows: 0,
      };
      continue;
    }

    // Trouver la première ligne d'en-tête non vide
    let headerRowIndex = 0;
    for (let i = 0; i < Math.min(rawJson.length, 10); i++) {
      const row = rawJson[i];
      if (Array.isArray(row) && row.filter((c) => String(c).trim().length > 0).length >= 2) {
        headerRowIndex = i;
        break;
      }
    }

    const rawHeaders = (rawJson[headerRowIndex] || []) as any[];
    const headers: string[] = [];

    rawHeaders.forEach((h, idx) => {
      const headerStr = String(h || "").trim();
      headers.push(headerStr || `Colonne_${idx + 1}`);
    });

    // Construire les objets de lignes
    const rows: Record<string, any>[] = [];

    for (let i = headerRowIndex + 1; i < rawJson.length; i++) {
      const rowArray = rawJson[i] as any[];
      if (!Array.isArray(rowArray)) continue;

      // Vérifier si la ligne n'est pas entièrement vide
      const hasContent = rowArray.some((val) => val !== undefined && val !== null && String(val).trim().length > 0);
      if (!hasContent) continue;

      const rowObj: Record<string, any> = {};
      headers.forEach((header, colIdx) => {
        let val = rowArray[colIdx];
        if (val instanceof Date) {
          // Format ISO date YYYY-MM-DD
          val = val.toISOString().split("T")[0];
        } else if (typeof val === "string") {
          val = val.trim();
        }
        rowObj[header] = val ?? "";
      });

      rows.push(rowObj);
    }

    sheets[name] = {
      sheetName: name,
      headers,
      rows,
      totalRows: rows.length,
    };
  }

  const defaultSheetName = sheetNames[0] || "Feuille 1";

  return {
    fileName: file.name,
    sheetNames,
    selectedSheetName: defaultSheetName,
    sheets,
  };
}
