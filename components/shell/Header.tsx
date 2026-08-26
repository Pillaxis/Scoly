"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PlusCircle, Bell } from "lucide-react";
import { useScoly } from "@/lib/store";
import { InlineHeaderSearch } from "./InlineHeaderSearch";
import { NotificationDropdown } from "./NotificationDropdown";

interface HeaderProps {
  onOpenPaymentModal: () => void;
  onSelectPaymentReceipt?: (paymentId: string) => void;
}

export function Header({ onOpenPaymentModal, onSelectPaymentReceipt }: HeaderProps) {
  const { dashboardMetrics } = useScoly();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  return (
    <header className="h-14 md:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left Side: Mobile Logo & Inline Direct Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-sm sm:max-w-md">
        {/* Mobile Logo Brand */}
        <Link href="/" className="md:hidden flex items-center gap-1.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-xs">
            S
          </div>
          <span className="font-extrabold text-slate-900 text-sm tracking-tight">SCOLY</span>
        </Link>

        {/* Inline Direct Search Bar (Saisie instantanée directe sans popup) */}
        <InlineHeaderSearch onSelectPaymentReceipt={onSelectPaymentReceipt} />
      </div>

      {/* Right Side: Quick Action, Functional Notification Bell & Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Encaisser Button */}
        <button
          type="button"
          onClick={onOpenPaymentModal}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 hover:shadow-md transition-all cursor-pointer active:scale-98"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Encaisser</span>
        </button>

        {/* Functional Notification Bell with Popup */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
              isNotifOpen
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            }`}
            title="Centre de notifications"
            aria-label="Ouvrir les notifications"
          >
            <Bell className="w-4 h-4" />
            {dashboardMetrics.critical_alerts_count > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notification Dropdown Modal */}
          <NotificationDropdown
            isOpen={isNotifOpen}
            onClose={() => setIsNotifOpen(false)}
            onSelectPaymentReceipt={onSelectPaymentReceipt}
          />
        </div>

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* User Profile Pill */}
        <Link href="/settings" className="flex items-center gap-2 pl-0.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            AD
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">Admin Direction</p>
            <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider">
              Directeur
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
}
