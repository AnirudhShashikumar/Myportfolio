"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./AlgaeOSFeature.module.css";

export default function AlgaeOSMotion({ children }: { children: ReactNode }) {
  const feature = useRef<HTMLDivElement>(null);
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    const root = feature.current;
    if (!root || !ready || isMobile || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      const flow = root.querySelector<HTMLElement>("[data-ao-flow]");
      const line = root.querySelector<SVGPathElement>("[data-ao-flow-line]");
      const sensor = root.querySelector<SVGCircleElement>("[data-ao-sensor]");
      const telemetry = root.querySelector<HTMLElement>("[data-ao-telemetry]");
      const statement = root.querySelector<HTMLElement>("[data-ao-statement]");
      const prototypeImage = root.querySelector<HTMLImageElement>(`.${styles.prototypeImage}`);
      const reveals = root.querySelectorAll<HTMLElement>("[data-ao-reveal]");

      if (flow && line) {
        gsap.fromTo(
          line,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: flow,
              start: "top 85%",
              end: "bottom 35%",
              scrub: 0.45,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      if (flow && sensor) {
        gsap.fromTo(
          sensor,
          { scale: 1, opacity: 1, transformOrigin: "center center" },
          {
            scale: 1.6,
            opacity: 0.45,
            duration: 0.55,
            repeat: 1,
            yoyo: true,
            ease: "sine.inOut",
            scrollTrigger: { trigger: flow, start: "top 70%", once: true },
          },
        );
      }

      if (telemetry) {
        gsap.fromTo(
          telemetry,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: telemetry,
              start: "top 90%",
              end: "top 60%",
              scrub: 0.45,
            },
          },
        );
      }

      if (statement) {
        gsap.fromTo(
          statement.querySelectorAll("span"),
          { y: 14, opacity: 0.72 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.09,
            ease: "power1.out",
            scrollTrigger: { trigger: statement, start: "top 87%", once: true },
          },
        );
      }

      if (prototypeImage) {
        gsap.fromTo(
          prototypeImage,
          { y: 0, scale: 1.025 },
          {
            y: -7,
            scale: 1.025,
            ease: "none",
            scrollTrigger: {
              trigger: prototypeImage,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          },
        );
      }

      reveals.forEach((item) => {
        gsap.fromTo(
          item,
          { opacity: 0.72, y: 20, clipPath: "inset(0 0 7% 0)" },
          {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0 0 0)",
            ease: "none",
            scrollTrigger: {
              trigger: item,
              start: "top 90%",
              end: "top 57%",
              scrub: 0.4,
              invalidateOnRefresh: true,
            },
          },
        );
      });
    }, root);

    ScrollTrigger.refresh();

    return () => context.revert();
  }, [ready, isMobile, prefersReducedMotion]);

  return <div ref={feature} className={styles.motionRoot}>{children}</div>;
}
