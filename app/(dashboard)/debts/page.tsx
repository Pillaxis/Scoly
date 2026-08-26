"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  MessageSquare,
  Search,
  Filter,
  CreditCard,
  History,
  Send,
  Phone,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { useGlobalModals } from "../layout";
import { formatFCFA, formatDate, formatDateTime, getStatusBadge } from "@/lib/utils";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { SmsIcon } from "@/components/icons/SmsIcon";

export default function DebtsPage() {
  const { students, classes, reminders, getStudentFinancialSummary } = useScoly();
  const { openPaymentModal, openReminderModal } = useGlobalModals();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [selectedDelayRange, setSelectedDelayRange] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"DEBTS" | "REMINDERS_HISTORY">("DEBTS");

  // Collect all students with non-zero balance
  const debtorsList = useMemo(() => {
    return students
      .map((student) => ({
        student,
        summary: getStudentFinancialSummary(student.id),
      }))
      .filter(({ summary }) => summary.balance_due > 0)
      .sort((a, b) => b.summary.days_late - a.summary.days_late);
  }, [students, getStudentFinancialSummary]);

  // Filter debtors
  const filteredDebtors = useMemo(() => {
    return debtorsList.filter(({ student, summary }) => {
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        student.first_name.toLowerCase().includes(q) ||
        student.last_name.toLowerCase().includes(q) ||
        student.matricule.toLowerCase().includes(q) ||
        student.parent.full_name.toLowerCase().includes(q) ||
        student.parent.phone_primary.includes(q);

      const matchClass = selectedClassId === "ALL" || student.class_id === selectedClassId;

      let matchRange = true;
      if (selectedDelayRange === "1_7") {
        matchRange = summary.days_late >= 1 && summary.days_late <= 7;
      } else if (selectedDelayRange === "8_15") {
        matchRange = summary.days_late >= 8 && summary.days_late <= 15;
      } else if (selectedDelayRange === "15_PLUS") {
        matchRange = summary.days_late > 15;
      } else if (selectedDelayRange === "UPCOMING") {
        matchRange = summary.status === "upcoming";
      }

      return matchQuery && matchClass && matchRange;
    });
  }, [debtorsList, searchQuery, selectedClassId, selectedDelayRange]);

  const totalDebtToRecover = useMemo(() => {
    return filteredDebtors.reduce((sum, item) => sum + item.summary.balance_due, 0);
  }, [filteredDebtors]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Gestion des Impayés & Relances
            </h1>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
              {debtorsList.length} impayés
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
            Détection automatique des retards et relances WhatsApp en un clic.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("DEBTS")}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "DEBTS" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Impayés Actifs ({debtorsList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("REMINDERS_HISTORY")}
            className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "REMINDERS_HISTORY"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Historique ({reminders.length})
          </button>
        </div>
      </div>

      {activeTab === "DEBTS" ? (
        <>
          {/* Summary & Filters Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Total Debt Card */}
            <div className="bg-rose-50/80 p-4 rounded-2xl border border-rose-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
                  Total à Récupérer
                </span>
                <span className="text-xl font-black font-mono text-rose-950 tabular-nums">
                  {formatFCFA(totalDebtToRecover)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            {/* Filters */}
            <div className="md:col-span-2 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 shadow-2xs">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Élève, parent, tél..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedDelayRange}
                  onChange={(e) => setSelectedDelayRange(e.target.value)}
                  className="w-full sm:w-auto px-2.5 sm:px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Tous retards</option>
                  <option value="1_7">1 à 7 jours</option>
                  <option value="8_15">8 à 15 jours</option>
                  <option value="15_PLUS">🔴 &gt; 15 jours</option>
                  <option value="UPCOMING">🟡 Échéance proche</option>
                </select>

                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full sm:w-auto px-2.5 sm:px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Toutes les classes</option>
                  <optgroup label="🧸 MATERNELLE">
                    {classes.filter(c => c.level === "Maternelle").map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🎒 PRIMAIRE">
                    {classes.filter(c => c.level === "Primaire").map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="📚 COLLÈGE">
                    {classes.filter(c => c.level === "Collège").map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🎓 LYCÉE">
                    {classes.filter(c => c.level === "Lycée").map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🏛️ ENSEIGNEMENT SUPÉRIEUR">
                    {classes.filter(c => c.level === "Enseignement Supérieur").map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* MOBILE VIEW: Debt Cards (< md) */}
          <div className="md:hidden space-y-3">
            {filteredDebtors.length === 0 ? (
              <div className="py-12 text-center text-emerald-600 bg-white rounded-2xl border border-slate-200 text-xs font-semibold">
                ✓ Aucun impayé trouvé pour ces filtres.
              </div>
            ) : (
              filteredDebtors.map(({ student, summary }) => {
                const badge = getStatusBadge(summary.status);

                return (
                  <div
                    key={student.id}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link
                          href={`/students/${student.id}`}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 leading-tight block"
                        >
                          {student.first_name} {student.last_name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            {student.class_name}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            {student.matricule}
                          </span>
                        </div>
                      </div>

                      {summary.days_late > 0 ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 text-[11px] shrink-0">
                          <Clock className="w-3 h-3" />
                          {summary.days_late}j retard
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                          Proche
                        </span>
                      )}
                    </div>

                    {/* Amount Due Box */}
                    <div className="p-3 bg-rose-50/70 rounded-xl border border-rose-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-rose-700 block">Reste à payer</span>
                        <span className="font-mono font-black text-rose-900 text-base tabular-nums">
                          {formatFCFA(summary.balance_due)}
                        </span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </div>

                    {/* Parent Details */}
                    <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                      <div className="truncate max-w-[200px]">
                        <span className="text-slate-400">Parent : </span>
                        <strong className="text-slate-800">{student.parent.full_name}</strong>
                      </div>
                      <span className="font-mono text-slate-600 font-semibold">{student.parent.phone_primary}</span>
                    </div>

                    {/* Quick Touch Actions */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => openReminderModal(student, "whatsapp")}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-[#25D366] active:bg-[#1EBE5D] text-white rounded-xl text-[11px] font-bold active:scale-98 transition-all shadow-xs"
                        title="Relance WhatsApp"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openReminderModal(student, "sms")}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-blue-600 active:bg-blue-700 text-white rounded-xl text-[11px] font-bold active:scale-98 transition-all shadow-xs"
                        title="Relance Message Simple (SMS)"
                      >
                        <SmsIcon className="w-3.5 h-3.5" />
                        <span>SMS</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openPaymentModal(student.id)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-slate-900 active:bg-slate-800 text-white rounded-xl text-[11px] font-bold active:scale-98 transition-all shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Encaisser</span>
                      </button>
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
                    <th className="py-3.5 px-4">Élève & Classe</th>
                    <th className="py-3.5 px-4">Parent & Téléphone</th>
                    <th className="py-3.5 px-4 text-center">Retard Constaté</th>
                    <th className="py-3.5 px-4 text-right">Reste à Payer</th>
                    <th className="py-3.5 px-4 text-center">Statut</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDebtors.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-emerald-600 font-medium">
                        ✓ Aucun impayé trouvé pour ces critères de filtrage.
                      </td>
                    </tr>
                  ) : (
                    filteredDebtors.map(({ student, summary }) => {
                      const badge = getStatusBadge(summary.status);

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="py-3 px-4">
                            <Link
                              href={`/students/${student.id}`}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {student.first_name} {student.last_name}
                            </Link>
                            <span className="block text-[11px] text-slate-400">
                              {student.class_name} • <span className="font-mono">{student.matricule}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-bold text-slate-800">{student.parent.full_name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono font-bold text-slate-700">
                                {student.parent.phone_primary}
                              </span>
                              <span className="text-[10px] text-blue-600">({student.parent.relationship})</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-center">
                            {summary.days_late > 0 ? (
                              <span className="inline-flex items-center gap-1 font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <Clock className="w-3 h-3" />
                                {summary.days_late} jours
                              </span>
                            ) : (
                              <span className="text-[11px] text-amber-700 font-medium">
                                Proche ({formatDate(summary.next_due_date)})
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right font-mono font-black text-rose-700 text-sm tabular-nums">
                            {formatFCFA(summary.balance_due)}
                          </td>

                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.badge}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                              {badge.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* WhatsApp Reminder */}
                              <button
                                type="button"
                                onClick={() => openReminderModal(student, "whatsapp")}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#25D366] hover:bg-[#1EBE5D] active:scale-98 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                title="Relance WhatsApp"
                              >
                                <WhatsAppIcon className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </button>

                              {/* SMS / Simple Message Reminder */}
                              <button
                                type="button"
                                onClick={() => openReminderModal(student, "sms")}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                title="Relance par Message Simple (SMS)"
                              >
                                <SmsIcon className="w-3.5 h-3.5" />
                                <span>SMS</span>
                              </button>

                              {/* Encaisser Button */}
                              <button
                                type="button"
                                onClick={() => openPaymentModal(student.id)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                                title="Encaisser un versement"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
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
        </>
      ) : (
        /* Reminders History Tab */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Journal des Relances Effectuées</h3>
            <p className="text-xs text-slate-400">Traçabilité des messages WhatsApp et SMS envoyés aux tuteurs</p>
          </div>

          <div className="divide-y divide-slate-100">
            {reminders.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Aucune relance enregistrée pour le moment.
              </div>
            ) : (
              reminders.map((rem) => (
                <div key={rem.id} className="p-3.5 sm:p-4 hover:bg-slate-50/70 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1.5 gap-1">
                    <div className="flex items-center gap-2">
                      {rem.channel === "whatsapp" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#25D366]/10 text-[#075E54] text-[10px] font-bold border border-[#25D366]/30">
                          <WhatsAppIcon className="w-3 h-3" />
                          WhatsApp
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                          <SmsIcon className="w-3 h-3" />
                          SMS
                        </span>
                      )}
                      <strong className="text-slate-900">{rem.student_name}</strong>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-slate-800">{rem.parent_name} ({rem.parent_phone})</span>
                    </div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      {formatDateTime(rem.sent_at)}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200/80 font-mono text-[11px] leading-relaxed">
                    {rem.message_content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
