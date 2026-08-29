import { BatchProgress, ImportSourceType, ImportSummary, ValidatedImportRow } from "@/types/import";
import { ClassRoom, Payment, PaymentMethod, School, Student } from "@/types/scoly";

export interface BatchProcessingOptions {
  rows: ValidatedImportRow[];
  sourceType: ImportSourceType;
  fileName?: string;
  academicYearId: string;
  academicYearName: string;
  school: School;
  existingStudents: Student[];
  availableClasses: ClassRoom[];
  batchSize?: number;
  onProgress?: (progress: BatchProgress) => void;
  // Fonctions de mutation du store
  onAddClass?: (classData: any) => ClassRoom;
  onAddStudent: (studentData: any) => Student;
  onUpdateStudent: (id: string, updates: Partial<Student>) => void;
  onAddPayment: (paymentData: any) => Payment;
  onLogAudit: (action: string, entityType: string, entityId: string, payload: any) => void;
}

/**
 * Traite les lignes d'import par lots asynchrones sans bloquer l'UI
 */
export async function executeBatchImport(options: BatchProcessingOptions): Promise<ImportSummary & {
  createdStudents: Student[];
  createdPayments: Payment[];
  createdClasses: ClassRoom[];
}> {
  const {
    rows,
    sourceType,
    fileName,
    academicYearId,
    academicYearName,
    school,
    existingStudents,
    availableClasses,
    batchSize = 25,
    onProgress,
    onAddClass,
    onAddStudent,
    onUpdateStudent,
    onAddPayment,
    onLogAudit,
  } = options;

  const totalRows = rows.length;
  const totalBatches = Math.ceil(totalRows / batchSize) || 1;
  const batchId = `import-${Date.now()}`;

  const createdStudents: Student[] = [];
  const createdPayments: Payment[] = [];
  const createdClasses: ClassRoom[] = [];
  const knownClasses: ClassRoom[] = [...availableClasses];

  let studentsImported = 0;
  let studentsUpdated = 0;
  let parentsAssociated = 0;
  let paymentsImported = 0;
  let rowsSkipped = 0;
  let errorsCount = 0;

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIdx = batchIndex * batchSize;
    const endIdx = Math.min(startIdx + batchSize, totalRows);
    const currentChunk = rows.slice(startIdx, endIdx);

    // Mettre à jour la progression
    const processedCount = startIdx;
    const percentage = Math.round((processedCount / totalRows) * 100);

    if (onProgress) {
      onProgress({
        currentBatch: batchIndex + 1,
        totalBatches,
        processedRows: processedCount,
        totalRows,
        percentage,
        status: "running",
        currentActionDescription: `Importation du lot ${batchIndex + 1}/${totalBatches} (${endIdx}/${totalRows} lignes)...`,
      });
    }

    // Pause asynchrone pour laisser le navigateur rafraîchir l'interface (60fps)
    await new Promise((resolve) => setTimeout(resolve, 35));

    // Traitement de chaque ligne du lot
    for (const row of currentChunk) {
      if (row.isExcluded || row.status === "error") {
        rowsSkipped++;
        if (row.status === "error") errorsCount++;
        continue;
      }

      // Résolution de doublon
      if (row.status === "duplicate" && row.duplicateInfo) {
        if (row.duplicateInfo.action === "skip") {
          rowsSkipped++;
          continue;
        }

        if (row.duplicateInfo.action === "update") {
          const targetId = row.duplicateInfo.matchedStudentId;
          const updates: Partial<Student> = {};

          if (row.parsedStudent.class_name) updates.class_name = row.parsedStudent.class_name;
          if (row.parsedStudent.gender) updates.gender = row.parsedStudent.gender;
          if (row.parsedStudent.birth_date) updates.birth_date = row.parsedStudent.birth_date;
          if (row.parsedStudent.custom_tuition !== undefined) updates.custom_tuition = row.parsedStudent.custom_tuition;
          if (row.parsedStudent.discount_amount !== undefined) {
            updates.discount_amount = row.parsedStudent.discount_amount;
            updates.discount_reason = row.parsedStudent.discount_reason;
          }

          onUpdateStudent(targetId, updates);
          studentsUpdated++;

          // Enregistrement d'un paiement si présent
          if (row.parsedPayment && row.parsedPayment.amount > 0) {
            try {
              onAddPayment({
                student_id: targetId,
                amount: row.parsedPayment.amount,
                payment_method: row.parsedPayment.payment_method || "cash",
                payment_date: row.parsedPayment.payment_date,
                transaction_ref: row.parsedPayment.transaction_ref,
                notes: row.parsedPayment.notes || `Paiement importé (${sourceType})`,
                recorded_by_name: "Import Intelligent",
              });
              paymentsImported++;
            } catch (payErr) {
              console.warn(`[Batch Import] Payment skipped for updated student ${targetId}:`, payErr);
            }
          }
          continue;
        }
      }

      // Création d'un nouvel élève
      // Trouver ou créer la classe
      const rawClassName = row.parsedStudent.class_name?.trim() || "Classe standard";
      let classId = row.parsedStudent.class_id;
      if (!classId) {
        const found = knownClasses.find(
          (c) => c.name.toLowerCase().trim() === rawClassName.toLowerCase()
        );
        if (found) {
          classId = found.id;
        } else if (onAddClass) {
          try {
            const newCls = onAddClass({
              name: rawClassName,
              level: "Secondaire",
            });
            knownClasses.push(newCls);
            createdClasses.push(newCls);
            classId = newCls.id;
          } catch {
            classId = knownClasses[0]?.id || "cls-default";
          }
        } else {
          classId = knownClasses[0]?.id || "cls-default";
        }
      }

      // S'assurer que le tarif couvre le paiement importé si renseigné
      const importedPaymentAmount = row.parsedPayment?.amount || 0;
      let effectiveTuition = row.parsedStudent.custom_tuition;
      if (importedPaymentAmount > 0 && (!effectiveTuition || effectiveTuition < importedPaymentAmount)) {
        effectiveTuition = importedPaymentAmount;
      }

      const createdStudent = onAddStudent({
        first_name: row.parsedStudent.first_name,
        last_name: row.parsedStudent.last_name,
        gender: row.parsedStudent.gender,
        birth_date: row.parsedStudent.birth_date,
        class_id: classId,
        class_name: rawClassName,
        matricule: row.parsedStudent.matricule,
        custom_tuition: effectiveTuition,
        discount_amount: row.parsedStudent.discount_amount,
        discount_reason: row.parsedStudent.discount_reason,
        parent_name: row.parsedParent?.full_name || `Parent de ${row.parsedStudent.last_name}`,
        parent_relationship: row.parsedParent?.relationship || "Père",
        parent_phone: row.parsedParent?.phone_primary || "—",
        parent_whatsapp: row.parsedParent?.phone_whatsapp,
        parent_profession: row.parsedParent?.profession,
        parent_address: row.parsedParent?.address,
      });

      createdStudents.push(createdStudent);
      studentsImported++;
      if (row.parsedParent?.phone_primary && row.parsedParent.phone_primary !== "—") {
        parentsAssociated++;
      }

      // Enregistrement du paiement associé
      if (row.parsedPayment && row.parsedPayment.amount > 0) {
        try {
          const newPay = onAddPayment({
            student_id: createdStudent.id,
            amount: row.parsedPayment.amount,
            payment_method: row.parsedPayment.payment_method || "cash",
            payment_date: row.parsedPayment.payment_date,
            transaction_ref: row.parsedPayment.transaction_ref,
            notes: row.parsedPayment.notes || `Paiement importé (${sourceType})`,
            recorded_by_name: "Import Intelligent",
          });
          createdPayments.push(newPay);
          paymentsImported++;
        } catch (payErr) {
          console.warn(`[Batch Import] Payment skipped for new student ${createdStudent.id}:`, payErr);
        }
      }
    }
  }

  // Finaliser la progression à 100%
  if (onProgress) {
    onProgress({
      currentBatch: totalBatches,
      totalBatches,
      processedRows: totalRows,
      totalRows,
      percentage: 100,
      status: "completed",
      currentActionDescription: "Importation terminée avec succès !",
    });
  }

  const summary = {
    batchId,
    sourceType,
    fileName,
    totalDetected: totalRows,
    studentsImported,
    studentsUpdated,
    parentsAssociated,
    paymentsImported,
    rowsSkipped,
    errorsCount,
    importedAt: new Date().toISOString(),
    academicYearId,
    academicYearName,
    createdStudents,
    createdPayments,
    createdClasses,
  };

  // Enregistrement dans le journal d'audit
  onLogAudit(
    "IMPORT_DATA_BATCH",
    "import_batch",
    batchId,
    summary
  );

  return summary;
}
