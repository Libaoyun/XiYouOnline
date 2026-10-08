/** 见闻、献录与里程奖励。只以物种 templateId 计数，实例不参与种类计数。 */
class ShanhaiSystem {
  constructor(saved = {}) {
    this.seen = {};
    this.entries = {};
    this.claimedRewards = {};
    for (const field of ['seen', 'entries']) {
      for (const id of Object.keys(saved?.[field] || {})) {
        if (window.GAME_DATA.PETS[id] && saved[field][id]) this[field][id] = true;
      }
    }
    for (const key of Object.keys(saved?.claimedRewards || {})) {
      if (/^(ordinary|sanxian|jinxian)_\d+$/.test(key) && saved.claimedRewards[key] === true) this.claimedRewards[key] = true;
    }
    for (const id of Object.keys(this.entries)) this.seen[id] = true;
  }

  static isCollectible(pet) {
    const template = window.GAME_DATA.PETS[pet?.templateId || pet?.id];
    return !!template && !pet.isStoryCompanion && !pet.isBoss && template.collectible !== false &&
      !/^(super_|sun_wukong|wukong$|guanyin|rulai|yudi)/.test(pet.templateId || pet.id) &&
      !/孙悟空|观音菩萨|如来佛祖|玉皇大帝/.test(pet.name || template.name);
  }

  static resolveSpecies(entity, mapId) {
    const pets = window.GAME_DATA.PETS;
    if (pets[entity?.templateId]) return entity.templateId;
    const registered = window.GAME_DATA.SHANHAI_SPECIES_BY_MONSTER?.[mapId + ':' + entity?.id];
    if (registered) return registered;
    const clean = window.GAME_DATA.cleanShanhaiSpeciesName || (name => name);
    return Object.values(pets).find(p => p.name === clean(entity?.name))?.id || null;
  }

  observe(entity, mapId) {
    const id = ShanhaiSystem.resolveSpecies(entity, mapId);
    if (!id || this.seen[id]) return false;
    this.seen[id] = true;
    return true;
  }

  counts() {
    const counts = { ordinary: 0, sanxian: 0, jinxian: 0 };
    for (const id of Object.keys(this.entries)) {
      const template = window.GAME_DATA.PETS[id];
      if (ShanhaiSystem.isCollectible(template) && Object.hasOwn(counts, template.quality)) counts[template.quality]++;
    }
    return counts;
  }

  collect(app, instanceId) {
    if (app.currentBattle || app.isTransitioning) return { success: false, msg: '请在战斗与转场结束后献录。' };
    const index = (app.pets || []).findIndex(p => p.instanceId === instanceId);
    const pet = app.pets?.[index];
    if (!ShanhaiSystem.isCollectible(pet)) return { success: false, msg: '这位生灵无法献录。' };
    if (this.entries[pet.templateId]) return { success: false, msg: '同种生灵已经收录，无需再交出仙宠。' };
    this.seen[pet.templateId] = true;
    this.entries[pet.templateId] = true;
    app.pets.splice(index, 1);
    app.activeCombatPets = (app.activeCombatPets || []).filter(p => p.instanceId !== instanceId);
    if (app.tempWashResult?.instanceId === instanceId) app.tempWashResult = null;
    return { success: true, msg: `【${pet.name}】已入山海经，化作书中灵韵；其他同种仙宠不受影响。` };
  }

  rewards() {
    const counts = this.counts();
    const available = { ordinary: 0, sanxian: 0, jinxian: 0 };
    for (const p of Object.values(window.GAME_DATA.PETS)) if (ShanhaiSystem.isCollectible(p)) available[p.quality]++;
    const result = [];
    const add = (quality, threshold, reward) => {
      const key = quality + '_' + threshold;
      result.push({ key, quality, threshold, ...reward, unlocked: counts[quality] >= threshold, claimed: !!this.claimedRewards[key] });
    };
    for (let n = 10; n <= available.ordinary; n += 5) {
      add('ordinary', n, n === 30 ? { petQuality: 'sanxian', label: '随机散仙 ×1' } :
        n === 50 ? { petQuality: 'jinxian', label: '随机金仙 ×1' } : { itemId: 'silver_gourd', label: '收仙银壶 ×1' });
    }
    add('sanxian', 3, { petQuality: 'sanxian', label: '随机散仙 ×1' });
    add('sanxian', 10, { petQuality: 'jinxian', label: '随机金仙 ×1' });
    for (let n = 3; n <= available.jinxian; n += 3) add('jinxian', n, { petQuality: 'jinxian', label: '随机金仙 ×1' });
    return result;
  }

  claim(app, key) {
    if (app.currentBattle || app.isTransitioning) return { success: false, msg: '请在战斗与转场结束后领奖。' };
    const reward = this.rewards().find(r => r.key === key);
    if (!reward || !reward.unlocked || reward.claimed) return { success: false, msg: '此奖励尚未达成或已经领取。' };
    let pet;
    if (reward.itemId) {
      if (!app.inventory?.addItemsAtomically([{ itemId: reward.itemId, count: 1 }]).success) {
        return { success: false, msg: '背包已满，请整理后再领；奖励会保留。' };
      }
    } else {
      const pool = Object.values(window.GAME_DATA.PETS).filter(p => p.quality === reward.petQuality && ShanhaiSystem.isCollectible(p));
      if (!pool.length) return { success: false, msg: '暂无可领取的仙宠。' };
      pet = window.PetSystem.createPet(pool[Math.floor(Math.random() * pool.length)].id, true, 1);
      if (!pet) return { success: false, msg: '仙宠生成失败，请稍后重试。' };
      app.pets.push(pet);
      this.observe(pet);
    }
    this.claimedRewards[key] = true;
    return { success: true, pet, msg: `山海经赠礼：获得${pet ? `【${pet.name}】Lv.1` : reward.label}！` };
  }

  toJSON() { return { seen: this.seen, entries: this.entries, claimedRewards: this.claimedRewards }; }
}
window.ShanhaiSystem = ShanhaiSystem;
