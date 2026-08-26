"use client";

import React, { useState } from "react";
import { AlertTriangle, X, Ban, FileText } from "lucide-react";
import { Payment } from "@/types/scoly";
import { formatFCFA, formatDate } from "@/lib/utils";

interface CancelPaymentModalProps {
  isOpen: boolean;
  payment: Payment | null;
  onClose: () => void;
  onConfirmCancel: (paymentId: string, reason: string) => void;
}

export function CancelPaymentModal({
  isOpen,
  payment,
  onClose,
  onConfirmCancel,
}: CancelPaymentModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !payment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReason = reason.trim();
    if (!cleanReason || cleanReason.length < 5) {
      setError("Veuillez indiquer un motif d'annulation précis (au moins 5 caractères).");
      return;
    }

    setIsSubmitting(true);
    try {
      onConfirmCancel(payment.id, cleanReason);
      setReason("");
      setError("");
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'annulation du paiement.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-rose-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Annuler un Encaissement</h2>
              <p className="text-xs text-rose-700 font-medium">Reçu N° {payment.receipt_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Summary */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-slate-700">
            <div className="flex justify-between">
              <span>Élève :</span>
              <strong className="text-slate-900">{payment.student_name}</strong>
            </div>
            <div className="flex justify-between">
              <span>Montant à annuler :</span>
              <span className="font-mono font-black text-rose-700 text-sm">{formatFCFA(payment.amount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Date du versement :</span>
              <span>{formatDate(payment.payment_date)}</span>
            </div>
            <div className="flex justify-between">
              <span>Mode :</span>
              <span className="uppercase font-bold">{payment.payment_method}</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
            <strong>⚠️ Impact comptable immédiat :</strong> Le reçu restera consigné dans le journal d&apos;audit avec la mention <em>« Annulé »</em>. Le solde de l&apos;élève sera automatiquement réajusté.
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Motif obligatoire de l&apos;annulation *
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Erreur de saisie du montant par la caisse, versement doublon, chèque rejeté..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Conserver le paiement
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
            >
              <Ban className="w-4 h-4" />
              <span>Confirmer l&apos;annulation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
