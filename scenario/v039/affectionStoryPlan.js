/* v039_127 affection story plan: member profile story slots up to affection Lv.100 */
(function(){
  "use strict";
  const BLOCK_SIZE = 10;
  const MAX_AFFECTION_LEVEL = 100;

  function clampLevel(value){
    const n = Math.floor(Number(value) || 1);
    return Math.max(1, Math.min(MAX_AFFECTION_LEVEL, n));
  }
  function getBlockForLevel(level){
    return Math.max(1, Math.ceil(clampLevel(level) / BLOCK_SIZE));
  }
  function getBlockBase(block){
    return (Math.max(1, Math.floor(Number(block) || 1)) - 1) * BLOCK_SIZE;
  }
  function makeSlotsForBlock(block){
    const base = getBlockBase(block);
    return [
      { slotId: `b${block}_key1`, kind: "key", label: `キー${(block - 1) * 3 + 1}`, unlockLevel: base + 1, keyIndex: (block - 1) * 3 + 1 },
      { slotId: `b${block}_key2`, kind: "key", label: `キー${(block - 1) * 3 + 2}`, unlockLevel: base + 4, keyIndex: (block - 1) * 3 + 2 },
      { slotId: `b${block}_key3`, kind: "key", label: `キー${(block - 1) * 3 + 3}`, unlockLevel: base + 7, keyIndex: (block - 1) * 3 + 3 },
      { slotId: `b${block}_main`, kind: "main", label: `メイン${block}`, unlockLevel: base + 10, mainIndex: block }
    ];
  }
  function makeAllSlots(){
    const out = [];
    for (let block = 1; block <= MAX_AFFECTION_LEVEL / BLOCK_SIZE; block += 1) {
      out.push.apply(out, makeSlotsForBlock(block));
    }
    return out;
  }

  window.TENOTSU_AFFECTION_STORY_PLAN = {
    version: "v039_127",
    maxAffectionLevel: MAX_AFFECTION_LEVEL,
    blockSize: BLOCK_SIZE,
    keyUnlockLevelsInBlock: [1, 4, 7],
    mainUnlockLevelInBlock: 10,
    getBlockForLevel,
    getBlockBase,
    makeSlotsForBlock,
    makeAllSlots
  };
})();
