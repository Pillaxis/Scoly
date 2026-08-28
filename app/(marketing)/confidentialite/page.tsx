import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowLeft, Lock, Database, EyeOff, UserCheck, Phone, Mail } from "lucide-react";

export const metadata = {
  title: "Politique de Confidentialité — SCOLY",
  description: "Engagement de confidentialité et de protection des données scolaires sur SCOLY.",
};

export default function ConfidentialitePage() {
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
            <ShieldCheck className="w-4 h-4" />
            <span>Protection des Données</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Politique de Confidentialité
          </h1>

          <p className="mt-3 text-sm text-slate-500 font-medium">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
            Chez <strong>SCOLY</strong>, nous accordons une importance primordiale à la confidentialité et à la sécurité des informations relatives à votre établissement scolaire, à vos élèves et à leurs parents. La présente politique détaille la façon dont nous traitons et protégeons vos données.
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
                Nature des données collectées
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              Pour assurer le bon fonctionnement de la plateforme de gestion scolaire, SCOLY collecte et héberge uniquement les données nécessaires à l&apos;administration de votre école :
            </p>
            <ul className="pl-16 list-disc space-y-1.5 text-slate-600">
              <li><strong>Informations de l&apos;école :</strong> Nom de l&apos;établissement, contacts de direction, grilles tarifaires et classes.</li>
              <li><strong>Données des élèves :</strong> Nom, prénom, matricule, classe et statut d&apos;inscription.</li>
              <li><strong>Données financières :</strong> Historique des paiements de scolarité, montants réglés, reliquats et reçus délivrés.</li>
              <li><strong>Contacts des tuteurs :</strong> Numéros de téléphone pour l&apos;envoi des reçus et rappels par WhatsApp/SMS.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                2
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Propriété et Souveraineté des Données
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              <strong>Votre école reste la propriétaire unique et exclusive de toutes ses données.</strong> SCOLY agit exclusivement en tant que prestataire technologique et n&apos;utilise en aucun cas vos listes d&apos;élèves ou vos registres comptables à des fins commerciales ou publicitaires.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                3
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Sécurité et Chiffrement
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              Nous mettons en œuvre des mesures de sécurité de pointe pour protéger l&apos;intégrité de vos informations scolaires :
            </p>
            <ul className="pl-16 list-disc space-y-1.5 text-slate-600">
              <li>Chiffrement systématique des transferts de données via protocole SSL / TLS (HTTPS).</li>
              <li>Isolation hermétique des bases de données par établissement (Multi-tenant RLS).</li>
              <li>Sauvegardes automatisées quotidiennes sur des serveurs sécurisés.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                4
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Non-partage des Données
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              SCOLY s&apos;engage formellement à ne jamais vendre, louer, céder ni partager aucune donnée scolaire avec des tiers, sauf obligation légale expresse ou demande directe de l&apos;établissement titulaire du compte.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                5
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Vos Droits et Contact Délégué
              </h2>
            </div>
            <p className="pl-11 text-slate-600">
              À tout moment, vous pouvez demander l&apos;exportation intégrale de vos données (au format Excel/CSV) ou leur suppression définitive de nos serveurs en contactant notre assistance :
            </p>
            <div className="mt-4 ml-11 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <div>
                <p className="font-bold text-slate-900">Support & Délégué à la protection des données :</p>
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
