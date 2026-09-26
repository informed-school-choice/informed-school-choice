'use strict';
(()=>{
 const root=document.getElementById('experiment-va'),get=id=>document.getElementById(id),f=x=>x.toFixed(3),pct=x=>(x*100).toFixed(1)+'%';
 const labels={baseline:'100% take-up',takeup75:'75% take-up',takeup50:'50% take-up',sepOnly:'SEP families only',nonSepOnly:'Non-SEP families only'},groupLabels=['All experimental families','SEP families','Non-SEP families'];
 let data=null,view='density',state=PolicyLab.getState(),threshold=300;
 function render(){
  const result=ExperimentVA.select(data,state);if(!result)return;const {baseline,selected,scenario,group}=result;
  root.dataset.scenario=scenario;root.dataset.group=group;root.dataset.view=view;
  get('experiment-va-selection').textContent=labels[scenario]+' · '+groupLabels[state.group]+' · '+selected.n+' families';
  get('experiment-va-group').value=state.group;
  get('experiment-va-scope').textContent=(state.stage>1?'This shows the families’ choice step of your policy, before seat constraints or school responses. ':'Families choose freely; school quality, prices, and menus stay fixed. ')+(['cost10','publicResponds'].includes(state.scenario)?'The selected supply lever does not change this demand-only comparison.':'Take-up and targeting follow the policy controls.');
  get('experiment-va-before').textContent=f(baseline.mean);get('experiment-va-after').textContent=f(selected.mean);get('experiment-va-change').textContent=(selected.mean>=baseline.mean?'+':'−')+f(Math.abs(selected.mean-baseline.mean))+' SD';
  root.querySelectorAll('[data-exp-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.expScenario===scenario)));
  root.querySelectorAll('[data-exp-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.expView===view)));
  const w=760,h=340,l=56,r=733,t=22,b=280,x=v=>l+(v-data.x[0])/(data.x.at(-1)-data.x[0])*(r-l),max=view==='cdf'?1:Math.max(...data.records.filter(q=>q.group===group).flatMap(q=>q.density))*1.08,y=v=>b-v/max*(b-t);
  const path=q=>q[view].map((v,i)=>view==='cdf'&&i?'H'+x(data.x[i]).toFixed(2)+'V'+y(v).toFixed(2):(i?'L':'M')+x(data.x[i]).toFixed(2)+','+y(v).toFixed(2)).join(' ');
  let svg='<svg viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+groupLabels[state.group]+': '+labels[scenario]+'. '+(view==='cdf'?'Cumulative distribution':'Density')+' of expected school value added."><title>Experimental-sample demand response</title>';
  for(let i=0;i<=4;i++){const value=max*i/4;svg+='<line x1="'+l+'" x2="'+r+'" y1="'+y(value)+'" y2="'+y(value)+'" stroke="#e1e8f0"/><text x="'+(l-10)+'" y="'+(y(value)+5)+'" text-anchor="end">'+(view==='cdf'?Math.round(value*100)+'%':value.toFixed(1))+'</text>';}
  for(let i=0;i<=6;i++){const value=data.x[0]+(data.x.at(-1)-data.x[0])*i/6;svg+='<text x="'+x(value)+'" y="'+(b+26)+'" text-anchor="middle">'+value.toFixed(1)+'</text>';}
  if(view==='density')svg+='<path d="'+path(selected)+' L'+r+','+b+' L'+l+','+b+' Z" fill="#2448e3" fill-opacity=".09"/>';
  svg+='<path d="'+path(baseline)+'" stroke="#7b889e" stroke-width="2.5" stroke-dasharray="6 5" fill="none"/><path d="'+path(selected)+'" stroke="#2448e3" stroke-width="3" fill="none"/>';
  for(const [rec,color] of [[baseline,'#7b889e'],[selected,'#2448e3']])svg+='<line x1="'+x(rec.mean)+'" x2="'+x(rec.mean)+'" y1="'+t+'" y2="'+b+'" stroke="'+color+'" stroke-dasharray="3 5" opacity=".65"/>';
  svg+='<line x1="'+x(data.x[threshold])+'" x2="'+x(data.x[threshold])+'" y1="'+t+'" y2="'+b+'" stroke="#137a72" stroke-width="1.5"/><text x="'+(l+r)/2+'" y="334" text-anchor="middle">Expected school value added · SD</text></svg>';
  get('experiment-va-chart').innerHTML=svg;
  get('experiment-va-threshold-value').textContent=f(data.x[threshold])+' SD';get('experiment-va-threshold').setAttribute('aria-valuetext',f(data.x[threshold])+' standard deviations of expected VA');
  get('experiment-va-threshold-summary').textContent='Expected share at or below '+f(data.x[threshold])+' SD: '+pct(selected.cdf[threshold])+' under the selected policy, compared with '+pct(baseline.cdf[threshold])+' without information.';
  get('experiment-va-quantiles').innerHTML='<caption>Expected school VA at selected percentiles (SD)</caption><thead><tr><th scope="col">Percentile</th><th scope="col">No information</th><th scope="col">Selected policy</th></tr></thead><tbody>'+[['p10','10th'],['p50','Median'],['p90','90th']].map(([key,label])=>'<tr><th scope="row">'+label+'</th><td>'+f(baseline.quantiles[key])+'</td><td>'+f(selected.quantiles[key])+'</td></tr>').join('')+'</tbody>';
 }
 root.querySelectorAll('[data-exp-scenario]').forEach(b=>b.addEventListener('click',()=>PolicyLab.configure({family:['sepOnly','nonSepOnly'].includes(b.dataset.expScenario)?'target':'reach',scenario:b.dataset.expScenario})));
 root.querySelectorAll('[data-exp-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.expView;render();}));
 get('experiment-va-group').addEventListener('change',e=>PolicyLab.configure({group:Number(e.target.value)}));
 get('experiment-va-threshold').addEventListener('input',e=>{threshold=Number(e.target.value);render();});
 window.addEventListener('policy:change',e=>{state=e.detail;render();});
 fetch('va-experiment-mixtures.json').then(r=>{if(!r.ok)throw Error('Missing experimental outcomes');return r.json();}).then(d=>{
  data=ExperimentVA.validate(d);get('experiment-va-threshold').max=d.x.length-1;threshold=d.x.reduce((a,x,i)=>Math.abs(x-.5)<Math.abs(d.x[a]-.5)?i:a,0);get('experiment-va-threshold').value=threshold;get('experiment-va-loading').hidden=true;get('experiment-va-body').hidden=false;render();
 }).catch(()=>{get('experiment-va-loading').textContent='The experimental distributions could not be verified. The original paper figures remain available below.';get('experiment-va-body').hidden=true;});
})();

