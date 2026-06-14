/* v039_56 character growth base */
(function () {
  "use strict";
  const STORAGE_KEY = "tenotsu_character_growth_v1";
  const LEVEL_CAP = 50;

  const STAT_DEFS = {
    proposal: { label: "提案", desc: "お客様に合う商品をすすめる力。売上額に影響します。" },
    speed: { label: "手際", desc: "次の行動までの速さ。リロードタイムに影響します。" },
    stamina: { label: "根気", desc: "忙しい営業でも崩れにくい力。コンボやボーナス補正に影響します。" },
    care: { label: "丁寧", desc: "一人ひとりに寄り添う力。お客様が離れにくくなります。" },
    honesty: { label: "誠実", desc: "信頼される接客力。店長HELPゲージ上昇に影響します。" },
    luck: { label: "運", desc: "思わぬ成果を引き寄せる力。アイテムドロップ率に影響します。" }
  };
  const STAT_KEYS = Object.keys(STAT_DEFS);
  const GROWTH_VALUE = { S: 1.35, A: 1.15, B: 1.0, C: 0.85, D: 0.7 };

  const CHARACTER_DEFS = {
    aa: { name: "星野 緋奈", shortName: "緋奈", base: { proposal: 15, speed: 12, stamina: 13, care: 13, honesty: 12, luck: 11 }, growth: { proposal: "A", speed: "B", stamina: "B", care: "B", honesty: "B", luck: "C" } },
    ab: { name: "速水川 藍", shortName: "藍", base: { proposal: 10, speed: 11, stamina: 12, care: 16, honesty: 15, luck: 12 }, growth: { proposal: "C", speed: "B", stamina: "B", care: "S", honesty: "A", luck: "B" } },
    ac: { name: "草壁 翠", shortName: "翠", base: { proposal: 14, speed: 16, stamina: 13, care: 12, honesty: 13, luck: 10 }, growth: { proposal: "A", speed: "S", stamina: "B", care: "C", honesty: "B", luck: "D" } },
    ad: { name: "小麦沢 こがね", shortName: "こがね", base: { proposal: 15, speed: 14, stamina: 11, care: 12, honesty: 11, luck: 16 }, growth: { proposal: "A", speed: "A", stamina: "C", care: "B", honesty: "C", luck: "S" } },
    ae: { name: "春日原 琥珀", shortName: "琥珀", base: { proposal: 13, speed: 15, stamina: 16, care: 11, honesty: 13, luck: 11 }, growth: { proposal: "B", speed: "A", stamina: "S", care: "C", honesty: "B", luck: "C" } },
    af: { name: "大道寺 真花", shortName: "真花", base: { proposal: 11, speed: 10, stamina: 12, care: 16, honesty: 15, luck: 12 }, growth: { proposal: "C", speed: "D", stamina: "B", care: "S", honesty: "A", luck: "B" } },
    ag: { name: "氷神 雪乃", shortName: "雪乃", base: { proposal: 12, speed: 11, stamina: 15, care: 15, honesty: 14, luck: 10 }, growth: { proposal: "B", speed: "C", stamina: "A", care: "A", honesty: "A", luck: "D" } },
    ah: { name: "双沢 美空", shortName: "美空", base: { proposal: 13, speed: 13, stamina: 12, care: 14, honesty: 14, luck: 12 }, growth: { proposal: "B", speed: "B", stamina: "B", care: "A", honesty: "A", luck: "B" } },
    ai: { name: "双沢 夜空", shortName: "夜空", base: { proposal: 12, speed: 15, stamina: 13, care: 12, honesty: 13, luck: 11 }, growth: { proposal: "B", speed: "A", stamina: "B", care: "C", honesty: "B", luck: "C" } },
    aj: { name: "芝桜 桃", shortName: "桃", base: { proposal: 14, speed: 14, stamina: 10, care: 10, honesty: 10, luck: 17 }, growth: { proposal: "A", speed: "A", stamina: "D", care: "D", honesty: "C", luck: "S" } },
    ak: { name: "紫藤 彩愛", shortName: "彩愛", base: { proposal: 12, speed: 11, stamina: 13, care: 17, honesty: 15, luck: 10 }, growth: { proposal: "B", speed: "C", stamina: "B", care: "S", honesty: "A", luck: "D" } },
    al: { name: "餅月 里美", shortName: "里美", base: { proposal: 11, speed: 13, stamina: 16, care: 14, honesty: 13, luck: 15 }, growth: { proposal: "C", speed: "B", stamina: "S", care: "A", honesty: "B", luck: "A" } },
    am: { name: "草壁 萌", shortName: "萌", base: { proposal: 10, speed: 11, stamina: 12, care: 16, honesty: 14, luck: 13 }, growth: { proposal: "D", speed: "C", stamina: "B", care: "S", honesty: "A", luck: "B" } }
  };

  function clone(obj) { return JSON.parse(JSON.stringify(obj)); }
  function normalizeId(charId) {
    const id = String(charId || "").trim();
    const aliases = { hina: "aa", ai: "ab", midori: "ac", kogane: "ad", kohaku: "ae", manaka: "af", yukino: "ag", misora: "ah", yozora: "ai", momo: "aj", ayame: "ak", satomi: "al", moe: "am" };
    return aliases[id] || id;
  }
  function defaultCharacterState() {
    const characters = {};
    Object.keys(CHARACTER_DEFS).forEach((id) => {
      characters[id] = { level: 1, exp: 0, totalExp: 0, equipment: { personal: null } };
    });
    return { version: "v039_56", characters, updatedAt: new Date().toISOString() };
  }
  function loadState() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { data = null; }
    const base = defaultCharacterState();
    if (!data || typeof data !== "object") return base;
    data.characters = data.characters && typeof data.characters === "object" ? data.characters : {};
    Object.keys(base.characters).forEach((id) => {
      const cur = data.characters[id] || {};
      data.characters[id] = {
        level: clampLevel(cur.level || 1),
        exp: Math.max(0, Math.floor(Number(cur.exp) || 0)),
        totalExp: Math.max(0, Math.floor(Number(cur.totalExp) || 0)),
        equipment: cur.equipment && typeof cur.equipment === "object" ? Object.assign({ personal: null }, cur.equipment) : { personal: null }
      };
    });
    data.version = data.version || "v039_56";
    return data;
  }
  function saveState(data) {
    data.updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    return data;
  }
  function clampLevel(level) { return Math.max(1, Math.min(LEVEL_CAP, Math.floor(Number(level) || 1))); }
  function getRequiredExp(level) {
    const lv = clampLevel(level);
    if (lv >= LEVEL_CAP) return Infinity;
    return Math.floor(60 + lv * 45 + lv * lv * 4);
  }
  function getLevelProgress(charId) {
    const st = getCharacterState(charId);
    const need = getRequiredExp(st.level);
    return { level: st.level, exp: st.exp, required: need, ratio: need === Infinity ? 1 : Math.max(0, Math.min(1, st.exp / need)) };
  }
  function getCharacterState(charId) {
    const id = normalizeId(charId);
    const data = loadState();
    return clone(data.characters[id] || { level: 1, exp: 0, totalExp: 0, equipment: { personal: null } });
  }
  function getComputedStats(charId) {
    const id = normalizeId(charId);
    const def = CHARACTER_DEFS[id];
    if (!def) return null;
    const st = getCharacterState(id);
    const stats = {};
    STAT_KEYS.forEach((key) => {
      const base = Number(def.base[key]) || 0;
      const rank = def.growth[key] || "B";
      const perLevel = GROWTH_VALUE[rank] || 1;
      stats[key] = Math.floor(base + (st.level - 1) * perLevel);
    });
    return stats;
  }
  function addExp(charId, amount, source = "店舗営業") {
    const id = normalizeId(charId);
    if (!CHARACTER_DEFS[id]) return null;
    const gain = Math.max(0, Math.floor(Number(amount) || 0));
    const data = loadState();
    const st = data.characters[id] || { level: 1, exp: 0, totalExp: 0, equipment: { personal: null } };
    const before = { level: clampLevel(st.level), exp: Math.max(0, Math.floor(Number(st.exp) || 0)), stats: getComputedStats(id) };
    st.level = before.level;
    st.exp = before.exp + gain;
    st.totalExp = Math.max(0, Math.floor(Number(st.totalExp) || 0)) + gain;
    const levelUps = [];
    while (st.level < LEVEL_CAP) {
      const need = getRequiredExp(st.level);
      if (st.exp < need) break;
      st.exp -= need;
      st.level += 1;
      levelUps.push(st.level);
    }
    if (st.level >= LEVEL_CAP) st.exp = 0;
    st.equipment = st.equipment && typeof st.equipment === "object" ? Object.assign({ personal: null }, st.equipment) : { personal: null };
    data.characters[id] = st;
    saveState(data);
    const after = { level: st.level, exp: st.exp, stats: getComputedStats(id) };
    return { id, name: CHARACTER_DEFS[id].name, shortName: CHARACTER_DEFS[id].shortName, source, gainedExp: gain, before, after, levelUps };
  }
  function addExpToParty(charIds, amount, source = "店舗営業") {
    const unique = [];
    (Array.isArray(charIds) ? charIds : []).forEach((id) => {
      const normalized = normalizeId(id);
      if (CHARACTER_DEFS[normalized] && !unique.includes(normalized)) unique.push(normalized);
    });
    return unique.map((id) => addExp(id, amount, source)).filter(Boolean);
  }
  function getDebugSummary() {
    const data = loadState();
    return Object.keys(CHARACTER_DEFS).map((id) => ({ id, name: CHARACTER_DEFS[id].shortName, state: data.characters[id], stats: getComputedStats(id) }));
  }

  window.TenotsuGrowth = {
    VERSION: "v039_56",
    LEVEL_CAP,
    STAT_DEFS: clone(STAT_DEFS),
    CHARACTER_DEFS: clone(CHARACTER_DEFS),
    getStatDefs: () => clone(STAT_DEFS),
    getCharacterGrowthDefs: () => clone(CHARACTER_DEFS),
    getCharacterState,
    getLevelProgress,
    getRequiredExp,
    getComputedStats,
    addExp,
    addExpToParty,
    getDebugSummary,
    load: loadState,
    save: saveState,
    normalizeId
  };
})();
