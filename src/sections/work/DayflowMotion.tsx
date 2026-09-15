"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, type ReactNode } from "react";
import styles from "./DayflowFeature.module.css";

const DESKTOP_MOTION = "(min-width: 901px) and (prefers-reduced-motion: no-preference)";

export default function DayflowMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(DESKTOP_MOTION, () => {
        root.dataset.dfMotion = "active";

        const one = (selector: string) => root.querySelector<HTMLElement>(selector);
        const all = (selector: string) => Array.from(root.querySelectorAll<HTMLElement>(selector));

        const entry = one("[data-df-entry]");
        const routing = one("[data-df-routing]");
        const routePaths = all("[data-df-route-path]");

        if (entry) {
          const entryTimeline = gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: entry,
              start: "top 76%",
              toggleActions: "play none none reverse",
            },
          });

          entryTimeline
            .fromTo("[data-df-entry-meta]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.32 })
            .fromTo("[data-df-entry-title]", { autoAlpha: 0, y: 18, clipPath: "inset(0 0 100% 0)" }, { autoAlpha: 1, y: 0, clipPath: "inset(0 0 0% 0)", duration: 0.52 }, ">-0.04")
            .fromTo("[data-df-entry-type]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28 }, ">-0.2")
            .fromTo("[data-df-platform]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.42 }, ">-0.02")
            .fromTo("[data-df-workspaces-title]", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.42 }, ">-0.16")
            .fromTo("[data-df-entry-copy]", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.38 }, ">-0.08")
            .fromTo("[data-df-entry-contribution]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.3 }, ">-0.2")
            .fromTo("[data-df-login]", { autoAlpha: 0, xPercent: 3, clipPath: "inset(0 0 0 12%)" }, { autoAlpha: 1, xPercent: 0, clipPath: "inset(0 0 0 0%)", duration: 0.68 }, ">-0.12");

          if (routing && routePaths.length) {
            entryTimeline
              .fromTo(routing, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, ">-0.08")
              .fromTo("[data-df-route-node]", { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.25 })
              .fromTo(routePaths, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut" }, ">-0.04")
              .fromTo("[data-df-route-destination]", { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.26 }, ">-0.1")
              .to(routing, { autoAlpha: 0, duration: 0.35, delay: 0.45, ease: "power1.in" });
          }
        }

        const workspaces = one("[data-df-workspaces]");
        const roleLines = all("[data-df-role-line]");
        const employeeFrame = one('[data-df-workspace="employee"] [data-df-workspace-frame]');
        const adminFrame = one('[data-df-workspace="admin"] [data-df-workspace-frame]');

        if (workspaces && employeeFrame && adminFrame) {
          if (roleLines[0]) gsap.set(roleLines[0], { transformOrigin: "right center" });
          if (roleLines[1]) gsap.set(roleLines[1], { transformOrigin: "left center" });

          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: workspaces,
              start: "top 72%",
              toggleActions: "play none none reverse",
            },
          })
            .fromTo("[data-df-workspaces-heading]", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.44 })
            .fromTo("[data-df-role-node]", { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.3 })
            .fromTo(roleLines, { scaleX: 0 }, { scaleX: 1, duration: 0.62, ease: "power1.inOut" }, ">-0.08")
            .fromTo("[data-df-role-label]", { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.08, duration: 0.25 }, ">-0.18")
            .fromTo(employeeFrame, { autoAlpha: 0.2, xPercent: 5, clipPath: "inset(0 0 0 12%)" }, { autoAlpha: 1, xPercent: 0, clipPath: "inset(0 0 0 0%)", duration: 0.72 }, ">-0.02")
            .fromTo(adminFrame, { autoAlpha: 0.2, xPercent: -5, clipPath: "inset(0 12% 0 0)" }, { autoAlpha: 1, xPercent: 0, clipPath: "inset(0 0% 0 0)", duration: 0.72 }, "<")
            .fromTo("[data-df-workspace-label]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.3 })
            .fromTo("[data-df-workspace-copy]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, stagger: 0.08, duration: 0.32 }, ">-0.14");
        }

        const architecture = one("[data-df-architecture]");
        const architectureNodes = all("[data-df-architecture-node]");
        const architectureLines = all("[data-df-architecture-line]");
        const architectureSignals = all("[data-df-architecture-signal]");

        if (architecture && architectureNodes.length) {
          const architectureTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: architecture,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          });

          architectureNodes.forEach((node, index) => {
            architectureTimeline.fromTo(
              node,
              { autoAlpha: 0.38, y: 12, borderColor: "rgba(157, 182, 211, 0.12)" },
              { autoAlpha: 1, y: 0, borderColor: "rgba(157, 196, 239, 0.52)", duration: 0.36, ease: "power2.out" },
              index === 0 ? 0 : ">-0.04",
            );

            const line = architectureLines[index];
            const signal = architectureSignals[index];
            if (line) {
              architectureTimeline.fromTo(line, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.28, ease: "power1.inOut" }, ">-0.05");
            }
            if (signal) {
              architectureTimeline.fromTo(signal, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, left: "100%", duration: 0.28, ease: "none" }, "<").to(signal, { autoAlpha: 0, duration: 0.08 });
            }
          });
        }

        const authorization = one("[data-df-authorization]");
        if (authorization) {
          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: authorization,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          })
            .fromTo("[data-df-authorization-title] span:first-child", { autoAlpha: 0, x: -16 }, { autoAlpha: 1, x: 0, duration: 0.34 })
            .fromTo("[data-df-authorization-title] span:last-child", { autoAlpha: 0, x: 16 }, { autoAlpha: 1, x: 0, duration: 0.4 }, ">-0.14")
            .fromTo("[data-df-authorization-copy]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.36 }, ">-0.1")
            .to(architectureNodes.slice(2), { borderColor: "rgba(176, 210, 248, 0.68)", duration: 0.28, stagger: 0.08 }, "<");
        }

        const transaction = one("[data-df-transaction]");
        const transactionNodes = all("[data-df-transaction-node]");
        const transactionLines = all("[data-df-transaction-line]");
        const transactionSignals = all("[data-df-transaction-signal]");

        if (transaction && transactionNodes.length) {
          const transactionTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: transaction,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          });

          transactionNodes.forEach((node, index) => {
            transactionTimeline.fromTo(
              node,
              { autoAlpha: 0.35, y: 8, borderColor: "rgba(157, 182, 211, 0.1)" },
              { autoAlpha: 1, y: 0, borderColor: "rgba(157, 196, 239, 0.48)", duration: 0.3, ease: "power2.out" },
              index === 0 ? 0 : ">-0.03",
            );

            const line = transactionLines[index];
            const signal = transactionSignals[index];
            if (line) {
              transactionTimeline.fromTo(line, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.22, ease: "power1.inOut" }, ">-0.04");
            }
            if (signal) {
              transactionTimeline.fromTo(signal, { autoAlpha: 0, left: "0%" }, { autoAlpha: 1, left: "100%", duration: 0.22, ease: "none" }, "<").to(signal, { autoAlpha: 0, duration: 0.06 });
            }
          });

          transactionTimeline.to(transactionNodes.at(-1) ?? [], {
            borderColor: "rgba(183, 215, 250, 0.78)",
            backgroundColor: "rgba(69, 102, 139, 0.22)",
            duration: 0.32,
          });
        }

        const verification = one("[data-df-verification]");
        if (verification) {
          gsap.timeline({
            defaults: { ease: "power2.out" },
            scrollTrigger: {
              trigger: verification,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          })
            .fromTo("[data-df-verification-title] span:first-child", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.38 })
            .fromTo("[data-df-verification-title] span:last-child", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.38 }, ">-0.16")
            .fromTo("[data-df-verification-copy]", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.32 }, ">-0.08")
            .fromTo("[data-df-verification-check]", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, stagger: 0.11, duration: 0.3 }, ">-0.04")
            .fromTo("[data-df-verification-check] .${styles.verificationMark}", { autoAlpha: 0, scale: 0.55 }, { autoAlpha: 1, scale: 1, stagger: 0.11, duration: 0.22 }, "<+0.1")
            .fromTo("[data-df-verification-pending]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, ">-0.02");
        }

        ScrollTrigger.refresh();

        return () => {
          delete root.dataset.dfMotion;
        };
      });
    }, root);

    return () => {
      media.revert();
      context.revert();
      delete root.dataset.dfMotion;
    };
  }, []);

  return <div ref={rootRef} className={styles.motionRoot}>{children}</div>;
}
