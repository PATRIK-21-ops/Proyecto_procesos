// ============================================================================
// FONDO ANIMADO DE FUEGO ESTILO DOOM (ALGORITMO CLÁSICO DE PROPAGACIÓN DE LLAMAS)
// ============================================================================

const FIRE_PALETTE = [
  [7, 7, 7], [24, 6, 7], [47, 10, 7], [71, 14, 7], [87, 20, 7], [103, 28, 7],
  [119, 34, 7], [143, 39, 7], [159, 47, 7], [175, 58, 7], [191, 68, 7], [199, 76, 7],
  [215, 88, 7], [223, 98, 7], [223, 108, 7], [215, 118, 7], [215, 128, 7], [215, 140, 12],
  [215, 152, 16], [207, 162, 20], [207, 174, 24], [207, 184, 30], [207, 194, 36], [199, 204, 42],
  [215, 212, 60], [226, 222, 92], [239, 232, 128], [248, 242, 174], [255, 250, 215], [255, 255, 255]
];

export class DoomFireEffect {
  constructor(canvas) {
    this.canvas = canvas;
    this.w = 160;
    this.h = 100;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.img = this.ctx.createImageData(this.w, this.h);
    this.fire = new Uint8Array(this.w * this.h);
    this.embers = Array.from({ length: 34 }, () => this.makeEmber(true));
    this.rafId = null;
    this.running = false;
    this.lastStep = 0;

    // Base incandescente en la fila inferior
    const maxIdx = FIRE_PALETTE.length - 1;
    for (let x = 0; x < this.w; x++) {
      this.fire[(this.h - 1) * this.w + x] = maxIdx;
    }
    // Precalentar unas cuantas iteraciones para que al abrir ya haya llamas
    for (let i = 0; i < 45; i++) this.stepFire();
  }

  makeEmber(randomY = false) {
    return {
      x: Math.random() * this.w,
      y: randomY ? Math.random() * this.h : this.h - 2,
      vx: (Math.random() - 0.5) * 0.45,
      vy: -(0.35 + Math.random() * 0.85),
      heat: 16 + Math.floor(Math.random() * 12)
    };
  }

  stepFire() {
    const w = this.w;
    const h = this.h;
    const fire = this.fire;
    const maxIdx = FIRE_PALETTE.length - 1;

    // Variación en la fuente inferior para llamas orgánicas
    for (let x = 0; x < w; x++) {
      fire[(h - 1) * w + x] = Math.random() < 0.14 ? maxIdx - 3 : maxIdx;
    }

    for (let y = 1; y < h; y++) {
      const rowOffset = y * w;
      const aboveOffset = (y - 1) * w;
      for (let x = 0; x < w; x++) {
        const src = fire[rowOffset + x];
        if (src === 0) {
          fire[aboveOffset + x] = 0;
        } else {
          const rand = (Math.random() * 3) | 0;
          const wind = (Math.random() * 3) | 0; // -1..1 drift
          const dstX = (x - wind + 1 + w) % w;
          const decay = rand & 1;
          const next = src - (decay === 0 && Math.random() < 0.35 ? 1 : (rand > 1 ? 1 : 0));
          fire[aboveOffset + dstX] = next > 0 ? next : 0;
        }
      }
    }

    for (const em of this.embers) {
      em.x += em.vx + Math.sin(em.y * 0.15) * 0.12;
      em.y += em.vy;
      if (em.y < 2 || em.x < 0 || em.x >= w) {
        Object.assign(em, this.makeEmber(false));
      }
    }
  }

  render() {
    const data = this.img.data;
    const fire = this.fire;
    const len = this.w * this.h;
    for (let i = 0; i < len; i++) {
      const val = fire[i];
      const [r, g, b] = FIRE_PALETTE[val] || FIRE_PALETTE[0];
      const o = i * 4;
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
      data[o + 3] = 255;
    }
    // Chispas ascendentes brillantes
    for (const em of this.embers) {
      const ex = Math.floor(em.x);
      const ey = Math.floor(em.y);
      if (ex >= 0 && ex < this.w && ey >= 0 && ey < this.h) {
        const [r, g, b] = FIRE_PALETTE[Math.min(FIRE_PALETTE.length - 1, em.heat)];
        const o = (ey * this.w + ex) * 4;
        data[o] = r;
        data[o + 1] = g;
        data[o + 2] = b;
      }
    }
    this.ctx.putImageData(this.img, 0, 0);
  }

  start() {
    if (this.running) return;
    this.running = true;
    const tick = (now) => {
      if (!this.running) return;
      if (now - this.lastStep >= 34) {
        this.lastStep = now;
        this.stepFire();
        this.render();
      }
      this.rafId = requestAnimationFrame(tick);
    };
    this.rafId = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
}
