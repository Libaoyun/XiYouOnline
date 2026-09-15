/**
 * 汉风西游 - 角色与NPC/怪物实体绘制系统 (Character)
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

    // 1. 脚底影子
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + this.height / 2 - 2, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. NPC 交互金色流光光环
    if (this.type === 'npc' && isPlayerNear) {
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffd700';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(screenX, screenY + this.height / 2 - 2, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // 3. 绘制身体形象
    this.drawBody(ctx, screenX, screenY);

    // 4. 头顶文字
    ctx.textAlign = 'center';
    if (this.questStatus === 'available') {
      ctx.fillStyle = '#ffde59';
      ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
      ctx.fillText('！', screenX, screenY - this.height / 2 - 14);
    }

    if (this.title) {
      ctx.font = '9px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = '#e6c88b';
      ctx.fillText(this.title, screenX, screenY - this.height / 2 - 6);
    }

    ctx.font = 'bold 11px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = this.type === 'player' ? '#f1c40f' : (this.type === 'monster' ? '#ff5252' : '#ffffff');
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 3;
    ctx.fillText(this.name, screenX, screenY - this.height / 2 + 5);

    ctx.restore();
  }

  drawBody(ctx, sx, sy) {
    const footOffset = this.isMoving ? (this.animFrame % 2 === 0 ? 3.5 : -3.5) : 0;

    // === 骑乘神驹状态 ===
    if (this.isRiding) {
      // 四蹄踏云微光
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(sx - 11, sy + 14, 5.5, 0, Math.PI * 2);
      ctx.arc(sx + 11, sy + 14, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // 马身躯干
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(sx - 13, sy + 2, 26, 11);
      ctx.strokeStyle = '#dcdde1';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 13, sy + 2, 26, 11);

      // 灵驹马头
      ctx.fillStyle = '#ffffff';
      const headX = this.direction === 'left' ? sx - 18 : (this.direction === 'right' ? sx + 13 : sx + 10);
      ctx.fillRect(headX, sy - 5, 9, 13);
      // 金马鬃
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(headX, sy - 7, 7, 3);

      // 金鞍
      ctx.fillStyle = '#e1b12c';
      ctx.fillRect(sx - 5, sy + 1, 10, 4);

      // 四蹄
      ctx.fillStyle = '#57606f';
      ctx.fillRect(sx - 10 + footOffset, sy + 13, 3, 7);
      ctx.fillRect(sx - 2 - footOffset, sy + 13, 3, 7);
      ctx.fillRect(sx + 4 + footOffset, sy + 13, 3, 7);
      ctx.fillRect(sx + 8 - footOffset, sy + 13, 3, 7);

      sy -= 7;
    }

    // === 天将形态 (金甲威灵大将军) ===
    if (this.appearance === 'heaven_general') {
      // 鲜红战袍披风
      ctx.fillStyle = '#c0392b';
      const capeSway = this.isMoving ? (this.direction === 'left' ? 4 : -4) : 0;
      ctx.fillRect(sx - 10 + capeSway, sy - 9, 20, 18);

      // 金鳞锁子战甲
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 8, sy - 11, 16, 16);
      ctx.strokeStyle = '#b88628';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx - 8, sy - 11, 16, 16);

      // 金翅天将神盔
      ctx.fillStyle = '#f39c12';
      ctx.beginPath();
      ctx.arc(sx, sy - 16, 7.5, 0, Math.PI * 2);
      ctx.fill();
      // 红缨
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(sx - 1, sy - 25, 3, 6);

      // 金色护膝战靴
      ctx.fillStyle = '#b88628';
      ctx.fillRect(sx - 6 + footOffset, sy + 5, 4, 8);
      ctx.fillRect(sx + 2 - footOffset, sy + 5, 4, 8);

      // 威灵神枪 (枪缨红绫与银芒枪尖)
      ctx.strokeStyle = '#dcdde1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx + 9, sy - 22);
      ctx.lineTo(sx + 9, sy + 10);
      ctx.stroke();
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(sx + 8, sy - 13, 3, 4);
    }
    // === 凡间行者形态 (刘家村苏醒) ===
    else if (this.appearance === 'mortal_wanderer') {
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(sx - 7, sy - 9, 14, 15);

      ctx.fillStyle = '#f5cd79';
      ctx.beginPath();
      ctx.arc(sx, sy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#34495e';
      ctx.fillRect(sx - 6, sy - 19, 12, 4);

      ctx.fillStyle = '#7f8c8d';
      ctx.fillRect(sx - 5 + footOffset, sy + 6, 3, 7);
      ctx.fillRect(sx + 2 - footOffset, sy + 6, 3, 7);
    }
    // === 孙悟空齐天大圣 ===
    else if (this.appearance === 'sun_wukong') {
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 8, sy - 9, 16, 13);
      ctx.fillStyle = '#e67e22'; // 虎皮裙
      ctx.fillRect(sx - 8, sy + 4, 16, 5);

      ctx.fillStyle = '#d35400';
      ctx.beginPath();
      ctx.arc(sx, sy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();

      // 凤翅紫金冠两道翎羽
      ctx.strokeStyle = '#9b59b6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx - 2, sy - 19);
      ctx.quadraticCurveTo(sx - 12, sy - 30, sx - 18, sy - 22);
      ctx.moveTo(sx + 2, sy - 19);
      ctx.quadraticCurveTo(sx + 12, sy - 30, sx + 18, sy - 22);
      ctx.stroke();

      // 如意金箍棒
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(sx + 10, sy - 20);
      ctx.lineTo(sx + 10, sy + 13);
      ctx.stroke();
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx + 9, sy - 20, 3, 4);
      ctx.fillRect(sx + 9, sy + 9, 3, 4);
    }
    // === 猎户刘伯钦 ===
    else if (this.appearance === 'liu_boqin') {
      ctx.fillStyle = '#8b5a2b';
      ctx.fillRect(sx - 8, sy - 9, 16, 15);
      ctx.fillStyle = '#d2b48c';
      ctx.beginPath();
      ctx.arc(sx, sy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#4a2f13';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx - 7, sy - 4, 9, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
    }
    // === 玄奘高僧 / 菩萨 ===
    else if (this.appearance === 'tang_seng') {
      ctx.fillStyle = '#b71540';
      ctx.fillRect(sx - 8, sy - 9, 16, 17);
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(sx - 3, sy - 9, 6, 17);

      ctx.fillStyle = '#f8c291';
      ctx.beginPath();
      ctx.arc(sx, sy - 14, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e55039';
      ctx.fillRect(sx - 7, sy - 20, 14, 5);

      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx + 9, sy - 22);
      ctx.lineTo(sx + 9, sy + 12);
      ctx.stroke();
      ctx.strokeRect(sx + 7, sy - 24, 5, 5);
    }
    // === 怪物猛兽 ===
    else {
      ctx.fillStyle = '#57606f';
      ctx.fillRect(sx - 9, sy - 7, 18, 14);
      ctx.fillStyle = '#ff4757';
      ctx.beginPath();
      ctx.arc(sx + 4, sy - 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default Character;
