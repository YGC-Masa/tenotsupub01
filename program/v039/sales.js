/* v039_88 sales: event cleaning battle entrance */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  ns.salesModes = [
    {
      id: "normal_sales",
      label: "通常営業",
      tag: "周回向け",
      description: "ひだまりストアの通常営業です。経験値・売上・基礎報酬を安定して集める周回向けの営業です。",
      message: "通常営業を開始します。スタミナを消費して、経験値と基礎報酬を獲得します。",
      duration: 30,
      staminaCost: 10,
      battlePointCost: 0,
      rewardRole: "経験値 / 売上 / 基礎報酬",
      target: "来店した家電星人をできるだけ多く接客する",
      battleType: "normal"
    },
    {
      id: "rival_battle",
      label: "バトル営業",
      tag: "VSビリビリ",
      description: "ライバル店・ビリビリ電機との販売勝負です。通常営業とは別のバトルPを消費します。",
      message: "バトル営業を開始します。バトルPを消費して、ビリビリ電機との販売勝負に挑みます。",
      duration: 45,
      staminaCost: 0,
      battlePointCost: 1,
      rewardRole: "ライバル報酬 / 交換素材 / 称号系",
      target: "ビリビリ電機との販売勝負で接客成果を競う",
      battleType: "rival"
    },
    {
      id: "event_sales",
      label: "イベント営業",
      tag: "ボス戦",
      description: "メンテナンス不足で汚れ、悪の心が芽生えた家電星人を清掃するイベント営業です。ST20でエンカウントし、専用イベントBPで清掃バトルに入ります。",
      message: "イベント営業は、ST20で汚れた家電星人を探索します。清掃バトルには専用イベントBPを使用します。",
      duration: 45,
      staminaCost: 20,
      battlePointCost: 0,
      eventBattlePointCost: 1,
      rewardRole: "ダークエレメント / 清掃報酬 / 戦利品交換",
      target: "探索で遭遇し、専用イベントBPで汚れた家電星人を清掃する",
      battleType: "eventBoss",
      futureSystem: "cleaningBattleEventBoss"
    }
  ];

  function modeResourceLabel(mode) {
    const parts = [];
    if (mode.staminaCost && mode.staminaCost > 0) parts.push(`ST ${mode.staminaCost}`);
    if (mode.battlePointCost && mode.battlePointCost > 0) parts.push(`BP ${mode.battlePointCost}`);
    return parts.length ? parts.join(" + ") : "消費なし";
  }
  function modeResourceBadge(mode) {
    const badges = [];
    const st = window.TenotsuStamina && typeof window.TenotsuStamina.renderBadge === "function" ? window.TenotsuStamina.renderBadge(mode.id) : "";
    const bp = window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.renderBadge === "function" ? window.TenotsuBattlePoint.renderBadge(mode.id) : "";
    if (st) badges.push(st);
    if (bp) badges.push(bp);
    if (!badges.length) badges.push(`<div class="tenotsu-stamina-badge"><span>消費</span><b>なし</b><small>テスト用</small></div>`);
    return `<div class="tenotsu-sales-resource-badges">${badges.join("")}</div>`;
  }
  function canPayResources(mode) {
    const stCost = mode.staminaCost || 0;
    const bpCost = mode.battlePointCost || 0;
    const st = window.TenotsuStamina && typeof window.TenotsuStamina.getState === "function" ? window.TenotsuStamina.getState() : { current: 999, max: 999 };
    const bp = window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.getState === "function" ? window.TenotsuBattlePoint.getState() : { current: 999, max: 999 };
    if (st.current < stCost) return { ok: false, type: "ST", current: st.current, max: st.max, cost: stCost };
    if (bp.current < bpCost) return { ok: false, type: "BP", current: bp.current, max: bp.max, cost: bpCost };
    return { ok: true, stCost, bpCost };
  }
  function consumeResources(mode) {
    const check = canPayResources(mode);
    if (!check.ok) return check;
    if (mode.staminaCost && mode.staminaCost > 0 && window.TenotsuStamina && typeof window.TenotsuStamina.consume === "function") {
      const consumed = window.TenotsuStamina.consume(mode.id, mode.label);
      if (!consumed.ok) return { ok: false, type: "ST", current: consumed.state.current, max: consumed.state.max, cost: consumed.cost };
    }
    if (mode.battlePointCost && mode.battlePointCost > 0 && window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.consume === "function") {
      const consumed = window.TenotsuBattlePoint.consume(mode.id, mode.label);
      if (!consumed.ok) return { ok: false, type: "BP", current: consumed.state.current, max: consumed.state.max, cost: consumed.cost };
    }
    return { ok: true };
  }

  function modeStartLabel(mode) {
    if (!mode) return "営業開始";
    if (mode.battleType === "rival") return `ポイント${mode.battlePointCost || 1}を消費して開始`;
    if (mode.battleType === "eventBoss") return `ST${mode.staminaCost || 20}でエンカウント開始`;
    if (mode.staminaCost && mode.battlePointCost) return `ST${mode.staminaCost} + BP${mode.battlePointCost}を消費して開始`;
    if (mode.staminaCost) return `ST${mode.staminaCost}を消費して開始`;
    if (mode.battlePointCost) return `BP${mode.battlePointCost}を消費して開始`;
    return "消費なしで開始";
  }

  function modeCurrentLabel(mode) {
    const items = [];
    if (mode.staminaCost && window.TenotsuStamina && typeof window.TenotsuStamina.getState === "function") {
      const st = window.TenotsuStamina.getState();
      items.push(`ST ${st.current}/${st.max}`);
    }
    if (mode.battlePointCost && window.TenotsuBattlePoint && typeof window.TenotsuBattlePoint.getState === "function") {
      const bp = window.TenotsuBattlePoint.getState();
      items.push(`BP ${bp.current}/${bp.max}`);
    }
    return items.length ? items.join(" / ") : "消費なし";
  }

  function startSelectedMode(mode) {
    if (!mode) return;
    const payment = consumeResources(mode);
    if (!payment.ok) {
      const label = payment.type === "BP" ? "バトルP" : "スタミナ";
      ns.setText("店長", `${label}が足りません。現在 ${payment.current}/${payment.max}、必要 ${payment.cost} です。`);
      ns.renderSalesPanel(mode.id);
      return;
    }
    ns.state.currentSalesMode = mode;
    ns.state.currentBattleType = mode.battleType || "normal";
    ns.enterBattleMock(mode);
  }

  function salesCard(mode) {
    return `
      <button type="button" class="tenotsu-sales-card tenotsu-sales-card-${mode.id}" data-sales-mode="${mode.id}" data-battle-type="${mode.battleType || 'normal'}">
        <span class="tenotsu-sales-card-title">${mode.label}</span>
        <span class="tenotsu-sales-card-meta">
          <span class="tenotsu-sales-card-tag">${mode.tag}</span>
          <span class="tenotsu-sales-card-stamina">${modeResourceLabel(mode)}</span>
        </span>
        <span class="tenotsu-sales-card-desc">${mode.description}</span>
      </button>
    `;
  }

  ns.renderSalesPanel = function renderSalesPanel(selectedId = null) {
    const modes = ns.salesModes || [];
    const html = `
      <div class="tenotsu-sales-head-row">
        <div>
          <div class="tenotsu-sales-title">店舗営業</div>
          <div class="tenotsu-sales-subtitle">営業モードを選択します。営業モードを選択して、そのままバトルを開始できます。</div>
        </div>
        ${window.TenotsuStamina && typeof window.TenotsuStamina.renderSalesSummary === "function" ? window.TenotsuStamina.renderSalesSummary() : ""}
      </div>
      <div class="tenotsu-sales-body">
        <div class="tenotsu-sales-list">
          ${modes.map(salesCard).join("")}
        </div>
        <div class="tenotsu-sales-detail" data-sales-detail>
          <div class="tenotsu-sales-detail-empty">営業モードを選択してください。</div>
        </div>
      </div>
    `;

    ns.showSalesPanel(html);
    const panel = ns.layers.sales;
    const detail = panel.querySelector("[data-sales-detail]");

    const selectMode = (modeId) => {
      const mode = modes.find((item) => item.id === modeId);
      const btn = panel.querySelector(`[data-sales-mode="${modeId}"]`);
      if (!mode || !btn) return;

      panel.querySelectorAll(".tenotsu-sales-card").forEach((card) => card.classList.remove("selected"));
      btn.classList.add("selected");

      detail.innerHTML = `
        <div class="tenotsu-sales-detail-main tenotsu-sales-detail-${mode.id}">
          <div class="tenotsu-sales-detail-copy">
            <div class="tenotsu-sales-detail-title">${mode.label}</div>
            <div class="tenotsu-sales-detail-tag">${mode.tag}</div>
            <div class="tenotsu-sales-detail-desc">${mode.description}</div>
          </div>
          <div class="tenotsu-sales-detail-action">
            <button type="button" class="tenotsu-sales-start tenotsu-sales-start-primary" data-sales-start="${mode.id}">${modeStartLabel(mode)}</button>
            <div class="tenotsu-sales-start-cost">現在：${modeCurrentLabel(mode)}</div>
            <div class="tenotsu-sales-start-role">${mode.rewardRole || "営業報酬"}</div>
          </div>
        </div>
      `;

      ns.setText("店長", mode.message);

      const start = detail.querySelector("[data-sales-start]");
      if (start) start.addEventListener("click", () => startSelectedMode(mode));
    };

    panel.querySelectorAll("[data-sales-mode]").forEach((btn) => {
      btn.addEventListener("click", () => selectMode(btn.dataset.salesMode));
    });

    // v039_50: バトル前メニューの導線整理。
    // 事務所へ戻る専用ボタンは表示せず、店舗営業内でモード選択→営業開始に集中させる。

    if (selectedId) selectMode(selectedId);
  };


  ns.deckBattleCustomers = [
    { id: "tv_popcorn", name: "テレビポップコーン星人", need: "映像", weak: "tv" },
    { id: "choco_dryer", name: "チョコドライヤ星人", need: "美容・ドライヤー", weak: "dryer" },
    { id: "pc_pizza", name: "パソコンピザ星人", need: "PC相談", weak: "pc" },
    { id: "phone_candy", name: "スマホキャンディ星人", need: "スマホ相談", weak: "phone" },
    { id: "audio_gummy", name: "イヤホングミ星人", need: "オーディオ", weak: "audio" }
  ];

  ns.deckBattleStaff = [
    { id: "hina", name: "緋奈", attr: "tv", power: 120, skill: "明るい映像案内" },
    { id: "ai", name: "藍", attr: "dryer", power: 115, skill: "丁寧なドライヤー案内" },
    { id: "midori", name: "翠", attr: "pc", power: 130, skill: "的確なPC提案" },
    { id: "kogane", name: "こがね", attr: "phone", power: 125, skill: "スマホ接客トーク" },
    { id: "kohaku", name: "琥珀", attr: "audio", power: 118, skill: "イヤホン聞き比べ" }
  ];

  ns.pickDeckBattleCustomers = function pickDeckBattleCustomers(count = 3, options = {}) {
    if (window.TenotsuApplianceAliens && typeof window.TenotsuApplianceAliens.pickAlienInstances === "function") {
      return window.TenotsuApplianceAliens.pickAlienInstances(count, options).map((item) => ({
        id: item.alienId || item.id,
        name: item.displayName || item.name,
        baseName: item.name,
        trait: item.traitLabel || "ふつう",
        traitDesc: item.traitDesc || "",
        need: item.need,
        weak: item.weak,
        hp: item.hp,
        value: item.value,
        preferredStat: item.preferredStat,
        dropRate: item.dropRate || 1,
        helpRate: item.helpRate || 1,
        comboRate: item.comboRate || 1,
        rivalPullRate: item.rivalPullRate || 1
      }));
    }
    const list = (ns.deckBattleCustomers || []).slice();
    const out = [];
    while (list.length && out.length < count) {
      const index = Math.floor(Math.random() * list.length);
      out.push(Object.assign({}, list.splice(index, 1)[0]));
    }
    return out;
  };

  ns.startSalesMode = function startSalesMode(mode) {
    startSelectedMode(mode);
  };

  ns.openSalesStartDialog = function openSalesStartDialog(mode) {
    const detail = ns.layers.sales.querySelector("[data-sales-detail]");
    if (!detail) return;
    detail.innerHTML = `
      <div class="tenotsu-sales-dialog">
        <div class="tenotsu-sales-detail-title">${mode.label}</div>
        <div class="tenotsu-sales-detail-tag">${mode.tag}</div>
        <div class="tenotsu-sales-detail-desc">${mode.description}</div>
        <div class="tenotsu-sales-dialog-spec">
          <div><strong>目標：</strong>${mode.target || "営業を成功させる"}</div>
          <div><strong>制限時間：</strong>${mode.duration || 30}秒</div>
          <div><strong>消費：</strong>${modeResourceLabel(mode)}</div>
          <div><strong>報酬役割：</strong>${mode.rewardRole || "営業報酬"}</div>
          <div><strong>種別：</strong>${mode.battleType === "rival" ? "VSビリビリ" : mode.battleType === "eventBoss" ? "イベント営業 / ブラック家電星人" : "通常営業"}</div>
          <div><strong>現在：</strong>${mode.battleType === "rival" ? "VS CPUビリビリバトル実装" : mode.battleType === "eventBoss" ? "清掃バトル / ダークエレメント獲得" : "抽出バトル実装"}</div>
        </div>
        <div class="tenotsu-sales-dialog-actions">
          <button type="button" class="tenotsu-sales-start" data-sales-dialog="start">営業開始</button>
          <button type="button" class="tenotsu-sales-cancel" data-sales-dialog="cancel">戻る</button>
        </div>
      </div>`;
    ns.setText("店長", `${mode.label}を開始しますか？ 画面中央の確認ダイアログから営業開始できます。`);
    detail.querySelector('[data-sales-dialog="start"]').addEventListener("click", () => {
      const payment = consumeResources(mode);
      if (!payment.ok) {
        const label = payment.type === "BP" ? "バトルP" : "スタミナ";
        ns.setText("店長", `${label}が足りません。現在 ${payment.current}/${payment.max}、必要 ${payment.cost} です。`);
        ns.renderSalesPanel(mode.id);
        return;
      }
      ns.state.currentSalesMode = mode;
      ns.state.currentBattleType = mode.battleType || "normal";
      ns.enterBattleMock(mode);
    });
    detail.querySelector('[data-sales-dialog="cancel"]').addEventListener("click", () => ns.renderSalesPanel(mode.id));
  };

  ns.enterBattleMock = async function enterBattleMock(mode) {
    if (typeof ns.transitionTo === "function") return ns.transitionTo(() => ns.enterBattleMockDirect(mode));
    return ns.enterBattleMockDirect(mode);
  };

  ns.enterBattleMockDirect = async function enterBattleMockDirect(mode) {
    ns.setMode("battle");
    ns.ensureLayers();

    if (typeof ns.setBackgroundReady === "function") await ns.setBackgroundReady(ns.paths.officeBg);
    else ns.setBackground(ns.paths.officeBg);

    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
    if (typeof ns.hideMembersPanel === "function") ns.hideMembersPanel();
    if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
    if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (typeof ns.hideStoryLayer === "function") ns.hideStoryLayer();
    if (typeof ns.hideBattlePanel === "function") ns.hideBattlePanel();
    if (typeof ns.hideResultPanel === "function") ns.hideResultPanel();
    if (typeof ns.clearCharacters === "function") ns.clearCharacters();

    const restoreSales = () => {
      document.removeEventListener("tenotsu:battle:closed", restoreSales);
      try {
        if (typeof ns.enterSales === "function") {
          ns.enterSales({ selectedMode: mode && mode.id, noTransition: true });
        }
      } catch (_) {}
    };
    document.removeEventListener("tenotsu:battle:closed", restoreSales);
    document.addEventListener("tenotsu:battle:closed", restoreSales, { once: true });

    if (window.BattleProto && typeof window.BattleProto.openBattle === "function") {
      window.BattleProto.openBattle({ battleType: mode && mode.battleType, mode });
      ns.setText("店長", mode && mode.battleType === "eventBoss" ? "イベント営業を開始します。汚れた家電星人を探索し、専用イベントBPで清掃します。" : mode && mode.battleType === "rival" ? "バトル営業を開始します。VSビリビリの販売勝負です。" : "デッキ接客バトルを開始します。営業開始、サポートプレイ、デッキ編成を選べます。");
      return;
    }
    if (typeof window.startDeckBattlePrototype === "function") {
      window.startDeckBattlePrototype();
      ns.setText("店長", mode && mode.battleType === "eventBoss" ? "イベント営業を開始します。汚れた家電星人を探索し、専用イベントBPで清掃します。" : mode && mode.battleType === "rival" ? "バトル営業を開始します。VSビリビリの販売勝負です。" : "デッキ接客バトルを開始します。営業開始、サポートプレイ、デッキ編成を選べます。");
      return;
    }

    // Fallback: keep the old simple mock if extracted battle.js failed to load.
    ns.state.currentBattle = {
      modeId: mode.id, label: mode.label, score: 0, served: 0, combo: 0, maxCombo: 0,
      selectedCustomer: null, startedAt: Date.now(),
      customers: ns.pickDeckBattleCustomers(3, mode && mode.battleType === "rival" ? { traits: ["normal", "generous", "wavering", "big_order", "impatient", "help_lover"] } : {}),
      staff: (ns.deckBattleStaff || []).slice(0, 5)
    };

    ns.renderDeckBattle(mode);
    ns.setText("店長", "バトル本体が読み込めなかったため、簡易デッキ接客で開始します。");
  };

  ns.renderDeckBattle = function renderDeckBattle(mode) {
    const battle = ns.state.currentBattle;
    const customers = battle.customers || [];
    const staff = battle.staff || [];

    const customerCards = customers.map((enemy, index) => `
      <button type="button" class="tenotsu-deck-enemy ${battle.selectedCustomer === index ? "selected" : ""}" data-enemy-index="${index}">
        <span class="enemy-name">${enemy.name}</span>
        <span class="enemy-need">要望：${enemy.need}</span>
        ${enemy.trait ? `<span class="enemy-trait">特性：${enemy.trait}</span>` : ""}
        ${enemy.value ? `<span class="enemy-value">売上目安：${enemy.value}</span>` : ""}
      </button>`).join("");

    const staffCards = staff.map((card) => `
      <button type="button" class="tenotsu-deck-staff" data-staff-id="${card.id}">
        <span class="staff-name">${card.name}</span>
        <span class="staff-skill">${card.skill}</span>
        <span class="staff-power">営業力 ${card.power}</span>
      </button>`).join("");

    ns.showBattlePanel(`
      <div class="tenotsu-battle-title">${mode.label}</div>
      <div class="tenotsu-battle-subtitle">デッキ接客バトル試作</div>
      <div class="tenotsu-deck-status">
        <div>スコア <strong>${battle.score}</strong></div>
        <div>接客数 <strong>${battle.served}</strong></div>
        <div>コンボ <strong>${battle.combo}</strong></div>
      </div>
      <div class="tenotsu-deck-battle-field">
        <div class="tenotsu-deck-enemy-row">${customerCards}</div>
        <div class="tenotsu-deck-help">①家電星人を選択 → ②店員カードで接客</div>
        <div class="tenotsu-deck-staff-row">${staffCards}</div>
      </div>
      <div class="tenotsu-battle-actions">
        <button type="button" class="tenotsu-battle-button" data-battle-action="change">選択星人をチェンジ</button>
        <button type="button" class="tenotsu-battle-button danger" data-battle-action="end">営業終了</button>
      </div>`);

    const panel = ns.layers.battle;
    panel.querySelectorAll("[data-enemy-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        battle.selectedCustomer = Number(btn.dataset.enemyIndex);
        ns.renderDeckBattle(mode);
        const enemy = battle.customers[battle.selectedCustomer];
        ns.setText("店長", `${enemy.name}を接客対象にしました。相性の良い店員を選びましょう。`);
      });
    });
    panel.querySelectorAll("[data-staff-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = battle.staff.find((item) => item.id === btn.dataset.staffId);
        ns.resolveDeckService(mode, card);
      });
    });
    panel.querySelector('[data-battle-action="change"]').addEventListener("click", () => ns.changeDeckCustomer(mode));
    panel.querySelector('[data-battle-action="end"]').addEventListener("click", () => ns.showSalesResult(mode));
  };

  ns.resolveDeckService = function resolveDeckService(mode, card) {
    const battle = ns.state.currentBattle;
    if (!battle || !card) return;
    if (battle.selectedCustomer === null || battle.selectedCustomer === undefined) {
      ns.setText("店長", "先に接客する家電星人を選んでください。");
      return;
    }
    const enemy = battle.customers[battle.selectedCustomer];
    const matched = card.attr === enemy.weak;
    const comboBonus = Math.min(battle.combo * 10, 80);
    const baseValue = enemy.value || 100;
    const traitComboRate = enemy.comboRate || 1;
    const gain = matched ? Math.round((card.power + baseValue + comboBonus) * traitComboRate) : Math.floor(card.power * 0.45);
    battle.score += gain;
    battle.served += 1;
    battle.combo = matched ? battle.combo + 1 : 0;
    battle.maxCombo = Math.max(battle.maxCombo || 0, battle.combo);

    const nextEnemy = ns.pickDeckBattleCustomers(1, mode && mode.battleType === "rival" ? { traits: ["normal", "generous", "wavering", "big_order", "impatient", "help_lover"] } : {})[0];
    battle.customers.splice(battle.selectedCustomer, 1, nextEnemy);
    battle.selectedCustomer = null;
    ns.renderDeckBattle(mode);
    ns.setText("店長", matched ? `${card.name}の${card.skill}が刺さりました！ +${gain}点` : `${card.name}で接客しましたが相性はいまひとつ。 +${gain}点`);
  };

  ns.changeDeckCustomer = function changeDeckCustomer(mode) {
    const battle = ns.state.currentBattle;
    if (!battle) return;
    if (battle.selectedCustomer === null || battle.selectedCustomer === undefined) {
      ns.setText("店長", "チェンジする家電星人を先に選んでください。");
      return;
    }
    const nextEnemy = ns.pickDeckBattleCustomers(1, mode && mode.battleType === "rival" ? { traits: ["normal", "generous", "wavering", "big_order", "impatient", "help_lover"] } : {})[0];
    battle.customers.splice(battle.selectedCustomer, 1, nextEnemy);
    battle.score = Math.max(0, battle.score - 30);
    battle.combo = 0;
    battle.selectedCustomer = null;
    ns.renderDeckBattle(mode);
    ns.setText("店長", "家電星人をチェンジしました。ペナルティ -30点、コンボリセットです。");
  };

  ns.showSalesResult = async function showSalesResult(mode) {
    if (typeof ns.transitionTo === "function") return ns.transitionTo(() => ns.showSalesResultDirect(mode));
    return ns.showSalesResultDirect(mode);
  };

  ns.showSalesResultDirect = async function showSalesResultDirect(mode) {
    ns.setMode("result");
    const battle = ns.state.currentBattle || { score: 0, served: 0, label: mode.label };
    const elapsed = Math.max(1, Math.round((Date.now() - (battle.startedAt || Date.now())) / 1000));
    const rank = battle.score >= 360 ? "A" : battle.score >= 180 ? "B" : "C";
    if (typeof ns.hideBattlePanel === "function") ns.hideBattlePanel();
    ns.showResultPanel(`
      <div class="tenotsu-result-title">営業リザルト</div>
      <div class="tenotsu-result-mode">${battle.label || mode.label}</div>
      <div class="tenotsu-result-grid">
        <div><span>スコア</span><strong>${battle.score}</strong></div>
        <div><span>接客数</span><strong>${battle.served}</strong></div>
        <div><span>最大コンボ</span><strong>${battle.maxCombo || 0}</strong></div>
        <div><span>経過</span><strong>${elapsed}秒</strong></div>
        <div><span>評価</span><strong>${rank}</strong></div>
      </div>
      <div class="tenotsu-result-actions">
        <button type="button" class="tenotsu-result-button" data-result-action="retry">もう一度</button>
        <button type="button" class="tenotsu-result-button" data-result-action="sales">店舗営業へ戻る</button>
        <button type="button" class="tenotsu-result-button" data-result-action="office">事務所へ戻る</button>
      </div>`);
    ns.setText("店長", `営業終了です。評価は${rank}でした。`);
    const panel = ns.layers.result;
    panel.querySelector('[data-result-action="retry"]').addEventListener("click", () => { ns.hideResultPanel(); ns.enterBattleMock(mode); });
    panel.querySelector('[data-result-action="sales"]').addEventListener("click", () => { ns.hideResultPanel(); ns.enterSales({ selectedMode: mode.id }); });
    panel.querySelector('[data-result-action="office"]').addEventListener("click", () => { ns.hideResultPanel(); ns.enterOffice({ speaker: "店長", message: "事務所に戻りました。" }); });
  };

  ns.enterSales = async function enterSales(options = {}) {
    if (!options.noTransition && typeof ns.transitionTo === "function") {
      return ns.transitionTo(() => ns.enterSales({ noTransition: true }));
    }

    ns.setMode("sales");
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
    if (typeof ns.hideStoryLayer === "function") ns.hideStoryLayer();
    if (typeof ns.hideBattlePanel === "function") ns.hideBattlePanel();
    if (typeof ns.hideResultPanel === "function") ns.hideResultPanel();
    if (typeof ns.clearCharacters === "function") ns.clearCharacters();

    ns.renderOfficeMenu();
    ns.renderSalesPanel(options.selectedMode || null);
    ns.setText("店長", "店舗営業へ入ります。営業モードを選びましょう。");
  };
})();
