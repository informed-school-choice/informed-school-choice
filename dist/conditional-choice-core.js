'use strict';
(function(root){
 const assert=(ok,msg)=>{if(!ok)throw Error(msg);},finite=n=>typeof n==='number'&&Number.isFinite(n);
 function validate(data){
  assert(data?.schemaVersion===1&&data.kind==='conditional-node-choice'&&Array.isArray(data.markets),'Unsupported conditional-choice export.');
  if(!data.markets.length){assert(data.status==='awaiting-model-export','Empty verified choice export.');return data;}
  assert(data.status==='verified'&&data.source?.parityVerified===true&&data.source?.completeMenus===true&&data.source?.matchedNodeGeometry===true&&data.source?.twoKappa===true&&data.source?.restrictedSepPaymentShift===true,'The fitted model, menus, node mapping and parity must be verified.');
  assert(data.source.modelVersion&&data.source.geometryMethod&&Array.isArray(data.source.inputHashes)&&data.source.inputHashes.length>=2&&data.source.inputHashes.every(h=>/^[a-f0-9]{64}$/i.test(h.sha256)),'Source provenance is required.');
  const mids=new Set();
  for(const m of data.markets){
   assert(m.id&&!mids.has(m.id)&&m.schools?.length&&m.origins?.length&&Array.isArray(m.profiles),'Incomplete or duplicate market.');mids.add(m.id);
   const ids=new Set();for(const s of m.schools){assert(s.id&&!ids.has(s.id)&&s.label&&[s.lat,s.lon,s.quality].every(finite)&&Math.abs(s.lat)<=90&&Math.abs(s.lon)<=180,'Invalid school.');ids.add(s.id);}
   const origins=new Set();for(const o of m.origins){assert(o.id&&!origins.has(o.id)&&o.label&&[o.lat,o.lon,o.resolutionM].every(finite)&&o.resolutionM>=800&&Math.abs(o.lat)<=90&&Math.abs(o.lon)<=180&&o.locationKind==='representative-model-node','Invalid representative origin.');origins.add(o.id);}
   const profiles=new Set();for(const p of m.profiles){
    const key=p.originId+':'+p.typeId;assert(origins.has(p.originId)&&[1,2,3,4].includes(p.typeId)&&!profiles.has(key),'Invalid origin/type profile.');profiles.add(key);
    for(const a of [p.untreated,p.treated])assert(a?.length===m.schools.length&&a.every(x=>finite(x)&&x>=0&&x<=1)&&Math.abs(a.reduce((s,x)=>s+x,0)-1)<1e-8,'Probabilities must cover the full menu and sum to one.');
   }
  }return data;
 }
 function values(m,schoolId,typeId,mode){
  assert(['untreated','treated','change'].includes(mode),'Invalid information state.');
  const j=m.schools.findIndex(s=>s.id===schoolId);assert(j>=0,'Unknown school.');
  return m.origins.map(o=>{const p=m.profiles.find(p=>p.originId===o.id&&p.typeId===typeId);return {...o,value:p?(mode==='change'?p.treated[j]-p.untreated[j]:p[mode][j]):null};});
 }
 function menu(m,originId,typeId){
  const p=m.profiles.find(p=>p.originId===originId&&p.typeId===typeId);if(!p)return null;
  return m.schools.map((s,j)=>({...s,untreated:p.untreated[j],treated:p.treated[j],change:p.treated[j]-p.untreated[j]}));
 }
 function domain(m,mode){let max=.01;for(const p of m.profiles)for(let j=0;j<p.untreated.length;j++)max=Math.max(max,mode==='change'?Math.abs(p.treated[j]-p.untreated[j]):Math.max(p.untreated[j],p.treated[j]));return max;}
 const api={validate,values,menu,domain};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ConditionalChoice=Object.freeze(api);
})(globalThis);
