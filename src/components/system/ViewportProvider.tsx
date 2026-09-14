"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ViewportState = {
  width: number;
  height: number;
  isMobile: boolean;
  prefersReducedMotion: boolean;
};

const MOBILE_BREAKPOINT = 768;

const initialViewport: ViewportState = {
  width: 0,
  height: 0,
  isMobile: false,
  prefersReducedMotion: true,
};

const ViewportContext = createContext<ViewportState | null>(null);

export function useViewport() {
  const viewport = useContext(ViewportContext);

  if (!viewport) {
    throw new Error("useViewport must be used within ViewportProvider");
  }

  return viewport;
}

export default function ViewportProvider({ children }: { children: ReactNode }) {
  const [viewport, setViewport] = useState(initialViewport);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function update() {
      const nextViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < MOBILE_BREAKPOINT,
        prefersReducedMotion: reducedMotion.matches,
      };

      setViewport((current) =>
        current.width === nextViewport.width &&
        current.height === nextViewport.height &&
        current.isMobile === nextViewport.isMobile &&
        current.prefersReducedMotion === nextViewport.prefersReducedMotion
          ? current
          : nextViewport,
      );
    }

    update();
    window.addEventListener("resize", update);
    reducedMotion.addEventListener("change", update);

    return () => {
      window.removeEventListener("resize", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
}
