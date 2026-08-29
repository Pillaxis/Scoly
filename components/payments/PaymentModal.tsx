"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Smartphone,
  Landmark,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Edit3,
  Calendar,
  Layers,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { PaymentMethod, Payment } from "@/types/scoly";
import { formatFCFA, formatDate } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedStudentId?: string;
  onSuccess?: (payment: Payment) => void;
}

export function PaymentModal({
  isOpen,
  onClose,
  preselectedStudentId,
  onSuccess,
}: PaymentModalProps) {
  const { students, payments, tuitionPlans, getStudentFinancialSummary, addPayment, paymentMethods } = useScoly();

  const [studentId, setStudentId] = useState(preselectedStudentId || "");
  const [amount, setAmount] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Confirmation flags for non-financial warnings
  const [duplicateConfirmed, setDuplicateConfirmed] = useState(false);
  const [hugeAmountConfirmed, setHugeAmountConfirmed] = useState(false);
  const [duplicateRefError, setDuplicateRefError] = useState<{
    foundPayment: Payment;
  } | null>(null);

  const isSubmittingLock = useRef(false);

  useEffect(() => {
    if (preselectedStudentId) {
      setStudentId(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  // When student changes, suggest next due installment or remaining balance
  useEffect(() => {
    if (studentId) {
      const summary = getStudentFinancialSummary(studentId);
      if (summary.balance_due > 0) {
        const suggested = summary.next_due_amount && summary.next_due_amount <= summary.balance_due
          ? summary.next_due_amount
          : summary.balance_due;
        setAmount(suggested);
      } else {
        setAmount("");
      }
      setDuplicateConfirmed(false);
      setHugeAmountConfirmed(false);
      setDuplicateRefError(null);
      setError("");
    }
  }, [studentId, getStudentFinancialSummary]);

  const handleAmountChange = (newVal: number | "") => {
    setAmount(newVal);
    setHugeAmountConfirmed(false);
    setError("");
  };

  if (!isOpen) return null;

  const selectedStudent = students.find((s) => s.id === studentId);
  const summary = studentId ? getStudentFinancialSummary(studentId) : null;
  const numericAmount = typeof amount === "number" ? Math.round(amount) : 0;
  const balanceDue = summary ? summary.balance_due : 0;
  const isUpToDate = summary ? balanceDue === 0 : false;
  const isOverpayment = numericAmount > balanceDue && balanceDue > 0;

  // Find plan & installments for visual breakdown
  const studentPlan = selectedStudent
    ? tuitionPlans.find((tp) => tp.class_id === selectedStudent.class_id)
    : null;

  // Calculate installment breakdown
  const installmentsProgress = studentPlan && studentPlan.installments?.length
    ? (() => {
        let accumulatedPaid = summary ? summary.total_paid : 0;
        return studentPlan.installments.map((inst) => {
          const instAmount = inst.amount;
          const paidForThis = Math.min(accumulatedPaid, instAmount);
          accumulatedPaid = Math.max(0, accumulatedPaid - instAmount);
          const remainingForThis = instAmount - paidForThis;
          const status = paidForThis >= instAmount
            ? "paid"
            : paidForThis > 0
            ? "partial"
            : "unpaid";
          return {
            ...inst,
            paid: paidForThis,
            remaining: remainingForThis,
            status,
          };
        });
      })()
    : [];

  // Duplicate Check 1: Mobile Money / Bank Reference already used in school
  const checkDuplicateReference = (): Payment | null => {
    const cleanRef = transactionRef.trim();
    if (!cleanRef || paymentMethod === "cash") return null;
    return (
      payments.find(
        (p) =>
          p.status !== "cancelled" &&
          p.transaction_ref &&
          p.transaction_ref.trim().toLowerCase() === cleanRef.toLowerCase()
      ) || null
    );
  };

  // Duplicate Check 2: Same student, same amount, same day
  const checkDuplicateSameDayPayment = (): Payment | null => {
    if (!studentId || numericAmount <= 0) return null;
    const todayStr = new Date().toISOString().split("T")[0];
    return (
      payments.find(
        (p) =>
          p.status !== "cancelled" &&
          p.student_id === studentId &&
          p.amount === numericAmount &&
          p.payment_date === todayStr
      ) || null
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setDuplicateRefError(null);

    if (isSubmittingLock.current) return;

    if (!studentId) {
      setError("Veuillez sélectionner un élève.");
      return;
    }

    if (isUpToDate) {
      setError("La scolarité de cet élève est déjà intégralement payée. Aucun paiement ne peut être enregistré.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      setError("Montant invalide : le versement doit être strictement supérieur à 0 FCFA.");
      return;
    }

    // STRICT OVERPAYMENT BLOCKING RULE
    if (numericAmount > balanceDue) {
      setError(
        `Montant trop élevé : Le solde restant dû est de ${formatFCFA(balanceDue)}. Vous ne pouvez pas enregistrer plus que le montant restant.`
      );
      return;
    }

    // 1. Contrôle doublon de référence
    const dupRef = checkDuplicateReference();
    if (dupRef) {
      setDuplicateRefError({ foundPayment: dupRef });
      return;
    }

    // 2. Contrôle même paiement aujourd'hui
    const dupSameDay = checkDuplicateSameDayPayment();
    if (dupSameDay && !duplicateConfirmed) {
      setError(
        `⚠️ Un versement identique de ${formatFCFA(numericAmount)} a déjà été enregistré pour ${selectedStudent?.first_name} aujourd'hui (Reçu N° ${dupSameDay.receipt_number}). Veuillez confirmer.`
      );
      setDuplicateConfirmed(true);
      return;
    }

    // Tout est validé -> Enregistrement atomique
    isSubmittingLock.current = true;
    setIsSubmitting(true);

    try {
      const idempotencyKey = `${studentId}-${numericAmount}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newPayment = addPayment({
        student_id: studentId,
        amount: numericAmount,
        payment_method: paymentMethod,
        transaction_ref: transactionRef.trim() || undefined,
        notes: notes.trim() || undefined,
        recorded_by_name: "Direction / Caisse",
        idempotency_key: idempotencyKey,
      });

      // Reset state
      setAmount("");
      setTransactionRef("");
      setNotes("");
      setDuplicateConfirmed(false);
      setHugeAmountConfirmed(false);
      setDuplicateRefError(null);
      setIsSubmitting(false);
      isSubmittingLock.current = false;

      if (onSuccess) {
        onSuccess(newPayment);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement.");
      setIsSubmitting(false);
      isSubmittingLock.current = false;
    }
  };

  const isButtonDisabled =
    isSubmitting ||
    !studentId ||
    isUpToDate ||
    numericAmount <= 0 ||
    isOverpayment;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh] sm:max-h-[90vh]">
        {/* 1. Modal Header Fixe */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">Enregistrer un Paiement</h2>
              <p className="text-xs text-slate-500">Encaissement scolarité et reçu instantané</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Modal Form Body Déroulant */}
        <form
          id="payment-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
        >
          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{error}</span>
                {duplicateConfirmed && (
                  <p className="mt-1 font-bold text-rose-900">
                    Cliquez à nouveau sur « Valider » si vous souhaitez enregistrer ce 2ème versement identique.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Duplicate Transaction Reference Modal Alert */}
          {duplicateRefError && (
            <div className="p-4 rounded-xl bg-rose-100 border-2 border-rose-400 text-rose-950 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-black text-rose-900">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>🚨 POSSIBLE DOUBLE PAIEMENT DÉTECTÉ</span>
              </div>
              <p className="text-xs leading-relaxed">
                Un paiement avec la référence de transaction <strong className="font-mono bg-rose-200 px-1 py-0.5 rounded">{transactionRef}</strong> existe déjà pour l&apos;élève <strong>{duplicateRefError.foundPayment.student_name}</strong> (Reçu <strong>{duplicateRefError.foundPayment.receipt_number}</strong> du {formatDate(duplicateRefError.foundPayment.payment_date)}).
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDuplicateRefError(null)}
                  className="px-3 py-1.5 bg-rose-800 text-white rounded-lg font-bold hover:bg-rose-900 transition-all cursor-pointer"
                >
                  Modifier la référence
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 rounded-lg font-bold hover:bg-rose-50 transition-all cursor-pointer"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* 1. Student Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              1. Sélectionner l&apos;élève *
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              required
            >
              <option value="">-- Choisir un élève --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name} ({s.class_name} • {s.matricule})
                </option>
              ))}
            </select>
          </div>

          {/* Balance Preview Card */}
          {selectedStudent && summary && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Parent : <strong className="text-slate-800">{selectedStudent.parent.full_name}</strong></span>
                <span className="font-mono text-slate-500">{selectedStudent.parent.phone_primary}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/80 text-center">
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Total Dû</span>
                  <strong className="text-slate-800 font-mono text-xs">{formatFCFA(summary.total_due)}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Déjà Réglé</span>
                  <strong className="text-emerald-700 font-mono text-xs">{formatFCFA(summary.total_paid)}</strong>
                </div>
                <div className="p-2 bg-white rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-medium">Solde Restant</span>
                  <strong
                    className={`font-mono text-xs ${
                      summary.balance_due > 0 ? "text-rose-700 font-black" : "text-emerald-700 font-black"
                    }`}
                  >
                    {formatFCFA(summary.balance_due)}
                  </strong>
                </div>
              </div>

              {/* Installments Breakdown Waterfall */}
              {installmentsProgress.length > 0 && (
                <div className="pt-2 border-t border-slate-200/70">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    État des tranches de scolarité :
                  </span>
                  <div className="space-y-1">
                    {installmentsProgress.map((inst, idx) => (
                      <div
                        key={inst.id || idx}
                        className="flex items-center justify-between p-1.5 px-2 rounded-lg bg-white border border-slate-100 text-[11px]"
                      >
                        <span className="font-medium text-slate-700">
                          {inst.title} ({formatFCFA(inst.amount)})
                        </span>
                        <div className="flex items-center gap-2">
                          {inst.status === "paid" && (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px]">
                              ✓ Payée
                            </span>
                          )}
                          {inst.status === "partial" && (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-bold text-[10px]">
                              Reste {formatFCFA(inst.remaining)}
                            </span>
                          )}
                          {inst.status === "unpaid" && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md font-semibold text-[10px]">
                              À payer
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                2. Montant du versement (FCFA) *
              </label>
              {summary && summary.balance_due > 0 && (
                <button
                  type="button"
                  onClick={() => handleAmountChange(summary.balance_due)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Régler le solde exact ({formatFCFA(summary.balance_due)})
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="500"
                step="500"
                placeholder="Ex: 50000"
                value={amount}
                disabled={isUpToDate}
                onChange={(e) =>
                  handleAmountChange(e.target.value === "" ? "" : Number(e.target.value))
                }
                className={`w-full pl-3.5 pr-16 py-2.5 bg-slate-50 border rounded-xl text-base font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 transition-all tabular-nums ${
                  isOverpayment
                    ? "border-rose-500 focus:ring-rose-500 bg-rose-50/40 text-rose-900"
                    : "border-slate-200 focus:ring-emerald-500"
                } ${isUpToDate ? "opacity-60 cursor-not-allowed bg-slate-100" : ""}`}
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                FCFA
              </span>
            </div>

            {/* STRICT OVERPAYMENT BLOCKING BANNER */}
            {selectedStudent && summary && (
              <>
                {/* 1. If student already fully paid */}
                {isUpToDate && (
                  <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1.5 text-xs text-emerald-950 animate-in fade-in">
                    <div className="flex items-center gap-2 font-black text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Scolarité entièrement soldée (0 FCFA restant dû)</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      La totalité de la scolarité annuelle a déjà été réglée pour cet élève. Aucun nouveau versement ne peut être enregistré.
                    </p>
                  </div>
                )}

                {/* 2. If entered amount strictly exceeds remaining balance (STRICT REFUSAL) */}
                {!isUpToDate && isOverpayment && (
                  <div className="mt-3 p-4 rounded-xl bg-rose-50 border-2 border-rose-400 space-y-2.5 text-xs text-rose-950 animate-in fade-in">
                    <div className="flex items-center gap-2 font-black text-rose-900">
                      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                      <span className="text-sm">Montant trop élevé</span>
                    </div>
                    <p className="text-xs leading-relaxed text-rose-900">
                      Le solde restant dû est de <strong>{formatFCFA(balanceDue)}</strong>.
                      <br />
                      Vous ne pouvez pas enregistrer plus que le montant restant.
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => handleAmountChange(balanceDue)}
                        className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-lg font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1.5 text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Ajuster au solde exact ({formatFCFA(balanceDue)})</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. Valid payment <= balanceDue */}
                {!isUpToDate && numericAmount > 0 && !isOverpayment && (
                  <div className="mt-2 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                        Nouveau Reste à Payer après ce versement :
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Solde dû : <strong className="font-mono text-slate-700">{formatFCFA(balanceDue)}</strong> - Versement : <strong className="font-mono text-emerald-700">{formatFCFA(numericAmount)}</strong>
                      </span>
                    </div>
                    <div className="text-right pl-2">
                      <span
                        className={`font-mono font-black text-sm tabular-nums block ${
                          balanceDue - numericAmount === 0 ? "text-emerald-700 font-extrabold" : "text-slate-800"
                        }`}
                      >
                        {balanceDue - numericAmount === 0
                          ? "0 FCFA (Soldé)"
                          : formatFCFA(balanceDue - numericAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 3. Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              3. Mode de règlement *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {paymentMethods.filter(m => m.is_active).map((method) => (
                <button
                  key={method.key}
                  type="button"
                  onClick={() => setPaymentMethod(method.key)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    paymentMethod === method.key
                      ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {method.key === 'cash' ? <DollarSign className="w-3.5 h-3.5" /> :
                   method.key === 'tmoney' || method.key === 'flooz' ? <Smartphone className="w-3.5 h-3.5" /> :
                   method.key === 'bank_transfer' ? <Landmark className="w-3.5 h-3.5" /> :
                   <CreditCard className="w-3.5 h-3.5" />}
                  <span>{method.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reference if mobile money / bank */}
          {paymentMethod !== "cash" && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Référence transaction / Numéro mobile money *
              </label>
              <input
                type="text"
                placeholder="Ex: TM-998822..."
                value={transactionRef}
                onChange={(e) => {
                  setTransactionRef(e.target.value);
                  setDuplicateRefError(null);
                }}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note ou observation (facultatif)
            </label>
            <input
              type="text"
              placeholder="Ex: Règlement 1ère tranche par chèque..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </form>

        {/* 3. Modal Sticky Footer Fixe en bas */}
        <div className="p-4 bg-slate-50/95 backdrop-blur-xs border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 shadow-lg z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="payment-form"
            disabled={isButtonDisabled}
            className="flex-1 sm:flex-initial px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-extrabold rounded-xl shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Valider & Générer le Reçu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
