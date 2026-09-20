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
    this.enemies = Array.isArray(enemies) ? enemies : (enemies ? [enemies] : []); // 敌方单位数组
    this.options = options || {};

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
        atk: this.player.atk,
        def: this.player.def,
        spd: this.player.spd,
        critRate: this.player.critRate || 0.08,
        comboRate: this.player.comboRate || 0.05,
        fatalRate: this.player.fatalRate || 0.02,
        dodgeRate: this.player.dodgeRate || 0.05,
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
          atk: pet.atk,
          def: pet.def,
          spd: pet.spd,
          critRate: pet.critRate || 0.08,
          comboRate: pet.comboRate || 0.05,
          fatalRate: pet.fatalRate || 0.02,
          dodgeRate: pet.dodgeRate || 0.05,
          skills: pet.skills || [],
          buffs: []
        });
      }
    });
  }

  getAliveAllies() {
    return (this.allies || []).filter(a => a.hp === undefined || a.hp > 0);
  }

  getAliveEnemies() {
    return (this.enemies || []).filter(e => e.hp === undefined || e.hp > 0);
  }

  // 检查是否所有存活己方都已确认指令
  isAllAlliesReady() {
    const alive = this.getAliveAllies();
    return alive.length > 0 && alive.every(a => a.isReady || (this.actions && !!this.actions[a.id]));
  }

  /**
   * 汉风西游全新核心战斗数值法则与公式结算
   * 1. 闪避判定：跳过伤害(0)，显示 MISS，打断连击
   * 2. 致命一击：无视防御和物理抗性，按目标最大血量真实伤害
   * 3. 基础伤害：atk - def，若 def >= atk 保底 1 点伤害
   * 4. 暴击判定：造成 1.5 倍伤害
   * 5. 连击判定：连续追击 1~3 次，每次伤害为上一次的一半 (减半下取整保底1)
   * 6. 随机浮动：±10% (0.90 ~ 1.10)
   */
  static calculateAttackDamage(attacker, target, options = {}) {
    const atkVal = attacker.atk || (attacker.entity && attacker.entity.atk) || 50;
    const defVal = target.def !== undefined ? target.def : ((target.entity && target.entity.def) || 20);
    const maxHpTarget = target.maxHp || (target.entity && target.entity.maxHp) || 200;

    const dodgeRate = target.dodgeRate !== undefined ? target.dodgeRate : ((target.entity && target.entity.dodgeRate) || 0.05);
    const fatalRate = attacker.fatalRate !== undefined ? attacker.fatalRate : ((attacker.entity && attacker.entity.fatalRate) || 0.02);
    const critRate = attacker.critRate !== undefined ? attacker.critRate : ((attacker.entity && attacker.entity.critRate) || 0.08);
    const comboRate = attacker.comboRate !== undefined ? attacker.comboRate : ((attacker.entity && attacker.entity.comboRate) || 0.05);

    const passives = (attacker.entity && attacker.entity.passives) || (attacker.passives) || [];
    const targetPassives = (target.entity && target.entity.passives) || (target.passives) || [];

    // 1. 闪避率判定 (目标闪避普通攻击)
    let finalDodgeRate = dodgeRate;
    if (targetPassives.some(p => p.id === 'high_sneak')) finalDodgeRate += 0.15;
    const isDodge = options.forceDodge !== undefined ? options.forceDodge : (Math.random() < finalDodgeRate);

    if (isDodge) {
      return {
        isDodge: true,
        isFatal: false,
        isCrit: false,
        comboCount: 0,
        damages: [0],
        comboHits: [],
        totalDamage: 0
      };
    }

    // 防御姿态减免
    const isDefending = target.buffs && target.buffs.some(b => b.name === '防御');
    const defStanceMult = isDefending ? 0.5 : 1.0;

    // ±10% 伤害浮动函数 (0.90 ~ 1.10)
    const getFlux = () => {
      if (options.dmgFluctuate !== undefined) return options.dmgFluctuate;
      if (options.mockRandomFlux !== undefined) return options.mockRandomFlux;
      return 0.90 + Math.random() * 0.20;
    };

    // 2. 致命一击判定 (无视防御与物理抗性，按目标生命值百分比造成真实伤害)
    const isFatal = options.forceFatal !== undefined ? options.forceFatal : (Math.random() < fatalRate);
    if (isFatal) {
      const isBoss = target.isBoss;
      const ratio = isBoss ? 0.08 : 0.20; // 20% 最大生命真实伤害 (Boss 8%)
      const fatalDmg = Math.max(1, Math.floor(maxHpTarget * ratio * getFlux() * defStanceMult));
      return {
        isDodge: false,
        isFatal: true,
        isCrit: false,
        comboCount: 0,
        damages: [fatalDmg],
        comboHits: [fatalDmg],
        totalDamage: fatalDmg
      };
    }

    // 3. 基础伤害 = 攻击力 - 防御力，防御力>=攻击力保底造成 1 点伤害
    const baseDamage = Math.max(1, atkVal - defVal);

    // 物理抗性减免 (区别于防御力数值减免)
    const resPhy = (target.resistances && target.resistances.res_phy) || (target.entity && target.entity.resistances && target.entity.resistances.res_phy) || 0;
    const resMult = Math.max(0, 1 - resPhy);

    // 4. 暴击率判定 (普通攻击造成 1.5 倍伤害)
    let finalCritRate = critRate;
    if (passives.some(p => p.id === 'high_critical')) finalCritRate += 0.20;
    const isCrit = options.forceCrit !== undefined ? options.forceCrit : (Math.random() < finalCritRate);
    const critMult = isCrit ? 1.5 : 1.0;

    // 偷袭增伤
    const sneakMult = passives.some(p => p.id === 'high_sneak') ? 1.15 : 1.0;

    // 主击伤害
    const firstDmg = Math.max(1, Math.floor(baseDamage * critMult * sneakMult * defStanceMult * resMult * getFlux()));

    // 5. 连击率判定 (概率连击1~3次，每次连击伤害为上一次的一半)
    let finalComboRate = comboRate;
    if (passives.some(p => p.id === 'high_combo')) finalComboRate += 0.25;
    const triggerCombo = options.forceCombo !== undefined ? options.forceCombo : (Math.random() < finalComboRate);

    const damages = [firstDmg];
    let comboCount = 0;
    if (triggerCombo) {
      const maxCombos = options.forceComboCount !== undefined ? options.forceComboCount : (1 + Math.floor(Math.random() * 3)); // 1~3次
      comboCount = maxCombos;
      let prevDmg = firstDmg;
      for (let c = 0; c < maxCombos; c++) {
        const nextDmg = Math.max(1, Math.floor(prevDmg * 0.5)); // 每次连击伤害减半
        damages.push(nextDmg);
        prevDmg = nextDmg;
      }
    }

    const totalDamage = damages.reduce((sum, d) => sum + d, 0);

    return {
      isDodge: false,
      isFatal: false,
      isCrit: isCrit,
      comboCount: comboCount,
      damages: damages,
      comboHits: damages,
      totalDamage: totalDamage
    };
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
      if (item.unit.entity) {
        item.unit.entity.turnOrder = index + 1;
      }
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

  // 替换仙宠（仅仙宠单位可用，玩家不可替换，同时支持战斗槽位ID与实例ID）
  switchPet(allyId, newPetInstanceId, availablePets = []) {
    const ally = this.allies.find(a => a.id === allyId || (a.entity && a.entity.instanceId === allyId));
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
    ally.id = targetPet.instanceId;
    ally.instanceId = targetPet.instanceId;
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

  // 便捷招降接口
  async captureMonster(targetIndex, cb) {
    const targetEnemy = this.enemies[targetIndex];
    if (!targetEnemy || targetEnemy.hp <= 0) return { success: false, msg: '目标不存在或已阵亡！' };
    if (targetEnemy.isBoss) return { success: false, msg: '首领妖王意志如铁，无法被招降！' };

    const q = targetEnemy.quality || 'ordinary';
    const inv = window.App2D ? window.App2D.inventory : null;

    if (q === 'sanxian') {
      if (!inv || inv.getItemCount('silver_gourd') < 1) {
        return { success: false, msg: '缺少法宝【紫竹银葫芦】，无法招降散仙野怪！' };
      }
    } else if (q === 'jinxian') {
      if (!inv || inv.getItemCount('gold_gourd') < 1) {
        return { success: false, msg: '缺少法宝【紫金红葫芦】，无法招降金仙圣兽！' };
      }
    }

    let result = null;
    await this.handleAllyTurn(this.allies[0] || { name: '玩家', buffs: [] }, { type: 'capture', targetIndex }, async (res) => {
      result = res;
      if (cb) await cb(res);
    });

    const isSuccess = result && result.type === 'capture_success';
    return {
      success: isSuccess,
      msg: result ? result.text : (isSuccess ? '招降成功' : '招降失败')
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
          if (targetEnemy.name) newPet.name = targetEnemy.name;
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
          if (targetEnemy.name) newPet.name = targetEnemy.name;
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
          if (targetEnemy.name) newPet.name = targetEnemy.name;
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

      // 调用全新核心法则结算公式
      const attackRes = BattleEngine.calculateAttackDamage(ally, targetEnemy);

      // 1. 闪避判定：跳过伤害(0)，显示 MISS，打断连击
      if (attackRes.isDodge) {
        this.log(`【${targetEnemy.name}】身法如电，轻盈【闪避 MISS】了【${ally.name}】的致命杀招！`);
        window.Sound.playFailure();
        if (cb) await cb({
          type: 'dodge',
          attacker: ally.id,
          targetIndex: targetEnemy.enemyIndex,
          text: '闪避 MISS'
        });
        return;
      }

      // 扣除目标生命值 (支持连击总伤与多段衰减)
      targetEnemy.hp = Math.max(0, targetEnemy.hp - attackRes.totalDamage);

      let logMsg = `【${ally.name}】挥舞神兵，轰击【${targetEnemy.name}】！`;
      if (attackRes.isFatal) {
        logMsg += ` 触发【⚡致命一击】无视防御与物理抗性，贯穿造成 ${attackRes.damages[0]} 点纯正真实伤害！`;
      } else {
        logMsg += ` 造成 ${attackRes.damages[0]} 点物理伤害${attackRes.isCrit ? '（💥暴击1.5倍！）' : ''}！`;
        if (attackRes.comboCount > 0) {
          logMsg += ` 并且激发【🔥连续追击 ${attackRes.comboCount} 次】（连击每次伤害减半：${attackRes.damages.slice(1).join('、')}）！`;
        }
        logMsg += ` 本轮普攻共造成 ${attackRes.totalDamage} 点总伤害！`;
      }

      // 高级吸血结算 (仙宠技能)
      const passives = (ally.entity && ally.entity.passives) || (ally.passives) || [];
      const hasHighVampire = passives.some(p => p.id === 'high_vampire');
      if (hasHighVampire && attackRes.totalDamage > 0) {
        const leech = Math.min(Math.floor(attackRes.totalDamage * 0.35), ally.maxHp - ally.hp);
        if (leech > 0) {
          ally.hp += leech;
          logMsg += `【🩸高级吸血恢复 +${leech} HP】`;
        }
      }

      this.log(logMsg);
      if (attackRes.isFatal || attackRes.isCrit) window.Sound.playCrit();
      else window.Sound.playHit();

      if (cb) await cb({
        type: 'damage',
        attacker: ally.id,
        targetIndex: targetEnemy.enemyIndex,
        attackResult: attackRes,
        damage: attackRes.damages[0],
        totalDamage: attackRes.totalDamage,
        isCrit: attackRes.isCrit,
        isFatal: attackRes.isFatal,
        comboCount: attackRes.comboCount,
        damages: attackRes.damages,
        text: attackRes.isFatal ? `⚡致命 -${attackRes.damages[0]}` : (attackRes.isCrit ? `💥暴击 -${attackRes.damages[0]}` : `-${attackRes.damages[0]}`)
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
      const lvl = skill.level || 1;
      const prof = skill.proficiency || 0;
      const profBonus = prof * 0.0015 + lvl * 0.35;
      const baseDmg = Math.floor((ally.atk * (2.8 + profBonus) + ally.maxHp * 0.15) - targetEnemy.def * 0.2);
      const finalDmg = Math.max(50, Math.floor(baseDmg * (1 - res)));
      targetEnemy.hp = Math.max(0, targetEnemy.hp - finalDmg);
      this.log(`【舍生取义 Lv.${lvl}】${ally.name} 搏命轰杀【${targetEnemy.name}】造成 ${finalDmg} 点狂暴破甲重创！`);
      window.Sound.playCrit();
      if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: targetEnemy.enemyIndex, damage: finalDmg, text: `破甲 -${finalDmg}` });
      this.rewardSkillProficiency(ally, skill);
      return;
    }

    // 2. 金刚系：佛光普照
    if (skill.name === '佛光普照' || skill.id === 'sk_jg_foguang') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_foguang) || 0;
      const lvl = skill.level || 1;
      const hpRate = Math.min(0.50, 0.22 + lvl * 0.03 + (skill.proficiency || 0) * 0.0001);
      const mpRate = Math.min(0.60, 0.25 + lvl * 0.04);
      const hpDmg = Math.max(30, Math.floor(targetEnemy.hp * hpRate * (1 - res)));
      const mpDrain = Math.floor(targetEnemy.maxMp * mpRate);
      targetEnemy.hp = Math.max(0, targetEnemy.hp - hpDmg);
      targetEnemy.mp = Math.max(0, targetEnemy.mp - mpDrain);
      this.log(`【佛光普照 Lv.${lvl}】纯阳佛火涤荡，削去【${targetEnemy.name}】${hpDmg} 点真实气血，并焚毁其 ${mpDrain} 点精力！`);
      window.Sound.playMagic();
      if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: targetEnemy.enemyIndex, damage: hpDmg, text: `佛光 -${hpDmg}` });
      this.rewardSkillProficiency(ally, skill);
      return;
    }

    // 3. 金刚系：金刚护体 (随等级护持目标数递增：1级1人，2级2人，3级全体)
    if (skill.name === '金刚护体' || skill.id === 'sk_jg_huti') {
      const lvl = skill.level || 1;
      const targetCount = lvl === 1 ? 1 : (lvl === 2 ? 2 : 99);
      const aliveAllies = this.allies.filter(a => a.hp > 0).sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
      const targets = aliveAllies.slice(0, targetCount);
      const defRate = 0.35 + lvl * 0.08;
      targets.forEach(t => {
        t.buffs.push({ name: '金刚护体', duration: 3, defBonusRate: defRate });
      });
      const names = targets.map(t => t.name).join('、');
      this.log(`【金刚护体 Lv.${lvl}】罗汉金身普照【${names}】(${targets.length}人)！物防与法抗大幅飙升！`);
      window.Sound.playMagic();
      if (cb) await cb({ type: 'buff', target: 'allies', text: `金刚护体(${targets.length}人)` });
      this.rewardSkillProficiency(ally, skill);
      return;
    }

    // 4. 妖魔系：雷霆万钧 (单体高伤)
    if (skill.name === '雷霆万钧' || skill.id === 'sk_ym_leiting') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_leiting) || 0;
      const lvl = skill.level || 1;
      const profBonus = (skill.proficiency || 0) * 0.002 + lvl * 0.35;
      const dmg = Math.max(60, Math.floor(((ally.matk || ally.atk) * (3.2 + profBonus) - targetEnemy.mdef * 0.3) * (1 - res)));
      targetEnemy.hp = Math.max(0, targetEnemy.hp - dmg);
      this.log(`【雷霆万钧 Lv.${lvl}】九天狂雷轰顶！对【${targetEnemy.name}】造成 ${dmg} 点极高雷法伤害！`);
      window.Sound.playCrit();
      if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: targetEnemy.enemyIndex, damage: dmg, text: `雷霆 -${dmg}` });
      this.rewardSkillProficiency(ally, skill);
      return;
    }

    // 5. 妖魔系：飞沙走石 (群体攻击)
    if (skill.name === '飞沙走石' || skill.id === 'sk_ym_feisha') {
      const lvl = skill.level || 1;
      const profBonus = (skill.proficiency || 0) * 0.001 + lvl * 0.25;
      for (const e of aliveEnemies) {
        const res = (e.resistances && e.resistances.res_feisha) || 0;
        const dmg = Math.max(40, Math.floor(((ally.matk || ally.atk) * (1.8 + profBonus) - e.mdef * 0.4) * (1 - res)));
        e.hp = Math.max(0, e.hp - dmg);
        if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: e.enemyIndex, damage: dmg, text: `飞沙 -${dmg}` });
      }
      this.log(`【飞沙走石 Lv.${lvl}】三昧神风怒卷黄沙，漫天狂飙轰击敌方全体！`);
      window.Sound.playMagic();
      this.rewardSkillProficiency(ally, skill);
      return;
    }

    // 6. 妖魔系：三昧真火
    if (skill.name === '三昧真火' || skill.id === 'sk_ym_sanmei') {
      const lvl = skill.level || 1;
      const profBonus = (skill.proficiency || 0) * 0.001 + lvl * 0.25;
      for (const e of aliveEnemies) {
        const res = (e.resistances && e.resistances.res_sanmei) || 0;
        const dmg = Math.max(45, Math.floor(((ally.matk || ally.atk) * (2.0 + profBonus) - e.mdef * 0.3) * (1 - res)));
        e.hp = Math.max(0, e.hp - dmg);
        if (cb) await cb({ type: 'damage', attacker: ally.id, targetIndex: e.enemyIndex, damage: dmg, text: `真火 -${dmg}` });
      }
      this.log(`【三昧真火 Lv.${lvl}】鼻端喷火，眼中吐烟！敌方全体葬身无边烈焰！`);
      window.Sound.playHit();
      this.rewardSkillProficiency(ally, skill);
      return;
    }

    // 7. 神仙系：封印咒 (单体强封3回合)
    if (skill.name === '封印咒' || skill.id === 'sk_xr_fengyin') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_fengyin) || 0;
      const lvl = skill.level || 1;
      const hitRate = Math.max(0.3, 0.75 + lvl * 0.03 + (skill.proficiency || 0) * 0.0002 - res);
      if (Math.random() < hitRate) {
        targetEnemy.buffs.push({ id: 'fengyin', name: '封印', duration: 3 });
        this.log(`【封印大成 Lv.${lvl}】神仙金符化作万道金锁，将【${targetEnemy.name}】彻底封印 3 回合！`);
        window.Sound.playMagic();
        if (cb) await cb({ type: 'sealed', targetIndex: targetEnemy.enemyIndex, text: '封印镇压3回合！' });
      } else {
        this.log(`【封印落空】${targetEnemy.name} 凭借抗性挣脱了封印神咒！`);
        window.Sound.playFailure();
        if (cb) await cb({ type: 'miss', targetIndex: targetEnemy.enemyIndex, text: '封印落空！' });
      }
      this.rewardSkillProficiency(ally, skill);
      return;
    }

    // 8. 神仙系：定身咒 (无法攻击施法)
    if (skill.name === '定身咒' || skill.id === 'sk_xr_dingshen') {
      const res = (targetEnemy.resistances && targetEnemy.resistances.res_dingshen) || 0;
      const lvl = skill.level || 1;
      const hitRate = Math.max(0.35, 0.80 + lvl * 0.03 + (skill.proficiency || 0) * 0.0002 - res);
      if (Math.random() < hitRate) {
        targetEnemy.buffs.push({ id: 'dingshen', name: '定身', duration: 3 });
        this.log(`【定身神咒 Lv.${lvl}】玄门金索缚定，【${targetEnemy.name}】无法攻击与施法！`);
        window.Sound.playMagic();
        if (cb) await cb({ type: 'dingshen', targetIndex: targetEnemy.enemyIndex, text: '定身禁锢！' });
      } else {
        this.log(`【定身落空】定身符光被【${targetEnemy.name}】闪避！`);
        window.Sound.playFailure();
        if (cb) await cb({ type: 'miss', targetIndex: targetEnemy.enemyIndex, text: '定身失败！' });
      }
      this.rewardSkillProficiency(ally, skill);
      return;
    }

    // 9. 神仙系：隐身咒
    if (skill.name === '隐身咒' || skill.id === 'sk_xr_yinshen') {
      const lvl = skill.level || 1;
      ally.buffs.push({ id: 'yinshen', name: '隐身潜行', duration: 3, hideAttributes: true });
      this.log(`【隐身咒 Lv.${lvl}】${ally.name} 遁入太虚虚空！属性不可窥探，闪避与暴击率飙升！`);
      window.Sound.playMagic();
      if (cb) await cb({ type: 'invis', target: ally.id, text: '遁入虚空隐身！' });
      this.rewardSkillProficiency(ally, skill);
      return;
    }
  }

  // 绝技熟练度结算与升级
  rewardSkillProficiency(ally, skill) {
    if (!skill) return;
    const gain = Math.floor(Math.random() * 5 + 10);
    skill.proficiency = (skill.proficiency || 0) + gain;
    const curLvl = skill.level || 1;
    const thresholds = { 1: 100, 2: 250, 3: 500, 4: 850 };
    if (curLvl < 5 && skill.proficiency >= (thresholds[curLvl] || 9999)) {
      skill.level = curLvl + 1;
      this.log(`🌟【技能精进】${ally.name} 勤修苦练，绝技【${skill.name}】熟练度圆满，晋升至 Lv.${skill.level}！威力跃迁！`);
      if (window.Sound) window.Sound.playSuccess();
      if (window.showGameMessage) {
        window.showGameMessage(`🌟 绝技【${skill.name}】晋升至 Lv.${skill.level}！威力大幅提升！`, 'success');
      }
    }
  }

  // 敌方单位行动
  async handleEnemyTurn(enemy, action, cb) {
    const aliveAllies = this.getAliveAllies();
    if (aliveAllies.length === 0) return;

    // 封印检查
    if (enemy.buffs.some(b => b.id === 'fengyin')) {
      this.log(`【镇压封印】${enemy.name} 处于封印状态，动弹不得，无法做任何行动！`);
      return;
    }

    const targetAlly = this.allies.find(a => a.id === action.targetId) || aliveAllies[0];

    // 调用统一核心伤害计算公式
    const attackRes = BattleEngine.calculateAttackDamage(enemy, targetAlly);

    // 1. 玩家/仙宠闪避判定
    if (attackRes.isDodge) {
      this.log(`【${targetAlly.name}】身形飘逸，轻盈【闪避 MISS】了【${enemy.name}】的凶残扑击！`);
      window.Sound.playFailure();
      if (cb) await cb({
        type: 'dodge',
        attacker: 'enemy_' + enemy.enemyIndex,
        target: targetAlly.id,
        text: '闪避 MISS'
      });
      return;
    }

    targetAlly.hp = Math.max(0, targetAlly.hp - attackRes.totalDamage);

    // 检查高级神佑复生被动 (high_rebirth)
    const passives = (targetAlly.entity && targetAlly.entity.passives) || (targetAlly.passives) || [];
    const hasRebirth = passives.some(p => p.id === 'high_rebirth');
    let didRevive = false;
    if (targetAlly.hp === 0 && hasRebirth && Math.random() < 0.45) {
      const reviveHp = Math.max(1, Math.floor(targetAlly.maxHp * 0.50));
      targetAlly.hp = reviveHp;
      didRevive = true;
      this.log(`✨【圣光涅槃】${targetAlly.name} 触发【高级神佑复生】！仙光冲霄，原地涅槃复活！回复 ${reviveHp} 点气血！`);
      if (window.Sound) window.Sound.playSuccess();
    }

    let logMsg = `【${enemy.name}】凶猛扑击【${targetAlly.name}】！`;
    if (attackRes.isFatal) {
      logMsg += ` 竟触发【⚡致命一击】无视防御与物理抗性，贯穿造成 ${attackRes.damages[0]} 点纯正真实伤害！`;
    } else {
      logMsg += ` 造成 ${attackRes.damages[0]} 点伤害${attackRes.isCrit ? '（💥暴击1.5倍！）' : ''}！`;
      if (attackRes.comboCount > 0) {
        logMsg += ` 并且激发【🔥连续撕咬 ${attackRes.comboCount} 次】（连击每次伤害减半：${attackRes.damages.slice(1).join('、')}）！`;
      }
      logMsg += ` 本轮攻击共造成 ${attackRes.totalDamage} 点总伤害！`;
    }
    this.log(logMsg);

    if (attackRes.isFatal || attackRes.isCrit) window.Sound.playCrit();
    else window.Sound.playHit();

    if (cb) await cb({
      type: didRevive ? 'revive' : 'damage',
      attacker: 'enemy_' + enemy.enemyIndex,
      target: targetAlly.id,
      attackResult: attackRes,
      damage: attackRes.damages[0],
      totalDamage: attackRes.totalDamage,
      isCrit: attackRes.isCrit,
      isFatal: attackRes.isFatal,
      comboCount: attackRes.comboCount,
      damages: attackRes.damages,
      text: didRevive ? '✨高级神佑复活！' : (attackRes.isFatal ? `⚡致命 -${attackRes.damages[0]}` : (attackRes.isCrit ? `💥暴击 -${attackRes.damages[0]}` : `-${attackRes.damages[0]}`))
    });
  }
}

window.BattleEngine = BattleEngine;
