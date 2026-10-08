/**
 * 汉风西游 - 左上角雷达小地图系统与主线金色感叹号指引 (MiniMapEngine)
 * 实时等比缩放当前场景地貌，标示玩家坐标、NPC分布与主线金色光柱感叹号指引
 */

class MiniMapEngine {
  constructor() {
    this.pulseTime = 0;
    this.width = 130;
    this.height = 90;
  }

  // 获取当前主线任务目标点 (世界像素坐标与名称)
  getCurrentQuestTarget(mapId, storyPhase, mapData) {
    if (!mapData) return null;

    if (mapId === 'wuzhuangguan') {
      if (storyPhase !== 'liusha_cleared') return null;
      const npc = (window.App2D?.currentMapId === mapId && window.App2D.npcs?.find(n => n.id === 'npc_zhenyuanzi')) ||
        mapData.npcs?.find(n => n.id === 'npc_zhenyuanzi');
      if (!npc) return null;
      const events = window.App2D?.playerData?.storyEvents || {};
      return { npcId: npc.id, x: npc.x, y: npc.y, name: npc.name,
        desc: events.wuzhuang_tree_restored ? '宝树已救活，整理行囊后向镇元大仙领取赠礼' :
          events.wuzhuang_trial_won ? '交手已止，与镇元大仙共商救树' : '与镇元大仙说明毁树之事，承担救树之责' };
    }

    // 🌟 动态感叹号精确附着保证：若当前地图有唯一挂着主线感叹号的 NPC，绝对以其真实像素坐标为准！
    // 彻底根治李靖与感叹号分离的错位 Bug！
    if (window.App2D && window.App2D.currentMapId === mapId && window.App2D.npcs) {
      const activeQuestNpc = window.App2D.npcs.find(n => n.questStatus === 'available');
      if (activeQuestNpc) {
        let qDesc = `与【${activeQuestNpc.name}】对话推进主线`;
        if (mapId === 'tiangong_palace') {
          if (activeQuestNpc.id === 'npc_taibai') {
            qDesc = (storyPhase === 'heaven_tiangong_trial') ? '凌霄宝殿听候玉帝圣旨公审发落' : '先听太白金星交代仙宴值守';
          } else if (activeQuestNpc.id === 'npc_tianpeng') {
            qDesc = '制止天蓬元帅调戏嫦娥仙子';
          } else if (activeQuestNpc.id === 'npc_juanlian') {
            qDesc = '前往凌霄殿前求情力保卷帘大将';
          } else if (activeQuestNpc.id === 'npc_tianbing_scout') {
            qDesc = '向南天门仙官探问花果山战局';
          }
        } else if (mapId === 'chentangguan') {
          if (activeQuestNpc.id === 'npc_li_jing') {
            qDesc = (storyPhase === 'chentang_hooligans_done') ? '回帅府向李靖总兵复命' :
                    (storyPhase === 'chentang_boss_defeated' ? '平定恶霸，回帅府领赏' : '晋见李靖总兵，清剿陈塘混混');
          } else if (activeQuestNpc.id === 'npc_hooligan_boss') {
            qDesc = '东市截击混混头目 (1打3决战)';
          } else if (activeQuestNpc.id === 'npc_guanyin_statue') {
            qDesc = '探查东侧海滨神秘观音雕像';
          } else if (activeQuestNpc.id === 'npc_guanyin_pu_sa') {
            qDesc = '聆听观世音菩萨点化前世宿命';
          }
        }
        return {
          npcId: activeQuestNpc.id,
          x: activeQuestNpc.x,
          y: activeQuestNpc.y,
          name: activeQuestNpc.name,
          desc: qDesc
        };
      }
    }

    // 1. 天宫序章三大因缘事件主线追踪
    if (mapId === 'tiangong_palace' && storyPhase && storyPhase.startsWith('heaven_')) {
      if (storyPhase === 'heaven_prologue') {
        return { x: 9 * 32, y: 13 * 32, name: '太白金星', desc: '先听太白金星交代仙宴值守' };
      }
      if (storyPhase === 'heaven_to_water_pavilion') {
        return { x: 15 * 32, y: 12 * 32, name: '瑶池水阁', desc: '沿御道前往东侧水阁巡视' };
      }
      if (storyPhase === 'heaven_pantao_start') {
        return {
          x: 15 * 32,
          y: 12 * 32,
          name: '天蓬元帅',
          desc: '制止天蓬元帅调戏嫦娥仙子'
        };
      }
      if (storyPhase === 'heaven_to_lingxiao') {
        return { x: 22 * 32, y: 12 * 32, name: '凌霄殿前', desc: '沿东侧御道返回凌霄殿前值守' };
      }
      if (storyPhase === 'heaven_saved_change') {
        return {
          x: 22 * 32,
          y: 12 * 32,
          name: '卷帘大将',
          desc: '前往凌霄殿前求情力保卷帘大将'
        };
      }
      if (storyPhase === 'heaven_saved_juanlian' || storyPhase === 'heaven_huaguoshan') {
        return {
          x: 19 * 32,
          y: 25 * 32,
          name: '南天门下界传送阵',
          desc: '出南天门向南下界，前往东胜神洲·花果山平乱'
        };
      }
      if (storyPhase === 'heaven_final_wukong') {
        return {
          x: 19 * 32,
          y: 8 * 32,
          name: '齐天大圣孙悟空',
          desc: '南天门总决战，与齐天大圣豪迈切磋'
        };
      }
      if (storyPhase === 'heaven_tiangong_trial') {
        return {
          x: 19 * 32,
          y: 8 * 32,
          name: '太白金星 / 玉皇大帝',
          desc: '凌霄宝殿听候玉帝圣旨公审发落'
        };
      }
      return {
        x: 15 * 32,
        y: 12 * 32,
        name: '天蓬元帅',
        desc: '巡视仙宴，解救嫦娥仙子制止醉酒天蓬'
      };
    }

    // 1.1 东胜神洲·花果山主山
    if (mapId === 'huaguoshan') {
      if (storyPhase === 'heaven_saved_juanlian' || storyPhase === 'heaven_huaguoshan') {
        return {
          x: 19 * 32,
          y: 22 * 32,
          name: '天庭前锋营神将',
          desc: '向山麓神将探问花果山战局'
        };
      }
      if (storyPhase === 'heaven_huaguoshan_shuilien') {
        return {
          x: 19 * 32,
          y: 4 * 32,
          name: '水帘洞天飞瀑',
          desc: '穿过飞瀑进入水帘洞探查'
        };
      }
      if (storyPhase === 'heaven_final_wukong') {
        return {
          x: 19 * 32,
          y: 11 * 32,
          name: '齐天大圣孙悟空',
          desc: '迎战反出天庭的齐天大圣！'
        };
      }
    }

    // 1.2 花果山·水帘洞天
    if (mapId === 'huaguoshan_shuilien') {
      if (storyPhase === 'heaven_huaguoshan_shuilien') {
        return {
          x: 19 * 32,
          y: 18 * 32,
          name: '赤毛马猴',
          desc: '与水帘洞守山马猴切磋较量'
        };
      }
      if (storyPhase === 'heaven_huaguoshan_rescue') {
        return {
          x: 20 * 32,
          y: 11 * 32,
          name: '征讨先锋巨灵神',
          desc: '击退滥杀幼猴的先锋巨灵神！'
        };
      }
      if (storyPhase === 'heaven_juling_defeated' || storyPhase === 'heaven_final_wukong') {
        return {
          x: 19 * 32,
          y: 24 * 32,
          name: '洞口传送阵',
          desc: '走出水帘洞，返回花果山迎战大圣'
        };
      }
    }

    // 2. 凡间两界山·刘家村完整主线历程追踪
    if (mapId === 'liujiacun') {
      if (storyPhase === 'liujiacun_start') {
        return {
          x: 12 * 32,
          y: 11 * 32,
          name: '镇山太保刘伯钦',
          desc: '上前与刘伯钦对话求助'
        };
      }
      if (storyPhase === 'liujiacun_find_mushrooms') {
        return {
          x: 12 * 32,
          y: 20 * 32,
          name: '野生青蘑菇',
          desc: '在村中草地上寻找并采摘 2 朵野生青蘑菇'
        };
      }
      if (storyPhase === 'liujiacun_mushrooms_collected') {
        return {
          x: 12 * 32,
          y: 11 * 32,
          name: '镇山太保刘伯钦',
          desc: '向刘伯钦交付新鲜青蘑菇下锅'
        };
      }
      if (storyPhase === 'liujiacun_go_cut_wood' || storyPhase === 'liujiacun_wood_gathering') {
        return {
          x: 6 * 32,
          y: 15 * 32,
          name: '两界山脚枯树精',
          desc: '击倒西侧山脚 4 株枯树精取柴'
        };
      }
      if (storyPhase === 'liujiacun_wood_collected') {
        return {
          x: 12 * 32,
          y: 11 * 32,
          name: '镇山太保刘伯钦',
          desc: '向刘伯钦交付坚韧柴木煮汤疗伤'
        };
      }
      if (storyPhase === 'liujiacun_rat_hunting') {
        return {
          x: 21 * 32,
          y: 9 * 32,
          name: '偷粮硕鼠',
          desc: '在田垄粮仓周围消灭 4 只偷粮硕鼠'
        };
      }
      if (storyPhase === 'liujiacun_rats_cleared') {
        return {
          x: 12 * 32,
          y: 11 * 32,
          name: '镇山太保刘伯钦',
          desc: '向刘伯钦复命除害保粮'
        };
      }
      if (storyPhase === 'liujiacun_go_changan' || storyPhase === 'liujiacun_hunted') {
        return {
          x: 36 * 32,
          y: 14 * 32,
          name: '东门官道传送门',
          desc: '与刘伯钦一同启程前往大唐都城长安'
        };
      }
    }

    // 4. 大唐都城长安城主线目标追踪
    if (mapId === 'changan_city') {
      if (storyPhase === 'liujiacun_go_changan' || storyPhase === 'changan_arrived') {
        return {
          x: 18 * 32,
          y: 19 * 32,
          name: '茶肆阿婆',
          desc: '前往街边古亭茶肆向阿婆打探各方消息'
        };
      }
      if (storyPhase === 'chentang_investigate') {
        return {
          x: 23 * 32,
          y: 33 * 32,
          name: '东南陈塘关官道',
          desc: '由东南门前往东海陈塘关协助李靖总兵'
        };
      }
      if (storyPhase === 'changan_meet_xuanzang') {
        return {
          x: 33 * 32,
          y: 8 * 32,
          name: '玄奘法师 (唐僧)',
          desc: '化生寺拜见玄奘法师共商西行'
        };
      }
      if (storyPhase === 'changan_meet_taizong') {
        return {
          x: 23 * 32,
          y: 5 * 32,
          name: '唐太宗·李世民',
          desc: '金銮殿拜谒大唐太宗皇帝领受通关文牒'
        };
      }
      if (storyPhase === 'changan_farewell') {
        return {
          x: 3 * 32,
          y: 16 * 32,
          name: '刘伯钦 (送行)',
          desc: '城门口与刘伯钦互道珍重，启程两界山'
        };
      }
      return {
        x: 18 * 32,
        y: 19 * 32,
        name: '茶肆阿婆',
        desc: '前往街市向茶肆阿婆打探消息'
      };
    }

    // 5. 五行山 -> 目标：山顶六字大明咒压帖 (仅在到达五行山解救大圣阶段显示)
    if (mapId === 'wuxingshan' && storyPhase === 'wuxingshan_ready') {
      return {
        x: 18 * 32,
        y: 12 * 32,
        name: '六字大明咒金帖',
        desc: '揭下山顶压帖破封救齐天大圣'
      };
    }

    // 6. 蛇盘山·鹰愁涧 -> 目标：西海龙三太子小白龙敖烈 (仅在破封救大圣后的鹰愁收服阶段显示，位于平坦大道上)
    if (mapId === 'yingchoujian' && storyPhase === 'wuxing_freed') {
      return {
        x: 20 * 32,
        y: 12 * 32,
        name: '西海龙三太子小白龙',
        desc: '迎战恶龙收服白龙马'
      };
    }

    // 7. 乌斯藏·高老庄 -> 目标：高太公与云栈洞猪八戒
    if (mapId === 'gaolaozhuang') {
      return {
        x: 18 * 32,
        y: 12 * 32,
        name: '高太公 / 猪八戒',
        desc: '解救翠兰收服天蓬元帅'
      };
    }

    // 8. 八百里·黄风岭 -> 目标：灵吉菩萨与黄风大圣
    if (mapId === 'huangfengling') {
      return {
        x: 12 * 32,
        y: 6 * 32,
        name: '灵吉菩萨 / 黄风大圣',
        desc: '借定风丹降伏三昧神风'
      };
    }

    // 9. 八百里·流沙河 -> 目标：卷帘大将沙和尚
    if (mapId === 'liushaho') {
      return {
        x: 11 * 32,
        y: 7 * 32,
        name: '沙悟净 (卷帘大将)',
        desc: '以九骨骷髅结法船渡河'
      };
    }

    // 11. 陈塘关 -> 目标精准绑定 (李靖、混混、头目、观音雕像、显圣观音)
    if (mapId === 'chentangguan') {
      if (storyPhase === 'chentang_defeat_hooligans') {
        const killCount = (window.App2D && window.App2D.questKills && window.App2D.questKills.chentangHooligans) || 0;
        return {
          x: 480,
          y: 384,
          name: '街头恶霸混混',
          desc: `惩戒街头作恶混混 (${killCount}/4)`
        };
      }
      if (storyPhase === 'chentang_boss_ready') {
        return {
          x: 512,
          y: 384,
          name: '混混头目·雷震彪',
          desc: '东市截击混混头目 (1打3决战)'
        };
      }
      if (storyPhase === 'chentang_statue_investigate') {
        return {
          x: 672,
          y: 384,
          name: '神秘观音雕像',
          desc: '探查东侧海滨神秘观音雕像'
        };
      }
      if (storyPhase === 'donghai_yecha_ready' || storyPhase === 'donghai_dragon_arrived' || storyPhase === 'longgong_visit') {
        return {
          x: 960,
          y: 448,
          name: '东海之滨传送门',
          desc: '顺应海潮，深入东海之滨'
        };
      }
      if (storyPhase === 'chentang_guanyin_revelation') {
        return {
          x: 672,
          y: 384,
          name: '观世音菩萨',
          desc: '聆听观世音菩萨点化前世宿命'
        };
      }
      return {
        x: 224,
        y: 160,
        name: '李靖总兵',
        desc: storyPhase === 'chentang_hooligans_done' ? '回帅府向李靖总兵复命' :
              (storyPhase === 'chentang_boss_defeated' ? '平定恶霸，回帅府领赏' : '晋见李靖总兵，清剿陈塘混混')
      };
    }

    // 12. 东海之滨 -> 目标：巡海夜叉
    if (mapId === 'donghai_coast') {
      return {
        x: 10 * 32,
        y: 9 * 32,
        name: '巡海夜叉',
        desc: '凭避水神诀潜入东海水晶宫'
      };
    }

    // 13. 东海水晶宫 -> 目标：龟丞相珍宝阁
    if (mapId === 'shuijinggong') {
      return {
        x: 10 * 32,
        y: 9 * 32,
        name: '龟丞相 (四海珍宝阁)',
        desc: '选购金柳露与魔兽要诀，进见龙王'
      };
    }

    // 14. 东海龙宫大殿 -> 目标：东海龙王敖广 (定海神珍试炼)
    if (mapId === 'longgong_palace') {
      return {
        x: 12 * 32,
        y: 7 * 32,
        name: '东海龙王敖广',
        desc: '开启【深海试炼·借宝定海神珍】'
      };
    }

    // 15. 浮屠山 -> 目标：乌巢禅师
    if (mapId === 'futushan') {
      return {
        x: 10 * 32,
        y: 8 * 32,
        name: '乌巢禅师',
        desc: '听禅师传授《摩诃般若多心经》'
      };
    }

    // 16. 白虎岭 -> 目标：白骨夫人 (幽冥尸魔)
    if (mapId === 'baihuling' && ['wuzhuang_cleared', 'baihu_first_cleared', 'baihu_second_cleared'].includes(storyPhase)) {
      return {
        x: 608,
        y: 352,
        name: storyPhase === 'wuzhuang_cleared' ? '送斋饭的村姑' :
          storyPhase === 'baihu_first_cleared' ? '寻女的老妪' : '拄杖的老翁',
        desc: storyPhase === 'wuzhuang_cleared' ? '查验山道上的素斋与无影行人' :
          storyPhase === 'baihu_first_cleared' ? '辨认第二重画皮留下的踪迹' : '护住师父，识破第三重画皮'
      };
    }

    // 17. 宝象国 -> 目标：黄袍怪 (波月洞奎木狼) 与百花羞
    if (mapId === 'baoxiangguo') {
      if (storyPhase === 'baihu_cleared') return {
        x: 288, y: 256, name: '宝象国国王', desc: '入王宫听国王讲述百花羞失踪的始末'
      };
      if (storyPhase === 'baoxiang_seek_princess') return {
        x: 480, y: 96, name: '百花羞公主', desc: '寻得公主，问明奎木狼的旧缘与罪行'
      };
      if (storyPhase === 'baoxiang_boss_ready') return {
        x: 928, y: 672, name: '黄袍怪 (奎木狼)', desc: '大破波月洞，护公主重返宝象国'
      };
    }

    // 18. 灵台方寸山 -> 目标：斜月三星洞菩提祖师
    if (mapId === 'fangcunshan') {
      return {
        x: 10 * 32,
        y: 6 * 32,
        name: '菩提祖师',
        desc: '顿悟《大品天仙诀》奥义道果'
      };
    }

    // 19. 南海普陀落伽山 -> 目标：观世音菩萨
    if (mapId === 'luojiashan') {
      return {
        x: 10 * 32,
        y: 6 * 32,
        name: '观世音菩萨',
        desc: '紫竹潮音圣境，沐浴灵泉圆满功德'
      };
    }

    // 20. 平顶山 -> 目标：巡山小钻风 / 银角大王 / 金角大王 / 太上老君
    if (mapId === 'pingdingshan') {
      if (storyPhase === 'baoxiang_cleared') return {
        x: 864, y: 448, name: '巡山小钻风', desc: '智套莲花洞妖王虚实与五大法宝'
      };
      if (storyPhase === 'pingding_scout_cleared') return {
        x: 544, y: 256, name: '银角大王', desc: '大破移山倒海之法，力挫银角大王'
      };
      if (storyPhase === 'pingding_silver_cleared') return {
        x: 672, y: 224, name: '金角大王', desc: '决战莲花洞金角大王，降服二魔'
      };
      if (storyPhase === 'pingding_gold_cleared') return {
        x: 608, y: 224, name: '太上老君', desc: '恭迎道祖收回仙童，受领九转玄都金丹'
      };
    }

    // 21. 苍茫三岭支线伏魔引导
    if (mapId === 'yehu_ling') {
      return {
        x: 608, y: 320, name: '玄风道长', desc: '【支线】苍茫三岭伏魔传，荡平妖狐血狼'
      };
    }
    if (mapId === 'jiaolang_ling') {
      return {
        x: 608, y: 384, name: '阴风血狼', desc: '【支线】清缴峡谷血狼，夺回行商遗物'
      };
    }
    if (mapId === 'heifeng_juebi') {
      return {
        x: 320, y: 448, name: '黑风修罗王', desc: '【支线Boss】决战万妖魔窟霸主'
      };
    }

    return null;
  }

  // 渲染左上角小地图
  render(ctx, mapData, playerChar, storyPhase) {
    if (!mapData || !playerChar) return;

    this.pulseTime += 0.05;

    ctx.save();

    const posX = 10;
    const posY = 10;
    const w = this.width;
    const h = this.height;

    // 1. 小地图半透明紫檀金边底框
    ctx.fillStyle = 'rgba(18, 14, 10, 0.88)';
    ctx.fillRect(posX, posY, w, h);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(posX, posY, w, h);

    // 四角金饰花纹
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(posX, posY, 4, 4);
    ctx.fillRect(posX + w - 4, posY, 4, 4);
    ctx.fillRect(posX, posY + h - 4, 4, 4);
    ctx.fillRect(posX + w - 4, posY + h - 4, 4, 4);

    // 2. 缩放绘制地貌网格
    const mapW = mapData.width;
    const mapH = mapData.height;
    const scaleX = (w - 8) / mapW;
    const scaleY = (h - 22) / mapH;
    const innerX = posX + 4;
    const innerY = posY + 18;

    for (let r = 0; r < mapH; r++) {
      for (let c = 0; c < mapW; c++) {
        const tile = mapData.tiles[r][c];
        let color = '#2c3e50';

        if (tile === 'heaven_floor') color = mapData.id === 'wuzhuangguan' ? '#99a397' : '#ecf0f1';
        else if (tile === 'cloud_void') color = '#0a0d14';
        else if (tile === 'heaven_pillar') color = '#f39c12';
        else if (tile === 'grass') color = window.App2D?.tilemap?.biomes[mapData.id]?.base || '#27ae60';
        else if (tile === 'dirt_path') color = '#795548';
        else if (tile === 'bamboo') color = '#1e824c';
        else if (tile === 'water') color = '#2980b9';
        else if (tile === 'city_wall') color = '#34495e';
        else if (tile === 'mountain_rock') color = '#424242';
        else if (tile === 'wuxing_seal') color = '#ffd700';
        else if (tile === 'demon_cave_wall') color = '#292632';
        else if (tile === 'cave_floor') color = '#857888';
        else if (tile === 'cave_lantern') color = '#e7ba74';

        ctx.fillStyle = color;
        ctx.fillRect(innerX + c * scaleX, innerY + r * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
      }
    }

    // 3. 绘制传送门标记
    if (mapData.portals) {
      ctx.fillStyle = '#3498db';
      mapData.portals.forEach(p => {
        const px = innerX + (p.x / 32) * scaleX;
        const py = innerY + (p.y / 32) * scaleY;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 4. 绘制 NPC 位置 (仅绘制当前剧情阶段可见的NPC)
    if (mapData.npcs) {
      ctx.fillStyle = '#ffffff';
      mapData.npcs.forEach(n => {
        if (window.App2D && typeof window.App2D.isNpcVisibleInStoryPhase === 'function') {
          if (!window.App2D.isNpcVisibleInStoryPhase(n.id, storyPhase, mapData.id)) return;
        }
        const nx = innerX + (n.x / 32) * scaleX;
        const ny = innerY + (n.y / 32) * scaleY;
        ctx.beginPath();
        ctx.arc(nx, ny, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 5. 绘制主线任务目标 (金色呼吸感叹号与光环)
    const questTarget = this.getCurrentQuestTarget(mapData.id, storyPhase, mapData);
    if (questTarget) {
      const qx = innerX + (questTarget.x / 32) * scaleX;
      const qy = innerY + (questTarget.y / 32) * scaleY;

      // 动态脉冲光环
      const pulse = 3 + Math.sin(this.pulseTime * 4) * 2;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(qx, qy, pulse, 0, Math.PI * 2);
      ctx.stroke();

      // 跳动金色感叹号
      ctx.fillStyle = '#ffde59';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      const bounce = Math.sin(this.pulseTime * 5) * 2;
      ctx.fillText('!', qx, qy - 3 + bounce);
    }

    // 6. 绘制玩家自身位置 (绿色高光光斑与朝向箭头)
    const playerPx = innerX + (playerChar.x / 32) * scaleX;
    const playerPy = innerY + (playerChar.y / 32) * scaleY;

    ctx.fillStyle = '#2ecc71';
    ctx.shadowColor = '#2ecc71';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(playerPx, playerPy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 7. 小地图顶部信息标头
    ctx.fillStyle = '#fef0cd';
    ctx.font = 'bold 9px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🗺️ ${mapData.name.split('·')[0]}`, posX + 5, posY + 12);

    ctx.restore();
  }

  // 在大世界场景中渲染主线目标的冲天光柱与大号金色感叹号
  renderWorldQuestBeacon(ctx, camera, mapId, storyPhase, mapData) {
    const questTarget = this.getCurrentQuestTarget(mapId, storyPhase, mapData);
    if (!questTarget) return;

    const screenX = questTarget.x - camera.x;
    const screenY = questTarget.y - camera.y;

    // 如果目标在视口附近
    if (screenX < -100 || screenX > camera.viewportWidth + 100 || screenY < -100 || screenY > camera.viewportHeight + 100) {
      return;
    }

    ctx.save();

    // 1. 地面金色旋转法阵光圈
    const pulse = Math.sin(this.pulseTime * 3);
    const radius = 20 + pulse * 3;

    const grad = ctx.createRadialGradient(screenX, screenY + 10, 2, screenX, screenY + 10, radius + 10);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(243, 156, 18, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 10, radius, radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 垂直冲天的半透明金色接引光柱
    const beamGrad = ctx.createLinearGradient(screenX, screenY + 10, screenX, screenY - 80);
    beamGrad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    beamGrad.addColorStop(0.8, 'rgba(255, 234, 167, 0.2)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(screenX - 8, screenY - 80, 16, 90);

    // 3. 悬浮跳动的醒目金色感叹号与仙道任务指引卷轴 (统一接入 QUEST_BANNER_CONFIG)
    const bannerCfg = (typeof window !== 'undefined' && window.QUEST_BANNER_CONFIG) || {
      FONT_SIZE: 12,
      BOUNCE_SPEED: 2,
      BOUNCE_RANGE: 4,
      EXCLAMATION_SIZE: 22,
      OFFSET_Y: 72
    };

    const bounceSpeed = bannerCfg.BOUNCE_SPEED !== undefined ? bannerCfg.BOUNCE_SPEED : 2;
    const bounceRange = bannerCfg.BOUNCE_RANGE !== undefined ? bannerCfg.BOUNCE_RANGE : 4;
    const offsetY = bannerCfg.OFFSET_Y !== undefined ? bannerCfg.OFFSET_Y : 72;
    const fontSize = bannerCfg.FONT_SIZE !== undefined ? bannerCfg.FONT_SIZE : 12;
    const excSize = bannerCfg.EXCLAMATION_SIZE !== undefined ? bannerCfg.EXCLAMATION_SIZE : 22;

    // 动态起伏优化：锦帛卷轴与下方感叹号形成生动自然的微差谐波浮动 (速度倍增更灵动)
    const bannerWave = Math.sin(this.pulseTime * bounceSpeed) * bounceRange;
    const tagY = screenY - offsetY + bannerWave;

    const excWave = Math.sin(this.pulseTime * bounceSpeed + 0.5) * (bounceRange * 1.25);
    const excY = screenY - (offsetY - 26) + excWave;

    // 主线指引悬浮仙家锦帛卷轴
    const questText = `【主线】${questTarget.desc}`;
    ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`;
    const textW = ctx.measureText(questText).width;

    // 锦帛底衬圆角胶囊 (自适应字号大小)
    const boxH = Math.max(16, Math.round(fontSize + 6));
    const boxRadius = Math.min(8, Math.round(boxH / 2));
    ctx.fillStyle = 'rgba(24, 16, 10, 0.88)';
    ctx.beginPath();
    ctx.roundRect(screenX - textW / 2 - 8, tagY - boxH / 2, textW + 16, boxH, boxRadius);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fce7b2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(questText, screenX, tagY);

    // 锦帛与感叹号之间的仙家灵力金虚线纽带
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 2]);
    ctx.beginPath();
    ctx.moveTo(screenX, tagY + boxH / 2);
    ctx.lineTo(screenX, excY - 14);
    ctx.stroke();
    ctx.setLineDash([]);

    // 锦帛下方的华丽任务灵符金色感叹号
    const excGlow = ctx.createRadialGradient(screenX, excY - 3, 2, screenX, excY - 3, 20);
    excGlow.addColorStop(0, 'rgba(255, 235, 120, 0.85)');
    excGlow.addColorStop(0.5, 'rgba(255, 180, 0, 0.45)');
    excGlow.addColorStop(1, 'rgba(255, 140, 0, 0)');
    ctx.fillStyle = excGlow;
    ctx.beginPath();
    ctx.arc(screenX, excY - 3, 20, 0, Math.PI * 2);
    ctx.fill();

    // 优雅金色倒三角令符徽宝底托 (几何严格对称，宽32高32黄金比例)
    const bHalfW = 16;
    const bTopH = 15;
    const bBottomH = 17;

    ctx.beginPath();
    ctx.moveTo(screenX, excY + bBottomH);
    ctx.lineTo(screenX + bHalfW, excY - bTopH);
    ctx.lineTo(screenX - bHalfW, excY - bTopH);
    ctx.closePath();
    const bGrad = ctx.createLinearGradient(screenX, excY - bTopH, screenX, excY + bBottomH);
    bGrad.addColorStop(0, 'rgba(52, 28, 8, 0.95)');
    bGrad.addColorStop(0.5, 'rgba(25, 12, 4, 0.98)');
    bGrad.addColorStop(1, 'rgba(48, 22, 6, 0.95)');
    ctx.fillStyle = bGrad;
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 内层流光金边 (精致双重边框)
    ctx.beginPath();
    ctx.moveTo(screenX, excY + bBottomH - 4);
    ctx.lineTo(screenX + bHalfW - 3.5, excY - bTopH + 2.5);
    ctx.lineTo(screenX - bHalfW + 3.5, excY - bTopH + 2.5);
    ctx.closePath();
    ctx.strokeStyle = 'rgba(255, 235, 120, 0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 醒目金色感叹号文本 (置于倒三角框内部正中，完美消除顶部溢出与底部空洞)
    const tCenterY = excY + 1.2;
    ctx.font = `900 ${Math.min(18, excSize)}px "Arial Black", "Microsoft YaHei", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#220e02';
    ctx.lineWidth = 3.5;
    ctx.strokeText('！', screenX, tCenterY);

    const tGrad = ctx.createLinearGradient(screenX, tCenterY - 10, screenX, tCenterY + 10);
    tGrad.addColorStop(0, '#ffffff');
    tGrad.addColorStop(0.35, '#fffa65');
    tGrad.addColorStop(1, '#ff9f1a');
    ctx.fillStyle = tGrad;
    ctx.fillText('！', screenX, tCenterY);

    ctx.restore();
  }
}

window.MiniMapEngine = new MiniMapEngine();
