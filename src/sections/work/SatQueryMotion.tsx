"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./SatQueryFeature.module.css";

export default function SatQueryMotion({ children }: { children: ReactNode }) {
  const sequence = useRef<HTMLDivElement>(null);
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    const root = sequence.current;
    if (!root || !ready || isMobile || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motion = "active";

    const context = gsap.context(() => {
      const identity = root.querySelector<HTMLElement>("[data-sq-identity]");
      const statement = root.querySelector<HTMLElement>("[data-sq-statement]");
      const observation = root.querySelector<HTMLElement>("[data-sq-observation]");
      const analysis = root.querySelector<HTMLElement>("[data-sq-analysis]");
      const routes = root.querySelector<HTMLElement>("[data-sq-routes]");
      const router = root.querySelector<HTMLElement>("[data-sq-router]");
      const evidence = root.querySelector<HTMLElement>("[data-sq-evidence]");
      const product = root.querySelector<HTMLElement>("[data-sq-product]");
      const routeLines = root.querySelectorAll<SVGPathElement>("[data-sq-route-line]");
      const routeNode = root.querySelector<SVGCircleElement>("[data-sq-route-node]");

      if (!identity || !statement || !observation || !analysis || !routes || !router || !evidence || !product || !routeNode) return;

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.55,
            invalidateOnRefresh: true,
          },
        })
        .to(identity, { opacity: 0.55, y: -12, duration: 0.2 }, 0.18)
        .to(statement, { opacity: 0, y: -18, scale: 0.985, duration: 0.17 }, 0.23)
        .fromTo(observation, { opacity: 0, y: 24, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.22 }, 0.12)
        .fromTo(analysis, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.18 }, 0.38)
        .fromTo(routes, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.15 }, 0.4)
        .fromTo(routeLines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.17 }, 0.46)
        .fromTo(router, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.52)
        .fromTo(routeNode, { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0.58)
        .fromTo(evidence, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.13 }, 0.57)
        .to(observation, { opacity: 0.35, duration: 0.17 }, 0.5)
        .to([identity, observation, analysis], { opacity: 0, y: -18, duration: 0.17 }, 0.76)
        .fromTo(product, { opacity: 0, y: 42, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.21 }, 0.76);
    }, root);

    ScrollTrigger.refresh();

    return () => {
      context.revert();
      delete root.dataset.motion;
    };
  }, [ready, isMobile, prefersReducedMotion]);

  return <div ref={sequence} className={styles.sequence}>{children}</div>;
}
