/**
 * 汉风西游 - A* 避障自动寻路与智能交互引擎 (PathfindingEngine)
 * 实现：
 * 1. 经典网格 A* 启发式算法，自动绕过云海、天柱、修竹、水流与山岩阻挡
 * 2. 智能目标判定：若点击在 NPC / 传送门上，自动寻路至其身旁可行走格，到达后自动触发交互！
 * 3. 若点击在空地上，自动寻路并在地面产生金色仙气涟漪波纹
 * 4. 键盘随时打断自动寻路
 */

class PathfindingEngine {
  constructor(tileSize = 32) {
    this.tileSize = tileSize;
  }

  // 计算像素坐标对应的网格坐标
  worldToTile(x, y) {
    return {
      tx: Math.floor(x / this.tileSize),
      ty: Math.floor(y / this.tileSize)
    };
  }

  // 计算网格中心对应的世界像素坐标
  tileToWorld(tx, ty) {
    return {
      x: tx * this.tileSize + this.tileSize / 2,
      y: ty * this.tileSize + this.tileSize / 2
    };
  }

  // 寻找目标周围最近的可行走格子 (用于点击NPC时走到NPC身旁)
  findNearestWalkableTile(mapData, tilemapEngine, targetTx, targetTy, startTx, startTy) {
    if (tilemapEngine.isWalkable(mapData, targetTx, targetTy)) {
      return { tx: targetTx, ty: targetTy };
    }

    const offsets = [
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
      { dx: 1, dy: 1 }
    ];

    let bestTile = null;
    let bestDist = Infinity;

    for (const off of offsets) {
      const nx = targetTx + off.dx;
      const ny = targetTy + off.dy;
      if (tilemapEngine.isWalkable(mapData, nx, ny)) {
        const d = Math.hypot(nx - startTx, ny - startTy);
        if (d < bestDist) {
          bestDist = d;
          bestTile = { tx: nx, ty: ny };
        }
      }
    }

    return bestTile;
  }

  // A* 寻路核心算法
  findPath(mapData, tilemapEngine, startPixelX, startPixelY, targetPixelX, targetPixelY) {
    const start = this.worldToTile(startPixelX, startPixelY);
    let target = this.worldToTile(targetPixelX, targetPixelY);

    if (start.tx === target.tx && start.ty === target.ty) {
      return [];
    }

    // 如果目标本身不可行走，寻找邻近可行走瓦片
    target = this.findNearestWalkableTile(mapData, tilemapEngine, target.tx, target.ty, start.tx, start.ty);
    if (!target) return [];

    const openSet = [];
    const closedSet = new Set();

    const nodeKey = (tx, ty) => `${tx},${ty}`;

    const startNode = {
      tx: start.tx,
      ty: start.ty,
      g: 0,
      h: Math.abs(target.tx - start.tx) + Math.abs(target.ty - start.ty),
      f: 0,
      parent: null
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);
    const openSetMap = new Map();
    openSetMap.set(nodeKey(start.tx, start.ty), startNode);

    const neighbors = [
      { dx: 0, dy: -1 },
      { dx: 0, dy: 1 },
      { dx: -1, dy: 0 },
      { dx: 1, dy: 0 }
    ];

    let iterations = 0;
    const maxIterations = 1500; // 防止复杂地图死循环

    while (openSet.length > 0 && iterations < maxIterations) {
      iterations++;

      // 取出 f 最小的节点
      let lowestIndex = 0;
      for (let i = 1; i < openSet.length; i++) {
        if (openSet[i].f < openSet[lowestIndex].f) {
          lowestIndex = i;
        }
      }

      const current = openSet.splice(lowestIndex, 1)[0];
      const curKey = nodeKey(current.tx, current.ty);
      openSetMap.delete(curKey);
      closedSet.add(curKey);

      // 到达目的地
      if (current.tx === target.tx && current.ty === target.ty) {
        const path = [];
        let curr = current;
        while (curr) {
          path.push(this.tileToWorld(curr.tx, curr.ty));
          curr = curr.parent;
        }
        path.reverse();
        // 移除起点自身
        if (path.length > 0) path.shift();
        return path;
      }

      for (const offset of neighbors) {
        const nx = current.tx + offset.dx;
        const ny = current.ty + offset.dy;
        const nKey = nodeKey(nx, ny);

        if (closedSet.has(nKey)) continue;
        if (!tilemapEngine.isWalkable(mapData, nx, ny)) continue;

        const gScore = current.g + 1;
        let neighborNode = openSetMap.get(nKey);

        if (!neighborNode) {
          neighborNode = {
            tx: nx,
            ty: ny,
            g: gScore,
            h: Math.abs(target.tx - nx) + Math.abs(target.ty - ny),
            f: 0,
            parent: current
          };
          neighborNode.f = neighborNode.g + neighborNode.h;
          openSet.push(neighborNode);
          openSetMap.set(nKey, neighborNode);
        } else if (gScore < neighborNode.g) {
          neighborNode.g = gScore;
          neighborNode.f = neighborNode.g + neighborNode.h;
          neighborNode.parent = current;
        }
      }
    }

    return []; // 未找到通路
  }
}

window.PathfindingEngine = PathfindingEngine;
