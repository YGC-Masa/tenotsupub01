/* v039_159: split member story menu label into affection Lv and raw title */
(function(){
  "use strict";
  window.TENOTSU_V039 = window.TENOTSU_V039 || {};
  const ns = window.TENOTSU_V039;
  const LV_TITLE_RE = /親愛Lv\.([0-9]{1,3})[：:]\s*([^\n\r]+)/;
  const SLOT_RE = /^(キー|ｷｰ|メイン|ﾒｲﾝ)[\-－]?[0-9０-９]+$/;
  function z2(v){
    const n = String(v || "").replace(/[０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0)-0xFEE0));
    return n.length === 1 ? "0" + n : n;
  }
  function nearestLvContainer(node){
    let el = node && (node.nodeType === 1 ? node : node.parentElement);
    for(let i=0; el && i<8; i++, el=el.parentElement){
      const t = el.textContent || "";
      if(LV_TITLE_RE.test(t)) return el;
    }
    return null;
  }
  function patchTextNodes(root){
    if(!root || !document.body) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const parent = node.parentElement;
        if(!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if(tag === "SCRIPT" || tag === "STYLE" || tag === "TEXTAREA" || tag === "INPUT") return NodeFilter.FILTER_REJECT;
        const t = (node.nodeValue || "").trim();
        if(!t) return NodeFilter.FILTER_REJECT;
        if(SLOT_RE.test(t) || LV_TITLE_RE.test(t)) return NodeFilter.FILTER_ACCEPT;
        return NodeFilter.FILTER_REJECT;
      }
    });
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      const raw = node.nodeValue || "";
      const trimmed = raw.trim();
      if(SLOT_RE.test(trimmed)){
        const box = nearestLvContainer(node);
        const m = box && (box.textContent || "").match(LV_TITLE_RE);
        if(m){
          node.nodeValue = raw.replace(trimmed, "親愛Lv." + z2(m[1]));
        }
        return;
      }
      const m = raw.match(LV_TITLE_RE);
      if(m){
        node.nodeValue = raw.replace(LV_TITLE_RE, m[2].trim());
      }
    });
  }
  let scheduled = false;
  function schedulePatch(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      patchTextNodes(document.body);
    });
  }
  ns.splitStoryMenuLvAndTitle = schedulePatch;
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", schedulePatch);
  }else{
    schedulePatch();
  }
  const mo = new MutationObserver(schedulePatch);
  mo.observe(document.documentElement, {childList:true, subtree:true, characterData:true});
})();
