"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./DayflowFeature.module.css";

export default function DayflowMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { width, prefersReducedMotion } = useViewport();
  const canAnimate = width > 900 && !prefersReducedMotion;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !canAnimate) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const statement = root.querySelector<HTMLElement>("[data-df-statement]");
      const reveals = root.querySelectorAll<HTMLElement>("[data-df-reveal]");
      const roleRail = root.querySelector<HTMLElement>("[data-df-role-rail]");
      const roleLines = root.querySelectorAll<HTMLElement>("[data-df-role-line]");
      const architecture = root.querySelector<HTMLElement>(`.${styles.architecture}`);
      const architectureLines = root.querySelectorAll<HTMLElement>("[data-df-architecture-line]");

      if (statement) {
        gsap.fromTo(statement.querySelectorAll("span"),
          { y: 12, opacity: 0.65 },
          { y: 0, opacity: 1, stagger: 0.12, duration: 0.55, ease: "power1.out",
            scrollTrigger: { trigger: statement, start: "top 88%", once: true } },
        );
      }

      reveals.forEach((item) => {
        gsap.fromTo(item,
          { y: 18, opacity: 0.78, clipPath: "inset(0 0 6% 0)" },
          { y: 0, opacity: 1, clipPath: "inset(0 0 0 0)", ease: "none",
            scrollTrigger: { trigger: item, start: "top 92%", end: "top 60%", scrub: 0.4 } },
        );
      });

      if (roleRail && roleLines.length) {
        gsap.fromTo(roleLines,
          { scaleX: 0, transformOrigin: "center center" },
          { scaleX: 1, duration: 0.7, ease: "power1.out",
            scrollTrigger: { trigger: roleRail, start: "top 85%", once: true } },
        );
      }

      if (architecture && architectureLines.length) {
        gsap.fromTo(architectureLines,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, stagger: 0.08, ease: "none",
            scrollTrigger: { trigger: architecture, start: "top 88%", end: "bottom 55%", scrub: 0.45 } },
        );
      }
    }, root);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, [canAnimate]);

  return <div ref={rootRef} className={styles.motionRoot}>{children}</div>;
}
