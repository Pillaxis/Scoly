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
  Pencil,
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
// ÉTAPE 4 : CLASSES (SÉLECTION PAR NIVEAU & AJOUT PERSONNALISÉ)
// ─────────────────────────────────────────────────────────────────────────────

const LEVEL_PRESETS: Record<
  string,
  { label: string; icon: string; classes: string[] }
> = {
  Lycée: {
    label: "Lycée",
    icon: "🎓",
    classes: ["Seconde", "Première", "Terminale"],
  },
  Collège: {
    label: "Collège",
    icon: "📐",
    classes: ["6ème", "5ème", "4ème", "3ème"],
  },
  Primaire: {
    label: "Primaire",
    icon: "🎒",
    classes: ["CI", "CP", "CE1", "CE2", "CM1", "CM2"],
  },
  Maternelle: {
    label: "Maternelle",
    icon: "🧸",
    classes: [
      "Petite Section",
      "Moyenne Section",
      "Grande Section",
    ],
  },
  Supérieur: {
    label: "Supérieur",
    icon: "🏛️",
    classes: [
      "BTS 1",
      "BTS 2",
      "Licence 1",
      "Licence 2",
      "Licence 3",
      "Master 1",
      "Master 2",
    ],
  },
};

const generateSafeId = (prefix = "cls") => {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
    }
  } catch {
    // fallback
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
};

export function Step4Classes({
  classes,
  setClasses,
  school,
}: {
  classes: SchoolClass[];
  setClasses: React.Dispatch<React.SetStateAction<SchoolClass[]>>;
  school: School;
}) {
  const [activeLevel, setActiveLevel] = useState<string>("Lycée");
  const [customClassName, setCustomClassName] = useState("");
  const [customClassLevel, setCustomClassLevel] = useState<string>("Lycée");
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editingClassName, setEditingClassName] = useState<string>("");
  const [customInputError, setCustomInputError] = useState<string | null>(null);
  const [addedSuccessMsg, setAddedSuccessMsg] = useState<string | null>(null);
  const customInputRef = React.useRef<HTMLInputElement>(null);

  // Synchronize customClassLevel with activeLevel when user clicks tabs
  const handleSelectLevelTab = (levelKey: string) => {
    setActiveLevel(levelKey);
    setCustomClassLevel(levelKey);
  };

  const handleTogglePresetClass = (className: string, level: string) => {
    const existing = classes.find(
      (c) => c.name.toLowerCase() === className.toLowerCase()
    );
    if (existing) {
      // Remove if already added
      setClasses((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      // Add class
      const newCls: SchoolClass = {
        id: generateSafeId("cls"),
        school_id: school?.id || "school-current",
        academic_year_id: "current",
        name: className,
        level: level,
        order_index: classes.length + 1,
      };
      setClasses((prev) => [...prev, newCls]);
    }
  };

  const handleAddAllForCurrentLevel = () => {
    const preset = LEVEL_PRESETS[activeLevel];
    if (!preset) return;

    const toAdd: SchoolClass[] = [];
    preset.classes.forEach((name) => {
      if (!classes.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
        toAdd.push({
          id: generateSafeId("cls"),
          school_id: school?.id || "school-current",
          academic_year_id: "current",
          name,
          level: activeLevel,
          order_index: classes.length + toAdd.length + 1,
        });
      }
    });

    if (toAdd.length > 0) {
      setClasses((prev) => [...prev, ...toAdd]);
      setAddedSuccessMsg(`✓ ${toAdd.length} classes du ${preset.label} ajoutées !`);
      setTimeout(() => setAddedSuccessMsg(null), 3000);
    }
  };

  const handleAddCustomClass = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const raw = customClassName.trim();
    if (!raw) {
      setCustomInputError("Veuillez saisir le nom de la classe ci-dessous");
      customInputRef.current?.focus();
      return;
    }

    setCustomInputError(null);

    // Split by comma or semicolon in case user entered multiple classes (e.g. "Seconde S, Seconde D, Seconde A")
    const names = raw
      .split(/[,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (names.length === 0) {
      setCustomInputError("Veuillez saisir un nom valide");
      customInputRef.current?.focus();
      return;
    }

    const newClasses: SchoolClass[] = names.map((name, idx) => ({
      id: generateSafeId("cls"),
      school_id: school?.id || "school-current",
      academic_year_id: "current",
      name: name,
      level: customClassLevel || activeLevel || "Lycée",
      order_index: classes.length + idx + 1,
      is_custom: true,
    }));

    setClasses((prev) => [...prev, ...newClasses]);
    setCustomClassName("");
    setAddedSuccessMsg(
      `✓ ${newClasses.length > 1 ? `${newClasses.length} classes ajoutées` : `Classe « ${newClasses[0].name} » ajoutée`} avec succès !`
    );
    setTimeout(() => setAddedSuccessMsg(null), 3500);
    customInputRef.current?.focus();
  };

  const handleStartEdit = (cls: SchoolClass) => {
    setEditingClassId(cls.id);
    setEditingClassName(cls.name);
  };

  const handleSaveEdit = (id: string) => {
    const trimmed = editingClassName.trim();
    if (!trimmed) {
      setEditingClassId(null);
      return;
    }
    setClasses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: trimmed } : c))
    );
    setEditingClassId(null);
  };

  const handleDuplicateSection = (cls: SchoolClass) => {
    // Generate intelligent section name: e.g. "Seconde" -> "Seconde S", or "Seconde A" -> "Seconde B"
    const baseName = cls.name.replace(/\s+[A-Z0-9]+$/, "").trim() || cls.name;
    const sameBaseCount = classes.filter((c) =>
      c.name.toLowerCase().startsWith(baseName.toLowerCase())
    ).length;

    const suffixes = ["A", "B", "C", "D", "S", "CD", "G2"];
    const suffix = suffixes[sameBaseCount] || `${sameBaseCount + 1}`;
    const suggestedName = `${baseName} ${suffix}`;

    const newCls: SchoolClass = {
      id: generateSafeId("cls"),
      school_id: school?.id || "school-current",
      academic_year_id: "current",
      name: suggestedName,
      level: cls.level,
      order_index: classes.length + 1,
      is_custom: true,
    };

    setClasses((prev) => [...prev, newCls]);
    setEditingClassId(newCls.id);
    setEditingClassName(suggestedName);
  };

  const handleRemoveClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
  };

  const currentPreset = LEVEL_PRESETS[activeLevel] || LEVEL_PRESETS.Lycée;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Ajoutez vos classes
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Sélectionnez vos niveaux pour ajouter vos classes, puis personnalisez-les directement (ex: Seconde S, Seconde D, etc.).
        </p>
      </div>

      {/* Level Tabs Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          1. Sélectionnez un niveau d&apos;enseignement :
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(LEVEL_PRESETS).map(([key, data]) => {
            const isActive = activeLevel === key;
            const countInLevel = classes.filter((c) => c.level === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectLevelTab(key)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <span>{data.icon}</span>
                <span>{data.label}</span>
                {countInLevel > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {countInLevel}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Classes of the selected Level */}
      <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">{currentPreset.icon}</span>
            <span className="text-xs font-extrabold text-slate-900">
              Classes principales du {currentPreset.label} :
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddAllForCurrentLevel}
            className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
          >
            + Tout sélectionner pour ce niveau
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {currentPreset.classes.map((clsName) => {
            const isAdded = classes.some(
              (c) => c.name.toLowerCase() === clsName.toLowerCase() || c.name.toLowerCase().startsWith(clsName.toLowerCase() + " ")
            );
            return (
              <button
                key={clsName}
                type="button"
                onClick={() => handleTogglePresetClass(clsName, activeLevel)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between gap-2 cursor-pointer ${
                  isAdded
                    ? "bg-blue-50/90 border-blue-500 text-blue-900 ring-1 ring-blue-500 shadow-2xs"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50"
                }`}
              >
                <span className="truncate">{clsName}</span>
                <span
                  className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold ${
                    isAdded
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 text-slate-400"
                  }`}
                >
                  {isAdded ? "✓" : "+"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Class Form */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          2. Ou ajoutez une classe personnalisée directement :
        </label>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCustomClass(e);
          }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="flex-1 relative">
            <input
              ref={customInputRef}
              type="text"
              placeholder="Ex: Seconde S, Seconde D, Terminale A4..."
              value={customClassName}
              onChange={(e) => {
                setCustomClassName(e.target.value);
                if (customInputError) setCustomInputError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddCustomClass(e);
                }
              }}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                customInputError
                  ? "border-rose-400 focus:ring-rose-500 bg-rose-50/30"
                  : "border-slate-200 focus:ring-blue-600"
              }`}
            />
            {customInputError && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1">
                {customInputError}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <select
              value={customClassLevel}
              onChange={(e) => setCustomClassLevel(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
            >
              <option value="Lycée">Lycée</option>
              <option value="Collège">Collège</option>
              <option value="Primaire">Primaire</option>
              <option value="Maternelle">Maternelle</option>
              <option value="Supérieur">Supérieur</option>
            </select>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleAddCustomClass(e);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-md shadow-blue-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter</span>
            </button>
          </div>
        </form>

        {addedSuccessMsg && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>{addedSuccessMsg}</span>
          </div>
        )}
      </div>

      {/* Configured Classes List */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-900">
              Classes configurées ({classes.length})
            </span>
            <span className="text-[11px] text-slate-400 ml-2 hidden sm:inline">
              (Cliquez sur le nom d&apos;une classe pour la renommer)
            </span>
          </div>
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
          <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs bg-slate-50/50">
            Aucune classe ajoutée pour le moment. Cliquez sur les classes ci-dessus ou ajoutez une classe personnalisée.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1">
            {classes.map((cls) => {
              const isEditing = editingClassId === cls.id;
              return (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-slate-300 transition-all gap-2"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 w-full">
                      <input
                        type="text"
                        autoFocus
                        value={editingClassName}
                        onChange={(e) => setEditingClassName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit(cls.id);
                          if (e.key === "Escape") setEditingClassId(null);
                        }}
                        placeholder="Nom de la classe..."
                        className="flex-1 px-2.5 py-1 bg-blue-50/60 border border-blue-500 rounded-lg text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(cls.id)}
                        className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                        title="Valider"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div
                        onClick={() => handleStartEdit(cls)}
                        className="min-w-0 flex-1 cursor-pointer group"
                        title="Cliquez pour renommer"
                      >
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-extrabold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                            {cls.name}
                          </p>
                          <Pencil className="w-3 h-3 text-slate-400 group-hover:text-blue-600 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium block truncate">
                          {cls.level}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDuplicateSection(cls)}
                          className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                          title="Dupliquer / Ajouter une section (ex: Seconde A, Seconde B...)"
                        >
                          + Section
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveClass(cls.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Supprimer la classe"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
  const initialClassId = classes[0]?.id || "all";
  const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
  const [annualAmount, setAnnualAmount] = useState<number>(0);
  const [installmentCount, setInstallmentCount] = useState<number>(3);
  const [installments, setInstallments] = useState<TuitionInstallment[]>([]);
  const [savedSuccessAlert, setSavedSuccessAlert] = useState<string | null>(null);

  // Load existing plan when selectedClassId changes
  const handleSelectClass = (newId: string) => {
    // 1. If currently configured plan is valid, persist it first before switching
    if (isMatch && installments.length > 0 && annualAmount > 0) {
      persistPlanForClass(selectedClassId, annualAmount, installments);
    }

    setSelectedClassId(newId);

    // 2. Load plan for the new class
    const existing = tuitionPlans.find(
      (p) => (newId === "all" ? p.class_id === "all" : p.class_id === newId)
    );

    if (existing && existing.total_amount > 0) {
      setAnnualAmount(existing.total_amount);
      setInstallments(existing.installments || []);
      setInstallmentCount(existing.installments?.length || 3);
    } else {
      // Empty slate for new class
      setAnnualAmount(0);
      setInstallments([]);
      setInstallmentCount(3);
    }
  };

  // Helper to persist plan into tuitionPlans state
  const persistPlanForClass = (
    classId: string,
    amount: number,
    insts: TuitionInstallment[]
  ) => {
    const targetClasses =
      classId === "all"
        ? classes
        : classes.filter((c) => c.id === classId);

    if (targetClasses.length === 0) return;

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
          total_amount: amount,
          installments: insts.map((inst, i) => ({
            ...inst,
            id: `inst-${cls.id}-${i + 1}`,
            tuition_plan_id: "plan-" + cls.id,
          })),
        });
      });
      return next;
    });
  };

  // Calculate sum of installments
  const totalInstallmentsSum = useMemo(() => {
    return installments.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  }, [installments]);

  const diff = totalInstallmentsSum - annualAmount;
  const isMatch =
    (annualAmount === 0 && installments.length === 0) ||
    (annualAmount > 0 && Math.abs(diff) < 0.01);

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
        id: `inst-${Date.now()}-${i}`,
        tuition_plan_id: "plan-current",
        title:
          i === 1
            ? "1ère Tranche (Rentrée)"
            : i === count
            ? `${i}ème Tranche (Solde)`
            : `${i}ème Tranche`,
        due_date: dates[i - 1] || "",
        amount: amt,
        installment_order: i,
      });
    }

    setInstallments(nextInst);
    if (total > 0) {
      persistPlanForClass(selectedClassId, total, nextInst);
    }
  };

  const handleInstallmentCountChange = (newCount: number) => {
    setInstallmentCount(newCount);
    if (annualAmount > 0) {
      handleAutoSplit(newCount, annualAmount);
    }
  };

  const handleAddManualInstallment = () => {
    const nextOrder = installments.length + 1;
    const newInsts: TuitionInstallment[] = [
      ...installments,
      {
        id: `inst-${Date.now()}-${nextOrder}`,
        tuition_plan_id: "plan-current",
        title: nextOrder === 1 ? "1ère Tranche (Rentrée)" : `${nextOrder}ème Tranche`,
        due_date: "",
        amount: 0,
        installment_order: nextOrder,
      },
    ];
    setInstallments(newInsts);
  };

  const handleRemoveInstallment = (id: string) => {
    const nextInsts = installments.filter((i) => i.id !== id);
    setInstallments(nextInsts);
    if (annualAmount > 0 && Math.abs(nextInsts.reduce((a, b) => a + Number(b.amount || 0), 0) - annualAmount) < 0.01) {
      persistPlanForClass(selectedClassId, annualAmount, nextInsts);
    }
  };

  const handleInstallmentAmountChange = (idx: number, newAmt: number) => {
    const next = [...installments];
    next[idx] = { ...next[idx], amount: newAmt };
    setInstallments(next);

    const sum = next.reduce((a, b) => a + Number(b.amount || 0), 0);
    if (annualAmount > 0 && Math.abs(sum - annualAmount) < 0.01) {
      persistPlanForClass(selectedClassId, annualAmount, next);
    }
  };

  const handleSaveCurrentPlan = () => {
    if (!isMatch || installments.length === 0 || annualAmount <= 0) return;

    persistPlanForClass(selectedClassId, annualAmount, installments);

    const currentName =
      selectedClassId === "all"
        ? "toutes les classes"
        : classes.find((c) => c.id === selectedClassId)?.name || "la classe";

    setSavedSuccessAlert(
      `✓ Tarif de ${annualAmount.toLocaleString("fr-FR")} ${currency} enregistré pour ${currentName} !`
    );
    setTimeout(() => setSavedSuccessAlert(null), 3500);
  };

  const currentSelectedClass = classes.find((c) => c.id === selectedClassId);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Configurez vos frais de scolarité
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Définissez la scolarité et les tranches de paiement pour chaque classe selon vos besoins.
        </p>
      </div>

      {/* Quick class pill selector */}
      {classes.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            1. Choisissez la classe à configurer :
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleSelectClass("all")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                selectedClassId === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>🌐</span>
              <span>Toutes les classes</span>
            </button>

            {classes.map((cls) => {
              const isSelected = selectedClassId === cls.id;
              const plan = tuitionPlans.find((p) => p.class_id === cls.id);
              const isConfigured = plan && plan.total_amount > 0;

              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => handleSelectClass(cls.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20 ring-2 ring-blue-600/20"
                      : isConfigured
                      ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/70"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span>{cls.name}</span>
                  {isConfigured && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                        isSelected ? "bg-white/20 text-white" : "bg-emerald-200/80 text-emerald-900"
                      }`}
                    >
                      {plan.total_amount.toLocaleString("fr-FR")} {currency}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Editor Box */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
          <div>
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
              Configuration active
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">
              {selectedClassId === "all"
                ? "Tarif général (Appliqué à toutes les classes)"
                : `Tarif pour : ${currentSelectedClass?.name || "Classe"} (${currentSelectedClass?.level || "Niveau"})`}
            </h3>
          </div>

          {selectedClassId !== "all" && (
            <button
              type="button"
              onClick={() => handleSelectClass("all")}
              className="text-[11px] font-bold text-slate-500 hover:text-blue-600 cursor-pointer underline"
            >
              Changer pour toutes les classes
            </button>
          )}
        </div>

        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Classe concernée
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => handleSelectClass(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
            >
              <option value="all">Toutes les classes (Tarif unique)</option>
              {classes.length > 0 ? (
                <optgroup label="Vos classes configurées">
                  {classes.map((c) => {
                    const p = tuitionPlans.find((tp) => tp.class_id === c.id);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.level ? `(${c.level})` : ""}{" "}
                        {p && p.total_amount > 0
                          ? `— ${p.total_amount.toLocaleString("fr-FR")} ${currency}`
                          : "— (Non défini)"}
                      </option>
                    );
                  })}
                </optgroup>
              ) : null}
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
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-600 focus:outline-none cursor-pointer"
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
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
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

        {/* Real-time Mathematical Validation Notice & Save button */}
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
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold">
                    Tranches équilibrées : {totalInstallmentsSum.toLocaleString("fr-FR")} {currency}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveCurrentPlan}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Enregistrer pour{" "}
                    {selectedClassId === "all" ? "toutes les classes" : currentSelectedClass?.name || "cette classe"}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {savedSuccessAlert && (
          <div className="p-3 bg-emerald-100/80 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-700" />
            <span>{savedSuccessAlert}</span>
          </div>
        )}
      </div>

      {/* Recap of configured plans across classes */}
      {classes.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Récapitulatif des tarifs par classe ({tuitionPlans.filter((p) => p.total_amount > 0).length}/{classes.length} configurées) :
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {classes.map((cls) => {
              const plan = tuitionPlans.find((p) => p.class_id === cls.id);
              const isSet = plan && plan.total_amount > 0;
              const isCurrent = selectedClassId === cls.id;

              return (
                <div
                  key={cls.id}
                  onClick={() => handleSelectClass(cls.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/20 shadow-xs"
                      : isSet
                      ? "bg-white border-slate-200 hover:border-slate-300"
                      : "bg-slate-50/70 border-dashed border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <strong className="text-xs font-extrabold text-slate-900 block">
                        {cls.name}
                      </strong>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {cls.level}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isSet
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-200/70 text-slate-600"
                      }`}
                    >
                      {isSet ? "Configuré ✓" : "Non défini"}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Scolarité :</span>
                      <strong className="text-xs font-extrabold text-slate-900">
                        {isSet
                          ? `${plan.total_amount.toLocaleString("fr-FR")} ${currency}`
                          : `— ${currency}`}
                      </strong>
                    </div>

                    <span className="text-[11px] font-bold text-blue-600 hover:underline">
                      {isCurrent ? "En cours d'édition" : isSet ? "Modifier →" : "Définir →"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
