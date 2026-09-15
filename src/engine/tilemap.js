/**
 * 汉风西游 - 次世代国风 2D 瓦片地貌渲染器 (TilemapEngine 2.0)
 * 拒绝简陋单色填充！精雕细琢高品质纹理、光影明暗与西游古典建筑
 */

class TilemapEngine {
  constructor(tileSize = 32) {
    this.tileSize = tileSize;
    this.waterAnimTime = 0;
  }

  // 更新水流与法阵动画时间戳
  updateAnimation() {
    this.waterAnimTime += 0.03;
  }

  // 绘制高级瓦片地块
  drawTile(ctx, tileType, screenX, screenY) {
    const s = this.tileSize;

    switch (tileType) {
      // === 1. 天宫·汉白玉金纹仙砖 ===
      case 'heaven_floor': {
        // 大理石微渐变底
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#f8fafc');
        g.addColorStop(0.5, '#edf2f7');
        g.addColorStop(1, '#e2e8f0');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 金色浮雕回纹细框
        ctx.strokeStyle = 'rgba(212, 160, 23, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 2, screenY + 2, s - 4, s - 4);

        // 中央祥云金花暗纹
        ctx.fillStyle = 'rgba(241, 196, 15, 0.55)';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 2. 天宫·浩瀚云海深渊 (阻挡) ===
      case 'cloud_void': {
        // 深邃天宫星空底色
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(screenX, screenY, s, s);
        // 浮云层叠
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(screenX + s * 0.4, screenY + s * 0.5, s * 0.45, 0, Math.PI * 2);
        ctx.arc(screenX + s * 0.7, screenY + s * 0.6, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 3. 天宫·盘龙蟠龙金柱 (阻挡) ===
      case 'heaven_pillar': {
        // 先铺地砖底
        ctx.fillStyle = '#edf2f7';
        ctx.fillRect(screenX, screenY, s, s);

        // 柱身投影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(screenX + 5, screenY + s - 6, s - 10, 6);

        // 朱红神木柱心
        ctx.fillStyle = '#8b2500';
        ctx.fillRect(screenX + 6, screenY, s - 12, s);

        // 金色浮雕蟠龙金鳞
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(screenX + 8, screenY + 4, s - 16, 4);
        ctx.fillRect(screenX + 8, screenY + 14, s - 16, 4);
        ctx.fillRect(screenX + 8, screenY + 24, s - 16, 4);

        // 柱础与柱顶金饰
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX + 4, screenY, s - 8, 3);
        ctx.fillRect(screenX + 4, screenY + s - 4, s - 8, 4);
        break;
      }

      // === 4. 凡间·葱郁仙林草地 ===
      case 'grass': {
        // 渐变翠绿草坪
        const g = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        g.addColorStop(0, '#2d5a27');
        g.addColorStop(1, '#24481f');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 细密草尖立体高光
        ctx.fillStyle = '#3e7b35';
        ctx.fillRect(screenX + 5, screenY + 6, 2, 6);
        ctx.fillRect(screenX + 7, screenY + 8, 2, 4);
        ctx.fillRect(screenX + 18, screenY + 16, 2, 7);
        ctx.fillRect(screenX + 24, screenY + 8, 2, 5);

        // 点缀白色仙芝小花
        if ((screenX + screenY) % 7 === 0) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(screenX + 14, screenY + 22, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(screenX + 13.5, screenY + 21.5, 1, 1);
        }
        break;
      }

      // === 5. 凡间·青石古道泥土小径 ===
      case 'dirt_path': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#6b4f35');
        g.addColorStop(1, '#573f2a');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 泥石肌理
        ctx.fillStyle = '#453221';
        ctx.fillRect(screenX + 6, screenY + 8, 4, 3);
        ctx.fillRect(screenX + 20, screenY + 20, 5, 3);
        ctx.fillRect(screenX + 14, screenY + 12, 3, 2);

        // 细微小石子
        ctx.fillStyle = '#87694d';
        ctx.fillRect(screenX + 10, screenY + 18, 2, 2);
        ctx.fillRect(screenX + 22, screenY + 6, 2, 2);
        break;
      }

      // === 6. 凡间·青翠叠翠修竹 (阻挡) ===
      case 'bamboo': {
        // 草地底
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(screenX, screenY, s, s);

        // 前后两根立体修竹
        ctx.fillStyle = '#1e824c';
        ctx.fillRect(screenX + 8, screenY, 6, s);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(screenX + 9, screenY, 2, s); // 竹竿高光

        // 竹节
        ctx.fillStyle = '#145a32';
        ctx.fillRect(screenX + 7, screenY + 8, 8, 2);
        ctx.fillRect(screenX + 7, screenY + 20, 8, 2);

        // 竹叶侧披
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.ellipse(screenX + 18, screenY + 10, 8, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(screenX + 4, screenY + 18, 7, 2.5, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 7. 凡间·猎户茅屋木墙 (阻挡) ===
      case 'hut_wall': {
        ctx.fillStyle = '#533824';
        ctx.fillRect(screenX, screenY, s, s);

        // 原木条纹
        ctx.fillStyle = '#3d2919';
        ctx.fillRect(screenX + 2, screenY + 3, s - 4, 6);
        ctx.fillRect(screenX + 2, screenY + 11, s - 4, 6);
        ctx.fillRect(screenX + 2, screenY + 19, s - 4, 6);

        // 茅草屋檐覆顶
        ctx.fillStyle = '#a08050';
        ctx.fillRect(screenX, screenY, s, 4);
        break;
      }

      // === 8. 瑶池仙泉与山溪涧水 (阻挡) ===
      case 'water': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        g.addColorStop(0, '#1a5276');
        g.addColorStop(1, '#2980b9');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 动态反光波纹
        const offset = Math.sin(this.waterAnimTime + screenX * 0.1) * 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(screenX + 4 + offset, screenY + 8, 14, 2);
        ctx.fillRect(screenX + 12 - offset, screenY + 20, 16, 2);
        break;
      }

      // === 9. 大唐长安·青石御街 ===
      case 'changan_stone': {
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(screenX, screenY, s, s);
        // 青石砖缝
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, s, s);

        // 砖面斑驳质感
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(screenX + 4, screenY + 4, s - 8, s / 2 - 4);
        break;
      }

      // === 10. 长安·朱雀皇城红墙与琉璃金瓦 (阻挡) ===
      case 'city_wall': {
        // 朱红城砖
        ctx.fillStyle = '#962d22';
        ctx.fillRect(screenX, screenY + 6, s, s - 6);
        // 砖缝
        ctx.strokeStyle = '#641e16';
        ctx.strokeRect(screenX, screenY + 6, s, s - 6);

        // 琉璃金瓦飞檐
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(screenX - 2, screenY, s + 4, 6);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX - 1, screenY + 1, s + 2, 2);
        break;
      }

      // === 11. 两界山·五行山峻岭断崖 (阻挡) ===
      case 'mountain_rock': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#4b4b4b');
        g.addColorStop(1, '#2d3436');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 层叠险峻岩峰
        ctx.fillStyle = '#636e72';
        ctx.beginPath();
        ctx.moveTo(screenX + 2, screenY + s - 2);
        ctx.lineTo(screenX + s / 2, screenY + 4);
        ctx.lineTo(screenX + s - 2, screenY + s - 2);
        ctx.fill();

        // 岩壁风化青苔
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(screenX + 6, screenY + s - 6, 8, 3);
        break;
      }

      // === 12. 佛祖六字大明咒圣金压帖 ===
      case 'wuxing_seal': {
        // 八卦金莲法台
        ctx.fillStyle = '#2c1e11';
        ctx.fillRect(screenX, screenY, s, s);

        // 旋转金光法阵光环
        ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s / 2, s * 0.4, 0, Math.PI * 2);
        ctx.stroke();

        // 金色佛门梵字“唵”
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 18px "Microsoft YaHei", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 8;
        ctx.fillText('唵', screenX + s / 2, screenY + s / 2);
        ctx.shadowBlur = 0;
        break;
      }

      default:
        ctx.fillStyle = '#111';
        ctx.fillRect(screenX, screenY, s, s);
        break;
    }
  }

  // 渲染整张地图
  render(ctx, mapData, camera) {
    this.updateAnimation();

    const s = this.tileSize;
    const startCol = Math.max(0, Math.floor(camera.x / s));
    const endCol = Math.min(mapData.width - 1, Math.floor((camera.x + camera.viewportWidth) / s));
    const startRow = Math.max(0, Math.floor(camera.y / s));
    const endRow = Math.min(mapData.height - 1, Math.floor((camera.y + camera.viewportHeight) / s));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileType = mapData.tiles[r][c];
        const screenX = c * s - camera.x;
        const screenY = r * s - camera.y;
        this.drawTile(ctx, tileType, screenX, screenY);
      }
    }
  }

  // 碰撞检测
  isWalkable(mapData, tileX, tileY) {
    if (tileX < 0 || tileX >= mapData.width || tileY < 0 || tileY >= mapData.height) {
      return false;
    }
    const tile = mapData.tiles[tileY][tileX];
    const solidTiles = [
      'cloud_void', 'heaven_pillar', 'bamboo', 'hut_wall',
      'water', 'city_wall', 'mountain_rock'
    ];
    return !solidTiles.includes(tile);
  }
}

export default TilemapEngine;
