# F05 / accessibility polish evidence

See [the remediation report](../../F05_ACCESSIBILITY_POLISH.md) for conclusions and limitations. Run date: October 26, 2026, IST.

## Starting state

`before/git-status.txt` and `git-head.txt` preserve the state at source/evidence capture. The first tool inspection showed `4df22b2`; history had advanced to `9aa1a41` by that capture and advanced further during work. These intervening shared-repository commits were not created by this agent or rewritten. The report records them; the isolated source comparison avoids relying on the current Git diff as the whole task diff. F03/F04 documentation/cleanup was preserved. Source snapshots use `.txt` extensions so TypeScript does not compile evidence copies. `source-hashes.json` includes all starting application files and dependency/configuration files; `font-hashes.json` covers the emitted fonts.

`before/inspection.json` records the original Hero states, exact twenty Dayflow nodes and Contact scans. The Contact SVG background produced incomplete axe checks, so the separate `contact-readable.json` records actual computed colors, full-opacity holds and best-case contrast against the near-black base. The original static monument warning is retained. Trial files are browser-only CSS previews made before application editing; the report's before/after links use actual built application captures.

## Reproduction

Tools remained external to the app. Use the existing Playwright and axe installations, with no npm dependency changes:

```sh
export PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright
export CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export PLAYWRIGHT_BROWSERS_PATH=/private/tmp/portfolio-audit-browsers
export AXE_MODULE=/private/tmp/portfolio-audit-tools/node_modules/axe-core/axe.min.js

npm run build:webpack
npm run start -- --hostname 127.0.0.1 --port 3000
```

In another terminal:

```sh
POLISH_PHASE=after node docs/qa/f05-accessibility-polish/inspect.mjs
POLISH_PHASE=after node docs/qa/f05-accessibility-polish/contact-inspect.mjs
node docs/qa/f05-accessibility-polish/decorative-contact.mjs
F02_QA_OUT=docs/qa/f05-accessibility-polish/after/accessibility-f02 node scripts/accessibility-f02-qa.mjs
node --test scripts/about-content.test.mjs
```

These commands overwrite matching evidence files. Use another output location when preserving this run. `POLISH_PHASE=before` is intended for a baseline build; running it now would not recreate the original application.

`inspect.mjs` samples 29 Hero positions per viewport across eight requested and three additional sizes. The after phase asserts no viewport-clipped visible text, no name glyph clipping within its reveal mask and no document horizontal overflow. It inspects all twenty Dayflow elements across fourteen forward/reverse timeline states plus reading/reduced modes, and saves passes, violations and incomplete contrast results without filtering them away.

`dayflow-element-review.json` matches the twenty original target selectors against all sixteen after scans: all 320 measurements meet 4.5:1. The complete scans still record an authorization-title entry-fade candidate outside those twenty labels. Contact's final metadata is still fading at overall 95% timeline progress; the readable final hold is at 100%, which is explicitly measured separately.

`decorative-contact.mjs` uses actual Chrome partial accessibility trees for both monument elements and the full tree for the meaningful Contact heading. It also verifies the visible full-name identity and named email link in cinematic, reduced and no-JavaScript modes. It does not substitute for screen-reader speech testing.

## Existing regression runners

Temporary copies in `scripts/` preserved relative imports and changed only output constants:

| Runner | Original output | This run |
| --- | --- | --- |
| `about-motion-qa.mjs` | `docs/qa/about-motion` | `docs/qa/f05-accessibility-polish/after/about` |
| `scroll-discovery-qa.mjs` | `docs/qa/scroll-discovery` | `docs/qa/f05-accessibility-polish/after/scroll-discovery` |
| `production-audit.mjs` | `docs/qa/production` | `docs/qa/f05-accessibility-polish/after` |

Production runs used default matrix mode with `AUDIT_ENGINE=chrome` and `AUDIT_ENGINE=webkit`, plus `AUDIT_MODE=extra` and `AUDIT_MODE=targeted`. Temporary copies were removed after validation. After the small final Contact backing refinement, build/lint/type checks, both matrices, F02 and Contact measurements were repeated. The final comparison JSON uses those matrix runs.

The existing F03/F04 verifier was run from a temporary copy changing only its output directory to `after/f03-f04`. The original nine-region wheel-input checker likewise changed only its output file path. Its fresh page per region avoids an existing chained diagnostic's unfinished Lenis interpolation affecting subsequent starting positions. Both source checkers remain under `../f03-f04/`; neither old evidence directory was overwritten.

`regression-comparison.json` compares this task's matrices against the completed F03/F04 build and focused Hero measurements against this task's actual baseline. `source-preservation.json` and `task.patch` isolate the three application-file changes; all other source/config/dependency files and eleven emitted WOFF2 files are unchanged.

## Interpretation

- Initial full-document and Work reading scans now report zero rule violations. This is not a claim that every intermediate animation frame passes contrast or that no incomplete/manual checks remain.
- Static Contact's 1.03:1 outlined-name warning remains; existing semantic exclusion and independently available full-name content support the documented decorative classification.
- Targeted Work scans retain low-contrast inactive decorative coordinate numbers. They are noninteractive spans in the preexisting decorative rail; source/ARIA was not changed to suppress findings.
- Actual VoiceOver/speech output remains unverified under the previously documented access restriction. No bypass was attempted. WebKit engine automation is not physical Safari/device certification.
- This agent did not stage, commit or deploy. Unrelated working-tree changes and shared commit history were preserved.
