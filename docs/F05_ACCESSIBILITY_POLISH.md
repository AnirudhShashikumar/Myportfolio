# F05 and contrast accessibility polish

**Project:** Anirudh Shashikumar Portfolio  
**Date:** October 26, 2026, IST  
**Scope:** Mobile Hero clipping, the twenty reported Dayflow contrast nodes, and Contact contrast/decorative-text classification. References: [production audit](PORTFOLIO_PRODUCTION_AUDIT.md), [F02 remediation](ACCESSIBILITY_F02_REMEDIATION.md), [F03/F04 remediation](F03_F04_REMEDIATION.md).

## 1. Reproduced issues

Git was inspected before editing: the first inspection showed `4df22b2`. Shared history advanced to `9aa1a41` by the saved source/evidence snapshot, and subsequently through `5e75957`, `4f96291`, `6df3f82` and `945917b` during the work. These commits captured some in-progress work outside this agent's commands. No reset, checkout, staging, commit or deployment command was issued by this agent, and none of that history was rewritten. The existing F03/F04 report, evidence and cleanup were preserved. The isolated task diff and source hashes are therefore more complete evidence of this task's changes than the current Git diff alone.

- **390×844, Hero 95%:** the SatQuery evidence caption's text reached **x=407.58px** in a 390px viewport. The stage hid its final characters without creating a scrollbar.
- **430×932, Hero 80%:** the surname's wrapper occupied **x=−3.81…433.81px**, width **437.63px**, exceeding the stage. The type crowded/cropped the edges; later intermediate states also put actual text rectangles outside the viewport.
- **391px:** the responsive breakpoint exposed the same name/caption problem. The ≤390px fixed name size had masked the oversized fluid rule immediately above that breakpoint.
- **Dayflow:** the exact **twenty** reported nodes reproduced: twelve text elements in four architecture cards and eight labels/numbers in four workflow steps. Their initial measured ratios were **2.02–3.38:1**. They already passed after complete reveal, in Work reading mode and in reduced motion.
- **Contact monument:** reduced/static Contact reproduced the outlined ANIRUDH warning at **1.03:1**.
- **Additional confirmed Contact text:** the opening's two-line caption used `#536872`, and final metadata used `#5f747e`. Even against the darkest possible base surface their ratios were only **3.39:1** and **4.05:1**. Both were examined at full-opacity readable holds, rather than inferred from a fade frame.

Baseline evidence: [inspection](qa/f05-accessibility-polish/before/inspection.json), [Contact measurements](qa/f05-accessibility-polish/before/contact-readable.json), and [starting Git state](qa/f05-accessibility-polish/before/git-status.txt).

## 2. Root causes

**Hero identity:** the mobile `15.5vw` name scale, tight tracking and intrinsic unbroken surname width exceeded the narrow stage. The existing identity exit also enlarges the composition to 1.035 scale. Stage clipping concealed overflow instead of making the type fit.

**Hero evidence:** the image montage intentionally extends beyond the right edge. Its caption inherited the same wide figure, without a separate width budget for readable text. Moving or shrinking the entire image would change the intended composition; wrapping the caption solves the content constraint independently.

**Dayflow:** architecture/workflow cards started at 0.38/0.35 opacity. That composited otherwise adequate text colors into very dark foregrounds. These are partially visible diagram labels throughout the staged presentation, including when scrolling pauses before their sequential highlights. They differ from text that begins absent and is explicitly entering through a reveal.

**Contact:** small informational text inherited overly dim colors. Decorative signal paths also prevented axe from determining some backgrounds, so “zero violations” in those cinematic scans was not evidence of sufficient contrast. Manual color assessment identified the two confirmed readable-state failures.

## 3. Exact changes

Only three application files changed:

| File | Change |
| --- | --- |
| `src/sections/Hero.module.css` | Within the existing ≤767px rule, changed the name scale from `15.5vw` to `14vw`, preserving clamp limits and the existing ≤390px rule. Constrained evidence captions to `calc(50vw - 1rem)` and allowed wrapping with `overflow-wrap:anywhere`. |
| `src/sections/work/DayflowMotion.tsx` | Introduced a shared **0.75 readable opacity floor** for the initial and `fromTo` starting states of architecture/workflow cards. Final opacity, durations, trigger positions, transforms, border transitions, connector signals and sequencing are unchanged. |
| `src/sections/contact/Contact.module.css` | Changed the opening caption and final metadata to `#728a95`. Added `#070a0c` backing behind the actual text to make contrast independent of decorative paths. Metadata backing fits its text instead of stretching across phone rows. |

Hero's GSAP source, timeline and image dimensions/transforms are unchanged. No overflowing text was hidden, truncated or removed. Desktop Hero rules are unchanged. No ARIA, semantic visibility, focus handling, project narrative, asset, dependency, configuration or build-script change was made.

Hash comparison verifies preservation of the other application files and dependency/configuration files. All **eleven emitted WOFF2 files** are unchanged. F03's unverified-demo status/certificate and F04's 11px, 4.60:1 footer remain intact. See [source preservation](qa/f05-accessibility-polish/after/source-preservation.json) and [isolated task diff](qa/f05-accessibility-polish/after/task.patch).

## 4. Before/after screenshots

| State | Before | After |
| --- | --- | --- |
| 390×844 Hero evidence, 95% | [Cropped caption](qa/f05-accessibility-polish/before/hero-390x844-0.95.jpg) | [Complete wrapped caption](qa/f05-accessibility-polish/after/hero-390x844-0.95.jpg) |
| 430×932 Hero identity, 80% | [Oversized surname](qa/f05-accessibility-polish/before/hero-430x932-0.8.jpg) | [Complete fitted identity](qa/f05-accessibility-polish/after/hero-430x932-0.8.jpg) |
| Dayflow architecture, staged | [Dim labels](qa/f05-accessibility-polish/before/dayflow-architecture-0.jpg) | [Readable labels, same staging](qa/f05-accessibility-polish/after/dayflow-architecture-0.jpg) |
| Dayflow workflow, intermediate | [Before](qa/f05-accessibility-polish/before/dayflow-transaction-0.5.jpg) | [After](qa/f05-accessibility-polish/after/dayflow-transaction-0.5.jpg) |
| Contact opening, desktop | [Before](qa/f05-accessibility-polish/before/contact-readable-1440-0.05.jpg) | [After](qa/f05-accessibility-polish/after/contact-readable-1440-0.05.jpg) |
| Contact metadata, phone, final hold | [Before](qa/f05-accessibility-polish/before/contact-readable-390-1.jpg) | [After](qa/f05-accessibility-polish/after/contact-readable-390-1.jpg) |
| Reduced-motion Contact monument | [Before](qa/f05-accessibility-polish/before/contact-reduced.jpg) | [Retained](qa/f05-accessibility-polish/after/contact-reduced.jpg) |

The corrected 390px caption wraps into complete lines ending at **x=333.98px** and **266.07px**, retaining the original 8.32px typography and intentional image crop. At 430px the surname changes from **66.65px to 60.2px**; its text spans **x=20.95…409.03px**. The full name remains readable during entry, hold, enlargement/exit and reverse samples. Animated background details vary with capture time; these are visual comparisons, not whole-frame pixel-identity assertions.

## 5. Before/after contrast measurements

Normal text is assessed against the unrounded **4.5:1** AA threshold described in [W3C SC 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). Dayflow results below are axe's displayed computed-color ratios, including the ancestor opacity rather than just the declared text token.

| Dayflow element family | Count | Original staged ratio | Minimum after, across inspected states | Fully resolved / reading / reduced |
| --- | ---: | ---: | ---: | ---: |
| Architecture layer numbers | 4 | 2.20:1 | **4.94:1** | 7.62:1 |
| Architecture titles | 4 | 3.38:1 | **9.53:1** | 15.94:1 |
| Architecture details | 4 | 2.36:1 | **5.61:1** | 8.83:1 |
| Workflow labels | 4 | 2.76:1 | **8.64:1** | 14.86:1 |
| Workflow numbers | 4 | 2.02:1 | **5.04:1** | 8.16:1 |

Every one of the twenty elements was inspected in **sixteen states**: both section timelines at 0%, 25%, 50%, 75%, 100%, reverse to 50% and 0%, plus Work reading and reduced-motion modes. All **320 individual after measurements** meet normal-text AA. Their ordinary full-opacity colors were retained. See [per-element review](qa/f05-accessibility-polish/after/dayflow-element-review.json).

| Contact text | Before | After, readable hold |
| --- | ---: | ---: |
| ONE SIGNAL / WAITING FOR ANOTHER CONNECTION | At best 3.3948:1 on the base surface | **5.4690:1** |
| BASE / FIELD / SIGNAL metadata | At best 4.0520:1 on the base surface | **5.4690:1** |
| Decorative outlined ANIRUDH | axe 1.03:1 | **Unchanged; decorative classification below** |

The corrected Contact pair is `#728a95` on an actual opaque `#070a0c` text backing, at full opacity. Before, the transparent backing could only have a lower ratio when the background was lighter than its base. Both phone and desktop readable holds were measured. Full raw scans retain intermediate fade warnings and background-related incomplete results; they are not represented as all-frame passes.

## 6. Mobile and viewport results

Each requested size received **29 focused Hero samples**, including identity/evidence intermediate positions and reverse travel. Tests inspect actual text rectangles and whether the name fits its reveal masks, not just document scroll width.

| Viewport | Focused Hero states after | Production Chrome states | Hero clipped text / document overflow after |
| --- | ---: | ---: | --- |
| 360×800 | 29 | 82 | 0 / 0 |
| 390×844 | 29 | 81 | 0 / 0 |
| 430×932 | 29 | 80 | 0 / 0 |
| 768×1024 | 29 | 90 | 0 / 0 |
| 1280×720 | 29 | 122 | 0 / 0 |
| 1280×800 | 29 | 116 | 0 / 0 |
| 1440×900 | 29 | 117 | 0 / 0 |
| 1728×1117 | 29 | 114 | 0 / 0 |

Additional 391px, 600px and 767px checks bring the focused total to **319 Hero states**. The original sample set contained 21 states with viewport-clipped text across the affected widths; the same set after correction contains **zero**. The original targeted production audit also passes its Hero 80%, 95% and end checks at five sizes, with no horizontal text candidates.

At widths ≥768px, all recorded Hero text rectangles and font sizes match the starting build. Images retain their existing width rules, cropping and GSAP transform choreography. See [focused inspection](qa/f05-accessibility-polish/after/inspection.json), [targeted audit](qa/f05-accessibility-polish/after/targeted.json), and [comparison](qa/f05-accessibility-polish/after/regression-comparison.json).

## 7. Keyboard and accessibility results

The existing F02 suite passes all seven cases:

- All six project headings and meaningful content remain exposed in document order in Chrome's accessibility tree.
- Native Tab/Shift+Tab reaches the existing project actions with visible focus. The sequence remains **twenty stops**, including the corrected MediFit certificate and all three Contact links.
- Contact navigation → Enter → Tab reaches email. Reverse scroll and live reduced motion retain the focused real action.
- Work reading mode accepts Enter/Space, preserves content and actions, and restores **41 triggers** after repeated cycles. Native scrolling keys remain usable.
- Cold reduced motion has zero triggers; no-JavaScript Contact remains usable at desktop, phone and short-height baselines.

**Contact monument classification:** it is repeated decorative branding, not the source of the person's identity, a heading or a control. Both cinematic and static monuments already had `aria-hidden="true"`; those attributes were not added or changed to affect the audit. Chrome's actual partial accessibility trees confirm both are ignored in cinematic, reduced-motion and no-JavaScript modes. The ordinary visible site identity reads **ANIRUDH SHASHIKUMAR**; the Contact region contains the real heading **Contact Anirudh Shashikumar** and a correctly named email link. These remain available independently of the monument.

The decision to retain the outlined visual follows the distinction for decorative content in [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text content guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html). It is a documented manual classification, not an automated-rule suppression. The 1.03:1 raw warning remains saved.

The initial whole-document F02 scan now has **zero rule violations**, down from twenty contrast nodes at this task's start. Work reading mode also has zero violations. Static Contact still records its decorative monument warning. See [F02 results](qa/f05-accessibility-polish/after/accessibility-f02/results.json), [decorative/semantic verification](qa/f05-accessibility-polish/after/decorative-contact.json), and [Contact mode evidence](qa/f05-accessibility-polish/after/contact-readable.json).

## 8. Cinematic regression and command results

| Validation | Result |
| --- | --- |
| `npx eslint src/` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build:webpack` | Pass; Next.js 16.4.3 production build |
| `git diff --check` | Pass |
| Existing About content tests | 4/4 pass |
| Existing About motion suite | Pass: 20 holds, 76 boundaries, 65 viewport samples, reverse states, reader focus and cleanup |
| Existing ScrollDiscovery suite | Pass: seven viewports, 25 behavior cases |
| Existing F02 accessibility suite | Seven cases pass |
| Existing F03/F04 verification | Seven cases pass; certificate/status/footer preserved |
| Existing production Chrome/WebKit matrices | 802 + 318 = **1,120 states** |
| Existing targeted production audit | Completes; Hero clipping candidates removed, raw contrast candidates retained for classification |
| Supplementary production audit | All six Work reverse signatures match; WebGL fallback and WebKit anchors/reader/reduced checks pass |
| Isolated actual wheel input | Nine regions / 108 states pass: slow, fast and reverse at Hero, all six projects, About and Contact |
| Full and production npm audits | Both report **zero vulnerabilities**; dependency files unchanged |

Across the matrix there are zero page errors, failed requests, loaded-but-broken image records, horizontal document overflows or active scrub-progress mismatches. Chrome's three and WebKit's two original mobile horizontal text candidates are gone. Scroll positions, trigger counts and cinematic/editorial modes match the F03/F04 baseline; one 768px sample differs by 1px in measured document height. No desktop Hero text geometry change is recorded.

The final Contact backing was refined to fit the text, then lint/type/build, the full Chrome/WebKit matrices, F02 and Contact measurements were repeated. No timeline or semantic change followed the broader checks. The existing Three.Clock deprecation, external-lockfile notice and Node module-type notice remain unrelated. No performance improvement is claimed.

Temporary copies of the original About/ScrollDiscovery/production scripts changed only output-directory constants, preserving older evidence. They were removed after testing. Reproduction details and logs are in [qa/f05-accessibility-polish](qa/f05-accessibility-polish/README.md).

## 9. Remaining accessibility findings

The following raw candidates remain recorded. The initial scan's zero result is not a whole-site accessibility pass:

1. **Explicit reveal/fade frames:** a Dayflow authorization-heading fragment at about 0.108 opacity measures **1.29:1** during its entry, while its fully revealed state measures **16.92:1**. Contact metadata at 95% of the total timeline is still only about 0.458 opacity and measures **2.00:1**; at the final readable hold it is 1 opacity and measures **5.47:1**. These are preserved transition frames, outside the corrected twenty persistent card labels. They are not claimed to pass contrast at every instant. Because motion is scroll-directed, pausing can hold such a frame; this report does not invent a time-bounded exception or certify those frames as WCAG-conformant.
2. **Decorative text:** the static Contact monument's **1.03:1** warning remains, classified above. Targeted Work scans also retain **2:1 inactive coordinate-rail numbers**. Source review confirms these are existing noninteractive markers inside the decorative `aria-hidden` rail, not keyboard controls; actual project headings, numbers and reading content remain available. Their raw nodes remain in `targeted.json`.
3. **Manual-review results:** axe retains incomplete contrast checks over SVG/image backgrounds, masks and layered typography. Their absence from the violation list is not treated as proof of compliance. The two confirmed Contact foreground failures were fixed using explicit opaque text backgrounds.
4. **Coverage limits:** browser accessibility-tree and keyboard checks were performed; an actual VoiceOver/speech-output session remains unverified under the previously documented access restriction. No alternate mechanism bypassed that restriction. WebKit automation is not physical-device, Safari application or Safari/VoiceOver certification.

No confirmed failing **intended readable hold** remains among the twenty Dayflow elements or the two corrected Contact text treatments. Full-site/all-frame accessibility acceptance remains a separate review scope.

## 10. Release readiness

**F05 is closed within the tested viewport/state coverage.** The name and evidence captions fit through intermediate and reverse states without removing cinematic motion or intentional image cropping. The twenty reported Dayflow elements now pass normal-text AA throughout their inspected staged/resolved/reading/reduced states. Confirmed Contact informational-text failures are corrected, and the monument is preserved with meaningful identity semantics independently available.

F01–F04 corrections are preserved. This is completion of the verified implementation scope, not an unrestricted release or full WCAG-conformance sign-off. The transition/incomplete-result review and real assistive-technology acceptance above remain, together with the original audit's unrelated metadata, placeholder-action, claim-evidence and asset-metadata release items. No commit or deployment was performed by this agent; unrelated working-tree changes and shared history were retained.
