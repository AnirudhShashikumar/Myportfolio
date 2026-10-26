# F10 / F12 performance evidence

See the [remediation report](../../PERFORMANCE_F10_F12_REMEDIATION.md) for conclusions and limits. The baseline application is the recorded clean tree at `0706e6f`. Initial inspection saw its preceding work staged on `77eee63`; the shared repository committed that work before measurement, then added the six baseline QA files in `ea6579f`. This agent performed no commit or staging operation. Both shared commits are preserved.

`before/` holds the baseline environment, Git state, file hashes, build output, resource/CPU samples, coverage, compressed Chrome traces and graphics/lifecycle data. `after/` holds the final equivalent measurements and regression results. Intermediate builds are retained under `trials/` and must not be substituted for final results. `comparison.json` retains individual runs and medians.

Use Node 24, an external Playwright installation through `PLAYWRIGHT_MODULE`, and installed Chrome via `CHROME_PATH`. The default server is `http://127.0.0.1:3001`; override with `PORTFOLIO_QA_URL`. Run the existing `npm run build:webpack` and `npm start -- --hostname 127.0.0.1 --port 3001`. No test dependency is added to the application.

The measurement command is `PERF_PHASE=before PERF_MODE=loads node docs/qa/performance-f10-f12/measure.mjs`. Modes are `loads` (three runs for each of Home/mobile/direct About/reduced), `capability` (three unavailable-WebGL runs), `diagnostic` (separate trace/coverage samples), and `lifecycle` (graphics activity, frame sweeps, GC snapshots and a reader interaction). Repeat with `PERF_PHASE=after`. Run one mode/browser at a time, with no other browser suite or build running. The script writes its phase folder: archive preserved evidence before repeating a phase, or use a separate phase name for a recheck.

`python3 docs/qa/performance-f10-f12/summarize.py` processes before/after evidence. It includes JavaScript preloaded as `initiatorType=link`; the console logs' script-initiator subtotal omits that runtime. It also distinguishes observed CDP wire totals from Resource Timing's transfer estimate, decoded/encoded body sizes, offline gzip estimates and V8 source-unit coverage. Diagnostic timing includes debugger/trace overhead and is kept separate from the three-run load measurements. The compressed traces can be opened in Chrome/Perfetto after decompression.

The lifecycle's repeated wheel experiments have a known isolation flaw: an unfinished Lenis interpolation can undo the next programmatic seek. Their later region labels do not establish those sections' latency and are excluded from conclusions. The existing isolated nine-region input suite asserts actual starting positions and is the behavioral acceptance check. Do not turn these exploratory rows into an all-region latency claim.

`regress.mjs` runs the requested existing suites sequentially with new output directories. Set `PLAYWRIGHT_BROWSERS_PATH` for installed WebKit and `AXE_MODULE` for the external axe installation. It preserves historical QA outputs and removes its own temporary runners. F03/F04 uses the previously reviewed project-integrity narrative fixture; all other assertions remain active. The exact adapters are in this script.

`capability-regression.mjs` checks normal, unavailable, WebGL1-only, throwing-probe, reduced-motion and anchored visits; it records graphics/fallback states, offscreen pause/re-entry and layout-shift sources. `after/task-source.patch` isolates this task from earlier staged work. Neither raw GPS values nor GPS-bearing before images are copied into this folder.

This agent did not commit or deploy. Local performance and browser results do not establish field Core Web Vitals, GPU-memory budgets, physical-device accessibility or public asset deployment.
