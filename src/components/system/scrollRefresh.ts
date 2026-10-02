import { ScrollTrigger } from "gsap/ScrollTrigger";

// Motion branches mount together. Refresh after that batch, not once per story.
let refreshTimer: ReturnType<typeof setTimeout> | undefined;

export function scheduleScrollRefresh() {
  clearTimeout(refreshTimer);
  refreshTimer = setTimeout(() => {
    refreshTimer = undefined;
    if (document.visibilityState === "visible") ScrollTrigger.refresh();
  }, 120);
}
