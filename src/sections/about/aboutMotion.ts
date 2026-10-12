import gsap from "gsap";
import { plates } from "./aboutContent";
import { tracePoses } from "./AboutGeometry";

export function buildAboutTimeline(root: HTMLElement, syncState: (progress: number, active: boolean) => void) {
  const select = <T extends Element = HTMLElement>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
  const visualPlates = select<HTMLElement>("[data-about-plate]");
  const paths = select<SVGPathElement>("[data-about-path]");
  const accent = select("[data-about-path-accent]");
  const geometry = select("[data-about-geometry]");
  const inherited = select("[data-about-inherited]");
  const marks = select("[data-about-web-marks]");
  const shared = select("[data-about-shared]");
  const diagram = (name: string) => select(`[data-about-shared="${name}"]`);
  const stem = select("[data-about-question-stem]");
  const dot = select("[data-about-question-dot]");
  const stage = root.firstElementChild as HTMLElement;
  gsap.set(visualPlates, { autoAlpha: 0 });
  gsap.set(visualPlates[0], { autoAlpha: 1 });
  gsap.set([...shared, ...marks, ...stem, ...dot], { autoAlpha: 0 });
  gsap.set(accent, { strokeDasharray: 1, strokeDashoffset: 1 });

  const timeline = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: {
    id: "about-story", trigger: root, start: "top top",
    end: () => `+=${Math.max(1, root.offsetHeight - stage.offsetHeight)}`,
    scrub: true, invalidateOnRefresh: true,
    onUpdate: self => syncState(self.progress, self.isActive),
    onRefresh: self => syncState(self.progress, self.isActive),
  } });
  // Explicit normalized duration: the last statement holds to the sticky release.
  timeline.to({}, { duration: 1 }, 0);
  visualPlates.forEach((element, index) => {
    const plate = plates[index];
    const span = plate.end - plate.start;
    const entry = span * (plate.kind === "purpose" ? .22 : .18);
    const lines = selectWithin(element, "[data-about-line]");
    const title = element.querySelector("[data-about-title]");
    const supporting = selectWithin(element, "[data-about-title] ~ *, [data-about-archive], [class*='humanAside'], [class*='compressedProcess'], [class*='nextSystem']");
    if (index) {
      // Only supporting copy overlaps for 1% of a plate. The outgoing headline
      // is removed at the boundary; the incoming first line is already visible.
      timeline.set(element, { autoAlpha: 1 }, plate.start);
      timeline.fromTo(lines, { yPercent: 72 }, { yPercent: 0, duration: entry * .68, stagger: lines.length > 1 ? entry * .32 / (lines.length - 1) : 0, ease: "power2.out", immediateRender: false }, plate.start);
      if (supporting.length) timeline.fromTo(supporting, { y: 14, opacity: .55 }, { y: 0, opacity: 1, duration: entry, immediateRender: false }, plate.start);
    }
    if (index < visualPlates.length - 1) {
      const exit = span * (plate.kind === "human" ? .08 : .16);
      timeline.to(title, { y: -14, scale: .985, opacity: .64, transformOrigin: "left center", duration: exit }, plate.end - exit)
        .set(title, { autoAlpha: 0 }, plate.end);
      if (supporting.length) timeline.to(supporting, { opacity: 0, y: -8, duration: span * .035 }, plate.end - span * .025);
      timeline.set(element, { autoAlpha: 0 }, plate.end + span * .01);
    }
    if (plate.detail === "origin" || plate.detail === "learning") {
      timeline.fromTo(element.querySelector("[data-about-archive]"), { y: 24, scale: .97 }, { y: 0, scale: 1, duration: entry * 1.2, ease: "power2.out", immediateRender: false }, plate.start);
    }
  });

  const pose = (name: keyof typeof tracePoses, at: number, duration: number) => timeline.to(paths, { attr: { d: tracePoses[name] }, duration, ease: "power1.inOut" }, at);
  const show = (name: string, at: number, duration = .008) => timeline.to(diagram(name), { autoAlpha: 1, duration }, at);
  const hide = (name: string, at: number, duration = .008) => timeline.to(diagram(name), { autoAlpha: 0, duration }, at);
  // Work's central axis enters with the same alignment; its peripheral architecture
  // retracts toward it. Withdraw before the complete, permanent name resolves.
  timeline.to(inherited, { scaleX: 0, autoAlpha: 0, svgOrigin: "500 230", duration: .04 }, .012)
    .to(geometry, { autoAlpha: 0, duration: .014 }, .058);
  pose("baseline", .106, .026);
  timeline.to(geometry, { autoAlpha: 1, duration: .01 }, .12)
    .to(marks, { autoAlpha: .65, duration: .016 }, .128)
    .to(marks, { autoAlpha: 0, duration: .013 }, .158);
  // Evolution's path and labels stay mounted across its two reading plates.
  pose("evolution", .211, .018);
  show("path", .223);
  timeline.fromTo(accent, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .023, immediateRender: false }, .226);
  const learning = select("[data-about-step]");
  learning.forEach((item, i) => {
    timeline.fromTo(item, { color: "#95a6af", y: 8 }, { color: "#edf2f3", y: 0, duration: .006, immediateRender: false }, .224 + i * .0025);
    if (i < learning.length - 1) timeline.to(item, { color: "#b0c2cc", duration: .004 }, .230 + i * .0025);
  });
  hide("path", .281);
  timeline.to(accent, { strokeDashoffset: 1, duration: .012 }, .28);
  pose("baseline", .281, .016);
  pose("adaptive", .329, .024);
  // The three perception relationships gain a coordinated travelling emphasis.
  const relationships = selectWithin(visualPlates[8], "[data-about-line]");
  relationships.forEach((line, i) => {
    timeline.fromTo(line, { color: "#95a6af" }, { color: "#edf2f3", duration: .007, immediateRender: false }, .346 + i * .009);
  });
  // MODEL and PRODUCT move together as the intermediate responsibilities assemble.
  pose("layers", .388, .022);
  show("layers", .401);
  timeline.fromTo(select("[data-about-anchor='model']"), { y: -18 }, { y: 0, duration: .013, immediateRender: false }, .40)
    .fromTo(select("[data-about-anchor='product']"), { y: 18 }, { y: 0, duration: .013, immediateRender: false }, .40)
    .fromTo(select("[data-about-layer]"), { x: 14, opacity: .35 }, { x: 0, opacity: 1, duration: .004, stagger: .002, immediateRender: false }, .402)
    .to(accent, { strokeDashoffset: 0, duration: .016 }, .40);
  hide("layers", .468);
  timeline.to(accent, { strokeDashoffset: 1, duration: .01 }, .466);
  pose("workflow", .468, .022);
  show("process", .489);
  const workflow = select("[data-about-workflow]");
  workflow.forEach((item, i) => {
    timeline.fromTo(item, { color: "#95a6af", y: 9 }, { color: i === 3 ? "#b8d9ed" : "#edf2f3", y: 0, duration: i === 3 ? .005 : .003, immediateRender: false }, .488 + i * .0015);
  });
  timeline.fromTo(select("[data-about-build-note]"), { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: .006, immediateRender: false }, .497)
    .to(accent, { strokeDashoffset: 0, duration: .021 }, .484);
  // The global-fragility conclusion removes visual competition, retaining a
  // quiet workflow until it physically compresses into the next lifecycle.
  timeline.to(diagram("process"), { opacity: .38, duration: .008 }, .558)
    .to(diagram("process"), { scaleX: .6, autoAlpha: 0, transformOrigin: "center top", duration: .025 }, .587);
  pose("compressed", .587, .027);
  timeline.fromTo(diagram("compressed"), { autoAlpha: 0, scaleX: 1.25 }, { autoAlpha: 1, scaleX: 1, duration: .015, immediateRender: false }, .608);
  hide("compressed", .651);
  pose("baseline", .651, .022);
  show("temporal", .671);
  timeline.to(accent, { strokeDashoffset: 1, duration: .008 }, .652)
    .to(accent, { strokeDashoffset: 0, duration: .014 }, .669);
  // Nothing technical survives M09, including the baseline and decorative HUD.
  hide("temporal", .724, .014);
  timeline.to(paths, { scaleX: 0, transformOrigin: "right center", duration: .018 }, .72)
    .to(geometry, { autoAlpha: 0, duration: .008 }, .73)
    .to([...stem, ...dot], { autoAlpha: 1, duration: .007 }, .976)
    .to(stem, { autoAlpha: 0, y: -6, duration: .01 }, .989);
  return timeline;
}

function selectWithin(element: Element, selector: string) {
  return Array.from(element.querySelectorAll<HTMLElement>(selector));
}

// One observer for natural editorial flow; no mobile pins, RAF, parallax,
// per-scroll rendering, or hidden essential information. CSS handles a small
// visibility entrance. Disconnect/revert also covers live motion-policy changes.
export function observeAboutEditorial(root: HTMLElement) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      (entry.target as HTMLElement).dataset.aboutSeen = "true";
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  const readings = Array.from(root.querySelectorAll<HTMLElement>("[data-about-reading]"));
  readings.forEach(reading => observer.observe(reading));
  return () => { observer.disconnect(); readings.forEach(reading => { delete reading.dataset.aboutSeen; }); };
}
