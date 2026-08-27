"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { useScoly } from "@/lib/store";

export default function ForgotPasswordPage() {
  const { resetPassword } = useScoly();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Veuillez saisir une adresse e-mail valide.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(email.trim());
      if (res.success) {
        setIsSubmitted(true);
      } else {
        setErrorMsg(res.error || "Une erreur est survenue lors de l'envoi du lien.");
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

      <div className="w-full max-w-md bg-white rounded-[32px] shadow-[0_25px_70px_-15px_rgba(30,27,75,0.35)] border border-white/60 overflow-hidden p-8 sm:p-10 space-y-6 relative z-10">
        
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-500/25">
            S
          </div>
          <span className="text-xl font-black tracking-tight text-slate-900">SCOLY</span>
        </div>

        {isSubmitted ? (
          /* Confirmation Screen */
          <div className="space-y-5 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-200 shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-slate-900">
                E-mail envoyé avec succès
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                Nous venons d&apos;envoyer un lien de réinitialisation sécurisé à l&apos;adresse :
              </p>
              <p className="text-xs font-bold text-slate-800 bg-slate-100 py-1.5 px-3 rounded-lg inline-block">
                {email}
              </p>
            </div>

            <p className="text-[11px] text-slate-400">
              Vérifiez votre boîte de réception ainsi que vos courriers indésirables (spams).
            </p>

            <div className="pt-4 space-y-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-[#38bdf8] via-[#2563eb] to-[#1d4ed8] hover:from-[#0284c7] hover:to-[#1e40af] text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Retourner à la connexion</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Form Screen */
          <div className="space-y-6">
            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Réinitialiser votre mot de passe
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Entrez votre adresse e-mail et nous vous enverrons un lien d&apos;accès direct.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-2 sm:p-2.5 flex items-center gap-3 shadow-2xs focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#38bdf8] via-[#2563eb] to-[#1d4ed8] hover:from-[#0284c7] hover:to-[#1e40af] disabled:opacity-50 text-white font-extrabold rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-xs cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{loading ? "Envoi du lien..." : "Envoyer le lien de réinitialisation"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Retour à la page de connexion</span>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
