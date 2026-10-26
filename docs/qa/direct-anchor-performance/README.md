# Remaining F10 evidence

This folder belongs to the 26 October 2026 direct-anchor/mobile startup investigation. It does not replace previous audit artifacts. See [the report](../../DIRECT_ANCHOR_PERFORMANCE_REMEDIATION.md).

- `before/anchors.json` / `after/anchors.json`: 30 low-overhead observations per phase. Three fresh-context visits and three refreshes for desktop Home/Work/About/Contact and throttled mobile Home. `navigation.type` identifies navigate/reload; final records additionally expose `action`.
- `comparison.json` / `comparison.txt`: distributions, medians, session-window CLS, clamped anchor errors, JS bodies, first draw and LCP candidates. Final application source equals the starting snapshot; timing variation is replication variance.
- `before/diagnostic.json`, `after/diagnostic.json`, screenshots and WebM: separate startup diagnostics. Observe geometry/mode commits, native scroll, local audit-hook availability, refresh events, first paint and shift attribution. Final desktop diagnostics include the initial trigger inventory. Mutation times are enhancement-commit proxies, not exact React hydration boundaries.
- `before/mobile-stacks/`: the mobile diagnostic with geometry polling disabled, V8 sampling profile, compressed Chrome trace and derived stacks. `after/` has an equivalent mobile trace. Diagnostic overhead is excluded from the normal timing distributions. The outer `before/mobile-*` attempt included per-frame geometry reads and is retained as excluded, perturbed timing evidence.
- `before/lifecycle.json` / `after/lifecycle.json`: five forward/reverse callback sweeps, offscreen drawing, explicit-GC cycles and allocation counts. The repeated-wheel subsection inherits the prior helper's unfinished-Lenis/region-label limitation and is excluded from regional latency conclusions. Use the isolated nine-region regression for actual wheel behavior.
- `trial/`: immediate-alignment, viewport-layout-effect and browser-only automatic-anchor experiments. All fail to eliminate About CLS 1.0. `rejected-source.patch` is the discarded combined trial, not the final application patch.
- `after/navigation/`: settled direct/refresh/header/Back/Forward cases in Chrome and WebKit, including reduced motion and no JavaScript. The first harness attempt proceeded as soon as a Lenis target was within two pixels and timed out on Back. The settled runner allows another 200ms before the next navigation; this is a QA wait, not a new application delay. The separate rapid-interruption diagnostic fails in all three runs: the URL returns to Work but the old smooth target restores Contact. It is not silently certified by settled-history checks.
- `after/capability-regression/`: nine normal/unavailable/WebGL-1-only/throwing/reduced/direct-anchor cases.
- `after/regression/`: existing suite outputs and command statuses. `environment-failures/` retains the initial About launch failure caused by missing `CHROME_PATH`; no application assertion ran in that failed launch. The corrected run uses the installed Chrome binary.

External Playwright/axe/browser tools are reused; no application dependency is added. Example environment for this machine:

```sh
export PLAYWRIGHT_MODULE=/Users/anirudhshashikumar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright
export PLAYWRIGHT_BROWSERS_PATH=/private/tmp/portfolio-audit-browsers
export CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export PORTFOLIO_QA_URL=http://127.0.0.1:3001
```

Build and serve a production preview first. Do not run other browser suites or builds during performance measurements. Commands:

```sh
PERF_PHASE=after node docs/qa/direct-anchor-performance/anchors.mjs
PERF_PHASE=after PERF_MODE=lifecycle node docs/qa/direct-anchor-performance/measure.mjs
PERF_PHASE=after DIAGNOSTIC=1 node docs/qa/direct-anchor-performance/anchors.mjs
python3 docs/qa/direct-anchor-performance/analyze-trace.py
python3 docs/qa/direct-anchor-performance/compare.py
node docs/qa/direct-anchor-performance/navigation.mjs
node docs/qa/direct-anchor-performance/rapid-history.mjs
node docs/qa/direct-anchor-performance/capability-regression.mjs
node docs/qa/direct-anchor-performance/regress.mjs
```

Output paths are deterministic and rerunning them replaces this task's corresponding phase files. Preserve a phase first when extending this investigation. Regression adapters redirect outputs, preserve the reviewed MediFit fixture and remove themselves in `finally`; they do not edit application code. Native assistive-technology restrictions remain respected. No commit/deployment occurs in these scripts.
