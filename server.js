/**
 * 汉风西游 - 本地极速开发与游戏服务器 (Zero-Dependency Node Server)
 * 无需等待脆弱庞大的 npm 下载管道，零依赖瞬间启动，一键在浏览器畅玩！
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 5173;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    // 允许跨域
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    if (reqPath === '/' || reqPath === '') {
      reqPath = '/index.html';
    }

    let filePath = path.join(ROOT_DIR, reqPath);

    // 安全检查，防止路径穿越
    if (!filePath.startsWith(ROOT_DIR)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('403 访问被拒绝');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(`404 资源未找到: ${reqPath}`);
        return;
      }

      const contentType = getContentType(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, post-check=0, pre-check=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      });

      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ 端口 ${port} 已被占用，正在自动切换至 ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('服务器启动异常:', err);
    }
  });

  server.listen(port, () => {
    const url = `http://localhost:${port}`;
    console.log('\n======================================================');
    console.log('       🎋 汉风西游OL · 正统2D神话复刻版');
    console.log('======================================================');
    console.log(`  🌟 游戏本地服务已极速就绪！`);
    console.log(`  🔗 本地访问地址: \x1b[36m${url}\x1b[0m`);
    console.log(`  🎮 控制方式:`);
    console.log(`     • 走动移动: [W/A/S/D] 或 [↑/↓/←/→] 或 屏幕虚拟摇杆`);
    console.log(`     • 对话互动: [空格键 Space] 或 [按键 5]`);
    console.log(`     • 坐骑骑乘: [按键 7] 上下马 / [按键 3] 驯养`);
    console.log(`     • 蟠桃采摘: [按键 1] 蟠桃胜境每日吃桃升级`);
    console.log('======================================================\n');

    // 桌面端或受限环境可能禁止拉起浏览器；服务本身应始终可用。
    if (process.env.XIYOU_OPEN_BROWSER === '1') {
      const openCmd = process.platform === 'win32' ? `start ${url}` : (process.platform === 'darwin' ? `open ${url}` : `xdg-open ${url}`);
      try {
        exec(openCmd, (error) => {
          if (error) console.log(`💡 请在浏览器中手动打开地址: ${url}`);
        });
      } catch (error) {
        console.log(`💡 当前环境不允许自动打开浏览器，请访问: ${url}`);
      }
    }
  });
}

startServer(PORT);
