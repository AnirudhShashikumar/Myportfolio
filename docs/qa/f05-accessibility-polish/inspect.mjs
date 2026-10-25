import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const phase=process.env.POLISH_PHASE || 'before';
const out=`docs/qa/f05-accessibility-polish/${phase}`;
mkdirSync(out,{recursive:true});
const result={phase,hero:[],dayflow:[],contact:[],errors:[],warnings:[]};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
async function open(options={}) {
 const context=await browser.newContext({viewport:{width:1440,height:900},...options});
 const page=await context.newPage();
 page.on('pageerror',e=>result.errors.push(e.message));
 page.on('console',m=>{if(['warning','error'].includes(m.type()))result.warnings.push(m.text())});
 await page.goto(`${process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:3000'}/?motion-audit=1`,{waitUntil:'load'});
 await page.waitForFunction(()=>window.__motionAudit);
 await page.waitForTimeout(2900);
 await page.addScriptTag({path:process.env.AXE_MODULE || '/private/tmp/portfolio-audit-tools/node_modules/axe-core/axe.min.js'});
 return {context,page};
}
async function jump(page,y){await page.evaluate(y=>{scrollTo({top:y,behavior:'instant'});window.__motionAudit.ScrollTrigger.update()},y);await page.waitForTimeout(50)}
async function contrast(page,selector){return page.evaluate(async selector=>{
 const r=await axe.run(document.querySelector(selector),{runOnly:{type:'rule',values:['color-contrast']}});
 const map=list=>list.flatMap(rule=>rule.nodes.map(n=>({target:n.target,html:n.html,summary:n.failureSummary,checks:[...n.any,...n.all,...n.none].map(c=>({id:c.id,data:c.data}))})));
 return {violations:map(r.violations),passes:map(r.passes),incomplete:map(r.incomplete)};
},selector)}
async function affected(page){return page.evaluate(()=>{
 const rows=[];
 function add(e,key){let opacity=1;for(let n=e;n;n=n.parentElement)opacity*=+getComputedStyle(n).opacity;const r=e.getBoundingClientRect(),c=getComputedStyle(e);rows.push({key,text:[...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' ').trim()||e.textContent.trim(),color:c.color,opacity,font:c.fontSize,background:c.backgroundColor,top:r.top,bottom:r.bottom})}
 document.querySelectorAll('[data-df-architecture-node]').forEach((n,i)=>[...n.children].filter(e=>!e.hasAttribute('aria-hidden')).forEach((e,j)=>add(e,`architecture.${i+1}.${['number','title','detail'][j]}`)));
 document.querySelectorAll('[data-df-transaction-node]').forEach((n,i)=>{add(n,`transaction.${i+1}.label`);add(n.firstElementChild,`transaction.${i+1}.number`)});
 return rows;
})}
try {
 for(const [width,height] of [[360,800],[390,844],[430,932],[768,1024],[1280,720],[1280,800],[1440,900],[1728,1117],[391,844],[600,932],[767,1024]]){
  const {context,page}=await open({viewport:{width,height},hasTouch:width<768,isMobile:width<768});
  const range=await page.evaluate(()=>{const t=window.__motionAudit.ScrollTrigger.getAll().find(t=>t.trigger?.id==='home'&&t.animation);return {start:t.start,end:t.end}});
  const states=[];
  for(const p of [0,.15,.3,.45,.58,.62,.64,.66,.68,.7,.72,.75,.78,.8,.805,.815,.825,.85,.875,.9,.925,.935,.95,.96,.975,1,.95,.8,.7]){
   await jump(page,range.start+(range.end-range.start)*p);
   const state=await page.evaluate(p=>{
    const elements=[...document.querySelectorAll('[data-name-word],[data-name-meta],[data-evidence-plane] figcaption')].map(e=>{
     let opacity=1,visible=true;for(let n=e;n;n=n.parentElement){const c=getComputedStyle(n);opacity*=+c.opacity;if(c.visibility==='hidden'||c.display==='none')visible=false}
     const range=document.createRange();range.selectNodeContents(e);const box=e.getBoundingClientRect();
     return {text:e.textContent,opacity,visible,font:getComputedStyle(e).fontSize,rect:{left:box.left,right:box.right,top:box.top,bottom:box.bottom},textRects:[...range.getClientRects()].filter(r=>r.width>.1).map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom})),parent:e.parentElement.getBoundingClientRect().toJSON()};
    });
    const clips=elements.filter(e=>e.visible&&e.opacity>.05&&e.textRects.some(r=>r.left<-.5||r.right>innerWidth+.5));
    const nameMasks=elements.filter(e=>['ANIRUDH','SHASHIKUMAR'].includes(e.text)&&e.visible&&e.opacity>.05&&e.textRects.some(r=>r.left<e.parent.left-.5||r.right>e.parent.right+.5));
    return {p,y:scrollY,overflow:document.documentElement.scrollWidth-innerWidth,elements,clips,nameMasks};
   },p);
   states.push(state);
   if([.8,.95].includes(p) && states.filter(s=>s.p===p).length===1)await page.screenshot({path:`${out}/hero-${width}x${height}-${p}.jpg`,type:'jpeg',quality:90});
   if(phase==='after'){assert.equal(state.overflow,0);assert.equal(state.clips.length,0,`${width}x${height} Hero ${p}: ${state.clips.map(x=>x.text)}`);assert.equal(state.nameMasks.length,0,'name glyphs fit their reveal masks')}
  }
  result.hero.push({width,height,states});
  await context.close();console.log(`Hero ${width}x${height}: ${states.filter(s=>s.clips.length).length} clipped states`);
 }
 const {context,page}=await open();
 result.initialContrast=await contrast(page,'main');
 for(const section of ['architecture','transaction']){
  const range=await page.evaluate(selector=>{const e=document.querySelector(selector);const t=window.__motionAudit.ScrollTrigger.getAll().find(t=>t.trigger===e);return {start:t.start,end:t.end}},`[data-df-${section}]`);
  for(const p of [0,.25,.5,.75,1,.5,0]){
   await jump(page,range.start+(range.end-range.start)*p);
   const state={section,p,nodes:await affected(page),contrast:await contrast(page,'[data-work-project="3"]')};
   if(phase==='after'){assert.equal(state.nodes.length,20);assert.ok(state.nodes.every(n=>n.opacity>=.75),'all twenty labels retain their readable opacity floor')}
   result.dayflow.push(state);
   if([0,.5,1].includes(p)&&result.dayflow.filter(s=>s.section===section&&s.p===p).length===1)await page.screenshot({path:`${out}/dayflow-${section}-${p}.jpg`,type:'jpeg',quality:90});
  }
 }
 const contactRange=await page.evaluate(()=>{const t=window.__motionAudit.ScrollTrigger.getAll().find(t=>t.trigger?.contains(document.querySelector('[data-contact-opening]'))&&t.trigger!==document.querySelector('main'));return {start:t.start,end:t.end}});
 for(const p of [0,.05,.3,.48,.67,.95,1]){
  await jump(page,contactRange.start+(contactRange.end-contactRange.start)*p);
  result.contact.push({mode:'cinematic',p,contrast:await contrast(page,'#contact')});
  if([.05,.95].includes(p))await page.screenshot({path:`${out}/contact-${p}.jpg`,type:'jpeg',quality:90});
 }
 const button=page.getByRole('button',{name:'Read Work without motion',exact:true});
 await button.focus();await page.keyboard.press('Enter');await page.waitForTimeout(200);
 await page.locator('[data-df-architecture]').scrollIntoViewIfNeeded();
 result.dayflow.push({section:'all',mode:'reading',nodes:await affected(page),contrast:await contrast(page,'[data-work-project="3"]')});
 const cdp=await context.newCDPSession(page);
 result.nameSemantics=(await cdp.send('Accessibility.getFullAXTree')).nodes.filter(n=>!n.ignored&&/Anirudh Shashikumar/i.test(n.name?.value||'')).map(n=>({role:n.role?.value,name:n.name?.value}));
 await cdp.detach();await context.close();
 for(const options of [{reducedMotion:'reduce'},{javaScriptEnabled:false}]){
  if(options.javaScriptEnabled===false){
   const context=await browser.newContext({viewport:{width:1440,height:900},javaScriptEnabled:false});const page=await context.newPage();
   await page.goto('http://127.0.0.1:3000/');await page.locator('#contact').scrollIntoViewIfNeeded();
   result.contactNoJS=await page.locator('#contact').evaluate(e=>({heading:e.querySelector('h2').textContent,links:[...e.querySelectorAll('a')].map(a=>({name:a.getAttribute('aria-label'),visible:a.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})})),monument:e.querySelector('[class*="editorialMonument"]').getAttribute('aria-hidden')}));
   await context.close();continue;
  }
  const {page,context}=await open(options);
  await page.locator('[data-df-architecture]').scrollIntoViewIfNeeded();
  result.dayflow.push({section:'all',mode:'reduced',nodes:await affected(page),contrast:await contrast(page,'[data-work-project="3"]')});
  await page.locator('#contact').scrollIntoViewIfNeeded();
  result.contact.push({mode:'reduced',contrast:await contrast(page,'#contact')});
  await page.screenshot({path:`${out}/contact-reduced.jpg`,type:'jpeg',quality:90});
  await context.close();
 }
 assert.equal(result.errors.length,0);
} finally {writeFileSync(`${out}/inspection.json`,JSON.stringify(result,null,2)+'\n');await browser.close()}
