"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CreditCard,
  AlertTriangle,
  Settings,
  Receipt,
  Sparkles,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScoly } from "@/lib/store";
import { SubscriptionStatusBadge } from "@/components/subscription/SubscriptionStatusBadge";
import { getTrialTimeRemaining } from "@/lib/subscription/features";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { school, dashboardMetrics, subscription } = useScoly();

  const isTrial = subscription?.status === "trialing";
  const isPro = subscription?.plan === "pro" && subscription?.status === "active";
  const trialInfo = isTrial ? getTrialTimeRemaining(subscription) : null;

  const navItems: NavItem[] = [
    {
      label: "Tableau de bord",
      href: "/dashboard",
      icon: LayoutDashboard,
    },

    {
      label: "Élèves",
      href: "/students",
      icon: Users,
      badge: dashboardMetrics.students_count > 0 ? dashboardMetrics.students_count : undefined,
    },
    {
      label: "Scolarité & Grilles",
      href: "/tuition",
      icon: GraduationCap,
    },
    {
      label: "Paiements & Reçus",
      href: "/payments",
      icon: CreditCard,
    },
    {
      label: "Impayés & Relances",
      href: "/debts",
      icon: AlertTriangle,
      badge: dashboardMetrics.students_critical > 0 ? dashboardMetrics.students_critical : undefined,
      badgeColor: "bg-rose-500 text-white",
    },
    {
      label: "Mon abonnement",
      href: "/subscription",
      icon: Crown,
      badge: isTrial ? `${trialInfo?.daysRemaining}j` : isPro ? "PRO" : "START",
      badgeColor: isPro
        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
        : isTrial
        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
        : "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    },
    {
      label: "Paramètres",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-slate-900 text-slate-100 flex-col shrink-0 border-r border-slate-800 select-none z-30 transition-all duration-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-black text-lg">
          S
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="font-extrabold text-lg tracking-tight text-white">SCOLY</span>
            <SubscriptionStatusBadge clickable={true} />
          </div>
          <p className="text-[11px] text-slate-400 truncate max-w-[140px]" title={school.name || "SCOLY"}>
            {school.name || "Votre Établissement"}
          </p>
        </div>
      </div>


      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Gestion Financière
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={cn(
                "group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold"
                  : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && (
                <span
                  className={cn(
                    "text-[11px] px-2 py-0.5 rounded-full font-bold tabular-nums",
                    item.badgeColor || (isActive ? "bg-blue-700 text-white" : "bg-slate-800 text-slate-300")
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* School Badge Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-700">
              {school.country ? school.country.slice(0, 2).toUpperCase() : "TG"}
            </div>
            <div className="text-xs">
              <p className="font-semibold text-slate-200">Devise : {school.currency || "FCFA"}</p>
              <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                {school.city ? `${school.city}${school.country ? `, ${school.country}` : ""}` : "Non configuré"}
              </p>
            </div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Système opérationnel" />
        </div>
      </div>
    </aside>
  );
}
