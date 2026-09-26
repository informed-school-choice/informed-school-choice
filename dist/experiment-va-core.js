'use strict';
(function(root){
 const scenarios=['baseline','takeup50','takeup75','sepOnly','nonSepOnly'],groups=['all','sep','nonsep'],counts={all:815,sep:505,nonsep:310};
 const assert=(ok,m)=>{if(!ok)throw Error(m);},finite=n=>typeof n==='number'&&Number.isFinite(n);
 function validate(d){
  assert(d?.schemaVersion===1&&d.kind==='va-experimental-mixtures'&&d.status==='source-verified'&&d.cohort==='experimental-sample'&&d.sampleSize===815,'Invalid experimental sample.');
  assert(d.source?.restriction==='psiPSEP0'&&/^[a-f0-9]{64}$/.test(d.source.sha256)&&['restrictionMetadata','restrictedPriceParameterZero','completeEligibleSample','groupMaskParity','paperMeanParity','mixtureIdentities','normalization'].every(k=>d.source.verification?.[k]===true),'Unverified experimental source.');
  assert(d.x?.length>=100&&d.x.every((x,i)=>finite(x)&&(i===0||x>d.x[i-1]))&&d.records?.length===30,'Incomplete experimental distributions.');
  const keys=new Set();
  for(const r of d.records){
   const key=[r.scenario,r.group,r.state].join(':');
   assert(scenarios.includes(r.scenario)&&groups.includes(r.group)&&['untreated','policy'].includes(r.state)&&!keys.has(key),'Unknown or duplicate distribution.');keys.add(key);
   assert(r.n===counts[r.group]&&Math.abs(r.weightSum-r.n)<1e-8&&finite(r.mean)&&finite(r.bandwidth)&&r.bandwidth>0,'Invalid group summary.');
   assert(r.density?.length===d.x.length&&r.density.every(x=>finite(x)&&x>=0)&&r.cdf?.length===d.x.length&&r.cdf.every((x,i)=>finite(x)&&x>=0&&x<=1&&(i===0||x>=r.cdf[i-1]))&&r.cdf[0]===0&&r.cdf.at(-1)===1,'Invalid distribution values.');
   assert(['p10','p50','p90'].every(k=>finite(r.quantiles?.[k]))&&r.quantiles.p10<=r.quantiles.p50&&r.quantiles.p50<=r.quantiles.p90,'Invalid distribution quantiles.');
   let mass=0;for(let i=1;i<d.x.length;i++)mass+=(d.x[i]-d.x[i-1])*(r.density[i]+r.density[i-1])/2;assert(Math.abs(mass-1)<.005,'Density mass differs from one.');
  }
  for(const group of groups){
   const base=d.records.find(r=>r.group===group&&r.scenario==='baseline'&&r.state==='untreated');
   assert(d.records.filter(r=>r.group===group).every(r=>r.bandwidth===base.bandwidth),'Smoothing must stay fixed across policies.');
   assert(d.records.filter(r=>r.group===group&&r.state==='untreated').every(r=>Math.abs(r.mean-base.mean)<1e-12),'Baseline changed across policies.');
  }return d;
 }
 function select(d,state){
  if(!d)return null;const scenario=['cost10','publicResponds'].includes(state.scenario)?'baseline':state.scenario,group=groups[state.group];
  if(!scenarios.includes(scenario)||!group)return null;
  return {baseline:d.records.find(r=>r.scenario===scenario&&r.group===group&&r.state==='untreated'),selected:d.records.find(r=>r.scenario===scenario&&r.group===group&&r.state==='policy'),scenario,group};
 }
 const api={validate,select,scenarios,groups};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ExperimentVA=Object.freeze(api);
})(globalThis);

