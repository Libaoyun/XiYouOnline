const fs = require('fs');

// Set up browser-like environment similar to test_suite.js
global.window = global;
const domMap = {};
global.document = {
  getElementById: (id) => domMap[id] || null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => {
    const el = {
      tagName: tag ? tag.toUpperCase() : 'DIV',
      id: '',
      className: '',
      style: {},
      innerHTML: '',
      dataset: {},
      children: [],
      parentElement: null,
      appendChild: (child) => {
        el.children.push(child);
        if (child) child.parentElement = el;
        if (child && child.id) domMap[child.id] = child;
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      classList: {
        _classes: new Set(),
        add: (c) => el.classList._classes.add(c),
        remove: (c) => el.classList._classes.delete(c),
        contains: (c) => el.classList._classes.has(c),
        toggle: (c) => {
          if (el.classList._classes.has(c)) el.classList._classes.delete(c);
          else el.classList._classes.add(c);
        }
      },
      addEventListener: (evt, cb) => { el['on' + evt] = cb; },
      removeEventListener: () => {},
      remove: () => {
        if (el.id && domMap[el.id]) delete domMap[el.id];
      },
      getContext: () => ({
        clearRect: () => {},
        fillRect: () => {},
        beginPath: () => {},
        arc: () => {},
        ellipse: () => {},
        stroke: () => {},
        fill: () => {},
        save: () => {},
        restore: () => {},
        translate: () => {},
        scale: () => {},
        rotate: () => {},
        setLineDash: () => {},
        createLinearGradient: () => ({ addColorStop: () => {} }),
        createRadialGradient: () => ({ addColorStop: () => {} }),
        measureText: () => ({ width: 10 }),
        fillText: () => {}
      })
    };
    return el;
  },
  body: {
    classList: { toggle: () => {}, contains: () => true },
    appendChild: (child) => {
      if (child && child.id) domMap[child.id] = child;
    }
  }
};

window.Sound = new Proxy({}, { get: () => () => true });
window.showGameMessage = (msg, type) => {
  console.log(`[Toast ${type || 'info'}]: ${msg}`);
};
window.Camera = class { constructor() {} follow() {} update() {} };
window.PathfindingEngine = class { constructor() {} findPath() { return []; } };
window.MountSystem = class { constructor() { this.mounts = {}; } addMount() {} getStatsBonus() { return { hp: 0, atk: 0, def: 0, spd: 0 }; } };
window.ParticleSystem = class { constructor() { this.particles = []; } update() {} };
window.addEventListener = () => {};
window.removeEventListener = () => {};
window.requestAnimationFrame = () => 0;
window.cancelAnimationFrame = () => {};
window.location = { search: '', href: 'http://localhost/', pathname: '/', origin: 'http://localhost' };

const path = require('path');
const filesToLoad = [
  'js/engine/visualIdentity.js',
  'js/engine/creatureArt.js',
  'js/engine/playerArt.js',
  'js/engine/npcArt.js',
  'js/core/skills.js',
  'js/data/classes.js',
  'js/data/pets.js',
  'js/data/items.js',
  'js/data/maps2d.js',
  'js/data/shanhaiSpecies.js',
  'js/data/storyQuests.js',
  'js/core/player.js',
  'js/core/petSystem.js',
  'js/core/shanhai.js',
  'js/core/mountSystem.js',
  'js/core/inventory.js',
  'js/core/forge.js',
  'js/core/battle.js',
  'js/core/peachGarden.js',
  'js/engine/tilemap.js',
  'js/engine/character.js',
  'js/engine/minimap.js',
  'js/engine/toast.js',
  'js/engine/dialogue.js',
  'js/app2d.js'
];

for (const relPath of filesToLoad) {
  const fullPath = path.join(__dirname, '..', relPath);
  const code = fs.readFileSync(fullPath, 'utf8');
  eval(code);
}

async function testIssues() {
  console.log('=== TEST 1: SKILL CASTING ===');
  const app = window.App2D;

  // Create UI container
  const battleLayer = document.createElement('div');
  battleLayer.id = 'battle-screen-layer';
  document.body.appendChild(battleLayer);

  // Setup player
  app.playerData = new window.Player({
    name: '测试大侠',
    classId: 'jingang',
    gender: 'male',
    level: 50
  });

  const skills = app.playerData.getSkills();
  console.log('Player skills:', skills.map(s => s.name + ' (' + s.id + ')'));

  // Test each skill in a battle
  for (const skill of skills) {
    console.log(`\nTesting skill: ${skill.name} (${skill.id})...`);
    app.playerData.hp = app.playerData.maxHp;
    app.playerData.mp = app.playerData.maxMp;

    let battleEnded = false;
    const enemy = {
      id: 'test_mob',
      name: '试炼妖精',
      hp: 1000,
      maxHp: 1000,
      atk: 10,
      def: 10,
      spd: 1
    };

    app.start2DBattle([enemy], () => {
      console.log('  -> Battle Victory Callback fired!');
      battleEnded = true;
    });

    console.log('  Active battle created. Allies:', app.currentBattle.allies.map(a => a.name));
    
    // Simulate UI clicking skill
    console.log(`  Clicking skill button ${skill.id}...`);
    app.onSkillButtonClick(skill.id);

    // If target menu opened, confirm target
    if (app.battleTargetMenuOpen) {
      console.log('  Target menu opened, selecting enemy 0...');
      app.confirmCombatSkillTarget(0);
    }

    console.log('  Battle action set:', app.currentBattle.actions['player']);
    console.log('  Executing round...');
    await app.executeCombatRound();

    console.log('  Round finished. Logs:', app.currentBattle ? app.currentBattle.logs.slice(-2) : 'Battle closed');
    console.log('  Current battle status:', app.currentBattle ? app.currentBattle.status : 'null (ended)');
  }

  console.log('\n=== TEST 2: BATTLE END AUTOMATION ===');
  {
    app.playerData.hp = app.playerData.maxHp;
    app.playerData.mp = app.playerData.maxMp;
    let victoryFired = false;
    const weakEnemy = {
      id: 'weak_mob',
      name: '一击必杀怪',
      hp: 10,
      maxHp: 10,
      atk: 5,
      def: 0,
      spd: 1
    };

    app.start2DBattle([weakEnemy], () => {
      victoryFired = true;
      console.log('  Victory callback executed successfully!');
    });

    console.log('  Choosing attack on weak enemy...');
    app.chooseCombatAction('attack');
    console.log('  After round: currentBattle is', app.currentBattle ? app.currentBattle.status : 'null');
    console.log('  victoryFired:', victoryFired);
    console.log('  battle-screen-layer display:', battleLayer.style.display);
  }

  console.log('\n=== TEST 3: SCENE SWITCHING / TRANSITION ===');
  {
    const maps = ['tiangong_palace', 'liujiacun', 'changan_city', 'chentangguan', 'wuxingshan', 'pingdingshan'];
    for (const m of maps) {
      console.log(`  Switching to map: ${m}...`);
      app.loadMap(m);
      console.log(`  Map loaded. currentMapId: ${app.currentMapId}, isTransitioning: ${app.isTransitioning}`);
    }
  }

  console.log('\nALL DIAGNOSTICS COMPLETED.');
}

testIssues().catch(e => console.error('Test error:', e));
