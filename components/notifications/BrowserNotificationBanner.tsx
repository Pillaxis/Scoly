"use client";

import React, { useState, useEffect } from "react";
import { Bell, X, Check } from "lucide-react";
import {
  shouldShowPermissionBanner,
  requestBrowserNotificationPermission,
  dismissPermissionBanner,
} from "@/lib/notifications/browser-notifications";

export function BrowserNotificationBanner() {
  const [show, setShow] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check permission eligibility after component mounts
    const timer = setTimeout(() => {
      if (shouldShowPermissionBanner()) {
        setShow(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const handleEnable = async () => {
    setIsProcessing(true);
    const perm = await requestBrowserNotificationPermission();
    setIsProcessing(false);
    setShow(false);
  };

  const handleDismiss = () => {
    dismissPermissionBanner();
    setShow(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-4 py-2.5 text-xs border-b border-blue-800/60 flex items-center justify-between gap-3 shadow-inner relative z-30 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
          <Bell className="w-3.5 h-3.5" />
        </div>
        <p className="text-xs text-slate-200 truncate">
          <strong className="text-white font-bold">Alertes en temps réel :</strong> Activez les notifications de votre navigateur pour être alerté instantanément des paiements et retards.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleEnable}
          disabled={isProcessing}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Activer</span>
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer"
        >
          Plus tard
        </button>

        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
          aria-label="Fermer la bannière"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
