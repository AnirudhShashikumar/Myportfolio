# Dependency security remediation — F01

**Project:** Anirudh Shashikumar Portfolio

**Date:** October 25, 2026, IST

**Scope:** F01 in [the production audit](PORTFOLIO_PRODUCTION_AUDIT.md). Dependency remediation and local production regression verification only. No commit or deployment.

## 1. Original dependency versions

Fresh audits reproduced the original finding against the installed tree and lockfile:

| Package | Installed before | Ownership / affected paths |
| --- | --- | --- |
| next | 16.3.5 | Direct production dependency; `node_modules/next` |
| eslint-config-next | 16.3.5 | Direct development dependency; updated with the framework for alignment |
| sharp | 0.35.4 | Production: `next → sharp` |
| source-map-js | 1.2.1 | Production: `next → postcss@8.5.23 → source-map-js`; also shared by development PostCSS/Tailwind paths |
| brace-expansion | 1.1.18 | Development: `eslint → minimatch@3.1.5 → brace-expansion` |
| brace-expansion | 5.0.9 | Development: `eslint-config-next → typescript-eslint → @typescript-eslint/typescript-estree → minimatch@10.2.6 → brace-expansion` |
| zod | 4.6.5 | Development: `eslint-config-next → eslint-plugin-react-hooks → zod`, also through `zod-validation-error` |

The one directly vulnerable manifest dependency was Next.js. Sharp, source-map-js, brace-expansion and Zod were transitive findings. eslint-config-next itself was not listed as a vulnerable package.

Original manifests, complete advisory records and installed paths are retained in [before/](qa/dependency-security/before/), including [the dependency tree](qa/dependency-security/before/dependency-tree.txt) and [advisory summary](qa/dependency-security/before/advisory-summary.json).

## 2. Updated versions and selection

| Package / family | Resolved after | Reason |
| --- | --- | --- |
| next, eslint-config-next | **16.4.3**, exact manifest pins | Current stable Next 16 release, with matching lint configuration |
| @next/env, @next/eslint-plugin-next, @next/swc-* | 16.4.3 | Framework-owned packages aligned by npm |
| sharp, @img/sharp-* | **0.35.5** | Patched image-processing release required by Next 16.4.3 |
| @img/sharp-libvips-* | **1.3.4** | Sharp's corresponding prebuilt native libraries |
| source-map-js | **1.2.2** | Patched compatible resolution |
| brace-expansion | **1.1.21 / 5.0.12** | Patched releases in each existing dependency range |
| zod | **4.6.7** | Current compatible patch, beyond the advisory's 4.6.6 minimum |

The registry's stable tag and official release notes were checked again on the remediation date. The minimum Next 16 version addressing the October critical advisories is 16.4.1. **16.4.3 was deliberately selected instead:** it is the current stable release and includes subsequent fixes, including extensionless Google Font URLs in both bundlers. See the official [16.4.1 security release](https://github.com/vercel/next.js/releases/tag/v16.4.1), [16.4.2 fixes](https://github.com/vercel/next.js/releases/tag/v16.4.2), [16.4.3 release](https://github.com/vercel/next.js/releases/tag/v16.4.3) and [support policy](https://nextjs.org/support-policy).

Implementation: edit the two framework pins, run `npm install --no-audit`, then `npm update source-map-js brace-expansion zod --no-audit`. This respects the existing PostCSS/Tailwind, minimatch and React Hooks plugin dependency ranges. No overrides or new direct dependencies were needed. `npm ci --no-audit` then verified a reproducible installation without changing the resulting lockfile.

The lockfile contains 43 package-version changes, all within the families above, including optional platform binaries. No packages were added or removed. Entries whose versions did not change remained identical, apart from the root's two manifest pins. See [the complete version diff](qa/dependency-security/after/lockfile-version-diff.json) and [installed tree](qa/dependency-security/after/dependency-tree.txt).

React/React DOM 19.2.8, GSAP 3.15.0, Lenis 1.3.26, Three.js 0.186.0, R3F 9.7.0, Drei 10.7.8, Tailwind/PostCSS integration 4.3.3, TypeScript 5.9.3 and ESLint 9.39.5 remain unchanged. No `npm audit fix --force` or manual node_modules editing was used.

## 3. Advisories addressed

The before audit contains **17 distinct GHSA IDs across five vulnerable package names**; 13 IDs occur in the production audit. These are advisory identifiers, not 17 demonstrated application exploits.

Next.js 16.4.3 removes all eleven original Next advisory records:

| Advisory | Issue | First patched Next 16 release in audit / maintainer records |
| --- | --- | --- |
| [GHSA-vcvr-r3jv-pc5j](https://github.com/vercel/next.js/security/advisories/GHSA-vcvr-r3jv-pc5j) | Node `next/og` ImageResponse RCE | 16.3.6 |
| [GHSA-3w37-wq28-93x7](https://github.com/vercel/next.js/security/advisories/GHSA-3w37-wq28-93x7) | Pending cache-fill Draft Mode disclosure | 16.3.8 |
| [GHSA-4jqv-mc3x-m676](https://github.com/vercel/next.js/security/advisories/GHSA-4jqv-mc3x-m676) | Self-hosted SSG/ISR cache poisoning | 16.3.8 |
| [GHSA-39w2-rjm5-chcv](https://github.com/vercel/next.js/security/advisories/GHSA-39w2-rjm5-chcv) | Development MCP endpoint disclosure | 16.3.8 |
| [GHSA-f87g-xv8r-7p7x](https://github.com/vercel/next.js/security/advisories/GHSA-f87g-xv8r-7p7x) | Metadata image route dynamicParams bypass | 16.3.8 |
| [GHSA-mcj8-r9mp-w47p](https://github.com/vercel/next.js/security/advisories/GHSA-mcj8-r9mp-w47p) | SSG/ISR cross-user substitution / persistent DoS | 16.3.8 |
| [GHSA-cjq9-62q9-8jv4](https://github.com/vercel/next.js/security/advisories/GHSA-cjq9-62q9-8jv4) | Image optimizer SSRF | 16.3.8 |
| [GHSA-h694-7cp9-m8p3](https://github.com/vercel/next.js/security/advisories/GHSA-h694-7cp9-m8p3) | Nested cache root-parameter leak | 16.3.8 |
| [GHSA-2464-fhr4-w9xw](https://github.com/vercel/next.js/security/advisories/GHSA-2464-fhr4-w9xw) | Image optimization / SVG RCE | 16.4.1 |
| [GHSA-p3m5-59mp-jv5r](https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r) | Server Action DoS | 16.4.1 |
| [GHSA-673q-mjm6-r5xr](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr) | Typed-array cache result RCE | 16.4.1 |

The [16.3.8 security release](https://github.com/vercel/next.js/releases/tag/v16.3.8) and 16.4.1 release enumerate the relevant fixes. For SSRF, the individual maintainer page still contains placeholder patch-version text; the published release and fresh npm advisory ranges establish the concrete 16.3.8 boundary.

Other addressed records:

- **Sharp:** [GHSA-wq5f-xc86-pv6w](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w), librsvg CVE-2026-96889. The [0.35.5 release](https://github.com/lovell/sharp/releases/tag/v0.35.5) ships patched prebuilt libraries. The local loaded runtime now reports Sharp 0.35.5, libvips 8.18.7 and librsvg **2.63.2**.
- **source-map-js:** [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q), indexed-source-map event-loop DoS; addressed by the maintainer's [1.2.2 release](https://github.com/7rulnik/source-map-js/releases/tag/v1.2.2).
- **brace-expansion:** [GHSA-q2hr-2g5m-vwhr](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-q2hr-2g5m-vwhr), [GHSA-qhr7-859c-m2p7](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-qhr7-859c-m2p7) and [GHSA-6j4f-fj2g-mc7p](https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-6j4f-fj2g-mc7p), CPU/stack exhaustion; resolved in the existing 1.x and 5.x lines. Maintainer tags: [1.1.21](https://github.com/juliangruber/brace-expansion/releases/tag/v1.1.21), [5.0.12](https://github.com/juliangruber/brace-expansion/releases/tag/v5.0.12).
- **Zod:** [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), oversized collection memory exhaustion; the maintainer's [bounds-check fix](https://github.com/colinhacks/zod/pull/6652) and [4.6.7 release](https://github.com/colinhacks/zod/releases/tag/v4.6.7) were consulted.

Applicability remains conditional: the image RCE advisories describe particular glibc Linux conditions; the inspected application uses local JPEGs and has no upload endpoint. No `next/og` ImageResponse, Server Actions, `use cache`, Cache Components configuration or `images.remotePatterns` was found. The SSRF advisory explicitly excludes apps without remotePatterns. No application input path accepting hostile source maps, brace patterns or constrained Zod collections was demonstrated. Those limits did not substitute for patching the affected versions. No exploit payload was run.

## 4. Remaining advisories and security verification

| Audit | Before | After |
| --- | --- | --- |
| `npm audit --omit=dev` | **3 packages: 1 critical, 2 high** | **0 vulnerabilities**, exit 0 |
| `npm audit` | **5 packages: 1 critical, 4 high** | **0 vulnerabilities**, exit 0 |

Both after JSON results have an empty `vulnerabilities` object and total zero. There are **no remaining reported advisory paths**, in production or development, as of this run. This describes the registry advisory database at verification time, not a guarantee against undisclosed vulnerabilities or later advisories.

Evidence: [production audit text](qa/dependency-security/after/npm-audit-production.txt), [production JSON](qa/dependency-security/after/npm-audit-production.json), [full audit text](qa/dependency-security/after/npm-audit.txt), [full JSON](qa/dependency-security/after/npm-audit.json). The preceding table in section 1 and before JSON retain the affected paths rather than erasing the original findings.

## 5. Compatibility changes

Version-matched upgrade, image and font guides were read from `node_modules/next/dist/docs/` before and after installation, as required by AGENTS.md. Its bundled-docs reference remains valid. The [16.4 announcement](https://nextjs.org/blog/next-16-4) was also reviewed. New Cache Components and experimental features were not enabled.

The installed Next and Sharp releases require Node **20.9+**; Next's guide requires TypeScript **5.1+**. This host's Node 24.14.1 and TypeScript 5.9.3 satisfy those requirements. Next's React peer range accepts the existing React 19.2.8. eslint-config-next 16.4.3 accepts ESLint 9+; the complete installed tree reports no peer-dependency error. The framework includes its own updated internal runtime, while the application's React pins are unchanged.

No API migration, codemod, configuration change or application repair was needed. The webpack production path and all existing scripts were preserved. The build now warns that a package-lock outside this Git repository is ignored; the project uses its own lockfile correctly, so no tracing-root workaround was introduced.

## 6. Application files modified

**None.** No file in `src/`, public asset, stylesheet, animation timeline, scrolling provider, `next.config.ts` or `eslint.config.mjs` was changed.

Implementation changes are limited to `package.json` and the npm-generated `package-lock.json`. This report and [separate QA evidence](qa/dependency-security/README.md) were added. The original production audit and test scripts were preserved. Temporary runner copies only redirected evidence output and were removed after the run.

## 7. Tests executed

| Check | Result |
| --- | --- |
| Clean `npm ci --no-audit` | Pass; locked dependency installation |
| Production and full `npm audit`, text and JSON | Pass; zero reported vulnerabilities |
| `npm ls next sharp source-map-js` plus brace-expansion/Zod and full tree | Pass; patched installed versions, no invalid peers |
| `npx eslint src/` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm run build:webpack` | Pass; Next 16.4.3, static home and not-found routes |
| `node --test scripts/about-content.test.mjs` | **4/4 pass**, including complete production HTML biography |
| Existing About motion suite | Pass; 20 holds, 76 boundary samples, 65 viewport samples across eight sizes, reverse signatures, jumps, wheel input, reader focus and reduced motion |
| Existing ScrollDiscovery suite | **7 viewports / 25 behavior cases pass**, no page errors |
| Existing production browser audit | Chrome/WebKit matrices, lifecycle, targeted, extra and zoom modes completed; comparisons below distinguish existing findings |
| Before/after performance audit and blank-page frame control | Completed; measurements and limitations below |
| `git diff --check` | Pass |

The supplemental `extra` audit initially failed to find WebKit because its temporary browser-cache environment variable was omitted. It was rerun successfully with `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/portfolio-audit-browsers`; [the initial runner error](qa/dependency-security/after/extra-runner-path-attempt.txt) and [successful rerun](qa/dependency-security/after/extra-log.txt) are retained. No application change was involved. Native Node test runs retain the existing module-type warning.

Logs and reproduction instructions are in [the evidence README](qa/dependency-security/README.md). Original suite hashes and the final lockfile hash are in [run-environment.json](qa/dependency-security/run-environment.json).

## 8. Browser and interaction regression results

Chrome **155.0.8059.85**: eight viewports, 360×800 through 1728×1117, **802 sampled states**. Playwright WebKit: 390×844, 1280×720 and 1440×900, **318 states**. Sample counts match the pre-upgrade matrices.

- Hero initial composition and scroll identity/evidence transitions, all six Work projects, their horizontal handoffs in both directions, About's narrative, Contact and the scroll indicator remain present.
- Across both matrices: **zero page errors, failed requests, loaded-but-broken image records, document horizontal overflow or active scrub/animation progress mismatches**. No hydration error appeared in captured page/console diagnostics. Known favicon 404 and Three.Clock deprecation warnings remain.
- All six Work sections reconstruct identical sampled styled-element signatures after 60% → 95% → 60% travel. About's reverse signatures also pass. Slow wheel/trackpad input, larger/faster deltas, reverse input and instant seeks remain functional. No stale sampled GSAP state was found.
- Work/About/Contact/Lab direct-entry samples reproduce the baseline positions. WebKit anchor and reader checks also complete. ScrollDiscovery's suite covers anchors, history, mid-work refresh, keyboard, touch, focus, reduced motion and visibility/pageshow fixtures.
- Desktop/mobile resize cycles return to **41 triggers** every time. Live reduced motion leaves **zero** triggers; About uses editorial content on a coarse-pointer phone and retains all eleven readings. Reader mode preserves M09 in the dedicated regression suite.
- A forced WebGL-unavailable run still resolves Hero and retains four navigation links without a page error. No rendering feature was removed to make testing pass.
- Generated CSS and all **11 WOFF2 font files are byte-identical** before/after. Visual inspection of side-by-side captures found matching typography and composition for desktop Hero, all six projects, About, Contact, and mobile Hero/About/Contact. See [comparison 1](qa/dependency-security/after/visual-comparison-1.png), [2](qa/dependency-security/after/visual-comparison-2.png), [3](qa/dependency-security/after/visual-comparison-3.png) and [responsive comparison](qa/dependency-security/after/visual-comparison-responsive.png). Animated graphics naturally differ by capture time; no pixel-perfect whole-frame claim is made.
- Six Chrome comparison samples differ only by **one pixel of reported document height**; their scroll positions, trigger counts and cinematic modes match. Both runs already vary by a pixel during these mobile transitions. No larger geometry difference was recorded. WebKit's compared geometry matches throughout.

This is a **regression pass**, not a clean accessibility or launch audit. The same footer contrast failure, semantic visibility limitations, mobile Hero clipping and no-JavaScript Contact limitation remain documented under F02/F04/F05/F09. Existing findings were not redesigned under this dependency-only task. The narrow viewport zoom proxies remain CSS viewport reductions, not real browser UI zoom.

Evidence: [browser comparison](qa/dependency-security/after/browser-comparison.json), [Chrome matrix](qa/dependency-security/after/matrix-chrome.json), [WebKit matrix](qa/dependency-security/after/matrix-webkit.json), [lifecycle](qa/dependency-security/after/lifecycle.json), [extra](qa/dependency-security/after/extra.json), [About](qa/dependency-security/after/about/after.json), [ScrollDiscovery](qa/dependency-security/after/scroll-discovery/results.json).

## 9. Performance observations

The same Chrome/Apple M5/Node 24 host ran three cache-disabled desktop loads and three 390×844 mobile-emulated loads per version. Mobile used 4× CPU throttling and configured 150 ms latency / 200,000 B/s download. Performance runs were separate from functional suite concurrency.

| Measurement | Before | After |
| --- | --- | --- |
| HTML-referenced JavaScript, raw | 844,075 B | 848,984 B (**+4,909 B / 0.58%**) |
| Same assets, estimated gzip | 264,027 B | 266,742 B (**+2,715 B / 1.03%**) |
| Scripts actually fetched by the six-second observation | 467,960 encoded B | 470,510 encoded B (**+2,550 B**) |
| Fetched font payload | 68,936 B, fonts loaded | 68,936 B, fonts loaded |
| Initial optimized images, desktop / mobile | 67,278 / 18,130 B | 67,278 / 18,130 B |
| Local desktop LCP samples | 80 / 60 / 68 ms | 72 / 60 / 72 ms |
| Mobile-emulated LCP samples | 1000 / 1008 / 1000 ms | 1020 / 1000 / 1004 ms |
| Initial CLS, every sampled load | 0 | 0 |
| Mobile 50 ms+ tasks per load / maximum | 2 / 71 ms | 2 / 70 ms |
| Desktop 50 ms+ startup tasks | 0 | 0 |
| Hero draw calls in a one-second active sample | 420 | 420 |
| WebGL draw calls offscreen at Work/About/Contact | 0 / 0 / 0 | 0 / 0 / 0 |

The update modestly increases JavaScript transfer size. It is a security update, with **no demonstrated performance improvement**. All 44 tested optimizer variants returned 200 and decoded successfully after clearing the old optimizer cache; their MIME types, dimensions, byte counts and SHA-256 values match before/after. This establishes preservation for the tested JPEG-derived WebP responses on macOS, not every possible format or deployment platform. See [image comparison](qa/dependency-security/after/image-comparison.json).

The five 180-frame forward/reverse sweeps require a scheduling caveat. Before the upgrade, Hero/SatQuery/AlgaeOS medians were about 16.7 ms and About/Contact about 33.3 ms. Afterward all five medians were about 33.3 ms, p95 about 33.4 ms, maximum 33.5 ms; neither run recorded a scroll long task. A follow-up **blank page → portfolio → blank page** control found the same **33.3 ms median / 33.4 ms p95** on all three visible pages. This supports a host/browser frame-cadence limit in the later run; it does not establish that the dependency update halved rendering throughput. The cause of that scheduling change was not identified. These results do not certify 60 FPS after the update, and no animation was removed or altered to affect the measurement. See [frame-control.json](qa/dependency-security/after/frame-control.json).

Hero initializes WebGL and draws in every cold-load sample; first-WebGL-frame latency was not separately instrumented. Active/offscreen drawing behavior matches the fresh baseline. The single reader-control interaction measured 56 ms before / 64 ms after in Event Timing; that is not a field INP result. Native +120 wheel probes settled to +119 pixels across Hero/Work/About/Contact; the later probes observed roughly 31–33 ms event-to-scroll timing under the same approximately 30 Hz cadence.

LCP is the “WHAT I WANT” text span and can occur behind the opening veil, so it does not measure completion of the cinematic intro or perceived visual readiness. Local network emulation is not a faithful WAN benchmark, and these small samples are not field Core Web Vitals or real-device evidence. No loading-policy, font, WebGL, scrolling or image-component optimization was introduced.

Evidence: [fresh before measurements](qa/dependency-security/before/performance.json), [after measurements](qa/dependency-security/after/performance.json), [comparison](qa/dependency-security/after/performance-comparison.json), and [before](qa/dependency-security/before/bundles.json) / [after](qa/dependency-security/after/bundles.json) asset inventories.

## 10. Remaining risks

- The production host/runtime was not supplied and no deployment was performed. Production must install the reviewed lockfile, include the appropriate Sharp native optional dependencies, and run a fresh build. Local macOS results do not verify a Linux deployment or globally supplied libvips/librsvg.
- Firefox failed to initialize in the original host audit before loading the application; that environment limitation remains. WebKit is engine coverage, not Safari application or physical-device certification. Real assistive technology and field Core Web Vitals remain outside this verification.
- npm warns that the unchanged development-only ESLint 9.39.5 release is no longer supported. It has no advisory in the current audit; an ESLint major migration is separate maintenance and was not folded into F01.
- The other production-audit findings remain open. In particular, closing the dependency finding does not approve an unrestricted public launch.
- Advisories can change. Re-run both audits and the production checks when preparing the actual release; do not deploy an older build produced from the previous dependency tree.

## 11. F01 closure verdict

**F01 is closed for this checkout and the tested local production build.** The production tree moved from three reported vulnerable packages to zero, the full tree from five to zero, and the required content, cinematic motion, responsive, reduced-motion and production-browser checks found no upgrade regression requiring an application change.

No commit or deployment was made. This verdict does not close F02–F13 or certify a deployment that has not been tested.
