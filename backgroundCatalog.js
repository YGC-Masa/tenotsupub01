(function(){
  "use strict";
  window.TENOTSU_V039 = window.TENOTSU_V039 || {};
  const ns = window.TENOTSU_V039;
  ns.VERSION = window.TENOTSU_BUILD_VERSION || ns.VERSION || "v039_143";
  ns.BUILD_LABEL = window.TENOTSU_BUILD_LABEL || ns.BUILD_LABEL || "v039_143";
  ns.state = ns.state || { mode:"boot", officeSelection:[], frontCharacter:null, bootedAt:Date.now() };
  ns.state.mode = ns.state.mode || "boot";
  ns.setMode = function(mode){
    ns.state.mode = mode;
    document.body.dataset.v039Mode = mode;
    ["boot","office","story","shop","battle","rivalBattle","members","settings","town","storeStatus","tuning","eventBattle","storyMenu"].forEach(m=>document.body.classList.toggle("v039-mode-"+m,mode===m));
    try{ if(window.TenotsuStamina&&typeof window.TenotsuStamina.renderHud==="function") window.TenotsuStamina.renderHud(); }catch(_){}
  };
})();
