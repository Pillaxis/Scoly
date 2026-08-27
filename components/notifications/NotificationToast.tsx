"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  Receipt,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from "lucide-react";
import { ScolyNotification } from "@/types/notifications";
import { useScoly } from "@/lib/store";

export function NotificationToast() {
  const router = useRouter();
  const { notifications, markNotificationAsRead } = useScoly();
  const [activeToast, setActiveToast] = useState<ScolyNotification | null>(null);
  const [visible, setVisible] = useState(false);
  const seenIdsRef = React.useRef<Set<string>>(new Set());

  // Detect newly added unread notifications
  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const latest = notifications[0];
    if (!latest || latest.is_read) return;

    // Check if notification was created in the last 15 seconds
    const notifAge = Date.now() - new Date(latest.created_at).getTime();
    if (notifAge < 15000 && !seenIdsRef.current.has(latest.id)) {
      seenIdsRef.current.add(latest.id);
      setActiveToast(latest);
      setVisible(true);

      // Auto-hide after 6 seconds for non-critical notifications
      if (latest.priority !== "critical") {
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(() => setActiveToast(null), 300);
        }, 6000);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications]);

  if (!activeToast) return null;

  const handleAction = () => {
    markNotificationAsRead(activeToast.id);
    setVisible(false);
    if (activeToast.action_url) {
      router.push(activeToast.action_url);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => setActiveToast(null), 300);
  };

  const getToastStyle = () => {
    switch (activeToast.priority) {
      case "critical":
        return {
          icon: <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />,
          border: "border-rose-500/80 ring-2 ring-rose-500/20 bg-white",
          btn: "bg-rose-600 hover:bg-rose-700 text-white",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          border: "border-amber-400 ring-2 ring-amber-400/20 bg-white",
          btn: "bg-amber-600 hover:bg-amber-700 text-white",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          border: "border-emerald-400 ring-2 ring-emerald-400/20 bg-white",
          btn: "bg-emerald-600 hover:bg-emerald-700 text-white",
        };
      case "info":
      default:
        return {
          icon: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          border: "border-blue-300 ring-2 ring-blue-400/10 bg-white",
          btn: "bg-blue-600 hover:bg-blue-700 text-white",
        };
    }
  };

  const style = getToastStyle();

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 max-w-sm w-full transition-all duration-300 transform ${
        visible
          ? "translate-y-0 opacity-100 scale-100"
          : "translate-y-4 opacity-0 scale-95 pointer-events-none"
      }`}
    >
      <div
        className={`p-4 rounded-2xl shadow-2xl border ${style.border} backdrop-blur-xl flex items-start gap-3`}
      >
        <div className="p-2 rounded-xl bg-slate-50 shrink-0 shadow-2xs">
          {style.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-black text-slate-900 leading-tight truncate">
              {activeToast.title}
            </h4>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {activeToast.message}
          </p>

          {activeToast.action_label && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={handleAction}
                className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer ${style.btn}`}
              >
                <span>{activeToast.action_label}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
