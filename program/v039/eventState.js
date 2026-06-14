/* v039_37 event state */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;
  ns.eventStateKey = "tenotsu_v039_event_read_state";
  ns.loadEventReadState = function loadEventReadState() {
    try { const raw = localStorage.getItem(ns.eventStateKey); return raw ? JSON.parse(raw) : {}; } catch (_) { return {}; }
  };
  ns.saveEventReadState = function saveEventReadState(state) {
    try { localStorage.setItem(ns.eventStateKey, JSON.stringify(state || {})); } catch (_) {}
  };
  ns.isEventRead = function isEventRead(eventId) {
    const state = ns.loadEventReadState();
    return !!(state && state[eventId] && state[eventId].read);
  };
  ns.markEventRead = function markEventRead(eventId) {
    if (!eventId) return;
    const state = ns.loadEventReadState();
    state[eventId] = { read: true, readAt: Date.now() };
    ns.saveEventReadState(state);
  };
  ns.getEventReadLabel = function getEventReadLabel(eventId) {
    return ns.isEventRead(eventId) ? "既読" : "未読";
  };
})();
