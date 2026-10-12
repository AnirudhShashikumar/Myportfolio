// Local rendered-page QA. Reuses an installed Playwright; no app dependency.
// PLAYWRIGHT_MODULE=/path/to/playwright PORTFOLIO_QA_URL=http://127.0.0.1:3000 node scripts/about-motion-qa.mjs
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { plates } from '../src/sections/about/aboutContent.ts';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const directory = 'docs/qa/about-motion';
mkdirSync(directory, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
try {
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:3000';
const errors = [];
const consoleMessages = [];
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if(['warning','error'].includes(message.type())) consoleMessages.push(message.text()); });
async function ready(target = page) {
  await target.waitForFunction(() => window.__motionAudit && document.querySelector('#about')?.dataset.cinematic);
  await target.waitForTimeout(1400);
}
async function jump(progress) {
  await page.evaluate(p => {
    const { ScrollTrigger } = window.__motionAudit;
    const trigger = ScrollTrigger.getById('about-story');
    window.scrollTo({ top: trigger.start + (trigger.end - trigger.start) * p, behavior: 'instant' });
    ScrollTrigger.update();
  }, progress);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
}
async function snapshot() {
  return page.evaluate(() => {
    const root = document.querySelector('#about'), st = window.__motionAudit.ScrollTrigger, t = st.getById('about-story');
    const visible = [...root.querySelectorAll('[data-about-plate]')].filter(el => getComputedStyle(el).visibility !== 'hidden' && +getComputedStyle(el).opacity > .05);
    const scope = root.dataset.cinematic === 'true' ? visible : [root.querySelector('[data-about-editorial]')];
    const issues = [];
    for (const region of scope) for (const el of region.querySelectorAll('p,h3,h4,li,img,figcaption')) {
      const r=el.getBoundingClientRect(); if(r.width<2 || getComputedStyle(el).visibility==='hidden') continue;
      const range=document.createRange();range.selectNodeContents(el);const text=el.tagName==='IMG'?r:range.getBoundingClientRect();
      if(text.right>innerWidth-8 || text.left<8 || (t && (text.top<75 || text.bottom>innerHeight-18))) issues.push({text:el.textContent.slice(0,80),left:text.left,right:text.right,top:text.top,bottom:text.bottom});
    }
    for(const el of root.querySelectorAll('[data-about-shared]')) {
      if(getComputedStyle(el).visibility==='hidden') continue;
      for(const child of el.querySelectorAll('p,li')){const r=child.getBoundingClientRect();if(r.right>innerWidth-8||r.left<8||r.bottom>innerHeight-18)issues.push({text:child.textContent,left:r.left,right:r.right,bottom:r.bottom});}
    }
    for(const region of scope) for(const copy of region.querySelectorAll('[data-about-title], [data-about-title] ~ p')) {
      if(getComputedStyle(copy).visibility==='hidden') continue;
      const range=document.createRange();range.selectNodeContents(copy);const a=range.getBoundingClientRect();
      for(const diagram of root.querySelectorAll('[data-about-shared]')) {
        if(getComputedStyle(diagram).visibility==='hidden'||+getComputedStyle(diagram).opacity<.2)continue;
        for(const label of diagram.querySelectorAll('li,p')) {
          const range=document.createRange();range.selectNodeContents(label);const b=range.getBoundingClientRect();
          if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>4&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>4)issues.push({collision:[copy.textContent.slice(0,50),label.textContent]});
        }
      }
    }
    return {viewport:[innerWidth,innerHeight],cinematic:root.dataset.cinematic,progress:t?.progress,visualProgress:t?.animation.progress(),movement:root.querySelector('[data-movement]')?.dataset.movement,plates:visible.map(el=>el.dataset.aboutPlate),titles:visible.filter(el=>getComputedStyle(el.querySelector('[data-about-title]')).visibility!=='hidden').map(el=>el.dataset.aboutPlate),triggers:st.getAll().filter(t=>root.contains(t.trigger)).length,elements:root.querySelectorAll('*').length,canvases:root.querySelectorAll('canvas').length,overflow:document.documentElement.scrollWidth-innerWidth,geometryOpacity:root.querySelector('[data-about-geometry]')?getComputedStyle(root.querySelector('[data-about-geometry]')).opacity:null,path:root.querySelector('[data-about-path]')?.getAttribute('d'),layoutIssues:issues};
  });
}
await page.goto(`${base}/?motion-audit=1`);
await ready();
async function signature() {
  return page.evaluate(() => {
    const {gsap} = window.__motionAudit;
    const round = v => typeof v === 'number' ? Math.round(v*1000)/1000 : v;
    return [...document.querySelectorAll('#about [data-about-title], #about [data-about-line], #about [data-about-shared], #about [data-about-path], #about [data-about-layer], #about [data-about-question-stem], #about [data-about-question-dot]')].map(el => ({
      opacity:round(+getComputedStyle(el).opacity),visibility:getComputedStyle(el).visibility,
      x:round(gsap.getProperty(el,'x')),y:round(gsap.getProperty(el,'y')),scaleX:round(gsap.getProperty(el,'scaleX')),
      path:el.getAttribute('d')?.replace(/-?\d+(?:\.\d+)?/g, n=>String(Math.round(Number(n)*100)/100))
    }));
  });
}
await page.evaluate(()=>{
 window.__aboutCLS=[];
 window.__aboutCLSObserver=new PerformanceObserver(list=>window.__aboutCLS.push(...list.getEntries().filter(e=>!e.hadRecentInput).map(e=>({value:e.value,aboutSources:e.sources.filter(s=>document.querySelector('#about').contains(s.node)).length}))));
 window.__aboutCLSObserver.observe({type:'layout-shift'});
});
const signatures=[];
const holds=[];
for(let i=0;i<plates.length;i++){
  const p=plates[i];await jump(p.start+(p.end-p.start)*.6);holds.push(await snapshot());signatures.push(await signature());
  await page.screenshot({path:`${directory}/plate-${String(i+1).padStart(2,'0')}.jpg`,type:'jpeg',quality:80});
}
const reverseIssues=[];
for(let i=plates.length-1;i>=0;i--){const p=plates[i];await jump(p.start+(p.end-p.start)*.6);try{assert.deepEqual(await signature(),signatures[i]);}catch{reverseIssues.push(i);}}
const transitions=[];
for(let i=1;i<plates.length;i++){
  const p=plates[i];for(const delta of [-.001,0,.001,.004]){await jump(p.start+delta);transitions.push(await snapshot());}
  await jump(p.start+.001);
  await page.screenshot({path:`${directory}/transition-${String(i).padStart(2,'0')}.jpg`,type:'jpeg',quality:75});
}
const layoutShifts=await page.evaluate(()=>{window.__aboutCLSObserver.disconnect();return window.__aboutCLS;});
const jumps=[];
for(const p of [.14,.79,.235,.98,.375,.63,.885,.01,1,.4,.6,.2,.99,.1]){await jump(p);jumps.push(await snapshot());}
// Same 240-frame forward/reverse sweep used for the pre-change baseline.
const performance = await page.evaluate(async()=>{
const {ScrollTrigger}=window.__motionAudit,t=ScrollTrigger.getById('about-story');window.scrollTo({top:t.start,behavior:'instant'});ScrollTrigger.update();await new Promise(r=>setTimeout(r,300));
const intervals=[],tasks=[];const observer=new PerformanceObserver(l=>tasks.push(...l.getEntries().map(e=>e.duration)));observer.observe({type:'longtask'});let last;
await new Promise(resolve=>{let n=0;function tick(now){if(last)intervals.push(now-last);last=now;const p=n/240;window.scrollTo({top:t.start+(t.end-t.start)*(p<.65?p/.65:1-(p-.65)/.35),behavior:'instant'});ScrollTrigger.update();if(++n<=240)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick)});observer.disconnect();intervals.sort((a,b)=>a-b);
return {intervals:{count:intervals.length,median:intervals[Math.floor(intervals.length*.5)],p95:intervals[Math.floor(intervals.length*.95)],max:intervals.at(-1),over33ms:intervals.filter(v=>v>33).length},longTasks:tasks};
});
const wheels=[];
await jump(.22);
for(const delta of [24,24,80,160,600,-160,-24,-600]){await page.mouse.wheel(0,delta);await page.waitForTimeout(180);wheels.push(await snapshot());}
await page.waitForTimeout(1000);
const workExit=[];
const aboutTop=await page.locator('#about').evaluate(el=>el.getBoundingClientRect().top+scrollY);
for(const offset of [-700,-300,0,300,-300,0]){
 await page.evaluate(y=>{window.scrollTo({top:y,behavior:'instant'});window.__motionAudit.ScrollTrigger.update();},aboutTop+offset);
 workExit.push(await page.evaluate(()=>({gap:document.querySelector('#about').getBoundingClientRect().top-document.querySelector('#work').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth-innerWidth,workAxis:window.__motionAudit.gsap.getProperty(document.querySelector('[data-exit-vertical]'),'scaleY')})));
}
const viewportResults=[];
for(const [width,height] of [[360,800],[390,844],[430,932],[768,1024],[1280,720],[1280,800],[1440,900],[1728,1117]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(500);
 const cinema=await page.locator('#about').getAttribute('data-cinematic');
 if(cinema==='true'){
   for(const p of plates){await jump(p.start+(p.end-p.start)*.6);viewportResults.push(await snapshot());}
   await jump(.44);
 }else{await page.locator('#about').scrollIntoViewIfNeeded();viewportResults.push(await snapshot());}
 await page.screenshot({path:`${directory}/viewport-${width}x${height}.jpg`,type:'jpeg',quality:80});
}
await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(500);await jump(.79);
await page.getByRole('button',{name:'Read without motion'}).click();await page.waitForTimeout(500);
const reader={...await snapshot(),focus:await page.evaluate(()=>document.activeElement?.id)};
await page.screenshot({path:`${directory}/reader.jpg`,type:'jpeg',quality:80});
await page.getByRole('button',{name:'Return to motion'}).click();await page.waitForTimeout(500);const returned=await snapshot();
await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(500);const reduced=await snapshot();
await page.screenshot({path:`${directory}/reduced.jpg`,type:'jpeg',quality:80});
await page.emulateMedia({reducedMotion:'no-preference'});await page.waitForTimeout(500);
await page.goto(`${base}/?motion-audit=1#about`);await ready();const direct=await snapshot();
await page.screenshot({path:`${directory}/direct-about.jpg`,type:'jpeg',quality:80});
await jump(1);await page.evaluate(()=>{const el=document.querySelector('#contact');window.scrollTo({top:el.getBoundingClientRect().top+scrollY,behavior:'instant'});window.__motionAudit.ScrollTrigger.update();});
await page.screenshot({path:`${directory}/contact.jpg`,type:'jpeg',quality:80});await jump(.98);const contactReverse=await snapshot();
// Coarse touch + native flow uses real browser capability emulation.
const phone=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
await phone.goto(`${base}/?motion-audit=1#about`);await ready(phone);
const mobile=await phone.evaluate(()=>({cinematic:document.querySelector('#about').dataset.cinematic,story:!!window.__motionAudit.ScrollTrigger.getById('about-story'),overflow:document.documentElement.scrollWidth-innerWidth,readings:document.querySelectorAll('[data-about-reading]').length}));
for(const movement of ['M02','M03','M06','M09','M10','M11']){await phone.locator(`#about-${movement}`).scrollIntoViewIfNeeded();await phone.waitForTimeout(650);await phone.screenshot({path:`${directory}/phone-${movement}.jpg`,type:'jpeg',quality:80});}
const images=await page.evaluate(()=>[...document.querySelectorAll('#about img')].map(img=>({src:img.currentSrc,complete:img.complete,naturalWidth:img.naturalWidth})));
const results={layoutShifts,base,reverseIssues,workExit,holds,transitions,jumps,wheels,viewportResults,performance,reader,returned,reduced,direct,contactReverse,mobile,images,errors,consoleMessages};
writeFileSync(`${directory}/after.json`,JSON.stringify(results,null,2));
console.log(JSON.stringify({holds:holds.length,transitions:transitions.length,viewportSamples:viewportResults.length,issues:holds.concat(viewportResults).filter(r=>r.layoutIssues.length),blank:transitions.filter(r=>!r.titles.length),competing:transitions.filter(r=>r.titles.length>1),errors,performance,readerFocus:reader.focus,reducedTriggers:reduced.triggers,mobile},null,2));
assert.equal(errors.length,0,'browser errors');
assert.equal(consoleMessages.filter(m=>m.includes('GSAP target')).length,0,'no empty animation targets');
assert.deepEqual(reverseIssues,[],'reverse scroll must reconstruct identical visual states');
for(const state of holds.concat(transitions,jumps,wheels)) {
 assert.ok(state.titles.length===1,'one dominant headline');
 assert.ok(Math.abs(state.progress-state.visualProgress)<.00001,'direct scroll mapping');
 assert.equal(state.overflow,0,'horizontal overflow');
}
for(const state of holds.concat(viewportResults)) assert.deepEqual(state.layoutIssues,[],'resolved text bounds');
assert.equal(reduced.triggers,0,'reduced motion cleanup');
assert.equal(reader.focus,'about-M09','reader preserves focus');
assert.equal(returned.movement,'M09','returning to motion preserves the reading chapter');
assert.equal(mobile.story,false,'no phone story trigger');
assert.equal(direct.progress,0,'direct About entry');
for(const state of workExit){assert.equal(state.gap,0);assert.equal(state.overflow,0);}
console.log('About rendered-page assertions passed.');
} finally {
  await browser.close();
}
