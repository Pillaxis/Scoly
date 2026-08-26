"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Shield,
  User,
  Mail,
  Phone,
  Check,
  Send,
  MessageCircle,
  ExternalLink,
  Copy,
  ChevronDown,
} from "lucide-react";
import { StaffMember, StaffRole, StaffPermission } from "@/types/scoly";
import { useScoly } from "@/lib/store";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffToEdit?: StaffMember | null;
  onSuccess?: () => void;
}

const DEFAULT_ROLE_PERMISSIONS: Record<StaffRole, StaffPermission> = {
  directeur: {
    can_collect_payments: true,
    can_manage_students: true,
    can_manage_tuition: true,
    can_send_reminders: true,
    can_view_financial_stats: true,
    can_manage_settings: true,
  },
  comptable: {
    can_collect_payments: true,
    can_manage_students: false,
    can_manage_tuition: false,
    can_send_reminders: true,
    can_view_financial_stats: true,
    can_manage_settings: false,
  },
  secretaire: {
    can_collect_payments: false,
    can_manage_students: true,
    can_manage_tuition: false,
    can_send_reminders: false,
    can_view_financial_stats: false,
    can_manage_settings: false,
  },
};

export function StaffModal({ isOpen, onClose, staffToEdit, onSuccess }: StaffModalProps) {
  const { school, inviteStaffMember, updateStaffMember } = useScoly();

  const isEditing = Boolean(staffToEdit);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<StaffRole>("comptable");
  const [permissions, setPermissions] = useState<StaffPermission>(DEFAULT_ROLE_PERMISSIONS.comptable);

  const [showEmailOptions, setShowEmailOptions] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staffToEdit) {
      setFullName(staffToEdit.full_name);
      setEmail(staffToEdit.email || "");
      setPhone(staffToEdit.phone || "");
      setRole(staffToEdit.role);
      setPermissions(staffToEdit.permissions);
      setShowEmailOptions(false);
      setError("");
    } else {
      setFullName("");
      setEmail("");
      setPhone("");
      setRole("comptable");
      setPermissions(DEFAULT_ROLE_PERMISSIONS.comptable);
      setShowEmailOptions(false);
      setError("");
    }
  }, [staffToEdit, isOpen]);

  // When changing role in create mode, auto-suggest standard permissions
  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    if (!isEditing) {
      setPermissions(DEFAULT_ROLE_PERMISSIONS[newRole]);
    }
  };

  const togglePermission = (key: keyof StaffPermission) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate clear formatted invitation message
  const buildInvitationMessage = () => {
    const roleTitle =
      role === "comptable"
        ? "Comptable / Caissier"
        : role === "secretaire"
        ? "Secrétaire"
        : "Collaborateur";

    const allowedList: string[] = [];
    if (permissions.can_collect_payments) allowedList.push("• Encaissements & émission des reçus officiels");
    if (permissions.can_manage_students) allowedList.push("• Inscription des élèves & gestion des fiches scolaires");
    if (permissions.can_send_reminders) allowedList.push("• Envoi des relances de paiement WhatsApp aux parents");
    if (permissions.can_view_financial_stats) allowedList.push("• Consultation de la trésorerie et du chiffre d'affaires");
    if (permissions.can_manage_tuition) allowedList.push("• Définition des grilles tarifaires et échéances");
    if (permissions.can_manage_settings) allowedList.push("• Accès aux paramètres de l'établissement");

    const appUrl = typeof window !== "undefined" ? window.location.origin : "https://scoly.app";

    return `Bonjour ${fullName || "Collaborateur"},\n\nVous êtes invité(e) par la Direction à rejoindre l'espace de gestion de *${
      school.name || "notre établissement scolaire"
    }* sur SCOLY en tant que *${roleTitle}*.\n\nVos accès et actions autorisés :\n${allowedList.join(
      "\n"
    )}\n\n👉 Accédez directement à votre espace ici : ${appUrl}\n\nCordialement,\nLa Direction.`;
  };

  const hasPhone = phone.trim().length >= 8;
  const hasEmail = email.trim().includes("@");

  const handleSendWhatsApp = () => {
    if (!hasPhone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const text = buildInvitationMessage();
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleSendEmailProvider = (provider: "gmail" | "outlook" | "mailto") => {
    if (!hasEmail) return;
    const text = buildInvitationMessage();
    const subject = `Invitation à rejoindre l'espace de gestion scolaire — ${school.name || "SCOLY"}`;
    const targetEmail = email.trim();

    if (provider === "gmail") {
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
        targetEmail
      )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    } else if (provider === "outlook") {
      const url = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(
        targetEmail
      )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    } else {
      // Default mailto fallback using dynamic anchor
      const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(text)}`;
      const link = document.createElement("a");
      link.href = mailtoUrl;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleCopyMessage = () => {
    const text = buildInvitationMessage();
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Veuillez renseigner le nom et prénom du collaborateur.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError("Veuillez renseigner au moins un email ou un numéro WhatsApp pour l'invitation.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (staffToEdit) {
        updateStaffMember(staffToEdit.id, {
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          permissions,
        });
      } else {
        inviteStaffMember({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          permissions,
        });
      }

      setIsSubmitting(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError("Erreur lors de l'enregistrement du collaborateur.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh] sm:max-h-[90vh]">
        {/* Header Sobre */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                {isEditing ? "Modifier les Permissions" : "Inviter un Collaborateur"}
              </h2>
              <p className="text-xs text-slate-500">
                Attribution des accès et transmission de l&apos;invitation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form id="staff-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in duration-150">
              {error}
            </div>
          )}

          {/* 1. Informations Collaborateur */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-800">
              1. Identité du Collaborateur *
            </label>

            <div>
              <input
                type="text"
                placeholder="Nom & Prénom (ex: Kossi Amouzou)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email (ex: comptable@ecole.tg)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <input
                  type="tel"
                  placeholder="WhatsApp (ex: +228 90 11 22 33)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Rôle Attribué */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              2. Rôle dans l&apos;Établissement *
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleRoleChange("comptable")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === "comptable"
                    ? "bg-blue-50/80 border-blue-500 text-blue-950 ring-1 ring-blue-500 shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Comptable / Caissier</span>
                  {role === "comptable" && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Gestion des encaissements, reçus et relances de paiement
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("secretaire")}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  role === "secretaire"
                    ? "bg-blue-50/80 border-blue-500 text-blue-950 ring-1 ring-blue-500 shadow-2xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs">Secrétaire</span>
                  {role === "secretaire" && <Check className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Inscriptions des élèves et gestion des fiches scolaires
                </p>
              </button>
            </div>
          </div>

          {/* 3. Permissions Granulaires */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                3. Actions & Permissions Autorisées *
              </label>
              <span className="text-[11px] text-slate-400">Cocher / décocher</span>
            </div>

            <div className="space-y-2">
              {[
                {
                  key: "can_collect_payments" as keyof StaffPermission,
                  title: "Encaisser & Émettre des Reçus de Caisse",
                  desc: "Autorise la saisie de versements et la génération des reçus officiels",
                },
                {
                  key: "can_manage_students" as keyof StaffPermission,
                  title: "Inscrire des Élèves & Modifier les Fiches",
                  desc: "Autorise l'ajout, la modification et la gestion des élèves et parents",
                },
                {
                  key: "can_send_reminders" as keyof StaffPermission,
                  title: "Envoyer les Relances WhatsApp aux Parents",
                  desc: "Autorise la génération et l'envoi de messages de relance pour impayés",
                },
                {
                  key: "can_view_financial_stats" as keyof StaffPermission,
                  title: "Consulter la Trésorerie & Chiffre d'Affaires",
                  desc: "Donne accès aux métriques financières globales et au montant total encaissé",
                },
                {
                  key: "can_manage_tuition" as keyof StaffPermission,
                  title: "Configurer les Grilles Tarifaires des Classes",
                  desc: "Autorise la création et modification des montants de scolarité et tranches",
                },
                {
                  key: "can_manage_settings" as keyof StaffPermission,
                  title: "Accéder aux Paramètres Généraux de l'École",
                  desc: "Autorise la modification des coordonnées et la gestion de l'équipe",
                },
              ].map((item) => {
                const isChecked = permissions[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => togglePermission(item.key)}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                      isChecked
                        ? "bg-slate-50 border-slate-300"
                        : "bg-white border-slate-200/70 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by parent div
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-0.5 pointer-events-none"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-900">{item.title}</p>
                      <p className="text-[11px] text-slate-500 leading-tight mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Options d'Envoi Direct de l'Invitation (Conditionnelles) */}
          {(hasPhone || hasEmail) && (
            <div className="pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-800">
                  4. Transmettre l&apos;Invitation Maintenant
                </label>
                {copiedNotification && (
                  <span className="text-[11px] text-emerald-700 font-bold animate-in fade-in">
                    ✓ Message copié !
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Option WhatsApp : Uniquement si numéro renseigné */}
                {hasPhone && (
                  <button
                    type="button"
                    onClick={handleSendWhatsApp}
                    className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#075E54] border border-[#25D366]/40 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
                    <span>Envoyer via WhatsApp</span>
                  </button>
                )}

                {/* Option Email : Uniquement si email renseigné */}
                {hasEmail && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => handleSendEmailProvider("gmail")}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Envoyer par Email (Gmail / Web)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Sous-options Email & Copie si email renseigné */}
              {hasEmail && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-medium">Autres options Email :</span>
                  <button
                    type="button"
                    onClick={() => handleSendEmailProvider("outlook")}
                    className="text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Outlook Web
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSendEmailProvider("mailto")}
                    className="text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                  >
                    Application Mailto
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copier texte</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Sticky Footer */}
        <div className="p-4 bg-slate-50/95 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>

          <button
            type="submit"
            form="staff-form"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? "Enregistrement..."
                : isEditing
                ? "Mettre à Jour les Permissions"
                : "Enregistrer & Inviter"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
