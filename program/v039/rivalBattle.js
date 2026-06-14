/* v039_77 biribiri rival battle strength/skill-ready/deck formation
 * 通常バトル BattleProto.openBattle() をラップし、currentBattleType === "rival" の時だけ
 * 小春・真冬・なつのVS CPUバトルへ差し替える。
 */
(function () {
  "use strict";

  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};
  const VERSION = "v039_80_resource_auto_recovery";
  const ROOT_ID = "rival-battle-root";
  const STORAGE_KEY = "tenotsu_biribiri_rival_rewards_v1";
  const BATTLE_SECONDS = 45;
  const MAX_ENEMIES = 4;
  const RUSH_MAX_ENEMIES = 6;
  const RUSH_START_LEFT = 18;
  const RUSH_SURFACE_MS = 1300;
  const HELP_STOCK_MAX = 3;
  const HELP_STOCK_STEP = 8;
  const DECK_STORAGE_KEY = "tenotsu_battle_deck_v1";
  const DEFAULT_STAFF_IDS = ["aa", "ab", "ac", "ad", "ae"];

  const ASSETS = {
    eyecatch: "images/assets/rival/biribiri_battle_eyecatch.jpeg",
    koharuStand: "images/assets/rival/koharu_stand.png",
    koharuCutin: "images/assets/rival/koharu_cutin.png",
    mafuyuStand: "images/assets/rival/mafuyu_stand.png",
    mafuyuCutin: "images/assets/rival/mafuyu_cutin.png",
    natsuStand: "images/assets/rival/natsu_stand.png",
    natsuCutin: "images/assets/rival/natsu_cutin.png"
  };

  const ATTR_COLORS = {
    "映像": "#ff6a4a",
    "ドライヤー": "#5cb8ff",
    "PC": "#56e07f",
    "スマホ": "#ffe45a",
    "オーディオ": "#ffb24a",
    "美容": "#ff9ed1",
    "オーブン": "#ff9b55",
    "除湿": "#8ad9ff",
    "加湿": "#9bbcff",
    "配信": "#ffb3d0",
    "生活": "#b49cff",
    "レジ": "#d9b38c",
    "リラックス": "#9ef0d0"
  };

  const WEAK_TO_ATTR = {
    tv: "映像",
    dryer: "ドライヤー",
    pc: "PC",
    phone: "スマホ",
    audio: "オーディオ",
    beauty: "美容",
    cooking: "オーブン",
    summer: "除湿",
    winter: "加湿",
    game: "配信",
    laundry: "生活",
    office: "レジ",
    relax: "リラックス"
  };

  const ALIEN_IMAGE_BY_ID = {
    tv_popcorn: "images/assets/enemy/enemy_tv_popcorn_test.png",
    choco_dryer: "images/assets/enemy/enemy_choco_dryer_test.png",
    pc_pizza: "images/assets/enemy/enemy_pc_pizza_test.png",
    phone_candy: "images/assets/enemy/enemy_smartphone_candy_test.png",
    audio_gummy: "images/assets/enemy/enemy_earphone_gummy_test.png",
    beauty_macaron: "images/assets/enemy/enemy_beauty_macaron_test.png",
    pudding_oven: "images/assets/enemy/enemy_pudding_oven_test.png",
    shavedice_aircon: "images/assets/enemy/enemy_kakigori_aircon_test.png",
    jelly_humidifier: "images/assets/enemy/enemy_jelly_humidifier_test.png",
    game_potato: "images/assets/enemy/enemy_game_potato_test.png",
    donut_washer: "images/assets/enemy/enemy_donut_washer_test.png",
    mochi_register: "images/assets/enemy/enemy_mochimochi_register_test.png",
    marshmallow_massage: "images/assets/enemy/enemy_marshmallow_massage_test.png"
  };

  const PLAYER_STAFF_BASE = [
    { id: "aa", name: "緋奈", attr: "映像", color: "#d3381c", ctMax: 2.25, skillName: "全力おすすめ！", cutin: "images/assets/cutin/cutin_hina_test.png" },
    { id: "ab", name: "藍", attr: "ドライヤー", color: "#0067c0", ctMax: 2.75, skillName: "やさしい案内", cutin: "images/assets/cutin/cutin_ai_test.png" },
    { id: "ac", name: "翠", attr: "PC", color: "#02b308", ctMax: 3.0, skillName: "最適解プレゼン", cutin: "images/assets/cutin/cutin_midori_test.png" },
    { id: "ad", name: "こがね", attr: "スマホ", color: "#fff450", ctMax: 1.85, skillName: "即決トーク", cutin: "images/assets/cutin/cutin_kogane_test.png" },
    { id: "ae", name: "琥珀", attr: "オーディオ", color: "#f68b1f", ctMax: 2.5, skillName: "フロアダッシュ", cutin: "images/assets/cutin/cutin_kohaku_test.png" },
    { id: "af", name: "真花", attr: "美容", color: "#c0c0c0", ctMax: 2.7, skillName: "お嬢様スマイル", cutin: "images/assets/cutin/cutin_manaka_test.png" },
    { id: "ag", name: "雪乃", attr: "オーブン", color: "#6495ed", ctMax: 3.0, skillName: "静かな提案", cutin: "images/assets/cutin/cutin_yukino_test.png" },
    { id: "ah", name: "美空", attr: "除湿", color: "#fffef6", ctMax: 2.45, skillName: "夏空接客", cutin: "images/assets/cutin/cutin_misora_test.png" },
    { id: "ai", name: "夜空", attr: "加湿", color: "#214a9d", ctMax: 2.75, skillName: "冬空フォーカス", cutin: "images/assets/cutin/cutin_yozora_test.png" },
    { id: "aj", name: "桃", attr: "配信", color: "#f7adc3", ctMax: 2.05, skillName: "店内配信", cutin: "images/assets/cutin/cutin_momo_test.png" },
    { id: "ak", name: "彩愛", attr: "生活", color: "#694d9f", ctMax: 2.9, skillName: "優雅な家事導線", cutin: "images/assets/cutin/cutin_ayame_test.png" },
    { id: "al", name: "里美", attr: "レジ", color: "#8d5025", ctMax: 2.95, skillName: "受付整理", cutin: "images/assets/cutin/cutin_satomi_test.png" },
    { id: "am", name: "萌", attr: "リラックス", color: "#33cc99", ctMax: 2.8, skillName: "おにいちゃん助けて", cutin: "images/assets/cutin/cutin_moe_test.png" }
  ];

  const RIVALS = [
    { id: "koharu", name: "天神 小春", short: "小春", role: "攻め", color: "#ff3b2f", stand: ASSETS.koharuStand, cutin: ASSETS.koharuCutin, actionBase: 2.25 },
    { id: "mafuyu", name: "霧島 真冬", short: "真冬", role: "妨害", color: "#6ac5ff", stand: ASSETS.mafuyuStand, cutin: ASSETS.mafuyuCutin, actionBase: 2.65 },
    { id: "natsu", name: "日向 なつ", short: "なつ", role: "誘導", color: "#ffb65c", stand: ASSETS.natsuStand, cutin: ASSETS.natsuCutin, actionBase: 2.95 }
  ];

  let root = null;
  let state = null;
  let timerId = null;
  let originalOpenBattle = null;
  let originalCloseBattle = null;
  let originalBattleProto = null;
  let lastHandledInput = { key: "", time: 0 };
  let pendingStaffTap = null;
  const STAFF_DOUBLE_TAP_MS = 280;
  const RIVAL_POWER_MULTIPLIER = 0.90; // v039_76: v039_75強化版から約10%だけビリビリ側を弱める


  let activeDeckIds = loadDeckIds();

  function loadDeckIds() {
    try {
      const saved = JSON.parse(localStorage.getItem(DECK_STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.length === 5 && saved.every((id) => PLAYER_STAFF_BASE.some((s) => s.id === id))) return saved;
    } catch (_) {}
    return DEFAULT_STAFF_IDS.slice();
  }

  function saveDeckIds(ids) {
    activeDeckIds = (Array.isArray(ids) && ids.length === 5) ? ids.slice() : DEFAULT_STAFF_IDS.slice();
    try { localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(activeDeckIds)); } catch (_) {}
  }

  function getDeckStaffBase() {
    const ids = (activeDeckIds && activeDeckIds.length === 5) ? activeDeckIds : loadDeckIds();
    const list = ids.map((id) => PLAYER_STAFF_BASE.find((s) => s.id === id)).filter(Boolean);
    return list.length === 5 ? list : DEFAULT_STAFF_IDS.map((id) => PLAYER_STAFF_BASE.find((s) => s.id === id)).filter(Boolean);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch] || ch;
    });
  }

  function nowMs() { return performance.now(); }
  function rand(min, max) { return min + Math.random() * (max - min); }
  function clamp(num, min, max) { return Math.max(min, Math.min(max, num)); }


  function inputKey(hit) {
    if (!hit) return "";
    return hit.type + ":" + String(hit.value == null ? "" : hit.value);
  }

  function markInputHandled(hit) {
    lastHandledInput = { key: inputKey(hit), time: Date.now() };
  }

  function wasInputHandledRecently(hit, ms = 420) {
    const key = inputKey(hit);
    return !!key && lastHandledInput.key === key && Date.now() - lastHandledInput.time < ms;
  }

  function findInteractiveHit(target) {
    if (!root || !target || !root.contains(target)) return null;
    const actionEl = target.closest && target.closest("[data-rival-action]");
    if (actionEl) {
      const action = actionEl.dataset.rivalAction || "";
      if (action === "deckToggle") return { type: "deck", value: actionEl.dataset.rivalDeckId || "" };
      return { type: "action", value: action };
    }
    const staffEl = target.closest && target.closest("[data-rival-staff]");
    if (staffEl) return { type: "staff", value: staffEl.dataset.rivalStaff || "" };
    const enemyEl = target.closest && target.closest("[data-rival-enemy]");
    if (enemyEl) return { type: "enemy", value: Number(enemyEl.dataset.rivalEnemy) || 0 };
    return null;
  }

  function cancelBattleInputEvent(event) {
    if (!event) return;
    if (event.cancelable !== false && typeof event.preventDefault === "function") event.preventDefault();
    if (typeof event.stopPropagation === "function") event.stopPropagation();
  }

  function clearPendingStaffTap(flush) {
    if (!pendingStaffTap) return;
    const pending = pendingStaffTap;
    pendingStaffTap = null;
    if (pending.timer) window.clearTimeout(pending.timer);
    if (flush && pending.staffId) handleStaff(pending.staffId, false);
  }

  function handleStaffTap(staffId) {
    if (!state || !state.running) return;
    const s = state.staff.find((item) => item.id === staffId);
    if (!s) return;
    const now = Date.now();

    if (pendingStaffTap && pendingStaffTap.staffId === staffId && now - pendingStaffTap.time <= STAFF_DOUBLE_TAP_MS) {
      clearPendingStaffTap(false);
      handleStaff(staffId, true);
      return;
    }

    if (pendingStaffTap) clearPendingStaffTap(true);

    if ((s.skill || 0) >= 100) {
      pendingStaffTap = {
        staffId,
        time: now,
        timer: window.setTimeout(() => {
          const pending = pendingStaffTap;
          pendingStaffTap = null;
          if (pending && pending.staffId) handleStaff(pending.staffId, false);
        }, STAFF_DOUBLE_TAP_MS)
      };
      state.lastActionText = `${s.name}：通常接客を準備中。もう一度タップで必殺技。`;
      render();
      return;
    }

    handleStaff(staffId, false);
  }

  function dispatchInteractiveHit(hit) {
    if (!hit) return;
    if (hit.type === "action") {
      if (hit.value === "start") startBattle(false);
      else if (hit.value === "auto") startBattle(true);
      else if (hit.value === "close") closeRivalBattle();
      else if (hit.value === "restart") startBattle(false);
      else if (hit.value === "help") useHelp();
      else if (hit.value === "deckEdit") openDeckEditor();
      else if (hit.value === "deckDecide") decideDeckSelection();
      else if (hit.value === "deckReset") resetDeckSelection();
      else if (hit.value === "deckCancel") cancelDeckEditor();
      return;
    }
    if (hit.type === "deck") {
      toggleDeckStaff(hit.value);
      return;
    }
    if (hit.type === "staff") {
      handleStaffTap(hit.value);
      return;
    }
    if (hit.type === "enemy" && state && state.running) {
      const id = Number(hit.value) || 0;
      state.targetEnemyId = state.targetEnemyId === id ? null : id;
      state.lastActionText = state.targetEnemyId ? "優先対応する家電星人を指定しました。" : "優先指定を解除しました。";
      render();
    }
  }

  function getBattleType(options) {
    return (options && options.battleType) ||
      (options && options.mode && options.mode.battleType) ||
      (ns.state && ns.state.currentBattleType) ||
      (ns.state && ns.state.currentSalesMode && ns.state.currentSalesMode.battleType) ||
      "normal";
  }

  function isRivalRequest(options) {
    return getBattleType(options) === "rival";
  }

  function getPlayerLevel() {
    try {
      if (!window.TenotsuGrowth || typeof window.TenotsuGrowth.getCharacterState !== "function") return 1;
      const levels = getDeckStaffBase().map((s) => window.TenotsuGrowth.getCharacterState(s.id).level || 1);
      return Math.max(1, Math.floor(levels.reduce((a, b) => a + b, 0) / Math.max(1, levels.length)));
    } catch (_) { return 1; }
  }

  function getStaff() {
    activeDeckIds = loadDeckIds();
    return getDeckStaffBase().map((item) => {
      let stats = null;
      try { stats = window.TenotsuGrowth && window.TenotsuGrowth.getComputedStats ? window.TenotsuGrowth.getComputedStats(item.id) : null; } catch (_) { stats = null; }
      const speed = stats ? Number(stats.speed || 0) : 12;
      const proposal = stats ? Number(stats.proposal || 0) : 12;
      const honesty = stats ? Number(stats.honesty || 0) : 12;
      return Object.assign({}, item, {
        ct: 0,
        skill: item.id === "aa" ? 45 : 0,
        sealedUntil: 0,
        ctMax: Math.max(1.1, item.ctMax * (1 - Math.min(0.24, speed / 280))),
        powerRate: 1 + proposal / 180,
        helpRate: 1 + honesty / 180
      });
    });
  }

  function makeRivals() {
    return RIVALS.map((r) => Object.assign({}, r, {
      actionTimer: rand(1.5, 2.8),
      skillGauge: r.id === "koharu" ? 35 : r.id === "mafuyu" ? 25 : 20,
      skillCooldown: rand(2.5, 5.5),
      lastSkillAt: 0
    }));
  }

  function defaultRewardState() {
    return { version: VERSION, applianceCoins: 0, affinity: { koharu: 0, mafuyu: 0, natsu: 0 }, updatedAt: null };
  }

  function loadRewardState() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!data || typeof data !== "object") return defaultRewardState();
      data.affinity = Object.assign({ koharu: 0, mafuyu: 0, natsu: 0 }, data.affinity || {});
      // v039_70: 旧 applianceGold は「家電星人金貨」へ名称変更。保存済みデータは互換移行する。
      const legacyGold = Math.max(0, Math.floor(Number(data.applianceGold) || 0));
      data.applianceCoins = Math.max(0, Math.floor(Number(data.applianceCoins == null ? legacyGold : data.applianceCoins) || 0));
      delete data.applianceGold;
      data.version = data.version || VERSION;
      return data;
    } catch (_) { return defaultRewardState(); }
  }

  function saveRewardState(data) {
    data.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    return data;
  }

  function addRewards(coins, affinity) {
    const data = loadRewardState();
    data.applianceCoins += Math.max(0, Math.floor(Number(coins) || 0));
    Object.keys(data.affinity).forEach((key) => {
      data.affinity[key] += Math.max(0, Math.floor(Number(affinity) || 0));
    });
    return saveRewardState(data);
  }

  function makeState(options = {}) {
    const mode = (options && options.mode) || (ns.state && ns.state.currentSalesMode) || null;
    const duration = Math.max(30, Math.floor(Number(mode && mode.duration) || BATTLE_SECONDS));
    return {
      running: false,
      finished: false,
      countingDown: false,
      resultRevealAt: 0,
      resultRevealTimer: null,
      mode,
      timeLeft: duration,
      duration,
      playerLevel: getPlayerLevel(),
      playerScore: 0,
      rivalScore: 0,
      served: 0,
      stolen: 0,
      missed: 0,
      combo: 0,
      maxCombo: 0,
      helpStock: 0,
      helpEarnCounter: 0,
      autoMode: false,
      autoTimer: 0,
      nextEnemyId: 1,
      nextHitId: 1,
      enemies: [],
      staff: getStaff(),
      rivals: makeRivals(),
      deckEdit: false,
      deckSelection: activeDeckIds.slice(),
      targetEnemyId: null,
      lastActionText: "VSビリビリ開始準備中。営業開始を押してください。",
      hitEffects: [],
      rushActive: false,
      rushTriggered: false,
      rushNoticeUntil: 0,
      cutin: null,
      cutinUntil: 0,
      surface: null,
      playerScoreRate: 1,
      playerScoreRateUntil: 0,
      rivalScoreRate: 1,
      rivalScoreRateUntil: 0,
      playerComboLockUntil: 0,
      lastTick: 0,
      rewardData: null,
      growthResults: []
    };
  }

  function ensureRoot() {
    root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.className = "rival-battle-root hidden";
      document.body.appendChild(root);
      root.addEventListener("pointerdown", handlePointer, { passive: false });
      root.addEventListener("pointerup", handlePointerRelease, { passive: false });
      root.addEventListener("touchend", handleTouchRelease, { passive: false });
      root.addEventListener("click", handleClick, { passive: false });
    }
  }

  function openRivalBattle(options = {}) {
    ensureRoot();
    stopLoop();
    state = makeState(options || {});
    root.classList.remove("hidden");
    document.body.classList.add("battle-screen", "rival-battle-screen");
    try { ns.setMode && ns.setMode("rivalBattle"); } catch (_) {}
    render();
  }

  function closeRivalBattle() {
    clearPendingStaffTap(false);
    stopLoop();
    if (state && state.resultRevealTimer) window.clearTimeout(state.resultRevealTimer);
    state = null;
    if (root) root.classList.add("hidden");
    document.body.classList.remove("battle-screen", "rival-battle-screen");
    try {
      document.dispatchEvent(new CustomEvent("tenotsu:battle:closed", { detail: { source: "RivalBattle", version: VERSION } }));
    } catch (_) {}
  }

  function startBattle(autoMode = false) {
    clearPendingStaffTap(false);
    if (!state) state = makeState();
    state = makeState({ mode: state.mode });
    state.countingDown = true;
    state.autoMode = !!autoMode;
    state.lastActionText = autoMode ? "サポートプレイでビリビリ戦を開始します。" : "VSビリビリ、開戦準備中。";
    render();
    const steps = [
      { title: "3", sub: "ビリビリ電機 来店", kind: "count", ms: 650 },
      { title: "2", sub: "星人取り合い準備", kind: "count", ms: 650 },
      { title: "1", sub: "売場オープン", kind: "count", ms: 650 },
      { title: "販売勝負 開始！", sub: autoMode ? "サポートプレイ" : "手動操作", kind: "open", ms: 780 }
    ];
    let delay = 0;
    steps.forEach((step) => {
      window.setTimeout(() => {
        if (!state || !state.countingDown) return;
        state.surface = { title: step.title, subText: step.sub, kind: step.kind };
        render();
      }, delay);
      delay += step.ms;
    });
    window.setTimeout(beginBattle, delay);
  }

  function beginBattle() {
    clearPendingStaffTap(false);
    if (!state) return;
    state.countingDown = false;
    state.running = true;
    state.finished = false;
    state.surface = null;
    state.lastTick = nowMs();
    state.lastActionText = "VSビリビリ開始！ 家電星人を先に接客してスコアを競いましょう。";
    while (state.enemies.length < getEnemyLimit()) spawnEnemy(true);
    stopLoop();
    timerId = window.setInterval(tick, 100);
    render();
  }

  function stopLoop() {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  }

  function tick() {
    if (!state || !state.running) return;
    const now = nowMs();
    const dt = Math.min(0.24, Math.max(0.05, (now - state.lastTick) / 1000));
    state.lastTick = now;
    state.timeLeft = Math.max(0, state.timeLeft - dt);
    updateTimedEffects(now);
    updateRushMode(now);
    updateStaff(dt, now);
    updateEnemies(dt, now);
    updateRivals(dt, now);
    runAuto(dt);
    updateHitEffects(now);
    maintainEnemies();
    if (state.timeLeft <= 0) finishBattle();
    render();
  }

  function updateTimedEffects(now) {
    if (state.surface && state.surface.kind === "rush" && state.rushNoticeUntil && now > state.rushNoticeUntil) {
      state.surface = null;
      state.rushNoticeUntil = 0;
    }
    if (state.playerScoreRateUntil && now > state.playerScoreRateUntil) {
      state.playerScoreRateUntil = 0;
      state.playerScoreRate = 1;
    }
    if (state.rivalScoreRateUntil && now > state.rivalScoreRateUntil) {
      state.rivalScoreRateUntil = 0;
      state.rivalScoreRate = 1;
    }
  }


  function getEnemyLimit() {
    return state && state.rushActive ? RUSH_MAX_ENEMIES : MAX_ENEMIES;
  }

  function updateRushMode(now) {
    if (!state || !state.running || state.rushTriggered) return;
    if (state.timeLeft > RUSH_START_LEFT) return;
    state.rushTriggered = true;
    state.rushActive = true;
    state.rushNoticeUntil = now + RUSH_SURFACE_MS;
    state.surface = { title: "ラッシュタイム！", subText: "家電星人が増加中", kind: "rush" };
    state.lastActionText = "ラッシュタイム！ 家電星人の来店数が増えました。ビリビリに取られる前に対応しましょう。";
    while (state.enemies.length < getEnemyLimit()) spawnEnemy(true);
  }

  function updateStaff(dt, now) {
    state.staff.forEach((s) => {
      s.ct = Math.max(0, s.ct - dt);
      if (now > (s.sealedUntil || 0)) s.sealedUntil = 0;
    });
  }

  function updateEnemies(dt, now) {
    for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
      const e = state.enemies[i];
      if (!e) continue;
      if (e.defeating) {
        e.defeatLeft -= dt;
        if (e.defeatLeft <= 0) completeEnemy(e, e.defeatByPlayer, e.defeatMatch);
        continue;
      }
      if (e.charmUntil && now > e.charmUntil) {
        rivalTakeEnemy(e, state.rivals.find((r) => r.id === e.charmedBy) || state.rivals[2], "魅了成立");
        continue;
      }
      e.patience -= dt;
      if (e.patience <= 0) {
        removeEnemy(e);
        state.missed += 1;
        state.combo = 0;
        state.lastActionText = `${e.name}が売場から離脱しました。`;
      }
    }
  }

  function maintainEnemies() {
    while (state.running && state.enemies.length < getEnemyLimit()) spawnEnemy(true);
  }

  function createEnemy() {
    let picked = null;
    if (window.TenotsuApplianceAliens && typeof window.TenotsuApplianceAliens.pickAlienInstance === "function") {
      picked = window.TenotsuApplianceAliens.pickAlienInstance({ traits: ["normal", "generous", "wavering", "big_order", "impatient", "help_lover", "rare_lover"] });
    }
    if (!picked) {
      picked = { alienId: "tv_popcorn", name: "テレビポップコーン星人", displayName: "テレビポップコーン星人", need: "映像相談", weak: "tv", hp: 2, value: 120, traitId: "normal", traitLabel: "ふつう", traitDesc: "標準的な個体。", leaveSpeed: 1, rivalPullRate: 1, helpRate: 1, comboRate: 1 };
    }
    const attr = WEAK_TO_ATTR[picked.weak] || "映像";
    const hp = Math.max(1, Math.floor(Number(picked.hp) || 2));
    const basePatience = clamp(7.2 / Math.max(0.6, Number(picked.leaveSpeed) || 1), 4.2, 9.5);
    const rare = picked.traitId === "big_order" || picked.traitId === "rare_lover" || Math.random() < 0.08;
    return {
      id: state.nextEnemyId++,
      alienId: picked.alienId || picked.id || "tv_popcorn",
      name: picked.displayName || picked.name || "家電星人",
      baseName: picked.name || "家電星人",
      trait: picked.traitLabel || "ふつう",
      traitId: picked.traitId || "normal",
      traitDesc: picked.traitDesc || "",
      attr,
      need: picked.need || attr,
      image: ALIEN_IMAGE_BY_ID[picked.alienId || picked.id] || "",
      icon: rare ? "★" : "◇",
      gauge: hp,
      maxGauge: hp,
      patience: basePatience + rand(0.2, 1.2),
      maxPatience: basePatience + 1.2,
      score: Math.max(80, Math.floor(Number(picked.value) || 120)) + (rare ? 60 : 0),
      rare,
      rivalPullRate: Number(picked.rivalPullRate) || 1,
      helpRate: Number(picked.helpRate) || 1,
      comboRate: Number(picked.comboRate) || 1,
      charmUntil: 0,
      charmedBy: null,
      defeating: false,
      defeatLeft: 0,
      defeatByPlayer: true,
      defeatMatch: false
    };
  }

  function spawnEnemy(force = false) {
    if (!state) return;
    if (!force && Math.random() < 0.25) return;
    state.enemies.push(createEnemy());
  }

  function removeEnemy(enemy) {
    state.enemies = state.enemies.filter((item) => item && item.id !== enemy.id);
    if (state.targetEnemyId === enemy.id) state.targetEnemyId = null;
  }

  function getTargetForStaff(staff) {
    if (state.targetEnemyId) {
      const selected = state.enemies.find((e) => e.id === state.targetEnemyId && !e.defeating);
      if (selected) return selected;
    }
    let best = null;
    let bestScore = -Infinity;
    state.enemies.forEach((e) => {
      if (e.defeating) return;
      const match = staff.attr === e.attr ? 120 : 0;
      const urgent = (1 - e.patience / Math.max(1, e.maxPatience)) * 70;
      const charm = e.charmUntil ? 90 : 0;
      const value = e.score / 5;
      const score = match + urgent + charm + value + (e.gauge <= 1 ? 50 : 0);
      if (score > bestScore) { best = e; bestScore = score; }
    });
    return best;
  }

  function handleStaff(staffId, forceSpecial) {
    if (!state || !state.running) return;
    const s = state.staff.find((item) => item.id === staffId);
    if (!s) return;
    const now = nowMs();
    if (s.sealedUntil && now < s.sealedUntil) {
      state.lastActionText = `${s.name}はなつの妨害で必殺封印中です。`;
      render();
      return;
    }
    if (s.ct > 0) {
      state.lastActionText = `${s.name}は準備中です。あと${s.ct.toFixed(1)}秒。`;
      render();
      return;
    }
    const enemy = getTargetForStaff(s);
    if (!enemy) {
      state.lastActionText = "対応できる家電星人がいません。";
      render();
      return;
    }
    const special = !!forceSpecial && s.skill >= 100;
    const match = s.attr === enemy.attr;
    const damage = special ? (match ? 3 : 2) : (match ? 2 : 1);
    enemy.gauge -= damage;
    s.ct = s.ctMax * (special ? 0.75 : 1);
    s.skill = special ? 0 : Math.min(100, s.skill + (match ? 28 : 16));
    addHitEffect(enemy, s.color, special ? "必殺HIT" : "HIT", damage, match ? "相性◎" : "等倍");
    if (special) showCutin(s.skillName, s.color, s.name, "ビリビリに負けない接客！", s.cutin || "");
    state.lastActionText = `${s.name}が${enemy.name}に${damage}対応 ${match ? "相性◎" : "等倍"}`;
    if (enemy.gauge <= 0) {
      enemy.gauge = 0;
      enemy.defeating = true;
      enemy.defeatLeft = 0.24;
      enemy.defeatByPlayer = true;
      enemy.defeatMatch = match;
    }
    render();
  }

  function completeEnemy(enemy, byPlayer, isMatch) {
    removeEnemy(enemy);
    if (!byPlayer) return;
    state.served += 1;
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    state.helpEarnCounter += Math.max(1, Math.round(enemy.helpRate || 1));
    while (state.helpEarnCounter >= HELP_STOCK_STEP && state.helpStock < HELP_STOCK_MAX) {
      state.helpEarnCounter -= HELP_STOCK_STEP;
      state.helpStock += 1;
    }
    const comboRate = nowMs() < state.playerComboLockUntil ? 0.45 : 1;
    const comboBonus = Math.min(2.4, 1 + state.combo * 0.04 * comboRate);
    const matchBonus = isMatch ? 1.25 : 1.0;
    const rate = state.playerScoreRate || 1;
    const point = Math.max(1, Math.round(enemy.score * comboBonus * matchBonus * rate * (enemy.comboRate || 1)));
    state.playerScore += point;
    state.lastActionText = `${enemy.name}をひだまり側で成約！ +${point}pt`;
  }

  function rivalTakeEnemy(enemy, rival, reason = "横取り") {
    if (!state || !enemy) return;
    removeEnemy(enemy);
    const r = rival || state.rivals[0];
    const point = Math.max(1, Math.round(enemy.score * 1.12 * RIVAL_POWER_MULTIPLIER * (state.rivalScoreRate || 1) * (enemy.rivalPullRate || 1)));
    state.rivalScore += point;
    state.stolen += 1;
    state.combo = 0;
    addHitEffect(enemy, r.color, "ビリビリ", point, r.short || "");
    state.lastActionText = `${r.short}が${enemy.baseName || enemy.name}を${reason}！ ビリビリ +${point}pt`;
  }

  function addHitEffect(enemy, color, text, value, subText) {
    state.hitEffects.push({ id: state.nextHitId++, enemyId: enemy.id, color, text: `${text} ${value}`, subText: subText || "", createdAt: nowMs(), life: 620 });
  }

  function updateHitEffects(now) {
    state.hitEffects = state.hitEffects.filter((fx) => now - fx.createdAt < fx.life);
  }

  function updateRivals(dt, now) {
    const level = state.playerLevel;
    state.rivals.forEach((rival) => {
      rival.actionTimer -= dt;
      rival.skillCooldown = Math.max(0, rival.skillCooldown - dt);
      rival.skillGauge = Math.min(100, rival.skillGauge + dt * RIVAL_POWER_MULTIPLIER * (7.2 + (rival.id === "koharu" ? 0.9 : rival.id === "natsu" ? 0.35 : 0.15)));
      if (rival.skillGauge >= 100 && rival.skillCooldown <= 0) {
        useRivalSkill(rival, level);
      }
      if (rival.actionTimer <= 0) {
        rival.actionTimer = rival.actionBase + rand(0.05, 0.58);
        if (Math.random() < ((state.autoMode ? 0.66 : 0.74) * RIVAL_POWER_MULTIPLIER)) rivalServeOne(rival);
      }
    });
  }

  function chooseRivalTarget() {
    let best = null;
    let bestScore = -Infinity;
    state.enemies.forEach((e) => {
      if (!e || e.defeating) return;
      const urgency = (1 - e.patience / Math.max(1, e.maxPatience)) * 80;
      const charm = e.charmUntil ? 100 : 0;
      const wavering = (e.rivalPullRate || 1) * 28;
      const value = e.score / 6;
      const score = urgency + charm + wavering + value + Math.random() * 20;
      if (score > bestScore) { bestScore = score; best = e; }
    });
    return best;
  }

  function rivalServeOne(rival) {
    const enemy = chooseRivalTarget();
    if (!enemy) return false;
    const chance = clamp((0.40 + (enemy.rivalPullRate || 1) * 0.105 + (state.rivalScoreRate > 1 ? 0.17 : 0) + (state.rushActive ? 0.055 : 0)) * RIVAL_POWER_MULTIPLIER, 0.28, 0.72);
    if (Math.random() < chance) {
      rivalTakeEnemy(enemy, rival, "接客横取り");
      return true;
    }
    enemy.patience = Math.max(0.8, enemy.patience - 0.65);
    state.lastActionText = `${rival.short}が${enemy.baseName || enemy.name}を引き寄せています。急いで対応！`;
    return false;
  }

  function useRivalSkill(rival, level) {
    const api = window.TenotsuApplianceAliens;
    let skill = null;
    if (api && typeof api.pickRandomRivalSkill === "function") skill = api.pickRandomRivalSkill(level, rival.id);
    if (!skill) return;
    rival.skillGauge = 0;
    rival.skillCooldown = Math.max(6.5, (Number(skill.cooldownSec) || 22) * 0.82);
    const now = nowMs();
    showCutin(skill.label, rival.color, rival.name, skill.desc || "", rival.cutin);

    if (skill.type === "rivalScoreBuff" || skill.type === "rivalScoreBurst") {
      state.rivalScoreRate = Math.max(state.rivalScoreRate || 1, Number(skill.scoreRate) || 1.3);
      state.rivalScoreRateUntil = now + (Number(skill.durationSec) || 6) * 1000;
      state.lastActionText = `${rival.short}：${skill.label}！ ビリビリ側スコア倍率UP。`;
    } else if (skill.type === "rivalGaugeFull") {
      state.rivals.forEach((r) => { if (r.id !== rival.id) r.skillGauge = 100; });
      state.lastActionText = `${rival.short}：${skill.label}！ ビリビリ全員の必殺ゲージが満タン。`;
    } else if (skill.type === "playerMultiplierDebuff") {
      state.playerScoreRate = Math.min(state.playerScoreRate || 1, Number(skill.playerScoreRate) || 0.85);
      state.playerScoreRateUntil = now + (Number(skill.durationSec) || 7) * 1000;
      state.lastActionText = `${rival.short}：${skill.label}！ こちらのスコア倍率DOWN。`;
    } else if (skill.type === "playerMemberRecastCancel") {
      const target = randomStaff();
      if (target) target.ct = Math.max(target.ct, target.ctMax * 1.2);
      state.lastActionText = `${rival.short}：${skill.label}！ ${target ? target.name : "メンバー"}のリキャストが戻されました。`;
    } else if (skill.type === "playerComboLock") {
      state.playerComboLockUntil = now + (Number(skill.durationSec) || 8) * 1000;
      state.lastActionText = `${rival.short}：${skill.label}！ コンボ倍率の伸びが抑えられます。`;
    } else if (skill.type === "playerMemberSkillSeal") {
      const target = randomStaff();
      if (target) target.sealedUntil = now + (Number(skill.sealSec) || 7) * 1000;
      state.lastActionText = `${rival.short}：${skill.label}！ ${target ? target.name : "メンバー"}の必殺技が封印されました。`;
    } else if (skill.type === "alienCharmCountdown") {
      const targets = state.enemies.filter((e) => !e.defeating).sort((a, b) => (b.score || 0) - (a.score || 0)).slice(0, Math.max(1, Number(skill.charmCount) || 2));
      targets.forEach((e) => { e.charmUntil = now + (Number(skill.countdownSec) || 6) * 1000; e.charmedBy = rival.id; });
      state.lastActionText = `${rival.short}：${skill.label}！ ${targets.length}体がビリビリ側へ迷っています。`;
    } else if (skill.type === "playerHelpReset") {
      if (state.helpStock > 0 || state.helpEarnCounter > 0) {
        state.helpStock = 0;
        state.helpEarnCounter = 0;
        state.lastActionText = `${rival.short}：${skill.label}！ 店長HELPがリセットされました。`;
      } else {
        state.lastActionText = `${rival.short}：${skill.label}！ でも店長HELPはまだ空でした。`;
      }
    } else {
      state.lastActionText = `${rival.short}：${skill.label}！`;
    }
  }

  function randomStaff() {
    const alive = state.staff.filter(Boolean);
    return alive[Math.floor(Math.random() * alive.length)] || null;
  }

  function runAuto(dt) {
    if (!state || !state.running || !state.autoMode) return;
    state.autoTimer -= dt;
    if (state.autoTimer > 0) return;
    const ready = state.staff.filter((s) => s.ct <= 0 && !(s.sealedUntil && nowMs() < s.sealedUntil));
    const staff = ready.sort((a, b) => b.skill - a.skill)[0];
    if (staff) handleStaff(staff.id, false);
    state.autoTimer = staff ? 1.05 : 0.28;
  }

  function useHelp() {
    if (!state || !state.running) return;
    if (state.helpStock <= 0) {
      state.lastActionText = "店長HELP準備中。家電星人を成約すると溜まります。";
      render();
      return;
    }
    state.helpStock -= 1;
    showCutin("店長HELP！", "#ffe06a", "店長出動", "迷っている家電星人をひだまり側へ呼び戻します。", "");
    const targets = state.enemies.filter((e) => !e.defeating).slice(0, 2);
    targets.forEach((e) => {
      e.charmUntil = 0;
      e.charmedBy = null;
      e.gauge = Math.max(0, e.gauge - 2);
      if (e.gauge <= 0) {
        e.defeating = true;
        e.defeatLeft = 0.18;
        e.defeatByPlayer = true;
        e.defeatMatch = true;
      }
    });
    state.staff.forEach((s) => { s.ct = Math.min(s.ct, 0.1); });
    state.lastActionText = `店長HELP！ ${targets.length}体を呼び戻して即対応。`;
    render();
  }

  function finishBattle() {
    clearPendingStaffTap(false);
    if (!state || state.finished) return;
    state.running = false;
    state.finished = true;
    stopLoop();
    const win = state.playerScore >= state.rivalScore;
    const draw = state.playerScore === state.rivalScore;
    const coins = Math.max(5, Math.floor(state.served * 5 + state.maxCombo * 2 + (win ? 24 : 8) + (draw ? 8 : 0)));
    const affinity = Math.max(1, Math.floor(state.served * 0.8 + (win ? 8 : 3)));
    const rewardState = addRewards(coins, affinity);
    const exp = win ? 120 : 80;
    const partyIds = state.staff.map((s) => s.id);
    const growthResults = (window.TenotsuGrowth && typeof window.TenotsuGrowth.addExpToParty === "function")
      ? window.TenotsuGrowth.addExpToParty(partyIds, exp, "VSビリビリ")
      : [];
    state.rewardData = { win, draw, coins, affinity, rewardState, exp };
    state.growthResults = growthResults || [];
    state.resultRevealAt = Date.now() + 3000;
    state.surface = { title: "販売勝負終了", subText: win ? "ひだまりストア勝利！" : draw ? "引き分け" : "ビリビリ電機に惜敗", kind: "ending" };
    state.lastActionText = `販売勝負終了：ひだまり ${state.playerScore} / ビリビリ ${state.rivalScore}`;
    if (state.resultRevealTimer) window.clearTimeout(state.resultRevealTimer);
    state.resultRevealTimer = window.setTimeout(() => {
      if (!state || !state.finished) return;
      state.resultRevealAt = 0;
      state.surface = null;
      render();
    }, 3000);
    render();
  }

  function showCutin(title, color, subText, descText, image) {
    if (!state) return;
    const now = nowMs();
    state.cutin = { title, color, subText, descText, image, createdAt: now, life: 1800 };
    state.cutinUntil = now + 1800;
  }

  function handlePointer(event) {
    const hit = findInteractiveHit(event.target);
    if (!hit) return;
    cancelBattleInputEvent(event);
  }

  function handlePointerRelease(event) {
    const hit = findInteractiveHit(event.target);
    if (!hit) return;
    cancelBattleInputEvent(event);
    if (wasInputHandledRecently(hit, hit.type === "staff" ? 70 : 260)) return;
    markInputHandled(hit);
    dispatchInteractiveHit(hit);
  }

  function handleTouchRelease(event) {
    const hit = findInteractiveHit(event.target);
    if (!hit) return;
    cancelBattleInputEvent(event);
    if (wasInputHandledRecently(hit, hit.type === "staff" ? 90 : 360)) return;
    markInputHandled(hit);
    dispatchInteractiveHit(hit);
  }

  function handleClick(event) {
    const hit = findInteractiveHit(event.target);
    if (!hit) return;
    cancelBattleInputEvent(event);
    if (wasInputHandledRecently(hit, 520)) return;
    markInputHandled(hit);
    dispatchInteractiveHit(hit);
  }

  function render() {
    if (!root || !state) return;
    const status = state.running ? "販売勝負中" : state.finished ? "勝負終了" : state.countingDown ? "開戦準備中" : "待機中";
    root.innerHTML = `
      <div class="rival-battle-stage ${state.running ? "is-running" : ""} ${state.finished ? "is-finished" : ""} ${state.rushActive ? "is-rush" : ""}">
        <section class="rival-hud">
          <div class="rival-hud-title">ビリビリバトル：VS CPU <span>${VERSION}</span></div>
          <div class="rival-hud-stats">
            <span>状態：<b>${status}</b></span>
            <span>残り：<b>${Math.ceil(state.timeLeft)}</b>秒</span>
            <span>ひだまり：<b>${state.playerScore}</b></span>
            <span>ビリビリ：<b>${state.rivalScore}</b></span>
            <span>成約：<b>${state.served}</b></span>
            <span>横取り：<b>${state.stolen}</b></span>
            <span>コンボ：<b>${state.combo}</b></span>
            <span class="rival-rush-stat">ラッシュ：<b>${state.rushActive ? "発動中" : "待機"}</b></span>
          </div>
          <div class="rival-message">${escapeHtml(state.lastActionText)}</div>
        </section>
        ${renderRivalCards()}
        ${renderCutin()}
        ${renderSurface()}
        ${renderEnemyArea()}
        ${renderHelpButtons()}
        ${renderStaffArea()}
        ${state.running || state.countingDown ? "" : renderControl()}
      </div>
    `;
  }

  function renderRivalCards() {
    return `<section class="rival-cpu-row">${state.rivals.map((r) => {
      const gauge = Math.max(0, Math.min(100, r.skillGauge || 0));
      return `
        <article class="rival-cpu-card" style="--rival-color:${r.color}">
          <img src="${escapeHtml(r.stand)}" alt="${escapeHtml(r.name)}">
          <div class="rival-cpu-info"><b>${escapeHtml(r.short)}</b><small>${escapeHtml(r.role)} / 必殺 ${Math.floor(gauge)}%</small><i><span style="width:${gauge}%"></span></i></div>
        </article>
      `;
    }).join("")}</section>`;
  }

  function renderEnemyArea() {
    return `<section class="rival-enemy-row">${state.enemies.map(renderEnemy).join("")}</section>`;
  }

  function renderEnemy(e) {
    const gaugeRate = Math.max(0, Math.min(100, (e.gauge / Math.max(1, e.maxGauge)) * 100));
    const patienceRate = Math.max(0, Math.min(100, (e.patience / Math.max(1, e.maxPatience)) * 100));
    const selected = state.targetEnemyId === e.id;
    const color = ATTR_COLORS[e.attr] || "#ff8844";
    const charmLeft = e.charmUntil ? Math.max(0, (e.charmUntil - nowMs()) / 1000) : 0;
    return `
      <article class="rival-enemy-card ${selected ? "selected" : ""} ${e.rare ? "rare" : ""} ${e.charmUntil ? "charmed" : ""}" data-rival-enemy="${e.id}" style="--enemy-color:${color}">
        <div class="rival-enemy-head"><span>${escapeHtml(e.icon)}</span><b>${escapeHtml(e.baseName || e.name)}</b>${e.rare ? "<em>高価</em>" : ""}</div>
        ${e.image ? `<div class="rival-enemy-art"><img src="${escapeHtml(e.image)}" alt=""></div>` : ""}
        <div class="rival-enemy-meta">${escapeHtml(e.attr)} / 特性：${escapeHtml(e.trait)}</div>
        ${charmLeft > 0 ? `<div class="rival-charm-count">なつ誘導 ${charmLeft.toFixed(1)}秒</div>` : ""}
        <label>対応HP</label><div class="rival-bar"><i style="width:${gaugeRate}%"></i></div>
        <label>残り受付</label><div class="rival-bar patience"><i style="width:${patienceRate}%"></i></div>
        ${renderHitEffects(e.id)}
      </article>
    `;
  }

  function renderHitEffects(enemyId) {
    return state.hitEffects.filter((fx) => fx.enemyId === enemyId).map((fx) => {
      const age = nowMs() - fx.createdAt;
      const y = -20 - age / 18;
      const opacity = Math.max(0, 1 - age / fx.life);
      return `<span class="rival-hit" style="--hit-color:${fx.color}; transform:translateY(${y}px); opacity:${opacity}"><b>${escapeHtml(fx.text)}</b><small>${escapeHtml(fx.subText)}</small></span>`;
    }).join("");
  }

  function renderHelpButtons() {
    const buttons = Array.from({ length: HELP_STOCK_MAX }, (_, i) => {
      const available = state.running && i < state.helpStock;
      return `<button class="rival-help-btn ${available ? "available" : "empty"}" data-rival-action="help">HELP!</button>`;
    }).join("");
    return `<section class="rival-help-row">${buttons}</section>`;
  }

  function renderStaffArea() {
    return `<section class="rival-staff-row">${state.staff.map((s) => {
      const ctRate = Math.max(0, Math.min(100, (1 - s.ct / Math.max(0.1, s.ctMax)) * 100));
      const skillRate = Math.max(0, Math.min(100, s.skill || 0));
      const sealed = s.sealedUntil && nowMs() < s.sealedUntil;
      const specialReady = skillRate >= 100 && s.ct <= 0 && !sealed;
      return `
        <button class="rival-staff-card ${s.ct > 0 ? "cooling" : "ready"} ${sealed ? "sealed" : ""} ${specialReady ? "special-ready skill-ready" : ""}" data-rival-staff="${escapeHtml(s.id)}" style="--staff-color:${s.color}">
          <b>${escapeHtml(s.name)}</b><span>${escapeHtml(s.attr)}</span><small>${sealed ? "封印中" : s.ct > 0 ? `CT ${s.ct.toFixed(1)}秒` : "対応OK"}</small>
          <div class="rival-bar"><i style="width:${ctRate}%"></i></div>
          <em>必殺 ${Math.floor(skillRate)}% / 2回タップ</em><div class="rival-bar skill"><i style="width:${skillRate}%"></i></div>
        </button>
      `;
    }).join("")}</section>`;
  }


  function renderDeckEditorOverlay() {
    const selected = state.deckSelection || [];
    const canDecide = selected.length === 5;
    const row1 = ["aa", "ab", "ac", "ad", "ae"];
    const row2 = ["af", "ag", "ah", "ai", "aj"];
    const row3 = ["ak", "al", "am"];
    return `
      <section class="rival-control-overlay rival-deck-overlay">
        <div class="rival-deck-box">
          <div class="rival-control-title">デッキ編成</div>
          <p class="rival-control-help">VSビリビリへ出撃するひだまりメンバーを5人選択してください。選択数：${selected.length}/5</p>
          <div class="rival-deck-select-grid">
            <div class="rival-deck-select-row">${row1.map(renderDeckSelectCard).join("")}</div>
            <div class="rival-deck-select-row">${row2.map(renderDeckSelectCard).join("")}</div>
            <div class="rival-deck-select-row rival-deck-select-bottom">
              ${row3.map(renderDeckSelectCard).join("")}
              <div class="rival-deck-decision-area">
                <button class="rival-deck-decision-main" data-rival-action="deckDecide" ${canDecide ? "" : "disabled"}>決定</button>
                <div class="rival-deck-small-buttons">
                  <button data-rival-action="deckReset">初期編成</button>
                  <button data-rival-action="deckCancel">キャンセル</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderDeckSelectCard(staffId) {
    const s = PLAYER_STAFF_BASE.find((item) => item.id === staffId);
    if (!s) return "";
    const selected = state.deckSelection && state.deckSelection.includes(staffId);
    const order = selected ? state.deckSelection.indexOf(staffId) + 1 : "";
    return `
      <button class="rival-deck-select-card ${selected ? "selected" : ""}" style="--staff-color:${s.color};" data-rival-action="deckToggle" data-rival-deck-id="${escapeHtml(s.id)}">
        <span class="rival-deck-order">${order}</span>
        <b>${escapeHtml(s.name)}</b>
        <small>${escapeHtml(s.attr)}</small>
        <em>${escapeHtml(s.skillName)}</em>
      </button>`;
  }

  function openDeckEditor() {
    if (!state || state.running) return;
    activeDeckIds = loadDeckIds();
    state.deckEdit = true;
    state.deckSelection = activeDeckIds.slice();
    state.lastActionText = "VSビリビリ用デッキを編成します。";
    render();
  }

  function toggleDeckStaff(staffId) {
    if (!state || !state.deckEdit || !staffId) return;
    const selected = state.deckSelection || [];
    if (selected.includes(staffId)) {
      state.deckSelection = selected.filter((id) => id !== staffId);
    } else if (selected.length < 5) {
      state.deckSelection = selected.concat(staffId);
    } else {
      state.lastActionText = "デッキは5人までです。入れ替える場合は先に誰かを外してください。";
    }
    render();
  }

  function decideDeckSelection() {
    if (!state || !state.deckEdit) return;
    if (!state.deckSelection || state.deckSelection.length !== 5) {
      state.lastActionText = "メンバーを5人選ぶと決定できます。";
      render();
      return;
    }
    saveDeckIds(state.deckSelection);
    state.staff = getStaff();
    state.deckEdit = false;
    state.lastActionText = `デッキを更新しました：${state.staff.map((s) => s.name).join(" / ")}`;
    render();
  }

  function resetDeckSelection() {
    if (!state || !state.deckEdit) return;
    state.deckSelection = DEFAULT_STAFF_IDS.slice();
    render();
  }

  function cancelDeckEditor() {
    if (!state || !state.deckEdit) return;
    state.deckEdit = false;
    state.deckSelection = activeDeckIds.slice();
    render();
  }

  function renderControl() {
    if (state.deckEdit) return renderDeckEditorOverlay();
    if (state.finished && state.resultRevealAt && Date.now() < state.resultRevealAt) return renderEndingDeclaration();
    if (state.finished) return renderResult();
    return `
      <section class="rival-control-overlay">
        <div class="rival-control-card rival-start-card">
          <div class="rival-eyecatch"><img src="${escapeHtml(ASSETS.eyecatch)}" alt=""></div>
          <div class="rival-control-title">VSビリビリ 販売勝負</div>
          <p>家電星人をひだまり側へ先に案内し、ビリビリ電機より高いスコアを狙います。</p>
          <div class="rival-rule-grid"><span>消費</span><b>BP 1</b><span>報酬</span><b>家電星人金貨 / 親愛度</b><span>難度</span><b>手動なら勝ちやすいCPU戦</b></div>
          <div class="rival-control-buttons">
            <button data-rival-action="start">販売勝負開始</button>
            <button data-rival-action="auto">サポートプレイ</button>
            <button data-rival-action="deckEdit">デッキ編成</button>
            <button data-rival-action="close">戻る</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderEndingDeclaration() {
    return `
      <section class="rival-control-overlay rival-ending-overlay">
        <div class="rival-ending-card">
          <small>VSビリビリ</small>
          <b>販売勝負終了</b>
          <span>ひだまり ${state.playerScore} / ビリビリ ${state.rivalScore}</span>
        </div>
      </section>
    `;
  }

  function renderResult() {
    const reward = state.rewardData || { win: false, draw: false, coins: 0, affinity: 0, exp: 0 };
    const title = reward.win ? "ひだまりストア勝利！" : reward.draw ? "引き分け" : "ビリビリ電機に惜敗";
    return `
      <section class="rival-control-overlay">
        <div class="rival-control-card rival-result-card">
          <div class="rival-control-title">${escapeHtml(title)}</div>
          <div class="rival-result-grid">
            <div><span>ひだまり</span><b>${state.playerScore}</b></div>
            <div><span>ビリビリ</span><b>${state.rivalScore}</b></div>
            <div><span>成約</span><b>${state.served}</b></div>
            <div><span>横取り</span><b>${state.stolen}</b></div>
            <div><span>家電星人金貨</span><b>+${reward.coins}</b></div>
            <div><span>親愛度</span><b>+${reward.affinity}</b></div>
            <div><span>EXP</span><b>+${reward.exp}</b></div>
          </div>
          <div class="rival-result-note">家電星人金貨は都市鉱山由来の排出物として扱い、今後の交換・親愛度導線へ接続予定です。</div>
          <div class="rival-control-buttons">
            <button data-rival-action="restart">もう一度</button>
            <button data-rival-action="auto">サポートで再戦</button>
            <button data-rival-action="deckEdit">デッキ編成</button>
            <button data-rival-action="close">戻る</button>
          </div>
        </div>
      </section>
    `;
  }

  function renderSurface() {
    if (!state.surface) return "";
    return `<div class="rival-surface ${escapeHtml(state.surface.kind || "notice")}"><div><small>${escapeHtml(state.surface.subText || "")}</small><b>${escapeHtml(state.surface.title || "")}</b></div></div>`;
  }

  function renderCutin() {
    if (!state.cutin) return "";
    const now = nowMs();
    if (now > state.cutinUntil) return "";
    const progress = Math.max(0, Math.min(1, (now - state.cutin.createdAt) / state.cutin.life));
    const opacity = progress < 0.82 ? 1 : Math.max(0, 1 - (progress - 0.82) / 0.18);
    return `
      <div class="rival-cutin-layer" style="--cutin-color:${state.cutin.color}; opacity:${opacity}">
        <div class="rival-cutin-text"><small>${escapeHtml(state.cutin.subText || "")}</small><b>${escapeHtml(state.cutin.title || "")}</b><p>${escapeHtml(state.cutin.descText || "")}</p></div>
        ${state.cutin.image ? `<div class="rival-cutin-image"><img src="${escapeHtml(state.cutin.image)}" alt=""></div>` : ""}
      </div>
    `;
  }

  function installPatch() {
    if (!window.BattleProto || window.BattleProto.__rivalBattlePatchedV69) return false;
    originalBattleProto = window.BattleProto;
    originalOpenBattle = window.BattleProto.openBattle;
    originalCloseBattle = window.BattleProto.closeBattle;
    window.BattleProto.openBattle = function (options) {
      if (isRivalRequest(options)) return openRivalBattle(options || {});
      return originalOpenBattle.apply(this, arguments);
    };
    window.BattleProto.closeBattle = function () {
      if (state) return closeRivalBattle();
      return originalCloseBattle.apply(this, arguments);
    };
    window.BattleProto.__rivalBattlePatchedV69 = true;
    window.TenotsuRivalBattle = api;
    return true;
  }

  const api = {
    VERSION,
    open: openRivalBattle,
    close: closeRivalBattle,
    start: startBattle,
    getState: () => state,
    getRewards: loadRewardState
  };

  window.TenotsuRivalBattle = api;
  if (!installPatch()) {
    const id = window.setInterval(() => {
      if (installPatch()) window.clearInterval(id);
    }, 120);
    window.setTimeout(() => window.clearInterval(id), 5000);
  }
})();
