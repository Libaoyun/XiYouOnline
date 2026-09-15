/**
 * 汉风西游 - 摄像机视角跟随引擎 (Camera)
 */
class Camera {
  constructor(viewportWidth, viewportHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.x = 0;
    this.y = 0;
  }

  resize(w, h) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  follow(targetWorldX, targetWorldY, mapPixelWidth, mapPixelHeight) {
    let targetX = targetWorldX - this.viewportWidth / 2;
    let targetY = targetWorldY - this.viewportHeight / 2;

    const maxX = Math.max(0, mapPixelWidth - this.viewportWidth);
    const maxY = Math.max(0, mapPixelHeight - this.viewportHeight);

    this.x = Math.max(0, Math.min(targetX, maxX));
    this.y = Math.max(0, Math.min(targetY, maxY));
  }

  screenToWorld(screenX, screenY) {
    return {
      x: screenX + this.x,
      y: screenY + this.y
    };
  }

  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x,
      y: worldY - this.y
    };
  }
}

export default Camera;
