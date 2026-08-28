"use client";

import React, { useState } from "react";
import {
  Layers,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  DollarSign,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useScoly } from "@/lib/store";
import { formatFCFA, formatDate } from "@/lib/utils";
import { TuitionPlan, SchoolClass } from "@/types/scoly";
import { TuitionPlanModal } from "@/components/tuition/TuitionPlanModal";
import { ClassModal } from "@/components/classes/ClassModal";

export default function TuitionPage() {
  const { classes, tuitionPlans, students, deleteTuitionPlan } = useScoly();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState<TuitionPlan | null>(null);
  const [preselectedClassId, setPreselectedClassId] = useState<string | undefined>(undefined);

  const [planToDelete, setPlanToDelete] = useState<TuitionPlan | null>(null);

  const handleOpenCreateModal = (classId?: string) => {
    setSelectedPlanToEdit(null);
    setPreselectedClassId(classId);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: TuitionPlan) => {
    setSelectedPlanToEdit(plan);
    setPreselectedClassId(plan.class_id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (planToDelete) {
      deleteTuitionPlan(planToDelete.id);
      setPlanToDelete(null);
    }
  };

  // Find classes with and without plans
  const configuredClassIds = new Set(tuitionPlans.map((tp) => tp.class_id));
  const unconfiguredClasses = classes.filter((c) => !configuredClassIds.has(c.id));

  // Compute total expected revenue across configured plans
  const totalRevenue = tuitionPlans.reduce((sum, plan) => {
    const studentCount = students.filter((s) => s.class_id === plan.class_id).length;
    return sum + plan.total_amount * studentCount;
  }, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              Scolarités & Grilles Tarifaires
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {tuitionPlans.length} / {classes.length} classes configurées
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Définition personnalisée des montants de scolarité et calendrier des échéances par classe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsClassModalOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une Classe</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-600/20 hover:shadow-md transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Configurer une Grille</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      {tuitionPlans.length === 0 ? (
        /* Empty State */
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs max-w-2xl mx-auto space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <Layers className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                Aucune Grille Tarifaire Définie
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                Toutes les données fictives ont été réinitialisées. Personnalisez maintenant les montants annuels et l&apos;échéancier des tranches selon vos classes.
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => handleOpenCreateModal()}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Définir une Première Grille Tarifaire</span>
              </button>
            </div>
          </div>

          {/* Direct Class Configuration Cards */}
          {classes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center space-y-3 max-w-xl mx-auto">
              <p className="text-xs font-bold text-slate-700">Aucune classe configurée</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Ajoutez vos classes pour leur attribuer leurs tarifs et échéances de paiement personnalisés.
              </p>
              <button
                type="button"
                onClick={() => setIsClassModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajouter une Première Classe</span>
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Classes Disponibles de l&apos;Établissement ({classes.length})
                </h3>
                <span className="text-[11px] text-slate-400">Cliquez pour configurer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {classes.map((cls) => (
                  <div
                    key={cls.id}
                    onClick={() => handleOpenCreateModal(cls.id)}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                          {cls.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">
                          {cls.level}
                        </span>
                      </div>
                      <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Plus className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span>Non tarifiée</span>
                      <span className="font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-[11px]">
                        Configurer <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Configured Tuition Plans Grid */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {tuitionPlans.map((plan) => {
              const cls = classes.find((c) => c.id === plan.class_id);
              const studentCount = students.filter((s) => s.class_id === plan.class_id).length;
              const expectedRevenue = plan.total_amount * studentCount;
              const installments = plan.installments || [];
              const planSum = installments.reduce((sum, inst) => sum + (Number(inst.amount) || 0), 0);
              const isComplete = planSum === plan.total_amount;
              const remainingToPlan = Math.max(0, plan.total_amount - planSum);

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                >
                  {/* Header */}
                  <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="font-extrabold text-slate-900 text-base">
                          {cls?.name || plan.class_name}
                        </h3>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded">
                          {cls?.level || "Général"}
                        </span>
                        {isComplete ? (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ 100% Réparti
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            ⚠️ {formatFCFA(remainingToPlan)} restant
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        <span>{studentCount} élève(s) inscrit(s)</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(plan)}
                        className="p-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
                        title="Modifier la tarification"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setPlanToDelete(plan)}
                        className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer cette grille"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amount Box */}
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider block">
                          Scolarité Annuelle
                        </span>
                        <span className="text-xl font-black font-mono text-blue-950 tabular-nums">
                          {formatFCFA(plan.total_amount)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Revenu attendu</span>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {formatFCFA(expectedRevenue)}
                        </span>
                      </div>
                    </div>

                    {/* Installments Breakdown */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Échéancier ({installments.length} tranches)
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">Échéance</span>
                      </div>

                      <div className="space-y-1.5">
                        {installments.map((inst, index) => (
                          <div
                            key={inst.id || index}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <div>
                                <p className="font-semibold text-slate-800 text-[11px]">{inst.title}</p>
                                <p className="text-[10px] text-slate-400">
                                  {inst.due_date ? formatDate(inst.due_date) : "—"}
                                </p>
                              </div>
                            </div>

                            <span className="font-mono font-bold text-slate-900 text-xs">
                              {formatFCFA(inst.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[200px]">{plan.description || "Grille standard"}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(plan)}
                      className="font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Ajuster
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Unconfigured Classes Section (if any left) */}
          {unconfiguredClasses.length > 0 && (
            <div className="pt-6 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Autres Classes en Attente de Tarification ({unconfiguredClasses.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cliquez sur une classe pour définir son tarif annuel et son calendrier.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {unconfiguredClasses.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => handleOpenCreateModal(cls.id)}
                    className="p-3 bg-white hover:bg-blue-50/50 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-left transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-slate-800 group-hover:text-blue-700 text-xs block truncate">
                      {cls.name}
                    </span>
                    <span className="text-[10px] text-slate-400 group-hover:text-blue-500 flex items-center gap-1 mt-1">
                      <Plus className="w-3 h-3" /> Tarifer
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Personnalisation / Création / Édition */}
      <TuitionPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPlanToEdit(null);
          setPreselectedClassId(undefined);
        }}
        planToEdit={selectedPlanToEdit}
        preselectedClassId={preselectedClassId}
      />

      {/* Modal de Confirmation de Suppression de Grille */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Supprimer la Grille Tarifaire</h3>
                <p className="text-xs text-slate-500">Classe : {planToDelete.class_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Êtes-vous sûr de vouloir supprimer la tarification de la classe <strong>{planToDelete.class_name}</strong> ({formatFCFA(planToDelete.total_amount)}) ?
              <br />
              <span className="text-slate-500 text-[11px] mt-1 block">
                Vous pourrez redéfinir une nouvelle grille tarifaire pour cette classe à tout moment.
              </span>
            </p>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white text-xs font-extrabold rounded-xl shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirmer la Suppression</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'Ajout / Modification Classe */}
      <ClassModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
      />
    </div>
  );
}
