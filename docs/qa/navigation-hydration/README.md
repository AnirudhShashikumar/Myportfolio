# Navigation / hydration evidence

See [the remediation report](../../NAVIGATION_HYDRATION_REMEDIATION.md) for conclusions. The rapid-history fix is retained. The prepaint reservation is a rejected browser-only experiment; startup About/Contact CLS remains open.

## Source boundary

The initial checkout was clean at `6e4ff1bedb9bc0124ad1923aae0d71f33dfd3778`. `before/source-hashes.json` inventories 113 application, asset, script and configuration files. Only `SmoothScroll.tsx` and `ScrollMotion.tsx` change. `before/SmoothScroll.tsx.txt` is a noncompiled source snapshot; the baseline audit exposed the current Lenis instance through the existing localhost diagnostics gate without changing navigation behavior.

Shared history advanced during the run and captured the source changes, evidence and three temporary QA adapters in commits. This agent did not invoke commit/staging/reset commands. The adapters were preserved after their normal temporary cleanup because they had become tracked. The preservation summary records the observed history and checks ancestry instead of incorrectly requiring an unchanged HEAD.

`before/anchors.json` and `after/anchors.json` contain 24 startup observations each. `comparison.json` computes the maximum eligible CLS session window. Fresh navigation and refresh remain separate. Diagnostic geometry polling, screencasting and trial response rewriting are not used as the normal timing samples.

## Reproduction

Build with `npm run build:webpack` and serve with `npm run start -- --port 3001`. The harnesses default to that origin. `regress.mjs` adapts the existing regression output directories temporarily. Its cleanup removes newly created untracked adapters, restores preexisting ones and preserves adapters that became tracked during the run. Historical evidence and package scripts remain intact.

Browser dependencies are supplied externally, without adding application dependencies:

```sh
export CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export PLAYWRIGHT_MODULE=/absolute/path/to/playwright
export PLAYWRIGHT_BROWSERS_PATH=/absolute/path/to/installed/browsers
export AXE_MODULE=/absolute/path/to/axe-core/axe.min.js
export PORTFOLIO_QA_URL=http://127.0.0.1:3001

node docs/qa/navigation-hydration/history.mjs
node docs/qa/navigation-hydration/history-details.mjs
node docs/qa/navigation-hydration/reader-bookmarks.mjs
node docs/qa/navigation-hydration/reader-history.mjs
node docs/qa/navigation-hydration/rapid-history.mjs
node docs/qa/navigation-hydration/settled-navigation.mjs
node docs/qa/navigation-hydration/capability-regression.mjs
node docs/qa/navigation-hydration/regress.mjs

# Collect these separately from builds and other browser tests.
PERF_PHASE=after node docs/qa/navigation-hydration/anchors.mjs
PERF_PHASE=after DIAGNOSTIC=1 node docs/qa/navigation-hydration/anchors.mjs
node docs/qa/navigation-hydration/paint.mjs
PERF_PHASE=after PERF_MODE=lifecycle node docs/qa/navigation-hydration/measure.mjs

python3 docs/qa/navigation-hydration/matrix-compare.py
python3 docs/qa/navigation-hydration/summarize.py
```

The diagnostic scripts use the existing `?motion-audit=1` localhost hook. Internal Lenis animation fields are read only for evidence; the application uses public lifecycle/scroll APIs. No-JavaScript cases use automation-side polling, because in-page rAF callbacks do not execute in that mode.

## Native history expectations

The rapid matrix checks every sampled traversal frame. The continuous harness starts before dispatch and additionally checks command counts, controller identities, history length, event ordering and repeated controller replacement. There may be one application correction for an in-flight anchor entry restored outside its destination section; valid native positions inside the destination remain untouched.

Native restoration is observed during the capture phase of `hashchange`, before the application's handler. Do not use the pre-restoration `popstate` scroll position as a cross-engine saved-bookmark oracle. Chrome and WebKit differ in the deep-history cases: Chrome restores the fragment start, while WebKit retains the deep bookmark. The reader-bookmark suite checks that the application issues no scroll command in either case. The original near-end regression additionally requires the Lenis animated value, actual scroll and active smooth state; a native fragment jump alone does not qualify.

## Trial artifacts and harness corrections

- `trials/reservation/`: 18 response-rewrite experiments. Normal scripting-enabled cinematic reservations remove measured shifts but overlap static evidence when scripts fail. `candidate.css.txt` is not imported by the application. Run `reservation-trial.mjs` only to repeat this deliberately rejected experiment.
- `trials/native-bookmark-assertion.txt`: an exact-section-start assertion rejected a legitimate native bookmark within Hero. The final tests preserve the bookmark and its raw offset from the section start.
- `trials/popstate-bookmark-assertion.txt`: using the position at `popstate` as the saved Forward position was not portable to WebKit. Final expectations observe restoration at `hashchange` before the application handler.
- `trials/reader-bookmark.json`, `bookmark-events.json` and `bookmark-element-commands.json`: intermediate investigation of Chrome's fragment-start restoration. These alone do not establish that the application caused Chrome's native result. The final eight-case cross-engine evidence is `after/reader-bookmarks.json`.
- `after/history/partial-before-nojs-harness-correction.json` and `cancelled-no-js-harness.txt`: the initial harness awaited an in-page callback with JavaScript disabled. That run was cancelled; all nine profiles were rerun with external polling. These are not unresolved application failures.

No startup metrics are excluded to make CLS pass. An empty injected observer array when scripts are disabled is not interpreted as zero measured CLS. The inherited lifecycle helper's repeated-wheel labels are not used for regional latency claims; `regression/scroll-input.json` is the isolated nine-region behavioral check.
