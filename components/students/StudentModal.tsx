"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, UserPlus, Edit3, CheckCircle2, AlertCircle } from "lucide-react";
import { useScoly } from "@/lib/store";
import { Student } from "@/types/scoly";
import { ClassModal } from "@/components/classes/ClassModal";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  onSuccess?: (student: Student) => void;
}

export function StudentModal({ isOpen, onClose, studentToEdit, onSuccess }: StudentModalProps) {
  const { classes, tuitionPlans, addStudent, updateStudent } = useScoly();

  const isEditing = Boolean(studentToEdit);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<"M" | "F">("M");
  const [birthDate, setBirthDate] = useState("");

  // Professional Class Selector States
  const [selectedClassType, setSelectedClassType] = useState<string>("cls-6e");
  const [maternelleYear, setMaternelleYear] = useState<"1ère année" | "2ème année">("1ère année");
  const [lyceeSerie, setLyceeSerie] = useState<string>("G2");
  const [univLevel, setUnivLevel] = useState<string>("Licence 1");
  const [univBranch, setUnivBranch] = useState<string>("Gestion & Finance");

  // Solde de la scolarité
  const [tuitionAmount, setTuitionAmount] = useState<number | "">("");

  // Parent fields
  const [parentName, setParentName] = useState("");
  const [parentRelationship, setParentRelationship] = useState<"Père" | "Mère" | "Tuteur" | "Autre">("Mère");
  const [parentPhone, setParentPhone] = useState("");
  const [parentProfession, setParentProfession] = useState("");
  const [parentAddress, setParentAddress] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const customClasses = useMemo(() => {
    return classes.filter(
      (c) =>
        c.is_custom ||
        ![
          "cls-ci-1",
          "cls-ci-2",
          "cls-cp1",
          "cls-cp2",
          "cls-ce1",
          "cls-ce2",
          "cls-cm1",
          "cls-cm2",
          "cls-6e",
          "cls-5e",
          "cls-4e",
          "cls-3e",
          "cls-seconde",
          "cls-premiere",
          "cls-terminale",
          "cls-universite",
        ].includes(c.id)
    );
  }, [classes]);

  // Compute final formatted class name and matching class_id
  const computedClassInfo = useMemo(() => {
    if (selectedClassType === "maternelle" || selectedClassType === "cls-ci-1" || selectedClassType === "cls-ci-2") {
      const isFirst = maternelleYear === "1ère année";
      return {
        class_id: isFirst ? "cls-ci-1" : "cls-ci-2",
        class_name: `CI Maternelle (${maternelleYear})`,
        level: "Maternelle",
      };
    }

    if (selectedClassType === "cls-seconde") {
      const serieSuffix = lyceeSerie.trim() ? ` ${lyceeSerie.trim().toUpperCase()}` : "";
      return {
        class_id: "cls-seconde",
        class_name: `Seconde${serieSuffix}`,
        level: "Lycée",
      };
    }

    if (selectedClassType === "cls-premiere") {
      const serieSuffix = lyceeSerie.trim() ? ` ${lyceeSerie.trim().toUpperCase()}` : "";
      return {
        class_id: "cls-premiere",
        class_name: `Première${serieSuffix}`,
        level: "Lycée",
      };
    }

    if (selectedClassType === "cls-terminale") {
      const serieSuffix = lyceeSerie.trim() ? ` ${lyceeSerie.trim().toUpperCase()}` : "";
      return {
        class_id: "cls-terminale",
        class_name: `Terminale${serieSuffix}`,
        level: "Lycée",
      };
    }

    if (selectedClassType === "cls-universite") {
      const branchText = univBranch.trim() ? ` (${univBranch.trim()})` : "";
      return {
        class_id: "cls-universite",
        class_name: `Université — ${univLevel}${branchText}`,
        level: "Enseignement Supérieur",
      };
    }

    // Standard school class (CP1, CP2, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e)
    const match = classes.find((c) => c.id === selectedClassType);
    return {
      class_id: match ? match.id : selectedClassType,
      class_name: match ? match.name : "Classe standard",
      level: match ? match.level : "Général",
    };
  }, [selectedClassType, maternelleYear, lyceeSerie, univLevel, univBranch, classes]);

  // Pre-fill when editing or reset when creating
  useEffect(() => {
    if (studentToEdit) {
      setFirstName(studentToEdit.first_name);
      setLastName(studentToEdit.last_name);
      setGender(studentToEdit.gender);
      setBirthDate(studentToEdit.birth_date || "");

      // Initial tuition solde for editing
      const plan = tuitionPlans.find((tp) => tp.class_id === studentToEdit.class_id);
      const defaultAmount = plan ? plan.total_amount : 150000;
      setTuitionAmount(studentToEdit.custom_tuition ?? defaultAmount);

      // Parent info
      if (studentToEdit.parent) {
        setParentName(studentToEdit.parent.full_name);
        setParentRelationship(studentToEdit.parent.relationship);
        setParentPhone(studentToEdit.parent.phone_primary);
        setParentProfession(studentToEdit.parent.profession || "");
        setParentAddress(studentToEdit.parent.address || "");
      }

      // Detect Class type and sub-options
      const cId = studentToEdit.class_id;
      const cName = studentToEdit.class_name;

      if (cId === "cls-ci-1" || cName.includes("1ère année")) {
        setSelectedClassType("maternelle");
        setMaternelleYear("1ère année");
      } else if (cId === "cls-ci-2" || cName.includes("2ème année")) {
        setSelectedClassType("maternelle");
        setMaternelleYear("2ème année");
      } else if (cId === "cls-seconde" || cName.startsWith("Seconde")) {
        setSelectedClassType("cls-seconde");
        const parts = cName.split(" ");
        if (parts.length > 1) setLyceeSerie(parts.slice(1).join(" "));
      } else if (cId === "cls-premiere" || cName.startsWith("Première")) {
        setSelectedClassType("cls-premiere");
        const parts = cName.split(" ");
        if (parts.length > 1) setLyceeSerie(parts.slice(1).join(" "));
      } else if (cId === "cls-terminale" || cName.startsWith("Terminale")) {
        setSelectedClassType("cls-terminale");
        const parts = cName.split(" ");
        if (parts.length > 1) setLyceeSerie(parts.slice(1).join(" "));
      } else if (cId === "cls-universite" || cName.startsWith("Université")) {
        setSelectedClassType("cls-universite");
      } else {
        setSelectedClassType(cId);
      }
    } else {
      // Reset defaults
      setFirstName("");
      setLastName("");
      setGender("M");
      setBirthDate("");
      setSelectedClassType("cls-6e");
      setMaternelleYear("1ère année");
      setLyceeSerie("G2");
      setUnivLevel("Licence 1");
      setUnivBranch("Gestion & Finance");
      
      // Default standard tuition fee
      const plan = tuitionPlans.find((tp) => tp.class_id === "cls-6e");
      setTuitionAmount(plan ? plan.total_amount : 220000);

      setParentName("");
      setParentRelationship("Mère");
      setParentPhone("");
      setParentProfession("");
      setParentAddress("");
      setError("");
    }
  }, [studentToEdit, isOpen, tuitionPlans]);

  // When class selection changes in creation mode, update default tuition if not customized
  const handleClassTypeChange = (newClassType: string) => {
    setSelectedClassType(newClassType);
    if (!isEditing) {
      const match = tuitionPlans.find((tp) => tp.class_id === newClassType);
      if (match) {
        setTuitionAmount(match.total_amount);
      } else if (newClassType === "maternelle" || newClassType === "cls-ci-1" || newClassType === "cls-ci-2") {
        setTuitionAmount(120000);
      } else if (newClassType === "cls-seconde" || newClassType === "cls-premiere" || newClassType === "cls-terminale") {
        setTuitionAmount(280000);
      } else if (newClassType === "cls-universite") {
        setTuitionAmount(450000);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("Le nom et le prénom de l'élève sont obligatoires.");
      return;
    }

    if (!computedClassInfo.class_id) {
      setError("Veuillez sélectionner une classe.");
      return;
    }

    if (tuitionAmount === "" || Number(tuitionAmount) < 0) {
      setError("Veuillez renseigner le solde / montant total de la scolarité.");
      return;
    }

    if (!parentName.trim() || !parentPhone.trim()) {
      setError("Le nom et le numéro de téléphone du parent sont obligatoires.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && studentToEdit) {
        updateStudent(studentToEdit.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim().toUpperCase(),
          gender,
          birth_date: birthDate || undefined,
          class_id: computedClassInfo.class_id,
          class_name: computedClassInfo.class_name,
          custom_tuition: Number(tuitionAmount),
          discount_amount: 0,
          discount_reason: undefined,
          parent: {
            ...studentToEdit.parent,
            full_name: parentName.trim(),
            relationship: parentRelationship,
            phone_primary: parentPhone.trim(),
            phone_whatsapp: parentPhone.trim(),
            profession: parentProfession.trim() || undefined,
            address: parentAddress.trim() || undefined,
          },
        });

        setIsSubmitting(false);
        if (onSuccess) onSuccess({ ...studentToEdit, first_name: firstName, last_name: lastName });
        onClose();
      } else {
        const created = addStudent({
          first_name: firstName.trim(),
          last_name: lastName.trim().toUpperCase(),
          gender,
          birth_date: birthDate || undefined,
          class_id: computedClassInfo.class_id,
          class_name: computedClassInfo.class_name,
          custom_tuition: Number(tuitionAmount),
          discount_amount: 0,
          parent_name: parentName.trim(),
          parent_relationship: parentRelationship,
          parent_phone: parentPhone.trim(),
          parent_whatsapp: parentPhone.trim(),
          parent_profession: parentProfession.trim() || undefined,
          parent_address: parentAddress.trim() || undefined,
        });

        setIsSubmitting(false);
        if (onSuccess) onSuccess(created);
        onClose();
      }
    } catch (err) {
      setError("Erreur lors de l'enregistrement de l'élève.");
      setIsSubmitting(false);
    }
  };

  const isLyceeSelected =
    selectedClassType === "cls-seconde" ||
    selectedClassType === "cls-premiere" ||
    selectedClassType === "cls-terminale";

  const isMaternelleSelected =
    selectedClassType === "maternelle" ||
    selectedClassType === "cls-ci-1" ||
    selectedClassType === "cls-ci-2";

  const isUnivSelected = selectedClassType === "cls-universite";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh] sm:max-h-[90vh]">
        {/* 1. Header Fixe */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold shadow-xs ${
                isEditing ? "bg-amber-600" : "bg-blue-600"
              }`}
            >
              {isEditing ? <Edit3 className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                {isEditing ? "Modifier la Fiche Élève" : "Inscrire un Nouvel Élève"}
              </h2>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? `Mise à jour des informations de ${studentToEdit?.first_name} ${studentToEdit?.last_name}`
                  : "Ajout fiche scolaire & contact tuteur"}
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

        {/* 2. Corps de Formulaire Déroulant */}
        <form id="student-enrollment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1 : Identité Élève */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              1. Informations de l&apos;Élève
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom *</label>
                <input
                  type="text"
                  placeholder="Ex: Koffi"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de famille *</label>
                <input
                  type="text"
                  placeholder="Ex: MENSAH"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Genre</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("M")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      gender === "M"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Garçon (M)
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender("F")}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      gender === "F"
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    Fille (F)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section : Choix de la Classe */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Sélectionnez la Classe / Niveau *
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-blue-600">
                  {computedClassInfo.level}
                </span>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setIsClassModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  >
                    + Nouvelle classe
                  </button>
                )}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
              {/* Dropdown Principal */}
              <select
                value={selectedClassType}
                onChange={(e) => handleClassTypeChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                required
              >
                {customClasses.length > 0 && (
                  <optgroup label="✨ CLASSES PERSONNALISÉES">
                    {customClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} ({cls.level})
                      </option>
                    ))}
                  </optgroup>
                )}

                <optgroup label="🧸 MATERNELLE">
                  <option value="maternelle">CI maternelle (1ère ou 2ème année)</option>
                </optgroup>

                <optgroup label="🎒 PRIMAIRE">
                  <option value="cls-cp1">CP1</option>
                  <option value="cls-cp2">CP2</option>
                  <option value="cls-ce1">CE1</option>
                  <option value="cls-ce2">CE2</option>
                  <option value="cls-cm1">CM1</option>
                  <option value="cls-cm2">CM2</option>
                </optgroup>

                <optgroup label="📚 COLLÈGE">
                  <option value="cls-6e">6e</option>
                  <option value="cls-5e">5e</option>
                  <option value="cls-4e">4e</option>
                  <option value="cls-3e">3e</option>
                </optgroup>

                <optgroup label="🎓 LYCÉE (avec choix de série)">
                  <option value="cls-seconde">Seconde (avec série ex: G2, A4, S...)</option>
                  <option value="cls-premiere">Première (avec série ex: G2, A4, D...)</option>
                  <option value="cls-terminale">Terminale (avec série ex: G2, A4, D...)</option>
                </optgroup>

                <optgroup label="🏛️ ENSEIGNEMENT SUPÉRIEUR">
                  <option value="cls-universite">Université (choix année + branche)</option>
                </optgroup>
              </select>

              {/* Sub-option 1 : CI Maternelle (Choix Année) */}
              {isMaternelleSelected && (
                <div className="p-3 bg-white rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-1 duration-150">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Options Maternelle : Choisir l&apos;année *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMaternelleYear("1ère année")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        maternelleYear === "1ère année"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      1ère année
                    </button>
                    <button
                      type="button"
                      onClick={() => setMaternelleYear("2ème année")}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                        maternelleYear === "2ème année"
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      2ème année
                    </button>
                  </div>
                </div>
              )}

              {/* Sub-option 2 : Lycée (Écrire / Choisir Série) */}
              {isLyceeSelected && (
                <div className="p-3 bg-white rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-1 duration-150 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Série du Lycée (ex: G2, A4, D, CD, F4...) *
                    </label>
                    <span className="text-[10px] text-slate-400">Saisie libre ou clic</span>
                  </div>

                  {/* Quick Series Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {["G2", "G1", "G3", "A4", "D", "C", "F4", "TI", "STG"].map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => setLyceeSerie(badge)}
                        className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-all cursor-pointer ${
                          lyceeSerie.toUpperCase() === badge
                            ? "bg-blue-600 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Écrire la série (ex: G2, A4, D, Scientifique...)"
                    value={lyceeSerie}
                    onChange={(e) => setLyceeSerie(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Sub-option 3 : Université (Choix Année + Écrire Branche) */}
              {isUnivSelected && (
                <div className="p-3 bg-white rounded-xl border border-blue-200 animate-in fade-in slide-in-from-top-1 duration-150 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Choisir l&apos;Année / Niveau Supérieur *
                    </label>
                    <select
                      value={univLevel}
                      onChange={(e) => setUnivLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Licence 1">Licence 1 (L1)</option>
                      <option value="Licence 2">Licence 2 (L2)</option>
                      <option value="Licence 3">Licence 3 (L3)</option>
                      <option value="Master 1">Master 1 (M1)</option>
                      <option value="Master 2">Master 2 (M2)</option>
                      <option value="Doctorat">Doctorat</option>
                      <option value="BTS 1">BTS 1ère Année</option>
                      <option value="BTS 2">BTS 2ème Année</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        2. Écrire la Branche / Spécialité *
                      </label>
                      <span className="text-[10px] text-slate-400">Ex: Gestion, Droit...</span>
                    </div>

                    {/* Quick Branch Suggestions */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {[
                        "Gestion & Finance",
                        "Droit",
                        "Informatique",
                        "Comptabilité & Audit",
                        "Marketing",
                        "Médecine",
                      ].map((branch) => (
                        <button
                          key={branch}
                          type="button"
                          onClick={() => setUnivBranch(branch)}
                          className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                            univBranch === branch
                              ? "bg-blue-600 text-white font-bold"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {branch}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      placeholder="Ex: Banque & Finance, Génie Logiciel, Droit des Affaires..."
                      value={univBranch}
                      onChange={(e) => setUnivBranch(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Real-time Class Name Preview */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 font-medium">Classe enregistrée :</span>
                <span className="font-extrabold text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-1 rounded-lg">
                  {computedClassInfo.class_name}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2 : Solde de la Scolarité (Remplacement direct des remises) */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                2. Solde / Montant de la Scolarité (FCFA) *
              </label>
              <span className="text-[11px] text-slate-400 font-medium">
                Montant total annuel dû
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1000"
                placeholder="Ex: 150000"
                value={tuitionAmount}
                onChange={(e) => setTuitionAmount(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full pl-3.5 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all tabular-nums"
                required
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                FCFA
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Ce montant correspond à la scolarité totale exacte attendue pour cet élève.
            </p>
          </div>

          {/* Section 3 : Parent / Tuteur */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              3. Parent / Tuteur Responsable
            </span>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom complet du Parent *</label>
                <input
                  type="text"
                  placeholder="Ex: Mme Akossiwa MENSAH"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Lien</label>
                <select
                  value={parentRelationship}
                  onChange={(e) => setParentRelationship(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mère">Mère</option>
                  <option value="Père">Père</option>
                  <option value="Tuteur">Tuteur</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Téléphone / WhatsApp *</label>
                <input
                  type="tel"
                  placeholder="Ex: +228 90 12 34 56"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Adresse / Quartier</label>
                <input
                  type="text"
                  placeholder="Ex: Tokoin, Lomé"
                  value={parentAddress}
                  onChange={(e) => setParentAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Profession du Parent (Optionnel)</label>
              <input
                type="text"
                placeholder="Ex: Commerçante, Enseignant, Fonctionnaire..."
                value={parentProfession}
                onChange={(e) => setParentProfession(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </form>

        {/* 3. Sticky Footer Fixe en bas avec Bouton de Validation */}
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
            form="student-enrollment-form"
            disabled={isSubmitting}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 text-white rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-98 cursor-pointer ${
              isEditing
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? "Enregistrement en cours..."
                : isEditing
                ? "Enregistrer les Modifications"
                : "Enregistrer l'Élève"}
            </span>
          </button>
        </div>
      </div>

      {/* Modal d'Ajout d'une Nouvelle Classe Personnalisée */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSuccess={(created) => {
          setSelectedClassType(created.id);
        }}
      />
    </div>
  );
}
