"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import type { OpeningMotion } from "@/components/three/IntelligenceField";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./Hero.module.css";

const IntelligenceField = dynamic(
  () => import("@/components/three/IntelligenceField"),
  { ssr: false },
);

const INTRO_SESSION_KEY = "anirudh-opening-seen";

const evidence = [
  {
    src: "/projects/satquery-ai/satquery-main-interface-dark.jpg",
    alt: "SatQuery AI evidence-first geospatial intelligence interface",
    label: "SATQUERY AI / GEOSPATIAL INTELLIGENCE",
    width: 2940,
    height: 1736,
  },
  {
    src: "/projects/gesture-globe/gesture-globe-pinch-control.jpg",
    alt: "Gesture Globe responding to a live pinch gesture",
    label: "GESTURE GLOBE / COMPUTER VISION",
    width: 2834,
    height: 1556,
  },
  {
    src: "/projects/algaeos/algaeos-dashboard.jpg",
    alt: "AlgaeOS environmental telemetry dashboard",
    label: "ALGAEOS / PHYSICAL + DIGITAL",
    width: 2048,
    height: 1154,
  },
  {
    src: "/projects/dayflow/dayflow-admin-dashboard.jpg",
    alt: "Dayflow HR and admin operations dashboard",
    label: "DAYFLOW / FULL-STACK SYSTEMS",
    width: 2048,
    height: 1115,
  },
] as const;

export default function Hero() {
  const hero = useRef<HTMLElement>(null);
  const motion = useRef<OpeningMotion>({ intro: 0, scroll: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const introTimeline = useRef<gsap.core.Timeline | null>(null);
  const [sceneActive, setSceneActive] = useState(true);
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    const root = hero.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => setSceneActive(entry.isIntersecting),
      { rootMargin: "15% 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  // Time-directed domain: a short, interruptible first-signal formation.
  useLayoutEffect(() => {
    const root = hero.current;
    if (!root || !ready) return;

    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
    } catch {
      // Storage may be unavailable in hardened browsing modes.
    }

    const directAnchor = window.location.hash.length > 1 && window.location.hash !== "#home";
    const philosophy = root.querySelector<HTMLElement>("[data-philosophy]");
    const intro = root.querySelector<HTMLElement>("[data-intro]");
    const signal = root.querySelector<HTMLElement>("[data-intro-signal]");
    const fragments = root.querySelectorAll<HTMLElement>("[data-intro-fragment]");
    const message = root.querySelector<HTMLElement>("[data-intro-message]");

    if (!philosophy || !intro || !signal || !message) return;

    const context = gsap.context(() => {
      if (prefersReducedMotion || directAnchor) {
        motion.current.intro = 1;
        root.dataset.introState = "resolved";
        gsap.set(intro, { autoAlpha: 0 });
        gsap.set(philosophy, { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" });
        return;
      }

      root.dataset.introState = "playing";
      gsap.set(philosophy, {
        autoAlpha: 0,
        y: 26,
        clipPath: "inset(0% 0% 100% 0%)",
      });
      gsap.set(signal, { autoAlpha: 0, scale: 0.35 });
      gsap.set(fragments, { autoAlpha: 0 });
      gsap.set(message, { autoAlpha: 0, letterSpacing: "0.28em" });

      const start = seen ? 0.62 : 0;
      motion.current.intro = start;

      const timeline = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          motion.current.intro = 1;
          root.dataset.introState = "resolved";
          try {
            sessionStorage.setItem(INTRO_SESSION_KEY, "1");
          } catch {
            // The intro remains fully functional without persistence.
          }
        },
      });
      introTimeline.current = timeline;

      timeline
        .to(motion.current, {
          intro: 1,
          duration: seen ? 0.72 : 2.35,
          ease: seen ? "power2.out" : "power1.inOut",
        }, 0)
        .to(signal, { autoAlpha: 1, scale: 1, duration: seen ? 0.2 : 0.42 }, seen ? 0 : 0.18)
        .to(fragments, {
          autoAlpha: 1,
          duration: seen ? 0.2 : 0.7,
          stagger: seen ? 0.025 : 0.075,
        }, seen ? 0.04 : 0.45)
        .to(message, {
          autoAlpha: 1,
          letterSpacing: "0.16em",
          duration: seen ? 0.25 : 0.55,
        }, seen ? 0.08 : 0.78)
        .to([message, fragments, signal], {
          autoAlpha: 0,
          duration: seen ? 0.22 : 0.46,
        }, seen ? 0.36 : 1.55)
        .to(philosophy, {
          autoAlpha: 1,
          y: 0,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: seen ? 0.42 : 0.72,
        }, seen ? 0.27 : 1.58)
        .to(intro, { autoAlpha: 0, duration: seen ? 0.3 : 0.55 }, seen ? 0.38 : 1.72);
    }, root);

    const finishIntro = () => {
      const timeline = introTimeline.current;
      if (!timeline || timeline.progress() >= 0.995) return;
      timeline.tweenTo(timeline.duration(), { duration: 0.36, ease: "power2.out" });
    };
    const handleKey = (event: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", "End", " "].includes(event.key)) finishIntro();
    };
    const handleScroll = () => {
      if (window.scrollY > 6) finishIntro();
    };

    window.addEventListener("wheel", finishIntro, { passive: true });
    window.addEventListener("touchstart", finishIntro, { passive: true });
    window.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("wheel", finishIntro);
      window.removeEventListener("touchstart", finishIntro);
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll);
      introTimeline.current = null;
      context.revert();
    };
  }, [ready, prefersReducedMotion]);

  // Scroll-directed domain: one normalized timeline owns every major Hero state.
  useLayoutEffect(() => {
    const root = hero.current;
    if (!root || !ready || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const philosophy = root.querySelector<HTMLElement>("[data-philosophy]");
      const philosophyLines = root.querySelectorAll<HTMLElement>("[data-philosophy-line]");
      const thesis = root.querySelector<HTMLElement>("[data-thesis]");
      const thesisLines = root.querySelectorAll<HTMLElement>("[data-thesis-line]");
      const coordinates = root.querySelector<HTMLElement>("[data-coordinates]");
      const silence = root.querySelector<HTMLElement>("[data-silence]");
      const silenceAxis = root.querySelector<HTMLElement>("[data-silence-axis]");
      const silenceDot = root.querySelector<HTMLElement>("[data-silence-dot]");
      const name = root.querySelector<HTMLElement>("[data-name]");
      const nameWords = root.querySelectorAll<HTMLElement>("[data-name-word]");
      const nameMeta = root.querySelector<HTMLElement>("[data-name-meta]");
      const nameRules = root.querySelectorAll<HTMLElement>("[data-name-rule]");
      const scan = root.querySelector<HTMLElement>("[data-name-scan]");
      const evidenceLayer = root.querySelector<HTMLElement>("[data-evidence]");
      const evidencePlanes = root.querySelectorAll<HTMLElement>("[data-evidence-plane]");
      const projectLockup = root.querySelector<HTMLElement>("[data-project-lockup]");
      const interfaceNodes = root.querySelectorAll<HTMLElement>("[data-interface]");

      if (!philosophy || !thesis || !coordinates || !silence || !silenceAxis || !silenceDot || !name || !nameMeta || !scan || !evidenceLayer || !projectLockup) return;

      gsap.set(thesis, { autoAlpha: 0 });
      gsap.set(thesisLines, {
        opacity: 0,
        y: 12,
        scaleX: 0.72,
        letterSpacing: "-0.11em",
        transformOrigin: "center center",
      });
      gsap.set(silence, { autoAlpha: 0 });
      gsap.set(silenceAxis, { scaleY: 0, transformOrigin: "center center" });
      gsap.set(silenceDot, { scale: 0, autoAlpha: 0 });
      gsap.set(name, { autoAlpha: 0 });
      gsap.set(nameWords, {
        opacity: 0,
        scaleX: 0.02,
        letterSpacing: "0.08em",
        transformOrigin: "center center",
      });
      gsap.set(nameMeta, { autoAlpha: 0, y: 6 });
      gsap.set(nameRules, { scaleX: 0 });
      gsap.set(scan, { scaleY: 0, autoAlpha: 0, transformOrigin: "center center" });
      gsap.set(evidenceLayer, { autoAlpha: 0 });
      gsap.set(projectLockup, { autoAlpha: 0, y: 18 });
      gsap.set(evidencePlanes, { autoAlpha: 0 });

      const timelineClock = { value: 0 };
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            motion.current.scroll = self.progress;
          },
          onRefresh: (self) => {
            motion.current.scroll = self.progress;
          },
        },
      });

      timeline
        .to(timelineClock, { value: 1, duration: 1 }, 0)
        // MANIFESTO → THESIS: full letterforms compress and reorganize.
        .to(interfaceNodes, { autoAlpha: 0, duration: 0.1 }, 0.12)
        .to(philosophyLines[0], {
          xPercent: -6,
          yPercent: -16,
          scaleX: 0.84,
          autoAlpha: 0,
          duration: 0.075,
        }, 0.14)
        .to(philosophyLines[1], {
          scaleX: 0.64,
          letterSpacing: "-0.105em",
          autoAlpha: 0,
          duration: 0.075,
        }, 0.145)
        .to(philosophyLines[2], {
          xPercent: 6,
          yPercent: 16,
          scaleX: 0.84,
          autoAlpha: 0,
          duration: 0.075,
        }, 0.14)
        .to(philosophy, { scale: 0.97, duration: 0.08 }, 0.14)
        .set(thesis, { autoAlpha: 1 }, 0.22)
        .to(thesisLines, {
          opacity: 1,
          y: 0,
          scaleX: 1,
          letterSpacing: "-0.068em",
          stagger: 0.018,
          duration: 0.125,
        }, 0.22)
        .to(coordinates, { autoAlpha: 0.72, duration: 0.1 }, 0.265)
        // THESIS → SILENCE: compression, never sliced typography.
        .to(thesisLines, {
          opacity: 0,
          y: -6,
          scaleX: 0.76,
          letterSpacing: "-0.12em",
          stagger: 0.012,
          duration: 0.09,
        }, 0.48)
        .to(thesis, { autoAlpha: 0, duration: 0.05 }, 0.545)
        .to(coordinates, { autoAlpha: 0, duration: 0.07 }, 0.48)
        .set(silence, { autoAlpha: 1 }, 0.525)
        .to(silenceAxis, { scaleY: 1, duration: 0.075 }, 0.53)
        .to(silenceDot, { scale: 1, autoAlpha: 1, duration: 0.055 }, 0.55)
        // SILENCE → IDENTITY: the central signal opens horizontally.
        .set(name, { autoAlpha: 1 }, 0.62)
        .to([silenceDot, silenceAxis], { autoAlpha: 0, duration: 0.035 }, 0.62)
        .to(scan, { scaleY: 1, autoAlpha: 0.62, duration: 0.045 }, 0.62)
        .to(nameRules, { scaleX: 1, stagger: 0.018, duration: 0.075 }, 0.625)
        .to(nameWords, {
          opacity: 1,
          scaleX: 1,
          letterSpacing: "-0.085em",
          stagger: 0.012,
          duration: 0.062,
        }, 0.635)
        .to(nameMeta, { y: 0, autoAlpha: 1, duration: 0.05 }, 0.705)
        .to(silence, { autoAlpha: 0, duration: 0.025 }, 0.655)
        .to(scan, { autoAlpha: 0, duration: 0.035 }, 0.715)
        // IDENTITY → EVIDENCE: the name becomes architecture first.
        .to(name, { scale: 1.035, autoAlpha: 0.03, duration: 0.065 }, 0.8)
        .to(nameMeta, { autoAlpha: 0, y: -4, duration: 0.04 }, 0.8)
        .to(nameRules, { autoAlpha: 0.1, scaleX: 0.72, duration: 0.06 }, 0.8)
        .set(evidenceLayer, { autoAlpha: 1 }, 0.8)
        .fromTo(evidencePlanes[3],
          { xPercent: 92, yPercent: -42, z: -1050, rotateY: -18, autoAlpha: 0 },
          { xPercent: 38, yPercent: -26, z: -520, rotateY: -10, autoAlpha: 0.06, duration: 0.115 },
          0.81,
        )
        .fromTo(evidencePlanes[2],
          { xPercent: -90, yPercent: 38, z: -980, rotateY: 18, autoAlpha: 0 },
          { xPercent: -38, yPercent: 24, z: -450, rotateY: 10, autoAlpha: 0.08, duration: 0.115 },
          0.82,
        )
        .fromTo(evidencePlanes[1],
          { xPercent: 76, yPercent: 54, z: -820, rotateY: -15, autoAlpha: 0 },
          { xPercent: 26, yPercent: 30, z: -340, rotateY: -7, autoAlpha: 0.12, duration: 0.115 },
          0.83,
        )
        .fromTo(evidencePlanes[0],
          {
            xPercent: isMobile ? -8 : -12,
            yPercent: 15,
            z: isMobile ? -520 : -1100,
            scale: isMobile ? 0.58 : 0.34,
            autoAlpha: 0,
          },
          { xPercent: 0, yPercent: -6, z: 0, scale: 1, autoAlpha: 1, duration: 0.135 },
          0.825,
        )
        .to([evidencePlanes[1], evidencePlanes[2], evidencePlanes[3]], {
          autoAlpha: 0,
          z: -720,
          duration: 0.055,
        }, 0.935)
        .to(name, { autoAlpha: 0, duration: 0.04 }, 0.9)
        .to(projectLockup, { autoAlpha: 1, y: 0, duration: 0.065 }, 0.915);
    }, root);

    return () => context.revert();
  }, [ready, prefersReducedMotion, isMobile]);

  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (prefersReducedMotion || isMobile || event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointer.current.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.current.y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
  }

  return (
    <section
      ref={hero}
      id="home"
      aria-labelledby="home-heading"
      className={styles.hero}
      data-intro-state="pending"
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <div className={styles.stage}>
        <div className={styles.environment} aria-hidden="true" />

        <div className={styles.constellationField} aria-hidden="true">
          <IntelligenceField
            pointer={pointer}
            motion={motion}
            reducedMotion={prefersReducedMotion}
            isMobile={isMobile}
            active={sceneActive}
          />
        </div>

        <div className={styles.spatialMarks} aria-hidden="true" data-interface>
          <span className={styles.axisX} />
          <span className={styles.axisY} />
          <span className={styles.markA}>X / 04.18</span>
          <span className={styles.markB}>VECTOR / RELATION</span>
          <span className={styles.markC}>Z / −08.24</span>
        </div>

        <div className={styles.intro} data-intro aria-hidden="true">
          <span className={styles.introSignal} data-intro-signal />
          <span className={styles.fragmentA} data-intro-fragment />
          <span className={styles.fragmentB} data-intro-fragment />
          <span className={styles.fragmentC} data-intro-fragment />
          <p className={styles.introMessage} data-intro-message>BUILD SPACE / FORMING</p>
        </div>

        <div className={styles.systemMeta} data-interface aria-hidden="true">
          <span>SIGNAL / 00</span>
          <span>RELATIONS / EMERGING</span>
        </div>

        <div className={styles.philosophyLayer} data-philosophy>
          <h1 id="home-heading" className={styles.philosophy}>
            <span data-philosophy-line>I BUILD</span>
            <span data-philosophy-line>WHAT I WANT</span>
            <span data-philosophy-line>TO EXIST.</span>
          </h1>
        </div>

        <div className={styles.thesisLayer} data-thesis>
          <p className={styles.thesis}>
            <span><i data-thesis-line>ENGINEERING THE</i></span>
            <span><i data-thesis-line>NEXT ERA OF</i></span>
            <span><i data-thesis-line>INTELLIGENCE.</i></span>
          </p>
        </div>

        <div className={styles.silenceLayer} data-silence aria-hidden="true">
          <span className={styles.silenceDot} data-silence-dot />
          <span className={styles.silenceAxis} data-silence-axis />
        </div>

        <div className={styles.coordinates} data-coordinates data-interface aria-label="Engineering domains">
          <span>AI</span><i>/</i><span>VISION</span><i>/</i><span>FULL-STACK</span>
          <i>/</i><span>IoT</span><i>/</i><span>MULTIMODAL</span>
        </div>

        <div className={styles.nameLayer} data-name>
          <span className={styles.nameRule} data-name-rule aria-hidden="true" />
          <p className={styles.name} aria-label="Anirudh Shashikumar">
            <span><i data-name-word>ANIRUDH</i></span>
            <span><i data-name-word>SHASHIKUMAR</i></span>
          </p>
          <p className={styles.nameMeta} data-name-meta>COMPUTER SCIENCE ENGINEERING&nbsp;&nbsp; / &nbsp;&nbsp;BENGALURU, INDIA</p>
          <span className={styles.nameRule} data-name-rule aria-hidden="true" />
          <span className={styles.nameScan} data-name-scan aria-hidden="true" />
        </div>

        <div className={styles.evidenceLayer} data-evidence aria-label="Project evidence">
          <div className={styles.evidenceSpace}>
            {evidence.map((item, index) => (
              <figure
                className={`${styles.evidencePlane} ${styles[`evidencePlane${index}`]}`}
                data-evidence-plane
                key={item.src}
              >
                <div className={styles.evidenceFrame}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes={index === 0 ? "(max-width: 767px) 88vw, 62vw" : "(max-width: 767px) 52vw, 27vw"}
                  />
                </div>
                <figcaption>{item.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className={styles.projectLockup} data-project-lockup>
            <span>01 / FLAGSHIP</span>
            <p>SATQUERY AI</p>
            <i>EVIDENCE-FIRST GEOSPATIAL INTELLIGENCE</i>
          </div>
        </div>

        <div className={styles.scrollCue} data-interface aria-hidden="true">
          <span />
          SCROLL / ENTER SYSTEM
        </div>
      </div>

      <div className={styles.reducedSequence}>
        <section aria-label="Engineering direction">
          <p>ENGINEERING THE<br />NEXT ERA OF<br />INTELLIGENCE.</p>
        </section>
        <section aria-label="Identity">
          <p>ANIRUDH<br />SHASHIKUMAR</p>
          <span>COMPUTER SCIENCE ENGINEERING / BENGALURU, INDIA</span>
        </section>
        <section aria-label="Featured project">
          <span>01 / FLAGSHIP</span>
          <p>SATQUERY AI</p>
        </section>
      </div>
    </section>
  );
}
