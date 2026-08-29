"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useScoly } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, currentUser, school, isLoaded } = useScoly();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect immediately without showing the login form
  useEffect(() => {
    if (isLoaded && currentUser) {
      router.replace(school.onboarding_completed === false ? "/onboarding" : "/dashboard");
    }
  }, [isLoaded, currentUser, school.onboarding_completed, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMsg("Veuillez saisir votre adresse e-mail.");
      return;
    }
    if (!password) {
      setErrorMsg("Veuillez saisir votre mot de passe.");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(cleanEmail, password);
      if (res.success) {
        setSuccessMsg("Connexion réussie !");
        // Instant seamless navigation
        router.replace(school.onboarding_completed === false ? "/onboarding" : "/dashboard");
      } else {
        setErrorMsg(res.error || "Adresse email ou mot de passe incorrect.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Une erreur est survenue lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || (currentUser && isLoaded)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#c7d2fe] via-[#a5b4fc] to-[#818cf8] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans relative overflow-hidden">
      
      {/* Subtle Dot Pattern Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: "radial-gradient(#4338ca 1.2px, transparent 1.2px)",
          backgroundSize: "24px 24px"
        }}
      />

      {/* Main Floating Modal Card */}
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-[0_25px_70px_-15px_rgba(30,27,75,0.35)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[530px] border border-white/60 relative z-10">
        
        {/* =========================================================================
            PANNEAU GAUCHE : Visuel Élégant avec Illustration Montagne / Onde Bleue
            ========================================================================= */}
        <div 
          className="md:col-span-5 p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden bg-cover bg-center text-white"
          style={{
            backgroundImage: "url('/images/auth-bg.svg')",
            backgroundColor: "#0d2a63"
          }}
        >
          {/* Logo SCOLY Officiel */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30 border border-white/20">
                S
              </div>
              <span className="text-2xl font-black tracking-tight text-white">SCOLY</span>
            </div>
          </div>

          {/* Middle/Bottom Welcome Typography */}
          <div className="my-10 relative z-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
              Bonjour &<br />bienvenue !
            </h1>
            <p className="text-xs text-slate-200/90 leading-relaxed max-w-xs pt-1 font-normal">
              Centralisez vos élèves, paiements, scolarités et impayés dans un seul espace intelligent.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/15 text-white text-[11px] font-semibold backdrop-blur-md border border-white/20">
                Gestion Scolaire Simplifiée
              </span>
            </div>
          </div>

          {/* Bottom subtle indicator */}
          <div className="relative z-10 text-[10px] text-white/50">
            © SCOLY • Plateforme Administrative & Financière
          </div>
        </div>

        {/* =========================================================================
            PANNEAU DROIT : Formulaire Épuré & Cartes de Champs Adaptées
            ========================================================================= */}
        <div className="md:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto space-y-5">
            
            {/* Error & Success Alerts */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-semibold">{successMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Field 1: Email */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 flex items-center gap-3 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white focus-within:border-transparent transition-all">
                <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    placeholder="nom@ecole.tg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 flex items-center gap-3 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white focus-within:border-transparent transition-all">
                <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                    Mot de passe
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 cursor-pointer shrink-0"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Options: Remember me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Se souvenir de moi</span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-slate-500 hover:text-blue-600 font-medium transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>

              {/* Login Button (Clean Elevated White Card Button) */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white hover:bg-slate-50 active:scale-[0.99] text-slate-800 font-extrabold rounded-2xl border border-slate-200/90 shadow-md shadow-slate-200/60 hover:shadow-lg transition-all text-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? "Connexion en cours..." : "Se connecter"}</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </form>

            {/* Bottom Register Prompt + Blue Pill Button */}
            <div className="pt-4 text-center space-y-2.5">
              <p className="text-xs text-slate-400 font-medium">
                Vous n&apos;avez pas encore de compte ?
              </p>
              
              <Link
                href="/register"
                className="w-full py-3.5 bg-gradient-to-r from-[#38bdf8] via-[#2563eb] to-[#1d4ed8] hover:from-[#0284c7] hover:to-[#1e40af] active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Créer un compte</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
