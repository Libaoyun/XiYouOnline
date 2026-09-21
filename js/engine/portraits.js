/**
 * 汉风西游 - 殿堂级国风艺术头像与立绘引擎 (MasterPortraitEngine 4.0)
 * 彻底废弃简陋简笔画！采用分层工笔重彩、细腻发丝发冠、神佛道妖专属背景法环与金丝浮雕边框
 * 覆盖全游戏 30+ 类核心角色、NPC 与三界野怪
 */

class MasterPortraitEngine {
  constructor() {
    this.dataUrlCache = {};
    this.roleIdAliases = {
      // 威灵神将
      'player_heaven': 'heaven_general',
      'player': 'heaven_general',
      'weiling': 'heaven_general',
      'weiling_dajiang': 'heaven_general',
      'char_player': 'heaven_general',
      // 少侠
      'player_mortal': 'martial_hero',
      'mortal_wanderer': 'martial_hero',
      'wanderer': 'martial_hero',
      'xia': 'martial_hero',
      // 熊猫
      'panda_hero': 'panda_hero',
      'panda_warrior': 'panda_hero',
      'panda': 'panda_hero',
      'xiong_mao': 'panda_hero',
      'xiongmao': 'panda_hero',
      'xiong_mao_xiong_meng': 'panda_hero',
      // 观音
      'guanyin_pusa': 'guanyin',
      'npc_guanyin': 'guanyin',
      'npc_guanyin_pusa': 'guanyin',
      // 大圣
      'wukong': 'sun_wukong',
      'qitian_dasheng': 'sun_wukong',
      'bimawen': 'sun_wukong',
      // 八戒与天蓬 (天宫为天蓬元帅神将，凡间为猪八戒)
      'bajie': 'zhu_bajie',
      'zhuganglie': 'zhu_bajie',
      'tianpeng': 'heaven_general',
      'tianpeng_marshal': 'heaven_general',
      'juling_shen': 'heaven_general',
      'npc_juling_shen': 'heaven_general',
      // 哪吒
      'nezha_child': 'nezha',
      'npc_nezha_child': 'nezha',
      // 李靖
      'litianwang': 'lijing',
      'npc_lijing_zongbing': 'lijing',
      // 太白
      'taibai_jinxing': 'taibai',
      'npc_taibai': 'taibai',
      // 玄奘
      'tang_seng': 'xuanzang',
      'tangseng': 'xuanzang',
      // 猎户
      'hunter': 'liuboqin',
      'npc_fisherman': 'fisherman',
      'fisherman_talk': 'fisherman',
      // 市井
      'npc_dangpu_boss': 'dangpu_boss',
      'dangpu': 'dangpu_boss',
      'npc_yaopu_boss': 'yaopu_boss',
      'yaopu': 'yaopu_boss',
      'shopkeeper': 'dangpu_boss',
      'npc_blacksmith': 'blacksmith',
      'tiejiang': 'blacksmith',
      'npc_cha_apo': 'cha_apo',
      'cha_apo': 'cha_apo',
      'apo': 'cha_apo',
      // 混混
      'hunhun': 'hooligan',
      'hun_hun': 'hooligan',
      'mob_hooligan': 'hooligan',
      'mob_hooligan_1': 'hooligan',
      'mob_hooligan_2': 'hooligan',
      'mob_hooligan_3': 'hooligan',
      // 怪物
      'mob_clam': 'clam',
      'mob_clam_group': 'clam',
      'mob_crab': 'crab',
      'mob_crab_1': 'crab',
      'mob_lobster_1': 'shrimp',
      'lobster': 'shrimp',
      'yelang': 'wolf',
      'wild_wolf': 'wolf',
      'baigujing': 'baigu_jing',
      'skeleton': 'baigu_jing',
      'heixiong': 'bear',
      'shuo_shu': 'rat',
      'giant_rat': 'rat',
      'pet_snake': 'snake'
    };
  }

  // 规范化角色标识
  normalizeRoleId(rawId, title = '') {
    if (!rawId) return 'heaven_general';
    const s = String(rawId).toLowerCase();
    const t = String(title).toLowerCase();

    // 优先映射表匹配
    if (this.roleIdAliases[s]) return this.roleIdAliases[s];

    // 名称与称号语义智能推断
    if (s.includes('观音') || s.includes('菩萨') || t.includes('观音')) return 'guanyin';
    if (s.includes('悟空') || s.includes('大圣') || s.includes('弼马温') || t.includes('齐天')) return 'sun_wukong';
    if (s.includes('哪吒') || s.includes('太子') || t.includes('哪吒')) return 'nezha';
    if (s.includes('李靖') || s.includes('托塔') || s.includes('天王') || t.includes('总兵')) return 'lijing';
    if (s.includes('太白') || s.includes('金星') || t.includes('金星')) return 'taibai';
    if (s.includes('玄奘') || s.includes('唐僧') || s.includes('三藏')) return 'xuanzang';
    if (s.includes('八戒') || s.includes('悟能') || s.includes('天蓬') || s.includes('猪刚鬣')) return 'zhu_bajie';
    if (s.includes('沙僧') || s.includes('悟净') || s.includes('卷帘')) return 'sha_wujing';
    if (s.includes('刘伯钦') || s.includes('猎户') || s.includes('太保')) return 'liuboqin';
    if (s.includes('铁匠') || s.includes('锻打') || s.includes('神兵')) return 'blacksmith';
    if (s.includes('茶肆') || s.includes('阿婆') || s.includes('老婆婆')) return 'cha_apo';
    if (s.includes('渔翁') || s.includes('老渔') || s.includes('钓鱼')) return 'fisherman';
    if (s.includes('当铺') || s.includes('账房') || s.includes('掌柜')) return 'dangpu_boss';
    if (s.includes('药铺') || s.includes('郎中') || s.includes('大夫')) return 'yaopu_boss';
    if (s.includes('土地') || s.includes('地仙')) return 'tudi';
    if (s.includes('混混') || s.includes('地痞') || s.includes('功夫')) return 'hooligan';
    if (s.includes('蚌') || s.includes('珍珠')) return 'clam';
    if (s.includes('蟹') || s.includes('金蟹')) return 'crab';
    if (s.includes('龙虾') || s.includes('虾兵') || s.includes('虾')) return 'shrimp';
    if (s.includes('狼') || s.includes('野狼') || s.includes('郊狼')) return 'wolf';
    if (s.includes('骨') || s.includes('尸') || s.includes('白骨')) return 'baigu_jing';
    if (s.includes('熊') || s.includes('黑风')) return 'bear';
    if (s.includes('鼠') || s.includes('硕鼠')) return 'rat';
    if (s.includes('蛇') || s.includes('青蛇')) return 'snake';
    if (s.includes('野猪') || s.includes('猪妖')) return 'pig';
    if (s.includes('铁扇') || s.includes('罗刹')) return 'tieshan';
    if (s.includes('熊猫') || s.includes('panda') || s.includes('道长')) return 'panda_hero';
    if (s.includes('菩提') || s.includes('祖师')) return 'puti_zushi';
    if (s.includes('大将') || s.includes('威灵') || s.includes('神将') || s.includes('heaven')) return 'heaven_general';
    if (s.includes('少侠') || s.includes('行者') || s.includes('剑侠') || s.includes('martial')) return 'martial_hero';

    return 'heaven_general';
  }

  // 获取角色的高清晰度图片 DataURL (带 LRU 内存缓存)
  getAvatarDataUrl(roleId, size = 100, options = {}) {
    const normId = this.normalizeRoleId(roleId, options.title);
    const cacheKey = `${normId}_${size}_${options.frame || 'gold'}`;
    if (this.dataUrlCache[cacheKey]) {
      return this.dataUrlCache[cacheKey];
    }

    // 离线高精度画布渲染 (采用 2x 物理像素确保 Retina 屏丝滑超清)
    const cvs = document.createElement('canvas');
    const scale = 2;
    cvs.width = size * scale;
    cvs.height = size * scale;
    const ctx = cvs.getContext('2d');
    ctx.scale(scale, scale);

    this.drawAvatarOnCanvas(ctx, normId, size, options);

    const dataUrl = cvs.toDataURL('image/png');
    this.dataUrlCache[cacheKey] = dataUrl;
    return dataUrl;
  }

  // 兼容原有接口，输出纯净的 <img> 标签或高清图像
  getPortraitSvg(roleId, size = 64, options = {}) {
    const dataUrl = this.getAvatarDataUrl(roleId, size, options);
    const border = options.noBorder ? 'none' : '2.5px solid #ffd700';
    const shadow = options.noShadow ? 'none' : '0 4px 14px rgba(0,0,0,0.85), inset 0 0 10px rgba(255,215,0,0.4)';
    return `<img src="${dataUrl}" width="${size}" height="${size}" class="master-game-avatar" style="display:block;border-radius:50%;border:${border};box-shadow:${shadow};object-fit:cover;" alt="${roleId}">`;
  }

  // 核心工笔重彩头像绘制方法
  drawAvatarOnCanvas(ctx, normId, size, options = {}) {
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 2;

    ctx.save();

    // 1. 圆形裁切区
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // 2. 根据角色阵营绘制精美背景
    this.drawBackground(ctx, normId, cx, cy, r, size);

    // 3. 绘制角色胸像与面部立绘
    this.drawCharacterBust(ctx, normId, cx, cy, r);

    // 4. 顶层环形暗角与立体流光
    const innerVig = ctx.createRadialGradient(cx, cy * 0.9, r * 0.65, cx, cy, r);
    innerVig.addColorStop(0, 'rgba(0,0,0,0)');
    innerVig.addColorStop(0.85, 'rgba(0,0,0,0.35)');
    innerVig.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = innerVig;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 5. 绘制外层纯金浮雕八宝护环
    if (!options.noBorder) {
      ctx.save();
      // 外圈金边
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // 内圈细金丝
      ctx.strokeStyle = 'rgba(255, 245, 157, 0.75)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 专属背景绘制
  drawBackground(ctx, roleId, cx, cy, r, size) {
    const bgGrad = ctx.createRadialGradient(cx, cy * 0.8, r * 0.1, cx, cy, r);

    if (roleId === 'heaven_general' || roleId === 'lijing' || roleId === 'taibai') {
      // 仙界神界：九霄金霞与祥云
      bgGrad.addColorStop(0, '#fef08a');
      bgGrad.addColorStop(0.4, '#f59e0b');
      bgGrad.addColorStop(0.8, '#b45309');
      bgGrad.addColorStop(1, '#451a03');
    } else if (roleId === 'guanyin' || roleId === 'xuanzang') {
      // 佛门圣域：七彩琉璃佛光宝相
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(0.3, '#bae6fd');
      bgGrad.addColorStop(0.7, '#0284c7');
      bgGrad.addColorStop(1, '#082f49');
    } else if (roleId === 'sun_wukong' || roleId === 'nezha') {
      // 神焰破天：烈火乾坤赤红
      bgGrad.addColorStop(0, '#fef08a');
      bgGrad.addColorStop(0.45, '#ef4444');
      bgGrad.addColorStop(0.8, '#991b1b');
      bgGrad.addColorStop(1, '#450a0a');
    } else if (roleId === 'clam' || roleId === 'crab' || roleId === 'shrimp' || roleId === 'fisherman') {
      // 东海深渊：碧蓝海潮与水华
      bgGrad.addColorStop(0, '#7dd3fc');
      bgGrad.addColorStop(0.45, '#0284c7');
      bgGrad.addColorStop(0.8, '#075985');
      bgGrad.addColorStop(1, '#082f49');
    } else if (roleId === 'baigu_jing' || roleId === 'wolf' || roleId === 'bear') {
      // 妖魔九幽：幽冥冷翠与紫黑煞气
      bgGrad.addColorStop(0, '#a7f3d0');
      bgGrad.addColorStop(0.4, '#059669');
      bgGrad.addColorStop(0.8, '#064e3b');
      bgGrad.addColorStop(1, '#022c22');
    } else {
      // 人间市井与武林豪侠：古铜暖褐锦缎
      bgGrad.addColorStop(0, '#d6d3d1');
      bgGrad.addColorStop(0.4, '#78716c');
      bgGrad.addColorStop(0.8, '#44403c');
      bgGrad.addColorStop(1, '#1c1917');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // 背景法环纹理
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.75, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 绘制各个角色的高精度半身立绘
  drawCharacterBust(ctx, roleId, cx, cy, r) {
    const s = r / 30; // 基准缩放单位

    switch (roleId) {
      // =========================================================================
      // 1. 威灵显赫大将军 (朱雀双翼金盔、冲天战翎长红缨、纯金锁子甲、八卦护心镜)
      // =========================================================================
      case 'heaven_general': {
        // 1. 迎风战袍大红披风
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, cy + 18 * s);
        ctx.lineTo(cx - 28 * s, cy + 32 * s);
        ctx.lineTo(cx + 28 * s, cy + 32 * s);
        ctx.lineTo(cx + 18 * s, cy + 18 * s);
        ctx.closePath();
        ctx.fill();

        // 2. 纯金明光锁子胸甲与双肩黄金兽首
        const armorGrad = ctx.createLinearGradient(cx, cy + 8 * s, cx, cy + 30 * s);
        armorGrad.addColorStop(0, '#fef08a');
        armorGrad.addColorStop(0.5, '#eab308');
        armorGrad.addColorStop(1, '#92400e');
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 15 * s, cy + 8 * s, 30 * s, 24 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();

        // 双肩黄金飞翼兽吞
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx - 16 * s, cy + 14 * s, 6 * s, 0, Math.PI * 2);
        ctx.arc(cx + 16 * s, cy + 14 * s, 6 * s, 0, Math.PI * 2);
        ctx.fill();

        // 胸前八卦纯银凸面护心镜
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy + 18 * s, 6.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5 * s;
        ctx.stroke();
        // 镜心晶莹蓝钻
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx, cy + 18 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // 3. 英武面容与修长颈项
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(cx - 4 * s, cy + 4 * s, 8 * s, 7 * s); // 颈
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * s, 10 * s, 0, Math.PI * 2);
        ctx.fill();

        // 剑眉星目
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(cx - 7 * s, cy - 5 * s);
        ctx.lineTo(cx - 2 * s, cy - 4.5 * s);
        ctx.lineTo(cx - 3 * s, cy - 3.5 * s);
        ctx.moveTo(cx + 2 * s, cy - 4.5 * s);
        ctx.lineTo(cx + 7 * s, cy - 5 * s);
        ctx.lineTo(cx + 3 * s, cy - 3.5 * s);
        ctx.fill();
        // 明亮双眼与高光
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(cx - 4.5 * s, cy - 1.5 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4.5 * s, cy - 1.5 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 4.8 * s, cy - 2.2 * s, 0.9 * s, 0.9 * s);
        ctx.fillRect(cx + 4.2 * s, cy - 2.2 * s, 0.9 * s, 0.9 * s);
        // 英挺鼻梁与微抿朱唇
        ctx.fillStyle = '#f97316';
        ctx.fillRect(cx - 0.5 * s, cy - 1 * s, 1 * s, 3.5 * s);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx - 2 * s, cy + 4 * s, 4 * s, 1.2 * s);

        // 4. 朱雀金翅飞天神盔
        const helmGrad = ctx.createLinearGradient(cx, cy - 16 * s, cx, cy - 4 * s);
        helmGrad.addColorStop(0, '#fef08a');
        helmGrad.addColorStop(0.6, '#eab308');
        helmGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = helmGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * s, 11 * s, Math.PI * 0.85, Math.PI * 2.15);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();

        // 左右展翅飞天金翼护耳
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(cx - 9 * s, cy - 7 * s);
        ctx.lineTo(cx - 18 * s, cy - 14 * s);
        ctx.lineTo(cx - 8 * s, cy - 2 * s);
        ctx.moveTo(cx + 9 * s, cy - 7 * s);
        ctx.lineTo(cx + 18 * s, cy - 14 * s);
        ctx.lineTo(cx + 8 * s, cy - 2 * s);
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // 耸立高扬的朱雀长翎战缨 (如火翻卷随风飞扬)
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3.6 * s;
        ctx.beginPath();
        ctx.moveTo(cx, cy - 16 * s);
        ctx.quadraticCurveTo(cx + 6 * s, cy - 26 * s, cx + 14 * s, cy - 28 * s);
        ctx.stroke();
        // 战翎尖端金羽流光
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1.6 * s;
        ctx.stroke();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(cx, cy - 16 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // =========================================================================
      // 2. 齐天大圣孙悟空 (凤翅紫金双长翎、金甲虎皮、火眼金睛)
      // =========================================================================
      case 'sun_wukong': {
        // 1. 锁子黄金甲与虎皮围领
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(cx - 16 * s, cy + 10 * s, 32 * s, 22 * s, 4 * s);
        ctx.fill();
        // 虎皮斑纹
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(cx - 8 * s, cy + 16 * s, 4 * s, 1.5 * s, -0.3, 0, Math.PI * 2);
        ctx.ellipse(cx + 8 * s, cy + 16 * s, 4 * s, 1.5 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 2. 美猴王金毫猴面
        ctx.fillStyle = '#fef3c7'; // 面颊白嫩
        ctx.beginPath();
        ctx.arc(cx, cy - 1 * s, 10 * s, 0, Math.PI * 2);
        ctx.fill();
        // 脸谱心形红晕
        ctx.fillStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.beginPath();
        ctx.arc(cx - 5 * s, cy - 1 * s, 4 * s, 0, Math.PI * 2);
        ctx.arc(cx + 5 * s, cy - 1 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();

        // 炽热火眼金睛 (金瞳赤眸神威)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(cx - 4.5 * s, cy - 2 * s, 3 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4.5 * s, cy - 2 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx - 4.5 * s, cy - 2 * s, 1.6 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4.5 * s, cy - 2 * s, 1.6 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 5 * s, cy - 3 * s, 1 * s, 1 * s);
        ctx.fillRect(cx + 4 * s, cy - 3 * s, 1 * s, 1 * s);

        // 桀骜勾唇笑意
        ctx.strokeStyle = '#991b1b';
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.arc(cx, cy + 2 * s, 3.5 * s, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // 3. 黄金紧箍与紫金冠
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * s, 9.5 * s, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        // 紧箍前额宝珠
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy - 12 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // 4. 凤翅紫金双长翎 (两根修长优美弧度高耸冲天翎羽)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.4 * s;
        ctx.beginPath();
        // 左翎
        ctx.moveTo(cx - 3 * s, cy - 12 * s);
        ctx.bezierCurveTo(cx - 16 * s, cy - 22 * s, cx - 22 * s, cy - 30 * s, cx - 18 * s, cy - 34 * s);
        // 右翎
        ctx.moveTo(cx + 3 * s, cy - 12 * s);
        ctx.bezierCurveTo(cx + 16 * s, cy - 22 * s, cx + 22 * s, cy - 30 * s, cx + 18 * s, cy - 34 * s);
        ctx.stroke();
        // 翎羽尖端红白翎眼
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx - 18 * s, cy - 34 * s, 2.2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 18 * s, cy - 34 * s, 2.2 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // =========================================================================
      // 3. 大慈大悲观世音菩萨 (白玉宝冠、璎珞天衣、七彩佛光、净瓶柳枝)
      // =========================================================================
      case 'guanyin': {
        // 1. 圣洁七彩琉璃佛轮与万道金光圆轮
        ctx.save();
        const haloGrad = ctx.createRadialGradient(cx, cy - 3 * s, 4 * s, cx, cy - 3 * s, 18 * s);
        haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        haloGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.7)');
        haloGrad.addColorStop(0.75, 'rgba(56, 189, 248, 0.4)');
        haloGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 3 * s, 18 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(cx, cy - 3 * s, 16 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 0.8 * s;
        ctx.beginPath();
        ctx.arc(cx, cy - 3 * s, 13 * s, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 2. 纯白如雪、轻盈如雾的披肩白纱天衣 (双肩如仙翼舒展垂落)
        const veilGrad = ctx.createLinearGradient(cx - 18 * s, cy, cx + 18 * s, cy + 28 * s);
        veilGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        veilGrad.addColorStop(0.5, 'rgba(240, 249, 255, 0.95)');
        veilGrad.addColorStop(1, 'rgba(224, 242, 254, 0.7)');
        ctx.fillStyle = veilGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, cy + 8 * s);
        ctx.quadraticCurveTo(cx - 24 * s, cy + 22 * s, cx - 18 * s, cy + 32 * s);
        ctx.lineTo(cx + 18 * s, cy + 32 * s);
        ctx.quadraticCurveTo(cx + 24 * s, cy + 22 * s, cx + 18 * s, cy + 8 * s);
        ctx.quadraticCurveTo(cx, cy + 18 * s, cx - 18 * s, cy + 8 * s);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.55)';
        ctx.lineWidth = 0.8 * s;
        ctx.stroke();

        // 3. 洁白云锦天衣与纯金璎珞神链
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(cx - 10 * s, cy + 6 * s, 20 * s, 26 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // 胸前纯金九宝长命璎珞
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.arc(cx, cy + 9 * s, 6.5 * s, 0, Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy + 15.5 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();

        // 4. 左手轻托羊脂玉净瓶与青翠杨柳枝 (特写前置圣物)
        const bottleGrad = ctx.createLinearGradient(cx - 14 * s, cy + 8 * s, cx - 8 * s, cy + 22 * s);
        bottleGrad.addColorStop(0, '#ffffff');
        bottleGrad.addColorStop(0.6, '#f0fdf4');
        bottleGrad.addColorStop(1, '#bbf7d0');
        ctx.fillStyle = bottleGrad;
        ctx.beginPath();
        ctx.ellipse(cx - 11 * s, cy + 16 * s, 3.8 * s, 5.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 12.5 * s, cy + 8.5 * s, 3 * s, 4 * s);
        ctx.strokeStyle = '#86efac';
        ctx.lineWidth = 0.8 * s;
        ctx.stroke();

        // 翠绿生机杨柳枝叶
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 11 * s, cy + 8.5 * s);
        ctx.quadraticCurveTo(cx - 16 * s, cy + 1 * s, cx - 18 * s, cy - 4 * s);
        ctx.stroke();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(cx - 16 * s, cy + 2 * s, 3 * s, 1.2 * s, -0.6, 0, Math.PI * 2);
        ctx.ellipse(cx - 18.5 * s, cy - 3.5 * s, 2.8 * s, 1.1 * s, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // 托瓶纤纤玉手
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(cx - 8 * s, cy + 17 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // 5. 端庄慈悲圣容 (实机同款紫发仙容、眉心朱砂印)
        // 白皙如玉面庞
        const faceGrad = ctx.createRadialGradient(cx, cy - 2 * s, 2 * s, cx, cy - 2 * s, 10 * s);
        faceGrad.addColorStop(0, '#ffffff');
        faceGrad.addColorStop(0.8, '#fef3c7');
        faceGrad.addColorStop(1, '#fde68a');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * s, 9.8 * s, 0, Math.PI * 2);
        ctx.fill();

        // 高耸巍峨的紫云仙发髻 (实机高贵紫红仙发)
        const hairGrad = ctx.createLinearGradient(cx, cy - 18 * s, cx, cy - 6 * s);
        hairGrad.addColorStop(0, '#701a75');
        hairGrad.addColorStop(0.5, '#86198f');
        hairGrad.addColorStop(1, '#4a044e');
        ctx.fillStyle = hairGrad;
        ctx.beginPath();
        ctx.moveTo(cx - 9.5 * s, cy - 5 * s);
        ctx.quadraticCurveTo(cx - 12 * s, cy - 14 * s, cx - 6 * s, cy - 18 * s);
        ctx.lineTo(cx + 6 * s, cy - 18 * s);
        ctx.quadraticCurveTo(cx + 12 * s, cy - 14 * s, cx + 9.5 * s, cy - 5 * s);
        ctx.closePath();
        ctx.fill();

        // 七宝金凤玲珑佛冠 (纯金宝冠，冠顶嵌水蓝灵珠)
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(-8 * s + cx, cy - 10 * s);
        ctx.lineTo(8 * s + cx, cy - 10 * s);
        ctx.lineTo(5.5 * s + cx, cy - 17 * s);
        ctx.lineTo(0 + cx, cy - 20 * s);
        ctx.lineTo(-5.5 * s + cx, cy - 17 * s);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 0.8 * s;
        ctx.stroke();
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx, cy - 14 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();

        // 圣洁五官：柳叶细眉、慈悲眼目、眉心朱砂印、微抿朱唇
        ctx.fillStyle = '#ef4444'; // 眉心朱砂痣
        ctx.beginPath();
        ctx.arc(cx, cy - 4 * s, 1.4 * s, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#4a044e';
        ctx.lineWidth = 1 * s;
        // 慈悲微阖长睫双目
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 1.2 * s, 2 * s, 0.1, Math.PI * 0.9);
        ctx.arc(cx + 4 * s, cy - 1.2 * s, 2 * s, 0.1, Math.PI * 0.9);
        ctx.stroke();

        ctx.fillStyle = '#f43f5e'; // 樱桃含笑朱唇
        ctx.beginPath();
        ctx.arc(cx, cy + 3.2 * s, 1.6 * s, 0, Math.PI);
        ctx.fill();
        break;
      }

      case 'martial_hero': {
        // 1. 玄青云锦战袍劲装
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(cx - 15 * s, cy + 10 * s, 30 * s, 22 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
        // 羊脂白玉佩吊坠
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 8 * s, cy + 18 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();

        // 2. 俊美少侠容颜与星眸
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx, cy - 1 * s, 9.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // 剑眉入鬓
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(cx - 7 * s, cy - 4.5 * s);
        ctx.lineTo(cx - 2 * s, cy - 4 * s);
        ctx.moveTo(cx + 2 * s, cy - 4 * s);
        ctx.lineTo(cx + 7 * s, cy - 4.5 * s);
        ctx.stroke();
        // 少年意气星目
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 1 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4 * s, cy - 1 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 4.2 * s, cy - 1.8 * s, 0.8 * s, 0.8 * s);
        ctx.fillRect(cx + 3.8 * s, cy - 1.8 * s, 0.8 * s, 0.8 * s);

        // 3. 浓密黑发与紫金束发冠
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(cx, cy - 6 * s, 10 * s, Math.PI * 0.85, Math.PI * 2.15);
        ctx.fill();
        // 飘逸两鬓垂发
        ctx.fillRect(cx - 9 * s, cy - 4 * s, 2 * s, 8 * s);
        ctx.fillRect(cx + 7 * s, cy - 4 * s, 2 * s, 8 * s);

        // 紫金透雕发冠
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, cy - 12 * s);
        ctx.lineTo(cx + 5 * s, cy - 12 * s);
        ctx.lineTo(cx + 4 * s, cy - 20 * s);
        ctx.lineTo(cx - 4 * s, cy - 20 * s);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1 * s;
        ctx.stroke();
        // 白玉簪横贯
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * s, cy - 16 * s);
        ctx.lineTo(cx + 8 * s, cy - 16 * s);
        ctx.stroke();
        break;
      }

      // =========================================================================
      // 5. 功夫地痞混混 (额系白护额、赤膊结实肌肉、桀骜坏笑、拳风烈烈)
      // =========================================================================
      case 'hooligan': {
        // 1. 赤膊健硕古铜色胸膛与分块胸腹肌 (实机精悍少侠身材)
        const skinGrad = ctx.createLinearGradient(cx - 18 * s, cy + 8 * s, cx + 18 * s, cy + 32 * s);
        skinGrad.addColorStop(0, '#f59e0b');
        skinGrad.addColorStop(0.5, '#d97706');
        skinGrad.addColorStop(1, '#b45309');
        ctx.fillStyle = skinGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 17 * s, cy + 9 * s, 34 * s, 23 * s, 5 * s);
        ctx.fill();

        // 胸肌与锁骨立体线条
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.3 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * s, cy + 12 * s); ctx.lineTo(cx, cy + 14 * s); ctx.lineTo(cx + 8 * s, cy + 12 * s);
        ctx.moveTo(cx, cy + 14 * s); ctx.lineTo(cx, cy + 26 * s);
        ctx.moveTo(cx - 7 * s, cy + 19 * s); ctx.lineTo(cx, cy + 21 * s); ctx.lineTo(cx + 7 * s, cy + 19 * s);
        ctx.stroke();

        // 双肩肌肉与纯白练功手缠带
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 17 * s, cy + 22 * s, 6 * s, 8 * s);
        ctx.fillRect(cx + 11 * s, cy + 22 * s, 6 * s, 8 * s);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8 * s;
        ctx.strokeRect(cx - 17 * s, cy + 22 * s, 6 * s, 8 * s);
        ctx.strokeRect(cx + 11 * s, cy + 22 * s, 6 * s, 8 * s);

        // 2. 桀骜英气的江湖小混混容颜 (健康古铜肤色)
        const faceGrad = ctx.createRadialGradient(cx, cy - 2 * s, 2 * s, cx, cy - 2 * s, 11 * s);
        faceGrad.addColorStop(0, '#fde68a');
        faceGrad.addColorStop(0.6, '#f59e0b');
        faceGrad.addColorStop(1, '#d97706');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * s, 10.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // 3. 实机核心特征：额头白护额、黑色方印与【双侧飞扬的长飘带】！
        // 额头宽白系带
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 11 * s, cy - 8 * s, 22 * s, 5.5 * s);
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 1 * s;
        ctx.strokeRect(cx - 11 * s, cy - 8 * s, 22 * s, 5.5 * s);

        // 额头正中黑色方块印章
        ctx.fillStyle = '#18181b';
        ctx.fillRect(cx - 2.5 * s, cy - 6.8 * s, 5 * s, 3.5 * s);

        // 脑后黑色短发与发髻小马尾
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * s, 10.5 * s, Math.PI * 0.85, Math.PI * 2.15);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, cy - 8 * s);
        ctx.quadraticCurveTo(cx - 14 * s, cy - 14 * s, cx - 15 * s, cy - 7 * s);
        ctx.quadraticCurveTo(cx - 11 * s, cy - 6 * s, cx - 6 * s, cy - 6 * s);
        ctx.fill();

        // ★★★ 实机精髓：白额带左右两侧飞扬飘逸的丝带结！★★★
        ctx.fillStyle = '#ffffff';
        // 右侧向后上方飞舞长带
        ctx.beginPath();
        ctx.moveTo(cx + 10.5 * s, cy - 6.5 * s);
        ctx.quadraticCurveTo(cx + 17 * s, cy - 11 * s, cx + 24 * s, cy - 6 * s);
        ctx.lineTo(cx + 22 * s, cy - 3 * s);
        ctx.quadraticCurveTo(cx + 16 * s, cy - 7 * s, cx + 10.5 * s, cy - 4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8 * s;
        ctx.stroke();

        // 左侧向后下方轻扬长带
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx - 10.5 * s, cy - 6.5 * s);
        ctx.quadraticCurveTo(cx - 17 * s, cy - 3 * s, cx - 23 * s, cy + 2 * s);
        ctx.lineTo(cx - 21 * s, cy + 5 * s);
        ctx.quadraticCurveTo(cx - 16 * s, cy - 1 * s, cx - 10.5 * s, cy - 4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 4. 生动英气的痞帅五官：倒竖挑眉、深邃大眼、坏笑歪嘴
        // 浓黑挑眉
        ctx.strokeStyle = '#18181b';
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 7 * s, cy - 4 * s); ctx.lineTo(cx - 1.5 * s, cy - 2.5 * s);
        ctx.moveTo(cx + 1.5 * s, cy - 3.5 * s); ctx.lineTo(cx + 7 * s, cy - 5 * s);
        ctx.stroke();

        // 炯炯有神大眼睛与高光
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 0.5 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4 * s, cy - 0.5 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 4.8 * s, cy - 1.3 * s, 1.1 * s, 1.1 * s);
        ctx.fillRect(cx + 3.2 * s, cy - 1.3 * s, 1.1 * s, 1.1 * s);

        // 痞笑嘴角
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 2.5 * s, cy + 4 * s);
        ctx.quadraticCurveTo(cx + 2 * s, cy + 5.5 * s, cx + 4.5 * s, cy + 3.2 * s);
        ctx.stroke();
        break;
      }

      case 'clam': {
        // 1. 碧蓝海潮与金黄珊瑚海草背景
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5 * s;
        ctx.beginPath();
        ctx.moveTo(cx + 12 * s, cy + 18 * s);
        ctx.lineTo(cx + 17 * s, cy + 4 * s);
        ctx.lineTo(cx + 14 * s, cy - 4 * s);
        ctx.moveTo(cx + 17 * s, cy + 4 * s);
        ctx.lineTo(cx + 22 * s, cy);
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 14 * s, cy + 18 * s);
        ctx.quadraticCurveTo(cx - 18 * s, cy + 6 * s, cx - 15 * s, cy - 5 * s);
        ctx.stroke();

        // 2. 左后侧翡翠小蚌
        ctx.fillStyle = '#065f46';
        ctx.beginPath();
        ctx.ellipse(cx - 11 * s, cy + 8 * s, 10 * s, 7 * s, -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // 3. 中央主尊东海神蚌 (深蓝紫到暗夜海蓝渐变扇贝)
        // 下壳
        const lowerGrad = ctx.createLinearGradient(cx - 20 * s, cy, cx + 20 * s, cy + 22 * s);
        lowerGrad.addColorStop(0, '#1e1b4b');
        lowerGrad.addColorStop(0.5, '#312e81');
        lowerGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = lowerGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 12 * s, 21 * s, 12 * s, 0, 0, Math.PI);
        ctx.fill();
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();

        // 蚌肉与内壁温润珍珠贝母光
        const meatGrad = ctx.createRadialGradient(cx, cy + 8 * s, 2 * s, cx, cy + 8 * s, 16 * s);
        meatGrad.addColorStop(0, '#fdf2f8');
        meatGrad.addColorStop(0.5, '#fbcfe8');
        meatGrad.addColorStop(0.85, '#f472b6');
        meatGrad.addColorStop(1, '#831843');
        ctx.fillStyle = meatGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 8.5 * s, 16 * s, 7.5 * s, 0, 0, Math.PI * 2);
        ctx.fill();

        // 4. 核心至宝：散发温润晶莹神光的东海夜明神珠
        const pGlow = ctx.createRadialGradient(cx, cy + 6 * s, 1 * s, cx, cy + 6 * s, 13 * s);
        pGlow.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        pGlow.addColorStop(0.4, 'rgba(56, 189, 248, 0.7)');
        pGlow.addColorStop(0.8, 'rgba(14, 165, 233, 0.25)');
        pGlow.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(cx, cy + 6 * s, 13 * s, 0, Math.PI * 2);
        ctx.fill();

        // 珍珠实体
        const pearlGrad = ctx.createRadialGradient(cx - 2 * s, cy + 3.5 * s, 1 * s, cx, cy + 6 * s, 6.5 * s);
        pearlGrad.addColorStop(0, '#ffffff');
        pearlGrad.addColorStop(0.4, '#f0fdf4');
        pearlGrad.addColorStop(0.75, '#bae6fd');
        pearlGrad.addColorStop(1, '#38bdf8');
        ctx.fillStyle = pearlGrad;
        ctx.beginPath();
        ctx.arc(cx, cy + 6 * s, 6.2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx - 2.2 * s, cy + 3.8 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();

        // 5. 上半张开的扇贝硬壳 (放射凹凸棱纹)
        const upperGrad = ctx.createLinearGradient(cx, cy - 18 * s, cx, cy + 2 * s);
        upperGrad.addColorStop(0, '#3730a3');
        upperGrad.addColorStop(0.5, '#4338ca');
        upperGrad.addColorStop(0.85, '#6366f1');
        upperGrad.addColorStop(1, '#a5b4fc');
        ctx.fillStyle = upperGrad;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 * s, 20 * s, 15 * s, 0, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = '#c7d2fe';
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();

        // 放射棱肋
        ctx.strokeStyle = '#1e1b4b';
        ctx.lineWidth = 1.2 * s;
        for (let a = 0.18; a <= 0.82; a += 0.16) {
          ctx.beginPath();
          ctx.moveTo(cx, cy + 2 * s);
          ctx.lineTo(cx + Math.cos(a * Math.PI) * 19.5 * s, cy + 2 * s - Math.sin(a * Math.PI) * 14.5 * s);
          ctx.stroke();
        }
        break;
      }

      case 'crab': {
        // 1. 黄金重装大螯
        const clawGrad = ctx.createLinearGradient(cx - 20 * s, cy, cx + 20 * s, cy);
        clawGrad.addColorStop(0, '#f59e0b');
        clawGrad.addColorStop(0.5, '#ef4444');
        clawGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = clawGrad;
        // 左螯
        ctx.beginPath();
        ctx.ellipse(cx - 16 * s, cy - 2 * s, 8 * s, 12 * s, -0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();
        // 右螯
        ctx.beginPath();
        ctx.ellipse(cx + 16 * s, cy - 2 * s, 8 * s, 12 * s, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 2. 青铜重甲金甲蟹身
        const bodyGrad = ctx.createRadialGradient(cx, cy + 8 * s, 2 * s, cx, cy + 8 * s, 16 * s);
        bodyGrad.addColorStop(0, '#fef08a');
        bodyGrad.addColorStop(0.4, '#eab308');
        bodyGrad.addColorStop(1, '#1e3a5f');
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 15 * s, cy, 30 * s, 20 * s, 8 * s);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.6 * s;
        ctx.stroke();

        // 3. 直立血红凶猛复眼
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx - 6 * s, cy - 5 * s, 3.2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 6 * s, cy - 5 * s, 3.2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 7 * s, cy - 6 * s, 1.2 * s, 1.2 * s);
        ctx.fillRect(cx + 5 * s, cy - 6 * s, 1.2 * s, 1.2 * s);
        break;
      }

      // =========================================================================
      // 8. 巡海大龙虾 / 虾兵 (红甲长须、钢叉利矛、威猛海将)
      // =========================================================================
      case 'shrimp': {
        // 1. 朱红甲胄身躯
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.roundRect(cx - 12 * s, cy + 6 * s, 24 * s, 24 * s, 6 * s);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();

        // 2. 龙虾头盔与长触须
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(cx - 8 * s, cy + 6 * s);
        ctx.lineTo(cx, cy - 10 * s);
        ctx.lineTo(cx + 8 * s, cy + 6 * s);
        ctx.closePath();
        ctx.fill();

        // 威猛金色双长须
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, cy - 8 * s);
        ctx.quadraticCurveTo(cx - 18 * s, cy - 22 * s, cx - 12 * s, cy - 28 * s);
        ctx.moveTo(cx + 2 * s, cy - 8 * s);
        ctx.quadraticCurveTo(cx + 18 * s, cy - 22 * s, cx + 12 * s, cy - 28 * s);
        ctx.stroke();

        // 圆圆黑目
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 2 * s, 2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4 * s, cy - 2 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // =========================================================================
      // 9. 长安城当铺老板 / 掌柜 (金线黑锦员外方帽、和气生财长髯、富贵笑容)
      // =========================================================================
      case 'dangpu_boss': {
        // 1. 紫金富贵绸缎大袍
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.roundRect(cx - 16 * s, cy + 10 * s, 32 * s, 22 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();

        // 2. 和气生财富态圆脸
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx, cy, 11 * s, 0, Math.PI * 2);
        ctx.fill();

        // 眯眯眼喜庆笑容
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5 * s;
        ctx.beginPath();
        ctx.arc(cx - 5 * s, cy - 1 * s, 2.5 * s, Math.PI * 0.15, Math.PI * 0.85);
        ctx.arc(cx + 5 * s, cy - 1 * s, 2.5 * s, Math.PI * 0.15, Math.PI * 0.85);
        ctx.stroke();
        // 喜乐笑口
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx, cy + 4 * s, 3 * s, 0, Math.PI);
        ctx.fill();

        // 飘逸三绺墨黑美髯胡须
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, cy + 6 * s);
        ctx.lineTo(cx, cy + 18 * s);
        ctx.lineTo(cx + 4 * s, cy + 6 * s);
        ctx.closePath();
        ctx.fill();

        // 3. 黑缎金边员外方帽 (正中镶嵌红玛瑙宝珠)
        ctx.fillStyle = '#18181b';
        ctx.fillRect(cx - 10 * s, cy - 15 * s, 20 * s, 9 * s);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.2 * s;
        ctx.strokeRect(cx - 10 * s, cy - 15 * s, 20 * s, 9 * s);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * s, 2.2 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // =========================================================================
      // 10. 药铺老板 / 悬壶郎中 (紫云道服、悬壶葫芦、银白美髯)
      // =========================================================================
      case 'yaopu_boss': {
        // 1. 悬壶济世青紫锦袍
        ctx.fillStyle = '#4338ca';
        ctx.beginPath();
        ctx.roundRect(cx - 16 * s, cy + 10 * s, 32 * s, 22 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();

        // 2. 慈祥名医长髯面庞
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx, cy - 1 * s, 10 * s, 0, Math.PI * 2);
        ctx.fill();

        // 雪白慈祥长须
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, cy + 4 * s);
        ctx.lineTo(cx, cy + 20 * s);
        ctx.lineTo(cx + 5 * s, cy + 4 * s);
        ctx.closePath();
        ctx.fill();

        // 温和带笑双眸
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 2 * s, 2 * s, 0.2, Math.PI - 0.2);
        ctx.arc(cx + 4 * s, cy - 2 * s, 2 * s, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // 3. 悬壶紫金小葫芦
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx + 12 * s, cy + 14 * s, 2.8 * s, 0, Math.PI * 2);
        ctx.arc(cx + 12 * s, cy + 19 * s, 4.2 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // =========================================================================
      // 11. 神兵淬火李铁匠 (赤膊健硕、额系红汗巾、坚毅古铜面庞)
      // =========================================================================
      case 'blacksmith': {
        // 1. 赤膊古铜色健硕胸膛与工匠皮围裙
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.roundRect(cx - 16 * s, cy + 8 * s, 32 * s, 24 * s, 4 * s);
        ctx.fill();
        ctx.fillStyle = '#78350f'; // 皮围裙
        ctx.fillRect(cx - 10 * s, cy + 14 * s, 20 * s, 18 * s);

        // 2. 沧桑坚毅面容与短胡渣
        ctx.fillStyle = '#fdba74';
        ctx.beginPath();
        ctx.arc(cx, cy - 1 * s, 10 * s, 0, Math.PI * 2);
        ctx.fill();
        // 络腮短须
        ctx.fillStyle = 'rgba(24, 24, 27, 0.45)';
        ctx.beginPath();
        ctx.arc(cx, cy + 3 * s, 7 * s, 0, Math.PI);
        ctx.fill();

        // 坚毅如铁双眸
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 4.5 * s, cy - 1 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4.5 * s, cy - 1 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();

        // 3. 额系大红工匠汗巾
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx - 10 * s, cy - 7 * s, 20 * s, 4.5 * s);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1 * s;
        ctx.strokeRect(cx - 10 * s, cy - 7 * s, 20 * s, 4.5 * s);
        break;
      }

      // =========================================================================
      // 12. 长安茶肆阿婆 (慈祥银发、布巾束发、和蔼市井笑容)
      // =========================================================================
      case 'cha_apo': {
        // 1. 青褐布衣
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(cx - 15 * s, cy + 10 * s, 30 * s, 22 * s, 6 * s);
        ctx.fill();

        // 2. 慈祥老妇人容颜
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
        ctx.fill();

        // 银白整洁发髻与青布头巾
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * s, 9 * s, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(cx - 9 * s, cy - 9 * s, 18 * s, 4 * s);

        // 和蔼弯弯眉眼
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 1 * s, 2.2 * s, 0.1, Math.PI - 0.1);
        ctx.arc(cx + 4 * s, cy - 1 * s, 2.2 * s, 0.1, Math.PI - 0.1);
        ctx.stroke();
        break;
      }

      // =========================================================================
      // 13. 陈塘关海滨老渔翁 (蓑衣斗笠、银须飘拂、海风苍茫)
      // =========================================================================
      case 'fisherman': {
        // 1. 蓑衣
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(cx - 15 * s, cy + 10 * s, 30 * s, 22 * s, 4 * s);
        ctx.fill();

        // 2. 沧桑古铜容颜与飘拂长白须
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(cx, cy, 9.5 * s, 0, Math.PI * 2);
        ctx.fill();
        // 银白长须
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, cy + 5 * s);
        ctx.lineTo(cx, cy + 18 * s);
        ctx.lineTo(cx + 4 * s, cy + 5 * s);
        ctx.closePath();
        ctx.fill();

        // 3. 宽檐竹丝斗笠
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(cx - 18 * s, cy - 4 * s);
        ctx.lineTo(cx, cy - 18 * s);
        ctx.lineTo(cx + 18 * s, cy - 4 * s);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();
        break;
      }

      // =========================================================================
      // 14. 哪吒三太子 (双丫乾坤红绳童子髻、乾坤圈金光、混天绫烈火)
      // =========================================================================
      case 'nezha': {
        // 1. 莲花战裙与混天绫翻滚
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.roundRect(cx - 15 * s, cy + 10 * s, 30 * s, 22 * s, 4 * s);
        ctx.fill();
        // 黄金乾坤圈斜挂胸前
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.4 * s;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 18 * s, 9 * s, 5 * s, -0.3, 0, Math.PI * 2);
        ctx.stroke();

        // 2. 唇红齿白灵童面容
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx, cy - 1 * s, 9.5 * s, 0, Math.PI * 2);
        ctx.fill();
        // 眉心一点朱砂灵印
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(cx, cy - 3 * s, 1.3 * s, 0, Math.PI * 2);
        ctx.fill();
        // 英武明亮双眸
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 1 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4 * s, cy - 1 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();

        // 3. 双丫童子髻与大红发绳
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(cx - 8 * s, cy - 12 * s, 4.5 * s, 0, Math.PI * 2);
        ctx.arc(cx + 8 * s, cy - 12 * s, 4.5 * s, 0, Math.PI * 2);
        ctx.fill();
        // 红绳金铃
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx - 10 * s, cy - 10 * s, 5 * s, 2.5 * s);
        ctx.fillRect(cx + 5 * s, cy - 10 * s, 5 * s, 2.5 * s);
        break;
      }

      // =========================================================================
      // 15. 李靖总兵 / 托塔李天王 (金甲赤袍、五绺长髯、玲珑宝塔)
      // =========================================================================
      case 'lijing': {
        // 1. 威武金铠
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(cx - 16 * s, cy + 10 * s, 32 * s, 22 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();

        // 2. 帅印主将尊严长髯
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * s, 10 * s, 0, Math.PI * 2);
        ctx.fill();
        // 浓黑美髯
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, cy + 4 * s);
        ctx.lineTo(cx, cy + 20 * s);
        ctx.lineTo(cx + 6 * s, cy + 4 * s);
        ctx.closePath();
        ctx.fill();

        // 威严虎目
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 4.5 * s, cy - 2 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4.5 * s, cy - 2 * s, 1.8 * s, 0, Math.PI * 2);
        ctx.fill();

        // 3. 帅印金盔
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * s, 10 * s, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();

        // 4. 手中托起七宝玲珑黄金宝塔
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(cx + 11 * s, cy + 10 * s);
        ctx.lineTo(cx + 14 * s, cy + 2 * s);
        ctx.lineTo(cx + 17 * s, cy + 10 * s);
        ctx.closePath();
        ctx.fill();
        break;
      }

      // =========================================================================
      // 16. 太白金星 (鹤发童颜、飘逸白须、道冠拂尘)
      // =========================================================================
      case 'taibai': {
        // 1. 白鹤羽衣仙袍
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(cx - 16 * s, cy + 10 * s, 32 * s, 22 * s, 5 * s);
        ctx.fill();
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();

        // 2. 慈祥仙颜与飘逸雪髯
        ctx.fillStyle = '#fffbeb';
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * s, 10 * s, 0, Math.PI * 2);
        ctx.fill();
        // 飘拂雪白长须
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx - 6 * s, cy + 3 * s);
        ctx.lineTo(cx, cy + 22 * s);
        ctx.lineTo(cx + 6 * s, cy + 3 * s);
        ctx.closePath();
        ctx.fill();

        // 慈祥微笑眉眼
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 2 * s, 2 * s, 0.1, Math.PI - 0.1);
        ctx.arc(cx + 4 * s, cy - 2 * s, 2 * s, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // 3. 道家太极金冠
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(cx, cy - 10 * s, 5 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // =========================================================================
      // 17. 天蓬元帅猪八戒 (玄铁黑金重甲、大耳长嘴、霸气豪爽)
      // =========================================================================
      case 'zhu_bajie': {
        // 1. 玄铁黑铠
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(cx - 16 * s, cy + 10 * s, 32 * s, 22 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.4 * s;
        ctx.stroke();

        // 2. 硕大长耳与福态面庞
        ctx.fillStyle = '#fed7aa';
        ctx.beginPath();
        ctx.arc(cx, cy, 11 * s, 0, Math.PI * 2);
        ctx.fill();
        // 左右标志蒲扇大耳
        ctx.beginPath();
        ctx.ellipse(cx - 13 * s, cy, 5 * s, 9 * s, -0.3, 0, Math.PI * 2);
        ctx.ellipse(cx + 13 * s, cy, 5 * s, 9 * s, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // 猪鼻与小圆眼
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 2 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(cx - 1.5 * s, cy + 2 * s, 1 * s, 0, Math.PI * 2);
        ctx.arc(cx + 1.5 * s, cy + 2 * s, 1 * s, 0, Math.PI * 2);
        ctx.fill();

        // 3. 帅气僧帽僧箍
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(cx - 8 * s, cy - 12 * s, 16 * s, 4 * s);
        break;
      }

      // =========================================================================
      // 18. 玄天太极熊猫道长 (太极道冠、黑白分明软萌威武)
      // =========================================================================
      case 'panda_hero': {
        // 1. 后背斜出的青翠鲜嫩竹枝与竹筒 (实机标志性翠竹)
        ctx.save();
        ctx.translate(cx - 16 * s, cy - 8 * s);
        ctx.rotate(-0.25);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.roundRect(-4 * s, -2 * s, 8 * s, 22 * s, 2.5 * s);
        ctx.fill();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 0.9 * s;
        ctx.stroke();
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(-4.5 * s, 4 * s, 9 * s, 2.5 * s);

        // 鲜嫩青翠竹叶簇
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.moveTo(-2 * s, -2 * s);
        ctx.quadraticCurveTo(-10 * s, -9 * s, -14 * s, -7 * s);
        ctx.quadraticCurveTo(-7 * s, -4 * s, 0, -2 * s);
        ctx.fill();
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.moveTo(0, -2 * s);
        ctx.quadraticCurveTo(-2 * s, -14 * s, 0, -20 * s);
        ctx.quadraticCurveTo(3 * s, -11 * s, 2 * s, -2 * s);
        ctx.fill();
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.moveTo(2 * s, -2 * s);
        ctx.quadraticCurveTo(8 * s, -10 * s, 13 * s, -8 * s);
        ctx.quadraticCurveTo(7 * s, -4 * s, 2 * s, -2 * s);
        ctx.fill();
        ctx.restore();

        // 2. 经典国风天青蓝武士锦袍与白云斜襟 (实机蓝白大侠袍)
        const robeGrad = ctx.createLinearGradient(cx - 18 * s, cy + 8 * s, cx + 18 * s, cy + 32 * s);
        robeGrad.addColorStop(0, '#0284c7');
        robeGrad.addColorStop(0.5, '#0369a1');
        robeGrad.addColorStop(1, '#075985');
        ctx.fillStyle = robeGrad;
        ctx.beginPath();
        ctx.roundRect(cx - 17 * s, cy + 9 * s, 34 * s, 23 * s, 6 * s);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.2 * s;
        ctx.stroke();

        // 白色斜襟交领内衬
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(cx - 7 * s, cy + 9 * s);
        ctx.lineTo(cx, cy + 18 * s);
        ctx.lineTo(cx + 8 * s, cy + 9 * s);
        ctx.lineTo(cx + 4 * s, cy + 9 * s);
        ctx.lineTo(cx, cy + 15 * s);
        ctx.lineTo(cx - 4 * s, cy + 9 * s);
        ctx.closePath();
        ctx.fill();

        // 棕黄皮革宽腰带与纯金腰扣
        ctx.fillStyle = '#78350f';
        ctx.fillRect(cx - 17 * s, cy + 21 * s, 34 * s, 5 * s);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(cx - 4 * s, cy + 20 * s, 8 * s, 7 * s);

        // 3. 圆润萌态国宝大熊猫特写 (实机经典Q版武侠大熊猫)
        // 圆滚滚黑毛双耳 (外深黑内耳窝粉灰)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 11 * s, cy - 13 * s, 5.5 * s, 0, Math.PI * 2);
        ctx.arc(cx + 11 * s, cy - 13 * s, 5.5 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(cx - 11 * s, cy - 13 * s, 3 * s, 0, Math.PI * 2);
        ctx.arc(cx + 11 * s, cy - 13 * s, 3 * s, 0, Math.PI * 2);
        ctx.fill();

        // 纯白圆润大脸庞
        const faceGrad = ctx.createRadialGradient(cx, cy - 2 * s, 2 * s, cx, cy - 2 * s, 13 * s);
        faceGrad.addColorStop(0, '#ffffff');
        faceGrad.addColorStop(0.85, '#f8fafc');
        faceGrad.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = faceGrad;
        ctx.beginPath();
        ctx.arc(cx, cy - 2 * s, 13 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // 标志性倾斜下垂水滴黑眼圈
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.ellipse(cx - 5.8 * s, cy - 2.5 * s, 4.2 * s, 5.5 * s, -0.38, 0, Math.PI * 2);
        ctx.ellipse(cx + 5.8 * s, cy - 2.5 * s, 4.2 * s, 5.5 * s, 0.38, 0, Math.PI * 2);
        ctx.fill();

        // 灵动水蓝眼珠与晶莹纯白高光 (点睛神采)
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx - 5 * s, cy - 2.5 * s, 2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 5 * s, cy - 2.5 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(cx - 5 * s, cy - 2.5 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 5 * s, cy - 2.5 * s, 1.2 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 5.8 * s, cy - 3.4 * s, 1.3 * s, 1.3 * s);
        ctx.fillRect(cx + 4.2 * s, cy - 3.4 * s, 1.3 * s, 1.3 * s);

        // 黑色倒三角小鼻头与微笑三瓣嘴
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(cx, cy + 1.8 * s);
        ctx.lineTo(cx - 2.5 * s, cy);
        ctx.lineTo(cx + 2.5 * s, cy);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.1 * s;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 1.8 * s); ctx.lineTo(cx, cy + 3.8 * s);
        ctx.moveTo(cx, cy + 3.8 * s); ctx.quadraticCurveTo(cx - 3.5 * s, cy + 5.5 * s, cx - 5.5 * s, cy + 3.2 * s);
        ctx.moveTo(cx, cy + 3.8 * s); ctx.quadraticCurveTo(cx + 3.5 * s, cy + 5.5 * s, cx + 5.5 * s, cy + 3.2 * s);
        ctx.stroke();

        // 脸颊微粉腮红
        ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
        ctx.beginPath();
        ctx.arc(cx - 8.5 * s, cy + 2 * s, 2.2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 8.5 * s, cy + 2 * s, 2.2 * s, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'baigu_jing': {
        // 1. 幽黑妖仙长裙
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.roundRect(cx - 15 * s, cy + 10 * s, 30 * s, 22 * s, 4 * s);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1 * s;
        ctx.stroke();

        // 2. 绝艳煞白妖仙面庞
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.arc(cx, cy - 1 * s, 9.5 * s, 0, Math.PI * 2);
        ctx.fill();

        // 冰蓝摄魄妖瞳
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy - 1 * s, 2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4 * s, cy - 1 * s, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        // 妖艳朱唇
        ctx.fillStyle = '#e11d48';
        ctx.fillRect(cx - 1.8 * s, cy + 4 * s, 3.6 * s, 1.2 * s);

        // 3. 白骨幽冥白玉发簪与凌乱黑发
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(cx, cy - 7 * s, 10 * s, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * s, cy - 14 * s);
        ctx.lineTo(cx + 8 * s, cy - 14 * s);
        ctx.stroke();
        break;
      }

      // =========================================================================
      // 20. 青幽苍狼 (青蓝背鬃、森白獠牙、血红妖目)
      // =========================================================================
      case 'wolf': {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(cx, cy + 2 * s, 12 * s, 0, Math.PI * 2);
        ctx.fill();
        // 尖尖双耳
        ctx.beginPath();
        ctx.moveTo(cx - 10 * s, cy - 4 * s);
        ctx.lineTo(cx - 13 * s, cy - 18 * s);
        ctx.lineTo(cx - 3 * s, cy - 8 * s);
        ctx.moveTo(cx + 10 * s, cy - 4 * s);
        ctx.lineTo(cx + 13 * s, cy - 18 * s);
        ctx.lineTo(cx + 3 * s, cy - 8 * s);
        ctx.fill();
        // 血红凶目
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx - 5 * s, cy, 2.2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 5 * s, cy, 2.2 * s, 0, Math.PI * 2);
        ctx.fill();
        // 森然白獠牙
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx - 2 * s, cy + 6 * s);
        ctx.lineTo(cx, cy + 11 * s);
        ctx.lineTo(cx + 2 * s, cy + 6 * s);
        ctx.fill();
        break;
      }

      // =========================================================================
      // 21. 偷粮硕鼠 (粉嫩大耳、红宝石圆目、灵动细须)
      // =========================================================================
      case 'rat': {
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.arc(cx, cy + 2 * s, 11 * s, 0, Math.PI * 2);
        ctx.fill();
        // 粉嫩大耳朵
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(cx - 10 * s, cy - 8 * s, 6 * s, 0, Math.PI * 2);
        ctx.arc(cx + 10 * s, cy - 8 * s, 6 * s, 0, Math.PI * 2);
        ctx.fill();
        // 红宝石双目
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy, 2 * s, 0, Math.PI * 2);
        ctx.arc(cx + 4 * s, cy, 2 * s, 0, Math.PI * 2);
        ctx.fill();
        // 长胡须
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 4 * s, cy + 4 * s);
        ctx.lineTo(cx - 14 * s, cy + 2 * s);
        ctx.moveTo(cx + 4 * s, cy + 4 * s);
        ctx.lineTo(cx + 14 * s, cy + 2 * s);
        ctx.stroke();
        break;
      }

      // =========================================================================
      // 武学游侠少侠 (英气白衣、墨发红带、剑侠凛风)
      // =========================================================================
      case 'martial_hero': {
        // 1. 白色武侠长衫（分层渐变质感）
        const robeGM = ctx.createLinearGradient(cx - 17 * s, cy + 10 * s, cx + 17 * s, cy + 32 * s);
        robeGM.addColorStop(0, '#f0f8ff');
        robeGM.addColorStop(0.5, '#e2eeff');
        robeGM.addColorStop(1, '#c8d8f0');
        ctx.fillStyle = robeGM;
        ctx.beginPath();
        ctx.roundRect(cx - 17 * s, cy + 9 * s, 34 * s, 23 * s, 5 * s);
        ctx.fill();
        // 衣领白色斜线纹（V领）
        ctx.strokeStyle = '#b0c4de'; ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * s, cy + 9 * s); ctx.lineTo(cx, cy + 16 * s); ctx.lineTo(cx + 5 * s, cy + 9 * s);
        ctx.stroke();
        // 红色腰带
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.roundRect(cx - 13 * s, cy + 19 * s, 26 * s, 4 * s, 2 * s); ctx.fill();
        ctx.fillStyle = '#ffd700';
        ctx.beginPath(); ctx.roundRect(cx - 2.5 * s, cy + 18.5 * s, 5 * s, 5 * s, 1.5 * s); ctx.fill();
        ctx.strokeStyle = '#b45309'; ctx.lineWidth = 0.8 * s; ctx.strokeRect(cx - 2.5 * s, cy + 18.5 * s, 5 * s, 5 * s);

        // 肩部内甲隐现
        ctx.fillStyle = 'rgba(180,200,230,0.4)';
        ctx.beginPath(); ctx.arc(cx - 16 * s, cy + 14 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 16 * s, cy + 14 * s, 5 * s, 0, Math.PI * 2); ctx.fill();

        // 2. 英气少侠面庞（健康小麦肤色）
        const faceMH = ctx.createRadialGradient(cx - 1 * s, cy - 3 * s, 1 * s, cx, cy - 1 * s, 10.5 * s);
        faceMH.addColorStop(0, '#fde8c8'); faceMH.addColorStop(0.6, '#f5c88a'); faceMH.addColorStop(1, '#e0a060');
        ctx.fillStyle = faceMH;
        ctx.beginPath(); ctx.ellipse(cx, cy - 1 * s, 10 * s, 10.5 * s, 0, 0, Math.PI * 2); ctx.fill();
        // 腮阴影
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.beginPath(); ctx.ellipse(cx - 6 * s, cy + 3 * s, 4 * s, 5 * s, -0.1, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 6 * s, cy + 3 * s, 4 * s, 5 * s, 0.1, 0, Math.PI * 2); ctx.fill();

        // 眉毛（英武剑眉）
        ctx.strokeStyle = '#3a2010'; ctx.lineWidth = 1.6 * s; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 7 * s, cy - 5 * s); ctx.bezierCurveTo(cx - 4 * s, cy - 7 * s, cx - 1 * s, cy - 6.5 * s, cx - 0.5 * s, cy - 5.5 * s); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + 0.5 * s, cy - 5.5 * s); ctx.bezierCurveTo(cx + 1 * s, cy - 6.5 * s, cx + 4 * s, cy - 7 * s, cx + 7 * s, cy - 5 * s); ctx.stroke();

        // 眼睛（英气细长丹凤眼）
        ctx.fillStyle = '#f0f0f0';
        ctx.beginPath(); ctx.ellipse(cx - 4.5 * s, cy - 2.5 * s, 3 * s, 1.8 * s, -0.15, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 4.5 * s, cy - 2.5 * s, 3 * s, 1.8 * s, 0.15, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1a0a00';
        ctx.beginPath(); ctx.arc(cx - 4.5 * s, cy - 2.5 * s, 1.5 * s, 0, Math.PI * 2); ctx.arc(cx + 4.5 * s, cy - 2.5 * s, 1.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(cx - 5.5 * s, cy - 3.5 * s, 0.6 * s, 0, Math.PI * 2); ctx.arc(cx + 3.5 * s, cy - 3.5 * s, 0.6 * s, 0, Math.PI * 2); ctx.fill();
        // 眼线
        ctx.strokeStyle = '#1a0a00'; ctx.lineWidth = 0.9 * s;
        ctx.beginPath(); ctx.moveTo(cx - 7.5 * s, cy - 2.5 * s); ctx.bezierCurveTo(cx - 5 * s, cy - 4.5 * s, cx - 2.5 * s, cy - 4 * s, cx - 1.5 * s, cy - 1.5 * s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 1.5 * s, cy - 1.5 * s); ctx.bezierCurveTo(cx + 2.5 * s, cy - 4 * s, cx + 5 * s, cy - 4.5 * s, cx + 7.5 * s, cy - 2.5 * s); ctx.stroke();

        // 鼻（高挺）
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 0.8 * s;
        ctx.beginPath(); ctx.moveTo(cx, cy - 1 * s); ctx.lineTo(cx, cy + 1.5 * s); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - 1.5 * s, cy + 2 * s, 1.2 * s, 0.4, Math.PI - 0.4); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 1.5 * s, cy + 2 * s, 1.2 * s, 0.4, Math.PI - 0.4); ctx.stroke();

        // 嘴（英武抿唇）
        ctx.strokeStyle = '#c08050'; ctx.lineWidth = 1.2 * s;
        ctx.beginPath(); ctx.moveTo(cx - 2.5 * s, cy + 5 * s); ctx.bezierCurveTo(cx - 1 * s, cy + 6 * s, cx + 1 * s, cy + 6 * s, cx + 2.5 * s, cy + 5 * s); ctx.stroke();

        // 3. 乌黑英气发型（披散但有型）
        ctx.fillStyle = '#0f0f0f';
        ctx.beginPath();
        ctx.arc(cx, cy - 8 * s, 10.5 * s, Math.PI * 0.88, Math.PI * 2.12);
        ctx.fill();
        // 左侧垂发
        ctx.beginPath();
        ctx.moveTo(cx - 8 * s, cy - 5 * s);
        ctx.bezierCurveTo(cx - 14 * s, cy - 2 * s, cx - 16 * s, cy + 4 * s, cx - 14 * s, cy + 10 * s);
        ctx.lineTo(cx - 11 * s, cy + 10 * s);
        ctx.bezierCurveTo(cx - 12 * s, cy + 4 * s, cx - 10 * s, cy - 1 * s, cx - 7 * s, cy - 4 * s);
        ctx.closePath(); ctx.fill();
        // 右侧短发
        ctx.beginPath();
        ctx.moveTo(cx + 8 * s, cy - 5 * s);
        ctx.bezierCurveTo(cx + 14 * s, cy - 2 * s, cx + 15 * s, cy + 3 * s, cx + 13 * s, cy + 8 * s);
        ctx.lineTo(cx + 10 * s, cy + 8 * s);
        ctx.bezierCurveTo(cx + 11 * s, cy + 3 * s, cx + 10 * s, cy - 1 * s, cx + 7 * s, cy - 4 * s);
        ctx.closePath(); ctx.fill();
        // 红色发带（关键特征！）
        ctx.fillStyle = '#dc2626';
        ctx.beginPath(); ctx.roundRect(cx - 10.5 * s, cy - 10 * s, 21 * s, 4 * s, 1.5 * s); ctx.fill();
        ctx.strokeStyle = 'rgba(200,0,0,0.5)'; ctx.lineWidth = 0.7 * s; ctx.strokeRect(cx - 10.5 * s, cy - 10 * s, 21 * s, 4 * s);
        // 发带飘带（右侧）
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(cx + 10 * s, cy - 9 * s);
        ctx.bezierCurveTo(cx + 16 * s, cy - 12 * s, cx + 22 * s, cy - 8 * s, cx + 20 * s, cy - 5 * s);
        ctx.lineTo(cx + 18 * s, cy - 3 * s);
        ctx.bezierCurveTo(cx + 19 * s, cy - 6 * s, cx + 14 * s, cy - 9 * s, cx + 10 * s, cy - 7 * s);
        ctx.closePath(); ctx.fill();
        break;
      }

      // =========================================================================
      // 熊猫侠 (圆润国宝黑白色调、天蓝道袍、蓝眸灵宝)
      // =========================================================================
      case 'panda_hero': {
        // 1. 天蓝道袍
        const robePH = ctx.createLinearGradient(cx - 17 * s, cy + 10 * s, cx + 17 * s, cy + 32 * s);
        robePH.addColorStop(0, '#0ea5e9'); robePH.addColorStop(0.5, '#0284c7'); robePH.addColorStop(1, '#075985');
        ctx.fillStyle = robePH;
        ctx.beginPath(); ctx.roundRect(cx - 17 * s, cy + 9 * s, 34 * s, 23 * s, 6 * s); ctx.fill();
        ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.2 * s; ctx.stroke();
        // 白色V领内衬
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath(); ctx.moveTo(cx - 5 * s, cy + 9 * s); ctx.lineTo(cx, cy + 16 * s); ctx.lineTo(cx + 5 * s, cy + 9 * s); ctx.closePath(); ctx.fill();

        // 2. 大耳朵（黑色熊猫耳，硕大）
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(cx - 12 * s, cy - 16 * s, 7 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 12 * s, cy - 16 * s, 7 * s, 0, Math.PI * 2); ctx.fill();
        // 耳内（深灰）
        ctx.fillStyle = '#334155';
        ctx.beginPath(); ctx.arc(cx - 12 * s, cy - 16 * s, 4 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 12 * s, cy - 16 * s, 4 * s, 0, Math.PI * 2); ctx.fill();

        // 3. 圆润大脑袋（纯白）
        const faceGPH = ctx.createRadialGradient(cx - 2 * s, cy - 4 * s, 2 * s, cx, cy, 13 * s);
        faceGPH.addColorStop(0, '#ffffff'); faceGPH.addColorStop(0.7, '#f8fafc'); faceGPH.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = faceGPH;
        ctx.beginPath(); ctx.arc(cx, cy, 13 * s, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 0.8 * s; ctx.stroke();

        // 黑眼圈（熊猫特征！两块椭圆）
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.ellipse(cx - 5.5 * s, cy - 2 * s, 4.5 * s, 5.5 * s, -0.35, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(cx + 5.5 * s, cy - 2 * s, 4.5 * s, 5.5 * s, 0.35, 0, Math.PI * 2); ctx.fill();
        // 蓝色灵宝眼（眼眸）
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath(); ctx.arc(cx - 5 * s, cy - 1.5 * s, 2.2 * s, 0, Math.PI * 2); ctx.arc(cx + 5 * s, cy - 1.5 * s, 2.2 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.arc(cx - 5 * s, cy - 1.5 * s, 1.2 * s, 0, Math.PI * 2); ctx.arc(cx + 5 * s, cy - 1.5 * s, 1.2 * s, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.beginPath(); ctx.arc(cx - 5.8 * s, cy - 2.5 * s, 0.5 * s, 0, Math.PI * 2); ctx.arc(cx + 4.2 * s, cy - 2.5 * s, 0.5 * s, 0, Math.PI * 2); ctx.fill();

        // 鼻（黑色小三角）
        ctx.fillStyle = '#0f172a';
        ctx.beginPath(); ctx.moveTo(cx, cy + 2 * s); ctx.lineTo(cx - 2.5 * s, cy - 1 * s); ctx.lineTo(cx + 2.5 * s, cy - 1 * s); ctx.closePath(); ctx.fill();

        // 嘴（大大微笑弧线）
        ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 1.2 * s;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 2 * s); ctx.lineTo(cx, cy + 5 * s);
        ctx.moveTo(cx, cy + 5 * s); ctx.quadraticCurveTo(cx - 3 * s, cy + 7 * s, cx - 5 * s, cy + 5 * s);
        ctx.moveTo(cx, cy + 5 * s); ctx.quadraticCurveTo(cx + 3 * s, cy + 7 * s, cx + 5 * s, cy + 5 * s);
        ctx.stroke();
        // 腮红
        ctx.fillStyle = 'rgba(251, 113, 133, 0.3)';
        ctx.beginPath(); ctx.arc(cx - 8 * s, cy + 4 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx + 8 * s, cy + 4 * s, 2.5 * s, 0, Math.PI * 2); ctx.fill();
        break;
      }

      // =========================================================================
      // 默认兜底：天将神将
      // =========================================================================
      default: {
        this.drawCharacterBust(ctx, 'heaven_general', cx, cy, r);
        break;
      }
    }
  }
}

// 实例化全局艺术头像引擎
window.Portraits = new MasterPortraitEngine();
window.MasterPortraitEngine = MasterPortraitEngine;
