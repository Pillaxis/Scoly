import { Student } from "@/types/scoly";
import { DuplicateMatchInfo, ValidatedImportRow } from "@/types/import";

/**
 * Analyse les lignes validées et détecte les doublons potentiels par rapport aux élèves existants
 */
export function checkDuplicatesAgainstExistingStudents(
  rows: ValidatedImportRow[],
  existingStudents: Student[]
): ValidatedImportRow[] {
  // Index pour recherche rapide
  const matriculeMap = new Map<string, Student>();
  const nameClassMap = new Map<string, Student>();
  const fullNameMap = new Map<string, Student>();
  const phoneMap = new Map<string, Student>();

  existingStudents.forEach((student) => {
    if (student.matricule) {
      matriculeMap.set(student.matricule.toLowerCase().trim(), student);
    }

    const normName = `${student.first_name} ${student.last_name}`.toLowerCase().trim();
    fullNameMap.set(normName, student);

    if (student.class_name) {
      const normClass = student.class_name.toLowerCase().trim();
      nameClassMap.set(`${normName}___${normClass}`, student);
    }

    if (student.parent?.phone_primary) {
      const cleanPhone = student.parent.phone_primary.replace(/[^0-9]/g, "");
      if (cleanPhone.length >= 8) {
        phoneMap.set(cleanPhone, student);
      }
    }
  });

  // Pour détection des doublons internes au fichier
  const fileSeenMatricules = new Set<string>();
  const fileSeenNames = new Set<string>();

  return rows.map((row) => {
    // Si la ligne a déjà une erreur bloquante, ne pas la marquer comme doublon
    if (row.status === "error") return row;

    const rowMatricule = row.parsedStudent.matricule?.toLowerCase().trim();
    const rowFullName = `${row.parsedStudent.first_name} ${row.parsedStudent.last_name}`.toLowerCase().trim();
    const rowClass = row.parsedStudent.class_name.toLowerCase().trim();
    const rowPhone = row.parsedParent?.phone_primary.replace(/[^0-9]/g, "") || "";

    let duplicateInfo: DuplicateMatchInfo | undefined;

    // 1. Priorité 1 : Matricule identique existant
    if (rowMatricule && matriculeMap.has(rowMatricule)) {
      const matched = matriculeMap.get(rowMatricule)!;
      duplicateInfo = {
        matchedStudentId: matched.id,
        matchedStudentName: `${matched.first_name} ${matched.last_name}`,
        matchedMatricule: matched.matricule,
        matchedClassName: matched.class_name,
        matchReason: "matricule",
        action: "skip",
      };
    }
    // 2. Priorité 2 : Nom + Prénom + Classe identique existant
    else if (nameClassMap.has(`${rowFullName}___${rowClass}`)) {
      const matched = nameClassMap.get(`${rowFullName}___${rowClass}`)!;
      duplicateInfo = {
        matchedStudentId: matched.id,
        matchedStudentName: `${matched.first_name} ${matched.last_name}`,
        matchedMatricule: matched.matricule,
        matchedClassName: matched.class_name,
        matchReason: "name_and_class",
        action: "skip",
      };
    }
    // 3. Priorité 3 : Nom + Prénom identique existant
    else if (fullNameMap.has(rowFullName)) {
      const matched = fullNameMap.get(rowFullName)!;
      duplicateInfo = {
        matchedStudentId: matched.id,
        matchedStudentName: `${matched.first_name} ${matched.last_name}`,
        matchedMatricule: matched.matricule,
        matchedClassName: matched.class_name,
        matchReason: "full_name",
        action: "skip",
      };
    }
    // 4. Priorité 4 : Téléphone parent identique existant
    else if (rowPhone && rowPhone.length >= 8 && phoneMap.has(rowPhone)) {
      const matched = phoneMap.get(rowPhone)!;
      // On avertit simplement que le parent a déjà un élève dans l'établissement
      row.warnings.push(`Numéro parent déjà associé à l'élève existant : ${matched.first_name} ${matched.last_name} (${matched.class_name}).`);
    }

    // 5. Détection de doublon interne au fichier
    if (rowMatricule) {
      if (fileSeenMatricules.has(rowMatricule)) {
        row.warnings.push(`Matricule '${row.parsedStudent.matricule}' en double à l'intérieur de ce fichier.`);
      } else {
        fileSeenMatricules.add(rowMatricule);
      }
    }

    if (fileSeenNames.has(`${rowFullName}___${rowClass}`)) {
      row.warnings.push(`Élève '${row.parsedStudent.first_name} ${row.parsedStudent.last_name}' répété plusieurs fois dans la même classe.`);
    } else {
      fileSeenNames.add(`${rowFullName}___${rowClass}`);
    }

    if (duplicateInfo) {
      return {
        ...row,
        status: "duplicate",
        duplicateInfo,
      };
    }

    return row;
  });
}
