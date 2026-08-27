"use client";

import React from "react";
import Link from "next/link";
import { Crown, Sparkles, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { useScoly } from "@/lib/store";
import { getTrialTimeRemaining } from "@/lib/subscription/features";

interface SubscriptionStatusBadgeProps {
  className?: string;
  showDetails?: boolean;
  clickable?: boolean;
}

export function SubscriptionStatusBadge({
  className = "",
  showDetails = false,
  clickable = true,
}: SubscriptionStatusBadgeProps) {
  const { subscription } = useScoly();

  if (!subscription) return null;

  const isTrial = subscription.status === "trialing";
  const isExpired =
    subscription.status === "expired" ||
    (isTrial && subscription.trial_end_at && new Date() > new Date(subscription.trial_end_at));
  const isPro = subscription.plan === "pro" && subscription.status === "active";
  const isStart = subscription.plan === "start" && subscription.status === "active";

  const trialInfo = isTrial ? getTrialTimeRemaining(subscription) : null;

  let badgeContent = (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors ${className} ${
        isExpired
          ? "bg-rose-100 text-rose-800 border-rose-200"
          : isPro
          ? "bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-900 border-amber-300"
          : isStart
          ? "bg-blue-100 text-blue-800 border-blue-200"
          : "bg-emerald-100 text-emerald-800 border-emerald-200"
      }`}
    >
      {isExpired ? (
        <>
          <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
          <span>Essai Expiré</span>
        </>
      ) : isPro ? (
        <>
          <Crown className="w-3.5 h-3.5 text-amber-600 fill-amber-500 shrink-0" />
          <span>SCOLY PRO</span>
          {showDetails && (
            <span className="text-[10px] opacity-75 font-normal">
              ({subscription.billing_period === "yearly" ? "Annuel" : "Mensuel"})
            </span>
          )}
        </>
      ) : isStart ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>SCOLY START</span>
          {showDetails && (
            <span className="text-[10px] opacity-75 font-normal">
              ({subscription.billing_period === "yearly" ? "Annuel" : "Mensuel"})
            </span>
          )}
        </>
      ) : (
        <>
          <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
          <span>
            Essai ({trialInfo ? `${trialInfo.daysRemaining}j` : "15j"})
          </span>
        </>
      )}
    </div>
  );

  if (clickable) {
    return (
      <Link
        href="/subscription"
        className="inline-block hover:opacity-90 transition-opacity"
        title="Gérer mon abonnement SCOLY"
      >
        {badgeContent}
      </Link>
    );
  }

  return badgeContent;
}
