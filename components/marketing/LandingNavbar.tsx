"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Menu, X, Globe, LogIn, LayoutDashboard } from "lucide-react";
import { useScoly } from "@/lib/store";

export function LandingNavbar() {
  const { currentUser } = useScoly();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Comment ça marche", href: "#comment-ca-marche" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs"
          : "bg-white/70 backdrop-blur-xs border-b border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-black text-slate-950 text-lg sm:text-xl tracking-tight leading-none flex items-center gap-1">
              SCOLY
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">
              Gestion scolaire simplifiée
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-blue-600 transition-colors py-1 relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 rounded-full transition-all duration-200 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language badge */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 px-2.5 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/60">
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>FR</span>
          </div>

          {currentUser && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-all cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Mon Espace</span>
            </Link>
          )}

          <Link
            href="/login"
            className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-700 px-3 py-2 transition-colors cursor-pointer"
          >
            Connexion
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:shadow-blue-600/30 cursor-pointer"
          >
            <span>Commencer</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
            >
              <span>Espace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              href="/register"
              className="px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center gap-1"
            >
              <span>Essai 15j</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg bg-slate-100 border border-slate-200 cursor-pointer"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-5 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-slate-800 hover:text-blue-600 py-1.5 px-2 rounded-lg hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {currentUser && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 text-slate-900 font-bold text-sm border border-slate-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Mon Espace (Tableau de bord)</span>
              </Link>
            )}

            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center py-2.5 rounded-xl border border-slate-300 text-slate-800 font-bold text-sm hover:bg-slate-50"
            >
              <LogIn className="w-4 h-4 mr-2" />
              <span>Connexion à mon école</span>
            </Link>

            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-600/25"
            >
              <span>Créer mon espace (15 jours gratuits)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
