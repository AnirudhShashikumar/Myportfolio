# Performance remediation — F10 and F12

Review date: 26 October 2026, India time. Measured source revision: `0706e6f` (full hash in [baseline](qa/performance-f10-f12/before/git-head.txt)). No commit or deployment was performed by this agent.

The verified improvements target unsupported graphics startup and redundant signal-point allocation. Browsers without WebGL 2 avoid the graphics import and its five requests; the moving signal point retains its mutable array across scene rerenders. Capable visitors retain the existing eager Hero, static reduced-motion scene and cinematic rendering. This is partial F10 remediation, not a claim that normal/mobile startup or every Core Web Vital is solved. Drei is removed; the upstream Clock warning remains assessed technical debt.

## 1. Baseline environment

Initial inspection saw `77eee63` with staged SEO/branding and project-integrity remediation. Before the baseline build, shared history advanced to `0706e6f`, committing that preceding work outside this agent; the recorded measurement snapshot is clean and includes those changes. During measurement, `ea6579f` committed only six baseline QA files, adding no runtime changes. Both shared commits are preserved. The [exact measurement status](qa/performance-f10-f12/before/git-status.txt), [staged paths](qa/performance-f10-f12/before/index-paths.txt), [unstaged paths](qa/performance-f10-f12/before/working-paths.txt) and [114 source/asset/script hashes](qa/performance-f10-f12/before/source-hashes.json) were recorded before implementation. No index, branch or history mutation was performed by this agent. The closing revision and source-preservation checks are recorded in [Git verification](qa/performance-f10-f12/after/git-preservation.json).

macOS arm64, Apple M5, Node 24.14.1, installed Chrome 155.0.8059.85, Next.js 16.4.3 webpack production build, served on `http://127.0.0.1:3001`. The existing port-3000 server was not used for these comparisons. Both builds passed. Read the installed Next.js client/server, lazy-loading, font and image guides before editing.

Each phase has three loads for each of five profiles: 1440×900 Home; 390×844 mobile Home; desktop direct `#about`; desktop reduced motion; desktop with WebGL unavailable. Each load uses a fresh browser context and disabled browser cache, observing six seconds after `load`. The started production process uses reused filesystem/image caches; no explicit HTTP priming request was made before each phase's first desktop sample. Mobile uses CDP 4× CPU, configured 150ms latency, 200,000 B/s download and 93,750 B/s upload. Other browser suites did not run during measurements. Only Chrome is used for these timing comparisons; WebKit is regression coverage.

The actual TTFB remains approximately 3–5ms even in the configured mobile profile. These are controlled local samples, not faithful remote cellular conditions, public-deployment measurements or field p75 values. Browser/OS scheduling, JIT and GC remain uncontrolled. Three samples support a limited lab comparison, not a universal speed claim.

Reproduction: [measurement harness](qa/performance-f10-f12/measure.mjs), [summary program](qa/performance-f10-f12/summarize.py), [environment before](qa/performance-f10-f12/before/environment-loads.json), [environment after](qa/performance-f10-f12/after/environment-loads.json). Full distributions and medians are in [comparison.json](qa/performance-f10-f12/comparison.json).

## 2. Initial resource waterfall

Resource Timing records URL, initiator, start/end, encoded/decoded body size and transfer size. Reviewable waterfall tables are retained as [before CSV](qa/performance-f10-f12/before/resource-waterfall.csv) and [after CSV](qa/performance-f10-f12/after/resource-waterfall.csv). CDP also records request/response/finish timestamps, MIME/encoding and `loadingFinished.encodedDataLength`. See the complete [before loads](qa/performance-f10-f12/before/loads.json), [after loads](qa/performance-f10-f12/after/loads.json), and separate [before](qa/performance-f10-f12/before/capability.json)/[after](qa/performance-f10-f12/after/capability.json) unavailable-capability samples.

The final accounting includes the **1,859-byte compressed webpack runtime fetched with `initiatorType=link`**. The console logs' older `initiatorType=script` subtotal excludes that preload; it is not the complete JavaScript total used below. This distinction also prevents treating HTML-listed bundles as the actual initial request set.

| Resource/accounting measure | Before | Final after | Interpretation |
| --- | ---: | ---: | --- |
| All emitted JS, raw filesystem bytes | 2,109,216 | 2,109,239 | 28 emitted artifacts; includes unrequested code. Not page transfer. |
| All emitted JS, gzip estimate | 614,913 | 614,888 | Offline compression estimate. Not measured transfer. |
| Capable Home JS requests by observation end | 15 | 15 | Includes dynamic graphics and the preloaded runtime. |
| Capable Home JS decoded response bodies | 1,667,429 | 1,667,452 | Requested source after decompression, not executed bytes. |
| Capable Home JS encoded response bodies | 476,972 | 476,945 | Actual compressed bodies; a negligible 27-byte difference. |
| Capable Home CDP script wire bytes | 483,167 | 483,140 | Includes observed HTTP headers. |
| Unavailable WebGL JS requests | 15 | 10 | Five graphics requests avoided. |
| Unavailable WebGL JS decoded bodies | 1,667,429 | 747,784 | 919,645 fewer decoded bytes. |
| Unavailable WebGL JS encoded bodies | 476,972 | 232,091 | **244,881 fewer bytes, approximately 51.34%.** |
| Unavailable WebGL CDP script wire bytes | 483,167 | 236,136 | **247,031 fewer wire bytes.** |

Resource Timing's transfer estimate is separately retained: normal Home **481,472→481,445 bytes**, unavailable **481,472→235,091**. It adds a standardized 300-byte response-header allowance, as specified by [Resource Timing](https://www.w3.org/TR/resource-timing/#dom-performanceresourcetiming-transfersize), and is not substituted for CDP's observed wire total. Inline JavaScript travels within HTML; it is separately included in the execution analysis rather than counted as another script request.

The first navigation's recorded lifecycle sweeps make **15 unique JS requests** in both capable builds, with the same corresponding wire totals as initial loading. No additional JS request appeared during those traversals. This does not generalize to untested routes or a future application build.

The existing font setup self-hosts Geist/Geist Mono: three initial WOFF2 resources total **68,936 encoded bytes** in both phases. All **11 emitted WOFF2 files are byte-identical**. Home image bodies remain **67,278 desktop / 18,130 mobile bytes**; no original multi-megabyte photograph is substituted for the existing Next/Image derivatives. Reduced-motion Home fetched no image bodies during its observation. Fonts, image sizes/loading policy and client/server content boundaries are unchanged.

## 3. JavaScript execution analysis

Normal startup hydrates the client providers, header/Hero and motion boundaries; GSAP/ScrollTrigger and desktop Lenis initialize their existing owners. Work/About content still passes as server-rendered content through small client boundaries. `next/dynamic` already split the graphics, but mounting it promptly fetched R3F/Three even when its inner capability probe would return no canvas.

The new probe runs inside that same eager dynamic loader. Only its failure path resolves a null component without importing R3F/Three. Capable, direct-anchor and reduced-motion visits still import the same scene. The scene's geometry values, `useFrame` callback, material setup and render loop are unchanged; only the moving signal point's array lifetime changes.

Separate diagnostic runs enabled V8 precise coverage, parsed-script events and Chrome tracing. Their extra overhead is not mixed with the timing runs. UTF-16 source offsets indicate code ranges observed by coverage; they are **not transferred bytes, CPU time, exact machine-code size or a safe unused-code removal budget**.

| Diagnostic profile | Parsed application source units, before→after | Covered source units, before→after |
| --- | ---: | ---: |
| Desktop Home | 1,791,567 → 1,791,590 | 844,942 → 845,041 |
| Mobile Home | 1,791,567 → 1,791,590 | 795,207 → 795,279 |
| WebGL unavailable | 1,791,567 → 871,922 | 720,165 → 489,685 |

These totals include static bundles plus two inline document scripts (124,186 source units before). Instrumentation/evaluation scripts without the application's URL are excluded. The unavailable path avoids parsing almost 920k source units; normal paths remain effectively identical.

Diagnostic inclusive `EvaluateScript` totals are **54.7→55.2ms desktop**, **217.7→221.9ms throttled mobile**, and **55.2→30.2ms unavailable**. Corresponding `v8.compile` entries are **11.5→11.7ms**, **46.4→46.4ms**, and **11.6→6.0ms**. Nested trace events overlap; these categories must not be added into a fabricated total. Individual traces/coverage and derived execution summaries remain under each phase's QA folder.

## 4. Main-thread findings

Non-diagnostic desktop Home, direct About, reduced-motion and unavailable profiles record **zero >50ms long tasks** in all three runs before and after. Mobile records **two** per run in both phases: median total **138→137ms**, median maximum **72→72ms**. No count reduction or meaningful mobile long-task win is claimed.

Diagnostic mobile tracing identifies startup evaluation of the shared framework/client chunk and a graphics chunk, plus layout work. With tracing/coverage enabled, the baseline recorded 119.6ms/88.0ms/84.7ms enclosing tasks, including 99.1ms layout and 86.0ms/84.6ms script evaluation. These are diagnostic events, not the lower-overhead two-task distribution. The data supports investigating initial layout and framework/graphics evaluation; it does not justify broad client-boundary changes or deferring every ScrollTrigger owner.

CDP script/task duration medians fall in some final samples, including desktop ScriptDuration **373.5→297.4ms** and mobile **347.0→333.9ms**. Those counters include callbacks across the observation window and remain sensitive to scheduling/JIT. Normal transfer, parsed code and diagnostic evaluation barely change; this is **not attributed as a general speed improvement** from removing Drei or moving the probe. Unavailable-profile non-diagnostic ScriptDuration is **143.7→145.2ms**, despite less diagnostic parse/evaluation work; no end-to-end CPU improvement is claimed for that path.

## 5. Graphics lifecycle findings

The baseline already correctly uses `frameloop="demand"` while reduced/offscreen, `always` while active, and document visibility to suspend active graphics. The kinetic grid settles instead of running a permanent idle loop. Lenis's existing GSAP ticker integration and cleanup are unchanged.

One-second Hero samples record **854 WebGL draw calls before / 840 after**. Work, About and Contact record **zero** in both phases; see [lifecycle evidence](qa/performance-f10-f12/after/lifecycle.json). Draw calls are not frame counts. Settled grid samples record zero clears in both phases. No new offscreen-render pause mechanism was needed.

Capable initial loads allocate two contexts: one temporary capability probe, explicitly lost, and one real renderer context. Moving the existing probe avoids duplicating it. Desktop startup creates **13 buffers**, uploads **6,924 bytes of vertex data**, creates **4 textures / 4 programs / 8 shaders**, and deletes the eight linked shaders. These are instrumented API-call counts, not exact GPU memory usage. The declarative geometry/material ownership and normal R3F disposal remain intact; no manual GPU disposal or context churn was added.

The baseline's five explicit-GC snapshots retain one document, 3,317 DOM nodes, 439 listeners and 41 ScrollTriggers, but buffer-creation calls rise **20→22→24→26→28**, with 24 extra uploaded bytes per traversal cycle and no explicit buffer deletion recorded. The signal-point JSX constructs a new three-float array on each scene rerender; changed attribute arguments cause reconstruction. The same pattern appears in the intermediate eager-loader build. This establishes redundant allocation, not an independently proven GPU leak or GPU-memory amount.

The final correction memoizes that mutable array per scene/data mode. It remains independently owned by each scene, and mobile/desktop data changes create the appropriate new array; no shared mutable module singleton is introduced. Final buffer creation is **13→13→13→13→13**, with buffer uploads fixed at **6,924 bytes**. The complete measured sequence ends with **13 created buffers rather than 28** and **6,924 uploaded bytes rather than 7,104**. Textures/programs/shaders remain at their original counts. Five GC snapshots retain one document, 439 listeners and 41 triggers; DOM counters are stable within each phase (3,317 before / 3,318 after). Used JS heap is **13,961,632–14,125,972 bytes before**, **13,957,372–14,112,124 after**. This is a stable allocation result, not a meaningful total-heap reduction claim. Heap/DOM/allocation measurements are a limited sequence, not a long-session soak or GPU-memory certification. Uncollected initial heaps remain GC-sensitive; no unavailable-profile memory saving is claimed.

## 6. Optimization candidates

| Candidate | Evidence / decision |
| --- | --- |
| Capability check before graphics import | Baseline unavailable browsers fetch the full stack. Implemented inside the existing eager loader, then measured. |
| Remove Drei | No source, runtime configuration, scripts or tooling import it. Removed as installation maintenance; no runtime bundle benefit attributed. |
| Gate all Hero rendering on viewport readiness | Trial delayed all three desktop first draws to 493–527ms from 383–400ms. Rejected; [trial measurements](qa/performance-f10-f12/trials/readiness-gate/) retained. |
| Defer Hero behind idle/timeout/interaction | Mobile graphics already first draw around four seconds under this profile. Further delay risks visible late composition; not implemented. |
| Suppress 3D for reduced motion | Existing static 3D is part of this composition. Removing it would reduce fidelity; not implemented. |
| Defer graphics on direct anchors | Could save cold-anchor work, but instant reverse/Home navigation then needs a verified preload/restoration strategy. Not introduced as a marginal optimization. |
| Add offscreen pausing | Already zero draws offscreen. No redundant mechanism added. |
| Stabilize signal-point attribute storage | Repeated traversals allocate two new buffers per cycle. Memoize the per-scene three-float array; preserve its values and existing frame update. |
| Lazy-initialize every Work/About timeline | Startup layout/evaluation is measurable, but changing registration threatens anchor/focus/fast-seek ownership. No broad refactor performed. |
| Change fonts, image scheduling or DPR/material/segment quality | Existing optimized resources; no trace-supported necessity for fidelity loss or scheduling changes. Left intact. |

## 7. Exact changes implemented

- `src/sections/Hero.tsx`: move the WebGL preflight into the existing `next/dynamic` loader, before the import. WebGL 2 success imports immediately; unavailable/throwing probes resolve an empty graphics component. No timer, idle callback, visibility gate or user-interaction dependency delays the normal import.
- `src/components/three/IntelligenceField.tsx`: export its existing props type for the typed loader; remove the moved `useState` probe. Canvas configuration, error boundary, camera, DPR, alpha/antialias/power preference, reduced-motion and active frame-loop settings remain identical.
- `src/components/three/IntelligenceScene.tsx`: memoize the mutable signal-point array by the existing data-mode reference and pass it as the existing buffer attribute argument. All coordinate values, animation calculations, signal timing, materials and scene layers remain unchanged.
- `package.json` / `package-lock.json`: uninstall only `@react-three/drei`. **36 package paths removed, zero added, zero retained version changes.** Build scripts unchanged; normal npm lockfile regeneration used. No generated node_modules file was edited.

The installed Three r186 WebGL renderer explicitly requires WebGL 2 (WebGL 1 unsupported since r163). The old probe accepted a WebGL 1-only context even though that renderer could not use it. The new preflight accurately follows the installed renderer's requirement and retains the existing DOM/grid fallback for unsupported browsers.

Only these **five of 114 starting files** changed; the other 109, including prior metadata/icons, project content, GPS-sanitized assets, Hero CSS/grid, all GSAP motion modules, focus architecture, footer and ScrollDiscovery, match their starting hashes. See [preservation](qa/performance-f10-f12/after/source-preservation.json), [isolated source patch](qa/performance-f10-f12/after/task-source.patch), and [dependency diff](qa/performance-f10-f12/after/dependency-diff.json).

## 8. Before/after performance measurements

Three-run medians; startup time is measured from navigation start. See the raw runs for ranges.

| Profile | LCP candidate ms | Initial CLS | First WebGL draw ms | Long tasks |
| --- | ---: | ---: | ---: | ---: |
| Desktop Home | 60 → 60 | 0 → 0 | 385.4 → 382.7 | 0 → 0 |
| Mobile Home, throttled | 1,016 → 1,028 | 0 → 0 | 3,966.8 → 3,979.8 | 2 → 2 |
| Desktop direct About | 64 → 60 | **1.0 → 1.0** | 410.7 → 415.1 | 0 → 0 |
| Desktop reduced motion | 60 → 60 | 0 → 0 | 399.4 → 399.6 | 0 → 0 |
| Desktop without WebGL | 60 → 60 | 0 → 0 | No draw → no draw | 0 → 0 |

Home's LCP candidate remains the **WHAT I WANT** span. Its early local paint is distinct from the intentional 2.35-second first-visit formation and subsequent graphics availability. No LCP score improvement or perceptual-completion improvement is claimed. The first-draw ranges overlap after replacing the rejected readiness gate.

Direct About consistently records a **single layout-shift entry of value 1.0 during startup** in both builds. This was not resolved by capability gating. Normal Home CLS zero cannot be generalized to anchored startup or the whole cinematic journey. The retained focused observation attributes its sources to the About section and adjacent Work exit at approximately 175ms during startup. Initial pinned-layout hydration/anchor stabilization needs further investigation; timeline timings were not altered to mask it.

Across five 180-interval forward/reverse sweeps (Hero, SatQuery, AlgaeOS, About, Contact), median callback intervals remain approximately **16.7ms**, p95 **16.7–16.8ms**. Before: **1/900 intervals >33.34ms**, maximum 150ms in Hero. After: **0/900**, maximum 16.8ms. No long tasks were observed inside either sweep window. An isolated first-pass outlier is insufficient to attribute a frame-rate improvement; these are rAF callbacks, not GPU/compositor FPS.

One About reader click records Event Timing duration **48→48ms**, maximum input delay **2.8→2.5ms**. Pointerdown/up/click share a single interaction ID per run; they are not three independent interactions, a representative INP distribution or field INP. Durations are quantized.

The lifecycle's exploratory repeated wheel trials retain their raw positions. Later trials were undone by an unfinished Lenis interpolation from the preceding wheel, so their region labels do **not** establish Work/About/Contact latency and are excluded from performance conclusions. The existing isolated nine-region input suite, which asserts each actual starting position, is used for behavioral regression. No all-region wheel-latency improvement is claimed. These excluded rows are preserved for auditability, not presented as valid four-region traces.

## 9. F12 assessment

`npm ls` and source inspection locate `new THREE.Clock()` in **R3F 9.7.0's store**, not an application-owned clock constructor. `IntelligenceScene` reads R3F's existing `clock.elapsedTime`. R3F's frame loop calls `clock.getDelta()` and its frame-loop setter calls `stop()`, `start()` and sets `elapsedTime`; manual advance also accesses `oldTime`.

[Three Timer](https://threejs.org/docs/pages/Timer.html) has a different contract: explicit `update()` and `getElapsed()`, rather than those Clock properties/lifecycle methods. Replacing only the scene read cannot prevent R3F constructing the deprecated Clock, and supplying a raw Timer is incompatible with that installed store. A shim, warning suppression or generated dependency patch would add risk without solving the upstream contract.

The reviewed current stable [R3F 9.8.2 source](https://github.com/pmndrs/react-three-fiber/blob/v9.8.2/packages/fiber/src/core/store.ts) still constructs `THREE.Clock`; its [release notes](https://github.com/pmndrs/react-three-fiber/releases/tag/v9.8.2) do not provide a Clock→Timer migration. A broad graphics upgrade, Three downgrade or prerelease migration was not justified for this warning. Three 0.186.0 / R3F 9.7.0 remain unchanged. **The warning remains on capable rendering paths**, with no associated page error. Upstream-supported timing migration is the remaining technical-debt action.

The confirmed unused **Drei 10.7.8** dependency and its now-unneeded tree are removed. The absence of imports means its installed size was never evidence that it inflated the client payload. Post-removal production and full npm audits both report **zero vulnerabilities**; the initial sandbox DNS failures and successful retry evidence are retained. This preserves the verified F01 dependency state without claiming future advisory immunity.

The existing demand-rendering strategy matches [R3F's documented performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance). No manual frame API or offscreen policy was changed merely to remove the warning.

## 10. Visual and cinematic regression results

All **13 existing suite commands pass on the final build**, with output isolated from historical QA folders. See [command results](qa/performance-f10-f12/after/regression/commands.json), [runner/adapters](qa/performance-f10-f12/regress.mjs), and the individual logs under [regression](qa/performance-f10-f12/after/regression/).

| Final validation | Result |
| --- | --- |
| `npx eslint src/` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build:webpack` | Pass, production Next.js 16.4.3 |
| `git diff --check` | Pass |
| About content / motion | 4 content tests; 20 holds, 76 transition/boundary and 65 viewport samples, reverse/reader/input/cleanup cases pass |
| ScrollDiscovery | 7 viewports / 25 behavior cases pass |
| F02 | All 7 keyboard/AX/reading/reduced/no-JavaScript cases pass |
| F03/F04 | 7 certificate/status/footer cases pass with the already reviewed project-integrity text fixture |
| F05 | 319 Hero states across 11 sizes have zero text clips; 20 Dayflow labels across 16 states retain the existing opacity floor and readable-mode checks |
| SEO/branding | 19 cases pass, including approved origin/icons/OG/crawlers/Person/404 |
| Project integrity | Six unique functioning Work links, two plain availability statuses; changed-text bounds pass at all eight sizes; historical narrative and certificate actions retained |
| Chrome production matrix | 8 viewports / 801 states pass |
| WebKit production matrix | 3 viewports / 318 states pass |
| Supplementary production suite | All six Work reverse signatures, WebGL fallback, WebKit anchors/reader/reduced checks pass |
| Isolated slow/fast/reverse input | All 9 regions / 108 states pass; actual starting positions asserted |
| Focused capability regression | 9 desktop/mobile cases pass: capable, unavailable, WebGL 1-only, throwing probe, reduced motion and direct anchor; offscreen pause/re-entry retained |
| Prior image privacy | All 21 images still clear; both production-served originals return 200, match sanitized hashes and retain identical decoded pixels/profiles/orientation |

Chrome sizes: **360×800, 390×844, 430×932, 768×1024, 1280×720, 1280×800, 1440×900, 1728×1117**. WebKit: **390×844, 1280×720, 1440×900**. F05 adds 391px, 600px and 767px intermediate Hero widths. Focused normal/unavailable/reduced checks additionally cover both 1440×900 and 390×844.

Across the **1,119 production states**, there are zero page errors, failed requests, broken loaded images, document overflow, horizontal text candidates or active scrub mismatches. Sample counts, document heights, scroll positions (within 1px), trigger counts and About modes match the preceding project-integrity baseline. See [matrix comparison](qa/performance-f10-f12/after/browser-comparison.json). No hydration error or missing GSAP target was found. The known Three.Clock and existing Node module-type/external-lockfile notices remain.

Captured desktop/phone Hero identity/evidence, all six Work compositions, About, Contact keyboard actions and mobile editorial content were visually inspected. The constellation and static reduced-motion scene retain their geometry/typography, and the unavailable path retains its existing DOM/grid fallback. Example captures: [normal Hero](qa/performance-f10-f12/after/capability-regression/normal-1440.jpg), [unavailable Hero](qa/performance-f10-f12/after/capability-regression/unavailable-1440.jpg), [mobile reduced Hero](qa/performance-f10-f12/after/capability-regression/reduced-390.jpg), and [Contact focus](qa/performance-f10-f12/after/regression/accessibility-f02/contact-keyboard.jpg). Animated screenshots vary with capture time; this is not an entire-frame pixel-identity claim. All 11 font hashes match. No timeline value, ownership rule, layer or visual feature was removed.

## 11. Accessibility regression results

The final F02 suite retains **18 native Tab stops**, visible Tab/Shift+Tab focus, Contact navigation → email, Work reading-mode cycles and the same six project actions. Cold/live reduced motion and no-JavaScript desktop/phone/short-height content and Contact navigation pass. Initial and Work-reading axe checks have zero rule violations; the previously triaged decorative Contact monument warning and staged/manual contrast limitations remain scoped as documented in F05.

The nine focused graphics cases record no page error or horizontal overflow. Unsupported/throwing WebGL probes retain one kinetic-grid canvas, readable Hero and resolved introduction; capable/reduced visitors retain both canvases. No legacy WebGL 1 context is requested for a renderer that requires WebGL 2. Re-entry preserves the existing scene and resumes normal rendering. No ARIA, semantic visibility, project action, focus target or readable content was changed.

The [safe privacy regression](qa/performance-f10-f12/after/privacy-tests.txt) reuses the existing scanner with only its output root redirected. No historical evidence was overwritten or coordinate value logged. Actual VoiceOver/NVDA/JAWS speech output and physical-device acceptance remain outside this browser-only verification; the prior native-access restriction was respected.

## 12. Remaining limitations

1. **F10 remains partially open:** normal/mobile/direct-anchor graphics transfer is essentially unchanged; two throttled mobile startup long tasks and anchored-start CLS 1.0 remain. Further work needs trace-supported layout/resource changes and the same cinematic/anchor/focus regression coverage.
2. **Clock debt remains upstream:** assess a supported R3F Timer migration when available. Do not replace the installed clock with an incompatible Timer or silence its warning.
3. Local headless emulation does not establish physical mobile/GPU behavior, field INP/LCP/CLS, remote CDN performance or long-session GPU memory. No performance improvement is claimed from small timing movements or the isolated first-sweep outlier.
4. Prior reports' real screen-reader/physical-device/manual contrast acceptance, owner-provided historical records, healthcare version mapping and public GPS deployment verification remain unchanged. The current sanitized assets are preserved; no deployment was authorized or performed.

## 13. F10 / F12 closure verdicts

| Finding | Verdict |
| --- | --- |
| F10 | **Verified partial remediation.** Unsupported WebGL startup avoids five graphics requests and 244,881 compressed body bytes, and the signal-point buffer stops reallocating across visibility traversals. Capable paths retain their existing composition. Normal/mobile startup and direct-anchor layout stabilization remain measured follow-up work; F10 is not declared fully closed. |
| F12 | **Assessment complete; unused dependency remediated.** Drei removed without retained version changes. Clock warning remains documented upstream technical debt because the installed R3F API and reviewed stable source still require Clock. No unsafe application shim/upgrade introduced. |

This agent did not commit, deploy, redesign visuals, retime timelines or change ScrollTrigger ownership.
