const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'assets', 'monsters');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

// 1. 青蛇 (xiaohua_she.svg) - 灵秀翡翠青蛇
const xiaohuaSheSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0d2b27"/>
      <stop offset="60%" stop-color="#051714"/>
      <stop offset="100%" stop-color="#020907"/>
    </radialGradient>
    <linearGradient id="jadeBody" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#5eead4"/>
      <stop offset="35%" stop-color="#14b8a6"/>
      <stop offset="70%" stop-color="#0f766e"/>
      <stop offset="100%" stop-color="#042f2e"/>
    </linearGradient>
    <linearGradient id="bellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ccfbf1"/>
      <stop offset="50%" stop-color="#99f6e4"/>
      <stop offset="100%" stop-color="#2dd4bf"/>
    </linearGradient>
    <radialGradient id="eyeGlow" cx="40%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="65%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </radialGradient>
    <radialGradient id="mistGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(45,212,191,0.25)"/>
      <stop offset="70%" stop-color="rgba(15,118,110,0.1)"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="512" height="512" rx="36" fill="url(#bgGrad)"/>
  <circle cx="256" cy="270" r="190" fill="url(#mistGlow)"/>

  <!-- Water Ripples & Lotus Rock -->
  <ellipse cx="256" cy="410" rx="180" ry="38" fill="#042f2e" opacity="0.6"/>
  <ellipse cx="256" cy="405" rx="140" ry="24" fill="#134e4a" opacity="0.4"/>
  <path d="M120 420 Q256 370 392 420 Q256 460 120 420 Z" fill="#1c2d2a" stroke="#2dd4bf" stroke-width="1.5" opacity="0.7"/>

  <!-- Snake Coils (Background layer) -->
  <path d="M140 370 C100 320 120 250 180 230 C240 210 320 240 350 300 C380 360 330 420 250 420 C180 420 130 380 150 340 C170 300 230 290 280 320 C320 344 320 380 270 390 C230 400 200 380 210 360"
        fill="none" stroke="url(#jadeBody)" stroke-width="48" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M140 370 C100 320 120 250 180 230 C240 210 320 240 350 300 C380 360 330 420 250 420 C180 420 130 380 150 340 C170 300 230 290 280 320 C320 344 320 380 270 390 C230 400 200 380 210 360"
        fill="none" stroke="url(#bellyGrad)" stroke-width="18" stroke-linecap="round" stroke-dasharray="14 10" opacity="0.85"/>

  <!-- Snake Upper Body & Neck Rising Up -->
  <path d="M220 320 C210 260 230 190 270 140 C285 120 310 100 310 75"
        fill="none" stroke="url(#jadeBody)" stroke-width="38" stroke-linecap="round"/>
  <path d="M226 315 C218 260 236 195 274 148 C287 130 310 105 310 80"
        fill="none" stroke="url(#bellyGrad)" stroke-width="14" stroke-linecap="round" stroke-dasharray="12 8" opacity="0.9"/>

  <!-- Snake Head (Majestic Viper Shape) -->
  <g transform="translate(305, 80) rotate(-22)">
    <!-- Horn/Crest Scales -->
    <path d="M-15 -35 Q-5 -45 5 -35 Q0 -25 -15 -35 Z" fill="#99f6e4" filter="url(#glow)"/>
    <!-- Head Base -->
    <path d="M-28 -15 Q-35 15 -18 35 Q0 55 18 35 Q35 15 28 -15 Q0 -32 -28 -15 Z" fill="url(#jadeBody)" stroke="#99f6e4" stroke-width="2"/>
    <path d="M-16 -10 Q0 -22 16 -10 Q0 35 -16 -10 Z" fill="#0f766e" opacity="0.6"/>

    <!-- Eyes -->
    <ellipse cx="-18" cy="2" rx="7" ry="5.5" fill="url(#eyeGlow)" filter="url(#glow)"/>
    <ellipse cx="18" cy="2" rx="7" ry="5.5" fill="url(#eyeGlow)" filter="url(#glow)"/>
    <!-- Vertical Slit Pupils -->
    <ellipse cx="-18" cy="2" rx="1.8" ry="4.8" fill="#18181b"/>
    <ellipse cx="18" cy="2" rx="1.8" ry="4.8" fill="#18181b"/>
    <!-- Eye Highlights -->
    <circle cx="-19" cy="0" r="1.5" fill="#ffffff"/>
    <circle cx="17" cy="0" r="1.5" fill="#ffffff"/>

    <!-- Snout & Nostrils -->
    <circle cx="-5" cy="28" r="1.5" fill="#042f2e"/>
    <circle cx="5" cy="28" r="1.5" fill="#042f2e"/>

    <!-- Forked Red Tongue -->
    <path d="M0 38 Q-2 52 0 62 Q-8 72 -14 78 M0 62 Q8 72 14 78" fill="none" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
  </g>

  <!-- Spirit Sparkles & Floating Jade Runes -->
  <circle cx="160" cy="180" r="3" fill="#5eead4" filter="url(#glow)"/>
  <circle cx="380" cy="220" r="4" fill="#a7f3d0" filter="url(#glow)"/>
  <circle cx="120" cy="290" r="2.5" fill="#5eead4"/>
  <circle cx="390" cy="350" r="3.5" fill="#99f6e4"/>

  <!-- Ornate Border Frame -->
  <rect x="12" y="12" width="488" height="488" rx="28" fill="none" stroke="#2dd4bf" stroke-width="3" opacity="0.65"/>
  <rect x="18" y="18" width="476" height="476" rx="22" fill="none" stroke="#fef08a" stroke-width="1.2" opacity="0.8"/>

  <!-- Seal Badge -->
  <g transform="translate(48, 52)">
    <rect x="-24" y="-16" width="60" height="32" rx="6" fill="#064e3b" stroke="#34d399" stroke-width="1.5"/>
    <text x="6" y="6" font-family="sans-serif" font-size="16" font-weight="bold" fill="#ecfdf5" text-anchor="middle">青 蛇</text>
  </g>
</svg>`;

// 2. 蛇妖 (sheyao.svg) - 幻化毒芒蛇妖
const sheyaoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bgSheyao" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#2e1065"/>
      <stop offset="55%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#090514"/>
    </radialGradient>
    <linearGradient id="purpleScales" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="40%" stop-color="#9333ea"/>
      <stop offset="80%" stop-color="#581c87"/>
      <stop offset="100%" stop-color="#3b0764"/>
    </linearGradient>
    <radialGradient id="venomGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e879f9"/>
      <stop offset="70%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <filter id="purpleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="36" fill="url(#bgSheyao)"/>
  <circle cx="256" cy="256" r="180" fill="url(#venomGlow)" opacity="0.35"/>

  <!-- Giant Cobra Hood & Lower Tail Coil -->
  <path d="M120 440 C80 360 160 300 240 330 C320 360 410 320 400 420 C390 480 200 480 120 440 Z"
        fill="url(#purpleScales)" stroke="#e879f9" stroke-width="2.5"/>

  <!-- Cobra Hood Spread -->
  <path d="M150 170 C100 220 130 330 200 350 C240 360 272 360 312 350 C382 330 412 220 362 170 C330 130 182 130 150 170 Z"
        fill="url(#purpleScales)" stroke="#a855f7" stroke-width="3"/>
  <ellipse cx="256" cy="245" rx="52" ry="75" fill="#3b0764" stroke="#c084fc" stroke-width="2"/>
  <!-- Hood Eyespots (Menacing Pattern) -->
  <ellipse cx="190" cy="230" rx="22" ry="34" fill="#581c87" stroke="#f43f5e" stroke-width="2.5"/>
  <circle cx="190" cy="230" r="10" fill="#f43f5e" filter="url(#purpleGlow)"/>
  <ellipse cx="322" cy="230" rx="22" ry="34" fill="#581c87" stroke="#f43f5e" stroke-width="2.5"/>
  <circle cx="322" cy="230" r="10" fill="#f43f5e" filter="url(#purpleGlow)"/>

  <!-- Head & Crown -->
  <path d="M210 150 Q256 95 302 150 Q310 180 286 210 Q256 225 226 210 Q202 180 210 150 Z"
        fill="#f3e8ff" stroke="#9333ea" stroke-width="2.5"/>

  <!-- Dark Headdress & Horns -->
  <path d="M210 135 Q190 70 220 50 Q240 90 256 110 Q272 90 292 50 Q322 70 302 135 Z"
        fill="#581c87" stroke="#e879f9" stroke-width="2"/>
  <polygon points="256,40 248,65 264,65" fill="#f43f5e" filter="url(#purpleGlow)"/>

  <!-- Demon Eyes -->
  <ellipse cx="236" cy="165" rx="8" ry="6" fill="#f43f5e" filter="url(#purpleGlow)"/>
  <ellipse cx="276" cy="165" rx="8" ry="6" fill="#f43f5e" filter="url(#purpleGlow)"/>
  <line x1="236" y1="160" x2="236" y2="170" stroke="#2e1065" stroke-width="2.5"/>
  <line x1="276" y1="160" x2="276" y2="170" stroke="#2e1065" stroke-width="2.5"/>

  <!-- Fangs & Mouth -->
  <path d="M242 195 Q256 200 270 195" fill="none" stroke="#581c87" stroke-width="2"/>
  <polygon points="244,195 248,206 250,195" fill="#ffffff"/>
  <polygon points="268,195 264,206 262,195" fill="#ffffff"/>

  <!-- Venom Orbs Floating -->
  <circle cx="120" cy="130" r="7" fill="#a855f7" filter="url(#purpleGlow)"/>
  <circle cx="390" cy="140" r="9" fill="#c084fc" filter="url(#purpleGlow)"/>
  <circle cx="380" cy="380" r="6" fill="#f43f5e" filter="url(#purpleGlow)"/>

  <!-- Border Frame -->
  <rect x="12" y="12" width="488" height="488" rx="28" fill="none" stroke="#a855f7" stroke-width="3" opacity="0.75"/>
  <rect x="18" y="18" width="476" height="476" rx="22" fill="none" stroke="#f43f5e" stroke-width="1.2" opacity="0.8"/>

  <g transform="translate(48, 52)">
    <rect x="-24" y="-16" width="60" height="32" rx="6" fill="#4c1d95" stroke="#c084fc" stroke-width="1.5"/>
    <text x="6" y="6" font-family="sans-serif" font-size="16" font-weight="bold" fill="#fdf4ff" text-anchor="middle">蛇 妖</text>
  </g>
</svg>`;

// 3. 巡山野狼 (wolf_wild.svg) - 苍野雪岭孤狼
const wolfWildSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bgWolf" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="furGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="45%" stop-color="#475569"/>
      <stop offset="85%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="wolfEye" cx="40%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </radialGradient>
    <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="36" fill="url(#bgWolf)"/>

  <!-- Mountain Peak Silhouette & Cold Moon -->
  <circle cx="390" cy="110" r="54" fill="#e2e8f0" opacity="0.15"/>
  <path d="M0 430 L160 340 L280 390 L400 320 L512 400 L512 512 L0 512 Z" fill="#090d16"/>

  <!-- Wolf Torso & Mane -->
  <path d="M120 480 C110 370 170 290 256 260 C342 290 402 370 392 480 Z"
        fill="url(#furGrad)" stroke="#64748b" stroke-width="2"/>
  <!-- Chest White Fur Ruffs -->
  <path d="M210 320 Q256 380 230 460 Q256 410 270 460 Q285 380 302 320 Q256 345 210 320 Z"
        fill="#e2e8f0" opacity="0.9"/>

  <!-- Pointed Ears -->
  <polygon points="175,200 135,90 215,140" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="180,185 155,115 205,145" fill="#f1f5f9" opacity="0.7"/>

  <polygon points="337,200 377,90 297,140" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="332,185 357,115 307,145" fill="#f1f5f9" opacity="0.7"/>

  <!-- Wolf Head Shape -->
  <path d="M185 180 Q256 130 327 180 Q340 235 296 265 L256 295 L216 265 Q172 235 185 180 Z"
        fill="url(#furGrad)" stroke="#94a3b8" stroke-width="2.5"/>

  <!-- Forehead Ridge & Snout -->
  <path d="M226 185 L256 160 L286 185 L276 250 L256 265 L236 250 Z" fill="#1e293b"/>
  <!-- Black Nose Leather -->
  <path d="M242 255 Q256 248 270 255 Q256 270 242 255 Z" fill="#020617"/>

  <!-- Piercing Cyan Eyes -->
  <polygon points="208,198 232,192 230,204 212,206" fill="url(#wolfEye)" filter="url(#cyanGlow)"/>
  <polygon points="304,198 280,192 282,204 300,206" fill="url(#wolfEye)" filter="url(#cyanGlow)"/>
  <circle cx="220" cy="199" r="2" fill="#ffffff"/>
  <circle cx="292" cy="199" r="2" fill="#ffffff"/>

  <!-- Menacing Snarl & Fangs -->
  <path d="M232 272 Q256 280 280 272" fill="none" stroke="#0f172a" stroke-width="3"/>
  <polygon points="236,272 240,285 244,272" fill="#ffffff"/>
  <polygon points="276,272 272,285 268,272" fill="#ffffff"/>

  <!-- Whiskers -->
  <line x1="210" y1="250" x2="160" y2="245" stroke="#cbd5e1" stroke-width="1.2" opacity="0.6"/>
  <line x1="210" y1="256" x2="155" y2="262" stroke="#cbd5e1" stroke-width="1.2" opacity="0.6"/>
  <line x1="302" y1="250" x2="352" y2="245" stroke="#cbd5e1" stroke-width="1.2" opacity="0.6"/>
  <line x1="302" y1="256" x2="357" y2="262" stroke="#cbd5e1" stroke-width="1.2" opacity="0.6"/>

  <!-- Border Frame -->
  <rect x="12" y="12" width="488" height="488" rx="28" fill="none" stroke="#38bdf8" stroke-width="2.5" opacity="0.65"/>
  <rect x="18" y="18" width="476" height="476" rx="22" fill="none" stroke="#94a3b8" stroke-width="1.2" opacity="0.8"/>

  <g transform="translate(68, 52)">
    <rect x="-44" y="-16" width="90" height="32" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="1" y="6" font-family="sans-serif" font-size="15" font-weight="bold" fill="#f8fafc" text-anchor="middle">巡山野狼</text>
  </g>
</svg>`;

// 4. 啸月狼妖 (langyao.svg) - 啸月狂暴狼妖战将
const langyaoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bgLangyao" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#450a0a"/>
      <stop offset="50%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#09090b"/>
    </radialGradient>
    <linearGradient id="silverFur" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="45%" stop-color="#94a3b8"/>
      <stop offset="85%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <radialGradient id="bloodEye" cx="45%" cy="45%" r="50%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </radialGradient>
    <filter id="redAura" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="36" fill="url(#bgLangyao)"/>

  <!-- Full Crimson Blood Moon -->
  <circle cx="256" cy="170" r="110" fill="#dc2626" opacity="0.35" filter="url(#redAura)"/>
  <circle cx="256" cy="170" r="95" fill="#991b1b" opacity="0.6"/>

  <!-- Armored Shoulders & Spikes -->
  <path d="M110 490 C100 370 170 320 256 310 C342 320 412 370 402 490 Z" fill="#18181b"/>
  <!-- Iron Pauldrons with Spikes -->
  <polygon points="100,380 60,320 130,340" fill="#78350f" stroke="#f59e0b" stroke-width="2"/>
  <polygon points="412,380 452,320 382,340" fill="#78350f" stroke="#f59e0b" stroke-width="2"/>
  <!-- Bone Necklace -->
  <path d="M190 350 Q256 410 322 350" fill="none" stroke="#e2e8f0" stroke-width="6" stroke-dasharray="14 12"/>

  <!-- Howling Wolf Head Silhouette & Mane -->
  <path d="M160 210 Q256 120 352 210 Q370 290 310 320 L256 345 L202 320 Q142 290 160 210 Z"
        fill="url(#silverFur)" stroke="#e2e8f0" stroke-width="2.5"/>

  <!-- Extended Howling Snout -->
  <path d="M220 220 L256 150 L292 220 L275 285 L256 300 L237 285 Z" fill="#0f172a"/>
  <polygon points="256,140 244,165 268,165" fill="#09090b"/>

  <!-- Ears with Battle Scars -->
  <polygon points="170,180 115,70 205,120" fill="#475569" stroke="#cbd5e1" stroke-width="2"/>
  <polygon points="342,180 397,70 307,120" fill="#475569" stroke="#cbd5e1" stroke-width="2"/>
  <line x1="135" y1="100" x2="155" y2="120" stroke="#ef4444" stroke-width="2"/>

  <!-- Burning Blood Eyes -->
  <ellipse cx="218" cy="208" rx="10" ry="7" fill="url(#bloodEye)" filter="url(#redAura)"/>
  <ellipse cx="294" cy="208" rx="10" ry="7" fill="url(#bloodEye)" filter="url(#redAura)"/>
  <circle cx="218" cy="208" r="2.5" fill="#fef08a"/>
  <circle cx="294" cy="208" r="2.5" fill="#fef08a"/>

  <!-- Bared Teeth & Roaring Jaws -->
  <path d="M232 290 Q256 302 280 290" fill="none" stroke="#dc2626" stroke-width="3"/>
  <polygon points="234,290 238,306 244,290" fill="#f8fafc"/>
  <polygon points="278,290 274,306 268,290" fill="#f8fafc"/>
  <polygon points="248,292 252,304 256,292" fill="#f8fafc"/>
  <polygon points="264,292 260,304 256,292" fill="#f8fafc"/>

  <!-- Bloody Slashing Claws in Foreground -->
  <path d="M120 460 L140 400 L160 460" stroke="#f59e0b" stroke-width="4" fill="none"/>
  <path d="M352 460 L372 400 L392 460" stroke="#f59e0b" stroke-width="4" fill="none"/>

  <!-- Border Frame -->
  <rect x="12" y="12" width="488" height="488" rx="28" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.8"/>
  <rect x="18" y="18" width="476" height="476" rx="22" fill="none" stroke="#f59e0b" stroke-width="1.2" opacity="0.8"/>

  <g transform="translate(68, 52)">
    <rect x="-44" y="-16" width="90" height="32" rx="6" fill="#7f1d1d" stroke="#f87171" stroke-width="1.5"/>
    <text x="1" y="6" font-family="sans-serif" font-size="15" font-weight="bold" fill="#fef2f2" text-anchor="middle">啸月狼妖</text>
  </g>
</svg>`;

// 5. 嗜血树妖 (shuyao.svg) - 幽暗血藤树魔
const shuyaoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <radialGradient id="bgShuyao" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#3b0764"/>
      <stop offset="60%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#030712"/>
    </radialGradient>
    <linearGradient id="bloodWood" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7f1d1d"/>
      <stop offset="40%" stop-color="#450a0a"/>
      <stop offset="80%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#0c0a09"/>
    </linearGradient>
    <radialGradient id="crimsonEye" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="60%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <filter id="bloodGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="512" height="512" rx="36" fill="url(#bgShuyao)"/>

  <!-- Creepy Twisted Branches Backdrop -->
  <path d="M256 280 Q140 160 80 80 Q130 140 180 200 Q120 100 90 40" fill="none" stroke="#450a0a" stroke-width="12" stroke-linecap="round"/>
  <path d="M256 280 Q372 160 432 80 Q382 140 332 200 Q392 100 422 40" fill="none" stroke="#450a0a" stroke-width="12" stroke-linecap="round"/>

  <!-- Main Demon Tree Trunk with Screaming Face -->
  <path d="M160 500 C150 360 180 280 220 220 C240 190 272 190 292 220 C332 280 362 360 352 500 Z"
        fill="url(#bloodWood)" stroke="#991b1b" stroke-width="3"/>

  <!-- Twisted Root Claws Grasping Ground -->
  <path d="M170 450 Q110 480 60 500" stroke="#7f1d1d" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M342 450 Q402 480 452 500" stroke="#7f1d1d" stroke-width="16" fill="none" stroke-linecap="round"/>
  <path d="M220 470 Q200 500 160 512" stroke="#450a0a" stroke-width="14" fill="none"/>
  <path d="M292 470 Q312 500 352 512" stroke="#450a0a" stroke-width="14" fill="none"/>

  <!-- Glowing Blood Eyes in Tree Trunk -->
  <ellipse cx="225" cy="275" rx="14" ry="10" fill="url(#crimsonEye)" filter="url(#bloodGlow)"/>
  <ellipse cx="287" cy="275" rx="14" ry="10" fill="url(#crimsonEye)" filter="url(#bloodGlow)"/>
  <circle cx="225" cy="275" r="4" fill="#fef08a"/>
  <circle cx="287" cy="275" r="4" fill="#fef08a"/>

  <!-- Agonized Demon Maw in Bark -->
  <path d="M210 340 Q256 315 302 340 Q315 395 256 410 Q197 395 210 340 Z" fill="#090514" stroke="#ef4444" stroke-width="2.5"/>
  <!-- Sharp Wooden Teeth -->
  <polygon points="220,340 226,358 232,340" fill="#fecaca"/>
  <polygon points="240,336 246,360 252,336" fill="#fecaca"/>
  <polygon points="260,336 266,360 272,336" fill="#fecaca"/>
  <polygon points="280,340 286,358 292,340" fill="#fecaca"/>
  <polygon points="230,395 236,375 242,395" fill="#fecaca"/>
  <polygon points="270,395 276,375 282,395" fill="#fecaca"/>

  <!-- Blood Thorns & Vines Wrapped Around -->
  <path d="M150 420 Q256 380 360 440" stroke="#dc2626" stroke-width="5" fill="none"/>
  <polygon points="200,402 208,390 214,402" fill="#ef4444"/>
  <polygon points="300,406 308,394 314,406" fill="#ef4444"/>

  <!-- Spectral Floating Will-o'-Wisps -->
  <circle cx="130" cy="190" r="8" fill="#ef4444" filter="url(#bloodGlow)"/>
  <circle cx="390" cy="180" r="9" fill="#f87171" filter="url(#bloodGlow)"/>
  <circle cx="370" cy="280" r="6" fill="#dc2626" filter="url(#bloodGlow)"/>

  <!-- Border Frame -->
  <rect x="12" y="12" width="488" height="488" rx="28" fill="none" stroke="#ef4444" stroke-width="3" opacity="0.75"/>
  <rect x="18" y="18" width="476" height="476" rx="22" fill="none" stroke="#fca5a5" stroke-width="1.2" opacity="0.8"/>

  <g transform="translate(68, 52)">
    <rect x="-44" y="-16" width="90" height="32" rx="6" fill="#450a0a" stroke="#f87171" stroke-width="1.5"/>
    <text x="1" y="6" font-family="sans-serif" font-size="15" font-weight="bold" fill="#fef2f2" text-anchor="middle">嗜血树妖</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(outDir, 'xiaohua_she.svg'), xiaohuaSheSvg.trim());
fs.writeFileSync(path.join(outDir, 'sheyao.svg'), sheyaoSvg.trim());
fs.writeFileSync(path.join(outDir, 'wolf_wild.svg'), wolfWildSvg.trim());
fs.writeFileSync(path.join(outDir, 'langyao.svg'), langyaoSvg.trim());
fs.writeFileSync(path.join(outDir, 'shuyao.svg'), shuyaoSvg.trim());

console.log('Successfully created SVGs in assets/monsters/');
