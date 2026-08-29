import { Payment } from "@/types/scoly";
import { insertPaymentDb, cancelPaymentDb } from "@/lib/supabase/db";
import { validatePaymentAmount } from "./financial.service";

export interface RecordPaymentParams {
  schoolId: string;
  academicYearId: string;
  studentId: string;
  studentName: string;
  matricule: string;
  className: string;
  parentName?: string;
  parentPhone?: string;
  amount: number;
  balanceDue: number;
  paymentMethod: string;
  transactionRef?: string;
  notes?: string;
  receiptPrefix?: string;
  receiptCounter?: number;
  idempotencyKey?: string;
  recordedBy?: string;
}

export interface RecordPaymentResult {
  success: boolean;
  payment?: Payment;
  receiptNumber?: string;
  error?: string;
}

/**
 * SERVICE D'ENCAISSEMENT ET DE GESTION DES PAIEMENTS
 * Applique la règle d'or financière et persiste de façon atomique dans Supabase.
 */

export async function processPayment(params: RecordPaymentParams): Promise<RecordPaymentResult> {
  const {
    schoolId,
    academicYearId,
    studentId,
    studentName,
    matricule,
    className,
    parentName,
    parentPhone,
    amount,
    balanceDue,
    paymentMethod,
    transactionRef,
    notes,
    receiptPrefix = "REC-25-",
    receiptCounter = 1,
    idempotencyKey,
  } = params;

  // 1. Validation financière stricte
  const validation = validatePaymentAmount(amount, balanceDue);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.errorMessage || "Montant de paiement invalide.",
    };
  }

  const cleanAmount = Math.round(amount);
  const nextCounter = receiptCounter + 1;
  const localReceiptNumber = `${receiptPrefix}${String(nextCounter).padStart(5, "0")}`;
  const nowStr = new Date().toISOString();
  const todayDate = nowStr.split("T")[0];

  const paymentRecord: Payment = {
    id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    school_id: schoolId,
    student_id: studentId,
    student_name: studentName,
    matricule,
    class_name: className,
    academic_year_id: academicYearId,
    amount: cleanAmount,
    allocated_amount: cleanAmount,
    credit_amount: 0,
    is_advance: false,
    payment_date: todayDate,
    payment_method: paymentMethod || "cash",
    transaction_ref: transactionRef ? transactionRef.trim() : undefined,
    receipt_number: localReceiptNumber,
    notes: notes ? notes.trim() : undefined,
    parent_name: parentName,
    parent_phone: parentPhone,
    status: "completed",
    idempotency_key: idempotencyKey,
    created_at: nowStr,
  };

  try {
    // Appel Supabase (RPC record_payment_v3 / record_payment_v2)
    const res = await insertPaymentDb(paymentRecord, schoolId, academicYearId);

    if (res.data?.receipt_number) {
      paymentRecord.receipt_number = res.data.receipt_number;
    }
    if (res.data?.payment_id) {
      paymentRecord.id = res.data.payment_id;
    }

    return {
      success: true,
      payment: paymentRecord,
      receiptNumber: paymentRecord.receipt_number,
    };
  } catch (err: any) {
    const message = err?.message || "Erreur lors de l'enregistrement du paiement.";
    if (message.includes("OVERPAYMENT_FORBIDDEN")) {
      return {
        success: false,
        error: `Montant trop élevé : Le solde restant dû est de ${balanceDue.toLocaleString("fr-FR")} FCFA. Vous ne pouvez pas enregistrer plus que le montant restant.`,
      };
    }
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Annulation d'un paiement avec traçabilité et motif obligatoire
 */
export async function cancelPayment(
  paymentId: string,
  reason: string,
  cancelledByName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!reason || !reason.trim()) {
    return {
      success: false,
      error: "Un motif d'annulation explicite est obligatoire.",
    };
  }

  try {
    const ok = await cancelPaymentDb(paymentId, reason.trim(), cancelledByName);
    return { success: ok };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Échec de l'annulation du paiement.",
    };
  }
}
