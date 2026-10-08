/**
 * 汉风西游 - 正统西游主线剧情剧本库 (StoryQuests)
 * 严格按照玩家记忆原汁原味还原：
 * 威灵显赫大将军 -> 大闹天宫暗助大圣 -> 贬落凡尘失忆 -> 双叉岭刘家村刘伯钦 -> 长安拜见玄奘菩萨 -> 五行山揭帖破封救大圣
 */

export const STORY_DIALOGUES = {
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
            action: (ctx) => ctx.showChooseMountModal()
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
        text: '下官参见将军！御马监备有金刚【龙马】、神仙【飞剑】、妖魔【狮子】三大专属坐骑，常加驯化可大增属性。',
        options: [
          {
            text: '挑选门派坐骑',
            action: (ctx) => ctx.showChooseMountModal?.()
          },
          {
            text: '坐骑驯化',
            action: (ctx) => ctx.openMountModal()
          },
          {
            text: '前往蟠桃园',
            action: (ctx) => ctx.loadMap?.('tiangong_pantao', { x: 64, y: 448 })
          },
          {
            text: '返回刘家村',
            action: (ctx) => ctx.loadMap?.('liujiacun', { x: 23 * 32, y: 10 * 32 })
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
        text: '小神参见上仙。园中仙桃已熟，靠近仙树即可采摘提升道行。'
      },
      {
        speaker: '蟠桃园土地',
        speakerTitle: '【瑶池地仙】',
        speakerIcon: '👴',
        text: '少侠若要离园，小神可施展遁法送少侠前往御马监或返回凡尘。',
        options: [
          {
            text: '返回',
            action: (ctx) => ctx.teleportFromPeachGarden?.('previous') || ctx.loadMap?.('liujiacun', { x: 23 * 32, y: 10 * 32 })
          },
          {
            text: '返回刘家村',
            action: (ctx) => ctx.teleportFromPeachGarden?.('liujiacun') || ctx.loadMap?.('liujiacun', { x: 23 * 32, y: 10 * 32 })
          },
          {
            text: '返回居住地',
            action: (ctx) => ctx.teleportToResidence?.()
          },
          {
            text: '前往御马监',
            action: (ctx) => ctx.loadMap?.('tiangong_yuma', { x: 10 * 32, y: 15 * 32 })
          }
        ]
      }
    ]
  },

  liujia_tudi_talk: {
    steps: [
      {
        speaker: '刘家村土地神',
        speakerTitle: '【两界山地仙】',
        speakerIcon: '🌿',
        text: '少侠初临凡尘，小神在此指点修行要领。'
      },
      {
        speaker: '刘家村土地神',
        speakerTitle: '【两界山地仙】',
        speakerIcon: '🌿',
        text: '每日去【蟠桃园】可吃桃大增经验；亦可去【御马监】选门派专属坐骑（龙马/飞剑/狮子）。',
        options: [
          {
            text: '前往蟠桃园',
            action: (ctx) => ctx.loadMap?.('tiangong_pantao', { x: 10 * 32, y: 12 * 32 })
          },
          {
            text: '前往御马监',
            action: (ctx) => ctx.loadMap?.('tiangong_yuma', { x: 10 * 32, y: 15 * 32 })
          },
          {
            text: '返回居住地',
            action: (ctx) => ctx.teleportToResidence?.()
          },
          {
            text: '打听地势',
            action: (ctx) => ctx.showMessage?.('🌿 土地公：“左侧是五行山与鹰愁涧，右侧是大唐长安盛京，南边乃是陈塘关与东海浩瀚碧波！”')
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
            action: (ctx) => ctx.loadMap('tiangong_pantao')
          },
          {
            text: '【前往天宫·御马监 (训练坐骑)】',
            action: (ctx) => ctx.loadMap('tiangong_yuma')
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
            action: (ctx) => ctx.triggerHeavenBattle()
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
        action: (ctx) => ctx.executeBanishment()
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
        action: (ctx) => ctx.grantStarterItems()
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
        action: (ctx) => ctx.grantGuanyinGift()
      }
    ]
  },

  // === 第三章：五行山破封救大圣 ===
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
        action: (ctx) => ctx.releaseWukong()
      }
    ]
  },

  wuxing_freed: {
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
        action: (ctx) => ctx.joinWukongToParty()
      }
    ]
  },

  blacksmith_talk: {
    steps: [
      {
        speaker: '李铁匠',
        speakerTitle: '【神兵淬火】',
        speakerIcon: '🔨',
        text: '少侠！俺李铁匠世代在长安打造兵刃，只要有精铁强化石，包管给你打造出削铁如泥的神兵利器！'
      }
    ]
  },

  shop_talk: {
    steps: [
      {
        speaker: '万宝商贾',
        speakerTitle: '【百宝货铺】',
        speakerIcon: '🏮',
        text: '客观里面请！本店专营长安名药、金创药、大还丹、飞行符，童叟无欺，保你在西行路上安然无虞！'
      }
    ]
  },

  mountain_god_talk: {
    steps: [
      {
        speaker: '五行山土地神',
        speakerTitle: '【当方土地】',
        speakerIcon: '🌿',
        text: '小仙奉如来佛祖法旨在此监押大圣。饥时与他铁丸子吃，渴时与他溶铜汁饮。如今五百年之期已至，菩萨早言有缘人自会前来解厄。'
      }
    ]
  },

  qixiannv_talk: {
    steps: [
      {
        speaker: '红衣仙女',
        speakerTitle: '【采桃仙子】',
        speakerIcon: '🧚‍♀️',
        text: '将军！王母娘娘瑶池胜会正需鲜美仙桃，这满园红桃香气袭人，将军今日可曾采摘品尝了？'
      }
    ]
  }
};
