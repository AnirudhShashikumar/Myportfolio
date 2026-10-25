# F02 accessibility remediation

**Project:** Anirudh Shashikumar Portfolio

**Date:** October 25, 2026, IST

**Scope:** F02 in [the production audit](PORTFOLIO_PRODUCTION_AUDIT.md), with the natural Contact/no-JavaScript overlap noted under F09. Production build: Next.js 16.4.3. No commit or deployment was performed.

## 1. Original failure reproduced

The pre-change production application was tested at 1440×900 with actual Tab input and Chrome's `Accessibility.getFullAXTree` API. This reproduced F02 after the Hero intro:

| Section | Initial project heading | Keyboard actions before the fix |
| --- | --- | --- |
| SatQuery AI | Exposed | Live system reachable |
| Gesture Globe | Exposed | Live experience reachable |
| AlgaeOS | Exposed | Infographic and existing case-study action reachable |
| Dayflow | **Missing** | Live app reachable |
| MediTwin | **Missing** | **Certificate and primary action skipped** |
| MediFit | **Missing** | **Certificate and live app skipped** |
| Contact | Section h2 exposed | **Email/LinkedIn/GitHub skipped** |

Activating the primary Contact navigation link with Enter and then pressing Tab focused **BACK TO TOP**, rather than email. The initial accessibility-tree link inventory likewise omitted the healthcare and Contact links. See [original reproduction](qa/accessibility-f02/before/reproduction.json), [raw log](qa/accessibility-f02/before/reproduction-log.txt) and [Contact capture](qa/accessibility-f02/before/contact-tab.jpg).

## 2. Root cause

Meaningful content and controls shared their DOM nodes with visual staging. `autoAlpha: 0` set both opacity and `visibility:hidden`, removing descendants from keyboard navigation and the accessibility tree. Contact also began with a hidden action layer, while its static editorial alternative was available only through reduced-motion/short-height CSS.

All six feature components, their motion owners, Work handoffs/coordinate/exit, Contact, About's semantic article and reader mode, viewport rules and ScrollTrigger cleanup were reviewed. About supplied the useful principle: complete semantic content must survive independently of decorative motion. Work already had a complete server-rendered document and native flow layouts, so duplicating it was unnecessary.

The behavior of CSS visibility is documented by [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/visibility). The focus treatment follows the requirement that the user can see the focused control, described in [W3C's Focus Visible guidance](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html). The installed Next.js server/client component guide was read before implementation; server-rendered children remain server-rendered across the small client accessibility boundary.

## 3. Architecture selected

**One semantic document, one set of actions, with visual staging and focus visibility given separate responsibilities.**

- Each existing project retains its original content and native links. A shared article boundary keeps semantic CSS visibility stable. Existing opacity, transforms, clips and GSAP timelines continue to stage the visual composition.
- No essential information is newly placed under `aria-hidden`. Existing decorative graphics remain decorative. There is no second clipped copy of project content or duplicate focusable link collection.
- On focus, a synchronous helper reveals only the real control and its ancestor chain, clears clipping/transforms on that chain, and supplies a visible outline. This lasts until blur, so reverse scrolling cannot fade away the focused action. There is no delayed “focus an invisible target, reveal later” step.
- Visually absent `autoAlpha` states retain disabled pointer hit-testing. Keeping semantic visibility stable therefore does not introduce invisible mouse targets. Native keyboard and accessibility-tree access remain available.
- A **Read Work without motion** toggle offers the existing native flow layouts without requiring the cinematic journey. Like the site's skip control, it becomes visible on keyboard focus; it is also exposed to assistive technology. It never remains visually clipped while focused. Its return control stays within Work when reading. It adds no normal cinematic scroll distance.
- Reading is an explicit Enter/Space action, not an automatic mode change on focus. No global key interception, positive tabindex ordering, unrelated navigation, AT detection or Lenis modification was introduced.

## 4. Work accessibility implementation

All six projects use `AccessibleProject`, preserving their headings, descriptions, evidence and actions. SatQuery's existing root becomes an explicitly labelled article; the other five retain their article semantics. Work's enclosing region is labelled “Work” rather than borrowing the SatQuery title.

The existing nine Work links remain the same links and destinations: four live experiences/applications, the AlgaeOS infographic, two healthcare certificates, and the two existing case-study placeholder actions. No repository, demo or evidence URL was invented. The incomplete case studies remain F07; the MediFit destination discrepancy remains F03.

The reader toggle changes only motion eligibility. The six motion components and Work's handoff/coordinate/exit owners revert their own contexts and restore their original layouts. Returning to motion reconstructs them. Existing tween values and durations were preserved. The shared global section-field trigger remains registered on `#work`; its decorative fade is frozen while reading. **Project staging and handoff triggers are zero in reading mode.** This deliberately preserves ownership of the shared scroll system.

The selected project's entry is preserved after the child contexts have reverted/rebuilt, using one animation-frame callback followed by a ScrollTrigger refresh/update. This is an explicit view switch, not an automatic traversal through other projects.

All six project JSX text-node sequences are unchanged against the source baseline. The reading view also preserves the complete rendered project text and link arrays. See [copy comparison](qa/accessibility-f02/after/project-copy-comparison.json).

## 5. Contact accessibility implementation

`ContactActions` now renders **once**, supplying exactly three actual anchors in every capability mode: email, LinkedIn and GitHub. The same nodes remain focused through live reduced-motion changes.

The section h2 remains the logical Contact heading. Static content retains its h3, invitation and the same links. An unnecessary label on the generic visual question wrapper was removed; its actual text remains available. No duplicate action layer was added.

Contact's existing timeline now has an `actions-ready` label within its fully revealed action hold. Keyboard focus calculates the scroll position from that label and the timeline's actual duration and trigger range. Focus stays on the selected real anchor. The focus path remains visible if the visitor reverses scroll. The handler does not choose an arbitrary heading or create a separate navigation route.

The static presentation is now the CSS default. Only a successfully established cinematic timeline adds `data-motion="active"`. This fixes the missing Contact baseline without changing the enhanced stage's normal dimensions, fonts or timing.

## 6. Keyboard navigation results

At 1440×900, the focused suite traversed the complete sequence through Back to Top: **21 Tab stops**, including the nine Work actions and all three Contact actions. Fifteen reverse Tab steps were also exercised. Every sampled project/Contact target had full effective opacity, non-hidden ancestors, a visible focus indicator and an unobscured hit-tested center. No horizontal overflow was recorded.

The primary Contact link → Enter → Tab sequence now reaches **Email Anirudh Shashikumar**. Subsequent Tab steps reach LinkedIn, then GitHub; Enter activation of the actual GitHub anchor was verified with navigation prevented by the test. No message was sent and no email client was invoked.

Work reading mode accepts native Enter and Space and retains its focused toggle. Page Down, Page Up, both arrow directions, Home and End advance/reverse the document normally. The recorded Home position is 0; End reaches the document's lower limit. No keyboard trap was found. Existing direct section anchors, history, refresh and native touch/scroll checks also pass.

See [focused results](qa/accessibility-f02/after/results.json), [individual action focus captures](qa/accessibility-f02/after/focus-captures/results.json), [Contact focus](qa/accessibility-f02/after/contact-keyboard.jpg), [MediTwin certificate focus](qa/accessibility-f02/after/focus-captures/focus-project-4-13.jpg) and [MediFit certificate focus](qa/accessibility-f02/after/focus-captures/focus-project-5-15.jpg).

## 7. Accessibility-tree results

Actual Chrome CDP accessibility nodes were inspected, traversing their child relationships in document order. Before any cinematic scroll journey:

- Each of the six project headings appears **once**, in SatQuery → Gesture Globe → AlgaeOS → Dayflow → MediTwin → MediFit order.
- Each project's own article subtree contains meaningful descriptive text; this was checked for all six, rather than inferring availability from headings alone.
- Existing project actions are exposed. Email, LinkedIn and GitHub each appear once as a link in the initial tree.
- Contact has three anchors in the DOM, not two hidden collections. Reader mode uses the same project DOM and does not create duplicate announcements or Tab targets.

Evidence: [detailed semantic check](qa/accessibility-f02/after/semantic-detail/results.json). These browser-engine nodes are stronger evidence than a DOM-only snapshot, but are **not a real screen-reader session**.

## 8. Reduced-motion behavior

Cold reduced motion retains all six project headings and three visible Contact actions, with **zero ScrollTriggers overall**. Live reduced motion while GitHub is focused preserves the same anchor, visible focus, full opacity and a usable viewport position.

Work's explicit reading option removes its project staging independently of the OS preference. Repeated reading/return cycles restore **41 total triggers**, including a phone/desktop resize while reading. The global background trigger is retained and visually frozen rather than destroyed by an unrelated component. See [reading lifecycle results](qa/accessibility-f02/after/reading-cycles/results.json).

About's own reader focus, reverse signatures and reduced-motion cleanup still pass. Its implementation and Lenis behavior were not changed.

## 9. No-JavaScript behavior

Production HTML was tested with JavaScript disabled at **1440×900, 390×844 and 1280×550**. Each run exposed all six project headings in the browser accessibility tree, rendered meaningful Work content, and supplied exactly three visible Contact links with no document horizontal overflow. Native Contact navigation → Enter → Tab reached email with visible focus in all three sizes.

The JavaScript-only Work toggle is absent from this baseline; the projects are already in native flow. Contact's heading, invitation and actions no longer require GSAP to become usable. See [no-JavaScript results](qa/accessibility-f02/after/results.json) and [desktop capture](qa/accessibility-f02/after/nojs-1440x900.jpg).

This directly verifies the Contact symptom described in F09, including its normal-height reproduction. It is documented as verified overlap with F02, not a claim of complete no-JavaScript equivalence for every cinematic feature or an unrestricted release sign-off.

## 10. Screen-reader testing performed

**No actual VoiceOver or other speech-output session was completed.** Native access was attempted using `cua.getApp("VoiceOver")`; the tool returned **“Computer Use was not approved to use VoiceOver.”** No alternate mechanism was used to bypass that limit.

The performed checks are actual browser accessibility-tree inspection, real keyboard input, DOM/layout checks and axe-core scans. They do not establish VoiceOver rotor behavior, spoken announcements or Safari/VoiceOver interoperability. A real screen-reader pass remains a release-validation item. The access result is retained in [screen-reader-check.json](qa/accessibility-f02/screen-reader-check.json).

## 11. Visual regression and tests

The same pre-F02 Next 16.4.3 build's evidence in `qa/dependency-security/after/` was used for normal cinematic comparisons.

| Verification | Result |
| --- | --- |
| `npx eslint src/` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build:webpack` | Pass |
| `git diff --check` | Pass |
| Existing About content tests | 4/4 pass |
| Existing About motion suite | Pass; 20 holds, 76 boundaries, 65 viewport samples, reverse signatures, reader focus and cleanup |
| Existing ScrollDiscovery suite | 7 viewports / 25 behavior cases pass |
| Production Chrome matrix | 8 sizes, **802 states**, no page errors |
| Production WebKit matrix | 3 sizes, **318 states**, no page errors |
| Production supplementary audit | All six Work reverse signatures match; WebKit anchors, About reader/reduced mode and WebGL fallback pass |
| Focused F02 suite | 7 core cases pass; supplemental per-project semantic, focus capture, reading-cycle and scoped scan checks pass |

Across the **1,120 matrix states**, sample counts, scroll positions, document heights, trigger counts and cinematic modes match the baseline. There are **zero** recorded scrub-progress mismatches, document horizontal overflow, failed requests, page errors or loaded-but-broken image records. No hydration error or empty GSAP target warning was observed. The focused initial-load observation records no layout-shift entries.

Resolved desktop captures were inspected side by side for Hero, all six projects, About and Contact: [comparison 1](qa/accessibility-f02/after/visual-comparison-1.png), [2](qa/accessibility-f02/after/visual-comparison-2.png), [3](qa/accessibility-f02/after/visual-comparison-3.png). Typography and composition match. All **11 generated WOFF2 files** are unchanged. No normal cinematic stage, animation or scroll distance was removed. Focus feedback and the explicitly selected reading view are intentional accessibility states; their visuals differ from unfocused staging.

The original mobile Hero clipping candidates remain; they were not redesigned under F02. Animated graphics vary by capture time, so this is not a pixel-perfect entire-frame assertion. See [browser comparison](qa/accessibility-f02/after/browser-comparison.json), [font check](qa/accessibility-f02/after/font-comparison.json) and [reproduction instructions](qa/accessibility-f02/README.md).

An early reading assertion counted the shared global background trigger as project staging. Inspection identified its actual target, the test was corrected to distinguish ownership, and the reading view freezes that fade. The initial assertion output is retained in [focused-attempt-1.txt](qa/accessibility-f02/after/focused-attempt-1.txt). No project animation was deleted to satisfy the test.

## 12. Files modified

| Files | Purpose |
| --- | --- |
| `src/components/system/focusReveal.ts`, `FocusReveal.module.css` | Stable semantic visibility, synchronous focus-path reveal, pointer safeguards and focus outline |
| `src/sections/work/WorkAccessibility.tsx`, `WorkAccessibility.module.css` | Single-document project boundaries and explicit Work reading mode |
| `src/sections/work/Work.tsx`, `Work.module.css` | Work provider/region and static reading background |
| Six `*Feature.tsx` files under `src/sections/work/` | Apply the accessible article boundary without changing project copy |
| Six `*Motion.tsx` files under `src/sections/work/` | Respect explicit reading mode through existing context cleanup |
| `src/sections/work/WorkNavigation.tsx` | Reading eligibility for existing handoff/coordinate/exit owners |
| `src/sections/contact/Contact.tsx`, `Contact.module.css` | One action set, deterministic focus hold and static baseline |
| `scripts/accessibility-f02-qa.mjs` | Focused regression suite |
| This report and `docs/qa/accessibility-f02/` | Findings, logs, comparisons and captured evidence |

Hero, About, SmoothScroll/Lenis, the original regression scripts, project assets, project destinations, dependencies and build scripts were not changed. Temporary copies of the existing suites changed only output-directory constants and were removed after testing.

## 13. Remaining issues

- **Contrast is not clean.** The initial full-document axe scan reports one `color-contrast` rule with **23 nodes**: the three known footer nodes and twenty newly detected dim Dayflow nodes in their initial staged state. Their visual colors and resolved compositions were not changed by this task. Stable semantic visibility makes these cases detectable; they are explicitly retained for contrast review rather than dismissed as a clean scan.
- The scoped Work reading scan reports **no rule violations**. The static Contact scan flags one decorative outlined ANIRUDH monument at 1.03:1. That existing visual needs incidental/decorative-text triage; no ARIA change was used to suppress the finding. These scoped results do not certify whole-page WCAG conformance. See [all three scan results](qa/accessibility-f02/after/automated/results.json).
- Actual VoiceOver/speech-output testing remains unverified because native access was not approved. WebKit testing is engine coverage, not Safari application or physical-device certification. Firefox's existing host initialization limitation remains.
- F03's MediFit demo discrepancy, F04 contrast, F05 clipping, F07 incomplete case studies and other unrelated production findings remain outside this implementation. Existing favicon and Three.Clock warnings remain.

## 14. F02 closure verdict

**F02's reproduced keyboard and accessibility-tree failures are resolved in the tested local production build.** All six projects are discoverable with meaningful content; their real actions are reachable with visible focus; Contact navigation reaches email; and the original cinematic journey remains intact in the sampled normal states.

This is closure within the verified keyboard/browser-tree scope. Real screen-reader acceptance remains pending native access, and the site is not being declared fully WCAG-conformant or approved for unrestricted launch. No commit or deployment was performed.
