# About motion audit — 2026-10-12

Before implementation, inspected About.tsx, AboutStory.tsx, aboutContent.ts, About.module.css, ScrollMotion, SmoothScroll, ViewportProvider, shared refresh scheduling, WorkExit, Contact, global tokens, responsive and reduced-motion branches. Read the installed Next 16.3.5 client, image and CLI guides.

The referenced `content/about-final-composition.md` is absent from this checkout (also absent from available project files). The existing shared content model and its twenty normalized reading plates are the authoritative available copy. Preserve all eleven movements, paragraphs and qualified claims; do not invent a replacement specification.

## Findings

1. M02–M08 have static diagrams/lists and archival images. M10 reveals its entire statement at once. M09's stillness is appropriate.
2. Every plate uses the same .004 entry / .003 exit, largely opacity with 12px settling, then a hard visibility switch. These are presentation swaps rather than perceived transformations.
3. Existing animation: plate visibility/settling, inherited geometry fade, a rotating/scaling vertical trace, closing punctuation → dot. No path progression, layer assembly or workflow compression.
4. One normalized `about-story` timeline already exists. Retain one sticky stage and one story trigger; no nested pins.
5. `scrub: true` maps directly to scroll. Lenis uses one GSAP ticker with .18 lerp on fine-pointer desktop; no extra smoothing is needed.
6. WorkExit supplies a central vertical axis, but About's trace is offset from it. Technical continuity is mostly symbolic and the line floats independently of diagrams.
7. Unequal ranges exist, but at 1100svh the twenty reading plates have only roughly 315–720px of travel at 900px height. Dense copy needs more distance and a resolved hold, not longer animation catch-up.
8. Mobile/tablet/short desktop is complete natural editorial flow, but entirely static. Preserve flow; use a bounded visibility observer rather than twenty scroll triggers.
9. No About RAF, Canvas, WebGL or per-scroll React state. Existing duplicate decorative reading plates and diagrams add DOM; share repeated diagrams across adjacent plates. Keep certificate sizes/async decode; preload only when approaching About.
10. Reuse ViewportProvider capability policy, gsap.context cleanup, direct scrub, and scheduleScrollRefresh. Reduced motion/no JS must keep the full semantic article. Reader control preserves chapter and focus.

## Implementation direction

A single persistent SVG with equal-topology path poses: inherited axis → elementary webpage baseline → routed learning path → adaptive relationships → vertical model/product connection → horizontal workflow → compressed lifecycle → temporal baseline → complete withdrawal. Own diagrams across related reading plates so they do not reset at internal boundaries. Mask complete lines, never characters. Spend about 18% on reveal, at least 60% on settled reading; separate dense body changes from diagram motion. No pointer tilt: archival evidence and elegant diagrams benefit from stable inspection. M09 retains intentional stillness.

Baseline browser measurements are saved in `qa/about-motion/before.json`; limitations and final verification go in `about-motion-verification.md`.
