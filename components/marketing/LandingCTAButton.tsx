"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

interface LandingCTAButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "white" | "secondary";
  showArrow?: boolean;
}

export function LandingCTAButton({
  href,
  children,
  className = "",
  variant = "primary",
  showArrow = true,
}: LandingCTAButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    // Fast, crisp, professional micro-transition (~250ms)
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  const baseStyle =
    "inline-flex items-center justify-center gap-2.5 rounded-full font-extrabold text-sm sm:text-base transition-all duration-150 cursor-pointer select-none";

  const variantStyles = {
    primary:
      "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 px-8 py-4",
    white:
      "bg-white hover:bg-slate-50 active:scale-95 text-blue-700 shadow-md hover:shadow-lg px-8 py-4",
    secondary:
      "bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-800 px-6 py-3.5",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className={`${baseStyle} ${variantStyles[variant]} ${className} ${
        isLoading ? "opacity-90 cursor-wait" : ""
      }`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Ouverture...</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {showArrow && (
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          )}
        </>
      )}
    </button>
  );
}
