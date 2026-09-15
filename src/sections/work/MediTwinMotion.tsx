"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./MediTwinFeature.module.css";

export default function MediTwinMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { width, prefersReducedMotion } = useViewport();
  const canAnimate = width > 900 && !prefersReducedMotion;

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !canAnimate) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const statement = root.querySelector<HTMLElement>("[data-mt-statement]");
      const pathSegments = root.querySelectorAll<HTMLElement>("[data-mt-path]");
      const reveals = root.querySelectorAll<HTMLElement>("[data-mt-reveal]");
      const evidenceImage = root.querySelector<HTMLImageElement>(`.${styles.certificate} img`);

      if (statement) {
        gsap.fromTo(
          statement.querySelectorAll("span"),
          { y: 12, opacity: 0.65 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            stagger: 0.1,
            ease: "power1.out",
            scrollTrigger: { trigger: statement, start: "top 88%", once: true },
          },
        );
      }

      if (pathSegments.length) {
        gsap.fromTo(
          pathSegments,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            stagger: 0.08,
            duration: 0.45,
            ease: "power1.out",
            scrollTrigger: { trigger: pathSegments[0], start: "top 90%", once: true },
          },
        );
      }

      reveals.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0.76, clipPath: "inset(0 0 7% 0)" },
          {
            opacity: 1,
            clipPath: "inset(0 0 0 0)",
            ease: "none",
            scrollTrigger: { trigger: item, start: "top 92%", end: "top 68%", scrub: 0.35 },
          },
        );
      });

      if (evidenceImage) {
        gsap.fromTo(
          evidenceImage,
          { y: 0, scale: 1.012 },
          {
            y: -5,
            scale: 1.012,
            ease: "none",
            scrollTrigger: { trigger: evidenceImage, start: "top bottom", end: "bottom top", scrub: 0.5 },
          },
        );
      }
    }, root);

    ScrollTrigger.refresh();
    return () => context.revert();
  }, [canAnimate]);

  return <div ref={rootRef} className={styles.motionRoot}>{children}</div>;
}
