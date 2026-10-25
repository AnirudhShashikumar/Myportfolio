"use client";

import { createContext, useContext, useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useViewport } from "@/components/system/ViewportProvider";
import { clearFocusReveal, keepFocusInView, revealFocusPath } from "@/components/system/focusReveal";
import focusStyles from "@/components/system/FocusReveal.module.css";
import styles from "./WorkAccessibility.module.css";

const ReadingContext = createContext(false);
export const useWorkReading = () => useContext(ReadingContext);

export default function WorkAccessibility({ children, className }: { children: ReactNode; className: string }) {
  const section = useRef<HTMLElement>(null);
  const pendingProject = useRef<string | null>(null);
  const [reading, setReading] = useState(false);
  const { width } = useViewport();

  useEffect(() => {
    const project = pendingProject.current;
    if (project === null) return;
    pendingProject.current = null;
    // Child GSAP contexts have reverted/rebuilt before this refresh. Preserve
    // the selected project's entry, rather than seeking through the archive.
    const frame = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      const target = section.current?.querySelector<HTMLElement>(`[data-work-project="${project}"]`);
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: "instant" });
      ScrollTrigger.update();
    });
    return () => cancelAnimationFrame(frame);
  }, [reading]);

  function toggleReading() {
    const projects = section.current?.querySelectorAll<HTMLElement>("[data-work-project]");
    pendingProject.current = Array.from(projects ?? []).find(project => project.getBoundingClientRect().bottom > 100)?.dataset.workProject ?? "0";
    setReading(value => !value);
  }

  return <ReadingContext.Provider value={reading}>
    <section ref={section} id="work" aria-label="Work" className={className} data-visual-tone="work" data-work-reading={reading}>
      <button type="button" hidden={width === 0} className={styles.readerControl} aria-pressed={reading} onClick={toggleReading}>
        {reading ? "Return to Work motion" : "Read Work without motion"}
      </button>
      {children}
    </section>
  </ReadingContext.Provider>;
}

export function AccessibleProject({ children, className, labelledBy }: { children: ReactNode; className: string; labelledBy: string }) {
  function handleFocus(event: FocusEvent<HTMLElement>) {
    const target = event.target.closest<HTMLElement>("a,button");
    if (!target) return;
    revealFocusPath(target, event.currentTarget);
    if (target.matches(":focus-visible")) {
      keepFocusInView(target);
      ScrollTrigger.update();
    }
  }

  return <article className={`${className} ${focusStyles.semantic}`} aria-labelledby={labelledBy} onFocusCapture={handleFocus}
    onBlurCapture={event => clearFocusReveal(event.currentTarget)}>{children}</article>;
}
