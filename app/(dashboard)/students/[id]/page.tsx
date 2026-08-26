"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  CreditCard,
  MessageSquare,
  Printer,
  Calendar,
  Phone,
  Pencil,
  Trash2,
  X,
  MapPin,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Share2,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { useGlobalModals } from "../../layout";
import { formatFCFA, formatDate, getStatusBadge, generateWhatsAppLink } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { SmsIcon } from "@/components/icons/SmsIcon";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { students, payments, tuitionPlans, getStudentFinancialSummary, deleteStudent } = useScoly();
  const { openPaymentModal, openReceiptModal, openReminderModal, openStudentModal } = useGlobalModals();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const student = students.find((s) => s.id === id);
  if (!student) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <h2 className="text-base font-bold text-slate-800">Élève introuvable</h2>
        <p className="text-xs text-slate-500 mt-1">L&apos;identifiant demandé n&apos;existe pas ou a été supprimé.</p>
        <Link
          href="/students"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des élèves</span>
        </Link>
      </div>
    );
  }

  const summary = getStudentFinancialSummary(student.id);
  const badge = getStatusBadge(summary.status);
  const studentPayments = payments.filter((p) => p.student_id === student.id);
  const tuitionPlan = tuitionPlans.find((tp) => tp.class_id === student.class_id);

  // Installment schedule breakdown
  const installments = tuitionPlan?.installments || [];

  const handleConfirmDelete = () => {
    setIsDeleting(true);
    try {
      deleteStudent(student.id);
      setIsDeleteModalOpen(false);
      router.push("/students");
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/students"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-200/60 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux élèves</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Edit Student Button */}
          <button
            type="button"
            onClick={() => openStudentModal(student)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Modifier la Fiche</span>
          </button>

          {summary.balance_due > 0 && (
            <>
              <button
                type="button"
                onClick={() => openReminderModal(student, "whatsapp")}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Relancer via WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => openReminderModal(student, "sms")}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                title="Relancer par Message Simple (SMS)"
              >
                <SmsIcon className="w-4 h-4" />
                <span>SMS</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => openPaymentModal(student.id)}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm shadow-slate-900/20 hover:shadow-md transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Encaisser</span>
          </button>

          {/* Discreet Delete Button */}
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
            title="Supprimer la fiche élève"
            aria-label="Supprimer la fiche élève"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Student Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-800 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {student.first_name[0]}
            {student.last_name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-extrabold text-slate-900">
                {student.first_name} {student.last_name}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.badge}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
              <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold">
                {student.matricule}
              </span>
              <span>Classe : <strong className="text-slate-800">{student.class_name}</strong></span>
              <span>•</span>
              <span>Genre : {student.gender === "M" ? "Masculin" : "Féminin"}</span>
              {student.birth_date && (
                <>
                  <span>•</span>
                  <span>Né(e) le : {formatDate(student.birth_date)}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick balance / credit highlight */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right w-full md:w-auto">
          {summary.credit_amount > 0 ? (
            <div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                Crédit / Avance
              </span>
              <span className="text-2xl font-black font-mono tabular-nums text-blue-700">
                +{formatFCFA(summary.credit_amount)}
              </span>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">
                Solde dû : 0 FCFA (Soldé)
              </p>
            </div>
          ) : (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Reste Dû (Solde)
              </span>
              <span
                className={`text-2xl font-black font-mono tabular-nums ${
                  summary.balance_due > 0 ? "text-rose-600" : "text-emerald-600"
                }`}
              >
                {formatFCFA(summary.balance_due)}
              </span>
              {summary.days_late > 0 && (
                <p className="text-xs text-rose-600 font-semibold mt-0.5">
                  Retard : {summary.days_late} jours
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2-Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (1/3): Parent & Contact */}
        <div className="space-y-6">
          {/* Parent Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
              Parent / Tuteur Légal
            </h3>

            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Nom complet</span>
                <p className="font-bold text-slate-900 text-sm">{student.parent.full_name}</p>
                <span className="text-[11px] text-blue-600 font-semibold">{student.parent.relationship}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-400 block text-[11px]">Téléphone direct</span>
                  <p className="font-mono font-bold text-slate-800">{student.parent.phone_primary}</p>
                </div>
                <a
                  href={`tel:${student.parent.phone_primary}`}
                  className="p-2 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white rounded-xl transition-colors"
                  title="Appeler"
                >
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>

              {student.parent.phone_whatsapp && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-slate-400 block text-[11px]">WhatsApp</span>
                    <p className="font-mono font-bold text-emerald-700">{student.parent.phone_whatsapp}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openReminderModal(student)}
                    className="p-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white rounded-xl transition-colors cursor-pointer"
                    title="Envoyer un message WhatsApp"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {student.parent.profession && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Profession</span>
                  <p className="font-medium text-slate-800">{student.parent.profession}</p>
                </div>
              )}

              {student.parent.address && (
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-slate-400 block text-[11px]">Adresse / Domicile</span>
                  <p className="font-medium text-slate-800">{student.parent.address}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (2/3): Financial Situation & Installments & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Breakdown Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
              Situation Financière & Scolarité
            </h3>

            <div className={`grid grid-cols-1 gap-3 ${summary.credit_amount > 0 ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
                  Total Dû
                </span>
                <span className="font-mono font-bold text-slate-900 text-base mt-0.5 block">
                  {formatFCFA(summary.total_due)}
                </span>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
                  Total Déjà Encaissé
                </span>
                <span className="font-mono font-bold text-emerald-900 text-base mt-0.5 block">
                  {formatFCFA(summary.total_paid)}
                </span>
              </div>

              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200">
                <span className="text-[11px] text-rose-800 font-bold uppercase tracking-wider block">
                  Reste à Payer (Solde)
                </span>
                <span
                  className={`font-mono font-black text-base mt-0.5 block ${
                    summary.balance_due > 0 ? "text-rose-900" : "text-emerald-700"
                  }`}
                >
                  {formatFCFA(summary.balance_due)}
                </span>
              </div>

              {summary.credit_amount > 0 && (
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                  <span className="text-[11px] text-blue-800 font-bold uppercase tracking-wider block">
                    Crédit / Avance
                  </span>
                  <span className="font-mono font-black text-blue-900 text-base mt-0.5 block">
                    +{formatFCFA(summary.credit_amount)}
                  </span>
                </div>
              )}
            </div>

            {/* Installments Timeline */}
            <div className="mt-6 pt-5 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 mb-3">
                Échéancier des Tranches (Année 2025-2026)
              </h4>

              <div className="space-y-2">
                {installments.map((inst, index) => {
                  return (
                    <div
                      key={inst.id}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{inst.title}</p>
                          <p className="text-[11px] text-slate-400">Échéance : {formatDate(inst.due_date)}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 text-xs">
                          {formatFCFA(inst.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historique des Versements</h3>
                <p className="text-xs text-slate-400">Reçus délivrés pour cet élève</p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {studentPayments.length} paiement(s)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">N° Reçu</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Mode</th>
                    <th className="py-3 px-4 text-right">Montant</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        Aucun paiement enregistré pour cet élève.
                      </td>
                    </tr>
                  ) : (
                    studentPayments.map((p) => {
                      const isCancelled = p.status === "cancelled";
                      const hasAdvance = p.is_advance || (p.credit_amount && p.credit_amount > 0);

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isCancelled ? "bg-rose-50/30 opacity-70" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-blue-700">
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
                          <td className="py-3 px-4 text-slate-700">{formatDate(p.payment_date)}</td>
                          <td className="py-3 px-4">
                            <span className="uppercase font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {p.payment_method}
                            </span>
                          </td>
                          <td
                            className={`py-3 px-4 text-right font-mono font-bold ${
                              isCancelled ? "text-slate-400 line-through" : "text-emerald-700"
                            }`}
                          >
                            +{formatFCFA(p.amount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => openReceiptModal(p)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-900 text-slate-700 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              <span>Reçu</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Discreet Bottom Administrative Actions */}
      <div className="pt-6 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <span>Matricule : <strong className="font-mono text-slate-600">{student.matricule}</strong></span>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer text-xs"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Supprimer définitivement cette fiche élève</span>
        </button>
      </div>

      {/* Modal de Confirmation de Suppression */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Supprimer la Fiche Élève</h3>
                <p className="text-xs text-slate-500">Action irréversible</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Êtes-vous sûr de vouloir supprimer définitivement l&apos;élève <strong>{student.first_name} {student.last_name}</strong> ({student.class_name} • {student.matricule}) ?
              <br />
              <span className="text-rose-600 font-semibold mt-1 block">
                Attention : Cette action effacera également l&apos;historique de ses paiements et reçus associés.
              </span>
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-extrabold rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? "Suppression..." : "Confirmer la Suppression"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
