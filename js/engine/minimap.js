/**
 * 汉风西游 - 左上角雷达小地图系统与主线金色感叹号指引 (MiniMapEngine)
 * 实时等比缩放当前场景地貌，标示玩家坐标、NPC分布与主线金色光柱感叹号指引
 */

class MiniMapEngine {
  constructor() {
    this.pulseTime = 0;
    this.width = 130;
    this.height = 90;
  }

  // 获取当前主线任务目标点 (世界像素坐标与名称)
  getCurrentQuestTarget(mapId, storyPhase, mapData) {
    if (!mapData) return null;

    // 1. 天宫大闹天宫阶段 -> 目标：齐天大圣孙悟空
    if (mapId === 'tiangong_palace' && storyPhase === 'heaven_prologue') {
      return {
        x: 11 * 32,
        y: 4 * 32,
        name: '齐天大圣孙悟空',
        desc: '前往凌霄殿前相遇大圣'
      };
    }

    // 2. 双叉岭刚苏醒 -> 目标：镇山太保刘伯钦
    if (mapId === 'liujiacun' && storyPhase === 'liujiacun_start') {
      return {
        x: 10 * 32,
        y: 9 * 32,
        name: '刘伯钦',
        desc: '上前与刘伯钦对话求助'
      };
    }

    // 3. 猎虎除狼之后 -> 目标：东去长安城传送门
    if (mapId === 'liujiacun' && storyPhase === 'liujiacun_hunted') {
      return {
        x: 25 * 32,
        y: 10 * 32,
        name: '东行长安传送门',
        desc: '启程前往大唐王都长安城'
      };
    }

    // 4. 大唐长安城 -> 目标：玄奘法师或观音菩萨
    if (mapId === 'changan_city') {
      return {
        x: 21 * 32,
        y: 6 * 32,
        name: '玄奘法师 (唐僧)',
        desc: '化生寺拜见玄奘法师'
      };
    }

    // 5. 五行山 -> 目标：山顶六字大明咒压帖
    if (mapId === 'wuxingshan' && storyPhase !== 'wuxing_freed') {
      return {
        x: 12 * 32,
        y: 3 * 32,
        name: '六字大明咒金帖',
        desc: '攀登绝壁揭下压帖救大圣'
      };
    }

    // 6. 蛇盘山·鹰愁涧 -> 目标：寒潭小白龙
    if (mapId === 'yingchoujian') {
      return {
        x: 12 * 32,
        y: 8 * 32,
        name: '寒潭小白龙',
        desc: '迎战恶龙收服白龙马'
      };
    }

    // 7. 乌斯藏·高老庄 -> 目标：高太公与云栈洞猪八戒
    if (mapId === 'gaolaozhuang') {
      return {
        x: 11 * 32,
        y: 8 * 32,
        name: '高太公 / 猪八戒',
        desc: '解救翠兰收服天蓬元帅'
      };
    }

    // 8. 八百里·黄风岭 -> 目标：灵吉菩萨与黄风大圣
    if (mapId === 'huangfengling') {
      return {
        x: 12 * 32,
        y: 6 * 32,
        name: '灵吉菩萨 / 黄风大圣',
        desc: '借定风丹降伏三昧神风'
      };
    }

    // 9. 八百里·流沙河 -> 目标：卷帘大将沙和尚
    if (mapId === 'liushaho') {
      return {
        x: 11 * 32,
        y: 7 * 32,
        name: '沙悟净 (卷帘大将)',
        desc: '以九骨骷髅结法船渡河'
      };
    }

    // 10. 万寿山·五庄观 -> 目标：人参果树与镇元大仙
    if (mapId === 'wuzhuangguan') {
      return {
        x: 11 * 32,
        y: 6 * 32,
        name: '镇元大仙人参果树',
        desc: '拜访地仙之祖偷尝草还丹'
      };
    }

    // 11. 陈塘关 -> 目标：哪吒三太子与李靖总兵
    if (mapId === 'chentangguan') {
      return {
        x: 10 * 32,
        y: 7 * 32,
        name: '哪吒三太子',
        desc: '会面灵珠哪吒，南下东海'
      };
    }

    // 12. 东海之滨 -> 目标：巡海夜叉
    if (mapId === 'donghai_coast') {
      return {
        x: 10 * 32,
        y: 9 * 32,
        name: '巡海夜叉',
        desc: '凭避水神诀潜入东海水晶宫'
      };
    }

    // 13. 东海水晶宫 -> 目标：龟丞相珍宝阁
    if (mapId === 'shuijinggong') {
      return {
        x: 10 * 32,
        y: 9 * 32,
        name: '龟丞相 (四海珍宝阁)',
        desc: '选购金柳露与魔兽要诀，进见龙王'
      };
    }

    // 14. 东海龙宫大殿 -> 目标：东海龙王敖广 (定海神珍试炼)
    if (mapId === 'longgong_palace') {
      return {
        x: 12 * 32,
        y: 7 * 32,
        name: '东海龙王敖广',
        desc: '开启【深海试炼·借宝定海神珍】'
      };
    }

    // 15. 浮屠山 -> 目标：乌巢禅师
    if (mapId === 'futushan') {
      return {
        x: 10 * 32,
        y: 8 * 32,
        name: '乌巢禅师',
        desc: '听禅师传授《摩诃般若多心经》'
      };
    }

    // 16. 白虎岭 -> 目标：白骨夫人 (幽冥尸魔)
    if (mapId === 'baihuling') {
      return {
        x: 14 * 32,
        y: 10 * 32,
        name: '白骨夫人 (尸魔)',
        desc: '火眼金睛破幻象，三打白骨精'
      };
    }

    // 17. 宝象国 -> 目标：黄袍怪 (波月洞奎木狼) 与百花羞
    if (mapId === 'baoxiangguo') {
      return {
        x: 20 * 32,
        y: 17 * 32,
        name: '黄袍怪 (奎木狼)',
        desc: '大破波月洞，解救百花羞公主'
      };
    }

    // 18. 灵台方寸山 -> 目标：斜月三星洞菩提祖师
    if (mapId === 'fangcunshan') {
      return {
        x: 10 * 32,
        y: 6 * 32,
        name: '菩提祖师',
        desc: '顿悟《大品天仙诀》奥义道果'
      };
    }

    // 19. 南海普陀落伽山 -> 目标：观世音菩萨
    if (mapId === 'luojiashan') {
      return {
        x: 10 * 32,
        y: 6 * 32,
        name: '观世音菩萨',
        desc: '紫竹潮音圣境，沐浴灵泉圆满功德'
      };
    }

    return null;
  }

  // 渲染左上角小地图
  render(ctx, mapData, playerChar, storyPhase) {
    if (!mapData || !playerChar) return;

    this.pulseTime += 0.05;

    ctx.save();

    const posX = 10;
    const posY = 10;
    const w = this.width;
    const h = this.height;

    // 1. 小地图半透明紫檀金边底框
    ctx.fillStyle = 'rgba(18, 14, 10, 0.88)';
    ctx.fillRect(posX, posY, w, h);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(posX, posY, w, h);

    // 四角金饰花纹
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(posX, posY, 4, 4);
    ctx.fillRect(posX + w - 4, posY, 4, 4);
    ctx.fillRect(posX, posY + h - 4, 4, 4);
    ctx.fillRect(posX + w - 4, posY + h - 4, 4, 4);

    // 2. 缩放绘制地貌网格
    const mapW = mapData.width;
    const mapH = mapData.height;
    const scaleX = (w - 8) / mapW;
    const scaleY = (h - 22) / mapH;
    const innerX = posX + 4;
    const innerY = posY + 18;

    for (let r = 0; r < mapH; r++) {
      for (let c = 0; c < mapW; c++) {
        const tile = mapData.tiles[r][c];
        let color = '#2c3e50';

        if (tile === 'heaven_floor') color = '#ecf0f1';
        else if (tile === 'cloud_void') color = '#0a0d14';
        else if (tile === 'heaven_pillar') color = '#f39c12';
        else if (tile === 'grass') color = '#27ae60';
        else if (tile === 'dirt_path') color = '#795548';
        else if (tile === 'bamboo') color = '#1e824c';
        else if (tile === 'water') color = '#2980b9';
        else if (tile === 'city_wall') color = '#34495e';
        else if (tile === 'mountain_rock') color = '#424242';
        else if (tile === 'wuxing_seal') color = '#ffd700';

        ctx.fillStyle = color;
        ctx.fillRect(innerX + c * scaleX, innerY + r * scaleY, Math.ceil(scaleX), Math.ceil(scaleY));
      }
    }

    // 3. 绘制传送门标记
    if (mapData.portals) {
      ctx.fillStyle = '#3498db';
      mapData.portals.forEach(p => {
        const px = innerX + (p.x / 32) * scaleX;
        const py = innerY + (p.y / 32) * scaleY;
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 4. 绘制 NPC 位置
    if (mapData.npcs) {
      ctx.fillStyle = '#ffffff';
      mapData.npcs.forEach(n => {
        const nx = innerX + (n.x / 32) * scaleX;
        const ny = innerY + (n.y / 32) * scaleY;
        ctx.beginPath();
        ctx.arc(nx, ny, 2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // 5. 绘制主线任务目标 (金色呼吸感叹号与光环)
    const questTarget = this.getCurrentQuestTarget(mapData.id, storyPhase, mapData);
    if (questTarget) {
      const qx = innerX + (questTarget.x / 32) * scaleX;
      const qy = innerY + (questTarget.y / 32) * scaleY;

      // 动态脉冲光环
      const pulse = 3 + Math.sin(this.pulseTime * 4) * 2;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(qx, qy, pulse, 0, Math.PI * 2);
      ctx.stroke();

      // 跳动金色感叹号
      ctx.fillStyle = '#ffde59';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      const bounce = Math.sin(this.pulseTime * 5) * 2;
      ctx.fillText('!', qx, qy - 3 + bounce);
    }

    // 6. 绘制玩家自身位置 (绿色高光光斑与朝向箭头)
    const playerPx = innerX + (playerChar.x / 32) * scaleX;
    const playerPy = innerY + (playerChar.y / 32) * scaleY;

    ctx.fillStyle = '#2ecc71';
    ctx.shadowColor = '#2ecc71';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(playerPx, playerPy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // 7. 小地图顶部信息标头
    ctx.fillStyle = '#fef0cd';
    ctx.font = 'bold 9px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🗺️ ${mapData.name.split('·')[0]}`, posX + 5, posY + 12);

    ctx.restore();
  }

  // 在大世界场景中渲染主线目标的冲天光柱与大号金色感叹号
  renderWorldQuestBeacon(ctx, camera, mapId, storyPhase, mapData) {
    const questTarget = this.getCurrentQuestTarget(mapId, storyPhase, mapData);
    if (!questTarget) return;

    const screenX = questTarget.x - camera.x;
    const screenY = questTarget.y - camera.y;

    // 如果目标在视口附近
    if (screenX < -100 || screenX > camera.viewportWidth + 100 || screenY < -100 || screenY > camera.viewportHeight + 100) {
      return;
    }

    ctx.save();

    // 1. 地面金色旋转法阵光圈
    const pulse = Math.sin(this.pulseTime * 3);
    const radius = 20 + pulse * 3;

    const grad = ctx.createRadialGradient(screenX, screenY + 10, 2, screenX, screenY + 10, radius + 10);
    grad.addColorStop(0, 'rgba(255, 215, 0, 0.7)');
    grad.addColorStop(0.5, 'rgba(243, 156, 18, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(screenX, screenY + 10, radius, radius * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. 垂直冲天的半透明金色接引光柱
    const beamGrad = ctx.createLinearGradient(screenX, screenY + 10, screenX, screenY - 80);
    beamGrad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
    beamGrad.addColorStop(0.8, 'rgba(255, 234, 167, 0.2)');
    beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(screenX - 8, screenY - 80, 16, 90);

    // 3. 悬浮跳动的醒目金色感叹号与仙道任务指引卷轴
    const bounceY = Math.sin(this.pulseTime * 4) * 4;
    const tagY = screenY - 72 + bounceY;

    // 主线指引悬浮仙家锦帛卷轴
    const questText = `【主线】${questTarget.desc}`;
    ctx.font = 'bold 10px "Microsoft YaHei", sans-serif';
    const textW = ctx.measureText(questText).width;

    ctx.fillStyle = 'rgba(24, 16, 10, 0.85)';
    ctx.beginPath();
    ctx.roundRect(screenX - textW / 2 - 8, tagY - 8, textW + 16, 16, 8);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fce7b2';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(questText, screenX, tagY);

    // 锦帛下方的任务灵符感叹号
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 8;
    ctx.font = 'bold 18px "Microsoft YaHei", sans-serif';
    ctx.fillText('！', screenX, screenY - 48 + bounceY);

    ctx.restore();
  }
}

window.MiniMapEngine = new MiniMapEngine();
