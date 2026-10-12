# About motion upgrade — implementation and verification

Completed 2026-10-12. Implementation is ready for review in the local production preview at `http://127.0.0.1:3002/#about`. No deployment or commit was requested or performed.

## Audit and copy preservation

[Pre-implementation audit](about-motion-audit.md): the old direct timeline was sound, but twenty reading states mostly swapped through identical brief fades; diagrams were static and a detached trace scaled between them. Mobile had no motion. Human stillness already worked and was preserved.

`content/about-final-composition.md` is absent from this checkout. The complete available `aboutContent.ts` model was read and preserved without changes. Its eleven movements, all paragraphs, qualified competition claims, certificate assets and normalized ranges remain intact. The complete semantic article still renders on the server.

## Motion architecture and continuity

One `about-story` ScrollTrigger, one GSAP context, one normalized timeline, one CSS sticky stage. Direct `scrub: true`; no extra smoothing, nested pins, queued scroll tweens or new Lenis loop. Cleanup reverts the context and removes the trigger. Existing ViewportProvider and batched refresh scheduling remain the capability/measurement sources.

A persistent SVG uses matching eight-vertex poses, interpolated by GSAP's existing attribute support. A quiet base stroke and restrained accent share the same shape. It moves from Work's aligned vertical axis through a simple baseline, routed learning path, adaptive relationship, vertical product connection, horizontal workflow, compressed lifecycle and temporal baseline. It fully withdraws before M09. Shared learning/process diagrams stay mounted across their adjacent reading states; internal body changes do not reset them. About owns its DOM and never writes to WorkExit or Contact.

Headlines use complete line masks, not character spans. An outgoing headline leaves before the next becomes dominant. Only supporting copy overlaps for about 1% of a reading state; all sampled boundaries retain one visible headline. The first incoming line is partially visible immediately, so entry does not create a blank frame.

## M01–M11 upgrades

| Movement | Implemented motion / interaction |
| --- | --- |
| M01 | Central Work-axis echo; architectural fragments retract; masked invitation; geometry withdraws before the complete solid name. |
| M02 | Elementary heading/form/link marks around the baseline; restrained archive translation/scale; resolved certificate and quiet first-portfolio payoff. Marks withdraw before the archive hold. |
| M03 | One continuous routed path with scroll-linked drawing and sequential discipline emphasis; persistent diagram through the connection statement. |
| M04 | Rigid baseline bends into adaptive relationships; three perception statements gain coordinated emphasis. |
| M05 | Separated MODEL/PRODUCT anchors settle as six intervening responsibilities assemble beside one drawn connection. |
| M06 | Product connection unfolds horizontally; ordered workflow emphasis with stronger ARCHITECTURE and BUILD's AI annotation; quiet process remains below the fragility conclusion. |
| M07 | The same line/workflow compresses spatially into PROBLEM / BUILD / PITCH; restrained existing results beneath it. |
| M08 | Compressed line expands into the 2020–2026 baseline; present learning and the real Google credential resolve; structure retracts before the human chapter. |
| M09 | Technical graphics and HUD entirely absent; gentle entry followed by deliberate stillness. |
| M10 | Stronger staggered four-line masking; complete statement holds as an editorial poster. |
| M11 | Prior statement reduces on exit; invitation and learning/building close; question mark leaves a small central dot echoing Contact's existing signal. |

## Timing and interaction choices

Original unequal ranges are retained: M01 0–.12, M02 .12–.22, M03 .22–.29, M04 .29–.40, M05 .40–.48, M06 .48–.60, M07 .60–.66, M08 .66–.74, M09 .74–.84, M10 .84–.93, M11 .93–1. Twenty internal plates keep the approved dense paragraphs readable.

Ordinary line/copy entry occupies 18% of each plate, exit 16%, leaving approximately 66% for resolved typography. M10 uses 22% entry / 16% exit / 62% hold. M09 uses an 8% exit and longer stillness. Diagram progression is timed across the broader movement; it is intentionally continuous during portions of the reading holds.

Desktop sequence grows from 1100svh to 1600svh, giving 15 viewports of travel rather than 10. This adds reading distance for the existing twenty plates without empty bridge screens. At 900px height, a .04 plate receives 540px of travel and roughly 356px of resolved hold; the purpose movement receives 1215px total. These are scroll distances, not forced reading-time or completion claims.

Pointer interactions were intentionally omitted. Stable certificates and diagrams are easier to inspect; scroll already reveals the relationships. No cursor, pointer listener or nested pointer transform was added.

## Mobile, reduced motion and access

Phones, tablets, coarse pointers and windows below 1100×780 retain natural editorial flow. One IntersectionObserver adds 12px visibility entrances, a small workflow-line expansion and restrained learning-path settling. It unobserves each reading after entry. No mobile sticky stage, sideways motion, hover dependency or continuous animation.

Reduced motion and manual reader mode retain all content and certificates, with no About story trigger or editorial entrance animation. No-JS production HTML remains complete. All decorative staging is aria-hidden; inspection links remain in the semantic article. Reader switching preserves M09 and focuses `about-M09`; a sticky return utility restores a resolved position within that movement without forcing a journey back to the article start. The server content test verifies all eleven readings and six chapters.

## Rendered QA and evidence

Final production browser run: [raw results](qa/about-motion/after.json). Development comparison: [before](qa/about-motion/before.json), [after](qa/about-motion/after-development.json). Reusable harness: `scripts/about-motion-qa.mjs` (an installed Playwright path and Chrome executable can be supplied through environment variables; no application dependency was added).

Captured all twenty desktop reading states at 1440×900, including resolved posters for all eleven movements. Reviewed the movement, transition and viewport overview sheets plus full-size identity, archive, path, model/product, workflow, human, purpose and closing images. Visual review corrected model/product alignment, archival-mark overlap and the fragility body/workflow collision. Reader return was made sticky and verified to preserve M09 in both directions.

Tested every adjacent plate boundary at four positions (76 samples), covering all M01→M02 through M10→M11 transitions and internal readings. Captured Contact entry and reverse travel to M11; sampled WorkExit→About forward/reverse with zero physical gap between sections.

All twenty resolved states were compared forward and reverse using text/diagram transforms, opacity, visibility and path geometry: matching states. Arbitrary .14→.79, .235→.98 and other jumps reconstruct directly. Native wheel inputs of 24, 80, 160 and 600px, direction reversals, instant scrollbar-equivalent seeks, direct `#about`, reader toggles and live reduced-motion changes were exercised. Physical scrollbar dragging was not performed.

| Viewport actually inspected | About mode | Verification |
| --- | --- | --- |
| 360×800 | Editorial | Complete article width bounds and screenshot. |
| 390×844 | Editorial | Width bounds; additional touch-capability context and origin/path/workflow/human/purpose/closing captures. |
| 430×932 | Editorial | Complete article width bounds and screenshot. |
| 768×1024 | Editorial | Complete article width bounds and screenshot. |
| 1280×720 | Editorial | Short-window fallback and complete article bounds. |
| 1280×800 | Cinematic | All twenty resolved states; title/body/diagram bounds and collision checks. |
| 1440×900 | Cinematic | All twenty states, 76 boundary samples, reverse/jump/wheel tests, reading modes and Contact handoff. |
| 1728×1117 | Cinematic | All twenty resolved states and wide composition. |

No horizontal overflow, blank sampled boundary, competing sampled headline, resolved text/diagram collision or application page error was found. This is Chrome viewport/capability emulation, not physical-device certification.

## Performance findings

Comparable 240-frame forward/reverse sweeps were captured before/after in the same local Chrome development setup. Median callback interval stayed about 16.7ms, p95 about 16.7–16.8ms. Baseline had four intervals above 33ms; the post-upgrade development sweep had none. Neither sweep recorded a long task. This is a small synthetic sample, not a statistically established speed improvement or a guaranteed FPS measurement.

The final production sweep also recorded about 16.7ms median and 16.8ms p95, no intervals above 33ms and no long tasks. No non-input layout shifts were recorded during the settled movement/transition sweep; initial hydration and deliberate reading-mode changes are excluded from that measurement.

About retains one desktop trigger and zero in editorial/reduced modes; zero canvases, new graphics runtimes, continuous RAF loops, per-scroll React state or new dependencies. Descendant count is 383 versus 310 before, primarily complete-line mask wrappers; shared diagrams remove repeated copies. Only two small SVG path strokes interpolate, without filters or a morph dependency. Bound initialization/refresh measurements occur outside frame updates.

The two certificate sources use the existing responsive Next/Image requests and reserved intrinsic ratios. Images were complete with nonzero natural widths in final QA. They are promoted to eager loading/async decode only as desktop About approaches the viewport. Image decode duration and cold-network latency were not instrumented; no claim is made about those timings.

## Changed files

- `src/sections/about/About.tsx`: timeline/observer integration and near-entry archive decode.
- `src/sections/about/AboutStory.tsx`: complete-line masks and shared-diagram presentation hooks; semantic article/copy preserved.
- `src/sections/about/About.module.css`: diagram placements, masks, editorial motion, pacing and conclusion clearance.
- `src/sections/about/AboutGeometry.tsx`: persistent graphic and diagram material.
- `src/sections/about/aboutMotion.ts`: direct master choreography and bounded editorial observer.
- `scripts/about-motion-qa.mjs`: rendered regression/profile capture and assertions.
- `docs/about-motion-audit.md`, this report, and `docs/qa/about-motion/`: audit, verification and screenshots/measurement evidence.

## Validation and readiness

- `npx eslint src/`: passed, no warnings.
- `npx tsc --noEmit`: passed.
- `npm run build:webpack`: passed; static home route generated. The first sandboxed attempt could not fetch existing Google fonts; the authorized network-enabled build succeeded.
- `node --test scripts/about-content.test.mjs`: four passed, including complete no-JS production biography.
- `node --check scripts/about-motion-qa.mjs`: passed.
- `git diff --check`: passed.
- Final production rendered-page assertions: passed (scroll mapping, identical reverse states, visible headline, bounds/collisions, mode cleanup, focus, native-flow policy, direct entry and section adjacency).

Ready for local review and release within the tested Chrome conditions. No reproduced blocking About issue remains. Remaining validation is Safari/Firefox, physical iPhone/Android touch/browser chrome, 200% zoom and assistive technology. Existing Next external-lockfile and Node test module-type warnings remain. The existing Hero THREE.Clock deprecation was observed; it is outside the About upgrade. A generic resource 404 console warning was recorded; the existing `/favicon.ico` and `/apple-touch-icon.png` endpoints both return 404. The About certificate requests completed successfully. The unavailable composition markdown remains a source-document limitation; no copy was invented to replace it.
