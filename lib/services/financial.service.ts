import { Student, Payment, TuitionPlan, PaymentStatus, TuitionInstallment } from "@/types/scoly";

export interface InstallmentBreakdownItem {
  id: string;
  title: string;
  amount: number;
  due_date: string;
  installment_order: number;
  allocated_amount: number;
  balance_due: number;
  status: "paid" | "partially_paid" | "unpaid";
  is_overdue: boolean;
  days_late: number;
}

export interface StudentFinancialSummary {
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  matricule: string;
  gross_tuition: number;
  discount_amount: number;
  net_tuition: number;
  total_paid: number;
  balance_due: number;
  status: PaymentStatus;
  days_late: number;
  next_due_date?: string;
  installments_breakdown: InstallmentBreakdownItem[];
  has_critical_delay: boolean;
}

/**
 * MOTEUR FINANCIER SCOLY (Calculs purs et déterministes)
 * Centralise tous les calculs de soldes, échéances, retards et tranches.
 */

export function calculateStudentFinancials(
  student: Student,
  tuitionPlans: TuitionPlan[],
  payments: Payment[],
  referenceDate: string = new Date().toISOString().split("T")[0]
): StudentFinancialSummary {
  const plan = tuitionPlans.find((tp) => tp.class_id === student.class_id);
  const grossTuition = student.custom_tuition ?? (plan ? plan.total_amount : 150000);
  const discount = student.discount_amount || 0;
  const netTuition = Math.max(0, grossTuition - discount);

  // Filtrer les paiements valides (non annulés) de cet élève
  const validPayments = payments.filter(
    (p) => p.student_id === student.id && p.status !== "cancelled"
  );
  const totalPaid = validPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balanceDue = Math.max(0, netTuition - totalPaid);

  // Tranches configurées pour cette classe
  const rawInstallments = plan?.installments ? [...plan.installments] : [];
  rawInstallments.sort((a, b) => (a.installment_order || 0) - (b.installment_order || 0));

  // Répartition en cascade (Waterfall) du montant déjà payé sur les tranches
  let remainingPaidPool = totalPaid;
  let maxDaysLate = 0;
  let nextDueDate: string | undefined;

  const installmentsBreakdown: InstallmentBreakdownItem[] = rawInstallments.map((inst, index) => {
    const instAmount = inst.amount || 0;
    const allocated = Math.min(remainingPaidPool, instAmount);
    remainingPaidPool = Math.max(0, remainingPaidPool - allocated);

    const instBalance = Math.max(0, instAmount - allocated);
    let itemStatus: "paid" | "partially_paid" | "unpaid" = "unpaid";
    if (allocated >= instAmount) {
      itemStatus = "paid";
    } else if (allocated > 0) {
      itemStatus = "partially_paid";
    }

    // Calcul du retard pour cette tranche spécifique
    let isOverdue = false;
    let daysLate = 0;
    if (instBalance > 0 && inst.due_date) {
      if (referenceDate > inst.due_date) {
        isOverdue = true;
        const diffMs = new Date(referenceDate).getTime() - new Date(inst.due_date).getTime();
        daysLate = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        if (daysLate > maxDaysLate) {
          maxDaysLate = daysLate;
        }
      } else if (!nextDueDate) {
        nextDueDate = inst.due_date;
      }
    }

    return {
      id: inst.id || `inst-${index + 1}`,
      title: inst.title || `Tranche ${index + 1}`,
      amount: instAmount,
      due_date: inst.due_date,
      installment_order: inst.installment_order || index + 1,
      allocated_amount: allocated,
      balance_due: instBalance,
      status: itemStatus,
      is_overdue: isOverdue,
      days_late: daysLate,
    };
  });

  // Détermination du statut global
  let globalStatus: PaymentStatus = "up_to_date";
  if (balanceDue === 0) {
    globalStatus = "up_to_date";
  } else if (maxDaysLate >= 15) {
    globalStatus = "critical";
  } else if (maxDaysLate > 0) {
    globalStatus = "late";
  } else if (nextDueDate) {
    const diffMs = new Date(nextDueDate).getTime() - new Date(referenceDate).getTime();
    const daysUntil = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (daysUntil <= 7) {
      globalStatus = "upcoming";
    } else {
      globalStatus = "up_to_date";
    }
  }

  return {
    student_id: student.id,
    student_name: `${student.first_name} ${student.last_name}`,
    class_id: student.class_id,
    class_name: student.class_name,
    matricule: student.matricule,
    gross_tuition: grossTuition,
    discount_amount: discount,
    net_tuition: netTuition,
    total_paid: totalPaid,
    balance_due: balanceDue,
    status: globalStatus,
    days_late: maxDaysLate,
    next_due_date: nextDueDate,
    installments_breakdown: installmentsBreakdown,
    has_critical_delay: maxDaysLate >= 15,
  };
}

/**
 * Validation stricte d'un encaissement avant enregistrement
 * RÈGLE ABSOLUE : Zéro surpaiement.
 */
export function validatePaymentAmount(
  amount: number,
  balanceDue: number
): { isValid: boolean; errorMessage?: string } {
  if (isNaN(amount) || amount <= 0) {
    return {
      isValid: false,
      errorMessage: "Le montant du paiement doit être strictement supérieur à 0 FCFA.",
    };
  }

  if (balanceDue <= 0) {
    return {
      isValid: false,
      errorMessage: "La scolarité de cet élève est déjà intégralement soldée (0 FCFA restant dû). Aucun nouveau paiement ne peut être encaissé.",
    };
  }

  if (amount > balanceDue) {
    return {
      isValid: false,
      errorMessage: `Montant trop élevé : Le solde restant dû est de ${balanceDue.toLocaleString("fr-FR")} FCFA. Vous ne pouvez pas enregistrer un montant supérieur au montant restant.`,
    };
  }

  return { isValid: true };
}
