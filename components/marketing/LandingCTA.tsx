"use client";

import React from "react";
import { LandingCTAButton } from "@/components/marketing/LandingCTAButton";

export function LandingCTA() {
  return (
    <section className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Solid Vibrant SCOLY Blue Rounded Banner */}
        <div className="rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-12 sm:p-16 text-center shadow-xl shadow-blue-600/15 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto">
            {/* Title */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Prêt à simplifier la gestion de votre école ?
            </h2>

            {/* Subtitle */}
            <p className="mt-4 text-sm sm:text-base text-blue-100 leading-relaxed font-normal">
              Rejoignez les établissements scolaires qui pilotent leur trésorerie avec SCOLY
            </p>

            {/* White Pill CTA Button with Instant Feedback */}
            <div className="mt-8 flex flex-col items-center justify-center">
              <LandingCTAButton
                href="/register"
                variant="white"
                className="w-full sm:w-auto"
              >
                Commencer gratuitement
              </LandingCTAButton>

              {/* Subtext */}
              <span className="mt-4 text-xs sm:text-sm text-blue-200 font-medium">
                Aucune carte requise
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
