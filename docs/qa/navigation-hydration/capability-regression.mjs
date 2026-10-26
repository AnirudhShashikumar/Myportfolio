import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:3001';
const out='docs/qa/navigation-hydration/after/capability-regression';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try{
 const cases=[...['normal','unavailable','webgl1-only','throws','reduced','anchor'].map(mode=>[mode,1440,900]),...['normal','unavailable','reduced'].map(mode=>[mode,390,844])];
 for(const [mode,width,height] of cases){
  const context=await browser.newContext({viewport:{width,height},isMobile:width<768,hasTouch:width<768,reducedMotion:mode==='reduced'?'reduce':'no-preference'});
  await context.addInitScript(mode=>{
   window.__capability={draws:0,legacyRequests:0,shifts:[]};
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.__capability.shifts.push({time:e.startTime,value:e.value,recentInput:e.hadRecentInput,sources:e.sources.map(s=>({tag:s.node?.tagName,id:s.node?.id,className:s.node?.className,previousRect:s.previousRect,currentRect:s.currentRect}))})}).observe({type:'layout-shift',buffered:true});
   const original=HTMLCanvasElement.prototype.getContext;
   HTMLCanvasElement.prototype.getContext=function(type,...args){
    if(type==='webgl')window.__capability.legacyRequests++;
    if(/webgl/.test(type)&&mode==='throws')throw new Error('Simulated disabled graphics');
    if(/webgl/.test(type)&&mode==='unavailable'||type==='webgl2'&&mode==='webgl1-only')return null;
    return original.call(this,type,...args);
   };
   for(const proto of [window.WebGLRenderingContext?.prototype,window.WebGL2RenderingContext?.prototype])if(proto)for(const method of ['drawArrays','drawElements']){const original=proto[method];proto[method]=function(...args){window.__capability.draws++;return original.apply(this,args)}}
  },mode);
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${base}/?motion-audit=1${mode==='anchor'?'#about':''}`);await page.waitForFunction(()=>window.__motionAudit);await page.waitForTimeout(2700);
  const initial=await page.evaluate(()=>({stats:window.__capability,scripts:performance.getEntriesByType('resource').filter(r=>r.initiatorType==='script').map(r=>new URL(r.name).pathname),text:document.querySelector('[data-philosophy]').textContent,canvases:document.querySelectorAll('#home canvas').length,intro:document.querySelector('#home').dataset.introState,overflow:document.documentElement.scrollWidth-innerWidth}));
  assert.equal(errors.length,0);assert.equal(initial.overflow,0);assert.equal(initial.intro,'resolved');
  const supported=['normal','reduced','anchor'].includes(mode);
  assert.equal(initial.canvases,supported?2:1);assert.equal(initial.stats.draws>0,supported);assert.equal(initial.stats.legacyRequests,0);
  await page.screenshot({path:`${out}/${mode}-${width}.jpg`,type:'jpeg',quality:88});
  if(supported){
   await page.locator('#about').evaluate(el=>{el.scrollIntoView({behavior:'instant'});window.__motionAudit.ScrollTrigger.update()});await page.waitForTimeout(700);
   const before=await page.evaluate(()=>window.__capability.draws);await page.waitForTimeout(1000);assert.equal(await page.evaluate(()=>window.__capability.draws),before,'no offscreen rendering');
   await page.locator('#home').evaluate(el=>{el.scrollIntoView({behavior:'instant'});window.__motionAudit.ScrollTrigger.update()});await page.waitForTimeout(700);
   assert.equal(await page.locator('#home canvas').count(),2,'scene retained on return');
   if(mode!=='reduced')assert.ok(await page.evaluate(()=>window.__capability.draws)>before,'rendering resumes on return');
  }
  results.push({mode,width,height,initial,errors});await context.close();console.log(`PASS ${mode} ${width}x${height}`);
 }
}finally{writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2)+'\n');await browser.close()}
