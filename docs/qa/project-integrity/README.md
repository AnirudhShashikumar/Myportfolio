# Project integrity QA evidence

Review date: 26 October 2026. See the [remediation report](../../PROJECT_INTEGRITY_REMEDIATION.md) for findings, scope and closure limits.

- `before/` contains the starting Git state, source hashes/text snapshots, safe metadata summaries and inspected project records. It contains no GPS-bearing original photos or extracted coordinate values.
- `after/` contains validation logs, browser results/screenshots, safe image-preservation evidence, and source-preservation assertions.
- `claim-evidence.csv` and `claim-evidence.json` contain the same 42 reviewed claim groups.
- `after/task-source.patch` isolates this task's 12 textual changes from the pre-existing SEO work. Binary image diffs are deliberately excluded.
- `after/runner-adaptations.patch` records the seven temporary suite runners. Most changes redirect output to this folder. F03/F04 also uses `expected-medifit.txt` to assert the complete intentionally qualified narrative. No other assertions were removed. The original historical runners and outputs remain intact; the temporary runners were removed.

The final production build passed ESLint, TypeScript, About content/motion, ScrollDiscovery, F02, F03/F04, F05, SEO and Chrome/WebKit production checks. Detailed counts and limitations are in the report. Empty `after/eslint.txt` and `after/typescript.txt` reflect successful silent commands. `after/build.txt` contains the production build output; `after/diff-check.txt` records the final whitespace check.

Browser scripts use an external Playwright/axe installation through `PLAYWRIGHT_MODULE` and `AXE_MODULE`; existing runners accept `CHROME_PATH` and `PORTFOLIO_QA_URL` where supported. The focused scripts use the installed macOS Chrome path; `content-review.mjs` targets `http://127.0.0.1:3000`. No browser-test dependency was added to the application. Run against `npm run build:webpack` followed by `npm start`. Reconstruct temporary runners from the recorded adaptations, rather than overwriting historical evidence directories. The focused commands, from the repository root with the same browser environment, are `INTEGRITY_PHASE=after node docs/qa/project-integrity/inspect.mjs` and `node docs/qa/project-integrity/content-review.mjs`. Do not run the inventory with its default before phase over the preserved baseline.

`privacy.py` uses Python/Pillow, ExifTool 13.59 (`EXIFTOOL_PATH`) and native macOS `sips` for HEIC appearance verification. Run it from the repository root. `served` verifies both local production originals against the sanitized file hashes and records field names only. `after` scans public images and checks appearance; it writes current evidence. Do not rerun `before` over the preserved baseline. `sanitize` is the recorded GPS-only edit operation and requires that baseline. Never print metadata values, save original EXIF blobs or publish coordinate-bearing before copies.

`after/public-deployment-readonly.json` is a separate observation: the unchanged public deployment still serves GPS-bearing copies. The local production checks do not establish public closure. No commit or deployment was performed.
