"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useEffect, useRef, type PointerEvent } from "react";
import SignalLines from "@/components/graphics/SignalLines";
import TechnicalGrid from "@/components/graphics/TechnicalGrid";
import Container from "@/components/ui/Container";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./Hero.module.css";

const IntelligenceField = dynamic(
  () => import("@/components/three/IntelligenceField"),
  { ssr: false },
);

export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const graphicPointer = useRef<HTMLDivElement>(null);
  const graphicMovement = useRef<{
    x: (value: number) => void;
    y: (value: number) => void;
  } | null>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    if (prefersReducedMotion || !hero.current) return;

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .from('[data-reveal="intro"]', { opacity: 0.45, y: 8, duration: 0.4 })
        .from('[data-reveal="title"]', { opacity: 0.45, y: 14, duration: 0.65 }, "-=0.22")
        .from('[data-reveal="copy"]', { opacity: 0.45, y: 10, duration: 0.5 }, "-=0.3")
        .from('[data-reveal="signals"]', { opacity: 0.45, y: 8, duration: 0.4 }, "-=0.25")
        .from('[data-reveal="actions"]', { opacity: 0.45, y: 8, duration: 0.45 }, "-=0.2");

    }, hero);

    return () => context.revert();
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (!ready || isMobile || prefersReducedMotion || !hero.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-graphics] [data-signal-path]",
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, duration: 1.3, stagger: 0.16, ease: "power1.out" },
      );
    }, hero);

    return () => context.revert();
  }, [ready, isMobile, prefersReducedMotion]);

  useEffect(() => {
    if (!ready || isMobile || prefersReducedMotion || !graphicPointer.current) return;

    const graphic = graphicPointer.current;
    const x = gsap.quickTo(graphic, "x", { duration: 0.8, ease: "power2.out" });
    const y = gsap.quickTo(graphic, "y", { duration: 0.8, ease: "power2.out" });
    graphicMovement.current = { x, y };

    return () => {
      graphicMovement.current = null;
      x.tween.kill();
      y.tween.kill();
      gsap.set(graphic, { x: 0, y: 0 });
    };
  }, [ready, isMobile, prefersReducedMotion]);

  useEffect(() => {
    if (!ready || prefersReducedMotion || !hero.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: hero.current,
            start: isMobile ? "top top-=32" : "top top-=64",
            end: "bottom top",
            scrub: 0.45,
          },
        })
        .to("[data-hero-title-shell]", {
          y: isMobile ? -10 : -24,
          scale: isMobile ? 1 : 0.985,
          opacity: isMobile ? 0.88 : 0.72,
          ease: "none",
          duration: 1,
        }, 0)
        .to("[data-hero-support-shell]", {
          y: isMobile ? -12 : -30,
          opacity: isMobile ? 0.75 : 0.52,
          ease: "none",
          duration: 1,
        }, 0)
        .to("[data-hero-field]", {
          x: isMobile ? 10 : 36,
          scale: isMobile ? 1 : 0.96,
          opacity: isMobile ? 0.12 : 0.4,
          ease: "none",
          duration: 1,
        }, 0)
        .to("[data-hero-atmosphere]", {
          opacity: 0.2,
          ease: "none",
          duration: 1,
        }, 0)
        .to("[data-hero-graphics]", {
          opacity: 0.2,
          ease: "none",
          duration: 1,
        }, 0)
        .to("[data-hero-scroll-cue]", {
          autoAlpha: 0,
          y: -8,
          ease: "none",
          duration: 0.22,
        }, 0);
    }, hero);

    return () => context.revert();
  }, [ready, isMobile, prefersReducedMotion]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (prefersReducedMotion || isMobile || event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.current.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    graphicMovement.current?.x(pointer.current.x * 8);
    graphicMovement.current?.y(pointer.current.y * 6);
  }

  return (
    <section
      ref={hero}
      id="home"
      aria-labelledby="home-heading"
      className={styles.hero}
      data-scroll-region
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
        graphicMovement.current?.x(0);
        graphicMovement.current?.y(0);
      }}
    >
      <div
        className={styles.atmosphere}
        aria-hidden="true"
        data-scroll-depth="-14"
        data-hero-atmosphere
      />

      <div className={styles.graphics} data-hero-graphics aria-hidden="true">
        <div ref={graphicPointer} className={styles.graphicsPointer}>
          <TechnicalGrid variant="hero" />
          <SignalLines variant="hero" />
        </div>
      </div>

      <div className={styles.field} aria-hidden="true" data-scroll-depth="-24" data-hero-field>
        <IntelligenceField
          pointer={pointer}
          reducedMotion={prefersReducedMotion}
          isMobile={isMobile}
        />
      </div>

      <Container className={styles.inner}>
        <div className={styles.content}>
          <div className={styles.intro} data-reveal="intro">
            <p className={styles.name}>ANIRUDH SHASHIKUMAR</p>
            <p className={styles.eyebrow}>COMPUTER SCIENCE · AI · ENGINEERING</p>
          </div>

          <div className={styles.titleShell} data-hero-title-shell>
            <h1 id="home-heading" className={styles.title} data-reveal="title">
              <span>Engineering the</span>{" "}
              <span>Next Era of</span>{" "}
              <span>Intelligence.</span>
            </h1>
          </div>

          <div data-hero-support-shell>
            <p className={styles.description} data-reveal="copy">
              I build intelligent systems that move between research and reality —
              from multimodal AI and computer vision to full-stack platforms, IoT
              systems, and experimental human-computer interfaces.
            </p>

            <ul className={styles.signals} aria-label="Disciplines" data-reveal="signals">
              <li>AI Engineer</li>
              <li>Full-Stack Developer</li>
              <li>Creative Technologist</li>
            </ul>

            <div className={styles.actions} data-reveal="actions">
              <a href="#work" className={styles.primaryAction}>
                Explore My Work <span aria-hidden="true">↗</span>
              </a>
              <a href="#lab" className={styles.secondaryAction}>
                Enter the Lab <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        <div className={styles.status}>
          <p>STATUS / BUILDING</p>
          <p>FOCUS / INTELLIGENT SYSTEMS</p>
        </div>

        <a href="#work" className={styles.scrollCue} data-hero-scroll-cue>
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </a>
      </Container>
    </section>
  );
}
