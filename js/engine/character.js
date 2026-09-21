/**
 * 汉风西游 - 角色与NPC/怪物实体绘制系统 (Character 2.0)
 * 精细化国风西游形象：金甲红缨、神驹踏云、大圣紫金翎羽
 */

class Character {

  static inferMonsterType(name, id) {
    const s = `${name || ''}_${id || ''}`.toLowerCase();
    if (s.includes('混混') || s.includes('hooligan') || s.includes('hunhun') || s.includes('地痞') || s.includes('功夫')) return 'hooligan';
    if (s.includes('rat') || s.includes('鼠')) return 'rat';
    if (s.includes('pig') || s.includes('猪') || s.includes('bajie')) return 'pig';
    if (s.includes('wolf') || s.includes('狼')) return 'wolf';
    if (s.includes('tiger') || s.includes('虎')) return 'tiger';
    if (s.includes('tree') || s.includes('树')) return 'tree';
    if (s.includes('bandit') || s.includes('tyrant') || s.includes('盗') || s.includes('霸') || s.includes('贼')) return 'bandit';
    if (s.includes('serpent') || s.includes('snake') || s.includes('蛇')) return 'snake';
    if (s.includes('fox') || s.includes('狐')) return 'fox';
    if (s.includes('clam') || s.includes('蚌')) return 'clam';
    if (s.includes('crab') || s.includes('蟹')) return 'crab';
    if (s.includes('shrimp') || s.includes('虾') || s.includes('lobster')) return 'shrimp';
    if (s.includes('bear') || s.includes('熊')) return 'bear';
    if (s.includes('skeleton') || s.includes('bone') || s.includes('尸') || s.includes('骨') || s.includes('鬼') || s.includes('demon')) return 'skeleton';
    if (s.includes('ape') || s.includes('猿') || s.includes('猴')) return 'ape';
    if (s.includes('红孩儿') || s.includes('honghaier') || s.includes('圣婴')) return 'honghaier';
    if (s.includes('牛魔王') || s.includes('niumowang') || s.includes('平天大圣') || s.includes('bull')) return 'bull_demon';
    if (s.includes('金池') || s.includes('jinchi')) return 'jinchi_elder';
    return 'hooligan';
  }

  inferMonsterType(name, id) {
    return Character.inferMonsterType(name, id);
  }
  constructor(options = {}) {
    this.id = options.id || 'char_' + Math.random().toString(36).substr(2, 6);
    this.name = options.name || '侠士';
    this.type = options.type || 'player'; // 'player' | 'npc' | 'monster'

    this.x = options.x || 100;
    this.y = options.y || 100;
    this.width = 26;
    this.height = 34;

    this.speed = options.speed || (options.type === 'monster' ? 0.88 : 2.24); // 80% 基础巡逻移动速度
    this.direction = options.direction || 'down'; // 'down' | 'up' | 'left' | 'right'
    this.isMoving = false;
    this.animFrame = 0;
    this.animTimer = 0;

    // 智能外观绑定：怪物优先识别怪物外观，杜绝误回退成天将
    if (options.appearance && options.appearance !== 'heaven_general') {
      this.appearance = options.appearance;
    } else if (this.type === 'monster') {
      this.appearance = Character.inferMonsterType(this.name, this.id);
    } else if (this.type === 'player') {
      this.appearance = (this.name && this.name.includes('熊猫')) ? 'panda_hero' : (options.appearance || 'martial_hero');
    } else {
      this.appearance = options.appearance || 'martial_hero';
    }

    this.icon = options.icon || '🧙‍♂️';
    this.title = options.title || '';
    this.questStatus = options.questStatus || null;

    // 怪物专属类型识别 (彻底消除怪物默认回退成天将形象的缺陷)
    this.monsterType = options.monsterType || (this.type === 'monster' ? Character.inferMonsterType(this.name, this.id) : null);

    // 仙宠与怪物自然生态巡逻状态机 (idle 歇息驻足 / walk 缓慢漫步)
    this.patrolState = options.patrolState || 'idle';
    this.patrolStateTimer = options.patrolStateTimer || Math.floor(Math.random() * 60) + 30;
    this.patrolDirX = 0;
    this.patrolDirY = 0;

    this.isRiding = false; // 是否骑乘神驹
    this.interactRadius = 38;
    this.dialogueKey = options.dialogueKey || null;

    this.patrolRadius = options.patrolRadius || 40;
    this.patrolTimer = 0;
  }

  updatePatrol(mapData, tilemapEngine) {
    if (this.type !== 'monster') return;
    if (this.spawnX === undefined) {
      this.spawnX = this.x;
      this.spawnY = this.y;
    }

    this.patrolStateTimer -= 1;
    if (this.patrolStateTimer <= 0) {
      if (this.patrolState === 'idle') {
        this.patrolState = 'walk';
        this.patrolStateTimer = Math.floor(Math.random() * 45) + 25; // 持续行走25~70帧
        const distFromSpawn = Math.hypot(this.x - this.spawnX, this.y - this.spawnY);
        let angle;
        if (distFromSpawn > this.patrolRadius) {
          // 超出巡逻范围，偏向出生点回归
          angle = Math.atan2(this.spawnY - this.y, this.spawnX - this.x) + (Math.random() - 0.5) * 0.6;
        } else {
          angle = Math.random() * Math.PI * 2;
        }
        this.patrolDirX = Math.cos(angle);
        this.patrolDirY = Math.sin(angle);
      } else {
        this.patrolState = 'idle';
        this.patrolStateTimer = Math.floor(Math.random() * 80) + 40; // 歇息40~120帧
        this.patrolDirX = 0;
        this.patrolDirY = 0;
        this.isMoving = false;
      }
    }

    if (this.patrolState === 'walk') {
      this.move(this.patrolDirX, this.patrolDirY, mapData, tilemapEngine);
    }
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

    const curCol = Math.floor(this.x / ts);
    const curRow = Math.floor(this.y / ts);
    const curWalkable = tilemapEngine.isWalkable(mapData, curCol, curRow);

    // 若四角判定全通过，正常平滑通行
    if (tlWalk && trWalk && blWalk && brWalk) {
      this.x = nextX;
      this.y = nextY;
    } else if (!curWalkable) {
      // 🛡️ 智能脱困保证：若角色自身因旧存档或异常处于水/山石中，只要目标位置更加靠近或直接处于可行走区域，允许向外移动走出死地！
      const targetCol = Math.floor(nextX / ts);
      const targetRow = Math.floor(nextY / ts);
      if (tilemapEngine.isWalkable(mapData, targetCol, targetRow) || (Math.abs(targetCol - curCol) + Math.abs(targetRow - curRow) > 0)) {
        this.x = nextX;
        this.y = nextY;
      }
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
      let modelToDraw = this.appearance;
      if (this.isRiding) {
        modelToDraw = 'mount_knight';
      } else if (this.type === 'monster') {
        if (!modelToDraw || modelToDraw === 'heaven_general') {
          modelToDraw = this.monsterType || Character.inferMonsterType(this.name, this.id) || 'hooligan';
        }
      } else if (this.type === 'player') {
        if (!modelToDraw || modelToDraw === 'heaven_general') {
          modelToDraw = (this.name && this.name.includes('熊猫')) ? 'panda_hero' : (this.appearance || 'martial_hero');
        }
      }
      if (!modelToDraw) modelToDraw = 'martial_hero';

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
    // 0. 特别优先：西海龙三太子·小白龙敖烈 (绝非龙虾！)
    if (mId.includes('xiaobailong') || mId.includes('bailong_human') || mId.includes('aolie')) {
      CharacterRenderer.drawXiaoBaiLong(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('tudi') || mId.includes('tudi_gong')) {
      CharacterRenderer.drawTudiGong(ctx, by, animTimer, direction);
    } else if (mId.includes('longwang') || mId.includes('aoguang')) {
      CharacterRenderer.drawDragonKing(ctx, by, animTimer, direction);
    } else if (mId.includes('wuchao')) {
      CharacterRenderer.drawWuchaoMaster(ctx, by, animTimer, direction);
    } else if (mId.includes('puti') || mId.includes('bodhi')) {
      CharacterRenderer.drawBodhiMaster(ctx, by, animTimer, direction);
    } else if (mId.includes('jinjiao')) {
      CharacterRenderer.drawJinJiaoKing(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('yinjiao')) {
      CharacterRenderer.drawYinJiaoKing(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('dapeng')) {
      CharacterRenderer.drawDapengRoc(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('linggan')) {
      CharacterRenderer.drawLingganKing(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('baimu')) {
      CharacterRenderer.drawBaimuMojun(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('lijing') || mId.includes('li_jing')) {
      CharacterRenderer.drawLiJing(ctx, by, animTimer, direction, isMoving);
    // 长安城十大专属独立NPC
    } else if (mId.includes('chengyaojin') || mId.includes('biaoju')) {
      CharacterRenderer.drawChengYaojin(ctx, by, animTimer, direction);
    } else if (mId.includes('zhongkui')) {
      CharacterRenderer.drawZhongKui(ctx, by, animTimer, direction);
    } else if (mId.includes('scholar') || mId.includes('duzimei') || mId.includes('du_zimei')) {
      CharacterRenderer.drawChanganScholar(ctx, by, animTimer, direction);
    } else if (mId.includes('changan_girl') || mId.includes('suxiuniang') || mId.includes('xiuniang')) {
      CharacterRenderer.drawChanganGirl(ctx, by, animTimer, direction);
    } else if (mId.includes('tea') || mId.includes('apo') || mId.includes('granny')) {
      CharacterRenderer.drawChanganTeaGranny(ctx, by, animTimer, direction);
    } else if (mId.includes('hawker') || mId.includes('afu') || mId.includes('huolang')) {
      CharacterRenderer.drawChanganHawker(ctx, by, animTimer, direction);
    } else if (mId.includes('child') || mId.includes('xiaohu') || mId.includes('wantong')) {
      CharacterRenderer.drawChanganChild(ctx, by, animTimer, direction);
    } else if (mId.includes('guard') || mId.includes('jinjun') || mId.includes('wuzu')) {
      CharacterRenderer.drawChanganGuard(ctx, by, animTimer, direction);
    } else if (mId.includes('doctor') || mId.includes('yishi') || mId.includes('yaoshi')) {
      CharacterRenderer.drawDoctor(ctx, by, animTimer, direction);
    } else if (mId.includes('huji') || mId.includes('official') || mId.includes('guanyuan')) {
      CharacterRenderer.drawChanganOfficial(ctx, by, animTimer, direction);
    } else if (mId.includes('tree') || mId.includes('kushu') || mId.includes('shujing')) {
      CharacterRenderer.drawTreeDemon(ctx, by, animTimer, direction);
    } else if (mId.includes('fox') || mId.includes('yehu') || mId.includes('linghu') || mId.includes('狐')) {
      CharacterRenderer.drawFox(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('bear') || mId.includes('heifeng') || mId.includes('xiong') || mId.includes('熊')) {
      CharacterRenderer.drawBlackBear(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('honghaier') || mId.includes('redboy') || mId.includes('shengying') || mId.includes('红孩儿')) {
      CharacterRenderer.drawHongHaiEr(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('bull') || mId.includes('niu') || mId.includes('niumowang') || mId.includes('牛魔王')) {
      CharacterRenderer.drawBullDemon(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('jinchi') || mId.includes('jinchi_elder') || mId.includes('金池')) {
      CharacterRenderer.drawJinchiElder(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('tiger') || mId.includes('hu_') || mId.includes('diaojing')) {
      CharacterRenderer.drawTiger(ctx, by, animTimer, direction, isMoving);
    } else if (isRiding || mId.includes('mount') || mId.includes('riding') || mId.includes('bailongma') || mId.includes('xuelong')) {
      CharacterRenderer.drawMountKnight(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('panda') || mId.includes('xiong_mao') || mId.includes('xiongmao')) {
      CharacterRenderer.drawPandaHero(ctx, by, animTimer, direction, isActing, isMoving);
    } else if (mId.includes('hooligan') || mId.includes('hun_hun') || mId.includes('hunhun') || mId.includes('bandit') || mId.includes('tyrant')) {
      CharacterRenderer.drawHooligan(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('clam') || mId.includes('beng') || mId.includes('蚌')) {
      CharacterRenderer.drawClam(ctx, by, animTimer, direction);
    } else if (mId.includes('crab') || mId.includes('xie') || mId.includes('蟹')) {
      CharacterRenderer.drawCrab(ctx, by, animTimer, direction, isMoving);
    // 严格排他性匹配虾兵，绝不误伤小白龙！
    } else if ((mId.includes('shrimp') || mId.includes('xiabing') || mId.includes('xia_') || mId.includes('虾') || mId.includes('lobster')) && !mId.includes('xiaobailong')) {
      CharacterRenderer.drawShrimp(ctx, by, animTimer, direction, isMoving);
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
    // 【高精模型精准分发】彻底杜绝全员套皮孙悟空/猪八戒/牛魔王！
    } else if (mId.includes('tianpeng_marshal') || (mId.includes('tianpeng') && !mId.includes('bajie') && !mId.includes('pig'))) {
      CharacterRenderer.drawTianpengMarshal(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('juling') || mId.includes('juling_shen')) {
      CharacterRenderer.drawJuLingShen(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('chimao') || mId.includes('mahou')) {
      CharacterRenderer.drawChiMaoMaHou(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('stone_monkey') || mId.includes('xiaohou') || mId.includes('huaguo_monkey') || (mId.includes('monkey') && !mId.includes('wukong')) || mId.includes('ape')) {
      CharacterRenderer.drawStoneMonkey(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('yecha') || mId.includes('ye_cha')) {
      CharacterRenderer.drawYeCha(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('wukong') || mId.includes('sun_wukong') || mId.includes('qitian') || mId.includes('super_wukong')) {
      CharacterRenderer.drawSunWukong(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('bajie') || mId.includes('zhu_bajie') || mId.includes('zhuganglie') || mId.includes('pig')) {
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
    } else if (mId.includes('hu_xianfeng') || mId.includes('huxianfeng')) {
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

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.45) * 4.5 : 0;
    const tailWiggle = Math.sin(t * 0.28) * 6;
    const breath = Math.sin(t * 0.18) * 1.0;

    // ── 0. 脚底伏地凶煞暗影 ──
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, by + 15, 17, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 1. 蓬松高高扬起的利落狼尾 (三层渐变，随风与动作摆动) ──
    ctx.save();
    ctx.translate(-16, by + 2);
    ctx.rotate(-0.55 + tailWiggle * 0.04);

    // 外层深邃青墨色
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-7, -8, -14, -16, -11, -24);
    ctx.bezierCurveTo(-6, -29, -1, -22, 0, -16);
    ctx.bezierCurveTo(4, -8, 4, -2, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 中层青蓝鬃毛
    const tailGrad = ctx.createLinearGradient(0, 0, -8, -20);
    tailGrad.addColorStop(0, '#1e3a5f');
    tailGrad.addColorStop(0.6, '#0284c7');
    tailGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(0, 1);
    ctx.bezierCurveTo(-5, -6, -10, -13, -8, -19);
    ctx.bezierCurveTo(-5, -23, -1, -17, 0, -12);
    ctx.closePath();
    ctx.fill();

    // 尾尖银白毛尖
    ctx.fillStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.ellipse(-8, -19, 3.2, 4.5, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 2. 强壮后肢与锋锐狼爪 ──
    // 后左腿 (偏暗)
    ctx.fillStyle = '#0f2942';
    ctx.beginPath();
    ctx.moveTo(-13, by + 1);
    ctx.quadraticCurveTo(-17, by + 6, -16, by + 14);
    ctx.lineTo(-11, by + 14);
    ctx.quadraticCurveTo(-10, by + 6, -8, by + 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 后左爪
    ctx.fillStyle = '#020617';
    ctx.fillRect(-17, by + 13, 7.5, 2.5);

    // 后右腿 (偏亮，交替迈步)
    ctx.fillStyle = '#1e40af';
    ctx.beginPath();
    ctx.moveTo(-6, by + 1);
    ctx.quadraticCurveTo(-9, by + 6 + legMove * 0.4, -8, by + 14 + legMove * 0.3);
    ctx.lineTo(-3, by + 14 + legMove * 0.3);
    ctx.quadraticCurveTo(-3, by + 6 + legMove * 0.4, -1, by + 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 后右爪
    ctx.fillStyle = '#020617';
    ctx.fillRect(-9, by + 13 + legMove * 0.3, 7.5, 2.5);

    // ── 3. 矫健弓背与层叠背脊硬鬃 ──
    const bodyGrad = ctx.createLinearGradient(-15, by - 10, 15, by + 8);
    bodyGrad.addColorStop(0, '#0c2340');
    bodyGrad.addColorStop(0.35, '#1e40af');
    bodyGrad.addColorStop(0.7, '#0284c7');
    bodyGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(-15, by + 4);
    ctx.quadraticCurveTo(-10, by - 12, 0, by - 8);
    ctx.quadraticCurveTo(7, by - 10, 11, by - 4);
    ctx.quadraticCurveTo(13, by + 4, 8, by + 9);
    ctx.quadraticCurveTo(0, by + 12, -10, by + 9);
    ctx.quadraticCurveTo(-15, by + 7, -15, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 倒竖如钢针的背脊硬鬃
    ctx.fillStyle = '#020617';
    for (let i = 0; i < 6; i++) {
      const mx = -11 + i * 4.2;
      const my = by - 8 - i * 0.3;
      ctx.beginPath();
      ctx.moveTo(mx, my);
      ctx.lineTo(mx + 2.2, my - 6.5 - i * 0.4);
      ctx.lineTo(mx + 4.2, my);
      ctx.closePath();
      ctx.fill();
    }

    // 腹部柔韧浅色毛
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(1, by + 6, 6.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 4. 强劲前肢与扣地利爪 ──
    // 前左腿
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.moveTo(4, by + 3);
    ctx.bezierCurveTo(6, by + 7, 7 + legMove, by + 11, 8 + legMove, by + 14);
    ctx.lineTo(13 + legMove, by + 14);
    ctx.bezierCurveTo(13 + legMove, by + 9, 10, by + 5, 9, by + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#020617';
    ctx.fillRect(7 + legMove, by + 13, 7.5, 2.5);

    // 前右腿
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.moveTo(8, by + 2);
    ctx.bezierCurveTo(9, by + 6, 10 - legMove, by + 10, 10 - legMove, by + 14);
    ctx.lineTo(15 - legMove, by + 14);
    ctx.bezierCurveTo(15 - legMove, by + 9, 13, by + 5, 12, by + 1);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#020617';
    ctx.fillRect(9 - legMove, by + 13, 7.5, 2.5);

    // ── 5. 怒张的浓密银白胸鬃 ──
    const chestGrad = ctx.createLinearGradient(7, by - 6, 17, by + 4);
    chestGrad.addColorStop(0, '#f8fafc');
    chestGrad.addColorStop(0.6, '#e2e8f0');
    chestGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = chestGrad;
    ctx.beginPath();
    ctx.moveTo(8, by - 5);
    ctx.quadraticCurveTo(16, by - 4, 18, by + 2);
    ctx.lineTo(14, by + 6);
    ctx.quadraticCurveTo(9, by + 3, 7, by);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // ── 6. 凶煞尖锐的狼首与外露森白獠牙 ──
    const headGrad = ctx.createRadialGradient(18, by - 7, 2, 16, by - 6, 9);
    headGrad.addColorStop(0, '#2563eb');
    headGrad.addColorStop(0.6, '#1e40af');
    headGrad.addColorStop(1, '#0c2340');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(16, by - 6, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 尖长竖直的狼耳
    ctx.fillStyle = '#0c2340';
    ctx.beginPath();
    ctx.moveTo(12, by - 12);
    ctx.lineTo(13.5, by - 19);
    ctx.lineTo(16.5, by - 12);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 耳芯浅色
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(13, by - 13);
    ctx.lineTo(14, by - 17.5);
    ctx.lineTo(15.5, by - 13);
    ctx.closePath();
    ctx.fill();

    // 前探吻部与黑鼻尖
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.moveTo(20, by - 7);
    ctx.lineTo(26, by - 4);
    ctx.lineTo(21, by - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 黑鼻头
    ctx.fillStyle = '#020617';
    ctx.fillRect(25, by - 5, 2.2, 2.2);

    // 森白外翻弯月獠牙 (上下两枚)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(22, by - 3);
    ctx.lineTo(23.5, by);
    ctx.lineTo(24.5, by - 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // 炽烈血红妖瞳 (凶光烁烁)
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.ellipse(17, by - 7, 2.2, 1.4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(17.2, by - 7, 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(16.8, by - 7.5, 0.45, 0, Math.PI * 2);
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

    const walkCycle = animTimer * 0.22;
    // 沉稳大侠步态：双腿平稳自然前后迈步，双臂自然随步伐前后轻摇，身躯绝无上下颠簸抽搐
    const legSwing = isMoving ? Math.sin(walkCycle) * 3.2 : 0;
    const armSwing = isMoving ? Math.sin(walkCycle) * 3.5 : 0;
    const hairFlutter = Math.sin(animTimer * 0.18) * 2.5;

    // ── 0. 阴影 ──
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 13, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 1. 背后飘逸长发与高束马尾 (随风轻扬，仙侠神采) ──
    ctx.save();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-4, -16);
    ctx.quadraticCurveTo(-14 + hairFlutter, -12, -13 + hairFlutter, -1);
    ctx.quadraticCurveTo(-11 + hairFlutter, 5, -8, 2);
    ctx.quadraticCurveTo(-4, -8, -4, -16);
    ctx.closePath();
    ctx.fill();
    // 天青色发带
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-5, -15);
    ctx.quadraticCurveTo(-12 + hairFlutter, -8, -11 + hairFlutter, 4);
    ctx.stroke();
    ctx.restore();

    // ── 2. 下肢：修长挺拔的侠客身姿与沉稳步态 ──
    // 后腿
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(1 + legSwing * 0.4, 6, 6.5, 10, 2);
    ctx.fill();
    // 后靴（玄黑金丝长靴）
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0 + legSwing * 0.4, 13, 7.5, 3.5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(0 + legSwing * 0.4, 13, 7.5, 1.0);

    // 前腿
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.roundRect(-7 - legSwing * 0.4, 6, 6.5, 10, 2);
    ctx.fill();
    // 前靴
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-8 - legSwing * 0.4, 13, 7.5, 3.5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-8 - legSwing * 0.4, 13, 7.5, 1.0);

    // ── 3. 太清玄剑道袍：雪白交领内衬 + 天青水墨流云外褂 ──
    const torsoY = -10;

    // 内衬纯白交领
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-5, torsoY);
    ctx.lineTo(0, torsoY + 7);
    ctx.lineTo(5, torsoY);
    ctx.closePath();
    ctx.fill();

    // 天青云水流云长袍
    const robeGrad = ctx.createLinearGradient(-8, torsoY, 8, torsoY + 16);
    robeGrad.addColorStop(0, '#0284c7');
    robeGrad.addColorStop(0.5, '#0ea5e9');
    robeGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = robeGrad;
    ctx.beginPath();
    ctx.roundRect(-8, torsoY, 16, 16, [3, 3, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#075985';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // 锦带与羊脂玉佩
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-8, torsoY + 10, 16, 3.5);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-2, torsoY + 9.5, 4, 4.5);
    // 垂下朱红丝绦与白玉佩
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-1, torsoY + 14, 2, 5.5);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-1, torsoY + 16, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // ── 4. 左腰佩挂【龙泉七星古剑】(古朴典雅，剑穗微拂) ──
    ctx.save();
    ctx.translate(-7, torsoY + 4);
    ctx.rotate(0.25);
    // 剑鞘
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-2, -6, 4, 22);
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-2, -6, 4, 22);
    // 剑首剑格黄金装具
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-4, -7, 8, 2.5);
    ctx.fillRect(-1.5, -12, 3, 5); // 剑柄
    ctx.arc(0, -12.5, 2, 0, Math.PI * 2); ctx.fill();
    // 明黄剑穗
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(0, -12.5);
    ctx.lineTo(-3, -17 + hairFlutter);
    ctx.lineTo(0, -16 + hairFlutter);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // ── 5. 自然垂落与从容摆动的手臂 (彻底根治怪异平伸举手！) ──
    // 后手（左臂自然微曲，手虚扶剑首，随移动从容摆动）
    ctx.save();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-8 - armSwing * 0.4, torsoY + 2, 4.5, 9, 2);
    ctx.fill();
    ctx.fillStyle = '#ffedd5'; // 肤色手掌
    ctx.beginPath();
    ctx.arc(-6 - armSwing * 0.4, torsoY + 12, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 前手（右臂自然下垂于身侧，随移动自然前后微摆，绝不平举伸出！）
    ctx.save();
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.roundRect(4.5 + armSwing * 0.5, torsoY + 2, 4.5, 10, 2);
    ctx.fill();
    // 素银护腕
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(4.5 + armSwing * 0.5, torsoY + 8.5, 4.5, 2);
    // 自然微垂的手掌
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(6.8 + armSwing * 0.5, torsoY + 13, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 6. 俊朗英武的少年剑侠面庞与束发紫金冠 ──
    // 颈部
    ctx.fillStyle = '#ffedd5';
    ctx.fillRect(-2.5, torsoY - 4, 5, 5);

    // 脸部轮廓
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.ellipse(0, torsoY - 8, 6.2, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // 乌黑剑眉、清澈星目与坚毅薄唇
    ctx.fillStyle = '#0f172a';
    // 剑眉
    ctx.fillRect(-4, torsoY - 10.5, 3.2, 1.0);
    ctx.fillRect(1, torsoY - 10.5, 3.2, 1.0);
    // 灵动黑瞳
    ctx.beginPath();
    ctx.arc(-2.5, torsoY - 8.5, 1.4, 0, Math.PI * 2);
    ctx.arc(2.5, torsoY - 8.5, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.arc(-2.2, torsoY - 8.8, 0.5, 0, Math.PI * 2);
    ctx.arc(2.8, torsoY - 8.8, 0.5, 0, Math.PI * 2);
    ctx.fill();
    // 浅笑薄唇
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-1.5, torsoY - 5);
    ctx.lineTo(1.5, torsoY - 5);
    ctx.stroke();

    // 束发紫金冠与白玉簪
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.roundRect(-4, torsoY - 16, 8, 5, [2, 2, 0, 0]);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 白玉簪横插
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6, torsoY - 14, 12, 1.4);

    // 额前微拂的两缕飘逸墨发
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-4, torsoY - 12);
    ctx.quadraticCurveTo(-6, torsoY - 7, -5, torsoY - 4);
    ctx.lineTo(-4, torsoY - 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
  static drawPandaHero(ctx, by, animTimer, direction, isActing, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    // 彻底消除行走一颠一颠：行走时垂直颠簸归零，保持宗师大侠沉稳步态
    const walkCycle = animTimer * 0.22;
    const legSwing = isMoving ? Math.sin(walkCycle) * 2.5 : 0;
    const bodyBob = isMoving ? Math.abs(Math.sin(walkCycle)) * 0.3 : (Math.sin(animTimer * 0.05) * 0.5);
    const leafSway = Math.sin(animTimer * 0.15) * 1.5;
    const staffPulse = Math.sin(animTimer * 0.2) * 2.5;

    // ── 0. 脚底踏实暗影 ──
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 14, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 1. 后背斜负的青翠竹筒行囊与鲜嫩竹叶 (宗师气度，自然微拂) ──
    ctx.save();
    ctx.translate(-12, -14 + bodyBob);
    ctx.rotate(-0.16 + (isMoving ? Math.sin(walkCycle) * 0.03 : 0));

    // 竹筒暗影
    ctx.fillStyle = 'rgba(10, 30, 10, 0.35)';
    ctx.fillRect(-6, -2, 12, 24);

    // 翠绿竹节
    const bambooGrad = ctx.createLinearGradient(-6, 0, 6, 0);
    bambooGrad.addColorStop(0, '#14532d');
    bambooGrad.addColorStop(0.35, '#16a34a');
    bambooGrad.addColorStop(0.7, '#22c55e');
    bambooGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = bambooGrad;
    ctx.beginPath();
    ctx.roundRect(-6, -2, 12, 24, 3);
    ctx.fill();
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 竹筒金色箍条与铜扣
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-6.5, 4, 13, 2.5);
    ctx.fillRect(-6.5, 14, 13, 2.5);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-1.5, 3.5, 3, 3.5);

    // 顶端伸出的鲜嫩翠绿竹叶 (微摆)
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(-2, -2);
    ctx.quadraticCurveTo(-10, -8 + leafSway, -15, -6 + leafSway);
    ctx.quadraticCurveTo(-8, -3 + leafSway, 0, -2);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.moveTo(-1, -2);
    ctx.quadraticCurveTo(-4, -13 - leafSway, -3, -19 - leafSway);
    ctx.quadraticCurveTo(2, -10 - leafSway, 2, -2);
    ctx.fill();
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.moveTo(1, -2);
    ctx.quadraticCurveTo(8, -10 + leafSway, 13, -7 + leafSway);
    ctx.quadraticCurveTo(7, -3 + leafSway, 2, -2);
    ctx.fill();
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 0.5;
    ctx.stroke();
    ctx.restore();

    // ── 2. 沉稳平步的双腿与功夫鞋 (轻柔前后步幅，杜绝上蹿下跳) ──
    // 后腿
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-9 + legSwing * 0.4, 8, 8, 9.5, 3);
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-11 + legSwing * 0.4, 14.5, 10, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-11 + legSwing * 0.4, 16, 10, 1.8);

    // 前腿
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(2.5 - legSwing * 0.4, 8, 8, 9.5, 3);
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(1.5 - legSwing * 0.4, 14.5, 10, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1.5 - legSwing * 0.4, 16, 10, 1.8);

    // ── 3. 深蓝宗师长袍与白云斜襟 (高度平稳端正) ──
    const robeY = -7 + bodyBob;
    const robeGrad = ctx.createLinearGradient(-13, robeY, 13, robeY + 18);
    robeGrad.addColorStop(0, '#0284c7');
    robeGrad.addColorStop(0.4, '#0369a1');
    robeGrad.addColorStop(0.8, '#075985');
    robeGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = robeGrad;
    ctx.beginPath();
    ctx.roundRect(-13, robeY, 26, 17.5, 5);
    ctx.fill();
    ctx.strokeStyle = '#082f49';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 纯白云纹斜领
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-6, robeY);
    ctx.lineTo(0, robeY + 8);
    ctx.lineTo(6, robeY);
    ctx.lineTo(3.5, robeY);
    ctx.lineTo(0, robeY + 5.5);
    ctx.lineTo(-3.5, robeY);
    ctx.closePath();
    ctx.fill();

    // 棕红腰带与纯金扣
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-13, robeY + 9, 26, 4.5);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-13, robeY + 10.5, 26, 1.2);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-3, robeY + 8.5, 6, 5.5);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-1.5, robeY + 9.8, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4.5, robeY + 13, 2.5, 6.5);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(4.5, robeY + 13, 2.5, 6.5);

    // ── 4. 右手握持九节仙木灵杖与聚灵夜明宝珠 (优雅微摆) ──
    ctx.save();
    ctx.translate(13.5, -3 + bodyBob);
    ctx.rotate(0.08 + (isMoving ? Math.sin(walkCycle) * 0.04 : 0));

    // 仙杖木身
    const staffGrad = ctx.createLinearGradient(-2, -22, 2, 18);
    staffGrad.addColorStop(0, '#78350f');
    staffGrad.addColorStop(0.5, '#b45309');
    staffGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = staffGrad;
    ctx.beginPath();
    ctx.roundRect(-2, -22, 4, 38, 1.5);
    ctx.fill();
    ctx.strokeStyle = '#291102';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 金箍节
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-2.5, -14, 5, 1.8);
    ctx.fillRect(-2.5, -4, 5, 1.8);
    ctx.fillRect(-2.5, 6, 5, 1.8);

    // 杖头金莲托
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-5, -21); ctx.lineTo(5, -21); ctx.lineTo(3.5, -25); ctx.lineTo(-3.5, -25);
    ctx.closePath();
    ctx.fill();

    // 杖顶发光冰蓝灵珠
    const gemPulse = 6 + staffPulse * 0.4;
    const glowGrad = ctx.createRadialGradient(0, -29, 1, 0, -29, gemPulse + 7);
    glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
    glowGrad.addColorStop(0.45, 'rgba(14, 165, 233, 0.4)');
    glowGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, -29, gemPulse + 7, 0, Math.PI * 2);
    ctx.fill();

    const orbGrad = ctx.createRadialGradient(-1.5, -30.5, 0.5, 0, -29, gemPulse);
    orbGrad.addColorStop(0, '#ffffff');
    orbGrad.addColorStop(0.3, '#e0f2fe');
    orbGrad.addColorStop(0.65, '#0284c7');
    orbGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(0, -29, gemPulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // 左右护腕与圆圆黑熊掌
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-12.5, robeY + 4, 4, 3.5);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-10.5, robeY + 7.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.fillRect(11.5, -4 + bodyBob, 4, 3.5);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(13.5, -1 + bodyBob, 3.8, 0, Math.PI * 2);
    ctx.fill();

    // ── 5. 圆润萌态、神采奕奕的大熊猫头 (高度平稳，绝无耸头抽搐) ──
    const headY = -18 + bodyBob;

    // 黑耳朵
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-8, headY - 8.5, 4.8, 0, Math.PI * 2);
    ctx.arc(8, headY - 8.5, 4.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(-8, headY - 8.5, 2.5, 0, Math.PI * 2);
    ctx.arc(8, headY - 8.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 大白脑袋
    const headGrad = ctx.createRadialGradient(0, headY - 2, 2, 0, headY, 11);
    headGrad.addColorStop(0, '#ffffff');
    headGrad.addColorStop(0.75, '#f8fafc');
    headGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.arc(0, headY, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // 标志性大黑眼圈
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(-4.8, headY - 1.2, 3.8, 2.8, -0.35, 0, Math.PI * 2);
    ctx.ellipse(4.8, headY - 1.2, 3.8, 2.8, 0.35, 0, Math.PI * 2);
    ctx.fill();

    // 明亮黑曜石眼眸与高光
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4.5, headY - 1.2, 1.4, 0, Math.PI * 2);
    ctx.arc(4.5, headY - 1.2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(-4.3, headY - 1.2, 0.9, 0, Math.PI * 2);
    ctx.arc(4.3, headY - 1.2, 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4.8, headY - 1.6, 0.5, 0, Math.PI * 2);
    ctx.arc(4.0, headY - 1.6, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 黑黑小鼻尖与微笑嘴角
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-1.6, headY + 3); ctx.lineTo(1.6, headY + 3); ctx.lineTo(0, headY + 4.5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, headY + 4.5); ctx.lineTo(0, headY + 6);
    ctx.moveTo(-2.5, headY + 6); ctx.quadraticCurveTo(0, headY + 7.5, 2.5, headY + 6);
    ctx.stroke();

    // 软萌腮红
    ctx.fillStyle = 'rgba(244, 114, 182, 0.3)';
    ctx.beginPath();
    ctx.ellipse(-7.5, headY + 3.2, 2.2, 1.2, 0, 0, Math.PI * 2);
    ctx.ellipse(7.5, headY + 3.2, 2.2, 1.2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 3.3 陈塘关海滨地痞混混 (1:1 像素级复刻实机截图：金鸡独立功夫出招、白发带双侧飞扬、赤裸古铜胸肌腹肌、黑布马裤白绑腿)
  // =========================================================================
  static drawHooligan(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const t = animTimer;
    const legSwing = isMoving ? Math.sin(t * 0.45) * 4 : 0;
    const ribbonWave = Math.sin(t * 0.28) * 5;
    const breath = Math.sin(t * 0.18) * 1.0;
    const armPunch = Math.sin(t * 0.35) * 2.5;

    // ── 0. 阴影 ──
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, by + 16, 11, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 1. 下肢：原版标志性【金鸡独立】功夫挑衅架势 ──
    // 支撑腿 (后腿/右腿，稳稳踏地扎步)
    ctx.fillStyle = '#1c1c22';
    ctx.beginPath();
    ctx.moveTo(1, by + 4);
    ctx.quadraticCurveTo(4, by + 9, 5, by + 15);
    ctx.lineTo(10, by + 15);
    ctx.quadraticCurveTo(9, by + 9, 6, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // 支撑腿白色紧实绑腿 (多层交叉绷带)
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(4.5, by + 9.5, 5.2, 2);
    ctx.fillRect(4.8, by + 12, 5, 2);
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(4.5, by + 9.5, 5.2, 2);
    ctx.strokeRect(4.8, by + 12, 5, 2);

    // 支撑腿功夫黑布鞋 (千层白底)
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(4, by + 14.5, 8.5, 3.2, [0, 0, 2, 2]);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, by + 16.5, 8.5, 1.2);

    // 悬空独立腿 (前腿/左腿，膝盖高高提起出招)
    const kneeLiftX = -8 - legSwing * 0.5;
    const kneeLiftY = by + 2 - Math.abs(legSwing) * 0.8;
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.moveTo(-2, by + 4);
    ctx.quadraticCurveTo(-5, by + 5, kneeLiftX, kneeLiftY + 3);
    ctx.lineTo(kneeLiftX - 4, kneeLiftY + 1);
    ctx.quadraticCurveTo(-4, by + 2, -1, by + 3);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // 弯曲悬空的小腿与足尖 (向后屈膝挑衅姿态)
    ctx.fillStyle = '#1c1c22';
    ctx.beginPath();
    ctx.moveTo(kneeLiftX - 3, kneeLiftY + 2);
    ctx.quadraticCurveTo(kneeLiftX - 4, kneeLiftY + 8, kneeLiftX + 1, kneeLiftY + 11);
    ctx.lineTo(kneeLiftX + 4, kneeLiftY + 9);
    ctx.quadraticCurveTo(kneeLiftX + 1, kneeLiftY + 6, kneeLiftX + 1, kneeLiftY + 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 悬空腿白色绑腿
    ctx.fillStyle = '#f4f4f5';
    ctx.fillRect(kneeLiftX - 2.5, kneeLiftY + 5.5, 4.8, 2);
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(kneeLiftX - 2.5, kneeLiftY + 5.5, 4.8, 2);

    // 悬空小脚 (微翘足尖)
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(kneeLiftX, kneeLiftY + 9.5, 6, 3, 1.5);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(kneeLiftX, kneeLiftY + 11.3, 6, 1.2);

    // 宽松马裤胯部与棕皮金扣腰带
    const pantGrad = ctx.createLinearGradient(-7, by + 2, 7, by + 8);
    pantGrad.addColorStop(0, '#3f3f46');
    pantGrad.addColorStop(1, '#18181b');
    ctx.fillStyle = pantGrad;
    ctx.beginPath();
    ctx.roundRect(-7.5, by + 2 + breath * 0.4, 15, 6.5, [0, 0, 3, 3]);
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 腰带
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7.5, by + 1.5 + breath * 0.4, 15, 2.8);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, by + 1.2 + breath * 0.4, 4, 3.4);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 0.6;
    ctx.strokeRect(-2, by + 1.2 + breath * 0.4, 4, 3.4);

    // ── 2. 赤裸古铜健硕躯干 (强壮胸肌、八块腹肌与人鱼线) ──
    const torsoY = by - 12 + breath;
    const skinGrad = ctx.createLinearGradient(-8, torsoY, 8, torsoY + 14);
    skinGrad.addColorStop(0, '#f59e0b');
    skinGrad.addColorStop(0.35, '#d97706');
    skinGrad.addColorStop(0.8, '#b45309');
    skinGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = skinGrad;
    ctx.beginPath();
    ctx.roundRect(-8, torsoY, 16, 14, [4, 4, 1, 1]);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 锁骨与胸肌精细刻线
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.45)';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    // 锁骨
    ctx.moveTo(-6, torsoY + 2.5); ctx.quadraticCurveTo(0, torsoY + 3.8, 6, torsoY + 2.5);
    // 胸中线
    ctx.moveTo(0, torsoY + 4); ctx.lineTo(0, torsoY + 12);
    // 胸肌下沿弧度
    ctx.moveTo(-6.5, torsoY + 7.5); ctx.quadraticCurveTo(-3.5, torsoY + 8.8, 0, torsoY + 7.8);
    ctx.quadraticCurveTo(3.5, torsoY + 8.8, 6.5, torsoY + 7.5);
    ctx.stroke();

    // 腹肌暗影小块 (结实硬朗)
    ctx.fillStyle = 'rgba(69, 26, 3, 0.22)';
    ctx.beginPath();
    ctx.roundRect(-4.8, torsoY + 9, 4, 2, 0.6);
    ctx.roundRect(0.8, torsoY + 9, 4, 2, 0.6);
    ctx.roundRect(-4.5, torsoY + 11.5, 3.8, 1.8, 0.6);
    ctx.roundRect(0.8, torsoY + 11.5, 3.8, 1.8, 0.6);
    ctx.fill();

    // 肌肉受光高光
    ctx.fillStyle = 'rgba(254, 243, 199, 0.28)';
    ctx.beginPath();
    ctx.ellipse(-3.5, torsoY + 5.5, 3, 1.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // ── 3. 手臂：一手出拳一手蓄势 (纯白护腕) ──
    // 前手拳 (右手，直臂前推挑战)
    const punchX = 8;
    const punchY = torsoY + 5 + armPunch;
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(6, torsoY + 2);
    ctx.quadraticCurveTo(11, torsoY + 2, 14, punchY);
    ctx.lineTo(13, punchY + 3.5);
    ctx.quadraticCurveTo(9, torsoY + 5, 5, torsoY + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 右手白色护腕
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11.5, punchY - 2, 4.5, 5);
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(11.5, punchY - 2, 4.5, 5);

    // 右拳
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(15, punchY - 1.5, 5, 4.2, 1.8);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 后手拳 (左手，屈肘于腰侧蓄力)
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(-6, torsoY + 2);
    ctx.quadraticCurveTo(-11, torsoY + 4, -10, torsoY + 9 - armPunch * 0.5);
    ctx.lineTo(-7, torsoY + 9 - armPunch * 0.5);
    ctx.quadraticCurveTo(-7, torsoY + 5, -4, torsoY + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 左手白色护腕
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-12, torsoY + 7 - armPunch * 0.5, 4.5, 4.5);
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-12, torsoY + 7 - armPunch * 0.5, 4.5, 4.5);

    // 左拳
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.roundRect(-12.5, torsoY + 11 - armPunch * 0.5, 4.8, 4, 1.5);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // ── 4. 颈部与精悍混混头庞 ──
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-2.5, torsoY - 2.5, 5, 3.5);

    const headY = torsoY - 8.5;
    const faceGrad = ctx.createRadialGradient(-1, headY, 1, 0, headY, 7.5);
    faceGrad.addColorStop(0, '#fde68a');
    faceGrad.addColorStop(0.55, '#f59e0b');
    faceGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = faceGrad;
    ctx.beginPath();
    ctx.ellipse(0, headY, 6.8, 7.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // ── 5. 面部五官：坏笑、桀骜挑眉、霸道眼神 ──
    // 浓密剑眉 (左挑右扬)
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-5.5, headY - 1.8);
    ctx.quadraticCurveTo(-3, headY - 3.2, -0.8, headY - 2.2);
    ctx.moveTo(0.8, headY - 2.6);
    ctx.quadraticCurveTo(3.5, headY - 3.8, 5.8, headY - 2.2);
    ctx.stroke();

    // 眼眶与眼白
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-2.8, headY - 0.2, 2.2, 1.5, 0.1, 0, Math.PI * 2);
    ctx.ellipse(2.8, headY - 0.2, 2.2, 1.5, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // 漆黑瞳孔 (斜视挑战目光)
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(-2.4, headY - 0.2, 1.1, 0, Math.PI * 2);
    ctx.arc(3.2, headY - 0.2, 1.1, 0, Math.PI * 2);
    ctx.fill();
    // 眼神高光
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2.8, headY - 0.6, 0.45, 0, Math.PI * 2);
    ctx.arc(2.8, headY - 0.6, 0.45, 0, Math.PI * 2);
    ctx.fill();

    // 坏笑嘴角 (微翘歪笑)
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2.5, headY + 3.8);
    ctx.quadraticCurveTo(0.5, headY + 4.8, 3.5, headY + 3.2);
    ctx.stroke();

    // 面部轻微创可贴/武斗疤痕
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.6)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(3.2, headY);
    ctx.lineTo(4.6, headY + 2.2);
    ctx.stroke();

    // ── 6. 实机灵魂特征：纯白英雄护额、正中黑方纹章与【双侧飞扬长飘带】 ──
    const bandY = headY - 5.5;
    // 白色系带
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-7.2, bandY, 14.4, 4.8, 1.2);
    ctx.fill();
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // 额头中央黑色方块纹章 (原版经典标记)
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-2, bandY + 0.8, 4, 3.2);

    // 脑后黑发与马尾小抓髻
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(0, bandY + 0.5, 7, Math.PI * 1.05, Math.PI * 1.95);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, bandY);
    ctx.quadraticCurveTo(-11, bandY - 5, -12, bandY + 1);
    ctx.quadraticCurveTo(-8, bandY + 2, -4, bandY + 2);
    ctx.fill();

    // 右侧随风剧烈飘荡的长白发带 (高低起伏波浪)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(6.5, bandY + 2.2);
    ctx.bezierCurveTo(11, bandY + ribbonWave * 0.8, 15, bandY - 1 + ribbonWave, 18, bandY + 1 + ribbonWave);
    ctx.lineTo(17.5, bandY + 3.8 + ribbonWave);
    ctx.bezierCurveTo(14, bandY + 1.8 + ribbonWave, 10, bandY + 3.8 + ribbonWave * 0.8, 6.5, bandY + 4.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 左侧随风扬起的长白发带
    ctx.fillStyle = '#f4f4f5';
    ctx.beginPath();
    ctx.moveTo(-6.5, bandY + 2.2);
    ctx.bezierCurveTo(-11, bandY - ribbonWave * 0.8, -15, bandY - 2 - ribbonWave, -18, bandY - ribbonWave);
    ctx.lineTo(-17.5, bandY + 2.8 - ribbonWave);
    ctx.bezierCurveTo(-14, bandY + 0.8 - ribbonWave, -10, bandY + 3.8 - ribbonWave * 0.8, -6.5, bandY + 4.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
  }
  static drawMountKnight(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const horseStep = isMoving ? Math.sin(animTimer * 0.42) * 4 : 0;
    const maneWave = Math.sin(animTimer * 0.25) * 4.5;
    const breath = Math.sin(animTimer * 0.16) * 1.2;

    // ── 0. 神驹踏云大阴影 ──
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, by + 18, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 1. 飘逸修长的银白龙尾 ──
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-20, by + 3);
    ctx.quadraticCurveTo(-32, by + 12 + maneWave, -28, by + 20);
    ctx.stroke();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // ── 2. 神驹健硕四蹄与灿金马蹄铁 ──
    ctx.fillStyle = '#e2e8f0';
    // 后双腿
    ctx.fillRect(-17, by + 7 + horseStep, 4.5, 11);
    ctx.fillRect(-10, by + 7 - horseStep, 4.5, 11);
    // 前双腿
    ctx.fillRect(8, by + 7 - horseStep, 4.5, 11);
    ctx.fillRect(15, by + 7 + horseStep, 4.5, 11);

    // 纯金马蹄铁
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-17, by + 16 + horseStep, 4.5, 3);
    ctx.fillRect(-10, by + 16 - horseStep, 4.5, 3);
    ctx.fillRect(8, by + 16 - horseStep, 4.5, 3);
    ctx.fillRect(15, by + 16 + horseStep, 4.5, 3);

    // ── 3. 健美流线型白玉龙马躯干 ──
    const horseGrad = ctx.createLinearGradient(-22, by, 22, by);
    horseGrad.addColorStop(0, '#f1f5f9');
    horseGrad.addColorStop(0.5, '#ffffff');
    horseGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = horseGrad;
    ctx.beginPath();
    ctx.ellipse(0, by + 4, 22, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // ── 4. 奢华大红金丝刺绣鞍鞯与纯金马鞍 ──
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-8, by - 2, 16, 9, 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 纯金马鞍
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-6, by - 3.5, 12, 4.5, 1.8);
    ctx.fill();

    // ── 5. 龙马昂首长颈、银白鬃毛与青玉龙角 ──
    // 修长马颈
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(13, by + 1);
    ctx.lineTo(21, by - 14);
    ctx.lineTo(28, by - 11);
    ctx.lineTo(20, by + 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 飞扬银白鬃毛
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(17, by - 13);
    ctx.quadraticCurveTo(9, by - 17 + maneWave, 8, by - 5);
    ctx.stroke();

    // 神圣青玉龙角
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(23, by - 15);
    ctx.lineTo(27, by - 24);
    ctx.stroke();

    // 黄金缰绳
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(26, by - 9);
    ctx.lineTo(2, by - 8);
    ctx.stroke();

    // ── 6. 骑乘其上的金甲天将 ──
    // 飘扬大红战袍
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-6, by - 14);
    ctx.quadraticCurveTo(-22, by - 11 + maneWave, -24, by + 2);
    ctx.lineTo(-6, by + 1);
    ctx.closePath();
    ctx.fill();

    // 锁子黄金甲
    const armorGrad = ctx.createLinearGradient(-6, by - 16, 6, by);
    armorGrad.addColorStop(0, '#fef08a');
    armorGrad.addColorStop(0.5, '#f59e0b');
    armorGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.roundRect(-6.5, by - 16, 13, 14, 2.5);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 英挺天将面容
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, by - 20, 5.8, 0, Math.PI * 2);
    ctx.fill();

    // 凤翅兜鍪金盔与火红战缨
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.roundRect(-6.5, by - 26, 13, 7.5, 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 火红战缨
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, by - 27.5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 龙胆亮银枪 (斜指苍穹)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, by - 10);
    ctx.lineTo(22, by - 32);
    ctx.stroke();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(21, by - 31);
    ctx.lineTo(26, by - 36);
    ctx.lineTo(24, by - 30);
    ctx.closePath();
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

    const t = animTimer;
    const featherWave = Math.sin(t * 0.22) * 5;
    const capeWave = Math.sin(t * 0.2) * 3;
    const legSwing = isMoving ? Math.sin(t * 0.4) * 4 : 0;
    const breath = Math.sin(t * 0.18) * 0.8;

    // ── 烈焰大红披风（后层） ──
    const capeGrad = ctx.createLinearGradient(0, by - 8, 0, by + 16 + capeWave);
    capeGrad.addColorStop(0, '#c0392b'); capeGrad.addColorStop(0.5, '#e74c3c'); capeGrad.addColorStop(1, '#922b21');
    ctx.fillStyle = capeGrad;
    ctx.beginPath();
    ctx.moveTo(-9, by - 7 + breath);
    ctx.lineTo(9, by - 7 + breath);
    ctx.bezierCurveTo(14, by + 2, 16, by + 10, 14, by + 16 + capeWave);
    ctx.bezierCurveTo(8, by + 20 + capeWave, -8, by + 20 + capeWave, -14, by + 16 + capeWave);
    ctx.bezierCurveTo(-16, by + 10, -14, by + 2, -9, by - 7 + breath);
    ctx.closePath(); ctx.fill();
    // 披风边缘金线
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-8, by - 7 + breath); ctx.bezierCurveTo(-13, by + 2, -13, by + 10, -11, by + 16 + capeWave); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, by - 7 + breath); ctx.bezierCurveTo(13, by + 2, 13, by + 10, 11, by + 16 + capeWave); ctx.stroke();

    // ── 如意金箍棒 ──
    const staffX = 13;
    // 棒身（黑铁）
    ctx.strokeStyle = '#1a2436'; ctx.lineWidth = 3.8;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(staffX, by - 28); ctx.lineTo(staffX, by + 18); ctx.stroke();
    // 金箍（上）
    const goldGrd = ctx.createLinearGradient(staffX - 4, by - 28, staffX + 4, by - 22);
    goldGrd.addColorStop(0, '#b8860b'); goldGrd.addColorStop(0.5, '#ffd700'); goldGrd.addColorStop(1, '#d4a017');
    ctx.fillStyle = goldGrd;
    ctx.beginPath(); ctx.roundRect(staffX - 4, by - 28, 8, 6, 2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.roundRect(staffX - 4, by + 12, 8, 6, 2); ctx.fill();
    // 棒中段纹路
    ctx.strokeStyle = 'rgba(255,215,0,0.3)'; ctx.lineWidth = 1;
    for (let yy = by - 18; yy < by + 10; yy += 6) {
      ctx.beginPath(); ctx.moveTo(staffX - 2, yy); ctx.lineTo(staffX + 2, yy); ctx.stroke();
    }

    // ── 腿部 ──
    // 虎皮裙/裙摆
    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.roundRect(-7, by + 6 + breath, 14, 8, [0, 0, 3, 3]); ctx.fill();
    // 虎皮花纹
    ctx.fillStyle = '#1a0a00';
    ctx.fillRect(-5, by + 8 + breath, 3, 2);
    ctx.fillRect(2, by + 9 + breath, 3, 2);
    ctx.fillRect(-3, by + 11 + breath, 2, 2);
    ctx.fillRect(4, by + 12 + breath, 2, 2);

    // 两条腿
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(-5, by + 11 + breath); ctx.bezierCurveTo(-6, by + 14, -7 - legSwing, by + 16, -7 - legSwing, by + 18);
    ctx.lineTo(-3 - legSwing, by + 18); ctx.bezierCurveTo(-2 - legSwing, by + 16, -2, by + 14, -2, by + 11 + breath);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(2, by + 11 + breath); ctx.bezierCurveTo(2, by + 14, 4 + legSwing, by + 16, 4 + legSwing, by + 18);
    ctx.lineTo(8 + legSwing, by + 18); ctx.bezierCurveTo(8 + legSwing, by + 16, 7, by + 14, 6, by + 11 + breath);
    ctx.closePath(); ctx.fill();
    // 步云鞋
    ctx.fillStyle = '#2d3436';
    ctx.beginPath(); ctx.roundRect(-9 - legSwing, by + 17, 7, 3.5, [0, 0, 2, 2]); ctx.fill();
    ctx.beginPath(); ctx.roundRect(3 + legSwing, by + 17, 7, 3.5, [0, 0, 2, 2]); ctx.fill();
    ctx.fillStyle = '#f39c12'; ctx.fillRect(-9 - legSwing, by + 16, 7, 1.5);
    ctx.fillRect(3 + legSwing, by + 16, 7, 1.5);

    // ── 锁子黄金铠甲（躯干） ──
    const armorGrad = ctx.createLinearGradient(-8, by - 9 + breath, 8, by + 7 + breath);
    armorGrad.addColorStop(0, '#f5d020'); armorGrad.addColorStop(0.4, '#f1c40f'); armorGrad.addColorStop(0.8, '#d4ac0d'); armorGrad.addColorStop(1, '#b7950b');
    ctx.fillStyle = armorGrad;
    ctx.beginPath(); ctx.roundRect(-8, by - 9 + breath, 16, 17, 3); ctx.fill();
    // 铠甲锁链纹
    ctx.strokeStyle = '#d4ac0d'; ctx.lineWidth = 0.8;
    for (let yy = by - 6 + breath; yy < by + 6 + breath; yy += 3) {
      ctx.beginPath(); ctx.moveTo(-7, yy); ctx.lineTo(7, yy); ctx.stroke();
    }
    ctx.strokeStyle = '#d35400'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.roundRect(-8, by - 9 + breath, 16, 17, 3); ctx.stroke();

    // ── 双臂 ──
    // 左臂（持棒）
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(7, by - 5 + breath); ctx.bezierCurveTo(10, by - 8 + breath, 13, by - 6, 14, by - 3);
    ctx.lineTo(13, by - 1); ctx.bezierCurveTo(12, by - 3, 9, by - 5 + breath, 6, by - 4 + breath); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.arc(13, by - 2, 2.5, 0, Math.PI * 2); ctx.fill();

    // 右臂（握拳）
    ctx.fillStyle = '#d35400';
    ctx.beginPath();
    ctx.moveTo(-7, by - 5 + breath); ctx.bezierCurveTo(-10, by - 4 + breath, -12, by - 2, -11, by + 2);
    ctx.lineTo(-8, by + 2); ctx.bezierCurveTo(-8, by - 1, -7, by - 4 + breath, -5, by - 5 + breath); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e67e22'; ctx.beginPath(); ctx.roundRect(-13, by, 5, 4, 2); ctx.fill();

    // ── 猴头（精细五官） ──
    const headY = by - 18 + breath;
    // 头型（猴子略宽，颧骨高）
    const faceGrad = ctx.createRadialGradient(-1, headY - 2, 1, 0, headY, 6.5);
    faceGrad.addColorStop(0, '#f0c040'); faceGrad.addColorStop(0.5, '#e1a020'); faceGrad.addColorStop(1, '#c07010');
    ctx.fillStyle = faceGrad;
    ctx.beginPath(); ctx.ellipse(0, headY, 6.5, 7, 0, 0, Math.PI * 2); ctx.fill();

    // 猴子白色面部（特征：白色中央脸庞）
    const muzzleGrad = ctx.createRadialGradient(0, headY + 2, 1, 0, headY + 1, 4.5);
    muzzleGrad.addColorStop(0, '#f5e8c0'); muzzleGrad.addColorStop(1, '#e8c880');
    ctx.fillStyle = muzzleGrad;
    ctx.beginPath(); ctx.ellipse(0, headY + 1, 4.5, 4, 0, 0, Math.PI * 2); ctx.fill();

    // 火眼金睛（黄色圆眼，有光晕）
    ctx.shadowColor = 'rgba(255,200,0,0.6)'; ctx.shadowBlur = 5;
    ctx.fillStyle = '#fffa65';
    ctx.beginPath(); ctx.arc(-2.5, headY - 2, 2.2, 0, Math.PI * 2); ctx.arc(2.5, headY - 2, 2.2, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;
    // 瞳孔（红色）
    ctx.fillStyle = '#cc0000';
    ctx.beginPath(); ctx.arc(-2.5, headY - 2, 1.2, 0, Math.PI * 2); ctx.arc(2.5, headY - 2, 1.2, 0, Math.PI * 2); ctx.fill();
    // 高光
    ctx.fillStyle = 'rgba(255,255,200,0.9)';
    ctx.beginPath(); ctx.arc(-3.2, headY - 3, 0.6, 0, Math.PI * 2); ctx.arc(1.8, headY - 3, 0.6, 0, Math.PI * 2); ctx.fill();
    // 眉（英武）
    ctx.strokeStyle = '#7a4000'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-5, headY - 4.5); ctx.quadraticCurveTo(-2.5, headY - 6, -0.5, headY - 5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0.5, headY - 5); ctx.quadraticCurveTo(2.5, headY - 6, 5, headY - 4.5); ctx.stroke();
    // 猴嘴（突出，咧开）
    ctx.fillStyle = '#8b4500';
    ctx.beginPath(); ctx.ellipse(0, headY + 3.5, 2.5, 1.8, 0, 0, Math.PI * 2); ctx.fill();
    // 咧嘴（露齿）
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(-1, headY + 2.8, 1, 0, Math.PI); ctx.arc(1, headY + 2.8, 1, 0, Math.PI); ctx.fill();
    // 鼻
    ctx.fillStyle = '#5a2a00';
    ctx.beginPath(); ctx.ellipse(0, headY + 1, 1.5, 1.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a0a00';
    ctx.beginPath(); ctx.arc(-0.7, headY + 1, 0.5, 0, Math.PI * 2); ctx.arc(0.7, headY + 1, 0.5, 0, Math.PI * 2); ctx.fill();

    // 耳朵（大圆耳）
    ctx.fillStyle = '#c07010';
    ctx.beginPath(); ctx.arc(-6.5, headY - 2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6.5, headY - 2, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8a040';
    ctx.beginPath(); ctx.arc(-6.5, headY - 2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(6.5, headY - 2, 2, 0, Math.PI * 2); ctx.fill();

    // ── 紧箍圈 ──
    const hoopGrad = ctx.createLinearGradient(-6.5, headY - 8, 6.5, headY - 5);
    hoopGrad.addColorStop(0, '#c8a000'); hoopGrad.addColorStop(0.5, '#ffe000'); hoopGrad.addColorStop(1, '#c8a000');
    ctx.fillStyle = hoopGrad;
    ctx.beginPath(); ctx.roundRect(-6.5, headY - 8, 13, 3, 1.5); ctx.fill();
    ctx.shadowColor = 'rgba(255,215,0,0.5)'; ctx.shadowBlur = 4;
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(-6.5, headY - 8, 13, 3, 1.5); ctx.stroke();
    ctx.shadowBlur = 0;

    // ── 凤翅紫金双翎 ──
    ctx.shadowColor = 'rgba(255,50,50,0.4)'; ctx.shadowBlur = 6;
    // 左翎
    ctx.strokeStyle = '#ff2020'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-3, headY - 8);
    ctx.bezierCurveTo(-10, headY - 18 + featherWave, -14, headY - 26 + featherWave * 0.8, -10, headY - 35);
    ctx.stroke();
    // 翎毛瓣
    ctx.strokeStyle = '#ff6060'; ctx.lineWidth = 1;
    for (let fy = -5; fy > -25; fy -= 6) {
      ctx.beginPath();
      const fx = -3 + fy * 0.5;
      ctx.moveTo(fx, headY + fy); ctx.lineTo(fx - 5, headY + fy - 4 + featherWave * 0.3); ctx.stroke();
    }
    // 右翎
    ctx.strokeStyle = '#ff2020'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(3, headY - 8);
    ctx.bezierCurveTo(10, headY - 18 - featherWave, 14, headY - 26 - featherWave * 0.8, 10, headY - 35);
    ctx.stroke();
    ctx.strokeStyle = '#ff6060'; ctx.lineWidth = 1;
    for (let fy = -5; fy > -25; fy -= 6) {
      ctx.beginPath();
      const fx = 3 - fy * 0.5;
      ctx.moveTo(fx, headY + fy); ctx.lineTo(fx + 5, headY + fy - 4 - featherWave * 0.3); ctx.stroke();
    }
    ctx.shadowBlur = 0;

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
  // =========================================================================
  // 12. 南海观世音菩萨 (1:1 殿堂级复刻实机截图：三层千瓣盛开彩莲法座、紫发仙冠、白纱如烟披风、羊脂玉净瓶与青翠柳枝、左右侍立小龙女与善财童子、头顶悬浮立体发光纯金感叹号)
  // =========================================================================
  static drawGuanyin(ctx, by, animTimer, direction) {
    ctx.save();
    const t = animTimer;
    const lotusRotate = t * 0.05;
    const haloPulse = Math.sin(t * 0.18) * 3;
    const wave = Math.sin(t * 0.22) * 2;
    const breath = Math.sin(t * 0.15) * 1.0;

    // ── 0. 佛光云海底层祥云 ──
    ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, by + 18, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // ── 1. 实机九品重瓣七彩莲花宝座 (金红如意底托 + 粉白层叠莲瓣) ──
    // 底座金色如意宝台
    const baseGrad = ctx.createLinearGradient(-22, by + 15, 22, by + 22);
    baseGrad.addColorStop(0, '#b45309');
    baseGrad.addColorStop(0.5, '#f59e0b');
    baseGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = baseGrad;
    ctx.beginPath();
    ctx.roundRect(-22, by + 15, 44, 7, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 盛开的九瓣外圈粉红莲瓣
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI + Math.PI;
      const lx = Math.cos(angle) * 18;
      const ly = by + 14 + Math.sin(angle) * 5;
      const petalGrad = ctx.createRadialGradient(lx, ly, 1, lx, ly, 6);
      petalGrad.addColorStop(0, '#fdf2f8');
      petalGrad.addColorStop(0.6, '#f472b6');
      petalGrad.addColorStop(1, '#db2777');
      ctx.fillStyle = petalGrad;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 4.5, 6.5, angle + Math.PI / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbcfe8';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // 内圈粉白如玉莲花台面
    const innerGrad = ctx.createLinearGradient(-15, by + 8, 15, by + 14);
    innerGrad.addColorStop(0, '#ffffff');
    innerGrad.addColorStop(0.5, '#fce7f3');
    innerGrad.addColorStop(1, '#fbcfe8');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.ellipse(0, by + 12, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // ── 2. 左右两侧侍立仙童 (实机标志性金童玉女护持) ──
    // 左侧：【善财童子】 (红发冲天双抓髻、红短衣、合十作揖)
    ctx.save();
    ctx.translate(-19, by + 8);
    // 童子短裤与小腿
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-3, 2, 6, 5);
    ctx.fillStyle = '#fde68a';
    ctx.fillRect(-2.5, 7, 2, 3);
    ctx.fillRect(0.5, 7, 2, 3);
    // 童子红肚兜与小短褂
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-4, -4, 8, 7, 2);
    ctx.fill();
    // 合十作揖小手
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, -2, 2, 0, Math.PI * 2);
    ctx.fill();
    // 童子圆圆小脸
    ctx.beginPath();
    ctx.arc(0, -8, 3.8, 0, Math.PI * 2);
    ctx.fill();
    // 冲天双抓髻红发
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(-2.5, -12, 1.8, 0, Math.PI * 2);
    ctx.arc(2.5, -12, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 右侧：【小龙女】 (粉蓝仙裳、双鬟青丝、手持如意)
    ctx.save();
    ctx.translate(19, by + 8);
    // 仙裙下摆
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-4, 0); ctx.lineTo(4, 0); ctx.lineTo(5.5, 9); ctx.lineTo(-5.5, 9);
    ctx.closePath();
    ctx.fill();
    // 粉蓝短襦上衣
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.roundRect(-3.5, -4, 7, 5, 2);
    ctx.fill();
    // 如意玉佩
    ctx.fillStyle = '#34d399';
    ctx.fillRect(-1.5, -2, 3, 3);
    // 玉女粉嫩小脸
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(0, -8, 3.8, 0, Math.PI * 2);
    ctx.fill();
    // 双鬟青丝飞天髻
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(-2.5, -12, 2, 0, Math.PI * 2);
    ctx.arc(2.5, -12, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 3. 观音法身：纯白如雾仙纱天衣与淡青佛袍 ──
    const bodyY = by - 12 + breath;

    // 脑后万道金光神圣佛轮
    const haloR = 19 + haloPulse;
    const haloGrad = ctx.createRadialGradient(0, bodyY - 4, 3, 0, bodyY - 4, haloR);
    haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    haloGrad.addColorStop(0.35, 'rgba(254, 240, 138, 0.7)');
    haloGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.35)');
    haloGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, bodyY - 4, haloR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, bodyY - 4, 16.5, 0, Math.PI * 2);
    ctx.stroke();

    // 洁白垂肩天衣白纱 (双肩如仙翼舒展下垂)
    const veilGrad = ctx.createLinearGradient(-15, bodyY - 8, 15, bodyY + 22);
    veilGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    veilGrad.addColorStop(0.5, 'rgba(240, 249, 255, 0.9)');
    veilGrad.addColorStop(1, 'rgba(224, 242, 254, 0.75)');
    ctx.fillStyle = veilGrad;
    ctx.beginPath();
    ctx.moveTo(-15, bodyY);
    ctx.quadraticCurveTo(-20, bodyY + 12 + wave, -14, bodyY + 24);
    ctx.lineTo(14, bodyY + 24);
    ctx.quadraticCurveTo(20, bodyY + 12 + wave, 15, bodyY);
    ctx.quadraticCurveTo(0, bodyY + 8, -15, bodyY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 淡青如意云锦佛裳
    const dressGrad = ctx.createLinearGradient(-8, bodyY, 8, bodyY + 22);
    dressGrad.addColorStop(0, '#ffffff');
    dressGrad.addColorStop(0.4, '#e0f2fe');
    dressGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = dressGrad;
    ctx.beginPath();
    ctx.roundRect(-8, bodyY, 16, 22, [4, 4, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 胸前纯金璎珞神链
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, bodyY + 4, 5.5, 0, Math.PI);
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, bodyY + 9.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // ── 4. 右手托羊脂玉净瓶与翠绿柳枝 (甘霖垂露) ──
    ctx.save();
    ctx.translate(11, bodyY + 6);
    // 白玉净瓶
    const bottleGrad = ctx.createLinearGradient(-2, -5, 2, 6);
    bottleGrad.addColorStop(0, '#ffffff');
    bottleGrad.addColorStop(0.5, '#f0f9ff');
    bottleGrad.addColorStop(1, '#cbd5e1');
    ctx.fillStyle = bottleGrad;
    ctx.beginPath();
    ctx.moveTo(-1.8, -5); ctx.lineTo(1.8, -5); ctx.lineTo(1.2, -2);
    ctx.quadraticCurveTo(3.5, 0, 3, 5); ctx.lineTo(-3, 5);
    ctx.quadraticCurveTo(-3.5, 0, -1.2, -2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // 瓶插嫩绿垂柳枝
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.quadraticCurveTo(4, -10 + wave * 0.5, 8, -8 + wave * 0.5);
    ctx.stroke();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(4, -8 + wave * 0.5, 1.2, 0, Math.PI * 2);
    ctx.arc(7, -8 + wave * 0.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 左手捏兰花法印
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.ellipse(-9, bodyY + 9, 2.5, 3.5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // ── 5. 观音慈悲庄严法相与紫金仙冠 ──
    const headY = bodyY - 10;

    // 白皙慈悲面容
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.ellipse(0, headY, 6.2, 6.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 眉心一点朱砂痣
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, headY - 1.5, 1.1, 0, Math.PI * 2);
    ctx.fill();

    // 慈悲垂目与微笑
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-2.5, headY - 0.5, 1.5, 0.1, Math.PI - 0.1);
    ctx.arc(2.5, headY - 0.5, 1.5, 0.1, Math.PI - 0.1);
    ctx.stroke();
    // 嘴角
    ctx.beginPath();
    ctx.moveTo(-1.8, headY + 3.2);
    ctx.quadraticCurveTo(0, headY + 4.2, 1.8, headY + 3.2);
    ctx.stroke();

    // 高耸雕花紫金佛冠
    const crownGrad = ctx.createLinearGradient(-6, headY - 14, 6, headY - 6);
    crownGrad.addColorStop(0, '#fef08a');
    crownGrad.addColorStop(0.5, '#ffd700');
    crownGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.moveTo(-6, headY - 6);
    ctx.lineTo(-4, headY - 15);
    ctx.lineTo(0, headY - 18);
    ctx.lineTo(4, headY - 15);
    ctx.lineTo(6, headY - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 冠顶红宝明珠
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, headY - 13, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // ── 6. 头顶悬浮纯金任务感叹号【！】 (实机1:1复刻高亮金光指引) ──
    const questBob = Math.sin(t * 0.25) * 2.8;
    const questY = headY - 26 + questBob;

    // 金光光晕
    ctx.fillStyle = 'rgba(255, 215, 0, 0.45)';
    ctx.beginPath();
    ctx.arc(0, questY, 11, 0, Math.PI * 2);
    ctx.fill();

    // 感叹号粗字描边与金色高光
    ctx.font = 'bold 17px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3.5;
    ctx.strokeText('！', 0, questY);
    ctx.fillStyle = '#fef08a';
    ctx.fillText('！', 0, questY);

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
  // =========================================================================
  // 黄风岭前锋大将·虎先锋 (虎面神将、兽面重甲、手执两柄雪亮月牙狂刀)
  // =========================================================================
  static drawHuXianfeng(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const legMove = isMoving ? Math.sin(animTimer * 0.42) * 3.5 : 0;
    const breath = Math.sin(animTimer * 0.15) * 1.0;
    const bladeWave = Math.sin(animTimer * 0.3) * 3;

    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, by + 16, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 虎腿战靴
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7, by + 8 + legMove, 6, 9);
    ctx.fillRect(2, by + 8 - legMove, 6, 9);
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-8.5, by + 14 + legMove, 8, 3.5);
    ctx.fillRect(1.5, by + 14 - legMove, 8, 3.5);

    // 兽皮虎纹战甲躯干
    const armorGrad = ctx.createLinearGradient(-10, by - 12, 10, by + 6);
    armorGrad.addColorStop(0, '#f59e0b');
    armorGrad.addColorStop(0.5, '#d97706');
    armorGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.roundRect(-10, by - 12 + breath, 20, 19, 4);
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 护心青铜吞口
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(0, by - 4 + breath, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 左右双柄雪亮月牙狂刀
    ctx.save();
    ctx.translate(13, by - 6 + breath);
    ctx.rotate(0.25 + bladeWave * 0.04);
    // 刀刃
    const bladeGrad = ctx.createLinearGradient(0, -22, 6, 14);
    bladeGrad.addColorStop(0, '#ffffff');
    bladeGrad.addColorStop(0.5, '#e2e8f0');
    bladeGrad.addColorStop(1, '#94a3b8');
    ctx.fillStyle = bladeGrad;
    ctx.beginPath();
    ctx.moveTo(0, -24);
    ctx.quadraticCurveTo(8, -10, 5, 12);
    ctx.lineTo(0, 10);
    ctx.quadraticCurveTo(2, -8, -2, -22);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // 刀柄
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1.5, 10, 3, 10);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-3, 8, 6, 2.5);
    ctx.restore();

    // 猛虎先锋头面
    const headY = by - 19 + breath;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(0, headY, 8.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // 虎耳
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(-6.5, headY - 7.5, 3.2, 0, Math.PI * 2);
    ctx.arc(6.5, headY - 7.5, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6.5, headY - 7.5, 1.5, 0, Math.PI * 2);
    ctx.arc(6.5, headY - 7.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 额头“王”字
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(-3, headY - 5); ctx.lineTo(3, headY - 5);
    ctx.moveTo(-2, headY - 3); ctx.lineTo(2, headY - 3);
    ctx.moveTo(-4, headY - 1); ctx.lineTo(4, headY - 1);
    ctx.moveTo(0, headY - 6); ctx.lineTo(0, headY - 1);
    ctx.stroke();

    // 凶煞吊睛白额双眼
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-3, headY + 1.5, 2, 0, Math.PI * 2);
    ctx.arc(3, headY + 1.5, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-3, headY + 1.5, 1, 0, Math.PI * 2);
    ctx.arc(3, headY + 1.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // 獠牙大口
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-2.5, headY + 4); ctx.lineTo(-1.5, headY + 7); ctx.lineTo(-0.5, headY + 4);
    ctx.moveTo(0.5, headY + 4); ctx.lineTo(1.5, headY + 7); ctx.lineTo(2.5, headY + 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 15. 仙宠·青玄灵蛇 (盘旋如意、金冠宝石目)
  // =========================================================================
    // =========================================================================
  // 百兽之王·吊睛白额猛虎 (金黄黑纹斑斓躯、额顶王字、吊睛金瞳、森白獠牙利爪)
  // =========================================================================
  static drawTiger(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const legMove = isMoving ? Math.sin(animTimer * 0.4) * 4 : 0;
    const tailSwing = Math.sin(animTimer * 0.25) * 5;

    // 阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, by + 15, 18, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 刚劲如钢鞭的斑斓长尾
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, by + 2);
    ctx.quadraticCurveTo(-26, by - 6 + tailSwing, -24, by - 16 + tailSwing);
    ctx.stroke();
    // 尾部黑环纹
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-21, by - 2 + tailSwing * 0.5); ctx.lineTo(-20, by);
    ctx.moveTo(-24, by - 10 + tailSwing); ctx.lineTo(-23, by - 8 + tailSwing);
    ctx.stroke();

    // 强壮后肢与利爪
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.moveTo(-13, by + 2); ctx.quadraticCurveTo(-16, by + 8, -15, by + 14);
    ctx.lineTo(-10, by + 14); ctx.quadraticCurveTo(-9, by + 7, -8, by + 2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-5, by + 2); ctx.quadraticCurveTo(-8, by + 8 + legMove, -7, by + 14 + legMove);
    ctx.lineTo(-2, by + 14 + legMove); ctx.quadraticCurveTo(-2, by + 7, 0, by + 2);
    ctx.closePath(); ctx.fill();
    // 虎爪
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, by + 13, 7, 2.5);
    ctx.fillRect(-8, by + 13 + legMove, 7, 2.5);

    // 雄壮金黄黑斑身躯
    const tigerGrad = ctx.createLinearGradient(-15, by - 8, 15, by + 8);
    tigerGrad.addColorStop(0, '#d97706');
    tigerGrad.addColorStop(0.5, '#f59e0b');
    tigerGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = tigerGrad;
    ctx.beginPath();
    ctx.roundRect(-15, by - 7, 26, 15, 6);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 腹部白绒毛
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-2, by + 5, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 虎身黑色斑纹
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-10, by - 6); ctx.lineTo(-8, by - 1);
    ctx.moveTo(-4, by - 7); ctx.lineTo(-3, by + 1);
    ctx.moveTo(2, by - 7); ctx.lineTo(3, by);
    ctx.moveTo(8, by - 6); ctx.lineTo(7, by - 2);
    ctx.stroke();

    // 强壮前肢
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(5, by + 2); ctx.quadraticCurveTo(6, by + 8 + legMove, 7 + legMove, by + 14);
    ctx.lineTo(12 + legMove, by + 14); ctx.quadraticCurveTo(11, by + 7, 10, by + 2);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(6 + legMove, by + 13, 7, 2.5);

    // 威严猛虎头庞
    const headY = by - 8;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(14, headY, 9, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 虎耳
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(9, headY - 8, 3.5, 0, Math.PI * 2);
    ctx.arc(17, headY - 8, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(9, headY - 8, 1.8, 0, Math.PI * 2);
    ctx.arc(17, headY - 8, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 额顶霸气“王”字黑纹
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(11, headY - 6); ctx.lineTo(17, headY - 6);
    ctx.moveTo(12, headY - 4); ctx.lineTo(16, headY - 4);
    ctx.moveTo(10, headY - 2); ctx.lineTo(18, headY - 2);
    ctx.moveTo(14, headY - 7); ctx.lineTo(14, headY - 2);
    ctx.stroke();

    // 吊睛金瞳
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(14, headY + 1, 2.5, 1.8, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(14.5, headY + 1, 1, 0, Math.PI * 2);
    ctx.fill();

    // 虎吻与森白獠牙
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(19, headY + 3.5, 4.5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(22, headY + 2, 1.5, 0, Math.PI * 2);
    ctx.fill();
    // 獠牙
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(19, headY + 4); ctx.lineTo(20.5, headY + 7); ctx.lineTo(21.5, headY + 4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 五行山·百年枯树精 (皲裂古木躯干、深邃树洞幽眼、枯枝虬结化臂)
  // =========================================================================
  static drawTreeDemon(ctx, by, animTimer, direction) {
    ctx.save();
    const branchSway = Math.sin(animTimer * 0.15) * 3;
    const eyeGlow = 0.5 + Math.sin(animTimer * 0.2) * 0.4;

    // 根系阴影
    ctx.fillStyle = 'rgba(20, 15, 10, 0.48)';
    ctx.beginPath();
    ctx.ellipse(0, by + 16, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 盘结入地的枯木树根
    ctx.fillStyle = '#3f2e20';
    ctx.beginPath();
    ctx.moveTo(-11, by + 10); ctx.lineTo(-17, by + 17); ctx.lineTo(-7, by + 15);
    ctx.moveTo(8, by + 10); ctx.lineTo(16, by + 17); ctx.lineTo(5, by + 15);
    ctx.closePath();
    ctx.fill();

    // 苍老粗壮树干躯体
    const woodGrad = ctx.createLinearGradient(-13, by - 18, 13, by + 15);
    woodGrad.addColorStop(0, '#543d2b');
    woodGrad.addColorStop(0.5, '#3d2b1d');
    woodGrad.addColorStop(1, '#271b12');
    ctx.fillStyle = woodGrad;
    ctx.beginPath();
    ctx.moveTo(-10, by + 14);
    ctx.quadraticCurveTo(-14, by - 4, -9, by - 20);
    ctx.lineTo(9, by - 20);
    ctx.quadraticCurveTo(14, by - 4, 10, by + 14);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#18100a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 皲裂树皮纵深裂纹
    ctx.strokeStyle = '#18100a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-4, by - 16); ctx.lineTo(-6, by - 2); ctx.lineTo(-3, by + 10);
    ctx.moveTo(3, by - 14); ctx.lineTo(5, by); ctx.lineTo(2, by + 8);
    ctx.stroke();

    // 左右张牙舞爪的枯木枝桠臂膀
    ctx.strokeStyle = '#543d2b';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    // 左枝臂
    ctx.moveTo(-8, by - 6);
    ctx.quadraticCurveTo(-18, by - 14 + branchSway, -22, by - 8 + branchSway);
    // 右枝臂
    ctx.moveTo(8, by - 6);
    ctx.quadraticCurveTo(18, by - 14 - branchSway, 22, by - 8 - branchSway);
    ctx.stroke();

    // 树冠顶端零星几片残破绿叶
    ctx.fillStyle = '#65a30d';
    ctx.beginPath();
    ctx.ellipse(-5, by - 22 + branchSway * 0.5, 3.5, 2, -0.4, 0, Math.PI * 2);
    ctx.ellipse(4, by - 23 - branchSway * 0.5, 3.8, 2.2, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // 树干正中央：深邃空心树洞与发光邪魅幽眸
    ctx.fillStyle = '#100b07';
    ctx.beginPath();
    ctx.ellipse(0, by - 5, 6, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#271b12';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 树洞内幽绿邪光眼眸
    ctx.fillStyle = `rgba(132, 204, 22, ${eyeGlow})`;
    ctx.beginPath();
    ctx.arc(-2.5, by - 5, 1.8, 0, Math.PI * 2);
    ctx.arc(2.5, by - 5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 长安城·卢国公程咬金 (大唐开国宿将、铁塔魁梧身材、大红官袍配精钢明光甲、宣花大板斧)
  // =========================================================================
  static drawChengYaojin(ctx, by, animTimer, direction) {
    ctx.save();
    const breath = Math.sin(animTimer * 0.12) * 0.6;
    // 魁梧铁甲身躯
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath(); ctx.roundRect(-12, by - 12 + breath, 24, 22, 4); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1.5; ctx.stroke();
    // 护心镜
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(0, by - 3 + breath, 5, 0, Math.PI * 2); ctx.fill();
    // 络腮浓须英武大脸
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.arc(0, by - 17 + breath, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#18181b';
    ctx.beginPath(); ctx.arc(0, by - 14 + breath, 6.5, 0.2, Math.PI - 0.2); ctx.fill(); // 浓密络腮胡
    // 凤翅战盔
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.roundRect(-7, by - 24 + breath, 14, 8, 2); ctx.fill();
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.arc(0, by - 25 + breath, 3, 0, Math.PI * 2); ctx.fill();
    // 宣花大板斧 (斜立身旁)
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(14, by - 28); ctx.lineTo(14, by + 14); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.arc(14, by - 20, 7, -Math.PI * 0.5, Math.PI * 0.5); ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // 长安城·伏魔天师钟馗 (铁面虬鬓、乌纱判官折角官帽、大红锦袍、降魔青锋剑)
  // =========================================================================
  static drawZhongKui(ctx, by, animTimer, direction) {
    ctx.save();
    const breath = Math.sin(animTimer * 0.12) * 0.6;
    // 大红锦绣官袍
    ctx.fillStyle = '#dc2626';
    ctx.beginPath(); ctx.roundRect(-10, by - 10 + breath, 20, 22, 3); ctx.fill();
    ctx.strokeStyle = '#09090b'; ctx.lineWidth = 1; ctx.stroke();
    // 宽玉官带
    ctx.fillStyle = '#09090b'; ctx.fillRect(-10, by + 1 + breath, 20, 3.5);
    ctx.fillStyle = '#34d399'; ctx.fillRect(-2, by + 1 + breath, 4, 3.5);
    // 铁面虬鬓
    ctx.fillStyle = '#78350f';
    ctx.beginPath(); ctx.arc(0, by - 16 + breath, 6.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#09090b'; // 钢针浓髯
    ctx.beginPath(); ctx.arc(0, by - 13 + breath, 7, 0.1, Math.PI - 0.1); ctx.fill();
    // 怒目圆睁环眼
    const headY = by - 17 + breath;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-2.5, headY, 1.8, 0, Math.PI * 2);
    ctx.arc(2.5, headY, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(-2.5, headY, 1, 0, Math.PI * 2);
    ctx.arc(2.5, headY, 1, 0, Math.PI * 2);
    ctx.fill();
    // 乌纱判官折翅官帽
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-7, by - 24 + breath, 14, 7);
    ctx.fillRect(-15, by - 21 + breath, 8, 2.5); // 展角
    ctx.fillRect(7, by - 21 + breath, 8, 2.5);
    // 佩剑
    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-11, by - 8 + breath); ctx.lineTo(-14, by + 12 + breath); ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 长安城·杜子美游方书生 (青衫襕衫、折角纶巾、手持折扇洒金书卷)
  // =========================================================================
  static drawChanganScholar(ctx, by, animTimer, direction) {
    ctx.save();
    const breath = Math.sin(animTimer * 0.12) * 0.5;
    // 淡青书生襕衫
    ctx.fillStyle = '#0284c7';
    ctx.beginPath(); ctx.roundRect(-8, by - 10 + breath, 16, 21, [2, 2, 4, 4]); ctx.fill();
    ctx.strokeStyle = '#bae6fd'; ctx.lineWidth = 0.8; ctx.stroke();
    // 纯白交领
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-3, by - 10 + breath, 6, 6);
    // 儒雅白皙面庞
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath(); ctx.ellipse(0, by - 16 + breath, 5.5, 6, 0, 0, Math.PI * 2); ctx.fill();
    // 青黑纶巾方帽
    ctx.fillStyle = '#0c4a6e';
    ctx.fillRect(-5.5, by - 23 + breath, 11, 7);
    ctx.fillRect(-4, by - 26 + breath, 8, 3.5);
    // 右手折扇
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.moveTo(9, by - 2 + breath); ctx.lineTo(15, by - 9 + breath); ctx.lineTo(17, by - 4 + breath);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // 长安城·苏绣娘织造丽人 (飞天仙髻、金步摇、粉霞刺绣齐胸襦裙、手执香帕)
  // =========================================================================
  static drawChanganGirl(ctx, by, animTimer, direction) {
    ctx.save();
    const breath = Math.sin(animTimer * 0.12) * 0.5;
    // 粉霞罗裙
    const skirtGrad = ctx.createLinearGradient(-8, by - 7 + breath, 8, by + 14);
    skirtGrad.addColorStop(0, '#f472b6'); skirtGrad.addColorStop(1, '#db2777');
    ctx.fillStyle = skirtGrad;
    ctx.beginPath(); ctx.moveTo(-6, by - 7 + breath); ctx.lineTo(6, by - 7 + breath);
    ctx.lineTo(8.5, by + 14); ctx.lineTo(-8.5, by + 14); ctx.closePath(); ctx.fill();
    // 水蓝对襟上衣
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath(); ctx.roundRect(-6.5, by - 12 + breath, 13, 6.5, 2); ctx.fill();
    // 秀丽容颜与飞天云髻
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath(); ctx.arc(0, by - 16 + breath, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#18181b'; // 乌黑发髻
    ctx.beginPath(); ctx.arc(0, by - 18 + breath, 5.5, Math.PI, 0); ctx.fill();
    ctx.beginPath(); ctx.arc(0, by - 22 + breath, 3.5, 0, Math.PI * 2); ctx.fill();
    // 金凤步摇
    ctx.fillStyle = '#ffd700'; ctx.fillRect(4, by - 21 + breath, 3.5, 1.5);
    ctx.restore();
  }

  // =========================================================================
  // 长安城·茶肆阿婆 (花白青巾、深蓝布衫、慈祥可亲、手执青瓷茶壶)
  // =========================================================================
  static drawChanganTeaGranny(ctx, by, animTimer, direction) {
    ctx.save();
    const breath = Math.sin(animTimer * 0.1) * 0.4;
    // 深蓝粗布裙与白围裙
    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath(); ctx.roundRect(-8, by - 8 + breath, 16, 20, 3); ctx.fill();
    ctx.fillStyle = '#f8fafc'; // 围裙
    ctx.fillRect(-5.5, by - 3 + breath, 11, 14);
    // 慈祥圆脸
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.arc(0, by - 14 + breath, 5.5, 0, Math.PI * 2); ctx.fill();
    // 银白花发与青布头巾
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath(); ctx.arc(0, by - 16 + breath, 6, Math.PI, 0); ctx.fill();
    ctx.fillStyle = '#0f766e'; // 青头巾
    ctx.fillRect(-6.5, by - 18 + breath, 13, 3.5);
    // 怀抱青瓷茶壶
    ctx.fillStyle = '#0d9488';
    ctx.beginPath(); ctx.arc(6, by + breath, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // 长安城·挑担货郎阿福 (斗笠草鞋、肩挑朱漆百宝货担)
  // =========================================================================
  static drawChanganHawker(ctx, by, animTimer, direction) {
    ctx.save();
    const breath = Math.sin(animTimer * 0.12) * 0.5;
    // 短打短衫与绑腿马裤
    ctx.fillStyle = '#a16207';
    ctx.fillRect(-6, by - 8 + breath, 12, 14);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-5.5, by + 6, 4, 7); ctx.fillRect(1.5, by + 6, 4, 7);
    // 货郎淳朴面庞与青竹大斗笠
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.arc(0, by - 13 + breath, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ca8a04'; // 斗笠
    ctx.beginPath(); ctx.moveTo(-11, by - 14 + breath); ctx.lineTo(0, by - 21 + breath); ctx.lineTo(11, by - 14 + breath); ctx.closePath(); ctx.fill();
    // 肩挑扁担与前后朱漆百宝货箱
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-16, by - 8 + breath); ctx.lineTo(16, by - 8 + breath); ctx.stroke();
    ctx.fillStyle = '#dc2626'; // 红漆货格
    ctx.fillRect(-18, by - 4 + breath, 6, 8);
    ctx.fillRect(12, by - 4 + breath, 6, 8);
    ctx.restore();
  }

  // =========================================================================
  // 长安城·坊间顽童小虎 (红肚兜短褂、冲天揪辫、手持七彩风车)
  // =========================================================================
  static drawChanganChild(ctx, by, animTimer, direction) {
    ctx.save();
    const windmillRot = animTimer * 0.4;
    // 矮萌圆滚小身子
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath(); ctx.roundRect(-5, by - 4, 10, 11, 3); ctx.fill();
    // 大红肚兜
    ctx.fillStyle = '#ef4444';
    ctx.beginPath(); ctx.moveTo(-4, by - 4); ctx.lineTo(4, by - 4); ctx.lineTo(0, by + 4); ctx.closePath(); ctx.fill();
    // 圆滚小脑袋
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(0, by - 9, 5, 0, Math.PI * 2); ctx.fill();
    // 冲天小辫红头绳
    ctx.fillStyle = '#09090b';
    ctx.beginPath(); ctx.arc(0, by - 15, 2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ef4444'; ctx.fillRect(-1.5, by - 14, 3, 2);
    // 高举旋转彩色风车
    ctx.strokeStyle = '#ca8a04'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(7, by - 2); ctx.lineTo(7, by - 16); ctx.stroke();
    ctx.save(); ctx.translate(7, by - 16); ctx.rotate(windmillRot);
    ctx.fillStyle = '#ef4444'; ctx.fillRect(-3, -1, 6, 2);
    ctx.fillStyle = '#38bdf8'; ctx.fillRect(-1, -3, 2, 6);
    ctx.restore();
    ctx.restore();
  }

  // =========================================================================
  // 长安城·御林禁军大唐武卒 (明光金甲重铠、凤翅护耳红缨铁盔、长戟战槊)
  // =========================================================================
  static drawChanganGuard(ctx, by, animTimer, direction) {
    ctx.save();
    // 明光重装战铠
    ctx.fillStyle = '#334155';
    ctx.beginPath(); ctx.roundRect(-9, by - 11, 18, 20, 2); ctx.fill();
    // 双护心铜镜
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.arc(-3.5, by - 4, 3.2, 0, Math.PI * 2); ctx.arc(3.5, by - 4, 3.2, 0, Math.PI * 2); ctx.fill();
    // 威严面庞
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.arc(0, by - 16, 5.5, 0, Math.PI * 2); ctx.fill();
    // 大唐铁盔战缨
    ctx.fillStyle = '#1e293b';
    ctx.beginPath(); ctx.roundRect(-6.5, by - 22, 13, 7, 2); ctx.fill();
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(0, by - 23, 2.5, 0, Math.PI * 2); ctx.fill();
    // 笔直挺立长戟
    ctx.strokeStyle = '#78350f'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(11, by - 26); ctx.lineTo(11, by + 12); ctx.stroke();
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath(); ctx.moveTo(11, by - 30); ctx.lineTo(14, by - 24); ctx.lineTo(8, by - 24); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // 长安城·回生堂老名医 (银白长须、金丝药箱、仙风道骨)
  // =========================================================================
  static drawDoctor(ctx, by, animTimer, direction) {
    ctx.save();
    const breath = Math.sin(animTimer * 0.1) * 0.5;
    // 碧青云纹道服长袍
    ctx.fillStyle = '#065f46';
    ctx.beginPath(); ctx.roundRect(-8, by - 9 + breath, 16, 21, 3); ctx.fill();
    ctx.strokeStyle = '#34d399'; ctx.lineWidth = 0.8; ctx.stroke();
    // 银白美须公
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.arc(0, by - 15 + breath, 5.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff'; // 长长银须
    ctx.beginPath(); ctx.moveTo(-3, by - 12 + breath); ctx.lineTo(0, by - 4 + breath); ctx.lineTo(3, by - 12 + breath); ctx.closePath(); ctx.fill();
    // 员外方帽
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-5.5, by - 22 + breath, 11, 7);
    // 斜挎金丝红木药箱
    ctx.fillStyle = '#78350f'; ctx.fillRect(-13, by - 2 + breath, 6, 7);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 0.6; ctx.strokeRect(-13, by - 2 + breath, 6, 7);
    ctx.restore();
  }

  // =========================================================================
  // 长安城·户籍定居官 (大唐绿袍七品官服、展翅硬折翅官帽、手托玉印)
  // =========================================================================
  static drawChanganOfficial(ctx, by, animTimer, direction) {
    ctx.save();
    const breath = Math.sin(animTimer * 0.1) * 0.5;
    // 大唐正规绿袍官服
    ctx.fillStyle = '#15803d';
    ctx.beginPath(); ctx.roundRect(-9, by - 9 + breath, 18, 21, 2); ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 0.8; ctx.stroke();
    // 官容
    ctx.fillStyle = '#fde68a';
    ctx.beginPath(); ctx.arc(0, by - 15 + breath, 5.5, 0, Math.PI * 2); ctx.fill();
    // 展翅乌纱官帽
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-6, by - 22 + breath, 12, 7);
    ctx.fillRect(-14, by - 19 + breath, 8, 2); ctx.fillRect(6, by - 19 + breath, 8, 2);
    // 手托官印
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(8, by - 1 + breath, 5, 4.5);
    ctx.restore();
  }

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

  // =========================================================================
  // 19. 灵河巨蚌 / 碧水老蚌精 (珍珠荧光、开合双壳)
  // =========================================================================
  // =========================================================================
  // 19. 灵河巨蚌 / 东海蚌群 (1:1 像素级复刻实机截图右下角“蚌群”：深蓝紫与翠绿双重灵贝、千年东海夜明神珠、五彩珊瑚与水草气泡)
  // =========================================================================
  static drawClam(ctx, by, animTimer, direction) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);
    const breathe = Math.sin(animTimer * 0.16) * 2;
    const pearlPulse = Math.sin(animTimer * 0.22) * 2.5;

    // 1. 浅滩水草与五彩珊瑚丛底衬
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(8, by + 6);
    ctx.lineTo(11, by - 2);
    ctx.lineTo(9, by - 8);
    ctx.moveTo(11, by - 2);
    ctx.lineTo(15, by - 5);
    ctx.stroke();

    const weedWave = Math.sin(animTimer * 0.2) * 2.5;
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(-11, by + 6);
    ctx.quadraticCurveTo(-14 + weedWave, by, -12 + weedWave, by - 7);
    ctx.moveTo(-8, by + 6);
    ctx.quadraticCurveTo(-9 + weedWave, by + 1, -6 + weedWave, by - 5);
    ctx.stroke();

    // 2. 左后侧次席翡翠青蚌 (簇拥形成实机“蚌群”)
    ctx.fillStyle = '#065f46';
    ctx.beginPath();
    ctx.ellipse(-9, by + 2, 8, 5.5, -0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. 中央主尊千年神蚌 (深蓝紫渐变扇形硬甲)
    ctx.fillStyle = 'rgba(0, 10, 30, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, by + 8, 16, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const lowerShellGrad = ctx.createLinearGradient(-15, by, 15, by + 9);
    lowerShellGrad.addColorStop(0, '#1e1b4b');
    lowerShellGrad.addColorStop(0.5, '#312e81');
    lowerShellGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = lowerShellGrad;
    ctx.beginPath();
    ctx.ellipse(0, by + 5, 15, 8.5, 0, 0, Math.PI);
    ctx.fill();
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    const meatGrad = ctx.createRadialGradient(0, by + 2, 1, 0, by + 2, 12);
    meatGrad.addColorStop(0, '#fdf2f8');
    meatGrad.addColorStop(0.5, '#fbcfe8');
    meatGrad.addColorStop(0.85, '#f472b6');
    meatGrad.addColorStop(1, '#831843');
    ctx.fillStyle = meatGrad;
    ctx.beginPath();
    ctx.ellipse(0, by + 2.5, 12, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. 核心瑰宝：东海千年温润发光夜明神珠
    const pearlGlowGrad = ctx.createRadialGradient(0, by + 1, 1, 0, by + 1, 9 + pearlPulse);
    pearlGlowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    pearlGlowGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.65)');
    pearlGlowGrad.addColorStop(0.75, 'rgba(14, 165, 233, 0.25)');
    pearlGlowGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = pearlGlowGrad;
    ctx.beginPath();
    ctx.arc(0, by + 1, 9 + pearlPulse, 0, Math.PI * 2);
    ctx.fill();

    const pGrad = ctx.createRadialGradient(-1.2, by - 0.5, 0.5, 0, by + 1, 4.5);
    pGrad.addColorStop(0, '#ffffff');
    pGrad.addColorStop(0.4, '#f0fdf4');
    pGrad.addColorStop(0.75, '#bae6fd');
    pGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(0, by + 1, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-1.5, by - 0.5, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // 5. 上半张开的扇贝硬壳
    const upperY = by - 2 - breathe;
    const upperShellGrad = ctx.createLinearGradient(0, upperY - 11, 0, upperY);
    upperShellGrad.addColorStop(0, '#3730a3');
    upperShellGrad.addColorStop(0.5, '#4338ca');
    upperShellGrad.addColorStop(0.85, '#6366f1');
    upperShellGrad.addColorStop(1, '#a5b4fc');
    ctx.fillStyle = upperShellGrad;
    ctx.beginPath();
    ctx.ellipse(0, upperY, 15, 10, 0, Math.PI, 0);
    ctx.fill();
    ctx.strokeStyle = '#c7d2fe';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 1;
    for (let angle = 0.18; angle <= 0.82; angle += 0.16) {
      ctx.beginPath();
      ctx.moveTo(0, upperY);
      ctx.lineTo(Math.cos(angle * Math.PI) * 14.5, upperY - Math.sin(angle * Math.PI) * 9.5);
      ctx.stroke();
    }

    // 6. 浮动在水中的晶莹珍珠气泡
    for (let b = 0; b < 3; b++) {
      const bTime = (animTimer * 12 + b * 20) % 24;
      const bX = (b - 1) * 7 + Math.sin(animTimer * 0.3 + b) * 2;
      const bY = by - 4 - bTime;
      const bAlpha = Math.max(0, 1 - bTime / 24);
      ctx.fillStyle = 'rgba(224, 242, 254, ' + (bAlpha * 0.8) + ')';
      ctx.beginPath();
      ctx.arc(bX, bY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // =========================================================================
  // 20. 铁甲金蟹 / 巨钳青蟹怪 (硬甲横行、左右威猛巨鳌)
  // =========================================================================
  static drawCrab(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const t = animTimer;
    const legWalk = isMoving ? Math.sin(t * 0.32) * 3 : 0;
    const clawSnap = Math.sin(t * 0.22) * 2.5;
    const breathe = Math.sin(t * 0.2) * 0.8;

    // ── 步足（左右各3条，节肢动感）──
    // 左侧步足
    const legColors = ['#c87000', '#e0920a', '#d48010'];
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const legY = by + 2 + i * 3.5;
      ctx.strokeStyle = legColors[i];
      ctx.lineWidth = 2.2 - i * 0.3;
      ctx.beginPath();
      ctx.moveTo(-6 - i, legY);
      ctx.quadraticCurveTo(-14, legY + 4 + legWalk * (i % 2 === 0 ? 1 : -1), -18 + i, legY + 12 + legWalk * (i % 2 === 0 ? 0.5 : -0.5));
      ctx.stroke();
      // 右侧步足
      ctx.beginPath();
      ctx.moveTo(6 + i, legY);
      ctx.quadraticCurveTo(14, legY + 4 - legWalk * (i % 2 === 0 ? 1 : -1), 18 - i, legY + 12 - legWalk * (i % 2 === 0 ? 0.5 : -0.5));
      ctx.stroke();
    }

    // ── 蟹壳（梯形厚甲，多层渐变）──
    // 底层阴影
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(1, by + 8 + breathe, 12, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 主壳体（四层精细渐变）
    const shellG = ctx.createLinearGradient(-11, by - 4 + breathe, 11, by + 12 + breathe);
    shellG.addColorStop(0, '#f59e0b');
    shellG.addColorStop(0.25, '#d97706');
    shellG.addColorStop(0.6, '#b45309');
    shellG.addColorStop(1, '#78350f');
    ctx.fillStyle = shellG;
    ctx.beginPath();
    ctx.moveTo(-12, by + 10 + breathe);
    ctx.bezierCurveTo(-14, by + 5 + breathe, -10, by - 3 + breathe, -5, by - 5 + breathe);
    ctx.bezierCurveTo(-2, by - 6.5 + breathe, 2, by - 6.5 + breathe, 5, by - 5 + breathe);
    ctx.bezierCurveTo(10, by - 3 + breathe, 14, by + 5 + breathe, 12, by + 10 + breathe);
    ctx.bezierCurveTo(8, by + 13 + breathe, -8, by + 13 + breathe, -12, by + 10 + breathe);
    ctx.closePath();
    ctx.fill();

    // 壳面高光（左上方光泽）
    const shellHi = ctx.createLinearGradient(-10, by - 3 + breathe, 0, by + 4 + breathe);
    shellHi.addColorStop(0, 'rgba(255,200,50,0.4)');
    shellHi.addColorStop(1, 'rgba(255,200,50,0)');
    ctx.fillStyle = shellHi;
    ctx.beginPath();
    ctx.ellipse(-3, by + 2 + breathe, 7, 5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // 壳纹（放射状纹路）
    ctx.strokeStyle = 'rgba(120,53,15,0.5)';
    ctx.lineWidth = 0.8;
    for (let angle = -0.6; angle <= 0.6; angle += 0.3) {
      ctx.beginPath();
      ctx.moveTo(0, by + 13 + breathe);
      ctx.lineTo(Math.sin(angle) * 14, by - 5 + Math.cos(angle) * 5 + breathe);
      ctx.stroke();
    }

    // 壳缘金边
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-12, by + 10 + breathe);
    ctx.bezierCurveTo(-14, by + 5 + breathe, -10, by - 3 + breathe, -5, by - 5 + breathe);
    ctx.bezierCurveTo(-2, by - 6.5 + breathe, 2, by - 6.5 + breathe, 5, by - 5 + breathe);
    ctx.bezierCurveTo(10, by - 3 + breathe, 14, by + 5 + breathe, 12, by + 10 + breathe);
    ctx.stroke();

    // ── 眼睛（凸起眼柄）──
    // 眼柄
    ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-4, by - 4 + breathe); ctx.lineTo(-5, by - 8 + breathe); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(4, by - 4 + breathe); ctx.lineTo(5, by - 8 + breathe); ctx.stroke();
    // 眼球
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(-5, by - 8.5 + breathe, 2.2, 0, Math.PI * 2);
    ctx.arc(5, by - 8.5 + breathe, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // 眼睛高光
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.beginPath();
    ctx.arc(-6, by - 9.5 + breathe, 0.8, 0, Math.PI * 2);
    ctx.arc(4, by - 9.5 + breathe, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // ── 双钳（威猛大鳌）──
    // 左巨钳
    const clawG1 = ctx.createLinearGradient(-22, by - 8, -10, by);
    clawG1.addColorStop(0, '#dc2626'); clawG1.addColorStop(0.5, '#ef4444'); clawG1.addColorStop(1, '#b91c1c');
    ctx.fillStyle = clawG1;
    ctx.beginPath();
    ctx.moveTo(-6, by - 1 + breathe);
    ctx.bezierCurveTo(-10, by - 6 + breathe, -18, by - 8 + clawSnap, -22, by - 5 + clawSnap);
    ctx.bezierCurveTo(-24, by - 3 + clawSnap, -23, by + 1 + clawSnap, -20, by + 2 + clawSnap);
    ctx.bezierCurveTo(-16, by + 3 + clawSnap, -10, by + 1 + breathe, -6, by + 2 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1;
    ctx.stroke();
    // 钳口（利齿）
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-20, by - 4 + clawSnap);
    ctx.lineTo(-15, by - 5 + clawSnap);
    ctx.lineTo(-16, by + 2 + clawSnap);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.moveTo(-21, by - 4 + clawSnap); ctx.lineTo(-19, by - 7 + clawSnap); ctx.lineTo(-17, by - 3 + clawSnap); ctx.closePath(); ctx.fill();

    // 右巨钳
    const clawG2 = ctx.createLinearGradient(10, by - 8, 22, by);
    clawG2.addColorStop(0, '#b91c1c'); clawG2.addColorStop(0.5, '#ef4444'); clawG2.addColorStop(1, '#dc2626');
    ctx.fillStyle = clawG2;
    ctx.beginPath();
    ctx.moveTo(6, by - 1 + breathe);
    ctx.bezierCurveTo(10, by - 6 + breathe, 18, by - 8 - clawSnap, 22, by - 5 - clawSnap);
    ctx.bezierCurveTo(24, by - 3 - clawSnap, 23, by + 1 - clawSnap, 20, by + 2 - clawSnap);
    ctx.bezierCurveTo(16, by + 3 - clawSnap, 10, by + 1 + breathe, 6, by + 2 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(20, by - 4 - clawSnap); ctx.lineTo(15, by - 5 - clawSnap); ctx.lineTo(16, by + 2 - clawSnap); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#f0f0f0';
    ctx.beginPath();
    ctx.moveTo(21, by - 4 - clawSnap); ctx.lineTo(19, by - 7 - clawSnap); ctx.lineTo(17, by - 3 - clawSnap); ctx.closePath(); ctx.fill();

    ctx.restore();
  }
  // =========================================================================
  // 21. 巡海大龙虾 (赤红长须、弯曲节甲、金枪长戟)
  // =========================================================================
  static drawShrimp(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const t = animTimer;
    const antennaWave = Math.sin(t * 0.18) * 5;
    const tailKick = isMoving ? Math.sin(t * 0.35) * 4 : Math.sin(t * 0.1) * 1;
    const breathe = Math.sin(t * 0.2) * 0.7;

    // ── 长须（两根，精细触角）──
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.4;
    ctx.lineCap = 'round';
    // 右触角
    ctx.beginPath();
    ctx.moveTo(4, by - 12 + breathe);
    ctx.bezierCurveTo(12, by - 22 + antennaWave, 20, by - 26 + antennaWave * 0.8, 26, by - 24 + antennaWave);
    ctx.stroke();
    // 左触角
    ctx.beginPath();
    ctx.moveTo(-2, by - 12 + breathe);
    ctx.bezierCurveTo(-8, by - 22 - antennaWave, -16, by - 25 - antennaWave * 0.8, -22, by - 23 - antennaWave);
    ctx.stroke();

    // ── 甲壳段（6节，从头到尾，分层次）──
    const segColors = ['#dc2626', '#c92222', '#b91c1c', '#a51818', '#921515', '#7f1212'];
    const segWidths = [9, 8.5, 8, 7, 6, 4.5];
    const segHeights = [5, 4.5, 4, 3.5, 3, 2.5];
    for (let seg = 0; seg < 6; seg++) {
      const segY = by - 10 + seg * 5 + tailKick * 0.15 * seg + breathe;
      const segGrad = ctx.createLinearGradient(-segWidths[seg], segY, segWidths[seg], segY);
      segGrad.addColorStop(0, seg < 3 ? '#b91c1c' : '#991515');
      segGrad.addColorStop(0.5, segColors[seg]);
      segGrad.addColorStop(1, seg < 3 ? '#b91c1c' : '#7f1212');
      ctx.fillStyle = segGrad;
      ctx.beginPath();
      ctx.ellipse(0, segY, segWidths[seg], segHeights[seg], 0, 0, Math.PI * 2);
      ctx.fill();
      // 节甲边缘高光
      ctx.strokeStyle = 'rgba(255,160,160,0.4)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(0, segY - 1.5, segWidths[seg] - 2, segHeights[seg] * 0.5, 0, Math.PI, 0);
      ctx.stroke();
      // 段缝
      ctx.strokeStyle = 'rgba(100,0,0,0.5)';
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(-segWidths[seg] + 1, segY + segHeights[seg] - 0.5);
      ctx.lineTo(segWidths[seg] - 1, segY + segHeights[seg] - 0.5);
      ctx.stroke();
    }

    // ── 头胸甲（最前方大甲）──
    const headGrad = ctx.createLinearGradient(-10, by - 15 + breathe, 10, by - 8 + breathe);
    headGrad.addColorStop(0, '#ef4444'); headGrad.addColorStop(0.5, '#dc2626'); headGrad.addColorStop(1, '#991b1b');
    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.roundRect(-10, by - 16 + breathe, 20, 10, 4);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-10, by - 16 + breathe, 20, 10, 4); ctx.stroke();
    // 头胸甲高光
    ctx.fillStyle = 'rgba(255,200,200,0.3)';
    ctx.beginPath();
    ctx.ellipse(-1, by - 13 + breathe, 6, 2.5, 0, 0, Math.PI * 2); ctx.fill();

    // ── 额剑（头顶尖刺）──
    ctx.fillStyle = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(-2, by - 16 + breathe);
    ctx.lineTo(2, by - 16 + breathe);
    ctx.lineTo(0, by - 22 + breathe);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 0.8;
    ctx.stroke();

    // ── 小钳（前方两只小爪）──
    ctx.fillStyle = '#dc2626';
    // 右小钳
    ctx.beginPath();
    ctx.moveTo(8, by - 10 + breathe);
    ctx.bezierCurveTo(14, by - 12 + breathe, 17, by - 9, 16, by - 7);
    ctx.bezierCurveTo(15, by - 5, 11, by - 5 + breathe, 8, by - 7 + breathe);
    ctx.closePath(); ctx.fill();
    // 左小钳
    ctx.beginPath();
    ctx.moveTo(-8, by - 10 + breathe);
    ctx.bezierCurveTo(-14, by - 12 + breathe, -17, by - 9, -16, by - 7);
    ctx.bezierCurveTo(-15, by - 5, -11, by - 5 + breathe, -8, by - 7 + breathe);
    ctx.closePath(); ctx.fill();

    // ── 游泳足（小步足）──
    ctx.strokeStyle = '#f87171'; ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const fy = by - 4 + i * 4.5;
      ctx.beginPath();
      ctx.moveTo(8, fy + breathe);
      ctx.lineTo(16 + tailKick * 0.3 * (i % 2 === 0 ? 1 : -1), fy + 5 + breathe);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-8, fy + breathe);
      ctx.lineTo(-16 - tailKick * 0.3 * (i % 2 === 0 ? 1 : -1), fy + 5 + breathe);
      ctx.stroke();
    }

    // ── 扇形尾（展开多叶尾扇）──
    const tailY = by + 22 + tailKick;
    // 中央尾叶
    const tailGrad = ctx.createLinearGradient(0, by + 12, 0, tailY);
    tailGrad.addColorStop(0, '#dc2626'); tailGrad.addColorStop(1, '#7f1d1d');
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(-3, by + 12);
    ctx.bezierCurveTo(-5, by + 16, -4, tailY - 2, 0, tailY);
    ctx.bezierCurveTo(4, tailY - 2, 5, by + 16, 3, by + 12);
    ctx.closePath(); ctx.fill();
    // 两侧尾扇叶
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-4, by + 13);
    ctx.bezierCurveTo(-8, by + 15, -10, tailY - 3, -8, tailY);
    ctx.bezierCurveTo(-6, tailY + 1, -4, tailY - 2, -3, by + 14);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4, by + 13);
    ctx.bezierCurveTo(8, by + 15, 10, tailY - 3, 8, tailY);
    ctx.bezierCurveTo(6, tailY + 1, 4, tailY - 2, 3, by + 14);
    ctx.closePath(); ctx.fill();
    // 最外侧短小尾叶
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.moveTo(-6, by + 13);
    ctx.bezierCurveTo(-12, by + 16, -13, tailY - 4, -11, tailY - 2);
    ctx.bezierCurveTo(-9, tailY - 1, -7, tailY - 4, -5, by + 14);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(6, by + 13);
    ctx.bezierCurveTo(12, by + 16, 13, tailY - 4, 11, tailY - 2);
    ctx.bezierCurveTo(9, tailY - 1, 7, tailY - 4, 5, by + 14);
    ctx.closePath(); ctx.fill();

    // ── 眼睛（黑亮复眼）──
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(4, by - 14 + breathe, 2, 0, Math.PI * 2);
    ctx.arc(-4, by - 14 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.beginPath();
    ctx.arc(3.2, by - 15 + breathe, 0.7, 0, Math.PI * 2);
    ctx.arc(-4.8, by - 15 + breathe, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // ── 手中兵器（巡海长戟）──
    const weaponX = 14;
    ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(weaponX, by - 24); ctx.lineTo(weaponX, by + 18); ctx.stroke();
    // 金色戟头
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(weaponX, by - 30);
    ctx.lineTo(weaponX - 3, by - 22);
    ctx.lineTo(weaponX + 3, by - 22);
    ctx.closePath(); ctx.fill();
    // 侧戟刃
    ctx.beginPath();
    ctx.moveTo(weaponX - 3, by - 24);
    ctx.lineTo(weaponX - 8, by - 20);
    ctx.lineTo(weaponX - 2, by - 20);
    ctx.closePath(); ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 1. 青丘野狐 (五行山巡山野狐、野狐岭灵狐)：赤狐毛色、白胸腹、蓬松雪尖狐尾、灵动金瞳
  // =========================================================================
  static drawFox(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const legMove = isMoving ? Math.sin(animTimer * 0.45) * 4 : 0;
    const tailSway = Math.sin(animTimer * 0.22) * 8;

    // 脚底阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, by + 14, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 蓬松狐尾 (大红底色，雪白尾尖)
    ctx.save();
    ctx.translate(-14, by + 4);
    ctx.rotate(-0.4 + tailSway * 0.03);
    // 尾部主躯
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-10, -6, -20, -14, -16, -24);
    ctx.bezierCurveTo(-10, -28, -2, -20, 0, -14);
    ctx.closePath();
    ctx.fill();
    // 雪白尾尖
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-16, -24);
    ctx.bezierCurveTo(-14, -30, -8, -31, -2, -20);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 后腿
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.roundRect(-10, by + 5 + legMove, 5.5, 10, 2.5);
    ctx.roundRect(-4, by + 5 - legMove, 5.5, 10, 2.5);
    ctx.fill();

    // 狐狸身体 (流线型赤狐身躯)
    const bodyGrad = ctx.createLinearGradient(-12, by - 2, 10, by + 8);
    bodyGrad.addColorStop(0, '#ea580c');
    bodyGrad.addColorStop(0.6, '#f97316');
    bodyGrad.addColorStop(1, '#ffedd5');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(-2, by + 4, 13, 7.5, -0.08, 0, Math.PI * 2);
    ctx.fill();

    // 前胸雪白毛丛
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.moveTo(3, by - 2);
    ctx.quadraticCurveTo(10, by + 3, 5, by + 9);
    ctx.quadraticCurveTo(2, by + 4, 3, by - 2);
    ctx.fill();

    // 前腿
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.roundRect(4, by + 5 - legMove, 4.5, 10, 2);
    ctx.roundRect(8, by + 5 + legMove, 4.5, 10, 2);
    ctx.fill();

    // 头部 (清秀倒三角狐狸脸)
    ctx.save();
    ctx.translate(9, by - 4);
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(-4, -6);
    ctx.lineTo(8, 0);
    ctx.lineTo(-4, 6);
    ctx.closePath();
    ctx.fill();

    // 双耳 (尖尖立耳，内耳粉白)
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(-5, -6); ctx.lineTo(-4, -16); ctx.lineTo(1, -6); ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(1, -6); ctx.lineTo(3, -15); ctx.lineTo(6, -5); ctx.closePath(); ctx.fill();
    // 内耳粉色
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.moveTo(-4, -7); ctx.lineTo(-3, -13); ctx.lineTo(0, -7); ctx.closePath(); ctx.fill();

    // 灵动金瞳与黑色微翘鼻尖
    ctx.fillStyle = '#0f172a';
    ctx.beginPath(); ctx.arc(7.5, 0, 1.2, 0, Math.PI * 2); ctx.fill(); // 鼻头
    ctx.fillStyle = '#eab308';
    ctx.beginPath(); ctx.ellipse(1, -1.8, 2.2, 1.2, -0.2, 0, Math.PI * 2); ctx.fill(); // 狐目
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(1.5, -1.8, 0.9, 0, Math.PI * 2); ctx.fill(); // 瞳孔
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 2. 黑风山黑熊精 (黑风大王)：魁梧如山玄甲重铠、胸前银月毛纹、熊掌巨力、黑缨长枪
  // =========================================================================
  static drawBlackBear(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.15, 1.15); // 魁梧体魄微放大

    const legMove = isMoving ? Math.sin(animTimer * 0.4) * 3.5 : 0;
    const breathe = Math.sin(animTimer * 0.15) * 1.0;

    // 脚底浓重煞气黑影
    ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
    ctx.beginPath();
    ctx.ellipse(0, by + 15, 20, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 粗壮双腿 (漆黑厚重熊毛)
    ctx.fillStyle = '#1e1b18';
    ctx.beginPath();
    ctx.roundRect(-10, by + 6 + legMove, 8, 10, 3);
    ctx.roundRect(2, by + 6 - legMove, 8, 10, 3);
    ctx.fill();

    // 熊足锋利爪尖
    ctx.fillStyle = '#78716c';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(-10 + i * 2.6, by + 14 + legMove, 1.8, 2.2);
      ctx.fillRect(2 + i * 2.6, by + 14 - legMove, 1.8, 2.2);
    }

    // 魁梧身躯 (如铁塔般雄浑)
    const bearGrad = ctx.createRadialGradient(0, by - 2, 4, 0, by, 18);
    bearGrad.addColorStop(0, '#38322c');
    bearGrad.addColorStop(1, '#181512');
    ctx.fillStyle = bearGrad;
    ctx.beginPath();
    ctx.ellipse(0, by - 1, 15, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // 胸前标志性银白月牙神纹
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, by - 4 + breathe, 9, 0.4, Math.PI - 0.4);
    ctx.quadraticCurveTo(0, by + 3 + breathe, 0, by + 3 + breathe);
    ctx.fill();

    // 玄铁重肩铠
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(-12, by - 8, 5.5, 0, Math.PI * 2);
    ctx.arc(12, by - 8, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 雄浑熊首
    ctx.fillStyle = '#26221d';
    ctx.beginPath();
    ctx.arc(0, by - 14 + breathe, 9, 0, Math.PI * 2);
    ctx.fill();

    // 圆润熊耳
    ctx.beginPath();
    ctx.arc(-8, by - 22 + breathe, 3.5, 0, Math.PI * 2);
    ctx.arc(8, by - 22 + breathe, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 吻部与獠牙
    ctx.fillStyle = '#443d35';
    ctx.beginPath();
    ctx.ellipse(0, by - 11 + breathe, 5.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, by - 13 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();
    // 寒光森然双獠牙
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-3, by - 10 + breathe); ctx.lineTo(-2, by - 7 + breathe); ctx.lineTo(-1, by - 10 + breathe); ctx.fill();
    ctx.moveTo(1, by - 10 + breathe); ctx.lineTo(2, by - 7 + breathe); ctx.lineTo(3, by - 10 + breathe); ctx.fill();

    // 威严赤红魔瞳
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-4, by - 16 + breathe, 1.8, 0, Math.PI * 2);
    ctx.arc(4, by - 16 + breathe, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // 手中神兵：黑缨丈八长枪
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(14, by - 26);
    ctx.lineTo(14, by + 16);
    ctx.stroke();
    // 枪尖玄铁刺刃
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.moveTo(14, by - 33);
    ctx.lineTo(11, by - 25);
    ctx.lineTo(17, by - 25);
    ctx.closePath();
    ctx.fill();
    // 红黑缨穗
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(14, by - 24, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 3. 圣婴大王·红孩儿 (火云洞霸主)：朝天双冲抓髻、大红莲花肚兜、火尖枪、三昧真火
  // =========================================================================
  static drawHongHaiEr(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 0.95, 0.95);

    const legMove = isMoving ? Math.sin(animTimer * 0.45) * 3 : 0;
    const flameTick = Math.sin(animTimer * 0.3) * 3;

    // 翻滚的三昧真火底圈云光
    ctx.save();
    const fireGrad = ctx.createRadialGradient(0, by + 12, 2, 0, by + 12, 18);
    fireGrad.addColorStop(0, 'rgba(255, 230, 100, 0.9)');
    fireGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.7)');
    fireGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
    ctx.fillStyle = fireGrad;
    ctx.beginPath();
    ctx.ellipse(0, by + 12, 16 + flameTick, 6 + flameTick * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 白嫩小脚
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(-5, by + 10 + legMove, 3, 0, Math.PI * 2);
    ctx.arc(5, by + 10 - legMove, 3, 0, Math.PI * 2);
    ctx.fill();

    // 大红锦缎金莲肚兜
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, by - 5);
    ctx.lineTo(8, by + 8);
    ctx.lineTo(-8, by + 8);
    ctx.closePath();
    ctx.fill();
    // 肚兜金纹
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 纯金乾坤项圈
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, by - 6, 6, 0.2, Math.PI - 0.2);
    ctx.stroke();

    // 粉雕玉琢童颜
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, by - 12, 8, 0, Math.PI * 2);
    ctx.fill();

    // 额前烈火朱砂印
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(0, by - 17);
    ctx.lineTo(-1.5, by - 14);
    ctx.lineTo(1.5, by - 14);
    ctx.closePath();
    ctx.fill();

    // 大眼睛与傲气自信神态
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-3, by - 12, 1.6, 0, Math.PI * 2);
    ctx.arc(3, by - 12, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(-2.5, by - 12.5, 0.6, 0, Math.PI * 2);
    ctx.arc(3.5, by - 12.5, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 朝天双冲抓髻 (左右冲天发髻，系红丝带)
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(-7, by - 20, 3.5, 0, Math.PI * 2);
    ctx.arc(7, by - 20, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // 红丝带飘扬
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, by - 18); ctx.lineTo(-12, by - 15 + flameTick);
    ctx.moveTo(7, by - 18); ctx.lineTo(12, by - 15 + flameTick);
    ctx.stroke();

    // 八丈火尖枪 (枪尖吞吐烈焰)
    ctx.save();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, by - 28);
    ctx.lineTo(11, by + 14);
    ctx.stroke();
    // 赤金枪尖
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(11, by - 34); ctx.lineTo(8, by - 27); ctx.lineTo(14, by - 27); ctx.closePath(); ctx.fill();
    // 枪头三昧真火流火
    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.beginPath();
    ctx.arc(11, by - 30, 3.5 + flameTick * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 4. 平天大圣·牛魔王 (翠云山芭蕉洞/积雷山)：金色冲天巨角、混铁神棍、兽面重铠
  // =========================================================================
  static drawBullDemon(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.25, 1.25); // 庞大妖王压迫感

    const legMove = isMoving ? Math.sin(animTimer * 0.38) * 3.5 : 0;
    const breathe = Math.sin(animTimer * 0.15) * 1.2;

    // 厚重震地阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.beginPath();
    ctx.ellipse(0, by + 15, 21, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 粗壮牛蹄战靴
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.roundRect(-11, by + 7 + legMove, 9, 9, 3);
    ctx.roundRect(3, by + 7 - legMove, 9, 9, 3);
    ctx.fill();

    // 重型铁甲魔躯
    const armorGrad = ctx.createLinearGradient(-14, by - 10, 14, by + 10);
    armorGrad.addColorStop(0, '#334155');
    armorGrad.addColorStop(0.5, '#0f172a');
    armorGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.ellipse(0, by - 1, 16, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    // 黄金兽面护心镜
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, by - 1 + breathe, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();

    // 霸气牛魔头颅
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(0, by - 14 + breathe, 9.5, 0, Math.PI * 2);
    ctx.fill();

    // 冲天苍劲金色弯角 (一对巨大牛角)
    ctx.save();
    const hornGrad = ctx.createLinearGradient(0, by - 15, 0, by - 32);
    hornGrad.addColorStop(0, '#78350f');
    hornGrad.addColorStop(0.6, '#f59e0b');
    hornGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = hornGrad;
    // 左角
    ctx.beginPath();
    ctx.moveTo(-6, by - 18 + breathe);
    ctx.bezierCurveTo(-14, by - 24 + breathe, -18, by - 32 + breathe, -14, by - 34 + breathe);
    ctx.bezierCurveTo(-11, by - 30 + breathe, -4, by - 22 + breathe, -3, by - 18 + breathe);
    ctx.closePath();
    ctx.fill();
    // 右角
    ctx.beginPath();
    ctx.moveTo(6, by - 18 + breathe);
    ctx.bezierCurveTo(14, by - 24 + breathe, 18, by - 32 + breathe, 14, by - 34 + breathe);
    ctx.bezierCurveTo(11, by - 30 + breathe, 4, by - 22 + breathe, 3, by - 18 + breathe);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 纯金大牛鼻环
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, by - 9 + breathe, 3.2, 0, Math.PI * 2);
    ctx.stroke();

    // 凶狠煞气红金双瞳
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(-4, by - 15 + breathe, 2, 0, Math.PI * 2);
    ctx.arc(4, by - 15 + breathe, 2, 0, Math.PI * 2);
    ctx.fill();

    // 兵刃：万钧混铁神棍
    ctx.save();
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(15, by - 28);
    ctx.lineTo(15, by + 16);
    ctx.stroke();
    // 棍头包金箍
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(13, by - 28, 4, 6);
    ctx.fillRect(13, by + 10, 4, 6);
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 5. 金池长老 (观音禅院老和尚)：百岁驼背干瘦、深红描金锦襕袈裟、长眉如雪垂胸、九环紫檀锡杖
  // =========================================================================
  static drawJinchiElder(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    const legMove = isMoving ? Math.sin(animTimer * 0.3) * 2 : 0;
    const breathe = Math.sin(animTimer * 0.15) * 0.8;

    // 脚底阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.36)';
    ctx.beginPath();
    ctx.ellipse(0, by + 14, 15, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 僧鞋
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(-6, by + 8 + legMove, 5, 7, 2);
    ctx.roundRect(1, by + 8 - legMove, 5, 7, 2);
    ctx.fill();

    // 驼背身躯披深红描金锦襕袈裟 (极尽奢华)
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(-1, by + 1, 11, 13, 0.1, 0, Math.PI * 2);
    ctx.fill();
    // 袈裟金线方格佛纹
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-9, by - 4); ctx.lineTo(7, by + 6);
    ctx.moveTo(-6, by - 8); ctx.lineTo(9, by + 2);
    ctx.moveTo(-8, by + 4); ctx.lineTo(5, by - 8);
    ctx.stroke();

    // 巨型菩提佛珠 (挂于颈项)
    ctx.fillStyle = '#451a03';
    for (let i = 0; i < 7; i++) {
      const angle = (i / 6) * Math.PI;
      const px = Math.cos(angle) * 7;
      const py = by - 3 + Math.sin(angle) * 5 + breathe;
      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 苍老瘦骨面庞
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(0, by - 12 + breathe, 6.5, 7.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 百岁垂胸白眉 (两道长长雪白眉毛下垂至颈)
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-4, by - 14 + breathe);
    ctx.quadraticCurveTo(-7, by - 10 + breathe, -6, by - 3 + breathe);
    ctx.moveTo(4, by - 14 + breathe);
    ctx.quadraticCurveTo(7, by - 10 + breathe, 6, by - 3 + breathe);
    ctx.stroke();

    // 垂老慈悲兼带贪婪的眯眯眼
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-4, by - 12 + breathe); ctx.lineTo(-1, by - 12 + breathe);
    ctx.moveTo(1, by - 12 + breathe); ctx.lineTo(4, by - 12 + breathe);
    ctx.stroke();

    // 九环紫檀禅杖
    ctx.save();
    ctx.strokeStyle = '#581c87';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(10, by - 24);
    ctx.lineTo(10, by + 15);
    ctx.stroke();
    // 锡杖金环
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(10, by - 26, 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(7, by - 25, 1.5, 0, Math.PI * 2);
    ctx.arc(13, by - 25, 1.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }


  // =========================================================================
  // 【专属神相】西海龙三太子·小白龙敖烈 (银白珊瑚龙角、龙绡白袍、龙泉宝剑、避水神珠)
  // =========================================================================
  static drawXiaoBaiLong(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.05, 1.05);

    const legMove = isMoving ? Math.sin(animTimer * 0.4) * 3 : 0;
    const waveFloat = Math.sin(animTimer * 0.18) * 2;

    // ── 0. 碧水灵波法阵光环 ──
    ctx.save();
    const waveGrad = ctx.createRadialGradient(0, by + 15, 2, 0, by + 15, 18);
    waveGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    waveGrad.addColorStop(0.7, 'rgba(14, 165, 233, 0.3)');
    waveGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = waveGrad;
    ctx.beginPath();
    ctx.ellipse(0, by + 15, 18, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 1. 披风：深海沧浪玄青云锦大氅 ──
    ctx.fillStyle = '#0369a1';
    ctx.beginPath();
    ctx.moveTo(-7, by - 6);
    ctx.quadraticCurveTo(-14, by + 4, -13 + waveFloat, by + 15);
    ctx.quadraticCurveTo(0, by + 12, 13 + waveFloat, by + 15);
    ctx.quadraticCurveTo(14, by + 4, 7, by - 6);
    ctx.closePath();
    ctx.fill();

    // ── 2. 下肢：白玉龙甲战靴 ──
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-6, by + 6 + legMove, 5, 9, 2);
    ctx.roundRect(1, by + 6 - legMove, 5, 9, 2);
    ctx.fill();
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-6, by + 13 + legMove, 5, 2);
    ctx.fillRect(1, by + 13 - legMove, 5, 2);

    // ── 3. 躯干：银龙戏珠织锦龙绡白袍 ──
    const tunicY = by - 8;
    const tunicGrad = ctx.createLinearGradient(-8, tunicY, 8, tunicY + 16);
    tunicGrad.addColorStop(0, '#ffffff');
    tunicGrad.addColorStop(0.6, '#f1f5f9');
    tunicGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = tunicGrad;
    ctx.beginPath();
    ctx.roundRect(-7.5, tunicY, 15, 15, [3, 3, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 沧浪碧玉腰带
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-7.5, tunicY + 9, 15, 3.5);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-2, tunicY + 8.5, 4, 4.5);

    // ── 4. 右手持西海【碧水龙泉剑】──
    ctx.save();
    ctx.translate(9, tunicY + 4);
    ctx.rotate(-0.25);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, -14);
    ctx.lineTo(0, 16);
    ctx.stroke();
    // 寒冰剑刃水芒
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 1.0;
    ctx.stroke();
    // 黄金剑格
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-3.5, -4, 7, 2.5);
    ctx.restore();

    // ── 5. 左手托【避水神珠】(清澈龙气浮动) ──
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(-8, tunicY + 7, 2.2, 0, Math.PI * 2);
    ctx.fill();
    // 避水珠体
    const pearlGrad = ctx.createRadialGradient(-8, tunicY + 4, 1, -8, tunicY + 4, 4);
    pearlGrad.addColorStop(0, '#ffffff');
    pearlGrad.addColorStop(0.4, '#38bdf8');
    pearlGrad.addColorStop(1, '#0284c7');
    ctx.fillStyle = pearlGrad;
    ctx.beginPath();
    ctx.arc(-8, tunicY + 4 + waveFloat * 0.4, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // ── 6. 俊朗非凡的龙太子容颜与冰晶银白龙角 ──
    // 面容
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.ellipse(0, tunicY - 7, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // 朗星神目
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(-2.5, tunicY - 7.5, 1.3, 0, Math.PI * 2);
    ctx.arc(2.5, tunicY - 7.5, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // 束发白龙冠
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.roundRect(-4, tunicY - 14, 8, 4.5, 2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 标志性：一对冰晶珊瑚龙角 (玉白透水蓝，高贵圣洁)
    const hornGrad = ctx.createLinearGradient(0, tunicY - 12, 0, tunicY - 24);
    hornGrad.addColorStop(0, '#bae6fd');
    hornGrad.addColorStop(0.5, '#f0f9ff');
    hornGrad.addColorStop(1, '#ffffff');
    ctx.fillStyle = hornGrad;
    // 左龙角 (分叉玉角)
    ctx.beginPath();
    ctx.moveTo(-3, tunicY - 14);
    ctx.lineTo(-7, tunicY - 22);
    ctx.lineTo(-5, tunicY - 23);
    ctx.lineTo(-4, tunicY - 19);
    ctx.lineTo(-2, tunicY - 22);
    ctx.lineTo(-1, tunicY - 14);
    ctx.closePath();
    ctx.fill();
    // 右龙角
    ctx.beginPath();
    ctx.moveTo(3, tunicY - 14);
    ctx.lineTo(7, tunicY - 22);
    ctx.lineTo(5, tunicY - 23);
    ctx.lineTo(4, tunicY - 19);
    ctx.lineTo(2, tunicY - 22);
    ctx.lineTo(1, tunicY - 14);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】当方土地神公公 (矮小慈祥、白须过腹、桃木灵拐、福德道袍)
  // =========================================================================
  static drawTudiGong(ctx, by, animTimer, direction) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 0.95, 0.95);

    // 矮小身躯
    const y = by + 2;
    // 土黄道袍
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(-8, y - 6, 16, 17, 4);
    ctx.fill();
    // 飘逸雪白长须 (垂至小腹)
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-5, y - 9);
    ctx.quadraticCurveTo(-7, y + 2, 0, y + 8);
    ctx.quadraticCurveTo(7, y + 2, 5, y - 9);
    ctx.closePath();
    ctx.fill();

    // 慈祥圆脸
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, y - 11, 6.5, 0, Math.PI * 2);
    ctx.fill();
    // 眯眯笑眼
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(-2.5, y - 11, 1.5, 0.8, Math.PI - 0.8);
    ctx.arc(2.5, y - 11, 1.5, 0.8, Math.PI - 0.8);
    ctx.stroke();

    // 绿叶黄道巾
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(0, y - 16, 5.5, Math.PI, 0);
    ctx.fill();

    // 桃木神拐
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(9, y - 20);
    ctx.lineTo(8, y + 12);
    ctx.stroke();
    // 挂小葫芦
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(11, y - 14, 2.2, 0, Math.PI * 2);
    ctx.arc(11, y - 11, 3.0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】东海龙王敖广 (九龙金丝黄龙袍、金色龙角、白髯龙须、镇海如意)
  // =========================================================================
  static drawDragonKing(ctx, by, animTimer, direction) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.15, 1.15);

    // 明黄龙袍
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(-9, by - 8, 18, 20, 4);
    ctx.fill();
    // 龙纹绣胸
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(-6, by - 5, 12, 12);

    // 龙须白髯
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-5, by - 10);
    ctx.lineTo(0, by + 4);
    ctx.lineTo(5, by - 10);
    ctx.closePath();
    ctx.fill();

    // 威严龙颜
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, by - 12, 7, 0, Math.PI * 2);
    ctx.fill();

    // 纯金龙冠
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-5, by - 19, 10, 4);
    // 灿烂金龙双角
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-4, by - 18); ctx.lineTo(-8, by - 26); ctx.lineTo(-2, by - 19); ctx.fill();
    ctx.moveTo(4, by - 18); ctx.lineTo(8, by - 26); ctx.lineTo(2, by - 19); ctx.fill();

    // 手中镇海水晶玉如意
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.ellipse(10, by - 6, 3, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】浮屠山乌巢禅师 (青松神木灵巢、百衲禅衣、佛光梵轮)
  // =========================================================================
  static drawWuchaoMaster(ctx, by, animTimer, direction) {
    ctx.save();
    // 佛光光环
    ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
    ctx.beginPath();
    ctx.arc(0, by - 6, 18, 0, Math.PI * 2);
    ctx.fill();

    // 灵木巨巢底座
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(0, by + 10, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 结跏趺坐禅师
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(0, by + 2, 10, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 慈悲佛首
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, by - 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】灵台方寸山菩提祖师 (太极八卦仙袍、鹤发童颜、白玉拂尘)
  // =========================================================================
  static drawBodhiMaster(ctx, by, animTimer, direction) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip, 1);

    // 太极八卦两仪道袍
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8, 16, 20, 3);
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-8, by - 8, 8, 20); // 半黑半白两仪

    // 鹤发银须
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(0, by - 12, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 手执白玉拂尘
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(8, by - 16);
    ctx.quadraticCurveTo(14, by - 8, 12, by + 6);
    ctx.stroke();
    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】平顶山金角大王 (金角如日、手托紫金红葫芦)
  // =========================================================================
  static drawJinJiaoKing(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.1, 1.1);

    // 金甲魔躯
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8, 16, 18, 3);
    ctx.fill();

    // 金角大头
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.arc(0, by - 13, 7, 0, Math.PI * 2);
    ctx.fill();

    // 头顶金光闪闪独角
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-3, by - 17);
    ctx.lineTo(0, by - 29);
    ctx.lineTo(3, by - 17);
    ctx.closePath();
    ctx.fill();

    // 手托【紫金红葫芦】
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.arc(9, by - 2, 3, 0, Math.PI * 2);
    ctx.arc(9, by + 3, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】平顶山银角大王 (银角如月、手托羊脂玉净瓶)
  // =========================================================================
  static drawYinJiaoKing(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.1, 1.1);

    // 银甲魔躯
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8, 16, 18, 3);
    ctx.fill();

    // 银角青面
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(0, by - 13, 7, 0, Math.PI * 2);
    ctx.fill();

    // 银光双角
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(-5, by - 17); ctx.lineTo(-7, by - 27); ctx.lineTo(-2, by - 18); ctx.fill();
    ctx.moveTo(5, by - 17); ctx.lineTo(7, by - 27); ctx.lineTo(2, by - 18); ctx.fill();

    // 手托【羊脂玉净瓶】
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(7, by - 3, 4, 8, 1.5);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】狮驼岭大鹏金翅雕 (阴阳二气宝瓶、垂天金翅、鹰隼血瞳)
  // =========================================================================
  static drawDapengRoc(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.25, 1.25);

    // 金色巨翼
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(-16, by - 18);
    ctx.quadraticCurveTo(-26, by - 8, -20, by + 8);
    ctx.lineTo(-8, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(16, by - 18);
    ctx.quadraticCurveTo(26, by - 8, 20, by + 8);
    ctx.lineTo(8, by + 4);
    ctx.closePath();
    ctx.fill();

    // 乌金铠甲
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8, 16, 18, 3);
    ctx.fill();

    // 鹰隼神目与金羽雕冠
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(0, by - 13, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.arc(-2.5, by - 13, 1.8, 0, Math.PI * 2);
    ctx.arc(2.5, by - 13, 1.8, 0, Math.PI * 2);
    ctx.fill();
    // 鹰钩铁喙
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, by - 11);
    ctx.lineTo(4, by - 7);
    ctx.lineTo(0, by - 5);
    ctx.closePath();
    ctx.fill();

    // 托【阴阳二气宝瓶】
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, by - 4, 5, 8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(8, by - 4, 2.5, 8); // 半黑半白阴阳瓶

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】通天河灵感大王 (金红鱼鳞铠、一对九瓣赤铜锤)
  // =========================================================================
  static drawLingganKing(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.15, 1.15);

    // 金红鱼鳞甲
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-9, by - 8, 18, 18, 3);
    ctx.fill();

    // 金鱼头盔
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(0, by - 13, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // 一对九瓣赤铜锤
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(-11, by - 2, 4.5, 0, Math.PI * 2);
    ctx.arc(11, by - 2, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】盘丝洞百目魔君 (黄花观道袍、胁下千眼金光)
  // =========================================================================
  static drawBaimuMojun(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    // 金光光晕
    ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
    ctx.beginPath();
    ctx.arc(0, by - 4, 17, 0, Math.PI * 2);
    ctx.fill();

    // 鹅黄道袍
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8, 16, 18, 3);
    ctx.fill();

    // 道人面庞
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, by - 13, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 胁下魔目 (闪烁金光)
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(-7, by - 4 + i * 3, 2, 2);
      ctx.fillRect(5, by - 4 + i * 3, 2, 2);
    }

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】陈塘关总兵李靖 (托塔天王：黄金甲胄、手托玲珑宝塔)
  // =========================================================================
  static drawLiJing(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.1, 1.1);

    // 黄金甲
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(-8, by - 8, 16, 18, 3);
    ctx.fill();

    // 总兵面庞与长髯
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, by - 13, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-3, by - 10); ctx.lineTo(0, by - 2); ctx.lineTo(3, by - 10); ctx.fill();

    // 金盔
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-5, by - 18, 10, 4);

    // 手托【黄金玲珑宝塔】
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(9, by - 12);
    ctx.lineTo(6, by + 4);
    ctx.lineTo(12, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }


  // =========================================================================
  // 【专属神相】天蓬元帅·天河水师大统帅 (银甲白袍、紫金战盔、手握元帅神槊、英姿勃发)
  // =========================================================================
  static drawTianpengMarshal(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.05, 1.05);

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.45) * 3 : 0;
    const capeWiggle = Math.sin(t * 0.25) * 4;

    // 0. 脚底战将阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, by + 14, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 大红织锦元帅披风 (随风猎猎作响)
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-6, by - 6);
    ctx.quadraticCurveTo(-14 + capeWiggle, by + 6, -11 + capeWiggle, by + 16);
    ctx.lineTo(8 + capeWiggle, by + 16);
    ctx.quadraticCurveTo(12 + capeWiggle, by + 6, 6, by - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 2. 双腿亮银战靴
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-6 + legMove, by + 5, 4.5, 9);
    ctx.fillRect(2 - legMove, by + 5, 4.5, 9);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-7 + legMove, by + 12, 6, 3);
    ctx.fillRect(1 - legMove, by + 12, 6, 3);

    // 3. 亮银重铠连环躯干
    const armorGrad = ctx.createLinearGradient(-8, by - 8, 8, by + 6);
    armorGrad.addColorStop(0, '#f8fafc');
    armorGrad.addColorStop(0.5, '#cbd5e1');
    armorGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.roundRect(-8, by - 7, 16, 14, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 胸前护心镜 (水波灵光)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, by - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. 双肩金龙兽头吞肩
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-8, by - 5, 3.5, 0, Math.PI * 2);
    ctx.arc(8, by - 5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. 元帅面庞与紫金金盔
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6, 0, Math.PI * 2);
    ctx.fill();

    // 英挺眉目
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3, by - 15, 2, 1.2);
    ctx.fillRect(1, by - 15, 2, 1.2);

    // 紫金战盔
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-6, by - 16);
    ctx.lineTo(0, by - 23);
    ctx.lineTo(6, by - 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 盔顶朱红长缨
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, by - 23);
    ctx.quadraticCurveTo(-4, by - 28, -6 + capeWiggle * 0.5, by - 22);
    ctx.lineTo(0, by - 22);
    ctx.closePath();
    ctx.fill();

    // 6. 手持元帅神槊 (长戟带银刃红缨)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, by - 24);
    ctx.lineTo(11, by + 15);
    ctx.stroke();

    // 戟头刃尖
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(11, by - 28);
    ctx.lineTo(8, by - 21);
    ctx.lineTo(14, by - 21);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 戟红缨
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(9, by - 21, 4, 3);

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】征讨先锋·巨灵神 (高大魁梧、金红重铠、威武开山双板斧、霸气赫赫)
  // =========================================================================
  static drawJuLingShen(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.2, 1.2); // 巨灵天将身材魁伟！

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.4) * 3.5 : 0;
    const axeSway = Math.sin(t * 0.2) * 2;

    // 0. 脚底沉稳黑影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, by + 15, 17, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 粗壮双腿与乌金战靴
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7 + legMove, by + 6, 6, 9);
    ctx.fillRect(2 - legMove, by + 6, 6, 9);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-8 + legMove, by + 12, 7.5, 3.5);
    ctx.fillRect(1 - legMove, by + 12, 7.5, 3.5);

    // 2. 雄壮金红重铠 (横阔厚重)
    const armorGrad = ctx.createLinearGradient(-10, by - 10, 10, by + 6);
    armorGrad.addColorStop(0, '#c2410c');
    armorGrad.addColorStop(0.5, '#ea580c');
    armorGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.roundRect(-10, by - 8, 20, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 兽面铜环护腰
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-7, by + 3, 14, 4);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, by + 5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. 双肩巨型兽吞护肩
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(-11, by - 6, 4.5, 0, Math.PI * 2);
    ctx.arc(11, by - 6, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. 刚毅先锋面容与虎须
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, by - 15, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // 怒目
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, by - 16, 2.5, 1.5);
    ctx.fillRect(1.5, by - 16, 2.5, 1.5);

    // 粗黑须髯
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(-5, by - 12); ctx.lineTo(0, by - 7); ctx.lineTo(5, by - 12);
    ctx.fill();

    // 双凤战盔
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-7, by - 21, 14, 5);
    ctx.beginPath();
    ctx.moveTo(0, by - 26);
    ctx.lineTo(-4, by - 21);
    ctx.lineTo(4, by - 21);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-2, by - 26, 4, 3);

    // 5. 双持【宣花开山板斧】(霸气半月刃)
    // 左手斧
    ctx.save();
    ctx.translate(-13, by - 4 + axeSway);
    ctx.rotate(-0.35);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-1.5, -16, 3, 24);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(-4, -10, 8, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.lineTo(-1, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    // 右手斧
    ctx.save();
    ctx.translate(13, by - 4 - axeSway);
    ctx.rotate(0.35);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-1.5, -16, 3, 24);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(4, -10, 8, Math.PI * 0.6, Math.PI * 1.4);
    ctx.lineTo(1, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 【专属怪相】花果山守山大将·赤毛马猴 (赤红灵毛、健硕神勇、手持熟铜木棍)
  // =========================================================================
  static drawChiMaoMaHou(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.05, 1.05);

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.45) * 3 : 0;
    const tailWag = Math.sin(t * 0.3) * 5;

    // 0. 脚底影子
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, by + 14, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 赤红如火灵动长尾
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-6, by + 6);
    ctx.quadraticCurveTo(-14, by + 4, -15 + tailWag, by - 5);
    ctx.stroke();

    // 2. 矫健赤红双腿
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-5 + legMove, by + 5, 3.5, 8);
    ctx.fillRect(1 - legMove, by + 5, 3.5, 8);

    // 3. 赤色雄壮猿躯与青布战裙
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-7, by - 6, 14, 12, 3);
    ctx.fill();

    // 青翠战裙
    ctx.fillStyle = '#047857';
    ctx.fillRect(-7, by + 2, 14, 5);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-8, by + 1, 16, 1.5);

    // 4. 赤毛马猴面庞与额前金睛
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, by - 12, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 桃形白粉脸圈
    ctx.fillStyle = '#fecdd3';
    ctx.beginPath();
    ctx.arc(-2, by - 12, 2.8, 0, Math.PI * 2);
    ctx.arc(2, by - 12, 2.8, 0, Math.PI * 2);
    ctx.arc(0, by - 9.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 灼灼金睛
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-2, by - 12, 1.2, 0, Math.PI * 2);
    ctx.arc(2, by - 12, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 额前一撮威风赤炎冲天毫毛
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-2, by - 18);
    ctx.lineTo(0, by - 24);
    ctx.lineTo(2, by - 18);
    ctx.closePath();
    ctx.fill();

    // 5. 手握青木熟铜齐眉棍 (斜持身前)
    ctx.save();
    ctx.translate(6, by - 2);
    ctx.rotate(0.35);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1.5, -18, 3, 30);
    // 铜箍
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, -18, 4, 3);
    ctx.fillRect(-2, 9, 4, 3);
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 【专属萌相】花果山巡山小石猴 / 受困小猴 (灵巧萌动、浅棕绒毛、摇尾灵巧)
  // =========================================================================
  static drawStoneMonkey(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 0.9, 0.9); // 小石猴身材灵巧娇小！

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.5) * 3 : 0;
    const tailBob = Math.sin(t * 0.35) * 6;

    // 0. 脚底小黑影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, by + 13, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 灵巧长尾翘起成弧
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-4, by + 4);
    ctx.quadraticCurveTo(-11, by - 2, -10 + tailBob, by - 12);
    ctx.stroke();

    // 2. 双腿
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-4 + legMove, by + 4, 3, 7);
    ctx.fillRect(1 - legMove, by + 4, 3, 7);

    // 3. 浑圆绒毛小身体
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(-6, by - 5, 12, 11, 4);
    ctx.fill();

    // 小猴肚皮
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(0, by + 1, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. 小猴圆脑庞与大耳朵
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, by - 11, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // 灵动大圆耳
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-5.5, by - 11, 2.2, 0, Math.PI * 2);
    ctx.arc(5.5, by - 11, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 桃脸大眼睛
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, by - 10, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-1.5, by - 11, 1, 0, Math.PI * 2);
    ctx.arc(1.5, by - 11, 1, 0, Math.PI * 2);
    ctx.fill();

    // 桃红腮红
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.fillRect(-3, by - 9, 1.5, 1);
    ctx.fillRect(1.5, by - 9, 1.5, 1);

    ctx.restore();
  }

  // =========================================================================
  // 【专属怪相】东海之滨·巡海夜叉·李艮 (靛青鬼面、赤红卷发、亮银三叉戟、气势汹汹)
  // =========================================================================
  static drawYeCha(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.1, 1.1);

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.45) * 3 : 0;
    const forkTilt = Math.sin(t * 0.25) * 2;

    // 0. 脚底水汽幽影
    ctx.fillStyle = 'rgba(6, 78, 59, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, by + 14, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 青皮水妖双腿
    ctx.fillStyle = '#0e7490';
    ctx.fillRect(-5 + legMove, by + 5, 4, 8);
    ctx.fillRect(1 - legMove, by + 5, 4, 8);

    // 2. 靛青身躯与海兽皮战裙
    ctx.fillStyle = '#0891b2';
    ctx.beginPath();
    ctx.roundRect(-7, by - 7, 14, 13, 3);
    ctx.fill();

    // 龙鳞兽皮裙
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-8, by + 1, 16, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-8, by + 5, 16, 1.5);

    // 3. 凶煞夜叉青鬼面
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 暴凸红瞳
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-2.5, by - 15, 1.8, 0, Math.PI * 2);
    ctx.arc(2.5, by - 15, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, by - 15.5, 1, 1);
    ctx.fillRect(3, by - 15.5, 1, 1);

    // 外翻獠牙
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-3, by - 11); ctx.lineTo(-4, by - 13); ctx.lineTo(-2, by - 12);
    ctx.moveTo(3, by - 11); ctx.lineTo(4, by - 13); ctx.lineTo(2, by - 12);
    ctx.fill();

    // 狂乱倒竖赤红烈发
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-6, by - 16);
    ctx.lineTo(-4, by - 24);
    ctx.lineTo(0, by - 19);
    ctx.lineTo(4, by - 24);
    ctx.lineTo(6, by - 16);
    ctx.closePath();
    ctx.fill();

    // 4. 手持【亮银三叉戟】
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, by - 24 + forkTilt);
    ctx.lineTo(10, by + 15);
    ctx.stroke();

    // 三叉锋尖 (幽蓝寒光)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(10, by - 30 + forkTilt); ctx.lineTo(7, by - 24 + forkTilt); ctx.lineTo(13, by - 24 + forkTilt);
    ctx.moveTo(5, by - 28 + forkTilt); ctx.lineTo(4, by - 22 + forkTilt); ctx.lineTo(7, by - 22 + forkTilt);
    ctx.moveTo(15, by - 28 + forkTilt); ctx.lineTo(16, by - 22 + forkTilt); ctx.lineTo(13, by - 22 + forkTilt);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
  }

}


window.Character = Character;
window.CharacterRenderer = CharacterRenderer;
