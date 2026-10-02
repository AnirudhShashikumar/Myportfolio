"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollRefresh } from "@/components/system/scrollRefresh";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./About.module.css";

const domains = [
  { name: "AI", x: 20, y: 22, project: "MEDITWIN / MEDIFIT" },
  { name: "COMPUTER VISION", x: 74, y: 18, project: "GESTURE GLOBE" },
  { name: "FULL-STACK", x: 82, y: 62, project: "DAYFLOW" },
  { name: "IoT", x: 18, y: 72, project: "ALGAEOS" },
  { name: "REMOTE SENSING", x: 50, y: 84, project: "SATQUERY AI" },
  { name: "MULTIMODAL SYSTEMS", x: 50, y: 36, project: "SATQUERY AI" },
];

const journey = [
  ["2020", "HTML / FIRST PLACE"],
  ["01", "SOFTWARE"],
  ["02", "FULL-STACK"],
  ["03", "AI"],
  ["04", "COMPUTER VISION"],
  ["05", "PHYSICAL + DIGITAL"],
  ["2026", "MULTIMODAL INTELLIGENCE"],
  ["NEXT", "?"],
];

const process = ["IDEA", "RESEARCH", "ARCHITECTURE", "BUILD", "TEST", "VALIDATE", "ITERATE"];

function DomainField() {
  return (
    <div className={styles.domainField} aria-hidden="true">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M20 22 L50 36 L74 18 M50 36 L82 62 L50 84 L18 72 Z M20 22 L18 72 M74 18 L82 62" />
        <circle cx="50" cy="51" r="2.2" />
      </svg>
      {domains.map((domain) => (
        <div
          className={styles.domainNode}
          key={domain.name}
          style={{ "--x": `${domain.x}%`, "--y": `${domain.y}%` } as React.CSSProperties}
        >
          <span>{domain.name}</span>
          <small>{domain.project}</small>
        </div>
      ))}
    </div>
  );
}

function ProcessLine({ compact = false }: { compact?: boolean }) {
  return (
    <ol className={compact ? styles.processEditorial : styles.processLine}>
      {process.map((step) => (
        <li key={step}>
          <span>{step}</span>
          {step === "BUILD" && <small>AI-ASSISTED IMPLEMENTATION</small>}
        </li>
      ))}
    </ol>
  );
}

export default function About() {
  const sequence = useRef<HTMLDivElement>(null);
  const { width, isShort, prefersReducedMotion: reducedMotion } = useViewport();
  const ready = width > 0;
  const prefersReducedMotion = reducedMotion || isShort;

  useEffect(() => {
    const root = sequence.current;
    if (!root || !ready || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motion = "active";

    const context = gsap.context(() => {
      const opening = root.querySelector<HTMLElement>("[data-about-opening]");
      const openingA = root.querySelector<HTMLElement>("[data-about-opening-a]");
      const openingB = root.querySelector<HTMLElement>("[data-about-opening-b]");
      const identity = root.querySelector<HTMLElement>("[data-about-identity]");
      const identityFill = root.querySelector<HTMLElement>("[data-about-identity-fill]");
      const identityMeta = root.querySelector<HTMLElement>("[data-about-identity-meta]");
      const universe = root.querySelector<HTMLElement>("[data-about-universe]");
      const universeNodes = root.querySelectorAll<HTMLElement>("[data-about-node]");
      const trajectory = root.querySelector<HTMLElement>("[data-about-trajectory]");
      const trajectoryPath = root.querySelector<SVGPathElement>("[data-about-path]");
      const journeyNodes = root.querySelectorAll<HTMLElement>("[data-about-journey-node]");
      const origin = root.querySelector<HTMLElement>("[data-about-origin]");
      const learning = root.querySelector<HTMLElement>("[data-about-learning]");
      const human = root.querySelector<HTMLElement>("[data-about-human]");
      const humanLines = root.querySelectorAll<HTMLElement>("[data-about-human-line]");
      const processLayer = root.querySelector<HTMLElement>("[data-about-process]");
      const processNodes = root.querySelectorAll<HTMLElement>("[data-about-process-node]");
      const unknown = root.querySelector<HTMLElement>("[data-about-unknown]");
      const question = root.querySelector<HTMLElement>("[data-about-question]");

      if (!opening || !openingA || !openingB || !identity || !identityFill || !identityMeta || !universe || !trajectory || !trajectoryPath || !origin || !learning || !human || !processLayer || !unknown || !question) return;

      gsap.set([identity, universe, trajectory, human, processLayer, unknown], { autoAlpha: 0 });
      gsap.set(openingB, { autoAlpha: 0, y: 22 });
      gsap.set(identityFill, { clipPath: "inset(100% 0 0 0)" });
      gsap.set(identityMeta, { autoAlpha: 0, y: 12 });
      gsap.set(universeNodes, { autoAlpha: 0, scale: 0.8 });
      gsap.set(trajectoryPath, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.set(journeyNodes, { autoAlpha: 0, y: 14 });
      gsap.set([origin, learning], { autoAlpha: 0, y: 26, rotateX: -8 });
      gsap.set(humanLines, { autoAlpha: 0, y: 18 });
      gsap.set(processNodes, { autoAlpha: 0, y: 8 });
      gsap.set(question, { scale: 1.4, autoAlpha: 0 });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${Math.max(1, root.offsetHeight - (root.firstElementChild as HTMLElement).offsetHeight)}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(openingA, { autoAlpha: 0, y: -22, duration: 0.07 }, 0.07)
        .to(openingB, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.1)
        .to(openingB, { autoAlpha: 0, y: -22, duration: 0.06 }, 0.19)
        .to(opening, { autoAlpha: 0, duration: 0.02 }, 0.24)
        .to(identity, { autoAlpha: 1, duration: 0.06 }, 0.2)
        .to(identityFill, { clipPath: "inset(0% 0 0 0)", duration: 0.11 }, 0.235)
        .to(identityMeta, { autoAlpha: 1, y: 0, duration: 0.06 }, 0.28)
        .to(identity, { scale: 0.94, autoAlpha: 0, duration: 0.025 }, 0.325)
        .to(universe, { autoAlpha: 1, duration: 0.06 }, 0.35)
        .to(universeNodes, { autoAlpha: 1, scale: 1, stagger: 0.009, duration: 0.06 }, 0.37)
        .to(universe, { autoAlpha: 0, scale: 1.025, duration: 0.025 }, 0.475)
        .to(trajectory, { autoAlpha: 1, duration: 0.035 }, 0.505)
        .to(trajectoryPath, { strokeDashoffset: 0, duration: 0.15 }, 0.5)
        .to(journeyNodes, { autoAlpha: 1, y: 0, stagger: 0.012, duration: 0.055 }, 0.51)
        .to(origin, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.035 }, 0.55)
        .to(origin, { autoAlpha: 0, y: -18, duration: 0.025 }, 0.595)
        .to(learning, { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.035 }, 0.625)
        .to(learning, { autoAlpha: 0, y: -18, duration: 0.02 }, 0.67)
        .to(trajectory, { autoAlpha: 0, duration: 0.025 }, 0.675)
        .to(human, { autoAlpha: 1, duration: 0.035 }, 0.705)
        .to(humanLines, { autoAlpha: 1, y: 0, stagger: 0.016, duration: 0.06 }, 0.71)
        .to(human, { autoAlpha: 0, y: -16, duration: 0.025 }, 0.785)
        .to(processLayer, { autoAlpha: 1, duration: 0.03 }, 0.81)
        .to(processNodes, { autoAlpha: 1, y: 0, stagger: 0.011, duration: 0.055 }, 0.815)
        .to(processLayer, { autoAlpha: 0, y: -14, duration: 0.02 }, 0.89)
        .to(unknown, { autoAlpha: 1, duration: 0.03 }, 0.915)
        .to(question, { autoAlpha: 1, scale: 1, duration: 0.075 }, 0.925);
    }, root);

    scheduleScrollRefresh();

    return () => {
      context.revert();
      delete root.dataset.motion;
    };
  }, [ready, prefersReducedMotion]);

  return (
    <section id="about" className={styles.about} aria-labelledby="about-heading" data-visual-tone="about">
      <h2 id="about-heading" className="sr-only">About Anirudh Shashikumar</h2>

      <div ref={sequence} className={styles.sequence}>
        <div className={styles.stage}>
          <div className={`${styles.layer} ${styles.opening}`} data-about-opening>
            <p className={styles.micro}>02 / ABOUT · SYSTEM / IDENTITY</p>
            <p className={styles.openingStatement} data-about-opening-a>
              <span>THE SYSTEMS TELL</span><span>PART OF THE STORY.</span>
            </p>
            <p className={styles.openingStatement} data-about-opening-b>
              <span>NOW MEET THE PERSON</span><span>BUILDING THEM.</span>
            </p>
          </div>

          <div className={`${styles.layer} ${styles.identity}`} data-about-identity>
            <p className={styles.micro}>SUBJECT / ANIRUDH · STATE / RECONSTRUCTING</p>
            <div className={styles.nameStack} aria-label="Anirudh Shashikumar">
              <p className={styles.nameOutline} aria-hidden="true">ANIRUDH<br />SHASHIKUMAR</p>
              <p className={styles.nameFill} data-about-identity-fill>ANIRUDH<br />SHASHIKUMAR</p>
            </div>
            <div className={styles.identityMeta} data-about-identity-meta>
              <span>COMPUTER SCIENCE ENGINEERING</span>
              <span>BENGALURU / INDIA</span>
              <span>DIRECTION / INTELLIGENT SYSTEMS</span>
            </div>
          </div>

          <div className={`${styles.layer} ${styles.universe}`} data-about-universe>
            <DomainField />
            <div className={styles.universeStatement}>
              <p className={styles.micro}>ENGINEERING UNIVERSE / CONNECTED PRACTICE</p>
              <p>BUILDING ACROSS<br /><strong>INTELLIGENCE, SOFTWARE,<br />VISION &amp; THE PHYSICAL WORLD.</strong></p>
            </div>
            <div className={styles.semanticNodes} aria-hidden="true">
              {domains.map((domain) => <span key={domain.name} data-about-node />)}
            </div>
          </div>

          <div className={`${styles.layer} ${styles.trajectory}`} data-about-trajectory>
            <p className={styles.micro}>TRAJECTORY / CURIOSITY IN MOTION</p>
            <svg className={styles.trajectoryLine} viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
              <path data-about-path pathLength="1" d="M20 210 C120 205 130 80 245 110 S410 245 520 178 S705 72 790 145 S900 235 980 92" />
            </svg>
            <ol className={styles.journey}>
              {journey.map(([year, label]) => (
                <li key={`${year}-${label}`} data-about-journey-node>
                  <span>{year}</span><small>{label}</small>
                </li>
              ))}
            </ol>

            <figure className={`${styles.artifact} ${styles.originArtifact}`} data-about-origin>
              <Image
                src="/achievements/presidency-html-competition-first-place-2020.jpg"
                alt="Presidency School certificate awarding Anirudh Shashikumar first position in the 2020 Computer Science HTML website competition"
                width={9961}
                height={7068}
                sizes="(max-width: 767px) 68vw, 30vw"
              />
              <figcaption><span>ORIGIN / 2020</span> FIRST HTML WEBSITE · FIRST PLACE</figcaption>
            </figure>

            <figure className={`${styles.artifact} ${styles.learningArtifact}`} data-about-learning>
              <Image
                src="/achievements/google-ai-professional-certificate-2026.jpg"
                alt="Google AI Professional Certificate completed by Anirudh Shashikumar in 2026"
                width={2338}
                height={1802}
                sizes="(max-width: 767px) 68vw, 30vw"
              />
              <figcaption><span>LEARNING / 2026</span> GOOGLE AI PROFESSIONAL CERTIFICATE · 7 COURSES</figcaption>
            </figure>
          </div>

          <div className={`${styles.layer} ${styles.human}`} data-about-human>
            <p className={styles.micro}>HUMAN SIGNAL / METHOD</p>
            <p className={styles.humanLead} data-about-human-line>I LEARN<br />BY BUILDING.</p>
            <p className={styles.humanStatement} data-about-human-line>
              I LIKE TAKING IDEAS<br />THAT FEEL SLIGHTLY<br />TOO AMBITIOUS —<br /><br />AND MAKING THEM<br />REAL ENOUGH TO TEST.
            </p>
            <p className={styles.humanSupport} data-about-human-line>
              The work moves across AI, computer vision, software, connected hardware and experimental interfaces.
            </p>
          </div>

          <div className={`${styles.layer} ${styles.process}`} data-about-process>
            <div>
              <p className={styles.micro}>HOW I BUILD / ITERATIVE SYSTEM</p>
              <p className={styles.processTitle}>UNDERSTANDING STAYS HUMAN.</p>
              <p className={styles.processCopy}>AI assists implementation, research, debugging and iteration. Testing, validation and responsibility remain part of the engineering process.</p>
            </div>
            <ol className={styles.processLine}>
              {process.map((step) => (
                <li key={step} data-about-process-node>
                  <span>{step}</span>
                  {step === "BUILD" && <small>AI-ASSISTED<br />IMPLEMENTATION</small>}
                </li>
              ))}
            </ol>
          </div>

          <div className={`${styles.layer} ${styles.unknown}`} data-about-unknown>
            <p className={styles.micro}>STATUS / IN PROGRESS</p>
            <p className={styles.unknownStatement}><span>STILL LEARNING.</span><span>STILL BUILDING.</span></p>
            <p className={styles.nextSystem}>NEXT SYSTEM<br /><strong>UNKNOWN.</strong></p>
            <span className={styles.question} data-about-question aria-hidden="true">?</span>
          </div>
        </div>
      </div>

      <div className={styles.editorial}>
        <p className={styles.micro}>02 / ABOUT · SYSTEM / IDENTITY</p>
        <section><h3>THE SYSTEMS TELL<br />PART OF THE STORY.</h3><p>NOW MEET THE PERSON BUILDING THEM.</p></section>
        <section><h3>ANIRUDH<br />SHASHIKUMAR</h3><p>Computer Science Engineering · Bengaluru, India</p></section>
        <section><h3>BUILDING ACROSS INTELLIGENCE, SOFTWARE, VISION &amp; THE PHYSICAL WORLD.</h3><p>{domains.map((domain) => domain.name).join(" · ")}</p></section>
        <section className={styles.editorialJourney}>
          <p className={styles.micro}>TRAJECTORY / 2020 → NEXT</p>
          <p>{journey.map(([year, label]) => `${year} ${label}`).join("  →  ")}</p>
          <div className={styles.editorialArtifacts}>
            <figure><Image src="/achievements/presidency-html-competition-first-place-2020.jpg" alt="Presidency School first-place HTML competition certificate from 2020" width={9961} height={7068} sizes="(max-width: 767px) 100vw, 45vw" /><figcaption>ORIGIN / 2020 · FIRST HTML WEBSITE · FIRST PLACE</figcaption></figure>
            <figure><Image src="/achievements/google-ai-professional-certificate-2026.jpg" alt="Google AI Professional Certificate completed in 2026" width={2338} height={1802} sizes="(max-width: 767px) 100vw, 45vw" /><figcaption>LEARNING / 2026 · GOOGLE AI PROFESSIONAL CERTIFICATE · 7 COURSES</figcaption></figure>
          </div>
        </section>
        <section><h3>I LEARN<br />BY BUILDING.</h3><p>I like taking ideas that feel slightly too ambitious — and making them real enough to test.</p></section>
        <section><p className={styles.micro}>HOW I BUILD</p><ProcessLine compact /><p>AI assists implementation. Understanding, testing, validation and responsibility remain human.</p></section>
        <section><h3>STILL LEARNING.<br />STILL BUILDING.</h3><p>NEXT SYSTEM / UNKNOWN.</p><span className={styles.editorialQuestion} aria-hidden="true">?</span></section>
      </div>
    </section>
  );
}
