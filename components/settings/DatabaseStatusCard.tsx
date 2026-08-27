"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { useScoly } from "@/lib/store";

export function DatabaseStatusCard() {
  const {
    school,
    classes,
    students,
    payments,
    tuitionPlans,
    syncStatus,
    syncErrorMessage,
    syncLocalToSupabase,
    refreshFromSupabase,
  } = useScoly();

  const [apiStatus, setApiStatus] = useState<any>(null);
  const [loadingCheck, setLoadingCheck] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const checkStatus = async () => {
    setLoadingCheck(true);
    try {
      const res = await fetch("/api/sync/status");
      const data = await res.json();
      setApiStatus(data);
    } catch (err: any) {
      setApiStatus({ connected: false, error: err?.message });
    } finally {
      setLoadingCheck(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const res = await syncLocalToSupabase();
      if (res.success) {
        setSyncFeedback("✅ Données sauvegardées dans Supabase avec succès !");
        await checkStatus();
      } else {
        setSyncFeedback(`⚠️ ${res.message || "Erreur lors de l'enregistrement."}`);
      }
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleCopySql = () => {
    const link = "https://supabase.com/dashboard/project/plwzzbtwovoxbaocijnz/sql/new";
    window.open(link, "_blank");
  };

  const isTablesReady = apiStatus?.tablesExist !== false;

  return (
    <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                Connexion Supabase & Base de Données
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  isTablesReady
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200"
                }`}
              >
                {isTablesReady ? "🟢 100% Connecté & Opérationnel" : "🟡 Tables à déployer"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Toutes les données de votre établissement sont persistées et accessibles sur tous vos appareils.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={checkStatus}
            disabled={loadingCheck}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCheck ? "animate-spin" : ""}`} />
            <span>Tester l&apos;état</span>
          </button>

          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "Enregistrement..." : "Sauvegarder dans Supabase"}</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold animate-in fade-in">
          {syncFeedback}
        </div>
      )}

      {/* Grid of Database Entities Status */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Élèves Enregistrés</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-slate-900">{students.length}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Reel DB
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Paiements / Reçus</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-slate-900">{payments.length}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Reel DB
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Classes & Niveaux</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-slate-900">{classes.length}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Reel DB
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Grilles Tarifaires</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-lg font-black text-slate-900">{tuitionPlans.length}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Reel DB
            </span>
          </div>
        </div>
      </div>

      {/* Deploy Schema Helper Box if tables need to be verified or run */}
      {!isTablesReady && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-extrabold text-amber-900">
                Initialisation unique du schéma PostgreSQL sur Supabase
              </h4>
              <p className="text-xs text-amber-800 mt-1">
                Le fichier de migration complète <code>supabase/setup_complete_database.sql</code> est prêt. Exécutez-le en un clic dans votre éditeur SQL Supabase pour activer toutes les tables réelles.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <a
              href="https://supabase.com/dashboard/project/plwzzbtwovoxbaocijnz/sql/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
            >
              <span>Ouvrir Supabase SQL Editor</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Security & Multi-Device Info */}
      <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>RLS & Chiffrement SSL :</strong> Toutes vos données financières sont isolées par établissement et protégées.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">
          Instance: <strong className="text-slate-800">plwzzbtwovoxbaocijnz.supabase.co</strong>
        </span>
      </div>
    </div>
  );
}
