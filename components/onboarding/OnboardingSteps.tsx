"use client";

import React, { useState, useMemo } from "react";
import {
  School as SchoolIcon,
  Building2,
  Calendar,
  Layers,
  GraduationCap,
  Users,
  Bell,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  FileText,
  Camera,
  ShieldCheck,
  Sparkles,
  Calculator,
  X,
  Mail,
  UserPlus,
} from "lucide-react";
import { School, AcademicYear, SchoolClass, TuitionPlan, StaffRole, TuitionInstallment } from "@/types/scoly";
import { ImportModal } from "@/components/import/ImportModal";
import { ImportSourceType } from "@/types/import";

interface StepProps {
  school: School;
  setSchool: React.Dispatch<React.SetStateAction<School>>;
  academicYear: AcademicYear;
  setAcademicYear: React.Dispatch<React.SetStateAction<AcademicYear>>;
  classes: SchoolClass[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  tuitionPlans: TuitionPlan[];
  setTuitionPlans: React.Dispatch<React.SetStateAction<TuitionPlan[]>>;
  invitedUsers: { name: string; email: string; role: StaffRole }[];
  setInvitedUsers: React.Dispatch<React.SetStateAction<{ name: string; email: string; role: StaffRole }[]>>;
  studentsCount: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 1 : MON ÉTABLISSEMENT
// ─────────────────────────────────────────────────────────────────────────────
export function Step1SchoolInfo({ school, setSchool }: { school: School; setSchool: React.Dispatch<React.SetStateAction<School>> }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Parlez-nous de votre établissement
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Ces coordonnées officielles figureront sur l&apos;ensemble de vos reçus de caisse et documents administratifs.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Nom de l'établissement */}
        <div className="sm:col-span-2">
          <label className="block font-bold text-slate-700 mb-1.5">
            Nom de l&apos;Établissement <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <SchoolIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Ex: Complexe Scolaire Lumière d'Afrique"
              value={school.name || ""}
              onChange={(e) => setSchool((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs"
            />
          </div>
        </div>

        {/* Téléphone */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Téléphone principal <span className="text-slate-400 font-normal">(WhatsApp / Appel)</span>
          </label>
          <input
            type="tel"
            placeholder="Ex: +228 90 12 34 56"
            value={school.phone || ""}
            onChange={(e) => setSchool((prev) => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Adresse email officielle
          </label>
          <input
            type="email"
            placeholder="Ex: direction@mon-ecole.tg"
            value={school.email || ""}
            onChange={(e) => setSchool((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs"
          />
        </div>

        {/* Adresse / Quartier */}
        <div className="sm:col-span-2">
          <label className="block font-bold text-slate-700 mb-1.5">
            Adresse / Quartier
          </label>
          <input
            type="text"
            placeholder="Ex: Boulevard du 13 Janvier, Quartier Administratif"
            value={school.address || ""}
            onChange={(e) => setSchool((prev) => ({ ...prev, address: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs"
          />
        </div>

        {/* Ville & Pays */}
        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Ville
          </label>
          <input
            type="text"
            placeholder="Ex: Lomé"
            value={school.city || ""}
            onChange={(e) => setSchool((prev) => ({ ...prev, city: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            Pays
          </label>
          <input
            type="text"
            placeholder="Ex: Togo"
            value={school.country || ""}
            onChange={(e) => setSchool((prev) => ({ ...prev, country: e.target.value }))}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs"
          />
        </div>

        {/* Logo URL (Facultatif) */}
        <div className="sm:col-span-2 pt-2">
          <label className="block font-bold text-slate-700 mb-1.5">
            Logo de l&apos;école <span className="text-slate-400 font-normal">(facultatif)</span>
          </label>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-bold shrink-0 overflow-hidden">
              {school.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={school.logo_url} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-5 h-5 text-slate-400" />
              )}
            </div>
            <input
              type="url"
              placeholder="Ex: https://monsite.com/logo.png"
              value={school.logo_url || ""}
              onChange={(e) => setSchool((prev) => ({ ...prev, logo_url: e.target.value }))}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-normal text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 2 : TYPE D'ÉTABLISSEMENT
// ─────────────────────────────────────────────────────────────────────────────
export function Step2EducationType({ school, setSchool }: { school: School; setSchool: React.Dispatch<React.SetStateAction<School>> }) {
  const typesList = [
    { id: "Maternelle", label: "Maternelle", desc: "Petite, Moyenne et Grande Section" },
    { id: "Primaire", label: "Primaire", desc: "CP1, CP2, CE1, CE2, CM1, CM2" },
    { id: "Collège", label: "Collège", desc: "6ème, 5ème, 4ème, 3ème" },
    { id: "Lycée", label: "Lycée", desc: "Seconde, Première, Terminale (Général & Technique)" },
    { id: "Universitaire", label: "Universitaire / Supérieur", desc: "Licence, Master, BTS" },
    { id: "Plusieurs niveaux", label: "Complexe multi-niveaux", desc: "Tous cycles confondus" },
  ];

  const currentTypes = school.education_types || [];

  const toggleType = (id: string) => {
    setSchool((prev) => {
      const exists = (prev.education_types || []).includes(id);
      const nextTypes = exists
        ? (prev.education_types || []).filter((t) => t !== id)
        : [...(prev.education_types || []), id];
      return { ...prev, education_types: nextTypes };
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Quel type d&apos;établissement gérez-vous ?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Sélectionnez les niveaux d&apos;enseignement dispensés dans votre école. Plusieurs choix possibles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {typesList.map((item) => {
          const isSelected = currentTypes.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => toggleType(item.id)}
              className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                isSelected
                  ? "bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-extrabold ${isSelected ? "text-blue-900" : "text-slate-900"}`}>
                    {item.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {item.desc}
                </p>
              </div>

              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                  isSelected ? "bg-blue-600 text-white" : "border border-slate-300 bg-white"
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 3 : ANNÉE SCOLAIRE
// ─────────────────────────────────────────────────────────────────────────────
export function Step3AcademicYear({
  academicYear,
  setAcademicYear,
}: {
  academicYear: AcademicYear;
  setAcademicYear: React.Dispatch<React.SetStateAction<AcademicYear>>;
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Quelle est votre année scolaire ?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Définissez la période académique active sur laquelle enregistrer vos inscriptions et encaissements.
        </p>
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Nom de l&apos;Année Scolaire *
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Ex: 2025-2026"
              value={academicYear.name || ""}
              onChange={(e) => setAcademicYear((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Date de Début (Rentrée)
            </label>
            <input
              type="date"
              value={academicYear.start_date || ""}
              onChange={(e) => setAcademicYear((prev) => ({ ...prev, start_date: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Date de Clôture (Fin d&apos;année)
            </label>
            <input
              type="date"
              value={academicYear.end_date || ""}
              onChange={(e) => setAcademicYear((prev) => ({ ...prev, end_date: e.target.value }))}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-xs font-bold text-emerald-800">
            Cette année scolaire sera configurée comme l&apos;année active par défaut.
          </span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 4 : CLASSES
// ─────────────────────────────────────────────────────────────────────────────
export function Step4Classes({
  classes,
  setClasses,
  school,
}: {
  classes: SchoolClass[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  school: School;
}) {
  const [newClassName, setNewClassName] = useState("");
  const [newClassLevel, setNewClassLevel] = useState("Primaire");

  const handleAddClass = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newClassName.trim()) return;

    const newClass: SchoolClass = {
      id: "cls-" + crypto.randomUUID().slice(0, 8),
      school_id: school.id,
      academic_year_id: "current",
      name: newClassName.trim(),
      level: newClassLevel,
      order_index: classes.length + 1,
    };

    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
  };

  const handleRemoveClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  // Quick Preset Adders
  const addPresetCycle = (presetClasses: { name: string; level: string }[]) => {
    const toAdd: SchoolClass[] = [];
    presetClasses.forEach((p) => {
      if (!classes.some((c) => c.name.toLowerCase() === p.name.toLowerCase())) {
        toAdd.push({
          id: "cls-" + crypto.randomUUID().slice(0, 8),
          school_id: school.id,
          academic_year_id: "current",
          name: p.name,
          level: p.level,
          order_index: classes.length + toAdd.length + 1,
        });
      }
    });
    if (toAdd.length > 0) {
      setClasses((prev) => [...prev, ...toAdd]);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Ajoutez vos classes
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Ajoutez rapidement les classes de votre établissement. Vous pourrez en ajouter d&apos;autres à tout moment.
        </p>
      </div>

      {/* Quick Preset Buttons */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Suggestions rapides en 1 clic :
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              addPresetCycle([
                { name: "Petite Section", level: "Maternelle" },
                { name: "Moyenne Section", level: "Maternelle" },
                { name: "Grande Section", level: "Maternelle" },
              ])
            }
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            + Maternelle (PS, MS, GS)
          </button>
          <button
            type="button"
            onClick={() =>
              addPresetCycle([
                { name: "CP", level: "Primaire" },
                { name: "CE1", level: "Primaire" },
                { name: "CE2", level: "Primaire" },
                { name: "CM1", level: "Primaire" },
                { name: "CM2", level: "Primaire" },
              ])
            }
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            + Primaire (CP à CM2)
          </button>
          <button
            type="button"
            onClick={() =>
              addPresetCycle([
                { name: "6ème A", level: "Collège" },
                { name: "5ème A", level: "Collège" },
                { name: "4ème A", level: "Collège" },
                { name: "3ème A", level: "Collège" },
              ])
            }
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            + Collège (6ème à 3ème)
          </button>
          <button
            type="button"
            onClick={() =>
              addPresetCycle([
                { name: "2nde CD", level: "Lycée" },
                { name: "1ère D", level: "Lycée" },
                { name: "Terminale D", level: "Lycée" },
              ])
            }
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all cursor-pointer"
          >
            + Lycée (2nde à Terminale)
          </button>
        </div>
      </div>

      {/* Add Custom Class Form */}
      <form onSubmit={handleAddClass} className="flex gap-2">
        <input
          type="text"
          placeholder="Ex: 6ème B, Terminale A4..."
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
        />
        <select
          value={newClassLevel}
          onChange={(e) => setNewClassLevel(e.target.value)}
          className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
        >
          <option value="Maternelle">Maternelle</option>
          <option value="Primaire">Primaire</option>
          <option value="Collège">Collège</option>
          <option value="Lycée">Lycée</option>
          <option value="Supérieur">Supérieur</option>
        </select>
        <button
          type="submit"
          disabled={!newClassName.trim()}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter</span>
        </button>
      </form>

      {/* Classes List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Classes configurées ({classes.length})
          </span>
          {classes.length > 0 && (
            <button
              type="button"
              onClick={() => setClasses([])}
              className="text-[11px] text-rose-600 hover:underline font-semibold cursor-pointer"
            >
              Tout effacer
            </button>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
            Aucune classe ajoutée pour le moment. Utilisez les boutons rapides ou le formulaire ci-dessus.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs group hover:border-slate-300 transition-all"
              >
                <div>
                  <p className="text-xs font-extrabold text-slate-900 truncate max-w-[110px]">
                    {cls.name}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {cls.level}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveClass(cls.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Supprimer la classe"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 5 : SCOLARITÉ & TRANCHES (AVEC CALCUL ET BLOCAGE MATHÉMATIQUE STRICT)
// ─────────────────────────────────────────────────────────────────────────────
export function Step5TuitionPlans({
  classes,
  tuitionPlans,
  setTuitionPlans,
  currency = "FCFA",
  onValidityChange,
}: {
  classes: SchoolClass[];
  tuitionPlans: TuitionPlan[];
  setTuitionPlans: React.Dispatch<React.SetStateAction<TuitionPlan[]>>;
  currency?: string;
  onValidityChange?: (isValid: boolean) => void;
}) {
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || "default");
  const [annualAmount, setAnnualAmount] = useState<number>(0);
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [installments, setInstallments] = useState<TuitionInstallment[]>([]);

  // Calculate sum of installments
  const totalInstallmentsSum = useMemo(() => {
    return installments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [installments]);

  const diff = totalInstallmentsSum - annualAmount;
  const isMatch = (annualAmount === 0 && installments.length === 0) || (annualAmount > 0 && Math.abs(diff) < 0.01);

  // Inform parent about mathematical validity
  React.useEffect(() => {
    if (onValidityChange) {
      onValidityChange(isMatch);
    }
  }, [isMatch, onValidityChange]);

  // Helper: auto split equal amounts
  const handleAutoSplit = (count: number, total: number) => {
    if (total <= 0) {
      setInstallments([]);
      return;
    }
    const base = Math.floor(total / count);
    const remainder = total - base * count;

    const dates = ["2025-10-05", "2026-01-10", "2026-04-10", "2026-05-15"];
    const nextInst: TuitionInstallment[] = [];

    for (let i = 1; i <= count; i++) {
      const isFirst = i === 1;
      const amt = isFirst ? base + remainder : base;
      nextInst.push({
        id: `inst-${i}`,
        tuition_plan_id: "plan-1",
        title: i === 1 ? "1ère Tranche (Rentrée)" : i === count ? `${i}ème Tranche (Solde)` : `${i}ème Tranche`,
        due_date: dates[i - 1] || "",
        amount: amt,
        installment_order: i,
      });
    }

    setInstallments(nextInst);
  };

  const handleInstallmentCountChange = (newCount: number) => {
    setInstallmentCount(newCount);
    if (annualAmount > 0) {
      handleAutoSplit(newCount, annualAmount);
    }
  };

  const handleAddManualInstallment = () => {
    const nextOrder = installments.length + 1;
    setInstallments((prev) => [
      ...prev,
      {
        id: `inst-${Date.now()}-${nextOrder}`,
        tuition_plan_id: "plan-1",
        title: nextOrder === 1 ? "1ère Tranche (Rentrée)" : `${nextOrder}ème Tranche`,
        due_date: "",
        amount: 0,
        installment_order: nextOrder,
      },
    ]);
  };

  const handleRemoveInstallment = (id: string) => {
    setInstallments((prev) => prev.filter((i) => i.id !== id));
  };

  const handleInstallmentAmountChange = (idx: number, newAmt: number) => {
    setInstallments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], amount: newAmt };
      return next;
    });
  };

  const handleSaveCurrentPlan = () => {
    if (!isMatch || installments.length === 0) return;

    const targetClasses = selectedClassId === "all" ? classes : classes.filter((c) => c.id === selectedClassId);

    setTuitionPlans((prev) => {
      let next = [...prev];
      targetClasses.forEach((cls) => {
        next = next.filter((p) => p.class_id !== cls.id);
        next.push({
          id: "plan-" + cls.id,
          school_id: cls.school_id,
          academic_year_id: "current",
          class_id: cls.id,
          class_name: cls.name,
          total_amount: annualAmount || totalInstallmentsSum,
          installments: installments.map((inst, i) => ({
            ...inst,
            id: `inst-${cls.id}-${i + 1}`,
            tuition_plan_id: "plan-" + cls.id,
          })),
        });
      });
      return next;
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Configurez vos frais de scolarité
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Fixez le montant annuel et l&apos;échéancier des tranches de paiement selon vos besoins.
        </p>
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
        {/* Selection de classe & montant annuel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Classe concernée
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="all">Toutes les classes (Tarif unique)</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.level})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Scolarité annuelle ({currency})
            </label>
            <input
              type="number"
              value={annualAmount === 0 ? "" : annualAmount}
              placeholder="Ex: 150 000"
              onChange={(e) => {
                const val = Number(e.target.value) || 0;
                setAnnualAmount(val);
                if (val > 0) {
                  handleAutoSplit(installmentCount, val);
                } else {
                  setInstallments([]);
                }
              }}
              min={1000}
              step={1000}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nombre de tranches par défaut
            </label>
            <select
              value={installmentCount}
              onChange={(e) => handleInstallmentCountChange(Number(e.target.value))}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value={1}>1 versement unique (Comptant)</option>
              <option value={2}>2 tranches (Semestriel)</option>
              <option value={3}>3 tranches (Trimestriel)</option>
              <option value={4}>4 tranches</option>
            </select>
          </div>
        </div>

        {/* Tranches configurables */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Détail des échéances ({installments.length}) :
            </span>
            <div className="flex items-center gap-3">
              {annualAmount > 0 && (
                <button
                  type="button"
                  onClick={() => handleAutoSplit(installmentCount, annualAmount)}
                  className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Répartir équitablement</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleAddManualInstallment}
                className="text-[11px] text-blue-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter une tranche</span>
              </button>
            </div>
          </div>

          {installments.length === 0 ? (
            <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white space-y-1.5">
              <Calculator className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-bold text-slate-700">Aucune tranche pré-remplie</p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Indiquez le montant annuel ci-dessus pour découper automatiquement vos tranches, ou ajoutez-les manuellement.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {installments.map((inst, idx) => (
                <div
                  key={inst.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-2.5 bg-white border border-slate-200 rounded-xl text-xs items-center"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={inst.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setInstallments((prev) => {
                          const n = [...prev];
                          n[idx] = { ...n[idx], title };
                          return n;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                      placeholder={`Ex: Tranche ${idx + 1}`}
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <input
                      type="date"
                      value={inst.due_date}
                      onChange={(e) => {
                        const due_date = e.target.value;
                        setInstallments((prev) => {
                          const n = [...prev];
                          n[idx] = { ...n[idx], due_date };
                          return n;
                        });
                      }}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-1.5">
                    <input
                      type="number"
                      value={inst.amount === 0 ? "" : inst.amount}
                      placeholder="Ex: 50 000"
                      onChange={(e) => handleInstallmentAmountChange(idx, Number(e.target.value) || 0)}
                      min={0}
                      step={500}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-extrabold text-slate-900 text-right placeholder:text-slate-400 placeholder:font-normal"
                    />
                    <span className="text-slate-400 font-bold text-[11px] shrink-0">{currency}</span>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveInstallment(inst.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Supprimer cette tranche"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Strict Mathematical Validation Notice */}
        {annualAmount > 0 && installments.length > 0 && (
          <div className="pt-2">
            {diff > 0 ? (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Erreur de totalisation :</strong>
                  <span>
                    Le total des tranches ({totalInstallmentsSum.toLocaleString("fr-FR")} {currency}) dépasse la scolarité annuelle de{" "}
                    <strong>{Math.abs(diff).toLocaleString("fr-FR")} {currency}</strong>.
                  </span>
                </div>
              </div>
            ) : diff < 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Montant incomplet :</strong>
                  <span>
                    Le total des tranches ({totalInstallmentsSum.toLocaleString("fr-FR")} {currency}) est inférieur de{" "}
                    <strong>{Math.abs(diff).toLocaleString("fr-FR")} {currency}</strong> au montant annuel attendu.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">
                    Total des tranches parfaitement équilibré : {totalInstallmentsSum.toLocaleString("fr-FR")} {currency}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCurrentPlan}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  Appliquer
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 6 : UTILISATEURS / COLLABORATEURS
// ─────────────────────────────────────────────────────────────────────────────
export function Step6Users({
  invitedUsers,
  setInvitedUsers,
}: {
  invitedUsers: { name: string; email: string; role: StaffRole }[];
  setInvitedUsers: React.Dispatch<React.SetStateAction<{ name: string; email: string; role: StaffRole }[]>>;
}) {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<StaffRole>("comptable");

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) return;

    setInvitedUsers((prev) => [
      ...prev,
      { name: userName.trim(), email: userEmail.trim().toLowerCase(), role: userRole },
    ]);
    setUserName("");
    setUserEmail("");
  };

  const handleRemoveUser = (idx: number) => {
    setInvitedUsers((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Qui travaille avec vous ?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Invitez vos collaborateurs (Directeur, Comptable, Secrétaire) pour partager l&apos;accès à votre espace en direct.
        </p>
      </div>

      {/* Formulaire d'invitation */}
      <form onSubmit={handleAddUser} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
        <span className="font-bold text-slate-700 block">Inviter un nouveau membre :</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Nom complet</label>
            <input
              type="text"
              placeholder="Ex: Paul Mensah"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              placeholder="Ex: compta@ecole.tg"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">Rôle</label>
            <div className="flex gap-2">
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as StaffRole)}
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              >
                <option value="directeur">Directeur</option>
                <option value="comptable">Comptable</option>
                <option value="secretaire">Secrétaire</option>
              </select>
              <button
                type="submit"
                disabled={!userName.trim() || !userEmail.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-bold cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Inviter</span>
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Liste des invités */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-slate-700">
          Membres invités ({invitedUsers.length})
        </span>

        {invitedUsers.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs">
            Aucun collaborateur invité pour l&apos;instant. Vous pourrez ajouter votre équipe à tout moment depuis les Paramètres.
          </div>
        ) : (
          <div className="space-y-2">
            {invitedUsers.map((u, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <strong className="text-slate-900 block font-bold">{u.name}</strong>
                    <span className="text-[11px] text-slate-400">{u.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                    {u.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUser(i)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 7 : NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export function Step7Notifications({
  school,
  setSchool,
}: {
  school: School;
  setSchool: React.Dispatch<React.SetStateAction<School>>;
}) {
  const prefs = school.notification_preferences || {
    unpaid_alerts: true,
    upcoming_deadlines: true,
    payment_received: true,
    reminders_due: true,
  };

  const togglePref = (key: keyof typeof prefs) => {
    setSchool((prev) => ({
      ...prev,
      notification_preferences: {
        ...(prev.notification_preferences || {
          unpaid_alerts: true,
          upcoming_deadlines: true,
          payment_received: true,
          reminders_due: true,
        }),
        [key]: !prefs[key],
      },
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Configurez vos notifications
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Choisissez les alertes automatiques que vous souhaitez recevoir pour garder le contrôle sur la trésorerie.
        </p>
      </div>

      <div className="space-y-3">
        {[
          {
            key: "unpaid_alerts" as const,
            title: "Alertes d'impayés",
            desc: "Notification en temps réel dès qu'une dette d'élève devient critique (> 30 jours de retard).",
          },
          {
            key: "upcoming_deadlines" as const,
            title: "Échéances proches",
            desc: "Rappel automatique 7 jours avant la date limite d'une tranche de scolarité.",
          },
          {
            key: "payment_received" as const,
            title: "Paiements reçus",
            desc: "Confirmation instantanée à chaque encaissement (espèces, TMoney, Flooz, virement).",
          },
          {
            key: "reminders_due" as const,
            title: "Relances à effectuer",
            desc: "Suggestions quotidiennes des messages de relance WhatsApp prêts à être envoyés aux parents.",
          },
        ].map((item) => {
          const isChecked = prefs[item.key];
          return (
            <label
              key={item.key}
              onClick={() => togglePref(item.key)}
              className={`p-4 rounded-2xl border flex items-start justify-between gap-4 cursor-pointer transition-all ${
                isChecked
                  ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/10"
                  : "bg-white border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isChecked ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-xs font-extrabold text-slate-900 block">{item.title}</strong>
                  <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>

              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer mt-1"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 8 : IMPORTER MES DONNÉES (RÉUTILISATION IMPORT SYSTÈME EXISTANT)
// ─────────────────────────────────────────────────────────────────────────────
export function Step8ImportData({ studentsCount }: { studentsCount: number }) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<ImportSourceType>("excel");

  const handleOpenSource = (source: ImportSourceType) => {
    setSelectedSource(source);
    setIsImportModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Vous avez déjà des données ?
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Gagnez du temps en important vos listes d&apos;élèves existantes depuis un tableau ou une photo de registre.
        </p>
      </div>

      {studentsCount > 0 && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-bold">
            {studentsCount} élève{studentsCount > 1 ? "s" : ""} déjà importé{studentsCount > 1 ? "s" : ""} dans votre établissement !
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Option 1 : Excel / CSV */}
        <button
          type="button"
          onClick={() => handleOpenSource("excel")}
          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-left space-y-3 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700">
              Importer un fichier Excel
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Fichiers .xlsx, .xls ou .csv avec détection automatique des colonnes.
            </p>
          </div>
        </button>

        {/* Option 2 : Google Sheets */}
        <button
          type="button"
          onClick={() => handleOpenSource("google_sheets")}
          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-left space-y-3 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700">
              Importer depuis Google Sheets
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Collez simplement le lien de partage de votre feuille de calcul.
            </p>
          </div>
        </button>

        {/* Option 3 : Photo de Registre (OCR) */}
        <button
          type="button"
          onClick={() => handleOpenSource("photo_ocr")}
          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 text-left space-y-3 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200 group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-700">
              Photo de votre registre
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Prenez une photo de votre cahier d&apos;appel : notre IA extrait les noms.
            </p>
          </div>
        </button>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        initialSource={selectedSource}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ÉTAPE 9 : TERMINER & RÉSUMÉ
// ─────────────────────────────────────────────────────────────────────────────
export function Step9FinishSummary({
  school,
  academicYear,
  classes,
  tuitionPlans,
  invitedUsers,
  studentsCount,
}: {
  school: School;
  academicYear: AcademicYear;
  classes: SchoolClass[];
  tuitionPlans: TuitionPlan[];
  invitedUsers: { name: string; email: string; role: StaffRole }[];
  studentsCount: number;
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1 text-center max-w-md mx-auto">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 mb-2">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Votre espace est presque prêt !
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Vérifiez le récapitulatif de votre configuration avant d&apos;accéder à votre tableau de bord.
        </p>
      </div>

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Établissement */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Établissement
          </span>
          <strong className="text-sm font-extrabold text-slate-900 block truncate">
            {school.name || "Établissement scolaire"}
          </strong>
          <p className="text-slate-500 text-[11px]">
            {[school.address, school.city, school.country].filter(Boolean).join(", ") || "Localisation non précisée"} • Devise : {school.currency || "FCFA"}
          </p>
        </div>

        {/* Année Scolaire */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Année Scolaire Active
          </span>
          <strong className="text-sm font-extrabold text-slate-900 block">
            {academicYear.name || "Année en cours"}
          </strong>
          <p className="text-slate-500 text-[11px]">
            {academicYear.start_date && academicYear.end_date
              ? `Du ${academicYear.start_date} au ${academicYear.end_date}`
              : "Calendrier académique"}
          </p>
        </div>

        {/* Classes */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Classes Créées
          </span>
          <strong className="text-sm font-extrabold text-blue-600 block">
            {classes.length} classe{classes.length > 1 ? "s" : ""}
          </strong>
          <p className="text-slate-500 text-[11px] truncate">
            {classes.length > 0 ? classes.map((c) => c.name).slice(0, 4).join(", ") + (classes.length > 4 ? "..." : "") : "Aucune classe"}
          </p>
        </div>

        {/* Scolarités */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Scolarités Configurées
          </span>
          <strong className="text-sm font-extrabold text-emerald-600 block">
            {tuitionPlans.length > 0 ? `${tuitionPlans.length} grille(s) tarifaire(s)` : "Par défaut (150 000 FCFA)"}
          </strong>
          <p className="text-slate-500 text-[11px]">
            {studentsCount > 0 ? `${studentsCount} élèves déjà enregistrés` : "Prêt pour les inscriptions"}
          </p>
        </div>
      </div>
    </div>
  );
}
