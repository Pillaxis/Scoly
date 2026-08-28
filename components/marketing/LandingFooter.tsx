"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ContactModal } from "@/components/marketing/ContactModal";

export function LandingFooter() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <footer className="bg-white text-slate-900 border-t border-slate-100 pt-16 pb-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 4-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 pb-14">
            {/* Col 1: Brand & Tagline (Span 2) */}
            <div className="md:col-span-2 space-y-3">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-sm">
                  S
                </div>
                <span className="font-black text-slate-950 text-lg tracking-tight">
                  SCOLY
                </span>
              </Link>

              <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed font-normal">
                La gestion scolaire, simplement.
              </p>
            </div>

            {/* Col 2: PRODUIT */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                PRODUIT
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-500">
                <li>
                  <a href="/#fonctionnalites" className="hover:text-blue-600 transition-colors">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="/#tarifs" className="hover:text-blue-600 transition-colors">
                    Tarifs
                  </a>
                </li>
                <li>
                  <a href="/#comment-ca-marche" className="hover:text-blue-600 transition-colors">
                    Comment ça marche
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: RESSOURCES */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                RESSOURCES
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-500">
                <li>
                  <a href="/#faq" className="hover:text-blue-600 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-blue-600 transition-colors">
                    Connexion
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setIsContactOpen(true)}
                    className="hover:text-blue-600 transition-colors cursor-pointer text-left font-medium"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 4: LÉGAL */}
            <div className="space-y-3 text-left">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                LÉGAL
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-slate-500">
                <li>
                  <Link href="/confidentialite" className="text-slate-500 hover:text-blue-600 transition-colors">
                    Confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/cgu" className="text-slate-500 hover:text-blue-600 transition-colors">
                    CGU
                  </Link>
                </li>
                <li>
                  <Link href="/mentions-legales" className="text-slate-500 hover:text-blue-600 transition-colors">
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Centered Copyright Line */}
          <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} SCOLY. Tous droits réservés.
          </div>
        </div>
      </footer>

      {/* Interactive Contact Modal */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
