import assert from 'node:assert/strict';
import{createRequire}from'node:module';import{writeFileSync}from'node:fs';
const{chromium,webkit}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright'),rows=[];
for(const engine of ['chrome','webkit']){
 const b=await(engine==='chrome'?chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}):webkit.launch());
 try{const c=await b.newContext({viewport:{width:1440,height:900}}),p=await c.newPage();
 for(const destination of ['home','work','about','contact'])for(let run=0;run<3;run++){
  const seed=destination==='home'?'work':'home';await p.goto(`http://127.0.0.1:3001/?motion-audit=1#${seed}`);await p.waitForTimeout(550);
  await p.evaluate(()=>{
   const ids=new WeakMap();let next=0;const data=window.__details={frames:[],events:[],commands:[],phase:'prepare'};
   function snapshot(){const l=window.__motionAudit.lenis;if(!ids.has(l))ids.set(l,next++);const id=location.hash.slice(1),el=document.getElementById(id),margin=el?parseFloat(getComputedStyle(el).scrollMarginTop)||0:0,target=el?Math.min(Math.max(0,el.getBoundingClientRect().top+scrollY-margin),document.documentElement.scrollHeight-innerHeight):0;return{time:performance.now(),phase:data.phase,hash:location.hash,y:scrollY,target,bottom:el?el.getBoundingClientRect().bottom+scrollY:0,error:scrollY-target,focus:document.activeElement?.tagName,historyLength:history.length,lenis:{instance:ids.get(l),animated:l.animatedScroll,target:l.targetScroll,actual:l.actualScroll,scrolling:l.isScrolling,destination:l.animate.to}}}
   const native=window.scrollTo;window.scrollTo=function(...args){data.commands.push({...snapshot(),args});return native.apply(this,args)};
   for(const name of ['popstate','hashchange'])for(const capture of [true,false])addEventListener(name,()=>data.events.push({name,when:capture?'before-owner':'after-owner',...snapshot()}),capture);
   function tick(){data.frames.push(snapshot());requestAnimationFrame(tick)}requestAnimationFrame(tick);
  });
  await p.locator('header').getByRole('link',{name:destination[0].toUpperCase()+destination.slice(1),exact:true}).click();
  await p.evaluate(()=>window.__details.phase='back');await p.goBack();await p.waitForTimeout(250);
  await p.evaluate(()=>{window.__details.phase='prepare-forward';window.__motionAudit.lenis.scrollTo(scrollY<innerHeight?'#contact':'#home');window.__details.phase='forward'});await p.goForward();await p.waitForTimeout(250);
  const data=await p.evaluate(()=>window.__details);
  for(const phase of ['back','forward']){
   const start=data.events.find(e=>e.name==='popstate'&&e.phase===phase&&e.when==='before-owner');assert.ok(start);
   const frames=data.frames.filter(f=>f.phase===phase&&f.time>=start.time);
   const bookmark=data.events.find(e=>e.name==='hashchange'&&e.phase===phase&&e.when==='before-owner'&&e.hash==='#'+(phase==='back'?seed:destination)).y;
   const expected=phase==='forward'&&bookmark>=frames[0]?.target-1&&bookmark<frames[0]?.bottom?bookmark:frames[0]?.target;
   assert.ok(frames.length>0);assert.ok(frames.every(f=>Math.abs(f.y-expected)<2),`${engine}/${destination}/${phase}: ${frames.map(f=>f.y-expected)}`);
   const commands=data.commands.filter(e=>e.phase===phase&&e.time>=start.time);assert.ok(commands.length<=1,'at most one corrective scroll after native restoration');
   assert.equal(data.events.filter(e=>e.name==='popstate'&&e.phase===phase&&e.when==='before-owner').length,1,'no reentrant history event');
   assert.ok(frames.every(f=>f.historyLength===start.historyLength),'traversal does not add history entries');
  }
  rows.push({engine,destination,run,...data});writeFileSync('docs/qa/navigation-hydration/after/history-details.json',JSON.stringify(rows,null,2));
 }
 const lifecycle=[],cdp=engine==='chrome'?await c.newCDPSession(p):null;
 for(let cycle=0;cycle<10;cycle++){
  await p.evaluate(()=>window.__motionAudit.lenis.scrollTo('#home'));await p.goBack();await p.waitForTimeout(180);
  await p.evaluate(()=>window.__motionAudit.lenis.scrollTo('#contact'));await p.goForward();await p.waitForTimeout(180);
  if(cdp)await cdp.send('HeapProfiler.collectGarbage');
  lifecycle.push({cycle,triggers:await p.evaluate(()=>window.__motionAudit.ScrollTrigger.getAll().length),dom:cdp?await cdp.send('Memory.getDOMCounters'):null});
 }
 assert.ok(lifecycle.every(x=>x.triggers===41));if(cdp)assert.equal(new Set(lifecycle.map(x=>x.dom.jsEventListeners)).size,1,'controller replacement has bounded listeners');
 writeFileSync(`docs/qa/navigation-hydration/after/history-lifecycle-${engine}.json`,JSON.stringify(lifecycle,null,2));
 await c.close();console.log(`PASS continuous pre-dispatch frames / event ordering / command counts / 20 same-document interruptions: ${engine}`);
 }finally{await b.close()}
}
