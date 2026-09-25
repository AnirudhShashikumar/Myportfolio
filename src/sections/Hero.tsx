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

// Domain signals that replace inflated title-like labels.
// These communicate direction, not employment claims.
const DOMAIN_SIGNALS = [
  "AI",
  "VISION",
  "FULL-STACK",
  "IoT",
  "MULTIMODAL",
] as const;

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

  // ── Entrance choreography ─────────────────────────────────────────────────
  // Near-simultaneous reveal: identity → headline → copy → actions.
  // Total perceived duration ~1.2 s. No per-character animation.
  useEffect(() => {
    if (prefersReducedMotion || !hero.current) return;

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        // Identity: name + discipline tag
        .from('[data-reveal="intro"]', {
          opacity: 0,
          y: 10,
          duration: 0.45,
        })
        // Headline: dominant, comes in fractionally after identity resolves
        .from('[data-reveal="title"]', {
          opacity: 0,
          y: 18,
          duration: 0.7,
        }, "-=0.22")
        // Supporting copy + domain signals
        .from('[data-reveal="copy"]', {
          opacity: 0,
          y: 12,
          duration: 0.5,
        }, "-=0.35")
        .from('[data-reveal="domains"]', {
          opacity: 0,
          y: 8,
          duration: 0.4,
        }, "-=0.28")
        // CTAs
        .from('[data-reveal="actions"]', {
          opacity: 0,
          y: 8,
          duration: 0.4,
        }, "-=0.22");
    }, hero);

    return () => context.revert();
  }, [prefersReducedMotion]);

  // ── Signal line entrance ──────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || isMobile || prefersReducedMotion || !hero.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-hero-graphics] [data-signal-path]",
        { strokeDashoffset: 1 },
        {
          strokeDashoffset: 0,
          duration: 1.4,
          stagger: 0.18,
          ease: "power1.out",
        },
      );
    }, hero);

    return () => context.revert();
  }, [ready, isMobile, prefersReducedMotion]);

  // ── Pointer-driven graphic parallax ──────────────────────────────────────
  useEffect(() => {
    if (!ready || isMobile || prefersReducedMotion || !graphicPointer.current) return;

    const graphic = graphicPointer.current;
    const x = gsap.quickTo(graphic, "x", { duration: 0.9, ease: "power2.out" });
    const y = gsap.quickTo(graphic, "y", { duration: 0.9, ease: "power2.out" });
    graphicMovement.current = { x, y };

    return () => {
      graphicMovement.current = null;
      x.tween.kill();
      y.tween.kill();
      gsap.set(graphic, { x: 0, y: 0 });
    };
  }, [ready, isMobile, prefersReducedMotion]);

  // ── Scroll departure ──────────────────────────────────────────────────────
  // As the visitor scrolls away, supporting information recedes faster than
  // the headline (which lingers slightly longer), and the constellation drifts
  // rightward — suggesting the abstract system is beginning to organise.
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
        // Headline recedes last — remains readable longest
        .to("[data-hero-title-shell]", {
          y: isMobile ? -10 : -22,
          scale: isMobile ? 1 : 0.988,
          opacity: isMobile ? 0.88 : 0.72,
          ease: "none",
          duration: 1,
        }, 0)
        // Supporting copy + domains recede first
        .to("[data-hero-support-shell]", {
          y: isMobile ? -14 : -34,
          opacity: isMobile ? 0.72 : 0.45,
          ease: "none",
          duration: 1,
        }, 0)
        // Constellation drifts outward — suggesting convergence/organisation
        .to("[data-hero-field]", {
          x: isMobile ? 12 : 40,
          scale: isMobile ? 1 : 0.958,
          opacity: isMobile ? 0.14 : 0.38,
          ease: "none",
          duration: 1,
        }, 0)
        .to("[data-hero-atmosphere]", {
          opacity: 0.18,
          ease: "none",
          duration: 1,
        }, 0)
        .to("[data-hero-graphics]", {
          opacity: 0.18,
          ease: "none",
          duration: 1,
        }, 0)
        .to("[data-hero-scroll-cue]", {
          autoAlpha: 0,
          y: -8,
          ease: "none",
          duration: 0.2,
        }, 0);
    }, hero);

    return () => context.revert();
  }, [ready, isMobile, prefersReducedMotion]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (prefersReducedMotion || isMobile || event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.current.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    // Restrained parallax — 8px / 6px max offset
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
      {/* Atmospheric depth gradient */}
      <div
        className={styles.atmosphere}
        aria-hidden="true"
        data-scroll-depth="-14"
        data-hero-atmosphere
      />

      {/* Technical grid + signal line overlay */}
      <div className={styles.graphics} data-hero-graphics aria-hidden="true">
        <div ref={graphicPointer} className={styles.graphicsPointer}>
          <TechnicalGrid variant="hero" />
          <SignalLines variant="hero" />
        </div>
      </div>

      {/* Engineering Constellation (Three.js) */}
      <div
        className={styles.field}
        aria-hidden="true"
        data-scroll-depth="-24"
        data-hero-field
      >
        <IntelligenceField
          pointer={pointer}
          reducedMotion={prefersReducedMotion}
          isMobile={isMobile}
        />
      </div>

      <Container className={styles.inner}>
        <div className={styles.content}>

          {/* ── Identity block ── */}
          <div className={styles.intro} data-reveal="intro">
            <p className={styles.name}>ANIRUDH SHASHIKUMAR</p>
            {/*
              Discipline: domain-based, not title-based.
              "COMPUTER SCIENCE ENGINEERING" states study/field.
              This replaces "AI Engineer · Full-Stack Developer · Creative Technologist"
              which implied unsupported professional seniority.
            */}
            <p className={styles.eyebrow}>COMPUTER SCIENCE ENGINEERING</p>
          </div>

          {/* ── Primary headline ── */}
          <div className={styles.titleShell} data-hero-title-shell>
            <h1 id="home-heading" className={styles.title} data-reveal="title">
              <span>Engineering the</span>{" "}
              <span>Next Era of</span>{" "}
              <span>Intelligence.</span>
            </h1>
          </div>

          {/* ── Supporting copy + domain signals ── */}
          <div data-hero-support-shell>
            <p className={styles.description} data-reveal="copy">
              I build systems across AI, vision, software, and the physical world.
            </p>

            {/*
              Domain signals: communicates direction across five areas.
              Replaces the former "AI Engineer / Full-Stack Developer / Creative Technologist"
              title list. These align with the Engineering Constellation in the canvas.
            */}
            <div
              className={styles.domains}
              aria-label="Engineering domains"
              data-reveal="domains"
            >
              {DOMAIN_SIGNALS.map((domain) => (
                <span key={domain} className={styles.domainTag}>
                  {domain}
                </span>
              ))}
            </div>

            {/* ── Primary CTAs ── */}
            <div className={styles.actions} data-reveal="actions">
              <a href="#work" className={styles.primaryAction}>
                Explore Work <span aria-hidden="true">↗</span>
              </a>
              <a href="#lab" className={styles.secondaryAction}>
                Enter Lab <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── Status metadata ── bottom-right corner micro-text */}
        <div className={styles.status}>
          <p>STATUS / BUILDING</p>
          <p>FOCUS / INTELLIGENT SYSTEMS</p>
        </div>

        {/* ── Scroll signal ── */}
        <a href="#work" className={styles.scrollCue} data-hero-scroll-cue>
          SCROLL TO EXPLORE <span aria-hidden="true">↓</span>
        </a>
      </Container>
    </section>
  );
}
