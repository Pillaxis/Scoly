import React from "react";
import Link from "next/link";
import { FileText, ArrowLeft, CheckCircle2, Phone, Mail, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Conditions Générales d'Utilisation (CGU) — SCOLY",
  description: "Conditions générales d'utilisation du service de gestion scolaire SCOLY.",
};

export default function CGUPage() {
  return (
    <div className="py-12 sm:py-20 bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-500 hover:text-blue-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l&apos;accueil</span>
        </Link>

        {/* Document Header */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-wider mb-4 border border-blue-100">
            <FileText className="w-4 h-4" />
            <span>Cadre Contractuel</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Conditions Générales d&apos;Utilisation (CGU)
          </h1>

          <p className="mt-3 text-sm text-slate-500 font-medium">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
            Les présentes Conditions Générales d&apos;Utilisation régissent l&apos;accès et l&apos;utilisation de la plateforme <strong>SCOLY</strong> par les directeurs d&apos;école, fondateurs, comptables, secrétaires et administrateurs autorisés.
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                1
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Objet du Service
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              SCOLY fournit aux établissements scolaires une solution en ligne (SaaS) permettant de gérer les registres d&apos;élèves, le suivi des frais de scolarité, la délivrance de reçus de paiement et l&apos;analyse financière de l&apos;école.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                2
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Essai Gratuit de 15 Jours
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              À la création de son compte, chaque établissement bénéficie d&apos;un <strong>essai gratuit de 15 jours sans engagement</strong>, avec accès intégral à toutes les fonctionnalités (y compris le forfait PRO). Aucune coordonnée bancaire n&apos;est exigée pour débuter l&apos;essai.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                3
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Tarification et Modalités d&apos;Abonnement
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              À l&apos;issue des 15 jours d&apos;essai, l&apos;école choisit librement son forfait :
            </p>
            <ul className="pl-16 list-disc space-y-1.5 text-slate-600">
              <li><strong>START :</strong> 5 000 FCFA / mois (ou 42 000 FCFA / an avec -30%).</li>
              <li><strong>PRO :</strong> 10 000 FCFA / mois (ou 84 000 FCFA / an avec -30%).</li>
            </ul>
            <p className="pl-11 text-slate-600">
              Les règlements s&apos;effectuent par Mobile Money (TMoney, Flooz) ou carte bancaire. Les abonnements sont renouvelables sans engagement et peuvent être résiliés à tout moment.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                4
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Garantie 30 Jours Satisfait ou Remboursé
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              Tout paiement d&apos;abonnement donne droit à une <strong>garantie de remboursement intégral de 30 jours</strong>. Si la solution ne répond pas aux attentes de l&apos;établissement, un simple message au support permet d&apos;obtenir le remboursement complet.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                5
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Responsabilités de l&apos;Utilisateur
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              L&apos;établissement s&apos;engage à préserver la confidentialité de ses identifiants de connexion et à saisir des informations conformes à la réalité. L&apos;école est seule responsable de l&apos;exactitude des montants encaissés enregistrés sur la plateforme.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                6
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Contact & Assistance
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              Pour toute question relative aux présentes conditions ou à l&apos;utilisation de votre compte :
            </p>
            <div className="mt-4 ml-11 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <p className="font-bold text-slate-900">Service Support SCOLY :</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2 text-xs font-semibold">
                  <a href="tel:+22892880010" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Phone className="w-3.5 h-3.5" />
                    <span>+228 92 88 00 10</span>
                  </a>
                  <a href="mailto:nasserpillar4@gmail.com" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                    <Mail className="w-3.5 h-3.5" />
                    <span>nasserpillar4@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
