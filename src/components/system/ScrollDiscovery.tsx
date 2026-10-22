"use client";

import { useEffect, useRef } from "react";
import { useViewport } from "./ViewportProvider";
import styles from "./ScrollDiscovery.module.css";

type DiscoveryState = "hidden" | "waiting" | "visible" | "dismissed" | "disabled";

const REVEAL_DELAY = 2800;
const TOP_TOLERANCE = 12;
const CONTROL = 'a[href], button, input, textarea, select, summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [role="slider"], [role="textbox"], [tabindex]:not([tabindex="-1"])';
const BLOCKER = 'dialog[open], [aria-modal="true"], nav [aria-expanded="true"], [data-scroll-discovery-blocked]';
const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);

// Document-lifetime memory only. Remounts must not repeat an understood cue.
let discoveryDismissed = false;

export default function ScrollDiscovery() {
  const cue = useRef<HTMLDivElement>(null);
  const { width, isMobile, hasFinePointer } = useViewport();
  const ready = width > 0;

  useEffect(() => {
    const element = cue.current;
    if (!element || !ready) return;

    let state: DiscoveryState = "hidden";
    let timer: ReturnType<typeof setTimeout> | undefined;
    let touchY: number | undefined;
    let wheelDistance = 0;
    const entryY = window.scrollY;
    const events = new AbortController();
    const passive = { passive: true, signal: events.signal };

    function transition(next: DiscoveryState) {
      if (state === next) return;
      state = next;
      element!.dataset.state = next;
    }

    function clearTimer() {
      clearTimeout(timer);
      timer = undefined;
    }

    function stop() {
      clearTimer();
      events.abort();
      observer.disconnect();
    }

    function finish(next: "dismissed" | "disabled") {
      if (next === "dismissed") discoveryDismissed = true;
      transition(next);
      stop();
    }

    function isHeroEntry() {
      return document.getElementById("home") !== null &&
        (!window.location.hash || window.location.hash === "#home") &&
        window.scrollY <= TOP_TOLERANCE;
    }

    function isBlocked() {
      if (document.visibilityState !== "visible" ||
        document.activeElement?.closest(CONTROL)) return true;
      return Array.from(document.querySelectorAll<HTMLElement>(BLOCKER)).some(
        (surface) => surface.getClientRects().length > 0 &&
          getComputedStyle(surface).visibility !== "hidden",
      );
    }

    function reconcile() {
      if (state === "dismissed" || state === "disabled") return;
      if (!isHeroEntry()) {
        finish("disabled");
      } else if (isBlocked()) {
        clearTimer();
        transition("hidden");
      } else if (timer === undefined && state !== "visible") {
        transition("waiting");
        timer = setTimeout(() => {
          timer = undefined;
          // Recheck after scroll restoration, anchor settlement or tab suspension.
          if (!isHeroEntry()) finish("disabled");
          else if (isBlocked()) transition("hidden");
          else transition("visible");
        }, REVEAL_DELAY);
      }
    }

    function onScroll() {
      // No measurements or React updates on the scroll path. Detach on discovery.
      if (Math.abs(window.scrollY - entryY) >= 8) finish("dismissed");
    }

    function onWheel(event: WheelEvent) {
      if (event.ctrlKey) return; // Trackpad pinch/zoom is not scroll discovery.
      wheelDistance += Math.abs(event.deltaY);
      if (wheelDistance >= 4) finish("dismissed");
    }

    function onTouchStart(event: TouchEvent) {
      touchY = event.touches.length === 1 ? event.touches[0].clientY : undefined;
    }

    function onTouchMove(event: TouchEvent) {
      if (touchY !== undefined && event.touches.length === 1 &&
        Math.abs(event.touches[0].clientY - touchY) >= 10) finish("dismissed");
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey) return;
      if (SCROLL_KEYS.has(event.key) && !(event.target instanceof Element &&
        event.target.closest(CONTROL))) finish("dismissed");
      else if (event.key === "Escape") finish("dismissed");
    }

    function onControlInteraction(event: Event) {
      if (event.target instanceof Element && event.target.closest(CONTROL)) finish("dismissed");
    }

    function onResize() {
      clearTimer();
      transition("hidden");
      reconcile();
    }

    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) finish("disabled");
      else reconcile();
    }

    const onNavigation = () => finish("disabled");
    // Only observe overlay semantics, never GSAP's per-frame style mutations.
    const observer = new MutationObserver(reconcile);

    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (discoveryDismissed || !isHeroEntry() || navigation?.type === "back_forward") {
      transition("disabled");
      return;
    }

    window.addEventListener("scroll", onScroll, passive);
    window.addEventListener("wheel", onWheel, passive);
    window.addEventListener("touchstart", onTouchStart, passive);
    window.addEventListener("touchmove", onTouchMove, passive);
    window.addEventListener("keydown", onKeyDown, { signal: events.signal });
    document.addEventListener("pointerdown", onControlInteraction, { signal: events.signal });
    document.addEventListener("focusin", onControlInteraction, { signal: events.signal });
    document.addEventListener("visibilitychange", reconcile, { signal: events.signal });
    window.addEventListener("resize", onResize, passive);
    window.addEventListener("hashchange", onNavigation, { signal: events.signal });
    window.addEventListener("popstate", onNavigation, { signal: events.signal });
    window.addEventListener("pageshow", onPageShow, { signal: events.signal });
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open", "hidden", "aria-modal", "aria-expanded", "data-scroll-discovery-blocked"],
    });
    reconcile();

    return stop;
  }, [ready]);

  return (
    <div ref={cue} className={styles.discovery} data-scroll-discovery data-state="hidden" aria-hidden="true">
      <span>{isMobile && !hasFinePointer ? "SWIPE UP TO EXPLORE" : "SCROLL TO EXPLORE"}</span>
      <span className={styles.direction} />
    </div>
  );
}
