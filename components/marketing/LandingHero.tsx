"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  Receipt,
  Smartphone,
  ShieldCheck,
  TrendingUp,
  Clock,
  Play,
  FileCheck,
  Users,
  Search,
  DollarSign,
  ChevronRight,
} from "lucide-react";

export function LandingHero() {
  const [activeMockupTab, setActiveMockupTab] = useState<"payments" | "debts">("payments");

  return (
    <section className="relative pt-8 sm:pt-14 pb-16 sm:pb-24 overflow-hidden">
      {/* Background Soft Glow & Grid Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[650px] sm:w-[850px] h-[450px] bg-gradient-to-tr from-teal-200/40 via-emerald-100/30 to-blue-100/40 blur-3xl rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 1. Top Pill Badge (Exact reference design) */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-teal-800 text-xs sm:text-sm font-bold mb-6 sm:mb-8 shadow-2xs hover:bg-teal-100/70 transition-colors animate-in fade-in slide-in-from-top-2 duration-300">
          <GraduationCap className="w-4 h-4 text-teal-600 shrink-0" />
          <span>Pour les directeurs et fondateurs d&apos;écoles</span>
        </div>

        {/* 2. Main H1 Headline (Exact 2-line rhythm with colored emphasis) */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] sm:leading-[1.12] max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-400">
          Transformez la gestion de votre école en{" "}
          <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent block sm:inline">
            une évidence au quotidien
          </span>
        </h1>

        {/* 3. Subheadline (Clear, concise, professional) */}
        <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal animate-in fade-in slide-in-from-bottom-3 duration-500">
          Suivez les élèves, encaissez les scolarités, éliminez les impayés oubliés et éditez des reçus officiels instantanément depuis un seul espace.
        </p>

        {/* 4. CTA Action Buttons Area */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-600">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 transition-all cursor-pointer group"
          >
            <span>Essayer gratuitement</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <a
            href="#comment-ca-marche"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-slate-700 hover:text-slate-950 font-bold text-sm sm:text-base hover:bg-slate-100/80 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 text-teal-600 fill-teal-600" />
            <span>Voir comment ça marche</span>
          </a>
        </div>

        {/* 5. Social Proof / Review Strip (Exact reference structure) */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500 font-medium">
          {/* Overlapping Avatars */}
          <div className="flex items-center -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
              AK
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-700 text-white font-bold flex items-center justify-center text-[10px]">
              DM
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-amber-600 text-white font-bold flex items-center justify-center text-[10px]">
              EB
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
              SL
            </div>
          </div>

          {/* Stars & Text */}
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {"★★★★★"}
            </div>
            <span className="font-extrabold text-slate-900">4.8 / 5</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-600 font-semibold">
              Recommandé par plus de 150 établissements scolaires
            </span>
          </div>
        </div>

        {/* 6. High-End Elevated Product Window Mockup */}
        <div className="mt-12 sm:mt-16 relative max-w-5xl mx-auto">
          {/* Floating Pill Badge 1: Top Right */}
          <div className="absolute -top-4 -right-2 sm:-right-6 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-xs font-bold text-slate-900 animate-in fade-in zoom-in-95 duration-700 hover:scale-105 transition-transform">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Reçu N° REC-25-00142</div>
              <div className="font-mono text-emerald-700 font-extrabold">75 000 FCFA encaissés</div>
            </div>
          </div>

          {/* Floating Pill Badge 2: Left Side */}
          <div className="absolute top-1/3 -left-3 sm:-left-8 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-xs font-bold text-slate-900 animate-in fade-in zoom-in-95 duration-700 hover:scale-105 transition-transform">
            <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Recouvrement</div>
              <div className="font-mono text-teal-700 font-extrabold">94.2% de taux global</div>
            </div>
          </div>

          {/* Floating Pill Badge 3: Bottom Right */}
          <div className="absolute -bottom-4 right-4 sm:right-10 z-20 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl text-xs font-bold text-slate-900 animate-in fade-in zoom-in-95 duration-700 hover:scale-105 transition-transform">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold">Mobile Money</div>
              <div className="text-slate-800 font-bold">TMoney & Flooz en direct</div>
            </div>
          </div>

          {/* Window Container */}
          <div className="rounded-2xl sm:rounded-3xl bg-white border border-slate-200/90 shadow-2xl shadow-slate-900/10 overflow-hidden text-left">
            {/* macOS Window Header Bar */}
            <div className="h-10 sm:h-12 bg-slate-50/90 border-b border-slate-200 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              </div>

              <div className="text-[11px] sm:text-xs font-bold text-slate-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                <span>SCOLY — Tableau de Bord Direction & Trésorerie (Année 2025-2026)</span>
              </div>

              <div className="text-[10px] font-mono text-slate-400 hidden sm:block">
                Lycée Excellence • 380 Élèves
              </div>
            </div>

            {/* Mockup Body: Real SCOLY Interface Preview */}
            <div className="p-4 sm:p-6 bg-slate-50/50 space-y-4 sm:space-y-6">
              {/* Top 3 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {/* 1. Total Encaissé */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Total Encaissé</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold">
                      85.2%
                    </span>
                  </div>
                  <div className="mt-1.5 font-mono text-xl sm:text-2xl font-black text-slate-900">
                    14 850 000 <span className="text-xs font-sans text-slate-500 font-bold">FCFA</span>
                  </div>
                  <div className="mt-1 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    <span>+1 250 000 FCFA cette semaine</span>
                  </div>
                </div>

                {/* 2. Reste à Recouvrer */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Reste à Recouvrer</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-extrabold">
                      42 dossiers
                    </span>
                  </div>
                  <div className="mt-1.5 font-mono text-xl sm:text-2xl font-black text-slate-900">
                    2 580 000 <span className="text-xs font-sans text-slate-500 font-bold">FCFA</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-medium">
                    14 relances prioritaires aujourd&apos;hui
                  </div>
                </div>

                {/* 3. Élèves & Recouvrement */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                    <span>Statut Élèves</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-extrabold">
                      338 à jour
                    </span>
                  </div>
                  <div className="mt-1.5 font-mono text-xl sm:text-2xl font-black text-teal-700">
                    94.2% <span className="text-xs font-sans text-slate-500 font-bold">Taux</span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 font-medium">
                    380 élèves enregistrés dans 12 classes
                  </div>
                </div>
              </div>

              {/* Table Preview: Real SCOLY Recent Payments */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="p-3 sm:p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-teal-600" />
                    <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Derniers Encaissements & Reçus Officiels
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    Synchronisation active
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase text-[10px]">
                        <th className="py-2.5 px-3 sm:px-4">Reçu N°</th>
                        <th className="py-2.5 px-3 sm:px-4">Élève</th>
                        <th className="py-2.5 px-3 sm:px-4 hidden sm:table-cell">Classe</th>
                        <th className="py-2.5 px-3 sm:px-4">Montant</th>
                        <th className="py-2.5 px-3 sm:px-4 hidden sm:table-cell">Mode</th>
                        <th className="py-2.5 px-3 sm:px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-teal-700">
                          REC-25-00142
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-900">
                          Koffi Mensah
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell text-slate-500">
                          Terminale D
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-black text-slate-900">
                          75 000 FCFA
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            TMoney
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Imprimer</span>
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-teal-700">
                          REC-25-00141
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-900">
                          Amina Soro
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell text-slate-500">
                          3ème A
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-black text-slate-900">
                          50 000 FCFA
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Espèces
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Imprimer</span>
                          </span>
                        </td>
                      </tr>

                      <tr className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-teal-700">
                          REC-25-00140
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-bold text-slate-900">
                          Kodjo Lawson
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell text-slate-500">
                          6ème B
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-black text-slate-900">
                          40 000 FCFA
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            Flooz
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-right">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 hover:text-teal-800">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Imprimer</span>
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
