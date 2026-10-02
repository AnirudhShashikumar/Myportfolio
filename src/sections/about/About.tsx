"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import { scheduleScrollRefresh } from "@/components/system/scrollRefresh";
import { chapters, movements, plates } from "./aboutContent";
import { AboutEditorial, AboutVisualPlate } from "./AboutStory";
import styles from "./About.module.css";

export default function About() {
  const section = useRef<HTMLElement>(null);
  const sequence = useRef<HTMLDivElement>(null);
  const pendingChapter = useRef<string | null>(null);
  const currentMovement = useRef("M01");
  const stageWasActive = useRef(false);
  const [reader, setReader] = useState(false);
  const { width, height, hasFinePointer, prefersReducedMotion } = useViewport();
  // A fine pointer alone is not enough: tablets, short windows and zoom use flow.
  const canStage = width >= 1100 && height >= 780 && hasFinePointer && !prefersReducedMotion;
  const cinematic = canStage && !reader;

  useLayoutEffect(() => {
    const root = sequence.current;
    if (!root || !cinematic) {
      if (stageWasActive.current && !pendingChapter.current) pendingChapter.current = currentMovement.current;
      stageWasActive.current = false;
      scheduleScrollRefresh(); return;
    }
    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motion = "active";
    let disposed = false;
    const context = gsap.context(() => {
      const visualPlates = Array.from(root.querySelectorAll<HTMLElement>("[data-about-plate]"));
      const trace = root.querySelector<SVGElement>("[data-about-trace]");
      const inherited = root.querySelector<SVGGElement>("[data-about-inherited]");
      const label = root.querySelector<HTMLElement>("[data-about-chapter-label]");
      const stem = root.querySelector<HTMLElement>("[data-about-question-stem]");
      const dot = root.querySelector<HTMLElement>("[data-about-question-dot]");
      const stage = root.firstElementChild as HTMLElement;
      let previous = -1;
      function syncState(progress: number) {
        const found = plates.findIndex(plate => progress < plate.end);
        const index = found < 0 ? plates.length - 1 : found;
        if (index === previous) return;
        previous = index;
        const movement = movements[plates[index].movement];
        currentMovement.current = movement.id;
        root!.dataset.movement = movement.id;
        root!.dataset.plate = String(index);
        if (label) { label.textContent = `02 / ABOUT · ${chapters[movement.chapter]}`; label.hidden = movement.chapter >= 4; }
      }
      gsap.set(visualPlates, { autoAlpha: 0, y: 0 });
      gsap.set(visualPlates[0], { autoAlpha: 1 });
      gsap.set([stem, dot], { autoAlpha: 0 });
      const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
        id: "about-story", trigger: root, start: "top top",
        end: () => `+=${Math.max(1, root.offsetHeight - stage.offsetHeight)}`,
        scrub: true, invalidateOnRefresh: true,
        onUpdate: self => { stageWasActive.current = self.isActive; syncState(self.progress); },
        onRefresh: self => { stageWasActive.current = self.isActive; syncState(self.progress); },
      } });
      plates.forEach((plate, index) => {
        // One dominant thought at every boundary. Sets resolve arbitrary jumps;
        // short scroll-mapped settling gives way to long, fully readable holds.
        if (index) timeline.set(visualPlates[index], { autoAlpha: .82, y: 12 }, plate.start)
          .to(visualPlates[index], { autoAlpha: 1, y: 0, duration: .004 }, plate.start);
        if (index < plates.length - 1) timeline.to(visualPlates[index], { autoAlpha: .82, y: -8, duration: .003 }, plate.end - .003)
          .set(visualPlates[index], { autoAlpha: 0 }, plate.end);
      });
      timeline.to(inherited, { autoAlpha: 0, duration: .025 }, .05)
        .to(trace, { autoAlpha: 0, duration: .012 }, .063)
        .set(trace, { rotation: -90, scale: .5, autoAlpha: 0 }, .12)
        .to(trace, { autoAlpha: .5, duration: .006 }, .12)
        .to(trace, { scale: .78, duration: .008 }, .22)
        .to(trace, { scale: .58, duration: .008 }, .40)
        .to(trace, { scale: .82, duration: .008 }, .48)
        .to(trace, { scale: .42, duration: .008 }, .60)
        .to(trace, { scale: .6, duration: .008 }, .66)
        .to(trace, { autoAlpha: 0, duration: .006 }, .734)
        .to([stem, dot], { autoAlpha: 1, duration: .004 }, .969)
        .to(stem, { autoAlpha: 0, y: -6, duration: .01 }, .99);
      syncState(timeline.scrollTrigger?.progress ?? 0);
    }, root);
    scheduleScrollRefresh();
    void document.fonts.ready.then(() => { if (!disposed) scheduleScrollRefresh(); });
    return () => { disposed = true; context.revert(); delete root.dataset.motion; };
  }, [cinematic]);

  useLayoutEffect(() => {
    const movement = pendingChapter.current;
    if (!movement) return;
    pendingChapter.current = null;
    if (cinematic) {
      const root = sequence.current;
      const plate = plates.find(item => movements[item.movement].id === movement);
      if (root && plate) {
        const stage = root.firstElementChild as HTMLElement;
        window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY + (root.offsetHeight - stage.offsetHeight) * plate.start, behavior: "instant" });
        ScrollTrigger.update();
        root.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      }
    } else {
      const heading = section.current?.querySelector<HTMLElement>(`#about-${movement}`);
      heading?.scrollIntoView({ behavior: "instant", block: "start" });
      heading?.focus({ preventScroll: true });
    }
  }, [cinematic]);

  function toggleReader() {
    pendingChapter.current = cinematic ? currentMovement.current :
      Array.from(section.current?.querySelectorAll<HTMLElement>("[data-about-reading]") ?? []).find(element => element.getBoundingClientRect().bottom > 120)?.dataset.aboutReading ?? "M01";
    setReader(value => !value);
  }

  return <section ref={section} id="about" className={styles.about} aria-labelledby="about-heading" data-visual-tone="about" data-cinematic={cinematic}>
    <h2 id="about-heading" className="sr-only">About Anirudh Shashikumar</h2>
    <div ref={sequence} className={styles.sequence}>
      {cinematic && <div className={styles.stage}>
        <button className={styles.readerControl} type="button" onClick={toggleReader}>Read without motion <span aria-hidden="true">↗</span></button>
        <div className={styles.presentation} aria-hidden="true">
          <p className={styles.chapterLabel} data-about-chapter-label>02 / ABOUT · PERSON / ORIGIN</p>
          <svg className={styles.trace} data-about-trace viewBox="0 0 200 600" aria-hidden="true"><path d="M100 0 V600" /><g data-about-inherited><path d="M30 170 H170 M30 430 H170 M30 170 V430" /><circle cx="30" cy="170" r="2" /><circle cx="30" cy="430" r="2" /><circle cx="170" cy="170" r="2" /></g></svg>
          {plates.map((plate, index) => <AboutVisualPlate key={index} plate={plate} index={index} />)}
          <div className={styles.question} aria-hidden="true"><span data-about-question-stem>?</span><i data-about-question-dot /></div>
        </div>
      </div>}
    </div>
    {canStage && reader && <button className={styles.returnControl} type="button" onClick={toggleReader}>Return to motion <span aria-hidden="true">↗</span></button>}
    <AboutEditorial cinematic={cinematic} />
  </section>;
}
