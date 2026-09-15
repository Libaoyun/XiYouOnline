/**
 * 汉风西游 - 国风水墨高精度角色立绘与头像系统 (Portraits)
 * 彻底告别 Emoji！为西游神话角色打造精致水墨半身立绘、金边头像与战斗胸像
 */

class PortraitSystem {
  constructor() {
    this.cache = {};
  }

  // 获取角色的标准 SVG 立绘/头像
  getPortraitSvg(roleId, size = 64) {
    const key = `${roleId}_${size}`;
    if (this.cache[key]) return this.cache[key];

    let content = '';

    switch (roleId) {
      // === 1. 威灵显赫大将军 (主角天将形态) ===
      case 'heaven_general':
      case 'player_heaven':
        content = `
          <!-- 背景金光霞彩 -->
          <circle cx="50" cy="50" r="45" fill="radial-gradient(#ffeaa7, #d35400)"/>
          <defs>
            <radialGradient id="grad_hg" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stop-color="#fff9e6"/>
              <stop offset="70%" stop-color="#f39c12"/>
              <stop offset="100%" stop-color="#d35400"/>
            </radialGradient>
            <linearGradient id="armor_gold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#fff176"/>
              <stop offset="50%" stop-color="#ffd54f"/>
              <stop offset="100%" stop-color="#ffb300"/>
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#grad_hg)" stroke="#ffd700" stroke-width="3"/>
          <!-- 殷红战袍披风 -->
          <path d="M20,68 Q10,95 18,100 L82,100 Q90,95 80,68 Z" fill="#b71540"/>
          <!-- 金锁子战甲胸甲与护心镜 -->
          <path d="M28,64 L50,56 L72,64 L68,96 L32,96 Z" fill="url(#armor_gold)" stroke="#b8860b" stroke-width="1.5"/>
          <circle cx="50" cy="76" r="9" fill="#ffffff" stroke="#d4af37" stroke-width="2"/>
          <circle cx="50" cy="76" r="4" fill="#64b5f6"/>
          <!-- 威武神将面庞 -->
          <ellipse cx="50" cy="44" rx="13" ry="15" fill="#fbd38d"/>
          <!-- 金翅紫金天将盔 -->
          <path d="M34,42 Q50,22 66,42 Q72,28 50,18 Q28,28 34,42 Z" fill="#ffd700" stroke="#b8860b" stroke-width="1.5"/>
          <path d="M48,18 L52,18 L50,8 Z" fill="#ff1744"/>
          <!-- 飘逸红缨 -->
          <path d="M50,8 Q60,4 66,14 Q58,12 50,16 Z" fill="#d50000"/>
          <!-- 浓眉双目英挺 -->
          <path d="M42,42 L47,43" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/>
          <path d="M58,42 L53,43" stroke="#2c3e50" stroke-width="2" stroke-linecap="round"/>
          <circle cx="44.5" cy="46" r="1.8" fill="#1a202c"/>
          <circle cx="55.5" cy="46" r="1.8" fill="#1a202c"/>
        `;
        break;

      // === 2. 齐天大圣孙悟空 ===
      case 'sun_wukong':
      case 'wukong':
      case 'qitian_dasheng':
        content = `
          <defs>
            <radialGradient id="grad_wk" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffe082"/>
              <stop offset="80%" stop-color="#ff8f00"/>
              <stop offset="100%" stop-color="#bf360c"/>
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#grad_wk)" stroke="#ffd700" stroke-width="3"/>
          <!-- 虎皮战甲围领 -->
          <path d="M24,68 L50,58 L76,68 L72,98 L28,98 Z" fill="#f57c00" stroke="#e65100" stroke-width="1.5"/>
          <path d="M35,74 L42,78 L34,84" stroke="#3e2723" stroke-width="2" fill="none"/>
          <path d="M65,74 L58,78 L66,84" stroke="#3e2723" stroke-width="2" fill="none"/>
          <!-- 美猴王金毫猴面 -->
          <ellipse cx="50" cy="46" rx="14" ry="14" fill="#d79860"/>
          <path d="M42,39 Q50,44 58,39 Q50,56 42,39 Z" fill="#ffb74d"/>
          <!-- 凤翅紫金冠金箍 -->
          <path d="M34,36 Q50,28 66,36 L66,40 Q50,33 34,40 Z" fill="#ffd700" stroke="#e65100" stroke-width="1.5"/>
          <!-- 两根凌霄飞舞的雉鸡翎 -->
          <path d="M46,30 Q30,6 18,14 Q34,16 46,32" stroke="#d50000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M54,30 Q70,6 82,14 Q66,16 54,32" stroke="#d50000" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- 火眼金睛金色神光 -->
          <ellipse cx="44" cy="46" rx="2.5" ry="3" fill="#ffea00" stroke="#d50000" stroke-width="0.8"/>
          <circle cx="44" cy="46" r="1.2" fill="#d50000"/>
          <ellipse cx="56" cy="46" rx="2.5" ry="3" fill="#ffea00" stroke="#d50000" stroke-width="0.8"/>
          <circle cx="56" cy="46" r="1.2" fill="#d50000"/>
          <!-- 自信傲骨猴吻 -->
          <path d="M45,54 Q50,57 55,54" stroke="#bf360c" stroke-width="1.5" fill="none"/>
        `;
        break;

      // === 3. 太白金星 (天庭仙宿) ===
      case 'taibai':
      case 'npc_taibai':
        content = `
          <defs>
            <radialGradient id="grad_tb" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff"/>
              <stop offset="70%" stop-color="#b0bec5"/>
              <stop offset="100%" stop-color="#455a64"/>
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#grad_tb)" stroke="#eceff1" stroke-width="3"/>
          <!-- 白鹤仙袍道服 -->
          <path d="M22,70 L50,60 L78,70 L75,100 L25,100 Z" fill="#f5f6fa" stroke="#b0bec5" stroke-width="1.5"/>
          <!-- 慈眉善目长者面容 -->
          <ellipse cx="50" cy="44" rx="13" ry="14" fill="#ffecb3"/>
          <!-- 飘逸银白长髯 -->
          <path d="M42,50 Q50,86 58,50 Q54,78 50,84 Q46,78 42,50 Z" fill="#ffffff" stroke="#cfd8dc" stroke-width="1"/>
          <!-- 慈祥笑目 -->
          <path d="M42,43 Q46,40 48,43" stroke="#37474f" stroke-width="1.8" fill="none"/>
          <path d="M52,43 Q54,40 58,43" stroke="#37474f" stroke-width="1.8" fill="none"/>
          <!-- 太极纯阳道冠 -->
          <path d="M38,34 Q50,20 62,34 Z" fill="#78909c" stroke="#37474f" stroke-width="1.2"/>
          <circle cx="50" cy="30" r="3" fill="#ffffff" stroke="#ffd700" stroke-width="1"/>
          <!-- 白玉拂尘掠影 -->
          <path d="M72,40 Q84,30 90,45" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round"/>
        `;
        break;

      // === 4. 巨灵神天将 (Boss) ===
      case 'heavenly_boss':
      case 'juling':
        content = `
          <defs>
            <radialGradient id="grad_jl" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ff8a65"/>
              <stop offset="70%" stop-color="#d84315"/>
              <stop offset="100%" stop-color="#3e2723"/>
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" fill="url(#grad_jl)" stroke="#ffab00" stroke-width="3"/>
          <!-- 铜甲重铠 -->
          <path d="M16,66 L50,56 L84,66 L78,100 L22,100 Z" fill="#4e342e" stroke="#ffb300" stroke-width="2"/>
          <rect x="36" y="70" width="28" height="20" fill="#3e2723" stroke="#ffd54f" stroke-width="1.5"/>
          <!-- 巨灵神威严刚毅古铜面庞 -->
          <ellipse cx="50" cy="42" rx="16" ry="17" fill="#d7ccc8"/>
          <!-- 浓黑重髯与怒发 -->
          <path d="M34,42 Q30,64 50,66 Q70,64 66,42 Z" fill="#212121"/>
          <!-- 开山神盔重铠 -->
          <path d="M30,34 Q50,16 70,34 L68,40 Q50,26 32,40 Z" fill="#ffb300" stroke="#ff6f00" stroke-width="1.8"/>
          <polygon points="50,12 55,26 45,26" fill="#d50000"/>
          <!-- 铜铃怒目 -->
          <circle cx="43" cy="42" r="3.5" fill="#ffffff" stroke="#000" stroke-width="1"/>
          <circle cx="43" cy="42" r="1.8" fill="#d50000"/>
          <circle cx="57" cy="42" r="3.5" fill="#ffffff" stroke="#000" stroke-width="1"/>
          <circle cx="57" cy="42" r="1.8" fill="#d50000"/>
          <!-- 宣花开山巨斧斧刃掠影 -->
          <path d="M10,20 Q24,10 26,35 Q12,38 10,20 Z" fill="#cfd8dc" stroke="#455a64" stroke-width="1.5"/>
        `;
        break;

      // === 5. 托塔李天王 ===
      case 'litianwang':
      case 'npc_litianwang':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#ffe082, #b71540)" stroke="#ffd700" stroke-width="3"/>
          <!-- 降魔帅袍金甲 -->
          <path d="M22,66 L50,56 L78,66 L74,100 L26,100 Z" fill="#c2185b" stroke="#ffd700" stroke-width="1.8"/>
          <ellipse cx="50" cy="44" rx="13" ry="14" fill="#ffecb3"/>
          <!-- 三绺美髯黑须 -->
          <path d="M43,49 Q50,75 57,49 Z" fill="#263238"/>
          <!-- 凤翅帅盔 -->
          <path d="M34,36 Q50,22 66,36 L64,40 Q50,30 36,40 Z" fill="#ffd700" stroke="#ff8f00" stroke-width="1.5"/>
          <!-- 掌中三十三天黄金玲珑宝塔 -->
          <path d="M72,45 L82,45 L80,35 L84,35 L82,25 L80,25 L77,16 L74,25 L72,25 L74,35 L70,35 Z" fill="#ffd700" stroke="#ff6f00" stroke-width="1.2"/>
        `;
        break;

      // === 6. 镇山太保刘伯钦 ===
      case 'liu_boqin':
      case 'npc_liuboqin':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#ffcc80, #5d4037)" stroke="#8d6e63" stroke-width="3"/>
          <!-- 虎皮坎肩短褐 -->
          <path d="M24,68 L50,58 L76,68 L72,100 L28,100 Z" fill="#e65100" stroke="#3e2723" stroke-width="1.5"/>
          <path d="M38,72 L44,78" stroke="#212121" stroke-width="2"/>
          <path d="M62,72 L56,78" stroke="#212121" stroke-width="2"/>
          <!-- 猎户豪迈黑里透红容颜 -->
          <ellipse cx="50" cy="44" rx="14" ry="15" fill="#d7a15c"/>
          <!-- 猎户包头巾 -->
          <path d="M34,38 Q50,26 66,38 L68,44 Q50,36 32,44 Z" fill="#455a64" stroke="#263238" stroke-width="1.5"/>
          <circle cx="44" cy="46" r="1.8" fill="#212121"/>
          <circle cx="56" cy="46" r="1.8" fill="#212121"/>
          <!-- 猎叉精钢尖芒 -->
          <line x1="20" y1="15" x2="20" y2="70" stroke="#cfd8dc" stroke-width="2.5"/>
          <polygon points="20,10 16,22 24,22" fill="#eceff1"/>
        `;
        break;

      // === 7. 玄奘法师 (唐僧) ===
      case 'xuanzang':
      case 'tang_seng':
      case 'npc_xuanzang':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#ffcdd2, #c62828)" stroke="#ffd700" stroke-width="3"/>
          <!-- 锦斓袈裟红底金网 -->
          <path d="M22,68 L50,58 L78,68 L75,100 L25,100 Z" fill="#b71c1c" stroke="#ffd700" stroke-width="2"/>
          <line x1="30" y1="75" x2="70" y2="75" stroke="#ffd700" stroke-width="1.5"/>
          <line x1="50" y1="60" x2="50" y2="95" stroke="#ffd700" stroke-width="1.5"/>
          <!-- 慈悲高僧圣容 -->
          <ellipse cx="50" cy="44" rx="13" ry="14" fill="#ffe0b2"/>
          <!-- 毗卢僧帽三尖宝冠 -->
          <path d="M36,36 L50,16 L64,36 L62,40 L38,40 Z" fill="#d32f2f" stroke="#ffd700" stroke-width="1.5"/>
          <circle cx="50" cy="28" r="2.5" fill="#ffd700"/>
          <!-- 垂眸慈念 -->
          <path d="M43,45 Q46,48 48,45" stroke="#3e2723" stroke-width="1.5" fill="none"/>
          <path d="M52,45 Q54,48 57,45" stroke="#3e2723" stroke-width="1.5" fill="none"/>
        `;
        break;

      // === 8. 观音菩萨 ===
      case 'guanyin':
      case 'npc_guanyin':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#e0f7fa, #00838f)" stroke="#ffd700" stroke-width="3"/>
          <!-- 佛光净莲 -->
          <circle cx="50" cy="45" r="36" fill="none" stroke="#ffd54f" stroke-width="2" stroke-dasharray="4,2"/>
          <!-- 白衣大士法袍 -->
          <path d="M24,68 L50,56 L76,68 L72,100 L28,100 Z" fill="#ffffff" stroke="#80deea" stroke-width="1.5"/>
          <!-- 庄严法相 -->
          <ellipse cx="50" cy="42" rx="13" ry="15" fill="#fff8e1"/>
          <!-- 祥云佛冠与白纱巾 -->
          <path d="M34,36 Q50,18 66,36 Q70,70 66,80 L34,80 Q30,70 34,36 Z" fill="#f5f5f5" opacity="0.9"/>
          <circle cx="50" cy="30" r="3" fill="#ffd700"/>
          <circle cx="50" cy="40" r="1.5" fill="#d50000"/> <!-- 眉心朱砂痣 -->
          <!-- 清净玉净瓶与杨柳枝 -->
          <path d="M74,55 Q78,50 82,55 L81,72 L75,72 Z" fill="#e0f2f1" stroke="#26a69a" stroke-width="1"/>
          <path d="M78,50 Q86,40 84,32" stroke="#4caf50" stroke-width="2" fill="none"/>
        `;
        break;

      // === 9. 双叉岭恶狼 ===
      case 'mob_wolf_1':
      case 'wolf':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#90a4ae, #263238)" stroke="#546e7a" stroke-width="3"/>
          <!-- 恶狼身躯 -->
          <path d="M26,72 L50,58 L74,72 L70,98 L30,98 Z" fill="#455a64"/>
          <!-- 凶残狼首 -->
          <polygon points="50,22 68,44 50,60 32,44" fill="#37474f"/>
          <!-- 尖耳 -->
          <polygon points="32,40 28,24 40,32" fill="#263238"/>
          <polygon points="68,40 72,24 60,32" fill="#263238"/>
          <!-- 幽绿兽瞳 -->
          <polygon points="40,40 46,42 42,45" fill="#76ff03"/>
          <polygon points="60,40 54,42 58,45" fill="#76ff03"/>
          <!-- 獠牙口吻 -->
          <polygon points="48,52 50,56 52,52" fill="#ffffff"/>
        `;
        break;

      // === 10. 西海龙三太子·小白龙敖烈 (白龙马) ===
      case 'xiaobailong':
      case 'bailongma':
      case 'boss_xiaobailong':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#e1f5fe, #0288d1)" stroke="#81d4fa" stroke-width="3"/>
          <!-- 白龙银鳞战袍 -->
          <path d="M22,66 L50,56 L78,66 L74,100 L26,100 Z" fill="#ffffff" stroke="#b0bec5" stroke-width="1.5"/>
          <line x1="50" y1="56" x2="50" y2="100" stroke="#ffd700" stroke-width="2"/>
          <!-- 俊朗龙族太子面庞 -->
          <ellipse cx="50" cy="42" rx="13" ry="14" fill="#fff8e1"/>
          <!-- 剔透雪白珊瑚龙角 -->
          <path d="M36,32 Q26,14 30,8 Q34,16 38,26" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <path d="M64,32 Q74,14 70,8 Q66,16 62,26" stroke="#ffffff" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- 飘逸银白龙须与长发 -->
          <path d="M38,36 Q22,46 20,68" stroke="#eceff1" stroke-width="2" fill="none"/>
          <path d="M62,36 Q78,46 80,68" stroke="#eceff1" stroke-width="2" fill="none"/>
          <circle cx="44" cy="44" r="2" fill="#0277bd"/>
          <circle cx="56" cy="44" r="2" fill="#0277bd"/>
        `;
        break;

      // === 11. 天蓬元帅·猪八戒 (猪刚鬣) ===
      case 'zhu_bajie':
      case 'bajie':
      case 'boss_bajie':
      case 'boss_zhuganglie':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#ffccbc, #bf360c)" stroke="#d84315" stroke-width="3"/>
          <!-- 宽大皂黑道袍 -->
          <path d="M16,66 L50,58 L84,66 L78,100 L22,100 Z" fill="#212121" stroke="#ffb74d" stroke-width="1.8"/>
          <!-- 憨厚凶猛黑面肥头 -->
          <ellipse cx="50" cy="44" rx="18" ry="16" fill="#8d6e63"/>
          <!-- 蒲扇大耳 -->
          <ellipse cx="26" cy="44" rx="8" ry="14" fill="#6d4c41"/>
          <ellipse cx="74" cy="44" rx="8" ry="14" fill="#6d4c41"/>
          <!-- 拱地长猪鼻吻 -->
          <ellipse cx="50" cy="48" rx="8" ry="6" fill="#a1887f" stroke="#4e342e" stroke-width="1.5"/>
          <circle cx="47" cy="48" r="1.8" fill="#3e2723"/>
          <circle cx="53" cy="48" r="1.8" fill="#3e2723"/>
          <!-- 两道雪亮獠牙 -->
          <polygon points="40,54 36,44 42,48" fill="#ffffff"/>
          <polygon points="60,54 64,44 58,48" fill="#ffffff"/>
          <!-- 九齿钉耙齿芒掠影 -->
          <line x1="80" y1="15" x2="80" y2="70" stroke="#cfd8dc" stroke-width="3"/>
          <line x1="72" y1="20" x2="88" y2="20" stroke="#ffd700" stroke-width="3"/>
          <line x1="73" y1="12" x2="73" y2="20" stroke="#cfd8dc" stroke-width="1.5"/>
          <line x1="77" y1="12" x2="77" y2="20" stroke="#cfd8dc" stroke-width="1.5"/>
          <line x1="81" y1="12" x2="81" y2="20" stroke="#cfd8dc" stroke-width="1.5"/>
          <line x1="85" y1="12" x2="85" y2="20" stroke="#cfd8dc" stroke-width="1.5"/>
        `;
        break;

      // === 12. 卷帘大将·沙和尚 (沙悟净) ===
      case 'sha_wujing':
      case 'shaseng':
      case 'boss_shaseng':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#b2dfdb, #004d40)" stroke="#00796b" stroke-width="3"/>
          <!-- 黄道袍与金锁甲 -->
          <path d="M20,68 L50,58 L80,68 L76,100 L24,100 Z" fill="#fbc02d" stroke="#f57f17" stroke-width="2"/>
          <!-- 青靛脸面相刚正凶毅 -->
          <ellipse cx="50" cy="42" rx="15" ry="16" fill="#4db6ac"/>
          <!-- 一头蓬松红焰烈发与红髯 -->
          <path d="M28,34 Q50,10 72,34 Q80,60 70,66 Q50,72 30,66 Q20,60 28,34 Z" fill="#d84315" opacity="0.85"/>
          <ellipse cx="50" cy="42" rx="13" ry="14" fill="#4db6ac"/>
          <!-- 项下所挂九个取经人骷髅念珠 -->
          <circle cx="34" cy="74" r="4.5" fill="#f5f5f5" stroke="#212121" stroke-width="1"/>
          <circle cx="42" cy="80" r="4.5" fill="#f5f5f5" stroke="#212121" stroke-width="1"/>
          <circle cx="50" cy="82" r="5" fill="#f5f5f5" stroke="#212121" stroke-width="1"/>
          <circle cx="58" cy="80" r="4.5" fill="#f5f5f5" stroke="#212121" stroke-width="1"/>
          <circle cx="66" cy="74" r="4.5" fill="#f5f5f5" stroke="#212121" stroke-width="1"/>
          <!-- 降妖宝杖乌木月牙金光 -->
          <path d="M15,20 Q12,30 20,40" stroke="#ffd700" stroke-width="3" fill="none"/>
        `;
        break;

      // === 13. 黄风岭·巡山虎先锋 ===
      case 'hu_xianfeng':
      case 'boss_hu_xianfeng':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#ffe082, #e65100)" stroke="#ff6f00" stroke-width="3"/>
          <path d="M22,70 L50,60 L78,70 L74,100 L26,100 Z" fill="#5d4037"/>
          <!-- 白额斑斓猛虎首 -->
          <ellipse cx="50" cy="44" rx="16" ry="15" fill="#ffb74d"/>
          <!-- 额头天然“王”字黑纹 -->
          <path d="M42,28 L58,28 M44,32 L56,32 M40,36 L60,36 M50,28 L50,36" stroke="#212121" stroke-width="1.8"/>
          <!-- 虎耳与金睛 -->
          <polygon points="32,36 28,20 40,28" fill="#ff9800"/>
          <polygon points="68,36 72,20 60,28" fill="#ff9800"/>
          <circle cx="42" cy="46" r="2.5" fill="#ffeb3b"/>
          <circle cx="42" cy="46" r="1.2" fill="#d50000"/>
          <circle cx="58" cy="46" r="2.5" fill="#ffeb3b"/>
          <circle cx="58" cy="46" r="1.2" fill="#d50000"/>
          <polygon points="46,55 50,60 54,55" fill="#ffffff"/>
        `;
        break;

      // === 14. 八百里黄风大圣·黄风怪 ===
      case 'huangfeng_guai':
      case 'boss_huangfeng':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#fff59d, #f57f17)" stroke="#ffd600" stroke-width="3"/>
          <!-- 金貂皮披风与金盔金甲 -->
          <path d="M20,66 L50,56 L80,66 L76,100 L24,100 Z" fill="#fbc02d" stroke="#bf360c" stroke-width="2"/>
          <ellipse cx="50" cy="42" rx="14" ry="14" fill="#ffe082"/>
          <!-- 灵貂利齿双目喷射三昧神风 -->
          <circle cx="43" cy="42" r="3" fill="#ff5722"/>
          <circle cx="57" cy="42" r="3" fill="#ff5722"/>
          <!-- 三昧神风呼啸漫天黄沙环绕 -->
          <path d="M12,45 Q26,35 45,30 Q30,60 15,65" stroke="#ffe082" stroke-width="2" fill="none" opacity="0.8"/>
          <path d="M88,45 Q74,35 55,30 Q70,60 85,65" stroke="#ffe082" stroke-width="2" fill="none" opacity="0.8"/>
        `;
        break;

      // === 15. 浮屠山·乌巢禅师 ===
      case 'wuchao_chanshi':
      case 'npc_wuchao':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#e1bee7, #4a148c)" stroke="#ba68c8" stroke-width="3"/>
          <!-- 乌巢仙羽仙衣 -->
          <path d="M22,68 L50,58 L78,68 L74,100 L26,100 Z" fill="#f3e5f5" stroke="#7b1fa2" stroke-width="1.5"/>
          <ellipse cx="50" cy="42" rx="13" ry="14" fill="#ffecb3"/>
          <!-- 祥光满顶，道骨仙风 -->
          <circle cx="50" cy="26" r="8" fill="none" stroke="#ffd700" stroke-width="1.5" stroke-dasharray="3,1"/>
          <!-- 慈眉微合传授多心经 -->
          <path d="M42,43 Q46,40 48,43" stroke="#4a148c" stroke-width="1.8" fill="none"/>
          <path d="M52,43 Q54,40 58,43" stroke="#4a148c" stroke-width="1.8" fill="none"/>
          <!-- 仙桧乌巢树枝环抱 -->
          <path d="M16,80 Q50,96 84,80" stroke="#5d4037" stroke-width="4" fill="none"/>
        `;
        break;

      // === 16. 万寿山五庄观·地仙之祖镇元子 ===
      case 'zhenyuanzi':
      case 'boss_zhenyuanzi':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#e8f5e9, #1b5e20)" stroke="#ffd700" stroke-width="3"/>
          <!-- 玉清鹤氅，日月星辰袍 -->
          <path d="M18,66 L50,56 L82,66 L78,100 L22,100 Z" fill="#2e7d32" stroke="#ffd700" stroke-width="2"/>
          <ellipse cx="50" cy="42" rx="14" ry="15" fill="#ffecb3"/>
          <!-- 五绺长髯，仙风道骨，与天地同寿 -->
          <path d="M42,50 Q50,86 58,50 Z" fill="#37474f"/>
          <!-- 紫金莲花冠 -->
          <path d="M36,32 L50,14 L64,32 Z" fill="#ffd700" stroke="#f57f17" stroke-width="1.5"/>
          <circle cx="50" cy="22" r="3" fill="#00e676"/>
          <!-- 神通“袖里乾坤”虚空旋转金光金轮 -->
          <circle cx="78" cy="74" r="14" fill="none" stroke="#ffd700" stroke-width="2" stroke-dasharray="6,3"/>
          <circle cx="78" cy="74" r="8" fill="#1b5e20"/>
        `;
        break;

      // === 17. 白虎岭·白骨夫人 (三打白骨精) ===
      case 'baigu_jing':
      case 'boss_baigujing':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#cfd8dc, #263238)" stroke="#eceff1" stroke-width="3"/>
          <!-- 惨白素衣幽魂裙 -->
          <path d="M22,66 L50,56 L78,66 L74,100 L26,100 Z" fill="#eceff1" stroke="#37474f" stroke-width="1.5"/>
          <!-- 阴冷艳丽绝美面相与白骨隐现 -->
          <ellipse cx="50" cy="42" rx="12" ry="14" fill="#f5f5f5"/>
          <!-- 幽冥冷眸，眉眼含煞 -->
          <path d="M41,40 L48,42" stroke="#b71c1c" stroke-width="1.8"/>
          <path d="M59,40 L52,42" stroke="#b71c1c" stroke-width="1.8"/>
          <circle cx="45" cy="43" r="1.5" fill="#7b1fa2"/>
          <circle cx="55" cy="43" r="1.5" fill="#7b1fa2"/>
          <!-- 乌黑云鬓插白骨珊瑚簪 -->
          <path d="M34,34 Q50,18 66,34 Z" fill="#212121"/>
          <line x1="30" y1="26" x2="70" y2="26" stroke="#ffffff" stroke-width="2"/>
          <polygon points="70,26 75,23 75,29" fill="#e0e0e0"/>
        `;
        break;

      // === 18. 宝象国波月洞·奎木狼 (黄袍怪) ===
      case 'huangpao_guai':
      case 'boss_huangpao':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#fff9c4, #e65100)" stroke="#f57f17" stroke-width="3"/>
          <!-- 宽大明黄锦袍，星宿煞气 -->
          <path d="M18,66 L50,56 L82,66 L76,100 L24,100 Z" fill="#fbc02d" stroke="#d84315" stroke-width="2"/>
          <ellipse cx="50" cy="42" rx="15" ry="16" fill="#ffcc80"/>
          <!-- 奎宿青面獠牙凶相 -->
          <path d="M30,36 Q50,14 70,36 L68,44 Q50,30 32,44 Z" fill="#5d4037"/>
          <circle cx="43" cy="42" r="2.5" fill="#ff1744"/>
          <circle cx="57" cy="42" r="2.5" fill="#ff1744"/>
          <polygon points="41,52 38,44 44,48" fill="#ffffff"/>
          <polygon points="59,52 62,44 56,48" fill="#ffffff"/>
          <!-- 奎木狼星宿图腾伴身 -->
          <circle cx="20" cy="30" r="2.5" fill="#ffd700"/>
          <circle cx="80" cy="30" r="2.5" fill="#ffd700"/>
        `;
        break;

      // === 19. 灵台方寸山·斜月三星洞菩提祖师 ===
      case 'puti_zushi':
      case 'npc_puti':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#e0f2f1, #004d40)" stroke="#ffd700" stroke-width="3"/>
          <!-- 三清仙袍 -->
          <path d="M20,66 L50,56 L80,66 L76,100 L24,100 Z" fill="#00695c" stroke="#ffd700" stroke-width="1.8"/>
          <ellipse cx="50" cy="42" rx="13" ry="15" fill="#fff8e1"/>
          <!-- 祖师飘逸雪白仙须 -->
          <path d="M42,50 Q50,90 58,50 Z" fill="#ffffff"/>
          <!-- 斜月三星道簪与星河玄光 -->
          <path d="M36,30 Q50,18 64,30 Z" fill="#ffd700"/>
          <!-- 三星弧月 -->
          <path d="M42,20 Q50,12 58,20" stroke="#ffffff" stroke-width="1.5" fill="none"/>
          <circle cx="45" cy="15" r="1.5" fill="#ffd700"/>
          <circle cx="50" cy="13" r="1.5" fill="#ffd700"/>
          <circle cx="55" cy="15" r="1.5" fill="#ffd700"/>
        `;
        break;

      // === 20. 凡间失忆行者 (主角被贬凡间后) ===
      default:
      case 'mortal_wanderer':
      case 'player_mortal':
        content = `
          <circle cx="50" cy="50" r="46" fill="radial-gradient(#b0bec5, #37474f)" stroke="#78909c" stroke-width="3"/>
          <!-- 粗布青衣麻绳束腰 -->
          <path d="M26,68 L50,58 L74,68 L70,100 L30,100 Z" fill="#455a64" stroke="#263238" stroke-width="1.5"/>
          <rect x="35" y="76" width="30" height="4" fill="#ffb74d"/>
          <!-- 行者英武面容 -->
          <ellipse cx="50" cy="44" rx="13" ry="14" fill="#fbd38d"/>
          <!-- 束发方巾 -->
          <path d="M36,36 Q50,24 64,36 L62,40 Q50,32 38,40 Z" fill="#37474f" stroke="#212121" stroke-width="1.2"/>
          <circle cx="50" cy="24" r="3" fill="#263238"/>
          <!-- 坚毅双目 -->
          <circle cx="44" cy="44" r="1.8" fill="#212121"/>
          <circle cx="56" cy="44" r="1.8" fill="#212121"/>
        `;
        break;
    }

    const svgHtml = `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="display:block;border-radius:50%;">${content}</svg>`;
    this.cache[key] = svgHtml;
    return svgHtml;
  }
}

window.Portraits = new PortraitSystem();
