/**
 * 汉风西游 - 次世代国风环境动态粒子系统 (ParticleSystem)
 * 赋予西游场景生动的生命力与顶级视觉氛围：
 * 1. 天宫凌霄殿：飘动祥云、浩瀚神光流光
 * 2. 蟠桃园：漫天飘落翻转的粉白桃花瓣粒子
 * 3. 刘家村：林间闪烁游动的绿色荧光萤火虫、草木微尘
 * 4. 五行山：佛祖六字真言符印冲天金色光柱与裂石金火
 * 5. 坐骑疾驰：四蹄踏云白烟粒子尾迹
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.cloudLayers = [];
    this.initCloudLayers();
  }

  // 初始化天宫背景多层流云
  initCloudLayers() {
    this.cloudLayers = [];
    for (let i = 0; i < 8; i++) {
      this.cloudLayers.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        radius: 60 + Math.random() * 80,
        speed: 0.15 + Math.random() * 0.25,
        alpha: 0.08 + Math.random() * 0.12
      });
    }
  }

  // 切换场景时重置粒子池
  switchScene(mapId) {
    this.particles = [];
    this.currentMapId = mapId;

    if (mapId === 'tiangong_pantao') {
      // 初始化 35 枚飘落的桃花瓣
      for (let i = 0; i < 35; i++) {
        this.particles.push(this.createPetalParticle(true));
      }
    } else if (mapId === 'liujiacun') {
      // 初始化 25 只林间荧光萤火虫
      for (let i = 0; i < 25; i++) {
        this.particles.push(this.createFireflyParticle(true));
      }
    } else if (mapId === 'tiangong_palace' || mapId === 'tiangong_yuma') {
      // 仙气微尘
      for (let i = 0; i < 20; i++) {
        this.particles.push(this.createMistyMote(true));
      }
    }
  }

  // 1. 蟠桃园桃花瓣粒子
  createPetalParticle(randomY = false) {
    return {
      type: 'petal',
      x: Math.random() * 800,
      y: randomY ? Math.random() * 600 : -20,
      size: 4 + Math.random() * 4,
      vx: -0.4 - Math.random() * 0.6,
      vy: 0.6 + Math.random() * 0.8,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.05,
      color: Math.random() < 0.6 ? 'rgba(255, 182, 193, 0.85)' : 'rgba(255, 220, 230, 0.9)'
    };
  }

  // 2. 刘家村萤火虫粒子
  createFireflyParticle(randomPos = false) {
    return {
      type: 'firefly',
      x: Math.random() * 800,
      y: Math.random() * 600,
      baseRadius: 2.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.04 + Math.random() * 0.03
    };
  }

  // 3. 仙界金光微尘
  createMistyMote(randomPos = false) {
    return {
      type: 'mote',
      x: Math.random() * 800,
      y: Math.random() * 600,
      size: 1.5 + Math.random() * 2,
      vy: -0.2 - Math.random() * 0.3,
      vx: (Math.random() - 0.5) * 0.2,
      alpha: 0.2 + Math.random() * 0.5
    };
  }

  // 4. 坐骑四蹄踏云尾迹气团
  emitMountCloud(worldX, worldY) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        type: 'mount_cloud',
        x: worldX + (Math.random() - 0.5) * 16,
        y: worldY + 12 + (Math.random() - 0.5) * 6,
        radius: 4 + Math.random() * 5,
        alpha: 0.6,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.3,
        grow: 0.15,
        life: 1.0,
        decay: 0.04
      });
    }
  }

  // 更新所有粒子状态
  update() {
    // 祥云缓动
    this.cloudLayers.forEach(c => {
      c.x += c.speed;
      if (c.x > 900) c.x = -150;
    });

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.type === 'petal') {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        if (p.y > 650 || p.x < -30) {
          Object.assign(p, this.createPetalParticle(false));
        }
      } else if (p.type === 'firefly') {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += p.pulseSpeed;
        if (Math.random() < 0.02) {
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = (Math.random() - 0.5) * 0.5;
        }
      } else if (p.type === 'mote') {
        p.y += p.vy;
        p.x += p.vx;
        if (p.y < -10) p.y = 620;
      } else if (p.type === 'mount_cloud') {
        p.x += p.vx;
        p.y += p.vy;
        p.radius += p.grow;
        p.alpha -= p.decay;
        if (p.alpha <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }
  }

  // 渲染底层特效 (流云)
  renderUnderlay(ctx, camera) {
    if (this.currentMapId === 'tiangong_palace' || this.currentMapId === 'tiangong_yuma') {
      ctx.save();
      this.cloudLayers.forEach(c => {
        const sx = c.x - camera.x * 0.3; // 视差滚动
        const sy = c.y - camera.y * 0.3;

        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, c.radius);
        grad.addColorStop(0, `rgba(255, 250, 230, ${c.alpha})`);
        grad.addColorStop(0.6, `rgba(230, 240, 255, ${c.alpha * 0.6})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, c.radius, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    }
  }

  // 渲染顶层覆盖特效 (花瓣、萤火虫、金光光柱)
  renderOverlay(ctx, camera) {
    ctx.save();

    // 1. 五行山真言封印的耀日冲天金光光柱
    if (this.currentMapId === 'wuxingshan') {
      const sealWorldX = 12 * 32 + 16;
      const sealWorldY = 3 * 32 + 16;
      const sx = sealWorldX - camera.x;
      const sy = sealWorldY - camera.y;

      const grad = ctx.createLinearGradient(sx, sy - 260, sx, sy);
      grad.addColorStop(0, 'rgba(255, 215, 0, 0)');
      grad.addColorStop(0.3, 'rgba(255, 230, 100, 0.45)');
      grad.addColorStop(1, 'rgba(255, 180, 0, 0.85)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(sx - 16, sy);
      ctx.lineTo(sx - 35, sy - 260);
      ctx.lineTo(sx + 35, sy - 260);
      ctx.lineTo(sx + 16, sy);
      ctx.closePath();
      ctx.fill();

      // 核心光核光晕
      const radGrad = ctx.createRadialGradient(sx, sy, 0, sx, sy, 40);
      radGrad.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
      radGrad.addColorStop(0.5, 'rgba(255, 200, 0, 0.5)');
      radGrad.addColorStop(1, 'rgba(255, 150, 0, 0)');
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(sx, sy, 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. 绘制普通粒子 (花瓣、萤火虫、踏云气团)
    this.particles.forEach(p => {
      const sx = p.x - camera.x;
      const sy = p.y - camera.y;

      // 踏云白烟
      if (p.type === 'mount_cloud') {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      // 蟠桃园飞花瓣
      else if (p.type === 'petal') {
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // 刘家村荧光萤火虫
      else if (p.type === 'firefly') {
        const glow = Math.sin(p.pulse) * 0.4 + 0.6;
        const rad = p.baseRadius * glow;

        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad * 3);
        g.addColorStop(0, `rgba(180, 255, 100, ${glow * 0.9})`);
        g.addColorStop(0.4, `rgba(120, 220, 60, ${glow * 0.4})`);
        g.addColorStop(1, 'rgba(100, 200, 40, 0)');

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, rad * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
      // 仙气微尘
      else if (p.type === 'mote') {
        ctx.fillStyle = `rgba(255, 235, 150, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }
}

export default ParticleSystem;
