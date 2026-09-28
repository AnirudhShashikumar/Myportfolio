"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import { useViewport } from "@/components/system/ViewportProvider";
import styles from "./WorkNavigation.module.css";

type Project = {
  number: string;
  name: string;
};

type ProjectTheme =
  | "satquery"
  | "gesture"
  | "algaeos"
  | "dayflow"
  | "meditwin"
  | "medifit";

type ProjectHandoffProps = {
  index: number;
  from: Project;
  to: Project;
  fromTheme: ProjectTheme;
  toTheme: ProjectTheme;
  sourceLine: string;
  targetLine: string;
  transitionLabel: string;
  restrained?: boolean;
};

function ProjectGeometry({ theme }: { theme: ProjectTheme }) {
  if (theme === "satquery") {
    return (
      <svg viewBox="0 0 760 520" role="presentation">
        <g className={styles.globeGrid}>
          <circle cx="390" cy="248" r="154" />
          <ellipse cx="390" cy="248" rx="154" ry="58" />
          <ellipse cx="390" cy="248" rx="68" ry="154" />
          <path d="M236 248h308M260 170h260M260 326h260" />
        </g>
        <path className={styles.signalPath} d="M64 410C174 338 245 370 322 278S497 132 690 104" />
        <path className={styles.orbitPath} d="M170 116C306 22 576 64 642 242S512 452 286 420" />
        <g className={styles.geometryNodes}>
          <circle cx="64" cy="410" r="5" /><circle cx="322" cy="278" r="5" />
          <circle cx="690" cy="104" r="5" /><circle cx="574" cy="164" r="4" />
        </g>
      </svg>
    );
  }

  if (theme === "gesture") {
    return (
      <svg viewBox="0 0 760 520" role="presentation">
        <g className={styles.landmarkTrace}>
          <polyline points="76,402 118,324 153,350 194,266 226,306 274,205 305,260 350,142" />
          <polyline points="118,324 194,266 274,205 350,142" />
          <polyline points="153,350 226,306 305,260" />
        </g>
        <g className={styles.geometryNodes}>
          {[[76,402],[118,324],[153,350],[194,266],[226,306],[274,205],[305,260],[350,142]].map(([cx, cy]) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" />
          ))}
        </g>
        <g className={styles.spatialSphere}>
          <circle cx="544" cy="256" r="116" />
          <ellipse cx="544" cy="256" rx="116" ry="40" />
          <ellipse cx="544" cy="256" rx="42" ry="116" />
          <path d="M428 256h232" />
        </g>
        <path className={styles.signalPath} d="M344 146C405 158 421 210 452 238" />
      </svg>
    );
  }

  if (theme === "algaeos") {
    return (
      <svg viewBox="0 0 760 520" role="presentation">
        <g className={styles.reactors}>
          <path d="M116 142v238c0 38 172 38 172 0V142" />
          <ellipse cx="202" cy="142" rx="86" ry="24" />
          <ellipse cx="202" cy="380" rx="86" ry="24" />
          <path d="M358 142v238c0 38 172 38 172 0V142" />
          <ellipse cx="444" cy="142" rx="86" ry="24" />
          <ellipse cx="444" cy="380" rx="86" ry="24" />
          <path d="M288 194h70" />
        </g>
        <path className={styles.signalPath} d="M82 438h108l32-56 48 26 48-112 48 38 42-86 52 28 54-84 66 34 72-98" />
        <g className={styles.geometryNodes}>
          <circle cx="222" cy="382" r="5" /><circle cx="318" cy="296" r="5" />
          <circle cx="460" cy="276" r="5" /><circle cx="652" cy="128" r="5" />
        </g>
      </svg>
    );
  }

  if (theme === "dayflow") {
    return (
      <svg viewBox="0 0 760 520" role="presentation">
        <g className={styles.systemFrames}>
          <rect x="92" y="112" width="230" height="128" rx="4" />
          <rect x="438" y="112" width="230" height="128" rx="4" />
          <rect x="264" y="324" width="230" height="108" rx="4" />
          <path d="M207 240v42h172v42M553 240v42H379" />
          <path d="M118 146h96M118 172h158M118 198h124" />
          <path d="M464 146h96M464 172h158M464 198h124" />
        </g>
        <g className={styles.geometryNodes}>
          <circle cx="207" cy="282" r="5" /><circle cx="553" cy="282" r="5" />
          <circle cx="379" cy="324" r="5" />
        </g>
        <path className={styles.signalPath} d="M92 464h576" />
      </svg>
    );
  }

  if (theme === "meditwin") {
    return (
      <svg viewBox="0 0 760 520" role="presentation">
        <g className={styles.twinRings}>
          <ellipse cx="380" cy="258" rx="174" ry="206" />
          <ellipse cx="380" cy="258" rx="126" ry="158" />
          <ellipse cx="380" cy="258" rx="78" ry="108" />
          <circle cx="380" cy="218" r="24" />
          <path d="M326 356c7-78 20-112 54-112s47 34 54 112M348 356l-9 70M412 356l9 70" />
        </g>
        <path className={styles.signalPath} d="M58 142h134l66 74M702 142H568l-66 74M58 386h134l66-74M702 386H568l-66-74" />
        <g className={styles.geometryNodes}>
          <circle cx="58" cy="142" r="5" /><circle cx="702" cy="142" r="5" />
          <circle cx="58" cy="386" r="5" /><circle cx="702" cy="386" r="5" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 760 520" role="presentation">
      <g className={styles.twinRings}>
        <ellipse cx="286" cy="258" rx="122" ry="174" />
        <ellipse cx="286" cy="258" rx="82" ry="126" />
        <circle cx="286" cy="220" r="20" />
        <path d="M242 342c7-65 17-94 44-94s37 29 44 94M260 342l-7 58M312 342l7 58" />
      </g>
      <g className={styles.contextFrames}>
        <rect x="54" y="104" width="122" height="48" rx="3" />
        <rect x="54" y="368" width="122" height="48" rx="3" />
        <rect x="394" y="118" width="132" height="48" rx="3" />
        <rect x="394" y="354" width="132" height="48" rx="3" />
        <rect x="566" y="206" width="142" height="104" rx="3" />
        <path d="M176 128l46 60M176 392l46-60M394 142l-50 56M394 378l-50-56M408 258h158" />
        <path d="M592 238h88M592 258h66M592 278h76" />
      </g>
      <g className={styles.geometryNodes}>
        <circle cx="222" cy="188" r="5" /><circle cx="222" cy="332" r="5" />
        <circle cx="408" cy="258" r="5" /><circle cx="566" cy="258" r="5" />
      </g>
    </svg>
  );
}

export default function ProjectHandoff({
  index,
  from,
  to,
  fromTheme,
  toTheme,
  sourceLine,
  targetLine,
  transitionLabel,
  restrained = false,
}: ProjectHandoffProps) {
  const sequenceRef = useRef<HTMLDivElement>(null);
  const { width, isMobile, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    const root = sequenceRef.current;
    if (!root || !ready || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motion = "active";

    const outgoing = root.querySelector<HTMLElement>("[data-handoff-outgoing]");
    const incoming = root.querySelector<HTMLElement>("[data-handoff-incoming]");
    const outgoingCopy = root.querySelector<HTMLElement>("[data-handoff-outgoing-copy]");
    const incomingCopy = root.querySelector<HTMLElement>("[data-handoff-incoming-copy]");
    const outgoingGeometry = root.querySelector<HTMLElement>("[data-handoff-outgoing-geometry]");
    const incomingGeometry = root.querySelector<HTMLElement>("[data-handoff-incoming-geometry]");
    const field = root.querySelector<HTMLElement>("[data-handoff-field]");
    const foreground = root.querySelector<HTMLElement>("[data-handoff-foreground]");
    const midpoint = root.querySelector<HTMLElement>("[data-handoff-midpoint]");

    if (!outgoing || !incoming || !midpoint) return;

    const distance = restrained ? (isMobile ? 82 : 90) : (isMobile ? 90 : 100);
    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo(
          outgoing,
          { xPercent: 0, opacity: 1 },
          { xPercent: -distance, opacity: restrained ? 0.2 : 0.1, duration: 0.84, ease: "power1.inOut" },
          0,
        )
        .fromTo(
          incoming,
          { xPercent: distance * 0.92, opacity: 0.3 },
          { xPercent: 0, opacity: 1, duration: 0.84, ease: "power1.inOut" },
          0,
        )
        .fromTo(outgoingCopy, { xPercent: 0 }, { xPercent: restrained ? -8 : -16, duration: 0.78, ease: "power1.inOut" }, 0)
        .fromTo(incomingCopy, { xPercent: restrained ? 8 : 16 }, { xPercent: 0, duration: 0.78, ease: "power1.inOut" }, 0.05)
        .fromTo(outgoingGeometry, { xPercent: 0 }, { xPercent: restrained ? -4 : -9, duration: 0.84, ease: "power1.inOut" }, 0)
        .fromTo(incomingGeometry, { xPercent: restrained ? 4 : 9 }, { xPercent: 0, duration: 0.84, ease: "power1.inOut" }, 0)
        .fromTo(field, { xPercent: 3 }, { xPercent: -8, duration: 1 }, 0)
        .fromTo(foreground, { xPercent: 10 }, { xPercent: -120, duration: 1, ease: "power1.inOut" }, 0)
        .fromTo(midpoint, { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.14, ease: "power1.out" }, 0.36)
        .to(midpoint, { autoAlpha: 0, scale: 1.025, duration: 0.16, ease: "power1.in" }, 0.56)
        .to({}, { duration: 0.16 }, 0.84);
    }, root);

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      context.revert();
      delete root.dataset.motion;
    };
  }, [isMobile, prefersReducedMotion, ready, restrained]);

  return (
    <div
      ref={sequenceRef}
      className={`${styles.handoff} ${restrained ? styles.restrained : ""}`}
      data-work-handoff={index}
      aria-hidden="true"
    >
      <div className={styles.handoffStage}>
        <div className={styles.archiveField} data-handoff-field>
          <span /><span /><span /><span /><span /><span />
        </div>

        <div className={`${styles.world} ${styles.outgoing}`} data-project-theme={fromTheme} data-handoff-outgoing>
          <div className={styles.worldCopy} data-handoff-outgoing-copy>
            <p className={styles.coordinate}>{from.number} / 06 · PROJECT END</p>
            <p className={styles.worldTitle}>{from.name}</p>
            <p className={styles.worldLine}>{sourceLine}</p>
            <p className={styles.nextSignal}>NEXT SYSTEM · {to.number} / {to.name} <span>→</span></p>
          </div>
          <div className={styles.worldGeometry} data-handoff-outgoing-geometry>
            <ProjectGeometry theme={fromTheme} />
          </div>
        </div>

        <div className={`${styles.world} ${styles.incoming}`} data-project-theme={toTheme} data-handoff-incoming>
          <div className={styles.worldCopy} data-handoff-incoming-copy>
            <p className={styles.coordinate}>{to.number} / 06 · PROJECT ARRIVAL</p>
            <p className={styles.worldTitle}>{to.name}</p>
            <p className={styles.worldLine}>{targetLine}</p>
            <p className={styles.arrivalSignal}>HORIZONTAL VELOCITY / 00</p>
          </div>
          <div className={styles.worldGeometry} data-handoff-incoming-geometry>
            <ProjectGeometry theme={toTheme} />
          </div>
        </div>

        <div className={styles.midpoint} data-handoff-midpoint>
          <span>SYSTEM</span>
          <strong>{from.number}</strong>
          <i />
          <strong>{to.number}</strong>
          <small>{transitionLabel}</small>
        </div>

        <div className={styles.foregroundRail} data-handoff-foreground>
          <span>{from.number}</span><i /><span>{to.number}</span>
        </div>
      </div>

      <div className={styles.editorialDivider}>
        <span>{from.number}</span>
        <i />
        <p>NEXT SYSTEM<br /><strong>{to.number} / {to.name}</strong></p>
      </div>
    </div>
  );
}

export function WorkCoordinate({ projects }: { projects: readonly Project[] }) {
  const coordinateRef = useRef<HTMLDivElement>(null);
  const { width, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    const coordinate = coordinateRef.current;
    const work = coordinate?.closest<HTMLElement>("#work");
    if (!coordinate || !work || !ready || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const handoffs = Array.from(work.querySelectorAll<HTMLElement>("[data-work-handoff]"));
    const nodes = Array.from(coordinate.querySelectorAll<HTMLElement>("[data-work-coordinate-node]"));
    const activeLabel = coordinate.querySelector<HTMLElement>("[data-work-active-label]");
    const rail = coordinate.querySelector<HTMLElement>(`.${styles.coordinateRail}`);
    let ranges: Array<{ start: number; end: number }> = [];
    let railSegment = 0;
    let currentIndex = -1;

    const measure = () => {
      const viewportHeight = window.innerHeight;
      ranges = handoffs.map((handoff) => {
        const start = handoff.getBoundingClientRect().top + window.scrollY;
        return { start, end: Math.max(start + 1, start + handoff.offsetHeight - viewportHeight) };
      });
      railSegment = (rail?.clientWidth ?? 0) / Math.max(1, projects.length - 1);
    };

    const update = (scroll: number) => {
      let value = 0;

      ranges.forEach((range, index) => {
        if (scroll >= range.end) {
          value = index + 1;
        } else if (scroll >= range.start) {
          value = index + gsap.utils.clamp(0, 1, (scroll - range.start) / (range.end - range.start));
        }
      });

      coordinate.style.setProperty("--work-coordinate", value.toFixed(4));
      coordinate.style.setProperty("--work-coordinate-x", `${(value * railSegment).toFixed(2)}px`);
      const nextIndex = gsap.utils.clamp(0, projects.length - 1, Math.round(value));

      nodes.forEach((node, index) => {
        const proximity = Math.max(0, 1 - Math.abs(value - index));
        node.style.setProperty("--node-strength", proximity.toFixed(3));
        node.toggleAttribute("data-current", index === nextIndex);
      });

      if (nextIndex !== currentIndex && activeLabel) {
        currentIndex = nextIndex;
        activeLabel.textContent = `${projects[nextIndex].number} / ${projects[nextIndex].name}`;
      }
    };

    const context = gsap.context(() => {
      const trigger = ScrollTrigger.create({
        trigger: work,
        start: "top top",
        end: "bottom bottom",
        invalidateOnRefresh: true,
        onRefresh: (self) => {
          measure();
          update(self.scroll());
        },
        onUpdate: (self) => update(self.scroll()),
        onEnter: () => gsap.set(coordinate, { autoAlpha: 1 }),
        onEnterBack: () => gsap.set(coordinate, { autoAlpha: 1 }),
        onLeave: () => gsap.set(coordinate, { autoAlpha: 0 }),
        onLeaveBack: () => gsap.set(coordinate, { autoAlpha: 0 }),
      });

      measure();
      update(window.scrollY);
      gsap.set(coordinate, { autoAlpha: trigger.isActive ? 1 : 0 });
    }, work);

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      context.revert();
    };
  }, [prefersReducedMotion, projects, ready]);

  return (
    <div ref={coordinateRef} className={styles.workCoordinate} aria-hidden="true">
      <div className={styles.coordinateIdentity}>
        <span>WORK</span>
        <strong data-work-active-label>01 / SATQUERY AI</strong>
      </div>
      <div className={styles.coordinateRail}>
        <span className={styles.coordinateTrack} />
        <span className={styles.coordinateTraveler} />
        {projects.map((project) => (
          <span key={project.number} className={styles.coordinateNode} data-work-coordinate-node>
            {project.number}
          </span>
        ))}
      </div>
    </div>
  );
}

export function WorkExit() {
  const exitRef = useRef<HTMLDivElement>(null);
  const { width, prefersReducedMotion } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    const root = exitRef.current;
    if (!root || !ready || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    root.dataset.motion = "active";
    const horizontal = root.querySelector<HTMLElement>("[data-exit-horizontal]");
    const vertical = root.querySelector<HTMLElement>("[data-exit-vertical]");
    const peripheral = root.querySelectorAll<HTMLElement>("[data-exit-peripheral]");

    const context = gsap.context(() => {
      gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 85%",
          end: "bottom 55%",
          scrub: true,
          invalidateOnRefresh: true,
        },
      })
        .fromTo(horizontal, { scaleX: 1 }, { scaleX: 0.025, ease: "power1.inOut", duration: 1 }, 0)
        .fromTo(peripheral, { autoAlpha: 1 }, { autoAlpha: 0, ease: "none", duration: 0.48 }, 0.14)
        .fromTo(vertical, { scaleY: 0 }, { scaleY: 1, ease: "power1.inOut", duration: 0.58 }, 0.42);
    }, root);

    return () => {
      context.revert();
      delete root.dataset.motion;
    };
  }, [prefersReducedMotion, ready]);

  return (
    <div ref={exitRef} className={styles.workExit} aria-hidden="true">
      <span className={styles.exitLabel} data-exit-peripheral>06 / 06</span>
      <span className={styles.exitAxis} data-exit-horizontal />
      <span className={styles.exitLabel} data-exit-peripheral>WORK ARCHIVE / COMPLETE</span>
      <span className={styles.exitVertical} data-exit-vertical />
      <strong>RETURN TO VERTICAL</strong>
      <small>NEXT / LAB</small>
    </div>
  );
}
