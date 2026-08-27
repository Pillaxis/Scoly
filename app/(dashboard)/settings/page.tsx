"use client";

import React, { useState, useEffect } from "react";
import {
  School as SchoolIcon,
  Receipt,
  CheckCircle2,
  Save,
  RotateCcw,
  Shield,
  UserPlus,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Check,
  Calendar,
  Layers,
  Plus,
  CreditCard,
  X,
} from "lucide-react";
import { StaffMember, SchoolClass, Student } from "@/types/scoly";
import { StaffModal } from "@/components/settings/StaffModal";
import { ClassModal } from "@/components/classes/ClassModal";
import { DatabaseStatusCard } from "@/components/settings/DatabaseStatusCard";
import { useScoly } from "@/lib/store";

export default function SettingsPage() {
  const {
    school,
    academicYear,
    classes,
    students,
    staffMembers,
    paymentMethods,
    updateSchool,
    updateAcademicYear,
    deleteClass,
    deleteStaffMember,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    resetToDefaults,
  } = useScoly();

  // Form State: Starts empty if no custom school info exists
  const [name, setName] = useState(school.name || "");
  const [code, setCode] = useState(school.code || "");
  const [phone, setPhone] = useState(school.phone || "");
  const [email, setEmail] = useState(school.email || "");
  const [address, setAddress] = useState(school.address || "");
  const [city, setCity] = useState(school.city || "");
  const [country, setCountry] = useState(school.country || "");
  const [receiptPrefix, setReceiptPrefix] = useState(school.receipt_prefix || "");
  const [currency, setCurrency] = useState(school.currency || "FCFA");

  // Academic Year State (100% Personnalisable)
  const [yearName, setYearName] = useState(academicYear.name || "2025-2026");
  const [yearStartDate, setYearStartDate] = useState(academicYear.start_date || "2025-09-15");
  const [yearEndDate, setYearEndDate] = useState(academicYear.end_date || "2026-06-30");

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Class Modal State
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<SchoolClass | null>(null);
  const [classToDelete, setClassToDelete] = useState<SchoolClass | null>(null);
  const [classDeleteError, setClassDeleteError] = useState("");

  // Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

  // Payment Methods State
  const [newMethodLabel, setNewMethodLabel] = useState("");
  const [editingMethodKey, setEditingMethodKey] = useState<string | null>(null);
  const [editingMethodLabel, setEditingMethodLabel] = useState("");

  // Sync state when store updates
  useEffect(() => {
    setName(school.name || "");
    setCode(school.code || "");
    setPhone(school.phone || "");
    setEmail(school.email || "");
    setAddress(school.address || "");
    setCity(school.city || "");
    setCountry(school.country || "");
    setReceiptPrefix(school.receipt_prefix || "");
    setCurrency(school.currency || "FCFA");
    setYearName(academicYear.name || "2025-2026");
    setYearStartDate(academicYear.start_date || "2025-09-15");
    setYearEndDate(academicYear.end_date || "2026-06-30");
  }, [school, academicYear]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    updateSchool({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      receipt_prefix: receiptPrefix.trim() ? receiptPrefix.trim().toUpperCase() : "REC-25-",
      currency: currency.trim() ? currency.trim().toUpperCase() : "FCFA",
    });

    updateAcademicYear({
      name: yearName.trim() || "2025-2026",
      start_date: yearStartDate,
      end_date: yearEndDate,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleOpenCreateClass = () => {
    setClassToEdit(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (cls: SchoolClass) => {
    setClassToEdit(cls);
    setIsClassModalOpen(true);
  };

  const handleConfirmDeleteClass = () => {
    if (classToDelete) {
      try {
        deleteClass(classToDelete.id);
        setClassToDelete(null);
        setClassDeleteError("");
      } catch (err: any) {
        setClassDeleteError(err?.message || "Erreur lors de la suppression de la classe.");
      }
    }
  };

  const handleOpenInviteStaff = () => {
    setStaffToEdit(null);
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (member: StaffMember) => {
    setStaffToEdit(member);
    setIsStaffModalOpen(true);
  };

  const handleConfirmDeleteStaff = () => {
    if (staffToDelete) {
      deleteStaffMember(staffToDelete.id);
      setStaffToDelete(null);
    }
  };

  const handleResetData = () => {
    if (
      confirm(
        "Êtes-vous sûr de vouloir réinitialiser l'application ? Cette action effacera toutes les données locales."
      )
    ) {
      resetToDefaults();
      setSavedSuccess(false);
      alert("Application réinitialisée.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* En-tête Sobre */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Paramètres de l&apos;Établissement
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Coordonnées officielles de votre école, numérotation des reçus et gestion de l&apos;équipe.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in duration-150">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Modifications enregistrées avec succès !</span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {/* Section Base de Données & Supabase Live Status */}
        <DatabaseStatusCard />

        {/* Formulaire de Coordonnées & Reçus */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 1 : Informations Officielles de l'École */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
                  <SchoolIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Coordonnées de l&apos;Établissement</h2>
                  <p className="text-[11px] text-slate-400">Ces informations apparaîtront sur tous les reçus de caisse</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Nom Officiel de l&apos;Établissement *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Complexe Scolaire Saint-Joseph"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Code Établissement
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: CS-ST-JOSEPH"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Téléphone Direct / Caisse *
                  </label>
                  <input
                    type="tel"
                    placeholder="Ex: +228 90 12 34 56"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email de Contact (Optionnel)
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: direction@saintjoseph.tg"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Adresse / Quartier
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Rue des Écoles, Quartier Administratif"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ville
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Lomé"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pays
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Togo"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2 : Année Scolaire & Calendrier (100% Personnalisable) */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Année Scolaire & Calendrier</h2>
                    <p className="text-[11px] text-slate-400">Période académique active et dates de gestion</p>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Libellé de l&apos;Année *
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 2025-2026"
                    value={yearName}
                    onChange={(e) => setYearName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Date de Rentrée / Début *
                  </label>
                  <input
                    type="date"
                    value={yearStartDate}
                    onChange={(e) => setYearStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Date de Clôture / Fin *
                  </label>
                  <input
                    type="date"
                    value={yearEndDate}
                    onChange={(e) => setYearEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                <span>Année configurée pour les calculs :</span>
                <strong className="font-mono text-emerald-700 font-extrabold">
                  {yearName || "2025-2026"} ({yearStartDate} au {yearEndDate})
                </strong>
              </div>
            </div>

            {/* Section 3 : Format des Reçus & Devise */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between lg:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Format des Reçus & Caisse</h2>
                    <p className="text-[11px] text-slate-400">Numérotation automatique et monnaie officielle</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Devise de Gestion *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: FCFA"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Préfixe des Reçus
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: REC-25-"
                      value={receiptPrefix}
                      onChange={(e) => setReceiptPrefix(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                  <span>Aperçu de numérotation générée :</span>
                  <strong className="font-mono text-blue-700 font-black">
                    {receiptPrefix || "REC-25-"}00001
                  </strong>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Enregistrer les Paramètres</span>
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Section : Moyens de Paiement Configurables */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Moyens de Paiement</h2>
              <p className="text-[11px] text-slate-400">Configurez les modes de règlement acceptés par votre établissement</p>
            </div>
          </div>

          {/* Liste des moyens existants */}
          <div className="space-y-2">
            {paymentMethods.map((method) => (
              <div
                key={method.key}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5 bg-slate-50/80 border border-slate-200/80 rounded-xl group hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${method.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  {editingMethodKey === method.key ? (
                    <input
                      type="text"
                      value={editingMethodLabel}
                      onChange={(e) => setEditingMethodLabel(e.target.value)}
                      onBlur={() => {
                        if (editingMethodLabel.trim()) {
                          updatePaymentMethod(method.key, { label: editingMethodLabel.trim() });
                        }
                        setEditingMethodKey(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingMethodLabel.trim()) {
                            updatePaymentMethod(method.key, { label: editingMethodLabel.trim() });
                          }
                          setEditingMethodKey(null);
                        }
                        if (e.key === 'Escape') setEditingMethodKey(null);
                      }}
                      autoFocus
                      className="px-2 py-1 bg-white border border-blue-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-900">{method.label}</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Toggle active */}
                  <button
                    type="button"
                    onClick={() => updatePaymentMethod(method.key, { is_active: !method.is_active })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors cursor-pointer ${
                      method.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {method.is_active ? 'Actif' : 'Inactif'}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMethodKey(method.key);
                      setEditingMethodLabel(method.label);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>

                  {/* Delete (only custom methods, not default ones) */}
                  {!['cash'].includes(method.key) && (
                    <button
                      type="button"
                      onClick={() => deletePaymentMethod(method.key)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Ajouter un moyen */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Nouveau moyen de paiement..."
              value={newMethodLabel}
              onChange={(e) => setNewMethodLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newMethodLabel.trim()) {
                  addPaymentMethod(newMethodLabel);
                  setNewMethodLabel('');
                }
              }}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={() => {
                if (newMethodLabel.trim()) {
                  addPaymentMethod(newMethodLabel);
                  setNewMethodLabel('');
                }
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        {/* Section 3 : Gestion Intelligente des Rôles & Permissions de l'Équipe */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Rôles & Permissions de l&apos;Équipe ({staffMembers.length})
                </h2>
                <p className="text-[11px] text-slate-400">
                  Invitez des comptables ou secrétaires et définissez précisément leurs actions autorisées
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenInviteStaff}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Inviter un Collaborateur</span>
            </button>
          </div>

          {/* Liste des Membres de l'Équipe */}
          <div className="space-y-3">
            {staffMembers.map((member: StaffMember) => {
              const isOwner = member.role === "directeur";
              const perms = member.permissions;

              return (
                <div
                  key={member.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  {/* Info Collaborateur */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                        isOwner
                          ? "bg-slate-900 text-white"
                          : member.role === "comptable"
                          ? "bg-blue-600 text-white"
                          : "bg-emerald-600 text-white"
                      }`}
                    >
                      {member.full_name
                        ? member.full_name
                            .split(" ")
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()
                        : "AD"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {member.full_name || "Directeur Général"}
                        </h4>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isOwner
                              ? "bg-slate-900 text-white"
                              : member.role === "comptable"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isOwner
                            ? "Directeur (Propriétaire)"
                            : member.role === "comptable"
                            ? "Comptable / Caissier"
                            : "Secrétaire"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500 text-[11px] mt-1">
                        {member.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {member.email}
                          </span>
                        )}
                        {member.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {member.phone}
                          </span>
                        )}
                        {!member.email && !member.phone && isOwner && (
                          <span>Compte principal administrateur</span>
                        )}
                      </div>

                      {/* Badges de Permissions Actives */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        <span className="text-[10px] font-bold text-slate-400 mr-1">
                          Actions autorisées :
                        </span>
                        {perms.can_collect_payments && (
                          <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            ✓ Encaissements & Reçus
                          </span>
                        )}
                        {perms.can_manage_students && (
                          <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            ✓ Inscriptions Élèves
                          </span>
                        )}
                        {perms.can_send_reminders && (
                          <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            ✓ Relances WhatsApp
                          </span>
                        )}
                        {perms.can_view_financial_stats && (
                          <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            ✓ Trésorerie
                          </span>
                        )}
                        {perms.can_manage_tuition && (
                          <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            ✓ Grilles Tarifaires
                          </span>
                        )}
                        {perms.can_manage_settings && (
                          <span className="text-[10px] font-semibold bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded">
                            ✓ Paramètres
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions sur le membre */}
                  {!isOwner && (
                    <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                      {/* Envoi direct WhatsApp si numéro présent */}
                      {member.phone && member.phone.trim().length >= 8 && (
                        <a
                          href={`https://wa.me/${member.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                            `Bonjour ${member.full_name},\n\nVous êtes invité(e) par la Direction à rejoindre l'espace de gestion de *${
                              school.name || "notre établissement scolaire"
                            }* sur SCOLY en tant que *${
                              member.role === "comptable" ? "Comptable / Caissier" : "Secrétaire"
                            }*.\n\n👉 Accédez directement à votre espace ici : ${
                              typeof window !== "undefined" ? window.location.origin : "https://scoly.app"
                            }\n\nCordialement,\nLa Direction.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Envoyer l'invitation par WhatsApp"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      )}

                      {/* Envoi direct Email si adresse présente */}
                      {member.email && member.email.trim().includes("@") && (
                        <a
                          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                            member.email.trim()
                          )}&su=${encodeURIComponent(
                            `Invitation à rejoindre l'espace de gestion scolaire — ${school.name || "SCOLY"}`
                          )}&body=${encodeURIComponent(
                            `Bonjour ${member.full_name},\n\nVous êtes invité(e) par la Direction à rejoindre l'espace de gestion de ${
                              school.name || "notre établissement scolaire"
                            } sur SCOLY en tant que ${
                              member.role === "comptable" ? "Comptable / Caissier" : "Secrétaire"
                            }.\n\nAccédez à votre espace sécurisé ici :\n${
                              typeof window !== "undefined" ? window.location.origin : "https://scoly.app"
                            }\n\nCordialement,\nLa Direction.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          title="Envoyer l'invitation par Email (Gmail / Web)"
                        >
                          <Mail className="w-3 h-3 text-blue-600" />
                          <span>Email</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditStaff(member)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Modifier</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStaffToDelete(member)}
                        className="p-1.5 bg-white hover:bg-rose-50 border border-slate-200 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Retirer ce collaborateur"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 4 : Classes & Niveaux de l'Établissement */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  Classes & Niveaux de l&apos;Établissement
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  {classes.length} classe(s)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Enregistrez et personnalisez les classes de l&apos;école (Maternelle, Primaire, Collège, Lycée avec séries, Supérieur avec filières...).
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateClass}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter une Classe</span>
            </button>
          </div>

          {/* Grille des Classes de l'établissement */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((cls: SchoolClass) => {
              const studentCount = students.filter((s: Student) => s.class_id === cls.id).length;

              return (
                <div
                  key={cls.id}
                  className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 group hover:border-blue-200 hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-blue-700 font-bold text-xs shrink-0 shadow-2xs group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                          {cls.name}
                        </h4>
                        {cls.is_custom && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded">
                            Personnalisée
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {cls.level}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {studentCount} élève(s)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditClass(cls)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Modifier cette classe"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClassDeleteError("");
                        setClassToDelete(cls);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer cette classe"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5 : Maintenance du Système (Sobre) */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Maintenance des Données
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Toutes vos données (élèves, paiements, grilles, classes, équipe) sont sécurisées en mémoire locale.
            </p>
          </div>

          <button
            type="button"
            onClick={handleResetData}
            className="inline-flex items-center gap-2 py-2 px-3 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser les données locales</span>
          </button>
        </div>
      </div>

      {/* Modal d'Ajout / Modification Classe */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => {
          setIsClassModalOpen(false);
          setClassToEdit(null);
        }}
        classToEdit={classToEdit}
      />

      {/* Modal de Confirmation de Suppression Classe */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Supprimer la Classe</h3>

            {classDeleteError ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {classDeleteError}
              </div>
            ) : (
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                Êtes-vous sûr de vouloir supprimer définitivement la classe <strong>{classToDelete.name}</strong> ({classToDelete.level}) ?
              </p>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setClassToDelete(null);
                  setClassDeleteError("");
                }}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                {classDeleteError ? "Fermer" : "Annuler"}
              </button>

              {!classDeleteError && (
                <button
                  type="button"
                  onClick={handleConfirmDeleteClass}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
                >
                  Confirmer la Suppression
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal d'Invitation / Modification Collaborateur */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => {
          setIsStaffModalOpen(false);
          setStaffToEdit(null);
        }}
        staffToEdit={staffToEdit}
      />

      {/* Modal de Confirmation de Suppression Collaborateur */}
      {staffToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Retirer ce Collaborateur</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Êtes-vous sûr de vouloir retirer <strong>{staffToDelete.full_name}</strong> de l&apos;équipe ?
              Ses accès à SCOLY seront immédiatement révoqués.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setStaffToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteStaff}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition-colors cursor-pointer"
              >
                Confirmer le Retrait
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
