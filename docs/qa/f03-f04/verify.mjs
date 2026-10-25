// Read-only production-browser verification. Uses an external Playwright/axe install.
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:3000';
const out='docs/qa/f03-f04/after';
mkdirSync(out,{recursive:true});
const before=JSON.parse(readFileSync('docs/qa/f03-f04/before/inspection.json','utf8'));
const luminance=rgb=>rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((s,c,i)=>s+c*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
const result={cases:[],errors:[],warnings:[],footer:[],originalContrast:ratio([96,117,126],[7,10,12])};
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 for(const [width,height,reduced] of [[1440,900,false],[768,1024,false],[681,800,false],[390,844,false],[360,800,false],[320,800,false],[1440,900,true]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});
  page.on('pageerror',e=>result.errors.push(e.message));
  page.on('console',m=>{if(['error','warning'].includes(m.type()))result.warnings.push(m.text())});
  await page.goto(`${base}/?motion-audit=1`,{waitUntil:'load'});
  await page.waitForFunction(()=>window.__motionAudit);
  await page.waitForTimeout(1800);
  const project=page.locator('[data-work-project="5"]');
  assert.equal(await project.locator('a').count(),1,'only the verified achievement remains linked');
  const certificate=project.getByRole('link',{name:'View the full MediFit third-place certificate in a new tab'});
  assert.equal(await certificate.getAttribute('href'),before.medifit.links[0].href);
  assert.equal(await project.getByRole('link',{name:/live.*MediFit/i}).count(),0);
  const status=project.locator('[data-mf-cta]');
  assert.equal(await status.textContent(),'LIVE DEMO UNVERIFIED');
  assert.equal(await status.evaluate(e=>e.matches('a,button,[tabindex],[role="button"],[role="link"]')),false);
  const text=await project.evaluate(e=>e.textContent.replace(/\s+/g,' ').trim());
  assert.equal(text,before.medifit.text.replace('LIVE APP ↗','LIVE DEMO UNVERIFIED'),'all historical project narrative and achievements unchanged');
  await page.evaluate(()=>{const e=document.querySelector('[data-mf-endcap]');scrollTo({top:e.getBoundingClientRect().top+scrollY-innerHeight*.4,behavior:'instant'});window.__motionAudit.ScrollTrigger.update()});
  await page.waitForTimeout(100);
  await page.screenshot({path:`${out}/medifit-${width}-${reduced?'reduced':'normal'}.jpg`,type:'jpeg',quality:90});
  assert.ok(await status.evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}));
  if(width===1440 && !reduced) {
   await certificate.focus();
   await page.waitForTimeout(100);
   const popupPromise=page.waitForEvent('popup');
   await page.keyboard.press('Enter');
   const popup=await popupPromise;
   await popup.waitForLoadState('load');
   assert.ok(popup.url().endsWith(before.medifit.links[0].href));
   result.certificate={url:popup.url(),image:await popup.locator('img').evaluate(e=>({complete:e.complete,width:e.naturalWidth,height:e.naturalHeight}))};
   assert.ok(result.certificate.image.complete&&result.certificate.image.width>0);
   await popup.close();
  }
  await page.evaluate(()=>{document.activeElement?.blur();scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});window.__motionAudit.ScrollTrigger.update()});
  await page.waitForTimeout(80);
  const state=await page.locator('footer').evaluate(e=>({width:innerWidth,height:innerHeight,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,color:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor,footerHeight:e.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth-innerWidth,items:[...e.querySelectorAll('p,a')].map(n=>{const r=n.getBoundingClientRect();const range=document.createRange();range.selectNodeContents(n);return {text:n.textContent,color:getComputedStyle(n).color,fontSize:getComputedStyle(n).fontSize,lineHeight:getComputedStyle(n).lineHeight,rect:{left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height},textRects:[...range.getClientRects()].map(r=>({left:r.left,right:r.right,top:r.top,bottom:r.bottom})),transition:getComputedStyle(n).transitionDuration}})}));
  state.contrast=ratio(state.color.match(/\d+/g).map(Number),state.bg.match(/\d+/g).map(Number));
  assert.ok(state.contrast>=4.5,'unrounded footer contrast meets AA');
  assert.equal(state.overflow,0);
  for(const item of state.items){assert.equal(item.fontSize,'11px');for(const r of item.textRects)assert.ok(r.left>=0&&r.right<=width&&r.top>=0&&r.bottom<=height,'all footer text fits viewport')}
  assert.ok(state.items[3].rect.height>=44);
  if(reduced)assert.equal(state.items[3].transition,'0s');
  await page.addScriptTag({path:process.env.AXE_MODULE || '/private/tmp/portfolio-audit-tools/node_modules/axe-core/axe.min.js'});
  state.axe=await page.evaluate(async()=>{const r=await axe.run(document.querySelector('footer'),{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return {violations:r.violations,incomplete:r.incomplete.map(x=>({id:x.id,nodes:x.nodes.length}))}});
  assert.equal(state.axe.violations.length,0);
  await page.screenshot({path:`${out}/footer-${width}-${reduced?'reduced':'normal'}.jpg`,type:'jpeg',quality:90});
  result.footer.push(state);
  if(width===1440 && !reduced){
   await page.keyboard.press('Tab');
   // Find the real footer control using native keyboard traversal from a stable focus.
   await certificate.focus();
   for(let i=0;i<12 && !(await page.locator('footer a').evaluate(e=>e===document.activeElement));i++)await page.keyboard.press('Tab');
   assert.ok(await page.locator('footer a').evaluate(e=>e===document.activeElement&&e.matches(':focus-visible')));
   await page.keyboard.press('Enter');
   await page.waitForTimeout(1800);
   assert.ok(await page.evaluate(()=>scrollY<2),'native Back to Top activation returns to Hero');
   result.backToTop=true;
  }
  result.cases.push(`${width}x${height}/${reduced?'reduced':'normal'}: narrative, evidence, noninteractive status, footer layout/contrast/axe`);
  console.log(`PASS ${result.cases.at(-1)}`);
  await page.close();
 }
 assert.equal(result.errors.length,0);
} finally {writeFileSync(`${out}/f03-f04-results.json`,JSON.stringify(result,null,2)+'\n');await browser.close()}
