# Public portfolio architecture

Final public order: **Hero → Work → About → Contact**.

## 1. Files modified

Paths relative to `website/`:

| File | Change |
| --- | --- |
| `src/app/page.tsx` | Removed the active Lab section, both surrounding dividers, and their imports. Work is immediately followed by About. |
| `src/components/layout/SiteHeader.tsx` | Removed Lab from the shared desktop/mobile navigation array. |
| `src/components/system/ScrollMotion.tsx` | Added legacy Lab hash resolution on initial load, hash changes and history traversal; listeners clean up. |
| `src/sections/work/WorkNavigation.tsx` | Existing WorkExit now says NEXT / ABOUT. Its motion, styling and ownership are unchanged. |
| `src/sections/about/About.tsx` | Section indicator 03 → 02 in cinematic and editorial branches; no narrative/design/timeline changes. |
| `src/sections/contact/Contact.tsx` | Section indicator 04 → 03 in cinematic and editorial branches; no copy/design/timeline changes. |
| `scripts/motion-audit.mjs` | Removed the stale required Lab selector; added a focused Work → About regression control. Local QA only. |

Created: `src/sections/Lab.tsx`, this report, `docs/qa/public-architecture-regressions.json`, `docs/qa/about-entry-phone.jpg`, and `docs/qa/about-entry-desktop.jpg`.

## 2. Public composition

Lab is **not mounted or imported by the public page**. It contributes no DOM, scroll height, observer target, reveal trigger or hidden placeholder. The public main element's four direct children are `home`, `work`, `about`, `contact`. Both former Work–Lab and Lab–About dividers are also absent. No replacement large divider or transition was added.

## 3. Lab source preserved

The original JSX, exact source content, reveal wrapper, technical field, section label and both dividers were extracted intact into the dormant [Lab.tsx](../src/sections/Lab.tsx). Existing Lab tone support remains in SectionField, TechnicalGrid, SectionBoundary, Graphics.module.css and globals.css. Shared ScrollReveal/useScrollReveal remain available. This keeps the experience restorable without a public Lab route or empty anchor. Restoration would also require revisiting navigation, numbering and the compatibility redirect.

## 4. Navigation

Shared header navigation is Home / Work / About / Contact on desktop and phone. Footer had no Lab navigation; its existing back-to-top remains unchanged. Keyboard traversal now goes from Work directly to About, with visible focus. Work's six-project coordinate rail and order remain unchanged. About and Contact section indicators were renumbered consistently, including reduced motion.

## 5. Work → About transition

The existing 06 / 06 WorkExit is the only bridge. Its horizontal axis shrinks, peripheral archive detail fades, and the vertical signal grows. RETURN TO VERTICAL is retained; NEXT / LAB becomes NEXT / ABOUT. MediFit remains the final project; all five horizontal project handoffs and internal project stories are unchanged.

About starts immediately at Work's bottom edge. Its existing “THE SYSTEMS TELL PART OF THE STORY” → “NOW MEET THE PERSON BUILDING THEM” opening is unchanged. This pass did not expand About or redesign Hero, Work or Contact. No CSS files changed.

## 6. Stale reference audit / scroll architecture

Whole-word and broad case-insensitive Lab searches were classified rather than blindly renamed:

- Active Lab JSX and its two divider calls: moved out of the public composition.
- Header `#lab` link: removed.
- WorkExit NEXT / LAB: updated.
- QA script's mandatory `#lab` region: removed, so sweeps no longer dereference a missing section.
- Remaining source Lab occurrences: dormant implementation/theme support, plus the intentional compatibility hash check. Unrelated `label`, `aria-labelledby`, `collaboration`, and `webglAvailable` occurrences were not changed.
- Earlier performance documentation/JSON contains historical Lab QA evidence; it is not public navigation or active composition and was preserved.

ScrollTriggers derive starts/ends from actual elements; there were no hardcoded Lab pixel offsets, section-index arrays or active-nav selectors requiring a rewrite. WorkCoordinate measures Work and its five boundaries. Main ResizeObserver/global scroll progress follow the shorter page; removed Lab fields/dividers/reveal no longer create triggers. Lenis's remaining anchors still resolve actual DOM targets. Existing transform ownership, input policy, responsive branches and refresh coalescing remain intact.

Legacy `#lab` (including URI-encoded spelling) resolves to `#about` without an empty section. `history.replaceState` preserves existing history state, pathname and query; no extra history entry is pushed. Initial font/geometry settlement still follows the existing anchor mechanism. Same-document hash changes and popstate are handled, with listener cleanup.

## 7. Desktop QA

Production build inspected at **1280×800** and **1440×900**. Each received 8 forward/reverse MediFit-final/WorkExit/About-entry samples and a 36-sample whole-site section sweep. Work/About gap was 0 in every sampled position; no horizontal document overflow or active scrub mismatch was found. Axis scales reached their intended endpoints and reversed to the midpoint. Screenshots inspected the resolved exit and About opening at both sizes.

All four header links were clicked, direct legacy #lab and refresh tested, query preservation checked, and About ↔ Contact back/forward verified. Same-document #lab resolved correctly. Work → About keyboard Tab/Enter and back-to-top passed. Normal desktop proof: [About entry](qa/about-entry-desktop.jpg).

## 8. Mobile / tablet QA

Production viewport overrides at **360×800, 390×844, 430×932, 768×1024**, with coarse input simulated. Each received the same 8 transition and 36 section samples. Screenshots inspected WorkExit and About entry at all four sizes. No Lab DOM/copy/navigation, stale divider height, inter-section gap, horizontal overflow, or Work/About layout overlap was found. Scroll mappings returned correctly after reversing and resizing. Phone proof: [390px About entry](qa/about-entry-phone.jpg); its small audit-panel toggle belongs only to the local harness, not the portfolio.

These are browser viewport/capability simulations, not physical Safari/Android tests.

## 9. Reduced-motion QA

Simulated reduced motion at **390×844** and **1440×900**, with both CSS and JS policy switched by the harness. Each passed the 8 transition and 36 section samples. Public order remains Hero / Work / About / Contact; Lab and its dividers are absent. The existing complete editorial About/Contact compositions are retained. The static Work exit points to About. Screenshots confirmed readable About entry with its unchanged supporting line.

Raw results for all eight runs: [public-architecture-regressions.json](qa/public-architecture-regressions.json). No sample reported overflow, a nonzero Work/About gap, hidden-link failure, or active direct-scrub mismatch.

## 10. Validation

```text
npx eslint src/          PASS
npx tsc --noEmit         PASS
npm run build:webpack    PASS
git diff --check         PASS
```

No application test suite is configured. Dormant Lab remains type-checked/linted with the source tree. The build retains the existing nonblocking warning about an ignored home-directory package-lock.json outside the repository. No dependency changes were made.

## 11. Remaining issues

No blocker reproduced for this structural change. Real iPhone Safari / Android Chrome remain untested; previously documented upstream Three.Clock warning and physical-device performance limits remain outside this focused task. The compatibility redirect requires JavaScript, as URL fragments are not sent to the server. About expansion remains intentionally deferred.
