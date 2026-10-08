/**
 * 山海经物种归纳系统与生灵映射 (ShanhaiSpecies Canonical)
 * 严格遵照《西游OL 仙宠总表》：50普通野怪、12散仙、15金仙。
 * 地图野怪按名称与类型映射到标准物种，严禁擅增非规约物种。
 */
(function () {
  const data = window.GAME_DATA;
  if (!data || !data.PETS) return;
  const pets = data.PETS;

  const cleanName = name => String(name || '')
    .replace(/^变异/, '')
    .replace(/\s*[（(].*?[）)]/g, '')
    .replace(/[一二三四五六七八九十0-9]+号/g, '')
    .trim();

  const byName = new Map(Object.values(pets).map(p => [p.name, p.id]));
  const aliases = {
    '混混': 'hooligan_wild',
    '街头混混': 'hooligan_wild',
    '草寇': 'caokou',
    '绿林草寇': 'caokou',
    '树精': 'kushu_jing',
    '百年树精': 'kushu_jing',
    '百年枯树精': 'kushu_jing',
    '枯树精': 'kushu_jing',
    '嗜血树妖': 'shuyao',
    '树妖': 'shuyao',
    '野狼': 'wolf_wild',
    '巡山野狼': 'wolf_wild',
    '山狼': 'shanlang',
    '恶谷山狼': 'shanlang',
    '狼妖': 'langyao',
    '啸月狼妖': 'langyao',
    '虎妖': 'yinke',
    '寅客': 'yinke',
    '寅客（虎妖）': 'yinke',
    '吊睛怪': 'diaojing_guai',
    '狐狸': 'huli',
    '野狐狸': 'huli',
    '狐狸精': 'hulijing',
    '幻化狐狸精': 'hulijing',
    '青蛇': 'xiaohua_she',
    '小花蛇': 'xiaohua_she',
    '盘石小青蛇': 'xiaohua_she',
    '蛇妖': 'sheyao',
    '盘丝蛇妖': 'sheyao',
    '猕猴': 'mihou',
    '巡山小石猴': 'mihou_bing',
    '花果山小猴': 'mihou_bing',
    '猕猴兵': 'mihou_bing',
    '花果山猕猴兵': 'mihou_bing',
    '猕猴将': 'mihou_jiang',
    '花果山猕猴将': 'mihou_jiang',
    '猿猴': 'yuanhou',
    '水帘洞猿猴': 'yuanhou',
    '猿猴兵': 'yuanhou_bing',
    '水帘洞猿猴兵': 'yuanhou_bing',
    '花果山猿猴兵': 'yuanhou_bing',
    '猿猴将': 'yuanhou_jiang',
    '花果山猿猴将': 'yuanhou_jiang',
    '河蚌': 'clam_jing',
    '灵河巨蚌': 'clam_jing',
    '螃蟹': 'crab_jing',
    '浅滩螃蟹': 'crab_jing',
    '巨蟹精': 'crab_jing',
    '龙虾': 'lobster_jing',
    '赤甲龙虾': 'lobster_jing',
    '龙虾精': 'lobster_jing',
    '蚌精': 'bangjing',
    '千年蚌精': 'bangjing',
    '虾兵': 'xia_bing',
    '巡海虾兵': 'xia_bing',
    '蟹将': 'xie_jiang',
    '巡海蟹将': 'xie_jiang',
    '鱼仙': 'yuxian',
    '水妖': 'shuiyao',
    '碧波水妖': 'shuiyao',
    '红鲤鱼': 'hongliyu',
    '黑鱼': 'heiyu',
    '幽魂': 'youhun',
    '孤坟幽魂': 'youhun',
    '道士': 'daoshi',
    '游方道士': 'daoshi',
    '妖道': 'yaodao',
    '毒蝎': 'duxie',
    '铁尾毒蝎': 'duxie',
    '石怪': 'shiguai',
    '顽石怪': 'shiguai',
    '蜘蛛怪': 'zhizhuguai',
    '黑熊怪': 'heixiong_guai_mob',
    '黑风怪熊': 'heixiong_guai_mob',
    '白骨小妖': 'baigu_xiaoyao',
    '花斑蛛': 'huabanzhu',
    '灵猫': 'lingmao',
    '猫妖': 'cat_demon',
    '九命猫妖': 'cat_demon',
    '鼠妖': 'shuyao_rat',
    '坎精': 'kanjing',
    '子神': 'zishen',
    '紫晶怪': 'zijingguai',
    '花狸鼠': 'hualishu',
    '长尾妖鸡': 'changwei_yaoji',
    '黄金沙虫': 'huangjin_shachong',
    '石精': 'shijing',
    '石妖': 'shiyao',
    '大海龟': 'clam_jing',
    '巨蛙': 'shuo_shu',
    '野猪': 'shuo_shu'
  };

  data.SHANHAI_SPECIES_BY_MONSTER = {};

  if (data.MAPS_2D) {
    for (const map of Object.values(data.MAPS_2D)) {
      for (const mob of map.monsters || []) {
        if (mob.isBoss || mob.isGhostTarget) continue;
        const name = cleanName(mob.name);
        let id = (pets[mob.templateId] && mob.templateId) || byName.get(name) || aliases[name] || aliases[mob.name];
        if (!id) {
          // 智能模糊匹配到50种规约普通野怪
          if (/鼠|耗子/.test(name)) id = 'shuo_shu';
          else if (/猴|猿/.test(name)) id = 'mihou';
          else if (/蛇/.test(name)) id = 'xiaohua_she';
          else if (/狼/.test(name)) id = 'wolf_wild';
          else if (/虎/.test(name)) id = 'yinke';
          else if (/狐/.test(name)) id = 'huli';
          else if (/树|木/.test(name)) id = 'kushu_jing';
          else if (/蟹/.test(name)) id = 'crab_jing';
          else if (/虾/.test(name)) id = 'lobster_jing';
          else if (/蚌/.test(name)) id = 'clam_jing';
          else if (/鱼/.test(name)) id = 'hongliyu';
          else if (/石|岩/.test(name)) id = 'shiguai';
          else if (/骨/.test(name)) id = 'baigu_xiaoyao';
          else if (/蛛/.test(name)) id = 'zhizhuguai';
          else if (/猫/.test(name)) id = 'lingmao';
          else id = 'hooligan_wild';
        }
        data.SHANHAI_SPECIES_BY_MONSTER[map.id + ':' + mob.id] = id;
        if (pets[id] && !pets[id].habitat) {
          pets[id].habitat = map.name;
          pets[id].habitatMapId = map.id;
        }
      }
    }
  }

  // 严格同步女性神仙灵宠
  for (const id of ['dianmu', 'change', 'baigu_jing', 'tieshan_gongzhu', 'xiezi_jing']) {
    if (pets[id]) pets[id].gender = 'female';
  }

  data.cleanShanhaiSpeciesName = cleanName;
})();
