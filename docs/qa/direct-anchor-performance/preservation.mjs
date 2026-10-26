import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
const root='docs/qa/direct-anchor-performance';
const hashes=JSON.parse(readFileSync(`${root}/before/source-hashes.json`,'utf8'));
const changed=Object.entries(hashes).filter(([path,hash])=>!existsSync(path)||createHash('sha256').update(readFileSync(path)).digest('hex')!==hash).map(([path])=>path);
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim();
const before=readFileSync(`${root}/before/git-head.txt`,'utf8').trim(),head=git('rev-parse','HEAD');
let ancestor;try{execFileSync('git',['merge-base','--is-ancestor',before,head]);ancestor=true}catch{ancestor=false}
const result={filesChecked:Object.keys(hashes).length,changed,allIdentical:changed.length===0,startingHead:before,finalHead:head,startingHeadIsAncestor:ancestor,indexPathsUnchanged:readFileSync(`${root}/before/index-paths.txt`,'utf8').trim()===git('diff','--cached','--name-only')};
writeFileSync(`${root}/after/preservation.json`,JSON.stringify(result,null,2)+'\n');
writeFileSync(`${root}/after/git-status.txt`,git('status','--short','--untracked-files=all')+'\n');
console.log(result);if(changed.length)process.exitCode=1;
