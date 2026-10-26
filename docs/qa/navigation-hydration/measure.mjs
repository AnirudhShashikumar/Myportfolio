import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import os from 'node:os';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const phase = process.env.PERF_PHASE || 'before';
const mode = process.env.PERF_MODE || 'loads';
const out = `docs/qa/navigation-hydration/${phase}`;
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:3001';
mkdirSync(out, { recursive: true });
const save = (name, data) => writeFileSync(`${out}/${name}.json`, JSON.stringify(data, null, 2) + '\n');
function instrument() {
  const stats = window.__perf = { tasks: [], lcp: [], shifts: [], events: [], contexts: [], draws: 0, clears: 0, allocations: {}, firstDraw: null };
  for (const [type, target] of [['longtask','tasks'], ['largest-contentful-paint','lcp'], ['layout-shift','shifts'], ['event','events']]) {
    try { new PerformanceObserver(list => list.getEntries().forEach(e => {
      if (type === 'event' && !e.interactionId) return;
      stats[target].push(type === 'longtask' ? { time:e.startTime, duration:e.duration } : type === 'largest-contentful-paint' ? { time:e.startTime, size:e.size, text:e.element?.textContent?.slice(0,100), tag:e.element?.tagName } : type === 'layout-shift' ? { time:e.startTime, value:e.value, recentInput:e.hadRecentInput } : { name:e.name, time:e.startTime, duration:e.duration, inputDelay:e.processingStart-e.startTime, processing:e.processingEnd-e.processingStart, interactionId:e.interactionId });
    })).observe({type, buffered:true, ...(type === 'event' ? {durationThreshold:16} : {})}); } catch {}
  }
  const seen = new WeakSet();
  const getContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function(type, ...args) {
    const started = performance.now();
    const result = getContext.call(this, type, ...args);
    if (result && /webgl/.test(type) && !seen.has(result)) {
      seen.add(result); stats.contexts.push({type, start:started, end:performance.now(), attached:this.isConnected});
    }
    return result;
  };
  for (const proto of [window.WebGLRenderingContext?.prototype, window.WebGL2RenderingContext?.prototype]) {
    if (!proto) continue;
    for (const name of ['drawArrays','drawElements','createBuffer','deleteBuffer','createTexture','deleteTexture','createProgram','deleteProgram','createShader','deleteShader','bufferData']) {
      const original = proto[name];
      proto[name] = function(...args) {
        if (name.startsWith('draw')) {stats.draws++; stats.firstDraw ??= performance.now();}
        else { stats.allocations[name] = (stats.allocations[name] || 0) + 1; if(name === 'bufferData') stats.allocations.bufferUploadBytes = (stats.allocations.bufferUploadBytes || 0) + (typeof args[1] === 'number' ? args[1] : args[1]?.byteLength || 0); }
        return original.apply(this,args);
      };
    }
  }
  const clear = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function(...args) { stats.clears++; return clear.apply(this,args); };
}
const profiles = [
  {name:'desktop-home', width:1440,height:900},
  {name:'mobile-home', width:390,height:844,mobile:true,throttle:true},
  {name:'desktop-about', width:1440,height:900,hash:'#about'},
  {name:'desktop-reduced', width:1440,height:900,reduced:true},
  {name:'desktop-no-webgl', width:1440,height:900,noWebgl:true},
];
const browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const environment = {browser:browser.version(),node:process.version,platform:os.platform(),arch:os.arch(),cpu:os.cpus()[0].model,phase,mode,base,observation:'six seconds after load; new browser context; browser cache disabled; warm server/filesystem/image cache',mobilePolicy:{cpuRate:4,latency:150,downloadBytesPerSecond:200000,uploadBytesPerSecond:93750}};
save('environment-'+mode,environment);
async function open(profile, coverage=false) {
  const context = await browser.newContext({viewport:{width:profile.width,height:profile.height},isMobile:!!profile.mobile,hasTouch:!!profile.mobile,reducedMotion:profile.reduced?'reduce':'no-preference'});
  await context.addInitScript(instrument);
  if(profile.noWebgl) await context.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type,...args) { return /webgl/.test(type) ? null : original.call(this,type,...args); };
  });
  const page = await context.newPage(); const cdp = await context.newCDPSession(page);
  const errors=[],warnings=[],network=[],parsed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(['warning','error'].includes(m.type()))warnings.push({type:m.type(),text:m.text()})});
  page.on('requestfailed',r=>errors.push(`${r.url()}: ${r.failure()?.errorText}`));
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  await cdp.send('Performance.enable');
  const requests=new Map();
  cdp.on('Network.requestWillBeSent',e=>requests.set(e.requestId,{url:e.request.url,type:e.type,start:e.timestamp,initiator:e.initiator.type}));
  cdp.on('Network.responseReceived',e=>Object.assign(requests.get(e.requestId)||{},{status:e.response.status,mime:e.response.mimeType,encoding:e.response.headers['Content-Encoding']||e.response.headers['content-encoding']||'identity',response:e.timestamp}));
  cdp.on('Network.loadingFinished',e=>{const entry=requests.get(e.requestId);if(entry)network.push({...entry,end:e.timestamp,wireBytes:e.encodedDataLength})});
  if(profile.throttle){await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750})}
  if(coverage){await cdp.send('Debugger.enable');cdp.on('Debugger.scriptParsed',e=>parsed.push({url:e.url,length:e.length,scriptId:e.scriptId}));await cdp.send('Profiler.enable');await cdp.send('Profiler.startPreciseCoverage',{callCount:false,detailed:true});await cdp.send('Tracing.start',{categories:'devtools.timeline,v8,blink.user_timing,disabled-by-default-devtools.timeline,disabled-by-default-v8.compile',transferMode:'ReturnAsStream'})}
  await page.goto(`${base}/?motion-audit=1${profile.hash||''}`,{waitUntil:'load'});
  await page.waitForTimeout(6000);
  return {context,page,cdp,errors,warnings,network,parsed};
}
async function snapshot(run) {
  const data = await run.page.evaluate(()=>({metrics:window.__perf,navigation:performance.getEntriesByType('navigation')[0].toJSON(),resources:performance.getEntriesByType('resource').map(e=>({url:e.name,type:e.initiatorType,start:e.startTime,end:e.responseEnd,duration:e.duration,encodedBodyBytes:e.encodedBodySize,decodedBodyBytes:e.decodedBodySize,transferBytes:e.transferSize})),fonts:document.fonts.status,canvases:document.querySelectorAll('canvas').length,heroActive:document.querySelector('#home')?.dataset.sceneActive}));
  return {...data,cdpMetrics:Object.fromEntries((await run.cdp.send('Performance.getMetrics')).metrics.map(e=>[e.name,e.value])),heap:await run.cdp.send('Runtime.getHeapUsage'),dom:await run.cdp.send('Memory.getDOMCounters'),errors:run.errors,warnings:run.warnings,network:run.network};
}
try {
  if(['loads','diagnostic','capability'].includes(mode)) {
    const results=[];
    for(const profile of (mode === 'diagnostic' ? [...profiles.slice(0,2),profiles.at(-1)] : mode === 'capability' ? [profiles.at(-1)] : profiles.slice(0,4))) for(let iteration=0;iteration<(mode==='diagnostic'?1:3);iteration++) {
      const run=await open(profile,mode==='diagnostic');
      const data=await snapshot(run);
      if(mode==='diagnostic') {
        const coverage=await run.cdp.send('Profiler.takePreciseCoverage');
        save(`${profile.name}-coverage`,{parsedScripts:run.parsed,coverage:coverage.result});
        const completed=new Promise(resolve=>run.cdp.once('Tracing.tracingComplete',resolve));
        await run.cdp.send('Tracing.end'); const {stream}=await completed;
        let trace='';while(true){const chunk=await run.cdp.send('IO.read',{handle:stream});trace+=chunk.base64Encoded?Buffer.from(chunk.data,'base64').toString():chunk.data;if(chunk.eof)break;}await run.cdp.send('IO.close',{handle:stream});
        writeFileSync(`${out}/${profile.name}-trace.json.gz`,gzipSync(trace));
        const events=JSON.parse(trace).traceEvents;
        const main=events.find(e=>e.name==='thread_name'&&e.args?.name==='CrRendererMain');
        const relevant=events.filter(e=>e.ph==='X'&&e.tid===main?.tid&&e.pid===main?.pid);
        save(`${profile.name}-trace-summary`,{mainThread:main,events:relevant.filter(e=>e.dur>=50000||/EvaluateScript|CompileScript|v8.compile|FunctionCall/.test(e.name)).map(e=>({name:e.name,startMicroseconds:e.ts,durationMilliseconds:e.dur/1000,args:e.args})),eventTotals:Object.fromEntries([...new Set(relevant.map(e=>e.name))].map(name=>[name,relevant.filter(e=>e.name===name).reduce((sum,e)=>sum+e.dur/1000,0)]))});
      }
      results.push({profile:profile.name,iteration,...data});save(mode,results);
      console.log(`${phase} ${profile.name} ${iteration}: LCP ${data.metrics.lcp.at(-1)?.time.toFixed(0)}ms, tasks ${data.metrics.tasks.length}, first draw ${data.metrics.firstDraw?.toFixed(0)}ms, JS body ${data.resources.filter(e=>e.type==='script').reduce((s,e)=>s+e.encodedBodyBytes,0)}`);
      await run.context.close();
    }
  }
  if(mode === 'lifecycle') {
    const run=await open(profiles[0]); const {page,cdp}=run; const result={activity:[],scroll:[],memory:[],wheel:[],events:[],errors:run.errors};
    async function jump(selector,fraction=.1){await page.locator(selector).evaluate((el,f)=>{scrollTo({top:el.getBoundingClientRect().top+scrollY+Math.max(0,el.offsetHeight-innerHeight)*f,behavior:'instant'});window.__motionAudit.ScrollTrigger.update()},fraction);await page.waitForTimeout(500)}
    for(const region of ['#home','#work','#about','#contact']){await jump(region);const a=await page.evaluate(()=>structuredClone(window.__perf));await page.waitForTimeout(1000);const b=await page.evaluate(()=>structuredClone(window.__perf));result.activity.push({region,windowMs:1000,draws:b.draws-a.draws,clears:b.clears-a.clears,allocations:b.allocations})}
    for(const region of ['#home',"[data-work-project='0']","[data-work-project='2']",'#about','#contact']){await jump(region,0);result.scroll.push({region,...await page.locator(region).evaluate(async el=>{const top=el.getBoundingClientRect().top+scrollY,travel=Math.max(1,el.offsetHeight-innerHeight),intervals=[];let last;const start=performance.now();await new Promise(resolve=>{let n=0;function tick(now){if(last)intervals.push(now-last);last=now;const f=n/180,p=f<.6?f/.6:1-(f-.6)/.4;scrollTo({top:top+travel*p,behavior:'instant'});window.__motionAudit.ScrollTrigger.update();if(++n<=180)requestAnimationFrame(tick);else resolve()}requestAnimationFrame(tick)});intervals.sort((a,b)=>a-b);return {count:intervals.length,median:intervals[Math.floor(intervals.length*.5)],p95:intervals[Math.floor(intervals.length*.95)],max:intervals.at(-1),over33:intervals.filter(e=>e>33.34).length,tasks:window.__perf.tasks.filter(e=>e.time>=start)}})});}
    for(const region of ['#home','#work','#about','#contact']){await jump(region);await page.evaluate(()=>{window.__wheel=null;window.addEventListener('scroll',()=>window.__wheel={time:performance.now(),y:scrollY},{once:true})});const start=await page.evaluate(()=>({time:performance.now(),y:scrollY}));await page.mouse.wheel(0,120);await page.waitForTimeout(400);result.wheel.push({region,start,firstScroll:await page.evaluate(()=>window.__wheel),settledY:await page.evaluate(()=>scrollY)})}
    for(let cycle=0;cycle<5;cycle++){for(const region of ['#home','#work','#about','#contact'])await jump(region);await cdp.send('HeapProfiler.collectGarbage');result.memory.push({cycle,heap:await cdp.send('Runtime.getHeapUsage'),dom:await cdp.send('Memory.getDOMCounters'),triggers:await page.evaluate(()=>window.__motionAudit.ScrollTrigger.getAll().length),allocations:await page.evaluate(()=>window.__perf.allocations)})}
    await page.goto(`${base}/?motion-audit=1#about`);await page.waitForTimeout(1800);await page.getByRole('button',{name:'Read without motion',exact:true}).click();await page.waitForTimeout(500);result.events=await page.evaluate(()=>window.__perf.events);result.final=await snapshot(run);save('lifecycle',result);await run.context.close();console.log(`${phase} lifecycle complete`);
  }
} finally {await browser.close()}
