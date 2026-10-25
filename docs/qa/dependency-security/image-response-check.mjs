import fs from 'node:fs';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const baseline=JSON.parse(fs.readFileSync('docs/qa/production/matrix-chrome.json'));
const urls=[...new Set(baseline.viewports.flatMap(v=>v.images.map(i=>i.currentSrc)).filter(u=>u.includes('/_next/image?')))];
const result={sharp:require('sharp').versions,images:[]};
for(const url of urls){const response=await fetch(url,{headers:{Accept:'image/webp'}});const bytes=Buffer.from(await response.arrayBuffer());let metadata;try{const m=await require('sharp')(bytes).metadata();metadata={format:m.format,width:m.width,height:m.height}}catch{};result.images.push({url,status:response.status,type:response.headers.get('content-type'),bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),...metadata});}
fs.writeFileSync((process.env.SECURITY_QA_OUT||'docs/qa/dependency-security/after')+'/optimized-images.json',JSON.stringify(result,null,2)+'\n');console.log(result.sharp.sharp,result.images.length+' optimizer variants',result.images.filter(i=>i.status!==200));
