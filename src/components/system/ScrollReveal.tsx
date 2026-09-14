"use client";

import type { ReactNode } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";

export default function ScrollReveal({ children }: { children: ReactNode }) {
  const ref = useScrollReveal();

  return <div ref={ref}>{children}</div>;
}
