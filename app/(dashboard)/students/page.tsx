"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CreditCard,
  MessageSquare,
  ArrowRight,
  Eye,
  Pencil,
  Phone,
  FileSpreadsheet,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { useGlobalModals } from "../layout";
import { formatFCFA, getStatusBadge } from "@/lib/utils";

export default function StudentsPage() {
  const router = useRouter();
  const { students, classes, getStudentFinancialSummary } = useScoly();
  const { openStudentModal, openPaymentModal, openReminderModal, openImportModal } = useGlobalModals();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const summary = getStudentFinancialSummary(student.id);

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        student.first_name.toLowerCase().includes(q) ||
        student.last_name.toLowerCase().includes(q) ||
        student.matricule.toLowerCase().includes(q) ||
        student.parent.full_name.toLowerCase().includes(q) ||
        student.parent.phone_primary.includes(q);

      // Class match
      const matchClass = selectedClassId === "ALL" || student.class_id === selectedClassId;

      // Status match
      const matchStatus = selectedStatus === "ALL" || summary.status === selectedStatus;

      return matchQuery && matchClass && matchStatus;
    });
  }, [students, searchQuery, selectedClassId, selectedStatus, getStudentFinancialSummary]);

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Gestion des Élèves
            </h1>
            <span className="text-[11px] sm:text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {students.length} inscrits
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 sm:mt-1">
            Effectif, suivi des règlements et fiches scolaires individuelles. Cliquez sur un élève pour ouvrir sa fiche.
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
            onClick={() => openStudentModal()}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 hover:shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscrire un Élève</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Nom, matricule, parent, téléphone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full md:w-auto">
          {/* Class selector */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {classes.filter(c => !["Maternelle", "Primaire", "Collège", "Lycée", "Enseignement Supérieur"].includes(c.level)).length > 0 && (
              <optgroup label="✨ AUTRES / SUR-MESURE">
                {classes.filter(c => !["Maternelle", "Primaire", "Collège", "Lycée", "Enseignement Supérieur"].includes(c.level)).map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.level})</option>
                ))}
              </optgroup>
            )}
          </select>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Tous statuts</option>
            <option value="credit">🔵 Avance / Crédit</option>
            <option value="up_to_date">🟢 À jour</option>
            <option value="upcoming">🟡 Proche</option>
            <option value="late">🟠 En retard</option>
            <option value="critical">🔴 Critique</option>
          </select>
        </div>
      </div>

      {/* MOBILE VIEW: Touch-friendly Cards (< md) — Clicking card opens fiche */}
      <div className="md:hidden space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="py-12 px-4 text-center bg-white rounded-2xl border border-slate-200 text-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Aucun élève enregistré</p>
              <p className="text-slate-400 text-xs mt-0.5">Commencez par inscrire votre premier élève.</p>
            </div>
            <button
              type="button"
              onClick={() => openStudentModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Inscrire un Élève</span>
            </button>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const summary = getStudentFinancialSummary(student.id);
            const badge = getStatusBadge(summary.status);

            return (
              <div
                key={student.id}
                onClick={() => router.push(`/students/${student.id}`)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3 hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer active:scale-[0.99] group"
              >
                {/* Header: Student name, class, status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-blue-50 group-hover:text-blue-700 flex items-center justify-center font-bold text-slate-700 text-sm shrink-0 transition-colors">
                      {student.first_name[0]}
                      {student.last_name[0]}
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 leading-tight block transition-colors">
                        {student.first_name} {student.last_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                          {student.class_name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {student.matricule}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${badge.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>
                </div>

                {/* Financial overview (3 Totals) */}
                <div className="p-3 bg-slate-50 group-hover:bg-slate-50/80 rounded-xl grid grid-cols-3 gap-2 text-xs border border-slate-200/80 transition-colors">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Scolarité</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {formatFCFA(summary.net_tuition)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 uppercase font-bold block">Déjà Réglé</span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {formatFCFA(summary.total_paid)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      {summary.credit_amount > 0 ? "Avance" : "Reste Dû"}
                    </span>
                    <span
                      className={`font-mono font-black text-xs ${
                        summary.credit_amount > 0
                          ? "text-blue-700"
                          : summary.balance_due > 0
                          ? "text-rose-600"
                          : "text-emerald-600"
                      }`}
                    >
                      {summary.credit_amount > 0 ? `+${formatFCFA(summary.credit_amount)}` : formatFCFA(summary.balance_due)}
                    </span>
                  </div>
                </div>

                {/* Parent Contact */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <div className="truncate max-w-[200px]">
                    <span className="text-slate-400">Tuteur : </span>
                    <strong className="text-slate-800">{student.parent.full_name}</strong>
                  </div>
                  <a
                    href={`tel:${student.parent.phone_primary}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-mono font-bold text-blue-600 flex items-center gap-1 shrink-0 hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{student.parent.phone_primary}</span>
                  </a>
                </div>

                {/* Quick Touch Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPaymentModal(student.id);
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-98 transition-all"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Encaisser</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openStudentModal(student);
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold active:scale-98 transition-all cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Modifier</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/students/${student.id}`);
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-slate-100 text-slate-800 hover:bg-slate-200 rounded-xl text-xs font-bold active:scale-98 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Fiche</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP VIEW: Full Table (>= md) — Clicking anywhere on row opens fiche */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Élève & Matricule</th>
                <th className="py-3.5 px-4">Classe</th>
                <th className="py-3.5 px-4">Parent / Contact</th>
                <th className="py-3.5 px-4 text-right">Payé / Total</th>
                <th className="py-3.5 px-4 text-right">Solde Dû</th>
                <th className="py-3.5 px-4 text-center">Statut</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-800 text-sm">Aucun élève enregistré</p>
                      <p className="text-slate-400 text-xs">Inscrivez un élève ou importez l&apos;ensemble de votre effectif depuis Excel, Google Sheets ou une photo de cahier.</p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openImportModal()}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                          <span>+ Importer vos données</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openStudentModal()}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Inscrire un Élève</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const summary = getStudentFinancialSummary(student.id);
                  const badge = getStatusBadge(summary.status);

                  return (
                    <tr
                      key={student.id}
                      onClick={() => router.push(`/students/${student.id}`)}
                      className="hover:bg-blue-50/60 transition-colors group cursor-pointer"
                      title="Cliquer pour ouvrir la fiche complète de l'élève"
                    >
                      {/* Élève & Matricule */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-100 group-hover:text-blue-700 flex items-center justify-center font-bold text-slate-600 shrink-0 transition-colors">
                            {student.first_name[0]}
                            {student.last_name[0]}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block">
                              {student.first_name} {student.last_name}
                            </span>
                            <span className="block text-[11px] font-mono text-slate-400">
                              {student.matricule}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Classe */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {student.class_name}
                        </span>
                      </td>

                      {/* Parent */}
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-800">{student.parent.full_name}</p>
                        <p className="font-mono text-slate-400 text-[11px]">
                          {student.parent.phone_primary}
                        </p>
                      </td>

                      {/* Payé / Total */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-mono font-medium text-slate-800">
                          {formatFCFA(summary.total_paid)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          / {formatFCFA(summary.net_tuition)}
                        </div>
                      </td>

                      {/* Solde restant ou Crédit/Avance */}
                      <td className="py-3 px-4 text-right">
                        {summary.credit_amount > 0 ? (
                          <div>
                            <span className="font-mono font-bold text-xs text-blue-700 block">
                              +{formatFCFA(summary.credit_amount)}
                            </span>
                            <span className="text-[10px] text-blue-600 font-semibold">(Avance)</span>
                          </div>
                        ) : (
                          <span
                            className={`font-mono font-bold text-xs ${
                              summary.balance_due > 0 ? "text-rose-600" : "text-emerald-600"
                            }`}
                          >
                            {formatFCFA(summary.balance_due)}
                          </span>
                        )}
                      </td>

                      {/* Statut */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {/* Quick Pay */}
                          <button
                            type="button"
                            onClick={() => openPaymentModal(student.id)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Encaisser un versement"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Student */}
                          <button
                            type="button"
                            onClick={() => openStudentModal(student)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-600 text-amber-700 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Modifier la fiche élève"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick Reminder WhatsApp */}
                          {summary.balance_due > 0 && (
                            <button
                              type="button"
                              onClick={() => openReminderModal(student)}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                              title="Relancer via WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Sheet */}
                          <Link
                            href={`/students/${student.id}`}
                            className="p-1.5 bg-slate-100 hover:bg-slate-900 text-slate-600 hover:text-white rounded-lg transition-colors cursor-pointer"
                            title="Voir la fiche complète"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
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
    </div>
  );
}
