"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./MediTwinFeature.module.css";

const DESKTOP_MOTION = "(min-width: 901px) and (prefers-reduced-motion: no-preference)";

export default function MediTwinMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(DESKTOP_MOTION, () => {
        root.dataset.mtMotion = "active";

        const one = <T extends Element>(selector: string) => root.querySelector<T>(selector);
        const all = <T extends Element>(selector: string) => gsap.utils.toArray<T>(selector, root);
        const triggerDefaults = {
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        } as const;

        const bridge = one<HTMLElement>("[data-mt-bridge]");
        const bridgeLine = one<HTMLElement>("[data-mt-bridge-line]");
        const bridgeSignal = one<HTMLElement>("[data-mt-bridge-signal]");

        if (bridge && bridgeLine && bridgeSignal) {
          gsap.set("[data-mt-bridge-label], [data-mt-bridge-from], [data-mt-bridge-to]", { autoAlpha: 0 });
          gsap.set(bridgeLine, { scaleX: 0, transformOrigin: "left center" });
          gsap.set(bridgeSignal, { autoAlpha: 0, left: "0%" });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: bridge, start: "top 88%", ...triggerDefaults },
          })
            .fromTo("[data-mt-bridge-label]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 })
            .fromTo("[data-mt-bridge-from]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, ">-0.08")
            .fromTo(bridgeLine, { scaleX: 0 }, { scaleX: 1, duration: 0.62, ease: "power1.inOut" })
            .fromTo(bridgeSignal, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, left: "100%", duration: 0.58, ease: "none" }, "<")
            .to(bridgeSignal, { autoAlpha: 0, duration: 0.08 })
            .fromTo("[data-mt-bridge-to]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.34 }, ">-0.12");
        }

        const opening = one<HTMLElement>("[data-mt-opening]");
        const achievementItems = all<HTMLElement>("[data-mt-achievement-item]");
        const achievementResult = one<HTMLElement>("[data-mt-achievement-result]");
        const resultUnderline = achievementResult?.querySelector<HTMLElement>("i");
        const certificate = one<HTMLElement>("[data-mt-certificate]");

        if (opening) {
          gsap.set("[data-mt-entry-meta], [data-mt-entry-title], [data-mt-entry-type]", {
            autoAlpha: 0,
            clipPath: "inset(0 100% 0 0)",
          });
          gsap.set("[data-mt-statement-line]", { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", yPercent: 24 });
          gsap.set("[data-mt-entry-summary], [data-mt-entry-role]", { autoAlpha: 0, y: 10 });
          gsap.set("[data-mt-achievement-lead]", { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" });
          gsap.set(achievementItems, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          if (resultUnderline) gsap.set(resultUnderline, { scaleX: 0 });
          if (certificate) gsap.set(certificate, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", scale: 0.98, transformOrigin: "center" });
          gsap.set("[data-mt-certificate-caption]", { autoAlpha: 0 });

          const openingTimeline = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: opening, start: "top 78%", ...triggerDefaults },
          });

          openingTimeline
            .fromTo("[data-mt-entry-meta]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.34 })
            .fromTo("[data-mt-entry-title]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.52 }, ">-0.06")
            .fromTo("[data-mt-entry-type]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.38 }, ">-0.1")
            .fromTo("[data-mt-statement-line]", { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", yPercent: 24 }, { autoAlpha: 1, clipPath: "inset(0 0 0% 0)", yPercent: 0, stagger: 0.12, duration: 0.48 }, ">-0.02")
            .fromTo("[data-mt-entry-summary]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, ">-0.08")
            .fromTo("[data-mt-entry-role]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3 }, ">-0.12")
            .fromTo("[data-mt-achievement-lead]", { autoAlpha: 0, clipPath: "inset(0 0 100% 0)" }, { autoAlpha: 1, clipPath: "inset(0 0 0% 0)", duration: 0.36 }, ">-0.12");

          achievementItems.forEach((item, index) => {
            openingTimeline.fromTo(
              item,
              { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" },
              { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.3 },
              index === 0 ? ">-0.04" : ">-0.09",
            );
          });

          if (resultUnderline) {
            openingTimeline.fromTo(resultUnderline, { scaleX: 0 }, { scaleX: 1, duration: 0.38, ease: "power1.inOut" }, ">-0.08");
          }
          if (achievementResult) {
            openingTimeline.to(achievementResult, { backgroundColor: "rgba(77, 151, 169, 0.11)", duration: 0.28 }, "<");
          }
          if (certificate) {
            openingTimeline
              .fromTo(certificate, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", scale: 0.98 }, { autoAlpha: 1, clipPath: "inset(0 0 0% 0)", scale: 1, duration: 0.72, ease: "power2.inOut" }, ">-0.02")
              .fromTo("[data-mt-certificate-caption]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 }, ">-0.06");
          }
        }

        const formation = one<HTMLElement>("[data-mt-formation]");
        const formationSection = one<HTMLElement>("[data-mt-formation-section]");
        const contextSignals = all<HTMLElement>("[data-mt-context-signal]");
        const convergeLines = all<SVGPathElement>("[data-mt-converge-line]");
        const twinRings = all<SVGEllipseElement>("[data-mt-twin-ring]");
        const twinCore = one<SVGGElement>("[data-mt-twin-core]");
        const twinCenter = one<SVGCircleElement>("[data-mt-twin-center]");
        const syncLine = one<HTMLElement>("[data-mt-sync-line]");
        const syncSignal = one<HTMLElement>("[data-mt-sync-signal]");

        if (formation && formationSection && twinCore && twinCenter && syncLine && syncSignal) {
          const offsets = [
            { x: -18, y: -12 },
            { x: 18, y: -12 },
            { x: -18, y: 12 },
            { x: 18, y: 12 },
          ];

          gsap.set("[data-mt-formation-heading]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          contextSignals.forEach((signal, index) => gsap.set(signal, { autoAlpha: 0.22, ...offsets[index] }));
          gsap.set(convergeLines, { strokeDashoffset: 1 });
          gsap.set(twinRings, { autoAlpha: 0, scale: 0.72 });
          gsap.set(twinCore, { autoAlpha: 0, scale: 0.86 });
          gsap.set(twinCenter, { autoAlpha: 0, scale: 0.4 });
          gsap.set("[data-mt-twin-label]", { autoAlpha: 0, y: 5 });
          gsap.set("[data-mt-personal-context]", { autoAlpha: 0, x: -10 });
          gsap.set("[data-mt-digital-twin]", { autoAlpha: 0, x: 10 });
          gsap.set(syncLine, { scaleX: 0, transformOrigin: "left center" });
          gsap.set(syncSignal, { autoAlpha: 0, left: "0%" });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: formationSection, start: "top 76%", ...triggerDefaults },
          })
            .fromTo("[data-mt-formation-heading]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.4 })
            .to(contextSignals, { autoAlpha: 1, x: 0, y: 0, stagger: 0.08, duration: 0.4 }, ">-0.06")
            .fromTo(convergeLines, { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.08, duration: 0.48, ease: "power1.inOut" }, ">-0.04")
            .fromTo(twinRings, { autoAlpha: 0, scale: 0.72 }, { autoAlpha: 1, scale: 1, stagger: 0.1, duration: 0.44 }, ">-0.14")
            .fromTo(twinCore, { autoAlpha: 0, scale: 0.86 }, { autoAlpha: 1, scale: 1, duration: 0.42 }, ">-0.18")
            .fromTo(twinCenter, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.28 }, "<+0.1")
            .fromTo("[data-mt-twin-label]", { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.3 }, ">-0.12")
            .fromTo("[data-mt-personal-context]", { autoAlpha: 0, x: -10 }, { autoAlpha: 1, x: 0, duration: 0.32 })
            .fromTo("[data-mt-digital-twin]", { autoAlpha: 0, x: 10 }, { autoAlpha: 1, x: 0, duration: 0.36 }, ">-0.08")
            .fromTo(syncLine, { scaleX: 0 }, { scaleX: 1, duration: 0.44, ease: "power1.inOut" }, ">-0.08")
            .fromTo(syncSignal, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, left: "100%", duration: 0.48, ease: "none" }, "<")
            .to(syncSignal, { autoAlpha: 0, duration: 0.08 });
        }

        const concept = one<HTMLElement>("[data-mt-concept]");
        const conceptStages = all<HTMLElement>("[data-mt-concept-stage]");
        const conceptConnectors = all<HTMLElement>("[data-mt-concept-connector]");
        const conceptSignals = all<HTMLElement>("[data-mt-concept-signal]");

        if (concept && conceptStages.length) {
          gsap.set("[data-mt-concept-heading]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          gsap.set(conceptStages, { autoAlpha: 0.3, y: 10, borderColor: "rgba(132, 198, 217, 0.12)" });
          gsap.set(conceptConnectors, { scaleX: 0, transformOrigin: "left center" });
          gsap.set(conceptSignals, { autoAlpha: 0, left: "0%" });

          const conceptTimeline = gsap.timeline({
            scrollTrigger: { trigger: concept, start: "top 80%", ...triggerDefaults },
          });

          conceptTimeline.fromTo("[data-mt-concept-heading]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.38, ease: "power2.out" });

          conceptStages.forEach((stage, index) => {
            conceptTimeline.fromTo(
              stage,
              { autoAlpha: 0.3, y: 10, borderColor: "rgba(132, 198, 217, 0.12)" },
              { autoAlpha: 1, y: 0, borderColor: "rgba(132, 198, 217, 0.48)", duration: 0.34, ease: "power2.out" },
              index === 0 ? ">-0.04" : ">-0.02",
            );

            const connector = conceptConnectors[index];
            const signal = conceptSignals[index];
            if (connector) {
              conceptTimeline.fromTo(connector, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: "power1.inOut" }, ">-0.05");
            }
            if (signal) {
              conceptTimeline.fromTo(signal, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, left: "100%", duration: 0.3, ease: "none" }, "<").to(signal, { autoAlpha: 0, duration: 0.06 });
            }
          });
        }

        const transformation = one<HTMLElement>("[data-mt-transformation]");
        const transformationStages = all<HTMLElement>("[data-mt-transformation-stage]");
        const storyConnectors = all<HTMLElement>("[data-mt-story-connector]");
        const storySignals = all<HTMLElement>("[data-mt-story-signal]");

        if (transformation && transformationStages.length) {
          gsap.set(transformationStages, { autoAlpha: 0.28, y: 9 });
          gsap.set(storyConnectors, { scaleX: 0, transformOrigin: "left center" });
          gsap.set(storySignals, { autoAlpha: 0, left: "0%" });

          const storyTimeline = gsap.timeline({
            scrollTrigger: { trigger: transformation, start: "top 82%", ...triggerDefaults },
          });

          transformationStages.forEach((stage, index) => {
            storyTimeline.fromTo(stage, { autoAlpha: 0.28, y: 9 }, { autoAlpha: 1, y: 0, duration: 0.36, ease: "power2.out" }, index === 0 ? 0 : ">-0.02");

            const connector = storyConnectors[index];
            const signal = storySignals[index];
            if (connector) {
              storyTimeline.fromTo(connector, { scaleX: 0 }, { scaleX: 1, duration: 0.34, ease: "power1.inOut" }, ">-0.04");
            }
            if (signal) {
              storyTimeline.fromTo(signal, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, left: "100%", duration: 0.34, ease: "none" }, "<").to(signal, { autoAlpha: 0, duration: 0.06 });
            }
          });
        }

        const execution = one<HTMLElement>("[data-mt-execution]");
        const teamFrame = one<HTMLElement>("[data-mt-team-frame]");
        const timeLine = one<HTMLElement>("[data-mt-time-line]");
        const timeSignal = one<HTMLElement>("[data-mt-time-signal]");

        if (execution && teamFrame && timeLine && timeSignal) {
          gsap.set(teamFrame, { clipPath: "inset(0 0 100% 0)" });
          gsap.set("[data-mt-team-frame] img", { scale: 1.01 });
          gsap.set("[data-mt-team-caption], [data-mt-execution-label], [data-mt-execution-title], [data-mt-execution-copy], [data-mt-execution-organizer]", { autoAlpha: 0, y: 8 });
          gsap.set("[data-mt-time]", { autoAlpha: 0 });
          gsap.set(timeLine, { scaleX: 0 });
          gsap.set(timeSignal, { autoAlpha: 0, left: "0%" });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: execution, start: "top 82%", ...triggerDefaults },
          })
            .fromTo(teamFrame, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.58, ease: "power2.inOut" })
            .to("[data-mt-team-frame] img", { scale: 1, duration: 0.46 }, "<+0.08")
            .fromTo("[data-mt-team-caption]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28 })
            .fromTo("[data-mt-execution-label]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28 }, "<")
            .fromTo("[data-mt-execution-title]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.36 }, ">-0.08")
            .fromTo("[data-mt-time]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 }, ">-0.04")
            .fromTo(timeLine, { scaleX: 0 }, { scaleX: 1, duration: 0.58, ease: "power1.inOut" }, "<+0.08")
            .fromTo(timeSignal, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, left: "100%", duration: 0.58, ease: "none" }, "<")
            .to(timeSignal, { autoAlpha: 0, duration: 0.08 })
            .fromTo("[data-mt-execution-copy]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.34 }, ">-0.08")
            .fromTo("[data-mt-execution-organizer]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28 }, ">-0.1");
        }

        const endcap = one<HTMLElement>("[data-mt-endcap]");
        if (endcap) {
          gsap.set("[data-mt-endcap-copy]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          gsap.set("[data-mt-cta]", { autoAlpha: 0, x: -8 });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: endcap, start: "top 90%", ...triggerDefaults },
          })
            .fromTo("[data-mt-endcap-copy]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.46 })
            .fromTo("[data-mt-cta]", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.34 }, ">-0.12");
        }

        ScrollTrigger.refresh();

        return () => {
          delete root.dataset.mtMotion;
        };
      });
    }, root);

    return () => {
      media.revert();
      context.revert();
      delete root.dataset.mtMotion;
    };
  }, []);

  return <div ref={rootRef} className={styles.motionRoot}>{children}</div>;
}
