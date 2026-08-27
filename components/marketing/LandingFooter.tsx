"use client";

import React from "react";
import Link from "next/link";
import { GraduationCap, Heart, Globe, Shield } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black text-lg shadow-md shadow-teal-500/20">
                S
              </div>
              <span className="font-black text-white text-xl tracking-tight">
                SCOLY<span className="text-teal-400">.</span>
              </span>
            </Link>

            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              La solution moderne et accessible de gestion financière et administrative pour les établissements scolaires privés en Afrique.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>Système 100% opérationnel • Sauvegardes continues</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <a href="#fonctionnalites" className="hover:text-teal-400 transition-colors">
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a href="#comment-ca-marche" className="hover:text-teal-400 transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#tarifs" className="hover:text-teal-400 transition-colors">
                  Tarifs & Formules
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-teal-400 transition-colors">
                  Foire aux questions
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Espace École */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">
              Espace Établissement
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/login" className="hover:text-teal-400 transition-colors">
                  Connexion à mon école
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-teal-400 transition-colors">
                  Créer un compte école (Essai 15j)
                </Link>
              </li>
              <li>
                <Link href="/subscription" className="hover:text-teal-400 transition-colors">
                  Abonnement START & PRO
                </Link>
              </li>
              <li>
                <span className="text-slate-500">Support : contact@scoly.tg</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SCOLY. Tous droits réservés. La gestion scolaire, simplement.</p>

          <div className="flex items-center gap-1">
            <span>Fait avec passion pour l&apos;éducation africaine</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
