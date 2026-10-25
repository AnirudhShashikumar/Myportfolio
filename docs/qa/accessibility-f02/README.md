# F02 verification evidence

Run from the repository root against a webpack production build. The tests use an existing external Playwright runtime; no application dependency was added.

```sh
npx eslint src/
npm run build:webpack
npx tsc --noEmit
node --test scripts/about-content.test.mjs
git diff --check
npm run start -- --hostname 127.0.0.1 --port 3000
```

In another terminal:

```sh
export PLAYWRIGHT_MODULE=/Users/anirudhshashikumar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright
export CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export PLAYWRIGHT_BROWSERS_PATH=/private/tmp/portfolio-audit-browsers
node scripts/accessibility-f02-qa.mjs
node scripts/about-motion-qa.mjs
node scripts/scroll-discovery-qa.mjs
AUDIT_MODE=matrix AUDIT_ENGINE=chrome node scripts/production-audit.mjs
AUDIT_MODE=matrix AUDIT_ENGINE=webkit node scripts/production-audit.mjs
AUDIT_MODE=extra node scripts/production-audit.mjs
```

The existing suites were run from temporary copies that changed only their output-directory constants to this evidence folder. Running the original commands above writes to the originals' normal evidence directories; preserve previous evidence before rerunning them. Their source hashes are in `run-environment.json`.

`F02_QA_OUT` selects another output folder for the new focused suite. `F02_QA_FILTER` optionally matches case names. Supplemental runs isolated `initial browser AX`, `Tab and Shift`, `Work reading` and `automated` to retain detailed semantic, per-action focus, repeated reading/resize, and three-surface axe results without overwriting the core run. Original and final findings are described in [the remediation report](../../ACCESSIBILITY_F02_REMEDIATION.md).

`before/reproduction.json` is the pre-change production capture: 24 Tab steps, the initial Chrome accessibility tree's heading/link inventory and primary Contact → Enter → Tab. Normal visual baselines are the preceding Next 16.4.3 build under `../dependency-security/after/`.

`after/browser-comparison.json` compares all matrix samples, including scroll geometry and trigger ownership. `project-copy-comparison.json` compares each feature's JSX text nodes against the source baseline. Contact focus captures intentionally differ from unfocused animation states. Side-by-side normal captures combine prior and current screenshots for inspection, not a pixel-perfect graphics comparison.

Chrome accessibility nodes were read with CDP and traversed using their child relationships. These are browser AX results, not spoken screen-reader tests. `screen-reader-check.json` records the denied native VoiceOver access. No real screen-reader, Safari application, physical-device or full WCAG certification is claimed.
