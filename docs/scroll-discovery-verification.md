# Scroll discovery — implementation and verification

Implemented October 23, 2026. Local production preview: `http://127.0.0.1:3000/`.

## 1. Existing navigation cues

- `SiteHeader`: fixed Home / Work / About / Contact anchor navigation and a keyboard skip link; 44px link heights. There is no existing collapsible navigation menu or modal.
- `Hero`: CSS sticky stage with a normalized GSAP scroll timeline and an initial timed reveal. The old, persistent `SCROLL / ENTER SYSTEM` decoration was removed, including its CSS. Hero's domain metadata remains, with clearance reserved above discovery guidance.
- `ScrollMotion`: existing 2px global progress line, header scroll state, direct-anchor settlement and legacy `#lab` → `#about` routing.
- `Work`: six project narratives, scroll-driven handoffs, a fixed lower-center decorative project coordinate rail, and the Work → About exit. Discovery cannot appear here.
- `About`: chapter metadata, cinematic reading plates, complete editorial content, a Contact continuation link, and Read without motion / Return to motion controls. Discovery cannot appear here, including reader mode.
- `Contact`: sticky narrative, email and social controls, plus an editorial reduced-motion/short-window fallback. Discovery cannot appear here.
- `SmoothScroll`: the existing desktop fine-pointer Lenis instance uses GSAP's ticker and updates ScrollTrigger; mobile, coarse-pointer and reduced-motion visitors retain native scrolling. No settings changed.
- `ViewportProvider`: reused for viewport readiness, mobile wording and pointer capability. Existing media-query and visibility subscriptions remain intact; CSS handles live reduced-motion changes for this cue.

## 2. Component architecture

One `ScrollDiscovery` client component and one CSS Module, mounted once in the home page shell, outside section timelines and inside the existing viewport provider. Three DOM elements: wrapper, label, direction line; the arrow is a CSS pseudo-element.

The component owns a typed local state machine: `hidden`, `waiting`, `visible`, `dismissed`, `disabled`. State transitions update one DOM data attribute. A module-level Boolean remembers dismissal for the document lifetime, including component remounts; no storage or cookies are used. `dismissed` and `disabled` are terminal for that mount.

## 3. Exact appearance rules

The component must find `#home`, have no fragment or exactly `#home`, and be at `scrollY <= 12px`. It must not have been dismissed in this document, restored through document back/forward navigation, or received a persisted BFCache `pageshow`.

The document must be visible. Interactive focus, visible open dialogs, visible `aria-modal="true"` surfaces, expanded controls within navigation, and visible `[data-scroll-discovery-blocked]` surfaces suppress the cue. The explicit blocker attribute can be used by future overlays; current navigation has no menu. Overlay detection observes semantic attributes and child additions/removals, not animation styles. Blockers changing only CSS classes are outside that contract.

Geist Mono, uppercase, 0.14em letter spacing, `--muted` cool gray text, one 1px `--border` line and a small `--accent` arrow. Desktop text is 10px; compact text is 9px. The default location is lower-center, with 24–40px of viewport-dependent bottom clearance plus the device bottom safe-area inset. At widths of at least 768px and heights of at most 600px, it moves to the lower-right with right safe-area clearance.

## 4. Exact timing

Wait 2,800ms after viewport readiness and eligibility. Entrance: opacity 0 → 1 and translation 6px → 0 over 450ms. No repeating animation or line movement. Exit begins immediately on dismissal and fades over 160ms. Returning from a hidden tab, closing a blocker, or resizing starts a full fresh wait; ordinary provider updates and animation frames do not restart it.

## 5. Dismissal behavior

- Wheel/trackpad: cumulative absolute vertical delta of 4 units; Ctrl-wheel zoom is ignored.
- Native document scroll, including scrollbar navigation: 8px from the entry position.
- Single-touch movement: 10px vertically, or the native scroll threshold, whichever occurs first.
- Keyboard: arrows, Page Up/Down, Home/End and Space when outside interactive controls; Escape also dismisses. Modified browser shortcuts are ignored.
- Pointer interaction with, or focus entering, an interactive control dismisses conservatively.
- Hash or history navigation disables the cue. A later return to Hero does not re-arm it.

Dismissal sets in-memory suppression, clears the timer, aborts all cue listeners and disconnects its observer. Events are never cancelled and no scroll controller is introduced. The existing Lenis wheel cancellation remains unchanged.

## 6. Contextual reminder policy

None. Existing section timelines do not expose a shared, reliable transition-only holding state. Reconstructing one from their internals would risk treating About reading pauses as hesitation. Once dismissed, the instruction stays absent for this document.

## 7. Mobile behavior

Narrow viewports with coarse pointers receive `SWIPE UP TO EXPLORE`; other configurations receive `SCROLL TO EXPLORE`. Compact spacing, bounded width and safe-area offsets keep it clear of browser controls and Hero metadata. The cue is informational and cannot intercept touch gestures. Work's lower-center rail never competes with it because discovery is restricted to initial Hero entry.

## 8. Reduced motion

Guidance remains available after the same inactivity delay. CSS removes all translation changes and transitions immediately when `prefers-reduced-motion: reduce` is active, including changes made while visible. The arrow and line remain static.

## 9. Accessibility

The supplementary cue is `aria-hidden`, has no live region or tab stop, never steals focus, and uses `pointer-events: none`. Navigation, skip link and semantic content remain usable independently of it. Interactive focus dismisses guidance. No synthetic button or click affordance is added.

## 10. Performance impact

Three DOM nodes, no dependencies, no additional ScrollTrigger, no independent RAF and no React state updates on scroll. At most one timer is pending. Passive scroll/wheel/touch listeners use numeric thresholds and do no layout reads. Overlay/layout checks occur only at setup, timers or discrete lifecycle/DOM events. All listeners, timers and observer resources are removed on terminal dismissal or unmount.

## 11. Viewports and browser QA

Chrome production-preview screenshots and cue/text bounds checks cover 360×800, 390×844, 430×932, 768×1024, 1280×800, 1440×900 and 1728×1117. Screenshots were visually reviewed; no cue overlap, clipping or horizontal overflow was found after correcting Hero metadata clearance. Additional landscape orientation and reduced-motion captures exercise the compact placement and static cue.

The reusable browser harness is `scripts/scroll-discovery-qa.mjs`. It uses an installed Playwright runtime supplied through `PLAYWRIGHT_MODULE` and an optional `CHROME_PATH`; no app dependency was added. `PORTFOLIO_QA_URL` overrides the local URL; `PORTFOLIO_QA_FILTER` selects individual behavior cases while skipping the viewport matrix.

Results and screenshots are in `docs/qa/scroll-discovery/`. Lifecycle coverage includes initial delay, wheel/trackpad, reverse/rapid scrolling and nine seconds of no-repeat idle, keyboard, native document seeks, CDP touch gestures, all section anchors, refresh inside Work, hash and document history navigation, focus, simulated menu/dialog surfaces, tab visibility, BFCache restoration, live/cold reduced motion, orientation, safe-area arithmetic and About reader mode.

## 12. Validation

- `npx eslint src/`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build:webpack`: passed; static home route generated.
- `git diff --check`: passed.
- Browser QA: all seven requested viewports and 25 behavior cases passed, with zero page errors. Observed reveal delays were 2,799–2,801ms. Final results are recorded in `docs/qa/scroll-discovery/results.json`.

The initial sandboxed build could not resolve Google Fonts. The network-enabled build fetched the project's existing Geist families and passed. Next.js still reports its existing warning about a parent-directory `package-lock.json` outside this Git repository.

## 13. Files changed

- `src/components/system/ScrollDiscovery.tsx`: reusable cue and lifecycle/state handling.
- `src/components/system/ScrollDiscovery.module.css`: visual treatment, safe areas, compact placement and reduced motion.
- `src/app/page.tsx`: single shell mount.
- `src/sections/Hero.tsx`: remove the persistent duplicate cue.
- `src/sections/Hero.module.css`: remove old cue CSS and reserve metadata clearance.
- `scripts/scroll-discovery-qa.mjs`: browser regression harness.
- `docs/qa/scroll-discovery/`: screenshot and result evidence.
- `docs/scroll-discovery-verification.md`: audit and implementation report.

## 14. Remaining limitations

Validation uses desktop Chrome viewport/capability emulation, not physical iOS/Android devices or Safari/Firefox. Tab visibility and persisted BFCache signals are simulated; full document and hash back/forward travel are exercised separately. Scrollbar navigation is covered by native document seeks rather than physical scrollbar dragging. Hardware safe-area arithmetic is tested with an injected inset; no real browser chrome or device notch is emulated. No deployment was performed.
