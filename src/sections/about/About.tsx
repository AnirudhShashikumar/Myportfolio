"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import { scheduleScrollRefresh } from "@/components/system/scrollRefresh";
import { chapters, movements, plates } from "./aboutContent";
import { AboutEditorial, AboutVisualPlate } from "./AboutStory";
import styles from "./About.module.css";
import AboutGeometry from "./AboutGeometry";
import { buildAboutTimeline, observeAboutEditorial } from "./aboutMotion";

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
      const label = root.querySelector<HTMLElement>("[data-about-chapter-label]");
      let previous = -1;
      function syncState(progress: number, active: boolean) {
        stageWasActive.current = active;
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
      const timeline = buildAboutTimeline(root, syncState);
      syncState(timeline.scrollTrigger?.progress ?? 0, timeline.scrollTrigger?.isActive ?? false);
    }, root);
    scheduleScrollRefresh();
    void document.fonts.ready.then(() => { if (!disposed) scheduleScrollRefresh(); });
    return () => { disposed = true; context.revert(); delete root.dataset.motion; };
  }, [cinematic]);

  useLayoutEffect(() => {
    if (!section.current || width === 0 || cinematic || reader || prefersReducedMotion) return;
    return observeAboutEditorial(section.current);
  }, [cinematic, reader, prefersReducedMotion, width]);

  useLayoutEffect(() => {
    const root = sequence.current;
    if (!root || !cinematic) return;
    // Decode the two real archives near entry, not on the certificate's reveal.
    // Intrinsic dimensions reserve their space; this does not trigger a refresh.
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      root.querySelectorAll<HTMLImageElement>("img").forEach(img => {
        img.loading = "eager";
        void img.decode().catch(() => { /* Native image/alt fallback remains. */ });
      });
      observer.disconnect();
    }, { rootMargin: "150% 0px" });
    observer.observe(root);
    return () => observer.disconnect();
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
        window.scrollTo({ top: root.getBoundingClientRect().top + window.scrollY + (root.offsetHeight - stage.offsetHeight) * (plate.start + (plate.end - plate.start) * .25), behavior: "instant" });
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
          <AboutGeometry />
          {plates.map((plate, index) => <AboutVisualPlate key={index} plate={plate} index={index} />)}
          <div className={styles.question} aria-hidden="true"><span data-about-question-stem>?</span><i data-about-question-dot /></div>
        </div>
      </div>}
    </div>
    {canStage && reader && <button className={styles.returnControl} type="button" onClick={toggleReader}>Return to motion <span aria-hidden="true">↗</span></button>}
    <AboutEditorial cinematic={cinematic} />
  </section>;
}
