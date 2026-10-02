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
  hasFinePointer: boolean;
  isShort: boolean;
  isDocumentVisible: boolean;
  prefersReducedMotion: boolean;
};

const MOBILE_BREAKPOINT = 768;

const initialViewport: ViewportState = {
  width: 0,
  height: 0,
  isMobile: false,
  hasFinePointer: false,
  isShort: false,
  isDocumentVisible: true,
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
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let resizeFrame = 0;

    function update() {
      const nextViewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth < MOBILE_BREAKPOINT,
        hasFinePointer: finePointer.matches,
        isShort: window.innerHeight <= 600,
        isDocumentVisible: document.visibilityState === "visible",
        prefersReducedMotion: reducedMotion.matches,
      };

      setViewport((current) =>
        current.width === nextViewport.width &&
        current.height === nextViewport.height &&
        current.isMobile === nextViewport.isMobile &&
        current.hasFinePointer === nextViewport.hasFinePointer &&
        current.isShort === nextViewport.isShort &&
        current.isDocumentVisible === nextViewport.isDocumentVisible &&
        current.prefersReducedMotion === nextViewport.prefersReducedMotion
          ? current
          : nextViewport,
      );
    }

    update();
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(update);
    };
    window.addEventListener("resize", onResize, { passive: true });
    reducedMotion.addEventListener("change", update);
    finePointer.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);

    return () => {
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
      reducedMotion.removeEventListener("change", update);
      finePointer.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <ViewportContext.Provider value={viewport}>
      {children}
    </ViewportContext.Provider>
  );
}
