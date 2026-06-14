/* v039_128 story progress / affection default 100 + clear helpers */
(function(){
  "use strict";
  const ns = window.TENOTSU_V039 = window.TENOTSU_V039 || {};
  const STORAGE_KEY = "tenotsu_story_progress_v1";
  const DEFAULT_AFFECTION_LEVEL = 100;
  window.TENOTSU_DEBUG_ALL_STORIES = true; // trial: 回想確認用。正式運用ではfalseへ。

  function clone(obj){ return JSON.parse(JSON.stringify(obj || {})); }
  function now(){ return new Date().toISOString(); }
  function load(){
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { data = null; }
    if (!data || typeof data !== "object") data = {};
    data.version = "v039_128";
    data.clearedStories = Array.isArray(data.clearedStories) ? data.clearedStories : [];
    data.readStories = Array.isArray(data.readStories) ? data.readStories : [];
    data.affectionLevels = data.affectionLevels && typeof data.affectionLevels === "object" ? data.affectionLevels : {};
    data.updatedAt = data.updatedAt || now();
    return data;
  }
  function save(data){
    data.version = "v039_128";
    data.updatedAt = now();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    return data;
  }
  function uniquePush(arr, value){ if (value && !arr.includes(value)) arr.push(value); }
  function getStoryIndex(){ return Array.isArray(window.TENOTSU_STORY_INDEX) ? window.TENOTSU_STORY_INDEX : []; }
  function getStoryById(storyId){ return getStoryIndex().find((s) => s && s.id === storyId) || null; }
  function clampAffection(level){ return Math.max(1, Math.min(100, Math.floor(Number(level) || 1))); }

  ns.getStoryProgress = function getStoryProgress(){ return clone(load()); };
  ns.isStoryCleared = function isStoryCleared(storyId){ return load().clearedStories.includes(storyId); };
  ns.isStoryRead = function isStoryRead(storyId){ const d = load(); return d.readStories.includes(storyId) || d.clearedStories.includes(storyId); };
  ns.markStoryRead = function markStoryRead(storyId){ const d = load(); uniquePush(d.readStories, storyId); return save(d); };
  ns.markStoryCleared = function markStoryCleared(storyId){ const d = load(); uniquePush(d.readStories, storyId); uniquePush(d.clearedStories, storyId); return save(d); };
  ns.getStoryById = getStoryById;

  ns.getAffectionLevel = function getAffectionLevel(characterId){
    const d = load();
    const value = d.affectionLevels && d.affectionLevels[characterId];
    return clampAffection(value == null ? DEFAULT_AFFECTION_LEVEL : value);
  };
  ns.setAffectionLevel = function setAffectionLevel(characterId, level){
    const d = load();
    d.affectionLevels[characterId] = clampAffection(level);
    return save(d);
  };
  ns.addAffectionLevel = function addAffectionLevel(characterId, delta){
    return ns.setAffectionLevel(characterId, ns.getAffectionLevel(characterId) + Number(delta || 0));
  };


  ns.getKnownAffectionCharacterIds = function getKnownAffectionCharacterIds(){
    const ids = [];
    function add(id){ if (id && !ids.includes(id)) ids.push(id); }
    try { (ns.memberProfiles || []).forEach((m) => add(m && m.id)); } catch (_) {}
    try { Object.keys(window.TENOTSU_KEY_STORY_CONFIG || {}).forEach(add); } catch (_) {}
    try { getStoryIndex().forEach((s) => add(s && (s.character || s.characterId || (s.unlock && s.unlock.character)))); } catch (_) {}
    return ids;
  };

  ns.setAllAffectionLevels = function setAllAffectionLevels(level){
    const d = load();
    const ids = ns.getKnownAffectionCharacterIds ? ns.getKnownAffectionCharacterIds() : [];
    ids.forEach((id) => { d.affectionLevels[id] = clampAffection(level); });
    save(d);
    return ids.length;
  };

  ns.clearAllAffectionStories = function clearAllAffectionStories(){
    const d = load();
    let count = 0;
    getStoryIndex().forEach((story) => {
      if (!story || !story.id) return;
      const isAffectionStory = story.type === "character_key_story" || story.type === "character_main_story" || story.affectionBlock || (story.unlock && story.unlock.type === "affection_level");
      if (!isAffectionStory) return;
      uniquePush(d.readStories, story.id);
      uniquePush(d.clearedStories, story.id);
      count += 1;
    });
    save(d);
    return count;
  };

  ns.getCharacterLevelForUnlock = function getCharacterLevelForUnlock(characterId){
    try {
      if (window.TenotsuGrowth && typeof window.TenotsuGrowth.getCharacterState === "function") {
        const st = window.TenotsuGrowth.getCharacterState(characterId);
        return st && st.level ? Number(st.level) : 1;
      }
    } catch (_) {}
    return 1;
  };

  ns.isKeyStoryComplete = function isKeyStoryComplete(characterId){
    const cfg = window.TENOTSU_KEY_STORY_CONFIG && window.TENOTSU_KEY_STORY_CONFIG[characterId];
    if (!cfg || !Array.isArray(cfg.requiredStories) || !cfg.requiredStories.length) return false;
    return cfg.requiredStories.every((storyId) => ns.isStoryCleared(storyId));
  };

  ns.countCompletedKeyStories = function countCompletedKeyStories(){
    const cfg = window.TENOTSU_KEY_STORY_CONFIG || {};
    return Object.keys(cfg).filter((characterId) => ns.isKeyStoryComplete(characterId)).length;
  };

  ns.isStoryUnlocked = function isStoryUnlocked(story){
    if (!story) return false;
    const unlock = story.unlock || { type: "always" };
    if (window.TENOTSU_DEBUG_ALL_STORIES && unlock.type !== "affection_level") return true;
    switch (unlock.type) {
      case "always": return true;
      case "story_cleared": return ns.isStoryCleared(unlock.storyId);
      case "all_story_cleared": return (unlock.storyIds || []).every((storyId) => ns.isStoryCleared(storyId)) || (unlock.fallback ? ns.isStoryUnlocked({ unlock: unlock.fallback }) : false);
      case "character_level": return ns.getCharacterLevelForUnlock(unlock.character) >= Number(unlock.level || 1);
      case "affection_level": return ns.getAffectionLevel(unlock.character) >= Number(unlock.level || 1);
      case "key_complete": return ns.isKeyStoryComplete(unlock.character);
      case "key_complete_count": return ns.countCompletedKeyStories() >= Number(unlock.count || 0);
      case "all_key_complete": return (unlock.characters || []).every((characterId) => ns.isKeyStoryComplete(characterId));
      default: return false;
    }
  };

  ns.canShowInRecollection = function canShowInRecollection(story){
    if (!story) return false;
    if (window.TENOTSU_DEBUG_ALL_STORIES) return true;
    return ns.isStoryCleared(story.id);
  };
})();
