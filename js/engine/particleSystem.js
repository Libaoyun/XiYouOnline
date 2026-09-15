/**
 * 汉风西游 - 场景次世代动态国风粒子系统 (ParticleSystem)
 * 为西游场景赋予灵动仙气：
 * - 天宫：流动的九重天仙雾与祥云光晕、天界神光漫射
 * - 蟠桃胜境：旋转飘落的樱粉色桃花瓣、瑶池金鳞流光
 * - 双叉岭刘家村：幽幽荧光的林间萤火虫、青翠修竹落叶
 * - 五行山：神山顶冲天而起的金色真言光柱、四射的金刚碎屑
 * - 骑乘神驹：疾驰时四蹄扬起的踏云白烟微粒
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.maxParticles = 120;
    this.spawnTimer = 0;
  }

  // 根据当前所在地图生成对应氛围粒子
  spawnWeather(mapId, viewportW, viewportH) {
    this.spawnTimer++;

    // 天宫场景：持续生成轻盈浮云流雾
    if (mapId.startsWith('tiangong_') && this.spawnTimer % 6 === 0) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push({
          type: 'cloud_mist',
          x: Math.random() * (viewportW + 100) - 50,
          y: Math.random() * (viewportH + 100) - 50,
          vx: 0.2 + Math.random() * 0.35,
          vy: -0.1 + Math.random() * 0.2,
          radius: 20 + Math.random() * 35,
          alpha: 0.05 + Math.random() * 0.12,
          color: '255, 255, 255',
          life: 240 + Math.random() * 180,
          maxLife: 400
        });
      }
    }

    // 蟠桃园场景：漫天飘落的桃花花瓣
    if (mapId === 'tiangong_pantao' && this.spawnTimer % 8 === 0) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push({
          type: 'petal',
          x: Math.random() * viewportW,
          y: -10,
          vx: 0.4 + Math.random() * 0.6,
          vy: 0.6 + Math.random() * 0.8,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: 0.02 + Math.random() * 0.03,
          size: 4 + Math.random() * 4,
          color: Math.random() < 0.6 ? '#ffb7c5' : '#ff9ebb',
          alpha: 0.75 + Math.random() * 0.25,
          life: 300,
          maxLife: 300
        });
      }
    }

    // 刘家村 / 双叉岭：夜色草丛萤火虫
    if (mapId === 'liujiacun' && this.spawnTimer % 12 === 0) {
      if (this.particles.length < 50) {
        this.particles.push({
          type: 'firefly',
          x: Math.random() * viewportW,
          y: Math.random() * viewportH,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: 2 + Math.random() * 1.5,
          color: '163, 230, 53', // 荧光青绿
          pulse: Math.random() * Math.PI,
          life: 200 + Math.random() * 150,
          maxLife: 350
        });
      }
    }

    // 五行山：神帖佛光微粒
    if (mapId === 'wuxingshan' && this.spawnTimer % 6 === 0) {
      if (this.particles.length < 60) {
        this.particles.push({
          type: 'buddha_spark',
          x: 12 * 32 + (Math.random() - 0.5) * 60, // 集中在压帖周围
          y: 3 * 32 + 10,
          vx: (Math.random() - 0.5) * 0.6,
          vy: -0.8 - Math.random() * 0.8,
          radius: 1.5 + Math.random() * 2,
          color: '255, 215, 0',
          alpha: 0.9,
          life: 100 + Math.random() * 80,
          maxLife: 180,
          isWorldSpace: true
        });
      }
    }

    // 鹰愁涧：千丈寒潭升腾冰晶与幽蓝水汽水雾
    if (mapId === 'yingchoujian' && this.spawnTimer % 5 === 0) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push({
          type: 'water_mist',
          x: Math.random() * viewportW,
          y: viewportH + 10,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -0.6 - Math.random() * 0.8,
          radius: 3 + Math.random() * 6,
          color: '112, 161, 255',
          alpha: 0.25 + Math.random() * 0.25,
          life: 180 + Math.random() * 100,
          maxLife: 280
        });
      }
    }

    // 黄风岭与流沙河：三昧神风席卷漫天飞沙细尘
    if ((mapId === 'huangfengling' || mapId === 'liushahe') && this.spawnTimer % 3 === 0) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push({
          type: 'sand_dust',
          x: -10,
          y: Math.random() * viewportH,
          vx: 2.2 + Math.random() * 2.8,
          vy: 0.4 + (Math.random() - 0.5) * 0.8,
          radius: 1.5 + Math.random() * 2,
          color: '230, 180, 50',
          alpha: 0.5 + Math.random() * 0.3,
          life: 120 + Math.random() * 80,
          maxLife: 200
        });
      }
    }

    // 万寿山五庄观与南海珞珈山：仙家紫气东来与落英仙花
    if ((mapId === 'wuzhuangguan' || mapId === 'luojiashan' || mapId === 'fangcunshan') && this.spawnTimer % 6 === 0) {
      if (this.particles.length < this.maxParticles) {
        this.particles.push({
          type: 'purple_aurora',
          x: Math.random() * viewportW,
          y: -10,
          vx: 0.3 + Math.random() * 0.5,
          vy: 0.5 + Math.random() * 0.6,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: 0.02,
          radius: 3 + Math.random() * 4,
          color: Math.random() < 0.5 ? '192, 132, 252' : '253, 224, 71', // 紫霞或金粉
          alpha: 0.6,
          life: 250,
          maxLife: 250
        });
      }
    }

    // 白虎岭白骨洞：阴森森的幽冥冷磷鬼火
    if (mapId === 'baihuling' && this.spawnTimer % 8 === 0) {
      if (this.particles.length < 60) {
        this.particles.push({
          type: 'demon_wisp',
          x: Math.random() * viewportW,
          y: Math.random() * viewportH,
          vx: (Math.random() - 0.5) * 0.3,
          vy: -0.3 - Math.random() * 0.4,
          radius: 2 + Math.random() * 3,
          color: '168, 85, 247',
          pulse: Math.random() * Math.PI,
          life: 160 + Math.random() * 100,
          maxLife: 260
        });
      }
    }
  }

  // 骑乘神驹疾驰时的马蹄踏云烟尘
  spawnHorseDust(worldX, worldY) {
    if (this.particles.length >= this.maxParticles) return;
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        type: 'horse_dust',
        x: worldX + (Math.random() - 0.5) * 14,
        y: worldY + 12 + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -0.2 - Math.random() * 0.4,
        radius: 3 + Math.random() * 4,
        alpha: 0.55,
        color: '255, 255, 255',
        life: 25 + Math.random() * 15,
        maxLife: 40,
        isWorldSpace: true
      });
    }
  }

  // 更新所有微粒
  update(mapId, viewportW, viewportH) {
    this.spawnWeather(mapId, viewportW, viewportH);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.type === 'petal') {
        p.rotation += p.rotSpeed;
        p.x += Math.sin(p.rotation) * 0.4;
      }

      if (p.type === 'firefly') {
        p.pulse += 0.08;
        p.vx += (Math.random() - 0.5) * 0.05;
        p.vy += (Math.random() - 0.5) * 0.05;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  // 渲染微粒层
  render(ctx, camera) {
    ctx.save();

    for (const p of this.particles) {
      let renderX = p.x;
      let renderY = p.y;

      // 如果粒子是以世界坐标生成的，减去摄像机偏移
      if (p.isWorldSpace) {
        renderX = p.x - camera.x;
        renderY = p.y - camera.y;
      }

      const lifeRatio = p.life / p.maxLife;

      if (p.type === 'cloud_mist') {
        const currentAlpha = p.alpha * Math.sin(lifeRatio * Math.PI);
        const grad = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, p.radius);
        grad.addColorStop(0, `rgba(${p.color}, ${currentAlpha})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'petal') {
        ctx.save();
        ctx.translate(renderX, renderY);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * lifeRatio;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'firefly') {
        const glow = 0.5 + Math.sin(p.pulse) * 0.5;
        const currentAlpha = glow * lifeRatio;
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.9)`;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'buddha_spark') {
        const currentAlpha = p.alpha * lifeRatio;
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'horse_dust') {
        const currentAlpha = p.alpha * lifeRatio;
        ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius * (1.5 - lifeRatio * 0.5), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'water_mist') {
        const currentAlpha = p.alpha * Math.sin(lifeRatio * Math.PI);
        const grad = ctx.createRadialGradient(renderX, renderY, 0, renderX, renderY, p.radius);
        grad.addColorStop(0, `rgba(${p.color}, ${currentAlpha})`);
        grad.addColorStop(1, `rgba(${p.color}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'sand_dust') {
        const currentAlpha = p.alpha * lifeRatio;
        ctx.strokeStyle = `rgba(${p.color}, ${currentAlpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(renderX, renderY);
        ctx.lineTo(renderX + 8, renderY + 2);
        ctx.stroke();
      } else if (p.type === 'purple_aurora') {
        const currentAlpha = p.alpha * Math.sin(lifeRatio * Math.PI);
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.8)`;
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'demon_wisp') {
        const glow = 0.5 + Math.sin(p.pulse) * 0.5;
        const currentAlpha = glow * lifeRatio * 0.7;
        ctx.fillStyle = `rgba(${p.color}, ${currentAlpha})`;
        ctx.shadowColor = `rgba(${p.color}, 0.9)`;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();
  }
}

window.ParticleSystem = ParticleSystem;
