'use strict';
// Public aggregate contract only. Private family outcomes never enter this module.
(() => {
 const scenarios=['baseline','takeup50','takeup75','sepOnly','nonSepOnly','cost10','publicResponds'];
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const assert=(ok,message)=>{if(!ok)throw new Error(message);};
 function validate(data,policy){
  assert(data?.schemaVersion===1&&data.kind==='va-distributions'&&data.cohort==='population','Unsupported distribution export');
  assert(data.sourceVersion===policy.sourceVersion,'Distribution source version differs from policy table');
  assert(['awaiting-model-outputs','partial','ready'].includes(data.status),'Unknown export status');
  assert(Array.isArray(data.records)&&Array.isArray(data.x),'Missing distribution arrays');
  if(!data.records.length){assert(data.status==='awaiting-model-outputs'&&data.x.length===0,'Empty verified export');return data;}
  assert(data.status!=='awaiting-model-outputs','Contradictory export status');
  assert(data.x.length>=100&&data.x.every((x,i)=>finite(x)&&(i===0||x>data.x[i-1])),'Invalid VA grid');
  assert(Array.isArray(data.provenance)&&data.provenance.length>0,'Missing source provenance');
  const keys=new Set();
  for(const r of data.records){
   const key=[r.scenario,r.stage,r.group].join(':');
   assert(scenarios.includes(r.scenario)&&[0,1,2,3].includes(r.stage)&&[0,1,2].includes(r.group)&&!keys.has(key),'Duplicate or unknown scenario');
   keys.add(key);
   assert(finite(r.mean)&&finite(r.weightSum)&&r.weightSum>0&&Number.isInteger(r.observationCount)&&r.observationCount>0&&finite(r.bandwidth)&&r.bandwidth>0,'Invalid summary');
   assert(r.density?.length===data.x.length&&r.cdf?.length===data.x.length,'Wrong curve length');
   assert(r.density.every(x=>finite(x)&&x>=0),'Invalid density');
   assert(r.cdf.every((x,i)=>finite(x)&&x>=0&&x<=1&&(i===0||x>=r.cdf[i-1])),'Invalid cumulative distribution');
   assert(r.cdf[0]===0&&r.cdf.at(-1)===1,'Incomplete cumulative support');
   let area=0;for(let i=1;i<data.x.length;i++)area+=(data.x[i]-data.x[i-1])*(r.density[i]+r.density[i-1])/2;
   assert(Math.abs(area-1)<.005,'Density does not integrate to one');
   assert(r.quantiles&&['p10','p50','p90'].every(q=>finite(r.quantiles[q]))&&r.quantiles.p10<=r.quantiles.p50&&r.quantiles.p50<=r.quantiles.p90,'Invalid quantiles');
   assert(policy?.[r.scenario]&&Math.abs(r.mean-policy[r.scenario].values[r.group][r.stage])<=.00051,'Distribution mean disagrees with policy table');
  }
  for(const r of data.records)assert(keys.has([r.scenario,0,r.group].join(':')),'Missing matching baseline');
  if(data.status==='ready')assert(keys.size===scenarios.length*4*3,'Incomplete ready export');
  return data;
 }
 function select(data,state){
  if(!data)return null;
  const find=stage=>data.records.find(r=>r.scenario===state.scenario&&r.stage===stage&&r.group===state.group);
  const baseline=find(0),selected=find(state.stage);
  return baseline&&selected?{baseline,selected}:null;
 }
 // Thresholds snap to exported CDF grid points; no implied exact interpolation.
 function point(data,record,index){
  const i=Math.max(0,Math.min(data.x.length-1,Math.round(index)));
  return {x:data.x[i],cdf:record.cdf[i],density:record.density[i]};
 }
 globalThis.VASimulationCore=Object.freeze({validate,select,point,scenarios});
})();
