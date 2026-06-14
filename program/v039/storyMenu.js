/* v039_228 recollection album separate index + seasonal category fix. Member affection / intro stories live elsewhere. */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};

  const ALBUM_TABS = [
    { id:"spring", label:"春" },
    { id:"summer", label:"夏" },
    { id:"autumn", label:"秋" },
    { id:"winter", label:"冬" },
    { id:"other", label:"その他" },
    { id:"event", label:"イベント" }
  ];

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>"]/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch])); }
  function allStories(){
    const source = Array.isArray(window.TENOTSU_RECOLLECTION_STORY_INDEX) ? window.TENOTSU_RECOLLECTION_STORY_INDEX : (Array.isArray(window.TENOTSU_STORY_INDEX) ? window.TENOTSU_STORY_INDEX : []);
    return source.slice().sort((a,b)=>(a.order||0)-(b.order||0));
  }
  function storyTypeLabel(type){ return ({ normal:"通常", key:"キー", main:"メイン" })[type] || type || "story"; }
  function characterLine(story){ return (story.characterNames || story.characters || []).join(" / ") || "-"; }

  function isAffectionStory(story){
    if (!story) return false;
    const id = String(story.id || "");
    const cat = String(story.category || "");
    const type = String(story.type || "");
    const scenario = String(story.scenario || "");
    return id.includes("affection")
      || scenario.includes("affection")
      || cat === "character_key"
      || cat === "character_main"
      || type === "key"
      || type === "main"
      || !!story.affectionLabel
      || !!story.affectionBlock;
  }

  function isIntroStory(story){
    if (!story) return false;
    const id = String(story.id || "");
    const scenario = String(story.scenario || "");
    const title = String(story.title || story.rawTitle || "");
    const cat = String(story.category || "");
    return id.startsWith("intro_")
      || /(^|\/)intro_[^/]+\.json$/i.test(scenario)
      || cat === "character_intro"
      || cat === "intro"
      || title.includes("自己紹介");
  }

  function isExcludedFromRecollection(story){
    return isAffectionStory(story) || isIntroStory(story);
  }

  function searchableText(story){
    return [story.title, story.rawTitle, story.summary, story.locationName, story.placeName, story.season, story.category, (story.tags || []).join(" ")].filter(Boolean).join(" ");
  }

  function isEventStory(story){
    const text = searchableText(story);
    const cat = String(story.category || "");
    return cat.includes("event") || cat.includes("encounter") || text.includes("イベント") || text.includes("外回り") || text.includes("encounter");
  }

  function seasonOfStory(story){
    const season = String(story.season || "").toLowerCase();
    const text = searchableText(story);
    if (season === "spring" || season === "春" || text.includes("春")) return "spring";
    if (season === "summer" || season === "夏" || text.includes("夏")) return "summer";
    if (season === "autumn" || season === "fall" || season === "秋" || text.includes("秋")) return "autumn";
    if (season === "winter" || season === "冬" || text.includes("冬")) return "winter";
    return "other";
  }

  function tabForStory(story){
    if (story && story.albumTab) return story.albumTab;
    const season = seasonOfStory(story);
    // 季節情報があるストーリーは、イベント系でも春夏秋冬へ優先分類する。
    if (season !== "other") return season;
    if (isEventStory(story)) return "event";
    return "other";
  }

  function tabLabel(tab){
    return (ALBUM_TABS.find((item) => item.id === tab) || ALBUM_TABS[4]).label;
  }

  ns.hideStoryMenuPanel = function hideStoryMenuPanel(){
    if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
  };

  ns.getStoriesForTab = function getStoriesForTab(tab){
    const activeTab = ALBUM_TABS.some((item) => item.id === tab) ? tab : "other";
    return allStories().filter((s) => {
      if (isExcludedFromRecollection(s)) return false;
      if (typeof ns.canShowInRecollection === "function" && !ns.canShowInRecollection(s)) return false;
      return tabForStory(s) === activeTab;
    });
  };

  ns.renderStoryMenu = function renderStoryMenu(tab = "other"){
    const activeTab = ALBUM_TABS.some((item) => item.id === tab) ? tab : "other";
    const stories = ns.getStoriesForTab(activeTab);
    const debugNote = window.TENOTSU_DEBUG_ALL_STORIES ? "開発用：未読・未解放も表示中" : "読了済みのみ表示";
    const tabs = ALBUM_TABS.map((item) => `<button type="button" class="tenotsu-story-menu-tab ${item.id===activeTab?"active":""}" data-story-menu-tab="${esc(item.id)}">${esc(item.label)}</button>`).join("");
    const body = stories.length ? stories.map((story) => {
      const unlocked = typeof ns.isStoryUnlocked === "function" ? ns.isStoryUnlocked(story) : true;
      const cleared = typeof ns.isStoryCleared === "function" ? ns.isStoryCleared(story.id) : false;
      const read = typeof ns.isStoryRead === "function" ? ns.isStoryRead(story.id) : false;
      const state = cleared ? "読了" : (read ? "既読" : "未読");
      const disabled = !unlocked || !story.scenario;
      return `
        <button type="button" class="tenotsu-story-menu-card ${cleared?"cleared":""} ${disabled?"locked":""}" data-story-id="${esc(story.id)}" ${disabled?"disabled":""}>
          <span class="tenotsu-story-menu-card-head">
            <b>${esc(story.title)}</b>
            <i>${esc(story.version || "")}</i>
          </span>
          <span class="tenotsu-story-menu-card-meta">${esc(storyTypeLabel(story.type))} / ${esc(story.category || "-")} / ${esc(characterLine(story))}</span>
          <span class="tenotsu-story-menu-card-summary">${esc(story.summary || "")}</span>
          <span class="tenotsu-story-menu-card-state">${unlocked ? state : "未解放"}</span>
        </button>
      `;
    }).join("") : `<div class="tenotsu-story-menu-empty">${esc(tabLabel(activeTab))}に表示できる回想ストーリーはまだありません。</div>`;

    const html = `
      <div class="tenotsu-story-menu-title">回想アルバム</div>
      <div class="tenotsu-story-menu-subtitle">読了済みの通常・季節・イベントストーリーを再生するアルバムです。親愛系はメンバー個別プロフィール、自己紹介は自己紹介メニューから確認します。</div>
      <div class="tenotsu-story-menu-tabs" data-tenotsu-recollection-tabs="true">${tabs}</div>
      <div class="tenotsu-story-menu-debug">${esc(debugNote)}</div>
      <div class="tenotsu-story-menu-list" data-tenotsu-recollection-list="true">${body}</div>
      <div class="tenotsu-story-menu-actions">
        <button type="button" class="tenotsu-town-back" data-story-menu-action="office">事務所に戻る</button>
      </div>
    `;
    ns.showTownPanel(html);
    const panel = ns.layers && ns.layers.town;
    if (!panel) return;
    panel.querySelectorAll("[data-story-menu-tab]").forEach((btn)=>btn.addEventListener("click",()=>{
      ns.renderStoryMenu(btn.dataset.storyMenuTab || "other");
    }));
    panel.querySelectorAll("[data-story-id]").forEach((btn)=>btn.addEventListener("click",()=>{
      const story = allStories().find((s)=>s.id === btn.dataset.storyId);
      if (!story || !story.scenario || (typeof ns.isStoryUnlocked === "function" && !ns.isStoryUnlocked(story))) return;
      if (typeof ns.markStoryRead === "function") ns.markStoryRead(story.id);
      if (typeof ns.startStory === "function") ns.startStory(story.scenario, { mode:"storyMenu", storyId:story.id, storyMenuTab:activeTab });
    }));
    const back = panel.querySelector('[data-story-menu-action="office"]');
    if (back) back.addEventListener("click",()=>{ ns.hideStoryMenuPanel(); ns.enterOffice({ speaker:"店長", message:"事務所に戻りました。" }); });
  };

  ns.enterStoryMenu = async function enterStoryMenu(options = {}){
    if (!options.noTransition && typeof ns.transitionTo === "function") return ns.transitionTo(()=>ns.enterStoryMenu(Object.assign({}, options, { noTransition:true })));
    ns.setMode("storyMenu");
    ns.ensureLayers();
    if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
    if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (typeof ns.hideTuningPanel === "function") ns.hideTuningPanel();
    if (typeof ns.clearCharacters === "function") ns.clearCharacters();
    if (typeof ns.setBackgroundReady === "function") await ns.setBackgroundReady(ns.paths.officeBg); else ns.setBackground(ns.paths.officeBg);
    ns.renderOfficeMenu();
    ns.renderStoryMenu(options.storyMenuTab || "other");
    ns.setText("回想アルバム", "回想アルバムを開きました。");
  };
})();
