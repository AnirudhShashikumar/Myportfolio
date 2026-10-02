# Production motion hardening

## Audit before optimization

The starting checkout was clean. Production webpack build passed before changes.

| System | Ownership / scheduling | Baseline findings |
| --- | --- | --- |
| Global | Lenis advances on GSAP ticker; Lenis scroll calls ScrollTrigger.update. Native scroll owns page Y. | One Lenis RAF, but default smoothing stacks with numeric scrub. Lenis instantiated on touch as well. |
| Viewport | One resize listener writes context width/height; motion media query listener. | About/Contact effects depend on every width value and rebuild on resizing. No fine-pointer or document-visibility policy. |
| Hero | One elapsed-time introduction and one normalized scroll timeline; CSS sticky stage in 500svh section. Shared pointer ref. | Pointer measures stage on every move. IntersectionObserver watches tall section, so WebGL remains active after sticky stage is leaving. |
| IntelligenceScene | R3F useFrame; precomputed geometry; 13 small draw groups, no lights/postprocessing. DPR capped 1.5/1. | No object allocations in useFrame. Demand when Hero inactive/reduced motion. Damped scroll transforms can trail scroll. WebGL probe creates an extra context. |
| HeroKineticGrid | Canvas 2D own wake-on-demand RAF, springs; DPR 1/1.25/1.5. | Stops when settled/offscreen; mobile physics disabled. Draw projects nodes repeatedly and allocates objects/candidate arrays. Both resize observer and window resize. |
| SatQuery | One scrub 0.55 timeline, 200svh CSS sticky stage. | Numeric catch-up delay; opacity-only product hiding permits focus in invisible content. 74 descendants at 1440x900. |
| Gesture Globe | One scrub 0.45 timeline, CSS sticky. Static SVG landmarks and optimized Next images. | Numeric delay; 330 descendants, most SVG landmarks. No continuous RAF. |
| AlgaeOS | Local flow/telemetry/image/reveal ScrollTriggers, one-shot sensor/statement. | 0.4–0.6 scrub delays, decorative clip-path reveal; no continuous loop. |
| Dayflow | Desktop >=901px matchMedia; several play/reverse section timelines. | Long time-based sequences keep running after fast scroll; routing tail delays completion. |
| MediTwin | Desktop >=901px matchMedia; several play/reverse timelines. | Long sequential entry/story, repeated left-position signals, large image masks; permanent will-change. |
| MediFit | Desktop >=901px matchMedia; several play/reverse timelines. | Long sequential story/results; top/left-position signals, large masks; permanent will-change. |
| Five handoffs | One direct-scrub timeline per boundary; outgoing/incoming own X, nested copy/geometry own local X. CSS sticky, not GSAP pin. | Correct deterministic mapping. Two decorative worlds, full SVG blur, fixed rail backdrop blur, permanently promoted layers on all five boundaries. No project animation inside handoff itself. |
| Work coordinate | One ScrollTrigger. Measures boundary ranges on refresh; styles six nodes each update. | Correct cached layout reads, but repeats unchanged style/attribute writes through long project sections. |
| Lab | One reveal; global section field and boundary scrub. | Simple DOM; no RAF/pointer/Canvas. |
| About | One normalized scrub 0.25/0.55; CSS sticky, static SVG, masked certificates. | No continuous RAF, proper context cleanup. Width changes rebuild timeline; stacking smoothers. Reduced-motion editorial DOM. |
| Contact | One normalized scrub 0.25/0.5; CSS sticky, masked signal SVG and large type. | Every mouse event reads layout and updates mask vars. Width changes rebuild. Actions hidden with autoAlpha but no explicit phase focus policy. Reduced-motion editorial DOM. |
| Footer | Static semantic content and anchor. | No animation loop; back-to-top touch target small. |
| Global ScrollMotion | Progress trigger, parallax/decorative field/boundary triggers, header scroll listener, main ResizeObserver. | Individual feature refreshes + main observer + anchor timers can cause refresh bursts. Header attribute rewritten each scroll. |

All project facts, order, typography, and narrative are preserved. No content-visibility will be applied to measured sticky regions.

## Profiling method

Local production build, identical iframe viewport and synthetic wheel replay for all five boundaries. The local-only harness records requestAnimationFrame intervals, PerformanceObserver long tasks where supported, active GSAP project timelines, trigger count, and Hero draw calls. These are environment-specific browser observations, not physical-device FPS guarantees. Responsive/browser QA and final results are appended after implementation.
