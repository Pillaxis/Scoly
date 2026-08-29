import { ClassRoom, PaymentMethod, Student } from "@/types/scoly";
import {
  ColumnMappingRule,
  TargetFieldKey,
  ValidatedImportRow,
} from "@/types/import";

/**
 * Valide et convertit un ensemble de lignes brutes selon le mapping de colonnes choisi
 */
export function validateImportRows(
  rawRows: Record<string, any>[],
  columnMappings: ColumnMappingRule[],
  availableClasses: ClassRoom[]
): ValidatedImportRow[] {
  // Construire un dictionnaire de mapping direct : TargetFieldKey -> sourceHeader
  const fieldToHeaderMap: Partial<Record<TargetFieldKey, string>> = {};
  columnMappings.forEach((m) => {
    if (m.targetKey) {
      fieldToHeaderMap[m.targetKey] = m.sourceHeader;
    }
  });

  return rawRows.map((rawRow, index) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Helper pour récupérer une valeur par champ cible
    const getValue = (key: TargetFieldKey): string => {
      const header = fieldToHeaderMap[key];
      if (!header || rawRow[header] === undefined || rawRow[header] === null) return "";
      return String(rawRow[header]).trim();
    };

    // 1. Extraction Nom & Prénom
    let lastName = getValue("last_name");
    let firstName = getValue("first_name");
    const combinedFullName = getValue("full_name");

    if ((!lastName || !firstName) && combinedFullName) {
      const parts = combinedFullName.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        if (!lastName) lastName = parts[0];
        if (!firstName) firstName = parts.slice(1).join(" ");
      } else if (parts.length === 1 && !lastName) {
        lastName = parts[0];
        firstName = "—";
      }
    }

    if (!lastName) {
      errors.push("Le nom de l'élève est manquant.");
    }
    if (!firstName) {
      errors.push("Le prénom de l'élève est manquant.");
    }

    // 2. Classe
    let rawClassName = getValue("class_name");
    let matchedClassId: string | undefined;
    let finalClassName = rawClassName;

    if (!rawClassName) {
      errors.push("La classe de l'élève n'est pas spécifiée.");
      finalClassName = "Non assigné";
    } else {
      // Matching intelligent avec les classes existantes
      const cleanRawClass = rawClassName.toLowerCase().replace(/[^a-z0-9]/g, "");
      const matched = availableClasses.find((c) => {
        const cleanName = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
        return cleanName === cleanRawClass || cleanName.includes(cleanRawClass) || cleanRawClass.includes(cleanName);
      });

      if (matched) {
        matchedClassId = matched.id;
        finalClassName = matched.name;
      }
    }

    // 3. Sexe
    let genderVal = getValue("gender").toUpperCase();
    let gender: "M" | "F" = "M";
    if (genderVal.startsWith("F") || genderVal === "FILLE" || genderVal === "FEMININ" || genderVal === "FEMALE") {
      gender = "F";
    } else {
      gender = "M";
    }

    // 4. Matricule
    const rawMatricule = getValue("matricule");

    // 5. Date de naissance
    const rawBirthDate = getValue("birth_date");
    const birthDate = rawBirthDate ? normalizeDate(rawBirthDate) : undefined;

    // 6. Scolarité personnalisée & Remises
    const rawTuition = getValue("tuition_amount");
    const customTuition = rawTuition ? parseNumericAmount(rawTuition) : undefined;

    const rawDiscount = getValue("discount_amount");
    const discountAmount = rawDiscount ? parseNumericAmount(rawDiscount) : 0;
    const discountReason = getValue("discount_reason") || undefined;

    // 7. Parent
    const parentName = getValue("parent_name") || (lastName ? `Parent de ${lastName}` : "Parent");
    const rawPhone = getValue("parent_phone");
    let cleanPhone = rawPhone.replace(/[^0-9+]/g, "");
    if (rawPhone && cleanPhone.length < 8) {
      warnings.push(`Numéro de téléphone '${rawPhone}' semble incomplet (moins de 8 chiffres).`);
    }

    const rawWa = getValue("parent_whatsapp");
    const cleanWa = rawWa ? rawWa.replace(/[^0-9+]/g, "") : cleanPhone;

    let relVal = getValue("parent_relationship").toLowerCase();
    let relationship: "Père" | "Mère" | "Tuteur" | "Autre" = "Père";
    if (relVal.includes("mèr") || relVal.includes("mere") || relVal.includes("mother")) {
      relationship = "Mère";
    } else if (relVal.includes("tut") || relVal.includes("guardian")) {
      relationship = "Tuteur";
    } else if (relVal.includes("autr") || relVal.includes("oncle") || relVal.includes("tante")) {
      relationship = "Autre";
    }

    const parentProfession = getValue("parent_profession") || undefined;
    const parentAddress = getValue("parent_address") || undefined;

    // 8. Paiement optionnel
    const rawPaymentAmount = getValue("payment_amount");
    let parsedPayment: ValidatedImportRow["parsedPayment"] | undefined;

    if (rawPaymentAmount) {
      const isNegative = String(rawPaymentAmount).trim().startsWith("-");
      const payAmount = parseNumericAmount(rawPaymentAmount);

      if (isNegative || payAmount <= 0) {
        errors.push(`Montant de versement invalide (${rawPaymentAmount}) : le montant doit être strictement supérieur à 0 FCFA.`);
      } else {
        const rawPayDate = getValue("payment_date");
        const payDate = rawPayDate ? normalizeDate(rawPayDate) : new Date().toISOString().split("T")[0];

        let payMethodVal = getValue("payment_method").toLowerCase();
        let paymentMethod: PaymentMethod = "cash";
        if (payMethodVal.includes("tmoney") || payMethodVal.includes("t-money")) {
          paymentMethod = "tmoney";
        } else if (payMethodVal.includes("flooz") || payMethodVal.includes("moov")) {
          paymentMethod = "flooz";
        } else if (payMethodVal.includes("virement") || payMethodVal.includes("banque") || payMethodVal.includes("transfer")) {
          paymentMethod = "bank_transfer";
        } else if (payMethodVal.includes("chèque") || payMethodVal.includes("cheque")) {
          paymentMethod = "cheque";
        }

        const paymentRef = getValue("payment_ref") || undefined;
        const paymentNotes = getValue("payment_notes") || undefined;

        parsedPayment = {
          amount: payAmount,
          payment_date: payDate,
          payment_method: paymentMethod,
          transaction_ref: paymentRef,
          notes: paymentNotes,
        };

        // Détection de dépassement de la scolarité / montant dû
        const effectiveTuition = customTuition !== undefined ? customTuition : 150000;
        const effectiveDue = Math.max(0, effectiveTuition - discountAmount);
        if (payAmount > effectiveDue && effectiveDue > 0) {
          const overpay = payAmount - effectiveDue;
          warnings.push(
            `⚠️ Versement (${payAmount.toLocaleString("fr-FR")} FCFA) supérieur au montant dû (${effectiveDue.toLocaleString("fr-FR")} FCFA) — Dépassement de ${overpay.toLocaleString("fr-FR")} FCFA (sera enregistré comme Avance/Crédit).`
          );
        }
      }
    }

    // Détermination du statut global de la ligne
    let status: ValidatedImportRow["status"] = "valid";
    if (errors.length > 0) {
      status = "error";
    } else if (warnings.length > 0) {
      status = "warning";
    }

    return {
      rowIndex: index + 1,
      rawData: rawRow,
      parsedStudent: {
        first_name: firstName,
        last_name: lastName,
        matricule: rawMatricule || undefined,
        gender,
        birth_date: birthDate,
        class_id: matchedClassId,
        class_name: finalClassName,
        custom_tuition: customTuition,
        discount_amount: discountAmount,
        discount_reason: discountReason,
      },
      parsedParent: {
        full_name: parentName,
        relationship,
        phone_primary: cleanPhone || "—",
        phone_whatsapp: cleanWa || cleanPhone || undefined,
        profession: parentProfession,
        address: parentAddress,
      },
      parsedPayment,
      status,
      errors,
      warnings,
    };
  });
}

/**
 * Normalise un montant textuel en nombre entier (ex: "50 000 FCFA" -> 50000)
 */
export function parseNumericAmount(val: any): number {
  if (typeof val === "number") return Math.max(0, Math.round(val));
  if (!val) return 0;
  const cleaned = String(val)
    .replace(/[^0-9.,]/g, "")
    .replace(/,/g, ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.max(0, Math.round(num));
}

/**
 * Normalise une date textuelle vers le format ISO standard YYYY-MM-DD
 */
export function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";
  const str = String(dateStr).trim();

  // Déjà au format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Format DD/MM/YYYY ou DD-MM-YYYY
  const parts = str.split(/[\/\-\.]/);
  if (parts.length === 3) {
    let d = parts[0];
    let m = parts[1];
    let y = parts[2];

    // Inversion si YYYY/MM/DD
    if (d.length === 4) {
      return `${d}-${m.padStart(2, "0")}-${y.padStart(2, "0")}`;
    }

    if (y.length === 2) y = "20" + y;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }

  // Fallback Date object
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split("T")[0];
  }

  return str;
}
