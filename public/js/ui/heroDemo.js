import { makeEnemyAnimationSet, getTintedSprite, VOXEL_SPECIES_SPECS } from '../game/voxels.js';
import { makeWeaponSprites, makeGrenadeSprite, makePlasmaBoltSprite } from '../game/weapons.js';
import { drawCharacterFace } from '../game/portrait.js';

let cachedBestiarySets = null;
let demoAssets = null;
let demoFrameId = null;

function ensureDemoAssets() {
  if (!demoAssets) {
    demoAssets = {
      weapons: makeWeaponSprites(),
      grenade: [makeGrenadeSprite(0), makeGrenadeSprite(1)],
      plasma: [makePlasmaBoltSprite(0), makePlasmaBoltSprite(1)],
      imp: makeEnemyAnimationSet('IMP', VOXEL_SPECIES_SPECS.IMP.baseHex),
      shield: makeEnemyAnimationSet('SHIELD', VOXEL_SPECIES_SPECS.SHIELD.baseHex),
      revenant: makeEnemyAnimationSet('REVENANT', VOXEL_SPECIES_SPECS.REVENANT.baseHex),
      cacodemon: makeEnemyAnimationSet('CACODEMON', VOXEL_SPECIES_SPECS.CACODEMON.baseHex)
    };
  }
  return demoAssets;
}

export function renderBestiaryPortraits() {
  const canvases = document.querySelectorAll('.bestiary-sprite-canvas[data-species]');
  if (canvases.length === 0) return;

  if (!cachedBestiarySets) {
    cachedBestiarySets = {
      SHIELD: makeEnemyAnimationSet('SHIELD', VOXEL_SPECIES_SPECS.SHIELD.baseHex),
      REVENANT: makeEnemyAnimationSet('REVENANT', VOXEL_SPECIES_SPECS.REVENANT.baseHex),
      SUMMONER: makeEnemyAnimationSet('SUMMONER', VOXEL_SPECIES_SPECS.SUMMONER.baseHex)
    };
  }

  canvases.forEach((cv) => {
    const kind = cv.dataset.species;
    const set = cachedBestiarySets[kind];
    if (!set) return;
    const sprite = set.getWalk(0, 0);
    const ctx = cv.getContext('2d');
    if (!ctx || !sprite) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const scale = Math.min((cv.width - 8) / sprite.width, (cv.height - 6) / sprite.height);
    const dw = Math.floor(sprite.width * scale);
    const dh = Math.floor(sprite.height * scale);
    const dx = Math.floor((cv.width - dw) / 2);
    const dy = Math.floor(cv.height - dh - 2);
    ctx.drawImage(sprite, dx, dy, dw, dh);
  });
}

function drawCorridorFrame(ctx, assets, cycleSec, now) {
  const W = 320;
  const H = 168;
  const HUD_H = 32;
  ctx.imageSmoothingEnabled = false;

  // 1. Cielo / techo abisal + suelo con líneas de perspectiva
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.52);
  sky.addColorStop(0, '#120306');
  sky.addColorStop(1, '#580c09');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.52);

  const floor = ctx.createLinearGradient(0, H * 0.52, 0, H);
  floor.addColorStop(0, '#2a0d0e');
  floor.addColorStop(1, '#100607');
  ctx.fillStyle = floor;
  ctx.fillRect(0, H * 0.52, W, H * 0.48);

  const scroll = (cycleSec * 1.35) % 1;
  ctx.fillStyle = '#4f1b1d';
  for (let i = 0; i < 5; i++) {
    const t = ((i + (1 - scroll)) / 5);
    const fy = Math.floor(H * 0.52 + t * t * (H * 0.48));
    ctx.fillRect(0, fy, W, 1);
  }

  // 2. Columnas laterales en 2.5D avanzando en bucle
  const swayX = Math.sin(cycleSec * 2.1) * 8;
  for (let depth = 3; depth >= 0; depth--) {
    const p = Math.max(0.08, ((depth + 1 - scroll) / 4));
    const wallX = Math.floor(W * 0.5 - p * 126 + swayX * (1 - p));
    const wallR = Math.floor(W * 0.5 + p * 126 + swayX * (1 - p));
    const wallTop = Math.floor(H * 0.5 - p * 68);
    const wallBot = Math.floor(H * 0.5 + p * 68);
    const colW = Math.max(4, Math.floor(14 * p));
    ctx.fillStyle = depth % 2 === 0 ? '#3a1416' : '#260c0e';
    ctx.fillRect(Math.max(0, wallX - colW), wallTop, colW, wallBot - wallTop);
    ctx.fillRect(Math.min(W - colW, wallR), wallTop, colW, wallBot - wallTop);
    ctx.fillStyle = '#ff4d00';
    ctx.fillRect(Math.max(0, wallX - 2), wallTop + 10, 2, Math.max(3, Math.floor((wallBot - wallTop) * 0.12)));
    ctx.fillRect(Math.min(W - 2, wallR), wallTop + 10, 2, Math.max(3, Math.floor((wallBot - wallTop) * 0.12)));
  }

  // 3. Fases reales de combate durante el bucle de 9 segundos
  const phase = cycleSec % 9;
  const walkIdx = Math.floor(cycleSec * 7) % 4;
  let weaponType = 'shotgun';
  let flashActive = false;
  let recoilY = 0;
  let bannerText = 'SECTOR 04 // COMBATE EN DIRECTO';

  if (phase < 3.0) {
    // Fase 1: Escopeta contra Imp / Revenant
    const prog = phase / 3.0;
    const revSprite = assets.revenant.getWalk(0, walkIdx);
    const impSprite = assets.imp.getWalk(1, (walkIdx + 2) % 4);
    const impDist = 0.65 + prog * 0.25;
    ctx.drawImage(impSprite, Math.floor(92 + swayX - 28 * impDist), Math.floor(88 - 22 * impDist), Math.floor(54 * impDist), Math.floor(72 * impDist));

    const hitPulse = (phase > 1.05 && phase < 1.3) || (phase > 2.25 && phase < 2.5);
    flashActive = (phase > 1.0 && phase < 1.18) || (phase > 2.2 && phase < 2.38);
    recoilY = flashActive ? 7 : 0;
    const rScale = 0.8 + prog * 0.45;
    const drawRev = hitPulse ? getTintedSprite(revSprite, '#fff3b0') : revSprite;
    ctx.drawImage(drawRev, Math.floor(178 + swayX - (drawRev.width * rScale) / 2), Math.floor(92 - (drawRev.height * rScale) / 2), Math.floor(drawRev.width * rScale), Math.floor(drawRev.height * rScale));
  } else if (phase < 6.0) {
    // Fase 2: Centinela del Escudo -> Granada EMP [G] rompe su escudo
    const prog = (phase - 3.0) / 3.0;
    const shieldSprite = assets.shield.getWalk(0, walkIdx);
    const guardBroken = prog > 0.56;
    const sScale = 1.05 + Math.sin(prog * Math.PI) * 0.12;
    let drawn = shieldSprite;
    if (prog > 0.25 && prog <= 0.56) drawn = getTintedSprite(shieldSprite, '#00b4d8');
    else if (guardBroken) drawn = getTintedSprite(shieldSprite, Math.floor(now / 120) % 2 === 0 ? '#ff9e00' : '#00f5d4');
    ctx.drawImage(drawn, Math.floor(160 + swayX - (drawn.width * sScale) / 2), Math.floor(90 - (drawn.height * sScale) / 2), Math.floor(drawn.width * sScale), Math.floor(drawn.height * sScale));

    if (prog < 0.56) {
      const gScale = 1.1 - prog * 1.1;
      const gx = Math.floor(160 + swayX + (1 - prog * 1.8) * 14);
      const gy = Math.floor(118 - Math.sin(prog * Math.PI * 1.7) * 42);
      const gr = assets.grenade[Math.floor(now / 100) % 2];
      ctx.drawImage(gr, gx - Math.floor((20 * gScale) / 2), gy - Math.floor((20 * gScale) / 2), Math.floor(20 * gScale), Math.floor(20 * gScale));
      bannerText = '[G] GRANADA EMP LANZADA';
    } else {
      if (prog < 0.72) {
        const ringR = Math.floor((prog - 0.56) * 280);
        ctx.strokeStyle = '#00f5d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(160 + swayX, 92, ringR, 0, Math.PI * 2);
        ctx.stroke();
      }
      flashActive = prog > 0.72 && prog < 0.85;
      recoilY = flashActive ? 8 : 0;
      bannerText = '¡ESCUDO QUEBRADO!';
    }
  } else {
    // Fase 3: Rifle Plasma contra Cacodemonio flotante
    weaponType = 'plasma';
    const prog = (phase - 6.0) / 3.0;
    const cacoSprite = assets.cacodemon.getCharge(0, Math.floor(now / 160) % 2);
    const bob = Math.sin(now * 0.007) * 6;
    const hitCaco = Math.floor(prog * 8) % 2 === 1 && prog > 0.25;
    const drawn = hitCaco ? getTintedSprite(cacoSprite, '#00f5d4') : cacoSprite;
    ctx.drawImage(drawn, Math.floor(160 + swayX - drawn.width / 2), Math.floor(42 + bob), drawn.width, drawn.height);

    const bolt = assets.plasma[Math.floor(now / 80) % 2];
    const bProg = (prog * 3) % 1;
    const bx = Math.floor(160 + swayX);
    const by = Math.floor(136 - bProg * 68);
    ctx.drawImage(bolt, bx - 10, by - 10, 20, 20);
    flashActive = bProg < 0.35;
    recoilY = flashActive ? 4 : 0;
    bannerText = 'RIFLE PLASMA [6] · SECTOR 09';
  }

  // 4. Arma del jugador en primer plano + fogonazo
  const wx = Math.floor(W / 2 - 44 + Math.cos(cycleSec * 4) * 3);
  const wy = Math.floor(H - 86 + recoilY + Math.abs(Math.sin(cycleSec * 4)) * 3);
  if (weaponType === 'plasma') {
    if (flashActive) ctx.drawImage(assets.weapons.plasma.flash, wx + 22, wy - 16, 46, 30);
    ctx.drawImage(assets.weapons.plasma.frames[flashActive ? 1 : 0], wx, wy, 88, 86);
  } else {
    if (flashActive) ctx.drawImage(assets.weapons.shotgun.flash, wx + 18, wy - 20, 52, 34);
    ctx.drawImage(flashActive ? assets.weapons.shotgun.pump0 : assets.weapons.shotgun.idle, wx, wy, 88, 86);
  }

  // Mira central y barra táctica superior
  ctx.fillStyle = 'rgba(255, 243, 176, 0.9)';
  ctx.fillRect(W / 2 - 4, H / 2, 3, 1);
  ctx.fillRect(W / 2 + 2, H / 2, 3, 1);
  ctx.fillRect(W / 2, H / 2 - 4, 1, 3);
  ctx.fillRect(W / 2, H / 2 + 2, 1, 3);

  ctx.fillStyle = 'rgba(14, 6, 8, 0.78)';
  ctx.fillRect(6, 6, 174, 14);
  ctx.fillStyle = phase >= 3 && phase < 6 ? '#00f5d4' : '#ffbe0b';
  ctx.font = 'bold 6.5px monospace';
  ctx.fillText(bannerText, 12, 15.5);

  // 5. Barra HUD retro fiel a 320x200
  ctx.fillStyle = '#3c3f41';
  ctx.fillRect(0, H, W, HUD_H);
  ctx.fillStyle = '#1b1d1e';
  ctx.fillRect(0, H, W, 1);
  drawCharacterFace(ctx, 144, H + 1, {
    hp: 94,
    isHit: false,
    isGrin: phase >= 4.7 && phase < 6.0,
    isFiring: flashActive,
    lookDir: Math.floor(cycleSec) % 3 - 1,
    now
  });
  ctx.fillStyle = '#d90429';
  ctx.font = 'bold 11px monospace';
  ctx.fillText(weaponType === 'plasma' ? '140' : '14/28', 10, H + 18);
  ctx.fillText('94%', 72, H + 18);
  ctx.fillStyle = '#70e000';
  ctx.fillText('80%', 190, H + 18);
  ctx.fillStyle = '#ffbe0b';
  ctx.font = 'bold 7px monospace';
  ctx.fillText('S04  K:048  G:3', 240, H + 18);
}

export function stopHeroGameplayDemo() {
  if (demoFrameId) {
    cancelAnimationFrame(demoFrameId);
    demoFrameId = null;
  }
}

export function startHeroGameplayDemo(canvas, { reducedMotion = false } = {}) {
  stopHeroGameplayDemo();
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const assets = ensureDemoAssets();

  if (reducedMotion) {
    drawCorridorFrame(ctx, assets, 4.8, performance.now());
    return;
  }

  const startMs = performance.now();
  const loop = (now) => {
    if (!canvas.isConnected || canvas.classList.contains('hidden')) {
      demoFrameId = null;
      return;
    }
    const elapsedSec = (now - startMs) / 1000;
    drawCorridorFrame(ctx, assets, elapsedSec, now);
    demoFrameId = requestAnimationFrame(loop);
  };
  demoFrameId = requestAnimationFrame(loop);
}
