/* v039_221 right menu viewport guard */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};

  const GUARD_CLASS = "tenotsu-viewport-guarded-right-menu";
  const TOP_PINNED_CLASS = "tenotsu-right-menu-top-pinned";
  const CANDIDATE_SELECTORS = [
    ".tenotsu-office-menu",
    ".tenotsu-right-menu",
    ".tenotsu-side-menu",
    ".tenotsu-home-side-menu",
    ".right-menu",
    ".side-menu",
    "[data-tenotsu-right-menu]"
  ];

  function isLikelyRightMenu(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    if (el.classList.contains("tenotsu-office-menu")) return true;
    const text = (el.innerText || "").trim();
    if (!text) return false;
    const keywords = ["店舗", "メンバー", "店舗営業", "外回り", "回想アルバム", "チューニング", "ショップ", "設定"];
    let hit = 0;
    keywords.forEach((word) => { if (text.includes(word)) hit += 1; });
    return hit >= 4;
  }

  function findRightMenu() {
    for (const selector of CANDIDATE_SELECTORS) {
      const list = Array.from(document.querySelectorAll(selector));
      const found = list.find(isLikelyRightMenu);
      if (found) return found;
    }
    const all = Array.from(document.querySelectorAll("nav, aside, section, div"));
    return all.find(isLikelyRightMenu) || null;
  }

  function markAsGuarded(el) {
    if (!el) return null;
    el.classList.add(GUARD_CLASS);
    el.setAttribute("data-tenotsu-right-menu", "true");
    return el;
  }

  function applyRightMenuViewportGuard() {
    const el = markAsGuarded(findRightMenu());
    if (!el) return false;

    // Reset temporary inline adjustments before measuring.
    el.style.removeProperty("top");
    el.style.removeProperty("transform");
    el.style.removeProperty("max-height");
    document.body.classList.remove(TOP_PINNED_CLASS);

    const margin = Math.max(8, Math.min(16, Math.round(window.innerHeight * 0.014)));
    const rect = el.getBoundingClientRect();
    const overflowBottom = rect.bottom > window.innerHeight - margin;
    const overflowTop = rect.top < margin;

    if (overflowBottom || overflowTop) {
      document.body.classList.add(TOP_PINNED_CLASS);
      el.style.setProperty("top", margin + "px", "important");
      el.style.setProperty("transform", "none", "important");
      el.style.setProperty("max-height", `calc((var(--tenotsu-vh, 1vh) * 100) - ${margin * 2}px)`, "important");
    }

    const rect2 = el.getBoundingClientRect();
    if (rect2.right > window.innerWidth - margin) {
      el.style.setProperty("right", margin + "px", "important");
    }
    return true;
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyRightMenuViewportGuard();
      setTimeout(applyRightMenuViewportGuard, 80);
      setTimeout(applyRightMenuViewportGuard, 280);
    });
  }

  window.addEventListener("resize", scheduleApply, { passive: true });
  window.addEventListener("orientationchange", scheduleApply, { passive: true });
  document.addEventListener("DOMContentLoaded", scheduleApply);

  const observer = new MutationObserver(scheduleApply);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "hidden", "style"] });

  const originalRenderOfficeMenu = ns.renderOfficeMenu;
  if (typeof originalRenderOfficeMenu === "function") {
    ns.renderOfficeMenu = function renderOfficeMenuViewportGuardPatched() {
      const result = originalRenderOfficeMenu.apply(this, arguments);
      scheduleApply();
      return result;
    };
  }

  ns.applyRightMenuViewportGuard = applyRightMenuViewportGuard;
  scheduleApply();
})();
