import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, renameSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const phase=process.env.PERF_PHASE||'before', diagnostic=process.env.DIAGNOSTIC==='1';
const out=`docs/qa/navigation-hydration/${phase}`;
const base=process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:3001';
mkdirSync(out,{recursive:true});
function instrument({diagnostic}) {
 const s=window.__anchor={shifts:[],tasks:[],lcp:[],events:[],frames:[],draw: null};
 const node=el=>el?`${el.tagName}${el.id?'#'+el.id:''}.${typeof el.className==='string'?el.className:''}`:null;
 const geometry=()=>({y:scrollY,height:document.documentElement.scrollHeight,sections:['home','work','about','contact'].map(id=>{const el=document.getElementById(id);return{id,top:el?.getBoundingClientRect().top+scrollY,height:el?.offsetHeight,cinematic:el?.dataset.cinematic}}),pins:document.querySelectorAll('.pin-spacer').length});
 const event=(name,extra={})=>s.events.push({name,time:performance.now(),...geometry(),...extra});
 for(const type of ['layout-shift','longtask','largest-contentful-paint'])try{new PerformanceObserver(list=>{for(const e of list.getEntries()) {
  if(type==='layout-shift')s.shifts.push({time:e.startTime,value:e.value,recentInput:e.hadRecentInput,y:scrollY,sources:e.sources.map(x=>({node:node(x.node),old:x.previousRect.toJSON(),new:x.currentRect.toJSON()}))});
  if(type==='longtask')s.tasks.push({time:e.startTime,duration:e.duration});
  if(type==='largest-contentful-paint')s.lcp.push({time:e.startTime,size:e.size,node:node(e.element)});
 }}).observe({type,buffered:true})}catch{}
 for(const proto of [window.WebGLRenderingContext?.prototype,window.WebGL2RenderingContext?.prototype])if(proto)for(const name of ['drawArrays','drawElements']){const orig=proto[name];proto[name]=function(...args){s.draw??=performance.now();return orig.apply(this,args)}}
 if(diagnostic){
  let audit;
  Object.defineProperty(window,'__motionAudit',{configurable:true,get:()=>audit,set(value){audit=value;event('motion-audit-ready',{triggers:value.ScrollTrigger.getAll().map(t=>({id:t.vars.id,start:t.start,end:t.end,trigger:node(t.trigger),pin:!!t.pin})),aboutPlate:document.querySelector('[data-plate]')?.dataset.plate});value.ScrollTrigger.addEventListener('refreshInit',()=>event('refreshInit'));value.ScrollTrigger.addEventListener('refresh',()=>event('refresh'));}});
  document.addEventListener('DOMContentLoaded',()=>{
   event('DOMContentLoaded');
   new MutationObserver(records=>{const changes=records.filter(r=>r.type==='attributes'&&['data-motion','data-cinematic'].includes(r.attributeName));if(changes.length)event('motion-layout-commit',{changes:changes.map(r=>({node:node(r.target),attribute:r.attributeName,value:r.target.getAttribute(r.attributeName)}))})}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['data-motion','data-cinematic']});
   let end=performance.now()+1400;function sample(){s.frames.push({time:performance.now(),...geometry()});if(performance.now()<end)requestAnimationFrame(sample)}requestAnimationFrame(sample);
  });
  window.addEventListener('load',()=>event('load'));
  window.addEventListener('scroll',()=>event('scroll'),{passive:true});
 }
}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try{
 const profiles=diagnostic?(process.env.DIAGNOSTIC_PROFILE==='mobile'?[{name:'mobile',hash:'',mobile:true}]:process.env.DIAGNOSTIC_PROFILE==='desktop'?[{name:'desktop',hash:'#about'}]:[...['','#work','#about','#contact'].map(hash=>({name:'desktop',hash})),{name:'mobile',hash:'',mobile:true}]):[...['','#work','#about','#contact'].map(hash=>({name:'desktop',hash})),{name:'mobile',hash:'',mobile:true}];
 for(const profile of profiles.filter(p=>!p.mobile))for(let iteration=0;iteration<(diagnostic?1:3);iteration++){
  const label=`${profile.name}-${profile.hash.slice(1)||'home'}-${iteration}`;
  const context=await browser.newContext({viewport:{width:profile.mobile?390:1440,height:profile.mobile?844:900},isMobile:!!profile.mobile,hasTouch:!!profile.mobile,...(diagnostic&&!profile.mobile?{recordVideo:{dir:out,size:{width:1440,height:900}}}:{})});
  await context.addInitScript(instrument,{diagnostic:diagnostic&&!profile.mobile});
  const page=await context.newPage(),cdp=await context.newCDPSession(page),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  if(profile.mobile){await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750})}
  if(diagnostic&&profile.mobile){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:100});await cdp.send('Profiler.start');await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.stack',transferMode:'ReturnAsStream'})}
  for(const navigation of diagnostic?['navigate']:['navigate','refresh']){
   if(navigation==='navigate')await page.goto(`${base}/?motion-audit=1${profile.hash}`,{waitUntil:'load'});else await page.reload({waitUntil:'load'});
   if(diagnostic&&!profile.mobile)await page.screenshot({path:`${out}/${label}-early.jpg`});
   await page.waitForTimeout(1800);
   const data=await page.evaluate(()=>{
    const id=location.hash.slice(1)||'home',el=document.getElementById(id),margin=el?parseFloat(getComputedStyle(el).scrollMarginTop)||0:0;
    return{...window.__anchor,paints:performance.getEntriesByType('paint').map(e=>e.toJSON()),navigation:performance.getEntriesByType('navigation')[0].toJSON(),resources:performance.getEntriesByType('resource').map(e=>({url:e.name,type:e.initiatorType,encodedBody:e.encodedBodySize})),final:{y:scrollY,height:document.documentElement.scrollHeight,target:id,targetTop:el?.getBoundingClientRect().top+scrollY,margin,error:el?el.getBoundingClientRect().top-margin:null,triggers:window.__motionAudit?.ScrollTrigger.getAll().length,pins:document.querySelectorAll('.pin-spacer').length,focus:document.activeElement?.tagName,overflow:document.documentElement.scrollWidth-innerWidth}}
   });
   results.push({profile:profile.name,hash:profile.hash,iteration,action:navigation,errors,...data});
   writeFileSync(`${out}/${diagnostic?'diagnostic':'anchors'}.json`,JSON.stringify(results,null,2));
   console.log(label,navigation,'CLS',data.shifts.filter(s=>!s.recentInput).reduce((a,b)=>a+b.value,0),'landing',data.final.error,'tasks',data.tasks.map(t=>Math.round(t.duration)));
   if(diagnostic)await page.screenshot({path:`${out}/${label}-final.jpg`});
  }
  if(diagnostic&&profile.mobile){const {profile:cpu}=await cdp.send('Profiler.stop');writeFileSync(`${out}/mobile-cpu.json`,JSON.stringify(cpu));const done=new Promise(r=>cdp.once('Tracing.tracingComplete',r));await cdp.send('Tracing.end');const{stream}=await done;let trace='';for(;;){const c=await cdp.send('IO.read',{handle:stream});trace+=c.base64Encoded?Buffer.from(c.data,'base64').toString():c.data;if(c.eof)break}await cdp.send('IO.close',{handle:stream});writeFileSync(`${out}/mobile-trace.json.gz`,gzipSync(trace));}
  const video=page.video();await context.close();if(video)renameSync(await video.path(),`${out}/${label}.webm`);
 }
}finally{await browser.close()}
