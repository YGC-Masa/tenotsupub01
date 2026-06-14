/* v039_89 event battle point: monthly event cleaning battle resource */
(function () {
  "use strict";
  const STORAGE_KEY = "tenotsu_event_battle_point_v1";
  const MAX_EBP = 5;
  const AUTO_RECOVERY_MS = 30 * 60 * 1000; // 30分に1回復

  function nowIso() { return new Date().toISOString(); }
  function clamp(value) { return Math.max(0, Math.min(MAX_EBP, Math.floor(Number(value) || 0))); }
  function safeTime(value, fallback) {
    const t = Date.parse(value || "");
    return Number.isFinite(t) ? t : fallback;
  }
  function formatRemaining(ms) {
    const totalSec = Math.max(0, Math.ceil((Number(ms) || 0) / 1000));
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
      return { version: "v039_89", current: MAX_EBP, max: MAX_EBP, updatedAt: nowIso(), recoveryAnchorAt: nowIso(), history: [] };
    }
    data.version = "v039_89";
    data.max = MAX_EBP;
    data.current = clamp(data.current == null ? MAX_EBP : data.current);
    data.updatedAt = data.updatedAt || nowIso();
    data.recoveryAnchorAt = data.recoveryAnchorAt || data.updatedAt || nowIso();
    data.history = Array.isArray(data.history) ? data.history.slice(-20) : [];
    return data;
  }
  function applyAutoRecovery(data) {
    const now = Date.now();
    const nowText = new Date(now).toISOString();
    if (data.current >= MAX_EBP) {
      data.recoveryAnchorAt = nowText;
      data.updatedAt = nowText;
      rawSave(data);
      return data;
    }
    const anchor = safeTime(data.recoveryAnchorAt, now);
    const elapsed = Math.max(0, now - anchor);
    const steps = Math.floor(elapsed / AUTO_RECOVERY_MS);
    if (steps > 0) {
      const before = data.current;
      const recoverAmount = Math.min(steps, MAX_EBP - before);
      data.current = clamp(before + recoverAmount);
      data.recoveryAnchorAt = data.current >= MAX_EBP ? nowText : new Date(anchor + steps * AUTO_RECOVERY_MS).toISOString();
      data.updatedAt = nowText;
      data.history.push({ type: "autoRecover", label: "イベントBP自動回復", amount: recoverAmount, at: nowText });
      data.history = data.history.slice(-20);
      rawSave(data);
    }
    return data;
  }
  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { data = null; }
    return applyAutoRecovery(normalize(data));
  }
  function save(data) {
    data.version = "v039_89";
    data.updatedAt = nowIso();
    data.history = Array.isArray(data.history) ? data.history.slice(-20) : [];
    rawSave(data);
    return data;
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
  function canConsume(cost = 1) { return load().current >= Math.max(0, Math.floor(Number(cost) || 0)); }
  function consume(cost = 1, label = "イベントバトル") {
    cost = Math.max(0, Math.floor(Number(cost) || 0));
    const data = load();
    if (cost <= 0) return { ok: true, cost, state: data };
    if (data.current < cost) return { ok: false, cost, state: data };
    const wasFull = data.current >= MAX_EBP;
    data.current = clamp(data.current - cost);
    if (wasFull && data.current < MAX_EBP) data.recoveryAnchorAt = nowIso();
    data.history.push({ type: "consume", label, cost, at: nowIso() });
    data.history = data.history.slice(-20);
    save(data);
    return { ok: true, cost, state: data };
  }
  function recover(amount = MAX_EBP, label = "イベントBP回復") {
    const data = load();
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    data.current = clamp(data.current + value);
    if (data.current >= MAX_EBP) data.recoveryAnchorAt = nowIso();
    data.history.push({ type: "recover", label, amount: value, at: nowIso() });
    data.history = data.history.slice(-20);
    return save(data);
  }
  function recoverAll() { return recover(MAX_EBP, "イベントBP全回復"); }
  function renderBadge(cost = 1) {
    const ep = load();
    const next = getNextRecoveryInfo();
    return `<div class="tenotsu-eventbp-badge"><span>イベントBP</span><b>${ep.current}/${ep.max}</b><small>消費 ${cost}</small><small>${next.label}</small></div>`;
  }

  window.TenotsuEventBattlePoint = {
    VERSION: "v039_89",
    MAX_EBP,
    AUTO_RECOVERY_MS,
    AUTO_RECOVERY_MINUTES: 30,
    getState,
    getNextRecoveryInfo,
    canConsume,
    consume,
    recover,
    recoverAll,
    renderBadge
  };
})();
