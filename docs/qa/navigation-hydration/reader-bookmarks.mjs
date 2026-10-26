import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';

const { chromium, webkit } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const rows = [];
for (const engine of ['chrome', 'webkit']) {
  const browser = await (engine === 'chrome'
    ? chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' })
    : webkit.launch());
  try {
    for (const section of ['work', 'about']) for (const reading of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
      await page.goto(`http://127.0.0.1:3001/?motion-audit=1#${section}`);
      await page.waitForTimeout(650);
      if (reading) {
        const button = page.getByRole('button', { name: section === 'work' ? 'Read Work without motion' : 'Read without motion', exact: true });
        await button.focus();
        await button.press('Enter');
        await page.waitForTimeout(450);
      }
      await page.evaluate(section => {
        const bounds = document.getElementById(section).getBoundingClientRect();
        window.__motionAudit.lenis.scrollTo(bounds.top + scrollY + bounds.height * 0.6, { immediate: true });
      }, section);
      await page.waitForTimeout(100);
      const before = await page.evaluate(() => ({ y: scrollY, hash: location.hash, historyLength: history.length }));
      await page.evaluate(() => {
        window.__bookmark = { frames: [], start: null, stop: false, native: null, commands: [] };
        addEventListener('popstate', () => { if (location.hash !== '#contact') window.__bookmark.start = performance.now(); });
        addEventListener('hashchange', event => {
          if (event.newURL === location.href && location.hash !== '#contact') window.__bookmark.native = scrollY;
        }, true);
        const nativeScrollTo = window.scrollTo;
        window.scrollTo = function (...args) {
          if (window.__bookmark.start !== null) window.__bookmark.commands.push({ y: scrollY, args });
          return nativeScrollTo.apply(this, args);
        };
        function tick() {
          const data = window.__bookmark;
          if (data.start !== null) data.frames.push({ time: performance.now(), y: scrollY, hash: location.hash });
          if (!data.stop) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      await page.locator('header').getByRole('link', { name: 'Contact', exact: true }).click();
      await page.goBack();
      await page.waitForTimeout(300);
      const after = await page.evaluate(() => {
        window.__bookmark.stop = true;
        return { y: scrollY, hash: location.hash, historyLength: history.length, frames: window.__bookmark.frames,
          nativeRestoredY: window.__bookmark.native, commands: window.__bookmark.commands,
          workReader: document.getElementById('work').dataset.workReading,
          aboutCinematic: document.getElementById('about').dataset.cinematic };
      });
      rows.push({ engine, section, reading, before, after });
      writeFileSync('docs/qa/navigation-hydration/after/reader-bookmarks.json', JSON.stringify(rows, null, 2));
      assert.equal(after.hash, before.hash);
      assert.equal(after.historyLength, before.historyLength + 1, 'Contact creates one native entry; Back adds none');
      assert.ok(after.frames.length > 0);
      assert.notEqual(after.nativeRestoredY, null);
      assert.ok(after.frames.every(frame => Math.abs(frame.y - after.nativeRestoredY) < 2), 'preserve the actual native restoration from the first traversal frame');
      assert.equal(after.commands.length, 0, 'do not override the browser restoration inside the destination section');
      if (reading && section === 'work') assert.equal(after.workReader, 'true');
      if (reading && section === 'about') assert.equal(after.aboutCinematic, 'false');
      console.log(`PASS deep history: ${engine}/${section}/${reading ? 'reading' : 'cinematic'} (departure ${before.y}px; native restoration ${after.nativeRestoredY}px)`);
      await page.close();
    }
  } finally { await browser.close(); }
}
