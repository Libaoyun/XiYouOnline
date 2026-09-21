const fs = require('fs');
const filePath = 'js/engine/character.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. 在 drawModel 中更新分发逻辑
const oldDispatch = `    } else if (mId.includes('wukong') || mId.includes('sun_wukong') || mId.includes('monkey') || mId.includes('hou') || mId.includes('qitian')) {
      CharacterRenderer.drawSunWukong(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('bajie') || mId.includes('zhu_bajie') || mId.includes('zhuganglie') || mId.includes('pig') || mId.includes('tianpeng')) {
      CharacterRenderer.drawZhuBajie(ctx, by, animTimer, direction, isMoving);`;

const newDispatch = `    // 【高精模型精准分发】彻底杜绝全员套皮孙悟空/猪八戒/牛魔王！
    } else if (mId.includes('tianpeng_marshal') || (mId.includes('tianpeng') && !mId.includes('bajie') && !mId.includes('pig'))) {
      CharacterRenderer.drawTianpengMarshal(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('juling') || mId.includes('juling_shen')) {
      CharacterRenderer.drawJuLingShen(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('chimao') || mId.includes('mahou')) {
      CharacterRenderer.drawChiMaoMaHou(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('stone_monkey') || mId.includes('xiaohou') || mId.includes('huaguo_monkey') || (mId.includes('monkey') && !mId.includes('wukong')) || mId.includes('ape')) {
      CharacterRenderer.drawStoneMonkey(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('yecha') || mId.includes('ye_cha')) {
      CharacterRenderer.drawYeCha(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('wukong') || mId.includes('sun_wukong') || mId.includes('qitian') || mId.includes('super_wukong')) {
      CharacterRenderer.drawSunWukong(ctx, by, animTimer, direction, isMoving);
    } else if (mId.includes('bajie') || mId.includes('zhu_bajie') || mId.includes('zhuganglie') || mId.includes('pig')) {
      CharacterRenderer.drawZhuBajie(ctx, by, animTimer, direction, isMoving);`;

if (!content.includes(oldDispatch)) {
  console.error('Failed to find old dispatch block!');
  process.exit(1);
}
content = content.replace(oldDispatch, newDispatch);

// 2. 在 CharacterRenderer 末尾追加 5 个新方法
const methodsToAdd = `
  // =========================================================================
  // 【专属神相】天蓬元帅·天河水师大统帅 (银甲白袍、紫金战盔、手握元帅神槊、英姿勃发)
  // =========================================================================
  static drawTianpengMarshal(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.05, 1.05);

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.45) * 3 : 0;
    const capeWiggle = Math.sin(t * 0.25) * 4;

    // 0. 脚底战将阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, by + 14, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 大红织锦元帅披风 (随风猎猎作响)
    ctx.fillStyle = '#b91c1c';
    ctx.beginPath();
    ctx.moveTo(-6, by - 6);
    ctx.quadraticCurveTo(-14 + capeWiggle, by + 6, -11 + capeWiggle, by + 16);
    ctx.lineTo(8 + capeWiggle, by + 16);
    ctx.quadraticCurveTo(12 + capeWiggle, by + 6, 6, by - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 2. 双腿亮银战靴
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-6 + legMove, by + 5, 4.5, 9);
    ctx.fillRect(2 - legMove, by + 5, 4.5, 9);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-7 + legMove, by + 12, 6, 3);
    ctx.fillRect(1 - legMove, by + 12, 6, 3);

    // 3. 亮银重铠连环躯干
    const armorGrad = ctx.createLinearGradient(-8, by - 8, 8, by + 6);
    armorGrad.addColorStop(0, '#f8fafc');
    armorGrad.addColorStop(0.5, '#cbd5e1');
    armorGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.roundRect(-8, by - 7, 16, 14, 3);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 胸前护心镜 (水波灵光)
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(0, by - 1, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 4. 双肩金龙兽头吞肩
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-8, by - 5, 3.5, 0, Math.PI * 2);
    ctx.arc(8, by - 5, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 5. 元帅面庞与紫金金盔
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6, 0, Math.PI * 2);
    ctx.fill();

    // 英挺眉目
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-3, by - 15, 2, 1.2);
    ctx.fillRect(1, by - 15, 2, 1.2);

    // 紫金战盔
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(-6, by - 16);
    ctx.lineTo(0, by - 23);
    ctx.lineTo(6, by - 16);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    // 盔顶朱红长缨
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(0, by - 23);
    ctx.quadraticCurveTo(-4, by - 28, -6 + capeWiggle * 0.5, by - 22);
    ctx.lineTo(0, by - 22);
    ctx.closePath();
    ctx.fill();

    // 6. 手持元帅神槊 (长戟带银刃红缨)
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(11, by - 24);
    ctx.lineTo(11, by + 15);
    ctx.stroke();

    // 戟头刃尖
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(11, by - 28);
    ctx.lineTo(8, by - 21);
    ctx.lineTo(14, by - 21);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // 戟红缨
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(9, by - 21, 4, 3);

    ctx.restore();
  }

  // =========================================================================
  // 【专属神相】征讨先锋·巨灵神 (高大魁梧、金红重铠、威武开山双板斧、霸气赫赫)
  // =========================================================================
  static drawJuLingShen(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.2, 1.2); // 巨灵天将身材魁伟！

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.4) * 3.5 : 0;
    const axeSway = Math.sin(t * 0.2) * 2;

    // 0. 脚底沉稳黑影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, by + 15, 17, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 粗壮双腿与乌金战靴
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-7 + legMove, by + 6, 6, 9);
    ctx.fillRect(2 - legMove, by + 6, 6, 9);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-8 + legMove, by + 12, 7.5, 3.5);
    ctx.fillRect(1 - legMove, by + 12, 7.5, 3.5);

    // 2. 雄壮金红重铠 (横阔厚重)
    const armorGrad = ctx.createLinearGradient(-10, by - 10, 10, by + 6);
    armorGrad.addColorStop(0, '#c2410c');
    armorGrad.addColorStop(0.5, '#ea580c');
    armorGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = armorGrad;
    ctx.beginPath();
    ctx.roundRect(-10, by - 8, 20, 16, 4);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 兽面铜环护腰
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-7, by + 3, 14, 4);
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, by + 5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. 双肩巨型兽吞护肩
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(-11, by - 6, 4.5, 0, Math.PI * 2);
    ctx.arc(11, by - 6, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // 4. 刚毅先锋面容与虎须
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, by - 15, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // 怒目
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, by - 16, 2.5, 1.5);
    ctx.fillRect(1.5, by - 16, 2.5, 1.5);

    // 粗黑须髯
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.moveTo(-5, by - 12); ctx.lineTo(0, by - 7); ctx.lineTo(5, by - 12);
    ctx.fill();

    // 双凤战盔
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-7, by - 21, 14, 5);
    ctx.beginPath();
    ctx.moveTo(0, by - 26);
    ctx.lineTo(-4, by - 21);
    ctx.lineTo(4, by - 21);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-2, by - 26, 4, 3);

    // 5. 双持【宣花开山板斧】(霸气半月刃)
    // 左手斧
    ctx.save();
    ctx.translate(-13, by - 4 + axeSway);
    ctx.rotate(-0.35);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-1.5, -16, 3, 24);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(-4, -10, 8, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.lineTo(-1, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    // 右手斧
    ctx.save();
    ctx.translate(13, by - 4 - axeSway);
    ctx.rotate(0.35);
    ctx.fillStyle = '#475569';
    ctx.fillRect(-1.5, -16, 3, 24);
    ctx.fillStyle = '#cbd5e1';
    ctx.beginPath();
    ctx.arc(4, -10, 8, Math.PI * 0.6, Math.PI * 1.4);
    ctx.lineTo(1, -10);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 【专属怪相】花果山守山大将·赤毛马猴 (赤红灵毛、健硕神勇、手持熟铜木棍)
  // =========================================================================
  static drawChiMaoMaHou(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.05, 1.05);

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.45) * 3 : 0;
    const tailWag = Math.sin(t * 0.3) * 5;

    // 0. 脚底影子
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.beginPath();
    ctx.ellipse(0, by + 14, 13, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 赤红如火灵动长尾
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-6, by + 6);
    ctx.quadraticCurveTo(-14, by + 4, -15 + tailWag, by - 5);
    ctx.stroke();

    // 2. 矫健赤红双腿
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-5 + legMove, by + 5, 3.5, 8);
    ctx.fillRect(1 - legMove, by + 5, 3.5, 8);

    // 3. 赤色雄壮猿躯与青布战裙
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.roundRect(-7, by - 6, 14, 12, 3);
    ctx.fill();

    // 青翠战裙
    ctx.fillStyle = '#047857';
    ctx.fillRect(-7, by + 2, 14, 5);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(-8, by + 1, 16, 1.5);

    // 4. 赤毛马猴面庞与额前金睛
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(0, by - 12, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 桃形白粉脸圈
    ctx.fillStyle = '#fecdd3';
    ctx.beginPath();
    ctx.arc(-2, by - 12, 2.8, 0, Math.PI * 2);
    ctx.arc(2, by - 12, 2.8, 0, Math.PI * 2);
    ctx.arc(0, by - 9.5, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 灼灼金睛
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-2, by - 12, 1.2, 0, Math.PI * 2);
    ctx.arc(2, by - 12, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // 额前一撮威风赤炎冲天毫毛
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-2, by - 18);
    ctx.lineTo(0, by - 24);
    ctx.lineTo(2, by - 18);
    ctx.closePath();
    ctx.fill();

    // 5. 手握青木熟铜齐眉棍 (斜持身前)
    ctx.save();
    ctx.translate(6, by - 2);
    ctx.rotate(0.35);
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-1.5, -18, 3, 30);
    // 铜箍
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-2, -18, 4, 3);
    ctx.fillRect(-2, 9, 4, 3);
    ctx.restore();

    ctx.restore();
  }

  // =========================================================================
  // 【专属萌相】花果山巡山小石猴 / 受困小猴 (灵巧萌动、浅棕绒毛、摇尾灵巧)
  // =========================================================================
  static drawStoneMonkey(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 0.9, 0.9); // 小石猴身材灵巧娇小！

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.5) * 3 : 0;
    const tailBob = Math.sin(t * 0.35) * 6;

    // 0. 脚底小黑影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, by + 13, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 灵巧长尾翘起成弧
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-4, by + 4);
    ctx.quadraticCurveTo(-11, by - 2, -10 + tailBob, by - 12);
    ctx.stroke();

    // 2. 双腿
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-4 + legMove, by + 4, 3, 7);
    ctx.fillRect(1 - legMove, by + 4, 3, 7);

    // 3. 浑圆绒毛小身体
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(-6, by - 5, 12, 11, 4);
    ctx.fill();

    // 小猴肚皮
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(0, by + 1, 3.5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. 小猴圆脑庞与大耳朵
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.arc(0, by - 11, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // 灵动大圆耳
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(-5.5, by - 11, 2.2, 0, Math.PI * 2);
    ctx.arc(5.5, by - 11, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // 桃脸大眼睛
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, by - 10, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-1.5, by - 11, 1, 0, Math.PI * 2);
    ctx.arc(1.5, by - 11, 1, 0, Math.PI * 2);
    ctx.fill();

    // 桃红腮红
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.fillRect(-3, by - 9, 1.5, 1);
    ctx.fillRect(1.5, by - 9, 1.5, 1);

    ctx.restore();
  }

  // =========================================================================
  // 【专属怪相】东海之滨·巡海夜叉·李艮 (靛青鬼面、赤红卷发、亮银三叉戟、气势汹汹)
  // =========================================================================
  static drawYeCha(ctx, by, animTimer, direction, isMoving) {
    ctx.save();
    const flip = direction === 'left' ? -1 : 1;
    ctx.scale(flip * 1.1, 1.1);

    const t = animTimer;
    const legMove = isMoving ? Math.sin(t * 0.45) * 3 : 0;
    const forkTilt = Math.sin(t * 0.25) * 2;

    // 0. 脚底水汽幽影
    ctx.fillStyle = 'rgba(6, 78, 59, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, by + 14, 15, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 1. 青皮水妖双腿
    ctx.fillStyle = '#0e7490';
    ctx.fillRect(-5 + legMove, by + 5, 4, 8);
    ctx.fillRect(1 - legMove, by + 5, 4, 8);

    // 2. 靛青身躯与海兽皮战裙
    ctx.fillStyle = '#0891b2';
    ctx.beginPath();
    ctx.roundRect(-7, by - 7, 14, 13, 3);
    ctx.fill();

    // 龙鳞兽皮裙
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(-8, by + 1, 16, 5);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-8, by + 5, 16, 1.5);

    // 3. 凶煞夜叉青鬼面
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(0, by - 14, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 暴凸红瞳
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-2.5, by - 15, 1.8, 0, Math.PI * 2);
    ctx.arc(2.5, by - 15, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, by - 15.5, 1, 1);
    ctx.fillRect(3, by - 15.5, 1, 1);

    // 外翻獠牙
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(-3, by - 11); ctx.lineTo(-4, by - 13); ctx.lineTo(-2, by - 12);
    ctx.moveTo(3, by - 11); ctx.lineTo(4, by - 13); ctx.lineTo(2, by - 12);
    ctx.fill();

    // 狂乱倒竖赤红烈发
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-6, by - 16);
    ctx.lineTo(-4, by - 24);
    ctx.lineTo(0, by - 19);
    ctx.lineTo(4, by - 24);
    ctx.lineTo(6, by - 16);
    ctx.closePath();
    ctx.fill();

    // 4. 手持【亮银三叉戟】
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, by - 24 + forkTilt);
    ctx.lineTo(10, by + 15);
    ctx.stroke();

    // 三叉锋尖 (幽蓝寒光)
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(10, by - 30 + forkTilt); ctx.lineTo(7, by - 24 + forkTilt); ctx.lineTo(13, by - 24 + forkTilt);
    ctx.moveTo(5, by - 28 + forkTilt); ctx.lineTo(4, by - 22 + forkTilt); ctx.lineTo(7, by - 22 + forkTilt);
    ctx.moveTo(15, by - 28 + forkTilt); ctx.lineTo(16, by - 22 + forkTilt); ctx.lineTo(13, by - 22 + forkTilt);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
  }
`;

const lastBraceIdx = content.lastIndexOf('}');
content = content.slice(0, lastBraceIdx) + methodsToAdd + '\n}\n' + content.slice(lastBraceIdx + 1);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated js/engine/character.js with 5 new models and updated dispatch!');
