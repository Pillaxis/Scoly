"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { useScoly } from "@/lib/store";

export default function RegisterPage() {
  const router = useRouter();
  const { registerUser, currentUser, isLoaded, school } = useScoly();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Auto redirect if already logged in
  useEffect(() => {
    if (isLoaded && currentUser) {
      if (school.onboarding_completed === false) {
        router.push("/onboarding");
      } else {
        router.push("/");
      }
    }
  }, [isLoaded, currentUser, school.onboarding_completed, router]);

  // Password rules validation
  const hasMinLength = password.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password.length > 0 && password === confirmPassword;

  const isPasswordValid = hasMinLength && hasLetter && hasNumber && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg("Veuillez saisir votre prénom et votre nom.");
      return;
    }
    if (!email.trim()) {
      setErrorMsg("Veuillez saisir une adresse e-mail valide.");
      return;
    }
    if (!hasMinLength) {
      setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (!hasLetter || !hasNumber) {
      setErrorMsg("Le mot de passe doit contenir des lettres et des chiffres.");
      return;
    }
    if (!isMatch) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const res = await registerUser({
        email: email.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        schoolName: `Établissement de ${firstName.trim()}`,
      });

      if (res.success) {
        setSuccessMsg("Votre compte a été créé avec succès ! Préparation de votre espace...");
        setTimeout(() => {
          router.push("/onboarding");
        }, 800);
      } else {
        setErrorMsg(res.error || "Impossible de créer le compte. Veuillez réessayer.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

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
      <div className="w-full max-w-4xl bg-white rounded-[32px] shadow-[0_25px_70px_-15px_rgba(30,27,75,0.35)] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px] border border-white/60 relative z-10">
        
        {/* =========================================================================
            PANNEAU GAUCHE : Visuel Élégant avec Illustration Montagne
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

          {/* Middle/Bottom Typography */}
          <div className="my-8 relative z-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.15]">
              Rejoignez<br />SCOLY dès aujourd&apos;hui
            </h1>
            <p className="text-xs text-slate-200/90 leading-relaxed max-w-xs pt-1 font-normal">
              Inscrivez votre établissement en 2 minutes et configurez votre gestion financière pas à pas.
            </p>

            <div className="pt-2">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/15 text-white text-[11px] font-semibold backdrop-blur-md border border-white/20">
                Configuration Simplifiée en 9 Étapes
              </span>
            </div>
          </div>

          {/* Bottom indicator */}
          <div className="relative z-10 text-[10px] text-white/50">
            © SCOLY • Sécurisé par Supabase
          </div>
        </div>

        {/* =========================================================================
            PANNEAU DROIT : Formulaire d'Inscription
            ========================================================================= */}
        <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white overflow-y-auto">
          <div className="max-w-md w-full mx-auto space-y-4">
            
            <div className="space-y-0.5">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Créer votre compte
              </h2>
              <p className="text-xs text-slate-500">
                Renseignez vos coordonnées pour démarrer la configuration.
              </p>
            </div>

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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              
              {/* Row 1: Prénom & Nom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 flex items-center gap-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      placeholder="Jean"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 flex items-center gap-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      placeholder="Dupont"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 flex items-center gap-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                      Adresse e-mail *
                    </label>
                    <input
                      type="email"
                      placeholder="nom@ecole.tg"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 flex items-center gap-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                  <div className="w-8 h-8 rounded-xl bg-slate-200/70 text-slate-600 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      placeholder="+228 90 00 00 00"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400 placeholder:font-normal"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                      Mot de passe *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                  <div className="w-8 h-8 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none mb-1">
                      Confirmer *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full bg-transparent text-xs font-bold text-slate-900 focus:outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Live Password Rules */}
              {password.length > 0 && (
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-1.5 text-[10px]">
                  <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    <Check className="w-3 h-3" />
                    <span>≥ 6 caractères</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLetter && hasNumber ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    <Check className="w-3 h-3" />
                    <span>Lettres et chiffres</span>
                  </div>
                  <div className={`col-span-2 flex items-center gap-1.5 ${isMatch ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    <Check className="w-3 h-3" />
                    <span>Mots de passe identiques</span>
                  </div>
                </div>
              )}

              {/* Submit Blue Button */}
              <button
                type="submit"
                disabled={loading || (password.length > 0 && !isPasswordValid)}
                className="w-full py-3.5 bg-gradient-to-r from-[#38bdf8] via-[#2563eb] to-[#1d4ed8] hover:from-[#0284c7] hover:to-[#1e40af] disabled:opacity-50 active:scale-[0.99] text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <span>{loading ? "Création en cours..." : "Créer mon compte"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Back to login */}
            <div className="pt-2 text-center">
              <p className="text-xs text-slate-500">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="font-bold text-blue-600 hover:text-blue-700 underline underline-offset-2 transition-colors"
                >
                  Se connecter
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
