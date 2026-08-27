"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  School as SchoolIcon,
  User,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  ArrowRight,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useScoly } from "@/lib/store";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const {
    currentUser,
    loginUser,
    registerUser,
    logoutUser,
    syncStatus,
    syncLocalToSupabase,
    refreshFromSupabase,
    school,
  } = useScoly();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [fullName, setFullName] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isPushingLocal, setIsPushingLocal] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === "login") {
        const res = await loginUser(email, password);
        if (res.success) {
          setSuccessMsg("Connexion réussie ! Vos données sont synchronisées.");
          setTimeout(() => onClose(), 1500);
        } else {
          setErrorMsg(res.error || "Identifiants invalides.");
        }
      } else {
        if (!schoolName.trim()) {
          setErrorMsg("Veuillez renseigner le nom de votre établissement.");
          setLoading(false);
          return;
        }
        const res = await registerUser(email, password, schoolName, fullName);
        if (res.success) {
          setSuccessMsg("Compte créé avec succès ! Votre école est configurée.");
          setTimeout(() => onClose(), 1800);
        } else {
          setErrorMsg(res.error || "Échec de l'inscription.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handlePushAll = async () => {
    setIsPushingLocal(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await syncLocalToSupabase();
      if (res.success) {
        setSuccessMsg("Toutes les données ont été enregistrées dans Supabase !");
      } else {
        setErrorMsg(res.message || "Erreur de synchronisation.");
      }
    } finally {
      setIsPushingLocal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white flex items-start justify-between relative">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
                S
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                SCOLY Cloud & Multi-Appareils
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              {currentUser ? "Votre Compte Établissement" : mode === "login" ? "Connexion Sécurisée" : "Créer un Compte Établissement"}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Retrouvez toutes vos données réelles sur PC, tablette et smartphone.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* Alerts */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {currentUser ? (
            /* Logged in view */
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Compte Connecté :</span>
                  <span className="text-xs font-bold text-emerald-700 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    🟢 En Ligne
                  </span>
                </div>
                <div className="font-extrabold text-sm text-slate-900">{currentUser.email}</div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <SchoolIcon className="w-3.5 h-3.5 text-blue-600" />
                  <strong>{school.name || "Mon Établissement"}</strong>
                </div>
              </div>

              {/* Multi-Device Info Box */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-3">
                <div className="flex items-center gap-1 text-blue-600 shrink-0 pt-0.5">
                  <Laptop className="w-4 h-4" />
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-xs text-blue-900">
                  <strong className="block font-bold">Synchronisation Active :</strong>
                  Toutes les inscriptions et paiements effectués sur cet appareil sont automatiquement disponibles sur tous vos autres écrans en vous connectant avec cet email.
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handlePushAll}
                  disabled={isPushingLocal}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isPushingLocal ? "animate-spin" : ""}`} />
                  <span>{isPushingLocal ? "Enregistrement en cours..." : "Forcer la synchronisation avec Supabase"}</span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await logoutUser();
                    setSuccessMsg("Déconnecté avec succès.");
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se Déconnecter</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login / Register Form */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === "register" && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nom de votre Établissement Scolaire *
                    </label>
                    <div className="relative">
                      <SchoolIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Ex: Complexe Scolaire Saint-Paul"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Votre Nom & Prénom
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Ex: Jean Dupont"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="direction@votre-ecole.tg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mot de passe *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer mt-4"
              >
                <span>{loading ? "Vérification en cours..." : mode === "login" ? "Se Connecter" : "Créer mon Compte"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Switch Login / Register */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setErrorMsg(null);
                  }}
                  className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                >
                  {mode === "login"
                    ? "Pas encore de compte ? Inscrivez votre école gratuitement"
                    : "Déjà un compte ? Connectez-vous ici"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
