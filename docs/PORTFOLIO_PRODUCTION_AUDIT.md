# Portfolio production-readiness audit

**Project:** Anirudh Shashikumar · **Audit date:** October 25, 2026, IST
**Scope:** current checkout, fresh Next.js production build, local production server, and read-only inspection of publicly linked destinations.
**Application changes:** none. No design, copy, animation, dependency or production configuration was changed. Audit code and evidence were added separately.

## 1. Executive summary

**Hold an unrestricted public release until the P1 findings are resolved.** The cinematic scroll implementation is substantially sound in the tested environments. Its successful build does not establish production readiness: keyboard/accessibility barriers, a public-demo discrepancy, an AA contrast failure and unresolved dependency advisories remain.

Positive evidence:

- Fresh webpack production build, ESLint and TypeScript pass.
- Four existing content tests, the existing rendered About regression suite, and all 25 scroll-discovery behavior cases pass.
- The complete Hero → six Work projects → About → Contact journey was sampled at all eight requested sizes in Chrome: **802 recorded states**. WebKit adds **318 states** at three sizes. Neither matrix recorded an application page error or document horizontal overflow.
- All six projects reconstruct matching sampled DOM styles after forward/reverse travel. About's existing suite also verifies reverse signatures, twenty resolved reading states and 76 boundary samples.
- Direct anchors, history, refresh restoration, native wheel/touch/keyboard input, reader mode and live reduced-motion changes were exercised. The supplementary scroll cue behaves as specified.
- ScrollTrigger counts return to 41 after repeated desktop/mobile resizing; reduced motion leaves zero triggers. Five traversal cycles show stable DOM/listener counts.
- Hero WebGL draw calls stop offscreen. A forced no-WebGL environment retains the headline and primary navigation without a page error.

Important limits: these are local laboratory results, not field Core Web Vitals, real-device certification, Safari application testing or assistive-technology certification. Firefox could not initialize on this host. The target production domain, hosting runtime and deployment policies were not supplied.

## 2. Release readiness verdict

| Area | Verdict |
| --- | --- |
| Build/type/lint integrity | Pass on this checkout |
| Core scroll ownership and reconstruction | Pass in sampled Chrome/WebKit states |
| Keyboard and accessibility | **P1 unresolved** |
| Dependency release baseline | **P1 unresolved; exploitability is conditional** |
| Project/demo consistency | **P1 unresolved for MediFit** |
| Responsive presentation | Mostly sound; mobile Hero clipping remains |
| SEO/public assets | Incomplete; prior icon 404s remain |
| Performance | Encouraging local measurements; limited mobile/device confidence |
| Final deployment sign-off | **Not approved by this audit** |

Priority meanings: **P0** confirmed release blocker; **P1** important before launch; **P2** recommended improvement; **P3** optional polish. Package-advisory severity and application priority are different classifications.

Release criteria: close F01–F04, review the P2 items with the owner, repeat regressions after fixes, and verify the actual HTTPS deployment and remaining browser/device coverage. Architectural and visual remedies below are recommendations, not implemented changes.

## 3. Critical blockers — P0

**No confirmed P0 application exploit, complete scroll lock, crash or inaccessible entire page was demonstrated.** This is not proof that no P0 exists. In particular, no exploit payloads were run, the production host is unknown, and Firefox/physical devices/real screen readers are unverified. The P1 findings are sufficient to withhold an unconditional launch recommendation.

## 4. High-priority issues — P1

### F01 — Unresolved production dependency advisories

- **Evidence:** `package.json:18` pins Next.js **16.3.5**; the lockfile resolves Sharp **0.35.4** and source-map-js **1.2.1**. `npm audit --json` reports **1 critical + 4 high** vulnerable packages overall. With development dependencies omitted, it reports **1 critical + 2 high**. Raw advisory records and installed paths are retained in [npm-audit.json](qa/production/npm-audit.json), [npm-audit-production.json](qa/production/npm-audit-production.json) and [dependency-tree.txt](qa/production/dependency-tree.txt).
- **Impact:** deploying an outdated framework/image-processing baseline leaves known advisories unresolved. The actual attack surface depends on application features, image inputs and the deployment runtime; the npm severity count is not evidence that this portfolio is exploitable.
- **Reproduction:** run `npm audit --omit=dev --json` against the current lockfile and inspect the installed versions.
- **Likely root cause:** pinned framework version and older transitive resolutions have not received subsequent security patches.
- **Recommended fix:** upgrade to a maintainer-supported patched Next.js release and compatible eslint-config-next; ensure Sharp is at least 0.35.5; update affected transitive packages using a reviewed lockfile change. npm currently suggests Next.js 16.4.3. Re-read that release's bundled guides and rerun the full visual/scroll suite. Do not apply a blanket forced audit fix.
- **Risk of fixing:** **medium**; a framework/image-processing upgrade can change runtime, image output or build behavior. This exceeds a trivial audit-only correction and was not applied.

Applicability review of primary advisories:

| Advisory | Conditions and this checkout |
| --- | --- |
| [Next image optimization / SVG](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [Sharp/librsvg](https://github.com/advisories/GHSA-wq5f-xc86-pv6w) | Describe possible RCE under specific glibc Linux conditions. The local audit host is macOS, and portfolio images are local JPEGs. No attacker-controlled upload route was found; deployment runtime and complete upstream reachability were not established. Patch the baseline rather than treating macOS testing as a production exemption. |
| [Node ImageResponse](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j) | Requires attacker-controlled SVG content/attributes/styles passed into Node `next/og`. No ImageResponse route or import exists in this checkout. |
| [Image optimizer SSRF](https://github.com/advisories/GHSA-cjq9-62q9-8jv4) | The maintainer explicitly excludes apps without `images.remotePatterns`; this config has none. |
| [Typed-array `use cache` RCE](https://github.com/advisories/GHSA-673q-mjm6-r5xr) | No `use cache` functions or Cache Components configuration was found. The maintainer nevertheless advises upgrading. |
| [Server Action DoS](https://github.com/advisories/GHSA-p3m5-59mp-jv5r) | No Server Actions were found; the maintainer states apps without them are not vulnerable to this advisory. |

The development-only brace-expansion and Zod findings, and production-tree source-map-js finding, remain package findings requiring triage. No application path accepting hostile brace patterns, indexed source maps or constrained Zod collections was demonstrated.

### F02 — Cinematic visibility hides meaningful controls and headings from keyboard/AX access

- **Evidence:** at 1440×900, repeated Tab navigation reaches the Dayflow action, then About's reader control, then the footer, skipping the hidden MediTwin/MediFit and Contact actions. Activating the primary Contact anchor and pressing Tab goes to **BACK TO TOP**, not email. Chrome's accessibility tree after Hero's intro contains SatQuery/Gesture Globe/AlgaeOS project headings, but omits Dayflow/MediTwin/MediFit; all six appear in reduced motion. See [lifecycle.json](qa/production/lifecycle.json) and [targeted.json](qa/production/targeted.json).
- **Impact:** normal Tab or heading navigation cannot reliably discover important project content and the contact action without manually advancing the cinematic scroll state. Page Down remains usable, but it is not an equivalent semantic/focus experience.
- **Reproduction:** fresh desktop load with normal motion; Tab through primary navigation and project controls without wheel input. Separately focus Contact, activate it, wait for anchor settlement, then Tab. Compare project heading names in the Chrome AX tree before and after enabling reduced motion.
- **Likely root cause:** real content uses `autoAlpha: 0` / `visibility: hidden` until scroll progress reveals it. Sources include `DayflowMotion.tsx:33`, `MediTwinMotion.tsx`, `MediFitMotion.tsx`, `Contact.tsx:87` and `Contact.module.css:145`. Hidden elements are omitted from focus and AX traversal.
- **Recommended fix:** keep meaningful semantic content and essential actions available independently of decorative timeline visibility. About's complete semantic article is a useful established pattern. Design a consistent keyboard/AT route for Work and Contact, and ensure focus cannot target an invisible narrative state. Preserve visual staging without hiding the only usable action.
- **Risk of fixing:** **medium/high**; this touches section ownership and semantic presentation. Agree on the approach before implementation and test with VoiceOver/NVDA afterward.

### F03 — MediFit's linked public application presents a different product scope

- **Evidence:** the featured section describes digital-twin-inspired health monitoring and personalized fitness plans (`MediFitFeature.tsx`). Its live URL returns 200 and renders **“AI-powered medication safety & health analysis”**, followed by a Gemini API-key entry gate. See [demo-render.json](qa/production/demo-render.json), entry for `https://medi-fit-navy.vercel.app/`.
- **Impact:** visitors following LIVE APP cannot immediately corroborate the featured product description and are asked for a personal API key. This creates a credibility and verification gap. It does **not** establish that the URL is owned by someone else or that historical project claims are false.
- **Reproduction:** open the MediFit LIVE APP link in a clean browser without entering credentials or an API key.
- **Likely root cause:** deployment content may have changed, the wrong deployment may be linked, or the portfolio may describe an earlier version. The audit cannot choose between those explanations.
- **Recommended fix:** confirm the intended deployed version and correct the destination or owner-approved historical description. Provide a suitable read-only demonstration if needed. Do not ask audit reviewers to supply secrets merely to verify the advertised scope.
- **Risk of fixing:** **low** for a confirmed URL correction; **medium** for product/copy changes. No URL or content was invented or changed.

### F04 — Footer copy fails normal-text AA contrast

- **Evidence:** axe-core reports **4.1:1**, below 4.5:1, for the three footer text paragraphs. The computed colors are foreground `#60757e`, background `#070a0c`, at **8.8px**. This repeats across Chrome's eight viewport runs and WebKit's three. Source: `SiteFooter.module.css:6,15`; detailed nodes are in the matrix JSON files.
- **Impact:** actual small informational text is harder to read for visitors with low vision. The site cannot be described as having passed a complete AA audit.
- **Reproduction:** inspect the footer or run axe color-contrast against the production page.
- **Likely root cause:** a quiet visual token was applied to small content text without sufficient luminance contrast.
- **Recommended fix:** choose a slightly lighter cool-gray text token that meets at least 4.5:1 against the existing surface; verify the rendered result without changing the visual identity.
- **Risk of fixing:** **low** technically, but it is a visual adjustment and is reported for review before implementation.

## 5. Medium-priority issues — P2

### F05 — Mobile Hero text is cropped in sampled narrative states

- **Evidence:** at 430×932, the identity composition reaches approximately x=-3.8…433.8 in an initial range measurement; the focused screenshot visibly trims the long surname at the viewport edge. At 390×844, the Hero evidence caption reaches x≈407.6 in a 390px viewport. See [identity capture](qa/production/target-430x932-hero-0.8.jpg) and [evidence capture](qa/production/target-390x844-hero-0.95.jpg). Document overflow remains zero because the stage clips content.
- **Impact:** the name/caption loses readable characters even though no horizontal scrollbar appears.
- **Reproduction:** use those viewport sizes and scrub Hero around 80% and 95% of its travel respectively.
- **Likely root cause:** mobile name sizing/tracking (`Hero.module.css:547`) and the oblique evidence plane/caption exceed the clipped stage bounds.
- **Recommended fix:** fit the long name within the usable mobile width and constrain/wrap the caption independently of the montage's intentional image cropping. Review the cinematic states before changing geometry.
- **Risk of fixing:** **medium**; requires visual approval and regression through intermediate Hero states.

### F06 — Prior icon 404s remain; public metadata is incomplete

- **Evidence:** production requests for **`/favicon.ico` and `/apple-touch-icon.png` both return 404**. `/robots.txt` and `/sitemap.xml` also return 404. The generated head contains title, description, charset and viewport, but no canonical, Open Graph, Twitter/X or icon declarations. `src/app/layout.tsx:19` defines only title/description. See [links-assets.json](qa/production/links-assets.json) and the head inventory in lifecycle.json.
- **Impact:** browser/home-screen identity and social previews are unfinished; canonical/discovery configuration is not explicit. Missing robots.txt does not by itself block crawling, and a single-page site is not automatically unindexable without a sitemap.
- **Reproduction:** GET those routes and inspect the production HTML head.
- **Likely root cause:** no corresponding metadata convention files/assets or metadata fields exist.
- **Recommended fix:** supply approved brand icons, share imagery and canonical origin; use this Next version's documented metadata, robots and sitemap conventions. Confirm the actual domain before generating absolute URLs.
- **Risk of fixing:** **low** for agreed metadata; **medium** for new visual assets requiring owner approval. Nothing was fabricated for this audit.

### F07 — Two primary project CTAs lead only to “coming soon”

- **Evidence:** `AlgaeOSFeature.tsx:180` points EXPLORE ALGAEOS to `#algaeos-detail`; `MediTwinFeature.tsx:229` points VIEW MEDITWIN to `#meditwin-detail`. Their destinations contain only the respective “Full … case study coming soon” paragraph. All six projects contain case-study placeholders. No per-project repository links are rendered.
- **Impact:** the primary action promises more evidence than its destination supplies, although the surrounding project stories and certificate links do work.
- **Reproduction:** activate these two CTAs; inspect their fragment destinations.
- **Likely root cause:** unfinished case studies were exposed through production-style action labels.
- **Recommended fix:** agree whether to label the destination's limited availability, route to existing approved evidence, or finish the intended destination. Do not invent demo/repository URLs.
- **Risk of fixing:** **low** for approved labels/links; **high** if interpreted as implementing new case studies. No feature was added.

### F08 — Several quantitative claims lack reproducible supporting records

- **Evidence:** Dayflow displays “68 PASSING” tests and current lint/type/build status without a linked run, source revision or date. The available certificates support the displayed rankings, but not every team count, competitor count or engineering claim. AlgaeOS's supplied infographic repeats its reported measurements; raw logs/calibration and academic-credit records are absent. See the project review in section 11.
- **Impact:** reviewers cannot independently reproduce those specific claims from the public portfolio. Missing evidence is not proof a claim is false.
- **Reproduction:** follow the rendered evidence links and compare them with Dayflow's verification block, the hackathon metrics and AlgaeOS observations.
- **Likely root cause:** project-reported results are presented without a traceable dated record for every assertion.
- **Recommended fix:** link approved source/test-run revisions or supporting records, date snapshots, and retain appropriate qualifiers. Keep “college shortlist for project submission” attached to the SIH claim; do not imply a national finalist/award result.
- **Risk of fixing:** **low/medium**, involving owner-approved evidence and wording. No claims were rewritten.

### F09 — Contact has no usable normal-height no-JavaScript fallback

- **Evidence:** with JavaScript disabled at normal desktop height, all six rendered Contact links across its two presentations are visually unavailable. `.actionLayer` starts hidden, while `.editorial` is `display:none` except reduced-motion/short-height media rules (`Contact.module.css:145,278,315`). Recorded in [zoom.json](qa/production/zoom.json).
- **Impact:** an unavailable/blocked client bundle leaves visitors without the section's contact controls. WebGL failure alone is handled successfully; this is the separate JavaScript-unavailable case.
- **Reproduction:** disable JavaScript and open/scroll to Contact at 1440×900 with normal motion preference.
- **Likely root cause:** CSS assumes cinematic enhancement will reveal actions, instead of making complete content the baseline.
- **Recommended fix:** provide an accessible CSS/HTML baseline and scope the hidden cinematic state to successful enhancement, following the established About approach.
- **Risk of fixing:** **medium**; changes progressive-enhancement ownership and needs visual/anchor regression testing.

### F10 — Initial nonessential graphics code is loaded across capability modes

- **Evidence:** HTML-referenced JavaScript totals **844,075 raw bytes / 264,027 gzip-estimated bytes**. The browser actually fetches **467,960 encoded script bytes** by the six-second observation point in both desktop and mobile samples, including dynamic graphics chunks. Hero mounts `IntelligenceField` independently of viewport readiness; the inner Canvas changes to demand rendering for reduced/offscreen modes. Three 50ms+ tasks occur in each 4×-CPU mobile load, with a maximum of 110ms. See bundles.json and performance.json.
- **Impact:** there is avoidable startup/network work to investigate for visitors who do not need active 3D. The measurements do not demonstrate a severe loading or interaction failure, and the raw original JPEG directory size is not the initial network payload.
- **Reproduction:** cold browser context, cache disabled; inspect fetched scripts during initial Hero and direct About/reduced-motion entry. Inspect `Hero.tsx:20,487` and `IntelligenceField.tsx:66`.
- **Likely root cause:** dynamic import splits the code but the component is mounted promptly regardless of visual need.
- **Recommended fix:** evaluate visibility/capability-aware loading while preserving an approved static composition. Establish a measured bundle/interaction budget before deciding how much complexity is worthwhile.
- **Risk of fixing:** **medium**; changing graphics mounting can alter first-paint appearance, context lifetime or hydration. No loading policy was changed.

### F11 — A public original photograph retains GPS coordinates

- **Evidence:** `public/projects/medifit/push-pull-commit-team-event.jpg` contains an EXIF GPS IFD with 15 fields, including latitude and longitude with nonzero coordinate components. The original is publicly addressable, even though rendered Next/Image derivatives need not retain those fields. See [gps-metadata-summary.json](qa/production/gps-metadata-summary.json) and [image-metadata.json](qa/production/image-metadata.json). Coordinates themselves were not copied into audit logs or this report.
- **Impact:** the original photograph exposes more location detail than the visible page requires. Whether that location is sensitive or intentionally public was not determined; no claim is made that it identifies a private residence.
- **Reproduction:** inspect the original JPEG's EXIF GPS field presence locally, or inspect its publicly served original. Do not publish the coordinate values in a bug report.
- **Likely root cause:** a camera original was published without metadata sanitization.
- **Recommended fix:** confirm intended publication and remove unnecessary GPS metadata from the public original using a lossless metadata operation. Preserve orientation, color profile and image pixels; check other originals before launch.
- **Risk of fixing:** **low** with a verified lossless operation; broader metadata removal can affect orientation/color if done carelessly. The original was not changed during this audit. The metadata scan covered 18 JPEGs, not the unused HEIC's complete metadata.

## 6. Optional polish — P3

### F12 — Upstream graphics deprecation and unused dependency

- **Evidence:** Chrome/WebKit log `THREE.Clock … deprecated … THREE.Timer`. Source has no `@react-three/drei` imports although the package remains in dependencies. No page error was associated with the warning.
- **Impact:** future compatibility/install maintenance, not a demonstrated rendering failure. An unused package is not automatically included in the client bundle.
- **Reproduction:** inspect the production browser console and run `rg '@react-three/drei' src`.
- **Likely root cause:** dependency-version evolution and a package retained after an earlier implementation.
- **Recommended fix:** review the supported R3F/Three pairing and unused dependencies during the next maintenance update; do not patch generated node_modules or assume the app alone constructs the deprecated clock.
- **Risk of fixing:** **low** for removing a confirmed unused package; **medium** for graphics library upgrades.

### F13 — Structured data and branded 404 navigation are optional completion work

- **Evidence:** no JSON-LD script is emitted. An unknown route returns the correct 404 status, but uses the framework's generic page rather than portfolio navigation.
- **Impact:** polish and machine-readable profile context, not proof of broken indexing or a release-blocking 404 problem.
- **Reproduction:** inspect the home HTML and GET `/does-not-exist-production-audit`.
- **Likely root cause:** optional metadata/error-page customization was not implemented.
- **Recommended fix:** consider accurate Person structured data and a small approved 404/home route once the canonical domain and public identity fields are confirmed.
- **Risk of fixing:** **low**, subject to content/design approval. No ranking benefit is promised.

## 7. Performance measurements and methodology

Environment: macOS/Darwin arm64, **Apple M5**, **Node v24.14.1**, actual installed **Chrome 155.0.8059.85**, Next.js 16.3.5 webpack production output served on `127.0.0.1:3000`. Chrome runs headless through Playwright. Server/filesystem/image caches are warm; each cold-load sample uses a new browser context with browser cache disabled. No other audit browser suite ran during the measured performance passes.

Three loads per profile were observed through six seconds after the load event:

| Measurement | Desktop, 1440×900, local | Mobile emulation, 390×844 |
| --- | --- | --- |
| CPU/network policy | Unthrottled local | CDP 4× CPU; configured 150ms latency, 200,000 B/s down, 93,750 B/s up |
| Observed LCP candidate | 52 / 60 / 72ms; median **60ms** | 984 / 992 / 992ms; median **992ms** |
| Initial sampled CLS | **0** in all three | **0** in all three |
| Observed load-event completion | 73.7–81.3ms | 2,364.1–2,373.9ms |
| Long tasks during observation | 0 | 3 per load; longest **110ms** |
| Encoded script body bytes | **467,960** | **467,960** |
| Initial image resource bytes | **67,278** | **18,130** |
| Font resource bytes | **68,936** across three WOFF2 resources | Same total |

**Interpretation limits:** these exceptionally low local LCP values are not a public-site speed score. The candidate is Hero's “WHAT I WANT” span; a deliberate opening veil/timeline still controls perceived presentation. The observed TTFB remains about 3.5–5.7ms even in the configured network profile, so this is not a faithful remote mobile network reproduction. Neither the opening's perceptual completion nor field p75 LCP was measured. No field INP value is claimed.

Other measurements:

- **Interaction:** one reader-mode click produced a 48ms Event Timing duration, with input delay up to approximately 2.6ms. Pointerdown/up/click share one interaction ID; these are not three independent samples or a representative INP distribution.
- **Native wheel responsiveness:** separate samples delivered +120 wheel units in Hero, Work, About and Contact. The first document scroll event followed in approximately **15.8–17.2ms**; the settled movement was 119px after 400ms. This small lab sample does not certify touchpad hardware latency.
- **Scroll callback consistency:** five 180-frame forward/reverse sweeps cover Hero, SatQuery, AlgaeOS, About and Contact. Median callback interval is approximately 16.7ms and p95 16.7–16.8ms. The first pass had **3/900 intervals above 33.3ms**, maximum **133.4ms**. The repeated pass had **0/900**, maximum 16.8ms. Neither measured callback window recorded a long task. Both outcomes are retained; compositor FPS and GPU execution time were not measured.
- **Extended synthetic CLS:** the repeated programmatic sweep records a maximum layout-shift session score of approximately **0.05886**, with Hero typography sources. Programmatic seeks and animated letter spacing affect this result; it is not a field CLS claim. Initial-load CLS zero should not be generalized to the entire experience.
- **Offscreen rendering:** per 1,000ms observation, Hero records **840 WebGL draw calls** while active, and **zero** while in Work, About or Contact. The settled kinetic grid records zero clears in these idle samples. Draw calls are not frame counts.
- **Memory/lifecycle:** after explicit GC in five traversal cycles, JS used heap ranges **18,241,724–18,379,456 bytes**, with **7,226 DOM nodes, 443 event listeners, one document and 41 ScrollTriggers** unchanged. This does not establish a leak; neither a long soak nor GPU-memory measurement was performed.
- **Resources:** portfolio graphics use declarative geometries/materials rather than large photograph textures. R3F manages their normal lifecycle; no application opt-out from disposal was found. Automatic disposal was source-reviewed, not certified with a GPU allocation profiler. Public originals total about 26MB, including several multi-megabyte photos, but sampled images use optimized Next/Image requests with intrinsic dimensions; all loaded sampled images had nonzero natural widths.

Raw evidence: [performance.json](qa/production/performance.json), [first-sweep summary](qa/production/performance-first-scroll-summary.json), [bundles.json](qa/production/bundles.json), [extra.json](qa/production/extra.json), [lifecycle.json](qa/production/lifecycle.json).

## 8. Responsive and complete-experience findings

Every row covers Hero, each of the six Work projects, About, Contact, forward/reverse handoffs, image state and navigation geometry. Sample counts include transition probes; they are not unique screenshots or full continuous-frame recordings.

| Chrome viewport | Recorded states | Document horizontal overflow | Main observation |
| --- | ---: | --- | --- |
| 360×800 | 82 | 0px | Compact navigation and native project flow; no confirmed clipping in sampled text |
| 390×844 | 81 | 0px | Hero evidence caption cropped in a later state; F05 |
| 430×932 | 80 | 0px | Hero identity/evidence edge clipping; F05 |
| 768×1024 | 90 | 0px | Project and About flow remain readable |
| 1280×720 | 122 | 0px | About uses editorial mode; dense Work content remains available |
| 1280×800 | 116 | 0px | Cinematic About; existing resolved-state suite passes |
| 1440×900 | 117 | 0px | Normal cinematic layout; keyboard/AX limitation F02 |
| 1728×1117 | 114 | 0px | Wide composition and cinematic About sampled |

Screenshot overview sheets are named `qa/production/overview-WIDTHxHEIGHT.jpg`; original viewport captures and focused clipping screenshots are alongside them. They were visually inspected.

No sampled section gap, competing About headline or blank About boundary was found by the existing regression assertions. The six Work project DOM signatures match after forward/reverse travel. No scroll lock or sustained queue of old visual states was observed with native wheel input, synthetic sweeps or anchor jumps. Quiet Hero/Contact holding states are intentional and were not labeled “blank” merely because they contain little text.

Measurement false positives were investigated rather than promoted to findings:

- Initial range checks counted AlgaeOS's visually clipped `sr-only` “opens in a new tab” text as visible overflow. Leaf-text checks and screenshots show the visible artifact link fits; there is no AlgaeOS horizontal-overflow defect from that candidate.
- AlgaeOS has an intentional repeated/yoyo sensor tween. Comparing its current cycle `progress()` with ScrollTrigger progress creates false mismatches. The corrected comparison uses `totalProgress()`; focused checks and reverse signatures match.
- Content naturally passing under the fixed header during arbitrary scrolling is not automatically an obscured-focus failure. Actual focused controls were separately inspected.

**Reflow/zoom proxies:** CSS viewports 720×450 and 360×225 model the available layout area of 200% and 400% zoom on a 1440×900 window. Both have zero document horizontal overflow in the sampled sections. These are explicitly **viewport-reduction proxies**, not browser UI zoom tests. At 360×225 the wrapped fixed header occupies a substantial fraction of the view; real browser zoom and keyboard focus need a final manual check. See [zoom.json](qa/production/zoom.json).

## 9. Accessibility and scroll-discovery findings

Completed checks:

- Native Tab order through available controls; visible 2px focus outlines and 44px primary-navigation targets. No focus trap was observed. Browser focus leaving the document at the end of its Tab sequence is normal.
- DOM headings/landmarks, duplicate IDs, image alt attributes, link labels, and Chrome AX heading names. No duplicate IDs or missing alt attributes were found in the inventory. This does not prove every alt description is ideal.
- axe-core WCAG A/AA/2.1 AA-tagged checks at every matrix size, reader mode, reduced motion and selected Work/Contact states. Confirmed persistent contrast defect: F04. Dimmed decorative rail numbers and offscreen/transitional Dayflow nodes also generate contrast candidates; these were not all declared independent confirmed AA failures.
- About's semantic article remains available to AX even when the cinematic presentation is decorative. Reader mode preserves the current chapter/focus in the existing M09 regression test. Live reduced motion removes story triggers and the sampled running animations; WebKit also returns zero triggers.
- The no-WebGL branch retains the resolved Hero and four navigation links, with no page error. The no-JavaScript Contact limitation remains F09.

**Scroll discovery:** existing suite passes seven cue viewport checks and **25 behavior cases**. The implementation waits 2,800ms on eligible initial Hero entry, uses a 450ms entrance and 160ms dismissal, and keeps document-lifetime memory. Wheel/trackpad, touch, native scroll, keyboard and control interaction suppress it. Direct Work/About/Contact, refresh restoration, hash/document history, menu/dialog semantics, hidden-tab lifecycle, BFCache signals, reader mode, reduced motion, orientation and safe-area arithmetic are covered. Contextual reminders are intentionally absent. It is informational, `aria-hidden`, nonfocusable and pointer-transparent; no new Lenis instance, RAF or ScrollTrigger is added.

Visibility/BFCache signals and hardware insets in that suite are simulated. Touch scrolling is Chromium input automation, not a real phone. Menu/dialog fixtures test suppression semantics; the portfolio itself has no existing collapsible navigation menu.

**Not performed:** VoiceOver, NVDA, JAWS, real screen-reader gesture navigation or a formal AA certification. F02 is demonstrated by keyboard/AX inspection, not by claiming those AT products were tested.

## 10. Browser compatibility

| Browser/environment | Actual coverage | Result/limit |
| --- | --- | --- |
| Installed Chrome 155.0.8059.85 | Headless automation of the installed browser; all eight viewport sizes, behavior suites and metrics | No application page errors; findings above remain |
| Playwright WebKit 26.5 | Engine automation at 390×844, 1280×720 and 1440×900; 318 states; direct Work/About/Contact, reader and reduced motion | No application page errors; this is **not** Safari app or iOS Safari certification |
| Playwright Firefox 153.0 | Downloaded and attempted; bounded startup diagnostic | **Unverified.** Launch times out with `sandbox_extension_issue_file_to_process … Operation not permitted` and `RenderCompositorSWGL failed mapping default framebuffer`. Failure occurs before loading the app; not classified as a portfolio defect. See firefox-smoke.json/log. |
| Safari application | Present on host, not driven in this audit | Not tested |
| Physical iOS/Android, real notches/browser chrome, low-end GPU | None | Not tested |

WebKit/Firefox binaries and axe-core were installed only into temporary audit folders. Application dependencies were not changed.

## 11. Content and link findings

| Project | Review and evidence | Verification limit |
| --- | --- | --- |
| **01 SatQuery AI** | Name and public demo landing agree. HTTP 200, “SatQuery AI” title, rendered landing with no page error. Portfolio explains single-image, optical/SAR and bi-temporal workflows. | Models/accuracy/backend inference were not exercised. SIH 2026 label/problem code is present; About qualifies the result as a college shortlist for project submission. No national award was verified or inferred. |
| **02 Gesture Globe** | Name and public demo agree. HTTP 200; rendered application reaches a camera-permission explanation. Supplied project captures show landmark/spatial interactions. | Camera access was not granted; gesture performance was not tested. Headless permission denial is expected, not a broken-link finding. |
| **03 AlgaeOS** | Prototype, hardware, dashboard and infographic assets load. Observations are explicitly qualified as project-reported, not independently certified. The dashboard caption acknowledges its offline indicator. | The infographic repeats the >40% / ~1500→<900ppm narrative; it is not an independent measurement record. Cost, calibration, academic credit and test methodology were not verified. Primary CTA is a placeholder (F07). |
| **04 Dayflow** | HTTP 200 redirects to a rendered `/login` page. Public labels match an HR product. Portfolio openly says authenticated E2E, RLS, migrations, mobile QA and WCAG audit are still in progress. | No sign-in or private workflows tested. “68 passing” and other status labels are unverified snapshots without linked run/revision (F08). An aborted RSC navigation request during redirect was observed without a page error. |
| **05 MediTwin** | Supplied certificate visibly awards **Code Blue first place in InCSEption 2.0**, an **eight-hour** hackathon at BMSIT&M. Team/award image loads. | Certificate alone does not prove ~130 teams, all project functionality or the association between every technical claim and that award. No public demo/repository is linked; CTA is a placeholder. |
| **06 MediFit** | Certificate visibly contains **Third Place**, Anirudh, PUSH PULL COMMIT, and **4 May 2026**. Linked application renders with HTTP 200. | Public entry describes medication safety/health analysis, creating F03. The certificate does not independently establish the 50+ teams, team size, build duration or full-stack functionality. No API key was supplied. |

Additional supplied evidence was visually read:

- Presidency School certificate: first position in an HTML website competition, class 8B, dated **02/12/2020**. This supports the broad 2020 origin/ranking claim; no issuer verification was performed.
- Google/Coursera certificate: **Google AI**, seven courses, Anirudh B Shashikumar, dated **August 7, 2026**. This supports the displayed year/course count. The issuer's online verification was not independently completed.
- Sports placements and the AlgaeOS 10/10 credit claim have no supporting institutional record in this checkout; treated as owner assertions, not disproved claims.

Local certificate/original links tested return 200. GitHub's profile returns 200. LinkedIn returns **429** to the automated request, so its validity is **inconclusive**, not marked broken. The email is a syntactically valid `mailto:` link; no email was sent and deliverability was not tested. All rendered `_blank` links include `noreferrer` or `noopener noreferrer`.

External demos were only opened read-only: no login, account creation, model query, form submission, camera permission or personal API key. HTTP 200/rendering is not a certification of those applications' functionality or security.

Evidence: [links-assets.json](qa/production/links-assets.json), [demo-render.json](qa/production/demo-render.json), source project files and supplied public images.

## 12. SEO and public assets

| Check | Actual result |
| --- | --- |
| Home status | 200 |
| Title | “Anirudh Shashikumar — Engineering the Next Era of Intelligence” |
| Description | Present and consistent with portfolio scope |
| Language/viewport | `lang="en"`; width=device-width, initial-scale=1; zoom not disabled |
| Canonical / metadataBase | Absent; production origin not supplied |
| Open Graph / Twitter-X | Absent |
| `/favicon.ico` | **404 — previous issue unresolved** |
| `/apple-touch-icon.png` | **404 — previous issue unresolved** |
| `/robots.txt`, `/sitemap.xml` | 404; no explicit indexing prohibition found in home HTML |
| Structured data | No JSON-LD; optional F13 |
| Unknown URL | Correct 404 response; generic framework page |
| Project/achievement images | Sampled optimized images load with nonzero natural widths; tested original/evidence links return 200 |

Use the installed Next.js metadata documentation when implementing F06. A canonical must use the actual approved public origin, never the local audit URL. No claim is made about Google indexing, social-crawler behavior or an unprovided hosted domain.

## 13. Security and reliability findings

- **Dependencies:** F01 and the raw production/development audit split above. `npm audit` exits 1 because findings remain; this is an actual failing security check, not a build failure.
- **Secrets:** high-confidence credential/private-key patterns found no matches in **98 tracked working-tree text files** or **26 built public JavaScript files**. No application environment-variable references or local `.env` file were found. This is not a full Git-history/entropy scan or proof that every possible secret is absent. Host credentials were not read. See secret-scan.json.
- **Asset metadata:** one of 18 inspected public JPEGs retains GPS latitude/longitude metadata (F11). No coordinate values were published in audit artifacts. The unused HEIC's metadata was not inspected.
- **External navigation:** all `_blank` links have protective rel values. Public app/social links use HTTPS. No outbound messages were sent.
- **Application input surface:** no portfolio API routes, Server Actions, credential form, user upload, eval or dangerouslySetInnerHTML usage was found in `src`. This narrows reviewed advisory conditions; it does not make framework vulnerabilities impossible in general.
- **Local HTTP headers:** default Next.js `x-powered-by` is present. Custom CSP, frame policy, nosniff and referrer policy are absent from the local response and config. This is a deployment-hardening follow-up, not evidence of an exploited vulnerability. HTTPS/HSTS/CDN policy must be verified on the real host; absence of HSTS on localhost HTTP is not a production defect finding.
- **Failure handling:** the graphics error boundary and feature detection keep the main Hero/navigation available without WebGL. Unknown routes return 404. No route-specific app error UI is present; the framework default remains. Complete client-JS failure exposes F09.
- **Lifecycle:** GSAP contexts/media listeners/observers generally have cleanup; measured trigger/listener counts do not accumulate. No independent new smooth-scroll controller or per-scroll React state loop was found. A short stable heap sample cannot rule out a long-term/GPU leak.

No malicious payload, active exploitation, credential entry or intrusive scan was performed. Public hosting TLS, cache invalidation, CDN image policy, production logs and real deployment environment remain outside this local audit.

## 14. Validation results

| Command/check | Actual result | Evidence |
| --- | --- | --- |
| `npx eslint src/` | Pass, no output/warnings | eslint.txt |
| `npx tsc --noEmit` | Pass | typecheck.txt |
| `npm run build:webpack` | Pass; static home and not-found generated | build.txt |
| `git diff --check` | Pass | diff-check.txt |
| `node --test scripts/about-content.test.mjs` | **4 passed** | about-content-tests.txt |
| Existing `about-motion-qa.mjs` assertions | Pass: twenty holds, 76 transitions, reverse/layout/reader/mobile assertions | about-motion-tests.txt; about-regression/after.json |
| Existing `scroll-discovery-qa.mjs` | **7 viewport checks + 25 behavior cases passed**, zero page errors | scroll-discovery-tests.txt |
| New production matrix | 802 Chrome + 318 WebKit states; zero app page errors | matrix-chrome.json; matrix-webkit.json |
| Six project reverse checks | All match sampled DOM signatures | extra.json |
| Audit harness syntax/lint | Pass | `node --check` and ESLint on production-audit.mjs |
| `npm audit --json` | **Fails: 1 critical + 4 high** | npm-audit.json |
| `npm audit --omit=dev --json` | **Fails: 1 critical + 2 high** | npm-audit-production.json |
| Firefox startup | **Unavailable/timeout**, not an application pass | firefox-smoke.json/log |

Warnings retained: Next.js ignores a parent-directory package-lock outside this Git repository; Node's native-TS test emits MODULE_TYPELESS_PACKAGE_JSON; Three emits the Clock deprecation. They did not fail build/content tests. They were not silently relabeled as errors or removed.

The existing About harness was run from a temporary copy with **only its evidence directory redirected** to `docs/qa/production/about-regression`; assertion logic was unchanged. Existing scroll-discovery screenshots were regenerated during its run, then restored to their prior committed versions so this audit does not replace previous evidence. The fresh regression log is retained here.

## 15. Exact files involved and reproducibility

**Added by this audit:**

- `docs/PORTFOLIO_PRODUCTION_AUDIT.md` — this report.
- `scripts/production-audit.mjs` — matrix, keyboard/AX/lifecycle, targeted, zoom, performance and cross-browser audit harness.
- `docs/qa/production/` — JSON results, exact command logs, focused screenshots, viewport overviews and redirected existing-test evidence. These files are not served as application assets.

**Application files inspected, with no edits:**

- `package.json`, `package-lock.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`.
- `src/app/layout.tsx`, `page.tsx`, `globals.css`.
- `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx`, `SiteFooter.module.css`.
- `src/components/system/ViewportProvider.tsx`, `SmoothScroll.tsx`, `ScrollMotion.tsx`, `ScrollMotion.module.css`, `scrollRefresh.ts`, `ScrollDiscovery.tsx`, `ScrollDiscovery.module.css`.
- `src/sections/Hero.tsx`, `Hero.module.css`, `HeroKineticGrid.tsx`; `src/components/three/IntelligenceField.tsx`, `IntelligenceScene.tsx`.
- `src/sections/work/Work.tsx`, `WorkNavigation.tsx`, `WorkNavigation.module.css`, `WorkAssets.tsx`, all six `*Feature.tsx`, their CSS Modules and all six `*Motion.tsx`; supporting workflow/diagram components.
- `src/sections/about/About.tsx`, `AboutStory.tsx`, `AboutGeometry.tsx`, `aboutContent.ts`, `aboutMotion.ts`, `About.module.css`.
- `src/sections/contact/Contact.tsx`, `Contact.module.css`.
- Existing test scripts; supplied project photos, certificate images, infographic and achievement images under `public/`.

The harness accepts `PLAYWRIGHT_MODULE`, `CHROME_PATH`, `PORTFOLIO_QA_URL`, `AXE_MODULE`, `AUDIT_MODE` and `AUDIT_ENGINE`. Run against a fresh production server. Modes used: `matrix` (Chrome/WebKit), `lifecycle`, `targeted`, `zoom`, `performance`, `performance-scroll` and `extra`. `performance-scroll` preserves the cold-load data while repeating the scroll sample; retain first-pass results when comparing runs. Supply a Playwright browser path for WebKit/Firefox. No benchmark should run concurrently with other browser suites.

The local diagnostics query is `?motion-audit=1`. `SmoothScroll.tsx` exposes its GSAP/ScrollTrigger handle only on localhost/127.0.0.1 with that query. The harness does not add diagnostics to the production bundle or change runtime behavior on a public hostname.

## 16. Recommended fix order

1. **F01:** review/patch the framework and image-processing baseline, keeping advisories and deployment conditions explicit. Rebuild and run the full regression suite.
2. **F02:** agree on accessible semantic/control ownership for Work and Contact; implement, then test keyboard plus actual assistive technology. This needs architectural review.
3. **F03:** confirm MediFit's intended public deployment and align the live destination with the featured scope.
4. **F04:** approve the minimal footer contrast adjustment and verify AA contrast afterward.
5. **F05–F07:** correct mobile Hero clipping, provide approved public metadata/icons, and resolve misleading placeholder actions.
6. **F08–F11:** attach dated claim evidence, improve client-JS fallback, evaluate graphics-loading savings against measured budgets, and sanitize unnecessary public photo metadata.
7. **F12–F13:** optional dependency maintenance, structured data and 404 polish.
8. On the actual deployment: verify the approved canonical origin, HTTPS/headers, social previews, assets and cache behavior; repeat representative anchors/scroll restoration. Complete Firefox, actual Safari, physical phone and real zoom/AT checks before claiming that coverage.

The current visual identity and content are preserved. All unresolved findings and testing limitations above remain visible for the release decision.
