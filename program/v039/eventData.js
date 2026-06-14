/* v039_106 event data */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  ns.seasonOrder = ["spring", "summer", "autumn", "winter", "other", "event"];

  ns.seasonEvents = {
    spring: {
      id: "spring",
      label: "春",
      catchcopy: "桜、読書、お弁当。穏やかな出会いの季節。",
      bg: "images/assets/bgev/bg_park_spring.png",
      color: "#f7adc3",
      events: [
        {
          id: "ai_spring_book_bread",
          scenario: "scenario/v039/events/ai_spring_book_bread.json",
          title: "桜木陰のしおり",
          character: "速水川 藍",
          place: "若葉中央公園",
          status: "接続予定",
          bg: "images/assets/bgev/bg_park_spring.png",
          cg: "images/assets/bgev/bg_memory_ai_spring_book_bread_share.png",
          summary: "桜の木陰で本を読む藍ちゃんと、パンをきっかけに穏やかに過ごす春の思い出。",
          startMessage: "若葉中央公園へ向かいます。桜の木陰で読書する藍ちゃんに声をかけるイベントを、storyPlayerへ接続予定です。"
        },
        {
          id: "hina_spring_bento",
          scenario: "scenario/v039/events/hina_spring_bento.json",
          title: "春の公園でのお弁当タイム",
          character: "星野 緋奈",
          place: "若葉中央公園",
          status: "接続予定",
          bg: "images/assets/bgev/bg_park_spring.png",
          cg: "images/assets/bgev/bg_memory_hina_spring_bento.png",
          summary: "緋奈と春の公園でお弁当を食べる、明るく距離の近い日常イベント。",
          startMessage: "緋奈のお弁当イベントは、立ち姿とイベントCGを使った春シナリオとして接続予定です。"
        }
      ]
    },
    summer: {
      id: "summer",
      label: "夏",
      catchcopy: "海、展示、涼しさ。にぎやかな外回り。",
      bg: "images/assets/bgev/bg_park_summer.png",
      color: "#64c7ff",
      events: [
        {
          id: "kogane_natsu_marinpia",
          scenario: "scenario/v039/events/kogane_natsu_marinpia.json",
          title: "マリンピアの海中トンネル",
          character: "小麦沢 こがね / 日向 なつ",
          place: "マリンピア",
          status: "接続済み / 試作",
          bg: "images/assets/bgev/bg_beach.jpg",
          summary: "こがねとなつと一緒に、水槽の海中トンネル展示を見る夏イベント。スマホ展示と涼感演出のヒントも得る。",
          startMessage: "マリンピアの海中トンネル展示へ向かいます。"
        }
      ]
    },
    autumn: {
      id: "autumn",
      label: "秋",
      catchcopy: "夕暮れ、占い、ハロウィン。少し不思議な季節。",
      bg: "images/assets/bgev/bg_park_autumn.png",
      color: "#f68b1f",
      events: [
        {
          id: "moe_autumn_tarot",
          title: "秋のタロット相談",
          character: "草壁 萌",
          place: "ひだまり商店街",
          status: "構想中",
          bg: "images/assets/bgev/bg_park_autumn.png",
          summary: "萌のタロット占いと、秋の商店街イベントを絡めた相談イベント。",
          startMessage: "萌の秋イベントは、タロットとハロウィン導線を組み合わせて接続予定です。"
        }
      ]
    },
    winter: {
      id: "winter",
      label: "冬",
      catchcopy: "静けさ、加湿、雪景色。落ち着いた時間。",
      bg: "images/assets/bgev/bg_park_winter.png",
      color: "#6495ED",
      events: [
        {
          id: "yozora_winter_walk",
          title: "冬空の帰り道",
          character: "双沢 夜空",
          place: "川沿いの遊歩道",
          status: "構想中",
          bg: "images/assets/bgev/bg_park_winter.png",
          summary: "寒い季節の帰り道で、夜空と静かに話す冬イベント。",
          startMessage: "夜空の冬イベントは、冬物・加湿導線と合わせて接続予定です。"
        },
        {
          id: "yukino_winter_sweets",
          title: "雪乃のお菓子作り",
          character: "氷神 雪乃",
          place: "ひだまりストア周辺",
          status: "構想中",
          bg: "images/assets/bgev/bg_park_winter.png",
          summary: "雪乃のお菓子作りと冬の差し入れをテーマにしたイベント。",
          startMessage: "雪乃の冬イベントは、調理器具とお菓子作りの導線で接続予定です。"
        }
      ]

    },
    other: {
      id: "other",
      label: "その他",
      catchcopy: "共通導入、チュートリアル、世界観補足を確認します。",
      bg: "images/assets/bgev/bg_office_hidamari.png",
      color: "#9ad7ff",
      events: [
        {
          id: "sample_hina_kogane_new_juice_002",
          scenario: "scenario/v039/events/sample_hina_kogane_new_juice_002.json",
          title: "事務所にて緋奈＆こがね：新作ジュースは何の味？",
          character: "星野 緋奈 / 小麦沢 こがね / 草壁 翠",
          place: "ひだまりストア事務所",
          status: "接続済み / v039_106",
          bg: "images/assets/bgev/bg_office_hidamari.png",
          summary: "入手困難な新作ジュースをきっかけに、緋奈が照れて、こがねが無邪気にかき回し、翠が紙コップと分別の一言で締める日常会話イベント。",
          startMessage: "事務所で新作ジュースをめぐる、緋奈とこがねの会話イベントを開始します。"
        },
        {
          id: "common_opening_kadenseijin_raid_002_all_cast",
          scenario: "scenario/v039/events/common_opening_kadenseijin_raid_002_all_cast.json",
          title: "共通オープニング：家電星人襲来・全員登場版",
          character: "ひだまりストア全員 / 家電星人",
          place: "事務所 / 倉庫",
          status: "接続済み",
          bg: "images/assets/bgev/bg_office_hidamari.png",
          summary: "倉庫在庫消失事件をきっかけに、ひだまりストア全員が家電星人と出会う共通導入イベント。",
          startMessage: "家電星人襲来の共通オープニングを開始します。"
        },
        {
          id: "biribiri_intro_rival_battle_unlock_003_flow_fix",
          scenario: "scenario/v039/events/biribiri_intro_rival_battle_unlock_003_flow_fix.json",
          title: "ビリビリ電機登場：初来店と販売勝負",
          character: "天神 小春 / 霧島 真冬 / 日向 なつ",
          place: "ひだまりストア店頭",
          status: "接続済み / VSビリビリ解放",
          bg: "images/assets/bgev/bg_office_hidamari.png",
          cg: "images/assets/rival/biribiri_battle_eyecatch.jpeg",
          summary: "ビリビリ電機の小春・真冬・なつが来店チャイムとともにひだまりストアへ来店し、販売勝負を宣言する対戦モード解放ストーリー。",
          startMessage: "ビリビリ電機との最初の接点を確認します。"
        },
        {
          id: "event_black_kadenseijin_battle_unlock_003_ayame_line_fix",
          scenario: "scenario/v039/events/event_black_kadenseijin_battle_unlock_003_ayame_line_fix.json",
          title: "イベントバトル解放：ブラック家電星人を助けて",
          character: "ひだまりストア / ビリビリ電機 / ブラック家電星人",
          place: "ひだまりストア店内",
          status: "接続済み / イベントバトル解放",
          bg: "images/assets/bgev/bg_office_hidamari.png",
          summary: "メンテナンス不足でブラック化した家電星人を助けるため、ひだまりストアとビリビリ電機が一時共闘するイベントバトル解放ストーリー。",
          startMessage: "ブラック家電星人を助けるイベントバトル解放ストーリーを開始します。"
        },
        {
          id: "shop_exchange_intro_sakuya",
          scenario: "scenario/v039/events/shop_exchange_intro_sakuya.json",
          title: "アイテム交換所解放：朔夜の交換カウンター",
          character: "宵闇 朔夜",
          place: "テックラボつくも / 交換カウンター",
          status: "接続済み / 交換所解放",
          bg: "images/assets/bgev/bg_exchange_item_counter.png",
          summary: "朔夜と出会い、イベント交換所の使い方を確認する解放ストーリー。",
          startMessage: "朔夜の交換カウンターへ向かいます。"
        },
        {
          id: "c10002",
          scenario: "scenario/v039/events/c10002.json",
          title: "一度くらいなら……事務所にて（翠）",
          character: "草壁 翠 / 星野 緋奈",
          place: "ひだまりストア事務所",
          status: "接続済み / 旧シナリオ変換",
          bg: "images/assets/bgev/bg011.jpg",
          summary: "事務所で翠と店長が、衣装資料をめぐって少しだけ距離を縮める旧シナリオ。",
          startMessage: "事務所での翠の旧シナリオを開始します。"

        }
      ]
    },
    event: {
      id: "event",
      label: "イベント",
      catchcopy: "月間イベント、清掃バトル、限定導線を確認します。",
      bg: "images/assets/bgev/bg_exchange_counter.png",
      color: "#a786ff",
      events: [
        {
          id: "monthly_dirty_alien_cleaning",
          title: "月間イベント：汚れた家電星人清掃",
          character: "ひだまりメンバー / ブラック家電星人",
          place: "イベントバトル",
          status: "店舗営業から接続",
          bg: "images/assets/bgev/bg_exchange_counter.png",
          summary: "メンテナンス不足で汚れた家電星人を清掃し、ダークエレメントを回収する月間イベント導線。",
          startMessage: "イベントバトルは店舗営業のイベント営業から開始できます。"
        }
      ]
    }
  };


  // v039_61: 思い出回想カテゴリ案。UI接続は後続、まずは回想データの置き場を用意。
  ns.memoryReplayCategories = [
    {
      id: "character",
      label: "キャラ思い出",
      desc: "各メンバーとの季節イベント・個別ストーリーを振り返る項目です。"
    },
    {
      id: "tutorial",
      label: "チュートリアル",
      desc: "ゲーム内システムや世界観導入をもう一度確認する項目です。",
      entries: [
        {
          id: "tutorial_appliance_alien_raid",
          title: "家電星人襲来",
          status: "構想中",
          summary: "家電星人が来店し、ひだまりストアの接客バトルが始まる導入ストーリー。"
        },
        {
          id: "tutorial_sakuya_shop_unlock",
          title: "朔夜のショップ解禁",
          status: "構想中",
          summary: "テックラボつくもの裏口/VIP導線と、交換・ショップ機能の解禁ストーリー。"
        },
        {
          id: "tutorial_battle_first",
          title: "はじめての店舗営業",
          status: "接続候補",
          summary: "通常営業・バトル営業・イベント営業の違いを説明する回想用チュートリアル。"
        }
      ]
    },
    {
      id: "system_unlock",
      label: "解禁ストーリー",
      desc: "ショップ、イベント交換、ボス戦など機能解放時の短い導入をまとめる項目です。"
    }
  ];

  ns.getMemoryReplayCategories = function getMemoryReplayCategories() {
    return ns.memoryReplayCategories || [];
  };

  ns.getSeason = function getSeason(seasonId) {
    return ns.seasonEvents && ns.seasonEvents[seasonId] ? ns.seasonEvents[seasonId] : null;
  };

  ns.getEventById = function getEventById(eventId) {
    for (const seasonId of ns.seasonOrder || []) {
      const season = ns.getSeason(seasonId);
      if (!season) continue;
      const found = (season.events || []).find((event) => event.id === eventId);
      if (found) return { season, event: found };
    }
    return null;
  };
})();
