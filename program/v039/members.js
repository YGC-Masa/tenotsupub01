/* v039_110 members: profile area + independent affection story slot area */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  }

  function getGrowthInfo(member) {
    if (!window.TenotsuGrowth || !member) return null;
    const state = typeof window.TenotsuGrowth.getCharacterState === "function" ? window.TenotsuGrowth.getCharacterState(member.id) : null;
    const progress = typeof window.TenotsuGrowth.getLevelProgress === "function" ? window.TenotsuGrowth.getLevelProgress(member.id) : null;
    const stats = typeof window.TenotsuGrowth.getComputedStats === "function" ? window.TenotsuGrowth.getComputedStats(member.id) : null;
    const defs = typeof window.TenotsuGrowth.getStatDefs === "function" ? window.TenotsuGrowth.getStatDefs() : {};
    return { state, progress, stats, defs };
  }

  function renderStatsMini(member) {
    const info = getGrowthInfo(member);
    if (!info || !info.stats) return `<div class="tenotsu-member-stat-mini muted">Lv/ステータス準備中</div>`;
    const keys = ["proposal", "speed", "stamina", "care", "honesty", "luck"];
    const statItems = keys.map((key) => {
      const label = info.defs && info.defs[key] ? info.defs[key].label : key;
      return `<span><i>${esc(label)}</i><b>${esc(info.stats[key])}</b></span>`;
    }).join("");
    const level = info.state && info.state.level ? info.state.level : 1;
    const exp = info.progress && Number.isFinite(info.progress.required) ? `${info.progress.exp}/${info.progress.required}` : "MAX";
    return `
      <div class="tenotsu-member-stat-mini">
        <div class="tenotsu-member-level">Lv.${esc(level)} <small>EXP ${esc(exp)}</small></div>
        <div class="tenotsu-member-stat-grid">${statItems}</div>
      </div>
    `;
  }

  function renderEquipmentMini(member) {
    const info = getGrowthInfo(member);
    const item = info && info.state && info.state.equipment ? info.state.equipment.personal : null;
    const label = item && item.name ? item.name : "なし";
    return `
      <div class="tenotsu-member-equipment-mini" aria-label="持ち物">
        <span>持ち物</span>
        <b>${esc(label)}</b>
        <small>将来、接客道具や差し入れを持たせる枠です</small>
      </div>
    `;
  }

  function renderMemberDetail(detail, member) {
    if (!detail || !member) return;
    detail.innerHTML = `
      <div class="tenotsu-member-detail-head tenotsu-member-detail-head-v110">
        <img src="${esc(ns.paths.charBase + member.image)}" alt="${esc(member.name)}" class="tenotsu-member-detail-img">
        <div class="tenotsu-member-detail-info-stack">
          <div class="tenotsu-member-identity-box" aria-label="メンバー基本情報">
            <div class="tenotsu-member-detail-name">${esc(member.name)}</div>
            <div class="tenotsu-member-detail-role">${esc(member.role)}</div>
            <div class="tenotsu-member-detail-specialty">得意：${esc(member.specialty)}</div>
          </div>
          <div class="tenotsu-member-detail-comment" aria-label="メンバーコメント">
            <span class="tenotsu-member-comment-label">ひとこと</span>
            <span class="tenotsu-member-comment-text">${esc(member.comment)}</span>
            ${member.introScenario ? `<button type="button" class="tenotsu-member-intro-button" data-member-intro="${esc(member.introScenario)}">自己紹介</button>` : ""}
          </div>
        </div>
      </div>
      ${renderStatsMini(member)}
      ${renderEquipmentMini(member)}
      <div class="tenotsu-member-detail-note">右側の親愛ストーリースロットから、メイン/キーストーリーを解放・再生します。</div>
    `;
    const introBtn = detail.querySelector("[data-member-intro]");
    if (introBtn) {
      introBtn.addEventListener("click", (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const scenario = introBtn.getAttribute("data-member-intro");
        if (scenario && typeof ns.startStory === "function") {
          ns.startStory(scenario, { mode: "members", memberId: member.id });
        }
      });
    }
  }

  function renderMemberStoryArea(storyArea, member, rerenderAll) {
    if (!storyArea) return;
    if (!member) {
      storyArea.innerHTML = `<div class="tenotsu-member-story-empty">メンバーを選択すると、ここに親愛ストーリー枠が表示されます。</div>`;
      return;
    }
    storyArea.innerHTML = typeof ns.renderMemberStorySlots === "function"
      ? ns.renderMemberStorySlots(member)
      : `<div class="tenotsu-member-story-empty">親愛ストーリー機能を読み込めませんでした。</div>`;
    if (typeof ns.bindMemberStorySlots === "function") {
      ns.bindMemberStorySlots(storyArea, member, () => {
        if (typeof rerenderAll === "function") rerenderAll(member);
        else renderMemberStoryArea(storyArea, member, rerenderAll);
      });
    }
  }

  ns.renderMembersPanel = function renderMembersPanel(options = {}) {
    const members = ns.memberProfiles || [];
    const cards = members.map((m, index) => `
      <button type="button" class="tenotsu-member-card" data-member-index="${index}">
        <span class="tenotsu-member-color" style="background:${esc(m.color)}"></span>
        <span class="tenotsu-member-name">${esc(m.name)}</span>
        <span class="tenotsu-member-role">${esc(m.role)}</span>
      </button>
    `).join("");

    const html = `
      <div class="tenotsu-members-title">メンバー</div>
      <div class="tenotsu-members-body tenotsu-members-body-v110">
        <div class="tenotsu-members-list">${cards}</div>
        <div class="tenotsu-member-detail" data-member-detail>
          <div class="tenotsu-member-detail-empty">メンバーを選択してください。</div>
        </div>
        <div class="tenotsu-member-story-side" data-member-story-area>
          <div class="tenotsu-member-story-empty">メンバーを選択すると、ここに親愛ストーリー枠が表示されます。</div>
        </div>
      </div>
      <button type="button" class="tenotsu-members-back" data-members-action="back-office">事務所に戻る</button>
    `;

    ns.showMembersPanel(html);

    const panel = ns.layers.members;
    const detail = panel.querySelector("[data-member-detail]");
    const storyArea = panel.querySelector("[data-member-story-area]");

    panel.querySelectorAll("[data-member-index]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const m = members[Number(btn.dataset.memberIndex)];
        if (!m) return;
        ns.state.lastSelectedMemberId = m.id;
        panel.querySelectorAll(".tenotsu-member-card").forEach((card) => card.classList.remove("selected"));
        btn.classList.add("selected");
        const rerenderAll = (nextMember) => {
          renderMemberDetail(detail, nextMember);
          renderMemberStoryArea(storyArea, nextMember, rerenderAll);
        };
        rerenderAll(m);
        ns.setText(m.name, m.comment);
      });
    });

    const selectedId = options.selectedMemberId || ns.state.lastSelectedMemberId || null;
    if (selectedId) {
      const selectedIndex = members.findIndex((m) => m && m.id === selectedId);
      const selectedBtn = selectedIndex >= 0 ? panel.querySelector(`[data-member-index="${selectedIndex}"]`) : null;
      if (selectedBtn) {
        selectedBtn.click();
      }
    }

    const back = panel.querySelector('[data-members-action="back-office"]');
    if (back) {
      back.addEventListener("click", () => {
        ns.hideMembersPanel();
        ns.enterOffice({ speaker: "店長", message: "事務所に戻りました。" });
      });
    }
  };

  ns.enterMembers = async function enterMembers(options = {}) {
    if (!options.noTransition && typeof ns.transitionTo === "function") {
      return ns.transitionTo(() => ns.enterMembers({ noTransition: true }));
    }
    ns.setMode("members");
    ns.ensureLayers();
    if (typeof ns.setBackgroundReady === "function") {
      await ns.setBackgroundReady(ns.paths.officeBg);
    } else {
      ns.setBackground(ns.paths.officeBg);
    }
    if (typeof ns.hideSettingsPanel === "function") ns.hideSettingsPanel();
    if (typeof ns.hideShopPanel === "function") ns.hideShopPanel();
    if (typeof ns.hideTownPanel === "function") ns.hideTownPanel();
    if (typeof ns.hideStoryMenuPanel === "function") ns.hideStoryMenuPanel();
    if (typeof ns.hideStoreStatusPanel === "function") ns.hideStoreStatusPanel();
    if (typeof ns.hideSalesPanel === "function") ns.hideSalesPanel();
    ns.renderOfficeMenu();
    ns.renderMembersPanel({ selectedMemberId: options.selectedMemberId || ns.state.lastSelectedMemberId || null });
    if (options.selectedMemberId || ns.state.lastSelectedMemberId) {
      ns.setText("店長", "メンバー確認に戻りました。");
    } else {
      ns.setText("店長", "メンバーを確認します。個別プロフィール右側の専用枠から親愛ストーリーを確認できます。");
    }
  };
})();
