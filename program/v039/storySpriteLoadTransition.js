/* v039_227 story sprite load/fade transition + per-sprite flicker guard */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};

  const FADE_OUT_MS = 180;
  const FADE_IN_MS = 180;
  const LOAD_TIMEOUT_MS = 2600;
  const NEEDS_FADE_IN = "tenotsuNeedsFadeIn";

  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
  function nextFrame() { return new Promise((resolve) => requestAnimationFrame(() => resolve())); }

  function ensureSpriteLoadedCache() {
    if (!ns.__storySpriteLoadedCache) ns.__storySpriteLoadedCache = Object.create(null);
    return ns.__storySpriteLoadedCache;
  }

  function normalizeSrc(src) {
    if (!src) return "";
    const raw = String(src);
    try {
      const u = new URL(raw, window.location.href);
      const path = u.pathname.replace(/^\/+/, "");
      return path || raw;
    } catch (_) {
      return raw;
    }
  }

  function markSpriteLoaded(src) {
    const key = normalizeSrc(src);
    if (!key || key.endsWith("/NULL")) return;
    const cache = ensureSpriteLoadedCache();
    cache[String(src)] = true;
    cache[key] = true;
  }

  function isSpriteAlreadyLoaded(src) {
    const key = normalizeSrc(src);
    if (!key || key.endsWith("/NULL")) return true;
    const cache = ensureSpriteLoadedCache();
    return !!cache[String(src)] || !!cache[key];
  }

  function preloadSprite(src, timeout = LOAD_TIMEOUT_MS) {
    if (!src || String(src).endsWith("/NULL")) return Promise.resolve({ ok:false, src:null });
    if (isSpriteAlreadyLoaded(src)) return Promise.resolve({ ok:true, src, cached:true });
    return new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        resolve({ ok: !!ok, src });
      };
      const timer = setTimeout(() => finish(false), timeout);
      img.onload = () => {
        const afterDecode = () => { clearTimeout(timer); markSpriteLoaded(src); finish(true); };
        if (typeof img.decode === "function") img.decode().then(afterDecode).catch(afterDecode);
        else afterDecode();
      };
      img.onerror = () => { clearTimeout(timer); finish(false); };
      img.src = src;
    });
  }

  function normalizeSpritesForKey(sprites) {
    let list = Array.isArray(sprites) ? sprites : [];
    if (typeof ns.normalizeStorySpriteLayerOrder === "function") list = ns.normalizeStorySpriteLayerOrder(list);
    if (typeof ns.normalizeStoryCharacterListV039100 === "function") list = ns.normalizeStoryCharacterListV039100(list);
    return Array.isArray(list) ? list.filter((s) => s && s.src && !String(s.src).endsWith("/NULL")) : [];
  }

  function getTargetSprites(step) {
    if (!step) return [];
    if (Array.isArray(step.storySprites)) return normalizeSpritesForKey(step.storySprites);
    if (Array.isArray(step.characters)) return normalizeSpritesForKey(step.characters);
    return [];
  }

  function stableKeyForSprite(sprite, index) {
    return String((sprite && sprite.id) || `slot-${index}`);
  }

  function spriteSignature(sprite, index) {
    if (!sprite) return "";
    return JSON.stringify([
      stableKeyForSprite(sprite, index),
      sprite.src || "",
      sprite.side || "",
      sprite.left || "",
      sprite.right || "",
      sprite.top || "",
      sprite.bottom || "",
      sprite.width || "",
      sprite.height || "",
      sprite.maxHeight || "",
      sprite.transform || "",
      sprite.opacity == null ? 1 : sprite.opacity,
      sprite.frame || "",
      sprite.variant || "",
      sprite.objectFit || "",
      sprite.objectPosition || ""
    ]);
  }

  function spriteKey(list) {
    return JSON.stringify((Array.isArray(list) ? list : []).map(spriteSignature));
  }

  function rememberSpriteKey(list) {
    const key = spriteKey(list || []);
    ns.__storySpriteLastKey = key;
    ns.storyCurrentSpriteKey = key;
    (list || []).forEach((s) => { if (s && s.src) markSpriteLoaded(s.src); });
    return key;
  }

  function getRememberedKey() {
    return ns.__storySpriteLastKey || ns.storyCurrentSpriteKey || "";
  }

  function getSpriteLayer() {
    return document.getElementById("tenotsu-story-body-sprite-layer")
      || (typeof ns.ensureStoryBodySpriteLayer === "function" ? ns.ensureStoryBodySpriteLayer() : null);
  }

  function currentSpriteImages() {
    const layer = getSpriteLayer();
    if (!layer) return [];
    const imgs = Array.from(layer.querySelectorAll(".tenotsu-story-body-standing, .tenotsu-story-standing, img"));
    imgs.forEach((img) => {
      const raw = img.getAttribute("src") || img.currentSrc || "";
      const dataSrc = img.getAttribute("data-src") || "";
      [raw, dataSrc].forEach((value) => { if (value) markSpriteLoaded(value); });
    });
    return imgs;
  }

  function resetSpriteKey() {
    ns.__storySpriteLastKey = "";
    ns.storyCurrentSpriteKey = "";
  }

  function currentByStableKey() {
    const map = new Map();
    currentSpriteImages().forEach((img) => {
      const key = img.dataset.tenotsuSpriteStableKey || img.dataset.characterId || img.dataset.slotIndex || "";
      if (key) map.set(key, img);
    });
    return map;
  }

  function targetMeta(targetList) {
    const list = Array.isArray(targetList) ? targetList : [];
    return list.map((sprite, index) => ({
      sprite,
      index,
      stableKey: stableKeyForSprite(sprite, index),
      signature: spriteSignature(sprite, index)
    }));
  }

  function findChangedSpriteElements(targetList) {
    const targets = targetMeta(targetList);
    const targetByKey = new Map(targets.map((item) => [item.stableKey, item]));
    const current = currentByStableKey();
    const changed = [];
    current.forEach((img, key) => {
      const target = targetByKey.get(key);
      if (!target || img.dataset.tenotsuSpriteSignature !== target.signature) changed.push(img);
    });
    return changed;
  }

  function sameAsCurrent(targetList) {
    const key = spriteKey(targetList || []);
    if (!key || key === "[]") return false;
    if (key === getRememberedKey()) return true;
    const current = currentByStableKey();
    const targets = targetMeta(targetList);
    if (!targets.length || current.size !== targets.length) return false;
    return targets.every((target) => {
      const img = current.get(target.stableKey);
      return img && img.dataset.tenotsuSpriteSignature === target.signature;
    });
  }

  function shouldHandleSpriteTransition(step, targetList) {
    if (!step) return false;
    const hasClear = !!(step.clearStorySprites || step.hideStorySprites || step.spriteMode === "hide" || step.spriteMode === "clear" || step.spriteMode === "cg-clear");
    const hasTargets = Array.isArray(targetList) && targetList.length > 0;
    if (!hasClear && !hasTargets) return false;
    if (hasTargets && sameAsCurrent(targetList)) return false;
    if (!hasTargets && hasClear) return currentSpriteImages().length > 0;
    return true;
  }

  async function preloadTargetSprites(targetList) {
    const current = currentByStableKey();
    const srcs = targetMeta(targetList).filter((target) => {
      const img = current.get(target.stableKey);
      return !img || img.dataset.tenotsuSpriteSignature !== target.signature;
    }).map((target) => target.sprite && target.sprite.src).filter(Boolean);
    const unique = Array.from(new Set(srcs)).filter((src) => !isSpriteAlreadyLoaded(src));
    if (!unique.length) return;
    await Promise.all(unique.map((src) => preloadSprite(src)));
  }

  async function fadeOutChangedSprites(targetList) {
    const imgs = findChangedSpriteElements(targetList);
    if (!imgs.length) return;
    imgs.forEach((img) => {
      img.style.setProperty("transition", `opacity ${FADE_OUT_MS}ms ease`, "important");
      img.style.setProperty("opacity", "0", "important");
      img.dataset.tenotsuFadingOut = "1";
    });
    await sleep(FADE_OUT_MS + 40);
  }

  async function fadeOutAllSprites() {
    const imgs = currentSpriteImages();
    if (!imgs.length) return;
    imgs.forEach((img) => {
      img.style.setProperty("transition", `opacity ${FADE_OUT_MS}ms ease`, "important");
      img.style.setProperty("opacity", "0", "important");
      img.dataset.tenotsuFadingOut = "1";
    });
    await sleep(FADE_OUT_MS + 40);
  }

  async function fadeInMarkedSprites() {
    const layer = getSpriteLayer();
    if (!layer) return;
    const imgs = Array.from(layer.querySelectorAll(`[data-${NEEDS_FADE_IN}="1"]`));
    if (!imgs.length) return;
    imgs.forEach((img) => {
      const finalOpacity = img.dataset.tenotsuFinalOpacity || "1";
      img.style.setProperty("transition", "none", "important");
      img.style.setProperty("opacity", "0", "important");
      img.style.setProperty("visibility", "visible", "important");
      img.style.setProperty("display", "block", "important");
      img.dataset.tenotsuFinalOpacity = finalOpacity;
    });
    await nextFrame();
    imgs.forEach((img) => {
      const finalOpacity = img.dataset.tenotsuFinalOpacity || "1";
      img.style.setProperty("transition", `opacity ${FADE_IN_MS}ms ease`, "important");
      img.style.setProperty("opacity", finalOpacity, "important");
    });
    await sleep(FADE_IN_MS + 40);
    imgs.forEach((img) => {
      img.style.removeProperty("transition");
      delete img.dataset[NEEDS_FADE_IN];
      delete img.dataset.tenotsuFinalOpacity;
    });
  }

  function lockStoryInput() {
    try { if (typeof ns.setStoryLoading === "function") ns.setStoryLoading(true); } catch (_) {}
    try { document.body.classList.add("tenotsu-story-sprite-transitioning"); } catch (_) {}
  }

  function unlockStoryInput() {
    try { document.body.classList.remove("tenotsu-story-sprite-transitioning"); } catch (_) {}
    try { if (typeof ns.setStoryLoading === "function") ns.setStoryLoading(false); } catch (_) {}
  }

  function applySpriteStyles(img, ch, index, listLength, side, left) {
    const id = String(ch.id || "");
    const src = ch.src || "";
    const opacity = ch.opacity === undefined ? 1 : ch.opacity;
    const isEnemyCard = !!(ch.frame === "enemy" || ch.variant === "storyEnemyCard" || id.indexOf("enemy") === 0 || id === "kd" || id === "bk" || String(src).indexOf("/enemy/") >= 0 || String(src).indexOf("/event/dirty_alien") >= 0);
    const isRivalStoryStand = !!(id === "ba" || id === "bb" || id === "bc" || String(src).indexOf("/rival/story_") >= 0);
    img.className = [
      "tenotsu-story-body-standing",
      `side-${side}`,
      "bottom-align",
      "tenotsu-story-logical-sprite",
      isEnemyCard ? "tenotsu-story-enemy-card" : "",
      isRivalStoryStand ? "tenotsu-story-rival-knee-shot" : ""
    ].filter(Boolean).join(" ");
    img.alt = "";
    img.dataset.characterId = id;
    img.dataset.slotIndex = String(index);
    img.dataset.slotCount = String(listLength);
    img.dataset.logicalLeft = left;
    img.dataset.tenotsuSpriteStableKey = stableKeyForSprite(ch, index);
    img.dataset.tenotsuSpriteSignature = spriteSignature(ch, index);
    img.dataset.tenotsuFinalOpacity = String(opacity);
    img.style.setProperty("position", "absolute", "important");
    img.style.setProperty("left", left, "important");
    img.style.setProperty("right", "auto", "important");
    img.style.setProperty("top", ch.top || "auto", "important");
    img.style.setProperty("bottom", ch.bottom || "0px", "important");
    img.style.setProperty("transform", ch.transform || "translateX(-50%) translateZ(0)", "important");
    img.style.setProperty("display", "block", "important");
    img.style.setProperty("visibility", "visible", "important");
    img.style.setProperty("width", ch.width || "auto", "important");
    img.style.setProperty("height", ch.height || "auto", "important");
    img.style.setProperty("max-height", ch.maxHeight || "min(88dvh, 900px)", "important");
    img.style.setProperty("object-fit", ch.objectFit || "contain", "important");
    img.style.setProperty("object-position", ch.objectPosition || "center bottom", "important");
    if (ch.zIndex !== undefined) img.style.setProperty("z-index", String(ch.zIndex), "important");
  }

  function renderCharactersDiff(characters) {
    const list = normalizeSpritesForKey(characters);
    const layer = getSpriteLayer();
    if (!layer) return;
    layer.classList.add("story-character-slot-v111");
    layer.dataset.spriteCount = String(list.length);
    if (!list.length) {
      layer.innerHTML = "";
      resetSpriteKey();
      return;
    }

    const current = currentByStableKey();
    const usedKeys = new Set();
    const metas = targetMeta(list);
    metas.forEach((meta) => {
      const ch = meta.sprite;
      const key = meta.stableKey;
      const side = ch.side || (ch.left ? "custom" : "center");
      const left = ch.left || "50%";
      let img = current.get(key);
      const same = img && img.dataset.tenotsuSpriteSignature === meta.signature;
      if (!img) {
        img = document.createElement("img");
        img.style.setProperty("opacity", "0", "important");
        img.dataset[NEEDS_FADE_IN] = "1";
        layer.appendChild(img);
      } else if (!same) {
        img.dataset[NEEDS_FADE_IN] = "1";
        img.style.setProperty("opacity", "0", "important");
      }
      if (!same || img.getAttribute("src") !== ch.src) img.src = ch.src;
      markSpriteLoaded(ch.src);
      applySpriteStyles(img, ch, meta.index, list.length, side, left);
      if (same) {
        img.style.removeProperty("transition");
        img.style.setProperty("opacity", String(ch.opacity === undefined ? 1 : ch.opacity), "important");
        delete img.dataset[NEEDS_FADE_IN];
      }
      usedKeys.add(key);
    });

    current.forEach((img, key) => {
      if (!usedKeys.has(key)) img.remove();
    });
    rememberSpriteKey(list);
  }

  const originalClearStorySpritesV2 = ns.clearStorySpritesV2;
  if (typeof originalClearStorySpritesV2 === "function") {
    ns.clearStorySpritesV2 = function clearStorySpritesV2FlickerGuardPatched() {
      resetSpriteKey();
      return originalClearStorySpritesV2.apply(this, arguments);
    };
  }

  const originalHideStoryCharacters = ns.hideStoryCharacters;
  if (typeof originalHideStoryCharacters === "function") {
    ns.hideStoryCharacters = function hideStoryCharactersFlickerGuardPatched() {
      resetSpriteKey();
      return originalHideStoryCharacters.apply(this, arguments);
    };
  }

  ns.showStoryCharacters = function showStoryCharactersPerSpriteTransitionPatched(characters) {
    renderCharactersDiff(characters);
  };

  const originalApplyStoryStep = ns.applyStoryStep;
  if (typeof originalApplyStoryStep === "function") {
    ns.applyStoryStep = async function applyStoryStepSpriteTransitionPatched(step, options = {}) {
      const targetList = getTargetSprites(step);
      const needsSpriteTransition = shouldHandleSpriteTransition(step, targetList);
      if (!needsSpriteTransition || options.initial) {
        const result = await originalApplyStoryStep.call(ns, step, options);
        if (targetList.length > 0) rememberSpriteKey(targetList);
        return result;
      }

      lockStoryInput();
      try {
        await preloadTargetSprites(targetList);
        if (targetList.length > 0) await fadeOutChangedSprites(targetList);
        else await fadeOutAllSprites();
        const result = await originalApplyStoryStep.call(ns, step, options);
        lockStoryInput();
        if (targetList.length > 0) await fadeInMarkedSprites();
        if (targetList.length > 0) rememberSpriteKey(targetList);
        return result;
      } finally {
        unlockStoryInput();
      }
    };
  }
})();
