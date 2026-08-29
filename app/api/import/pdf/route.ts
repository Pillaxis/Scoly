import { NextRequest, NextResponse } from "next/server";

// Polyfill browser globals for pdf.js / pdf-parse in Next.js Server Components
if (typeof (globalThis as any).DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class DOMMatrix {};
}
if (typeof (globalThis as any).ImageData === "undefined") {
  (globalThis as any).ImageData = class ImageData {};
}
if (typeof (globalThis as any).Path2D === "undefined") {
  (globalThis as any).Path2D = class Path2D {};
}

/**
 * Intelligent line parser to detect student data patterns in raw text from PDF
 */
function parseLinesToStudentRows(text: string): { headers: string[]; rows: string[][] } {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const rows: string[][] = [];
  const headers = ["Nom & Prénom", "Classe", "Genre", "Matricule", "Parent / Contact"];

  for (const line of lines) {
    // Ignore headers or footer lines
    if (
      line.match(/page\s+\d+/i) ||
      line.match(/^liste des élèves/i) ||
      line.match(/^année scolaire/i) ||
      line.match(/^etablissement/i) ||
      line.match(/^republique/i) ||
      line.match(/^ministere/i)
    ) {
      continue;
    }

    // Split line by multiple spaces, tabs, or semicolons/commas
    const parts = line.split(/\t+|\s{2,}|;/).map((p) => p.trim()).filter(Boolean);

    if (parts.length >= 2) {
      let fullName = "";
      let className = "";
      let gender = "M";
      let matricule = "";
      let parentContact = "";

      // Heuristic extraction
      for (const part of parts) {
        if (!gender && (part === "M" || part === "F" || part === "MASCULIN" || part === "FEMININ")) {
          gender = part.startsWith("F") ? "F" : "M";
        } else if (!matricule && part.match(/^[A-Z0-9]{3,}-[A-Z0-9-]{3,}$/i)) {
          matricule = part;
        } else if (!parentContact && part.match(/(?:\+?\d{2,3})?\s?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/)) {
          parentContact = part;
        } else if (!className && part.match(/^(?:CI|CP|CE|CM|6|5|4|3|2nde|1ère|Tle|Terminale|Licence|Master|BTS)/i)) {
          className = part;
        } else if (!fullName && part.length >= 3 && !part.match(/^\d+$/)) {
          fullName = part;
        }
      }

      if (!fullName && parts[0]) {
        fullName = parts[0].match(/^\d+$/) && parts[1] ? parts[1] : parts[0];
      }

      if (fullName && fullName.length >= 2) {
        rows.push([
          fullName,
          className || "Classe Détectée",
          gender,
          matricule,
          parentContact,
        ]);
      }
    }
  }

  return { headers, rows };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier PDF fourni." },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      return NextResponse.json(
        { success: false, error: "Le fichier doit être au format PDF (.pdf)." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Dynamic require inside handler
    const pdfParse = require("pdf-parse");
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text || "";

    if (!rawText.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Le document PDF ne contient aucun texte sélectionnable (il s'agit peut-être d'une image scannée, utilisez le scanner caméra OCR).",
        },
        { status: 400 }
      );
    }

    const { headers, rows } = parseLinesToStudentRows(rawText);

    if (rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Impossible d'extraire automatiquement des élèves à partir de ce fichier PDF.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      headers,
      rows,
      totalRows: rows.length,
      pageCount: pdfData.numpages || 1,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Erreur lors de l'analyse du document PDF.",
      },
      { status: 500 }
    );
  }
}
