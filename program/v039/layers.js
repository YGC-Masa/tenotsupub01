/* v039_65 layers */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  function el(tag, attrs = {}, parent = null) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === "className") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key === "hidden") node.hidden = true;
      else node.setAttribute(key, value);
    });
    if (parent) parent.appendChild(node);
    return node;
  }

  ns.ensureRoot = function ensureRoot() {
    let game = document.getElementById("game-container");
    if (!game) game = el("main", { id: "game-container" }, document.body);

    let app = document.getElementById("tenotsu-app");
    if (!app) app = el("div", { id: "tenotsu-app" }, game);

    return app;
  };

  ns.ensureLayers = function ensureLayers() {
    const app = ns.ensureRoot();

    if (ns.layers && ns.layers.app === app && ns.layers.shopMenu && ns.layers.shopInfo && ns.layers.settings && ns.layers.storeStatus && ns.layers.tuning) {
      return ns.layers;
    }

    app.innerHTML = "";

    const layers = {};
    layers.app = app;
    layers.bg = el("div", { className: "tenotsu-bg-layer", "data-layer": "background" }, app);
    layers.bgImg = el("img", { alt: "", draggable: "false" }, layers.bg);
    layers.officeChars = el("div", { className: "tenotsu-office-character-layer", "data-layer": "office-characters" }, app);
    layers.ui = el("div", { className: "tenotsu-ui-layer", "data-layer": "ui" }, app);
    layers.menu = el("nav", { className: "tenotsu-office-menu", "aria-label": "事務所メニュー" }, app);
    layers.staminaHud = el("aside", { className: "tenotsu-stamina-hud", "aria-label": "営業リソース" }, app);
    layers.shopMenu = el("nav", { className: "tenotsu-shop-menu", "aria-label": "ショップメニュー", hidden: "hidden" }, app);
    layers.shopInfo = el("aside", { className: "tenotsu-shop-info-panel", "aria-label": "ショップ情報", hidden: "hidden" }, app);
    layers.settings = el("aside", { className: "tenotsu-settings-panel", "aria-label": "設定", hidden: "hidden" }, app);
    layers.members = el("section", { className: "tenotsu-members-panel", "aria-label": "メンバー", hidden: "hidden" }, app);
    layers.town = el("section", { className: "tenotsu-town-panel", "aria-label": "外回り", hidden: "hidden" }, app);
    layers.sales = el("section", { className: "tenotsu-sales-panel", "aria-label": "店舗営業", hidden: "hidden" }, app);
    layers.storeStatus = el("section", { className: "tenotsu-store-status-panel", "aria-label": "店舗管理", hidden: "hidden" }, app);
    layers.tuning = el("section", { className: "tenotsu-tuning-panel", "aria-label": "チューニング", hidden: "hidden" }, app);
    layers.battle = el("section", { className: "tenotsu-battle-panel", "aria-label": "接客バトル", hidden: "hidden" }, app);
    layers.result = el("section", { className: "tenotsu-result-panel", "aria-label": "営業リザルト", hidden: "hidden" }, app);
    layers.story = el("section", { className: "tenotsu-story-layer", "aria-label": "ストーリー", hidden: "hidden" }, app);
    layers.text = el("section", { className: "tenotsu-text-layer", "aria-live": "polite" }, app);
    layers.speaker = el("div", { className: "tenotsu-speaker" }, layers.text);
    layers.message = el("div", { className: "tenotsu-message" }, layers.text);
    layers.fade = el("div", { className: "tenotsu-fade-layer", "data-layer": "fade" }, app);
    layers.version = el("div", { className: "tenotsu-version-badge", text: ns.VERSION || "v039_47" }, app);

    ns.layers = layers;
    if (!layers.orientation) { layers.orientation = el("div", { className: "tenotsu-orientation-notice" }, app); layers.orientation.innerHTML = "<div>このゲームは横画面でお楽しみください。<br>端末を横向きにしてください。</div>"; }
    if (!layers.storyDebug) layers.storyDebug = el("div", { className: "tenotsu-story-debug-layer" }, app);
    return layers;
  };

  ns.preloadImage = function preloadImage(src, timeout = 2500) {
    if (!src || src.startsWith("data:")) return Promise.resolve(src);
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const finish = (result) => {
        if (done) return;
        done = true;
        resolve(result || src);
      };
      const timer = setTimeout(() => finish(src), timeout);
      img.onload = () => {
        clearTimeout(timer);
        finish(src);
      };
      img.onerror = () => {
        clearTimeout(timer);
        finish(null);
      };
      img.src = src;
    });
  };

  ns.setBackground = function setBackground(src) {
    const layers = ns.layers || ns.ensureLayers();
    const requested = src || ns.paths.officeBg;
    const fallback = ns.paths.fallbackBg || ns.paths.officeBg;
    const pixel = ns.paths.transparentPixel;

    layers.bg.style.backgroundImage = "url('" + requested + "')";
    layers.bgImg.onerror = () => {
      if (layers.bgImg.dataset.fallbackTried !== "1" && fallback && fallback !== requested) {
        layers.bgImg.dataset.fallbackTried = "1";
        layers.bg.style.backgroundImage = "url('" + fallback + "')";
        layers.bgImg.src = fallback;
        return;
      }
      layers.bgImg.onerror = null;
      layers.bg.style.backgroundImage = "none";
      layers.bgImg.src = pixel;
    };
    layers.bgImg.dataset.fallbackTried = "0";
    layers.bgImg.src = requested;
  };

  ns.setBackgroundReady = async function setBackgroundReady(src) {
    const requested = src || ns.paths.officeBg;
    const fallback = ns.paths.fallbackBg || ns.paths.officeBg;
    const loaded = await ns.preloadImage(requested);
    if (loaded) {
      ns.setBackground(requested);
      return requested;
    }
    if (fallback && fallback !== requested) {
      await ns.preloadImage(fallback);
      ns.setBackground(fallback);
      return fallback;
    }
    ns.setBackground(requested);
    return requested;
  };

  ns.setStoryBackgroundReady = async function setStoryBackgroundReady(src) {
    // Story CG must not disappear into office fallback when preload fails.
    // Try to preload; if it fails or times out, still set the requested source directly
    // and keep the previous visual until the browser resolves it.
    const requested = src || ns.paths.officeBg;
    const loaded = await ns.preloadImage(requested, 1800);
    ns.setBackground(requested);
    return loaded || requested;
  };

  ns.setText = function setText(speaker, message) {
    const layers = ns.layers || ns.ensureLayers();
    const safeSpeaker = speaker || "";
    layers.speaker.textContent = safeSpeaker;
    layers.message.textContent = message || "";
    const color = typeof ns.getReadableNameColor === "function" ? ns.getReadableNameColor(safeSpeaker) : "#ffe2a3";
    layers.text.style.setProperty("--speaker-color", color);
    layers.speaker.style.setProperty("--speaker-color", color);
    layers.speaker.dataset.speaker = safeSpeaker;
  };

  ns.showSettingsPanel = function showSettingsPanel(html) {
    const layers = ns.layers || ns.ensureLayers();
    layers.settings.hidden = false;
    layers.settings.innerHTML = html || "";
  };

  ns.hideSettingsPanel = function hideSettingsPanel() {
    const layers = ns.layers || ns.ensureLayers();
    layers.settings.hidden = true;
    layers.settings.innerHTML = "";
  };

  ns.showShopPanel = function showShopPanel(menuHtml, infoHtml) {
    const layers = ns.ensureLayers();
    layers.shopMenu.hidden = false;
    layers.shopInfo.hidden = false;
    layers.shopMenu.innerHTML = menuHtml || "";
    layers.shopInfo.innerHTML = infoHtml || "";
  };

  ns.hideShopPanel = function hideShopPanel() {
    const layers = ns.ensureLayers();
    layers.shopMenu.hidden = true;
    layers.shopMenu.innerHTML = "";
    layers.shopInfo.hidden = true;
    layers.shopInfo.innerHTML = "";
  };

  ns.clearCharacters = function clearCharacters() {
    const layers = ns.ensureLayers();
    layers.officeChars.innerHTML = "";
  };

  ns.showMembersPanel = function showMembersPanel(html) {
    const layers = ns.ensureLayers();
    layers.members.hidden = false;
    layers.members.innerHTML = html || "";
  };

  ns.hideMembersPanel = function hideMembersPanel() {
    const layers = ns.ensureLayers();
    if (!layers.members) return;
    layers.members.hidden = true;
    layers.members.innerHTML = "";
  };

  ns.showTownPanel = function showTownPanel(html) {
    const layers = ns.ensureLayers();
    layers.town.hidden = false;
    layers.town.innerHTML = html || "";
  };

  ns.hideTownPanel = function hideTownPanel() {
    const layers = ns.ensureLayers();
    if (!layers.town) return;
    layers.town.hidden = true;
    layers.town.innerHTML = "";
  };

  ns.showStoreStatusPanel = function showStoreStatusPanel(html) {
    const layers = ns.ensureLayers();
    layers.storeStatus.hidden = false;
    layers.storeStatus.innerHTML = html || "";
  };

  ns.hideStoreStatusPanel = function hideStoreStatusPanel() {
    const layers = ns.ensureLayers();
    if (!layers.storeStatus) return;
    layers.storeStatus.hidden = true;
    layers.storeStatus.innerHTML = "";
  };

  ns.showTuningPanel = function showTuningPanel(html) {
    const layers = ns.ensureLayers();
    layers.tuning.hidden = false;
    layers.tuning.innerHTML = html || "";
  };

  ns.hideTuningPanel = function hideTuningPanel() {
    const layers = ns.ensureLayers();
    if (!layers.tuning) return;
    layers.tuning.hidden = true;
    layers.tuning.innerHTML = "";
  };


  ns.storyProbeAssets = {
    hina: "images/assets/char/a10501.webp",
    ai: "images/assets/char/b10501.webp",
    midori: "images/assets/char/c10501.webp",
    kogane: "images/assets/char/d10501.webp",
    kohaku: "images/assets/char/e10501.webp",
    yukino: "images/assets/char/g10501.webp"
  };

  ns.showStorySurfaceProbe = function showStorySurfaceProbe(reason) {
    const layers = ns.ensureLayers();
    if (!layers.storyDebug) return;
    if (!(ns.mode === "story" || document.body.dataset.v039Mode === "story")) return;
    const a = ns.storyProbeAssets || {};
    layers.storyDebug.style.display = "block";
    layers.storyDebug.innerHTML = `
      <div class="probe-label probe-label-main">SURFACE PROBE v039_47: ${reason || "active"}</div>
      <img class="probe-char probe-z0500" src="${a.yukino}" alt="">
      <img class="probe-char probe-z1000" src="${a.hina}" alt="">
      <img class="probe-char probe-z2000" src="${a.ai}" alt="">
      <img class="probe-char probe-z3000" src="${a.midori}" alt="">
      <img class="probe-char probe-z4000" src="${a.kogane}" alt="">
      <img class="probe-char probe-z6000" src="${a.kohaku}" alt="">
      <div class="probe-chip probe-chip-0500">z500 雪乃/低層</div>
      <div class="probe-chip probe-chip-1000">z1000 緋奈</div>
      <div class="probe-chip probe-chip-2000">z2000 藍</div>
      <div class="probe-chip probe-chip-3000">z3000 翠</div>
      <div class="probe-chip probe-chip-4000">z4000 こがね</div>
      <div class="probe-chip probe-chip-6000">z6000 琥珀</div>
    `;
  };

  ns.flashStoryDebugLabel = function flashStoryDebugLabel(label, kind) {
    const layers = ns.ensureLayers();
    if (!layers.storyDebug) return;
    if (!(ns.mode === "story" || document.body.dataset.v039Mode === "story")) return;
    ns.showStorySurfaceProbe(label);
    const el = document.createElement("div");
    el.className = "probe-flash " + (kind || "");
    el.textContent = label;
    layers.storyDebug.appendChild(el);
    setTimeout(() => {
      try { el.remove(); } catch (_) {}
    }, 900);
  };

  ns.warnIfStoryFadeVisible = function warnIfStoryFadeVisible(label) {
    if (!(ns.mode === "story" || document.body.dataset.v039Mode === "story")) return;
    const fade = (ns.layers && ns.layers.fade) || document.querySelector(".tenotsu-fade-layer");
    if (!fade) return;
    const cs = getComputedStyle(fade);
    const visible = cs.display !== "none" && cs.visibility !== "hidden" && Number(cs.opacity || 0) > 0.01;
    if (visible) {
      ns.flashStoryDebugLabel("FADE VISIBLE: " + (label || ""), "danger");
    }
  };

  ns.ensureStoryBodySpriteLayer = function ensureStoryBodySpriteLayer() {
    const layers = ns.ensureLayers();
    let layer = document.getElementById("tenotsu-story-body-sprite-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "tenotsu-story-body-sprite-layer";
      layer.className = "tenotsu-story-body-sprite-layer story-character-slot-v52";
    }

    // v039_51: keep story sprites in the same #tenotsu-app stacking context as
    // the background and the text UI.  The old body-level overlay could paint
    // above the text box even with a smaller z-index because #tenotsu-app uses
    // its own isolated stacking context.
    if (layer.parentNode !== layers.app) {
      try { layer.parentNode && layer.parentNode.removeChild(layer); } catch (_) {}
      layers.app.insertBefore(layer, layers.text || null);
    } else if (layers.text && layer.nextSibling !== layers.text) {
      layers.app.insertBefore(layer, layers.text);
    }

    layer.hidden = false;
    layer.removeAttribute("hidden");
    layer.style.setProperty("display", "block", "important");
    layer.style.setProperty("visibility", "visible", "important");
    layer.style.setProperty("opacity", "1", "important");
    layer.style.setProperty("z-index", "200", "important");

    return layer;
  };

  ns.normalizeStoryCharacterListV039100 = function normalizeStoryCharacterListV039100(characters) {
    const raw = Array.isArray(characters) ? characters.filter((ch) => ch && ch.src && !String(ch.src).endsWith("/NULL")) : [];
    const byId = new Map();
    raw.forEach((ch, index) => {
      const key = String(ch.id || ch.src || index);
      byId.set(key, Object.assign({}, ch));
    });
    let list = Array.from(byId.values());
    if (list.length > 5) list = list.slice(list.length - 5);
    const slotSets = {
      1: [{ side: "center", left: "50%" }],
      2: [{ side: "left", left: "34%" }, { side: "right", left: "66%" }],
      3: [{ side: "left", left: "25%" }, { side: "center", left: "50%" }, { side: "right", left: "75%" }],
      4: [{ side: "maxleft", left: "16%" }, { side: "left", left: "38%" }, { side: "right", left: "62%" }, { side: "maxright", left: "84%" }],
      5: [{ side: "maxleft", left: "12%" }, { side: "left", left: "31%" }, { side: "center", left: "50%" }, { side: "right", left: "69%" }, { side: "maxright", left: "88%" }]
    };
    const slots = slotSets[Math.min(5, Math.max(1, list.length))] || slotSets[1];
    return list.map((ch, index) => Object.assign({}, ch, {
      side: ch.side || slots[index].side,
      left: ch.left || slots[index].left
    }));
  };

  ns.showStoryCharacters = function showStoryCharacters(characters) {
    const list = ns.normalizeStoryCharacterListV039100 ? ns.normalizeStoryCharacterListV039100(characters) : (Array.isArray(characters) ? characters.filter((ch) => ch && ch.src && !String(ch.src).endsWith("/NULL")) : []);
    const layer = ns.ensureStoryBodySpriteLayer();
    if (!list.length) {
      layer.innerHTML = "";
      return;
    }

    layer.innerHTML = list.map((ch, index) => {
      const side = ch.side || (index === 0 ? "center" : index === 1 ? "left" : "right");
      const src = ch.src || "";
      const opacity = ch.opacity === undefined ? 1 : ch.opacity;
      const left = ch.left || (side === "center" ? "50%" : side === "left" ? "25%" : side === "right" ? "75%" : "50%");
      const id = String(ch.id || "");
      const isEnemyCard = !!(ch.frame === "enemy" || ch.variant === "storyEnemyCard" || id.indexOf("enemy") === 0 || id === "kd" || id === "bk" || String(src).indexOf("/enemy/") >= 0 || String(src).indexOf("/event/dirty_alien") >= 0);
      const isRivalStoryStand = !!(id === "ba" || id === "bb" || id === "bc" || String(src).indexOf("/rival/story_") >= 0);
      const className = [
        "tenotsu-story-body-standing",
        `side-${side}`,
        "bottom-align",
        isEnemyCard ? "tenotsu-story-enemy-card" : "",
        isRivalStoryStand ? "tenotsu-story-rival-knee-shot" : ""
      ].filter(Boolean).join(" ");
      return `<img class="${className}" src="${src}" style="left:${left}; opacity:${opacity};" alt="">`;
    }).join("");
  };

  ns.hideStoryCharacters = function hideStoryCharacters() {
    const legacy = ns.layers && ns.layers.storyCharacters;
    if (legacy) {
      legacy.hidden = true;
      legacy.innerHTML = "";
    }
    const layer = document.getElementById("tenotsu-story-body-sprite-layer");
    if (layer) {
      layer.innerHTML = "";
      layer.hidden = true;
      layer.style.setProperty("display", "none", "important");
      layer.style.setProperty("visibility", "hidden", "important");
      layer.style.setProperty("opacity", "0", "important");
    }
  };

  ns.showBattlePanel = function showBattlePanel(html) {
    const layers = ns.ensureLayers();
    layers.battle.hidden = false;
    layers.battle.innerHTML = html || "";
  };

  ns.hideBattlePanel = function hideBattlePanel() {
    const layers = ns.ensureLayers();
    if (!layers.battle) return;
    layers.battle.hidden = true;
    layers.battle.innerHTML = "";
  };

  ns.showResultPanel = function showResultPanel(html) {
    const layers = ns.ensureLayers();
    layers.result.hidden = false;
    layers.result.innerHTML = html || "";
  };

  ns.hideResultPanel = function hideResultPanel() {
    const layers = ns.ensureLayers();
    if (!layers.result) return;
    layers.result.hidden = true;
    layers.result.innerHTML = "";
  };

  ns.showSalesPanel = function showSalesPanel(html) {
    const layers = ns.ensureLayers();
    layers.sales.hidden = false;
    layers.sales.innerHTML = html || "";
  };

  ns.hideSalesPanel = function hideSalesPanel() {
    const layers = ns.ensureLayers();
    if (!layers.sales) return;
    layers.sales.hidden = true;
    layers.sales.innerHTML = "";
  };

  ns.showStoryLayer = function showStoryLayer(html) {
    const layers = ns.ensureLayers();
    layers.story.hidden = false;
    layers.story.classList.remove("ending");
    layers.story.style.removeProperty("pointer-events");
    layers.story.innerHTML = html || "";
  };

  ns.hideStoryLayer = function hideStoryLayer() {
    const layers = ns.ensureLayers();
    if (!layers.story) return;
    layers.story.classList.remove("ending");
    layers.story.style.removeProperty("pointer-events");
    layers.story.hidden = true;
    layers.story.innerHTML = "";
  };
})();
