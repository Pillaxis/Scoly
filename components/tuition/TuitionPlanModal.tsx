"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Layers, Check } from "lucide-react";
import { useScoly } from "@/lib/store";
import { TuitionPlan, TuitionInstallment } from "@/types/scoly";
import { formatFCFA } from "@/lib/utils";
import { ClassModal } from "@/components/classes/ClassModal";

interface TuitionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: TuitionPlan | null;
  preselectedClassId?: string;
  onSuccess?: (plan: TuitionPlan) => void;
}

interface EditableInstallment {
  id: string;
  title: string;
  due_date: string;
  amount: number | "";
}

/**
 * Format dynamic percentage with up to 2 decimals max (e.g. 50 %, 33,33 %, 16,67 %)
 */
function formatPercentage(amount: number | "", total: number): string {
  const val = typeof amount === "number" ? amount : Number(amount) || 0;
  if (!total || total <= 0 || val <= 0) return "0 %";
  const pct = (val / total) * 100;
  if (pct % 1 === 0) {
    return `${pct.toFixed(0)} %`;
  }
  return `${Number(pct.toFixed(2)).toString().replace(".", ",")} %`;
}

export function TuitionPlanModal({
  isOpen,
  onClose,
  planToEdit,
  preselectedClassId,
  onSuccess,
}: TuitionPlanModalProps) {
  const { classes, academicYear, school, updateTuitionPlan } = useScoly();

  const isEditing = Boolean(planToEdit);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);

  // Professional Class Selector States
  const [selectedClassType, setSelectedClassType] = useState<string>("cls-6e");
  const [maternelleYear, setMaternelleYear] = useState<"1ère année" | "2ème année">("1ère année");
  const [lyceeSerie, setLyceeSerie] = useState<string>("G2");
  const [univLevel, setUnivLevel] = useState<string>("Licence 1");
  const [univBranch, setUnivBranch] = useState<string>("Gestion & Finance");

  const [totalAmount, setTotalAmount] = useState<number | "">("");
  const [description, setDescription] = useState<string>("");
  const [installments, setInstallments] = useState<EditableInstallment[]>([]);

  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Custom classes created on the platform
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

    // Standard school class (CP1, CP2, CE1, CE2, CM1, CM2, 6e, 5e, 4e, 3e or custom class)
    const match = classes.find((c) => c.id === selectedClassType);
    return {
      class_id: match ? match.id : selectedClassType,
      class_name: match ? match.name : "Classe standard",
      level: match ? match.level : "Général",
    };
  }, [selectedClassType, maternelleYear, lyceeSerie, univLevel, univBranch, classes]);

  // Initialize or reset form on open / mode switch
  useEffect(() => {
    if (planToEdit) {
      setTotalAmount(planToEdit.total_amount);
      setDescription(planToEdit.description || "");
      setInstallments(
        planToEdit.installments.map((inst) => ({
          id: inst.id,
          title: inst.title,
          due_date: inst.due_date,
          amount: inst.amount,
        }))
      );

      // Detect Class type
      const cId = planToEdit.class_id;
      const cName = planToEdit.class_name || "";

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

      setError("");
      setSuccessMessage("");
    } else {
      // Creation mode: detect preselected class or default
      if (preselectedClassId) {
        if (preselectedClassId === "cls-ci-1") {
          setSelectedClassType("maternelle");
          setMaternelleYear("1ère année");
        } else if (preselectedClassId === "cls-ci-2") {
          setSelectedClassType("maternelle");
          setMaternelleYear("2ème année");
        } else {
          setSelectedClassType(preselectedClassId);
        }
      } else {
        setSelectedClassType("cls-6e");
      }

      setMaternelleYear("1ère année");
      setLyceeSerie("G2");
      setUnivLevel("Licence 1");
      setUnivBranch("Gestion & Finance");
      setTotalAmount("");
      setDescription("");

      // Default clean installment structure
      setInstallments([
        { id: `inst-1`, title: "1ère Tranche", due_date: "", amount: "" },
      ]);
      setError("");
      setSuccessMessage("");
    }
  }, [planToEdit, preselectedClassId, isOpen]);

  // Real-time financial calculations (Exact integers)
  const numTotal = Math.round(Number(totalAmount) || 0);

  const sumInstallments = useMemo(() => {
    return installments.reduce((sum, inst) => {
      const val = typeof inst.amount === "number" ? inst.amount : Number(inst.amount) || 0;
      return sum + Math.round(val);
    }, 0);
  }, [installments]);

  const remainingAmount = Math.max(0, numTotal - sumInstallments);
  const overflowAmount = Math.max(0, sumInstallments - numTotal);

  const isOverflown = numTotal > 0 && sumInstallments > numTotal;
  const isBalanced = numTotal > 0 && sumInstallments === numTotal;
  const isIncomplete = numTotal > 0 && sumInstallments < numTotal;

  // Validation rules for button enabling
  const isClassValid = Boolean(computedClassInfo.class_id && computedClassInfo.class_name);
  const isTotalAmountValid = numTotal > 0;
  const hasInstallments = installments.length > 0;
  const areInstallmentsValid =
    hasInstallments &&
    installments.every((inst) => {
      const amt = typeof inst.amount === "number" ? inst.amount : Number(inst.amount) || 0;
      return (
        inst.title.trim().length > 0 &&
        inst.due_date.trim().length > 0 &&
        amt > 0 &&
        !isNaN(amt)
      );
    });

  const isFormValid =
    isClassValid &&
    isTotalAmountValid &&
    hasInstallments &&
    areInstallmentsValid &&
    isBalanced;

  // Preset Splitting (1, 2, 3, 4 tranches with integer precision)
  const applyPreset = (count: number) => {
    const total = numTotal > 0 ? numTotal : 0;
    const split = total > 0 ? Math.floor(total / count) : "";

    const newInsts: EditableInstallment[] = [];
    for (let i = 0; i < count; i++) {
      const isLast = i === count - 1;
      const amount =
        typeof split === "number"
          ? isLast
            ? total - split * (count - 1)
            : split
          : "";

      let title = `${i + 1}ère Tranche`;
      if (count === 1) title = "Paiement Unique (100%)";
      else if (i === 1) title = "2ème Tranche";
      else if (i === 2) title = "3ème Tranche";
      else if (i === 3) title = "4ème Tranche";

      newInsts.push({
        id: `inst-${Date.now()}-${i + 1}`,
        title,
        due_date: "",
        amount: amount === 0 ? "" : amount,
      });
    }
    setInstallments(newInsts);
    setError("");
  };

  // Smart Balancing Button (+X FCFA or -X FCFA)
  const handleSmartBalance = () => {
    if (installments.length === 0 || numTotal <= 0) return;

    if (remainingAmount > 0) {
      // Add remaining to the last installment
      setInstallments((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        const currentLastAmt = Number(copy[lastIdx].amount) || 0;
        copy[lastIdx] = {
          ...copy[lastIdx],
          amount: currentLastAmt + remainingAmount,
        };
        return copy;
      });
    } else if (overflowAmount > 0) {
      // Adjust down the last installment
      setInstallments((prev) => {
        const copy = [...prev];
        const lastIdx = copy.length - 1;
        const currentLastAmt = Number(copy[lastIdx].amount) || 0;
        const adjustedAmt = currentLastAmt - overflowAmount;
        if (adjustedAmt > 0) {
          copy[lastIdx] = {
            ...copy[lastIdx],
            amount: adjustedAmt,
          };
        } else {
          // If reducing last installment is not enough, do a clean equal split
          const split = Math.floor(numTotal / copy.length);
          return copy.map((inst, i) => ({
            ...inst,
            amount: i === copy.length - 1 ? numTotal - split * (copy.length - 1) : split,
          }));
        }
        return copy;
      });
    }
    setError("");
  };

  const addInstallment = () => {
    const nextOrder = installments.length + 1;
    const defaultAmount = remainingAmount > 0 ? remainingAmount : "";
    let title = `${nextOrder}ème Tranche`;
    if (nextOrder === 1) title = "1ère Tranche";
    else if (nextOrder === 2) title = "2ème Tranche";
    else if (nextOrder === 3) title = "3ème Tranche";
    else if (nextOrder === 4) title = "4ème Tranche";

    setInstallments((prev) => [
      ...prev,
      {
        id: `inst-${Date.now()}-${nextOrder}`,
        title,
        due_date: "",
        amount: defaultAmount,
      },
    ]);
  };

  const removeInstallment = (id: string) => {
    if (installments.length <= 1) return;
    setInstallments((prev) => prev.filter((inst) => inst.id !== id));
  };

  const updateInstallment = (id: string, field: keyof EditableInstallment, value: any) => {
    setInstallments((prev) =>
      prev.map((inst) => {
        if (inst.id !== id) return inst;
        if (field === "amount") {
          if (value === "") return { ...inst, amount: "" };
          const numVal = Math.floor(Math.abs(Number(value)));
          return { ...inst, amount: isNaN(numVal) ? "" : numVal };
        }
        return { ...inst, [field]: value };
      })
    );
    setError("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!computedClassInfo.class_id) {
      setError("Veuillez sélectionner une classe.");
      return;
    }

    if (numTotal <= 0) {
      setError("Le montant total de la scolarité annuelle doit être supérieur à 0 FCFA.");
      return;
    }

    if (installments.length === 0) {
      setError("Veuillez définir au moins une tranche de paiement.");
      return;
    }

    // Validate each installment
    for (let i = 0; i < installments.length; i++) {
      const inst = installments[i];
      if (!inst.title.trim()) {
        setError(`La tranche #${i + 1} doit avoir un libellé (ex: 1ère Tranche).`);
        return;
      }
      if (!inst.due_date.trim()) {
        setError(`Veuillez indiquer une date d'échéance pour la tranche #${i + 1} (« ${inst.title} »).`);
        return;
      }
      const amt = Number(inst.amount);
      if (isNaN(amt) || amt <= 0) {
        setError(`Le montant de la tranche #${i + 1} (« ${inst.title} ») doit être supérieur à 0 FCFA.`);
        return;
      }
    }

    // Rule: Total installments <= Total annual tuition
    if (sumInstallments > numTotal) {
      const overflow = sumInstallments - numTotal;
      setError(
        `Le montant total des tranches (${formatFCFA(sumInstallments)}) dépasse la scolarité annuelle (${formatFCFA(numTotal)}). Dépassement : ${formatFCFA(overflow)}. Veuillez réduire le montant d'une ou plusieurs tranches.`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const planId = planToEdit ? planToEdit.id : `tp-${computedClassInfo.class_id}-${Date.now()}`;

      const finalInstallments: TuitionInstallment[] = installments.map((inst, index) => ({
        id: inst.id.startsWith("inst-") ? inst.id : `inst-${index + 1}`,
        tuition_plan_id: planId,
        title: inst.title.trim(),
        due_date: inst.due_date,
        amount: Math.round(Number(inst.amount)),
        installment_order: index + 1,
      }));

      const plan: TuitionPlan = {
        id: planId,
        school_id: school.id,
        academic_year_id: academicYear.id,
        class_id: computedClassInfo.class_id,
        class_name: computedClassInfo.class_name,
        total_amount: numTotal,
        description: description.trim() || `Scolarité ${computedClassInfo.class_name}`,
        installments: finalInstallments,
      };

      updateTuitionPlan(plan);
      setSuccessMessage("✓ Grille tarifaire enregistrée avec succès.");

      setTimeout(() => {
        setIsSubmitting(false);
        if (onSuccess) onSuccess(plan);
        onClose();
      }, 400);
    } catch (err: any) {
      setError(err?.message || "Erreur lors de l'enregistrement de la tarification.");
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh] sm:max-h-[92vh]">
        {/* En-tête Sobre */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 text-base">
                {isEditing ? "Modifier la Grille Tarifaire" : "Définir une Grille Tarifaire"}
              </h2>
              <p className="text-xs text-slate-500">
                Scolarité annuelle et découpage des tranches par classe
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

        {/* Corps de Formulaire Sobre */}
        <form
          id="tuition-plan-form"
          noValidate
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5"
        >
          {/* Message de succès */}
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{successMessage}</span>
            </div>
          )}

          {/* Message d'erreur */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{error}</span>
                {isOverflown && (
                  <button
                    type="button"
                    onClick={handleSmartBalance}
                    className="block mt-1 text-[11px] font-bold text-rose-800 underline cursor-pointer hover:text-rose-950"
                  >
                    👉 Ajuster automatiquement le montant des tranches (-{formatFCFA(overflowAmount)})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 1. Sélection Professionnelle de la Classe */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                1. Classe / Niveau *
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
              {/* Menu Déroulant Principal */}
              <select
                value={selectedClassType}
                onChange={(e) => setSelectedClassType(e.target.value)}
                disabled={isEditing}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs cursor-pointer"
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

              {/* Sous-option 1 : Maternelle (Choix Année) */}
              {isMaternelleSelected && (
                <div className="p-3 bg-white rounded-xl border border-blue-200 animate-in fade-in duration-150">
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

              {/* Sous-option 2 : Lycée (Choix / Saisie Série) */}
              {isLyceeSelected && (
                <div className="p-3 bg-white rounded-xl border border-blue-200 animate-in fade-in duration-150 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700">
                      Série du Lycée (ex: G2, A4, D, C...) *
                    </label>
                    <span className="text-[10px] text-slate-400">Saisie libre</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {["G2", "G1", "G3", "A4", "D", "C", "F4", "TI"].map((badge) => (
                      <button
                        key={badge}
                        type="button"
                        onClick={() => setLyceeSerie(badge)}
                        className={`px-2 py-0.5 rounded text-xs font-bold font-mono transition-all cursor-pointer ${
                          lyceeSerie.toUpperCase() === badge
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {badge}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Écrire la série (ex: G2, A4, D...)"
                    value={lyceeSerie}
                    onChange={(e) => setLyceeSerie(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold font-mono uppercase text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Sous-option 3 : Université (Choix Année + Branche) */}
              {isUnivSelected && (
                <div className="p-3 bg-white rounded-xl border border-blue-200 animate-in fade-in duration-150 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      1. Niveau Universitaire *
                    </label>
                    <select
                      value={univLevel}
                      onChange={(e) => setUnivLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Branche / Filière *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Gestion & Finance, Informatique, Droit..."
                      value={univBranch}
                      onChange={(e) => setUnivBranch(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Aperçu Classe */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-500 font-medium">Classe sélectionnée :</span>
                <span className="font-extrabold text-blue-700 bg-blue-100/70 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                  {computedClassInfo.class_name}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Montant Total Annuel */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                2. Montant Total de la Scolarité Annuelle (FCFA) *
              </label>
              <span className="text-[11px] text-slate-400">Montant net par élève</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min="1000"
                step="1000"
                placeholder="Ex: 150000"
                value={totalAmount}
                onChange={(e) => {
                  if (e.target.value === "") {
                    setTotalAmount("");
                  } else {
                    const val = Math.floor(Math.abs(Number(e.target.value)));
                    setTotalAmount(isNaN(val) ? "" : val);
                  }
                  setError("");
                }}
                className="w-full pl-3.5 pr-16 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                FCFA
              </span>
            </div>

            <div className="mt-2">
              <input
                type="text"
                placeholder="Description optionnelle (ex: Scolarité standard 2025-2026...)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 3. Découpage en Échéances / Tranches */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                3. Échéancier des Paiements (Tranches) *
              </label>
              <span className="text-[11px] text-slate-500 font-semibold">
                {installments.length} tranche(s)
              </span>
            </div>

            {/* Boutons sobres de découpage prédéfini */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { count: 1, label: "1 Tranche" },
                { count: 2, label: "2 Tranches" },
                { count: 3, label: "3 Tranches" },
                { count: 4, label: "4 Tranches" },
              ].map((p) => (
                <button
                  key={p.count}
                  type="button"
                  onClick={() => applyPreset(p.count)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    installments.length === p.count
                      ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Liste épurée des Tranches */}
            <div className="space-y-2.5">
              {installments.map((inst, index) => {
                const tranchePct = formatPercentage(inst.amount, numTotal);

                return (
                  <div
                    key={inst.id}
                    className="p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-800">
                          Tranche #{index + 1}
                        </span>
                        {numTotal > 0 && typeof inst.amount === "number" && inst.amount > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                            {tranchePct}
                          </span>
                        )}
                      </div>

                      {installments.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInstallment(inst.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-rose-50 cursor-pointer"
                          title="Supprimer cette tranche"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Libellé *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 1ère Tranche"
                          value={inst.title}
                          onChange={(e) => updateInstallment(inst.id, "title", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Date d&apos;échéance *
                        </label>
                        <input
                          type="date"
                          value={inst.due_date}
                          onChange={(e) => updateInstallment(inst.id, "due_date", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Montant (FCFA) *
                          </label>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            min="500"
                            step="1000"
                            placeholder="Ex: 50000"
                            value={inst.amount}
                            onChange={(e) =>
                              updateInstallment(inst.id, "amount", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 tabular-nums shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Actions sur les tranches : Ajouter & Équilibrer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={addInstallment}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Ajouter une Tranche</span>
              </button>

              {/* Bouton Équilibrer intelligent */}
              {numTotal > 0 && !isBalanced && (
                <button
                  type="button"
                  onClick={handleSmartBalance}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    isOverflown
                      ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  }`}
                >
                  <span>
                    {isOverflown
                      ? `Ajuster (-${formatFCFA(overflowAmount)})`
                      : `Équilibrer (+${formatFCFA(remainingAmount)})`}
                  </span>
                </button>
              )}
            </div>

            {/* 3 États Visuels Réactifs */}
            {numTotal > 0 && (
              <div
                className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 text-xs transition-all animate-in fade-in duration-150 ${
                  isOverflown
                    ? "bg-rose-50 border-rose-300 text-rose-900"
                    : isIncomplete
                    ? "bg-amber-50 border-amber-300 text-amber-900"
                    : "bg-emerald-50 border-emerald-300 text-emerald-900"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isOverflown ? (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  ) : isIncomplete ? (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-0.5">
                    <span className="font-black text-xs block">
                      {isOverflown
                        ? "❌ Échéancier invalide"
                        : isIncomplete
                        ? "⚠️ Échéancier à compléter"
                        : "✓ Échéancier équilibré"}
                    </span>

                    {isOverflown ? (
                      <p className="text-[11px] text-rose-800 leading-relaxed">
                        Le montant total des tranches (<strong>{formatFCFA(sumInstallments)}</strong>) dépasse la scolarité annuelle (<strong>{formatFCFA(numTotal)}</strong>).
                        <br />
                        <span className="font-extrabold text-rose-900">
                          Dépassement : {formatFCFA(overflowAmount)}.
                        </span>{" "}
                        Veuillez réduire le montant d&apos;une ou plusieurs tranches.
                      </p>
                    ) : isIncomplete ? (
                      <p className="text-[11px] text-amber-800">
                        Total tranches : <strong>{formatFCFA(sumInstallments)}</strong> / Scolarité : <strong>{formatFCFA(numTotal)}</strong>
                        <br />
                        <span className="font-bold text-amber-900">
                          {formatFCFA(remainingAmount)} restent à répartir.
                        </span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-emerald-800">
                        Total tranches : <strong>{formatFCFA(sumInstallments)}</strong> / Scolarité : <strong>{formatFCFA(numTotal)}</strong> • Reste : <strong>0 FCFA</strong>
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className={`font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-lg shrink-0 ${
                    isOverflown
                      ? "bg-rose-200/80 text-rose-900"
                      : isIncomplete
                      ? "bg-amber-200/80 text-amber-900"
                      : "bg-emerald-200/80 text-emerald-900"
                  }`}
                >
                  {formatPercentage(sumInstallments, numTotal)}
                </span>
              </div>
            )}
          </div>
        </form>

        {/* Footer Fixe Sobre avec Bouton d'Enregistrement Actif/Désactivé Dynamiquement */}
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
            form="tuition-plan-form"
            disabled={!isFormValid || isSubmitting}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 text-white rounded-xl text-xs font-extrabold shadow-md transition-all active:scale-98 ${
              !isFormValid || isSubmitting
                ? "bg-slate-400 opacity-60 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 cursor-pointer"
            }`}
            title={
              !isFormValid
                ? isOverflown
                  ? "Dépassement du montant total de la scolarité"
                  : "Veuillez renseigner la classe, la scolarité et les montants/dates des tranches"
                : "Enregistrer la grille tarifaire"
            }
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? "Enregistrement..."
                : isEditing
                ? "Mettre à Jour la Grille"
                : "Enregistrer la Grille"}
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
