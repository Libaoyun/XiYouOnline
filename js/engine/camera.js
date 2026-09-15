/**
 * 汉风西游 - 摄像机视角跟随引擎 (Camera)
 * 平滑追踪玩家坐标，限制不超出世界地图边缘
 */

class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.x = 0;
    this.y = 0;
  }

  // 更新视口尺寸
  resize(w, h) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  // 平滑或直接跟随目标
  follow(targetWorldX, targetWorldY, mapPixelWidth, mapPixelHeight) {
    // 目标居中
    let targetX = targetWorldX - this.viewportWidth / 2;
    let targetY = targetWorldY - this.viewportHeight / 2;

    // 边界约束
    const maxX = Math.max(0, mapPixelWidth - this.viewportWidth);
    const maxY = Math.max(0, mapPixelHeight - this.viewportHeight);

    this.x = Math.max(0, Math.min(targetX, maxX));
    this.y = Math.max(0, Math.min(targetY, maxY));
  }

  // 屏幕坐标 -> 世界坐标
  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  // 世界坐标 -> 屏幕坐标
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }
}

window.Camera = Camera;
