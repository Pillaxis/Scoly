import type { Metadata } from "next";
import { LandingNavbar } from "@/components/marketing/LandingNavbar";
import { LandingFooter } from "@/components/marketing/LandingFooter";

export const metadata: Metadata = {
  title: "SCOLY — La gestion scolaire, simplement | Logiciel pour Écoles Privées",
  description:
    "Suivez les élèves, encaissez les scolarités, éliminez les impayés oubliés et éditez des reçus officiels instantanément depuis un seul espace avec SCOLY.",
  keywords: [
    "gestion scolaire",
    "logiciel de gestion scolaire",
    "gestion école privée",
    "logiciel de caisse scolaire",
    "recouvrement scolarité",
    "reçus scolaires WhatsApp",
    "TMoney Flooz école",
    "Scoly",
  ],
  openGraph: {
    title: "SCOLY — La gestion scolaire, simplement",
    description:
      "Plateforme financière et administrative complète pour établissements scolaires. 15 jours d'essai gratuit sans carte bancaire.",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-teal-600 selection:text-white">
      <LandingNavbar />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
