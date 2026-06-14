/* v039_143 夜空キー6-1〜6-3＋メイン6リライト反映 */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  ns.renderOfficeCharacters = function renderOfficeCharacters() {
    const layers = ns.layers || ns.ensureLayers();
    layers.officeChars.innerHTML = "";

    const count = Math.random() < 0.55 ? 3 : 2;
    const picks = ns.shuffle(ns.officeMembers).slice(0, count);
    ns.state.officeSelection = picks;
    ns.state.frontCharacter = picks[0] || null;

    picks.forEach((member, index) => {
      const img = document.createElement("img");
      img.className = "tenotsu-office-stand tenotsu-office-stand-" + index;
      img.alt = member[0];
      img.draggable = false;
      img.src = ns.paths.charBase + member[1];
      img.onerror = () => {
        img.onerror = null;
        img.src = ns.paths.charBase + "a10501.webp";
      };
      layers.officeChars.appendChild(img);
    });

    if (picks[0]) ns.setText(picks[0][0], picks[0][2]);
  };

  ns.renderOfficeMenu = function renderOfficeMenu() {
    const layers = ns.layers || ns.ensureLayers();
    const items = [
      ["店舗", "storeStatus"],
      ["メンバー", "members"],
      ["店舗営業（バトル）", "sales"],
      ["外回り", "town"],
      ["回想アルバム", "storyMenu"],
      ["チューニング", "tuning"],
      ["ショップ", "shop"],
      ["設定", "settings"]
    ];

    layers.menu.innerHTML = "";

    const version = document.createElement("div");
    version.className = "tenotsu-menu-version";
    const versionMain = document.createElement("span");
    versionMain.className = "tenotsu-menu-version-main";
    versionMain.textContent = ns.VERSION || window.TENOTSU_BUILD_VERSION || "v039_141";
    const versionSub = document.createElement("span");
    versionSub.className = "tenotsu-menu-version-sub";
    versionSub.textContent = ns.BUILD_LABEL || window.TENOTSU_BUILD_LABEL || "v039_141";
    version.appendChild(versionMain);
    version.appendChild(versionSub);
    layers.menu.appendChild(version);


    const grid = document.createElement("div");
    grid.className = "tenotsu-office-menu-grid";
    layers.menu.appendChild(grid);

    items.forEach(([label, action]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tenotsu-office-menu-button";
      btn.dataset.action = action;
      btn.textContent = label;
      btn.addEventListener("click", () => ns.handleOfficeMenu(action));
      grid.appendChild(btn);
    });
  };

  ns.enterOffice = async function enterOffice(options = {}) {
    if (!options.noTransition && typeof ns.transitionTo === "function" && ns.state.mode !== "boot") {
      return ns.transitionTo(() => ns.enterOffice({ ...options, noTransition: true }));
    }
    ns.setMode("office");
    ns.ensureLayers();
    if (typeof ns.setBackgroundReady === "function") {
      await ns.setBackgroundReady(ns.paths.officeBg);
    } else {
      ns.setBackground(ns.paths.officeBg);
    }
    if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
    if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
    if (typeof ns.hideStoryMenuPanel === "function") ns.hideStoryMenuPanel();
    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (typeof ns.hideTuningPanel === "function") ns.hideTuningPanel();
    ns.renderOfficeMenu();
    ns.renderOfficeCharacters();
    if (options.message) ns.setText(options.speaker || "店長", options.message);
  };

  ns.clearCacheAndReload = async function clearCacheAndReload() {
    const results = [];
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
        results.push("Service Worker解除: " + regs.length + "件");
      } else {
        results.push("Service Workerなし");
      }
    } catch (err) {
      results.push("Service Worker解除エラー: " + err.message);
    }

    try {
      if (window.caches && caches.keys) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        results.push("Cache Storage削除: " + keys.length + "件");
      } else {
        results.push("Cache Storageなし");
      }
    } catch (err) {
      results.push("Cache Storage削除エラー: " + err.message);
    }

    try {
      localStorage.setItem("tenotsu-last-cache-clear", String(Date.now()));
      sessionStorage.setItem("tenotsu-cache-cleared-at", String(Date.now()));
    } catch (_) {}

    return results;
  };

  ns.renderSettings = function renderSettings() {
    ns.setMode("settings");
    if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (typeof ns.hideTuningPanel === "function") ns.hideTuningPanel();
    const html = `
      <div class="tenotsu-settings-title">設定</div>
      <div class="tenotsu-settings-body">
        <div>現在のバージョン: <strong>${ns.VERSION || window.TENOTSU_BUILD_VERSION || "v039_141"}</strong></div>
        <div>表示やキャッシュ、営業リソースの調整を行います。</div>
        <div class="tenotsu-settings-resource-note">ST/BPリセットは検証用です。スタミナとバトルPを最大値に戻します。</div>
        <div class="tenotsu-settings-resource-note">親愛テスト用：初期親愛Lvは100扱いです。必要に応じて全員Lv100化・親愛ストーリー全クリアを実行できます。</div>
      </div>
      <div class="tenotsu-settings-actions">
        <button type="button" class="tenotsu-settings-button" data-settings-action="reset-stamina-bp">ST/BPを最大値へリセット</button>
        <button type="button" class="tenotsu-settings-button" data-settings-action="reset-stamina">スタミナだけリセット</button>
        <button type="button" class="tenotsu-settings-button" data-settings-action="reset-bp">バトルPだけリセット</button>
        <button type="button" class="tenotsu-settings-button" data-settings-action="set-affection-100">親愛Lvを全員100へ</button>
        <button type="button" class="tenotsu-settings-button" data-settings-action="clear-affection-stories">親愛ストーリーを全クリア</button>
        <button type="button" class="tenotsu-settings-button danger" data-settings-action="clear-cache">キャッシュクリアして再読み込み</button>
        <button type="button" class="tenotsu-settings-button" data-settings-action="close-settings">事務所に戻る</button>
      </div>
      <div class="tenotsu-settings-result" data-settings-result></div>
    `;
    ns.showSettingsPanel(html);
    ns.setText("設定", "設定画面を開きました。");

    const panel = ns.layers.settings;
    const result = panel.querySelector("[data-settings-result]");
    const clearButton = panel.querySelector('[data-settings-action="clear-cache"]');
    const resetAllButton = panel.querySelector('[data-settings-action="reset-stamina-bp"]');
    const resetStaminaButton = panel.querySelector('[data-settings-action="reset-stamina"]');
    const resetBpButton = panel.querySelector('[data-settings-action="reset-bp"]');
    const affection100Button = panel.querySelector('[data-settings-action="set-affection-100"]');
    const affectionClearButton = panel.querySelector('[data-settings-action="clear-affection-stories"]');
    const closeButton = panel.querySelector('[data-settings-action="close-settings"]');

    function updateResourceResetResult(message) {
      try { if (window.TenotsuStamina && typeof window.TenotsuStamina.renderHud === "function") window.TenotsuStamina.renderHud(); } catch (_) {}
      try { if (window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.refreshAll === "function") window.TenotsuBattlePoint.refreshAll(); } catch (_) {}
      if (result) result.textContent = message;
      ns.setText("設定", message);
    }

    if (resetAllButton) {
      resetAllButton.addEventListener("click", () => {
        try { if (window.TenotsuStamina && typeof window.TenotsuStamina.recoverAll === "function") window.TenotsuStamina.recoverAll(); } catch (_) {}
        try { if (window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.recoverAll === "function") window.TenotsuBattlePoint.recoverAll(); } catch (_) {}
        updateResourceResetResult("スタミナとバトルPを最大値へリセットしました。");
      });
    }

    if (resetStaminaButton) {
      resetStaminaButton.addEventListener("click", () => {
        try { if (window.TenotsuStamina && typeof window.TenotsuStamina.recoverAll === "function") window.TenotsuStamina.recoverAll(); } catch (_) {}
        updateResourceResetResult("スタミナを最大値へリセットしました。");
      });
    }

    if (resetBpButton) {
      resetBpButton.addEventListener("click", () => {
        try { if (window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.recoverAll === "function") window.TenotsuBattlePoint.recoverAll(); } catch (_) {}
        updateResourceResetResult("バトルPを最大値へリセットしました。");
      });
    }

    if (affection100Button) {
      affection100Button.addEventListener("click", () => {
        let count = 0;
        try {
          if (typeof ns.setAllAffectionLevels === "function") count = ns.setAllAffectionLevels(100);
        } catch (_) {}
        updateResourceResetResult(`親愛Lvを全員100へ設定しました。対象: ${count}人`);
      });
    }

    if (affectionClearButton) {
      affectionClearButton.addEventListener("click", () => {
        let count = 0;
        try {
          if (typeof ns.clearAllAffectionStories === "function") count = ns.clearAllAffectionStories();
        } catch (_) {}
        updateResourceResetResult(`親愛ストーリーを全クリア扱いにしました。対象: ${count}本`);
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", async () => {
        clearButton.disabled = true;
        if (result) result.textContent = "キャッシュを削除しています……";
        const lines = await ns.clearCacheAndReload();
        if (result) result.textContent = lines.join(" / ") + " / 再読み込みします";
        ns.setText("設定", "キャッシュクリアを実行しました。再読み込みします。");
        setTimeout(() => {
          const url = new URL(location.href);
          url.searchParams.set("cachebust", Date.now().toString());
          location.replace(url.toString());
        }, 900);
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        ns.hideSettingsPanel();
        ns.enterOffice({ speaker: "店長", message: "事務所に戻りました。" });
      });
    }
  };

  ns.handleOfficeMenu = function handleOfficeMenu(action) {
    if (ns.transitionState && ns.transitionState.running) return;
    if (action !== "settings" && typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (action !== "members" && typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (action !== "sales" && typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (action !== "storeStatus" && typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (action !== "tuning" && typeof ns.hideTuningPanel === "function") ns.hideTuningPanel();
    if (action !== "storyMenu" && typeof ns.hideStoryMenuPanel === "function") ns.hideStoryMenuPanel();

    switch(action) {
      case "storeStatus":
        if (typeof ns.enterStoreStatus === "function") {
          ns.transitionTo ? ns.transitionTo(() => ns.enterStoreStatus({ noTransition: true })) : ns.enterStoreStatus();
        } else {
          ns.setText("店長", "店舗管理機能を読み込めませんでした。storeStatus.js の読み込みを確認してください。");
        }
        break;
      case "office":
        ns.enterOffice({ speaker: "店長", message: "事務所を確認します。" });
        break;
      case "members":
        if (typeof ns.enterMembers === "function") {
          ns.transitionTo ? ns.transitionTo(() => ns.enterMembers({ noTransition: true })) : ns.enterMembers();
        } else {
          ns.setText("店長", "メンバー機能を読み込めませんでした。members.js の読み込みを確認してください。");
        }
        break;
      case "sales":
        if (typeof ns.enterSales === "function") {
          ns.transitionTo ? ns.transitionTo(() => ns.enterSales({ noTransition: true })) : ns.enterSales();
        } else {
          ns.setText("店長", "店舗営業機能を読み込めませんでした。sales.js の読み込みを確認してください。");
        }
        break;
      case "town":
        if (typeof ns.enterTown === "function") {
          ns.transitionTo ? ns.transitionTo(() => ns.enterTown({ noTransition: true })) : ns.enterTown();
        } else {
          ns.setText("店長", "外回り機能を読み込めませんでした。");
        }
        break;
      case "storyMenu":
        if (typeof ns.enterStoryMenu === "function") {
          ns.transitionTo ? ns.transitionTo(() => ns.enterStoryMenu({ noTransition: true, tab: "recollection" })) : ns.enterStoryMenu({ tab: "recollection" });
        } else {
          ns.setText("店長", "回想機能を読み込めませんでした。storyMenu.js の読み込みを確認してください。");
        }
        break;
      case "tuning":
        if (typeof ns.enterTuning === "function") {
          ns.transitionTo ? ns.transitionTo(() => ns.enterTuning({ noTransition: true })) : ns.enterTuning();
        } else {
          ns.setText("店長", "チューニング機能を読み込めませんでした。tuning.js の読み込みを確認してください。");
        }
        break;
      case "shop":
        if (typeof ns.enterShop === "function") {
          ns.transitionTo ? ns.transitionTo(() => ns.enterShop({ noTransition: true })) : ns.enterShop();
        } else {
          ns.setText("店長", "ショップ機能を読み込めませんでした。shop.js の読み込みを確認してください。");
        }
        break;
      case "settings":
        // settings is a panel overlay, not a scene; no black transition.
        ns.renderSettings();
        break;
      default:
        ns.setText("店長", "未接続のメニューです。");
    }
  };
})();
