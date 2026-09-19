/**
 * 汉风西游 - 角色与NPC/怪物实体绘制系统 (Character 2.0)
 * 精细化国风西游形象：金甲红缨、神驹踏云、大圣紫金翎羽
 */

class Character {
  constructor(options = {}) {
    this.id = options.id || 'char_' + Math.random().toString(36).substr(2, 6);
    this.name = options.name || '侠士';
    this.type = options.type || 'player'; // 'player' | 'npc' | 'monster'

    this.x = options.x || 100;
    this.y = options.y || 100;
    this.width = 26;
    this.height = 34;

    this.speed = options.speed || 2.8;
    this.direction = options.direction || 'down'; // 'down' | 'up' | 'left' | 'right'
    this.isMoving = false;
    this.animFrame = 0;
    this.animTimer = 0;

    this.appearance = options.appearance || 'heaven_general';
    this.icon = options.icon || '🧙‍♂️';
    this.title = options.title || '';
    this.questStatus = options.questStatus || null;

    this.isRiding = false; // 是否骑乘神驹
    this.interactRadius = 38;
    this.dialogueKey = options.dialogueKey || null;

    this.patrolRadius = options.patrolRadius || 40;
    this.patrolTimer = 0;
  }

  move(dirX, dirY, mapData, tilemapEngine) {
    if (dirX === 0 && dirY === 0) {
      this.isMoving = false;
      return;
    }

    this.isMoving = true;

    if (Math.abs(dirX) > Math.abs(dirY)) {
      this.direction = dirX > 0 ? 'right' : 'left';
    } else {
      this.direction = dirY > 0 ? 'down' : 'up';
    }

    const nextX = this.x + dirX * this.speed;
    const nextY = this.y + dirY * this.speed;

    const footLeft = nextX - this.width / 2 + 4;
    const footRight = nextX + this.width / 2 - 4;
    const footTop = nextY + this.height / 2 - 8;
    const footBottom = nextY + this.height / 2;

    const ts = tilemapEngine.tileSize;
    const tlWalk = tilemapEngine.isWalkable(mapData, Math.floor(footLeft / ts), Math.floor(footTop / ts));
    const trWalk = tilemapEngine.isWalkable(mapData, Math.floor(footRight / ts), Math.floor(footTop / ts));
    const blWalk = tilemapEngine.isWalkable(mapData, Math.floor(footLeft / ts), Math.floor(footBottom / ts));
    const brWalk = tilemapEngine.isWalkable(mapData, Math.floor(footRight / ts), Math.floor(footBottom / ts));

    if (tlWalk && trWalk && blWalk && brWalk) {
      this.x = nextX;
      this.y = nextY;
    } else {
      const xOnlyPass = tilemapEngine.isWalkable(mapData, Math.floor((this.x + dirX * this.speed) / ts), Math.floor(this.y / ts));
      if (xOnlyPass) {
        this.x += dirX * this.speed;
      } else {
        const yOnlyPass = tilemapEngine.isWalkable(mapData, Math.floor(this.x / ts), Math.floor((this.y + dirY * this.speed) / ts));
        if (yOnlyPass) {
          this.y += dirY * this.speed;
        }
      }
    }

    this.animTimer += 1;
    if (this.animTimer % 7 === 0) {
      this.animFrame = (this.animFrame + 1) % 4;
    }
  }

  updatePatrol(mapData, tilemapEngine) {
    if (this.type !== 'monster') return;
    this.patrolTimer += 1;
    if (this.patrolTimer % 55 === 0) {
      const angle = Math.random() * Math.PI * 2;
      const dx = Math.cos(angle) * (Math.random() < 0.5 ? 1 : 0);
      const dy = Math.sin(angle) * (Math.random() < 0.5 ? 1 : 0);
      this.move(dx, dy, mapData, tilemapEngine);
    }
  }

  render(ctx, camera, isPlayerNear = false) {
    const screenX = this.x - camera.x;
    const screenY = this.y - camera.y;

    if (
      screenX < -50 || screenX > camera.viewportWidth + 50 ||
      screenY < -50 || screenY > camera.viewportHeight + 50
    ) {
      return;
    }

    ctx.save();

    // 1. 脚底神话柔光影子与仙家气脉
    ctx.fillStyle = 'rgba(10, 8, 6, 0.45)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + this.height / 2 - 2, 14, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 仙家祥云脚下灵环 (主角神仙形态或骑乘时)
    if (this.appearance === 'heaven_general' || this.isRiding) {
      const ringAlpha = 0.3 + Math.sin(this.animTimer * 0.1) * 0.2;
      ctx.strokeStyle = `rgba(255, 215, 0, ${ringAlpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + this.height / 2 - 2, 17, 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 2. NPC 交互神道金光法阵光环 (带有流转旋转脉冲)
    if (this.type === 'npc') {
      const auraPulse = Math.sin(this.animTimer * 0.12) * 2;
      const baseAlpha = isPlayerNear ? 0.85 : 0.4;
      ctx.strokeStyle = isPlayerNear ? '#ffd700' : 'rgba(212, 175, 55, 0.45)';
      ctx.lineWidth = isPlayerNear ? 2 : 1;
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + this.height / 2 - 2, 18 + auraPulse, 7.5 + auraPulse * 0.4, 0, 0, Math.PI * 2);
      ctx.stroke();

      if (isPlayerNear) {
        // 内圈太极/星芒光环
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(screenX, screenY + this.height / 2 - 2, 13, 5.5, 0, 0, Math.PI * 2);
        ctx.stroke();

        // 悬浮交谈提示气泡
        const bubbleY = screenY - 42 + Math.sin(Date.now() / 180) * 2.5;
        ctx.save();
        ctx.fillStyle = 'rgba(25, 18, 12, 0.92)';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(screenX - 35, bubbleY - 8, 70, 17, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 9.5px "Microsoft YaHei", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffd700';
        ctx.fillText('💬 空格交谈', screenX, bubbleY + 0.5);
        ctx.restore();
      }
    }

    // 3. 绘制身体形象
    this.drawBody(ctx, screenX, screenY);

    // 4. 头顶文字与称号系统 (彻底移至头顶高处，杜绝遮挡面部与身体)
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 根据是否骑乘动态抬高头顶基准点
    const headTopY = screenY - (this.isRiding ? 34 : 24);

    // 4.1 任务金色感叹号指引 (悬浮于头顶最高空，带有呼吸浮动)
    if (this.questStatus === 'available') {
      const bobOffset = Math.sin(Date.now() / 180) * 3;
      const questY = headTopY - 26 + bobOffset;

      // 感叹号光晕
      ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
      ctx.beginPath();
      ctx.arc(screenX, questY, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = 'bold 15px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#fffa65';
      ctx.strokeStyle = '#3d2503';
      ctx.lineWidth = 3;
      ctx.strokeText('！', screenX, questY);
      ctx.fillText('！', screenX, questY);
    }

    // 4.2 专属称号 (若有则居于姓名上方)
    let nameDrawY = headTopY - 2;
    if (this.title) {
      const titleY = headTopY - 15;
      ctx.font = '10px "Microsoft YaHei", sans-serif';
      const titleMetrics = ctx.measureText(this.title);
      const titleBgW = titleMetrics.width + 10;

      // 称号精美深色背景
      ctx.fillStyle = 'rgba(20, 15, 10, 0.75)';
      ctx.fillRect(screenX - titleBgW / 2, titleY - 7, titleBgW, 14);
      ctx.strokeStyle = 'rgba(197, 155, 39, 0.6)';
      ctx.lineWidth = 1;
      ctx.strokeRect(screenX - titleBgW / 2, titleY - 7, titleBgW, 14);

      ctx.fillStyle = '#f5cd79';
      ctx.fillText(this.title, screenX, titleY);
    }

    // 4.3 角色/NPC/怪物 姓名 (居于头顶正上方，配备半透明防遮挡底托与清晰抗锯齿轮廓)
    ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
    const nameMetrics = ctx.measureText(this.name);
    const nameBgW = nameMetrics.width + 12;

    // 半透明胶囊底衬，彻底消除背景复杂导致的发虚看不清
    ctx.fillStyle = 'rgba(12, 9, 6, 0.72)';
    ctx.beginPath();
    ctx.roundRect(screenX - nameBgW / 2, nameDrawY - 7, nameBgW, 15, 3);
    ctx.fill();
    ctx.strokeStyle = this.type === 'player' ? 'rgba(241, 196, 15, 0.7)' : (this.type === 'monster' ? 'rgba(255, 71, 87, 0.7)' : 'rgba(255, 255, 255, 0.3)');
    ctx.lineWidth = 1;
    ctx.stroke();

    // 绘制清晰姓名文本
    ctx.fillStyle = this.type === 'player' ? '#ffeaa7' : (this.type === 'monster' ? '#ff6b81' : '#ffffff');
    ctx.fillText(this.name, screenX, nameDrawY);

    ctx.restore();
  }

  drawBody(ctx, sx, sy) {
    if (window.CharacterRenderer) {
      const isRiding = this.isRiding;
      const modelToDraw = isRiding ? 'mount_knight' : (this.appearance || 'martial_hero');
      window.CharacterRenderer.drawModel(ctx, sx, sy, modelToDraw, {
        direction: this.direction,
        isMoving: this.isMoving,
        isRiding: this.isRiding,
        animFrame: this.animFrame,
        animTimer: this.animTimer
      });
    }
  }
}

// =========================================================================
// 汉风西游 - 全局角色与怪物高精模型多维绘制引擎 (CharacterRenderer 3.0)
// 匠心复刻正统西游国风美术：
// 1. 野狼：靛青渐变矫健身躯、倒竖背脊利毛、银白胸鬃、尖锐弯月獠牙、血红妖瞳、飘逸狼尾
// 2. 铁扇公主：碧翠荷叶仙裙、珊瑚红缘衬、双鬓飞天云髻、金凤步摇、流苏玉佩、青锋宝剑、芭蕉神扇、乘风天衣飞仙飘带
// 3. 武学宗师/无敌黄飞鸿：纯正马步扎立、抱拳推掌、蓝白灵耳飘带头巾、赤红飞龙短褂、金丝绑腿、黑缎练功布鞋
// 4. 白龙神驹与金甲天将：白玉龙鳞骏马、青珊瑚龙角、金丝缰绳、金甲骑士、赤火头盔红缨、威武战披
// 5. 硕鼠：浑圆肥硕鼠身、渐变柔毛、粉嫩透光尖耳、胡须红珠明眸、灵动卷尾
// 6. 铁匠：魁梧古铜臂膀、红巾束发、工匠皮围裙、重锤锻打赤红炽铁、四射火星
// 7. 药铺老板：紫气东来云丝长袍、金线刺绣、悬壶紫金葫芦、黑缎员外方帽、银白长髯
// 8. 齐天大圣：凤翅紫金双翎高耸飘动、锁子黄金甲、虎皮战裙、如意金箍棒
// 9. 天蓬元帅：玄铁黑金重铠、蒲扇大耳、九齿钉耙
// 10. 仙佛神仙：南海观音、白骨妖仙、虎先锋、灵蛇仙宠、两界山猎户、太白金星
// =========================================================================
class CharacterRenderer {
  // 绘制神圣出招通天金黄光柱（复刻图3：脚底金光圆环、向上通天光柱与升腾灵气粒子）
  static drawActingLightPillar(ctx, x, y, width = 56, height = 108) {
    ctx.save();
    const time = Date.now() / 200;
    const pulse = Math.sin(time) * 3.5;
    const beamW = width + pulse;

    // 1. 地面金环法阵光芒 (双层椭圆光环与外圈符文流光)
    ctx.fillStyle = 'rgba(255, 215, 0, 0.32)';
    ctx.beginPath();
    ctx.ellipse(x, y + 12, beamW * 0.75, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.ellipse(x, y + 12, beamW * 0.65, 9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 内圈白炽流光
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(x, y + 12, beamW * 0.44, 6, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. 垂直升腾神圣金黄光柱 (高亮渐变光柱)
    const grad = ctx.createLinearGradient(x, y + 12, x, y - height);
    grad.addColorStop(0, 'rgba(255, 238, 88, 0.72)');
    grad.addColorStop(0.35, 'rgba(255, 215, 0, 0.52)');
    grad.addColorStop(0.75, 'rgba(255, 245, 157, 0.28)');
    grad.addColorStop(1, 'rgba(255, 215, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(x - beamW / 2, y + 12);
    ctx.lineTo(x + beamW / 2, y + 12);
    ctx.lineTo(x + beamW / 2 - 4, y - height);
    ctx.lineTo(x - beamW / 2 + 4, y - height);
    ctx.closePath();
    ctx.fill();

    // 3. 升腾的金色灵气星屑
    for (let i = 0; i < 9; i++) {
      const pTime = (time * 22 + i * 20) % height;
      const py = y + 8 - pTime;
      const px = x + Math.sin(time * 2.4 + i * 1.5) * (beamW * 0.38);
      const alpha = Math.max(0, 1 - pTime / height);
      ctx.fillStyle = `rgba(255, 255, 235, ${alpha})`;
      ctx.beginPath();
      ctx.arc(px, py, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 绘制真实全身模型（供大地图和回合制战场通用渲染）
  static drawModel(ctx, x, y, modelId, options = {}) {
    ctx.save();
    const scale = options.scale || 1.0;
    const direction = options.direction || 'right';
    const animTimer = options.animTimer || (Date.now() / 150);
    const isActing = options.isActing || false;
    const isMoving = options.isMoving || false;
    const isRiding = options.isRiding || false;

    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // 若当前正在出招，先在底层绘制通天神圣金黄光柱
    if (isActing) {
      CharacterRenderer.drawActingLightPillar(ctx, 0, 0, 58, 105);
    }

    // 绘制脚底地面椭圆阴影
    const shadowW = isRiding ? 24 : 17;
    const shadowH = isRiding ? 9 : 7;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    ctx.beginPath();
    ctx.ellipse(0, isRiding ? 14 : 12, shadowW, shadowH, 0, 0, Math.PI * 2);
    ctx.fill();

    // 呼吸浮动微动效
    const breath = Math.sin(animTimer * 0.18) * 1.5;
    const by = breath;

    const mId = (modelId || 'martial_hero').toLowerCase();

    // 模型派发分支
    if (isRiding || mId.includes('mount') || mId.includes('riding') || mId.includes('bailongma') || mId.includes('xuelong')) {
      CharacterRenderer.drawMountKnight(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('wolf') || mId.includes('yelang') || mId.includes('ye_lang')) {
      CharacterRenderer.drawWildWolf(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('tieshan') || mId.includes('tie_shan')) {
      CharacterRenderer.drawTieShanGongZhu(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('martial') || mId.includes('hero') || mId.includes('huang') || mId.includes('mortal') || mId.includes('player') || mId.includes('wanderer')) {
      CharacterRenderer.drawMartialHero(ctx, by, animTimer, direction, isActing, isMoving);
    } else if (mId.includes('rat') || mId.includes('shuoshu') || mId.includes('shuo_shu')) {
      CharacterRenderer.drawGiantRat(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('blacksmith') || mId.includes('tiejiang') || mId.includes('tie_jiang')) {
      CharacterRenderer.drawBlacksmith(ctx, by, animTimer, direction);
    } else if (mId.includes('shopkeeper') || mId.includes('yaopu') || mId.includes('yao_pu') || mId.includes('merchant')) {
      CharacterRenderer.drawShopkeeper(ctx, by, animTimer, direction);
    } else if (mId.includes('wukong') || mId.includes('sun_wukong') || mId.includes('monkey') || mId.includes('hou') || mId.includes('qitian')) {
      CharacterRenderer.drawSunWukong(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('bajie') || mId.includes('zhu_bajie') || mId.includes('zhuganglie') || mId.includes('pig') || mId.includes('tianpeng')) {
      CharacterRenderer.drawZhuBajie(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('sha') || mId.includes('wujing') || mId.includes('shaseng')) {
      CharacterRenderer.drawShaWujing(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('liu_boqin') || mId.includes('hunter') || mId.includes('boqin')) {
      CharacterRenderer.drawLiuBoqin(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('tang_seng') || mId.includes('taibai') || mId.includes('elder') || mId.includes('monk') || mId.includes('tangseng')) {
      CharacterRenderer.drawTangSeng(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('guanyin') || mId.includes('pusa')) {
      CharacterRenderer.drawGuanyin(ctx, by, animTimer, direction);
    } else if (mId.includes('baigu') || mId.includes('baigujing')) {
      CharacterRenderer.drawBaiguJing(ctx, by, animTimer, direction);
    } else if (mId.includes('hu_xianfeng') || mId.includes('tiger') || mId.includes('huxianfeng')) {
      CharacterRenderer.drawHuXianfeng(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('snake') || mId.includes('qing_she') || mId.includes('baihua_she') || mId.includes('she')) {
      CharacterRenderer.drawPetSnake(ctx, by, animTimer, direction);
    } else if (mId.includes('gui') || mId.includes('turtle') || mId.includes('dahai_gui')) {
      CharacterRenderer.drawPetTurtle(ctx, by, animTimer, direction);
    } else {
      CharacterRenderer.drawHeavenGeneral(ctx, by, animTimer, direction, isMoving);
    }

    ctx.restore();
  }

  // =========================================================================
  // 1. 野狼 (完美复刻图3：青蓝靛青渐变、弓背利鬃、银白胸腹毛、暴凸双獠牙、红妖目、上翘长尾)
  // =========================================================================
  static drawWildWolf(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const legMove = isMoving ? Math.sin(animTimer * 0.4) * 4 : 0;
    const tailWiggle = Math.sin(animTimer * 0.22) * 5;

    // 1.1 蓬松飘扬尾巴 (靛蓝渐变 + 纯白尾尖)
    const tailGrad = ctx.createLinearGradient(-16, by, -32, by - 22 + tailWiggle);
    tailGrad.addColorStop(0, '#1c5980');
    tailGrad.addColorStop(0.7, '#2980b9');
    tailGrad.addColorStop(1, '#ffffff');

    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(-15, by + 2);
    ctx.quadraticCurveTo(-26, by - 12 + tailWiggle, -32, by - 20 + tailWiggle);
    ctx.quadraticCurveTo(-22, by - 4 + tailWiggle, -14, by + 7);
    ctx.closePath();
    ctx.fill();

    // 1.2 后腿与利爪 (蹲伏蓄力姿态)
    ctx.fillStyle = '#163b56';
    ctx.beginPath();
    ctx.moveTo(-11, by + 2);
    ctx.quadraticCurveTo(-18, by + 6, -14, by + 12);
    ctx.lineTo(-9, by + 12);
    ctx.closePath();
    ctx.fill();
    // 爪尖
    ctx.fillStyle = '#111';
    ctx.fillRect(-15, by + 11, 6, 2);

    // 1.3 矫健躯干与弓背脊柱刺鬃 (深蓝渐变色)
    const bodyGrad = ctx.createLinearGradient(-15, by - 10, 15, by + 10);
    bodyGrad.addColorStop(0, '#0f3654');
    bodyGrad.addColorStop(0.4, '#1b6497');
    bodyGrad.addColorStop(1, '#2980b9');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-15, by + 4);
    // 拱形背部与突起毛丛
    ctx.quadraticCurveTo(-8, by - 11, 4, by - 7);
    ctx.lineTo(7, by - 10); // 颈部鬣毛突起
    ctx.lineTo(10, by - 4);
    ctx.quadraticCurveTo(8, by + 8, -4, by + 9);
    ctx.quadraticCurveTo(-12, by + 8, -15, by + 4);
    ctx.closePath();
    ctx.fill();

    // 1.4 胸脯与下腹银白柔毛
    ctx.fillStyle = '#ecf0f1';
    ctx.beginPath();
    ctx.moveTo(0, by - 2);
    ctx.quadraticCurveTo(8, by, 10, by + 6);
    ctx.lineTo(4, by + 8);
    ctx.quadraticCurveTo(0, by + 6, -4, by + 8);
    ctx.closePath();
    ctx.fill();

    // 1.5 前腿 (前扑扎地)
    ctx.fillStyle = '#163b56';
    ctx.beginPath();
    ctx.moveTo(4, by + 3);
    ctx.lineTo(8 + legMove, by + 12);
    ctx.lineTo(13 + legMove, by + 12);
    ctx.lineTo(9, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(8 + legMove, by + 11, 6, 2);

    // 1.6 狼首、利齿大张上下颚与黑鼻
    ctx.fillStyle = '#1b6497';
    ctx.beginPath();
    ctx.arc(13, by - 5, 8.5, 0, Math.PI * 2);
    ctx.fill();

    // 警觉尖耳 (外深内粉灰)
    ctx.fillStyle = '#0d283e';
    ctx.beginPath();
    ctx.moveTo(9, by - 10);
    ctx.lineTo(12, by - 20);
    ctx.lineTo(16, by - 11);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#95a5a6';
    ctx.beginPath();
    ctx.moveTo(11, by - 11);
    ctx.lineTo(13, by - 18);
    ctx.lineTo(15, by - 12);
    ctx.closePath();
    ctx.fill();

    // 凶狠吻部
    ctx.fillStyle = '#0f3654';
    ctx.beginPath();
    ctx.moveTo(16, by - 8);
    ctx.lineTo(25, by - 5);
    ctx.lineTo(21, by);
    ctx.closePath();
    ctx.fill();

    // 张开口腔与尖锐白獠牙 (复刻图3利齿)
    ctx.fillStyle = '#781c1c';
    ctx.beginPath();
    ctx.moveTo(17, by - 3);
    ctx.lineTo(24, by - 2);
    ctx.lineTo(18, by + 3);
    ctx.closePath();
    ctx.fill();

    // 洁白锋利獠牙
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(21, by - 4);
    ctx.lineTo(23, by);
    ctx.lineTo(20, by - 2);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(20, by + 2);
    ctx.lineTo(22, by - 1);
    ctx.lineTo(19, by + 1);
    ctx.closePath();
    ctx.fill();

    // 纯黑鼻尖
    ctx.fillStyle = '#111111';
    ctx.beginPath();
    ctx.arc(25, by - 5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 猩红妖狼双目与白炽凶光
    ctx.fillStyle = '#ff1e1e';
    ctx.beginPath();
    ctx.ellipse(15, by - 7, 2.5, 1.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(16, by - 7.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 2. 铁扇公主 (完美复刻图3：碧翠荷叶长裙、云鬓金凤步摇、青锋宝剑、芭蕉神扇、天衣飞仙飘带)
  // =========================================================================
  static drawTieShanGongZhu(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const ribbonWave = Math.sin(animTimer * 0.2) * 5;

    // 2.1 仙灵水云飞仙飘带 (天青薄纱，萦绕身侧飘拂)
    ctx.strokeStyle = 'rgba(72, 219, 251, 0.75)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-14, by + 14 + ribbonWave);
    ctx.bezierCurveTo(-22, by - 4, -12, by - 18, 0, by - 22);
    ctx.bezierCurveTo(12, by - 18, 22, by - 4, 14, by + 14 - ribbonWave);
    ctx.stroke();

    // 2.2 飘逸青碧翠羽长裙 (上窄下宽层次分明，荷叶金边)
    const skirtGrad = ctx.createLinearGradient(0, by - 5, 0, by + 16);
    skirtGrad.addColorStop(0, '#16a085');
    skirtGrad.addColorStop(0.6, '#1abc9c');
    skirtGrad.addColorStop(1, '#2ecc71');

    ctx.fillStyle = skirtGrad;
    ctx.beginPath();
    ctx.moveTo(-7, by - 4);
    ctx.lineTo(7, by - 4);
    ctx.quadraticCurveTo(15, by + 8, 12, by + 16);
    ctx.lineTo(-12, by + 16);
    ctx.quadraticCurveTo(-15, by + 8, -7, by - 4);
    ctx.closePath();
    ctx.fill();

    // 裙摆金丝云纹滚边
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 2.3 纯白云丝内衬抹胸与珊瑚红缘饰
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-5, by - 6, 10, 5);
    ctx.fillStyle = '#e74c3c';
    ctx.fillRect(-7, by - 1, 14, 2.5);

    // 金锁玲珑流苏腰封与纯白羊脂玉佩
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, by + 1, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5f6fa';
    ctx.beginPath();
    ctx.arc(0, by + 4, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 2.4 绝美仙姿玉貌与腮红
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, by - 13, 6.8, 0, Math.PI * 2);
    ctx.fill();
    // 淡淡桃花腮红
    ctx.fillStyle = 'rgba(255, 107, 129, 0.4)';
    ctx.beginPath();
    ctx.arc(-3.5, by - 12, 1.6, 0, Math.PI * 2);
    ctx.arc(3.5, by - 12, 1.6, 0, Math.PI * 2);
    ctx.fill();
    // 点绛朱唇
    ctx.fillStyle = '#e84118';
    ctx.fillRect(-1, by - 9.5, 2, 1);

    // 2.5 墨黑高挽飞天云髻与金凤双翅步摇
    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.arc(0, by - 17, 7.5, Math.PI * 0.9, Math.PI * 2.1);
    ctx.fill();
    // 双环飞天仙髻
    ctx.beginPath();
    ctx.ellipse(-3, by - 21, 3.5, 5, -0.3, 0, Math.PI * 2);
    ctx.ellipse(3, by - 21, 3.5, 5, 0.3, 0, Math.PI * 2);
    ctx.fill();

    // 金凤步摇与悬垂珠链
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(-6, by - 19);
    ctx.lineTo(6, by - 19);
    ctx.moveTo(5, by - 19);
    ctx.lineTo(8, by - 13);
    ctx.stroke();
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(0, by - 19, 2, 0, Math.PI * 2);
    ctx.fill();

    // 2.6 右手持青锋七星宝剑 (出鞘斜前指)
    ctx.strokeStyle = '#ecf0f1';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#48dbfb';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(-9, by - 4);
    ctx.lineTo(-20, by - 17);
    ctx.stroke();
    ctx.shadowBlur = 0;
    // 黄金剑格
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-12, by - 8, 5, 2.8);

    // 2.7 左手持芭蕉扇 (翠玉芭蕉叶形扇)
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.ellipse(11, by - 4, 6, 9, 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();
    // 扇柄
    ctx.strokeStyle = '#795548';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(8, by + 4);
    ctx.lineTo(6, by + 11);
    ctx.stroke();

    // 2.8 莲花绣鞋
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-5, by + 15, 4, 2.5);
    ctx.fillRect(1, by + 15, 4, 2.5);

    ctx.restore();
  }

  // =========================================================================
  // 3. 武学宗师 / "无敌黄飞鸿" (完美复刻图3玩家：扎马步、抱拳推掌、蓝白灵耳头巾、赤金飞龙战褂)
  // =========================================================================
  static drawMartialHero(ctx, by, animTimer, direction, isActing, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const ribbonFlutter = Math.sin(animTimer * 0.25) * 6;

    // 3.1 宽阔马步双腿与金丝绑腿 (深黑武道马裤 + 金黄扎腿带)
    // 左腿前弓下扎
    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.moveTo(-11, by + 4);
    ctx.lineTo(-14, by + 12);
    ctx.lineTo(-7, by + 12);
    ctx.lineTo(-4, by + 4);
    ctx.closePath();
    ctx.fill();
    // 右腿深扎
    ctx.beginPath();
    ctx.moveTo(3, by + 4);
    ctx.lineTo(8, by + 12);
    ctx.lineTo(15, by + 12);
    ctx.lineTo(10, by + 4);
    ctx.closePath();
    ctx.fill();

    // 金丝绑腿 (紧致缠绕小腿)
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-13, by + 8, 7, 2);
    ctx.fillRect(-13.5, by + 10, 7, 2);
    ctx.fillRect(8, by + 8, 7, 2);
    ctx.fillRect(9, by + 10, 7, 2);

    // 传统千层底黑色练功布鞋
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-15, by + 12, 9, 3);
    ctx.fillRect(8, by + 12, 9, 3);
    ctx.fillStyle = '#ffffff'; // 白千层底
    ctx.fillRect(-15, by + 14, 9, 1.2);
    ctx.fillRect(8, by + 14, 9, 1.2);

    // 3.2 赤红飞龙无袖武道短褂 (身躯挺拔如松)
    const tunicGrad = ctx.createLinearGradient(0, by - 9, 0, by + 6);
    tunicGrad.addColorStop(0, '#c0392b');
    tunicGrad.addColorStop(0.5, '#e74c3c');
    tunicGrad.addColorStop(1, '#962d22');

    ctx.fillStyle = tunicGrad;
    ctx.beginPath();
    ctx.roundRect(-9, by - 9, 18, 15, 3);
    ctx.fill();

    // 胸前金龙盘云刺绣徽纹
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(0, by - 3, 4, 0, Math.PI * 1.6);
    ctx.stroke();

    // 纯白中式交领内衬
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, by - 9);
    ctx.lineTo(0, by - 4);
    ctx.lineTo(5, by - 9);
    ctx.stroke();

    // 金黄武道缠腰长带 (扎带飘于腰侧)
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-9, by + 2, 18, 3.5);
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-7, by + 5.5, 3.5, 7);

    // 3.3 经典武术手型：左手推掌向前，右手紧握重拳蓄于腰际
    // 左掌向前推推 (八卦掌势)
    ctx.fillStyle = '#f8c291';
    ctx.beginPath();
    ctx.moveTo(8, by - 6);
    ctx.lineTo(19, by - 4);
    ctx.lineTo(18, by);
    ctx.lineTo(8, by - 1);
    ctx.closePath();
    ctx.fill();
    // 竖掌手印
    ctx.fillStyle = '#ffffff'; // 白手缠带
    ctx.fillRect(15, by - 6, 3.5, 5);
    ctx.fillStyle = '#f8c291';
    ctx.beginPath();
    ctx.ellipse(19, by - 3, 2, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 右拳蓄于腰后
    ctx.fillStyle = '#f8c291';
    ctx.beginPath();
    ctx.arc(-10, by + 2, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, by + 1, 3.5, 3.5);

    // 3.4 英武俊朗武者面庞
    ctx.fillStyle = '#f8c291';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.8, 0, Math.PI * 2);
    ctx.fill();

    // 坚毅双眉与目光如炬黑眸
    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-4, by - 17, 3, 1.2);
    ctx.fillRect(1, by - 17, 3, 1.2);
    ctx.beginPath();
    ctx.arc(-2.5, by - 14, 1.3, 0, Math.PI * 2);
    ctx.arc(2.5, by - 14, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // 3.5 标志性蓝白灵耳头巾 (头戴深蓝头巾，两支兔耳形尖角立起，脑后长带随风飘扬)
    // 额前深蓝发带
    ctx.fillStyle = '#0984e3';
    ctx.beginPath();
    ctx.roundRect(-8, by - 19, 16, 4.5, 2);
    ctx.fill();

    // 头巾正中两只向上坚挺的灵耳飘角 (复刻图3特征)
    ctx.fillStyle = '#0984e3';
    ctx.beginPath();
    ctx.moveTo(-5, by - 19);
    ctx.lineTo(-7, by - 29);
    ctx.lineTo(-2, by - 19);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, by - 19);
    ctx.lineTo(7, by - 29);
    ctx.lineTo(5, by - 19);
    ctx.closePath();
    ctx.fill();

    // 灵耳内衬白色条纹
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-4.5, by - 19);
    ctx.lineTo(-6, by - 27);
    ctx.lineTo(-3, by - 19);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(3, by - 19);
    ctx.lineTo(6, by - 27);
    ctx.lineTo(4.5, by - 19);
    ctx.closePath();
    ctx.fill();

    // 脑后向后飞扬的双长飘带
    ctx.strokeStyle = '#0984e3';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(-6, by - 17);
    ctx.quadraticCurveTo(-14, by - 22 + ribbonFlutter, -22, by - 18 + ribbonFlutter);
    ctx.moveTo(-6, by - 16);
    ctx.quadraticCurveTo(-15, by - 14 + ribbonFlutter, -20, by - 9 + ribbonFlutter);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 4. 白龙神驹与金甲天将骑士 (完美复刻图1长安城：白龙神驹、青红龙角、金鞍缰绳、金甲战将)
  // =========================================================================
  static drawMountKnight(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const horseStep = isMoving ? Math.sin(animTimer * 0.4) * 3 : 0;
    const maneWave = Math.sin(animTimer * 0.25) * 4;

    // 4.1 龙马飘拂马尾 (银丝流光白尾)
    ctx.strokeStyle = '#dff9fb';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-20, by + 3);
    ctx.quadraticCurveTo(-30, by + 10 + maneWave, -27, by + 18);
    ctx.stroke();

    // 4.2 神驹健硕四蹄与金色马蹄铁
    ctx.fillStyle = '#dcdde1';
    // 后双腿
    ctx.fillRect(-17, by + 7 + horseStep, 4, 10);
    ctx.fillRect(-10, by + 7 - horseStep, 4, 10);
    // 前双腿
    ctx.fillRect(8, by + 7 - horseStep, 4, 10);
    ctx.fillRect(15, by + 7 + horseStep, 4, 10);
    // 黄金马蹄铁
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-17, by + 15 + horseStep, 4, 2.5);
    ctx.fillRect(-10, by + 15 - horseStep, 4, 2.5);
    ctx.fillRect(8, by + 15 - horseStep, 4, 2.5);
    ctx.fillRect(15, by + 15 + horseStep, 4, 2.5);

    // 4.3 纯白龙马身躯 (微带珍珠蓝白阴影)
    const horseGrad = ctx.createLinearGradient(-20, by, 20, by);
    horseGrad.addColorStop(0, '#ecf0f1');
    horseGrad.addColorStop(0.5, '#ffffff');
    horseGrad.addColorStop(1, '#dfe6e9');

    ctx.fillStyle = horseGrad;
    ctx.beginPath();
    ctx.ellipse(0, by + 4, 21, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4.4 奢华大红金丝马鞍垫与黄金马鞍
    ctx.fillStyle = '#c0392b';
    ctx.fillRect(-7, by - 2, 14, 8);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-7, by - 2, 14, 8);
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.roundRect(-5, by - 3, 10, 4, 1.5);
    ctx.fill();

    // 4.5 龙马昂首鬃毛与额头碧海龙角
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(13, by + 1);
    ctx.lineTo(21, by - 12);
    ctx.lineTo(27, by - 9);
    ctx.lineTo(20, by + 5);
    ctx.closePath();
    ctx.fill();

    // 银白鬃毛随风后扬
    ctx.strokeStyle = '#c7ecee';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(17, by - 11);
    ctx.quadraticCurveTo(10, by - 15 + maneWave, 8, by - 5);
    ctx.stroke();

    // 额顶神圣青玉龙角 (证明白龙马真龙血统)
    ctx.strokeStyle = '#00d2d3';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(22, by - 13);
    ctx.lineTo(26, by - 22);
    ctx.stroke();

    // 黄金缰绳
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(25, by - 7);
    ctx.lineTo(3, by - 8);
    ctx.stroke();

    // 4.6 骑乘其上的金甲大将身躯
    // 飘扬大红战袍
    ctx.fillStyle = '#b71540';
    ctx.beginPath();
    ctx.moveTo(-6, by - 12);
    ctx.quadraticCurveTo(-20, by - 10 + maneWave, -22, by + 2);
    ctx.lineTo(-6, by + 1);
    ctx.closePath();
    ctx.fill();

    // 锁子黄金甲
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.roundRect(-6, by - 15, 13, 14, 2.5);
    ctx.fill();
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 英挺天将面容
    ctx.fillStyle = '#fbd38d';
    ctx.beginPath();
    ctx.arc(0, by - 19, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // 朱雀金盔与火红战缨
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.roundRect(-6, by - 25, 12, 7, 2);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(0, by - 26, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 5. 硕鼠 (完美复刻图2：深灰浑圆肥硕身躯、粉嫩尖耳透光、红宝石双目、纤长卷尾)
  // =========================================================================
  static drawGiantRat(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const tailTwitch = Math.sin(animTimer * 0.3) * 4;

    // 5.1 细长弯曲粉红鼠尾 (灵动甩动)
    ctx.strokeStyle = '#fab1a0';
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-15, by + 5);
    ctx.bezierCurveTo(-24, by - 4 + tailTwitch, -30, by + 6, -33, by + 1);
    ctx.stroke();

    // 5.2 肥硕浑圆深灰身躯 (暗灰渐变)
    const ratGrad = ctx.createLinearGradient(-15, by - 6, 10, by + 8);
    ratGrad.addColorStop(0, '#353b48');
    ratGrad.addColorStop(0.5, '#4b4b4b');
    ratGrad.addColorStop(1, '#2f3542');

    ctx.fillStyle = ratGrad;
    ctx.beginPath();
    ctx.ellipse(-2, by + 3, 14, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 软绵绵白灰下腹
    ctx.fillStyle = '#dfe4ea';
    ctx.beginPath();
    ctx.ellipse(0, by + 6.5, 9, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5.3 尖锥鼠头
    ctx.fillStyle = '#4b4b4b';
    ctx.beginPath();
    ctx.moveTo(8, by - 2);
    ctx.lineTo(21, by + 2);
    ctx.lineTo(8, by + 7);
    ctx.closePath();
    ctx.fill();

    // 粉黑小鼻尖与细胡须
    ctx.fillStyle = '#ff7675';
    ctx.beginPath();
    ctx.arc(21, by + 2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5f6fa';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(17, by + 1);
    ctx.lineTo(25, by - 2);
    ctx.moveTo(17, by + 3);
    ctx.lineTo(25, by + 5);
    ctx.stroke();

    // 5.4 粉红透光大圆耳
    ctx.fillStyle = '#ffb8b8';
    ctx.beginPath();
    ctx.ellipse(7, by - 5, 4.2, 5.8, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e77f67';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 5.5 晶莹红宝石明眸
    ctx.fillStyle = '#ff3838';
    ctx.beginPath();
    ctx.arc(13, by, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(13.8, by - 0.6, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 5.6 捧于胸前粉爪与蹲坐小足
    ctx.fillStyle = '#ffb8b8';
    ctx.fillRect(8, by + 4, 3.5, 2.5);
    ctx.fillRect(-10, by + 10, 4.5, 3);
    ctx.fillRect(3, by + 10, 4.5, 3);

    ctx.restore();
  }

  // =========================================================================
  // 6. 铁匠 (完美复刻图1长安城/刘家村：红巾束发、工匠皮围裙、重锤锻造火热玄铁、四射火星)
  // =========================================================================
  static drawBlacksmith(ctx, by, animTimer, direction) {
    ctx.save();
    const hammerStrike = Math.abs(Math.sin(animTimer * 0.3));

    // 6.1 玄铁重砧板与火红炽热生铁
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(7, by + 2, 16, 12);
    ctx.fillStyle = '#747d8c';
    ctx.fillRect(5, by + 1, 20, 3.5);

    // 砧上烧红的烙铁 (高亮橙红渐变)
    const hotGrad = ctx.createLinearGradient(10, by - 1, 18, by - 1);
    hotGrad.addColorStop(0, '#ff4757');
    hotGrad.addColorStop(0.5, '#ffa502');
    hotGrad.addColorStop(1, '#ff6348');
    ctx.fillStyle = hotGrad;
    ctx.fillRect(10, by - 1, 9, 3);

    // 锤击迸发的金色火星
    if (hammerStrike < 0.2) {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(14, by - 3, 1.5, 0, Math.PI * 2);
      ctx.arc(17, by - 6, 1.2, 0, Math.PI * 2);
      ctx.arc(11, by - 5, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6.2 铁匠魁梧身躯与鲜红坎肩
    ctx.fillStyle = '#d63031';
    ctx.beginPath();
    ctx.roundRect(-11, by - 8, 17, 18, 3);
    ctx.fill();

    // 牛皮厚围裙
    ctx.fillStyle = '#795548';
    ctx.fillRect(-9, by, 13, 11);
    ctx.strokeStyle = '#4e342e';
    ctx.strokeRect(-9, by, 13, 11);

    // 6.3 刚毅黝黑面容与红巾束发
    ctx.fillStyle = '#e1b12c';
    ctx.beginPath();
    ctx.arc(-2, by - 14, 6.8, 0, Math.PI * 2);
    ctx.fill();
    // 红色头巾
    ctx.fillStyle = '#eb2f06';
    ctx.fillRect(-9, by - 19, 14, 4);

    // 6.4 右手抡起重型锻造铁锤 (动效敲打)
    ctx.save();
    ctx.translate(3, by - 5);
    ctx.rotate(hammerStrike * 0.7 - 0.4);
    ctx.fillStyle = '#8d6e63'; // 锤柄
    ctx.fillRect(0, -12, 3.2, 16);
    ctx.fillStyle = '#3742fa'; // 钢铁锤头
    ctx.fillStyle = '#2f3542';
    ctx.fillRect(-4, -16, 11, 6.5);
    ctx.restore();

    // 6.5 工装皮靴
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-8, by + 10, 5, 5);
    ctx.fillRect(-1, by + 10, 5, 5);

    ctx.restore();
  }

  // =========================================================================
  // 7. 药铺老板 (完美复刻图1长安城：紫气东来锦缎长袍、金腰带紫金葫芦、黑缎员外方帽、银白长髯)
  // =========================================================================
  static drawShopkeeper(ctx, by, animTimer, direction) {
    ctx.save();

    // 7.1 紫红宽袖丝绸长袍
    const robeGrad = ctx.createLinearGradient(-9, by - 8, 9, by + 14);
    robeGrad.addColorStop(0, '#574b90');
    robeGrad.addColorStop(0.5, '#6c5ce7');
    robeGrad.addColorStop(1, '#303952');

    ctx.fillStyle = robeGrad;
    ctx.beginPath();
    ctx.roundRect(-9, by - 8, 18, 20, 3.5);
    ctx.fill();

    // 华贵金丝刺绣滚边与锦缎束腰
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-8, by + 2, 16, 2.5);

    // 腰悬济世紫金药葫芦
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.arc(8, by + 4, 2.2, 0, Math.PI * 2);
    ctx.arc(8, by + 7, 3.2, 0, Math.PI * 2);
    ctx.fill();

    // 7.2 慈祥老者面容与飘逸银髯
    ctx.fillStyle = '#ffeaa7';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.8, 0, Math.PI * 2);
    ctx.fill();

    // 飘垂胸前三绺银白美髯
    ctx.fillStyle = '#dfe6e9';
    ctx.beginPath();
    ctx.moveTo(-3, by - 9);
    ctx.lineTo(0, by - 1);
    ctx.lineTo(3, by - 9);
    ctx.closePath();
    ctx.fill();

    // 7.3 黑缎员外冠帽与额顶翠玉
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.roundRect(-8, by - 23, 16, 9, 2.5);
    ctx.fill();
    // 镶嵌上等翡翠
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(0, by - 19, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 7.4 拱手迎客布履
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(-6, by + 12, 5, 3);
    ctx.fillRect(1.5, by + 12, 5, 3);

    ctx.restore();
  }

  // =========================================================================
  // 8. 齐天大圣孙悟空 (凤翅紫金双翎高耸飘扬、锁子黄金甲、红战袍、如意金箍棒)
  // =========================================================================
  static drawSunWukong(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const featherWave = Math.sin(animTimer * 0.22) * 6;
    const capeWave = Math.sin(animTimer * 0.2) * 4;

    // 8.1 烈焰大红披风
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.moveTo(-9, by - 7);
    ctx.lineTo(9, by - 7);
    ctx.lineTo(14, by + 16 + capeWave);
    ctx.lineTo(-14, by + 16 + capeWave);
    ctx.closePath();
    ctx.fill();

    // 8.2 锁子黄金甲与虎皮战裙
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.roundRect(-8, by - 9, 16, 17, 3);
    ctx.fill();
    ctx.strokeStyle = '#d35400';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#e67e22'; // 虎皮裙
    ctx.fillRect(-7, by + 2, 14, 7);

    // 8.3 金睛美猴王面容
    ctx.fillStyle = '#e1b12c';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.8, 0, Math.PI * 2);
    ctx.fill();
    // 火眼金睛
    ctx.fillStyle = '#fffa65';
    ctx.beginPath();
    ctx.arc(-2.5, by - 14, 1.8, 0, Math.PI * 2);
    ctx.arc(2.5, by - 14, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 8.4 紧箍圈与凤翅紫金翎毛 (超长红羽高耸)
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, by - 16, 6.5, Math.PI, Math.PI * 2);
    ctx.stroke();

    // 双翎羽
    ctx.strokeStyle = '#ff3838';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, by - 19);
    ctx.quadraticCurveTo(-16, by - 33 + featherWave, -12, by - 40);
    ctx.moveTo(3, by - 19);
    ctx.quadraticCurveTo(16, by - 33 - featherWave, 12, by - 40);
    ctx.stroke();

    // 8.5 如意金箍棒 (两头金箍中段乌铁)
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(12, by - 26);
    ctx.lineTo(12, by + 17);
    ctx.stroke();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(12, by - 26);
    ctx.lineTo(12, by - 19);
    ctx.moveTo(12, by + 10);
    ctx.lineTo(12, by + 17);
    ctx.stroke();

    // 步云履
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(-5, by + 9, 4, 7);
    ctx.fillRect(1.5, by + 9, 4, 7);

    ctx.restore();
  }

  // =========================================================================
  // 9. 天蓬元帅猪八戒 (黑金重甲、大耳阔吻、九齿钉耙)
  // =========================================================================
  static drawZhuBajie(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    // 9.1 魁梧黑重铠
    ctx.fillStyle = '#2f3542';
    ctx.beginPath();
    ctx.roundRect(-12, by - 8, 24, 19, 4);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-9, by - 6, 18, 13);

    // 9.2 猪神头面与大耳
    ctx.fillStyle = '#dcdde1';
    ctx.beginPath();
    ctx.arc(0, by - 15, 8.5, 0, Math.PI * 2);
    ctx.fill();
    // 大耳
    ctx.fillStyle = '#ced6e0';
    ctx.beginPath();
    ctx.ellipse(-10, by - 15, 6, 4, 0, 0, Math.PI * 2);
    ctx.ellipse(10, by - 15, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // 猪鼻
    ctx.fillStyle = '#ffb8b8';
    ctx.beginPath();
    ctx.ellipse(0, by - 13, 3.5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 9.3 九齿钢钉耙
    ctx.strokeStyle = '#747d8c';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.moveTo(15, by - 24);
    ctx.lineTo(15, by + 17);
    ctx.stroke();
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(9, by - 27, 13, 4.5);
    for (let r = 0; r < 5; r++) {
      ctx.fillStyle = '#ecf0f1';
      ctx.fillRect(10 + r * 2.5, by - 31, 1.6, 5);
    }

    ctx.fillStyle = '#1e272e';
    ctx.fillRect(-8, by + 11, 5, 6);
    ctx.fillRect(3, by + 11, 5, 6);

    ctx.restore();
  }

  // =========================================================================
  // 10. 两界山猎户刘伯钦 (虎皮裹身、钢叉猎弓)
  // =========================================================================
  static drawLiuBoqin(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    // 虎皮斜披
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8, 16, 17, 3);
    ctx.fill();
    ctx.fillStyle = '#2c3e50';
    // 虎斑纹
    ctx.fillRect(-6, by - 5, 4, 1.5);
    ctx.fillRect(2, by - 2, 4, 1.5);

    // 猎户坚毅面庞与皮毛帽
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#795548';
    ctx.beginPath();
    ctx.roundRect(-7, by - 21, 14, 7, 2);
    ctx.fill();

    // 猎虎三股钢叉
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(11, by - 20);
    ctx.lineTo(11, by + 15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, by - 23);
    ctx.lineTo(11, by - 18);
    ctx.lineTo(14, by - 23);
    ctx.stroke();

    ctx.fillStyle = '#4e342e';
    ctx.fillRect(-6, by + 9, 4, 7);
    ctx.fillRect(2, by + 9, 4, 7);

    ctx.restore();
  }

  // =========================================================================
  // 11. 唐僧 / 太白金星 (九环锦襕袈裟、毗卢帽或太白拂尘)
  // =========================================================================
  static drawTangSeng(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    // 锦襕大红袈裟与金格纹
    ctx.fillStyle = '#c0392b';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8, 16, 20, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-6, by - 6, 12, 16);

    // 慈悲圣僧面庞
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 五佛毗卢宝帽
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(-6, by - 17);
    ctx.lineTo(0, by - 26);
    ctx.lineTo(6, by - 17);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, by - 21, 2, 0, Math.PI * 2);
    ctx.fill();

    // 九环锡杖 (金环相扣)
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(11, by - 22);
    ctx.lineTo(11, by + 16);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(11, by - 24, 3.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#f5cd79';
    ctx.fillRect(-5, by + 12, 4, 3);
    ctx.fillRect(1.5, by + 12, 4, 3);

    ctx.restore();
  }

  // =========================================================================
  // 12. 南海观音菩萨 (白衣大士、莲花法座、羊脂净瓶杨柳枝)
  // =========================================================================
  static drawGuanyin(ctx, by, animTimer, direction) {
    ctx.save();
    const floatY = Math.sin(animTimer * 0.15) * 3;

    // 佛光普照金色圆光
    ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(0, by - 14 + floatY, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 粉红重瓣莲花法座
    ctx.fillStyle = '#ff7675';
    ctx.beginPath();
    ctx.ellipse(0, by + 14 + floatY, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 纯白云锦天衣
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8 + floatY, 16, 20, 4);
    ctx.fill();

    // 慈悲法相
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, by - 14 + floatY, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 羊脂白玉净瓶与翠绿杨柳
    ctx.fillStyle = '#f5f6fa';
    ctx.fillRect(8, by + floatY, 4, 6);
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(10, by - 2 + floatY, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 13. 白骨精 (白骨幽魂、幽紫长裙、骨刃双匕)
  // =========================================================================
  static drawBaiguJing(ctx, by, animTimer, direction) {
    ctx.save();
    const mistAlpha = 0.4 + Math.sin(animTimer * 0.2) * 0.25;

    // 幽魂紫雾
    ctx.fillStyle = `rgba(142, 68, 173, ${mistAlpha})`;
    ctx.beginPath();
    ctx.ellipse(0, by + 10, 15, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 绝艳苍白面庞与暗夜紫裙
    ctx.fillStyle = '#2c003e';
    ctx.beginPath();
    ctx.roundRect(-8, by - 7, 16, 18, 3);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6, 0, Math.PI * 2);
    ctx.fill();

    // 白骨阴簪与双匕
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-11, by - 3);
    ctx.lineTo(-18, by + 8);
    ctx.moveTo(11, by - 3);
    ctx.lineTo(18, by + 8);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 14. 虎先锋 (黄黑斑斓猛虎将、双月狂刀)
  // =========================================================================
  static drawHuXianfeng(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    // 虎纹战甲
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.roundRect(-10, by - 8, 20, 18, 3);
    ctx.fill();
    ctx.fillStyle = '#111';
    ctx.fillRect(-7, by - 4, 14, 2);

    // 猛虎头面与獠牙
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(0, by - 14, 7.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, by - 10, 4, 3);

    // 双柄月牙狂刀
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(12, by - 18);
    ctx.lineTo(18, by + 12);
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 15. 仙宠·青玄灵蛇 (盘旋如意、金冠宝石目)
  // =========================================================================
  static drawPetSnake(ctx, by, animTimer, direction) {
    ctx.save();
    const snakeWave = Math.sin(animTimer * 0.25) * 3;

    // 盘旋翠绿蛇躯
    ctx.strokeStyle = '#10ac84';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, by + 6, 9, 0, Math.PI * 1.5);
    ctx.stroke();

    // 昂扬小巧蛇首
    ctx.fillStyle = '#1dd1a1';
    ctx.beginPath();
    ctx.ellipse(8, by - 3 + snakeWave, 5, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 灵蛇金冠与红宝石小眼
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(8, by - 6 + snakeWave, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(10, by - 3.5 + snakeWave, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 16. 沙悟净 (卷帘大将、骷髅宝串、降妖月牙宝杖)
  // =========================================================================
  static drawShaWujing(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    // 绛紫护僧袍
    ctx.fillStyle = '#4a235a';
    ctx.beginPath();
    ctx.roundRect(-9, by - 8, 18, 18, 3);
    ctx.fill();

    // 脖颈硕大骷髅念珠佛串
    ctx.fillStyle = '#f5f6fa';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(-6 + i * 3, by - 6 + (i === 2 ? 3 : 0), 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 沉稳面庞与头陀铁箍
    ctx.fillStyle = '#dcdde1';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd700'; // 头陀金箍
    ctx.fillRect(-6, by - 18, 12, 2.5);

    // 降妖月牙宝铲
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(11, by - 22);
    ctx.lineTo(11, by + 16);
    ctx.stroke();
    // 月牙铲头
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2.8;
    ctx.beginPath();
    ctx.arc(11, by - 24, 4, Math.PI * 0.8, Math.PI * 2.2);
    ctx.stroke();

    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-6, by + 9, 4, 6);
    ctx.fillRect(2, by + 9, 4, 6);

    ctx.restore();
  }

  // =========================================================================
  // 17. 仙宠·大海龟 / 玄武神龟 (翡翠龟甲、六角金纹、可爱小鳍)
  // =========================================================================
  static drawPetTurtle(ctx, by, animTimer, direction) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const paddleWave = Math.sin(animTimer * 0.25) * 2;

    // 翡翠龟壳 (双色渐变)
    const shellGrad = ctx.createLinearGradient(-12, by, 12, by);
    shellGrad.addColorStop(0, '#1e824c');
    shellGrad.addColorStop(0.5, '#2ecc71');
    shellGrad.addColorStop(1, '#16a085');

    ctx.fillStyle = shellGrad;
    ctx.beginPath();
    ctx.ellipse(0, by + 4, 13, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 龟壳黄金六角纹
    ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-4, by + 1, 8, 6);

    // 呆萌小龟首
    ctx.fillStyle = '#2ed573';
    ctx.beginPath();
    ctx.ellipse(13, by + 2, 4.5, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // 亮晶晶小黑眼
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(14, by + 1, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 划动小鳍爪
    ctx.fillStyle = '#26de81';
    ctx.beginPath();
    ctx.ellipse(-7, by + 10 + paddleWave, 3.5, 2, 0.4, 0, Math.PI * 2);
    ctx.ellipse(7, by + 10 - paddleWave, 3.5, 2, -0.4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 18. 镇天神将 / 托塔天王 (金甲红缨、七宝玲珑塔)
  // =========================================================================
  static drawHeavenGeneral(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const capeWave = Math.sin(animTimer * 0.18) * 3.5;

    // 大红飘逸披风
    ctx.fillStyle = '#b71540';
    ctx.beginPath();
    ctx.moveTo(-9, by - 7);
    ctx.lineTo(9, by - 7);
    ctx.quadraticCurveTo(13, by + 12 + capeWave, 11, by + 17);
    ctx.lineTo(-11, by + 17);
    ctx.quadraticCurveTo(-13, by + 12 + capeWave, -9, by - 7);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 黄金明光铠与纯银护心镜
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.roundRect(-9, by - 9, 18, 17, 3);
    ctx.fill();
    ctx.strokeStyle = '#b8860b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, by - 1, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // 天将面庞与金盔
    ctx.fillStyle = '#fbd38d';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.roundRect(-8, by - 22, 16, 9, 2.5);
    ctx.fill();
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(0, by - 23, 3, 0, Math.PI * 2);
    ctx.fill();

    // 手中镇天宝剑
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-11, by - 18);
    ctx.lineTo(-11, by + 14);
    ctx.stroke();
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(-14, by - 10, 6, 2.5);

    // 战靴
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(-6, by + 8, 4, 7);
    ctx.fillRect(2, by + 8, 4, 7);

    ctx.restore();
  }
}

window.Character = Character;
window.CharacterRenderer = CharacterRenderer;

