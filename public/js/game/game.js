const WIDTH = 320;
const HEIGHT = 200;
const VIEW_HEIGHT = 168;
const HUD_HEIGHT = HEIGHT - VIEW_HEIGHT;
const FOV_PLANE = 0.66;
const MAX_LEVELS = 10;
const CLIP_SIZE = 12;
const MAX_RESERVE = 60;
const MAX_FUEL = 100;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

// ============================================================================
// MOTOR DE AUDIO PROCEDURAL ESTILO DOOM (Armas, Rugidos Graves, Gore y Ambiente)
// ============================================================================
class HellAudioEngine {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
    this.ambienceNodes = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      const sampleRate = this.ctx.sampleRate;
      this.noiseBuffer = this.ctx.createBuffer(1, sampleRate * 2, sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startAmbience() {
    this.init();
    if (!this.ctx || this.ambienceNodes) return;

    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(0.01, now);
    masterGain.gain.linearRampToValueAtTime(0.16, now + 1.2);
    masterGain.connect(this.ctx.destination);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(41.2, now);
    osc2.frequency.setValueAtTime(61.7, now);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.18, now);
    lfoGain.gain.setValueAtTime(35, now);

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(115, now);
    lfo.connect(droneFilter.frequency);

    const droneGain = this.ctx.createGain();
    droneGain.gain.setValueAtTime(0.45, now);

    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(masterGain);

    const fireSource = this.ctx.createBufferSource();
    fireSource.buffer = this.noiseBuffer;
    fireSource.loop = true;

    const fireFilter = this.ctx.createBiquadFilter();
    fireFilter.type = 'bandpass';
    fireFilter.frequency.setValueAtTime(420, now);
    fireFilter.Q.setValueAtTime(1.4, now);

    const fireGain = this.ctx.createGain();
    fireGain.gain.setValueAtTime(0.22, now);

    fireSource.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(masterGain);

    osc1.start(now);
    osc2.start(now);
    lfo.start(now);
    fireSource.start(now);

    this.ambienceNodes = { masterGain, osc1, osc2, lfo, fireSource };
  }

  setAmbiencePaused(paused) {
    if (!this.ctx || !this.ambienceNodes) return;
    const now = this.ctx.currentTime;
    const target = paused ? 0.0001 : 0.16;
    this.ambienceNodes.masterGain.gain.setTargetAtTime(target, now, 0.08);
  }

  stopAmbience() {
    if (!this.ambienceNodes) return;
    try {
      this.ambienceNodes.osc1.stop();
      this.ambienceNodes.osc2.stop();
      this.ambienceNodes.lfo.stop();
      this.ambienceNodes.fireSource.stop();
      this.ambienceNodes.masterGain.disconnect();
    } catch (_) {}
    this.ambienceNodes = null;
  }

  playShotgun() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const punchOsc = this.ctx.createOscillator();
    const punchGain = this.ctx.createGain();
    punchOsc.type = 'sawtooth';
    punchOsc.frequency.setValueAtTime(150, now);
    punchOsc.frequency.exponentialRampToValueAtTime(26, now + 0.22);

    punchGain.gain.setValueAtTime(0.55, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    punchOsc.connect(punchGain);
    punchGain.connect(this.ctx.destination);
    punchOsc.start(now);
    punchOsc.stop(now + 0.25);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.26);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.65, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.27);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.28);

    [0.16, 0.22].forEach((delay, idx) => {
      const pumpNoise = this.ctx.createBufferSource();
      pumpNoise.buffer = this.noiseBuffer;
      const pumpFilter = this.ctx.createBiquadFilter();
      pumpFilter.type = 'bandpass';
      pumpFilter.frequency.setValueAtTime(idx === 0 ? 1100 : 1550, now + delay);
      pumpFilter.Q.setValueAtTime(3.0, now + delay);

      const pumpGain = this.ctx.createGain();
      pumpGain.gain.setValueAtTime(0.18, now + delay);
      pumpGain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.045);

      pumpNoise.connect(pumpFilter);
      pumpFilter.connect(pumpGain);
      pumpGain.connect(this.ctx.destination);
      pumpNoise.start(now + delay);
      pumpNoise.stop(now + delay + 0.05);
    });
  }

  // Sonido de disparo rápido de la Ametralladora (Chaingun)
  playChaingun() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + 0.09);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.4, now);
    nGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.085);
  }

  // Sonido de llamarada del Lanzallamas Infernal
  playFlamethrower() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(520, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + 0.18);
    filter.Q.setValueAtTime(0.9, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.36, now);
    gain.gain.exponentialRampToValueAtTime(0.008, now + 0.19);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.2);
  }

  // RUGIDO GRAVE Y GUTURAL DE LOS MONSTRUOS AL ACECHAR
  playMonsterGrowl(isBoss = false, dist = 6) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const volume = clamp((1 - dist / 18) * (isBoss ? 0.42 : 0.26), 0.04, 0.45);
    const duration = isBoss ? 0.75 : 0.48;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'square';

    const baseFreq = isBoss ? 44 : 68 + Math.random() * 20;
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.linearRampToValueAtTime(baseFreq * 1.18, now + duration * 0.35);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.55, now + duration);

    osc2.frequency.setValueAtTime(baseFreq * 0.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + duration);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBoss ? 220 : 310, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + duration + 0.02);
    osc2.stop(now + duration + 0.02);
  }

  // Sonido de desmembramiento sangriento + rugido de muerte
  playMonsterDeath(isBoss = false) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const duration = isBoss ? 0.75 : 0.42;

    // 1. Rugido grave descendente
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isBoss ? 95 : 145, now);
    osc.frequency.exponentialRampToValueAtTime(isBoss ? 22 : 32, now + duration);

    gain.gain.setValueAtTime(isBoss ? 0.5 : 0.34, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);

    // 2. Explosión viscosa de sangre / vísceras (Gore Splatter)
    const splatter = this.ctx.createBufferSource();
    splatter.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, now);
    filter.frequency.exponentialRampToValueAtTime(160, now + 0.28);
    filter.Q.setValueAtTime(2.2, now);

    const sGain = this.ctx.createGain();
    sGain.gain.setValueAtTime(0.42, now);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    splatter.connect(filter);
    filter.connect(sGain);
    sGain.connect(this.ctx.destination);
    splatter.start(now);
    splatter.stop(now + 0.32);
  }

  playEmptyClip() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  playReload() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    [0, 0.09].forEach((offset, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(i === 0 ? 320 : 520, now + offset);
      osc.frequency.exponentialRampToValueAtTime(i === 0 ? 180 : 880, now + offset + 0.06);

      gain.gain.setValueAtTime(0.25, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 0.075);
    });
  }

  playHurt() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(135, now);
    osc.frequency.linearRampToValueAtTime(55, now + 0.18);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.19);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playPickup() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(660, now + 0.055);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playSectorPortal() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.35);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  }
}

function makeTexture(type) {
  const texture = document.createElement('canvas');
  texture.width = texture.height = 32;
  const ctx = texture.getContext('2d', { alpha: false });

  if (type === 4 || type === 5) {
    const isFinal = type === 5;
    ctx.fillStyle = '#1a0909';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#381818';
    ctx.fillRect(2, 0, 28, 32);

    ctx.fillStyle = '#ff6d00';
    for (let y = 0; y < 32; y += 4) {
      ctx.fillRect(2, y, 2, 2);
      ctx.fillRect(28, y, 2, 2);
    }

    ctx.fillStyle = '#0d0404';
    ctx.fillRect(8, 1, 16, 6);
    ctx.fillStyle = isFinal ? '#ffd700' : '#ff2a00';
    ctx.fillRect(9, 2, 14, 4);
    ctx.fillStyle = '#fff3b0';
    ctx.fillRect(11, 3, 2, 2);
    ctx.fillRect(15, 3, 2, 2);
    ctx.fillRect(19, 3, 2, 2);

    ctx.fillStyle = isFinal ? '#590d22' : '#261417';
    ctx.fillRect(5, 8, 22, 24);
    ctx.fillStyle = '#0f0506';
    ctx.fillRect(15, 8, 2, 24);

    ctx.fillStyle = isFinal ? '#ffd700' : '#00f5d4';
    ctx.fillRect(10, 13, 12, 12);
    ctx.fillStyle = isFinal ? '#ffffff' : '#caf0f8';
    ctx.fillRect(13, 16, 6, 6);
    return texture;
  }

  const palette = {
    1: ['#2b1717', '#1a0c0c', '#472424', '#ff4d00'],
    2: ['#5e1715', '#80231e', '#2e0908', '#ff9e00'],
    3: ['#24191c', '#3d292e', '#120a0c', '#ff5400']
  }[type] || ['#3b1d1d', '#241010', '#542a2a', '#ff4d00'];

  ctx.fillStyle = palette[0];
  ctx.fillRect(0, 0, 32, 32);

  if (type === 2) {
    for (let y = 0; y < 32; y += 8) {
      ctx.fillStyle = palette[2];
      ctx.fillRect(0, y, 32, 1);
      const offset = ((y / 8) % 2) * 8;
      for (let x = offset; x < 32; x += 16) {
        ctx.fillRect(x, y, 1, 8);
        ctx.fillStyle = palette[1];
        ctx.fillRect(x + 2, y + 2, 11, 4);
        ctx.fillStyle = palette[0];
      }
    }
    ctx.fillStyle = '#ff5400';
    ctx.fillRect(4, 8, 6, 1);
    ctx.fillRect(19, 16, 7, 1);
    ctx.fillRect(10, 24, 5, 1);
  } else if (type === 3) {
    ctx.fillStyle = palette[2];
    ctx.fillRect(2, 2, 28, 28);
    ctx.strokeStyle = palette[1];
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, 24, 24);
    ctx.fillStyle = '#9e1919';
    ctx.fillRect(8, 8, 16, 16);
    ctx.fillStyle = '#ff5400';
    ctx.fillRect(9, 11, 14, 13);
    ctx.fillStyle = '#ffbe0b';
    ctx.fillRect(11, 15, 10, 9);
    ctx.fillStyle = '#fff3b0';
    ctx.fillRect(13, 19, 6, 5);
    ctx.fillStyle = '#140b0d';
    for (let x = 10; x <= 22; x += 4) {
      ctx.fillRect(x, 8, 2, 16);
    }
  } else {
    ctx.fillStyle = palette[2];
    ctx.fillRect(0, 15, 32, 2);
    ctx.fillRect(15, 0, 2, 32);
    ctx.fillStyle = '#ff4d00';
    ctx.fillRect(5, 6, 2, 10);
    ctx.fillRect(6, 14, 8, 2);
    ctx.fillRect(22, 18, 2, 9);
    ctx.fillStyle = '#ffbe0b';
    ctx.fillRect(5, 9, 1, 5);
    ctx.fillRect(22, 20, 1, 5);
  }

  for (let i = 0; i < 28; i++) {
    const x = (i * 17 + type * 7) % 31;
    const y = (i * 11 + type * 13) % 31;
    ctx.fillStyle = i % 2 ? '#ff6d001a' : '#00000048';
    ctx.fillRect(x, y, 1 + (i % 3), 1);
  }
  return texture;
}

function makeFloorTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#1c0f11';
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#291518';
  ctx.fillRect(2, 2, 28, 28);
  ctx.fillRect(34, 34, 28, 28);
  ctx.fillStyle = '#241214';
  ctx.fillRect(34, 2, 28, 28);
  ctx.fillRect(2, 34, 28, 28);

  ctx.fillStyle = '#801515';
  ctx.fillRect(0, 30, 64, 4);
  ctx.fillRect(30, 0, 4, 64);
  ctx.fillStyle = '#ff4d00';
  ctx.fillRect(0, 31, 64, 2);
  ctx.fillRect(31, 0, 2, 64);
  ctx.fillStyle = '#ffbe0b';
  ctx.fillRect(8, 31, 12, 1);
  ctx.fillRect(42, 32, 14, 1);
  ctx.fillRect(31, 10, 1, 14);
  ctx.fillRect(32, 40, 1, 16);
  return canvas;
}

function makeFirePillarSprite(frame) {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 40;
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };

  px(6, 28, 12, 10, '#2b1b1e');
  px(4, 36, 16, 4, '#170e10');
  px(5, 25, 14, 4, '#47282c');
  px(7, 24, 10, 2, '#ff4d00');

  const shift = frame === 0 ? -1 : (frame === 1 ? 1 : 0);
  const tall = frame === 1 ? 2 : 0;

  px(6 + shift, 10 - tall, 12, 15 + tall, '#d90429');
  px(4, 14, 16, 11, '#ff4d00');
  px(8 - shift, 5 - tall, 3, 7, '#ff5400');
  px(13 + shift, 3, 3, 9, '#ff5400');
  px(7, 13 - tall, 10, 12 + tall, '#ff9e00');
  px(8 + shift, 9, 8, 15, '#ffbe0b');
  px(10, 16, 4, 8, '#fff3b0');

  return canvas;
}

// ============================================================================
// GENERADOR DE ANIMACIONES DE CAMINAR (4 FRAMES) Y DESMEMBRAMIENTO GORE (4 FASES)
// ============================================================================
function makeWalkFrame(kind, stepIndex) {
  const canvas = document.createElement('canvas');
  canvas.width = 32;
  canvas.height = 48;
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  const px = (x, y, w, h, color) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };

  // Desplazamientos de piernas, brazos y torso según el paso (0, 1, 2, 3)
  const leftLegY = stepIndex === 1 ? -4 : (stepIndex === 3 ? 2 : 0);
  const rightLegY = stepIndex === 3 ? -4 : (stepIndex === 1 ? 2 : 0);
  const leftLegX = stepIndex === 1 ? -2 : (stepIndex === 3 ? 1 : 0);
  const rightLegX = stepIndex === 3 ? 2 : (stepIndex === 1 ? -1 : 0);
  const torsoBob = stepIndex % 2 === 1 ? -1 : 0;
  const leftArmY = stepIndex === 1 ? -3 : (stepIndex === 3 ? 3 : 0);
  const rightArmY = stepIndex === 3 ? -3 : (stepIndex === 1 ? 3 : 0);

  if (kind === 'CACODEMON') {
    // Demonio carmesí acorazado con patas de araña / garras inferiores que caminan
    px(8, 8 + torsoBob, 16, 24, '#9e1919');
    px(5, 12 + torsoBob, 22, 16, '#c92a2a');
    px(6, 5 + torsoBob, 4, 5, '#d9d9d9');
    px(22, 5 + torsoBob, 4, 5, '#d9d9d9');
    px(12, 13 + torsoBob, 8, 6, '#52b788');
    px(14, 15 + torsoBob, 4, 3, '#ffffff');
    // Fauces abriéndose al andar
    const jawOpen = stepIndex % 2 === 1 ? 2 : 0;
    px(7, 21 + torsoBob, 18, 6 + jawOpen, '#1a090d');
    px(9, 22 + torsoBob, 14, 3 + jawOpen, '#ff4d00');
    for (let x = 8; x < 24; x += 3) {
      px(x, 21 + torsoBob, 2, 2, '#f8f9fa');
      px(x, 25 + torsoBob + jawOpen, 2, 2, '#f8f9fa');
    }
    // Patas musculosas inferiores caminando por el suelo
    px(6 + leftLegX, 32 + leftLegY, 7, 12 - leftLegY, '#781111');
    px(19 + rightLegX, 32 + rightLegY, 7, 12 - rightLegY, '#781111');
    px(4 + leftLegX, 43 + Math.min(0, leftLegY), 9, 5, '#2b0909');
    px(19 + rightLegX, 43 + Math.min(0, rightLegY), 9, 5, '#2b0909');
    return canvas;
  }

  if (kind === 'PINKY') {
    const jaw = stepIndex % 2 === 1 ? 2 : 0;
    px(6, 10 + torsoBob, 20, 22, '#b5485d');
    px(3, 14 + torsoBob, 26, 16, '#d6687f');
    px(9, 12 + torsoBob, 4, 3, '#ffbe0b');
    px(19, 12 + torsoBob, 4, 3, '#ffbe0b');
    px(8, 17 + torsoBob, 16, 8 + jaw, '#2b0912');
    for (let x = 9; x < 23; x += 3) {
      px(x, 17 + torsoBob, 2, 3, '#ffffff');
      px(x, 22 + torsoBob + jaw, 2, 3, '#ffffff');
    }
    // Brazos con garras oscilando
    px(1, 18 + leftArmY, 4, 11, '#b5485d');
    px(27, 18 + rightArmY, 4, 11, '#b5485d');
    // Patas corriendo alternativamente
    px(5 + leftLegX, 32 + leftLegY, 8, 12 - leftLegY, '#8f3447');
    px(19 + rightLegX, 32 + rightLegY, 8, 12 - rightLegY, '#8f3447');
    px(4 + leftLegX, 43 + Math.min(0, leftLegY), 10, 5, '#3d131b');
    px(18 + rightLegX, 43 + Math.min(0, rightLegY), 10, 5, '#3d131b');
    return canvas;
  }

  const palettes = {
    IMP: { horns: '#d9d9d9', dark: '#5c3a21', main: '#8a5a36', eyes: '#ff2a2a', legs: '#472c18', claws: '#ff9f1c' },
    BARON: { horns: '#e0cfc1', dark: '#59191f', main: '#8c2d38', eyes: '#80ed99', legs: '#2b3a2c', claws: '#52b788' },
    BOSS_CYBER: { horns: '#e5e5e5', dark: '#590d22', main: '#9e2a2b', eyes: '#ff0000', legs: '#adb5bd', claws: '#ffbe0b' },
    BOSS_ABYSS: { horns: '#ffd700', dark: '#240046', main: '#5a189a', eyes: '#00f5d4', legs: '#10002b', claws: '#e0aaff' },
    BOSS_OVERLORD: { horns: '#ffb703', dark: '#111111', main: '#2b2d42', eyes: '#ff0055', legs: '#000000', claws: '#ffd700' }
  };
  const p = palettes[kind] || palettes.IMP;

  px(7, 1 + torsoBob, 5, 6, p.horns);
  px(20, 1 + torsoBob, 5, 6, p.horns);
  px(8, 6 + torsoBob, 16, 10, p.dark);
  px(4, 13 + torsoBob, 24, 13, p.main);
  px(7, 15 + torsoBob, 7, 4, p.dark);
  px(18, 15 + torsoBob, 7, 4, p.dark);
  px(9, 10 + torsoBob, 4, 3, p.eyes);
  px(19, 10 + torsoBob, 4, 3, p.eyes);
  px(10, 17 + torsoBob, 12, 3, '#1a0c0e');
  px(11, 18 + torsoBob, 2, 2, '#ffffff');
  px(19, 18 + torsoBob, 2, 2, '#ffffff');
  px(8, 25 + torsoBob, 16, 7, p.dark);

  // Brazos balanceándose al caminar
  px(2, 15 + leftArmY, 4, 15, p.main);
  px(26, 15 + rightArmY, 4, 15, p.main);

  if (kind === 'BOSS_CYBER') {
    px(25, 14 + rightArmY, 7, 17, '#495057');
    px(26, 28 + rightArmY, 5, 5, '#ff4d00');
    px(12, 18 + torsoBob, 8, 5, '#adb5bd');
  } else {
    px(1, 26 + leftArmY, 5, 6, p.claws);
    px(26, 26 + rightArmY, 5, 6, p.claws);
  }

  // Piernas dando zancadas
  px(7 + leftLegX, 32 + leftLegY, 7, 11 - leftLegY, p.legs);
  px(18 + rightLegX, 32 + rightLegY, 7, 11 - rightLegY, kind === 'BOSS_CYBER' ? '#adb5bd' : p.legs);
  px(6 + leftLegX, 42 + Math.min(0, leftLegY), 8, 6, '#1b1113');
  px(18 + rightLegX, 42 + Math.min(0, rightLegY), 8, 6, '#1b1113');

  return canvas;
}

// 4 Fases de Desmembramiento Sangriento (Gore Death Animation + Cadáver en el suelo)
function makeGoreDeathFrames(bodyColor = '#8a2be2') {
  const frames = [];

  for (let stage = 0; stage < 4; stage++) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = false;
    const px = (x, y, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x, y, w, h);
    };

    if (stage === 0) {
      // Fase 1: El pecho revienta en sangre, costillas blancas al descubierto y cabeza saltando por los aires
      px(10, 2, 12, 8, bodyColor); // Cabeza separándose arriba
      px(11, 10, 10, 4, '#d90429'); // Chorro de sangre del cuello
      px(5, 16, 22, 16, bodyColor);
      px(8, 17, 16, 12, '#9e0000'); // Cavidad torácica abierta
      // Costillas rotas blancas
      for (let y = 19; y <= 25; y += 3) {
        px(9, y, 5, 2, '#f8f9fa');
        px(18, y, 5, 2, '#f8f9fa');
      }
      // Brazos arrancados saliendo hacia los lados
      px(0, 12, 5, 10, bodyColor);
      px(27, 10, 5, 10, bodyColor);
      // Salpicaduras de sangre brillante
      px(3, 8, 4, 4, '#ff002b');
      px(24, 6, 4, 4, '#ff002b');
      px(14, 12, 5, 6, '#ff002b');
      // Piernas aún de pie
      px(7, 32, 7, 15, bodyColor);
      px(18, 32, 7, 15, bodyColor);
    } else if (stage === 1) {
      // Fase 2: El cuerpo se parte en dos y cae de rodillas en una fuente de sangre y vísceras
      px(6, 18, 20, 10, '#d90429');
      px(10, 12, 12, 8, '#ff002b');
      // Trozos de carne y cráneo cayendo
      px(2, 22, 6, 6, bodyColor);
      px(23, 20, 7, 7, bodyColor);
      px(13, 20, 6, 6, '#e5e5e5'); // Cráneo ensangrentado
      // Costillas y tripas cayendo
      px(8, 26, 16, 12, '#780000');
      px(10, 28, 12, 4, '#f8f9fa');
      // Piernas dobladas hundiéndose en sangre
      px(5, 36, 22, 11, bodyColor);
      px(3, 42, 26, 6, '#9e0000');
    } else if (stage === 2) {
      // Fase 3: Impacto contra el suelo, gran salpicadura lateral de sangre
      px(2, 34, 28, 13, '#9e0000');
      px(5, 30, 22, 10, '#d90429');
      px(8, 32, 7, 6, '#f8f9fa'); // Cráneo y huesos
      px(17, 35, 9, 6, bodyColor);
      px(4, 26, 3, 5, '#ff002b');
      px(25, 28, 3, 4, '#ff002b');
    } else {
      // Fase 4 (CORPSE permanente): Charco de sangre en el suelo con cráneo, costillas y restos
      px(1, 41, 30, 7, '#660000');
      px(3, 39, 26, 7, '#a30000');
      px(6, 37, 20, 6, '#d90429');
      // Restos desmembrados y cráneo sobre el charco
      px(7, 36, 6, 5, '#e5e5e5');
      px(8, 38, 2, 2, '#111111');
      px(11, 38, 2, 2, '#111111');
      px(15, 37, 10, 5, bodyColor);
      px(16, 38, 6, 2, '#f8f9fa');
    }

    frames.push(canvas);
  }
  return frames;
}

function makeEnemyAnimationSet(kind, bodyColor) {
  return {
    walk: [
      makeWalkFrame(kind, 0),
      makeWalkFrame(kind, 1),
      makeWalkFrame(kind, 2),
      makeWalkFrame(kind, 3)
    ],
    death: makeGoreDeathFrames(bodyColor)
  };
}

// Sprites de bolas de fuego 3D para el Lanzallamas
function makeFlameBallSprite(frame) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 20;
  const c = canvas.getContext('2d');
  c.fillStyle = frame % 2 === 0 ? '#d90429' : '#ff4d00';
  c.fillRect(2, 2, 16, 16);
  c.fillStyle = '#ff9e00';
  c.fillRect(4, 4, 12, 12);
  c.fillStyle = '#ffbe0b';
  c.fillRect(6, 6, 8, 8);
  c.fillStyle = '#ffffff';
  c.fillRect(8, 8, 4, 4);
  return canvas;
}

function makeMedkitSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 16;
  const c = canvas.getContext('2d');
  c.fillStyle = '#d8d2c5';
  c.fillRect(2, 4, 12, 10);
  c.fillStyle = '#525252';
  c.fillRect(2, 4, 12, 2);
  c.fillRect(2, 12, 12, 2);
  c.fillStyle = '#d90429';
  c.fillRect(7, 6, 2, 6);
  c.fillRect(5, 8, 6, 2);
  return canvas;
}

function makeAmmoSprite() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 16;
  const c = canvas.getContext('2d');
  c.fillStyle = '#1b2618';
  c.fillRect(1, 5, 14, 10);
  c.fillStyle = '#384d31';
  c.fillRect(2, 6, 12, 8);
  for (let x = 3; x <= 11; x += 3) {
    c.fillStyle = '#d90429';
    c.fillRect(x, 2, 2, 4);
    c.fillStyle = '#ffbe0b';
    c.fillRect(x, 1, 2, 1);
  }
  c.fillStyle = '#ffbe0b';
  c.fillRect(3, 9, 10, 2);
  return canvas;
}

export class HellfallGame {
  constructor(canvas, { onStatus = () => {}, onFinish = () => {} } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.onStatus = onStatus;
    this.onFinish = onFinish;
    this.audio = new HellAudioEngine();

    this.textures = {
      1: makeTexture(1),
      2: makeTexture(2),
      3: makeTexture(3),
      4: makeTexture(4),
      5: makeTexture(5)
    };
    this.floorTexture = makeFloorTexture();
    this.floorPixels = this.floorTexture.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    this.floorImageData = this.ctx.createImageData(WIDTH, Math.floor(VIEW_HEIGHT / 2) - 1);

    // Conjuntos completos de animación (4 de caminar + 4 de muerte sangrienta)
    this.animSets = {
      IMP: makeEnemyAnimationSet('IMP', '#8a5a36'),
      RUNNER: makeEnemyAnimationSet('PINKY', '#d6687f'),
      PHANTOM: makeEnemyAnimationSet('CACODEMON', '#c92a2a'),
      TANK: makeEnemyAnimationSet('BARON', '#8c2d38'),
      BOSS_CYBER: makeEnemyAnimationSet('BOSS_CYBER', '#9e2a2b'),
      BOSS_ABYSS: makeEnemyAnimationSet('BOSS_ABYSS', '#5a189a'),
      BOSS_OVERLORD: makeEnemyAnimationSet('BOSS_OVERLORD', '#2b2d42')
    };

    this.fireFrames = [
      makeFirePillarSprite(0),
      makeFirePillarSprite(1),
      makeFirePillarSprite(2)
    ];
    this.flameBallSprites = [makeFlameBallSprite(0), makeFlameBallSprite(1)];
    this.medkitSprite = makeMedkitSprite();
    this.ammoSprite = makeAmmoSprite();

    this.keys = new Set();
    this.zBuffer = new Float32Array(WIDTH);
    this.map = [];
    this.mapSize = 42;
    this.fireProps = [];
    this.ammoPacks = [];
    this.flameProjectiles = [];
    this.bloodParticles = [];

    this.running = false;
    this.paused = false;
    this.finished = false;
    this.mouseDown = false;
    this.frameId = null;
    this.lastTime = 0;
    this.lastDamageTime = 0;
    this.shotUntil = 0;
    this.recoil = 0;
    this.muzzleFlash = 0;
    this.walkTime = 0;
    this.walkBobX = 0;
    this.walkBobY = 0;
    this.wasPointerLocked = false;

    this.boundLoop = (time) => this.loop(time);
    this.onKeyDown = (event) => this.handleKeyDown(event);
    this.onKeyUp = (event) => this.handleKeyUp(event);
    this.onMouseMove = (event) => this.handleMouseMove(event);
    this.onPointerLockChange = () => this.handlePointerLockChange();

    this.onMouseDown = (event) => {
      if (!this.running || this.finished) return;
      this.audio.init();
      if (this.paused) {
        const rect = this.canvas.getBoundingClientRect();
        const cx = ((event.clientX - rect.left) / rect.width) * WIDTH;
        const cy = ((event.clientY - rect.top) / rect.height) * HEIGHT;
        if (cx >= 70 && cx <= 250 && cy >= 112 && cy <= 136) {
          this.quitWithoutSaving();
          return;
        }
        this.resume();
        if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
        return;
      }
      if (document.pointerLockElement !== this.canvas && this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      } else if (event.button === 0) {
        this.mouseDown = true;
        this.shoot();
      }
    };

    this.onMouseUp = () => {
      this.mouseDown = false;
    };

    this.onWheel = (event) => {
      if (!this.running || this.paused || this.finished) return;
      const dir = Math.sign(event.deltaY);
      if (dir !== 0) {
        const next = ((this.player.weapon - 1 + dir + 3) % 3) + 1;
        this.selectWeapon(next);
      }
    };

    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('wheel', this.onWheel);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    this.renderAttractScreen();
  }

  selectWeapon(num) {
    if (!this.player) return;
    this.player.weapon = num;
    const names = {
      1: 'Arma [1]: SUPER ESCOPETA (Cartuchos)',
      2: 'Arma [2]: AMETRALLADORA CHAINGUN (Cartuchos)',
      3: 'Arma [3]: LANZALLAMAS INFERNAL (Gasolina)'
    };
    this.onStatus(names[num] || names[1]);
  }

  // Genera una explosión de partículas de sangre en 3D
  spawnBlood(x, y, count = 14) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 2.4;
      this.bloodParticles.push({
        x,
        y,
        z: (Math.random() - 0.3) * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 0.8 + Math.random() * 1.5,
        life: 0.35 + Math.random() * 0.35,
        size: 2 + Math.floor(Math.random() * 3),
        color: Math.random() < 0.6 ? '#d90429' : '#800000'
      });
    }
  }

  generateProceduralMap(level) {
    const rawSize = 42 + (level - 1) * 4;
    const size = rawSize % 2 === 0 ? rawSize + 1 : rawSize;
    this.mapSize = size;

    const grid = Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (__, x) => {
        const hash = (x * 13 + y * 29 + level * 7) % 10;
        if (hash < 5) return '1';
        if (hash < 8) return '2';
        return '3';
      })
    );

    const visited = Array.from({ length: size }, () => Array(size).fill(false));
    const stack = [{ x: 3, y: 3 }];
    visited[3][3] = true;
    grid[3][3] = '0';

    const mazeDirs = [
      { dx: 0, dy: -2 },
      { dx: 2, dy: 0 },
      { dx: 0, dy: 2 },
      { dx: -2, dy: 0 }
    ];

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];

      for (const d of mazeDirs) {
        const nx = current.x + d.dx;
        const ny = current.y + d.dy;
        if (nx > 1 && nx < size - 2 && ny > 1 && ny < size - 2 && !visited[ny][nx]) {
          neighbors.push({ nx, ny, wx: current.x + d.dx / 2, wy: current.y + d.dy / 2 });
        }
      }

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        visited[next.ny][next.nx] = true;
        grid[next.wy][next.wx] = '0';
        grid[next.ny][next.nx] = '0';
        stack.push({ x: next.nx, y: next.ny });
      } else {
        stack.pop();
      }
    }

    const numChambers = 14 + level * 2;
    for (let i = 0; i < numChambers; i++) {
      const w = 4 + Math.floor(Math.random() * 4);
      const h = 4 + Math.floor(Math.random() * 4);
      const rx = 3 + Math.floor(Math.random() * (size - w - 6));
      const ry = 3 + Math.floor(Math.random() * (size - h - 6));

      for (let y = ry; y < ry + h; y++) {
        for (let x = rx; x < rx + w; x++) {
          grid[y][x] = '0';
        }
      }

      const wallType = String(1 + ((i + level) % 3));
      const cx = rx + Math.floor(w / 2);
      const cy = ry + Math.floor(h / 2);

      if (w >= 5 && h >= 5) {
        grid[cy][cx] = wallType;
        if (i % 2 === 0) {
          grid[cy][cx - 1] = wallType;
          grid[cy - 1][cx] = '3';
        } else {
          grid[cy - 1][cx] = wallType;
          grid[cy][cx + 1] = '3';
        }
      } else {
        grid[cy][cx] = '3';
      }
    }

    const extraLoops = Math.floor(size * 2.2);
    for (let i = 0; i < extraLoops; i++) {
      const lx = 2 + Math.floor(Math.random() * (size - 4));
      const ly = 2 + Math.floor(Math.random() * (size - 4));
      if (grid[ly][lx] !== '0') {
        const horizOpen = grid[ly][lx - 1] === '0' && grid[ly][lx + 1] === '0';
        const vertOpen = grid[ly - 1][lx] === '0' && grid[ly + 1][lx] === '0';
        if (horizOpen || vertOpen) grid[ly][lx] = '0';
      }
    }

    grid[3][3] = '0';
    grid[3][4] = '0';
    grid[4][3] = '0';
    const startPos = { x: 3.5, y: 3.5 };

    for (let i = 0; i < size; i++) {
      grid[0][i] = '1';
      grid[size - 1][i] = '1';
      grid[i][0] = '1';
      grid[i][size - 1] = '1';
    }

    const reachable = Array.from({ length: size }, () => Array(size).fill(false));
    const queue = [{ x: 3, y: 3 }];
    reachable[3][3] = true;
    const emptyCells = [];

    const stepDirs = [
      { dx: 0, dy: -1, px: 1, py: 0 },
      { dx: 0, dy: 1, px: 1, py: 0 },
      { dx: -1, dy: 0, px: 0, py: 1 },
      { dx: 1, dy: 0, px: 0, py: 1 }
    ];

    while (queue.length > 0) {
      const curr = queue.shift();
      emptyCells.push({ x: curr.x + 0.5, y: curr.y + 0.5, gx: curr.x, gy: curr.y });

      for (const d of stepDirs) {
        const nx = curr.x + d.dx;
        const ny = curr.y + d.dy;
        if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && !reachable[ny][nx] && grid[ny][nx] === '0') {
          reachable[ny][nx] = true;
          queue.push({ x: nx, y: ny });
        }
      }
    }

    const wallDoorCandidates = [];
    for (const cell of emptyCells) {
      const distFromStart = distance(cell.x, cell.y, startPos.x, startPos.y);
      if (distFromStart < size * 0.45) continue;

      for (const d of stepDirs) {
        const wx = cell.gx + d.dx;
        const wy = cell.gy + d.dy;
        if (
          wx > 1 && wx < size - 2 && wy > 1 && wy < size - 2 &&
          grid[wy][wx] !== '0' &&
          grid[wy + d.py][wx + d.px] !== '0' &&
          grid[wy - d.py][wx - d.px] !== '0'
        ) {
          wallDoorCandidates.push({
            floorX: cell.x,
            floorY: cell.y,
            wallGridX: wx,
            wallGridY: wy,
            wallX: wx + 0.5,
            wallY: wy + 0.5
          });
        }
      }
    }

    const doorTileChar = level === MAX_LEVELS ? '5' : '4';
    let exitDoor;

    if (wallDoorCandidates.length > 0) {
      const chosen = wallDoorCandidates[Math.floor(Math.random() * wallDoorCandidates.length)];
      grid[chosen.wallGridY][chosen.wallGridX] = doorTileChar;
      exitDoor = {
        x: chosen.floorX,
        y: chosen.floorY,
        wallX: chosen.wallX,
        wallY: chosen.wallY
      };
    } else {
      const farthest = emptyCells[emptyCells.length - 1];
      grid[farthest.gy - 1][farthest.gx] = doorTileChar;
      exitDoor = {
        x: farthest.x,
        y: farthest.y,
        wallX: farthest.gx + 0.5,
        wallY: farthest.gy - 0.5
      };
    }

    this.fireProps = [];
    const numFires = 22 + level * 4;
    for (let i = 0; i < numFires && emptyCells.length > 0; i++) {
      const c = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      if (distance(c.x, c.y, startPos.x, startPos.y) > 2 && distance(c.x, c.y, exitDoor.x, exitDoor.y) > 2) {
        this.fireProps.push({
          x: c.x,
          y: c.y,
          phase: Math.floor(Math.random() * 3)
        });
      }
    }

    this.map = grid.map((row) => row.join(''));
    return { startPos, emptyCells, exitDoor };
  }

  reset() {
    this.player = {
      x: 3.5,
      y: 3.5,
      angle: 0,
      health: 100,
      ammo: 10,
      reserve: 16,
      fuel: 45, // Gasolina inicial para el Lanzallamas [3]
      weapon: 1, // 1: Escopeta, 2: Chaingun, 3: Lanzallamas
      kills: 0
    };
    this.startTime = performance.now();
    this.level = 1;
    this.startLevel();
  }

  startLevel() {
    this.recoil = 0;
    this.muzzleFlash = 0;
    this.finished = false;
    this.flameProjectiles = [];
    this.bloodParticles = [];

    const { startPos, emptyCells, exitDoor } = this.generateProceduralMap(this.level);
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.exitDoor = exitDoor;

    this.medkits = [];
    const numMedkits = 4 + Math.floor(this.level / 2);
    for (let i = 0; i < numMedkits; i++) {
      const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      if (distance(cell.x, cell.y, this.player.x, this.player.y) > 4) {
        this.medkits.push({ x: cell.x, y: cell.y, active: true });
      }
    }

    this.ammoPacks = [];
    const numAmmoBoxes = 6 + Math.floor(this.level * 0.9);
    for (let i = 0; i < numAmmoBoxes; i++) {
      const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      if (distance(cell.x, cell.y, this.player.x, this.player.y) > 3.5) {
        this.ammoPacks.push({
          x: cell.x,
          y: cell.y,
          amount: 8,
          fuelAmount: 22,
          active: true
        });
      }
    }

    if (this.player.ammo === 0 && this.player.reserve === 0) {
      this.player.ammo = 4;
    }

    this.enemies = [];
    const validSpawns = emptyCells.filter((c) => distance(c.x, c.y, this.player.x, this.player.y) > 6.5);
    const numNormalEnemies = 14 + this.level * 4;

    const speedLevelScale = 1 + (this.level - 1) * 0.16;
    const hpLevelScale = 1 + (this.level - 1) * 0.35;
    const dmgLevelScale = 1 + (this.level - 1) * 0.22;

    for (let i = 0; i < numNormalEnemies && validSpawns.length > 0; i++) {
      const idx = Math.floor(Math.random() * validSpawns.length);
      const pos = validSpawns.splice(idx, 1)[0];
      const roll = Math.random();

      let archetype;
      if (roll < 0.35) {
        archetype = {
          anims: this.animSets.IMP,
          health: Math.round(2 * hpLevelScale),
          speedMultiplier: 1.05 * speedLevelScale,
          damage: Math.round(8 * dmgLevelScale),
          scale: 0.94
        };
      } else if (roll < 0.65) {
        archetype = {
          anims: this.animSets.RUNNER,
          health: Math.max(2, Math.round(1.5 * hpLevelScale)),
          speedMultiplier: 1.65 * speedLevelScale,
          damage: Math.round(7 * dmgLevelScale),
          scale: 0.92
        };
      } else if (roll < 0.85) {
        archetype = {
          anims: this.animSets.PHANTOM,
          health: Math.round(2.5 * hpLevelScale),
          speedMultiplier: 1.45 * speedLevelScale,
          damage: Math.round(11 * dmgLevelScale),
          scale: 0.98
        };
      } else {
        archetype = {
          anims: this.animSets.TANK,
          health: Math.round(5 * hpLevelScale),
          speedMultiplier: 0.85 * speedLevelScale,
          damage: Math.round(15 * dmgLevelScale),
          scale: 1.18
        };
      }

      this.enemies.push({
        x: pos.x,
        y: pos.y,
        ...archetype,
        maxHealth: archetype.health,
        isBoss: false,
        alive: true,
        state: 'ALIVE', // 'ALIVE', 'DYING', 'CORPSE'
        deathTimer: 0,
        walkCycle: Math.random() * 10,
        growlTimer: 1.5 + Math.random() * 5,
        cooldown: 0
      });
    }

    const bossCount = this.level >= 8 ? 3 : (this.level >= 5 ? 2 : (this.level >= 2 ? 1 : 0));
    const bossVariants = [
      {
        name: 'CYBERDEMON',
        anims: this.animSets.BOSS_CYBER,
        hpBase: 14,
        speedBase: 1.15,
        dmgBase: 22,
        scale: 1.52
      },
      {
        name: 'ARCH-VILE LORD',
        anims: this.animSets.BOSS_ABYSS,
        hpBase: 11,
        speedBase: 1.55,
        dmgBase: 19,
        scale: 1.45
      },
      {
        name: 'ICON OF HELLFALL',
        anims: this.animSets.BOSS_OVERLORD,
        hpBase: 20,
        speedBase: 1.25,
        dmgBase: 28,
        scale: 1.65
      }
    ];

    for (let b = 0; b < bossCount && validSpawns.length > 0; b++) {
      const pos = validSpawns.splice(Math.floor(Math.random() * validSpawns.length), 1)[0];
      const variant = bossVariants[(this.level + b) % bossVariants.length];
      const bossHp = Math.round(variant.hpBase * hpLevelScale);

      this.enemies.push({
        x: pos.x,
        y: pos.y,
        anims: variant.anims,
        health: bossHp,
        maxHealth: bossHp,
        speedMultiplier: variant.speedBase * speedLevelScale,
        damage: Math.round(variant.dmgBase * dmgLevelScale),
        scale: variant.scale,
        isBoss: true,
        alive: true,
        state: 'ALIVE',
        deathTimer: 0,
        walkCycle: Math.random() * 10,
        growlTimer: 1 + Math.random() * 3,
        cooldown: 0
      });
    }

    this.onStatus(`SECTOR ${this.level}/${MAX_LEVELS} // Armas: [1] Escopeta [2] Chaingun [3] Lanzallamas`);
  }

  start() {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.reset();
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    this.audio.startAmbience();
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  quitWithoutSaving() {
    this.running = false;
    this.paused = false;
    this.finished = true;
    this.mouseDown = false;
    this.audio.stopAmbience();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();

    this.renderAttractScreen();
    this.onStatus('Partida abandonada (No se ha guardado la puntuación)');

    const overlay = document.getElementById('game-overlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  destroy() {
    this.running = false;
    this.mouseDown = false;
    this.audio.stopAmbience();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  handleKeyDown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    this.keys.add(event.code);

    if (event.code === 'Escape' && this.running && !this.finished) {
      if (!this.paused) this.pause();
      else this.resume();
      return;
    }

    if (this.paused && event.code === 'KeyQ') {
      this.quitWithoutSaving();
      return;
    }

    // Cambio de armas: [1] Escopeta, [2] Ametralladora, [3] Lanzallamas
    if (!this.paused && this.running) {
      if (event.code === 'Digit1') this.selectWeapon(1);
      if (event.code === 'Digit2') this.selectWeapon(2);
      if (event.code === 'Digit3') this.selectWeapon(3);
    }

    if (event.code === 'Space' && !event.repeat) this.shoot();
    if (event.code === 'KeyR' && !event.repeat) this.reload();
  }

  handleKeyUp(event) {
    this.keys.delete(event.code);
  }

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
    this.paused = true;
    this.mouseDown = false;
    this.audio.setAmbiencePaused(true);
    this.onStatus('Pausado (ESC: Seguir | Q: Salir sin guardar)');
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.drawPauseScreen();
  }

  resume() {
    if (!this.running || this.finished) return;
    this.paused = false;
    this.audio.setAmbiencePaused(false);
    this.lastTime = performance.now();
    this.onStatus(`En misión // SECTOR ${this.level}/${MAX_LEVELS}`);
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  isWall(x, y) {
    const mx = Math.floor(x), my = Math.floor(y);
    if (my < 0 || mx < 0 || my >= this.map.length || mx >= this.map[0].length) return true;
    return this.map[my][mx] !== '0';
  }

  moveWithCollision(dx, dy) {
    const radius = 0.19;
    if (
      !this.isWall(this.player.x + dx + Math.sign(dx) * radius, this.player.y) &&
      !this.isWall(this.player.x + dx, this.player.y + radius) &&
      !this.isWall(this.player.x + dx, this.player.y - radius)
    ) {
      this.player.x += dx;
    }
    if (
      !this.isWall(this.player.x + radius, this.player.y + dy) &&
      !this.isWall(this.player.x - radius, this.player.y + dy) &&
      !this.isWall(this.player.x, this.player.y + dy)
    ) {
      this.player.y += dy;
    }
  }

  killEnemy(enemy) {
    enemy.alive = false;
    enemy.state = 'DYING';
    enemy.deathTimer = 0;
    this.player.kills += enemy.isBoss ? 5 : 1;
    this.audio.playMonsterDeath(enemy.isBoss);
    this.spawnBlood(enemy.x, enemy.y, enemy.isBoss ? 32 : 18);

    if (enemy.isBoss) {
      this.ammoPacks.push({ x: enemy.x, y: enemy.y, amount: 12, fuelAmount: 35, active: true });
      this.onStatus('¡BOSS DESMEMBRADO! Ha soltado munición y combustible');
    } else if (Math.random() < 0.25) {
      this.ammoPacks.push({ x: enemy.x, y: enemy.y, amount: 5, fuelAmount: 15, active: true });
    }
  }

  update(dt, now) {
    const player = this.player;
    if (this.keys.has('ArrowLeft')) player.angle -= dt * 1.9;
    if (this.keys.has('ArrowRight')) player.angle += dt * 1.9;

    const fast = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
    const speed = (fast ? 3.9 : 2.75) * dt;
    let forward = 0, strafe = 0;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += speed;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= speed;
    if (this.keys.has('KeyA')) strafe -= speed;
    if (this.keys.has('KeyD')) strafe += speed;

    const dx = Math.cos(player.angle) * forward + Math.cos(player.angle + Math.PI / 2) * strafe;
    const dy = Math.sin(player.angle) * forward + Math.sin(player.angle + Math.PI / 2) * strafe;
    if (dx || dy) {
      this.moveWithCollision(dx, dy);
      this.walkTime += dt * (fast ? 11 : 7.5);
      this.walkBobX = Math.sin(this.walkTime) * 5;
      this.walkBobY = Math.abs(Math.cos(this.walkTime)) * 3.5;
    } else {
      this.walkBobX *= 0.82;
      this.walkBobY *= 0.82;
    }

    // Fuego continuo si mantiene pulsado clic o Espacio (para Chaingun y Lanzallamas)
    if (this.mouseDown || this.keys.has('Space')) {
      this.shoot();
    }

    // Actualizar proyectiles de fuego 3D del Lanzallamas
    for (let i = this.flameProjectiles.length - 1; i >= 0; i--) {
      const p = this.flameProjectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      if (p.life <= 0 || this.isWall(p.x, p.y)) {
        this.flameProjectiles.splice(i, 1);
        continue;
      }

      // Comprobar si la bola de fuego quema a algún enemigo
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        if (Math.hypot(p.x - enemy.x, p.y - enemy.y) < 0.75) {
          enemy.health -= p.damage;
          this.spawnBlood(enemy.x, enemy.y, 4);
          this.flameProjectiles.splice(i, 1);
          if (enemy.health <= 0) {
            this.killEnemy(enemy);
          }
          break;
        }
      }
    }

    // Actualizar partículas de sangre en 3D
    for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
      const bp = this.bloodParticles[i];
      bp.x += bp.vx * dt;
      bp.y += bp.vy * dt;
      bp.z -= bp.vz * dt;
      bp.life -= dt;
      if (bp.life <= 0) {
        this.bloodParticles.splice(i, 1);
      }
    }

    // Recoger Botiquines
    for (const medkit of this.medkits) {
      if (medkit.active && Math.hypot(player.x - medkit.x, player.y - medkit.y) < 0.55 && player.health < 100) {
        player.health = Math.min(100, player.health + 35);
        medkit.active = false;
        this.audio.playPickup();
        this.onStatus('Botiquín recogido (+35 SALUD)');
      }
    }

    // Recoger Cajas de Munición y Gasolina del Lanzallamas
    for (const pack of this.ammoPacks) {
      if (!pack.active) continue;
      if (Math.hypot(player.x - pack.x, player.y - pack.y) < 0.55) {
        if (player.reserve < MAX_RESERVE || player.ammo < CLIP_SIZE || player.fuel < MAX_FUEL) {
          player.reserve = Math.min(MAX_RESERVE, player.reserve + pack.amount);
          player.fuel = Math.min(MAX_FUEL, player.fuel + (pack.fuelAmount || 20));
          if (player.ammo === 0 && player.reserve > 0) {
            this.reload();
          } else {
            this.audio.playPickup();
          }
          pack.active = false;
          this.onStatus(`Suministros recogidos (+${pack.amount} Cartuchos / +Gasolina Lanzallamas)`);
        }
      }
    }

    const detectionRange = 15 + this.level * 1.8;
    for (const enemy of this.enemies) {
      if (enemy.state === 'DYING') {
        enemy.deathTimer += dt * 4.5; // Avanza por las 4 fases de desmembramiento
        if (enemy.deathTimer >= 3) {
          enemy.state = 'CORPSE';
          enemy.deathTimer = 3;
        }
        continue;
      }
      if (!enemy.alive) continue;

      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);

      // Sonido grave gutural periódico cuando el monstruo está cerca
      enemy.growlTimer -= dt;
      if (enemy.growlTimer <= 0) {
        enemy.growlTimer = (enemy.isBoss ? 2.5 : 4.0) + Math.random() * 4.5;
        if (dist < 14) {
          this.audio.playMonsterGrowl(enemy.isBoss, dist);
        }
      }

      if (dist > 1.05 && dist < detectionRange) {
        const speedEnemy = (0.62 * enemy.speedMultiplier) * dt;
        const ex = ((player.x - enemy.x) / dist) * speedEnemy;
        const ey = ((player.y - enemy.y) / dist) * speedEnemy;
        if (!this.isWall(enemy.x + ex, enemy.y)) enemy.x += ex;
        if (!this.isWall(enemy.x, enemy.y + ey)) enemy.y += ey;

        // Avanzar animación de caminar (4 frames de zancada)
        enemy.walkCycle += dt * (4.5 * enemy.speedMultiplier);
      } else if (dist <= 1.05 && enemy.cooldown <= 0) {
        player.health = Math.max(0, player.health - enemy.damage);
        enemy.cooldown = Math.max(0.45, 0.85 - this.level * 0.03);
        this.lastDamageTime = now;
        this.audio.playHurt();
      }
    }

    this.recoil = Math.max(0, this.recoil - dt * 3.2);
    this.muzzleFlash = Math.max(0, this.muzzleFlash - dt * 6.0);

    if (player.health <= 0) {
      this.finish(false);
      return;
    }

    if (
      this.exitDoor &&
      distance(player.x, player.y, this.exitDoor.x, this.exitDoor.y) < 0.75 &&
      distance(player.x, player.y, this.exitDoor.wallX, this.exitDoor.wallY) < 0.98
    ) {
      this.audio.playSectorPortal();
      if (this.level >= MAX_LEVELS) {
        this.finish(true);
      } else {
        this.level++;
        player.health = Math.min(100, player.health + 20);
        this.startLevel();
      }
    }
  }

  shoot() {
    if (!this.running || this.paused || this.finished) return;
    const now = performance.now();
    if (now < this.shotUntil) return;

    const w = this.player.weapon;

    // ARMA 3: LANZALLAMAS INFERNAL
    if (w === 3) {
      if (this.player.fuel <= 0) {
        this.audio.playEmptyClip();
        this.onStatus('¡SIN GASOLINA! Recoge cajas verdes o pulsa [1]/[2]');
        this.shotUntil = now + 250;
        return;
      }
      this.shotUntil = now + 75;
      this.player.fuel = Math.max(0, this.player.fuel - 1);
      this.recoil = 0.35;
      this.muzzleFlash = 0.9;
      this.audio.playFlamethrower();

      const spread = (Math.random() - 0.5) * 0.16;
      const angle = this.player.angle + spread;
      this.flameProjectiles.push({
        x: this.player.x + Math.cos(angle) * 0.35,
        y: this.player.y + Math.sin(angle) * 0.35,
        vx: Math.cos(angle) * 9.5,
        vy: Math.sin(angle) * 9.5,
        life: 0.55,
        damage: 0.55
      });
      return;
    }

    // ARMAS 1 (ESCOPETA) Y 2 (CHAINGUN) USAN CARTUCHOS
    if (this.player.ammo <= 0) {
      this.audio.playEmptyClip();
      this.shotUntil = now + 250;
      if (this.player.reserve > 0) {
        this.onStatus('Cargador vacío: pulsa [R] para recargar');
      } else {
        this.onStatus('¡SIN CARTUCHOS! Usa [3] Lanzallamas o busca cajas');
      }
      return;
    }

    const isChaingun = w === 2;
    this.shotUntil = now + (isChaingun ? 105 : 270);
    this.player.ammo -= 1;
    this.recoil = isChaingun ? 0.55 : 1.0;
    this.muzzleFlash = 1;

    if (isChaingun) {
      this.audio.playChaingun();
    } else {
      this.audio.playShotgun();
    }

    let selected = null;
    let best = Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - this.player.x;
      const dy = enemy.y - this.player.y;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const delta = Math.atan2(Math.sin(angle - this.player.angle), Math.cos(angle - this.player.angle));
      const hitCone = enemy.isBoss ? 0.24 : (isChaingun ? 0.12 : 0.17);

      if (
        Math.abs(delta) < Math.max(0.06, hitCone / Math.max(1, dist)) &&
        dist < best &&
        dist < 16 &&
        this.lineOfSight(this.player.x, this.player.y, enemy.x, enemy.y)
      ) {
        selected = enemy;
        best = dist;
      }
    }

    if (selected) {
      const dmg = isChaingun ? 0.85 : 1.25;
      selected.health -= dmg;
      this.spawnBlood(selected.x, selected.y, isChaingun ? 7 : 14);
      if (selected.health <= 0) {
        this.killEnemy(selected);
      }
    }

    if (this.player.ammo === 0) {
      if (this.player.reserve > 0) {
        this.onStatus('Sin munición en el arma: pulsa [R] para recargar');
      } else {
        this.onStatus('¡SIN BALAS! Cambia al [3] Lanzallamas o busca cajas');
      }
    }
  }

  reload() {
    if (!this.running || this.paused || this.finished || this.player.ammo >= CLIP_SIZE || this.player.reserve <= 0) return;
    const needed = CLIP_SIZE - this.player.ammo;
    const loaded = Math.min(needed, this.player.reserve);
    this.player.ammo += loaded;
    this.player.reserve -= loaded;
    this.shotUntil = performance.now() + 200;
    this.audio.playReload();
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
    this.finished = true;
    this.running = false;
    this.paused = false;
    this.mouseDown = false;
    this.audio.stopAmbience();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    const now = performance.now();
    this.renderWorld(now);
    this.drawHUD(now);
    this.onStatus(won ? '¡LOS 10 SECTORES COMPLETADOS! Partida guardada' : 'Agente caído // Partida guardada');
    this.onFinish({
      won,
      kills: this.player.kills,
      durationMs: Math.max(1000, Math.round(now - this.startTime))
    });
  }

  loop(now) {
    if (!this.running || this.paused || this.finished) return;
    const dt = clamp((now - this.lastTime) / 1000, 0, 0.045);
    this.lastTime = now;
    this.update(dt, now);
    if (!this.finished) {
      this.renderWorld(now);
      this.drawHUD(now);
      this.frameId = requestAnimationFrame(this.boundLoop);
    }
  }

  renderAttractScreen() {
    const c = this.ctx;
    for (let y = 0; y < VIEW_HEIGHT; y += 2) {
      const ratio = y / VIEW_HEIGHT;
      const r = Math.floor(45 + ratio * 185);
      const g = Math.floor(5 + ratio * 55);
      const b = Math.floor(5 + ratio * 8);
      c.fillStyle = `rgb(${r},${g},${b})`;
      c.fillRect(0, y, WIDTH, 2);
    }

    c.fillStyle = '#14090b';
    c.fillRect(58, 26, 204, 112);
    c.strokeStyle = '#ff4d00';
    c.lineWidth = 2;
    c.strokeRect(60, 28, 200, 108);

    c.font = 'bold 30px monospace';
    c.textAlign = 'center';
    c.fillStyle = '#000000';
    c.fillText('HELLFALL', WIDTH / 2 + 2, 68);
    c.fillStyle = '#d90429';
    c.fillText('HELLFALL', WIDTH / 2, 66);
    c.fillStyle = '#ffb703';
    c.fillText('HELLFALL', WIDTH / 2, 64);

    c.fillStyle = '#ff9e00';
    c.font = 'bold 8px monospace';
    c.fillText('BRUTAL DOOM EDITION // 10 SECTORS', WIDTH / 2, 88);
    c.fillStyle = '#e1cfc2';
    c.fillText('[1] SHOTGUN · [2] CHAINGUN · [3] FLAMER', WIDTH / 2, 104);

    c.fillStyle = '#3b1d1d';
    c.fillRect(0, VIEW_HEIGHT, WIDTH, HUD_HEIGHT);
    c.fillStyle = '#ffb703';
    c.font = 'bold 10px monospace';
    c.fillText('PRESS DEPLOY TO ENTER HELL', WIDTH / 2, 188);
  }

  renderWorld(now) {
    const c = this.ctx;
    const px = this.player.x, py = this.player.y;
    const dirX = Math.cos(this.player.angle), dirY = Math.sin(this.player.angle);
    const planeX = -dirY * FOV_PLANE, planeY = dirX * FOV_PLANE;
    const horizon = VIEW_HEIGHT / 2;

    for (let y = 0; y < horizon; y++) {
      const mix = y / horizon;
      const r = Math.floor(40 + mix * 145);
      const g = Math.floor(6 + mix * 38);
      const b = Math.floor(8 + mix * 6);
      c.fillStyle = `rgb(${r},${g},${b})`;
      c.fillRect(0, y, WIDTH, 1);
    }

    for (let x = 0; x < WIDTH; x += 4) {
      const flameH = 4 + Math.floor(Math.abs(Math.sin(now * 0.009 + x * 0.17) * 8));
      c.fillStyle = '#ff4d00';
      c.fillRect(x, horizon - flameH, 4, flameH);
      c.fillStyle = '#ffbe0b';
      c.fillRect(x + 1, horizon - Math.floor(flameH * 0.55), 2, Math.floor(flameH * 0.55));
    }

    const floorPixels = this.floorPixels;
    const flicker = 0.94 + Math.sin(now * 0.015) * 0.06;

    for (let y = horizon + 1; y < VIEW_HEIGHT; y++) {
      const outputY = y - (horizon + 1);
      const p = y - horizon;
      const rowDistance = (0.5 * VIEW_HEIGHT) / p;
      const rayDirX0 = dirX - planeX, rayDirY0 = dirY - planeY;
      const rayDirX1 = dirX + planeX, rayDirY1 = dirY + planeY;
      const stepX = (rowDistance * (rayDirX1 - rayDirX0)) / WIDTH;
      const stepY = (rowDistance * (rayDirY1 - rayDirY0)) / WIDTH;
      let floorX = px + rowDistance * rayDirX0;
      let floorY = py + rowDistance * rayDirY0;

      const shade = clamp(1 - rowDistance * 0.085, 0.16, 0.85) * flicker;
      const emberFog = clamp(rowDistance * 0.04, 0, 0.35);

      for (let x = 0; x < WIDTH; x++) {
        const cellX = Math.floor(floorX), cellY = Math.floor(floorY);
        const tx = Math.floor(64 * (floorX - cellX)) & 63;
        const ty = Math.floor(64 * (floorY - cellY)) & 63;
        const sx = (tx + cellX * 3) & 63, sy = (ty + cellY * 3) & 63;
        const pixelIndex = (sy * 64 + sx) * 4;
        const outputIndex = (outputY * WIDTH + x) * 4;

        this.floorImageData.data[outputIndex] = Math.min(255, Math.floor(floorPixels[pixelIndex] * shade + 75 * emberFog));
        this.floorImageData.data[outputIndex + 1] = Math.floor(floorPixels[pixelIndex + 1] * shade + 12 * emberFog);
        this.floorImageData.data[outputIndex + 2] = Math.floor(floorPixels[pixelIndex + 2] * shade + 8 * emberFog);
        this.floorImageData.data[outputIndex + 3] = 255;
        floorX += stepX;
        floorY += stepY;
      }
    }
    c.putImageData(this.floorImageData, 0, horizon + 1);

    for (let x = 0; x < WIDTH; x++) {
      const cameraX = (2 * x) / WIDTH - 1;
      const rayDirX = dirX + planeX * cameraX;
      const rayDirY = dirY + planeY * cameraX;
      let mapX = Math.floor(px), mapY = Math.floor(py);
      const deltaDistX = Math.abs(1 / (rayDirX || 0.00001));
      const deltaDistY = Math.abs(1 / (rayDirY || 0.00001));
      let sideDistX, sideDistY;
      const stepX = rayDirX < 0 ? -1 : 1;
      const stepY = rayDirY < 0 ? -1 : 1;

      if (rayDirX < 0) sideDistX = (px - mapX) * deltaDistX;
      else sideDistX = (mapX + 1 - px) * deltaDistX;
      if (rayDirY < 0) sideDistY = (py - mapY) * deltaDistY;
      else sideDistY = (mapY + 1 - py) * deltaDistY;

      let side = 0, steps = 0;
      while (steps++ < 160) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }
        if (
          mapY < 0 ||
          mapX < 0 ||
          mapY >= this.map.length ||
          mapX >= this.map[0].length ||
          this.map[mapY][mapX] !== '0'
        ) {
          break;
        }
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

      const tile = Number(this.map[mapY]?.[mapX] || '1');
      const texture = this.textures[tile] || this.textures[1];
      const isDoorTile = tile === 4 || tile === 5;
      const fireFlicker = tile === 3 ? 0.12 * Math.sin(now * 0.02 + mapX + mapY) : 0;

      const darkness = isDoorTile
        ? clamp(1 - wallDist * 0.03, 0.58, 1)
        : clamp(1 - wallDist * 0.068 + fireFlicker, 0.15, 0.92) * (side === 1 ? 0.74 : 1);

      c.drawImage(texture, texX, 0, 1, 32, x, drawStart, 1, Math.max(1, drawEnd - drawStart));
      if (darkness < 0.98) {
        c.fillStyle = `rgba(22, 4, 4, ${1 - darkness})`;
        c.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }
      if (tile === 3 && wallDist < 7) {
        c.fillStyle = `rgba(255, 80, 0, ${0.14 + 0.08 * Math.sin(now * 0.018 + x * 0.1)})`;
        c.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }
    }

    this.renderBillboards(dirX, dirY, planeX, planeY, now);
    this.drawMinimap();
    this.drawCrosshair();
    this.drawWeapon(now);

    if (now - this.lastDamageTime < 260) {
      c.fillStyle = `rgba(225, 15, 10, ${0.32 * (1 - (now - this.lastDamageTime) / 260)})`;
      c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    }
  }

  renderBillboards(dirX, dirY, planeX, planeY, now) {
    const c = this.ctx;
    const animFrame = Math.floor(now / 110) % 3;

    // Seleccionar el fotograma correcto de cada enemigo (Caminando, Desmembrándose o Cadáver en el suelo)
    const enemyObjects = this.enemies.map((enemy) => {
      let sprite;
      let stepBounce = 0;
      if (enemy.state === 'ALIVE') {
        const walkIdx = Math.floor(enemy.walkCycle) % 4;
        sprite = enemy.anims.walk[walkIdx];
        stepBounce = (walkIdx % 2 === 1) ? -2 : 0;
      } else {
        const deathIdx = clamp(Math.floor(enemy.deathTimer), 0, 3);
        sprite = enemy.anims.death[deathIdx];
      }
      return { ...enemy, type: 'enemy', sprite, stepBounce };
    });

    const objects = [
      ...enemyObjects,
      ...this.medkits.filter((item) => item.active).map((item) => ({ ...item, type: 'medkit', sprite: this.medkitSprite, scale: 0.42 })),
      ...this.ammoPacks.filter((pack) => pack.active).map((pack) => ({ ...pack, type: 'ammo', sprite: this.ammoSprite, scale: 0.44 })),
      ...this.fireProps.map((fire) => ({
        x: fire.x,
        y: fire.y,
        type: 'fire',
        sprite: this.fireFrames[(animFrame + fire.phase) % 3],
        scale: 0.72
      })),
      ...this.flameProjectiles.map((fp, i) => ({
        x: fp.x,
        y: fp.y,
        type: 'flameBall',
        sprite: this.flameBallSprites[(animFrame + i) % 2],
        scale: 0.55
      }))
    ];

    objects.sort(
      (a, b) =>
        Math.hypot(this.player.x - b.x, this.player.y - b.y) -
        Math.hypot(this.player.x - a.x, this.player.y - a.y)
    );

    const invDet = 1.0 / (planeX * dirY - dirX * planeY);

    for (const object of objects) {
      const spriteX = object.x - this.player.x;
      const spriteY = object.y - this.player.y;

      const transformX = invDet * (dirY * spriteX - dirX * spriteY);
      const transformY = invDet * (-planeY * spriteX + planeX * spriteY);

      if (transformY <= 0.15 || transformY > 22) continue;

      const spriteScreenX = Math.floor((WIDTH / 2) * (1 + transformX / transformY));
      const fullRoomHeight = Math.abs(Math.floor(VIEW_HEIGHT / transformY));
      const scale = object.scale || (object.isBoss ? 1.5 : 0.94);
      const spriteHeight = fullRoomHeight * scale;
      const isPickup = object.type === 'medkit' || object.type === 'ammo' || object.type === 'flameBall';
      const spriteWidth = spriteHeight * (isPickup ? 1 : 0.65);

      // Anclar los monstruos y objetos al suelo real para que NO vengan volando
      const floorAnchorY = Math.floor(VIEW_HEIGHT / 2 + fullRoomHeight / 2);
      const rawStartY = object.type === 'flameBall'
        ? Math.floor(VIEW_HEIGHT / 2 - spriteHeight / 2)
        : Math.floor(floorAnchorY - spriteHeight + (object.stepBounce || 0));

      const drawStartY = Math.max(0, rawStartY);
      const drawEndY = Math.min(VIEW_HEIGHT - 1, Math.floor(rawStartY + spriteHeight));

      const drawStartX = Math.max(0, Math.floor(spriteScreenX - spriteWidth / 2));
      const drawEndX = Math.min(WIDTH - 1, Math.floor(spriteScreenX + spriteWidth / 2));

      for (let stripe = drawStartX; stripe <= drawEndX; stripe++) {
        if (transformY >= this.zBuffer[stripe]) continue;

        const texX = Math.floor(
          ((stripe - (spriteScreenX - spriteWidth / 2)) * object.sprite.width) / Math.max(1, spriteWidth)
        );

        c.drawImage(
          object.sprite,
          clamp(texX, 0, object.sprite.width - 1),
          0,
          1,
          object.sprite.height,
          stripe,
          drawStartY,
          1,
          Math.max(1, drawEndY - drawStartY)
        );
      }
    }

    // Renderizar las partículas de sangre 3D salpicando por el aire
    for (const bp of this.bloodParticles) {
      const sx = bp.x - this.player.x;
      const sy = bp.y - this.player.y;
      const tx = invDet * (dirY * sx - dirX * sy);
      const ty = invDet * (-planeY * sx + planeX * sy);
      if (ty <= 0.15) continue;

      const screenX = Math.floor((WIDTH / 2) * (1 + tx / ty));
      const screenY = Math.floor(VIEW_HEIGHT / 2 + (bp.z * VIEW_HEIGHT) / ty);
      if (screenX >= 0 && screenX < WIDTH && screenY >= 0 && screenY < VIEW_HEIGHT && ty < this.zBuffer[screenX]) {
        c.fillStyle = bp.color;
        const pSize = Math.max(1, Math.floor(bp.size / Math.max(0.5, ty * 0.4)));
        c.fillRect(screenX, screenY, pSize, pSize);
      }
    }
  }

  drawMinimap() {
    const c = this.ctx;
    const mapBox = 48;
    const startX = WIDTH - mapBox - 4;
    const startY = 4;
    const scale = mapBox / this.mapSize;

    c.fillStyle = 'rgba(14, 5, 6, 0.84)';
    c.fillRect(startX, startY, mapBox, mapBox);

    c.fillStyle = '#4a2020';
    for (let y = 0; y < this.mapSize; y++) {
      const row = this.map[y];
      if (!row) continue;
      for (let x = 0; x < this.mapSize; x++) {
        if (row[x] !== '0') {
          c.fillRect(startX + x * scale, startY + y * scale, Math.ceil(scale), Math.ceil(scale));
        }
      }
    }

    c.strokeStyle = '#ff4d00';
    c.strokeRect(startX, startY, mapBox, mapBox);

    c.fillStyle = '#ffbe0b';
    for (const pack of this.ammoPacks) {
      if (!pack.active) continue;
      c.fillRect(startX + pack.x * scale - 0.8, startY + pack.y * scale - 0.8, 1.8, 1.8);
    }

    if (this.exitDoor) {
      c.fillStyle = this.level === MAX_LEVELS ? '#ffd700' : '#00f5d4';
      c.fillRect(startX + this.exitDoor.wallX * scale - 1.5, startY + this.exitDoor.wallY * scale - 1.5, 3, 3);
    }

    for (const e of this.enemies) {
      if (!e.alive) continue;
      c.fillStyle = e.isBoss ? '#ff0055' : '#ff6d00';
      const s = e.isBoss ? 2.5 : 1.5;
      c.fillRect(startX + e.x * scale - 1, startY + e.y * scale - 1, s, s);
    }

    c.fillStyle = '#80ed99';
    c.fillRect(startX + this.player.x * scale - 1.5, startY + this.player.y * scale - 1.5, 3, 3);
  }

  drawCrosshair() {
    const c = this.ctx;
    const cy = Math.floor(VIEW_HEIGHT / 2);
    c.fillStyle = '#ffbe0b';
    c.fillRect(WIDTH / 2 - 4, cy, 3, 1);
    c.fillRect(WIDTH / 2 + 2, cy, 3, 1);
    c.fillRect(WIDTH / 2, cy - 4, 1, 3);
    c.fillRect(WIDTH / 2, cy + 2, 1, 3);
  }

  // Renderiza las 3 armas de DOOM en 1ª persona ([1] Escopeta, [2] Chaingun, [3] Lanzallamas)
  drawWeapon(now) {
    const c = this.ctx;
    const recoilY = Math.floor(this.recoil * 9);
    const bobX = Math.floor(this.walkBobX || 0);
    const bobY = Math.floor(this.walkBobY || 0);
    const cx = Math.floor(WIDTH / 2 + bobX);
    const baseY = VIEW_HEIGHT + bobY + recoilY;
    const w = this.player.weapon;

    // ARMA 2: AMETRALLADORA ROTATORIA (CHAINGUN)
    if (w === 2) {
      if (this.muzzleFlash > 0.12) {
        c.fillStyle = '#ff4d00';
        c.fillRect(cx - 26, baseY - 64, 52, 20);
        c.fillStyle = '#ffbe0b';
        c.fillRect(cx - 16, baseY - 60, 32, 14);
        c.fillStyle = '#ffffff';
        c.fillRect(cx - 8, baseY - 54, 16, 8);
      }
      const spinOffset = Math.floor(now / 40) % 3;
      // 4 cañones giratorios pesados
      c.fillStyle = '#1b1d21';
      c.fillRect(cx - 18, baseY - 48, 36, 26);
      c.fillStyle = '#6c757d';
      for (let bx = -14 + spinOffset; bx <= 12; bx += 7) {
        c.fillRect(cx + bx, baseY - 48, 3, 24);
      }
      // Abrazadera metálica de los cañones
      c.fillStyle = '#adb5bd';
      c.fillRect(cx - 19, baseY - 40, 38, 4);
      c.fillRect(cx - 19, baseY - 28, 38, 4);
      // Cuerpo motorizado de la Chaingun y cinturón de balas
      c.fillStyle = '#2b2d42';
      c.fillRect(cx - 24, baseY - 22, 48, 22);
      c.fillStyle = '#ffbe0b';
      for (let y = baseY - 20; y < baseY - 4; y += 4) {
        c.fillRect(cx + 22, y, 8, 2);
      }
      return;
    }

    // ARMA 3: LANZALLAMAS INFERNAL (FLAMETHROWER)
    if (w === 3) {
      // Chorro gigante de llamas al disparar
      if (this.muzzleFlash > 0.1) {
        const flick = Math.floor(Math.sin(now * 0.05) * 6);
        c.fillStyle = 'rgba(255, 50, 0, 0.75)';
        c.fillRect(cx - 34 + flick, baseY - 96, 68, 52);
        c.fillStyle = '#ff9e00';
        c.fillRect(cx - 22 - flick, baseY - 82, 44, 38);
        c.fillStyle = '#fff3b0';
        c.fillRect(cx - 10, baseY - 66, 20, 22);
      } else {
        // Llama piloto azul/naranja encendida en la boquilla
        const pFlick = Math.floor(Math.sin(now * 0.03) * 2);
        c.fillStyle = '#00b4d8';
        c.fillRect(cx - 3, baseY - 56 + pFlick, 6, 6);
        c.fillStyle = '#ffbe0b';
        c.fillRect(cx - 2, baseY - 59 + pFlick, 4, 4);
      }

      // Boquilla térmica y escudo perforado
      c.fillStyle = '#2b2d33';
      c.fillRect(cx - 10, baseY - 50, 20, 24);
      c.fillStyle = '#ff4d00';
      c.fillRect(cx - 6, baseY - 46, 12, 4);
      // Tanque de combustible presurizado lateral (naranja/rojo)
      c.fillStyle = '#9e1919';
      c.fillRect(cx + 10, baseY - 34, 16, 26);
      c.fillStyle = '#ff6d00';
      c.fillRect(cx + 12, baseY - 32, 6, 20);
      // Cuerpo industrial y manguera
      c.fillStyle = '#343a40';
      c.fillRect(cx - 20, baseY - 26, 36, 26);
      c.fillStyle = '#adb5bd';
      c.fillRect(cx - 14, baseY - 22, 22, 6);
      return;
    }

    // ARMA 1: SUPER ESCOPETA DE DOBLE CAÑÓN
    if (this.muzzleFlash > 0.12) {
      c.fillStyle = '#ff4d00';
      c.fillRect(cx - 24, baseY - 68, 48, 22);
      c.fillRect(cx - 14, baseY - 76, 28, 32);
      c.fillStyle = '#ffbe0b';
      c.fillRect(cx - 16, baseY - 64, 32, 16);
      c.fillStyle = '#ffffff';
      c.fillRect(cx - 8, baseY - 58, 16, 9);
    }

    c.fillStyle = '#1b1d21';
    c.fillRect(cx - 14, baseY - 50, 12, 26);
    c.fillRect(cx + 2, baseY - 50, 12, 26);

    c.fillStyle = '#6c757d';
    c.fillRect(cx - 12, baseY - 50, 4, 24);
    c.fillRect(cx + 4, baseY - 50, 4, 24);
    c.fillStyle = '#adb5bd';
    c.fillRect(cx - 10, baseY - 50, 2, 22);
    c.fillRect(cx + 6, baseY - 50, 2, 22);
    c.fillStyle = '#d90429';
    c.fillRect(cx - 1, baseY - 52, 2, 3);

    c.fillStyle = '#2b2d33';
    c.fillRect(cx - 19, baseY - 28, 38, 16);
    c.fillStyle = '#495057';
    c.fillRect(cx - 15, baseY - 28, 30, 12);
    c.fillStyle = '#111215';
    for (let y = baseY - 46; y < baseY - 28; y += 4) {
      c.fillRect(cx - 2, y, 4, 2);
    }

    c.fillStyle = '#4a2511';
    c.fillRect(cx - 23, baseY - 16, 46, 16);
    c.fillStyle = '#7f4f24';
    c.fillRect(cx - 19, baseY - 14, 38, 10);
    c.fillStyle = '#9c6644';
    c.fillRect(cx - 14, baseY - 12, 28, 5);

    c.fillStyle = '#3d2314';
    c.fillRect(cx - 28, baseY - 9, 14, 10);
    c.fillRect(cx + 14, baseY - 9, 14, 10);
    c.fillStyle = '#d4a373';
    c.fillRect(cx - 25, baseY - 10, 9, 3);
    c.fillRect(cx + 16, baseY - 10, 9, 3);
  }

  drawDoomGuyFace(c, x, y, now = performance.now()) {
    const px = (dx, dy, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x + dx, y + dy, w, h);
    };

    px(0, 0, 32, 30, '#141414');
    px(1, 1, 30, 28, '#262626');

    const hp = this.player.health;
    const isHit = now - this.lastDamageTime < 420;
    const isFiring = this.muzzleFlash > 0.1 || this.recoil > 0.4;
    const lookDir = isHit || isFiring ? 0 : (Math.floor(now / 950) % 3) - 1;

    px(6, 2, 20, 6, '#4a2c18');
    px(5, 4, 22, 4, '#633b20');

    const skinColor = hp <= 0 ? '#7a8278' : '#e0ac8b';
    const shadeSkin = hp <= 0 ? '#575e56' : '#c68b67';
    px(6, 7, 20, 17, skinColor);
    px(8, 24, 16, 4, shadeSkin);
    px(6, 14, 3, 8, shadeSkin);
    px(23, 14, 3, 8, shadeSkin);

    if (isHit) {
      px(8, 9, 6, 2, '#3b2010');
      px(18, 9, 6, 2, '#3b2010');
    } else {
      px(8, 10, 6, 2, '#3b2010');
      px(18, 10, 6, 2, '#3b2010');
    }

    if (hp <= 0) {
      px(9, 13, 5, 1, '#2b1212');
      px(18, 13, 5, 1, '#2b1212');
    } else {
      px(9, 12, 5, 3, '#ffffff');
      px(18, 12, 5, 3, '#ffffff');
      const eyeColor = isFiring ? '#ffbe0b' : '#2b2d42';
      px(10 + lookDir, 12, 2, 3, eyeColor);
      px(19 + lookDir, 12, 2, 3, eyeColor);
    }

    px(14, 13, 4, 5, shadeSkin);

    if (hp <= 0) {
      px(11, 21, 10, 4, '#3d0c0c');
    } else if (isHit) {
      px(12, 19, 8, 6, '#2b0909');
      px(13, 20, 6, 2, '#ffffff');
    } else if (isFiring) {
      px(9, 20, 14, 4, '#2b0909');
      px(10, 21, 12, 2, '#ffffff');
    } else {
      px(11, 21, 10, 2, '#6e3b2b');
      px(12, 21, 8, 1, '#ffffff');
    }

    if (hp < 80) {
      px(7, 8, 3, 5, '#b80c09');
      px(21, 17, 3, 4, '#b80c09');
    }
    if (hp < 55) {
      px(13, 7, 3, 6, '#d90429');
      px(10, 23, 5, 4, '#9e0000');
      px(22, 11, 3, 7, '#b80c09');
    }
    if (hp < 30) {
      px(8, 15, 6, 8, '#a30000');
      px(17, 19, 6, 7, '#d90429');
      px(14, 24, 5, 4, '#780000');
    }
  }

  drawHUD(now = performance.now()) {
    const c = this.ctx;

    const drawBevelBox = (x, y, w, h) => {
      c.fillStyle = '#4f5254';
      c.fillRect(x, y, w, h);
      c.fillStyle = '#7a7e82';
      c.fillRect(x, y, w, 1);
      c.fillRect(x, y, 1, h);
      c.fillStyle = '#242628';
      c.fillRect(x, y + h - 1, w, 1);
      c.fillRect(x + w - 1, y, 1, h);
    };

    drawBevelBox(0, VIEW_HEIGHT, 68, HUD_HEIGHT);
    drawBevelBox(68, VIEW_HEIGHT, 76, HUD_HEIGHT);
    drawBevelBox(144, VIEW_HEIGHT, 32, HUD_HEIGHT);
    drawBevelBox(176, VIEW_HEIGHT, 72, HUD_HEIGHT);
    drawBevelBox(248, VIEW_HEIGHT, 72, HUD_HEIGHT);

    this.drawDoomGuyFace(c, 144, VIEW_HEIGHT + 1, now);

    c.font = 'bold 14px monospace';
    c.textAlign = 'center';

    const drawDoomNum = (text, cx, cy, color = '#d90429') => {
      c.fillStyle = '#0f0f0f';
      c.fillText(text, cx + 1, cy + 1);
      c.fillStyle = color;
      c.fillText(text, cx, cy);
    };

    // Si tiene el Lanzallamas [3], muestra la gasolina; si tiene [1] o [2], los cartuchos
    if (this.player.weapon === 3) {
      const fuelColor = this.player.fuel <= 15 ? '#ffb703' : '#ff6d00';
      drawDoomNum(`${this.player.fuel}%`, 34, VIEW_HEIGHT + 17, fuelColor);
    } else {
      const totalAmmo = this.player.ammo + this.player.reserve;
      const ammoColor = totalAmmo <= 6 ? '#ffb703' : '#e63946';
      drawDoomNum(`${this.player.ammo}/${this.player.reserve}`, 34, VIEW_HEIGHT + 17, ammoColor);
    }

    const hpColor = this.player.health > 30 ? '#e63946' : '#ffb703';
    drawDoomNum(`${Math.max(0, this.player.health)}%`, 106, VIEW_HEIGHT + 17, hpColor);
    drawDoomNum(String(this.player.kills).padStart(3, '0'), 212, VIEW_HEIGHT + 17, '#e63946');
    drawDoomNum(`${String(this.level).padStart(2, '0')}/${MAX_LEVELS}`, 284, VIEW_HEIGHT + 17, '#ffb703');

    c.font = 'bold 7px monospace';
    c.fillStyle = '#d8d2c5';
    const weaponLabel = this.player.weapon === 3 ? 'FLAMER [3]' : (this.player.weapon === 2 ? 'CHAINGUN [2]' : 'SHOTGUN [1]');
    c.fillText(weaponLabel, 34, VIEW_HEIGHT + 28);
    c.fillText('HEALTH', 106, VIEW_HEIGHT + 28);
    c.fillText('KILLS', 212, VIEW_HEIGHT + 28);
    c.fillText('SECTOR', 284, VIEW_HEIGHT + 28);
  }

  drawPauseScreen() {
    const c = this.ctx;
    c.fillStyle = 'rgba(18, 4, 4, 0.88)';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    c.fillStyle = '#ff4d00';
    c.font = 'bold 24px monospace';
    c.textAlign = 'center';
    c.fillText('PAUSED', WIDTH / 2, 58);

    c.fillStyle = '#eee0d1';
    c.font = '8px monospace';
    c.fillText('PULSA [ESC] O CLIC PARA CONTINUAR', WIDTH / 2, 82);

    c.fillStyle = '#4a1c1c';
    c.fillRect(70, 112, 180, 24);
    c.strokeStyle = '#ffb703';
    c.strokeRect(70, 112, 180, 24);
    c.fillStyle = '#ffffff';
    c.font = 'bold 8px monospace';
    c.fillText('[Q] SALIR SIN GUARDAR', WIDTH / 2, 127);

    this.drawHUD(performance.now());
  }
}