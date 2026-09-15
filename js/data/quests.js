/**
 * 汉风西游 - 任务系统与钟馗捉鬼
 * 包含西游主线剧情引导、钟馗除妖捉鬼日常、与跑环日常
 */
window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.MAIN_QUESTS = [
  {
    id: 'mq_01',
    title: '序章：灵兽初鸣',
    desc: '在【东海渔村】找到【宠物仙子】，领养属于自己的第一只本命召唤兽。',
    targetType: 'adopt_pet',
    reqCount: 1,
    rewards: { exp: 120, silver: 300, items: [{ id: 'jinchuang_yao', count: 3 }] }
  },
  {
    id: 'mq_02',
    title: '第一章：东海试炼',
    desc: '前往【东海湾】巡逻历练，在战斗中击败任意 3 只野怪。',
    targetType: 'kill_wild',
    mapId: 'donghai_wan',
    reqCount: 3,
    rewards: { exp: 350, silver: 600, items: [{ id: 'eq_wp_wood', count: 1 }] }
  },
  {
    id: 'mq_03',
    title: '第二章：沉船水妖',
    desc: '深入【海底沉船】，向深处的【沉船水妖头领】发起挑战并取胜！',
    targetType: 'defeat_boss',
    bossId: 'boss_chenchuan',
    reqCount: 1,
    rewards: { exp: 800, silver: 1200, items: [{ id: 'jinliu_lu', count: 1 }] }
  },
  {
    id: 'mq_04',
    title: '第三章：初抵长安',
    desc: '穿过江南野外，前往繁华的大唐王都【长安城】，拜见【玄奘法师】。',
    targetType: 'visit_npc',
    npcId: 'npc_xuanzang',
    reqCount: 1,
    rewards: { exp: 1200, silver: 2000, items: [{ id: 'qianghua_shi', count: 3 }] }
  },
  {
    id: 'mq_05',
    title: '第四章：钟馗受命',
    desc: '在长安城找到【钟馗】，领取并完成一次【钟馗捉鬼】日常除妖。',
    targetType: 'complete_ghost',
    reqCount: 1,
    rewards: { exp: 2500, silver: 5000, items: [{ id: 'eq_wp_longquan', count: 1 }] }
  },
  {
    id: 'mq_06',
    title: '第五章：神兵淬火',
    desc: '在长安城李铁匠处，使用强化石将任意一件装备成功强化至 +1 或更高。',
    targetType: 'forge_enhance',
    reqCount: 1,
    rewards: { exp: 3500, silver: 6000, items: [{ id: 'dingxing_shi', count: 2 }, { id: 'book_bishai', count: 1 }] }
  },
  {
    id: 'mq_07',
    title: '第六章：大圣试炼',
    desc: '远赴傲来国【花果山】，拜见【美猴王分身】并完成大圣的试炼！',
    targetType: 'monkey_trial',
    reqCount: 1,
    rewards: { exp: 10000, silver: 20000, items: [{ id: 'eq_wp_lengyue', count: 1 }, { id: 'book_shenyousheng', count: 1 }] }
  }
];

// 钟馗抓鬼鬼怪配置
window.GAME_DATA.GHOST_TYPES = [
  { name: '游荡恶鬼', title: '【吸血恶鬼】', icon: '👻', hpMult: 2.2, atkMult: 1.3, defMult: 1.1, spdMult: 1.0, special: 'lifesteal' },
  { name: '僵尸骷髅', title: '【钢筋铁骨】', icon: '💀', hpMult: 2.8, atkMult: 1.1, defMult: 1.6, spdMult: 0.8, special: 'high_def' },
  { name: '血煞厉鬼', title: '【狂暴输出】', icon: '👺', hpMult: 1.8, atkMult: 1.8, defMult: 0.9, spdMult: 1.3, special: 'berserk' },
  { name: '幽冥鬼仙', title: '【摄魂控场】', icon: '🔮', hpMult: 2.0, atkMult: 1.4, defMult: 1.2, spdMult: 1.4, special: 'magic' }
];

window.GAME_DATA.GHOST_MAPS = ['jiangnan_yewai', 'chenchuan', 'datang_jingwai'];
