/* v039_136 story layout: generic logical split + fixed n+1 auto slots + knee-shot bottom aligned sprites + event CG above characters */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};

  const MAX_AUTO_SPRITES = 5;

  function isValidSprite(ch) {
    return !!(ch && ch.src && !String(ch.src).endsWith("/NULL"));
  }

  function hasLockedPosition(ch) {
    return !!(ch && (ch.lockPosition || ch.positionLocked || ch.fixedPosition || ch.keepPosition));
  }

  function hasExplicitHorizontal(ch) {
    return !!(ch && (ch.left || ch.right));
  }

  function logicalLeft(index, count) {
    const n = Math.max(1, count || 1);
    return (((index + 1) * 100) / (n + 1)).toFixed(3).replace(/\.000$/, "") + "%";
  }

  function logicalSide(index, count) {
    if (count <= 1) return "center";
    if (count === 2) return index === 0 ? "left" : "right";
    if (index === 0) return "left";
    if (index === count - 1) return "right";
    return "center";
  }

  ns.getLogicalStorySpriteLeft = logicalLeft;

  ns.normalizeStoryCharacterListV039100 = function normalizeStoryCharacterListV039100(characters) {
    const raw = Array.isArray(characters) ? characters.filter(isValidSprite) : [];
    const byId = new Map();
    raw.forEach((ch, index) => {
      const key = String(ch.id || ch.src || index);
      byId.set(key, Object.assign({}, ch));
    });
    let list = Array.from(byId.values());
    if (list.length > MAX_AUTO_SPRITES) list = list.slice(list.length - MAX_AUTO_SPRITES);
    const n = Math.max(1, list.length);
    return list.map((ch, index) => {
      const copy = Object.assign({}, ch);
      const locked = hasLockedPosition(copy);
      const explicitHorizontal = hasExplicitHorizontal(copy);
      const autoLeft = logicalLeft(index, n);
      const autoSide = logicalSide(index, n);

      // When multiple sprites are shown, old scenario-side center/left/right hints
      // should not collapse everyone into the same slot.  Only explicit horizontal
      // coordinates or lockPosition keep manual placement.
      if (!locked && !explicitHorizontal) {
        copy.left = autoLeft;
        copy.side = autoSide;
      } else {
        if (!copy.left && !copy.right) copy.left = autoLeft;
        if (!copy.side) copy.side = autoSide;
      }

      copy.autoSlotIndex = index;
      copy.autoSlotCount = n;
      copy.autoLogicalLeft = autoLeft;
      return copy;
    });
  };

  ns.ensureStoryBodySpriteLayer = ns.ensureStoryBodySpriteLayer || function ensureStoryBodySpriteLayer() {
    const layers = typeof ns.ensureLayers === "function" ? ns.ensureLayers() : (ns.layers || {});
    const app = layers.app || document.getElementById("tenotsu-app") || document.body;
    let layer = document.getElementById("tenotsu-story-body-sprite-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "tenotsu-story-body-sprite-layer";
      layer.className = "tenotsu-story-body-sprite-layer story-character-slot-v111";
    }
    if (layer.parentNode !== app) app.insertBefore(layer, (layers.text || null));
    layer.hidden = false;
    layer.removeAttribute("hidden");
    layer.style.setProperty("display", "block", "important");
    layer.style.setProperty("visibility", "visible", "important");
    layer.style.setProperty("opacity", "1", "important");
    layer.style.setProperty("position", "fixed", "important");
    layer.style.setProperty("inset", "0", "important");
    layer.style.setProperty("z-index", "200", "important");
    layer.style.setProperty("pointer-events", "none", "important");
    layer.style.setProperty("overflow", "hidden", "important");
    return layer;
  };

  ns.showStoryCharacters = function showStoryCharacters(characters) {
    const list = ns.normalizeStoryCharacterListV039100 ? ns.normalizeStoryCharacterListV039100(characters) : (Array.isArray(characters) ? characters.filter(isValidSprite) : []);
    const layer = ns.ensureStoryBodySpriteLayer();
    layer.innerHTML = "";
    layer.classList.add("story-character-slot-v111");
    layer.dataset.spriteCount = String(list.length);
    if (!list.length) return;

    list.forEach((ch, index) => {
      const id = String(ch.id || "");
      const src = ch.src || "";
      const side = ch.side || logicalSide(index, list.length);
      const left = ch.left || logicalLeft(index, list.length);
      const opacity = ch.opacity === undefined ? 1 : ch.opacity;
      const isEnemyCard = !!(ch.frame === "enemy" || ch.variant === "storyEnemyCard" || id.indexOf("enemy") === 0 || id === "kd" || id === "bk" || String(src).indexOf("/enemy/") >= 0 || String(src).indexOf("/event/dirty_alien") >= 0);
      const isRivalStoryStand = !!(id === "ba" || id === "bb" || id === "bc" || String(src).indexOf("/rival/story_") >= 0);
      const img = document.createElement("img");
      img.className = [
        "tenotsu-story-body-standing",
        `side-${side}`,
        "bottom-align",
        "tenotsu-story-logical-sprite",
        isEnemyCard ? "tenotsu-story-enemy-card" : "",
        isRivalStoryStand ? "tenotsu-story-rival-knee-shot" : ""
      ].filter(Boolean).join(" ");
      img.src = src;
      img.alt = "";
      img.dataset.characterId = id;
      img.dataset.slotIndex = String(index);
      img.dataset.slotCount = String(list.length);
      img.dataset.logicalLeft = left;
      img.style.setProperty("position", "absolute", "important");
      img.style.setProperty("left", left, "important");
      img.style.setProperty("right", "auto", "important");
      img.style.setProperty("top", ch.top || "auto", "important");
      img.style.setProperty("bottom", ch.bottom || "0px", "important");
      img.style.setProperty("transform", ch.transform || "translateX(-50%) translateZ(0)", "important");
      img.style.setProperty("opacity", String(opacity), "important");
      img.style.setProperty("display", "block", "important");
      img.style.setProperty("visibility", "visible", "important");
      img.style.setProperty("width", ch.width || "auto", "important");
      img.style.setProperty("height", ch.height || "auto", "important");
      img.style.setProperty("max-height", ch.maxHeight || "min(88dvh, 900px)", "important");
      img.style.setProperty("object-fit", ch.objectFit || "contain", "important");
      img.style.setProperty("object-position", ch.objectPosition || "center bottom", "important");
      if (ch.zIndex !== undefined) img.style.setProperty("z-index", String(ch.zIndex), "important");
      layer.appendChild(img);
    });
  };

  ns.ensureEventCgSurface = function ensureEventCgSurface() {
    const layers = ns.layers || (typeof ns.ensureLayers === "function" ? ns.ensureLayers() : {});
    const app = (layers && layers.app) || document.getElementById("tenotsu-app") || document.body;
    let surface = document.getElementById("tenotsu-event-cg-surface");
    if (!surface) {
      surface = document.createElement("div");
      surface.id = "tenotsu-event-cg-surface";
      surface.className = "tenotsu-event-cg-layer";
      const img = document.createElement("img");
      img.className = "tenotsu-event-cg-image";
      img.alt = "";
      surface.appendChild(img);
      app.appendChild(surface);
    }
    surface.style.setProperty("position", "fixed", "important");
    surface.style.setProperty("inset", "0", "important");
    surface.style.setProperty("z-index", "260", "important");
    surface.style.setProperty("pointer-events", "none", "important");
    surface.style.setProperty("display", "block", "important");
    surface.style.setProperty("visibility", "visible", "important");
    surface.style.setProperty("opacity", "1", "important");
    return surface;
  };

  ns.showEventCgSurface = function showEventCgSurface(src, options = {}) {
    if (!src) return;
    const surface = ns.ensureEventCgSurface();
    const img = surface.querySelector("img") || document.createElement("img");
    if (!img.parentNode) surface.appendChild(img);
    img.className = "tenotsu-event-cg-image";
    img.src = src;
    img.alt = "";
    img.style.setProperty("width", "100%", "important");
    img.style.setProperty("height", "100%", "important");
    img.style.setProperty("object-fit", options.fit || "cover", "important");
    img.style.setProperty("object-position", options.align || options.position || "center center", "important");
    img.style.setProperty("display", "block", "important");
    img.style.setProperty("visibility", "visible", "important");
    img.style.setProperty("opacity", "1", "important");
    surface.hidden = false;
    surface.removeAttribute("hidden");
    document.body.classList.add("tenotsu-event-cg-active");
  };

  ns.hideEventCgSurface = function hideEventCgSurface() {
    document.body.classList.remove("tenotsu-event-cg-active");
    const surface = document.getElementById("tenotsu-event-cg-surface");
    if (surface) {
      surface.hidden = true;
      surface.style.setProperty("display", "none", "important");
      surface.style.setProperty("visibility", "hidden", "important");
      surface.style.setProperty("opacity", "0", "important");
      const img = surface.querySelector("img");
      if (img) img.removeAttribute("src");
    }
  };
})();
