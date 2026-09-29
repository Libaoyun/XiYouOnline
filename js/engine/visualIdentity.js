/** 物种身份统一入口：地图、战斗、名册和头像共同使用。具名妖王优先于物种。 */
window.VisualIdentity = {
  aliases: { giant_rat: 'rat', wild_wolf: 'wolf', pet_snake: 'snake', bandit: 'hooligan', tyrant: 'hooligan', huangfeng: 'huangfeng_guai', jinjiao: 'jinjiao', yinjiao: 'yinjiao', xiaozuanfeng: 'changan_hawker', shura: 'yecha' },
  resolveMonster(appearance, name = '', id = '') {
    const text = `${name} ${id}`.toLowerCase();
    const rules = [
      [/金角|金角大王|jinjiao/, 'jinjiao'],
      [/银角|银角大王|yinjiao/, 'yinjiao'],
      [/小钻风|巡山小钻风|钻风|xiaozuanfeng/, 'changan_hawker'],
      [/修罗王|黑风修罗|修罗|shura/, 'yecha'],
      [/黄风|三昧神风|huangfeng/, 'huangfeng_guai'],
      [/黄袍|奎木狼|huangpao|kuimu/, 'huangpao_guai'],
      [/白骨夫人|白骨精|蚀骨尸魔|baigujing/, 'baigu_jing'],
      [/猪八戒|猪刚鬣|bajie/, 'zhu_bajie'],
      [/牛魔王|niumowang/, 'bull_demon'],
      [/金池|jinchi/, 'jinchi_elder'],
      [/红孩儿|honghaier/, 'honghaier'],
      [/蜘蛛|蛛魔|spider/, 'spider'], [/蜈蚣|centipede/, 'centipede'],
      [/巨蝎|青蝎|蝎妖|scorpion/, 'scorpion'], [/巨蜥|蜥蜴|lizard/, 'lizard'],
      [/蝠|bat_/, 'bat'], [/灵鹤|仙鹤|crane/, 'crane'], [/金雕|鹰卒|鹰妖|eagle/, 'eagle'],
      [/狂象|象妖|elephant/, 'elephant'], [/青玉狮|狮妖|lion/, 'lion'],
      [/顽石精|石怪|stone_spirit/, 'stone_spirit'],
      [/炎魔|火灵|fire_spirit/, 'fire_spirit'], [/水妖|water_wraith/, 'water_wraith'],
      [/恶僧|demon_monk/, 'demon_monk'], [/假道士|道童妖|demon_taoist/, 'demon_taoist'],
      [/厉鬼|ghost/, 'ghost'], [/骷髅|怨灵|skeleton|skel_/, 'skeleton'],
      [/野猪|妖猪|猪妖/, 'pig'], [/野狐|灵狐|火狐|青丘|fox/, 'fox'],
      [/狼|血狼|野狼|郊狼|wolf/, 'wolf'],
      [/枯树|树精|tree/, 'tree'], [/虎卒|tiger/, 'tiger'],
      [/石猴|小猴|stone_monkey/, 'stone_monkey'], [/夜叉|yecha/, 'yecha']
    ];
    const match = rules.find(([pattern]) => pattern.test(text));
    return match ? match[1] : (appearance || null);
  }
};
