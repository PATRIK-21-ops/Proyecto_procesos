// ============================================================================
// SPRITES HD DE ARMAS (1..7), PROYECTILES Y OBJETIVOS DE SECTOR
// ============================================================================

function mkCanvas(w, h, fn) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const c = cv.getContext('2d');
  fn(c, w, h);
  return cv;
}

function px(c, x, y, w, h, col) {
  c.fillStyle = col;
  c.fillRect(x, y, w, h);
}

function frameRect(c, x, y, w, h, border, fill) {
  px(c, x - 2, y - 2, w + 4, h + 4, border);
  px(c, x, y, w, h, fill);
}

function buildStarFlash(w, h, coreR, outerCol = 'rgba(217, 4, 41, 0.85)', midCol = '#ff4d00', innerCol = '#ffbe0b', coreCol = '#fff3b0') {
  return mkCanvas(w, h, (c) => {
    const cx = w / 2;
    const cy = h * 0.56;
    const drawSpikes = (col, rx, ry) => {
      c.fillStyle = col;
      c.beginPath();
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const m = i % 2 === 0 ? 1.0 : 0.42;
        const vx = cx + Math.cos(a) * rx * m;
        const vy = cy + Math.sin(a) * ry * m;
        if (i === 0) c.moveTo(vx, vy);
        else c.lineTo(vx, vy);
      }
      c.closePath();
      c.fill();
    };
    drawSpikes(outerCol, w * 0.48, h * 0.46);
    drawSpikes(midCol, w * 0.38, h * 0.36);
    drawSpikes(innerCol, w * 0.25, h * 0.24);
    drawSpikes(coreCol, coreR, coreR * 0.8);
  });
}

export function makeWeaponSprites() {
  // --- PUÑOS BLINDADOS UAC ---
  const buildFist = (empowered) => mkCanvas(140, 160, (c) => {
    const cx = 70;
    const fy = 48;
    frameRect(c, cx - 28, fy + 8, 56, 98, '#140708', '#2a4a31');
    px(c, cx - 24, fy + 16, 48, 86, empowered ? '#4d1924' : '#386641');
    px(c, cx - 18, fy + 18, 22, 80, empowered ? '#800f2f' : '#6a994e');
    px(c, cx + 6, fy + 18, 12, 80, empowered ? '#590d22' : '#2d5234');
    frameRect(c, cx - 30, fy - 2, 60, 16, '#140708', '#495057');
    px(c, cx - 26, fy, 52, 5, '#adb5bd');
    px(c, cx - 20, fy + 7, 40, 4, empowered ? '#ffbe0b' : '#6c757d');
    frameRect(c, cx - 34, fy - 28, 68, 42, '#140708', empowered ? '#d90429' : '#c68b67');
    px(c, cx - 30, fy - 24, 38, 18, empowered ? '#ff4d00' : '#e0ac8b');
    px(c, cx - 26, fy - 26, 20, 6, empowered ? '#ffbe0b' : '#f2cbb2');
    for (let k = -26; k <= 16; k += 14) {
      px(c, cx + k, fy - 23, 10, 12, '#140708');
      px(c, cx + k + 1, fy - 22, 8, 9, empowered ? '#ffbe0b' : '#d4a373');
      px(c, cx + k + 2, fy - 21, 5, 4, empowered ? '#fff3b0' : '#f2cbb2');
    }
    frameRect(c, cx - 36, fy - 12, 24, 14, '#140708', empowered ? '#a31621' : '#b87d5a');
  });

  // --- [1] SUPER ESCOPETA DOOM ---
  const buildShotgun = (pumpStage) => mkCanvas(168, 176, (c) => {
    const cx = 84;
    const by = 176;
    const forendY = pumpStage === 0 ? 0 : (pumpStage === 1 ? 14 : 6);
    const tilt = pumpStage === 0 ? 0 : (pumpStage === 1 ? -12 : -6);

    c.save();
    if (tilt !== 0) {
      c.translate(cx, by - 24);
      c.rotate((tilt * Math.PI) / 180);
      c.translate(-cx, -(by - 24));
    }

    frameRect(c, cx - 32, by - 110, 64, 62, '#140708', '#1b1d22');
    for (const bx of [cx - 30, cx + 4]) {
      px(c, bx, by - 108, 26, 58, '#2b3038');
      px(c, bx + 4, by - 106, 10, 54, '#6c757d');
      px(c, bx + 7, by - 106, 4, 52, '#dee2e6');
      px(c, bx + 18, by - 106, 6, 54, '#1b1d22');
      px(c, bx + 4, by - 110, 18, 5, '#07080a');
    }
    px(c, cx - 4, by - 106, 8, 54, '#140708');
    px(c, cx - 2, by - 104, 4, 50, '#495057');
    px(c, cx - 2, by - 114, 4, 7, '#ffbe0b');
    px(c, cx - 1, by - 114, 2, 3, '#fff3b0');

    frameRect(c, cx - 40, by - 58 + forendY, 80, 34, '#140708', '#343a40');
    px(c, cx - 34, by - 55 + forendY, 68, 26, '#6c757d');
    px(c, cx - 26, by - 55 + forendY, 22, 24, '#adb5bd');
    for (let ry = by - 52 + forendY; ry < by - 31 + forendY; ry += 6) {
      px(c, cx - 36, ry, 72, 2, '#140708');
    }
    px(c, cx - 34, by - 46 + forendY, 4, 4, '#dee2e6');
    px(c, cx + 30, by - 46 + forendY, 4, 4, '#dee2e6');

    frameRect(c, cx - 48, by - 34, 96, 34, '#140708', '#4a2511');
    px(c, cx - 42, by - 30, 84, 28, '#7f4f24');
    px(c, cx - 32, by - 26, 60, 12, '#9c6644');
    px(c, cx - 24, by - 24, 34, 5, '#b07d56');
    frameRect(c, cx - 56, by - 22 + forendY, 28, 22, '#140708', '#3d2314');
    px(c, cx - 50, by - 20 + forendY, 18, 8, '#d4a373');
    frameRect(c, cx + 28, by - 20, 28, 22, '#140708', '#3d2314');
    px(c, cx + 32, by - 18, 18, 8, '#d4a373');
    c.restore();
  });

  // --- [2] CHAINGUN ROTATIVA ---
  const buildChaingun = (phase) => mkCanvas(184, 160, (c) => {
    const cx = 92;
    const by = 160;
    frameRect(c, cx - 40, by - 102, 80, 56, '#140708', '#1f2328');
    for (let i = 0; i < 6; i++) {
      const ang = ((i + phase * 0.25) / 6) * Math.PI * 2;
      const ox = Math.sin(ang) * 32;
      const depth = Math.cos(ang);
      if (depth < -0.45) continue;
      const bw = depth > 0.3 ? 10 : 8;
      const x = Math.round(cx + ox - bw / 2);
      px(c, x - 1, by - 100, bw + 2, 52, '#140708');
      px(c, x, by - 100, bw, 50, depth > 0.2 ? '#6c757d' : '#495057');
      px(c, x + 2, by - 100, 3, 48, depth > 0.2 ? '#dee2e6' : '#adb5bd');
    }
    for (const cy of [by - 86, by - 60]) {
      frameRect(c, cx - 42, cy, 84, 9, '#140708', '#adb5bd');
      px(c, cx - 38, cy + 2, 76, 3, '#dee2e6');
      for (let rx = -34; rx <= 30; rx += 16) px(c, cx + rx, cy + 3, 4, 3, '#252930');
    }
    frameRect(c, cx - 50, by - 44, 100, 44, '#140708', '#252930');
    px(c, cx - 42, by - 40, 84, 12, '#343a40');
    px(c, cx - 18, by - 36, 36, 4, '#ff4d00');
    for (let y = by - 42; y < by - 4; y += 8) {
      const shift = (phase % 2) * 2;
      px(c, cx + 44, y + shift, 24, 6, '#140708');
      px(c, cx + 46, y + 1 + shift, 14, 4, '#ffbe0b');
      px(c, cx + 60, y + 1 + shift, 7, 4, '#d90429');
    }
  });

  // --- [3] LANZALLAMAS INFERNAL ---
  const flamerBody = mkCanvas(176, 176, (c) => {
    const cx = 88;
    const by = 176;
    frameRect(c, cx + 20, by - 72, 34, 56, '#140708', '#9e1919');
    px(c, cx + 24, by - 68, 14, 48, '#d90429');
    px(c, cx + 27, by - 64, 5, 42, '#ff6b6b');
    px(c, cx + 19, by - 58, 36, 6, '#495057');
    px(c, cx + 19, by - 32, 36, 6, '#495057');
    px(c, cx + 26, by - 50, 14, 14, '#140708');
    px(c, cx + 28, by - 48, 10, 10, '#caf0f8');
    px(c, cx + 32, by - 45, 5, 3, '#d90429');
    frameRect(c, cx - 24, by - 104, 48, 54, '#140708', '#2b2d33');
    px(c, cx - 18, by - 100, 16, 46, '#495057');
    px(c, cx - 12, by - 94, 24, 14, '#ff4d00');
    px(c, cx - 8, by - 91, 14, 7, '#fff3b0');
    px(c, cx - 6, by - 114, 4, 12, '#adb5bd');
    px(c, cx + 2, by - 114, 4, 12, '#adb5bd');
    frameRect(c, cx - 42, by - 52, 76, 52, '#140708', '#343a40');
    px(c, cx - 36, by - 46, 58, 16, '#495057');
  });

  const buildPilot = (f) => mkCanvas(36, 42, (c) => {
    const lean = (f - 1) * 3;
    c.fillStyle = '#00f5d4';
    c.beginPath();
    c.arc(18 + lean * 0.5, 28, 8, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#ffbe0b';
    c.beginPath();
    c.arc(18 + lean, 18, 6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#fff3b0';
    c.beginPath();
    c.arc(18 + lean * 0.6, 22, 4, 0, Math.PI * 2);
    c.fill();
  });

  const buildFlameBlast = (f) => mkCanvas(168, 132, (c) => {
    const lean = (f - 1) * 8;
    const blob = (col, x, y, r) => {
      c.fillStyle = col;
      c.beginPath();
      c.arc(x, y, r, 0, Math.PI * 2);
      c.fill();
    };
    blob('rgba(217, 4, 41, 0.85)', 84 + lean * 0.7, 56, 56);
    blob('#ff4d00', 84 - lean * 0.4, 68, 42);
    blob('#ffbe0b', 84 + lean * 0.3, 82, 30);
    blob('#fff3b0', 84, 96, 18);
  });

  // --- [4] MOTOSIERRA INFERNAL ---
  const buildChainsaw = (phase) => mkCanvas(160, 204, (c) => {
    const cx = 80;
    const by = 204;
    frameRect(c, cx - 16, by - 154, 32, 74, '#140708', '#adb5bd');
    px(c, cx - 10, by - 150, 8, 68, '#dee2e6');
    px(c, cx + 2, by - 150, 8, 68, '#6c757d');
    px(c, cx - 2, by - 146, 4, 58, '#343a40');
    frameRect(c, cx - 14, by - 164, 28, 14, '#140708', '#495057');
    px(c, cx - 6, by - 160, 12, 6, '#ff4d00');
    for (let i = 0; i < 10; i++) {
      const ty = by - 152 + ((i * 7 + phase * 1.75) % 70);
      px(c, cx - 19, Math.floor(ty), 6, 4, (i + phase) % 2 === 0 ? '#fff3b0' : '#adb5bd');
      px(c, cx + 13, Math.floor(ty), 6, 4, (i + phase + 1) % 2 === 0 ? '#fff3b0' : '#adb5bd');
    }
    frameRect(c, cx - 34, by - 84, 68, 52, '#140708', '#343a40');
    px(c, cx - 28, by - 78, 56, 12, '#6c757d');
    px(c, cx - 18, by - 62, 36, 14, '#ff4d00');
    px(c, cx - 12, by - 58, 24, 6, '#ffbe0b');
    for (let vx = -26; vx <= 22; vx += 12) px(c, cx + vx, by - 44, 7, 8, '#adb5bd');
    frameRect(c, cx - 44, by - 36, 88, 36, '#140708', '#4a2511');
    px(c, cx - 34, by - 30, 68, 20, '#7f4f24');
    px(c, cx - 42, by - 28, 16, 18, '#d4a373');
    px(c, cx + 26, by - 26, 16, 18, '#d4a373');
  });

  // --- [5] LANZACOHETES PESADO UAC ---
  const buildRocketLauncher = (recoilStage) => mkCanvas(184, 176, (c) => {
    const cx = 92;
    const by = 176 + (recoilStage === 1 ? 14 : 0);
    // Tubo lanzador principal verde militar y acero
    frameRect(c, cx - 34, by - 118, 68, 86, '#140708', '#2f3d2b');
    px(c, cx - 28, by - 116, 22, 82, '#4a5d43');
    px(c, cx - 18, by - 116, 8, 80, '#6a8061');
    px(c, cx + 10, by - 116, 18, 82, '#1e261b');
    // Boca ancha hexagonal con ojiva visible
    frameRect(c, cx - 40, by - 126, 80, 16, '#140708', '#343a40');
    px(c, cx - 34, by - 122, 68, 8, '#6c757d');
    px(c, cx - 22, by - 124, 44, 10, '#07080a');
    if (recoilStage === 0) {
      // Punta de cohete rojo/dorado lista en la boca
      px(c, cx - 10, by - 124, 20, 8, '#d90429');
      px(c, cx - 5, by - 124, 10, 6, '#ffbe0b');
    }
    // Franjas amarillas de peligro en el tubo
    for (let sx = -28; sx <= 20; sx += 16) {
      px(c, cx + sx, by - 96, 8, 10, '#ffbe0b');
      px(c, cx + sx + 4, by - 96, 4, 10, '#140708');
    }
    // Mira óptica lateral derecha
    frameRect(c, cx + 34, by - 98, 18, 36, '#140708', '#495057');
    px(c, cx + 38, by - 94, 10, 12, '#00f5d4');
    // Chasis inferior y agarres
    frameRect(c, cx - 44, by - 40, 88, 40, '#140708', '#252930');
    px(c, cx - 38, by - 34, 76, 16, '#495057');
    px(c, cx - 18, by - 28, 36, 6, '#ff4d00');
  });

  // --- [6] RIFLE DE PLASMA UAC ---
  const buildPlasmaRifle = (phase) => mkCanvas(184, 168, (c) => {
    const cx = 92;
    const by = 168;
    const glowBright = phase % 2 === 0 ? '#00f5d4' : '#90e0ef';
    // Cañón magnético bifurcado con bobinas cyan incandescentes
    frameRect(c, cx - 26, by - 118, 52, 74, '#140708', '#1d2d44');
    px(c, cx - 22, by - 116, 16, 70, '#364f70');
    px(c, cx + 6, by - 116, 16, 70, '#162233');
    // Aletas refrigeradoras horizontales iluminadas por plasma
    for (let ry = by - 110; ry <= by - 64; ry += 11) {
      px(c, cx - 28, ry, 56, 6, '#140708');
      px(c, cx - 24, ry + 1, 48, 4, '#495057');
      px(c, cx - 14, ry + 1, 28, 4, glowBright);
      px(c, cx - 6, ry + 2, 12, 2, '#ffffff');
    }
    // Boquilla concentradora
    frameRect(c, cx - 18, by - 128, 36, 14, '#140708', '#6c757d');
    px(c, cx - 10, by - 126, 20, 8, '#00b4d8');
    px(c, cx - 4, by - 126, 8, 6, '#ffffff');
    // Cuerpo batería de celdas azules
    frameRect(c, cx - 44, by - 50, 88, 50, '#140708', '#2b303a');
    px(c, cx - 38, by - 44, 76, 18, '#495057');
    px(c, cx - 22, by - 38, 44, 10, '#0077b6');
    px(c, cx - 18, by - 36, 36, 6, glowBright);
    px(c, cx - 34, by - 20, 68, 20, '#1d2d44');
  });

  // --- [7] BFG-9000 // CAÑÓN DE ENERGÍA ABISAL ---
  const buildBfg = (phase) => mkCanvas(216, 184, (c) => {
    const cx = 108;
    const by = 184;
    const pulse = phase % 2 === 0;
    // Enorme chasis industrial titanio + aletas laterales masivas
    frameRect(c, cx - 64, by - 88, 128, 88, '#140708', '#1b1e23');
    px(c, cx - 58, by - 82, 42, 76, '#343a40');
    px(c, cx + 16, by - 82, 42, 76, '#23272e');
    // Dos rejillas de disipación laterales con brillo esmeralda
    for (let ry = by - 76; ry <= by - 36; ry += 12) {
      px(c, cx - 56, ry, 24, 6, '#140708');
      px(c, cx - 54, ry + 1, 20, 4, pulse ? '#70e000' : '#38b000');
      px(c, cx + 32, ry, 24, 6, '#140708');
      px(c, cx + 34, ry + 1, 20, 4, pulse ? '#70e000' : '#38b000');
    }
    // Gran cañón central con cámara de plasma verde visible
    frameRect(c, cx - 36, by - 134, 72, 68, '#140708', '#2b3038');
    px(c, cx - 30, by - 130, 22, 60, '#6c757d');
    px(c, cx + 8, by - 130, 22, 60, '#343a40');
    // Núcleo esmeralda gigante
    frameRect(c, cx - 22, by - 114, 44, 34, '#140708', '#004b23');
    px(c, cx - 18, by - 110, 36, 26, '#38b000');
    px(c, cx - 12, by - 106, 24, 18, pulse ? '#ccff33' : '#70e000');
    px(c, cx - 6, by - 102, 12, 10, '#ffffff');
    // Boca del cañón
    px(c, cx - 26, by - 138, 52, 8, '#07080a');
    px(c, cx - 16, by - 136, 32, 4, '#70e000');
    // Agarradera inferior y visor digital
    frameRect(c, cx - 26, by - 36, 52, 36, '#140708', '#495057');
    px(c, cx - 16, by - 30, 32, 10, '#041c0d');
    px(c, cx - 12, by - 27, 24, 4, '#70e000');
  });

  return {
    fist: { normal: buildFist(false), empowered: buildFist(true) },
    shotgun: {
      idle: buildShotgun(0),
      pump0: buildShotgun(1),
      pump1: buildShotgun(2),
      flash: buildStarFlash(136, 88, 16)
    },
    chaingun: {
      spin: [0, 1, 2, 3].map(buildChaingun),
      flash: buildStarFlash(128, 72, 14)
    },
    flamer: {
      body: flamerBody,
      pilot: [0, 1, 2].map(buildPilot),
      blast: [0, 1, 2].map(buildFlameBlast)
    },
    chainsaw: {
      frames: [0, 1, 2, 3].map(buildChainsaw),
      rev: buildStarFlash(120, 68, 12)
    },
    rocket: {
      idle: buildRocketLauncher(0),
      fire: buildRocketLauncher(1),
      flash: buildStarFlash(156, 100, 18, 'rgba(217, 4, 41, 0.9)', '#ff4d00', '#ffbe0b', '#fff3b0')
    },
    plasma: {
      frames: [0, 1].map(buildPlasmaRifle),
      flash: buildStarFlash(132, 82, 14, 'rgba(0, 119, 182, 0.85)', '#00b4d8', '#00f5d4', '#ffffff')
    },
    bfg: {
      frames: [0, 1].map(buildBfg),
      flash: buildStarFlash(196, 130, 26, 'rgba(0, 128, 0, 0.9)', '#38b000', '#ccff33', '#ffffff')
    }
  };
}

export function makeRocketProjectileSprite(frame = 0) {
  return mkCanvas(22, 22, (c) => {
    const fl = frame % 2 === 0;
    px(c, 5, 6, 12, 10, '#140708');
    px(c, 6, 7, 10, 8, '#6c757d');
    px(c, 8, 5, 6, 4, '#d90429');
    px(c, 7, 13, 8, 6, fl ? '#ff4d00' : '#ffbe0b');
    px(c, 9, 14, 4, 4, '#fff3b0');
  });
}

export function makePlasmaBoltSprite(frame = 0) {
  return mkCanvas(20, 20, (c) => {
    const pulse = frame % 2 === 0;
    px(c, 2, 2, 16, 16, 'rgba(0, 180, 216, 0.35)');
    px(c, 4, 4, 12, 12, pulse ? '#00b4d8' : '#00f5d4');
    px(c, 6, 6, 8, 8, '#caf0f8');
    px(c, 8, 8, 4, 4, '#ffffff');
  });
}

export function makeBfgOrbSprite(frame = 0) {
  return mkCanvas(34, 34, (c) => {
    const p = frame % 2 === 0;
    c.fillStyle = 'rgba(56, 176, 0, 0.38)';
    c.beginPath();
    c.arc(17, 17, 16, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#38b000';
    c.beginPath();
    c.arc(17, 17, p ? 12 : 13, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#70e000';
    c.beginPath();
    c.arc(17, 17, 9, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#ccff33';
    c.beginPath();
    c.arc(17, 17, 6, 0, Math.PI * 2);
    c.fill();
    px(c, 15, 15, 4, 4, '#ffffff');
    // Rayos verdes alrededor
    px(c, p ? 3 : 27, 15, 4, 3, '#ccff33');
    px(c, 15, p ? 3 : 27, 3, 4, '#ccff33');
  });
}

/** Pedestal flotante para armas encontrables en los sectores (2, 3, 4, 5, 6, 7). */
export function makeWeaponPickupSprite(weaponId, frame = 0) {
  const bob = frame % 2 === 0 ? 0 : -2;
  return mkCanvas(34, 32, (c) => {
    // Aura brillante bajo el arma
    const auraCols = {
      2: 'rgba(255, 190, 11, 0.36)',
      3: 'rgba(255, 77, 0, 0.42)',
      4: 'rgba(217, 4, 41, 0.42)',
      5: 'rgba(112, 224, 0, 0.38)',
      6: 'rgba(0, 245, 212, 0.42)',
      7: 'rgba(112, 224, 0, 0.52)'
    };
    px(c, 2, 2 + bob, 30, 22, auraCols[weaponId] || 'rgba(255, 190, 11, 0.35)');
    // Pedestal metálico en la base
    px(c, 7, 25, 20, 6, '#140708');
    px(c, 9, 26, 16, 4, '#495057');
    px(c, 12, 26, 10, 2, '#ffbe0b');

    if (weaponId === 2) {
      // Chaingun pickup
      frameRect(c, 6, 10 + bob, 22, 10, '#140708', '#495057');
      px(c, 20, 11 + bob, 9, 7, '#adb5bd');
      px(c, 8, 17 + bob, 8, 5, '#ffbe0b');
    } else if (weaponId === 3) {
      // Flamer pickup
      frameRect(c, 6, 10 + bob, 22, 10, '#140708', '#9e1919');
      px(c, 22, 12 + bob, 8, 4, '#ff4d00');
      px(c, 27, 11 + bob, 3, 4, '#ffbe0b');
    } else if (weaponId === 4) {
      // Chainsaw pickup
      frameRect(c, 5, 11 + bob, 14, 10, '#140708', '#d90429');
      frameRect(c, 18, 12 + bob, 12, 6, '#140708', '#dee2e6');
    } else if (weaponId === 5) {
      // Rocket Launcher pickup
      frameRect(c, 5, 9 + bob, 24, 10, '#140708', '#386641');
      px(c, 23, 10 + bob, 6, 8, '#ffbe0b');
      px(c, 9, 17 + bob, 6, 5, '#495057');
    } else if (weaponId === 6) {
      // Plasma Rifle pickup
      frameRect(c, 5, 10 + bob, 24, 10, '#140708', '#1d3557');
      px(c, 12, 11 + bob, 14, 4, '#00f5d4');
      px(c, 25, 12 + bob, 5, 5, '#caf0f8');
    } else {
      // BFG-9000 pickup
      frameRect(c, 4, 7 + bob, 26, 14, '#140708', '#2b3038');
      px(c, 10, 9 + bob, 14, 10, '#38b000');
      px(c, 13, 11 + bob, 8, 6, '#ccff33');
      px(c, 24, 11 + bob, 6, 6, '#70e000');
    }
  });
}

/** Generador demoníaco destructible para objetivo GENERATORS. */
export function makeGeneratorSprite(alive = true, frame = 0) {
  return mkCanvas(36, 52, (c) => {
    const pulse = frame % 2 === 0;
    if (!alive) {
      // Generador destruido (restos humeantes)
      frameRect(c, 6, 34, 24, 16, '#140708', '#241819');
      px(c, 10, 30, 6, 12, '#343a40');
      px(c, 20, 32, 6, 10, '#343a40');
      px(c, 14, 38, 8, 5, '#ff4d00');
      return;
    }
    // Base y columna blindada
    frameRect(c, 6, 38, 24, 12, '#140708', '#343a40');
    frameRect(c, 9, 10, 18, 30, '#140708', '#495057');
    // Núcleo energético vivo pulsante
    px(c, 12, 14, 12, 20, '#140708');
    px(c, 13, 15, 10, 18, pulse ? '#d90429' : '#ff4d00');
    px(c, 15, 18, 6, 12, pulse ? '#ffbe0b' : '#fff3b0');
    // Anillos metálicos y corona
    px(c, 7, 22, 22, 3, '#adb5bd');
    frameRect(c, 8, 4, 20, 6, '#140708', '#d90429');
    px(c, 14, 2, 8, 3, '#ffbe0b');
  });
}

/** Pilón de Escudo del Icon of Sin (Sector 10). */
export function makePylonSprite(active = true, frame = 0) {
  return mkCanvas(32, 54, (c) => {
    const pulse = frame % 2 === 0;
    frameRect(c, 7, 40, 18, 12, '#140708', '#210912');
    frameRect(c, 10, 12, 12, 30, '#140708', '#3c096c');
    if (active) {
      px(c, 12, 14, 8, 24, pulse ? '#ff0055' : '#00f5d4');
      px(c, 14, 16, 4, 20, '#ffffff');
      px(c, 11, 4, 10, 8, pulse ? '#00f5d4' : '#ffbe0b');
    } else {
      px(c, 12, 16, 8, 20, '#241828');
    }
  });
}

/** Científico UAC (VIP para Escolta / Rescate). */
export function makeVipSprite(rescued = false, frame = 0) {
  const bob = frame % 2 === 0 ? 0 : -1;
  return mkCanvas(28, 44, (c) => {
    // Piernas
    px(c, 8, 28, 5, 14, '#140708');
    px(c, 15, 28, 5, 14, '#140708');
    px(c, 9, 29, 3, 12, '#343a40');
    px(c, 16, 29, 3, 12, '#343a40');
    // Bata blanca UAC con franja naranja/cian de seguridad
    frameRect(c, 6, 13 + bob, 16, 17, '#140708', '#d8e2dc');
    px(c, 8, 15 + bob, 12, 13, '#ffffff');
    px(c, 11, 16 + bob, 6, 10, rescued ? '#00f5d4' : '#ff9e00');
    // Brazos
    px(c, 4, 15 + bob, 3, 11, '#d8e2dc');
    px(c, 21, 15 + bob, 3, 11, '#d8e2dc');
    // Cabeza con visor UAC
    frameRect(c, 9, 3 + bob, 10, 10, '#140708', '#e0ac8b');
    px(c, 10, 5 + bob, 8, 3, '#00b4d8');
    px(c, 12, 6 + bob, 4, 1, '#caf0f8');
  });
}

/** Llave de color (RED / BLUE / YELLOW) para objetivo THREE_KEYS. */
export function makeColoredKeySprite(colorName = 'RED', frame = 0) {
  const bob = frame % 2 === 0 ? 0 : -2;
  const palettes = {
    RED: { glow: 'rgba(217, 4, 41, 0.45)', main: '#d90429', hi: '#ff4d6d' },
    BLUE: { glow: 'rgba(0, 180, 216, 0.45)', main: '#0096c7', hi: '#90e0ef' },
    YELLOW: { glow: 'rgba(255, 190, 11, 0.45)', main: '#ffbe0b', hi: '#fff3b0' }
  };
  const pal = palettes[colorName] || palettes.RED;
  return mkCanvas(26, 30, (c) => {
    px(c, 2, 0 + bob, 22, 28, pal.glow);
    frameRect(c, 6, 3 + bob, 14, 10, '#140708', pal.main);
    px(c, 8, 4 + bob, 10, 3, pal.hi);
    px(c, 9, 7 + bob, 3, 3, '#140708');
    px(c, 14, 7 + bob, 3, 3, '#140708');
    frameRect(c, 11, 14 + bob, 4, 12, '#140708', pal.main);
    px(c, 15, 18 + bob, 5, 2, pal.hi);
    px(c, 15, 22 + bob, 6, 3, pal.hi);
  });
}

/** Núcleo inestable para objetivo ESCAPE_COUNTDOWN. */
export function makeCoreSprite(triggered = false, frame = 0) {
  return mkCanvas(36, 48, (c) => {
    const p = frame % 2 === 0;
    frameRect(c, 6, 36, 24, 10, '#140708', '#2b3038');
    frameRect(c, 8, 10, 20, 26, '#140708', triggered ? '#590d22' : '#1b263b');
    px(c, 11, 13, 14, 20, triggered ? (p ? '#ff003c' : '#ff4d00') : (p ? '#00b4d8' : '#00f5d4'));
    px(c, 14, 16, 8, 14, '#fff3b0');
    px(c, 4, 20, 28, 3, '#adb5bd');
  });
}

/** Granada táctica EMP/fragmentación [G] que rebota y rompe escudos. */
export function makeGrenadeSprite(frame = 0) {
  return mkCanvas(20, 20, (c) => {
    const p = frame % 2 === 0;
    px(c, 7, 3, 6, 3, '#adb5bd');
    px(c, 8, 2, 4, 2, '#f8f9fa');
    px(c, 12, 2, 3, 2, '#ffbe0b');
    frameRect(c, 5, 6, 10, 11, '#0b0c0e', '#2b2d42');
    px(c, 6, 7, 8, 2, '#495057');
    px(c, 5, 10, 10, 3, p ? '#00f5d4' : '#ff4d00');
    px(c, 8, 10, 4, 3, p ? '#e0fbfc' : '#ffbe0b');
    px(c, 6, 14, 8, 2, '#1a1d20');
  });
}
