"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useViewport } from "@/components/system/ViewportProvider";

export default function useScrollReveal() {
  const element = useRef<HTMLDivElement>(null);
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    if (!ready || prefersReducedMotion || !element.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const target = element.current;
    const context = gsap.context(() => {
      gsap.from(target.children, {
        opacity: 0,
        y: isMobile ? 14 : 28,
        duration: 0.6,
        stagger: 0.09,
        ease: "power2.out",
        scrollTrigger: {
          trigger: target,
          start: "top 85%",
          end: "top 60%",
          scrub: true,
        },
      });
    }, target);

    return () => context.revert();
  }, [ready, isMobile, prefersReducedMotion]);

  return element;
}
