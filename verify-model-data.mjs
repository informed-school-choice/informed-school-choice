import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';

const require=createRequire(import.meta.url);
const choice=require('./dist/conditional-choice-core.js');
const family=require('./dist/choice-engine.js');
const experiment=require('./dist/experiment-va-core.js');
const read=name=>JSON.parse(readFileSync(`dist/${name}`,'utf8'));
const near=(a,b,tolerance=1e-10)=>assert.ok(Math.abs(a-b)<tolerance,`${a} differs from ${b}`);

const markets=read('markets.json');
assert.equal(markets.householdTreatmentLinked,false);
assert.equal(markets.completeSchoolMenus,false);
for(const market of markets.markets){
 assert.equal(market.total,market.treated+market.control);
 assert.equal(market.total,market.cells.reduce((sum,cell)=>sum+cell.count,0));
 for(const cell of market.cells){
  for(const privateField of ['familyId','assignment','treat'])assert.ok(!(privateField in cell),`Residential cell contains ${privateField}`);
 }
}

const familyExport=family.validate(read('family-choices.json'));
assert.ok(familyExport.families.length===0||familyExport.source?.parityVerified===true,'Family predictions need model parity.');
const conditional=choice.validate(read('conditional-choice.json'));
if(conditional.markets.length)assert.equal(conditional.status,'verified');

// This fixture lives only in the test and never becomes a published prediction.
const fixture={schemaVersion:1,kind:'conditional-node-choice',status:'verified',source:{modelVersion:'TEST ONLY',geometryMethod:'TEST ONLY',parityVerified:true,completeMenus:true,matchedNodeGeometry:true,twoKappa:true,restrictedSepPaymentShift:true,inputHashes:[{sha256:'a'.repeat(64)},{sha256:'b'.repeat(64)}]},markets:[{id:'test',schools:[{id:'a',label:'A',lat:-33.5,lon:-70.5,quality:.1},{id:'b',label:'B',lat:-33.6,lon:-70.6,quality:.2}],origins:[{id:'x',label:'X',lat:-33.51,lon:-70.51,resolutionM:2000,locationKind:'representative-model-node'},{id:'y',label:'Y',lat:-33.61,lon:-70.61,resolutionM:2000,locationKind:'representative-model-node'}],profiles:[{originId:'x',typeId:1,untreated:[.8,.2],treated:[.6,.4]},{originId:'y',typeId:1,untreated:[.7,.3],treated:[.9,.1]}]}]};
choice.validate(fixture);
const modelMarket=fixture.markets[0];
near(choice.menu(modelMarket,'x',1).reduce((sum,school)=>sum+school.change,0),0);
near(choice.values(modelMarket,'a',1,'untreated').reduce((sum,origin)=>sum+origin.value,0),1.5);
assert.equal(choice.menu(modelMarket,'x',2),null,'Missing family types must remain missing, not zero.');
const bad=structuredClone(fixture);bad.markets[0].profiles[0].treated=[.6,.3];
assert.throws(()=>choice.validate(bad),/sum to one/);
bad.markets[0].profiles[0].treated=[.6,.4];bad.source.parityVerified=false;
assert.throws(()=>choice.validate(bad),/verified/);

const mixture=experiment.validate(read('va-experiment-mixtures.json'));
assert.equal(mixture.cohort,'experimental-sample');
const record=(scenario,group,state='policy')=>mixture.records.find(row=>row.scenario===scenario&&row.group===group&&row.state===state);
for(const group of experiment.groups){
 const before=record('baseline',group,'untreated'),full=record('baseline',group);
 for(const [scenario,takeup] of [['takeup50',.5],['takeup75',.75]]){
  const selected=record(scenario,group);
  near(selected.mean,(1-takeup)*before.mean+takeup*full.mean);
  for(let i=0;i<mixture.x.length;i++)near(selected.cdf[i],(1-takeup)*before.cdf[i]+takeup*full.cdf[i]);
 }
}
console.log('PASS: public map privacy, choice-probability invariants and parity gate, and experimental-mixture identities.');
