'use strict';
window.ExperimentGuide=(()=>{
  const stories={
    1:{name:'Silvia',role:'A mother choosing for her son',label:'Mother',experience:'Silvia transferred her second-grade son to a school with higher test scores to give him a better education.',message:'Compare schools and choose deliberately.',purpose:'Her experience gives parents a concrete example of acting on differences in school performance.',alt:'Original intervention still of Silvia, the mother whose school-choice experience appears in the video.'},
    9:{name:'Felix',role:'A computer engineering student',label:'Student',experience:'Felix attended a strong high school in a low-income neighborhood and was completing a degree in computer engineering.',message:'Higher education can be within reach.',purpose:'His story makes the path from a similar background to higher education tangible for families.',alt:'Original intervention still of Felix, the computer engineering student featured in the video.'},
    17:{name:'Rose Marie',role:'A bank employee with vocational training',label:'Professional',experience:'Rose Marie came from a disadvantaged background, completed vocational training, and held a stable job at a bank. Her story connected her schooling to those opportunities.',message:'Education can open paths to better work.',purpose:'Her experience illustrates a vocational route from education to employment.',alt:'Original intervention still of Rose Marie, the bank employee featured in the video.'}
  };
  const order=['1','9','17'];
  const storyText=id=>{const s=stories[id];return `<p class="eyebrow">${s.label.toUpperCase()}</p><h3>${s.name}</h3><p class="rct-story-role">${s.role}</p><p>${s.experience}</p><div class="rct-message"><h4>Message to families</h4><p>${s.message}</p></div><p>${s.purpose}</p>`};
  function render(){return `
<div class="experiment-stats"><div><strong>143</strong><span>preschools randomized</span></div><div><strong>1,832</strong><span>parents at baseline</span></div><div><strong>2010</strong><span>intervention in Chile</span></div></div>
<section class="rct-section" aria-labelledby="rct-actors-title">
<div class="section-heading"><p class="eyebrow">PARTICIPANTS AND ROLES</p><h2 id="rct-actors-title">Who took part?</h2><p>The study reached families at regular preschool parent meetings in urban Valparaíso, Biobío, and Santiago.</p></div>
<div class="rct-actors">
<article><span class="rct-role-label">THE DECISION</span><h3>Families and children</h3><p>Parents were choosing a primary school for their child. Integra’s oldest preschool cohort had to move to a new school because the network does not offer primary education.</p></article>
<article><span class="rct-role-label">THE MEETING PLACE</span><h3>Fundación Integra</h3><p>The public preschool network provided an existing setting to reach families in low-income communities. Assignment to treatment or control was made at the preschool level.</p></article>
<article><span class="rct-role-label">THE IMPLEMENTATION</span><h3>Trained study staff</h3><p>Staff visited parent meetings, collected consent and baseline surveys, and delivered the information package in treatment preschools. Researchers later followed school choices and children’s outcomes.</p></article>
</div></section>
<section class="rct-section rct-design" aria-labelledby="rct-design-title">
<div class="section-heading"><p class="eyebrow">EXPERIMENTAL DESIGN</p><h2 id="rct-design-title">The same setting, a different information offer</h2></div>
<ol class="rct-timeline">
<li><span class="rct-step" aria-hidden="true">01</span><div><h3>Assign preschools</h3><p>Researchers randomized 143 eligible centers before scheduling visits. Of these, 133 participated.</p></div></li>
<li><span class="rct-step" aria-hidden="true">02</span><div><h3>Meet families</h3><p>From August to December 2010, parents gave consent and completed a baseline survey before any study information was provided.</p></div></li>
<li><span class="rct-step" aria-hidden="true">03</span><div><h3>Follow the school choice</h3><p>In 2011, the team surveyed families about enrollment and linked participants to administrative records.</p></div></li>
</ol>
<div class="rct-arms">
<article class="rct-arm rct-treated"><p class="rct-role-label">TREATMENT PRESCHOOLS</p><h3>School-choice information at the meeting</h3><ul><li>Discussion of why the school choice matters.</li><li>A short video featuring relatable role models.</li><li>A local school report card and map.</li><li>Time for questions about choosing a school.</li></ul></article>
<article class="rct-arm"><p class="rct-role-label">CONTROL PRESCHOOLS</p><h3>An end-of-year discussion</h3><p>Families completed the study surveys, but were not offered the study’s school-choice information package at the meeting.</p><p>Both groups were followed to compare subsequent choices and outcomes.</p></article>
</div>
<p class="rct-design-note"><strong>What was randomized?</strong> The preschool’s information offer—not an individual child’s school placement. In 2010, primary schools managed their own admissions, and families made their enrollment choices.</p>
<details class="methods"><summary>Assignment, follow-up, and what the comparison identifies</summary><p>Assignment was stratified by region, grades offered, and local school competition. Ten eligible centers could not be visited because of refusal, scheduling, or expected attendance. Study visits were not announced in advance, so parents could not attend in anticipation of the intervention.</p><p>The original design included two treatment intensities, but implementation records do not reliably separate them. The paper therefore estimates the effect of assignment to the pooled information package. It does not isolate the effect of the video, an individual story, or the report card.</p><p>The May–July 2011 follow-up reached 1,612 of 1,832 baseline respondents (88%); 1,795 participants were matched to administrative records (98%). The structural estimation uses a smaller, matched sample of 815 families who had not yet enrolled.</p><p><a href="paper.pdf" target="_blank" rel="noopener">Paper: experimental design and data ↗</a> · <a href="appendix.pdf" target="_blank" rel="noopener">Appendix: implementation and samples ↗</a></p></details>
</section>
<section class="rct-section" aria-labelledby="rct-stories-title">
<div class="section-heading"><p class="eyebrow">INSIDE THE INFORMATION PACKAGE</p><h2 id="rct-stories-title">The role models and their messages</h2><p>The video featured three people from low-income backgrounds. Select a story to see how it connected school choice to a child’s future.</p></div>
<div class="rct-story-picker" role="group" aria-label="Choose a role model from the intervention video">${order.map(id=>`<button type="button" data-still="${id}" aria-pressed="${id==='1'}" aria-controls="rct-story-detail intervention-still"><strong>${stories[id].name}</strong><span>${stories[id].label}</span></button>`).join('')}</div>
<article class="rct-story-view">
<figure class="rct-story-figure"><img class="video-still" id="intervention-still" src="assets/1.png" alt="${stories[1].alt}" width="1403" height="1080"><figcaption class="video-caption"><span id="still-caption">Silvia · original intervention still</span><span>SPANISH</span></figcaption></figure>
<div class="rct-story-detail" id="rct-story-detail" aria-live="polite" aria-atomic="true">${storyText('1')}</div>
</article>
<p class="fine-print">The messages above are English summaries of the presentation slides and paper, not quotations. These are original video stills; the full treatment video is not yet available on this site.</p>
<div class="rct-message-context"><h3>Why pair personal stories with school information?</h3><p>The video emphasized children’s future education and employment, making the possible benefits of school quality more salient and attainable. It also showed descriptive evidence on returns to tertiary education and the association between primary-school quality and later higher education. Those comparisons were not presented as causal estimates.</p></div>
</section>
<section class="rct-section rct-report" aria-labelledby="rct-report-title">
<div class="rct-report-copy"><p class="eyebrow">FROM THE MESSAGE TO LOCAL OPTIONS</p><h2 id="rct-report-title">What could a family compare?</h2><p>The report card and map made nearby alternatives concrete. The card covered up to 30 schools in the lowest three socioeconomic categories within 2 km of the preschool.</p><dl><div><dt>Academic performance</dt><dd>Average mathematics and reading SIMCE scores from 2006–2009, plus score trends. Green and red indicated scores above or below the national mean.</dd></div><div><dt>Cost and school type</dt><dd>Official tuition and public/private status. Actual family payments could differ because of discounts and additional costs.</dd></div><div><dt>Location</dt><dd>School addresses and a neighborhood map to help parents locate and compare nearby options.</dd></div></dl><p class="rct-measure-note"><strong>What families saw:</strong> raw school test scores. <strong>What the paper evaluates:</strong> school value added, an estimate of the school’s contribution to achievement after accounting for student characteristics.</p></div>
<div class="rct-report-material"><div class="rct-material-picker" role="group" aria-label="Choose an original intervention handout"><button type="button" data-handout="report" aria-pressed="true" aria-controls="rct-handout">School comparison</button><button type="button" data-handout="map" aria-pressed="false" aria-controls="rct-handout">Neighborhood map</button></div><figure id="rct-handout"><a id="rct-handout-link" href="assets/cartilla_back.png" target="_blank" rel="noopener" aria-label="Open the original school comparison report at full size"><img id="rct-handout-image" src="assets/cartilla_back.png" alt="Original Spanish report card comparing schools by test scores, costs, and school type." loading="lazy"></a><figcaption id="rct-handout-caption">Original school comparison report · select the image to enlarge</figcaption></figure></div>
</section>
<p class="rct-source-note">Sources: <a href="paper.pdf" target="_blank" rel="noopener">paper, experimental design ↗</a>; <a href="appendix.pdf" target="_blank" rel="noopener">online appendix, treatment materials ↗</a>. Role-model names and the meeting comparison also follow the research presentation slides.</p>`}
  function init(){
    document.querySelectorAll('[data-still]').forEach(button=>button.addEventListener('click',()=>{
      const id=button.dataset.still,s=stories[id];
      document.getElementById('intervention-still').src='assets/'+id+'.png';
      document.getElementById('intervention-still').alt=s.alt;
      document.getElementById('intervention-still').width=id==='1'?1403:1407;
      document.getElementById('still-caption').textContent=s.name+' · original intervention still';
      document.getElementById('rct-story-detail').innerHTML=storyText(id);
      document.querySelectorAll('[data-still]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    }));
    const handouts={report:{asset:'cartilla_back.png',alt:'Original Spanish report card comparing schools by test scores, costs, and school type.',label:'school comparison report'},map:{asset:'cartilla_map.png',alt:'Original neighborhood map showing the preschool and nearby primary schools.',label:'neighborhood map'}};
    document.querySelectorAll('[data-handout]').forEach(button=>button.addEventListener('click',()=>{
      const item=handouts[button.dataset.handout],link=document.getElementById('rct-handout-link'),img=document.getElementById('rct-handout-image');
      link.href='assets/'+item.asset;link.setAttribute('aria-label','Open the original '+item.label+' at full size');
      img.src='assets/'+item.asset;img.alt=item.alt;
      document.getElementById('rct-handout-caption').textContent='Original '+item.label+' · select the image to enlarge';
      document.querySelectorAll('[data-handout]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    }));
  }
  return {render,init};
})();
