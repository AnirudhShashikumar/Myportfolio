"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import dynamic from "next/dynamic";
import { useEffect, useRef, type PointerEvent } from "react";
import SignalLines from "@/components/graphics/SignalLines";
import TechnicalGrid from "@/components/graphics/TechnicalGrid";
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

  // ── Entrance choreography ─────────────────────────────────────────────────
  // Frame 00: near-black → identity resolves → statement resolves → domains appear.
  // Total ~1.6s perceived. Fast. No loading gate.
  useEffect(() => {
    if (prefersReducedMotion || !hero.current) return;

    const context = gsap.context(() => {
      gsap
        .timeline({ defaults: { ease: "power2.out" } })
        // System identity (SYSTEM/00, ANIRUDH, CSE, BENGALURU)
        .from('[data-reveal="system"]', {
          opacity: 0,
          y: 6,
          duration: 0.5,
        })
        // Main statement: I BUILD WHAT I WANT TO EXIST.
        .from('[data-reveal="statement"]', {
          opacity: 0,
          y: 24,
          duration: 0.8,
        }, "-=0.25")
        // Domain coordinates
        .from('[data-reveal="coordinates"]', {
          opacity: 0,
          y: 8,
          duration: 0.45,
        }, "-=0.32")
        // Interaction cues
        .from('[data-reveal="interaction"]', {
          opacity: 0,
          y: 6,
          duration: 0.4,
        }, "-=0.2")
        // Status metadata
        .from('[data-reveal="status"]', {
          opacity: 0,
          duration: 0.35,
        }, "-=0.3");
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
          duration: 1.6,
          stagger: 0.22,
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

  // ── Scroll-driven transformation ──────────────────────────────────────────
  // The Hero section is ~200vh tall. Three acts:
  // Act 1 (0–0.35): Statement recedes. System identity dims.
  // Act 2 (0.2–0.6): Thesis resolves and lingers. Domains brighten.
  // Act 3 (0.55–0.85): Everything fades to 0 for clean handoff to Work.
  useEffect(() => {
    if (!ready || prefersReducedMotion || !hero.current) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
          pin: false,
        },
      });

      // ── Act 1: Statement departs ───────────────────────────────────
      tl.to("[data-hero-statement]", {
        y: isMobile ? -30 : -60,
        opacity: 0,
        ease: "none",
        duration: 0.35,
      }, 0);

      // Interaction cues depart early
      tl.to("[data-hero-interaction]", {
        y: -12,
        opacity: 0,
        ease: "none",
        duration: 0.12,
      }, 0.02);

      // Scroll cue disappears immediately
      tl.to("[data-hero-scroll-cue]", {
        autoAlpha: 0,
        y: -8,
        ease: "none",
        duration: 0.06,
      }, 0);

      // System identity dims
      tl.to("[data-hero-system]", {
        y: isMobile ? -8 : -16,
        opacity: 0.3,
        ease: "none",
        duration: 0.3,
      }, 0.1);

      // Status dims
      tl.to("[data-hero-status]", {
        opacity: 0,
        ease: "none",
        duration: 0.15,
      }, 0.08);

      // ── Act 2: Thesis resolves ─────────────────────────────────────
      tl.fromTo("[data-hero-thesis]", {
        y: isMobile ? 16 : 32,
        opacity: 0,
      }, {
        y: 0,
        opacity: 1,
        ease: "none",
        duration: 0.2,
      }, 0.22);

      // Domain coordinates brighten
      tl.to("[data-hero-coordinates]", {
        opacity: 0.85,
        ease: "none",
        duration: 0.15,
      }, 0.28);

      // ── Act 3: Everything fades — clean handoff ────────────────────
      tl.to("[data-hero-thesis]", {
        y: isMobile ? -20 : -40,
        opacity: 0,
        ease: "none",
        duration: 0.2,
      }, 0.58);

      tl.to("[data-hero-coordinates]", {
        opacity: 0,
        ease: "none",
        duration: 0.15,
      }, 0.58);

      tl.to("[data-hero-system]", {
        opacity: 0,
        ease: "none",
        duration: 0.12,
      }, 0.55);

      tl.to("[data-hero-field]", {
        scale: isMobile ? 0.97 : 0.92,
        opacity: 0,
        ease: "none",
        duration: 0.3,
      }, 0.5);

      tl.to("[data-hero-atmosphere]", {
        opacity: 0,
        ease: "none",
        duration: 0.3,
      }, 0.5);

      tl.to("[data-hero-graphics]", {
        opacity: 0,
        ease: "none",
        duration: 0.3,
      }, 0.5);
    }, hero);

    return () => context.revert();
  }, [ready, isMobile, prefersReducedMotion]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (prefersReducedMotion || isMobile || event.pointerType !== "mouse") return;

    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.current.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    graphicMovement.current?.x(pointer.current.x * 10);
    graphicMovement.current?.y(pointer.current.y * 7);
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
      {/* ── Layer 01: Environment ── */}
      <div
        className={styles.environment}
        aria-hidden="true"
        data-scroll-depth="-18"
        data-hero-atmosphere
      />

      {/* ── Layer 02: Engineering Constellation (Three.js) — full viewport ── */}
      <div
        className={styles.constellationField}
        aria-hidden="true"
        data-scroll-depth="-28"
        data-hero-field
      >
        <IntelligenceField
          pointer={pointer}
          reducedMotion={prefersReducedMotion}
          isMobile={isMobile}
        />
      </div>

      {/* ── Layer 03: Background graphics ── */}
      <div className={styles.graphics} data-hero-graphics aria-hidden="true">
        <div ref={graphicPointer} className={styles.graphicsPointer}>
          <TechnicalGrid variant="hero" />
          <SignalLines variant="hero" />
        </div>
      </div>

      {/* ── Layer 04: System Identity ── */}
      <div
        className={styles.systemIdentity}
        data-reveal="system"
        data-hero-system
      >
        <span className={styles.systemIndex}>SYSTEM / 00</span>
        <span className={styles.systemName}>ANIRUDH SHASHIKUMAR</span>
        <span className={styles.systemMeta}>COMPUTER SCIENCE ENGINEERING</span>
        <span className={styles.systemLocation}>BENGALURU / INDIA</span>
      </div>

      {/* ── Layer 05: Primary Statement — architectural typography ── */}
      <div
        className={styles.statementLayer}
        data-hero-statement
        data-reveal="statement"
      >
        <h1 id="home-heading" className={styles.statement}>
          <span className={styles.statementLine}>I BUILD</span>
          <span className={styles.statementLine}>WHAT I WANT</span>
          <span className={styles.statementLine}>TO EXIST.</span>
        </h1>
      </div>

      {/* ── Layer 06: Thesis (scroll-revealed second state) ── */}
      <div
        className={styles.thesisLayer}
        data-hero-thesis
        aria-hidden="true"
      >
        <p className={styles.thesis}>
          <span>Engineering the</span>{" "}
          <span>Next Era of</span>{" "}
          <span>Intelligence.</span>
        </p>
      </div>

      {/* ── Layer 07: Domain coordinates ── */}
      <div
        className={styles.coordinates}
        data-reveal="coordinates"
        data-hero-coordinates
        aria-label="Engineering domains"
      >
        <span className={styles.coord}>AI</span>
        <span className={styles.coordSep} aria-hidden="true">/</span>
        <span className={styles.coord}>VISION</span>
        <span className={styles.coordSep} aria-hidden="true">/</span>
        <span className={styles.coord}>FULL-STACK</span>
        <span className={styles.coordSep} aria-hidden="true">/</span>
        <span className={styles.coord}>IoT</span>
        <span className={styles.coordSep} aria-hidden="true">/</span>
        <span className={styles.coord}>MULTIMODAL</span>
      </div>

      {/* ── Layer 08: Interaction cues — editorial, not buttons ── */}
      <div
        className={styles.interaction}
        data-reveal="interaction"
        data-hero-interaction
      >
        <a href="#work" className={styles.explore}>
          <span className={styles.exploreLabel}>EXPLORE</span>
          <span className={styles.exploreTarget}>WORK</span>
          <span className={styles.exploreArrow} aria-hidden="true">↓</span>
        </a>
        <a href="#lab" className={styles.labLink}>
          LAB <span aria-hidden="true">↗</span>
        </a>
      </div>

      {/* ── Status metadata ── */}
      <div
        className={styles.status}
        data-reveal="status"
        data-hero-status
        aria-hidden="true"
      >
        <p>STATUS / BUILDING</p>
        <p>FIELD / INTELLIGENT SYSTEMS</p>
      </div>

      {/* ── Scroll signal ── */}
      <a href="#work" className={styles.scrollCue} data-hero-scroll-cue>
        <span className={styles.scrollLine} aria-hidden="true" />
        SCROLL
      </a>
    </section>
  );
}
