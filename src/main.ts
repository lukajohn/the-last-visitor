type GameState = 'title' | 'playing' | 'paused' | 'gameover' | 'win';

type Vec = { x: number; y: number };
type Rect = { x: number; y: number; w: number; h: number };

type Player = Rect & {
  vx: number;
  vy: number;
  grounded: boolean;
  coyote: number;
  jumpBuffer: number;
  invuln: number;
  coins: number;
  lives: number;
  power: number;
  facing: 1 | -1;
  spawn: Vec;
};

type Enemy = Rect & { vx: number; minX: number; maxX: number; alive: boolean };
type Coin = Rect & { collected: boolean; phase: number };
type PowerUp = Rect & { collected: boolean; vy: number };
type Level = {
  name: string;
  subtitle: string;
  width: number;
  platforms: Rect[];
  hazards: Rect[];
  enemies: Enemy[];
  coins: Coin[];
  powerups: PowerUp[];
  exit: Rect;
  spawn: Vec;
  sky: string;
};

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
if (!canvas) throw new Error('Canvas missing.');
const ctx = canvas.getContext('2d');
if (!ctx) throw new Error('Canvas context unavailable.');
ctx.imageSmoothingEnabled = false;

const W = 960;
const H = 540;
canvas.width = W;
canvas.height = H;

const GRAVITY = 1900;
const RUN = 285;
const JUMP = 690;
const MAX_FALL = 1050;
const COYOTE_TIME = 0.095;
const JUMP_BUFFER = 0.12;
const SAVE_KEY = 'the-last-visitor-arcade-v1';

const levels: Level[] = [
  {
    name: 'THE RAINY STREET',
    subtitle: 'RUN BEFORE THE LIGHTS GO OUT',
    width: 4800,
    sky: '#111827',
    spawn: { x: 90, y: 360 },
    platforms: [
      { x: 0, y: 475, w: 800, h: 65 }, { x: 900, y: 475, w: 620, h: 65 },
      { x: 1630, y: 430, w: 420, h: 110 }, { x: 2160, y: 475, w: 760, h: 65 },
      { x: 3060, y: 410, w: 400, h: 130 }, { x: 3600, y: 475, w: 760, h: 65 },
      { x: 4500, y: 420, w: 300, h: 120 },
      { x: 300, y: 350, w: 170, h: 24 }, { x: 590, y: 285, w: 150, h: 24 },
      { x: 1120, y: 330, w: 180, h: 24 }, { x: 1380, y: 260, w: 120, h: 24 },
      { x: 1780, y: 335, w: 140, h: 24 }, { x: 2310, y: 345, w: 170, h: 24 },
      { x: 2660, y: 275, w: 170, h: 24 }, { x: 3190, y: 315, w: 130, h: 24 },
      { x: 3820, y: 350, w: 170, h: 24 }, { x: 4140, y: 285, w: 140, h: 24 },
    ],
    hazards: [
      { x: 800, y: 505, w: 100, h: 35 }, { x: 1520, y: 505, w: 110, h: 35 },
      { x: 2050, y: 505, w: 110, h: 35 }, { x: 2920, y: 505, w: 140, h: 35 },
      { x: 3460, y: 505, w: 140, h: 35 }, { x: 4360, y: 505, w: 140, h: 35 },
    ],
    enemies: [
      { x: 520, y: 435, w: 34, h: 40, vx: 62, minX: 470, maxX: 740, alive: true },
      { x: 1180, y: 290, w: 32, h: 40, vx: -65, minX: 1120, maxX: 1300, alive: true },
      { x: 1770, y: 390, w: 34, h: 40, vx: 58, minX: 1650, maxX: 2020, alive: true },
      { x: 2480, y: 435, w: 34, h: 40, vx: -70, minX: 2240, maxX: 2860, alive: true },
      { x: 3210, y: 275, w: 32, h: 40, vx: 65, minX: 3190, maxX: 3320, alive: true },
      { x: 3890, y: 435, w: 34, h: 40, vx: 75, minX: 3660, maxX: 4260, alive: true },
    ],
    coins: coinLine([
      [240, 320], [340, 300], [440, 320], [620, 235], [720, 235],
      [1010, 425], [1120, 295], [1220, 295], [1390, 225], [1790, 300],
      [1880, 300], [2340, 310], [2440, 310], [2680, 240], [2770, 240],
      [3180, 280], [3260, 280], [3830, 315], [3930, 315], [4150, 250],
      [4620, 360],
    ]),
    powerups: [{ x: 1410, y: 210, w: 26, h: 26, collected: false, vy: 0 }],
    exit: { x: 4635, y: 340, w: 52, h: 80 },
  },
  {
    name: 'THE EMPTY HOUSE',
    subtitle: 'SOMEONE IS STILL INSIDE',
    width: 5200,
    sky: '#241923',
    spawn: { x: 80, y: 360 },
    platforms: [
      { x: 0, y: 475, w: 650, h: 65 }, { x: 760, y: 475, w: 700, h: 65 },
      { x: 1560, y: 390, w: 430, h: 150 }, { x: 2100, y: 475, w: 720, h: 65 },
      { x: 2940, y: 365, w: 500, h: 175 }, { x: 3520, y: 475, w: 680, h: 65 },
      { x: 4300, y: 400, w: 900, h: 140 },
      { x: 280, y: 340, w: 150, h: 24 }, { x: 510, y: 265, w: 130, h: 24 },
      { x: 860, y: 330, w: 170, h: 24 }, { x: 1170, y: 255, w: 160, h: 24 },
      { x: 1630, y: 300, w: 140, h: 24 }, { x: 1810, y: 235, w: 140, h: 24 },
      { x: 2250, y: 345, w: 150, h: 24 }, { x: 2550, y: 275, w: 150, h: 24 },
      { x: 3070, y: 285, w: 150, h: 24 }, { x: 3280, y: 225, w: 130, h: 24 },
      { x: 3640, y: 350, w: 150, h: 24 }, { x: 3900, y: 285, w: 150, h: 24 },
      { x: 4420, y: 320, w: 160, h: 24 }, { x: 4700, y: 260, w: 160, h: 24 },
    ],
    hazards: [
      { x: 650, y: 505, w: 110, h: 35 }, { x: 1460, y: 505, w: 100, h: 35 },
      { x: 1990, y: 505, w: 110, h: 35 }, { x: 2820, y: 505, w: 120, h: 35 },
      { x: 3440, y: 505, w: 80, h: 35 }, { x: 4200, y: 505, w: 100, h: 35 },
    ],
    enemies: [
      { x: 430, y: 435, w: 34, h: 40, vx: 75, minX: 260, maxX: 610, alive: true },
      { x: 900, y: 290, w: 32, h: 40, vx: -70, minX: 850, maxX: 1020, alive: true },
      { x: 1680, y: 350, w: 36, h: 40, vx: 72, minX: 1570, maxX: 1960, alive: true },
      { x: 2350, y: 435, w: 34, h: 40, vx: 85, minX: 2150, maxX: 2740, alive: true },
      { x: 3100, y: 245, w: 32, h: 40, vx: -65, minX: 3070, maxX: 3220, alive: true },
      { x: 3650, y: 435, w: 34, h: 40, vx: 80, minX: 3550, maxX: 4160, alive: true },
      { x: 4490, y: 360, w: 36, h: 40, vx: -75, minX: 4420, maxX: 5050, alive: true },
    ],
    coins: coinLine([
      [300, 310], [390, 310], [520, 235], [600, 235], [900, 300], [1010, 300],
      [1180, 225], [1280, 225], [1640, 270], [1730, 270], [1820, 205], [1910, 205],
      [2280, 315], [2380, 315], [2570, 245], [2660, 245], [3090, 255], [3190, 255],
      [3300, 195], [3680, 320], [3780, 320], [3920, 255], [4020, 255], [4450, 290],
      [4560, 290], [4720, 230], [4820, 230], [5000, 350],
    ]),
    powerups: [{ x: 2600, y: 235, w: 26, h: 26, collected: false, vy: 0 }],
    exit: { x: 5070, y: 320, w: 52, h: 80 },
  },
  {
    name: 'THE LAST DOOR',
    subtitle: "DON'T LOOK BACK",
    width: 5600,
    sky: '#100f18',
    spawn: { x: 90, y: 360 },
    platforms: [
      { x: 0, y: 475, w: 900, h: 65 }, { x: 1010, y: 475, w: 650, h: 65 },
      { x: 1760, y: 420, w: 500, h: 120 }, { x: 2360, y: 475, w: 600, h: 65 },
      { x: 3060, y: 385, w: 480, h: 155 }, { x: 3640, y: 475, w: 620, h: 65 },
      { x: 4380, y: 405, w: 420, h: 135 }, { x: 4920, y: 475, w: 680, h: 65 },
      { x: 330, y: 340, w: 180, h: 24 }, { x: 620, y: 270, w: 150, h: 24 },
      { x: 1130, y: 335, w: 160, h: 24 }, { x: 1390, y: 255, w: 150, h: 24 },
      { x: 1830, y: 325, w: 150, h: 24 }, { x: 2070, y: 250, w: 130, h: 24 },
      { x: 2440, y: 345, w: 150, h: 24 }, { x: 2680, y: 275, w: 150, h: 24 },
      { x: 3130, y: 300, w: 140, h: 24 }, { x: 3340, y: 235, w: 130, h: 24 },
      { x: 3720, y: 350, w: 150, h: 24 }, { x: 3970, y: 275, w: 150, h: 24 },
      { x: 4450, y: 320, w: 140, h: 24 }, { x: 4660, y: 255, w: 130, h: 24 },
      { x: 5050, y: 350, w: 150, h: 24 }, { x: 5320, y: 275, w: 140, h: 24 },
    ],
    hazards: [
      { x: 900, y: 505, w: 110, h: 35 }, { x: 1660, y: 505, w: 100, h: 35 },
      { x: 2260, y: 505, w: 100, h: 35 }, { x: 2960, y: 505, w: 100, h: 35 },
      { x: 3540, y: 505, w: 100, h: 35 }, { x: 4260, y: 505, w: 120, h: 35 },
      { x: 4800, y: 505, w: 120, h: 35 },
    ],
    enemies: [
      { x: 600, y: 435, w: 34, h: 40, vx: 80, minX: 420, maxX: 820, alive: true },
      { x: 1210, y: 295, w: 32, h: 40, vx: -72, minX: 1130, maxX: 1290, alive: true },
      { x: 1860, y: 380, w: 36, h: 40, vx: 75, minX: 1780, maxX: 2220, alive: true },
      { x: 2500, y: 435, w: 34, h: 40, vx: -90, minX: 2400, maxX: 2890, alive: true },
      { x: 3170, y: 265, w: 32, h: 40, vx: 75, minX: 3130, maxX: 3270, alive: true },
      { x: 3760, y: 435, w: 34, h: 40, vx: 85, minX: 3670, maxX: 4180, alive: true },
      { x: 4490, y: 365, w: 36, h: 40, vx: -80, minX: 4400, maxX: 4770, alive: true },
      { x: 5120, y: 435, w: 34, h: 40, vx: 90, minX: 4970, maxX: 5510, alive: true },
    ],
    coins: coinLine([
      [350, 310], [450, 310], [650, 235], [740, 235], [1140, 305], [1240, 305],
      [1400, 220], [1490, 220], [1840, 295], [1940, 295], [2080, 215], [2170, 215],
      [2460, 315], [2560, 315], [2700, 245], [2800, 245], [3150, 270], [3250, 270],
      [3360, 205], [3750, 320], [3850, 320], [3990, 245], [4080, 245], [4470, 290],
      [4570, 290], [4680, 225], [5070, 315], [5170, 315], [5340, 245], [5430, 245],
    ]),
    powerups: [{ x: 2700, y: 235, w: 26, h: 26, collected: false, vy: 0 }],
    exit: { x: 5480, y: 395, w: 60, h: 80 },
  },
];

function coinLine(points: number[][]): Coin[] {
  return points.map(([x, y], i) => ({ x, y, w: 18, h: 18, collected: false, phase: i * 0.7 }));
}

let state: GameState = 'title';
let levelIndex = 0;
let level: Level = levels[0];
let player: Player = makePlayer(level.spawn);
let cameraX = 0;
let score = 0;
let totalCoins = 0;
let elapsed = 0;
let lastTime = performance.now();
let keys = new Set<string>();
let touchLeft = false;
let touchRight = false;
let touchJump = false;
let audioEnabled = false;
let audio: AudioContext | null = null;

const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <div class="arcade">
    <header class="hud">
      <div class="brand"><span class="brand-mark">LV</span><span>THE LAST VISITOR</span></div>
      <div class="level-name" id="level-name">THE RAINY STREET</div>
      <div class="hud-right"><span id="score">000000</span><span class="coin-hud">● <b id="coins">00</b></span><span id="lives">♥♥♥</span><button id="sound" class="hud-btn" aria-label="Toggle sound">♫</button></div>
    </header>
    <main class="game-wrap">
      <canvas id="game-canvas" width="960" height="540" aria-label="The Last Visitor arcade platform game"></canvas>
      <div class="scanlines"></div>
      <div class="overlay" id="overlay">
        <div class="panel title-panel">
          <p class="kicker">AN ORIGINAL ARCADE PLATFORMER</p>
          <h1>THE LAST<br><i>VISITOR</i></h1>
          <p class="tagline">RUN. JUMP. DON'T LET IT CATCH YOU.</p>
          <button id="start" class="arcade-button">START GAME <span>→</span></button>
          <p class="controls-copy">A / D or ← / → to move · SPACE / W / ↑ to jump<br>Stomp enemies · collect coins · reach the door</p>
        </div>
      </div>
      <div class="touch-controls" aria-hidden="true">
        <button data-touch="left">◀</button><button data-touch="right">▶</button><button data-touch="jump">▲</button>
      </div>
    </main>
    <footer class="footer"><span>3 WORLDS · 1 RUN · 0 CHECKPOINTS TO HIDE BEHIND</span><span>© THE LAST VISITOR</span></footer>
  </div>
`;

const gameCanvas = document.querySelector<HTMLCanvasElement>('#game-canvas')!;
const g = gameCanvas.getContext('2d')!;
g.imageSmoothingEnabled = false;

function makePlayer(spawn: Vec): Player {
  return { x: spawn.x, y: spawn.y, w: 30, h: 42, vx: 0, vy: 0, grounded: false, coyote: 0, jumpBuffer: 0, invuln: 0, coins: 0, lives: 3, power: 0, facing: 1, spawn: { ...spawn } };
}

function resetLevel(preserveLives = true): void {
  level = cloneLevel(levels[levelIndex]);
  const lives = preserveLives ? player.lives : 3;
  player = makePlayer(level.spawn);
  player.lives = lives;
  player.coins = 0;
  cameraX = 0;
}

function cloneLevel(src: Level): Level {
  return {
    ...src,
    platforms: src.platforms.map(r => ({ ...r })),
    hazards: src.hazards.map(r => ({ ...r })),
    enemies: src.enemies.map(e => ({ ...e })),
    coins: src.coins.map(c => ({ ...c })),
    powerups: src.powerups.map(p => ({ ...p })),
    spawn: { ...src.spawn },
    exit: { ...src.exit },
  };
}

function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function inputLeft(): boolean { return keys.has('ArrowLeft') || keys.has('a') || touchLeft; }
function inputRight(): boolean { return keys.has('ArrowRight') || keys.has('d') || touchRight; }

function requestJump(): void {
  if (state !== 'playing') return;
  player.jumpBuffer = JUMP_BUFFER;
}

function update(dt: number): void {
  if (state !== 'playing') return;

  elapsed += dt;
  player.invuln = Math.max(0, player.invuln - dt);
  player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);

  const dir = (inputRight() ? 1 : 0) - (inputLeft() ? 1 : 0);
  if (dir !== 0) {
    player.vx += dir * 1850 * dt;
    player.vx = Math.max(-RUN, Math.min(RUN, player.vx));
    player.facing = dir as 1 | -1;
  } else {
    player.vx *= Math.pow(0.0005, dt);
    if (Math.abs(player.vx) < 2) player.vx = 0;
  }

  if (player.grounded) player.coyote = COYOTE_TIME;
  else player.coyote = Math.max(0, player.coyote - dt);

  if (player.jumpBuffer > 0 && player.coyote > 0) {
    player.vy = -JUMP;
    player.grounded = false;
    player.coyote = 0;
    player.jumpBuffer = 0;
    beep(420, 0.055);
  }

  player.vy = Math.min(MAX_FALL, player.vy + GRAVITY * dt);
  movePlayer(dt);

  for (const enemy of level.enemies) {
    if (!enemy.alive) continue;
    enemy.x += enemy.vx * dt;
    if (enemy.x <= enemy.minX || enemy.x + enemy.w >= enemy.maxX) enemy.vx *= -1;
    if (rectsOverlap(player, enemy) && player.invuln <= 0) {
      const stomp = player.vy > 80 && player.y + player.h - 8 < enemy.y + 12;
      if (stomp) {
        enemy.alive = false;
        player.vy = -JUMP * 0.48;
        score += 250;
        beep(130, 0.09);
      } else {
        hurtPlayer();
      }
    }
  }

  for (const coin of level.coins) {
    if (!coin.collected && rectsOverlap(player, coin)) {
      coin.collected = true;
      player.coins++;
      totalCoins++;
      score += 100;
      beep(760, 0.045);
    }
  }

  for (const power of level.powerups) {
    if (!power.collected) {
      power.y += Math.sin(elapsed * 4) * 0.12;
      if (rectsOverlap(player, power)) {
        power.collected = true;
        player.power = 1;
        score += 500;
        beep(980, 0.12);
      }
    }
  }

  for (const hazard of level.hazards) {
    if (rectsOverlap(player, hazard)) {
      hurtPlayer();
      break;
    }
  }

  if (player.y > H + 150) hurtPlayer();

  if (rectsOverlap(player, level.exit)) {
    if (levelIndex < levels.length - 1) {
      score += 1000;
      levelIndex++;
      resetLevel(true);
      updateHud();
      beep(520, 0.12);
    } else {
      score += 5000;
      state = 'win';
      showOverlay('YOU MADE IT', 'The last door was only the beginning.', 'PLAY AGAIN');
      beep(880, 0.18);
    }
  }

  cameraX += ((player.x - W * 0.38) - cameraX) * Math.min(1, dt * 6);
  cameraX = Math.max(0, Math.min(level.width - W, cameraX));
  updateHud();
}

function movePlayer(dt: number): void {
  player.x += player.vx * dt;
  resolveHorizontal();
  const oldY = player.y;
  player.y += player.vy * dt;
  player.grounded = false;

  for (const p of level.platforms) {
    if (!rectsOverlap(player, p)) continue;
    if (player.vy >= 0 && oldY + player.h <= p.y + 8) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.grounded = true;
    } else if (player.vy < 0 && oldY >= p.y + p.h - 8) {
      player.y = p.y + p.h;
      player.vy = 0;
    }
  }
  player.x = Math.max(0, Math.min(level.width - player.w, player.x));
}

function resolveHorizontal(): void {
  for (const p of level.platforms) {
    if (!rectsOverlap(player, p)) continue;
    if (player.vx > 0) player.x = p.x - player.w;
    else if (player.vx < 0) player.x = p.x + p.w;
    player.vx = 0;
  }
}

function hurtPlayer(): void {
  if (player.invuln > 0) return;
  player.lives--;
  beep(85, 0.18);
  if (player.lives <= 0) {
    state = 'gameover';
    showOverlay('GAME OVER', 'The night always gets another turn.', 'TRY AGAIN');
    return;
  }
  player.x = player.spawn.x;
  player.y = player.spawn.y;
  player.vx = 0;
  player.vy = 0;
  player.invuln = 1.4;
  cameraX = Math.max(0, player.x - 250);
}

function draw(): void {
  const levelColor = level.sky;
  g.fillStyle = levelColor;
  g.fillRect(0, 0, W, H);

  drawParallax();
  g.save();
  g.translate(-Math.floor(cameraX), 0);
  drawWorld();
  g.restore();

  drawVignette();
  if (state === 'paused') {
    g.fillStyle = 'rgba(5,6,10,.62)';
    g.fillRect(0, 0, W, H);
    text('PAUSED', W / 2, H / 2 - 12, 34, '#fff2c7', 'center');
    text('PRESS P OR ESC TO RESUME', W / 2, H / 2 + 28, 11, '#b8b3a6', 'center');
  }
}

function drawParallax(): void {
  const layers = [
    { speed: .12, base: 410, color: '#171c27' },
    { speed: .22, base: 430, color: '#121722' },
    { speed: .38, base: 455, color: '#0d111a' },
  ];
  for (const layer of layers) {
    const shift = (cameraX * layer.speed) % 180;
    g.fillStyle = layer.color;
    for (let x = -180 - shift; x < W + 180; x += 180) {
      const h = 70 + ((Math.abs(Math.floor(x / 180)) * 17) % 80);
      g.fillRect(x, layer.base - h, 120, h);
      g.fillRect(x + 22, layer.base - h - 20, 58, 20);
    }
  }
  for (let i = 0; i < 45; i++) {
    const x = ((i * 173 - cameraX * .55) % (W + 40)) - 20;
    const y = (i * 71) % 430;
    g.fillStyle = i % 4 ? 'rgba(180,205,220,.22)' : 'rgba(255,235,185,.4)';
    g.fillRect(x, y, 1, 7);
  }
}

function drawWorld(): void {
  for (const p of level.platforms) {
    g.fillStyle = '#252938';
    g.fillRect(p.x, p.y, p.w, p.h);
    g.fillStyle = '#5d6174';
    g.fillRect(p.x, p.y, p.w, 5);
    g.fillStyle = '#151722';
    for (let x = p.x + 8; x < p.x + p.w; x += 34) g.fillRect(x, p.y + 12, 2, Math.min(12, p.h - 14));
  }

  for (const h of level.hazards) {
    g.fillStyle = '#401f31';
    g.fillRect(h.x, h.y, h.w, h.h);
    g.fillStyle = '#bd5571';
    for (let x = h.x; x < h.x + h.w; x += 16) {
      g.beginPath();
      g.moveTo(x, h.y + h.h);
      g.lineTo(x + 8, h.y);
      g.lineTo(x + 16, h.y + h.h);
      g.closePath();
      g.fill();
    }
  }

  for (const coin of level.coins) if (!coin.collected) drawCoin(coin);
  for (const power of level.powerups) if (!power.collected) drawPower(power);
  for (const enemy of level.enemies) if (enemy.alive) drawEnemy(enemy);
  drawExit(level.exit);
  drawPlayer();
}

function drawPlayer(): void {
  if (player.invuln > 0 && Math.floor(elapsed * 18) % 2 === 0) return;
  const x = Math.round(player.x);
  const y = Math.round(player.y);
  const coat = player.power ? '#d7b36a' : '#8fb0b7';
  g.fillStyle = '#0b0c11';
  g.fillRect(x + 5, y + 6, 20, 29);
  g.fillStyle = coat;
  g.fillRect(x + 7, y + 16, 16, 18);
  g.fillStyle = '#d8c3a2';
  g.fillRect(x + 9, y + 4, 12, 13);
  g.fillStyle = '#161923';
  g.fillRect(x + (player.facing === 1 ? 17 : 9), y + 8, 4, 3);
  g.fillStyle = '#0b0c11';
  g.fillRect(x + 7, y + 34, 6, 8);
  g.fillRect(x + 17, y + 34, 6, 8);
  g.fillRect(x + (player.facing === 1 ? 23 : 1), y + 19, 6, 4);
}

function drawEnemy(e: Enemy): void {
  const x = Math.round(e.x), y = Math.round(e.y);
  g.fillStyle = '#351b2a';
  g.fillRect(x + 3, y + 8, e.w - 6, e.h - 8);
  g.fillStyle = '#9c4967';
  g.fillRect(x + 6, y + 3, e.w - 12, 13);
  g.fillStyle = '#f4c9a4';
  g.fillRect(x + 9, y + 11, 4, 3);
  g.fillRect(x + e.w - 13, y + 11, 4, 3);
  g.fillStyle = '#160f16';
  g.fillRect(x + 4, y + e.h - 5, 9, 5);
  g.fillRect(x + e.w - 13, y + e.h - 5, 9, 5);
}

function drawCoin(c: Coin): void {
  const bob = Math.sin(elapsed * 5 + c.phase) * 3;
  g.fillStyle = '#f2c75c';
  g.fillRect(c.x + 5, c.y + bob, 8, 18);
  g.fillStyle = '#fff0a2';
  g.fillRect(c.x + 7, c.y + 2 + bob, 3, 10);
}

function drawPower(p: PowerUp): void {
  const bob = Math.sin(elapsed * 4) * 4;
  g.fillStyle = '#8b5cff';
  g.fillRect(p.x, p.y + bob, p.w, p.h);
  g.fillStyle = '#f5d8ff';
  g.fillRect(p.x + 5, p.y + 5 + bob, 16, 4);
  g.fillRect(p.x + 5, p.y + 13 + bob, 16, 4);
}

function drawExit(r: Rect): void {
  g.fillStyle = '#0a0b10';
  g.fillRect(r.x, r.y, r.w, r.h);
  g.fillStyle = '#6e8b8f';
  g.fillRect(r.x + 5, r.y + 5, r.w - 10, 5);
  g.fillStyle = '#d7b36a';
  g.fillRect(r.x + r.w - 12, r.y + r.h / 2, 4, 4);
  g.fillStyle = 'rgba(215,179,106,.18)';
  g.fillRect(r.x - 20, r.y - 20, r.w + 40, r.h + 40);
}

function drawVignette(): void {
  const grad = g.createRadialGradient(W / 2, H / 2, 160, W / 2, H / 2, 620);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,.55)');
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
}

function text(value: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left'): void {
  g.font = `700 ${size}px "Arial Black", Impact, sans-serif`;
  g.textAlign = align;
  g.textBaseline = 'middle';
  g.fillStyle = color;
  g.fillText(value, x, y);
}

function updateHud(): void {
  document.querySelector('#level-name')!.textContent = level.name;
  document.querySelector('#score')!.textContent = String(score).padStart(6, '0');
  document.querySelector('#coins')!.textContent = String(player.coins).padStart(2, '0');
  document.querySelector('#lives')!.textContent = '♥'.repeat(player.lives) + '♡'.repeat(Math.max(0, 3 - player.lives));
}

function showOverlay(title: string, subtitle: string, button: string): void {
  const overlay = document.querySelector<HTMLDivElement>('#overlay')!;
  overlay.innerHTML = `
    <div class="panel result-panel">
      <p class="kicker">THE LAST VISITOR</p>
      <h2>${title}</h2>
      <p>${subtitle}</p>
      <button id="result-button" class="arcade-button">${button} <span>→</span></button>
      <p class="result-stats">SCORE ${String(score).padStart(6, '0')} · COINS ${totalCoins}</p>
    </div>`;
  overlay.classList.remove('hidden');
  document.querySelector('#result-button')!.addEventListener('click', () => {
    if (state === 'win') {
      levelIndex = 0;
      score = 0;
      totalCoins = 0;
    }
    resetLevel(false);
    state = 'playing';
    overlay.classList.add('hidden');
  });
}

function startGame(): void {
  levelIndex = 0;
  score = 0;
  totalCoins = 0;
  resetLevel(false);
  state = 'playing';
  document.querySelector('#overlay')!.classList.add('hidden');
  startAudio();
}

function togglePause(): void {
  if (state === 'playing') {
    state = 'paused';
  } else if (state === 'paused') {
    state = 'playing';
  }
}

function startAudio(): void {
  if (audioEnabled || audio) return;
  try {
    audio = new AudioContext();
    audioEnabled = true;
  } catch { /* sound remains optional */ }
}

function beep(freq: number, duration: number): void {
  if (!audioEnabled || !audio) return;
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.frequency.value = freq;
  osc.type = 'square';
  gain.gain.setValueAtTime(.035, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + duration);
  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration);
}

function loop(now: number): void {
  const dt = Math.min(0.033, (now - lastTime) / 1000);
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

document.querySelector('#start')?.addEventListener('click', startGame);
document.querySelector('#sound')?.addEventListener('click', () => {
  if (!audioEnabled) startAudio();
  else if (audio) audioEnabled = !audioEnabled;
});

window.addEventListener('keydown', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd', 'w', 'p', 'Escape'].includes(key)) event.preventDefault();
  if (key === 'p' || key === 'Escape') {
    if (state === 'playing' || state === 'paused') togglePause();
    return;
  }
  if (key === ' ' || key === 'ArrowUp' || key === 'w') requestJump();
  keys.add(key);
});

window.addEventListener('keyup', (event) => {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  keys.delete(key);
});

document.querySelectorAll<HTMLButtonElement>('[data-touch]').forEach(button => {
  const kind = button.dataset.touch;
  const set = (value: boolean) => {
    if (kind === 'left') touchLeft = value;
    if (kind === 'right') touchRight = value;
    if (kind === 'jump' && value) touchJump = true;
  };
  button.addEventListener('pointerdown', () => set(true));
  button.addEventListener('pointerup', () => set(false));
  button.addEventListener('pointerleave', () => set(false));
  button.addEventListener('pointercancel', () => set(false));
});
window.addEventListener('pointerup', () => {
  touchLeft = false;
  touchRight = false;
  if (touchJump) {
    requestJump();
    touchJump = false;
  }
});

requestAnimationFrame(loop);
