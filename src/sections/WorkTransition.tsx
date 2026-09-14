"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import Container from "@/components/ui/Container";
import SignalLines from "@/components/graphics/SignalLines";
import styles from "./WorkTransition.module.css";

export default function WorkTransition() {
  const transition = useRef<HTMLDivElement>(null);
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    if (!ready || prefersReducedMotion || !transition.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-work-marker]",
        { opacity: 0.35, y: isMobile ? 10 : 24 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: transition.current,
            start: "top 88%",
            end: "top 35%",
            scrub: 0.45,
          },
        },
      );
    }, transition);

    return () => context.revert();
  }, [ready, isMobile, prefersReducedMotion]);

  return (
    <div ref={transition} className={styles.transition} data-scroll-region data-section-boundary>
      <div className={styles.signal} data-boundary-geometry aria-hidden="true">
        <SignalLines variant="boundary" />
      </div>
      <Container>
        <div className={styles.depth} data-scroll-depth="-12">
          <div data-work-marker>
            <p className={styles.index}>01 / WORK</p>
            <p className={styles.title}>SELECTED SYSTEMS</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
