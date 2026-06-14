/* v038_27 Boot Rescue
   Runs before legacy script.js. Prevents legacy MutationObserver/menu fallback loops from freezing boot.
*/
(function(){
  "use strict";
  window.TENOTSU_BOOT_RESCUE_VERSION = "v038_27";
  window.__TENOTSU_DISABLE_LEGACY_OBSERVERS__ = true;
  window.__TENOTSU_SURFACE_TAKEOVER__ = true;
  window.__TENOTSU_DISABLE_RANDOMSHOW_VISUALS__ = true;

  // Disable legacy MutationObserver blocks that were repeatedly rebuilding menus.
  if (window.MutationObserver && !window.MutationObserver.__tenotsuRescued) {
    const NativeMutationObserver = window.MutationObserver;
    function SafeMutationObserver(callback) {
      this.__native = new NativeMutationObserver((mutations, observer) => {
        if (window.__TENOTSU_DISABLE_LEGACY_OBSERVERS__) return;
        try { callback(mutations, observer); } catch (err) { console.warn("[TENOTSU MUTATION OBSERVER SUPPRESSED ERROR]", err); }
      });
    }
    SafeMutationObserver.prototype.observe = function(target, options) {
      if (window.__TENOTSU_DISABLE_LEGACY_OBSERVERS__) return;
      return this.__native.observe(target, options);
    };
    SafeMutationObserver.prototype.disconnect = function(){ return this.__native.disconnect(); };
    SafeMutationObserver.prototype.takeRecords = function(){ return this.__native.takeRecords(); };
    SafeMutationObserver.__tenotsuRescued = true;
    SafeMutationObserver.NativeMutationObserver = NativeMutationObserver;
    window.MutationObserver = SafeMutationObserver;
  }

  // Legacy guard checks #list-panel/#menu-panel only. Keep a non-visual placeholder so it won't run fallback.
  function hideLegacyMenusEarly(){
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
  // v038_27 bootRescue hide legacy menus

  function ensureLegacyGuardSatisfied(){
    let list = document.getElementById("list-panel");
    if (!list) {
      list = document.createElement("div");
      list.id = "list-panel";
      document.body.appendChild(list);
    }
    list.classList.remove("hidden");
    list.textContent = "";
    list.style.setProperty("display", "none", "important");
    list.style.setProperty("pointer-events", "none", "important");
  }

  function hideRandomShowLayers(){
    document.querySelectorAll("#random-images-layer,#random-text-layer,.title-comment-window").forEach(el => {
      el.innerHTML = "";
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }

  function suppressOldRandomSurfaces(){
    document.querySelectorAll("#random-images-layer,#random-text-layer,.random-images-layer,.random-text-layer,.random-show,.random-character,.title-character-layer,.title-comment-window,.title-comment,.boot-character-layer").forEach(el => {
      el.classList.add("hidden");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }

  function hideLegacyCommentBoxes(){
    hideRandomShowLayers();
    document.querySelectorAll("#office-comment-box,#title-comment-box,#office-message,#office-comment,.office-comment-box,.title-comment-box,.office-message,.office-comment,.top-comment,.header-comment,.tenotsu-office-comment,#tenotsu-office-comment,#tenotsu-office-force-comment,#tenotsu-surface-comment").forEach(el => {
      el.classList.add("hidden");
      el.style.setProperty("display", "none", "important");
      el.style.setProperty("visibility", "hidden", "important");
      el.style.setProperty("pointer-events", "none", "important");
    });
  }

  function rescueBootOverlay(){
    suppressOldRandomSurfaces();
    hideLegacyCommentBoxes();
    const boot = document.getElementById("boot-flow");
    if (boot && (document.body.dataset.gameMode === "office" || window.tenotsuGameMode === "office")) {
      boot.classList.add("hidden", "is-out");
      boot.setAttribute("aria-hidden", "true");
      boot.style.setProperty("display", "none", "important");
      boot.style.setProperty("pointer-events", "none", "important");
    }
  }

  window.tenotsuBootRescuePrepare = function(){
    try { ensureLegacyGuardSatisfied(); } catch (_) {}
    try { hideLegacyMenusEarly(); } catch (_) {}
    try { rescueBootOverlay(); } catch (_) {}
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", window.tenotsuBootRescuePrepare, { once: false });
  } else {
    window.tenotsuBootRescuePrepare();
  }
  window.addEventListener("load", () => {
    window.tenotsuBootRescuePrepare();
    setTimeout(window.tenotsuBootRescuePrepare, 300);
    setTimeout(window.tenotsuBootRescuePrepare, 1200);
    setTimeout(window.tenotsuBootRescuePrepare, 2400);
  });
})();
