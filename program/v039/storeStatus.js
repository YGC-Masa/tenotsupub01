/* v039_78 store menu / status viewer */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;
  if (!ns) return;

  const STATUS_PANELS = {
    store: {
      label: "店舗",
      title: "店舗ステータス",
      lead: "ひだまりストア全体の営業状態を確認します。",
      rows: [
        ["店舗Lv", "1"],
        ["売上補正", "+0%"],
        ["接客効率", "標準"],
        ["金貨回収効率", "標準"],
        ["設備状態", "通常"],
        ["月間イベント", "準備中"]
      ],
      note: "今後、店設備・POP・棚・レジ・ラッシュ補助などの強化状況をここへ接続します。"
    },
    manager: {
      label: "店長",
      title: "店長ステータス",
      lead: "店長HELPや指示力など、店長側の支援性能を確認します。",
      rows: [
        ["店長Lv", "1"],
        ["HELP回数", "標準"],
        ["HELP回復", "標準"],
        ["指示力", "標準"],
        ["妨害耐性", "標準"],
        ["支援スキル", "準備中"]
      ],
      note: "今後、店長スキル・ギア・妨害耐性・HELP強化をここへ接続します。"
    }
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function makeStatusRows(panel) {
    return (panel.rows || []).map(([name, value]) => `
      <div class="tenotsu-store-status-row">
        <span>${escapeHtml(name)}</span>
        <strong>${escapeHtml(value)}</strong>
      </div>
    `).join("");
  }

  function renderStoreStatusPanel(selectedKey) {
    const key = selectedKey === "manager" ? "manager" : "store";
    const panel = STATUS_PANELS[key];
    const html = `
      <div class="tenotsu-store-status-card">
        <div class="tenotsu-store-status-kicker">閲覧管理</div>
        <div class="tenotsu-store-status-title">店舗</div>
        <p class="tenotsu-store-status-lead">事務所・店舗・店長の状態を確認します。強化実行ではなく、現在値の閲覧管理メニューです。</p>
        <div class="tenotsu-store-status-layout">
          <nav class="tenotsu-store-status-menu" aria-label="店舗メニュー">
            <div class="tenotsu-store-status-menu-title">店舗メニュー</div>
            <button type="button" data-store-status-action="office">事務所</button>
            <button type="button" data-store-status-action="store" class="${key === "store" ? "selected" : ""}">店舗</button>
            <button type="button" data-store-status-action="manager" class="${key === "manager" ? "selected" : ""}">店長</button>
          </nav>
          <section class="tenotsu-store-status-detail">
            <small>${escapeHtml(panel.label)} / ステータス</small>
            <h3>${escapeHtml(panel.title)}</h3>
            <p>${escapeHtml(panel.lead)}</p>
            <div class="tenotsu-store-status-grid">${makeStatusRows(panel)}</div>
            <div class="tenotsu-store-status-note">${escapeHtml(panel.note)}</div>
          </section>
        </div>
      </div>
    `;
    ns.showStoreStatusPanel(html);
    const root = (ns.layers || ns.ensureLayers()).storeStatus;
    root.querySelectorAll("[data-store-status-action]").forEach((btn) => {
      btn.addEventListener("click", () => ns.handleStoreStatusAction(btn.dataset.storeStatusAction));
    });
  }

  ns.enterStoreStatus = async function enterStoreStatus(options = {}) {
    if (!options.noTransition && typeof ns.transitionTo === "function") {
      return ns.transitionTo(() => ns.enterStoreStatus({ noTransition: true }));
    }
    ns.setMode("storeStatus");
    ns.ensureLayers();
    if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
    if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (typeof ns.clearCharacters === "function") ns.clearCharacters();
    const bg = (ns.paths && ns.paths.officeBg) || "";
    if (bg) {
      if (typeof ns.setBackgroundReady === "function") await ns.setBackgroundReady(bg);
      else if (typeof ns.setBackground === "function") ns.setBackground(bg);
    }
    renderStoreStatusPanel("store");
    ns.setText("店長", "店舗メニューを開きました。店舗と店長のステータスを確認できます。");
  };

  ns.handleStoreStatusAction = function handleStoreStatusAction(action) {
    if (action === "office") {
      if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
      ns.enterOffice({ speaker: "店長", message: "事務所モードに戻りました。" });
      return;
    }
    if (!STATUS_PANELS[action]) {
      ns.setText("店長", "未接続の店舗メニューです。");
      return;
    }
    renderStoreStatusPanel(action);
    ns.setText("店長", STATUS_PANELS[action].title + "を表示しました。");
  };
})();
