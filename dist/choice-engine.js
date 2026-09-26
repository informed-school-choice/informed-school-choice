(function(root){
 'use strict';
 function validate(data){
  if(data?.schemaVersion!==1||!Array.isArray(data.families))throw new Error('Unsupported family-choice export.');
  if(!data.families.length)return data;
  if(data.status!=='verified'||data.completeMenus!==true||data.matchedFamilyLocations!==true)throw new Error('Choice menus and family-location links must be verified.');
  if(!data.source?.modelVersion||!data.source?.sample||!data.source?.locationMethod||!data.source?.paymentUnit||data.source.parityVerified!==true)throw new Error('Model parity and location provenance are required.');
  const ids=new Set();for(const f of data.families){
   if(!f.id||ids.has(f.id)||!f.label||![1,2,3,4].includes(f.baseType))throw new Error('Invalid or duplicate family.');ids.add(f.id);
   if(!['treated','control'].includes(f.assignment)||!Number.isFinite(f.locationResolutionM)||f.locationResolutionM<1000)throw new Error('Invalid assignment or insufficient location approximation.');
   if(!Array.isArray(f.approxLocation)||f.approxLocation.length!==2||!f.approxLocation.every(Number.isFinite))throw new Error('Approximate map coordinates required.');
   if(Math.abs(f.approxLocation[0])>90||Math.abs(f.approxLocation[1])>180)throw new Error('Invalid household display coordinate bounds.');
   if(!Array.isArray(f.schools)||!f.schools.length||f.menuComplete!==true)throw new Error('Complete school menu required.');
   if(!f.parameters||!['kappa','psiQuality','psiPayment','psiDistance'].every(k=>Number.isFinite(f.parameters[k]))||f.parameters.kappa<=0)throw new Error('Fitted treatment parameters required.');
   let p0=0,p1=0;const schoolIds=new Set();for(const s of f.schools){
    if(!s.id||schoolIds.has(s.id)||!s.label)throw new Error('Invalid school identity.');schoolIds.add(s.id);
    if(![s.quality,s.paymentModelUnits,s.distanceKmApprox,s.controlProbability,s.treatedProbability].every(Number.isFinite)||s.distanceKmApprox<=0||s.paymentModelUnits<0)throw new Error('Invalid school characteristics.');
    if(s.distanceKmApprox*2!==Math.round(s.distanceKmApprox*2))throw new Error('Display distance must be rounded to 0.5 km.');
    if(s.controlProbability<0||s.treatedProbability<0||s.controlProbability>1||s.treatedProbability>1)throw new Error('Invalid choice probability.');
    if(!Array.isArray(s.location)||s.location.length!==2||!s.location.every(Number.isFinite))throw new Error('School coordinates required.');p0+=s.controlProbability;p1+=s.treatedProbability;
    if(Math.abs(s.location[0])>90||Math.abs(s.location[1])>180)throw new Error('Invalid school coordinate bounds.');
   }
   if(Math.abs(p0-1)>1e-8||Math.abs(p1-1)>1e-8)throw new Error('Probabilities must sum to one over the complete menu.');
  }return data;
 }
 function compare(f,treated){
  const ordered=[...f.schools].sort((a,b)=>Math.max(b.controlProbability,b.treatedProbability)-Math.max(a.controlProbability,a.treatedProbability)||String(a.id).localeCompare(String(b.id)));
  const shown=ordered.slice(0,5).map(s=>({...s,probability:treated?s.treatedProbability:s.controlProbability,change:s.treatedProbability-s.controlProbability}));
  const other0=ordered.slice(5).reduce((a,s)=>a+s.controlProbability,0),other1=ordered.slice(5).reduce((a,s)=>a+s.treatedProbability,0);
  return {shown,otherCount:Math.max(0,ordered.length-5),otherControl:other0,otherTreated:other1,otherProbability:treated?other1:other0,expectedQuality:f.schools.reduce((a,s)=>a+s.quality*(treated?s.treatedProbability:s.controlProbability),0)};
 }
 const api={validate,compare};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.ChoiceEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
