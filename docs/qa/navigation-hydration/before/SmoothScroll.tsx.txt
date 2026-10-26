"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, type ReactNode } from "react";
import { useViewport } from "./ViewportProvider";
import { scheduleScrollRefresh } from "./scrollRefresh";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const { width, isMobile, hasFinePointer, prefersReducedMotion } = useViewport();
  const ready = width > 0;
  useEffect(() => {
    // Opt-in diagnostics for the local QA proxy; never exposed on a hosted site.
    if (!ready || !["localhost", "127.0.0.1"].includes(window.location.hostname) || !new URLSearchParams(window.location.search).has("motion-audit")) return;
    gsap.registerPlugin(ScrollTrigger);
    Object.assign(window, { __motionAudit: { gsap, ScrollTrigger } });
    return () => { Reflect.deleteProperty(window, "__motionAudit"); };
  }, [ready]);

  useEffect(() => {
    if (!ready || isMobile || !hasFinePointer || prefersReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({ autoRaf: false, anchors: true, lerp: 0.18, syncTouch: false });
    const unsubscribe = lenis.on("scroll", ScrollTrigger.update);

    function tick(time: number) {
      if (document.visibilityState === "visible") lenis.raf(time * 1000);
    }

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    scheduleScrollRefresh();

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      unsubscribe();
      lenis.destroy();
      scheduleScrollRefresh();
    };
  }, [ready, isMobile, hasFinePointer, prefersReducedMotion]);

  return <>{children}</>;
}
