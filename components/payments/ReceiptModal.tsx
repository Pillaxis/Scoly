"use client";

import React, { useRef } from "react";
import { X, Printer, Share2, CheckCircle2, Building2 } from "lucide-react";
import { Payment } from "@/types/scoly";
import { useScoly } from "@/lib/store";
import { formatFCFA, formatDate, generateWhatsAppLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface ReceiptModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptModal({ payment, isOpen, onClose }: ReceiptModalProps) {
  const { school, getStudentFinancialSummary } = useScoly();
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  const summary = getStudentFinancialSummary(payment.student_id);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!payment.parent_phone) return;
    const msg = `*REÇU OFFICIEL DE PAIEMENT N° ${payment.receipt_number}*\n\n` +
      `Établissement : ${school.name}\n` +
      `Élève : ${payment.student_name} (${payment.class_name})\n` +
      `Matricule : ${payment.matricule}\n` +
      `Date : ${formatDate(payment.payment_date)}\n` +
      `Montant versé : *${formatFCFA(payment.amount)}*\n` +
      `Mode de règlement : ${payment.payment_method.toUpperCase()}\n` +
      (payment.transaction_ref ? `Réf. Transaction : ${payment.transaction_ref}\n` : "") +
      `-----------------------------\n` +
      `Scolarité totale : ${formatFCFA(summary.net_tuition)}\n` +
      `Total déjà réglé : ${formatFCFA(summary.total_paid)}\n` +
      `*Reste à Payer : ${formatFCFA(summary.balance_due)}*\n\n` +
      `Merci pour votre confiance.\nLa Direction — ${school.name}`;

    const url = generateWhatsAppLink(payment.parent_phone, msg);
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh] sm:max-h-[92vh]">
        {/* Header Actions (No print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Reçu Officiel de Caisse</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Receipt Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white receipt-container text-slate-900 font-sans">
          <div ref={receiptRef} className="space-y-4">
            {/* School Official Header (No SaaS logo, pure School Header) */}
            <div className="text-center border-b border-dashed border-slate-300 pb-4">
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">
                RÉPUBLIQUE DU TOGO • MINISTÈRE DE L&apos;ENSEIGNEMENT
              </div>
              <h2 className="font-black text-lg sm:text-xl uppercase tracking-tight text-slate-900">
                {school.name}
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {school.address} • {school.city}, {school.country}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Tél : <strong className="font-mono text-slate-800">{school.phone}</strong> {school.email && `• ${school.email}`}
              </p>
            </div>

            {/* Receipt Identification Pill */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                  N° DE REÇU DE CAISSE
                </span>
                <span className="font-mono font-black text-base text-blue-700">
                  {payment.receipt_number}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                  Date d&apos;Émission
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {formatDate(payment.payment_date)}
                </span>
              </div>
            </div>

            {/* Student & Parent Details */}
            <div className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-200/70 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Nom de l&apos;Élève :</span>
                <strong className="font-bold text-slate-900 text-sm">{payment.student_name}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Classe & Matricule :</span>
                <span className="font-bold text-slate-800">
                  {payment.class_name} • <span className="font-mono text-slate-600 font-semibold">{payment.matricule}</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Parent / Tuteur :</span>
                <span className="font-semibold text-slate-800">{payment.parent_name || "—"}</span>
              </div>
              {payment.parent_phone && (
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500 font-medium">Téléphone Tuteur :</span>
                  <span className="font-mono text-slate-700 font-semibold">{payment.parent_phone}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Mode de Règlement :</span>
                <span className="font-bold uppercase text-slate-900 bg-slate-200/80 px-2 py-0.5 rounded text-[11px]">
                  {payment.payment_method}
                </span>
              </div>
              {payment.transaction_ref && (
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Réf. Transaction Mobile :</span>
                  <span className="font-mono text-slate-700 font-bold">{payment.transaction_ref}</span>
                </div>
              )}
              {payment.notes && (
                <div className="flex justify-between py-1 pt-1.5 border-t border-slate-200/60 text-slate-600 italic">
                  <span>Note / Motif :</span>
                  <span>{payment.notes}</span>
                </div>
              )}
            </div>

            {/* Main Payment Amount Box */}
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-center shadow-xs">
              <span className="text-[11px] uppercase font-black text-emerald-800 tracking-wider block">
                MONTANT TOTAL ENCAISSÉ SUR CE REÇU
              </span>
              <span className="text-3xl font-black font-mono text-emerald-950 tabular-nums block mt-0.5">
                {formatFCFA(payment.amount)}
              </span>
              {payment.is_advance && payment.credit_amount && payment.credit_amount > 0 ? (
                <div className="mt-2 pt-2 border-t border-emerald-200/80 flex items-center justify-around text-[11px] text-emerald-900 font-medium">
                  <span>Affecté scolarité : <strong>{formatFCFA(payment.allocated_amount || (payment.amount - payment.credit_amount))}</strong></span>
                  <span>•</span>
                  <span className="text-blue-700 font-bold">Avance / Crédit : +{formatFCFA(payment.credit_amount)}</span>
                </div>
              ) : null}
            </div>

            {/* Financial Situation & Automatic Remaining Balance (Reste à Payer) */}
            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-xs border border-slate-200">
              <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Situation Financière de l&apos;Élève
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Total scolarité due :</span>
                <span className="font-mono font-bold text-slate-900">{formatFCFA(summary.total_due)}</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Cumul total encaissé :</span>
                <span className="font-mono font-bold text-emerald-700">{formatFCFA(summary.total_paid)}</span>
              </div>

              {summary.credit_amount > 0 && (
                <div className="flex justify-between text-blue-700 font-bold bg-blue-50/80 px-2 py-1 rounded-lg border border-blue-200">
                  <span>Crédit / Avance disponible :</span>
                  <span className="font-mono">+{formatFCFA(summary.credit_amount)}</span>
                </div>
              )}

              {/* Automatic Reste à Payer */}
              <div className="flex justify-between items-center font-black text-sm pt-2 border-t border-slate-300">
                <span className="uppercase text-slate-900">Reste à Payer (Solde Dû) :</span>
                <span
                  className={`font-mono text-base tabular-nums ${
                    summary.balance_due > 0 ? "text-rose-700" : "text-emerald-700 font-black"
                  }`}
                >
                  {summary.balance_due === 0 ? "0 FCFA (SOLDÉ)" : formatFCFA(summary.balance_due)}
                </span>
              </div>
            </div>

            {/* Footer Signature & Stamp */}
            <div className="pt-4 flex items-end justify-between text-xs text-slate-600 border-t border-slate-200">
              <div>
                <p className="font-medium text-[11px]">Enregistré par :</p>
                <p className="font-bold text-slate-900 text-xs">{payment.recorded_by_name || "La Direction / Caisse"}</p>
                <p className="text-[10px] text-slate-400 mt-1">Établi à Lomé, le {formatDate(payment.payment_date)}</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-[11px] uppercase text-slate-700">Cachet & Signature</p>
                <div className="h-14 w-32 border-2 border-dashed border-slate-300 rounded-xl mt-1.5 flex items-center justify-center text-[10px] text-slate-400 italic">
                  Cachet officiel
                </div>
              </div>
            </div>

            {/* Legal neutral footnote (No App Name) */}
            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100">
              Document officiel de caisse délivré par l&apos;établissement scolaire — Fait foi pour tout règlement.
            </div>
          </div>
        </div>

        {/* Action Buttons (No Print) */}
        <div className="p-4 bg-slate-50/95 border-t border-slate-200 flex items-center justify-between gap-3 no-print shrink-0 shadow-lg">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-[#25D366] hover:bg-[#1EBE5D] active:scale-98 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <WhatsAppIcon className="w-4 h-4 text-white" />
            <span>Partager WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-extrabold shadow-sm transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimer le Reçu</span>
          </button>
        </div>
      </div>
    </div>
  );
}
