"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  School as SchoolIcon,
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  ArrowLeft,
} from "lucide-react";
import { useScoly } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { loginUser, registerUser, currentUser } = useScoly();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await loginUser(email, password);
        if (res.success) {
          setSuccessMsg("Connexion réussie ! Redirection...");
          setTimeout(() => router.push("/"), 1200);
        } else {
          setErrorMsg(res.error || "Identifiants incorrects.");
        }
      } else {
        if (!schoolName.trim()) {
          setErrorMsg("Veuillez saisir le nom de votre établissement.");
          setLoading(false);
          return;
        }
        const res = await registerUser(email, password, schoolName, fullName);
        if (res.success) {
          setSuccessMsg("Votre école a été créée avec succès ! Redirection...");
          setTimeout(() => router.push("/"), 1500);
        } else {
          setErrorMsg(res.error || "Échec de l'inscription.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/30">
            S
          </div>
          <span className="text-2xl font-black tracking-tight text-white">SCOLY</span>
        </div>

        <h2 className="text-center text-2xl font-extrabold tracking-tight text-white">
          {mode === "login" ? "Accédez à votre espace scolaire" : "Inscrivez votre établissement"}
        </h2>
        <p className="mt-1.5 text-center text-xs text-slate-400">
          Gestion des encaissements et scolarité 100% synchronisée en direct
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-slate-950/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-800 space-y-6">
          {/* Multi-Device Banner */}
          <div className="p-3.5 bg-blue-950/40 border border-blue-800/50 rounded-2xl flex items-center gap-3 text-xs text-blue-200">
            <div className="flex items-center gap-1 text-blue-400 shrink-0">
              <Laptop className="w-4 h-4" />
              <Smartphone className="w-4 h-4" />
            </div>
            <span>
              Accès multi-écrans : retrouvez vos données sur votre PC de bureau, ordinateur portable ou téléphone.
            </span>
          </div>

          {/* Alerts */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/50 border border-rose-800 text-rose-200 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-800 text-emerald-200 rounded-2xl text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Nom de l&apos;Établissement Scolaire *
                  </label>
                  <div className="relative">
                    <SchoolIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Ex: Complexe Scolaire Lumière"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 placeholder:font-normal focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Votre Nom & Prénom
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Ex: Paul Mensah"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-medium text-white placeholder:text-slate-500 placeholder:font-normal focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Adresse Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="direction@mon-ecole.tg"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder:text-slate-500 placeholder:font-normal focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white placeholder:text-slate-500 placeholder:font-normal focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all cursor-pointer mt-5"
            >
              <span>
                {loading
                  ? "Traitement en cours..."
                  : mode === "login"
                  ? "Se Connecter"
                  : "Créer mon Compte"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setErrorMsg(null);
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
            >
              {mode === "login"
                ? "Nouvel établissement ? Créez un compte ici"
                : "Déjà un compte ? Connectez-vous ici"}
            </button>
          </div>

          <div className="text-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retourner à l&apos;application</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
