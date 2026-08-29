import { Student, Parent } from "@/types/scoly";
import { insertStudentDb, updateStudentDb, deleteStudentDb } from "@/lib/supabase/db";

export interface CreateStudentInput {
  schoolId: string;
  academicYearId: string;
  firstName: string;
  lastName: string;
  classId: string;
  className: string;
  gender: "M" | "F";
  birthDate?: string;
  parentName: string;
  parentPhone: string;
  parentRelationship?: "Père" | "Mère" | "Tuteur" | "Autre";
  parentWhatsapp?: string;
  parentProfession?: string;
  parentAddress?: string;
  customTuition?: number;
  discountAmount?: number;
  discountReason?: string;
  matricule?: string;
  existingCount?: number;
}

export interface StudentServiceResult {
  success: boolean;
  student?: Student;
  error?: string;
}

/**
 * Génère un matricule propre et structuré pour l'élève
 */
export function generateStudentMatricule(
  yearName: string,
  className: string,
  index: number
): string {
  const shortYear = yearName.includes("-") ? yearName.split("-")[0] : yearName.substring(0, 4);
  const cleanClass = className.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().substring(0, 4);
  const paddedIndex = String(index + 1).padStart(3, "0");
  return `${shortYear || "2025"}-${cleanClass || "GEN"}-${paddedIndex}`;
}

/**
 * SERVICE DE GESTION DES ÉLÈVES
 */

export async function createStudent(input: CreateStudentInput): Promise<StudentServiceResult> {
  const {
    schoolId,
    academicYearId,
    firstName,
    lastName,
    classId,
    className,
    gender,
    birthDate,
    parentName,
    parentPhone,
    parentRelationship = "Mère",
    parentWhatsapp,
    parentProfession,
    parentAddress,
    customTuition,
    discountAmount = 0,
    discountReason,
    matricule,
    existingCount = 0,
  } = input;

  if (!firstName.trim() || !lastName.trim()) {
    return { success: false, error: "Le prénom et le nom de l'élève sont obligatoires." };
  }

  if (!classId) {
    return { success: false, error: "Une classe valide doit être sélectionnée." };
  }

  if (!parentName.trim() || !parentPhone.trim()) {
    return { success: false, error: "Le nom et le numéro de téléphone du parent sont obligatoires." };
  }

  const finalMatricule =
    matricule && matricule.trim()
      ? matricule.trim().toUpperCase()
      : generateStudentMatricule("2025-2026", className, existingCount);

  const parent: Parent = {
    id: crypto.randomUUID(),
    school_id: schoolId,
    full_name: parentName.trim(),
    relationship: parentRelationship,
    phone_primary: parentPhone.trim(),
    phone_whatsapp: parentWhatsapp ? parentWhatsapp.trim() : parentPhone.trim(),
    profession: parentProfession ? parentProfession.trim() : undefined,
    address: parentAddress ? parentAddress.trim() : undefined,
  };

  const student: Student = {
    id: crypto.randomUUID(),
    school_id: schoolId,
    academic_year_id: academicYearId,
    class_id: classId,
    class_name: className,
    matricule: finalMatricule,
    first_name: firstName.trim(),
    last_name: lastName.trim().toUpperCase(),
    gender: gender || "M",
    birth_date: birthDate || undefined,
    is_active: true,
    discount_amount: discountAmount || 0,
    discount_reason: discountReason || undefined,
    custom_tuition: customTuition !== undefined && customTuition >= 0 ? customTuition : undefined,
    parent,
    created_at: new Date().toISOString(),
  };

  try {
    const ok = await insertStudentDb(student, schoolId, academicYearId);
    if (!ok) {
      return { success: false, error: "Échec de l'insertion dans la base de données Supabase." };
    }
    return { success: true, student };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la création de l'élève." };
  }
}

export async function updateStudent(
  studentId: string,
  updates: Partial<Student>
): Promise<StudentServiceResult> {
  try {
    const ok = await updateStudentDb(studentId, updates);
    if (!ok) {
      return { success: false, error: "Échec de la mise à jour dans Supabase." };
    }
    return { success: true, student: updates as Student };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la mise à jour de l'élève." };
  }
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  try {
    return await deleteStudentDb(studentId);
  } catch {
    return false;
  }
}
