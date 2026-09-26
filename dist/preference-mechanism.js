'use strict';
// Rounded values in ModelParameters_R2.tex; HS quality is an increment to the <HS coefficient.
(function(root){
 const types={1:{q:1.40-.33,p:-2.70-1.47,d:-1.29-.06,sep:true},2:{q:1.40,p:-2.70,d:-1.29,sep:false},3:{q:1.40+.56-.33,p:-.56-1.47,d:-1.09-.06,sep:true},4:{q:1.40+.56,p:-.56,d:-1.09,sep:false}};
 function coefficients(type,treated){
  const base=types[type];if(!base)throw Error('Unsupported family type.');
  const treatment=base.sep?{kappa:1.410,q:.500,p:0,d:.427}:{kappa:1.258,q:.399,p:-.148,d:.061};
  const values={q:base.q,p:base.p,d:base.d,sigma:.85};
  if(treated){for(const key of ['q','p','d'])values[key]=treatment.kappa*values[key]+treatment[key];values.sigma*=treatment.kappa;}
  return {values,kappa:treated?treatment.kappa:1,base,treatment};
 }
 const api={coefficients};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PreferenceMechanism=Object.freeze(api);
})(globalThis);

