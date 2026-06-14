/* v039_229 shop / exchange items */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  ns.SHOP_EXCHANGE_ITEMS = [
    {
      id: "time_thymus",
      name: "タイムタイム",
      roman: "TimeThymus",
      type: "時間変更",
      desc: "時間帯を変えられる特別な交換品。朝・昼・夕方・夜などの時間演出切替に使う想定。",
      status: "交換準備中"
    },
    {
      id: "season_raisin",
      name: "シーズンレーズン",
      roman: "SeasonRaisin",
      type: "季節変更",
      desc: "季節を変えられる特別な交換品。春・夏・秋・冬の季節演出切替に使う想定。",
      status: "交換準備中"
    },
    {
      id: "rock_heart_chocolat",
      name: "ロックハートショコラ",
      roman: "RockHeartChocolat",
      type: "親愛メイン開放",
      desc: "親愛メインストーリーの開放に関係する特別なショコラ。",
      status: "交換準備中"
    },
    {
      id: "biribiri_mabo_tofu",
      name: "ビリビリ麻婆豆腐",
      roman: "BiribiriMaboTofu",
      type: "親愛開放",
      desc: "とあるメンバーの親愛開放に関係する、刺激的な特別交換品。",
      status: "交換準備中"
    },
    {
      id: "hyakucho_momo",
      name: "百超桃",
      roman: "HyakuchoMomo",
      type: "親愛開放",
      desc: "とあるメンバーの親愛開放に関係する、不思議な桃の特別交換品。",
      status: "交換準備中"
    },
    {
      id: "makai_brandy",
      name: "魔界のブランデー",
      roman: "MakaiBrandy",
      type: "親愛開放",
      desc: "とあるメンバーの親愛開放に関係する、妖しい香りの特別交換品。",
      status: "交換準備中"
    }
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderExchangeItemsInfo() {
    const cards = (ns.SHOP_EXCHANGE_ITEMS || []).map((item) => `
      <article class="tenotsu-shop-exchange-card" data-exchange-item="${escapeHtml(item.id)}">
        <div class="tenotsu-shop-exchange-card-head">
          <div>
            <div class="tenotsu-shop-exchange-name">${escapeHtml(item.name)}</div>
            <div class="tenotsu-shop-exchange-roman">${escapeHtml(item.roman)}</div>
          </div>
          <span class="tenotsu-shop-exchange-type">${escapeHtml(item.type)}</span>
        </div>
        <div class="tenotsu-shop-exchange-desc">${escapeHtml(item.desc)}</div>
        <div class="tenotsu-shop-exchange-status">${escapeHtml(item.status)}</div>
      </article>
    `).join("");

    return `
      <div class="tenotsu-shop-info-title">交換品リスト</div>
      <div class="tenotsu-shop-info-body tenotsu-shop-exchange-body">
        <p>現在の交換候補です。効果処理・所持数・交換コストは後続で接続します。</p>
        <div class="tenotsu-shop-exchange-list">
          ${cards}
        </div>
      </div>
    `;
  }

  function renderShopHelpInfo() {
    return `
      <div class="tenotsu-shop-info-title">交換所の説明</div>
      <div class="tenotsu-shop-info-body">
        <p>交換所では、イベント素材やスタンプ、特別な品を交換できる予定です。</p>
        <p>時間・季節変更系、親愛開放系の特別アイテムは、ここから管理していきます。</p>
      </div>
    `;
  }

  function renderDefaultInfo() {
    return `
      <div class="tenotsu-shop-info-title">アイテム交換所</div>
      <div class="tenotsu-shop-info-body">
        <p>イベント交換・スタンプ交換・特別な合言葉交換をここへ接続予定です。</p>
        <p>左のメニューから交換品リストを確認できます。</p>
      </div>
    `;
  }

  function setShopInfo(html) {
    const layers = ns.layers || ns.ensureLayers();
    if (!layers || !layers.shopInfo) return;
    layers.shopInfo.hidden = false;
    layers.shopInfo.innerHTML = html || "";
  }

  ns.renderShopMenu = function renderShopMenu() {
    const menuHtml = `
      <div class="tenotsu-menu-version">
        <span class="tenotsu-menu-version-main">${ns.VERSION || "v039_229"}</span>
        <span class="tenotsu-menu-version-sub">shop / exchange</span>
      </div>
      <div class="tenotsu-shop-menu-title">ショップメニュー</div>
      <div class="tenotsu-shop-menu-grid">
        <button type="button" class="tenotsu-shop-menu-button" data-shop-action="exchange-items">交換品を見る</button>
        <button type="button" class="tenotsu-shop-menu-button" data-shop-action="secret-word">秘密の言葉</button>
        <button type="button" class="tenotsu-shop-menu-button" data-shop-action="shop-help">交換所の説明</button>
        <button type="button" class="tenotsu-shop-menu-button back" data-shop-action="back-office">事務所に戻る</button>
      </div>
    `;

    ns.showShopPanel(menuHtml, renderDefaultInfo());

    const panel = ns.layers.shopMenu;
    panel.querySelectorAll("[data-shop-action]").forEach((btn) => {
      btn.addEventListener("click", () => ns.handleShopMenu(btn.dataset.shopAction));
    });
  };

  ns.enterShop = async function enterShop(options = {}) {
    if (!options.noTransition && typeof ns.transitionTo === "function") {
      return ns.transitionTo(() => ns.enterShop({ noTransition: true }));
    }
    ns.setMode("shop");
    ns.ensureLayers();
    if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
    if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (typeof ns.clearCharacters === "function") ns.clearCharacters();
    if (typeof ns.setBackgroundReady === "function") {
      await ns.setBackgroundReady(ns.paths.shopBg);
    } else {
      ns.setBackground(ns.paths.shopBg);
    }
    ns.renderShopMenu();
    ns.setText("朔夜", "いらっしゃいませ。交換カウンターへようこそ。");
  };

  ns.handleShopMenu = function handleShopMenu(action) {
    switch(action) {
      case "exchange-items":
        setShopInfo(renderExchangeItemsInfo());
        ns.setText("朔夜", "現在の交換品リストです。気になる品はございますか？");
        break;
      case "secret-word":
        ns.setText("朔夜", "秘密の言葉ですね。合言葉入力UIは後続バージョンで接続します。");
        break;
      case "shop-help":
        setShopInfo(renderShopHelpInfo());
        ns.setText("朔夜", "交換所の使い方をご説明します。");
        break;
      case "back-office":
        if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
        if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
        if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
        ns.enterOffice({ speaker: "店長", message: "事務所に戻りました。" });
        break;
      default:
        ns.setText("朔夜", "未接続のショップ項目です。");
    }
  };
})();
