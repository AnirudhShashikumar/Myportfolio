# Navigation and hydration remediation

26 October 2026. Starting shared commit: `6e4ff1bedb9bc0124ad1923aae0d71f33dfd3778`; working tree initially clean. Production testing used the local webpack build on port 3001, macOS arm64, Node 24.14.1, Next.js 16.4.3, Lenis 1.3.26, Chrome 155 and Playwright WebKit 26.5. This agent did not run any commit or deployment command. Shared history advanced during validation, including `93aae47` with the scroll changes and subsequent QA commits; those commits are preserved.

**A — rapid history: corrected and locally validated. B — fragment startup CLS: confirmed, still open.** A prepaint reservation experiment removed its measured shifts but broke content flow when bundles failed. That experiment is excluded from the application, following the request's explicit instruction to stop and document a progressive-enhancement tradeoff.

## 1. Baseline reproduction

Read the preceding [direct-anchor investigation](DIRECT_ANCHOR_PERFORMANCE_REMEDIATION.md), [graphics/performance remediation](PERFORMANCE_F10_F12_REMEDIATION.md), [production audit](PORTFOLIO_PRODUCTION_AUDIT.md), [F02](ACCESSIBILITY_F02_REMEDIATION.md) and [F05](F05_ACCESSIBILITY_POLISH.md) reports before changing the navigation owners.

The current shared source reproduced the near-settled Contact → Back failure **3/3**: the URL became `#work`, but Y remained **42,920 / 42,921 / 42,920px**, instead of Work's **4,500px**. Before Back, Lenis remained `smooth`, with animated/target positions around **42,918.5px** and actual scroll **42,919px**. The following ticker frames continued the superseded animation. [Baseline events and frames](qa/navigation-hydration/before/rapid-history.json) retain all three observations.

The baseline also reproduced About CLS **1.0** and Contact CLS **1.0–2.0**, with Home/Work zero. There are three fresh navigations and three refreshes per destination, reported separately. Measurements use fresh contexts, disabled browser cache and 1.8 seconds after load; the startup shifts occur in the first few hundred milliseconds. This is a local laboratory reproduction, not field p75 or remote-CDN performance.

## 2. Root causes

**History:** native anchor activation also emits `popstate` in the tested engines. A listener that interrupts every `popstate` would cancel intentional smooth anchor clicks. Genuine traversal, however, must supersede the old Lenis animation before the next ticker frame. Native persisted-scroll restoration and fragment positioning occur around the subsequent `hashchange`; an in-flight anchor entry can contain a position outside its destination section. Lenis's public `targetScroll` during a programmatic animation is the current animated value, rather than necessarily the eventual destination. The detailed QA trace additionally reads the internal animation destination for diagnosis; application code does not use it.

The old `ScrollMotion` startup-fragment refresh listener could also retain the original target for 1,200ms after navigation changed. It needed an explicit ownership boundary, rather than a longer or shorter timeout.

**Hydration:** the initial editorial document is approximately **34,220px**, while the enhanced desktop document is **46,887px**. Hero stays **4,500px**. SatQuery/GestureGlobe staging, Work handoffs, About and Contact acquire cinematic geometry after capability resolution. The native About fragment initially lands around **22,597px**; its final top is **28,520.109375px**. Contact finally starts at **42,920.109375px**. The existing refresh then recalculates timelines and settles the fragment, after the initial geometry has already painted.

The [diagnostic trace](qa/navigation-hydration/after/diagnostic.json) records DOMContentLoaded, native scrolling, capability-dependent layout mutations, trigger inventory, refreshes and section dimensions. One About trace changes document height **34,220 → 38,423 → 46,887px**; its shift attributes affected rectangles to `section#about` and the Work exit. These are affected nodes, not proof that About alone caused the upstream change. There are **zero pin spacers**; the stories use sticky stages. Neither a pin defect nor a harmless CLS artifact is established.

## 3. Approaches evaluated

| Approach | Evidence and decision |
| --- | --- |
| Immediate refresh, viewport layout effect, disabling automatic scroll anchoring | Previously rejected trials remain rejected. They were not repeated or shipped. |
| Cancel using private Lenis animation/reset internals | Excluded from application code; the installed types do not expose a public reset method. |
| Retire the active controller through public lifecycle APIs | Selected. Only genuine traversal during `smooth` retires it. One existing GSAP ticker then advances the current controller. |
| Always force a history fragment to its exact start | Rejected refinement: this would override valid native reading bookmarks. The final handler preserves native positions inside the destination section. |
| Prepaint capability-aware CSS reservation | Browser-response experiment only: desktop width/height, fine pointer, hover, motion preference and `scripting: enabled` gates. Nine normal observations across Work/About/Contact measured zero eligible shifts and equal initial/final document height. |
| Reservation with failed JavaScript bundles | **Unsafe.** SatQuery content extended about **498px** past the next sibling; GestureGlobe about **310px**. The unmodified blocked-bundle control has zero overlap. Actual no-JavaScript mode avoids the media query, but that does not protect browsers whose scripting is enabled and bundles fail. |
| Early marker / shared server-client stage contract | An early marker can identify capabilities, but cannot by itself reconcile the different static content and sticky-stage geometry or guarantee successful enhancement. A complete solution needs coordinated layout and failure behavior across the affected sections. This broader change was stopped at the verified tradeoff, as requested. |

The installed Next.js pre-hydration and Script guides were consulted. No early script, hydration-warning suppression, hidden page, animation retiming, startup delay or CSS reservation was added. [Candidate CSS, all 18 trial observations and screenshots](qa/navigation-hydration/trials/reservation/) remain available for review.

## 4. Exact source changes

Only two application files change:

- [SmoothScroll.tsx](../src/components/system/SmoothScroll.tsx): distinguish native anchor clicks from traversal; retire an active smooth controller on traversal; synchronize the new controller after native restoration; correct a section only if the restored position is outside it. Ignore superseded `hashchange` destinations. Preserve in-section native bookmarks, focus behavior, native history and the existing Lenis options/ticker. Remove every added listener on cleanup. The existing localhost-only, query-enabled QA hook exposes the current Lenis controller for evidence collection.
- [ScrollMotion.tsx](../src/components/system/ScrollMotion.tsx): bind initial-fragment settlement to its original hash; retire that listener on navigation/user interruption or successful loaded-font settlement. Remove the 1,200ms timer and clean up its listeners together. The existing 120ms geometry-refresh coalescing policy is unchanged.

There is no application `pushState`, new `replaceState`, manual scroll-restoration mode or additional history entry. The existing legacy `#lab` migration is unchanged. No dependency, asset, project content, CSS, Hero renderer, buffer memoization or animation duration/distance changes. [Source, Git and font preservation](qa/navigation-hydration/after/preservation.json) checks all 113 starting files: two changed and 111 unchanged, the starting commit remains an ancestor, the index is unchanged, and all 11 generated font hashes are identical. The record lists the observed intervening shared commits. Temporary QA adapters captured by those commits are preserved as tracked files.

## 5. Before/after rapid-history results

The original near-settled Contact interruption improves from **3/3 failures to 0/3**. The final repeat explicitly requires both actual and Lenis animated positions to be within 2px while the controller still reports `smooth`, avoiding a false pass at a brief native fragment jump. [Final original-case traces](qa/navigation-hydration/after/rapid-history.json).

The [repeated matrix](qa/navigation-hydration/after/history/results.json) covers **216 rapid Back/Forward traversals**, three repeats per destination across nine profiles: Chrome desktop/mobile/reduced/no-JavaScript/no-WebGL and WebKit desktop/mobile/reduced/no-JavaScript. It includes the literal home URL without a fragment and `#home`. There are **2,592 samples**: rAF samples for script-enabled profiles and automation-side polling for no-JavaScript profiles. No-JavaScript polling is not an in-page rAF measurement.

The separate [continuous trace](qa/navigation-hydration/after/history-details.json) starts sampling **before** navigation dispatch, covering **48 traversals** in Chrome/WebKit. Every post-traversal frame stays at the resolved native bookmark or corrected section entry; tests require at most one corrective `scrollTo`, exactly one traversal `popstate`, and no added history entries. Native scrolling itself is separate from that application command count. This is not an eventual-settle-only assertion.

Ten Back/Forward cycles per engine retain **41 triggers**; Chrome's diagnostic listener count is stable across those cycles. [Chrome lifecycle](qa/navigation-hydration/after/history-lifecycle-chrome.json), [WebKit lifecycle](qa/navigation-hydration/after/history-lifecycle-webkit.json).

Eight additional [deep Work/About cases](qa/navigation-hydration/after/reader-bookmarks.json) retain both cinematic and reading modes and issue **zero application scroll commands** during restoration inside the destination section. In these trials WebKit restores the deep saved position, while Chrome restores the fragment start. Assertions use the actual native restoration observed before the application handler, rather than imposing one engine's behavior on another. Initial strict exact-start and pre-restoration bookmark assumptions are retained as QA trial artifacts, not reported as passing checks.

## 6. Before/after CLS distributions

The maximum eligible CLS session window excludes `hadRecentInput`, starts a new window after a gap over one second and limits a window to five seconds. The raw entries and source rectangles are retained; no entries are filtered to improve the result. See the generated [before/after comparison](qa/navigation-hydration/comparison.json).

| Desktop destination | Baseline fresh | Baseline refresh | Final fresh | Final refresh |
| --- | --- | --- | --- | --- |
| `/` | 0, 0, 0 | 0, 0, 0 | 0, 0, 0 | 0, 0, 0 |
| `/#work` | 0, 0, 0 | 0, 0, 0 | 0, 0, 0 | 0, 0, 0 |
| `/#about` | 1, 1, 1 | 1, 1, 1 | 1, 1, 1 | 1, 1, 1 |
| `/#contact` | 2, 2, 2 | 2, 2, 2 | 2, 2, 2 | 2, 2, 2 |

**No startup-CLS improvement is claimed.** Contact's one- versus two-entry startup behavior varies with enhancement commits landing in the same or separate rendering frames. Correct eventual target alignment does not close the visible first-paint problem. The zero-shift reservation trial is excluded from this final-source table because it fails the fallback requirement.

## 7. First-paint visual evidence

[Compositor records](qa/navigation-hydration/after/paint/results.json) cover all four destinations in desktop, mobile, reduced-motion, no-JavaScript and unavailable-WebGL profiles. Screencasting starts before navigation, with each frame timestamped relative to `performance.timeOrigin` and native paint entries. Captures span the first available compositor frames around FCP through the following 650ms; they are not a promise to capture every hardware presentation.

The About sequence visibly begins with the earlier page composition and then changes to About. The diagnostic video and source-node shifts confirm that an accurate later landing does not make startup visually correct. [About early frame](qa/navigation-hydration/after/paint/desktop-about-0.jpg), [About intermediate frame](qa/navigation-hydration/after/paint/desktop-about-10.jpg), [About diagnostic recording](qa/navigation-hydration/after/desktop-about-0.webm).

The rejected fallback is visibly incorrect: its endcap covers part of the SatQuery screenshot. Compare the [reserved, bundles-blocked capture](qa/navigation-hydration/trials/reservation/bundles-blocked-work-0.jpg) with the [unmodified blocked-bundle control](qa/navigation-hydration/trials/reservation/blocked-original-work-0.jpg). No such reservation is present in the final source.

## 8. Reduced-motion and no-JavaScript results

The focused [navigation suite](qa/navigation-hydration/after/navigation/results.json) passes **135 settled direct/reload/header/Back/Forward landings** across nine profiles, in addition to the rapid matrix. Every tested landing has less than 2px target error, no horizontal overflow and zero pin spacers. Reduced-motion and mobile do not receive a desktop Lenis controller. No-JavaScript retains static content and the three Contact actions on desktop, phone and short-height layouts.

WebGL unavailability remains a graphics fallback, not a reason to impose a different section geometry. The [nine-case capability regression](qa/navigation-hydration/after/capability-regression/results.json) covers unavailable, throwing and WebGL1-only contexts, normal/reduced desktop/mobile and a direct anchor. Unavailable graphics skip the heavy scene; supported graphics remain mounted and pause offscreen. Empty observer arrays in scripting-disabled trials are **not** presented as a measured zero CLS result.

## 9. Accessibility regression

The existing F02 suite verifies initial browser accessibility-tree content, **18 forward Tab stops**, reverse traversal, visible focus, Enter/Space reader controls, PageUp/PageDown/arrows/Home/End and Contact actions. Work and About reading choices survive interrupted history. Source changes do not call `focus()` or modify semantic visibility.

Automated cinematic and Work-reading scans report no violations. The static Contact scan retains the already-triaged **1.03:1 decorative monument** finding; the semantic name and essential Contact actions remain available. No hydration or missing-GSAP-target warning is recorded. This is not a new full WCAG certification. Native assistive-technology operation remains outside this browser-automation evidence. [F02 results](qa/navigation-hydration/after/regression/accessibility-f02/results.json), [F05 inspection](qa/navigation-hydration/after/regression/f05/inspection.json).

## 10. Cinematic regression and validation

All **13 existing regression commands** pass on the final production build: About content, About motion, ScrollDiscovery, F02, F03/F04, F05, SEO, integrity, content review, Chrome production matrix, WebKit production matrix, production extras and isolated scroll input. [Command outcomes and individual logs](qa/navigation-hydration/after/regression/commands.json).

The production matrices cover **801 Chrome states across eight viewports** and **318 WebKit states across three viewports**. Chrome includes 360×800, 390×844, 430×932, 768×1024, 1280×720, 1280×800, 1440×900 and 1728×1117. The [comparison](qa/navigation-hydration/after/matrix-comparison.json) checks the earlier validated geometry, section/mode ownership and trigger counts, with zero page errors, failed requests, loaded broken images, document overflow, horizontal text candidates or scrub mismatches. Extras cover reverse transitions, fast wheel input, reader/reduced modes and unavailable WebGL; isolated scroll input covers nine regions and 108 states.

Current screenshots of Hero identity, all six Work projects, About and Contact were visually inspected, alongside first-paint and fallback captures. The cinematic typography, dark palette, image crops and staged transitions remain present. This is a combination of sampled visual inspection and measured regression checks, not an entire-frame pixel identity claim.

`npx eslint src/`, `npx tsc --noEmit`, `npm run build:webpack` and `git diff --check` pass. Logs: [ESLint](qa/navigation-hydration/after/eslint.txt), [TypeScript](qa/navigation-hydration/after/tsc.txt), [build](qa/navigation-hydration/after/build.txt), [diff check](qa/navigation-hydration/after/diff-check.txt). The initial source snapshot was renamed `.tsx.txt` so the project typechecker does not compile an evidence copy as an application module; that harness issue is corrected.

Graphics lifecycle observations retain **13 signal-buffer allocations**, zero offscreen draws in sampled Work/About/Contact windows, bounded repeated-navigation resources and unchanged fonts. These are preservation observations, not an FPS or latency improvement claim. The inherited lifecycle helper's repeated-wheel region labels are excluded from regional latency conclusions; the isolated input suite supplies that behavioral coverage. [Lifecycle observations](qa/navigation-hydration/after/lifecycle.json).

The comparable instrumented startup samples request **476,966 → 477,885 encoded JavaScript response-body bytes** (**+919 bytes**) and **15 → 16 JavaScript resources**. The layout output now includes an additional shared chunk; the page and heavy graphics chunk names/sizes remain unchanged. This accounting includes the link-preloaded webpack runtime and excludes inline HTML scripts and response headers. It is a small bundle/request increase, not a performance improvement. All 11 font files retain their prior hashes.

## 11. Remaining risks

1. About/Contact startup geometry and CLS remain a confirmed visible defect. The first paint is not certified merely because subsequent navigation is correct.
2. A stable shared initial-layout contract must also keep all static project evidence readable when enhancement fails. The tested capability gate alone does not satisfy that contract. A broad rewrite was not forced into this navigation patch.
3. Local Chrome/WebKit automation does not replace physical-device, browser-UI, native screen-reader or field performance verification. Timing results are not production p75. Functional suites may run concurrently; performance observations are collected separately.
4. Previously documented fresh-mobile startup tasks, upstream Three.js/React Three Fiber Clock and unused-CSS-preload warnings, MediFit demo/version verification and outstanding owner-supplied achievement records are not resolved by this task. Existing dependency, SEO, privacy and content corrections remain intact.
5. No public deployment was changed or revalidated as an updated release. The local corrected source does not establish that production already serves these changes.

## 12. Release-readiness recommendation

**Accept the local rapid-history correction; keep the hydration/CLS issue and overall performance sign-off open.** Native traversal supersedes unfinished Lenis motion without history loops or a timeout-based repair, and the regression evidence preserves the cinematic experience and progressive fallback. The rejected reservation demonstrates a possible zero-shift geometry but also a concrete loss of content, so it is not a release candidate.

The next geometry change must coordinate initial static/staged layout across Work/About/Contact with an explicit enhancement-failure path, then repeat first-paint, failed-bundle, reader, reduced-motion, mobile, short-height and history checks. This is the documented stopping point required by the request, not a claim that both defects are fixed. This agent made no commit or deployment and did not undo the intervening shared commits.
