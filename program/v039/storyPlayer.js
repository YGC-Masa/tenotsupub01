/* v039_139 story player: event CG cleanup on hide/end + safe story start fade */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  ns.suppressStoryFadeLayer = function suppressStoryFadeLayer() {
    const mode = ns.mode || (document.body && document.body.dataset && document.body.dataset.v039Mode);
    if (!(mode === "story" || (document.body && document.body.classList && document.body.classList.contains("tenotsu-story-active")))) return;
    if (document.body && document.body.classList && document.body.classList.contains("tenotsu-story-start-blackfade")) return;
    // v039_117: background changes may intentionally use the black fade layer.
    // Do not kill it while that transition is active.
    if (document.body && document.body.classList && document.body.classList.contains("tenotsu-story-bg-blackfade")) return;
    const layers = ns.layers || {};
    const fade = layers.fade || document.querySelector(".tenotsu-fade-layer");
    if (!fade) return;
    fade.style.setProperty("transition", "none", "important");
    fade.style.setProperty("animation", "none", "important");
    fade.style.setProperty("opacity", "0", "important");
    fade.style.setProperty("display", "none", "important");
    fade.style.setProperty("visibility", "hidden", "important");
    fade.style.setProperty("pointer-events", "none", "important");
  };

  ns.storyDebugDelay = function storyDebugDelay(ms) {
    return Promise.resolve();
  };

  ns.findStoryBackgroundImage = function findStoryBackgroundImage() {
    return document.querySelector(".tenotsu-bg-layer img")
      || document.querySelector(".tenotsu-background-layer img")
      || document.querySelector("[data-bg-layer] img")
      || document.querySelector(".background img");
  };

  ns.directSetStoryBackgroundImage = function directSetStoryBackgroundImage(bgPath) {
    const img = ns.findStoryBackgroundImage();
    if (img) {
      img.src = bgPath;
      img.style.visibility = "visible";
      img.style.opacity = "1";
      img.style.transition = "none";
      return true;
    }
    return false;
  };


  ns.setStoryBackgroundDirect = async function setStoryBackgroundDirect(bgPath, options = {}) {
    if (!bgPath) return;
    const layers = ns.layers || ns.ensureLayers();
    const requested = bgPath;
    if (ns.disableUnifiedStoryBackgroundLayer) ns.disableUnifiedStoryBackgroundLayer();
    if (ns.hideEventCgSurface) ns.hideEventCgSurface();
    if (ns.suppressStoryFadeLayer) ns.suppressStoryFadeLayer();

    // Preload, but never fall back to office/town while story explicitly asks a bg.
    await new Promise((resolve) => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve;
      img.src = requested;
      setTimeout(resolve, 1200);
    });

    if (layers.bg) {
      layers.bg.hidden = false;
      layers.bg.style.setProperty("display", "block", "important");
      layers.bg.style.setProperty("visibility", "visible", "important");
      layers.bg.style.setProperty("opacity", "1", "important");
      layers.bg.style.setProperty("z-index", "100", "important");
      layers.bg.style.setProperty("background-image", `url("${requested}")`, "important");
      layers.bg.style.setProperty("background-size", "cover", "important");
      layers.bg.style.setProperty("background-position", "center", "important");
      layers.bg.style.setProperty("background-repeat", "no-repeat", "important");
    }
    if (layers.bgImg) {
      layers.bgImg.onerror = null;
      layers.bgImg.removeAttribute("hidden");
      layers.bgImg.style.setProperty("display", "block", "important");
      layers.bgImg.style.setProperty("visibility", "visible", "important");
      layers.bgImg.style.setProperty("opacity", "1", "important");
      layers.bgImg.style.setProperty("width", "100%", "important");
      layers.bgImg.style.setProperty("height", "100%", "important");
      layers.bgImg.style.setProperty("object-fit", "cover", "important");
      layers.bgImg.src = requested;
    }

    document.querySelectorAll("#tenotsu-unified-story-bg-layer,#tenotsu-event-cg-surface,.tenotsu-event-cg-layer,.tenotsu-cg-layer,.event-cg-layer,.memory-cg-layer,[data-event-cg],[data-cg-layer]").forEach((el) => {
      el.hidden = true;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });

    ns.storyCurrentBackground = requested;
    if (ns.story) ns.story.lastBg = requested;
    if (ns.suppressStoryFadeLayer) ns.suppressStoryFadeLayer();
    return requested;
  };

  ns.storySpriteMap = {
    hina: "images/assets/char/a10501.webp",
    ai: "images/assets/char/b10501.webp"
  };

  ns.getStoryForcedCharacters = function getStoryForcedCharacters(step) {
    const speaker = String((step && step.speaker) || "");
    const title = String((ns.story && ns.story.data && ns.story.data.title) || "");
    const list = [];
    if ((speaker.includes("緋奈") || title.includes("弁当")) && ns.storySpriteMap.hina) {
      list.push({ side: "center", src: ns.storySpriteMap.hina, left: "50%", opacity: 1 });
    }
    if ((speaker.includes("藍") || title.includes("読書") || title.includes("しおり") || title.includes("パン")) && ns.storySpriteMap.ai) {
      list.push({ side: "center", src: ns.storySpriteMap.ai, zIndex: 2000, left: "27%", opacity: 1 });
    }
    return list;
  };

  ns.disableUnifiedStoryBackgroundLayer = function disableUnifiedStoryBackgroundLayer() {
    const layer=document.getElementById("tenotsu-unified-story-bg-layer");
    if(layer){layer.hidden=true;layer.style.setProperty("display","none","important");layer.style.setProperty("visibility","hidden","important");layer.style.setProperty("opacity","0","important");}
  };

  ns.setUnifiedStoryBackground = async function setUnifiedStoryBackground(bgPath) {
    if(!bgPath) return;
    if(ns.disableUnifiedStoryBackgroundLayer) ns.disableUnifiedStoryBackgroundLayer();
    if(ns.hideEventCgSurface) ns.hideEventCgSurface();
    if(ns.suppressStoryFadeLayer) ns.suppressStoryFadeLayer();
    await new Promise((resolve)=>{const img=new Image(); img.onload=resolve; img.onerror=resolve; img.src=bgPath;});
    document.querySelectorAll(".tenotsu-bg-layer,.tenotsu-background-layer,[data-bg-layer],.background").forEach((el)=>{
      el.hidden=false; el.style.setProperty("display","block","important"); el.style.setProperty("visibility","visible","important"); el.style.setProperty("opacity","1","important"); el.style.setProperty("background-image",`url("${bgPath}")`,"important");
    });
    document.querySelectorAll(".tenotsu-bg-layer img,.tenotsu-background-layer img,[data-bg-layer] img,.background img").forEach((img)=>{
      img.src=bgPath; img.style.setProperty("display","block","important"); img.style.setProperty("visibility","visible","important"); img.style.setProperty("opacity","1","important");
    });
    if(typeof ns.setBackground==="function") ns.setBackground(bgPath);
    if(typeof ns.directSetStoryBackgroundImage==="function") ns.directSetStoryBackgroundImage(bgPath);
    ns.storyCurrentBackground=bgPath;
    if(ns.suppressStoryFadeLayer) ns.suppressStoryFadeLayer();
    if(ns.forceMobileStoryVisibility) ns.forceMobileStoryVisibility();
  };

  ns.restoreStoryBackgroundAfterEventCg = function restoreStoryBackgroundAfterEventCg(bgPath) {
    if (!bgPath) return;
    try {
      const layers = ns.layers || ns.ensureLayers();
      if (layers && layers.bg) {
        layers.bg.hidden = false;
        layers.bg.style.setProperty("display", "block", "important");
        layers.bg.style.setProperty("visibility", "visible", "important");
        layers.bg.style.setProperty("opacity", "1", "important");
        layers.bg.style.setProperty("background-image", `url("${bgPath}")`, "important");
        layers.bg.style.setProperty("background-size", "cover", "important");
        layers.bg.style.setProperty("background-position", "center", "important");
        layers.bg.style.setProperty("background-repeat", "no-repeat", "important");
      }
      if (layers && layers.bgImg) {
        layers.bgImg.removeAttribute("hidden");
        layers.bgImg.hidden = false;
        layers.bgImg.style.setProperty("display", "block", "important");
        layers.bgImg.style.setProperty("visibility", "visible", "important");
        layers.bgImg.style.setProperty("opacity", "1", "important");
        layers.bgImg.style.setProperty("object-fit", "cover", "important");
        layers.bgImg.style.setProperty("object-position", "center center", "important");
        layers.bgImg.src = bgPath;
      }
      if (typeof ns.directSetStoryBackgroundImage === "function") ns.directSetStoryBackgroundImage(bgPath);
      ns.storyCurrentBackground = bgPath;
      if (ns.story) ns.story.lastBg = bgPath;
    } catch (_) {}
  };

  ns.hideEventCgSurface = function hideEventCgSurface(options = {}) {
    const restorePath = (!options || !options.noRestore) && ns.storyEventCgActive ? (ns.storyEventCgRestoreBackground || "") : "";
    ns.storyEventCgActive = false;
    ns.storyEventCgRestoreBackground = "";
    document.body.classList.remove("tenotsu-event-cg-active");
    document.querySelectorAll(".tenotsu-event-cg-layer, .tenotsu-cg-layer, .event-cg-layer, .memory-cg-layer, [data-event-cg], [data-cg-layer]").forEach((el) => {
      el.hidden = true;
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("opacity", "0", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
    document.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src") || "";
      if (src.includes("memory_") || src.includes("bg_memory_")) {
        const parent = img.closest(".tenotsu-bg-layer, .tenotsu-background-layer, [data-bg-layer], .background");
        if (!parent) {
          img.style.setProperty("display", "none", "important");
          img.style.setProperty("visibility", "hidden", "important");
          img.style.setProperty("opacity", "0", "important");
        }
      }
    });
    if (restorePath && typeof ns.restoreStoryBackgroundAfterEventCg === "function") ns.restoreStoryBackgroundAfterEventCg(restorePath);
  };

  ns.showEventCgSurface = function showEventCgSurface(src) {
    if (!src) return;
    const restorePath = ns.storyCurrentBackground || (ns.story && ns.story.lastBg) || "";
    const markActive = () => {
      ns.storyEventCgActive = true;
      ns.storyEventCgRestoreBackground = restorePath;
      document.body.classList.add("tenotsu-event-cg-active");
    };
    markActive();
    if (typeof ns.setUnifiedStoryBackground === "function") {
      Promise.resolve(ns.setUnifiedStoryBackground(src)).then(markActive).catch(markActive);
    } else if (typeof ns.setStoryBackgroundDirect === "function") {
      Promise.resolve(ns.setStoryBackgroundDirect(src, { force:true })).then(markActive).catch(markActive);
    } else if (typeof ns.setBackground === "function") {
      try { ns.setBackground(src); } catch (_) {}
      markActive();
    }
  };

  ns.forceReplaceStoryBackground = async function forceReplaceStoryBackground(bgPath) {
    if (!bgPath) return;
    if (typeof ns.setUnifiedStoryBackground === "function") {
      await ns.setUnifiedStoryBackground(bgPath);
      return;
    }
    await ns.setStoryBackgroundNoFlash(bgPath);
  };

  ns.setStoryBackgroundNoFlash = async function setStoryBackgroundNoFlash(bgPath) {
    if (!bgPath) return;
    if (ns.storyCurrentBackground === bgPath) return;
    if (typeof ns.setUnifiedStoryBackground === "function") {
      await ns.setUnifiedStoryBackground(bgPath);
      return;
    }
    if (typeof ns.setBackground === "function") ns.setBackground(bgPath);
    ns.storyCurrentBackground = bgPath;
  };

  ns.forceMobileStoryVisibility = function forceMobileStoryVisibility() {
    if (!(ns.mode === "story" || document.body.dataset.v039Mode === "story")) return;
    if (ns.suppressStoryFadeLayer) ns.suppressStoryFadeLayer();
    const layer = ns.layers && ns.layers.storyCharacters;
    if (layer) {
      layer.hidden = false;
      layer.removeAttribute("hidden");
      layer.style.setProperty("display", "block", "important");
      layer.style.setProperty("visibility", "visible", "important");
      layer.style.setProperty("opacity", "1", "important");
      layer.style.setProperty("z-index", "200", "important");
    }
    const bodyLayer = document.getElementById("tenotsu-story-body-sprite-layer");
    if (bodyLayer) {
      bodyLayer.hidden = false;
      bodyLayer.removeAttribute("hidden");
      bodyLayer.style.setProperty("display", "block", "important");
      bodyLayer.style.setProperty("visibility", "visible", "important");
      bodyLayer.style.setProperty("opacity", "1", "important");
      bodyLayer.style.setProperty("z-index", "200", "important");
    }
    document.querySelectorAll(".tenotsu-story-standing, .tenotsu-story-body-standing").forEach((img) => {
      img.style.setProperty("display", "block", "important");
      img.style.setProperty("visibility", "visible", "important");
      img.style.setProperty("opacity", "1", "important");
    });
  };

  ns.storyCurrentBackground = "";
  ns.storyCurrentSpriteKey = "";

  ns.story = { active:false, data:null, index:-1, returnInfo:null, isEnding:false, isLoadingStep:false, lastBg:null };

  ns.resetStoryRuntime = function resetStoryRuntime(options = {}) {
    ns.story.active = false; ns.story.data = null; ns.story.index = -1; ns.story.returnInfo = null;
    ns.story.isEnding = false; ns.story.isLoadingStep = false; ns.story.lastBg = null;
    document.body.classList.remove("tenotsu-story-active","tenotsu-story-final-line","tenotsu-story-loading");
    const layers = ns.layers || ns.ensureLayers();
    if (layers.story) { layers.story.classList.remove("ending","loading"); layers.story.style.removeProperty("pointer-events"); layers.story.hidden = true; layers.story.innerHTML = ""; }
    if (layers.fade && !options.keepFade) { layers.fade.style.transition = ""; layers.fade.style.opacity = "0"; layers.fade.style.display = "none"; layers.fade.style.pointerEvents = "none"; }
  };

  ns.loadStoryScenario = async function loadStoryScenario(path) {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("scenario fetch failed: " + path + " / " + res.status);
    return await res.json();
  };

  ns.prepareStoryFirstBackground = async function prepareStoryFirstBackground(data) {
    const first = data && data.steps && data.steps[0] ? data.steps[0] : null;
    if (first && first.bg) {
      if (typeof ns.setStoryBackgroundDirect === "function") await ns.setStoryBackgroundDirect(first.bg, { initial:true, force:true });
      else await ns.setStoryBackgroundNoFlash(first.bg);
      ns.story.lastBg = first.bg;
    }
  };

  ns.fadeOutForStoryStart = function fadeOutForStoryStart() {
    const layers = ns.layers || ns.ensureLayers();
    layers.fade.style.display = "block"; layers.fade.style.pointerEvents = "auto"; layers.fade.style.transition = "opacity 520ms ease"; layers.fade.style.opacity = "0";
    return new Promise((resolve) => requestAnimationFrame(() => { layers.fade.style.opacity = "1"; setTimeout(resolve, 560); }));
  };

  ns.fadeInForStoryStart = function fadeInForStoryStart() {
    const layers = ns.layers || ns.ensureLayers();
    layers.fade.style.display = "block"; layers.fade.style.pointerEvents = "auto"; layers.fade.style.transition = "opacity 520ms ease"; layers.fade.style.opacity = "1";
    return new Promise((resolve) => requestAnimationFrame(() => {
      layers.fade.style.opacity = "0";
      setTimeout(() => { document.body.classList.remove("tenotsu-story-start-blackfade"); layers.fade.style.display = "none"; layers.fade.style.pointerEvents = "none"; layers.fade.style.transition = ""; resolve(); }, 560);
    }));
  };

  ns.clearStoryTextBoxForTransition = function clearStoryTextBoxForTransition() {
    try { if (typeof ns.setText === "function") ns.setText("", ""); } catch (_) {}
    const layer = ns.layers && ns.layers.story;
    if (layer) {
      layer.querySelectorAll(".speaker,.text,.tenotsu-text-speaker,.tenotsu-text-body,[data-speaker],[data-text]").forEach((el) => { el.textContent = ""; });
    }
  };

  ns.fadeForStoryBgChange = async function fadeForStoryBgChange(apply) {
    // v039_117: black-out / black-in when the story background actually changes.
    const layers = ns.layers || ns.ensureLayers();
    const fade = layers && layers.fade ? layers.fade : document.querySelector(".tenotsu-fade-layer");
    if (!fade) { if (typeof ns.clearStoryTextBoxForTransition === "function") ns.clearStoryTextBoxForTransition(); if (typeof apply === "function") await apply(); return; }
    if (typeof ns.clearStoryTextBoxForTransition === "function") ns.clearStoryTextBoxForTransition();
    document.body.classList.add("tenotsu-story-bg-blackfade");
    fade.style.removeProperty("display");
    fade.style.removeProperty("visibility");
    fade.style.removeProperty("opacity");
    fade.style.removeProperty("transition");
    fade.style.removeProperty("animation");
    fade.style.display = "block";
    fade.style.visibility = "visible";
    fade.style.pointerEvents = "auto";
    fade.style.transition = "opacity 220ms ease";
    fade.style.opacity = "0";
    await new Promise((resolve) => requestAnimationFrame(() => {
      fade.style.opacity = "1";
      setTimeout(resolve, 240);
    }));
    if (typeof apply === "function") await apply();
    fade.style.transition = "opacity 260ms ease";
    await new Promise((resolve) => requestAnimationFrame(() => {
      fade.style.opacity = "0";
      setTimeout(resolve, 280);
    }));
    fade.style.display = "none";
    fade.style.visibility = "hidden";
    fade.style.pointerEvents = "none";
    fade.style.transition = "";
    document.body.classList.remove("tenotsu-story-bg-blackfade");
    ns.suppressStoryFadeLayer();
  };

  ns.setStoryLoading = function setStoryLoading(isLoading) {
    ns.story.isLoadingStep = !!isLoading;
    document.body.classList.toggle("tenotsu-story-loading", !!isLoading);
    const layer = ns.layers && ns.layers.story;
    if (layer) layer.classList.toggle("loading", !!isLoading);
    const click = layer ? layer.querySelector("[data-story-action='next']") : null;
    if (click) click.disabled = !!isLoading;
  };

  ns.installStoryTapHighlightGuard = function installStoryTapHighlightGuard() {
    const layer = ns.layers && ns.layers.story;
    if (!layer || layer.__tapHighlightGuardInstalled) return;
    layer.__tapHighlightGuardInstalled = true;
    const clearActive = () => {
      try { if (document.activeElement && typeof document.activeElement.blur === "function") document.activeElement.blur(); } catch (_) {}
      if (ns.suppressStoryFadeLayer) ns.suppressStoryFadeLayer();
      if (ns.forceMobileStoryVisibility) ns.forceMobileStoryVisibility();
    };
    ["pointerdown", "touchstart", "mousedown", "pointerup", "touchend", "mouseup", "click"].forEach((type) => {
      layer.addEventListener(type, clearActive, { passive: true });
    });
  };

  ns.startStory = async function startStory(scenarioPath, returnInfo = {}) {
    try {
      ns.ensureLayers();
      if (typeof ns.hideEventCgSurface === "function") ns.hideEventCgSurface({ noRestore:true });
      await ns.fadeOutForStoryStart();
      document.body.classList.add("tenotsu-story-start-blackfade");
      if (typeof ns.clearStoryTextBoxForTransition === "function") ns.clearStoryTextBoxForTransition();
      ns.setMode("story"); ns.resetStoryRuntime({ keepFade: true }); ns.setMode("story");
      {
        const layers = ns.layers || ns.ensureLayers();
        if (layers.fade) {
          layers.fade.style.display = "block";
          layers.fade.style.visibility = "visible";
          layers.fade.style.pointerEvents = "auto";
          layers.fade.style.transition = "";
          layers.fade.style.opacity = "1";
        }
      }
      if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
      if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
      if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
      if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
      if (typeof ns.clearCharacters === "function") ns.clearCharacters();
      const data = await ns.loadStoryScenario(scenarioPath);
      if (typeof ns.clearStoryTextBoxForTransition === "function") ns.clearStoryTextBoxForTransition();
      await ns.prepareStoryFirstBackground(data);
      ns.story.active = true; ns.story.data = data; ns.story.index = -1;
      ns.story.returnInfo = Object.assign({}, data.return || {}, returnInfo || {});
      ns.story.isEnding = false; ns.story.isLoadingStep = false;
      ns.showStoryLayer(`
        <button type="button" class="tenotsu-story-click" data-story-action="next" aria-label="次へ"></button>
        <div class="tenotsu-story-ui">
          <div class="tenotsu-story-title">${data.title || "Story"}</div>
          <div class="tenotsu-story-progress" data-story-progress>0 / ${(data.steps || []).length}</div>
          <button type="button" class="tenotsu-story-skip" data-story-action="end">終了</button>
        </div>
        <div class="tenotsu-story-hint">クリック / タップで進む</div>
        <div class="tenotsu-click-wait" aria-hidden="true"></div>
      `);
      const layer = ns.layers.story;
      if (typeof ns.installStoryTapHighlightGuard === "function") ns.installStoryTapHighlightGuard();
      layer.classList.remove("ending","loading"); layer.style.removeProperty("pointer-events");
      const nextButton = layer.querySelector('[data-story-action="next"]');
      const endButton = layer.querySelector('[data-story-action="end"]');
      if (nextButton) nextButton.onclick = () => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); ns.suppressStoryFadeLayer(); ns.nextStoryStep(); };
      if (endButton) endButton.onclick = () => ns.beginStoryEnd();
      document.body.classList.add("tenotsu-story-active");
      await ns.nextStoryStep({ initial:true });
      await ns.fadeInForStoryStart();
      ns.suppressStoryFadeLayer();
    } catch (err) {
      console.error(err);
      document.body.classList.remove("tenotsu-story-start-blackfade");
      ns.setText("システム", "シナリオを読み込めませんでした: " + err.message);
      const layers = ns.layers || ns.ensureLayers();
      if (layers.fade) { layers.fade.style.opacity = "0"; layers.fade.style.display = "none"; layers.fade.style.pointerEvents = "none"; layers.fade.style.transition = ""; }
      if (typeof ns.enterTown === "function") ns.enterTown();
    }
  };

  ns.storyProgressText = function storyProgressText() {
    const steps = (ns.story.data && ns.story.data.steps) ? ns.story.data.steps : [];
    const current = Math.min(Math.max(ns.story.index + 1, 1), Math.max(steps.length, 1));
    return current + " / " + steps.length;
  };

  ns.updateStoryUi = function updateStoryUi() {
    const layer = ns.layers && ns.layers.story; if (!layer) return;
    const progress = layer.querySelector("[data-story-progress]"); if (progress) progress.textContent = ns.storyProgressText();
    const steps = (ns.story.data && ns.story.data.steps) ? ns.story.data.steps : [];
    layer.dataset.storyIndex = String(ns.story.index); layer.dataset.storyTotal = String(steps.length);
  };

  ns.clearStorySpritesV2 = function clearStorySpritesV2() {
    ns.storyCurrentSpriteKey = "";
    if (typeof ns.hideStoryCharacters === "function") ns.hideStoryCharacters();
  };

  ns.normalizeStorySpriteLayerOrder = function normalizeStorySpriteLayerOrder(sprites) {
    const forceCenter = !!(ns.story && ns.story.data && ns.story.data.renderPolicy && ns.story.data.renderPolicy.forceCenterSprites);
    return (Array.isArray(sprites) ? sprites : []).map((s) => {
      const copy = Object.assign({}, s);
      // Story character plane order is owned by CSS.  Do not let scenario zIndex
      // push sprites in front of the text UI.
      delete copy.zIndex;
      if (forceCenter) {
        copy.side = "center";
        copy.left = copy.left || "50%";
        copy.lockPosition = true;
      }
      return copy;
    });
  };

  ns.applyStorySpritesV2 = function applyStorySpritesV2(step) {
    if (!step) return false;
    if (step.clearStorySprites || step.hideStorySprites || step.spriteMode === "hide" || step.spriteMode === "clear" || step.spriteMode === "cg-clear") {
      ns.clearStorySpritesV2();
      if (!Array.isArray(step.storySprites) || !step.storySprites.length) return true;
    }
    let sprites = Array.isArray(step.storySprites) ? step.storySprites : [];
    if (ns.normalizeStorySpriteLayerOrder) sprites = ns.normalizeStorySpriteLayerOrder(sprites);
    if (!sprites.length || typeof ns.showStoryCharacters !== "function") return false;

    const key = JSON.stringify(sprites.map((s) => [s.id, s.src, s.side, s.left, s.right, s.top, s.bottom, s.width, s.height, s.maxHeight, s.transform, s.zIndex, s.opacity, s.frame, s.variant]));
    if (ns.storyCurrentSpriteKey === key) {
      if (ns.forceMobileStoryVisibility) ns.forceMobileStoryVisibility();
      return true;
    }

    ns.storyCurrentSpriteKey = key;
    console.log("[tenotsu storySprites]", sprites);
    ns.showStoryCharacters(sprites);
    if (ns.forceMobileStoryVisibility) ns.forceMobileStoryVisibility();
    return true;
  };

  ns.applyStoryCharacter = function applyStoryCharacter(step) {
    if (!step) return;
    if ((step.clearStorySprites || step.hideStorySprites || step.spriteMode === "hide" || step.spriteMode === "clear" || step.spriteMode === "cg-clear") && typeof ns.clearStorySpritesV2 === "function" && (!Array.isArray(step.storySprites) || !step.storySprites.length)) { ns.clearStorySpritesV2(); return; }
    if (ns.applyStorySpritesV2(step)) { if (ns.forceMobileStoryVisibility) ns.forceMobileStoryVisibility(); return; }
    const scenarioChars = Array.isArray(step.characters) ? step.characters : [];
    if (scenarioChars.length && typeof ns.showStoryCharacters === "function") {
      const key = JSON.stringify(scenarioChars.map((s) => [s.id, s.src, s.side, s.left, s.right, s.top, s.bottom, s.width, s.height, s.maxHeight, s.transform, s.zIndex, s.opacity, s.frame, s.variant]));
      if (ns.storyCurrentSpriteKey !== key) {
        ns.storyCurrentSpriteKey = key;
        ns.showStoryCharacters(scenarioChars);
      }
    }
  };

  ns.applyStoryBgFitV03998 = function applyStoryBgFitV03998(step) {
    if (!step || (!("bgFit" in step) && !("cgFit" in step) && !("bgAlign" in step) && !("cgAlign" in step) && !step.bg)) return;
    const contain = !!(step && (step.bgFit === "contain" || step.cgFit === "contain"));
    const align = (step && (step.bgAlign || step.cgAlign || step.bgPosition || step.cgPosition)) || "center";
    const isTop = align === "top" || align === "upper" || align === "center-top";
    document.body.classList.toggle("tenotsu-story-bg-contain", contain);
    document.body.classList.toggle("tenotsu-story-bg-contain-top", contain && isTop);
    const position = isTop ? "center top" : "center center";
    document.querySelectorAll(".tenotsu-bg-layer,.tenotsu-background-layer,[data-bg-layer],.background").forEach((el) => {
      if (contain) {
        el.style.setProperty("background-size", "contain", "important");
        el.style.setProperty("background-repeat", "no-repeat", "important");
        el.style.setProperty("background-position", position, "important");
        el.style.setProperty("background-color", "#000", "important");
      } else {
        el.style.removeProperty("background-size");
        el.style.removeProperty("background-repeat");
        el.style.removeProperty("background-position");
      }
    });
    document.querySelectorAll(".tenotsu-bg-layer img,.tenotsu-background-layer img,[data-bg-layer] img,.background img").forEach((img) => {
      img.style.setProperty("object-fit", contain ? "contain" : "cover", "important");
      img.style.setProperty("object-position", position, "important");
      img.style.setProperty("background", contain ? "#000" : "transparent", "important");
    });
  };

  ns.applyStoryStep = async function applyStoryStep(step, options = {}) {
    if (!step) return;
    if (ns.applyStoryBgFitV03998) ns.applyStoryBgFitV03998(step);
    if (step.hideEventCg && ns.hideEventCgSurface) ns.hideEventCgSurface();
    const forceBg = !!(step.forceBackgroundReplace || step.bgMode === "forceReplace");
    const bgChanged = !!(step.bg && (forceBg || step.bg !== ns.story.lastBg || step.bg !== ns.storyCurrentBackground));
    if (step.bg && bgChanged) {
      ns.setStoryLoading(true);
      try {
        const applyBg = async () => {
          if (typeof ns.setStoryBackgroundDirect === "function") await ns.setStoryBackgroundDirect(step.bg, { force: forceBg });
          else if (typeof ns.setStoryBackgroundReady === "function") await ns.setStoryBackgroundReady(step.bg);
          else if (typeof ns.setBackgroundReady === "function") await ns.setBackgroundReady(step.bg);
          else ns.setBackground(step.bg);
          ns.story.lastBg = step.bg;
          ns.storyCurrentBackground = step.bg;
        };
        if (bgChanged && !options.initial) await ns.fadeForStoryBgChange(applyBg);
        else await applyBg();
      } finally { ns.setStoryLoading(false); }
    }
    if (step.showEventCg && (step.eventCg || step.cg) && ns.showEventCgSurface) ns.showEventCgSurface(step.eventCg || step.cg, { fit: step.cgFit || step.bgFit, align: step.cgAlign || step.bgAlign || step.cgPosition || step.bgPosition });
    ns.applyStoryCharacter(step);
    ns.setText(step.speaker || "", step.text || "");
    if (ns.forceMobileStoryVisibility) ns.forceMobileStoryVisibility();
    ns.suppressStoryFadeLayer();
  };

  ns.nextStoryStep = async function nextStoryStep(options = {}) {
    ns.suppressStoryFadeLayer();
    if (!ns.story.active || !ns.story.data || ns.story.isEnding || ns.story.isLoadingStep) return;
    const steps = ns.story.data.steps || [];
    const nextIndex = ns.story.index + 1;
    if (nextIndex >= steps.length) { ns.beginStoryEnd(); return; }
    ns.story.index = nextIndex;
    await ns.applyStoryStep(steps[ns.story.index], options);
    ns.updateStoryUi();
    document.body.classList.remove("tenotsu-story-final-line");
    ns.suppressStoryFadeLayer();
  };

  ns.beginStoryEnd = function beginStoryEnd() {
    if (!ns.story.active || ns.story.isEnding || ns.story.isLoadingStep) return;
    ns.story.isEnding = true;
    const layer = ns.layers && ns.layers.story; if (layer) layer.classList.add("ending");
    ns.fadeToBlackThenReturn();
  };

  ns.fadeToBlackThenReturn = function fadeToBlackThenReturn() {
    const layers = ns.layers || ns.ensureLayers();
    layers.fade.style.display = "block"; layers.fade.style.pointerEvents = "auto"; layers.fade.style.transition = "opacity 900ms ease";
    requestAnimationFrame(() => { layers.fade.style.opacity = "1"; });
    setTimeout(() => {
      ns.endStory();
      layers.fade.style.transition = "opacity 650ms ease";
      requestAnimationFrame(() => { layers.fade.style.opacity = "0"; });
      setTimeout(() => {
        layers.fade.style.display = "none"; layers.fade.style.pointerEvents = "none"; layers.fade.style.transition = ""; layers.fade.style.opacity = "0";
        if (ns.layers && ns.layers.story) { ns.layers.story.classList.remove("ending"); ns.layers.story.style.removeProperty("pointer-events"); }
      }, 700);
    }, 950);
  };


  ns.applyStoryUnlockFlagsV03997 = function applyStoryUnlockFlagsV03997(storyData, ret) {
    try {
      const flags = Object.assign({}, (storyData && storyData.unlockFlags) || {});
      if (ret && ret.eventId === "biribiri_intro_rival_battle_unlock_003_flow_fix") {
        flags.unlock_vs_biribiri = true;
        flags.rival_intro_seen = true;
      }
      if (ret && ret.eventId === "event_black_kadenseijin_battle_unlock_003_ayame_line_fix") {
        flags.unlock_event_battle = true;
        flags.unlock_black_kadenseijin_event = true;
      }
      Object.keys(flags).forEach((key) => {
        localStorage.setItem("tenotsu_" + key + "_v1", flags[key] ? "1" : "0");
      });
    } catch (_) {}
  };

  ns.endStory = function endStory() {
    if (typeof ns.hideEventCgSurface === "function") ns.hideEventCgSurface();
    const ret = ns.story.returnInfo || {};
    const finishedStoryData = ns.story && ns.story.data ? ns.story.data : null;
    if (ret.eventId && typeof ns.markEventRead === "function") ns.markEventRead(ret.eventId);
    if (ret.storyId && typeof ns.markStoryCleared === "function") ns.markStoryCleared(ret.storyId);
    if (typeof ns.applyStoryUnlockFlagsV03997 === "function") ns.applyStoryUnlockFlagsV03997(finishedStoryData, ret);
    ns.story.active = false; ns.story.data = null; ns.story.index = -1; ns.story.returnInfo = null;
    ns.story.isEnding = false; ns.story.isLoadingStep = false; ns.story.lastBg = null;
    document.body.classList.remove("tenotsu-story-active","tenotsu-story-final-line","tenotsu-story-loading");
    if (typeof ns.hideStoryLayer === "function") ns.hideStoryLayer();
    if (typeof ns.hideStoryCharacters === "function") ns.hideStoryCharacters();
    if (ret.mode === "town" && typeof ns.enterTown === "function") {
      ns.enterTown({ noTransition:true });
      if (ret.season && typeof ns.renderSeasonEvents === "function") {
        ns.renderSeasonEvents(ret.season, { selectedEventId:ret.eventId });
        ns.setText("店長", "外営業（ストーリー）に戻りました。");
      }
      return;
    }
    if (ret.mode === "members" && typeof ns.enterMembers === "function") {
      ns.enterMembers({ noTransition:true, selectedMemberId: ret.memberId || (ns.state && ns.state.lastSelectedMemberId) || null });
      ns.setText("店長", "メンバー確認に戻りました。");
      return;
    }
    if (ret.mode === "storyMenu" && typeof ns.enterStoryMenu === "function") {
      ns.enterStoryMenu({ noTransition:true, tab: ret.storyMenuTab || "recollection" });
      ns.setText("ストーリー", "ストーリー一覧に戻りました。");
      return;
    }
    if (typeof ns.enterOffice === "function") ns.enterOffice({ speaker:"店長", message:"事務所に戻りました。" });
  };
})();
