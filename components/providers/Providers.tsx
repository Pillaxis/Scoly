"use client";

import React from "react";
import { ScolyProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return <ScolyProvider>{children}</ScolyProvider>;
}
