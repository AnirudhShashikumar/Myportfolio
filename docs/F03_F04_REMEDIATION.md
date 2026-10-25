# F03 / F04 remediation

**Project:** Anirudh Shashikumar Portfolio  
**Date:** October 25, 2026, IST  
**Scope:** F03 and F04 from [the production audit](PORTFOLIO_PRODUCTION_AUDIT.md). Existing [F01](DEPENDENCY_SECURITY_REMEDIATION.md) and [F02](ACCESSIBILITY_F02_REMEDIATION.md) fixes are preserved. This agent did not commit or deploy.

## 1. F03 root cause

The portfolio asserted that its external destination was the **live MediFit application** for the featured fitness/digital-twin prototype. The destination's unauthenticated public presentation instead describes medication safety and health analysis. The discrepancy is verified; its deployment-history explanation is **not established**.

Read-only Git history shows that commit `926046327d1f6ea55bf09a51f76e70a8fe6cd250`, dated September 28, 2026, replaced the internal `#medifit-detail` action with `https://medi-fit-navy.vercel.app/` and the LIVE APP label. The fitness narrative already existed. This establishes when the link was introduced, but does not establish whether the deployment was subsequently replaced, the URL was wrong initially, or the portfolio describes a different version. See [the exact historical diff](qa/f03-f04/before/link-history.txt).

No verified matching alternative deployment was found in the available repository documentation, source, local assets or source history. The current public page supplies only an API-key acquisition link, which is not project/version evidence. No explanation was selected by guesswork.

## 2. Verified MediFit evidence

| Evidence | What it establishes | Limits |
| --- | --- | --- |
| `MediFitFeature.tsx` | Existing claims include digital-twin-driven personalization, individual health monitoring, condition-adapted fitness recommendations, a functional full-stack application, primary full-stack contribution, third place, an eight-hour build, four members and 50+ teams. The engine diagram says FITNESS PLAN. | These are portfolio claims, not independent verification of the deployed application's behavior. |
| README, MediFit section | Consistently describes personalized fitness, monitoring and digital-twin concepts; calls the project a hackathon prototype. | No matching deployment URL, source application repository or deployment/version record is provided. |
| [Current public entry](https://medi-fit-navy.vercel.app/) | Fresh Chrome visit returned HTTP 200, title MediFit, and “AI-powered medication safety & health analysis”, followed by a Google Gemini API-key entry gate. | The gated workflow was not entered. This does not prove that hidden functionality lacks fitness features, nor that historical claims are false. |
| [Achievement certificate](../public/projects/medifit/push-pull-commit-certificate.jpg) | Visually confirms Third Place, Anirudh, PUSH PULL COMMIT, IEEE Computer Society BMSIT & M, and May 4, 2026. | It does not name the software product or independently establish its functionality, 50+ teams, four-member team, eight-hour duration or contribution split. |
| Existing team/event photograph | Existing event evidence remains rendered and unchanged. | A photograph does not establish software functionality or deployment history. |

The exact pre-change rendered narrative and link inventory, public-page text, HTTP result and footer trials are retained in [inspection.json](qa/f03-f04/before/inspection.json). See also [the public entry screenshot](qa/f03-f04/before/public-demo.jpg). No credentials or API keys were requested, entered or recorded.

## 3. Exact changes made

- Replaced the misleading MediFit LIVE APP anchor with the plain paragraph **LIVE DEMO UNVERIFIED**. It has no URL, button/link role, tabindex, arrow, hover effect or action outline. It does not imply that the reachable external site is offline.
- Preserved the `data-mf-cta` animation target, existing GSAP timeline, endcap placement, palette, monospace treatment and minimum height. Removed the obsolete button-specific CSS. No motion source file changed.
- Retained the existing certificate anchor and its accessible name, destination and keyboard activation. All historical project narrative, statistics, achievement text and assets remain unchanged. The rendered full-text comparison differs only by the action/status text.
- Changed footer paragraph color from `#60757e` to `#687d86` and shared footer text size from `0.55rem` to `0.6875rem` (8.8px → 11px at the default root size). Background, borders, grid definitions, padding, gaps, min-height, link colors and existing color transition remain unchanged.
- Updated the existing F02 suite's MediFit action expectation to the retained third-place certificate. Its six-project, keyboard, semantic-content, reading-mode and Contact assertions remain active.

Application files changed for this task are only:

1. `src/sections/work/MediFitFeature.tsx`
2. `src/sections/work/MediFitFeature.module.css`
3. `src/components/layout/SiteFooter.module.css`

The existing F02 changes were already present when this task began. Hash comparison confirms every other application file and the dependency/configuration files are unchanged from that starting state. See [source preservation](qa/f03-f04/after/source-preservation.json) and [this task's isolated diff](qa/f03-f04/after/task.patch).

## 4. Owner decisions and alternatives

**No narrative/version decision was needed for the authorized removal of the misleading action.** The existing historical project presentation was retained. No replacement product was selected and no narrative rewrite was made.

Future alternatives requiring evidence or owner input are:

| Alternative | Required before implementation |
| --- | --- |
| Restore a live fitness-prototype action | Verify a matching public deployment or suitable read-only demonstration against the featured scope. A URL alone would not establish equivalence. |
| Retain the historical prototype without a live action | This is the current conservative presentation; the certificate remains available. |
| Feature the current medication-safety product instead | Obtain explicit owner approval to change the narrative and verify its relationship to the historical achievement. The certificate must not automatically be attributed to a different software version. |

A future narrative change must receive owner approval before editing project claims. The unresolved deployment history is recorded rather than used to invent a replacement URL or explanation.

## 5. F03 closure status

**Closed for the misleading visitor-facing live-app action**, using the removal option explicitly authorized in the task. Visitors are no longer directed to the mismatching application under the fitness prototype's LIVE APP promise. Achievement evidence remains accessible.

This closure does **not** certify a working fitness demo, prove which deployment/version explanation is correct, or independently authenticate every historical product claim. Restoring a live demonstration remains an evidence-dependent follow-up.

## 6. Original footer contrast

The failing elements were the three informational paragraphs: **ANIRUDH SHASHIKUMAR**, **© 2026**, and **BUILT + ITERATED WITH INTENTION**. Their inherited foreground `#60757e` on `#070a0c` computes to **4.105986854857199:1**, matching the audit's displayed **4.1:1**. All were normal text at 8.8px; the large-text exception did not apply.

The BACK TO TOP link used its own lighter color and was not one of the three failures.

## 7. Updated footer contrast

| Element/state | Foreground | Background | Calculated ratio |
| --- | --- | --- | --- |
| Three informational paragraphs | `#687d86` | `#070a0c` | **4.600576334384279:1** |
| BACK TO TOP, normal | `#b5cbd4` | `#070a0c` | 11.77755282749243:1 |
| BACK TO TOP, hover/focus | `#f0f6f8` | `#070a0c` | 18.19205696825545:1 |

The new paragraph token adds eight to each RGB channel, retaining the cool-gray balance. It exceeds the unrounded **4.5:1** normal-text AA threshold. Calculations use the sRGB relative-luminance formula in [W3C's SC 1.4.3 guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), which also explains that threshold values must not be rounded into a pass.

Rendered computed colors and a scoped axe scan were verified at 1440×900, 768×1024, 681×800, 390×844, 360×800 and 320×800, plus desktop reduced motion. All seven footer scans report **zero violations**. Desktop WebKit matrix scans also no longer report footer contrast nodes. **F04 is closed for the tested footer states.**

## 8. Footer readability assessment

8.8px monospace informational text was unnecessarily small, even with corrected contrast. The 11px size is a modest **25% increase**, remains expressed in rem, and preserves the minimal footer. Contrast alone is not a legibility guarantee; 11px is still small secondary text, not a large-print or universal-readability claim.

Trials compared 8.8px, 10px, 11px and 12px at desktop, tablet and phone widths. At 11px the narrow tagline wraps naturally, remains within its own grid cell and does not collide with BACK TO TOP. Its two lines fit inside the adjacent 44px action row. The 12px trial introduced wrapping at more widths without being needed for this correction.

The desktop footer remains **97px** including its border. Measured phone height changes from **118.1875px to 121.5px** because of larger text metrics; padding and gaps are unchanged. All tested text rectangles fit, no horizontal document overflow occurs, and the Back to Top control retains its 44px minimum height and native keyboard behavior. Reduced motion retains a zero-duration color transition.

See [focused results](qa/f03-f04/after/f03-f04-results.json), [desktop footer](qa/f03-f04/after/footer-1440-normal.jpg), [360px footer](qa/f03-f04/after/footer-360-normal.jpg), and [320px footer](qa/f03-f04/after/footer-320-normal.jpg).

## 9. Visual and cinematic regression results

The existing production browser audit completed **802 Chrome states across eight viewport sizes** and **318 WebKit states across three sizes**. It covers Hero, all six Work projects, About, Contact, and forward/reverse samples of all five horizontal Work handoffs. Across these **1,120 states**, there are zero recorded page errors, failed requests, loaded-but-broken images, document horizontal overflows or active scrub-progress mismatches.

Trigger counts and cinematic/editorial modes match the F02 baseline. Desktop sampled scroll positions match. Phone samples after the revised endcap move by 2–4px; sampled document heights differ by at most 1px. The removed arrow/button had a taller intrinsic line box, while the larger footer adds about 3.3px. These small intended content-metric differences do not change timeline definitions or remove a stage. See [the complete baseline comparison](qa/f03-f04/after/browser-comparison.json).

Representative desktop captures of Hero, SatQuery, Gesture Globe, AlgaeOS, Dayflow, MediTwin, MediFit, About and Contact were visually inspected, along with phone MediFit and footer captures. The intentional differences are the MediFit status and footer type/color. Existing typography elsewhere and all **11 generated WOFF2 files** are unchanged. See [MediFit desktop](qa/f03-f04/after/medifit-1440-normal.jpg) and [phone](qa/f03-f04/after/medifit-390-normal.jpg).

The supplementary existing audit records matching reverse signatures for **all six Work projects**, successful WebGL fallback, and WebKit direct anchors, About reader mode and reduced-motion cleanup. Its chained wheel diagnostic can begin later trials before the preceding Lenis interpolation settles, so those per-region latency labels are not treated as proof of section-specific performance. Separate fresh-page trials verify actual slow, fast and reverse wheel input at **nine regions**: Hero, every Work project, About and Contact. All **108 input-state samples** have zero overflow and zero active scrub mismatches, with the expected forward/reverse scroll movement. See [scroll-input.json](qa/f03-f04/after/scroll-input.json).

No performance improvement is claimed. Dependencies, fonts, image assets, image optimization configuration, Hero rendering and scroll implementation are unchanged. This task did not run a controlled performance benchmark.

## 10. Accessibility regression results

The existing **seven-case F02 suite passes**, including actual Chrome accessibility-tree traversal, native Tab/Shift+Tab, Contact Enter → Tab → email, explicit Work reading mode, live and cold reduced motion, and no-JavaScript desktop/phone/short-height baselines. All six project headings remain exposed once, with meaningful project content and real actions. Contact still has exactly three anchors. Repeated reading cycles restore **41 triggers**; cold reduced motion has zero triggers.

The Tab sequence is intentionally **20 stops rather than 21**, reflecting removal of the unverified MediFit link. MediFit's certificate remains reachable, visible on focus and opens its existing full-size image with Enter. The status adds no fake interactive target. BACK TO TOP can be reached and activated with the keyboard and returns to Hero.

The focused initial whole-document axe scan decreases from **23 to 20 contrast nodes**: the three footer failures are removed. The remaining twenty are the existing dim/staged Dayflow candidates recorded in F02. Work reading mode still has zero rule violations. Static Contact still flags the existing outlined decorative ANIRUDH monument and requires its previous incidental-text triage. No ARIA suppression was introduced. These scoped passes do not establish whole-site WCAG conformance.

An actual VoiceOver session remains unverified, as already documented in F02 after native access was denied. This task used browser accessibility APIs, keyboard input and axe; it did not bypass that restriction or claim speech-output testing. WebKit engine coverage is not physical-device or Safari/VoiceOver certification.

## 11. Validation results

| Check | Result |
| --- | --- |
| `npx eslint src/` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build:webpack` | Pass; Next.js 16.4.3 production build |
| `git diff --check` | Pass |
| Existing About content tests | 4/4 pass |
| Existing About motion suite | Pass; 20 holds, 76 boundaries, 65 viewport samples, reverse states, reader focus and cleanup |
| Existing ScrollDiscovery suite | Pass; seven viewports and 25 behavior cases |
| Existing production Chrome/WebKit matrices | Pass within the recorded audit scope; 1,120 sampled states, existing unrelated candidates retained |
| Existing supplementary production audit | All six reverse signatures match; WebGL fallback and WebKit navigation/reader/reduced checks complete |
| Existing F02 suite | Seven cases pass; no page errors |
| Focused F03/F04 browser checks | Seven viewport/motion cases pass; certificate activation, preserved narrative, footer contrast/layout/axe, Back to Top |
| Isolated slow/fast/reverse input | Nine regions / 108 states pass; no page errors |
| `npm audit --omit=dev --json` / `npm audit --json` | Both report **0 vulnerabilities**; dependency files unchanged |

Logs, screenshots and JSON are in [qa/f03-f04](qa/f03-f04/README.md). Existing motion/ScrollDiscovery/production audit scripts were run through temporary copies changing only their output-directory constants, preserving earlier evidence. The F02 suite used its supported output environment variable. Temporary runner copies were removed after validation.

The shared repository advanced to commits `437633b` and `4df22b2` during this run, including some in-progress edits and temporary evidence files. This agent did not issue a commit command or change that history. Consequently the current Git diff alone is not the complete task diff; `task.patch` and the starting source hashes preserve that comparison. Cleanup removes the temporary runners and renames the compiled-source evidence snapshot to plain text, including where those files were captured by the intervening commits.

The first TypeScript/build attempt detected a baseline `.tsx` evidence copy under the project's broad TypeScript include. That evidence file was renamed `.tsx.txt`; type-check and production build then passed. No application workaround or tsconfig exclusion was added. Both initial diagnostic logs are retained. The existing external-lockfile notice, Node module-type notice and Three.Clock deprecation remain unrelated to these changes.

## 12. Remaining issues

- The correct live fitness deployment and the reason for the current product-scope mismatch remain unverified. Restoring a demo requires evidence; rewriting the narrative requires owner approval.
- Historical functionality, team/build statistics and contribution claims are preserved from the owner's existing project account, rather than newly certified by a public application inspection.
- The previously documented Dayflow contrast candidates, decorative Contact text triage, mobile Hero clipping, incomplete case studies and other findings outside F03/F04 remain. No new horizontal text candidates were introduced in the matrix comparison.
- Actual screen-reader speech output, physical-device/browser acceptance and HTTPS deployment verification remain outside the completed local tests.

**Verdict:** F03's misleading live-app action is corrected without selecting an unverified project version. F04's footer normal-text contrast failure is corrected, with improved practical text size. F01/F02 and the sampled cinematic experience are preserved. This agent did not commit or deploy.
