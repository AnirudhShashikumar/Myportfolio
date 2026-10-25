# F01 remediation evidence

Captured locally on October 25, 2026. `before/` uses Next.js 16.3.5; `after/` uses 16.4.3. The earlier complete browser baseline remains in `../production/`. See `../../DEPENDENCY_SECURITY_REMEDIATION.md` for conclusions and limitations.

Dependency operations, in order:

```sh
npm audit --json
npm audit --omit=dev --json
npm ls next sharp source-map-js brace-expansion zod
# Change only the next and eslint-config-next pins to 16.4.3.
npm install --no-audit
npm update source-map-js brace-expansion zod --no-audit
npm ci --no-audit
npm audit --omit=dev
npm audit --omit=dev --json
npm audit
npm audit --json
npm ls next sharp source-map-js brace-expansion zod
npx eslint src/
npm run build:webpack
npx tsc --noEmit
node --test scripts/about-content.test.mjs
git diff --check
```

Browser suites use the existing installed Playwright runtime and Chrome, without adding application dependencies:

```sh
export PLAYWRIGHT_MODULE=/Users/anirudhshashikumar/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright
export CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export PLAYWRIGHT_BROWSERS_PATH=/private/tmp/portfolio-audit-browsers
npm run start -- --hostname 127.0.0.1 --port 3000
# In another terminal:
node scripts/about-motion-qa.mjs
node scripts/scroll-discovery-qa.mjs
AUDIT_MODE=matrix AUDIT_ENGINE=chrome node scripts/production-audit.mjs
AUDIT_MODE=matrix AUDIT_ENGINE=webkit node scripts/production-audit.mjs
AUDIT_MODE=lifecycle node scripts/production-audit.mjs
AUDIT_MODE=targeted node scripts/production-audit.mjs
AUDIT_MODE=extra node scripts/production-audit.mjs
AUDIT_MODE=zoom node scripts/production-audit.mjs
AUDIT_MODE=performance node scripts/production-audit.mjs
```

For this run, temporary copies in `scripts/` changed only each suite's output-directory constant to this evidence tree; their assertions and browser operations were unchanged. The original source hashes are in `run-environment.json`. The commands above use the original suites and therefore write to their original output directories. Preserve old evidence before rerunning them.

The pre-upgrade image cache was moved into a temporary backup before building, so the after-image comparison uses newly generated responses from Sharp 0.35.5. `optimized-images.json` records 44 distinct Next/Image URLs from the earlier Chrome matrix, requested with `Accept: image/webp`, with HTTP status, MIME type, dimensions, byte count and SHA-256. `image-comparison.json` compares those records. No photograph was edited.

`presentation-assets.json` fingerprints every generated CSS and WOFF2 file. `bundles.json` sums unique script URLs referenced by the prerendered home HTML, including its nomodule polyfill, using Node's default gzip estimator. These are asset inventories, not the complete browser network payload. `performance.json` separately records six cache-disabled loads, five 180-frame scroll sweeps and canvas activity. Performance runs were kept separate from the concurrent functional browser suites.

The additional `frame-control.mjs` records 120 animation-frame intervals on a visible blank page, the production page after its intro, then a second blank page, using a fresh context for each. It investigates the later run's approximately 30 Hz cadence without changing application rendering. Run it from the repository root with the same Playwright/Chrome environment variables. `image-response-check.mjs` is the supplemental optimizer-response capture; `SECURITY_QA_OUT` selects the output folder.
