window.TENOTSU_LATEST_VERSION = "v038_27";

/* v037_85 engine guard: 起動停止対策 */
window.TENOTSU_ENGINE_VERSION = "v038_27";
window.__TENOTSU_ENGINE_ERRORS__ = window.__TENOTSU_ENGINE_ERRORS__ || [];

window.addEventListener("error", (event) => {
  try {
    window.__TENOTSU_ENGINE_ERRORS__.push({
      type: "error",
      message: event.message || "",
      source: event.filename || "",
      line: event.lineno || 0,
      col: event.colno || 0
    });
    console.error("[TENOTSU ENGINE ERROR]", event.message, event.error || "");
  } catch (_) {}
});

window.addEventListener("unhandledrejection", (event) => {
  try {
    window.__TENOTSU_ENGINE_ERRORS__.push({
      type: "promise",
      message: String(event.reason && event.reason.message ? event.reason.message : event.reason)
    });
    console.error("[TENOTSU ENGINE PROMISE]", event.reason);
  } catch (_) {}
});


/* v038_27 script cleanup / surface takeover helper */
function tenotsuIsSurfaceTakeoverRuntime() {
  return !!window.__TENOTSU_SURFACE_TAKEOVER__ || !!window.__TENOTSU_DISABLE_RANDOMSHOW_VISUALS__ || !!window.TENOTSU_SURFACE_VERSION;
}
function tenotsuIsLegacyStartScenarioName(name) {
  const n = String(name || "").split("/").pop();
  return n === "000start.json" || n === "start000.json" || n === "uploaded_000start.json";
}
function tenotsuSurfaceEnterOffice(reason) {
  if (typeof window.tenotsuEnterOfficeMode === "function") {
    window.tenotsuEnterOfficeMode(reason || "script-cleanup");
    return true;
  }
  if (typeof window.tenotsuSetGameMode === "function") {
    window.tenotsuSetGameMode("office");
    return true;
  }
  return false;
}
function tenotsuSurfaceHideLegacyPanels() {
  if (document.body) document.body.classList.add("tenotsu-surface-authority");
  document.querySelectorAll("#list-panel,#menu-panel,.menu-panel,.list-panel,.left-menu,#left-menu,#leftPanel,.right-menu,#right-menu,.legacy-menu,.showlist-menu").forEach(el => {
    el.classList.add("hidden");
    el.setAttribute("aria-hidden","true");
    el.style.setProperty("display","none","important");
    el.style.setProperty("visibility","hidden","important");
    el.style.setProperty("opacity","0","important");
    el.style.setProperty("pointer-events","none","important");
    el.style.setProperty("z-index","-1","important");
    el.style.setProperty("width","0","important");
    el.style.setProperty("height","0","important");
    el.style.setProperty("overflow","hidden","important");
    if (el.id === "list-panel") el.textContent = "";
  });
}

function tenotsuSafeEl(id) {
  return document.getElementById(id);
}

function tenotsuForceShowMenuFallback(reason = "") {
  if (tenotsuIsSurfaceTakeoverRuntime()) {
    tenotsuSurfaceHideLegacyPanels();
    tenotsuSurfaceEnterOffice("fallback-suppressed");
    return;
  }
  try {
    const menuPanel = tenotsuSafeEl("menu-panel");
    const listPanel = tenotsuSafeEl("list-panel");
    const dialogueBox = tenotsuSafeEl("dialogue-box");
    const textEl = tenotsuSafeEl("text");
    const nameEl = tenotsuSafeEl("name");
    const clickLayer = tenotsuSafeEl("click-layer");

    if (clickLayer) clickLayer.style.pointerEvents = "auto";
    if (dialogueBox) dialogueBox.classList.remove("hidden");
    if (nameEl) nameEl.textContent = "ひだまりストア";
    if (textEl) textEl.innerHTML = "起動しました。メニューから操作してください。" + (reason ? `<br><small>${reason}</small>` : "");

    if (listPanel) listPanel.classList.add("hidden");
    if (menuPanel) {
      menuPanel.classList.remove("hidden");
      if (!menuPanel.innerHTML.trim()) {
        menuPanel.innerHTML = `
          <button class="menu-item" data-engine-action="battle">店舗営業</button>
          <button class="menu-item" data-engine-action="mainmenu">メインメニュー</button>
          <button class="menu-item" data-engine-action="cacheclear">キャッシュ削除</button>
        `;
      }
    }
  } catch (err) {
    console.error("[TENOTSU FALLBACK FAILED]", err);
  }
}

document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-engine-action]");
  if (!btn) return;
  const action = btn.dataset.engineAction;
  if (action === "battle") {
    if (window.BattleProto && typeof window.BattleProto.openBattle === "function") {
      window.BattleProto.openBattle();
    } else if (typeof window.startDeckBattlePrototype === "function") {
      window.startDeckBattlePrototype();
    } else {
      alert("バトルエンジンが読み込まれていません");
    }
  } else if (action === "mainmenu") {
    if (typeof window.loadMenu === "function") window.loadMenu("mainmenu.json");
    else tenotsuForceShowMenuFallback("loadMenu未初期化");
  } else if (action === "store") {
    if (typeof window.loadList === "function") window.loadList("home.json");
    else tenotsuForceShowMenuFallback("店舗メニューは準備中です");
  } else if (action === "members") {
    if (typeof window.loadList === "function") window.loadList("members.json");
    else tenotsuForceShowMenuFallback("メンバーメニューは準備中です");
  } else if (action === "town") {
    tenotsuShowOuterMenu();
  } else if (action === "shop") {
    if (typeof window.loadList === "function") window.loadList("shop.json");
    else tenotsuForceShowMenuFallback("ショップは準備中です");
  } else if (action === "settings") {
    tenotsuSetStoryPartActive(false, "settings");
    if (typeof window.loadMenu === "function") window.loadMenu("menu01.json");
    else tenotsuForceShowMenuFallback("設定は準備中です");
  } else if (action === "cacheclear") {
    if (typeof window.clearAppCacheAndReload === "function") window.clearAppCacheAndReload();
    else location.reload();
  }
});

window.addEventListener("load", () => {
  window.setTimeout(() => {
    const menuPanel = tenotsuSafeEl("menu-panel");
    const listPanel = tenotsuSafeEl("list-panel");
    const battleRoot = tenotsuSafeEl("battle-root");
    const hasVisibleMenu = menuPanel && !menuPanel.classList.contains("hidden") && menuPanel.innerHTML.trim();
    const hasVisibleList = listPanel && !listPanel.classList.contains("hidden") && listPanel.innerHTML.trim();
    const hasVisibleBattle = battleRoot && !battleRoot.classList.contains("hidden");
    const surfaceMode = document.body?.dataset?.gameMode || window.tenotsuGameMode || "";
    const surfaceMenu = document.getElementById("tenotsu-main-menu");
    const hasSurfaceMenu = surfaceMenu && getComputedStyle(surfaceMenu).display !== "none";
    if (!surfaceMode && !hasSurfaceMenu && !hasVisibleMenu && !hasVisibleList && !hasVisibleBattle) {
      tenotsuForceShowMenuFallback("起動演出後の画面復帰フォールバック");
    }
  }, 2600);
});
/* /v037_85 engine guard */

// script.js - v037 修正版（wait/effectTime/Menu/List安定化）

let currentScenario = "000start.json";
let currentIndex = 0;
let bgm = null;
let lastActiveSide = null;
let isMuted = true;
let typingInterval = null;
let isAutoMode = false;
let autoWaitTime = 2000;
let isPlaying = false;
  if (typeof tenotsuScheduleAutoPlay === 'function') tenotsuScheduleAutoPlay();
let currentSpeed = 40;
let defaultSpeed = 40;
let defaultFontSize = "1em";
let textAreaVisible = true;
let tenotsuStoryPartActive = false;
window.__TENOTSU_SCREEN_MODE__ = window.__TENOTSU_SCREEN_MODE__ || "boot";

function tenotsuIsInitialTitleScenario(filename = currentScenario) {
  return ["000start.json", "start000.json"].includes(String(filename || ""));
}

function tenotsuIsTitleOnlyScene(scene) {
  if (!scene) return false;
  if (scene.titleScreen === true || scene.mode === "title" || scene.screenMode === "title") return true;
  if (!tenotsuIsInitialTitleScenario()) return false;
  const hasStoryText = scene.text !== undefined && scene.text !== null && String(scene.text).trim() !== "" && scene.textareashow !== false;
  const isMenuOrTitleStage = scene.textareashow === false || scene.showlist || scene.showmenu || scene.randomimageson !== undefined || scene.randomtexts !== undefined;
  return isMenuOrTitleStage && !hasStoryText;
}

function tenotsuSetScreenMode(mode) {
  const normalized = mode || "story";
  window.__TENOTSU_SCREEN_MODE__ = normalized;
  ["boot", "title", "office", "story", "battle", "town", "shop", "settings"].forEach((m) => {
    document.body.classList.toggle(`${m}-screen`, normalized === m);
  });
  document.body.dataset.tenotsuMode = normalized;
}

function tenotsuGetScreenMode() {
  return window.__TENOTSU_SCREEN_MODE__ || "boot";
}

function tenotsuIsOfficeMode() {
  return tenotsuGetScreenMode() === "office";
}


function tenotsuIsSurfaceManagerBootActive() {
  return !!(window.__TENOTSU_SURFACE_TAKEOVER__ || window.TENOTSU_SURFACE_VERSION || document.body?.dataset?.gameMode === "office");
}

function tenotsuShouldRightMenuBeVisible() {
  return ["office", "shop", "settings"].includes(tenotsuGetScreenMode());
}

const bgEl = document.getElementById("background");
const nameEl = document.getElementById("name");
const textEl = document.getElementById("text");
const choicesEl = document.getElementById("choices");
const menuPanel = document.getElementById("menu-panel");
const listPanel = document.getElementById("list-panel");
const evLayer = document.getElementById("ev-layer");
const clickLayer = document.getElementById("click-layer");
const dialogueBox = document.getElementById("dialogue-box");

const charSlots = {
  left: document.getElementById("char-left"),
  center: document.getElementById("char-center"),
  right: document.getElementById("char-right")
};


/* v037_93: ストーリー中の右メニュー抑止 */
function tenotsuIsStoryPartActive() {
  return !!tenotsuStoryPartActive && tenotsuGetScreenMode() === "story";
}
function tenotsuSetStoryPartActive(active, mode) {
  if (mode) tenotsuSetScreenMode(mode);
  tenotsuStoryPartActive = !!active && tenotsuGetScreenMode() === "story";
  document.body.classList.toggle("story-playing", tenotsuStoryPartActive);
  if (tenotsuStoryPartActive && listPanel) listPanel.classList.add("hidden");
}
function tenotsuApplyStoryTextWhite() {
  // v037_93: 本文は白固定。キャラ名は setCharacterStyle() のキャラカラーを維持する。
  if (textEl) {
    textEl.style.color = "#ffffff";
    textEl.style.textShadow = "0 1px 3px rgba(0,0,0,.75)";
  }
}
/* /v037_93 */

function isMobilePortrait() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

function setTextWithSpeed(text, speed, callback) {
  if (typingInterval) clearInterval(typingInterval);
  tenotsuStopAutoPlayTimer && tenotsuStopAutoPlayTimer();
  isPlaying = true;
  textEl.innerHTML = "";
  tenotsuApplyStoryTextWhite(); // v037_93 setText start
  const sourceText = String(text ?? "");
  let i = 0;

  if (sourceText.length === 0) {
    isPlaying = false;
    if (callback) callback();
    if (typeof tenotsuScheduleAutoPlay === "function") tenotsuScheduleAutoPlay();
    return;
  }

  typingInterval = setInterval(() => {
    textEl.innerHTML += sourceText[i++];
    tenotsuApplyStoryTextWhite(); // v037_93 typing
    if (i >= sourceText.length) {
      clearInterval(typingInterval);
      typingInterval = null;
      isPlaying = false;
      if (callback) callback();
      if (typeof tenotsuScheduleAutoPlay === "function") tenotsuScheduleAutoPlay();
    }
  }, speed);
}

function setCharacterStyle(name, scene = {}) {
  const style = (window.TENOTSU_CHARACTER_STYLE_MAP && window.TENOTSU_CHARACTER_STYLE_MAP[name]) || (window.characterStyles && window.characterStyles[name]) || null;
  // v037_93: キャラ名はキャラカラー、本文は白固定。
  if (nameEl) {
    nameEl.style.color = style ? (style.color || "#ffffff") : "#ffffff";
    nameEl.style.fontWeight = style ? (style.fontWeight || "700") : "700";
    nameEl.style.textShadow = (style && style.textShadow) || "0 1px 3px rgba(0,0,0,.75)";
  }
  if (textEl) {
    textEl.style.color = "#ffffff";
    textEl.style.fontWeight = style ? (style.fontWeight || "600") : "600";
    textEl.style.textShadow = "0 1px 3px rgba(0,0,0,.75)";
    textEl.style.fontSize = scene.fontSize || (style && style.fontSize) || defaultFontSize || "1em";
  }
  if (style && typeof style.speed === "number") currentSpeed = style.speed;
  else currentSpeed = scene.speed || defaultSpeed || 40;
  if (scene.speed) currentSpeed = scene.speed;
}

function clearCharacters() {
  for (const pos in charSlots) {
    charSlots[pos].innerHTML = "";
    charSlots[pos].classList.remove("active");
  }
  lastActiveSide = null;
}

function updateCharacterDisplay() {
  // v037_85:
  // 同じslotに同一人物(a1/b1...)の別表情を出す場合はフェードなし。
  // 新規人物/別人物のみフェード。
  window.__TENOTSU_CHAR_SLOT_STATE__ = window.__TENOTSU_CHAR_SLOT_STATE__ || {};
  Object.entries(charSlots).forEach(([side, slot]) => {
    if (!slot) return;
    const img = slot.querySelector("img");
    if (!img) {
      window.__TENOTSU_CHAR_SLOT_STATE__[side] = null;
      return;
    }
    const srcAttr = img.getAttribute("src") || "";
    const file = srcAttr.split("/").pop() || "";
    const charKey = file.slice(0, 2);
    const prev = window.__TENOTSU_CHAR_SLOT_STATE__[side];

    img.classList.remove("char-fade-in", "char-same-expression-swap");

    if (prev && prev.charKey === charKey && prev.file !== file) {
      img.classList.add("char-same-expression-swap");
      img.style.transition = "none";
      img.style.animation = "none";
      img.style.opacity = "1";
      requestAnimationFrame(() => {
        img.style.transition = "";
        img.style.animation = "";
        img.classList.remove("char-same-expression-swap");
      });
    } else if (!prev || prev.charKey !== charKey) {
      img.classList.add("char-fade-in");
    }

    window.__TENOTSU_CHAR_SLOT_STATE__[side] = { file, charKey };
  });
}

async function applyEffect(el, effectName, duration = 1000) {
  if (!effectName) return;
  if (window.effects && window.effects[effectName]) {
    return await window.effects[effectName](el, duration);
  }
  if (window.effects?.fadein) {
    return await window.effects.fadein(el, duration);
  }
}

function getSceneWait(scene) {
  return Number.isFinite(Number(scene?.wait)) ? Number(scene.wait) : autoWaitTime;
}

function getEffectTime(scene) {
  return Number.isFinite(Number(scene?.effectTime)) ? Number(scene.effectTime) : 1000;
}

function normalizeItems(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function normalizeScenes(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.scenes)) return data.scenes;
  return [];
}

async function safeFetchJson(url, label = "JSON") {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label}読み込み失敗: ${res.status} ${url}`);
  return await res.json();
}

function updateTextAreaVisibility(show) {
  textAreaVisible = show;
  dialogueBox.classList.toggle("hidden", !show);
}

async function showScene(scene) {
  if (!scene) return;
  if (tenotsuIsSurfaceTakeoverRuntime()) {
    if (scene.randomimageson !== undefined || scene.randomtexts !== undefined) {
      tenotsuSurfaceHideLegacyPanels();
      return;
    }
    if (scene.showlist === "office6.json" || scene.screenMode === "office" || scene.officeMode === true) {
      tenotsuSurfaceEnterOffice("showScene-office-takeover");
      return;
    }
  }
  const isTitleScene = tenotsuIsTitleOnlyScene(scene);
  const isOfficeScene = scene.mode === "office" || scene.screenMode === "office" || scene.officeMode === true || scene.showlist === "office6.json";
  if (isOfficeScene) {
    tenotsuSetStoryPartActive(false, "office");
  } else {
    tenotsuSetStoryPartActive(!isTitleScene, isTitleScene ? "title" : "story"); // v037_93 showScene mode flag
  }
  if (!isTitleScene && !isOfficeScene && listPanel) listPanel.classList.add("hidden");
  if (typingInterval) clearInterval(typingInterval);

  const sceneWaitTime = getSceneWait(scene);
  const effectTime = getEffectTime(scene);
  const sceneEffect = scene.effect || scene.bgEffect;

  textEl.innerHTML = "";
  nameEl.textContent = "";
  evLayer.innerHTML = "";
  choicesEl.innerHTML = "";

  // v037_93: full-size event CG / memory background should not appear behind standing sprites.
  // Use `hideCharacters: true` for scenario-controlled full CG scenes.
  // Also auto-detect bg_memory_* backgrounds as full CG surfaces.
  const isFullCgBackground = scene.hideCharacters === true ||
    (typeof scene.bg === "string" && /^bg_memory_/i.test(scene.bg));
  if (isFullCgBackground) {
    clearCharacters();
    window.__TENOTSU_CHAR_SLOT_STATE__ = {};
  }

  if (scene.textareashow !== undefined) {
    updateTextAreaVisibility(scene.textareashow);
  }

  // ランダム画像表示のon/off
  if (scene.randomimageson === false && typeof randomImagesOff === "function") {
    randomImagesOff();
  } else if (scene.randomimageson === true && typeof randomImagesOn === "function") {
    randomImagesOn();
  }

  // ランダムテキスト表示のon/off
  if (scene.randomtexts !== undefined) {
    if (scene.randomtexts) {
      if (typeof randomTextsOn === "function") randomTextsOn();
    } else {
      if (typeof randomTextsOff === "function") randomTextsOff();
    }
  }

  // 背景なしでも白/黒フラッシュ等を使えるようにする
  if (!scene.bg && scene.effect) {
    await applyEffect(bgEl, scene.effect, effectTime);
  }

  if (scene.bg) {
    if (sceneEffect) await applyEffect(bgEl, sceneEffect, effectTime);
    await new Promise((resolve) => {
      bgEl.onload = resolve;
      bgEl.onerror = resolve;
      bgEl.src = config.bgPath + scene.bg;
    });
    if (scene.bgEffect) await applyEffect(bgEl, scene.bgEffect, effectTime);
  }

  if (scene.showev) {
    const evImg = document.createElement("img");
    evImg.src = config.evPath + scene.showev;
    evImg.classList.add("ev-image");
    evImg.onload = () => applyEffect(evImg, scene.evEffect || "fadein", effectTime);
    evLayer.appendChild(evImg);
  }

  if (scene.showcg) {
    const cgImg = document.createElement("img");
    cgImg.src = config.cgPath + scene.showcg;
    cgImg.classList.add("cg-image");
    cgImg.onload = () => applyEffect(cgImg, scene.cgEffect || "fadein", effectTime);
    evLayer.appendChild(cgImg);
  }

  if (scene.bgm !== undefined) {
    if (bgm) {
      bgm.pause();
      bgm = null;
    }
    if (scene.bgm) {
      bgm = new Audio(config.bgmPath + scene.bgm);
      bgm.loop = true;
      bgm.muted = isMuted;
      bgm.play().catch(() => {});
    }
  }

  if (scene.characters) {
    lastActiveSide = scene.characters[scene.characters.length - 1]?.side || null;
    for (const pos of ["left", "center", "right"]) {
      const slot = charSlots[pos];
      const charData = scene.characters.find((c) => c.side === pos);
      if (charData && charData.src && charData.src !== "NULL") {
        const img = document.createElement("img");
        img.src = config.charPath + charData.src;
        img.classList.add("char-image");
        slot.innerHTML = "";
        slot.appendChild(img);
        await applyEffect(img, charData.effect || "fadein", effectTime);
      } else if (charData && charData.src === "NULL") {
        slot.innerHTML = "";
      }
    }
  }

  updateCharacterDisplay();

  if (scene.name !== undefined && scene.text !== undefined) {
    nameEl.textContent = scene.name;
    setCharacterStyle(scene.name, scene);
    tenotsuApplyStoryTextWhite(); // v037_93 after style
    setTextWithSpeed(scene.text, currentSpeed, () => {
      if (isAutoMode && choicesEl.children.length === 0) {
        setTimeout(() => {
          if (!isPlaying) next();
        }, sceneWaitTime);
      }
    });
  }

  if (scene.voice) {
    const voice = new Audio(config.voicePath + scene.voice);
    voice.muted = isMuted;
    voice.play().catch(() => {});
  }

  if (scene.se) {
    const se = new Audio(config.sePath + scene.se);
    se.muted = isMuted;
    se.play().catch(() => {});
  }

  if (scene.choices) {
    scene.choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.textContent = choice.text;
      btn.onclick = () => {
        clearCharacters();
        textEl.innerHTML = "";
        nameEl.textContent = "";
        evLayer.innerHTML = "";
        handleMenuAction(choice);
      };
      choicesEl.appendChild(btn);
    });
  }

  if (scene.showmenu) {
    const isInitialScenario = currentScenario === "000start.json" || currentScenario === "start000.json";
    if (!(window.__TENOTSU_MAIN_MENU_LOCK__ && isInitialScenario)) await loadMenu(scene.showmenu);
  }
  if (scene.showlist) {
    const isInitialScenario = currentScenario === "000start.json" || currentScenario === "start000.json";
    const isTitleSceneForList = tenotsuIsTitleOnlyScene(scene);
    const isOfficeList = scene.showlist === "office6.json";
    if (tenotsuIsSurfaceTakeoverRuntime()) {
      tenotsuSurfaceHideLegacyPanels();
      if (isOfficeList || isInitialScenario) tenotsuSurfaceEnterOffice("showlist-suppressed");
      return;
    }
    // v037_93: タイトルからは事務所へ遷移。事務所モードでは右6大メニューを常時表示。
    if (isOfficeList) {
      tenotsuSetStoryPartActive(false, "office");
      await loadList(scene.showlist);
    } else if (isTitleSceneForList || (!tenotsuIsStoryPartActive() && !(window.__TENOTSU_MAIN_MENU_LOCK__ && isInitialScenario && scene.showlist !== "office6.json"))) {
      await loadList(scene.showlist);
    }
  }

  /* v037_85: characters-only scene auto schedule */
  if (scene.name === undefined && scene.text === undefined && !scene.choices && isAutoMode) {
    tenotsuScheduleAutoPlay();
  }

  if (scene.auto && scene.choices === undefined && scene.text === undefined) {
    setTimeout(() => {
      if (!isPlaying) next();
    }, sceneWaitTime);
  }
}

function next() {
  if (typeof tenotsuStopAutoPlayTimer === 'function') tenotsuStopAutoPlayTimer();
  safeFetchJson(config.scenarioPath + currentScenario + "?t=" + Date.now(), currentScenario)
    .then((data) => {
      currentIndex++;
      const scenes = normalizeScenes(data);
      if (currentIndex < scenes.length) {
        showScene(scenes[currentIndex]);
      } else {
        if (textAreaVisible) {
          tenotsuHandleStoryEndReturn();
        }
        isAutoMode = false;
      }
    })
    .catch((err) => showError(err.message));
}

function loadScenario(filename) {
  const isInitialTitle = ["000start.json", "start000.json"].includes(String(filename || ""));
  if (isInitialTitle && tenotsuIsSurfaceManagerBootActive()) {
    // v038_27: surfaceManager owns the office initial screen.
    // Do not run 000start.json random/title scenes on boot.
    tenotsuSetStoryPartActive(false, "office");
    if (typeof window.tenotsuEnterOfficeMode === "function") {
      window.tenotsuEnterOfficeMode("initial-surface");
    }
    return Promise.resolve([]);
  }
  tenotsuSetStoryPartActive(!isInitialTitle, isInitialTitle ? "title" : "story"); // v037_93 loadScenario mode
  // ランダム表示類はリセット
  if (typeof randomImagesOff === "function") randomImagesOff();
  if (typeof randomTextsOff === "function") randomTextsOff();

  currentScenario = filename;
  currentIndex = 0;
  clearCharacters();
  textEl.innerHTML = "";
  nameEl.textContent = "";
  evLayer.innerHTML = "";
  if (!isInitialTitle) listPanel.classList.add("hidden");
  menuPanel.classList.add("hidden");
  if (typingInterval) clearInterval(typingInterval);
  updateTextAreaVisibility(true);

  safeFetchJson(config.scenarioPath + filename + "?t=" + Date.now(), filename)
    .then((data) => {
      const scenes = normalizeScenes(data);
      if (scenes.length === 0) throw new Error(`シナリオが空です: ${filename}`);
      showScene(scenes[0]);
    })
    .catch((err) => showError(err.message));
}

function showError(message) {
  console.error(message);
  updateTextAreaVisibility(true);
  nameEl.textContent = "System";
  textEl.innerHTML = `読み込みエラー：${message}`;
}

function setVhVariable() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

window.addEventListener("resize", () => {
  setVhVariable();
  updateCharacterDisplay();
});

window.addEventListener("load", () => {
  setVhVariable();
  if (tenotsuIsSurfaceManagerBootActive()) {
    // v038_27: skip 000start.json on initial surface boot.
    if (typeof window.tenotsuEnterOfficeMode === "function") {
      window.tenotsuEnterOfficeMode("initial-surface");
    }
    return;
  }
  loadScenario(currentScenario);
});



// === キャッシュクリア ===
async function clearAppCacheAndReload() {
  const ok = window.confirm(
    "アプリキャッシュをクリアして再読み込みします。\n" +
    "画面が古いまま表示される時に使ってください。\n\n" +
    "※ セーブ用localStorageは消しません。"
  );
  if (!ok) return;

  try {
    if (typeof showError === "function") {
      showError("キャッシュをクリア中です……");
    }

    if (window.caches) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((reg) => reg.unregister()));
    }

    const url = new URL(window.location.href);
    url.searchParams.set("reload", Date.now().toString());
    window.location.replace(url.toString());
  } catch (err) {
    console.error(err);
    alert("キャッシュクリアに失敗しました。Safariの履歴/サイトデータ削除、またはホーム画面追加のやり直しを試してください。");
  }
}

window.clearAppCacheAndReload = clearAppCacheAndReload;

// === メニュー関連 ===
function handleMenuAction(item) {
  if (!item) return;
  /* v037_85 town precheck */
  if ((item.action === "jump" && item.jump === "town_placeholder.json") || (item.action === "outer")) {
    tenotsuShowOuterMenu();
    return;
  }
  /* v037_85 scenario return precheck */
  if (item.action === "jump" && item.jump) {
    tenotsuPushReturnMenu("list", "office6.json");
  }
  /* v037_85 handleMenuAction precheck */
  if (item.action === "list" && item.list === "home.json") {
    tenotsuShowStoreStatus();
    return;
  }
  if (item.action === "list" && item.list === "members.json") {
    tenotsuShowMemberMenu();
    return;
  }
  if (item.action === "list" && item.list === "shop.json") {
    tenotsuSetStoryPartActive(false, "shop");
    tenotsuShowShopMenu();
    return;
  }
  if (item.action === "auto") {
    tenotsuSetAutoMode(!isAutoMode);
    return;
  }
  if (item.action === "skip") {
    while (isPlaying === false && currentIndex < 9999) {
      next();
      break;
    }
    return;
  }
  if (item.action === "cacheclear") {
    if (typeof window.clearAppCacheAndReload === "function") window.clearAppCacheAndReload();
    return;
  }
  /* v037_85 custom action precheck */
  if (item.action === "custom") {
    if (item.custom === "memory-album") tenotsuShowMemoryAlbum();
    else if (item.custom === "expression-master") tenotsuShowExpressionMasterMenu();
    else if (item.custom === "expression-character") tenotsuShowExpressionCharacter(item.characterId || "aa");
    else if (item.custom === "memory-list") tenotsuShowMemoryCharacterList();
    else if (item.custom === "member-list") tenotsuShowMemberListMenu();
    else if (item.custom === "story-table") tenotsuShowStoryManagementTable();
    else if (item.custom === "title-return-archive") tenotsuShowTitleReturnMenuArchive();
    else if (item.custom === "secret-word") tenotsuShowSecretWordMenu();
    else if (item.custom === "event-exchange-menu") tenotsuShowExchangeCounterMenu();
    else if (item.custom === "shop-normal-placeholder") tenotsuShowShopPlaceholder("通常ショップ", "通常ショップは準備中です。");
    else if (item.custom === "shop-gacha-placeholder") tenotsuShowShopPlaceholder("ガチャ", "ガチャは準備中です。");
    else if (item.custom === "memory-character") tenotsuShowMemoryCharacterStories(item.characterId || "manager");
    return;
  }
  if ((item.action === "jump" || !item.action) && item.jump) {
    loadScenario(item.jump);
  } else if (item.action === "menu" && item.menu) {
    tenotsuSetStoryPartActive(false, item.menu === "menu01.json" ? "settings" : "office");
    loadMenu(item.menu);
  } else if (item.action === "list" && item.list) {
    if (item.list === "office6.json") tenotsuEnterOfficeMode("list-office6");
    else loadList(item.list);
  } else if (item.action === "outer") {
    tenotsuSetStoryPartActive(false, "town");
    if (typeof tenotsuShowOuterMenu === "function") tenotsuShowOuterMenu();
  } else if (item.action === "battle") {
    tenotsuEnterBattleMode && tenotsuEnterBattleMode();
    try {
      if (window.BattleProto && typeof window.BattleProto.openBattle === "function") {
        window.BattleProto.openBattle();
      } else if (typeof window.startDeckBattlePrototype === "function") {
        window.startDeckBattlePrototype();
      } else {
        showError("バトルプロトタイプが読み込まれていません");
      }
    } catch (err) {
      console.error("[TENOTSU BATTLE OPEN FAILED]", err);
      showError("バトル画面の起動に失敗しました: " + (err && err.message ? err.message : err));
    }
  } else if (item.action === "cacheclear") {
    clearAppCacheAndReload();
  } else if (item.action === "url" && item.url) {
    location.href = item.url;
  }
}

async function loadMenu(filename = "menu01.json") {
  try {
    const data = await safeFetchJson(config.menuPath + filename + "?t=" + Date.now(), filename);
    showMenu(data);
  } catch (err) {
    showError(err.message);
  }
}

function showMenu(menuData) {
  menuPanel.innerHTML = "";
  menuPanel.classList.add("left-system-panel");
  menuPanel.classList.remove("hidden");

  const audioBtn = document.createElement("button");
  audioBtn.textContent = isMuted ? "音声ONへ" : "音声OFFへ";
  audioBtn.onclick = () => {
    isMuted = !isMuted;
    if (bgm) bgm.muted = isMuted;
    document.querySelectorAll("audio").forEach(a => a.muted = isMuted);
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(audioBtn);

  const autoBtn = document.createElement("button");
  autoBtn.textContent = isAutoMode ? "オートモードOFF" : "オートモードON";
  autoBtn.onclick = () => {
    isAutoMode = !isAutoMode;
    if (isAutoMode) {
      textEl.innerHTML = "(AutoMode On)";
      setTimeout(() => {
        textEl.innerHTML = "";
        setTimeout(() => {
          if (!isPlaying && choicesEl.children.length === 0) next();
        }, autoWaitTime);
      }, 1000);
    } else {
      textEl.innerHTML = "(AutoMode Off)";
      setTimeout(() => { textEl.innerHTML = ""; }, 1000);
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(autoBtn);

  const fullscreenBtn = document.createElement("button");
  fullscreenBtn.textContent = document.fullscreenElement ? "全画面OFF" : "全画面ON";
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    menuPanel.classList.add("hidden");
  };
  menuPanel.appendChild(fullscreenBtn);

  normalizeItems(menuData).forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      menuPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    menuPanel.appendChild(btn);
  });
}

// === リスト関連 ===
async function loadList(filename = "list01.json") {
  if (tenotsuIsStoryPartActive && tenotsuIsStoryPartActive() && !tenotsuShouldRightMenuBeVisible()) { // v037_93 loadList story guard
    if (listPanel) listPanel.classList.add("hidden");
    return;
  }
  try {
    const data = await safeFetchJson(config.listPath + filename + "?t=" + Date.now(), filename);
    showList(data);
  } catch (err) {
    showError(err.message);
  }
}

function showList(listData) {
  if (tenotsuIsSurfaceTakeoverRuntime()) {
    tenotsuSurfaceHideLegacyPanels();
    return;
  }
  // v037_93: タイトルは右メニュー表示可、通常ストーリー中のみ右メニューを出さない
  if (tenotsuIsStoryPartActive && tenotsuIsStoryPartActive() && !tenotsuShouldRightMenuBeVisible()) {
    if (listPanel) listPanel.classList.add("hidden");
    return;
  }
  listPanel.innerHTML = "";
  listPanel.classList.add("right-main-panel");
  listPanel.classList.remove("hidden");

  normalizeItems(listData).forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.text;
    btn.onclick = () => {
      listPanel.classList.add("hidden");
      handleMenuAction(item);
    };
    listPanel.appendChild(btn);
  });
}

// === 操作レイヤー：クリック・タッチ対応 ===
clickLayer.addEventListener("dblclick", (event) => {
  // v037_85: 左メニューはダブルクリックではなく長押しで出す。
  event.preventDefault();
});

let lastTouch = 0;
clickLayer.addEventListener("touchend", () => {
  // v037_85: ダブルタップメニューは廃止。長押しメニューへ統一。
  lastTouch = Date.now();
});

clickLayer.addEventListener("click", () => {
  // v037_93: ストーリーモード中のタップは必ずシナリオ送りを優先する。
  if (tenotsuIsStoryPartActive && tenotsuIsStoryPartActive()) {
    if (!isPlaying && choicesEl.children.length === 0) next();
    return;
  }
  /* v037_85: 右メニュー非表示時タップ再表示 */
  if (!menuPanel.classList.contains("hidden")) {
    menuPanel.classList.add("hidden");
    return;
  }
  const battleRoot = document.getElementById("battle-root");
  const battleVisible = battleRoot && !battleRoot.classList.contains("hidden");
  if (!battleVisible && listPanel.classList.contains("hidden") && choicesEl.children.length === 0 && !isPlaying) {
    tenotsuEnsureOfficeSixMenuVisible();
    return;
  }
  if (!isPlaying && choicesEl.children.length === 0) {
    next();
  }
});

/* v037_85 expose engine functions */
try { if (typeof loadMenu === "function") window.loadMenu = loadMenu; } catch (_) {}
try { if (typeof loadList === "function") window.loadList = loadList; } catch (_) {}
try { if (typeof loadScenario === "function") window.loadScenario = loadScenario; } catch (_) {}
try { if (typeof clearAppCacheAndReload === "function") window.clearAppCacheAndReload = clearAppCacheAndReload; } catch (_) {}



/* v037_93: タイトル→事務所→各パート→事務所 の画面モード管理 */
function tenotsuSetOfficeBackground() {
  try {
    if (bgEl) bgEl.src = config.bgPath + "bg_office_hidamari.png";
  } catch (_) {}
}

function tenotsuEnterOfficeMode(reason = "office") {
  try {
    tenotsuSetStoryPartActive(false, "office");
    window.__TENOTSU_STORY_ENDING__ = false;
    // v038_27: 事務所へ戻るたびにランダム立ち絵/コメントを再抽選するため、ここではOFFにしない。
    clearCharacters();
    if (evLayer) evLayer.innerHTML = "";
    if (choicesEl) choicesEl.innerHTML = "";
    if (menuPanel) menuPanel.classList.add("hidden");
    updateTextAreaVisibility(false);
    tenotsuSetOfficeBackground();
    if (typeof window.loadList === "function") {
      window.loadList("office6.json");
      tenotsuStartOfficeRandomShow("enter-office");
    } else if (listPanel) {
      listPanel.classList.remove("hidden");
      tenotsuStartOfficeRandomShow("enter-office-fallback");
    }
    tenotsuLockMainMenu && tenotsuLockMainMenu();
  } catch (err) {
    console.error("[TENOTSU ENTER OFFICE FAILED]", reason, err);
  }
}

function tenotsuEnterTitleMode() {
  tenotsuSetStoryPartActive(false, "title");
  if (listPanel) listPanel.classList.add("hidden");
}

function tenotsuEnterStoryMode() {
  tenotsuSetStoryPartActive(true, "story");
  if (listPanel) listPanel.classList.add("hidden");
}

function tenotsuEnterBattleMode() {
  tenotsuSetStoryPartActive(false, "battle");
  if (listPanel) listPanel.classList.add("hidden");
}
/* /v037_93 */


/* v038_27: タイトル/事務所共通ランダム立ち絵＋コメント */
function tenotsuStartOfficeRandomShow(reason = 'office') {
  try {
    if (typeof window.tenotsuRefreshTitleRandomShow === 'function') {
      window.tenotsuRefreshTitleRandomShow();
    } else {
      if (typeof randomImagesOn === 'function') {
        const p = randomImagesOn();
        Promise.resolve(p).then(() => { if (typeof randomTextsOn === 'function') randomTextsOn(); });
      } else if (typeof randomTextsOn === 'function') {
        randomTextsOn();
      }
    }
  } catch (err) {
    console.warn('[TENOTSU OFFICE RANDOM SHOW FAILED]', reason, err);
  }
}
/* /v038_27 */

/* v037_85 boot flow: 起動フラッシュ → 初期化 → タイトル表示 → 事務所6大メニュー */
window.TENOTSU_BOOT_FLOW_VERSION = "v038_27";
window.__TENOTSU_BOOT_DONE__ = false;

function tenotsuSetOfficeText(title, text) {
  try {
    const nameBox = document.getElementById("name");
    const textBox = document.getElementById("text");
    const dialogueBox = document.getElementById("dialogue-box");
    if (dialogueBox) dialogueBox.classList.remove("hidden");
    if (nameBox) nameBox.textContent = title || "";
    if (textBox) textBox.innerHTML = text || "";
  } catch (err) {
    console.error("[TENOTSU OFFICE TEXT FAILED]", err);
  }
}

function tenotsuShowOfficeSixMenu() {
  try {
    tenotsuSetStoryPartActive(false, "office");
    tenotsuSetOfficeBackground && tenotsuSetOfficeBackground();
    updateTextAreaVisibility(false);
    if (typeof window.loadList === "function") {
      const menuPanel = document.getElementById("menu-panel");
      if (menuPanel) menuPanel.classList.add("hidden");
      window.loadList("office6.json");
      tenotsuStartOfficeRandomShow("show-office-six");
      tenotsuLockMainMenu();
      return;
    }

    const menuPanel = document.getElementById("menu-panel");
    if (menuPanel) {
      menuPanel.classList.remove("hidden");
      menuPanel.innerHTML = `
        <button class="menu-item office-menu-main office-status" data-engine-action="store">店舗</button>
        <button class="menu-item office-menu-main office-status" data-engine-action="members">メンバー</button>
        <button class="menu-item office-menu-main office-game" data-engine-action="battle">店舗営業</button>
        <button class="menu-item office-menu-main office-game" data-engine-action="town">外回り</button>
        <button class="menu-item office-menu-main office-other" data-engine-action="shop">ショップ</button>
        <button class="menu-item office-menu-main office-other" data-engine-action="settings">設定</button>
      `;
    }
    tenotsuSetOfficeText("ひだまりストア事務所", "上段：ステータス管理 / 中段：ゲームパート / 下段：その他");
    tenotsuStartOfficeRandomShow("show-office-six-fallback");
  } catch (err) {
    console.error("[TENOTSU OFFICE MENU FAILED]", err);
    if (typeof tenotsuForceShowMenuFallback === "function") tenotsuForceShowMenuFallback("事務所6大メニュー表示失敗");
  }
}

function tenotsuRunBootFlow() {
  if (window.__TENOTSU_BOOT_DONE__) return;
  window.__TENOTSU_BOOT_DONE__ = true;

  const boot = document.getElementById("boot-flow");
  const bootLogo = boot ? boot.querySelector(".boot-logo") : null;
  const bootVersion = boot ? boot.querySelector(".boot-version") : null;
  const bootSub = boot ? boot.querySelector(".boot-sub") : null;

  function finishBoot() {
    try {
      if (boot) {
        boot.classList.add("is-out");
        window.setTimeout(() => {
          boot.classList.add("hidden");
          boot.setAttribute("aria-hidden", "true");
        }, 420);
      }
      tenotsuShowOfficeSixMenu();
    } catch (err) {
      console.error("[TENOTSU BOOT FINISH FAILED]", err);
      if (typeof tenotsuForceShowMenuFallback === "function") tenotsuForceShowMenuFallback("起動フロー終了失敗");
    }
  }

  try {
    if (boot) {
      boot.classList.remove("hidden", "is-out");
      boot.setAttribute("aria-hidden", "false");
    }
    if (bootLogo) bootLogo.textContent = "店長お疲れ様です";
    if (bootVersion) bootVersion.textContent = window.TENOTSU_BOOT_FLOW_VERSION || "v038_27";
    if (bootSub) bootSub.textContent = "初期化中…";

    window.setTimeout(() => { if (bootSub) bootSub.textContent = "ひだまりストアへ接続中…"; }, 520);
    window.setTimeout(() => {
      if (bootLogo) bootLogo.textContent = "ひだまりストア";
      if (bootSub) bootSub.textContent = "事務所6大メニューを準備しています";
    }, 1150);
    window.setTimeout(finishBoot, 1800);
  } catch (err) {
    console.error("[TENOTSU BOOT FAILED]", err);
    finishBoot();
  }
}

window.addEventListener("load", () => {
  window.setTimeout(tenotsuRunBootFlow, 80);
});

try {
  window.tenotsuRunBootFlow = tenotsuRunBootFlow;
  window.tenotsuShowOfficeSixMenu = tenotsuShowOfficeSixMenu;
  window.tenotsuEnterOfficeMode = tenotsuEnterOfficeMode;
  window.tenotsuSetScreenMode = tenotsuSetScreenMode;
} catch (_) {}
/* /v037_85 boot flow */


/* v037_85 economy/status/album helpers */
const TENOTSU_ECONOMY_KEY = "tenotsu_economy_v1";
const TENOTSU_ALBUM_KEY = "tenotsu_album_v1";
const TENOTSU_STORE_KEY = "tenotsu_store_v1";

function tenotsuLoadJsonStorage(key, fallback = {}) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch (_) { return fallback; }
}

function tenotsuSaveJsonStorage(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch (_) {}
}

function tenotsuGetEconomy() {
  const e = tenotsuLoadJsonStorage(TENOTSU_ECONOMY_KEY, {});
  e.totalSales = Math.max(0, Math.floor(Number(e.totalSales) || 0));
  e.availableSales = Math.max(0, Math.floor(Number(e.availableSales) || 0));
  e.battleCount = Math.max(0, Math.floor(Number(e.battleCount) || 0));
  e.lastSales = Math.max(0, Math.floor(Number(e.lastSales) || 0));
  e.history = Array.isArray(e.history) ? e.history : [];
  return e;
}

function tenotsuGetStore() {
  const s = tenotsuLoadJsonStorage(TENOTSU_STORE_KEY, {});
  s.storeRank = Math.max(1, Math.floor(Number(s.storeRank) || Number(s.storeLevel) || 1));
  s.storeLevel = s.storeRank;
  s.townLevel = Math.max(1, Math.floor(Number(s.townLevel) || 1));
  s.managerRank = Math.max(1, Math.floor(Number(s.managerRank) || 1));
  s.facilityLevel = Math.max(1, Math.floor(Number(s.facilityLevel) || 1));
  s.expenseUsed = Math.max(0, Math.floor(Number(s.expenseUsed) || 0));
  s.exchangeUsed = Math.max(0, Math.floor(Number(s.exchangeUsed) || 0));
  s.equipment = Array.isArray(s.equipment) ? s.equipment : [];
  s.equipped = s.equipped && typeof s.equipped === "object" ? s.equipped : {};
  s.unlockedEpisodes = Array.isArray(s.unlockedEpisodes) ? s.unlockedEpisodes : [];
  s.unlockedLandmarks = Array.isArray(s.unlockedLandmarks) ? s.unlockedLandmarks : [];
  return s;
}

function tenotsuGetAlbum() {
  const a = tenotsuLoadJsonStorage(TENOTSU_ALBUM_KEY, {});
  a.memories = Array.isArray(a.memories) ? a.memories : [];
  a.scenarios = Array.isArray(a.scenarios) ? a.scenarios : [];
  a.images = Array.isArray(a.images) ? a.images : [];
  return a;
}

function tenotsuSpendSales(amount, purpose) {
  const price = Math.max(0, Math.floor(Number(amount) || 0));
  const e = tenotsuGetEconomy();
  if (e.availableSales < price) return false;
  e.availableSales -= price;
  e.history.unshift({ type: "spend", source: purpose || "支出", amount: -price, at: new Date().toISOString() });
  e.history = e.history.slice(0, 30);
  tenotsuSaveJsonStorage(TENOTSU_ECONOMY_KEY, e);
  return true;
}

function tenotsuUnlockMemory(id, title, text) {
  const a = tenotsuGetAlbum();
  if (!a.memories.some(m => m.id === id)) {
    a.memories.unshift({ id, title, text, at: new Date().toISOString() });
    tenotsuSaveJsonStorage(TENOTSU_ALBUM_KEY, a);
  }
}

function tenotsuShowDynamicPanel(title, html) {
  tenotsuSetStoryPartActive(false); // v037_93 dynamic panel
  const menuPanel = document.getElementById("menu-panel");
  const listPanel = document.getElementById("list-panel");
  const nameBox = document.getElementById("name");
  const textBox = document.getElementById("text");
  if (listPanel) listPanel.classList.add("hidden");
  if (menuPanel) {
    menuPanel.classList.remove("hidden");
    menuPanel.innerHTML = html;
  }
  if (nameBox) nameBox.textContent = title || "";
  if (textBox) textBox.innerHTML = "メニューを選択してください。";
}

function tenotsuShowStoreStatus() {
  const e = tenotsuGetEconomy();
  const s = tenotsuUnlockRankRewards(tenotsuGetStore());
  const mxp = tenotsuGetManagerExpData();
  const storeCost = tenotsuRankCost("store", s.storeRank);
  const townCost = tenotsuRankCost("town", s.townLevel);
  const managerCost = tenotsuRankCost("manager", s.managerRank);
  const facilityCost = tenotsuRankCost("facility", s.facilityLevel);
  const equipped = s.equipped.manager ? (s.equipment.find(eq => eq.id === s.equipped.manager)?.name || s.equipped.manager) : "なし";
  tenotsuShowDynamicPanel("店舗・店長ステータス", `
    <div class="status-card">
      <h3>店長・店舗ステータス</h3>
      <p>累計売上：<b>${e.totalSales.toLocaleString()}円</b></p>
      <p>店長Lv：<b>${mxp.level}</b> / ${TENOTSU_MANAGER_MAX_LEVEL}　EXP：${mxp.level >= TENOTSU_MANAGER_MAX_LEVEL ? "MAX" : `${mxp.currentLevelExp.toLocaleString()} / ${mxp.nextLevelExp.toLocaleString()}`}</p>
      <p>Lv60まで残り：${mxp.remainingToMax.toLocaleString()}EXP</p>
      <p>使用可能売上：<b>${e.availableSales.toLocaleString()}円</b></p>
      <p>直近売上：${e.lastSales.toLocaleString()}円 / 営業回数：${e.battleCount.toLocaleString()}回</p>
      <hr>
      <p>店舗ランク：<b>${s.storeRank}</b> / 街レベル：<b>${s.townLevel}</b></p>
      <p>店長ランク：<b>${s.managerRank}</b> / 設備Lv：<b>${s.facilityLevel}</b></p>
      <p>店長装備：<b>${equipped}</b></p>
      <p>開放エピソード：${s.unlockedEpisodes.length} / 開放ランドマーク：${s.unlockedLandmarks.length}</p>
      <button class="menu-item" data-engine-action="claim-login-exp">ログインEXP受取 +100</button>
      <button class="menu-item" data-engine-action="claim-daily-exp">デイリーEXP受取 +250</button>
      <button class="menu-item" data-engine-action="claim-outer-exp">外回りEXPテスト +60</button>
      <button class="menu-item" data-engine-action="rank-store">店舗ランクUP ${storeCost.toLocaleString()}円</button>
      <button class="menu-item" data-engine-action="rank-town">街レベルUP ${townCost.toLocaleString()}円</button>
      <button class="menu-item" data-engine-action="rank-manager">店長ランクUP ${managerCost.toLocaleString()}円</button>
      <button class="menu-item" data-engine-action="facility-up">設備増強 ${facilityCost.toLocaleString()}円</button>
      <button class="menu-item" data-engine-action="equipment-menu">装備確認</button>
      <button class="menu-item" data-engine-action="event-exchange">イベントアイテム交換</button>
      <button class="menu-item" data-engine-action="expense-use">外回り経費に使う</button>
      <button class="menu-item" data-engine-action="office6">戻る</button>
    </div>
  `);
}

function tenotsuShowAlbum() {
  const a = tenotsuGetAlbum();
  const memories = a.memories.length
    ? a.memories.map(m => `<li><b>${m.title}</b><br><small>${m.text || ""}</small></li>`).join("")
    : "<li>まだ思い出はありません。店舗営業やシナリオ進行で追加されます。</li>";
  tenotsuShowDynamicPanel("思い出アルバム", `
    <div class="status-card">
      <h3>思い出アルバム</h3>
      <p>シナリオ、画像、外回りGOOD、店長ランク解放エピソード、店舗ランク解放ランドマークがここに蓄積されます。USBメモリで改装、SDカードで復習チャレンジができます。</p>
      <p>店長ランクでエピソード開放、店舗ランクでランドマーク開放。</p>
      <ul class="album-list">${memories}</ul>
      <button class="menu-item" data-engine-action="members">メンバーへ戻る</button>
      <button class="menu-item" data-engine-action="office6">事務所へ戻る</button>
    </div>
  `);
}

function tenotsuShowMemberMenu() {
  tenotsuShowDynamicPanel("メンバー", `
    <button class="menu-item" data-engine-action="member-list">メンバー一覧</button>
    <button class="menu-item" data-engine-action="memory-album">思い出アルバム</button>
    <button class="menu-item" data-engine-action="story-table">ストーリー管理表</button>
    <button class="menu-item" data-engine-action="title-return-archive">タイトル後メニュー</button>
    <button class="menu-item" data-engine-action="office6">戻る</button>
  `);
}


function tenotsuShowEquipmentMenu() {
  const s = tenotsuGetStore();
  const list = s.equipment.length
    ? s.equipment.map(eq => `<button class="menu-item" data-engine-action="equip-item" data-equip-id="${eq.id}">${eq.name}<br><small>${eq.source} / ${eq.effectText || ""}</small></button>`).join("")
    : `<p>装備品はまだありません。キャラからのプレゼントやイベント交換で入手できます。</p>`;
  tenotsuShowDynamicPanel("店長装備", `
    <div class="status-card">
      <h3>店長装備</h3>
      <p>キャラからのプレゼント、イベント交換品などを装備できます。</p>
      ${list}
      <button class="menu-item" data-engine-action="event-gift-test">テスト：プレゼント装備を受け取る</button>
      <button class="menu-item" data-engine-action="store">戻る</button>
    </div>
  `);
}

function tenotsuShowShopMenu() {
  const e = tenotsuGetEconomy();
  tenotsuShowDynamicPanel("ショップ", `
    <div class="status-card">
      <p>使用可能売上：<b>${e.availableSales.toLocaleString()}円</b></p>
      <button class="menu-item" data-engine-action="secret-word">秘密の言葉</button>
      <button class="menu-item" data-engine-action="event-exchange">イベントアイテム交換</button>
      <button class="menu-item" data-engine-action="facility-up">店舗設備増強アイテム</button>
      <button class="menu-item" data-engine-action="office6">戻る</button>
    </div>
  `);
}

function tenotsuShowShopPlaceholder(title, message) {
  tenotsuShowDynamicPanel(title, `
    <div class="status-card">
      <p>${message}</p>
      <button class="menu-item" data-engine-action="shop">ショップへ戻る</button>
      <button class="menu-item" data-engine-action="office6">事務所へ戻る</button>
    </div>
  `);
}

function tenotsuSetExchangeCounterBackground() {
  try {
    if (bgEl) bgEl.src = config.bgPath + "bg_exchange_item_counter.png";
  } catch (_) {}
}

function tenotsuShowExchangeCounterMenu() {
  const e = tenotsuGetEconomy();
  tenotsuSetExchangeCounterBackground();
  tenotsuShowDynamicPanel("アイテム交換所", `
    <div class="status-card exchange-counter-card">
      <h3>アイテム交換所</h3>
      <p>採用背景：夜のアイテム交換所。イベント交換・限定品交換の画面背景として使用します。</p>
      <p>使用可能売上：<b>${e.availableSales.toLocaleString()}円</b></p>
      <button class="menu-item" data-engine-action="event-exchange">イベント交換クリップを交換（1,200円）</button>
      <button class="menu-item" data-engine-action="shop">ショップへ戻る</button>
      <button class="menu-item" data-engine-action="office6">事務所へ戻る</button>
    </div>
  `);
}

/* v037_85 rank/equipment/unlock helpers */
function tenotsuRankCost(type, currentRank) {
  const rank = Math.max(1, Math.floor(Number(currentRank) || 1));
  if (type === "store") return rank * 10000;
  if (type === "town") return rank * 8000;
  if (type === "manager") return rank * 7000;
  if (type === "facility") return rank * 5000;
  return rank * 5000;
}

function tenotsuGrantEquipment(id, name, source, effectText) {
  const store = tenotsuGetStore();
  if (!store.equipment.some(eq => eq.id === id)) {
    store.equipment.push({ id, name, source, effectText, at: new Date().toISOString() });
    tenotsuSaveJsonStorage(TENOTSU_STORE_KEY, store);
    tenotsuUnlockMemory("equipment_" + id, "装備品入手：" + name, source + "で装備品を入手しました。");
  }
  return store;
}

function tenotsuUnlockRankRewards(store) {
  const s = store || tenotsuGetStore();

  const episodeRules = [
    { rank: 2, id: "manager_rank_2_episode", title: "店長ランク2エピソード", text: "店長としての一歩を踏み出した記録。" },
    { rank: 3, id: "manager_rank_3_episode", title: "店長ランク3エピソード", text: "スタッフから頼られる場面が増えてきた。" },
    { rank: 5, id: "manager_rank_5_episode", title: "店長ランク5エピソード", text: "ひだまりストアの中心として認められた。" }
  ];

  episodeRules.forEach(rule => {
    if (s.managerRank >= rule.rank && !s.unlockedEpisodes.includes(rule.id)) {
      s.unlockedEpisodes.push(rule.id);
      tenotsuUnlockMemory(rule.id, rule.title, rule.text);
    }
  });

  const landmarkRules = [
    { rank: 2, id: "landmark_techlab_tsukumo", title: "ランドマーク開放：テックラボつくも", text: "街にテックラボつくもが開放されました。" },
    { rank: 3, id: "landmark_biribiri_denki", title: "ランドマーク開放：ビリビリ電機", text: "ライバル店ビリビリ電機が街に現れました。" },
    { rank: 4, id: "landmark_mall_event", title: "ランドマーク開放：イベント広場", text: "イベント広場に行けるようになりました。" }
  ];

  landmarkRules.forEach(rule => {
    if (s.storeRank >= rule.rank && !s.unlockedLandmarks.includes(rule.id)) {
      s.unlockedLandmarks.push(rule.id);
      tenotsuUnlockMemory(rule.id, rule.title, rule.text);
    }
  });

  tenotsuSaveJsonStorage(TENOTSU_STORE_KEY, s);
  return s;
}

function tenotsuEquipItem(id) {
  const store = tenotsuGetStore();
  const item = store.equipment.find(eq => eq.id === id);
  if (!item) return false;
  store.equipped.manager = id;
  tenotsuSaveJsonStorage(TENOTSU_STORE_KEY, store);
  tenotsuUnlockMemory("equip_" + id, "装備変更：" + item.name, "店長装備に設定しました。");
  return true;
}

function tenotsuRankUp(type) {
  const store = tenotsuGetStore();
  const keyMap = { store: "storeRank", town: "townLevel", manager: "managerRank", facility: "facilityLevel" };
  const key = keyMap[type];
  if (!key) return false;
  const cost = tenotsuRankCost(type, store[key]);
  const labelMap = { store: "店舗ランクアップ", town: "街レベルアップ", manager: "店長ランクアップ", facility: "設備増強" };
  if (!tenotsuSpendSales(cost, labelMap[type])) return false;
  store[key] += 1;
  if (type === "store") store.storeLevel = store.storeRank;
  tenotsuSaveJsonStorage(TENOTSU_STORE_KEY, store);
  tenotsuUnlockMemory(type + "_rank_" + store[key], labelMap[type], labelMap[type] + "しました。現在Lv/RANK：" + store[key]);
  tenotsuUnlockRankRewards(store);
  return true;
}
/* /v037_85 rank/equipment/unlock helpers */

window.TenotsuData = {
  economy: tenotsuGetEconomy,
  store: tenotsuGetStore,
  album: tenotsuGetAlbum,
  spendSales: tenotsuSpendSales,
  unlockMemory: tenotsuUnlockMemory,
  showStoreStatus: tenotsuShowStoreStatus,
  showAlbum: tenotsuShowAlbum,
  showMemberMenu: tenotsuShowMemberMenu,
  showShopMenu: tenotsuShowShopMenu,
  showEquipmentMenu: tenotsuShowEquipmentMenu,
  rankUp: tenotsuRankUp,
  grantEquipment: tenotsuGrantEquipment,
  equipItem: tenotsuEquipItem,
  managerExp: tenotsuGetManagerExpData,
  addManagerExp: tenotsuAddManagerExp,
  claimLoginExp: tenotsuClaimLoginExp,
  claimDailyExp: tenotsuClaimDailyExp,
  outerMenu: tenotsuShowOuterMenu,
  startOuterAdv: tenotsuStartOuterAdv,
  items: tenotsuGetItems,
  affection: tenotsuGetAffection,
  storyMaster: tenotsuGetStoryMaster,
  expressionFile: tenotsuExpressionFile,
  expressionPath: tenotsuExpressionPath,
  memoriesByCharacter: tenotsuGetStoriesByCharacter
};
/* /v037_85 economy/status/album helpers */


/* v037_85 economy action listener */
document.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-engine-action]");
  if (!btn) return;
  const action = btn.dataset.engineAction;
  if (!["office6","member-list","album","memory-list","memory-character","memory-play","story-table","title-return-archive","expression-master","expression-character","memory-album","event-cg-view","album-story-play","center-surface-close","facility-up","event-exchange","expense-use","store","members","shop","auto","skip","cacheclear","secret-word","secret-word-submit","secret-word-hint","rank-store","rank-town","rank-manager","equipment-menu","equip-item","event-gift-test","claim-login-exp","claim-daily-exp","claim-outer-exp","outer-menu","outer-start","outer-glasses","outer-item-test","adv-answer","stamina-test-recover","album-remodel","review-challenge","settings"].includes(action)) return;

  event.preventDefault();
  event.stopPropagation();

  if (action === "outer-menu") {
    tenotsuShowOuterMenu();
  } else if (action === "outer-start") {
    tenotsuStartOuterAdv();
  } else if (action === "outer-glasses") {
    tenotsuUseHikaruGlasses();
  } else if (action === "outer-item-test") {
    tenotsuGrantOuterTestItems();
  } else if (action === "adv-answer") {
    tenotsuResolveAdvAnswer(btn.dataset.result);
  } else if (action === "stamina-test-recover") {
    tenotsuRecoverStamina(5);
    tenotsuShowOuterMenu();
  } else if (action === "album-remodel") {
    tenotsuAlbumRemodel();
  } else if (action === "review-challenge") {
    tenotsuReviewChallenge();
  } else if (action === "office6") {
    if (typeof tenotsuEnterOfficeMode === "function") tenotsuEnterOfficeMode("action-office6");
    else if (typeof window.loadList === "function") window.loadList("office6.json");
    else if (typeof tenotsuShowOfficeSixMenu === "function") tenotsuShowOfficeSixMenu();
  } else if (action === "store") {
    tenotsuShowStoreStatus();
  } else if (action === "members") {
    tenotsuShowMemberMenu();
  } else if (action === "shop") {
    tenotsuSetStoryPartActive(false, "shop");
    tenotsuShowShopMenu();
  } else if (action === "member-list") {
    tenotsuShowMemberListMenu();
  } else if (action === "title-return-archive") {
    tenotsuShowTitleReturnMenuArchive();
  } else if (action === "expression-master") {
    tenotsuShowExpressionMasterMenu();
  } else if (action === "expression-character") {
    tenotsuShowExpressionCharacter(btn.dataset.characterId || "aa");
  } else if (action === "album" || action === "memory-list" || action === "memory-album") {
    tenotsuShowMemoryAlbum();
  } else if (action === "event-cg-view") {
    tenotsuShowEventCgViewer(btn.dataset.cgPath || "", btn.dataset.cgTitle || "イベントCG", btn.dataset.cgScenario || "", btn.dataset.characterId || "manager");
  } else if (action === "album-story-play") {
    const scenario = btn.dataset.scenario;
    const characterId = btn.dataset.characterId || "manager";
    tenotsuPushReturnMenu("memory-album", characterId);
    tenotsuCloseCenterSurface();
    if (scenario && typeof window.loadScenario === "function") window.loadScenario(scenario);
  } else if (action === "center-surface-close") {
    tenotsuCloseCenterSurface();
  } else if (action === "memory-character") {
    tenotsuShowMemoryCharacterStories(btn.dataset.characterId || "manager");
  } else if (action === "memory-play") {
    const scenario = btn.dataset.scenario;
    const characterId = btn.dataset.characterId || window.__TENOTSU_LAST_MEMORY_CHARACTER__ || "manager";
    tenotsuPushReturnMenu("memory-character", characterId);
    if (scenario && typeof window.loadScenario === "function") window.loadScenario(scenario);
  } else if (action === "story-table") {
    tenotsuShowStoryManagementTable();
  } else if (action === "settings") {
    tenotsuSetStoryPartActive(false, "settings");
    if (typeof window.loadMenu === "function") window.loadMenu("menu01.json");
  } else if (action === "claim-login-exp") {
    tenotsuClaimLoginExp();
    tenotsuShowStoreStatus();
  } else if (action === "claim-daily-exp") {
    tenotsuClaimDailyExp();
    tenotsuShowStoreStatus();
  } else if (action === "claim-outer-exp") {
    tenotsuClaimOuterExp();
    tenotsuShowStoreStatus();
  } else if (action === "secret-word") {
    tenotsuShowSecretWordMenu();
  } else if (action === "secret-word-submit") {
    tenotsuSubmitSecretWord();
  } else if (action === "secret-word-hint") {
    tenotsuShowSecretWordHint();
  } else if (action === "rank-store") {
    tenotsuRankUp("store");
    tenotsuShowStoreStatus();
  } else if (action === "rank-town") {
    tenotsuRankUp("town");
    tenotsuShowStoreStatus();
  } else if (action === "rank-manager") {
    tenotsuRankUp("manager");
    tenotsuShowStoreStatus();
  } else if (action === "facility-up") {
    tenotsuRankUp("facility");
    tenotsuShowStoreStatus();
  } else if (action === "equipment-menu") {
    tenotsuShowEquipmentMenu();
  } else if (action === "equip-item") {
    tenotsuEquipItem(btn.dataset.equipId);
    tenotsuShowEquipmentMenu();
  } else if (action === "event-gift-test") {
    tenotsuGrantEquipment("gift_hina_badge", "緋奈の応援バッジ", "キャラからのプレゼント", "営業開始時の気分が上がる");
    tenotsuShowEquipmentMenu();
  } else if (action === "event-exchange") {
    if (tenotsuSpendSales(1200, "イベントアイテム交換")) {
      const store = tenotsuGetStore();
      store.exchangeUsed += 1200;
      tenotsuSaveJsonStorage(TENOTSU_STORE_KEY, store);
      tenotsuGrantEquipment("event_manager_clip", "イベント交換クリップ", "イベントアイテム交換", "店長ランク経験に関係する予定");
      tenotsuUnlockMemory("event_exchange_001", "イベント交換の記録", "売上を使ってイベントアイテムを交換しました。");
    }
    tenotsuShowExchangeCounterMenu();
  } else if (action === "expense-use") {
    if (tenotsuSpendSales(800, "外回り経費")) {
      const store = tenotsuGetStore();
      store.expenseUsed += 800;
      tenotsuSaveJsonStorage(TENOTSU_STORE_KEY, store);
      tenotsuUnlockMemory("expense_001", "外回りの準備", "外回り経費を使いました。");
    }
    tenotsuShowStoreStatus();
  }
}, true);
/* /v037_85 economy action listener */


/* v037_85 manager level/EXP helpers */
const TENOTSU_MANAGER_EXP_KEY = "tenotsu_manager_exp_v1";
const TENOTSU_MANAGER_MAX_LEVEL = 60;

function tenotsuManagerNeedExp(level) {
  const lv = Math.max(1, Math.floor(Number(level) || 1));
  if (lv >= TENOTSU_MANAGER_MAX_LEVEL) return 0;
  return Math.floor(140 + 22 * Math.pow(lv - 1, 1.45));
}

function tenotsuManagerTotalExpForLevel(level) {
  const target = Math.max(1, Math.min(TENOTSU_MANAGER_MAX_LEVEL, Math.floor(Number(level) || 1)));
  let total = 0;
  for (let lv = 1; lv < target; lv++) total += tenotsuManagerNeedExp(lv);
  return total;
}

function tenotsuManagerTotalExpToMax() {
  return tenotsuManagerTotalExpForLevel(TENOTSU_MANAGER_MAX_LEVEL);
}

function tenotsuGetManagerExpData() {
  const data = tenotsuLoadJsonStorage(TENOTSU_MANAGER_EXP_KEY, {});
  data.totalExp = Math.max(0, Math.floor(Number(data.totalExp) || 0));
  data.history = Array.isArray(data.history) ? data.history : [];
  let level = 1;
  let used = 0;
  for (let lv = 1; lv < TENOTSU_MANAGER_MAX_LEVEL; lv++) {
    const need = tenotsuManagerNeedExp(lv);
    if (used + need > data.totalExp) break;
    used += need;
    level = lv + 1;
  }
  data.level = level;
  data.currentLevelExp = Math.max(0, data.totalExp - used);
  data.nextLevelExp = level >= TENOTSU_MANAGER_MAX_LEVEL ? 0 : tenotsuManagerNeedExp(level);
  data.remainingToMax = Math.max(0, tenotsuManagerTotalExpToMax() - data.totalExp);
  return data;
}

function tenotsuAddManagerExp(amount, source = "EXP") {
  const value = Math.max(0, Math.floor(Number(amount) || 0));
  const data = tenotsuGetManagerExpData();
  const beforeLevel = data.level;
  data.totalExp = Math.min(tenotsuManagerTotalExpToMax(), data.totalExp + value);
  const next = tenotsuGetManagerExpDataFromValue(data.totalExp);
  data.level = next.level;
  data.currentLevelExp = next.currentLevelExp;
  data.nextLevelExp = next.nextLevelExp;
  data.remainingToMax = next.remainingToMax;
  data.updatedAt = new Date().toISOString();
  data.history.unshift({ source, exp: value, at: data.updatedAt });
  data.history = data.history.slice(0, 30);
  tenotsuSaveJsonStorage(TENOTSU_MANAGER_EXP_KEY, data);
  if (data.level > beforeLevel) {
    tenotsuUnlockMemory("manager_level_" + data.level, "店長Lv" + data.level + "到達", "店長レベルが" + data.level + "になりました。");
  }
  return data;
}

function tenotsuGetManagerExpDataFromValue(totalExp) {
  const data = { totalExp: Math.max(0, Math.floor(Number(totalExp) || 0)), history: [] };
  let level = 1;
  let used = 0;
  for (let lv = 1; lv < TENOTSU_MANAGER_MAX_LEVEL; lv++) {
    const need = tenotsuManagerNeedExp(lv);
    if (used + need > data.totalExp) break;
    used += need;
    level = lv + 1;
  }
  data.level = level;
  data.currentLevelExp = Math.max(0, data.totalExp - used);
  data.nextLevelExp = level >= TENOTSU_MANAGER_MAX_LEVEL ? 0 : tenotsuManagerNeedExp(level);
  data.remainingToMax = Math.max(0, tenotsuManagerTotalExpToMax() - data.totalExp);
  return data;
}

function tenotsuTodayKey() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function tenotsuClaimLoginExp() {
  const data = tenotsuGetManagerExpData();
  const today = tenotsuTodayKey();
  if (data.lastLoginExpDate === today) return false;
  const updated = tenotsuAddManagerExp(100, "ログインボーナス");
  updated.lastLoginExpDate = today;
  tenotsuSaveJsonStorage(TENOTSU_MANAGER_EXP_KEY, updated);
  tenotsuUnlockMemory("login_exp_" + today, "ログインボーナス", "店長EXPを100獲得しました。");
  return true;
}

function tenotsuClaimDailyExp() {
  const data = tenotsuGetManagerExpData();
  const today = tenotsuTodayKey();
  if (data.lastDailyExpDate === today) return false;
  const updated = tenotsuAddManagerExp(250, "デイリー業務");
  updated.lastDailyExpDate = today;
  tenotsuSaveJsonStorage(TENOTSU_MANAGER_EXP_KEY, updated);
  tenotsuUnlockMemory("daily_exp_" + today, "デイリー業務完了", "店長EXPを250獲得しました。");
  return true;
}

function tenotsuClaimOuterExp() {
  tenotsuAddManagerExp(60, "外回り");
  tenotsuUnlockMemory("outer_exp_first", "外回りの記録", "外回りで経験を積みました。");
  return true;
}
/* /v037_85 manager level/EXP helpers */


/* v037_85 outer ADV / encounter / affection / item helpers */
const TENOTSU_STAMINA_KEY = "tenotsu_stamina_v1";
const TENOTSU_AFFECTION_KEY = "tenotsu_affection_v1";
const TENOTSU_ITEM_KEY = "tenotsu_items_v1";
const TENOTSU_ADV_LOG_KEY = "tenotsu_adv_log_v1";
const TENOTSU_OUTER_STAMINA_COST = 1;
const TENOTSU_OUTER_BASE_ENCOUNTER = 0.50;

const TENOTSU_ADV_CHARACTERS = [
  { id: "aa", name: "緋奈", good: "一緒にカレーでも食べに行く？", fine: "少し休憩する？", bad: "暗算の練習をしよう", topic: "商店街のカレー屋の前で、緋奈が立ち止まっている。" },
  { id: "ab", name: "藍", good: "新しいパン屋、一緒に見に行く？", fine: "少し休憩する？", bad: "パソコン売り場の応援頼める？", topic: "パン屋の紙袋を抱えた藍と目が合った。" },
  { id: "ac", name: "翠", good: "その分析、もう少し聞かせて", fine: "一緒に確認しよう", bad: "気合いで何とかなるだろ", topic: "翠がタブレット片手に通行量を調べている。" },
  { id: "ad", name: "こがね", good: "新作スマホケース、似合いそう", fine: "買い物中？", bad: "今日は地味だね", topic: "こがねがショーウィンドウを楽しそうに眺めている。" },
  { id: "ae", name: "琥珀", good: "そのイヤホン、音を聴かせて", fine: "元気そうだな", bad: "お化け屋敷に行こう", topic: "琥珀がスポーツショップの前で足を止めている。" },
  { id: "af", name: "真花", good: "無理しなくて大丈夫だよ", fine: "買い物かな？", bad: "男の店員さんに聞いてみよう", topic: "真花が少し困った顔で案内板を見ている。" },
  { id: "ag", name: "雪乃", good: "静かな和菓子屋に寄ってみる？", fine: "散歩中？", bad: "人混みのイベントへ行こう", topic: "雪乃が涼しげな表情で空を見上げている。" },
  { id: "ah", name: "美空", good: "夏物売場の意見を聞かせて", fine: "外回り中？", bad: "英語で案内してみて", topic: "美空が爽やかに商店街を歩いている。" },
  { id: "ai", name: "夜空", good: "加湿器の話、聞かせて", fine: "調子はどう？", bad: "お世辞でも言ってよ", topic: "夜空が静かに冬物家電のポスターを見ている。" },
  { id: "aj", name: "桃", good: "その動画企画、面白そう", fine: "撮影中？", bad: "家事の配信にしよう", topic: "桃がアクションカメラを構えている。" },
  { id: "ak", name: "彩愛", good: "その所作、すごく綺麗ですね", fine: "買い物ですか？", bad: "泳ぎに行きましょう", topic: "彩愛が商店街の掃除当番を手伝っている。" },
  { id: "al", name: "里美", good: "美味しいお菓子、探しに行く？", fine: "お疲れさま", bad: "狭い倉庫の整理を頼む", topic: "里美がお菓子屋の前で幸せそうにしている。" },
  { id: "am", name: "萌", good: "リラックスできる場所に寄ろう", fine: "大丈夫？", bad: "人の多い駅前へ行こう", topic: "萌が森林ウォーキングのパンフレットを見ている。" }
];

function tenotsuGetStamina() {
  const s = tenotsuLoadJsonStorage(TENOTSU_STAMINA_KEY, {});
  s.max = Math.max(5, Math.floor(Number(s.max) || 10));
  s.current = Math.max(0, Math.min(s.max, Math.floor(Number(s.current ?? s.max) || s.max)));
  s.updatedAt = s.updatedAt || new Date().toISOString();
  return s;
}

function tenotsuSaveStamina(stamina) {
  tenotsuSaveJsonStorage(TENOTSU_STAMINA_KEY, stamina);
}

function tenotsuUseStamina(amount) {
  const cost = Math.max(1, Math.floor(Number(amount) || 1));
  const s = tenotsuGetStamina();
  if (s.current < cost) return false;
  s.current -= cost;
  s.updatedAt = new Date().toISOString();
  tenotsuSaveStamina(s);
  return true;
}

function tenotsuRecoverStamina(amount) {
  const s = tenotsuGetStamina();
  s.current = Math.min(s.max, s.current + Math.max(1, Math.floor(Number(amount) || 1)));
  s.updatedAt = new Date().toISOString();
  tenotsuSaveStamina(s);
  return s;
}

function tenotsuGetItems() {
  const data = tenotsuLoadJsonStorage(TENOTSU_ITEM_KEY, {});
  data.items = data.items && typeof data.items === "object" ? data.items : {};
  return data;
}

function tenotsuAddItem(id, count = 1) {
  const data = tenotsuGetItems();
  data.items[id] = Math.max(0, Math.floor(Number(data.items[id]) || 0)) + Math.max(1, Math.floor(Number(count) || 1));
  tenotsuSaveJsonStorage(TENOTSU_ITEM_KEY, data);
  return data;
}

function tenotsuUseItem(id, count = 1) {
  const data = tenotsuGetItems();
  const need = Math.max(1, Math.floor(Number(count) || 1));
  const have = Math.max(0, Math.floor(Number(data.items[id]) || 0));
  if (have < need) return false;
  data.items[id] = have - need;
  tenotsuSaveJsonStorage(TENOTSU_ITEM_KEY, data);
  return true;
}

function tenotsuGetAffection() {
  const data = tenotsuLoadJsonStorage(TENOTSU_AFFECTION_KEY, {});
  data.characters = data.characters && typeof data.characters === "object" ? data.characters : {};
  return data;
}

function tenotsuAddAffection(charId, amount) {
  const data = tenotsuGetAffection();
  const current = Math.max(0, Number(data.characters[charId]) || 0);
  data.characters[charId] = Math.round((current + Number(amount || 0)) * 10) / 10;
  tenotsuSaveJsonStorage(TENOTSU_AFFECTION_KEY, data);
  return data.characters[charId];
}

function tenotsuLogAdv(entry) {
  const data = tenotsuLoadJsonStorage(TENOTSU_ADV_LOG_KEY, {});
  data.history = Array.isArray(data.history) ? data.history : [];
  data.history.unshift({ ...entry, at: new Date().toISOString() });
  data.history = data.history.slice(0, 50);
  tenotsuSaveJsonStorage(TENOTSU_ADV_LOG_KEY, data);
}

function tenotsuRandomChoice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function tenotsuShowOuterMenu() {
  const stamina = tenotsuGetStamina();
  const items = tenotsuGetItems().items;
  tenotsuShowDynamicPanel("外回り", `
    <div class="status-card adv-card">
      <h3>外回り</h3>
      <p>スタミナ：<b>${stamina.current} / ${stamina.max}</b>　消費：${TENOTSU_OUTER_STAMINA_COST}</p>
      <p>通常遭遇率：${Math.round(TENOTSU_OUTER_BASE_ENCOUNTER * 100)}%</p>
      <p>神社のお守り：${items.encounter_charm || 0} / ひかるの眼鏡：${items.hikaru_glasses || 0}</p>
      <p>USBメモリ：${items.album_usb || 0} / SDカード：${items.review_sd || 0}</p>
      <button class="menu-item" data-engine-action="outer-start">外回りへ行く</button>
      <button class="menu-item" data-engine-action="outer-glasses">ひかるの眼鏡で気配を見る</button>
      <button class="menu-item" data-engine-action="outer-item-test">テスト：外回りアイテムを受け取る</button>
      <button class="menu-item" data-engine-action="album-remodel">アルバム改装 USBメモリ消費</button>
      <button class="menu-item" data-engine-action="review-challenge">復習チャレンジ SDカード消費</button>
      <button class="menu-item" data-engine-action="office6">戻る</button>
    </div>
  `);
}

function tenotsuStartOuterAdv() {
  if (!tenotsuUseStamina(TENOTSU_OUTER_STAMINA_COST)) {
    tenotsuShowDynamicPanel("外回り", `
      <div class="status-card adv-card">
        <h3>スタミナ不足</h3>
        <p>外回りに行くにはスタミナが足りません。</p>
        <button class="menu-item" data-engine-action="stamina-test-recover">テスト：スタミナ回復</button>
        <button class="menu-item" data-engine-action="outer-menu">戻る</button>
      </div>
    `);
    return;
  }

  let chance = TENOTSU_OUTER_BASE_ENCOUNTER;
  let charmUsed = false;
  if (tenotsuUseItem("encounter_charm", 1)) {
    chance += 0.25;
    charmUsed = true;
  }

  const encounter = Math.random() < chance;
  tenotsuAddManagerExp(encounter ? 60 : 20, encounter ? "外回り遭遇" : "外回り");
  if (!encounter) {
    const lines = [
      "……今日は誰にも会わなかったな。まあ、こういう日もあるか。",
      "外回りというより、ただの散歩になってしまった……。",
      "商店街の空気は悪くない。収穫はなかったけど、気分転換にはなったな。",
      "次は誰かに会えるといいんだけどな。"
    ];
    const line = tenotsuRandomChoice(lines);
    tenotsuLogAdv({ type: "outer_none", text: line, charmUsed });
    tenotsuShowDynamicPanel("外回り", `
      <div class="status-card adv-card">
        <h3>遭遇なし</h3>
        <p>店長「${line}」</p>
        <p>店長EXP +20${charmUsed ? " / 神社のお守りを使用" : ""}</p>
        <button class="menu-item" data-engine-action="office6">事務所へ戻る</button>
      </div>
    `);
    return;
  }

  const chara = tenotsuRandomChoice(TENOTSU_ADV_CHARACTERS);
  window.__TENOTSU_CURRENT_ADV__ = chara;
  tenotsuLogAdv({ type: "outer_encounter", charId: chara.id, charName: chara.name, charmUsed });
  tenotsuShowAdvEncounter(chara, charmUsed);
}

function tenotsuShowAdvEncounter(chara, charmUsed = false) {
  tenotsuShowDynamicPanel("外回りコミュ", `
    <div class="status-card adv-card">
      <h3>${chara.name}と遭遇</h3>
      <p>${chara.topic}</p>
      <p>どう声をかける？${charmUsed ? "<br><small>神社のお守りのご利益で出会えた気がする。</small>" : ""}</p>
      <button class="menu-item" data-engine-action="adv-answer" data-result="GOOD">${chara.good}</button>
      <button class="menu-item" data-engine-action="adv-answer" data-result="FINE">${chara.fine}</button>
      <button class="menu-item" data-engine-action="adv-answer" data-result="BAD">${chara.bad}</button>
    </div>
  `);
}

function tenotsuResolveAdvAnswer(result) {
  const chara = window.__TENOTSU_CURRENT_ADV__;
  if (!chara) {
    tenotsuShowOuterMenu();
    return;
  }

  let affection = 0;
  let albumText = "";
  if (result === "GOOD") {
    affection = 1;
    const total = tenotsuAddAffection(chara.id, 1);
    albumText = `${chara.name}との外回りコミュでGOOD。好感度が${total}になりました。`;
    tenotsuUnlockMemory(`outer_good_${chara.id}_${Date.now()}`, `${chara.name}との外回り`, albumText);
  } else if (result === "FINE") {
    affection = 0.5;
    tenotsuAddAffection(chara.id, 0.5);
    albumText = `${chara.name}との外回りコミュでFINE。`;
  } else {
    albumText = `${chara.name}との外回りコミュでBAD。`;
  }

  tenotsuLogAdv({ type: "outer_result", charId: chara.id, charName: chara.name, result, affection });
  const msg = result === "GOOD"
    ? "会話が弾んだ。思い出アルバムにも記録された。"
    : result === "FINE"
      ? "悪くない会話だった。少し距離が縮まった気がする。"
      : "今日はうまく話が噛み合わなかった。";

  window.__TENOTSU_CURRENT_ADV__ = null;

  tenotsuShowDynamicPanel("外回り結果", `
    <div class="status-card adv-card">
      <h3>${result}</h3>
      <p>${msg}</p>
      <p>好感度：${affection > 0 ? "+" + affection : "変化なし"}</p>
      <button class="menu-item" data-engine-action="office6">事務所へ戻る</button>
    </div>
  `);
}

function tenotsuUseHikaruGlasses() {
  if (!tenotsuUseItem("hikaru_glasses", 1)) {
    tenotsuShowDynamicPanel("ひかるの眼鏡", `
      <div class="status-card adv-card">
        <h3>ひかるの眼鏡</h3>
        <p>手元にありません。キャラがいるかどうかを確認できる便利アイテムです。</p>
        <button class="menu-item" data-engine-action="outer-menu">戻る</button>
      </div>
    `);
    return;
  }
  const likely = Math.random() < 0.65;
  tenotsuShowDynamicPanel("ひかるの眼鏡", `
    <div class="status-card adv-card">
      <h3>ひかるの眼鏡</h3>
      <p>${likely ? "今日は誰かがいそうです。" : "今はあまり気配がありません。"}</p>
      <p><small>次の外回り判断に使えます。</small></p>
      <button class="menu-item" data-engine-action="outer-menu">戻る</button>
    </div>
  `);
}

function tenotsuAlbumRemodel() {
  if (!tenotsuUseItem("album_usb", 1)) {
    tenotsuShowDynamicPanel("アルバム改装", `
      <div class="status-card adv-card">
        <h3>USBメモリ不足</h3>
        <p>アルバム改装にはUSBメモリが必要です。</p>
        <button class="menu-item" data-engine-action="outer-menu">戻る</button>
      </div>
    `);
    return;
  }
  tenotsuUnlockMemory("album_remodel_001", "アルバム改装", "USBメモリを使って、思い出アルバムを整理しました。");
  tenotsuShowAlbum();
}

function tenotsuReviewChallenge() {
  if (!tenotsuUseItem("review_sd", 1)) {
    tenotsuShowDynamicPanel("復習チャレンジ", `
      <div class="status-card adv-card">
        <h3>SDカード不足</h3>
        <p>復習チャレンジにはSDカードが必要です。</p>
        <button class="menu-item" data-engine-action="outer-menu">戻る</button>
      </div>
    `);
    return;
  }
  tenotsuAddManagerExp(120, "復習チャレンジ");
  tenotsuUnlockMemory("review_challenge_001", "復習チャレンジ", "SDカードを使って、過去の思い出を復習しました。");
  tenotsuShowAlbum();
}

function tenotsuGrantOuterTestItems() {
  tenotsuAddItem("encounter_charm", 3);
  tenotsuAddItem("hikaru_glasses", 2);
  tenotsuAddItem("album_usb", 2);
  tenotsuAddItem("review_sd", 2);
  tenotsuUnlockMemory("outer_items_test", "外回り道具セット", "神社のお守り、ひかるの眼鏡、USBメモリ、SDカードを受け取りました。");
  tenotsuShowOuterMenu();
}
/* /v037_85 outer ADV / encounter / affection / item helpers */


/* v037_85: 左メニューをダブルクリックからクリックプレス/タップホールドへ変更 */
(function setupTenotsuLongPressMenu() {
  if (window.__TENOTSU_LONG_PRESS_MENU_READY__) return;
  window.__TENOTSU_LONG_PRESS_MENU_READY__ = true;

  const HOLD_MS = 620;
  let holdTimer = null;
  let holdStart = null;
  let moved = false;

  function isBattleArea(target) {
    return !!(target && target.closest && target.closest("#battle-root"));
  }

  function clearHold() {
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
    holdStart = null;
    moved = false;
  }

  function openHoldMenu() {
    if (window.__TENOTSU_UI_POINTER_ACTIVE__) { clearHold(); return; }
    clearHold();
    if (typeof window.tenotsuOpenLeftOfficeMenu === "function") {
      window.tenotsuOpenLeftOfficeMenu();
    } else if (typeof window.loadList === "function") {
      window.loadList("office6.json");
    }
  }

  document.addEventListener("dblclick", (event) => {
    // v037_85以降、左メニューはダブルクリックでは出さない。
    // 通常の会話進行ダブルクリックやバトル側処理を潰しすぎないため、バトル内は無視。
    if (!isBattleArea(event.target)) {
      event.stopPropagation();
      event.preventDefault();
    }
  }, true);

  document.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (isBattleArea(event.target)) return;
    if (event.target.closest && event.target.closest("button, a, input, select, textarea, [data-engine-action], .menu-item, .list-item, #menu-panel, #list-panel, .status-card, .memory-card, .memory-table-wrap, .story-management-surface, .center-surface-window, .secret-word-card")) return;

    holdStart = { x: event.clientX, y: event.clientY, t: Date.now() };
    moved = false;
    holdTimer = setTimeout(openHoldMenu, HOLD_MS);
  }, true);

  document.addEventListener("pointermove", (event) => {
    if (!holdStart) return;
    const dx = Math.abs(event.clientX - holdStart.x);
    const dy = Math.abs(event.clientY - holdStart.y);
    if (dx > 16 || dy > 16) {
      moved = true;
      clearHold();
    }
  }, true);

  document.addEventListener("pointerup", clearHold, true);
  document.addEventListener("pointercancel", clearHold, true);
})();
/* /v037_85 */

/* v037_85: 思い出アルバム / イベントCG鑑賞 */
async function tenotsuLoadEventCgAlbumData() {
  if (window.__TENOTSU_EVENT_CG_ALBUM__) return window.__TENOTSU_EVENT_CG_ALBUM__;
  const data = await safeFetchJson("scenario/data/event_cg_album.json?t=" + Date.now(), "event_cg_album.json");
  window.__TENOTSU_EVENT_CG_ALBUM__ = data;
  return data;
}

async function tenotsuShowMemoryAlbum() {
  const data = await tenotsuLoadEventCgAlbumData();
  const items = Array.isArray(data.items) ? data.items : [];
  const cards = items.map(item => {
    const isUnlocked = item.isUnlocked !== false;
    const thumb = isUnlocked ? (item.thumbnailColor || item.path) : (item.thumbnailMono || item.thumbnailColor || item.path);
    const mono = item.thumbnailMono || "";
    const scenarioButton = item.scenario ? `<button class="mini-action" data-engine-action="album-story-play" data-scenario="${item.scenario}" data-character-id="${item.characterId || "manager"}">シナリオ再生</button>` : "";
    return `
      <div class="album-card ${isUnlocked ? "unlocked" : "locked"}">
        <button class="album-thumb" data-engine-action="event-cg-view" data-cg-path="${item.path}" data-cg-title="${item.title}" data-cg-scenario="${item.scenario || ""}" data-character-id="${item.characterId || "manager"}">
          <img src="${thumb}" alt="${item.title}" loading="lazy">
          <span>${item.title}</span>
        </button>
        <div class="album-card-meta">
          <span>${item.characterName || item.type || "CG"}</span>
          ${mono ? `<span class="album-mono-note">モノクロサムネ登録済</span>` : ""}
        </div>
        <div class="album-card-actions">
          <button class="mini-action" data-engine-action="event-cg-view" data-cg-path="${item.path}" data-cg-title="${item.title}" data-cg-scenario="${item.scenario || ""}" data-character-id="${item.characterId || "manager"}">CG鑑賞</button>
          ${scenarioButton}
        </div>
      </div>
    `;
  }).join("");

  tenotsuShowCenterSurface("思い出アルバム", `
    <div class="status-card memory-card memory-album-surface">
      <h3>思い出アルバム</h3>
      <p class="surface-note">イベントCG鑑賞モードです。カラー/モノクロサムネとシナリオ再生を管理します。</p>
      <div class="album-grid">
        ${cards || "<p>表示できるイベントCGがまだありません。</p>"}
      </div>
      <button class="menu-item" data-engine-action="members">メンバーへ戻る</button>
    </div>
  `);
}

function tenotsuShowEventCgViewer(path, title, scenario = "", characterId = "manager") {
  const playButton = scenario ? `<button class="menu-item" data-engine-action="album-story-play" data-scenario="${scenario}" data-character-id="${characterId || "manager"}">この思い出を再生</button>` : "";
  tenotsuShowCenterSurface(title || "イベントCG", `
    <div class="status-card memory-card event-cg-viewer">
      <img src="${path}" alt="${title || "イベントCG"}">
      <div class="event-cg-caption">${title || ""}</div>
      ${playButton}
      <button class="menu-item" data-engine-action="memory-album">思い出アルバムへ戻る</button>
    </div>
  `);
}
/* /v037_85 */



/* v037_85: 左メニュー内容 / 思い出ストーリー管理 */
const TENOTSU_STORY_MASTER = [
  {
    "characterId": "manager",
    "characterName": "店長",
    "storyId": "tutorial_001",
    "title": "チュートリアル",
    "type": "tutorial",
    "unlock": "初期",
    "album": true,
    "scenario": "000start.json"
  },
  {
    "characterId": "manager",
    "characterName": "店長",
    "storyId": "prologue_001",
    "title": "プロローグ",
    "type": "prologue",
    "unlock": "初期",
    "album": true,
    "scenario": "gamestart.json"
  },
  {
    "characterId": "aa",
    "characterName": "緋奈",
    "storyId": "aa_intro_001",
    "title": "緋奈の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_hina.json"
  },
  {
    "characterId": "aa",
    "characterName": "緋奈",
    "storyId": "aa_memory_spring_bento_001",
    "title": "春の公園でのお弁当タイム",
    "type": "memory",
    "unlock": "思い出アルバム解放",
    "album": true,
    "scenario": "memory_hina_spring_bento.json",
    "cg": "images/assets/cg/aa_memory_spring_bento_cg.png",
    "thumbnailColor": "images/assets/thumb/aa_memory_spring_bento_thumb_color.png",
    "thumbnailMono": "images/assets/thumb/aa_memory_spring_bento_thumb_mono.png"
  },
  {
    "characterId": "aa",
    "characterName": "緋奈",
    "storyId": "aa_outer_001",
    "title": "外回り：緋奈",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "ab",
    "characterName": "藍",
    "storyId": "ab_intro_001",
    "title": "藍の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_ai.json"
  },
  {
    "characterId": "ab",
    "characterName": "藍",
    "storyId": "ab_memory_spring_book_bread_001",
    "title": "桜木陰のしおり",
    "type": "memory",
    "unlock": "思い出アルバム解放",
    "album": true,
    "scenario": "memory_ai_spring_book_bread.json",
    "cg": "images/assets/cg/ab_memory_spring_book_bread_close_cg.png",
    "thumbnailColor": "images/assets/thumb/ab_memory_spring_book_bread_close_thumb_color.png",
    "thumbnailMono": "images/assets/thumb/ab_memory_spring_book_bread_close_thumb_mono.png"
  },
  {
    "characterId": "ab",
    "characterName": "藍",
    "storyId": "ab_outer_001",
    "title": "外回り：藍",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "ac",
    "characterName": "翠",
    "storyId": "ac_intro_001",
    "title": "翠の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_midori.json"
  },
  {
    "characterId": "ac",
    "characterName": "翠",
    "storyId": "ac_outer_001",
    "title": "外回り：翠",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "ad",
    "characterName": "こがね",
    "storyId": "ad_intro_001",
    "title": "こがねの自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_kogane.json"
  },
  {
    "characterId": "ad",
    "characterName": "こがね",
    "storyId": "ad_outer_001",
    "title": "外回り：こがね",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "ae",
    "characterName": "琥珀",
    "storyId": "ae_intro_001",
    "title": "琥珀の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_kohaku.json"
  },
  {
    "characterId": "ae",
    "characterName": "琥珀",
    "storyId": "ae_outer_001",
    "title": "外回り：琥珀",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "af",
    "characterName": "真花",
    "storyId": "af_intro_001",
    "title": "真花の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_manaka.json"
  },
  {
    "characterId": "af",
    "characterName": "真花",
    "storyId": "af_outer_001",
    "title": "外回り：真花",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "ag",
    "characterName": "雪乃",
    "storyId": "ag_intro_001",
    "title": "雪乃の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_yukino.json"
  },
  {
    "characterId": "ag",
    "characterName": "雪乃",
    "storyId": "ag_outer_001",
    "title": "外回り：雪乃",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "ah",
    "characterName": "美空",
    "storyId": "ah_intro_001",
    "title": "美空の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_misora.json"
  },
  {
    "characterId": "ah",
    "characterName": "美空",
    "storyId": "ah_outer_001",
    "title": "外回り：美空",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "ai",
    "characterName": "夜空",
    "storyId": "ai_intro_001",
    "title": "夜空の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_yozora.json"
  },
  {
    "characterId": "ai",
    "characterName": "夜空",
    "storyId": "ai_outer_001",
    "title": "外回り：夜空",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "aj",
    "characterName": "桃",
    "storyId": "aj_intro_001",
    "title": "桃の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_momo.json"
  },
  {
    "characterId": "aj",
    "characterName": "桃",
    "storyId": "aj_outer_001",
    "title": "外回り：桃",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "ak",
    "characterName": "彩愛",
    "storyId": "ak_intro_001",
    "title": "彩愛の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_ayame.json"
  },
  {
    "characterId": "ak",
    "characterName": "彩愛",
    "storyId": "ak_outer_001",
    "title": "外回り：彩愛",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "al",
    "characterName": "里美",
    "storyId": "al_intro_001",
    "title": "里美の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_satomi.json"
  },
  {
    "characterId": "al",
    "characterName": "里美",
    "storyId": "al_outer_001",
    "title": "外回り：里美",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  },
  {
    "characterId": "am",
    "characterName": "萌",
    "storyId": "am_intro_001",
    "title": "萌の自己紹介",
    "type": "intro",
    "unlock": "初期",
    "album": true,
    "scenario": "intro_moe.json"
  },
  {
    "characterId": "am",
    "characterName": "萌",
    "storyId": "am_outer_001",
    "title": "外回り：萌",
    "type": "outer",
    "unlock": "GOODで思い出追加",
    "album": false,
    "scenario": ""
  }
];

function tenotsuGetStoryMaster() {
  return TENOTSU_STORY_MASTER.slice();
}

function tenotsuGetStoriesByCharacter() {
  const grouped = {};
  TENOTSU_STORY_MASTER.forEach(story => {
    if (!grouped[story.characterId]) grouped[story.characterId] = { characterId: story.characterId, characterName: story.characterName, stories: [] };
    grouped[story.characterId].stories.push(story);
  });
  return grouped;
}

function tenotsuOpenLeftOfficeMenu() {
  // v037_85: 左は旧システムメニュー(menu01)専用。
  const listPanel = document.getElementById("list-panel");
  if (listPanel) listPanel.classList.add("hidden");
  if (typeof window.loadMenu === "function") {
    window.loadMenu("menu01.json");
    return;
  }
  const html = `
    <div class="left-office-menu left-system-menu">
      <div class="left-office-menu-title">システムメニュー</div>
      <div class="left-office-grid">
        <button class="menu-item" data-engine-action="office6">メインメニュー</button>
        <button class="menu-item" data-engine-action="cacheclear">キャッシュ削除</button>
      </div>
    </div>
  `;
  tenotsuShowDynamicPanel("左メニュー", html);
}

function tenotsuShowMemoryCharacterList() {
  const grouped = tenotsuGetStoriesByCharacter();
  const order = ["manager","aa","ab","ac","ad","ae","af","ag","ah","ai","aj","ak","al","am"];
  const buttons = order
    .filter(id => grouped[id])
    .map(id => {
      const g = grouped[id];
      return `<button class="menu-item" data-engine-action="memory-character" data-character-id="${g.characterId}">${g.characterName}の思い出 <small>${g.stories.length}件</small></button>`;
    })
    .join("");

  tenotsuShowDynamicPanel("思い出", `
    <div class="status-card memory-card">
      <h3>思い出アルバム</h3>
      <p>先頭は店長の思い出です。チュートリアルやプロローグをここに整理します。</p>
      ${buttons}
      <button class="menu-item" data-engine-action="members">戻る</button>
    </div>
  `);
}

function tenotsuShowMemoryCharacterStories(characterId) {
  window.__TENOTSU_LAST_MEMORY_CHARACTER__ = characterId || "manager";
  const grouped = tenotsuGetStoriesByCharacter();
  const group = grouped[characterId] || grouped.manager;
  const affection = tenotsuGetAffection ? tenotsuGetAffection().characters || {} : {};
  const album = tenotsuGetAlbum ? tenotsuGetAlbum() : { memories: [] };

  const rows = group.stories.map(story => {
    const albumHit = story.album || album.memories.some(m => (m.id || "").includes(story.characterId) || (m.title || "").includes(story.characterName));
    const fav = story.characterId === "manager" ? "-" : (affection[story.characterId] ?? 0);
    const playButton = story.scenario
      ? `<button class="mini-action" data-engine-action="memory-play" data-scenario="${story.scenario}" data-character-id="${story.characterId}">再生</button>`
      : `<button class="mini-action" disabled>未実装</button>`;
    return `
      <tr>
        <td>${story.title}</td>
        <td>${story.type}</td>
        <td>${story.unlock}</td>
        <td>${fav}</td>
        <td>${albumHit ? "登録済" : "未登録"}</td>
        <td>${playButton}</td>
      </tr>
    `;
  }).join("");

  tenotsuShowDynamicPanel(`${group.characterName}の思い出`, `
    <div class="status-card memory-card">
      <h3>${group.characterName}の思い出</h3>
      <div class="memory-table-wrap">
        <table class="memory-table">
          <thead>
            <tr>
              <th>ストーリー</th>
              <th>種別</th>
              <th>開放条件</th>
              <th>好感度</th>
              <th>アルバム</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <button class="menu-item" data-engine-action="title-return-archive">タイトル後メニュー</button>
      <button class="menu-item" data-engine-action="title-return-archive">タイトル後メニュー</button>
      <button class="menu-item" data-engine-action="memory-list">思い出アルバムへ</button>
      <button class="menu-item" data-engine-action="members">メンバーへ戻る</button>
    </div>
  `);
}

function tenotsuShowStoryManagementTable() {
  const rows = TENOTSU_STORY_MASTER.map(story => `
    <tr>
      <td>${story.characterName}</td>
      <td>${story.storyId}</td>
      <td>${story.title}</td>
      <td>${story.type}</td>
      <td>${story.unlock}</td>
      <td>${story.scenario || "-"}</td>
    </tr>
  `).join("");

  tenotsuShowCenterSurface("ストーリー管理表", `
    <div class="status-card memory-card story-management-surface center-between-side-menus">
      <h3>メンバーごとの思い出表</h3>
      <p class="surface-note">左メニューと右メニューの間に表示しています。表内はスクロールできます。</p>
      <div class="memory-table-wrap">
        <table class="memory-table">
          <thead>
            <tr>
              <th>対象</th>
              <th>ID</th>
              <th>タイトル</th>
              <th>種別</th>
              <th>開放条件</th>
              <th>シナリオ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <button class="menu-item" data-engine-action="memory-album">思い出アルバムへ</button>
      <button class="menu-item" data-engine-action="members">メンバーへ戻る</button>
    </div>
  `);
}
/* /v037_85 */


/* v037_85: 「タイトルに戻る」後メニューをメンバー配下へ移設 */
function tenotsuShowTitleReturnMenuArchive() {
  tenotsuShowDynamicPanel("タイトルメニュー保管", `
    <div class="status-card memory-card">
      <h3>タイトルに戻る後メニュー</h3>
      <p>以前「タイトルに戻る」後に表示していたメニューです。今後は、6大メニュー ＞ メンバー ＞ メンバー一覧/ストーリー管理表 から確認できます。</p>
      <button class="menu-item" data-engine-action="office6">6大メニューへ戻る</button>
      <button class="menu-item" data-engine-action="memory-album">思い出アルバム</button>
      <button class="menu-item" data-engine-action="story-table">ストーリー管理表</button>
      <button class="menu-item" data-engine-action="member-list">メンバー一覧</button>
      <button class="menu-item" data-engine-action="battle">店舗営業プロトタイプ</button>
      <button class="menu-item" data-engine-action="outer-menu">外回り</button>
      <button class="menu-item" data-engine-action="shop">ショップ</button>
      <button class="menu-item" data-engine-action="settings">設定</button>
    </div>
  `);
}

function tenotsuShowMemberListMenu() {
  const order = [
    ["manager", "店長"],
    ["aa", "星野 緋奈"],
    ["ab", "速水川 藍"],
    ["ac", "草壁 翠"],
    ["ad", "小麦沢 こがね"],
    ["ae", "春日原 琥珀"],
    ["af", "大道寺 真花"],
    ["ag", "氷神 雪乃"],
    ["ah", "双沢 美空"],
    ["ai", "双沢 夜空"],
    ["aj", "芝桜 桃"],
    ["ak", "紫藤 彩愛"],
    ["al", "餅月 里美"],
    ["am", "草壁 萌"]
  ];

  const buttons = order.map(([id, name]) => `
    <button class="menu-item" data-engine-action="memory-character" data-character-id="${id}">${name}</button>
  `).join("");

  tenotsuShowDynamicPanel("メンバー一覧", `
    <div class="status-card memory-card">
      <h3>メンバー一覧</h3>
      <p>キャラクターごとの思い出/ストーリー管理へ移動します。先頭は店長です。</p>
      ${buttons}
      <button class="menu-item" data-engine-action="title-return-archive">タイトル後メニュー</button>
      <button class="menu-item" data-engine-action="story-table">ストーリー管理表</button>
      <button class="menu-item" data-engine-action="members">戻る</button>
    </div>
  `);
}
/* /v037_85 */


/* v037_85: ストーリー終了後に元メニューへフェード復帰 */
window.__TENOTSU_RETURN_MENU_STACK__ = window.__TENOTSU_RETURN_MENU_STACK__ || [];
window.__TENOTSU_STORY_ENDING__ = false;

function tenotsuPushReturnMenu(kind, value) {
  window.__TENOTSU_RETURN_MENU_STACK__ = window.__TENOTSU_RETURN_MENU_STACK__ || [];
  const last = window.__TENOTSU_RETURN_MENU_STACK__[window.__TENOTSU_RETURN_MENU_STACK__.length - 1];
  if (last && last.kind === kind && last.value === value) return;
  window.__TENOTSU_RETURN_MENU_STACK__.push({ kind, value });
  window.__TENOTSU_RETURN_MENU_STACK__ = window.__TENOTSU_RETURN_MENU_STACK__.slice(-10);
}

function tenotsuReturnToPreviousMenu() {
  const stack = window.__TENOTSU_RETURN_MENU_STACK__ || [];
  const target = stack.pop() || { kind: "list", value: "office6.json" };
  window.__TENOTSU_RETURN_MENU_STACK__ = stack;

  if (target.kind === "memory-character") {
    tenotsuShowMemoryCharacterStories(target.value || "manager");
  } else if (target.kind === "members") {
    tenotsuShowMemberMenu();
  } else if (target.kind === "memory-list") {
    tenotsuShowMemoryCharacterList();
  } else if (target.kind === "memory-album") {
    tenotsuShowMemoryAlbum();
  } else if (target.kind === "story-table") {
    tenotsuShowStoryManagementTable();
  } else if (target.kind === "left-menu") {
    tenotsuOpenLeftOfficeMenu();
  } else if (target.kind === "list" && typeof window.loadList === "function") {
    window.loadList(target.value || "office6.json");
  } else if (target.kind === "menu" && typeof window.loadMenu === "function") {
    window.loadMenu(target.value || "menu01.json");
  } else {
    if (typeof window.loadList === "function") window.loadList("office6.json");
  }
}


/* v037_93: ストーリー終了時のブラックフェード */
function tenotsuGetBlackFadeLayer() {
  let layer = document.getElementById("tenotsu-black-fade-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "tenotsu-black-fade-layer";
    document.body.appendChild(layer);
  }
  return layer;
}
function tenotsuBlackFadeOut(duration = 520) {
  const layer = tenotsuGetBlackFadeLayer();
  layer.style.transition = `opacity ${duration}ms ease`;
  layer.style.opacity = "1";
  layer.style.pointerEvents = "auto";
}
function tenotsuBlackFadeIn(duration = 520) {
  const layer = tenotsuGetBlackFadeLayer();
  layer.style.transition = `opacity ${duration}ms ease`;
  layer.style.opacity = "0";
  layer.style.pointerEvents = "none";
}
/* /v037_93 */

function tenotsuHandleStoryEndReturn() {
  if (window.__TENOTSU_STORY_ENDING__) return;
  window.__TENOTSU_STORY_ENDING__ = true;

  try {
    if (typeof randomImagesOff === "function") randomImagesOff();
    if (typeof randomTextsOff === "function") randomTextsOff();
  } catch (_) {}

  const dialogueBox = document.getElementById("dialogue-box");
  const textBox = document.getElementById("text");
  const nameBox = document.getElementById("name");
  const clickLayer = document.getElementById("click-layer");

  if (nameBox) nameBox.textContent = "";
  if (textBox) textBox.innerHTML = "（物語は つづく・・・）";
  if (dialogueBox) {
    dialogueBox.classList.remove("hidden");
    dialogueBox.classList.remove("story-end-fadeout");
  }
  if (clickLayer) clickLayer.style.pointerEvents = "none";

  window.setTimeout(() => {
    // v038_27: 「物語は つづく・・・」後、1秒かけてゆっくりブラックフェード。
    tenotsuBlackFadeOut(1000);
    if (dialogueBox) dialogueBox.classList.add("story-end-fadeout");
  }, 650);

  window.setTimeout(() => {
    if (dialogueBox) {
      dialogueBox.classList.remove("story-end-fadeout");
      dialogueBox.classList.add("hidden");
    }
    window.__TENOTSU_STORY_ENDING__ = false;
    tenotsuSetStoryPartActive(false, "office");
    tenotsuEnterOfficeMode("story-end");
  }, 1780);

  window.setTimeout(() => {
    tenotsuBlackFadeIn(850);
    if (clickLayer) clickLayer.style.pointerEvents = "auto";
  }, 1980);
}
/* /v037_85 */


/* v037_85: タイトルタイル表示後も右メニューを6大メニュー固定 */
window.__TENOTSU_MAIN_MENU_LOCK__ = window.__TENOTSU_MAIN_MENU_LOCK__ || false;

function tenotsuLockMainMenu() {
  window.__TENOTSU_MAIN_MENU_LOCK__ = true;
}

function tenotsuUnlockMainMenu() {
  window.__TENOTSU_MAIN_MENU_LOCK__ = false;
}

function tenotsuEnsureOfficeSixMenuVisible() {
  if (!tenotsuIsOfficeMode || !tenotsuIsOfficeMode()) return;
  const listPanel = document.getElementById("list-panel");
  const menuPanel = document.getElementById("menu-panel");
  const battleRoot = document.getElementById("battle-root");
  if (battleRoot && !battleRoot.classList.contains("hidden")) return;
  if (typeof window.loadList === "function") {
    const menuPanel = document.getElementById("menu-panel");
    if (menuPanel) menuPanel.classList.add("hidden");
    window.loadList("office6.json");
    tenotsuLockMainMenu();
  }
}
/* /v037_85 */


/* v037_85 randomImagesOn office6 reassert wrapper */
window.addEventListener("load", () => {
  window.setTimeout(() => {
    if (typeof window.randomImagesOn === "function" && !window.__TENOTSU_RANDOM_WRAPPED__) {
      const originalRandomImagesOn = window.randomImagesOn;
      window.randomImagesOn = function wrappedRandomImagesOn(...args) {
        const result = originalRandomImagesOn.apply(this, args);
        window.setTimeout(() => {
          if (window.__TENOTSU_MAIN_MENU_LOCK__) tenotsuEnsureOfficeSixMenuVisible();
        }, 120);
        return result;
      };
      window.__TENOTSU_RANDOM_WRAPPED__ = true;
    }
  }, 0);
});
/* /v037_85 */


/* v037_85: ショップ 秘密の言葉 */
const TENOTSU_SECRET_WORD_KEY = "tenotsu_secret_words_v1";

const TENOTSU_SECRET_WORDS = {
  "てんおつ": {
    id: "tenotsu_start",
    title: "店長お疲れ様です",
    message: "秘密の言葉を確認しました。店長EXP +300、売上 +3000円。",
    exp: 300,
    sales: 3000,
    items: { encounter_charm: 2, album_usb: 1 }
  },
  "ひだまり": {
    id: "hidamari_bonus",
    title: "ひだまりボーナス",
    message: "ひだまりストアからの支給品です。売上 +5000円。",
    exp: 100,
    sales: 5000,
    items: { review_sd: 1 }
  },
  "おつかれさま": {
    id: "otsukaresama",
    title: "お疲れ様ボーナス",
    message: "日々の頑張りが認められました。店長EXP +500。",
    exp: 500,
    sales: 1000,
    items: { hikaru_glasses: 1 }
  },
  "つくも": {
    id: "tsukumo_support",
    title: "テックラボつくも支援",
    message: "テックラボつくもから便利道具が届きました。",
    exp: 150,
    sales: 2000,
    items: { album_usb: 2, review_sd: 1 }
  }
};

function tenotsuNormalizeSecretWord(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[ 　]/g, "")
    .replace(/[！!？?。.,、]/g, "");
}

function tenotsuGetSecretWordData() {
  const data = tenotsuLoadJsonStorage(TENOTSU_SECRET_WORD_KEY, {});
  data.used = Array.isArray(data.used) ? data.used : [];
  data.history = Array.isArray(data.history) ? data.history : [];
  return data;
}

function tenotsuSaveSecretWordData(data) {
  tenotsuSaveJsonStorage(TENOTSU_SECRET_WORD_KEY, data);
}

function tenotsuGrantSecretReward(def) {
  if (!def) return false;
  if (def.exp) tenotsuAddManagerExp(def.exp, "秘密の言葉");
  if (def.sales && typeof TenotsuEconomy !== "undefined" && TenotsuEconomy.addSales) {
    TenotsuEconomy.addSales(def.sales, "秘密の言葉");
  } else if (def.sales) {
    const e = tenotsuGetEconomy();
    e.totalSales += def.sales;
    e.availableSales += def.sales;
    e.history.unshift({ type: "sales", source: "秘密の言葉", amount: def.sales, at: new Date().toISOString() });
    e.history = e.history.slice(0, 30);
    tenotsuSaveJsonStorage(TENOTSU_ECONOMY_KEY, e);
  }
  if (def.items) {
    Object.entries(def.items).forEach(([id, count]) => tenotsuAddItem(id, count));
  }
  tenotsuUnlockMemory("secret_word_" + def.id, "秘密の言葉：" + def.title, def.message);
  return true;
}

function tenotsuShowSecretWordMenu(message = "") {
  const data = tenotsuGetSecretWordData();
  tenotsuShowDynamicPanel("秘密の言葉", `
    <div class="status-card secret-word-card">
      <h3>秘密の言葉</h3>
      <p>特定キーワードを入力すると、アイテムやボーナスがもらえます。</p>
      ${message ? `<p class="secret-word-message">${message}</p>` : ""}
      <input id="secret-word-input" class="secret-word-input" type="text" autocomplete="off" placeholder="秘密の言葉を入力">
      <button class="menu-item" data-engine-action="secret-word-submit">確認する</button>
      <button class="menu-item" data-engine-action="secret-word-hint">ヒントを見る</button>
      <button class="menu-item" data-engine-action="shop">ショップへ戻る</button>
      <p class="secret-word-used">使用済み：${data.used.length}件</p>
    </div>
  `);
  window.setTimeout(() => {
    const input = document.getElementById("secret-word-input");
    if (input) input.focus();
  }, 50);
}

function tenotsuSubmitSecretWord() {
  const input = document.getElementById("secret-word-input");
  const raw = input ? input.value : "";
  const key = tenotsuNormalizeSecretWord(raw);
  const def = TENOTSU_SECRET_WORDS[key];
  const data = tenotsuGetSecretWordData();

  if (!key) {
    tenotsuShowSecretWordMenu("言葉が入力されていません。");
    return;
  }
  if (!def) {
    tenotsuShowSecretWordMenu("その言葉では何も起きませんでした。");
    return;
  }
  if (data.used.includes(def.id)) {
    tenotsuShowSecretWordMenu("この秘密の言葉はすでに使用済みです。");
    return;
  }

  tenotsuGrantSecretReward(def);
  data.used.push(def.id);
  data.history.unshift({ id: def.id, word: key, at: new Date().toISOString() });
  data.history = data.history.slice(0, 30);
  tenotsuSaveSecretWordData(data);
  tenotsuShowSecretWordMenu(def.message);
}

function tenotsuShowSecretWordHint() {
  tenotsuShowSecretWordMenu("ヒント：店長へのあいさつ、店の名前、協力店の名前など。");
}
/* /v037_85 */


/* v037_85: キャラクター表情マスター */
const TENOTSU_EXPRESSION_MASTER_PATH = "scenario/data/character_expressions.json";
window.__TENOTSU_EXPRESSION_MASTER__ = window.__TENOTSU_EXPRESSION_MASTER__ || null;

async function tenotsuLoadExpressionMaster() {
  if (window.__TENOTSU_EXPRESSION_MASTER__) return window.__TENOTSU_EXPRESSION_MASTER__;
  const data = await safeFetchJson(TENOTSU_EXPRESSION_MASTER_PATH + "?t=" + Date.now(), "character_expressions.json");
  window.__TENOTSU_EXPRESSION_MASTER__ = data;
  return data;
}

function tenotsuExpressionFile(characterId, expressionNo = "01", variantNo = "01") {
  const master = window.__TENOTSU_EXPRESSION_MASTER__;
  if (!master || !master.assets || !master.assets[characterId]) return "";
  const exp = master.assets[characterId].expressions[String(expressionNo).padStart(2, "0")];
  return exp ? exp.engineSrc : "";
}

function tenotsuExpressionPath(characterId, expressionNo = "01", variantNo = "01") {
  const file = tenotsuExpressionFile(characterId, expressionNo, variantNo);
  return file ? (config.charPath + file) : "";
}

async function tenotsuShowExpressionCharacter(characterId) {
  const master = await tenotsuLoadExpressionMaster();
  const char = master.assets[characterId];
  if (!char) {
    tenotsuShowDynamicPanel("表情マスター", `<div class="status-card"><p>表情データがありません。</p><button class="menu-item" data-engine-action="members">戻る</button></div>`);
    return;
  }

  const rows = Object.entries(char.expressions).map(([no, exp]) => `
    <tr>
      <td>${no}</td>
      <td>${exp.label}</td>
      <td><code>${exp.file}</code></td>
      <td>${exp.exists ? "配置済" : "未配置"}</td>
    </tr>
  `).join("");

  tenotsuShowDynamicPanel(`${char.fullName} 表情一覧`, `
    <div class="status-card memory-card">
      <h3>${char.fullName} 表情一覧</h3>
      <p>命名規則：${char.base}+表情番号+01.webp</p>
      <div class="memory-table-wrap">
        <table class="memory-table">
          <thead><tr><th>No</th><th>表情</th><th>ファイル</th><th>状態</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <button class="menu-item" data-engine-action="expression-master">表情マスターへ</button>
      <button class="menu-item" data-engine-action="members">メンバーへ戻る</button>
    </div>
  `);
}

async function tenotsuShowExpressionMasterMenu() {
  const master = await tenotsuLoadExpressionMaster();
  const buttons = Object.entries(master.assets).map(([id, char]) => `
    <button class="menu-item" data-engine-action="expression-character" data-character-id="${id}">${char.fullName}</button>
  `).join("");
  tenotsuShowDynamicPanel("表情マスター", `
    <div class="status-card memory-card">
      <h3>表情マスター</h3>
      <p>01澄まし / 02微笑み / 03怒り / 04悲しみ / 05笑顔 / 06驚き / 07照れ / 08期待 / 09得意げ / 10軽い嫌悪 / 11心配不安 / 12動揺</p>
      ${buttons}
      <button class="menu-item" data-engine-action="members">戻る</button>
    </div>
  `);
}
/* /v037_85 */


/* v037_85: オートプレイ実行補強 */
window.__TENOTSU_AUTO_TIMER__ = null;
window.__TENOTSU_AUTO_DELAY_MS__ = 1450;

function tenotsuStopAutoPlayTimer() {
  if (window.__TENOTSU_AUTO_TIMER__) {
    clearTimeout(window.__TENOTSU_AUTO_TIMER__);
    window.__TENOTSU_AUTO_TIMER__ = null;
  }
}

function tenotsuScheduleAutoPlay() {
  tenotsuStopAutoPlayTimer();
  if (!isAutoMode) return;
  if (choicesEl && choicesEl.children && choicesEl.children.length > 0) return;
  const battleRoot = document.getElementById("battle-root");
  if (battleRoot && !battleRoot.classList.contains("hidden")) return;

  // 人物登場・画像ロード中でも、文章が終わっていれば進行できるようにする。
  const delay = Number(window.__TENOTSU_AUTO_DELAY_MS__ || autoWaitTime || 1450);
  window.__TENOTSU_AUTO_TIMER__ = setTimeout(() => {
    window.__TENOTSU_AUTO_TIMER__ = null;
    if (!isAutoMode) return;
    if (choicesEl && choicesEl.children && choicesEl.children.length > 0) return;
    const battleRoot2 = document.getElementById("battle-root");
    if (battleRoot2 && !battleRoot2.classList.contains("hidden")) return;

    // タイピング中だけ待つ。人物画像のロード状態では止めない。
    if (isPlaying) {
      tenotsuScheduleAutoPlay();
      return;
    }
    next();
  }, delay);
}

function tenotsuSetAutoMode(value) {
  isAutoMode = !!value;
  const btns = document.querySelectorAll('[data-engine-action="auto"], [data-action="auto"]');
  btns.forEach(btn => {
    btn.classList.toggle("active", isAutoMode);
    btn.textContent = isAutoMode ? "オートプレイ：ON" : "オートプレイ";
  });
  if (isAutoMode) tenotsuScheduleAutoPlay();
  else tenotsuStopAutoPlayTimer();
}
/* /v037_85 */

/* v037_85: UI操作中HOLD抑制 */
document.addEventListener("pointerdown", (event) => {
  if (event.target.closest && event.target.closest("#menu-panel, #list-panel, .status-card, .memory-card, .memory-table-wrap, .story-management-surface, .center-surface-window")) {
    window.__TENOTSU_UI_POINTER_ACTIVE__ = true;
  }
}, true);
document.addEventListener("pointerup", () => { window.__TENOTSU_UI_POINTER_ACTIVE__ = false; }, true);
document.addEventListener("pointercancel", () => { window.__TENOTSU_UI_POINTER_ACTIVE__ = false; }, true);


/* v037_85: 中央サーフェス表示 */
function tenotsuCloseCenterSurface() {
  const old = document.getElementById("center-surface-panel");
  if (old) old.remove();
}

function tenotsuShowCenterSurface(title, html) {
  tenotsuCloseCenterSurface();
  const panel = document.createElement("div");
  panel.id = "center-surface-panel";
  panel.className = "center-surface-panel";
  panel.innerHTML = `
    <div class="center-surface-header">
      <strong>${title || ""}</strong>
      <button class="center-surface-close" data-engine-action="center-surface-close">×</button>
    </div>
    <div class="center-surface-body">${html}</div>
  `;
  document.body.appendChild(panel);
  return panel;
}
/* /v037_85 */


/* v037_93: ストーリー中の右メニュー系クリック抑止 */
document.addEventListener("click", (event) => {
  if (!tenotsuIsStoryPartActive || !tenotsuIsStoryPartActive()) return;
  const target = event.target;
  if (target && target.closest && target.closest("#list-panel, .right-main-panel, .right-menu, .right-panel")) {
    event.preventDefault();
    event.stopPropagation();
    if (listPanel) listPanel.classList.add("hidden");
  }
}, true);
/* /v037_93 */


/* v037_93: バトル終了/閉じる後は事務所モードへ戻す補助 */
window.addEventListener("load", () => {
  window.setTimeout(() => {
    try {
      if (window.BattleProto && typeof window.BattleProto.openBattle === "function" && !window.BattleProto.__TENOTSU_OFFICE_WRAP__) {
        const originalOpenBattle = window.BattleProto.openBattle;
        window.BattleProto.openBattle = function wrappedOpenBattle(...args) {
          tenotsuEnterBattleMode && tenotsuEnterBattleMode();
          return originalOpenBattle.apply(this, args);
        };
        window.BattleProto.__TENOTSU_OFFICE_WRAP__ = true;
      }
    } catch (err) {
      console.warn("[TENOTSU BATTLE MODE WRAP FAILED]", err);
    }
  }, 0);
});
/* /v037_93 */


/* v038_27 office/menu/character stability patch */
(function(){
  const OFFICE_MENU_LABELS = ["店舗","メンバー","店舗営業","外回り","ショップ","設定"];
  const OLD_MENU_PATTERNS = /(と遊ぶ|旧メニュー|プロトタイプ|⓪|①|②|③|④|⑤|ランダムSHOW|オートプレイ|スキップ|バックログ)/;
  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  window.tenotsuGameMode = window.tenotsuGameMode || document.body?.dataset?.gameMode || "title";
  function rightPanel(){ return qs("#list-panel") || qs("#right-menu") || qs(".right-menu") || qs(".right-panel") || qs("#rightPanel"); }

  function hideRight(){
    const p = rightPanel();
    if (!p) return;
    p.classList.remove("show","open","active","visible","is-visible");
    p.style.display = "none";
  }
  function showRight(){
    const p = rightPanel();
    if (!p) return;
    p.style.display = "";
    p.style.visibility = "visible";
    p.style.opacity = "1";
    p.classList.add("show","open","active","visible");
  }
  function oldMenuLike(el){
    if (!el) return false;
    const text = (el.textContent || "").trim();
    const cls = (el.className || "").toString().toLowerCase();
    const id = (el.id || "").toLowerCase();
    return OLD_MENU_PATTERNS.test(text) || cls.includes("pink") || id.includes("pink") || cls.includes("old-menu");
  }
  function removeOldMenus(){
    qsa(".pink-menu,.old-menu,.title-menu,.prototype-menu,[data-menu='old'],[data-menu='title-old']").forEach(el => {
      if (oldMenuLike(el)) el.remove();
    });
    qsa("button,.menu-item,li,a").forEach(el => {
      if (oldMenuLike(el) && !el.closest("#text-area,#textarea,#message-window,.message-window")) el.remove();
    });
  }
  function buildSix(){
    const p = rightPanel();
    if (!p) return;
    p.innerHTML = "";
    p.classList.add("tenotsu-six-main-menu");
    p.dataset.officeMenu = "six-main";
    const title = document.createElement("div");
    title.className = "tenotsu-six-main-title";
    title.textContent = "メインメニュー";
    p.appendChild(title);
    const grid = document.createElement("div");
    grid.className = "tenotsu-six-main-grid";
    OFFICE_MENU_LABELS.forEach(label => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tenotsu-six-main-button";
      btn.textContent = label;
      btn.dataset.menuLabel = label;
      btn.addEventListener("click", () => {
        if (label === "店舗営業" && typeof window.startBattle === "function") {
          window.tenotsuSetGameMode("battle"); window.startBattle();
        } else if (label === "外回り") {
          window.tenotsuSetGameMode("town");
          if (typeof window.loadScenario === "function") window.loadScenario("scenario/scenario/town_walk.json");
        } else if (label === "ショップ") {
          window.tenotsuSetGameMode("shop");
          if (typeof window.tenotsuShowShopMenu === "function") window.tenotsuShowShopMenu();
        } else if (label === "設定") {
          window.tenotsuSetGameMode("settings");
          if (typeof window.tenotsuShowSettingsMenu === "function") window.tenotsuShowSettingsMenu();
        } else if (label === "メンバー") {
          window.tenotsuSetGameMode("office"); if (window.tenotsuEnterOfficeMode) window.tenotsuEnterOfficeMode();
          if (typeof window.tenotsuShowMemberMenu === "function") window.tenotsuShowMemberMenu();
        } else {
          window.tenotsuSetGameMode("office"); if (window.tenotsuEnterOfficeMode) window.tenotsuEnterOfficeMode();
        }
      });
      grid.appendChild(btn);
    });
    p.appendChild(grid);
  }

  const OFFICE_CHARS = [
    ["星野 緋奈","a10501.webp","店長、今日も一緒にがんばりましょう！"],
    ["速水川 藍","b10201.webp","てんちょー、少し休憩も大事ですよ。"],
    ["草壁 翠","c10201.webp","キミ、今日の予定は確認済みかな？"],
    ["小麦沢 こがね","d10501.webp","店長、今日もアゲてこー！"],
    ["春日原 琥珀","e10501.webp","旦那、困ったことがあったらオレに任せな！"],
    ["大道寺 真花","f10201.webp","店長、本日もよろしくお願いします。"],
    ["氷神 雪乃","g10201.webp","貴方様、無理はなさらないでくださいね。"],
    ["双沢 美空","h10501.webp","店長、今日も笑顔でいきましょう。"],
    ["双沢 夜空","i10201.webp","あんた、今日もちゃんと見てるから。"],
    ["芝桜 桃","j10501.webp","店長、ウチに任せとけばバズるって！"],
    ["紫藤 彩愛","k10201.webp","貴方、今日も美しく整えてまいりましょう。"],
    ["餅月 里美","l10501.webp","てんちょ～、お茶でも飲んでいきます～？"],
    ["草壁 萌","m10201.webp","おにいちゃん、今日も一緒にがんばろうね。"]
  ];
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function charLayer(){
    let l = qs("#office-character-layer");
    if (!l) {
      l = document.createElement("div");
      l.id = "office-character-layer";
      l.className = "office-character-layer";
      (qs("#game") || qs("#main") || qs(".game-screen") || document.body).appendChild(l);
    }
    return l;
  }
  function commentBox(){
    let b = qs("#office-comment-box") || qs("#title-comment-box");
    if (!b) {
      b = document.createElement("div");
      b.id = "office-comment-box";
      b.className = "office-comment-box title-comment-box";
      (qs("#game") || qs("#main") || qs(".game-screen") || document.body).appendChild(b);
    }
    return b;
  }
  window.tenotsuRefreshOfficeCharacters = function(){
    const picks = shuffle(OFFICE_CHARS).slice(0, Math.random() < 0.55 ? 2 : 3);
    window.tenotsuOfficeCharacterPicks = picks;
    window.tenotsuOfficeFrontCharacter = picks[0];
    const l = charLayer();
    l.innerHTML = "";
    l.style.display = "";
    l.classList.add("show");
    picks.forEach((c,i)=>{
      const img = document.createElement("img");
      img.className = "office-character-stand office-character-stand-" + i;
      img.alt = c[0];
      img.src = "images/assets/char/" + c[1];
      img.onerror = () => {
        img.onerror = () => { img.style.display = "none"; };
        img.src = "images/assets/char/" + c[1].replace(/\.png$/i, ".webp");
      };
      l.appendChild(img);
    });
    const b = commentBox();
    b.style.display = "";
    b.innerHTML = "<span class='comment-speaker'>" + picks[0][0] + "</span><span class='comment-text'>" + picks[0][2] + "</span>";
  };
  window.tenotsuSetGameMode = function(mode){
    window.tenotsuGameMode = mode || "office";
    document.body.dataset.gameMode = window.tenotsuGameMode;
    document.body.classList.toggle("mode-title", window.tenotsuGameMode === "title");
    document.body.classList.toggle("mode-office", window.tenotsuGameMode === "office");
    document.body.classList.toggle("mode-story", window.tenotsuGameMode === "story");
    document.body.classList.toggle("story-playing", window.tenotsuGameMode === "story");
    if (window.tenotsuGameMode === "title") hideRight();
    if (window.tenotsuGameMode === "office") setTimeout(window.tenotsuEnterOfficeMode, 0);
  };
  window.tenotsuEnterOfficeMode = function(){
    window.tenotsuGameMode = "office";
    document.body.dataset.gameMode = "office";
    document.body.classList.add("mode-office");
    document.body.classList.remove("mode-title","mode-story","story-playing");
    if (typeof window.tenotsuSetStoryPlayingFlag === "function") window.tenotsuSetStoryPlayingFlag(false);
    removeOldMenus(); buildSix(); showRight(); window.tenotsuRefreshOfficeCharacters();
    setTimeout(()=>{ removeOldMenus(); buildSix(); showRight(); }, 120);
    setTimeout(()=>{ removeOldMenus(); buildSix(); showRight(); }, 600);
  };
  const oldLoadList = window.loadList;
  if (typeof oldLoadList === "function") window.loadList = function(){
    if ((window.tenotsuGameMode || document.body.dataset.gameMode) === "office") { window.tenotsuEnterOfficeMode(); return; }
    return oldLoadList.apply(this, arguments);
  };
  const oldShowList = window.showList;
  if (typeof oldShowList === "function") window.showList = function(){
    if ((window.tenotsuGameMode || document.body.dataset.gameMode) === "office") { window.tenotsuEnterOfficeMode(); return; }
    return oldShowList.apply(this, arguments);
  };
  document.addEventListener("DOMContentLoaded", function(){
    if ((window.tenotsuGameMode || document.body.dataset.gameMode) === "office") window.tenotsuEnterOfficeMode();
    else { hideRight(); removeOldMenus(); }
  });
  document.addEventListener("tenotsu:office", function(){ window.tenotsuEnterOfficeMode(); });
})();
/* /v038_27 office/menu/character stability patch */


/* v038_27 office character actual-path patch */
(function(){
  const VERSION = "v038_27";
  const OFFICE_CHARS = [
    ["星野 緋奈","a10501.webp","店長、今日も一緒にがんばりましょう！"],
    ["速水川 藍","b10201.webp","てんちょー、少し休憩も大事ですよ。"],
    ["草壁 翠","c10201.webp","キミ、今日の予定は確認済みかな？"],
    ["小麦沢 こがね","d10501.webp","店長、今日もアゲてこー！"],
    ["春日原 琥珀","e10501.webp","旦那、困ったことがあったらオレに任せな！"],
    ["大道寺 真花","f10201.webp","店長、本日もよろしくお願いします。"],
    ["氷神 雪乃","g10201.webp","貴方様、無理はなさらないでくださいね。"],
    ["双沢 美空","h10501.webp","店長、今日も笑顔でいきましょう。"],
    ["双沢 夜空","i10201.webp","あんた、今日もちゃんと見てるから。"],
    ["芝桜 桃","j10501.webp","店長、ウチに任せとけばバズるって！"],
    ["紫藤 彩愛","k10201.webp","貴方、今日も美しく整えてまいりましょう。"],
    ["餅月 里美","l10501.webp","てんちょ～、お茶でも飲んでいきます～？"],
    ["草壁 萌","m10201.webp","おにいちゃん、今日も一緒にがんばろうね。"]
  ];
  function qs(s){ return document.querySelector(s); }
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function host(){ return qs("#game") || qs("#root") || qs("#main") || qs(".game-screen") || document.body; }
  function ensureLayer(){
    let h=host();
    let l=document.getElementById("office-character-layer");
    if(!l){ l=document.createElement("div"); l.id="office-character-layer"; l.className="office-character-layer"; h.appendChild(l); }
    l.style.display="block";
    l.style.visibility="visible";
    l.style.opacity="1";
    l.style.zIndex="35";
    return l;
  }
  function ensureComment(){
    let h=host();
    let b=document.getElementById("office-comment-box") || document.getElementById("title-comment-box");
    if(!b){ b=document.createElement("div"); b.id="office-comment-box"; b.className="office-comment-box title-comment-box"; h.appendChild(b); }
    b.style.display="block";
    return b;
  }
  window.tenotsuRefreshOfficeCharacters = function(){
    const isOffice = (window.tenotsuGameMode || document.body.dataset.gameMode) === "office" || document.body.classList.contains("mode-office");
    if(!isOffice) return;
    const picks = shuffle(OFFICE_CHARS).slice(0, Math.random() < 0.55 ? 2 : 3);
    window.tenotsuOfficeCharacterPicks = picks;
    window.tenotsuOfficeFrontCharacter = picks[0];
    const layer = ensureLayer();
    layer.innerHTML = "";
    picks.forEach((c,i)=>{
      const img=document.createElement("img");
      img.className="office-character-stand office-character-stand-"+i;
      img.alt=c[0];
      img.src="images/assets/char/"+c[1];
      img.onerror=()=>{ img.onerror=null; img.src="./images/assets/char/"+c[1]; };
      layer.appendChild(img);
    });
    const box=ensureComment();
    box.innerHTML="<span class='comment-speaker'>"+picks[0][0]+"</span><span class='comment-text'>"+picks[0][2]+"</span>";
  };
  const prevEnter = window.tenotsuEnterOfficeMode;
  window.tenotsuEnterOfficeMode = function(){
    if(typeof prevEnter === "function") prevEnter.apply(this, arguments);
    window.tenotsuGameMode="office";
    document.body.dataset.gameMode="office";
    document.body.classList.add("mode-office");
    setTimeout(()=>window.tenotsuRefreshOfficeCharacters(), 20);
    setTimeout(()=>window.tenotsuRefreshOfficeCharacters(), 260);
  };
  document.addEventListener("DOMContentLoaded", ()=>{
    if((window.tenotsuGameMode || document.body.dataset.gameMode)==="office" || document.body.classList.contains("mode-office")){
      window.tenotsuRefreshOfficeCharacters();
    }
  });
  window.tenotsuOfficeCharacterActualPathPatchVersion = VERSION;
})();
/* /v038_27 office character actual-path patch */


/* v038_27 exchange shop background + office character z-index fix */
(function(){
  const EXCHANGE_BG = "images/assets/bgev/bg_exchange_item_counter.png";

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  function setMainBackground(src){
    const candidates = [
      qs("#background"),
      qs("#bg"),
      qs("#bgev"),
      qs(".background"),
      qs(".bg"),
      qs(".bgev"),
      qs("#game-bg"),
      qs("#gameBackground")
    ].filter(Boolean);

    let applied = false;
    candidates.forEach(el => {
      if (el.tagName && el.tagName.toLowerCase() === "img") {
        el.src = src;
        applied = true;
      } else {
        el.style.backgroundImage = "url('" + src + "')";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center center";
        applied = true;
      }
    });

    if (!applied) {
      document.body.style.backgroundImage = "url('" + src + "')";
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center center";
    }
  }

  window.tenotsuShowExchangeShopBackground = function(){
    setMainBackground(EXCHANGE_BG);
    document.body.dataset.gameMode = "shop";
    document.body.classList.add("mode-shop");
    document.body.classList.remove("mode-office", "mode-title", "mode-story", "story-playing");
    const layer = qs("#office-character-layer");
    if (layer) layer.style.display = "none";
    const box = qs("#office-comment-box");
    if (box) box.style.display = "none";
  };

  function normalizeOfficeCharacterLayer(){
    const layer = qs("#office-character-layer");
    if (layer) {
      layer.style.position = "fixed";
      layer.style.left = "0";
      layer.style.right = "260px";
      layer.style.top = "0";
      layer.style.bottom = "0";
      layer.style.zIndex = "25";
      layer.style.pointerEvents = "none";
      layer.style.display = "";
    }
    qsa("#office-character-layer img, .office-character-stand").forEach((img, idx) => {
      img.style.position = "fixed";
      img.style.top = "auto";
      img.style.bottom = "4%";
      img.style.width = "auto";
      img.style.maxWidth = "430px";
      img.style.maxHeight = "86vh";
      img.style.height = "auto";
      img.style.objectFit = "contain";
      img.style.pointerEvents = "none";
      img.style.display = "block";
      img.style.filter = "drop-shadow(0 14px 20px rgba(0,0,0,.35))";
      img.style.zIndex = String(30 + idx);
      img.style.opacity = "0.98";
      if (idx === 0) {
        img.style.left = "20%";
        img.style.transform = "translateX(-50%) scale(1)";
      } else if (idx === 1) {
        img.style.left = "37%";
        img.style.transform = "translateX(-50%) scale(.92)";
      } else {
        img.style.left = "52%";
        img.style.transform = "translateX(-50%) scale(.88)";
      }
    });
  }

  const oldRefresh = window.tenotsuRefreshOfficeCharacters;
  if (typeof oldRefresh === "function") {
    window.tenotsuRefreshOfficeCharacters = function(){
      const result = oldRefresh.apply(this, arguments);
      normalizeOfficeCharacterLayer();
      setTimeout(normalizeOfficeCharacterLayer, 60);
      setTimeout(normalizeOfficeCharacterLayer, 240);
      return result;
    };
  }

  const oldEnter = window.tenotsuEnterOfficeMode;
  if (typeof oldEnter === "function") {
    window.tenotsuEnterOfficeMode = function(){
      const result = oldEnter.apply(this, arguments);
      normalizeOfficeCharacterLayer();
      setTimeout(normalizeOfficeCharacterLayer, 60);
      setTimeout(normalizeOfficeCharacterLayer, 240);
      return result;
    };
  }

  function bindShopButtons(){
    qsa("button, .tenotsu-six-main-button, .menu-item, a, li").forEach(el => {
      const text = (el.textContent || "").trim();
      if (text === "ショップ" || text.includes("ショップ")) {
        if (el.dataset.v03798ShopBound === "1") return;
        el.dataset.v03798ShopBound = "1";
        el.addEventListener("click", () => {
          setTimeout(window.tenotsuShowExchangeShopBackground, 0);
          setTimeout(window.tenotsuShowExchangeShopBackground, 80);
        }, true);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindShopButtons();
    normalizeOfficeCharacterLayer();
    setTimeout(bindShopButtons, 300);
    setTimeout(bindShopButtons, 900);
  });
  document.addEventListener("click", () => setTimeout(bindShopButtons, 0), true);

  const observer = new MutationObserver(() => {
    bindShopButtons();
    if ((document.body.dataset.gameMode || window.tenotsuGameMode) === "office") normalizeOfficeCharacterLayer();
  });
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:["class","style","src"]});
  });
})();
/* /v038_27 exchange shop background + office character z-index fix */


/* v038_27 office return background + 3-character positioning fix */
(function(){
  const OFFICE_BG = "images/assets/bgev/bg_office_hidamari.png";
  const EXCHANGE_BG = "images/assets/bgev/bg_exchange_item_counter.png";

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  function setBackgroundImage(src){
    const targets = [
      qs("#background"),
      qs("#bg"),
      qs("#bgev"),
      qs("#game-bg"),
      qs("#gameBackground"),
      qs(".background"),
      qs(".bg"),
      qs(".bgev")
    ].filter(Boolean);

    let changed = false;
    targets.forEach(el => {
      if ((el.tagName || "").toLowerCase() === "img") {
        el.src = src;
        changed = true;
      } else {
        el.style.backgroundImage = "url('" + src + "')";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center center";
        changed = true;
      }
    });

    const screen = qs("#game") || qs("#main") || qs(".game-screen") || document.body;
    if (screen) {
      screen.style.backgroundImage = "url('" + src + "')";
      screen.style.backgroundSize = "cover";
      screen.style.backgroundPosition = "center center";
      changed = true;
    }
    return changed;
  }

  window.tenotsuRestoreOfficeBackground = function(){
    setBackgroundImage(OFFICE_BG);
    document.body.classList.remove("mode-shop");
    document.body.classList.add("mode-office");
    document.body.dataset.gameMode = "office";
    window.tenotsuGameMode = "office";
  };

  window.tenotsuSetExchangeBackground = function(){
    setBackgroundImage(EXCHANGE_BG);
    document.body.classList.add("mode-shop");
    document.body.classList.remove("mode-office");
    document.body.dataset.gameMode = "shop";
    window.tenotsuGameMode = "shop";
  };

  function normalizeOfficeCharacterPositions(){
    const layer = qs("#office-character-layer");
    if (layer) {
      layer.style.position = "fixed";
      layer.style.left = "0";
      layer.style.right = "300px";
      layer.style.top = "0";
      layer.style.bottom = "0";
      layer.style.zIndex = "25";
      layer.style.pointerEvents = "none";
      layer.style.display = "";
    }

    const imgs = qsa("#office-character-layer img, .office-character-stand");
    const count = imgs.length;

    imgs.forEach((img, idx) => {
      img.style.position = "fixed";
      img.style.top = "auto";
      img.style.bottom = "3.5%";
      img.style.width = "auto";
      img.style.maxWidth = "430px";
      img.style.maxHeight = "87vh";
      img.style.height = "auto";
      img.style.objectFit = "contain";
      img.style.pointerEvents = "none";
      img.style.display = "block";
      img.style.filter = "drop-shadow(0 14px 20px rgba(0,0,0,.35))";
      img.style.opacity = "0.98";

      if (count >= 3) {
        if (idx === 0) {
          img.style.left = "31%";
          img.style.zIndex = "34";
          img.style.transform = "translateX(-50%) scale(1.02)";
        } else if (idx === 1) {
          img.style.left = "15%";
          img.style.zIndex = "32";
          img.style.transform = "translateX(-50%) scale(.90)";
        } else {
          img.style.left = "48%";
          img.style.zIndex = "31";
          img.style.transform = "translateX(-50%) scale(.90)";
        }
      } else if (count === 2) {
        if (idx === 0) {
          img.style.left = "27%";
          img.style.zIndex = "34";
          img.style.transform = "translateX(-50%) scale(1.02)";
        } else {
          img.style.left = "45%";
          img.style.zIndex = "31";
          img.style.transform = "translateX(-50%) scale(.92)";
        }
      } else {
        img.style.left = "30%";
        img.style.zIndex = "34";
        img.style.transform = "translateX(-50%) scale(1.02)";
      }
    });
  }

  const oldRefresh = window.tenotsuRefreshOfficeCharacters;
  if (typeof oldRefresh === "function") {
    window.tenotsuRefreshOfficeCharacters = function(){
      const result = oldRefresh.apply(this, arguments);
      normalizeOfficeCharacterPositions();
      setTimeout(normalizeOfficeCharacterPositions, 80);
      setTimeout(normalizeOfficeCharacterPositions, 260);
      return result;
    };
  }

  const oldEnterOffice = window.tenotsuEnterOfficeMode;
  if (typeof oldEnterOffice === "function") {
    window.tenotsuEnterOfficeMode = function(){
      window.tenotsuRestoreOfficeBackground();
      const result = oldEnterOffice.apply(this, arguments);
      window.tenotsuRestoreOfficeBackground();
      normalizeOfficeCharacterPositions();
      setTimeout(() => { window.tenotsuRestoreOfficeBackground(); normalizeOfficeCharacterPositions(); }, 80);
      setTimeout(() => { window.tenotsuRestoreOfficeBackground(); normalizeOfficeCharacterPositions(); }, 300);
      return result;
    };
  }

  const oldSetMode = window.tenotsuSetGameMode;
  if (typeof oldSetMode === "function") {
    window.tenotsuSetGameMode = function(mode){
      const result = oldSetMode.apply(this, arguments);
      if (mode === "office") {
        setTimeout(() => {
          window.tenotsuRestoreOfficeBackground();
          if (typeof window.tenotsuEnterOfficeMode === "function") window.tenotsuEnterOfficeMode();
        }, 0);
      }
      if (mode === "shop") {
        setTimeout(window.tenotsuSetExchangeBackground, 0);
      }
      return result;
    };
  }

  function bindOfficeReturnButtons(){
    qsa("button, .tenotsu-six-main-button, .menu-item, a, li").forEach(el => {
      const text = (el.textContent || "").trim();
      if (text === "店舗" || text.includes("事務所") || text.includes("戻る") || text.includes("ホーム")) {
        if (el.dataset.v03799OfficeBound === "1") return;
        el.dataset.v03799OfficeBound = "1";
        el.addEventListener("click", () => {
          setTimeout(() => {
            if (typeof window.tenotsuEnterOfficeMode === "function") window.tenotsuEnterOfficeMode();
            else window.tenotsuRestoreOfficeBackground();
          }, 0);
          setTimeout(window.tenotsuRestoreOfficeBackground, 120);
        }, true);
      }
      if (text === "ショップ" || text.includes("ショップ")) {
        if (el.dataset.v03799ShopBound === "1") return;
        el.dataset.v03799ShopBound = "1";
        el.addEventListener("click", () => {
          setTimeout(window.tenotsuSetExchangeBackground, 0);
          setTimeout(window.tenotsuSetExchangeBackground, 100);
        }, true);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindOfficeReturnButtons();
    if ((document.body.dataset.gameMode || window.tenotsuGameMode) === "office") {
      window.tenotsuRestoreOfficeBackground();
      normalizeOfficeCharacterPositions();
    }
    setTimeout(bindOfficeReturnButtons, 300);
    setTimeout(bindOfficeReturnButtons, 900);
  });

  document.addEventListener("click", () => setTimeout(bindOfficeReturnButtons, 0), true);

  const observer = new MutationObserver(() => {
    bindOfficeReturnButtons();
    if ((document.body.dataset.gameMode || window.tenotsuGameMode) === "office") {
      window.tenotsuRestoreOfficeBackground();
      normalizeOfficeCharacterPositions();
    }
  });
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class","style","src","data-game-mode"] });
  });
})();
/* /v038_27 office return background + 3-character positioning fix */


/* v038_27 office foreground overlay + shop greeting + shop left-menu guard */
(function(){
  const OFFICE_BG = "images/assets/bgev/bg_office_hidamari.png";
  const SHOP_BG = "images/assets/bgev/bg_exchange_item_counter.png";

  const OFFICE_CHARS = [
    ["星野 緋奈","a10501.webp","店長、今日も一緒にがんばりましょう！"],
    ["速水川 藍","b10201.webp","てんちょー、少し休憩も大事ですよ。"],
    ["草壁 翠","c10201.webp","キミ、今日の予定は確認済みかな？"],
    ["小麦沢 こがね","d10501.webp","店長、今日もアゲてこー！"],
    ["春日原 琥珀","e10501.webp","旦那、困ったことがあったらオレに任せな！"],
    ["大道寺 真花","f10201.webp","店長、本日もよろしくお願いします。"],
    ["氷神 雪乃","g10201.webp","貴方様、無理はなさらないでくださいね。"],
    ["双沢 美空","h10501.webp","店長、今日も笑顔でいきましょう。"],
    ["双沢 夜空","i10201.webp","あんた、今日もちゃんと見てるから。"],
    ["芝桜 桃","j10501.webp","店長、ウチに任せとけばバズるって！"],
    ["紫藤 彩愛","k10201.webp","貴方、今日も美しく整えてまいりましょう。"],
    ["餅月 里美","l10501.webp","てんちょ～、お茶でも飲んでいきます～？"],
    ["草壁 萌","m10201.webp","おにいちゃん、今日も一緒にがんばろうね。"]
  ];

  const SHOP_GREETINGS = [
    ["朔夜","いらっしゃいませ。価値あるものとの交換をご希望ですか？"],
    ["朔夜","ようこそ、交換カウンターへ。必要な品をお選びください。"],
    ["朔夜","ふふ……本日は、どの品と縁を結びましょうか。"]
  ];

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function setBg(src){
    const targets = [
      qs("#background"), qs("#bg"), qs("#bgev"), qs("#game-bg"), qs("#gameBackground"),
      qs(".background"), qs(".bg"), qs(".bgev"), qs("#game"), qs("#main"), qs(".game-screen")
    ].filter(Boolean);
    targets.forEach(el=>{
      if ((el.tagName||"").toLowerCase()==="img") el.src=src;
      else {
        el.style.backgroundImage = "url('" + src + "')";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center center";
      }
    });
  }

  function ensureOverlay(){
    let overlay = qs("#tenotsu-office-character-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "tenotsu-office-character-overlay";
      overlay.className = "tenotsu-office-character-overlay";
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function ensureBottomComment(){
    let box = qs("#office-comment-box") || qs("#title-comment-box") || qs("#tenotsu-bottom-comment");
    if (!box) {
      box = document.createElement("div");
      box.id = "tenotsu-bottom-comment";
      box.className = "office-comment-box title-comment-box tenotsu-bottom-comment";
      document.body.appendChild(box);
    }
    return box;
  }

  function renderComment(name, text){
    const box = ensureBottomComment();
    box.style.display = "";
    box.innerHTML = "<span class='comment-speaker'>" + name + "</span><span class='comment-text'>" + text + "</span>";
  }

  function renderOfficeCharacters(){
    const count = Math.random() < 0.65 ? 3 : 2;
    const picks = shuffle(OFFICE_CHARS).slice(0, count);
    window.tenotsuOfficeCharacterPicks = picks;
    window.tenotsuOfficeFrontCharacter = picks[0];

    const overlay = ensureOverlay();
    overlay.innerHTML = "";
    overlay.style.display = "block";

    picks.forEach((c, idx)=>{
      const img = document.createElement("img");
      img.className = "tenotsu-office-stand tenotsu-office-stand-" + idx;
      img.alt = c[0];
      img.src = "images/assets/char/" + c[1];
      img.onerror = () => {
        img.src = "images/assets/char/" + c[1].replace(".webp",".png");
      };
      overlay.appendChild(img);
    });
    renderComment(picks[0][0], picks[0][2]);
  }

  function hideOfficeCharacters(){
    const overlay = qs("#tenotsu-office-character-overlay");
    if (overlay) overlay.style.display = "none";
  }

  window.tenotsuEnterOfficeMode = function(){
    window.tenotsuGameMode = "office";
    document.body.dataset.gameMode = "office";
    document.body.classList.add("mode-office");
    document.body.classList.remove("mode-shop","mode-story","mode-title","story-playing");
    setBg(OFFICE_BG);

    if (typeof window.tenotsuSetStoryPlayingFlag === "function") window.tenotsuSetStoryPlayingFlag(false);

    // 既存の右メニュー再構築処理があれば使う
    if (typeof window.tenotsuRebuildOfficeMenu === "function") window.tenotsuRebuildOfficeMenu();
    const right = qs("#list-panel") || qs("#right-menu") || qs(".right-menu") || qs(".right-panel");
    if (right) {
      right.style.display = "";
      right.style.visibility = "visible";
      right.style.opacity = "1";
      right.classList.add("show","open","active","visible");
    }

    renderOfficeCharacters();
    setTimeout(()=>{ setBg(OFFICE_BG); renderOfficeCharacters(); }, 80);
  };

  window.tenotsuShowExchangeShopBackground = function(){
    window.tenotsuGameMode = "shop";
    document.body.dataset.gameMode = "shop";
    document.body.classList.add("mode-shop");
    document.body.classList.remove("mode-office","mode-story","mode-title","story-playing");
    setBg(SHOP_BG);
    hideOfficeCharacters();
    const g = SHOP_GREETINGS[Math.floor(Math.random() * SHOP_GREETINGS.length)];
    renderComment(g[0], g[1]);
  };

  window.tenotsuSetExchangeBackground = window.tenotsuShowExchangeShopBackground;

  const oldSetMode = window.tenotsuSetGameMode;
  window.tenotsuSetGameMode = function(mode){
    if (mode === "office") {
      window.tenotsuEnterOfficeMode();
      return;
    }
    if (mode === "shop") {
      window.tenotsuShowExchangeShopBackground();
      return;
    }
    if (typeof oldSetMode === "function") return oldSetMode.apply(this, arguments);
    window.tenotsuGameMode = mode;
    document.body.dataset.gameMode = mode;
  };

  function bindMenuButtons(){
    qsa("button,.tenotsu-six-main-button,.menu-item,a,li").forEach(el=>{
      const text=(el.textContent||"").trim();
      if ((text==="ショップ" || text.includes("ショップ")) && el.dataset.v03800ShopBound!=="1") {
        el.dataset.v03800ShopBound="1";
        el.addEventListener("click", (ev)=>{
          setTimeout(window.tenotsuShowExchangeShopBackground,0);
          setTimeout(window.tenotsuShowExchangeShopBackground,100);
        }, true);
      }
      if ((text==="店舗" || text.includes("事務所") || text.includes("戻る") || text.includes("ホーム")) && el.dataset.v03800OfficeBound!=="1") {
        el.dataset.v03800OfficeBound="1";
        el.addEventListener("click", (ev)=>{
          setTimeout(window.tenotsuEnterOfficeMode,0);
          setTimeout(window.tenotsuEnterOfficeMode,100);
        }, true);
      }
    });
  }

  // ショップ中は左メニュー/HOLD系の入力を殺してハングアップ回避
  function isLeftMenuTarget(event){
    const t = event.target;
    return !!(t && t.closest && t.closest("#left-menu,.left-menu,#leftPanel,.side-menu,.sub-menu,.auto-menu,.hold-menu"));
  }
  ["pointerdown","touchstart","mousedown","contextmenu"].forEach(type=>{
    document.addEventListener(type, (ev)=>{
      const mode = document.body.dataset.gameMode || window.tenotsuGameMode;
      if (mode !== "shop") return;
      const x = ev.clientX || (ev.touches && ev.touches[0] && ev.touches[0].clientX) || 0;
      if (isLeftMenuTarget(ev) || x < window.innerWidth * 0.28) {
        ev.preventDefault();
        ev.stopPropagation();
      }
    }, true);
  });

  document.addEventListener("DOMContentLoaded", ()=>{
    bindMenuButtons();
    setTimeout(bindMenuButtons, 300);
    setTimeout(bindMenuButtons, 900);
    if ((document.body.dataset.gameMode || window.tenotsuGameMode) === "office") window.tenotsuEnterOfficeMode();
  });
  document.addEventListener("click", ()=>setTimeout(bindMenuButtons,0), true);

  const mo = new MutationObserver(()=>{
    bindMenuButtons();
    const mode = document.body.dataset.gameMode || window.tenotsuGameMode;
    if (mode === "office") {
      const overlay = qs("#tenotsu-office-character-overlay");
      if (!overlay || overlay.style.display === "none" || !overlay.children.length) renderOfficeCharacters();
      setBg(OFFICE_BG);
    }
  });
  document.addEventListener("DOMContentLoaded", ()=>{
    mo.observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:["class","style","data-game-mode"]});
  });
})();
/* /v038_27 office foreground overlay + shop greeting + shop left-menu guard */


/* v038_27 layer normalization */
(function(){
  const Z = {
    bg: 0,
    random: 10,
    storyChar: 20,
    ev: 30,
    click: 45,
    dialogue: 60,
    choices: 65,
    officeChar: 70,
    menu: 120,
    comment: 140,
    fade: 9000,
    system: 20000,
    boot: 200000
  };
  window.TENOTSU_LAYER_Z = Object.freeze({...Z});

  function setZ(selector, z) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.zIndex = String(z);
    });
  }

  window.tenotsuNormalizeLayerIndex = function(){
    setZ("#background,[data-layer='background']", Z.bg);
    setZ("#random-images-layer,#random-text-layer,[data-layer='title-random']", Z.random);
    setZ("#char-layer,#char-layer .char-slot,#char-layer .char-image,.char-slot,.char-image,[data-layer='story-character']", Z.storyChar);
    setZ("#ev-layer,#ev-layer .ev-image,#ev-layer .cg-image,.ev-image,.cg-image,[data-layer='event-cg']", Z.ev);
    setZ("#click-layer,[data-layer='click']", Z.click);
    setZ("#dialogue-box,[data-layer='dialogue']", Z.dialogue);
    setZ("#choices,.choices-area,[data-layer='choices']", Z.choices);
    setZ("#tenotsu-office-character-overlay,.tenotsu-office-character-overlay", Z.officeChar);
    setZ(".tenotsu-office-stand-0", Z.officeChar + 3);
    setZ(".tenotsu-office-stand-1", Z.officeChar + 2);
    setZ(".tenotsu-office-stand-2", Z.officeChar + 1);
    setZ("#list-panel,#menu-panel,.right-menu,.right-panel,.menu-panel,.list-panel,.tenotsu-six-main-menu,[data-layer='right-menu'],[data-layer='left-menu']", Z.menu);
    setZ("#tenotsu-bottom-comment,#office-comment-box,.office-comment-box,.title-comment-box", Z.comment);
    setZ(".fade-overlay,#fade-overlay,.black-fade,#black-fade,.screen-fade", Z.fade);
    setZ("#ios-pwa-notice,#rotate-warning", Z.system);
    setZ(".boot-flow", Z.boot);
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.tenotsuNormalizeLayerIndex();
    setTimeout(window.tenotsuNormalizeLayerIndex, 100);
    setTimeout(window.tenotsuNormalizeLayerIndex, 500);
  });

  const observer = new MutationObserver(() => {
    if (window.__tenotsuLayerNormalizeTimer) clearTimeout(window.__tenotsuLayerNormalizeTimer);
    window.__tenotsuLayerNormalizeTimer = setTimeout(window.tenotsuNormalizeLayerIndex, 0);
  });
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style", "data-layer"] });
  });
})();
/* /v038_27 layer normalization */


/* v038_27 Sakuya exchange intro implementation */
(function(){
  const SAKUYA_INTRO_SCENARIO = "shop_exchange_intro_sakuya.json";
  const SAKUYA_INTRO_KEY = "tenotsu_sakuya_exchange_intro_seen_v1";
  const SHOP_GREETINGS_V03802 = [
    ["朔夜","いらっしゃいませ。価値あるものとの交換をご希望ですか？"],
    ["朔夜","ようこそ、交換カウンターへ。必要な品をお選びください。"],
    ["朔夜","ふふ……本日は、どの品と縁を結びましょうか。"],
    ["朔夜","交換品は一期一会。どうぞ、ゆっくりご覧ください。"],
    ["朔夜","店長様、お待ちしておりました。本日の交換品はこちらです。"]
  ];

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }

  function renderShopGreeting(){
    const g = SHOP_GREETINGS_V03802[Math.floor(Math.random() * SHOP_GREETINGS_V03802.length)];
    const nameBox = qs("#name");
    const textBox = qs("#text");
    const dialogueBox = qs("#dialogue-box");
    if (nameBox) nameBox.textContent = g[0];
    if (textBox) textBox.innerHTML = g[1];
    if (dialogueBox) dialogueBox.classList.remove("hidden");
    if (typeof window.tenotsuShowExchangeShopBackground === "function") window.tenotsuShowExchangeShopBackground();
  }

  window.tenotsuOpenShopWithSakuya = function(){
    try {
      const seen = localStorage.getItem(SAKUYA_INTRO_KEY) === "1";
      if (!seen && typeof window.loadScenario === "function") {
        localStorage.setItem(SAKUYA_INTRO_KEY, "1");
        window.__TENOTSU_RETURN_TO_SHOP_AFTER_STORY__ = true;
        window.loadScenario(SAKUYA_INTRO_SCENARIO);
        return;
      }
    } catch (_) {}
    renderShopGreeting();
  };

  const oldStoryEnd = window.tenotsuHandleStoryEndReturn;
  if (typeof oldStoryEnd === "function") {
    window.tenotsuHandleStoryEndReturn = function(){
      const shouldReturnShop = window.__TENOTSU_RETURN_TO_SHOP_AFTER_STORY__ || String(window.currentScenario || "").includes(SAKUYA_INTRO_SCENARIO);
      if (!shouldReturnShop) return oldStoryEnd.apply(this, arguments);

      window.__TENOTSU_RETURN_TO_SHOP_AFTER_STORY__ = false;
      window.__TENOTSU_STORY_ENDING__ = true;

      const dialogueBox = qs("#dialogue-box");
      const textBox = qs("#text");
      const nameBox = qs("#name");
      const clickLayer = qs("#click-layer");
      if (nameBox) nameBox.textContent = "";
      if (textBox) textBox.innerHTML = "（交換所が利用可能になりました）";
      if (dialogueBox) dialogueBox.classList.remove("hidden");
      if (clickLayer) clickLayer.style.pointerEvents = "none";

      setTimeout(() => {
        if (typeof window.tenotsuBlackFadeOut === "function") window.tenotsuBlackFadeOut(1000);
      }, 650);

      setTimeout(() => {
        window.__TENOTSU_STORY_ENDING__ = false;
        if (dialogueBox) dialogueBox.classList.remove("hidden");
        renderShopGreeting();
      }, 1780);

      setTimeout(() => {
        if (typeof window.tenotsuBlackFadeIn === "function") window.tenotsuBlackFadeIn(850);
        if (clickLayer) clickLayer.style.pointerEvents = "auto";
      }, 1980);
    };
  }

  function bindShopButtonIntro(){
    qsa("button,.tenotsu-six-main-button,.menu-item,a,li").forEach(el => {
      const text = (el.textContent || "").trim();
      if (!(text === "ショップ" || text.includes("ショップ"))) return;
      if (el.dataset.v03802ShopIntroBound === "1") return;
      el.dataset.v03802ShopIntroBound = "1";
      el.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        setTimeout(window.tenotsuOpenShopWithSakuya, 0);
      }, true);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindShopButtonIntro();
    setTimeout(bindShopButtonIntro, 300);
    setTimeout(bindShopButtonIntro, 900);
  });
  document.addEventListener("click", () => setTimeout(bindShopButtonIntro, 0), true);
})();
/* /v038_27 Sakuya exchange intro implementation */


/* v038_27 runtime layer/click/character fix */
(function(){
  const Z = Object.freeze({
    bg:0, random:40, storyChar:120, ev:180, click:260, dialogue:420, choices:440,
    officeChar:520, menu:800, comment:900, battle:30000, fade:50000, system:70000, boot:200000
  });
  window.TENOTSU_LAYER_Z = Z;

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function setImportant(el, prop, val){ if (el) el.style.setProperty(prop, String(val), "important"); }

  window.tenotsuNormalizeLayerIndex = function(){
    qsa("#background,[data-layer='background']").forEach(el=>setImportant(el,"z-index",Z.bg));
    qsa("#random-images-layer,#random-text-layer").forEach(el=>setImportant(el,"z-index",Z.random));
    qsa("#char-layer,#char-layer .char-slot,#char-layer .char-image").forEach(el=>setImportant(el,"z-index",Z.storyChar));
    qsa("#ev-layer,#ev-layer .ev-image,#ev-layer .cg-image,.ev-image,.cg-image").forEach(el=>setImportant(el,"z-index",Z.ev));
    qsa("#click-layer").forEach(el=>setImportant(el,"z-index",Z.click));
    qsa("#dialogue-box").forEach(el=>{
      setImportant(el,"z-index",Z.dialogue);
      setImportant(el,"position","fixed");
      setImportant(el,"top","auto");
      setImportant(el,"bottom","max(18px, env(safe-area-inset-bottom))");
      setImportant(el,"left","5%");
      setImportant(el,"right","12%");
      setImportant(el,"width","auto");
    });
    qsa("#choices,.choices-area").forEach(el=>setImportant(el,"z-index",Z.choices));
    qsa("#tenotsu-office-character-overlay").forEach(el=>setImportant(el,"z-index",Z.officeChar));
    qsa(".tenotsu-office-stand-0").forEach(el=>setImportant(el,"z-index",Z.officeChar+3));
    qsa(".tenotsu-office-stand-1").forEach(el=>setImportant(el,"z-index",Z.officeChar+2));
    qsa(".tenotsu-office-stand-2").forEach(el=>setImportant(el,"z-index",Z.officeChar+1));
    qsa("#list-panel,#menu-panel,.right-menu,.right-panel,.menu-panel,.list-panel,.tenotsu-six-main-menu").forEach(el=>setImportant(el,"z-index",Z.menu));
    qsa("#tenotsu-bottom-comment,#office-comment-box,.office-comment-box,.title-comment-box").forEach(el=>setImportant(el,"z-index",Z.comment));
    qsa("#battle-root").forEach(el=>setImportant(el,"z-index",Z.battle));
    qsa(".fade-overlay,#fade-overlay,.black-fade,#black-fade,.screen-fade").forEach(el=>setImportant(el,"z-index",Z.fade));
    qsa("#ios-pwa-notice,#rotate-warning").forEach(el=>setImportant(el,"z-index",Z.system));
    qsa(".boot-flow").forEach(el=>setImportant(el,"z-index",Z.boot));

    // ストーリー通常キャラの「left:-9999px / top:-9999px」系の誤適用を解除
    qsa("#char-layer img,#char-layer .char-image").forEach(img=>{
      setImportant(img,"position","relative");
      setImportant(img,"left","auto");
      setImportant(img,"top","auto");
      setImportant(img,"right","auto");
      setImportant(img,"bottom","auto");
      setImportant(img,"display","block");
      setImportant(img,"opacity","1");
      setImportant(img,"z-index",Z.storyChar);
      setImportant(img,"max-height","90vh");
      setImportant(img,"width","auto");
      setImportant(img,"height","auto");
      setImportant(img,"pointer-events","none");
    });

    const mode = document.body.dataset.gameMode || window.tenotsuGameMode || "";
    const clickLayer = qs("#click-layer");
    if (mode === "battle") {
      if (clickLayer) {
        setImportant(clickLayer,"pointer-events","none");
        setImportant(clickLayer,"display","none");
      }
      qsa("#battle-root,#battle-root *").forEach(el=>setImportant(el,"pointer-events","auto"));
    } else if (clickLayer) {
      clickLayer.style.removeProperty("display");
      setImportant(clickLayer,"pointer-events","auto");
    }
  };

  window.tenotsuFixStoryCharacters = function(){
    qsa("#char-layer .char-slot.active img,#char-layer .char-image").forEach(img=>{
      setImportant(img,"position","relative");
      setImportant(img,"left","auto");
      setImportant(img,"top","auto");
      setImportant(img,"bottom","auto");
      setImportant(img,"display","block");
      setImportant(img,"z-index",Z.storyChar);
      setImportant(img,"opacity","1");
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.tenotsuNormalizeLayerIndex();
    setTimeout(window.tenotsuNormalizeLayerIndex,100);
    setTimeout(window.tenotsuNormalizeLayerIndex,500);
    setTimeout(window.tenotsuFixStoryCharacters,120);
  });

  const mo = new MutationObserver(()=>{
    if (window.__tenotsuLayerFixTimer) clearTimeout(window.__tenotsuLayerFixTimer);
    window.__tenotsuLayerFixTimer = setTimeout(()=>{
      window.tenotsuNormalizeLayerIndex();
      window.tenotsuFixStoryCharacters();
    },0);
  });
  document.addEventListener("DOMContentLoaded", ()=>{
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:["class","style","data-game-mode"]});
  });
})();
/* /v038_27 runtime layer/click/character fix */


/* v038_27 office no-background test build */
(function(){
  const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  window.TENOTSU_OFFICE_DISABLE_BACKGROUND = true;

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function setImportant(el, prop, val){ if (el) el.style.setProperty(prop, String(val), "important"); }

  window.tenotsuDisableOfficeBackground = function(){
    const mode = document.body.dataset.gameMode || window.tenotsuGameMode || "";
    if (mode !== "office") return;

    qsa("#background,[data-layer='background'],#bg,#bgev,#game-bg,#gameBackground,.background,.bg,.bgev").forEach(el => {
      if ((el.tagName || "").toLowerCase() === "img") {
        if (el.id === "background" || el.dataset.layer === "background") el.src = TRANSPARENT_PIXEL;
      }
      setImportant(el, "background-image", "none");
      setImportant(el, "opacity", "0");
      setImportant(el, "display", "none");
      setImportant(el, "pointer-events", "none");
      setImportant(el, "z-index", "0");
    });

    const game = qs("#game-container") || qs("#game") || qs("#main") || qs(".game-screen");
    if (game) {
      setImportant(game, "background-image", "none");
      setImportant(game, "background", "transparent");
      setImportant(game, "isolation", "isolate");
    }
    setImportant(document.body, "background-image", "none");
  };

  function forceOfficeCharactersVisible(){
    const mode = document.body.dataset.gameMode || window.tenotsuGameMode || "";
    if (mode !== "office") return;

    const overlay = qs("#tenotsu-office-character-overlay");
    if (overlay) {
      setImportant(overlay, "display", "block");
      setImportant(overlay, "visibility", "visible");
      setImportant(overlay, "opacity", "1");
      setImportant(overlay, "z-index", "520");
      setImportant(overlay, "pointer-events", "none");
    }

    qsa("#tenotsu-office-character-overlay img,.tenotsu-office-stand").forEach((img, idx) => {
      setImportant(img, "display", "block");
      setImportant(img, "visibility", "visible");
      setImportant(img, "opacity", ".985");
      setImportant(img, "z-index", String(523 - idx));
      setImportant(img, "position", "fixed");
      setImportant(img, "top", "auto");
      setImportant(img, "bottom", "4%");
      if (idx === 0) {
        setImportant(img, "left", "32%");
        setImportant(img, "transform", "translateX(-50%) scale(1.03)");
      } else if (idx === 1) {
        setImportant(img, "left", "15%");
        setImportant(img, "transform", "translateX(-50%) scale(.92)");
      } else {
        setImportant(img, "left", "49%");
        setImportant(img, "transform", "translateX(-50%) scale(.92)");
      }
    });
  }

  function fixOfficeTextArea(){
    const mode = document.body.dataset.gameMode || window.tenotsuGameMode || "";
    if (mode !== "office") return;
    const box = qs("#dialogue-box");
    if (box) {
      setImportant(box, "position", "fixed");
      setImportant(box, "left", "5%");
      setImportant(box, "right", "12%");
      setImportant(box, "top", "auto");
      setImportant(box, "bottom", "max(18px, env(safe-area-inset-bottom))");
      setImportant(box, "width", "auto");
      setImportant(box, "z-index", "900");
      setImportant(box, "display", "block");
    }
  }

  const oldEnterOffice = window.tenotsuEnterOfficeMode;
  if (typeof oldEnterOffice === "function") {
    window.tenotsuEnterOfficeMode = function(){
      const result = oldEnterOffice.apply(this, arguments);
      document.body.dataset.gameMode = "office";
      window.tenotsuGameMode = "office";
      setTimeout(() => {
        window.tenotsuDisableOfficeBackground();
        forceOfficeCharactersVisible();
        fixOfficeTextArea();
      }, 0);
      setTimeout(() => {
        window.tenotsuDisableOfficeBackground();
        forceOfficeCharactersVisible();
        fixOfficeTextArea();
      }, 120);
      setTimeout(() => {
        window.tenotsuDisableOfficeBackground();
        forceOfficeCharactersVisible();
        fixOfficeTextArea();
      }, 500);
      return result;
    };
  }

  const oldRestore = window.tenotsuRestoreOfficeBackground;
  window.tenotsuRestoreOfficeBackground = function(){
    document.body.dataset.gameMode = "office";
    window.tenotsuGameMode = "office";
    if (typeof oldRestore === "function") {
      try { oldRestore.apply(this, arguments); } catch (_) {}
    }
    window.tenotsuDisableOfficeBackground();
    forceOfficeCharactersVisible();
    fixOfficeTextArea();
  };

  const oldNormalize = window.tenotsuNormalizeLayerIndex;
  window.tenotsuNormalizeLayerIndex = function(){
    if (typeof oldNormalize === "function") oldNormalize.apply(this, arguments);
    window.tenotsuDisableOfficeBackground();
    forceOfficeCharactersVisible();
    fixOfficeTextArea();
  };

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(window.tenotsuNormalizeLayerIndex, 0);
    setTimeout(window.tenotsuNormalizeLayerIndex, 150);
    setTimeout(window.tenotsuNormalizeLayerIndex, 600);
  });

  const observer = new MutationObserver(() => {
    if (window.__tenotsuOfficeNoBgTimer) clearTimeout(window.__tenotsuOfficeNoBgTimer);
    window.__tenotsuOfficeNoBgTimer = setTimeout(window.tenotsuNormalizeLayerIndex, 0);
  });
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["class","style","data-game-mode","src"] });
  });
})();
/* /v038_27 office no-background test build */


/* v038_27 office background direct filename detection */
(function(){
  const TRANSPARENT_PIXEL = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function setImportant(el, prop, val){ if (el) el.style.setProperty(prop, String(val), "important"); }

  function hasOfficeBgText(value){
    return String(value || "").includes("bg_office_hidamari");
  }

  function looksLikeOfficeScreen(){
    if ((document.body.dataset.gameMode || window.tenotsuGameMode || "").includes("office")) return true;
    const bg = qs("#background");
    if (bg && hasOfficeBgText(bg.getAttribute("src"))) return true;
    const targets = [document.body, qs("#game-container"), qs("#game"), qs("#main"), qs(".game-screen")].filter(Boolean);
    return targets.some(el => {
      const inlineBg = el.style && el.style.backgroundImage;
      const computedBg = window.getComputedStyle ? window.getComputedStyle(el).backgroundImage : "";
      return hasOfficeBgText(inlineBg) || hasOfficeBgText(computedBg);
    });
  }

  window.tenotsuHideOfficeBackgroundDirect = function(){
    if (!looksLikeOfficeScreen()) return;

    document.body.dataset.gameMode = "office";
    window.tenotsuGameMode = "office";
    document.body.classList.add("mode-office");

    qsa("#background,[data-layer='background'],#bg,#bgev,#game-bg,#gameBackground,.background,.bg,.bgev").forEach(el => {
      if ((el.tagName || "").toLowerCase() === "img") {
        if (hasOfficeBgText(el.getAttribute("src")) || el.id === "background" || el.dataset.layer === "background") {
          el.src = TRANSPARENT_PIXEL;
        }
      }
      setImportant(el, "background-image", "none");
      setImportant(el, "opacity", "0");
      setImportant(el, "visibility", "hidden");
      setImportant(el, "display", "none");
      setImportant(el, "pointer-events", "none");
    });

    [document.body, qs("#game-container"), qs("#game"), qs("#main"), qs(".game-screen")].filter(Boolean).forEach(el => {
      setImportant(el, "background-image", "none");
      setImportant(el, "background", "transparent");
    });

    // office foreground / text position forced visible for diagnosis
    const overlay = qs("#tenotsu-office-character-overlay");
    if (overlay) {
      setImportant(overlay, "display", "block");
      setImportant(overlay, "visibility", "visible");
      setImportant(overlay, "opacity", "1");
      setImportant(overlay, "z-index", "520");
    }
    qsa("#tenotsu-office-character-overlay img,.tenotsu-office-stand").forEach((img, idx) => {
      setImportant(img, "display", "block");
      setImportant(img, "visibility", "visible");
      setImportant(img, "opacity", ".985");
      setImportant(img, "z-index", String(523 - idx));
    });

    const box = qs("#dialogue-box");
    if (box) {
      setImportant(box, "position", "fixed");
      setImportant(box, "top", "auto");
      setImportant(box, "bottom", "max(18px, env(safe-area-inset-bottom))");
      setImportant(box, "left", "5%");
      setImportant(box, "right", "12%");
      setImportant(box, "width", "auto");
      setImportant(box, "z-index", "900");
    }
  };

  const oldSetBg = window.tenotsuSetOfficeBackground;
  window.tenotsuSetOfficeBackground = function(){
    if (typeof oldSetBg === "function") {
      try { oldSetBg.apply(this, arguments); } catch (_) {}
    }
    setTimeout(window.tenotsuHideOfficeBackgroundDirect, 0);
    setTimeout(window.tenotsuHideOfficeBackgroundDirect, 80);
  };

  const oldRestore = window.tenotsuRestoreOfficeBackground;
  window.tenotsuRestoreOfficeBackground = function(){
    if (typeof oldRestore === "function") {
      try { oldRestore.apply(this, arguments); } catch (_) {}
    }
    setTimeout(window.tenotsuHideOfficeBackgroundDirect, 0);
    setTimeout(window.tenotsuHideOfficeBackgroundDirect, 80);
  };

  const oldEnter = window.tenotsuEnterOfficeMode;
  if (typeof oldEnter === "function") {
    window.tenotsuEnterOfficeMode = function(){
      const r = oldEnter.apply(this, arguments);
      setTimeout(window.tenotsuHideOfficeBackgroundDirect, 0);
      setTimeout(window.tenotsuHideOfficeBackgroundDirect, 80);
      setTimeout(window.tenotsuHideOfficeBackgroundDirect, 300);
      return r;
    };
  }

  const oldNormalize = window.tenotsuNormalizeLayerIndex;
  window.tenotsuNormalizeLayerIndex = function(){
    if (typeof oldNormalize === "function") oldNormalize.apply(this, arguments);
    window.tenotsuHideOfficeBackgroundDirect();
  };

  document.addEventListener("DOMContentLoaded", () => {
    window.tenotsuHideOfficeBackgroundDirect();
    setTimeout(window.tenotsuHideOfficeBackgroundDirect, 120);
    setTimeout(window.tenotsuHideOfficeBackgroundDirect, 600);
  });

  const observer = new MutationObserver(() => {
    if (window.__tenotsuOfficeBgDirectTimer) clearTimeout(window.__tenotsuOfficeBgDirectTimer);
    window.__tenotsuOfficeBgDirectTimer = setTimeout(window.tenotsuHideOfficeBackgroundDirect, 0);
  });
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, { childList:true, subtree:true, attributes:true, attributeFilter:["src","style","class","data-game-mode"] });
  });
})();
/* /v038_27 office background direct filename detection */


/* v038_27 office forced foreground diagnostic render */
(function(){
  const OFFICE_FORCE_CHARS = [
    ["星野 緋奈","a10501.webp","店長、今日も一緒にがんばりましょう！"],
    ["速水川 藍","b10501.webp","てんちょー、事務所でお待ちしていました。"],
    ["草壁 翠","c10201.webp","キミ、表示確認を続けよう。"],
    ["小麦沢 こがね","d10501.webp","店長、ここなら見えてるっしょ？"],
    ["春日原 琥珀","e10501.webp","旦那、前に出てきたぞ！"],
    ["大道寺 真花","f10201.webp","店長、こちらにおります。"],
    ["氷神 雪乃","g10201.webp","貴方様、姿は見えていますでしょうか。"],
    ["双沢 美空","h10501.webp","店長、表示テストです。"],
    ["双沢 夜空","i10201.webp","あんた、これなら見える？"],
    ["芝桜 桃","j10501.webp","店長、ウチ参上！"],
    ["紫藤 彩愛","k10201.webp","貴方、こちらで確認くださいませ。"],
    ["餅月 里美","l10501.webp","てんちょ～、見えてますか～？"],
    ["草壁 萌","m10501.webp","おにいちゃん、ここにいるよ。"]
  ];

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function setI(el, prop, val){ if (el) el.style.setProperty(prop, String(val), "important"); }
  function shuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  function isHardOfficeCandidate(){
    const mode = document.body.dataset.gameMode || window.tenotsuGameMode || "";
    if (mode === "office") return true;
    if (mode === "shop" || mode === "story" || mode === "battle" || mode === "title") return false;

    const rightText = ((qs("#list-panel") || qs(".right-menu") || {}).textContent || "");
    if (rightText.includes("店舗") && rightText.includes("メンバー") && rightText.includes("ショップ")) return true;

    const dialogue = qs("#dialogue-box");
    const battle = qs("#battle-root:not(.hidden)");
    const titleLike = qs(".title-screen,.boot-flow:not(.hidden)");
    if (!battle && !titleLike && dialogue && getComputedStyle(dialogue).display !== "none") return true;

    return false;
  }

  function ensureLayer(){
    let layer = qs("#tenotsu-office-force-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "tenotsu-office-force-layer";
      layer.className = "tenotsu-office-force-layer";
      document.body.appendChild(layer);
    }
    return layer;
  }

  function ensureText(){
    let box = qs("#tenotsu-office-force-comment");
    if (!box) {
      box = document.createElement("div");
      box.id = "tenotsu-office-force-comment";
      box.className = "tenotsu-office-force-comment";
      document.body.appendChild(box);
    }
    return box;
  }

  window.tenotsuForceOfficeForeground = function(){
    if (!isHardOfficeCandidate()) return;

    document.body.dataset.gameMode = "office";
    window.tenotsuGameMode = "office";
    document.body.classList.add("mode-office");
    document.body.classList.remove("mode-title","mode-story","mode-shop","mode-battle","story-playing");

    // Keep office background hidden for this diagnostic build, but make base not black.
    setI(document.body, "background", "linear-gradient(135deg, #1e2533, #11151d)");
    setI(document.body, "background-image", "linear-gradient(135deg, #1e2533, #11151d)");
    [qs("#game-container"), qs("#game"), qs("#main"), qs(".game-screen")].filter(Boolean).forEach(el=>{
      setI(el, "background", "transparent");
      setI(el, "background-image", "none");
    });

    qsa("#background,[data-layer='background'],#bg,#bgev,#game-bg,#gameBackground,.background,.bg,.bgev").forEach(el=>{
      setI(el, "display", "none");
      setI(el, "visibility", "hidden");
      setI(el, "opacity", "0");
      setI(el, "pointer-events", "none");
    });

    const layer = ensureLayer();
    const existingKey = layer.dataset.pickKey;
    if (!existingKey || !layer.children.length) {
      const picks = shuffle(OFFICE_FORCE_CHARS).slice(0, 3);
      layer.dataset.pickKey = picks.map(p=>p[1]).join("|");
      layer.innerHTML = "";
      picks.forEach((c, idx)=>{
        const img = document.createElement("img");
        img.className = "tenotsu-office-force-stand tenotsu-office-force-stand-" + idx;
        img.alt = c[0];
        img.src = "images/assets/char/" + c[1];
        img.onerror = () => {
          img.onerror = null;
          img.src = "./images/assets/char/" + c[1];
        };
        layer.appendChild(img);
      });
      const box = ensureText();
      box.innerHTML = "<span class='comment-speaker'>" + picks[0][0] + "</span><span class='comment-text'>" + picks[0][2] + "</span>";
    }

    setI(layer, "display", "block");
    setI(layer, "visibility", "visible");
    setI(layer, "opacity", "1");
    setI(layer, "z-index", "600");

    qsa("#tenotsu-office-force-layer img").forEach((img, idx)=>{
      setI(img, "display", "block");
      setI(img, "visibility", "visible");
      setI(img, "opacity", "1");
      setI(img, "position", "fixed");
      setI(img, "bottom", "3.5%");
      setI(img, "top", "auto");
      setI(img, "width", "auto");
      setI(img, "max-height", "88vh");
      setI(img, "max-width", "440px");
      setI(img, "height", "auto");
      setI(img, "object-fit", "contain");
      setI(img, "pointer-events", "none");
      setI(img, "z-index", String(603 - idx));
      if (idx === 0) { setI(img, "left", "32%"); setI(img, "transform", "translateX(-50%) scale(1.03)"); }
      if (idx === 1) { setI(img, "left", "15%"); setI(img, "transform", "translateX(-50%) scale(.92)"); }
      if (idx === 2) { setI(img, "left", "49%"); setI(img, "transform", "translateX(-50%) scale(.92)"); }
    });

    const box = ensureText();
    setI(box, "display", "block");
    setI(box, "visibility", "visible");
    setI(box, "opacity", "1");
    setI(box, "position", "fixed");
    setI(box, "left", "5%");
    setI(box, "right", "24%");
    setI(box, "bottom", "max(18px, env(safe-area-inset-bottom))");
    setI(box, "top", "auto");
    setI(box, "z-index", "950");

    const dialogue = qs("#dialogue-box");
    if (dialogue) {
      setI(dialogue, "position", "fixed");
      setI(dialogue, "top", "auto");
      setI(dialogue, "bottom", "max(18px, env(safe-area-inset-bottom))");
      setI(dialogue, "left", "5%");
      setI(dialogue, "right", "12%");
      setI(dialogue, "width", "auto");
      setI(dialogue, "z-index", "940");
    }

    const right = qs("#list-panel") || qs(".right-menu") || qs(".right-panel");
    if (right) {
      setI(right, "display", "block");
      setI(right, "visibility", "visible");
      setI(right, "opacity", "1");
      setI(right, "z-index", "1000");
      right.classList.remove("hidden");
      right.classList.add("show","open","visible","active");
    }
  };

  const oldEnter = window.tenotsuEnterOfficeMode;
  if (typeof oldEnter === "function") {
    window.tenotsuEnterOfficeMode = function(){
      const result = oldEnter.apply(this, arguments);
      setTimeout(window.tenotsuForceOfficeForeground, 0);
      setTimeout(window.tenotsuForceOfficeForeground, 120);
      setTimeout(window.tenotsuForceOfficeForeground, 500);
      return result;
    };
  }

  const oldNormalize = window.tenotsuNormalizeLayerIndex;
  window.tenotsuNormalizeLayerIndex = function(){
    if (typeof oldNormalize === "function") oldNormalize.apply(this, arguments);
    window.tenotsuForceOfficeForeground();
  };

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(window.tenotsuForceOfficeForeground, 0);
    setTimeout(window.tenotsuForceOfficeForeground, 200);
    setTimeout(window.tenotsuForceOfficeForeground, 800);
  });

  document.addEventListener("click", () => setTimeout(window.tenotsuForceOfficeForeground, 0), true);

  const observer = new MutationObserver(() => {
    if (window.__tenotsuForceOfficeTimer) clearTimeout(window.__tenotsuForceOfficeTimer);
    window.__tenotsuForceOfficeTimer = setTimeout(window.tenotsuForceOfficeForeground, 0);
  });
  document.addEventListener("DOMContentLoaded", () => {
    observer.observe(document.body, {childList:true, subtree:true, attributes:true, attributeFilter:["class","style","data-game-mode"]});
  });
})();
/* /v038_27 office forced foreground diagnostic render */


/* v038_27 orientation guard override */
(function(){
  function tenotsuShouldShowRotateWarning(){
    const w = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    const h = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    const coarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    const hoverNone = !!(window.matchMedia && window.matchMedia("(hover: none)").matches);
    return h > w && w < 900 && (coarse || hoverNone);
  }
  window.tenotsuShouldShowRotateWarning = tenotsuShouldShowRotateWarning;
  window.tenotsuApplyOrientationGuard = function(){
    const warn = tenotsuShouldShowRotateWarning();
    document.body.classList.toggle("tenotsu-portrait-warning", warn);
    document.body.classList.toggle("tenotsu-landscape-ok", !warn);
    document.querySelectorAll("#rotate-warning,.rotate-warning,.orientation-warning,#orientation-warning").forEach(el => {
      if (!warn) {
        el.classList.add("hidden");
        el.style.setProperty("display","none","important");
        el.style.setProperty("visibility","hidden","important");
        el.style.setProperty("opacity","0","important");
        el.style.setProperty("pointer-events","none","important");
      }
    });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", window.tenotsuApplyOrientationGuard);
  else window.tenotsuApplyOrientationGuard();
  window.addEventListener("resize", window.tenotsuApplyOrientationGuard, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(window.tenotsuApplyOrientationGuard, 120), { passive: true });
})();


/* v038_27 legacy random/showlist guard
   Delayed scenario commands must not draw office back slots during surface takeover.
*/
(function(){
  function active(){
    return !!window.__TENOTSU_SURFACE_TAKEOVER__ || !!window.__TENOTSU_DISABLE_RANDOMSHOW_VISUALS__;
  }
  const noopPromise = () => Promise.resolve([]);
  if (active()) {
    window.randomImagesOn = noopPromise;
    window.randomTextsOn = function(){ return []; };
    window.buildRandomImages = function(){ return []; };
  }
})();


/* v038_27 legacy pink menu hard guard */
(function(){
  function hideLegacyMenus(){
    document.body && document.body.classList.add("tenotsu-surface-authority");
    document.querySelectorAll("#list-panel,#menu-panel,.menu-panel,.list-panel,.left-menu,#left-menu,#leftPanel,.right-menu,#right-menu,.legacy-menu,.showlist-menu").forEach(el => {
      el.classList.add("hidden");
      el.setAttribute("aria-hidden","true");
      el.style.setProperty("display","none","important");
      el.style.setProperty("visibility","hidden","important");
      el.style.setProperty("opacity","0","important");
      el.style.setProperty("pointer-events","none","important");
      el.style.setProperty("z-index","-1","important");
      el.style.setProperty("width","0","important");
      el.style.setProperty("height","0","important");
      el.style.setProperty("overflow","hidden","important");
      if (el.id === "list-panel") el.textContent = "";
    });
  }
  window.tenotsuHideLegacyMenus = hideLegacyMenus;
  ["showList","showlist","showMenuList","tenotsuForceShowMenuFallback"].forEach(name => {
    const prev = window[name];
    window[name] = function(){
      hideLegacyMenus();
      if (name === "tenotsuForceShowMenuFallback" && typeof window.tenotsuEnterOfficeMode === "function") {
        window.tenotsuEnterOfficeMode("legacy-menu-guard");
      }
      return false;
    };
    window[name].__previous = prev;
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hideLegacyMenus);
  else hideLegacyMenus();
  window.addEventListener("load", hideLegacyMenus);
  setTimeout(hideLegacyMenus, 50);
  setTimeout(hideLegacyMenus, 250);
  setTimeout(hideLegacyMenus, 1000);
})();


/* v038_27 script final cleanup pass */
(function(){
  function active(){ return tenotsuIsSurfaceTakeoverRuntime(); }
  function cleanup(){
    if (!active()) return;
    tenotsuSurfaceHideLegacyPanels();
    if (typeof window.tenotsuHideRandomShowLayers === "function") window.tenotsuHideRandomShowLayers();
  }
  ["showList","showlist","showMenuList","loadList"].forEach(name => {
    const prev = window[name];
    window[name] = function(){
      if (active()) {
        cleanup();
        if (arguments[0] === "office6.json") tenotsuSurfaceEnterOffice(name + "-final-suppressed");
        return false;
      }
      return typeof prev === "function" ? prev.apply(this, arguments) : false;
    };
    window[name].__previous = prev;
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", cleanup);
  else cleanup();
  window.addEventListener("load", cleanup);
  setTimeout(cleanup, 100);
  setTimeout(cleanup, 500);
  setTimeout(cleanup, 1500);
})();
