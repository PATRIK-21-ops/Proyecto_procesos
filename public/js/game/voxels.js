// ============================================================================
// MOTOR DE SPRITES VOXEL 3D PRERRENDERIZADOS (BESTIARIO COMPLETO + JEFES ÚNICOS)
// ============================================================================

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const VOXEL_L_MAG = Math.hypot(-0.45, 0.5, 0.75);
const VOXEL_LIGHT = [-0.45 / VOXEL_L_MAG, 0.5 / VOXEL_L_MAG, 0.75 / VOXEL_L_MAG];
const VOXEL_SPRITE_CACHE = new Map();
const TINTED_SPRITE_CACHE = new WeakMap();

export const BAYER_4X4 = [
  -7.5, 0.5, -5.5, 2.5,
  4.5, -3.5, 6.5, -1.5,
  -4.5, 3.5, -6.5, 1.5,
  7.5, -0.5, 5.5, -2.5
];

const VOXEL_SCRATCH = {
  size: 0,
  depth: new Float32Array(0),
  mat: new Uint8Array(0),
  tone: new Uint8Array(0),
  emissive: new Uint8Array(0),
  ensure(len) {
    if (this.size < len) {
      this.size = len;
      this.depth = new Float32Array(len);
      this.mat = new Uint8Array(len);
      this.tone = new Uint8Array(len);
      this.emissive = new Uint8Array(len);
    }
    this.depth.fill(-1e9, 0, len);
    this.mat.fill(0, 0, len);
    this.tone.fill(0, 0, len);
    this.emissive.fill(0, 0, len);
  }
};

function parseHexRgb(hex) {
  const clean = (hex || '#ffffff').replace('#', '');
  const n = parseInt(clean, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function makeColorRamp(hex, emissive = false) {
  const [r, g, b] = parseHexRgb(hex);
  if (emissive) {
    return {
      emissive: true,
      tones: [
        [clamp(Math.round(r * 0.88 + 12), 0, 255), clamp(Math.round(g * 0.88 + 8), 0, 255), clamp(Math.round(b * 0.88 + 6), 0, 255)],
        [r, g, b],
        [clamp(Math.round(r + (255 - r) * 0.22), 0, 255), clamp(Math.round(g + (255 - g) * 0.22), 0, 255), clamp(Math.round(b + (255 - b) * 0.16), 0, 255)],
        [clamp(Math.round(r + (255 - r) * 0.45), 0, 255), clamp(Math.round(g + (255 - g) * 0.45), 0, 255), clamp(Math.round(b + (255 - b) * 0.34), 0, 255)]
      ]
    };
  }
  return {
    emissive: false,
    tones: [
      [clamp(Math.round(r * 0.48 + 4), 10, 255), clamp(Math.round(g * 0.44 + 2), 6, 255), clamp(Math.round(b * 0.56 + 12), 12, 255)],
      [clamp(Math.round(r * 0.75 + 2), 12, 255), clamp(Math.round(g * 0.72 + 2), 8, 255), clamp(Math.round(b * 0.8 + 7), 12, 255)],
      [r, g, b],
      [clamp(Math.round(r + (255 - r) * 0.34), 0, 255), clamp(Math.round(g + (242 - g) * 0.3), 0, 255), clamp(Math.round(b + (185 - b) * 0.22), 0, 255)]
    ]
  };
}

export class VoxelModel {
  constructor(w, d, h) {
    this.w = w;
    this.d = d;
    this.h = h;
    this.data = new Uint8Array(w * d * h);
    this._baked = null;
  }

  get(x, y, z) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    const iz = Math.round(z);
    if (ix < 0 || ix >= this.w || iy < 0 || iy >= this.d || iz < 0 || iz >= this.h) return 0;
    return this.data[(iz * this.d + iy) * this.w + ix];
  }

  set(x, y, z, mat) {
    const ix = Math.round(x);
    const iy = Math.round(y);
    const iz = Math.round(z);
    if (ix < 0 || ix >= this.w || iy < 0 || iy >= this.d || iz < 0 || iz >= this.h) return;
    this.data[(iz * this.d + iy) * this.w + ix] = mat;
    this._baked = null;
  }

  symSet(dx, y, z, mat) {
    const cx = (this.w - 1) * 0.5;
    this.set(cx + dx, y, z, mat);
    this.set(cx - dx, y, z, mat);
  }

  symBox(dx0, y0, z0, dx1, y1, z1, mat) {
    const cx = (this.w - 1) * 0.5;
    this.box(cx + dx0, y0, z0, cx + dx1, y1, z1, mat);
    this.box(cx - dx1, y0, z0, cx - dx0, y1, z1, mat);
  }

  box(x0, y0, z0, x1, y1, z1, mat) {
    const minX = Math.max(0, Math.floor(Math.min(x0, x1)));
    const maxX = Math.min(this.w - 1, Math.ceil(Math.max(x0, x1)));
    const minY = Math.max(0, Math.floor(Math.min(y0, y1)));
    const maxY = Math.min(this.d - 1, Math.ceil(Math.max(y0, y1)));
    const minZ = Math.max(0, Math.floor(Math.min(z0, z1)));
    const maxZ = Math.min(this.h - 1, Math.ceil(Math.max(z0, z1)));
    for (let z = minZ; z <= maxZ; z++) {
      for (let y = minY; y <= maxY; y++) {
        const base = (z * this.d + y) * this.w;
        for (let x = minX; x <= maxX; x++) {
          this.data[base + x] = mat;
        }
      }
    }
    this._baked = null;
  }

  ellipsoid(cx, cy, cz, rx, ry, rz, mat) {
    const minX = Math.max(0, Math.floor(cx - rx));
    const maxX = Math.min(this.w - 1, Math.ceil(cx + rx));
    const minY = Math.max(0, Math.floor(cy - ry));
    const maxY = Math.min(this.d - 1, Math.ceil(cy + ry));
    const minZ = Math.max(0, Math.floor(cz - rz));
    const maxZ = Math.min(this.h - 1, Math.ceil(cz + rz));
    const invRx2 = 1 / Math.max(0.25, rx * rx);
    const invRy2 = 1 / Math.max(0.25, ry * ry);
    const invRz2 = 1 / Math.max(0.25, rz * rz);
    for (let z = minZ; z <= maxZ; z++) {
      const dz = z - cz;
      const nz2 = dz * dz * invRz2;
      for (let y = minY; y <= maxY; y++) {
        const dy = y - cy;
        const ny2 = nz2 + dy * dy * invRy2;
        if (ny2 > 1.05) continue;
        const base = (z * this.d + y) * this.w;
        for (let x = minX; x <= maxX; x++) {
          const dx = x - cx;
          if (ny2 + dx * dx * invRx2 <= 1.02) {
            this.data[base + x] = mat;
          }
        }
      }
    }
    this._baked = null;
  }

  cylinder(cx, cy, z0, z1, rx, ry, mat) {
    const minZ = Math.max(0, Math.floor(Math.min(z0, z1)));
    const maxZ = Math.min(this.h - 1, Math.ceil(Math.max(z0, z1)));
    const minX = Math.max(0, Math.floor(cx - rx));
    const maxX = Math.min(this.w - 1, Math.ceil(cx + rx));
    const minY = Math.max(0, Math.floor(cy - ry));
    const maxY = Math.min(this.d - 1, Math.ceil(cy + ry));
    const invRx2 = 1 / Math.max(0.25, rx * rx);
    const invRy2 = 1 / Math.max(0.25, ry * ry);
    for (let z = minZ; z <= maxZ; z++) {
      for (let y = minY; y <= maxY; y++) {
        const dy = y - cy;
        const ny2 = dy * dy * invRy2;
        if (ny2 > 1.04) continue;
        const base = (z * this.d + y) * this.w;
        for (let x = minX; x <= maxX; x++) {
          const dx = x - cx;
          if (ny2 + dx * dx * invRx2 <= 1.02) {
            this.data[base + x] = mat;
          }
        }
      }
    }
    this._baked = null;
  }

  capsule(x0, y0, z0, x1, y1, z1, r0, r1, mat) {
    const steps = Math.max(3, Math.ceil(Math.hypot(x1 - x0, y1 - y0, z1 - z0) * 1.4));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      const z = z0 + (z1 - z0) * t;
      const r = r0 + (r1 - r0) * t;
      this.ellipsoid(x, y, z, r, r, r, mat);
    }
  }

  symCapsule(dx0, y0, z0, dx1, y1, z1, r0, r1, mat) {
    const cx = (this.w - 1) * 0.5;
    this.capsule(cx - dx0, y0, z0, cx - dx1, y1, z1, r0, r1, mat);
    this.capsule(cx + dx0, y0, z0, cx + dx1, y1, z1, r0, r1, mat);
  }

  symEllipsoid(dx, y, z, rx, ry, rz, mat) {
    const cx = (this.w - 1) * 0.5;
    this.ellipsoid(cx - dx, y, z, rx, ry, rz, mat);
    this.ellipsoid(cx + dx, y, z, rx, ry, rz, mat);
  }

  bake() {
    if (this._baked) return this._baked;
    const { w, d, h, data } = this;
    const cx = (w - 1) * 0.5;
    const cy = (d - 1) * 0.5;
    const voxels = [];
    for (let z = 0; z < h; z++) {
      for (let y = 0; y < d; y++) {
        for (let x = 0; x < w; x++) {
          const mat = data[(z * d + y) * w + x];
          if (mat === 0) continue;
          const xp = x + 1 < w && data[(z * d + y) * w + (x + 1)] !== 0;
          const xm = x > 0 && data[(z * d + y) * w + (x - 1)] !== 0;
          const yp = y + 1 < d && data[(z * d + (y + 1)) * w + x] !== 0;
          const ym = y > 0 && data[(z * d + (y - 1)) * w + x] !== 0;
          const zp = z + 1 < h && data[((z + 1) * d + y) * w + x] !== 0;
          const zm = z > 0 && data[((z - 1) * d + y) * w + x] !== 0;
          if (xp && xm && yp && ym && zp && zm) continue;

          let nx = 0, ny = 0, nz = 0, occ = 0;
          for (let oz = -1; oz <= 1; oz++) {
            const nzIdx = z + oz;
            for (let oy = -1; oy <= 1; oy++) {
              const nyIdx = y + oy;
              for (let ox = -1; ox <= 1; ox++) {
                if (ox === 0 && oy === 0 && oz === 0) continue;
                const nxIdx = x + ox;
                const filled =
                  nxIdx >= 0 && nxIdx < w &&
                  nyIdx >= 0 && nyIdx < d &&
                  nzIdx >= 0 && nzIdx < h &&
                  data[(nzIdx * d + nyIdx) * w + nxIdx] !== 0;
                if (filled) {
                  occ++;
                } else {
                  const inv = (ox * ox + oy * oy + oz * oz === 1) ? 1.0 : 0.45;
                  nx += ox * inv;
                  ny += oy * inv;
                  nz += oz * inv;
                }
              }
            }
          }
          const mag = Math.hypot(nx, ny, nz) || 1;
          voxels.push({
            mx: x - cx,
            my: y - cy,
            mz: z,
            mat,
            nmx: nx / mag,
            nmy: ny / mag,
            nmz: nz / mag,
            crevice: occ >= 16 ? 1 : 0
          });
        }
      }
    }
    this._baked = voxels;
    return voxels;
  }
}

export function renderVoxelSprite(model, ramps, yaw, scale, cw, ch) {
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext('2d');
  const voxels = model.bake();
  const totalPx = cw * ch;
  VOXEL_SCRATCH.ensure(totalPx);
  const { depth, mat: matBuf, tone: toneBuf, emissive: emBuf } = VOXEL_SCRATCH;

  const cosY = Math.cos(yaw);
  const sinY = Math.sin(yaw);
  const [lx, ly, lz] = VOXEL_LIGHT;
  const midX = cw * 0.5;
  const baseY = ch - 2;
  const hw = Math.max(1, Math.floor(scale * 0.68));
  const hh = Math.max(1, Math.floor(scale * 0.62));

  for (let i = 0; i < voxels.length; i++) {
    const v = voxels[i];
    const rx = v.mx * cosY - v.my * sinY;
    const ry = v.mx * sinY + v.my * cosY;
    const rz = v.mz;

    const nx = v.nmx * cosY - v.nmy * sinY;
    const ny = v.nmx * sinY + v.nmy * cosY;
    const nz = v.nmz;
    const ramp = ramps[v.mat];
    const isEm = ramp && ramp.emissive ? 1 : 0;

    let tone;
    if (isEm) {
      const fdot = nx * lx + ny * ly + nz * lz;
      tone = fdot > 0.28 ? 3 : (fdot > -0.15 ? 2 : 1);
    } else {
      const dot = nx * lx + ny * ly + nz * lz;
      tone = dot > 0.42 ? 3 : (dot > 0.04 ? 2 : (dot > -0.34 ? 1 : 0));
      if (v.crevice && tone > 0) tone -= 1;
    }

    const pxCenter = Math.round(midX + rx * scale);
    const pyCenter = Math.round(baseY - rz * scale);
    const x0 = Math.max(1, pxCenter - hw);
    const x1 = Math.min(cw - 2, pxCenter + hw);
    const y0 = Math.max(1, pyCenter - hh);
    const y1 = Math.min(ch - 2, pyCenter + hh);
    const vDepth = ry + rz * 0.015;

    for (let py = y0; py <= y1; py++) {
      const row = py * cw;
      for (let px = x0; px <= x1; px++) {
        const idx = row + px;
        if (vDepth > depth[idx]) {
          depth[idx] = vDepth;
          matBuf[idx] = v.mat;
          toneBuf[idx] = tone;
          emBuf[idx] = isEm;
        }
      }
    }
  }

  const img = ctx.createImageData(cw, ch);
  const out = img.data;
  let hasEmissive = false;

  for (let y = 0; y < ch; y++) {
    const row = y * cw;
    for (let x = 0; x < cw; x++) {
      const idx = row + x;
      const m = matBuf[idx];
      const o = idx * 4;
      if (m === 0) {
        const touchesBody =
          (x > 0 && matBuf[idx - 1] !== 0) ||
          (x + 1 < cw && matBuf[idx + 1] !== 0) ||
          (y > 0 && matBuf[idx - cw] !== 0) ||
          (y + 1 < ch && matBuf[idx + cw] !== 0);
        if (touchesBody) {
          out[o] = 20;
          out[o + 1] = 7;
          out[o + 2] = 8;
          out[o + 3] = 255;
        }
        continue;
      }

      if (emBuf[idx]) hasEmissive = true;
      const ramp = ramps[m];
      let rgb = ramp ? ramp.tones[toneBuf[idx]] : [255, 0, 255];

      if (!emBuf[idx] && x + 1 < cw && y + 1 < ch) {
        const dCur = depth[idx];
        const stepR = matBuf[idx + 1] !== 0 && (dCur - depth[idx + 1]) > 2.35;
        const stepD = matBuf[idx + cw] !== 0 && (dCur - depth[idx + cw]) > 2.35;
        if (stepR || stepD) {
          rgb = [
            Math.round(rgb[0] * 0.45 + 10),
            Math.round(rgb[1] * 0.4 + 4),
            Math.round(rgb[2] * 0.45 + 5)
          ];
        }
      }
      out[o] = rgb[0];
      out[o + 1] = rgb[1];
      out[o + 2] = rgb[2];
      out[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  if (hasEmissive) {
    const emCanvas = document.createElement('canvas');
    emCanvas.width = cw;
    emCanvas.height = ch;
    const ectx = emCanvas.getContext('2d');
    const emImg = ectx.createImageData(cw, ch);
    const eout = emImg.data;
    for (let i = 0; i < totalPx; i++) {
      if (!emBuf[i]) continue;
      const o = i * 4;
      eout[o] = out[o];
      eout[o + 1] = out[o + 1];
      eout[o + 2] = out[o + 2];
      eout[o + 3] = 255;
    }
    ectx.putImageData(emImg, 0, 0);
    canvas._emissive = emCanvas;
  }

  return canvas;
}

export const VOXEL_SPECIES_SPECS = {
  // 8 clásicos
  IMP: { cw: 68, ch: 92, w: 28, d: 20, h: 38, scale: 2.3, baseHex: '#8a4f2b' },
  CACODEMON: { cw: 76, ch: 92, w: 30, d: 28, h: 36, scale: 2.28, baseHex: '#d90429' },
  BARON: { cw: 76, ch: 100, w: 32, d: 22, h: 42, scale: 2.26, baseHex: '#7a2832' },
  SUMMONER: { cw: 72, ch: 96, w: 30, d: 22, h: 40, scale: 2.25, baseHex: '#4b2d7a' },
  LOST_SOUL: { cw: 68, ch: 88, w: 26, d: 24, h: 35, scale: 2.25, baseHex: '#ff4d00' },
  SHIELD: { cw: 80, ch: 96, w: 32, d: 24, h: 40, scale: 2.25, baseHex: '#495057' },
  PINKY: { cw: 84, ch: 84, w: 36, d: 32, h: 31, scale: 2.18, baseHex: '#b5174b' },
  REVENANT: { cw: 72, ch: 96, w: 30, d: 20, h: 40, scale: 2.25, baseHex: '#adb5bd' },

  // 7 nuevos del bestiario
  RIFLEMAN: { cw: 68, ch: 92, w: 28, d: 20, h: 38, scale: 2.28, baseHex: '#3f5e45' },
  SNIPER: { cw: 70, ch: 98, w: 28, d: 22, h: 41, scale: 2.26, baseHex: '#252936' },
  TURRET: { cw: 72, ch: 84, w: 30, d: 30, h: 34, scale: 2.22, baseHex: '#5c6773' },
  MANCUBUS: { cw: 92, ch: 100, w: 38, d: 30, h: 42, scale: 2.22, baseHex: '#b87d56' },
  HELL_KNIGHT: { cw: 76, ch: 100, w: 32, d: 22, h: 42, scale: 2.26, baseHex: '#9e8c82' },
  SPECTRE: { cw: 84, ch: 84, w: 36, d: 32, h: 31, scale: 2.18, baseHex: '#3c2a4d' },
  CYBERDEMON: { cw: 92, ch: 112, w: 38, d: 28, h: 47, scale: 2.25, baseHex: '#8a3228' },

  // 6 modelos únicos de Jefes
  BOSS_CHAMPION: { cw: 88, ch: 106, w: 36, d: 26, h: 44, scale: 2.28, baseHex: '#6c242b' },
  BOSS_PYRO: { cw: 90, ch: 108, w: 36, d: 26, h: 45, scale: 2.28, baseHex: '#9e1919' },
  BOSS_NECRO: { cw: 88, ch: 110, w: 36, d: 26, h: 46, scale: 2.25, baseHex: '#2c1654' },
  BOSS_CYBER: { cw: 88, ch: 108, w: 36, d: 26, h: 45, scale: 2.28, baseHex: '#a31621' },
  BOSS_VOID: { cw: 88, ch: 108, w: 36, d: 26, h: 45, scale: 2.28, baseHex: '#3d0c59' },
  BOSS_ICON: { cw: 104, ch: 124, w: 42, d: 32, h: 52, scale: 2.24, baseHex: '#6e1423' }
};

function getPoseOffsets(stepIndex, isCharge, isPain) {
  const walkSin = stepIndex === 1 ? 1 : (stepIndex === 3 ? -1 : 0);
  const bob = isPain ? -1.4 : (stepIndex % 2 === 1 ? 1.2 : 0);
  const armSwing = isPain ? 3.5 : (isCharge ? 4.2 : walkSin * 3.0);
  return {
    walkSin,
    bob,
    lStride: isCharge ? 2.5 : walkSin * 3.2,
    rStride: isCharge ? -1.5 : -walkSin * 3.2,
    armSwing,
    jawDrop: isCharge || isPain ? 2 : (stepIndex % 2 === 1 ? 1 : 0)
  };
}

function buildEnemyRamps(kind, isPain, isCharge) {
  const fleshHit = isPain ? '#ff4d00' : (isCharge ? '#d9480f' : null);
  switch (kind) {
    case 'IMP':
      return [
        null,
        makeColorRamp(isPain ? '#d90429' : '#6e3f23', false),
        makeColorRamp(isPain ? '#ff4d00' : '#9c5a32', false),
        makeColorRamp('#fff3b0', false),
        makeColorRamp('#ffbe0b', true),
        makeColorRamp('#ff4d00', true),
        makeColorRamp('#4a2614', false)
      ];
    case 'CACODEMON':
      return [
        null,
        makeColorRamp(isPain ? '#ff4d00' : '#a31621', false),
        makeColorRamp('#d90429', false),
        makeColorRamp('#d8c5b8', false),
        makeColorRamp('#70e000', true),
        makeColorRamp(isCharge ? '#00f5d4' : '#ff4d00', true),
        makeColorRamp('#590d22', false),
        makeColorRamp('#140708', false)
      ];
    case 'BARON':
      return [
        null,
        makeColorRamp(fleshHit || '#7a2832', false),
        makeColorRamp(isPain ? '#ff9e00' : '#b03e4c', false),
        makeColorRamp('#fff3b0', false),
        makeColorRamp('#70e000', true),
        makeColorRamp('#70e000', true),
        makeColorRamp('#5c6b5e', false),
        makeColorRamp('#29362a', false)
      ];
    case 'HELL_KNIGHT':
      return [
        null,
        makeColorRamp(fleshHit || '#8a7a70', false),
        makeColorRamp(isPain ? '#ff9e00' : '#b5a499', false),
        makeColorRamp('#e6dccf', false),
        makeColorRamp('#00f5d4', true),
        makeColorRamp('#70e000', true),
        makeColorRamp('#3d2c28', false),
        makeColorRamp('#241a18', false)
      ];
    case 'RIFLEMAN':
      return [
        null,
        makeColorRamp(isPain ? '#ff4d00' : '#3a5a40', false), // Armadura UAC verde oliva
        makeColorRamp('#588157', false), // Pechera iluminada
        makeColorRamp('#8c5e4a', false), // Piel infectada
        makeColorRamp('#ff2a2a', true),  // Ojos rojos infectados
        makeColorRamp('#ffbe0b', true),  // Fogonazo fusil
        makeColorRamp('#343a40', false), // Metal rifle
        makeColorRamp('#6e0d15', false)  // Manchas sangre
      ];
    case 'SNIPER':
      return [
        null,
        makeColorRamp(isPain ? '#ff4d00' : '#202430', false), // Capa oscura recon
        makeColorRamp('#363d52', false), // Placas tácticas
        makeColorRamp('#6c757d', false), // Cañón largo
        makeColorRamp('#ff003c', true),  // Visor óptico láser
        makeColorRamp('#00f5d4', true),  // Núcleo energía rifle
        makeColorRamp('#14171f', false), // Botas
        makeColorRamp('#8a1c28', false)  // Hombrera carmesí
      ];
    case 'TURRET':
      return [
        null,
        makeColorRamp(isPain ? '#ff4d00' : '#3d444d', false), // Base acero oscuro
        makeColorRamp('#6c757d', false), // Blindaje superior
        makeColorRamp('#adb5bd', false), // Cañones rotatorios
        makeColorRamp('#ff003c', true),  // Escáner rojo
        makeColorRamp('#ffbe0b', true),  // Franja peligro / fogonazo
        makeColorRamp('#212529', false), // Soportes
        makeColorRamp('#d90429', false)  // Placa UAC roja
      ];
    case 'MANCUBUS':
      return [
        null,
        makeColorRamp(fleshHit || '#a86b4c', false), // Piel obesa ocre-carnosa
        makeColorRamp(isPain ? '#ffbe0b' : '#c98867', false), // Pliegues iluminados
        makeColorRamp('#e8dccb', false), // Colmillos
        makeColorRamp('#ff4d00', true),  // Ojos / boca fuego
        makeColorRamp('#ffbe0b', true),  // Núcleo cañones
        makeColorRamp('#495057', false), // Cañones pesados
        makeColorRamp('#5e2e24', false)  // Heridas / correas
      ];
    case 'SPECTRE':
      return [
        null,
        makeColorRamp(isPain ? '#00f5d4' : '#3a2452', false), // Cuerpo sombrío
        makeColorRamp('#5a3d7a', false), // Crestas
        makeColorRamp('#9d4edd', true),  // Púas espectrales
        makeColorRamp('#00f5d4', true),  // Ojos fantasma
        makeColorRamp('#e0aaff', true),  // Fauces brillantes
        makeColorRamp('#1b1126', false)  // Garras
      ];
    case 'CYBERDEMON':
      return [
        null,
        makeColorRamp(fleshHit || '#8a3228', false), // Musculatura bronce-carmesí
        makeColorRamp('#b84b3e', false), // Relieve pectoral
        makeColorRamp('#e8dcc5', false), // Cuernos enormes
        makeColorRamp('#ffbe0b', true),  // Ojos cibernéticos
        makeColorRamp('#ff4d00', true),  // Boca lanzacohetes / cables
        makeColorRamp('#5c6773', false), // Pierna & brazo metálicos
        makeColorRamp('#2b3038', false)  // Pezuña/pistones
      ];
    case 'SUMMONER':
      return [
        null,
        makeColorRamp(isPain ? '#9d4edd' : '#2d1b4e', false),
        makeColorRamp('#4b2d7a', false),
        makeColorRamp('#6a3fa0', false),
        makeColorRamp('#70e000', true),
        makeColorRamp('#ccff33', true),
        makeColorRamp('#9c6644', false),
        makeColorRamp('#d8c5b8', false)
      ];
    case 'LOST_SOUL':
      return [
        null,
        makeColorRamp('#e0d6c2', false),
        makeColorRamp('#b8ab95', false),
        makeColorRamp('#ff4d00', true),
        makeColorRamp('#ffbe0b', true),
        makeColorRamp('#fff3b0', true),
        makeColorRamp('#d90429', true),
        makeColorRamp('#2b1216', false)
      ];
    case 'SHIELD':
      return [
        null,
        makeColorRamp(isPain ? '#ff4d00' : '#495057', false),
        makeColorRamp('#7a828a', false),
        makeColorRamp('#343a40', false),
        makeColorRamp('#00b4d8', true),
        makeColorRamp('#ff4d00', true),
        makeColorRamp('#ffbe0b', true),
        makeColorRamp('#adb5bd', false)
      ];
    case 'PINKY':
      return [
        null,
        makeColorRamp(isPain ? '#ff4d00' : '#b5174b', false),
        makeColorRamp('#e05780', false),
        makeColorRamp('#fff3b0', false),
        makeColorRamp('#ffbe0b', true),
        makeColorRamp('#ff4d00', true),
        makeColorRamp('#6e0d2a', false)
      ];
    case 'BOSS_CHAMPION':
      return [
        null,
        makeColorRamp(fleshHit || '#5e1a24', false),
        makeColorRamp('#9e2a3b', false),
        makeColorRamp('#d4a373', false), // Cuernos/detalles bronce
        makeColorRamp('#ffbe0b', true),  // Ojos gladiador
        makeColorRamp('#ff4d00', true),  // Filo espada / runas
        makeColorRamp('#495057', false), // Escudo & armadura acero
        makeColorRamp('#1b1d22', false)
      ];
    case 'BOSS_PYRO':
      return [
        null,
        makeColorRamp(fleshHit || '#780000', false),
        makeColorRamp('#b80c09', false),
        makeColorRamp('#ff9e00', true),  // Corona de llamas
        makeColorRamp('#fff3b0', true),  // Ojos incandescentes
        makeColorRamp('#ff4d00', true),  // Grietas de magma
        makeColorRamp('#2b1414', false), // Obsidiana
        makeColorRamp('#140708', false)
      ];
    case 'BOSS_NECRO':
      return [
        null,
        makeColorRamp(fleshHit || '#241242', false),
        makeColorRamp('#4c2885', false),
        makeColorRamp('#e0d6c2', false), // Cráneos / huesos
        makeColorRamp('#70e000', true),  // Ojos necróticos
        makeColorRamp('#ccff33', true),  // Orbe báculo
        makeColorRamp('#140a24', false),
        makeColorRamp('#8a7a68', false)
      ];
    case 'BOSS_CYBER':
      return [
        null,
        makeColorRamp(fleshHit || '#a31621', false),
        makeColorRamp(isPain ? '#ff9e00' : '#e63946', false),
        makeColorRamp('#ffbe0b', false),
        makeColorRamp('#ffbe0b', true),
        makeColorRamp('#ff4d00', true),
        makeColorRamp('#adb5bd', false),
        makeColorRamp('#495057', false)
      ];
    case 'BOSS_VOID':
      return [
        null,
        makeColorRamp(fleshHit || '#2e0854', false),
        makeColorRamp('#6a1b9a', false),
        makeColorRamp('#00f5d4', true),  // Cuchillas/cuernos vacío
        makeColorRamp('#ff007f', true),  // Ojos abisales
        makeColorRamp('#9d4edd', true),  // Núcleo vacío
        makeColorRamp('#120424', false),
        makeColorRamp('#240046', false)
      ];
    case 'BOSS_ICON':
      return [
        null,
        makeColorRamp(fleshHit || '#6e0d1b', false), // Carne titánica
        makeColorRamp('#a41623', false),             // Placas craneales
        makeColorRamp('#e8dcc5', false),             // Cuernos gigantes
        makeColorRamp('#ff003c', true),              // Ojos + Tercer Ojo
        makeColorRamp('#ffbe0b', true),              // Núcleo reactor & llamas
        makeColorRamp('#495057', false),             // Cables/implantes metal
        makeColorRamp('#210912', false)              // Armadura abisal
      ];
    case 'REVENANT':
    default:
      return [
        null,
        makeColorRamp('#e0d6c2', false),
        makeColorRamp(isPain ? '#ff4d00' : '#6c757d', false),
        makeColorRamp('#adb5bd', false),
        makeColorRamp('#ff4d00', true),
        makeColorRamp(isCharge ? '#ffbe0b' : '#d90429', true),
        makeColorRamp('#780000', false),
        makeColorRamp('#495057', false)
      ];
  }
}

function buildEnemyVoxelModel(kind, stepIndex, isCharge, isPain) {
  const s = VOXEL_SPECIES_SPECS[kind] || VOXEL_SPECIES_SPECS.IMP;
  const m = new VoxelModel(s.w, s.d, s.h);
  const cx = (s.w - 1) * 0.5;
  const cy = (s.d - 1) * 0.5;
  const pose = getPoseOffsets(stepIndex, isCharge, isPain);
  const zOff = pose.bob;

  if (kind === 'IMP') {
    m.symCapsule(4.5, cy + pose.lStride * 0.35, 1, 5.2, cy - 1.5, 8, 2.3, 1.9, 1);
    m.capsule(cx - 4.5, cy - 1.5, 8, cx - 4.2, cy + 0.5, 14, 2.2, 2.4, 2);
    m.capsule(cx + 4.5, cy - 1.5, 8, cx + 4.2, cy + 0.5, 14, 2.2, 2.4, 2);
    m.symEllipsoid(4.8, cy + 1.8 + pose.lStride * 0.4, 1.0, 1.9, 2.6, 1.3, 6);
    m.ellipsoid(cx, cy, 15 + zOff, 5.5, 3.8, 3.5, 1);
    m.ellipsoid(cx, cy + 0.8, 21.5 + zOff, 7.2, 4.5, 5.8, 1);
    m.symEllipsoid(2.6, cy + 3.4, 23 + zOff, 2.6, 1.8, 2.5, 2);
    m.symEllipsoid(1.8, cy + 3.1, 18.5 + zOff, 1.6, 1.4, 2.4, 2);
    for (let k = 0; k < 4; k++) {
      m.box(cx - 0.7, cy - 4.5 - k * 0.4, 18 + k * 2.7 + zOff, cx + 0.7, cy - 3.0, 19.6 + k * 2.7 + zOff, 3);
    }
    m.capsule(cx, cy - 3.2, 14 + zOff, cx, cy - 7.8, 7.5 + zOff, 1.6, 0.9, 1);
    m.set(cx, cy - 8.2, 7.2 + zOff, 3);
    m.symCapsule(7.2, cy + 0.2, 25.5 + zOff, 10.2, cy - 1.5, 28.5 + zOff, 1.7, 0.7, 3);
    const lArmFwd = isCharge ? 5.5 : pose.armSwing * 0.6;
    const rArmFwd = isCharge ? 5.5 : -pose.armSwing * 0.6;
    m.capsule(cx - 7.4, cy + 0.5, 24.5 + zOff, cx - 9.4, cy + 2 + lArmFwd * 0.4, 17.5 + zOff, 2.1, 1.7, 2);
    m.capsule(cx - 9.4, cy + 2 + lArmFwd * 0.4, 17.5 + zOff, cx - 8.6, cy + 4.5 + lArmFwd, 15.5 + zOff, 1.7, 1.5, 1);
    m.capsule(cx + 7.4, cy + 0.5, 24.5 + zOff, cx + 9.4, cy + 2 + rArmFwd * 0.4, 17.5 + zOff, 2.1, 1.7, 2);
    m.capsule(cx + 9.4, cy + 2 + rArmFwd * 0.4, 17.5 + zOff, cx + 8.6, cy + 4.5 + rArmFwd, 15.5 + zOff, 1.7, 1.5, 1);
    m.ellipsoid(cx - 8.6, cy + 5.6 + lArmFwd, 15 + zOff, 1.8, 1.8, 1.8, 5);
    m.ellipsoid(cx + 8.6, cy + 5.6 + rArmFwd, 15 + zOff, 1.8, 1.8, 1.8, 5);
    m.ellipsoid(cx, cy + 2.4, 30.5 + zOff, 4.4, 4.2, 4.3, 1);
    m.ellipsoid(cx, cy + 3.2, 29.2 + zOff, 3.6, 3.0, 2.0, 2);
    m.symCapsule(3.2, cy + 2.5, 33.5 + zOff, 5.2, cy - 1.5, 36.8 + zOff, 1.4, 0.6, 3);
    m.symSet(2.1, cy + 6.4, 31.0 + zOff, 4);
    m.symSet(1.5, cy + 6.5, 31.0 + zOff, 4);
    m.box(cx - 2, cy + 5.6, 27.6 + zOff, cx + 2, cy + 6.6, 28.4 + zOff, 6);
    return m;
  }

  if (kind === 'RIFLEMAN') {
    // Zombi con fusil hitscan
    m.symCapsule(4.0, cy + pose.lStride * 0.35, 1, 4.2, cy, 13, 2.3, 2.0, 1);
    m.symEllipsoid(4.2, cy + 1.5 + pose.lStride * 0.35, 1.0, 2.0, 2.7, 1.2, 6);
    m.ellipsoid(cx, cy, 20 + zOff, 6.4, 4.2, 6.8, 1);
    m.box(cx - 5.0, cy + 2.8, 17 + zOff, cx + 5.0, cy + 4.8, 25 + zOff, 2);
    m.box(cx - 2.0, cy + 3.5, 18 + zOff, cx + 2.0, cy + 5.0, 22 + zOff, 7); // Sangre pecho
    // Cabeza con casco agrietado y ojos rojos
    m.ellipsoid(cx, cy + 0.5, 30.5 + zOff, 4.2, 4.2, 4.4, 3);
    m.ellipsoid(cx, cy + 0.2, 32.5 + zOff, 4.8, 4.6, 2.8, 1);
    m.symSet(1.8, cy + 4.4, 30.8 + zOff, 4);
    // Brazos sujetando fusil UAC largo hacia adelante
    m.capsule(cx - 6.8, cy, 24 + zOff, cx - 3.5, cy + 4.5, 21 + zOff, 1.8, 1.5, 1);
    m.capsule(cx + 6.8, cy, 24 + zOff, cx + 3.0, cy + 4.0, 21 + zOff, 1.8, 1.5, 1);
    m.box(cx + 1.5, cy + 2.0, 19.5 + zOff, cx + 4.0, cy + 12.5, 22.0 + zOff, 6);
    m.box(cx + 2.2, cy + 12.0, 20.2 + zOff, cx + 3.4, cy + 14.0, 21.5 + zOff, isCharge ? 5 : 6);
    return m;
  }

  if (kind === 'SNIPER') {
    // Francotirador esbelto con capucha oscura, visor láser y rifle de cañón largo
    m.symCapsule(3.6, cy + pose.lStride * 0.35, 1, 3.8, cy, 15, 2.0, 1.8, 6);
    m.ellipsoid(cx, cy, 22 + zOff, 5.5, 3.8, 7.2, 1);
    m.box(cx - 4.5, cy + 2.5, 20 + zOff, cx + 4.5, cy + 4.2, 27 + zOff, 2);
    m.symEllipsoid(6.2, cy, 27 + zOff, 2.4, 2.4, 2.2, 7);
    // Capucha + visor láser rojo brillante
    m.ellipsoid(cx, cy + 0.2, 33 + zOff, 4.4, 4.4, 4.6, 1);
    m.box(cx - 2.6, cy + 3.8, 32.5 + zOff, cx + 2.6, cy + 5.2, 34.0 + zOff, 4);
    m.set(cx + 2.0, cy + 5.4, 33.2 + zOff, 5);
    // Rifle de francotirador largo
    m.capsule(cx + 5.8, cy, 26 + zOff, cx + 3.2, cy + 5.0, 23 + zOff, 1.5, 1.4, 2);
    m.capsule(cx - 5.8, cy, 26 + zOff, cx + 1.5, cy + 7.0, 23 + zOff, 1.5, 1.3, 2);
    m.box(cx + 1.8, cy + 1.5, 22 + zOff, cx + 3.6, cy + 15.5, 24.2 + zOff, 3);
    m.box(cx + 2.2, cy + 6.0, 24.5 + zOff, cx + 3.2, cy + 9.0, 25.5 + zOff, 5); // Mira energética
    return m;
  }

  if (kind === 'TURRET') {
    // Torreta automática sobre trípode con doble cañón y escáner rojo
    const recoilY = isCharge ? -1.2 : 0;
    const bobT = stepIndex % 2 === 1 ? 0.4 : 0;
    // Trípode
    m.capsule(cx, cy, 12, cx - 9, cy + 7, 1, 2.0, 1.4, 6);
    m.capsule(cx, cy, 12, cx + 9, cy + 7, 1, 2.0, 1.4, 6);
    m.capsule(cx, cy, 12, cx, cy - 10, 1, 2.0, 1.4, 6);
    m.cylinder(cx, cy, 10, 17, 4.2, 4.2, 1);
    // Cabezal blindado giratorio
    m.box(cx - 8.5, cy - 6.5 + recoilY, 17 + bobT, cx + 8.5, cy + 6.5 + recoilY, 27 + bobT, 2);
    m.box(cx - 6.5, cy - 5.0 + recoilY, 27 + bobT, cx + 6.5, cy + 5.0 + recoilY, 31 + bobT, 7);
    // Ojo escáner rojo frontal
    m.box(cx - 2.6, cy + 6.0 + recoilY, 21 + bobT, cx + 2.6, cy + 7.8 + recoilY, 24 + bobT, 4);
    // Cañones dobles rotatorios
    m.capsule(cx - 5.5, cy + 5.0 + recoilY, 21 + bobT, cx - 5.5, cy + 14.0 + recoilY, 21 + bobT, 1.6, 1.4, 3);
    m.capsule(cx + 5.5, cy + 5.0 + recoilY, 21 + bobT, cx + 5.5, cy + 14.0 + recoilY, 21 + bobT, 1.6, 1.4, 3);
    if (isCharge) {
      m.ellipsoid(cx - 5.5, cy + 14.5, 21, 1.8, 1.8, 1.8, 5);
      m.ellipsoid(cx + 5.5, cy + 14.5, 21, 1.8, 1.8, 1.8, 5);
    }
    return m;
  }

  if (kind === 'MANCUBUS') {
    // Tanque corpulento con enormes cañones en ambos brazos
    m.symCapsule(7.5, cy + pose.lStride * 0.3, 1, 7.5, cy - 1, 13, 3.8, 3.4, 1);
    m.symEllipsoid(7.8, cy + 1.8 + pose.lStride * 0.3, 1.6, 3.6, 4.0, 1.8, 7);
    // Enorme torso barrigón
    m.ellipsoid(cx, cy, 20 + zOff, 12.8, 9.8, 10.5, 1);
    m.ellipsoid(cx, cy + 4.5, 17.5 + zOff, 9.5, 6.2, 6.2, 2);
    m.box(cx - 10, cy - 4, 21 + zOff, cx + 10, cy + 5, 23 + zOff, 7); // Arneses
    // Boca enorme y ojos ardientes
    m.ellipsoid(cx, cy + 2.5, 32 + zOff, 5.6, 5.2, 4.8, 1);
    m.symSet(2.2, cy + 7.2, 33 + zOff, 4);
    m.box(cx - 4.2, cy + 6.2, 28 + zOff, cx + 4.2, cy + 7.8, 30.5 + zOff, 4);
    m.symBox(2.4, cy + 7.2, 29.5 + zOff, 3.4, cy + 8.4, 31.2 + zOff, 3);
    // Cañones pesados dobles en los brazos
    const swing = pose.armSwing * 0.4;
    m.capsule(cx - 13, cy, 26 + zOff, cx - 15.5, cy + 2 + swing, 19 + zOff, 3.6, 3.2, 2);
    m.capsule(cx - 15.5, cy + 2 + swing, 19 + zOff, cx - 15.5, cy + 11.5 + swing, 18.5 + zOff, 3.4, 3.0, 6);
    m.ellipsoid(cx - 15.5, cy + 12.2 + swing, 18.5 + zOff, 2.2, 1.6, 2.2, 5);

    m.capsule(cx + 13, cy, 26 + zOff, cx + 15.5, cy + 2 - swing, 19 + zOff, 3.6, 3.2, 2);
    m.capsule(cx + 15.5, cy + 2 - swing, 19 + zOff, cx + 15.5, cy + 11.5 - swing, 18.5 + zOff, 3.4, 3.0, 6);
    m.ellipsoid(cx + 15.5, cy + 12.2 - swing, 18.5 + zOff, 2.2, 1.6, 2.2, 5);
    return m;
  }

  if (kind === 'HELL_KNIGHT') {
    // Caballero del infierno esbelto y musculoso con puños energéticos verde/cian
    const legSpread = 5.0;
    m.symCapsule(legSpread, cy + pose.lStride * 0.4, 1, legSpread, cy - 1, 13, 2.8, 2.4, 7);
    m.symCapsule(legSpread, cy - 1, 13, legSpread * 0.85, cy + 0.5, 19, 2.9, 3.2, 1);
    m.symEllipsoid(legSpread, cy + 1.6 + pose.lStride * 0.4, 1.2, 2.6, 3.2, 1.5, 7);
    m.ellipsoid(cx, cy, 20 + zOff, 6.4, 4.6, 4.4, 1);
    m.ellipsoid(cx, cy + 0.5, 27.5 + zOff, 8.8, 5.6, 6.8, 1);
    m.symEllipsoid(3.4, cy + 4.2, 28.5 + zOff, 3.2, 2.2, 3.0, 2);
    // Cabeza con corona de cuernos pálidos
    m.ellipsoid(cx, cy + 1.2, 35.5 + zOff, 4.4, 4.4, 4.6, 2);
    m.symCapsule(3.6, cy + 1.0, 38 + zOff, 7.2, cy - 0.5, 41.5 + zOff, 1.6, 0.6, 3);
    m.symSet(2.0, cy + 5.2, 36.0 + zOff, 4);
    // Brazos cargados de plasma verde
    const lFwd = isCharge ? 7.0 : pose.armSwing * 0.7;
    const rFwd = isCharge ? 7.0 : -pose.armSwing * 0.7;
    m.capsule(cx - 9.2, cy, 31 + zOff, cx - 10.6, cy + 4 + lFwd, 21 + zOff, 2.5, 2.0, 2);
    m.ellipsoid(cx - 10.6, cy + 5.5 + lFwd, 20 + zOff, 2.6, 2.6, 2.6, 5);
    m.capsule(cx + 9.2, cy, 31 + zOff, cx + 10.6, cy + 4 + rFwd, 21 + zOff, 2.5, 2.0, 2);
    m.ellipsoid(cx + 10.6, cy + 5.5 + rFwd, 20 + zOff, 2.6, 2.6, 2.6, 5);
    return m;
  }

  if (kind === 'CACODEMON') {
    const fz = stepIndex === 1 ? 2 : (stepIndex === 3 ? -2 : 0);
    m.ellipsoid(cx, cy, 20 + fz, 11.2, 10.6, 11.0, 1);
    m.ellipsoid(cx, cy - 1.5, 22 + fz, 9.8, 9.2, 9.5, 2);
    for (const [dx, dy, dz] of [[0, -2, 31], [-5.2, -1, 30], [5.2, -1, 30], [-9, -3.5, 26], [9, -3.5, 26]]) {
      m.capsule(cx + dx * 0.78, cy + dy, dz - 2 + fz, cx + dx, cy + dy - 2.2, dz + 3.2 + fz, 1.7, 0.6, 3);
    }
    for (let k = 0; k < 4; k++) {
      m.ellipsoid(cx, cy - 9.8, 25 - k * 3.5 + fz, 1.6, 2.0, 1.4, 3);
    }
    m.ellipsoid(cx, cy + 9.4, 24.5 + fz, 4.2, 2.6, 3.6, 4);
    m.box(cx - 0.8, cy + 11.4, 23 + fz, cx + 0.8, cy + 12.2, 26 + fz, 7);
    const jaw = isCharge || isPain ? 3.2 : (stepIndex % 2 === 1 ? 2.0 : 0.8);
    m.ellipsoid(cx, cy + 8.8, 15.5 - jaw * 0.4 + fz, 6.8, 3.5, 2.8 + jaw * 0.6, 5);
    for (let tx = -5.5; tx <= 5.5; tx += 2.2) {
      m.box(cx + tx - 0.5, cy + 10.5, 17.5 + fz, cx + tx + 0.5, cy + 11.8, 18.8 + fz, 3);
      m.box(cx + tx - 0.5, cy + 10.5, 13.0 - jaw + fz, cx + tx + 0.5, cy + 11.8, 14.2 - jaw + fz, 3);
    }
    m.symCapsule(4.6, cy + 1.5, 10 + fz, 5.4, cy + pose.walkSin * 1.4, 4 + fz, 1.8, 0.8, 6);
    m.capsule(cx, cy - 1, 9 + fz, cx + pose.walkSin, cy - 1.5, 2.5 + fz, 2.0, 0.8, 6);
    return m;
  }

  if (kind === 'LOST_SOUL') {
    const fz = stepIndex % 2 === 1 ? 1.5 : 0;
    m.ellipsoid(cx, cy - 1.2, 20.5 + fz, 9.6, 9.6, 9.8, 6);
    m.ellipsoid(cx, cy - 2.6, 23.0 + fz, 8.2, 8.4, 9.4, 3);
    m.ellipsoid(cx, cy - 3.8, 25.5 + fz, 6.2, 6.6, 8.2, 4);
    m.capsule(cx, cy - 3.5, 23 + fz, cx + pose.walkSin * 1.5, cy - 9.0, 31 + fz, 4.5, 1.3, 4);
    m.capsule(cx, cy - 3.5, 25 + fz, cx, cy - 8.0, 29 + fz, 2.8, 0.9, 5);
    m.capsule(cx, cy - 1.5, 12 + fz, cx, cy - 5.5, 5 + fz, 3.2, 1.0, 3);
    m.ellipsoid(cx, cy + 3.0, 18.5 + fz, 6.4, 6.2, 6.4, 1);
    m.ellipsoid(cx, cy + 4.4, 15.0 + fz, 4.6, 4.8, 3.0, 2);
    m.symCapsule(5.6, cy + 2.4, 21.0 + fz, 8.5, cy - 1.2, 24.5 + fz, 1.9, 0.8, 1);
    m.symEllipsoid(2.3, cy + 8.6, 19.2 + fz, 1.5, 1.3, 1.5, 7);
    m.symSet(2.2, cy + 9.2, 19.3 + fz, 3);
    const jaw = isCharge ? 2 : 1;
    m.box(cx - 3.5, cy + 5.2, 11.5 - jaw + fz, cx + 3.5, cy + 9.0, 14.0 - jaw + fz, 1);
    for (let tx = -3; tx <= 3; tx += 1.5) m.set(cx + tx, cy + 8.9, 14.5 + fz, 1);
    return m;
  }

  if (kind === 'SUMMONER') {
    const sway = pose.walkSin * 0.9;
    m.cylinder(cx, cy, 0, 12, 8.6, 7.6, 1);
    m.cylinder(cx, cy, 4, 20, 6.8, 5.8, 2);
    m.cylinder(cx, cy, 18, 28, 7.6, 5.4, 2);
    m.box(cx - 2.6, cy + 5.2, 2 + zOff, cx + 2.6, cy + 7.2, 26 + zOff, 3);
    for (let rz = 7; rz <= 21; rz += 5) {
      m.box(cx - 1.5, cy - 6.6, rz + zOff, cx + 1.5, cy - 5.2, rz + 2 + zOff, 4);
    }
    m.symEllipsoid(7.5, cy, 26.5 + zOff, 2.8, 3.0, 2.6, 7);
    m.symCapsule(7.8, cy, 28 + zOff, 10.2, cy - 1.2, 31.2 + zOff, 1.3, 0.5, 7);
    m.ellipsoid(cx, cy + 0.4, 32.5 + zOff, 5.2, 5.0, 5.4, 2);
    m.capsule(cx, cy - 1.5, 35.5 + zOff, cx, cy - 4.8, 38.2 + zOff, 3.2, 1.0, 1);
    m.box(cx - 2.8, cy + 3.2, 29.8 + zOff, cx + 2.8, cy + 5.4, 34.0 + zOff, 7);
    m.symSet(1.4, cy + 5.5, 32.2 + zOff, 4);
    m.capsule(cx - 7.5, cy + 1, 25 + zOff, cx - 10.2, cy + 5.5 + sway, 22 + zOff, 1.8, 1.5, 2);
    m.ellipsoid(cx - 10.6, cy + 6.4 + sway, 24.5 + zOff, 2.5, 2.5, 2.5, 4);
    m.ellipsoid(cx - 10.6, cy + 6.4 + sway, 24.5 + zOff, 1.2, 1.2, 1.2, 5);
    m.capsule(cx + 7.5, cy + 1, 25 + zOff, cx + 11.0, cy + 4.5 - sway, 21 + zOff, 1.8, 1.5, 2);
    m.capsule(cx + 11.4, cy + 4.8 - sway, 0, cx + 11.4, cy + 4.8 - sway, 35 + zOff, 1.0, 1.0, 6);
    m.ellipsoid(cx + 11.4, cy + 4.8 - sway, 37.0 + zOff, 2.7, 2.7, 3.0, 4);
    m.ellipsoid(cx + 11.4, cy + 4.8 - sway, 37.0 + zOff, 1.3, 1.3, 1.6, 5);
    return m;
  }

  if (kind === 'SHIELD') {
    m.symCapsule(4.6, cy + pose.lStride * 0.35, 1, 4.6, cy - 0.5, 14, 2.7, 2.6, 3);
    m.symEllipsoid(4.8, cy + 1.5 + pose.lStride * 0.35, 1.2, 2.5, 3.1, 1.5, 3);
    m.ellipsoid(cx, cy, 22 + zOff, 7.6, 4.8, 8.2, 1);
    m.box(cx - 5.5, cy + 3.2, 18 + zOff, cx + 5.5, cy + 5.2, 28 + zOff, 2);
    m.ellipsoid(cx, cy - 5.2, 23 + zOff, 4.2, 2.2, 5.2, 3);
    m.ellipsoid(cx, cy - 6.4, 23 + zOff, 2.4, 1.6, 3.2, 5);
    m.ellipsoid(cx, cy - 6.7, 23 + zOff, 1.2, 1.2, 1.6, 6);
    m.capsule(cx - 4.2, cy - 5.4, 18 + zOff, cx - 2.5, cy - 6.0, 27 + zOff, 1.1, 1.1, 7);
    m.capsule(cx + 4.2, cy - 5.4, 18 + zOff, cx + 2.5, cy - 6.0, 27 + zOff, 1.1, 1.1, 7);
    m.ellipsoid(cx, cy + 0.5, 33.5 + zOff, 4.8, 4.8, 4.8, 2);
    m.box(cx - 3.6, cy + 4.2, 32.5 + zOff, cx + 3.6, cy + 5.6, 34.4 + zOff, 5);
    m.box(cx - 2.4, cy - 4.2, 31.5 + zOff, cx + 2.4, cy - 3.4, 34.0 + zOff, 3);
    m.capsule(cx + 7.8, cy, 26 + zOff, cx + 10.6, cy + 4.5, 21 + zOff, 2.3, 1.9, 1);
    m.box(cx + 9.2, cy + 3.5, 19 + zOff, cx + 12.2, cy + 9.5, 22 + zOff, 7);
    m.box(cx - 9.2, cy + 6.4, 6 + zOff, cx + 9.2, cy + 8.4, 30 + zOff, 3);
    m.box(cx - 7.8, cy + 6.8, 8 + zOff, cx + 7.8, cy + 8.8, 28 + zOff, 1);
    m.box(cx - 5.6, cy + 7.4, 11 + zOff, cx + 5.6, cy + 9.2, 25 + zOff, 2);
    m.box(cx - 2.2, cy + 8.6, 14 + zOff, cx + 2.2, cy + 9.8, 23 + zOff, 4);
    for (const [rx, rz] of [[-7.2, 9.5], [7.2, 9.5], [-7.2, 26.5], [7.2, 26.5]]) {
      m.box(cx + rx - 0.6, cy + 8.8, rz + zOff, cx + rx + 0.6, cy + 9.5, rz + 1.2 + zOff, 7);
    }
    return m;
  }

  if (kind === 'PINKY' || kind === 'SPECTRE') {
    const leanFwd = isCharge ? 2.2 : 0;
    m.symCapsule(7.5, cy - 4.0 + pose.lStride * 0.35, 1, 7.2, cy - 3.5, 11, 3.6, 3.0, 6);
    m.symEllipsoid(7.6, cy - 2.0 + pose.lStride * 0.35, 1.5, 3.4, 3.8, 1.8, 6);
    m.symCapsule(7.8, cy + 4.5 + pose.rStride * 0.3, 1, 7.6, cy + 3.5, 12, 3.2, 2.8, 1);
    m.ellipsoid(cx, cy - 1.5, 15.5 + zOff, 10.5, 9.5, 7.8, 1);
    m.ellipsoid(cx, cy - 2.0 + leanFwd * 0.3, 22.5 + zOff, 8.8, 8.2, 5.2, 2);
    for (let k = 0; k < 4; k++) {
      m.box(cx - 1.1, cy - 5.5 - k * 2.2, 25 - k * 2.5 + zOff, cx + 1.1, cy - 4.0 - k * 2.2, 27 - k * 2.3 + zOff, 3);
    }
    m.capsule(cx, cy - 9.8, 14 + zOff, cx, cy - 13.5, 10 + zOff, 2.2, 1.0, 6);
    m.ellipsoid(cx, cy + 7.2 + leanFwd, 17.5 + zOff, 8.4, 6.2, 6.2, 1);
    m.ellipsoid(cx, cy + 8.4 + leanFwd, 21.0 + zOff, 6.8, 4.6, 3.2, 2);
    m.symCapsule(7.8, cy + 7.5 + leanFwd, 19.5 + zOff, 12.2, cy + 11.8 + leanFwd, 21.5 + zOff, 2.3, 0.8, 3);
    m.symBox(4.2, cy + 12.2 + leanFwd, 19.2 + zOff, 5.4, cy + 13.4 + leanFwd, 20.6 + zOff, 4);
    m.box(cx - 6.0, cy + 10.6 + leanFwd, 11.2 - pose.jawDrop + zOff, cx + 6.0, cy + 13.8 + leanFwd, 15.6 + zOff, 5);
    for (let tx = -4.8; tx <= 4.8; tx += 2.4) {
      m.box(cx + tx - 0.5, cy + 13.0 + leanFwd, 15.2 + zOff, cx + tx + 0.5, cy + 14.4 + leanFwd, 16.4 + zOff, 3);
      m.box(cx + tx - 0.5, cy + 13.0 + leanFwd, 10.8 - pose.jawDrop + zOff, cx + tx + 0.5, cy + 14.4 + leanFwd, 12.2 - pose.jawDrop + zOff, 3);
    }
    return m;
  }

  if (kind === 'REVENANT') {
    m.symCapsule(4.0, cy + pose.lStride * 0.4, 1, 4.2, cy, 17, 1.9, 1.8, 1);
    m.symEllipsoid(4.0, cy + 1.5 + pose.lStride * 0.4, 1.0, 2.0, 2.5, 1.2, 1);
    m.box(cx - 4.2, cy - 2.0, 17 + zOff, cx + 4.2, cy + 2.0, 20 + zOff, 1);
    m.ellipsoid(cx, cy, 24.5 + zOff, 5.2, 3.6, 5.8, 6);
    for (let rz = 21; rz <= 26; rz += 2.2) {
      m.box(cx - 4.5, cy + 2.2, rz + zOff, cx + 4.5, cy + 3.8, rz + 1.0 + zOff, 1);
    }
    m.box(cx - 5.8, cy + 1.2, 26.5 + zOff, cx + 5.8, cy + 4.2, 31.5 + zOff, 2);
    m.box(cx - 4.2, cy + 1.8, 27.5 + zOff, cx + 4.2, cy + 4.6, 30.8 + zOff, 3);
    m.symCapsule(3.0, cy - 4.4, 23 + zOff, 3.2, cy - 4.6, 31 + zOff, 2.1, 2.1, 7);
    m.symEllipsoid(3.0, cy - 4.6, 22 + zOff, 1.3, 1.3, 1.2, 4);
    m.symCapsule(7.8, cy - 1.5, 32.5 + zOff, 7.8, cy + 5.0, 32.5 + zOff, 2.6, 2.6, 7);
    m.symEllipsoid(7.8, cy + 5.4, 32.5 + zOff, 1.7, 1.4, 1.7, 5);
    m.ellipsoid(cx, cy + 0.6, 34.8 + zOff, 4.0, 4.0, 4.2, 1);
    m.symSet(1.6, cy + 4.5, 35.2 + zOff, 4);
    m.symSet(1.6, cy + 4.5, 34.4 + zOff, 4);
    m.box(cx - 2.2, cy + 3.2, 30.8 + zOff, cx + 2.2, cy + 4.5, 32.2 + zOff, 1);
    m.capsule(cx - 6.6, cy, 29 + zOff, cx - 8.6, cy + 2.5 + pose.armSwing * 0.4, 21 + zOff, 1.5, 1.3, 1);
    m.capsule(cx + 6.6, cy, 29 + zOff, cx + 8.6, cy + 2.5 - pose.armSwing * 0.4, 21 + zOff, 1.5, 1.3, 1);
    m.ellipsoid(cx - 8.6, cy + 3.2 + pose.armSwing * 0.4, 19.5 + zOff, 1.7, 1.7, 1.8, 6);
    m.ellipsoid(cx + 8.6, cy + 3.2 - pose.armSwing * 0.4, 19.5 + zOff, 1.7, 1.7, 1.8, 6);
    return m;
  }

  // --- ICON OF SIN (Sector 10 Titán Biomecánico Colosal) ---
  if (kind === 'BOSS_ICON') {
    const hoverZ = zOff * 0.8;
    // Pilar/cuerpo inferior biomecánico con cables expuestos
    m.cylinder(cx, cy, 2, 18, 11.5, 9.5, 7);
    m.symCapsule(7.5, cy + pose.lStride * 0.25, 1, 8.2, cy - 1, 14, 3.8, 3.4, 6);
    m.ellipsoid(cx, cy, 23 + hoverZ, 12.2, 8.4, 9.2, 1);
    // Costillas gigantes y núcleo reactor en el pecho
    for (let rz = 18; rz <= 28; rz += 3.5) {
      m.box(cx - 9.5, cy + 4.5, rz + hoverZ, cx + 9.5, cy + 7.8, rz + 1.6 + hoverZ, 3);
    }
    m.ellipsoid(cx, cy + 7.2, 24 + hoverZ, 3.8, 2.8, 3.8, 5);
    m.ellipsoid(cx, cy + 8.4, 24 + hoverZ, 1.8, 2.0, 2.0, 4);
    // Hombreras titánicas con púas
    m.symEllipsoid(13.5, cy, 32 + hoverZ, 4.4, 4.4, 4.2, 6);
    m.symCapsule(13.5, cy, 35 + hoverZ, 17.5, cy - 1.0, 41 + hoverZ, 2.0, 0.7, 3);
    // Brazos colosales con garras ardientes
    const lf = isCharge ? 7.0 : pose.armSwing * 0.7;
    const rf = isCharge ? 7.0 : -pose.armSwing * 0.7;
    m.capsule(cx - 14.5, cy, 30 + hoverZ, cx - 16.5, cy + 4 + lf, 16 + hoverZ, 3.4, 2.8, 1);
    m.ellipsoid(cx - 16.5, cy + 6 + lf, 15 + hoverZ, 3.2, 3.2, 3.0, 5);
    m.capsule(cx + 14.5, cy, 30 + hoverZ, cx + 16.5, cy + 4 + rf, 16 + hoverZ, 3.4, 2.8, 1);
    m.ellipsoid(cx + 16.5, cy + 6 + rf, 15 + hoverZ, 3.2, 3.2, 3.0, 5);
    // Enorme cráneo de cabra biomecánico + cerebro expuesto + 3er ojo rojo
    m.ellipsoid(cx, cy + 1.5, 39 + hoverZ, 7.6, 6.8, 7.0, 2);
    m.ellipsoid(cx, cy - 0.5, 44.5 + hoverZ, 5.2, 4.2, 2.8, 4); // Cerebro expuesto brillante
    m.box(cx - 4.0, cy + 6.5, 33 + hoverZ, cx + 4.0, cy + 8.6, 36 + hoverZ, 3); // Mandíbula
    // Cuernos curvados masivos de Baphomet
    m.symCapsule(6.2, cy + 1.0, 42 + hoverZ, 12.5, cy - 2.0, 47 + hoverZ, 2.8, 1.8, 3);
    m.symCapsule(12.5, cy - 2.0, 47 + hoverZ, 16.8, cy + 2.5, 50.5 + hoverZ, 1.8, 0.7, 3);
    // Dos ojos + Tercer Ojo abierto en la frente
    m.symBox(2.4, cy + 7.5, 39 + hoverZ, 4.2, cy + 8.6, 40.8 + hoverZ, 4);
    m.ellipsoid(cx, cy + 7.8, 42.5 + hoverZ, 1.8, 1.5, 1.8, 4);
    return m;
  }

  // --- BOSS_NECRO (Flotante con aura de cráneos y báculo espectral) ---
  if (kind === 'BOSS_NECRO') {
    const fz = stepIndex === 1 ? 2 : (stepIndex === 3 ? -1 : 0);
    m.cylinder(cx, cy, 3 + fz, 16 + fz, 9.6, 8.2, 1);
    m.cylinder(cx, cy, 14 + fz, 30 + fz, 8.2, 6.2, 2);
    m.box(cx - 3.2, cy + 5.6, 6 + fz, cx + 3.2, cy + 7.8, 29 + fz, 3);
    // Halo flotante de 4 calaveras detrás de la espalda
    for (let a = 0; a < 4; a++) {
      const ang = (a / 4) * Math.PI * 2 + (stepIndex * 0.2);
      const sx = cx + Math.cos(ang) * 11;
      const sz = 31 + fz + Math.sin(ang) * 10;
      m.ellipsoid(sx, cy - 5.0, sz, 2.2, 2.0, 2.4, 3);
      m.set(sx, cy - 3.2, sz, 4);
    }
    m.symEllipsoid(9.2, cy, 31 + fz, 3.2, 3.2, 2.8, 3);
    m.ellipsoid(cx, cy + 0.5, 37 + fz, 5.4, 5.2, 5.6, 3); // Cráneo lich
    m.capsule(cx, cy - 1.5, 40 + fz, cx, cy - 5.2, 44 + fz, 3.4, 1.0, 1); // Capucha alta
    m.symBox(1.8, cy + 5.2, 36.8 + fz, 3.0, cy + 6.0, 38.0 + fz, 4);
    // Brazos & Báculo necrótico enorme
    m.capsule(cx - 9, cy, 29 + fz, cx - 12.5, cy + 6, 25 + fz, 2.0, 1.6, 2);
    m.ellipsoid(cx - 13, cy + 7, 27 + fz, 2.8, 2.8, 2.8, 5);
    m.capsule(cx + 9, cy, 29 + fz, cx + 13, cy + 5, 24 + fz, 2.0, 1.6, 2);
    m.capsule(cx + 13.5, cy + 5, 2 + fz, cx + 13.5, cy + 5, 42 + fz, 1.2, 1.2, 7);
    m.ellipsoid(cx + 13.5, cy + 5, 44 + fz, 3.2, 3.2, 3.4, 5);
    return m;
  }

  // --- BOSS_CHAMPION (Gladiador con Gran Escudo + Espada Flamígera) ---
  if (kind === 'BOSS_CHAMPION') {
    const legSpread = 6.0;
    m.symCapsule(legSpread, cy + pose.lStride * 0.4, 1, legSpread, cy - 1, 13, 3.2, 2.8, 6);
    m.symEllipsoid(legSpread, cy + 1.8 + pose.lStride * 0.4, 1.4, 3.0, 3.4, 1.6, 7);
    m.ellipsoid(cx, cy, 20 + zOff, 8.4, 5.4, 5.0, 1);
    m.ellipsoid(cx, cy + 0.5, 29 + zOff, 10.2, 6.4, 7.6, 6);
    m.box(cx - 5.5, cy + 4.8, 25 + zOff, cx + 5.5, cy + 7.2, 32 + zOff, 2);
    m.symEllipsoid(11.4, cy, 34 + zOff, 3.6, 3.6, 3.2, 3);
    // Yelmo gladiador con cresta de púas
    m.ellipsoid(cx, cy + 1.0, 38 + zOff, 4.8, 4.8, 5.0, 6);
    m.symCapsule(4.0, cy + 0.5, 40 + zOff, 7.8, cy - 1, 43.5 + zOff, 1.8, 0.7, 3);
    m.box(cx - 2.8, cy + 5.0, 37.5 + zOff, cx + 2.8, cy + 6.2, 39.0 + zOff, 4);
    // Brazo izquierdo: Enorme Escudo con pinchos
    m.capsule(cx - 11.4, cy, 31 + zOff, cx - 12.5, cy + 5, 22 + zOff, 2.8, 2.4, 1);
    m.box(cx - 15.5, cy + 6.5, 11 + zOff, cx - 6.0, cy + 9.2, 33 + zOff, 6);
    m.box(cx - 13.0, cy + 8.5, 16 + zOff, cx - 8.5, cy + 10.2, 27 + zOff, 5);
    // Brazo derecho: Espada colosal flamígera
    const sw = isCharge ? 7.5 : -pose.armSwing * 0.6;
    m.capsule(cx + 11.4, cy, 31 + zOff, cx + 13.5, cy + 5 + sw, 22 + zOff, 2.8, 2.4, 1);
    m.box(cx + 12.5, cy + 4.5 + sw, 20 + zOff, cx + 15.0, cy + 15.5 + sw, 26 + zOff, 5);
    m.box(cx + 13.0, cy + 6.5 + sw, 21 + zOff, cx + 14.5, cy + 17.5 + sw, 24.5 + zOff, 4);
    return m;
  }

  // --- BOSS_VOID (Segador Abisal con Guadañas Gemelas de Energía Cyan/Violeta) ---
  if (kind === 'BOSS_VOID') {
    const fz = stepIndex % 2 === 1 ? 1.5 : 0;
    m.symCapsule(5.2, cy + pose.lStride * 0.4, 2, 5.0, cy, 17, 2.5, 2.3, 6);
    m.ellipsoid(cx, cy, 24 + fz, 7.6, 5.0, 8.2, 1);
    m.box(cx - 4.2, cy + 4.2, 21 + fz, cx + 4.2, cy + 6.0, 29 + fz, 5);
    // Halo dorsal de vacío
    for (let deg = 0; deg < 10; deg++) {
      const a = (deg / 10) * Math.PI * 2;
      m.set(cx + Math.round(Math.cos(a) * 8.5), cy - 5.5, 31 + fz + Math.round(Math.sin(a) * 8.5), 3);
    }
    m.symEllipsoid(10.0, cy, 32 + fz, 3.2, 3.2, 2.8, 2);
    m.ellipsoid(cx, cy + 1.0, 38 + fz, 4.6, 4.6, 5.2, 2);
    m.symCapsule(3.5, cy + 0.5, 40 + fz, 6.5, cy - 2.0, 44.5 + fz, 1.5, 0.5, 3);
    m.symBox(1.6, cy + 5.2, 38 + fz, 3.0, cy + 6.0, 39.4 + fz, 4);
    // Guadañas gemelas en ambos antebrazos
    const lf = isCharge ? 7.0 : pose.armSwing * 0.7;
    const rf = isCharge ? 7.0 : -pose.armSwing * 0.7;
    m.capsule(cx - 10.5, cy, 30 + fz, cx - 13, cy + 5 + lf, 20 + fz, 2.2, 1.8, 2);
    m.capsule(cx - 13, cy + 5 + lf, 20 + fz, cx - 11.5, cy + 14 + lf, 14 + fz, 1.4, 0.5, 3);
    m.capsule(cx + 10.5, cy, 30 + fz, cx + 13, cy + 5 + rf, 20 + fz, 2.2, 1.8, 2);
    m.capsule(cx + 13, cy + 5 + rf, 20 + fz, cx + 11.5, cy + 14 + rf, 14 + fz, 1.4, 0.5, 3);
    return m;
  }

  // --- BARON / CYBERDEMON / BOSS_CYBER / BOSS_PYRO ---
  const isBoss = kind.startsWith('BOSS_') || kind === 'CYBERDEMON';
  const isCyber = kind === 'BOSS_CYBER' || kind === 'CYBERDEMON';
  const isPyro = kind === 'BOSS_PYRO';
  const legSpread = isBoss ? 6.4 : 5.4;

  m.capsule(cx - legSpread, cy + pose.lStride * 0.4, 1, cx - legSpread, cy - 1.2, 11, 3.2, 2.7, 7);
  m.capsule(cx - legSpread, cy - 1.2, 11, cx - legSpread * 0.85, cy + 0.5, 19, 3.3, 3.6, 1);
  m.ellipsoid(cx - legSpread, cy + 1.8 + pose.lStride * 0.4, 1.4, 3.1, 3.5, 1.7, 7);

  const rLegMat = isCyber ? 6 : 7;
  m.capsule(cx + legSpread, cy + pose.rStride * 0.4, 1, cx + legSpread, cy - 1.2, 11, 3.2, 2.7, rLegMat);
  m.capsule(cx + legSpread, cy - 1.2, 11, cx + legSpread * 0.85, cy + 0.5, 19, 3.3, 3.6, isCyber ? 6 : 1);
  m.ellipsoid(cx + legSpread, cy + 1.8 + pose.rStride * 0.4, 1.4, 3.1, 3.5, 1.7, rLegMat);

  const waistZ = isBoss ? 20 + zOff : 19 + zOff;
  const chestZ = isBoss ? 29 + zOff : 27 + zOff;
  m.ellipsoid(cx, cy, waistZ, isBoss ? 8.2 : 7.0, 5.2, 4.6, 1);
  m.ellipsoid(cx, cy + 0.4, chestZ, isBoss ? 10.6 : 9.0, 6.2, isBoss ? 7.8 : 7.0, 1);
  m.symEllipsoid(isBoss ? 4.4 : 3.6, cy + 4.4, chestZ + 1.2, 3.6, 2.4, 3.4, isPyro ? 5 : 2);
  m.ellipsoid(cx, cy + 5.6, chestZ - 0.5, isBoss ? 2.6 : 2.0, 2.2, 2.6, 5);
  m.ellipsoid(cx, cy + 6.4, chestZ - 0.5, 1.2, 1.5, 1.4, 4);

  for (let sp = 0; sp < 4; sp++) {
    m.box(cx - 1.0, cy - 6.8, 22 + sp * 3.2 + zOff, cx + 1.0, cy - 4.8, 23.8 + sp * 3.2 + zOff, isBoss ? 6 : 3);
  }
  if (isCyber) {
    m.box(cx - 4.8, cy - 6.8, chestZ - 3, cx + 4.8, cy - 4.8, chestZ + 4, 6);
    m.box(cx - 2.2, cy - 7.3, chestZ - 1, cx + 2.2, cy - 6.4, chestZ + 2, 5);
  } else if (isPyro) {
    // Corona ígnea en espalda y hombros
    for (let deg = -3; deg <= 3; deg++) {
      m.capsule(cx + deg * 2.2, cy - 5.2, chestZ + 4, cx + deg * 2.6, cy - 6.0, chestZ + 11 - Math.abs(deg), 1.4, 0.5, 3);
    }
  }

  const shoulderZ = chestZ + (isBoss ? 5.0 : 4.2);
  const armSpan = isBoss ? 11.4 : 9.8;
  m.symEllipsoid(armSpan, cy, shoulderZ, 3.4, 3.4, 3.2, isPyro ? 6 : 2);
  if (isBoss) {
    m.symCapsule(armSpan, cy, shoulderZ + 2, armSpan + 3.2, cy - 1.0, shoulderZ + 5.8, 1.8, 0.7, 3);
  }

  const lHandFwd = isCharge ? 7.5 : pose.armSwing * 0.7;
  const rHandFwd = isCharge ? 7.5 : -pose.armSwing * 0.7;
  m.capsule(cx - armSpan, cy, shoulderZ - 1, cx - (armSpan + 2), cy + 1.8, shoulderZ - 10, 2.8, 2.3, 2);
  m.capsule(cx - (armSpan + 2), cy + 1.8, shoulderZ - 10, cx - (armSpan + 1), cy + 5.5 + lHandFwd, shoulderZ - 12, 2.3, 2.0, 1);
  m.ellipsoid(cx - (armSpan + 1), cy + 7.2 + lHandFwd, shoulderZ - 12, 2.5, 2.6, 2.4, 5);

  if (isCyber) {
    m.capsule(cx + armSpan, cy, shoulderZ - 1, cx + (armSpan + 2), cy + 2.0, shoulderZ - 9, 2.9, 2.6, 6);
    m.capsule(cx + (armSpan + 2), cy + 2.0, shoulderZ - 9, cx + (armSpan + 1.5), cy + 9.5 + rHandFwd * 0.4, shoulderZ - 10, 2.9, 2.4, 6);
    m.ellipsoid(cx + (armSpan + 1.5), cy + 10.6 + rHandFwd * 0.4, shoulderZ - 10, 1.9, 1.6, 1.9, 5);
  } else {
    m.capsule(cx + armSpan, cy, shoulderZ - 1, cx + (armSpan + 2), cy + 1.8, shoulderZ - 10, 2.8, 2.3, 2);
    m.capsule(cx + (armSpan + 2), cy + 1.8, shoulderZ - 10, cx + (armSpan + 1), cy + 5.5 + rHandFwd, shoulderZ - 12, 2.3, 2.0, 1);
    m.ellipsoid(cx + (armSpan + 1), cy + 7.2 + rHandFwd, shoulderZ - 12, 2.5, 2.6, 2.4, 5);
  }

  const headZ = chestZ + (isBoss ? 8.8 : 8.0);
  m.ellipsoid(cx, cy + 1.2, headZ, 4.8, 4.6, 4.8, 1);
  m.ellipsoid(cx, cy + 2.2, headZ - 1.2, 4.0, 3.5, 2.4, 2);
  m.symCapsule(4.0, cy + 1.0, headZ + 2.5, 8.8, cy - 0.5, headZ + 7.8, 2.0, 0.7, 3);
  if (isPyro) {
    m.capsule(cx, cy + 1.0, headZ + 4.0, cx, cy + 1.5, headZ + 9.5, 1.6, 0.4, 3);
  }
  m.symBox(1.8, cy + 5.1, headZ + 0.4, 3.2, cy + 6.0, headZ + 1.6, 4);
  return m;
}

function buildGoreVoxelModel(kind, stage) {
  const s = VOXEL_SPECIES_SPECS[kind] || VOXEL_SPECIES_SPECS.IMP;
  const m = new VoxelModel(s.w, s.d, s.h);
  const cx = (s.w - 1) * 0.5;
  const cy = (s.d - 1) * 0.5;
  const midZ = Math.round(s.h * 0.42);
  const isMech = kind === 'TURRET';

  if (stage === 0) {
    m.symCapsule(4.5, cy, 1, 5.2, cy - 1, Math.round(midZ * 0.65), 2.5, 2.2, 1);
    m.ellipsoid(cx, cy, midZ, 7.6, 5.0, 6.2, 1);
    m.ellipsoid(cx, cy + 3.4, midZ, 4.4, 2.6, 3.8, 2);
    m.symBox(1.6, cy + 4.5, midZ - 2, 3.5, cy + 5.6, midZ + 2, 3);
    if (!isMech) m.ellipsoid(cx + 1.2, cy + 1.2, midZ + 8.5, 4.2, 4.0, 4.0, 1);
    return m;
  }
  if (stage === 1) {
    m.ellipsoid(cx, cy, 6.5, 9.5, 7.2, 4.8, 2);
    m.ellipsoid(cx - 2, cy + 1.5, 9.0, 5.5, 4.2, 3.5, 1);
    m.ellipsoid(cx + 3, cy + 2.5, 10.5, 3.6, 3.6, 3.2, 3);
    return m;
  }
  if (stage === 2) {
    m.ellipsoid(cx, cy, 2.0, 11.2, 8.6, 2.2, 2);
    m.ellipsoid(cx, cy + 1.0, 4.0, 7.2, 5.4, 2.4, 1);
    m.box(cx - 4.5, cy + 1.5, 3.5, cx + 4.5, cy + 4.2, 6.2, 3);
    return m;
  }
  m.ellipsoid(cx, cy, 1.2, 12.2, 9.2, 1.3, 2);
  m.ellipsoid(cx + 1.5, cy + 1.5, 2.2, 7.0, 5.2, 1.3, 1);
  m.ellipsoid(cx - 3.0, cy + 3.2, 3.2, 3.0, 3.0, 2.6, 3);
  m.set(cx + 3.2, cy + 2.5, 2.8, 4);
  return m;
}

export function getOrBakeVoxelSprite(kind, anim, dir, frame) {
  const key = `${kind}|${dir}|${anim}|${frame}`;
  const cached = VOXEL_SPRITE_CACHE.get(key);
  if (cached) return cached;

  const spec = VOXEL_SPECIES_SPECS[kind] || VOXEL_SPECIES_SPECS.IMP;
  const isPain = anim === 'pain';
  const isCharge = anim === 'charge';
  const isDeath = anim === 'death';
  const yaw = isDeath ? 0 : dir * (Math.PI * 0.25);

  const model = isDeath
    ? buildGoreVoxelModel(kind, frame)
    : buildEnemyVoxelModel(kind, isCharge ? (frame === 0 ? 1 : 3) : frame, isCharge, isPain);

  let ramps;
  if (isDeath) {
    ramps = kind === 'TURRET'
      ? [null, makeColorRamp('#2b3038', false), makeColorRamp('#495057', false), makeColorRamp('#ffbe0b', false), makeColorRamp('#ff4d00', true)]
      : (kind === 'SPECTRE'
        ? [null, makeColorRamp('#3c096c', false), makeColorRamp('#7209b7', false), makeColorRamp('#00f5d4', false), makeColorRamp('#9d4edd', true)]
        : [null, makeColorRamp('#780000', false), makeColorRamp('#d90429', false), makeColorRamp('#fff3b0', false), makeColorRamp('#ff4d00', true)]);
  } else {
    ramps = buildEnemyRamps(kind, isPain, isCharge);
  }

  const sprite = renderVoxelSprite(model, ramps, yaw, spec.scale, spec.cw, spec.ch);
  VOXEL_SPRITE_CACHE.set(key, sprite);
  return sprite;
}

export function makeEnemyAnimationSet(kind, bodyColor) {
  const walk = Array.from({ length: 8 }, () => [null, null, null, null]);
  const charge = Array.from({ length: 8 }, () => [null, null]);
  const pain = new Array(8).fill(null);
  const death = [null, null, null, null];

  const getWalk = (dir, frame) => {
    const d = dir & 7;
    const f = ((frame % 4) + 4) % 4;
    if (!walk[d][f]) walk[d][f] = getOrBakeVoxelSprite(kind, 'walk', d, f);
    return walk[d][f];
  };
  const getCharge = (dir, frame) => {
    const d = dir & 7;
    const f = frame & 1;
    if (!charge[d][f]) charge[d][f] = getOrBakeVoxelSprite(kind, 'charge', d, f);
    return charge[d][f];
  };
  const getPain = (dir) => {
    const d = dir & 7;
    if (!pain[d]) pain[d] = getOrBakeVoxelSprite(kind, 'pain', d, 0);
    return pain[d];
  };
  const getDeath = (stage) => {
    const f = clamp(Math.floor(stage), 0, 3);
    if (!death[f]) death[f] = getOrBakeVoxelSprite(kind, 'death', 0, f);
    return death[f];
  };

  for (let f = 0; f < 4; f++) getWalk(0, f);
  getCharge(0, 0);
  getCharge(0, 1);
  getPain(0);
  for (let f = 0; f < 4; f++) getDeath(f);

  return {
    kind,
    bodyColor,
    walk,
    charge,
    pain,
    death,
    getWalk,
    getCharge,
    getPain,
    getDeath
  };
}

export function getTintedSprite(sprite, color) {
  let byColor = TINTED_SPRITE_CACHE.get(sprite);
  if (!byColor) {
    byColor = new Map();
    TINTED_SPRITE_CACHE.set(sprite, byColor);
  }
  let tinted = byColor.get(color);
  if (tinted) return tinted;

  tinted = document.createElement('canvas');
  tinted.width = sprite.width;
  tinted.height = sprite.height;
  const tctx = tinted.getContext('2d');
  tctx.drawImage(sprite, 0, 0);
  tctx.globalCompositeOperation = 'source-atop';
  tctx.fillStyle = color;
  tctx.fillRect(0, 0, sprite.width, sprite.height);
  tctx.globalCompositeOperation = 'source-over';
  byColor.set(color, tinted);
  return tinted;
}
