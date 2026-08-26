"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Layers, Plus, CheckCircle2, AlertCircle, Sparkles, BookOpen } from "lucide-react";
import { useScoly } from "@/lib/store";
import { SchoolClass } from "@/types/scoly";

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classToEdit?: SchoolClass | null;
  onSuccess?: (createdClass: SchoolClass) => void;
}

export function ClassModal({
  isOpen,
  onClose,
  classToEdit,
  onSuccess,
}: ClassModalProps) {
  const { addClass, updateClass } = useScoly();

  const isEditing = Boolean(classToEdit);

  // Category Level
  const [levelCategory, setLevelCategory] = useState<string>("primaire");

  // Specific Level / Base class
  const [baseClass, setBaseClass] = useState<string>("CP1");
  const [sectionSuffix, setSectionSuffix] = useState<string>("");

  // Maternelle specific
  const [maternelleType, setMaternelleType] = useState<string>("1ère année");

  // Lycée specific
  const [lyceeLevel, setLyceeLevel] = useState<string>("Terminale");
  const [lyceeSerie, setLyceeSerie] = useState<string>("G2");

  // Supérieur specific
  const [univYear, setUnivYear] = useState<string>("Licence 1");
  const [univBranch, setUnivBranch] = useState<string>("Gestion & Finance");

  // Custom free text
  const [customName, setCustomName] = useState<string>("");
  const [customLevelLabel, setCustomLevelLabel] = useState<string>("");
  const [isManualOverride, setIsManualOverride] = useState<boolean>(false);

  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Initialize form on open/edit
  useEffect(() => {
    if (classToEdit) {
      setCustomName(classToEdit.name);
      setIsManualOverride(true);
      setCustomLevelLabel(classToEdit.level);
      setDescription(classToEdit.description || "");
      if (classToEdit.series) setLyceeSerie(classToEdit.series);
      if (classToEdit.branch) setUnivBranch(classToEdit.branch);
      if (classToEdit.cycle_year) {
        setMaternelleType(classToEdit.cycle_year);
        setUnivYear(classToEdit.cycle_year);
      }
      setError("");
    } else {
      setLevelCategory("primaire");
      setBaseClass("CP1");
      setSectionSuffix("");
      setMaternelleType("1ère année");
      setLyceeLevel("Terminale");
      setLyceeSerie("G2");
      setUnivYear("Licence 1");
      setUnivBranch("Gestion & Finance");
      setCustomName("");
      setCustomLevelLabel("");
      setIsManualOverride(false);
      setDescription("");
      setError("");
    }
  }, [classToEdit, isOpen]);

  // Computed class name & level based on selections
  const computedInfo = useMemo(() => {
    if (isManualOverride && customName.trim()) {
      return {
        name: customName.trim(),
        level: customLevelLabel.trim() || (levelCategory === "maternelle" ? "Maternelle" : levelCategory === "lycee" ? "Lycée" : levelCategory === "superieur" ? "Enseignement Supérieur" : levelCategory === "college" ? "Collège" : "Primaire"),
        series: lyceeSerie.trim() || undefined,
        cycle_year: levelCategory === "maternelle" ? maternelleType : levelCategory === "superieur" ? univYear : undefined,
        branch: levelCategory === "superieur" ? univBranch.trim() : undefined,
      };
    }

    if (levelCategory === "maternelle") {
      const yearText = maternelleType.trim() ? ` (${maternelleType.trim()})` : "";
      const secText = sectionSuffix.trim() ? ` ${sectionSuffix.trim().toUpperCase()}` : "";
      return {
        name: `CI Maternelle${yearText}${secText}`,
        level: "Maternelle",
        cycle_year: maternelleType,
      };
    }

    if (levelCategory === "primaire") {
      const secText = sectionSuffix.trim() ? ` ${sectionSuffix.trim().toUpperCase()}` : "";
      return {
        name: `${baseClass}${secText}`,
        level: "Primaire",
      };
    }

    if (levelCategory === "college") {
      const secText = sectionSuffix.trim() ? ` ${sectionSuffix.trim().toUpperCase()}` : "";
      return {
        name: `${baseClass}${secText}`,
        level: "Collège",
      };
    }

    if (levelCategory === "lycee") {
      const serieText = lyceeSerie.trim() ? ` ${lyceeSerie.trim().toUpperCase()}` : "";
      const secText = sectionSuffix.trim() ? ` ${sectionSuffix.trim().toUpperCase()}` : "";
      return {
        name: `${lyceeLevel}${serieText}${secText}`,
        level: "Lycée",
        series: lyceeSerie.trim().toUpperCase(),
      };
    }

    if (levelCategory === "superieur") {
      const branchText = univBranch.trim() ? ` (${univBranch.trim()})` : "";
      const secText = sectionSuffix.trim() ? ` ${sectionSuffix.trim().toUpperCase()}` : "";
      return {
        name: `Université — ${univYear}${branchText}${secText}`,
        level: "Enseignement Supérieur",
        cycle_year: univYear,
        branch: univBranch.trim(),
      };
    }

    if (levelCategory === "pro") {
      const branchText = univBranch.trim() ? ` — ${univBranch.trim()}` : "";
      return {
        name: `${baseClass || "Formation"}${branchText}`,
        level: "Formation Professionnelle",
        branch: univBranch.trim(),
      };
    }

    return {
      name: customName.trim() || "Nouvelle Classe",
      level: customLevelLabel.trim() || "Autre",
    };
  }, [
    isManualOverride,
    customName,
    customLevelLabel,
    levelCategory,
    baseClass,
    sectionSuffix,
    maternelleType,
    lyceeLevel,
    lyceeSerie,
    univYear,
    univBranch,
  ]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const finalName = isManualOverride ? customName.trim() : computedInfo.name;
    const finalLevel = isManualOverride ? (customLevelLabel.trim() || "Général") : computedInfo.level;

    if (!finalName) {
      setError("Veuillez indiquer un nom pour la classe.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && classToEdit) {
        updateClass(classToEdit.id, {
          name: finalName,
          level: finalLevel,
          series: computedInfo.series,
          cycle_year: computedInfo.cycle_year,
          branch: computedInfo.branch,
          description: description.trim() || undefined,
        });
        setIsSubmitting(false);
        onClose();
      } else {
        const created = addClass({
          name: finalName,
          level: finalLevel,
          series: computedInfo.series,
          cycle_year: computedInfo.cycle_year,
          branch: computedInfo.branch,
          description: description.trim() || undefined,
        });
        setIsSubmitting(false);
        if (onSuccess) onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || "Une erreur est survenue lors de l'enregistrement de la classe.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                {isEditing ? "Modifier la Classe" : "Enregistrer une Classe Personnalisable"}
              </h2>
              <p className="text-xs text-slate-500">
                Configuration du niveau et des spécificités scolaires
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

        {/* Body Form */}
        <form
          id="class-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs"
        >
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Cycle / Niveau Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              1. Cycle d&apos;enseignement / Niveau *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "maternelle", label: "🧸 Maternelle" },
                { id: "primaire", label: "🎒 Primaire" },
                { id: "college", label: "📚 Collège" },
                { id: "lycee", label: "🎓 Lycée" },
                { id: "superieur", label: "🏛️ Supérieur" },
                { id: "pro", label: "🛠️ Pro / Tech" },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => {
                    setLevelCategory(lvl.id);
                    setIsManualOverride(false);
                    if (lvl.id === "primaire") setBaseClass("CP1");
                    if (lvl.id === "college") setBaseClass("6e");
                    if (lvl.id === "lycee") setLyceeLevel("Terminale");
                    if (lvl.id === "pro") setBaseClass("CAP");
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer ${
                    levelCategory === lvl.id && !isManualOverride
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Dynamic Level Options */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            {/* A. Maternelle */}
            {levelCategory === "maternelle" && !isManualOverride && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Option Maternelle : Année / Section *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["1ère année", "2ème année", "Petite Section", "Grande Section"].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setMaternelleType(opt)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        maternelleType === opt
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* B. Primaire */}
            {levelCategory === "primaire" && !isManualOverride && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Classe du Primaire *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["CP1", "CP2", "CE1", "CE2", "CM1", "CM2"].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setBaseClass(cls)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        baseClass === cls
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* C. Collège */}
            {levelCategory === "college" && !isManualOverride && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Classe du Collège *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {["6e", "5e", "4e", "3e"].map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setBaseClass(cls)}
                      className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        baseClass === cls
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* D. Lycée */}
            {levelCategory === "lycee" && !isManualOverride && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Niveau Lycée *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Seconde", "Première", "Terminale"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setLyceeLevel(lvl)}
                        className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          lyceeLevel === lvl
                            ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Série / Spécialité (ex: G2, A4, C, D, F1, TI...) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={lyceeSerie}
                      onChange={(e) => setLyceeSerie(e.target.value)}
                      placeholder="Ex: G2, A4, D, C, TI, F3..."
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex gap-1">
                      {["G2", "A4", "D", "C"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setLyceeSerie(s)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-bold cursor-pointer"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* E. Supérieur */}
            {levelCategory === "superieur" && !isManualOverride && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Année / Grade Supérieur *
                  </label>
                  <select
                    value={univYear}
                    onChange={(e) => setUnivYear(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Licence 1">Licence 1 (L1)</option>
                    <option value="Licence 2">Licence 2 (L2)</option>
                    <option value="Licence 3">Licence 3 (L3)</option>
                    <option value="Master 1">Master 1 (M1)</option>
                    <option value="Master 2">Master 2 (M2)</option>
                    <option value="BTS 1ère année">BTS 1ère année</option>
                    <option value="BTS 2ème année">BTS 2ème année</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Filière / Branche / Département *
                  </label>
                  <input
                    type="text"
                    value={univBranch}
                    onChange={(e) => setUnivBranch(e.target.value)}
                    placeholder="Ex: Gestion & Finance, Génie Logiciel, Droit, Marketing..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* F. Professionnel & Technique */}
            {levelCategory === "pro" && !isManualOverride && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Diplôme / Type</label>
                    <input
                      type="text"
                      value={baseClass}
                      onChange={(e) => setBaseClass(e.target.value)}
                      placeholder="Ex: CAP, BT, CQP..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Métier / Spécialité</label>
                    <input
                      type="text"
                      value={univBranch}
                      onChange={(e) => setUnivBranch(e.target.value)}
                      placeholder="Ex: Couture, Mécanique, Électricité..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Section / Groupe optionnel (A, B, C, Rose...) */}
            {!isManualOverride && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Section / Sous-groupe (facultatif)
                </label>
                <input
                  type="text"
                  value={sectionSuffix}
                  onChange={(e) => setSectionSuffix(e.target.value)}
                  placeholder="Ex: A, B, 1, 2, Bleue... (laisser vide si classe unique)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs uppercase focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Mode Saisie 100% Libre / Personnalisée */}
            <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Vous avez un nom de classe spécifique ?
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsManualOverride(!isManualOverride);
                  if (!isManualOverride && !customName) {
                    setCustomName(computedInfo.name);
                    setCustomLevelLabel(computedInfo.level);
                  }
                }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                {isManualOverride ? "Utiliser l'assistant standard" : "Écrire un nom 100% libre"}
              </button>
            </div>

            {isManualOverride && (
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2.5 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">
                    Nom personnalisé complet de la classe *
                  </label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Ex: Terminale G2 A, BTS 2ème année Logistique..."
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-blue-950 mb-1">
                    Cycle / Niveau associé
                  </label>
                  <input
                    type="text"
                    value={customLevelLabel}
                    onChange={(e) => setCustomLevelLabel(e.target.value)}
                    placeholder="Ex: Lycée, Supérieur, Technique..."
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Real-time Preview Banner */}
          <div className="p-3.5 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="text-[10px] uppercase font-bold text-blue-700 block">
                  Aperçu de la classe dans l&apos;application :
                </span>
                <strong className="text-blue-950 text-sm font-extrabold">
                  {isManualOverride ? (customName.trim() || "...") : computedInfo.name}
                </strong>
              </div>
            </div>
            <span className="text-[11px] font-bold bg-white text-blue-800 px-2.5 py-1 rounded-lg border border-blue-200 shrink-0">
              {isManualOverride ? (customLevelLabel.trim() || "Personnalisée") : computedInfo.level}
            </span>
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note ou description interne (facultatif)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Salle 104, Effectif max 35 élèves..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex items-center justify-between gap-3 shadow-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            type="submit"
            form="class-form"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-extrabold rounded-xl shadow-md shadow-blue-600/30 hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isEditing ? "Enregistrer les Modifications" : "Créer la Classe"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
