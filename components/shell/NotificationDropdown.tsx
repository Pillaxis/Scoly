"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  AlertTriangle,
  AlertOctagon,
  Clock,
  CheckCircle2,
  Receipt,
  UserPlus,
  UploadCloud,
  X,
  ExternalLink,
  ChevronRight,
  CheckCheck,
  Trash2,
  Sparkles,
  Info,
  Layers,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { ScolyNotification, NotificationFilterTab, NotificationPriority } from "@/types/notifications";
import { filterNotificationsByRole } from "@/lib/notifications/analyzer";
import { formatDate, formatDateTime } from "@/lib/utils";

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPaymentReceipt?: (paymentId: string) => void;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  onSelectPaymentReceipt,
}: NotificationDropdownProps) {
  const router = useRouter();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    currentUser,
  } = useScoly();

  const [activeTab, setActiveTab] = useState<NotificationFilterTab>("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
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

  // Role-filtered notifications
  const roleNotifications = useMemo(() => {
    return filterNotificationsByRole(notifications, currentUser?.role);
  }, [notifications, currentUser?.role]);

  // Tab-filtered notifications
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return roleNotifications.filter((n) => !n.is_read);
      case "alerts":
        return roleNotifications.filter(
          (n) => n.priority === "critical" || n.priority === "warning"
        );
      case "payments":
        return roleNotifications.filter(
          (n) =>
            n.type === "payment_recorded" ||
            n.type === "payment_cancelled" ||
            n.type === "daily_collection_summary"
        );
      case "all":
      default:
        return roleNotifications;
    }
  }, [roleNotifications, activeTab]);

  // Chronological grouping (Aujourd'hui, Cette semaine, Plus anciennes)
  const groupedNotifications = useMemo(() => {
    const today: ScolyNotification[] = [];
    const thisWeek: ScolyNotification[] = [];
    const older: ScolyNotification[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

    filteredNotifications.forEach((n) => {
      const notifTime = new Date(n.created_at).getTime();
      if (notifTime >= startOfToday) {
        today.push(n);
      } else if (notifTime >= sevenDaysAgo) {
        thisWeek.push(n);
      } else {
        older.push(n);
      }
    });

    return { today, thisWeek, older };
  }, [filteredNotifications]);

  const handleActionClick = (notification: ScolyNotification) => {
    // Mark as read automatically when clicking action
    if (!notification.is_read) {
      markNotificationAsRead(notification.id);
    }

    // Direct payment receipt modal if available
    if (
      notification.entity_type === "payment" &&
      notification.entity_id &&
      onSelectPaymentReceipt
    ) {
      onSelectPaymentReceipt(notification.entity_id);
      onClose();
      return;
    }

    // Direct URL Navigation
    if (notification.action_url) {
      router.push(notification.action_url);
      onClose();
    }
  };

  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case "critical":
        return {
          icon: <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />,
          bg: "bg-rose-50 border-rose-200 text-rose-700",
          ring: "border-l-4 border-l-rose-500",
          badge: "Critique",
          badgeColor: "bg-rose-100 text-rose-700 border-rose-200",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          bg: "bg-amber-50/60 border-amber-200 text-amber-800",
          ring: "border-l-4 border-l-amber-500",
          badge: "Important",
          badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          bg: "bg-emerald-50/50 border-emerald-200 text-emerald-800",
          ring: "border-l-4 border-l-emerald-500",
          badge: "Confirmé",
          badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
          bg: "bg-blue-50/40 border-blue-100 text-blue-800",
          ring: "border-l-4 border-l-blue-400",
          badge: "Info",
          badgeColor: "bg-blue-100 text-blue-700 border-blue-200",
        };
    }
  };

  const getTypeIcon = (type: string, priority: NotificationPriority) => {
    if (type === "payment_recorded") {
      return <Receipt className="w-4 h-4 text-emerald-600" />;
    }
    if (type === "payment_cancelled") {
      return <X className="w-4 h-4 text-rose-600" />;
    }
    if (type === "student_enrolled") {
      return <UserPlus className="w-4 h-4 text-blue-600" />;
    }
    if (type.startsWith("import")) {
      return <UploadCloud className="w-4 h-4 text-indigo-600" />;
    }
    if (type.startsWith("onboarding")) {
      return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
    if (type === "debt_critical") {
      return <AlertOctagon className="w-4 h-4 text-rose-600" />;
    }
    if (type === "due_upcoming" || type === "debt_late") {
      return <Clock className="w-4 h-4 text-amber-600" />;
    }
    return getPriorityBadge(priority).icon;
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-12 z-50 w-[92vw] sm:w-[440px] max-w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 text-slate-900"
      style={{ maxHeight: "calc(100vh - 80px)" }}
    >
      {/* 1. Header Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">Notifications</h3>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 text-[11px] font-extrabold bg-blue-500 text-white rounded-full">
                  {unreadNotificationsCount}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Flux intelligent en temps réel (Supabase)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={() => markAllNotificationsAsRead()}
              className="text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title="Tout marquer comme lu"
            >
              <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Tout marquer lu</span>
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-b border-slate-200/80 shrink-0 overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "Toutes", count: roleNotifications.length },
          { id: "unread", label: "Non lues", count: unreadNotificationsCount },
          {
            id: "alerts",
            label: "Alertes",
            count: roleNotifications.filter(
              (n) => n.priority === "critical" || n.priority === "warning"
            ).length,
          },
          {
            id: "payments",
            label: "Paiements",
            count: roleNotifications.filter(
              (n) =>
                n.type === "payment_recorded" ||
                n.type === "payment_cancelled" ||
                n.type === "daily_collection_summary"
            ).length,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as NotificationFilterTab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Notification List with Chronological Sections */}
      <div className="overflow-y-auto flex-1 p-3 space-y-4 max-h-[460px] divide-y divide-slate-100">
        {filteredNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              {activeTab === "alerts" ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              ) : (
                <Bell className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <p className="text-sm font-bold text-slate-800">
              {activeTab === "unread"
                ? "Toutes les notifications sont lues"
                : activeTab === "alerts"
                ? "Aucune alerte critique ou retard"
                : activeTab === "payments"
                ? "Aucun paiement enregistré pour l'instant"
                : "Aucune notification"}
            </p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {activeTab === "alerts"
                ? "La situation financière de l'école est sous contrôle."
                : "Les événements importants s'afficheront automatiquement ici."}
            </p>
          </div>
        ) : (
          <>
            {/* Section Aujourd'hui */}
            {groupedNotifications.today.length > 0 && (
              <div className="space-y-2 pt-1 first:pt-0">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Aujourd&apos;hui
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {groupedNotifications.today.length} alerte(s)
                  </span>
                </div>
                {groupedNotifications.today.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onActionClick={() => handleActionClick(notif)}
                    onMarkRead={() => markNotificationAsRead(notif.id)}
                    onDelete={() => deleteNotification(notif.id)}
                    getPriorityBadge={getPriorityBadge}
                    getTypeIcon={getTypeIcon}
                  />
                ))}
              </div>
            )}

            {/* Section Cette Semaine */}
            {groupedNotifications.thisWeek.length > 0 && (
              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Cette semaine
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {groupedNotifications.thisWeek.length} alerte(s)
                  </span>
                </div>
                {groupedNotifications.thisWeek.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onActionClick={() => handleActionClick(notif)}
                    onMarkRead={() => markNotificationAsRead(notif.id)}
                    onDelete={() => deleteNotification(notif.id)}
                    getPriorityBadge={getPriorityBadge}
                    getTypeIcon={getTypeIcon}
                  />
                ))}
              </div>
            )}

            {/* Section Plus Anciennes */}
            {groupedNotifications.older.length > 0 && (
              <div className="space-y-2 pt-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Plus anciennes
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {groupedNotifications.older.length} alerte(s)
                  </span>
                </div>
                {groupedNotifications.older.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    notification={notif}
                    onActionClick={() => handleActionClick(notif)}
                    onMarkRead={() => markNotificationAsRead(notif.id)}
                    onDelete={() => deleteNotification(notif.id)}
                    getPriorityBadge={getPriorityBadge}
                    getTypeIcon={getTypeIcon}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Temps réel synchronisé
        </span>
        <Link
          href="/settings"
          onClick={onClose}
          className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Gérer les alertes</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

interface NotificationItemProps {
  notification: ScolyNotification;
  onActionClick: () => void;
  onMarkRead: () => void;
  onDelete: () => void;
  getPriorityBadge: (p: NotificationPriority) => any;
  getTypeIcon: (type: string, p: NotificationPriority) => any;
}

function NotificationItem({
  notification,
  onActionClick,
  onMarkRead,
  onDelete,
  getPriorityBadge,
  getTypeIcon,
}: NotificationItemProps) {
  const badgeStyle = getPriorityBadge(notification.priority);

  return (
    <div
      className={`group relative p-3 rounded-xl border transition-all duration-200 ${
        notification.is_read
          ? "bg-white border-slate-200/70 hover:border-slate-300"
          : `${badgeStyle.bg} ${badgeStyle.ring} shadow-2xs`
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Type / Priority Icon */}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            notification.is_read
              ? "bg-slate-100 text-slate-600"
              : "bg-white shadow-2xs"
          }`}
        >
          {getTypeIcon(notification.type, notification.priority)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5">
              <h4
                className={`text-xs font-bold truncate leading-tight ${
                  notification.is_read ? "text-slate-700" : "text-slate-900"
                }`}
              >
                {notification.title}
              </h4>
              {!notification.is_read && notification.priority === "critical" && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </div>

            <span className="text-[10px] text-slate-400 font-medium shrink-0">
              {formatDateTime(notification.created_at).split(" ")[1] || "—"}
            </span>
          </div>

          <p
            className={`text-xs mt-1 leading-relaxed ${
              notification.is_read ? "text-slate-500" : "text-slate-700"
            }`}
          >
            {notification.message}
          </p>

          {/* Action Button & Metadata */}
          <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-black/5">
            {notification.action_label ? (
              <button
                type="button"
                onClick={onActionClick}
                className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  notification.priority === "critical"
                    ? "bg-rose-600 hover:bg-rose-700 text-white shadow-2xs"
                    : notification.priority === "warning"
                    ? "bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-2xs"
                }`}
              >
                <span>{notification.action_label}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <span />
            )}

            {/* Quick Actions (Mark Read / Delete) */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              {!notification.is_read && (
                <button
                  type="button"
                  onClick={onMarkRead}
                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white/80 transition-colors cursor-pointer"
                  title="Marquer comme lu"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onDelete}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-white/80 transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
