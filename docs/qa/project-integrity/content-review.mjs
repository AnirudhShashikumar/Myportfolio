import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const results = [];
const out = "docs/qa/project-integrity/after";
try {
  for (const [width, height] of [[360,800],[390,844],[430,932],[768,1024],[1280,720],[1280,800],[1440,900],[1728,1117]]) {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.goto("http://127.0.0.1:3000/?motion-audit=1");
    await page.waitForFunction(() => window.__motionAudit);
    await page.waitForTimeout(1800);
    await page.getByRole("button", { name: "Read Work without motion", exact: true }).focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(150);
    const rows = [];
    const targets = [
      "[data-work-project='2'] [data-project-availability]",
      "[data-work-project='2'] [class*='creditLine']",
      "[data-df-verification]",
      "[data-work-project='4'] [data-project-availability]",
      "[data-mf-stats]",
      "[data-mf-fullstack-copy]",
      "[data-mf-team-copy]",
    ];
    for (const selector of targets) {
      const target = page.locator(selector);
      await target.scrollIntoViewIfNeeded();
      const row = await target.evaluate(root => {
        const leaves = [...root.querySelectorAll("h3,p,dt,dd,span,strong")];
        if (!leaves.length) leaves.push(root);
        const clips = [];
        for (const element of leaves) {
          if (element.closest('[aria-hidden="true"]')) continue;
          const directText = [...element.childNodes].filter(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
          for (const text of directText) {
            const range = document.createRange(); range.selectNodeContents(text);
            const bounds = [...range.getClientRects()].filter(r => r.width > 0);
            if (bounds.some(r => r.left < -0.5 || r.right > innerWidth + 0.5)) clips.push({ text: text.textContent, bounds: bounds.map(r => r.toJSON()) });
          }
        }
        return { text: root.textContent.replace(/\s+/g, " ").trim(), clips, overflow: document.documentElement.scrollWidth - innerWidth };
      });
      assert.equal(row.overflow, 0);
      assert.deepEqual(row.clips, [], `${width}x${height} ${selector} readable text`);
      rows.push({ selector, ...row });
      if ([390,1440].includes(width) && [targets[0], targets[2], targets[3], targets[4]].includes(selector)) {
        const name = targets.indexOf(selector);
        await page.screenshot({ path: `${out}/content-${width}x${height}-${name}.jpg`, type: "jpeg", quality: 90 });
      }
    }
    results.push({ width, height, rows });
    await page.close();
    console.log(`PASS ${width}x${height}: changed claims/status text fits in Work reading mode`);
  }
} finally {
  writeFileSync(`${out}/content-review.json`, JSON.stringify(results, null, 2) + "\n");
  await browser.close();
}
