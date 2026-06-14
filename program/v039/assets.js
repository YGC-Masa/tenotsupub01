/* v039_37 assets */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  ns.paths = {
    officeBg: "images/assets/bgev/bg_office_hidamari.png",
    shopBg: "images/assets/bgev/bg_item_exchange_counter.png",
    townBg: "images/assets/bgev/bg_park_spring.png",
    tsukumoTuningBg: "images/assets/bgev/bg_tsukumo_tuning.png",
    fallbackBg: "images/assets/bgev/bg_office_hidamari.png",
    transparentPixel: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==",
    charBase: "images/assets/char/"
  };

  ns.officeMembers = [
    ["星野 緋奈", "a10501.webp", "店長、今日も一緒にがんばりましょう！"],
    ["速水川 藍", "b10501.webp", "てんちょー、事務所でお待ちしていました。"],
    ["草壁 翠", "c10501.webp", "キミ、今日の予定は確認済みかな？"],
    ["小麦沢 こがね", "d10501.webp", "店長、今日もアゲてこー！"],
    ["春日原 琥珀", "e10501.webp", "旦那、困ったことがあったらオレに任せな！"],
    ["大道寺 真花", "f10501.webp", "店長、本日もよろしくお願いします。"],
    ["氷神 雪乃", "g10501.webp", "貴方様、無理はなさらないでくださいね。"],
    ["双沢 美空", "h10501.webp", "店長、今日も笑顔でいきましょう。"],
    ["双沢 夜空", "i10501.webp", "あんたの事、ちゃんと見てるからね。"],
    ["芝桜 桃", "j10501.webp", "店長、ウチ参上！"],
    ["紫藤 彩愛", "k10501.webp", "貴方、こちらで確認くださいませ。"],
    ["餅月 里美", "l10501.webp", "てんちょ～、お茶でも飲んでいきます～？"],
    ["草壁 萌", "m10501.webp", "おにいちゃん、ここにいるよ。"]
  ];


  ns.memberProfiles = [
    { name: "星野 緋奈", id: "aa", color: "#d3381c", role: "天真爛漫オールラウンダー", specialty: "テレビ・映像", image: "a10501.webp", comment: "店長、今日も一緒にがんばりましょう！" },
    { name: "速水川 藍", id: "ab", color: "#0067C0", role: "物静かな小柄お姉さん", specialty: "ドライヤー", image: "b10501.webp", comment: "てんちょー、事務所でお待ちしていました。" },
    { name: "草壁 翠", id: "ac", color: "#02b308", role: "知的ボーイッシュ", specialty: "パソコン", image: "c10501.webp", comment: "キミ、今日の予定は確認済みかな？" },
    { name: "小麦沢 こがね", id: "ad", color: "#FFF450", role: "全員愛され超ギャル", specialty: "スマホ", image: "d10501.webp", comment: "店長、今日もアゲてこー！" },
    { name: "春日原 琥珀", id: "ae", color: "#F68B1F", role: "天然アスリート", specialty: "オーディオ・イヤホン", image: "e10501.webp", comment: "旦那、困ったことがあったらオレに任せな！" },
    { name: "大道寺 真花", id: "af", color: "#C0C0C0", role: "ド正統派美少女", specialty: "美容品", image: "f10501.webp", comment: "店長、本日もよろしくお願いします。" },
    { name: "氷神 雪乃", id: "ag", color: "#6495ED", role: "ミステリアスクール", specialty: "調理器具", image: "g10501.webp", comment: "貴方様、無理はなさらないでくださいね。" },
    { name: "双沢 美空", id: "ah", color: "#fffef6", role: "明るく可愛い双子姉", specialty: "夏物・除湿", image: "h10501.webp", comment: "店長、今日も笑顔でいきましょう。" },
    { name: "双沢 夜空", id: "ai", color: "#00152d", role: "クールで綺麗な双子妹", specialty: "冬物・加湿", image: "i10501.webp", comment: "あんたの事、ちゃんと見てるからね。" },
    { name: "芝桜 桃", id: "aj", color: "#F7ADC3", role: "破天荒ポジティブ", specialty: "配信機材・ゲーム機", image: "j10501.webp", comment: "店長、ウチ参上！" },
    { name: "紫藤 彩愛", id: "ak", color: "#694D9F", role: "お嬢様ぽい庶民", specialty: "洗濯機・掃除機", image: "k10501.webp", comment: "貴方、こちらで確認くださいませ。" },
    { name: "餅月 里美", id: "al", color: "#8d5025", role: "ゆるふわ事務員", specialty: "事務・経理", image: "l10501.webp", comment: "てんちょ～、お茶でも飲んでいきます～？" },
    { name: "草壁 萌", id: "am", color: "#33CC99", role: "おとなしい甘えん坊妹系", specialty: "マッサージ・リラックス用品", image: "m10501.webp", comment: "おにいちゃん、ここにいるよ。" }
  ];



  // v039_104: メンバー詳細の自己紹介ボタン用シナリオ
  ns.memberIntroScenarioMap = {
    aa: "scenario/v039/events/intro_hina.json",
    ab: "scenario/v039/events/intro_ai.json",
    ac: "scenario/v039/events/intro_midori.json",
    ad: "scenario/v039/events/intro_kogane.json",
    ae: "scenario/v039/events/intro_kohaku.json",
    af: "scenario/v039/events/intro_manaka.json",
    ag: "scenario/v039/events/intro_yukino.json",
    ah: "scenario/v039/events/intro_misora.json",
    ai: "scenario/v039/events/intro_yozora.json",
    aj: "scenario/v039/events/intro_momo.json",
    ak: "scenario/v039/events/intro_ayame.json",
    al: "scenario/v039/events/intro_satomi.json",
    am: "scenario/v039/events/intro_moe.json"
  };
  ns.memberProfiles.forEach(function(member) {
    if (member && member.id && ns.memberIntroScenarioMap[member.id]) {
      member.introScenario = ns.memberIntroScenarioMap[member.id];
    }
  });

  ns.townSpots = [
    {
      id: "wakaba_central_park",
      name: "若葉中央公園",
      type: "ランドマーク",
      description: "日和坂市の中心にある、桜並木と川沿いの遊歩道がきれいな公園。",
      status: "藍・春イベント導線",
      speaker: "店長",
      message: "外回りの休憩がてら、若葉中央公園へ立ち寄ります。"
    },
    {
      id: "hidamari_shopping_street",
      name: "ひだまり商店街",
      type: "街エリア",
      description: "ひだまりストア周辺の商店街。買い物や地域イベントの中心地。",
      status: "後続接続予定",
      speaker: "店長",
      message: "商店街を見回ります。"
    },
    {
      id: "techlab_tsukumo",
      name: "テックラボつくも",
      type: "協力店",
      description: "PC修理・技術協力を担当する外部協力店。裏口には交換カウンターへの導線がある。",
      status: "交換所/VIP連携予定",
      speaker: "店長",
      message: "テックラボつくもへ向かいます。"
    }
  ];


  ns.nameColorMap = {
    "星野 緋奈": "#ff6b4a",
    "速水川 藍": "#4aa8ff",
    "草壁 翠": "#55e163",
    "小麦沢 こがね": "#ffe95c",
    "春日原 琥珀": "#ffad47",
    "大道寺 真花": "#e2e2e2",
    "氷神 雪乃": "#9cc8ff",
    "双沢 美空": "#fffef6",
    "双沢 夜空": "#6ca8ff",
    "芝桜 桃": "#ff9cc5",
    "紫藤 彩愛": "#b99cff",
    "餅月 里美": "#d49a63",
    "草壁 萌": "#63e6bd",
    "朔夜": "#b48cff",
    "宵闇 朔夜": "#b48cff",
    "店長": "#ffe2a3",
    "システム": "#ffffff"
  };

  ns.getReadableNameColor = function getReadableNameColor(name) {
    const raw = ns.nameColorMap && ns.nameColorMap[name] ? ns.nameColorMap[name] : "#ffe2a3";
    // Very dark colors, especially 夜空's original black, are mapped above to a readable display color.
    return raw;
  };

  ns.shuffle = function shuffle(source) {
    const arr = source.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
})();
