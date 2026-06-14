/* v038_27 Surface Manager - Single Authority
   Purpose:
   - office/shop visual surfaces are owned by this file only.
   - old randomShows/title/office comment layers are removed or hidden.
   - background is set through both #background and #game-container fallback.
   - #dialogue-box is the only visible text surface outside ADV.
*/
(function(){
  "use strict";

  const VERSION = "v038_27";
  const BG_OFFICE = "images/assets/bgev/bg_office_hidamari.png";
  const BG_SHOP = "images/assets/bgev/bg_exchange_item_counter.png";
  const SAKUYA_INTRO_SCENARIO = "shop_exchange_intro_sakuya.json";
  const SAKUYA_INTRO_KEY = "tenotsu_sakuya_exchange_intro_seen_v1";

  const OFFICE_CHARS = [
    ["星野 緋奈","a10501.webp","店長、今日も一緒にがんばりましょう！"],
    ["速水川 藍","b10501.webp","てんちょー、事務所でお待ちしていました。"],
    ["草壁 翠","c10501.webp","キミ、今日の予定は確認済みかな？"],
    ["小麦沢 こがね","d10501.webp","店長、今日もアゲてこー！"],
    ["春日原 琥珀","e10501.webp","旦那、困ったことがあったらオレに任せな！"],
    ["大道寺 真花","f10501.webp","店長、本日もよろしくお願いします。"],
    ["氷神 雪乃","g10501.webp","貴方様、無理はなさらないでくださいね。"],
    ["双沢 美空","h10501.webp","店長、今日も笑顔でいきましょう。"],
    ["双沢 夜空","i10501.webp","あんた、今日もちゃんと見てるから。"],
    ["芝桜 桃","j10501.webp","店長、ウチ参上！"],
    ["紫藤 彩愛","k10501.webp","貴方、こちらで確認くださいませ。"],
    ["餅月 里美","l10501.webp","てんちょ～、お茶でも飲んでいきます～？"],
    ["草壁 萌","m10501.webp","おにいちゃん、ここにいるよ。"]
  ];

  const MENU_ITEMS = ["店舗","メンバー","店舗営業","外回り","ショップ","設定"];

  const Z = Object.freeze({
    bg: 0,
    storyChar: 120,
    cg: 180,
    click: 240,
    frontChar: 720,
    operation: 760,
    menu: 820,
    hold: 860,
    dialogue: 2200,
    choice: 1300,
    battle: 30000,
    fade: 50000,
    system: 70000,
    boot: 200000
  });

  window.TENOTSU_SURFACE_VERSION = VERSION;
  window.TENOTSU_LAYER_Z = Z;
  window.__TENOTSU_SURFACE_TAKEOVER__ = true;
  window.__TENOTSU_DISABLE_RANDOMSHOW_VISUALS__ = true;
  window.__TENOTSU_DISABLE_LEGACY_OBSERVERS__ = true;

  let currentMode = "";
  let busy = false;
  let installed = false;
  let lastActionAt = 0;
  let bootOfficeEntered = false;
  let officeRenderKey = "";
  let officeGuardTimer = 0;

  function qs(sel){ return document.querySelector(sel); }
  function qsa(sel){ return Array.from(document.querySelectorAll(sel)); }
  function setI(el, prop, val){ if (el) el.style.setProperty(prop, String(val), "important"); }
  function now(){ return (performance && performance.now) ? performance.now() : Date.now(); }
  function throttle(){
    const n = now();
    if (n - lastActionAt < 120) return true;
    lastActionAt = n;
    return false;
  }
  function shuffle(a){
    const arr = a.slice();
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function setMode(mode){
    document.body.classList.add("tenotsu-surface-authority");
    currentMode = mode;
    window.tenotsuGameMode = mode;
    document.body.dataset.gameMode = mode;
    ["title","office","story","shop","battle","town","settings","members"].forEach(m => {
      document.body.classList.toggle("mode-" + m, mode === m);
    });
    document.body.classList.toggle("story-playing", mode === "story");
    updateInputSurfaces();
  }

  function hideBootOverlay(){
    const boot = qs("#boot-flow");
    if (boot) {
      boot.classList.add("hidden", "is-out");
      boot.setAttribute("aria-hidden", "true");
      setI(boot, "display", "none");
      setI(boot, "pointer-events", "none");
    }
  }

  function removeLegacyVisualSurfaces(){
    const removeSelectors = [
      "#random-images-layer",
      "#random-text-layer",
      ".random-images-layer",
      ".random-text-layer",
      ".random-show",
      ".random-character",
      ".title-character-layer",
      ".title-comment-window",
      ".title-comment",
      ".boot-character-layer",
      "#tenotsu-surface-office-layer",
      "#tenotsu-shop-character-layer",
      "#tenotsu-office-force-layer",
      "#office-character-layer",
      "#tenotsu-office-character-overlay"
    ];
    qsa(removeSelectors.join(",")).forEach(el => {
      if (el.id === "tenotsu-front-character-layer") return;
      el.remove();
    });

    const hideSelectors = [
      "#list-panel",
      "#menu-panel",
      ".menu-panel",
      ".left-menu",
      "#left-menu",
      "#leftPanel",
      ".exchange-menu",
      ".exchange-panel",
      ".shop-submenu",
      ".sub-menu",
      "#office-comment-box",
      "#title-comment-box",
      "#office-message",
      "#office-comment",
      ".office-comment-box",
      ".title-comment-box",
      ".office-message",
      ".office-comment",
      ".top-comment",
      ".header-comment",
      ".tenotsu-office-comment",
      "#tenotsu-office-comment",
      "#tenotsu-office-force-comment",
      "#tenotsu-surface-comment",
      ".tenotsu-bottom-comment",
      "#tenotsu-bottom-comment"
    ];
    qsa(hideSelectors.join(",")).forEach(el => {
      el.classList.add("hidden");
      setI(el, "display", "none");
      setI(el, "visibility", "hidden");
      setI(el, "pointer-events", "none");
      el.setAttribute("aria-hidden", "true");
    });
  }

  function ensureLegacyGuard(){
    // Keep placeholder in DOM for legacy checks, but do not allow visual area.
    let list = qs("#list-panel");
    if (!list) {
      list = document.createElement("div");
      list.id = "list-panel";
      document.body.appendChild(list);
    }
    list.textContent = "";
    list.dataset.tenotsuRescue = "1";
    setI(list, "display", "none");
    setI(list, "visibility", "hidden");
    setI(list, "pointer-events", "none");
  }

  function hardHideLegacyMenus(){
    qsa("#list-panel,#menu-panel,.menu-panel,.list-panel,.left-menu,#left-menu,#leftPanel,.right-menu,#right-menu,.legacy-menu,.showlist-menu,[data-legacy-menu='true'],[data-tenotsu-legacy-menu='true']").forEach(el => {
      if (el.id === "tenotsu-main-menu" || el.id === "tenotsu-shop-menu") return;
      el.classList.add("hidden");
      el.setAttribute("aria-hidden", "true");
      el.dataset.tenotsuLegacyMenu = "true";
      el.textContent = el.id === "list-panel" ? "" : el.textContent;
      setI(el, "display", "none");
      setI(el, "visibility", "hidden");
      setI(el, "opacity", "0");
      setI(el, "pointer-events", "none");
      setI(el, "z-index", "-1");
      setI(el, "width", "0");
      setI(el, "height", "0");
      setI(el, "overflow", "hidden");
    });
  }

  function startLegacyMenuObserver(){
    if (window.__TENOTSU_LEGACY_MENU_OBSERVER__) return;
    if (!window.MutationObserver || !document.body) return;
    const obs = new MutationObserver((mutations) => {
      let touched = false;
      for (const m of mutations) {
        if (m.type === "childList" && (m.addedNodes && m.addedNodes.length)) touched = true;
        if (m.type === "attributes") {
          const el = m.target;
          if (el && el.matches && el.matches("#list-panel,#menu-panel,.menu-panel,.list-panel,.left-menu,#left-menu,#leftPanel,.right-menu,#right-menu,.legacy-menu,.showlist-menu")) touched = true;
        }
        if (touched) break;
      }
      if (touched) hardHideLegacyMenus();
    });
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class"]
    });
    window.__TENOTSU_LEGACY_MENU_OBSERVER__ = obs;
  }

  function purgeBackOfficeSlots(){
    // v038_27:
    // The only office-mode character display allowed is #tenotsu-front-character-layer.
    // Legacy #char-layer / random / office slots may be scheduled by old wait/random/showlist flow.
    if (currentMode !== "office" && currentMode !== "shop" && currentMode !== "members" && currentMode !== "settings") return;

    qsa("#random-images-layer,#random-text-layer,.random-images-layer,.random-text-layer,.random-show,.random-character,.title-character-layer,.title-comment-window,.title-comment,.boot-character-layer,#tenotsu-surface-office-layer,#tenotsu-office-force-layer,#office-character-layer,#tenotsu-office-character-overlay").forEach(el => {
      if (el.id !== "tenotsu-front-character-layer") el.remove();
    });

    // Hide ADV char slots outside story. This prevents the "back slot" from appearing behind office members.
    if (currentMode !== "story") {
      const charLayer = qs("#char-layer");
      if (charLayer) {
        charLayer.querySelectorAll("img,.char-image").forEach(img => {
          img.removeAttribute("src");
          img.style.setProperty("display", "none", "important");
          img.style.setProperty("visibility", "hidden", "important");
          img.style.setProperty("opacity", "0", "important");
        });
        charLayer.querySelectorAll(".char-slot").forEach(slot => {
          slot.classList.remove("active");
          slot.style.setProperty("display", "none", "important");
          slot.style.setProperty("visibility", "hidden", "important");
          slot.style.setProperty("pointer-events", "none", "important");
        });
        charLayer.style.setProperty("display", "none", "important");
        charLayer.style.setProperty("visibility", "hidden", "important");
        charLayer.style.setProperty("pointer-events", "none", "important");
      }
    }
  }

  function startOfficeSlotGuard(){
    stopOfficeSlotGuard();
    // Short-lived guard catches delayed wait/random/showlist callbacks after office boot.
    let ticks = 0;
    officeGuardTimer = window.setInterval(() => {
      ticks += 1;
      purgeBackOfficeSlots();
      removeLegacyVisualSurfaces();
      if (ticks >= 24 || !["office","shop","members","settings"].includes(currentMode)) {
        stopOfficeSlotGuard();
      }
    }, 250);
  }

  function stopOfficeSlotGuard(){
    if (officeGuardTimer) {
      clearInterval(officeGuardTimer);
      officeGuardTimer = 0;
    }
  }

  function ensureBackgroundElement(){
    let bg = qs("#background");
    if (!bg) {
      const game = qs("#game-container") || document.body;
      bg = document.createElement("img");
      bg.id = "background";
      bg.alt = "";
      game.prepend(bg);
    }
    return bg;
  }

  function setBackground(src){
    const bg = ensureBackgroundElement();
    if (bg.getAttribute("src") !== src) bg.src = src;
    bg.dataset.surfaceBg = src;
    setI(bg, "position", "absolute");
    setI(bg, "inset", "0");
    setI(bg, "display", "block");
    setI(bg, "visibility", "visible");
    setI(bg, "opacity", "1");
    setI(bg, "z-index", Z.bg);
    setI(bg, "object-fit", "cover");
    setI(bg, "width", "100%");
    setI(bg, "height", "100%");
    setI(bg, "pointer-events", "none");

    const game = qs("#game-container");
    if (game) {
      setI(game, "background-color", "#000");
      setI(game, "background-image", "url('" + src + "')");
      setI(game, "background-size", "cover");
      setI(game, "background-position", "center center");
      setI(game, "background-repeat", "no-repeat");
    }
    document.body.style.removeProperty("background-image");
  }

  function ensureFrontLayer(){
    let layer = qs("#tenotsu-front-character-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "tenotsu-front-character-layer";
      document.body.appendChild(layer);
    }
    return layer;
  }

  function hideFrontLayer(){
    const layer = qs("#tenotsu-front-character-layer");
    if (layer) {
      layer.innerHTML = "";
      layer.dataset.mode = "";
      setI(layer, "display", "none");
    }
  }

  function ensureOperationSurface(){
    let surface = qs("#tenotsu-operation-surface");
    if (!surface) {
      surface = document.createElement("div");
      surface.id = "tenotsu-operation-surface";
      document.body.appendChild(surface);
    }
    return surface;
  }

  function clearOperationSurface(){
    const s = qs("#tenotsu-operation-surface");
    if (s) {
      s.innerHTML = "";
      setI(s, "display", "none");
      setI(s, "pointer-events", "none");
    }
  }

  function ensureMainMenu(){
    let menu = qs("#tenotsu-main-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.id = "tenotsu-main-menu";
      document.body.appendChild(menu);
    }
    return menu;
  }

  function showMainMenu(){
    const menu = ensureMainMenu();
    if (menu.dataset.built !== "1") {
      menu.innerHTML = "";
      const title = document.createElement("div");
      title.className = "tenotsu-main-menu-title";
      title.textContent = "メインメニュー";
      menu.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "tenotsu-main-menu-grid";
      MENU_ITEMS.forEach(label => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tenotsu-main-menu-button";
        btn.dataset.surfaceAction = "main-menu";
        btn.dataset.menuLabel = label;
        btn.textContent = label;
        grid.appendChild(btn);
      });
      menu.appendChild(grid);
      menu.dataset.built = "1";
    }
    setI(menu, "display", "block");
    setI(menu, "pointer-events", "auto");
  }

  function hideMainMenu(){
    const menu = qs("#tenotsu-main-menu");
    if (menu) setI(menu, "display", "none");
  }

  function ensureShopMenu(){
    let menu = qs("#tenotsu-shop-menu");
    if (!menu) {
      menu = document.createElement("div");
      menu.id = "tenotsu-shop-menu";
      document.body.appendChild(menu);
    }
    return menu;
  }

  function showShopMenu(){
    const menu = ensureShopMenu();
    if (menu.dataset.built !== "1") {
      menu.innerHTML = "";
      const title = document.createElement("div");
      title.className = "tenotsu-main-menu-title";
      title.textContent = "ショップメニュー";
      menu.appendChild(title);

      const grid = document.createElement("div");
      grid.className = "tenotsu-main-menu-grid";

      [
        ["交換品を見る", "exchange-items"],
        ["秘密の言葉", "secret-word"],
        ["交換所の説明", "shop-help"],
        ["事務所に戻る", "back-office"]
      ].forEach(([label, action]) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "tenotsu-main-menu-button tenotsu-shop-menu-button";
        btn.dataset.surfaceAction = action;
        btn.textContent = label;
        grid.appendChild(btn);
      });

      menu.appendChild(grid);
      menu.dataset.built = "1";
    }
    setI(menu, "display", "block");
    setI(menu, "pointer-events", "auto");
  }

  function hideShopMenu(){
    const menu = qs("#tenotsu-shop-menu");
    if (menu) setI(menu, "display", "none");
  }

  function ensureFade(){
    let f = qs("#tenotsu-safe-fade");
    if (!f) {
      f = document.createElement("div");
      f.id = "tenotsu-safe-fade";
      document.body.appendChild(f);
    }
    return f;
  }

  function ensureHoldSurface(){
    let hold = qs("#tenotsu-hold-surface");
    if (!hold) {
      hold = document.createElement("div");
      hold.id = "tenotsu-hold-surface";
      hold.setAttribute("aria-hidden", "true");
      hold.innerHTML = "<div class='tenotsu-hold-ring'></div>";
      document.body.appendChild(hold);
    }
    return hold;
  }

  function showHoldSurface(x, y){
    const hold = ensureHoldSurface();
    hold.style.left = (x || Math.floor(window.innerWidth / 2)) + "px";
    hold.style.top = (y || Math.floor(window.innerHeight / 2)) + "px";
    hold.classList.add("is-holding");
    setI(hold, "display", "block");
  }

  function hideHoldSurface(){
    const hold = qs("#tenotsu-hold-surface");
    if (hold) {
      hold.classList.remove("is-holding");
      setI(hold, "display", "none");
    }
  }

  function renderDialogueComment(name, text){
    const box = qs("#dialogue-box");
    const nameEl = qs("#name");
    const textEl = qs("#text");
    if (!box || !nameEl || !textEl) return;

    removeLegacyVisualSurfaces();

    box.classList.remove("hidden");
    setI(box, "display", "block");
    setI(box, "visibility", "visible");
    setI(box, "position", "fixed");
    setI(box, "left", "5%");
    setI(box, "right", "12%");
    setI(box, "top", "auto");
    setI(box, "bottom", "max(18px, env(safe-area-inset-bottom))");
    setI(box, "width", "auto");
    setI(box, "z-index", Z.dialogue);
    setI(box, "pointer-events", currentMode === "story" ? "auto" : "none");
    nameEl.textContent = name || "";
    textEl.innerHTML = text || "";
  }

  function hideDialogueIfNonStory(){
    if (currentMode === "story") return;
    const box = qs("#dialogue-box");
    if (box) {
      box.classList.add("hidden");
      setI(box, "display", "none");
      setI(box, "pointer-events", "none");
    }
  }

  function renderOfficeCharacters(forceNew){
    purgeBackOfficeSlots();
    const layer = ensureFrontLayer();
    const existing = layer.dataset.mode === "office" && layer.children.length === 3;
    if (!forceNew && existing && officeRenderKey) {
      setI(layer, "display", "block");
      return;
    }

    const picks = shuffle(OFFICE_CHARS).slice(0, 3);
    officeRenderKey = picks.map(p => p[1]).join("|");
    layer.dataset.mode = "office";
    layer.dataset.renderKey = officeRenderKey;
    layer.innerHTML = "";

    picks.forEach((c, idx) => {
      const img = document.createElement("img");
      img.className = "tenotsu-front-stand tenotsu-front-stand-" + idx;
      img.alt = c[0];
      img.src = "images/assets/char/" + c[1];
      img.onerror = () => {
        img.onerror = null;
        img.src = "images/assets/char/a10501.webp";
      };
      layer.appendChild(img);
    });

    setI(layer, "display", "block");
    renderDialogueComment(picks[0][0], picks[0][2]);
  }

  function renderShopPanel(){
    // v038_27: shop action buttons live in #tenotsu-shop-menu.
    // Operation surface remains available but does not create a second submenu.
    const s = ensureOperationSurface();
    s.innerHTML = "";
    setI(s, "display", "none");
    setI(s, "pointer-events", "none");
  }

  function renderSidePanel(title, body){
    const s = ensureOperationSurface();
    s.innerHTML = `
      <div id="tenotsu-side-panel" role="dialog" aria-label="${title}">
        <div class="tenotsu-shop-title">${title}</div>
        <div class="tenotsu-side-panel-body">${body}</div>
        <button type="button" class="tenotsu-shop-button" data-surface-action="back-office">事務所に戻る</button>
      </div>
    `;
    setI(s, "display", "block");
    setI(s, "pointer-events", "auto");
  }

  function updateInputSurfaces(){
    const click = qs("#click-layer");
    const op = qs("#tenotsu-operation-surface");
    if (currentMode === "story") {
      if (click) {
        click.style.removeProperty("display");
        click.style.pointerEvents = "auto";
      }
      if (op) op.style.pointerEvents = "none";
    } else {
      if (click) {
        click.style.pointerEvents = "none";
        if (currentMode === "battle") click.style.display = "none";
        else click.style.removeProperty("display");
      }
      if (op) {
        const active = currentMode === "members" || currentMode === "settings";
        op.style.pointerEvents = active ? "auto" : "none";
        op.style.display = active && op.children.length ? "block" : "none";
      }
    }
  }

  function normalizeStoryLayer(){
    qsa("#char-layer img,#char-layer .char-image").forEach(img => {
      setI(img, "position", "relative");
      setI(img, "left", "auto");
      setI(img, "top", "auto");
      setI(img, "right", "auto");
      setI(img, "bottom", "auto");
      setI(img, "display", "block");
      setI(img, "visibility", "visible");
      setI(img, "opacity", "1");
      setI(img, "z-index", Z.storyChar);
      setI(img, "pointer-events", "none");
    });
  }


  function updateOrientationWarning(){
    // v038_27:
    // Desktop / normal wide browser must be treated as landscape-ok.
    const w = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
    const h = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    const coarse = !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    const hoverNone = !!(window.matchMedia && window.matchMedia("(hover: none)").matches);
    const portrait = h > w;
    const narrow = w < 900;
    const shouldWarn = portrait && narrow && (coarse || hoverNone);

    document.body.classList.toggle("tenotsu-portrait-warning", shouldWarn);
    document.body.classList.toggle("tenotsu-landscape-ok", !shouldWarn);

    qsa("#rotate-warning,.rotate-warning,.orientation-warning,#orientation-warning").forEach(el => {
      if (shouldWarn) {
        el.style.removeProperty("display");
        el.style.removeProperty("visibility");
        el.style.removeProperty("opacity");
      } else {
        el.classList.add("hidden");
        setI(el, "display", "none");
        setI(el, "visibility", "hidden");
        setI(el, "opacity", "0");
        setI(el, "pointer-events", "none");
      }
    });
  }


  function normalizeLayers(){
    updateOrientationWarning();
    [
      ["#background", Z.bg],
      ["#char-layer,#char-layer .char-slot,#char-layer .char-image", Z.storyChar],
      ["#ev-layer,#ev-layer .ev-image,#ev-layer .cg-image,.ev-image,.cg-image", Z.cg],
      ["#click-layer", Z.click],
      ["#tenotsu-front-character-layer,#tenotsu-front-character-layer img", Z.frontChar],
      ["#tenotsu-operation-surface", Z.operation],
      ["#tenotsu-main-menu,#tenotsu-shop-menu", Z.menu],
      ["#tenotsu-hold-surface", Z.hold],
      ["#dialogue-box,#name,#text", Z.dialogue],
      ["#choices,.choices-area", Z.choice],
      ["#battle-root", Z.battle],
      [".fade-overlay,#fade-overlay,.black-fade,#black-fade,.screen-fade,#tenotsu-safe-fade", Z.fade],
      ["#ios-pwa-notice,#rotate-warning", Z.system],
      [".boot-flow,#boot-flow", Z.boot]
    ].forEach(([sel,z]) => qsa(sel).forEach(el => setI(el, "z-index", z)));

    if (currentMode === "story") {
      normalizeStoryLayer();
    } else {
      purgeBackOfficeSlots();
    }
    removeLegacyVisualSurfaces();
    updateInputSurfaces();
  }

  function safeFade(callback){
    const f = ensureFade();
    setI(f, "display", "block");
    setI(f, "pointer-events", "none");
    f.style.transition = "none";
    f.style.opacity = "0";
    f.getBoundingClientRect();

    requestAnimationFrame(() => {
      f.style.transition = "opacity 700ms linear";
      f.style.opacity = "1";
    });

    setTimeout(() => {
      try {
        if (typeof callback === "function") callback();
      } finally {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            f.style.transition = "opacity 450ms linear";
            f.style.opacity = "0";
            setTimeout(() => {
              setI(f, "display", "none");
              setI(f, "pointer-events", "none");
              f.style.transition = "none";
              f.style.opacity = "0";
            }, 520);
          });
        });
      }
    }, 730);
  }

  function enterOffice(forceNew){
    if (busy) return;
    busy = true;
    try {
      setMode("office");
      hideBootOverlay();
      ensureLegacyGuard();
      hardHideLegacyMenus();
      removeLegacyVisualSurfaces();
      document.body.classList.remove("battle-screen");
      const battle = qs("#battle-root");
      if (battle) battle.classList.add("hidden");
      clearOperationSurface();
      hideShopMenu();
      setBackground(BG_OFFICE);
      renderOfficeCharacters(!!forceNew);
      showMainMenu();
      purgeBackOfficeSlots();
      normalizeLayers();
      startOfficeSlotGuard();
    } finally {
      setTimeout(() => { busy = false; }, 50);
    }
  }

  function enterShop(){
    if (busy) return;
    busy = true;
    try {
      setMode("shop");
      hideBootOverlay();
      ensureLegacyGuard();
      hardHideLegacyMenus();
      removeLegacyVisualSurfaces();
      hideFrontLayer();
      setBackground(BG_SHOP);
      renderDialogueComment("朔夜", "店長様、お待ちしておりました。本日の交換品はこちらです。");
      renderShopPanel();
      hideMainMenu();
      showShopMenu();
      purgeBackOfficeSlots();
      normalizeLayers();
      startOfficeSlotGuard();
    } finally {
      setTimeout(() => { busy = false; }, 50);
    }
  }

  function openShop(){
    try {
      const seen = localStorage.getItem(SAKUYA_INTRO_KEY) === "1";
      if (!seen && typeof window.loadScenario === "function") {
        localStorage.setItem(SAKUYA_INTRO_KEY, "1");
        window.__TENOTSU_RETURN_TO_SHOP_AFTER_STORY__ = true;
        setMode("story");
        stopOfficeSlotGuard();
        const charLayer = qs("#char-layer");
        if (charLayer) {
          charLayer.style.removeProperty("display");
          charLayer.style.removeProperty("visibility");
        }
        hideFrontLayer();
        hideMainMenu();
        clearOperationSurface();
        window.loadScenario(SAKUYA_INTRO_SCENARIO);
        return;
      }
    } catch (_) {}
    enterShop();
  }

  function enterBattle(){
    setMode("battle");
    stopOfficeSlotGuard();
    hideBootOverlay();
    ensureLegacyGuard();
    removeLegacyVisualSurfaces();
    document.body.classList.add("battle-screen");
    hideFrontLayer();
    hideMainMenu();
    hideShopMenu();
    clearOperationSurface();
    hideDialogueIfNonStory();
    const click = qs("#click-layer");
    if (click) {
      click.style.display = "none";
      click.style.pointerEvents = "none";
    }
    if (typeof window.startBattle === "function") window.startBattle();
    else if (typeof window.startDeckBattlePrototype === "function") window.startDeckBattlePrototype();
    normalizeLayers();
  }

  function enterMembers(){
    setMode("members");
    hideShopMenu();
    showMainMenu();
    renderSidePanel("メンバー", "メンバー一覧は現在調整中です。ここでは後続実装でメンバー詳細画面へ接続します。");
    renderDialogueComment("店長", "メンバー画面を確認します。");
    normalizeLayers();
  }

  function enterSettings(){
    setMode("settings");
    hideShopMenu();
    showMainMenu();
    renderSidePanel("設定", "設定画面は現在調整中です。音量・表示・データ設定をここへ接続予定です。");
    renderDialogueComment("店長", "設定を確認します。");
    normalizeLayers();
  }

  function handleMenu(label){
    switch(label){
      case "店舗":
        enterOffice(true);
        break;
      case "ショップ":
        openShop();
        break;
      case "店舗営業":
        enterBattle();
        break;
      case "外回り":
        setMode("town");
        hideFrontLayer();
        clearOperationSurface();
        renderDialogueComment("店長", "外回りへ出ます。");
        if (typeof window.loadScenario === "function") window.loadScenario("town_walk.json");
        break;
      case "設定":
        enterSettings();
        break;
      case "メンバー":
        enterMembers();
        break;
    }
  }

  function handleSurfaceAction(action, label){
    if (throttle()) return;
    switch(action){
      case "main-menu":
        handleMenu(label);
        break;
      case "exchange-items":
        renderDialogueComment("朔夜", "現在交換できる品を確認しています。実交換リストは次の実装で接続します。");
        break;
      case "secret-word":
        renderDialogueComment("朔夜", "秘密の言葉ですね。入力欄の実装までは、ここで合言葉イベントを受け付ける予定です。");
        break;
      case "shop-help":
        renderDialogueComment("朔夜", "交換には、イベントの証や素材が必要です。時期によって品揃えが変わります。");
        break;
      case "back-office":
        enterOffice(true);
        break;
    }
  }

  function installEvents(){
    if (installed) return;
    installed = true;

    document.addEventListener("pointerdown", ev => {
      if (currentMode === "story") return;
      const target = ev.target && ev.target.closest ? ev.target.closest("[data-surface-action], #battle-root, #tenotsu-main-menu, #tenotsu-shop-panel, #tenotsu-side-panel") : null;
      if (target) showHoldSurface(ev.clientX, ev.clientY);
    }, true);

    document.addEventListener("pointerup", hideHoldSurface, true);
    document.addEventListener("pointercancel", hideHoldSurface, true);
    document.addEventListener("pointerleave", hideHoldSurface, true);

    document.addEventListener("click", ev => {
      const battleBtn = ev.target && ev.target.closest ? ev.target.closest("#battle-root button[data-action='close']") : null;
      if (battleBtn) {
        ev.preventDefault();
        ev.stopPropagation();
        if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();

        safeFade(() => {
          const root = qs("#battle-root");
          if (root) root.classList.add("hidden");
          enterOffice(true);
        });
        return;
      }

      const actionEl = ev.target && ev.target.closest ? ev.target.closest("[data-surface-action]") : null;
      if (!actionEl) return;

      ev.preventDefault();
      ev.stopPropagation();
      if (typeof ev.stopImmediatePropagation === "function") ev.stopImmediatePropagation();

      const action = actionEl.dataset.surfaceAction || "";
      const label = (actionEl.dataset.menuLabel || actionEl.textContent || "").trim();
      handleSurfaceAction(action, label);
    }, true);
  }

  function patchApis(){
    // v038_27 random API hard override: delayed legacy calls must not draw back slots.
    window.randomImagesOn = function(){ purgeBackOfficeSlots(); return Promise.resolve([]); };
    window.randomTextsOn = function(){ purgeBackOfficeSlots(); return []; };
    window.buildRandomImages = function(){ purgeBackOfficeSlots(); return []; };
    window.tenotsuHideRandomShowLayers = function(){ purgeBackOfficeSlots(); return true; };
    // v038_27 random API hard override
    window.tenotsuSetGameMode = function(mode){
      if (mode === "office") return enterOffice(false);
      if (mode === "shop") return enterShop();
      if (mode === "battle") return enterBattle();
      setMode(mode || "office");
      normalizeLayers();
    };
    window.tenotsuEnterOfficeMode = function(reason){
      const force = reason === true || reason === "force" || reason === "story-end" || reason === "battle-end";
      return enterOffice(force);
    };
    window.tenotsuShowOfficeSixMenu = function(){ showMainMenu(); normalizeLayers(); };
    window.tenotsuSetOfficeBackground = function(){ setBackground(BG_OFFICE); };
    window.tenotsuRestoreOfficeBackground = function(){ setBackground(BG_OFFICE); };
    window.tenotsuShowExchangeShopBackground = function(){ enterShop(); };
    window.tenotsuSetExchangeBackground = function(){ enterShop(); };
    window.tenotsuOpenShopWithSakuya = function(){ openShop(); };
    window.tenotsuNormalizeLayerIndex = function(){ normalizeLayers(); };
    window.tenotsuRunBootFlow = function(){
      // v038_27: script.js may call this after surfaceManager already entered office.
      // Do not force a second random character render.
      const mode = document.body.dataset.gameMode || window.tenotsuGameMode || "";
      if (mode !== "office") enterOffice(true);
      else enterOffice(false);
    };
    window.tenotsuForceShowMenuFallback = function(){ hardHideLegacyMenus(); enterOffice(true); };
    // v038_27 showlist hard override
    window.showList = function(){ hardHideLegacyMenus(); return false; };
    window.showlist = function(){ hardHideLegacyMenus(); return false; };
    window.showMenuList = function(){ hardHideLegacyMenus(); return false; };
    window.tenotsuBlackFadeOut = function(ms){
      const f = ensureFade();
      setI(f, "display", "block");
      setI(f, "pointer-events", "none");
      f.style.transition = "opacity " + (ms || 700) + "ms linear";
      f.style.opacity = "1";
    };
    window.tenotsuBlackFadeIn = function(ms){
      const f = ensureFade();
      setI(f, "pointer-events", "none");
      f.style.transition = "opacity " + (ms || 450) + "ms linear";
      f.style.opacity = "0";
      setTimeout(() => { setI(f, "display", "none"); }, (ms || 450) + 80);
    };

    window.tenotsuHideOfficeBackgroundDirect = function(){};
    window.tenotsuDisableOfficeBackground = function(){};
    window.tenotsuForceOfficeForeground = function(){};
    window.TENOTSU_OFFICE_DISABLE_BACKGROUND = false;
  }

  function patchStoryEnd(){
    const prev = window.tenotsuHandleStoryEndReturn;
    if (typeof prev !== "function" || prev.__surfaceTakeoverV03820) return;

    const wrapped = function(){
      const scenarioName = String(window.currentScenario || "");
      const toShop = window.__TENOTSU_RETURN_TO_SHOP_AFTER_STORY__ || scenarioName.includes(SAKUYA_INTRO_SCENARIO);
      window.__TENOTSU_RETURN_TO_SHOP_AFTER_STORY__ = false;
      window.__TENOTSU_STORY_ENDING__ = false;

      safeFade(() => {
        if (toShop) enterShop();
        else enterOffice(true);
      });
    };
    wrapped.__surfaceTakeoverV03820 = true;
    window.tenotsuHandleStoryEndReturn = wrapped;
  }

  function shouldEnterOfficeAfterBoot(){
    const mode = document.body.dataset.gameMode || window.tenotsuGameMode || "";
    if (["story","shop","battle","office","members","settings"].includes(mode)) return false;
    const bg = qs("#background");
    const src = bg ? String(bg.getAttribute("src") || "") : "";
    if (!mode || mode === "title") return true;
    return src.includes("title") || src.endsWith("title.jpg");
  }

  function boot(){
    document.body.classList.add("tenotsu-surface-authority");
    try { if (typeof window.tenotsuBootRescuePrepare === "function") window.tenotsuBootRescuePrepare(); } catch (_) {}
    patchApis();
    patchStoryEnd();
    installEvents();
    updateOrientationWarning();
    window.addEventListener('resize', updateOrientationWarning, { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(updateOrientationWarning, 120), { passive: true });
    removeLegacyVisualSurfaces();
    normalizeLayers();

    const tryEnterOffice = () => {
      try { if (typeof window.tenotsuBootRescuePrepare === "function") window.tenotsuBootRescuePrepare(); } catch (_) {}
      patchApis();
      patchStoryEnd();
      hardHideLegacyMenus();
      removeLegacyVisualSurfaces();
      if (shouldEnterOfficeAfterBoot()) {
        enterOffice(!bootOfficeEntered);
        bootOfficeEntered = true;
      } else {
        normalizeLayers();
      }
    };

    setTimeout(tryEnterOffice, 120);
    setTimeout(tryEnterOffice, 700);
    setTimeout(() => {
      const mode = document.body.dataset.gameMode || window.tenotsuGameMode || "";
      if (!mode || mode === "title") {
        enterOffice(!bootOfficeEntered);
        bootOfficeEntered = true;
      }
    }, 1600);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
