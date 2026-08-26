"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, User, Receipt, X, ArrowRight, CornerDownLeft, ChevronRight } from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA, formatDate, getStatusBadge } from "@/lib/utils";

interface InlineHeaderSearchProps {
  onSelectPaymentReceipt?: (paymentId: string) => void;
}

export function InlineHeaderSearch({ onSelectPaymentReceipt }: InlineHeaderSearchProps) {
  const router = useRouter();
  const { searchGlobal, getStudentFinancialSummary } = useScoly();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = searchGlobal(query);
  const hasResults = results.students.length > 0 || results.payments.length > 0;
  const showDropdown = isOpen && query.trim().length > 0;

  const handleSelectStudent = (studentId: string) => {
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
    router.push(`/students/${studentId}`);
  };

  const handleSelectPayment = (paymentId: string) => {
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
    if (onSelectPaymentReceipt) {
      onSelectPaymentReceipt(paymentId);
    } else {
      router.push("/payments");
    }
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm sm:max-w-md w-full">
      {/* Inline Search Input */}
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none transition-colors group-focus-within:text-blue-600" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher élève, reçu, classe..."
          className="w-full pl-9 pr-14 py-2 bg-slate-100/90 hover:bg-slate-100 focus:bg-white text-slate-900 placeholder:text-slate-400 rounded-xl text-xs font-medium border border-slate-200/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none shadow-2xs"
        />

        {/* Clear Query or Ctrl+K shortcut */}
        <div className="absolute right-2 flex items-center gap-1">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Effacer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-400 shadow-2xs pointer-events-none">
              Ctrl K
            </kbd>
          )}
        </div>
      </div>

      {/* Floating Results Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 top-full mt-1.5 w-full sm:w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[75vh] flex flex-col">
          {/* Header of results */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Résultats pour « {query} »</span>
            <span>
              {results.students.length + results.payments.length} trouvé{results.students.length + results.payments.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Results List Scrollable */}
          <div className="overflow-y-auto p-2 space-y-3 divide-y divide-slate-100">
            {!hasResults ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-1">
                <Search className="w-6 h-6 text-slate-300 mb-1" />
                <span className="font-bold text-slate-700">Aucun résultat trouvé</span>
                <span className="text-[11px] text-slate-400">
                  Aucun élève, reçu ou classe ne correspond à votre recherche.
                </span>
              </div>
            ) : (
              <>
                {/* Students Section */}
                {results.students.length > 0 && (
                  <div className="space-y-1 pt-1 first:pt-0">
                    <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Élèves ({results.students.length})
                    </div>
                    {results.students.map((student) => {
                      const summary = getStudentFinancialSummary(student.id);
                      const badge = getStatusBadge(summary.status);

                      return (
                        <div
                          key={student.id}
                          onClick={() => handleSelectStudent(student.id)}
                          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
                              {student.first_name[0]}
                              {student.last_name[0]}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 truncate">
                                <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                                  {student.first_name} {student.last_name}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                                  {student.class_name}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                Mat. <span className="font-mono text-slate-600">{student.matricule}</span> • Parent :{" "}
                                {student.parent.full_name} ({student.parent.phone_primary})
                              </p>
                            </div>
                          </div>

                          <div className="text-right shrink-0 pl-2">
                            <span className="font-mono font-bold text-xs text-slate-900 block">
                              {formatFCFA(summary.balance_due)}
                            </span>
                            <span
                              className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${badge.badge}`}
                            >
                              {badge.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Payments Section */}
                {results.payments.length > 0 && (
                  <div className="space-y-1 pt-2">
                    <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Reçus de Caisse ({results.payments.length})
                    </div>
                    {results.payments.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectPayment(p.id)}
                        className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200">
                            <Receipt className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs text-blue-700 group-hover:text-blue-900">
                                {p.receipt_number}
                              </span>
                              <span className="text-[11px] text-slate-700 font-medium truncate">
                                • {p.student_name}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {p.class_name} • {formatDate(p.payment_date)} • {p.payment_method.toUpperCase()}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-2">
                          <span className="font-mono font-extrabold text-xs text-emerald-700 block">
                            {formatFCFA(p.amount)}
                          </span>
                          <span className="text-[10px] text-blue-600 font-bold hover:underline">
                            Voir reçu →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Helper */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <span>Appuyez sur un résultat pour l&apos;ouvrir</span>
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-mono text-slate-500">
              ÉCHAP pour fermer
            </kbd>
          </div>
        </div>
      )}
    </div>
  );
}
