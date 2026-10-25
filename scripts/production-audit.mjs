import { createRequire } from "node:module";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";

const require = createRequire(import.meta.url);
const { chromium, firefox, webkit } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const base = process.env.PORTFOLIO_QA_URL || "http://127.0.0.1:3000";
const out = "docs/qa/production";
const mode = process.env.AUDIT_MODE || "matrix";
const axePath = process.env.AXE_MODULE || "/private/tmp/portfolio-audit-tools/node_modules/axe-core/axe.min.js";
mkdirSync(out, { recursive: true });
const write = (name, value) => writeFileSync(`${out}/${name}.json`, JSON.stringify(value, null, 2) + "\n");
const launch = (engine = "chrome") => engine === "chrome"
  ? chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" })
  : ({ firefox, webkit })[engine].launch({ headless: true });

function instrumentation() {
  window.__audit = { lcp: [], shifts: [], tasks: [], events: [], draws: 0, clears: 0 };
  const observe = (type, callback, options = {}) => {
    try { new PerformanceObserver(list => list.getEntries().forEach(callback)).observe({ type, buffered: true, ...options }); } catch { /* Engine may not support this metric. */ }
  };
  observe("largest-contentful-paint", e => window.__audit.lcp.push({ time: e.startTime, size: e.size, tag: e.element?.tagName, text: e.element?.textContent?.slice(0, 100), url: e.url }));
  observe("layout-shift", e => window.__audit.shifts.push({ time: e.startTime, value: e.value, recentInput: e.hadRecentInput, sources: e.sources.map(s => ({ tag: s.node?.tagName, text: s.node?.textContent?.slice(0, 80) })) }));
  observe("longtask", e => window.__audit.tasks.push({ time: e.startTime, duration: e.duration }));
  observe("event", e => { if (e.interactionId) window.__audit.events.push({ name: e.name, duration: e.duration, inputDelay: e.processingStart - e.startTime, interactionId: e.interactionId }); }, { durationThreshold: 16 });
  for (const prototype of [window.WebGLRenderingContext?.prototype, window.WebGL2RenderingContext?.prototype]) {
    if (!prototype) continue;
    for (const method of ["drawArrays", "drawElements"]) {
      const original = prototype[method];
      prototype[method] = function (...args) { window.__audit.draws++; return original.apply(this, args); };
    }
  }
  const original = CanvasRenderingContext2D.prototype.clearRect;
  CanvasRenderingContext2D.prototype.clearRect = function (...args) { window.__audit.clears++; return original.apply(this, args); };
}

async function open(browser, options = {}, hash = "") {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...options });
  await context.addInitScript(instrumentation);
  const page = await context.newPage();
  const errors = [], warnings = [], failed = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", e => { if (["warning", "error"].includes(e.type())) warnings.push({ type: e.type(), text: e.text() }); });
  page.on("requestfailed", r => failed.push({ url: r.url(), error: r.failure()?.errorText }));
  await page.goto(`${base}/?motion-audit=1${hash}`, { waitUntil: "load" });
  await page.waitForFunction(() => window.__motionAudit && document.querySelector("#about")?.dataset.cinematic);
  await page.waitForTimeout(1400);
  return { context, page, errors, warnings, failed };
}

async function jump(page, y) {
  await page.evaluate(y => {
    scrollTo({ top: y, behavior: "instant" });
    window.__motionAudit.ScrollTrigger.update();
  }, y);
  await page.evaluate(() => new Promise(resolve => {
    const timer = setTimeout(resolve, 250);
    requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(timer); resolve(); }));
  }));
}

async function scan(page) {
  return page.evaluate(() => {
    const header = document.querySelector("[data-site-header]").getBoundingClientRect();
    const shown = el => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || rect.bottom <= 0 || rect.top >= innerHeight) return false;
      for (let node = el; node; node = node.parentElement) {
        const css = getComputedStyle(node);
        if (css.visibility === "hidden" || css.display === "none" || +css.opacity < .9 || css.clipPath === "inset(50%)") return false;
      }
      return true;
    };
    const horizontal = [], headerOverlap = [], visibleText = [];
    for (const el of document.querySelectorAll("main h1,main h2,main h3,main h4,main p,main li,main figcaption,main a,main button,main dt,main dd")) {
      if (!shown(el) || el.classList.contains("sr-only")) continue;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const rects = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.textContent.trim() || node.parentElement.closest('.sr-only')) continue;
        const range = document.createRange(); range.selectNodeContents(node);
        rects.push(range.getBoundingClientRect());
      }
      if (!rects.length) continue;
      const rect = { left: Math.min(...rects.map(r=>r.left)), right: Math.max(...rects.map(r=>r.right)), top: Math.min(...rects.map(r=>r.top)), bottom: Math.max(...rects.map(r=>r.bottom)), width: Math.max(...rects.map(r=>r.width)), height: Math.max(...rects.map(r=>r.height)) };
      if (rect.width < 2 || rect.height < 2) continue;
      const text = el.textContent.trim().replace(/\s+/g, " ").slice(0, 120);
      if (!text) continue;
      visibleText.push(text);
      if (rect.left < -1 || rect.right > innerWidth + 1) horizontal.push({ tag: el.tagName, text, left: rect.left, right: rect.right });
      if (rect.top >= 0 && rect.top < header.bottom - 2 && rect.bottom > 0) headerOverlap.push({ tag: el.tagName, text, top: rect.top, bottom: rect.bottom });
    }
    const triggers = window.__motionAudit.ScrollTrigger.getAll();
    return {
      y: scrollY, height: document.documentElement.scrollHeight,
      overflow: document.documentElement.scrollWidth - innerWidth,
      visibleText: visibleText.slice(0, 40), horizontal, headerOverlap,
      mismatches: triggers.filter(t => t.isActive && t.vars.scrub === true && t.animation && Math.abs(t.progress - t.animation.totalProgress()) > .01).map(t => ({ id: t.vars.id, progress: t.progress, visual: t.animation.totalProgress() })),
      triggerCount: triggers.length, activeTriggers: triggers.filter(t => t.isActive).length,
      cue: document.querySelector("[data-scroll-discovery]").dataset.state,
      aboutMode: document.querySelector("#about").dataset.cinematic,
    };
  });
}

async function ax(page) {
  await page.addScriptTag({ path: axePath });
  return page.evaluate(async () => {
    const result = await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } });
    return { violations: result.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, helpUrl: v.helpUrl, nodes: v.nodes.map(n => ({ target: n.target, html: n.html, summary: n.failureSummary })) })), incomplete: result.incomplete.map(v => ({ id: v.id, count: v.nodes.length })), passes: result.passes.length };
  });
}

if (mode === "matrix") {
  const engine = process.env.AUDIT_ENGINE || "chrome";
  const browser = await launch(engine);
  const sizes = engine === "chrome" ? [[360,800],[390,844],[430,932],[768,1024],[1280,720],[1280,800],[1440,900],[1728,1117]] : [[390,844],[1280,720],[1440,900]];
  const result = { engine, browserVersion: browser.version(), platform: os.platform(), arch: os.arch(), viewports: [] };
  try {
    for (const [width, height] of sizes) {
      const run = await open(browser, { viewport: { width, height }, hasTouch: width < 768, ...(engine !== "firefox" ? { isMobile: width < 768 } : {}) });
      const { page, context } = run;
      await page.waitForTimeout(1600);
      const viewport = { width, height, samples: [], errors: run.errors, warnings: run.warnings, failed: run.failed };
      const regions = ["#home", ...Array.from({ length: 6 }, (_, i) => `[data-work-project="${i}"]`), "#about", "#contact"];
      for (let ri = 0; ri < regions.length; ri++) {
        const region = regions[ri];
        if (process.env.AUDIT_VERBOSE) console.log(`${engine} ${width}x${height} ${region}`);
        const plan = await page.locator(region).evaluate(root => {
          const top = root.getBoundingClientRect().top + scrollY;
          const st = window.__motionAudit.ScrollTrigger;
          const owned = st.getAll().filter(t => t.trigger && (root === t.trigger || root.contains(t.trigger)) && t.animation);
          const points = [top, top + Math.max(0, root.offsetHeight - innerHeight) * .5, top + Math.max(0, root.offsetHeight - innerHeight) * .95];
          for (const t of owned) points.push(t.start + (t.end - t.start) * .8, t.end);
          for (const el of root.querySelectorAll("h3, [data-about-reading]")) {
            if (el.getBoundingClientRect().width > 2) points.push(el.getBoundingClientRect().top + scrollY - 150);
          }
          return [...new Set(points.map(y => Math.round(Math.min(Math.max(0,y), document.documentElement.scrollHeight-innerHeight))))].sort((a,b) => a-b).filter((y,i,a) => !i || y-a[i-1] > 40);
        });
        for (let pi = 0; pi < plan.length; pi++) {
          await jump(page, plan[pi]);
          if (ri === 7 && await page.locator("#about").getAttribute("data-cinematic") === "false") await page.waitForTimeout(600);
          const snapshot = { region, sample: pi, ...(await scan(page)) };
          viewport.samples.push(snapshot);
          if (pi === Math.floor(plan.length / 2)) {
            const name = `${engine}-${width}x${height}-region-${ri}.jpg`;
            await page.screenshot({ path: `${out}/${name}`, type: "jpeg", quality: 78 });
            snapshot.screenshot = name;
          }
        }
      }
      const handoffs = await page.evaluate(() => [...document.querySelectorAll("[data-work-handoff]")].map(el => ({ label: el.dataset.workHandoff, top: el.getBoundingClientRect().top + scrollY, travel: el.offsetHeight - innerHeight })));
      for (const handoff of handoffs) for (const fraction of [0,.49,.51,1,.51,0]) {
        await jump(page, handoff.top + Math.max(0,handoff.travel) * fraction);
        viewport.samples.push({ region: `handoff-${handoff.label}`, fraction, ...(await scan(page)) });
      }
      await jump(page, 0);
      await page.screenshot({ path: `${out}/${engine}-${width}x${height}-hero.jpg`, type: "jpeg", quality: 78 });
      viewport.accessibility = await ax(page);
      viewport.images = await page.evaluate(() => [...document.images].map(img => ({ src: img.getAttribute("src"), currentSrc: img.currentSrc, complete: img.complete, naturalWidth: img.naturalWidth, loading: img.loading, alt: img.alt })));
      result.viewports.push(viewport);
      write(`matrix-${engine}`, result);
      console.log(`${engine} ${width}x${height}: ${viewport.samples.length} samples; ${viewport.samples.filter(s => s.horizontal.length).length} horizontal candidates; ${viewport.accessibility.violations.length} axe rule failures; ${run.errors.length} errors`);
      await context.close();
    }
  } finally { await browser.close(); }
}

if (mode === "lifecycle") {
  const browser = await launch();
  const run = await open(browser);
  const { page, context } = run;
  const result = { errors: run.errors, warnings: run.warnings };
  try {
    await page.waitForTimeout(1600);
    result.initial = await scan(page);
    result.inventory = await page.evaluate(() => ({
      title: document.title, meta: [...document.head.querySelectorAll("meta,link[rel]")].map(el => el.outerHTML),
      headings: [...document.querySelectorAll("h1,h2,h3,h4")].map(el => ({ level: el.tagName, text: el.textContent.trim(), hidden: getComputedStyle(el).visibility === "hidden" })),
      links: [...document.links].map(a => ({ text: a.textContent.trim(), label: a.getAttribute("aria-label"), href: a.getAttribute("href"), target: a.target, rel: a.rel })),
      missingAlt: [...document.images].filter(img => !img.hasAttribute("alt")).length,
      duplicateIds: [...document.querySelectorAll("[id]")].map(el => el.id).filter((id,i,a) => a.indexOf(id) !== i),
    }));
    const cdp = await context.newCDPSession(page);
    const headings = async () => (await cdp.send("Accessibility.getFullAXTree")).nodes.filter(n => n.role?.value === "heading").map(n => n.name?.value);
    result.initialAXHeadings = await headings();
    result.keyboard = [];
    await jump(page, 0);
    for (let i=0;i<22;i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(80);
      result.keyboard.push(await page.evaluate(() => {
        const el=document.activeElement,r=el.getBoundingClientRect(),css=getComputedStyle(el);
        let opacity=1;for(let node=el;node;node=node.parentElement)opacity*=+getComputedStyle(node).opacity;
        return {tag:el.tagName,text:el.textContent.trim().slice(0,100),href:el.getAttribute("href"),y:scrollY,rect:{top:r.top,bottom:r.bottom,left:r.left,right:r.right},opacity,visibility:css.visibility,outline:css.outline,hit:document.elementFromPoint(Math.max(0,Math.min(innerWidth-1,r.left+r.width/2)),Math.max(0,Math.min(innerHeight-1,r.top+r.height/2)))?.closest("a,button")===el};
      }));
    }
    await page.goto(`${base}/?motion-audit=1#about`);
    await page.waitForTimeout(1800);
    await page.getByRole("button", { name: "Read without motion" }).click();
    await page.waitForTimeout(650);
    result.reader = { mode: await page.locator("#about").getAttribute("data-cinematic"), focus: await page.evaluate(() => document.activeElement.id), accessibility: await ax(page) };
    await page.getByRole("button", { name: "Return to motion" }).click();
    await page.waitForTimeout(300);
    result.reader.returnMode = await page.locator("#about").getAttribute("data-cinematic");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.waitForTimeout(500);
    result.reduced = { snapshot: await scan(page), headings: await headings(), accessibility: await ax(page), animations: await page.evaluate(() => document.getAnimations().filter(a=>a.playState==="running").length) };
    await page.screenshot({ path: `${out}/reduced-about.jpg`, type:"jpeg",quality:80 });
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.setViewportSize({ width:1440,height:900 });
    await page.waitForTimeout(500);
    const initialCount = await page.evaluate(() => window.__motionAudit.ScrollTrigger.getAll().length);
    result.resizeCounts = [initialCount];
    for(let i=0;i<4;i++){
      await page.setViewportSize({width:390,height:844});await page.waitForTimeout(250);
      await page.setViewportSize({width:1440,height:900});await page.waitForTimeout(500);
      result.resizeCounts.push(await page.evaluate(()=>window.__motionAudit.ScrollTrigger.getAll().length));
    }
    result.nativeInput=[];
    await jump(page,0);
    for(const delta of [24,24,120,600,-120,-600]){
      const before=await page.evaluate(()=>scrollY);await page.mouse.wheel(0,delta);await page.waitForTimeout(300);
      result.nativeInput.push({delta,before,after:await page.evaluate(()=>scrollY)});
    }
    result.direct=[];
    for(const hash of ["work","about","contact","lab"]){
      await page.goto(`${base}/?motion-audit=1#${hash}`);await page.waitForTimeout(1800);
      result.direct.push({hash,url:page.url(),snapshot:await scan(page)});
    }
    result.memory=[];
    for(let cycle=0;cycle<5;cycle++){
      for(const region of ["#home","#work","#about","#contact"]){const y=await page.locator(region).evaluate(el=>el.getBoundingClientRect().top+scrollY);await jump(page,y+100);}
      await cdp.send("HeapProfiler.collectGarbage");
      result.memory.push({cycle,heap:await cdp.send("Runtime.getHeapUsage"),dom:await cdp.send("Memory.getDOMCounters"),triggers:await page.evaluate(()=>window.__motionAudit.ScrollTrigger.getAll().length)});
    }
    write("lifecycle",result);
    console.log("Lifecycle audit saved");
  } finally { await browser.close(); }
}

if(mode==="targeted"){
  const browser=await launch();const result={viewports:[],contrast:[],errors:[]};
  try{
    for(const [width,height]of [[390,844],[430,932],[768,1024],[1280,800],[1440,900]]){
      const run=await open(browser,{viewport:{width,height},isMobile:width<768,hasTouch:width<768});
      const {page,context}=run;const shots=[];
      for(const fraction of [.8,.95,1]){
        const y=await page.locator('#home').evaluate((el,p)=>(el.offsetHeight-innerHeight)*p,fraction);
        await jump(page,y);const screenshot=`target-${width}x${height}-hero-${fraction}.jpg`;
        await page.screenshot({path:`${out}/${screenshot}`,type:'jpeg',quality:85});shots.push({fraction,screenshot,...await scan(page)});
      }
      await page.locator('[href="/projects/algaeos/algaeos-system-infographic.jpg"]').evaluate(el=>el.scrollIntoView({behavior:'instant',block:'center'}));
      await page.waitForTimeout(100);shots.push({region:'algae-artifact',...await scan(page)});
      await page.screenshot({path:`${out}/target-${width}x${height}-algae.jpg`,type:'jpeg',quality:85});
      if(width===1440||width===390){
        for(const region of ['#home',...Array.from({length:6},(_,i)=>`[data-work-project='${i}']`),'#contact']){
          const y=await page.locator(region).evaluate(el=>el.getBoundingClientRect().top+scrollY+Math.max(0,el.offsetHeight-innerHeight)*.7);
          await jump(page,y);await page.waitForTimeout(150);result.contrast.push({width,region,...await ax(page)});
        }
      }
      result.viewports.push({width,height,shots});result.errors.push(...run.errors);await context.close();
    }
    const run=await open(browser);await run.page.waitForTimeout(1600);
    const contact=run.page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:'Contact'});
    await contact.focus();await run.page.keyboard.press('Enter');await run.page.waitForTimeout(1500);
    result.contactFocus=[];
    for(let i=0;i<4;i++){
      await run.page.keyboard.press('Tab');result.contactFocus.push(await run.page.evaluate(()=>({text:document.activeElement.textContent.trim().slice(0,90),href:document.activeElement.getAttribute('href'),y:scrollY})));
    }
    result.contactInitialLinks=await run.page.evaluate(()=>[...document.querySelectorAll('#contact a')].map(el=>({href:el.getAttribute('href'),visibility:getComputedStyle(el.parentElement.parentElement).visibility})));
    await run.context.close();write('targeted',result);
  }finally{await browser.close();}
}

if (mode === "performance" || mode === "performance-scroll") {
  const browser = await launch();
  const results = mode === "performance-scroll" ? JSON.parse(readFileSync(`${out}/performance.json`, "utf8")) : { environment:{browser:browser.version(),platform:os.platform(),arch:os.arch(),node:process.version,cpu:os.cpus()[0].model},loads:[],scroll:[],activity:[] };
  results.scroll=[];results.activity=[];
  try {
    for(const profile of mode === "performance-scroll" ? [] : ["desktop-local","mobile-throttled"]){
      for(let iteration=0;iteration<3;iteration++){
        const context=await browser.newContext({viewport:profile.startsWith("mobile")?{width:390,height:844}:{width:1440,height:900},hasTouch:profile.startsWith("mobile"),isMobile:profile.startsWith("mobile")});
        await context.addInitScript(instrumentation);const page=await context.newPage();const cdp=await context.newCDPSession(page);
        await cdp.send("Network.enable");await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
        if(profile.startsWith("mobile")){
          await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
          await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
        }
        await page.goto(`${base}/?motion-audit=1`,{waitUntil:"load"});await page.waitForTimeout(6000);
        const load=await page.evaluate(()=>({metrics:window.__audit,navigation:performance.getEntriesByType("navigation")[0].toJSON(),resources:performance.getEntriesByType("resource").map(r=>({name:r.name,type:r.initiatorType,duration:r.duration,encoded:r.encodedBodySize,decoded:r.decodedBodySize,transfer:r.transferSize})),fonts:document.fonts.status,images:[...document.images].filter(i=>i.currentSrc).map(i=>({src:i.currentSrc,complete:i.complete,width:i.naturalWidth}))}));
        results.loads.push({profile,iteration,...load});write("performance",results);console.log(`${profile} ${iteration}: LCP ${load.metrics.lcp.at(-1)?.time?.toFixed(0)}ms; CLS ${load.metrics.shifts.filter(s=>!s.recentInput).reduce((n,s)=>n+s.value,0).toFixed(4)}`);
        await context.close();
      }
    }
    const run=await open(browser);const {page,context}=run;await page.waitForTimeout(1600);
    for(const region of ["#home","[data-work-project='0']","[data-work-project='2']","#about","#contact"]){
      const interval=await page.locator(region).evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,travel:Math.max(1,el.offsetHeight-innerHeight)}));
      await jump(page,interval.top);await page.waitForTimeout(500);
      const frames=await page.evaluate(async ({top,travel})=>{
        const start=performance.now(),times=[];let last;
        await new Promise(resolve=>{let n=0;function frame(now){if(last)times.push(now-last);last=now;const f=n/180,p=f<.6?f/.6:1-(f-.6)/.4;scrollTo({top:top+p*travel,behavior:"instant"});window.__motionAudit.ScrollTrigger.update();if(++n<=180)requestAnimationFrame(frame);else resolve();}requestAnimationFrame(frame)});
        times.sort((a,b)=>a-b);return {count:times.length,median:times[Math.floor(times.length*.5)],p95:times[Math.floor(times.length*.95)],max:times.at(-1),over33:times.filter(t=>t>33.34).length,tasks:window.__audit.tasks.filter(t=>t.time>=start)};
      },interval);
      results.scroll.push({region,...frames});
    }
    for(const region of ["#home","#work","#about","#contact"]){
      const y=await page.locator(region).evaluate(el=>el.getBoundingClientRect().top+scrollY);await jump(page,y+100);await page.waitForTimeout(500);
      const before=await page.evaluate(()=>({draws:window.__audit.draws,clears:window.__audit.clears}));await page.waitForTimeout(1000);
      const after=await page.evaluate(()=>({draws:window.__audit.draws,clears:window.__audit.clears,active:document.querySelector("#home").dataset.sceneActive}));
      results.activity.push({region,milliseconds:1000,draws:after.draws-before.draws,gridClears:after.clears-before.clears,heroActive:after.active});
    }
    results.extended=await page.evaluate(()=>({shifts:window.__audit.shifts,tasks:window.__audit.tasks}));
    await page.goto(`${base}/?motion-audit=1#about`);await page.waitForTimeout(1700);
    await page.getByRole("button",{name:"Read without motion"}).click();await page.waitForTimeout(500);
    results.interactions=await page.evaluate(()=>window.__audit.events);
    results.interactionPageShifts=await page.evaluate(()=>window.__audit.shifts);
    write("performance",results);await context.close();
  }finally{await browser.close();}
}

if(mode==="extra"){
  const result={reverse:[],wheel:[],webkit:[],errors:[]};
  const browser=await launch();
  try{
    const run=await open(browser);const {page,context}=run;
    for(let i=0;i<6;i++){
      const region=`[data-work-project='${i}']`;
      const range=await page.locator(region).evaluate(el=>({top:el.getBoundingClientRect().top+scrollY,travel:Math.max(1,el.offsetHeight-innerHeight)}));
      const signature=()=>page.locator(region).evaluate(el=>[...el.querySelectorAll('[style]')].map(n=>({transform:n.style.transform,opacity:n.style.opacity,visibility:n.style.visibility,clip:n.style.clipPath,d:n.getAttribute('d')})));
      await jump(page,range.top+range.travel*.6);const before=await signature();
      await jump(page,range.top+range.travel*.95);await jump(page,range.top+range.travel*.6);const after=await signature();
      result.reverse.push({project:i,equal:JSON.stringify(before)===JSON.stringify(after),elements:before.length,snapshot:await scan(page)});
    }
    for(const region of ['#home','#work','#about','#contact']){
      const y=await page.locator(region).evaluate(el=>el.getBoundingClientRect().top+scrollY+100);await jump(page,y);await page.waitForTimeout(300);
      await page.evaluate(()=>{
        window.__wheelAudit={before:scrollY};
        window.addEventListener('wheel',()=>{window.__wheelAudit.wheel=performance.now()},{passive:true,once:true});
        window.addEventListener('scroll',()=>{window.__wheelAudit.scroll=performance.now()},{passive:true,once:true});
      });
      await page.mouse.wheel(0,120);await page.waitForTimeout(400);
      result.wheel.push({region,...await page.evaluate(()=>({...window.__wheelAudit,after:scrollY}))});
    }
    await context.close();
    const fallback=await browser.newContext();await fallback.addInitScript(()=>{
      const original=HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind==='webgl'||kind==='webgl2'?null:original.call(this,kind,...args)};
    });
    const fallbackPage=await fallback.newPage();fallbackPage.on('pageerror',e=>result.errors.push(e.message));await fallbackPage.goto(base);await fallbackPage.waitForTimeout(3200);
    result.noWebGL=await fallbackPage.evaluate(()=>({title:document.querySelector('h1').textContent,heroState:document.querySelector('#home').dataset.introState,navLinks:document.querySelectorAll('nav a').length,canvases:document.querySelectorAll('canvas').length}));
    await fallbackPage.screenshot({path:`${out}/no-webgl.jpg`,type:'jpeg',quality:80});await fallback.close();
  }finally{await browser.close();}
  const wk=await launch('webkit');
  try{
    const run=await open(wk);const {page}=run;
    for(const hash of ['work','about','contact']){
      await page.goto(`${base}/?motion-audit=1#${hash}`);await page.waitForTimeout(1600);result.webkit.push({hash,snapshot:await scan(page)});
    }
    await page.goto(`${base}/?motion-audit=1#about`);await page.waitForTimeout(1600);await page.getByRole('button',{name:'Read without motion'}).click();await page.waitForTimeout(500);
    result.webkitReader=await page.locator('#about').getAttribute('data-cinematic');
    await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(500);result.webkitReduced=await scan(page);result.errors.push(...run.errors);
    await run.context.close();
  }finally{await wk.close();}
  write('extra',result);console.log('Reverse, input latency, WebGL fallback and WebKit navigation audit saved');
}

if(mode==="zoom"){
  const browser=await launch();const results=[];
  try{
    for(const [width,height,label]of [[720,450,"200%-equivalent"],[360,225,"400%-equivalent"]]){
      const run=await open(browser,{viewport:{width,height}});
      const samples=[];
      for(const region of ["#home",...Array.from({length:6},(_,i)=>`[data-work-project='${i}']`),"#about","#contact"]){
        const y=await run.page.locator(region).evaluate(el=>el.getBoundingClientRect().top+scrollY+Math.max(0,el.offsetHeight-innerHeight)*.4);
        await jump(run.page,y);await run.page.waitForTimeout(600);samples.push({region,...await scan(run.page)});
        await run.page.screenshot({path:`${out}/zoom-${label}-${samples.length}.jpg`,type:"jpeg",quality:75});
      }
      results.push({label,method:"CSS viewport reduction from a 1440x900 browser; not browser UI zoom",width,height,samples,accessibility:await ax(run.page),errors:run.errors});
      await run.context.close();
    }
    const nojs=await browser.newContext({javaScriptEnabled:false});const page=await nojs.newPage();await page.goto(base);
    const disabled=await page.evaluate(()=>({headings:[...document.querySelectorAll("h1,h2,h3")].map(el=>({text:el.textContent,visibility:getComputedStyle(el).visibility})),contactLinks:[...document.querySelectorAll("#contact a")].map(el=>{let visible=true;for(let n=el;n;n=n.parentElement){const s=getComputedStyle(n);if(s.visibility==="hidden"||s.display==="none")visible=false;}return {href:el.getAttribute("href"),visible};})}));
    write("zoom",{results,noJavaScript:disabled});await nojs.close();
  }finally{await browser.close();}
}
