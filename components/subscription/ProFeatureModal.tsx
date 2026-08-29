"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Crown, Sparkles, CheckCircle2, ArrowRight, X, ShieldCheck } from "lucide-react";
import { FEATURE_DEFINITIONS } from "@/lib/subscription/features";
import { FeatureKey } from "@/types/subscription";

interface ProFeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureKey?: FeatureKey | null;
  customTitle?: string;
  customDescription?: string;
}

export function ProFeatureModal({
  isOpen,
  onClose,
  featureKey,
  customTitle,
  customDescription,
}: ProFeatureModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const featureDef = featureKey ? FEATURE_DEFINITIONS[featureKey] : null;
  const title = customTitle || (featureDef ? featureDef.title : "Fonctionnalité SCOLY PRO");
  const description =
    customDescription ||
    (featureDef
      ? featureDef.description
      : "Cette fonctionnalité avancée est disponible exclusivement avec le forfait SCOLY PRO.");

  const handleUpgradeClick = () => {
    onClose();
    router.push("/subscription?plan=pro");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg overflow-hidden bg-white border border-amber-200 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Decorative Top Gradient Header */}
        <div className="relative p-6 pb-8 bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white overflow-hidden">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-amber-400/20 rounded-full blur-xl" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 text-xs font-bold tracking-wide uppercase bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white">
            <Crown className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
            SCOLY PRO
          </div>

          <h3 className="text-2xl font-black tracking-tight text-white mb-2">
            {title}
          </h3>
          <p className="text-amber-100 text-sm leading-relaxed">
            {description}
          </p>
        </div>

        {/* Benefits List */}
        <div className="p-6 space-y-4 bg-slate-50/50">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ce que vous débloquez avec SCOLY PRO :
          </div>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 bg-white border border-slate-200/80 rounded-xl shadow-sm">
              <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">
                  {title} & Toutes les automatisations
                </div>
                <div className="text-xs text-slate-500">
                  Paiements en ligne FedaPay, Scanner IA OCR, Analytics avancés et synchronisation Google Sheets.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Multi-appareils en temps réel (PC, tablettes, smartphones)</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Équipe illimitée avec rôles et permissions détaillés</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Rappels SMS & WhatsApp groupés en 1 clic</span>
            </div>
          </div>

          {/* Pricing Highlight */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-amber-900 font-medium">Tarif forfait PRO</div>
              <div className="text-lg font-black text-slate-900">
                10 000 <span className="text-xs font-normal text-slate-600">FCFA / mois</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold">
                ou 84 000 FCFA / an (Économisez 36 000 FCFA)
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-white/80 px-2.5 py-1.5 rounded-lg border border-amber-200/50 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">30 jours d&apos;essai gratuit</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 pt-3 bg-white border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Plus tard
          </button>
          <button
            type="button"
            onClick={handleUpgradeClick}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Crown className="w-4 h-4 fill-white" />
            Passer à SCOLY PRO
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
