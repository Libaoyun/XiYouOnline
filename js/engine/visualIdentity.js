/** 物种身份统一入口：地图、战斗、名册和头像共同使用。具名妖王优先于物种。 */
window.VisualIdentity = {
  // 物种 ID 与剧情角色 ID 是两套命名：sha_wujing 在宠物表里是巡海夜叉。
  // 只在有 templateId 的单位上下文中解释这个旧键，保留对白沙悟净的兼容性。
  speciesAppearances: {
    shuo_shu: 'rat', hooligan_wild: 'hooligan', caokou: 'bandit',
    kushu_jing: 'kushu_jing', shuyao: 'shuyao', wolf_wild: 'wolf_wild', shanlang: 'shanlang', langyao: 'langyao',
    yinke: 'tiger', diaojing_guai: 'tiger', huli: 'fox', hulijing: 'fox',
    xiaohua_she: 'xiaohua_she', sheyao: 'sheyao',
    mihou: 'mihou', mihou_bing: 'mihou_bing', mihou_jiang: 'mihou_jiang',
    yuanhou: 'yuanhou', yuanhou_bing: 'yuanhou_bing', yuanhou_jiang: 'yuanhou_jiang',
    clam_jing: 'clam', crab_jing: 'crab', lobster_jing: 'shrimp', bangjing: 'clam', xia_bing: 'shrimp', xie_jiang: 'crab',
    yuxian: 'fish', shuiyao: 'water_wraith', hongliyu: 'red_carp', heiyu: 'black_fish',
    youhun: 'ghost', daoshi: 'demon_taoist', yaodao: 'demon_taoist', duxie: 'scorpion',
    shiguai: 'stone_spirit', zhizhuguai: 'spider', heixiong_guai_mob: 'bear', baigu_xiaoyao: 'skeleton',
    huabanzhu: 'spider', lingmao: 'spirit_cat', cat_demon: 'cat_demon', shuyao_rat: 'rat', kanjing: 'rat', zishen: 'rat',
    zijingguai: 'crystal_spirit', hualishu: 'rat', changwei_yaoji: 'rooster', huangjin_shachong: 'sandworm', shijing: 'stone_spirit', shiyao: 'stone_spirit',
    sha_wujing: 'yecha', bailong_ma: 'xiaobailong', sha_seng: 'sha_wujing',
    honghai_er: 'honghaier', tieshan_gongzhu: 'tieshan', niumowang: 'bull_demon',
    heixiong_guai: 'bear', chimao_mahou: 'mihou_bing', tongbi_yuanhou: 'yuanhou_bing',
    xihai_longwang: 'aoguang', juling_shen: 'heaven_general',
    nezha: 'nezha', lijing: 'lijing', change: 'change_fairy'
  },
  npcAppearances: {
    npc_zhenyuanzi: 'zhenyuanzi', npc_taishang_laojun: 'taishang_laojun',
    npc_tangtaizong: 'tangtaizong', npc_gaocuilan: 'gaocuilan', npc_yehu_hermit: 'xuanfeng_daoshi',
    npc_li_jing: 'lijing', npc_taibai_warning: 'taibai_jinxing'
  },
  resolveUnit(unit = {}) {
    // 已改名的仙宠仍按物种绘制，不能靠昵称“孙悟空”换成大圣。
    const templateId = unit.templateId || unit.entity?.templateId;
    if (templateId && this.speciesAppearances[templateId]) return this.speciesAppearances[templateId];
    if (templateId && window.GAME_DATA?.PETS?.[templateId]) {
      const template = window.GAME_DATA.PETS[templateId];
      return this.resolveMonster(template.appearance, template.name, template.id) ||
        unit.appearance || unit.modelId || unit.roleId || 'heaven_general';
    }
    if (this.npcAppearances[unit.id]) return this.npcAppearances[unit.id];
    return this.resolveMonster(unit.appearance || unit.modelId || unit.roleId, unit.name, unit.id);
  },
  aliases: { giant_rat: 'rat', wild_wolf: 'wolf', pet_snake: 'snake', bandit: 'hooligan', tyrant: 'hooligan', huangfeng: 'huangfeng_guai', jinjiao: 'jinjiao', yinjiao: 'yinjiao', xiaozuanfeng: 'changan_hawker', shura: 'yecha' },
  resolveMonster(appearance, name = '', id = '') {
    // 地图只有纯物种 ID 时也保留阶段外观；对白规范 ID 不走此路径。
    if (this.speciesAppearances[id]) return this.speciesAppearances[id];
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
      [/孙悟空|齐天大圣|sun_wukong/, 'sun_wukong'],
      [/镇元|zhenyuanzi/, 'zhenyuanzi'], [/太上老君|taishang_laojun/, 'taishang_laojun'],
      [/沙僧|沙悟净|sha_seng/, 'sha_wujing'], [/白龙马|小白龙|敖烈|bailong_ma/, 'xiaobailong'],
      [/铁扇|tieshan/, 'tieshan'],
      [/猿猴将|yuanhou_jiang/, 'yuanhou_jiang'], [/猿猴兵|yuanhou_bing/, 'yuanhou_bing'], [/猿猴|yuanhou/, 'yuanhou'],
      [/猕猴将|mihou_jiang/, 'mihou_jiang'], [/猕猴兵|mihou_bing/, 'mihou_bing'], [/猕猴|mihou/, 'mihou'],
      [/红鲤|hongliyu/, 'red_carp'], [/黑鱼|heiyu/, 'black_fish'], [/鱼仙|yuxian/, 'fish'],
      [/灵猫|lingmao/, 'spirit_cat'], [/猫妖|cat_demon/, 'cat_demon'],
      [/妖鸡|changwei_yaoji/, 'rooster'], [/沙虫|huangjin_shachong/, 'sandworm'],
      [/紫晶怪|zijingguai/, 'crystal_spirit'], [/石精|石妖|shijing|shiyao/, 'stone_spirit'],
      [/幽魂|youhun/, 'ghost'], [/妖道|yaodao/, 'demon_taoist'], [/坎精|子神|kanjing|zishen/, 'rat'],
      [/蜘蛛|蛛魔|spider/, 'spider'], [/蜈蚣|centipede/, 'centipede'],
      [/巨蝎|青蝎|蝎妖|毒蝎|scorpion/, 'scorpion'], [/巨蜥|蜥蜴|lizard/, 'lizard'],
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
