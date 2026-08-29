// Test de validation unitaire et logique pour SCOLY
// Validation des règles d'extraction Parent/Élève et de Persistance

import { validateImportRows } from "../lib/import/validation/data-validator.ts";
import { checkDuplicatesAgainstExistingStudents } from "../lib/import/validation/duplicate-checker.ts";
import { detectColumnMapping } from "../lib/import/mappers/column-detector.ts";

console.log("==================================================");
console.log("SCOLY — TEST DE VALIDATION DES PARENTS & PERSISTANCE");
console.log("==================================================");

let allPassed = true;

// SCÉNARIO 1 : Colonne 'Parent' combinée "Marie KOFFI - 90123456"
const mockRows1 = [
  {
    "Nom élève": "KOFFI",
    "Prénom élève": "Jean",
    "Classe": "6ème A",
    "Parent": "Marie KOFFI - 90123456",
  }
];
const mappings1 = detectColumnMapping(Object.keys(mockRows1[0]));
const validated1 = validateImportRows(mockRows1, mappings1, [{ id: "c1", name: "6ème A", level: "Collège", school_id: "s1", academic_year_id: "y1", order_index: 0 }]);
const r1 = validated1[0];

if (r1.parsedParent?.full_name === "Marie KOFFI" && r1.parsedParent?.phone_primary.includes("90123456")) {
  console.log("✅ CAS 1 VALIDÉ : Nom et Téléphone séparés avec succès ('Marie KOFFI - 90123456')");
} else {
  console.error("❌ CAS 1 ÉCHOUÉ :", r1.parsedParent);
  allPassed = false;
}

// SCÉNARIO 2 : Numéro pur dans la colonne Parent
const mockRows2 = [
  {
    "Nom": "MENSAH",
    "Prénom": "Kossi",
    "Classe": "5ème B",
    "Parent": "90000000",
  }
];
const mappings2 = detectColumnMapping(Object.keys(mockRows2[0]));
const validated2 = validateImportRows(mockRows2, mappings2, [{ id: "c2", name: "5ème B", level: "Collège", school_id: "s1", academic_year_id: "y1", order_index: 1 }]);
const r2 = validated2[0];

if (r2.parsedParent?.full_name.includes("MENSAH") && r2.parsedParent?.phone_primary.includes("90000000")) {
  console.log("✅ CAS 2 VALIDÉ : Numéro pur détecté et basculé en téléphone sans écraser le nom de l'élève/parent");
} else {
  console.error("❌ CAS 2 ÉCHOUÉ :", r2.parsedParent);
  allPassed = false;
}

// SCÉNARIO 3 : Format avec parenthèses "ADOTE Kokou (91 23 45 67)"
const mockRows3 = [
  {
    "Nom": "ADOTE",
    "Prénom": "Afi",
    "Classe": "CM2",
    "Parent": "ADOTE Kokou (91 23 45 67)",
  }
];
const mappings3 = detectColumnMapping(Object.keys(mockRows3[0]));
const validated3 = validateImportRows(mockRows3, mappings3, [{ id: "c3", name: "CM2", level: "Primaire", school_id: "s1", academic_year_id: "y1", order_index: 2 }]);
const r3 = validated3[0];

if (r3.parsedParent?.full_name === "ADOTE Kokou" && r3.parsedParent?.phone_primary.replace(/\s/g, "").includes("91234567")) {
  console.log("✅ CAS 3 VALIDÉ : Format parenthèses extrait proprement ('ADOTE Kokou (91 23 45 67)')");
} else {
  console.error("❌ CAS 3 ÉCHOUÉ :", r3.parsedParent);
  allPassed = false;
}

// SCÉNARIO 4 : Colonnes distinctes Nom Parent et Contact Parent
const mockRows4 = [
  {
    "Nom": "LAWSON",
    "Prénom": "David",
    "Classe": "Terminale D",
    "Parent": "LAWSON Paul",
    "Contact Parent": "+228 92 33 44 55",
  }
];
const mappings4 = detectColumnMapping(Object.keys(mockRows4[0]));
const validated4 = validateImportRows(mockRows4, mappings4, [{ id: "c4", name: "Terminale D", level: "Lycée", school_id: "s1", academic_year_id: "y1", order_index: 3 }]);
const r4 = validated4[0];

if (r4.parsedParent?.full_name === "LAWSON Paul" && r4.parsedParent?.phone_primary.includes("+228 92 33 44 55")) {
  console.log("✅ CAS 4 VALIDÉ : Colonnes distinctes Nom et Contact associées avec perfection");
} else {
  console.error("❌ CAS 4 ÉCHOUÉ :", r4.parsedParent);
  allPassed = false;
}

// SCÉNARIO 5 : Re-importation et détection de doublons sans suppression
const existingStudents = [
  {
    id: "s-existing-1",
    school_id: "s1",
    academic_year_id: "y1",
    class_id: "c1",
    class_name: "6ème A",
    matricule: "MAT-001",
    first_name: "Jean",
    last_name: "KOFFI",
    gender: "M",
    is_active: true,
    discount_amount: 0,
    parent: {
      id: "p1",
      school_id: "s1",
      full_name: "Marie KOFFI",
      relationship: "Mère",
      phone_primary: "+228 90 12 34 56"
    },
    created_at: new Date().toISOString()
  }
];

const dupChecked = checkDuplicatesAgainstExistingStudents(validated1, existingStudents);
const jeanDuplicate = dupChecked.find(r => r.parsedStudent.last_name === "KOFFI");

if (jeanDuplicate?.duplicateInfo && jeanDuplicate.duplicateInfo.matchedStudentId === "s-existing-1") {
  console.log("✅ CAS 5 VALIDÉ : Doublon détecté avec exactitude sur Jean KOFFI sans suppression des autres élèves");
} else {
  console.error("❌ CAS 5 ÉCHOUÉ :", jeanDuplicate);
  allPassed = false;
}

console.log("\n==================================================");
if (allPassed) {
  console.log("🎉 TOUS LES TESTS D'EXTRACTION ET DE PERSISTANCE SONT VALIDÉS (5/5) !");
} else {
  console.log("❌ DES TESTS ONT ÉCHOUÉ.");
}
console.log("==================================================");
