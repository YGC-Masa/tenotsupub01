// effect.js - v037 修正版
// すべてのエフェクトは Promise を返す。duration 未指定時は 1000ms。

function waitEffect(duration = 1000) {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

function setTransition(el, prop, duration, easing = "ease") {
  el.style.transition = `${prop} ${duration}ms ${easing}`;
}

window.effects = {
  fadein: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.opacity = 0;
    setTransition(el, "opacity", duration);
    requestAnimationFrame(() => {
      el.style.opacity = 1;
    });
    return waitEffect(duration);
  },

  fadeout: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.opacity = 1;
    setTransition(el, "opacity", duration);
    requestAnimationFrame(() => {
      el.style.opacity = 0;
    });
    return waitEffect(duration);
  },

  whitein: (_el, duration = 1000) => {
    return flashOverlay("#fff", duration);
  },

  blackin: (_el, duration = 1000) => {
    return flashOverlay("#000", duration);
  },

  slideleft: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.transform = "translateX(100%)";
    setTransition(el, "transform", duration);
    requestAnimationFrame(() => {
      el.style.transform = "translateX(0)";
    });
    return waitEffect(duration);
  },

  slideright: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.transform = "translateX(-100%)";
    setTransition(el, "transform", duration);
    requestAnimationFrame(() => {
      el.style.transform = "translateX(0)";
    });
    return waitEffect(duration);
  },

  wipeleft: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.clipPath = "inset(0 100% 0 0)";
    setTransition(el, "clip-path", duration);
    requestAnimationFrame(() => {
      el.style.clipPath = "inset(0 0 0 0)";
    });
    return waitEffect(duration);
  },

  wiperight: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.clipPath = "inset(0 0 0 100%)";
    setTransition(el, "clip-path", duration);
    requestAnimationFrame(() => {
      el.style.clipPath = "inset(0 0 0 0)";
    });
    return waitEffect(duration);
  },

  circleopen: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.clipPath = "circle(0% at 50% 50%)";
    setTransition(el, "clip-path", duration);
    requestAnimationFrame(() => {
      el.style.clipPath = "circle(75% at 50% 50%)";
    });
    return waitEffect(duration);
  },

  zoomin: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.opacity = 0;
    el.style.transform = "scale(1.08)";
    el.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    requestAnimationFrame(() => {
      el.style.opacity = 1;
      el.style.transform = "scale(1)";
    });
    return waitEffect(duration);
  },

  blurin: (el, duration = 1000) => {
    if (!el) return Promise.resolve();
    el.style.opacity = 0;
    el.style.filter = "blur(12px)";
    el.style.transition = `opacity ${duration}ms ease, filter ${duration}ms ease`;
    requestAnimationFrame(() => {
      el.style.opacity = 1;
      el.style.filter = "blur(0)";
    });
    return waitEffect(duration);
  }
};

function flashOverlay(color, duration = 1000) {
  const overlay = document.createElement("div");
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: color,
    zIndex: "9999",
    opacity: "1",
    pointerEvents: "none",
    transition: `opacity ${duration}ms ease`
  });
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = "0";
  });
  return waitEffect(duration).then(() => overlay.remove());
}
