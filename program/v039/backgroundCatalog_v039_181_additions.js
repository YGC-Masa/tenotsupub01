/* v039_181 背景追加: 駅前あかり通り：夜 / 住宅街：夜
 * 既存の backgroundCatalog 本体を壊さないため、追加分だけを安全に登録する補助JSです。
 * index.html で既存 backgroundCatalog 読み込み後に、このファイルを読み込ませてください。
 */
(function(){
  "use strict";

  var additions = [
    {
      id: "akari_dori_night",
      key: "akari_dori_night",
      name: "駅前あかり通り：夜",
      title: "駅前あかり通り：夜",
      label: "駅前あかり通り：夜",
      src: "images/assets/bg/bg_akari_dori_night.png",
      path: "images/assets/bg/bg_akari_dori_night.png",
      file: "images/assets/bg/bg_akari_dori_night.png",
      area: "日和坂市",
      category: "ランドマーク",
      time: "夜",
      memo: "駅前周辺の夜景。飲食店・書店・カフェ・街路樹イルミネーションが並ぶ、明るく賑やかな通り。"
    },
    {
      id: "residential_area_night",
      key: "residential_area_night",
      name: "住宅街：夜",
      title: "住宅街：夜",
      label: "住宅街：夜",
      src: "images/assets/bg/bg_residential_area_night.png",
      path: "images/assets/bg/bg_residential_area_night.png",
      file: "images/assets/bg/bg_residential_area_night.png",
      area: "日和坂市",
      category: "ランドマーク",
      time: "夜",
      memo: "夜の住宅街。坂道、街灯、住宅の灯り、電柱と電線が見える静かな生活圏背景。"
    }
  ];

  function clone(obj){
    var out = {};
    Object.keys(obj).forEach(function(k){ out[k] = obj[k]; });
    return out;
  }

  function addToArray(arr, item){
    if (!Array.isArray(arr)) return false;
    var exists = arr.some(function(x){ return x && (x.id === item.id || x.key === item.key || x.name === item.name); });
    if (!exists) arr.push(clone(item));
    return true;
  }

  function addToObject(obj, item){
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    obj[item.id] = Object.assign({}, obj[item.id] || {}, clone(item));
    return true;
  }

  function applyAdditions(){
    window.TEN_OTSU_BG_ADDITIONS_V039_181 = additions.map(clone);
    window.TEN_OTSU_EXTRA_BACKGROUNDS = window.TEN_OTSU_EXTRA_BACKGROUNDS || [];
    additions.forEach(function(item){ addToArray(window.TEN_OTSU_EXTRA_BACKGROUNDS, item); });

    var objectCandidates = [
      "backgroundCatalog",
      "BACKGROUND_CATALOG",
      "bgCatalog",
      "BG_CATALOG",
      "storyBackgroundCatalog",
      "STORY_BACKGROUND_CATALOG",
      "TEN_OTSU_BACKGROUND_CATALOG"
    ];

    var arrayCandidates = [
      "backgroundCatalogList",
      "BACKGROUND_CATALOG_LIST",
      "bgCatalogList",
      "BG_CATALOG_LIST",
      "storyBackgroundList",
      "STORY_BACKGROUND_LIST"
    ];

    additions.forEach(function(item){
      objectCandidates.forEach(function(name){ addToObject(window[name], item); });
      arrayCandidates.forEach(function(name){ addToArray(window[name], item); });
    });

    if (window.tenOtsu && typeof window.tenOtsu === "object") {
      additions.forEach(function(item){
        addToObject(window.tenOtsu.backgroundCatalog, item);
        addToObject(window.tenOtsu.bgCatalog, item);
        addToArray(window.tenOtsu.backgroundCatalogList, item);
        addToArray(window.tenOtsu.bgCatalogList, item);
      });
    }
  }

  applyAdditions();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", applyAdditions, { once: true });
  }
})();
