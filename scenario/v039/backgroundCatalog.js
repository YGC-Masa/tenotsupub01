/* v039_144 若葉中央公園冬背景＋夜空70-80帯リライト用背景互換 */
(function(){
  "use strict";
  window.TENOTSU_BACKGROUND_CATALOG = Object.assign({}, window.TENOTSU_BACKGROUND_CATALOG || {}, {
    hidamari_store_sales_floor: { name: "ひだまりストア店内売り場・正式", path: "images/assets/bg/battle_store_lv1.png", status: "正式採用" },
    battle_store_lv1: { name: "ひだまりストア店内売り場・正式（互換）", path: "images/assets/bg/battle_store_lv1.png", status: "正式採用" },
    hidamari_office: { name: "ひだまりストア事務所・正式", path: "images/assets/bgev/bg_office_hidamari.png", status: "正式採用" },
    office_hidamari: { name: "ひだまりストア事務所・正式（互換）", path: "images/assets/bgev/bg_office_hidamari.png", status: "正式採用" },
    hiyorizaka_sports_park_budokan_evening: { name: "日和坂総合運動公園・武術演武奉納祭・広場特設演舞場（互換）", path: "images/assets/bg/bg_hiyorizaka_bujutsu_hounousai_stage_day.png", status: "正式採用" },
    hiyorizaka_sports_park_budokan: { name: "日和坂総合運動公園・武術演武奉納祭・広場特設演舞場（互換）", path: "images/assets/bg/bg_hiyorizaka_bujutsu_hounousai_stage_day.png", status: "正式採用" },

    hidamari_warehouse: { name: "ひだまりストア倉庫・正式", path: "images/assets/bg/bg_hidamari_warehouse.png", status: "正式採用" },
    hidamari_store_front_night: { name: "ひだまりストア前・夜（旧暫定/互換）", path: "images/assets/bg/bg_hidamari_store_front_night_open.png" },

    hidamari_store_front_early_morning: { name: "ひだまりストア外観・早朝", path: "images/assets/bg/bg_hidamari_store_front_early_morning.png" },
    hidamari_store_front_morning: { name: "ひだまりストア外観・朝", path: "images/assets/bg/bg_hidamari_store_front_morning.png" },
    hidamari_store_front_day: { name: "ひだまりストア外観・昼", path: "images/assets/bg/bg_hidamari_store_front_day.png" },
    hidamari_store_front_evening: { name: "ひだまりストア外観・夕方", path: "images/assets/bg/bg_hidamari_store_front_evening.png" },
    hidamari_store_front_night_open: { name: "ひだまりストア外観・夜", path: "images/assets/bg/bg_hidamari_store_front_night_open.png" },
    hidamari_store_front_closed: { name: "ひだまりストア外観・閉店後", path: "images/assets/bg/bg_hidamari_store_front_closed.png" },

    planetarium_exterior_twilight: { name: "星見ヶ丘プラネタリウム・外観", path: "images/assets/bg/bg_planetarium_exterior_twilight.png" },
    planetarium_lobby: { name: "星見ヶ丘プラネタリウム・ロビー", path: "images/assets/bg/bg_planetarium_lobby.png" },
    planetarium_hall_before_show: { name: "星見ヶ丘プラネタリウム・投影ホール", path: "images/assets/bg/bg_planetarium_hall_before_show.png" },
    planetarium_hall_showing: { name: "星見ヶ丘プラネタリウム・開演中ホール", path: "images/assets/bg/bg_planetarium_hall_showing.png" },

    sugosawa_house_day: { name: "双沢家・昼", path: "images/assets/bg/bg_sugosawa_house_day.png" },
    sugosawa_house_night: { name: "双沢家・夜", path: "images/assets/bg/bg_sugosawa_house_night.png" },

    sugosawa_room_day: { name: "双沢姉妹の部屋・昼", path: "images/assets/bg/bg_sugosawa_room_day.png" },
    sugosawa_room_night_indirect: { name: "双沢姉妹の部屋・夜（間接照明）", path: "images/assets/bg/bg_sugosawa_room_night_indirect.png" },
    sugosawa_room_night_light_on: { name: "双沢姉妹の部屋・夜（照明ON）", path: "images/assets/bg/bg_sugosawa_room_night_light_on.png" },
    misora_room_day: { name: "双沢姉妹の部屋・昼（旧:美空の部屋）", path: "images/assets/bg/bg_sugosawa_room_day.png" },
    misora_room_night: { name: "双沢姉妹の部屋・夜（旧:美空の部屋）", path: "images/assets/bg/bg_sugosawa_room_night_light_on.png" },
    yozora_room_day: { name: "双沢姉妹の部屋・昼（旧:夜空の部屋）", path: "images/assets/bg/bg_sugosawa_room_day.png" },
    yozora_room_night: { name: "双沢姉妹の部屋・夜（旧:夜空の部屋）", path: "images/assets/bg/bg_sugosawa_room_night_indirect.png" },

    minato_event_plaza: { name: "みなと公園・イベント広場", path: "images/assets/bg/bg_minato_event_plaza.png" },
    minato_event_plaza_festival: { name: "みなと公園・イベント広場・フェス時", path: "images/assets/bg/bg_minato_event_plaza_festival.png" },
    minato_seaside_fence_day: { name: "みなと公園・海の見える柵", path: "images/assets/bg/bg_minato_seaside_fence_day.png" },
    minato_park_event_plaza_day: { name: "みなと公園・イベント広場（旧暫定/互換）", path: "images/assets/bg/bg_minato_event_plaza.png" },

    shiomi_beach_early_morning: { name: "塩見浜・早朝", path: "images/assets/bg/bg_shiomi_beach_early_morning.png" },
    shiomi_beach_morning: { name: "塩見浜・朝", path: "images/assets/bg/bg_shiomi_beach_morning.png" },
    shiomi_beach_day: { name: "塩見浜・昼", path: "images/assets/bg/bg_shiomi_beach_day.png" },
    shiomi_beach_evening: { name: "塩見浜・夕方", path: "images/assets/bg/bg_shiomi_beach_evening.png" },
    shiomi_beach_night: { name: "塩見浜・夜", path: "images/assets/bg/bg_shiomi_beach_night.png" },
    shiomi_beach_midnight: { name: "塩見浜・深夜", path: "images/assets/bg/bg_shiomi_beach_midnight.png" },

    hiyorizaka_station_midnight: { name: "日和坂駅・深夜", path: "images/assets/bg/bg_hiyorizaka_station_midnight.png" },
    hiyorizaka_station_early_morning: { name: "日和坂駅・早朝", path: "images/assets/bg/bg_hiyorizaka_station_early_morning.png" },
    hiyorizaka_station_day: { name: "日和坂駅・昼", path: "images/assets/bg/bg_hiyorizaka_station_day.png" },
    hiyorizaka_station_morning: { name: "日和坂駅・朝", path: "images/assets/bg/bg_hiyorizaka_station_morning.png" },
    hiyorizaka_station_evening: { name: "日和坂駅・夕方", path: "images/assets/bg/bg_hiyorizaka_station_evening.png" },
    hiyorizaka_station_night: { name: "日和坂駅・夜", path: "images/assets/bg/bg_hiyorizaka_station_night.png" }
,

    bookcafe_antostella_exterior_night: { name: "BOOKCAFEアントステラ・外観・夜", path: "images/assets/bg/bg_bookcafe_antostella_exterior_night.png" },
    bookcafe_antostella_1f_night: { name: "BOOKCAFEアントステラ・1階・夜", path: "images/assets/bg/bg_bookcafe_antostella_1f_night.png" },
    bookcafe_antostella_2f_night: { name: "BOOKCAFEアントステラ・2階・夜", path: "images/assets/bg/bg_bookcafe_antostella_2f_night.png" },
    night_book_cafe_entrance: { name: "静かな夜のブックカフェ・入口（アントステラ外観）", path: "images/assets/bg/bg_bookcafe_antostella_exterior_night.png" },
    night_book_cafe_interior: { name: "静かな夜のブックカフェ・店内（アントステラ1階）", path: "images/assets/bg/bg_bookcafe_antostella_1f_night.png" },
    night_book_cafe_2f: { name: "静かな夜のブックカフェ・2階席", path: "images/assets/bg/bg_bookcafe_antostella_2f_night.png" },

    hashiro_lake_night: { name: "羽白湖・夜", path: "images/assets/bg/bg_hashiro_lake_night.png" },
    hashiro_lake_day: { name: "羽白湖・昼", path: "images/assets/bg/bg_hashiro_lake_day.png" },
    hashiro_lake_evening: { name: "羽白湖・夕方", path: "images/assets/bg/bg_hashiro_lake_evening.png" },
    hashiro_lake_morning: { name: "羽白湖・朝", path: "images/assets/bg/bg_hashiro_lake_morning.png" },
    hashiro_lake_early_morning: { name: "羽白湖・早朝", path: "images/assets/bg/bg_hashiro_lake_early_morning.png" },
    hashiro_lake_bus_stop_night: { name: "羽白湖・バス停前・夜（互換）", path: "images/assets/bg/bg_hashiro_lake_night.png" },
    hashiro_lake_path_night: { name: "羽白湖・湖畔遊歩道・夜（互換）", path: "images/assets/bg/bg_hashiro_lake_night.png" },
    hashiro_lake_stargazing_night: { name: "羽白湖・星空観察スポット・夜（互換）", path: "images/assets/bg/bg_hashiro_lake_night.png" }
,

    hiyorizaka_bujutsu_hounousai_stage_day: { name: "日和坂市 武術演武奉納祭・広場特設演舞場", path: "images/assets/bg/bg_hiyorizaka_bujutsu_hounousai_stage_day.png", status: "正式採用" },
    hiyorizaka_sports_park_kyudojo_day: { name: "日和坂総合運動公園・弓道場・昼", path: "images/assets/bg/bg_hiyorizaka_sports_park_kyudojo_day.png", status: "正式採用" },
    hiyorizaka_sports_park_midnight: { name: "日和坂総合運動公園・深夜", path: "images/assets/bg/bg_hiyorizaka_sports_park_midnight.png", status: "正式採用" },
    hiyorizaka_sports_park_night: { name: "日和坂総合運動公園・夜（深夜背景互換）", path: "images/assets/bg/bg_hiyorizaka_sports_park_midnight.png", status: "正式採用・互換" },
    hiyorizaka_sports_park_early_morning: { name: "日和坂総合運動公園・早朝", path: "images/assets/bg/bg_hiyorizaka_sports_park_early_morning.png", status: "正式採用" },
    hiyorizaka_sports_park_morning: { name: "日和坂総合運動公園・朝", path: "images/assets/bg/bg_hiyorizaka_sports_park_morning.png", status: "正式採用" },
    hiyorizaka_sports_park_day: { name: "日和坂総合運動公園・昼", path: "images/assets/bg/bg_hiyorizaka_sports_park_day.png", status: "正式採用" },
    hiyorizaka_sports_park_evening: { name: "日和坂総合運動公園・夕方", path: "images/assets/bg/bg_hiyorizaka_sports_park_evening.png", status: "正式採用" }
,

    yunagi_observatory_night: { name: "夕凪展望台・夜", path: "images/assets/bg/bg_yunagi_observatory_night.png", status: "正式採用" },
    yunagi_observatory_morning: { name: "夕凪展望台・朝", path: "images/assets/bg/bg_yunagi_observatory_morning.png", status: "正式採用" },
    yunagi_observatory_early_morning: { name: "夕凪展望台・早朝", path: "images/assets/bg/bg_yunagi_observatory_early_morning.png", status: "正式採用" },
    yunagi_observatory_day: { name: "夕凪展望台・昼", path: "images/assets/bg/bg_yunagi_observatory_day.png", status: "正式採用" },
    yunagi_observatory_evening: { name: "夕凪展望台・夕方", path: "images/assets/bg/bg_yunagi_observatory_evening.png", status: "正式採用" },
    yunagi_observatory: { name: "夕凪展望台・夜（互換）", path: "images/assets/bg/bg_yunagi_observatory_night.png", status: "正式採用・互換" }
,

    manager_mansion_road_early_morning: { name: "店長マンション前の帰り道・早朝", path: "images/assets/bg/bg_manager_mansion_road_early_morning.png", location: "店長マンション前 / メゾン・ド・エトワール前", time: "early_morning", status: "正式採用" },
    manager_mansion_road_morning: { name: "店長マンション前の帰り道・朝", path: "images/assets/bg/bg_manager_mansion_road_morning.png", location: "店長マンション前 / メゾン・ド・エトワール前", time: "morning", status: "正式採用" },
    manager_mansion_road_day: { name: "店長マンション前の帰り道・昼", path: "images/assets/bg/bg_manager_mansion_road_day.png", location: "店長マンション前 / メゾン・ド・エトワール前", time: "day", status: "正式採用" },
    manager_mansion_road_evening: { name: "店長マンション前の帰り道・夕方", path: "images/assets/bg/bg_manager_mansion_road_evening.png", location: "店長マンション前 / メゾン・ド・エトワール前", time: "evening", status: "正式採用" },
    manager_mansion_road_night: { name: "店長マンション前の帰り道・夜", path: "images/assets/bg/bg_manager_mansion_road_night.png", location: "店長マンション前 / メゾン・ド・エトワール前", time: "night", status: "正式採用" },
    manager_mansion_road: { name: "店長マンション前の帰り道（メゾン・ド・エトワール前）", path: "images/assets/bg/bg_manager_mansion_road_night.png", location: "店長マンション前 / メゾン・ド・エトワール前", time: "default", status: "正式採用・互換" }
    ,minato_park_night: { name: "みなと公園・夜", path: "images/assets/bg/bg_minato_park_night.png", location: "みなと公園", time: "night", status: "正式採用" }
    ,minato_park_evening: { name: "みなと公園・夕方", path: "images/assets/bg/bg_minato_park_evening.png", location: "みなと公園", time: "evening", status: "正式採用" }
    ,minato_park_morning: { name: "みなと公園・朝", path: "images/assets/bg/bg_minato_park_morning.png", location: "みなと公園", time: "morning", status: "正式採用" }
    ,minato_park: { name: "みなと公園（標準・夜）", path: "images/assets/bg/bg_minato_park_night.png", location: "みなと公園", time: "default", status: "正式採用・互換" }
    ,hiyorizaka_seaside_road_night: { name: "海沿いへ向かう道・夜（みなと公園互換）", path: "images/assets/bg/bg_minato_park_night.png", location: "みなと公園", time: "night", status: "正式採用・互換" }
    ,hidamari_store_closed_night: { name: "ひだまりストア閉店後（店内売り場互換）", path: "images/assets/bg/battle_store_lv1.png", status: "正式採用・互換" }
    ,hidamari_store_backyard_morning: { name: "ひだまりストア・翌日朝／バックヤード（倉庫互換）", path: "images/assets/bg/bg_hidamari_warehouse.png", status: "正式採用・互換" }
    ,hidamari_store_breakroom_day: { name: "ひだまりストア・休憩室（店内売り場互換）", path: "images/assets/bg/battle_store_lv1.png", status: "正式採用・互換" }
    ,wakaba_central_park_night: { name: "若葉中央公園・夜（みなと公園夜互換）", path: "images/assets/bg/bg_minato_park_night.png", status: "正式採用・互換" }



  });
})();


/* v039_144 若葉中央公園・冬（雪なし）正式背景 */
(function(){
  "use strict";
  window.TENOTSU_BACKGROUND_CATALOG = Object.assign({}, window.TENOTSU_BACKGROUND_CATALOG || {}, {
    wakaba_central_park_winter_night: { name: "若葉中央公園・冬・夜（雪なし）", path: "images/assets/bg/bg_wakaba_central_park_winter_night.png", location: "若葉中央公園", time: "night", season: "winter", snow: false, status: "正式採用" },
    wakaba_central_park_winter_day: { name: "若葉中央公園・冬・昼（雪なし）", path: "images/assets/bg/bg_wakaba_central_park_winter_day.png", location: "若葉中央公園", time: "day", season: "winter", snow: false, status: "正式採用" },
    wakaba_central_park_winter_evening: { name: "若葉中央公園・冬・夕方（雪なし）", path: "images/assets/bg/bg_wakaba_central_park_winter_evening.png", location: "若葉中央公園", time: "evening", season: "winter", snow: false, status: "正式採用" },
    wakaba_central_park_winter_morning: { name: "若葉中央公園・冬・朝（雪なし）", path: "images/assets/bg/bg_wakaba_central_park_winter_morning.png", location: "若葉中央公園", time: "morning", season: "winter", snow: false, status: "正式採用" },
    wakaba_central_park_winter: { name: "若葉中央公園・冬（雪なし）", path: "images/assets/bg/bg_wakaba_central_park_winter_day.png", location: "若葉中央公園", time: "default", season: "winter", snow: false, status: "正式採用・互換名" }
  });
})();


/* v039_146 夜空80-100帯用 背景互換 */
(function(){
  "use strict";
  window.TENOTSU_BACKGROUND_CATALOG = Object.assign({}, window.TENOTSU_BACKGROUND_CATALOG || {}, {
    hajiro_lake_night: { name: "羽白湖・夜（表記ゆれ互換）", path: "images/assets/bg/bg_hashiro_lake_night.png", status: "正式採用・互換" },
    road_to_hajiro_lake_night: { name: "羽白湖へ向かう道・夜（羽白湖夜互換）", path: "images/assets/bg/bg_hashiro_lake_night.png", status: "正式採用・互換" },
    antstella_bookcafe_night: { name: "アントステラ・夜のブックカフェ（2階互換）", path: "images/assets/bg/bg_bookcafe_antostella_2f_night.png", status: "正式採用・互換" },
    harumachi_flower_field_day: { name: "春待ち花畑・昼", path: "images/assets/bg/bg_harumachi_flower_field_day.png", status: "未同梱・将来正式背景" }
  });
})();


/* v039_147 春待ち花畑正式背景 */
(function(){
  "use strict";
  window.TENOTSU_BACKGROUND_CATALOG = Object.assign({}, window.TENOTSU_BACKGROUND_CATALOG || {}, {
    harumachi_flower_field_day: { name: "春待ち花畑・昼", path: "images/assets/bg/bg_harumachi_flower_field_day.png", location: "春待ち花畑", time: "day", season: "spring", status: "正式採用" },
    haru_machi_flower_field_day: { name: "春待ち花畑・昼（表記ゆれ互換）", path: "images/assets/bg/bg_harumachi_flower_field_day.png", location: "春待ち花畑", time: "day", season: "spring", status: "正式採用・互換" },
    spring_flower_field_day: { name: "春の花畑・昼（互換）", path: "images/assets/bg/bg_harumachi_flower_field_day.png", location: "春待ち花畑", time: "day", season: "spring", status: "正式採用・互換" }
  });
})();


/* v039_152 ひだまりストア店内売り場・夜背景追加 */
(function(){
  "use strict";
  window.TENOTSU_BACKGROUND_CATALOG = Object.assign({}, window.TENOTSU_BACKGROUND_CATALOG || {}, {
    hidamari_store_salesfloor_night: { name: "ひだまりストア店内売り場・夜", path: "images/assets/bg/bg_hidamari_store_salesfloor_night.png", status: "正式採用" },
    hidamari_store_closed_night: { name: "ひだまりストア閉店後・店内売り場", path: "images/assets/bg/bg_hidamari_store_salesfloor_night.png", status: "正式採用・互換" }
  });
})();
