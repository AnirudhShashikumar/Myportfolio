# Production motion hardening

## Audit before optimization

The starting checkout was clean. Production webpack build passed before changes.

| System | Ownership / scheduling | Baseline findings |
| --- | --- | --- |
| Global | Lenis advances on GSAP ticker; Lenis scroll calls ScrollTrigger.update. Native scroll owns page Y. | One Lenis RAF, but default smoothing stacks with numeric scrub. Lenis instantiated on touch as well. |
| Viewport | One resize listener writes context width/height; motion media query listener. | About/Contact effects depend on every width value and rebuild on resizing. No fine-pointer or document-visibility policy. |
| Hero | One elapsed-time introduction and one normalized scroll timeline; CSS sticky stage in 500svh section. Shared pointer ref. | Pointer measures stage on every move. IntersectionObserver watches tall section, so WebGL remains active after sticky stage is leaving. |
| IntelligenceScene | R3F useFrame; precomputed geometry; 13 small draw groups, no lights/postprocessing. DPR capped 1.5/1. | No object allocations in useFrame. Demand when Hero inactive/reduced motion. Damped scroll transforms can trail scroll. WebGL probe creates an extra context. |
| HeroKineticGrid | Canvas 2D own wake-on-demand RAF, springs; DPR 1/1.25/1.5. | Stops when settled/offscreen; mobile physics disabled. Draw projects nodes repeatedly and allocates objects/candidate arrays. Both resize observer and window resize. |
| SatQuery | One scrub 0.55 timeline, 200svh CSS sticky stage. | Numeric catch-up delay. Product figure has no interactive descendants; live CTA is outside it. 74 descendants at 1440x900. |
| Gesture Globe | One scrub 0.45 timeline, CSS sticky. Static SVG landmarks and optimized Next images. | Numeric delay; 330 descendants, most SVG landmarks. No continuous RAF. |
| AlgaeOS | Local flow/telemetry/image/reveal ScrollTriggers, one-shot sensor/statement. | 0.4–0.6 scrub delays, decorative clip-path reveal; no continuous loop. |
| Dayflow | Desktop >=901px matchMedia; several play/reverse section timelines. | Long time-based sequences keep running after fast scroll; routing tail delays completion. |
| MediTwin | Desktop >=901px matchMedia; several play/reverse timelines. | Long sequential entry/story, repeated left-position signals, large image masks; permanent will-change. |
| MediFit | Desktop >=901px matchMedia; several play/reverse timelines. | Long sequential story/results; top/left-position signals, large masks; permanent will-change. |
| Five handoffs | One direct-scrub timeline per boundary; outgoing/incoming own X, nested copy/geometry own local X. CSS sticky, not GSAP pin. | Correct deterministic mapping. Two decorative worlds, full SVG blur, fixed rail backdrop blur, permanently promoted layers on all five boundaries. No project animation inside handoff itself. |
| Work coordinate | One ScrollTrigger. Measures boundary ranges on refresh; styles six nodes each update. | Correct cached layout reads, but repeats unchanged style/attribute writes through long project sections. |
| Lab | One reveal; global section field and boundary scrub. | Simple DOM; no RAF/pointer/Canvas. |
| About | One normalized scrub 0.25/0.55; CSS sticky, static SVG, masked certificates. | No continuous RAF, proper context cleanup. Width changes rebuild timeline; stacking smoothers. Reduced-motion editorial DOM. |
| Contact | One normalized scrub 0.25/0.5; CSS sticky, masked signal SVG and large type. | Every mouse event reads layout and updates mask vars. Width changes rebuild. Existing autoAlpha/visibility protects hidden actions from keyboard focus. Reduced-motion editorial DOM. |
| Footer | Static semantic content and anchor. | No animation loop; back-to-top touch target small. |
| Global ScrollMotion | Progress trigger, parallax/decorative field/boundary triggers, header scroll listener, main ResizeObserver. | Individual feature refreshes + main observer + anchor timers can cause refresh bursts. Header attribute rewritten each scroll. |

All project facts, order, typography, and narrative are preserved. No content-visibility will be applied to measured sticky regions.

## Profiling method

Local production build, identical iframe viewport and synthetic wheel replay for all five boundaries. The local-only harness records requestAnimationFrame intervals, PerformanceObserver long tasks where supported, active GSAP project timelines, trigger count, and Hero draw calls. These are environment-specific browser observations, not physical-device FPS guarantees. Responsive/browser QA and final results are appended after implementation.

## Final engineering report — 2026-10-02

### 1. Performance audit findings

The most concrete Work problem was elapsed-time playback surviving fast navigation: at the last handoff, Dayflow, MediTwin, and MediFit timelines were simultaneously playing. Several important scrubs also added 0.4–0.6 seconds of catch-up on top of Lenis interpolation. This explains delayed visual resolution even without dropped frames.

Other source-confirmed costs were permanent layer-promotion hints, decorative handoff SVG/filter surfaces, repeated unchanged coordinate-rail writes, independent refresh scheduling, pointer-event layout reads, and redundant Canvas projection/allocation work. About and Contact rebuilt effects on every viewport-width change. The Hero observer covered its entire tall scroll region rather than its visible sticky stage.

No nested GSAP pinning, competing project/handoff transform owners, per-frame React state, project Canvas loops, or continuously animated Gesture Globe SVG were found. The five handoffs were already direct-scrubbed. These stable systems were preserved. The measured boundary replay had no long tasks or >33ms intervals even before changes; this was primarily a lifecycle/input-lag problem in the available environment, not a demonstrated GSAP throughput failure.

### 2. Root causes

Time-based `play/reverse` stories continued running after their trigger region was skipped. Numeric scrub plus Lenis smoothing created two different settling mechanisms. Large DOM/filter surfaces and permanent promotions increased potential paint/GPU cost, but GPU-memory pressure was not directly measurable here. Repeated refresh requests and pixel-width dependencies introduced unnecessary geometry work during resize. Pointer handlers interleaved geometry reads with mask/pointer updates.

### 3. Work optimizations

| Project | Change | Preserved |
| --- | --- | --- |
| SatQuery AI | Direct scrub; actual sticky-stage end measurement; linear story on phone/coarse/short/reduced branches. | Observation → analysis → evidence sequence, product imagery, live link. |
| Gesture Globe | Direct scrub and same capability policy. No speculative SVG rewrite. | Hand-landmark/sphere composition, screenshots, story and CTA. |
| AlgaeOS | Direct scrub for flow, telemetry, reveals, sensor pulses and statement; removed one decorative clip-path reveal. | Reactor/telemetry narrative, system infographic and detail anchor. |
| Dayflow | Existing sequence timings mapped to scroll rather than queued playback; role signal uses transform instead of left-position animation. | Employee/HR story, verification evidence and live app. |
| MediTwin | Scroll-authoritative local timelines; transform-based signals; removed permanent promotions. | Formation/concept narrative, first-place/team evidence and detail anchor. |
| MediFit | Scroll-authoritative local timelines; transform-based signals; removed permanent promotions. | Personalization/contribution/results narrative, evidence and live app. |

All five boundaries retain their X-owning outgoing/incoming wrappers and opacity mapping; projects retain local storytelling ownership. Promotions now apply only to the two active handoff worlds. Coarse/phone input removes nested copy/geometry/field parallax and reduces foreground movement; it does not remove the horizontal handoff. Rail writes skip unchanged values and use the actual ScrollTrigger ranges, avoiding rounding disagreement at the midpoint.

The five tested boundaries are SatQuery → Gesture Globe, Gesture Globe → AlgaeOS, AlgaeOS → Dayflow, Dayflow → MediTwin, and MediTwin → MediFit. Outgoing final, 25%, 50%, 75%, incoming arrival, reverse to 50%, reverse to 0%, and forward to 100% were sampled independently for each. Final desktop and phone sweeps each returned 40 samples with no blank-world, overflow, or scrub-state failures. Visual inspection included all five desktop midpoint compositions. Handoffs contain decorative project worlds, not duplicate interactive project experiences.

### 4. GSAP / ScrollTrigger changes

Important spatial timelines now use `scrub: true`. Local reveal sequences preserve their composition but advance/rewind with scroll; Lab reveals follow the same policy. Hero intro remains an intentional elapsed-time introduction, but input finishes it immediately without repeatedly creating seek tweens.

Feature refresh requests share one trailing 120ms scheduler. Main ResizeObserver refreshes only when dimensions actually change; fonts and visibility recovery request coalesced refreshes. Direct hashes settle using the target's scroll margin and stop settling when the user supplies input. Three delayed anchor refresh timers were removed. Sticky ends use the measured stage height. `ignoreMobileResize` addresses vertical browser-chrome resize churn; full width/orientation layout changes still refresh through the observer and capability branches.

Contexts/matchMedia are reverted, listeners/observers removed, and scheduled per-component RAFs cancelled during cleanup. Desktop trigger count remained 45 after repeated breakpoint/capability changes; phone/coarse had 12 and reduced motion had 0. Counts are not evidence of a heap/leak benchmark. There is no GSAP `pin`, so pinSpacing/anticipatePin changes were unnecessary.

### 5. Lenis changes

One GSAP ticker remains authoritative; `autoRaf: false` avoids a second loop. Fine-pointer desktop uses lerp 0.18 rather than the default 0.1, with direct GSAP scrubs. Phone, coarse-input and reduced-motion branches use native scrolling. `syncTouch: false`; no new touchmove/wheel prevention hacks. Hidden-document ticks do not advance Lenis. Cleanup removes the ticker subscription and destroys the instance.

### 6. Three.js changes

Hero visibility follows the sticky stage, intersected with document visibility. Existing simplified geometry, DPR caps, reused geometries/materials, no lights/postprocessing and demand mode remain. Scroll-driven core/evidence/organization transforms now resolve directly; pointer damping remains isolated. Delta is clamped to avoid resume spikes. The detached support-probe WebGL context is explicitly released. No per-frame React state or geometry creation was introduced.

### 7. Canvas changes

The grid keeps its wake-on-demand/settle-to-sleep loop and existing DPR limits. Visibility toggles no longer rebuild its node field. ResizeObserver replaces the redundant resize listener. Screen positions and edge opacity are calculated once per node/frame; two label candidates are selected without per-draw object arrays/sort/slice, and labels are precomputed. Pointer physics remains disabled on phone/coarse input. Previous frame time resets on pause.

Hero and Contact cache pointer bounds on entry/resize instead of reading layout for every move. Contact mask writes are coalesced into one RAF. These changes target hot-path work, not visual fidelity.

### 8. CSS / compositing changes

Removed permanent `will-change` from project stories and inactive handoffs, full-parent handoff SVG drop-shadow blur, and rail/midpoint backdrop filters. The smaller header filter and meaningful image masks remain. The header no longer transitions its filter. No blanket translateZ, content-visibility, containment, or low-quality imagery was applied to measured sticky regions.

At desktop rest, non-auto `will-change` elements fell from 70 to 0; during a handoff only its two worlds are promoted. This counts CSS hints, **not actual GPU composited layers**. Layer count, GPU memory and raster paint time require a browser trace/device profiler not available in this pass.

### 9. Asset and font loading

Existing Next/Image and Next/font Geist architecture retained. Reduced/editorial About certificate images gained responsive `sizes`. A single WorkAssets observer eagerly loads/requests decoding only when a project enters the current/approaching viewport margin; stories remain mounted for accessibility/SEO. Images are unobserved after their first approach. Native image lazy loading remains advisory, not a guarantee that a browser never fetches a distant asset.

Original project assets total roughly 26MB, mostly Gesture Globe captures; delivered responsive Next/Image variants were retained. No originals were destructively recompressed. Slow-network/throttled cold-cache decoding was not benchmarked; the approach buffer lowers transition-time decoding risk but cannot guarantee zero blank images on every connection.

### 10. Mobile strategy

Capability policy uses viewport width, height, fine/coarse input and reduced motion; no device-name sniffing. Phones/coarse input use native scrolling, linear project internals, lower Hero complexity/DPR, no pointer physics, and simplified horizontal handoffs. About/Contact retain their existing normalized phone timelines; short heights (≤600px) use existing editorial compositions so landscape does not trap oversized titles in long sticky stages.

Modern svh sizing remains; body minimum changed to 100svh. Navigation/Contact/back-to-top targets were hardened to at least 44px where needed. Phone header clearance was corrected for metadata, and the Work rail respects bottom safe-area insets. Essential CTAs do not require hover.

### 11. Reduced motion / accessibility

Reduced motion presents the existing complete editorial Hero, Work stories, About and Contact. Cinematic scrubs, Lenis, secondary parallax and spring disturbances are disabled. WebGL is static/demand-based. Semantic project order and all links remain mounted. Existing autoAlpha/visibility prevents focus entering hidden Contact phases; handoffs are aria-hidden decoration without CTAs.

Actual keyboard checks confirmed Home → Work Tab focus with a visible 2px solid outline, Enter activation of Work, and Email → LinkedIn focus with a visible outline. Section sweeps checked focusable links under invisible ancestors; none were reported in the tested samples. This is targeted keyboard QA, not a complete screen-reader/WCAG certification.

### 12. Responsive QA

Actual browser viewport overrides tested: **360×800, 390×844, 393×852, 430×932, 768×1024, 1280×800, 1440×900, 1728×1117**, plus **1280×480** and **844×390 → 390×844** orientation recovery. Each standard viewport received the 40-boundary and 39-section DOM/scroll-state sweeps. Checks included Hero → Work, six internal stories, Work → Lab, About/Contact timeline samples and Footer. No horizontal document overflow or active scrub mismatch was found.

Representative screenshots were visually inspected at every listed size: Hero/Lab/Contact on narrow phones, MediFit on 393/430/tablet, desktop Work midpoint compositions, Dayflow/MediTwin internals, About universe/certificate phases, laptop/large-desktop Hero and short-height editorial Hero. These are sampled visual checks, not screenshots of every pixel of every section at every viewport. Reduced-motion phone and landscape recovery also passed the section checks; portrait return passed the boundary checks. Capability/reduced/visibility switches were simulated in the QA harness, not changes to the host OS.

Physical iPhone Safari and Android Chrome were unavailable. Real touch momentum, browser-bar behavior, high-DPR GPU pressure and safe-area hardware must still be tested there. No physical-device result is claimed.

### 13. Functional QA

Home, Work, Lab, About and Contact header links were clicked on production. Back/forward, back-to-top, direct #work/#lab/#about/#contact and refresh at those anchors were tested. Final direct #lab now lands at its 128px scroll margin (desktop observed 128.24px); phone native Lab navigation observed 128.02px. AlgaeOS and MediTwin detail hashes resolve with their header offset.

| Destination | Observed result / limit |
| --- | --- |
| SatQuery live system | Public application loaded. No analysis/job submitted. |
| Gesture Globe live experience | Destination loaded, with tracking initialization/media unavailable state. Camera permission and tracking functionality not tested. |
| Dayflow live app | Sign-in page loaded; no authentication or employee data accessed. |
| MediFit live app | Public application loaded with Gemini API-key gate; no key entered or health workflow tested. |
| Email | Correct mailto destination and reachable visible action verified; composer/send not invoked. |
| GitHub | Public AnirudhShashikumar profile loaded. |
| LinkedIn | Correct profile destination reached LinkedIn auth wall; profile content behind sign-in not verified. |

Certificate/infographic images remain linked to their existing local assets. The external application smoke checks are destination checks, not those products' end-to-end tests.

### 14. Before / after evidence

1440×900 local production browser, five independent synthetic forward/reverse/forward wheel replays, 100 RAF intervals and five active-project samples per boundary. Values rounded to 0.1ms; raw results: [motion-measurements.json](qa/motion-measurements.json).

| Boundary | Before median / p95 / max ms | After median / p95 / max ms | Max project systems with playing tweens, before → after |
| --- | --- | --- | --- |
| SatQuery → Gesture Globe | 16.7 / 17.6 / 17.7 | 16.7 / 18.2 / 18.7 | 0 → 0 |
| Gesture Globe → AlgaeOS | 16.7 / 17.6 / 17.7 | 16.7 / 18.3 / 18.7 | 1 → 0 |
| AlgaeOS → Dayflow | 16.7 / 17.6 / 17.7 | 16.7 / 18.3 / 18.7 | 1 → 0 |
| Dayflow → MediTwin | 16.7 / 17.6 / 17.6 | 16.7 / 18.2 / 18.6 | 2 → 0 |
| MediTwin → MediFit | 16.7 / 17.6 / 17.7 | 16.7 / 17.9 / 18.7 | 3 → 0 |

Both passes: 0 intervals >33ms, no observed long-task entries, 0 Hero WebGL draws and 0 grid clears at every Work boundary. After numbers do **not** demonstrate a faster FPS or improved timing tail; median cadence is unchanged and p95 is slightly higher. The demonstrated improvement is elimination of residual project playback, direct/reversible state mapping, and reduced promotion hints. ScrollTrigger-managed paused scrubs still update with scrolling; “0 playing timelines” does not mean zero GSAP work.

Lifecycle spot checks over 600ms at Hero: simulated hidden document produced 0 WebGL draws / 0 grid clears and inactive scene; reduced-motion visible Hero also produced 0 draws / 0 clears. On visible recovery the scene resumed (504 GL draws in that sample). Draw calls are not frames. These counters establish pause/resume behavior, not GPU throughput. Hero → Work, Work → Lab, internal sequences and About/Contact were regression-inspected; their before/after CPU/paint times were not measured.

Final saved sweeps: [desktop results](qa/motion-measurements.json), [390px coarse/reduced results](qa/phone-regressions.json). Screenshots: [desktop handoff](qa/work-handoff-desktop.jpg), [phone Contact](qa/contact-phone.jpg). Screenshots from the local harness include its small audit-panel toggle; that control is not part of the portfolio.

### 15. Existing files modified

Paths relative to `website/`:

```text
src/app/globals.css
src/components/layout/SiteFooter.module.css
src/components/layout/SiteHeader.tsx
src/components/system/ScrollMotion.tsx
src/components/system/SmoothScroll.tsx
src/components/system/ViewportProvider.tsx
src/components/three/IntelligenceField.tsx
src/components/three/IntelligenceScene.tsx
src/hooks/useScrollReveal.ts
src/sections/Hero.module.css
src/sections/Hero.tsx
src/sections/HeroKineticGrid.tsx
src/sections/WorkTransition.tsx
src/sections/about/About.module.css
src/sections/about/About.tsx
src/sections/contact/Contact.module.css
src/sections/contact/Contact.tsx
src/sections/work/AlgaeOSMotion.tsx
src/sections/work/DayflowFeature.module.css
src/sections/work/DayflowMotion.tsx
src/sections/work/GestureGlobeMotion.tsx
src/sections/work/MediFitFeature.module.css
src/sections/work/MediFitMotion.tsx
src/sections/work/MediTwinFeature.module.css
src/sections/work/MediTwinMotion.tsx
src/sections/work/SatQueryMotion.tsx
src/sections/work/Work.tsx
src/sections/work/WorkNavigation.module.css
src/sections/work/WorkNavigation.tsx
```

### 16. Files created

```text
src/components/system/scrollRefresh.ts
src/sections/work/WorkAssets.tsx
scripts/motion-audit.mjs
docs/performance-hardening.md
docs/qa/motion-measurements.json
docs/qa/phone-regressions.json
docs/qa/work-handoff-desktop.jpg
docs/qa/contact-phone.jpg
```

The reusable harness runs with the production server on 3000, `node scripts/motion-audit.mjs`, then http://127.0.0.1:3001/__motion-audit. It binds only loopback and is never an application route. SmoothScroll exposes diagnostics only with the explicit `motion-audit` query on localhost/127.0.0.1; hosted pages do not expose this hook. It samples publicly accessible animation state without adding application-frame React updates.

### 17. Validation results

Final production source checks passed:

```text
npx eslint src/          PASS
npx tsc --noEmit         PASS
npm run build:webpack    PASS (static / and /_not-found)
git diff --check         PASS
```

No application test script/suite exists in package.json; no tests were edited. Production browser console had no owned application errors. Repeated responsive/capability changes returned to stable trigger counts. This does not replace a full heap snapshot or physical-browser test.

### 18. Known issues

Nonblocking upstream THREE.Clock deprecation remains; no dependency upgrade was attempted for cosmetic warning removal. Next reports an ignored home-directory package-lock.json outside this repository; it was not deleted/changed. External Gesture Globe media initialization and LinkedIn authentication prevent fuller unauthenticated destination verification. MediFit's deployed medication-analysis entry differs from the portfolio fitness-concept narrative; content was intentionally untouched and deployment/content alignment is a separate follow-up.

### 19. Remaining performance risks

Real Safari/Android testing, high-DPR GPU memory/raster tracing, throttled asset loading, memory snapshots and real trackpad/touch hardware remain unverified. Hero still intentionally renders continuous fine-pointer desktop 3D while visible. Large typography/masks, long sticky stories, the small header backdrop and decorative DOM still cost resources on weak GPUs. There is no speculative adaptive FPS detector or broad quality degradation in this pass.

### 20. Release verdict

**No engineering blocker was reproduced in the tested production browser that prevents continuing Lab/About work.** The existing cinematic experience, six-project order, narrative, facts and two-axis navigation are intact. Proceed with content development; broad cross-device release remains conditional on real iPhone Safari and Android Chrome smoke tests, especially browser chrome, touch momentum, sticky geometry and high-DPR graphics. Do not market this pass as a guaranteed FPS gain or completed physical-device certification.
