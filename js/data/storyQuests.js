/**
 * 汉风西游 - 正统西游主线剧情剧本库 (StoryQuests)
 * 严格按照玩家记忆原汁原味还原：
 * 威灵显赫大将军 -> 大闹天宫暗助大圣 -> 贬落凡尘失忆 -> 双叉岭刘家村刘伯钦 -> 长安拜见玄奘菩萨 -> 五行山揭帖破封救大圣
 */

window.GAME_DATA = window.GAME_DATA || {};

window.GAME_DATA.STORY_DIALOGUES = {
  // === 蟠桃园与御马监剧情与指引 ===
  bimawen_mount_gift: {
    steps: [
      {
        speaker: '弼马温 (孙悟空)',
        speakerTitle: '【御马监主事】',
        speakerIcon: '🐒',
        text: '嘿嘿嘿！威灵大将军！玉帝老儿刚封俺老孙管这御马监，这天厩里的仙驹神骏被俺老孙调理得膘肥体壮、神气活现！'
      },
      {
        speaker: '弼马温 (孙悟空)',
        speakerTitle: '【御马监主事】',
        speakerIcon: '🐒',
        text: '俺老孙平生最重英雄好汉，你瞧上哪匹只管牵去！龙马不仅能腾云驾雾加快脚程，更能护主体魄，大幅增加气血与攻伐战力！',
        options: [
          {
            text: '【挑选一匹心仪的天宫神驹坐骑】',
            action: () => {
              window.App2D.showChooseMountModal();
            }
          }
        ]
      }
    ]
  },

  mount_train_npc: {
    steps: [
      {
        speaker: '御马监监副',
        speakerTitle: '【仙厩典事】',
        speakerIcon: '🐎',
        text: '下官参见将军！天马通灵，只要常以银两仙露训练驯化，坐骑等级便可飞速提升，为将军带来更浑厚的气血生命与攻击力加成！',
        options: [
          {
            text: '【打开坐骑驯化与进阶面板】',
            action: () => {
              window.App2D.openMountModal();
            }
          }
        ]
      }
    ]
  },

  pantao_tudi_talk: {
    steps: [
      {
        speaker: '蟠桃园土地',
        speakerTitle: '【瑶池地仙】',
        speakerIcon: '👴',
        text: '小神参见威灵大将军！这蟠桃胜境中郁郁葱葱，遍植三千年一熟、六千年一熟、九千年一熟的先天蟠桃母树！人吃了白日飞升、与天地齐寿！'
      },
      {
        speaker: '蟠桃园土地',
        speakerTitle: '【瑶池地仙】',
        speakerIcon: '👴',
        text: '少侠请看，园中各处大仙树上皆结有熟透的发光仙桃！少侠只需移步走至仙树跟前，点击即可确认采摘吞服，大增道行！采摘品尝完毕，小神亦可引动遁法送少侠返回刘家村或居住地！',
        options: [
          {
            text: '【🌿 遁法传送：返回两界山·刘家村】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D && window.App2D.storyPhase && window.App2D.storyPhase.startsWith('heaven_')) {
                window.showGameMessage('☁️ 九重天阙仙宴正盛，下界罡风封禁，大将军当在天宫值守，不可私下凡尘！', 'warn', 3500);
                return;
              }
              window.App2D.loadMap('liujiacun', { x: 23 * 32, y: 10 * 32 });
              window.showGameMessage('🌿 土地公念咒引动遁地金光，已将你安全送回刘家村！', 'info');
            }
          },
          {
            text: '【🏠 遁法传送：返回我的永久居住地】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.teleportToResidence();
            }
          },
          {
            text: '【🍑 留步仙园：前去各株仙树前采摘仙桃】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.showGameMessage('🍑 前往园中大仙树下，靠近点击即可确认采摘仙桃！', 'info');
            }
          }
        ]
      }
    ]
  },

  qixiannv_talk: {
    steps: [
      {
        speaker: '红衣仙女',
        speakerTitle: '【王母侍女】',
        speakerIcon: '🧚‍♀️',
        text: '上仙万福！小仙奉王母娘娘法旨，在此采撷成熟仙桃以备蟠桃大宴。'
      },
      {
        speaker: '红衣仙女',
        speakerTitle: '【王母侍女】',
        speakerIcon: '🧚‍♀️',
        text: '仙家只要诚心修行，每日皆能受天道福泽，吃得大仙桃，增寿长生，法力大增！',
        options: [
          {
            text: '【同去采摘上品仙桃】',
            action: () => {
              window.App2D.openPeachModal();
            }
          }
        ]
      }
    ]
  },

  tiangong_guide_talk: {
    steps: [
      {
        speaker: '飞升仙官',
        speakerTitle: '【天界引渡】',
        speakerIcon: '☁️',
        text: '下官奉旨在此设立登仙法阵。少侠若想前往天界【蟠桃胜境】采摘今日仙桃增长万千经验，或去【御马监】驯养神骑，小仙随时可为你开启飞升云阶！',
        options: [
          {
            text: '【前往天宫·蟠桃胜境 (吃桃升级)】',
            action: () => {
              window.App2D.loadMap('tiangong_pantao');
            }
          },
          {
            text: '【前往天宫·御马监 (训练坐骑)】',
            action: () => {
              window.App2D.loadMap('tiangong_yuma');
            }
          }
        ]
      }
    ]
  },

  // === 序章：天宫蟠桃盛会与三大因缘事件 ===
  pantao_intro: {
    steps: [
      {
        speaker: '太白金星',
        speakerTitle: '【天庭老仙】',
        speakerIcon: '👴',
        text: '威灵显赫大将军！今日乃西王母娘娘瑶池蟠桃胜会，三界真仙毕集于九重天阙！'
      },
      {
        speaker: '太白金星',
        speakerTitle: '【天庭老仙】',
        speakerIcon: '👴',
        text: '大将军奉玉帝敕令值守南天门与瑶池仙宴。将军且移步瑶池水阁巡视，莫让宵小之徒惊扰了仙家胜会！'
      }
    ]
  },

  // 1. 因缘事件一：天蓬调戏嫦娥
  tianpeng_change_encounter: {
    steps: [
      {
        speaker: '嫦娥仙子',
        speakerTitle: '【广寒月神】',
        speakerIcon: '🧚‍♀️',
        text: '天蓬元帅请自重！妾身乃广寒仙侍，此乃瑶池仙宴重地，休得借酒无礼拉扯！'
      },
      {
        speaker: '天蓬元帅',
        speakerTitle: '【天河水军统帅】',
        speakerIcon: '🐷',
        text: '嗝……嫦娥妹妹何必这般生分！老猪……不，本帅统领天河八万水军，威名赫赫，配你月宫仙子有何不可？且陪本帅畅饮三百杯！'
      },
      {
        speaker: '威灵大将军 (玩家)',
        speakerTitle: '【天界神将】',
        speakerIcon: '🧙‍♂️',
        text: '天蓬元帅！住手！尔身为天河统帅，竟敢在王母蟠桃胜会借酒逞凶，欺辱广寒仙子，将天规戒律置于何地？！'
      },
      {
        speaker: '天蓬元帅',
        speakerTitle: '【醉眼朦胧】',
        speakerIcon: '🐷',
        text: '好你个威灵大将！敢坏本帅的好事，今日便让你尝尝本帅九齿钉耙的厉害！',
        options: [
          {
            text: '【⚔️ 挺身出击，制伏醉酒天蓬元帅】',
            action: () => {
              if (window.App2D) {
                window.App2D.triggerTianpengBattle();
              }
            }
          }
        ]
      }
    ]
  },

  // 制伏天蓬后：王母降旨贬猪胎
  tianpeng_after_battle: {
    steps: [
      {
        speaker: '王母娘娘法旨',
        speakerTitle: '【天威震怒】',
        speakerIcon: '⚡',
        text: '【王母玉旨】天蓬元帅酗酒失德，调戏嫦娥仙子，秽乱天规！着金甲天将即刻押往斩妖台重责两千神锤，褫夺帅印，贬落凡尘投胎成猪！钦此！'
      },
      {
        speaker: '嫦娥仙子',
        speakerTitle: '【广寒月神】',
        speakerIcon: '🧚‍♀️',
        text: '多谢威灵大将军仗义出手相护！若非将军神力制伏天蓬，奴家今日危矣，大恩永志不忘！凌霄殿前琼浆大宴已启，将军速速前往值守吧。',
        action: () => {
          if (window.App2D) {
            window.App2D.storyPhase = 'heaven_saved_change';
            window.showGameMessage('✨ 【因缘事件一完成】仗义解救嫦娥仙子！请前往凌霄殿前值守。', 'success', 3500);
            window.App2D.refreshMapNpcs();
          }
        }
      }
    ]
  },

  change_talk: {
    steps: [
      {
        speaker: '嫦娥仙子',
        speakerTitle: '【广寒月神】',
        speakerIcon: '🧚‍♀️',
        text: '威灵大将军浩气凛然，小仙铭感五内。愿将军福寿齐天！'
      }
    ]
  },

  // 2. 因缘事件二：卷帘打碎琉璃盏
  juanlian_break_cup: {
    steps: [
      {
        speaker: '碎玉鸣响',
        speakerTitle: '【殿前惊变】',
        speakerIcon: '💥',
        text: '【喀嚓——！】一声清脆巨响，卷帘大将奉酒失手，将一只温润剔透的九曲玉琉璃宝盏跌得粉碎，玉琼四溢！'
      },
      {
        speaker: '卷帘大将',
        speakerTitle: '【御前侍卫】',
        speakerIcon: '🧔',
        text: '陛下饶命！小臣心神恍惚一时失手跌碎御盏，小臣知罪，伏乞天恩赦免！'
      },
      {
        speaker: '玉皇大天尊',
        speakerTitle: '【九五至尊】',
        speakerIcon: '👑',
        text: '大胆卷帘！此乃西王母娘娘特赐镇殿至宝，尔竟在百仙面前打碎！来人，推下斩妖台立刻斩首示众！'
      },
      {
        speaker: '威灵大将军 (玩家)',
        speakerTitle: '【出列力保】',
        speakerIcon: '🧙‍♂️',
        text: '启奏陛下！卷帘大将素日南征北战、侍卫御前忠谨无双，此番实属无心之过！万望陛下念其往昔赤胆忠心，从轻发落，留其一命！'
      },
      {
        speaker: '玉皇大天尊',
        speakerTitle: '【圣意宽宥】',
        speakerIcon: '👑',
        text: '也罢！念威灵大将代为力保求情，免去死罪！着改判神杖八百，贬落凡尘流沙河，每七日命飞剑穿胸三百回以惩天条！'
      },
      {
        speaker: '太白金星',
        speakerTitle: '【天庭老仙】',
        speakerIcon: '👴',
        text: '大将军！出天大的祸事了！那花果山齐天大圣孙悟空因未被请入蟠桃胜会，一怒之下反出天庭，偷吃了老君金丹与仙桃！陛下降旨命李天王、哪吒为帅，请威灵将军速速率部下界围剿东胜神洲花果山！',
        options: [
          {
            text: '【☁️ 奉旨领兵，下界征讨东胜神洲·花果山】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.storyPhase = 'heaven_huaguoshan';
                window.App2D.loadMap('huaguoshan');
                window.showGameMessage('☁️ 大军降临东胜神洲花果山！前方前锋天将正与妖群搏杀！', 'info', 3500);
              }
            }
          }
        ]
      }
    ]
  },

  // 3. 因缘事件三：花果山前戏过渡（主山前哨 -> 水帘洞探查 -> 水帘洞战赤毛马猴 -> 救小猴战巨灵神 -> 回花果山战大圣）
  huaguoshan_arrival: {
    steps: [
      {
        speaker: '天庭前锋营神将',
        speakerTitle: '【前线神将】',
        speakerIcon: '⚔️',
        text: '末将参见威灵显赫大将军！李天王大军正于花果山漫山遍野合围群妖！'
      },
      {
        speaker: '天庭前锋营神将',
        speakerTitle: '【军情紧急】',
        speakerIcon: '⚔️',
        text: '但方才探得有一支凶悍猴妖精锐退守进入瀑布后的【水帘洞天】！李天王传下军令：请大将军速速穿过瀑布进入水帘洞探查虚实，切莫让妖邪暗藏杀机！',
        options: [
          {
            text: '【🌊 领帅令，穿过飞瀑进入水帘洞天探查】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.storyPhase = 'heaven_huaguoshan_shuilien';
                window.App2D.loadMap('huaguoshan_shuilien');
                window.showGameMessage('🌊 穿过轰鸣飞瀑，踏入灵气缭绕的水帘洞天！', 'info', 3500);
              }
            }
          }
        ]
      }
    ]
  },

  chimao_in_shuilien: {
    steps: [
      {
        speaker: '赤毛马猴',
        speakerTitle: '【守山健将】',
        speakerIcon: '🐒',
        text: '站住！何方天将竟敢擅闯俺花果山水帘洞禁地！俺老马乃大圣麾下守山健将，吃俺一拳！',
        options: [
          {
            text: '【⚔️ 亮枪交手，与赤毛马猴切磋一番】',
            action: () => {
              if (window.App2D) {
                window.App2D.triggerChimaoBattle();
              }
            }
          }
        ]
      }
    ]
  },

  chimao_shuilien_after: {
    steps: [
      {
        speaker: '赤毛马猴',
        speakerTitle: '【花果山健将】',
        speakerIcon: '🐒',
        text: '好厉害的金甲枪法……大将军且慢动手！洞府深处出天大祸事了！'
      },
      {
        speaker: '赤毛马猴',
        speakerTitle: '【悲愤恳求】',
        speakerIcon: '🐒',
        text: '那天庭前锋巨灵神趁大圣外出，杀入水帘洞深处，对手无寸铁的幼小猴儿赶尽杀绝！大将军一身正气，求求您快去内洞阻止巨灵神，救救那些孩儿们吧！',
        options: [
          {
            text: '【🔥 岂有此理！速去水帘洞深处阻止巨灵神行凶】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.storyPhase = 'heaven_huaguoshan_rescue';
                window.showGameMessage('🔥 深入水帘洞深处！前方巨灵神正凶相毕露！', 'warn', 3500);
                window.App2D.refreshMapNpcs();
              }
            }
          }
        ]
      }
    ]
  },

  juling_shuilien_battle: {
    steps: [
      {
        speaker: '征讨先锋·巨灵神',
        speakerTitle: '【凶煞天将】',
        speakerIcon: '👹',
        text: '哈哈哈哈！大元帅李天王有令：妖猴抗旨，花果山猴群小怪不论老幼，趁人之危给我赶尽杀绝，统统斩草除根！'
      },
      {
        speaker: '花果山受困小猴',
        speakerTitle: '【惊恐哀啼】',
        speakerIcon: '🐒',
        text: '吱吱！神仙爷爷饶命啊！我们从小在水帘洞吃桃玩耍，从未伤天害理，不要杀我们……大圣爷爷救命啊！'
      },
      {
        speaker: '威灵大将军 (玩家)',
        speakerTitle: '【大义浩然】',
        speakerIcon: '🧙‍♂️',
        text: '住手！巨灵神！降妖除魔乃正天道，尔身为堂堂天将，安能对寸铁不执之弱小幼猴赶尽杀绝？！我威灵大将绝不容尔借天庭之名滥杀无辜！'
      },
      {
        speaker: '征讨先锋·巨灵神',
        speakerTitle: '【暴怒拔斧】',
        speakerIcon: '👹',
        text: '威灵大将！你敢违抗帅令私护妖孽？吃我开山神斧！',
        options: [
          {
            text: '【⚔️ 挺身大战巨灵神，舍身保全花果山猴群】',
            action: () => {
              if (window.App2D) {
                window.App2D.triggerJulingBattle();
              }
            }
          }
        ]
      }
    ]
  },

  huaguo_monkey_talk: {
    steps: [
      {
        speaker: '花果山小猴',
        speakerTitle: '【花果仙眷】',
        speakerIcon: '🐒',
        text: '多谢金甲大将军救命之恩！大将军是天底下最好的神仙！大圣爷爷马上就回来收拾恶天兵啦！'
      }
    ]
  },

  tongbi_talk: {
    steps: [
      {
        speaker: '通臂猿猴',
        speakerTitle: '【水帘洞总管】',
        speakerIcon: '🐒',
        text: '水帘洞天宛若仙境，大将军仗义护我花果山一脉，水帘洞上下万载感念！'
      }
    ]
  },

  // 击败巨灵神后：指引走出水帘洞，返回花果山主山与齐天大圣决战
  juling_defeated_to_huaguoshan: {
    steps: [
      {
        speaker: '小猴欢呼',
        speakerTitle: '【幼猴脱困】',
        speakerIcon: '🐒',
        text: '【巨灵神被大将军神枪击溃败退！受困幼猴尽数获救，欢喜啼鸣感激大将军活命天恩！】'
      },
      {
        speaker: '洞外震天长啸',
        speakerTitle: '【神猴归山】',
        speakerIcon: '💥',
        text: '【轰隆隆——！洞外苍穹震动，齐天大圣孙悟空一声震天怒吼回响整座东胜神洲！天兵号角齐鸣！】'
      },
      {
        speaker: '传令天兵',
        speakerTitle: '【天将飞报】',
        speakerIcon: '⚡',
        text: '威灵大将！齐天大圣已杀回花果山主峰！李天王传法旨：请大将速速走出水帘洞，返回花果山主山与哪吒、雷公结阵合围！',
        options: [
          {
            text: '【⛰️ 走出水帘洞，返回花果山主山迎战大圣】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.storyPhase = 'heaven_final_wukong';
                window.App2D.loadMap('huaguoshan');
                window.showGameMessage('⛰️ 返回花果山主山！金箍棒神芒直冲九霄！', 'info', 3500);
              }
            }
          }
        ]
      }
    ]
  },

  // 花果山主山：与齐天大圣决战（大圣神威极境 Lv.99 一棒秒杀天将）
  wukong_huaguoshan_havoc: {
    steps: [
      {
        speaker: '齐天大圣孙悟空',
        speakerTitle: '【满怀敬重】',
        speakerIcon: '🐒',
        text: '威灵大将军！俺老孙适才在云端全看在眼里！天庭那帮脓包赶尽杀绝，唯独你金甲大将竟肯为了我花果山无辜孩儿拔枪大战巨灵神！'
      },
      {
        speaker: '齐天大圣孙悟空',
        speakerTitle: '【豪义万丈】',
        speakerIcon: '🐒',
        text: '俺老孙平生最重英雄好汉！这份天大恩义，俺老孙记在心坎上了！看在大将军大义面上，此番合围，俺老孙最后才出棒迎你！来战吧！'
      },
      {
        speaker: '托塔李天王',
        speakerTitle: '【天兵压境】',
        speakerIcon: '👑',
        text: '四神天阵起！哪吒、雷公、威灵大将，随本天王全力合围拿下反天妖猴！',
        options: [
          {
            text: '【⚔️ 结成四天将大阵，在花果山决战齐天大圣】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.triggerWukongHavocBattle();
              }
            }
          }
        ]
      }
    ]
  },

  // 决战大圣战败后：二郎神杨戬降临花果山擒圣，随后大圣输了押回天宫
  yangjian_capture_and_banishment: {
    steps: [
      {
        speaker: '齐天大圣孙悟空',
        speakerTitle: '【神威极境】',
        speakerIcon: '🐒',
        text: '【金箍棒神威惊天动地，法天象地千钧棒一挥横扫！李天王、哪吒、雷公与威灵大将被大圣恐怖神力一击击溃倒地，四天将大阵未能胜过大圣！】'
      },
      {
        speaker: '二郎真君杨戬',
        speakerTitle: '【昭惠显圣二郎真君】',
        speakerIcon: '👁️',
        text: '泼猴休得猖狂！清源妙道二郎真君杨戬奉旨降临花果山！哮天神犬，去！'
      },
      {
        speaker: '花果山二郎擒圣',
        speakerTitle: '【杨戬大胜生擒大圣】',
        speakerIcon: '⚡',
        text: '【二郎神额间天眼迸发万道金芒，哮天神犬疾如雷霆扑咬，与大圣在花果山各展七十二变大战天昏地暗！杨戬与哮天犬终胜出战斗，生擒孙悟空！】'
      },
      {
        speaker: '托塔李天王',
        speakerTitle: '【押赴天庭】',
        speakerIcon: '👑',
        text: '杨真君神威无双！天兵听令，即刻将反天妖猴锁拿，押解返回天宫凌霄宝殿，听候玉帝圣旨发落！',
        options: [
          {
            text: '【☁️ 随天兵凯旋，押解齐天大圣返回天宫凌霄宝殿】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.storyPhase = 'heaven_tiangong_trial';
                window.App2D.loadMap('tiangong_palace');
                window.showGameMessage('☁️ 大军凯旋回朝！凌霄殿前百官伏阶听旨！', 'info', 3500);
                setTimeout(() => {
                  if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.tiangong_banishment_scene) {
                    window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.tiangong_banishment_scene);
                  }
                }, 500);
              }
            }
          }
        ]
      }
    ]
  },

  // 回到天宫：玉帝升殿发落四人因果贬落凡间
  tiangong_banishment_scene: {
    steps: [
      {
        speaker: '玉皇大天尊圣旨',
        speakerTitle: '【发落四人因果】',
        speakerIcon: '👑',
        text: '【九五至尊神旨】孙悟空大闹天宫，押往斩妖台，着如来佛祖镇压于【两界山·五行山】下；天蓬元帅调戏嫦娥，贬落凡尘投胎猪妖，盘踞于【乌斯藏·高老庄】；卷帘大将碎玉琉璃盏，贬落【八百里·流沙河】受飞剑之苦！'
      },
      {
        speaker: '天庭宣旨金甲天神',
        speakerTitle: '【天威浩荡】',
        speakerIcon: '⚡',
        text: '而威灵显赫大将！抗旨违逆帅令击退前锋巨灵神、私自包庇花果山妖群！着即剥夺威灵大将金甲战袍与通天神力，清空宿世记忆，重重贬落凡尘【双叉岭·刘家村】受苦轮回！钦此！'
      },
      {
        speaker: '天道神雷',
        speakerTitle: '【轰然巨响】',
        speakerIcon: '💥',
        text: '【九霄惊雷撕裂苍穹！你的神力被生生抽离，眼前陷入无尽黑暗，一同坠入凡尘……】',
        options: [
          {
            text: '【⚡ 贬落凡尘，坠入无尽深渊……】',
            action: () => {
              if (window.App2D) {
                window.App2D.executeBanishment();
              }
            }
          }
        ],
        action: () => {
          if (window.App2D) {
            window.App2D.executeBanishment();
          }
        }
      }
    ],
    onComplete: () => {
      if (window.App2D) {
        window.App2D.executeBanishment();
      }
    }
  },

  // === 第一章：凡间刘家村（蘑菇生火、五行山砍柴、除硕鼠、同赴长安） ===
  liuboqin_talk: {
    steps: [
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '喂！这位壮士，快醒醒！你怎生一身单薄布衣倒在双叉岭山涧旁？'
      },
      {
        speaker: '失忆玩家',
        speakerTitle: '【茫然不知】',
        speakerIcon: '🧙‍♂️',
        text: '我……我是谁？我胸口仿佛被神雷击碎，过往前世之事竟一丝一毫都记不得了……'
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '定是遭了猛兽或强人洗劫！在下刘伯钦，以打猎为生。看你虚弱饥寒，我家中正要开火做饭，但少些菜肴下锅。'
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '刘家村草地上正长着不少野蕈，烦请少侠在村中草地上采摘 2 朵【野生青蘑菇】回来，我好生火做饭为你接风暖身！这把短剑与皮靴你先拿去防身！',
        action: () => {
          window.App2D.grantStarterItems();
          window.App2D.storyPhase = 'liujiacun_find_mushrooms';
          window.showGameMessage('🍄 请在刘家村草地上寻找并拾取 2 朵【野生青蘑菇】！', 'info', 4000);
          if (window.App2D.showChapterBanner) {
            window.App2D.showChapterBanner('第一回 · 梦断九霄', '谪仙落两界，山野逢太保', '西游序章');
          }
          window.App2D.refreshMapNpcs();
        }
      }
    ]
  },

  pickup_mushroom: {
    steps: [
      {
        speaker: '采摘野蕈',
        speakerTitle: '【山野珍馐】',
        speakerIcon: '🍄',
        text: '【地面草丛中生长着一丛鲜嫩欲滴的野生青蘑菇，散发着诱人菌香。是否将其采摘入囊？】',
        options: [
          {
            text: '【🍄 采摘这朵野生青蘑菇】',
            action: () => {
              if (window.App2D) {
                window.App2D.collectMushroom();
              }
            }
          }
        ]
      }
    ]
  },

  liuboqin_mushroom_done: {
    steps: [
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '哈哈！少侠好利落的身手！这 2 朵青蘑菇肥美鲜嫩，正是做羹汤的上等好料！'
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【缺少柴火】',
        speakerIcon: '🏹',
        text: '只是不巧，家中灶台下的干柴刚好用尽。西边五行山脚下，有许多成了精的枯树精拦路。少侠且与我同去五行山，伐倒 4 株【百年枯树精】，收集坚韧柴木回来生火！',
        action: () => {
          window.App2D.storyPhase = 'liujiacun_go_cut_wood';
          window.showGameMessage('🪓 前往两界山·五行山脚下，击败 4 株百年枯树精收集坚韧柴木！', 'info', 4000);
          window.App2D.refreshMapNpcs();
        }
      }
    ]
  },

  liuboqin_wood_done: {
    steps: [
      {
        speaker: '刘伯钦',
        speakerTitle: '【生火做饭】',
        speakerIcon: '🏹',
        text: '太好了！4 捆坚韧柴木带回来了！火旺汤滚，香菇野味浓香扑鼻，少侠快快请进屋趁热饱餐一顿！'
      },
      {
        speaker: '饱餐一顿',
        speakerTitle: '【精力充沛】',
        speakerIcon: '🍲',
        text: '【吃下一大碗热气腾腾的野山蕈汤，周身暖流涌动，伤痛尽去，气血与法力全满！获得经验 +300！】',
        action: () => {
          window.App2D.playerData.gainExp(300);
          window.App2D.playerData.hp = window.App2D.playerData.maxHp;
          window.App2D.playerData.mp = window.App2D.playerData.maxMp;
          window.App2D.updatePlayerHud();
        }
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【粮仓鼠患】',
        speakerIcon: '🏹',
        text: '实不相瞒，最近村中粮仓周围出了不少成精的硕鼠，四处偷啃庄稼谷物，祸害乡邻！少侠若已恢复气力，可否帮村里除灭 4 只【偷粮硕鼠】？',
        action: () => {
          window.App2D.storyPhase = 'liujiacun_rat_hunting';
          window.showGameMessage('🐀 请在刘家村田垄粮仓周围，消灭 4 只偷粮硕鼠除害安民！', 'warn', 4000);
          window.App2D.refreshMapNpcs();
        }
      }
    ]
  },

  liuboqin_rats_done: {
    steps: [
      {
        speaker: '刘伯钦',
        speakerTitle: '【除害大吉】',
        speakerIcon: '🏹',
        text: '痛快！少侠果然武艺超群，4 只祸害庄稼的硕鼠被你一网打尽，村中老少皆感激不尽！'
      },
      {
        speaker: '除害犒赏',
        speakerTitle: '【丰厚酬谢】',
        speakerIcon: '💰',
        text: '【刘家村乡亲酬谢少侠义举！获得经验 +500、银两 +300两！】',
        action: () => {
          window.App2D.playerData.gainExp(500);
          window.App2D.playerData.silver += 300;
          window.App2D.updatePlayerHud();
          window.Sound.playSuccess();
        }
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【同赴长安】',
        speakerIcon: '🏹',
        text: '听闻向东百里的大唐王都【长安城】近来热闹非凡，当朝圣僧玄奘法师正开坛讲法，集市百戏盛会游人如织。在下正要送山货入京，少侠若想探寻身世，你我正好一同前往长安城！',
        action: () => {
          window.App2D.storyPhase = 'liujiacun_go_changan';
          window.showGameMessage('🏮 东门官道已开！与刘伯钦一同前往大唐王都·长安城！', 'success', 4000);
          window.App2D.refreshMapNpcs();
        }
      }
    ]
  },

  liutaigong_talk: {
    steps: [
      {
        speaker: '刘太公',
        speakerTitle: '【刘家村宿老】',
        speakerIcon: '👴',
        text: '年轻人，向西过了两界山，便是塞外番邦了。那两界山峰峦如五指插天，相传五百年前天降神山镇压了只神猴呢！'
      }
    ]
  },

  // === 第二章：大唐长安城与陈塘关海乱 ===
  changan_tea_news: {
    steps: [
      {
        speaker: '茶肆阿婆',
        speakerTitle: '【市井百晓】',
        speakerIcon: '🍵',
        text: '客官请坐！尝尝老身刚沏的雨前香茗！客官也是来长安瞻仰玄奘圣僧开坛讲法的吧？'
      },
      {
        speaker: '茶肆阿婆',
        speakerTitle: '【东海风波】',
        speakerIcon: '🌊',
        text: '不过听说东南海疆【陈塘关】近来可不太平！东海深处妖气滚滚，海妖夜叉阻绝航路，渔民死伤惨重，贡品海鲜更是进不得京！李总兵正张贴榜文悬赏勇士前往陈塘关除妖呢！',
        action: () => {
          window.App2D.storyPhase = 'chentang_investigate';
          window.showGameMessage('🌊 探得东海陈塘关海妖作祟！请由长安东南门前往【陈塘关】！', 'info', 4000);
          window.App2D.refreshMapNpcs();
        }
      }
    ]
  },

  // 1. 陈塘关初见李靖：委托清剿 4 名作恶混混
  chentang_lijing_talk: {
    steps: [
      {
        speaker: '李靖总兵',
        speakerTitle: '【陈塘总兵】',
        speakerIcon: '👑',
        text: '壮士远道而来，本帅有礼了！实不相瞒，近日陈塘关街市多有恶霸地痞纠集作恶，混混猖獗，欺凌商贾百姓，扰乱东南海疆安宁！'
      },
      {
        speaker: '李靖总兵',
        speakerTitle: '【陈塘总兵】',
        speakerIcon: '👑',
        text: '本帅坐镇总兵府守备要塞，兵力吃紧。观壮士气宇轩昂、武艺高强，可否替本帅走一趟关内街头，教训惩戒 4 名作恶混混，煞煞这帮歹徒的嚣张气焰？',
        options: [
          {
            text: '【🥋 义不容辞，前往街头惩戒4名作恶混混！】',
            action: () => {
              if (window.App2D) {
                window.App2D.storyPhase = 'chentang_defeat_hooligans';
                if (!window.App2D.questKills) window.App2D.questKills = {};
                window.App2D.questKills.chentangHooligans = 0;
                window.showGameMessage('🥋 接下总兵军令！前往陈塘关街市制伏 4 名作恶混混 (0/4)！', 'warn', 4000);
                window.App2D.refreshMapNpcs();
              }
            }
          }
        ]
      }
    ]
  },

  // 2. 击败 4 名混混后复命：李靖告知混混头目要来报复
  chentang_lijing_hooligans_done: {
    steps: [
      {
        speaker: '李靖总兵',
        speakerTitle: '【大喜过望】',
        speakerIcon: '👑',
        text: '哈哈！打得痛快！探子来报，关内百姓对壮士交口称赞，那帮地痞被打得抱头鼠窜！壮士果然身手不凡！'
      },
      {
        speaker: '前哨校尉',
        speakerTitle: '【疾步来报】',
        speakerIcon: '🛡️',
        text: '报——！总兵大人，城东码头路口突然跳出一个【混混头目·雷震彪】，正纠集了混混精锐随从，扬言要替被教训的弟兄报仇，直冲总兵府杀来了！'
      },
      {
        speaker: '李靖总兵',
        speakerTitle: '【怒拍帅案】',
        speakerIcon: '👑',
        text: '放肆！这帮贼首好大的狗胆！壮士，那雷震彪纠集恶徒随从，来者不善。还请壮士即刻前往陈塘关东市截住贼寇，将其一网打尽！',
        options: [
          {
            text: '【⚔️ 截击贼首！前往东市迎战混混头目！】',
            action: () => {
              if (window.App2D) {
                window.App2D.storyPhase = 'chentang_boss_ready';
                window.showGameMessage('🔥 混混头目雷震彪已现身城东！速速前去将其铲除！', 'warn', 4500);
                window.App2D.refreshMapNpcs();
              }
            }
          }
        ]
      }
    ]
  },

  // 3. 混混头目雷震彪对话：叫嚣报复，触发 1 打 3 战斗
  chentang_hooligan_boss_talk: {
    steps: [
      {
        speaker: '混混头目·雷震彪',
        speakerTitle: '【横肉满面】',
        speakerIcon: '🥋',
        text: '呔！你这外乡人好大的胆子，就是你打伤了我雷震彪手下的弟兄？！也不打听打听陈塘关这一片谁说了算！'
      },
      {
        speaker: '混混头目·雷震彪',
        speakerTitle: '【挥棒叫嚣】',
        speakerIcon: '🥋',
        text: '小的们，抄家伙一起上！今天就让这爱管闲事的家伙横着滚出陈塘关！',
        options: [
          {
            text: '【⚔️ 挺身出战！以一敌三决战混混头目与随从！】',
            action: () => {
              if (window.App2D) {
                window.App2D.triggerHooliganBossBattle();
              }
            }
          }
        ]
      }
    ]
  },

  // 4. 战胜混混头目后领赏：李靖给奖励，并提及神秘观音雕像无法对话
  chentang_lijing_reward: {
    steps: [
      {
        speaker: '李靖总兵',
        speakerTitle: '【由衷赞叹】',
        speakerIcon: '👑',
        text: '好！壮士以一敌三，不仅将那猖狂头目彻底制伏，更将贼众彻底荡平，当真神勇盖世！关内商贾无不欢欣鼓舞！'
      },
      {
        speaker: '李靖总兵',
        speakerTitle: '【重赏勇将】',
        speakerIcon: '👑',
        text: '李某身为总兵，言出必行！来人，奉上【纹银五千两】与【修真灵元 (2500 EXP)】，请壮士笑纳！'
      },
      {
        speaker: '李靖总兵',
        speakerTitle: '【奇案告知】',
        speakerIcon: '👑',
        text: '另外，本帅心中尚有一桩悬案：近日陈塘关东侧海滨突现一尊神秘的【观音雕像】，隐有佛光流转。但本帅手下多番查探，雕像神息内敛、双眸微阖，任凭如何呼唤皆无法对话回应。壮士身怀非凡仙道灵根，不妨前往东侧海滨圣台一探究竟！',
        options: [
          {
            text: '【🪷 领受厚赏，前往东侧海滨探查观音雕像】',
            action: () => {
              if (window.App2D) {
                window.App2D.playerData.silver = (window.App2D.playerData.silver || 0) + 5000;
                window.App2D.playerData.gainExp(2500);
                window.App2D.updatePlayerHud();
                window.App2D.storyPhase = 'chentang_statue_investigate';
                if (window.Sound) window.Sound.playSuccess();
                window.showGameMessage('🎁 获得李靖总兵赏赐：银两+5000两、修为+2500！前往东侧海滨探查！', 'success', 5000);
                window.App2D.refreshMapNpcs();
              }
            }
          }
        ]
      }
    ]
  },

  // 5. 东侧海滨观音雕像交互：雕像无法言语对话，海潮涌动，指引往东海探查
  chentang_guanyin_statue_talk: {
    steps: [
      {
        speaker: '神秘观音雕像',
        speakerTitle: '【宝相庄严】',
        speakerIcon: '🪨',
        text: '【这是一尊汉白玉与青石精心雕琢的观音石雕，隐隐泛着青莲佛光。然而雕像双眸微阖，神息深敛，无论你如何躬身呼唤，雕像均寂然无声，无法言语对话回应……】'
      },
      {
        speaker: '心有所悟',
        speakerTitle: '【海潮感应】',
        speakerIcon: '🌊',
        text: '【正当你凝神端详之际，忽闻东侧海浪如惊雷翻滚，滔天狂澜正汹涌向东海之滨深处翻卷！冥冥中仿佛有一种机缘在召唤你，若要唤醒此雕像，不妨顺着东侧传送门深入【东海之滨】探查！】',
        options: [
          {
            text: '【🌊 顺应海潮异动，前往东海之滨深入探查！】',
            action: () => {
              if (window.App2D) {
                window.App2D.storyPhase = 'donghai_yecha_ready';
                window.showGameMessage('🔱 海潮翻卷异动！穿过东侧传送门前往【东海之滨】！', 'warn', 4500);
                window.App2D.refreshMapNpcs();
              }
            }
          }
        ]
      }
    ]
  },

  // 6. 陈塘关显圣后随侍在旁的东海龙王对话
  chentang_aoguang_talk: {
    steps: [
      {
        speaker: '东海龙王敖广',
        speakerTitle: '【恭敬侍立】',
        speakerIcon: '🐉',
        text: '大将军！菩萨亲临点化，实乃大将军无上造化！老龙在东海恭候大将军西行功德圆满，早日重归天阙大放光彩！'
      }
    ]
  },

  fisherman_talk: {
    steps: [
      {
        speaker: '海滨老渔翁',
        speakerTitle: '【东海老渔】',
        speakerIcon: '🎣',
        text: '那东海之滨的夜叉凶神恶煞，手提钢叉驱使巨蟹虾兵，少侠去时千万要小心啊！'
      }
    ]
  },

  // 东海之滨：巡海夜叉大战
  donghai_yecha_battle: {
    steps: [
      {
        speaker: '巡海夜叉·李艮',
        speakerTitle: '【东海凶煞】',
        speakerIcon: '🔱',
        text: '哇呀呀！哪来的凡夫俗子，竟敢擅闯东海天险重地！今日便教你尝尝你夜叉爷爷的三股托天叉！'
      },
      {
        speaker: '威灵大将 (玩家)',
        speakerTitle: '【浩然正气】',
        speakerIcon: '🧙‍♂️',
        text: '恶夜叉休得猖狂！残害无辜渔民、掀浪阻绝海疆，今日定不饶你！',
        options: [
          {
            text: '【⚔️ 挺身出击，大战东海巡海夜叉李艮！】',
            action: () => {
              if (window.App2D) {
                window.App2D.triggerYechaBattle();
              }
            }
          }
        ]
      }
    ]
  },

  // 击败夜叉后：东海龙王敖广引万顷波涛赶来赔罪，引往龙宫挑选神装
  donghai_dragon_apology: {
    steps: [
      {
        speaker: '巡海夜叉',
        speakerTitle: '【跪地求饶】',
        speakerIcon: '🔱',
        text: '【夜叉被大将打得丢盔弃甲，钢叉寸断，连滚带爬瘫倒在海水里惨叫求饶！】'
      },
      {
        speaker: '狂浪奔涌',
        speakerTitle: '【龙王现身】',
        speakerIcon: '🌊',
        text: '【海面波涛轰然向两旁分开，东海龙王敖广身披龙袍踏水疾驰而至，定睛一看大惊失色！】'
      },
      {
        speaker: '东海龙王敖广',
        speakerTitle: '【惊骇赔罪】',
        speakerIcon: '🐉',
        text: '哎呀呀！大水冲了龙王庙！犬奴有眼无珠，竟没认出您是当年在天庭威名赫赫的【威灵显赫大将军】！'
      },
      {
        speaker: '东海龙王敖广',
        speakerTitle: '【诚惶诚恐】',
        speakerIcon: '🐉',
        text: '昔日将军在南天门威震三界，老龙深为敬佩！今日夜叉冲撞尊驾，是老龙治下不严！快请将军移步东海龙宫，老龙已开启龙宫宝库，特备一套初级龙神套装，任将军随意穿戴挑选，权当老龙为大将赔罪接风！',
        options: [
          {
            text: '【🐉 随龙王移步东海龙宫大殿，挑选神装】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.storyPhase = 'longgong_visit';
                window.App2D.loadMap('longgong_palace');
                window.showGameMessage('🐉 步入水晶珊瑚雕砌的东海龙宫大殿！', 'success', 3500);
              }
            }
          }
        ]
      }
    ]
  },

  // 东海龙宫大殿：赠送一套初级龙宫神装
  longgong_receive_armor: {
    steps: [
      {
        speaker: '东海龙王敖广',
        speakerTitle: '【龙宫宝库】',
        speakerIcon: '🐉',
        text: '将军请看！这是老龙命水晶宫巧匠以深海蛟龙蜕鳞、定海玄铁精淬而成的整套【初级龙神战装】！'
      },
      {
        speaker: '龙王奉宝',
        speakerTitle: '【龙神套装赠大将】',
        speakerIcon: '🎁',
        text: '【东海龙王敖广奉上：覆海点钢枪、龙鳞轻钢甲、碧水定海盔、踏浪穿云靴、龙珠凝霜佩一套！战力大增，神威初现！】',
        options: [
          {
            text: '【💎 欣然收下整套龙神装备并即刻装备】',
            action: () => {
              if (window.App2D) {
                window.App2D.grantLonggongArmorSet();
              }
            }
          }
        ]
      },
      {
        speaker: '东海龙王敖广',
        speakerTitle: '【躬身相送】',
        speakerIcon: '🐉',
        text: '宝甲赠英雄！将军如今神装在身，真乃威风凛凛！老龙这便送将军返回陈塘关海滨！',
        action: () => {
          if (window.Dialogue) window.Dialogue.close();
          if (window.App2D) {
            window.App2D.storyPhase = 'chentang_guanyin_revelation';
            window.App2D.loadMap('chentangguan', { x: 576, y: 384 });
            window.showGameMessage('☁️ 返回陈塘关！天际祥云缭绕，仙乐阵阵！', 'info', 3500);
            setTimeout(() => {
              if (window.Dialogue && window.GAME_DATA.STORY_DIALOGUES.chentang_guanyin_revelation) {
                window.Dialogue.start(window.GAME_DATA.STORY_DIALOGUES.chentang_guanyin_revelation);
              }
            }, 600);
          }
        }
      }
    ]
  },

  // 陈塘关：观音菩萨显圣点化前世因果与西行宿命（东海龙王恭侍在侧）
  chentang_guanyin_revelation: {
    steps: [
      {
        speaker: '东海龙王敖广',
        speakerTitle: '【恭立侍侧】',
        speakerIcon: '🐉',
        text: '大将军！方才天际佛光大盛，老龙见大慈大悲观世音菩萨法驾降临陈塘关，特随菩萨一同前来！老龙昔日只敬佩大将军三界神威，今日随菩萨亲临，方知大将军当年舍生取义的大仁大勇！'
      },
      {
        speaker: '大慈大悲观世音菩萨',
        speakerTitle: '【佛光显圣】',
        speakerIcon: '🪷',
        text: '威灵显赫大将军，别来无恙乎？'
      },
      {
        speaker: '失忆行者',
        speakerTitle: '【心神巨震】',
        speakerIcon: '🧙‍♂️',
        text: '菩萨！龙王陛下！您二位……认得我？我脑中一片混沌，我究竟是何来历？'
      },
      {
        speaker: '大慈大悲观世音菩萨',
        speakerTitle: '【前世因果】',
        speakerIcon: '🪷',
        text: '你本是九霄天庭威灵显赫大将，蟠桃胜会力救嫦娥、殿前出列保全卷帘性命，更在花果山以身挡斧抗旨救下无数幼小猴群。你虽被削去神力贬落凡尘，但那份浩然仁义，早已惊动西方佛老。'
      },
      {
        speaker: '大慈大悲观世音菩萨',
        speakerTitle: '【指引西行】',
        speakerIcon: '🪷',
        text: '如今南赡部洲多贪多杀，大唐长安城中，金蝉子转世为【玄奘法师】，正承唐天子圣旨欲往西天求取大乘真经。你具宿世仁勇，正当为西行护法真灵！速回长安城拜见玄奘法师与大唐天子，一路护送唐僧西天取经，解救苍生，功德圆满之日便是你重返天阙之期！',
        options: [
          {
            text: '【🙏 谨遵菩萨法旨！启程返回长安城，护送唐僧西行！】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.storyPhase = 'changan_meet_xuanzang';
                window.showGameMessage('✨ 【观音点化】明悟前世宿命！速回长安城拜见玄奘法师与唐天子！', 'success', 5000);
                window.App2D.refreshMapNpcs();
              }
            }
          }
        ]
      }
    ]
  },

  // 长安城：拜见玄奘法师
  xuanzang_talk: {
    steps: [
      {
        speaker: '玄奘法师',
        speakerTitle: '【金山寺高僧】',
        speakerIcon: '🧘‍♂️',
        text: '阿弥陀佛！贫僧适才忽见紫气东来，施主眉宇间浩气冲霄、龙神宝甲护体，菩萨曾托梦于贫僧，施主便是贫僧西行取经命中注定的护法贵人！'
      },
      {
        speaker: '玄奘法师',
        speakerTitle: '【金蝉发愿】',
        speakerIcon: '🧘‍♂️',
        text: '大唐圣天子李世民陛下正在金銮宝殿高阶御前，欲为我等赐封御弟法号并颁发通关文牒！施主请随贫僧移步殿前，觐见太宗陛下！',
        action: () => {
          window.App2D.storyPhase = 'changan_meet_taizong';
          window.showGameMessage('👑 请登上长安城顶部金銮宝殿，觐见唐太宗李世民陛下！', 'info', 4000);
          window.App2D.refreshMapNpcs();
        }
      }
    ]
  },

  // 长安金銮殿：唐太宗李世民殿前赐宝与通关文牒
  tangtaizong_talk: {
    steps: [
      {
        speaker: '唐太宗·李世民',
        speakerTitle: '【大唐圣天子】',
        speakerIcon: '👑',
        text: '朕的大唐好男儿！朕已听玄奘御弟与观音菩萨赞叹将军英烈大义！'
      },
      {
        speaker: '唐太宗·李世民',
        speakerTitle: '【御赐文牒】',
        speakerIcon: '📜',
        text: '西行十万八千里路途艰险、妖魔遍野，朕特赐下【大唐西域通关文牒】与【紫金钵盂】，更将御弟玄奘托付于将军！愿将军一路披荆斩棘，早日求取大乘真经造福苍生！',
        options: [
          {
            text: '【📜 领旨谢恩，誓保玄奘西天求得真经！】',
            action: () => {
              window.App2D.inventory.addItem('feixing_fu', 5);
              window.App2D.inventory.addItem('jiuzhuan_dan', 3);
              window.App2D.playerData.gainExp(1000);
              window.App2D.playerData.silver += 500;
              window.App2D.storyPhase = 'changan_farewell';
              window.Sound.playSuccess();
              window.showGameMessage('📜 获得太宗御赐通关文牒、飞行符*5、九转金丹*3、经验+1000、银两+500！', 'success', 5000);
              window.App2D.refreshMapNpcs();
            }
          }
        ]
      }
    ]
  },

  // 长安西门：刘伯钦送行依依惜别
  changan_farewell_liuboqin: {
    steps: [
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '哈哈！少侠！伯钦在长安集市听闻少侠受太宗敕封护持圣僧西天取经，特在城门口备了些山野干粮盘缠为你送行！'
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【依依惜别】',
        speakerIcon: '🏹',
        text: '想当初在两界山涧救起少侠，便知少侠是顶天立地的英雄！此番西去山高水长，第一站便是那压着神猴的五行山，少侠千万保重！伯钦祝少侠功德圆满、早载真经归唐！',
        options: [
          {
            text: '【🌅 拜别刘兄，西行大业正式启程！】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D) {
                window.App2D.storyPhase = 'wuxingshan_ready';
                window.showGameMessage('🌅 【西行序章启程】第一站：前往【五行山】解救齐天大圣孙悟空！', 'success', 5000);
                if (window.App2D.showChapterBanner) {
                  window.App2D.showChapterBanner('第二回 · 梦启长安', '水陆法会闻大法，金蝉发愿向西天', '西游正传');
                }
                window.App2D.refreshMapNpcs();
              }
            }
          }
        ]
      }
    ]
  },

  guanyin_talk: {
    steps: [
      {
        speaker: '观音菩萨 (化身)',
        speakerTitle: '【南海普陀落伽山】',
        speakerIcon: '🪷',
        text: '善哉善哉！威灵大将军，别来无恙乎？',
        emotion: 'divine'
      },
      {
        speaker: '玩家',
        speakerTitle: '【神魂震动】',
        speakerIcon: '🧙‍♂️',
        text: '菩萨！您……您唤我何名？！我脑海中似乎有金甲裂空之景掠过！',
        emotion: 'exclamation'
      },
      {
        speaker: '观音菩萨 (化身)',
        speakerTitle: '【南海普陀落伽山】',
        speakerIcon: '🪷',
        text: '因缘际会，果报不爽。你五百年前暗释大圣触犯天条，受贬人间。今大乘佛法将兴，正是你修成正果重列仙班之时！',
        emotion: 'divine'
      },
      {
        speaker: '观音菩萨 (化身)',
        speakerTitle: '【南海普陀落伽山】',
        speakerIcon: '🪷',
        text: '你速西行至五行山下，揭下佛祖六字大明咒金帖，救出孙悟空一同保唐僧西行取经！赐你【破封佛咒】与【紫金钵盂】！',
        emotion: 'divine',
        action: () => {
          window.App2D.grantGuanyinGift();
        }
      }
    ]
  },

  blacksmith_talk: {
    steps: [
      {
        speaker: '李铁匠',
        speakerTitle: '【大唐名匠】',
        speakerIcon: '🔨',
        text: '这位少侠气宇轩昂！我李家祖传玄铁淬火之法，专为西行降魔勇士锻造强化神兵利器与坚厚宝甲！'
      },
      {
        speaker: '李铁匠',
        speakerTitle: '【大唐名匠】',
        speakerIcon: '🔨',
        text: '工欲善其事，必先利其器。少侠行走江湖切记时常检视兵刃，打磨淬火方能在对战妖王时不落下风！',
        options: [
          {
            text: '【🔨 打开神兵天成 · 装备打造与强化精炼面板】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.openForgeModal();
            }
          }
        ]
      }
    ]
  },

  shop_talk: {
    steps: [
      {
        speaker: '万宝商贾',
        speakerTitle: '【长安富商】',
        speakerIcon: '💰',
        text: '客官里面请！小店汇聚南瞻部洲与西牛贺洲珍品，金创金丹、九转回魂散应有尽有！'
      },
      {
        speaker: '万宝商贾',
        speakerTitle: '【长安富商】',
        speakerIcon: '💰',
        text: '西行路上多豺狼妖魅，备足灵药仙丹方能保万全平安，客官请自便！'
      }
    ]
  },

  // === 第三章：五行山破封救大圣 ===
  mountain_god_talk: {
    steps: [
      {
        speaker: '五行山土地神',
        speakerTitle: '【镇山地仙】',
        speakerIcon: '👴',
        text: '小神参见上仙！这五行山原是如来佛祖五根手指所化，五百年来压着那齐天大圣。'
      },
      {
        speaker: '五行山土地神',
        speakerTitle: '【镇山地仙】',
        speakerIcon: '👴',
        text: '山脚石隙中正是大圣被困之处，山巅贴着佛祖金字压帖。少侠若要救他，须上得绝顶揭了那佛帖才是！'
      }
    ]
  },
  wukong_sealed_talk: {
    steps: [
      {
        speaker: '孙悟空',
        speakerTitle: '【压于山下五百年】',
        speakerIcon: '🐒',
        text: '（山脚石缝中传来如雷震吼）是谁在山前走动？！来者可是取经人？！'
      },
      {
        speaker: '玩家',
        speakerTitle: '【惊异上前】',
        speakerIcon: '🧙‍♂️',
        text: '神猴！你可是齐天大圣孙悟空？我受观音菩萨指点特来救你脱困！'
      },
      {
        speaker: '孙悟空',
        speakerTitle: '【眼眶湿润大喜过望】',
        speakerIcon: '🐒',
        text: '呀！是你！俺老孙这双火眼金睛认得你！五百年前凌霄殿前放俺走的金甲大将军！你竟也因俺遭贬下凡了！'
      },
      {
        speaker: '孙悟空',
        speakerTitle: '【急切呼唤】',
        speakerIcon: '🐒',
        text: '好兄弟！莫要伤感，快快攀上绝壁峰顶，将如来老儿压在上面的金字压帖揭了，俺老孙便能出来保你们西天取经！'
      }
    ]
  },

  wuxing_seal_trigger: {
    steps: [
      {
        speaker: '六字大明咒压帖',
        speakerTitle: '【唵嘛呢叭咪吽】',
        speakerIcon: '📜',
        text: '山巅金光万道，佛帖牢牢镇住五行山龙脉。你念动菩萨传授的破封真言，伸手轻轻一揭——',
        emotion: 'divine'
      },
      {
        speaker: '天摇地动',
        speakerTitle: '【山崩地裂】',
        speakerIcon: '💥',
        text: '【金帖随风化作一道金光直上重霄！整座五行山剧烈轰鸣崩裂，碎石穿云！】',
        emotion: 'exclamation',
        action: () => {
          window.App2D.releaseWukong();
          if (window.App2D && window.App2D.showChapterBanner) {
            window.App2D.showChapterBanner('第三回 · 破封五行', '六字真言金帖揭，齐天大圣踏云归', '大圣破封');
          }
        }
      }
    ]
  },

  wukong_freed: {
    steps: [
      {
        speaker: '孙悟空',
        speakerTitle: '【重见天日】',
        speakerIcon: '🐒',
        text: '俺老孙出来啦——哈哈哈！！五百年风吹日晒，今日重见天日！'
      },
      {
        speaker: '孙悟空',
        speakerTitle: '【拜伏谢恩】',
        speakerIcon: '🐒',
        text: '恩公！前世你因我获罪，今世又救我脱困，大恩大德永世不忘！从今往后，俺老孙这一根金箍棒，护你与师父扫平西天十万八千里一切妖邪！',
        action: () => {
          window.App2D.joinWukongToParty();
        }
      }
    ]
  },

  // =========================================================================
  // 第四章：蛇盘山·鹰愁涧剧情
  // =========================================================================
  tang_seng_yingchou_talk: {
    steps: [
      {
        speaker: '唐三藏',
        speakerTitle: '【西行圣僧】',
        speakerIcon: '🧘‍♂️',
        text: '阿弥陀佛！前方便是蛇盘山鹰愁涧，涧水千丈幽深。方才行至水边，忽有恶龙破浪而出，将贫僧的白马一口吞入腹中，贫僧肉眼凡胎，如何度此万水千山啊！'
      },
      {
        speaker: '孙悟空',
        speakerTitle: '【怒发冲冠】',
        speakerIcon: '🐒',
        text: '师父莫慌！恩公与俺老孙在此，量那水底长虫翻不起大浪！俺老孙这就去把那厮揪出来剥皮抽筋！'
      }
    ]
  },

  bailong_encounter: {
    steps: [
      {
        speaker: '小白龙敖烈',
        speakerTitle: '【西海龙三太子】',
        speakerIcon: '🐉',
        text: '何方泼猴，敢在寒潭鹰愁涧狂呼滥叫？！我乃西海龙王三太子敖烈，因纵火烧了夜明珠触犯天条，受贬在此受苦待罪，腹中饥馁吞了凡马，你待怎的！'
      },
      {
        speaker: '孙悟空',
        speakerTitle: '【挥棒喝问】',
        speakerIcon: '🐒',
        text: '好你个孽龙！那是我东土大唐圣僧取经的脚力！吃俺老孙一棒！',
        options: [
          {
            text: '【与孙悟空并肩出手，降伏小白龙！】',
            action: () => {
              window.App2D.triggerYingchouBattle();
            }
          }
        ]
      }
    ]
  },

  bailong_post_battle: {
    steps: [
      {
        speaker: '观音菩萨 (显圣)',
        speakerTitle: '【南海大慈大悲】',
        speakerIcon: '🪷',
        text: '且慢动手！敖烈，此乃东土大唐去往西天拜佛求经的圣僧与威灵大将！你既吞了凡马，便当戴罪立功，化作白龙马作为圣僧脚力，一路同去西天修成正果！'
      },
      {
        speaker: '小白龙敖烈',
        speakerTitle: '【顿悟化马】',
        speakerIcon: '🐉',
        text: '敖烈谨遵菩萨法旨！愿化龙马神驹，驮负圣僧与大将，虽万死不辞！',
        action: () => {
          window.App2D.joinBailongma();
        }
      }
    ]
  },

  // =========================================================================
  // 第五章：乌斯藏·高老庄与云栈洞剧情
  // =========================================================================
  gaotaigong_talk: {
    steps: [
      {
        speaker: '高太公',
        speakerTitle: '【庄院太公】',
        speakerIcon: '👴',
        text: '哎呀呀！几位长老与大将军救命啊！我这庄院不幸招了个妖精女婿，唤作猪刚鬣，初时勤力耕田，后来现了原形，生得黑脸獠牙、长耳大肚，还将小女翠兰深锁后院半年不得相见！'
      },
      {
        speaker: '孙悟空',
        speakerTitle: '【摩拳擦掌】',
        speakerIcon: '🐒',
        text: '老太公放宽心！老孙最喜降妖捉怪！恩公，咱们今夜便探一探那福陵山云栈洞，会一会那夯货！'
      }
    ]
  },

  cuilan_talk: {
    steps: [
      {
        speaker: '高翠兰',
        speakerTitle: '【高府三小姐】',
        speakerIcon: '👧',
        text: '多谢长老！那妖精每至掌灯时分便驾黑风而来，手持一把九齿钉耙，自称是天上神将转世，力大无穷无人能敌！'
      }
    ]
  },

  bajie_encounter: {
    steps: [
      {
        speaker: '猪刚鬣 (天蓬元帅)',
        speakerTitle: '【云栈洞妖王】',
        speakerIcon: '🐗',
        text: '哪个不长眼的毛脸和尚敢管俺老猪的家事？！吃老猪一钉耙！……等等，这位披甲金将……你莫非是凌霄宝殿当值的威灵大将军？！'
      },
      {
        speaker: '孙悟空',
        speakerTitle: '【大笑应声】',
        speakerIcon: '🐒',
        text: '呆子！既然认得天将恩公，还不速速放下钉耙受降！',
        options: [
          {
            text: '【挥动神兵，会一会天蓬元帅九齿钉耙！】',
            action: () => {
              window.App2D.triggerBajieBattle();
            }
          }
        ]
      }
    ]
  },

  bajie_post_battle: {
    steps: [
      {
        speaker: '猪八戒',
        speakerTitle: '【拜伏认错】',
        speakerIcon: '🐗',
        text: '哎哟哟！大圣饶命！将军饶命！俺老猪原是天河水神天蓬元帅，只因醉酒戏嫦娥被贬下界错投猪胎。菩萨早前摩顶受戒，教我在此等候取经人！'
      },
      {
        speaker: '猪八戒',
        speakerTitle: '【拜师入队】',
        speakerIcon: '🐗',
        text: '师父在上！将军在侧！老猪今日皈依佛门，赐法名悟能，愿挑担牵马，护佑西行！',
        action: () => {
          window.App2D.joinBajieToParty();
        }
      }
    ]
  },

  // =========================================================================
  // 第六章：八百里·黄风岭剧情
  // =========================================================================
  lingji_pusa_talk: {
    steps: [
      {
        speaker: '灵吉菩萨',
        speakerTitle: '【小须弥山圣僧】',
        speakerIcon: '🪷',
        text: '阿弥陀佛！那黄风怪本是灵山脚下得道黄毛貂鼠，偷喝了琉璃盏清油，练得一口“三昧神风”，能吹天地昏暗、鬼神难敌！'
      },
      {
        speaker: '灵吉菩萨',
        speakerTitle: '【小须弥山圣僧】',
        speakerIcon: '🪷',
        text: '贫僧奉如来法旨，特赐你【定风神丹】与【飞龙宝杖】！待妖风大作之时祭出，万风皆止！',
        action: () => {
          window.showGameMessage('【获得灵宝】借得【定风神丹】，黄风岭三昧神风威能尽破！', 'success', 3500);
        }
      }
    ]
  },

  hu_xianfeng_encounter: {
    steps: [
      {
        speaker: '虎先锋',
        speakerTitle: '【巡山大都督】',
        speakerIcon: '🐅',
        text: '小的们！山下来了白胖和尚与几个和尚徒弟！待本先锋拿下剥皮洗净，献与我家大王下酒！',
        options: [
          {
            text: '【挺身而出，先斩巡山虎先锋！】',
            action: () => {
              window.App2D.triggerHuxianfengBattle();
            }
          }
        ]
      }
    ]
  },

  huangfeng_boss_encounter: {
    steps: [
      {
        speaker: '黄风怪 (黄风大圣)',
        speakerTitle: '【黄风洞洞主】',
        speakerIcon: '🌪️',
        text: '何方泼贼敢杀我前部先锋？！且看本大圣的三昧神风——呼啦啦吹得你粉身碎骨！',
        options: [
          {
            text: '【祭起定风珠，合力大战黄风大圣！】',
            action: () => {
              window.App2D.triggerHuangfengBattle();
            }
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 第七章：八百里·流沙河剧情
  // =========================================================================
  muzha_talk: {
    steps: [
      {
        speaker: '木吒 (惠岸行者)',
        speakerTitle: '【菩萨尊者】',
        speakerIcon: '🗡️',
        text: '大将军，大圣！这八百里流沙河无底深渊，水底大妖乃是天庭灵霄殿卷帘大将转世，因失手打碎琉璃盏受贬在此。'
      },
      {
        speaker: '木吒 (惠岸行者)',
        speakerTitle: '【菩萨尊者】',
        speakerIcon: '🗡️',
        text: '他项下所挂九个骷髅乃是九世取经人的头骨，唯有以此九骨结成九宫法船，方能飞渡八百里流沙浊浪！'
      }
    ]
  },

  shaseng_encounter: {
    steps: [
      {
        speaker: '沙悟净 (卷帘大将)',
        speakerTitle: '【流沙河妖王】',
        speakerIcon: '🌊',
        text: '（巨浪滔天，红发蓝面凶汉破水而出）哪个凡胎敢渡我流沙河？！受我降妖宝杖一击！',
        options: [
          {
            text: '【踏浪而起，会战卷帘大将降妖宝杖！】',
            action: () => {
              window.App2D.triggerShasengBattle();
            }
          }
        ]
      }
    ]
  },

  shaseng_post_battle: {
    steps: [
      {
        speaker: '沙和尚',
        speakerTitle: '【卷帘归位】',
        speakerIcon: '🌊',
        text: '原是恩公大将军与孙师兄！悟净有眼不识泰山！菩萨早先点化，令我在此静候师父！'
      },
      {
        speaker: '沙和尚',
        speakerTitle: '【渡河成行】',
        speakerIcon: '🌊',
        text: '弟子沙悟净拜见师父！弟子愿取下九项骷髅系红葫芦化作法船，渡师徒全队过河，至死不渝！',
        action: () => {
          window.App2D.joinShasengToParty();
        }
      }
    ]
  },

  // =========================================================================
  // 第八章：浮屠山·乌巢禅林剧情
  // =========================================================================
  wuchao_talk: {
    steps: [
      {
        speaker: '乌巢禅师',
        speakerTitle: '【浮屠世外高僧】',
        speakerIcon: '🪺',
        text: '（仙桧苍翠，禅师栖于鸟巢祥云之上）南无阿弥陀佛！唐僧西行十万八千里，山高水远，魔障重重。贫僧有一卷《摩诃般若波罗蜜多心经》传汝！'
      },
      {
        speaker: '乌巢禅师',
        speakerTitle: '【传授心经】',
        speakerIcon: '🪺',
        text: '“色不异空，空不异色，色即是空，空即是色……心无挂碍，无挂碍故，无有恐怖，远离颠倒梦想，究竟涅槃！”',
        action: () => {
          window.App2D.learnHeartSutra();
        }
      }
    ]
  },

  // =========================================================================
  // 第九章：万寿山·五庄观剧情
  // =========================================================================
  qingfeng_talk: {
    steps: [
      {
        speaker: '清风仙童',
        speakerTitle: '【五庄观仙童】',
        speakerIcon: '👦',
        text: '家师镇元大仙往弥罗宫听讲混元道果去了，临行前特嘱咐我二人：唐僧乃故人金蝉子转世，打两枚人参果奉与长老解渴！'
      }
    ]
  },

  mingyue_talk: {
    steps: [
      {
        speaker: '明月仙童',
        speakerTitle: '【五庄观仙童】',
        speakerIcon: '👦',
        text: '这人参果又名草还丹，三千年一开花，三千年一结果，再三千年才得熟，人若有缘闻一闻活三百六十岁，吃一个活四万七千年！'
      }
    ]
  },

  zhenyuanzi_encounter: {
    steps: [
      {
        speaker: '镇元大仙',
        speakerTitle: '【地仙之祖】',
        speakerIcon: '仙',
        text: '好你个齐天大圣孙悟空！打倒我万寿山人参果树，还想瞒天过海走脱不成？！且看我神通——袖里乾坤！',
        options: [
          {
            text: '【迎战地仙之祖镇元子，破其袖里乾坤！】',
            action: () => {
              window.App2D.triggerZhenyuanziBattle();
            }
          }
        ]
      }
    ]
  },

  zhenyuanzi_post_battle: {
    steps: [
      {
        speaker: '镇元大仙',
        speakerTitle: '【八拜结交】',
        speakerIcon: '仙',
        text: '善哉！得观音大士甘露水活得宝树，大圣与将军真乃盖世英雄也！我镇元子今日愿与孙悟空结为异姓八拜之交，共享人参果长生宴！'
      },
      {
        speaker: '镇元大仙',
        speakerTitle: '【赠送先天灵果】',
        speakerIcon: '仙',
        text: '赠予将军【先天草还丹人参果】与【混元道袍】！西行前途无量！',
        action: () => {
          window.App2D.grantZhenyuanziGift();
        }
      }
    ]
  },

  // =========================================================================
  // 第十章：白虎岭·白骨洞剧情 (三打白骨精)
  // =========================================================================
  baigujing_encounter: {
    steps: [
      {
        speaker: '白骨夫人',
        speakerTitle: '【白虎岭幽魂尸魔】',
        speakerIcon: '💀',
        text: '造化！造化！都说吃了唐僧一块肉，延寿长生不老！今朝你们踏入我白虎岭，休想活着离去！',
        options: [
          {
            text: '【火眼金睛破伪装！合力诛杀白骨夫人！】',
            action: () => {
              window.App2D.triggerBaigujingBattle();
            }
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 第十一章：宝象国·波月洞剧情 (战黄袍怪奎木狼)
  // =========================================================================
  baoxiang_king_talk: {
    steps: [
      {
        speaker: '宝象国国王',
        speakerTitle: '【异域国君】',
        speakerIcon: '👑',
        text: '大唐高僧与大将军！十三年前小女百花羞被妖风卷走，近日方知被碗子山波月洞黄袍怪掳去做了压寨夫人！求大将军救我王儿归国啊！'
      }
    ]
  },

  baihuaxiu_talk: {
    steps: [
      {
        speaker: '百花羞公主',
        speakerTitle: '【被困深山】',
        speakerIcon: '👸',
        text: '大将军！黄袍郎本是天上星宿，因思凡下界霸占奴家。他凶残无比，喜吞食活人，求将军快快救我离开魔窟！'
      }
    ]
  },

  huangpao_boss_encounter: {
    steps: [
      {
        speaker: '黄袍怪 (奎木狼)',
        speakerTitle: '【二十八宿西方奎星】',
        speakerIcon: '🐺',
        text: '哪来的不知死活之徒，敢来波月洞抢本大王的压寨夫人？！吃老子追魂宝刀！',
        options: [
          {
            text: '【大破波月洞，力战奎木狼真身！】',
            action: () => {
              window.App2D.triggerHuangpaoBattle();
            }
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 隐藏圣境：方寸山与珞珈山剧情
  // =========================================================================
  puti_talk: {
    steps: [
      {
        speaker: '菩提祖师',
        speakerTitle: '【斜月三星始祖】',
        speakerIcon: '✨',
        text: '（云蒸霞蔚，仙鹤盘旋）悟空乃老道当年传道之弟子。威灵大将，你历经劫波护持天道，今日至此乃是有大福缘。'
      },
      {
        speaker: '菩提祖师',
        speakerTitle: '【无上顿悟】',
        speakerIcon: '✨',
        text: '传汝《大品天仙诀》奥义！全队攻击力暴增20%，法力消耗减免30%！去吧，三界安危系汝一身！',
        action: () => {
          window.showGameMessage('【菩提道果】领悟《大品天仙诀》，攻击大幅暴涨，法力消耗大减！', 'success', 4000);
        }
      }
    ]
  },

  guanyin_luojia_talk: {
    steps: [
      {
        speaker: '观世音菩萨',
        speakerTitle: '【紫竹潮音真容】',
        speakerIcon: '🪷',
        text: '善哉善哉！威灵大将，一路行来功德无量。紫竹林灵泉可洗净一切业障，助全队生命法力瞬息全满！'
      }
    ]
  },

  // === 刘家村土地公 ===
  liujia_tudi_talk: {
    steps: [
      {
        speaker: '刘家村土地神',
        speakerTitle: '【两界山地仙】',
        speakerIcon: '🌿',
        text: '小神参见威灵大将军！此处乃是双叉岭刘家村，前面就是巍峨的大唐长安城。小神略通地灵神行之术，可助将军行诸般方便！'
      },
      {
        speaker: '刘家村土地神',
        speakerTitle: '【两界山地仙】',
        speakerIcon: '🌿',
        text: '将军若想飞速修行提升道行，小神可用遁法送将军悄悄潜入【天宫·蟠桃园】偷采仙桃，大饱口福增加海量经验！',
        options: [
          {
            text: '【🍑 施展土遁：直达【天宫·蟠桃园】采摘偷桃】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.loadMap('tiangong_pantao', { x: 10 * 32, y: 12 * 32 });
              window.showGameMessage('✨ 土地公拂尘一挥，地脉金光涌动，已送你抵达天界蟠桃园！', 'success');
            }
          },
          {
            text: '【🏠 神行遁法：返回我的永久居住地】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.teleportToResidence();
            }
          },
          {
            text: '【向土地公打听周围山川地势】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.showGameMessage('🌿 土地公：“左侧是五行山与鹰愁涧，右侧是大唐长安盛京，南边乃是陈塘关与东海浩瀚碧波！”', 'info', 4000);
            }
          }
        ]
      }
    ]
  },

  // === 长安城钱庄掌柜 ===
  qianzhuang_talk: {
    steps: [
      {
        speaker: '钱庄掌柜',
        speakerTitle: '【汇通三界】',
        speakerIcon: '💰',
        text: '哟！少侠光临大唐钱庄，真是蓬荜生辉！本号信誉贯通人仙魔三界，不仅可替少侠妥善保管白银库银，更有通宝钱庄独家理财！'
      },
      {
        speaker: '钱庄掌柜',
        speakerTitle: '【汇通三界】',
        speakerIcon: '💰',
        text: '少侠若将闲置银两存入理财钱库，平日降妖伏魔历练之时，便有源源不断的银两利息滚滚而来！少侠今日是要存银、取银还是申领理财红利？',
        options: [
          {
            text: '【💰 办理钱庄存取与理财增值】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.openBankModal();
            }
          }
        ]
      }
    ]
  },

  // === 长安城回生老医师 ===
  yishi_talk: {
    steps: [
      {
        speaker: '回生老医师',
        speakerTitle: '【妙手仁心】',
        speakerIcon: '🏥',
        text: '医者仁心，普济众生。老朽在此行医四十载，无论是刀剑外伤还是妖煞内创，老朽皆有一剂良药可起死回生！'
      },
      {
        speaker: '回生老医师',
        speakerTitle: '【妙手仁心】',
        speakerIcon: '🏥',
        text: '少侠与随行仙宠若身染残伤、精力匮乏，老朽只需一炉清灵金针，区区 50 两纹银即可助全员气血、精力完全恢复至巅峰满状态！',
        options: [
          {
            text: '【❤️ 支付 50 两：医馆回春，全队满气血满法力】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.healAllAtDoctor();
            }
          },
          {
            text: '【💊 选购医馆常备仙丹妙药 (金创药/大还丹/九转还魂丹等)】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.openPharmacyModal();
            }
          }
        ]
      }
    ]
  },

  // === 长安户籍官 (定居系统) ===
  huji_talk: {
    steps: [
      {
        speaker: '长安户籍官',
        speakerTitle: '【京兆府户部】',
        speakerIcon: '📜',
        text: '下官奉旨掌管大唐国都民籍户曹！如今四海宾服，万邦来朝，凡三界有功侠士，皆可在我长安帝京选址置办家业，立为长久居所！'
      },
      {
        speaker: '长安户籍官',
        speakerTitle: '【京兆府户部】',
        speakerIcon: '📜',
        text: '一旦在此登记定居，少侠往后行走三界十万八千里，只要遇上各地土地神祇或催动神行玉符，皆可一念之间直飞返回长安家中！',
        options: [
          {
            text: '【🏛️ 登记户籍：将【大唐王都·长安城】设立为我的永久居住地】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.setHomeResidence('changan_city');
            }
          },
          {
            text: '【🏠 神行归途：立即返回我的永久居住地】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.teleportToResidence();
            }
          }
        ]
      }
    ]
  },

  // === 陈塘关李靖与哪吒 ===
  lijing_talk: {
    steps: [
      {
        speaker: '李靖总兵',
        speakerTitle: '【陈塘关守将】',
        speakerIcon: '🛡️',
        text: '本总兵奉旨镇守陈塘雄关，扼守九湾河直通东海要道！东面常有龙宫虾兵蟹将与水妖出没，少侠行经此地，切莫惊扰了海界安宁。',
        options: [
          {
            text: '【📦 交付护送的大唐军饷镖银 (完成押镖)】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.submitEscortQuest('npc_lijing_zongbing');
            }
          }
        ]
      }
    ]
  },

  nezha_talk: {
    steps: [
      {
        speaker: '哪吒三太子',
        speakerTitle: '【降魔灵珠子】',
        speakerIcon: '🔥',
        text: '小爷我身披混天绫，脚踏风火轮，手执火尖枪！要是东海龙宫那帮泥鳅敢再兴风作浪掀起滔天海啸，小爷定将他们剥皮抽筋！'
      }
    ]
  },

  fisherman_talk: {
    steps: [
      {
        speaker: '海滨老渔翁',
        speakerTitle: '【陈塘老渔】',
        speakerIcon: '🎣',
        text: '老朽在这陈塘关海滨打了六十年鱼喽！少侠你看，东边这片金沙滩退潮时，常有灵河巨蚌、碧水老蚌精和铁甲金蟹、青蟹怪在沙滩上漫步横行，深水处还有那巡海大龙虾！'
      },
      {
        speaker: '海滨老渔翁',
        speakerTitle: '【陈塘老渔】',
        speakerIcon: '🎣',
        text: '这些海怪虽有些道行，但外壳坚硬正是淬火锻造的上好材料！少侠往东穿过潮水便是东海之滨，往西出关隘则是那二十级练功点野狐岭。不过仙令森严，修为未达标可过不去关门呢！',
        options: [
          {
            text: '【多谢老丈指点迷津】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.showGameMessage('🎣 听老渔翁一席话，对东海潮汐野怪与陈塘关隘了然于胸！', 'info');
            }
          }
        ]
      }
    ]
  },

  // === 东海之滨与龙宫系列 ===
  yecha_talk: {
    steps: [
      {
        speaker: '巡海夜叉',
        speakerTitle: '【龙宫巡江使】',
        speakerIcon: '🔱',
        text: '咕噜噜……何方修士在海岸游荡？海潮汹涌深不可测，若要下潜前往水晶宫见龙王陛下，须有纯正仙道避水诀才行！'
      }
    ]
  },

  guichengxiang_talk: {
    steps: [
      {
        speaker: '龟丞相',
        speakerTitle: '【龙宫总管】',
        speakerIcon: '🐢',
        text: '老朽参见上仙！此处乃东海水底水晶宫，琉璃为瓦，明珠为帘。老朽奉陛下法旨打理四海珍宝阁，奇珍异宝、仙家灵露应有尽有！',
        options: [
          {
            text: '【🐚 打开【东海珍宝阁】(选购金柳露、高阶宝石、天外陨铁)】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.openDragonShopModal();
            }
          },
          {
            text: '【打探海藏秘辛与定海神针铁下落】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.showGameMessage('🐢 龟丞相：“大殿龙王陛下正为此事忧心！海藏深处有万年覆海蛟龙作乱，上仙速去大殿助龙王一臂之力！”', 'info', 4000);
            }
          }
        ]
      }
    ]
  },

  aoguang_talk: {
    steps: [
      {
        speaker: '东海龙王敖广',
        speakerTitle: '【四海龙尊】',
        speakerIcon: '🐉',
        text: '哈哈哈哈！威灵大将军大驾光临，老龙有失远迎！当年大圣取走了如意金箍棒，如今海眼深处又有一尊大禹治水留存的【天河定海神珍铁·仿】镇压龙脉。'
      },
      {
        speaker: '东海龙王敖广',
        speakerTitle: '【四海龙尊】',
        speakerIcon: '🐉',
        text: '奈何深海凶兽【覆海蛟龙王】正率水妖撞击神针结界欲掀起滔天海啸！若将军能助老龙荡平蛟妖、通过深海试炼，老龙愿将神针与【紫金红葫芦】、【避水神珠】双手奉上！',
        options: [
          {
            text: '【🌊 开启【龙宫借宝 · 深海试炼】：力斩覆海蛟龙王！】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.triggerDonghaiTrialBattle();
            }
          },
          {
            text: '【稍作休整，备足仙丹再战】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
            }
          }
        ]
      }
    ]
  },

  // === 长安城伏魔判官钟馗 (日常抓鬼除魔) ===
  zhongkui_talk: {
    steps: [
      {
        speaker: '钟馗',
        speakerTitle: '【伏魔大将军】',
        speakerIcon: '👹',
        text: '豹头环眼，铁面虬鬓！吾乃终南山钟馗！奉玉帝法旨与唐王恩典，巡察九州三界，斩尽一切作祟恶鬼冤魂！'
      },
      {
        speaker: '钟馗',
        speakerTitle: '【伏魔大将军】',
        speakerIcon: '👹',
        text: '少侠神威凛凛，正合伏魔除煞之大义！少侠若愿替天行道降妖除祟，本官定当表奏天庭，赐你海量修行经验、万两白银与仙露琼浆【金柳露】！',
        options: [
          {
            text: '【📜 领取今日【降妖除魔令】(钟馗抓鬼任务)】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.acceptZhongkuiGhostQuest();
            }
          },
          {
            text: '【🏆 提交已完成的伏魔任务，领取丰厚赏赐】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.submitZhongkuiGhostQuest();
            }
          },
          {
            text: '【🎯 立即一键神行寻路，前往当前除妖目标地】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.trackZhongkuiGhostTarget();
            }
          }
        ]
      }
    ]
  },

  // === 长安城大唐镖局程咬金 (大唐运镖) ===
  biaoju_talk: {
    steps: [
      {
        speaker: '程咬金 (大唐镖头)',
        speakerTitle: '【天下第一镖】',
        speakerIcon: '🚩',
        text: '哈哈哈！洒家乃是大唐卢国公程咬金，奉皇命总督天下镖局！如今各路边防与仙山要塞急需朝廷军饷与香火贡品，少侠可敢领镖押运？！'
      },
      {
        speaker: '程咬金 (大唐镖头)',
        speakerTitle: '【天下第一镖】',
        speakerIcon: '🚩',
        text: '押镖规矩：少侠需预付 1000 两押金领取引信，一路斩妖除盗，切记中途不可神行传送。待安全押至目的地，本总管不仅退还押金，更重赏 3500 两白银、修行经验与稀世【魔兽要诀】！',
        options: [
          {
            text: '【🚩 接取今日【大唐军饷押运令】(支付1000两押金)】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.acceptEscortQuest();
            }
          },
          {
            text: '【📜 查看当前运镖进度与护送目标路线】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.App2D.checkEscortStatus();
            }
          },
          {
            text: '【暂且休整，备齐兵刃再来】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
            }
          }
        ]
      }
    ]
  },

  // === 长安城织造·苏绣娘 ===
  changan_girl_talk: {
    steps: [
      {
        speaker: '苏绣娘',
        speakerTitle: '【长安织造】',
        speakerIcon: '🧵',
        text: '“长安一片月，万户捣衣声。” 少侠好英武的气概！大唐盛世太平，妾身刚绣成一批江南云锦蜀袍与香囊荷包，少侠游历三界风尘仆仆，可要挑一件称心的衣袍护体？'
      }
    ]
  },

  // === 长安城游方书生·杜子美 ===
  changan_scholar_talk: {
    steps: [
      {
        speaker: '杜子美',
        speakerTitle: '【游方书生】',
        speakerIcon: '📜',
        text: '“忆昔开元全盛日，小邑犹藏万家室。稻米流脂粟米白，公私仓廪俱丰实。” 少侠请看，朱雀大街四海通商，百姓安居乐业，此乃千古未有之盛景也！愿少侠西行之途，亦能如大唐般光明坦荡！'
      }
    ]
  },

  // === 长安城挑担货郎·阿福 ===
  changan_hawker_talk: {
    steps: [
      {
        speaker: '货郎阿福',
        speakerTitle: '【百味挑担】',
        speakerIcon: '🍡',
        text: '刚出炉的桂花芡实糕、三原蓼花糖、五仁素饼嘞！香甜软糯，走过路过不要错过！少侠闯荡江湖劳累，来两块甜糕垫垫肚子吧，祝少侠一路顺风顺水！'
      }
    ]
  },

  // === 长安城坊间小童·小虎 ===
  changan_child_talk: {
    steps: [
      {
        speaker: '小虎',
        speakerTitle: '【坊间顽童】',
        speakerIcon: '🍭',
        text: '哇！少侠大哥哥好威风！听说化生寺的玄奘法师要讲佛经，我正要拉着小伙伴去听呢！少侠大哥哥，外面的世界真的有腾云驾雾的神仙和会变身的齐天大圣吗？'
      }
    ]
  },

  // === 长安城金甲禁军·巡城校尉 ===
  changan_guard_talk: {
    steps: [
      {
        speaker: '金甲校尉',
        speakerTitle: '【御林巡卒】',
        speakerIcon: '🛡️',
        text: '金吾不禁，长安盛世！圣天子抚育四方，京都内外一片祥和。少侠既入皇城，还请归刀入鞘，若有恶霸地痞或暗潜妖邪作祟，我巡城禁军定当雷霆荡除！'
      }
    ]
  },

  // === 长安城古亭茶肆·茶圣阿婆 ===
  changan_tea_talk: {
    steps: [
      {
        speaker: '茶肆阿婆',
        speakerTitle: '【长安茶肆】',
        speakerIcon: '🍵',
        text: '贵客请歇脚！这雨前龙井乃今春自江南八百里快马送达京师的头采嫩芽，以城外甘露灵泉烹煮，清香四溢！看少侠风尘仆仆，快来饮上一大碗，润润心肺！',
        options: [
          {
            text: '【🍵 品尝一碗清甜灵泉龙井茶 (气血法力充盈)】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D && window.App2D.playerData) {
                window.App2D.playerData.hp = window.App2D.playerData.maxHp;
                window.App2D.playerData.mp = window.App2D.playerData.maxMp;
                window.App2D.updateHudBars();
                if (window.Sound) window.Sound.playSuccess();
                window.showGameMessage('🍵 一盏甘洌仙茶入腹，只觉四肢百骸灵气流转，气血与法力已全部充盈！', 'success', 3500);
              }
            }
          },
          {
            text: '【🏮 闲话大唐盛世】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.showGameMessage('🏮 阿婆笑呵呵道：“如今大唐海晏河清，四海胡商云集朱雀大街，少侠只管放宽心历练游历！”', 'info', 4000);
            }
          }
        ]
      }
    ]
  },

  // =========================================================================
  // 长安城左上角【神坛】菩提老祖：全系技能参悟、1/5突破升级与仙宠10级授法
  // =========================================================================
  puti_shendan_talk: {
    steps: [
      {
        speaker: '菩提老祖',
        speakerTitle: '【万法之宗·太上道祖】',
        speakerIcon: '✨',
        text: '福生无量天尊！贫道在此神坛静候少侠多时。三界道法无边，凡有神通与灵宠法术，皆有熟练度沉淀。初学为零，最高五级，每级跨度五千，满熟练度二万五千大圆满！'
      },
      {
        speaker: '菩提老祖',
        speakerTitle: '【万法之宗·太上道祖】',
        speakerIcon: '✨',
        text: '若达本级五千瓶颈，即便多放千万次亦不增一分熟练度，必须由老夫为你洗髓突破方可升阶。若达本级满额五分之一（一千熟练度），亦可提前突破升华！少侠今日欲问何道？',
        options: [
          {
            text: '【参悟突破·提升技能品级】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D && typeof window.App2D.openSkillMasteryModal === 'function') {
                window.App2D.openSkillMasteryModal();
              }
            }
          },
          {
            text: '【领悟门派道法神通】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D && typeof window.App2D.learnClassSkillsFromMaster === 'function') {
                window.App2D.learnClassSkillsFromMaster();
              }
            }
          },
          {
            text: '【仙宠10级灵智授业】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              if (window.App2D && typeof window.App2D.awakenPetSkillAtMaster === 'function') {
                window.App2D.awakenPetSkillAtMaster();
              }
            }
          },
          {
            text: '【聆听熟练度与五级道法法则】',
            action: () => {
              if (window.Dialogue) window.Dialogue.close();
              window.showGameMessage('【老祖传道】熟练度越高威力越盛！一级满5000锁级，1000熟练度(满额1/5)即可提前找老祖升2级！', 'info', 5000);
            }
          }
        ]
      }
    ]
  }
};

// 兼容别名绑定 (确保新旧测试用例与历史存档平滑兼容)
if (window.GAME_DATA && window.GAME_DATA.STORY_DIALOGUES) {
  window.GAME_DATA.STORY_DIALOGUES.huaguoshan_battle_intro = window.GAME_DATA.STORY_DIALOGUES.juling_shuilien_battle;
  window.GAME_DATA.STORY_DIALOGUES.wukong_respect_scene = window.GAME_DATA.STORY_DIALOGUES.juling_defeated_to_huaguoshan;
  window.GAME_DATA.STORY_DIALOGUES.wukong_final_spar = window.GAME_DATA.STORY_DIALOGUES.wukong_huaguoshan_havoc;
}

// =========================================================================
// 汉风西游 - 全章节国风章回体配置系统 (CHAPTER_CONFIGS)
// 包含序章与西游正传各大主要章节，提供2秒国风开幕水墨、金字、七言诗号与朱砂御印
// =========================================================================
if (window.GAME_DATA) {
  window.GAME_DATA.CHAPTER_CONFIGS = {
    'prologue': {
      id: 'prologue',
      chapterNum: '序章',
      title: '序章 · 蟠桃盛宴',
      subtitle: '九天金阙神仙客，蟠桃胜会动乾坤',
      seal: '天界神篇',
      triggerMap: 'tiangong_palace',
      triggerPhase: 'heaven_prologue'
    },
    'chapter_1': {
      id: 'chapter_1',
      chapterNum: '第一回',
      title: '第一回 · 梦断双叉',
      subtitle: '梦断九天削神位，谪仙山野识英雄',
      seal: '凡世初醒',
      triggerMap: 'liujiacun',
      triggerPhase: 'liujiacun_start'
    },
    'chapter_2': {
      id: 'chapter_2',
      chapterNum: '第二回',
      title: '第二回 · 盛世大唐',
      subtitle: '紫气东来聚帝京，金蝉发愿向西天',
      seal: '大唐天命',
      triggerMap: 'changan_city',
      triggerPhase: 'changan_arrived'
    },
    'chapter_3': {
      id: 'chapter_3',
      chapterNum: '第三回',
      title: '第三回 · 雄关东海',
      subtitle: '陈塘风云平盗寇，龙神宝库现雄威',
      seal: '东海龙波',
      triggerMap: 'chentangguan',
      triggerPhase: 'chentang_investigate'
    },
    'chapter_4': {
      id: 'chapter_4',
      chapterNum: '第四回',
      title: '第四回 · 破封五行',
      subtitle: '六字真言金帖解，五行山下大圣归',
      seal: '齐天出世',
      triggerMap: 'wuxingshan',
      triggerPhase: 'wuxingshan_ready'
    },
    'chapter_5': {
      id: 'chapter_5',
      chapterNum: '第五回',
      title: '第五回 · 龙腾鹰愁',
      subtitle: '蛇盘山下擒烈马，鹰愁涧底踏云龙',
      seal: '玉龙归宗',
      triggerMap: 'yingchoujian'
    },
    'chapter_6': {
      id: 'chapter_6',
      chapterNum: '第六回',
      title: '第六回 · 智收天蓬',
      subtitle: '乌斯藏界降天蓬，云栈高庄配良缘',
      seal: '天蓬入道',
      triggerMap: 'gaolaozhuang'
    },
    'chapter_7': {
      id: 'chapter_7',
      chapterNum: '第七回',
      title: '第七回 · 沙界沉砂',
      subtitle: '八百流沙深不测，九顶骷髅渡法船',
      seal: '金身罗汉',
      triggerMap: 'liushaho'
    },
    'chapter_8': {
      id: 'chapter_8',
      chapterNum: '第八回',
      title: '第八回 · 五庄仙缘',
      subtitle: '万寿山前偷草还，袖里乾坤结八拜',
      seal: '地仙祖庭',
      triggerMap: 'wuzhuangguan'
    },
    'chapter_9': {
      id: 'chapter_9',
      chapterNum: '第九回',
      title: '第九回 · 白骨尸魔',
      subtitle: '白虎岭头迷幻相，火眼金睛辨妖氛',
      seal: '三打白骨',
      triggerMap: 'baihuling'
    },
    'chapter_10': {
      id: 'chapter_10',
      chapterNum: '第十回',
      title: '第十回 · 奎宿星耀',
      subtitle: '波月洞深降奎木，宝象国里救天仙',
      seal: '星宿正果',
      triggerMap: 'baoxiangguo'
    }
  };
}
