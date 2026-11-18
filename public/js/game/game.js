// ============================================================================
// CONFIGURACIÓN CENTRALIZADA DE BALANCE Y MOTOR (HELLFALL // DOOM 1993 EDITION)
// ============================================================================
const CONFIG = {
  WIDTH: 320,
  HEIGHT: 200,
  VIEW_HEIGHT: 168,
  HUD_HEIGHT: 32,
  FOV_PLANE: 0.76,
  WALL_SCALE: 1.58, // Techos altos e imponentes para que los Bosses grandes quepan con holgura
  MAX_LEVELS: 10,
  MAP_SIZE: 48,

  // Armas y economía: escopeta con 7 perdigones reales y lanzallamas eficiente (0.35 fuel/disparo)
  CLIP_SIZE: 12,
  MAX_RESERVE: 96,
  MAX_FUEL: 100,
  START_AMMO: 16,
  START_RESERVE: 24,
  START_FUEL: 45,
  START_ARMOR: 20,
  SHOTGUN_COOLDOWN_MS: 420,
  SHOTGUN_DAMAGE: 2.15,
  SHOTGUN_PELLET_DAMAGE: 0.44,
  SHOTGUN_PELLET_COUNT: 7,
  SHOTGUN_SPREAD: 0.19,
  CHAINGUN_COOLDOWN_MS: 92,
  CHAINGUN_DAMAGE: 1.12,
  FLAMER_COOLDOWN_MS: 58,
  FLAMER_DAMAGE: 0.54,
  FLAMER_FUEL_COST: 0.35,
  REROLL_COST: 8,
  BARREL_COUNT: 6,
  BARREL_RADIUS: 3.2,
  BARREL_DAMAGE: 6.5,

  // Motosierra: se desbloquea con 40 bajas y convierte los cadáveres en suministros
  CHAINSAW_UNLOCK_KILLS: 40,
  CHAINSAW_COOLDOWN_MS: 115,
  CHAINSAW_DAMAGE: 1.45,
  CHAINSAW_RANGE: 1.85,
  CHAINSAW_SHELL_RANGE: [2, 3],
  CHAINSAW_FUEL_RANGE: [6, 10],

  // Ejecuciones de gloria: remate cercano con [E] o motosierra
  GLORY_THRESHOLD: 0.2,
  GLORY_WINDOW_MS: 1500,
  GLORY_HEAL: 10,
  GLORY_INVULN_MS: 1000,
  GLORY_RANGE: 1.9,

  // Rachas de bajas
  COMBO_WINDOW_MS: 3000,
  COMBO_BONUS: { 2: 100, 3: 250, 4: 500 },

  // Eventos de sector
  HAZARD_COUNT: 4,
  HAZARD_RADIUS: [2.2, 3.6],
  HAZARD_DPS: 1,
  HAZARD_IDLE_SEC: 0.35,
  DARK_LEVELS: [2, 6, 10],
  TOXIC_LEVELS: [4, 8],

  // Demonios especiales
  LOST_SOUL_PACK: 3,
  SUMMONER_REVIVES: 2,
  SUMMONER_REVIVE_CD: [5.5, 8.5],
  SHIELD_BLOCK_ARC: 0.95,

  // Botín de cofres, suelo y monedas
  CHEST_COUNT: 4,
  CHEST_AMMO_RANGE: [10, 16],
  CHEST_FUEL_RANGE: [16, 26],
  CHEST_HEALTH_CHANCE: 0.7,
  CHEST_HEALTH_AMOUNT: 20,
  CHEST_ARMOR_CHANCE: 0.5,
  CHEST_ARMOR_AMOUNT: 20,
  CHEST_COIN_RANGE: [6, 10],
  FLOOR_AMMO_CHANCE: 1.0, // Siempre hay al menos una caja de munición por sector
  FLOOR_AMMO_AMOUNT: 8,
  FLOOR_FUEL_AMOUNT: 18,
  FLOOR_MEDKIT_CHANCE: 0.75,
  FLOOR_MEDKIT_HEAL: 25,
  SOULSPHERE_HEALTH: 35,
  MAX_SOUL_HEALTH: 135,
  BERSERK_DURATION: 12.0,

  // Monedas: salen de los cofres y, a veces, de los demonios
  ENEMY_COIN_CHANCE: 0.35,
  ENEMY_COIN_RANGE: [1, 3],
  BOSS_COIN_RANGE: [12, 18],

  // Mercader de almas: sala cerrada con compuerta propia y mejoras de arsenal
  MERCHANT: {
    AMMO: { price: 8, amount: 14, label: 'CAJA DE CARTUCHOS', detail: '+14 balas de reserva' },
    HEALTH: { price: 10, amount: 35, label: 'BOTIQUÍN DE CAMPO', detail: '+35% de salud' },
    ARMOR: { price: 12, amount: 30, label: 'PLACA DE BLINDAJE', detail: '+30% de armadura' },
    FUEL: { price: 6, amount: 35, label: 'BIDÓN DE GASOLINA', detail: '+35% de combustible' },
    WEAPON_MOD: { price: 15, amount: 12, label: 'TEMPLAR ARSENAL', detail: '+12% daño de armas permanente' }
  },

  // Paletas temáticas visuales para cada uno de los 10 sectores
  SECTOR_THEMES: [
    { name: 'HANGAR DE CONTENCIÓN', layout: 'GRID', wall1: '#3d2b2f', wall2: '#5e1715', floor: '#2b1619', ceil: '#4a080a', vein: '#ff4d00', glow: '#ffbe0b' },
    { name: 'PLANTA NUCLEAR', layout: 'RING', wall1: '#23362b', wall2: '#1b4332', floor: '#13241b', ceil: '#0f291e', vein: '#70e000', glow: '#ccff33' },
    { name: 'REFINERÍA TÓXICA', layout: 'CORRIDORS', wall1: '#42331b', wall2: '#5c4318', floor: '#261e10', ceil: '#33240c', vein: '#ffbe0b', glow: '#fff3b0' },
    { name: 'CENTRO DE MANDO', layout: 'CROSS', wall1: '#1d2d44', wall2: '#1b3b5a', floor: '#111d2b', ceil: '#0d1b2a', vein: '#00b4d8', glow: '#caf0f8' },
    { name: 'LABORATORIOS UAC', layout: 'CITADEL', wall1: '#495057', wall2: '#343a40', floor: '#212529', ceil: '#2b3035', vein: '#00f5d4', glow: '#ffffff' },
    { name: 'ANOMALÍA DE DEIMOS', layout: 'RING', wall1: '#3c1e4d', wall2: '#4a154b', floor: '#210f2b', ceil: '#2d0c3a', vein: '#9d4edd', glow: '#e0aaff' },
    { name: 'FORTALEZA DE CARNE', layout: 'CROSS', wall1: '#590d22', wall2: '#800f2f', floor: '#38040e', ceil: '#590d22', vein: '#ff0055', glow: '#ffccd5' },
    { name: 'TORRE DE BABEL', layout: 'CITADEL', wall1: '#2b2623', wall2: '#4a3b2c', floor: '#1a1614', ceil: '#291f14', vein: '#ffd700', glow: '#fff3b0' },
    { name: 'SANTUARIO PROFANO', layout: 'CORRIDORS', wall1: '#1a2e2b', wall2: '#264653', floor: '#101f1d', ceil: '#142b27', vein: '#2ec4b6', glow: '#cbf3f0' },
    { name: 'EL ABISMO', layout: 'RING', wall1: '#240046', wall2: '#3c096c', floor: '#10002b', ceil: '#190033', vein: '#ff007f', glow: '#ffbe0b' }
  ],

  // Densidad y escalado de dificultad
  BASE_ENEMIES: 11,
  ENEMIES_PER_LEVEL: 1.55,
  MAX_REGULAR_ENEMIES: 26,
  MIN_ENEMY_SPACING: 3.4,
  LEVEL_HP_SCALE: 0.14,
  LEVEL_DMG_SCALE: 0.10,
  LEVEL_SPEED_SCALE: 0.04,
  ELITE_START_LEVEL: 4,
  ELITE_CHANCE: 0.22,

  // Mejoras permanentes que se eligen en el intermedio (con rangos: se pueden mejorar dos veces)
  UPGRADES: [
    {
      id: 'POWER_FIST', label: 'PUÑO INFERNAL', short: 'PUÑO', type: 'ACTIVA [V]', maxRank: 2, color: '#ff4d00', dynamic: true,
      ranks: ['Puñetazo brutal: empuja lejos, aturde y estampa demonios contra los muros', 'El golpe lanza una onda en cono que machaca a varios demonios']
    },
    {
      id: 'KINETIC_BURST', label: 'PULSO CINÉTICO', short: 'PULSO', type: 'REACTIVA', maxRank: 2, color: '#00b4d8', dynamic: true,
      ranks: ['Al recibir daño o verte rodeado liberas una onda que repele demonios', 'Onda mayor y más frecuente: aturde y devuelve los proyectiles']
    },
    {
      id: 'COUNTER_STRIKE', label: 'CONTRAGOLPE', short: 'CONTRA', type: 'REACTIVA', maxRank: 2, color: '#ffbe0b', dynamic: true,
      ranks: ['Si un demonio se te pega le sueltas un puñetazo automático', 'Contragolpe más rápido: sale despedido y derriba a otros demonios']
    },
    {
      id: 'SHOCK_DASH', label: 'EMBESTIDA DEMONÍACA', short: 'EMBEST', type: 'ACTIVA [C]', maxRank: 2, color: '#9d4edd', dynamic: true,
      ranks: ['[C] acometida invulnerable que arrolla y aparta a los demonios', 'Más daño, aturdimiento largo y recarga mucho más rápida']
    },
    {
      id: 'EXPLOSIVE_SHELLS', label: 'CARTUCHOS DEMOLEDORES', short: 'BOOM', type: 'PASIVA', maxRank: 2, color: '#ff9e00', dynamic: true,
      ranks: ['Los demonios abatidos a tiros explotan y empujan a los cercanos', 'Explosiones más grandes que hacen mucho más daño']
    },
    {
      id: 'FLAME_AURA', label: 'AURA ÍGNEA', short: 'AURA', type: 'REACTIVA', maxRank: 2, color: '#d90429', dynamic: true,
      ranks: ['Los demonios que se te acercan empiezan a arder', 'Aura más amplia que además los repele con llamaradas']
    },
    {
      id: 'FAST_RELOAD', label: 'RECARGA RÁPIDA', short: 'RECARGA', type: 'PASIVA', maxRank: 1, color: '#adb5bd',
      ranks: ['-35% de espera al recargar el arma']
    },
    {
      id: 'AMMO_POUCH', label: 'CARTUCHERA AMPLIADA', short: 'CARTUCH', type: 'PASIVA', maxRank: 2, color: '#ffd166',
      ranks: ['+8 de reserva máxima y 8 cartuchos de regalo', '+8 más de reserva máxima (+16 en total)']
    },
    {
      id: 'VAMPIRISM', label: 'VAMPIRISMO INFERNAL', short: 'VAMPIRO', type: 'PASIVA', maxRank: 2, color: '#e63946',
      ranks: ['+3 HP por baja cuerpo a cuerpo (puño, sierra o gloria)', '+6 HP por cada baja cuerpo a cuerpo']
    },
    {
      id: 'REACTIVE_ARMOR', label: 'BLINDAJE REACTIVO', short: 'BLINDAJE', type: 'PASIVA', maxRank: 1, color: '#70e000',
      ranks: ['El blindaje absorbe el 55% del daño (antes 40%)']
    }
  ],

  // El infierno responde a las mejoras acumuladas (rangos totales) con más presión
  UPGRADE_PRESSURE: {
    HP: 0.06,
    DAMAGE: 0.05,
    SPEED: 0.015,
    EXTRA_ENEMIES: 0.6,
    BOSS_HP: 0.05,
    ELITE: 0.015
  },

  // Combate cuerpo a cuerpo (el puñetazo base está siempre disponible con [V] o clic derecho)
  PUNCH_COOLDOWN_MS: 620,
  PUNCH_RANGE: 1.5,
  PUNCH_DAMAGE: 1.3,
  PUNCH_UPGRADE_RANGE: 2.3,
  PUNCH_UPGRADE_DAMAGE: 4.2,
  PUNCH_KNOCKBACK: 3.2,
  PUNCH_UPGRADE_KNOCKBACK: 8.5,
  KNOCK_DECAY: 5.0,
  WALL_SLAM_SPEED: 3.4,
  WALL_SLAM_DAMAGE: 1.8,
  KINETIC_COOLDOWN_MS: [5200, 3400],
  KINETIC_RADIUS: [3.0, 3.9],
  KINETIC_DAMAGE: [1.0, 1.8],
  KINETIC_FORCE: [7.0, 9.5],
  COUNTER_COOLDOWN_MS: [2300, 1400],
  DASH_COOLDOWN_MS: [3600, 2200],
  DASH_DURATION_MS: 190,
  DASH_SPEED: 13.5,
  EXPLOSION_RADIUS: [2.3, 3.1],
  EXPLOSION_DAMAGE: [2.6, 4.2],
  AURA_RADIUS: [1.9, 2.5],

  // Medallas de fin de partida
  MEDALS: [
    { id: 'BUTCHER', name: 'CARNICERO', desc: '+15 bajas con motosierra', color: '#ff4d00' },
    { id: 'UNTOUCHABLE', name: 'INTOCABLE', desc: 'Sector sin recibir daño', color: '#00f5d4' },
    { id: 'TREASURE', name: 'CAZATESOROS', desc: 'Todas las salas secretas', color: '#ffd700' },
    { id: 'PYRO', name: 'PIRÓMANO', desc: '+15 bajas con fuego', color: '#ff9e00' },
    { id: 'EXECUTIONER', name: 'VERDUGO', desc: '+8 ejecuciones de gloria', color: '#00b4d8' },
    { id: 'GIANTSLAYER', name: 'MATAGIGANTES', desc: '+3 jefes abatidos', color: '#d90429' },
    { id: 'IRONFIST', name: 'PUÑO DE HIERRO', desc: '+8 bajas a puñetazos/golpes', color: '#ffbe0b' },
    { id: 'UNSTOPPABLE', name: 'IMPARABLE', desc: 'Racha de 5 bajas', color: '#9d4edd' },
    { id: 'DEMOLISHER', name: 'DEMOLEDOR', desc: '+8 bajas por explosión', color: '#ff9e00' },
    { id: 'SURVIVOR', name: 'LEYENDA DEL INFIERNO', desc: 'Conquista los 10 sectores', color: '#70e000' }
  ],

  SECTOR_NAMES: [
    'HANGAR DE CONTENCIÓN', 'PLANTA NUCLEAR', 'REFINERÍA TÓXICA', 'CENTRO DE MANDO', 'LABORATORIOS UAC',
    'ANOMALÍA DE DEIMOS', 'FORTALEZA DE CARNE', 'TORRE DE BABEL', 'SANTUARIO PROFANO', 'EL ABISMO'
  ],

  // Estadísticas por especie (CERO drops de munición/vida en enemigos; Bosses mucho más duros y ágiles)
  ENEMIES: {
    IMP: {
      hp: 3.6,
      speed: 1.25,
      meleeDmg: 10,
      projDmg: 9,
      projSpeed: 6.4,
      painChance: 0.65,
      scale: 0.98,
      rangedCd: [1.8, 3.1],
      dashChance: 0.10
    },
    CACODEMON: {
      hp: 5.4,
      speed: 1.1,
      meleeDmg: 14,
      projDmg: 12,
      projSpeed: 7.2,
      painChance: 0.45,
      scale: 1.06,
      rangedCd: [2.0, 3.4],
      dashChance: 0.26
    },
    BRUTE: {
      hp: 8.2,
      speed: 1.0,
      meleeDmg: 18,
      projDmg: 15,
      projSpeed: 7.8,
      painChance: 0.28,
      scale: 1.2,
      rangedCd: [2.2, 3.6],
      dashChance: 0.42
    },
    SUMMONER: {
      hp: 8.5,
      speed: 1.35,
      meleeDmg: 10,
      projDmg: 8,
      projSpeed: 6.8,
      painChance: 0.4,
      scale: 1.05,
      rangedCd: [3.2, 5.0],
      dashChance: 0.08
    },
    LOST_SOUL: {
      hp: 1.15,
      speed: 2.15,
      meleeDmg: 11,
      projDmg: 0,
      projSpeed: 0,
      painChance: 0.9,
      scale: 0.68,
      rangedCd: [99, 99],
      dashChance: 0
    },
    SHIELD: {
      hp: 11,
      speed: 0.82,
      meleeDmg: 17,
      projDmg: 11,
      projSpeed: 6.2,
      painChance: 0.22,
      scale: 1.18,
      rangedCd: [2.8, 4.2],
      dashChance: 0.04
    },
    PINKY: {
      hp: 6.4,
      speed: 1.75,
      meleeDmg: 16,
      projDmg: 0,
      projSpeed: 0,
      painChance: 0.35,
      scale: 1.04,
      rangedCd: [99, 99],
      dashChance: 0.52
    },
    REVENANT: {
      hp: 7.4,
      speed: 1.15,
      meleeDmg: 13,
      projDmg: 12,
      projSpeed: 5.5,
      painChance: 0.34,
      scale: 1.12,
      rangedCd: [2.5, 3.8],
      dashChance: 0.16,
      homing: true
    },
    CHAMPION: {
      hp: 13.0, // Base en Sector 1 (escala progresivamente hasta el Sector 10)
      speed: 0.92,
      meleeDmg: 13,
      projDmg: 9,
      projSpeed: 5.6,
      painChance: 0.28,
      scale: 1.28,
      windupSec: 0.92,
      chargeSec: 0.58,
      recoverSec: 1.05,
      chargeSpeed: 4.8,
      dashSpeed: 5.8,
      dashSec: 0.22,
      dashCooldown: 4.2,
      stompRadius: 4.4,
      stompDamage: 16,
      stompCooldown: 8.5
    },
    BOSS: {
      hp: 17.0, // Base en Sector 1 (escala progresivamente hasta ~45 HP en Sector 10)
      speed: 0.98,
      meleeDmg: 15,
      projDmg: 10,
      projSpeed: 6.0,
      painChance: 0.22,
      scale: 1.38,
      windupSec: 0.9,
      chargeSec: 0.62,
      recoverSec: 1.0,
      chargeSpeed: 5.2,
      dashSpeed: 6.2,
      dashSec: 0.24,
      dashCooldown: 3.8,
      stompRadius: 4.8,
      stompDamage: 20,
      stompCooldown: 7.5
    }
  }
};

const {
  WIDTH,
  HEIGHT,
  VIEW_HEIGHT,
  HUD_HEIGHT,
  FOV_PLANE,
  WALL_SCALE,
  MAX_LEVELS,
  CLIP_SIZE,
  MAX_RESERVE,
  MAX_FUEL
} = CONFIG;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

// ============================================================================
// REPRODUCTOR GLOBAL DE DOOM.MP3 (Se conserva intacto y sincronizado)
// ============================================================================
class DoomMusicPlayer {
  constructor() {
    this.bgm = document.getElementById('doom-bgm') || new Audio('/doom.mp3');
    this.bgm.src = '/doom.mp3';
    this.bgm.loop = true;
    this.bgm.preload = 'auto';
    this.bgm.volume = 0.55;
    this.muted = false;
    this.toggleBtn = document.getElementById('music-toggle');
    this.setupListeners();
  }

  setupListeners() {
    const unlockAndPlay = () => {
      if (!this.muted && this.bgm.paused) {
        this.bgm.play().then(() => this.updateButton()).catch(() => {});
      }
    };
    window.addEventListener('pointerdown', unlockAndPlay, true);
    window.addEventListener('keydown', unlockAndPlay, true);
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.muted = !this.muted;
        this.bgm.muted = this.muted;
        if (!this.muted) this.bgm.play().catch(() => {});
        this.updateButton();
      });
    }
  }

  updateButton() {
    if (!this.toggleBtn) this.toggleBtn = document.getElementById('music-toggle');
    if (this.toggleBtn) this.toggleBtn.textContent = this.muted ? '🔇 BSO: OFF' : '🔊 BSO: ON';
  }

  ensurePlaying() {
    if (!this.muted && this.bgm.paused) this.bgm.play().catch(() => {});
  }
}

const globalDoomMusic = new DoomMusicPlayer();

// ============================================================================
// MOTOR DE SONIDO SINTETIZADO WEB AUDIO
// ============================================================================
class HellAudioEngine {
  constructor() {
    this.ctx = null;
    this.noiseBuffer = null;
    this.ambienceNodes = null;
  }

  isMuted() {
    return Boolean(globalDoomMusic && globalDoomMusic.muted);
  }

  init() {
    globalDoomMusic.ensurePlaying();
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      const sr = this.ctx.sampleRate;
      this.noiseBuffer = this.ctx.createBuffer(1, sr * 2, sr);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  startAmbience() {
    this.init();
    if (!this.ctx || this.ambienceNodes) return;
    const now = this.ctx.currentTime;
    const masterGain = this.ctx.createGain();
    masterGain.gain.setValueAtTime(this.isMuted() ? 0.0001 : 0.055, now);
    masterGain.connect(this.ctx.destination);

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(38.5, now);
    osc2.frequency.setValueAtTime(57.8, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(110, now);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(masterGain);
    osc1.start(now);
    osc2.start(now);
    this.ambienceNodes = { masterGain, osc1, osc2 };
  }

  setAmbiencePaused(paused) {
    if (!this.ctx || !this.ambienceNodes) return;
    const target = paused || this.isMuted() ? 0.0001 : 0.055;
    this.ambienceNodes.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
  }

  stopAmbience() {
    if (!this.ambienceNodes) return;
    try {
      this.ambienceNodes.osc1.stop();
      this.ambienceNodes.osc2.stop();
      this.ambienceNodes.masterGain.disconnect();
    } catch (_) {}
    this.ambienceNodes = null;
  }

  playTone(type, freqStart, freqEnd, duration, vol = 0.3, delay = 0) {
    if (this.isMuted()) return;
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(12, freqEnd), now + duration);
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playNoise(filterType, freq, duration, vol = 0.4, delay = 0) {
    if (this.isMuted()) return;
    this.init();
    if (!this.ctx || !this.noiseBuffer) return;
    const now = this.ctx.currentTime + delay;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.setValueAtTime(freq, now);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(now);
    src.stop(now + duration + 0.02);
  }

  playShotgun() {
    this.playTone('sawtooth', 165, 24, 0.26, 0.6);
    this.playNoise('lowpass', 2400, 0.28, 0.68);
    this.playNoise('bandpass', 1150, 0.05, 0.24, 0.18);
    this.playNoise('bandpass', 1650, 0.05, 0.26, 0.26);
  }

  playChaingun() {
    this.playTone('sawtooth', 195, 44, 0.085, 0.38);
    this.playNoise('bandpass', 1500, 0.075, 0.4);
  }

  playFlamethrower() {
    this.playNoise('bandpass', 420, 0.22, 0.36);
    this.playTone('sawtooth', 95, 48, 0.16, 0.14);
  }

  playChainsaw() {
    this.playNoise('bandpass', 620 + Math.random() * 260, 0.1, 0.22);
    this.playTone('sawtooth', 82, 58, 0.11, 0.16);
  }

  playGloryKill() {
    this.playTone('square', 180, 720, 0.16, 0.34);
    this.playNoise('bandpass', 1200, 0.22, 0.4);
    this.playTone('sawtooth', 90, 26, 0.3, 0.32, 0.08);
  }

  playGloryReady() {
    this.playTone('square', 740, 1180, 0.07, 0.15);
    this.playTone('square', 1180, 1480, 0.07, 0.12, 0.07);
  }

  playPunch(empowered = false) {
    this.playTone('triangle', empowered ? 190 : 125, 55, empowered ? 0.2 : 0.14, empowered ? 0.34 : 0.22);
    this.playNoise('lowpass', empowered ? 720 : 430, empowered ? 0.16 : 0.1, empowered ? 0.28 : 0.16);
    if (empowered) this.playTone('square', 90, 40, 0.24, 0.24, 0.02);
  }

  playKineticBurst() {
    this.playTone('sawtooth', 230, 45, 0.28, 0.36);
    this.playNoise('bandpass', 1500, 0.22, 0.3);
    this.playTone('square', 660, 220, 0.14, 0.18, 0.03);
  }

  playBossAwaken() {
    this.playTone('sawtooth', 52, 18, 0.85, 0.5);
    this.playTone('square', 104, 36, 0.75, 0.32, 0.08);
    this.playNoise('lowpass', 480, 0.7, 0.32);
  }

  playDash() {
    this.playNoise('bandpass', 1350, 0.18, 0.34);
    this.playTone('sawtooth', 260, 70, 0.18, 0.28);
  }

  playMelt(isDeath = false) {
    this.playNoise('lowpass', isDeath ? 420 : 680, 0.55, 0.32);
    this.playTone('sawtooth', isDeath ? 95 : 140, isDeath ? 24 : 42, 0.55, 0.28);
  }

  playPlayerDeath() {
    this.playTone('sawtooth', 165, 28, 0.75, 0.52);
    this.playTone('square', 110, 22, 0.82, 0.36, 0.08);
    this.playNoise('lowpass', 520, 0.7, 0.45);
  }

  playHitmarker() {
    this.playTone('square', 1280, 940, 0.035, 0.12);
  }

  playKillConfirm() {
    this.playTone('square', 620, 980, 0.07, 0.2);
    this.playNoise('bandpass', 2400, 0.06, 0.16, 0.01);
  }

  playShieldBlock() {
    this.playTone('square', 1600, 420, 0.06, 0.16);
    this.playNoise('highpass', 2800, 0.06, 0.14);
  }

  playSummon() {
    this.playTone('sawtooth', 58, 190, 0.5, 0.28);
    this.playTone('triangle', 116, 310, 0.46, 0.18, 0.06);
    this.playNoise('bandpass', 520, 0.45, 0.2);
  }

  playCombo(tier = 2) {
    const notes = tier >= 4 ? [392, 523.25, 659.25, 783.99] : (tier === 3 ? [349.23, 440, 587.33] : [293.66, 440]);
    notes.forEach((f, i) => this.playTone('square', f, f * 1.02, 0.14, 0.24, i * 0.055));
  }

  playUpgrade() {
    [261.63, 392, 523.25, 783.99].forEach((f, i) => this.playTone('triangle', f, f * 1.03, 0.22, 0.28, i * 0.07));
  }

  playToxicTick() {
    this.playNoise('lowpass', 380, 0.16, 0.14);
    this.playTone('triangle', 72, 48, 0.16, 0.12);
  }

  playExplosion() {
    this.playTone('sawtooth', 115, 16, 0.58, 0.72);
    this.playNoise('lowpass', 950, 0.62, 0.75);
  }

  playDemonFireball(dist = 6) {
    const vol = clamp((1 - dist / 22) * 0.26, 0.04, 0.28);
    this.playNoise('bandpass', 740, 0.22, vol);
    this.playTone('sine', 220, 90, 0.2, vol * 0.6);
  }

  playBossDash(dist = 6) {
    const vol = clamp((1 - dist / 22) * 0.35, 0.06, 0.36);
    this.playNoise('bandpass', 1100, 0.16, vol);
    this.playTone('triangle', 190, 55, 0.16, vol * 0.8);
  }

  playDoorSlide() {
    this.playTone('sawtooth', 62, 108, 0.36, 0.28);
    this.playNoise('lowpass', 320, 0.32, 0.18);
  }

  playSecretFound() {
    [293.66, 369.99, 440, 587.33].forEach((f, i) => {
      this.playTone('square', f, f * 1.02, 0.18, 0.26, i * 0.08);
    });
  }

  playChestOpen() {
    [330, 440, 554.37, 659.25].forEach((f, i) => {
      this.playTone('triangle', f, f * 1.05, 0.18, 0.3, i * 0.06);
    });
  }

  playKeyPickup() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playTone('square', f, f, 0.16, 0.26, i * 0.055);
    });
  }

  playBossChargeWarning() {
    this.playTone('sawtooth', 75, 310, 0.48, 0.42);
    this.playTone('square', 55, 155, 0.48, 0.3);
  }

  playMonsterGrowl(kind = 'IMP', dist = 6) {
    const vol = clamp((1 - dist / 22) * (kind.includes('BOSS') || kind.includes('TYRANT') || kind.includes('OVERLORD') || kind.includes('CHAMPION') ? 0.42 : 0.24), 0.04, 0.42);
    if (kind === 'IMP') {
      this.playTone('sawtooth', 140, 65, 0.32, vol);
      this.playNoise('bandpass', 900, 0.25, vol * 0.6);
    } else if (kind === 'CACODEMON') {
      this.playTone('triangle', 95, 42, 0.45, vol);
    } else if (kind === 'BRUTE') {
      this.playTone('sawtooth', 72, 32, 0.52, vol);
    } else {
      this.playTone('sawtooth', 52, 22, 0.68, vol);
      this.playTone('square', 104, 44, 0.6, vol * 0.5);
    }
  }

  playMonsterDeath(isBoss = false) {
    this.playTone('sawtooth', isBoss ? 92 : 150, 22, isBoss ? 0.75 : 0.42, 0.45);
    this.playNoise('bandpass', 580, 0.32, 0.42);
  }

  playEmptyClip() {
    this.playTone('square', 920, 310, 0.04, 0.2);
  }

  playReload() {
    this.playTone('triangle', 280, 540, 0.08, 0.24, 0);
    this.playTone('triangle', 480, 820, 0.09, 0.24, 0.09);
  }

  playHurt() {
    this.playTone('sawtooth', 140, 48, 0.2, 0.4);
  }

  playPickup() {
    this.playTone('square', 440, 660, 0.12, 0.22);
  }

  playSectorPortal() {
    this.playTone('sine', 180, 740, 0.38, 0.34);
  }

  playTallyTick() {
    this.playTone('square', 700, 680, 0.03, 0.16);
  }
}

// ============================================================================
// GENERADOR DE TEXTURAS HD (64x64) CON TEMÁTICA POR SECTOR
// ============================================================================
function makeTexture(type, theme = null) {
  const th = theme || CONFIG.SECTOR_THEMES[0];
  const texture = document.createElement('canvas');
  texture.width = texture.height = 64;
  const ctx = texture.getContext('2d', { alpha: false });
  const px = (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  };

  if (type === 6) {
    px(0, 0, 64, 64, '#140708');
    px(0, 0, 6, 64, '#1e2229');
    px(58, 0, 6, 64, '#1e2229');
    px(2, 0, 2, 64, '#ffbe0b');
    px(60, 0, 2, 64, '#ffbe0b');

    px(6, 8, 52, 48, '#2f3640');
    px(8, 10, 22, 44, '#3d4654');
    px(34, 10, 22, 44, '#3d4654');
    for (let y = 14; y <= 46; y += 8) {
      px(9, y, 20, 3, '#222730');
      px(9, y + 3, 20, 1, '#636e72');
      px(35, y, 20, 3, '#222730');
      px(35, y + 3, 20, 1, '#636e72');
    }
    px(0, 0, 64, 8, '#ffbe0b');
    px(0, 56, 64, 8, '#ffbe0b');
    for (let x = 0; x < 64; x += 8) {
      px(x, 0, 4, 8, '#140708');
      px(x, 56, 4, 8, '#140708');
    }
    px(30, 8, 4, 48, '#140708');
    px(20, 22, 24, 20, '#140708');
    px(22, 24, 20, 16, '#d90429');
    px(24, 26, 16, 12, th.vein || '#ff4d00');
    px(26, 28, 12, 8, th.glow || '#ffbe0b');
    px(29, 30, 6, 4, '#fff3b0');
    return texture;
  }

  if (type === 9) {
    px(0, 0, 64, 64, '#1c1f24');
    px(4, 0, 56, 64, '#2b303a');
    px(8, 4, 48, 56, '#383f4d');
    px(26, 0, 12, 64, '#140708');
    px(28, 0, 8, 64, th.glow || '#ffbe0b');
    for (let y = 0; y < 64; y += 8) {
      px(28, y, 8, 4, '#140708');
      px(12, y + 2, 4, 4, '#140708');
      px(12, y + 2, 2, 2, '#adb5bd');
      px(48, y + 2, 4, 4, '#140708');
      px(48, y + 2, 2, 2, '#adb5bd');
    }
    return texture;
  }

  if (type === 7) {
    px(0, 0, 64, 64, '#1a0c0e');
    for (let y = 0; y < 64; y += 16) {
      px(0, y, 64, 2, '#140708');
      const offset = ((y / 16) % 2) * 16;
      for (let x = offset; x < 64; x += 32) {
        px(x, y, 2, 16, '#140708');
        px(x + 2, y + 2, 28, 12, th.wall2 || '#5e1715');
        px(x + 4, y + 2, 24, 3, th.wall1 || '#822420');
      }
    }
    px(30, 4, 4, 56, '#140708');
    px(31, 8, 2, 48, th.glow || '#ffbe0b');
    px(24, 24, 16, 16, '#140708');
    px(26, 26, 12, 12, th.vein || '#ff4d00');
    px(28, 28, 3, 3, '#fff3b0');
    px(33, 28, 3, 3, '#fff3b0');
    return texture;
  }

  if (type === 4 || type === 5) {
    const isFinal = type === 5;
    px(0, 0, 64, 64, '#140708');
    px(4, 0, 56, 64, '#381818');
    for (let y = 0; y < 64; y += 8) {
      px(4, y, 4, 4, '#ff4d00');
      px(56, y, 4, 4, '#ff4d00');
    }
    px(14, 2, 36, 12, '#140708');
    px(16, 4, 32, 8, isFinal ? '#ffbe0b' : '#d90429');
    px(20, 6, 4, 4, '#fff3b0');
    px(30, 6, 4, 4, '#fff3b0');
    px(40, 6, 4, 4, '#fff3b0');

    px(10, 16, 44, 48, '#18242c');
    px(30, 16, 4, 48, '#140708');
    px(16, 22, 32, 36, isFinal ? '#ffbe0b' : '#00f5d4');
    px(22, 28, 20, 24, '#fff3b0');
    return texture;
  }

  if (type === 1) {
    px(0, 0, 64, 64, '#161114');
    px(2, 2, 60, 60, th.floor || '#332427');
    px(4, 4, 26, 26, th.wall1 || '#453136');
    px(34, 4, 26, 26, th.wall2 || '#3d2b2f');
    px(4, 34, 26, 26, th.wall2 || '#3d2b2f');
    px(34, 34, 26, 26, th.wall1 || '#453136');
    px(0, 31, 64, 3, '#140708');
    px(31, 0, 3, 64, '#140708');
    px(4, 4, 26, 2, 'rgba(255,255,255,0.16)');
    px(34, 34, 26, 2, 'rgba(255,255,255,0.16)');
    for (const [rx, ry] of [[6, 6], [26, 6], [36, 6], [56, 6], [6, 56], [26, 56], [36, 56], [56, 56]]) {
      px(rx, ry, 3, 3, '#140708');
      px(rx, ry, 2, 2, th.glow || '#ff9e00');
    }
    px(12, 12, 3, 15, th.vein || '#ff4d00');
    px(13, 14, 1, 11, th.glow || '#fff3b0');
    px(44, 38, 3, 14, th.vein || '#ff4d00');
    px(45, 40, 1, 10, th.glow || '#ffbe0b');
  } else if (type === 2) {
    px(0, 0, 64, 64, '#140708');
    for (let y = 0; y < 64; y += 16) {
      px(0, y, 64, 2, '#140708');
      const offset = ((y / 16) % 2) * 16;
      for (let x = -16 + offset; x < 64; x += 32) {
        const bx = Math.max(0, x);
        const bw = Math.min(64 - bx, x + 30 - bx);
        if (bw > 0) {
          px(bx, y + 2, bw, 12, th.wall2 || '#5e1715');
          px(bx, y + 2, bw, 3, th.wall1 || '#852420');
          px(bx, y + 11, bw, 3, 'rgba(0,0,0,0.35)');
        }
        if (x >= 0 && x < 64) px(x, y, 2, 16, '#140708');
      }
    }
    px(8, 16, 14, 3, th.vein || '#ff4d00');
    px(10, 16, 8, 1, th.glow || '#fff3b0');
    px(36, 32, 16, 3, th.vein || '#ff4d00');
    px(39, 32, 9, 1, th.glow || '#ffbe0b');
  } else if (type === 3) {
    px(0, 0, 64, 64, '#1a0e10');
    px(4, 4, 56, 56, th.wall1 || '#331f22');
    px(10, 10, 44, 44, '#140708');
    px(12, 12, 40, 40, th.wall2 || '#d90429');
    px(15, 18, 34, 32, th.vein || '#ff4d00');
    px(19, 24, 26, 24, th.glow || '#ffbe0b');
    px(24, 30, 16, 15, '#fff3b0');
    for (let x = 16; x <= 48; x += 8) {
      px(x, 10, 4, 44, '#140708');
      px(x + 1, 10, 1, 44, '#594145');
    }
  } else {
    px(0, 0, 64, 64, '#140708');
    px(2, 2, 60, 60, th.wall1 || '#361619');
    const drawSkull = (sx, sy) => {
      px(sx, sy, 16, 15, '#140708');
      px(sx + 2, sy + 2, 12, 9, '#d8c5b8');
      px(sx + 4, sy + 2, 8, 3, '#fff3b0');
      px(sx + 3, sy + 5, 3, 3, th.vein || '#d90429');
      px(sx + 10, sy + 5, 3, 3, th.vein || '#d90429');
      px(sx + 4, sy + 11, 8, 4, '#a89284');
      px(sx + 6, sy + 12, 1, 3, '#140708');
      px(sx + 9, sy + 12, 1, 3, '#140708');
    };
    drawSkull(6, 6);
    drawSkull(26, 8);
    drawSkull(44, 6);
    drawSkull(14, 28);
    drawSkull(36, 28);
    px(4, 54, 56, 3, th.vein || '#ff4d00');
    px(8, 55, 48, 1, th.glow || '#ffbe0b');
  }

  // Micro-detalle de relieve y grano retro determinista para texturas HD
  const img = ctx.getImageData(0, 0, 64, 64);
  const d = img.data;
  for (let y = 0; y < 64; y++) {
    const edgeShade = y < 3 ? 0.72 : (y > 60 ? 0.68 : 1);
    for (let x = 0; x < 64; x++) {
      const i = (y * 64 + x) * 4;
      const hash = ((x * 37 + y * 59 + type * 17) ^ (x * y)) & 15;
      const grain = (hash - 7.5) * 1.6;
      d[i] = clamp(d[i] * edgeShade + grain, 0, 255);
      d[i + 1] = clamp(d[i + 1] * edgeShade + grain * 0.8, 0, 255);
      d[i + 2] = clamp(d[i + 2] * edgeShade + grain * 0.8, 0, 255);
    }
  }
  ctx.putImageData(img, 0, 0);

  return texture;
}

function makeFloorTexture(theme = null) {
  const th = theme || CONFIG.SECTOR_THEMES[0];
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d', { alpha: false });
  const px = (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  };
  px(0, 0, 64, 64, '#11090c');
  px(2, 2, 28, 28, th.floor || '#2b1619');
  px(34, 34, 28, 28, th.floor || '#2b1619');
  px(34, 2, 28, 28, th.wall1 || '#231114');
  px(2, 34, 28, 28, th.wall1 || '#231114');
  // Biseles de las losas de basalto y remaches metálicos
  px(2, 2, 28, 1, 'rgba(255,255,255,0.14)');
  px(34, 34, 28, 1, 'rgba(255,255,255,0.14)');
  px(34, 2, 28, 1, 'rgba(255,255,255,0.1)');
  px(2, 34, 28, 1, 'rgba(255,255,255,0.1)');
  for (const [rx, ry] of [[5, 5], [25, 5], [5, 25], [25, 25], [37, 37], [57, 37], [37, 57], [57, 57]]) {
    px(rx, ry, 2, 2, '#140708');
    px(rx, ry, 1, 1, '#adb5bd');
  }
  px(0, 30, 64, 4, '#140708');
  px(30, 0, 4, 64, '#140708');
  px(0, 31, 64, 2, th.vein || '#ff4d00');
  px(31, 0, 2, 64, th.vein || '#ff4d00');
  px(8, 31, 16, 1, th.glow || '#ffbe0b');
  px(40, 32, 16, 1, '#fff3b0');
  px(31, 10, 1, 16, th.glow || '#ffbe0b');
  return canvas;
}

function makeCeilingTexture(theme = null) {
  const th = theme || CONFIG.SECTOR_THEMES[0];
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext('2d', { alpha: false });
  const px = (x, y, w, h, col) => {
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, h);
  };
  px(0, 0, 64, 64, th.ceil || '#4a080a');
  px(4, 4, 24, 24, th.wall2 || '#b80c09');
  px(36, 36, 24, 24, th.wall2 || '#b80c09');
  px(36, 4, 24, 24, th.wall1 || '#9e0b09');
  px(4, 36, 24, 24, th.wall1 || '#9e0b09');
  px(7, 7, 18, 18, th.vein || '#ff4d00');
  px(39, 39, 18, 18, th.vein || '#ff4d00');
  px(11, 11, 10, 10, th.glow || '#ffbe0b');
  px(43, 43, 10, 10, '#fff3b0');
  px(0, 0, 64, 4, '#140708');
  px(0, 28, 64, 8, '#140708');
  px(0, 60, 64, 4, '#140708');
  px(0, 0, 4, 64, '#140708');
  px(28, 0, 8, 64, '#140708');
  px(60, 0, 4, 64, '#140708');
  return canvas;
}

function makeBarrelSprite(frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 26;
  canvas.height = 38;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  const pulse = frame % 2 === 0;
  px(3, 6, 20, 30, '#140708');
  px(4, 7, 18, 28, '#2d3a2e');
  px(6, 7, 6, 28, '#465947');
  px(3, 12, 20, 3, '#ffbe0b');
  px(3, 25, 20, 3, '#ffbe0b');
  // Símbolo radiactivo/explosivo y burbujeo ácido superior
  px(9, 16, 8, 8, '#140708');
  px(10, 17, 6, 6, pulse ? '#70e000' : '#ccff33');
  px(5, 4, 16, 4, '#140708');
  px(6, 4, 14, 3, pulse ? '#70e000' : '#38b000');
  px(pulse ? 8 : 13, 2, 4, 3, '#ccff33');
  return canvas;
}

// ============================================================================
// MODELOS PIXEL-ART CONVINCENTES DE ALTA DENSIDAD (COFRES, ÍTEMS Y DEMONIOS)
// ============================================================================
function makeFirePillarSprite(frame) {
  const canvas = document.createElement('canvas');
  canvas.width = 28;
  canvas.height = 48;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  px(6, 32, 16, 16, '#140708');
  px(8, 33, 12, 12, '#362124');
  px(10, 33, 5, 12, '#523438');
  px(4, 44, 20, 4, '#241517');
  px(5, 29, 18, 4, '#4a2c30');
  px(7, 28, 14, 2, '#ff4d00');

  const shift = frame === 0 ? -1 : (frame === 1 ? 1 : 0);
  const tall = frame === 1 ? 3 : 0;
  px(5 + shift, 8 - tall, 18, 21 + tall, '#d90429');
  px(7, 11 - tall, 14, 17 + tall, '#ff4d00');
  px(9 + shift, 6 - tall, 10, 20, '#ffbe0b');
  px(11, 14, 6, 11, '#fff3b0');
  return canvas;
}

function makeChestSprite(isOpen = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 36;
  canvas.height = 30;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  if (!isOpen) {
    px(1, 6, 34, 23, 'rgba(255, 190, 11, 0.25)');
    px(2, 5, 32, 23, '#140708');
    px(4, 6, 28, 7, '#6c3c20');
    px(6, 5, 24, 3, '#9c5a32');
    px(3, 14, 30, 13, '#4a2511');
    px(5, 15, 26, 9, '#633418');
    px(3, 12, 30, 3, '#140708');
    px(4, 6, 4, 21, '#adb5bd');
    px(28, 6, 4, 21, '#adb5bd');
    px(5, 6, 2, 21, '#ffffff');
    px(29, 6, 2, 21, '#ffffff');
    px(14, 10, 8, 9, '#140708');
    px(15, 11, 6, 7, '#ffbe0b');
    px(17, 13, 2, 3, '#d90429');
  } else {
    px(2, 2, 32, 26, '#140708');
    px(3, 3, 30, 7, '#3d1e10');
    px(4, 4, 28, 3, '#ffbe0b');
    px(4, 10, 28, 6, '#00f5d4');
    px(7, 9, 6, 6, '#d90429');
    px(15, 8, 6, 7, '#fff3b0');
    px(23, 9, 6, 6, '#70e000');
    px(3, 15, 30, 12, '#4a2511');
    px(4, 15, 4, 12, '#adb5bd');
    px(28, 15, 4, 12, '#adb5bd');
    px(15, 16, 6, 5, '#ffbe0b');
  }
  return canvas;
}

function makeCoinSprite(frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 18;
  canvas.height = 18;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  const bob = frame % 2 === 0 ? 0 : -1;
  px(3, 3 + bob, 12, 12, '#140708');
  px(4, 4 + bob, 10, 10, '#ffbe0b');
  px(5, 5 + bob, 8, 3, '#fff3b0');
  px(6, 8 + bob, 6, 4, '#d9a400');
  px(7, 7 + bob, 2, 6, '#fff3b0');
  px(11, 6 + bob, 1, 2, '#ffffff');
  return canvas;
}

function makeMerchantSprite(frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 38;
  canvas.height = 46;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  const bob = frame % 2 === 0 ? 0 : -1;
  // Mostrador
  px(2, 37, 34, 8, '#140708');
  px(4, 37, 30, 5, '#4a2511');
  px(6, 38, 26, 2, '#9c5a32');
  px(7, 33, 5, 5, '#ffbe0b');
  px(26, 33, 5, 5, '#d9a400');
  // Túnica y capucha
  px(11, 13 + bob, 16, 24, '#140708');
  px(12, 14 + bob, 14, 22, '#5a1010');
  px(15, 17 + bob, 8, 18, '#8a1c1c');
  px(13, 30 + bob, 12, 4, '#3d0a0a');
  px(8, 9 + bob, 22, 14, '#140708');
  px(10, 10 + bob, 18, 11, '#6b1414');
  px(12, 12 + bob, 14, 8, '#140708');
  px(13, 14 + bob, 4, 3, '#ffbe0b');
  px(21, 14 + bob, 4, 3, '#ffbe0b');
  px(15, 19 + bob, 8, 2, '#c9a227');
  // Brazos y bastón
  px(6, 20 + bob, 6, 14, '#140708');
  px(7, 21 + bob, 4, 12, '#5a1010');
  px(26, 20 + bob, 6, 14, '#140708');
  px(27, 21 + bob, 4, 12, '#5a1010');
  px(31, 6, 3, 34, '#140708');
  px(32, 7, 1, 32, '#c9a227');
  px(29, 4, 7, 5, '#140708');
  px(30, 5, 5, 3, '#ff4d00');
  px(31, 6, 3, 1, '#ffbe0b');
  return canvas;
}

function makeKeySprite(frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 26;
  canvas.height = 30;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  const bob = frame % 2 === 0 ? 0 : -2;
  px(2, 0 + bob, 22, 28, 'rgba(255, 215, 0, 0.42)');
  px(6, 2 + bob, 14, 12, '#140708');
  px(7, 3 + bob, 12, 10, '#ffbe0b');
  px(8, 3 + bob, 10, 3, '#fff3b0');
  px(9, 6 + bob, 3, 3, '#d90429');
  px(14, 6 + bob, 3, 3, '#d90429');
  px(10, 14 + bob, 6, 13, '#140708');
  px(11, 13 + bob, 4, 13, '#ffbe0b');
  px(15, 18 + bob, 5, 2, '#fff3b0');
  px(15, 22 + bob, 6, 3, '#fff3b0');
  return canvas;
}

function makeAmmoSprite(frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 26;
  canvas.height = 26;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  px(0, 2, 26, 23, frame === 0 ? 'rgba(255, 190, 11, 0.35)' : 'rgba(255, 77, 0, 0.45)');
  px(2, 9, 22, 15, '#140708');
  px(3, 10, 20, 13, '#2d4726');
  px(4, 11, 18, 3, '#4f7844');
  for (let x = 4; x <= 19; x += 5) {
    px(x - 1, 1, 5, 9, '#140708');
    px(x, 4, 3, 6, '#d90429');
    px(x, 2, 3, 2, '#ffbe0b');
    px(x + 1, 2, 1, 7, '#fff3b0');
  }
  px(5, 15, 16, 5, '#ffbe0b');
  px(7, 17, 12, 2, '#140708');
  return canvas;
}

function makeMedkitSprite(frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 24;
  canvas.height = 24;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  px(0, 2, 24, 20, frame === 0 ? 'rgba(255, 243, 176, 0.3)' : 'rgba(217, 4, 41, 0.38)');
  px(2, 4, 20, 16, '#140708');
  px(3, 5, 18, 14, '#d8d2c5');
  px(4, 6, 16, 3, '#ffffff');
  px(8, 2, 8, 2, '#6c757d');
  px(10, 7, 4, 10, '#d90429');
  px(7, 10, 10, 4, '#d90429');
  return canvas;
}

function makeArmorSprite(frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 26;
  canvas.height = 26;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  const bob = frame === 0 ? 0 : -1;
  px(2, 2 + bob, 22, 21, '#140708');
  px(3, 3 + bob, 20, 7, '#38b000');
  px(6, 10 + bob, 14, 12, '#2b8a00');
  px(8, 4 + bob, 10, 14, '#70e000');
  px(10, 6 + bob, 6, 6, '#ccff33');
  return canvas;
}

function makeSoulsphereSprite(frame = 0) {
  const canvas = document.createElement('canvas');
  canvas.width = 26;
  canvas.height = 26;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  const bob = frame === 0 ? 0 : -2;
  px(2, 2 + bob, 22, 22, 'rgba(0, 245, 212, 0.38)');
  px(4, 4 + bob, 18, 18, '#140708');
  px(5, 5 + bob, 16, 16, '#0077b6');
  px(7, 7 + bob, 12, 12, '#00f5d4');
  px(9, 10 + bob, 3, 3, '#fff3b0');
  px(14, 10 + bob, 3, 3, '#fff3b0');
  px(9, 15 + bob, 8, 2, '#140708');
  return canvas;
}

function makeDemonOrbSprite(outer, inner) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 18;
  const c = canvas.getContext('2d');
  c.fillStyle = '#140708';
  c.fillRect(1, 1, 16, 16);
  c.fillStyle = outer;
  c.fillRect(2, 2, 14, 14);
  c.fillStyle = inner;
  c.fillRect(5, 5, 8, 8);
  c.fillStyle = '#fff3b0';
  c.fillRect(7, 7, 4, 4);
  return canvas;
}

// ============================================================================
// DEMONIOS HD (48x64) CON ANATOMÍA, VOLUMEN MUSCULAR Y SILUETA RECONOCIBLE
// ============================================================================
function makeWalkFrame(kind, stepIndex, isCharging = false, isPain = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 64;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };

  const leftLegY = stepIndex === 1 ? -5 : (stepIndex === 3 ? 3 : 0);
  const rightLegY = stepIndex === 3 ? -5 : (stepIndex === 1 ? 3 : 0);
  const leftLegX = stepIndex === 1 ? -3 : (stepIndex === 3 ? 2 : 0);
  const rightLegX = stepIndex === 3 ? 3 : (stepIndex === 1 ? -2 : 0);
  const torsoBob = isPain ? 3 : (stepIndex % 2 === 1 ? -2 : 0);
  const leftArmY = isPain ? -6 : (stepIndex === 1 ? -4 : (stepIndex === 3 ? 4 : 0));
  const rightArmY = isPain ? -6 : (stepIndex === 3 ? -4 : (stepIndex === 1 ? 4 : 0));

  if (kind === 'CACODEMON') {
    const floatY = stepIndex === 0 ? 0 : (stepIndex === 1 ? -4 : (stepIndex === 2 ? -1 : 3));
    px(8, 8 + floatY, 32, 36, '#140708');
    px(5, 13 + floatY, 38, 26, '#140708');
    px(7, 10 + floatY, 34, 32, '#590d22');
    px(6, 14 + floatY, 36, 24, isPain ? '#ff4d00' : '#a31621');
    px(9, 11 + floatY, 30, 18, '#d90429');
    px(13, 12 + floatY, 20, 8, '#ff4d00');

    for (const [hx, hy] of [[7, 5], [14, 3], [22, 2], [30, 3], [37, 5]]) {
      px(hx, hy + floatY, 5, 6, '#140708');
      px(hx + 1, hy + 1 + floatY, 3, 4, '#d8c5b8');
      px(hx + 1, hy + 1 + floatY, 2, 2, '#fff3b0');
    }

    px(16, 14 + floatY, 16, 11, '#140708');
    px(17, 15 + floatY, 14, 9, '#2b8a00');
    px(19, 16 + floatY, 10, 7, '#70e000');
    px(23, 16 + floatY, 2, 7, '#140708');
    px(20, 16 + floatY, 3, 3, '#fff3b0');

    const jawOpen = isCharging || isPain ? 6 : (stepIndex % 2 === 1 ? 4 : 1);
    px(9, 27 + floatY, 30, 10 + jawOpen, '#140708');
    px(11, 29 + floatY, 26, 6 + jawOpen, isCharging ? '#00f5d4' : '#ff4d00');
    px(15, 31 + floatY, 18, 3 + jawOpen, '#fff3b0');
    for (let x = 11; x < 36; x += 4) {
      px(x, 27 + floatY, 3, 3, '#fff3b0');
      px(x, 34 + floatY + jawOpen, 3, 3, '#fff3b0');
    }

    px(12 + leftLegX, 43 + floatY, 5, 11, '#140708');
    px(13 + leftLegX, 43 + floatY, 3, 9, '#590d22');
    px(22, 44 + floatY, 5, 13, '#140708');
    px(23, 44 + floatY, 3, 11, '#590d22');
    px(31 + rightLegX, 43 + floatY, 5, 11, '#140708');
    px(32 + rightLegX, 43 + floatY, 3, 9, '#590d22');
    return canvas;
  }

  if (kind === 'IMP') {
    const leanX = isPain ? 2 : (stepIndex === 1 ? -1 : (stepIndex === 3 ? 1 : 0));
    px(15 + leanX, 6 + torsoBob, 18, 14, '#140708');
    px(16 + leanX, 7 + torsoBob, 16, 12, '#5c341c');
    px(18 + leanX, 8 + torsoBob, 12, 6, '#8a4f2b');
    px(13 + leanX, 2 + torsoBob, 4, 6, '#fff3b0');
    px(31 + leanX, 2 + torsoBob, 4, 6, '#fff3b0');
    px(5 + leanX, 14 + torsoBob, 5, 6, '#fff3b0');
    px(38 + leanX, 14 + torsoBob, 5, 6, '#fff3b0');
    px(17 + leanX, 11 + torsoBob, 5, 3, '#ffbe0b');
    px(26 + leanX, 11 + torsoBob, 5, 3, '#ffbe0b');
    px(18 + leanX, 12 + torsoBob, 2, 1, '#fff3b0');
    px(27 + leanX, 12 + torsoBob, 2, 1, '#fff3b0');
    px(19 + leanX, 16 + torsoBob, 10, 3, '#140708');
    px(20 + leanX, 16 + torsoBob, 2, 2, '#fff3b0');
    px(26 + leanX, 16 + torsoBob, 2, 2, '#fff3b0');

    px(10 + leanX, 19 + torsoBob, 28, 22, '#140708');
    px(11 + leanX, 20 + torsoBob, 26, 20, isPain ? '#d90429' : '#6e3f23');
    px(13 + leanX, 21 + torsoBob, 10, 7, '#9c5a32');
    px(25 + leanX, 21 + torsoBob, 10, 7, '#9c5a32');
    px(15 + leanX, 30 + torsoBob, 7, 3, '#9c5a32');
    px(26 + leanX, 30 + torsoBob, 7, 3, '#9c5a32');
    px(16 + leanX, 35 + torsoBob, 6, 3, '#9c5a32');
    px(26 + leanX, 35 + torsoBob, 6, 3, '#9c5a32');

    px(3 + leanX, 19 + leftArmY, 8, 18, '#140708');
    px(37 + leanX, 19 + rightArmY, 8, 18, '#140708');
    px(4 + leanX, 20 + leftArmY, 6, 16, '#8a4f2b');
    px(38 + leanX, 20 + rightArmY, 6, 16, '#8a4f2b');
    px(1 + leanX, 33 + leftArmY, 10, 10, '#d90429');
    px(37 + leanX, 33 + rightArmY, 10, 10, '#d90429');
    px(3 + leanX, 35 + leftArmY, 6, 6, '#ffbe0b');
    px(39 + leanX, 35 + rightArmY, 6, 6, '#ffbe0b');
    px(4 + leanX, 36 + leftArmY, 4, 4, '#fff3b0');
    px(40 + leanX, 36 + rightArmY, 4, 4, '#fff3b0');

    px(11 + leftLegX, 40 + leftLegY, 10, 21 - leftLegY, '#140708');
    px(27 + rightLegX, 40 + rightLegY, 10, 21 - rightLegY, '#140708');
    px(12 + leftLegX, 41 + leftLegY, 8, 18 - leftLegY, '#5c341c');
    px(28 + rightLegX, 41 + rightLegY, 8, 18 - rightLegY, '#5c341c');
    px(14 + leftLegX, 42 + leftLegY, 4, 12, '#8a4f2b');
    px(30 + rightLegX, 42 + rightLegY, 4, 12, '#8a4f2b');
    return canvas;
  }

  if (kind === 'LOST_SOUL') {
    const bob = stepIndex % 2 === 0 ? 0 : -3;
    const flick = stepIndex === 1 ? -2 : (stepIndex === 3 ? 2 : 0);
    px(7, 8 + bob + flick, 34, 34, '#d90429');
    px(9, 4 + bob + flick, 30, 28, '#ff4d00');
    px(12, 0 + bob + flick, 24, 24, '#ffbe0b');
    px(15, -3 + bob + flick, 18, 20, '#fff3b0');

    px(10, 16 + bob, 28, 25, '#140708');
    px(12, 18 + bob, 24, 19, '#e0d6c2');
    px(14, 20 + bob, 20, 8, '#b8ab95');
    px(15, 24 + bob, 7, 7, '#140708');
    px(26, 24 + bob, 7, 7, '#140708');
    px(17, 25 + bob, 2, 2, '#ff4d00');
    px(28, 25 + bob, 2, 2, '#ff4d00');
    px(22, 31 + bob, 4, 4, '#140708');
    px(14, 37 + bob, 20, 8, '#140708');
    px(15, 38 + bob, 18, 5, '#e0d6c2');
    for (let tx = 16; tx <= 31; tx += 3) px(tx, 38 + bob, 2, 5, '#140708');

    px(6, 10 + bob, 6, 9, '#140708');
    px(7, 11 + bob, 4, 7, '#e0d6c2');
    px(36, 10 + bob, 6, 9, '#140708');
    px(37, 11 + bob, 4, 7, '#e0d6c2');

    px(13, 45 + bob + flick, 22, 11, '#d90429');
    px(16, 44 + bob + flick, 16, 12, '#ff4d00');
    px(19, 48 + bob + flick, 10, 9, '#ffbe0b');
    return canvas;
  }

  if (kind === 'SUMMONER') {
    const bob = stepIndex % 2 === 0 ? 0 : -2;
    const hem = stepIndex === 1 ? -2 : (stepIndex === 3 ? 2 : 0);
    px(5, 8 + bob, 38, 54, 'rgba(112, 224, 0, 0.13)');

    px(12, 18 + bob, 24, 37, '#140708');
    px(14, 20 + bob, 20, 33, '#2d1b4e');
    px(17, 24 + bob, 14, 25, '#4b2d7a');
    px(19, 27 + bob, 10, 17, '#6a3fa0');
    px(16, 17 + bob, 16, 10, '#140708');
    px(18, 19 + bob, 12, 7, '#3b2360');
    px(19, 21 + bob, 3, 3, '#70e000');
    px(26, 21 + bob, 3, 3, '#70e000');
    px(22, 24 + bob, 4, 2, '#140708');

    px(9, 30 + bob, 8, 9, '#140708');
    px(10, 31 + bob, 6, 7, '#70e000');
    px(12, 32 + bob, 2, 4, '#ccff33');

    px(36, 8 + bob, 3, 48, '#140708');
    px(37, 10 + bob, 1, 44, '#9c6644');
    px(33, 4 + bob, 10, 10, '#140708');
    px(34, 5 + bob, 8, 8, '#70e000');
    px(36, 7 + bob, 4, 4, '#ccff33');

    px(10, 50 + bob + hem, 28, 7, '#140708');
    px(12, 51 + bob + hem, 24, 5, '#2d1b4e');
    px(17, 52 + bob + hem, 14, 3, '#4b2d7a');
    return canvas;
  }

  if (kind === 'SHIELD') {
    const bob = stepIndex % 2 === 0 ? 0 : -1;
    px(12, 38 + bob, 10, 24, '#140708');
    px(13, 39 + bob, 8, 22, '#343a40');
    px(27, 38 + bob, 10, 24, '#140708');
    px(28, 39 + bob, 8, 22, '#343a40');

    px(9, 15 + bob, 30, 28, '#140708');
    px(11, 17 + bob, 26, 24, '#495057');
    px(14, 19 + bob, 20, 12, '#6c757d');
    px(16, 21 + bob, 16, 8, '#adb5bd');

    px(16, 4 + bob, 16, 14, '#140708');
    px(17, 5 + bob, 14, 12, '#495057');
    px(19, 8 + bob, 4, 4, '#ff4d00');
    px(26, 8 + bob, 4, 4, '#ff4d00');
    px(21, 14 + bob, 7, 2, '#140708');

    px(7, 17 + bob, 36, 35, '#140708');
    px(9, 19 + bob, 32, 31, '#5c636a');
    px(12, 22 + bob, 26, 25, '#7a828a');
    px(15, 25 + bob, 20, 19, '#495057');
    px(22, 27 + bob, 6, 12, '#00b4d8');
    px(24, 29 + bob, 2, 8, '#caf0f8');
    px(11, 22 + bob, 2, 2, '#adb5bd');
    px(35, 22 + bob, 2, 2, '#adb5bd');
    px(11, 47 + bob, 2, 2, '#adb5bd');
    px(35, 47 + bob, 2, 2, '#adb5bd');
    return canvas;
  }

  if (kind === 'PINKY') {
    const bob = stepIndex % 2 === 0 ? 0 : -3;
    const jaw = isCharging || isPain ? 5 : 2;
    // Cuerpo musculoso cuadrúpedo carmesí/rosado con joroba blindada
    px(6, 16 + bob, 36, 28, '#140708');
    px(8, 18 + bob, 32, 24, isPain ? '#ff4d00' : '#b5174b');
    px(11, 14 + bob, 26, 12, '#e05780');
    // Cuernos frontales hacia delante
    px(4, 18 + bob, 7, 6, '#fff3b0');
    px(37, 18 + bob, 7, 6, '#fff3b0');
    // Ojos amarillos furiosos y enormes fauces dentadas
    px(13, 21 + bob, 5, 3, '#ffbe0b');
    px(30, 21 + bob, 5, 3, '#ffbe0b');
    px(11, 26 + bob, 26, 10 + jaw, '#140708');
    px(13, 28 + bob, 22, 6 + jaw, '#590d22');
    for (let tx = 13; tx <= 33; tx += 4) {
      px(tx, 26 + bob, 2, 3, '#fff3b0');
      px(tx, 33 + bob + jaw, 2, 3, '#fff3b0');
    }
    // Patas traseras potentes
    px(8 + leftLegX, 42 + leftLegY, 12, 20 - leftLegY, '#140708');
    px(28 + rightLegX, 42 + rightLegY, 12, 20 - rightLegY, '#140708');
    px(9 + leftLegX, 43 + leftLegY, 10, 17 - leftLegY, '#8a1238');
    px(29 + rightLegX, 43 + rightLegY, 10, 17 - rightLegY, '#8a1238');
    return canvas;
  }

  if (kind === 'REVENANT') {
    const bob = stepIndex % 2 === 0 ? 0 : -2;
    // Cañones lanzamisiles en los hombros
    px(4, 5 + bob, 11, 14, '#140708');
    px(33, 5 + bob, 11, 14, '#140708');
    px(5, 6 + bob, 9, 12, '#495057');
    px(34, 6 + bob, 9, 12, '#495057');
    px(7, 8 + bob, 5, 5, isCharging ? '#ffbe0b' : '#d90429');
    px(36, 8 + bob, 5, 5, isCharging ? '#ffbe0b' : '#d90429');
    // Cráneo cibernético
    px(16, 4 + bob, 16, 14, '#140708');
    px(17, 5 + bob, 14, 12, '#e0d6c2');
    px(19, 9 + bob, 4, 3, '#ff4d00');
    px(25, 9 + bob, 4, 3, '#ff4d00');
    px(20, 14 + bob, 8, 2, '#140708');
    // Peto metálico ensangrentado y costillas
    px(11, 17 + bob, 26, 22, '#140708');
    px(13, 18 + bob, 22, 13, isPain ? '#ff4d00' : '#6c757d');
    px(15, 20 + bob, 18, 6, '#adb5bd');
    px(15, 31 + bob, 18, 8, '#780000');
    for (let ry = 32; ry <= 37; ry += 3) px(17, ry + bob, 14, 1, '#e0d6c2');
    // Brazos y piernas óseas
    px(5, 19 + leftArmY, 6, 19, '#d8c5b8');
    px(37, 19 + rightArmY, 6, 19, '#d8c5b8');
    px(13 + leftLegX, 39 + leftLegY, 8, 23 - leftLegY, '#140708');
    px(27 + rightLegX, 39 + rightLegY, 8, 23 - rightLegY, '#140708');
    px(15 + leftLegX, 40 + leftLegY, 4, 21 - leftLegY, '#e0d6c2');
    px(29 + rightLegX, 40 + rightLegY, 4, 21 - rightLegY, '#e0d6c2');
    return canvas;
  }

  const palettes = {
    BARON: { horns: '#fff3b0', hooves: '#29362a', dark: '#4a151b', mid: '#7a2832', light: '#b03e4c', eyes: '#70e000', claws: '#70e000' },
    BOSS_CYBER: { horns: '#ffbe0b', hooves: '#495057', dark: '#590d22', mid: '#a31621', light: '#e63946', eyes: '#ffbe0b', claws: '#ff4d00' },
    BOSS_ABYSS: { horns: '#00f5d4', hooves: '#10002b', dark: '#240046', mid: '#5a189a', light: '#9d4edd', eyes: '#ffbe0b', claws: '#ff0055' }
  };
  const p = palettes[kind] || palettes.BARON;

  if (isCharging) px(1, 1, 46, 62, 'rgba(255, 190, 11, 0.36)');

  px(6, 2 + torsoBob, 9, 11, '#140708');
  px(33, 2 + torsoBob, 9, 11, '#140708');
  px(7, 3 + torsoBob, 7, 9, p.horns);
  px(34, 3 + torsoBob, 7, 9, p.horns);

  px(14, 5 + torsoBob, 20, 14, '#140708');
  px(15, 6 + torsoBob, 18, 12, p.dark);
  px(17, 7 + torsoBob, 14, 6, p.mid);
  px(16, 10 + torsoBob, 6, 3, isCharging ? '#fff3b0' : p.eyes);
  px(26, 10 + torsoBob, 6, 3, isCharging ? '#fff3b0' : p.eyes);

  px(6, 17 + torsoBob, 36, 25, '#140708');
  px(8, 18 + torsoBob, 32, 23, isPain ? '#ff4d00' : (isCharging ? '#ff9e00' : p.dark));
  px(10, 19 + torsoBob, 13, 10, p.mid);
  px(25, 19 + torsoBob, 13, 10, p.mid);
  px(12, 20 + torsoBob, 9, 5, p.light);
  px(27, 20 + torsoBob, 9, 5, p.light);
  px(18, 25 + torsoBob, 12, 9, '#140708');
  px(20, 27 + torsoBob, 8, 5, p.claws);
  px(22, 28 + torsoBob, 4, 3, '#fff3b0');

  px(1, 18 + leftArmY, 9, 22, '#140708');
  px(38, 18 + rightArmY, 9, 22, '#140708');
  px(2, 19 + leftArmY, 7, 19, p.mid);
  px(39, 19 + rightArmY, 7, 19, kind === 'BOSS_CYBER' ? '#adb5bd' : p.mid);
  px(1, 35 + leftArmY, 9, 8, p.claws);
  px(38, 35 + rightArmY, 9, 8, p.claws);
  px(3, 37 + leftArmY, 5, 4, '#fff3b0');
  px(40, 37 + rightArmY, 5, 4, '#fff3b0');

  px(9 + leftLegX, 41 + leftLegY, 13, 21 - leftLegY, '#140708');
  px(26 + rightLegX, 41 + rightLegY, 13, 21 - rightLegY, '#140708');
  px(10 + leftLegX, 42 + leftLegY, 11, 19 - leftLegY, p.hooves);
  px(27 + rightLegX, 42 + rightLegY, 11, 19 - rightLegY, kind === 'BOSS_CYBER' ? '#adb5bd' : p.hooves);
  px(12 + leftLegX, 43 + leftLegY, 5, 14, '#5c7a5e');
  px(29 + rightLegX, 43 + rightLegY, 5, 14, '#5c7a5e');
  return canvas;
}

function makeBackFrame(frontCanvas, kind) {
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 64;
  const c = canvas.getContext('2d');
  c.drawImage(frontCanvas, 0, 0);
  // Vista dorsal: sombrea el rostro/escudo frontal y dibuja espina dorsal / núcleo trasero vulnerable
  c.fillStyle = 'rgba(12, 5, 8, 0.48)';
  c.fillRect(10, 6, 28, 36);
  c.fillStyle = kind === 'SHIELD' ? '#ff4d00' : '#2b1216';
  for (let y = 14; y <= 36; y += 5) {
    c.fillRect(21, y, 6, 3);
  }
  return canvas;
}

function makeGoreDeathFrames(bodyColor) {
  return [0, 1, 2, 3].map((stage) => {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 64;
    const c = canvas.getContext('2d');
    const px = (x, y, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x, y, w, h);
    };
    if (stage === 0) {
      px(14, 6, 20, 12, '#140708');
      px(15, 7, 18, 10, bodyColor);
      px(6, 20, 36, 24, '#140708');
      px(8, 21, 32, 22, bodyColor);
      px(12, 24, 24, 16, '#d90429');
      for (let y = 26; y <= 36; y += 4) {
        px(14, y, 7, 2, '#fff3b0');
        px(27, y, 7, 2, '#fff3b0');
      }
      px(10, 44, 10, 18, bodyColor);
      px(28, 44, 10, 18, bodyColor);
    } else if (stage === 1) {
      px(8, 24, 32, 18, '#d90429');
      px(16, 26, 16, 8, '#fff3b0');
      px(10, 36, 28, 16, '#780000');
      px(6, 48, 36, 14, bodyColor);
    } else if (stage === 2) {
      px(4, 44, 40, 18, '#140708');
      px(6, 46, 36, 15, '#9e0000');
      px(10, 40, 28, 12, '#d90429');
      px(14, 44, 10, 6, '#fff3b0');
    } else {
      px(2, 53, 44, 9, '#140708');
      px(4, 54, 40, 7, '#780000');
      px(8, 50, 32, 8, '#d90429');
      px(12, 48, 9, 7, '#fff3b0');
      px(14, 50, 2, 2, '#140708');
      px(18, 50, 2, 2, '#140708');
    }
    return canvas;
  });
}

function makeEnemyAnimationSet(kind, bodyColor) {
  const walk = [0, 1, 2, 3].map((i) => makeWalkFrame(kind, i, false, false));
  return {
    walk,
    back: walk.map((frame) => makeBackFrame(frame, kind)),
    charge: [makeWalkFrame(kind, 1, true, false), makeWalkFrame(kind, 3, true, false)],
    pain: makeWalkFrame(kind, 0, false, true),
    death: makeGoreDeathFrames(bodyColor)
  };
}

function makeFlameBallSprite(stage) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 24;
  const c = canvas.getContext('2d');
  const px = (x, y, w, h, col) => {
    c.fillStyle = col;
    c.fillRect(x, y, w, h);
  };
  if (stage === 0) {
    px(5, 5, 14, 14, '#ff4d00');
    px(7, 7, 10, 10, '#ffbe0b');
    px(9, 9, 6, 6, '#fff3b0');
  } else if (stage === 1) {
    px(2, 3, 20, 18, '#d90429');
    px(4, 4, 16, 16, '#ff4d00');
    px(7, 7, 10, 10, '#ffbe0b');
    px(10, 9, 4, 5, '#fff3b0');
  } else {
    px(1, 2, 22, 20, 'rgba(120, 0, 0, 0.78)');
    px(3, 4, 18, 16, '#d90429');
    px(6, 7, 12, 10, '#ff4d00');
    px(9, 9, 6, 6, '#ff9e00');
  }
  return canvas;
}

// ============================================================================
// CLASE PRINCIPAL HELLFALL GAME (API pública 100% compatible con main.js)
// ============================================================================
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
      5: makeTexture(5),
      6: makeTexture(6),
      7: makeTexture(7),
      8: makeTexture(8),
      9: makeTexture(9)
    };
    this.floorTexture = makeFloorTexture();
    this.floorPixels = this.floorTexture.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    this.ceilingTexture = makeCeilingTexture();
    this.ceilingPixels = this.ceilingTexture.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    this.sceneImageData = this.ctx.createImageData(WIDTH, VIEW_HEIGHT);

    this.animSets = {
      IMP: makeEnemyAnimationSet('IMP', '#8a4f2b'),
      CACODEMON: makeEnemyAnimationSet('CACODEMON', '#d90429'),
      BRUTE: makeEnemyAnimationSet('BARON', '#7a2832'),
      SUMMONER: makeEnemyAnimationSet('SUMMONER', '#4b2d7a'),
      LOST_SOUL: makeEnemyAnimationSet('LOST_SOUL', '#ff4d00'),
      SHIELD: makeEnemyAnimationSet('SHIELD', '#495057'),
      PINKY: makeEnemyAnimationSet('PINKY', '#b5174b'),
      REVENANT: makeEnemyAnimationSet('REVENANT', '#adb5bd'),
      BOSS_CYBER: makeEnemyAnimationSet('BOSS_CYBER', '#a31621'),
      BOSS_ABYSS: makeEnemyAnimationSet('BOSS_ABYSS', '#5a189a')
    };

    this.fireFrames = [makeFirePillarSprite(0), makeFirePillarSprite(1), makeFirePillarSprite(2)];
    this.barrelSprites = [makeBarrelSprite(0), makeBarrelSprite(1)];
    this.coinSprites = [makeCoinSprite(0), makeCoinSprite(1)];
    this.merchantSprites = [makeMerchantSprite(0), makeMerchantSprite(1)];
    this.chestClosedSprite = makeChestSprite(false);
    this.chestOpenSprite = makeChestSprite(true);
    this.keySprites = [makeKeySprite(0), makeKeySprite(1)];
    this.flameBallSprites = [makeFlameBallSprite(0), makeFlameBallSprite(1), makeFlameBallSprite(2)];
    this.ammoSprites = [makeAmmoSprite(0), makeAmmoSprite(1)];
    this.medkitSprites = [makeMedkitSprite(0), makeMedkitSprite(1)];
    this.armorSprites = [makeArmorSprite(0), makeArmorSprite(1)];
    this.soulsphereSprites = [makeSoulsphereSprite(0), makeSoulsphereSprite(1)];
    this.orbSprites = {
      IMP: makeDemonOrbSprite('#ff4d00', '#ffbe0b'),
      CACODEMON: makeDemonOrbSprite('#00b4d8', '#caf0f8'),
      BRUTE: makeDemonOrbSprite('#38b000', '#ccff33'),
      SUMMONER: makeDemonOrbSprite('#70e000', '#ccff33'),
      SHIELD: makeDemonOrbSprite('#00b4d8', '#caf0f8'),
      REVENANT: makeDemonOrbSprite('#ff9e00', '#fff3b0'),
      BOSS: makeDemonOrbSprite('#ff0055', '#ffbe0b')
    };

    this.keys = new Set();
    this.zBuffer = new Float32Array(WIDTH);
    this.map = [];
    this.mapSize = CONFIG.MAP_SIZE;
    this.doors = new Map();
    this.chests = [];
    this.armorPickups = [];
    this.powerups = [];
    this.coins = [];
    this.barrels = [];
    this.teleporters = [];
    this.meteorStrikes = [];
    this.meteorTimer = 4.0;
    this.flowDist = [];
    this.flowTimer = 0;
    this.merchant = null;
    this.shockwaves = [];
    this.floorCracks = [];
    this.keyItem = null;
    this.fireProps = [];
    this.ammoPacks = [];
    this.medkits = [];
    this.flameProjectiles = [];
    this.enemyProjectiles = [];
    this.bloodParticles = [];
    this.wallSparks = [];
    this.ambientEmbers = [];
    this.lootNotifications = [];
    this.hazards = [];
    this.explored = [];
    this.mapOpen = false;
    this.mapRevealTimer = 0;
    this.sectorEvent = null;
    this.upgrades = new Map();
    this.weaponDamageBonus = 0;
    this.combo = { count: 0, lastKill: 0, expires: 0, bannerText: '', bannerUntil: 0, bannerBonus: 0 };
    this.bonusPoints = 0;
    this.hitmarkerUntil = 0;
    this.hitmarkerKillUntil = 0;
    this.lastHitmarkerSound = 0;
    this.lastShieldBlockAt = 0;
    this.strafeLean = 0;
    this.toxicAccum = 0;
    this.hazardIdleTime = 0;
    this.toxicFlashTime = 0;
    this.lastKillSource = '';
    this.chainsawAnnounced = false;
    this.runStats = {
      chainsawKills: 0,
      flamerKills: 0,
      gloryKills: 0,
      bossKills: 0,
      meleeKills: 0,
      explosionKills: 0,
      barrelKills: 0,
      perfectSectors: 0,
      damageTaken: 0,
      secretsFound: 0,
      secretsTotal: 0,
      punches: 0,
      maxCombo: 0
    };
    this.sectorDamageTaken = 0;
    this.pauseMenuIndex = 0;
    this.mouseSens = 1.0;
    this.reducedEffects = false;
    this.punchCooldownUntil = 0;
    this.kineticCooldownUntil = 0;
    this.counterCooldownUntil = 0;
    this.dashCooldownUntil = 0;
    this.playerDashUntil = 0;
    this.kineticFlashUntil = 0;
    this.auraTickTimer = 0;
    this.punchAnimUntil = 0;
    this.punchEmpowered = false;
    this.punchSide = 1;
    this.hitStopUntil = 0;
    this.slowMoUntil = 0;
    this.teleportCooldownUntil = 0;
    this.briefingOpen = false;
    this.melt = null;
    this.deathSequence = null;
    this.victorySequence = null;
    this.bossAwakenBanner = null;
    this.pressurePct = 0;

    this.running = false;
    this.paused = false;
    this.finished = false;
    this.intermission = null;
    this.mouseDown = false;
    this.shopOpen = false;
    this.shopNotice = '';
    this.frameId = null;
    this.lastTime = 0;
    this.lastDamageTime = 0;
    this.damageDir = 0;
    this.damageAngle = 0;
    this.evilGrinUntil = 0;
    this.pickupFlashTime = 0;
    this.screenShake = 0;
    this.shotUntil = 0;
    this.shotStartTime = 0;
    this.recoil = 0;
    this.muzzleFlash = 0;
    this.walkTime = 0;
    this.walkBobX = 0;
    this.walkBobY = 0;
    this.wasPointerLocked = false;

    this.setupFullscreenSupport();

    this.boundLoop = (time) => this.loop(time);
    this.onKeyDown = (e) => this.handleKeyDown(e);
    this.onKeyUp = (e) => this.handleKeyUp(e);
    this.onMouseMove = (e) => this.handleMouseMove(e);
    this.onPointerLockChange = () => this.handlePointerLockChange();
    this.onContextMenu = (e) => e.preventDefault();

    this.onMouseDown = (event) => {
      if (!this.running || this.finished) return;
      this.audio.init();
      const rect = this.canvas.getBoundingClientRect();
      const cx = ((event.clientX - rect.left) / rect.width) * WIDTH;
      const cy = ((event.clientY - rect.top) / rect.height) * HEIGHT;

      if (this.briefingOpen) {
        this.dismissBriefing();
        return;
      }
      if (this.victorySequence) {
        if (!this.melt && performance.now() - this.victorySequence.startTime > 700) {
          this.finalizeMatch(true);
        }
        return;
      }
      if (this.deathSequence) {
        if (!this.melt && performance.now() - this.deathSequence.startTime > 700) {
          this.finalizeMatch(false);
        }
        return;
      }
      if (this.intermission) {
        const choices = this.intermission.upgradeChoices || [];
        if (choices.length > 0 && cy >= 62 && cy <= 132) {
          const cardCount = choices.length;
          const totalW = WIDTH - 24;
          const gap = 6;
          const cardW = Math.floor((totalW - gap * (cardCount - 1)) / cardCount);
          for (let i = 0; i < cardCount; i++) {
            const x0 = 12 + i * (cardW + gap);
            if (cx >= x0 && cx <= x0 + cardW) {
              this.selectUpgrade(i);
              return;
            }
          }
        }
        if (!this.intermission.upgradeSelected && cy >= 48 && cy <= 61 && cx >= 216 && cx <= 308) {
          this.rerollIntermissionUpgrades();
          return;
        }
        this.advanceFromIntermission();
        return;
      }
      if (this.mapOpen) {
        this.mapOpen = false;
        this.lastTime = performance.now();
        return;
      }
      if (this.shopOpen) return;

      if (this.paused) {
        if (cx >= 46 && cx <= 274) {
          if (cy >= 46 && cy <= 65) {
            this.resume();
            if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
            return;
          }
          if (cy >= 68 && cy <= 87) {
            this.toggleFullscreen();
            return;
          }
          if (cy >= 90 && cy <= 109) {
            this.cycleMouseSensitivity(1);
            this.drawPauseScreen();
            return;
          }
          if (cy >= 112 && cy <= 131) {
            this.reducedEffects = !this.reducedEffects;
            this.audio.playTallyTick();
            this.drawPauseScreen();
            return;
          }
          if (cy >= 134 && cy <= 153) {
            this.quitWithoutSaving();
            return;
          }
        }
        this.resume();
        if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
        return;
      }
      if (document.pointerLockElement !== this.canvas && this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      } else if (event.button === 2) {
        this.triggerPunch(false);
      } else if (event.button === 0) {
        this.mouseDown = true;
        this.shoot();
      }
    };

    this.onMouseUp = (event) => {
      if (!event || event.button === 0) this.mouseDown = false;
    };
    this.onWheel = (e) => {
      if (!this.running || this.paused || this.finished || this.intermission || this.shopOpen || this.mapOpen || this.deathSequence) return;
      const dir = Math.sign(e.deltaY);
      if (dir !== 0) this.selectWeapon(((this.player.weapon - 1 + dir + 4) % 4) + 1);
    };

    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('wheel', this.onWheel);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    this.renderAttractScreen();
  }

  setupFullscreenSupport() {
    if (!document.getElementById('hellfall-fs-style')) {
      const style = document.createElement('style');
      style.id = 'hellfall-fs-style';
      style.textContent = `
        .game-screen-wrap:fullscreen,
        .game-screen-wrap:-webkit-full-screen {
          position: fixed !important;
          inset: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          background: #000000 !important;
          margin: 0 !important;
          padding: 0 !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }
        .game-screen-wrap:fullscreen > #game-canvas,
        .game-screen-wrap:-webkit-full-screen > #game-canvas,
        #game-canvas:fullscreen,
        #game-canvas:-webkit-full-screen {
          width: min(100vw, calc(100vh * 1.6)) !important;
          height: min(100vh, calc(100vw / 1.6)) !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          aspect-ratio: 16 / 10 !important;
          margin: auto !important;
          padding: 0 !important;
          border: none !important;
          box-sizing: border-box !important;
          object-fit: contain !important;
          background: #000000 !important;
          image-rendering: pixelated !important;
          display: block !important;
        }
      `;
      document.head.appendChild(style);
    }

    this.updateFullscreenLayout = () => {
      const isFs = Boolean(document.fullscreenElement);
      if (isFs && typeof window !== 'undefined' && window.innerWidth && window.innerHeight && this.canvas?.style?.setProperty) {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const w = Math.floor(Math.min(vw, vh * 1.6));
        const h = Math.floor(Math.min(vh, vw / 1.6));
        this.canvas.style.setProperty('width', `${w}px`, 'important');
        this.canvas.style.setProperty('height', `${h}px`, 'important');
      } else if (this.canvas?.style?.removeProperty) {
        this.canvas.style.removeProperty('width');
        this.canvas.style.removeProperty('height');
      }
      const btn = document.getElementById('fullscreen-toggle');
      if (btn) {
        btn.textContent = isFs ? '🗗 MINIMIZAR PANTALLA [F]' : '⛶ PANTALLA COMPLETA [F]';
      }
      if (this.paused) this.drawPauseScreen();
    };
    document.addEventListener('fullscreenchange', this.updateFullscreenLayout);
    window.addEventListener('resize', this.updateFullscreenLayout);

    const musicBtn = document.getElementById('music-toggle');
    if (musicBtn && musicBtn.parentElement && !document.getElementById('fullscreen-toggle')) {
      const fsBtn = document.createElement('button');
      fsBtn.id = 'fullscreen-toggle';
      fsBtn.type = 'button';
      fsBtn.className = musicBtn.className;
      fsBtn.style.marginLeft = '6px';
      fsBtn.textContent = '⛶ PANTALLA COMPLETA [F]';
      fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleFullscreen();
      });
      musicBtn.insertAdjacentElement('afterend', fsBtn);
    }
  }

  toggleFullscreen() {
    const target = this.canvas.parentElement || this.canvas;
    if (!document.fullscreenElement) {
      const req = target.requestFullscreen ? target : this.canvas;
      if (req.requestFullscreen) {
        req.requestFullscreen().then(() => {
          if (this.updateFullscreenLayout) this.updateFullscreenLayout();
          if (this.running && !this.paused && !this.intermission && !this.deathSequence && !this.victorySequence && this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock();
          }
          if (this.paused) this.drawPauseScreen();
        }).catch(() => {});
      }
    } else if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        if (this.updateFullscreenLayout) this.updateFullscreenLayout();
        if (this.paused) this.drawPauseScreen();
      }).catch(() => {});
    }
  }

  applySectorTheme(level) {
    const theme = CONFIG.SECTOR_THEMES[(level - 1) % CONFIG.SECTOR_THEMES.length];
    this.currentTheme = theme;
    this.textures[1] = makeTexture(1, theme);
    this.textures[2] = makeTexture(2, theme);
    this.textures[3] = makeTexture(3, theme);
    this.textures[6] = makeTexture(6, theme);
    this.textures[7] = makeTexture(7, theme);
    this.textures[8] = makeTexture(8, theme);
    this.textures[9] = makeTexture(9, theme);
    this.floorTexture = makeFloorTexture(theme);
    this.floorPixels = this.floorTexture.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    this.ceilingTexture = makeCeilingTexture(theme);
    this.ceilingPixels = this.ceilingTexture.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
  }

  pushLootNotification(title, items = [], color = '#ffbe0b') {
    this.lootNotifications.unshift({
      title,
      items,
      color,
      timer: 3.4,
      maxTimer: 3.4
    });
    if (this.lootNotifications.length > 3) {
      this.lootNotifications.pop();
    }
  }

  getUpgradeRank(id) {
    if (this.upgrades instanceof Map) return this.upgrades.get(id) || 0;
    if (this.upgrades instanceof Set) return this.upgrades.has(id) ? 1 : 0;
    return 0;
  }

  hasUpgrade(id) {
    return this.getUpgradeRank(id) > 0;
  }

  getTotalUpgradeRanks() {
    if (!(this.upgrades instanceof Map)) return 0;
    let total = 0;
    for (const r of this.upgrades.values()) total += r;
    return total;
  }

  getMaxReserve() {
    return CONFIG.MAX_RESERVE + this.getUpgradeRank('AMMO_POUCH') * 8;
  }

  captureCurrentScreen(tintColor = null) {
    const snap = document.createElement('canvas');
    snap.width = WIDTH;
    snap.height = HEIGHT;
    const sctx = snap.getContext('2d');
    sctx.drawImage(this.canvas, 0, 0);
    if (tintColor) {
      sctx.fillStyle = tintColor;
      sctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    return snap;
  }

  // Efecto mítico Melt de DOOM 1993: derrite la pantalla anterior en columnas pixeladas verticales
  startScreenMelt(type = 'SECTOR', preCaptured = null) {
    const tint = type === 'DEATH' ? 'rgba(180, 0, 12, 0.28)' : (type === 'VICTORY' ? 'rgba(255, 190, 11, 0.22)' : null);
    const fromCanvas = preCaptured || this.captureCurrentScreen(tint);
    const colWidth = 2;
    const numCols = Math.ceil(WIDTH / colWidth);
    const cols = new Float32Array(numCols);
    cols[0] = -randInt(0, 14);
    for (let i = 1; i < numCols; i++) {
      const delta = randInt(-1, 1) * 2;
      cols[i] = clamp(cols[i - 1] + delta, -26, 0);
    }
    this.melt = {
      type,
      fromCanvas,
      colWidth,
      cols,
      elapsed: 0
    };
    this.audio.playMelt(type === 'DEATH');
  }

  updateAndDrawMelt(dt) {
    if (!this.melt) return false;
    const m = this.melt;
    m.elapsed += dt;
    const c = this.ctx;
    const colW = m.colWidth;
    const speed = m.type === 'DEATH' ? 195 : 235;
    let allDone = true;

    for (let i = 0; i < m.cols.length; i++) {
      let y = m.cols[i];
      if (y < HEIGHT) {
        allDone = false;
        const step = y < 0 ? speed * 0.52 * dt : (speed + Math.min(180, y * 1.45)) * dt;
        y += step;
        m.cols[i] = y;
      }
      const drawY = Math.max(0, Math.floor(y));
      if (drawY < HEIGHT) {
        const x = i * colW;
        c.drawImage(m.fromCanvas, x, 0, colW, HEIGHT - drawY, x, drawY, colW, HEIGHT - drawY);
        if (drawY > 0) {
          c.fillStyle = m.type === 'DEATH' ? '#d90429' : (m.type === 'VICTORY' ? '#70e000' : '#ff4d00');
          c.fillRect(x, drawY, colW, 3);
          c.fillStyle = m.type === 'DEATH' ? '#780000' : '#ffbe0b';
          c.fillRect(x, Math.max(0, drawY - 2), colW, 2);
        }
      }
    }

    if (allDone || m.elapsed > 1.75) {
      this.melt = null;
      return false;
    }
    return true;
  }

  selectWeapon(num) {
    if (!this.player) return;
    if (num === 4 && this.player.kills < CONFIG.CHAINSAW_UNLOCK_KILLS) {
      this.audio.playEmptyClip();
      const faltan = CONFIG.CHAINSAW_UNLOCK_KILLS - this.player.kills;
      this.onStatus(`MOTOSIERRA BLOQUEADA: elimina ${faltan} demonio${faltan === 1 ? '' : 's'} más para desbloquearla`);
      return;
    }
    this.player.weapon = num;
    const names = {
      1: 'Arma [1]: SUPER ESCOPETA DOOM (7 perdigones reales en abanico)',
      2: 'Arma [2]: AMETRALLADORA CHAINGUN (Alta cadencia)',
      3: 'Arma [3]: LANZALLAMAS INFERNAL (Chorro ígneo eficiente con ignición)',
      4: 'Arma [4]: MOTOSIERRA INFERNAL (Genera cartuchos y gasolina al desmembrar)'
    };
    this.onStatus(names[num] || names[1]);
  }

  spawnBlood(x, y, count = 12, colorOverride = null) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.6 + Math.random() * 2.5;
      this.bloodParticles.push({
        x,
        y,
        z: (Math.random() - 0.3) * 0.4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: 0.8 + Math.random() * 1.5,
        life: 0.35 + Math.random() * 0.35,
        size: 2 + Math.floor(Math.random() * 2),
        color: colorOverride || (Math.random() < 0.65 ? '#d90429' : '#780000')
      });
    }
  }

  spawnWallSparks(x, y, count = 6, colorOverride = null) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.6;
      this.wallSparks.push({
        x,
        y,
        z: (Math.random() - 0.5) * 0.35,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: -0.4 - Math.random() * 0.8,
        life: 0.18 + Math.random() * 0.18,
        color: colorOverride || (i % 2 === 0 ? '#fff3b0' : '#ffbe0b')
      });
    }
  }

  // ============================================================================
  // GENERADOR DE SECTORES CON PLANTILLAS VARIADAS, TEMAS Y OBJETOS INTERACTIVOS
  // ============================================================================
  generateProceduralMap(level) {
    const size = CONFIG.MAP_SIZE;
    this.mapSize = size;
    this.doors.clear();
    this.chests = [];
    this.armorPickups = [];
    this.powerups = [];
    this.coins = [];
    this.barrels = [];
    this.teleporters = [];
    this.meteors = [];
    this.merchant = null;
    this.shockwaves = [];
    this.floorCracks = [];

    this.applySectorTheme(level);
    const theme = this.currentTheme || CONFIG.SECTOR_THEMES[0];
    const layoutType = theme.layout || 'GRID';
    this.currentLayoutName = layoutType;

    const grid = Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (__, x) => {
        const h = (x * 13 + y * 29 + level * 7) % 12;
        if (h < 5) return '1';
        if (h < 10) return '2';
        return '8';
      })
    );

    const carveRect = (x0, y0, w, h) => {
      for (let y = Math.max(2, y0); y < Math.min(size - 2, y0 + h); y++) {
        for (let x = Math.max(2, x0); x < Math.min(size - 2, x0 + w); x++) {
          grid[y][x] = '0';
        }
      }
    };

    const carveTunnel = (x1, y1, x2, y2, halfWidth = 1) => {
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
        for (let w = -halfWidth; w <= halfWidth; w++) {
          const yy = clamp(y1 + w, 2, size - 3);
          grid[yy][x] = '0';
        }
      }
      for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
        for (let w = -halfWidth; w <= halfWidth; w++) {
          const xx = clamp(x2 + w, 2, size - 3);
          grid[y][xx] = '0';
        }
      }
    };

    const coords = [10, 24, 38];
    const nodes = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cx = coords[c], cy = coords[r];
        const roomSpan = layoutType === 'CROSS' && (r === 1 || c === 1) ? 9 : (layoutType === 'CITADEL' && (r + c) % 2 === 0 ? 9 : 7);
        const half = Math.floor(roomSpan / 2);
        carveRect(cx - half, cy - half, roomSpan, roomSpan);
        nodes.push({ cx, cy, r, c });
      }
    }

    // Plantillas arquitectónicas distintas según el sector
    if (layoutType === 'RING') {
      // Anillo perimetral exterior + puentes hacia el santuario central
      const ringPairs = [[0, 1], [1, 2], [2, 5], [5, 8], [8, 7], [7, 6], [6, 3], [3, 0]];
      for (const [a, b] of ringPairs) carveTunnel(nodes[a].cx, nodes[a].cy, nodes[b].cx, nodes[b].cy, 1);
      if (level % 2 === 0) {
        carveTunnel(nodes[1].cx, nodes[1].cy, nodes[4].cx, nodes[4].cy, 1);
        carveTunnel(nodes[7].cx, nodes[7].cy, nodes[4].cx, nodes[4].cy, 1);
      } else {
        carveTunnel(nodes[3].cx, nodes[3].cy, nodes[4].cx, nodes[4].cy, 1);
        carveTunnel(nodes[5].cx, nodes[5].cy, nodes[4].cx, nodes[4].cy, 1);
      }
    } else if (layoutType === 'CROSS') {
      // Gran nave cruciforme central con avenidas anchas
      carveTunnel(nodes[1].cx, nodes[1].cy, nodes[7].cx, nodes[7].cy, 2);
      carveTunnel(nodes[3].cx, nodes[3].cy, nodes[5].cx, nodes[5].cy, 2);
      for (const [a, b] of [[0, 1], [2, 1], [6, 3], [8, 5], [0, 3], [2, 5]]) {
        carveTunnel(nodes[a].cx, nodes[a].cy, nodes[b].cx, nodes[b].cy, 1);
      }
    } else if (layoutType === 'CORRIDORS') {
      // Búnker de galerías horizontales paralelas con esclusas verticales
      for (let r = 0; r < 3; r++) {
        carveTunnel(nodes[r * 3].cx, nodes[r * 3].cy, nodes[r * 3 + 2].cx, nodes[r * 3 + 2].cy, 1);
      }
      carveTunnel(nodes[0].cx, nodes[0].cy, nodes[3].cx, nodes[3].cy, 1);
      carveTunnel(nodes[2].cx, nodes[2].cy, nodes[5].cx, nodes[5].cy, 1);
      carveTunnel(nodes[4].cx, nodes[4].cy, nodes[7].cx, nodes[7].cy, 1);
      carveTunnel(nodes[3].cx, nodes[3].cy, nodes[6].cx, nodes[6].cy, 1);
      carveTunnel(nodes[5].cx, nodes[5].cy, nodes[8].cx, nodes[8].cy, 1);
    } else {
      // GRID y CITADEL: red completa con diagonales tácticas en CITADEL
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.abs(nodes[i].r - nodes[j].r) + Math.abs(nodes[i].c - nodes[j].c) === 1) {
            carveTunnel(nodes[i].cx, nodes[i].cy, nodes[j].cx, nodes[j].cy, 1);
          }
        }
      }
    }

    // Cámaras de suministros, Mercader y 2 Salas Secretas con ubicación rotatoria por sector
    const secretPool = [
      { roomX: 8, roomY: 2, w: 5, h: 4, doorX: 10, doorY: 6, orient: 'H', secret: true },
      { roomX: 35, roomY: 2, w: 5, h: 4, doorX: 38, doorY: 6, orient: 'H', secret: true },
      { roomX: 2, roomY: 8, w: 4, h: 5, doorX: 6, doorY: 10, orient: 'V', secret: true },
      { roomX: 16, roomY: 43, w: 5, h: 3, doorX: 18, doorY: 42, orient: 'H', secret: true }
    ];
    const secA = secretPool[(level - 1) % secretPool.length];
    const secB = secretPool[(level + 1) % secretPool.length];

    const merchantAtNorth = level % 2 === 0;
    const vaultSpecs = [
      { roomX: 22, roomY: 2, w: 5, h: 4, doorX: 24, doorY: 6, orient: 'H', secret: false, merchant: merchantAtNorth },
      { roomX: 2, roomY: 22, w: 4, h: 5, doorX: 6, doorY: 24, orient: 'V', secret: false },
      { roomX: 43, roomY: 22, w: 3, h: 5, doorX: 42, doorY: 24, orient: 'V', secret: false },
      { roomX: 22, roomY: 43, w: 5, h: 3, doorX: 24, doorY: 42, orient: 'H', secret: false, merchant: !merchantAtNorth },
      secA,
      secB
    ];

    const mandatoryTargets = [];
    const regularVaultCenters = [];

    for (const v of vaultSpecs) {
      for (let y = v.roomY - 1; y <= v.roomY + v.h; y++) {
        for (let x = v.roomX - 1; x <= v.roomX + v.w; x++) {
          if (y > 0 && y < size - 1 && x > 0 && x < size - 1) {
            grid[y][x] = '1';
          }
        }
      }
      carveRect(v.roomX, v.roomY, v.w, v.h);

      const tileCode = v.secret ? '7' : '6';
      grid[v.doorY][v.doorX] = tileCode;
      if (v.orient === 'H') {
        grid[v.doorY][v.doorX - 1] = v.secret ? '2' : '9';
        grid[v.doorY][v.doorX + 1] = v.secret ? '2' : '9';
        grid[v.doorY - 1][v.doorX] = '0';
        grid[v.doorY + 1][v.doorX] = '0';
      } else {
        grid[v.doorY - 1][v.doorX] = v.secret ? '2' : '9';
        grid[v.doorY + 1][v.doorX] = v.secret ? '2' : '9';
        grid[v.doorY][v.doorX - 1] = '0';
        grid[v.doorY][v.doorX + 1] = '0';
      }

      this.doors.set(`${v.doorX},${v.doorY}`, {
        open: 0,
        target: 0,
        x: v.doorX,
        y: v.doorY,
        orient: v.orient,
        isSecret: v.secret,
        isMerchant: Boolean(v.merchant),
        discovered: false
      });

      const cx = v.roomX + Math.floor(v.w / 2) + 0.5;
      const cy = v.roomY + Math.floor(v.h / 2) + 0.5;
      mandatoryTargets.push({ gx: Math.floor(cx), gy: Math.floor(cy) });

      if (v.merchant) {
        this.merchant = { x: cx, y: cy, name: 'MERCADER DE ALMAS' };
      } else if (v.secret) {
        this.powerups.push({ x: cx, y: cy, active: true });
      } else {
        regularVaultCenters.push({ x: cx, y: cy });
      }
    }

    regularVaultCenters.sort(() => Math.random() - 0.5);
    const activeChests = regularVaultCenters.slice(0, CONFIG.CHEST_COUNT);
    for (const vc of activeChests) {
      this.chests.push({ x: vc.x, y: vc.y, opened: false });
    }

    for (let i = 0; i < size; i++) {
      grid[0][i] = '1';
      grid[size - 1][i] = '1';
      grid[i][0] = '1';
      grid[i][size - 1] = '1';
    }

    const verifyAndConnect = (targetGX, targetGY) => {
      const visited = Array.from({ length: size }, () => Array(size).fill(false));
      const queue = [{ x: nodes[0].cx, y: nodes[0].cy }];
      visited[nodes[0].cy][nodes[0].cx] = true;
      const dirs = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
      ];
      while (queue.length > 0) {
        const curr = queue.shift();
        if (curr.x === targetGX && curr.y === targetGY) return;
        for (const d of dirs) {
          const nx = curr.x + d.dx, ny = curr.y + d.dy;
          if (
            nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 &&
            !visited[ny][nx] &&
            (grid[ny][nx] === '0' || grid[ny][nx] === '6' || grid[ny][nx] === '7')
          ) {
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny });
          }
        }
      }
      carveTunnel(nodes[4].cx, nodes[4].cy, targetGX, targetGY);
    };

    for (const n of nodes) verifyAndConnect(n.cx, n.cy);
    for (const t of mandatoryTargets) verifyAndConnect(t.gx, t.gy);

    for (let i = 1; i < nodes.length - 1; i++) {
      if (i % 2 === 0 && i !== 6 && i !== 4) grid[nodes[i].cy][nodes[i].cx] = '3';
    }

    // Arenas de Campeón y Boss: rotan de posición entre Suroeste (nodes[6]) y Sureste (nodes[8]) según el sector
    const swapArenas = level % 2 === 0;

    // Arena Suroeste (x: 5..15, y: 33..43)
    for (let y = 33; y <= 43; y++) {
      for (let x = 5; x <= 15; x++) {
        grid[y][x] = (y === 33 || y === 43 || x === 5 || x === 15) ? (swapArenas ? '1' : '2') : '0';
      }
    }
    grid[33][9] = '9'; grid[33][10] = '6'; grid[33][11] = '9';
    grid[37][15] = '9'; grid[38][15] = '6'; grid[39][15] = '9';
    this.doors.set('10,33', { open: 0, target: 0, x: 10, y: 33, orient: 'H', isSecret: false, isBossGate: true });
    this.doors.set('15,38', { open: 0, target: 0, x: 15, y: 38, orient: 'V', isSecret: false, isBossGate: true });

    // Arena Sureste (x: 32..45, y: 32..45)
    for (let y = 32; y <= 45; y++) {
      for (let x = 32; x <= 45; x++) {
        grid[y][x] = (y === 32 || y === 45 || x === 32 || x === 45) ? (swapArenas ? '2' : '1') : '0';
      }
    }
    grid[32][37] = '9'; grid[32][38] = '6'; grid[32][39] = '9';
    grid[37][32] = '9'; grid[38][32] = '6'; grid[39][32] = '9';
    this.doors.set('38,32', { open: 0, target: 0, x: 38, y: 32, orient: 'H', isSecret: false, isBossGate: true });
    this.doors.set('32,38', { open: 0, target: 0, x: 32, y: 38, orient: 'V', isSecret: false, isBossGate: true });

    const swArena = {
      cx: nodes[6].cx + 0.5,
      cy: nodes[6].cy + 0.5,
      bounds: { minX: 5.7, maxX: 14.3, minY: 33.7, maxY: 42.3 }
    };
    const seArena = {
      cx: nodes[8].cx + 0.5,
      cy: nodes[8].cy + 0.5,
      bounds: { minX: 32.7, maxX: 44.3, minY: 32.7, maxY: 44.3 }
    };

    this.championArena = swapArenas ? seArena : swArena;
    this.bossArena = swapArenas ? swArena : seArena;

    const doorTileChar = level === MAX_LEVELS ? '5' : '4';
    let exitDoor;
    if (swapArenas) {
      grid[43][9] = '9';
      grid[43][10] = doorTileChar;
      grid[43][11] = '9';
      exitDoor = { x: 10.5, y: 42.3, wallX: 10.5, wallY: 43.5 };
    } else {
      grid[45][38] = '9';
      grid[45][39] = doorTileChar;
      grid[45][40] = '9';
      exitDoor = { x: 39.5, y: 44.3, wallX: 39.5, wallY: 45.5 };
    }

    this.keyItem = { x: this.bossArena.cx, y: this.bossArena.cy, active: false };

    for (const door of this.doors.values()) {
      grid[door.y][door.x] = door.isSecret ? '7' : '6';
      if (door.orient === 'H') {
        if (grid[door.y][door.x - 1] === '0') grid[door.y][door.x - 1] = '9';
        if (grid[door.y][door.x + 1] === '0') grid[door.y][door.x + 1] = '9';
      } else {
        if (grid[door.y - 1][door.x] === '0') grid[door.y - 1][door.x] = '9';
        if (grid[door.y + 1][door.x] === '0') grid[door.y + 1][door.x] = '9';
      }
    }

    const emptyCells = [];
    for (let y = 2; y < size - 2; y++) {
      for (let x = 2; x < size - 2; x++) {
        if (grid[y][x] === '0') emptyCells.push({ x: x + 0.5, y: y + 0.5 });
      }
    }

    this.fireProps = [];
    for (let idx = 0; idx < nodes.length; idx++) {
      const n = nodes[idx];
      this.fireProps.push({ x: n.cx - 2.5, y: n.cy - 2.5, phase: idx % 3 });
      this.fireProps.push({ x: n.cx + 2.5, y: n.cy - 2.5, phase: (idx + 1) % 3 });
    }

    // Sin círculos de teletransporte en el suelo para evitar bloqueos al pisarlos
    this.teleporters = [];

    this.map = grid.map((row) => row.join(''));
    return {
      startPos: { x: nodes[0].cx + 0.5, y: nodes[0].cy + 0.5 },
      emptyCells,
      exitDoor,
      nodes
    };
  }

  getSectorEventForLevel(level) {
    const eventsByLevel = {
      1: {
        type: 'PATROL',
        label: 'GUARDIA EN ALERTA',
        short: 'ALERTA',
        detail: 'Los demonios vigilan sus sectores y despiertan al verte o escuchar disparos'
      },
      2: {
        type: 'DARKNESS',
        label: 'APAGÓN TOTAL',
        short: 'APAGÓN',
        detail: 'La luz se extingue: solo los fogonazos y el fuego iluminan el sector'
      },
      3: {
        type: 'LAVA',
        label: 'FUGA DE MAGMA',
        short: 'MAGMA',
        detail: 'Las grietas de lava queman a los demonios y al jugador al pisarlas'
      },
      4: {
        type: 'TOXIC',
        label: 'SUELO TÓXICO',
        short: 'TÓXICO',
        detail: 'Las charcas ácidas quitan 1 HP/s si te quedas quieto sobre ellas'
      },
      5: {
        type: 'AMBUSH',
        label: 'ESCUADRÓN DE CHOQUE',
        short: 'CHOQUE',
        detail: 'Mayor presencia de demonios blindados y embistidores Pinky'
      },
      6: {
        type: 'DARKNESS',
        label: 'ECLIPSE DE DEIMOS',
        short: 'APAGÓN',
        detail: 'Oscuridad abisal: usa tus fogonazos y barriles explosivos para iluminar'
      },
      7: {
        type: 'METEORS',
        label: 'LLUVIA ÍGNEA',
        short: 'METEOROS',
        detail: 'Caen meteoros periódicos sobre el sector dañando a demonios y jugador'
      },
      8: {
        type: 'TOXIC',
        label: 'MIASMA CORROSIVO',
        short: 'TÓXICO',
        detail: 'Charcas radiactivas y nigromantes acechando en los pasillos'
      },
      9: {
        type: 'BLOOD_FOG',
        label: 'NIEBLA SANGRIENTA',
        short: 'NIEBLA',
        detail: 'Bruma carmesí densa que embrutece y acelera a la legión infernal'
      },
      10: {
        type: 'APOCALYPSE',
        label: 'CATACLISMO ABISAL',
        short: 'ABISMO',
        detail: 'Oscuridad y tormenta de fuego en el trono del Señor del Abismo'
      }
    };
    return eventsByLevel[((level - 1) % 10) + 1] || eventsByLevel[1];
  }

  generateSectorHazards(emptyCells, exitDoor) {
    this.hazards = [];
    this.barrels = [];
    const candidates = emptyCells.filter((cell) =>
      distance(cell.x, cell.y, this.player.x, this.player.y) > 6.5 &&
      (!exitDoor || distance(cell.x, cell.y, exitDoor.x, exitDoor.y) > 5) &&
      !this.isCellInsideArena(cell.x, cell.y)
    );
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Barriles explosivos UAC repartidos por todos los sectores
    for (const cell of candidates) {
      if (this.barrels.length >= CONFIG.BARREL_COUNT) break;
      if (this.barrels.some((b) => distance(b.x, b.y, cell.x, cell.y) < 5.2)) continue;
      this.barrels.push({
        id: this.barrels.length + 1,
        x: cell.x,
        y: cell.y,
        hp: 1.4,
        alive: true,
        exploded: false,
        phase: this.barrels.length % 2
      });
    }

    const evType = this.sectorEvent?.type;
    if (evType !== 'TOXIC' && evType !== 'LAVA') return;
    for (const cell of candidates) {
      if (this.hazards.length >= CONFIG.HAZARD_COUNT) break;
      if (this.hazards.some((h) => distance(h.x, h.y, cell.x, cell.y) < 6)) continue;
      const radius = CONFIG.HAZARD_RADIUS[0] + Math.random() * (CONFIG.HAZARD_RADIUS[1] - CONFIG.HAZARD_RADIUS[0]);
      this.hazards.push({
        x: cell.x,
        y: cell.y,
        radius,
        kind: evType,
        phase: Math.random() * 10
      });
    }
  }

  initAutomap() {
    this.mapOpen = false;
    this.mapRevealTimer = 0;
    const rows = this.map.length;
    const cols = rows > 0 ? this.map[0].length : 0;
    this.explored = Array.from({ length: rows }, () => Array(cols).fill(false));
    this.revealMapAroundPlayer();
  }

  revealMapAroundPlayer(radius = 4.2) {
    if (!this.map.length) return;
    const cx = Math.floor(this.player.x);
    const cy = Math.floor(this.player.y);
    const r = Math.ceil(radius);
    for (let y = cy - r; y <= cy + r; y++) {
      if (y < 0 || y >= this.map.length) continue;
      for (let x = cx - r; x <= cx + r; x++) {
        if (x < 0 || x >= this.map[y].length) continue;
        if (Math.hypot(x - cx, y - cy) <= radius) this.explored[y][x] = true;
      }
    }
  }

  reset() {
    this.upgrades = new Map();
    this.weaponDamageBonus = 0;
    this.bonusPoints = 0;
    this.mapOpen = false;
    this.chainsawAnnounced = false;
    this.deathSequence = null;
    this.victorySequence = null;
    this.melt = null;
    this.bossAwakenBanner = null;
    this.pressurePct = 0;
    this.hitStopUntil = 0;
    this.slowMoUntil = 0;
    this.runStats = {
      chainsawKills: 0,
      flamerKills: 0,
      gloryKills: 0,
      bossKills: 0,
      meleeKills: 0,
      explosionKills: 0,
      barrelKills: 0,
      weaponMods: 0,
      perfectSectors: 0,
      damageTaken: 0,
      secretsFound: 0,
      secretsTotal: 0,
      punches: 0,
      maxCombo: 0
    };
    this.combo = { count: 0, lastKill: 0, expires: 0, bannerText: '', bannerUntil: 0, bannerBonus: 0 };
    this.player = {
      x: 10.5,
      y: 10.5,
      angle: 0,
      health: 100,
      armor: CONFIG.START_ARMOR,
      ammo: CONFIG.START_AMMO,
      reserve: CONFIG.START_RESERVE,
      fuel: CONFIG.START_FUEL,
      weapon: 1,
      kills: 0,
      coins: 0,
      hasKey: false,
      berserkUntil: 0,
      invulnerableUntil: 0
    };
    this.startTime = performance.now();
    this.level = 1;
    this.startLevel();
  }

  isCellInsideArena(x, y) {
    if (this.championArena?.bounds) {
      const b = this.championArena.bounds;
      if (x >= b.minX - 1 && x <= b.maxX + 1 && y >= b.minY - 1 && y <= b.maxY + 1) return true;
    }
    if (this.bossArena?.bounds) {
      const b = this.bossArena.bounds;
      if (x >= b.minX - 1 && x <= b.maxX + 1 && y >= b.minY - 1 && y <= b.maxY + 1) return true;
    }
    if (this.merchant && distance(x, y, this.merchant.x, this.merchant.y) < 4.5) return true;
    return false;
  }

  startLevel() {
    this.recoil = 0;
    this.muzzleFlash = 0;
    this.screenShake = 0;
    this.finished = false;
    this.intermission = null;
    this.deathSequence = null;
    this.victorySequence = null;
    this.bossAwakenBanner = null;
    this.sectorDamageTaken = 0;
    this.flameProjectiles = [];
    this.enemyProjectiles = [];
    this.bloodParticles = [];
    this.wallSparks = [];
    this.lootNotifications = [];
    this.shockwaves = [];
    this.floorCracks = [];
    this.meteorStrikes = [];
    this.meteorTimer = 3.5;
    this.flowTimer = 0;
    this.teleportCooldownUntil = 0;
    this.hitStopUntil = 0;
    this.slowMoUntil = 0;
    this.shopOpen = false;
    this.shopNotice = '';
    this.mapOpen = false;
    this.hazards = [];
    this.toxicAccum = 0;
    this.hazardIdleTime = 0;
    this.toxicFlashTime = 0;
    this.hitmarkerUntil = 0;
    this.hitmarkerKillUntil = 0;
    this.combo = { count: 0, lastKill: 0, expires: 0, bannerText: '', bannerUntil: 0, bannerBonus: 0 };
    this.punchCooldownUntil = 0;
    this.kineticCooldownUntil = 0;
    this.counterCooldownUntil = 0;
    this.dashCooldownUntil = 0;
    this.playerDashUntil = 0;
    this.kineticFlashUntil = 0;
    this.auraTickTimer = 0;
    this.punchAnimUntil = 0;
    this.punchSide = 1;
    this.player.hasKey = false;
    this.player.invulnerableUntil = 0;
    this.levelStartTime = performance.now();
    this.sectorEvent = this.getSectorEventForLevel(this.level);

    const { startPos, emptyCells, exitDoor } = this.generateProceduralMap(this.level);
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.exitDoor = exitDoor;
    this.initAutomap();
    this.generateSectorHazards(emptyCells, exitDoor);
    this.runStats.secretsTotal += 2;

    // Suministros repartidos por el sector: más munición que antes, sin inundar el mapa
    this.medkits = [];
    this.ammoPacks = [];
    this.coins = [];
    const farFloorCells = emptyCells.filter(
      (c) =>
        distance(c.x, c.y, this.player.x, this.player.y) > 9 &&
        !this.isCellInsideArena(c.x, c.y)
    );
    const takeCell = () => {
      if (farFloorCells.length === 0) return null;
      return farFloorCells.splice(Math.floor(Math.random() * farFloorCells.length), 1)[0];
    };

    const ammoPacksCount = 1 + Math.floor((this.level - 1) / 3);
    for (let i = 0; i < ammoPacksCount; i++) {
      const cell = takeCell();
      if (!cell) break;
      this.ammoPacks.push({
        x: cell.x,
        y: cell.y,
        amount: CONFIG.FLOOR_AMMO_AMOUNT + Math.floor(this.level / 2),
        fuelAmount: CONFIG.FLOOR_FUEL_AMOUNT,
        active: true
      });
    }

    const medkitCount = this.level >= 5 && Math.random() < CONFIG.FLOOR_MEDKIT_CHANCE ? 2 : 1;
    for (let i = 0; i < medkitCount; i++) {
      if (i > 0 && Math.random() > CONFIG.FLOOR_MEDKIT_CHANCE) break;
      const cell = takeCell();
      if (!cell) break;
      this.medkits.push({ x: cell.x, y: cell.y, active: true });
    }

    if (this.player.ammo === 0 && this.player.reserve === 0) this.player.ammo = 6;

    // Escalado dinámico de dificultad: combina el sector actual + la presión por mejoras acumuladas
    const totalUpgrades = this.getTotalUpgradeRanks();
    const upgP = CONFIG.UPGRADE_PRESSURE;
    const extraEnemies = Math.floor(totalUpgrades * upgP.EXTRA_ENEMIES) + (this.sectorEvent?.type === 'AMBUSH' ? 3 : 0);

    this.enemies = [];
    const spawns = emptyCells.filter(
      (c) =>
        distance(c.x, c.y, this.player.x, this.player.y) > 7.5 &&
        !this.isCellInsideArena(c.x, c.y)
    );
    const count = Math.min(
      CONFIG.MAX_REGULAR_ENEMIES + 7,
      CONFIG.BASE_ENEMIES + Math.floor(this.level * CONFIG.ENEMIES_PER_LEVEL) + extraEnemies
    );
    const hpScale = 1 + (this.level - 1) * CONFIG.LEVEL_HP_SCALE + totalUpgrades * upgP.HP;
    const dmgScale = 1 + (this.level - 1) * CONFIG.LEVEL_DMG_SCALE + totalUpgrades * upgP.DAMAGE;
    const spdScale = 1 + (this.level - 1) * CONFIG.LEVEL_SPEED_SCALE + totalUpgrades * upgP.SPEED;
    this.pressurePct = Math.round((hpScale - 1) * 100);

    const maxSummoners = this.level >= 6 ? 2 : 1;
    let summonersSpawned = 0;
    let lostSoulPackSpawned = false;
    let nextEnemyId = 1;

    const buildRegularEnemy = (specKey, pos, isElite = false) => {
      const cfg = CONFIG.ENEMIES[specKey] || CONFIG.ENEMIES.IMP;
      const eliteHpMult = isElite ? 1.7 : 1;
      const eliteDmgMult = isElite ? 1.3 : 1;
      const eliteSpeedMult = isElite ? 1.08 : 1;
      return {
        id: nextEnemyId++,
        x: pos.x,
        y: pos.y,
        kind: specKey,
        elite: isElite,
        movePattern: specKey === 'IMP' || specKey === 'REVENANT' ? 'STRAFE'
          : (specKey === 'CACODEMON' ? 'HOVER'
            : (specKey === 'LOST_SOUL' || specKey === 'PINKY' ? 'RUSH' : (specKey === 'SUMMONER' ? 'FLEE' : 'MARCH'))),
        anims: this.animSets[specKey] || this.animSets.IMP,
        health: cfg.hp * hpScale * eliteHpMult,
        maxHealth: cfg.hp * hpScale * eliteHpMult,
        speedMultiplier: cfg.speed * spdScale * eliteSpeedMult,
        damage: Math.round(cfg.meleeDmg * dmgScale * eliteDmgMult),
        projSpeed: (cfg.projSpeed || 0) * (1 + totalUpgrades * 0.015),
        projDamage: Math.round((cfg.projDmg || 0) * dmgScale * eliteDmgMult),
        painChance: Math.max(0.12, cfg.painChance - (isElite ? 0.12 : 0)),
        scale: cfg.scale * (isElite ? 1.16 : 1),
        zOffset: (specKey === 'CACODEMON' || specKey === 'LOST_SOUL') ? -0.14 : 0,
        isBoss: false,
        holdsKey: false,
        holdsArsenal: false,
        alive: true,
        state: 'ALIVE',
        alerted: this.sectorEvent?.type !== 'PATROL',
        wasRevived: false,
        targetEnemy: null,
        burnTimer: 0,
        burnTick: 0,
        deathTimer: 0,
        hitFlash: 0,
        painTimer: 0,
        stunTimer: 0,
        knockVx: 0,
        knockVy: 0,
        wallSlammed: false,
        shieldFlash: 0,
        facingAngle: Math.atan2(this.player.y - pos.y, this.player.x - pos.x),
        gloryArmed: false,
        gloryUntil: 0,
        revivesLeft: specKey === 'SUMMONER' ? CONFIG.SUMMONER_REVIVES + Math.floor(this.level / 6) : 0,
        reviveCd: specKey === 'SUMMONER' ? 2.4 + Math.random() * 2.2 : 0,
        reviveCount: 0,
        rangedCooldown: cfg.rangedCd[0] + Math.random() * (cfg.rangedCd[1] - cfg.rangedCd[0]),
        dashChance: Math.min(0.85, (cfg.dashChance || 0) + (this.level - 1) * 0.03 + totalUpgrades * 0.015),
        dashCooldown: 1.8 + Math.random() * 2.6,
        dashTime: 0,
        dashDirX: 0,
        dashDirY: 0,
        walkCycle: Math.random() * 10,
        strafeDir: nextEnemyId % 2 === 0 ? 1 : -1,
        growlTimer: 2 + Math.random() * 4,
        cooldown: 0
      };
    };
    this.buildRegularEnemy = buildRegularEnemy;

    const eliteChance =
      CONFIG.ELITE_CHANCE +
      Math.max(0, this.level - CONFIG.ELITE_START_LEVEL) * 0.025 +
      totalUpgrades * upgP.ELITE;

    for (let i = 0; i < count && spawns.length > 0; i++) {
      let chosenIdx = Math.floor(Math.random() * spawns.length);
      for (let attempt = 0; attempt < 30; attempt++) {
        const testIdx = Math.floor(Math.random() * spawns.length);
        if (!this.enemies.some((e) => distance(e.x, e.y, spawns[testIdx].x, spawns[testIdx].y) < CONFIG.MIN_ENEMY_SPACING)) {
          chosenIdx = testIdx;
          break;
        }
      }
      const pos = spawns.splice(chosenIdx, 1)[0];
      const isElite = (this.level >= CONFIG.ELITE_START_LEVEL || totalUpgrades >= 2) && Math.random() < eliteChance;

      let specKey;
      if (this.level >= 3 && i === 1 && summonersSpawned < maxSummoners) {
        specKey = 'SUMMONER';
        summonersSpawned++;
      } else if (this.level >= 3 && i === 0 && !lostSoulPackSpawned) {
        specKey = 'LOST_SOUL';
        lostSoulPackSpawned = true;
      } else if (this.level >= 3 && summonersSpawned < maxSummoners && Math.random() < 0.08) {
        specKey = 'SUMMONER';
        summonersSpawned++;
      } else if (this.level >= 4 && Math.random() < 0.16) {
        specKey = 'REVENANT';
      } else if (this.level >= 2 && Math.random() < 0.18) {
        specKey = 'PINKY';
      } else if ((this.level >= 3 || totalUpgrades >= 2) && Math.random() < 0.16 + totalUpgrades * 0.01) {
        specKey = 'SHIELD';
      } else {
        const roll = Math.random();
        specKey = isElite ? 'BRUTE' : (roll < 0.44 ? 'IMP' : (roll < 0.78 ? 'CACODEMON' : 'BRUTE'));
      }

      const allowElite = isElite && !['SUMMONER', 'LOST_SOUL', 'SHIELD'].includes(specKey);
      this.enemies.push(buildRegularEnemy(specKey, pos, allowElite));

      if (specKey === 'LOST_SOUL') {
        const offsets = [[0.55, 0.2], [-0.5, 0.4], [0.2, -0.5]];
        for (let pack = 1; pack < CONFIG.LOST_SOUL_PACK; pack++) {
          const offset = offsets[(pack - 1) % offsets.length];
          const px = pos.x + offset[0];
          const py = pos.y + offset[1];
          this.enemies.push(buildRegularEnemy('LOST_SOUL', this.isWall(px, py) ? pos : { x: px, y: py }, false));
        }
      }
    }

    // Curva progresiva de Bosses: 0.0 en el Sector 1 -> 1.0 en el Sector 10 + presión por mejoras
    const tier = (this.level - 1) / Math.max(1, MAX_LEVELS - 1);
    const bossUpgradeMult = 1 + totalUpgrades * upgP.BOSS_HP;
    const bossHpMult = (1 + tier * 1.55) * bossUpgradeMult;
    const bossSpdMult = 1 + tier * 0.62 + totalUpgrades * 0.015;
    const bossDmgMult = 1 + tier * 0.75 + totalUpgrades * 0.03;

    const archetypes = ['PYROMANCER', 'SUMMONER_LORD', 'CYBER_ARTILLERY', 'VOID_STALKER'];
    const champArch = archetypes[(this.level + 1) % archetypes.length];
    const bossArch = archetypes[(this.level - 1) % archetypes.length];

    const bossRoster = [
      'INFERNAL PYROMANCER [KEY]',
      'NECRO-ARCHON [KEY]',
      'CYBER-TYRANT [KEY]',
      'VOID STALKER [KEY]',
      'MAGMA COLOSSUS [KEY]',
      'SOUL HARVESTER [KEY]',
      'MECHA-BEHEMOTH [KEY]',
      'ABYSS PHANTOM [KEY]',
      'HELLFIRE MONARCH [KEY]',
      'ICON OF SIN [KEY]'
    ];

    // 1. CAMPEÓN ABISAL (Parado en el centro exacto de su sala hasta que el jugador entra)
    const chCfg = CONFIG.ENEMIES.CHAMPION;
    const champHp = Math.round(chCfg.hp * bossHpMult);
    const chArena = this.championArena || { cx: 10.5, cy: 38.5, bounds: { minX: 5.7, maxX: 14.3, minY: 33.7, maxY: 42.3 } };
    this.enemies.push({
      id: 998,
      x: chArena.cx,
      y: chArena.cy,
      arenaBounds: chArena.bounds,
      kind: 'ARCH-CHAMPION',
      bossArchetype: champArch,
      movePattern: 'BOSS_ADVANCED',
      anims: this.animSets.BOSS_ABYSS,
      dormant: true,
      alerted: true,
      wakeFlash: 0,
      health: champHp,
      maxHealth: champHp,
      speedMultiplier: chCfg.speed * bossSpdMult,
      damage: Math.round(chCfg.meleeDmg * bossDmgMult),
      projSpeed: chCfg.projSpeed + tier * 2.8,
      projDamage: Math.round(chCfg.projDmg * bossDmgMult),
      painChance: Math.max(0.08, chCfg.painChance - tier * 0.16),
      scale: chCfg.scale,
      isBoss: true,
      holdsKey: false,
      holdsArsenal: true,
      alive: true,
      state: 'ALIVE',
      targetEnemy: null,
      burnTimer: 0,
      burnTick: 0,
      bossState: 'CHASE',
      bossTimer: 2.8 - tier * 1.1,
      dashCooldown: 3.4 - tier * 1.8,
      stompCd: 4.5 - tier * 1.5,
      specialCd: 4.8,
      reactDashCd: 0,
      rangedCooldown: 2.6 - tier * 1.0,
      chargeDirX: 0,
      chargeDirY: 0,
      dashDirX: 0,
      dashDirY: 0,
      strafeDir: 1,
      enraged: false,
      deathTimer: 0,
      hitFlash: 0,
      painTimer: 0,
      stunTimer: 0,
      knockVx: 0,
      knockVy: 0,
      wallSlammed: false,
      facingAngle: 0,
      walkCycle: 0,
      growlTimer: 1.8,
      cooldown: 0
    });

    // 2. BOSS GUARDIÁN DE LA LLAVE (Parado en el centro exacto de su sala hasta que el jugador entra)
    const bCfg = CONFIG.ENEMIES.BOSS;
    const bossHp = Math.round(bCfg.hp * bossHpMult);
    const bArena = this.bossArena || { cx: 38.5, cy: 38.5, bounds: { minX: 32.7, maxX: 44.3, minY: 32.7, maxY: 44.3 } };
    this.enemies.push({
      id: 999,
      x: bArena.cx,
      y: bArena.cy,
      arenaBounds: bArena.bounds,
      kind: bossRoster[(this.level - 1) % bossRoster.length],
      bossArchetype: bossArch,
      movePattern: 'BOSS_ADVANCED',
      anims: this.level % 2 === 1 ? this.animSets.BOSS_CYBER : this.animSets.BOSS_ABYSS,
      dormant: true,
      alerted: true,
      wakeFlash: 0,
      health: bossHp,
      maxHealth: bossHp,
      speedMultiplier: bCfg.speed * bossSpdMult,
      damage: Math.round(bCfg.meleeDmg * bossDmgMult),
      projSpeed: bCfg.projSpeed + tier * 3.0,
      projDamage: Math.round(bCfg.projDmg * bossDmgMult),
      painChance: Math.max(0.06, bCfg.painChance - tier * 0.14),
      scale: bCfg.scale,
      isBoss: true,
      holdsKey: true,
      holdsArsenal: false,
      alive: true,
      state: 'ALIVE',
      targetEnemy: null,
      burnTimer: 0,
      burnTick: 0,
      bossState: 'CHASE',
      bossTimer: 2.6 - tier * 1.0,
      dashCooldown: 3.2 - tier * 1.8,
      stompCd: 4.0 - tier * 1.4,
      specialCd: 4.2,
      reactDashCd: 0,
      rangedCooldown: 2.4 - tier * 0.9,
      chargeDirX: 0,
      chargeDirY: 0,
      dashDirX: 0,
      dashDirY: 0,
      strafeDir: -1,
      enraged: false,
      deathTimer: 0,
      hitFlash: 0,
      painTimer: 0,
      stunTimer: 0,
      knockVx: 0,
      knockVy: 0,
      wallSlammed: false,
      facingAngle: 0,
      walkCycle: 0,
      growlTimer: 1.5,
      cooldown: 0
    });

    this.sectorStats = {
      kills: 0,
      totalKills: this.enemies.length,
      items: 0,
      totalItems: this.chests.length + 1,
      secrets: 0,
      totalSecrets: 2
    };

    this.updateFlowField();

    this.ambientEmbers = Array.from({ length: 18 }, () => ({
      x: this.player.x + (Math.random() - 0.5) * 10,
      y: this.player.y + (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 0.8,
      vz: -0.15 - Math.random() * 0.25
    }));

    const sectorName = CONFIG.SECTOR_NAMES[(this.level - 1) % CONFIG.SECTOR_NAMES.length];
    const sectorEventTxt = this.sectorEvent ? ` // EVENTO: ${this.sectorEvent.label}` : '';
    const pressureTxt = totalUpgrades > 0 ? ` // PRESIÓN +${this.pressurePct}%` : '';
    this.onStatus(`SECTOR ${this.level}/${MAX_LEVELS}: ${sectorName} (${this.currentLayoutName || 'GRID'})${sectorEventTxt}${pressureTxt}`);
    if (this.sectorEvent) {
      this.pushLootNotification(
        `⚠️ EVENTO DE SECTOR: ${this.sectorEvent.label}`,
        [this.sectorEvent.detail],
        this.sectorEvent.type === 'DARKNESS' ? '#00b4d8' : '#70e000'
      );
    } else if (this.level === 1) {
      this.pushLootNotification('👊 COMBATE DINÁMICO ACTIVO', ['[V] o Clic Derecho: Puñetazo · [4] Motosierra (40 bajas)'], '#ff4d00');
    } else if (totalUpgrades > 0) {
      this.pushLootNotification(
        `🔥 SECTOR ${this.level}: ${sectorName}`,
        [`PRESIÓN INFERNAL +${this.pressurePct}% POR TUS MEJORAS`],
        '#ffbe0b'
      );
    }
  }

  start({ showBriefing = false } = {}) {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    const snap = this.captureCurrentScreen();
    this.reset();
    this.running = true;
    this.paused = false;
    this.briefingOpen = Boolean(showBriefing);
    this.lastTime = performance.now();
    globalDoomMusic.ensurePlaying();
    this.audio.startAmbience();
    if (!this.briefingOpen) {
      this.startScreenMelt('SECTOR', snap);
    } else {
      this.onStatus('MANUAL TÁCTICO DE COMBATE // Pulsa [ESPACIO], [ENTER] o haz clic para desplegarte');
    }
    this.enterFullscreenOnStart();
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  dismissBriefing() {
    if (!this.briefingOpen) return;
    this.downloadBriefingSnap = this.captureCurrentScreen();
    this.briefingOpen = false;
    this.lastTime = performance.now();
    this.startTime = this.lastTime;
    this.levelStartTime = this.lastTime;
    this.audio.playShotgun();
    this.startScreenMelt('SECTOR', this.downloadBriefingSnap);
    if (this.canvas.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
    const sectorName = CONFIG.SECTOR_NAMES[(this.level - 1) % CONFIG.SECTOR_NAMES.length];
    this.onStatus(`SECTOR ${this.level}/${MAX_LEVELS}: ${sectorName} (${this.currentLayoutName || 'GRID'}) // ¡COMBATE ACTIVO!`);
  }

  enterFullscreenOnStart() {
    const target = this.canvas.parentElement || this.canvas;
    const reqTarget = target.requestFullscreen ? target : this.canvas;
    if (!document.fullscreenElement && reqTarget.requestFullscreen) {
      reqTarget.requestFullscreen()
        .then(() => {
          this.updateFullscreenLayout();
          if (this.running && !this.paused && !this.briefingOpen && !this.intermission && !this.deathSequence && !this.victorySequence && this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock();
          }
        })
        .catch(() => {
          if (this.running && !this.paused && !this.briefingOpen && !this.intermission && this.canvas.requestPointerLock) {
            this.canvas.requestPointerLock();
          }
        });
    } else if (this.running && !this.paused && !this.briefingOpen && !this.intermission && this.canvas.requestPointerLock) {
      this.canvas.requestPointerLock();
    }
  }

  quitWithoutSaving() {
    this.running = false;
    this.paused = false;
    this.finished = true;
    this.briefingOpen = false;
    this.intermission = null;
    this.deathSequence = null;
    this.victorySequence = null;
    this.melt = null;
    this.mouseDown = false;
    this.audio.stopAmbience();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    this.renderAttractScreen();
    this.onStatus('Partida abandonada (No se ha guardado la puntuación)');
    const overlay = document.getElementById('game-overlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  destroy() {
    this.running = false;
    this.mouseDown = false;
    this.briefingOpen = false;
    this.melt = null;
    this.deathSequence = null;
    this.victorySequence = null;
    this.audio.stopAmbience();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  cycleMouseSensitivity(dir = 1) {
    const steps = [0.65, 0.85, 1.0, 1.25, 1.5, 1.8];
    let idx = steps.findIndex((s) => Math.abs(s - (this.mouseSens || 1.0)) < 0.05);
    if (idx === -1) idx = 2;
    idx = (idx + dir + steps.length) % steps.length;
    this.mouseSens = steps[idx];
    this.audio.playTallyTick();
  }

  handleKeyDown(e) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
    this.keys.add(e.code);

    if (e.code === 'KeyF' && !e.repeat) {
      this.toggleFullscreen();
      return;
    }

    if (this.briefingOpen) {
      if (['Space', 'Enter', 'KeyE', 'Escape', 'KeyH'].includes(e.code) && !e.repeat) {
        e.preventDefault();
        this.dismissBriefing();
      }
      return;
    }

    if (e.code === 'KeyH' && !e.repeat && this.running && !this.paused && !this.intermission && !this.shopOpen && !this.deathSequence && !this.victorySequence) {
      this.briefingOpen = true;
      this.mouseDown = false;
      this.onStatus('MANUAL TÁCTICO DE COMBATE // Pulsa [ESPACIO], [ENTER] o haz clic para volver');
      return;
    }

    if (this.victorySequence) {
      if (!this.melt && performance.now() - this.victorySequence.startTime > 650 && ['Space', 'Enter', 'Escape', 'KeyE'].includes(e.code)) {
        this.finalizeMatch(true);
      }
      return;
    }

    if (this.deathSequence) {
      if (!this.melt && performance.now() - this.deathSequence.startTime > 650 && ['Space', 'Enter', 'Escape', 'KeyE'].includes(e.code)) {
        this.finalizeMatch(false);
      }
      return;
    }

    if (this.shopOpen) {
      if (e.code === 'KeyE' || e.code === 'Escape') {
        e.preventDefault();
        this.closeShop();
        return;
      }
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].includes(e.code)) {
        this.buyMerchantItem(Number(e.code.slice(-1)));
        return;
      }
      if (e.code === 'Space') e.preventDefault();
      return;
    }

    if (this.intermission) {
      if (e.code === 'Digit1' || e.code === 'Digit2' || e.code === 'Digit3') {
        this.selectUpgrade(Number(e.code.slice(-1)) - 1);
        return;
      }
      if (e.code === 'KeyR' && !e.repeat) {
        this.rerollIntermissionUpgrades();
        return;
      }
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyE') {
        e.preventDefault();
        const im = this.intermission;
        if (im.upgradeChoices?.length > 0 && !im.upgradeSelected) {
          this.audio.playEmptyClip();
          this.onStatus(`ALTAR DE MEJORA: elige [1]${im.upgradeChoices.length >= 3 ? ', [2] o [3]' : ' o [2]'} antes de desplegarte`);
          return;
        }
        this.advanceFromIntermission();
        return;
      }
      return;
    }

    if (e.code === 'Tab') {
      if (this.running && !this.paused && !this.finished && !this.shopOpen) {
        e.preventDefault();
        this.mapOpen = !this.mapOpen;
        this.lastTime = performance.now();
        this.mouseDown = false;
        this.onStatus(this.mapOpen ? 'AUTOMAPA ABIERTO // [TAB] CERRAR' : 'AUTOMAPA CERRADO');
      }
      return;
    }
    if (this.mapOpen) return;

    if (e.code === 'Escape' && this.running && !this.finished && !this.intermission) {
      if (!this.paused) this.pause();
      else this.resume();
      return;
    }
    if (this.paused) {
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        this.pauseMenuIndex = (this.pauseMenuIndex + 4) % 5;
        this.audio.playTallyTick();
        this.drawPauseScreen();
        return;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        this.pauseMenuIndex = (this.pauseMenuIndex + 1) % 5;
        this.audio.playTallyTick();
        this.drawPauseScreen();
        return;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA' || e.code === 'ArrowRight' || e.code === 'KeyD') {
        const dir = (e.code === 'ArrowRight' || e.code === 'KeyD') ? 1 : -1;
        if (this.pauseMenuIndex === 2) {
          this.cycleMouseSensitivity(dir);
          this.drawPauseScreen();
        } else if (this.pauseMenuIndex === 3) {
          this.reducedEffects = !this.reducedEffects;
          this.audio.playTallyTick();
          this.drawPauseScreen();
        }
        return;
      }
      if (e.code === 'Enter' || e.code === 'Space') {
        if (this.pauseMenuIndex === 0) {
          this.resume();
          if (this.canvas.requestPointerLock) this.canvas.requestPointerLock();
        } else if (this.pauseMenuIndex === 1) {
          this.toggleFullscreen();
        } else if (this.pauseMenuIndex === 2) {
          this.cycleMouseSensitivity(1);
          this.drawPauseScreen();
        } else if (this.pauseMenuIndex === 3) {
          this.reducedEffects = !this.reducedEffects;
          this.audio.playTallyTick();
          this.drawPauseScreen();
        } else if (this.pauseMenuIndex === 4) {
          this.quitWithoutSaving();
        }
        return;
      }
      if (e.code === 'KeyQ') {
        this.quitWithoutSaving();
        return;
      }
      return;
    }

    if (!this.paused && this.running && !this.intermission) {
      if (e.code === 'Digit1') this.selectWeapon(1);
      if (e.code === 'Digit2') this.selectWeapon(2);
      if (e.code === 'Digit3') this.selectWeapon(3);
      if (e.code === 'Digit4') this.selectWeapon(4);
      if (e.code === 'KeyE' && !e.repeat) this.interact();
      if ((e.code === 'KeyV' || e.code === 'KeyB') && !e.repeat) this.triggerPunch(false);
      if ((e.code === 'KeyC' || e.code === 'AltLeft') && !e.repeat) this.triggerPlayerDash(performance.now());
    }
    if (e.code === 'Space' && !e.repeat && !this.intermission) this.shoot();
    if (e.code === 'KeyR' && !e.repeat && !this.intermission) this.reload();
  }

  handleKeyUp(e) {
    this.keys.delete(e.code);
  }

  handleMouseMove(e) {
    if (this.running && !this.paused && !this.intermission && !this.mapOpen && !this.deathSequence && !this.victorySequence && document.pointerLockElement === this.canvas) {
      this.player.angle += e.movementX * 0.0023 * (this.mouseSens || 1.0);
    }
  }

  handlePointerLockChange() {
    const locked = document.pointerLockElement === this.canvas;
    if (
      this.wasPointerLocked &&
      !locked &&
      this.running &&
      !this.finished &&
      !this.paused &&
      !this.intermission &&
      !this.shopOpen &&
      !this.mapOpen &&
      !this.deathSequence &&
      !this.victorySequence
    ) {
      this.pause();
    }
    this.wasPointerLocked = locked;
  }

  pause() {
    this.paused = true;
    this.pauseMenuIndex = 0;
    this.mouseDown = false;
    this.mapOpen = false;
    this.audio.setAmbiencePaused(true);
    this.onStatus('Pausado (ESC/Enter: Seguir | F: Pantalla Completa / Minimizar | Q: Salir)');
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.drawPauseScreen();
  }

  resume() {
    if (!this.running || this.finished) return;
    this.paused = false;
    this.audio.setAmbiencePaused(false);
    this.lastTime = performance.now();
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  findGloryTarget(range = CONFIG.GLORY_RANGE) {
    if (!this.player) return null;
    const now = performance.now();
    let best = null;
    let bestDist = Infinity;
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.isBoss || !(enemy.gloryUntil > now)) continue;
      const d = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d <= range && d < bestDist) {
        best = enemy;
        bestDist = d;
      }
    }
    return best;
  }

  executeGloryKill(enemy, viaChainsaw = false) {
    if (!enemy || !enemy.alive) return false;
    const now = performance.now();
    enemy.gloryUntil = 0;
    enemy.gloryArmed = true;
    this.player.health = Math.min(CONFIG.MAX_SOUL_HEALTH, this.player.health + CONFIG.GLORY_HEAL);
    this.player.invulnerableUntil = now + CONFIG.GLORY_INVULN_MS;
    this.audio.playGloryKill();
    this.screenShake = Math.max(this.screenShake, 0.4);
    this.spawnBlood(enemy.x, enemy.y, 22, '#00b4d8');
    this.spawnBlood(enemy.x, enemy.y, 14, '#ff4d00');
    this.killEnemy(enemy, viaChainsaw ? 'CHAINSAW' : 'GLORY');
    this.hitmarkerKillUntil = now + 240;
    this.pushLootNotification(
      '💀 EJECUCIÓN DE GLORIA',
      [`+${CONFIG.GLORY_HEAL} SALUD · ${CONFIG.GLORY_INVULN_MS / 1000}s DE INVULNERABILIDAD`],
      '#00b4d8'
    );
    this.onStatus(`💀 ¡EJECUCIÓN${viaChainsaw ? ' CON MOTOSIERRA' : ''}! +${CONFIG.GLORY_HEAL} salud y 1s de invulnerabilidad`);
    return true;
  }

  interact() {
    if (!this.player) return;

    const gloryTarget = this.findGloryTarget();
    if (gloryTarget) {
      this.executeGloryKill(gloryTarget, false);
      return;
    }

    if (this.merchant && distance(this.player.x, this.player.y, this.merchant.x, this.merchant.y) < 2.4) {
      this.openShop();
      return;
    }

    for (const door of this.doors.values()) {
      if (distance(this.player.x, this.player.y, door.x + 0.5, door.y + 0.5) < 2.8 && door.target === 0) {
        door.target = 1;
        if (door.isSecret && !door.discovered) {
          door.discovered = true;
          this.sectorStats.secrets++;
          this.runStats.secretsFound = (this.runStats.secretsFound || 0) + 1;
          this.audio.playSecretFound();
          this.pushLootNotification('¡CÁMARA SECRETA DESCUBIERTA!', ['MURO OCULTO DESLIZADO'], '#00f5d4');
          this.onStatus('🔥 ¡SECRETO DESCUBIERTO! Muro oculto deslizado');
        } else if (door.isBossGate) {
          this.audio.playDoorSlide();
          this.onStatus('👁️ COMPUERTA DE ARENA ABIERTA: El Boss aguarda inmóvil en el centro. Entra para combatir');
        } else {
          this.audio.playDoorSlide();
          this.onStatus('Compuerta blindada UAC abierta');
        }
      }
    }
    for (const chest of this.chests) {
      if (!chest.opened && distance(this.player.x, this.player.y, chest.x, chest.y) < 1.85) {
        this.openChest(chest);
      }
    }
  }

  isPlayerInBossArena(enemy) {
    if (!enemy || !enemy.arenaBounds) return false;
    const b = enemy.arenaBounds;
    return (
      this.player.x >= b.minX &&
      this.player.x <= b.maxX &&
      this.player.y >= b.minY &&
      this.player.y <= b.maxY
    );
  }

  awakenBoss(enemy, now = performance.now()) {
    if (!enemy || !enemy.alive || !enemy.dormant) return;
    enemy.dormant = false;
    enemy.wakeFlash = 0.85;
    enemy.bossState = 'CHASE';
    enemy.bossTimer = 1.5;
    this.audio.playBossAwaken();
    this.screenShake = Math.max(this.screenShake, 0.55);
    this.shockwaves.push({
      x: enemy.x,
      y: enemy.y,
      radius: 0.4,
      maxRadius: 4.2,
      life: 0.55,
      maxLife: 0.55,
      color: '#ff0055'
    });
    this.spawnWallSparks(enemy.x, enemy.y, 18, '#ffbe0b');
    this.bossAwakenBanner = {
      name: enemy.kind,
      sub: enemy.holdsKey ? '¡GUARDIÁN DE LA LLAVE ACTIVADO!' : '¡SEÑOR DE LA ARENA DESPIERTA!',
      until: now + 2400
    };
    this.pushLootNotification(
      `👁️ ¡${enemy.kind} DESPIERTA!`,
      ['HAS ENTRADO EN LA ARENA · EL BOSS PASA AL ATAQUE'],
      '#d90429'
    );
    this.onStatus(`⚠️ ¡${enemy.kind} SE HA ACTIVADO Y TE ATACA!`);
  }

  applyKnockback(enemy, dirX, dirY, force, stunSec = 0.45) {
    if (!enemy || !enemy.alive) return;
    const len = Math.hypot(dirX, dirY) || 1;
    const nx = dirX / len;
    const ny = dirY / len;
    const mult = enemy.isBoss ? 0.36 : (enemy.kind === 'SHIELD' ? 0.72 : 1.0);
    enemy.knockVx = (enemy.knockVx || 0) + nx * force * mult;
    enemy.knockVy = (enemy.knockVy || 0) + ny * force * mult;
    enemy.wallSlammed = false;
    enemy.stunTimer = Math.max(enemy.stunTimer || 0, enemy.isBoss ? stunSec * 0.35 : stunSec);
    enemy.painTimer = Math.max(enemy.painTimer || 0, 0.24);
  }

  triggerPunch(isAutoCounter = false) {
    if (!this.running || this.paused || this.finished || this.intermission || this.shopOpen || this.mapOpen || this.deathSequence) return false;
    const now = performance.now();
    if (!isAutoCounter && now < this.punchCooldownUntil) return false;

    const fistRank = this.getUpgradeRank('POWER_FIST');
    const empowered = fistRank > 0 || isAutoCounter;
    if (!isAutoCounter) {
      this.punchCooldownUntil = now + (fistRank > 0 ? 520 : CONFIG.PUNCH_COOLDOWN_MS);
    }
    this.punchAnimUntil = now + 280;
    this.punchEmpowered = empowered;
    this.punchSide *= -1;
    this.recoil = Math.max(this.recoil, empowered ? 0.44 : 0.24);
    this.screenShake = Math.max(this.screenShake, empowered ? 0.34 : 0.16);
    this.audio.playPunch(empowered);
    this.runStats.punches = (this.runStats.punches || 0) + 1;

    const dmgMult = now < this.player.berserkUntil ? 2.0 : 1.0;
    const range = fistRank > 0
      ? CONFIG.PUNCH_UPGRADE_RANGE + (fistRank - 1) * 0.45
      : (isAutoCounter ? 1.85 : CONFIG.PUNCH_RANGE);
    const baseDmg = fistRank > 0
      ? CONFIG.PUNCH_UPGRADE_DAMAGE * (1 + (fistRank - 1) * 0.35)
      : (isAutoCounter ? 2.5 : CONFIG.PUNCH_DAMAGE);
    const force = fistRank > 0
      ? CONFIG.PUNCH_UPGRADE_KNOCKBACK * (1 + (fistRank - 1) * 0.25)
      : (isAutoCounter ? 6.8 : CONFIG.PUNCH_KNOCKBACK);
    const cone = isAutoCounter ? Math.PI : (fistRank >= 2 ? 0.98 : 0.72);

    const candidates = [];
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const d = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d > range) continue;
      const ang = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
      const delta = Math.abs(Math.atan2(Math.sin(ang - this.player.angle), Math.cos(ang - this.player.angle)));
      if (delta <= cone || d < 0.95) {
        if (this.lineOfSight(this.player.x, this.player.y, enemy.x, enemy.y)) {
          candidates.push({ enemy, d, ang });
        }
      }
    }
    candidates.sort((a, b) => a.d - b.d);

    const targets = (fistRank >= 2 || (isAutoCounter && this.getUpgradeRank('COUNTER_STRIKE') >= 2))
      ? candidates
      : candidates.slice(0, 1);

    if (targets.length > 0) {
      this.hitmarkerUntil = now + 130;
      this.audio.playHitmarker();
      for (const { enemy, ang } of targets) {
        if (enemy.isBoss && enemy.dormant) this.awakenBoss(enemy, now);
        enemy.health -= baseDmg * dmgMult;
        enemy.hitFlash = 0.22;
        enemy.shieldFlash = 0;
        this.applyKnockback(enemy, Math.cos(ang), Math.sin(ang), force, empowered ? 0.9 : 0.45);
        this.spawnBlood(enemy.x, enemy.y, empowered ? 18 : 10);
        this.spawnWallSparks(enemy.x, enemy.y, empowered ? 10 : 5, empowered ? '#ff4d00' : '#ffbe0b');
        if (enemy.health <= 0) {
          this.killEnemy(enemy, 'PUNCH');
        }
      }
      if (empowered) {
        const hitX = targets[0].enemy.x;
        const hitY = targets[0].enemy.y;
        this.shockwaves.push({
          x: hitX,
          y: hitY,
          radius: 0.25,
          maxRadius: fistRank >= 2 ? 2.4 : 1.5,
          life: 0.32,
          maxLife: 0.32,
          color: isAutoCounter ? '#ffbe0b' : '#ff4d00'
        });
      }
      if (isAutoCounter) {
        this.onStatus('🥊 ¡CONTRAGOLPE AUTOMÁTICO! Demonio repelido y aturdido');
      } else if (fistRank > 0) {
        this.onStatus('👊 ¡PUÑO INFERNAL! Demonio lanzado hacia atrás');
      }
      return true;
    }

    const hx = this.player.x + Math.cos(this.player.angle) * 0.9;
    const hy = this.player.y + Math.sin(this.player.angle) * 0.9;
    if (this.isWall(hx, hy)) {
      this.spawnWallSparks(hx, hy, 5, '#ffbe0b');
    }
    return false;
  }

  triggerKineticBurst(now = performance.now(), fromDamage = true) {
    const rank = this.getUpgradeRank('KINETIC_BURST');
    if (rank <= 0 || now < this.kineticCooldownUntil) return false;

    const idx = Math.min(rank - 1, 1);
    this.kineticCooldownUntil = now + CONFIG.KINETIC_COOLDOWN_MS[idx];
    this.kineticFlashUntil = now + 260;
    this.screenShake = Math.max(this.screenShake, 0.45);
    this.audio.playKineticBurst();

    // SINERGIA: PULSO CINÉTICO + BLINDAJE REACTIVO = regenera +8% de blindaje al detonar
    if (this.hasUpgrade('REACTIVE_ARMOR')) {
      this.player.armor = Math.min(100, (this.player.armor || 0) + 8);
    }

    const radius = CONFIG.KINETIC_RADIUS[idx];
    const dmg = CONFIG.KINETIC_DAMAGE[idx];
    const force = CONFIG.KINETIC_FORCE[idx];

    this.shockwaves.push({
      x: this.player.x,
      y: this.player.y,
      radius: 0.35,
      maxRadius: radius,
      life: 0.45,
      maxLife: 0.45,
      color: '#00f5d4'
    });

    let hitCount = 0;
    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const d = distance(this.player.x, this.player.y, enemy.x, enemy.y);
      if (d <= radius) {
        if (enemy.isBoss && enemy.dormant) this.awakenBoss(enemy, now);
        hitCount++;
        const dx = enemy.x - this.player.x;
        const dy = enemy.y - this.player.y;
        enemy.health -= dmg * (1 - (d / radius) * 0.35);
        enemy.hitFlash = 0.22;
        this.applyKnockback(enemy, dx, dy, force, 0.85 + idx * 0.3);
        this.spawnWallSparks(enemy.x, enemy.y, 7, '#00f5d4');
        if (enemy.health <= 0) {
          this.killEnemy(enemy, 'KINETIC');
        }
      }
    }

    if (rank >= 2) {
      for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
        const ep = this.enemyProjectiles[i];
        if (distance(this.player.x, this.player.y, ep.x, ep.y) <= radius) {
          this.spawnWallSparks(ep.x, ep.y, 6, '#00f5d4');
          this.enemyProjectiles.splice(i, 1);
        }
      }
    }

    if (hitCount > 0 || fromDamage) {
      this.onStatus(`⚡ ¡PULSO CINÉTICO ACTIVADO! ${hitCount} demonio${hitCount === 1 ? '' : 's'} repelido${hitCount === 1 ? '' : 's'}${this.hasUpgrade('REACTIVE_ARMOR') ? ' (SINERGIA +8% ARMOR)' : ''}`);
    }
    return true;
  }

  triggerPlayerDash(now = performance.now()) {
    if (!this.running || this.paused || this.finished || this.intermission || this.shopOpen || this.mapOpen || this.deathSequence) return false;
    const rank = this.getUpgradeRank('SHOCK_DASH');
    if (rank <= 0) {
      this.audio.playEmptyClip();
      this.onStatus('EMBESTIDA [C] BLOQUEADA: desbloquéala en el Altar de Mejoras al final del sector');
      return false;
    }
    if (now < this.dashCooldownUntil) return false;

    const idx = Math.min(rank - 1, 1);
    this.dashCooldownUntil = now + CONFIG.DASH_COOLDOWN_MS[idx];
    this.playerDashUntil = now + CONFIG.DASH_DURATION_MS;
    this.playerDashHitIds = new Set();
    this.player.invulnerableUntil = Math.max(this.player.invulnerableUntil || 0, now + 340);
    this.screenShake = Math.max(this.screenShake, 0.28);
    this.audio.playDash();
    this.onStatus('⚡ ¡EMBESTIDA DEMONÍACA! Arrollando hostiles a tu paso');
    return true;
  }

  // Cofres de suministros con munición, gasolina, monedas y curación aleatoria
  openChest(chest) {
    chest.opened = true;
    this.sectorStats.items++;
    const now = performance.now();
    this.audio.playChestOpen();
    this.pickupFlashTime = now;
    this.evilGrinUntil = now + 1400;

    const gainedItems = [];
    const ammoAdd = randInt(CONFIG.CHEST_AMMO_RANGE[0], CONFIG.CHEST_AMMO_RANGE[1]);
    const fuelAdd = randInt(CONFIG.CHEST_FUEL_RANGE[0], CONFIG.CHEST_FUEL_RANGE[1]);
    const coinAdd = randInt(CONFIG.CHEST_COIN_RANGE[0], CONFIG.CHEST_COIN_RANGE[1]);

    this.player.reserve = Math.min(this.getMaxReserve(), this.player.reserve + ammoAdd);
    this.player.fuel = Math.min(MAX_FUEL, this.player.fuel + fuelAdd);
    this.player.coins = (this.player.coins || 0) + coinAdd;
    gainedItems.push(`+${ammoAdd} CARTUCHOS · +${fuelAdd}% GASOLINA · +${coinAdd} MONEDAS`);

    if (Math.random() < CONFIG.CHEST_HEALTH_CHANCE) {
      this.player.health = Math.min(100, this.player.health + CONFIG.CHEST_HEALTH_AMOUNT);
      gainedItems.push(`+${CONFIG.CHEST_HEALTH_AMOUNT}% SALUD DE EMERGENCIA`);
    }
    if (Math.random() < CONFIG.CHEST_ARMOR_CHANCE) {
      this.player.armor = Math.min(100, (this.player.armor || 0) + CONFIG.CHEST_ARMOR_AMOUNT);
      gainedItems.push(`+${CONFIG.CHEST_ARMOR_AMOUNT}% PLACA DE BLINDAJE`);
    }

    this.pushLootNotification('📦 ¡COFRE UAC ABIERTO!', gainedItems, '#ffbe0b');
    this.spawnBlood(chest.x, chest.y, 12, '#ffbe0b');
    this.onStatus(`¡COFRE UAC! ${gainedItems.join(' · ')}`);
  }

  merchantItems() {
    const m = CONFIG.MERCHANT;
    const modCount = this.runStats?.weaponMods || 0;
    const modPrice = m.WEAPON_MOD.price + modCount * 10;
    return [
      {
        ...m.AMMO,
        canBuy: () => this.player.reserve < this.getMaxReserve(),
        apply: () => { this.player.reserve = Math.min(this.getMaxReserve(), this.player.reserve + m.AMMO.amount); }
      },
      {
        ...m.HEALTH,
        canBuy: () => this.player.health < 100,
        apply: () => { this.player.health = Math.min(100, this.player.health + m.HEALTH.amount); }
      },
      {
        ...m.ARMOR,
        canBuy: () => (this.player.armor || 0) < 100,
        apply: () => { this.player.armor = Math.min(100, (this.player.armor || 0) + m.ARMOR.amount); }
      },
      {
        ...m.FUEL,
        canBuy: () => this.player.fuel < MAX_FUEL,
        apply: () => { this.player.fuel = Math.min(MAX_FUEL, this.player.fuel + m.FUEL.amount); }
      },
      {
        ...m.WEAPON_MOD,
        price: modPrice,
        detail: `+12% daño de armas (Actual: +${Math.round((this.weaponDamageBonus || 0) * 100)}%)`,
        canBuy: () => modCount < 5,
        apply: () => {
          this.weaponDamageBonus = (this.weaponDamageBonus || 0) + 0.12;
          this.runStats.weaponMods = (this.runStats.weaponMods || 0) + 1;
        }
      }
    ];
  }

  openShop() {
    if (this.shopOpen) return;
    this.shopOpen = true;
    this.mouseDown = false;
    this.wasPointerLocked = false;
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    this.shopNotice = 'ELIGE CON [1]-[5] · [E] O [ESC] PARA SALIR';
    this.audio.playChestOpen();
    this.onStatus('MERCADER DE ALMAS: compra suministros o templa tu arsenal con [1]-[5]');
  }

  closeShop() {
    if (!this.shopOpen) return;
    this.shopOpen = false;
    this.shopNotice = '';
    this.onStatus('Has salido del mercader');
  }

  buyMerchantItem(index) {
    if (!this.shopOpen) return;
    const item = this.merchantItems()[index - 1];
    if (!item) return;

    if (!item.canBuy()) {
      this.shopNotice = 'YA ESTÁ AL MÁXIMO AHORA MISMO';
      this.audio.playEmptyClip();
      return;
    }
    if ((this.player.coins || 0) < item.price) {
      this.shopNotice = `FALTAN ${item.price - (this.player.coins || 0)} MONEDAS`;
      this.audio.playEmptyClip();
      return;
    }

    this.player.coins -= item.price;
    item.apply();
    this.audio.playPickup();
    this.shopNotice = `COMPRADO: ${item.label} (-${item.price} MONEDAS)`;
    this.onStatus(`MERCADER: ${item.label} comprado por ${item.price} monedas`);
  }

  damagePlayer(rawAmount, sourceX = null, sourceY = null, now = performance.now()) {
    if (now < (this.player.invulnerableUntil || 0) || this.deathSequence || this.victorySequence) return;
    let dmg = rawAmount;
    if (this.player.armor > 0) {
      const absorbRate = this.hasUpgrade('REACTIVE_ARMOR') ? 0.55 : 0.4;
      const absorbed = Math.min(this.player.armor, Math.ceil(dmg * absorbRate));
      this.player.armor -= absorbed;
      dmg -= absorbed;
    }
    this.player.health = Math.max(0, this.player.health - dmg);
    this.sectorDamageTaken = (this.sectorDamageTaken || 0) + dmg;
    this.runStats.damageTaken = (this.runStats.damageTaken || 0) + dmg;
    this.lastDamageTime = now;
    this.screenShake = this.reducedEffects ? 0.1 : 0.28;

    if (sourceX !== null && sourceY !== null) {
      const angleToSource = Math.atan2(sourceY - this.player.y, sourceX - this.player.x);
      const rel = Math.atan2(Math.sin(angleToSource - this.player.angle), Math.cos(angleToSource - this.player.angle));
      this.damageAngle = rel;
      this.damageDir = rel < -0.35 ? -1 : (rel > 0.35 ? 1 : 0);
    } else {
      this.damageAngle = 0;
      this.damageDir = 0;
    }
    this.audio.playHurt();

    if (this.player.health > 0 && this.hasUpgrade('KINETIC_BURST') && now >= this.kineticCooldownUntil) {
      this.triggerKineticBurst(now, true);
    }
  }

  bossStomp(enemy) {
    const cfg = enemy.holdsKey ? CONFIG.ENEMIES.BOSS : CONFIG.ENEMIES.CHAMPION;
    const radius = cfg.stompRadius || 4.6;
    const maxDamage = cfg.stompDamage || 18;

    this.screenShake = this.reducedEffects ? 0.25 : 0.9;
    this.audio.playExplosion();
    this.shockwaves.push({
      x: enemy.x,
      y: enemy.y,
      radius: 0.5,
      maxRadius: radius,
      life: 0.65,
      maxLife: 0.65
    });
    this.floorCracks.push({
      x: enemy.x,
      y: enemy.y,
      radius,
      life: 22,
      maxLife: 22,
      seed: Math.random() * 10
    });

    for (let i = 0; i < 26; i++) {
      const angle = (i / 26) * Math.PI * 2;
      this.wallSparks.push({
        x: enemy.x + Math.cos(angle) * 0.4,
        y: enemy.y + Math.sin(angle) * 0.4,
        z: 0.05,
        vx: Math.cos(angle) * (1.6 + Math.random()),
        vy: Math.sin(angle) * (1.6 + Math.random()),
        vz: -0.9 - Math.random(),
        life: 0.5 + Math.random() * 0.3,
        color: i % 3 === 0 ? '#ffbe0b' : '#ff4d00'
      });
    }

    const d = distance(this.player.x, this.player.y, enemy.x, enemy.y);
    if (d < radius) {
      const dmg = Math.max(4, Math.round(maxDamage * (1 - d / radius)));
      this.damagePlayer(dmg, enemy.x, enemy.y);
      this.onStatus(`💥 ¡PISOTÓN! El suelo se agrieta a tu alrededor (-${dmg}% salud)`);
    } else {
      this.onStatus('💥 ¡PISOTÓN! El suelo se ha agrietado en el área');
    }
    this.pushLootNotification('💥 PISOTÓN DEMONÍACO', ['EL SUELO SE AGRIETA EN ÁREA'], '#ff4d00');
  }

  isWall(x, y) {
    const mx = Math.floor(x), my = Math.floor(y);
    if (my < 0 || mx < 0 || my >= this.map.length || mx >= this.map[0].length) return true;
    const tile = this.map[my][mx];
    if (tile === '0') return false;
    if (tile === '6' || tile === '7') {
      const door = this.doors.get(`${mx},${my}`);
      return !door || door.open < 0.72;
    }
    return true;
  }

  moveWithCollision(dx, dy) {
    const r = 0.22;
    const free = (nx, ny) =>
      !this.isWall(nx - r, ny - r) &&
      !this.isWall(nx + r, ny - r) &&
      !this.isWall(nx - r, ny + r) &&
      !this.isWall(nx + r, ny + r);
    if (free(this.player.x + dx, this.player.y)) this.player.x += dx;
    if (free(this.player.x, this.player.y + dy)) this.player.y += dy;
  }

  // Colisión con radio para demonios y jefes: impide que atraviesen o se metan dentro de paredes
  canEnemyMoveTo(nx, ny, r = 0.28) {
    return (
      !this.isWall(nx - r, ny - r) &&
      !this.isWall(nx + r, ny - r) &&
      !this.isWall(nx - r, ny + r) &&
      !this.isWall(nx + r, ny + r)
    );
  }

  moveEnemyWithCollision(enemy, dx, dy, r = 0.28) {
    let movedX = false;
    let movedY = false;
    if (dx !== 0 && this.canEnemyMoveTo(enemy.x + dx, enemy.y, r)) {
      enemy.x += dx;
      movedX = true;
    }
    if (dy !== 0 && this.canEnemyMoveTo(enemy.x, enemy.y + dy, r)) {
      enemy.y += dy;
      movedY = true;
    }
    return { movedX, movedY, hitWall: (dx !== 0 && !movedX) || (dy !== 0 && !movedY) };
  }

  // Pathfinding en rejilla (BFS Flow Field desde la casilla del jugador) para rodear muros y pasillos
  updateFlowField() {
    if (!this.map || this.map.length === 0 || !this.player) return;
    const size = this.map.length;
    const distGrid = Array.from({ length: size }, () => new Int16Array(size).fill(9999));
    const px = clamp(Math.floor(this.player.x), 0, size - 1);
    const py = clamp(Math.floor(this.player.y), 0, size - 1);

    const queueX = new Int16Array(size * size);
    const queueY = new Int16Array(size * size);
    let head = 0;
    let tail = 0;

    distGrid[py][px] = 0;
    queueX[tail] = px;
    queueY[tail] = py;
    tail++;

    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    while (head < tail) {
      const cx = queueX[head];
      const cy = queueY[head];
      head++;
      const nextDist = distGrid[cy][cx] + 1;

      for (let i = 0; i < 4; i++) {
        const nx = cx + dirs[i][0];
        const ny = cy + dirs[i][1];
        if (nx <= 0 || ny <= 0 || nx >= size - 1 || ny >= size - 1) continue;
        if (distGrid[ny][nx] <= nextDist) continue;
        const tile = this.map[ny][nx];
        const passable = tile === '0' || tile === '6';
        if (!passable) continue;
        distGrid[ny][nx] = nextDist;
        queueX[tail] = nx;
        queueY[tail] = ny;
        tail++;
      }
    }
    this.flowDist = distGrid;
  }

  getFlowStep(x, y) {
    if (!this.flowDist || this.flowDist.length === 0) return null;
    const size = this.flowDist.length;
    const cx = clamp(Math.floor(x), 1, size - 2);
    const cy = clamp(Math.floor(y), 1, size - 2);
    let bestCost = this.flowDist[cy][cx];
    let bestX = cx + 0.5;
    let bestY = cy + 0.5;
    let found = false;

    const neighbors = [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];
    for (const [ox, oy] of neighbors) {
      const nx = cx + ox;
      const ny = cy + oy;
      if (nx <= 0 || ny <= 0 || nx >= size - 1 || ny >= size - 1) continue;
      const cost = this.flowDist[ny][nx];
      if (cost >= 9999) continue;
      // Para pasos diagonales, exige que ambas esquinas adyacentes estén libres
      if (ox !== 0 && oy !== 0) {
        if (this.isWall(cx + ox + 0.5, cy + 0.5) || this.isWall(cx + 0.5, cy + oy + 0.5)) continue;
      }
      if (cost < bestCost) {
        bestCost = cost;
        bestX = nx + 0.5;
        bestY = ny + 0.5;
        found = true;
      }
    }
    if (!found) return null;
    // Si el paso atraviesa una puerta normal cerrada, el demonio la abre
    const targetCellKey = `${Math.floor(bestX)},${Math.floor(bestY)}`;
    const door = this.doors.get(targetCellKey);
    if (door && !door.isSecret && !door.isBossGate && door.target === 0) {
      door.target = 1;
      this.audio.playDoorSlide();
    }
    const dx = bestX - x;
    const dy = bestY - y;
    const len = Math.hypot(dx, dy) || 1;
    return { dirX: dx / len, dirY: dy / len };
  }

  alertNearbyEnemies(x, y, radius = 14) {
    for (const enemy of this.enemies) {
      if (!enemy.alive || enemy.isBoss || enemy.alerted) continue;
      if (distance(x, y, enemy.x, enemy.y) <= radius) {
        enemy.alerted = true;
      }
    }
  }

  explodeBarrel(barrel, now = performance.now()) {
    if (!barrel || barrel.exploded) return;
    barrel.exploded = true;
    const rad = CONFIG.BARREL_RADIUS || 3.2;
    const maxDmg = CONFIG.BARREL_DAMAGE || 6.5;

    this.audio.playExplosion();
    this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.18 : 0.65);
    this.shockwaves.push({
      x: barrel.x,
      y: barrel.y,
      radius: 0.4,
      maxRadius: rad,
      life: 0.45,
      maxLife: 0.45,
      color: '#70e000'
    });
    this.floorCracks.push({
      x: barrel.x,
      y: barrel.y,
      radius: rad * 0.75,
      life: 16,
      maxLife: 16,
      seed: Math.random() * 10
    });
    this.spawnWallSparks(barrel.x, barrel.y, 18, '#70e000');
    this.spawnWallSparks(barrel.x, barrel.y, 14, '#ffbe0b');

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      const d = distance(barrel.x, barrel.y, enemy.x, enemy.y);
      if (d <= rad) {
        if (enemy.isBoss && enemy.dormant) this.awakenBoss(enemy, now);
        enemy.alerted = true;
        const dmg = maxDmg * (1 - (d / rad) * 0.45);
        enemy.health -= dmg;
        enemy.hitFlash = 0.25;
        enemy.burnTimer = Math.max(enemy.burnTimer || 0, 2.0);
        this.applyKnockback(enemy, enemy.x - barrel.x, enemy.y - barrel.y, 6.8, 0.65);
        this.spawnBlood(enemy.x, enemy.y, 12);
        if (enemy.health <= 0) {
          this.runStats.barrelKills = (this.runStats.barrelKills || 0) + 1;
          this.killEnemy(enemy, 'EXPLOSION');
        }
      }
    }

    const pDist = distance(barrel.x, barrel.y, this.player.x, this.player.y);
    if (pDist < rad * 0.85) {
      const pDmg = Math.max(3, Math.round(16 * (1 - pDist / (rad * 0.85))));
      this.damagePlayer(pDmg, barrel.x, barrel.y, now);
    }

    // Reacción en cadena con otros barriles cercanos
    for (const other of this.barrels) {
      if (!other.exploded && distance(barrel.x, barrel.y, other.x, other.y) <= rad * 0.9) {
        this.explodeBarrel(other, now);
      }
    }
  }

  // Los demonios sueltan monedas de forma aleatoria; los jefes, un buen montón
  registerKillCombo(now) {
    const combo = this.combo;
    combo.count = now - combo.lastKill <= CONFIG.COMBO_WINDOW_MS ? combo.count + 1 : 1;
    combo.lastKill = now;
    combo.expires = now + CONFIG.COMBO_WINDOW_MS;
    this.runStats.maxCombo = Math.max(this.runStats.maxCombo || 0, combo.count);

    let bonus = 0;
    let text = '';
    if (combo.count === 2) {
      bonus = CONFIG.COMBO_BONUS[2];
      text = 'DOUBLE KILL';
    } else if (combo.count === 3) {
      bonus = CONFIG.COMBO_BONUS[3];
      text = 'RAMPAGE';
    } else if (combo.count === 4) {
      bonus = CONFIG.COMBO_BONUS[4];
      text = 'HELLBREAKER';
    } else if (combo.count > 4) {
      bonus = 75;
      text = 'HELLBREAKER';
    }

    this.bonusPoints += bonus;
    if (text) {
      combo.bannerText = text;
      combo.bannerBonus = bonus;
      combo.bannerUntil = now + 1200;
      this.audio.playCombo(Math.min(combo.count, 4));
    }
  }

  grantChainsawReward(enemy) {
    const shells = randInt(CONFIG.CHAINSAW_SHELL_RANGE[0], CONFIG.CHAINSAW_SHELL_RANGE[1]);
    const fuel = randInt(CONFIG.CHAINSAW_FUEL_RANGE[0], CONFIG.CHAINSAW_FUEL_RANGE[1]);
    const maxReserve = this.getMaxReserve();
    const before = this.player.reserve;
    this.player.reserve = Math.min(maxReserve, before + shells);
    const gainedShells = this.player.reserve - before;
    this.player.fuel = Math.min(MAX_FUEL, this.player.fuel + fuel);
    this.pushLootNotification(
      '🪚 MOTOSIERRA: COSECHA DE CARTUCHOS',
      [`+${gainedShells} CARTUCHOS · +${fuel}% GASOLINA`, 'EL DEMONIO HA SIDO DESMEMBRADO'],
      '#ff4d00'
    );
    this.onStatus(`🪚 MOTOSIERRA: +${gainedShells} cartuchos y +${fuel}% gasolina extraídos del cadáver`);
  }

  destroyLostSoul(enemy, now) {
    if (!enemy.alive) return;
    enemy.alive = false;
    enemy.state = 'DYING';
    enemy.deathTimer = 0;
    enemy.gloryUntil = 0;
    this.audio.playExplosion();
    this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.12 : 0.3);
    this.spawnBlood(enemy.x, enemy.y, 20, '#ff4d00');
    this.spawnWallSparks(enemy.x, enemy.y, 14, '#ffbe0b');
    this.damagePlayer(enemy.damage, enemy.x, enemy.y, now);
    this.onStatus('💥 ¡CRÁNEO ARDIENTE DETONÓ CONTRA TI! Mantén la distancia o revientalos antes');
  }

  killEnemy(enemy, source = 'SHOT') {
    if (!enemy.alive) return;
    const byPlayer = source !== 'ENEMY';
    const now = performance.now();
    enemy.alive = false;
    enemy.state = 'DYING';
    enemy.deathTimer = 0;
    enemy.gloryUntil = 0;
    enemy.knockVx = 0;
    enemy.knockVy = 0;
    this.lastKillSource = source;

    // Hit-stop al matar de cerca y cámara lenta al abatir a un Jefe
    if (enemy.isBoss) {
      this.slowMoUntil = now + 900;
    } else if (['PUNCH', 'GLORY', 'CHAINSAW', 'DASH'].includes(source)) {
      this.hitStopUntil = now + 38;
    }

    // Evita farmear bajas duplicadas cuando un Invocador revive un cadáver
    if (byPlayer && !enemy.wasRevived) {
      this.player.kills += enemy.isBoss ? 5 : 1;
      this.sectorStats.kills++;
      if (source === 'CHAINSAW') this.runStats.chainsawKills = (this.runStats.chainsawKills || 0) + 1;
      if (source === 'FLAME' || source === 'BURN') this.runStats.flamerKills = (this.runStats.flamerKills || 0) + 1;
      if (source === 'GLORY') this.runStats.gloryKills = (this.runStats.gloryKills || 0) + 1;
      if (source === 'PUNCH' || source === 'KINETIC' || source === 'DASH') {
        this.runStats.meleeKills = (this.runStats.meleeKills || 0) + 1;
      }
      if (source === 'EXPLOSION') this.runStats.explosionKills = (this.runStats.explosionKills || 0) + 1;
      if (enemy.isBoss) this.runStats.bossKills = (this.runStats.bossKills || 0) + 1;

      if (!this.chainsawAnnounced && this.player.kills >= CONFIG.CHAINSAW_UNLOCK_KILLS) {
        this.chainsawAnnounced = true;
        this.audio.playKeyPickup();
        this.pushLootNotification(
          '🪚 MOTOSIERRA DESBLOQUEADA',
          ['PULSA [4] PARA DESMEMBRAR DEMONIOS', 'SIN MUNICIÓN · GENERA CARTUCHOS Y GASOLINA'],
          '#ff4d00'
        );
        this.onStatus('🪚 ¡MOTOSIERRA DESBLOQUEADA! Pulsa [4] para usarla');
      }
      this.registerKillCombo(now);
    }

    if (byPlayer) {
      this.hitmarkerKillUntil = now + 200;
      this.audio.playKillConfirm();
      if (['CHAINSAW', 'GLORY', 'PUNCH', 'KINETIC', 'DASH'].includes(source) && this.hasUpgrade('VAMPIRISM')) {
        const healAmt = 3 * this.getUpgradeRank('VAMPIRISM');
        this.player.health = Math.min(CONFIG.MAX_SOUL_HEALTH, this.player.health + healAmt);
      }
    }
    this.audio.playMonsterDeath(enemy.isBoss);
    this.spawnBlood(enemy.x, enemy.y, enemy.isBoss ? 32 : 18);

    if (source === 'SHOT' && this.hasUpgrade('EXPLOSIVE_SHELLS')) {
      const expRank = this.getUpgradeRank('EXPLOSIVE_SHELLS');
      const hasPyroSynergy = this.hasUpgrade('FLAME_AURA');
      const idx = Math.min(expRank - 1, 1);
      const rad = CONFIG.EXPLOSION_RADIUS[idx] + (hasPyroSynergy ? 0.55 : 0);
      const edmg = CONFIG.EXPLOSION_DAMAGE[idx] * (hasPyroSynergy ? 1.25 : 1);
      this.shockwaves.push({
        x: enemy.x,
        y: enemy.y,
        radius: 0.3,
        maxRadius: rad,
        life: 0.38,
        maxLife: 0.38,
        color: hasPyroSynergy ? '#ff0055' : '#ff9e00'
      });
      this.spawnWallSparks(enemy.x, enemy.y, 12, '#ff9e00');
      for (const other of this.enemies) {
        if (!other.alive || other.id === enemy.id) continue;
        const d = distance(enemy.x, enemy.y, other.x, other.y);
        if (d <= rad) {
          if (other.isBoss && other.dormant) this.awakenBoss(other, now);
          other.health -= edmg * (1 - (d / rad) * 0.4);
          other.hitFlash = 0.2;
          if (hasPyroSynergy) {
            other.burnTimer = Math.max(other.burnTimer || 0, 3.2);
          }
          this.applyKnockback(other, other.x - enemy.x, other.y - enemy.y, 5.8, 0.5);
          if (other.health <= 0) {
            this.killEnemy(other, 'EXPLOSION');
          }
        }
      }
    }

    if (source === 'CHAINSAW' && !enemy.wasRevived) {
      this.grantChainsawReward(enemy);
    }

    if (enemy.isBoss) {
      this.coins.push({
        x: enemy.x,
        y: enemy.y,
        amount: randInt(CONFIG.BOSS_COIN_RANGE[0], CONFIG.BOSS_COIN_RANGE[1]),
        active: true
      });
    } else if (!enemy.wasRevived && Math.random() < (enemy.elite ? 1 : CONFIG.ENEMY_COIN_CHANCE + this.level * 0.01)) {
      this.coins.push({
        x: enemy.x + (Math.random() - 0.5) * 0.4,
        y: enemy.y + (Math.random() - 0.5) * 0.4,
        amount: randInt(CONFIG.ENEMY_COIN_RANGE[0], CONFIG.ENEMY_COIN_RANGE[1]),
        active: true
      });
    }

    if (enemy.holdsKey) {
      this.keyItem = { x: enemy.x, y: enemy.y, active: true };
      this.audio.playKeyPickup();
      this.pushLootNotification('💀 ¡BOSS GUARDIÁN DERROTADO!', ['🔑 HA SOLTADO LA LLAVE CALAVERA DORADA'], '#ffbe0b');
      this.onStatus('🔑 ¡BOSS ABATIDO! Recoge la LLAVE CALAVERA Dorada que ha dejado caer');
    } else if (enemy.holdsArsenal) {
      this.armorPickups.push({ x: enemy.x, y: enemy.y, active: true });
      this.pushLootNotification('⚔️ ¡CAMPEÓN ABISAL ABATIDO!', ['🛡️ HA SOLTADO INSIGNIA DE BLINDAJE'], '#70e000');
      this.onStatus('⚔️ ¡CAMPEÓN ABATIDO! Recoge el Blindaje que ha soltado');
    }
  }

  // Ejecuta un Dash táctico cuya frecuencia y velocidad escalan del Sector 1 al 10
  triggerBossDash(enemy, toPlayerX, toPlayerY, mode = 'LATERAL') {
    const bCfg = enemy.holdsKey ? CONFIG.ENEMIES.BOSS : CONFIG.ENEMIES.CHAMPION;
    const tier = (this.level - 1) / Math.max(1, MAX_LEVELS - 1);
    enemy.bossState = 'DASH';
    enemy.bossTimer = bCfg.dashSec;
    enemy.dashCooldown = (bCfg.dashCooldown - tier * 2.0) * (enemy.enraged ? 0.78 : 1.0);
    enemy.strafeDir = (enemy.strafeDir || 1) * -1;

    const perpX = -toPlayerY * enemy.strafeDir;
    const perpY = toPlayerX * enemy.strafeDir;

    if (mode === 'BACKSTEP') {
      enemy.dashDirX = -toPlayerX * 0.65 + perpX * 0.75;
      enemy.dashDirY = -toPlayerY * 0.65 + perpY * 0.75;
    } else {
      enemy.dashDirX = perpX * 0.88 + toPlayerX * 0.35;
      enemy.dashDirY = perpY * 0.88 + toPlayerY * 0.35;
    }
    const len = Math.hypot(enemy.dashDirX, enemy.dashDirY) || 1;
    enemy.dashDirX /= len;
    enemy.dashDirY /= len;

    const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
    this.audio.playBossDash(dist);
    this.spawnWallSparks(enemy.x, enemy.y, 8, '#ff4d00');
  }

  // Habilidad única según el arquetipo del Jefe del sector
  triggerBossSpecial(enemy, toX, toY, dist, now) {
    const arch = enemy.bossArchetype || 'PYROMANCER';
    enemy.specialCd = enemy.enraged ? 5.2 : 7.2;

    if (arch === 'SUMMONER_LORD') {
      if (this.buildRegularEnemy) {
        const offsets = [[1.2, 0], [-1.2, 0]];
        let spawned = 0;
        for (const [ox, oy] of offsets) {
          const sx = enemy.x + ox;
          const sy = enemy.y + oy;
          if (this.canEnemyMoveTo(sx, sy, 0.28)) {
            const minion = this.buildRegularEnemy(spawned === 0 ? 'IMP' : 'LOST_SOUL', { x: sx, y: sy }, false);
            minion.wasRevived = true;
            minion.alerted = true;
            this.enemies.push(minion);
            this.spawnWallSparks(sx, sy, 10, '#70e000');
            spawned++;
          }
        }
        if (spawned > 0) {
          this.audio.playSummon();
          this.onStatus(`☠️ ¡${enemy.kind} INVOCA ESBIRROS DEL ABISMO!`);
        }
      }
    } else if (arch === 'CYBER_ARTILLERY') {
      const baseAngle = Math.atan2(toY, toX);
      for (const offset of [-0.18, 0.18]) {
        const ang = baseAngle + offset;
        this.enemyProjectiles.push({
          ownerId: enemy.id,
          ownerKind: enemy.kind,
          ownerRef: enemy,
          x: enemy.x + Math.cos(ang) * 0.5,
          y: enemy.y + Math.sin(ang) * 0.5,
          vx: Math.cos(ang) * 5.8,
          vy: Math.sin(ang) * 5.8,
          speed: 5.8,
          homing: true,
          turnRate: 1.55,
          life: 3.1,
          damage: enemy.projDamage || 12,
          sprite: this.orbSprites.REVENANT || this.orbSprites.BOSS
        });
      }
      this.audio.playDemonFireball(dist);
      this.onStatus(`🚀 ¡${enemy.kind} DISPARA MISILES GUIADOS!`);
    } else if (arch === 'VOID_STALKER') {
      const b = enemy.arenaBounds;
      if (b) {
        for (let attempt = 0; attempt < 12; attempt++) {
          const tx = b.minX + 1.2 + Math.random() * Math.max(1, b.maxX - b.minX - 2.4);
          const ty = b.minY + 1.2 + Math.random() * Math.max(1, b.maxY - b.minY - 2.4);
          if (this.canEnemyMoveTo(tx, ty, 0.35) && distance(tx, ty, this.player.x, this.player.y) > 2.6) {
            this.shockwaves.push({ x: enemy.x, y: enemy.y, radius: 0.3, maxRadius: 2.2, life: 0.35, maxLife: 0.35, color: '#9d4edd' });
            enemy.x = tx;
            enemy.y = ty;
            enemy.wakeFlash = 0.45;
            this.shockwaves.push({ x: tx, y: ty, radius: 0.3, maxRadius: 2.6, life: 0.4, maxLife: 0.4, color: '#00f5d4' });
            this.spawnWallSparks(tx, ty, 14, '#9d4edd');
            this.audio.playBossDash(dist);
            this.onStatus(`🌀 ¡${enemy.kind} SE TELETRANSPORTA POR LA ARENA!`);
            break;
          }
        }
      }
    } else {
      // PYROMANCER: Anillo de 8 orbes de fuego + grieta ígnea
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + (now * 0.001);
        const spd = (enemy.projSpeed || 6.2) * 0.82;
        this.enemyProjectiles.push({
          ownerId: enemy.id,
          ownerKind: enemy.kind,
          ownerRef: enemy,
          x: enemy.x + Math.cos(ang) * 0.45,
          y: enemy.y + Math.sin(ang) * 0.45,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 2.4,
          damage: Math.max(7, Math.round((enemy.projDamage || 10) * 0.85)),
          sprite: this.orbSprites.IMP
        });
      }
      this.shockwaves.push({ x: enemy.x, y: enemy.y, radius: 0.4, maxRadius: 3.4, life: 0.45, maxLife: 0.45, color: '#ff4d00' });
      this.audio.playDemonFireball(dist);
      this.onStatus(`🔥 ¡${enemy.kind} DESATA UNA NOVA DE FUEGO EN 360°!`);
    }
  }

  // Disparo del Boss escalado por sector: 1 orbe en Sector 1-2, 2 en Sector 3-5, 3 en Sector 6-8 y ráfaga total en Sector 9-10
  fireBossSpreadBarrage(enemy, toPlayerX, toPlayerY, dist) {
    const baseAngle = Math.atan2(toPlayerY, toPlayerX);
    const pSpeed = enemy.projSpeed || 6.5;
    let spreadAngles;

    if (this.level <= 2) {
      spreadAngles = (this.level === 2 && enemy.enraged) ? [-0.14, 0.14] : [0];
    } else if (this.level <= 5) {
      spreadAngles = enemy.enraged ? [-0.2, 0, 0.2] : [-0.12, 0.12];
    } else if (this.level <= 8) {
      spreadAngles = enemy.enraged ? [-0.26, -0.09, 0.09, 0.26] : [-0.2, 0, 0.2];
    } else {
      spreadAngles = enemy.enraged ? [-0.3, -0.15, 0, 0.15, 0.3] : [-0.24, -0.08, 0.08, 0.24];
    }

    for (const offset of spreadAngles) {
      const ang = baseAngle + offset;
      this.enemyProjectiles.push({
        ownerId: enemy.id,
        ownerKind: enemy.kind,
        ownerRef: enemy,
        x: enemy.x + Math.cos(ang) * 0.45,
        y: enemy.y + Math.sin(ang) * 0.45,
        vx: Math.cos(ang) * pSpeed,
        vy: Math.sin(ang) * pSpeed,
        life: 2.8,
        damage: enemy.projDamage || 11,
        sprite: this.orbSprites.BOSS
      });
    }
    this.audio.playDemonFireball(dist);
  }

  rollUpgradeChoices() {
    const available = CONFIG.UPGRADES.filter((u) => this.getUpgradeRank(u.id) < (u.maxRank || 1));
    const dynamicPool = available.filter((u) => u.dynamic);
    const passivePool = available.filter((u) => !u.dynamic);
    const shuffle = (arr) => {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    shuffle(dynamicPool);
    shuffle(passivePool);

    const choices = [];
    if (dynamicPool.length > 0) choices.push(dynamicPool.shift());
    if (dynamicPool.length > 0) choices.push(dynamicPool.shift());
    const remaining = shuffle([...dynamicPool, ...passivePool]);
    while (choices.length < 3 && remaining.length > 0) {
      choices.push(remaining.shift());
    }
    return choices;
  }

  rerollIntermissionUpgrades() {
    const im = this.intermission;
    if (!im || im.upgradeSelected) return;
    const cost = CONFIG.REROLL_COST || 8;
    if ((this.player.coins || 0) < cost) {
      this.audio.playEmptyClip();
      this.onStatus(`FALTAN MONEDAS: necesitas ${cost} monedas para renovar el Altar`);
      return;
    }
    const choices = this.rollUpgradeChoices();
    if (choices.length === 0) return;
    this.player.coins -= cost;
    im.upgradeChoices = choices;
    this.audio.playPickup();
    this.onStatus(`🎲 ALTAR RENOVADO (-${cost} monedas) // Elige [1], [2] o [3]`);
  }

  startIntermission(now) {
    if ((this.sectorDamageTaken || 0) === 0) {
      this.runStats.perfectSectors = (this.runStats.perfectSectors || 0) + 1;
    }
    const sec = Math.max(1, Math.round((now - this.levelStartTime) / 1000));
    const choices = this.rollUpgradeChoices();

    this.intermission = {
      startTime: now,
      sector: this.level,
      perfectSector: (this.sectorDamageTaken || 0) === 0,
      killsPct: Math.min(100, Math.round((this.sectorStats.kills / Math.max(1, this.sectorStats.totalKills)) * 100)),
      itemsPct: Math.min(100, Math.round((this.sectorStats.items / Math.max(1, this.sectorStats.totalItems)) * 100)),
      secretsPct: Math.min(100, Math.round((this.sectorStats.secrets / Math.max(1, this.sectorStats.totalSecrets)) * 100)),
      timeSec: sec,
      lastTick: 0,
      upgradeChoices: choices,
      upgradeSelected: null
    };
    this.mapOpen = false;
    this.mouseDown = false;
    this.audio.playSectorPortal();
    this.onStatus(
      this.intermission.upgradeChoices.length > 0
        ? `SECTOR ${this.level} COMPLETADO // Elige 1 mejora con [1]-[3] o [R] Reroll (${CONFIG.REROLL_COST} monedas)`
        : `SECTOR ${this.level} COMPLETADO // Todas las mejoras al máximo. Pulsa [ESPACIO]`
    );
  }

  selectUpgrade(index) {
    const im = this.intermission;
    if (!im || im.upgradeSelected) return;
    const upgrade = im.upgradeChoices?.[index];
    if (!upgrade) {
      this.audio.playEmptyClip();
      return;
    }
    const nextRank = this.getUpgradeRank(upgrade.id) + 1;
    this.upgrades.set(upgrade.id, nextRank);
    if (upgrade.id === 'AMMO_POUCH') {
      this.player.reserve = Math.min(this.getMaxReserve(), this.player.reserve + 8);
    }
    im.upgradeSelected = { ...upgrade, installedRank: nextRank };
    this.audio.playUpgrade();
    this.onStatus(`ALTAR DE MEJORA: ${upgrade.label} (NV.${nextRank}) instalada. Pulsa [ESPACIO] para desplegar`);
  }

  advanceFromIntermission() {
    if (!this.intermission) return;
    const im = this.intermission;
    if (im.upgradeChoices?.length > 0 && !im.upgradeSelected) {
      this.audio.playEmptyClip();
      this.onStatus(`ALTAR DE MEJORA: elige [1]${im.upgradeChoices.length >= 3 ? ', [2] o [3]' : ' o [2]'} antes de desplegarte`);
      return;
    }
    const snap = this.captureCurrentScreen();
    this.audio.playShotgun();
    this.intermission = null;
    this.level++;
    this.player.health = Math.min(100, this.player.health + 15);
    this.player.invulnerableUntil = 0;
    this.startLevel();
    this.startScreenMelt('SECTOR', snap);
  }

  update(dt, now) {
    if (this.victorySequence) {
      if (!this.melt && now >= this.victorySequence.finishAt) {
        this.finalizeMatch(true);
      }
      return;
    }
    if (this.deathSequence) {
      if (!this.melt && now >= this.deathSequence.finishAt) {
        this.finalizeMatch(false);
      }
      return;
    }
    if (this.briefingOpen || this.intermission || this.shopOpen || this.mapOpen || this.melt) return;

    if (now < (this.hitStopUntil || 0)) return;
    if (now < (this.slowMoUntil || 0)) {
      dt *= 0.35;
    }

    const player = this.player;
    if (!Number.isFinite(player.x) || !Number.isFinite(player.y)) {
      player.x = 10.5;
      player.y = 10.5;
    }
    this.screenShake = Math.max(0, this.screenShake - dt * 1.8);

    this.flowTimer = (this.flowTimer || 0) - dt;
    if (this.flowTimer <= 0) {
      this.flowTimer = 0.22;
      this.updateFlowField();
    }

    for (let i = this.lootNotifications.length - 1; i >= 0; i--) {
      this.lootNotifications[i].timer -= dt;
      if (this.lootNotifications[i].timer <= 0) {
        this.lootNotifications.splice(i, 1);
      }
    }

    if (this.keys.has('ArrowLeft')) player.angle -= dt * 2.0;
    if (this.keys.has('ArrowRight')) player.angle += dt * 2.0;

    const berserkActive = now < player.berserkUntil;
    const dashing = now < (this.playerDashUntil || 0);
    const fast = this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') || berserkActive;
    const speed = (fast ? 4.35 : 3.25) * dt;
    let forward = 0, strafe = 0;
    if (dashing) {
      forward = CONFIG.DASH_SPEED * dt;
    } else {
      if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) forward += speed;
      if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) forward -= speed;
      if (this.keys.has('KeyA')) strafe -= speed;
      if (this.keys.has('KeyD')) strafe += speed;
    }

    const targetLean = strafe === 0 ? 0 : -Math.sign(strafe);
    this.strafeLean += (targetLean - this.strafeLean) * Math.min(1, dt * 11);

    const dx = Math.cos(player.angle) * forward + Math.cos(player.angle + Math.PI / 2) * strafe;
    const dy = Math.sin(player.angle) * forward + Math.sin(player.angle + Math.PI / 2) * strafe;
    const moveFromX = player.x, moveFromY = player.y;
    if (dx || dy) {
      this.moveWithCollision(dx, dy);
      this.walkTime += dt * (fast ? 10.5 : 7.8);
      this.walkBobX = Math.sin(this.walkTime) * 5.5;
      this.walkBobY = Math.abs(Math.sin(this.walkTime)) * 4.2;
    } else {
      this.walkBobX *= 0.82;
      this.walkBobY *= 0.82;
    }
    const actuallyMoved = Math.hypot(player.x - moveFromX, player.y - moveFromY) > 0.0005;

    if (dashing) {
      const dashRank = Math.max(1, this.getUpgradeRank('SHOCK_DASH'));
      for (const enemy of this.enemies) {
        if (!enemy.alive || (this.playerDashHitIds && this.playerDashHitIds.has(enemy.id))) continue;
        const d = distance(player.x, player.y, enemy.x, enemy.y);
        if (d < 1.35) {
          if (this.playerDashHitIds) this.playerDashHitIds.add(enemy.id);
          if (enemy.isBoss && enemy.dormant) this.awakenBoss(enemy, now);
          enemy.health -= 2.4 * dashRank;
          enemy.hitFlash = 0.24;
          this.applyKnockback(enemy, enemy.x - player.x, enemy.y - player.y, 7.6, 0.7 + dashRank * 0.25);
          this.spawnBlood(enemy.x, enemy.y, 14);
          this.spawnWallSparks(enemy.x, enemy.y, 8, '#9d4edd');
          if (enemy.health <= 0) {
            this.killEnemy(enemy, 'DASH');
          }
        }
      }
    }

    this.mapRevealTimer -= dt;
    if (this.mapRevealTimer <= 0) {
      this.mapRevealTimer = 0.12;
      this.revealMapAroundPlayer();
    }

    if (this.combo.count > 0 && now > this.combo.expires) {
      this.combo.count = 0;
    }

    const evType = this.sectorEvent?.type;
    if ((evType === 'TOXIC' || evType === 'LAVA' || evType === 'APOCALYPSE') && this.hazards.length > 0) {
      const hitHazard = this.hazards.find((h) => Math.hypot(player.x - h.x, player.y - h.y) <= h.radius);
      if (hitHazard) {
        if (hitHazard.kind === 'LAVA') {
          this.toxicAccum += dt;
          if (this.toxicAccum >= 0.45) {
            this.toxicAccum = 0;
            this.damagePlayer(2, hitHazard.x, hitHazard.y, now);
          }
        } else if (actuallyMoved) {
          this.hazardIdleTime = 0;
          this.toxicAccum = 0;
        } else {
          this.hazardIdleTime += dt;
          if (this.hazardIdleTime >= CONFIG.HAZARD_IDLE_SEC) {
            this.toxicAccum += dt;
            const interval = 1 / Math.max(0.1, CONFIG.HAZARD_DPS);
            while (this.toxicAccum >= interval) {
              this.toxicAccum -= interval;
              player.health = Math.max(0, player.health - 1);
              this.sectorDamageTaken = (this.sectorDamageTaken || 0) + 1;
              this.runStats.damageTaken = (this.runStats.damageTaken || 0) + 1;
              this.toxicFlashTime = now;
              this.audio.playToxicTick();
            }
          }
        }
      } else {
        this.hazardIdleTime = 0;
        this.toxicAccum = 0;
      }
    }

    // Evento de Lluvia de Meteoros (METEORS / APOCALYPSE)
    if (evType === 'METEORS' || evType === 'APOCALYPSE') {
      this.meteorTimer = (this.meteorTimer || 3.5) - dt;
      if (this.meteorTimer <= 0) {
        this.meteorTimer = evType === 'APOCALYPSE' ? 2.8 : 3.8;
        const angle = Math.random() * Math.PI * 2;
        const distM = 1.8 + Math.random() * 4.5;
        const mx = player.x + Math.cos(angle) * distM;
        const my = player.y + Math.sin(angle) * distM;
        if (!this.isWall(mx, my)) {
          this.meteorStrikes.push({
            x: mx,
            y: my,
            radius: 2.1,
            timer: 1.25,
            maxTimer: 1.25
          });
        }
      }
    }

    for (let i = this.meteorStrikes.length - 1; i >= 0; i--) {
      const m = this.meteorStrikes[i];
      m.timer -= dt;
      if (m.timer <= 0) {
        this.meteorStrikes.splice(i, 1);
        this.audio.playExplosion();
        this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.14 : 0.42);
        this.shockwaves.push({
          x: m.x,
          y: m.y,
          radius: 0.3,
          maxRadius: m.radius,
          life: 0.4,
          maxLife: 0.4,
          color: '#ff4d00'
        });
        this.spawnWallSparks(m.x, m.y, 14, '#ff4d00');
        const dp = distance(player.x, player.y, m.x, m.y);
        if (dp <= m.radius) {
          this.damagePlayer(Math.max(4, Math.round(14 * (1 - dp / m.radius))), m.x, m.y, now);
        }
        for (const enemy of this.enemies) {
          if (enemy.alive && distance(m.x, m.y, enemy.x, enemy.y) <= m.radius) {
            enemy.health -= 2.8;
            enemy.hitFlash = 0.2;
            if (enemy.health <= 0) this.killEnemy(enemy, 'EXPLOSION');
          }
        }
      }
    }

    // Mejora reactiva: AURA ÍGNEA (prende fuego y empuja a los demonios que se acercan)
    if (this.hasUpgrade('FLAME_AURA')) {
      this.auraTickTimer = (this.auraTickTimer || 0) + dt;
      if (this.auraTickTimer >= 0.35) {
        this.auraTickTimer = 0;
        const auraRank = this.getUpgradeRank('FLAME_AURA');
        const auraRad = CONFIG.AURA_RADIUS[Math.min(auraRank - 1, 1)];
        for (const enemy of this.enemies) {
          if (!enemy.alive || (enemy.isBoss && enemy.dormant)) continue;
          const d = distance(player.x, player.y, enemy.x, enemy.y);
          if (d <= auraRad) {
            enemy.burnTimer = Math.max(enemy.burnTimer || 0, 2.2);
            enemy.health -= 0.32 * auraRank;
            this.spawnWallSparks(enemy.x, enemy.y, 3, '#ff4d00');
            if (auraRank >= 2) {
              this.applyKnockback(enemy, enemy.x - player.x, enemy.y - player.y, 2.2, 0.15);
            }
            if (enemy.health <= 0) {
              this.killEnemy(enemy, 'BURN');
            }
          }
        }
      }
    }

    // Mejora reactiva: CONTRAGOLPE (puñetazo automático cuando un demonio se acerca a quemarropa)
    if (this.hasUpgrade('COUNTER_STRIKE') && now >= this.counterCooldownUntil) {
      const counterRank = this.getUpgradeRank('COUNTER_STRIKE');
      const closeHostile = this.enemies.some(
        (e) =>
          e.alive &&
          !(e.isBoss && e.dormant) &&
          (e.stunTimer || 0) <= 0 &&
          distance(player.x, player.y, e.x, e.y) <= 1.55 &&
          this.lineOfSight(player.x, player.y, e.x, e.y)
      );
      if (closeHostile) {
        this.counterCooldownUntil = now + CONFIG.COUNTER_COOLDOWN_MS[Math.min(counterRank - 1, 1)];
        this.triggerPunch(true);
      }
    }

    // Mejora reactiva: PULSO CINÉTICO (onda de choque automática al verte rodeado por 2+ demonios)
    if (this.hasUpgrade('KINETIC_BURST') && now >= this.kineticCooldownUntil) {
      let surrounding = 0;
      for (const e of this.enemies) {
        if (e.alive && !(e.isBoss && e.dormant) && distance(player.x, player.y, e.x, e.y) <= 2.15) {
          surrounding++;
        }
      }
      if (surrounding >= 2) {
        this.triggerKineticBurst(now, false);
      }
    }

    if (this.mouseDown || this.keys.has('Space')) this.shoot();

    for (const door of this.doors.values()) {
      const d = distance(player.x, player.y, door.x + 0.5, door.y + 0.5);
      const triggerDist = door.isBossGate ? 2.15 : 2.25;
      if (!door.isSecret && d < triggerDist && door.target === 0) {
        door.target = 1;
        this.audio.playDoorSlide();
        if (door.isBossGate) {
          this.pushLootNotification('👁️ COMPUERTA DE ARENA ABIERTA', ['EL BOSS AGUARDA EN EL CENTRO · ENTRA PARA ACTIVARLO'], '#ffbe0b');
          this.onStatus('👁️ Arena abierta: el Boss está parado en el centro. Entra a la sala para que te ataque');
        } else {
          this.onStatus('Compuerta blindada UAC abierta');
        }
      }
      if (door.open < door.target) door.open = Math.min(1, door.open + dt * 2.0);
    }
    for (const chest of this.chests) {
      if (!chest.opened && distance(player.x, player.y, chest.x, chest.y) < 1.05) this.openChest(chest);
    }

    for (const arm of this.armorPickups) {
      if (arm.active && distance(player.x, player.y, arm.x, arm.y) < 0.85) {
        arm.active = false;
        player.armor = Math.min(100, (player.armor || 0) + 35);
        this.pickupFlashTime = now;
        this.audio.playPickup();
        this.pushLootNotification('🛡️ BLINDAJE DE COMBATE UAC', ['+35% ARMOR DE PROTECCIÓN'], '#70e000');
        this.onStatus('🛡️ BLINDAJE DE COMBATE UAC RECOGIDO (+35% ARMOR)');
      }
    }

    for (const p of this.powerups) {
      if (p.active && distance(player.x, player.y, p.x, p.y) < 0.85) {
        p.active = false;
        player.health = Math.min(CONFIG.MAX_SOUL_HEALTH, player.health + CONFIG.SOULSPHERE_HEALTH);
        player.berserkUntil = now + CONFIG.BERSERK_DURATION * 1000;
        this.pickupFlashTime = now;
        this.evilGrinUntil = now + 2200;
        this.audio.playKeyPickup();
        this.pushLootNotification('🔮 ¡SOULSPHERE + BERSERK!', [`+${CONFIG.SOULSPHERE_HEALTH}% SOBRECARGA DE SALUD`, 'DAÑO DOBLE TEMPORAL'], '#00f5d4');
        this.onStatus('🔮 ¡SOULSPHERE + BERSERK! Salud sobrecargada y Daño Doble temporal');
      }
    }

    for (const coin of this.coins) {
      if (!coin.active) continue;
      if (distance(player.x, player.y, coin.x, coin.y) < 0.75) {
        coin.active = false;
        player.coins = (player.coins || 0) + coin.amount;
        this.pickupFlashTime = now;
        this.audio.playPickup();
        this.onStatus(`+${coin.amount} MONEDAS (total ${player.coins})`);
      }
    }

    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const wave = this.shockwaves[i];
      wave.life -= dt;
      const progress = 1 - Math.max(0, wave.life) / wave.maxLife;
      wave.radius = wave.maxRadius * Math.min(1, progress * 1.15);
      if (wave.life <= 0) this.shockwaves.splice(i, 1);
    }

    for (let i = this.floorCracks.length - 1; i >= 0; i--) {
      this.floorCracks[i].life -= dt;
      if (this.floorCracks[i].life <= 0) this.floorCracks.splice(i, 1);
    }

    if (this.keyItem && this.keyItem.active && distance(player.x, player.y, this.keyItem.x, this.keyItem.y) < 0.95) {
      this.keyItem.active = false;
      player.hasKey = true;
      this.sectorStats.items++;
      this.pickupFlashTime = now;
      this.evilGrinUntil = now + 1500;
      this.audio.playKeyPickup();
      this.spawnBlood(this.keyItem.x, this.keyItem.y, 16, '#ffbe0b');
      this.pushLootNotification('🔑 ¡LLAVE CALAVERA OBTENIDA!', ['COMPUERTA EXIT DESBLOQUEADA'], '#ffbe0b');
      this.onStatus('🔑 ¡LLAVE CALAVERA OBTENIDA! Dirígete a la compuerta EXIT');
    }

    // Físicas del Lanzallamas
    for (let i = this.flameProjectiles.length - 1; i >= 0; i--) {
      const p = this.flameProjectiles[i];
      p.age += dt;
      p.life -= dt;
      if (p.life <= 0) {
        this.flameProjectiles.splice(i, 1);
        continue;
      }

      const drag = Math.exp(-2.2 * dt);
      p.vx *= drag;
      p.vy *= drag;
      const turb = Math.sin(now * 0.025 + p.seed) * 1.4;
      const stepX = (p.vx - p.dirY * turb) * dt;
      const stepY = (p.vy + p.dirX * turb) * dt;

      const progress = clamp(p.age / p.maxLife, 0, 1);
      p.scale = 0.34 + progress * 0.62;
      p.zOffset = (p.zOffset || 0) - 0.18 * dt;

      if (!this.isWall(p.x + stepX, p.y)) p.x += stepX;
      else p.vx *= -0.25;
      if (!this.isWall(p.x, p.y + stepY)) p.y += stepY;
      else p.vy *= -0.25;

      if (Math.random() < 0.25) {
        this.wallSparks.push({
          x: p.x + (Math.random() - 0.5) * 0.25,
          y: p.y + (Math.random() - 0.5) * 0.25,
          z: p.zOffset,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          vz: -0.6 - Math.random() * 0.5,
          life: 0.16,
          color: Math.random() < 0.5 ? '#ffbe0b' : '#ff4d00'
        });
      }

      const hitRadius = 0.65 + progress * 0.35;
      for (const barrel of this.barrels) {
        if (!barrel.exploded && Math.hypot(p.x - barrel.x, p.y - barrel.y) < hitRadius) {
          this.explodeBarrel(barrel, now);
        }
      }
      for (const enemy of this.enemies) {
        if (enemy.alive && !p.hitSet.has(enemy.id) && Math.hypot(p.x - enemy.x, p.y - enemy.y) < hitRadius) {
          p.hitSet.add(enemy.id);
          if (enemy.isBoss && enemy.dormant) this.awakenBoss(enemy, now);
          enemy.alerted = true;
          enemy.health -= p.damage;
          enemy.hitFlash = 0.1;
          enemy.burnTimer = 2.4;
          this.hitmarkerUntil = now + 80;
          if (now - this.lastHitmarkerSound > 90) {
            this.lastHitmarkerSound = now;
            this.audio.playHitmarker();
          }
          this.spawnWallSparks(enemy.x, enemy.y, 3, '#ff4d00');
          if (enemy.health <= 0) {
            this.killEnemy(enemy, 'FLAME');
          }
        }
      }
    }

    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      if (ep.homing && ep.life > 0.35) {
        const curAng = Math.atan2(ep.vy, ep.vx);
        const targetAng = Math.atan2(player.y - ep.y, player.x - ep.x);
        const diff = Math.atan2(Math.sin(targetAng - curAng), Math.cos(targetAng - curAng));
        const maxTurn = (ep.turnRate || 1.45) * dt;
        const newAng = curAng + clamp(diff, -maxTurn, maxTurn);
        const spd = ep.speed || Math.hypot(ep.vx, ep.vy) || 6.0;
        ep.vx = Math.cos(newAng) * spd;
        ep.vy = Math.sin(newAng) * spd;
        if (Math.random() < 0.45) {
          this.wallSparks.push({
            x: ep.x,
            y: ep.y,
            z: 0,
            vx: -ep.vx * 0.1,
            vy: -ep.vy * 0.1,
            vz: -0.2,
            life: 0.18,
            color: '#ff9e00'
          });
        }
      }
      ep.x += ep.vx * dt;
      ep.y += ep.vy * dt;
      ep.life -= dt;
      if (ep.life <= 0 || this.isWall(ep.x, ep.y)) {
        this.spawnWallSparks(ep.x, ep.y, 4);
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      let hitOtherDemon = false;
      for (const other of this.enemies) {
        if (other.alive && other.id !== ep.ownerId && other.kind !== ep.ownerKind && distance(ep.x, ep.y, other.x, other.y) < 0.65) {
          other.health -= ep.damage * 0.35;
          other.hitFlash = 0.15;
          other.targetEnemy = ep.ownerRef || null;
          this.spawnBlood(other.x, other.y, 6);
          if (other.health <= 0) this.killEnemy(other, 'ENEMY');
          hitOtherDemon = true;
          break;
        }
      }
      if (hitOtherDemon) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (Math.hypot(ep.x - player.x, ep.y - player.y) < 0.45) {
        this.damagePlayer(ep.damage, ep.x, ep.y, now);
        this.enemyProjectiles.splice(i, 1);
      }
    }

    for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
      const bp = this.bloodParticles[i];
      bp.x += bp.vx * dt;
      bp.y += bp.vy * dt;
      bp.z -= bp.vz * dt;
      bp.life -= dt;
      if (bp.life <= 0) this.bloodParticles.splice(i, 1);
    }

    for (let i = this.wallSparks.length - 1; i >= 0; i--) {
      const sp = this.wallSparks[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.z += sp.vz * dt;
      sp.life -= dt;
      if (sp.life <= 0) this.wallSparks.splice(i, 1);
    }

    for (const em of this.ambientEmbers) {
      em.z += em.vz * dt;
      if (em.z < -0.5 || distance(player.x, player.y, em.x, em.y) > 9) {
        em.x = player.x + (Math.random() - 0.5) * 10;
        em.y = player.y + (Math.random() - 0.5) * 10;
        em.z = 0.5;
      }
    }

    for (const medkit of this.medkits) {
      if (medkit.active && Math.hypot(player.x - medkit.x, player.y - medkit.y) < 0.85 && player.health < 100) {
        player.health = Math.min(100, player.health + CONFIG.FLOOR_MEDKIT_HEAL);
        medkit.active = false;
        this.pickupFlashTime = now;
        this.audio.playPickup();
        this.pushLootNotification('➕ BOTIQUÍN DE CAMPO', [`+${CONFIG.FLOOR_MEDKIT_HEAL}% SALUD RESTAURADA`], '#d90429');
        this.onStatus(`Botiquín recogido (+${CONFIG.FLOOR_MEDKIT_HEAL} SALUD)`);
      }
    }

    for (const pack of this.ammoPacks) {
      if (pack.active && Math.hypot(player.x - pack.x, player.y - pack.y) < 0.85) {
        player.reserve = Math.min(this.getMaxReserve(), player.reserve + pack.amount);
        player.fuel = Math.min(MAX_FUEL, player.fuel + (pack.fuelAmount || 12));
        pack.active = false;
        this.pickupFlashTime = now;
        this.evilGrinUntil = now + 900;
        this.audio.playPickup();
        this.pushLootNotification('📦 RESERVA DE MUNICIÓN', [`+${pack.amount} CARTUCHOS`, `+${pack.fuelAmount || 12}% GASOLINA`], '#ffbe0b');
        this.onStatus(`Reserva recogida (+${pack.amount} Cartuchos / +Gasolina)`);
      }
    }

    // IA de Demonios y Bosses con Pathfinding BFS, Colisión con Radio, Alerta y Mecánicas Únicas
    for (const enemy of this.enemies) {
      enemy.hitFlash = Math.max(0, (enemy.hitFlash || 0) - dt);
      enemy.painTimer = Math.max(0, (enemy.painTimer || 0) - dt);
      enemy.stunTimer = Math.max(0, (enemy.stunTimer || 0) - dt);
      enemy.wakeFlash = Math.max(0, (enemy.wakeFlash || 0) - dt * 1.4);
      enemy.reactDashCd = Math.max(0, (enemy.reactDashCd || 0) - dt);
      enemy.shieldFlash = Math.max(0, (enemy.shieldFlash || 0) - dt);
      enemy.reviveCd = Math.max(0, (enemy.reviveCd || 0) - dt);

      if (enemy.alive && Math.hypot(enemy.knockVx || 0, enemy.knockVy || 0) > 0.15) {
        const kSpeed = Math.hypot(enemy.knockVx, enemy.knockVy);
        const kx = enemy.knockVx * dt;
        const ky = enemy.knockVy * dt;
        const moveRes = this.moveEnemyWithCollision(enemy, kx, ky, 0.28);
        if (!moveRes.movedX) enemy.knockVx = 0;
        if (!moveRes.movedY) enemy.knockVy = 0;

        if (moveRes.hitWall && kSpeed >= CONFIG.WALL_SLAM_SPEED && !enemy.wallSlammed) {
          enemy.wallSlammed = true;
          const slamDmg = CONFIG.WALL_SLAM_DAMAGE * (this.hasUpgrade('POWER_FIST') ? 1.5 : 1);
          enemy.health -= slamDmg;
          enemy.hitFlash = 0.25;
          enemy.stunTimer = Math.max(enemy.stunTimer || 0, 0.75);
          this.spawnWallSparks(enemy.x, enemy.y, 12, '#ffbe0b');
          this.spawnBlood(enemy.x, enemy.y, 12);
          this.audio.playPunch(true);
          this.onStatus('💥 ¡DEMONIO ESTAMPADO CONTRA EL MURO!');
          if (enemy.health <= 0) {
            this.killEnemy(enemy, 'PUNCH');
            continue;
          }
        }
        const decay = Math.exp(-CONFIG.KNOCK_DECAY * dt);
        enemy.knockVx *= decay;
        enemy.knockVy *= decay;
      }

      if (
        enemy.alive &&
        !enemy.isBoss &&
        !enemy.gloryArmed &&
        enemy.health > 0 &&
        enemy.health <= enemy.maxHealth * CONFIG.GLORY_THRESHOLD
      ) {
        enemy.gloryArmed = true;
        enemy.gloryUntil = now + CONFIG.GLORY_WINDOW_MS;
        this.audio.playGloryReady();
      }
      if (enemy.gloryArmed && now >= enemy.gloryUntil) {
        enemy.gloryUntil = 0;
      }

      if (enemy.alive && enemy.burnTimer > 0) {
        enemy.burnTimer = Math.max(0, enemy.burnTimer - dt);
        enemy.burnTick = (enemy.burnTick || 0) + dt;
        if (enemy.burnTick >= 0.22) {
          enemy.burnTick = 0;
          enemy.health -= 0.24;
          this.spawnWallSparks(enemy.x, enemy.y, 2, '#ffbe0b');
          if (enemy.health <= 0) {
            this.killEnemy(enemy, 'BURN');
            continue;
          }
        }
      }

      if (enemy.state === 'DYING') {
        enemy.deathTimer += dt * 4.5;
        if (enemy.deathTimer >= 3) {
          enemy.state = 'CORPSE';
          enemy.deathTimer = 3;
        }
        continue;
      }
      if (!enemy.alive) continue;

      // Los Bosses permanecen parados en el centro de la sala hasta que el jugador entra en la sala
      if (enemy.isBoss && enemy.dormant) {
        enemy.walkCycle = 0;
        if (this.isPlayerInBossArena(enemy)) {
          this.awakenBoss(enemy, now);
        } else {
          continue;
        }
      }

      if (enemy.painTimer > 0 || enemy.stunTimer > 0) continue;

      if (enemy.targetEnemy && !enemy.targetEnemy.alive) enemy.targetEnemy = null;
      const targetX = enemy.targetEnemy ? enemy.targetEnemy.x : player.x;
      const targetY = enemy.targetEnemy ? enemy.targetEnemy.y : player.y;

      const dist = Math.hypot(targetX - enemy.x, targetY - enemy.y);
      enemy.cooldown = Math.max(0, enemy.cooldown - dt);
      enemy.rangedCooldown = Math.max(0, (enemy.rangedCooldown || 0) - dt);

      enemy.growlTimer -= dt;
      if (enemy.growlTimer <= 0) {
        enemy.growlTimer = (enemy.isBoss ? 2.6 : 4.2) + Math.random() * 4.0;
        if (dist < 16) this.audio.playMonsterGrowl(enemy.kind, dist);
      }

      const maxChaseDist = evType === 'BLOOD_FOG' ? 15.5 : 23.0;
      if (dist >= maxChaseDist) continue;

      const hasLOS = this.lineOfSight(enemy.x, enemy.y, targetX, targetY);
      const toX = (targetX - enemy.x) / Math.max(0.001, dist);
      const toY = (targetY - enemy.y) / Math.max(0.001, dist);

      // Sistema de alerta por visión, proximidad o alarma de compañeros
      if (!enemy.isBoss && !enemy.alerted) {
        if ((hasLOS && dist < 15.5) || dist < 4.5) {
          enemy.alerted = true;
          this.alertNearbyEnemies(enemy.x, enemy.y, 5.5);
        } else {
          // Patrulla lenta sin atravesar paredes
          enemy.walkCycle += dt * 2.5;
          const pAngle = (enemy.facingAngle || 0) + Math.sin(now * 0.001 + enemy.id) * 0.3;
          const res = this.moveEnemyWithCollision(enemy, Math.cos(pAngle) * 0.35 * dt, Math.sin(pAngle) * 0.35 * dt, 0.28);
          if (res.hitWall) enemy.facingAngle = (enemy.facingAngle || 0) + Math.PI * 0.65;
          continue;
        }
      }

      if (enemy.isBoss) {
        const bCfg = enemy.holdsKey ? CONFIG.ENEMIES.BOSS : CONFIG.ENEMIES.CHAMPION;

        // Activación de Fase ENRAGED al bajar del 45% de vida
        if (!enemy.enraged && enemy.health <= enemy.maxHealth * 0.45) {
          enemy.enraged = true;
          enemy.speedMultiplier *= 1.24;
          this.audio.playBossChargeWarning();
          this.pushLootNotification(`🔥 ¡${enemy.kind} ENFURECIDO!`, ['VELOCIDAD Y HABILIDADES ESPECIALES AUMENTADAS'], '#d90429');
        }

        enemy.bossTimer -= dt;
        enemy.dashCooldown = Math.max(0, (enemy.dashCooldown || 0) - dt);
        enemy.stompCd = Math.max(0, (enemy.stompCd || 0) - dt);
        enemy.specialCd = Math.max(0, (enemy.specialCd || 0) - dt);
        enemy.facingAngle = Math.atan2(toY, toX);

        if (enemy.bossState === 'CHASE') {
          const bSpeed = 1.08 * enemy.speedMultiplier * dt;
          let moveDirX = toX;
          let moveDirY = toY;
          if (!hasLOS) {
            const flow = this.getFlowStep(enemy.x, enemy.y);
            if (flow) {
              moveDirX = flow.dirX;
              moveDirY = flow.dirY;
            }
          }
          const weave = hasLOS ? Math.sin(now * 0.006 + enemy.id) * 0.72 * enemy.strafeDir : 0;
          const mx = (moveDirX + -moveDirY * weave) * bSpeed;
          const my = (moveDirY + moveDirX * weave) * bSpeed;

          if (dist > 1.25) {
            const res = this.moveEnemyWithCollision(enemy, mx, my, 0.34);
            if (res.hitWall) enemy.strafeDir *= -1;
          }
          enemy.walkCycle += dt * 7.5;

          // Mecánica especial propia del Jefe del Sector
          if (hasLOS && dist < 14 && enemy.specialCd <= 0) {
            this.triggerBossSpecial(enemy, toX, toY, dist, now);
          }

          // 1. Dash táctico lateral o salto atrás con ráfaga en abanico
          if (hasLOS && dist > 2.0 && dist < 13.5 && enemy.dashCooldown <= 0) {
            const roll = Math.random();
            if (roll < 0.55) {
              this.triggerBossDash(enemy, toX, toY, 'LATERAL');
            } else {
              this.triggerBossDash(enemy, toX, toY, 'BACKSTEP');
              this.fireBossSpreadBarrage(enemy, toX, toY, dist);
              enemy.rangedCooldown = 1.6;
            }
            continue;
          }

          const tier = (this.level - 1) / Math.max(1, MAX_LEVELS - 1);

          // Pisotón de área: telegrafiado, rompe el suelo y castiga quedarse cerca
          if (hasLOS && dist < 6.5 && enemy.stompCd <= 0) {
            enemy.bossState = 'STOMP_WINDUP';
            enemy.bossTimer = Math.max(0.7, 1.05 - tier * 0.25);
            enemy.stompCd = Math.max(3.0, ((enemy.holdsKey ? bCfg : CONFIG.ENEMIES.CHAMPION).stompCooldown || 7.5) - tier * 2.2);
            this.audio.playBossChargeWarning();
            this.onStatus(`⚠️ ¡${enemy.kind} PREPARA UN PISOTÓN! Aléjate del área`);
            continue;
          }

          // 2. Disparo con cadencia pausada en Sector 1 y rápida en Sector 10
          if (hasLOS && dist > 2.8 && dist < 14.5 && enemy.rangedCooldown <= 0) {
            const baseCd = 2.8 - tier * 1.1;
            enemy.rangedCooldown = enemy.enraged ? baseCd * 0.78 : baseCd;
            this.fireBossSpreadBarrage(enemy, toX, toY, dist);
          }

          // 3. Inicio de carga de embestida
          if (enemy.bossTimer <= 0 && dist > 2.4 && dist < 12.5 && hasLOS) {
            enemy.bossState = 'WINDUP';
            enemy.bossTimer = (bCfg.windupSec - tier * 0.32) * (enemy.enraged ? 0.85 : 1.0);
            enemy.chargeDirX = toX;
            enemy.chargeDirY = toY;
            this.audio.playBossChargeWarning();
            this.onStatus(`⚠️ ¡${enemy.kind} CARGA EMBESTIDA! Esquiva con [A/D]`);
          }
        } else if (enemy.bossState === 'DASH') {
          const tier = (this.level - 1) / Math.max(1, MAX_LEVELS - 1);
          const dSpeed = (bCfg.dashSpeed + tier * 2.8) * (enemy.enraged ? 1.12 : 1.0) * dt;
          this.moveEnemyWithCollision(enemy, enemy.dashDirX * dSpeed, enemy.dashDirY * dSpeed, 0.34);
          enemy.walkCycle += dt * 20;

          if (Math.random() < 0.65) {
            this.spawnWallSparks(enemy.x, enemy.y, 2, enemy.holdsKey ? '#ffbe0b' : '#00f5d4');
          }

          if (enemy.bossTimer <= 0) {
            if (this.level >= 4 && enemy.enraged && hasLOS && dist > 2.5 && Math.random() < 0.4) {
              enemy.bossState = 'WINDUP';
              enemy.bossTimer = 0.52;
              enemy.chargeDirX = toX;
              enemy.chargeDirY = toY;
              this.audio.playBossChargeWarning();
            } else {
              enemy.bossState = 'CHASE';
              enemy.bossTimer = 2.6 - tier * 1.0;
            }
          }
        } else if (enemy.bossState === 'STOMP_WINDUP') {
          enemy.walkCycle += dt * 10;
          if (Math.random() < 0.45) {
            const a = Math.random() * Math.PI * 2;
            this.wallSparks.push({
              x: enemy.x + Math.cos(a) * 0.5,
              y: enemy.y + Math.sin(a) * 0.5,
              z: 0.05,
              vx: Math.cos(a) * 0.7,
              vy: Math.sin(a) * 0.7,
              vz: -0.8,
              life: 0.3,
              color: '#ff4d00'
            });
          }
          if (enemy.bossTimer <= 0) {
            this.bossStomp(enemy);
            enemy.bossState = 'RECOVER';
            enemy.bossTimer = Math.max(0.45, bCfg.recoverSec * 0.75);
          }
        } else if (enemy.bossState === 'WINDUP') {
          enemy.walkCycle += dt * 14;
          if (enemy.bossTimer > bCfg.windupSec * 0.55) {
            enemy.chargeDirX = toX;
            enemy.chargeDirY = toY;
          }
          if (enemy.bossTimer <= 0) {
            enemy.bossState = 'CHARGE';
            enemy.bossTimer = bCfg.chargeSec;
            this.audio.playBossDash(dist);
          }
        } else if (enemy.bossState === 'CHARGE') {
          const tier = (this.level - 1) / Math.max(1, MAX_LEVELS - 1);
          const cSpeed = (bCfg.chargeSpeed + tier * 2.6) * (enemy.enraged ? 1.12 : 1.0) * dt;
          const res = this.moveEnemyWithCollision(enemy, enemy.chargeDirX * cSpeed, enemy.chargeDirY * cSpeed, 0.34);
          if (!res.hitWall) {
            enemy.walkCycle += dt * 18;
            if (Math.random() < 0.6) this.spawnWallSparks(enemy.x, enemy.y, 2, '#ff4d00');
          } else {
            enemy.bossState = 'RECOVER';
            enemy.bossTimer = bCfg.recoverSec - tier * 0.3;
            enemy.painTimer = 0.4;
            this.screenShake = this.reducedEffects ? 0.1 : 0.3;
          }
          if (enemy.bossTimer <= 0) {
            enemy.bossState = 'RECOVER';
            enemy.bossTimer = bCfg.recoverSec - tier * 0.3;
          }
        } else if (enemy.bossState === 'RECOVER' && enemy.bossTimer <= 0) {
          const tier = (this.level - 1) / Math.max(1, MAX_LEVELS - 1);
          enemy.bossState = 'CHASE';
          enemy.bossTimer = (2.8 - tier * 1.1) * (enemy.enraged ? 0.8 : 1.0);
        }
      } else {
        // Demonios regulares con Pathfinding BFS y detección de paredes
        enemy.dashCooldown = Math.max(0, (enemy.dashCooldown || 0) - dt);

        if (enemy.kind === 'SHIELD') {
          const targetAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
          const diff = Math.atan2(Math.sin(targetAngle - enemy.facingAngle), Math.cos(targetAngle - enemy.facingAngle));
          const maxTurn = dt * 2.4;
          enemy.facingAngle += clamp(diff, -maxTurn, maxTurn);
        }

        if (enemy.kind === 'LOST_SOUL') {
          this.updateLostSoul(enemy, player, dt, now, dist, toX, toY);
          continue;
        }

        if (enemy.kind === 'SUMMONER') {
          this.updateSummoner(enemy, player, dt, now, dist, hasLOS, toX, toY);
        } else if (enemy.dashTime > 0) {
          enemy.dashTime -= dt;
          const dSpeed = (enemy.kind === 'PINKY' ? 5.6 : 4.6) * dt;
          const res = this.moveEnemyWithCollision(enemy, enemy.dashDirX * dSpeed, enemy.dashDirY * dSpeed, 0.27);
          if (res.hitWall) enemy.dashTime = 0;
          enemy.facingAngle = Math.atan2(enemy.dashDirY, enemy.dashDirX);
          enemy.walkCycle += dt * 18;
          if (Math.random() < 0.5) this.spawnWallSparks(enemy.x, enemy.y, 2, '#ff4d00');
        } else {
          const canDash =
            hasLOS &&
            dist > 1.4 &&
            dist < 9.5 &&
            enemy.dashCooldown <= 0 &&
            Math.random() < (enemy.dashChance || 0);
          if (canDash) {
            enemy.dashTime = enemy.kind === 'PINKY' ? 0.36 : 0.26;
            enemy.dashDirX = toX;
            enemy.dashDirY = toY;
            enemy.dashCooldown = (enemy.kind === 'PINKY' ? 2.2 : 3.6) + Math.random() * 2.0;
            this.audio.playBossDash(dist);
            this.spawnWallSparks(enemy.x, enemy.y, 6, '#ff4d00');
          }

          if (hasLOS && enemy.projSpeed > 0 && dist > 2.4 && dist < 14.0 && enemy.rangedCooldown <= 0) {
            enemy.rangedCooldown = 2.2 + Math.random() * 1.3;
            const pSpeed = enemy.projSpeed || 6.5;
            const key = enemy.kind || 'IMP';
            const isHoming = key === 'REVENANT';
            this.enemyProjectiles.push({
              ownerId: enemy.id,
              ownerKind: enemy.kind,
              ownerRef: enemy,
              x: enemy.x + toX * 0.4,
              y: enemy.y + toY * 0.4,
              vx: toX * pSpeed,
              vy: toY * pSpeed,
              speed: pSpeed,
              homing: isHoming,
              turnRate: isHoming ? 1.5 : 0,
              life: isHoming ? 3.0 : 2.6,
              damage: enemy.projDamage || 10,
              sprite: this.orbSprites[key] || this.orbSprites.IMP
            });
            this.audio.playDemonFireball(dist);
          }

          if (dist > 0.95) {
            const step = 0.78 * enemy.speedMultiplier * dt;
            let dirX = toX;
            let dirY = toY;

            // Si hay muros entre el demonio y el jugador, sigue el Flow Field BFS para rodear paredes y cruzar puertas
            if (!hasLOS && !enemy.targetEnemy) {
              const flow = this.getFlowStep(enemy.x, enemy.y);
              if (flow) {
                dirX = flow.dirX;
                dirY = flow.dirY;
              }
            }

            let mx = dirX * step;
            let my = dirY * step;
            if (hasLOS && enemy.movePattern === 'STRAFE') {
              const w = Math.sin(now * 0.005 + enemy.walkCycle) * enemy.strafeDir;
              mx += -dirY * step * 0.82 * w;
              my += dirX * step * 0.82 * w;
            } else if (hasLOS && enemy.movePattern === 'HOVER') {
              mx += -dirY * step * 0.48 * enemy.strafeDir;
              my += dirX * step * 0.48 * enemy.strafeDir;
            }

            // Separación suave entre demonios para que te rodeen en vez de apilarse en el mismo punto
            for (const other of this.enemies) {
              if (other === enemy || !other.alive) continue;
              const odx = enemy.x - other.x;
              const ody = enemy.y - other.y;
              const od = Math.hypot(odx, ody);
              if (od > 0.001 && od < 0.72) {
                const push = ((0.72 - od) / 0.72) * step * 0.65;
                mx += (odx / od) * push;
                my += (ody / od) * push;
              }
            }

            const res = this.moveEnemyWithCollision(enemy, mx, my, 0.27);
            if (res.hitWall) {
              enemy.strafeDir *= -1;
              // Si chocó con una esquina teniendo LOS parcial, usa el paso del Flow Field para desatascarse
              const flow = this.getFlowStep(enemy.x, enemy.y);
              if (flow) {
                this.moveEnemyWithCollision(enemy, flow.dirX * step, flow.dirY * step, 0.27);
              }
            }
            if (enemy.kind !== 'SHIELD') {
              enemy.facingAngle = Math.atan2(my, mx);
            }
            enemy.walkCycle += dt * (enemy.kind === 'PINKY' ? 8.2 : 5.4);
          }
        }
      }

      if (!enemy.targetEnemy && dist <= 1.15 && enemy.cooldown <= 0) {
        this.damagePlayer(enemy.damage, enemy.x, enemy.y, now);
        enemy.cooldown = enemy.kind === 'PINKY' ? 0.75 : 0.95;
      }
    }

    this.recoil = Math.max(0, this.recoil - dt * 3.6);
    this.muzzleFlash = Math.max(0, this.muzzleFlash - dt * 6.5);

    if (player.health <= 0) {
      this.startDeathSequence(now);
      return;
    }

    if (this.exitDoor && distance(player.x, player.y, this.exitDoor.x, this.exitDoor.y) < 1.1) {
      if (!player.hasKey) {
        this.onStatus('🔒 COMPUERTA EXIT BLOQUEADA: Derrota al BOSS GUARDIÁN y recoge su LLAVE 🔑');
      } else if (this.level >= MAX_LEVELS) {
        if ((this.sectorDamageTaken || 0) === 0) {
          this.runStats.perfectSectors = (this.runStats.perfectSectors || 0) + 1;
        }
        this.startVictorySequence(now);
      } else {
        this.startIntermission(now);
      }
    }
  }

  updateLostSoul(enemy, player, dt, now, dist, toX, toY) {
    enemy.walkCycle += dt * 14;
    enemy.facingAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

    if (dist <= 1.0) {
      this.destroyLostSoul(enemy, now);
      return;
    }

    const hasLOS = this.lineOfSight(enemy.x, enemy.y, player.x, player.y);
    let dirX = toX;
    let dirY = toY;
    if (!hasLOS) {
      const flow = this.getFlowStep(enemy.x, enemy.y);
      if (flow) {
        dirX = flow.dirX;
        dirY = flow.dirY;
      }
    }

    const step = 2.2 * enemy.speedMultiplier * dt;
    const weave = Math.sin(now * 0.011 + enemy.id * 1.7) * 0.24;
    const mx = (dirX - dirY * weave) * step;
    const my = (dirY + dirX * weave) * step;
    const res = this.moveEnemyWithCollision(enemy, mx, my, 0.25);
    if (res.hitWall) enemy.strafeDir *= -1;

    if (Math.random() < 0.35) {
      this.wallSparks.push({
        x: enemy.x + (Math.random() - 0.5) * 0.4,
        y: enemy.y + (Math.random() - 0.5) * 0.4,
        z: 0.12,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: -0.5,
        life: 0.2,
        color: Math.random() < 0.5 ? '#ff4d00' : '#ffbe0b'
      });
    }
  }

  updateSummoner(enemy, player, dt, now, dist, hasLOS, toX, toY) {
    enemy.walkCycle += dt * 5;
    enemy.facingAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);

    if (hasLOS && dist > 2.6 && dist < 13 && enemy.rangedCooldown <= 0) {
      enemy.rangedCooldown = 3.2 + Math.random() * 1.8;
      const pSpeed = enemy.projSpeed || 6.8;
      this.enemyProjectiles.push({
        ownerId: enemy.id,
        ownerKind: enemy.kind,
        ownerRef: enemy,
        x: enemy.x + toX * 0.4,
        y: enemy.y + toY * 0.4,
        vx: toX * pSpeed,
        vy: toY * pSpeed,
        life: 2.6,
        damage: enemy.projDamage || 8,
        sprite: this.orbSprites.SUMMONER
      });
      this.audio.playDemonFireball(dist);
    }

    if (enemy.revivesLeft > 0 && enemy.reviveCd <= 0) {
      const corpse = this.findRevivableCorpse(enemy);
      if (corpse && this.reviveCorpse(corpse, enemy)) {
        enemy.revivesLeft--;
        enemy.reviveCd = CONFIG.SUMMONER_REVIVE_CD[0] + Math.random() * (CONFIG.SUMMONER_REVIVE_CD[1] - CONFIG.SUMMONER_REVIVE_CD[0]);
      } else {
        enemy.reviveCd = 1.4;
      }
    }

    let mx = 0;
    let my = 0;
    if (dist < 8.5) {
      mx = -toX;
      my = -toY;
    } else if (dist > 15) {
      const flow = !hasLOS ? this.getFlowStep(enemy.x, enemy.y) : null;
      mx = flow ? flow.dirX : toX;
      my = flow ? flow.dirY : toY;
    } else {
      mx = -toY * enemy.strafeDir * 0.8;
      my = toX * enemy.strafeDir * 0.8;
    }

    const step = 1.0 * enemy.speedMultiplier * dt;
    const res = this.moveEnemyWithCollision(enemy, mx * step, my * step, 0.28);
    if (res.hitWall) {
      enemy.strafeDir *= -1;
    }

    if (Math.random() < 0.3) {
      this.wallSparks.push({
        x: enemy.x + (Math.random() - 0.5) * 0.5,
        y: enemy.y + (Math.random() - 0.5) * 0.5,
        z: -0.25,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: 0.35,
        life: 0.45,
        color: '#70e000'
      });
    }
  }

  findRevivableCorpse(summoner) {
    let best = null;
    let bestDist = Infinity;
    for (const enemy of this.enemies) {
      if (enemy === summoner || enemy.alive || enemy.state !== 'CORPSE' || enemy.isBoss) continue;
      if (enemy.kind === 'SUMMONER' || enemy.kind === 'LOST_SOUL') continue;
      if ((enemy.reviveCount || 0) >= 1) continue;
      const d = distance(summoner.x, summoner.y, enemy.x, enemy.y);
      if (d < 13 && d < bestDist && this.lineOfSight(summoner.x, summoner.y, enemy.x, enemy.y)) {
        best = enemy;
        bestDist = d;
      }
    }
    return best;
  }

  reviveCorpse(corpse, summoner) {
    if (!corpse || corpse.alive) return false;
    corpse.alive = true;
    corpse.state = 'ALIVE';
    corpse.wasRevived = true;
    corpse.alerted = true;
    corpse.health = Math.max(1, corpse.maxHealth * 0.45);
    corpse.deathTimer = 0;
    corpse.hitFlash = 0;
    corpse.painTimer = 0;
    corpse.burnTimer = 0;
    corpse.cooldown = 0;
    corpse.targetEnemy = null;
    corpse.gloryArmed = false;
    corpse.gloryUntil = 0;
    corpse.reviveCount = (corpse.reviveCount || 0) + 1;
    corpse.walkCycle = Math.random() * 10;

    this.audio.playSummon();
    this.spawnBlood(corpse.x, corpse.y, 20, '#70e000');
    this.spawnWallSparks(corpse.x, corpse.y, 12, '#70e000');
    this.shockwaves.push({
      x: corpse.x,
      y: corpse.y,
      radius: 0.5,
      maxRadius: 2.0,
      life: 0.5,
      maxLife: 0.5
    });
    this.pushLootNotification(
      '☠️ NIGROMANTE REVIVE UN CADÁVER',
      [`${corpse.kind} vuelve con ${Math.round(corpse.health)} HP`, 'NO SUMA BAJA EXTRA · MATA AL INVOCADOR'],
      '#70e000'
    );
    this.onStatus(`☠️ ¡${summoner.kind} ha revivido un ${corpse.kind}! Prioriza al invocador`);
    return true;
  }

  shoot() {
    if (!this.running || this.paused || this.finished || this.intermission || this.shopOpen || this.mapOpen) return;
    const now = performance.now();
    if (now < this.shotUntil) return;
    const w = this.player.weapon;
    const dmgMult = (now < this.player.berserkUntil ? 2.0 : 1.0) * (1 + (this.weaponDamageBonus || 0));

    // Alerta por sonido a los demonios cercanos al disparar
    this.alertNearbyEnemies(this.player.x, this.player.y, w === 4 ? 7 : 14);

    if (w === 4) {
      this.shotUntil = now + CONFIG.CHAINSAW_COOLDOWN_MS;
      this.shotStartTime = now;
      this.recoil = 0.22;
      this.muzzleFlash = Math.max(this.muzzleFlash, 0.32);
      this.audio.playChainsaw();

      let target = null;
      let bestDist = Infinity;
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const d = distance(this.player.x, this.player.y, enemy.x, enemy.y);
        if (d > CONFIG.CHAINSAW_RANGE || d >= bestDist) continue;
        const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        const delta = Math.atan2(Math.sin(angle - this.player.angle), Math.cos(angle - this.player.angle));
        if (Math.abs(delta) > 0.85) continue;
        if (!this.lineOfSight(this.player.x, this.player.y, enemy.x, enemy.y)) continue;
        target = enemy;
        bestDist = d;
      }

      if (target) {
        if (target.isBoss && target.dormant) this.awakenBoss(target, now);
        target.alerted = true;
        const isGlory = target.gloryUntil > now;
        target.hitFlash = 0.14;
        target.health -= CONFIG.CHAINSAW_DAMAGE * dmgMult;
        target.targetEnemy = null;
        this.spawnBlood(target.x, target.y, 10);
        this.hitmarkerUntil = now + 100;
        if (now - this.lastHitmarkerSound > 80) {
          this.lastHitmarkerSound = now;
          this.audio.playHitmarker();
        }
        if (isGlory) {
          this.executeGloryKill(target, true);
        } else if (target.health <= 0) {
          this.killEnemy(target, 'CHAINSAW');
        }
      } else {
        const wallDist = Math.min(CONFIG.CHAINSAW_RANGE, this.zBuffer[Math.floor(WIDTH / 2)] || 1.4);
        const hx = this.player.x + Math.cos(this.player.angle) * Math.max(0.2, wallDist - 0.2);
        const hy = this.player.y + Math.sin(this.player.angle) * Math.max(0.2, wallDist - 0.2);
        this.spawnWallSparks(hx, hy, 3, '#adb5bd');
      }
      return;
    }

    if (w === 3) {
      if (this.player.fuel <= 0.05) {
        this.player.fuel = 0;
        this.audio.playEmptyClip();
        this.shotUntil = now + 250;
        this.onStatus('¡SIN GASOLINA! Compra al mercader [E] o abre cofres con suministros');
        return;
      }
      this.shotUntil = now + CONFIG.FLAMER_COOLDOWN_MS;
      this.shotStartTime = now;
      this.player.fuel = Math.max(0, Number((this.player.fuel - (CONFIG.FLAMER_FUEL_COST || 0.35)).toFixed(2)));
      this.recoil = 0.28;
      this.muzzleFlash = 0.95;
      this.audio.playFlamethrower();

      for (let i = 0; i < 2; i++) {
        const spread = (Math.random() - 0.5) * 0.22;
        const angle = this.player.angle + spread;
        const speed = 11.5 + Math.random() * 2.5;
        const maxLife = 0.52 + Math.random() * 0.18;
        this.flameProjectiles.push({
          x: this.player.x + Math.cos(angle) * 0.32,
          y: this.player.y + Math.sin(angle) * 0.32,
          dirX: Math.cos(angle),
          dirY: Math.sin(angle),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          age: 0,
          life: maxLife,
          maxLife,
          scale: 0.34,
          zOffset: 0.08,
          seed: Math.random() * 10,
          damage: CONFIG.FLAMER_DAMAGE * dmgMult,
          hitSet: new Set()
        });
      }
      return;
    }

    if (this.player.ammo <= 0) {
      if (this.player.reserve > 0) {
        this.reload();
        return;
      }
      this.audio.playEmptyClip();
      this.shotUntil = now + 250;
      this.onStatus('¡SIN CARTUCHOS! Compra al mercader [E] o abre cofres con suministros');
      return;
    }

    const isChaingun = w === 2;
    this.shotUntil = now + (isChaingun ? CONFIG.CHAINGUN_COOLDOWN_MS : CONFIG.SHOTGUN_COOLDOWN_MS);
    this.shotStartTime = now;
    this.player.ammo -= 1;
    this.recoil = isChaingun ? 0.5 : 1.0;
    this.muzzleFlash = 1;
    this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.04 : (isChaingun ? 0.05 : 0.15));
    if (isChaingun) this.audio.playChaingun();
    else this.audio.playShotgun();

    // Super Escopeta dispara 7 perdigones reales en abanico; Chaingun dispara 1 rayo preciso
    const pelletCount = isChaingun ? 1 : (CONFIG.SHOTGUN_PELLET_COUNT || 7);
    const spreadSpan = isChaingun ? 0.03 : (CONFIG.SHOTGUN_SPREAD || 0.19);
    const hitMap = new Map();
    let hitAnyBarrel = false;
    let shieldBlocked = false;

    for (let p = 0; p < pelletCount; p++) {
      const ratio = pelletCount === 1 ? 0 : (p / (pelletCount - 1)) - 0.5;
      const rayAngle = this.player.angle + ratio * spreadSpan + (Math.random() - 0.5) * 0.015;

      // Comprobar impacto en barriles explosivos
      for (const barrel of this.barrels) {
        if (barrel.exploded) continue;
        const bDist = distance(this.player.x, this.player.y, barrel.x, barrel.y);
        if (bDist > 16) continue;
        const bAng = Math.atan2(barrel.y - this.player.y, barrel.x - this.player.x);
        const bDelta = Math.abs(Math.atan2(Math.sin(bAng - rayAngle), Math.cos(bAng - rayAngle)));
        if (bDelta < Math.max(0.05, 0.22 / Math.max(1, bDist)) && this.lineOfSight(this.player.x, this.player.y, barrel.x, barrel.y)) {
          this.explodeBarrel(barrel, now);
          hitAnyBarrel = true;
          break;
        }
      }

      let selected = null;
      let bestEnemyDist = Infinity;
      for (const enemy of this.enemies) {
        if (!enemy.alive) continue;
        const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
        if (dist >= 18 || dist >= bestEnemyDist) continue;
        const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        const delta = Math.abs(Math.atan2(Math.sin(angle - rayAngle), Math.cos(angle - rayAngle)));
        const cone = enemy.isBoss ? 0.34 : (isChaingun ? 0.16 : 0.26);
        if (delta < Math.max(0.06, cone / Math.max(0.85, dist)) && this.lineOfSight(this.player.x, this.player.y, enemy.x, enemy.y)) {
          selected = enemy;
          bestEnemyDist = dist;
        }
      }

      if (selected) {
        const angleToPlayer = Math.atan2(this.player.y - selected.y, this.player.x - selected.x);
        const facingDiff = Math.abs(Math.atan2(
          Math.sin(angleToPlayer - (selected.facingAngle || 0)),
          Math.cos(angleToPlayer - (selected.facingAngle || 0))
        ));
        if (selected.kind === 'SHIELD' && facingDiff < CONFIG.SHIELD_BLOCK_ARC) {
          selected.shieldFlash = 0.28;
          selected.hitFlash = 0.05;
          shieldBlocked = true;
          continue;
        }
        const prev = hitMap.get(selected) || { pellets: 0, dist: bestEnemyDist };
        prev.pellets += 1;
        prev.dist = Math.min(prev.dist, bestEnemyDist);
        hitMap.set(selected, prev);
      } else {
        const colX = clamp(Math.floor(WIDTH / 2 + ratio * 48), 0, WIDTH - 1);
        const wallDist = Math.min(12, this.zBuffer[colX] || 4);
        const hx = this.player.x + Math.cos(rayAngle) * (wallDist - 0.15);
        const hy = this.player.y + Math.sin(rayAngle) * (wallDist - 0.15);
        this.spawnWallSparks(hx, hy, 1);
      }
    }

    if (shieldBlocked && hitMap.size === 0) {
      if (now - this.lastShieldBlockAt > 140) {
        this.lastShieldBlockAt = now;
        this.audio.playShieldBlock();
      }
      if (now - (this.lastShieldStatusAt || 0) > 1100) {
        this.lastShieldStatusAt = now;
        this.onStatus('🛡️ EL DEMONIO CON ESCUDO BLOQUEA EL FUEGO FRONTAL: rodéalo, quémalo o usa la motosierra');
      }
      this.hitmarkerUntil = now + 80;
    }

    if (hitMap.size > 0 || hitAnyBarrel) {
      this.hitmarkerUntil = now + 110;
      if (now - this.lastHitmarkerSound > 70) {
        this.lastHitmarkerSound = now;
        this.audio.playHitmarker();
      }
    }

    for (const [selected, info] of hitMap.entries()) {
      if (!selected.alive) continue;
      if (selected.isBoss && selected.dormant) this.awakenBoss(selected, now);
      selected.alerted = true;
      const pelletDmg = isChaingun ? CONFIG.CHAINGUN_DAMAGE : (CONFIG.SHOTGUN_PELLET_DAMAGE || 0.44);
      const closeBonus = !isChaingun && info.dist < 4.2 ? 1.32 : 1.0;
      const totalDmg = pelletDmg * info.pellets * closeBonus * dmgMult;
      selected.health -= totalDmg;
      selected.hitFlash = 0.16;
      selected.targetEnemy = null;

      const dodgeChance = 0.1 + ((this.level - 1) / Math.max(1, MAX_LEVELS - 1)) * 0.38;
      if (selected.isBoss && selected.alive && selected.bossState === 'CHASE' && selected.reactDashCd <= 0 && Math.random() < dodgeChance) {
        selected.reactDashCd = 2.8 - ((this.level - 1) / Math.max(1, MAX_LEVELS - 1)) * 1.3;
        const toX = (this.player.x - selected.x) / Math.max(0.001, info.dist);
        const toY = (this.player.y - selected.y) / Math.max(0.001, info.dist);
        this.triggerBossDash(selected, toX, toY, 'LATERAL');
      } else if (!isChaingun && Math.random() < (selected.painChance || 0.45)) {
        selected.painTimer = 0.22;
      }

      this.spawnBlood(selected.x, selected.y, isChaingun ? 8 : Math.min(18, 4 + info.pellets * 2));
      if (selected.health <= 0) this.killEnemy(selected, 'SHOT');
    }

    if (this.player.ammo === 0 && this.player.reserve > 0) this.reload();
  }

  reload() {
    if (!this.running || this.paused || this.finished || this.player.weapon === 4) return;
    if (this.player.ammo >= CLIP_SIZE || this.player.reserve <= 0) return;
    const loaded = Math.min(CLIP_SIZE - this.player.ammo, this.player.reserve);
    this.player.ammo += loaded;
    this.player.reserve -= loaded;
    this.shotUntil = performance.now() + (this.hasUpgrade('FAST_RELOAD') ? 115 : 180);
    this.audio.playReload();
  }

  lineOfSight(x1, y1, x2, y2) {
    const rawDist = distance(x1, y1, x2, y2);
    if (!Number.isFinite(rawDist)) return false;
    const steps = Math.min(220, Math.ceil(rawDist * 8));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (this.isWall(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return false;
    }
    return true;
  }

  computeMedals(won = false) {
    const s = this.runStats || {};
    const medals = [];
    if ((s.chainsawKills || 0) >= 15) {
      medals.push({ id: 'BUTCHER', name: 'CARNICERO', desc: `${s.chainsawKills} bajas con motosierra`, color: '#ff4d00', icon: '🪚' });
    }
    if ((s.perfectSectors || 0) >= 1) {
      medals.push({ id: 'UNTOUCHABLE', name: 'INTOCABLE', desc: `${s.perfectSectors} sector${s.perfectSectors === 1 ? '' : 'es'} sin recibir daño`, color: '#00f5d4', icon: '🛡️' });
    }
    if ((s.secretsTotal || 0) > 0 && ((s.secretsFound || 0) >= (s.secretsTotal || 1) || (s.secretsFound || 0) >= 4)) {
      medals.push({ id: 'TREASURE', name: 'CAZATESOROS', desc: `Cámaras secretas abiertas (${s.secretsFound}/${s.secretsTotal})`, color: '#ffd700', icon: '🗝️' });
    }
    if ((s.flamerKills || 0) >= 12) {
      medals.push({ id: 'PYRO', name: 'PIRÓMANO', desc: `${s.flamerKills} demonios calcinados con fuego`, color: '#ff9e00', icon: '🔥' });
    }
    if ((s.gloryKills || 0) >= 6) {
      medals.push({ id: 'EXECUTIONER', name: 'VERDUGO', desc: `${s.gloryKills} ejecuciones de gloria`, color: '#00b4d8', icon: '💀' });
    }
    if ((s.meleeKills || 0) >= 5 || (s.punches || 0) >= 12) {
      medals.push({ id: 'IRONFIST', name: 'PUÑO DE HIERRO', desc: `${s.meleeKills || 0} bajas a golpes (${s.punches || 0} puñetazos)`, color: '#ffbe0b', icon: '👊' });
    }
    if ((s.bossKills || 0) >= 2) {
      medals.push({ id: 'GIANTSLAYER', name: 'MATAGIGANTES', desc: `${s.bossKills} jefes abisales abatidos`, color: '#d90429', icon: '⚔️' });
    }
    if ((s.maxCombo || 0) >= 4) {
      medals.push({ id: 'UNSTOPPABLE', name: 'IMPARABLE', desc: `Racha máxima x${s.maxCombo} en combate`, color: '#9d4edd', icon: '⚡' });
    }
    if ((s.explosionKills || 0) >= 5) {
      medals.push({ id: 'DEMOLISHER', name: 'DEMOLEDOR', desc: `${s.explosionKills} bajas por explosión`, color: '#ff9e00', icon: '💥' });
    }
    if (won) {
      medals.push({ id: 'SURVIVOR', name: 'LEYENDA DEL INFIERNO', desc: 'Los 10 sectores conquistados', color: '#70e000', icon: '👑' });
    }
    if (medals.length === 0) {
      if ((this.player?.kills || 0) >= 15) {
        medals.push({ id: 'SLAYER', name: 'EXTERMINADOR UAC', desc: `${this.player.kills} hostiles eliminados`, color: '#ffbe0b', icon: '🎖️' });
      } else if ((this.player?.kills || 0) >= 5) {
        medals.push({ id: 'HUNTER', name: 'CAZADEMONIOS', desc: `${this.player.kills} bajas confirmadas`, color: '#ff4d00', icon: '🩸' });
      } else {
        medals.push({ id: 'FALLEN', name: 'CARNE DE CAÑÓN', desc: `Caído en el Sector ${this.level}`, color: '#d90429', icon: '☠️' });
      }
    }
    return medals;
  }

  startVictorySequence(now = performance.now()) {
    if (this.victorySequence || this.finished) return;
    this.mouseDown = false;
    this.mapOpen = false;
    this.shopOpen = false;
    this.intermission = null;
    this.audio.playSectorPortal();
    const snap = this.captureCurrentScreen('rgba(255, 190, 11, 0.25)');
    this.earnedMedals = this.computeMedals(true);
    this.victorySequence = {
      startTime: now,
      finishAt: now + 4200
    };
    this.startScreenMelt('VICTORY', snap);
    this.onStatus('👑 ¡VICTORIA TOTAL! Los 10 sectores infernales han sido conquistados');
  }

  drawVictoryScreen(now = performance.now()) {
    const c = this.ctx;
    c.fillStyle = '#071209';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

    // Rayos dorados de victoria en el fondo
    for (let i = 0; i < 32; i++) {
      const bx = i * 10;
      const len = 14 + ((i * 23) % 38) + Math.sin(now * 0.004 + i) * 5;
      c.fillStyle = i % 2 === 0 ? 'rgba(112, 224, 0, 0.22)' : 'rgba(255, 190, 11, 0.2)';
      c.fillRect(bx, 0, 6, len);
    }

    c.strokeStyle = '#70e000';
    c.lineWidth = 2;
    c.strokeRect(10, 8, WIDTH - 20, VIEW_HEIGHT - 16);

    c.textAlign = 'center';
    c.font = 'bold 21px monospace';
    c.fillStyle = '#140708';
    c.fillText('¡VICTORIA TOTAL!', WIDTH / 2 + 2, 34);
    c.fillStyle = '#70e000';
    c.fillText('¡VICTORIA TOTAL!', WIDTH / 2, 32);

    c.font = 'bold 7.2px monospace';
    c.fillStyle = '#ffbe0b';
    c.fillText('LOS 10 SECTORES DEL ABISMO HAN SIDO PURGADOS', WIDTH / 2, 46);

    const killPts = this.player.kills * 100;
    const totalPts = killPts + this.bonusPoints;
    const elapsedSec = Math.max(1, Math.round((now - this.startTime) / 1000));
    const mins = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');

    c.fillStyle = 'rgba(14, 28, 16, 0.9)';
    c.fillRect(20, 52, WIDTH - 40, 26);
    c.strokeStyle = '#ffbe0b';
    c.lineWidth = 1;
    c.strokeRect(20.5, 52.5, WIDTH - 41, 25);

    c.font = 'bold 6.8px monospace';
    c.fillStyle = '#fff3b0';
    c.fillText(
      `BAJAS: ${this.player.kills} (+${killPts}) · BONUS COMBO: +${this.bonusPoints} · TOTAL: ${totalPts} PTS`,
      WIDTH / 2,
      62
    );
    c.font = 'bold 6.2px monospace';
    c.fillStyle = '#00f5d4';
    c.fillText(
      `TIEMPO: ${mins}:${secs} · SECRETOS: ${this.runStats.secretsFound || 0}/${this.runStats.secretsTotal || 0} · JEFES: ${this.runStats.bossKills || 0}`,
      WIDTH / 2,
      72
    );

    const medals = (this.earnedMedals || this.computeMedals(true)).slice(0, 4);
    c.font = 'bold 6.5px monospace';
    c.fillStyle = '#ffbe0b';
    c.fillText('CONDECORACIONES DE COMBATE OBTENIDAS:', WIDTH / 2, 87);

    medals.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = col === 0 ? 20 : 162;
      const by = 92 + row * 24;
      c.fillStyle = 'rgba(16, 26, 18, 0.94)';
      c.fillRect(bx, by, 138, 20);
      c.strokeStyle = m.color || '#70e000';
      c.lineWidth = 1;
      c.strokeRect(bx + 0.5, by + 0.5, 137, 19);
      c.textAlign = 'left';
      c.font = 'bold 6.8px monospace';
      c.fillStyle = m.color || '#70e000';
      c.fillText(`${m.icon || '★'} ${m.name}`, bx + 5, by + 8);
      c.font = '5.6px monospace';
      c.fillStyle = '#d8d2c5';
      c.fillText(m.desc, bx + 5, by + 16);
    });

    if (!this.melt && Math.floor(now / 320) % 2 === 0) {
      c.textAlign = 'center';
      c.font = 'bold 6.8px monospace';
      c.fillStyle = '#70e000';
      c.fillText('PULSA [ESPACIO] O CLIC PARA GUARDAR TU RÉCORD', WIDTH / 2, 152);
    }
  }

  startDeathSequence(now = performance.now()) {
    if (this.deathSequence || this.finished) return;
    this.mouseDown = false;
    this.mapOpen = false;
    this.shopOpen = false;
    this.intermission = null;
    this.audio.playPlayerDeath();
    const snap = this.captureCurrentScreen('rgba(185, 0, 18, 0.34)');
    this.earnedMedals = this.computeMedals(false);
    this.deathSequence = {
      startTime: now,
      finishAt: now + 2800
    };
    this.startScreenMelt('DEATH', snap);
    this.onStatus('💀 ¡HAS MUERTO! // Derramamiento de sangre...');
  }

  drawDeathScreen(now = performance.now()) {
    const c = this.ctx;
    c.fillStyle = '#0d0204';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

    // Columnas de sangre goteando por la pantalla
    for (let i = 0; i < 32; i++) {
      const bx = i * 10;
      const len = 18 + ((i * 29) % 45) + Math.sin(now * 0.004 + i) * 6;
      c.fillStyle = i % 2 === 0 ? 'rgba(140, 0, 12, 0.65)' : 'rgba(217, 4, 41, 0.45)';
      c.fillRect(bx, 0, 7, len);
      c.fillStyle = '#ff2a2a';
      c.fillRect(bx + 1, Math.max(0, len - 3), 4, 3);
    }

    c.strokeStyle = '#d90429';
    c.lineWidth = 2;
    c.strokeRect(12, 10, WIDTH - 24, VIEW_HEIGHT - 20);

    c.textAlign = 'center';
    c.font = 'bold 28px monospace';
    c.fillStyle = '#380006';
    c.fillText('MUERTO', WIDTH / 2 + 2, 46);
    c.fillStyle = '#ff1e27';
    c.fillText('MUERTO', WIDTH / 2, 44);

    c.font = 'bold 7.5px monospace';
    c.fillStyle = '#ffbe0b';
    const secName = CONFIG.SECTOR_NAMES[(this.level - 1) % CONFIG.SECTOR_NAMES.length];
    c.fillText(`AGENTE CAÍDO EN SECTOR ${String(this.level).padStart(2, '0')} · ${secName}`, WIDTH / 2, 58);

    const pts = this.player.kills * 100 + this.bonusPoints;
    c.font = 'bold 7px monospace';
    c.fillStyle = '#fff3b0';
    c.fillText(
      `BAJAS: ${this.player.kills} · PUNTOS: ${pts} · RACHA MÁX: x${this.runStats.maxCombo || 1}`,
      WIDTH / 2,
      72
    );

    const medals = (this.earnedMedals || this.computeMedals(false)).slice(0, 4);
    c.font = 'bold 6.5px monospace';
    c.fillStyle = '#ff4d00';
    c.fillText('REGISTRO DE COMBATE // MEDALLAS OBTENIDAS:', WIDTH / 2, 86);

    medals.forEach((m, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = col === 0 ? 22 : 162;
      const by = 92 + row * 24;
      c.fillStyle = 'rgba(28, 8, 12, 0.92)';
      c.fillRect(bx, by, 136, 20);
      c.strokeStyle = m.color || '#ffbe0b';
      c.lineWidth = 1;
      c.strokeRect(bx + 0.5, by + 0.5, 135, 19);
      c.textAlign = 'left';
      c.font = 'bold 6.8px monospace';
      c.fillStyle = m.color || '#ffbe0b';
      c.fillText(`${m.icon || '★'} ${m.name}`, bx + 5, by + 8);
      c.font = '5.6px monospace';
      c.fillStyle = '#d8d2c5';
      c.fillText(m.desc, bx + 5, by + 16);
    });

    if (!this.melt && Math.floor(now / 320) % 2 === 0) {
      c.textAlign = 'center';
      c.font = 'bold 6.8px monospace';
      c.fillStyle = '#70e000';
      c.fillText('PULSA [ESPACIO] O CLIC PARA CONTINUAR', WIDTH / 2, 152);
    }
  }

  finish(won) {
    this.finalizeMatch(won);
  }

  finalizeMatch(won) {
    if (this.finished) return;
    this.finished = true;
    this.running = false;
    this.paused = false;
    this.intermission = null;
    this.deathSequence = null;
    this.victorySequence = null;
    this.melt = null;
    this.mouseDown = false;
    this.audio.stopAmbience();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    const now = performance.now();
    const medals = this.computeMedals(won);
    this.earnedMedals = medals;
    if (won) {
      this.drawVictoryScreen(now);
    } else {
      this.drawDeathScreen(now);
    }
    this.drawHUD(now);
    this.onStatus(won ? '¡LOS 10 SECTORES CONQUISTADOS! Partida guardada' : 'MUERTO // Agente caído — Partida guardada');
    this.onFinish({
      won,
      level: this.level,
      kills: this.player.kills,
      bonusPoints: this.bonusPoints,
      points: this.player.kills * 100 + this.bonusPoints,
      durationMs: Math.max(1000, Math.round(now - this.startTime)),
      medals,
      runStats: { ...this.runStats }
    });
  }

  loop(now) {
    if (!this.running || this.paused || this.finished) return;
    const dt = clamp((now - this.lastTime) / 1000, 0, 0.045);
    this.lastTime = now;
    this.update(dt, now);
    if (!this.finished) {
      if (this.briefingOpen) {
        this.drawBriefingScreen(now);
      } else if (this.victorySequence) {
        this.drawVictoryScreen(now);
      } else if (this.deathSequence) {
        this.drawDeathScreen(now);
      } else if (this.intermission) {
        this.drawIntermissionScreen(now);
      } else if (this.mapOpen) {
        this.drawAutomap(now);
      } else {
        this.renderWorld(now);
      }
      this.drawHUD(now);
      if (this.shopOpen) this.drawShopScreen();
      if (this.melt) this.updateAndDrawMelt(dt);
      this.frameId = requestAnimationFrame(this.boundLoop);
    }
  }

  drawBriefingScreen(now = performance.now()) {
    const c = this.ctx;
    c.fillStyle = '#0c0406';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

    for (let y = 0; y < VIEW_HEIGHT; y += 4) {
      c.fillStyle = '#18070a';
      c.fillRect(0, y, WIDTH, 2);
    }

    c.strokeStyle = '#ff4d00';
    c.lineWidth = 1.5;
    c.strokeRect(6, 4, WIDTH - 12, VIEW_HEIGHT - 8);

    c.textAlign = 'center';
    c.font = 'bold 10.5px monospace';
    c.fillStyle = '#ffbe0b';
    c.fillText('HELLFALL // MANUAL TÁCTICO Y COMANDOS', WIDTH / 2, 16);

    // Columna Izquierda: COMANDOS Y CONTROLES
    c.fillStyle = 'rgba(24, 10, 12, 0.94)';
    c.fillRect(10, 21, 147, 118);
    c.strokeStyle = '#ff4d00';
    c.lineWidth = 1;
    c.strokeRect(10.5, 21.5, 146, 117);

    c.textAlign = 'left';
    c.font = 'bold 6.5px monospace';
    c.fillStyle = '#ff4d00';
    c.fillText('⌨️ COMANDOS DE COMBATE', 15, 30);

    const controls = [
      ['[WASD / Ratón]', 'Moverse y apuntar'],
      ['[Shift]', 'Correr rápido'],
      ['[Clic Izq / Esp]', 'Disparar arma'],
      ['[R]', 'Recargar cartuchos'],
      ['[1] [2] [3]', 'Escopeta/Chain/Flamer'],
      ['[4] Motosierra', 'A las 40 bajas (da munición)'],
      ['[V / Clic Der]', 'Puñetazo (empuja/estampa)'],
      ['[E] Interactuar', 'Puertas/Cofres/Glory Kill'],
      ['[C] Embestida', 'Dash (desbloqueo en Altar)'],
      ['[TAB] / [F]', 'Automapa / Pant. Completa'],
      ['[ESC] / [H]', 'Pausa y Ajustes / Ayuda']
    ];
    controls.forEach(([key, desc], idx) => {
      const y = 39 + idx * 8.8;
      c.font = 'bold 5.5px monospace';
      c.fillStyle = '#ffbe0b';
      c.fillText(key, 14, y);
      c.font = '5.3px monospace';
      c.fillStyle = '#fff3b0';
      c.fillText(desc, 72, y);
    });

    // Columna Derecha: QUÉ PUEDES HACER EN EL JUEGO
    c.fillStyle = 'rgba(24, 10, 12, 0.94)';
    c.fillRect(163, 21, 147, 118);
    c.strokeStyle = '#70e000';
    c.lineWidth = 1;
    c.strokeRect(163.5, 21.5, 146, 117);

    c.font = 'bold 6.5px monospace';
    c.fillStyle = '#70e000';
    c.fillText('🔥 QUÉ HACER EN EL JUEGO', 168, 30);

    const actions = [
      { title: '1. EXPLORA Y SAQUEA:', l1: 'Abre cofres [E], dispara a barriles', l2: 'y busca 2 muros secretos por sector.' },
      { title: '2. MERCADER DE ALMAS:', l1: 'Gasta monedas en munición, vida,', l2: 'blindaje o +12% daño de armas [1-5].' },
      { title: '3. ARENAS DE JEFES:', l1: 'El Campeón y el Boss esperan en el', l2: 'centro y despiertan cuando entras.' },
      { title: '4. LLAVE 🔑 Y SALIDA EXIT:', l1: 'Mata al Boss Guardián, coge la llave,', l2: 've a EXIT y elige Mejoras Dinámicas.' }
    ];
    actions.forEach((act, idx) => {
      const by = 40 + idx * 24.5;
      c.font = 'bold 5.7px monospace';
      c.fillStyle = '#00f5d4';
      c.fillText(act.title, 167, by);
      c.font = '5.3px monospace';
      c.fillStyle = '#d8d2c5';
      c.fillText(act.l1, 167, by + 7.5);
      c.fillText(act.l2, 167, by + 14.5);
    });

    c.fillStyle = 'rgba(22, 42, 16, 0.95)';
    c.fillRect(10, 142, WIDTH - 20, 16);
    c.strokeStyle = '#70e000';
    c.strokeRect(10.5, 142.5, WIDTH - 21, 15);

    c.textAlign = 'center';
    c.font = 'bold 6.8px monospace';
    c.fillStyle = Math.floor(now / 320) % 2 === 0 ? '#70e000' : '#ffbe0b';
    c.fillText('▶ PULSA [ESPACIO], [ENTER] O HAZ CLIC PARA EMPEZAR LA PARTIDA ◀', WIDTH / 2, 152.5);
  }

  renderAttractScreen() {
    this.drawBriefingScreen(performance.now());
    const c = this.ctx;
    c.fillStyle = '#2b1214';
    c.fillRect(0, VIEW_HEIGHT, WIDTH, HUD_HEIGHT);
  }

  renderWorld(now) {
    const c = this.ctx;
    const px = this.player.x, py = this.player.y;
    const dirX = Math.cos(this.player.angle), dirY = Math.sin(this.player.angle);
    const planeX = -dirY * FOV_PLANE, planeY = dirX * FOV_PLANE;
    const effShake = this.reducedEffects ? this.screenShake * 0.25 : this.screenShake;
    const shakeY = effShake > 0 ? Math.round((Math.random() - 0.5) * effShake * 10) : 0;
    const horizon = clamp(Math.floor(VIEW_HEIGHT / 2) + shakeY, 44, VIEW_HEIGHT - 44);

    const floorPixels = this.floorPixels;
    const ceilingPixels = this.ceilingPixels;
    const sceneData = this.sceneImageData.data;
    const rayDirX0 = dirX - planeX, rayDirY0 = dirY - planeY;
    const rayDirX1 = dirX + planeX, rayDirY1 = dirY + planeY;
    const fireDrift = Math.floor(now * 0.028);
    const flicker = this.reducedEffects ? 0.96 : (0.93 + Math.sin(now * 0.018) * 0.07);
    const darknessEvent = this.sectorEvent?.type === 'DARKNESS';
    const bloodFogEvent = this.sectorEvent?.type === 'BLOOD_FOG';

    const maxP = Math.max(horizon, VIEW_HEIGHT - horizon);
    for (let p = 1; p <= maxP; p++) {
      const rowDist = (0.5 * VIEW_HEIGHT * WALL_SCALE) / p;
      const stepX = (rowDist * (rayDirX1 - rayDirX0)) / WIDTH;
      const stepY = (rowDist * (rayDirY1 - rayDirY0)) / WIDTH;
      let wx = px + rowDist * rayDirX0;
      let wy = py + rowDist * rayDirY0;
      const rowFalloff = darknessEvent ? 0.34 : (bloodFogEvent ? 0.11 : 0.055);
      const rowMin = darknessEvent ? 0.015 : 0.2;
      const muzzleLight = darknessEvent ? Math.max(0, 1 - rowDist / 8) * this.muzzleFlash * 0.9 : 0;
      const shade = clamp(clamp(1 - rowDist * rowFalloff, rowMin, 0.95) * flicker + muzzleLight, 0, 1);
      const yFloor = horizon + p - 1;
      const yCeil = horizon - p;

      for (let x = 0; x < WIDTH; x++) {
        const cellX = Math.floor(wx), cellY = Math.floor(wy);
        const tx = Math.floor(64 * (wx - cellX)) & 63;
        const ty = Math.floor(64 * (wy - cellY)) & 63;
        const isLavaVein = (tx >= 29 && tx <= 34) || (ty >= 29 && ty <= 34);
        const ftx = isLavaVein ? (tx + fireDrift) & 63 : tx;
        const fty = isLavaVein ? (ty + fireDrift) & 63 : ty;
        const fIdx = (fty * 64 + ftx) * 4;

        if (yFloor >= 0 && yFloor < VIEW_HEIGHT) {
          const outF = (yFloor * WIDTH + x) * 4;
          sceneData[outF] = floorPixels[fIdx] * shade;
          sceneData[outF + 1] = floorPixels[fIdx + 1] * shade;
          sceneData[outF + 2] = floorPixels[fIdx + 2] * shade;
          sceneData[outF + 3] = 255;
        }
        if (yCeil >= 0 && yCeil < VIEW_HEIGHT) {
          const isFire = tx > 4 && tx < 28 && ty > 4 && ty < 28;
          const cxT = isFire ? (tx + fireDrift) & 63 : tx;
          const cyT = isFire ? (ty + (fireDrift >> 1)) & 63 : ty;
          const cIdx = (cyT * 64 + cxT) * 4;
          const outC = (yCeil * WIDTH + x) * 4;
          sceneData[outC] = ceilingPixels[cIdx] * shade;
          sceneData[outC + 1] = ceilingPixels[cIdx + 1] * shade;
          sceneData[outC + 2] = ceilingPixels[cIdx + 2] * shade;
          sceneData[outC + 3] = 255;
        }
        wx += stepX;
        wy += stepY;
      }
    }
    c.putImageData(this.sceneImageData, 0, 0);

    for (let x = 0; x < WIDTH; x++) {
      const camX = (2 * x) / WIDTH - 1;
      const rdx = dirX + planeX * camX;
      const rdy = dirY + planeY * camX;
      let mapX = Math.floor(px), mapY = Math.floor(py);
      const ddx = Math.abs(1 / (rdx || 0.00001));
      const ddy = Math.abs(1 / (rdy || 0.00001));
      let sdx = rdx < 0 ? (px - mapX) * ddx : (mapX + 1 - px) * ddx;
      let sdy = rdy < 0 ? (py - mapY) * ddy : (mapY + 1 - py) * ddy;
      const stepX = rdx < 0 ? -1 : 1;
      const stepY = rdy < 0 ? -1 : 1;
      let side = 0, steps = 0, doorOffset = 0, passedThroughDoor = false;

      while (steps++ < 120) {
        if (sdx < sdy) {
          sdx += ddx;
          mapX += stepX;
          side = 0;
        } else {
          sdy += ddy;
          mapY += stepY;
          side = 1;
        }
        if (mapY < 0 || mapX < 0 || mapY >= this.map.length || mapX >= this.map[0].length) break;
        const ch = this.map[mapY][mapX];
        if (ch === '0') continue;
        if (ch === '6' || ch === '7') {
          const door = this.doors.get(`${mapX},${mapY}`);
          const open = door ? door.open : 0;
          if (open >= 0.98) {
            passedThroughDoor = true;
            continue;
          }
          const distTmp = side === 0 ? sdx - ddx : sdy - ddy;
          let hit = side === 0 ? py + distTmp * rdy : px + distTmp * rdx;
          hit -= Math.floor(hit);
          if (hit < open) {
            passedThroughDoor = true;
            continue;
          }
          doorOffset = open;
        }
        break;
      }

      const wallDist = Math.max(0.001, side === 0 ? sdx - ddx : sdy - ddy);
      this.zBuffer[x] = wallDist;
      const wallH = Math.min(VIEW_HEIGHT * 3, Math.floor((VIEW_HEIGHT * WALL_SCALE) / wallDist));
      const drawStart = Math.max(0, Math.floor(horizon - wallH / 2));
      const drawEnd = Math.min(VIEW_HEIGHT - 1, Math.floor(horizon + wallH / 2));

      let wallX = side === 0 ? py + wallDist * rdy : px + wallDist * rdx;
      wallX = (wallX - Math.floor(wallX)) - doorOffset;
      let texX = clamp(Math.floor(wallX * 64), 0, 63);
      const rawTile = Number(this.map[mapY]?.[mapX] || '1');
      if (rawTile !== 6 && rawTile !== 7 && ((side === 0 && rdx > 0) || (side === 1 && rdy < 0))) {
        texX = 63 - texX;
      }
      const tex = this.textures[rawTile] || this.textures[1];
      c.drawImage(tex, texX, 0, 1, 64, x, drawStart, 1, Math.max(1, drawEnd - drawStart));

      // Oclusión ambiental (AO) en las uniones techo-muro y suelo-muro para dar profundidad 3D
      if (drawEnd - drawStart > 8) {
        c.fillStyle = 'rgba(8, 2, 3, 0.42)';
        c.fillRect(x, drawStart, 1, 2);
        c.fillRect(x, Math.max(drawStart, drawEnd - 2), 1, 2);
      }

      const sectorFlicker = rawTile === 3 && !this.reducedEffects ? 0.14 * Math.sin(now * 0.025 + mapX) : 0;
      const wallFalloff = darknessEvent ? 0.34 : (bloodFogEvent ? 0.105 : 0.052);
      const wallMin = darknessEvent ? 0.012 : 0.18;
      const wallMuzzleLight = darknessEvent ? Math.max(0, 1 - wallDist / 8) * this.muzzleFlash * 0.95 : Math.max(0, 1 - wallDist / 6) * this.muzzleFlash * 0.22;
      const shade = clamp(
        clamp(1 - wallDist * wallFalloff + sectorFlicker, wallMin, 0.98) * (side === 1 ? 0.76 : 1) + wallMuzzleLight,
        0,
        1
      );
      if (shade < 0.96) {
        c.fillStyle = bloodFogEvent ? `rgba(55, 4, 12, ${1 - shade})` : `rgba(20, 7, 8, ${1 - shade})`;
        c.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }
      if ((rawTile === 4 || rawTile === 5) && !this.player.hasKey) {
        c.fillStyle = `rgba(217, 4, 41, ${0.32 + 0.14 * Math.sin(now * 0.014)})`;
        c.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }
      if (passedThroughDoor && wallDist < 6) {
        c.fillStyle = 'rgba(0, 245, 212, 0.06)';
        c.fillRect(x, drawStart, 1, drawEnd - drawStart);
      }
    }

    this.drawGroundEffects(dirX, dirY, planeX, planeY, horizon, now);
    this.renderBillboards(dirX, dirY, planeX, planeY, horizon, now);
    this.drawDynamicLights(now, dirX, dirY, planeX, planeY, horizon);
    this.drawObjectiveBanner(now);
    this.drawCompass(now);
    this.drawMiniRadar(now);
    this.drawBossHealthBar(now);
    this.drawBossAwakenBanner(now);
    this.drawInteractionPrompt();
    this.drawLootNotifications();
    this.drawComboBanner(now);
    this.drawCrosshair(now);
    this.drawWeapon(now);

    // Viñeta atmosférica retro en los bordes del visor
    c.fillStyle = 'rgba(8, 2, 4, 0.22)';
    c.fillRect(0, 0, WIDTH, 3);
    c.fillRect(0, VIEW_HEIGHT - 3, WIDTH, 3);
    c.fillRect(0, 0, 4, VIEW_HEIGHT);
    c.fillRect(WIDTH - 4, 0, 4, VIEW_HEIGHT);

    // Latido y viñeta roja cuando queda poca vida (<= 30%)
    if (this.player.health > 0 && this.player.health <= 30) {
      const pulse = 0.22 + 0.18 * Math.sin(now * 0.011);
      c.strokeStyle = `rgba(217, 4, 41, ${pulse})`;
      c.lineWidth = 6;
      c.strokeRect(3, 3, WIDTH - 6, VIEW_HEIGHT - 6);
    }

    const flashScale = this.reducedEffects ? 0.45 : 1.0;

    if (now < (this.playerDashUntil || 0)) {
      c.strokeStyle = 'rgba(157, 78, 221, 0.65)';
      c.lineWidth = 3;
      c.strokeRect(2, 2, WIDTH - 4, VIEW_HEIGHT - 4);
    }
    if (now < (this.kineticFlashUntil || 0)) {
      const kAlpha = clamp((this.kineticFlashUntil - now) / 260, 0, 1) * 0.32 * flashScale;
      c.fillStyle = `rgba(0, 245, 212, ${kAlpha})`;
      c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    }
    if (now < (this.player.invulnerableUntil || 0)) {
      c.strokeStyle = `rgba(0, 180, 255, ${0.45 + 0.25 * Math.sin(now * 0.03)})`;
      c.lineWidth = 2;
      c.strokeRect(1, 1, WIDTH - 2, VIEW_HEIGHT - 2);
      c.fillStyle = 'rgba(0, 180, 255, 0.07)';
      c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    }
    if (now - this.toxicFlashTime < 260) {
      c.fillStyle = `rgba(112, 224, 0, ${0.3 * flashScale * (1 - (now - this.toxicFlashTime) / 260)})`;
      c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    }
    if (now < this.player.berserkUntil) {
      c.fillStyle = 'rgba(255, 77, 0, 0.12)';
      c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    }
    if (now - this.lastDamageTime < 340) {
      const dmgRatio = 1 - (now - this.lastDamageTime) / 340;
      c.fillStyle = `rgba(217, 4, 41, ${0.32 * flashScale * dmgRatio})`;
      c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

      // Indicadores direccionales de daño en los bordes de la pantalla
      const rel = this.damageAngle || 0;
      c.fillStyle = `rgba(255, 20, 45, ${0.78 * dmgRatio})`;
      if (rel < -0.35) {
        c.fillRect(0, 16, 10, VIEW_HEIGHT - 32);
      } else if (rel > 0.35) {
        c.fillRect(WIDTH - 10, 16, 10, VIEW_HEIGHT - 32);
      }
      if (Math.abs(rel) > 2.1) {
        c.fillRect(28, VIEW_HEIGHT - 9, WIDTH - 56, 9);
      } else if (Math.abs(rel) < 0.85) {
        c.fillRect(28, 0, WIDTH - 56, 8);
      }
    }
    if (now - this.pickupFlashTime < 220) {
      c.fillStyle = `rgba(255, 190, 11, ${0.26 * flashScale * (1 - (now - this.pickupFlashTime) / 220)})`;
      c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    }
  }

  // Brújula de objetivo superior hacia la Llave / Boss Guardián / Puerta EXIT
  drawCompass(now) {
    let targetX = null;
    let targetY = null;
    let label = '';
    let color = '#ffbe0b';

    if (this.player.hasKey && this.exitDoor) {
      targetX = this.exitDoor.x;
      targetY = this.exitDoor.y;
      label = 'EXIT';
      color = '#70e000';
    } else if (this.keyItem && this.keyItem.active) {
      targetX = this.keyItem.x;
      targetY = this.keyItem.y;
      label = 'LLAVE';
      color = '#ffd700';
    } else {
      const keyBoss = this.enemies.find((e) => e.alive && e.holdsKey);
      if (keyBoss) {
        targetX = keyBoss.x;
        targetY = keyBoss.y;
        label = 'BOSS';
        color = '#ff0055';
      }
    }
    if (targetX === null) return;

    const c = this.ctx;
    const dist = Math.round(distance(this.player.x, this.player.y, targetX, targetY));
    const ang = Math.atan2(targetY - this.player.y, targetX - this.player.x);
    const rel = Math.atan2(Math.sin(ang - this.player.angle), Math.cos(ang - this.player.angle));
    const arrow = rel < -0.35 ? '◀' : (rel > 0.35 ? '▶' : '▲');

    const pipOffset = clamp(rel / 1.1, -1, 1) * 26;
    const cx = 186;
    const cy = 11.5;

    c.fillStyle = color;
    c.font = 'bold 6.5px monospace';
    c.textAlign = 'center';
    c.fillText(`${arrow} ${label} ${dist}m`, cx + pipOffset * 0.25, cy + 2.5);
  }

  // Mini-radar táctico en la esquina superior derecha con pings de demonios cercanos, jefe y salida
  drawMiniRadar(now) {
    if (this.mapOpen) return;
    const c = this.ctx;
    const r = 17;
    const rx = WIDTH - r - 6;
    const ry = 22 + r;
    const range = 13.5;

    c.save();
    c.fillStyle = 'rgba(6, 16, 10, 0.82)';
    c.beginPath();
    c.arc(rx, ry, r, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(112, 224, 0, 0.65)';
    c.lineWidth = 1;
    c.stroke();

    // Cono de visión del jugador (arriba = delante)
    c.strokeStyle = 'rgba(112, 224, 0, 0.24)';
    c.beginPath();
    c.moveTo(rx, ry);
    c.lineTo(rx - 9, ry - r + 3);
    c.moveTo(rx, ry);
    c.lineTo(rx + 9, ry - r + 3);
    c.stroke();

    const plotPoint = (wx, wy, col, size = 2) => {
      const dx = wx - this.player.x;
      const dy = wy - this.player.y;
      const d = Math.hypot(dx, dy);
      if (d > range) return;
      const relAng = Math.atan2(dy, dx) - this.player.angle - Math.PI / 2;
      const normD = (d / range) * (r - 3);
      const px = rx + Math.cos(relAng) * normD;
      const py = ry + Math.sin(relAng) * normD;
      c.fillStyle = col;
      c.fillRect(px - size / 2, py - size / 2, size, size);
    };

    for (const enemy of this.enemies) {
      if (!enemy.alive) continue;
      if (enemy.isBoss) {
        plotPoint(enemy.x, enemy.y, enemy.holdsKey ? '#ffd700' : '#ff0055', 3);
      } else {
        plotPoint(enemy.x, enemy.y, '#ff2a2a', 2);
      }
    }
    if (this.keyItem?.active) {
      plotPoint(this.keyItem.x, this.keyItem.y, '#ffd700', 2.5);
    }
    if (this.exitDoor) {
      plotPoint(this.exitDoor.x, this.exitDoor.y, '#00f5d4', 2.5);
    }

    // Punto central del jugador
    c.fillStyle = '#fff3b0';
    c.fillRect(rx - 1, ry - 1, 2.5, 2.5);
    c.restore();
  }

  drawBossHealthBar(now) {
    const activeBoss = this.enemies.find(
      (e) => e.alive && e.isBoss && !e.dormant && distance(this.player.x, this.player.y, e.x, e.y) < 18
    );
    if (!activeBoss) return;
    const c = this.ctx;
    const barW = 156;
    const barH = 10;
    const bx = Math.floor((WIDTH - barW) / 2);
    const by = 21;

    c.fillStyle = 'rgba(14, 4, 6, 0.9)';
    c.fillRect(bx - 2, by - 1, barW + 4, barH + 8);
    c.strokeStyle = activeBoss.enraged ? '#ff0055' : (activeBoss.holdsKey ? '#ffd700' : '#d90429');
    c.lineWidth = 1;
    c.strokeRect(bx - 1.5, by - 0.5, barW + 3, barH + 7);

    const ratio = clamp(activeBoss.health / activeBoss.maxHealth, 0, 1);
    c.fillStyle = '#26090d';
    c.fillRect(bx, by + 6, barW, 6);
    c.fillStyle = activeBoss.enraged ? '#ff0055' : (activeBoss.holdsKey ? '#ffbe0b' : '#d90429');
    c.fillRect(bx, by + 6, Math.floor(barW * ratio), 6);
    c.fillStyle = 'rgba(255, 255, 255, 0.25)';
    c.fillRect(bx, by + 6, Math.floor(barW * ratio), 2);

    c.textAlign = 'center';
    c.font = 'bold 5.8px monospace';
    c.fillStyle = '#fff3b0';
    c.fillText(`${activeBoss.kind}${activeBoss.enraged ? ' [ENFURECIDO]' : ''}`, WIDTH / 2, by + 4.5);
  }

  drawBossAwakenBanner(now) {
    const b = this.bossAwakenBanner;
    if (!b || now >= b.until) return;
    const c = this.ctx;
    const alpha = clamp((b.until - now) / 400, 0, 1);
    c.save();
    c.globalAlpha = alpha;
    c.fillStyle = 'rgba(20, 4, 8, 0.92)';
    c.fillRect(WIDTH / 2 - 114, 38, 228, 24);
    c.strokeStyle = '#ff0055';
    c.lineWidth = 1.5;
    c.strokeRect(WIDTH / 2 - 114, 38, 228, 24);
    c.textAlign = 'center';
    c.font = 'bold 9px monospace';
    c.fillStyle = '#ffbe0b';
    c.fillText(`⚠️ ${b.name} ⚠️`, WIDTH / 2, 48);
    c.font = 'bold 6px monospace';
    c.fillStyle = '#fff3b0';
    c.fillText(b.sub, WIDTH / 2, 57);
    c.restore();
  }

  drawInteractionPrompt() {
    const c = this.ctx;
    let promptTxt = null;

    if (this.findGloryTarget()) {
      promptTxt = `[E] EJECUCIÓN DE GLORIA: +${CONFIG.GLORY_HEAL} HP Y 1s INVULNERABLE`;
    }

    if (!promptTxt && this.merchant && distance(this.player.x, this.player.y, this.merchant.x, this.merchant.y) < 2.4) {
      promptTxt = '[E] COMERCIAR CON EL MERCADER DE ALMAS';
    }

    for (const chest of this.chests) {
      if (promptTxt) break;
      if (!chest.opened && distance(this.player.x, this.player.y, chest.x, chest.y) < 2.2) {
        promptTxt = '[E] O ACÉRCATE: ABRIR COFRE DE SUMINISTROS';
        break;
      }
    }
    if (!promptTxt) {
      for (const door of this.doors.values()) {
        if (door.open < 0.2 && distance(this.player.x, this.player.y, door.x + 0.5, door.y + 0.5) < 2.8) {
          promptTxt = door.isSecret
            ? '[E] INSPECCIONAR MURO SOSPECHOSO'
            : (door.isBossGate
              ? '⚠️ [E] ABRIR ARENA DEL BOSS'
              : (door.isMerchant ? '[E] ABRIR LA CÁMARA DEL MERCADER' : '[E] ABRIR COMPUERTA BLINDADA UAC'));
          break;
        }
      }
    }
    if (!promptTxt) return;

    c.fillStyle = 'rgba(20, 7, 8, 0.85)';
    c.fillRect(WIDTH / 2 - 96, VIEW_HEIGHT - 64, 192, 13);
    c.strokeStyle = '#ffbe0b';
    c.strokeRect(WIDTH / 2 - 96, VIEW_HEIGHT - 64, 192, 13);
    c.font = 'bold 7px monospace';
    c.textAlign = 'center';
    c.fillStyle = '#fff3b0';
    c.fillText(promptTxt, WIDTH / 2, VIEW_HEIGHT - 55);
  }

  drawLootNotifications() {
    if (this.lootNotifications.length === 0) return;
    const c = this.ctx;
    let yOffset = 36;

    for (const notif of this.lootNotifications) {
      const alpha = clamp(notif.timer / 0.6, 0, 1);
      const boxW = 216;
      const boxH = 14 + notif.items.length * 9;
      const boxX = Math.floor((WIDTH - boxW) / 2);

      c.save();
      c.globalAlpha = alpha;
      c.fillStyle = 'rgba(16, 6, 8, 0.9)';
      c.fillRect(boxX, yOffset, boxW, boxH);
      c.strokeStyle = notif.color;
      c.lineWidth = 1;
      c.strokeRect(boxX, yOffset, boxW, boxH);

      c.font = 'bold 7.5px monospace';
      c.textAlign = 'center';
      c.fillStyle = notif.color;
      c.fillText(notif.title, WIDTH / 2, yOffset + 9);

      c.font = 'bold 7px monospace';
      c.fillStyle = '#fff3b0';
      notif.items.forEach((line, idx) => {
        c.fillText(line, WIDTH / 2, yOffset + 19 + idx * 9);
      });
      c.restore();

      yOffset += boxH + 4;
    }
  }

  renderBillboards(dirX, dirY, planeX, planeY, horizon, now) {
    const c = this.ctx;
    const animFrame = Math.floor(now / 110) % 3;
    const pulseFrame = Math.floor(now / 220) % 2;
    const itemBob = Math.sin(now * 0.006) * 3;
    const darknessEvent = this.sectorEvent?.type === 'DARKNESS';

    const enemyObjs = this.enemies.map((e) => {
      let sprite;
      let stepBounce = 0;
      if (e.state === 'ALIVE') {
        if (e.isBoss && e.dormant) {
          sprite = e.anims.walk[0];
          stepBounce = 0;
        } else if (e.painTimer > 0 && e.anims.pain) {
          sprite = e.anims.pain;
        } else if (e.isBoss && (e.bossState === 'WINDUP' || e.bossState === 'CHARGE' || e.bossState === 'DASH')) {
          sprite = e.anims.charge[Math.floor(now / 70) % 2];
        } else {
          const walkIdx = Math.floor(e.walkCycle) % 4;
          const viewAngle = Math.atan2(e.y - this.player.y, e.x - this.player.x);
          const relFacing = Math.abs(Math.atan2(
            Math.sin((e.facingAngle || 0) - viewAngle),
            Math.cos((e.facingAngle || 0) - viewAngle)
          ));
          const showBack = !e.isBoss && e.anims.back && relFacing < 1.05;
          sprite = showBack ? e.anims.back[walkIdx] : e.anims.walk[walkIdx];
          stepBounce = e.movePattern === 'HOVER'
            ? -8 + Math.sin(now * 0.006 + e.walkCycle) * 5
            : (e.kind === 'LOST_SOUL' ? -6 + Math.sin(now * 0.01 + e.walkCycle) * 4 : ((walkIdx % 2 === 1) ? -2 : 0));
        }
      } else {
        sprite = e.anims.death[clamp(Math.floor(e.deathTimer), 0, 3)];
      }
      return {
        ...e,
        type: 'enemy',
        sprite,
        stepBounce,
        gloryReady: e.state === 'ALIVE' && now < (e.gloryUntil || 0)
      };
    });

    const barrelObjs = (this.barrels || []).filter((b) => !b.exploded).map((b) => ({
      x: b.x,
      y: b.y,
      type: 'barrel',
      sprite: this.barrelSprites[(pulseFrame + Math.floor(b.phase || 0)) % 2],
      scale: 0.68
    }));

    const merchantObjs = this.merchant
      ? [{
          x: this.merchant.x,
          y: this.merchant.y,
          type: 'merchant',
          sprite: this.merchantSprites[pulseFrame],
          scale: 1.05,
          stepBounce: Math.sin(now * 0.003) * 1.5
        }]
      : [];

    const coinObjs = this.coins.filter((c) => c.active).map((c) => ({
      x: c.x,
      y: c.y,
      type: 'coin',
      sprite: this.coinSprites[pulseFrame],
      scale: 0.42,
      stepBounce: itemBob
    }));

    const chestObjs = this.chests.map((ch) => ({
      x: ch.x,
      y: ch.y,
      type: 'chest',
      sprite: ch.opened ? this.chestOpenSprite : this.chestClosedSprite,
      scale: 0.74
    }));

    const keyObjs = this.keyItem && this.keyItem.active
      ? [{ x: this.keyItem.x, y: this.keyItem.y, type: 'key', sprite: this.keySprites[pulseFrame], scale: 0.68, stepBounce: itemBob }]
      : [];

    const armorObjs = this.armorPickups.filter((a) => a.active).map((a) => ({
      x: a.x,
      y: a.y,
      type: 'armor',
      sprite: this.armorSprites[pulseFrame],
      scale: 0.62,
      stepBounce: itemBob
    }));

    const powerObjs = this.powerups.filter((p) => p.active).map((p) => ({
      x: p.x,
      y: p.y,
      type: 'powerup',
      sprite: this.soulsphereSprites[pulseFrame],
      scale: 0.66,
      stepBounce: itemBob
    }));

    const flameObjs = this.flameProjectiles.map((fp) => {
      const ratio = clamp(fp.age / fp.maxLife, 0, 0.99);
      const stage = ratio < 0.3 ? 0 : (ratio < 0.7 ? 1 : 2);
      return {
        x: fp.x,
        y: fp.y,
        type: 'orb',
        sprite: this.flameBallSprites[stage],
        scale: fp.scale || 0.54,
        zOffset: fp.zOffset || 0
      };
    });

    const objects = [
      ...enemyObjs,
      ...barrelObjs,
      ...merchantObjs,
      ...coinObjs,
      ...chestObjs,
      ...keyObjs,
      ...armorObjs,
      ...powerObjs,
      ...this.medkits.filter((m) => m.active).map((m) => ({ ...m, type: 'medkit', sprite: this.medkitSprites[pulseFrame], scale: 0.62, stepBounce: itemBob })),
      ...this.ammoPacks.filter((a) => a.active).map((a) => ({ ...a, type: 'ammo', sprite: this.ammoSprites[pulseFrame], scale: 0.66, stepBounce: itemBob })),
      ...this.fireProps.map((f) => ({ x: f.x, y: f.y, type: 'fire', sprite: this.fireFrames[(animFrame + f.phase) % 3], scale: 0.74 })),
      ...flameObjs,
      ...this.enemyProjectiles.map((ep) => ({ x: ep.x, y: ep.y, type: 'orb', sprite: ep.sprite, scale: 0.5 }))
    ];

    objects.sort((a, b) => distance(this.player.x, this.player.y, b.x, b.y) - distance(this.player.x, this.player.y, a.x, a.y));
    const invDet = 1.0 / (planeX * dirY - dirX * planeY);

    for (const obj of objects) {
      const sx = obj.x - this.player.x, sy = obj.y - this.player.y;
      const tx = invDet * (dirY * sx - dirX * sy);
      const ty = invDet * (-planeY * sx + planeX * sy);
      if (ty <= 0.15 || ty > 28) continue;

      const screenX = Math.floor((WIDTH / 2) * (1 + tx / ty));
      const wallSpan = Math.abs(Math.floor((VIEW_HEIGHT * WALL_SCALE) / ty));
      let spriteH = Math.abs(Math.floor(VIEW_HEIGHT / ty)) * (obj.scale || 0.95);
      // Garantiza que ningún Boss supere la altura entre el suelo y el techo elevado
      if (obj.type === 'enemy' && spriteH > wallSpan * 0.92) {
        spriteH = Math.floor(wallSpan * 0.92);
      }
      const isWideItem = obj.type === 'ammo' || obj.type === 'medkit' || obj.type === 'chest' || obj.type === 'key' || obj.type === 'orb' || obj.type === 'armor' || obj.type === 'powerup' || obj.type === 'barrel';
      const spriteW = spriteH * (isWideItem ? 0.95 : 0.75);
      const floorY = Math.floor(horizon + wallSpan / 2);
      const ceilY = Math.floor(horizon - wallSpan / 2);
      const rawStartY = obj.type === 'orb'
        ? Math.floor(horizon - spriteH / 2 + ((obj.zOffset || 0) * VIEW_HEIGHT) / ty)
        : Math.max(ceilY + 2, Math.floor(floorY - spriteH + (obj.stepBounce || 0)));

      const startY = clamp(rawStartY, 0, VIEW_HEIGHT - 1);
      const endY = clamp(Math.floor(rawStartY + spriteH), 0, VIEW_HEIGHT - 1);
      const startX = clamp(Math.floor(screenX - spriteW / 2), 0, WIDTH - 1);
      const endX = clamp(Math.floor(screenX + spriteW / 2), 0, WIDTH - 1);

      let visible = false;
      for (let stripe = startX; stripe <= endX; stripe++) {
        if (ty >= this.zBuffer[stripe]) continue;
        visible = true;
        const texX = clamp(Math.floor(((stripe - (screenX - spriteW / 2)) * obj.sprite.width) / Math.max(1, spriteW)), 0, obj.sprite.width - 1);
        c.drawImage(obj.sprite, texX, 0, 1, obj.sprite.height, stripe, startY, 1, Math.max(1, endY - startY));
        if (obj.type === 'enemy' && obj.hitFlash > 0) {
          c.fillStyle = 'rgba(255, 243, 176, 0.58)';
          c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
        } else if (obj.type === 'enemy' && (obj.wakeFlash || 0) > 0) {
          c.fillStyle = `rgba(255, 0, 85, ${clamp(obj.wakeFlash * 0.65, 0, 0.65)})`;
          c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
        } else if (obj.type === 'enemy' && obj.isBoss && obj.dormant) {
          c.fillStyle = `rgba(18, 8, 24, ${0.38 + 0.12 * Math.sin(now * 0.005)})`;
          c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
        } else if (obj.type === 'enemy' && obj.gloryReady) {
          c.fillStyle = Math.floor(now / 110) % 2 === 0 ? 'rgba(0, 180, 255, 0.56)' : 'rgba(255, 120, 0, 0.56)';
          c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
        } else if (obj.type === 'enemy' && (obj.stunTimer || 0) > 0) {
          c.fillStyle = 'rgba(255, 190, 11, 0.35)';
          c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
        } else if (obj.type === 'enemy' && obj.shieldFlash > 0) {
          c.fillStyle = 'rgba(0, 180, 255, 0.5)';
          c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
        } else if (obj.type === 'enemy' && (obj.bossState === 'DASH' || obj.dashTime > 0)) {
          c.fillStyle = 'rgba(255, 77, 0, 0.3)';
          c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
        } else if (obj.type === 'enemy' && (obj.burnTimer > 0 || obj.enraged)) {
          c.fillStyle = obj.enraged ? 'rgba(217, 4, 41, 0.25)' : 'rgba(255, 90, 0, 0.28)';
          c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
        }

        const glowing = obj.type === 'fire' || obj.type === 'orb' || obj.type === 'coin' || obj.type === 'powerup' || obj.type === 'key' || obj.type === 'barrel';
        if (darknessEvent && !glowing && obj.type !== 'enemy') {
          const light = this.getSectorLightLevel(obj.x, obj.y, now);
          if (light < 0.97) {
            c.fillStyle = `rgba(4, 2, 3, ${(1 - light) * 0.93})`;
            c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
          }
        } else if (darknessEvent && obj.type === 'enemy') {
          const light = this.getSectorLightLevel(obj.x, obj.y, now);
          const cue = obj.gloryReady ? 0.28 : (obj.shieldFlash > 0 ? 0.55 : 1);
          if (light < 0.97) {
            c.fillStyle = `rgba(4, 2, 3, ${(1 - light) * 0.9 * cue})`;
            c.fillRect(stripe, startY, 1, Math.max(1, endY - startY));
          }
        }
      }

      if (visible && obj.type === 'enemy' && obj.alive && (obj.isBoss || obj.health < obj.maxHealth)) {
        const barW = clamp(Math.floor(spriteW * 0.85), 18, 54);
        const barX = Math.floor(screenX - barW / 2);
        const barY = Math.max(4, startY - 6);
        c.fillStyle = '#140708';
        c.fillRect(barX - 1, barY - 1, barW + 2, 4);
        c.fillStyle = obj.dormant ? '#7a6a58' : (obj.holdsKey ? '#ffd700' : (obj.isBoss ? '#d90429' : '#ffbe0b'));
        c.fillRect(barX, barY, Math.floor(barW * clamp(obj.health / obj.maxHealth, 0, 1)), 2);
        if (obj.isBoss && obj.dormant && ty < 12) {
          c.textAlign = 'center';
          c.font = 'bold 5.5px monospace';
          c.fillStyle = '#ffbe0b';
          c.fillText('INACTIVO (ENTRA A LA SALA)', screenX, Math.max(5, barY - 3));
        } else if (obj.gloryReady) {
          c.fillStyle = Math.floor(now / 110) % 2 === 0 ? '#00b4d8' : '#ff4d00';
          c.fillRect(barX - 1, barY - 3, barW + 2, 1);
        }
      }
    }

    const allParticles = [
      ...this.bloodParticles.map((p) => ({ ...p, pSize: 2 })),
      ...this.wallSparks.map((p) => ({ ...p, pSize: 2 })),
      ...this.ambientEmbers.map((p) => ({ ...p, color: '#ff4d00', pSize: 1 }))
    ];
    for (const bp of allParticles) {
      const sx = bp.x - this.player.x, sy = bp.y - this.player.y;
      const tx = invDet * (dirY * sx - dirX * sy);
      const ty = invDet * (-planeY * sx + planeX * sy);
      if (ty <= 0.15) continue;
      const screenX = Math.floor((WIDTH / 2) * (1 + tx / ty));
      const screenY = Math.floor(horizon + (bp.z * VIEW_HEIGHT) / ty);
      if (screenX >= 0 && screenX < WIDTH && screenY >= 0 && screenY < VIEW_HEIGHT && ty < this.zBuffer[screenX]) {
        c.fillStyle = bp.color;
        c.fillRect(screenX, screenY, bp.pSize, bp.pSize);
      }
    }
  }

  getSectorLightLevel(x, y, now) {
    if (this.sectorEvent?.type !== 'DARKNESS') return 1;
    let light = 0.03;
    if (this.muzzleFlash > 0.05) {
      const playerDist = distance(this.player.x, this.player.y, x, y);
      light = Math.max(light, Math.max(0, 1 - playerDist / 9) * this.muzzleFlash * 0.95);
    }
    for (const fire of this.fireProps) {
      const d = distance(fire.x, fire.y, x, y);
      if (d < 5.5) light = Math.max(light, 0.62 * (1 - d / 5.5));
    }
    for (const ep of this.enemyProjectiles) {
      const d = distance(ep.x, ep.y, x, y);
      if (d < 4.5) light = Math.max(light, 0.7 * (1 - d / 4.5));
    }
    for (const fp of this.flameProjectiles) {
      const d = distance(fp.x, fp.y, x, y);
      if (d < 3.5) light = Math.max(light, 0.6 * (1 - d / 3.5));
    }
    return clamp(light, 0, 1);
  }

  drawDynamicLights(now, dirX, dirY, planeX, planeY, horizon) {
    const isDark = this.sectorEvent?.type === 'DARKNESS';
    const intensity = isDark ? 1.0 : 0.45;
    const c = this.ctx;
    const invDet = 1.0 / (planeX * dirY - dirX * planeY);
    const glow = (sx, sy, radius, r, g, b, alpha) => {
      if (radius < 2 || alpha <= 0) return;
      const grad = c.createRadialGradient(sx, sy, 0, sx, sy, radius);
      grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.42})`);
      grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      c.fillStyle = grad;
      c.fillRect(sx - radius, sy - radius, radius * 2, radius * 2);
    };
    const project = (x, y) => {
      const sx = x - this.player.x;
      const sy = y - this.player.y;
      const tx = invDet * (dirY * sx - dirX * sy);
      const ty = invDet * (-planeY * sx + planeX * sy);
      if (ty <= 0.4 || ty > 26) return null;
      const screenX = Math.floor((WIDTH / 2) * (1 + tx / ty));
      if (screenX < 0 || screenX >= WIDTH) return null;
      if (ty > this.zBuffer[Math.floor(screenX)] + 0.8) return null;
      return { screenX, floorY: horizon + (VIEW_HEIGHT * WALL_SCALE * 0.5) / ty, ty };
    };

    c.save();
    c.globalCompositeOperation = 'lighter';
    if (this.muzzleFlash > 0.05) {
      glow(WIDTH / 2, horizon, 95 * this.muzzleFlash, 255, 170, 40, 0.28 * this.muzzleFlash * intensity);
    }
    for (const fire of this.fireProps) {
      const p = project(fire.x, fire.y);
      if (!p) continue;
      const radius = clamp(80 / p.ty, 10, 110);
      glow(p.screenX, p.floorY - 6, radius, 255, 92, 0, 0.2 * intensity);
    }
    for (const ep of this.enemyProjectiles) {
      const p = project(ep.x, ep.y);
      if (!p) continue;
      const green = ep.ownerKind === 'SUMMONER';
      const radius = clamp(50 / p.ty, 8, 70);
      glow(p.screenX, horizon, radius, green ? 112 : 255, green ? 224 : 120, 0, 0.22 * intensity);
    }
    for (const fp of this.flameProjectiles) {
      const p = project(fp.x, fp.y);
      if (!p) continue;
      const radius = clamp(55 / p.ty, 8, 72);
      glow(p.screenX, horizon, radius, 255, 110, 0, 0.18 * intensity);
    }
    c.restore();
  }

  drawGroundEffects(dirX, dirY, planeX, planeY, horizon, now = performance.now()) {
    const c = this.ctx;
    const invDet = 1.0 / (planeX * dirY - dirX * planeY);

    const project = (x, y) => {
      const sx = x - this.player.x, sy = y - this.player.y;
      const tx = invDet * (dirY * sx - dirX * sy);
      const ty = invDet * (-planeY * sx + planeX * sy);
      if (ty <= 0.25) return null;
      const screenX = (WIDTH / 2) * (1 + tx / ty);
      if (screenX < 0 || screenX >= WIDTH) return null;
      if (ty >= this.zBuffer[Math.floor(screenX)]) return null;
      const floorY = horizon + (VIEW_HEIGHT * WALL_SCALE * 0.5) / ty;
      return { screenX, floorY, ty };
    };

    // Círculo rúnico infernal bajo los Bosses que están parados en el centro de su sala
    for (const enemy of this.enemies) {
      if (!enemy.alive || !enemy.isBoss) continue;
      const p = project(enemy.x, enemy.y);
      if (!p) continue;
      const rx = clamp((1.85 / p.ty) * (VIEW_HEIGHT * 0.92), 6, WIDTH);
      const pulse = 0.45 + 0.25 * Math.sin(now * 0.006);
      c.save();
      c.translate(p.screenX, p.floorY);
      c.scale(1, 0.32);
      c.strokeStyle = enemy.dormant
        ? `rgba(255, 190, 11, ${pulse})`
        : `rgba(255, 0, 85, ${pulse * 0.85})`;
      c.lineWidth = 1.6;
      c.beginPath();
      c.arc(0, 0, rx, 0, Math.PI * 2);
      c.stroke();
      c.beginPath();
      c.arc(0, 0, rx * 0.68, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    for (const hazard of this.hazards) {
      const p = project(hazard.x, hazard.y);
      if (!p) continue;
      const isLava = hazard.kind === 'LAVA';
      const pulse = 0.24 + 0.07 * Math.sin(now * 0.004 + hazard.phase);
      const rx = clamp((hazard.radius / p.ty) * (VIEW_HEIGHT * 0.92), 6, WIDTH);
      c.save();
      c.globalAlpha = 1;
      c.translate(p.screenX, p.floorY);
      c.scale(1, 0.32);
      c.fillStyle = isLava ? `rgba(140, 20, 8, ${pulse * 1.15})` : `rgba(29, 92, 20, ${pulse})`;
      c.beginPath();
      c.arc(0, 0, rx, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = isLava ? `rgba(255, 77, 0, ${pulse})` : `rgba(112, 224, 0, ${pulse * 0.85})`;
      c.beginPath();
      c.arc(0, 0, rx * 0.72, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = isLava
        ? `rgba(255, 190, 11, ${0.38 + 0.18 * Math.sin(now * 0.008 + hazard.phase)})`
        : `rgba(204, 255, 51, ${0.32 + 0.18 * Math.sin(now * 0.008 + hazard.phase)})`;
      c.lineWidth = 1.5;
      c.beginPath();
      c.arc(0, 0, rx, 0, Math.PI * 2);
      c.stroke();
      for (let i = 0; i < 7; i++) {
        const angle = hazard.phase + i * 0.9 + now * 0.0006;
        const dist = rx * (0.2 + ((i * 31) % 60) / 100);
        c.fillStyle = isLava ? (i % 2 === 0 ? '#ffbe0b' : '#ff4d00') : (i % 2 === 0 ? '#ccff33' : '#70e000');
        c.fillRect(Math.cos(angle) * dist, Math.sin(angle) * dist, 2.5, 2.5);
      }
      c.restore();
    }

    // Círculos de aviso de impacto de meteoros
    if (this.meteorStrikes) {
      for (const m of this.meteorStrikes) {
        const p = project(m.x, m.y);
        if (!p) continue;
        const rx = clamp((m.radius / p.ty) * (VIEW_HEIGHT * 0.92), 5, WIDTH);
        const ratio = clamp(1 - m.timer / m.maxTimer, 0.1, 1);
        c.save();
        c.translate(p.screenX, p.floorY);
        c.scale(1, 0.32);
        c.strokeStyle = '#ff0055';
        c.lineWidth = 1.8;
        c.beginPath();
        c.arc(0, 0, rx, 0, Math.PI * 2);
        c.stroke();
        c.fillStyle = 'rgba(255, 77, 0, 0.45)';
        c.beginPath();
        c.arc(0, 0, rx * ratio, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }
    }

    for (const crack of this.floorCracks) {
      const p = project(crack.x, crack.y);
      if (!p) continue;
      const alpha = clamp(crack.life / 4, 0, 0.85);
      const rx = clamp((crack.radius / p.ty) * (VIEW_HEIGHT * 0.9), 4, WIDTH);

      c.save();
      c.globalAlpha = alpha;
      c.translate(p.screenX, p.floorY);
      c.scale(1, 0.32);
      c.strokeStyle = '#140708';
      c.lineWidth = 1.4;
      for (let i = 0; i < 9; i++) {
        const angle = crack.seed + i * 0.7;
        const reach = rx * (0.8 + ((i * 37) % 20) / 100);
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(Math.cos(angle + 0.25) * rx * 0.45, Math.sin(angle + 0.25) * rx * 0.45);
        c.lineTo(Math.cos(angle) * reach, Math.sin(angle) * reach);
        c.stroke();
      }
      c.strokeStyle = 'rgba(255, 77, 0, 0.35)';
      c.lineWidth = 0.7;
      c.beginPath();
      c.ellipse(0, 0, rx * 0.92, rx * 0.92, 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    for (const wave of this.shockwaves) {
      const p = project(wave.x, wave.y);
      if (!p) continue;
      const alpha = clamp(wave.life / wave.maxLife, 0, 1);
      const rx = clamp((wave.radius / p.ty) * (VIEW_HEIGHT * 0.95), 3, WIDTH);

      c.save();
      c.globalAlpha = alpha * 0.9;
      c.strokeStyle = wave.color || '#ffbe0b';
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(p.screenX, p.floorY, rx, Math.max(2, rx * 0.32), 0, 0, Math.PI * 2);
      c.stroke();
      c.strokeStyle = 'rgba(255, 77, 0, 0.6)';
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(p.screenX, p.floorY, rx * 0.72, Math.max(1.5, rx * 0.23), 0, 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }
  }

  drawObjectiveBanner(now) {
    const c = this.ctx;
    c.fillStyle = 'rgba(20, 7, 8, 0.84)';
    c.fillRect(4, 4, 212, 15);
    c.strokeStyle = this.player.hasKey ? '#ffbe0b' : '#ff4d00';
    c.strokeRect(4, 4, 212, 15);
    c.font = 'bold 6.5px monospace';
    c.textAlign = 'left';
    c.fillStyle = this.player.hasKey ? '#fff3b0' : '#ffbe0b';

    let statusText;
    if (this.player.hasKey) {
      statusText = '🔑 LLAVE OBTENIDA (VE A EXIT)';
    } else if (this.keyItem && this.keyItem.active) {
      statusText = '🔑 ¡LLAVE EN EL SUELO! RECÓGELA';
    } else {
      statusText = '⚔️ ENTRA A LA ARENA Y MATA AL BOSS';
    }
    const extraTxt = now < this.player.berserkUntil
      ? ' · 🔥BERSERK'
      : (this.hasUpgrade('SHOCK_DASH') ? ' · [V]PUÑO [C]DASH' : ' · [V]PUÑO');
    c.fillText(`${statusText}${extraTxt}`, 8, 14);

    if (this.sectorEvent) {
      const dark = this.sectorEvent.type === 'DARKNESS';
      c.fillStyle = 'rgba(20, 7, 8, 0.84)';
      c.fillRect(220, 4, 96, 15);
      c.strokeStyle = dark ? '#00b4d8' : '#70e000';
      c.strokeRect(220, 4, 96, 15);
      c.font = 'bold 6.5px monospace';
      c.textAlign = 'center';
      c.fillStyle = dark ? '#caf0f8' : '#ccff33';
      c.fillText(`EVENTO: ${this.sectorEvent.short}`, 268, 14);
    } else if (this.pressurePct > 0) {
      c.fillStyle = 'rgba(20, 7, 8, 0.84)';
      c.fillRect(220, 4, 96, 15);
      c.strokeStyle = '#ff9e00';
      c.strokeRect(220, 4, 96, 15);
      c.font = 'bold 6.2px monospace';
      c.textAlign = 'center';
      c.fillStyle = '#ffbe0b';
      c.fillText(`AMENAZA +${this.pressurePct}%`, 268, 14);
    }
  }

  drawComboBanner(now) {
    const combo = this.combo;
    if (!combo || combo.count < 2 || now > combo.expires) return;
    const c = this.ctx;
    const remaining = clamp((combo.expires - now) / CONFIG.COMBO_WINDOW_MS, 0, 1);

    c.textAlign = 'right';
    c.font = 'bold 7px monospace';
    c.fillStyle = '#ffbe0b';
    c.fillText(`COMBO x${combo.count}`, WIDTH - 8, 27);
    c.fillStyle = '#26282a';
    c.fillRect(WIDTH - 72, 30, 64, 2);
    c.fillStyle = '#ff4d00';
    c.fillRect(WIDTH - 72, 30, Math.floor(64 * remaining), 2);

    if (combo.bannerText && now < combo.bannerUntil) {
      const alpha = clamp((combo.bannerUntil - now) / 260, 0, 1);
      c.save();
      c.globalAlpha = alpha;
      c.textAlign = 'center';
      c.font = 'bold 18px monospace';
      c.fillStyle = '#140708';
      c.fillText(combo.bannerText, WIDTH / 2 + 2, 64);
      c.fillStyle = combo.bannerText === 'HELLBREAKER'
        ? '#ff4d00'
        : (combo.bannerText === 'RAMPAGE' ? '#ffbe0b' : '#00f5d4');
      c.fillText(combo.bannerText, WIDTH / 2, 62);
      c.font = 'bold 7px monospace';
      c.fillStyle = '#fff3b0';
      c.fillText(`RACHA DE BAJAS · +${combo.bannerBonus || 0} PUNTOS EXTRA`, WIDTH / 2, 72);
      c.restore();
    }
  }

  drawCrosshair(now = performance.now()) {
    const c = this.ctx, cy = Math.floor(VIEW_HEIGHT / 2);
    const gloryTarget = this.findGloryTarget();
    const hit = now < this.hitmarkerUntil;
    const kill = now < this.hitmarkerKillUntil;
    const color = kill ? '#fff3b0' : (hit ? '#ff2a2a' : (gloryTarget ? (Math.floor(now / 120) % 2 === 0 ? '#00b4d8' : '#ff4d00') : '#ffbe0b'));
    c.fillStyle = color;
    c.fillRect(WIDTH / 2 - 4, cy, 3, 1);
    c.fillRect(WIDTH / 2 + 2, cy, 3, 1);
    c.fillRect(WIDTH / 2, cy - 4, 1, 3);
    c.fillRect(WIDTH / 2, cy + 2, 1, 3);

    if (hit || kill) {
      c.fillStyle = kill ? '#fff3b0' : '#ff2a2a';
      c.fillRect(WIDTH / 2 - 6, cy - 6, 2, 2);
      c.fillRect(WIDTH / 2 + 5, cy - 6, 2, 2);
      c.fillRect(WIDTH / 2 - 6, cy + 5, 2, 2);
      c.fillRect(WIDTH / 2 + 5, cy + 5, 2, 2);
      if (kill) {
        c.fillRect(WIDTH / 2 - 2, cy - 2, 5, 5);
      }
    }
  }

  drawPunchOverlay(c, now) {
    if (now >= (this.punchAnimUntil || 0)) return;
    const progress = 1 - (this.punchAnimUntil - now) / 280;
    const swing = Math.sin(progress * Math.PI);
    const side = this.punchSide || 1;
    const fx = Math.floor(WIDTH / 2 + side * (42 - swing * 34));
    const fy = Math.floor(VIEW_HEIGHT + 22 - swing * 74);

    if (this.punchEmpowered && swing > 0.35) {
      c.fillStyle = 'rgba(255, 77, 0, 0.38)';
      c.fillRect(fx - 28, fy - 24, 56, 40);
      c.fillStyle = '#ffbe0b';
      c.fillRect(fx - 18, fy - 18, 36, 24);
      c.fillStyle = '#fff3b0';
      c.fillRect(fx - 10, fy - 12, 20, 12);
    }

    // Antebrazo blindado UAC y puño cerrado
    c.fillStyle = '#140708';
    c.fillRect(fx - 15, fy, 30, 48);
    c.fillStyle = '#386641';
    c.fillRect(fx - 13, fy + 8, 26, 38);
    c.fillStyle = '#6a994e';
    c.fillRect(fx - 9, fy + 10, 18, 30);

    // Nudillos y guantelete
    c.fillStyle = '#140708';
    c.fillRect(fx - 17, fy - 12, 34, 22);
    c.fillStyle = this.punchEmpowered ? '#d90429' : '#c68b67';
    c.fillRect(fx - 15, fy - 10, 30, 18);
    c.fillStyle = this.punchEmpowered ? '#ffbe0b' : '#e0ac8b';
    for (let k = -12; k <= 9; k += 7) {
      c.fillRect(fx + k, fy - 9, 5, 7);
    }
    c.fillStyle = '#495057';
    c.fillRect(fx - 14, fy + 2, 28, 6);
  }

  drawWeapon(now) {
    const c = this.ctx;
    const recoilY = Math.floor(this.recoil * 9);
    const bobX = Math.floor(this.walkBobX || 0);
    const bobY = Math.floor(this.walkBobY || 0);
    const leanX = Math.round((this.strafeLean || 0) * 7);
    const punchDrop = now < (this.punchAnimUntil || 0) ? 18 : 0;
    const cx = Math.floor(WIDTH / 2 + bobX + leanX);
    const baseY = VIEW_HEIGHT + bobY + recoilY + punchDrop;
    const w = this.player.weapon;

    if (w === 4) {
      const revving = now - this.shotStartTime < 150;
      const jitter = revving ? Math.floor(Math.sin(now * 0.12) * 2) : 0;
      const chainScroll = Math.floor(now / 22) % 4;
      const sx = cx + jitter;
      const sy = baseY;

      if (revving) {
        c.fillStyle = 'rgba(255, 77, 0, 0.35)';
        c.fillRect(sx - 30, sy - 92, 60, 34);
        c.fillStyle = '#ffbe0b';
        c.fillRect(sx - 18, sy - 88, 36, 18);
        c.fillStyle = '#fff3b0';
        c.fillRect(sx - 10, sy - 84, 20, 11);
      }

      // Cuerpo del motor
      c.fillStyle = '#140708';
      c.fillRect(sx - 17, sy - 42, 34, 26);
      c.fillStyle = '#343a40';
      c.fillRect(sx - 16, sy - 41, 32, 24);
      c.fillStyle = '#6c757d';
      c.fillRect(sx - 14, sy - 39, 28, 5);
      c.fillStyle = '#ff4d00';
      c.fillRect(sx - 9, sy - 31, 18, 7);
      c.fillStyle = '#ffbe0b';
      c.fillRect(sx - 6, sy - 29, 12, 3);
      for (let i = 0; i < 4; i++) {
        c.fillStyle = i % 2 === 0 ? '#adb5bd' : '#495057';
        c.fillRect(sx - 14 + i * 7, sy - 22, 4, 4);
      }

      // Empuñadura y manos
      c.fillStyle = '#140708';
      c.fillRect(sx - 22, sy - 18, 44, 18);
      c.fillStyle = '#4a2511';
      c.fillRect(sx - 21, sy - 17, 42, 16);
      c.fillStyle = '#7f4f24';
      c.fillRect(sx - 17, sy - 15, 34, 10);
      c.fillStyle = '#d4a373';
      c.fillRect(sx - 20, sy - 14, 8, 9);
      c.fillRect(sx + 12, sy - 13, 8, 9);

      // Espada de la motosierra con cadena animada
      c.fillStyle = '#140708';
      c.fillRect(sx - 8, sy - 74, 16, 34);
      c.fillStyle = '#adb5bd';
      c.fillRect(sx - 6, sy - 73, 12, 32);
      c.fillStyle = '#dee2e6';
      c.fillRect(sx - 4, sy - 72, 4, 30);
      c.fillStyle = '#6c757d';
      c.fillRect(sx + 1, sy - 72, 4, 30);
      for (let i = 0; i < 9; i++) {
        const ty = sy - 72 + i * 3.4 + (chainScroll % 3);
        c.fillStyle = (i + chainScroll) % 2 === 0 ? '#fff3b0' : '#adb5bd';
        c.fillRect(sx - 9, Math.floor(ty), 3, 2);
        c.fillRect(sx + 6, Math.floor(ty), 3, 2);
      }
      c.fillStyle = '#495057';
      c.fillRect(sx - 7, sy - 80, 14, 8);
      c.fillStyle = '#ff4d00';
      c.fillRect(sx - 4, sy - 78, 8, 3);
      this.drawPunchOverlay(c, now);
      return;
    }

    if (w === 2) {
      if (this.muzzleFlash > 0.12) {
        c.fillStyle = '#d90429';
        c.fillRect(cx - 28, baseY - 66, 56, 22);
        c.fillStyle = '#ff4d00';
        c.fillRect(cx - 22, baseY - 62, 44, 18);
        c.fillStyle = '#ffbe0b';
        c.fillRect(cx - 14, baseY - 58, 28, 12);
        c.fillStyle = '#fff3b0';
        c.fillRect(cx - 7, baseY - 54, 14, 7);
      }
      const spinOffset = Math.floor(now / 35) % 4;
      c.fillStyle = '#140708';
      c.fillRect(cx - 20, baseY - 50, 40, 28);
      for (let i = 0; i < 6; i++) {
        const bx = -15 + i * 6 + ((i + spinOffset) % 2);
        c.fillStyle = '#495057';
        c.fillRect(cx + bx, baseY - 49, 4, 25);
        c.fillStyle = '#adb5bd';
        c.fillRect(cx + bx + 1, baseY - 49, 1, 23);
      }
      c.fillStyle = '#adb5bd';
      c.fillRect(cx - 20, baseY - 41, 40, 4);
      c.fillRect(cx - 20, baseY - 29, 40, 4);
      c.fillStyle = '#252930';
      c.fillRect(cx - 25, baseY - 22, 50, 22);
      for (let y = baseY - 20; y < baseY - 3; y += 4) {
        c.fillStyle = '#ffbe0b';
        c.fillRect(cx + 23, y, 9, 2);
        c.fillStyle = '#d90429';
        c.fillRect(cx + 30, y, 3, 2);
      }
      this.drawPunchOverlay(c, now);
      return;
    }

    if (w === 3) {
      if (this.muzzleFlash > 0.1) {
        const flick = Math.floor(Math.sin(now * 0.05) * 6);
        c.fillStyle = 'rgba(217, 4, 41, 0.8)';
        c.fillRect(cx - 34 + flick, baseY - 96, 68, 52);
        c.fillStyle = '#ff4d00';
        c.fillRect(cx - 22 - flick, baseY - 82, 44, 38);
        c.fillStyle = '#ffbe0b';
        c.fillRect(cx - 14, baseY - 72, 28, 26);
        c.fillStyle = '#fff3b0';
        c.fillRect(cx - 8, baseY - 64, 16, 18);
      } else {
        const pFlick = Math.floor(Math.sin(now * 0.03) * 2);
        c.fillStyle = '#00f5d4';
        c.fillRect(cx - 3, baseY - 56 + pFlick, 6, 6);
        c.fillStyle = '#ffbe0b';
        c.fillRect(cx - 2, baseY - 60 + pFlick, 4, 5);
        c.fillStyle = '#fff3b0';
        c.fillRect(cx - 1, baseY - 58 + pFlick, 2, 3);
      }
      c.fillStyle = '#140708';
      c.fillRect(cx - 11, baseY - 51, 22, 25);
      c.fillStyle = '#2b2d33';
      c.fillRect(cx - 10, baseY - 50, 20, 24);
      c.fillStyle = '#ff4d00';
      c.fillRect(cx - 6, baseY - 46, 12, 5);
      c.fillStyle = '#fff3b0';
      c.fillRect(cx - 4, baseY - 45, 6, 3);
      c.fillStyle = '#9e1919';
      c.fillRect(cx + 10, baseY - 35, 16, 27);
      c.fillStyle = '#d90429';
      c.fillRect(cx + 12, baseY - 33, 7, 22);
      c.fillStyle = '#343a40';
      c.fillRect(cx - 20, baseY - 26, 36, 26);
      this.drawPunchOverlay(c, now);
      return;
    }

    const sinceShot = now - this.shotStartTime;
    const isPumping = sinceShot > 110 && sinceShot < 390;

    if (this.muzzleFlash > 0.12) {
      c.fillStyle = '#d90429';
      c.fillRect(cx - 28, baseY - 72, 56, 26);
      c.fillStyle = '#ff4d00';
      c.fillRect(cx - 22, baseY - 68, 44, 22);
      c.fillRect(cx - 14, baseY - 78, 28, 32);
      c.fillStyle = '#ffbe0b';
      c.fillRect(cx - 16, baseY - 64, 32, 16);
      c.fillStyle = '#fff3b0';
      c.fillRect(cx - 8, baseY - 58, 16, 9);
    }

    const pumpShiftX = isPumping ? -6 : 0;
    const pumpShiftY = isPumping ? -5 : 0;
    const forendSlide = isPumping ? (sinceShot < 250 ? 6 : 2) : 0;
    const sx = cx + pumpShiftX;
    const sy = baseY + pumpShiftY;

    c.fillStyle = '#140708';
    c.fillRect(sx - 16, sy - 54, 32, 30);

    c.fillStyle = '#25282e';
    c.fillRect(sx - 15, sy - 53, 13, 29);
    c.fillRect(sx + 2, sy - 53, 13, 29);
    c.fillStyle = '#0b0c0e';
    c.fillRect(sx - 12, sy - 53, 7, 3);
    c.fillRect(sx + 5, sy - 53, 7, 3);
    c.fillStyle = '#6c757d';
    c.fillRect(sx - 13, sy - 50, 4, 25);
    c.fillRect(sx + 4, sy - 50, 4, 25);
    c.fillStyle = '#dee2e6';
    c.fillRect(sx - 11, sy - 50, 2, 23);
    c.fillRect(sx + 6, sy - 50, 2, 23);
    c.fillStyle = '#140708';
    c.fillRect(sx - 2, sy - 52, 4, 26);
    c.fillStyle = '#ffbe0b';
    c.fillRect(sx - 1, sy - 56, 2, 4);

    c.fillStyle = '#140708';
    c.fillRect(sx - 20, sy - 29 + forendSlide, 40, 17);
    c.fillStyle = '#343a40';
    c.fillRect(sx - 19, sy - 28 + forendSlide, 38, 15);
    c.fillStyle = '#6c757d';
    c.fillRect(sx - 15, sy - 27 + forendSlide, 30, 10);
    for (let ry = sy - 26 + forendSlide; ry < sy - 16 + forendSlide; ry += 3) {
      c.fillStyle = '#1b1e22';
      c.fillRect(sx - 16, ry, 32, 1);
    }

    if (isPumping) {
      const shellProgress = (sinceShot - 110) / 280;
      const shX = Math.floor(sx + 16 + shellProgress * 28);
      const shY = Math.floor(sy - 32 - Math.sin(shellProgress * Math.PI) * 16);
      c.fillStyle = '#140708';
      c.fillRect(shX - 1, shY - 1, 7, 5);
      c.fillStyle = '#d90429';
      c.fillRect(shX, shY, 4, 3);
      c.fillStyle = '#ffbe0b';
      c.fillRect(shX + 4, shY, 2, 3);
    }

    c.fillStyle = '#140708';
    c.fillRect(sx - 24, sy - 17, 48, 17);
    c.fillStyle = '#4a2511';
    c.fillRect(sx - 23, sy - 16, 46, 16);
    c.fillStyle = '#7f4f24';
    c.fillRect(sx - 19, sy - 14, 38, 10);
    c.fillStyle = '#9c6644';
    c.fillRect(sx - 14, sy - 12, 28, 4);

    c.fillStyle = '#3d2314';
    c.fillRect(sx - 28, sy - 10 + forendSlide, 14, 10);
    c.fillRect(sx + 14, sy - 9, 14, 10);
    c.fillStyle = '#d4a373';
    c.fillRect(sx - 25, sy - 11 + forendSlide, 9, 3);
    c.fillRect(sx + 16, sy - 10, 9, 3);
    this.drawPunchOverlay(c, now);
  }

  drawIntermissionScreen(now) {
    const c = this.ctx;
    const im = this.intermission;
    const elapsed = (now - im.startTime) / 1000;

    c.fillStyle = '#140708';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    for (let y = 0; y < VIEW_HEIGHT; y += 4) {
      c.fillStyle = '#260b0d';
      c.fillRect(0, y, WIDTH, 2);
    }

    c.strokeStyle = '#ff4d00';
    c.lineWidth = 2;
    c.strokeRect(8, 4, WIDTH - 16, VIEW_HEIGHT - 8);

    c.textAlign = 'center';
    c.font = 'bold 11px monospace';
    c.fillStyle = '#ffbe0b';
    c.fillText(`SECTOR ${String(im.sector).padStart(2, '0')} COMPLETADO${im.perfectSector ? ' · ¡INTOCABLE!' : ''}`, WIDTH / 2, 16);
    c.font = 'bold 6px monospace';
    c.fillStyle = '#ff4d00';
    const nextPressure = Math.round(((this.level) * CONFIG.LEVEL_HP_SCALE + (this.getTotalUpgradeRanks() + (im.upgradeSelected ? 0 : 1)) * CONFIG.UPGRADE_PRESSURE.HP) * 100);
    c.fillText(`ALTAR DE MEJORAS DINÁMICAS // PRÓXIMA AMENAZA: +${nextPressure}%`, WIDTH / 2, 24);

    const kVal = Math.min(im.killsPct, Math.floor(elapsed * 110));
    const iVal = elapsed > 0.6 ? Math.min(im.itemsPct, Math.floor((elapsed - 0.6) * 110)) : 0;
    const sVal = elapsed > 1.2 ? Math.min(im.secretsPct, Math.floor((elapsed - 1.2) * 110)) : 0;

    if (now - im.lastTick > 90 && (kVal < im.killsPct || iVal < im.itemsPct || sVal < im.secretsPct)) {
      im.lastTick = now;
      this.audio.playTallyTick();
    }

    const mins = String(Math.floor(im.timeSec / 60)).padStart(2, '0');
    const secs = String(im.timeSec % 60).padStart(2, '0');
    const chip = (x, label, value, color) => {
      c.fillStyle = 'rgba(24, 12, 13, 0.92)';
      c.fillRect(x, 28, 70, 19);
      c.strokeStyle = '#4a2c30';
      c.strokeRect(x + 0.5, 28.5, 69, 18);
      c.textAlign = 'center';
      c.font = 'bold 5.5px monospace';
      c.fillStyle = '#9c8b7a';
      c.fillText(label, x + 35, 34.5);
      c.font = 'bold 8px monospace';
      c.fillStyle = color;
      c.fillText(value, x + 35, 44);
    };
    chip(14, 'KILLS', `${kVal}%`, '#ff4d00');
    chip(88, 'ITEMS', `${iVal}%`, '#ffbe0b');
    chip(162, 'SECRETS', `${sVal}%`, '#70e000');
    chip(236, 'TIME', `${mins}:${secs}`, '#fff3b0');

    const choices = im.upgradeChoices || [];
    const hasChoices = choices.length > 0;
    c.textAlign = 'left';
    c.font = 'bold 6.2px monospace';
    c.fillStyle = hasChoices ? '#ffbe0b' : '#70e000';
    c.fillText(
      hasChoices
        ? `ELIGE 1 MEJORA CON [1]..[${choices.length}] O CLIC:`
        : 'TODAS LAS MEJORAS YA ESTÁN AL MÁXIMO NIVEL',
      14,
      57
    );

    if (hasChoices && !im.upgradeSelected) {
      const canReroll = (this.player.coins || 0) >= (CONFIG.REROLL_COST || 8);
      c.fillStyle = canReroll ? 'rgba(48, 28, 12, 0.95)' : 'rgba(24, 14, 16, 0.9)';
      c.fillRect(216, 49, 90, 11);
      c.strokeStyle = canReroll ? '#ffbe0b' : '#5a4a42';
      c.strokeRect(216.5, 49.5, 89, 10);
      c.textAlign = 'center';
      c.font = 'bold 5.6px monospace';
      c.fillStyle = canReroll ? '#fff3b0' : '#7a6a58';
      c.fillText(`[R] REROLL (${CONFIG.REROLL_COST}C)`, 261, 56.5);
    }

    const wrapLines = (text, maxChars = 20) => {
      const words = String(text || '').split(' ');
      const lines = [];
      let cur = '';
      for (const w of words) {
        if ((cur + ' ' + w).trim().length <= maxChars) {
          cur = (cur + ' ' + w).trim();
        } else {
          if (cur) lines.push(cur);
          cur = w;
        }
      }
      if (cur) lines.push(cur);
      return lines.slice(0, 3);
    };

    if (hasChoices) {
      const count = choices.length;
      const totalW = WIDTH - 24;
      const gap = 6;
      const cardW = Math.floor((totalW - gap * (count - 1)) / count);
      const cardH = 68;
      const cardY = 63;

      choices.forEach((upgrade, idx) => {
        const cardX = 12 + idx * (cardW + gap);
        const selected = im.upgradeSelected && im.upgradeSelected.id === upgrade.id;
        const locked = im.upgradeSelected && !selected;
        const currentRank = this.getUpgradeRank(upgrade.id);
        const targetRank = selected ? im.upgradeSelected.installedRank : currentRank + 1;
        const descText = upgrade.ranks?.[Math.min(targetRank - 1, (upgrade.ranks?.length || 1) - 1)] || upgrade.detail || '';

        c.fillStyle = selected ? 'rgba(38, 72, 20, 0.96)' : 'rgba(26, 14, 16, 0.95)';
        c.fillRect(cardX, cardY, cardW, cardH);
        c.strokeStyle = selected ? '#70e000' : (locked ? '#3a2a2c' : (upgrade.color || '#ffbe0b'));
        c.lineWidth = selected ? 2 : 1;
        c.strokeRect(cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1);

        c.fillStyle = selected ? '#70e000' : (upgrade.color || '#ffbe0b');
        c.fillRect(cardX + 4, cardY + 4, 14, 10);
        c.fillStyle = '#140708';
        c.font = 'bold 6.5px monospace';
        c.textAlign = 'center';
        c.fillText(`[${idx + 1}]`, cardX + 11, cardY + 11.5);

        c.textAlign = 'right';
        c.font = 'bold 5.4px monospace';
        c.fillStyle = locked ? '#5a4a42' : (upgrade.color || '#ffbe0b');
        c.fillText(`${upgrade.type || 'MEJORA'} · NV.${targetRank}/${upgrade.maxRank || 1}`, cardX + cardW - 4, cardY + 11);

        c.textAlign = 'left';
        c.font = 'bold 6px monospace';
        c.fillStyle = locked ? '#8d7b6a' : '#fff3b0';
        c.fillText(upgrade.label, cardX + 4, cardY + 22);

        c.fillStyle = 'rgba(255, 190, 11, 0.25)';
        c.fillRect(cardX + 4, cardY + 25, cardW - 8, 1);

        c.font = '5.4px monospace';
        c.fillStyle = locked ? '#6b5a4a' : '#d8d2c5';
        const lines = wrapLines(descText, count === 3 ? 21 : 30);
        lines.forEach((ln, lIdx) => {
          c.fillText(ln, cardX + 4, cardY + 34 + lIdx * 8);
        });

        if (selected) {
          c.textAlign = 'center';
          c.font = 'bold 5.8px monospace';
          c.fillStyle = '#70e000';
          c.fillText('✔ MEJORA INSTALADA', cardX + cardW / 2, cardY + 63);
        } else {
          c.textAlign = 'center';
          c.font = 'bold 5.4px monospace';
          c.fillStyle = locked ? '#4a3a30' : '#ffbe0b';
          c.fillText(`PULSA [${idx + 1}] O CLIC`, cardX + cardW / 2, cardY + 63);
        }
      });
    } else {
      c.fillStyle = 'rgba(28, 16, 17, 0.94)';
      c.fillRect(40, 68, WIDTH - 80, 56);
      c.strokeStyle = '#70e000';
      c.strokeRect(40.5, 68.5, WIDTH - 81, 55);
      c.textAlign = 'center';
      c.font = '6px monospace';
      c.fillStyle = '#d8d2c5';
      c.fillText('Has alcanzado el nivel máximo en todas las mejoras.', WIDTH / 2, 92);
      c.fillStyle = '#70e000';
      c.font = 'bold 6.5px monospace';
      c.fillText('PREPÁRATE PARA EL PRÓXIMO SECTOR', WIDTH / 2, 108);
    }

    const owned = [];
    for (const u of CONFIG.UPGRADES) {
      const r = this.getUpgradeRank(u.id);
      if (r > 0) owned.push(`${u.short || u.label}${r > 1 ? ` II` : ''}`);
    }
    c.textAlign = 'center';
    c.font = 'bold 5.6px monospace';
    c.fillStyle = owned.length ? '#70e000' : '#8d7b6a';
    c.fillText(
      owned.length ? `ACTIVAS: ${owned.join(' · ')}` : 'SIN MEJORAS INSTALADAS AÚN',
      WIDTH / 2,
      143
    );

    const canAdvance = !hasChoices || im.upgradeSelected;
    if (canAdvance) {
      if (Math.floor(now / 350) % 2 === 0) {
        c.textAlign = 'center';
        c.font = 'bold 6.8px monospace';
        c.fillStyle = '#70e000';
        c.fillText('PULSA [ESPACIO] O HAZ CLIC PARA DESPLEGAR', WIDTH / 2, 156);
      }
    } else {
      c.textAlign = 'center';
      c.font = 'bold 6px monospace';
      c.fillStyle = '#ff4d00';
      c.fillText('ELIGE UNA MEJORA ANTES DE AVANZAR AL SIGUIENTE SECTOR', WIDTH / 2, 156);
    }
  }

  drawDoomGuyFace(c, x, y, now = performance.now()) {
    const px = (dx, dy, w, h, col) => {
      c.fillStyle = col;
      c.fillRect(x + dx, y + dy, w, h);
    };

    px(0, 0, 32, 30, '#140708');
    px(1, 1, 30, 28, '#262626');

    const hp = this.player.health;

    if (hp <= 0) {
      px(7, 4, 18, 16, '#d8d2c5');
      px(9, 3, 14, 3, '#fff3b0');
      px(9, 10, 5, 4, '#140708');
      px(18, 10, 5, 4, '#140708');
      px(15, 14, 2, 3, '#140708');
      px(10, 20, 12, 6, '#b8b0a2');
      for (let tx = 11; tx <= 19; tx += 2) px(tx, 21, 1, 4, '#140708');
      return;
    }

    const isHit = now - this.lastDamageTime < 450;
    const isGrin = now < this.evilGrinUntil;
    const isFiring = this.muzzleFlash > 0.1 || this.recoil > 0.35;

    const lookDir = isHit ? this.damageDir : (isFiring || isGrin ? 0 : (Math.floor(now / 850) % 3) - 1);

    px(6, 2, 20, 6, '#4a2c18');
    px(5, 4, 22, 4, '#633b20');

    px(6, 7, 20, 17, '#e0ac8b');
    px(8, 24, 16, 4, '#c68b67');
    px(6, 14, 3, 8, '#c68b67');
    px(23, 14, 3, 8, '#c68b67');

    const browY = isHit ? 9 : (isGrin ? 9 : 10);
    px(8, browY, 6, 2, '#3b2010');
    px(18, browY, 6, 2, '#3b2010');

    px(9, 12, 5, 3, '#ffffff');
    px(18, 12, 5, 3, '#ffffff');
    const eyeColor = isFiring || isGrin ? '#ffbe0b' : '#140708';
    px(10 + lookDir, 12, 2, 3, eyeColor);
    px(19 + lookDir, 12, 2, 3, eyeColor);

    px(14, 13, 4, 5, '#c68b67');

    if (isHit) {
      px(12, 19, 8, 6, '#2b0909');
      px(13, 20, 6, 2, '#fff3b0');
    } else if (isGrin) {
      px(8, 19, 16, 5, '#2b0909');
      px(9, 19, 14, 2, '#fff3b0');
      px(9, 22, 14, 2, '#fff3b0');
    } else if (isFiring) {
      px(9, 20, 14, 4, '#2b0909');
      px(10, 21, 12, 2, '#fff3b0');
    } else {
      px(11, 21, 10, 2, '#6e3b2b');
      px(12, 21, 8, 1, '#fff3b0');
    }

    if (hp < 80) {
      px(7, 8, 3, 4, '#b80c09');
      px(21, 17, 3, 3, '#780000');
    }
    if (hp < 60) {
      px(13, 7, 3, 6, '#d90429');
      px(22, 11, 3, 6, '#9e0000');
    }
    if (hp < 40) {
      px(8, 15, 5, 7, '#a30000');
      px(10, 23, 6, 4, '#d90429');
    }
    if (hp < 20) {
      px(17, 16, 6, 8, '#d90429');
      px(13, 22, 6, 6, '#780000');
      px(6, 11, 3, 8, '#d90429');
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
      c.fillStyle = '#1f2122';
      c.fillRect(x, y + h - 1, w, 1);
      c.fillRect(x + w - 1, y, 1, h);
    };

    drawBevelBox(0, VIEW_HEIGHT, 56, HUD_HEIGHT);
    drawBevelBox(56, VIEW_HEIGHT, 56, HUD_HEIGHT);
    drawBevelBox(112, VIEW_HEIGHT, 32, HUD_HEIGHT);
    drawBevelBox(144, VIEW_HEIGHT, 32, HUD_HEIGHT);
    drawBevelBox(176, VIEW_HEIGHT, 56, HUD_HEIGHT);
    drawBevelBox(232, VIEW_HEIGHT, 88, HUD_HEIGHT);

    this.drawDoomGuyFace(c, 144, VIEW_HEIGHT + 1, now);

    c.font = 'bold 13px monospace';
    c.textAlign = 'center';

    const drawDoomNum = (text, cx, cy, color = '#d90429') => {
      c.fillStyle = '#140708';
      c.fillText(text, cx + 1, cy + 1);
      c.fillStyle = color;
      c.fillText(text, cx, cy);
    };

    if (this.player.weapon === 4) {
      drawDoomNum('∞', 28, VIEW_HEIGHT + 17, '#ff4d00');
    } else if (this.player.weapon === 3) {
      drawDoomNum(`${Math.ceil(this.player.fuel)}%`, 28, VIEW_HEIGHT + 17, '#ff4d00');
    } else {
      const totalAmmo = this.player.ammo + this.player.reserve;
      drawDoomNum(`${this.player.ammo}/${this.player.reserve}`, 28, VIEW_HEIGHT + 17, totalAmmo <= 6 ? '#ffbe0b' : '#d90429');
    }

    const hpColor = this.player.health > 100 ? '#00f5d4' : (this.player.health > 30 ? '#d90429' : '#ffbe0b');
    drawDoomNum(`${Math.max(0, this.player.health)}%`, 84, VIEW_HEIGHT + 17, hpColor);

    c.font = 'bold 8px monospace';
    const chainsawUnlocked = this.player.kills >= CONFIG.CHAINSAW_UNLOCK_KILLS;
    [1, 2, 3, 4].forEach((num, idx) => {
      const bx = 113 + idx * 7;
      const by = VIEW_HEIGHT + 6;
      const locked = num === 4 && !chainsawUnlocked;
      c.fillStyle = this.player.weapon === num ? '#ffbe0b' : (locked ? '#1b1214' : '#26282a');
      c.fillRect(bx, by, 7, 11);
      c.fillStyle = this.player.weapon === num ? '#140708' : (locked ? '#5a3a3a' : (num === 4 ? '#ff4d00' : '#adb5bd'));
      c.fillText(String(num), bx + 3.5, by + 9);
    });

    c.font = 'bold 13px monospace';
    drawDoomNum(`${this.player.armor || 0}%`, 204, VIEW_HEIGHT + 17, '#70e000');

    c.fillStyle = '#140708';
    c.fillRect(236, VIEW_HEIGHT + 5, 12, 22);
    if (this.player.hasKey) {
      c.fillStyle = '#ffbe0b';
      c.fillRect(239, VIEW_HEIGHT + 8, 6, 6);
      c.fillRect(241, VIEW_HEIGHT + 14, 2, 10);
      c.fillRect(243, VIEW_HEIGHT + 19, 3, 3);
    }

    c.font = 'bold 7px monospace';
    drawDoomNum(
      `S${String(this.level).padStart(2, '0')} K:${String(this.player.kills).padStart(3, '0')} C:${String(this.player.coins || 0).padStart(3, '0')}`,
      276,
      VIEW_HEIGHT + 17,
      '#ffbe0b'
    );

    c.font = 'bold 6.5px monospace';
    c.fillStyle = '#d8d2c5';
    c.fillText('AMMO', 28, VIEW_HEIGHT + 28);
    c.fillText('HEALTH', 84, VIEW_HEIGHT + 28);
    c.fillText('ARMS', 128, VIEW_HEIGHT + 28);
    c.fillText('ARMOR', 204, VIEW_HEIGHT + 28);
    c.fillText('KEY · KILLS · COINS', 276, VIEW_HEIGHT + 28);
  }

  drawShopScreen() {
    const c = this.ctx;
    c.save();
    c.fillStyle = 'rgba(8, 3, 4, 0.94)';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

    c.strokeStyle = '#ffbe0b';
    c.lineWidth = 1;
    c.strokeRect(14, 6, WIDTH - 28, VIEW_HEIGHT - 12);

    c.textAlign = 'center';
    c.fillStyle = '#ff4d00';
    c.font = 'bold 12px monospace';
    c.fillText('MERCADER DE ALMAS', WIDTH / 2, 19);
    c.fillStyle = '#ffbe0b';
    c.font = 'bold 8px monospace';
    c.fillText(`MONEDAS: ${this.player.coins || 0} · DAÑO ARSENAL: +${Math.round((this.weaponDamageBonus || 0) * 100)}%`, WIDTH / 2, 30);

    const items = this.merchantItems();
    items.forEach((item, idx) => {
      const y = 35 + idx * 20;
      const affordable = (this.player.coins || 0) >= item.price && item.canBuy();
      c.fillStyle = affordable ? 'rgba(74, 37, 17, 0.92)' : 'rgba(30, 18, 18, 0.92)';
      c.fillRect(26, y, WIDTH - 52, 18);
      c.strokeStyle = affordable ? '#ffbe0b' : '#4a2c30';
      c.strokeRect(26, y, WIDTH - 52, 18);

      c.textAlign = 'left';
      c.font = 'bold 6.8px monospace';
      c.fillStyle = affordable ? '#fff3b0' : '#8d7b6a';
      c.fillText(`[${idx + 1}] ${item.label}`, 31, y + 7.5);
      c.font = '5.6px monospace';
      c.fillStyle = affordable ? '#d8d2c5' : '#6b5a4a';
      c.fillText(item.detail, 31, y + 14.5);

      c.textAlign = 'right';
      c.font = 'bold 8.5px monospace';
      c.fillStyle = affordable ? '#ffbe0b' : '#6b5a4a';
      c.fillText(`${item.price}`, WIDTH - 32, y + 12);
    });

    c.textAlign = 'center';
    c.font = 'bold 6.5px monospace';
    c.fillStyle = this.shopNotice.startsWith('FALTAN') || this.shopNotice.startsWith('YA ESTÁ')
      ? '#ff4d00'
      : '#70e000';
    c.fillText(this.shopNotice, WIDTH / 2, 145);

    c.fillStyle = '#adb5bd';
    c.font = 'bold 6px monospace';
    c.fillText('[1]-[5] COMPRAR · [E] O [ESC] SALIR', WIDTH / 2, 155);
    c.restore();
  }

  drawAutomap(now) {
    const c = this.ctx;
    const cell = 3;
    const mapPx = CONFIG.MAP_SIZE * cell;
    const originX = Math.floor((WIDTH - mapPx) / 2);
    const originY = 16;

    c.fillStyle = '#04140a';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);
    c.fillStyle = 'rgba(0, 60, 24, 0.35)';
    for (let y = 0; y < VIEW_HEIGHT; y += 4) {
      c.fillRect(0, y, WIDTH, 1);
    }

    c.textAlign = 'center';
    c.font = 'bold 9px monospace';
    c.fillStyle = '#70e000';
    c.fillText(`AUTOMAPA // SECTOR ${String(this.level).padStart(2, '0')} (${this.currentLayoutName || 'GRID'})`, WIDTH / 2, 10);

    c.fillStyle = '#031008';
    c.fillRect(originX - 2, originY - 2, mapPx + 4, mapPx + 4);
    c.strokeStyle = 'rgba(112, 224, 0, 0.55)';
    c.lineWidth = 1;
    c.strokeRect(originX - 2.5, originY - 2.5, mapPx + 5, mapPx + 5);

    const explored = this.explored || [];
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (!explored[y] || !explored[y][x]) continue;
        const ch = this.map[y][x];
        const dx = originX + x * cell;
        const dy = originY + y * cell;
        if (ch === '0') {
          c.fillStyle = 'rgba(24, 92, 38, 0.5)';
          c.fillRect(dx, dy, cell, cell);
          continue;
        }
        if (ch === '6' || ch === '7') {
          const door = this.doors.get(`${x},${y}`);
          if (ch === '7' && !door?.discovered) {
            c.fillStyle = '#2e7d32';
            c.fillRect(dx, dy, cell, cell);
          } else {
            c.fillStyle = '#ffbe0b';
            c.fillRect(dx, dy, cell, cell);
          }
          continue;
        }
        if (ch === '4' || ch === '5') {
          c.fillStyle = '#ffbe0b';
          c.fillRect(dx, dy, cell, cell);
          continue;
        }
        c.fillStyle = '#35c04a';
        c.fillRect(dx, dy, cell, cell);
      }
    }

    const mark = (gx, gy, color, size = 2) => {
      c.fillStyle = color;
      c.fillRect(originX + gx * cell - Math.floor(size / 2), originY + gy * cell - Math.floor(size / 2), size, size);
    };

    for (const chest of this.chests) {
      const gx = Math.floor(chest.x), gy = Math.floor(chest.y);
      if (explored[gy]?.[gx]) mark(gx, gy, chest.opened ? '#3b4a2f' : '#ffbe0b', 2);
    }
    for (const p of this.powerups) {
      const gx = Math.floor(p.x), gy = Math.floor(p.y);
      if (p.active && explored[gy]?.[gx]) mark(gx, gy, '#00f5d4', 2);
    }
    if (this.keyItem?.active) {
      const gx = Math.floor(this.keyItem.x), gy = Math.floor(this.keyItem.y);
      if (explored[gy]?.[gx]) mark(gx, gy, '#ffd700', 3);
    }
    if (this.merchant) {
      const gx = Math.floor(this.merchant.x), gy = Math.floor(this.merchant.y);
      if (explored[gy]?.[gx]) {
        mark(gx, gy, '#ffbe0b', 3);
        c.strokeStyle = '#fff3b0';
        c.strokeRect(originX + gx * cell - 2.5, originY + gy * cell - 2.5, 5, 5);
      }
    }
    if (this.exitDoor) {
      const gx = Math.floor(this.exitDoor.x), gy = Math.floor(this.exitDoor.y);
      if (explored[gy]?.[gx]) {
        c.fillStyle = '#ff4d00';
        c.fillRect(originX + gx * cell - 3, originY + gy * cell - 3, 7, 7);
        c.fillStyle = '#fff3b0';
        c.font = 'bold 5.5px monospace';
        c.textAlign = 'center';
        c.fillText('EXIT', originX + gx * cell + 0.5, originY + gy * cell + 2);
      }
    }

    if (Math.floor(now / 260) % 2 === 0) {
      const pxMap = originX + this.player.x * cell;
      const pyMap = originY + this.player.y * cell;
      const ang = this.player.angle;
      c.save();
      c.translate(pxMap, pyMap);
      c.rotate(ang);
      c.fillStyle = '#fff3b0';
      c.beginPath();
      c.moveTo(4.5, 0);
      c.lineTo(-3, -3);
      c.lineTo(-1.5, 0);
      c.lineTo(-3, 3);
      c.closePath();
      c.fill();
      c.strokeStyle = '#ff4d00';
      c.lineWidth = 1;
      c.stroke();
      c.restore();
    }

    c.font = 'bold 6px monospace';
    c.textAlign = 'center';
    c.fillStyle = '#70e000';
    c.fillText('VERDE: MUROS · ÁMBAR: PUERTAS/COFRES/EXIT · [TAB] CERRAR', WIDTH / 2, 164);
  }

  drawPauseScreen() {
    const c = this.ctx;
    const isFs = Boolean(document.fullscreenElement);
    c.fillStyle = 'rgba(14, 4, 6, 0.92)';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

    c.strokeStyle = '#ff4d00';
    c.lineWidth = 1.5;
    c.strokeRect(24, 6, WIDTH - 48, VIEW_HEIGHT - 12);

    c.fillStyle = '#ff4d00';
    c.font = 'bold 15px monospace';
    c.textAlign = 'center';
    c.fillText('MISIÓN EN PAUSA // AJUSTES', WIDTH / 2, 23);

    c.fillStyle = '#fff3b0';
    c.font = 'bold 6px monospace';
    c.fillText('USA [↑/↓], [←/→], [ENTER] O CLIC EN UNA OPCIÓN', WIDTH / 2, 35);

    const sensPct = Math.round((this.mouseSens || 1.0) * 100);
    const options = [
      { label: '▶ CONTINUAR PARTIDA [ESC]', bg: '#1e3a24', border: '#70e000', y: 46 },
      {
        label: isFs ? '🗗 SALIR DE PANTALLA COMPLETA [F]' : '⛶ PANTALLA COMPLETA [F]',
        bg: '#1b2c3b',
        border: '#00f5d4',
        y: 68
      },
      {
        label: `🎯 SENSIBILIDAD RATÓN: ${sensPct}% [←/→]`,
        bg: '#2b2214',
        border: '#ffbe0b',
        y: 90
      },
      {
        label: `👁️ REDUCIR TEMBLOR / DESTELLOS: ${this.reducedEffects ? 'SÍ' : 'NO'}`,
        bg: '#241834',
        border: '#9d4edd',
        y: 112
      },
      { label: '✖ SALIR AL MENÚ SIN GUARDAR [Q]', bg: '#3e181b', border: '#d90429', y: 134 }
    ];

    options.forEach((opt, idx) => {
      const active = this.pauseMenuIndex === idx;
      c.fillStyle = opt.bg;
      c.fillRect(46, opt.y, 228, 19);
      c.strokeStyle = active ? '#ffffff' : opt.border;
      c.lineWidth = active ? 2 : 1;
      c.strokeRect(46, opt.y, 228, 19);
      c.fillStyle = active ? '#ffbe0b' : '#ffffff';
      c.font = 'bold 6.8px monospace';
      c.fillText(opt.label, WIDTH / 2, opt.y + 12.5);
    });

    this.drawHUD(performance.now());
  }
}