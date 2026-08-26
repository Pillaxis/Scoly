"use client";

import React from "react";
import { RefreshCw, CheckCircle2, Layers, Users, Sparkles } from "lucide-react";
import { BatchProgress } from "@/types/import";

interface BatchProgressViewProps {
  progress: BatchProgress;
}

export function BatchProgressView({ progress }: BatchProgressViewProps) {
  return (
    <div className="py-12 px-4 sm:px-8 max-w-lg mx-auto text-center space-y-6 animate-in fade-in">
      {/* Icone animée */}
      <div className="relative w-20 h-20 mx-auto">
        <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 animate-pulse">
          <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Titres & État */}
      <div className="space-y-1.5">
        <h3 className="text-lg font-black text-slate-900">
          Importation en cours...
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          {progress.currentActionDescription || "Traitement des données par lots sécurisés..."}
        </p>
      </div>

      {/* Barre de Progression Visuelle */}
      <div className="space-y-2">
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300 shadow-xs"
            style={{ width: `${Math.max(5, progress.percentage)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-slate-600 px-1">
          <span className="font-mono text-blue-700">{progress.percentage}%</span>
          <span>
            {progress.processedRows} / {progress.totalRows} élèves
          </span>
        </div>
      </div>

      {/* Détails du lot */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-around">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span>
            Lot <strong>{progress.currentBatch}</strong> sur <strong>{progress.totalBatches}</strong>
          </span>
        </div>

        <div className="h-4 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span>Multi-tenant & RLS Actif</span>
        </div>
      </div>
    </div>
  );
}
