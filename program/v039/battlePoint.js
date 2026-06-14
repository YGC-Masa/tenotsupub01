/* v039_80 battle point base for VSビリビリ / event + auto recovery */
(function () {
  "use strict";
  const STORAGE_KEY = "tenotsu_battle_point_v1";
  const MAX_BP = 3;
  const AUTO_RECOVERY_MS = 60 * 60 * 1000; // 60分に1回復
  const DEFAULT_COSTS = {
    rival_battle: 1,
    event_sales: 1
  };

  function nowIso() { return new Date().toISOString(); }
  function clamp(value) {
    return Math.max(0, Math.min(MAX_BP, Math.floor(Number(value) || 0)));
  }
  function safeTime(value, fallback) {
    const t = Date.parse(value || "");
    return Number.isFinite(t) ? t : fallback;
  }
  function formatRemaining(ms) {
    const safe = Math.max(0, Math.ceil(Number(ms) || 0));
    const totalSec = Math.ceil(safe / 1000);
    const hr = Math.floor(totalSec / 3600);
    const min = Math.floor((totalSec % 3600) / 60);
    const sec = totalSec % 60;
    if (hr > 0) return `${hr}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
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
        current: MAX_BP,
        max: MAX_BP,
        updatedAt: nowIso(),
        recoveryAnchorAt: nowIso(),
        history: []
      };
    }
    data.max = MAX_BP;
    data.current = clamp(data.current == null ? MAX_BP : data.current);
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

    if (data.current >= MAX_BP) {
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
      const recoverAmount = Math.min(steps, MAX_BP - before);
      data.current = clamp(before + recoverAmount);
      data.recoveryAnchorAt = data.current >= MAX_BP
        ? nowText
        : new Date(anchor + steps * AUTO_RECOVERY_MS).toISOString();
      data.updatedAt = nowText;
      data.history.push({ type: "autoRecover", label: "バトルP自動回復", amount: recoverAmount, at: nowText });
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
    refreshAll();
    return data;
  }
  function getCost(modeId) {
    return DEFAULT_COSTS[String(modeId || "")] == null ? 0 : DEFAULT_COSTS[String(modeId || "")];
  }
  function getState() { return load(); }
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
  function consume(modeOrCost, label = "バトル営業") {
    const cost = typeof modeOrCost === "number" ? Math.max(0, Math.floor(modeOrCost)) : getCost(modeOrCost);
    const data = load();
    if (cost <= 0) return { ok: true, cost, state: data };
    if (data.current < cost) return { ok: false, cost, state: data };
    const wasFull = data.current >= MAX_BP;
    data.current = clamp(data.current - cost);
    if (wasFull && data.current < MAX_BP) data.recoveryAnchorAt = nowIso();
    data.history.push({ type: "consume", label, cost, at: nowIso() });
    data.history = data.history.slice(-20);
    return save(data), { ok: true, cost, state: data };
  }
  function recover(amount = MAX_BP, label = "BP回復") {
    const data = load();
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    data.current = clamp(data.current + value);
    if (data.current >= MAX_BP) data.recoveryAnchorAt = nowIso();
    data.history.push({ type: "recover", label, amount: value, at: nowIso() });
    data.history = data.history.slice(-20);
    return save(data);
  }
  function recoverAll() { return recover(MAX_BP, "BP全回復"); }
  function renderBadge(modeId) {
    const cost = getCost(modeId);
    if (cost <= 0) return "";
    const bp = load();
    const next = getNextRecoveryInfo();
    return `<div class="tenotsu-battlepoint-badge"><span>バトルP</span><b>${bp.current}/${bp.max}</b><small>消費 ${cost}</small><small>${next.label}</small></div>`;
  }
  function renderSalesSummary() {
    const bp = load();
    const next = getNextRecoveryInfo();
    return `<div class="tenotsu-battlepoint-summary"><span>バトルP</span><b>${bp.current}/${bp.max}</b><small>60分に1回復</small><small>${next.label}</small></div>`;
  }
  function refreshAll() {
    try { if (window.TenotsuStamina && typeof window.TenotsuStamina.renderHud === "function") window.TenotsuStamina.renderHud(); } catch (_) {}
  }

  window.TenotsuBattlePoint = {
    VERSION: "v039_80",
    MAX_BP,
    AUTO_RECOVERY_MS,
    AUTO_RECOVERY_MINUTES: 60,
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
    refreshAll
  };

  window.addEventListener("load", () => setTimeout(refreshAll, 0));
  window.setInterval(refreshAll, 60000);
})();
