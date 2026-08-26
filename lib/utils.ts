import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PaymentStatus } from "@/types/scoly";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format amounts in West African CFA Francs (FCFA)
 * E.g., 300000 -> "300 000 FCFA"
 */
export function formatFCFA(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0 FCFA";
  }
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${formatted} FCFA`;
}

/**
 * Format dates in clear French notation
 */
export function formatDate(dateString: string | Date | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date | undefined): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Visual badge and semantic info for payment statuses
 */
export function getStatusBadge(status: PaymentStatus) {
  switch (status) {
    case "credit":
      return {
        label: "Crédit / Avance",
        dot: "bg-blue-500",
        badge: "bg-blue-50 text-blue-800 border-blue-200 font-semibold",
        iconText: "🔵",
      };
    case "up_to_date":
      return {
        label: "À jour",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconText: "🟢",
      };
    case "upcoming":
      return {
        label: "Échéance proche",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-800 border-amber-200",
        iconText: "🟡",
      };
    case "late":
      return {
        label: "En retard",
        dot: "bg-orange-500",
        badge: "bg-orange-50 text-orange-800 border-orange-200",
        iconText: "🟠",
      };
    case "critical":
      return {
        label: "Retard critique",
        dot: "bg-rose-600",
        badge: "bg-rose-50 text-rose-800 border-rose-200 font-semibold",
        iconText: "🔴",
      };
    default:
      return {
        label: "À jour",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconText: "🟢",
      };
  }
}

/**
 * Clean phone number and generate WhatsApp link
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  // Remove spaces, dashes, dots, plus signs
  const cleaned = phone.replace(/[^0-9]/g, "");
  // If user entered e.g. "90 12 34 56" (8 digits Togo), prepend 228
  const international = cleaned.length === 8 ? `228${cleaned}` : cleaned;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates clear, professional reminder messages tailored for West Africa
 */
export function generateReminderTemplate(params: {
  parentName: string;
  studentName: string;
  className: string;
  schoolName: string;
  amountDue: number;
  daysLate: number;
  dueDate?: string;
}): string {
  const { parentName, studentName, className, schoolName, amountDue, daysLate, dueDate } = params;
  const formattedAmount = formatFCFA(amountDue);

  if (daysLate <= 0) {
    return `Bonjour ${parentName}, le ${schoolName} vous rappelle que la prochaine tranche de scolarité de ${studentName} (${className}) est attendue le ${dueDate || "très prochainement"}. Montant : ${formattedAmount}. Merci pour votre confiance.`;
  } else if (daysLate <= 7) {
    return `Bonjour ${parentName}, sauf erreur de notre part, le règlement de scolarité de ${studentName} (${className}) au ${schoolName} présente un retard de ${daysLate} jour(s). Montant restant dû : ${formattedAmount}. Nous vous prions de bien vouloir régulariser ce paiement dès que possible.`;
  } else {
    return `URGENT - ${schoolName} : Bonjour ${parentName}, le compte de scolarité de ${studentName} (${className}) enregistre un retard important de ${daysLate} jours pour un solde impayé de ${formattedAmount}. Merci de passer d'urgence à la caisse de l'établissement ou d'effectuer le versement via TMoney/Flooz. Cordialement, La Direction.`;
  }
}
