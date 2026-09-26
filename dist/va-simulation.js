'use strict';
(() => {
 const root=document.getElementById('va-simulation');
 const get=id=>document.getElementById(id);
 const stages=[...root.querySelectorAll('[data-model-stage]')];
 const views=[...root.querySelectorAll('[data-va-view]')];
 let data=null,loadState='loading',view='density',state=window.PolicyLab.getState(),thresholdSet=false;
 const f=n=>n.toFixed(3),signed=n=>(n<0?'−':'+')+Math.abs(n).toFixed(3);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const fmtPercent=n=>(100*n).toFixed(1)+'%';
 function meansOnly(){
  const a=state.baseline,b=state.mean,min=Math.min(0,a,b),max=Math.max(.85,a,b);
  const w=window.innerWidth<760?330:720,left=30,right=w-30,pos=n=>left+(n-min)/(max-min)*(right-left);
  get('va-chart').innerHTML=`<svg viewBox="0 0 ${w} 172" role="img" aria-label="Reported mean expected VA: no intervention ${f(a)} SD; selected policy ${f(b)} SD. No distribution is shown."><line x1="${left}" x2="${right}" y1="80" y2="80" stroke="#dbe3ee" stroke-width="2"/><line x1="${pos(a)}" x2="${pos(b)}" y1="80" y2="80" stroke="#2448e3" stroke-width="5"/><circle cx="${pos(a)}" cy="80" r="7" fill="#fff" stroke="#7b889e" stroke-width="3"/><circle cx="${pos(b)}" cy="80" r="7" fill="#2448e3"/><text x="${pos(a)}" y="52" text-anchor="middle" fill="#53647c">${f(a)}</text><text x="${pos(b)}" y="119" text-anchor="middle" fill="#2448e3">${f(b)}</text><text x="${left}" y="153" fill="#63718a">${min.toFixed(1)}</text><text x="${right}" y="153" text-anchor="end" fill="#63718a">${max.toFixed(2)} SD</text></svg>`;
 }
 function draw(curves){
  const {baseline,selected}=curves,w=760,h=326,left=58,right=732,top=24,bottom=266;
  const lo=data.x[0],hi=data.x.at(-1),x=n=>left+(n-lo)/(hi-lo)*(right-left);
  const max=view==='cdf'?1:data.records.filter(r=>r.group===state.group).reduce((m,r)=>Math.max(m,...r.density),0)*1.08;
  const y=n=>bottom-n/max*(bottom-top);
  const path=record=>record[view].map((n,i)=>i&&view==='cdf'?`H${x(data.x[i]).toFixed(2)} V${y(n).toFixed(2)}`:`${i?'L':'M'}${x(data.x[i]).toFixed(2)},${y(n).toFixed(2)}`).join(' ');
  let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(state.scenarioLabel+' · '+state.groupLabel+' · '+state.stageLabel)}. ${view==='cdf'?'Cumulative distribution':'Density'} of expected school value added."><title>${esc(state.groupLabel)}: expected school VA</title>`;
  for(let i=0;i<=4;i++){const value=max*i/4;svg+=`<line x1="${left}" x2="${right}" y1="${y(value)}" y2="${y(value)}" stroke="#e4eaf3"/><text x="${left-12}" y="${y(value)+5}" text-anchor="end">${view==='cdf'?Math.round(value*100)+'%':value.toFixed(1)}</text>`;}
  for(let i=0;i<=5;i++){const value=lo+(hi-lo)*i/5;svg+=`<text x="${x(value)}" y="${bottom+26}" text-anchor="middle">${value.toFixed(1)}</text>`;}
  if(view==='density')svg+=`<path d="${path(selected)} L${right},${bottom} L${left},${bottom} Z" fill="#2448e3" fill-opacity=".08"/>`;
  svg+=`<path d="${path(baseline)}" fill="none" stroke="#7b889e" stroke-width="2.4" stroke-dasharray="6 5"/><path d="${path(selected)}" fill="none" stroke="#2448e3" stroke-width="3"/>`;
  for(const [r,color] of [[baseline,'#7b889e'],[selected,'#2448e3']])svg+=`<line x1="${x(r.mean)}" x2="${x(r.mean)}" y1="${top}" y2="${bottom}" stroke="${color}" stroke-dasharray="3 5" opacity=".6"/>`;
  const point=VASimulationCore.point(data,selected,Number(get('va-threshold').value));
  svg+=`<line x1="${x(point.x)}" x2="${x(point.x)}" y1="${top}" y2="${bottom}" stroke="#0d766e" stroke-width="1.5"/><text x="${(left+right)/2}" y="320" text-anchor="middle">Expected school value added · SD</text></svg>`;
  get('va-chart').innerHTML=svg;
  const basePoint=VASimulationCore.point(data,baseline,Number(get('va-threshold').value));
  get('va-threshold-value').textContent=f(point.x)+' SD';
  get('va-threshold').setAttribute('aria-valuetext',f(point.x)+' standard deviations of expected school VA');
  get('va-threshold-summary').textContent=`At or below ${f(point.x)} SD: ${fmtPercent(point.cdf)} of families under this policy, compared with ${fmtPercent(basePoint.cdf)} without intervention.`;
  get('va-quantiles').innerHTML=`<caption>Expected school VA at selected percentiles (SD)</caption><thead><tr><th scope="col">Percentile</th><th scope="col">No intervention</th><th scope="col">Selected policy</th></tr></thead><tbody>${[['p10','10th'],['p50','Median'],['p90','90th']].map(([q,label])=>`<tr><th scope="row">${label}</th><td>${f(baseline.quantiles[q])}</td><td>${f(selected.quantiles[q])}</td></tr>`).join('')}</tbody>`;
 }
 function render(){
  const curves=VASimulationCore.select(data,state),available=!!curves;
  root.dataset.available=String(available);
  get('va-selection').textContent=state.scenarioLabel+' · '+state.groupLabel;
  get('va-stage-label').textContent=state.stageLabel;
  get('va-mean-before').textContent=f(curves?.baseline.mean??state.baseline);
  get('va-mean-after').textContent=f(curves?.selected.mean??state.mean);
  get('va-mean-change').textContent=signed(curves?curves.selected.mean-curves.baseline.mean:state.effect)+' SD';
  get('va-mean-source').textContent=available?'Means computed from the displayed distributions.':'Reported population means; distribution not yet available. Effects can differ from rounded mean differences.';
  get('va-availability').textContent=available?'Simulation distribution':loadState==='loading'?'Loading distribution…':'Reported means';
  get('va-chart-title').textContent=available?(view==='density'?'The distribution of expected VA':'The cumulative distribution of expected VA'):'Mean expected school value added';
  get('va-availability-note').hidden=available;
  get('va-availability-note').textContent=loadState==='error'?'The population distribution could not be loaded or verified. The reported means remain available.':loadState==='loading'?'Checking for the population distribution for this policy…':'A verified population distribution for this selection is not yet available. The comparison above shows its reported means. The paper’s experimental-sample distributions are below.';
  get('va-threshold-controls').hidden=!available;get('va-summary-table').hidden=!available;
  views.forEach(b=>{b.disabled=!available;b.setAttribute('aria-pressed',String(b.dataset.vaView===view));});
  stages.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.modelStage)===state.stage)));
  if(available){
   get('va-threshold').max=data.x.length-1;
   if(!thresholdSet){get('va-threshold').value=data.x.reduce((best,n,i)=>Math.abs(n-curves.baseline.mean)<Math.abs(data.x[best]-curves.baseline.mean)?i:best,0);thresholdSet=true;}
   draw(curves);
  }else{meansOnly();get('va-quantiles').innerHTML='';}
 }
 stages.forEach(b=>b.addEventListener('click',()=>window.PolicyLab.configure({stage:Number(b.dataset.modelStage)})));
 views.forEach(b=>b.addEventListener('click',()=>{view=b.dataset.vaView;render();}));
 get('va-threshold').addEventListener('input',()=>render());
 window.addEventListener('policy:change',event=>{state=event.detail;render();});
 window.addEventListener('resize',render);
 render();
 fetch('va-simulations.json').then(r=>{if(!r.ok)throw new Error('Missing distribution export');return r.json();}).then(result=>{data=VASimulationCore.validate(result,window.POLICY_DATA);loadState='loaded';render();}).catch(()=>{data=null;loadState='error';render();});
})();
