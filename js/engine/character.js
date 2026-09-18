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

    this.speed = options.speed || 2.24; // 80% 基础巡逻移动速度
    this.direction = options.direction || 'down'; // 'down' | 'up' | 'left' | 'right'
    this.isMoving = false;
    this.animFrame = 0;
    this.animTimer = 0;

    this.appearance = options.appearance || 'heaven_general';
    this.icon = options.icon || '🧙‍♂️';
    this.title = options.title || '';
    this.questStatus = options.questStatus || null;

    // 怪物专属类型识别 (彻底消除怪物默认回退成天将形象的缺陷)
    this.monsterType = options.monsterType || (this.type === 'monster' ? Character.inferMonsterType(this.name, this.id) : null);

    this.isRiding = false; // 是否骑乘神驹
    this.interactRadius = 38;
    this.dialogueKey = options.dialogueKey || null;

    this.patrolRadius = options.patrolRadius || 40;
    this.patrolTimer = 0;
    this.spawnX = this.x;
    this.spawnY = this.y;
    this.patrolState = 'idle';
    this.patrolStateTimer = Math.floor(Math.random() * 50) + 20;
    this.patrolDirX = 0;
    this.patrolDirY = 0;
  }

  static inferMonsterType(name, id) {
    const s = `${name || ''}_${id || ''}`.toLowerCase();
    if (s.includes('rat') || s.includes('鼠')) return 'rat';
    if (s.includes('pig') || s.includes('猪')) return 'pig';
    if (s.includes('wolf') || s.includes('狼')) return 'wolf';
    if (s.includes('tiger') || s.includes('虎')) return 'tiger';
    if (s.includes('bandit') || s.includes('tyrant') || s.includes('盗') || s.includes('霸') || s.includes('贼')) return 'bandit';
    if (s.includes('serpent') || s.includes('snake') || s.includes('蛇')) return 'snake';
    if (s.includes('fox') || s.includes('狐')) return 'fox';
    if (s.includes('clam') || s.includes('蚌')) return 'clam';
    if (s.includes('crab') || s.includes('蟹')) return 'crab';
    if (s.includes('shrimp') || s.includes('虾')) return 'shrimp';
    if (s.includes('bandit') || s.includes('tyrant') || s.includes('盗') || s.includes('霸') || s.includes('贼')) return 'bandit';
    if (s.includes('bear') || s.includes('熊')) return 'bear';
    if (s.includes('skeleton') || s.includes('bone') || s.includes('尸') || s.includes('骨') || s.includes('鬼') || s.includes('demon')) return 'skeleton';
    if (s.includes('ape') || s.includes('猿') || s.includes('猴')) return 'ape';
    return 'rat';
  }

  inferMonsterType(name, id) {
    return Character.inferMonsterType(name, id);
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
        } else {
          // 遇到阻挡，若为野怪巡逻则提前结束行走
          if (this.type === 'monster') {
            this.patrolStateTimer = 0;
          }
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

  // 智能推断 NPC 真实专属外观 (杜绝回退失忆行者与唐僧小人)
  inferNpcAppearance(name = '', id = '', app = '') {
    if (app && app !== 'tang_seng' && app !== 'heaven_general' && app !== 'mortal_wanderer') {
      return app;
    }
    const n = `${name || ''} ${id || ''}`.toLowerCase();
    if (n.includes('刘伯钦') || n.includes('猎户') || n.includes('太保') || n.includes('liuboqin')) return 'liu_boqin';
    if (n.includes('刘太公') || n.includes('村长') || n.includes('宿老') || n.includes('elder') || n.includes('taigong')) return 'liu_taigong';
    if (n.includes('土地') || n.includes('tudi')) return 'tudi_gong';
    if (n.includes('太白') || n.includes('金星') || n.includes('taibai')) return 'taibai';
    if (n.includes('观音') || n.includes('菩萨') || n.includes('guanyin')) return 'guanyin';
    if (n.includes('龙王') || n.includes('敖广') || n.includes('aoguang')) return 'dragon_king';
    if (n.includes('钟馗') || n.includes('抓鬼') || n.includes('zhongkui')) return 'zhongkui';
    if (n.includes('铁匠') || n.includes('锻造') || n.includes('tiejiang') || n.includes('blacksmith')) return 'tiejiang';
    if (n.includes('医师') || n.includes('郎中') || n.includes('老神医') || n.includes('doctor') || n.includes('yishi')) return 'doctor';
    if (n.includes('仙女') || n.includes('仙子') || n.includes('qixiannv')) return 'xiannv';
    // 长安盛世市井路人
    if (n.includes('苏绣娘') || n.includes('绣娘') || n.includes('织造') || n.includes('girl')) return 'changan_girl';
    if (n.includes('杜子美') || n.includes('书生') || n.includes('诗仙') || n.includes('scholar')) return 'changan_scholar';
    if (n.includes('货郎') || n.includes('阿福') || n.includes('hawker')) return 'changan_hawker';
    if (n.includes('小童') || n.includes('小虎') || n.includes('child')) return 'changan_child';
    if (n.includes('禁军') || n.includes('巡卒') || n.includes('守卫') || n.includes('guard')) return 'changan_guard';
    return app || 'mortal_wanderer';
  }

  drawBody(ctx, sx, sy) {
    const footOffset = this.isMoving ? (this.animFrame % 2 === 0 ? 3.5 : -3.5) : 0;
    // 待机呼吸微动与披风律动
    const breatheY = Math.sin(this.animTimer * 0.09) * 1.3;
    const bodySy = sy + (this.isMoving ? 0 : breatheY);
    const activeApp = this.type === 'npc' ? this.inferNpcAppearance(this.name, this.id, this.appearance) : this.appearance;

    // =========================================================================
    // 0. 野怪专属独立国风生动形象 (彻底告别回退天将小人)
    // =========================================================================
    if (this.type === 'monster' || this.monsterType) {
      this.drawMonsterBody(ctx, sx, sy, bodySy, footOffset);
      return;
    }

    // =========================================================================
    // 1. 坐骑形态 (白龙马 / 天马烈火兽)
    // =========================================================================
    if (this.isRiding) {
      // 四蹄踏云波纹祥云光圈
      const cloudAlpha = 0.55 + Math.sin(this.animTimer * 0.15) * 0.25;
      ctx.fillStyle = `rgba(168, 230, 255, ${cloudAlpha})`;
      ctx.beginPath();
      ctx.ellipse(sx - 13, sy + 15, 9, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(sx + 13, sy + 15, 9, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 金色流光蹄花
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(sx - 13, sy + 15, 3, 0, Math.PI * 2);
      ctx.arc(sx + 13, sy + 15, 3, 0, Math.PI * 2);
      ctx.fill();

      // 白龙马 / 灵驹身躯 (流线弧度肌肉)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(sx - 15, sy + 1, 30, 13, 5);
      ctx.fill();
      ctx.strokeStyle = '#cbe3eb';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 飘逸灵动马尾 (贝塞尔曲线随风飘舞)
      const tailSide = this.direction === 'left' ? 14 : -14;
      const tailWave = Math.sin(this.animTimer * 0.2) * 5;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + tailSide, sy + 4);
      ctx.quadraticCurveTo(sx + tailSide + (this.direction === 'left' ? 10 : -10), sy + 12 + tailWave, sx + tailSide + (this.direction === 'left' ? 15 : -15), sy + 18);
      ctx.stroke();

      // 龙马首颈与龙角
      const headX = this.direction === 'left' ? sx - 19 : (this.direction === 'right' ? sx + 14 : sx + 11);
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.roundRect(headX, sy - 8, 10, 16, 3);
      ctx.fill();

      // 飘扬银白/金丝马鬃
      const maneWave = Math.sin(this.animTimer * 0.25) * 3;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(headX + 2, sy - 10);
      ctx.lineTo(headX + 10, sy - 6 + maneWave);
      ctx.lineTo(headX + 2, sy - 2);
      ctx.closePath();
      ctx.fill();

      // 白龙马龙须微动
      ctx.strokeStyle = '#70a1ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX + (this.direction === 'left' ? -2 : 12), sy - 2);
      ctx.quadraticCurveTo(headX + (this.direction === 'left' ? -7 : 17), sy + 4 + maneWave, headX + (this.direction === 'left' ? -4 : 14), sy + 8);
      ctx.stroke();

      // 华美金鞍与红锦垫
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(sx - 7, sy - 1, 14, 5);
      ctx.fillStyle = '#f1c40f';
      ctx.fillRect(sx - 5, sy, 10, 3);

      // 四蹄 (奔腾踏步)
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(sx - 11 + footOffset, sy + 12, 3.5, 8);
      ctx.fillRect(sx - 3 - footOffset, sy + 12, 3.5, 8);
      ctx.fillRect(sx + 5 + footOffset, sy + 12, 3.5, 8);
      ctx.fillRect(sx + 10 - footOffset, sy + 12, 3.5, 8);

      sy -= 9;
    }

    // =========================================================================
    // 2. 威灵显赫大将军 (金甲神威 · 朱雀天盔 · 飘逸大红战袍披风)
    // =========================================================================
    if (this.appearance === 'heaven_general' || this.appearance === 'player_heaven') {
      // 飘逸金边大红披风 (贝塞尔曲线模拟随风翻飞)
      const capeWave = Math.sin(this.animTimer * 0.15) * 4;
      const capeDir = this.direction === 'left' ? 6 : -6;
      ctx.fillStyle = '#b71540';
      ctx.beginPath();
      ctx.moveTo(sx - 8, bodySy - 8);
      ctx.lineTo(sx + 8, bodySy - 8);
      ctx.quadraticCurveTo(sx + capeDir + 12, bodySy + 12 + capeWave, sx + capeDir + 10, bodySy + 18);
      ctx.lineTo(sx + capeDir - 10, bodySy + 18);
      ctx.quadraticCurveTo(sx + capeDir - 12, bodySy + 12 + capeWave, sx - 8, bodySy - 8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 纯金明光锁子胸甲 (立体光影双兽护肩)
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.roundRect(sx - 9, bodySy - 10, 18, 17, 3);
      ctx.fill();
      ctx.strokeStyle = '#b8860b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 胸前纯银反光凸面护心镜
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 兽面吞头金肩甲
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(sx - 9, bodySy - 7, 3.5, 0, Math.PI * 2);
      ctx.arc(sx + 9, bodySy - 7, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 战靴与足部
      ctx.fillStyle = '#b8860b';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 7, 4, 8);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 7, 4, 8);

      // 朱雀金翅飞天神盔 (头盔面甲)
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 16, 7.5, 0, Math.PI * 2);
      ctx.fill();
      // 双翼展翅护耳
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(sx - 7, bodySy - 18);
      ctx.lineTo(sx - 13, bodySy - 22);
      ctx.lineTo(sx - 7, bodySy - 14);
      ctx.moveTo(sx + 7, bodySy - 18);
      ctx.lineTo(sx + 13, bodySy - 22);
      ctx.lineTo(sx + 7, bodySy - 14);
      ctx.fill();
      // 耸立朱雀长翎红缨
      const plumeWave = Math.sin(this.animTimer * 0.2) * 2;
      ctx.strokeStyle = '#ff3838';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, bodySy - 23);
      ctx.quadraticCurveTo(sx + plumeWave, bodySy - 32, sx + plumeWave * 1.5, bodySy - 35);
      ctx.stroke();

      // 手握威灵破阵亮金枪 (枪身金龙缠绕，枪尖雪亮，红缨飘舞)
      const spearSide = this.direction === 'left' ? -12 : 12;
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx + spearSide, bodySy - 26);
      ctx.lineTo(sx + spearSide, bodySy + 16);
      ctx.stroke();
      // 枪尖锋刃与朱红缨
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx + spearSide, bodySy - 32);
      ctx.lineTo(sx + spearSide - 3, bodySy - 26);
      ctx.lineTo(sx + spearSide + 3, bodySy - 26);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e74c3c';
      ctx.beginPath();
      ctx.arc(sx + spearSide, bodySy - 24, 3, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // =========================================================================
    // 3. 齐天大圣孙悟空 (紫金冠双翎飘动 · 黄金锁子甲 · 如意金箍棒流光)
    // =========================================================================
    if (this.appearance === 'sun_wukong') {
      // 黄金锁子战袍与虎皮战裙
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 9, 16, 15, 3);
      ctx.fill();
      // 虎皮斑纹与锦绣腰带
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(sx - 6, bodySy - 3, 12, 2.5);
      ctx.fillRect(sx - 5, bodySy + 2, 10, 2.5);
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(sx - 7, bodySy - 1, 14, 2);

      // 灵猴英挺面庞
      ctx.fillStyle = '#e58e26';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.8, 0, Math.PI * 2);
      ctx.fill();
      // 火眼金睛金色微光
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(sx - 2.5, bodySy - 14, 1.6, 0, Math.PI * 2);
      ctx.arc(sx + 2.5, bodySy - 14, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 凤翅紫金冠
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.roundRect(sx - 6.5, bodySy - 20, 13, 4, 2);
      ctx.fill();

      // 摇曳若仙的两根金红雉鸡翎 (长达 18px，三段贝塞尔优雅物理波动)
      const featherWave1 = Math.sin(this.animTimer * 0.16) * 6;
      const featherWave2 = Math.cos(this.animTimer * 0.16) * 6;
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 1.8;
      // 左长翎
      ctx.beginPath();
      ctx.moveTo(sx - 2, bodySy - 20);
      ctx.bezierCurveTo(sx - 8 + featherWave1, bodySy - 32, sx - 16 + featherWave1, bodySy - 36, sx - 22, bodySy - 26);
      ctx.stroke();
      // 右长翎
      ctx.beginPath();
      ctx.moveTo(sx + 2, bodySy - 20);
      ctx.bezierCurveTo(sx + 8 - featherWave2, bodySy - 32, sx + 16 - featherWave2, bodySy - 36, sx + 22, bodySy - 26);
      ctx.stroke();

      // 翎尾金丝点缀
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(sx - 22, bodySy - 26, 2, 0, Math.PI * 2);
      ctx.arc(sx + 22, bodySy - 26, 2, 0, Math.PI * 2);
      ctx.fill();

      // 猴王黑靴
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 5 + footOffset, bodySy + 6, 3.5, 8);
      ctx.fillRect(sx + 1.5 - footOffset, bodySy + 6, 3.5, 8);

      // 如意金箍棒 (万丈神兵，两端纯金祥云密纹，棒身乌铁神光)
      const stickSide = this.direction === 'left' ? -12 : 12;
      // 棒身乌铁
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(sx + stickSide, bodySy - 26);
      ctx.lineTo(sx + stickSide, bodySy + 16);
      ctx.stroke();
      // 两头黄金宝箍与微光
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(sx + stickSide, bodySy - 26);
      ctx.lineTo(sx + stickSide, bodySy - 18);
      ctx.moveTo(sx + stickSide, bodySy + 8);
      ctx.lineTo(sx + stickSide, bodySy + 16);
      ctx.stroke();

      // 金箍棒周围点点金星光晕
      const sparkAlpha = 0.4 + Math.sin(this.animTimer * 0.3) * 0.3;
      ctx.fillStyle = `rgba(255, 215, 0, ${sparkAlpha})`;
      ctx.beginPath();
      ctx.arc(sx + stickSide, bodySy - 22, 5, 0, Math.PI * 2);
      ctx.arc(sx + stickSide, bodySy + 12, 5, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // =========================================================================
    // 4. 小白龙敖烈 (玉龙生角 · 冰魄银甲 · 水云青衫龙泉宝剑)
    // =========================================================================
    if (this.appearance === 'xiaobailong' || this.appearance === 'bailong') {
      // 碧水青丝仙袍 (水波流动感)
      ctx.fillStyle = '#1e90ff';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 9, 16, 16, 3);
      ctx.fill();

      // 冰魄亮银战甲
      ctx.fillStyle = '#f1f2f6';
      ctx.fillRect(sx - 6, bodySy - 8, 12, 10);
      ctx.strokeStyle = '#70a1ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 6, bodySy - 8, 12, 10);

      // 英武俊秀龙太子容颜
      ctx.fillStyle = '#fbd38d';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // 头生白玉珊瑚龙角
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 3, bodySy - 19);
      ctx.lineTo(sx - 7, bodySy - 25);
      ctx.lineTo(sx - 5, bodySy - 29);
      ctx.moveTo(sx + 3, bodySy - 19);
      ctx.lineTo(sx + 7, bodySy - 25);
      ctx.lineTo(sx + 5, bodySy - 29);
      ctx.stroke();

      // 水波飘带
      const ribbonWave = Math.sin(this.animTimer * 0.2) * 3;
      ctx.strokeStyle = '#70a1ff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx - 7, bodySy - 4);
      ctx.quadraticCurveTo(sx - 14, bodySy + 6 + ribbonWave, sx - 10, bodySy + 15);
      ctx.stroke();

      // 避水龙泉宝剑
      const swordSide = this.direction === 'left' ? -11 : 11;
      ctx.strokeStyle = '#eccc68';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + swordSide, bodySy - 18);
      ctx.lineTo(sx + swordSide, bodySy + 12);
      ctx.stroke();

      ctx.fillStyle = '#2ed573';
      ctx.fillRect(sx - 5 + footOffset, bodySy + 7, 3.5, 7);
      ctx.fillRect(sx + 1.5 - footOffset, bodySy + 7, 3.5, 7);
      return;
    }

    // =========================================================================
    // 5. 天蓬元帅猪八戒 (黑金重铠 · 缁衣蒲扇大耳 · 九齿寒钢钉耙)
    // =========================================================================
    if (this.appearance === 'zhu_bajie' || this.appearance === 'bajie') {
      // 魁梧健硕体躯 (黑金重甲配绛紫缁衣)
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.roundRect(sx - 11, bodySy - 9, 22, 17, 4);
      ctx.fill();
      ctx.fillStyle = '#57606f';
      ctx.fillRect(sx - 8, bodySy - 7, 16, 12);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 8, bodySy - 7, 16, 12);

      // 猪神天蓬首级
      ctx.fillStyle = '#dcdde1';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // 扇形大耳 (随走动轻颤)
      const earWiggle = Math.sin(this.animTimer * 0.25) * 2;
      ctx.fillStyle = '#ced6e0';
      ctx.beginPath();
      ctx.ellipse(sx - 9, bodySy - 14 + earWiggle, 4.5, 3, 0, 0, Math.PI * 2);
      ctx.ellipse(sx + 9, bodySy - 14 - earWiggle, 4.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      // 憨威黑发僧帽
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 6, bodySy - 20, 12, 3);

      // 重甲战靴
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 7 + footOffset, bodySy + 8, 5, 7);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 8, 5, 7);

      // 九齿寒光钉耙 (寒钢利刃，九齿清晰分明)
      const rakeSide = this.direction === 'left' ? -13 : 13;
      ctx.strokeStyle = '#747d8c';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + rakeSide, bodySy - 24);
      ctx.lineTo(sx + rakeSide, bodySy + 15);
      ctx.stroke();
      // 耙头横梁
      ctx.fillStyle = '#f1f2f6';
      ctx.fillRect(sx + rakeSide - 5, bodySy - 27, 10, 4);
      // 锐利锋牙
      ctx.fillStyle = '#ffffff';
      for (let i = -4; i <= 4; i += 2) {
        ctx.fillRect(sx + rakeSide + i, bodySy - 32, 1.2, 5);
      }
      return;
    }

    // =========================================================================
    // 6. 卷帘大将沙悟净 (青面赤髯 · 九颗骷髅念珠 · 月牙降妖宝杖)
    // =========================================================================
    if (this.appearance === 'sha_wujing' || this.appearance === 'shaseng') {
      // 赭黄深蓝战袍
      ctx.fillStyle = '#1e3799';
      ctx.beginPath();
      ctx.roundRect(sx - 9, bodySy - 9, 18, 17, 3);
      ctx.fill();

      // 青面赤髯面容
      ctx.fillStyle = '#38ada9';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 7, 0, Math.PI * 2);
      ctx.fill();
      // 赤红短须
      ctx.fillStyle = '#eb2f06';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy - 8, 5, 2.5, 0, 0, Math.PI);
      ctx.fill();

      // 头戴亮金头箍
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 6, bodySy - 19, 12, 2.5);

      // 胸前九颗白骨骷髅项链 (降妖明证)
      ctx.fillStyle = '#f8f9fa';
      for (let i = -6; i <= 6; i += 3) {
        ctx.beginPath();
        ctx.arc(sx + i, bodySy - 4 + Math.abs(i) * 0.4, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // 降妖月牙宝杖 (双手合持，一头月牙铲一头降妖伏魔短杖)
      const staffSide = this.direction === 'left' ? -12 : 12;
      ctx.strokeStyle = '#dcdde1';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(sx + staffSide, bodySy - 25);
      ctx.lineTo(sx + staffSide, bodySy + 16);
      ctx.stroke();
      // 月牙锋刃
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx + staffSide, bodySy - 26, 5, Math.PI * 0.7, Math.PI * 2.3);
      ctx.stroke();

      ctx.fillStyle = '#1e3799';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 8, 4, 7);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 8, 4, 7);
      return;
    }

    // =========================================================================
    // 7. 地仙之祖镇元大仙 (太极鹤氅 · 乾坤云袖随风翻卷 · 白玉拂尘)
    // =========================================================================
    if (this.appearance === 'zhenyuanzi') {
      // 太极八卦金丝紫霞大氅 (宽博大袖)
      const sleeveSway = Math.sin(this.animTimer * 0.12) * 5;
      ctx.fillStyle = '#4a235a';
      ctx.beginPath();
      ctx.roundRect(sx - 11, bodySy - 9, 22, 18, 4);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // 胸前黑白阴阳太极图
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 2, 4.5, Math.PI * 0.5, Math.PI * 1.5);
      ctx.fill();

      // 飘拂的乾坤大袖
      ctx.fillStyle = '#5b2c6f';
      ctx.beginPath();
      ctx.moveTo(sx - 11, bodySy - 7);
      ctx.lineTo(sx - 17 + sleeveSway, bodySy + 12);
      ctx.lineTo(sx - 9, bodySy + 8);
      ctx.closePath();
      ctx.fill();

      // 仙风道骨清癯面容与长髯
      ctx.fillStyle = '#fed330';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 15, 6.5, 0, Math.PI * 2);
      ctx.fill();
      // 银白三绺长髯
      ctx.strokeStyle = '#f8f9fa';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(sx, bodySy - 10);
      ctx.lineTo(sx, bodySy - 2);
      ctx.stroke();

      // 紫金道冠
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.roundRect(sx - 5, bodySy - 22, 10, 4, 1.5);
      ctx.fill();

      // 三尺白玉拂尘
      const whiskSide = this.direction === 'left' ? -11 : 11;
      ctx.strokeStyle = '#f5f6fa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + whiskSide, bodySy - 6);
      ctx.lineTo(sx + whiskSide + 6, bodySy - 22);
      ctx.stroke();
      // 拂尘丝絮
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      for (let j = 0; j < 4; j++) {
        ctx.beginPath();
        ctx.moveTo(sx + whiskSide + 6, bodySy - 22);
        ctx.quadraticCurveTo(sx + whiskSide + 10 + j * 2, bodySy - 15, sx + whiskSide + 8 + j * 3, bodySy - 5);
        ctx.stroke();
      }

      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 5 + footOffset, bodySy + 9, 3.5, 6);
      ctx.fillRect(sx + 1.5 - footOffset, bodySy + 9, 3.5, 6);
      return;
    }

    // =========================================================================
    // 8. 唐三藏法师 (大红锦斓袈裟 · 毗卢僧冠 · 九环锡杖)
    // =========================================================================
    if (this.appearance === 'tang_seng') {
      // 锦斓金线袈裟
      ctx.fillStyle = '#b71540';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 9, 16, 17, 3);
      ctx.fill();
      // 金色袈裟方格线
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - 8, bodySy);
      ctx.lineTo(sx + 8, bodySy);
      ctx.moveTo(sx, bodySy - 9);
      ctx.lineTo(sx, bodySy + 8);
      ctx.stroke();

      // 慈悲面容
      ctx.fillStyle = '#fbd38d';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6, 0, Math.PI * 2);
      ctx.fill();

      // 金边毗卢僧冠
      ctx.fillStyle = '#e55039';
      ctx.beginPath();
      ctx.moveTo(sx - 6, bodySy - 16);
      ctx.lineTo(sx, bodySy - 25);
      ctx.lineTo(sx + 6, bodySy - 16);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 九环锡杖 (金光闪闪环佩铿锵)
      const staffSide = this.direction === 'left' ? -11 : 11;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sx + staffSide, bodySy - 26);
      ctx.lineTo(sx + staffSide, bodySy + 16);
      ctx.stroke();
      // 杖首大圆环与细小金环
      ctx.beginPath();
      ctx.arc(sx + staffSide, bodySy - 26, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(sx + staffSide - 3, bodySy - 24, 1.2, 0, Math.PI * 2);
      ctx.arc(sx + staffSide + 3, bodySy - 24, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // 脚下圣洁金莲微光
      const lotusAlpha = 0.35 + Math.sin(this.animTimer * 0.12) * 0.2;
      ctx.fillStyle = `rgba(255, 215, 0, ${lotusAlpha})`;
      ctx.beginPath();
      ctx.ellipse(sx, bodySy + 16, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#747d8c';
      ctx.fillRect(sx - 5 + footOffset, bodySy + 8, 3.5, 7);
      ctx.fillRect(sx + 1.5 - footOffset, bodySy + 8, 3.5, 7);
      return;
    }

    // =========================================================================
    // 9. 巡山虎先锋 (猛虎首铠 · 斑斓虎皮战袍 · 精钢双朴刀)
    // =========================================================================
    if (this.appearance === 'hu_xianfeng') {
      // 斑斓虎纹大衣
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.roundRect(sx - 9, bodySy - 9, 18, 16, 3);
      ctx.fill();
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 6, bodySy - 5, 4, 2.5);
      ctx.fillRect(sx + 2, bodySy - 2, 4, 2.5);

      // 吊睛猛虎首铠
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 7, 0, Math.PI * 2);
      ctx.fill();
      // 额间王字
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('王', sx, bodySy - 16);

      // 双持雪亮精钢朴刀
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx - 11, bodySy - 18);
      ctx.lineTo(sx - 11, bodySy + 10);
      ctx.moveTo(sx + 11, bodySy - 18);
      ctx.lineTo(sx + 11, bodySy + 10);
      ctx.stroke();

      ctx.fillStyle = '#2f3542';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 7, 4, 7);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 7, 4, 7);
      return;
    }

    // =========================================================================
    // 10. 白骨夫人 (白衣胜雪 · 幽冥阴刺 · 裙裾幽冥冷火缭绕)
    // =========================================================================
    if (this.appearance === 'baigu_jing') {
      // 胜雪素白长裙 (随风轻摆)
      const skirtWave = Math.sin(this.animTimer * 0.15) * 4;
      ctx.fillStyle = '#f5f6fa';
      ctx.beginPath();
      ctx.moveTo(sx - 7, bodySy - 8);
      ctx.lineTo(sx + 7, bodySy - 8);
      ctx.lineTo(sx + 10 + skirtWave, bodySy + 15);
      ctx.lineTo(sx - 10 + skirtWave, bodySy + 15);
      ctx.closePath();
      ctx.fill();

      // 裙裾底幽冥紫雾
      const mistAlpha = 0.4 + Math.sin(this.animTimer * 0.2) * 0.25;
      ctx.fillStyle = `rgba(142, 68, 173, ${mistAlpha})`;
      ctx.beginPath();
      ctx.ellipse(sx + skirtWave, bodySy + 16, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 绝艳苍白面庞与青丝
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6, 0, Math.PI * 2);
      ctx.fill();

      // 墨黑发髻与白骨阴簪
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 18, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 7, bodySy - 20);
      ctx.lineTo(sx + 7, bodySy - 20);
      ctx.stroke();
      return;
    }

    // =========================================================================
    // N1. 镇山太保·刘伯钦 (虎皮斑斓斜跨披肩 · 玄铁重猎弓 · 雕翎飞刀羽箭)
    // =========================================================================
    if (activeApp === 'liu_boqin') {
      ctx.fillStyle = '#4a3320';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 9, 16, 17, 3);
      ctx.fill();

      // 斜跨斑斓猛虎皮披肩 (金黄底斑驳虎纹)
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(sx - 9, bodySy - 9);
      ctx.lineTo(sx + 8, bodySy - 1);
      ctx.lineTo(sx + 7, bodySy + 9);
      ctx.lineTo(sx - 9, bodySy + 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1e140a';
      ctx.fillRect(sx - 5, bodySy - 5, 4, 1.8);
      ctx.fillRect(sx - 2, bodySy, 4.5, 1.8);

      // 英武猎户面庞
      ctx.fillStyle = '#f5cba7';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // 猎户方巾束发
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(sx - 5.5, bodySy - 20, 11, 4);

      // 背悬雕翎箭筒 (插着三支白羽箭)
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(sx - 9, bodySy - 16, 4, 12);
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(sx - 9, bodySy - 21, 1.2, 5);
      ctx.fillRect(sx - 7.5, bodySy - 23, 1.2, 7);
      ctx.fillRect(sx - 6, bodySy - 20, 1.2, 4);

      // 手持玄铁大猎弓 (深青铜微弧重弓)
      const bowSide = this.direction === 'left' ? -12 : 12;
      ctx.strokeStyle = '#57606f';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(sx + bowSide, bodySy - 3, 15, Math.PI * 0.7, Math.PI * 1.3);
      ctx.stroke();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(sx + bowSide - 2, bodySy - 17);
      ctx.lineTo(sx + bowSide - 2, bodySy + 11);
      ctx.stroke();

      // 兽皮猎靴
      ctx.fillStyle = '#2c1e14';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 8, 4, 7);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 8, 4, 7);
      return;
    }

    // =========================================================================
    // N2. 村长老者·刘太公 (雪白长须及胸 · 龙头拐杖 · 慈祥深朱员外袍)
    // =========================================================================
    if (activeApp === 'liu_taigong') {
      ctx.fillStyle = '#8b261e';
      ctx.beginPath();
      ctx.roundRect(sx - 9, bodySy - 9, 18, 18, 4);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sx - 5, bodySy - 9);
      ctx.lineTo(sx, bodySy);
      ctx.lineTo(sx + 5, bodySy - 9);
      ctx.stroke();

      // 慈祥老者面庞
      ctx.fillStyle = '#fbd38d';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // 头戴黑色员外小软巾
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.roundRect(sx - 6, bodySy - 21, 12, 5, 2);
      ctx.fill();

      // 胸前雪白飘逸长胡须
      ctx.fillStyle = '#f8f9fa';
      ctx.beginPath();
      ctx.moveTo(sx - 4, bodySy - 11);
      ctx.quadraticCurveTo(sx, bodySy + 3, sx + 4, bodySy - 11);
      ctx.lineTo(sx + 2, bodySy + 4);
      ctx.lineTo(sx - 2, bodySy + 4);
      ctx.closePath();
      ctx.fill();

      // 龙头苍木拐杖
      const caneSide = this.direction === 'left' ? -12 : 12;
      ctx.strokeStyle = '#5c3a21';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(sx + caneSide, bodySy - 20);
      ctx.lineTo(sx + caneSide, bodySy + 16);
      ctx.stroke();
      ctx.fillStyle = '#7a4e2d';
      ctx.beginPath();
      ctx.arc(sx + caneSide + (this.direction === 'left' ? -2 : 2), bodySy - 21, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#34495e';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 9, 4, 6);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 9, 4, 6);
      return;
    }

    // =========================================================================
    // N3. 当方土地公 / 蟠桃园土地 (矮小仙身 · 白眉长须 · 蟠龙木杖寿桃 · 脚踏祥云)
    // =========================================================================
    if (activeApp === 'tudi_gong') {
      const cloudFloat = Math.sin(this.animTimer * 0.15) * 2;
      ctx.fillStyle = 'rgba(236, 240, 241, 0.75)';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy + 15 + cloudFloat, 12, 5, 0, 0, Math.PI * 2);
      ctx.ellipse(sx - 6, bodySy + 14 + cloudFloat, 6, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(sx + 6, bodySy + 14 + cloudFloat, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 矮小微躬青褐仙袍
      ctx.fillStyle = '#2e4053';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 6, 16, 15, 4);
      ctx.fill();
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(sx - 8, bodySy + 1, 16, 2.5);

      // 慈祥圆面白发翁
      ctx.fillStyle = '#fce4ec';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 11, 6.2, 0, Math.PI * 2);
      ctx.fill();

      // 青布小仙巾
      ctx.fillStyle = '#1b4f72';
      ctx.beginPath();
      ctx.roundRect(sx - 5.5, bodySy - 18, 11, 4.5, 2);
      ctx.fill();

      // 白眉与长白胡须
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx - 4, bodySy - 8);
      ctx.lineTo(sx, bodySy + 5);
      ctx.lineTo(sx + 4, bodySy - 8);
      ctx.closePath();
      ctx.fill();

      // 右手蟠木手杖
      const staffX = this.direction === 'left' ? sx - 10 : sx + 10;
      ctx.strokeStyle = '#784212';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(staffX, bodySy - 16);
      ctx.lineTo(staffX, bodySy + 15);
      ctx.stroke();

      // 左手托粉红金仙寿桃
      const peachX = this.direction === 'left' ? sx + 7 : sx - 7;
      ctx.fillStyle = '#f8a5c2';
      ctx.beginPath();
      ctx.arc(peachX, bodySy - 2, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(peachX - 1, bodySy - 4, 2, 1.5);
      return;
    }

    // =========================================================================
    // N4. 太白金星 (素白流云仙鹤氅 · 鹤发童颜 · 白玉拂尘搭臂)
    // =========================================================================
    if (activeApp === 'taibai') {
      ctx.fillStyle = '#f8f9fa';
      ctx.beginPath();
      ctx.roundRect(sx - 9, bodySy - 9, 18, 18, 3);
      ctx.fill();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 9, bodySy - 9, 18, 18);

      ctx.fillStyle = '#fbd38d';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx - 3, bodySy - 10);
      ctx.lineTo(sx, bodySy + 2);
      ctx.lineTo(sx + 3, bodySy - 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 4.5, bodySy - 20, 9, 3);

      const dustSide = this.direction === 'left' ? -11 : 11;
      ctx.strokeStyle = '#dcdde1';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sx + dustSide, bodySy - 18);
      ctx.lineTo(sx + dustSide, bodySy + 8);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.moveTo(sx + dustSide, bodySy - 18);
      ctx.quadraticCurveTo(sx + dustSide + (this.direction === 'left' ? 6 : -6), bodySy - 10, sx + dustSide + (this.direction === 'left' ? 4 : -4), bodySy - 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 5.5 + footOffset, bodySy + 9, 3.5, 6);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 9, 3.5, 6);
      return;
    }

    // =========================================================================
    // N5. 南海观世音菩萨 (端坐千叶金莲台 · 羊脂玉净瓶与杨柳枝 · 七彩佛光宝轮)
    // =========================================================================
    if (activeApp === 'guanyin') {
      const haloAlpha = 0.5 + Math.sin(this.animTimer * 0.15) * 0.2;
      const haloGrad = ctx.createRadialGradient(sx, bodySy - 14, 4, sx, bodySy - 14, 20);
      haloGrad.addColorStop(0, `rgba(255, 255, 255, ${haloAlpha})`);
      haloGrad.addColorStop(0.5, `rgba(255, 215, 0, ${haloAlpha * 0.7})`);
      haloGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 20, 0, Math.PI * 2);
      ctx.fill();

      // 底座九品千叶金莲宝座
      ctx.fillStyle = '#f8a5c2';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy + 13, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 9, 16, 17, 4);
      ctx.fill();

      ctx.fillStyle = '#fce4ec';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.moveTo(sx - 5, bodySy - 18);
      ctx.lineTo(sx, bodySy - 24);
      ctx.lineTo(sx + 5, bodySy - 18);
      ctx.closePath();
      ctx.fill();

      const bottleSide = this.direction === 'left' ? -9 : 9;
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(sx + bottleSide - 2, bodySy - 5, 4, 8);
      ctx.fillStyle = '#2ecc71';
      ctx.beginPath();
      ctx.moveTo(sx + bottleSide, bodySy - 5);
      ctx.lineTo(sx + bottleSide + (this.direction === 'left' ? -3 : 3), bodySy - 12);
      ctx.stroke();
      return;
    }

    // =========================================================================
    // N6. 东海龙王敖广 (沧海刺绣龙袍 · 真龙金冠龙角 · 掌托辟水龙珠)
    // =========================================================================
    if (activeApp === 'dragon_king') {
      ctx.fillStyle = '#102a43';
      ctx.beginPath();
      ctx.roundRect(sx - 9, bodySy - 9, 18, 18, 3);
      ctx.fill();
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(sx, bodySy, 5, 0, Math.PI * 1.5);
      ctx.stroke();

      ctx.fillStyle = '#fbd38d';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx - 4, bodySy - 10);
      ctx.lineTo(sx, bodySy + 3);
      ctx.lineTo(sx + 4, bodySy - 10);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#00d2d3';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(sx - 4, bodySy - 18);
      ctx.lineTo(sx - 8, bodySy - 25);
      ctx.moveTo(sx + 4, bodySy - 18);
      ctx.lineTo(sx + 8, bodySy - 25);
      ctx.stroke();

      const pearlSide = this.direction === 'left' ? -12 : 12;
      ctx.fillStyle = '#54a0ff';
      ctx.beginPath();
      ctx.arc(sx + pearlSide, bodySy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx + pearlSide - 1, bodySy - 1, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#243b53';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 9, 4, 6);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 9, 4, 6);
      return;
    }

    // =========================================================================
    // N7. 钟馗天师 (大红进士官袍 · 铁面虬髯 · 斜跨斩鬼宝剑)
    // =========================================================================
    if (activeApp === 'zhongkui') {
      ctx.fillStyle = '#c0392b';
      ctx.beginPath();
      ctx.roundRect(sx - 9, bodySy - 9, 18, 17, 3);
      ctx.fill();
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 9, bodySy, 18, 3);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 2, bodySy, 4, 3);

      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 9, 6, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 7, bodySy - 21, 14, 5);
      ctx.fillRect(sx - 12, bodySy - 19, 24, 2);

      const swordSide = this.direction === 'left' ? -12 : 12;
      ctx.strokeStyle = '#70a1ff';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(sx + swordSide, bodySy - 20);
      ctx.lineTo(sx + swordSide, bodySy + 14);
      ctx.stroke();

      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 8, 4, 7);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 8, 4, 7);
      return;
    }

    // =========================================================================
    // N8. 李铁匠 (雄健臂膀 · 牛皮围裙 · 精钢重铸锤 · 火星四射)
    // =========================================================================
    if (activeApp === 'tiejiang') {
      ctx.fillStyle = '#5c3a21';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 8, 16, 17, 2);
      ctx.fill();

      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(sx - 6, bodySy - 20, 12, 3.5);

      const hammerSide = this.direction === 'left' ? -12 : 12;
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx + hammerSide, bodySy - 16);
      ctx.lineTo(sx + hammerSide, bodySy + 12);
      ctx.stroke();
      ctx.fillStyle = '#bdc3c7';
      ctx.fillRect(sx + hammerSide - 4, bodySy - 20, 8, 6);

      ctx.fillStyle = '#ff4757';
      ctx.fillRect(sx + hammerSide + 4, bodySy - 12, 1.5, 1.5);
      ctx.fillRect(sx + hammerSide - 5, bodySy - 8, 1.5, 1.5);

      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 9, 4, 6);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 9, 4, 6);
      return;
    }

    // =========================================================================
    // N9. 钱庄老医师 (青布长衫 · 药葫芦 · 银针药囊)
    // =========================================================================
    if (activeApp === 'doctor') {
      ctx.fillStyle = '#16a085';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 9, 16, 17, 3);
      ctx.fill();

      ctx.fillStyle = '#fbd38d';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx - 3, bodySy - 10);
      ctx.lineTo(sx, bodySy + 1);
      ctx.lineTo(sx + 3, bodySy - 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(sx - 5.5, bodySy - 20, 11, 4.5);

      const gourdSide = this.direction === 'left' ? 8 : -8;
      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.arc(sx + gourdSide, bodySy - 4, 4, 0, Math.PI * 2);
      ctx.arc(sx + gourdSide, bodySy + 3, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(sx - 5.5 + footOffset, bodySy + 8, 3.5, 7);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 8, 3.5, 7);
      return;
    }

    // =========================================================================
    // N10. 采桃红衣仙女 (飞天羽衣 · 迎风披帛 · 灵动仙桃篮)
    // =========================================================================
    if (activeApp === 'xiannv') {
      const dressWave = Math.sin(this.animTimer * 0.15) * 3;
      ctx.fillStyle = '#eb4d4b';
      ctx.beginPath();
      ctx.moveTo(sx - 7, bodySy - 8);
      ctx.lineTo(sx + 7, bodySy - 8);
      ctx.lineTo(sx + 9 + dressWave, bodySy + 14);
      ctx.lineTo(sx - 9 + dressWave, bodySy + 14);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#7ed6df';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx, bodySy - 3, 11, Math.PI * 0.8, Math.PI * 2.2);
      ctx.stroke();

      ctx.fillStyle = '#fce4ec';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(sx - 4, bodySy - 19, 2.5, 0, Math.PI * 2);
      ctx.arc(sx + 4, bodySy - 19, 2.5, 0, Math.PI * 2);
      ctx.fill();

      const basketSide = this.direction === 'left' ? -9 : 9;
      ctx.fillStyle = '#f5cd79';
      ctx.fillRect(sx + basketSide - 3, bodySy, 6, 4.5);
      ctx.fillStyle = '#ff6b81';
      ctx.beginPath();
      ctx.arc(sx + basketSide, bodySy - 1, 2.2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // =========================================================================
    // N11. 长安织造·苏绣娘 (淡粉蜀锦襦裙 · 云髻金簪 · 刺绣竹篮)
    // =========================================================================
    if (activeApp === 'changan_girl') {
      const skirtWave = Math.sin(this.animTimer * 0.14) * 2.5;
      // 淡粉蜀锦襦裙
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(sx - 7, bodySy - 8);
      ctx.lineTo(sx + 7, bodySy - 8);
      ctx.lineTo(sx + 9 + skirtWave, bodySy + 15);
      ctx.lineTo(sx - 9 + skirtWave, bodySy + 15);
      ctx.closePath();
      ctx.fill();

      // 水蓝锦绣披肩
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(sx - 7, bodySy - 8, 14, 4);

      // 温柔面庞
      ctx.fillStyle = '#fdf2f8';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6, 0, Math.PI * 2);
      ctx.fill();

      // 垂云高髻与金簪
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 19, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(sx - 5, bodySy - 18, 10, 1.5);

      // 提着一篮锦缎蜀绣花线
      const basketX = this.direction === 'left' ? sx - 9 : sx + 9;
      ctx.fillStyle = '#d97706';
      ctx.fillRect(basketX - 3, bodySy + 1, 6, 5);
      ctx.fillStyle = '#ec4899';
      ctx.fillRect(basketX - 2, bodySy, 4, 2);
      return;
    }

    // =========================================================================
    // N12. 游方书生·杜子美 (青衿长袍 · 纶巾高冠 · 洒金折扇)
    // =========================================================================
    if (activeApp === 'changan_scholar') {
      // 儒雅青衿儒袍
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 9, 16, 17, 3);
      ctx.fill();
      // 白色交领与内衬
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx - 3, bodySy - 9);
      ctx.lineTo(sx, bodySy - 2);
      ctx.lineTo(sx + 3, bodySy - 9);
      ctx.fill();

      // 清俊面容
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.2, 0, Math.PI * 2);
      ctx.fill();

      // 缁布纶巾书生冠
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(sx - 5, bodySy - 21, 10, 5, 2);
      ctx.fill();
      // 冠后垂下两道软带
      ctx.fillStyle = '#334155';
      ctx.fillRect(sx - 4, bodySy - 16, 2, 8);
      ctx.fillRect(sx + 2, bodySy - 16, 2, 8);

      // 手中洒金折扇
      const fanSide = this.direction === 'left' ? -10 : 10;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(sx + fanSide, bodySy - 2);
      ctx.arc(sx + fanSide, bodySy - 2, 6, -Math.PI * 0.4, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.fillRect(sx - 5 + footOffset, bodySy + 8, 3.5, 7);
      ctx.fillRect(sx + 1.5 - footOffset, bodySy + 8, 3.5, 7);
      return;
    }

    // =========================================================================
    // N13. 挑担货郎·阿福 (麻布短打 · 头扎汗巾 · 双肩竹编货担)
    // =========================================================================
    if (activeApp === 'changan_hawker') {
      // 粗麻短褐
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.roundRect(sx - 7.5, bodySy - 8, 15, 15, 2);
      ctx.fill();

      // 黝黑红润面庞
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 13, 6, 0, Math.PI * 2);
      ctx.fill();

      // 头扎白色汗巾
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(sx - 6, bodySy - 18, 12, 3);

      // 肩扛青竹扁担 (两端悬挂红布方筐)
      ctx.strokeStyle = '#65a30d';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(sx - 15, bodySy - 6);
      ctx.lineTo(sx + 15, bodySy - 6);
      ctx.stroke();

      // 前后两只竹编货筐与红点心盒
      ctx.fillStyle = '#78350f';
      ctx.fillRect(sx - 17, bodySy - 2, 7, 7);
      ctx.fillRect(sx + 10, bodySy - 2, 7, 7);
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(sx - 16, bodySy - 5, 5, 3);
      ctx.fillRect(sx + 11, bodySy - 5, 5, 3);

      ctx.fillStyle = '#451a03';
      ctx.fillRect(sx - 5 + footOffset, bodySy + 7, 3.5, 7);
      ctx.fillRect(sx + 1.5 - footOffset, bodySy + 7, 3.5, 7);
      return;
    }

    // =========================================================================
    // N14. 坊间小童·小虎 (总角发髻 · 红兜肚 · 晶莹冰糖葫芦)
    // =========================================================================
    if (activeApp === 'changan_child') {
      // 矮小稚嫩身段
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(sx - 6, bodySy - 5, 12, 12, 4);
      ctx.fill();

      // 白嫩圆脸
      ctx.fillStyle = '#fff1f2';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 10, 5.2, 0, Math.PI * 2);
      ctx.fill();

      // 总角双丫髻
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(sx - 4, bodySy - 15, 2.5, 0, Math.PI * 2);
      ctx.arc(sx + 4, bodySy - 15, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx - 5, bodySy - 13, 2, 1.5);
      ctx.fillRect(sx + 3, bodySy - 13, 2, 1.5);

      // 手持晶莹剔透红彤彤冰糖葫芦
      const stickSide = this.direction === 'left' ? -9 : 9;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx + stickSide, bodySy - 16);
      ctx.lineTo(sx + stickSide, bodySy + 4);
      ctx.stroke();
      ctx.fillStyle = '#dc2626';
      for (let bi = 0; bi < 3; bi++) {
        ctx.beginPath();
        ctx.arc(sx + stickSide, bodySy - 14 + bi * 4, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#f87171';
      ctx.fillRect(sx - 4 + footOffset, bodySy + 7, 3, 5);
      ctx.fillRect(sx + 1 - footOffset, bodySy + 7, 3, 5);
      return;
    }

    // =========================================================================
    // N15. 金甲禁军·巡城校尉 (金翅凤翅盔 · 明光重铠 · 威武红缨长枪)
    // =========================================================================
    if (activeApp === 'changan_guard') {
      // 鲜红战袍与金甲
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(sx - 9, bodySy - 8, 18, 17);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(sx - 7, bodySy - 8, 14, 10);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 7, bodySy - 8, 14, 10);

      // 护心镜
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 威武刚毅面庞
      ctx.fillStyle = '#fed7aa';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // 金翅凤盔
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.roundRect(sx - 6, bodySy - 21, 12, 6, 2);
      ctx.fill();
      // 盔顶红缨
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, bodySy - 21);
      ctx.lineTo(sx, bodySy - 27);
      ctx.stroke();

      // 手持红缨金锋长枪
      const spearSide = this.direction === 'left' ? -12 : 12;
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sx + spearSide, bodySy - 25);
      ctx.lineTo(sx + spearSide, bodySy + 16);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(sx + spearSide, bodySy - 30);
      ctx.lineTo(sx + spearSide - 3, bodySy - 24);
      ctx.lineTo(sx + spearSide + 3, bodySy - 24);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sx + spearSide - 2.5, bodySy - 24, 5, 3);

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 9, 4, 6);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 9, 4, 6);
      return;
    }

    // =========================================================================
    // 11. 凡间行者 (主角被贬后失忆姿态 · 劲装长剑英姿勃发)
    // =========================================================================
    // 粗布青灰锦袍、麻绳与皮革束腰
    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.roundRect(sx - 8, bodySy - 9, 16, 16, 3);
    ctx.fill();
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 朱砂皮质束腰与挂佩
    ctx.fillStyle = '#e67e22';
    ctx.fillRect(sx - 8, bodySy - 1, 16, 2.5);
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.arc(sx - 4, bodySy + 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // 行者坚毅面容与黑发方巾束发
    ctx.fillStyle = '#fbd38d';
    ctx.beginPath();
    ctx.arc(sx, bodySy - 14, 6.2, 0, Math.PI * 2);
    ctx.fill();
    // 黑色束发小冠
    ctx.fillStyle = '#1e272e';
    ctx.beginPath();
    ctx.roundRect(sx - 4.5, bodySy - 20, 9, 4, 1.5);
    ctx.fill();

    // 佩戴青铜三尺剑
    const swordDir = this.direction === 'left' ? -10 : 10;
    ctx.strokeStyle = '#95a5a6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sx + swordDir, bodySy - 14);
    ctx.lineTo(sx + swordDir, bodySy + 12);
    ctx.stroke();
    // 剑格
    ctx.fillStyle = '#f39c12';
    ctx.fillRect(sx + swordDir - 2.5, bodySy - 7, 5, 2);

    // 行路草鞋/绑腿
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(sx - 5.5 + footOffset, bodySy + 7, 3.5, 7);
    ctx.fillRect(sx + 2 - footOffset, bodySy + 7, 3.5, 7);
  }

  drawMonsterBody(ctx, sx, sy, bodySy, footOffset) {
    const type = this.monsterType || this.inferMonsterType(this.name, this.id);
    const isLeft = this.direction === 'left';
    const flip = isLeft ? -1 : 1;
    const walkBob = this.isMoving ? Math.sin(this.animTimer * 0.3) * 2 : 0;

    // =========================================================================
    // M1. 偷粮硕鼠 (毛绒圆肚皮 · 尖吻大板牙 · 细长灵动鼠尾 · 粉嫩大圆耳)
    // =========================================================================
    if (type === 'rat') {
      // 细长灵动尾巴 (三段贝塞尔波浪曲线随移动甩动)
      const tailWave = Math.sin(this.animTimer * 0.25) * 4;
      ctx.strokeStyle = '#f8a5c2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - flip * 8, bodySy + 5);
      ctx.quadraticCurveTo(sx - flip * 16, bodySy - 2 + tailWave, sx - flip * 18, bodySy - 8 + tailWave * 1.5);
      ctx.stroke();

      // 灰褐毛绒圆滚身躯
      ctx.fillStyle = '#57606f';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy, 10, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // 白嫩肚皮
      ctx.fillStyle = '#dcdde1';
      ctx.beginPath();
      ctx.ellipse(sx + flip * 2, bodySy + 2, 6, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 尖俏鼠头与大圆耳 (外灰内粉)
      const headX = sx + flip * 7;
      const headY = bodySy - 3;
      // 耳朵
      ctx.fillStyle = '#57606f';
      ctx.beginPath();
      ctx.arc(headX - flip * 4, headY - 8, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f8a5c2';
      ctx.beginPath();
      ctx.arc(headX - flip * 4, headY - 8, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // 鼠头
      ctx.fillStyle = '#57606f';
      ctx.beginPath();
      ctx.ellipse(headX, headY, 6, 5, isLeft ? -0.3 : 0.3, 0, Math.PI * 2);
      ctx.fill();

      // 黑亮眼睛
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(headX + flip * 1.5, headY - 2, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + flip * 1.8, headY - 2.5, 0.7, 0, Math.PI * 2);
      ctx.fill();

      // 尖尖红鼻头与两颗白板牙
      ctx.fillStyle = '#ff6b81';
      ctx.beginPath();
      ctx.arc(headX + flip * 6, headY, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(headX + flip * 5, headY + 1.2, 1.8, 2.2);

      // 细须
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(headX + flip * 5, headY - 1);
      ctx.lineTo(headX + flip * 11, headY - 3);
      ctx.moveTo(headX + flip * 5, headY + 1);
      ctx.lineTo(headX + flip * 10, headY + 3);
      ctx.stroke();

      // 小肉爪与短腿踩地
      ctx.fillStyle = '#e17055';
      ctx.fillRect(sx - 5 + footOffset, bodySy + 7, 3, 3);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 7, 3, 3);
      return;
    }

    // =========================================================================
    // M2. 山林小野猪 / 野猪怪 (黑褐重鬃 · 向上锐利双白獠牙 · 粗壮猪拱嘴 · 短卷尾)
    // =========================================================================
    if (type === 'pig') {
      // 粗壮黑褐野猪躯体
      ctx.fillStyle = '#4b382a';
      ctx.beginPath();
      ctx.roundRect(sx - 11, bodySy - 7, 22, 15, 6);
      ctx.fill();

      // 背上尖锐刺猬硬鬃毛
      ctx.fillStyle = '#1e130c';
      for (let i = -8; i <= 6; i += 3) {
        ctx.beginPath();
        ctx.moveTo(sx + i, bodySy - 7);
        ctx.lineTo(sx + i + 1.5, bodySy - 12);
        ctx.lineTo(sx + i + 3, bodySy - 7);
        ctx.fill();
      }

      // 粗厚野猪首级
      const pigHeadX = sx + flip * 7;
      ctx.fillStyle = '#573f2c';
      ctx.beginPath();
      ctx.arc(pigHeadX, bodySy - 2, 7.5, 0, Math.PI * 2);
      ctx.fill();

      // 突出的厚猪嘴与猪鼻孔
      ctx.fillStyle = '#8c503e';
      ctx.beginPath();
      ctx.roundRect(pigHeadX + flip * 3, bodySy - 1, flip * 6, 6, 2);
      ctx.fill();
      ctx.fillStyle = '#2d1500';
      ctx.beginPath();
      ctx.arc(pigHeadX + flip * 6, bodySy + 1.5, 1, 0, Math.PI * 2);
      ctx.fill();

      // 向上翘起的两根森白獠牙 (极其威猛)
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(pigHeadX + flip * 4, bodySy + 3);
      ctx.lineTo(pigHeadX + flip * 8, bodySy - 3);
      ctx.lineTo(pigHeadX + flip * 5, bodySy + 1);
      ctx.closePath();
      ctx.fill();

      // 凶红猪瞳
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(pigHeadX + flip * 2, bodySy - 4, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 细小卷尾
      ctx.strokeStyle = '#8c503e';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(sx - flip * 11, bodySy - 2, 3, 0, Math.PI * 1.5);
      ctx.stroke();

      // 四蹄踩踏
      ctx.fillStyle = '#1e140a';
      ctx.fillRect(sx - 8 + footOffset, bodySy + 7, 3.5, 6);
      ctx.fillRect(sx - 2 - footOffset, bodySy + 7, 3.5, 6);
      ctx.fillRect(sx + 3 + footOffset, bodySy + 7, 3.5, 6);
      ctx.fillRect(sx + 7 - footOffset, bodySy + 7, 3.5, 6);
      return;
    }

    // =========================================================================
    // M3. 恶狼 / 郊狼 / 狼王 (苍灰青蓝精壮躯 · 耸立三角尖耳 · 幽绿凶煞瞳 · 蓬松狼尾)
    // =========================================================================
    if (type === 'wolf') {
      const tailWave = Math.sin(this.animTimer * 0.2) * 5;
      // 蓬松浓密翘起大狼尾
      ctx.fillStyle = '#3d4852';
      ctx.beginPath();
      ctx.moveTo(sx - flip * 9, bodySy + 2);
      ctx.quadraticCurveTo(sx - flip * 18, bodySy - 4 + tailWave, sx - flip * 15, bodySy - 14 + tailWave);
      ctx.lineTo(sx - flip * 8, bodySy + 6);
      ctx.closePath();
      ctx.fill();

      // 苍青灰流线狼躯
      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy - 1, 11, 7, isLeft ? 0.2 : -0.2, 0, Math.PI * 2);
      ctx.fill();

      // 颈部浓密野兽鬃毛
      ctx.fillStyle = '#718096';
      ctx.beginPath();
      ctx.arc(sx + flip * 4, bodySy - 3, 6, 0, Math.PI * 2);
      ctx.fill();

      // 坚毅冷酷狼首
      const wolfHeadX = sx + flip * 8;
      const wolfHeadY = bodySy - 5;
      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.moveTo(wolfHeadX - flip * 3, wolfHeadY + 4);
      ctx.lineTo(wolfHeadX + flip * 8, wolfHeadY + 2);
      ctx.lineTo(wolfHeadX + flip * 2, wolfHeadY - 5);
      ctx.closePath();
      ctx.fill();

      // 耸立修长狼耳 (外灰内深)
      ctx.fillStyle = '#2d3748';
      ctx.beginPath();
      ctx.moveTo(wolfHeadX, wolfHeadY - 4);
      ctx.lineTo(wolfHeadX + flip * 2, wolfHeadY - 12);
      ctx.lineTo(wolfHeadX + flip * 5, wolfHeadY - 3);
      ctx.closePath();
      ctx.fill();

      // 幽绿幽光冰冷狼瞳
      ctx.fillStyle = '#2ed573';
      ctx.beginPath();
      ctx.arc(wolfHeadX + flip * 3, wolfHeadY - 1, 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 獠牙露白
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wolfHeadX + flip * 5, wolfHeadY + 3, 1.5, 2);

      // 四条修长健步狼腿
      ctx.fillStyle = '#2d3748';
      ctx.fillRect(sx - 7 + footOffset, bodySy + 5, 3, 8);
      ctx.fillRect(sx - 2 - footOffset, bodySy + 5, 3, 8);
      ctx.fillRect(sx + 3 + footOffset, bodySy + 5, 3, 8);
      ctx.fillRect(sx + 7 - footOffset, bodySy + 5, 3, 8);
      return;
    }

    // =========================================================================
    // M4. 吊睛猛虎 / 凶虎 (斑斓金橙黑纹 · 额前黑色“王”字 · 粗长钢鞭虎尾)
    // =========================================================================
    if (type === 'tiger') {
      const tailSwing = Math.sin(this.animTimer * 0.22) * 5;
      // 钢鞭虎尾 (黑黄相间环纹)
      ctx.strokeStyle = '#e67e22';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx - flip * 10, bodySy + 2);
      ctx.quadraticCurveTo(sx - flip * 18, bodySy - 5 + tailSwing, sx - flip * 16, bodySy - 14 + tailSwing);
      ctx.stroke();
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - flip * 17, bodySy - 8 + tailSwing, 2.5, 2.5);

      // 魁梧金橙虎躯
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.roundRect(sx - 12, bodySy - 7, 23, 14, 5);
      ctx.fill();

      // 虎躯黑色斑纹
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(sx - 6, bodySy - 6, 2.5, 6);
      ctx.fillRect(sx - 1, bodySy - 5, 2.5, 8);
      ctx.fillRect(sx + 4, bodySy - 6, 2.5, 7);

      // 霸气虎头与厚圆耳
      const tigerHeadX = sx + flip * 8;
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.arc(tigerHeadX, bodySy - 3, 8, 0, Math.PI * 2);
      ctx.fill();
      // 虎耳
      ctx.fillStyle = '#2c3e50';
      ctx.beginPath();
      ctx.arc(tigerHeadX - flip * 4, bodySy - 10, 3, 0, Math.PI * 2);
      ctx.fill();

      // 额间清晰霸气黑色“王”字！
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('王', tigerHeadX + flip * 1, bodySy - 6);

      // 吊睛金瞳与白色腮须
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(tigerHeadX + flip * 3, bodySy - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(tigerHeadX + flip * 5, bodySy + 2, 2, 2.5);

      // 虎爪着地
      ctx.fillStyle = '#d35400';
      ctx.fillRect(sx - 8 + footOffset, bodySy + 7, 4, 6);
      ctx.fillRect(sx - 2 - footOffset, bodySy + 7, 4, 6);
      ctx.fillRect(sx + 4 + footOffset, bodySy + 7, 4, 6);
      ctx.fillRect(sx + 8 - footOffset, bodySy + 7, 4, 6);
      return;
    }

    // =========================================================================
    // M5. 幽谷青蛇 / 盘涧玄蛇 (翡翠碧鳞 · S型波浪蜿蜒盘动 · 赤红分叉蛇信 · 金眸)
    // =========================================================================
    if (type === 'snake') {
      const sWave = Math.sin(this.animTimer * 0.25) * 6;
      const sWave2 = Math.cos(this.animTimer * 0.25) * 5;

      // 碧鳞流光蛇躯 (S型贝塞尔多段蜿蜒)
      ctx.strokeStyle = '#2ed573';
      ctx.lineWidth = 6.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(sx - flip * 12, bodySy + 7);
      ctx.bezierCurveTo(
        sx - flip * 4 + sWave, bodySy + 12,
        sx + flip * 2 - sWave, bodySy - 2 + sWave2,
        sx + flip * 8, bodySy - 4
      );
      ctx.stroke();

      // 蛇脊暗绿背棱
      ctx.strokeStyle = '#10ac84';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 三角昂扬蛇首
      const snakeHeadX = sx + flip * 10;
      const snakeHeadY = bodySy - 5;
      ctx.fillStyle = '#10ac84';
      ctx.beginPath();
      ctx.moveTo(snakeHeadX - flip * 4, snakeHeadY - 4);
      ctx.lineTo(snakeHeadX + flip * 6, snakeHeadY);
      ctx.lineTo(snakeHeadX - flip * 4, snakeHeadY + 4);
      ctx.closePath();
      ctx.fill();

      // 冷酷金瞳竖线
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(snakeHeadX + flip * 1, snakeHeadY - 1, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(snakeHeadX + flip * 1 - 0.4, snakeHeadY - 2, 0.8, 2);

      // 赤红分叉探吐信子 (随动画伸缩)
      const tongueLen = Math.abs(Math.sin(this.animTimer * 0.35)) * 6 + 2;
      ctx.strokeStyle = '#ff4757';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(snakeHeadX + flip * 5, snakeHeadY);
      ctx.lineTo(snakeHeadX + flip * (5 + tongueLen), snakeHeadY);
      ctx.lineTo(snakeHeadX + flip * (7 + tongueLen), snakeHeadY - 1.5);
      ctx.moveTo(snakeHeadX + flip * (5 + tongueLen), snakeHeadY);
      ctx.lineTo(snakeHeadX + flip * (7 + tongueLen), snakeHeadY + 1.5);
      ctx.stroke();

      // 蛇身周围淡淡毒烟青雾
      ctx.fillStyle = 'rgba(46, 213, 115, 0.2)';
      ctx.beginPath();
      ctx.arc(sx, bodySy + 4, 11, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // =========================================================================
    // M6. 灵隐小野狐 / 灵狐 / 九尾妖狐 (火红身躯 · 纯白胸腹 · 尖翘灵耳 · 飘逸大蓬松狐尾)
    // =========================================================================
    if (type === 'fox') {
      const tailWave = Math.sin(this.animTimer * 0.18) * 6;
      // 巨大蓬松火红狐尾 (尾尖如雪)
      ctx.fillStyle = '#ff6348';
      ctx.beginPath();
      ctx.moveTo(sx - flip * 6, bodySy + 3);
      ctx.quadraticCurveTo(sx - flip * 18, bodySy - 8 + tailWave, sx - flip * 12, bodySy - 18 + tailWave);
      ctx.quadraticCurveTo(sx - flip * 4, bodySy - 10 + tailWave, sx - flip * 3, bodySy + 6);
      ctx.fill();
      // 尾尖纯白雪球
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx - flip * 12, bodySy - 17 + tailWave, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // 纤巧火红狐躯
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy - 1, 9, 6.5, isLeft ? 0.2 : -0.2, 0, Math.PI * 2);
      ctx.fill();

      // 纯白如雪胸腹
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(sx + flip * 3, bodySy + 1, 5, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 灵动俏丽小狐脸
      const foxHeadX = sx + flip * 6;
      const foxHeadY = bodySy - 5;
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.moveTo(foxHeadX - flip * 2, foxHeadY + 3);
      ctx.lineTo(foxHeadX + flip * 6, foxHeadY + 1);
      ctx.lineTo(foxHeadX + flip * 1, foxHeadY - 4);
      ctx.closePath();
      ctx.fill();

      // 高耸尖俏大狐耳 (外红内白绒毛)
      ctx.fillStyle = '#ee5253';
      ctx.beginPath();
      ctx.moveTo(foxHeadX - flip * 1, foxHeadY - 3);
      ctx.lineTo(foxHeadX + flip * 1, foxHeadY - 11);
      ctx.lineTo(foxHeadX + flip * 4, foxHeadY - 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(foxHeadX + flip * 0.2, foxHeadY - 4);
      ctx.lineTo(foxHeadX + flip * 1.5, foxHeadY - 9);
      ctx.lineTo(foxHeadX + flip * 3, foxHeadY - 4);
      ctx.closePath();
      ctx.fill();

      // 妩媚狐眼与粉鼻
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(foxHeadX + flip * 2.5, foxHeadY - 0.5, 1.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff9ff3';
      ctx.fillRect(foxHeadX + flip * 5.5, foxHeadY + 0.5, 1.2, 1.2);

      // 轻盈四肢
      ctx.fillStyle = '#ee5253';
      ctx.fillRect(sx - 5 + footOffset, bodySy + 5, 2.5, 7);
      ctx.fillRect(sx - 1 - footOffset, bodySy + 5, 2.5, 7);
      ctx.fillRect(sx + 3 + footOffset, bodySy + 5, 2.5, 7);
      ctx.fillRect(sx + 6 - footOffset, bodySy + 5, 2.5, 7);
      return;
    }

    // =========================================================================
    // M7. 灵河巨蚌 / 翡翠彩蚌 (青紫晶润双扇贝壳 · 呼吸开阖 · 绚丽内丹珍珠)
    // =========================================================================
    if (type === 'clam') {
      const openAngle = 0.15 + Math.abs(Math.sin(this.animTimer * 0.08)) * 0.25;

      // 下扇大贝壳
      ctx.fillStyle = '#574b90';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy + 4, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#786fa6';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 蚌内嫩粉蚌肉
      ctx.fillStyle = '#f8a5c2';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy + 2, 9, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 上扇开阖贝壳
      ctx.save();
      ctx.translate(sx - 12, bodySy + 2);
      ctx.rotate(-openAngle);
      ctx.fillStyle = '#303952';
      ctx.beginPath();
      ctx.ellipse(12, -4, 13, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#786fa6';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // 贝壳生长纹
      ctx.strokeStyle = '#596275';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(12, -4, 7, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
      ctx.restore();

      // 中央流光夜明大珍珠 (五彩珠华)
      const pearlGlow = 0.6 + Math.sin(this.animTimer * 0.15) * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${pearlGlow})`;
      ctx.beginPath();
      ctx.arc(sx + 2, bodySy + 1, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 珍珠光晕圈
      ctx.strokeStyle = 'rgba(102, 217, 232, 0.5)';
      ctx.beginPath();
      ctx.arc(sx + 2, bodySy + 1, 7, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    // =========================================================================
    // M8. 青壳霸王蟹 / 黄金螯蟹 / 蟹将 (重装圆盘螯甲 · 挥舞开合大蟹钳 · 节肢横爬)
    // =========================================================================
    if (type === 'crab') {
      const clawPinch = Math.sin(this.animTimer * 0.2) * 3;

      // 左右多节横行爬动细足
      ctx.strokeStyle = '#218c74';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        const footW = footOffset * 0.6;
        // 左三足
        ctx.beginPath();
        ctx.moveTo(sx - 10, bodySy + i * 4);
        ctx.lineTo(sx - 15 - footW, bodySy + i * 5 + 4);
        ctx.lineTo(sx - 18 - footW, bodySy + i * 5 + 9);
        ctx.stroke();
        // 右三足
        ctx.beginPath();
        ctx.moveTo(sx + 10, bodySy + i * 4);
        ctx.lineTo(sx + 15 + footW, bodySy + i * 5 + 4);
        ctx.lineTo(sx + 18 + footW, bodySy + i * 5 + 9);
        ctx.stroke();
      }

      // 青青重甲圆盘主甲
      ctx.fillStyle = '#33d9b2';
      ctx.beginPath();
      ctx.roundRect(sx - 11, bodySy - 5, 22, 14, 6);
      ctx.fill();
      ctx.strokeStyle = '#218c74';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // 甲壳纹路
      ctx.fillStyle = '#218c74';
      ctx.fillRect(sx - 4, bodySy - 3, 8, 2);
      ctx.fillRect(sx - 2, bodySy + 2, 4, 2);

      // 竖立的两颗黑豆圆眼柄
      ctx.strokeStyle = '#33d9b2';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 4, bodySy - 5);
      ctx.lineTo(sx - 4, bodySy - 10);
      ctx.moveTo(sx + 4, bodySy - 5);
      ctx.lineTo(sx + 4, bodySy - 10);
      ctx.stroke();
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(sx - 4, bodySy - 10, 1.8, 0, Math.PI * 2);
      ctx.arc(sx + 4, bodySy - 10, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 两只高举挥击的威风大蟹钳
      // 左螯钳
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.ellipse(sx - 13, bodySy - 7 + clawPinch, 5, 3.5, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b33939';
      ctx.stroke();
      // 右螯钳
      ctx.fillStyle = '#ff5252';
      ctx.beginPath();
      ctx.ellipse(sx + 13, bodySy - 7 - clawPinch, 5, 3.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b33939';
      ctx.stroke();
      return;
    }

    // =========================================================================
    // M9. 巡海虾兵 / 龙宫御前虾尉 (朱红弯弓虾壳 · 头顶灵动长须 · 手执三叉分水钢叉)
    // =========================================================================
    if (type === 'shrimp') {
      const whiskerWave = Math.sin(this.animTimer * 0.2) * 4;

      // 朱红弯弓节状虾身
      ctx.fillStyle = '#ee5253';
      ctx.beginPath();
      ctx.roundRect(sx - 6, bodySy - 8, 12, 17, 4);
      ctx.fill();
      // 虾壳节纹
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 1;
      for (let y = -4; y <= 6; y += 3) {
        ctx.beginPath();
        ctx.moveTo(sx - 5, bodySy + y);
        ctx.lineTo(sx + 5, bodySy + y);
        ctx.stroke();
      }

      // 扇形虾尾
      ctx.fillStyle = '#ff3838';
      ctx.beginPath();
      ctx.moveTo(sx - 4, bodySy + 9);
      ctx.lineTo(sx - 8, bodySy + 16);
      ctx.lineTo(sx, bodySy + 13);
      ctx.lineTo(sx + 8, bodySy + 16);
      ctx.lineTo(sx + 4, bodySy + 9);
      ctx.closePath();
      ctx.fill();

      // 虾头与圆黑突眼
      ctx.fillStyle = '#ee5253';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 12, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.arc(sx - flip * 3, bodySy - 14, 1.8, 0, Math.PI * 2);
      ctx.arc(sx + flip * 3, bodySy - 14, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 头顶飘逸修长的双龙须
      ctx.strokeStyle = '#ffa801';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sx, bodySy - 16);
      ctx.quadraticCurveTo(sx - 8 + whiskerWave, bodySy - 26, sx - 14 + whiskerWave, bodySy - 22);
      ctx.moveTo(sx, bodySy - 16);
      ctx.quadraticCurveTo(sx + 8 - whiskerWave, bodySy - 26, sx + 14 - whiskerWave, bodySy - 22);
      ctx.stroke();

      // 手执三叉分水钢叉
      const forkSide = isLeft ? -11 : 11;
      ctx.strokeStyle = '#70a1ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + forkSide, bodySy - 22);
      ctx.lineTo(sx + forkSide, bodySy + 14);
      ctx.stroke();
      // 钢叉三锋
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sx + forkSide - 4, bodySy - 22);
      ctx.lineTo(sx + forkSide - 4, bodySy - 26);
      ctx.moveTo(sx + forkSide, bodySy - 22);
      ctx.lineTo(sx + forkSide, bodySy - 28);
      ctx.moveTo(sx + forkSide + 4, bodySy - 22);
      ctx.lineTo(sx + forkSide + 4, bodySy - 26);
      ctx.moveTo(sx + forkSide - 4, bodySy - 22);
      ctx.lineTo(sx + forkSide + 4, bodySy - 22);
      ctx.stroke();

      // 小虾足
      ctx.fillStyle = '#ff5e57';
      ctx.fillRect(sx - 4 + footOffset, bodySy + 8, 2.5, 6);
      ctx.fillRect(sx + 1.5 - footOffset, bodySy + 8, 2.5, 6);
      return;
    }

    // =========================================================================
    // M10. 黑风强盗 / 恶霸 (虬髯恶煞 · 单肩兽皮坎肩 · 镔铁九环大砍刀)
    // =========================================================================
    if (type === 'bandit') {
      // 强壮魁梧山匪躯体
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.roundRect(sx - 8, bodySy - 8, 16, 16, 3);
      ctx.fill();

      // 斜披单肩野豹皮坎肩
      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.moveTo(sx - 8, bodySy - 8);
      ctx.lineTo(sx + 8, bodySy);
      ctx.lineTo(sx + 8, bodySy + 8);
      ctx.lineTo(sx - 8, bodySy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 4, bodySy - 4, 2, 2);
      ctx.fillRect(sx + 2, bodySy + 1, 2, 2);

      // 虬髯凶横面目与红黑头巾
      ctx.fillStyle = '#f8c291';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();
      // 黑色短络腮胡
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 11, 4.5, 0, Math.PI);
      ctx.fill();
      // 头裹红黑头巾
      ctx.fillStyle = '#b71540';
      ctx.fillRect(sx - 6.5, bodySy - 20, 13, 3.5);

      // 手持雪亮镔铁九环大砍刀！
      const bladeSide = isLeft ? -12 : 12;
      ctx.strokeStyle = '#dfe4ea';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(sx + bladeSide, bodySy - 22);
      ctx.lineTo(sx + bladeSide, bodySy + 12);
      ctx.stroke();
      // 刀背金环碰撞
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx + bladeSide + (isLeft ? -3 : 3), bodySy - 16, 2, 0, Math.PI * 2);
      ctx.arc(sx + bladeSide + (isLeft ? -3 : 3), bodySy - 10, 2, 0, Math.PI * 2);
      ctx.arc(sx + bladeSide + (isLeft ? -3 : 3), bodySy - 4, 2, 0, Math.PI * 2);
      ctx.stroke();

      // 匪寇牛皮短靴
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 6 + footOffset, bodySy + 8, 4, 7);
      ctx.fillRect(sx + 2 - footOffset, bodySy + 8, 4, 7);
      return;
    }

    // =========================================================================
    // M11. 黑风熊精 / 熊统领 (山岳浓黑巨躯 · 胸前月牙白斑 · 厚重利爪熊掌)
    // =========================================================================
    if (type === 'bear') {
      // 如铁塔般的漆黑巨躯
      ctx.fillStyle = '#1e272e';
      ctx.beginPath();
      ctx.roundRect(sx - 12, bodySy - 9, 24, 18, 6);
      ctx.fill();

      // 胸前月牙白毛标志
      ctx.strokeStyle = '#f1f2f6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(sx, bodySy - 2, 6, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();

      // 雄浑熊首与圆熊耳
      ctx.fillStyle = '#2f3542';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 14, 8, 0, Math.PI * 2);
      ctx.fill();
      // 两只厚圆熊耳
      ctx.beginPath();
      ctx.arc(sx - 6, bodySy - 20, 3.5, 0, Math.PI * 2);
      ctx.arc(sx + 6, bodySy - 20, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // 灰白熊吻与黑圆鼻
      ctx.fillStyle = '#747d8c';
      ctx.beginPath();
      ctx.ellipse(sx, bodySy - 12, 4.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 13, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // 凶红小眼
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(sx - 3, bodySy - 16, 1.3, 0, Math.PI * 2);
      ctx.arc(sx + 3, bodySy - 16, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 沉重如柱熊足
      ctx.fillStyle = '#1e272e';
      ctx.fillRect(sx - 9 + footOffset, bodySy + 9, 6, 7);
      ctx.fillRect(sx + 3 - footOffset, bodySy + 9, 6, 7);
      return;
    }

    // =========================================================================
    // M12. 幽冥白骨兵 / 尸魔 / 阴风恶鬼 (惨白骷髅 · 眼窝跳跃幽绿冷火 · 骨刺)
    // =========================================================================
    if (type === 'skeleton') {
      const firePulse = Math.sin(this.animTimer * 0.25) * 1.5;

      // 骨骼肋排架
      ctx.strokeStyle = '#f1f2f6';
      ctx.lineWidth = 2.2;
      // 脊柱
      ctx.beginPath();
      ctx.moveTo(sx, bodySy - 8);
      ctx.lineTo(sx, bodySy + 8);
      ctx.stroke();
      // 肋骨三对
      ctx.lineWidth = 1.5;
      for (let r = -4; r <= 4; r += 4) {
        ctx.beginPath();
        ctx.moveTo(sx - 6, bodySy + r);
        ctx.lineTo(sx + 6, bodySy + r);
        ctx.stroke();
      }

      // 残破暗紫披肩
      ctx.fillStyle = '#3c2a4d';
      ctx.beginPath();
      ctx.moveTo(sx - 8, bodySy - 8);
      ctx.lineTo(sx + 8, bodySy - 8);
      ctx.lineTo(sx + 10, bodySy + 12);
      ctx.lineTo(sx - 10, bodySy + 12);
      ctx.closePath();
      ctx.fill();

      // 惨白骷髅头颅
      ctx.fillStyle = '#f8f9fa';
      ctx.beginPath();
      ctx.arc(sx, bodySy - 15, 6.5, 0, Math.PI * 2);
      ctx.fill();
      // 下颌骨
      ctx.fillRect(sx - 3.5, bodySy - 9.5, 7, 3);

      // 深陷眼窝中跳动的幽绿冷火魂焰！
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(sx - 2.5, bodySy - 15, 2, 0, Math.PI * 2);
      ctx.arc(sx + 2.5, bodySy - 15, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#00d2d3';
      ctx.beginPath();
      ctx.arc(sx - 2.5, bodySy - 15 + firePulse * 0.3, 1.3, 0, Math.PI * 2);
      ctx.arc(sx + 2.5, bodySy - 15 - firePulse * 0.3, 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 手握尖锐白骨刺
      const boneSide = isLeft ? -11 : 11;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(sx + boneSide, bodySy - 22);
      ctx.lineTo(sx + boneSide, bodySy + 10);
      ctx.stroke();

      // 骨节双足
      ctx.fillStyle = '#f1f2f6';
      ctx.fillRect(sx - 4 + footOffset, bodySy + 8, 2.5, 7);
      ctx.fillRect(sx + 1.5 - footOffset, bodySy + 8, 2.5, 7);
      return;
    }

    // =========================================================================
    // M13. 狂暴山猿 / 通用野兽怪 (长臂过膝 · 狂暴敏捷 · 纯正西游妖魔)
    // =========================================================================
    // 粗犷深褐妖躯
    ctx.fillStyle = '#5c4033';
    ctx.beginPath();
    ctx.roundRect(sx - 9, bodySy - 8, 18, 16, 4);
    ctx.fill();
    // 猿头
    ctx.fillStyle = '#4a3328';
    ctx.beginPath();
    ctx.arc(sx, bodySy - 14, 7, 0, Math.PI * 2);
    ctx.fill();
    // 金红狂暴双眼
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.arc(sx - 2.5, bodySy - 15, 1.6, 0, Math.PI * 2);
    ctx.arc(sx + 2.5, bodySy - 15, 1.6, 0, Math.PI * 2);
    ctx.fill();
    // 狂暴双足
    ctx.fillStyle = '#3a271e';
    ctx.fillRect(sx - 6 + footOffset, bodySy + 8, 4, 7);
    ctx.fillRect(sx + 2 - footOffset, bodySy + 8, 4, 7);
  }
}

window.Character = Character;
