/* v039_163 boot surface guard */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};
  const doc = document;

  function installBlackout(){
    try {
      if (!doc.body) return;
      if (!doc.querySelector(".tenotsu-boot-blackout-surface")) {
        const guard = doc.createElement("div");
        guard.className = "tenotsu-boot-blackout-surface";
        guard.setAttribute("aria-hidden", "true");
        doc.body.appendChild(guard);
      }
      if (doc.body.dataset.tenotsuBootReady !== "1") {
        doc.body.dataset.tenotsuBootReady = "0";
      }
    } catch (_) {}
  }

  function markReady(){
    try {
      if (!doc.body) return;
      doc.body.dataset.tenotsuBootReady = "1";
      const guard = doc.querySelector(".tenotsu-boot-blackout-surface");
      if (guard) setTimeout(() => { try { guard.remove(); } catch (_) {} }, 260);
    } catch (_) {}
  }

  function markNotReady(){
    try {
      if (doc.body) doc.body.dataset.tenotsuBootReady = "0";
      installBlackout();
    } catch (_) {}
  }

  if (doc.readyState === "loading") {
    doc.addEventListener("DOMContentLoaded", installBlackout, { once: true });
  } else {
    installBlackout();
  }

  const originalEnterOffice = ns.enterOffice;
  if (typeof originalEnterOffice === "function" && !originalEnterOffice.__tenotsuBootGuardWrapped) {
    const wrapped = async function enterOfficeBootGuard(options){
      markNotReady();
      try {
        const result = await originalEnterOffice.call(this, options || {});
        markReady();
        return result;
      } catch (err) {
        markReady();
        throw err;
      }
    };
    wrapped.__tenotsuBootGuardWrapped = true;
    ns.enterOffice = wrapped;
  }

  ns.markBootSurfaceReady = markReady;
  ns.markBootSurfaceNotReady = markNotReady;
})();
