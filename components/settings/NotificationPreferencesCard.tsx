"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  Zap,
  Volume2,
  CheckCheck,
  Trash2,
  Sparkles,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import {
  isBrowserNotificationSupported,
  getBrowserNotificationPermission,
  requestBrowserNotificationPermission,
  triggerBrowserNotification,
} from "@/lib/notifications/browser-notifications";
import { normalizeRole } from "@/lib/notifications/analyzer";

export function NotificationPreferencesCard() {
  const {
    notifications,
    unreadNotificationsCount,
    markAllNotificationsAsRead,
    currentUser,
    school,
  } = useScoly();

  const [permission, setPermission] = useState<string>("default");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    setPermission(getBrowserNotificationPermission());
  }, []);

  const handleEnablePermission = async () => {
    const res = await requestBrowserNotificationPermission();
    setPermission(res);
  };

  const handleSendTestNotification = () => {
    setIsTesting(true);
    triggerBrowserNotification({
      id: `test-notif-${Date.now()}`,
      school_id: school.id,
      type: "payment_recorded",
      priority: "success",
      title: "Test de Notification SCOLY 🔔",
      message: "Les notifications en temps réel fonctionnent parfaitement sur votre appareil !",
      action_url: "/payments",
      action_label: "Voir le journal",
      is_read: false,
      created_at: new Date().toISOString(),
    });
    setTestResult("Notification envoyée avec succès !");
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(null);
    }, 4000);
  };

  const currentRole = normalizeRole(currentUser?.role);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Système de Notifications Intelligent & Temps Réel
            </h3>
            <p className="text-xs text-slate-500">
              Gestion des alertes contextuelles et synchronisation multi-appareils (Supabase)
            </p>
          </div>
        </div>

        {unreadNotificationsCount > 0 && (
          <button
            type="button"
            onClick={() => markAllNotificationsAsRead()}
            className="self-start sm:self-auto px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Tout marquer comme lu ({unreadNotificationsCount})</span>
          </button>
        )}
      </div>

      {/* Browser Notification Status Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">
                Notifications sur cet appareil
              </span>
            </div>

            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                permission === "granted"
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  : permission === "denied"
                  ? "bg-rose-100 text-rose-800 border border-rose-200"
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}
            >
              {permission === "granted"
                ? "Activées ✅"
                : permission === "denied"
                ? "Bloquées par le navigateur"
                : "Non activées"}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Recevez les alertes en direct même lorsque vous naviguez sur une autre application ou un autre onglet.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {permission !== "granted" ? (
              <button
                type="button"
                onClick={handleEnablePermission}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
              >
                Activer les notifications
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSendTestNotification}
                disabled={isTesting}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Tester une notification</span>
              </button>
            )}

            {testResult && (
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 self-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {testResult}
              </span>
            )}
          </div>
        </div>

        {/* User Role Matrix */}
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-bold text-blue-900">
              Votre Rôle Actuel : <span className="uppercase">{currentRole}</span>
            </span>
          </div>

          <p className="text-xs text-blue-800 leading-relaxed">
            SCOLY filtre automatiquement les notifications pour vous présenter uniquement les alertes pertinentes selon votre profil.
          </p>

          <div className="text-[11px] text-blue-900/80 space-y-1 bg-white/70 p-2.5 rounded-lg border border-blue-200/50">
            {currentRole === "owner" && (
              <p>• <strong>Propriétaire :</strong> Finances globales, encaissements, impayés critiques, équipe & intégrité.</p>
            )}
            {currentRole === "director" && (
              <p>• <strong>Directeur :</strong> Situation financière, relances, échéances proches, activités de l&apos;école.</p>
            )}
            {currentRole === "accountant" && (
              <p>• <strong>Comptable :</strong> Encaissements, impayés, échéances, journal de caisse et imports comptables.</p>
            )}
            {currentRole === "secretary" && (
              <p>• <strong>Secrétaire :</strong> Nouveaux élèves, contacts parents, inscriptions et imports administratifs.</p>
            )}
          </div>
        </div>
      </div>

      {/* Events Coverage List */}
      <div className="space-y-3">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
          Événements surveillés par le moteur SCOLY
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              title: "Encaissements & Reçus",
              desc: "Alerte instantanée avec lien 1-clic vers le reçu de paiement.",
              priority: "Succès",
              color: "text-emerald-700 bg-emerald-50 border-emerald-100",
            },
            {
              title: "Impayés Critiques (> 15j)",
              desc: "Détection automatique des dossiers à relancer d'urgence.",
              priority: "Critique",
              color: "text-rose-700 bg-rose-50 border-rose-100",
            },
            {
              title: "Échéances Proches (3-7j)",
              desc: "Rappels proactifs avant la date limite pour sécuriser la trésorerie.",
              priority: "Alerte",
              color: "text-amber-700 bg-amber-50 border-amber-100",
            },
            {
              title: "Imports de données",
              desc: "Rapport de succès et détection des lignes à vérifier.",
              priority: "Info / Alerte",
              color: "text-indigo-700 bg-indigo-50 border-indigo-100",
            },
            {
              title: "Nouvelles inscriptions",
              desc: "Notification dès qu'un nouvel élève est enregistré.",
              priority: "Info",
              color: "text-blue-700 bg-blue-50 border-blue-100",
            },
            {
              title: "Anti-Spam & Agrégation",
              desc: "Regroupement intelligent des volumes pour éviter la saturation.",
              priority: "Automatique",
              color: "text-purple-700 bg-purple-50 border-purple-100",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border ${item.color} flex flex-col justify-between space-y-2`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-bold">{item.title}</h5>
                  <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-white/70">
                    {item.priority}
                  </span>
                </div>
                <p className="text-[11px] opacity-80 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
