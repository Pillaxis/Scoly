"use client";

import React, { useState, useMemo } from "react";
import {
  CreditCard,
  PlusCircle,
  Search,
  Printer,
  Calendar,
  DollarSign,
  Smartphone,
  Landmark,
  Share2,
  FileSpreadsheet,
  Ban,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { useGlobalModals } from "../layout";
import { formatFCFA, formatDate, generateWhatsAppLink } from "@/lib/utils";
import { PaymentMethod, Payment } from "@/types/scoly";
import { CancelPaymentModal } from "@/components/payments/CancelPaymentModal";

export default function PaymentsPage() {
  const { payments, school, getStudentFinancialSummary, cancelPayment } = useScoly();
  const { openPaymentModal, openReceiptModal, openImportModal } = useGlobalModals();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState<"ALL" | "TODAY" | "MONTH">("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"ALL" | "VALID" | "CANCELLED">("ALL");
  const [paymentToCancel, setPaymentToCancel] = useState<Payment | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthPrefix = todayStr.substring(0, 7);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        p.student_name.toLowerCase().includes(q) ||
        p.matricule.toLowerCase().includes(q) ||
        p.receipt_number.toLowerCase().includes(q) ||
        (p.transaction_ref && p.transaction_ref.toLowerCase().includes(q));

      const matchMethod = selectedMethod === "ALL" || p.payment_method === selectedMethod;

      let matchPeriod = true;
      if (selectedPeriod === "TODAY") {
        matchPeriod = p.payment_date === todayStr;
      } else if (selectedPeriod === "MONTH") {
        matchPeriod = p.payment_date.startsWith(currentMonthPrefix);
      }

      let matchStatus = true;
      if (selectedStatusFilter === "VALID") {
        matchStatus = p.status !== "cancelled";
      } else if (selectedStatusFilter === "CANCELLED") {
        matchStatus = p.status === "cancelled";
      }

      return matchQuery && matchMethod && matchPeriod && matchStatus;
    });
  }, [payments, searchQuery, selectedMethod, selectedPeriod, selectedStatusFilter, todayStr, currentMonthPrefix]);

  const totalFilteredAmount = useMemo(() => {
    return filteredPayments
      .filter((p) => p.status !== "cancelled")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [filteredPayments]);

  const handleWhatsAppReceiptShare = (p: Payment) => {
    if (!p.parent_phone) return;
    const summary = getStudentFinancialSummary(p.student_id);
    const msg = `*REÇU DE PAIEMENT N° ${p.receipt_number}*\n\n` +
      `Établissement : ${school.name}\n` +
      `Élève : ${p.student_name} (${p.class_name})\n` +
      `Matricule : ${p.matricule}\n` +
      `Montant versé : *${formatFCFA(p.amount)}*\n` +
      `Date : ${formatDate(p.payment_date)}\n` +
      `Reste à payer : *${formatFCFA(summary.balance_due)}*\n\n` +
      `Merci pour votre confiance. La Direction.`;

    const url = generateWhatsAppLink(p.parent_phone, msg);
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Journal des Paiements & Reçus
            </h1>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {payments.length} reçus
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
            Historique comptable des encaissements et réimpression de reçus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openImportModal()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 active:scale-98 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>+ Importer des données</span>
          </button>

          <button
            type="button"
            onClick={() => openPaymentModal()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 hover:shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Encaisser un Paiement</span>
          </button>
        </div>
      </div>

      {/* Filter & Period Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="N° reçu, élève, matricule, réf..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full md:w-auto">
          {/* Period selector */}
          <div className="inline-flex p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedPeriod("ALL")}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPeriod === "ALL" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod("TODAY")}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPeriod === "TODAY" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Aujourd&apos;hui
            </button>
            <button
              type="button"
              onClick={() => setSelectedPeriod("MONTH")}
              className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedPeriod === "MONTH" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Ce mois
            </button>
          </div>

          {/* Method selector */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="px-3 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous modes</option>
            <option value="cash">Espèces</option>
            <option value="tmoney">TMoney</option>
            <option value="flooz">Flooz</option>
            <option value="bank_transfer">Virement</option>
          </select>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="p-3 sm:p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-700" />
          <span className="text-[11px] sm:text-xs font-bold text-emerald-900">
            Total ({filteredPayments.length} reçus) :
          </span>
        </div>
        <span className="font-mono font-black text-emerald-900 text-base sm:text-lg tabular-nums">
          {formatFCFA(totalFilteredAmount)}
        </span>
      </div>

      {/* MOBILE VIEW: Transaction Cards (< md) */}
      <div className="md:hidden space-y-3">
        {filteredPayments.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200 text-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Aucun encaissement</p>
              <p className="text-slate-400 text-xs mt-0.5">Les versements enregistrés apparaîtront ici.</p>
            </div>
            <button
              type="button"
              onClick={() => openPaymentModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Encaisser un Paiement</span>
            </button>
          </div>
        ) : (
          filteredPayments.map((p) => {
            const isCancelled = p.status === "cancelled";
            const hasAdvance = p.is_advance || (p.credit_amount && p.credit_amount > 0);

            return (
              <div
                key={p.id}
                className={`bg-white p-4 rounded-2xl border shadow-2xs space-y-2.5 ${
                  isCancelled ? "border-rose-200 bg-rose-50/30 opacity-75" : "border-slate-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {p.receipt_number}
                    </span>
                    {hasAdvance && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        Avance
                      </span>
                    )}
                    {isCancelled && (
                      <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                        Annulé
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {formatDate(p.payment_date)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-bold text-sm ${isCancelled ? "text-slate-500 line-through" : "text-slate-900"}`}>
                      {p.student_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {p.class_name} • <span className="font-mono text-slate-400 text-[11px]">{p.matricule}</span>
                    </p>
                    {isCancelled && p.cancellation_reason && (
                      <p className="text-[10px] text-rose-700 italic mt-0.5">
                        Motif : {p.cancellation_reason}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-black text-base tabular-nums block ${
                        isCancelled ? "text-slate-400 line-through" : "text-emerald-700"
                      }`}
                    >
                      +{formatFCFA(p.amount)}
                    </span>
                    <span className="uppercase font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[9px]">
                      {p.payment_method}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  {p.parent_phone && !isCancelled ? (
                    <button
                      type="button"
                      onClick={() => handleWhatsAppReceiptShare(p)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold active:scale-98 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-1.5">
                    {!isCancelled && (
                      <button
                        type="button"
                        onClick={() => setPaymentToCancel(p)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Annuler ce paiement"
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openReceiptModal(p)}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-98 transition-all shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Reçu</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Full Table (>= md) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">N° Reçu</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Élève & Classe</th>
                <th className="py-3.5 px-4">Mode & Réf</th>
                <th className="py-3.5 px-4 text-right">Montant</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">Aucun encaissement</p>
                      <p className="text-slate-400 text-xs">Enregistrez un versement pour générer le premier reçu de caisse.</p>
                      <button
                        type="button"
                        onClick={() => openPaymentModal()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Encaisser un Paiement</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const isCancelled = p.status === "cancelled";
                  const hasAdvance = p.is_advance || (p.credit_amount && p.credit_amount > 0);

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/70 transition-colors group ${
                        isCancelled ? "bg-rose-50/30 opacity-70" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-extrabold text-blue-700">
                        <div className="flex items-center gap-1.5">
                          <span className={isCancelled ? "line-through text-slate-400" : ""}>
                            {p.receipt_number}
                          </span>
                          {hasAdvance && (
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                              Avance
                            </span>
                          )}
                          {isCancelled && (
                            <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200">
                              Annulé
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="py-3 px-4">
                        <p className={`font-bold ${isCancelled ? "text-slate-400 line-through" : "text-slate-900"}`}>
                          {p.student_name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {p.class_name} • <span className="font-mono text-slate-400">{p.matricule}</span>
                        </p>
                        {isCancelled && p.cancellation_reason && (
                          <p className="text-[10px] text-rose-700 italic mt-0.5">
                            Motif : {p.cancellation_reason}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="uppercase font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                          {p.payment_method}
                        </span>
                        {p.transaction_ref && (
                          <span className="block text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[120px]">
                            {p.transaction_ref}
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 px-4 text-right font-mono font-black text-sm tabular-nums ${
                          isCancelled ? "text-slate-400 line-through" : "text-emerald-700"
                        }`}
                      >
                        +{formatFCFA(p.amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {p.parent_phone && !isCancelled && (
                            <button
                              type="button"
                              onClick={() => handleWhatsAppReceiptShare(p)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Partager le reçu par WhatsApp"
                            >
                              <Share2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {!isCancelled && (
                            <button
                              type="button"
                              onClick={() => setPaymentToCancel(p)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Annuler ce paiement avec motif"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openReceiptModal(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Reçu</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Payment Modal */}
      <CancelPaymentModal
        isOpen={!!paymentToCancel}
        payment={paymentToCancel}
        onClose={() => setPaymentToCancel(null)}
        onConfirmCancel={(id, reason) => cancelPayment(id, reason)}
      />
    </div>
  );
}
