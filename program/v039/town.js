/* v039_117 town: stamina encounter UI fix + direct season buttons */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;
  const STORAGE_KEY = "tenotsu_town_encounter_v1";

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>\"]/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch])); }
  function cfg(){ return window.TENOTSU_TOWN_ENCOUNTER_CONFIG || { seasons:[], places:[], staminaCost:10, defaultSeason:"summer" }; }
  function allStories(){ return Array.isArray(window.TENOTSU_STORY_INDEX) ? window.TENOTSU_STORY_INDEX : []; }
  function load(){
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { data = null; }
    if (!data || typeof data !== "object") data = {};
    data.version = "v039_117";
    data.currentSeason = data.currentSeason || (cfg().defaultSeason || "summer");
    data.revealedPlaces = data.revealedPlaces && typeof data.revealedPlaces === "object" ? data.revealedPlaces : {};
    return data;
  }
  function save(data){ try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {} return data; }
  function getSeason(id){ return (cfg().seasons || []).find((s) => s.id === id) || (cfg().seasons || [])[0] || { id:"summer", label:"夏" }; }
  function getPlace(id){ return (cfg().places || []).find((p) => p.id === id) || null; }
  function getUnreadEncounterStories(placeId, seasonId){
    return allStories().filter((story) => {
      if (!story || story.type !== "normal" || !story.scenario) return false;
      if (story.encounter && story.encounter.enabled === false) return false;
      if (story.placeId !== placeId) return false;
      if (story.season && story.season !== seasonId) return false;
      if (typeof ns.isStoryUnlocked === "function" && !ns.isStoryUnlocked(story)) return false;
      if (typeof ns.isStoryCleared === "function" && ns.isStoryCleared(story.id)) return false;
      return true;
    }).sort((a,b)=>(a.order||0)-(b.order||0));
  }
  function getAllEncounterStories(placeId, seasonId){
    return allStories().filter((story) => story && story.type === "normal" && story.scenario && story.placeId === placeId && (!story.season || story.season === seasonId));
  }
  function seasonOptionsHtml(currentSeason){
    return (cfg().seasons || []).map((s) => `
      <button type="button" class="tenotsu-town-season-pill ${s.id===currentSeason?"active":""}" data-town-season="${esc(s.id)}">${esc(s.label)}</button>
    `).join("");
  }
  function placeCard(place, data){
    const currentSeason = data.currentSeason;
    const enabledSeason = !place.seasons || !place.seasons.length || place.seasons.includes(currentSeason);
    const revealed = !!data.revealedPlaces[`${currentSeason}:${place.id}`];
    const unread = getUnreadEncounterStories(place.id, currentSeason);
    const all = getAllEncounterStories(place.id, currentSeason);
    const hint = !enabledSeason ? "この季節では気配が薄い" : (revealed ? (unread.length ? `未読 ${unread.length}件` : (all.length ? "新しい出会いなし" : "気配なし")) : "未確認");
    return `
      <button type="button" class="tenotsu-town-place-card ${enabledSeason?"":"disabled"} ${revealed?"revealed":""}" data-town-place="${esc(place.id)}" ${enabledSeason?"":"disabled"}>
        <span class="place-type">${esc(place.type || "場所")}</span>
        <b>${esc(place.name)}</b>
        <small>${esc(place.description || "")}</small>
        <i>${esc(hint)}</i>
      </button>
    `;
  }

  ns.renderTownSeasonTop = function renderTownSeasonTop(){
    const data = load();
    const season = getSeason(data.currentSeason);
    const places = (cfg().places || []);
    const html = `
      <div class="tenotsu-town-title">外回り</div>
      <div class="tenotsu-town-subtitle">未読の通常ストーリーを、スタミナ消費でキャラとエンカウントして見るモードです。</div>
      <div class="tenotsu-town-encounter-status">
        <div><span>現在の季節</span><b>${esc(season.label)}</b></div>
        <div class="tenotsu-town-season-pills">${seasonOptionsHtml(data.currentSeason)}</div>
        <button type="button" class="tenotsu-town-tool" data-town-tool="season">${esc((cfg().items && cfg().items.season && cfg().items.season.label) || "季節を変える")}</button>
      </div>
      <div class="tenotsu-town-place-grid">
        ${places.map((p)=>placeCard(p, data)).join("")}
      </div>
      <div class="tenotsu-town-detail" data-town-encounter-detail>
        <div class="tenotsu-town-detail-empty">場所を選択してください。アイテム使用でキャラの気配を確認できます。</div>
      </div>
      <button type="button" class="tenotsu-town-back" data-town-action="back-office">事務所に戻る</button>
    `;
    ns.showTownPanel(html);
    const panel = ns.layers.town;
    panel.querySelectorAll("[data-town-place]").forEach((btn)=>btn.addEventListener("click",()=>ns.renderTownPlaceDetail(btn.dataset.townPlace)));
    const seasonBtn = panel.querySelector('[data-town-tool="season"]');
    if (seasonBtn) seasonBtn.addEventListener("click",()=>ns.useSeasonChangeItem());
    panel.querySelectorAll("[data-town-season]").forEach((btn)=>{
      btn.addEventListener("click",()=>ns.setTownSeason(btn.dataset.townSeason));
    });
    const back = panel.querySelector('[data-town-action="back-office"]');
    if (back) back.addEventListener("click",()=>{ ns.hideTownPanel(); ns.enterOffice({ speaker:"店長", message:"事務所に戻りました。" }); });
  };

  ns.setTownSeason = async function setTownSeason(seasonId){
    const data = load();
    const target = getSeason(seasonId);
    if (!target || !target.id) return;
    data.currentSeason = target.id;
    save(data);
    if (target.bg && typeof ns.setBackgroundReady === "function") await ns.setBackgroundReady(target.bg);
    ns.renderTownSeasonTop();
    ns.setText("外回り", `外回りの季節を${target.label}にしました。`);
  };

  ns.useSeasonChangeItem = async function useSeasonChangeItem(){
    const data = load();
    const seasons = cfg().seasons || [];
    const index = Math.max(0, seasons.findIndex((s)=>s.id === data.currentSeason));
    const next = seasons[(index + 1) % seasons.length] || seasons[0];
    data.currentSeason = next ? next.id : data.currentSeason;
    save(data);
    if (next && next.bg && typeof ns.setBackgroundReady === "function") await ns.setBackgroundReady(next.bg);
    ns.renderTownSeasonTop();
    ns.setText("外回り", `季節チケットを使い、外回りの季節を${next ? next.label : "変更"}にしました。`);
  };

  ns.renderTownPlaceDetail = function renderTownPlaceDetail(placeId){
    const data = load();
    const place = getPlace(placeId);
    const detail = ns.layers.town && ns.layers.town.querySelector("[data-town-encounter-detail]");
    if (!detail || !place) return;
    const key = `${data.currentSeason}:${place.id}`;
    const revealed = !!data.revealedPlaces[key];
    const unread = getUnreadEncounterStories(place.id, data.currentSeason);
    const all = getAllEncounterStories(place.id, data.currentSeason);
    const cost = cfg().staminaCost || 10;
    const debugReplay = !!window.TENOTSU_DEBUG_ALL_STORIES;
    const canStart = unread.length > 0 || (debugReplay && all.length > 0);
    const candidates = revealed ? (unread.length ? unread : all) : (canStart ? (unread.length ? unread : all).slice(0, 1) : []);
    const list = candidates.length ? candidates.map((story)=>`
      <div class="tenotsu-town-candidate ${typeof ns.isStoryCleared === "function" && ns.isStoryCleared(story.id) ? "cleared" : ""}">
        <b>${esc(story.title)}</b>
        <span>${esc((story.characterNames || story.characters || []).join(" / "))}</span>
        <small>${esc(story.summary || "")}</small>
      </div>
    `).join("") : `<div class="tenotsu-town-candidate empty">${revealed ? "この場所で今見つかる未読ストーリーはありません。" : "キャラの気配確認前です。候補がある場合はエンカウント開始も押せます。"}</div>`;

    detail.innerHTML = `
      <div class="tenotsu-town-detail-title">${esc(place.name)}</div>
      <div class="tenotsu-town-detail-meta">${esc(place.type || "場所")} / 現在の季節：${esc(getSeason(data.currentSeason).label)}</div>
      <div class="tenotsu-town-detail-summary">${esc(place.description || "")}</div>
      <div class="tenotsu-town-tool-row">
        <button type="button" class="tenotsu-town-tool" data-town-tool="reveal" data-place-id="${esc(place.id)}">${esc((cfg().items && cfg().items.reveal && cfg().items.reveal.label) || "気配確認")}</button>
        <button type="button" class="tenotsu-event-start" data-town-encounter-start="${esc(place.id)}" ${canStart ? "" : "disabled"}>${unread.length ? "エンカウント開始" : (canStart ? "再会テスト" : "エンカウントなし")} ST${esc(cost)}</button>
      </div>
      <div class="tenotsu-town-candidate-list">${list}</div>
      <div class="tenotsu-town-start-note">通常ストーリーは外回りで未読に出会い、読了後は右メニューの回想アルバムから確認します。開発表示中は読了済みも再会テストできます。</div>
    `;
    const reveal = detail.querySelector('[data-town-tool="reveal"]');
    if (reveal) reveal.addEventListener("click",()=>ns.useRevealItem(place.id));
    const start = detail.querySelector("[data-town-encounter-start]");
    if (start) start.addEventListener("click",()=>ns.startTownEncounter(place.id));
  };

  ns.useRevealItem = function useRevealItem(placeId){
    const data = load();
    const key = `${data.currentSeason}:${placeId}`;
    data.revealedPlaces[key] = true;
    save(data);
    ns.renderTownSeasonTop();
    ns.renderTownPlaceDetail(placeId);
    const unread = getUnreadEncounterStories(placeId, data.currentSeason);
    ns.setText("外回り", unread.length ? `キャラの気配があります。未読ストーリー候補：${unread.length}件。` : "今は新しいキャラの気配はないようです。");
  };

  ns.startTownEncounter = function startTownEncounter(placeId){
    const data = load();
    const unread = getUnreadEncounterStories(placeId, data.currentSeason);
    const all = getAllEncounterStories(placeId, data.currentSeason);
    const story = unread[0] || (window.TENOTSU_DEBUG_ALL_STORIES ? all[0] : null);
    if (story) {
      data.revealedPlaces[`${data.currentSeason}:${placeId}`] = true;
      save(data);
    }
    const cost = cfg().staminaCost || 10;
    if (!story) { ns.setText("外回り", "この場所で開始できる未読ストーリーはありません。"); return; }
    if (window.TenotsuStamina && typeof window.TenotsuStamina.consume === "function") {
      const result = window.TenotsuStamina.consume(cost, "外回りエンカウント");
      if (!result || !result.ok) { ns.setText("外回り", `スタミナが足りません。ST${cost}必要です。`); return; }
    }
    if (typeof ns.markStoryRead === "function") ns.markStoryRead(story.id);
    if (typeof ns.startStory === "function") ns.startStory(story.scenario, { mode:"town", placeId, season:data.currentSeason, storyId:story.id });
  };

  ns.enterTown = async function enterTown(options = {}) {
    if (!options.noTransition && typeof ns.transitionTo === "function") {
      return ns.transitionTo(() => ns.enterTown({ noTransition: true }));
    }
    ns.setMode("town");
    ns.ensureLayers();
    if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
    if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (typeof ns.hideStoryMenuPanel === "function") ns.hideStoryMenuPanel();
    if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (typeof ns.clearCharacters === "function") ns.clearCharacters();
    const data = load();
    const season = getSeason(data.currentSeason);
    if (typeof ns.setBackgroundReady === "function") {
      await ns.setBackgroundReady((season && season.bg) || ns.paths.townBg || ns.paths.officeBg);
    } else {
      ns.setBackground((season && season.bg) || ns.paths.townBg || ns.paths.officeBg);
    }
    ns.renderOfficeMenu();
    ns.renderTownSeasonTop();
    ns.setText("店長", "外回りへ出ます。場所を選び、必要ならアイテムでキャラの気配を確認しましょう。");
  };
})();
