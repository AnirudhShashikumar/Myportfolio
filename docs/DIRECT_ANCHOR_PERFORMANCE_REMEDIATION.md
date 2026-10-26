# Direct-anchor and mobile startup investigation — remaining F10

Reviewed 26 October 2026, India time. **F10 remains open.** The startup shifts and two throttled mobile long tasks are reproduced and attributed. None of the tested narrow corrections removes the shift safely, so their application edits were reverted. This report does not claim a performance improvement or a completed F10 fix.

## 1. Reproduction environment

macOS arm64 / Apple M5, Node 24.14.1, npm 11.11.0, Next.js 16.4.3 webpack production build, Chrome 155.0.8059.85. Timing samples use a dedicated production preview at `http://127.0.0.1:3001`; WebKit is functional regression coverage. No timing samples run concurrently with builds or regression suites.

Starting revision: `ea6579f`. The preceding performance task's five modified application/dependency files and untracked report/evidence were already present. Their state is preserved; this investigation does not claim those earlier changes as new work. Starting [Git status](qa/direct-anchor-performance/before/git-status.txt), [revision](qa/direct-anchor-performance/before/git-head.txt), [index paths](qa/direct-anchor-performance/before/index-paths.txt) and [113 file hashes](qa/direct-anchor-performance/before/source-hashes.json) establish the boundary. No index, branch, commit, history or deployment mutation was performed.

Read the production audit and preceding performance, F02, F05 and project-integrity reports, plus the installed Next.js client/server guide. It describes server HTML appearing before client hydration; a layout effect cannot retroactively prevent that server paint. [Next.js client/server documentation](https://nextjs.org/docs/app/getting-started/server-and-client-components).

Desktop timing viewport: 1440×900. Mobile: **390×844, CDP 4× CPU, configured 150ms latency, 200,000 B/s download / 93,750 B/s upload**, matching the preceding report. Three fresh-context navigations and three subsequent refreshes per profile; browser cache disabled; six seconds of observation after `load`. The server, filesystem, image cache and browser process are warm/reused. A refresh reuses that context, session and browser process; it is separately reported rather than combined with a fresh navigation.

Before/final contain **30 observations each**: four desktop destinations × three runs × navigation/refresh, plus three mobile Home runs × navigation/refresh. The final phase is a replication after reverting unsuccessful trials, **not a changed implementation**. JIT, scheduling, GC and resource completion can differ. Configured latency does not reproduce remote cellular TTFB; local response-header latency remains only a few milliseconds. These are not field p75, physical-device or public-CDN measurements.

The [measurement harness](qa/direct-anchor-performance/anchors.mjs), [frame/graphics harness](qa/direct-anchor-performance/measure.mjs), [comparison program](qa/direct-anchor-performance/compare.py), raw [before](qa/direct-anchor-performance/before/anchors.json) / [final](qa/direct-anchor-performance/after/anchors.json) observations and [comparison](qa/direct-anchor-performance/comparison.json) make the methodology repeatable. CLS uses the maximum eligible session window, excluding `hadRecentInput`; these short startup observations also have the same eligible-entry sum. Source rectangles are viewport-clipped attribution rectangles, not an independent measure of total visible travel. The navigation timing object's `type` distinguishes `navigate` and `reload` in the original baseline JSON; final records additionally include `action`.

## 2. Baseline CLS results

| Desktop destination | Fresh navigation, three scores | Refresh, three scores |
| --- | --- | --- |
| `/` | 0, 0, 0 | 0, 0, 0 |
| `/#work` | 0, 0, 0 | 0, 0, 0 |
| `/#about` | **1, 1, 1** | **1, 1, 1** |
| `/#contact` | **1, 1, 1** | **2, 2, 2** |

Each About score is a single eligible entry. Contact refresh records two entries within the same session window. Mobile Home scores zero on all six baseline observations. These results expand the previous report's About-only finding; Home's zero does not certify fragment startup.

One focused About entry occurs at **195.6ms**, `hadRecentInput:false`. At callback time, `scrollY` is 28,519. Its sources are:

| Source | Previous clipped rect `(x,y,w,h)` | Current clipped rect |
| --- | --- | --- |
| `section#about` | `(0,0,1440,900)` | `(0,1.109375,1440,898.890625)` |
| Adjacent Work exit | `(0,0,0,0)` | `(0,0,1440,1.109375)` |

The **value 1.0 is retained as reported**. Tiny differences in these clipped rectangles neither demonstrate a literal 900px visible jump nor justify discarding the metric. Early [About screenshot](qa/direct-anchor-performance/before/desktop-about-0-early.jpg) catches the later MODEL/PRODUCT plate before restoration; the [settled screenshot](qa/direct-anchor-performance/before/desktop-about-0-final.jpg) is the opening PERSON/ORIGIN plate. [Startup video](qa/direct-anchor-performance/before/desktop-about-0.webm) and [diagnostic events/frames](qa/direct-anchor-performance/before/diagnostic.json) retain the transition. Screenshot acquisition is asynchronous; it is not used as a precise duration measurement.

## 3. Layout-shift root cause

**Hydration-related geometry change interacting with native fragment navigation is verified. A GSAP pin defect or harmless measurement artifact is not established.** The stories use CSS sticky stages; no `.pin-spacer` exists during the diagnostic frames, and the focused trigger inventory records no owned pin.

One representative baseline About startup proceeds as follows. Times are local diagnostic observations, not universal deadlines or exact React hydration-start/end marks:

| Observation | Time | Document height | Scroll Y / relevant geometry |
| --- | ---: | ---: | --- |
| DOMContentLoaded; static/editorial HTML | 39.2ms | 34,220px | Y=0; About top=22,597.296875px |
| First sampled animation frame; native fragment already reached | 73.6ms | 34,220px | Y=22,597px |
| First paint/FCP | 92ms | — | Server-rendered fragment precedes motion capability commit |
| About cinematic DOM/layout commit observed | 168.3ms | 38,423px | About height changes from ~10,197px to 14,400px |
| Work/handoff/Contact motion commit observed | 193.4ms | 46,887px | About top=28,520.109375px; Y=28,519px |
| Eligible shift | 195.6ms | 46,887px | About / Work exit attribution, value 1 |
| ScrollTrigger `refreshInit` | 317.3ms | 46,887px | Same final section geometry |
| ScrollTrigger `refresh` / fragment settlement | 343ms | 46,887px | Y=28,520px; target top error=0.109375px |

`ViewportProvider` initially exposes width zero / reduced motion true for compatible server markup. Its effect resolves actual capabilities. About changes from editorial flow to the 1,600svh sequence in a layout effect. SatQuery, Gesture Globe, the five Work handoffs, Work exit and Contact then enable their motion layout in passive effects. Work's height changes from ~18,097px to ~24,020px, moving About by **5,922.8125px** in document coordinates. About's own height change moves Contact; Contact also changes from static flow to its existing staged height. Hero's 4,500px height remains constant in this sample.

Supplemental same-source diagnostics observe Contact at Y=38,717px after the motion commit, while its final top is 42,920.109375px; refresh then moves it by another ~4,203px. This is a real off-target startup interval, not a reason to dismiss the finding from the small final error.

About's timeline is created while the upstream Work layout is still static. The supplemental About trace inventories `about-story` at start **22,597px**, despite the expanded About section now starting at **28,520.109375px**. Later Work activation invalidates that start coordinate; this explains the early later-plate capture. The local audit hook becomes available after child owners initialize. Supplemental final diagnostics inventory its start/end/pin state and subsequent refreshes. These diagnostic mutations identify client enhancement commits; they are **not an exact profiler measurement of all React hydration work**.

The existing 120ms coalesced refresh subsequently recalculates the changed geometry, and `ScrollMotion`'s fragment listener settles the target with native `scrollTo`, accounting for `scroll-margin-top`. Lenis initializes outside those child owners and uses its existing GSAP ticker. There is no evidence that Lenis creates a pin or the extra scroll space. The shift precedes the observed scheduled refresh, so blaming that refresh's pin reflow reverses the measured order. [GSAP documents refresh as geometry recalculation and update as scroll-state synchronization](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh()).

Classification: **D (hydrated geometry) and B (anchor restoration interaction) are supported; a transient incorrect composition is observed. C (pin creation) is absent in this trace. E (measurement artifact) is not proven and is not used to waive the finding.** Attribution identifies affected nodes rather than necessarily the upstream cause, as explained by the [Layout Instability API](https://wicg.github.io/layout-instability/).

## 4. Exact source changes and rejected corrections

**Final application/dependency changes in this task: none.** The earlier five modified files remain byte-identical to this task's starting snapshot. All 113 starting source/asset/script files match. Only this report and isolated QA scripts/evidence are added. Existing scripts, dependencies, styles, timelines, ARIA, focus owners and no-JavaScript markup are preserved.

| Trace-supported trial | Result / decision |
| --- | --- |
| Refresh and settle immediately after child motion effects establish geometry | About still reports **CLS 1.0**. Does not stabilize the document's pre-hydration dimensions. Reverted. |
| Resolve viewport capabilities with a layout effect, plus immediate alignment | About still reports **CLS 1.0**; one diagnostic sample includes an 89ms task. Synchronizing client effects cannot prevent the already painted server geometry. Reverted; no universal regression claim from one sample. |
| Browser-only experiment: automatic scroll anchoring disabled during startup, permanently or restored after refresh | All variants still report **CLS 1.0** and the same ~0.11px settled target offset. No production `overflow-anchor` change made. |

Trial [measurements/video](qa/direct-anchor-performance/trial/diagnostic.json), [viewport trial](qa/direct-anchor-performance/trial/viewport-layout-effect/diagnostic.json), [automatic-anchor experiment](qa/direct-anchor-performance/trial/scroll-anchoring.json) and [rejected source patch](qa/direct-anchor-performance/trial/rejected-source.patch) remain reviewable. No timeout, page hiding, native-scroll suppression, metric exclusion or timeline retiming was retained.

A candidate for a separate implementation is reserving the *correct enhanced dimensions before the native fragment's first paint*, while preserving natural flow for no-JavaScript, reduced motion, short viewports and both reading modes. Applying cinematic heights indiscriminately would create blank travel, overlap static content or break reader layout. An early enhancement marker/CSS reservation strategy needs its own capability/CSP/failure-path validation; it has not been implemented or certified here. The unsuccessful ordering changes are not presented as a substitute for that work.

## 5. Before/final measurements

The complete three-run distributions and medians are in [comparison.json](qa/direct-anchor-performance/comparison.json). The final phase repeats the original implementation. Any variation is replication variance, **not an optimization benefit**.

Three-run medians for fresh navigation (all durations in milliseconds):

| Profile | CLS before → final | LCP candidate | First WebGL draw | Long tasks / maximum |
| --- | --- | --- | --- | --- |
| Desktop Home | 0 → 0 | 60 → 64 | 382.3 → 386.9 | 0 / 0 → 0 / 0 |
| Desktop Work | 0 → 0 | 92 → 92 | 398.5 → 392.5 | 0 / 0 → 0 / 0 |
| Desktop About | **1 → 1** | 60 → 60 | 399.1 → 416.2 | 0 / 0 → 0 / 0 |
| Desktop Contact | **1 → 2** | 64 → 72 | 417.3 → 413.3 | 0 / 0 → 0 / 0 |
| Throttled mobile Home | 0 → 0 | 1,012 → 1,024 | 3,965.1 → 3,964.0 | **2 / 72 → 2 / 73** |

Contact's fresh scores are **[1,1,1] → [2,2,1]**; refresh scores are **[2,2,2] → [1,1,2]**. Both phases contain the same one- or two-entry startup behavior. Hydrated geometry changes can land in one or separate rendering frames. Source is identical; the distributions do not establish an improvement or a new application regression.

About refresh remains **[1,1,1] → [1,1,1]**; Home/Work refresh remain zero. Mobile refresh remains zero CLS and zero long tasks; its median first draw is **3,835.5 → 3,847.3ms**, LCP candidate **968 → 972ms**. Contact refresh first-draw ranges are **212.2–374.8 → 375.5–387.4ms**; that variation on unchanged source is retained, not assigned to a source change.

Fresh mobile task pairs become **[73,67], [74,65], [72,69]ms**. Median total is **137 → 140ms**, maximum ranges **71–72 → 72–74ms**. First-draw ranges overlap: **3,962.5–3,968.2 → 3,963.5–3,967.6ms**. This supports continued reproduction, not a startup speed claim.

Every timing observation requests **15 JavaScript files / 476,945 encoded response-body bytes** (including the link-preloaded webpack runtime). This excludes inline scripts carried in HTML, and is not CDP wire/header accounting. No dependency or bundle change is retained. Desktop final document height remains **46,887px**, mobile **43,058px**, with respectively **41 / 10** triggers. Cold enhancement still changes the document height; only settled geometry is stable.

Both phases' five forward/reverse rAF sweeps yield 900 callback intervals: median **16.7ms**, p95 **16.7–16.8ms**, maximum **16.8ms**, **0/900 above 33.34ms** in each phase. No long tasks occur within those sweeps. These are callback intervals, not compositor/GPU FPS. No frame-rate improvement is claimed.

## 6. Direct-anchor verification

The [focused navigation suite](qa/direct-anchor-performance/after/navigation/results.json) passes **135 settled landings**: 15 each for Chrome desktop/mobile/reduced/no-JavaScript/unavailable-WebGL and WebKit desktop/mobile/reduced/no-JavaScript. It tests all four direct destinations, refreshes, native header links and two Back/two Forward traversals. Every state has zero horizontal overflow and zero pin spacers; active focus remains `BODY`. Maximum measured settled target error is **1.46875px** (2px test tolerance).

The six-second low-overhead samples are tighter: desktop Home/Work land exactly at the clamped target; About/Contact have **0.109375px** rounding error in both phases. Final document heights and motion capabilities remain appropriate to each profile. These are correct settled targets, not closure of startup CLS.

An initial history harness triggered the next traversal as soon as Lenis was within 2px of its destination and timed out on Back. The settled runner adds a **QA-only 200ms** pause before the next navigation and passes. Rapid interruption is separately investigated rather than being conflated with settled navigation. The separate [rapid interruption diagnostic](qa/direct-anchor-performance/after/rapid-history.json) then reproduces a failure in **3/3 runs**: the URL returns to `#work`, but the viewport finishes at **Y=42,920px (Contact)** instead of **4,500px (Work)**. Before Back, the root still has `lenis-scrolling lenis-smooth` even though its rounded position has reached Contact. Sampled frames after Back move from Y≈20,772px back toward 42,920px while the hash remains `#work`. The installed Lenis native-scroll handler synchronizes its target only when scrolling is false/native; the observed continuation is consistent with its still-active smooth target. There is no application popstate cancellation for that inertia.

This is an **existing functional history limitation on identical application source**, not a new regression introduced by the discarded trials. It requires a separately verified interruption strategy; changing native-history restoration or adding an untested Lenis reset here would not be a safe CLS correction. No application history behavior was altered to make the settled test pass. The 135 passing settled cases must not be read as a rapid-interruption pass.

## 7. Mobile long-task analysis

The fresh baseline mobile runs contain exactly two >50ms startup tasks: **[72,65], [72,65], [71,67]ms**. Median maximum **72ms**, median total **137ms**. Subsequent refreshes in the same contexts record **zero**, illustrating the importance of keeping warm-JIT/session refresh results separate. The fresh first WebGL draws are 3,962.5–3,968.2ms. No Hero delay is added.

Dedicated CDP tracing and a 100µs V8 sampling profile are kept separate from those low-overhead timing runs. See [CPU profile](qa/direct-anchor-performance/before/mobile-stacks/mobile-cpu.json), [compressed trace](qa/direct-anchor-performance/before/mobile-stacks/mobile-trace.json.gz) and [sampled stacks](qa/direct-anchor-performance/before/mobile-stacks/analysis.json). The sampled `webpack` require function can include dependent factory initialization; the URL of an enclosing `EvaluateScript` is not proof that all work originated in that file.

| Work category | Actual diagnostic evidence | Decision |
| --- | --- | --- |
| Framework/client module initialization | 65.639ms enclosing task, 64.2ms `EvaluateScript` for `794-216401842b802bd7.js`; sampled stack `main-app → webpack require d → Next client factories → 2669 → ReactDOM factory 9248` | Matches the first recurring startup interval around 2.2s. No framework patch, unsupported import substitution or dependency upgrade justified. |
| React hydration / application effects | Later React scheduled work invokes the page's existing motion owners; its stacks are separate from the earlier module-evaluation interval | Not labelled wholly as framework parsing or Three setup. Broad boundary/effect scheduling changes would require separate interaction validation. |
| GSAP / ScrollTrigger setup | Additional profiled tasks **82.945ms / 114.605ms**, with page motion factories → GSAP context/set/render → ScrollTrigger `init`/measurement functions | Present in the diagnostic run, **not** extra tasks silently added to the primary two-task count. No lazy registration or timeline changes made. |
| Layout / style | Those two diagnostic tasks contain respectively ~11.5/24.8ms and ~13.0/52.1ms of inclusive Layout/UpdateLayoutTree events. An initial ~114.2ms browser task contains ~93.3ms Layout | Nested categories overlap and are not added into a fabricated CPU total. Initial trace task is not equated to a primary observer entry. |
| Graphics module initialization | 59.034ms enclosing task, ~58.9ms `EvaluateScript` for `bd904a5c.b9f5781b322e5178.js`; stack `844 IntelligenceField → 6275 R3F → 9590 graphics dependency → Three factory 5269`, through webpack require | Corresponds to the second recurring interval around 3.76s. It is module initialization, not proof of 59ms of GPU drawing or renderer construction. |
| Other JavaScript / graphics creation | Capability probe, R3F scene creation and subsequent draws remain observable separately; the profile does not support assigning their whole cost to either recurring task | No speculative suppression, import deferral or graphics quality reduction. |

The first diagnostic attempt also polled document geometry each frame; that perturbed startup layout and is retained in the outer `before/` diagnostic files as **excluded timing evidence**. `before/mobile-stacks/` removes that geometry polling and mutation/refresh instrumentation from mobile. Profiling still adds overhead: its additional initialization tasks are not substituted for the normal three-run distribution. Minified function names/module IDs and zero-based columns are retained; there are no production source maps to support invented source-line precision.

No trace-supported low-risk application change was found that reduces the two module-initialization tasks while retaining this first visible eager Hero. Deferring Three would risk later graphics arrival; removing static reduced-motion graphics or lazily registering every story would change accepted behavior. Existing unavailable-WebGL import avoidance and stable signal buffer remain preserved.

## 8. Graphics regression

All **nine** [capability cases](qa/direct-anchor-performance/after/capability-regression/results.json) pass: desktop normal/unavailable/WebGL-1-only/throwing/reduced/direct-anchor, plus mobile normal/unavailable/reduced. Unavailable paths retain the DOM/grid fallback, skip unsupported graphics requests, resolve the intro and have no page error or document overflow. Capable/static reduced-motion scenes retain their two canvases; normal rendering pauses offscreen and resumes on return.

Both lifecycle phases record **840 draw calls** in the one-second Hero window and **zero** in Work/About/Contact. Draw calls are not frames. Five traversal/explicit-GC cycles retain **41 triggers, one document, 3,317 nodes and 439 listeners** in both phases. Created buffers remain **13 → 13 → 13 → 13 → 13**, with the earlier memoized signal-point storage intact. Used JS heap ranges are **13,981,416–14,135,168 → 13,975,880–14,130,756 bytes**; these small differences are not a memory-saving claim or a GPU-memory/long-session soak certification.

All eleven emitted WOFF2 files match the preceding validated build; see [font hashes](qa/direct-anchor-performance/after/font-comparison.json). Source/asset hashes preserve images and all scene/material/timeline settings. The previous Clock warning remains upstream R3F timing debt; it is not suppressed or represented as fixed.

## 9. Accessibility regression

All **seven F02 cases** pass: six projects and Contact actions appear once in the initial browser AX tree, **18 native Tab stops** retain visible forward/reverse focus, Contact Enter → Tab reaches email, Work reading mode restores ownership after Enter/Space cycles, and cold/live reduced motion plus no-JavaScript desktop/phone/short baselines remain usable. Reading cycles restore **41 triggers**. See [F02 results](qa/direct-anchor-performance/after/regression/accessibility-f02/results.json).

Initial and Work-reading axe result arrays remain empty. Static Contact retains the previously triaged **decorative outlined-name** contrast finding at 1.03:1; meaningful identity remains available independently. F05's [current inspection](qa/direct-anchor-performance/after/regression/f05/inspection.json) preserves the twenty Dayflow label corrections, Contact text treatment and zero Hero text clipping across the sampled sizes/states. F03/F04's seven cases retain the reviewed MediFit status/evidence and the footer's **4.6006:1** contrast/readability treatment.

No semantic visibility/ARIA was changed to suppress findings. Existing transitional/incomplete contrast review remains as scoped in F05. No native assistive-technology restriction is bypassed; browser AX/WebKit coverage does not certify VoiceOver/NVDA/JAWS speech or physical devices.

## 10. Cinematic regression and validation

All **13 existing suite commands pass** on the restored production build; see [command statuses](qa/direct-anchor-performance/after/regression/commands.json). The regression runner isolates outputs from historical evidence and removes temporary adapters. The earlier F03 narrative fixture remains the qualified project-integrity version.

| Validation | Result |
| --- | --- |
| `npx eslint src/` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build:webpack` | Pass |
| `git diff --check` | Pass |
| About content / motion | 4 content tests; 20 holds, 76 transition/boundary and 65 viewport samples; reverse, reader, direct entry and cleanup assertions pass |
| ScrollDiscovery | 7 viewports / 25 behavior cases pass, including history and persisted-page lifecycle cases |
| F02 | 7 keyboard/AX/reading/reduced/no-JavaScript cases pass |
| F03/F04 | 7 status/evidence/footer cases pass |
| F05 | 319 Hero states across 11 sizes; no clipped meaningful text; 20 Dayflow labels across 16 states and Contact checks retained |
| SEO / branding | 19 cases pass; approved origin/icons/OG/crawlers/Person/404 preserved |
| Project integrity / content bounds | Six useful Work links, two honest availability statuses and existing qualified narrative; all eight content viewport cases pass |
| Chrome production matrix | 8 sizes / **801 states** pass |
| WebKit production matrix | 3 sizes / **318 states** pass |
| Supplementary production | All six reverse signatures, graphics fallback and WebKit anchor/reader/reduced checks pass |
| Isolated real wheel input | **9 regions / 108 states**: slow, fast and reverse at Hero, all six projects, About and Contact; actual starting targets asserted |
| Additional focused checks | 135 settled direct/refresh/history landings and 9 graphics capability cases pass |
| Rapid Back interruption diagnostic | **3/3 failures** on unchanged source: hash returns to Work, old smooth-scroll target returns the viewport to Contact; retained as an open functional finding |

Chrome covers **360×800, 390×844, 430×932, 768×1024, 1280×720, 1280×800, 1440×900 and 1728×1117**. WebKit covers 390×844, 1280×720 and 1440×900. F05 adds 391px, 600px and 767px widths.

Across the **1,119 production states**, there are **zero** page errors, failed requests, loaded broken images, horizontal document overflows, horizontal text candidates or active scrub mismatches. Heights, region/sample counts, scroll positions within 1px, trigger counts and About modes match the preceding validated performance build. See [matrix comparison](qa/direct-anchor-performance/after/matrix-comparison.json) and its [reproduction script](qa/direct-anchor-performance/matrix-compare.py). No hydration error or missing GSAP target was found. The existing Clock/module-type/external-lockfile notices remain.

Current captures of desktop Hero, its identity state, all six Work projects, About, Contact and the two original mobile Hero problem states were visually inspected. Typography, intentional image cropping, cool dark palette and scene geometry are preserved. Screenshots are under [production evidence](qa/direct-anchor-performance/after/regression/production/) and [F05 evidence](qa/direct-anchor-performance/after/regression/f05/). Animated captures are not an entire-frame pixel identity claim. The final [source/Git preservation record](qa/direct-anchor-performance/after/preservation.json) checks all 113 starting files and the index/history boundary.

The first About launch attempted an absent bundled Chromium because `CHROME_PATH` was omitted. That environment failure occurred before application assertions and is retained under [environment-failures](qa/direct-anchor-performance/after/regression/environment-failures/). The complete successful run explicitly uses the installed Chrome binary. No dependency was installed to work around it.

## 11. Remaining limitations

1. Confirmed About/Contact startup CLS remains. Accurate settled navigation does not waive it. No claim is made that all visible movement is harmless or that Chromium's score is an artifact.
2. Two throttled fresh-mobile module-initialization tasks remain. Local emulation, configured latency and diagnostic profiling are not physical-device or field Core Web Vitals acceptance.
3. Timing changes on identical application source, three-run distributions, clipped shift-source rectangles and asynchronous screenshots cannot establish a universal performance improvement, exact perceptual-completion time or GPU/compositor FPS.
4. Prior F02/F05 manual contrast and real assistive-technology acceptance, owner historical records, healthcare version mapping, and public deployment verification of sanitized images remain as documented. No deployment occurred.
5. **Rapid Back during an unfinished Lenis scroll fails in 3/3 focused runs**, despite all settled-history cases passing. Keep this restoration/interruption risk open alongside startup CLS; it is not removed from the report to present an all-green regression result.
6. The existing 120ms refresh debounce and 1,200ms fragment interruption timer remain unchanged; this task introduced no arbitrary scheduling delay. The earlier lifecycle helper's repeated-wheel region labelling limitation also remains excluded from latency conclusions; the isolated nine-region wheel suite is the behavioral check.

## 12. F10 closure recommendation

**Keep F10 open.** About/Contact startup CLS, the two fresh-mobile tasks and the newly reproduced rapid-history limitation remain. The investigation establishes a reproducible hydration/fragment geometry problem and distinguishes the two recurring mobile tasks from diagnostic hydration/GSAP/layout work. It rejects narrow changes that do not remove the score and preserves the complete cinematic experience. The preceding unsupported-WebGL/buffer-allocation improvements remain valid, but neither this report nor a clean settled-anchor test is a full performance or release sign-off.

No commit or deployment was performed. No application fix is claimed where the measurements do not support one.
