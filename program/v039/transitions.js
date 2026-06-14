/* v039_37 global scene transition */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  ns.transitionState = {
    running: false,
    bootRevealed: false
  };

  function getFadeLayer() {
    const layers = ns.layers || ns.ensureLayers();
    return layers.fade;
  }

  ns.forceBlack = function forceBlack() {
    const fade = getFadeLayer();
    fade.style.display = "block";
    fade.style.opacity = "1";
    fade.style.pointerEvents = "auto";
    fade.style.transition = "";
  };

  ns.releaseBlack = function releaseBlack(duration = 520) {
    const fade = getFadeLayer();
    fade.style.display = "block";
    fade.style.pointerEvents = "auto";
    fade.style.transition = `opacity ${duration}ms ease`;
    fade.style.opacity = "1";
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        fade.style.opacity = "0";
        setTimeout(() => {
          fade.style.display = "none";
          fade.style.pointerEvents = "none";
          fade.style.transition = "";
          resolve();
        }, duration + 40);
      });
    });
  };

  ns.fadeOutBlack = function fadeOutBlack(duration = 420) {
    const fade = getFadeLayer();
    fade.style.display = "block";
    fade.style.pointerEvents = "auto";
    fade.style.transition = `opacity ${duration}ms ease`;
    fade.style.opacity = fade.style.opacity || "0";
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        fade.style.opacity = "1";
        setTimeout(resolve, duration + 40);
      });
    });
  };

  ns.transitionTo = async function transitionTo(apply, options = {}) {
    const {
      out = 420,
      hold = 40,
      in: fadeIn = 520,
      skipOutIfBlack = false
    } = options;

    if (ns.transitionState.running) return false;
    ns.transitionState.running = true;
    document.body.classList.add("v039-transitioning");

    try {
      const fade = getFadeLayer();
      const alreadyBlack = fade.style.display !== "none" && String(fade.style.opacity) === "1";

      if (!(skipOutIfBlack && alreadyBlack)) {
        await ns.fadeOutBlack(out);
      } else {
        ns.forceBlack();
      }

      if (typeof apply === "function") await apply();

      if (hold > 0) await new Promise((resolve) => setTimeout(resolve, hold));
      await ns.releaseBlack(fadeIn);
      return true;
    } finally {
      document.body.classList.remove("v039-transitioning");
      ns.transitionState.running = false;
    }
  };

  ns.bootReveal = async function bootReveal(apply) {
    ns.forceBlack();
    if (typeof apply === "function") await apply();
    ns.transitionState.bootRevealed = true;
    await ns.releaseBlack(650);
  };
})();
