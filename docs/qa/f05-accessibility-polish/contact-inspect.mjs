import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const phase=process.env.POLISH_PHASE || 'before';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try {
 for(const [width,height] of [[390,844],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<768,isMobile:width<768});
  await page.goto('http://127.0.0.1:3000/?motion-audit=1');await page.waitForFunction(()=>window.__motionAudit);await page.waitForTimeout(1700);
  const range=await page.evaluate(()=>{const e=document.querySelector('[data-contact-opening]').closest('[data-motion="active"]');const t=window.__motionAudit.ScrollTrigger.getAll().find(t=>t.trigger===e);return {start:t.start,end:t.end}});
  for(const p of [.05,.95,1]){
   await page.evaluate(({p,range})=>{scrollTo({top:range.start+(range.end-range.start)*p,behavior:'instant'});window.__motionAudit.ScrollTrigger.update()},{p,range});await page.waitForTimeout(80);
   const text=await page.evaluate(()=>{
    const lum=a=>a.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
    const ratio=(a,b)=>(lum(a)+.05)/(lum(b)+.05);
    return [...document.querySelectorAll('[data-contact-opening] > p:last-child,[data-contact-final-meta] > span')].map(e=>{
     let o=1;for(let n=e;n;n=n.parentElement)o*=+getComputedStyle(n).opacity;
     const c=getComputedStyle(e);return {text:e.textContent,color:c.color,background:c.backgroundColor,opacity:o,bestCaseRatioOnBase:ratio(c.color.match(/\d+/g).map(Number),[7,10,12]),rect:e.getBoundingClientRect().toJSON()};
    });
   });
   results.push({width,height,p,text});
   await page.screenshot({path:`docs/qa/f05-accessibility-polish/${phase}/contact-readable-${width}-${p}.jpg`,type:'jpeg',quality:90});
  }
  await page.close();
 }
}finally{await browser.close();writeFileSync(`docs/qa/f05-accessibility-polish/${phase}/contact-readable.json`,JSON.stringify(results,null,2)+'\n')}
console.log(JSON.stringify(results.map(s=>({width:s.width,p:s.p,text:s.text.map(t=>({text:t.text,color:t.color,background:t.background,opacity:t.opacity,ratio:t.bestCaseRatioOnBase}))}))));
