import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root=path.resolve('dist');
const read=relative=>readFileSync(path.join(root,relative));
const files=[];
function collect(folder){
  for(const entry of readdirSync(folder,{withFileTypes:true})){
    const absolute=path.join(folder,entry.name);
    if(entry.isDirectory())collect(absolute);
    else files.push(path.relative(root,absolute).replaceAll('\\','/'));
  }
}
collect(root);
assert.ok(files.includes('index.html'));
const html=read('index.html').toString();
assert.match(html,/id="page-experiment"/);
assert.match(html,/id="page-policy"/);

function requireAsset(reference,from='index.html'){
  if(/^(?:https?:|data:|mailto:|#)/i.test(reference))return;
  const clean=decodeURIComponent(reference.split(/[?#]/,1)[0]);
  const resolved=path.resolve(root,path.dirname(from),clean);
  assert.ok(resolved.startsWith(root+path.sep),`Asset escapes site: ${reference}`);
  assert.ok(existsSync(resolved)&&statSync(resolved).isFile(),`Missing ${reference} in ${from}`);
}
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g))requireAsset(match[1]);

for(const file of files){
  if(file.endsWith('.js'))new vm.Script(read(file).toString(),{filename:file});
  if(file.endsWith('.json'))JSON.parse(read(file).toString());
  if(file.endsWith('.pdf'))assert.equal(read(file).subarray(0,4).toString(),'%PDF',file);
  if(file.endsWith('.css')){
    const css=read(file).toString();
    for(const match of css.matchAll(/url\(\s*['"]?([^'"\)]+)['"]?\s*\)/g))requireAsset(match[1],file);
  }
}

const researchers=JSON.parse(read('researchers.json'));
for(const author of researchers.authors){
  for(const image of [author.portrait,author.portrait.reference].filter(Boolean)){
    requireAsset(image.asset);
    const hash=createHash('sha256').update(read(image.asset)).digest('hex');
    assert.equal(hash,image.sha256,image.asset);
  }
}
const manifest=JSON.parse(read('sources.json'));
for(const source of manifest.sources.filter(source=>source.asset)){
  requireAsset(source.asset);
  const hash=createHash('sha256').update(read(source.asset)).digest('hex');
  assert.equal(hash,source.sha256,source.asset);
}
console.log(`PASS: ${files.length} public files, local links, script syntax, JSON, PDFs, and source image hashes.`);
