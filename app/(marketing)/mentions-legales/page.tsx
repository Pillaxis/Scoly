import React from "react";
import Link from "next/link";
import { Scale, ArrowLeft, Globe, Phone, Mail, Server, Shield } from "lucide-react";

export const metadata = {
  title: "Mentions Légales — SCOLY",
  description: "Mentions légales de la plateforme de gestion scolaire SCOLY.",
};

export default function MentionsLegalesPage() {
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
            <Scale className="w-4 h-4" />
            <span>Informations Légales</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Mentions Légales
          </h1>

          <p className="mt-3 text-sm text-slate-500 font-medium">
            En vigueur au : {new Date().toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="mt-6 pt-6 border-t border-slate-100 text-sm text-slate-600 leading-relaxed">
            Conformément aux dispositions régissant l&apos;édition de services numériques, les mentions suivantes définissent l&apos;identité et les coordonnées des responsables de la plateforme <strong>SCOLY</strong>.
          </div>
        </div>

        {/* Content Sections */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
          {/* Section 1: Éditeur */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                1
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Édition de la Plateforme
              </h2>
            </div>
            <div className="pl-11 text-slate-600 space-y-2">
              <p>
                La plateforme numérique <strong>SCOLY</strong> (accessible à l&apos;adresse web et sur application) est développée et exploitée par l&apos;équipe de développement et de gestion du projet SCOLY.
              </p>
              <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs sm:text-sm">
                <p><strong>Nom du projet :</strong> SCOLY (Gestion scolaire simplifiée)</p>
                <p><strong>Responsable de publication :</strong> Équipe SCOLY</p>
                <p><strong>Contact téléphonique & WhatsApp :</strong> +228 92 88 00 10</p>
                <p><strong>Courrier électronique :</strong> nasserpillar4@gmail.com</p>
              </div>
            </div>
          </section>

          {/* Section 2: Hébergement */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                2
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Hébergement et Infrastructure
              </h2>
            </div>
            <div className="pl-11 text-slate-600 space-y-2">
              <p>
                L&apos;infrastructure d&apos;hébergement et les bases de données sont gérées sur des serveurs cloud sécurisés à haute disponibilité garantissant une redondance continue et la sécurité des données hébergées.
              </p>
            </div>
          </section>

          {/* Section 3: Propriété intellectuelle */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                3
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Propriété Intellectuelle
              </h2>
            </div>
            <div className="pl-11 text-slate-600 space-y-2">
              <p>
                L&apos;ensemble des éléments composant la plateforme SCOLY (code source, interfaces visuelles, algorithmes, logos, textes et éléments graphiques) est protégé au titre des droits de propriété intellectuelle. Toute reproduction non autorisée est strictement interdite.
              </p>
            </div>
          </section>

          {/* Section 4: Contact et Réclamations */}
          <section className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs shrink-0">
                4
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Contact & Réclamations
              </h2>
            </div>
            <div className="pl-11 text-slate-600">
              <p>
                Pour toute réclamation, demande technique ou assistance directe relative au service SCOLY, vous pouvez joindre l&apos;équipe via :
              </p>
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs font-semibold">
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
