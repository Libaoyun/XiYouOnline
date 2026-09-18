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

  // 绘制高级瓦片地块 (支持自然环境算法与古建筑上下文自适应)
  drawTile(ctx, tileType, screenX, screenY, col = 0, row = 0, mapData = null) {
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
        ctx.fillStyle = '#0a0d14';
        ctx.fillRect(screenX, screenY, s, s);
        // 浮动云雾
        const cloudShift = Math.sin(this.waterAnimTime * 0.4 + col) * 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(screenX + s * 0.4 + cloudShift, screenY + s * 0.5, s * 0.45, 0, Math.PI * 2);
        ctx.arc(screenX + s * 0.7 - cloudShift, screenY + s * 0.6, s * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 3. 天宫·盘龙蟠龙金柱 (阻挡) ===
      case 'heaven_pillar': {
        ctx.fillStyle = '#edf2f7';
        ctx.fillRect(screenX, screenY, s, s);
        // 柱身投影
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(screenX + 5, screenY + s - 6, s - 10, 6);
        // 朱红神木柱心
        ctx.fillStyle = '#8b2500';
        ctx.fillRect(screenX + 6, screenY, s - 12, s);
        // 金色蟠龙浮雕
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

      // === 4. 凡间·葱郁仙林草地 (拒绝机械点阵，水墨层叠韵味与微风草浪) ===
      case 'grass': {
        // 多频自然绿意渐变 (基于网格哈希打散 32x32 机械方块边界)
        const toneIndex = (col * 13 + row * 19) % 3;
        const baseColors = [
          ['#295324', '#20431c'],
          ['#254b20', '#1c3917'],
          ['#2d5b28', '#23471f']
        ][toneIndex];

        const g = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        g.addColorStop(0, baseColors[0]);
        g.addColorStop(1, baseColors[1]);
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 柔和微风摇曳草叶 (随时间缓慢起伏，不再是机械死板的竖线)
        const windSway = Math.sin(this.waterAnimTime * 0.6 + col * 0.4 + row * 0.2) * 2;
        const grassRand = (col * 29 + row * 43) % 4;

        ctx.strokeStyle = '#3d7834';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        if (grassRand === 0) {
          ctx.moveTo(screenX + 8, screenY + 12);
          ctx.quadraticCurveTo(screenX + 9 + windSway, screenY + 7, screenX + 7 + windSway * 1.3, screenY + 4);
          ctx.moveTo(screenX + 11, screenY + 13);
          ctx.quadraticCurveTo(screenX + 13 + windSway, screenY + 9, screenX + 14 + windSway * 1.2, screenY + 6);
        } else if (grassRand === 1) {
          ctx.moveTo(screenX + 20, screenY + 22);
          ctx.quadraticCurveTo(screenX + 22 + windSway, screenY + 16, screenX + 24 + windSway * 1.2, screenY + 13);
          ctx.moveTo(screenX + 17, screenY + 23);
          ctx.quadraticCurveTo(screenX + 17 + windSway, screenY + 18, screenX + 16 + windSway * 1.3, screenY + 15);
        } else if (grassRand === 2) {
          ctx.moveTo(screenX + 14, screenY + 26);
          ctx.quadraticCurveTo(screenX + 15 + windSway, screenY + 20, screenX + 17 + windSway * 1.2, screenY + 17);
        }
        ctx.stroke();

        // 随机撒落点缀山野白玉仙草花 (5瓣小花与淡金花蕊)
        if ((col * 31 + row * 17) % 7 === 0) {
          const fx = screenX + ((col * 19) % 18) + 7;
          const fy = screenY + ((row * 23) % 18) + 7;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fx - 1.5, fy, 1.2, 0, Math.PI * 2);
          ctx.arc(fx + 1.5, fy, 1.2, 0, Math.PI * 2);
          ctx.arc(fx, fy - 1.5, 1.2, 0, Math.PI * 2);
          ctx.arc(fx, fy + 1.5, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffd700';
          ctx.beginPath();
          ctx.arc(fx, fy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // === 5. 凡间·青石古道泥土小径 (细腻泥土肌理与凹凸鹅卵石) ===
      case 'dirt_path': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#664d36');
        g.addColorStop(1, '#503c2a');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 细碎石子与泥道颗粒 (带光泽高光与微阴影)
        const seed = (col * 37 + row * 51) % 5;
        ctx.fillStyle = '#7a6047';
        ctx.beginPath();
        if (seed === 0) {
          ctx.ellipse(screenX + 10, screenY + 12, 3.5, 2.5, 0.3, 0, Math.PI * 2);
          ctx.ellipse(screenX + 22, screenY + 22, 2.5, 2, -0.4, 0, Math.PI * 2);
        } else if (seed === 1) {
          ctx.ellipse(screenX + 16, screenY + 16, 4, 2.8, -0.2, 0, Math.PI * 2);
          ctx.ellipse(screenX + 8, screenY + 24, 2.5, 1.8, 0.5, 0, Math.PI * 2);
        } else if (seed === 2) {
          ctx.ellipse(screenX + 24, screenY + 8, 3, 2.2, 0.4, 0, Math.PI * 2);
          ctx.ellipse(screenX + 12, screenY + 20, 2.8, 2.2, -0.3, 0, Math.PI * 2);
        }
        ctx.fill();

        // 碎石微受光白点
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        if (seed === 0) {
          ctx.fillRect(screenX + 9, screenY + 11, 1.5, 1.2);
          ctx.fillRect(screenX + 21, screenY + 21, 1.2, 1);
        } else if (seed === 1) {
          ctx.fillRect(screenX + 15, screenY + 15, 1.5, 1.2);
        }
        break;
      }

      // === 5.1 海滨·金黄细腻沙滩 (微风沙浪纹理、散落海星与白玉扇贝，潮汐交界浪花沫) ===
      case 'beach_sand': {
        // 暖金细腻沙质渐变
        const sandGrad = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        sandGrad.addColorStop(0, '#e5cca0');
        sandGrad.addColorStop(0.5, '#d6b885');
        sandGrad.addColorStop(1, '#c5a36e');
        ctx.fillStyle = sandGrad;
        ctx.fillRect(screenX, screenY, s, s);

        // 微风吹拂的横向沙纹 (起伏微曲线)
        const sandWave = Math.sin(col * 0.8 + row * 0.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 2, screenY + 9 + sandWave * 2);
        ctx.quadraticCurveTo(screenX + 16, screenY + 13 - sandWave * 2, screenX + s - 2, screenY + 9 + sandWave * 2);
        ctx.moveTo(screenX + 5, screenY + 21 - sandWave * 2);
        ctx.quadraticCurveTo(screenX + 18, screenY + 24 + sandWave * 2, screenX + s - 4, screenY + 21 - sandWave * 2);
        ctx.stroke();

        // 细腻深色湿沙暗纹
        ctx.strokeStyle = 'rgba(140, 105, 55, 0.22)';
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY + 15);
        ctx.lineTo(screenX + s - 6, screenY + 15);
        ctx.stroke();

        // 随机散落海滨物产：珊瑚红海星 / 白玉海贝 / 金黄卵石
        const beachSeed = (col * 29 + row * 43) % 9;
        if (beachSeed === 0) {
          // 珊瑚粉红五角海星
          const starX = screenX + 16;
          const starY = screenY + 16;
          ctx.fillStyle = '#f87171';
          ctx.beginPath();
          for (let sp = 0; sp < 5; sp++) {
            const ang = (sp * Math.PI * 2) / 5 - Math.PI / 2;
            const px = starX + Math.cos(ang) * 4.5;
            const py = starY + Math.sin(ang) * 4.5;
            if (sp === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
            const inAng = ang + Math.PI / 5;
            ctx.lineTo(starX + Math.cos(inAng) * 2, starY + Math.sin(inAng) * 2);
          }
          ctx.closePath();
          ctx.fill();
        } else if (beachSeed === 1) {
          // 白玉小扇贝 (弧形贝壳带纵纹)
          const bx = screenX + 18;
          const by = screenY + 12;
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(bx, by, 3.5, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        } else if (beachSeed === 2) {
          // 浅黄色小海贝
          const bx = screenX + 10;
          const by = screenY + 22;
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.ellipse(bx, by, 3, 2, 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // 如果右侧紧邻海水 (water/dark_water)：绘制随时间涨落拍岸的白色潮汐浪花泡沫线！
        if (mapData && col < mapData.width - 1 && (mapData.tiles[row][col + 1] === 'water' || mapData.tiles[row][col + 1] === 'dark_water')) {
          const tide = Math.sin(this.waterAnimTime * 2 + row * 0.6) * 3;
          const foamAlpha = 0.65 + Math.sin(this.waterAnimTime * 2.5) * 0.25;
          ctx.fillStyle = `rgba(255, 255, 255, ${foamAlpha})`;
          ctx.beginPath();
          ctx.ellipse(screenX + s - 2 + tide, screenY + s / 2, 3.5, s / 2, 0, 0, Math.PI * 2);
          ctx.fill();
          // 细碎水珠
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillRect(screenX + s - 5 + tide, screenY + 6, 1.5, 1.5);
          ctx.fillRect(screenX + s - 6 + tide, screenY + 20, 1.5, 1.5);
        }
        break;
      }

      // === 6. 凡间·青翠叠翠修竹 (阻挡) ===
      case 'bamboo': {
        // 草地底衬
        ctx.fillStyle = '#254b20';
        ctx.fillRect(screenX, screenY, s, s);

        // 粗细错落两根修竹
        ctx.fillStyle = '#1b7a42';
        ctx.fillRect(screenX + 7, screenY, 6, s);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(screenX + 8.5, screenY, 2, s); // 竹竿立体圆柱受光高光

        ctx.fillStyle = '#145a32';
        ctx.fillRect(screenX + 18, screenY, 5, s);
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(screenX + 19, screenY, 1.5, s);

        // 深色立体竹节
        ctx.fillStyle = '#0e4424';
        ctx.fillRect(screenX + 6, screenY + 9, 8, 2);
        ctx.fillRect(screenX + 6, screenY + 22, 8, 2);
        ctx.fillRect(screenX + 17, screenY + 14, 7, 2);

        // 随风拂动的青翠竹叶
        ctx.fillStyle = '#2ecc71';
        ctx.beginPath();
        ctx.ellipse(screenX + 18, screenY + 8, 8, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(screenX + 5, screenY + 17, 7, 2.5, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 7. 凡间·山涧清溪与瑶池水域 (阻挡，复合水波与波光荡漾) ===
      case 'water': {
        const wave1 = Math.sin(this.waterAnimTime + screenX * 0.06 + screenY * 0.05);
        const wave2 = Math.cos(this.waterAnimTime * 0.7 + screenX * 0.04 - screenY * 0.06);

        const g = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        g.addColorStop(0, '#164866');
        g.addColorStop(1, '#0e3147');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 双层动态水波高光
        ctx.strokeStyle = `rgba(164, 219, 255, ${0.45 + wave1 * 0.2})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenX + 2, screenY + 10 + wave1 * 2);
        ctx.quadraticCurveTo(screenX + 16, screenY + 7 + wave2 * 2, screenX + 30, screenY + 11 + wave1 * 2);
        ctx.stroke();

        ctx.strokeStyle = `rgba(133, 193, 233, ${0.35 + wave2 * 0.2})`;
        ctx.beginPath();
        ctx.moveTo(screenX + 6, screenY + 22 + wave2 * 2);
        ctx.quadraticCurveTo(screenX + 18, screenY + 19 - wave1 * 2, screenX + 28, screenY + 23 + wave2 * 2);
        ctx.stroke();
        break;
      }

      // === 8. 大唐·长安明亮暖青玉石御道 (温润雅致，彻底告别阴暗冷灰) ===
      case 'changan_stone': {
        const stoneGrad = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        stoneGrad.addColorStop(0, '#b6c4be');
        stoneGrad.addColorStop(0.5, '#a4b3ac');
        stoneGrad.addColorStop(1, '#93a39b');
        ctx.fillStyle = stoneGrad;
        ctx.fillRect(screenX, screenY, s, s);

        // 细腻砖缝与内嵌阴影
        ctx.strokeStyle = '#74867f';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 0.5, screenY + 0.5, s - 1, s - 1);

        // 上边缘与左边缘玉石微受光暖白细线
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(screenX + 1, screenY + 1, s - 2, 1.5);
        ctx.fillRect(screenX + 1, screenY + 1, 1.5, s - 2);

        // 下边缘微阴影沉淀
        ctx.fillStyle = 'rgba(40, 55, 50, 0.25)';
        ctx.fillRect(screenX + 1, screenY + s - 2, s - 2, 1.5);

        // 随机微光青石斑驳纹理 (打散网格感，呈现盛世皇都温润玉石地铺)
        const stoneSeed = (col * 31 + row * 47) % 5;
        if (stoneSeed === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.fillRect(screenX + 8, screenY + 8, 4, 3);
          ctx.fillStyle = 'rgba(80, 95, 90, 0.2)';
          ctx.fillRect(screenX + 18, screenY + 20, 5, 2.5);
        } else if (stoneSeed === 1) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(screenX + 16, screenY + 14, 6, 2);
        } else if (stoneSeed === 2) {
          ctx.fillStyle = 'rgba(70, 85, 80, 0.22)';
          ctx.fillRect(screenX + 6, screenY + 22, 4, 3);
        }
        break;
      }

      // === 9. 大唐·巍峨古朴城墙与宫阙外垣 (暖褐青砖与朱红城垛，告别阴森) ===
      case 'city_wall': {
        const wallGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        wallGrad.addColorStop(0, '#536171');
        wallGrad.addColorStop(1, '#3b4654');
        ctx.fillStyle = wallGrad;
        ctx.fillRect(screenX, screenY, s, s);

        // 仿古工整青砖勾缝
        ctx.strokeStyle = '#27303a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 10); ctx.lineTo(screenX + s, screenY + 10);
        ctx.moveTo(screenX, screenY + 21); ctx.lineTo(screenX + s, screenY + 21);
        ctx.moveTo(screenX + 16, screenY); ctx.lineTo(screenX + 16, screenY + 10);
        ctx.moveTo(screenX + 8, screenY + 10); ctx.lineTo(screenX + 8, screenY + 21);
        ctx.moveTo(screenX + 24, screenY + 10); ctx.lineTo(screenX + 24, screenY + 21);
        ctx.stroke();

        // 顶部城垛红木飞檐挑梁与金铜点缀
        ctx.fillStyle = '#8b261e';
        ctx.fillRect(screenX, screenY, s, 3.5);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX + 4, screenY + 1, 3, 2);
        ctx.fillRect(screenX + s - 7, screenY + 1, 3, 2);
        break;
      }

      // === 9.1 大唐·金顶琉璃宫殿与化生宝刹 (阻挡，自适应重檐斗拱、朱红廊柱与金窗) ===
      case 'tang_palace': {
        const isTop = (row === 0) || !mapData || (mapData.tiles[row - 1] && mapData.tiles[row - 1][col] !== 'tang_palace');
        const isBottom = !mapData || (row >= mapData.height - 1) || (mapData.tiles[row + 1] && mapData.tiles[row + 1][col] !== 'tang_palace');
        const isLeft = (col === 0) || !mapData || (mapData.tiles[row] && mapData.tiles[row][col - 1] !== 'tang_palace');
        const isRight = !mapData || (col >= mapData.width - 1) || (mapData.tiles[row] && mapData.tiles[row][col + 1] !== 'tang_palace');

        if (isTop) {
          // 金顶琉璃飞檐殿顶
          const roofGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
          roofGrad.addColorStop(0, '#c27803');
          roofGrad.addColorStop(0.3, '#f59e0b');
          roofGrad.addColorStop(0.7, '#fbbf24');
          roofGrad.addColorStop(1, '#92400e');
          ctx.fillStyle = roofGrad;
          ctx.fillRect(screenX, screenY, s, s);

          // 金黄琉璃瓦沟横纵瓦垄
          ctx.fillStyle = '#fef08a';
          for (let i = 3; i < s; i += 6) {
            ctx.fillRect(screenX, screenY + i, s, 2);
          }
          // 檐下朱红斗拱挑檐
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(screenX, screenY + s - 4, s, 4);

          // 左右双向展翅飞檐翘角
          if (isLeft) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY + s - 4);
            ctx.lineTo(screenX - 5, screenY + s - 8);
            ctx.lineTo(screenX, screenY + s);
            ctx.closePath();
            ctx.fill();
          }
          if (isRight) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.moveTo(screenX + s, screenY + s - 4);
            ctx.lineTo(screenX + s + 5, screenY + s - 8);
            ctx.lineTo(screenX + s, screenY + s);
            ctx.closePath();
            ctx.fill();
          }
        } else if (isBottom) {
          // 殿堂正身：朱红大木立柱、白粉泥墙与雕花金窗
          ctx.fillStyle = '#fdfbf7';
          ctx.fillRect(screenX, screenY, s, s);

          // 檐下深木阴影
          ctx.fillStyle = 'rgba(74, 14, 10, 0.4)';
          ctx.fillRect(screenX, screenY, s, 3);

          // 朱红立柱 (左/右)
          if (isLeft || isRight) {
            ctx.fillStyle = '#b91c1c';
            const poleX = isLeft ? screenX : screenX + s - 6;
            ctx.fillRect(poleX, screenY, 6, s);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(poleX + 1, screenY, 2, s); // 柱身光泽
          }

          // 中间部位绘制朱漆大门或雕花窗棂
          if (!isLeft && !isRight) {
            if (col % 2 === 0) {
              // 雕花镂空贴金八角窗 (暖阳微光)
              ctx.fillStyle = '#fef08a';
              ctx.fillRect(screenX + 6, screenY + 7, 20, 18);
              ctx.strokeStyle = '#991b1b';
              ctx.lineWidth = 1.8;
              ctx.strokeRect(screenX + 6, screenY + 7, 20, 18);
              ctx.beginPath();
              ctx.moveTo(screenX + 16, screenY + 7); ctx.lineTo(screenX + 16, screenY + 25);
              ctx.moveTo(screenX + 6, screenY + 16); ctx.lineTo(screenX + 26, screenY + 16);
              ctx.stroke();
            } else {
              // 朱红九排门钉宫门
              ctx.fillStyle = '#991b1b';
              ctx.fillRect(screenX + 4, screenY + 4, 24, s - 4);
              ctx.strokeStyle = '#450a0a';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(screenX + 4, screenY + 4, 24, s - 4);
              // 门钉与门环
              ctx.fillStyle = '#ffd700';
              for (let mr = 0; mr < 3; mr++) {
                for (let mc = 0; mc < 2; mc++) {
                  ctx.beginPath();
                  ctx.arc(screenX + 10 + mc * 12, screenY + 9 + mr * 7, 1.5, 0, Math.PI * 2);
                  ctx.fill();
                }
              }
            }
          }
          // 汉白玉台基
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(screenX, screenY + s - 3, s, 3);
        } else {
          // 中段金顶琉璃叠瓦
          ctx.fillStyle = '#d97706';
          ctx.fillRect(screenX, screenY, s, s);
          ctx.fillStyle = '#fbbf24';
          for (let i = 2; i < s; i += 5) {
            ctx.fillRect(screenX, screenY + i, s, 2);
          }
        }
        break;
      }

      // === 9.2 大唐·市井两层坊肆楼阁 (阻挡，青黛飞檐、挂红灯笼、飘动酒幌茶旗) ===
      case 'tang_store': {
        const isTop = (row === 0) || !mapData || (mapData.tiles[row - 1] && mapData.tiles[row - 1][col] !== 'tang_store');
        const isBottom = !mapData || (row >= mapData.height - 1) || (mapData.tiles[row + 1] && mapData.tiles[row + 1][col] !== 'tang_store');
        const isLeft = (col === 0) || !mapData || (mapData.tiles[row] && mapData.tiles[row][col - 1] !== 'tang_store');
        const isRight = !mapData || (col >= mapData.width - 1) || (mapData.tiles[row] && mapData.tiles[row][col + 1] !== 'tang_store');

        if (isTop) {
          // 青黛双坡青瓦斜檐
          const roofGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
          roofGrad.addColorStop(0, '#334155');
          roofGrad.addColorStop(0.5, '#475569');
          roofGrad.addColorStop(1, '#1e293b');
          ctx.fillStyle = roofGrad;
          ctx.fillRect(screenX, screenY, s, s);

          // 青瓦横纹
          ctx.fillStyle = '#64748b';
          for (let i = 3; i < s; i += 5) {
            ctx.fillRect(screenX, screenY + i, s, 1.8);
          }

          // 檐下挑木
          ctx.fillStyle = '#78350f';
          ctx.fillRect(screenX, screenY + s - 3, s, 3);

          // 两端悬挂微风摇曳大红灯笼
          if (isLeft || isRight) {
            const lx = isLeft ? screenX + 4 : screenX + s - 6;
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.ellipse(lx, screenY + s + 2, 4, 5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fbbf24';
            ctx.fillRect(lx - 2, screenY + s + 6, 4, 2); // 金流苏
          }
        } else if (isBottom) {
          // 一层铺面：深木门面、柜台与商幌
          ctx.fillStyle = '#854d0e';
          ctx.fillRect(screenX, screenY, s, s);

          // 柜台暖黄窗扇
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(screenX + 5, screenY + 6, 22, 16);
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(screenX + 5, screenY + 6, 22, 16);

          // 随机悬挂飘拂酒幌/百宝茶旗
          if (col % 2 === 1) {
            ctx.fillStyle = '#fef3c7';
            ctx.fillRect(screenX + 8, screenY + 8, 16, 12);
            ctx.fillStyle = '#b91c1c';
            ctx.font = 'bold 9px "KaiTi", serif';
            ctx.textAlign = 'center';
            ctx.fillText(col % 4 === 1 ? '酒' : '庄', screenX + 16, screenY + 17);
          }
          // 石阶底基
          ctx.fillStyle = '#78716c';
          ctx.fillRect(screenX, screenY + s - 3, s, 3);
        } else {
          // 二层外廊与雕花栏杆
          ctx.fillStyle = '#78350f';
          ctx.fillRect(screenX, screenY, s, s);
          ctx.fillStyle = '#a16207';
          ctx.fillRect(screenX, screenY + 6, s, 10);
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1;
          for (let rx = 3; rx < s; rx += 6) {
            ctx.strokeRect(screenX + rx, screenY + 6, 4, 10);
          }
        }
        break;
      }

      // === 9.3 盛唐·朱雀牌坊与坊市门楼 ===
      case 'paifang': {
        // 白石地底
        const stoneGrad = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        stoneGrad.addColorStop(0, '#b6c4be');
        stoneGrad.addColorStop(1, '#93a39b');
        ctx.fillStyle = stoneGrad;
        ctx.fillRect(screenX, screenY, s, s);

        // 汉白玉粗石雕柱
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(screenX + 4, screenY, 6, s);
        ctx.fillRect(screenX + s - 10, screenY, 6, s);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(screenX + 3, screenY + s - 5, 8, 5); // 抱鼓石基
        ctx.fillRect(screenX + s - 11, screenY + s - 5, 8, 5);

        // 朱红额枋与金顶
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(screenX, screenY + 2, s, 7);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(screenX - 2, screenY, s + 4, 3);

        // 金光大字
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 8px "KaiTi", serif';
        ctx.textAlign = 'center';
        ctx.fillText('盛世', screenX + s / 2, screenY + 7);
        break;
      }

      // === 9.4 仙山·石庙仙亭与山神土地石龛 (阻挡，青石歇山顶、石柱与香炉) ===
      case 'stone_temple': {
        // 草地/山地底
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(screenX, screenY, s, s);

        // 青石雕花攒尖顶
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(screenX + s / 2, screenY + 2);
        ctx.lineTo(screenX + s + 2, screenY + 12);
        ctx.lineTo(screenX - 2, screenY + 12);
        ctx.closePath();
        ctx.fill();

        // 金色宝顶
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // 石柱与石龛内膛
        ctx.fillStyle = '#334155';
        ctx.fillRect(screenX + 6, screenY + 12, 20, s - 12);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(screenX + 9, screenY + 15, 14, s - 17);

        // 龛内青铜小香炉与灵光微烟
        ctx.fillStyle = '#d97706';
        ctx.fillRect(screenX + 13, screenY + s - 6, 6, 4);
        ctx.fillStyle = 'rgba(255, 230, 150, 0.7)';
        ctx.beginPath();
        ctx.arc(screenX + 16, screenY + s - 9, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 10. 刘家村·猎户茅屋与古风院落 (阻挡，根据矩阵上下文自适应飞檐、瓦当、门窗与木柱) ===
      case 'hut_wall': {
        const isTop = (row === 0) || !mapData || (mapData.tiles[row - 1] && mapData.tiles[row - 1][col] !== 'hut_wall');
        const isBottom = !mapData || (row >= mapData.height - 1) || (mapData.tiles[row + 1] && mapData.tiles[row + 1][col] !== 'hut_wall');
        const isLeft = (col === 0) || !mapData || (mapData.tiles[row] && mapData.tiles[row][col - 1] !== 'hut_wall');
        const isRight = !mapData || (col >= mapData.width - 1) || (mapData.tiles[row] && mapData.tiles[row][col + 1] !== 'hut_wall');

        if (isTop) {
          // --- 屋顶顶坡脊与挑檐飞檐 ---
          // 茅草坡脊金黄渐变
          const roofGrad = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
          roofGrad.addColorStop(0, '#8c5922');
          roofGrad.addColorStop(0.4, '#c58e32');
          roofGrad.addColorStop(0.8, '#d4a23b');
          roofGrad.addColorStop(1, '#5c3a16');
          ctx.fillStyle = roofGrad;
          ctx.fillRect(screenX, screenY, s, s);

          // 茅草金穗密排横纹
          ctx.fillStyle = '#e8b855';
          for (let i = 4; i < s; i += 7) {
            ctx.fillRect(screenX, screenY + i, s, 2.5);
          }

          // 檐口悬挑飞檐与翘角阴影
          ctx.fillStyle = '#42280d';
          ctx.fillRect(screenX, screenY + s - 3, s, 3);

          // 左飞檐微翘角
          if (isLeft) {
            ctx.fillStyle = '#e8b855';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY + s - 3);
            ctx.lineTo(screenX - 4, screenY + s - 7);
            ctx.lineTo(screenX, screenY + s);
            ctx.closePath();
            ctx.fill();
          }
          // 右飞檐微翘角
          if (isRight) {
            ctx.fillStyle = '#e8b855';
            ctx.beginPath();
            ctx.moveTo(screenX + s, screenY + s - 3);
            ctx.lineTo(screenX + s + 4, screenY + s - 7);
            ctx.lineTo(screenX + s, screenY + s);
            ctx.closePath();
            ctx.fill();
          }
        } else if (isBottom) {
          // --- 建筑底部：白灰泥墙、神木立柱、门扉与雕花窗棂 ---
          // 白粉泥墙底
          ctx.fillStyle = '#dcd4c5';
          ctx.fillRect(screenX, screenY, s, s);

          // 檐下暗影
          ctx.fillStyle = 'rgba(40, 25, 12, 0.45)';
          ctx.fillRect(screenX, screenY, s, 4);

          // 神木立柱 (两侧或边缘)
          if (isLeft || isRight) {
            ctx.fillStyle = '#5c3a21';
            const poleX = isLeft ? screenX : screenX + s - 6;
            ctx.fillRect(poleX, screenY, 6, s);
            ctx.fillStyle = '#7a4e2d';
            ctx.fillRect(poleX + 1, screenY, 2, s); // 柱身受光
          }

          // 如果处于中间且靠近正门位：绘制朱红木门或雕花木窗
          if (!isLeft && !isRight) {
            if (col % 2 === 0) {
              // 雕花木格窗棂 (暖黄微光)
              ctx.fillStyle = '#f6d365';
              ctx.fillRect(screenX + 7, screenY + 8, 18, 16);
              // 木窗格外框与十字棂
              ctx.strokeStyle = '#5c3a21';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(screenX + 7, screenY + 8, 18, 16);
              ctx.beginPath();
              ctx.moveTo(screenX + 16, screenY + 8); ctx.lineTo(screenX + 16, screenY + 24);
              ctx.moveTo(screenX + 7, screenY + 16); ctx.lineTo(screenX + 25, screenY + 16);
              ctx.stroke();
            } else {
              // 古典实木门扉与金环把手
              ctx.fillStyle = '#8b261e';
              ctx.fillRect(screenX + 5, screenY + 5, 22, s - 5);
              ctx.strokeStyle = '#4a1410';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(screenX + 5, screenY + 5, 22, s - 5);
              // 门缝与门环
              ctx.beginPath();
              ctx.moveTo(screenX + 16, screenY + 5); ctx.lineTo(screenX + 16, screenY + s);
              ctx.stroke();
              ctx.fillStyle = '#ffd700';
              ctx.beginPath();
              ctx.arc(screenX + 13, screenY + 18, 1.8, 0, Math.PI * 2);
              ctx.arc(screenX + 19, screenY + 18, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // 石砌墙基
          ctx.fillStyle = '#6e675f';
          ctx.fillRect(screenX, screenY + s - 3, s, 3);
        } else {
          // --- 建筑中段：茅草瓦片叠层坡面 ---
          ctx.fillStyle = '#7a4e21';
          ctx.fillRect(screenX, screenY, s, s);
          // 茅草层叠金丝
          ctx.fillStyle = '#b8832c';
          for (let i = 2; i < s; i += 6) {
            ctx.fillRect(screenX, screenY + i, s, 2.5);
            ctx.fillStyle = '#5c3915';
            ctx.fillRect(screenX, screenY + i + 2.5, s, 1.2);
            ctx.fillStyle = '#b8832c';
          }
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
      'purple_bamboo',
      'tang_palace',
      'tang_store',
      'stone_temple'
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
        this.drawTile(ctx, tileType, screenX, screenY, c, r, mapData);
      }
    }
  }
}

window.TilemapEngine = TilemapEngine;
