"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type ReactNode } from "react";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let unsubscribe: (() => void) | null = null;

    function tick(time: number) {
      lenis?.raf(time * 1000);
    }

    function stop() {
      if (!lenis) return;

      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      unsubscribe?.();
      unsubscribe = null;
      lenis.destroy();
      lenis = null;
      ScrollTrigger.refresh();
    }

    function update() {
      if (reducedMotion.matches) {
        stop();
      } else if (!lenis) {
        lenis = new Lenis({ autoRaf: false, anchors: true });
        unsubscribe = lenis.on("scroll", () => ScrollTrigger.update());
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
        ScrollTrigger.refresh();
      }
    }

    reducedMotion.addEventListener("change", update);
    update();

    return () => {
      reducedMotion.removeEventListener("change", update);
      stop();
    };
  }, []);

  return <>{children}</>;
}
