import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const phase = process.env.INTEGRITY_PHASE || "before";
const out = `docs/qa/project-integrity/${phase}`;
mkdirSync(out, { recursive: true });
const base = process.env.PORTFOLIO_QA_URL || "http://127.0.0.1:3000";
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const result = { phase, projects: [], destinations: [], errors: [] };
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on("pageerror", e => result.errors.push(e.message));
  await page.goto(`${base}/?motion-audit=1`);
  await page.waitForFunction(() => window.__motionAudit);
  await page.waitForTimeout(2100);
  await page.getByRole("button", { name: "Read Work without motion", exact: true }).focus();
  await page.keyboard.press("Enter");
  result.projects = await page.locator("[data-work-project]").evaluateAll(projects => projects.map(project => ({
    number: project.dataset.workProject,
    name: project.querySelector("h2").textContent,
    text: project.textContent.replace(/\s+/g, " ").trim(),
    actions: [...project.querySelectorAll("a,button")].map(e => ({ tag: e.tagName, label: e.textContent.trim(), accessibleName: e.getAttribute("aria-label"), destination: e.getAttribute("href"), target: e.getAttribute("target"), type: e.getAttribute("href")?.startsWith("http") ? "external application" : e.getAttribute("href")?.startsWith("#") ? "local fragment" : "public image evidence" })),
    availability: [...project.querySelectorAll("[data-mt-cta],[data-mf-cta],[data-project-availability]")].map(e => ({ tag: e.tagName, text: e.textContent, role: e.getAttribute("role"), tabindex: e.getAttribute("tabindex") })),
  })));
  for (const project of result.projects) {
    await page.locator(`[data-work-project="${project.number}"]`).scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${out}/${project.number}-reading-desktop.jpg`, fullPage: false, type: "jpeg", quality: 85 });
    for (const action of project.actions) {
      if (action.destination?.startsWith("#")) {
        const destination = page.locator(action.destination);
        result.destinations.push({ project: project.name, ...action, found: await destination.count(), targetText: await destination.innerText() });
      } else if (action.destination?.startsWith("/")) {
        const response = await context.request.get(base + action.destination);
        result.destinations.push({ project: project.name, ...action, status: response.status(), contentType: response.headers()["content-type"], bytes: (await response.body()).length });
        assert.equal(response.status(), 200);
      }
    }
  }
  result.aboutText = await page.locator("#about").textContent();
  if (phase === "before") {
    for (const url of ["https://sat-query-ai-phi.vercel.app/", "https://gestureglobe.vercel.app/", "https://dayflow-anirudh6.vercel.app"]) {
      const c = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p = await c.newPage();
      const errors = [], warnings = [];
      p.on("pageerror", e => errors.push(e.message));
      p.on("console", m => { if (["warning", "error"].includes(m.type())) warnings.push(m.text()); });
      try {
        const r = await p.goto(url, { waitUntil: "load", timeout: 30000 });
        await p.waitForTimeout(1800);
        const row = { requestedURL: url, finalURL: p.url(), status: r.status(), title: await p.title(), text: (await p.locator("body").innerText()).slice(0, 14000), errors, warnings };
        result.destinations.push(row);
        await p.screenshot({ path: `${out}/public-${new URL(url).hostname}.jpg`, type: "jpeg", quality: 85 });
      } catch (error) { result.destinations.push({ requestedURL: url, error: error.message }); }
      await c.close();
    }
  } else {
    assert.equal(result.projects.flatMap(p => p.actions).length, 6);
    const urls = result.projects.flatMap(p => p.actions).map(a => a.destination);
    assert.equal(new Set(urls).size, urls.length, "No duplicate project destinations");
    assert.ok(urls.every(url => !url.startsWith("#")), "No placeholder-fragment project actions");
    for (const number of ["2", "4"]) {
      const project = result.projects.find(p => p.number === number);
      assert.equal(project.actions.length, 1, "Keep one original evidence action");
      assert.ok(project.availability.some(a => a.tag === "P" && a.text === "CASE STUDY NOT PUBLISHED" && !a.role && !a.tabindex));
    }
    assert.ok(result.projects.every(p => !/coming soon/i.test(p.text)));
    const dayflow = result.projects.find(p => p.number === "3");
    assert.ok(!/68 PASSING|redirects pass|68 tests/i.test(dayflow.text));
    assert.ok(dayflow.text.includes("NO RUN LINKED"));
  }
  await context.close();
} finally {
  writeFileSync(`${out}/content-inventory.json`, JSON.stringify(result, null, 2) + "\n");
  await browser.close();
}
console.log(`${phase}: inventoried six projects and ${result.projects.flatMap(p => p.actions).length} project actions`);
