
/* v038_27 no visual random API while surface takeover */
if (window.__TENOTSU_DISABLE_RANDOMSHOW_VISUALS__ || window.__TENOTSU_SURFACE_TAKEOVER__) {
  window.__TENOTSU_TITLE_RANDOM_SELECTED = [];
  window.__TENOTSU_TITLE_RANDOM_READY = Promise.resolve([]);
}

/* v038_27 randomShows takeover hard stop
   During surfaceManager takeover, randomShows must not create or preserve visual DOM.
*/
(function(){
  function active(){
    try {
      if (typeof window.tenotsuIsSurfaceTakeoverActive === "function") return !!window.tenotsuIsSurfaceTakeoverActive();
    } catch (_) {}
    return !!window.__TENOTSU_SURFACE_TAKEOVER__;
  }
  function kill(){
    if (!active()) return;
    window.__TENOTSU_TITLE_RANDOM_SELECTED = [];
    window.__TENOTSU_TITLE_RANDOM_READY = Promise.resolve([]);
    document.querySelectorAll(
      "#random-images-layer,#random-text-layer,.random-images-layer,.random-text-layer,.random-show,.random-character,.title-character-layer,.title-comment-window,.title-comment,.boot-character-layer"
    ).forEach(el => el.remove());
  }
  window.tenotsuRandomShowsHardKill = kill;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kill);
  else kill();
  window.addEventListener("load", kill);
  setTimeout(kill, 100);
  setTimeout(kill, 500);
  setTimeout(kill, 1500);
})();

/* v038_27 randomShows hard visual noop
   Visual random title/office characters are disabled during surface takeover.
*/
(function(){
  if (window.__TENOTSU_SURFACE_TAKEOVER__) {
    window.tenotsuRandomShowsDisabledBySurfaceTakeover = true;
    window.tenotsuRenderRandomShows = function(){ return false; };
    window.tenotsuStartRandomShows = function(){ return false; };
    window.tenotsuStopRandomShows = function(){ return true; };
    window.tenotsuPickRandomShow = window.tenotsuPickRandomShow || function(){ return null; };
    const kill = () => {
      document.querySelectorAll("#random-images-layer,#random-text-layer,.random-images-layer,.random-text-layer,.random-show,.random-character,.title-character-layer,.title-comment-window,.title-comment,.boot-character-layer").forEach(el => el.remove());
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kill);
    else kill();
    window.addEventListener("load", kill);
    return;
  }
})();
/* v038_27 surface takeover no visual output
   randomShows.js remains for compatibility/data only.
   Visual title/office random characters are rendered by surfaceManager.js.
*/
(function(){
  if (window.__TENOTSU_SURFACE_TAKEOVER__) {
    window.tenotsuRandomShowsDisabledBySurfaceTakeover = true;
    window.tenotsuRenderRandomShows = function(){ return false; };
    window.tenotsuStartRandomShows = function(){ return false; };
    window.tenotsuStopRandomShows = function(){ return true; };
    window.tenotsuPickRandomShow = window.tenotsuPickRandomShow || function(){ return null; };
    return;
  }
})();
let randomImagesLayer = null;
let randomImageElements = [];
let randomTextElements = [];
let randomTextLayer = null;

let randomImagesDataCache = null;
let randomTextsDataCache = null;
let imagePathsCache = null;
let preloadedImages = {}; // src => <img>（非表示で保持）
let randomImagesLoadPromise = null;

// v038_27: surfaceManager takeover compatibility.
// During office/shop operation, randomShows must not create separate character/comment surfaces.
// It only provides data; actual display is owned by surfaceManager (#tenotsu-front-character-layer + #dialogue-box).
function tenotsuIsSurfaceTakeoverActive() {
  return !!window.__TENOTSU_DISABLE_RANDOMSHOW_VISUALS__ || !!window.__TENOTSU_SURFACE_TAKEOVER__ || !!window.TENOTSU_SURFACE_VERSION;
}

function tenotsuHideRandomShowLayers() {
  document.querySelectorAll("#random-images-layer,#random-text-layer,.random-images-layer,.random-text-layer,.random-show,.random-character,.title-character-layer,.title-comment-window,.title-comment,.boot-character-layer").forEach(layer => {
    layer.innerHTML = "";
    layer.style.setProperty("display", "none", "important");
    layer.style.setProperty("visibility", "hidden", "important");
    layer.style.setProperty("pointer-events", "none", "important");
    layer.remove();
  });
  randomImagesLayer = null;
  randomTextLayer = null;
  randomImageElements = [];
  randomTextElements = [];
  window.__TENOTSU_TITLE_RANDOM_SELECTED = [];
  window.__TENOTSU_TITLE_RANDOM_READY = Promise.resolve([]);
}



const TENOTSU_TITLE_DEFAULT_CHARACTERS = [
  { id: "aa", name: "緋奈", src: "a10501.webp" },
  { id: "ab", name: "藍", src: "b10501.webp" },
  { id: "ac", name: "翠", src: "c10201.webp" },
  { id: "ad", name: "こがね", src: "d10501.webp" },
  { id: "ae", name: "琥珀", src: "e10501.webp" },
  { id: "af", name: "真花", src: "f10201.webp" },
  { id: "ag", name: "雪乃", src: "g10201.webp" },
  { id: "ah", name: "美空", src: "h10501.webp" },
  { id: "ai", name: "夜空", src: "i10201.webp" },
  { id: "aj", name: "桃", src: "j10501.webp" },
  { id: "ak", name: "彩愛", src: "k10201.webp" },
  { id: "al", name: "里美", src: "l10501.webp" },
  { id: "am", name: "萌", src: "m10501.webp" }
];

// ▼ レイヤー作成
function createRandomImagesLayer() {
  if (tenotsuIsSurfaceTakeoverActive()) {
    tenotsuHideRandomShowLayers();
    return;
  }
  randomImagesLayer = document.getElementById("random-images-layer") || randomImagesLayer;
  if (randomImagesLayer) return;
  randomImagesLayer = document.createElement("div");
  randomImagesLayer.id = "random-images-layer";
  Object.assign(randomImagesLayer.style, {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    zIndex: "4",
    pointerEvents: "none",
    overflow: "hidden"
  });
  const gameContainer = document.getElementById("game-container");
  (gameContainer || document.body).appendChild(randomImagesLayer);
}

function createRandomTextLayer() {
  if (tenotsuIsSurfaceTakeoverActive()) {
    tenotsuHideRandomShowLayers();
    return;
  }
  randomTextLayer = document.getElementById("random-text-layer") || randomTextLayer;
  if (randomTextLayer) return;
  randomTextLayer = document.createElement("div");
  randomTextLayer.id = "random-text-layer";
  Object.assign(randomTextLayer.style, {
    position: "absolute",
    bottom: "0",
    left: "0",
    width: "100%",
    zIndex: "6",
    pointerEvents: "none"
  });
  const gameContainer = document.getElementById("game-container");
  (gameContainer || document.body).appendChild(randomTextLayer);
}

// ▼ クリア
function clearRandomImages() {
  if (randomImagesLayer) {
    randomImageElements.forEach(img => {
      if (img.parentElement === randomImagesLayer) {
        randomImagesLayer.removeChild(img);
        img.style.position = "fixed";
        img.style.left = "-9999px";
        img.style.top = "-9999px";
        img.style.width = "auto";
        img.style.height = "auto";
        img.style.objectFit = "contain";
        document.body.appendChild(img);
      }
    });
  }
  randomImageElements = [];
  window.__TENOTSU_TITLE_RANDOM_SELECTED = [];
  window.__TENOTSU_TITLE_RANDOM_PRIMARY = null;
}

function clearRandomTexts() {
  if (randomTextLayer) randomTextLayer.innerHTML = "";
  randomTextElements = [];
}

// ▼ シャッフル
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function resolveRandomImagePath(base, name) {
  if (!name) return "";
  if (/^(https?:|data:|blob:|\/)/.test(name)) return name;
  if (name.startsWith("images/") || name.startsWith("program/") || name.startsWith("scenario/")) return name;
  return (base || "") + name;
}

function getRandomCharactersFromData(data) {
  return Array.isArray(data?.characters) && data.characters.length ? [...data.characters] : [...TENOTSU_TITLE_DEFAULT_CHARACTERS];
}

function loadRandomImagesData() {
  if (!window.config || !config.randomPath) return Promise.resolve({ characters: TENOTSU_TITLE_DEFAULT_CHARACTERS });
  if (randomImagesDataCache) return Promise.resolve(randomImagesDataCache);
  if (randomImagesLoadPromise) return randomImagesLoadPromise;
  randomImagesLoadPromise = fetch(`${config.randomPath}imageset01.json`)
    .then(res => res.json())
    .then(data => {
      randomImagesDataCache = data;
      return data;
    })
    .catch(err => {
      console.error("画像JSON読み込み失敗", err);
      randomImagesDataCache = { characters: TENOTSU_TITLE_DEFAULT_CHARACTERS };
      return randomImagesDataCache;
    });
  return randomImagesLoadPromise;
}

// ▼ タイトル立ち絵ランダム表示
function randomImagesOn() {
  if (tenotsuIsSurfaceTakeoverActive()) {
    tenotsuHideRandomShowLayers();
    return Promise.resolve([]);
  }
  if (!window.config || !config.randomPath) return Promise.resolve([]);
  const promise = loadRandomImagesData().then(data => buildRandomImages(data));
  window.__TENOTSU_TITLE_RANDOM_READY = promise;
  return promise;
}

function buildRandomImages(data) {
  // v038_27 buildRandomImages takeover guard
  if (tenotsuIsSurfaceTakeoverActive()) {
    tenotsuHideRandomShowLayers();
    return [];
  }
  createRandomImagesLayer();
  clearRandomImages();

  const chars = getRandomCharactersFromData(data);
  shuffleArray(chars);
  const count = Math.random() < 0.55 ? 2 : 3;
  const selected = chars.slice(0, count);
  const w = window.innerWidth;
  const h = window.innerHeight;
  const isPortrait = w <= 768 && h > w;

  const layouts = count === 2
    ? [
        { left: isPortrait ? 8 : 18, z: 2, scale: isPortrait ? 0.82 : 0.92 },
        { left: isPortrait ? 44 : 58, z: 1, scale: isPortrait ? 0.80 : 0.90 }
      ]
    : [
        { left: isPortrait ? -2 : 11, z: 1, scale: isPortrait ? 0.76 : 0.84 },
        { left: isPortrait ? 27 : 38, z: 3, scale: isPortrait ? 0.86 : 0.96 },
        { left: isPortrait ? 56 : 65, z: 2, scale: isPortrait ? 0.76 : 0.84 }
      ];

  const selectedWithLayout = selected.map((char, i) => ({ ...char, __layout: layouts[i], __order: i }));
  const primary = [...selectedWithLayout].sort((a, b) => (b.__layout?.z || 0) - (a.__layout?.z || 0))[0] || selectedWithLayout[0];
  window.__TENOTSU_TITLE_RANDOM_SELECTED = selectedWithLayout.map(({ __layout, ...rest }) => rest);
  window.__TENOTSU_TITLE_RANDOM_PRIMARY = primary ? { id: primary.id, name: primary.name, src: primary.src } : null;

  imagePathsCache = selectedWithLayout.map(c => resolveRandomImagePath(config.charPath || "images/assets/char/", c.src));
  selectedWithLayout.forEach((char, i) => {
    const src = imagePathsCache[i];
    if (!preloadedImages[src]) {
      const img = new Image();
      img.onerror = () => console.warn("[TENOTSU TITLE CHARACTER LOAD ERROR]", src);
      img.src = src;
      img.style.position = "fixed";
      img.style.left = "-9999px";
      img.style.top = "-9999px";
      document.body.appendChild(img);
      preloadedImages[src] = img;
    }
    const img = preloadedImages[src];
    if (img.parentElement !== randomImagesLayer) {
      if (img.parentElement) img.parentElement.removeChild(img);
      randomImagesLayer.appendChild(img);
    }
    const layout = char.__layout;
    Object.assign(img.style, {
      position: "absolute",
      left: `${layout.left}%`,
      bottom: isPortrait ? "9%" : "4%",
      width: isPortrait ? `${44 * layout.scale}vw` : `${24 * layout.scale}vw`,
      maxWidth: isPortrait ? "360px" : "430px",
      maxHeight: isPortrait ? "78vh" : "86vh",
      height: "auto",
      objectFit: "contain",
      pointerEvents: "none",
      display: "block",
      filter: "drop-shadow(0 14px 20px rgba(0,0,0,.35))",
      zIndex: String(layout.z),
      opacity: "0.98"
    });
    randomImageElements.push(img);
  });
  return window.__TENOTSU_TITLE_RANDOM_SELECTED;
}

// ▼ 位置だけ再計算・再設定（リサイズ時用）
function updateRandomImagesPosition() {
  if (tenotsuIsSurfaceTakeoverActive()) {
    tenotsuHideRandomShowLayers();
    return;
  }
  if (!randomImagesLayer || !randomImagesDataCache) return;
  buildRandomImages(randomImagesDataCache);
  if (randomTextLayer && randomTextElements.length) randomTextsOn();
}

function normalizeRandomTextData(data) {
  if (Array.isArray(data)) {
    const list = [];
    for (let i = 0; i + 1 < data.length; i += 2) list.push({ name: data[i], text: data[i + 1] });
    return list;
  }
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function loadRandomTextsData() {
  if (!window.config || !config.randomPath) return Promise.resolve({ items: [] });
  if (randomTextsDataCache) return Promise.resolve(randomTextsDataCache);
  return fetch(`${config.randomPath}textset01.json`)
    .then(res => res.json())
    .then(data => {
      randomTextsDataCache = data;
      return data;
    })
    .catch(err => {
      console.error("テキストJSON読み込み失敗", err);
      return { items: [] };
    });
}

function chooseLinkedTitleComment(list) {
  const selected = Array.isArray(window.__TENOTSU_TITLE_RANDOM_SELECTED) ? window.__TENOTSU_TITLE_RANDOM_SELECTED : [];
  const primary = window.__TENOTSU_TITLE_RANDOM_PRIMARY || selected[0] || null;
  const selectedNames = selected.map(c => c.name).filter(Boolean);
  const primaryCandidates = primary ? list.filter(item => item.name === primary.name) : [];
  if (primaryCandidates.length) return primaryCandidates[Math.floor(Math.random() * primaryCandidates.length)];
  const selectedCandidates = selectedNames.length ? list.filter(item => selectedNames.includes(item.name)) : [];
  if (selectedCandidates.length) return selectedCandidates[Math.floor(Math.random() * selectedCandidates.length)];
  return list[Math.floor(Math.random() * list.length)];
}

// ▼ タイトル下部コメント：タイトル立ち絵キャラ連動・テキストウィンドウ風
function randomTextsOn() {
  if (tenotsuIsSurfaceTakeoverActive()) {
    tenotsuHideRandomShowLayers();
    return [];
  }
  if (tenotsuIsSurfaceTakeoverActive()) {
    tenotsuHideRandomShowLayers();
    return Promise.resolve();
  }
  const ready = window.__TENOTSU_TITLE_RANDOM_READY || Promise.resolve(window.__TENOTSU_TITLE_RANDOM_SELECTED || []);
  return Promise.resolve(ready)
    .then(() => loadRandomTextsData())
    .then(data => {
      createRandomTextLayer();
      clearRandomTexts();

      const list = normalizeRandomTextData(data).filter(item => item && item.name && item.text);
      if (!list.length) return;
      const item = chooseLinkedTitleComment(list);
      const style = (window.TENOTSU_CHARACTER_STYLE_MAP && window.TENOTSU_CHARACTER_STYLE_MAP[item.name]) || (window.characterStyles && window.characterStyles[item.name]) || window.characterStyles?.[""] || {};
      const color = style.color || "#ffffff";
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isPortrait = w <= 768 && h > w;

      const box = document.createElement("div");
      box.className = "title-comment-window";
      Object.assign(box.style, {
        position: "absolute",
        left: isPortrait ? "4%" : "12%",
        width: isPortrait ? "92%" : "76%",
        bottom: `calc(env(safe-area-inset-bottom, 0px) + ${isPortrait ? "12px" : "20px"})`,
        background: "linear-gradient(180deg, rgba(18,22,35,.84), rgba(8,10,18,.90))",
        border: "1px solid rgba(255,255,255,.34)",
        borderRadius: "16px",
        boxShadow: "0 12px 36px rgba(0,0,0,.38)",
        boxSizing: "border-box",
        padding: isPortrait ? "10px 14px 12px" : "12px 20px 16px",
        backdropFilter: "blur(4px)",
        fontFamily: "inherit"
      });

      const name = document.createElement("div");
      name.textContent = item.name;
      Object.assign(name.style, {
        color,
        fontWeight: "800",
        fontSize: isPortrait ? "0.95rem" : "1.05rem",
        marginBottom: "4px",
        textShadow: "0 1px 3px rgba(0,0,0,.85)"
      });
      const text = document.createElement("div");
      text.textContent = item.text;
      Object.assign(text.style, {
        color: "#ffffff",
        fontWeight: "650",
        lineHeight: "1.55",
        fontSize: isPortrait ? "0.92rem" : "1.05rem",
        textShadow: "0 1px 3px rgba(0,0,0,.85)",
        letterSpacing: "0.02em"
      });
      box.appendChild(name);
      box.appendChild(text);
      randomTextLayer.appendChild(box);
      randomTextElements.push(box);
    });
}

function tenotsuRefreshTitleRandomShow() {
  // v038_27: surfaceManager takeover. Do not create separate title/office surfaces.
  if (tenotsuIsSurfaceTakeoverActive()) {
    tenotsuHideRandomShowLayers();
    if (typeof window.tenotsuSurfaceRefreshOffice === "function") {
      window.tenotsuSurfaceRefreshOffice();
    }
    return Promise.resolve([]);
  }
  try {
    clearRandomTexts();
    return randomImagesOn().then(() => randomTextsOn());
  } catch (err) {
    console.warn('[TENOTSU RANDOM REFRESH FAILED]', err);
    return Promise.resolve([]);
  }
}

// ▼ OFF系
function randomImagesOff() {
  clearRandomImages();
  randomImagesDataCache = null;
  randomImagesLoadPromise = null;
  imagePathsCache = null;
  Object.values(preloadedImages).forEach(img => {
    if (img.parentElement !== document.body) {
      if (img.parentElement) img.parentElement.removeChild(img);
      img.style.position = "fixed";
      img.style.left = "-9999px";
      img.style.top = "-9999px";
      document.body.appendChild(img);
    }
  });
}

function randomTextsOff() {
  clearRandomTexts();
}

window.addEventListener("resize", () => {
  updateRandomImagesPosition();
});

try {
  window.randomImagesOn = randomImagesOn;
  window.randomImagesOff = randomImagesOff;
  window.randomTextsOn = randomTextsOn;
  window.randomTextsOff = randomTextsOff;
  window.tenotsuRefreshTitleRandomShow = tenotsuRefreshTitleRandomShow;
  window.tenotsuHideRandomShowLayers = tenotsuHideRandomShowLayers;
} catch (_) {}

/* v038_27 preflight randomShows finalizer */
(function(){
  const kill = () => {
    if (typeof tenotsuIsSurfaceTakeoverActive === "function" && tenotsuIsSurfaceTakeoverActive()) {
      tenotsuHideRandomShowLayers();
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kill);
  else kill();
  window.addEventListener("load", kill);
  setTimeout(kill, 50);
  setTimeout(kill, 250);
  setTimeout(kill, 1000);
})();
