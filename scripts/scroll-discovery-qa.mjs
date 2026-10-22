import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.PORTFOLIO_QA_URL || "http://127.0.0.1:3000";
const directory = "docs/qa/scroll-discovery";
const caseFilter = process.env.PORTFOLIO_QA_FILTER ? new RegExp(process.env.PORTFOLIO_QA_FILTER) : null;
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
});
const results = { viewports: [], cases: [], errors: [] };
const selector = "[data-scroll-discovery]";

async function open(options = {}, hash = "") {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  await context.addInitScript(() => {
    window.__discoveryStates = [];
    new MutationObserver(() => {
      const state = document.querySelector("[data-scroll-discovery]")?.dataset.state;
      if (state && window.__discoveryStates.at(-1)?.state !== state) {
        window.__discoveryStates.push({ state, time: performance.now() });
      }
    }).observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-state"] });
  });
  const page = await context.newPage();
  page.on("pageerror", error => results.errors.push(error.message));
  await page.goto(`${base}/${hash}`, { waitUntil: "load" });
  await page.waitForFunction(() => ["waiting", "disabled"].includes(document.querySelector("[data-scroll-discovery]")?.dataset.state));
  return { context, page };
}

async function state(page, expected) {
  await page.waitForFunction(expected => document.querySelector("[data-scroll-discovery]")?.dataset.state === expected, expected);
}

async function visible(page) {
  await state(page, "visible");
  await page.waitForTimeout(500);
}

async function check(name, run) {
  if (caseFilter && !caseFilter.test(name)) return;
  await run();
  results.cases.push(name);
  console.log(`PASS ${name}`);
}

try {
  for (const [width, height] of caseFilter ? [] : [[360, 800], [390, 844], [430, 932], [768, 1024], [1280, 800], [1440, 900], [1728, 1117]]) {
    const { context, page } = await open({ viewport: { width, height }, isMobile: width < 768, hasTouch: width < 768 });
    await visible(page);
    const metrics = await page.locator(selector).evaluate(cue => {
      const rect = cue.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(cue.firstElementChild);
      const text = range.getBoundingClientRect();
      const overlaps = [];
      for (const el of document.querySelectorAll('[data-site-header], #home h1, #home [data-coordinates], #home [data-intro-message]')) {
        let shown = true;
        for (let node = el; node; node = node.parentElement) {
          const css = getComputedStyle(node);
          if (css.visibility === "hidden" || +css.opacity < 0.05) shown = false;
        }
        if (!shown) continue;
        const copy = document.createRange();
        copy.selectNodeContents(el);
        const target = copy.getBoundingClientRect();
        if (Math.min(target.right, rect.right) > Math.max(target.left, rect.left) &&
          Math.min(target.bottom, rect.bottom) > Math.max(target.top, rect.top)) overlaps.push(el.tagName);
      }
      return {
        width: innerWidth, height: innerHeight, label: cue.textContent,
        rect: { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom },
        text: { left: text.left, right: text.right }, overlaps,
        overflow: document.documentElement.scrollWidth - innerWidth,
        pointerEvents: getComputedStyle(cue).pointerEvents,
        font: getComputedStyle(cue).fontFamily,
        count: document.querySelectorAll("[data-scroll-discovery]").length,
        history: window.__discoveryStates,
      };
    });
    assert.equal(metrics.count, 1);
    assert.equal(metrics.pointerEvents, "none");
    assert.equal(metrics.overflow, 0);
    assert.deepEqual(metrics.overlaps, []);
    assert.ok(metrics.rect.left >= 16 && metrics.rect.right <= width - 16);
    assert.ok(metrics.text.left >= metrics.rect.left && metrics.text.right <= metrics.rect.right);
    assert.ok(metrics.rect.top > 120 && metrics.rect.bottom <= height - 24);
    assert.equal(metrics.label, width < 768 ? "SWIPE UP TO EXPLORE" : "SCROLL TO EXPLORE");
    const waiting = metrics.history.find(item => item.state === "waiting");
    const shown = metrics.history.find(item => item.state === "visible");
    assert.ok(shown.time - waiting.time >= 2750);
    await page.screenshot({ path: `${directory}/${width}x${height}.jpg`, type: "jpeg", quality: 85 });
    results.viewports.push(metrics);
    console.log(`PASS viewport ${width}x${height}`);
    await context.close();
  }

  await check("wheel immediately dismisses; reverse/rapid travel and 9s idle never repeat", async () => {
    const { context, page } = await open();
    await page.waitForTimeout(2000);
    assert.equal(await page.locator(selector).getAttribute("data-state"), "waiting");
    await visible(page);
    await page.mouse.wheel(0, 120);
    await state(page, "dismissed");
    await page.waitForFunction(() => getComputedStyle(document.querySelector("[data-scroll-discovery]")).opacity === "0");
    assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).transitionDuration.split(",")[0]), "0.16s");
    for (const y of [8000, 2000, 12000, 500, 0]) await page.evaluate(y => scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(9000);
    assert.equal(await page.locator(selector).getAttribute("data-state"), "dismissed");
    await context.close();
  });

  for (const key of ["ArrowDown", "PageDown", "Space", "End", "Home"]) {
    await check(`keyboard ${key} cancels pending guidance`, async () => {
      const { context, page } = await open();
      await page.keyboard.press(key);
      await state(page, "dismissed");
      await context.close();
    });
  }

  await check("native document scroll / scrollbar-equivalent seek dismisses", async () => {
    const { context, page } = await open();
    await visible(page);
    await page.evaluate(() => scrollTo({ top: 300, behavior: "instant" }));
    await state(page, "dismissed");
    await context.close();
  });

  await check("small trackpad deltas accumulate without intercepting input", async () => {
    // Disable the existing Lenis controller for this cancellation assertion;
    // Lenis intentionally cancels wheel events when smooth scrolling is active.
    const { context, page } = await open({ reducedMotion: "reduce" });
    await page.evaluate(() => {
      window.__wheelResults = [1, 1, 2].map(deltaY => {
        const event = new WheelEvent("wheel", { deltaY, bubbles: true, cancelable: true });
        window.dispatchEvent(event);
        return event.defaultPrevented;
      });
    });
    await state(page, "dismissed");
    assert.deepEqual(await page.evaluate(() => window.__wheelResults), [false, false, false]);
    await context.close();
  });

  await check("touch swipe dismisses and native touch scrolling still advances", async () => {
    const { context, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await visible(page);
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: 190, y: 650 }] });
    for (const y of [630, 590, 530, 450]) {
      await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: 190, y }] });
      await page.waitForTimeout(35);
    }
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await state(page, "dismissed");
    assert.ok(await page.evaluate(() => scrollY > 0));
    await context.close();
  });

  for (const hash of ["#work", "#about", "#contact", "#lab"]) {
    await check(`direct ${hash} never arms Hero guidance`, async () => {
      const { context, page } = await open({}, hash);
      await page.waitForTimeout(3000);
      await state(page, "disabled");
      await context.close();
    });
  }

  await check("direct #home remains eligible", async () => {
    const { context, page } = await open({}, "#home");
    await visible(page);
    await context.close();
  });

  await check("refresh in Work without a hash respects native scroll restoration", async () => {
    const { context, page } = await open();
    await page.evaluate(() => scrollTo({ top: document.querySelector("#work").offsetTop + 1000, behavior: "instant" }));
    await page.waitForFunction(() => ["dismissed", "disabled"].includes(document.querySelector("[data-scroll-discovery]").dataset.state));
    await page.reload();
    await page.waitForTimeout(3400);
    assert.ok(await page.evaluate(() => scrollY > 1000));
    assert.notEqual(await page.locator(selector).getAttribute("data-state"), "visible");
    await context.close();
  });

  await check("hash back/forward navigation never re-arms guidance", async () => {
    const { context, page } = await open();
    await page.evaluate(() => { location.hash = "about"; });
    await page.waitForFunction(() => ["dismissed", "disabled"].includes(document.querySelector("[data-scroll-discovery]").dataset.state));
    await page.goBack();
    await page.waitForTimeout(3200);
    assert.notEqual(await page.locator(selector).getAttribute("data-state"), "visible");
    await page.goForward();
    assert.notEqual(await page.locator(selector).getAttribute("data-state"), "visible");
    await context.close();
  });

  await check("keyboard focus hides guidance and preserves primary navigation", async () => {
    const { context, page } = await open();
    await visible(page);
    const link = page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: "About" });
    await link.focus();
    await state(page, "dismissed");
    await page.keyboard.press("Enter");
    await page.waitForURL("**/#about");
    await context.close();
  });

  await check("document back/forward navigation does not restart Hero guidance", async () => {
    const { context, page } = await open();
    await page.goto(`${base}/?history-check=1`);
    await page.goBack();
    await page.waitForTimeout(3200);
    assert.equal(await page.locator(selector).getAttribute("data-state"), "disabled");
    await page.goForward();
    await page.waitForTimeout(3200);
    assert.equal(await page.locator(selector).getAttribute("data-state"), "disabled");
    await context.close();
  });

  for (const kind of ["dialog", "menu"]) {
    await check(`${kind} open suppresses; closing starts a fresh 2.8s wait`, async () => {
      const { context, page } = await open();
      await visible(page);
      await page.evaluate(kind => {
        if (kind === "dialog") {
          const dialog = document.createElement("dialog");
          dialog.id = "qa-overlay";
          dialog.textContent = "Overlay";
          document.body.append(dialog);
          dialog.showModal();
        } else {
          const button = document.createElement("button");
          button.id = "qa-overlay";
          button.setAttribute("aria-expanded", "true");
          button.textContent = "Menu";
          document.querySelector("nav").append(button);
        }
      }, kind);
      await state(page, "hidden");
      await page.waitForTimeout(3000);
      assert.equal(await page.locator(selector).getAttribute("data-state"), "hidden");
      await page.evaluate(() => {
        document.querySelector("#qa-overlay").remove();
        if (document.activeElement !== document.body) document.activeElement.blur();
      });
      await visible(page);
      await context.close();
    });
  }

  await check("tab visibility lifecycle resets inactivity (simulated visibility state)", async () => {
    const { context, page } = await open();
    await visible(page);
    await page.evaluate(() => {
      Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await state(page, "hidden");
    await page.waitForTimeout(3000);
    assert.equal(await page.locator(selector).getAttribute("data-state"), "hidden");
    await page.evaluate(() => {
      delete document.visibilityState;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await state(page, "waiting");
    await visible(page);
    await context.close();
  });

  await check("BFCache pageshow disables a pending prompt (synthetic persisted event)", async () => {
    const { context, page } = await open();
    await page.evaluate(() => dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    await state(page, "disabled");
    await context.close();
  });

  await check("live reduced motion keeps guidance static; cold reduced motion still guides", async () => {
    const { context, page } = await open();
    await visible(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    assert.equal(await page.locator(selector).getAttribute("data-state"), "visible");
    const style = await page.locator(selector).evaluate(el => ({ transition: getComputedStyle(el).transitionDuration, transform: getComputedStyle(el).transform, animations: el.getAnimations({ subtree: true }).length }));
    assert.equal(style.transition, "0s");
    assert.equal(style.animations, 0);
    assert.equal(+style.transform.slice(7, -1).split(",").at(-1), 0);
    await page.screenshot({ path: `${directory}/reduced-motion.jpg`, type: "jpeg", quality: 85 });
    await page.mouse.wheel(0, 100);
    await state(page, "dismissed");
    assert.equal(await page.locator(selector).evaluate(el => getComputedStyle(el).opacity), "0");
    await context.close();
    const cold = await open({ reducedMotion: "reduce" });
    await visible(cold.page);
    await cold.context.close();
  });

  await check("mobile orientation and safe-area spacing remain clear", async () => {
    const { context, page } = await open({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await visible(page);
    // Desktop headless Chrome has zero hardware insets; exercise the CSS formula.
    await page.addStyleTag({ content: `${selector} { bottom: calc(clamp(1.5rem, 3svh, 2.5rem) + 34px); }` });
    assert.ok(await page.locator(selector).evaluate(el => innerHeight - el.getBoundingClientRect().bottom >= 58));
    await page.setViewportSize({ width: 844, height: 390 });
    await visible(page);
    const rect = await page.locator(selector).boundingBox();
    assert.ok(rect.x >= 16 && rect.x + rect.width <= 828 && rect.y > 120 && rect.y + rect.height < 366);
    const title = await page.locator("#home h1").boundingBox();
    assert.ok(rect.x >= title.x + title.width || rect.y >= title.y + title.height);
    await page.screenshot({ path: `${directory}/landscape-safe-area.jpg`, type: "jpeg", quality: 85 });
    await context.close();
  });

  await check("About reader mode remains usable and never prompts", async () => {
    const { context, page } = await open({}, "#about");
    await page.getByRole("button", { name: "Read without motion" }).click();
    await page.waitForTimeout(3200);
    assert.equal(await page.locator(selector).getAttribute("data-state"), "disabled");
    await page.getByRole("button", { name: "Return to motion" }).click();
    assert.equal(await page.locator(selector).getAttribute("data-state"), "disabled");
    await context.close();
  });

  assert.deepEqual(results.errors, []);
  writeFileSync(`${directory}/results.json`, JSON.stringify(results, null, 2) + "\n");
  console.log(`PASS ${results.viewports.length} viewports; ${results.cases.length} behavior cases; no page errors`);
} finally {
  await browser.close();
}
