"use client";

import React, { useMemo, useEffect, useRef } from "react";
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
  ChevronRight,
  CheckCheck,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { ScolyNotification, NotificationPriority } from "@/types/notifications";
import { filterNotificationsByRole } from "@/lib/notifications/analyzer";
import { formatDateTime } from "@/lib/utils";

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
          bg: "bg-rose-50/60 border-rose-200 text-rose-700",
          ring: "border-l-4 border-l-rose-500",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
          bg: "bg-amber-50/60 border-amber-200 text-amber-800",
          ring: "border-l-4 border-l-amber-500",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
          bg: "bg-emerald-50/50 border-emerald-200 text-emerald-800",
          ring: "border-l-4 border-l-emerald-500",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
          bg: "bg-blue-50/40 border-blue-100 text-blue-800",
          ring: "border-l-4 border-l-blue-400",
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
      className="absolute right-0 top-12 z-50 w-[92vw] sm:w-[420px] max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 text-slate-900"
      style={{ maxHeight: "calc(100vh - 80px)" }}
    >
      {/* 1. Header Bar: Simple & Sober with Title "Notifications" */}
      <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-white tracking-tight">Notifications</h3>
            {unreadNotificationsCount > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-black bg-blue-500 text-white rounded-full">
                {unreadNotificationsCount}
              </span>
            )}
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
              <span>Tout marquer lu</span>
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

      {/* 2. Clean Notifications List */}
      <div className="overflow-y-auto flex-1 p-3 space-y-2.5 max-h-[460px]">
        {roleNotifications.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-sm font-bold text-slate-800">Aucune notification</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Toutes vos alertes et notifications importantes s&apos;afficheront ici.
            </p>
          </div>
        ) : (
          roleNotifications.map((notif) => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onActionClick={() => handleActionClick(notif)}
              onMarkRead={() => markNotificationAsRead(notif.id)}
              onDelete={() => deleteNotification(notif.id)}
              getPriorityBadge={getPriorityBadge}
              getTypeIcon={getTypeIcon}
            />
          ))
        )}
      </div>

      {/* 3. Clean Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Synchronisé
        </span>
        <Link
          href="/settings"
          onClick={onClose}
          className="text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Paramètres</span>
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
      onClick={onActionClick}
      className={`group relative p-3 rounded-xl border transition-all duration-150 cursor-pointer ${
        notification.is_read
          ? "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50"
          : `${badgeStyle.bg} ${badgeStyle.ring} shadow-2xs hover:shadow-xs`
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
            <div className="flex items-center gap-1.5 min-w-0">
              <h4
                className={`text-xs font-bold truncate leading-tight ${
                  notification.is_read ? "text-slate-700" : "text-slate-900"
                }`}
              >
                {notification.title}
              </h4>
              {!notification.is_read && notification.priority === "critical" && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
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

          {/* Action Button & Quick Controls */}
          <div className="mt-2.5 flex items-center justify-between gap-2 pt-1 border-t border-black/5">
            {notification.action_label ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onActionClick();
                }}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead();
                  }}
                  className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-white transition-colors cursor-pointer"
                  title="Marquer comme lu"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-white transition-colors cursor-pointer"
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
