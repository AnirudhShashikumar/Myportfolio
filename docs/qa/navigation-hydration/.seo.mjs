import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";

const require = createRequire(import.meta.url);
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const sharp = require("sharp");
const base = process.env.PORTFOLIO_QA_URL || "http://127.0.0.1:3000";
const phase = process.env.SEO_PHASE || "after";
const out = 'docs/qa/navigation-hydration/after/regression/seo';
const origin = "https://myportfolio-alpha-one-48.vercel.app";
mkdirSync(out, { recursive: true });
const results = { phase, cases: [], errors: [], warnings: [] };
const save = () => writeFileSync(`${out}/seo-results.json`, JSON.stringify(results, null, 2) + "\n");
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });

async function head(page) {
  return page.evaluate(() => ({
    title: document.title,
    metas: [...document.head.querySelectorAll("meta")].map(e => ({ name: e.name || e.getAttribute("property"), content: e.content })),
    links: [...document.head.querySelectorAll("link")].map(e => ({ rel: e.rel, href: e.href, sizes: e.sizes?.value, type: e.type })),
    person: [...document.querySelectorAll('script[type="application/ld+json"]')].map(e => JSON.parse(e.textContent)),
  }));
}

try {
  if (phase === "before") {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage();
    for (const path of ["/", "/__seo_missing_page__"]) {
      const response = await page.goto(base + path);
      const name = path === "/" ? "homepage" : "404";
      results.cases.push({ name, status: response.status(), head: await head(page) });
      await page.screenshot({ path: `${out}/${name}.png`, fullPage: path !== "/" });
    }
    await context.close();
  } else {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await context.newPage();
    const response = await page.goto(base + "/");
    const metadata = await head(page);
    assert.equal(response.status(), 200);
    assert.equal(metadata.title, "Anirudh Shashikumar — Engineering the Next Era of Intelligence");
    assert.deepEqual(metadata.links.filter(l => l.rel === "canonical").map(l => l.href), [origin + "/"]);
    const meta = key => metadata.metas.filter(m => m.name === key).map(m => m.content);
    for (const [key, value] of Object.entries({ "og:type": "website", "og:image": origin + "/opengraph-image.png", "og:image:width": "1200", "og:image:height": "630", "twitter:card": "summary_large_image", "twitter:image": origin + "/opengraph-image.png" })) assert.deepEqual(meta(key), [value], key);
    // Next normalizes the root OG URL without its optional trailing slash.
    assert.deepEqual(meta("og:url").map(value => new URL(value).href), [origin + "/"]);
    assert.equal(meta("og:image:alt").length, 1);
    assert.equal(meta("twitter:image:alt").length, 1);
    assert.equal(metadata.links.filter(l => l.rel === "icon" && new URL(l.href).pathname === "/favicon.ico").length, 1);
    assert.equal(metadata.links.filter(l => l.rel === "apple-touch-icon" && new URL(l.href).pathname === "/apple-touch-icon.png" && l.sizes === "180x180").length, 1);
    assert.equal(metadata.person.length, 1);
    const person = metadata.person[0];
    assert.deepEqual(Object.keys(person).sort(), ["@context", "@id", "@type", "name", "url", "description", "sameAs"].sort());
    assert.equal(person["@context"], "https://schema.org");
    assert.equal(person["@type"], "Person");
    assert.equal(person.name, "Anirudh Shashikumar");
    assert.equal(person.description, "I build systems across AI, vision, software, and the physical world.");
    assert.equal(person.url, origin + "/");
    assert.equal(person["@id"], origin + "/#person");
    assert.deepEqual(person.sameAs, ["https://github.com/AnirudhShashikumar", "https://www.linkedin.com/in/anirudh-shashikumar"]);
    assert.equal(await page.locator('#contact a[href="https://github.com/AnirudhShashikumar"]').count(), 1);
    assert.equal(await page.locator('#contact a[href="https://www.linkedin.com/in/anirudh-shashikumar"]').count(), 1);
    results.cases.push({ name: "homepage-nojs-metadata-and-person", status: response.status(), head: metadata });
    for (const ua of ["Twitterbot/1.0", "facebookexternalhit/1.1", "Googlebot"]) {
      const r = await context.request.get(base + "/", { headers: { "user-agent": ua } });
      const html = await r.text(), headHtml = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] || "";
      assert.equal(r.status(), 200);
      for (const token of ['rel="canonical"', 'property="og:image"', 'name="twitter:card"']) assert.ok(headHtml.includes(token), `${ua}: ${token} in response head`);
      assert.ok(headHtml.includes(origin + "/opengraph-image.png"));
      results.cases.push({ name: `crawler-${ua}`, status: r.status(), metadataInResponseHead: true });
    }
    for (const path of ["/favicon.ico", "/apple-touch-icon.png", "/opengraph-image.png", "/robots.txt", "/sitemap.xml"]) {
      const r = await context.request.get(base + path), buffer = await r.body();
      assert.equal(r.status(), 200, path);
      const row = { path, status: r.status(), contentType: r.headers()["content-type"], bytes: buffer.length };
      if (path.endsWith(".png")) {
        const info = await sharp(buffer).metadata();
        row.image = { width: info.width, height: info.height, format: info.format, hasAlpha: info.hasAlpha };
        assert.equal(info.hasAlpha, false);
        assert.deepEqual([info.width, info.height], path.includes("apple") ? [180, 180] : [1200, 630]);
        assert.match(row.contentType, /^image\/png/);
      } else if (path.endsWith(".ico")) {
        assert.equal(buffer.readUInt16LE(2), 1);
        assert.equal(buffer.readUInt16LE(4), 3);
        row.frames = [];
        for (let i = 0; i < 3; i++) {
          const at = 6 + i * 16, length = buffer.readUInt32LE(at + 8), start = buffer.readUInt32LE(at + 12);
          const info = await sharp(buffer.subarray(start, start + length)).metadata();
          row.frames.push([info.width, info.height]);
        }
        assert.deepEqual(row.frames, [[16, 16], [32, 32], [48, 48]]);
        assert.match(row.contentType, /^image\/(x-icon|vnd.microsoft.icon)/);
      } else {
        row.body = buffer.toString();
        writeFileSync(`${out}/${path.slice(1)}.txt`, row.body);
        if (path.includes("robots")) {
          assert.match(row.body, /User-Agent: \*/i);
          assert.match(row.body, /Allow: \/\n/i);
          assert.ok(!/Disallow:\s*\//i.test(row.body));
          assert.ok(row.body.includes(`Sitemap: ${origin}/sitemap.xml`));
        } else {
          const xml = await page.evaluate(text => {
            const document = new DOMParser().parseFromString(text, "application/xml");
            return { valid: !document.querySelector("parsererror"), namespace: document.documentElement.namespaceURI };
          }, row.body);
          assert.equal(xml.valid, true);
          assert.equal(xml.namespace, "http://www.sitemaps.org/schemas/sitemap/0.9");
          row.xml = xml;
          const locations = [...row.body.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
          assert.deepEqual(locations, [origin + "/"]);
          assert.ok(!row.body.includes("<lastmod>"));
        }
      }
      results.cases.push(row);
    }
    await context.close();
    for (const engine of ["chrome", "webkit"]) {
      const targetBrowser = engine === "chrome" ? browser : await webkit.launch({ headless: true });
      for (const [width, height, javaScriptEnabled, reducedMotion] of [[1440,900,true,"no-preference"],[390,844,true,"no-preference"],[360,800,false,"no-preference"],[1440,900,false,"reduce"],[430,932,true,"reduce"]]) {
        const c = await targetBrowser.newContext({ viewport: { width, height }, javaScriptEnabled, reducedMotion });
        const p = await c.newPage();
        p.on("pageerror", e => results.errors.push(e.message));
        p.on("console", e => { if (["error", "warning"].includes(e.type())) results.warnings.push(e.text()); });
        const r = await p.goto(base + "/__seo_missing_page__/nested", { waitUntil: "load" });
        await p.evaluate(() => document.fonts.ready);
        assert.equal(r.status(), 404);
        const notFoundHead = await head(p);
        assert.equal(notFoundHead.links.filter(l => l.rel === "canonical").length, 0);
        assert.equal(notFoundHead.person.length, 0);
        assert.equal(notFoundHead.metas.filter(m => m.name === "robots" && m.content.includes("noindex")).length, 1);
        assert.equal(notFoundHead.metas.filter(m => m.name?.startsWith("og:")).length, 0);
        assert.equal(await p.locator("main").count(), 1);
        assert.match(await p.locator("main").innerText(), /404 \/ Page not found/i);
        const geometry = await p.evaluate(() => ({ overflow: document.documentElement.scrollWidth - innerWidth, main: document.querySelector("main").getBoundingClientRect().toJSON(), font: getComputedStyle(document.querySelector("h1")).fontFamily }));
        assert.equal(geometry.overflow, 0);
        const link = p.getByRole("link", { name: "Back to portfolio" });
        assert.equal(await link.getAttribute("href"), "/");
        // macOS WebKit uses Option+Tab to include anchors in keyboard traversal.
        const nextLink = engine === "webkit" ? "Alt+Tab" : "Tab";
        await p.keyboard.press(nextLink);
        assert.equal(await p.locator(":focus").getAttribute("href"), "/");
        await p.keyboard.press(nextLink);
        assert.match((await p.locator(":focus").innerText()).replace(/\s+/g, " "), /^Back to portfolio ↗$/);
        const focus = await link.evaluate(e => ({ outline: getComputedStyle(e).outlineStyle, width: getComputedStyle(e).outlineWidth, color: getComputedStyle(e).outlineColor, rect: e.getBoundingClientRect().toJSON() }));
        assert.equal(focus.outline, "solid");
        assert.ok(parseFloat(focus.width) >= 2);
        assert.ok(focus.rect.height >= 44);
        if (javaScriptEnabled) {
          await p.addScriptTag({ path: process.env.AXE_MODULE || "/private/tmp/portfolio-audit-tools/node_modules/axe-core/axe.min.js" });
          const axe = await p.evaluate(async () => { const r = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } }); return { violations: r.violations, incomplete: r.incomplete.map(r => ({ id: r.id, nodes: r.nodes.length })) }; });
          assert.deepEqual(axe.violations, []);
          results.cases.push({ name: `404-${engine}-${width}x${height}-${reducedMotion}`, status: r.status(), javaScriptEnabled, head: notFoundHead, geometry, focus, axe });
        } else results.cases.push({ name: `404-${engine}-${width}x${height}-nojs`, status: r.status(), head: notFoundHead, geometry, focus });
        await p.screenshot({ path: `${out}/404-${engine}-${width}x${height}-${javaScriptEnabled ? reducedMotion : "nojs"}.png`, fullPage: true });
        // Enter follows the real server-rendered anchor, including with JS disabled.
        await Promise.all([p.waitForURL(base + "/"), p.keyboard.press("Enter")]);
        assert.equal(await p.locator("#home").count(), 1);
        await c.close();
      }
      if (engine !== "chrome") await targetBrowser.close();
    }
    assert.deepEqual(results.errors, []);
  }
  save();
  console.log(`${phase}: ${results.cases.length} SEO/branding cases passed`);
} finally {
  save();
  await browser.close();
}
