"use client";

import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import { useViewport } from "./ViewportProvider";
import { scheduleScrollRefresh } from "./scrollRefresh";

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const smooth = useRef<Lenis | null>(null);
  const { width, isMobile, hasFinePointer, prefersReducedMotion } = useViewport();
  const ready = width > 0;
  useEffect(() => {
    // Opt-in diagnostics for the local QA proxy; never exposed on a hosted site.
    if (!ready || !["localhost", "127.0.0.1"].includes(window.location.hostname) || !new URLSearchParams(window.location.search).has("motion-audit")) return;
    gsap.registerPlugin(ScrollTrigger);
    Object.assign(window, { __motionAudit: { gsap, ScrollTrigger, get lenis() { return smooth.current; } } });
    return () => { Reflect.deleteProperty(window, "__motionAudit"); };
  }, [ready]);

  useEffect(() => {
    if (!ready || isMobile || !hasFinePointer || prefersReducedMotion) return;
    gsap.registerPlugin(ScrollTrigger);

    const createScroll = () => {
      const controller = new Lenis({ autoRaf: false, anchors: true, lerp: 0.18, syncTouch: false });
      smooth.current = controller;
      return controller;
    };
    let lenis = createScroll();
    let unsubscribe = lenis.on("scroll", ScrollTrigger.update);
    let clickedFragment: string | null = null;
    let clickFrame = 0;
    let historyDestination: string | null = null;

    // Native anchor activation emits popstate too. Let that click's existing
    // Lenis animation run; a traversal to any other entry supersedes it.
    const trackAnchor = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.composedPath().find(node => node instanceof HTMLAnchorElement) as HTMLAnchorElement | undefined;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search || !url.hash) return;
      clickedFragment = url.href;
      cancelAnimationFrame(clickFrame);
      clickFrame = requestAnimationFrame(() => { clickedFragment = null; });
    };
    const traverse = () => {
      if (clickedFragment === location.href) {
        clickedFragment = null;
        historyDestination = null;
        return;
      }
      clickedFragment = null;
      historyDestination = location.href;
      if (lenis.isScrolling === "smooth") {
        // There is no public cancel-animation API. Retire the old controller
        // before another ticker frame; the browser owns native restoration.
        unsubscribe();
        lenis.destroy();
        lenis = createScroll();
        unsubscribe = lenis.on("scroll", ScrollTrigger.update);
      }
    };
    const finishTraversal = (event: HashChangeEvent) => {
      if (event.newURL !== historyDestination || event.newURL !== location.href) return;
      historyDestination = null;
      // hashchange follows native history restoration. Synchronize its actual
      // position before resolving a fragment whose saved entry was in flight.
      lenis.resize();
      let id: string;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const target = document.getElementById(id);
      if (!target) return;
      const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const bounds = target.getBoundingClientRect();
      const top = Math.min(lenis.limit, Math.max(0, bounds.top + window.scrollY - margin));
      const bottom = bounds.bottom + window.scrollY;
      // Keep the browser's saved reading position within a section. Correct
      // only an in-flight anchor entry restored outside its destination.
      if (target.matches("section") && (window.scrollY < top - 1 || window.scrollY >= bottom)) {
        lenis.scrollTo(top, { immediate: true });
      }
      ScrollTrigger.update();
    };
    window.addEventListener("click", trackAnchor, true);
    window.addEventListener("popstate", traverse);
    window.addEventListener("hashchange", finishTraversal);

    function tick(time: number) {
      if (document.visibilityState === "visible") lenis.raf(time * 1000);
    }

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    scheduleScrollRefresh();

    return () => {
      cancelAnimationFrame(clickFrame);
      window.removeEventListener("click", trackAnchor, true);
      window.removeEventListener("popstate", traverse);
      window.removeEventListener("hashchange", finishTraversal);
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      unsubscribe();
      lenis.destroy();
      smooth.current = null;
      scheduleScrollRefresh();
    };
  }, [ready, isMobile, hasFinePointer, prefersReducedMotion]);

  return <>{children}</>;
}
