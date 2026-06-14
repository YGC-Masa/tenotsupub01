/* v039_220 story bg preload transition + loaded bg cache / input lock */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};

  function ensureBgLoadedCache() {
    if (!ns.__storyBgLoadedCache) ns.__storyBgLoadedCache = Object.create(null);
    return ns.__storyBgLoadedCache;
  }

  function isBgAlreadyLoaded(src) {
    if (!src) return false;
    const cache = ensureBgLoadedCache();
    return !!cache[src] || ns.storyCurrentBackground === src || (ns.story && ns.story.lastBg === src);
  }

  function markBgLoaded(src) {
    if (!src) return;
    ensureBgLoadedCache()[src] = true;
  }

  async function preloadAndDecode(src, timeout = 2600) {
    if (!src) return { ok:false, src:null, img:null };
    if (isBgAlreadyLoaded(src)) return { ok:true, src, img:null, cached:true };
    return await new Promise((resolve) => {
      const img = new Image();
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        resolve({ ok: !!ok, src, img });
      };
      const timer = setTimeout(() => finish(false), timeout);
      img.onload = () => {
        const afterDecode = () => { clearTimeout(timer); markBgLoaded(src); finish(true); };
        if (typeof img.decode === "function") img.decode().then(afterDecode).catch(afterDecode);
        else afterDecode();
      };
      img.onerror = () => { clearTimeout(timer); finish(false); };
      img.src = src;
    });
  }

  ns.prepareStoryBackgroundTransition = async function prepareStoryBackgroundTransition(src) {
    if (!src) return null;
    if (ns.__storyBgPrepared && ns.__storyBgPrepared.src === src) return ns.__storyBgPrepared;
    const prepared = await preloadAndDecode(src);
    ns.__storyBgPrepared = prepared;
    return prepared;
  };

  const originalApplyStoryStep = ns.applyStoryStep;
  const originalSetStoryBackgroundDirect = ns.setStoryBackgroundDirect;

  ns.setStoryBackgroundDirect = async function setStoryBackgroundDirectPatched(bgPath, options = {}) {
    if (!bgPath) return bgPath;
    let prepared = (ns.__storyBgPrepared && ns.__storyBgPrepared.src === bgPath) ? ns.__storyBgPrepared : null;
    if (!prepared) prepared = await ns.prepareStoryBackgroundTransition(bgPath);

    const layers = ns.layers || (typeof ns.ensureLayers === "function" ? ns.ensureLayers() : null);
    if (!layers || !layers.bg || !layers.bgImg || !prepared || !prepared.ok) {
      if (typeof originalSetStoryBackgroundDirect === "function") return originalSetStoryBackgroundDirect.call(ns, bgPath, options);
      if (typeof ns.setBackgroundReady === "function") return ns.setBackgroundReady(bgPath);
      if (typeof ns.setBackground === "function") return ns.setBackground(bgPath);
      return bgPath;
    }

    if (typeof ns.disableUnifiedStoryBackgroundLayer === "function") ns.disableUnifiedStoryBackgroundLayer();
    if (typeof ns.hideEventCgSurface === "function") ns.hideEventCgSurface();
    if (typeof ns.suppressStoryFadeLayer === "function") ns.suppressStoryFadeLayer();

    layers.bg.hidden = false;
    layers.bg.style.setProperty("display", "block", "important");
    layers.bg.style.setProperty("visibility", "visible", "important");
    layers.bg.style.setProperty("opacity", "1", "important");
    layers.bg.style.setProperty("z-index", "100", "important");
    layers.bg.style.setProperty("background-image", `url("${bgPath}")`, "important");
    layers.bg.style.setProperty("background-size", "cover", "important");
    layers.bg.style.setProperty("background-position", "center", "important");
    layers.bg.style.setProperty("background-repeat", "no-repeat", "important");

    layers.bgImg.onerror = null;
    layers.bgImg.removeAttribute("hidden");
    layers.bgImg.style.setProperty("display", "block", "important");
    layers.bgImg.style.setProperty("visibility", "visible", "important");
    layers.bgImg.style.setProperty("opacity", "1", "important");
    layers.bgImg.style.setProperty("width", "100%", "important");
    layers.bgImg.style.setProperty("height", "100%", "important");
    layers.bgImg.style.setProperty("object-fit", "cover", "important");
    layers.bgImg.src = bgPath;

    ns.storyCurrentBackground = bgPath;
    if (ns.story) ns.story.lastBg = bgPath;
    markBgLoaded(bgPath);
    ns.__storyBgPrepared = null;
    if (typeof ns.suppressStoryFadeLayer === "function") ns.suppressStoryFadeLayer();
    return bgPath;
  };

  function isStoryBackgroundChanging(step) {
    try {
      const forceBg = !!(step && (step.forceBackgroundReplace || step.bgMode === "forceReplace"));
      return !!(step && step.bg && (forceBg || step.bg !== (ns.story && ns.story.lastBg) || step.bg !== ns.storyCurrentBackground));
    } catch (_) {
      return false;
    }
  }

  ns.prepareCommonStoryBackgroundChange = async function prepareCommonStoryBackgroundChange(step, options = {}) {
    if (!isStoryBackgroundChanging(step)) return false;

    // Initial story reveal is already covered by the story start black fade.
    // For normal bg changes, lock input first, remove old sprites/text, then load the next bg.
    if (!options || !options.initial) {
      try { if (typeof ns.setStoryLoading === "function") ns.setStoryLoading(true); } catch (_) {}
      try { document.body.classList.add("tenotsu-story-bg-preparing"); } catch (_) {}
      try { if (typeof ns.clearStoryTextBoxForTransition === "function") ns.clearStoryTextBoxForTransition(); } catch (_) {}
      try { if (typeof ns.clearStorySpritesV2 === "function") ns.clearStorySpritesV2(); else if (typeof ns.hideStoryCharacters === "function") ns.hideStoryCharacters(); } catch (_) {}
      // Do not reset sprite keys here; sprite transition guard decides whether sprites actually changed.
    }

    await ns.prepareStoryBackgroundTransition(step.bg);
    return true;
  };

  if (typeof originalApplyStoryStep === "function") {
    ns.applyStoryStep = async function applyStoryStepPatched(step, options = {}) {
      const bgChanged = isStoryBackgroundChanging(step);
      try {
        if (bgChanged) await ns.prepareCommonStoryBackgroundChange(step, options);
        return await originalApplyStoryStep.call(ns, step, options);
      } finally {
        if (bgChanged && (!options || !options.initial)) {
          try { document.body.classList.remove("tenotsu-story-bg-preparing"); } catch (_) {}
          try { if (typeof ns.setStoryLoading === "function") ns.setStoryLoading(false); } catch (_) {}
        }
      }
    };
  }
})();
