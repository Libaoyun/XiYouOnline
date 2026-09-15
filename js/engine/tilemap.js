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

      // === 7. 凡间·山涧清溪与瑶池水域 (阻挡) ===
      case 'water': {
        const wave = Math.sin(this.waterAnimTime + screenX * 0.05 + screenY * 0.05);
        const g = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        g.addColorStop(0, '#1b5276');
        g.addColorStop(1, '#154360');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 动态水波高光
        ctx.strokeStyle = `rgba(133, 193, 233, ${0.4 + wave * 0.25})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY + 12 + wave * 2);
        ctx.quadraticCurveTo(screenX + 16, screenY + 8 + wave * 2, screenX + 28, screenY + 12 + wave * 2);
        ctx.moveTo(screenX + 8, screenY + 22 - wave * 2);
        ctx.quadraticCurveTo(screenX + 20, screenY + 18 - wave * 2, screenX + 30, screenY + 22 - wave * 2);
        ctx.stroke();
        break;
      }

      // === 8. 大唐·长安青石御道 ===
      case 'changan_stone': {
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(screenX, screenY, s, s);

        // 细密石阶缝隙
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX, screenY, s, s);

        // 石砖高光阴影边缘
        ctx.fillStyle = '#718096';
        ctx.fillRect(screenX + 1, screenY + 1, s - 2, 2);
        ctx.fillStyle = '#1a202c';
        ctx.fillRect(screenX + 1, screenY + s - 2, s - 2, 2);
        break;
      }

      // === 9. 大唐·巍峨城墙与化生寺围墙 (阻挡) ===
      case 'city_wall': {
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(screenX, screenY, s, s);

        // 砖线交错
        ctx.strokeStyle = '#1a202c';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 10); ctx.lineTo(screenX + s, screenY + 10);
        ctx.moveTo(screenX, screenY + 21); ctx.lineTo(screenX + s, screenY + 21);
        ctx.moveTo(screenX + 16, screenY); ctx.lineTo(screenX + 16, screenY + 10);
        ctx.moveTo(screenX + 8, screenY + 10); ctx.lineTo(screenX + 8, screenY + 21);
        ctx.moveTo(screenX + 24, screenY + 10); ctx.lineTo(screenX + 24, screenY + 21);
        ctx.stroke();

        // 墙顶垛口
        ctx.fillStyle = '#718096';
        ctx.fillRect(screenX + 2, screenY, 8, 3);
        ctx.fillRect(screenX + 18, screenY, 8, 3);
        break;
      }

      // === 10. 刘家村·猎户茅屋草墙 (阻挡) ===
      case 'hut_wall': {
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(screenX, screenY, s, s);

        // 茅草屋顶横纹
        ctx.fillStyle = '#c59b27';
        for (let i = 2; i < s; i += 5) {
          ctx.fillRect(screenX + 2, screenY + i, s - 4, 2);
        }
        break;
      }

      // === 11. 五行山·巍峨五指岩壁 (阻挡) ===
      case 'mountain_rock': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#4a4e54');
        g.addColorStop(0.5, '#2f353b');
        g.addColorStop(1, '#1e2328');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 嶙峋岩角
        ctx.strokeStyle = '#636e72';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 2, screenY + 12);
        ctx.lineTo(screenX + 14, screenY + 4);
        ctx.lineTo(screenX + 26, screenY + 18);
        ctx.lineTo(screenX + s - 2, screenY + 8);
        ctx.stroke();

        // 岩壁青苔暗斑
        ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
        ctx.beginPath();
        ctx.arc(screenX + 8, screenY + 24, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 12. 五行山顶·六字大明咒真言佛帖 (解封目标) ===
      case 'wuxing_seal': {
        // 山石底
        ctx.fillStyle = '#2f353b';
        ctx.fillRect(screenX, screenY, s, s);

        // 佛光轮盘光晕
        const pulse = Math.sin(this.waterAnimTime * 2);
        const radius = 11 + pulse * 2.5;

        const halo = ctx.createRadialGradient(
          screenX + s / 2, screenY + s / 2, 2,
          screenX + s / 2, screenY + s / 2, radius + 8
        );
        halo.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
        halo.addColorStop(0.4, 'rgba(243, 156, 18, 0.6)');
        halo.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s / 2, radius + 8, 0, Math.PI * 2);
        ctx.fill();

        // 金黄宣纸佛帖本体
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX + 9, screenY + 5, 14, 22);
        ctx.strokeStyle = '#b88628';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 9, screenY + 5, 14, 22);

        // 朱砂真言“唵”
        ctx.fillStyle = '#c0392b';
        ctx.font = 'bold 11px "KaiTi", "SimSun", serif';
        ctx.textAlign = 'center';
        ctx.fillText('唵', screenX + s / 2, screenY + 18);
        break;
      }

      // === 13. 黄风岭·流沙河·漫漫黄沙大地 ===
      case 'yellow_sand': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#d4ac0d');
        g.addColorStop(0.6, '#b7950b');
        g.addColorStop(1, '#9a7d0a');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 风蚀波纹
        ctx.strokeStyle = 'rgba(254, 249, 231, 0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 2, screenY + 8);
        ctx.quadraticCurveTo(screenX + 16, screenY + 14, screenX + s - 2, screenY + 8);
        ctx.moveTo(screenX + 6, screenY + 22);
        ctx.quadraticCurveTo(screenX + 20, screenY + 26, screenX + s, screenY + 20);
        ctx.stroke();

        // 粗粝细沙粒
        ctx.fillStyle = 'rgba(125, 102, 8, 0.4)';
        ctx.fillRect(screenX + 8, screenY + 4, 2, 2);
        ctx.fillRect(screenX + 22, screenY + 16, 2, 2);
        ctx.fillRect(screenX + 14, screenY + 25, 2, 2);
        break;
      }

      // === 14. 鹰愁涧寒潭·八百里流沙河滔滔浊浪 (阻挡) ===
      case 'dark_water': {
        const wave = Math.sin(this.waterAnimTime * 1.5 + screenX * 0.08 + screenY * 0.08);
        const g = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        g.addColorStop(0, '#0e2433');
        g.addColorStop(1, '#061118');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 汹涌深潭漩涡暗流
        ctx.strokeStyle = `rgba(74, 144, 226, ${0.4 + wave * 0.3})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 10 + wave * 3);
        ctx.bezierCurveTo(screenX + 10, screenY + 5 + wave * 3, screenX + 22, screenY + 16 - wave * 3, screenX + s, screenY + 10 + wave * 3);
        ctx.moveTo(screenX + 4, screenY + 24 - wave * 2);
        ctx.quadraticCurveTo(screenX + 18, screenY + 18 - wave * 2, screenX + 28, screenY + 24 - wave * 2);
        ctx.stroke();
        break;
      }

      // === 15. 高老庄·宝象国·庄园宫殿青玉石阶 ===
      case 'manor_floor': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#3e2723');
        g.addColorStop(0.5, '#4e342e');
        g.addColorStop(1, '#2e1c18');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 铺地方砖金丝压边
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 1, screenY + 1, s - 2, s - 2);

        // 祥纹方格
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(screenX + s / 4, screenY + s / 4, s / 2, s / 2);
        break;
      }

      // === 16. 云栈洞·波月洞·白骨洞·幽暗溶洞钟乳石壁 (阻挡) ===
      case 'demon_cave_wall': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#1c1917');
        g.addColorStop(0.6, '#0f0e0d');
        g.addColorStop(1, '#050505');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 钟乳石凌厉倒挂
        ctx.fillStyle = '#44403c';
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY);
        ctx.lineTo(screenX + 10, screenY + 18);
        ctx.lineTo(screenX + 16, screenY);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(screenX + 16, screenY + s);
        ctx.lineTo(screenX + 22, screenY + s - 14);
        ctx.lineTo(screenX + 28, screenY + s);
        ctx.fill();

        // 幽魂紫气磷火微光
        if ((screenX + screenY) % 9 === 0) {
          ctx.fillStyle = 'rgba(168, 85, 247, 0.6)';
          ctx.beginPath();
          ctx.arc(screenX + 16, screenY + 16, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // === 17. 万寿山五庄观·草还丹人参果仙树 (阻挡) ===
      case 'ginseng_tree': {
        // 先铺草地底
        ctx.fillStyle = '#24481f';
        ctx.fillRect(screenX, screenY, s, s);

        // 苍劲老树古根
        ctx.fillStyle = '#451a03';
        ctx.fillRect(screenX + 10, screenY + 8, 12, s - 8);

        // 灵冠翠叶
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + 12, 14, 0, Math.PI * 2);
        ctx.fill();

        // 人参果灵光小娃娃轮廓
        const glow = Math.sin(this.waterAnimTime * 2);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(screenX + 10, screenY + 10 + glow, 3, 0, Math.PI * 2);
        ctx.arc(screenX + 22, screenY + 14 - glow, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 18. 南海珞珈山·紫竹林仙境 (阻挡) ===
      case 'purple_bamboo': {
        ctx.fillStyle = '#1e3a24';
        ctx.fillRect(screenX, screenY, s, s);

        // 紫竹竿
        ctx.fillStyle = '#7e22ce';
        ctx.fillRect(screenX + 6, screenY, 5, s);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(screenX + 8, screenY, 2, s); // 高光

        ctx.fillStyle = '#581c87';
        ctx.fillRect(screenX + 18, screenY, 6, s);

        // 竹节
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(screenX + 5, screenY + 10, 7, 2);
        ctx.fillRect(screenX + 17, screenY + 18, 8, 2);

        // 紫意青翠竹叶
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.ellipse(screenX + 14, screenY + 6, 7, 2.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      default:
        ctx.fillStyle = '#333333';
        ctx.fillRect(screenX, screenY, s, s);
        break;
    }
  }

  // 判断瓦片是否可行走 (阻挡判定)
  isWalkable(mapData, tileCol, tileRow) {
    if (tileCol < 0 || tileCol >= mapData.width || tileRow < 0 || tileRow >= mapData.height) {
      return false;
    }
    const tileType = mapData.tiles[tileRow][tileCol];
    const solidTiles = [
      'cloud_void',
      'heaven_pillar',
      'bamboo',
      'water',
      'dark_water',
      'city_wall',
      'hut_wall',
      'mountain_rock',
      'demon_cave_wall',
      'ginseng_tree',
      'purple_bamboo'
    ];
    return !solidTiles.includes(tileType);
  }

  // 渲染整屏可见区域
  render(ctx, mapData, camera) {
    this.updateAnimation();

    const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endCol = Math.min(mapData.width - 1, Math.ceil((camera.x + camera.viewportWidth) / this.tileSize));
    const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endRow = Math.min(mapData.height - 1, Math.ceil((camera.y + camera.viewportHeight) / this.tileSize));

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileType = mapData.tiles[r][c];
        const screenX = c * this.tileSize - camera.x;
        const screenY = r * this.tileSize - camera.y;
        this.drawTile(ctx, tileType, screenX, screenY);
      }
    }
  }
}

window.TilemapEngine = TilemapEngine;
