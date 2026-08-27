"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  AlertTriangle,
  Plus,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScoly } from "@/lib/store";

interface BottomNavProps {
  onOpenPaymentModal: () => void;
}

export function BottomNav({ onOpenPaymentModal }: BottomNavProps) {
  const pathname = usePathname();
  const { dashboardMetrics } = useScoly();

  const isHome = pathname === "/dashboard";
  const isStudents = pathname.startsWith("/students");
  const isPayments = pathname.startsWith("/payments");
  const isDebts = pathname.startsWith("/debts");
  const isSettings = pathname.startsWith("/settings");

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] select-none pb-[env(safe-area-inset-bottom,8px)]">
      <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
        {/* 1. Dashboard */}
        <Link
          href="/dashboard"
          prefetch={true}

          className={cn(
            "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 relative min-w-[56px] active:scale-95",
            isHome
              ? "text-blue-600 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          )}
        >
          <div className="relative">
            <LayoutDashboard className={cn("w-5 h-5", isHome ? "text-blue-600 stroke-[2.5]" : "text-slate-500")} />
            {isHome && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Accueil</span>
        </Link>

        {/* 2. Élèves */}
        <Link
          href="/students"
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 relative min-w-[56px] active:scale-95",
            isStudents
              ? "text-blue-600 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          )}
        >
          <div className="relative">
            <Users className={cn("w-5 h-5", isStudents ? "text-blue-600 stroke-[2.5]" : "text-slate-500")} />
            {isStudents && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Élèves</span>
        </Link>

        {/* 3. Action Flash Centrale : Encaisser */}
        <div className="relative -top-3">
          <button
            type="button"
            onClick={onOpenPaymentModal}
            aria-label="Encaisser un paiement"
            className="w-12 h-12 rounded-full bg-blue-600 active:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-600/35 hover:scale-105 active:scale-95 transition-all cursor-pointer ring-4 ring-white"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* 4. Paiements */}
        <Link
          href="/payments"
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 relative min-w-[56px] active:scale-95",
            isPayments
              ? "text-blue-600 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          )}
        >
          <div className="relative">
            <CreditCard className={cn("w-5 h-5", isPayments ? "text-blue-600 stroke-[2.5]" : "text-slate-500")} />
            {isPayments && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Paiements</span>
        </Link>

        {/* 5. Impayés & Relances */}
        <Link
          href="/debts"
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all duration-150 relative min-w-[56px] active:scale-95",
            isDebts
              ? "text-rose-600 font-bold"
              : "text-slate-500 hover:text-slate-900 font-medium"
          )}
        >
          <div className="relative">
            <AlertTriangle className={cn("w-5 h-5", isDebts ? "text-rose-600 stroke-[2.5]" : "text-slate-500")} />
            {dashboardMetrics.students_critical > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            )}
            {isDebts && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-rose-600 rounded-full" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Impayés</span>
        </Link>
      </div>
    </nav>
  );
}
