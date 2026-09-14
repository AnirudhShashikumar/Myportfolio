"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./GestureGlobeFeature.module.css";

export default function GestureGlobeMotion({ children }: { children: ReactNode }) {
  const sequence = useRef<HTMLDivElement>(null);
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    const root = sequence.current;
    if (!root || !ready || isMobile || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motion = "active";

    const context = gsap.context(() => {
      const identity = root.querySelector<HTMLElement>("[data-gg-identity]");
      const statement = root.querySelector<HTMLElement>("[data-gg-statement]");
      const perception = root.querySelector<HTMLElement>("[data-gg-perception]");
      const interaction = root.querySelector<HTMLElement>("[data-gg-interaction]");
      const sphere = root.querySelector<HTMLElement>("[data-gg-sphere]");
      const secondHand = root.querySelector<HTMLElement>("[data-gg-second-hand]");
      const twoHandLabel = root.querySelector<HTMLElement>("[data-gg-two-hand-label]");
      const vector = root.querySelector<HTMLElement>("[data-gg-vector]");
      const reveal = root.querySelector<HTMLElement>("[data-gg-reveal]");
      const handLines = root.querySelectorAll<SVGPolylineElement>("[data-gg-hand-line]");
      const handPoints = root.querySelectorAll<SVGCircleElement>("[data-gg-hand-point]");

      if (!identity || !statement || !perception || !interaction || !sphere || !secondHand || !twoHandLabel || !vector || !reveal) return;

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.45,
            invalidateOnRefresh: true,
          },
        })
        .to(identity, { opacity: 0.48, y: -10, duration: 0.18 }, 0.2)
        .to(identity, { opacity: 0, y: -16, duration: 0.12 }, 0.38)
        .to(statement, { opacity: 0, y: -18, duration: 0.16 }, 0.24)
        .fromTo(perception, { opacity: 0, y: 20, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.2 }, 0.12)
        .fromTo(handLines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.23 }, 0.23)
        .fromTo(handPoints, { opacity: 0 }, { opacity: 1, duration: 0.14 }, 0.28)
        .fromTo(interaction, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.18 }, 0.4)
        .to(perception, { opacity: 0, y: -18, duration: 0.15 }, 0.41)
        .fromTo(vector, { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.13 }, 0.51)
        .fromTo(sphere, { opacity: 0.4, scale: 0.62, xPercent: 24 }, { opacity: 1, scale: 1, xPercent: -12, duration: 0.19 }, 0.48)
        .fromTo(secondHand, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.13 }, 0.65)
        .fromTo(twoHandLabel, { opacity: 0 }, { opacity: 1, duration: 0.12 }, 0.67)
        .to(sphere, { scale: 1.3, xPercent: 0, duration: 0.15 }, 0.66)
        .to(interaction, { opacity: 0, y: -18, duration: 0.17 }, 0.78)
        .fromTo(reveal, { opacity: 0, y: 34, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.2 }, 0.78);
    }, root);

    ScrollTrigger.refresh();

    return () => {
      context.revert();
      delete root.dataset.motion;
    };
  }, [ready, isMobile, prefersReducedMotion]);

  return <div ref={sequence} className={styles.sequence}>{children}</div>;
}
