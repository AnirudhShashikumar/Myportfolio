// Diagnostic only: interrupt Lenis as soon as the fragment is within two pixels.
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const{chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),rows=[];
try{
 for(let run=0;run<3;run++){
  const c=await b.newContext({viewport:{width:1440,height:900}}),p=await c.newPage();
  await p.goto(`${process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:3001'}/?motion-audit=1#about`);await p.waitForTimeout(1600);
  // Native fragment scrolling can briefly land at the target before Lenis has
  // advanced. Require its animated position to be near the destination too.
  for(const name of ['Work','Contact']){await p.locator('header').getByRole('link',{name,exact:true}).click();await p.waitForFunction(id=>{const l=window.__motionAudit.lenis,top=document.getElementById(id).getBoundingClientRect().top+scrollY;return Math.abs(scrollY-top)<2&&Math.abs(l.animatedScroll-top)<2&&l.isScrolling==='smooth'},name.toLowerCase())}
  const before=await p.evaluate(()=>({time:performance.now(),hash:location.hash,y:scrollY,classes:document.documentElement.className,lenis:(()=>{const l=window.__motionAudit?.lenis;return l?{animated:l.animatedScroll,target:l.targetScroll,actual:l.actualScroll,scrolling:l.isScrolling}:null})()}));
  await p.evaluate(()=>{window.__historyEvents=[];for(const name of ['popstate','hashchange','scroll'])addEventListener(name,()=>{const l=window.__motionAudit?.lenis;window.__historyEvents.push({name,t:performance.now(),hash:location.hash,y:scrollY,lenis:l?{animated:l.animatedScroll,target:l.targetScroll,actual:l.actualScroll,scrolling:l.isScrolling}:null})},true)});await p.goBack();
  const frames=await p.evaluate(async()=>{const rows=[];await new Promise(resolve=>{let i=0;function tick(){rows.push({time:performance.now(),y:scrollY,hash:location.hash,classes:document.documentElement.className,lenis:(()=>{const l=window.__motionAudit?.lenis;return l?{animated:l.animatedScroll,target:l.targetScroll,actual:l.actualScroll,scrolling:l.isScrolling}:null})()});if(++i<120)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});return rows});
  const final=await p.evaluate(()=>({hash:location.hash,y:scrollY,target:document.getElementById('work').getBoundingClientRect().top+scrollY}));
  rows.push({run,before,frames,final,events:await p.evaluate(()=>window.__historyEvents),accurate:Math.abs(final.y-final.target)<2});await c.close();
 }
}finally{await b.close();writeFileSync('docs/qa/navigation-hydration/after/rapid-history.json',JSON.stringify(rows,null,2))}
console.log(rows.map(r=>({run:r.run,accurate:r.accurate,final:r.final})));
