import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const{chromium,webkit}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='docs/qa/navigation-hydration/after/history';mkdirSync(out,{recursive:true});const rows=[];
for(const engine of ['chrome','webkit']){
 const b=await(engine==='chrome'?chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}):webkit.launch());
 try{
  for(const mode of ['desktop','mobile','reduced','no-js',...(engine==='chrome'?['no-webgl']:[])]){
   const c=await b.newContext({viewport:{width:mode==='mobile'?390:1440,height:mode==='mobile'?844:900},isMobile:mode==='mobile',hasTouch:mode==='mobile',javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
   if(mode==='no-webgl')await c.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:orig.call(this,t,...args)}});
   const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));const cases=[];
   async function capture(id,action,nativeBookmark=null){
    const frames=mode==='no-js'?await(async()=>{const samples=[];for(let i=0;i<12;i++){samples.push(await p.evaluate(id=>{const el=document.getElementById(id),margin=parseFloat(getComputedStyle(el).scrollMarginTop)||0,target=Math.min(Math.max(0,el.getBoundingClientRect().top+scrollY-margin),document.documentElement.scrollHeight-innerHeight);return{time:performance.now(),hash:location.hash,y:scrollY,error:scrollY-target,focus:document.activeElement?.tagName,lenis:null}},id));await p.waitForTimeout(16)}return samples})():await p.evaluate(async id=>{
     const result=[];const el=document.getElementById(id);await new Promise(resolve=>{let n=0;function tick(){const margin=parseFloat(getComputedStyle(el).scrollMarginTop)||0,target=Math.min(Math.max(0,el.getBoundingClientRect().top+scrollY-margin),document.documentElement.scrollHeight-innerHeight),l=window.__motionAudit?.lenis;result.push({time:performance.now(),hash:location.hash,y:scrollY,error:scrollY-target,focus:document.activeElement?.tagName,lenis:l?{animated:l.animatedScroll,target:l.targetScroll,actual:l.actualScroll,scrolling:l.isScrolling}:null});if(++n<12)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});return result;
    },id);
    // Native history retains a reading bookmark inside the destination section.
    // An interrupted anchor saved outside that section resolves to its start.
    const bounds=await p.evaluate(id=>{const r=document.getElementById(id).getBoundingClientRect(),margin=parseFloat(getComputedStyle(document.getElementById(id)).scrollMarginTop)||0;return{top:Math.min(Math.max(0,r.top+scrollY-margin),document.documentElement.scrollHeight-innerHeight),bottom:r.bottom+scrollY}},id);
    const expected=nativeBookmark!==null&&nativeBookmark>=bounds.top-1&&nativeBookmark<bounds.bottom?nativeBookmark:bounds.top;
    const row={id,action,nativeBookmark,expected,bounds,frames};cases.push(row);
    assert.ok(frames.every(f=>Math.abs(f.y-expected)<2),`${engine}/${mode}/${id}/${action}: first-frame bookmark errors ${frames.map(f=>f.y-expected)}`);
    assert.ok(frames.every(f=>f.hash==='#'+id));return row;
   }
   for(const id of ['home','work','about','contact'])for(let run=0;run<3;run++){
    const seed=id==='home'?'work':'home';
    await p.goto(`http://127.0.0.1:3001/?motion-audit=1#${seed}`);await p.waitForTimeout(550);
    await p.locator('header').getByRole('link',{name:id[0].toUpperCase()+id.slice(1),exact:true}).click();
    if(await p.evaluate(()=>!!window.__motionAudit?.lenis))await p.waitForFunction(()=>window.__motionAudit.lenis.isScrolling==='smooth');
    await p.goBack();await capture(seed,`rapid-back-${id}-${run}`);
    await p.evaluate(()=>{const l=window.__motionAudit?.lenis;if(l)l.scrollTo(scrollY<innerHeight?'#contact':'#home')});
    if(mode!=='no-js')await p.evaluate(()=>addEventListener('hashchange',()=>{window.__nativeRestoredY=scrollY},{capture:true,once:true}));
    await p.goForward();const bookmark=mode==='no-js'?null:await p.evaluate(()=>window.__nativeRestoredY);
    await capture(id,`rapid-forward-${run}`,bookmark);
   }
   const counts=await p.evaluate(()=>({triggers:window.__motionAudit?.ScrollTrigger.getAll().length,overflow:document.documentElement.scrollWidth-innerWidth}));assert.equal(counts.overflow,0);assert.deepEqual(errors,[]);
   rows.push({engine,mode,cases,counts,errors});writeFileSync(`${out}/results.json`,JSON.stringify(rows,null,2));console.log(`PASS ${engine}/${mode}: ${cases.length} rapid traversals / ${cases.length*12} first-frame samples`);await c.close();
  }
 }catch(error){writeFileSync(`${out}/failure.txt`,String(error.stack));throw error}finally{await b.close()}
}
