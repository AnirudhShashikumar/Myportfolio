// Browser-response experiment only. No reservation rule is shipped by the app.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const{chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='docs/qa/navigation-hydration/trials/reservation';mkdirSync(out,{recursive:true});
const css=`@media (scripting: enabled) and (min-width:1100px) and (min-height:780px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference){
#work [class*="SatQueryFeature_sequence"]{height:200svh}
#work [class*="GestureGlobeFeature_sequence"]{height:190svh}
#work [class*="WorkNavigation_handoff__"]{height:168svh;border-block:0}
#work [class*="WorkNavigation_handoff__"][class*="restrained"]{height:148svh}
#about{min-height:1600svh}#contact{min-height:430svh}
}`;writeFileSync(`${out}/candidate.css.txt`,css);
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),rows=[];
try{
 for(const mode of ['normal','bundles-blocked','blocked-original','no-js'])for(const hash of ['about','contact','work'])for(let iteration=0;iteration<(mode==='normal'?3:1);iteration++){
  const c=await b.newContext({viewport:{width:1440,height:900},javaScriptEnabled:mode!=='no-js'});
  await c.addInitScript(()=>{window.__shifts=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__shifts.push({time:e.startTime,value:e.value,recentInput:e.hadRecentInput,sources:e.sources.map(s=>({tag:s.node?.tagName,id:s.node?.id,old:s.previousRect.toJSON(),new:s.currentRect.toJSON()}))})}).observe({type:'layout-shift',buffered:true});document.addEventListener('DOMContentLoaded',()=>window.__initialHeight=document.documentElement.scrollHeight)});
  await c.route('**/*',async route=>{
   if(route.request().resourceType()==='document'){const r=await route.fetch();return route.fulfill({response:r,body:mode==='blocked-original'?await r.text():(await r.text()).replace('</head>',`<style>${css}</style></head>`)})}
   if(['bundles-blocked','blocked-original'].includes(mode)&&route.request().resourceType()==='script')return route.abort();
   return route.continue();
  });
  const p=await c.newPage();await p.goto(`http://127.0.0.1:3001/?motion-audit=1#${hash}`);await p.waitForTimeout(1200);
  const data=await p.evaluate(()=>{const sq=document.querySelector('[class*="SatQueryFeature_sequence"]'),gg=document.querySelector('[class*="GestureGlobeFeature_sequence"]');return{initialHeight:window.__initialHeight,finalHeight:document.documentElement.scrollHeight,y:scrollY,shifts:window.__shifts,wrappers:[sq,gg].map(el=>({class:el.className,height:el.getBoundingClientRect().height,contentHeight:el.firstElementChild.getBoundingClientRect().height,contentPastNextSiblingPx:el.firstElementChild.getBoundingClientRect().bottom-el.nextElementSibling.getBoundingClientRect().top}))}});
  if(hash==='work'&&mode==='bundles-blocked')await p.evaluate(()=>scrollTo(0,6000));
  await p.screenshot({path:`${out}/${mode}-${hash}-${iteration}.jpg`,type:'jpeg',quality:90});rows.push({mode,hash,iteration,...data});console.log(mode,hash,data.initialHeight,data.finalHeight,data.shifts?.map(e=>e.value),data.wrappers.map(w=>w.contentPastNextSiblingPx));await c.close();
 }
}finally{await b.close();writeFileSync(`${out}/results.json`,JSON.stringify(rows,null,2)+'\n')}
