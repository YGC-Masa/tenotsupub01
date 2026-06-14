/* v039_71 inputGuard.js
 * バトル中の誤ピンチ・ダブルタップ拡大を抑止する。
 * OS/アクセシビリティレベルの拡大は完全には止められないが、ゲーム面の誤操作を防ぐ。
 */
(function () {
  "use strict";

  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};
  const VERSION = "v039_81_battle_pinch_guard_event";
  let lastTouchEndAt = 0;

  function isVisible(el) {
    if (!el) return false;
    if (el.classList && el.classList.contains("hidden")) return false;
    const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
    return !style || (style.display !== "none" && style.visibility !== "hidden");
  }

  function isBattleInputLocked() {
    const normalRoot = document.getElementById("battle-root");
    const rivalRoot = document.getElementById("rival-battle-root");
    const eventRoot = document.getElementById("event-battle-root");
    return document.body.classList.contains("battle-screen") ||
      document.body.classList.contains("rival-battle-screen") ||
      document.body.classList.contains("event-battle-screen") ||
      isVisible(normalRoot) ||
      isVisible(rivalRoot) ||
      isVisible(eventRoot);
  }

  function cancelEvent(event) {
    if (!event) return;
    if (event.cancelable !== false && typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
  }

  function preventMultiTouch(event) {
    if (!isBattleInputLocked()) return;
    if (event.touches && event.touches.length > 1) cancelEvent(event);
  }

  function preventGesture(event) {
    if (!isBattleInputLocked()) return;
    cancelEvent(event);
  }

  function preventDoubleTap(event) {
    if (!isBattleInputLocked()) return;
    const now = Date.now();
    if (now - lastTouchEndAt < 330) cancelEvent(event);
    lastTouchEndAt = now;
  }

  function preventCtrlWheel(event) {
    if (!isBattleInputLocked()) return;
    if (event.ctrlKey) cancelEvent(event);
  }

  function install() {
    const doc = document;
    doc.addEventListener("touchstart", preventMultiTouch, { passive: false, capture: true });
    doc.addEventListener("touchmove", preventMultiTouch, { passive: false, capture: true });
    doc.addEventListener("touchend", preventDoubleTap, { passive: false, capture: true });
    doc.addEventListener("gesturestart", preventGesture, { passive: false, capture: true });
    doc.addEventListener("gesturechange", preventGesture, { passive: false, capture: true });
    doc.addEventListener("gestureend", preventGesture, { passive: false, capture: true });
    doc.addEventListener("dblclick", preventGesture, { passive: false, capture: true });
    window.addEventListener("wheel", preventCtrlWheel, { passive: false, capture: true });
  }

  install();

  ns.inputGuard = Object.assign(ns.inputGuard || {}, {
    VERSION,
    isBattleInputLocked
  });
})();
