'use strict';
window.POLICY_DATA = {
  sourceVersion: 'September 2026 manuscript',
  baseline: { title:'Information, at scale', tag:'100% take-up', values:[[.558,.680,.619,.723],[.298,.483,.407,.526],[.512,.656,.588,.702]], effects:[[0,.122,.062,.166],[0,.186,.109,.229],[0,.144,.076,.191]], se:[[null,.046,.025,.041],[null,.075,.059,.061],[null,.085,.059,.076]] },
  takeup75: { title:'Reaching three in four families', tag:'75% take-up', values:[[.558,.651,.607,.691],[.298,.440,.385,.482],[.512,.622,.573,.664]] },
  takeup50: { title:'Reaching half of eligible families', tag:'50% take-up', values:[[.558,.622,.594,.655],[.298,.396,.361,.433],[.512,.588,.556,.621]] },
  sepOnly: { title:'Target disadvantaged families', tag:'SEP families only', values:[[.558,.621,.595,.655],[.298,.483,.442,.517],[.512,.512,.487,.552]] },
  nonSepOnly: { title:'Target other eligible families', tag:'Non-SEP families only', values:[[.558,.616,.588,.638],[.298,.298,.272,.331],[.512,.656,.618,.671]] },
  cost10: { title:'When quality is more costly', tag:'+10% marginal cost', values:[[.558,.680,.619,.615],[.298,.483,.407,.444],[.512,.656,.588,.599]], effects:[[0,.122,.062,.057],[0,.186,.109,.147],[0,.144,.076,.087]] },
  publicResponds: { title:'If public schools also respond', tag:'Public-school response', values:[[.558,.680,.619,.771],[.298,.483,.407,.600],[.512,.656,.588,.749]] }
};
