import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * Extract Google Spreadsheet ID and GID from URL
 */
function extractGoogleSheetDetails(url: string): { sheetId: string | null; gid: string | null } {
  try {
    const matchSheetId = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    const sheetId = matchSheetId ? matchSheetId[1] : null;

    const matchGid = url.match(/[#&?]gid=([0-9]+)/);
    const gid = matchGid ? matchGid[1] : "0";

    return { sheetId, gid };
  } catch {
    return { sheetId: null, gid: null };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== "string" || !url.includes("docs.google.com/spreadsheets")) {
      return NextResponse.json(
        { success: false, error: "Veuillez fournir une URL Google Sheets valide." },
        { status: 400 }
      );
    }

    const { sheetId, gid } = extractGoogleSheetDetails(url);
    if (!sheetId) {
      return NextResponse.json(
        { success: false, error: "Identifiant du document Google Sheets introuvable dans l'URL." },
        { status: 400 }
      );
    }

    // Direct public CSV export URL from Google Sheets
    const exportCsvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid || 0}`;

    const response = await fetch(exportCsvUrl, {
      headers: {
        "User-Agent": "SCOLY-School-Management/1.0",
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403 || response.redirected) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Ce document Google Sheets est privé. Veuillez le partager en mode « Tous les utilisateurs disposant du lien : Lecteur » dans Google Drive.",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Erreur lors de la récupération Google Sheets (Code ${response.status}).`,
        },
        { status: 502 }
      );
    }

    const csvText = await response.text();

    if (!csvText || !csvText.trim()) {
      return NextResponse.json(
        { success: false, error: "La feuille Google Sheets est vide ou ne contient aucune donnée." },
        { status: 400 }
      );
    }

    // Parse CSV buffer using XLSX library
    const workbook = XLSX.read(csvText, { type: "string" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Aucune ligne détectée dans la feuille." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      headers: rows[0] || [],
      rows: rows.slice(1),
      totalRows: Math.max(0, rows.length - 1),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur interne lors de l'import Google Sheets.",
      },
      { status: 500 }
    );
  }
}
