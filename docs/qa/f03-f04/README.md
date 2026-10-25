# F03 / F04 verification evidence

See [the remediation report](../../F03_F04_REMEDIATION.md) for conclusions, evidence limits and remaining issues. Date: October 25, 2026, IST.

`before/` contains the starting source/font hashes, noncompiled source snapshots, pre-change narrative/link inventory, public MediFit inspection and footer-size trials. The public application returned 200 but advertised medication safety; no API key or credentials were entered. The certificate was visually inspected in its existing local file. `link-history.txt` records when the current external URL was introduced, without establishing deployment history.

`after/` contains the final local production build, command logs, audits, focused checks, existing regression outputs, screenshots and baseline comparison. The baseline is the completed F02 evidence under `../accessibility-f02/after/`; it was not overwritten.

Environment: macOS arm64, Node 24.14.1, npm 11.11.0, Next.js 16.4.3. The matrix JSON files contain exact browser versions. Chrome used the existing installed application; WebKit used the previously installed Playwright browser. Playwright and axe remained external tools, with no package/lockfile changes.

To reproduce, run the production webpack build and local server on port 3000. Supply the existing external tooling paths:

```sh
export PLAYWRIGHT_MODULE=/absolute/path/to/node_modules/playwright
export CHROME_PATH='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
export PLAYWRIGHT_BROWSERS_PATH=/private/tmp/portfolio-audit-browsers
export AXE_MODULE=/private/tmp/portfolio-audit-tools/node_modules/axe-core/axe.min.js

node docs/qa/f03-f04/verify.mjs
node docs/qa/f03-f04/scroll-input.mjs
F02_QA_OUT=docs/qa/f03-f04/after/accessibility-f02 node scripts/accessibility-f02-qa.mjs
node --test scripts/about-content.test.mjs
```

The existing About motion, ScrollDiscovery and production audit scripts were copied temporarily inside `scripts/` so their relative imports remained intact. The only changes in those copies were the output constants:

| Runner | Original output | This run |
| --- | --- | --- |
| `about-motion-qa.mjs` | `docs/qa/about-motion` | `docs/qa/f03-f04/after/about` |
| `scroll-discovery-qa.mjs` | `docs/qa/scroll-discovery` | `docs/qa/f03-f04/after/scroll-discovery` |
| `production-audit.mjs` | `docs/qa/production` | `docs/qa/f03-f04/after` |

Production audit runs used the default matrix mode with `AUDIT_ENGINE=chrome` and `AUDIT_ENGINE=webkit`, followed by `AUDIT_MODE=extra`. Temporary runners were removed afterward. The original scripts are unchanged. Reproduction overwrites this task's matching output files; use another output directory when preserving this evidence.

`browser-comparison.json` compares all 1,120 matrix states with F02. Its raw differences include intended small phone content-metric offsets after removal of the larger arrow/button line box and the increase in footer text size; no trigger-count/mode difference, new horizontal text candidate, document overflow or scrub mismatch is recorded. Existing mobile Hero text candidates remain. Loaded image records with a current source and zero natural width were checked separately from lazy images not yet requested.

The original supplementary wheel loop carries Lenis state between trials, so its region labels are insufficient to establish where later inputs actually began. `scroll-input.mjs` supplements it with a fresh page for each of nine regions, asserts the real starting position, then verifies slow, fast and reverse native wheel input and timeline alignment. Its results are not a controlled performance benchmark.

`source-preservation.json` verifies that only three application files changed during this task and all 11 emitted font files are unchanged. `task.patch` isolates these changes and the one F02 action-expectation update from the preexisting uncommitted F02 implementation.

The first TypeScript/build logs intentionally remain: a copied `.tsx` evidence file was initially included by TypeScript. Renaming the snapshot to `.tsx.txt` fixed the test-artifact error; the final logs record passing application checks. No tsconfig workaround was added.

No actual screen-reader speech-output test, physical-device certification or hosted deployment was performed. This agent did not commit or deploy. The shared Git history advanced during validation and captured some in-progress changes; see the report's validation section. The previous VoiceOver access restriction was respected. Full-page axe still records the existing staged Dayflow contrast candidates and static Contact decorative-text issue; footer-scoped scans pass.
