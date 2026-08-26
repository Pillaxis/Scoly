"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Receipt,
  TrendingUp,
  X,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA, formatDate, formatDateTime } from "@/lib/utils";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentReceipt?: (paymentId: string) => void;
}

type TabType = "all" | "alerts" | "payments";

export function NotificationDropdown({
  isOpen,
  onClose,
  onSelectPaymentReceipt,
}: NotificationDropdownProps) {
  const { dashboardMetrics, payments, students, getStudentFinancialSummary } = useScoly();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [readIds, setReadIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Compute live system notifications based on real data
  const notifications = useMemo(() => {
    const list: Array<{
      id: string;
      type: "critical" | "upcoming" | "payment" | "summary";
      category: "alert" | "payment";
      title: string;
      description: string;
      time: string;
      link?: string;
      actionLabel?: string;
      paymentId?: string;
    }> = [];

    const activePayments = payments.filter((p) => p.status !== "cancelled");

    // 1. Critical Debt Alert (> 15 days)
    if (dashboardMetrics.students_critical > 0) {
      list.push({
        id: "notif-critical-debts",
        type: "critical",
        category: "alert",
        title: `${dashboardMetrics.students_critical} dossier(s) en retard critique (> 15j)`,
        description: `Des élèves ont accumulé un retard supérieur à 15 jours. Une relance immédiate est recommandée.`,
        time: "Aujourd'hui",
        link: "/debts?filter=critical",
        actionLabel: "Relancer les parents",
      });
    }

    // 2. Upcoming Due Dates Alert (3 to 7 days)
    if (dashboardMetrics.students_upcoming > 0) {
      list.push({
        id: "notif-upcoming-debts",
        type: "upcoming",
        category: "alert",
        title: `${dashboardMetrics.students_upcoming} échéance(s) dans 3 à 7 jours`,
        description: `Préparez les rappels préventifs pour sécuriser les rentrées de fonds de la semaine.`,
        time: "À anticiper",
        link: "/debts?filter=upcoming",
        actionLabel: "Préparer les rappels",
      });
    }

    // 3. Today's Collections Summary
    if (dashboardMetrics.collected_today > 0) {
      list.push({
        id: "notif-collected-today",
        type: "summary",
        category: "payment",
        title: `Encaissé aujourd'hui : ${formatFCFA(dashboardMetrics.collected_today)}`,
        description: `Taux de recouvrement actuel de l'établissement à ${dashboardMetrics.recovery_rate.toString().replace(".", ",")}% (${formatFCFA(dashboardMetrics.collected_total)} cumulés).`,
        time: "En direct",
        link: "/payments",
        actionLabel: "Voir le journal",
      });
    }

    // 4. Recent Individual Payments
    const recent = activePayments.slice(0, 4);
    recent.forEach((p) => {
      list.push({
        id: `notif-payment-${p.id}`,
        type: "payment",
        category: "payment",
        title: `Encaissement de ${formatFCFA(p.amount)} reçu`,
        description: `${p.student_name} (${p.class_name}) • Reçu n° ${p.receipt_number} • ${p.payment_method.toUpperCase()}`,
        time: formatDate(p.payment_date),
        link: "/payments",
        actionLabel: "Voir le reçu",
        paymentId: p.id,
      });
    });

    return list;
  }, [dashboardMetrics, payments]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    if (activeTab === "alerts") return notifications.filter((n) => n.category === "alert");
    if (activeTab === "payments") return notifications.filter((n) => n.category === "payment");
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  const markAllAsRead = () => {
    setReadIds(notifications.map((n) => n.id));
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 z-50 w-full sm:w-[410px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-2xs">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-rose-100 text-rose-800 text-[10px] font-extrabold border border-rose-200">
                  {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">Alertes financières et activités en direct</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer px-2 py-1"
            >
              Tout lire
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center px-4 py-2 border-b border-slate-100 bg-white gap-2 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white shadow-2xs"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          Toutes ({notifications.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === "alerts"
              ? "bg-rose-600 text-white shadow-2xs"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          Alertes ({notifications.filter((n) => n.category === "alert").length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            activeTab === "payments"
              ? "bg-blue-600 text-white shadow-2xs"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }`}
        >
          Paiements ({notifications.filter((n) => n.category === "payment").length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-1.5">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
            <span className="font-bold text-slate-700">Aucune notification dans cette section</span>
            <span className="text-[11px] text-slate-400">Tous les voyants financiers sont au vert !</span>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !readIds.includes(notif.id);

            let IconComponent = Bell;
            let iconBg = "bg-blue-50 text-blue-600 border-blue-200";

            if (notif.type === "critical") {
              IconComponent = AlertTriangle;
              iconBg = "bg-rose-100 text-rose-700 border-rose-200";
            } else if (notif.type === "upcoming") {
              IconComponent = Clock;
              iconBg = "bg-amber-100 text-amber-700 border-amber-200";
            } else if (notif.type === "payment") {
              IconComponent = Receipt;
              iconBg = "bg-emerald-100 text-emerald-700 border-emerald-200";
            } else if (notif.type === "summary") {
              IconComponent = TrendingUp;
              iconBg = "bg-indigo-100 text-indigo-700 border-indigo-200";
            }

            return (
              <div
                key={notif.id}
                className={`p-3 rounded-xl transition-colors flex items-start justify-between gap-3 ${
                  isUnread ? "bg-slate-50/90 hover:bg-slate-100/80" : "bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${iconBg}`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <p className="font-extrabold text-xs text-slate-900 truncate">{notif.title}</p>
                      {isUnread && (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{notif.description}</p>
                    <span className="text-[10px] text-slate-400 font-medium block pt-0.5">
                      {notif.time}
                    </span>
                  </div>
                </div>

                {/* Action Link / Button */}
                {notif.link && (
                  <Link
                    href={notif.link}
                    onClick={() => {
                      setReadIds((prev) => [...prev, notif.id]);
                      onClose();
                    }}
                    className="p-1.5 bg-white hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors shrink-0 shadow-2xs"
                    title={notif.actionLabel || "Accéder"}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Quick Access */}
      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
        <Link
          href="/debts"
          onClick={onClose}
          className="font-bold text-rose-600 hover:text-rose-800"
        >
          Gestion des impayés →
        </Link>
        <Link
          href="/payments"
          onClick={onClose}
          className="font-bold text-blue-600 hover:text-blue-800"
        >
          Journal de caisse →
        </Link>
      </div>
    </div>
  );
}
