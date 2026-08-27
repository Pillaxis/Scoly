import React from "react";
import { LandingHero } from "@/components/marketing/LandingHero";
import { LandingProblemSolution } from "@/components/marketing/LandingProblemSolution";
import { LandingFeatures } from "@/components/marketing/LandingFeatures";
import { LandingHowItWorks } from "@/components/marketing/LandingHowItWorks";
import { LandingPricing } from "@/components/marketing/LandingPricing";
import { LandingFAQ } from "@/components/marketing/LandingFAQ";
import { LandingCTA } from "@/components/marketing/LandingCTA";

export default function LandingPage() {
  return (
    <div className="space-y-0">
      <LandingHero />
      <LandingProblemSolution />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingFAQ />
      <LandingCTA />
    </div>
  );
}
