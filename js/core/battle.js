/**
 * 汉风西游 - 左右阵营回合制战斗引擎 (BattleEngine 2.0)
 * 严格支持：
 * 1. 左右阵营布局：左侧对方阵营，右侧己方阵营(玩家+最多3出战仙宠)
 * 2. 速度决序标记：全场存活单位按速度排序，头顶标注 ①②③ 行动序号
 * 3. 依序指令下达：普攻、技能(指定目标)、药品、替换仙宠(限仙宠，保留残血状态)、招降野怪
 * 4. 野怪招降：普通80%、散仙消耗银葫芦70%、金仙消耗金葫芦60%
 * 5. 全面抗性结算：抗普攻、抗舍生、抗雷霆、抗飞沙、抗三昧、抗封印、抗定身
 */
class BattleEngine {
  constructor(player, activePets = [], enemies = [], options = {}) {
    this.player = player;
    // 确保 activePets 为数组（最多3只，根据玩家等级）
    const maxPets = player.getMaxCombatPets ? player.getMaxCombatPets() : 1;
    this.activePets = (Array.isArray(activePets) ? activePets : (activePets ? [activePets] : [])).slice(0, maxPets);
    this.enemies = enemies; // 敌方单位数组
    this.options = options;

    this.round = 1;
    this.status = 'player_input'; // 'player_input' | 'executing' | 'victory' | 'defeat' | 'escaped'
    this.logs = [];

    // 己方出战单位实体包装
    this.allies = [];
    this.rebuildAllies();

    // 敌方单位状态初始化
    this.enemies.forEach((e, idx) => {
      e.enemyIndex = idx;
      e.buffs = e.buffs || [];
      e.maxHp = e.maxHp || e.hp;
      e.maxMp = e.maxMp || e.mp || 100;
      e.quality = e.quality || 'ordinary';
    });

    // 临时指令集
    this.actions = {}; // key: ally.id -> action
    this.turnQueue = []; // 全场速度队列

    // 计算初始速度序数
    this.calcTurnOrders();
  }

  // 安全访问接口
  get playerBuffs() {
    const player = this.allies.find(a => a.isPlayer);
    return player ? (player.buffs || []) : [];
  }

  get enemyBuffs() {
    return this.enemies.map(e => e.buffs || []);
  }

  setPlayerAction(action) {
    const player = this.allies.find(a => a.isPlayer);
    if (player) {
      this.setAllyAction(player.id, action);
    }
  }

  log(msg) {
    this.logs.push(msg);
  }

  // 重构己方战斗阵列
  rebuildAllies() {
    this.allies = [
      {
        id: 'player',
        type: 'player',
        name: this.player.name,
        isPlayer: true,
        entity: this.player,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
        mp: this.player.mp,
        maxMp: this.player.maxMp,
        spd: this.player.spd,
        buffs: []
      }
    ];

    this.activePets.forEach((pet, idx) => {
      if (pet) {
        this.allies.push({
          id: 'pet_' + idx,
          type: 'pet',
          petIndex: idx,
          name: pet.name,
          isPlayer: false,
          entity: pet,
          hp: pet.hp,
          maxHp: pet.maxHp,
          mp: pet.mp,
          maxMp: pet.maxMp,
          spd: pet.spd,
          skills: pet.skills || [],
          buffs: []
        });
      }
    });
  }

  // 同步血量与蓝量至真实数据对象
  syncStateBack() {
    // 玩家
    const pAlly = this.allies.find(a => a.isPlayer);
    if (pAlly) {
      this.player.hp = Math.max(0, Math.min(this.player.maxHp, pAlly.hp));
      this.player.mp = Math.max(0, Math.min(this.player.maxMp, pAlly.mp));
    }
    // 仙宠
    this.allies.filter(a => a.type === 'pet').forEach(a => {
      if (a.entity) {
        a.entity.hp = Math.max(0, Math.min(a.entity.maxHp, a.hp));
        a.entity.mp = Math.max(0, Math.min(a.entity.maxMp, a.mp));
      }
    });
  }

  // 计算全场行动顺序序数 (①, ②, ③, ④...)
  calcTurnOrders() {
    const aliveUnits = [];

    // 存活己方
    this.allies.forEach(a => {
      if (a.hp > 0) {
        aliveUnits.push({
          unit: a,
          side: 'ally',
          spd: a.spd,
          id: a.id,
          name: a.name
        });
      }
    });

    // 存活敌方
    this.enemies.forEach(e => {
      if (e.hp > 0) {
        aliveUnits.push({
          unit: e,
          side: 'enemy',
          spd: e.spd,
          id: 'enemy_' + e.enemyIndex,
          name: e.name
        });
      }
    });

    // 按速度从大到小排序
    aliveUnits.sort((u1, u2) => u2.spd - u1.spd);

    // 分配序号
    aliveUnits.forEach((item, index) => {
      item.turnOrder = index + 1;
      item.unit.turnOrder = index + 1;
    });

    this.turnQueue = aliveUnits;
  }

  // 获取尚未输入指令的己方单位列表
  getPendingAllyInputs() {
    return this.allies
      .filter(a => a.hp > 0 && !this.actions[a.id])
      .sort((a1, a2) => (a1.turnOrder || 99) - (a2.turnOrder || 99));
  }

  // 为某个己方单位设置指令
  setAllyAction(allyId, action) {
    this.actions[allyId] = action;
  }

  // 替换仙宠（仅仙宠单位可用，玩家不可替换）
  switchPet(allyId, newPetInstanceId, availablePets = []) {
    const ally = this.allies.find(a => a.id === allyId);
    if (!ally || ally.isPlayer) {
      return { success: false, msg: '玩家本尊不可被替换，仅仙宠可替换出战！' };
    }

    const targetPet = availablePets.find(p => p.instanceId === newPetInstanceId);
    if (!targetPet) {
      return { success: false, msg: '随行仙宠不存在！' };
    }

    // 先把被换下的仙宠保存当前血量
    if (ally.entity) {
      ally.entity.hp = ally.hp;
      ally.entity.mp = ally.mp;
    }

    // 替换为新仙宠 (保留其原有的血量和法力)
    ally.entity = targetPet;
    ally.name = targetPet.name;
    ally.hp = targetPet.hp;
    ally.maxHp = targetPet.maxHp;
    ally.mp = targetPet.mp;
    ally.maxMp = targetPet.maxMp;
    ally.spd = targetPet.spd;
    ally.skills = targetPet.skills || [];
    ally.buffs = [];

    // 更新 activePets 数组
    if (this.activePets[ally.petIndex]) {
      this.activePets[ally.petIndex] = targetPet;
    }

    // 重新排序速度
    this.calcTurnOrders();

    this.log(`【仙宠降临】一道金芒闪烁，灵宠【${targetPet.name}】奉诏入场参战！(当前HP: ${targetPet.hp}/${targetPet.maxHp})`);
    return {
      success: true,
      msg: `成功将【${targetPet.name}】召唤出战！`
    };
  }

  getAliveEnemies() {
    return this.enemies.filter(e => e.hp > 0);
  }

  getAliveAllies() {
    return this.allies.filter(a => a.hp > 0);
  }

  // 检查战斗结束
  checkBattleEnd() {
    const aliveEnemies = this.getAliveEnemies();
    const aliveAllies = this.getAliveAllies();

    if (aliveEnemies.length === 0) {
      this.status = 'victory';
      this.syncStateBack();
      return true;
    }

    const playerAlive = this.allies.some(a => a.isPlayer && a.hp > 0);
    if (!playerAlive) {
      this.status = 'defeat';
      this.syncStateBack();
      return true;
    }

    return false;
  }

  // 执行整个回合
  async executeRound(onStepCallback) {
    this.status = 'executing';

    // 1. 为敌方单位自动生成 AI 决策
    const enemyActions = {};
    this.enemies.forEach(enemy => {
      if (enemy.hp > 0) {
        const aliveAllies = this.getAliveAllies();
        if (aliveAllies.length > 0) {
          const targetAlly = aliveAllies[Math.floor(Math.random() * aliveAllies.length)];
          if (enemy.skills && enemy.skills.length > 0 && Math.random() < 0.45) {
            enemyActions['enemy_' + enemy.enemyIndex] = {
              type: 'skill',
              skill: enemy.skills[0],
              targetId: targetAlly.id
            };
          } else {
            enemyActions['enemy_' + enemy.enemyIndex] = {
              type: 'attack',
              targetId: targetAlly.id
            };
          }
        }
      }
    });

    // 2. 按照全场速度降序执行
    const queue = [...this.turnQueue].sort((a, b) => {
      let spdA = a.spd;
      let spdB = b.spd;
      const actA = a.side === 'ally' ? this.actions[a.id] : enemyActions[a.id];
      const actB = b.side === 'ally' ? this.actions[b.id] : enemyActions[b.id];
      if (actA && actA.type === 'flee') spdA += 9999;
      if (actB && actB.type === 'flee') spdB += 9999;
      if (actA && actA.type === 'item') spdA += 5000;
      if (actB && actB.type === 'item') spdB += 5000;
      return spdB - spdA;
    });

    for (const actor of queue) {
      if (this.checkBattleEnd()) break;

      if (actor.side === 'ally') {
        const ally = this.allies.find(a => a.id === actor.id);
        if (ally && ally.hp > 0) {
          const act = this.actions[ally.id] || { type: 'attack', targetIndex: 0 };
          await this.handleAllyTurn(ally, act, onStepCallback);
        }
      } else {
        const enemy = this.enemies.find(e => 'enemy_' + e.enemyIndex === actor.id);
        if (enemy && enemy.hp > 0) {
          const act = enemyActions[actor.id] || { type: 'attack', targetId: 'player' };
          await this.handleEnemyTurn(enemy, act, onStepCallback);
        }
      }
    }

    // 3. 回合末毒素/持续恢复结算
    this.syncStateBack();

    if (this.checkBattleEnd()) {
      return this.status;
    }

    this.round += 1;
    this.actions = {};
    this.calcTurnOrders();
    this.status = 'player_input';
    return this.status;
  }

  // 己方单位回合行动
  async handleAllyTurn(ally, action, cb) {
    // 检查封印
    const sealed = ally.buffs.find(b => b.id === 'fengyin');
    if (sealed) {
      this.log(`【封印咒】${ally.name} 处于金光封印状态，动弹不得，本回合无法行动！`);
      if (cb) await cb({ type: 'sealed', target: ally.id, text: '大封印无法操作' });
      return;
    }

    // 逃跑
    if (action.type === 'flee') {
      const fleeSuccess = Math.random() < 0.75;
      if (fleeSuccess) {
        this.status = 'escaped';
        this.log(`【脱离战场】${ally.name} 身形一闪，成功逃离了战斗！`);
        window.Sound.playFailure();
        if (cb) await cb({ type: 'flee_success', text: '逃跑成功！' });
      } else {
        this.log(`【逃跑失败】敌人封锁了退路，逃跑失败！`);
        window.Sound.playFailure();
        if (cb) await cb({ type: 'flee_fail', text: '逃跑失败！' });
      }
      return;
    }

    // 防御
    if (action.type === 'defend') {
      ally.buffs.push({ name: '防御', duration: 1, defRate: 0.5 });
      this.log(`【${ally.name}】摆开防御架势，本回合受到伤害减半！`);
      if (cb) await cb({ type: 'defend', target: ally.id, text: '凝神防御！' });
      return;
    }

    // 使用药品
    if (action.type === 'item') {
      const item = window.GAME_DATA.ITEMS[action.itemId];
      const targetAlly = this.allies.find(a => a.id === action.targetAllyId) || ally;
      if (item && item.effect) {
        if (item.effect.hp) {
          const heal = Math.min(item.effect.hp, targetAlly.maxHp - targetAlly.hp);
          targetAlly.hp += heal;
          this.log(`【使用药品】${ally.name} 对【${targetAlly.name}】使用了【${item.name}】，恢复了 ${heal} 点气血！`);
          window.Sound.playMagic();
          if (cb) await cb({ type: 'heal', target: targetAlly.id, amount: heal, text: `+${heal} HP` });
        }
        if (item.effect.mp) {
          const restore = Math.min(item.effect.mp, targetAlly.maxMp - targetAlly.mp);
          targetAlly.mp += restore;
          this.log(`【使用药品】${ally.name} 对【${targetAlly.name}】使用了【${item.name}】，恢复了 ${restore} 点精力！`);
          window.Sound.playMagic();
          if (cb) await cb({ type: 'mana', target: targetAlly.id, amount: restore, text: `+${restore} MP` });
        }
      }
      return;
    }

    // 招降野怪 (面对非Boss)
    if (action.type === 'capture') {
      const targetEnemy = this.enemies[action.targetIndex];
      if (!targetEnemy || targetEnemy.hp <= 0) return;

      if (targetEnemy.isBoss) {
        this.log(`【招降失败】首领妖王意志如铁，无法被招降！`);
        window.Sound.playFailure();
        if (cb) await cb({ type: 'capture_fail', text: '首领无法招降！' });
        return;
      }

      const q = targetEnemy.quality || 'ordinary';
      const inv = window.App2D ? window.App2D.inventory : null;

      // 普通野怪 80%
      if (q === 'ordinary') {
        const success = Math.random() < 0.80;
        if (success) {
          targetEnemy.hp = 0;
          this.log(`【招降成功】你口吐真言，成功感化招降了普通野怪【${targetEnemy.name}】！`);
          window.Sound.playSuccess();
          const newPet = window.PetSystem.createPet(targetEnemy.templateId || 'dahai_gui', true, targetEnemy.level || 5);
          if (window.App2D && window.App2D.pets) window.App2D.pets.push(newPet);
          if (cb) await cb({ type: 'capture_success', targetIndex: action.targetIndex, pet: newPet, text: '招降成功！' });
        } else {
          this.log(`【招降未成】${targetEnemy.name} 性情暴戾，挣脱了你的招引！`);
          window.Sound.playFailure();
          if (cb) await cb({ type: 'capture_fail', text: '挣脱逃逸！' });
        }
        return;
      }

      // 散仙野怪 需银葫芦，70%
      if (q === 'sanxian') {
        if (!inv || inv.getItemCount('silver_gourd') < 1) {
          this.log(`【法宝不足】身上未持有法宝【紫竹银葫芦】，无法招降散仙灵兽！`);
          window.Sound.playFailure();
          if (cb) await cb({ type: 'capture_fail', text: '缺少银葫芦！' });
          return;
        }
        inv.removeItem('silver_gourd', 1);
        const success = Math.random() < 0.70;
        if (success) {
          targetEnemy.hp = 0;
          this.log(`【宝葫芦收服】祭起【紫竹银葫芦】，一道银光冲霄，成功招降散仙【${targetEnemy.name}】！`);
          window.Sound.playSuccess();
          const newPet = window.PetSystem.createPet(targetEnemy.templateId || 'baihua_she', true, targetEnemy.level || 10);
          if (window.App2D && window.App2D.pets) window.App2D.pets.push(newPet);
          if (cb) await cb({ type: 'capture_success', targetIndex: action.targetIndex, pet: newPet, text: '银葫芦收服！' });
        } else {
          this.log(`【葫芦落空】散仙【${targetEnemy.name}】施展遁法遁出葫芦法光！消耗了一只银葫芦。`);
          window.Sound.playFailure();
          if (cb) await cb({ type: 'capture_fail', text: '散仙逃遁！' });
        }
        return;
      }

      // 金仙野怪 需金葫芦，60%
      if (q === 'jinxian') {
        if (!inv || inv.getItemCount('gold_gourd') < 1) {
          this.log(`【法宝不足】身上未持有至宝【紫金红葫芦】，无法招降金仙圣兽！`);
          window.Sound.playFailure();
          if (cb) await cb({ type: 'capture_fail', text: '缺少金葫芦！' });
          return;
        }
        inv.removeItem('gold_gourd', 1);
        const success = Math.random() < 0.60;
        if (success) {
          targetEnemy.hp = 0;
          this.log(`【太上至宝显威】抛出【紫金红葫芦】，大喊其名！金仙圣兽【${targetEnemy.name}】应声被吸入葫中降伏！`);
          window.Sound.playCrit();
          const newPet = window.PetSystem.createPet(targetEnemy.templateId || 'gudai_ruishou', true, targetEnemy.level || 25);
          if (window.App2D && window.App2D.pets) window.App2D.pets.push(newPet);
          if (cb) await cb({ type: 'capture_success', targetIndex: action.targetIndex, pet: newPet, text: '金葫芦降伏！' });
        } else {
          this.log(`【圣兽顽抗】金仙圣兽【${targetEnemy.name}】元神浩瀚，震退了紫金红葫芦！消耗了一只金葫芦。`);
          window.Sound.playFailure();
          if (cb) await cb({ type: 'capture_fail', text: '金仙震退！' });
        }
        return;
      }
    }

    // 普通物理攻击
    if (action.type === 'attack') {
      const aliveEnemies = this.getAliveEnemies();
      if (aliveEnemies.length === 0) return;
      const targetEnemy = this.enemies[action.targetIndex] || aliveEnemies[0];

      const atkVal = ally.entity ? ally.entity.atk : (ally.atk || 50);
      const defVal = targetEnemy.def || 20;

      // 抗物理抗性结算
      const resPhy = (targetEnemy.resistances && targetEnemy.resistances.res_phy) || 0;
      const isCrit = Math.random() < 0.18;
      const critMult = isCrit ? 1.8 : 1.0;

      let rawDmg = Math.max(1, Math.floor((atkVal * 1.15 - defVal * 0.6) * critMult * (1 - resPhy)));
      targetEnemy.hp = Math.max(0, targetEnemy.hp - rawDmg);

      this.log(`【${ally.name}】挥舞兵刃，重创【${targetEnemy.name}】造成 ${rawDmg} 点物理伤害${isCrit ? '（暴击！）' : ''}！`);
      if (isCrit) window.Sound.playCrit();
      else window.Sound.playHit();

      if (cb) await cb({
        type: 'damage',
        attacker: ally.id,
        targetIndex: targetEnemy.enemyIndex,
        damage: rawDmg,
        isCrit: isCrit,
        text: `-${rawDmg}`
      });
      return;
    }

    // 释放绝技
    if (action.type === 'skill') {
      await this.handleSkillCast(ally, action, cb);
    }
  }

  // 技能法术详细结算 (抗性抵消)
  async handleSkillCast(ally, action, cb) {
    const skill = (ally.isPlayer ? this.player.getSkills() : (ally.skills || [])).find(s => s.id === action.skillId)
      || (ally.skills && ally.skills[0]);
    if (!skill) return;

    // 精力消耗
    if (skill.costMp && ally.mp < skill.costMp) {
      this.log(`【法力枯竭】精力不足，无法施展【${skill.name}】！`);
      return;
    }
    if (skill.costMp) {
      ally.mp = Math.max(0, ally.mp - skill.costMp);
    }

    // 自损气血判定 (如舍生取义)
    if (skill.costHpRatio) {
      const selfCost = Math.max(1, Math.floor(ally.hp * skill.costHpRatio));
      ally.hp = Math.max(1, ally.hp - selfCost);
      this.log(`【决死成仁】${ally.name} 自身反噬受创 ${selfCost} 点气血！`);
      if (cb) await cb({ type: 'damage', attacker: 'self', target: ally.id, damage: selfCost, text: `自损 -${selfCost}` });
    }

    const aliveEnemies = this.getAliveEnemies();
    if (aliveEnemies.length === 0) return;
    const targetEnemy = this.enemies[action.targetIndex] || aliveEnemies[0];

    // 1. 金刚系：舍生取义
    if (skill.name === '舍生取义' || skill.id === 'sk_jg_shesheng') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_shesheng) || 0;
      const baseDmg = Math.floor((ally.atk * 2.8 + ally.maxHp * 0.15) - targetEnemy.def * 0.2);
      const finalDmg = Math.max(50, Math.floor(baseDmg * (1 - res)));
      targetEnemy.hp = Math.max(0, targetEnemy.hp - finalDmg);
      this.log(`【舍生取义】${ally.name} 搏命轰杀【${targetEnemy.name}】造成 ${finalDmg} 点狂暴破甲重创！`);
      window.Sound.playCrit();
      if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: targetEnemy.enemyIndex, damage: finalDmg, text: `破甲 -${finalDmg}` });
      return;
    }

    // 2. 金刚系：佛光普照
    if (skill.name === '佛光普照' || skill.id === 'sk_jg_foguang') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_foguang) || 0;
      const hpDmg = Math.max(30, Math.floor(targetEnemy.hp * 0.22 * (1 - res)));
      const mpDrain = Math.floor(targetEnemy.maxMp * 0.25);
      targetEnemy.hp = Math.max(0, targetEnemy.hp - hpDmg);
      targetEnemy.mp = Math.max(0, targetEnemy.mp - mpDrain);
      this.log(`【佛光普照】纯阳佛火涤荡，削去【${targetEnemy.name}】${hpDmg} 点真实气血，并焚毁其 ${mpDrain} 点精力！`);
      window.Sound.playMagic();
      if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: targetEnemy.enemyIndex, damage: hpDmg, text: `佛光 -${hpDmg}` });
      return;
    }

    // 3. 金刚系：金刚护体 (己方群体增益)
    if (skill.name === '金刚护体' || skill.id === 'sk_jg_huti') {
      this.allies.forEach(a => {
        if (a.hp > 0) {
          a.buffs.push({ name: '金刚护体', duration: 3, defBonusRate: 0.45 });
        }
      });
      this.log(`【金刚护体】罗汉金身普照全队！己方全体物理防御与法术抗性大幅飙升！`);
      window.Sound.playMagic();
      if (cb) await cb({ type: 'buff', target: 'allies', text: '罗汉金身护持！' });
      return;
    }

    // 4. 妖魔系：雷霆万钧 (单体高伤)
    if (skill.name === '雷霆万钧' || skill.id === 'sk_ym_leiting') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_leiting) || 0;
      const dmg = Math.max(60, Math.floor(((ally.matk || ally.atk) * 3.2 - targetEnemy.mdef * 0.3) * (1 - res)));
      targetEnemy.hp = Math.max(0, targetEnemy.hp - dmg);
      this.log(`【雷霆万钧】九天狂雷轰顶！对【${targetEnemy.name}】造成 ${dmg} 点极高雷法伤害！`);
      window.Sound.playCrit();
      if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: targetEnemy.enemyIndex, damage: dmg, text: `雷霆 -${dmg}` });
      return;
    }

    // 5. 妖魔系：飞沙走石 (群体攻击)
    if (skill.name === '飞沙走石' || skill.id === 'sk_ym_feisha') {
      for (const e of aliveEnemies) {
        const res = (e.resistances && e.resistances.res_feisha) || 0;
        const dmg = Math.max(40, Math.floor(((ally.matk || ally.atk) * 1.8 - e.mdef * 0.4) * (1 - res)));
        e.hp = Math.max(0, e.hp - dmg);
        if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: e.enemyIndex, damage: dmg, text: `飞沙 -${dmg}` });
      }
      this.log(`【飞沙走石】三昧神风怒卷黄沙，漫天狂飙轰击敌方全体！`);
      window.Sound.playMagic();
      return;
    }

    // 6. 妖魔系：三昧真火
    if (skill.name === '三昧真火' || skill.id === 'sk_ym_sanmei') {
      for (const e of aliveEnemies) {
        const res = (e.resistances && e.resistances.res_sanmei) || 0;
        const dmg = Math.max(45, Math.floor(((ally.matk || ally.atk) * 2.0 - e.mdef * 0.3) * (1 - res)));
        e.hp = Math.max(0, e.hp - dmg);
        if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: e.enemyIndex, damage: dmg, text: `真火 -${dmg}` });
      }
      this.log(`【三昧真火】鼻端喷火，眼中吐烟！敌方全体葬身无边烈焰！`);
      window.Sound.playHit();
      return;
    }

    // 7. 神仙系：封印咒 (单体强封3回合)
    if (skill.name === '封印咒' || skill.id === 'sk_xr_fengyin') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_fengyin) || 0;
      const hitRate = Math.max(0.3, 0.75 - res);
      if (Math.random() < hitRate) {
        targetEnemy.buffs.push({ id: 'fengyin', name: '封印', duration: 3 });
        this.log(`【封印大成】神仙金符化作万道金锁，将【${targetEnemy.name}】彻底封印 3 回合！`);
        window.Sound.playMagic();
        if (cb) await cb({ type: 'sealed', targetIndex: targetEnemy.enemyIndex, text: '封印镇压3回合！' });
      } else {
        this.log(`【封印落空】${targetEnemy.name} 凭借抗性挣脱了封印神咒！`);
        window.Sound.playFailure();
        if (cb) await cb({ type: 'miss', targetIndex: targetEnemy.enemyIndex, text: '封印落空！' });
      }
      return;
    }

    // 8. 神仙系：定身咒 (无法攻击施法)
    if (skill.name === '定身咒' || skill.id === 'sk_xr_dingshen') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_dingshen) || 0;
      const hitRate = Math.max(0.35, 0.80 - res);
      if (Math.random() < hitRate) {
        targetEnemy.buffs.push({ id: 'dingshen', name: '定身', duration: 3 });
        this.log(`【定身神咒】玄门金索缚定，【${targetEnemy.name}】无法攻击与施法！`);
        window.Sound.playMagic();
        if (cb) await cb({ type: 'dingshen', targetIndex: targetEnemy.enemyIndex, text: '定身禁锢！' });
      } else {
        this.log(`【定身落空】定身符光被【${targetEnemy.name}】闪避！`);
        window.Sound.playFailure();
        if (cb) await cb({ type: 'miss', targetIndex: targetEnemy.enemyIndex, text: '定身失败！' });
      }
      return;
    }

    // 9. 神仙系：隐身咒
    if (skill.name === '隐身咒' || skill.id === 'sk_xr_yinshen') {
      ally.buffs.push({ id: 'yinshen', name: '隐身潜行', duration: 3, hideAttributes: true });
      this.log(`【隐身咒】${ally.name} 遁入太虚虚空！属性不可窥探，闪避与暴击率飙升！`);
      window.Sound.playMagic();
      if (cb) await cb({ type: 'invis', target: ally.id, text: '遁入虚空隐身！' });
      return;
    }
  }

  // 敌方单位行动
  async handleEnemyTurn(enemy, action, cb) {
    const aliveAllies = this.getAliveAllies();
    if (aliveAllies.length === 0) return;

    // 封印检查
    if (enemy.buffs.some(b => b.id === 'fengyin')) {
      this.log(`【镇压封印】${enemy.name} 处于封印状态，无法做任何行动！`);
      return;
    }

    const targetAlly = this.allies.find(a => a.id === action.targetId) || aliveAllies[0];
    const defVal = targetAlly.def || 20;

    // 检查我方防御 buff
    const defBuff = targetAlly.buffs.find(b => b.name === '防御');
    const defMult = defBuff ? 0.5 : 1.0;

    const resPhy = (targetAlly.entity && targetAlly.entity.resistances && targetAlly.entity.resistances.res_phy) || 0;
    const isCrit = Math.random() < 0.12;
    const critMult = isCrit ? 1.6 : 1.0;

    const dmg = Math.max(1, Math.floor((enemy.atk * 1.1 - defVal * 0.55) * critMult * defMult * (1 - resPhy)));
    targetAlly.hp = Math.max(0, targetAlly.hp - dmg);

    this.log(`【${enemy.name}】凶猛扑击，对【${targetAlly.name}】造成 ${dmg} 点伤害${isCrit ? '（暴击！）' : ''}！`);
    if (isCrit) window.Sound.playCrit();
    else window.Sound.playHit();

    if (cb) await cb({
      type: 'damage',
      attacker: 'enemy_' + enemy.enemyIndex,
      target: targetAlly.id,
      damage: dmg,
      isCrit: isCrit,
      text: `-${dmg}`
    });
  }
}

window.BattleEngine = BattleEngine;
