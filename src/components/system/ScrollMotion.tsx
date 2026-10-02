"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useViewport } from "./ViewportProvider";
import { scheduleScrollRefresh } from "./scrollRefresh";
import styles from "./ScrollMotion.module.css";

export default function ScrollMotion({ children }: { children: ReactNode }) {
  const progress = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { width, isMobile, hasFinePointer, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    if (!ready || !window.location.hash) return;

    let id: string;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;

    let interrupted = false;

    const interrupt = () => {
      interrupted = true;
      ScrollTrigger.removeEventListener("refresh", settle);
    };

    const settle = () => {
      if (interrupted) return;
      const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - margin);
      window.scrollTo({ top, behavior: "auto" });
      ScrollTrigger.update();
    };

    ScrollTrigger.addEventListener("refresh", settle);
    void document.fonts.ready.then(() => { if (!interrupted) scheduleScrollRefresh(); });
    const settleTimer = window.setTimeout(interrupt, 1200);
    window.addEventListener("wheel", interrupt, { passive: true, once: true });
    window.addEventListener("touchstart", interrupt, { passive: true, once: true });
    window.addEventListener("keydown", interrupt, { once: true });

    return () => {
      interrupted = true;
      clearTimeout(settleTimer);
      ScrollTrigger.removeEventListener("refresh", settle);
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", interrupt);
    };
  }, [pathname, ready]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;

    function updateHeader() {
      const scrolled = window.scrollY > 72;
      if (header?.hasAttribute("data-scrolled") !== scrolled) header?.toggleAttribute("data-scrolled", scrolled);
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, [pathname]);

  useEffect(() => {
    if (!ready || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      if (progress.current) {
        gsap.set(progress.current, { scaleX: 0 });
        const setProgress = gsap.quickSetter(progress.current, "scaleX");
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => setProgress(self.progress),
          onRefresh: (self) => setProgress(self.progress),
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-scroll-depth]").forEach((element) => {
        const region = element.closest<HTMLElement>("[data-scroll-region]");
        const depth = Number(element.dataset.scrollDepth);
        if (!region || !Number.isFinite(depth)) return;

        if (!hasFinePointer || isMobile) return;
        const distance = depth;
        gsap.fromTo(
          element,
          { y: -distance / 2 },
          {
            y: distance / 2,
            ease: "none",
            scrollTrigger: {
              trigger: region,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      if (hasFinePointer && !isMobile) {
        gsap.utils.toArray<HTMLElement>("[data-section-field]").forEach((field) => {
          const section = field.closest("section");
          if (!section) return;

          gsap.fromTo(
            field,
            { opacity: 0.45, y: 10 },
            {
              opacity: 1,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                start: "top 90%",
                end: "top 40%",
                scrub: true,
              },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-section-boundary]").forEach((boundary) => {
          const paths = boundary.querySelectorAll<SVGPathElement>("[data-signal-path]");
          const nodes = boundary.querySelectorAll<SVGCircleElement>("[data-signal-node]");
          const geometry = boundary.querySelector<HTMLElement>("[data-boundary-geometry]");
          if (!paths.length || !geometry) return;

          gsap
            .timeline({
              scrollTrigger: {
                trigger: boundary,
                start: "top 92%",
                end: "bottom 35%",
                scrub: true,
              },
            })
            .fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0)
            .fromTo(nodes, { opacity: 0 }, { opacity: 0.58, ease: "none", duration: 0.3 }, 0.7)
            .fromTo(geometry, { y: 7 }, { y: -7, ease: "none", duration: 1 }, 0);
        });
      }
    });

    const main = document.querySelector("main");
    let disposed = false;
    let previousWidth = 0;
    let previousHeight = 0;
    const scheduleRefresh: ResizeObserverCallback = (entries) => {
      const { width, height } = entries[0].contentRect;
      if (Math.abs(width - previousWidth) < 1 && Math.abs(height - previousHeight) < 1) return;
      previousWidth = width;
      previousHeight = height;
      scheduleScrollRefresh();
    };
    const observer = main ? new ResizeObserver(scheduleRefresh) : null;
    if (main) observer?.observe(main);
    void document.fonts.ready.then(() => {
      if (!disposed) scheduleScrollRefresh();
    });
    const onVisibility = () => {
      if (document.visibilityState === "visible") scheduleScrollRefresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    ScrollTrigger.config({ ignoreMobileResize: true });

    return () => {
      disposed = true;
      observer?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      context.revert();
    };
  }, [pathname, ready, isMobile, hasFinePointer, prefersReducedMotion]);

  return (
    <>
      <div ref={progress} className={styles.progress} aria-hidden="true" />
      {children}
    </>
  );
}
