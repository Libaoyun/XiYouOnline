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
    const footOffset = this.isMoving ? (this.animFrame % 2 === 0 ? 3.5 : -3.5) : 0;
    // 待机呼吸微动与披风律动
    const breatheY = Math.sin(this.animTimer * 0.09) * 1.3;
    const bodySy = sy + (this.isMoving ? 0 : breatheY);

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
}

window.Character = Character;
