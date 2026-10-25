import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.PORTFOLIO_QA_URL || "http://127.0.0.1:3000";
const out = process.env.F02_QA_OUT || "docs/qa/accessibility-f02/after";
const caseFilter = process.env.F02_QA_FILTER ? new RegExp(process.env.F02_QA_FILTER) : null;
mkdirSync(out, { recursive: true });
const results = { cases: [], errors: [], console: [] };
const names = ["SATQUERY AI", "GESTURE GLOBE", "ALGAEOS", "DAYFLOW", "MEDITWIN", "MEDIFIT"];
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });

async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  await context.addInitScript(() => {
    window.__f02Shifts = [];
    new PerformanceObserver(list => {
      for (const entry of list.getEntries()) window.__f02Shifts.push({ value: entry.value, recentInput: entry.hadRecentInput });
    }).observe({ type: "layout-shift", buffered: true });
  });
  const page = await context.newPage();
  page.on("pageerror", error => results.errors.push(error.message));
  page.on("console", message => { if (["error", "warning"].includes(message.type())) results.console.push(message.text()); });
  await page.goto(`${base}/?motion-audit=1`, { waitUntil: "load" });
  if (options.javaScriptEnabled !== false) await page.waitForFunction(() => window.__motionAudit);
  await page.waitForTimeout(3300);
  return { context, page };
}

async function tree(page, context) {
  const cdp = await context.newCDPSession(page);
  const nodes = (await cdp.send("Accessibility.getFullAXTree")).nodes;
  await cdp.detach();
  const byId = new Map(nodes.map(node => [node.nodeId, node]));
  const ordered = [];
  function visit(node, project) {
    if (!node) return;
    if (node.role?.value === "article" && names.includes(node.name?.value)) project = node.name.value;
    if (!node.ignored) ordered.push({ role: node.role?.value, name: node.name?.value, ...(project ? { project } : {}) });
    for (const id of node.childIds ?? []) visit(byId.get(id), project);
  }
  visit(nodes[0]);
  return ordered;
}

function checkHeadings(nodes) {
  for (const name of names) assert.equal(nodes.filter(node => node.role === "heading" && node.name === name).length, 1, `one exposed heading: ${name}`);
  assert.deepEqual(nodes.filter(node => node.role === "heading" && names.includes(node.name)).map(node => node.name), names, "project heading traversal follows document order");
}

async function focused(page) {
  return page.evaluate(() => {
    const element = document.activeElement;
    const bounds = element.getBoundingClientRect();
    let opacity = 1, visible = true;
    for (let node = element; node; node = node.parentElement) {
      const style = getComputedStyle(node);
      opacity *= +style.opacity;
      if (style.visibility === "hidden" || style.display === "none") visible = false;
    }
    const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
    return {
      text: element.textContent.trim().replace(/\s+/g, " ").slice(0, 120), href: element.getAttribute("href"),
      project: element.closest("[data-work-project]")?.dataset.workProject,
      contact: !!element.closest("#contact"), visible, opacity, focusVisible: element.matches(":focus-visible"),
      outline: getComputedStyle(element).outlineStyle, hit: hit === element || element.contains(hit),
      top: bounds.top, bottom: bounds.bottom, width: bounds.width, height: bounds.height, y: scrollY,
      overflow: document.documentElement.scrollWidth - innerWidth,
    };
  });
}

function usable(state) {
  assert.ok(state.visible && state.opacity > .95 && state.width > 2 && state.height > 2, `visible focus: ${state.text}`);
  assert.ok(state.hit, `unobscured focused target: ${state.text}`);
  assert.ok(state.focusVisible && state.outline !== "none", `focus indicator: ${state.text}`);
  assert.equal(state.overflow, 0);
}

async function check(name, run) {
  if (caseFilter && !caseFilter.test(name)) return;
  await run();
  results.cases.push(name);
  writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
  console.log(`PASS ${name}`);
}

try {
  await check("all six projects and Contact links exist once in the initial browser AX tree", async () => {
    const { context, page } = await open();
    results.initialAX = await tree(page, context);
    results.initialLayoutShifts = await page.evaluate(() => window.__f02Shifts);
    assert.equal(results.initialLayoutShifts.filter(entry => !entry.recentInput).reduce((sum, entry) => sum + entry.value, 0), 0);
    checkHeadings(results.initialAX);
    for (const name of names) assert.ok(results.initialAX.some(node => node.project === name && node.role === "StaticText" && node.name?.trim().split(/\s+/).length >= 10), `meaningful project information exposed within ${name}`);
    for (const phrase of ["specialist models", "role-aware HR platform", "personalized fitness"]) {
      assert.ok(results.initialAX.some(node => node.role === "StaticText" && node.name?.toLowerCase().includes(phrase.toLowerCase())), `description exposed: ${phrase}`);
    }
    for (const phrase of ["live SatQuery", "live Gesture Globe", "EXPLORE ALGAEOS", "live Dayflow", "VIEW MEDITWIN", "MediFit third-place certificate"]) {
      assert.ok(results.initialAX.some(node => node.role === "link" && node.name?.includes(phrase)), `project action exposed: ${phrase}`);
    }
    for (const name of ["Email Anirudh Shashikumar", "Anirudh Shashikumar on LinkedIn (opens in a new tab)", "Anirudh Shashikumar on GitHub (opens in a new tab)"]) {
      assert.equal(results.initialAX.filter(node => node.role === "link" && node.name === name).length, 1);
    }
    assert.equal(await page.locator("#contact a").count(), 3, "one actual set of Contact actions");
    assert.equal(await page.locator("#contact a").first().evaluate(a => getComputedStyle(a).pointerEvents), "none", "unrevealed cinematic actions cannot intercept pointer input");
    results.content = await page.locator("#work").evaluate(root => [...root.querySelectorAll("[data-work-project]")].map(project => ({ text: project.textContent.replace(/\s+/g, " ").trim(), links: [...project.querySelectorAll("a")].map(a => a.getAttribute("href")) })));
    await context.close();
  });

  await check("Tab and Shift+Tab reach every project action and all Contact actions visibly", async () => {
    const { context, page } = await open();
    results.tabs = [];
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(100);
      const state = await focused(page);
      results.tabs.push(state);
      if (state.project !== undefined || state.contact) usable(state);
      if (state.project !== undefined) await page.screenshot({ path: `${out}/focus-project-${state.project}-${results.tabs.length}.jpg`, type: "jpeg", quality: 85 });
      if (state.href === "#home" && state.text.startsWith("BACK TO TOP")) break;
    }
    for (let i = 0; i < 6; i++) assert.ok(results.tabs.some(state => state.project === String(i) && state.href), `project ${i + 1} action in Tab order`);
    assert.equal(results.tabs.filter(state => state.contact && state.href).length, 3);
    results.reverseTabs = [];
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Shift+Tab");
      await page.waitForTimeout(100);
      const state = await focused(page);
      results.reverseTabs.push(state);
      if (state.project !== undefined || state.contact) usable(state);
    }
    await page.screenshot({ path: `${out}/keyboard-project.jpg`, type: "jpeg", quality: 85 });
    await context.close();
  });

  await check("primary Contact Enter then Tab reaches email; reverse scrolling cannot fade focused actions", async () => {
    const { context, page } = await open();
    const nav = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Contact", exact: true });
    await nav.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1700);
    await page.keyboard.press("Tab");
    results.contactEntry = await focused(page);
    assert.ok(results.contactEntry.href?.startsWith("mailto:"));
    usable(results.contactEntry);
    await page.evaluate(() => {
      const root = document.querySelector("#contact");
      scrollTo({ top: root.getBoundingClientRect().top + scrollY, behavior: "instant" });
      window.__motionAudit.ScrollTrigger.update();
    });
    usable(await focused(page));
    await page.keyboard.press("Tab");
    usable(await focused(page));
    await page.keyboard.press("Tab");
    usable(await focused(page));
    await page.screenshot({ path: `${out}/contact-keyboard.jpg`, type: "jpeg", quality: 85 });
    // Prevent external navigation: verify native Enter activation on the real link.
    await page.evaluate(() => { window.__f02Activated = null; document.querySelector("#contact a[href*='github.com']").addEventListener("click", event => { event.preventDefault(); window.__f02Activated = event.currentTarget.getAttribute("href"); }, { once: true }); });
    await page.keyboard.press("Enter");
    assert.match(await page.evaluate(() => window.__f02Activated), /github\.com/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(600);
    results.liveReducedContact = await focused(page);
    assert.match(results.liveReducedContact.href, /github\.com/);
    usable(results.liveReducedContact);
    await context.close();
  });

  await check("Work reading option uses Enter and Space, preserves content, restores cinematic ownership", async () => {
    const { context, page } = await open();
    const button = page.getByRole("button", { name: "Read Work without motion", exact: true });
    const originalContent = await page.locator("#work").evaluate(root => [...root.querySelectorAll("[data-work-project]")].map(project => ({ text: project.textContent.replace(/\s+/g, " ").trim(), links: [...project.querySelectorAll("a")].map(a => a.getAttribute("href")) })));
    await button.focus();
    usable(await focused(page));
    const initial = await page.evaluate(() => ({ height: document.documentElement.scrollHeight, triggers: window.__motionAudit.ScrollTrigger.getAll().length }));
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    assert.equal(await page.locator("#work").getAttribute("data-work-reading"), "true");
    results.reading = await page.evaluate(() => {
      const work = document.querySelector("#work");
      const triggers = window.__motionAudit.ScrollTrigger.getAll().filter(t => work.contains(t.trigger));
      return { workTriggers: triggers.length, projectTriggers: triggers.filter(t => t.trigger !== work).length, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    // ScrollMotion retains the shared section-field trigger on #work. Its
    // decorative fade is frozen; project stages and handoffs must be gone.
    assert.equal(results.reading.projectTriggers, 0);
    assert.equal(results.reading.overflow, 0);
    checkHeadings(await tree(page, context));
    const content = await page.locator("#work").evaluate(root => [...root.querySelectorAll("[data-work-project]")].map(project => ({ text: project.textContent.replace(/\s+/g, " ").trim(), links: [...project.querySelectorAll("a")].map(a => a.getAttribute("href")) })));
    assert.deepEqual(content, originalContent);
    await page.screenshot({ path: `${out}/work-reading.jpg`, type: "jpeg", quality: 85 });
    await page.keyboard.press("Space");
    await page.waitForTimeout(700);
    assert.equal(await page.locator("#work").getAttribute("data-work-reading"), "false");
    assert.deepEqual(await page.evaluate(() => ({ height: document.documentElement.scrollHeight, triggers: window.__motionAudit.ScrollTrigger.getAll().length })), initial);
    results.keys = [];
    for (const key of ["PageDown", "PageUp", "ArrowDown", "ArrowUp", "Home", "End"]) {
      await page.keyboard.press(key);
      await page.waitForTimeout(600);
      results.keys.push({ key, y: await page.evaluate(() => scrollY) });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
    }
    assert.ok(results.keys.find(k => k.key === "End").y > results.keys.find(k => k.key === "Home").y + 1000, "document navigation is not trapped");
    results.readingCycles = [];
    for (let cycle = 0; cycle < 2; cycle++) {
      await button.focus();
      await page.keyboard.press("Enter");
      await page.waitForTimeout(500);
      if (cycle === 0) {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.waitForTimeout(500);
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.waitForTimeout(600);
      }
      assert.equal(await page.evaluate(() => {
        const work = document.querySelector("#work");
        return window.__motionAudit.ScrollTrigger.getAll().filter(t => t.trigger !== work && work.contains(t.trigger)).length;
      }), 0);
      await page.keyboard.press("Space");
      await page.waitForTimeout(700);
      const count = await page.evaluate(() => window.__motionAudit.ScrollTrigger.getAll().length);
      results.readingCycles.push(count);
      assert.equal(count, initial.triggers);
    }
    await context.close();
  });

  await check("cold reduced motion exposes all projects and three visible Contact links without timelines", async () => {
    const { context, page } = await open({ reducedMotion: "reduce" });
    checkHeadings(await tree(page, context));
    assert.equal(await page.evaluate(() => window.__motionAudit.ScrollTrigger.getAll().length), 0);
    await page.locator("#contact").scrollIntoViewIfNeeded();
    for (const link of await page.locator("#contact a").all()) assert.ok(await link.isVisible());
    assert.equal(await page.locator("#contact a").count(), 3);
    await page.screenshot({ path: `${out}/reduced-contact.jpg`, type: "jpeg", quality: 85 });
    await context.close();
  });

  await check("no-JavaScript desktop, phone and short-height baselines contain all projects and usable Contact", async () => {
    results.noJS = [];
    for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }, { width: 1280, height: 550 }]) {
      const { context, page } = await open({ javaScriptEnabled: false, viewport });
      checkHeadings(await tree(page, context));
      await page.locator("#contact").scrollIntoViewIfNeeded();
      const state = await page.locator("#contact").evaluate(root => ({ links: [...root.querySelectorAll("a")].map(a => ({ href: a.getAttribute("href"), visible: a.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) })), overflow: document.documentElement.scrollWidth - innerWidth, heading: root.querySelector("h2").textContent }));
      assert.equal(state.links.length, 3);
      assert.ok(state.links.every(link => link.visible));
      assert.equal(state.overflow, 0);
      results.noJS.push({ viewport, ...state });
      const nav = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "Contact", exact: true });
      await nav.focus();
      await page.keyboard.press("Enter");
      await page.keyboard.press("Tab");
      assert.match((await focused(page)).href, /^mailto:/);
      usable(await focused(page));
      await page.screenshot({ path: `${out}/nojs-${viewport.width}x${viewport.height}.jpg`, type: "jpeg", quality: 85 });
      await context.close();
    }
  });

  await check("automated scan records remaining contrast findings and no other rule failure", async () => {
    const { context, page } = await open();
    await page.addScriptTag({ path: process.env.AXE_MODULE || "/private/tmp/portfolio-audit-tools/node_modules/axe-core/axe.min.js" });
    results.axe = await page.evaluate(async () => {
      const data = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
      return data.violations.map(v => ({ id: v.id, impact: v.impact, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
    });
    assert.deepEqual(results.axe.filter(v => v.id !== "color-contrast"), []);
    await page.getByRole("button", { name: "Read Work without motion", exact: true }).focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(700);
    results.axeReading = await page.evaluate(async () => {
      const data = await window.axe.run(document.querySelector("#work"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
      return data.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(600);
    results.axeStaticContact = await page.evaluate(async () => {
      const data = await window.axe.run(document.querySelector("#contact"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
      return data.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }));
    });
    assert.deepEqual(results.axeReading.filter(v => v.id !== "color-contrast"), []);
    assert.deepEqual(results.axeStaticContact.filter(v => v.id !== "color-contrast"), []);
    await context.close();
  });

  assert.deepEqual(results.errors, []);
  assert.equal(results.console.filter(message => /hydration|GSAP target/i.test(message)).length, 0);
  writeFileSync(`${out}/results.json`, JSON.stringify(results, null, 2) + "\n");
  console.log(`PASS ${results.cases.length} F02 cases; no page errors`);
} finally { await browser.close(); }
