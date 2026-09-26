'use strict';
(() => {
 const root=document.getElementById('va-distributions');
 const image=document.getElementById('distribution-image');
 const buttons=[...root.querySelectorAll('[data-distribution]')];
 const error=document.getElementById('distribution-error');
 const setText=(id,text)=>{document.getElementById(id).textContent=text;};
 image.addEventListener('error',()=>{error.hidden=false;image.hidden=true;});
 image.addEventListener('load',()=>{error.hidden=true;image.hidden=false;});
 fetch('distributions.json').then(response=>{
  if(!response.ok)throw new Error('Paper figures unavailable');
  return response.json();
 }).then(data=>{
  if(data.schemaVersion!==1||data.figures.length!==4)throw new Error('Unrecognized paper figure manifest');
  const select=id=>{
   const figure=data.figures.find(item=>item.id===id);
   if(!figure)throw new Error('Unknown published comparison');
   root.dataset.selectedDistribution=id;
   setText('distribution-view-title',figure.title);
   setText('distribution-assumptions',figure.assumptions);
   setText('distribution-caption',figure.caption);
   setText('distribution-summary',figure.summary);
   image.alt=figure.alt;
   image.hidden=false;
   image.src=figure.image;
   document.getElementById('distribution-original').href=figure.original;
   buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.distribution===id)));
  };
  buttons.forEach(button=>{button.disabled=false;button.addEventListener('click',()=>select(button.dataset.distribution));});
  select('equilibrium');
 }).catch(()=>{
  error.textContent='The paper figures could not be loaded. You can still read the distributions in the paper.';
  error.hidden=false;
  image.hidden=true;
  document.getElementById('distribution-original').href='paper.pdf';
 });
})();
