import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const {chromium,webkit}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='docs/qa/direct-anchor-performance/after/navigation';mkdirSync(out,{recursive:true});
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:3001';
const results=[];
for(const engine of ['chrome','webkit']){
 const browser=await(engine==='chrome'?chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}):webkit.launch());
 try{
  for(const mode of ['desktop','mobile','reduced','no-js',...(engine==='chrome'?['no-webgl']:[])]){
   const context=await browser.newContext({viewport:{width:mode==='mobile'?390:1440,height:mode==='mobile'?844:900},isMobile:mode==='mobile',hasTouch:mode==='mobile',reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-js'});
   if(mode==='no-webgl')await context.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return /webgl/.test(type)?null:orig.call(this,type,...args)}});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   const states=[];
   async function landing(id,action){
    await page.waitForTimeout(650);
    try { await page.waitForFunction(id=>{const e=document.getElementById(id),m=parseFloat(getComputedStyle(e).scrollMarginTop)||0,target=Math.min(Math.max(0,e.getBoundingClientRect().top+scrollY-m),document.documentElement.scrollHeight-innerHeight);return Math.abs(scrollY-target)<2},id,{timeout:8000}); }
    catch(error){writeFileSync(`${out}/failure-${engine}-${mode}-${action}-${id}.json`,JSON.stringify({engine,mode,id,action,states,current:await page.evaluate(()=>({hash:location.hash,y:scrollY,height:document.documentElement.scrollHeight,targets:['home','work','about','contact'].map(id=>({id,top:document.getElementById(id).getBoundingClientRect().top+scrollY}))}))},null,2));throw error}
    const state=await page.evaluate(id=>{const e=document.getElementById(id),m=parseFloat(getComputedStyle(e).scrollMarginTop)||0;return{id,hash:location.hash,y:scrollY,height:document.documentElement.scrollHeight,target:Math.min(Math.max(0,e.getBoundingClientRect().top+scrollY-m),document.documentElement.scrollHeight-innerHeight),overflow:document.documentElement.scrollWidth-innerWidth,focus:document.activeElement?.tagName,triggers:window.__motionAudit?.ScrollTrigger.getAll().length,pins:document.querySelectorAll('.pin-spacer').length,aboutMode:document.querySelector('#about').dataset.cinematic}},id);
    assert.ok(Math.abs(state.y-state.target)<2,`${engine}/${mode}/${id} landing`);assert.equal(state.overflow,0);assert.equal(state.pins,0);
    states.push({action,...state});await page.waitForTimeout(200);return state;
   }
   for(const id of ['home','work','about','contact']){
    await page.goto(`${base}/?motion-audit=1${id==='home'?'':'#'+id}`);await landing(id,'direct');await page.reload();await landing(id,'refresh');
   }
   await page.goto(`${base}/?motion-audit=1#about`);await landing('about','history-start');
   for(const id of ['work','contact']){await page.locator('header').getByRole('link',{name:id==='work'?'Work':'Contact',exact:true}).click();await landing(id,'header-link')}
   await page.goBack();await landing('work','back');await page.goBack();await landing('about','back');await page.goForward();await landing('work','forward');await page.goForward();await landing('contact','forward');
   assert.equal(errors.length,0);
   await page.screenshot({path:`${out}/${engine}-${mode}-contact.jpg`,type:'jpeg',quality:85});
   results.push({engine,mode,states,errors});writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));await context.close();console.log(`PASS ${engine}/${mode}: ${states.length} direct/refresh/history landings`);
  }
 }finally{await browser.close()}
}
