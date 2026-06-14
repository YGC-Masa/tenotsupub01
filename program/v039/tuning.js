/* v039_79 tuning / TechLab Tsukumo menu */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;
  if (!ns) return;

  const TUNING_ITEMS = {
    member: {
      label: "メンバー装備強化",
      title: "メンバー装備強化",
      lead: "ひだまりメンバーのギアを調整し、接客・手際・根気などの戦闘補正へつなげます。",
      tags: ["キャストギア", "接客補正", "CT短縮"],
      rows: [
        ["対象", "各メンバー装備"],
        ["主な効果", "提案 / 手際 / 根気"],
        ["必要素材", "家電星人金貨 / パーツ"],
        ["状態", "後続接続予定"]
      ],
      message: "メンバー装備強化を確認します。装備補正は後続バージョンで接続します。"
    },
    manager: {
      label: "店長装備強化",
      title: "店長装備強化",
      lead: "店長HELPや指示力、妨害耐性に関わるギアを調整します。ビリビリ戦の支援力にも接続します。",
      tags: ["店長HELP", "指示力", "妨害耐性"],
      rows: [
        ["対象", "店長ギア"],
        ["主な効果", "HELP / 誠実 / 防御"],
        ["必要素材", "金貨 / 店舗素材"],
        ["状態", "後続接続予定"]
      ],
      message: "店長装備強化を確認します。HELP強化は後続バージョンで接続します。"
    },
    store: {
      label: "店舗設備強化",
      title: "店舗設備強化",
      lead: "レジ・棚・POP・バックヤード設備を整え、売上・回転率・金貨回収効率を底上げします。",
      tags: ["店舗設備", "売上補正", "金貨効率"],
      rows: [
        ["対象", "売場 / 事務所 / 設備"],
        ["主な効果", "売上 / ラッシュ補助"],
        ["必要素材", "売上金 / 金貨"],
        ["状態", "後続接続予定"]
      ],
      message: "店舗設備強化を確認します。設備強化は後続バージョンで接続します。"
    }
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  function renderRows(item) {
    return (item.rows || []).map(([name, value]) => `
      <div class="tenotsu-tuning-row">
        <span>${escapeHtml(name)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `).join("");
  }

  function renderTags(item) {
    return (item.tags || []).map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");
  }

  function renderTuningPanel(selectedKey) {
    const key = TUNING_ITEMS[selectedKey] ? selectedKey : "member";
    const item = TUNING_ITEMS[key];
    const html = `
      <div class="tenotsu-tuning-card">
        <div class="tenotsu-tuning-header">
          <div>
            <div class="tenotsu-tuning-kicker">TECHLAB TSUKUMO</div>
            <div class="tenotsu-tuning-title">チューニング</div>
            <p class="tenotsu-tuning-lead">メンバー・店長・店舗設備のギア強化入口です。現在は強化カテゴリの閲覧と導線確認を行います。</p>
          </div>
        </div>
        <div class="tenotsu-tuning-layout">
          <nav class="tenotsu-tuning-menu" aria-label="チューニングメニュー">
            <button type="button" data-tuning-action="member" class="${key === "member" ? "selected" : ""}">メンバー装備強化</button>
            <button type="button" data-tuning-action="manager" class="${key === "manager" ? "selected" : ""}">店長装備強化</button>
            <button type="button" data-tuning-action="store" class="${key === "store" ? "selected" : ""}">店舗設備強化</button>
            <button type="button" data-tuning-action="office" class="return">事務所に戻る</button>
          </nav>
          <section class="tenotsu-tuning-detail">
            <small>${escapeHtml(item.label)} / 準備中</small>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.lead)}</p>
            <div class="tenotsu-tuning-tags">${renderTags(item)}</div>
            <div class="tenotsu-tuning-grid">${renderRows(item)}</div>
            <div class="tenotsu-tuning-note">強化実行・素材消費・ステータス反映は次段階で接続します。今はチューニング導線とカテゴリ構成を固定します。</div>
          </section>
        </div>
      </div>
    `;
    ns.showTuningPanel(html);
    const root = (ns.layers || ns.ensureLayers()).tuning;
    root.querySelectorAll("[data-tuning-action]").forEach((btn) => {
      btn.addEventListener("click", () => ns.handleTuningAction(btn.dataset.tuningAction));
    });
  }

  ns.enterTuning = async function enterTuning(options = {}) {
    if (!options.noTransition && typeof ns.transitionTo === "function") {
      return ns.transitionTo(() => ns.enterTuning({ noTransition: true }));
    }
    ns.setMode("tuning");
    ns.ensureLayers();
    if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
    if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (typeof ns.clearCharacters === "function") ns.clearCharacters();
    const bg = (ns.paths && ns.paths.tsukumoTuningBg) || (ns.paths && ns.paths.officeBg) || "";
    if (bg) {
      if (typeof ns.setBackgroundReady === "function") await ns.setBackgroundReady(bg);
      else if (typeof ns.setBackground === "function") ns.setBackground(bg);
    }
    renderTuningPanel("member");
    ns.setText("店長", "テックラボつくもに入りました。装備と設備のチューニング項目を確認します。");
  };

  ns.handleTuningAction = function handleTuningAction(action) {
    if (action === "office") {
      if (typeof ns.hideTuningPanel === "function") ns.hideTuningPanel();
      ns.enterOffice({ speaker: "店長", message: "テックラボつくもから事務所に戻りました。" });
      return;
    }
    if (!TUNING_ITEMS[action]) {
      ns.setText("店長", "未接続のチューニング項目です。");
      return;
    }
    renderTuningPanel(action);
    ns.setText("店長", TUNING_ITEMS[action].message);
  };
})();
