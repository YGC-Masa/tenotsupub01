/* v039_162 member profile story slots: affection Lv label + title split */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};

  function esc(value){ return String(value == null ? "" : value).replace(/[&<>\"]/g, (ch) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[ch])); }
  function allStories(){ return Array.isArray(window.TENOTSU_STORY_INDEX) ? window.TENOTSU_STORY_INDEX : []; }
  function storyById(id){ return allStories().find((s) => s && s.id === id) || null; }
  function cfgFor(characterId){ return window.TENOTSU_KEY_STORY_CONFIG && window.TENOTSU_KEY_STORY_CONFIG[characterId] ? window.TENOTSU_KEY_STORY_CONFIG[characterId] : { slotStories:{} }; }
  function plan(){ return window.TENOTSU_AFFECTION_STORY_PLAN || null; }
  function maxBlock(){ const p = plan(); return p && p.maxAffectionLevel && p.blockSize ? Math.ceil(p.maxAffectionLevel / p.blockSize) : 10; }
  function clampBlock(value){ const n = Math.floor(Number(value) || 1); return Math.max(1, Math.min(maxBlock(), n)); }
  function currentAffectionBlock(characterId){
    const affection = typeof ns.getAffectionLevel === "function" ? ns.getAffectionLevel(characterId) : 1;
    const p = plan();
    return p && p.getBlockForLevel ? p.getBlockForLevel(affection) : Math.ceil(affection / 10);
  }
  function getViewingBlock(characterId){
    ns.state = ns.state || {};
    ns.state.memberStoryBlockByCharacter = ns.state.memberStoryBlockByCharacter || {};
    return clampBlock(ns.state.memberStoryBlockByCharacter[characterId] || currentAffectionBlock(characterId));
  }
  function setViewingBlock(characterId, block){
    ns.state = ns.state || {};
    ns.state.memberStoryBlockByCharacter = ns.state.memberStoryBlockByCharacter || {};
    ns.state.memberStoryBlockByCharacter[characterId] = clampBlock(block);
    return ns.state.memberStoryBlockByCharacter[characterId];
  }

  ns.findMemberStoryForSlot = function findMemberStoryForSlot(characterId, slot){
    const cfg = cfgFor(characterId);
    const mapped = cfg.slotStories && cfg.slotStories[slot.slotId] ? storyById(cfg.slotStories[slot.slotId]) : null;
    if (mapped) return mapped;
    return allStories().find((story) => story && story.character === characterId && story.affectionBlock === Math.ceil(slot.unlockLevel / 10) && story.affectionSlot === (slot.kind === "main" ? "main" : `key${((slot.keyIndex - 1) % 3) + 1}`)) || null;
  };

  ns.getMemberStorySlots = function getMemberStorySlots(characterId, block){
    const p = plan();
    const affection = typeof ns.getAffectionLevel === "function" ? ns.getAffectionLevel(characterId) : 1;
    const targetBlock = clampBlock(block || getViewingBlock(characterId));
    const slots = p && p.makeSlotsForBlock ? p.makeSlotsForBlock(targetBlock) : [];
    return slots.map((slot) => {
      const story = ns.findMemberStoryForSlot(characterId, slot);
      const unlocked = affection >= slot.unlockLevel && (!story || typeof ns.isStoryUnlocked !== "function" || ns.isStoryUnlocked(story));
      const cleared = story && typeof ns.isStoryCleared === "function" ? ns.isStoryCleared(story.id) : false;
      return Object.assign({}, slot, { story, unlocked, cleared, affectionLevel: affection, block: targetBlock });
    });
  };

  ns.renderMemberStorySlots = function renderMemberStorySlots(member){
    if (!member || !member.id) return "";
    const affection = typeof ns.getAffectionLevel === "function" ? ns.getAffectionLevel(member.id) : 1;
    const p = plan();
    const currentBlock = currentAffectionBlock(member.id);
    const block = getViewingBlock(member.id);
    const min = (block - 1) * 10 + 1;
    const max = block * 10;
    const slots = ns.getMemberStorySlots(member.id, block);
    const cards = slots.map((slot) => {
      const story = slot.story;
      const state = story ? (slot.cleared ? "読了" : (slot.unlocked ? "再生可" : `親愛Lv.${slot.unlockLevel}`)) : "未登録";
      const disabled = !story || !slot.unlocked;
      const lvLabel = story && story.affectionLabel ? story.affectionLabel : `親愛Lv.${slot.unlockLevel}`;
      const titleLabel = story ? (story.rawTitle || story.title || "シナリオ未登録") : "シナリオ未登録";
      return `
        <button type="button" class="tenotsu-member-story-slot ${slot.kind} ${slot.cleared ? "cleared" : ""} ${disabled ? "locked" : ""}" data-member-story-id="${story ? esc(story.id) : ""}" ${disabled ? "disabled" : ""}>
          <span class="slot-label">${esc(lvLabel)}</span>
          <b>${esc(titleLabel)}</b>
          <small>${esc(state)}</small>
        </button>
      `;
    }).join("");

    return `
      <div class="tenotsu-member-story-box" data-member-story-box="${esc(member.id)}">
        <div class="tenotsu-member-story-head">
          <div>
            <span class="tenotsu-member-story-label">親愛ストーリー</span>
            <b>親愛Lv.${esc(affection)}</b>
            <small>表示段：Lv.${esc(min)}〜${esc(max)} / 現在段：${esc(currentBlock)}</small>
          </div>
          <div class="tenotsu-member-story-debug">
            <button type="button" data-affection-debug="down" data-character-id="${esc(member.id)}">-1</button>
            <button type="button" data-affection-debug="up" data-character-id="${esc(member.id)}">+1</button>
          </div>
        </div>
        <div class="tenotsu-member-story-block-nav" aria-label="親愛ストーリー段切替">
          <button type="button" data-story-block-nav="prev" data-character-id="${esc(member.id)}" ${block <= 1 ? "disabled" : ""}>◀</button>
          <div>
            <b>Lv.${esc(min)}〜${esc(max)}</b>
            <small>10Lv単位で表示切替</small>
          </div>
          <button type="button" data-story-block-nav="next" data-character-id="${esc(member.id)}" ${block >= maxBlock() ? "disabled" : ""}>▶</button>
          <button type="button" class="current" data-story-block-nav="current" data-character-id="${esc(member.id)}">現在Lv段</button>
        </div>
        <div class="tenotsu-member-story-slot-grid">${cards}</div>
        <div class="tenotsu-member-story-note">親愛Lvとは別に、左右ボタンでLv.1〜10 / 11〜20 / 21〜30……を切り替えられます。</div>
      </div>
    `;
  };

  ns.bindMemberStorySlots = function bindMemberStorySlots(detail, member, rerender){
    if (!detail || !member) return;
    detail.querySelectorAll("[data-member-story-id]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        const story = storyById(btn.dataset.memberStoryId);
        if (!story || !story.scenario || (typeof ns.isStoryUnlocked === "function" && !ns.isStoryUnlocked(story))) return;
        if (typeof ns.markStoryRead === "function") ns.markStoryRead(story.id);
        if (typeof ns.startStory === "function") ns.startStory(story.scenario, { mode: "members", memberId: member.id, storyId: story.id });
      });
    });
    detail.querySelectorAll("[data-story-block-nav]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        const action = btn.dataset.storyBlockNav;
        const current = getViewingBlock(member.id);
        if (action === "prev") setViewingBlock(member.id, current - 1);
        else if (action === "next") setViewingBlock(member.id, current + 1);
        else if (action === "current") setViewingBlock(member.id, currentAffectionBlock(member.id));
        if (typeof rerender === "function") rerender(member);
      });
    });
    detail.querySelectorAll("[data-affection-debug]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.preventDefault();
        const delta = btn.dataset.affectionDebug === "up" ? 1 : -1;
        if (typeof ns.addAffectionLevel === "function") ns.addAffectionLevel(member.id, delta);
        if (typeof rerender === "function") rerender(member);
      });
    });
  };
})();
