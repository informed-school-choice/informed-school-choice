(function(){
 'use strict';
 const el=id=>document.getElementById(id),esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let geo,choiceData={families:[]},map,layers,choiceLayers,homeLayers,schoolLayers,selectedMarket='312',view='interactive',selectedFamily,treated=false,initializing;
 let renderMode='market',schoolsVisible=true,areasVisible=true,selectedSchool;
 let nodeData={markets:[]},measure='density',choiceType=1,choiceState='untreated',choiceSchool,selectedOrigin;
 const densityColor=n=>n>=25?'#4c2a91':n>=10?'#7753b8':n>=5?'#9b7ed4':n>=2?'#c4b5e8':'#eee9fa';
 let preferenceType=1,preferenceTreated=false;
 const pct=p=>(100*p).toFixed(1)+'%',delta=p=>(p>=0?'+':'−')+Math.abs(100*p).toFixed(1)+' pp';
 const currentMarket=()=>geo?.markets.find(m=>m.id===selectedMarket);
 function pending(message){
  el('family-panel-content').innerHTML='<span class="pending-label">Individual model data pending</span><h3>How does information change a family’s choice?</h3><p>'+esc(message||'The map shows the experiment’s geography. Connecting a family to its school options requires a verified match to the fitted model.')+'</p><div id="preference-mechanism"></div><ul class="pending-list"><li>Locate an anonymous family.</li><li>Compare its full school menu.</li><li>Switch treatment on and off to see how choice chances change.</li></ul><details><summary>What determines the probabilities?</summary><div class="probability-formula">'+PaperMath.block('treatment')+PaperMath.block('choice')+'</div><p class="equation-note">The first equation is the paper’s treatment utility. The second expands its conditional logit and averages over unobserved preferences, for a fixed residential location and family type. '+PaperMath.inline(String.raw`a\in\{C,T\}`)+' selects untreated or treated utility; '+PaperMath.inline(String.raw`\mathcal{J}_m`)+' includes every school in the market.</p><p class="equation-note">Quality, family payments, driving distance, and other school appeal shape choice. Probabilities sum to 100% across the entire market menu. Treatment changes demand parameters while school conditions stay fixed. <a href="#model">See the paper’s notation ↗</a></p><p class="equation-note">The available export cannot reliably link individual homes to treatment assignments. Individual predictions remain inactive until matched locations and fitted probabilities are verified.</p></details>';
  drawPreferenceMechanism();
 }

 function drawPreferenceMechanism(){
  const target=el('preference-mechanism');if(!target)return;
  const c=PreferenceMechanism.coefficients(preferenceType,preferenceTreated);
  target.innerHTML='<div class="preference-mechanism"><h3>How does information change preferences?</h3><label for="preference-type">Family characteristics</label><select id="preference-type"><option value="1">Below high school · SEP</option><option value="2">Below high school · non-SEP</option><option value="3">Completed high school · SEP</option><option value="4">Completed high school · non-SEP</option></select><div class="treatment-toggle" role="group" aria-label="Preference information state"><button type="button" id="preference-control" aria-pressed="'+(!preferenceTreated)+'">Without information</button><button type="button" id="preference-treatment" aria-pressed="'+preferenceTreated+'">With information</button></div><div aria-live="polite"><table><caption>Mean utility coefficients · rounded estimates</caption><tbody>'+[['q','School quality'],['p','Out-of-pocket payment'],['d','Driving distance']].map(([key,label])=>'<tr><th scope="row">'+label+'</th><td>'+c.values[key].toFixed(3)+'</td></tr>').join('')+'</tbody></table><p class="equation-note">'+(preferenceTreated?'Each baseline coefficient is multiplied by κ = '+c.kappa.toFixed(3)+', then its treatment shift is added. School-specific appeal and quality heterogeneity are also scaled.':'These baseline coefficients combine the paper’s common and family-type terms.')+'</p></div><p class="equation-note">These are utility weights, not choice probabilities. Converting them to chances requires the complete school menu, school-specific appeal, and verified model distances. Payment units follow the model; SEP payments are zero at participating schools.</p></div>';
  el('preference-type').value=preferenceType;el('preference-type').addEventListener('change',e=>{preferenceType=Number(e.target.value);drawPreferenceMechanism()});el('preference-control').addEventListener('click',()=>{preferenceTreated=false;drawPreferenceMechanism()});el('preference-treatment').addEventListener('click',()=>{preferenceTreated=true;drawPreferenceMechanism()});
 }

 async function initialize(){
  if(initializing)return initializing;
  initializing=(async()=>{try{
   const [gr,fr]=await Promise.all([fetch('markets.json'),fetch('family-choices.json')]);
   if(!gr.ok)throw new Error('Map data could not be loaded.');
   geo=await gr.json();if(!Array.isArray(geo.markets)||!geo.markets.length)throw new Error('No market data available.');
   try{if(!fr.ok)throw new Error('Model export unavailable.');choiceData=ChoiceEngine.validate(await fr.json())}
   catch(error){pending('The family model export did not pass validation. Individual probabilities are unavailable until its inputs are corrected.');choiceData={families:[],invalid:true}}
   el('market-select').innerHTML='<option value="all">All six markets · '+geo.records+' records</option>'+geo.markets.map(m=>'<option value="'+esc(m.id)+'">'+esc(m.label)+' · '+m.total+' records</option>').join('');
   el('market-select').disabled=false;el('market-select').value=selectedMarket;
   try{const nr=await fetch('conditional-choice.json');if(!nr.ok)throw Error('Missing cache');nodeData=ConditionalChoice.validate(await nr.json())}catch{nodeData={markets:[]};}
   createMap();drawMarket();if(location.hash==='#places')requestAnimationFrame(()=>map?.invalidateSize());
  }catch(error){el('map-status').textContent=error.message;el('market-map').textContent='The geographic data could not be loaded. Try reloading the page.';pending('The map data is unavailable. No individual predictions are being displayed.')}})();
  return initializing;
 }
 function createMap(){
  if(!window.L){el('map-status').textContent='Interactive map unavailable. The original Santiago figure remains available.';return}
  map=L.map('market-map',{scrollWheelZoom:false,maxZoom:15,minZoom:4,zoomControl:false});
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'}).addTo(map).on('tileerror',()=>{el('map-status').textContent='Some street-map tiles are unavailable. School locations, approximate home areas, and the paper figure remain available.'});
  layers=L.layerGroup().addTo(map);choiceLayers=L.layerGroup().addTo(map);
  L.control.zoom({position:'bottomright'}).addTo(map);L.control.scale({imperial:false}).addTo(map);
  map.on('zoomend',()=>{if(renderMode==='market')renderSchools()});
 }
 function summary(m){el('market-summary').innerHTML='<div class="market-stat"><small>'+esc(m.label)+'</small><strong>'+m.total.toLocaleString()+'</strong><small>'+(m.published?'students in paper figure':'exported records')+'</small></div><div class="market-stat"><small>Assigned treatment</small><strong class="treatment-number">'+m.treated.toLocaleString()+'</strong></div><div class="market-stat"><small>Assigned control</small><strong class="control-number">'+m.control.toLocaleString()+'</strong></div>'}
 function closeDetail(){el('area-detail').hidden=true;el('map-hint').hidden=false;selectedSchool=undefined;if(renderMode==='market')renderSchools()}
 function detail(kind,title,body){
  el('area-detail').innerHTML='<button type="button" class="detail-close" aria-label="Close map detail">×</button><span class="detail-kind">'+esc(kind)+'</span><h3>'+esc(title)+'</h3><p>'+body+'</p>';
  el('area-detail').hidden=false;el('map-hint').hidden=true;
  el('area-detail').querySelector('.detail-close').addEventListener('click',closeDetail);
 }
 function selectSchool(s){selectedSchool=s.id;renderSchools();detail('Selected school',s.label,'A school chosen by a family in this export. Its location is shown here; the export does not contain every school available in the market.')}
 function fitMarket(){
  if(!map||!geo)return;
  if(renderMode==='overview'){showAllMarkets();return}if(renderMode==='conditional'){drawConditional(nodeData.markets.find(m=>String(m.id)===selectedMarket));return}
  const m=currentMarket();map.fitBounds(m.cells.map(c=>[c.lat,c.lon]),{paddingTopLeft:[42,85],paddingBottomRight:[42,65],maxZoom:12});
 }
 function drawMarket(){
  if(!geo)return;renderMode='market';selectedSchool=undefined;el('market-select').value=selectedMarket;el('interactive-map-wrap').classList.remove('is-overview');
  const m=currentMarket();summary(m);
  el('geo-measure').hidden=false;const nodeMarket=nodeData.markets.find(x=>String(x.id)===selectedMarket);el('choice-map-option').disabled=!nodeMarket;el('map-measure').disabled=false;
  if(measure==='choice'&&!nodeMarket)measure='density';el('map-measure').value=measure;el('choice-heatmap-controls').hidden=measure!=='choice';el('choice-legend').hidden=measure!=='choice';el('density-legend').hidden=measure!=='density';
  if(measure==='choice'){drawConditional(nodeMarket);return;}
  el('school-legend-label').textContent='Sampled schools';
  el('map-status').textContent='Home areas use approximately 2 km cells. These are not school-choice boundaries.';
  el('toggle-schools').disabled=false;el('toggle-areas').disabled=false;
  el('area-detail').hidden=true;el('map-hint').hidden=false;
  el('map-hint').textContent=m.schools.length+' sampled schools · choose a marker or home area';
  if(map){
   layers.clearLayers();choiceLayers.clearLayers();
   homeLayers=L.layerGroup();schoolLayers=L.layerGroup();
   if(areasVisible)homeLayers.addTo(layers);if(schoolsVisible)schoolLayers.addTo(layers);
   const latHalf=geo.cellKm/111.32/2,lonHalf=geo.cellKm/(111.32*Math.cos(34*Math.PI/180))/2;
   for(const c of m.cells){
    const rectangle=L.rectangle([[c.lat-latHalf,c.lon-lonHalf],[c.lat+latHalf,c.lon+lonHalf]],{color:'#aabbd4',weight:1.2,fillColor:measure==='density'?densityColor(c.count):'#8fa6c7',fillOpacity:measure==='density'?.8:.18}).addTo(homeLayers);
    rectangle.bindTooltip(c.count+' origin '+(c.count===1?'record':'records')+' · approximate area');
    rectangle.on('click',()=>{selectedSchool=undefined;renderSchools();detail('Approximate home area',c.count+' residential origin '+(c.count===1?'record':'records'),'Grouped into an approximately 2 km cell. The color counts records in the archived sample; it does not represent a school-choice probability or local population density. Treatment is reported for the market, not this cell.')});
   }
   fitMarket();renderSchools();
  }
  drawFamilySelector();
 }
 function renderSchools(){
  if(!map||!schoolLayers||renderMode!=='market')return;
  schoolLayers.clearLayers();const m=currentMarket();if(!m)return;
  const zoom=map.getZoom(),grid=zoom<13?64:20,groups=new Map();
  for(const s of m.schools){const p=map.project([s.lat,s.lon],zoom),key=Math.floor(p.x/grid)+':'+Math.floor(p.y/grid);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(s)}
  for(const members of groups.values()){
   if(members.length===1){const s=members[0];L.marker([s.lat,s.lon],{icon:L.divIcon({className:'school-pin'+(s.id===selectedSchool?' is-selected':''),html:'<span class="school-dot"></span>',iconSize:[16,16],iconAnchor:[8,8]}),title:s.label,alt:s.label,keyboard:true}).addTo(schoolLayers).bindTooltip(esc(s.label)).on('click',()=>selectSchool(s));continue}
   const center=[members.reduce((a,s)=>a+s.lat,0)/members.length,members.reduce((a,s)=>a+s.lon,0)/members.length];
   L.marker(center,{icon:L.divIcon({className:'school-cluster'+(members.some(s=>s.id===selectedSchool)?' is-selected':''),html:'<span>'+members.length+'</span>',iconSize:[38,38],iconAnchor:[19,19]}),title:members.length+' schools — zoom to explore',alt:members.length+' schools — zoom to explore',keyboard:true}).addTo(schoolLayers).bindTooltip(members.length+' schools · click to explore').on('click',()=>{
    if(map.getZoom()<15){map.setView(center,Math.min(map.getZoom()+2,15));return}
    detail('School group',members.length+' schools close together','<span class="cluster-school-list">'+members.map(s=>'<button type="button" data-cluster-school="'+esc(s.id)+'">'+esc(s.label)+'</button>').join('')+'</span>');
    el('area-detail').querySelectorAll('[data-cluster-school]').forEach(button=>button.addEventListener('click',()=>selectSchool(members.find(s=>s.id===button.dataset.clusterSchool))));
   });
  }
 }
 function drawFamilySelector(){const families=choiceData.families.filter(f=>String(f.market)===selectedMarket);if(!families.length){if(!choiceData.invalid)pending(choiceData.families.length?'No verified family profiles are available for this market yet. Choose a market with a matched model export.':undefined);return;}if(!families.some(f=>f.id===selectedFamily))selectedFamily=families[0].id;el('family-panel-content').innerHTML=`<label for="family-select" class="family-control-label">Choose an anonymous family</label><select id="family-select">${families.map(f=>`<option value="${esc(f.id)}">${esc(f.label)}</option>`).join('')}</select><div id="family-results"></div>`;el('family-select').value=selectedFamily;el('family-select').addEventListener('change',e=>{selectedFamily=e.target.value;drawFamily()});drawFamily();}
 function drawFamily(){renderMode='family';el('area-detail').hidden=false;el('map-hint').hidden=true;el('toggle-schools').disabled=true;el('toggle-areas').disabled=true;el('school-legend-label').textContent='Full school menu';const f=choiceData.families.find(f=>f.id===selectedFamily);if(!f)return;const result=ChoiceEngine.compare(f,treated);el('family-results').innerHTML=`<div class="family-assignment">Observed RCT assignment: <strong>${f.assignment==='treated'?'treatment':'control'}</strong><br>${[1,3].includes(f.baseType)?'SEP-eligible':'Non-SEP'} · location shown at approximately ${(f.locationResolutionM/1000).toFixed(1)} km resolution</div><span class="family-control-label">Hypothetical information state</span><div class="treatment-toggle" role="group" aria-label="Hypothetical family treatment"><button type="button" id="family-untreated" aria-pressed="${!treated}">Without treatment</button><button type="button" id="family-treated" aria-pressed="${treated}">With treatment</button></div><p class="equation-note">The same family and school menu in both cases. This toggle does not change its observed assignment.</p><div class="family-expected" aria-live="polite"><span>Expected attended-school quality</span><strong>${result.expectedQuality.toFixed(3)} SD</strong></div><div class="probability-key"><span><i class="key-square baseline-key"></i> Without</span><span><i class="key-square policy-key"></i> With treatment</span></div><div aria-live="polite">${result.shown.map(s=>`<div class="probability-row"><button type="button" data-school-choice="${esc(s.id)}"><span>${esc(s.label)}</span><strong>${pct(s.probability)}</strong></button><div class="probability-track control"><span style="width:${100*s.controlProbability}%"></span></div><div class="probability-track"><span style="width:${100*s.treatedProbability}%"></span></div><small>Without ${pct(s.controlProbability)} · with ${pct(s.treatedProbability)} · ${delta(s.change)}<br>Quality ${s.quality.toFixed(2)} SD · payment ${s.paymentModelUnits.toFixed(3)} ${esc(choiceData.source.paymentUnit)} · about ${s.distanceKmApprox.toFixed(1)} km driving</small></div>`).join('')}${result.otherCount?`<div class="probability-row"><h3>All other schools (${result.otherCount}) · ${pct(result.otherProbability)}</h3><small>Without ${pct(result.otherControl)} · with ${pct(result.otherTreated)}</small></div>`:''}</div><details><summary>Fitted treatment parameters</summary><p>κ ${f.parameters.kappa.toFixed(4)} · ψ quality ${f.parameters.psiQuality.toFixed(4)} · ψ payment ${f.parameters.psiPayment.toFixed(4)} · ψ distance ${f.parameters.psiDistance.toFixed(4)}</p><p>${esc(choiceData.source.modelVersion)}. Probabilities use all ${f.schools.length} schools; the same five leading options are shown in both states. Display distances are rounded. School characteristics remain fixed.</p></details>`;
 el('family-untreated').addEventListener('click',()=>{treated=false;drawFamily()});el('family-treated').addEventListener('click',()=>{treated=true;drawFamily()});el('family-results').querySelectorAll('[data-school-choice]').forEach(b=>b.addEventListener('click',()=>{const s=f.schools.find(s=>s.id===b.dataset.schoolChoice);if(map){map.panTo(s.location);el('area-detail').innerHTML=`<h3>${esc(s.label)}</h3><p>Choice probability: ${pct(s.controlProbability)} without treatment, ${pct(s.treatedProbability)} with treatment. This prediction accounts for every alternative in the family’s market.</p>`}}));
 if(map){layers.clearLayers();choiceLayers.clearLayers();for(const school of f.schools){L.circleMarker(school.location,{radius:3.5,color:'#fff',weight:.7,fillColor:'#71829c',fillOpacity:.6}).addTo(choiceLayers).bindTooltip(esc(school.label))}L.circle(f.approxLocation,{radius:f.locationResolutionM/2,color:'#142654',weight:2,fillOpacity:.15}).addTo(choiceLayers).bindTooltip(esc(f.label)+' · approximate home area');for(const s of result.shown){const p=treated?s.treatedProbability:s.controlProbability;L.polyline([f.approxLocation,s.location],{color:treated?'#2448e3':'#71829c',weight:Math.max(1,p*14),opacity:.65,dashArray:'5 5'}).addTo(choiceLayers);L.circleMarker(s.location,{radius:5+10*Math.sqrt(p),color:'#fff',weight:1,fillColor:treated?'#2448e3':'#71829c',fillOpacity:.85}).addTo(choiceLayers).bindTooltip(`${esc(s.label)} · ${pct(p)}`)}el('area-detail').innerHTML='<h3>A family’s school menu</h3><p>Line widths encode choice probabilities, not travel routes. The displayed home area and distances are approximate. Exact model distances were used to calculate the probabilities before export.</p>';}
 }
 function changeView(next){
  if(!geo)return;view=next;
  el('interactive-map-wrap').hidden=next!=='interactive';el('published-map').hidden=next!=='published';
  el('view-interactive').setAttribute('aria-pressed',String(next==='interactive'));el('view-published').setAttribute('aria-pressed',String(next==='published'));
  el('geo-measure').hidden=next==='published';el('choice-heatmap-controls').hidden=true;
  if(next==='published'){selectedMarket='312';el('market-select').value='312';drawFamilySelector();summary({label:'Santiago · paper figure',total:670,treated:448,control:222,published:true})}
  else requestAnimationFrame(()=>{map?.invalidateSize();drawMarket()});
 }
 function showAllMarkets(){
  if(!geo||!map)return;
  view='interactive';el('interactive-map-wrap').hidden=false;el('published-map').hidden=true;
  el('view-interactive').setAttribute('aria-pressed','true');el('view-published').setAttribute('aria-pressed','false');
  el('geo-measure').hidden=true;el('choice-heatmap-controls').hidden=true;el('choice-legend').hidden=true;el('density-legend').hidden=true;
  map.invalidateSize();renderMode='overview';selectedOrigin=undefined;pending('Choose a market to explore the geographic sample and the model’s preference parameters.');layers.clearLayers();choiceLayers.clearLayers();el('market-select').value='all';el('interactive-map-wrap').classList.add('is-overview');
  el('toggle-schools').disabled=true;el('toggle-areas').disabled=true;
  el('area-detail').hidden=true;el('map-hint').hidden=false;el('map-hint').textContent='Choose a market · circles show its exported record count';
  el('school-legend-label').textContent='Market sample centers';
  el('map-status').textContent='Points show the centers of exported residential areas, not market boundaries.';
  const centers=geo.markets.map(m=>{
   const n=m.cells.reduce((a,c)=>a+c.count,0),center=[m.cells.reduce((a,c)=>a+c.lat*c.count,0)/n,m.cells.reduce((a,c)=>a+c.lon*c.count,0)/n];
   L.marker(center,{icon:L.divIcon({className:'market-pin',html:'<span>'+m.total+'</span>',iconSize:[46,46],iconAnchor:[23,23]}),title:m.label,alt:m.label,keyboard:true}).addTo(layers).bindTooltip(esc(m.label),{permanent:true,direction:m.id==='340'?'bottom':m.id==='49'?'left':'right',className:'market-label'}).on('click',()=>{selectedMarket=m.id;el('market-select').value=m.id;drawMarket()});return center;
  });
  map.fitBounds(centers,{paddingTopLeft:[70,100],paddingBottomRight:[100,90]});
  summary({label:'Six available markets',total:geo.records,treated:geo.markets.reduce((a,m)=>a+m.treated,0),control:geo.markets.reduce((a,m)=>a+m.control,0)});
 }

 function drawConditional(m){
  renderMode='conditional';layers.clearLayers();choiceLayers.clearLayers();el('area-detail').hidden=true;el('map-hint').hidden=false;el('toggle-schools').disabled=true;el('toggle-areas').disabled=true;
  el('school-legend-label').textContent='Full model school menu';el('map-status').textContent='Representative model locations, not observed household addresses. School conditions fixed; probabilities describe demand, not admission.';
  if(!m.schools.some(s=>s.id===choiceSchool))choiceSchool=m.schools[0].id;
  el('choice-school').innerHTML=m.schools.map(s=>'<option value="'+esc(s.id)+'">'+esc(s.label)+'</option>').join('');el('choice-school').value=choiceSchool;
  if(selectedOrigin&&m.origins.some(o=>o.id===selectedOrigin))showOrigin(m,m.origins.find(o=>o.id===selectedOrigin));else el('family-panel-content').innerHTML='<p>Select a representative residential area on the map to compare its full school menu.</p>';
  const vals=ConditionalChoice.values(m,choiceSchool,choiceType,choiceState),max=ConditionalChoice.domain(m,choiceState),change=choiceState==='change';
  const color=v=>{if(v===null)return '#afb5be';const t=Math.min(1,Math.abs(v)/max),a=change?[250,247,242]:[243,239,255],b=change&&v<0?[212,90,50]:[65,61,180];return '#'+a.map((x,i)=>Math.round(x+(b[i]-x)*t).toString(16).padStart(2,'0')).join('');};
  for(const o of vals){const dy=o.resolutionM/1000/111.32/2,dx=dy/Math.cos(o.lat*Math.PI/180);L.rectangle([[o.lat-dy,o.lon-dx],[o.lat+dy,o.lon+dx]],{color:'#fff',weight:1,fillColor:color(o.value),fillOpacity:.85,dashArray:o.value===null?'3 3':undefined}).addTo(choiceLayers).bindTooltip(esc(o.label)+' · '+(o.value===null?'No verified prediction':change?delta(o.value):pct(o.value))).on('click',()=>showOrigin(m,o));}
  for(const s of m.schools)L.circleMarker([s.lat,s.lon],{radius:s.id===choiceSchool?9:3,color:'#fff',weight:1,fillColor:s.id===choiceSchool?'#20d8bd':'#8792a9',fillOpacity:.9}).addTo(choiceLayers).bindTooltip(esc(s.label)).on('click',()=>{choiceSchool=s.id;drawConditional(m);});
  el('choice-coverage').textContent=vals.filter(v=>v.value!==null).length+' of '+vals.length+' representative areas have a verified prediction for this family type.';
  el('map-hint').textContent='Choose a residential area to compare its complete school menu';
  el('choice-legend').innerHTML='<div class="choice-legend-bar '+(change?'is-change':'')+'"></div><div class="choice-legend-scale"><span>'+(change?delta(-max):'0%')+'</span>'+(change?'<span>0</span>':'')+'<span>'+(change?delta(max):pct(max))+'</span></div><p>'+(change?'Treated minus untreated probability.':'Conditional probability of choosing the selected school.')+' Fixed scale across family types and information states. Gray areas have no verified prediction.</p>';
  map.fitBounds(m.origins.map(o=>[o.lat,o.lon]),{padding:[45,70],maxZoom:12});
 }
 function showOrigin(m,o){
  selectedOrigin=o.id;el('family-panel-content').innerHTML='<p>No verified school-choice prediction is available for this residential area and family type.</p>';
  const menu=ConditionalChoice.menu(m,o.id,choiceType);
  if(!menu){detail('Representative residential area',o.label,'A verified prediction for this family type is not available here.');return;}
  const ordered=[...menu].sort((a,b)=>Math.max(b.untreated,b.treated)-Math.max(a.untreated,a.treated));
  detail('Representative residential area',o.label,'Each column sums to 100% over all schools. Information changes the choice probabilities; the school menu stays fixed.');
  el('family-panel-content').innerHTML='<h3>'+esc(o.label)+'</h3><p class="choice-map-note">Full menu · '+menu.length+' schools. A hypothetical family with the selected characteristics, not an observed RCT participant.</p><div class="choice-menu"><table><caption>School-choice probability</caption><thead><tr><th scope="col">School</th><th scope="col">Without</th><th scope="col">With</th><th scope="col">Change</th></tr></thead><tbody>'+ordered.map(s=>'<tr><th scope="row">'+esc(s.label)+'</th><td>'+pct(s.untreated)+'</td><td>'+pct(s.treated)+'</td><td>'+delta(s.change)+'</td></tr>').join('')+'</tbody></table></div><p class="choice-map-note">Expected school VA: '+menu.reduce((a,s)=>a+s.quality*s.untreated,0).toFixed(3)+' SD without treatment; '+menu.reduce((a,s)=>a+s.quality*s.treated,0).toFixed(3)+' SD with treatment.</p>';
 }
 el('map-measure').addEventListener('change',e=>{measure=e.target.value;drawMarket()});
 el('choice-school').addEventListener('change',e=>{choiceSchool=e.target.value;drawMarket()});
 el('choice-type').addEventListener('change',e=>{choiceType=Number(e.target.value);drawMarket()});
 document.querySelectorAll('[data-choice-state]').forEach(b=>b.addEventListener('click',()=>{choiceState=b.dataset.choiceState;document.querySelectorAll('[data-choice-state]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));drawMarket()}));

 el('market-select').addEventListener('change',e=>{selectedOrigin=undefined;if(e.target.value==='all'){showAllMarkets();return}selectedMarket=e.target.value;if(view==='published')changeView('interactive');else drawMarket()});
 el('view-interactive').addEventListener('click',()=>changeView('interactive'));
 el('view-published').addEventListener('click',()=>changeView('published'));
 el('all-markets').addEventListener('click',showAllMarkets);
 el('fit-market').addEventListener('click',fitMarket);
 el('map-tone').addEventListener('click',()=>{const dark=el('interactive-map-wrap').classList.toggle('is-dark');el('map-tone').setAttribute('aria-pressed',String(dark))});
 el('toggle-schools').addEventListener('click',()=>{if(!schoolLayers||renderMode!=='market')return;schoolsVisible=!schoolsVisible;el('toggle-schools').setAttribute('aria-pressed',String(schoolsVisible));if(schoolsVisible)schoolLayers.addTo(layers);else layers.removeLayer(schoolLayers)});
 el('toggle-areas').addEventListener('click',()=>{if(!homeLayers||renderMode!=='market')return;areasVisible=!areasVisible;el('toggle-areas').setAttribute('aria-pressed',String(areasVisible));if(areasVisible)homeLayers.addTo(layers);else layers.removeLayer(homeLayers)});
 window.addEventListener('hashchange',()=>{if(location.hash==='#places'){initialize();requestAnimationFrame(()=>map?.invalidateSize())}});
 if(location.hash==='#places')initialize();else pending();
})();
