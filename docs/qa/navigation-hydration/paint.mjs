// Compositor evidence, separate from the uninstrumented CLS distributions.
import {createRequire} from 'node:module';
import {mkdirSync,writeFileSync} from 'node:fs';
const{chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');
const out='docs/qa/navigation-hydration/after/paint';mkdirSync(out,{recursive:true});
const b=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'}),rows=[];
try{for(const mode of ['desktop','mobile','reduced','no-js','no-webgl'])for(const hash of ['','work','about','contact']){
 const label=`${mode}-${hash||'home'}`,c=await b.newContext({viewport:{width:mode==='mobile'?390:1440,height:mode==='mobile'?844:900},isMobile:mode==='mobile',hasTouch:mode==='mobile',javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduced'?'reduce':'no-preference'});
 if(mode==='no-webgl')await c.addInitScript(()=>{const orig=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...args){return /webgl/.test(t)?null:orig.call(this,t,...args)}});
 const p=await c.newPage(),cdp=await c.newCDPSession(p),frames=[];await cdp.send('Page.enable');
 cdp.on('Page.screencastFrame',e=>{frames.push({data:e.data,...e.metadata});void cdp.send('Page.screencastFrameAck',{sessionId:e.sessionId}).catch(()=>{})});
 await cdp.send('Page.startScreencast',{format:'jpeg',quality:85,maxWidth:1440,maxHeight:900,everyNthFrame:1});
 await p.goto(`http://127.0.0.1:3001/?motion-audit=1${hash?'#'+hash:''}`);await p.waitForTimeout(900);await cdp.send('Page.stopScreencast');
 const state=await p.evaluate(()=>({origin:performance.timeOrigin,paints:performance.getEntriesByType('paint').map(e=>e.toJSON()),height:document.documentElement.scrollHeight,y:scrollY,triggerCount:window.__motionAudit?.ScrollTrigger.getAll().length,aboutMode:document.querySelector('#about').dataset.cinematic}));
 const fp=state.paints.find(e=>e.name==='first-contentful-paint')?.startTime||0,selected=frames.filter(f=>f.timestamp*1000-state.origin>=fp-20&&f.timestamp*1000-state.origin<=fp+650);
 const evidence=[];for(const [i,f]of selected.entries()){const path=`${label}-${i}.jpg`;writeFileSync(`${out}/${path}`,Buffer.from(f.data,'base64'));const{data,...metadata}=f;evidence.push({path,timeFromNavigationMs:f.timestamp*1000-state.origin,...metadata})}
 rows.push({mode,hash,...state,frames:evidence});writeFileSync(`${out}/results.json`,JSON.stringify(rows,null,2));console.log(label,'FCP',fp,'captured',evidence.length,'height',state.height);await c.close();
}}finally{await b.close()}
