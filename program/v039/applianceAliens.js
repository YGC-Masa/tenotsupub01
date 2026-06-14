/* v039_69 appliance alien dual-personality data + rival VS CPU skill table */
(function () {
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};

  const BASE_ALIENS = {
    tv_popcorn: {
      id: "tv_popcorn", name: "テレビポップコーン星人", shortName: "テレビポップコーン", category: "video", need: "映像相談", weak: "tv",
      baseHp: 2, baseValue: 130, leaveSpeed: 1.0, preferredStat: "proposal",
      baseTrait: "映像家電の提案に反応しやすく、売上がやや高め。", pairedMember: "hina"
    },
    choco_dryer: {
      id: "choco_dryer", name: "チョコドライヤ星人", shortName: "チョコドライヤ", category: "dryer", need: "ドライヤー相談", weak: "dryer",
      baseHp: 2, baseValue: 105, leaveSpeed: 0.9, preferredStat: "care",
      baseTrait: "丁寧な説明で離脱しにくくなる。", pairedMember: "ai"
    },
    pc_pizza: {
      id: "pc_pizza", name: "パソコンピザ星人", shortName: "パソコンピザ", category: "pc", need: "PC相談", weak: "pc",
      baseHp: 3, baseValue: 140, leaveSpeed: 1.05, preferredStat: "proposal",
      baseTrait: "耐久が高く、提案と手際の両方が重要。", pairedMember: "midori"
    },
    phone_candy: {
      id: "phone_candy", name: "スマホキャンディ星人", shortName: "スマホキャンディ", category: "phone", need: "スマホ相談", weak: "phone",
      baseHp: 1, baseValue: 95, leaveSpeed: 1.18, preferredStat: "speed",
      baseTrait: "出現頻度が高く、手際よくさばきたい。", pairedMember: "kogane"
    },
    audio_gummy: {
      id: "audio_gummy", name: "イヤホングミ星人", shortName: "イヤホングミ", category: "audio", need: "オーディオ相談", weak: "audio",
      baseHp: 2, baseValue: 110, leaveSpeed: 1.0, preferredStat: "stamina",
      baseTrait: "連続接客のコンボ補正が伸びやすい。", pairedMember: "kohaku"
    },
    beauty_macaron: {
      id: "beauty_macaron", name: "ビューティマカロン星人", shortName: "ビューティマカロン", category: "beauty", need: "美容家電相談", weak: "beauty",
      baseHp: 2, baseValue: 120, leaveSpeed: 0.92, preferredStat: "care",
      baseTrait: "丁寧対応で報酬が伸びやすい。", pairedMember: "manaka"
    },
    pudding_oven: {
      id: "pudding_oven", name: "プリンオーブン星人", shortName: "プリンオーブン", category: "cooking", need: "調理家電相談", weak: "cooking",
      baseHp: 3, baseValue: 150, leaveSpeed: 0.98, preferredStat: "stamina",
      baseTrait: "根気が必要だが、成功時の売上が高い。", pairedMember: "yukino"
    },
    shavedice_aircon: {
      id: "shavedice_aircon", name: "カキゴーリエアコン星人", shortName: "カキゴーリエアコン", category: "summer", need: "夏物家電相談", weak: "summer",
      baseHp: 2, baseValue: 115, leaveSpeed: 1.22, preferredStat: "speed",
      baseTrait: "離脱が早めで、手際が活きる。", pairedMember: "misora"
    },
    jelly_humidifier: {
      id: "jelly_humidifier", name: "ゼリーカシツ星人", shortName: "ゼリーカシツ", category: "winter", need: "加湿・冬物相談", weak: "winter",
      baseHp: 2, baseValue: 110, leaveSpeed: 0.95, preferredStat: "honesty",
      baseTrait: "対応成功で店長HELPゲージが伸びやすい。", pairedMember: "yozora"
    },
    game_potato: {
      id: "game_potato", name: "ゲームポテト星人", shortName: "ゲームポテト", category: "game", need: "ゲーム・配信相談", weak: "game",
      baseHp: 2, baseValue: 105, leaveSpeed: 1.08, preferredStat: "luck",
      baseTrait: "運とドロップ報酬に寄った個性。", pairedMember: "momo"
    },
    donut_washer: {
      id: "donut_washer", name: "ドーナツセンタク星人", shortName: "ドーナツセンタク", category: "laundry", need: "洗濯機相談", weak: "laundry",
      baseHp: 3, baseValue: 125, leaveSpeed: 0.9, preferredStat: "care",
      baseTrait: "丁寧・根気で安定して報酬を得やすい。", pairedMember: "ayame"
    },
    mochi_register: {
      id: "mochi_register", name: "モチモチレジスター星人", shortName: "モチモチレジスター", category: "office", need: "会計・事務相談", weak: "office",
      baseHp: 2, baseValue: 145, leaveSpeed: 1.0, preferredStat: "proposal",
      baseTrait: "売上と事務系報酬に寄った個性。", pairedMember: "satomi"
    },
    marshmallow_massage: {
      id: "marshmallow_massage", name: "マシュマロマッサージ星人", shortName: "マシュマロマッサージ", category: "relax", need: "リラックス家電相談", weak: "relax",
      baseHp: 2, baseValue: 100, leaveSpeed: 0.82, preferredStat: "care",
      baseTrait: "離脱しにくく、補助系報酬に寄る。", pairedMember: "moe"
    }
  };

  const TRAITS = {
    normal: { id: "normal", label: "ふつう", desc: "標準的な個体。", hpRate: 1, valueRate: 1, leaveSpeedRate: 1, comboRate: 1, dropRate: 1, helpRate: 1, rivalPullRate: 1 },
    tough: { id: "tough", label: "かたい", desc: "必要対応回数が多いが、売上が少し高い。", hpRate: 1.5, valueRate: 1.15, leaveSpeedRate: 0.95 },
    impatient: { id: "impatient", label: "せっかち", desc: "離脱が早いが、成功時のコンボ補正が高い。", leaveSpeedRate: 1.35, comboRate: 1.15 },
    generous: { id: "generous", label: "太っ腹", desc: "売上が高い。", valueRate: 1.35 },
    rare_lover: { id: "rare_lover", label: "レア好き", desc: "アイテムドロップ率が高い。", dropRate: 1.6 },
    help_lover: { id: "help_lover", label: "HELP好き", desc: "店長HELPゲージが溜まりやすい。", helpRate: 1.45 },
    picky: { id: "picky", label: "こだわり", desc: "得意カテゴリ以外では効率が落ちるが、相性一致時の報酬が高い。", matchedRate: 1.2, mismatchRate: 0.8 },
    relaxed: { id: "relaxed", label: "のんびり", desc: "離脱しにくいが、対応完了まで少し長い。", hpRate: 1.2, leaveSpeedRate: 0.75 },
    wavering: { id: "wavering", label: "迷い", desc: "ビリビリバトルで相手側に流れやすい。", rivalPullRate: 1.35 },
    big_order: { id: "big_order", label: "大口客", desc: "要求値は高いが、売上とスコアが大きい。", hpRate: 1.8, valueRate: 1.6 },
    regular: { id: "regular", label: "常連気質", desc: "成功時に経験値や好感度報酬が少し伸びる。", expRate: 1.15, affinityRate: 1.1 }
  };

  const RIVAL_SKILLS = {
    koharu: [
      {
        id: "koharu_promo_rush", owner: "koharu", name: "天神 小春", label: "ビリビリ販促ラッシュ", type: "rivalScoreBuff", unlockPlayerLevel: 1,
        desc: "一定時間、ビリビリ側のスコア倍率を上げる。", scoreRate: 1.3, durationSec: 8, cooldownSec: 18, weight: 10
      },
      {
        id: "koharu_best_biribiri", owner: "koharu", name: "天神 小春", label: "うちらが最高やけん！", type: "rivalGaugeFull", unlockPlayerLevel: 20,
        desc: "ビリビリ3人全員の必殺技ゲージを即時満タンにする。", fillAllRivalSkillGauge: true, cooldownSec: 32, weight: 6
      },
      {
        id: "koharu_flash_sale", owner: "koharu", name: "天神 小春", label: "今だけビリビリ特価！", type: "rivalScoreBurst", unlockPlayerLevel: 40,
        desc: "短時間だけビリビリ側のスコア獲得量を大きく上げる。", scoreRate: 1.6, durationSec: 5, cooldownSec: 34, weight: 4
      }
    ],
    mafuyu: [
      {
        id: "mafuyu_price_compare", owner: "mafuyu", name: "霧島 真冬", label: "冷静な価格比較", type: "playerMultiplierDebuff", unlockPlayerLevel: 1,
        desc: "一定時間、こちらのスコア倍率を下げる。", playerScoreRate: 0.85, durationSec: 7, cooldownSec: 20, weight: 10
      },
      {
        id: "mafuyu_take_a_rest", owner: "mafuyu", name: "霧島 真冬", label: "少し休んだら如何ですか？", type: "playerMemberRecastCancel", unlockPlayerLevel: 20,
        desc: "こちらの特定メンバー1人のリキャストをキャンセルし、再行動まで待たせる。", targetCount: 1, recastResetRate: 1, cooldownSec: 28, weight: 6
      },
      {
        id: "mafuyu_probability_lock", owner: "mafuyu", name: "霧島 真冬", label: "勝率は計算済みです", type: "playerComboLock", unlockPlayerLevel: 40,
        desc: "一定時間、こちらのコンボ倍率上昇を抑える。", comboGainRate: 0.55, durationSec: 8, cooldownSec: 34, weight: 4
      }
    ],
    natsu: [
      {
        id: "natsu_scary_seal", owner: "natsu", name: "日向 なつ", label: "みなさん怖いです～", type: "playerMemberSkillSeal", unlockPlayerLevel: 1,
        desc: "こちらの特定メンバー1人の必殺技をしばらく封印する。", targetCount: 1, sealSec: 7, cooldownSec: 24, weight: 10
      },
      {
        id: "natsu_come_here", owner: "natsu", name: "日向 なつ", label: "みんな～、こっちがいいよ～", type: "alienCharmCountdown", unlockPlayerLevel: 20,
        desc: "場の家電星人を何人か魅了する。カウント以内に対応できないとビリビリ側のスコアになる。", charmCount: 2, countdownSec: 6, rivalScoreRate: 1.0, cooldownSec: 30, weight: 6
      },
      {
        id: "natsu_manager_on_our_side", owner: "natsu", name: "日向 なつ", label: "店長さんはこっちの味方？", type: "playerHelpReset", unlockPlayerLevel: 40,
        desc: "店長HELPがある場合、こちらの店長HELPゲージをすべてリセットする。", resetHelpGauge: true, requirePlayerHelpGauge: true, cooldownSec: 36, weight: 4
      }
    ]
  };

  const RIVAL_SKILL_UNLOCKS = {
    1: "初期スキル。ビリビリバトルの基本行動。",
    20: "プレイヤーレベル20以上で追加。妨害・取り合い要素が強くなる。",
    40: "プレイヤーレベル40以上で追加。短時間の大きな揺さぶりを入れる。"
  };

  const RIVAL_BATTLE_DESIGN = {
    layout: "通常営業の家電星人枠を小さくし、上段に小春・真冬・なつのカードを置く取り合いバトル。",
    difficulty: "サポートモード程度。手動操作なら勝ちやすく、オートでは負けることがある強さ。",
    skillPolicy: "ビリビリ側はプレイヤーレベル帯で解禁された必殺技からランダムに使用する。",
    unlockLevels: [1, 20, 40],
    targetWinRate: { manualBeginner: "70-80%", manualSkilled: "90%+", auto: "50-60%", trainedAuto: "75-85%" }
  };

  function pickTraitId(options) {
    const list = Array.isArray(options) && options.length ? options : ["normal", "tough", "impatient", "generous", "rare_lover", "help_lover", "picky", "relaxed"];
    return list[Math.floor(Math.random() * list.length)] || "normal";
  }

  function buildAlienInstance(alienId, traitId) {
    const base = BASE_ALIENS[alienId] || BASE_ALIENS.tv_popcorn;
    const trait = TRAITS[traitId] || TRAITS.normal;
    const hp = Math.max(1, Math.round(base.baseHp * (trait.hpRate || 1)));
    const value = Math.max(1, Math.round(base.baseValue * (trait.valueRate || 1)));
    return Object.assign({}, base, {
      alienId: base.id,
      traitId: trait.id,
      traitLabel: trait.label,
      traitDesc: trait.desc,
      hp,
      value,
      leaveSpeed: Number((base.leaveSpeed * (trait.leaveSpeedRate || 1)).toFixed(2)),
      comboRate: trait.comboRate || 1,
      dropRate: trait.dropRate || 1,
      helpRate: trait.helpRate || 1,
      expRate: trait.expRate || 1,
      rivalPullRate: trait.rivalPullRate || 1,
      displayName: trait.id === "normal" ? base.name : `${trait.label}の${base.name}`
    });
  }

  function pickAlienInstance(options = {}) {
    const ids = Object.keys(BASE_ALIENS);
    const alienId = options.alienId || ids[Math.floor(Math.random() * ids.length)] || "tv_popcorn";
    const traitId = options.traitId || pickTraitId(options.traits);
    return buildAlienInstance(alienId, traitId);
  }

  function pickAlienInstances(count = 3, options = {}) {
    const out = [];
    for (let i = 0; i < count; i += 1) out.push(pickAlienInstance(options));
    return out;
  }

  function flattenRivalSkills() {
    return Object.keys(RIVAL_SKILLS).reduce((list, owner) => list.concat(RIVAL_SKILLS[owner]), []);
  }

  function getRivalSkillsForLevel(playerLevel = 1, owner = null) {
    const lv = Math.max(1, Math.floor(Number(playerLevel) || 1));
    const source = owner && RIVAL_SKILLS[owner] ? RIVAL_SKILLS[owner] : flattenRivalSkills();
    return source.filter((skill) => lv >= (skill.unlockPlayerLevel || 1));
  }

  function pickWeighted(list) {
    const pool = Array.isArray(list) ? list.filter(Boolean) : [];
    if (!pool.length) return null;
    const total = pool.reduce((sum, item) => sum + Math.max(1, Number(item.weight) || 1), 0);
    let roll = Math.random() * total;
    for (const item of pool) {
      roll -= Math.max(1, Number(item.weight) || 1);
      if (roll <= 0) return item;
    }
    return pool[pool.length - 1];
  }

  function pickRandomRivalSkill(playerLevel = 1, owner = null) {
    return pickWeighted(getRivalSkillsForLevel(playerLevel, owner));
  }

  window.TenotsuApplianceAliens = {
    VERSION: "v039_69",
    BASE_ALIENS,
    TRAITS,
    RIVAL_SKILLS,
    RIVAL_SKILL_UNLOCKS,
    RIVAL_BATTLE_DESIGN,
    buildAlienInstance,
    pickAlienInstance,
    pickAlienInstances,
    flattenRivalSkills,
    getRivalSkillsForLevel,
    pickRandomRivalSkill
  };
  ns.applianceAliens = window.TenotsuApplianceAliens;
})();
