import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {writeFileSync} from 'node:fs';
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const results=[];
try {
 for(const mode of ['cinematic','reduced','no-javascript']) {
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:mode==='reduced'?'reduce':'no-preference',javaScriptEnabled:mode!=='no-javascript'});
  const page=await context.newPage();await page.goto('http://127.0.0.1:3000/?motion-audit=1');await page.waitForTimeout(1800);
  const cdp=await context.newCDPSession(page);const {root}=await cdp.send('DOM.getDocument');
  const monuments=[];
  for(const selector of ['[data-contact-monument]','#contact [class*="editorialMonument"]']) {
   const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});
   const {node}=await cdp.send('DOM.describeNode',{nodeId});
   const {nodes}=await cdp.send('Accessibility.getPartialAXTree',{backendNodeId:node.backendNodeId,fetchRelatives:false});
   const ax=nodes.find(n=>n.backendDOMNodeId===node.backendNodeId);
   assert.ok(ax?.ignored,`${mode}: decorative monument is ignored by the browser AX tree`);
   monuments.push({selector,ignored:ax.ignored,reasons:ax.ignoredReasons});
  }
  const nodes=(await cdp.send('Accessibility.getFullAXTree')).nodes.filter(n=>!n.ignored);
  assert.equal(nodes.filter(n=>n.role?.value==='heading'&&n.name?.value==='Contact Anirudh Shashikumar').length,1);
  assert.equal(await page.getByRole('link',{name:'Email Anirudh Shashikumar',exact:true}).count(),1);
  const identity=await page.locator('[data-site-header] > div > a').evaluate(e=>({text:e.textContent.trim(),visible:e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})}));
  assert.equal(identity.text,'ANIRUDH SHASHIKUMAR');assert.ok(identity.visible);
  results.push({mode,monuments,identity,contactHeading:'Contact Anirudh Shashikumar',emailLink:'Email Anirudh Shashikumar'});
  await context.close();console.log(`PASS decorative monument + meaningful full name in ${mode}`);
 }
}finally{writeFileSync('docs/qa/f05-accessibility-polish/after/decorative-contact.json',JSON.stringify(results,null,2)+'\n');await browser.close()}
