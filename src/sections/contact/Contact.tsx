"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollRefresh } from "@/components/system/scrollRefresh";
import { useEffect, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./Contact.module.css";

const EMAIL = "mailto:Anirudh.shashikumar@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/anirudh-shashikumar";
const GITHUB = "https://github.com/AnirudhShashikumar";

function SignalField() {
  return (
    <svg className={styles.signalField} viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g className={styles.fieldBase}>
        <path d="M-40 680 C170 530 220 715 425 570 S720 270 930 438 S1210 690 1490 475" />
        <path d="M-20 270 C190 430 340 95 555 290 S835 635 1040 315 S1300 80 1495 215" />
        <path d="M130 920 C220 690 530 815 660 570 S770 150 1015 -40" />
        <path d="M-30 470 C270 365 365 500 590 440 S1015 355 1480 610" />
      </g>
      <g className={styles.fieldLit}>
        <path d="M-40 680 C170 530 220 715 425 570 S720 270 930 438 S1210 690 1490 475" />
        <path d="M-20 270 C190 430 340 95 555 290 S835 635 1040 315 S1300 80 1495 215" />
        <path d="M130 920 C220 690 530 815 660 570 S770 150 1015 -40" />
        <path d="M-30 470 C270 365 365 500 590 440 S1015 355 1480 610" />
      </g>
    </svg>
  );
}

function ContactActions() {
  return (
    <div className={styles.actions}>
      <a className={styles.emailAction} href={EMAIL} aria-label="Email Anirudh Shashikumar">
        <span>EMAIL ME</span><span aria-hidden="true">↗</span>
      </a>
      <div className={styles.secondaryActions}>
        <a href={LINKEDIN} target="_blank" rel="noreferrer" aria-label="Anirudh Shashikumar on LinkedIn (opens in a new tab)">LINKEDIN <span aria-hidden="true">↗</span></a>
        <a href={GITHUB} target="_blank" rel="noreferrer" aria-label="Anirudh Shashikumar on GitHub (opens in a new tab)">GITHUB <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  );
}

export default function Contact() {
  const sequence = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { width, isShort, hasFinePointer, prefersReducedMotion: reducedMotion } = useViewport();
  const ready = width > 0;
  const prefersReducedMotion = reducedMotion || isShort;
  const signalBounds = useRef<DOMRect | null>(null);
  const signalFrame = useRef(0);
  const signalPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const measure = () => { signalBounds.current = element.getBoundingClientRect(); };
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(signalFrame.current); };
  }, []);

  useEffect(() => {
    const root = sequence.current;
    if (!root || !ready || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motion = "active";

    const context = gsap.context(() => {
      const opening = root.querySelector<HTMLElement>("[data-contact-opening]");
      const dot = root.querySelector<HTMLElement>("[data-contact-dot]");
      const question = root.querySelector<HTMLElement>("[data-contact-question]");
      const questionOutline = root.querySelector<HTMLElement>("[data-contact-question-outline]");
      const questionFill = root.querySelector<HTMLElement>("[data-contact-question-fill]");
      const invitation = root.querySelector<HTMLElement>("[data-contact-invitation]");
      const actions = root.querySelector<HTMLElement>("[data-contact-actions]");
      const monument = root.querySelector<HTMLElement>("[data-contact-monument]");
      const finalMeta = root.querySelector<HTMLElement>("[data-contact-final-meta]");

      if (!opening || !dot || !question || !questionOutline || !questionFill || !invitation || !actions || !monument || !finalMeta) return;

      gsap.set([question, invitation, actions, monument, finalMeta], { autoAlpha: 0 });
      gsap.set(questionOutline, { autoAlpha: 0, y: 18 });
      gsap.set(questionFill, { clipPath: "inset(100% 0 0 0)" });
      gsap.set(invitation, { y: 18 });
      gsap.set(actions, { y: 18 });
      gsap.set(monument, { yPercent: 18, scaleX: 0.98 });
      gsap.set(finalMeta, { y: 12 });

      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${Math.max(1, root.offsetHeight - (stage.current?.offsetHeight ?? window.innerHeight))}`,
            scrub: true,
            invalidateOnRefresh: true,
          },
        })
        .to(dot, { scale: 0.3, boxShadow: "0 0 0 0 rgba(174, 224, 246, 0)", duration: 0.08 }, 0.015)
        .to(opening, { autoAlpha: 0, duration: 0.035 }, 0.095)
        .to(question, { autoAlpha: 1, duration: 0.035 }, 0.11)
        .to(questionOutline, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.115)
        .to(questionFill, { clipPath: "inset(0% 0 0 0)", duration: 0.16 }, 0.17)
        .to(invitation, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.34)
        .to(invitation, { autoAlpha: 0, y: -12, duration: 0.035 }, 0.465)
        .to(actions, { autoAlpha: 1, y: 0, duration: 0.07 }, 0.505)
        .to(question, { yPercent: -28, scale: 0.7, autoAlpha: 0.38, duration: 0.12 }, 0.57)
        .to(actions, { yPercent: -188, duration: 0.15 }, 0.6)
        .to(monument, { autoAlpha: 1, yPercent: 0, scaleX: 1, duration: 0.16 }, 0.64)
        .to(finalMeta, { autoAlpha: 1, y: 0, duration: 0.08 }, 0.79);
    }, root);

    scheduleScrollRefresh();

    return () => {
      context.revert();
      delete root.dataset.motion;
    };
  }, [ready, prefersReducedMotion]);

  function updateSignal(event: ReactMouseEvent<HTMLDivElement>) {
    const bounds = signalBounds.current;
    if (!hasFinePointer || prefersReducedMotion || !stage.current || !bounds) return;
    signalPosition.current.x = event.clientX - bounds.left;
    signalPosition.current.y = event.clientY - bounds.top;
    if (signalFrame.current) return;
    signalFrame.current = requestAnimationFrame(() => {
      signalFrame.current = 0;
      stage.current?.style.setProperty("--signal-x", `${signalPosition.current.x}px`);
      stage.current?.style.setProperty("--signal-y", `${signalPosition.current.y}px`);
    });
  }

  function resetSignal() {
    cancelAnimationFrame(signalFrame.current);
    signalFrame.current = 0;
    if (!stage.current) return;
    stage.current.style.setProperty("--signal-x", "50%");
    stage.current.style.setProperty("--signal-y", "70%");
  }

  return (
    <section id="contact" className={styles.contact} aria-labelledby="contact-heading" data-visual-tone="contact">
      <h2 id="contact-heading" className="sr-only">Contact Anirudh Shashikumar</h2>

      <div ref={sequence} className={styles.sequence}>
        <div ref={stage} className={styles.stage} onMouseEnter={() => { signalBounds.current = stage.current?.getBoundingClientRect() ?? null; }} onMouseMove={updateSignal} onMouseLeave={resetSignal}>
          <SignalField />

          <div className={`${styles.layer} ${styles.opening}`} data-contact-opening>
            <p className={styles.micro}>04 / CONTACT · SIGNAL / OPEN</p>
            <span className={styles.dot} data-contact-dot aria-hidden="true" />
            <p>ONE SIGNAL.<br />WAITING FOR ANOTHER CONNECTION.</p>
          </div>

          <div className={`${styles.layer} ${styles.question}`} data-contact-question>
            <p className={styles.micro}>THE NEXT SIGNAL / 001</p>
            <div className={styles.questionType} aria-label="What should we build next?">
              <p className={styles.questionOutline} data-contact-question-outline aria-hidden="true">WHAT SHOULD<br />WE BUILD<br />NEXT?</p>
              <p className={styles.questionFill} data-contact-question-fill>WHAT SHOULD<br />WE BUILD<br />NEXT?</p>
            </div>
          </div>

          <div className={`${styles.layer} ${styles.invitation}`} data-contact-invitation>
            <p>HAVE AN IDEA, OPPORTUNITY,<br />COLLABORATION, EXPERIMENT,<br />OR SOMETHING INTERESTING<br />TO TALK ABOUT?</p>
            <strong>SEND A SIGNAL.</strong>
          </div>

          <div className={styles.actionLayer} data-contact-actions>
            <ContactActions />
          </div>

          <div className={styles.monument} data-contact-monument aria-hidden="true">
            <span className={styles.monumentBase}>ANIRUDH</span>
            <span className={styles.monumentLit}>ANIRUDH</span>
          </div>

          <div className={styles.finalMeta} data-contact-final-meta>
            <span>BASE / BENGALURU, INDIA</span>
            <span>FIELD / COMPUTER SCIENCE</span>
            <span>SIGNAL / OPEN</span>
          </div>
        </div>
      </div>

      <div className={styles.editorial}>
        <p className={styles.micro}>04 / CONTACT · THE NEXT SIGNAL</p>
        <h3>WHAT SHOULD<br />WE BUILD<br />NEXT?</h3>
        <p>Have an idea, opportunity, collaboration, experiment, or something interesting to talk about?</p>
        <strong>SEND A SIGNAL.</strong>
        <ContactActions />
        <div className={styles.editorialMonument} aria-hidden="true">ANIRUDH</div>
      </div>
    </section>
  );
}
