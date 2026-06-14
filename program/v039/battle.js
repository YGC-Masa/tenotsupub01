// battle.js - v037 integrated deck battle prototype
// 店舗営業：上=情報 / 中央=家電星人 / 下=メンバー5人
// 操作はメンバーのシングルタップで通常接客、ダブルタップで必殺接客。通常敵HP2、レアHP3。ターゲットは選択メンバーに最適な家電星人へ自動Fix。彩愛の必殺は盤面整理＋敵チェンジ短縮。店長HELP・必殺カットイン・タイムセール演出あり。

(function () {
  const BATTLE_VERSION = "v039_63";
  const BATTLE_SECONDS = 30;
  const TIME_SALE_SECONDS = 15;
  const MAX_ENEMIES = 3;
  const CHANGE_SECONDS = 2.0;
  const CHANGE_SECONDS_BUFFED = 1.0;
  const AUTO_ACTION_INTERVAL = 0.75;
  const AUTO_CT_MULTIPLIER = 2.0; // オート営業ペナルティ：自動操作時のみCT2倍
  const AUTO_SCORE_MULTIPLIER = 0.7; // オート営業ペナルティ：自動成約の売上70%
  const HELP_STOCK_MAX = 3;
  const HELP_STOCK_STEP = 10;
  const HELP_INPUT_LOCK_MS = 320;
  const HELP_EMPTY_MESSAGE_LOCK_MS = 520;
  const CHANGE_MESSAGES = [
    "今回は別スタッフへ案内",
    "少々お待ちください",
    "別のお客様を先に対応"
  ];


  
  
  const MANAGER_EXP_STORAGE_KEY = "tenotsu_manager_exp_v1";

  function loadManagerExpData() {
    try { return JSON.parse(localStorage.getItem(MANAGER_EXP_STORAGE_KEY) || "{}"); }
    catch (_) { return {}; }
  }

  function calcManagerLevelFromExp(totalExp) {
    const exp = Math.max(0, Math.floor(Number(totalExp) || 0));
    let level = 1;
    let used = 0;
    for (let lv = 1; lv < 60; lv++) {
      const need = Math.floor(140 + 22 * Math.pow(lv - 1, 1.45));
      if (used + need > exp) break;
      used += need;
      level = lv + 1;
    }
    return level;
  }

  function addManagerExp(amount, source = "店舗営業") {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    const data = loadManagerExpData();
    data.totalExp = Math.max(0, Math.floor(Number(data.totalExp) || 0)) + value;
    data.level = calcManagerLevelFromExp(data.totalExp);
    data.updatedAt = new Date().toISOString();
    data.history = Array.isArray(data.history) ? data.history : [];
    data.history.unshift({ source, exp: value, at: data.updatedAt });
    data.history = data.history.slice(0, 30);
    try { localStorage.setItem(MANAGER_EXP_STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    return data;
  }


const ECONOMY_STORAGE_KEY = "tenotsu_economy_v1";
  const ALBUM_STORAGE_KEY = "tenotsu_album_v1";

  function loadEconomy() {
    try { return JSON.parse(localStorage.getItem(ECONOMY_STORAGE_KEY) || "{}"); }
    catch (_) { return {}; }
  }

  function saveEconomy(data) {
    try { localStorage.setItem(ECONOMY_STORAGE_KEY, JSON.stringify(data)); }
    catch (_) {}
  }

  function unlockAlbumMemory(id, title, text) {
    try {
      const data = JSON.parse(localStorage.getItem(ALBUM_STORAGE_KEY) || "{}");
      data.memories = Array.isArray(data.memories) ? data.memories : [];
      if (!data.memories.some(m => m.id === id)) {
        data.memories.unshift({ id, title, text, at: new Date().toISOString() });
        localStorage.setItem(ALBUM_STORAGE_KEY, JSON.stringify(data));
      }
    } catch (_) {}
  }

  function addSalesToEconomy(amount, source = "店舗営業") {
    const value = Math.max(0, Math.floor(Number(amount) || 0));
    const data = loadEconomy();
    data.totalSales = Math.max(0, Math.floor(Number(data.totalSales) || 0)) + value;
    data.availableSales = Math.max(0, Math.floor(Number(data.availableSales) || 0)) + value;
    data.battleCount = Math.max(0, Math.floor(Number(data.battleCount) || 0)) + 1;
    data.lastSales = value;
    data.updatedAt = new Date().toISOString();
    data.history = Array.isArray(data.history) ? data.history : [];
    data.history.unshift({ type: "sales", source, amount: value, at: data.updatedAt });
    data.history = data.history.slice(0, 30);
    saveEconomy(data);
    unlockAlbumMemory("battle_first_sales", "はじめての店舗営業", "店舗営業で売上を記録しました。");
    return data;
  }

  window.TenotsuEconomy = window.TenotsuEconomy || {};
  window.TenotsuEconomy.load = loadEconomy;
  window.TenotsuEconomy.save = saveEconomy;
  window.TenotsuEconomy.addSales = addSalesToEconomy;
  window.TenotsuEconomy.unlockMemory = unlockAlbumMemory;


const battleBackgrounds = {
    hidamari_store_battle_lv1: {
      label: "ひだまりストア通常営業 Lv1",
      path: "images/assets/bg/battle_store_lv1.png"
    }
  };
  const DEFAULT_BATTLE_BG_ID = "hidamari_store_battle_lv1";

  function getBattleBackground(id = DEFAULT_BATTLE_BG_ID) {
    return battleBackgrounds[id] || battleBackgrounds[DEFAULT_BATTLE_BG_ID];
  }

  const staffMaster = [
    { id: "aa", name: "緋奈", color: "#d3381c", attr: "映像", power: 1, ctMax: 2.4, skillName: "全力おすすめ！", skillType: "powerBuff", skillDesc: "8秒間、接客力アップ。成約を一気に伸ばします。" , cardImage: "images/assets/character/card_hina_test.png", cutinImage: "images/assets/cutin/cutin_hina_test.png", skillCutin: "images/assets/cutin/cutin_hina_test.png"},
    { id: "ab", name: "藍", color: "#0067C0", attr: "ドライヤー", power: 1, ctMax: 3.0, skillName: "やさしい案内", skillType: "extendTime", skillDesc: "全敵の受付時間を延長し、営業残り時間も少し増やします。" , cardImage: "images/assets/character/card_ai_test.png", cutinImage: "images/assets/cutin/cutin_ai_test.png", skillCutin: "images/assets/cutin/cutin_ai_test.png"},
    { id: "ac", name: "翠", color: "#02b308", attr: "PC", power: 1, ctMax: 3.5, skillName: "最適解プレゼン", skillType: "pcSweep", skillDesc: "PC属性をまとめて成約し、6秒間マッチ性能を上げます。" , cardImage: "images/assets/character/card_midori_test.png", cutinImage: "images/assets/cutin/cutin_midori_test.png", skillCutin: "images/assets/cutin/cutin_midori_test.png"},
    { id: "ad", name: "こがね", color: "#FFF450", attr: "スマホ", power: 1, ctMax: 1.7, skillName: "即決トーク", skillType: "ctReduce", skillDesc: "全メンバーのCTを短縮し、6秒間テンポを上げます。" , cardImage: "images/assets/character/card_kogane_test.png", cutinImage: "images/assets/cutin/cutin_kogane_test.png", skillCutin: "images/assets/cutin/cutin_kogane_test.png"},
    { id: "ae", name: "琥珀", color: "#F68B1F", attr: "オーディオ", power: 1, ctMax: 2.7, skillName: "フロアダッシュ", skillType: "rushBuff", skillDesc: "8秒間ラッシュ対応力アップ。コンボを守りやすくします。" , cardImage: "images/assets/character/card_kohaku_test.png", cutinImage: "images/assets/cutin/cutin_kohaku_test.png", skillCutin: "images/assets/cutin/cutin_kohaku_test.png"},
    { id: "af", name: "真花", color: "#C0C0C0", attr: "美容", power: 1, ctMax: 2.8, skillName: "お嬢様スマイル", skillType: "comboPlus", skillDesc: "成約時のコンボ補助。丁寧な接客で満足度を伸ばします。" , cardImage: "images/assets/character/card_manaka_test.png", cutinImage: "images/assets/cutin/cutin_manaka_test.png", skillCutin: "images/assets/cutin/cutin_manaka_test.png"},
    { id: "ag", name: "雪乃", color: "#6495ED", attr: "調理", power: 1, ctMax: 3.2, skillName: "静かな提案", skillType: "freezeTime", skillDesc: "敵の受付時間を一時停止し、店内を落ち着かせます。" , cardImage: "images/assets/character/card_yukino_test.png", cutinImage: "images/assets/cutin/cutin_yukino_test.png", skillCutin: "images/assets/cutin/cutin_yukino_test.png"},
    { id: "ah", name: "美空", color: "#fffef6", attr: "除湿", power: 1, ctMax: 2.6, skillName: "夏空接客", skillType: "rescue", skillDesc: "受付時間が短い敵を追加フォローする安定型スキル。" , cardImage: "images/assets/character/card_misora_test.png", cutinImage: "images/assets/cutin/cutin_misora_test.png", skillCutin: "images/assets/cutin/cutin_misora_test.png"},
    { id: "ai", name: "夜空", color: "#00152d", attr: "加湿", power: 1, ctMax: 2.9, skillName: "冬空フォーカス", skillType: "rareKiller", skillDesc: "レア敵への追加ダメージで一点突破します。" , cardImage: "images/assets/character/card_yozora_test.png", cutinImage: "images/assets/cutin/cutin_yozora_test.png", skillCutin: "images/assets/cutin/cutin_yozora_test.png"},
    { id: "aj", name: "桃", color: "#F7ADC3", attr: "配信", power: 1, ctMax: 2.1, skillName: "店内配信", skillType: "buzz", skillDesc: "売上とレア出現率を上げる代わりに混雑しやすくなります。" , cardImage: "images/assets/character/card_momo_test.png", cutinImage: "images/assets/cutin/cutin_momo_test.png", skillCutin: "images/assets/cutin/cutin_momo_test.png"},
    { id: "ak", name: "彩愛", color: "#694D9F", attr: "生活", power: 1, ctMax: 3.0, skillName: "優雅な家事導線", skillType: "ayameRoute", skillDesc: "敵最大2体に1ダメージ。6秒間、敵チェンジを2秒から1秒に短縮。" , cardImage: "images/assets/character/card_ayame_test.png", cutinImage: "images/assets/cutin/cutin_ayame_test.png", skillCutin: "images/assets/cutin/cutin_ayame_test.png"},
    { id: "al", name: "里美", color: "#8d5025", attr: "事務", power: 1, ctMax: 3.1, skillName: "受付整理", skillType: "changeSupport", skillDesc: "受付を整理して、チェンジやCT管理を補助します。" , cardImage: "images/assets/character/card_satomi_test.png", cutinImage: "images/assets/cutin/cutin_satomi_test.png", skillCutin: "images/assets/cutin/cutin_satomi_test.png"},
    { id: "am", name: "萌", color: "#33CC99", attr: "リラックス", power: 1, ctMax: 2.9, skillName: "おにいちゃん助けて", skillType: "managerBoost", skillDesc: "店長ヘルプゲージが溜まりやすくなるサポートスキル。" , cardImage: "images/assets/character/card_moe_test.png", cutinImage: "images/assets/cutin/cutin_moe_test.png", skillCutin: "images/assets/cutin/cutin_moe_test.png"}
  ];  const DEFAULT_STAFF_IDS = ["aa", "ab", "ac", "ad", "ae"];
  const DECK_STORAGE_KEY = "tenotsu_battle_deck_v1";
  let activeStaffIds = loadDeckIds();

  function loadDeckIds() {
    try {
      const saved = JSON.parse(localStorage.getItem(DECK_STORAGE_KEY) || "null");
      if (Array.isArray(saved) && saved.length === 5 && saved.every(id => staffMaster.some(s => s.id === id))) {
        return saved;
      }
    } catch (e) {}
    return [...DEFAULT_STAFF_IDS];
  }

  function saveDeckIds(ids) {
    activeStaffIds = [...ids];
    try { localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(activeStaffIds)); } catch (e) {}
  }

  function getStaffBase() {
    return activeStaffIds.map(id => staffMaster.find(s => s.id === id)).filter(Boolean);
  }


  const attrColors = {
    "映像": "#d3381c",
    "ドライヤー": "#0067C0",
    "PC": "#02b308",
    "スマホ": "#FFF450",
    "オーディオ": "#F68B1F",
    "美容": "#C0C0C0",
    "調理": "#6495ED",
    "除湿": "#fffef6",
    "加湿": "#00152d",
    "配信": "#F7ADC3",
    "生活": "#694D9F",
    "事務": "#8d5025",
    "季節": "#33CC99"
  };
  const enemyTypes = [
    { attr: "映像", icon: "📺", name: "テレビポップコーン星人", text: "映画みたいに楽しみたい！", baseGauge: 2, basePatience: 6.8, score: 120, image: "images/assets/enemy/enemy_tv_popcorn_test.png" },
    { attr: "ドライヤー", icon: "🍫", name: "チョコドライヤ星人", text: "あったか〜いチョコ風でうるおいを〜！", baseGauge: 2, basePatience: 7.3, score: 125, image: "images/assets/enemy/enemy_choco_dryer_test.png" },
    { attr: "PC", icon: "🍕", name: "パソコンピザ星人", text: "処理が重い…チーズ追加！", baseGauge: 2, basePatience: 7.8, score: 150, image: "images/assets/enemy/enemy_pc_pizza_test.png" },
    { attr: "スマホ", icon: "🍬", name: "スマホキャンディ星人", text: "通知だよ〜！キャンディどうぞ〜", baseGauge: 2, basePatience: 6.5, score: 130, image: "images/assets/enemy/enemy_smartphone_candy_test.png" },
    { attr: "オーディオ", icon: "🍬", name: "イヤホングミ星人", text: "よーし！きょうもリズムにのるぞ〜！", baseGauge: 2, basePatience: 7.1, score: 135, image: "images/assets/enemy/enemy_earphone_gummy_test.png" },
    { attr: "美容", icon: "🪞", name: "ビューティマカロン星人", text: "きれいはこれから…ふふっ", baseGauge: 2, basePatience: 7.0, score: 130, image: "images/assets/enemy/enemy_beauty_macaron_test.png" },
    { attr: "オーブン", icon: "🍮", name: "プリンオーブン星人", text: "ふんわり、とろ〜り焼き上げ中…", baseGauge: 2, basePatience: 7.2, score: 140, image: "images/assets/enemy/enemy_pudding_oven_test.png" },
    { attr: "除湿", icon: "🍧", name: "カキゴーリエアコン星人", text: "つめた〜い風、さらさらでお願い！", baseGauge: 2, basePatience: 6.1, score: 118, image: "images/assets/enemy/enemy_kakigori_aircon_test.png" },
    { attr: "加湿", icon: "💧", name: "ゼリーカシツ星人", text: "うるおい、ふわっとおとどけします…", baseGauge: 2, basePatience: 6.3, score: 120, image: "images/assets/enemy/enemy_jelly_humidifier_test.png" },
    { attr: "配信", icon: "🍟", name: "ゲームポテト星人", text: "レベルUP！まだまだいける〜！", baseGauge: 2, basePatience: 5.9, score: 145, image: "images/assets/enemy/enemy_game_potato_test.png" },
    { attr: "生活", icon: "🍩", name: "ドーナツセンタク星人", text: "ぐるぐる回って、ピカピカにするよ！", baseGauge: 2, basePatience: 6.4, score: 130, image: "images/assets/enemy/enemy_donut_washer_test.png" },
    { attr: "レジ", icon: "🍡", name: "モチモチレジスター星人", text: "いらっしゃいませ！お会計いきま〜す", baseGauge: 2, basePatience: 6.4, score: 128, image: "images/assets/enemy/enemy_mochimochi_register_test.png" },
    { attr: "リラックス", icon: "☁️", name: "マシュマロマッサージ星人", text: "ふわふわマッサージでリラックスしたいです〜", baseGauge: 2, basePatience: 6.5, score: 122, image: "images/assets/enemy/enemy_marshmallow_massage_test.png" }
  ];
  let root = null;
  let state = null;
  let timerId = null;
  let lastTick = 0;
  const DOUBLE_TAP_MS = 220;
  let staffTapTimer = null;
  let pendingStaffTapId = null;
  let pendingStaffTapAt = 0;
  const ENEMY_DOUBLE_TAP_MS = 260;
  let pendingEnemyTapId = null;
  let pendingEnemyTapAt = 0;
  let pendingHelpTapAt = 0;
  let lastHelpInputAt = 0;
  let lastHelpEmptyMessageAt = 0;
  let helpTapTimer = null;
  let surfaceTimers = [];

  function makeState() {
  
  function getActiveEnemyAttributes() {
    const attrs = new Set();
    state.enemies.forEach(enemy => {
      if (!enemy || enemy.isChanging) return;
      if (enemy.attribute) attrs.add(enemy.attribute);
    });
    return attrs;
  }

  function hasMatchingEnemyForMember(member) {
    if (!member || !state.enemies || state.enemies.length === 0) return false;
    return state.enemies.some(enemy => {
      if (!enemy || enemy.isChanging) return false;
      return enemy.attribute === member.attribute;
    });
  }

  function countMatchingEnemiesForMember(member) {
    if (!member || !state.enemies) return 0;
    return state.enemies.filter(enemy => {
      if (!enemy || enemy.isChanging) return false;
      return enemy.attribute === member.attribute;
    }).length;
  }



  function getAttributeColor(attribute) {
    const colors = {
      video: "#d3381c",
      dryer: "#0067C0",
      pc: "#02b308",
      phone: "#FFF450",
      audio: "#F68B1F",
      beauty: "#C0C0C0",
      cooking: "#6495ED",
      dehumid: "#fffef6",
      humid: "#00152d",
      stream: "#F7ADC3",
      life: "#694D9F",
      office: "#8d5025",
      season: "#33CC99"
    };
    return colors[attribute] || "#ffffff";
  }


  return {
      running: false,
      finished: false,
      timeLeft: BATTLE_SECONDS,
      battleBgId: DEFAULT_BATTLE_BG_ID,
      wave: 1,
      waveLabel: "第1WAVE",
      timeSalePending: false,
      timeSaleActive: false,
      timeSaleCountdown: false,
      timeSaleAnnounced: false,
      score: 0,
      served: 0,
      missed: 0,
      combo: 0,
      maxCombo: 0,
      nextEnemyId: 1,
      spawnTimer: 0,
      rush: false,
      targetPreviewId: null,
      autoMode: false,
      autoTimer: 0,
      autoResolving: false,
      helpStock: 0,
      helpEarnCounter: 0,
      nextHitId: 1,
      hitEffects: [],
      cutin: null,
      cutinUntil: 0,
      surface: null,
      whiteFlashUntil: 0,
      countingDown: false,
      resultRevealAt: 0,
      resultRevealTimer: null,

      lastActionText: "営業開始を押してください。",
      buffPowerUntil: 0,
      buffMatchUntil: 0,
      buffSpeedUntil: 0,
      buffChangeUntil: 0,
      buffRushUntil: 0,
      comboShield: false,
      deckEdit: false,
      deckSelection: [...activeStaffIds],
      staff: getStaffBase().map((s, index) => ({ ...s, isLeader: index === 0, ct: 0, skill: index === 0 ? 50 : 0 })),
      enemies: [],
      salesRecorded: false
    };
  }

  function ensureRoot() {
    root = document.getElementById("battle-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "battle-root";
      root.className = "battle-root hidden";
      document.body.appendChild(root);
    }
  }

  function openBattle() {
    ensureRoot();
    state = makeState();
    root.classList.remove("hidden");
    render();
  }

  function closeBattle() {
    clearPendingStaffTap();
    clearPendingEnemyTap();
    clearPendingHelpTap();
    clearSurfaceTimers();
    stopLoop();
    if (root) root.classList.add("hidden");
    // v039_49: let the v039 sales screen restore itself after the extracted battle overlay closes.
    document.body.classList.remove("battle-screen");
    try {
      document.dispatchEvent(new CustomEvent("tenotsu:battle:closed", {
        detail: { source: "BattleProto", version: BATTLE_VERSION }
      }));
    } catch (_) {}
  }

  function clearPendingStaffTap() {
    if (staffTapTimer) window.clearTimeout(staffTapTimer);
    staffTapTimer = null;
    pendingStaffTapId = null;
    pendingStaffTapAt = 0;
  }

  function clearPendingEnemyTap() {
    pendingEnemyTapId = null;
    pendingEnemyTapAt = 0;
  }

  function clearPendingHelpTap() {
    if (helpTapTimer) window.clearTimeout(helpTapTimer);
    helpTapTimer = null;
    pendingHelpTapAt = 0;
  }

  function stopLoop() {
    if (timerId) window.clearInterval(timerId);
    timerId = null;
  }

  function clearSurfaceTimers() {
    surfaceTimers.forEach(id => window.clearTimeout(id));
    surfaceTimers = [];
  }

  function showSurface(title, subText = "", kind = "notice", duration = 1200) {
    if (!state) return;
    state.surface = { title, subText, kind };
    render();
    if (duration > 0) {
      const id = window.setTimeout(() => {
        if (state && state.surface && state.surface.title === title) {
          state.surface = null;
          render();
        }
      }, duration);
      surfaceTimers.push(id);
    }
  }

  function startBattle(autoMode = false) {
    clearPendingStaffTap();
    clearPendingEnemyTap();
    clearPendingHelpTap();
    clearSurfaceTimers();
    stopLoop();
    state = makeState();
    state.countingDown = true;
    state.autoMode = !!autoMode;
    state.autoTimer = 0;
    state.lastActionText = autoMode
      ? "オート営業準備中。開店後、自動操作はCT2倍です。"
      : "開店準備中。メンバータップで接客、敵ダブルタップでチェンジできます。";
    render();
    runOpeningCountdown(autoMode);
  }

  function runOpeningCountdown(autoMode) {
    const steps = [
      { title: "3", sub: "開店準備中", ms: 650 },
      { title: "2", sub: "スタッフ配置確認", ms: 650 },
      { title: "1", sub: "レジ起動OK", ms: 650 },
      { title: "開店！", sub: autoMode ? "サポートプレイ開始（必殺→通常）" : "店舗営業開始", ms: 720 }
    ];

    let delay = 0;
    steps.forEach((step, index) => {
      const id = window.setTimeout(() => {
        if (!state || !state.countingDown) return;
        state.surface = { title: step.title, subText: step.sub, kind: index === steps.length - 1 ? "open" : "count" };
        render();
      }, delay);
      surfaceTimers.push(id);
      delay += step.ms;
    });

    const startId = window.setTimeout(() => beginBattle(autoMode), delay);
    surfaceTimers.push(startId);
  }

  function beginBattle(autoMode = false) {
    if (!state) return;
    state.countingDown = false;
    state.surface = null;
    state.running = true;
    state.finished = false;
    state.autoMode = !!autoMode;
    state.autoTimer = 0;
    state.lastActionText = state.autoMode
      ? "サポートプレイ開始！ 第1WAVE開始。左端リーダーは必殺ゲージ50%スタートです。"
      : "開店！ 第1WAVE開始。左端リーダーは必殺ゲージ50%スタートです。";
    spawnEnemy(true);
    spawnEnemy(true);
    spawnEnemy(true);
    lastTick = performance.now();
    timerId = window.setInterval(tick, 100);
    render();
  }


  function beginTimeSaleCountdown() {
    if (!state || !state.running || state.timeSaleCountdown || state.timeSaleActive) return;
    state.timeSalePending = true;
    state.timeSaleCountdown = true;
    state.finished = false;
    state.running = false;
    state.rush = false;
    state.surface = null;
    state.lastActionText = "通常営業終了。これよりタイムセールを行います。";
    stopLoop();

    const steps = [
      { title: "通常営業終了", sub: "これよりタイムセールを行います", kind: "timesale-intro", ms: 2000 },
      { title: "3", sub: "タイムセール開始まで", kind: "timesale-count", ms: 650 },
      { title: "2", sub: "売場加速中", kind: "timesale-count", ms: 650 },
      { title: "1", sub: "呼び込み開始", kind: "timesale-count", ms: 650 },
      { title: "タイムセール開始！", sub: "15秒勝負", kind: "timesale-open", ms: 760 }
    ];

    let delay = 0;
    steps.forEach((step) => {
      const id = window.setTimeout(() => {
        if (!state || !state.timeSaleCountdown) return;
        state.surface = { title: step.title, subText: step.sub, kind: step.kind };
        render();
      }, delay);
      surfaceTimers.push(id);
      delay += step.ms;
    });

    const startId = window.setTimeout(() => beginTimeSaleWave(), delay);
    surfaceTimers.push(startId);
    render();
  }

  function beginTimeSaleWave() {
    if (!state) return;
    state.timeSaleCountdown = false;
    state.timeSalePending = false;
    state.timeSaleActive = true;
    state.timeSaleAnnounced = true;
    state.wave = 2;
    state.waveLabel = "タイムセール";
    state.running = true;
    state.finished = false;
    state.rush = true;
    state.timeLeft = TIME_SALE_SECONDS;
    state.surface = null;
    state.spawnTimer = 0;
    state.lastActionText = "タイムセール実施中！15秒間の来店ラッシュです。";
    showTimeSaleCutin();
    lastTick = performance.now();
    timerId = window.setInterval(tick, 100);
    render();
  }


  function calcBattleExp() {
    if (!state) return 0;
    const base = 60;
    const servedBonus = Math.max(0, Math.floor(state.served || 0)) * 8;
    const comboBonus = Math.max(0, Math.floor(state.maxCombo || 0)) * 2;
    const salesBonus = Math.floor(Math.max(0, Number(state.score) || 0) / 250);
    const timeSaleBonus = state.timeSaleActive ? 20 : 0;
    return Math.max(40, Math.min(260, base + servedBonus + comboBonus + salesBonus + timeSaleBonus));
  }

  function getBattlePartyIds() {
    if (!state || !Array.isArray(state.staff)) return [...activeStaffIds];
    const ids = state.staff.map((member) => member && member.id).filter(Boolean);
    return ids.length ? ids : [...activeStaffIds];
  }

  function finishBattle() {
    if (!state) return;
    state.running = false;
    state.finished = true;
    if (!state.salesRecorded) {
      state.salesRecorded = true;
      const source = state.timeSaleActive ? "店舗営業＋タイムセール" : "店舗営業";
      const partyIds = getBattlePartyIds();
      const expGained = calcBattleExp();
      const growthResults = (window.TenotsuGrowth && typeof window.TenotsuGrowth.addExpToParty === "function")
        ? window.TenotsuGrowth.addExpToParty(partyIds, expGained, source)
        : [];
      state.resultData = {
        salesAmount: state.score,
        servedCount: state.served,
        missedCount: state.missed,
        maxCombo: state.maxCombo,
        expGained,
        partyIds,
        growthResults,
        drops: []
      };
      addSalesToEconomy(state.score, source);
      addManagerExp(80, "店舗営業");
    }
    state.timeSaleActive = false;
    state.timeSalePending = false;
    state.timeSaleCountdown = false;
    state.rush = false;
    state.waveLabel = "営業終了";
    state.timeLeft = Math.max(0, state.timeLeft);
    const exp = state.resultData ? state.resultData.expGained : 0;
    state.lastActionText = `営業終了：成約${state.served}件 / 売上 ${state.score.toLocaleString()}円 / メンバーEXP +${exp}`;
    stopLoop();
    state.resultRevealAt = Date.now() + 3000;
    if (state.resultRevealTimer) window.clearTimeout(state.resultRevealTimer);
    state.resultRevealTimer = window.setTimeout(() => {
      if (!state || !state.finished) return;
      state.surface = null;
      state.resultRevealAt = 0;
      state.resultRevealTimer = null;
      render();
    }, 3000);
    showSurface("営業終了", `成約${state.served}件 / 売上 ${state.score.toLocaleString()}円 / メンバーEXP +${exp}`, "close ending", 3000);
  }

  function tick() {
    if (!state || !state.running) return;
    const now = performance.now();
    const dt = Math.min(0.24, Math.max(0.05, (now - lastTick) / 1000));
    lastTick = now;

    state.timeLeft = Math.max(0, state.timeLeft - dt);

    // 第1WAVEは30秒。終了後、3カウントを挟んでタイムセールへ。
    if (state.wave === 1 && state.timeLeft <= 0) {
      beginTimeSaleCountdown();
      return;
    }

    // 第2WAVE：15秒のタイムセール。終了で営業終了。
    if (state.timeSaleActive && state.timeLeft <= 0) {
      finishBattle();
      return;
    }

    state.rush = !!state.timeSaleActive;

    state.spawnTimer -= dt;
    const elapsed = state.timeSaleActive ? TIME_SALE_SECONDS - state.timeLeft : BATTLE_SECONDS - state.timeLeft;
    const spawnInterval = state.timeSaleActive ? 0.65 : elapsed > 10 ? 1.25 : 1.8;
    if (state.spawnTimer <= 0) {
      spawnEnemy();
      state.spawnTimer = spawnInterval;
    }

    updateStaff(dt, now);
    updateEnemies(dt);
    updateHitEffects(now);
    maintainEnemies();
    runAutoBattle(dt);

    render();
  }

  function updateStaff(dt, now) {
    const speedBuff = now < state.buffSpeedUntil ? 2.1 : 1.0;
    state.staff.forEach(s => {
      s.ct = Math.max(0, s.ct - dt * speedBuff);
      if (state.running) s.skill = Math.min(100, s.skill + dt * 4.5);
    });
  }


  function getEnemySlots() {
    const slots = Array.from({ length: MAX_ENEMIES }, () => null);
    (state.enemies || []).forEach((enemy, index) => {
      if (!enemy) return;
      const slot = Number.isInteger(enemy.slot) ? enemy.slot : index;
      if (slot >= 0 && slot < MAX_ENEMIES && !slots[slot]) {
        enemy.slot = slot;
        slots[slot] = enemy;
      }
    });
    return slots;
  }

  function compactEnemySlotsOnce() {
    // 初期移行用。営業中は左詰めしない。
    (state.enemies || []).forEach((enemy, index) => {
      if (enemy && !Number.isInteger(enemy.slot)) enemy.slot = index;
    });
  }

  function getOpenEnemySlot() {
    const slots = getEnemySlots();
    return slots.findIndex(slot => !slot);
  }

  function replaceEnemyInSameSlot(oldEnemy, newEnemy = createEnemy()) {
    const slot = oldEnemy && Number.isInteger(oldEnemy.slot) ? oldEnemy.slot : getOpenEnemySlot();
    newEnemy.slot = slot < 0 ? 0 : slot;
    const idx = state.enemies.findIndex(e => e && oldEnemy && e.id === oldEnemy.id);
    if (idx >= 0) {
      state.enemies[idx] = newEnemy;
    } else {
      state.enemies.push(newEnemy);
    }
    return newEnemy;
  }

  function removeEnemyKeepSlot(enemy) {
    const idx = state.enemies.findIndex(e => e && enemy && e.id === enemy.id);
    if (idx >= 0) state.enemies.splice(idx, 1);
  }

  function updateEnemies(dt) {
    compactEnemySlotsOnce();

    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      if (!e) continue;

      if (e.defeating) {
        e.defeatLeft -= dt;
        if (e.defeatLeft <= 0) {
          completeEnemy(e, !!e.defeatMatch);
        }
        continue;
      }

      if (e.exchanging) {
        e.exchangeLeft -= dt;
        if (e.exchangeLeft <= 0) {
          replaceEnemyInSameSlot(e, createEnemy());
        }
        continue;
      }

      e.patience -= dt;
      if (e.patience <= 0) {
        removeEnemyKeepSlot(e);
        state.missed += 1;
        if (state.comboShield) {
          state.comboShield = false;
          state.lastActionText = "琥珀のフォローでコンボ維持！";
        } else {
          state.combo = 0;
          state.lastActionText = `${e.name}が離脱…`;
        }
      }
    }
  }

  function maintainEnemies() {
    while (state.running && getOpenEnemySlot() >= 0) spawnEnemy(true);
  }

  function createEnemy() {
    const base = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    const rare = Math.random() < (state.rush ? 0.16 : 0.07);
    // HP仕様：通常敵HP2、レア敵HP3
    const gauge = rare ? 3 : 2;
    const patience = Math.max(3.2, base.basePatience + Math.random() * 1.6 + (rare ? 1.2 : 0) - (state.rush ? 1.0 : 0));

    return {
      id: state.nextEnemyId++,
      attr: base.attr,
      icon: base.icon,
      name: base.name,
      text: base.text,
      image: base.image || "",
      gauge,
      maxGauge: gauge,
      patience,
      maxPatience: patience,
      score: base.score + (rare ? 80 : 0),
      rare,
      exchanging: false,
      exchangeLeft: 0,
      exchangeMax: CHANGE_SECONDS,
      exchangeMessage: "",
      defeating: false,
      defeatLeft: 0,
      defeatMatch: false
    };
  }

  function spawnEnemy(force = false) {
    if (!state) return;
    const slot = getOpenEnemySlot();
    if (slot < 0) return;
    if (!force && Math.random() < 0.25) return;
    const enemy = createEnemy();
    enemy.slot = slot;
    state.enemies.push(enemy);
  }

  function handleStaffPointer(staffId, event) {
    if (!state || !state.running) return;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const now = performance.now();
    const isDoubleTap =
      staffTapTimer &&
      pendingStaffTapId === staffId &&
      now - pendingStaffTapAt <= DOUBLE_TAP_MS;

    if (isDoubleTap) {
      clearPendingStaffTap();
      onStaffDoubleTap(staffId);
      return;
    }

    if (staffTapTimer) {
      const oldStaffId = pendingStaffTapId;
      clearPendingStaffTap();
      onStaffSingleTap(oldStaffId);
    }

    pendingStaffTapId = staffId;
    pendingStaffTapAt = now;
    staffTapTimer = window.setTimeout(() => {
      const targetStaffId = pendingStaffTapId;
      clearPendingStaffTap();
      onStaffSingleTap(targetStaffId);
    }, DOUBLE_TAP_MS);
  }

  function onStaffSingleTap(staffId) {
    if (!state || !state.running) return;
    const s = state.staff.find(x => x.id === staffId);
    if (!s) return;

    if (s.ct > 0) {
      state.lastActionText = `${s.name}は準備中です。`;
      pulseStaff(staffId);
      render();
      return;
    }

    const target = findBestTarget(s);
    if (!target) {
      state.lastActionText = "対応できる家電星人がいません。";
      render();
      return;
    }

    state.targetPreviewId = target.id;
    resolveContact(s, target);
    s.ct = s.ctMax;
    s.skill = Math.min(100, s.skill + (s.attr === target.attr ? 28 : 16));
    render();
  }

  function onStaffDoubleTap(staffId) {
    if (!state || !state.running) return;
    const s = state.staff.find(x => x.id === staffId);
    if (!s) return;

    if (s.ct > 0) {
      state.lastActionText = `${s.name}は準備中です。必殺技もまだ使えません。`;
      pulseStaff(staffId);
      render();
      return;
    }

    if (s.skill < 100) {
      // v037_93: ダブルタップ時に必殺不可でも、通常接客が可能なら通常クリックとして処理する
      state.lastActionText = `${s.name}の必殺ゲージが足りません。通常接客として対応します。`;
      onStaffSingleTap(staffId);
      return;
    }

    const target = findBestTarget(s, true);
    if (!target) {
      state.lastActionText = "必殺接客の対象がいません。通常接客を試みます。";
      onStaffSingleTap(staffId);
      return;
    }

    state.targetPreviewId = target.id;
    resolveContact(s, target, true);
    useSkill(s);
    s.skill = 0;
    s.ct = s.ctMax * 0.65;
    render();
  }

  function findBestTarget(staff, isSpecial = false) {
    let best = null;
    let bestScore = -Infinity;

    for (const e of state.enemies) {
      if (e.exchanging || e.defeating) continue;
      const matchScore = staff.attr === e.attr ? 120 : 0;
      const urgentScore = (1 - e.patience / e.maxPatience) * 72;
      const finishScore = e.gauge <= getAttackDamage(staff, e, isSpecial) ? 48 : 0;
      const rareScore = e.rare ? 38 : 0;
      const highScore = e.score / 8;
      const rushDangerScore = state.rush && e.patience <= 2.5 ? 32 : 0;
      const score = matchScore + urgentScore + finishScore + rareScore + highScore + rushDangerScore;

      if (score > bestScore) {
        bestScore = score;
        best = e;
      }
    }
    return best;
  }

  function getAttackDamage(staff, enemy, isSpecial = false) {
    const isMatch = staff.attr === enemy.attr;
    if (isSpecial) return isMatch ? 3 : 2;
    return isMatch ? 2 : 1;
  }

  function resolveContact(staff, enemy, isSpecial = false) {
    const isMatch = staff.attr === enemy.attr;
    const damage = getAttackDamage(staff, enemy, isSpecial);

    enemy.gauge -= damage;
    addHitEffect(enemy, staff, damage, isSpecial, isMatch);
    state.lastActionText = `${staff.name} → ${enemy.name}：${damage}ダメージ ${isSpecial ? "必殺" : "通常"} ${isMatch ? "特攻◎" : "等倍"}`;

    if (enemy.gauge <= 0) {
      enemy.gauge = 0;
      enemy.defeating = true;
      enemy.defeatLeft = 0.32;
      enemy.defeatMatch = isMatch;
    }
  }

  function addHitEffect(enemy, staff, damage, isSpecial, isMatch, customText = null) {
    if (!state) return;
    state.hitEffects.push({
      id: state.nextHitId++,
      enemyId: enemy.id,
      color: staff.color || "#ffffff",
      text: `${customText || (isSpecial ? "必殺HIT!" : "HIT!")} ${damage}`,
      subText: isMatch ? "特攻" : "",
      createdAt: performance.now(),
      life: 620
    });
  }

  function updateHitEffects(now) {
    if (!state || !state.hitEffects) return;
    state.hitEffects = state.hitEffects.filter(effect => now - effect.createdAt < effect.life);
  }

  function completeEnemy(enemy, isMatch, options = {}) {
    removeEnemyKeepSlot(enemy);

    state.served += 1;
    addHelpProgress(1);
    state.combo += 1;
    state.maxCombo = Math.max(state.maxCombo, state.combo);

    const comboBonus = Math.min(3.0, 1 + state.combo * 0.05);
    const rareBonus = enemy.rare ? 2.0 : 1.0;
    const matchBonus = isMatch ? 1.25 : 1.0;
    let point = Math.round(enemy.score * comboBonus * rareBonus * matchBonus);
    if (state.autoResolving) point = Math.max(1, Math.floor(point * AUTO_SCORE_MULTIPLIER));
    state.score += point;
    state.lastActionText = `レジ誘導成功！ +${point}円`;
  }

  function triggerWhiteFlash() {
    if (!state) return;
    state.whiteFlashUntil = performance.now() + 360;
  }

  function showCutin(title, color = "#ffffff", subText = "", descText = "", image = "") {
    if (!state) return;
    state.cutin = { title, color, subText, descText,
      image: image || "", image, createdAt: performance.now(), life: descText || image ? 1650 : 1150 };
    state.cutinUntil = state.cutin.createdAt + state.cutin.life;
  }

  function showTimeSaleCutin() {
    showCutin("タイムセール開始！", "#ff3030", "ラッシュタイム", "15秒間、来店ラッシュで成約チャンスが増加します。");
  }

  function getCurrentChangeSeconds() {
    return performance.now() < state.buffChangeUntil ? CHANGE_SECONDS_BUFFED : CHANGE_SECONDS;
  }

  function applyFlatDamageToEnemy(enemy, damage, sourceStaff, label = "追加HIT!") {
    if (!enemy || enemy.exchanging || enemy.defeating || damage <= 0) return;
    enemy.gauge -= damage;
    addHitEffect(enemy, sourceStaff, damage, false, false, label);
    if (enemy.gauge <= 0) {
      enemy.gauge = 0;
      enemy.defeating = true;
      enemy.defeatLeft = 0.32;
      enemy.defeatMatch = false;
    }
  }

  function requestEnemyChange(enemyId) {
    if (!state || !state.running) return;
    const enemy = state.enemies.find(e => e.id === enemyId);
    if (!enemy || enemy.exchanging || enemy.defeating) return;

    const message = CHANGE_MESSAGES[Math.floor(Math.random() * CHANGE_MESSAGES.length)];
    enemy.exchanging = true;
    const changeSeconds = getCurrentChangeSeconds();
    enemy.exchangeLeft = changeSeconds;
    enemy.exchangeMax = changeSeconds;
    enemy.exchangeMessage = message;
    state.combo = 0;
    state.targetPreviewId = null;
    state.lastActionText = message;
    render();
  }

  function useSkill(staff) {
    const now = performance.now();
    showCutin(staff.skillName, staff.color, staff.name, staff.skillDesc || "", staff.skillCutin || (staff.id === "aa" ? "images/assets/cutin/cutin_hina_test.png" : ""));
    if (staff.skillType === "powerBuff") {
      state.buffPowerUntil = now + 8000;
      state.lastActionText = "緋奈：全力おすすめ！ 接客力アップ！";
    } else if (staff.skillType === "extendTime") {
      state.enemies.forEach(e => {
        e.patience = Math.min(e.maxPatience + 3, e.patience + 3);
        e.maxPatience = Math.max(e.maxPatience, e.patience);
      });
      state.timeLeft = Math.min(BATTLE_SECONDS + 5, state.timeLeft + 2);
      state.lastActionText = "藍：やさしい案内！受付時間を延長。";
    } else if (staff.skillType === "pcSweep") {
      const targets = [...state.enemies.filter(e => e.attr === "PC")];
      targets.forEach(e => completeEnemy(e, true));
      state.buffMatchUntil = now + 6000;
      state.lastActionText = "翠：最適解プレゼン！PC対応＋相性倍率UP。";
    } else if (staff.skillType === "ctReduce") {
      state.staff.forEach(s => { s.ct = Math.min(s.ct, 0.35); });
      state.buffSpeedUntil = now + 6000;
      state.lastActionText = "こがね：即決トーク！CT短縮。";
    } else if (staff.skillType === "ayameRoute") {
      const extras = state.enemies
        .filter(e => !e.exchanging && !e.defeating)
        .sort((a, b) => a.gauge - b.gauge || a.patience - b.patience)
        .slice(0, 2);
      extras.forEach(e => applyFlatDamageToEnemy(e, 1, staff, "導線HIT!"));
      state.buffChangeUntil = now + 6000;
      state.lastActionText = "彩愛：優雅な家事導線！敵2体に1ダメージ、6秒間チェンジ1秒。";
    } else if (staff.skillType === "rushBuff") {
      state.buffRushUntil = now + 8000;
      state.comboShield = true;
      state.lastActionText = "琥珀：フロアダッシュ！ラッシュ対応力UP。";
    }
  }

  function autoOneMove(showMessage = true) {
    if (!state || !state.running) return false;

    // v037_93: オート優先順位 = 必殺技 → 通常攻撃
    // 店長HELPは強力な切り札なので、サポートでは使わず任意操作にする。
    let bestStaff = null;
    let bestEnemy = null;
    let useSpecial = false;
    let bestScore = -Infinity;

    for (const s of state.staff) {
      if (s.ct > 0) continue;

      const canSpecial = s.skill >= 100;
      const e = findBestTarget(s, canSpecial);
      if (!e) continue;

      const damage = getAttackDamage(s, e, canSpecial);
      const willDefeat = e.gauge <= damage;
      const score =
        (canSpecial ? 240 : 0) +
        (s.attr === e.attr ? 120 : 0) +
        (willDefeat ? 90 : 0) +
        (1 - e.patience / e.maxPatience) * 72 +
        damage * 24 +
        (e.rare ? 35 : 0);

      if (score > bestScore) {
        bestScore = score;
        bestStaff = s;
        bestEnemy = e;
        useSpecial = canSpecial;
      }
    }

    if (bestStaff && bestEnemy) {
      state.targetPreviewId = bestEnemy.id;
      state.autoResolving = true;
      resolveContact(bestStaff, bestEnemy, useSpecial);
      if (useSpecial) useSkill(bestStaff);
      state.autoResolving = false;

      // サポートは便利な代わりにCTを重くする
      bestStaff.ct = bestStaff.ctMax * (useSpecial ? 1.15 : 1) * AUTO_CT_MULTIPLIER;
      bestStaff.skill = useSpecial ? 0 : Math.min(100, bestStaff.skill + 10);
      return true;
    }

    if (showMessage) {
      state.lastActionText = "サポート：今は動けるメンバーがいません。";
      render();
    }
    return false;
  }

  function runAutoBattle(dt) {
    if (!state || !state.running || !state.autoMode) return;
    state.autoTimer -= dt;
    if (state.autoTimer > 0) return;

    const moved = autoOneMove(false);
    state.autoTimer = moved ? AUTO_ACTION_INTERVAL : 0.18;
  }

  function toggleAutoBattle() {
    if (!state || !state.running) return;
    state.autoMode = !state.autoMode;
    state.autoTimer = 0;
    state.lastActionText = state.autoMode ? "サポートプレイON：必殺→通常の順で行動します。店長HELPは任意操作です。CT2倍・売上70%。" : "サポートプレイOFF";
    render();
  }

  function addHelpProgress(count) {
    if (!state) return;
    state.helpEarnCounter += count;
    while (state.helpEarnCounter >= HELP_STOCK_STEP && state.helpStock < HELP_STOCK_MAX) {
      state.helpEarnCounter -= HELP_STOCK_STEP;
      state.helpStock += 1;
      state.lastActionText = `店長ヘルプが1つ溜まりました！ 残り${state.helpStock}/${HELP_STOCK_MAX}`;
    }
    if (state.helpStock >= HELP_STOCK_MAX) {
      state.helpEarnCounter = Math.min(state.helpEarnCounter, HELP_STOCK_STEP - 1);
    }
  }

  function useManagerHelp(fromAuto = false) {
    if (!state || !state.running) return false;
    if (state.helpStock <= 0) {
      state.lastActionText = "店長HELP準備中。成約10件で1ストック溜まります。";
      render();
      return false;
    }

    state.helpStock -= 1;
    triggerWhiteFlash();
    showCutin("店長HELP！", "#ffe06a", "店長出動", "全メンバーのCTをクリアし、画面上の敵を一掃成約してオールチェンジします。");
    state.staff.forEach(s => { s.ct = 0; });

    const targets = [...state.enemies.filter(e => !e.exchanging)];
    targets.forEach(e => completeEnemy(e, true, { help: true }));
    state.enemies = getEnemySlots().map((e, slot) => {
      const next = createEnemy();
      next.slot = slot;
      return next;
    });

    state.targetPreviewId = null;
    state.lastActionText = `店長ヘルプ発動！ リキャストクリア＋${targets.length}体を一掃成約、オールチェンジ！`;
    if (!fromAuto) render();
    return true;
    return true;
    return true;
  }


  function handleHelpClick(event) {
    if (!state || !state.running) return false;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const now = performance.now();

    // v037_93: 乱連打前提。押せるなら即発動、連打による多重発動だけ短時間ロック。
    if (now - lastHelpInputAt < HELP_INPUT_LOCK_MS) return;
    lastHelpInputAt = now;

    clearPendingHelpTap();

    if (state.helpStock > 0) {
      useManagerHelp();
      return;
    }

    // ストックなし時はメッセージを出しすぎない
    if (now - lastHelpEmptyMessageAt > HELP_EMPTY_MESSAGE_LOCK_MS) {
      lastHelpEmptyMessageAt = now;
      state.lastActionText = "店長HELP準備中。成約10件で1ストック溜まります。";
      render();
    }
  }

  function render() {
    if (!root || !state) return;
    const statusText = state.running ? (state.timeSaleActive ? "タイムセール中" : "営業中") : state.finished ? "営業終了" : state.timeSaleCountdown ? "タイムセール準備中" : "待機中";

    root.innerHTML = `
      <div class="battle-stage ${state.running ? "is-running" : ""} ${state.rush ? "is-rush" : ""}" style="--battle-bg-url: url(${getBattleBackground(state.battleBgId).path});">
        <section class="battle-hud">
          <div class="battle-hud-title">店舗営業：デッキ接客バトル <span class="battle-version">${BATTLE_VERSION}</span></div>
          <div class="battle-hud-stats">
            <span>状態：<b>${statusText}</b></span>
            <span>WAVE：<b>${escapeHtml(state.waveLabel || "第1WAVE")}</b></span>
            <span>残り：<b>${Math.ceil(state.timeLeft)}</b>秒</span>
            <span>成約：<b>${state.served}</b></span>
            <span>離脱：<b>${state.missed}</b></span>
            <span>コンボ：<b>${state.combo}</b></span>
            <span>売上：<b>${state.score}</b></span>
          </div>
          ${renderHudActions()}
          <div class="battle-message">${escapeHtml(state.lastActionText)}</div>
          ${state.finished ? `<div class="battle-finished-banner">営業終了</div>` : (!state.finished && state.running && state.timeSaleActive) ? `<div class="battle-timesale-banner">＞＞＞タイムセール実施中！＜＜＜</div>` : ""}
        </section>

        ${renderCutinOverlay()}
        ${renderSurfaceOverlay()}
        ${renderWhiteFlashOverlay()}

        <section class="battle-enemies">
          ${renderEnemySlots()}
        </section>

        ${renderHelpButtons("battle-help-large")}

        <section class="battle-members">
          ${state.staff.map(renderStaff).join("")}
        </section>

        ${state.running || state.countingDown || state.timeSaleCountdown || state.timeSalePending ? "" : renderControlOverlay()}
      </div>
    `;
  }

  function renderHelpButtons(className) {
    const buttons = Array.from({ length: HELP_STOCK_MAX }, (_, i) => {
      const available = state.running && i < state.helpStock;
      return `<button class="battle-help-btn ${available ? "available" : "empty"}" data-action="help">HELP!</button>`;
    }).join("");

    return `<div class="${className}" title="成約10件で1つ、最大3つまでストック">${buttons}</div>`;
  }

  function renderHudActions() {
    if (!state.running) return "";
    return `
      <div class="battle-hud-actions">
        <button class="battle-auto-toggle ${state.autoMode ? "on" : ""}" data-action="autoToggle">${state.autoMode ? "サポートON" : "サポートOFF"}</button>
      </div>
    `;
  }

  function renderSideHelpButtons() {
    return "";
  }

  function renderCutinOverlay() {
    if (!state.cutin) return "";
    const now = performance.now();
    if (now > state.cutinUntil) return "";
    const progress = Math.max(0, Math.min(1, (now - state.cutin.createdAt) / state.cutin.life));
    const opacity = progress < 0.8 ? 1 : Math.max(0, 1 - (progress - 0.8) / 0.2);

    const portrait = state.cutin.image ? `
      <div class="skillPortraitFixedV19" style="--cutin-color:${state.cutin.color}; opacity:${opacity};">
        <img src="${escapeHtml(state.cutin.image)}" alt="">
      </div>
    ` : "";

    const text = `
      <div class="skillTextSurfaceV19" style="--cutin-color:${state.cutin.color}; opacity:${opacity};">
        <div class="skillTextInnerV19">
          ${state.cutin.subText ? `<small>${escapeHtml(state.cutin.subText)}</small>` : ""}
          <b>${escapeHtml(state.cutin.title)}</b>
          ${state.cutin.descText ? `<p>${escapeHtml(state.cutin.descText)}</p>` : ""}
        </div>
      </div>
    `;

    return `
      <div class="skillCutinLayerV19">
        ${text}
        ${portrait}
      </div>
    `;
  }

  function renderWhiteFlashOverlay() {
    if (!state || !state.whiteFlashUntil) return "";
    const now = performance.now();
    if (now > state.whiteFlashUntil) return "";
    const opacity = Math.max(0, Math.min(1, (state.whiteFlashUntil - now) / 360));
    return `<div class="battle-white-flash" style="opacity:${opacity};"></div>`;
  }

  function renderSurfaceOverlay() {
    if (!state || !state.surface) return "";
    const title = state.surface.title || "";
    const subText = state.surface.subText || "";
    const kind = state.surface.kind || "notice";
    return `
      <div class="battle-surface ${kind}">
        <div class="battle-surface-card">
          ${subText ? `<small>${escapeHtml(subText)}</small>` : ""}
          <b>${escapeHtml(title)}</b>
        </div>
      </div>
    `;
  }

  function renderResultGrowthRows(result) {
    const rows = result && Array.isArray(result.growthResults) ? result.growthResults : [];
    if (!rows.length) return `<div class="battle-result-member-empty">メンバー経験値は次回以降に反映されます。</div>`;
    const html = rows.map((item) => {
      const levelText = item.before && item.after && item.before.level !== item.after.level
        ? `Lv.${item.before.level} → Lv.${item.after.level}`
        : `Lv.${item.after ? item.after.level : "-"}`;
      const upText = item.levelUps && item.levelUps.length ? `<em>LEVEL UP!</em>` : "";
      return `<div class="battle-result-member-row"><span class="battle-result-member-name">${escapeHtml(item.shortName || item.name || item.id)}</span><b class="battle-result-member-level">${levelText}</b><small class="battle-result-member-exp">+${item.gainedExp || 0} EXP</small>${upText}</div>`;
    }).join("");
    return `<div class="battle-result-member-list">${html}</div>`;
  }

  function shouldShowEndingDeclaration() {
    return !!(state && state.finished && state.resultRevealAt && Date.now() < state.resultRevealAt);
  }

  function renderEndingDeclaration() {
    const result = state && state.resultData ? state.resultData : null;
    const exp = result ? result.expGained : 0;
    return `
      <div class="battle-control-overlay battle-ending-overlay" aria-live="polite">
        <div class="battle-ending-card">
          <small>本日の営業</small>
          <b>営業終了</b>
          <span>成約${state.served}件 / 売上 ${Number(state.score || 0).toLocaleString()}円 / EXP +${exp}</span>
        </div>
      </div>
    `;
  }

  function renderControlOverlay() {
    if (state.deckEdit) return renderDeckEditorOverlay();

    const isResult = state.finished;
    if (shouldShowEndingDeclaration()) return renderEndingDeclaration();
    const result = state.resultData || null;
    return `
      <div class="battle-control-overlay">
        <div class="battle-control-box ${isResult ? "battle-result-box" : ""}">
          ${isResult ? `
            <div class="battle-result-title">営業結果</div>
            <div class="battle-result-grid">
              <div class="battle-result-metric"><span>成約</span><b>${state.served}</b></div>
              <div class="battle-result-metric"><span>離脱</span><b>${state.missed}</b></div>
              <div class="battle-result-metric"><span>最大コンボ</span><b>${state.maxCombo}</b></div>
              <div class="battle-result-metric"><span>売上</span><b>${Number(state.score || 0).toLocaleString()}円</b></div>
              <div class="battle-result-metric"><span>経験値</span><b>+${result ? result.expGained : 0}</b></div>
              <div class="battle-result-metric"><span>アイテム</span><b>${result && result.drops && result.drops.length ? result.drops.length + "個" : "なし"}</b></div>
            </div>
            <div class="battle-result-members">
              <div class="battle-result-subtitle">メンバー成長</div>
              ${renderResultGrowthRows(result)}
            </div>
          ` : `
            <div class="battle-result-title">店舗営業プロトタイプ</div>
            <p class="battle-control-help">30秒で家電星人をどれだけ接客できるか。メンバーはシングルタップ通常、ダブルタップ必殺。サポートは必殺→通常の順。店長HELPは任意操作。CT2倍・売上70%。</p>
          `}
          <div class="battle-control-buttons battle-main-buttons">
            <button data-action="start">${isResult ? "もう一度営業" : "営業開始"}</button>
            <button data-action="auto">${isResult ? "サポートプレイでもう一度" : "サポートプレイ"}</button>
            <button data-action="deckEdit">デッキ編成</button>
            <button data-action="close">戻る</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderDeckEditorOverlay() {
    const selected = state.deckSelection || [];
    const canDecide = selected.length === 5;
    const row1 = ["aa", "ab", "ac", "ad", "ae"];
    const row2 = ["af", "ag", "ah", "ai", "aj"];
    const row3 = ["ak", "al", "am"];

    return `
      <div class="battle-control-overlay deck-edit-overlay">
        <div class="battle-deck-box">
          <div class="battle-result-title">デッキ編成</div>
          <p class="battle-control-help">出撃するメンバーを5人選択してください。選択中のキャラは白反転します。選択数：${selected.length}/5</p>
          <div class="deck-select-grid">
            <div class="deck-select-row deck-row-five">${row1.map(renderDeckSelectCard).join("")}</div>
            <div class="deck-select-row deck-row-five">${row2.map(renderDeckSelectCard).join("")}</div>
            <div class="deck-select-row deck-row-bottom">
              ${row3.map(renderDeckSelectCard).join("")}
              <div class="deck-decision-area">
                <button class="deck-decision-main" data-action="deckDecide" ${canDecide ? "" : "disabled"}>決定</button>
                <div class="deck-small-buttons">
                  <button data-action="deckReset">リセット</button>
                  <button data-action="deckCancel">キャンセル</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderDeckSelectCard(staffId) {
    const s = staffMaster.find(x => x.id === staffId);
    if (!s) return "";
    const selected = state.deckSelection && state.deckSelection.includes(staffId);
    const order = selected ? state.deckSelection.indexOf(staffId) + 1 : "";
    return `
      <button class="deck-select-card ${selected ? "selected" : ""}" style="--member-color:${s.color};" data-action="deckToggle" data-deck-id="${s.id}">
        <span class="deck-select-order">${order}</span>
        <b>${escapeHtml(s.name)}</b>
        <small>${escapeHtml(s.attr)}</small>
        <em>${escapeHtml(s.skillName)}</em>
      </button>
    `;
  }



  function renderEnemySlots() {
    const slots = getEnemySlots();
    return slots.map((enemy, index) => enemy ? renderEnemy(enemy) : renderEnemyDummy(index)).join("");
  }

  function renderEnemyDummy(index) {
    return `
      <article class="battle-enemy-card battle-enemy-dummy" aria-hidden="true">
        <div class="enemy-head"><span class="enemy-icon">◇</span><span class="enemy-name">開店準備中</span></div>
        <div class="enemy-attr">家電星人 待機枠 ${index + 1}</div>
        <div class="enemy-label">HP</div>
        <div class="battle-bar"><i style="width:0%"></i></div>
        <div class="enemy-label">受付時間</div>
        <div class="battle-bar patience"><i style="width:0%"></i></div>
      </article>
    `;
  }

  function renderEnemy(e) {
    const gaugeRate = Math.max(0, Math.min(100, (e.gauge / e.maxGauge) * 100));
    const patienceRate = Math.max(0, Math.min(100, (e.patience / e.maxPatience) * 100));
    const exchangeMax = e.exchangeMax || CHANGE_SECONDS;
    const exchangeRate = e.exchanging ? Math.max(0, Math.min(100, (1 - e.exchangeLeft / exchangeMax) * 100)) : 0;
    const target = e.id === state.targetPreviewId;
    const enemyColor = attrColors[e.attr] || "#ff841f";

    if (e.exchanging) {
      return `
        <article class="battle-enemy-card exchanging" data-enemy-id="${e.id}" style="--enemy-color:${enemyColor};">
          <div class="enemy-head"><span class="enemy-icon">↔</span><span class="enemy-name">ご案内中...</span></div>
          <div class="enemy-exchange-message">${escapeHtml(e.exchangeMessage)}</div>
          <div class="enemy-label">交換中 ${Math.max(0, e.exchangeLeft).toFixed(1)}秒</div>
          <div class="battle-bar exchange"><i style="width:${exchangeRate}%"></i></div>
          ${renderHitEffects(e.id)}
        </article>
      `;
    }

    return `
      <article class="battle-enemy-card ${e.rare ? "rare" : ""} ${target ? "target" : ""} ${e.defeating ? "defeating" : ""}" data-enemy-id="${e.id}" style="--enemy-color:${enemyColor};">
        <div class="enemy-head"><span class="enemy-icon">${e.icon}</span><span class="enemy-name">${escapeHtml(e.name)}</span>${e.rare ? "<b>RARE</b>" : ""}</div>
        ${e.image ? `<div class="enemy-art"><img src="${escapeHtml(e.image)}" alt=""></div>` : ""}
        <div class="enemy-attr">${escapeHtml(e.attr)} / ${escapeHtml(e.text)}</div>
        <div class="enemy-label">HP</div>
        <div class="battle-bar"><i style="width:${gaugeRate}%"></i></div>
        <div class="enemy-label">受付時間 ${Math.max(0, e.patience).toFixed(1)}秒　ダブルタップでチェンジ</div>
        <div class="battle-bar patience"><i style="width:${patienceRate}%"></i></div>
        ${e.defeating ? `<div class="enemy-contract-label">成約!</div>` : ""}
        ${renderHitEffects(e.id)}
      </article>
    `;
  }

  function renderHitEffects(enemyId) {
    if (!state || !state.hitEffects) return "";
    const now = performance.now();
    const effects = state.hitEffects.filter(effect => effect.enemyId === enemyId);
    if (!effects.length) return "";

    return `<div class="enemy-hit-layer">${effects.map(effect => {
      const progress = Math.max(0, Math.min(1, (now - effect.createdAt) / effect.life));
      const opacity = Math.max(0, 1 - progress);
      const y = -22 * progress;
      const scale = 1 + progress * 0.18;
      return `<div class="enemy-hit-pop" style="--hit-color:${effect.color}; opacity:${opacity}; transform:translate(-50%, calc(-50% + ${y}px)) scale(${scale});">
        <span>${escapeHtml(effect.text)}</span>${effect.subText ? `<small>${escapeHtml(effect.subText)}</small>` : ""}
      </div>`;
    }).join("")}</div>`;
  }

  function renderStaff(s) {
    const ctReady = s.ct <= 0;
    const ctRate = Math.max(0, Math.min(100, 100 - (s.ct / s.ctMax) * 100));
    const skillReady = s.skill >= 100;
    const hasCardImage = !!s.cardImage;
    return `
      <button class="battle-member-card ${ctReady ? "ready" : "cooldown"} ${skillReady ? "skill-ready" : ""} ${s.isLeader ? "leader-card" : ""} ${hasCardImage ? "has-card-art" : ""}" style="--member-color:${s.color};" data-staff-id="${s.id}">
        ${hasCardImage ? `<div class="member-card-art"><img src="${escapeHtml(s.cardImage)}" alt=""></div>` : ""}
        <div class="member-card-info">
          <div class="member-name">${escapeHtml(s.name)}${s.isLeader ? `<em class="leader-badge">LEADER</em>` : ""}</div>
          <div class="member-attr">${escapeHtml(s.attr)}</div>
          <div class="member-power">通常1 / 特攻2</div>
          <div class="member-label">CT</div>
          <div class="battle-bar member-ct"><i style="width:${ctRate}%"></i></div>
          <div class="member-label">必殺 ${Math.floor(s.skill)}%</div>
          <div class="battle-bar member-skill"><i style="width:${Math.min(100, s.skill)}%"></i></div>
          <div class="member-skill-name">${skillReady ? `必殺OK：${escapeHtml(s.skillName)}` : escapeHtml(s.skillName)}</div>
        </div>
      </button>
    `;
  }

  function pulseStaff(staffId) {
    state.targetPreviewId = null;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function handleEnemyPointerUp(enemyId, event) {
    if (!state || !state.running) return;

    const now = performance.now();
    const isDoubleTap =
      pendingEnemyTapId === enemyId &&
      now - pendingEnemyTapAt <= ENEMY_DOUBLE_TAP_MS;

    if (isDoubleTap) {
      clearPendingEnemyTap();
      if (event) {
        event.preventDefault();
        event.stopPropagation();
      }
      requestEnemyChange(enemyId);
      return;
    }

    pendingEnemyTapId = enemyId;
    pendingEnemyTapAt = now;
  }

  function openDeckEditor() {
    if (!state || state.running) return;
    state.deckEdit = true;
    state.deckSelection = [...activeStaffIds];
    render();
  }

  function toggleDeckStaff(staffId) {
    if (!state || !state.deckEdit) return;
    const selected = state.deckSelection || [];
    if (selected.includes(staffId)) {
      state.deckSelection = selected.filter(id => id !== staffId);
    } else if (selected.length < 5) {
      state.deckSelection = [...selected, staffId];
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
    state.staff = getStaffBase().map(s => ({ ...s, ct: 0, skill: 0 }));
    state.deckEdit = false;
    state.lastActionText = `デッキを更新しました：${state.staff.map(s => s.name).join(" / ")}`;
    render();
  }

  function resetDeckSelection() {
    if (!state || !state.deckEdit) return;
    state.deckSelection = [...DEFAULT_STAFF_IDS];
    render();
  }

  function cancelDeckEditor() {
    if (!state || !state.deckEdit) return;
    state.deckEdit = false;
    state.deckSelection = [...activeStaffIds];
    render();
  }

  document.addEventListener("click", (event) => {
    if (!root || root.classList.contains("hidden")) return;
    const button = event.target.closest("button");
    if (!button || !root.contains(button)) return;

    event.preventDefault();
    event.stopPropagation();
    const action = button.dataset.action;
    const staffId = button.dataset.staffId;

    if (action === "start") startBattle(false);
    else if (action === "close") closeBattle();
    else if (action === "auto") startBattle(true);
    else if (action === "deckEdit") openDeckEditor();
    else if (action === "deckToggle") toggleDeckStaff(button.dataset.deckId);
    else if (action === "deckDecide") decideDeckSelection();
    else if (action === "deckReset") resetDeckSelection();
    else if (action === "deckCancel") cancelDeckEditor();
    else if (action === "autoToggle") toggleAutoBattle();
    else if (action === "help") return;
  });

  document.addEventListener("pointerdown", (event) => {
    if (!root || root.classList.contains("hidden")) return;

    const helpButton = event.target.closest('button[data-action="help"]');
    if (helpButton && root.contains(helpButton)) {
      handleHelpClick(event);
      return;
    }

    const staffButton = event.target.closest("button[data-staff-id]");
    if (!staffButton || !root.contains(staffButton)) return;
    handleStaffPointer(staffButton.dataset.staffId, event);
  }, { passive: false });

  document.addEventListener("pointerup", (event) => {
    if (!root || root.classList.contains("hidden")) return;

    const enemyCard = event.target.closest("[data-enemy-id]");
    if (enemyCard && root.contains(enemyCard)) {
      handleEnemyPointerUp(Number(enemyCard.dataset.enemyId), event);
      return;
    }
  }, { passive: false });

  window.BattleProto = { openBattle, closeBattle, startBattle, autoOneMove, toggleAutoBattle, useManagerHelp };
  window.startDeckBattlePrototype = openBattle;
})();


/* v039_49: legacy office return observer disabled in v039 namespace integration. */
(function(){ return;
  if (window.__TENOTSU_BATTLE_OFFICE_OBSERVER__) return;
  window.__TENOTSU_BATTLE_OFFICE_OBSERVER__ = true;
  window.addEventListener("load", function(){
    const root = document.getElementById("battle-root");
    if (!root || !window.MutationObserver) return;
    const obs = new MutationObserver(function(){
      if (root.classList.contains("hidden") && document.body.classList.contains("battle-screen")) {
        if (typeof window.tenotsuEnterOfficeMode === "function") window.tenotsuEnterOfficeMode("battle-end");
      }
    });
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
  });
})();
/* /v037_93 */
