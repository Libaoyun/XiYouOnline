/**
 * 汉风西游 - 次世代国风 2D 瓦片地貌与仙境画卷渲染引擎 (TilemapEngine 2.5)
 * 全面革新：
 * 1. 彻底移除单调死板的网格中心圆点，升级为汉白玉双色交辉龙纹金砖
 * 2. 引入九天云海与浩瀚星宿视差天幕背景 (Parallax Atmospheric Backdrops)
 * 3. 盘龙仙柱升级为圆柱高光光影、立体投地软阴影与金鳞蟠龙
 * 4. 凡间草地、清溪动感流光波纹、青翠修竹与万寿山人参果灵树
 */

class TilemapEngine {
  constructor(tileSize = 32) {
    this.tileSize = tileSize;
    this.waterAnimTime = 0;
  }

  // 更新水流与仙气动画时序
  updateAnimation() {
    this.waterAnimTime += 0.025;
  }

  // 1. 渲染天宫浩瀚云海天幕背景 (在瓦片最底层渲染，营造深渊悬空与神光漫射)
  renderHeavenBackdrop(ctx, camera) {
    const w = camera.viewportWidth;
    const h = camera.viewportHeight;

    // 深邃九天神霄渐变
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#0a0d18');
    skyGrad.addColorStop(0.4, '#131b2e');
    skyGrad.addColorStop(0.8, '#1b253d');
    skyGrad.addColorStop(1, '#0e1422');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    const t = this.waterAnimTime;

    // 远景金光日光神柱 (God rays)
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const rayX = ((i * 220 + t * 15) % (w + 200)) - 100;
      const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 60, h);
      rayGrad.addColorStop(0, 'rgba(255, 230, 150, 0.12)');
      rayGrad.addColorStop(0.6, 'rgba(243, 156, 18, 0.06)');
      rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rayX, 0);
      ctx.lineTo(rayX + 90, 0);
      ctx.lineTo(rayX + 160, h);
      ctx.lineTo(rayX + 30, h);
      ctx.closePath();
      ctx.fill();
    }

    // 远景浮空仙山与宫阙剪影 (Parallax Layer 1, 移速 0.15)
    ctx.fillStyle = 'rgba(230, 180, 80, 0.07)';
    const paraX1 = (camera.x * 0.15) % 400;
    for (let k = -1; k < Math.ceil(w / 400) + 1; k++) {
      const bx = k * 400 - paraX1;
      ctx.beginPath();
      ctx.moveTo(bx, h * 0.55);
      ctx.quadraticCurveTo(bx + 80, h * 0.38, bx + 160, h * 0.52);
      ctx.lineTo(bx + 190, h * 0.45);
      ctx.lineTo(bx + 210, h * 0.45); // 宝塔飞檐
      ctx.lineTo(bx + 230, h * 0.54);
      ctx.quadraticCurveTo(bx + 310, h * 0.40, bx + 400, h * 0.55);
      ctx.lineTo(bx + 400, h);
      ctx.lineTo(bx, h);
      ctx.closePath();
      ctx.fill();
    }

    // 浩瀚浮动祥云云海层 (Parallax Layer 2, 移速 0.25)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.09)';
    const paraX2 = (camera.x * 0.25 + t * 18) % 320;
    for (let j = -1; j < Math.ceil(w / 320) + 1; j++) {
      const cx = j * 320 - paraX2;
      ctx.beginPath();
      ctx.arc(cx + 60, h * 0.78, 55, 0, Math.PI * 2);
      ctx.arc(cx + 130, h * 0.74, 65, 0, Math.PI * 2);
      ctx.arc(cx + 210, h * 0.79, 58, 0, Math.PI * 2);
      ctx.arc(cx + 280, h * 0.83, 48, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // 2. 凡间远景水墨山色天幕
  renderMortalBackdrop(ctx, camera) {
    const w = camera.viewportWidth;
    const h = camera.viewportHeight;

    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#101712');
    skyGrad.addColorStop(0.5, '#1b261d');
    skyGrad.addColorStop(1, '#0b100d');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 水墨远山
    ctx.save();
    ctx.fillStyle = 'rgba(40, 60, 45, 0.18)';
    const paraX = (camera.x * 0.12) % 360;
    for (let k = -1; k < Math.ceil(w / 360) + 1; k++) {
      const bx = k * 360 - paraX;
      ctx.beginPath();
      ctx.moveTo(bx, h * 0.65);
      ctx.quadraticCurveTo(bx + 90, h * 0.42, bx + 180, h * 0.62);
      ctx.quadraticCurveTo(bx + 270, h * 0.48, bx + 360, h * 0.65);
      ctx.lineTo(bx + 360, h);
      ctx.lineTo(bx, h);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 绘制高品质瓦片
  drawTile(ctx, tileType, screenX, screenY, c = 0, r = 0, mapData = null) {
    const col = c;
    const row = r;
    const s = this.tileSize;

    switch (tileType) {
      // === 1. 天宫·汉白玉金丝雕纹地砖 ===
      case 'heaven_floor': {
        const isAlt = (c + r) % 2 === 0;
        // 细腻玉石微渐变
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        if (isAlt) {
          g.addColorStop(0, '#fbfcfe');
          g.addColorStop(0.5, '#f1f5f9');
          g.addColorStop(1, '#e2e8f0');
        } else {
          g.addColorStop(0, '#edf2f7');
          g.addColorStop(0.5, '#e2e8f0');
          g.addColorStop(1, '#cbd5e1');
        }
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 顶/左 细致玉石受光高光边
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.fillRect(screenX, screenY, s, 1);
        ctx.fillRect(screenX, screenY, 1, s);

        // 底/右 阴影接缝
        ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
        ctx.fillRect(screenX, screenY + s - 1, s, 1);
        ctx.fillRect(screenX + s - 1, screenY, 1, s);

        // 金丝交织回纹边框
        ctx.strokeStyle = 'rgba(212, 160, 23, 0.28)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 1.5, screenY + 1.5, s - 3, s - 3);

        // 仅在每隔2格交汇处的四角点缀祥云暗纹，拒绝机械满屏大黑点！
        if (c % 2 === 0 && r % 2 === 0) {
          ctx.strokeStyle = 'rgba(243, 156, 18, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(screenX + s, screenY + s, 3.5, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
          ctx.fillRect(screenX + s - 1, screenY + s - 1, 2, 2);
        }
        break;
      }

      // === 2. 天宫·浩瀚云海深渊 ===
      case 'cloud_void': {
        // 背景天幕已由 renderHeavenBackdrop 绘制，此处绘制浮云层
        const cloudWave = Math.sin(this.waterAnimTime + c * 0.4 + r * 0.3) * 3;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.beginPath();
        ctx.arc(screenX + s * 0.35, screenY + s * 0.5 + cloudWave, s * 0.42, 0, Math.PI * 2);
        ctx.arc(screenX + s * 0.75, screenY + s * 0.6 - cloudWave, s * 0.38, 0, Math.PI * 2);
        ctx.fill();

        // 金芒流云微粒
        if ((c * 17 + r * 31) % 11 === 0) {
          ctx.fillStyle = 'rgba(255, 215, 0, 0.35)';
          ctx.beginPath();
          ctx.arc(screenX + s * 0.5, screenY + s * 0.4, 2, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // === 3. 天宫·盘龙蟠龙金柱 (雄伟圆柱光影与投地软阴影) ===
      case 'heaven_pillar': {
        // 先铺地砖底衬
        ctx.fillStyle = '#edf2f7';
        ctx.fillRect(screenX, screenY, s, s);

        // 1. 柱脚地面漫反射椭圆柔和投影
        ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.beginPath();
        ctx.ellipse(screenX + s / 2, screenY + s - 3, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. 朱砂红漆神木圆柱体 (带有真实圆柱体径向受光与边缘暗角)
        const colGrad = ctx.createLinearGradient(screenX + 5, screenY, screenX + s - 5, screenY);
        colGrad.addColorStop(0, '#5a1205');   // 左侧深暗
        colGrad.addColorStop(0.3, '#991b07');  // 主色朱红
        colGrad.addColorStop(0.55, '#dc2626'); // 中间高光条
        colGrad.addColorStop(0.8, '#991b07');  // 右侧渐暗
        colGrad.addColorStop(1, '#450a04');   // 最右暗角
        ctx.fillStyle = colGrad;
        ctx.fillRect(screenX + 5, screenY, s - 10, s);

        // 3. 黄金盘龙金鳞与龙身缠绕 (S曲线金鳞飞舞)
        const dragonY = (r * s) % (s * 2);
        ctx.fillStyle = '#ffd700';
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;

        // 螺旋盘柱龙身
        ctx.beginPath();
        ctx.ellipse(screenX + s / 2, screenY + 8, 9, 3.5, -Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(screenX + s / 2, screenY + 20, 9, 3.5, Math.PI / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 龙须与金鳞火星
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(screenX + 8, screenY + 6, 2, 2);
        ctx.fillRect(screenX + 18, screenY + 18, 2, 2);

        // 4. 柱顶与柱底双层莲花宝座金柱础
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX + 3, screenY, s - 6, 3);
        ctx.fillRect(screenX + 3, screenY + s - 5, s - 6, 5);

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(screenX + 5, screenY + 1, s - 10, 1);
        ctx.fillRect(screenX + 5, screenY + s - 4, s - 10, 1.5);
        break;
      }

      // === 4. 凡间·葱郁仙林草地 (自然风吹草尖与杂花生树) ===
      case 'grass': {
        const hash = (c * 43 + r * 29) % 5;
        const isBoneRidge = mapData && mapData.id === 'baihuling';
        const isBaoxiang = mapData && mapData.id === 'baoxiangguo';
        const isLiuVillage = mapData && mapData.id === 'liujiacun';
        const isHuaguo = mapData && mapData.id === 'huaguoshan';
        // 柔和草甸
        const g = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        g.addColorStop(0, isBoneRidge ? '#545648' : isBaoxiang ? '#59663c' : isLiuVillage ? '#527d3e' : isHuaguo ? '#277451' : '#2d5e2e');
        g.addColorStop(1, isBoneRidge ? '#353c37' : isBaoxiang ? '#394b32' : isLiuVillage ? '#345d32' : isHuaguo ? '#1b543e' : '#204620');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 风拂草浪
        const wind = Math.sin(this.waterAnimTime * 2 + c * 0.6) * 1.5;
        ctx.fillStyle = isBoneRidge ? '#626952' : isBaoxiang ? '#8b8c4c' : isLiuVillage ? '#78a756' : isHuaguo ? '#55a77a' : '#3d7e3e';
        ctx.fillRect(screenX + 6 + wind, screenY + 8, 2, 6);
        ctx.fillRect(screenX + 18 - wind, screenY + 16, 2, 5);
        ctx.fillRect(screenX + 24 + wind, screenY + 6, 2, 6);

        // 随机散落野花/三叶草
        if (isBoneRidge && hash === 1) {
          // 朽骨碎石与枯叶，白虎岭不再长满鲜花。
          ctx.strokeStyle = '#b9b4a0';
          ctx.lineWidth = 1.3;
          ctx.beginPath(); ctx.moveTo(screenX + 11, screenY + 19);
          ctx.lineTo(screenX + 19, screenY + 22);
          ctx.moveTo(screenX + 14, screenY + 16);
          ctx.lineTo(screenX + 16, screenY + 24); ctx.stroke();
        } else if (isBoneRidge && hash === 3) {
          ctx.fillStyle = '#8c7050';
          ctx.beginPath(); ctx.ellipse(screenX + 22, screenY + 12, 4, 2, -.5, 0, Math.PI * 2); ctx.fill();
        } else if (isHuaguo && hash === 1) {
          // 桃林落英，花果山与凡间草地一眼可辨。
          ctx.fillStyle = '#f6a5bd';
          ctx.beginPath(); ctx.ellipse(screenX + 14, screenY + 20, 3, 1.5, -0.5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#ffe1e8';
          ctx.beginPath(); ctx.ellipse(screenX + 21, screenY + 9, 2, 1, 0.4, 0, Math.PI * 2); ctx.fill();
        } else if (isLiuVillage && hash === 3) {
          // 村边小黄花和嫩芽，衬托初醒章节的安宁。
          ctx.fillStyle = '#f4d35e';
          ctx.beginPath(); ctx.arc(screenX + 22, screenY + 12, 2.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#a8c86a'; ctx.fillRect(screenX + 21, screenY + 15, 2, 4);
        } else if (hash === 1) {
          // 白色雏菊
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(screenX + 14, screenY + 20, 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.fillRect(screenX + 13.5, screenY + 19.5, 1, 1);
        } else if (hash === 3) {
          // 金色灵芝野花
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(screenX + 22, screenY + 12, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      // === 5. 凡间·青石古道泥土小径 (细腻泥土肌理与凹凸鹅卵石) ===
      case 'dirt_road':
      case 'dirt_path': {
        const villagePath = mapData && mapData.id === 'liujiacun';
        const peachPath = mapData && mapData.id === 'huaguoshan';
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, villagePath ? '#927052' : peachPath ? '#846746' : '#6f543c');
        g.addColorStop(1, villagePath ? '#6e543e' : peachPath ? '#604a38' : '#57412e');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 嵌入式碎青石板
        ctx.fillStyle = '#7d6b5c';
        ctx.beginPath();
        ctx.roundRect(screenX + 4, screenY + 5, 11, 7, 2);
        ctx.fill();
        ctx.fillStyle = '#8f7d6e';
        ctx.beginPath();
        ctx.roundRect(screenX + 17, screenY + 16, 12, 8, 2);
        ctx.fill();

        // 细微小石粒
        ctx.fillStyle = '#423122';
        ctx.fillRect(screenX + 8, screenY + 18, 3, 2);
        ctx.fillRect(screenX + 22, screenY + 7, 2, 2);
        if (peachPath && (c * 13 + r * 7) % 9 === 0) {
          ctx.fillStyle = '#ed9bb0';
          ctx.beginPath(); ctx.ellipse(screenX + 23, screenY + 11, 3, 1.5, 0.6, 0, Math.PI * 2); ctx.fill();
        }
        break;
      }

      // === 5.1 海滨·金黄细腻沙滩 (微风沙浪纹理、散落扇贝，图1同款潮汐拍岸碎浪白沫) ===
      case 'beach_sand': {
        // 1. 暖米金细腻柔和沙质 (1:1 像素级复刻实机截图温暖纯净海滨金沙滩)
        const sandGrad = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        sandGrad.addColorStop(0, '#f2dfba');
        sandGrad.addColorStop(0.5, '#e5cca0');
        sandGrad.addColorStop(1, '#d8bc8b');
        ctx.fillStyle = sandGrad;
        ctx.fillRect(screenX, screenY, s, s);

        // 细腻沙粒微漫反射 (实机极度细腻质感，绝非纯色方块)
        const sandNoise = ((c * 17 + r * 29) % 7);
        if (sandNoise === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
          ctx.fillRect(screenX + 8, screenY + 12, 1.2, 1.2);
          ctx.fillRect(screenX + 22, screenY + 24, 1.2, 1.2);
        } else if (sandNoise === 2) {
          ctx.fillStyle = 'rgba(160, 120, 70, 0.16)';
          ctx.fillRect(screenX + 15, screenY + 7, 1.4, 1.4);
          ctx.fillRect(screenX + 5, screenY + 20, 1.4, 1.4);
        }

        // 柔和随风海滩微波纹
        const sandWave = Math.sin((c || 0) * 0.6 + (r || 0) * 0.5);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 3, screenY + 14 + sandWave * 2);
        ctx.quadraticCurveTo(screenX + 16, screenY + 17 - sandWave * 2, screenX + s - 3, screenY + 13 + sandWave * 2);
        ctx.stroke();

        // 随机零星小海星或小贝壳
        const decorSeed = ((c || 0) * 23 + (r || 0) * 41) % 19;
        if (decorSeed === 0) {
          // 纯白扇贝
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(screenX + 16, screenY + 16, 2.8, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        // ★★★ 实机精髓：右侧或东南紧邻大海时的【斜向推涌雪白蕾丝海浪拍岸】！ ★★★
        if (mapData && c < mapData.width - 1 && (mapData.tiles[r][c + 1] === 'water' || mapData.tiles[r][c + 1] === 'dark_water')) {
          const tide = Math.sin(this.waterAnimTime * 2.2 + (r || 0) * 0.6) * 5.5;
          // 浅水浅青半透明水痕 (透出沙滩金色)
          ctx.fillStyle = 'rgba(45, 212, 191, 0.42)';
          ctx.beginPath();
          ctx.ellipse(screenX + s - 1 + tide * 0.5, screenY + s / 2, 9, s / 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // 核心浪花前锋：多层雪白推涌波浪圈 (实机同款蕾丝碎浪)
          const foamAlpha = 0.78 + Math.sin(this.waterAnimTime * 2.8 + r) * 0.2;
          ctx.fillStyle = 'rgba(255, 255, 255, ' + foamAlpha + ')';
          ctx.beginPath();
          ctx.arc(screenX + s - 5 + tide, screenY + 6, 4.5, 0, Math.PI * 2);
          ctx.arc(screenX + s - 2 + tide, screenY + 16, 6.2, 0, Math.PI * 2);
          ctx.arc(screenX + s - 6 + tide, screenY + 26, 5, 0, Math.PI * 2);
          ctx.fill();

          // 晶莹微碎飞沫
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(screenX + s - 9 + tide, screenY + 3, 1.8, 1.8);
          ctx.fillRect(screenX + s - 11 + tide, screenY + 18, 2, 2);
          ctx.fillRect(screenX + s - 10 + tide, screenY + 28, 1.6, 1.6);
        }
        break;
      }

      // === 5.2 海滨·风化空心断木残骸 (1:1 像素级复刻实机截图正上方横卧中空断木枯干) ===
      case 'shipwreck': {
        // 先铺暖金沙底
        const sandGrad = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        sandGrad.addColorStop(0, '#f2dfba');
        sandGrad.addColorStop(1, '#d8bc8b');
        ctx.fillStyle = sandGrad;
        ctx.fillRect(screenX, screenY, s, s);

        // 1. 实机空心断木在沙滩上投下的深褐色斜向长阴影
        ctx.fillStyle = 'rgba(45, 30, 15, 0.45)';
        ctx.beginPath();
        ctx.ellipse(screenX + s / 2 + 3, screenY + s / 2 + 7, 16, 5.5, -0.12, 0, Math.PI * 2);
        ctx.fill();

        // 2. 粗壮风化枯木主干 (灰褐色至炭黑渐变，两端参差劈裂，中空深邃)
        const woodGrad = ctx.createLinearGradient(screenX + 2, screenY + 6, screenX + s - 2, screenY + s - 4);
        woodGrad.addColorStop(0, '#644835');
        woodGrad.addColorStop(0.3, '#7d5c43');
        woodGrad.addColorStop(0.65, '#523a2a');
        woodGrad.addColorStop(1, '#2c1e14');
        ctx.fillStyle = woodGrad;

        // 横卧微斜树干
        ctx.beginPath();
        ctx.moveTo(screenX + 2, screenY + 13);
        ctx.lineTo(screenX + s - 3, screenY + 8);
        ctx.lineTo(screenX + s - 1, screenY + 19);
        ctx.lineTo(screenX + 4, screenY + 24);
        ctx.closePath();
        ctx.fill();

        // 3. 左端中空树洞断茬阴影 (实机最标志性的空心木质)
        ctx.fillStyle = '#1c130c';
        ctx.beginPath();
        ctx.ellipse(screenX + 3.5, screenY + 18, 3, 4.5, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8d684d';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 右端参差劈裂木刺
        ctx.fillStyle = '#8d684d';
        ctx.beginPath();
        ctx.moveTo(screenX + s - 3, screenY + 8);
        ctx.lineTo(screenX + s, screenY + 12);
        ctx.lineTo(screenX + s - 2, screenY + 15);
        ctx.lineTo(screenX + s + 1, screenY + 17);
        ctx.lineTo(screenX + s - 1, screenY + 19);
        ctx.closePath();
        ctx.fill();

        // 4. 风化苍老纵向树皮干裂开裂木纹
        ctx.strokeStyle = '#1a110a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(screenX + 6, screenY + 16);
        ctx.lineTo(screenX + 17, screenY + 13);
        ctx.moveTo(screenX + 13, screenY + 15);
        ctx.lineTo(screenX + 25, screenY + 12);
        ctx.moveTo(screenX + 8, screenY + 20);
        ctx.lineTo(screenX + 21, screenY + 18);
        ctx.stroke();

        // 木干高光受光面白灰木纹
        ctx.strokeStyle = 'rgba(255, 245, 235, 0.35)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(screenX + 5, screenY + 14);
        ctx.lineTo(screenX + 25, screenY + 9);
        ctx.stroke();

        // 局部木结木瘤
        ctx.fillStyle = '#2c1e14';
        ctx.beginPath();
        ctx.arc(screenX + 18, screenY + 16, 2, 0, Math.PI * 2);
        ctx.fill();

        // 半掩入树身下方的温软金沙堆
        ctx.fillStyle = '#e5cca0';
        ctx.beginPath();
        ctx.ellipse(screenX + 9, screenY + 23, 6.5, 2.5, 0.15, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 5.3 水晶宫传送阵与海底缩略图标 (1:1 像素级复刻实机截图右下角：金框海底珊瑚全景图与青蓝传送法阵) ===
      case 'crystal_portal': {
        // 沙底与浅水
        ctx.fillStyle = '#e5cca0';
        ctx.fillRect(screenX, screenY, s, s);
        ctx.fillStyle = 'rgba(45, 212, 191, 0.45)';
        ctx.fillRect(screenX + 2, screenY + 2, s - 4, s - 4);

        // 1. 底层旋转发光的青蓝水系符文传送法阵 (实机下方法阵光效)
        const pAngle = this.waterAnimTime * 1.8;
        ctx.save();
        ctx.translate(screenX + s / 2, screenY + s / 2);
        ctx.rotate(pAngle);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#00f2fe';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 13.5, 0, Math.PI * 1.6);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // 2. ★★★ 实机核心：华丽纯金双层边框与框内深海奇观画卷！★★★
        ctx.save();
        const boxX = screenX + 3.5;
        const boxY = screenY + 3.5;
        const boxS = s - 7;

        // 纯金外框与高光
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(boxX - 2, boxY - 2, boxS + 4, boxS + 4);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX - 2, boxY - 2, boxS + 4, boxS + 4);
        // 金框内圈细金丝
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(boxX - 0.5, boxY - 0.5, boxS + 1, boxS + 1);

        // 框内深海绚烂画卷 (深海渐变背景)
        const seaGrad = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxS);
        seaGrad.addColorStop(0, '#0284c7');
        seaGrad.addColorStop(0.4, '#0369a1');
        seaGrad.addColorStop(0.8, '#1e1b4b');
        seaGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = seaGrad;
        ctx.fillRect(boxX, boxY, boxS, boxS);

        // 框内茂密绚烂珊瑚群 (实机截图同款：黄绿海葵与紫红珊瑚丛)
        // 紫红珊瑚 (左侧)
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(boxX + 5.5, boxY + boxS - 4, 4.5, Math.PI, 0);
        ctx.fill();

        // 鲜嫩金黄海葵珊瑚 (右侧核心)
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(boxX + 16, boxY + boxS - 6, 6, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(boxX + 16, boxY + boxS - 6, 3.5, Math.PI, 0);
        ctx.fill();

        // 翠绿摇曳水草丛
        ctx.fillStyle = '#10b981';
        ctx.fillRect(boxX + 10, boxY + boxS - 11, 2.2, 9);
        ctx.fillRect(boxX + 19, boxY + boxS - 9, 2.2, 7);
        ctx.fillRect(boxX + 2, boxY + boxS - 8, 1.8, 6);

        // 升腾的晶莹白水泡
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(boxX + 7, boxY + 7, 1.4, 0, Math.PI * 2);
        ctx.arc(boxX + 17, boxY + 5, 1.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        break;
      }

      // === 6. 凡间·青翠叠翠修竹 ===
      case 'bamboo': {
        ctx.fillStyle = '#204620';
        ctx.fillRect(screenX, screenY, s, s);

        // 立体竹竿 (圆柱渐变)
        const bamGrad = ctx.createLinearGradient(screenX + 7, 0, screenX + 15, 0);
        bamGrad.addColorStop(0, '#0f5132');
        bamGrad.addColorStop(0.4, '#198754');
        bamGrad.addColorStop(0.7, '#20c997');
        bamGrad.addColorStop(1, '#0a3622');
        ctx.fillStyle = bamGrad;
        ctx.fillRect(screenX + 7, screenY, 8, s);

        // 竹节环
        ctx.fillStyle = '#052c1a';
        ctx.fillRect(screenX + 6, screenY + 7, 10, 2.5);
        ctx.fillRect(screenX + 6, screenY + 21, 10, 2.5);
        break;
      }

      // === 7. 凡间·山涧清溪与浩瀚东海碧水 (图1同款晶莹剔透碧绿海浪与阳光折射) ===
      // === 7. 凡间·山涧清溪、浩瀚东海深蓝水底与八百里流沙河浑水 ===
      case 'water':
      case 'dark_water': {
        const isDark = tileType === 'dark_water';
        const isLiusha = mapData && (mapData.id === 'liushahe' || mapData.id === 'liushaho');
        const isUnderwater = mapData && (mapData.id === 'shuijinggong' || mapData.id === 'longgong_palace' || mapData.id === 'donghai_coast');
        const wave = Math.sin(this.waterAnimTime * 2.4 + screenX * 0.08 + screenY * 0.08);
        const wave2 = Math.cos(this.waterAnimTime * 1.8 + screenX * 0.06 - screenY * 0.06);

        // 1. 材质渐变底色
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s * 0.8, screenY + s);

        if (isLiusha) {
          // 八百里流沙河：金褐暗涌浊浪、鹅毛不浮浑浊流沙恶水
          g.addColorStop(0, isDark ? '#451a03' : '#78350f');
          g.addColorStop(0.5, isDark ? '#78350f' : '#92400e');
          g.addColorStop(1, isDark ? '#270e01' : '#5c2205');
        } else if (isUnderwater) {
          // 东海水下与水晶宫：纯净深邃宝蓝与群青光晕，绝不偏绿！
          g.addColorStop(0, isDark ? '#082f49' : '#0369a1');
          g.addColorStop(0.45, isDark ? '#0369a1' : '#0284c7');
          g.addColorStop(1, isDark ? '#0c4a6e' : '#075985');
        } else {
          // 通用海面与清溪：纯净蔚蓝、水天一色
          if (isDark) {
            g.addColorStop(0, '#0369a1');
            g.addColorStop(0.5, '#0284c7');
            g.addColorStop(1, '#075985');
          } else {
            g.addColorStop(0, '#38bdf8'); // 晴空澄澈浅蓝 (摒弃偏绿的原 #2dd4bf)
            g.addColorStop(0.4, '#0ea5e9'); // 晴空蔚蓝
            g.addColorStop(1, '#0284c7'); // 湛蓝海深
          }
        }
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 2. 水波涌动涟漪与折射光丝
        if (isLiusha) {
          // 流沙河：金砂流动波纹与暗流翻卷
          ctx.strokeStyle = 'rgba(245, 158, 11, ' + (0.38 + wave * 0.22) + ')';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(screenX + 2, screenY + 10 + wave * 3.5);
          ctx.quadraticCurveTo(screenX + 16, screenY + 6 - wave * 3.5, screenX + s - 2, screenY + 10 + wave * 3.5);
          ctx.moveTo(screenX + 4, screenY + 22 - wave2 * 3.5);
          ctx.quadraticCurveTo(screenX + 18, screenY + 26 + wave2 * 3.5, screenX + s - 3, screenY + 22 - wave2 * 3.5);
          ctx.stroke();

          // 金砂漩涡微点
          if (((c || 0) * 13 + (r || 0) * 19) % 3 === 0) {
            ctx.fillStyle = 'rgba(251, 191, 36, 0.75)';
            ctx.beginPath();
            ctx.arc(screenX + 12 + wave * 2, screenY + 16, 1.4, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // 东海与普通水体：阳光折射水纹与流动涟漪波光
          ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.45 + wave * 0.25) + ')';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(screenX + 2, screenY + 10 + wave * 3);
          ctx.quadraticCurveTo(screenX + 16, screenY + 6 - wave * 3, screenX + s - 2, screenY + 10 + wave * 3);
          ctx.moveTo(screenX + 4, screenY + 22 - wave2 * 3);
          ctx.quadraticCurveTo(screenX + 18, screenY + 26 + wave2 * 3, screenX + s - 3, screenY + 22 - wave2 * 3);
          ctx.stroke();

          // 东海水下专属：动态焦散网纹 (Underwater Caustics Wave & Shimmer)
          if (isUnderwater) {
            const caustics = Math.sin(this.waterAnimTime * 2.8 + screenX * 0.12) * Math.cos(this.waterAnimTime * 2.2 + screenY * 0.12);
            ctx.fillStyle = 'rgba(186, 230, 253, ' + (0.12 + Math.abs(caustics) * 0.18) + ')';
            ctx.beginPath();
            ctx.arc(screenX + 16 + wave * 2.5, screenY + 16 + wave2 * 2.5, 6, 0, Math.PI * 2);
            ctx.fill();
          }

          // 翻滚的细腻小水珠与细碎泡沫
          if (((c || 0) * 17 + (r || 0) * 23) % 3 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(screenX + 14 + wave * 2, screenY + 15, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      }

      // === 8. 大唐·长安青石方砖 (复刻图1：青灰方砖、倒角接缝与质感) ===
      case 'changan_stone': {
        const isAlt = (c + r) % 2 === 0;
        const isChenTang = mapData && mapData.id === 'chentangguan';
        ctx.fillStyle = isChenTang ? (isAlt ? '#8b9090' : '#798787') : (isAlt ? '#64748b' : '#59687c');
        ctx.fillRect(screenX, screenY, s, s);

        // 石砖倒角高光与阴影接缝
        ctx.fillStyle = 'rgba(255, 255, 255, 0.26)';
        ctx.fillRect(screenX, screenY, s, 1.2);
        ctx.fillRect(screenX, screenY, 1.2, s);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.fillRect(screenX, screenY + s - 1.2, s, 1.2);
        ctx.fillRect(screenX + s - 1.2, screenY, 1.2, s);

        // 细腻石材肌理微点
        ctx.fillStyle = 'rgba(30, 41, 59, 0.2)';
        ctx.fillRect(screenX + 5, screenY + 7, 2, 2);
        ctx.fillRect(screenX + 18, screenY + 16, 2, 2);
        if (isChenTang && (c * 19 + r * 11) % 13 === 0) {
          // 海风吹来的贝壳纹，与长安内城石砖区分。
          ctx.strokeStyle = 'rgba(225, 224, 198, 0.65)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(screenX + 22, screenY + 9, 3, Math.PI, Math.PI * 2); ctx.stroke();
        }
        break;
      }

      // === 大唐御道·左侧汉白玉回纹边饰 (复刻图1中央御道) ===
      case 'imperial_way_left': {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);

        // 左边缘接缝与阴影
        ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.fillRect(screenX, screenY, 2.5, s);

        // 传统经典回形雷纹边饰 (Greek-key fret band)
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.3;
        ctx.strokeRect(screenX + 5, screenY + 4, 10, 10);
        ctx.strokeRect(screenX + 5, screenY + 18, 10, 10);

        // 金线嵌边
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 18, screenY);
        ctx.lineTo(screenX + 18, screenY + s);
        ctx.stroke();
        break;
      }

      // === 大唐御道·中央九龙/宝相花浮雕汉白玉砖 (复刻图1御道核心) ===
      case 'imperial_way_center': {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(screenX, screenY, s, s);

        // 玉质微光边
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fillRect(screenX + 1, screenY + 1, s - 2, 1);

        // 中央祥云/宝相莲花浮雕
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s / 2, 8, 0, Math.PI * 2);
        ctx.stroke();

        // 浮雕莲瓣与如意云纹
        ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + s / 2, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(screenX + s / 2 - 3, screenY + s / 2, 2.5, 0, Math.PI * 2);
        ctx.arc(screenX + s / 2 + 3, screenY + s / 2, 2.5, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      // === 大唐御道·右侧汉白玉回纹边饰 ===
      case 'imperial_way_right': {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(screenX, screenY, s, s);

        // 金线嵌边
        ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + s - 18, screenY);
        ctx.lineTo(screenX + s - 18, screenY + s);
        ctx.stroke();

        // 右侧回形雷纹
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 1.3;
        ctx.strokeRect(screenX + s - 15, screenY + 4, 10, 10);
        ctx.strokeRect(screenX + s - 15, screenY + 18, 10, 10);

        // 右边缘接缝
        ctx.fillStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.fillRect(screenX + s - 2.5, screenY, 2.5, s);
        break;
      }

      // === 宫阙楼阁·飞檐琉璃瓦与大红灯笼 (复刻图1顶部建筑) ===
      case 'palace_eaves': {
        // 深色木构横梁
        ctx.fillStyle = '#3a1700';
        ctx.fillRect(screenX, screenY, s, s);

        // 琉璃瓦棱 (陶褐瓦)
        for (let i = 0; i < s; i += 6) {
          ctx.fillStyle = '#8d5b4c';
          ctx.fillRect(screenX + i, screenY, 4.5, s - 6);
          ctx.fillStyle = '#b27a69';
          ctx.fillRect(screenX + i, screenY, 2, s - 6);
        }

        // 飞檐出挑檐板
        ctx.fillStyle = '#5a2200';
        ctx.fillRect(screenX, screenY + s - 7, s, 7);
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(screenX, screenY + s - 2, s, 2);

        // 每间隔位置悬挂金穗大红灯笼 (复刻图1挂灯)
        if (c % 3 === 1) {
          const sway = Math.sin(this.waterAnimTime * 1.5 + c) * 1.5;
          ctx.strokeStyle = '#2d1500';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(screenX + s / 2, screenY + s - 6);
          ctx.lineTo(screenX + s / 2 + sway, screenY + s + 3);
          ctx.stroke();

          // 灯笼主体
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.ellipse(screenX + s / 2 + sway, screenY + s + 9, 6.5, 5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffd700';
          ctx.lineWidth = 1;
          ctx.stroke();

          // 金流苏
          ctx.strokeStyle = '#facc15';
          ctx.beginPath();
          ctx.moveTo(screenX + s / 2 + sway, screenY + s + 14);
          ctx.lineTo(screenX + s / 2 + sway, screenY + s + 19);
          ctx.stroke();
        }
        break;
      }

      // === 凡间关隘·木拒马鹿砦 (复刻图2野外栅栏防线) ===
      case 'wooden_barricade': {
        // 先铺草地底衬
        const g = ctx.createLinearGradient(screenX, screenY, screenX, screenY + s);
        g.addColorStop(0, '#2d5e2e');
        g.addColorStop(1, '#204620');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 拒马地面投影
        ctx.fillStyle = 'rgba(10, 25, 10, 0.45)';
        ctx.beginPath();
        ctx.ellipse(screenX + s / 2, screenY + s - 4, 13, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 交叉原木立柱 (削尖圆木桩)
        ctx.strokeStyle = '#5c3a21';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(screenX + 4, screenY + s - 3);
        ctx.lineTo(screenX + s - 6, screenY + 4);
        ctx.moveTo(screenX + s - 4, screenY + s - 3);
        ctx.lineTo(screenX + 6, screenY + 4);
        ctx.stroke();

        // 横向捆扎主木
        ctx.strokeStyle = '#784d28';
        ctx.lineWidth = 4.5;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + s / 2 + 1);
        ctx.lineTo(screenX + s, screenY + s / 2 + 1);
        ctx.stroke();

        // 麻绳捆扎十字结
        ctx.fillStyle = '#e5c07b';
        ctx.fillRect(screenX + s / 2 - 3, screenY + s / 2 - 2, 6, 5);
        ctx.strokeStyle = '#8c6b32';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + s / 2 - 3, screenY + s / 2 - 2, 6, 5);
        break;
      }

      // === 铁匠工坊·灼热锻造火炉 (复刻图1铁匠铺) ===
      case 'blacksmith_forge': {
        ctx.fillStyle = '#59687c';
        ctx.fillRect(screenX, screenY, s, s);

        // 砖石火炉基座
        ctx.fillStyle = '#334155';
        ctx.fillRect(screenX + 3, screenY + 6, s - 6, s - 6);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX + 3, screenY + 6, s - 6, s - 6);

        // 熊熊烈火炉膛与跳动火星
        const firePulse = Math.sin(this.waterAnimTime * 4) * 2;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + 16, 7 + firePulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + 16, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(screenX + s / 2 - 1.5, screenY + 14, 3, 3);
        break;
      }

      // === 9. 大唐·巍峨城墙与化生寺围墙 ===
      case 'city_wall': {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(screenX, screenY, s, s);

        // 砌砖缝
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 10); ctx.lineTo(screenX + s, screenY + 10);
        ctx.moveTo(screenX, screenY + 21); ctx.lineTo(screenX + s, screenY + 21);
        ctx.moveTo(screenX + 16, screenY); ctx.lineTo(screenX + 16, screenY + 10);
        ctx.moveTo(screenX + 8, screenY + 10); ctx.lineTo(screenX + 8, screenY + 21);
        ctx.moveTo(screenX + 24, screenY + 10); ctx.lineTo(screenX + 24, screenY + 21);
        ctx.stroke();

        // 琉璃飞檐墙顶
        ctx.fillStyle = '#eab308';
        ctx.fillRect(screenX, screenY, s, 3);
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(screenX, screenY + 3, s, 1.5);
        break;
      }

      // === 10. 五行山·巍峨五指岩壁 ===
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
      case 'demon_cave_wall': {
        const boneCave = mapData && mapData.id === 'baihuling';
        const stone = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        stone.addColorStop(0, boneCave ? '#575060' : '#5b5147');
        stone.addColorStop(.53, boneCave ? '#353542' : '#383a3d');
        stone.addColorStop(1, '#171d28');
        ctx.fillStyle = stone;
        ctx.fillRect(screenX, screenY, s, s);

        // 斜切的岩层使相邻洞壁成为一整片连续的山体，而不是黑色方格。
        ctx.fillStyle = boneCave ? 'rgba(200,183,211,.16)' : 'rgba(221,181,111,.16)';
        ctx.beginPath();
        ctx.moveTo(screenX, screenY + 2);
        ctx.lineTo(screenX + s, screenY + 11);
        ctx.lineTo(screenX + s, screenY + 13);
        ctx.lineTo(screenX, screenY + 5);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = boneCave ? 'rgba(186,153,199,.34)' : 'rgba(197,158,101,.34)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 3, screenY + 22);
        ctx.lineTo(screenX + 14, screenY + 17);
        ctx.lineTo(screenX + 29, screenY + 21);
        ctx.moveTo(screenX + 20, screenY + 5);
        ctx.lineTo(screenX + 17, screenY + 12);
        ctx.lineTo(screenX + 22, screenY + 16);
        ctx.stroke();

        if ((c * 17 + r * 31) % 6 === 0) {
          const glow = .22 + .08 * Math.sin(this.waterAnimTime * 2 + c);
          ctx.fillStyle = boneCave ? `rgba(162,105,195,${glow})` : `rgba(233,169,71,${glow})`;
          ctx.beginPath();
          ctx.ellipse(screenX + 15, screenY + 18, 5, 2.5, -.4, 0, Math.PI * 2);
          ctx.fill();
        }
        if ((c + r) % 4 === 0) {
          ctx.fillStyle = boneCave ? '#a9a5ac' : '#a18d70';
          ctx.beginPath();
          ctx.moveTo(screenX + 7, screenY);
          ctx.lineTo(screenX + 13, screenY);
          ctx.lineTo(screenX + 10, screenY + 8);
          ctx.closePath(); ctx.fill();
        }
        break;
      }

      case 'mountain_rock': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#52525b');
        g.addColorStop(0.5, '#3f3f46');
        g.addColorStop(1, '#27272a');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 嶙峋峭壁裂隙
        ctx.strokeStyle = '#71717a';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(screenX + 2, screenY + 14);
        ctx.lineTo(screenX + 15, screenY + 5);
        ctx.lineTo(screenX + 28, screenY + 18);
        ctx.stroke();

        // 崖顶苔藓
        ctx.fillStyle = '#15803d';
        ctx.fillRect(screenX + 3, screenY + 1, 6, 2);
        ctx.fillRect(screenX + 18, screenY + 1, 7, 2);
        break;
      }

      // === 11. 黄风岭·风蚀黄沙古道 ===
      case 'yellow_sand': {
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        g.addColorStop(0, '#d97706');
        g.addColorStop(1, '#b45309');
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 随风流动风蚀波纹
        const sandWave = Math.sin(this.waterAnimTime + screenX * 0.1);
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(screenX + 2, screenY + 12 + sandWave * 2);
        ctx.quadraticCurveTo(screenX + 16, screenY + 16 - sandWave * 2, screenX + 30, screenY + 12 + sandWave * 2);
        ctx.stroke();
        break;
      }

      // === 12. 万寿山五庄观·草还丹人参果仙树 ===
      case 'ginseng_tree': {
        ctx.fillStyle = '#1e3a24';
        ctx.fillRect(screenX, screenY, s, s);

        // 苍劲神木古干
        ctx.fillStyle = '#451a03';
        ctx.fillRect(screenX + 9, screenY + 7, 14, s - 7);

        // 灵冠苍翠祥云树顶
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(screenX + s / 2, screenY + 10, 15, 0, Math.PI * 2);
        ctx.fill();

        // 闪耀神光的人参果灵形
        const glow = Math.sin(this.waterAnimTime * 3);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(screenX + 9, screenY + 10 + glow, 3.5, 0, Math.PI * 2);
        ctx.arc(screenX + 23, screenY + 13 - glow, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      // === 乌斯藏·高老庄高府青石雕砖地坪 ===
      case 'manor_floor': {
        const isAlt = (c + r) % 2 === 0;
        const g = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        if (isAlt) {
          g.addColorStop(0, '#334155');
          g.addColorStop(0.5, '#475569');
          g.addColorStop(1, '#1e293b');
        } else {
          g.addColorStop(0, '#3b4c63');
          g.addColorStop(0.5, '#475569');
          g.addColorStop(1, '#334155');
        }
        ctx.fillStyle = g;
        ctx.fillRect(screenX, screenY, s, s);

        // 青石微光勾边与典雅拼缝
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.fillRect(screenX, screenY, s, 1);
        ctx.fillRect(screenX, screenY, 1, s);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.55)';
        ctx.fillRect(screenX, screenY + s - 1, s, 1);
        ctx.fillRect(screenX + s - 1, screenY, 1, s);

        // 中心雅致石纹回印 (每隔2格点缀)
        if (c % 2 === 0 && r % 2 === 0) {
          ctx.strokeStyle = 'rgba(203, 213, 225, 0.15)';
          ctx.lineWidth = 0.8;
          ctx.strokeRect(screenX + 5, screenY + 5, s - 10, s - 10);
        }
        break;
      }

      // === 水帘洞天·钟乳奇石溶洞灵地 ===
      case 'cave_floor': {
        const isAlt = (c + r) % 2 === 0;
        const isBoneCave = mapData && mapData.id === 'baihuling';
        ctx.fillStyle = isBoneCave ? (isAlt ? '#343138' : '#272930') : (isAlt ? '#262626' : '#1f1f1f');
        ctx.fillRect(screenX, screenY, s, s);

        // 湿润水汽反光微光
        ctx.fillStyle = isBoneCave ? 'rgba(179, 138, 206, 0.07)' : 'rgba(56, 189, 248, 0.06)';
        ctx.fillRect(screenX + 2, screenY + 2, s - 4, s - 4);

        // 钟乳石滴水水滴涟漪
        if ((c * 13 + r * 29) % 7 === 0) {
          const dripGlow = Math.sin(this.waterAnimTime * 2 + c) * 1.5;
          ctx.strokeStyle = isBoneCave ? 'rgba(200, 167, 215, 0.23)' : 'rgba(56, 189, 248, 0.25)';
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(screenX + s / 2, screenY + s / 2, 4 + dripGlow, 2 + dripGlow * 0.5, 0, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 荧光苔藓灵草点缀
        if ((c * 7 + r * 17) % 5 === 0) {
          ctx.fillStyle = isBoneCave ? 'rgba(170, 114, 186, 0.25)' : 'rgba(52, 211, 153, 0.35)';
          ctx.fillRect(screenX + (c * 11) % 20 + 4, screenY + (r * 19) % 20 + 4, 2.5, 2.5);
        }
        break;
      }

      // === 五行山·两界界碑 (两界山界石) ===
      case 'two_realms_stele': {
        // 先铺草地底衬
        ctx.fillStyle = '#2d5a27';
        ctx.fillRect(screenX, screenY, s, s);
        // 界碑石身 (青冈石古碑)
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.roundRect(screenX + 7, screenY + 4, 18, 24, [4, 4, 1, 1]);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.stroke();
        // 碑身刻字“两界”红字
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(screenX + 15, screenY + 9, 2, 6);
        ctx.fillRect(screenX + 15, screenY + 17, 2, 6);
        break;
      }

      case 'wuxing_seal': {
        const rock = ctx.createLinearGradient(screenX, screenY, screenX + s, screenY + s);
        rock.addColorStop(0, '#7c8184'); rock.addColorStop(1, '#343b42');
        ctx.fillStyle = rock; ctx.fillRect(screenX, screenY, s, s);
        ctx.strokeStyle = '#b3b8b0'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(screenX + 2, screenY + 9);
        ctx.lineTo(screenX + 11, screenY + 7);
        ctx.lineTo(screenX + 20, screenY + 10);
        ctx.moveTo(screenX + 4, screenY + 25);
        ctx.lineTo(screenX + 16, screenY + 22);
        ctx.lineTo(screenX + 30, screenY + 26); ctx.stroke();
        const pulse = .55 + .15 * Math.sin(this.waterAnimTime * 2);
        ctx.fillStyle = `rgba(255,211,90,${pulse})`;
        ctx.beginPath(); ctx.arc(screenX + 16, screenY + 16, 13, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff0b3'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(screenX + 16, screenY + 16, 11, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#b93630';
        ctx.fillRect(screenX + 11, screenY + 5, 10, 22);
        ctx.fillStyle = '#f9e8aa';
        for (let i = 0; i < 6; i++) {
          ctx.fillRect(screenX + 13 + (i % 2), screenY + 8 + i * 3, 5, 1);
        }
        break;
      }

      default: {
        ctx.fillStyle = '#222222';
        ctx.fillRect(screenX, screenY, s, s);
        break;
      }
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
      'palace_eaves',
      'wooden_barricade',
      'blacksmith_forge',
      'mountain_rock',
      'demon_cave_wall',
      'ginseng_tree',
      'purple_bamboo',
      'tang_palace',
      'tang_store',
      'stone_temple',
      'two_realms_stele'
    ];
    return !solidTiles.includes(tileType);
  }

  // 渲染整屏可见区域
  render(ctx, mapData, camera) {
    this.updateAnimation();

    // 1. 依据场景类型，先行绘制多层视差天幕底色
    if (mapData.id && mapData.id.startsWith('tiangong_')) {
      this.renderHeavenBackdrop(ctx, camera);
    } else {
      this.renderMortalBackdrop(ctx, camera);
    }

    const startCol = Math.max(0, Math.floor(camera.x / this.tileSize));
    const endCol = Math.min(mapData.width - 1, Math.ceil((camera.x + camera.viewportWidth) / this.tileSize));
    const startRow = Math.max(0, Math.floor(camera.y / this.tileSize));
    const endRow = Math.min(mapData.height - 1, Math.ceil((camera.y + camera.viewportHeight) / this.tileSize));

    // 2. 绘制瓦片层
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileType = mapData.tiles[r][c];
        const screenX = c * this.tileSize - camera.x;
        const screenY = r * this.tileSize - camera.y;
        this.drawTile(ctx, tileType, screenX, screenY, c, r, mapData);
      }
    }
  }

  // 瓦片渲染统一门禁接口 (兼容 renderTile 别名)
  renderTile(ctx, tileType, screenX, screenY, c = 0, r = 0, mapData = null) {
    return this.drawTile(ctx, tileType, screenX, screenY, c, r, mapData);
  }
}

window.TilemapEngine = TilemapEngine;
