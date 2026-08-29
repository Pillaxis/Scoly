import { TuitionPlan, SchoolClass } from "@/types/scoly";
import { saveTuitionPlanDb, upsertClassDb } from "@/lib/supabase/db";

export interface CycleClassTemplate {
  name: string;
  level: string;
  series?: string;
  cycle_year?: string;
}

export const CYCLE_TEMPLATES: Record<string, CycleClassTemplate[]> = {
  maternelle: [
    { name: "Petite Section (PS)", level: "Maternelle", cycle_year: "1ère année" },
    { name: "Moyenne Section (MS)", level: "Maternelle", cycle_year: "2ème année" },
    { name: "Grande Section (GS / CI)", level: "Maternelle", cycle_year: "3ème année" },
  ],
  primaire: [
    { name: "CP1", level: "Primaire" },
    { name: "CP2", level: "Primaire" },
    { name: "CE1", level: "Primaire" },
    { name: "CE2", level: "Primaire" },
    { name: "CM1", level: "Primaire" },
    { name: "CM2", level: "Primaire" },
  ],
  college: [
    { name: "6ème", level: "Collège" },
    { name: "5ème", level: "Collège" },
    { name: "4ème", level: "Collège" },
    { name: "3ème", level: "Collège" },
  ],
  lycee: [
    { name: "2nde A4", level: "Lycée", series: "A4" },
    { name: "2nde CD", level: "Lycée", series: "CD" },
    { name: "1ère A4", level: "Lycée", series: "A4" },
    { name: "1ère D", level: "Lycée", series: "D" },
    { name: "Tle A4", level: "Lycée", series: "A4" },
    { name: "Tle D", level: "Lycée", series: "D" },
  ],
  superieur: [
    { name: "Licence 1 (L1)", level: "Enseignement Supérieur", cycle_year: "L1" },
    { name: "Licence 2 (L2)", level: "Enseignement Supérieur", cycle_year: "L2" },
    { name: "Licence 3 (L3)", level: "Enseignement Supérieur", cycle_year: "L3" },
    { name: "Master 1 (M1)", level: "Enseignement Supérieur", cycle_year: "M1" },
    { name: "Master 2 (M2)", level: "Enseignement Supérieur", cycle_year: "M2" },
  ],
};

/**
 * Validation stricte d'une grille tarifaire
 * RÈGLE : La somme des tranches doit être égale au montant total annuel.
 */
export function validateTuitionPlan(plan: TuitionPlan): { isValid: boolean; errorMessage?: string } {
  if (!plan.class_id) {
    return { isValid: false, errorMessage: "Veuillez sélectionner une classe valide." };
  }

  if (isNaN(plan.total_amount) || plan.total_amount <= 0) {
    return { isValid: false, errorMessage: "Le montant total annuel de la scolarité doit être supérieur à 0 FCFA." };
  }

  if (!plan.installments || plan.installments.length === 0) {
    return { isValid: false, errorMessage: "Au moins une tranche d'échéance doit être définie." };
  }

  let sum = 0;
  for (let i = 0; i < plan.installments.length; i++) {
    const inst = plan.installments[i];
    if (!inst.title || !inst.title.trim()) {
      return { isValid: false, errorMessage: `La tranche #${i + 1} doit avoir un libellé (ex: 1ère Tranche).` };
    }
    if (!inst.due_date) {
      return { isValid: false, errorMessage: `Veuillez indiquer une date d'échéance pour la tranche #${i + 1} (« ${inst.title} »).` };
    }
    if (isNaN(inst.amount) || inst.amount <= 0) {
      return { isValid: false, errorMessage: `Le montant de la tranche #${i + 1} (« ${inst.title} ») doit être supérieur à 0 FCFA.` };
    }
    sum += Number(inst.amount);
  }

  if (sum !== plan.total_amount) {
    const diff = Math.abs(sum - plan.total_amount);
    if (sum > plan.total_amount) {
      return {
        isValid: false,
        errorMessage: `Dépassement détecté : Le total des tranches (${sum.toLocaleString("fr-FR")} FCFA) dépasse la scolarité annuelle (${plan.total_amount.toLocaleString("fr-FR")} FCFA) de ${diff.toLocaleString("fr-FR")} FCFA. Veuillez équilibrer les montants.`,
      };
    } else {
      return {
        isValid: false,
        errorMessage: `Tranches incomplètes : Le total des tranches (${sum.toLocaleString("fr-FR")} FCFA) est inférieur à la scolarité annuelle (${plan.total_amount.toLocaleString("fr-FR")} FCFA). Il reste ${diff.toLocaleString("fr-FR")} FCFA à allouer.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Enregistrement sécurisé d'une grille tarifaire dans Supabase
 */
export async function saveTuitionPlan(
  plan: TuitionPlan,
  schoolId: string,
  academicYearId: string
): Promise<{ success: boolean; error?: string }> {
  const validation = validateTuitionPlan(plan);
  if (!validation.isValid) {
    return { success: false, error: validation.errorMessage };
  }

  try {
    const ok = await saveTuitionPlanDb(plan, schoolId, academicYearId);
    return { success: ok };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de l'enregistrement de la tarification." };
  }
}
