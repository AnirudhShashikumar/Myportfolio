// Run existing suites with isolated output folders; keep historical evidence intact.
import { readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const root='docs/qa/navigation-hydration/after/regression';
mkdirSync(root,{recursive:true});
const env={...process.env,PORTFOLIO_QA_URL:process.env.PORTFOLIO_QA_URL||'http://127.0.0.1:3001',POLISH_PHASE:'after',SEO_PHASE:'after',INTEGRITY_PHASE:'after',F02_QA_OUT:`${root}/accessibility-f02`};
const temporary=[];
const specs=[];
function copy(source,target,replacements){let text=readFileSync(source,'utf8');for(const [a,b] of replacements){if(!text.includes(a))throw new Error(`Missing expected adapter text in ${source}`);text=text.replace(a,b)}writeFileSync(target,text);temporary.push(target);return target}
const about=copy('scripts/about-motion-qa.mjs','scripts/.navigation-hydration-about.mjs',[["const directory = 'docs/qa/about-motion';",`const directory = '${root}/about';`]]);
const discovery=copy('scripts/scroll-discovery-qa.mjs','scripts/.navigation-hydration-discovery.mjs',[["const directory = \"docs/qa/scroll-discovery\";",`const directory = "${root}/scroll-discovery";`]]);
const production=copy('scripts/production-audit.mjs','scripts/.navigation-hydration-production.mjs',[["const out = \"docs/qa/production\";",`const out = "${root}/production";`]]);
const f03=copy('docs/qa/f03-f04/verify.mjs','docs/qa/navigation-hydration/.f03.mjs',[["const out='docs/qa/f03-f04/after';",`const out='${root}/f03-f04';`],["assert.equal(text,before.medifit.text.replace('LIVE APP ↗','LIVE DEMO UNVERIFIED'),'all historical project narrative and achievements unchanged');","assert.equal(text,readFileSync('docs/qa/project-integrity/expected-medifit.txt','utf8').trim(),'the previously reviewed F08 narrative remains exact');"]]);
const f05=copy('docs/qa/f05-accessibility-polish/inspect.mjs','docs/qa/navigation-hydration/.f05.mjs',[["const out=`docs/qa/f05-accessibility-polish/${phase}`;",`const out='${root}/f05';`]]);
const seo=copy('docs/qa/seo-branding/verify.mjs','docs/qa/navigation-hydration/.seo.mjs',[["const out = `docs/qa/seo-branding/${phase}`;",`const out = '${root}/seo';`]]);
const integrity=copy('docs/qa/project-integrity/inspect.mjs','docs/qa/navigation-hydration/.integrity.mjs',[["const out = `docs/qa/project-integrity/${phase}`;",`const out = '${root}/integrity';`]]);
const content=copy('docs/qa/project-integrity/content-review.mjs','docs/qa/navigation-hydration/.content.mjs',[["const out = \"docs/qa/project-integrity/after\";",`const out = '${root}/integrity';`],["http://127.0.0.1:3000/?motion-audit=1",`${env.PORTFOLIO_QA_URL}/?motion-audit=1`]]);
const input=copy('docs/qa/f03-f04/scroll-input.mjs','docs/qa/navigation-hydration/.input.mjs',[["docs/qa/f03-f04/after/scroll-input.json",`${root}/scroll-input.json`]]);
specs.push(['about-content',['--test','scripts/about-content.test.mjs']],['about-motion',[about]],['scroll-discovery',[discovery]],['accessibility-f02',['scripts/accessibility-f02-qa.mjs']],['f03-f04',[f03]],['f05',[f05]],['seo',[seo]],['integrity',[integrity]],['content',[content]],['matrix-chrome',[production],{AUDIT_MODE:'matrix',AUDIT_ENGINE:'chrome'}],['matrix-webkit',[production],{AUDIT_MODE:'matrix',AUDIT_ENGINE:'webkit'}],['extra',[production],{AUDIT_MODE:'extra'}],['scroll-input',[input]]);
const results=[];
try{
 for(const [name,args,extra] of specs){
  console.log(`START ${name}`);
  const run=spawnSync(process.execPath,args,{env:{...env,...extra},encoding:'utf8',maxBuffer:20*1024*1024});
  writeFileSync(`${root}/${name}.txt`,(run.stdout||'')+(run.stderr||''));
  results.push({name,exitCode:run.status,error:run.error?.message});
  writeFileSync(`${root}/commands.json`,JSON.stringify(results,null,2)+'\n');
  if(run.status!==0)throw new Error(`${name} failed; inspect its saved log`);
  console.log(`PASS ${name}`);
 }
}finally{for(const file of temporary)unlinkSync(file)}
