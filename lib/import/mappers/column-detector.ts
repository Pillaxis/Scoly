import { TargetFieldDefinition, TargetFieldKey, ColumnMappingRule } from "@/types/import";

export const TARGET_FIELDS_REGISTRY: TargetFieldDefinition[] = [
  // ÉLÈVE
  {
    key: "last_name",
    label: "Nom de l'Élève",
    category: "student",
    isRequired: true,
    example: "Koffi",
    synonyms: [
      "nom",
      "nom de famille",
      "nom eleve",
      "nom_eleve",
      "last name",
      "lastname",
      "surname",
      "nom patronymique",
      "nom de l eleve",
    ],
  },
  {
    key: "first_name",
    label: "Prénom(s) de l'Élève",
    category: "student",
    isRequired: true,
    example: "Jean-Paul",
    synonyms: [
      "prenom",
      "prenoms",
      "prenom eleve",
      "prenom_eleve",
      "first name",
      "firstname",
      "given name",
      "prenoms eleve",
    ],
  },
  {
    key: "full_name",
    label: "Nom & Prénom Combinés",
    category: "student",
    isRequired: false,
    example: "Koffi Jean-Paul",
    synonyms: [
      "nom et prenom",
      "nom prenom",
      "nom et prenoms",
      "nom complet",
      "full name",
      "fullname",
      "nom_prenom",
      "eleve",
      "nom de l'eleve",
    ],
  },
  {
    key: "matricule",
    label: "Matricule / Identifiant",
    category: "student",
    isRequired: false,
    example: "2025-6A-012",
    synonyms: [
      "matricule",
      "num matricule",
      "numero matricule",
      "num_mat",
      "id",
      "code eleve",
      "code",
      "identifiant",
      "mat",
      "student id",
    ],
  },
  {
    key: "gender",
    label: "Sexe / Genre",
    category: "student",
    isRequired: false,
    example: "M ou F",
    synonyms: [
      "sexe",
      "genre",
      "gender",
      "sex",
      "s",
      "m/f",
    ],
  },
  {
    key: "birth_date",
    label: "Date de Naissance",
    category: "student",
    isRequired: false,
    example: "14/05/2012",
    synonyms: [
      "date de naissance",
      "date_naissance",
      "date naissance",
      "naissance",
      "dob",
      "birth date",
      "birthdate",
      "né le",
      "ne le",
    ],
  },
  {
    key: "class_name",
    label: "Classe / Niveau",
    category: "student",
    isRequired: true,
    example: "6ème A, CM2, CP1...",
    synonyms: [
      "classe",
      "niveau",
      "class",
      "grade",
      "salle",
      "classe eleve",
      "filiere",
      "section",
    ],
  },

  // PARENT / TUTEUR
  {
    key: "parent_name",
    label: "Nom du Parent / Tuteur",
    category: "parent",
    isRequired: false,
    example: "Koffi Mensah",
    synonyms: [
      "parent",
      "nom parent",
      "nom du parent",
      "tuteur",
      "pere",
      "mere",
      "responsable",
      "nom tuteur",
      "guardian",
      "parent name",
      "nom du pere",
      "nom de la mere",
    ],
  },
  {
    key: "parent_phone",
    label: "Téléphone Principal",
    category: "parent",
    isRequired: false,
    example: "+228 90 12 34 56",
    synonyms: [
      "telephone",
      "tel",
      "phone",
      "contact",
      "cel",
      "cellulaire",
      "mobile",
      "tel parent",
      "contact parent",
      "telephone parent",
      "phone number",
      "numero",
      "num tel",
    ],
  },
  {
    key: "parent_whatsapp",
    label: "Numéro WhatsApp",
    category: "parent",
    isRequired: false,
    example: "+228 90 12 34 56",
    synonyms: [
      "whatsapp",
      "wa",
      "num whatsapp",
      "numero whatsapp",
      "tel whatsapp",
      "contact whatsapp",
    ],
  },
  {
    key: "parent_relationship",
    label: "Lien de Parenté",
    category: "parent",
    isRequired: false,
    example: "Père, Mère, Tuteur",
    synonyms: [
      "relation",
      "lien",
      "lien de parente",
      "lien parente",
      "relationship",
      "type parent",
      "qualite",
    ],
  },
  {
    key: "parent_profession",
    label: "Profession du Parent",
    category: "parent",
    isRequired: false,
    example: "Commerçant(e)",
    synonyms: ["profession", "metier", "occupation", "job", "profession parent"],
  },
  {
    key: "parent_address",
    label: "Adresse / Quartier",
    category: "parent",
    isRequired: false,
    example: "Agoè Cacaveli",
    synonyms: ["adresse", "quartier", "ville", "domicile", "residence", "address", "habitation"],
  },

  // SCOLARITÉ & FINANCE
  {
    key: "tuition_amount",
    label: "Montant Scolarité Annuelle",
    category: "finance",
    isRequired: false,
    example: "150 000 FCFA",
    synonyms: [
      "scolarite",
      "montant scolarite",
      "frais de scolarite",
      "scolarite annuelle",
      "total scolarite",
      "montant total",
      "tuition",
      "frais",
      "tarif",
    ],
  },
  {
    key: "discount_amount",
    label: "Remise / Bourse Accordée",
    category: "finance",
    isRequired: false,
    example: "15 000 FCFA",
    synonyms: [
      "remise",
      "reduction",
      "bourse",
      "rabais",
      "discount",
      "exoneration",
    ],
  },
  {
    key: "discount_reason",
    label: "Motif de la Remise",
    category: "finance",
    isRequired: false,
    example: "Enfant d'enseignant",
    synonyms: ["motif remise", "raison remise", "justification", "motif reduction"],
  },

  // PAIEMENT ENCAISSÉ
  {
    key: "payment_amount",
    label: "Montant Versé / Encaissé",
    category: "payment",
    isRequired: false,
    example: "50 000 FCFA",
    synonyms: [
      "montant paye",
      "montant verse",
      "versement",
      "acompte",
      "paye",
      "deja paye",
      "encaissement",
      "payment amount",
      "avance",
      "1ere tranche payee",
      "tranche 1",
      "montant regle",
    ],
  },
  {
    key: "payment_date",
    label: "Date du Paiement",
    category: "payment",
    isRequired: false,
    example: "10/09/2025",
    synonyms: [
      "date paiement",
      "date de paiement",
      "date versement",
      "date de versement",
      "payment date",
      "date reglement",
      "date paie",
    ],
  },
  {
    key: "payment_method",
    label: "Mode de Paiement",
    category: "payment",
    isRequired: false,
    example: "Espèces, TMoney, Flooz, Virement, Chèque",
    synonyms: [
      "mode de paiement",
      "moyen de paiement",
      "mode",
      "moyen",
      "mode paiement",
      "payment method",
      "type de paiement",
      "canal",
    ],
  },
  {
    key: "payment_ref",
    label: "Référence / N° Reçu",
    category: "payment",
    isRequired: false,
    example: "REC-25-001, TX12345",
    synonyms: [
      "reference",
      "ref",
      "numero recu",
      "num recu",
      "recu",
      "transaction id",
      "reference transaction",
      "bordereau",
    ],
  },
  {
    key: "payment_notes",
    label: "Notes / Commentaires Paiement",
    category: "payment",
    isRequired: false,
    example: "Reçu signé par la caissière",
    synonyms: ["notes", "commentaire", "remarques", "obs", "observations"],
  },
];

/**
 * Normalise un texte (supprime accents, minuscules, caractères spéciaux) pour comparaison sémantique
 */
export function normalizeHeader(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]/g, " ")     // Remplace ponctuation par espaces
    .replace(/\s+/g, " ")           // Espace unique
    .trim();
}

/**
 * Calcule un score de similarité entre 0 et 100 entre un en-tête source et un champ cible
 */
export function calculateHeaderMatchScore(
  sourceHeader: string,
  fieldDef: TargetFieldDefinition
): number {
  const normSource = normalizeHeader(sourceHeader);
  if (!normSource) return 0;

  for (const synonym of fieldDef.synonyms) {
    const normSyn = normalizeHeader(synonym);
    if (normSource === normSyn) {
      return 100; // Match exact
    }
    if (normSource.startsWith(normSyn) || normSource.endsWith(normSyn)) {
      return 90;
    }
    if (normSource.includes(normSyn) || normSyn.includes(normSource)) {
      return 75;
    }
  }

  return 0;
}

/**
 * Détecte intelligemment les correspondances entre les en-têtes d'un fichier source et les champs SCOLY
 */
export function detectColumnMapping(sourceHeaders: string[]): ColumnMappingRule[] {
  const assignedTargetKeys = new Set<TargetFieldKey>();

  return sourceHeaders.map((header) => {
    let bestFieldKey: TargetFieldKey | "" = "";
    let bestScore = 0;

    for (const fieldDef of TARGET_FIELDS_REGISTRY) {
      const score = calculateHeaderMatchScore(header, fieldDef);
      if (score > bestScore && score >= 70) {
        // Priorité si non encore assigné
        if (!assignedTargetKeys.has(fieldDef.key) || score === 100) {
          bestScore = score;
          bestFieldKey = fieldDef.key;
        }
      }
    }

    if (bestFieldKey) {
      assignedTargetKeys.add(bestFieldKey);
    }

    return {
      sourceHeader: header,
      targetKey: bestFieldKey,
      confidence: bestScore,
      isAutoDetected: Boolean(bestFieldKey && bestScore >= 70),
    };
  });
}
