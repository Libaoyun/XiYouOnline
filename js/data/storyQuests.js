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

  // === 序章：天宫变故 ===
  taibai_intro: {
    steps: [
      {
        speaker: '太白金星',
        speakerTitle: '【天庭老仙】',
        speakerIcon: '👴',
        text: '哎呀呀！威灵显赫大将军，你可算在此值守了！出天大的乱子了！'
      },
      {
        speaker: '太白金星',
        speakerTitle: '【天庭老仙】',
        speakerIcon: '👴',
        text: '那弼马温……不，那花果山齐天大圣孙悟空，因未被请入蟠桃胜会，一怒之下反出天庭，偷吃了老君的金丹，如今正手提金箍棒一路杀上凌霄殿来了！'
      },
      {
        speaker: '太白金星',
        speakerTitle: '【天庭老仙】',
        speakerIcon: '👴',
        text: '托塔李天王正在前头调兵遣将，将军速速前去相助！'
      }
    ]
  },

  litianwang_intro: {
    steps: [
      {
        speaker: '托塔李天王',
        speakerTitle: '【降魔大元帅】',
        speakerIcon: '👑',
        text: '威灵大将军听令！天罗地网已经布下，那妖猴狂妄至极，今日断不可让他冲撞了玉帝圣驾！'
      },
      {
        speaker: '托塔李天王',
        speakerTitle: '【降魔大元帅】',
        speakerIcon: '👑',
        text: '速与本帅并力合围，布阵擒猴！'
      }
    ]
  },

  wukong_heaven_encounter: {
    steps: [
      {
        speaker: '孙悟空',
        speakerTitle: '【齐天大圣】',
        speakerIcon: '🐒',
        text: '嘿嘿嘿！吃俺老孙一棒！玉帝老儿无道，这九霄天阙俺老孙踏得，你们也拦得？！'
      },
      {
        speaker: '威灵大将军 (玩家)',
        speakerTitle: '【天界神将】',
        speakerIcon: '🧙‍♂️',
        text: '（凝视眼前桀骜不驯的神猴，心中暗赞这通天豪情与敢破枷锁的傲骨……）'
      },
      {
        speaker: '孙悟空',
        speakerTitle: '【齐天大圣】',
        speakerIcon: '🐒',
        text: '看你这身金甲气度不凡，也是个铁骨铮铮的好汉，何必为这腐朽天庭卖命？要战便战！'
      },
      {
        speaker: '威灵大将军 (玩家)',
        speakerTitle: '【抉择时刻】',
        speakerIcon: '🧙‍♂️',
        text: '大圣，我敬你顶天立地！天兵后路已被我悄然引开，你速破虚空而去！',
        options: [
          {
            text: '【暗中相助孙悟空，阻挡追捕天兵】',
            action: () => {
              window.App2D.triggerHeavenBattle();
            }
          }
        ]
      }
    ]
  },

  heaven_banishment: {
    steps: [
      {
        speaker: '天庭宣旨金甲天神',
        speakerTitle: '【天威浩荡】',
        speakerIcon: '⚡',
        text: '奉玉皇大天尊敕令：威灵显赫大将军居心叵测，私纵妖猴！'
      },
      {
        speaker: '天庭宣旨金甲天神',
        speakerTitle: '【天罚降临】',
        speakerIcon: '⚡',
        text: '今如来佛祖已降五指山将妖猴镇压。着即剥夺威灵大将神金甲胄与一身仙法，清空宿世记忆，重重贬落凡尘两界山下受苦轮回！钦此！'
      },
      {
        speaker: '天道神雷',
        speakerTitle: '【轰然巨响】',
        speakerIcon: '💥',
        text: '【九霄惊雷撕裂虚空！你的神力被生生剥离，意识陷入了无尽的黑暗与深渊……】',
        action: () => {
          window.App2D.executeBanishment();
        }
      }
    ]
  },

  // === 第一章：凡间刘家村 ===
  liuboqin_talk: {
    steps: [
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '喂！这位兄弟，快醒醒！你怎生一身单薄布衫倒在双叉岭山涧旁？'
      },
      {
        speaker: '失忆玩家',
        speakerTitle: '【茫然不知】',
        speakerIcon: '🧙‍♂️',
        text: '我……我是谁？我胸口仿佛被神雷击中，过往之事竟一丝一毫都记不得了……'
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '唉，定是遭了强人洗劫伤了头颅！在下刘伯钦，人称镇山太保，以打猎为生。'
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '这双叉岭凶兽极多，这把【猎虎短刃】与【鹿皮短靴】你先拿去防身！东边林子里有只恶狼四处咬人，你随我前去斩了它，权当活络筋骨！',
        action: () => {
          window.App2D.grantStarterItems();
        }
      }
    ]
  },

  liuboqin_post_hunt: {
    steps: [
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '好身手！小兄弟虽失了记忆，但举手投足间隐有大将之风！'
      },
      {
        speaker: '刘伯钦',
        speakerTitle: '【镇山太保】',
        speakerIcon: '🏹',
        text: '听闻向东百里的大唐都城【长安城】，化生寺高僧玄奘法师正开水陆大会，更常有仙家神迹显化。你若想寻回身世，不妨前往长安一探究竟！'
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

  // === 第二章：大唐长安城 ===
  xuanzang_talk: {
    steps: [
      {
        speaker: '玄奘法师',
        speakerTitle: '【金山寺高僧】',
        speakerIcon: '🧘‍♂️',
        text: '阿弥陀佛。施主远道而来，贫僧见施主眉宇间有浩然浩荡之气，绝非池中之物。'
      },
      {
        speaker: '玄奘法师',
        speakerTitle: '【金山寺高僧】',
        speakerIcon: '🧘‍♂️',
        text: '贫僧受大唐天子重托，发下大愿欲往西天拜佛求取大乘真经，超度天下苦难亡灵。奈何西行十万八千里妖魔横行，正需施主这般义薄云天的豪杰护持！'
      }
    ]
  },

  guanyin_talk: {
    steps: [
      {
        speaker: '观音菩萨 (化身)',
        speakerTitle: '【南海普陀落伽山】',
        speakerIcon: '🪷',
        text: '善哉善哉！威灵大将军，别来无恙乎？'
      },
      {
        speaker: '玩家',
        speakerTitle: '【神魂震动】',
        speakerIcon: '🧙‍♂️',
        text: '菩萨！您……您唤我何名？！我脑海中似乎有金甲裂空之景掠过！'
      },
      {
        speaker: '观音菩萨 (化身)',
        speakerTitle: '【南海普陀落伽山】',
        speakerIcon: '🪷',
        text: '因缘际会，果报不爽。你五百年前暗释大圣触犯天条，受贬人间。今大乘佛法将兴，正是你修成正果重列仙班之时！'
      },
      {
        speaker: '观音菩萨 (化身)',
        speakerTitle: '【南海普陀落伽山】',
        speakerIcon: '🪷',
        text: '你速西行至五行山下，揭下佛祖六字大明咒金帖，救出孙悟空一同保唐僧西行取经！赐你【破封佛咒】与【紫金钵盂】！',
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
        text: '山巅金光万道，佛帖牢牢镇住五行山龙脉。你念动菩萨传授的破封真言，伸手轻轻一揭——'
      },
      {
        speaker: '天摇地动',
        speakerTitle: '【山崩地裂】',
        speakerIcon: '💥',
        text: '【金帖随风化作一道金光直上重霄！整座五行山剧烈轰鸣崩裂，碎石穿云！】',
        action: () => {
          window.App2D.releaseWukong();
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
  }
};


