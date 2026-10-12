const WIDTH = 320;
const HEIGHT = 200;
const VIEW_HEIGHT = 176;
const HUD_HEIGHT = HEIGHT - VIEW_HEIGHT;
const FOV_PLANE = 0.66;

const MAP = [
  '1111111111111111',
  '1000000000000001',
  '1022200000330001',
  '1000000000000001',
  '1000111100000001',
  '1000100000000001',
  '1000100333000001',
  '1000100000000001',
  '1000000000000001',
  '1002220000222001',
  '1000000000000001',
  '1033300000111001',
  '1000000000000001',
  '1000000000000001',
  '1000000000000001',
  '1111111111111111'
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

function makeTexture(type) {
  const texture = document.createElement('canvas');
  texture.width = texture.height = 32;
  const ctx = texture.getContext('2d', { alpha: false });
  const palette = {
    1: ['#5f5148', '#403832', '#766358', '#282427'],
    2: ['#742c28', '#9b4434', '#421e20', '#231619'],
    3: ['#343a40', '#55585a', '#171b20', '#a34b39']
  }[type] || ['#62534b', '#403832', '#79675c', '#272126'];
  ctx.fillStyle = palette[0]; ctx.fillRect(0, 0, 32, 32);
  if (type === 2) {
    for (let y = 0; y < 32; y += 8) {
      ctx.fillStyle = palette[2]; ctx.fillRect(0, y, 32, 1);
      const offset = ((y / 8) % 2) * 8;
      for (let x = offset; x < 32; x += 16) {
        ctx.fillRect(x, y, 1, 8);
        ctx.fillStyle = palette[1]; ctx.fillRect(x + 2, y + 2, 11, 4);
        ctx.fillStyle = palette[0];
      }
    }
    ctx.fillStyle = palette[1];
    for (let y = 2; y < 32; y += 8) for (let x = (y / 8 % 2) * 8 + 2; x < 32; x += 16) ctx.fillRect(x, y, 9, 3);
  } else if (type === 3) {
    ctx.fillStyle = palette[2]; ctx.fillRect(3, 3, 26, 26);
    ctx.strokeStyle = palette[1]; ctx.lineWidth = 2; ctx.strokeRect(5, 5, 22, 22);
    ctx.fillStyle = palette[3];
    [[8,8],[22,8],[8,22],[22,22]].forEach(([x,y]) => ctx.fillRect(x,y,2,2));
    ctx.fillStyle = '#9c9b8d'; ctx.fillRect(8, 15, 16, 2);
  } else {
    ctx.fillStyle = palette[2];
    for (let y = 0; y < 32; y += 8) {
      ctx.fillRect(0, y, 32, 1);
      const start = (y / 8 % 2) * 7;
      for (let x = start; x < 32; x += 14) ctx.fillRect(x, y, 1, 8);
    }
    ctx.fillStyle = palette[1];
    [[4,3],[18,5],[10,12],[25,18],[3,24],[17,27]].forEach(([x,y]) => ctx.fillRect(x,y,5,2));
  }
  // Ruido determinista: detalles ásperos sin cargar imágenes externas.
  for (let i = 0; i < 24; i++) {
    const x = (i * 17 + type * 7) % 31;
    const y = (i * 11 + type * 13) % 31;
    ctx.fillStyle = i % 2 ? '#ffffff18' : '#00000035';
    ctx.fillRect(x, y, 1 + (i % 3), 1);
  }
  return texture;
}

function makeFloorTexture() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#282528'; ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#383034'; ctx.fillRect(1, 1, 30, 30); ctx.fillRect(33, 33, 30, 30);
  ctx.fillStyle = '#171517'; ctx.fillRect(0, 31, 64, 2); ctx.fillRect(31, 0, 2, 64);
  ctx.fillStyle = '#6c3930'; ctx.fillRect(3, 4, 25, 2); ctx.fillRect(36, 37, 25, 2);
  ctx.fillStyle = '#0c0b0d'; ctx.fillRect(5, 5, 2, 2); ctx.fillRect(56, 54, 2, 2);
  return canvas;
}

function makeDemonSprite() {
  const canvas = document.createElement('canvas'); canvas.width = 32; canvas.height = 48;
  const c = canvas.getContext('2d'); c.imageSmoothingEnabled = false;
  const px = (x, y, w, h, color) => { c.fillStyle = color; c.fillRect(x, y, w, h); };
  px(10, 2, 5, 5, '#45141b'); px(17, 2, 5, 5, '#45141b');
  px(7, 7, 18, 10, '#8d2521'); px(4, 13, 24, 12, '#a9362a');
  px(8, 12, 5, 3, '#f2cf73'); px(20, 12, 5, 3, '#f2cf73');
  px(9, 17, 14, 3, '#211013'); px(12, 18, 3, 2, '#eee0c7'); px(18, 18, 3, 2, '#eee0c7');
  px(8, 24, 16, 8, '#6e211f'); px(5, 25, 5, 13, '#a9362a'); px(22, 25, 5, 13, '#a9362a');
  px(8, 31, 6, 10, '#581a1b'); px(18, 31, 6, 10, '#581a1b'); px(6, 40, 8, 5, '#32161a'); px(18, 40, 8, 5, '#32161a');
  px(2, 25, 5, 6, '#b13c2c'); px(25, 25, 5, 6, '#b13c2c'); px(3, 20, 3, 5, '#d04a30'); px(26, 20, 3, 5, '#d04a30');
  return canvas;
}

function makeMedkitSprite() {
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 16;
  const c = canvas.getContext('2d');
  c.fillStyle = '#d2c9ad'; c.fillRect(2, 4, 12, 10);
  c.fillStyle = '#40362d'; c.fillRect(2, 4, 12, 2); c.fillRect(2, 12, 12, 2);
  c.fillStyle = '#b62f2a'; c.fillRect(7, 5, 3, 8); c.fillRect(4, 8, 9, 3);
  return canvas;
}

export class HellfallGame {
  constructor(canvas, { onStatus = () => {}, onFinish = () => {} } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.onStatus = onStatus;
    this.onFinish = onFinish;
    this.textures = { 1: makeTexture(1), 2: makeTexture(2), 3: makeTexture(3) };
    this.floorTexture = makeFloorTexture();
    this.floorPixels = this.floorTexture.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    this.floorImageData = this.ctx.createImageData(WIDTH, Math.floor(VIEW_HEIGHT / 2) - 1);
    this.demonSprite = makeDemonSprite();
    this.medkitSprite = makeMedkitSprite();
    this.keys = new Set();
    this.zBuffer = new Float32Array(WIDTH);
    this.running = false;
    this.paused = false;
    this.finished = false;
    this.frameId = null;
    this.lastTime = 0;
    this.lastDamageTime = 0;
    this.shotUntil = 0;
    this.recoil = 0;
    this.muzzleFlash = 0;
    this.wasPointerLocked = false;
    this.boundLoop = (time) => this.loop(time);
    this.onKeyDown = (event) => this.handleKeyDown(event);
    this.onKeyUp = (event) => this.keys.delete(event.code);
    this.onMouseMove = (event) => this.handleMouseMove(event);
    this.onPointerLockChange = () => this.handlePointerLockChange();
    this.onCanvasClick = () => {
      if (!this.running || this.finished) return;
      if (document.pointerLockElement !== this.canvas && this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      } else this.shoot();
    };
    this.canvas.addEventListener('click', this.onCanvasClick);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    this.renderAttractScreen();
  }

  reset() {
    this.player = { x: 1.55, y: 1.55, angle: 0, health: 100, ammo: 12, reserve: 48, kills: 0 };
    this.startTime = performance.now();
    this.level = 1; 
    this.startLevel();
  }

  startLevel() {
    this.recoil = 0; 
    this.muzzleFlash = 0; 
    this.finished = false;
    
    // Regeneramos botiquines cada nivel
    this.medkits = [{ x: 5.5, y: 5.5, active: true }, { x: 11.5, y: 10.5, active: true }];

    // Puntos de aparición fijos en tu mapa
    const spawns = [
      { x: 7.5, y: 2.7 }, { x: 12.4, y: 4.4 }, { x: 8.3, y: 8.5 },
      { x: 3.5, y: 11.2 }, { x: 13.2, y: 12.5 }, { x: 2.5, y: 6.5 }, { x: 13.5, y: 2.5 }
    ];

    this.enemies = [];
    // Cada nivel hay más enemigos (máximo 7)
    const numEnemies = Math.min(spawns.length, 3 + this.level);
    const isBossLevel = this.level % 3 === 0;

    for(let i = 0; i < numEnemies; i++) {
      const isBoss = isBossLevel && i === 0; // El primer enemigo del nivel 3, 6, 9... es el Boss
      
      this.enemies.push({
        x: spawns[i].x,
        y: spawns[i].y,
        // El boss tiene 15 de vida + bonus, los normales escalan con el nivel
        health: isBoss ? 15 + (this.level * 2) : 2 + Math.floor(this.level / 2),
        // La velocidad base es 0.55, escalando cada nivel
        speedMultiplier: isBoss ? 0.75 : 1 + (this.level * 0.15),
        isBoss: isBoss,
        alive: true,
        cooldown: 0
      });
    }

    // Le damos un poco de munición extra al jugador por pasar de nivel
    this.player.reserve += 12; 
    
    if (isBossLevel) {
      this.onStatus(`NIVEL ${this.level}: ¡AMENAZA DE CLASE BOSS DETECTADA!`);
    } else {
      this.onStatus(`NIVEL ${this.level}: Despeja el área`);
    }
  }

  start() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.reset(); this.running = true; this.paused = false; this.lastTime = performance.now();
    this.onStatus('En misión');
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  destroy() {
    this.running = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.canvas.removeEventListener('click', this.onCanvasClick);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  handleKeyDown(event) {
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(event.code)) event.preventDefault();
    this.keys.add(event.code);
    if (event.code === 'Escape' && this.running && !this.finished) {
      if (!this.paused) this.pause();
      else this.resume();
    }
    if (event.code === 'Space' && !event.repeat) this.shoot();
    if (event.code === 'KeyR' && !event.repeat) this.reload();
  }

  handleKeyUp(event) { this.keys.delete(event.code); }

  handleMouseMove(event) {
    if (this.running && !this.paused && document.pointerLockElement === this.canvas) {
      this.player.angle += event.movementX * 0.0023;
    }
  }

  handlePointerLockChange() {
    const locked = document.pointerLockElement === this.canvas;
    if (this.wasPointerLocked && !locked && this.running && !this.finished && !this.paused) this.pause();
    this.wasPointerLocked = locked;
  }

  pause() {
    this.paused = true; this.onStatus('Pausado');
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.drawPauseScreen();
  }

  resume() {
    if (!this.running || this.finished) return;
    this.paused = false; this.lastTime = performance.now(); this.onStatus('En misión');
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  isWall(x, y) {
    const mx = Math.floor(x), my = Math.floor(y);
    if (my < 0 || mx < 0 || my >= MAP.length || mx >= MAP[0].length) return true;
    return MAP[my][mx] !== '0';
  }

  moveWithCollision(dx, dy) {
    const radius = 0.19;
    if (!this.isWall(this.player.x + dx + Math.sign(dx) * radius, this.player.y) && !this.isWall(this.player.x + dx, this.player.y + radius) && !this.isWall(this.player.x + dx, this.player.y - radius)) this.player.x += dx;
    if (!this.isWall(this.player.x + radius, this.player.y + dy) && !this.isWall(this.player.x - radius, this.player.y + dy) && !this.isWall(this.player.x, this.player.y + dy)) this.player.y += dy;
  }

  update(dt, now) {
    const player = this.player;
    if (this.keys.has('ArrowLeft')) player.angle -= dt * 1.9;
    if (this.keys.has('ArrowRight')) player.angle += dt * 1.9;
    
    const fast = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const speed = (fast ? 3.6 : 2.55) * dt;
    let forward = 0, strafe = 0;
    
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += speed;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= speed;
    if (this.keys.has('KeyA')) strafe -= speed;
    if (this.keys.has('KeyD')) strafe += speed;
    
    const dx = Math.cos(player.angle) * forward + Math.cos(player.angle + Math.PI / 2) * strafe;
    const dy = Math.sin(player.angle) * forward + Math.sin(player.angle + Math.PI / 2) * strafe;
    if (dx || dy) this.moveWithCollision(dx, dy);

    for (const medkit of this.medkits) {
      // Usar Math.hypot nativo para calcular distancias de forma segura
      if (medkit.active && Math.hypot(player.x - medkit.x, player.y - medkit.y) < 0.5 && player.health < 100) {
        player.health = Math.min(100, player.health + 30); medkit.active = false;
      }
    }

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      
      if (dist > 1.15 && dist < 9) {
        // APLICAMOS EL MULTIPLICADOR DE VELOCIDAD DE NIVEL
        const speedEnemy = (0.55 * enemy.speedMultiplier) * dt;
        const ex = (player.x - enemy.x) / dist * speedEnemy;
        const ey = (player.y - enemy.y) / dist * speedEnemy;
        if (!this.isWall(enemy.x + ex, enemy.y)) enemy.x += ex;
        if (!this.isWall(enemy.x, enemy.y + ey)) enemy.y += ey;
      } else if (dist <= 1.15 && enemy.cooldown <= 0) {
        // El Boss quita 25 de vida de un golpe, los normales 9
        const damage = enemy.isBoss ? 25 : 9;
        player.health = Math.max(0, player.health - damage);
        enemy.cooldown = 0.8;
        this.lastDamageTime = now;
      }
    }
    
    this.recoil = Math.max(0, this.recoil - dt * 2.6);
    this.muzzleFlash = Math.max(0, this.muzzleFlash - dt * 5);
    
    if (player.health <= 0) {
      this.finish(false);
    } else if (this.enemies.every((enemy) => !enemy.alive)) {
      // SI MUEREN TODOS, SUBIMOS DE NIVEL EN LUGAR DE TERMINAR
      if (this.level >= 5) {
        this.finish(true); // Ganas el juego en el nivel 5
      } else {
        this.level++;
        this.startLevel();
      }
    }
  }

  shoot() {
    if (!this.running || this.paused || this.finished || this.player.ammo <= 0) return;
    const now = performance.now();
    if (now < this.shotUntil) return;
    this.shotUntil = now + 290;
    this.player.ammo -= 1; this.recoil = 1; this.muzzleFlash = 1;
    let selected = null; let best = Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.player.x, dy = enemy.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const delta = Math.atan2(Math.sin(angle - this.player.angle), Math.cos(angle - this.player.angle));
      if (Math.abs(delta) < Math.max(0.055, 0.13 / Math.max(1, dist)) && dist < best && dist < 9 && this.lineOfSight(this.player.x, this.player.y, enemy.x, enemy.y)) {
        selected = enemy; best = dist;
      }
    }
    if (selected) {
      selected.health -= 1;
      if (selected.health <= 0) { selected.alive = false; this.player.kills += 1; }
    }
    if (this.player.ammo === 0 && this.player.reserve > 0) this.onStatus('Sin munición: pulsa R');
  }

  reload() {
    if (!this.running || this.paused || this.finished || this.player.ammo >= 12 || this.player.reserve <= 0) return;
    const needed = 12 - this.player.ammo;
    const loaded = Math.min(needed, this.player.reserve);
    this.player.ammo += loaded; this.player.reserve -= loaded;
    this.shotUntil = performance.now() + 200;
  }

  lineOfSight(x1, y1, x2, y2) {
    const steps = Math.ceil(distance(x1, y1, x2, y2) * 10);
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.isWall(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return false;
    }
    return true;
  }

  finish(won) {
    if (this.finished) return;
    this.finished = true; this.running = false; this.paused = false;
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.renderWorld(performance.now());
    this.drawHUD();
    this.onStatus(won ? 'Sector despejado' : 'Agente caído');
    this.onFinish({ won, kills: this.player.kills, durationMs: Math.max(1000, Math.round(performance.now() - this.startTime)) });
  }

  loop(now) {
    if (!this.running || this.paused || this.finished) return;
    const dt = clamp((now - this.lastTime) / 1000, 0, 0.045);
    this.lastTime = now;
    this.update(dt, now);
    if (!this.finished) {
      this.renderWorld(now);
      this.drawHUD();
      this.frameId = requestAnimationFrame(this.boundLoop);
    }
  }

  renderAttractScreen() {
    const c = this.ctx;
    c.fillStyle = '#08090c'; c.fillRect(0, 0, WIDTH, HEIGHT);
    for (let y = 0; y < 90; y += 2) { c.fillStyle = `rgb(${12 + y / 9},${13 + y / 10},${19 + y / 7})`; c.fillRect(0, y, WIDTH, 2); }
    c.fillStyle = '#312527'; c.fillRect(0, 86, WIDTH, 90);
    for (let x = 0; x < WIDTH; x += 16) c.fillRect(x, 88, 1, 88);
    for (let y = 88; y < 176; y += 12) c.fillRect(0, y, WIDTH, 1);
    c.fillStyle = '#0b090b'; c.fillRect(85, 42, 150, 100); c.fillStyle = '#4a2222'; c.fillRect(91, 47, 138, 90); c.fillStyle = '#111014'; c.fillRect(98, 53, 124, 79);
    c.fillStyle = '#e64735'; c.font = 'bold 27px monospace'; c.textAlign = 'center'; c.fillText('HELLFALL', WIDTH / 2, 82);
    c.fillStyle = '#e1cfc2'; c.font = '8px monospace'; c.fillText('SECTOR 09 // AWAITING DEPLOYMENT', WIDTH / 2, 97);
    c.fillStyle = '#e84b38'; c.fillRect(0, 176, WIDTH, 24); c.fillStyle = '#100c0d'; c.font = 'bold 10px monospace'; c.fillText('PRESS DEPLOY TO BEGIN', WIDTH / 2, 191);
  }

  renderWorld(now) {
    const c = this.ctx;
    const px = this.player.x, py = this.player.y;
    const dirX = Math.cos(this.player.angle), dirY = Math.sin(this.player.angle);
    const planeX = -dirY * FOV_PLANE, planeY = dirX * FOV_PLANE;
    const horizon = VIEW_HEIGHT / 2;
    // Cielo con bandas y zonas rojas en la distancia.
    for (let y = 0; y < horizon; y++) {
      const mix = y / horizon;
      const r = Math.floor(13 + mix * 23), g = Math.floor(15 + mix * 8), b = Math.floor(22 + mix * 4);
      c.fillStyle = `rgb(${r},${g},${b})`; c.fillRect(0, y, WIDTH, 1);
    }
    c.fillStyle = '#4e211f'; c.fillRect(0, horizon - 2, WIDTH, 3);
    // Floor casting: cada píxel inferior se texturiza en perspectiva.
    const floorPixels = this.floorPixels;
    for (let y = horizon + 1; y < VIEW_HEIGHT; y++) {
      const outputY = y - (horizon + 1);
      const p = y - horizon;
      const rowDistance = (0.5 * VIEW_HEIGHT) / p;
      const rayDirX0 = dirX - planeX, rayDirY0 = dirY - planeY;
      const rayDirX1 = dirX + planeX, rayDirY1 = dirY + planeY;
      const stepX = rowDistance * (rayDirX1 - rayDirX0) / WIDTH;
      const stepY = rowDistance * (rayDirY1 - rayDirY0) / WIDTH;
      let floorX = px + rowDistance * rayDirX0;
      let floorY = py + rowDistance * rayDirY0;
      for (let x = 0; x < WIDTH; x++) {
        const cellX = Math.floor(floorX), cellY = Math.floor(floorY);
        const tx = Math.floor(64 * (floorX - cellX)) & 63;
        const ty = Math.floor(64 * (floorY - cellY)) & 63;
        const sx = (tx + cellX * 3) & 63, sy = (ty + cellY * 3) & 63;
        const pixelIndex = (sy * 64 + sx) * 4;
        const shade = clamp(1 - rowDistance * 0.09, 0.14, 0.78);
        const outputIndex = (outputY * WIDTH + x) * 4;
        this.floorImageData.data[outputIndex] = Math.floor(floorPixels[pixelIndex] * shade);
        this.floorImageData.data[outputIndex + 1] = Math.floor(floorPixels[pixelIndex + 1] * shade);
        this.floorImageData.data[outputIndex + 2] = Math.floor(floorPixels[pixelIndex + 2] * shade);
        this.floorImageData.data[outputIndex + 3] = 255;
        floorX += stepX; floorY += stepY;
      }
    }
    c.putImageData(this.floorImageData, 0, horizon + 1);
    // DDA raycasting: cada columna busca la primera pared que cruza el rayo.
    for (let x = 0; x < WIDTH; x++) {
      const cameraX = 2 * x / WIDTH - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;
      let mapX = Math.floor(px), mapY = Math.floor(py);
      const deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
      const deltaDistY = Math.abs(1 / (rayDirY || 0.00001));
      let sideDistX, sideDistY;
      const stepX = rayDirX < 0 ? -1 : 1;
      const stepY = rayDirY < 0 ? -1 : 1;
      if (rayDirX < 0) sideDistX = (px - mapX) * deltaDistX; else sideDistX = (mapX + 1 - px) * deltaDistX;
      if (rayDirY < 0) sideDistY = (py - mapY) * deltaDistY; else sideDistY = (mapY + 1 - py) * deltaDistY;
      let side = 0, steps = 0;
      while (steps++ < 40) {
        if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; }
        else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
        if (mapY < 0 || mapX < 0 || mapY >= MAP.length || mapX >= MAP[0].length || MAP[mapY][mapX] !== '0') break;
      }
      const rawDist = side === 0 ? sideDistX - deltaDistX : sideDistY - deltaDistY;
      const wallDist = Math.max(0.001, rawDist);
      this.zBuffer[x] = wallDist;
      const wallHeight = Math.min(VIEW_HEIGHT * 2, Math.floor(VIEW_HEIGHT / wallDist));
      const drawStart = Math.max(0, Math.floor(horizon - wallHeight / 2));
      const drawEnd = Math.min(VIEW_HEIGHT - 1, Math.floor(horizon + wallHeight / 2));
      let wallX = side === 0 ? py + wallDist * rayDirY : px + wallDist * rayDirX;
      wallX -= Math.floor(wallX);
      let texX = Math.floor(wallX * 32);
      if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) texX = 31 - texX;
      const tile = Number(MAP[mapY]?.[mapX] || '1');
      const texture = this.textures[tile] || this.textures[1];
      const darkness = clamp(1 - wallDist * 0.075, 0.18, 0.9) * (side === 1 ? 0.72 : 1);
      c.drawImage(texture, texX, 0, 1, 32, x, drawStart, 1, Math.max(1, drawEnd - drawStart));
      if (darkness < 0.98) {
        c.fillStyle = `rgba(0,0,0,${1 - darkness})`;
        c.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }
      if (tile === 2 && wallDist < 5 && (x % 23) < 2) { c.fillStyle = 'rgba(210,45,31,0.13)'; c.fillRect(x, drawStart, 1, drawEnd - drawStart); }
    }
    this.renderBillboards(dirX, dirY, planeX, planeY, now);
    this.drawCrosshair();
    this.drawWeapon(now);
    if (now - this.lastDamageTime < 230) { c.fillStyle = `rgba(220,20,23,${0.15 * (1 - (now - this.lastDamageTime) / 230)})`; c.fillRect(0, 0, WIDTH, VIEW_HEIGHT); }
    const vignette = c.createRadialGradient(WIDTH / 2, VIEW_HEIGHT / 2, 35, WIDTH / 2, VIEW_HEIGHT / 2, 180);
    vignette.addColorStop(0, 'rgba(0,0,0,0)'); vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
    c.fillStyle = vignette; c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
  }

  renderBillboards(dirX, dirY, planeX, planeY, now) {
    const c = this.ctx;
    const objects = [
      ...this.enemies.filter((enemy) => enemy.alive).map((enemy) => ({ ...enemy, type: 'enemy', sprite: this.demonSprite })),
      ...this.medkits.filter((item) => item.active).map((item) => ({ ...item, type: 'medkit', sprite: this.medkitSprite }))
    ];
    
    // Usamos Math.hypot para evitar problemas con distancias
    objects.sort((a, b) => 
      Math.hypot(this.player.x - b.x, this.player.y - b.y) - 
      Math.hypot(this.player.x - a.x, this.player.y - a.y)
    );
    
    const invDet = 1.0 / (planeX * dirY - dirX * planeY);
    
    for (const object of objects) {
      const spriteX = object.x - this.player.x;
      const spriteY = object.y - this.player.y;
      
      const transformX = invDet * (dirY * spriteX - dirX * spriteY);
      const transformY = invDet * (-planeY * spriteX + planeX * spriteY);
      
      if (transformY <= 0.15) continue;
      
      const spriteScreenX = Math.floor((WIDTH / 2) * (1 + transformX / transformY));
      
      // AQUÍ ESTÁ LA MAGIA DEL BOSS: Si es jefe, su escala es 1.45 (gigante)
      const scale = object.type === 'medkit' ? 0.42 : (object.isBoss ? 1.45 : 0.94);
      const spriteHeight = Math.abs(Math.floor(VIEW_HEIGHT / transformY)) * scale;
      const spriteWidth = spriteHeight * (object.type === 'medkit' ? 1 : 0.67);
      
      const drawStartY = Math.max(0, Math.floor(VIEW_HEIGHT / 2 - spriteHeight / 2));
      const drawEndY = Math.min(VIEW_HEIGHT - 1, Math.floor(VIEW_HEIGHT / 2 + spriteHeight / 2));
      
      const drawStartX = Math.max(0, Math.floor(spriteScreenX - spriteWidth / 2));
      const drawEndX = Math.min(WIDTH - 1, Math.floor(spriteScreenX + spriteWidth / 2));
      
      for (let stripe = drawStartX; stripe <= drawEndX; stripe++) {
        if (transformY >= this.zBuffer[stripe]) continue;
        
        const texX = Math.floor((stripe - (spriteScreenX - spriteWidth / 2)) * object.sprite.width / Math.max(1, spriteWidth));
        
        c.drawImage(
          object.sprite, 
          clamp(texX, 0, object.sprite.width - 1), 
          0, 
          1, 
          object.sprite.height, 
          stripe, 
          drawStartY, 
          1, 
          drawEndY - drawStartY
        );
        
        // Efecto visual: si al enemigo (o boss) le queda 1 de vida, parpadea en rojo
        if (object.type === 'enemy' && object.health <= 2 && stripe % 4 === 0) { 
          c.fillStyle = '#d54730'; 
          c.fillRect(stripe, drawStartY, 1, 2); 
        }
      }
    }
  }

  drawCrosshair() {
    const c = this.ctx;
    c.fillStyle = '#f3dcc2'; c.fillRect(WIDTH / 2 - 4, VIEW_HEIGHT / 2, 3, 1); c.fillRect(WIDTH / 2 + 2, VIEW_HEIGHT / 2, 3, 1);
    c.fillRect(WIDTH / 2, VIEW_HEIGHT / 2 - 4, 1, 3); c.fillRect(WIDTH / 2, VIEW_HEIGHT / 2 + 2, 1, 3);
  }

  drawWeapon(now) {
    const c = this.ctx;
    const recoilY = this.recoil * 5;
    const center = WIDTH / 2;
    c.fillStyle = '#09090b'; c.fillRect(center - 34, VIEW_HEIGHT - 29 + recoilY, 68, 30);
    c.fillStyle = '#24282b'; c.fillRect(center - 25, VIEW_HEIGHT - 34 + recoilY, 50, 35);
    c.fillStyle = '#57534a'; c.fillRect(center - 19, VIEW_HEIGHT - 45 + recoilY, 38, 20);
    c.fillStyle = '#131517'; c.fillRect(center - 13, VIEW_HEIGHT - 54 + recoilY, 10, 25); c.fillRect(center + 3, VIEW_HEIGHT - 54 + recoilY, 10, 25);
    c.fillStyle = '#7e3329'; c.fillRect(center - 22, VIEW_HEIGHT - 18 + recoilY, 44, 12);
    c.fillStyle = '#c15b3b'; c.fillRect(center - 15, VIEW_HEIGHT - 15 + recoilY, 30, 2);
    if (this.muzzleFlash > 0.15) {
      c.fillStyle = '#ffdf84'; c.fillRect(center - 7, VIEW_HEIGHT - 62 + recoilY, 14, 9);
      c.fillStyle = '#f34b2e'; c.fillRect(center - 12, VIEW_HEIGHT - 57 + recoilY, 24, 6);
    }
  }

  drawHUD() {
    const c = this.ctx;
    c.fillStyle = '#0b090b'; c.fillRect(0, VIEW_HEIGHT, WIDTH, HUD_HEIGHT);
    c.fillStyle = '#5a332e'; c.fillRect(0, VIEW_HEIGHT, WIDTH, 1);
    c.fillStyle = '#cfbcb0'; c.font = 'bold 8px monospace'; c.textAlign = 'left';
    c.fillText('HEALTH', 7, 188); c.fillText('AMMO', 118, 188); c.fillText('KILLS', 224, 188);
    c.fillStyle = this.player.health > 30 ? '#e1d3b7' : '#f04a3b'; c.font = 'bold 12px monospace'; c.fillText(String(this.player.health).padStart(3, '0'), 7, 198);
    c.fillStyle = '#e1d3b7'; c.fillText(`${String(this.player.ammo).padStart(2, '0')}/${String(this.player.reserve).padStart(2, '0')}`, 118, 198);
    c.fillStyle = '#f2b565'; c.fillText(String(this.player.kills).padStart(2, '0'), 224, 198);
    c.fillStyle = '#7c6860'; c.font = '6px monospace'; c.textAlign = 'right'; c.fillText('HELLFALL // SECTOR 09', WIDTH - 6, 198);
    const healthWidth = Math.max(0, this.player.health) / 100 * 65;
    c.fillStyle = '#372122'; c.fillRect(48, 181, 65, 7); c.fillStyle = '#b83a30'; c.fillRect(48, 181, healthWidth, 7);
  }

  drawPauseScreen() {
    const c = this.ctx;
    c.fillStyle = 'rgba(7,5,7,0.82)'; c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    c.fillStyle = '#d94735'; c.font = 'bold 27px monospace'; c.textAlign = 'center'; c.fillText('PAUSED', WIDTH / 2, 77);
    c.fillStyle = '#eee0d1'; c.font = '8px monospace'; c.fillText('PRESS ESC TO RESUME', WIDTH / 2, 95);
    this.drawHUD();
  }
}
