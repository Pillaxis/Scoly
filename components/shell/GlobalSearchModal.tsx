"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Receipt, X, ArrowRight, CornerDownLeft } from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA, getStatusBadge } from "@/lib/utils";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentReceipt?: (paymentId: string) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectPaymentReceipt,
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const { searchGlobal, getStudentFinancialSummary } = useScoly();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [isOpen]);

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event or parent
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const results = searchGlobal(query);
  const hasResults = results.students.length > 0 || results.payments.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-4 sm:pt-20 px-2 sm:px-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher un élève, matricule, parent, téléphone, reçu..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-200/70 px-2 py-1 rounded-md">
            ÉCHAP
          </span>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto p-3 space-y-4">
          {!query && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Tapez au moins une lettre pour rechercher parmi les élèves, parents et reçus...
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-slate-400 text-sm">
              Aucun résultat pour <span className="font-semibold text-slate-700">« {query} »</span>
            </div>
          )}

          {/* Students Section */}
          {results.students.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Élèves ({results.students.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.students.map((student) => {
                  const summary = getStudentFinancialSummary(student.id);
                  const badge = getStatusBadge(summary.status);

                  return (
                    <div
                      key={student.id}
                      onClick={() => {
                        onClose();
                        router.push(`/students/${student.id}`);
                      }}
                      className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 cursor-pointer transition-colors border border-transparent hover:border-blue-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center text-slate-600 group-hover:text-blue-700 font-bold text-sm shrink-0">
                          {student.first_name[0]}
                          {student.last_name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 group-hover:text-blue-900 text-sm">
                              {student.first_name} {student.last_name}
                            </span>
                            <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                              {student.matricule}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {student.class_name}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>Parent : {student.parent.full_name}</span>
                            <span>•</span>
                            <span className="font-mono">{student.parent.phone_primary}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">
                          Reste : {formatFCFA(summary.balance_due)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Payments Section */}
          {results.payments.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Paiements & Reçus ({results.payments.length})
              </div>
              <div className="mt-1 space-y-1">
                {results.payments.map((payment) => (
                  <div
                    key={payment.id}
                    onClick={() => {
                      onClose();
                      if (onSelectPaymentReceipt) {
                        onSelectPaymentReceipt(payment.id);
                      } else {
                        router.push(`/payments`);
                      }
                    }}
                    className="group flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-800 text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                            {payment.receipt_number}
                          </span>
                          <span className="font-semibold text-slate-900 text-sm">
                            {payment.student_name}
                          </span>
                          <span className="text-xs text-slate-500">({payment.class_name})</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Date : {payment.payment_date} • Mode : {payment.payment_method.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        {formatFCFA(payment.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600">
                ↵
              </kbd>{" "}
              Ouvrir
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px] text-slate-600">
                esc
              </kbd>{" "}
              Fermer
            </span>
          </div>
          <span className="font-medium text-slate-500">SCOLY Instant Search</span>
        </div>
      </div>
    </div>
  );
}
