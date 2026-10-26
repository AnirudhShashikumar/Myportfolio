// Isolate each wheel trial so an unfinished Lenis interpolation cannot undo a jump.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const result={regions:[],errors:[]};
const scan=page=>page.evaluate(()=>({y:scrollY,overflow:document.documentElement.scrollWidth-innerWidth,mismatches:window.__motionAudit.ScrollTrigger.getAll().filter(t=>t.isActive&&t.vars.scrub===true&&t.animation&&Math.abs(t.progress-t.animation.totalProgress())>.01).map(t=>t.vars.id)}));
try {
 for(const region of ['#home',...Array.from({length:6},(_,i)=>`[data-work-project="${i}"]`),'#about','#contact']) {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  page.on('pageerror',e=>result.errors.push(e.message));
  await page.goto(`${process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:3000'}/?motion-audit=1`,{waitUntil:'load'});
  await page.waitForFunction(()=>window.__motionAudit);
  await page.waitForTimeout(1900);
  const target=await page.locator(region).evaluate(e=>e.getBoundingClientRect().top+scrollY+100);
  await page.evaluate(y=>{scrollTo({top:y,behavior:'instant'});window.__motionAudit.ScrollTrigger.update()},target);
  await page.waitForTimeout(200);
  const before=await scan(page);
  assert.ok(Math.abs(before.y-target)<2,`trial actually begins at ${region}`);
  const slow=[];
  for(let i=0;i<8;i++){await page.mouse.wheel(0,60);await page.waitForTimeout(100);slow.push(await scan(page))}
  await page.waitForTimeout(800);
  const slowEnd=await scan(page);
  assert.ok(slowEnd.y>before.y+400,'slow wheel advances the actual section');
  await page.mouse.wheel(0,2400);await page.waitForTimeout(900);
  const fast=await scan(page);
  assert.ok(fast.y>slowEnd.y+1000,'fast wheel advances across the section');
  await page.mouse.wheel(0,-1200);await page.waitForTimeout(900);
  const reverse=await scan(page);
  assert.ok(reverse.y<fast.y-900,'reverse wheel returns without stale state');
  for(const state of [before,...slow,slowEnd,fast,reverse]){assert.equal(state.overflow,0);assert.equal(state.mismatches.length,0)}
  result.regions.push({region,target,before,slow,slowEnd,fast,reverse});
  console.log(`PASS isolated slow/fast/reverse wheel input at ${region}`);
  await page.close();
 }
 assert.equal(result.errors.length,0);
} finally {writeFileSync('docs/qa/navigation-hydration/after/regression/scroll-input.json',JSON.stringify(result,null,2)+'\n');await browser.close()}
