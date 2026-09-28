"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useViewport } from "./ViewportProvider";
import styles from "./ScrollMotion.module.css";

export default function ScrollMotion({ children }: { children: ReactNode }) {
  const progress = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    if (!ready || !window.location.hash) return;

    const hash = decodeURIComponent(window.location.hash);
    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;

    let interrupted = false;
    const timers: number[] = [];

    const interrupt = () => {
      interrupted = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };

    const settle = () => {
      if (interrupted) return;
      ScrollTrigger.refresh();
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: "auto" });
      ScrollTrigger.update();
    };

    [80, 320, 900].forEach((delay) => timers.push(window.setTimeout(settle, delay)));
    window.addEventListener("wheel", interrupt, { passive: true, once: true });
    window.addEventListener("touchstart", interrupt, { passive: true, once: true });
    window.addEventListener("keydown", interrupt, { once: true });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("wheel", interrupt);
      window.removeEventListener("touchstart", interrupt);
      window.removeEventListener("keydown", interrupt);
    };
  }, [pathname, ready]);

  useEffect(() => {
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    if (!header) return;

    function updateHeader() {
      header?.toggleAttribute("data-scrolled", window.scrollY > 72);
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
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => gsap.set(progress.current, { scaleX: self.progress }),
          onRefresh: (self) => gsap.set(progress.current, { scaleX: self.progress }),
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-scroll-depth]").forEach((element) => {
        const region = element.closest<HTMLElement>("[data-scroll-region]");
        const depth = Number(element.dataset.scrollDepth);
        if (!region || !Number.isFinite(depth)) return;

        const distance = depth * (isMobile ? 0.35 : 1);
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
              scrub: 0.4,
            },
          },
        );
      });

      if (!isMobile) {
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
                scrub: 0.55,
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
                scrub: 0.55,
              },
            })
            .fromTo(paths, { strokeDashoffset: 1 }, { strokeDashoffset: 0, ease: "none", duration: 1 }, 0)
            .fromTo(nodes, { opacity: 0 }, { opacity: 0.58, ease: "none", duration: 0.3 }, 0.7)
            .fromTo(geometry, { y: 7 }, { y: -7, ease: "none", duration: 1 }, 0);
        });
      }
    });

    const main = document.querySelector("main");
    let refreshFrame = 0;
    let disposed = false;
    const scheduleRefresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const observer = main ? new ResizeObserver(scheduleRefresh) : null;
    if (main) observer?.observe(main);
    void document.fonts.ready.then(() => {
      if (!disposed) scheduleRefresh();
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [pathname, ready, isMobile, prefersReducedMotion]);

  return (
    <>
      <div ref={progress} className={styles.progress} aria-hidden="true" />
      {children}
    </>
  );
}
