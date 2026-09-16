"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./MediFitFeature.module.css";

const DESKTOP_MOTION = "(min-width: 901px) and (prefers-reduced-motion: no-preference)";

export default function MediFitMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(DESKTOP_MOTION, () => {
        root.dataset.mfMotion = "active";

        const one = <T extends Element>(selector: string) => root.querySelector<T>(selector);
        const all = <T extends Element>(selector: string) => gsap.utils.toArray<T>(selector, root);
        const triggerDefaults = {
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        } as const;

        const bridge = one<HTMLElement>("[data-mf-bridge]");
        const bridgeLine = one<HTMLElement>("[data-mf-bridge-line]");
        const bridgeSignal = one<HTMLElement>("[data-mf-bridge-signal]");

        if (bridge && bridgeLine && bridgeSignal) {
          gsap.set("[data-mf-bridge-label], [data-mf-bridge-from], [data-mf-bridge-to]", { autoAlpha: 0 });
          gsap.set(bridgeLine, { scaleX: 0, transformOrigin: "left center" });
          gsap.set(bridgeSignal, { autoAlpha: 0, left: "0%" });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: bridge, start: "top 88%", ...triggerDefaults },
          })
            .fromTo("[data-mf-bridge-label]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 })
            .fromTo("[data-mf-bridge-from]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28 }, ">-0.06")
            .fromTo(bridgeLine, { scaleX: 0 }, { scaleX: 1, duration: 0.56, ease: "power1.inOut" })
            .fromTo(bridgeSignal, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, left: "100%", duration: 0.54, ease: "none" }, "<")
            .to(bridgeSignal, { autoAlpha: 0, duration: 0.06 })
            .fromTo("[data-mf-bridge-to]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, ">-0.1");
        }

        const opening = one<HTMLElement>("[data-mf-opening]");
        const statItems = all<HTMLElement>("[data-mf-stat-item]");

        if (opening) {
          gsap.set("[data-mf-entry-meta], [data-mf-entry-title], [data-mf-entry-type]", {
            autoAlpha: 0,
            clipPath: "inset(0 100% 0 0)",
          });
          gsap.set("[data-mf-statement-line]", { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", yPercent: 22 });
          gsap.set("[data-mf-entry-summary], [data-mf-entry-role]", { autoAlpha: 0, y: 9 });
          gsap.set(statItems, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          gsap.set("[data-mf-contribution-tag]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: opening, start: "top 78%", ...triggerDefaults },
          })
            .fromTo("[data-mf-entry-meta]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.3 })
            .fromTo("[data-mf-entry-title]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.46 }, ">-0.05")
            .fromTo("[data-mf-entry-type]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.34 }, ">-0.08")
            .fromTo("[data-mf-statement-line]", { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", yPercent: 22 }, { autoAlpha: 1, clipPath: "inset(0 0 0% 0)", yPercent: 0, stagger: 0.1, duration: 0.42 }, ">-0.02")
            .fromTo("[data-mf-entry-summary]", { autoAlpha: 0, y: 9 }, { autoAlpha: 1, y: 0, duration: 0.34 }, ">-0.06")
            .fromTo("[data-mf-entry-role]", { autoAlpha: 0, y: 9 }, { autoAlpha: 1, y: 0, duration: 0.28 }, ">-0.1")
            .fromTo(statItems, { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", stagger: 0.08, duration: 0.3 }, ">-0.1")
            .fromTo("[data-mf-contribution-tag]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.34 }, ">-0.08");
        }

        const engine = one<HTMLElement>("[data-mf-engine-section]");
        const contextNodes = all<HTMLElement>("[data-mf-context-node]");
        const inputFlows = all<SVGPathElement>("[data-mf-engine-input-flow]");
        const outputFlow = one<SVGPathElement>("[data-mf-engine-output-flow]");
        const engineCore = one<SVGRectElement>("[data-mf-engine-core]");
        const outputBox = one<SVGRectElement>("[data-mf-output-box]");

        if (engine && engineCore && outputFlow && outputBox) {
          const offsets = [
            { x: -22, y: -9 },
            { x: 22, y: -9 },
            { x: -22, y: 9 },
            { x: 22, y: 9 },
          ];

          gsap.set("[data-mf-engine-heading]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          contextNodes.forEach((node, index) => gsap.set(node, { autoAlpha: 0.22, ...offsets[index] }));
          gsap.set(inputFlows, { strokeDashoffset: 1 });
          gsap.set(outputFlow, { strokeDashoffset: 1 });
          gsap.set(engineCore, { autoAlpha: 0.18, scaleX: 0.5, transformOrigin: "center", transformBox: "fill-box" });
          gsap.set(outputBox, { autoAlpha: 0, scaleX: 0.45, transformOrigin: "left center", transformBox: "fill-box" });
          gsap.set("[data-mf-core-label], [data-mf-output-label]", { autoAlpha: 0 });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: engine, start: "top 78%", ...triggerDefaults },
          })
            .fromTo("[data-mf-engine-heading]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.36 })
            .to(contextNodes, { autoAlpha: 1, x: 0, y: 0, stagger: 0.07, duration: 0.34 }, ">-0.04")
            .fromTo(inputFlows, { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.07, duration: 0.42, ease: "power1.inOut" }, ">-0.05")
            .fromTo(engineCore, { autoAlpha: 0.18, scaleX: 0.5 }, { autoAlpha: 1, scaleX: 1, duration: 0.38 }, ">-0.12")
            .fromTo("[data-mf-core-label]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.24 }, "<+0.12")
            .fromTo(outputFlow, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.38, ease: "power1.inOut" }, ">-0.04")
            .fromTo(outputBox, { autoAlpha: 0, scaleX: 0.45 }, { autoAlpha: 1, scaleX: 1, duration: 0.34 }, ">-0.12")
            .fromTo("[data-mf-output-label]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.26 }, "<+0.1");
        }

        const storyGrid = one<HTMLElement>("[data-mf-story-grid]");
        const storyBlocks = all<HTMLElement>("[data-mf-story-block]");
        const storyConnectors = all<HTMLElement>("[data-mf-transform-connector]");
        const storySignals = all<HTMLElement>("[data-mf-transform-signal]");
        const buildSegments = all<HTMLElement>("[data-mf-build-segment]");
        const achievementWords = all<HTMLElement>("[data-mf-achievement-sequence] > span:nth-child(odd)");
        const achievementLines = all<HTMLElement>("[data-mf-achievement-line]");
        const certificate = one<HTMLElement>("[data-mf-certificate]");
        const teamFrame = one<HTMLElement>("[data-mf-team-frame]");

        if (storyGrid && storyBlocks.length && certificate && teamFrame) {
          gsap.set(storyBlocks, { autoAlpha: 0.25, x: -12, borderColor: "rgba(196, 169, 94, 0.1)" });
          gsap.set(storyConnectors, { scaleY: 0, transformOrigin: "top center" });
          gsap.set(storySignals, { autoAlpha: 0, top: "0%" });
          gsap.set("[data-mf-fullstack-title], [data-mf-fullstack-copy]", { autoAlpha: 0, y: 8 });
          gsap.set("[data-mf-fullstack-rule]", { scaleX: 0 });
          gsap.set(buildSegments, { borderColor: "rgba(196, 169, 94, 0.14)", backgroundColor: "rgba(196, 169, 94, 0.03)" });
          gsap.set("[data-mf-delivered]", { autoAlpha: 0, y: 5 });
          gsap.set(achievementWords, { autoAlpha: 0 });
          gsap.set(achievementLines, { scaleX: 0, transformOrigin: "left center" });
          gsap.set("[data-mf-result-text], [data-mf-result-event], [data-mf-achievement-meta]", { autoAlpha: 0, y: 7 });
          gsap.set("[data-mf-achievement-accent]", { scaleX: 0, transformOrigin: "left center", width: "100%" });
          gsap.set(certificate, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", scale: 0.98, transformOrigin: "center" });
          gsap.set("[data-mf-certificate-caption]", { autoAlpha: 0 });
          gsap.set(teamFrame, { clipPath: "inset(0 100% 0 0)" });
          gsap.set("[data-mf-team-frame] img", { scale: 1.01 });
          gsap.set("[data-mf-team-caption], [data-mf-team-copy]", { autoAlpha: 0, y: 7 });

          const storyTimeline = gsap.timeline({
            scrollTrigger: { trigger: storyGrid, start: "top 80%", ...triggerDefaults },
          });

          storyBlocks.forEach((block, index) => {
            storyTimeline.fromTo(
              block,
              { autoAlpha: 0.25, x: -12, borderColor: "rgba(196, 169, 94, 0.1)" },
              { autoAlpha: 1, x: 0, borderColor: index === storyBlocks.length - 1 ? "rgba(118, 189, 145, 0.45)" : "rgba(196, 169, 94, 0.38)", duration: 0.28, ease: "power2.out" },
              index === 0 ? 0 : ">-0.02",
            );

            const connector = storyConnectors[index];
            const signal = storySignals[index];
            if (connector) {
              storyTimeline.fromTo(connector, { scaleY: 0 }, { scaleY: 1, duration: 0.2, ease: "power1.inOut" }, ">-0.04");
            }
            if (signal) {
              storyTimeline.fromTo(signal, { autoAlpha: 0, top: "0%" }, { autoAlpha: 1, top: "100%", duration: 0.2, ease: "none" }, "<").to(signal, { autoAlpha: 0, duration: 0.05 });
            }
          });

          storyTimeline
            .fromTo("[data-mf-fullstack-title]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: "power2.out" }, ">-0.02")
            .fromTo("[data-mf-fullstack-rule]", { scaleX: 0 }, { scaleX: 1, duration: 0.34, ease: "power1.inOut" }, ">-0.08")
            .fromTo("[data-mf-fullstack-copy]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, ">-0.12")
            .to(buildSegments, { borderColor: "rgba(196, 169, 94, 0.48)", backgroundColor: "rgba(196, 169, 94, 0.14)", stagger: 0.07, duration: 0.2, ease: "power1.out" }, ">-0.12")
            .to(buildSegments.at(-1) ?? [], { borderColor: "rgba(118, 189, 145, 0.58)", backgroundColor: "rgba(80, 156, 120, 0.18)", duration: 0.22 }, ">-0.08")
            .fromTo("[data-mf-delivered]", { autoAlpha: 0, y: 5 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" }, "<")
            .fromTo(achievementWords, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.11, duration: 0.22 }, ">-0.02")
            .fromTo(achievementLines, { scaleX: 0 }, { scaleX: 1, stagger: 0.11, duration: 0.26, ease: "power1.inOut" }, "<+0.08")
            .fromTo("[data-mf-result-text]", { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" })
            .fromTo("[data-mf-result-event]", { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.24 }, ">-0.1")
            .fromTo("[data-mf-achievement-accent]", { scaleX: 0 }, { scaleX: 1, duration: 0.4, ease: "power1.inOut" }, "<")
            .fromTo("[data-mf-achievement-meta]", { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, duration: 0.26 }, ">-0.08")
            .fromTo(certificate, { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", scale: 0.98 }, { autoAlpha: 1, clipPath: "inset(0 0 0% 0)", scale: 1, duration: 0.58, ease: "power2.inOut" }, ">-0.02")
            .fromTo("[data-mf-certificate-caption]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.22 }, ">-0.06")
            .fromTo(teamFrame, { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.48, ease: "power2.inOut" }, ">-0.04")
            .to("[data-mf-team-frame] img", { scale: 1, duration: 0.36 }, "<+0.06")
            .fromTo("[data-mf-team-caption], [data-mf-team-copy]", { autoAlpha: 0, y: 7 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.26 }, ">-0.06");
        }

        const endcap = one<HTMLElement>("[data-mf-endcap]");
        if (endcap) {
          gsap.set("[data-mf-endcap-copy]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" });
          gsap.set("[data-mf-cta]", { autoAlpha: 0, x: -8 });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: endcap, start: "top 90%", ...triggerDefaults },
          })
            .fromTo("[data-mf-endcap-copy]", { autoAlpha: 0, clipPath: "inset(0 100% 0 0)" }, { autoAlpha: 1, clipPath: "inset(0 0% 0 0)", duration: 0.42 })
            .fromTo("[data-mf-cta]", { autoAlpha: 0, x: -8 }, { autoAlpha: 1, x: 0, duration: 0.3 }, ">-0.1");
        }

        const closing = one<HTMLElement>("[data-mf-work-closing]");
        if (closing) {
          gsap.set("[data-mf-closing-index], [data-mf-closing-title], [data-mf-closing-sub]", { autoAlpha: 0, y: 8 });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: { trigger: closing, start: "top 88%", ...triggerDefaults },
          })
            .fromTo("[data-mf-closing-index]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.26 })
            .fromTo("[data-mf-closing-title]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.34 }, ">-0.08")
            .fromTo("[data-mf-closing-sub]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3 }, ">-0.1");
        }

        ScrollTrigger.refresh();

        return () => {
          delete root.dataset.mfMotion;
        };
      });
    }, root);

    return () => {
      media.revert();
      context.revert();
      delete root.dataset.mfMotion;
    };
  }, []);

  return <div ref={rootRef} className={styles.motionRoot}>{children}</div>;
}
