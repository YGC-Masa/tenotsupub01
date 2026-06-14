/* v039_80 stamina HUD + auto recovery */
(function () {
  "use strict";
  const STORAGE_KEY = "tenotsu_stamina_v1";
  const MAX_STAMINA = 100;
  const AUTO_RECOVERY_MS = 6 * 60 * 1000; // 6分に1回復
  const DEFAULT_COSTS = {
    normal_sales: 10,
    rival_battle: 0,
    event_sales: 20
  };

  function nowIso() { return new Date().toISOString(); }
  function clamp(value) {
    return Math.max(0, Math.min(MAX_STAMINA, Math.floor(Number(value) || 0)));
  }
  function safeTime(value, fallback) {
    const t = Date.parse(value || "");
    return Number.isFinite(t) ? t : fallback;
  }
  function formatRemaining(ms) {
    const safe = Math.max(0, Math.ceil(Number(ms) || 0));
    const totalSec = Math.ceil(safe / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  }
  function rawSave(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    return data;
  }
  function normalize(data) {
    if (!data || typeof data !== "object") {
      return {
        version: "v039_80",
        current: MAX_STAMINA,
        max: MAX_STAMINA,
        updatedAt: nowIso(),
        recoveryAnchorAt: nowIso(),
        history: []
      };
    }
    data.max = MAX_STAMINA;
    data.current = clamp(data.current == null ? MAX_STAMINA : data.current);
    data.history = Array.isArray(data.history) ? data.history.slice(-20) : [];
    data.version = "v039_80";
    data.updatedAt = data.updatedAt || nowIso();
    data.recoveryAnchorAt = data.recoveryAnchorAt || data.regenAt || data.recoveredAt || data.updatedAt || nowIso();
    return data;
  }
  function applyAutoRecovery(data) {
    const now = Date.now();
    const nowText = new Date(now).toISOString();
    let changed = false;

    if (data.current >= MAX_STAMINA) {
      if (data.recoveryAnchorAt !== nowText) {
        data.recoveryAnchorAt = nowText;
        data.updatedAt = nowText;
        changed = true;
      }
      if (changed) rawSave(data);
      return data;
    }

    const anchor = safeTime(data.recoveryAnchorAt, now);
    const elapsed = Math.max(0, now - anchor);
    const steps = Math.floor(elapsed / AUTO_RECOVERY_MS);
    if (steps > 0) {
      const before = data.current;
      const recoverAmount = Math.min(steps, MAX_STAMINA - before);
      data.current = clamp(before + recoverAmount);
      data.recoveryAnchorAt = data.current >= MAX_STAMINA
        ? nowText
        : new Date(anchor + steps * AUTO_RECOVERY_MS).toISOString();
      data.updatedAt = nowText;
      data.history.push({ type: "autoRecover", label: "スタミナ自動回復", amount: recoverAmount, at: nowText });
      data.history = data.history.slice(-20);
      changed = true;
    }
    if (changed) rawSave(data);
    return data;
  }
  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { data = null; }
    return applyAutoRecovery(normalize(data));
  }
  function save(data) {
    data.version = "v039_80";
    data.updatedAt = nowIso();
    data.history = Array.isArray(data.history) ? data.history.slice(-20) : [];
    rawSave(data);
    renderHud();
    return data;
  }
  function getCost(modeId) {
    return DEFAULT_COSTS[String(modeId || "")] == null ? 10 : DEFAULT_COSTS[String(modeId || "")];
  }
  function getState() {
    return load();
  }
  function getNextRecoveryInfo() {
    const data = load();
    if (data.current >= data.max) return { full: true, remainingMs: 0, label: "満タン" };
    const anchor = safeTime(data.recoveryAnchorAt, Date.now());
    const next = anchor + AUTO_RECOVERY_MS;
    const remainingMs = Math.max(0, next - Date.now());
    return { full: false, remainingMs, label: `次 +1 ${formatRemaining(remainingMs)}` };
  }
  function canConsume(modeOrCost) {
    const cost = typeof modeOrCost === "number" ? Math.max(0, Math.floor(modeOrCost)) : getCost(modeOrCost);
    return load().current >= cost;
  }
  function consume(modeOrCost, label = "店舗営業") {
    const cost = typeof modeOrCost === "number" ? Math.max(0, Math.floor(modeOrCost)) : getCost(modeOrCost);
    const data = load();
    if (data.current < cost) return { ok: false, cost, state: data };
    const wasFull = data.current >= MAX_STAMINA;
    data.current = clamp(data.current - cost);
    if (wasFull && data.current < MAX_STAMINA) data.recoveryAnchorAt = nowIso();
    data.history.push({ type: "consume", label, cost, at: nowIso() });
    data.history = data.history.slice(-20);
    save(data);
    return { ok: true, cost, state: data };
  }
  function recover(amount = MAX_STAMINA, label = "回復") {
    const data = load();
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    data.current = clamp(data.current + value);
    if (data.current >= MAX_STAMINA) data.recoveryAnchorAt = nowIso();
    data.history.push({ type: "recover", label, amount: value, at: nowIso() });
    data.history = data.history.slice(-20);
    save(data);
    return data;
  }
  function recoverAll() { return recover(MAX_STAMINA, "全回復"); }
  function renderBadge(modeId) {
    const st = load();
    const cost = getCost(modeId);
    if (cost <= 0) return "";
    const next = getNextRecoveryInfo();
    return `<div class="tenotsu-stamina-badge"><span>スタミナ</span><b>${st.current}/${st.max}</b><small>消費 ${cost}</small><small>${next.label}</small></div>`;
  }
  function renderSalesSummary() {
    const st = load();
    const next = getNextRecoveryInfo();
    const bpHtml = window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.renderSalesSummary === "function" ? window.TenotsuBattlePoint.renderSalesSummary() : "";
    return `<div class="tenotsu-sales-resource-summary"><div class="tenotsu-sales-stamina-summary"><span>スタミナ</span><b>${st.current}/${st.max}</b><small>6分に1回復</small><small>${next.label}</small></div>${bpHtml}</div>`;
  }
  function renderHud() {
    const ns = window.TENOTSU_V039;
    if (!ns || !ns.layers || !ns.layers.staminaHud) return;
    const st = load();
    const next = getNextRecoveryInfo();
    const ratio = st.max ? Math.max(0, Math.min(100, Math.round(st.current / st.max * 100))) : 0;
    const bp = window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.getState === "function" ? window.TenotsuBattlePoint.getState() : null;
    const bpNext = window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.getNextRecoveryInfo === "function" ? window.TenotsuBattlePoint.getNextRecoveryInfo() : null;
    ns.layers.staminaHud.innerHTML = `
      <div class="tenotsu-resource-hud-row">
        <div class="tenotsu-stamina-hud-label">ST</div>
        <div class="tenotsu-stamina-hud-main"><b>${st.current}</b><span>/ ${st.max}</span></div>
      </div>
      <div class="tenotsu-stamina-hud-bar"><i style="width:${ratio}%"></i></div>
      <div class="tenotsu-resource-hud-next">${next.full ? "満タン" : next.label}</div>
      ${bp ? `<div class="tenotsu-resource-hud-row tenotsu-resource-hud-bp"><div class="tenotsu-stamina-hud-label">BP</div><div class="tenotsu-stamina-hud-main"><b>${bp.current}</b><span>/ ${bp.max}</span></div></div><div class="tenotsu-resource-hud-next tenotsu-resource-hud-next-bp">${bpNext ? bpNext.label : "60分に1回復"}</div>` : ""}
    `;
  }
  function refreshAll() {
    renderHud();
  }

  window.TenotsuStamina = {
    VERSION: "v039_80",
    MAX_STAMINA,
    AUTO_RECOVERY_MS,
    AUTO_RECOVERY_MINUTES: 6,
    DEFAULT_COSTS: Object.assign({}, DEFAULT_COSTS),
    getCost,
    getState,
    getNextRecoveryInfo,
    canConsume,
    consume,
    recover,
    recoverAll,
    renderBadge,
    renderSalesSummary,
    renderHud,
    refreshAll
  };

  window.addEventListener("load", () => setTimeout(renderHud, 0));
  window.setInterval(renderHud, 30000);
})();
