import { getCharacterProfile, drawCharacterFace } from './portrait.js';
import {
  BAYER_4X4,
  VOXEL_SPECIES_SPECS,
  makeEnemyAnimationSet,
  getOrBakeVoxelSprite,
  getTintedSprite
} from './voxels.js';
import {
  makeWeaponSprites,
  makeRocketProjectileSprite,
  makePlasmaBoltSprite,
  makeBfgOrbSprite,
  makeWeaponPickupSprite,
  makeGeneratorSprite,
  makePylonSprite,
  makeVipSprite,
  makeColoredKeySprite,
  makeCoreSprite
} from './weapons.js';
import { crearAleatorio, mezclarSemilla } from './rng.js';

// ============================================================================
// CONFIGURACIÓN CENTRALIZADA DE BALANCE Y MOTOR (HELLFALL // BRUTAL EDITION)
// ============================================================================
const CONFIG = {
  WIDTH: 320,
  HEIGHT: 200,
  VIEW_HEIGHT: 168,
  HUD_HEIGHT: 32,
  RENDER_SCALE: 2,
  DEBUG_SPRITES: false,
  ENABLE_DITHER: false,
  FOV_PLANE: 0.76,
  WALL_SCALE: 1.58,
  MAX_LEVELS: 10,
  MAP_SIZE: 48,

  // Armas y economía: 7 armas (empiezas con Escopeta [1] y encuentras el resto en los sectores)
  CLIP_SIZE: 12,
  MAX_RESERVE: 96,
  MAX_FUEL: 100,
  MAX_ROCKETS: 30,
  MAX_CELLS: 180,
  START_AMMO: 16,
  START_RESERVE: 28,
  START_FUEL: 45,
  START_ROCKETS: 0,
  START_CELLS: 0,
  START_ARMOR: 20,
  SHOTGUN_COOLDOWN_MS: 420,
  SHOTGUN_DAMAGE: 2.15,
  SHOTGUN_PELLET_DAMAGE: 0.44,
  SHOTGUN_PELLET_COUNT: 7,
  SHOTGUN_SPREAD: 0.19,
  CHAINGUN_COOLDOWN_MS: 92,
  CHAINGUN_DAMAGE: 1.12,
  FLAMER_COOLDOWN_MS: 58,
  FLAMER_DAMAGE: 0.56,
  FLAMER_FUEL_COST: 0.35,
  ROCKET_COOLDOWN_MS: 680,
  ROCKET_DAMAGE: 6.2,
  ROCKET_RADIUS: 2.9,
  ROCKET_SPEED: 14.5,
  PLASMA_COOLDOWN_MS: 105,
  PLASMA_DAMAGE: 1.55,
  PLASMA_SPEED: 19.5,
  BFG_COOLDOWN_MS: 1100,
  BFG_CELL_COST: 30,
  BFG_DAMAGE: 14.5,
  BFG_RADIUS: 5.2,
  BFG_SPEED: 8.6,
  REROLL_COST: 8,
  BARREL_COUNT: 6,
  BARREL_RADIUS: 3.2,
  BARREL_DAMAGE: 6.5,

  // Motosierra: desbloqueo por 40 bajas o recogida en cámara secreta
  CHAINSAW_UNLOCK_KILLS: 40,
  CHAINSAW_COOLDOWN_MS: 115,
  CHAINSAW_DAMAGE: 1.45,
  CHAINSAW_RANGE: 1.85,
  CHAINSAW_SHELL_RANGE: [2, 3],
  CHAINSAW_FUEL_RANGE: [6, 10],

  // Ejecuciones de gloria
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
  FLOOR_AMMO_CHANCE: 1.0,
  FLOOR_AMMO_AMOUNT: 8,
  FLOOR_FUEL_AMOUNT: 18,
  FLOOR_MEDKIT_CHANCE: 0.75,
  FLOOR_MEDKIT_HEAL: 25,
  SOULSPHERE_HEALTH: 35,
  MAX_SOUL_HEALTH: 135,
  BERSERK_DURATION: 12.0,

  // Monedas
  ENEMY_COIN_CHANCE: 0.38,
  ENEMY_COIN_RANGE: [1, 3],
  BOSS_COIN_RANGE: [12, 18],

  // Mercader de almas: incluye cohetes y celdas de plasma
  MERCHANT: {
    AMMO: { price: 8, amount: 14, label: 'CAJA DE CARTUCHOS', detail: '+14 balas de reserva' },
    HEALTH: { price: 10, amount: 35, label: 'BOTIQUÍN DE CAMPO', detail: '+35% de salud' },
    ARMOR: { price: 12, amount: 30, label: 'PLACA DE BLINDAJE', detail: '+30% de armadura' },
    FUEL: { price: 6, amount: 35, label: 'BIDÓN DE GASOLINA', detail: '+35% de combustible' },
    WEAPON_MOD: { price: 15, amount: 12, label: 'TEMPLAR ARSENAL', detail: '+12% daño de armas permanente' },
    ROCKETS: { price: 9, amount: 6, label: 'CAJA DE COHETES', detail: '+6 cohetes explosivos [5]' },
    CELLS: { price: 9, amount: 45, label: 'BATERÍAS DE PLASMA', detail: '+45 celdas para Plasma/BFG [6/7]' }
  },

  // Paletas temáticas y bestiario exclusivo por sector
  SECTOR_THEMES: [
    {
      name: 'HANGAR DE CONTENCIÓN', layout: 'GRID', wall1: '#3d2b2f', wall2: '#5e1715', floor: '#2b1619', ceil: '#4a080a', vein: '#ff4d00', glow: '#ffbe0b', fog: [32, 10, 12], tint: [255, 224, 210],
      commons: ['IMP', 'RIFLEMAN', 'PINKY'], signature: ['RIFLEMAN', 'TURRET', 'SHIELD']
    },
    {
      name: 'PLANTA NUCLEAR', layout: 'RING', wall1: '#23362b', wall2: '#1b4332', floor: '#13241b', ceil: '#0f291e', vein: '#70e000', glow: '#ccff33', fog: [10, 26, 16], tint: [215, 255, 210],
      commons: ['IMP', 'CACODEMON', 'RIFLEMAN'], signature: ['TURRET', 'MANCUBUS', 'SHIELD']
    },
    {
      name: 'REFINERÍA TÓXICA', layout: 'CORRIDORS', wall1: '#42331b', wall2: '#5c4318', floor: '#261e10', ceil: '#33240c', vein: '#ffbe0b', glow: '#fff3b0', fog: [34, 22, 8], tint: [255, 236, 195],
      commons: ['IMP', 'BRUTE', 'PINKY'], signature: ['MANCUBUS', 'RIFLEMAN', 'TURRET']
    },
    {
      name: 'CENTRO DE MANDO', layout: 'CROSS', wall1: '#1d2d44', wall2: '#1b3b5a', floor: '#111d2b', ceil: '#0d1b2a', vein: '#00b4d8', glow: '#caf0f8', fog: [11, 20, 34], tint: [205, 235, 255],
      commons: ['RIFLEMAN', 'SHIELD', 'CACODEMON'], signature: ['SNIPER', 'TURRET', 'RIFLEMAN']
    },
    {
      name: 'LABORATORIOS UAC', layout: 'CITADEL', wall1: '#495057', wall2: '#343a40', floor: '#212529', ceil: '#2b3035', vein: '#00f5d4', glow: '#ffffff', fog: [18, 28, 30], tint: [225, 250, 250],
      commons: ['CACODEMON', 'SHIELD', 'LOST_SOUL'], signature: ['SPECTRE', 'SNIPER', 'TURRET']
    },
    {
      name: 'ANOMALÍA DE DEIMOS', layout: 'RING', wall1: '#3c1e4d', wall2: '#4a154b', floor: '#210f2b', ceil: '#2d0c3a', vein: '#9d4edd', glow: '#e0aaff', fog: [28, 10, 38], tint: [240, 210, 255],
      commons: ['CACODEMON', 'REVENANT', 'LOST_SOUL'], signature: ['SPECTRE', 'HELL_KNIGHT', 'SUMMONER']
    },
    {
      name: 'FORTALEZA DE CARNE', layout: 'CROSS', wall1: '#590d22', wall2: '#800f2f', floor: '#38040e', ceil: '#590d22', vein: '#ff0055', glow: '#ffccd5', fog: [42, 6, 14], tint: [255, 205, 215],
      commons: ['PINKY', 'BRUTE', 'IMP'], signature: ['HELL_KNIGHT', 'MANCUBUS', 'SPECTRE']
    },
    {
      name: 'TORRE DE BABEL', layout: 'CITADEL', wall1: '#2b2623', wall2: '#4a3b2c', floor: '#1a1614', ceil: '#291f14', vein: '#ffd700', glow: '#fff3b0', fog: [24, 18, 12], tint: [255, 240, 205],
      commons: ['REVENANT', 'BRUTE', 'CACODEMON'], signature: ['CYBERDEMON', 'SNIPER', 'HELL_KNIGHT']
    },
    {
      name: 'SANTUARIO PROFANO', layout: 'CORRIDORS', wall1: '#1a2e2b', wall2: '#264653', floor: '#101f1d', ceil: '#142b27', vein: '#2ec4b6', glow: '#cbf3f0', fog: [10, 24, 22], tint: [205, 255, 242],
      commons: ['SUMMONER', 'REVENANT', 'LOST_SOUL'], signature: ['SPECTRE', 'HELL_KNIGHT', 'MANCUBUS']
    },
    {
      name: 'EL ABISMO', layout: 'RING', wall1: '#240046', wall2: '#3c096c', floor: '#10002b', ceil: '#190033', vein: '#ff007f', glow: '#ffbe0b', fog: [22, 4, 34], tint: [250, 195, 255],
      commons: ['HELL_KNIGHT', 'REVENANT', 'MANCUBUS'], signature: ['CYBERDEMON', 'SPECTRE', 'SUMMONER']
    }
  ],

  // Pool aleatorio de eventos de sector por partida (ya no atados al nivel)
  SECTOR_EVENTS_POOL: [
    { type: 'PATROL', label: 'GUARDIA EN ALERTA', short: 'ALERTA', detail: 'Patrullas activas y muros trampa listos para emboscar' },
    { type: 'DARKNESS', label: 'APAGÓN TOTAL', short: 'APAGÓN', detail: 'Oscuridad densa: los espectros acechan en la penumbra' },
    { type: 'LAVA', label: 'FUGA DE MAGMA', short: 'MAGMA', detail: 'Grietas de magma ardiente queman a jugador y demonios' },
    { type: 'TOXIC', label: 'SUELO TÓXICO', short: 'TÓXICO', detail: 'Charcas ácidas corrosivas si te detienes sobre ellas' },
    { type: 'AMBUSH', label: 'ESCUADRÓN DE CHOQUE', short: 'EMBOSCADA', detail: 'Refuerzos por teletransporte más frecuentes y tropas blindadas' },
    { type: 'METEORS', label: 'LLUVIA ÍGNEA', short: 'METEOROS', detail: 'Impactos meteóricos periódicos sobre todo el sector' },
    { type: 'BLOOD_FOG', label: 'NIEBLA SANGRIENTA', short: 'NIEBLA', detail: 'Bruma carmesí que enfurece y acelera a los hostiles' },
    { type: 'OVERCHARGE', label: 'SOBRECARGA ABISAL', short: 'SOBRECARGA', detail: 'Proyectiles más rápidos, pero +50% monedas y drops de energía' }
  ],

  // Modificadores de puertas de ruta (estilo Hades / Slay the Spire)
  ROUTE_MODIFIERS: {
    TREASURE: { id: 'TREASURE', label: 'CÁMARA DE TESOROS', icon: '💎', color: '#ffbe0b', rewardHint: '+2 Cofres UAC y alijo extra de arma/munición' },
    MERCHANT: { id: 'MERCHANT', label: 'RUTA DEL MERCADER', icon: '⚖️', color: '#00f5d4', rewardHint: '+40% Monedas, Soulsphere cercana y tienda' },
    ELITE: { id: 'ELITE', label: 'INCURSIÓN DE ÉLITE', icon: '☠️', color: '#ff0055', rewardHint: 'Más élites, pero +50% monedas y +300 PTS extra' },
    ARCANE: { id: 'ARCANE', label: 'ALTAR ARCANO', icon: '🔮', color: '#9d4edd', rewardHint: 'Sala secreta extra y Soulsphere garantizada' }
  },

  // 6 tipos de objetivos de misión por sector
  OBJECTIVE_LABELS: {
    BOSS_KEY: { name: 'CAZA AL GUARDIÁN', short: 'BOSS + LLAVE', desc: 'Derrota al Boss Guardián, coge la llave y sal por EXIT' },
    GENERATORS: { name: 'SABOTAJE INFERNAL', short: 'GENERADORES', desc: 'Destruye todos los Generadores Demoníacos para abrir EXIT' },
    SURVIVAL_WAVES: { name: 'RESISTENCIA ABISAL', short: 'OLEADAS', desc: 'Activa el Nexo Central y sobrevive a 3 oleadas demoníacas' },
    ESCORT_RESCUE: { name: 'RESCATE Y ESCOLTA', short: 'ESCOLTA VIP', desc: 'Rescata al Científico UAC [E] y llévalo vivo hasta EXIT' },
    ESCAPE_COUNTDOWN: { name: 'SOBRECARGA Y FUGA', short: 'CUENTA ATRÁS', desc: 'Detona el Núcleo [E] y escapa por EXIT antes del colapso' },
    THREE_KEYS: { name: 'TRIPLE SELLO UAC', short: '3 LLAVES', desc: 'Recoge las llaves Roja, Azul y Amarilla para abrir EXIT' },
    FINAL_ICON: { name: 'JUICIO FINAL', short: 'ICON OF SIN', desc: 'Destruye los Pilones y derrota al Icon of Sin en 3 fases' }
  },

  // Densidad y escalado de dificultad (Director controla spawns iniciales + refuerzos)
  BASE_ENEMIES: 10,
  ENEMIES_PER_LEVEL: 1.45,
  MAX_REGULAR_ENEMIES: 24,
  MIN_ENEMY_SPACING: 3.4,
  LEVEL_HP_SCALE: 0.14,
  LEVEL_DMG_SCALE: 0.10,
  LEVEL_SPEED_SCALE: 0.04,
  ELITE_START_LEVEL: 3,
  ELITE_CHANCE: 0.22,

  // Mejoras permanentes del Altar
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
      ranks: ['+8 reserva máxima, +2 cohetes y +15 celdas de plasma', '+8 reserva máxima, +3 cohetes y +20 celdas más']
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

  UPGRADE_PRESSURE: {
    HP: 0.06,
    DAMAGE: 0.05,
    SPEED: 0.015,
    EXTRA_ENEMIES: 0.55,
    BOSS_HP: 0.05,
    ELITE: 0.015
  },

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

  // Bestiario completo: 15 especies normales/pesadas + Campeón + Jefes + Icon of Sin
  ENEMIES: {
    IMP: {
      hp: 3.6, speed: 1.25, meleeDmg: 10, projDmg: 9, projSpeed: 6.4,
      painChance: 0.65, scale: 0.98, rangedCd: [1.8, 3.1], dashChance: 0.10
    },
    RIFLEMAN: {
      hp: 3.4, speed: 1.05, meleeDmg: 8, projDmg: 5, projSpeed: 0, hitscan: true,
      painChance: 0.72, scale: 0.98, rangedCd: [1.9, 3.0], dashChance: 0.05
    },
    SNIPER: {
      hp: 4.2, speed: 0.96, meleeDmg: 8, projDmg: 19, projSpeed: 0, sniper: true,
      painChance: 0.55, scale: 1.04, rangedCd: [3.2, 4.4], dashChance: 0.04
    },
    TURRET: {
      hp: 6.2, speed: 0, meleeDmg: 0, projDmg: 7, projSpeed: 12.5, turret: true,
      painChance: 0.08, scale: 0.92, rangedCd: [1.4, 2.2], dashChance: 0
    },
    CACODEMON: {
      hp: 5.4, speed: 1.1, meleeDmg: 14, projDmg: 12, projSpeed: 7.2,
      painChance: 0.45, scale: 1.06, rangedCd: [2.0, 3.4], dashChance: 0.26
    },
    BRUTE: {
      hp: 8.2, speed: 1.0, meleeDmg: 18, projDmg: 15, projSpeed: 7.8,
      painChance: 0.28, scale: 1.2, rangedCd: [2.2, 3.6], dashChance: 0.42
    },
    MANCUBUS: {
      hp: 14.5, speed: 0.68, meleeDmg: 20, projDmg: 13, projSpeed: 7.4, mancubus: true,
      painChance: 0.18, scale: 1.28, rangedCd: [2.4, 3.6], dashChance: 0.04
    },
    HELL_KNIGHT: {
      hp: 10.5, speed: 1.32, meleeDmg: 19, projDmg: 13, projSpeed: 9.2, hellKnight: true,
      painChance: 0.25, scale: 1.18, rangedCd: [1.9, 3.0], dashChance: 0.48
    },
    SPECTRE: {
      hp: 5.8, speed: 1.92, meleeDmg: 16, projDmg: 0, projSpeed: 0, invisible: true,
      painChance: 0.35, scale: 1.04, rangedCd: [99, 99], dashChance: 0.58
    },
    SUMMONER: {
      hp: 8.5, speed: 1.35, meleeDmg: 10, projDmg: 8, projSpeed: 6.8,
      painChance: 0.4, scale: 1.05, rangedCd: [3.2, 5.0], dashChance: 0.08
    },
    LOST_SOUL: {
      hp: 1.15, speed: 2.15, meleeDmg: 11, projDmg: 0, projSpeed: 0,
      painChance: 0.9, scale: 0.68, rangedCd: [99, 99], dashChance: 0
    },
    SHIELD: {
      hp: 11, speed: 0.82, meleeDmg: 17, projDmg: 11, projSpeed: 6.2,
      painChance: 0.22, scale: 1.18, rangedCd: [2.8, 4.2], dashChance: 0.04
    },
    PINKY: {
      hp: 6.4, speed: 1.75, meleeDmg: 16, projDmg: 0, projSpeed: 0,
      painChance: 0.35, scale: 1.04, rangedCd: [99, 99], dashChance: 0.52
    },
    REVENANT: {
      hp: 7.4, speed: 1.15, meleeDmg: 13, projDmg: 12, projSpeed: 5.5,
      painChance: 0.34, scale: 1.12, rangedCd: [2.5, 3.8], dashChance: 0.16, homing: true
    },
    CYBERDEMON: {
      hp: 21.0, speed: 0.85, meleeDmg: 24, projDmg: 18, projSpeed: 10.2, cyberRocket: true,
      painChance: 0.12, scale: 1.34, rangedCd: [2.2, 3.2], dashChance: 0.12
    },
    CHAMPION: {
      hp: 13.5, speed: 0.94, meleeDmg: 14, projDmg: 9, projSpeed: 5.8,
      painChance: 0.26, scale: 1.28, windupSec: 0.9, chargeSec: 0.58, recoverSec: 1.0,
      chargeSpeed: 4.9, dashSpeed: 5.8, dashSec: 0.22, dashCooldown: 4.1,
      stompRadius: 4.4, stompDamage: 16, stompCooldown: 8.2
    },
    BOSS: {
      hp: 17.5, speed: 0.98, meleeDmg: 16, projDmg: 10, projSpeed: 6.2,
      painChance: 0.22, scale: 1.38, windupSec: 0.88, chargeSec: 0.62, recoverSec: 0.95,
      chargeSpeed: 5.2, dashSpeed: 6.2, dashSec: 0.24, dashCooldown: 3.7,
      stompRadius: 4.8, stompDamage: 20, stompCooldown: 7.4
    },
    ICON_OF_SIN: {
      hp: 58.0, speed: 0.92, meleeDmg: 24, projDmg: 15, projSpeed: 7.4,
      painChance: 0.08, scale: 1.62, windupSec: 0.78, chargeSec: 0.65, recoverSec: 0.85,
      chargeSpeed: 6.0, dashSpeed: 7.2, dashSec: 0.26, dashCooldown: 3.0,
      stompRadius: 5.6, stompDamage: 24, stompCooldown: 6.2
    }
  }
};

const {
  WIDTH,
  HEIGHT,
  VIEW_HEIGHT,
  HUD_HEIGHT,
  RENDER_SCALE,
  FOV_PLANE,
  WALL_SCALE,
  MAX_LEVELS,
  CLIP_SIZE,
  MAX_RESERVE,
  MAX_FUEL,
  MAX_ROCKETS,
  MAX_CELLS
} = CONFIG;

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const distance = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const randInt = (min, max) => Math.floor(min + Math.random() * (max - min + 1));

// ============================================================================
// REPRODUCTOR DE MÚSICA (SOLO INICIA AL COMENZAR LA PARTIDA, NO EN LA WEB)
// ============================================================================
class DoomMusicPlayer {
  constructor() {
    this.bgm = document.getElementById('doom-bgm') || new Audio('/doom.mp3');
    this.bgm.src = '/doom.mp3';
    this.bgm.loop = true;
    this.bgm.preload = 'auto';
    this.bgm.volume = 0.55;
    this.muted = false;
    this.inMatch = false;
    this.toggleBtn = document.getElementById('music-toggle');
    this.setupListeners();
  }

  setupListeners() {
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.muted = !this.muted;
        this.bgm.muted = this.muted;
        if (!this.muted && this.inMatch) {
          this.bgm.play().catch(() => {});
        } else if (this.muted) {
          this.bgm.pause();
        }
        this.updateButton();
      });
    }
    this.updateButton();
  }

  updateButton() {
    if (!this.toggleBtn) this.toggleBtn = document.getElementById('music-toggle');
    if (this.toggleBtn) this.toggleBtn.textContent = this.muted ? '🔇 BSO: OFF' : '🔊 BSO: ON';
  }

  startMatch() {
    this.inMatch = true;
    this.bgm.muted = this.muted;
    if (!this.muted && this.bgm.paused) {
      this.bgm.currentTime = 0;
      this.bgm.play().then(() => this.updateButton()).catch(() => {});
    }
  }

  stopMatch() {
    this.inMatch = false;
    if (!this.bgm.paused) {
      this.bgm.pause();
    }
    try { this.bgm.currentTime = 0; } catch (_) {}
  }

  setPaused(paused) {
    if (!this.inMatch || this.muted) return;
    if (paused) {
      if (!this.bgm.paused) this.bgm.pause();
    } else if (this.bgm.paused) {
      this.bgm.play().catch(() => {});
    }
  }

  ensurePlaying() {
    if (this.inMatch && !this.muted && this.bgm.paused) {
      this.bgm.play().catch(() => {});
    }
  }
}

export const globalDoomMusic = new DoomMusicPlayer();

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
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
        const sr = this.ctx.sampleRate;
        this.noiseBuffer = this.ctx.createBuffer(1, sr * 2, sr);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        const res = this.ctx.resume();
        if (res && typeof res.catch === 'function') res.catch(() => {});
      }
    } catch (_) {}
  }

  startAmbience() {
    try {
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
    } catch (_) {}
  }

  setAmbiencePaused(paused) {
    try {
      if (!this.ctx || !this.ambienceNodes) return;
      const target = paused || this.isMuted() ? 0.0001 : 0.055;
      this.ambienceNodes.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08);
    } catch (_) {}
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
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime + Math.max(0, delay || 0);
      const dur = Math.max(0.02, duration || 0.1);
      const safeVol = Math.max(0.01, vol || 0.2);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(Math.max(12, freqStart || 100), now);
      osc.frequency.exponentialRampToValueAtTime(Math.max(12, freqEnd || 60), now + dur);
      gain.gain.setValueAtTime(safeVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    } catch (_) {}
  }

  playNoise(filterType, freq, duration, vol = 0.4, delay = 0) {
    if (this.isMuted()) return;
    try {
      this.init();
      if (!this.ctx || !this.noiseBuffer) return;
      const now = this.ctx.currentTime + Math.max(0, delay || 0);
      const dur = Math.max(0.02, duration || 0.1);
      const safeVol = Math.max(0.01, vol || 0.2);
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(clamp(freq || 400, 40, 18000), now);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(safeVol, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      src.start(now);
      src.stop(now + dur + 0.02);
    } catch (_) {}
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

  playRocketLauncher() {
    this.playTone('sawtooth', 135, 32, 0.32, 0.48);
    this.playNoise('bandpass', 650, 0.3, 0.46);
  }

  playPlasma() {
    this.playTone('sine', 960, 240, 0.1, 0.26);
    this.playTone('square', 620, 180, 0.08, 0.18);
  }

  playBfgDetonate() {
    this.playTone('sawtooth', 260, 22, 0.72, 0.62);
    this.playTone('sine', 640, 75, 0.65, 0.38, 0.03);
    this.playNoise('lowpass', 1600, 0.68, 0.56);
  }

  playWeaponPickup() {
    [330, 440, 587.33, 880].forEach((f, i) => {
      this.playTone('square', f, f * 1.04, 0.14, 0.24, i * 0.05);
    });
  }

  playRifleBurst(dist = 8) {
    const vol = clamp((1 - dist / 24) * 0.32, 0.05, 0.34);
    this.playNoise('bandpass', 2200, 0.07, vol);
    this.playTone('square', 280, 90, 0.06, vol * 0.6);
  }

  playSniperLock() {
    this.playTone('sine', 1240, 1680, 0.18, 0.14);
  }

  playSniperShot(dist = 10) {
    const vol = clamp((1 - dist / 28) * 0.44, 0.1, 0.45);
    this.playTone('sawtooth', 520, 65, 0.22, vol);
    this.playNoise('highpass', 1800, 0.16, vol * 0.8);
  }

  playTurretBeep() {
    this.playTone('square', 980, 1280, 0.05, 0.12);
  }

  playTeleport() {
    this.playTone('sine', 180, 760, 0.32, 0.28);
    this.playNoise('bandpass', 1100, 0.28, 0.22);
  }

  playAlarm() {
    this.playTone('sawtooth', 540, 420, 0.16, 0.22);
    this.playTone('sawtooth', 540, 420, 0.16, 0.22, 0.2);
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
    const vol = clamp((1 - dist / 22) * (kind.includes('BOSS') || kind.includes('ICON') || kind.includes('TYRANT') || kind.includes('CHAMPION') ? 0.42 : 0.24), 0.04, 0.42);
    if (kind === 'IMP' || kind === 'RIFLEMAN' || kind === 'SNIPER') {
      this.playTone('sawtooth', 140, 65, 0.32, vol);
      this.playNoise('bandpass', 900, 0.25, vol * 0.6);
    } else if (kind === 'CACODEMON' || kind === 'SPECTRE') {
      this.playTone('triangle', 95, 42, 0.45, vol);
    } else if (kind === 'BRUTE' || kind === 'MANCUBUS' || kind === 'HELL_KNIGHT') {
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

  playHurt(pitchMult = 1.0) {
    this.playTone('sawtooth', 140 * pitchMult, 48 * pitchMult, 0.2, 0.4);
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
    this.renderScale = clamp(CONFIG.RENDER_SCALE || 2, 1, 2);
    this.worldW = Math.round(WIDTH * this.renderScale);
    this.worldH = Math.round(VIEW_HEIGHT * this.renderScale);
    this.canvas.width = Math.round(WIDTH * this.renderScale);
    this.canvas.height = Math.round(HEIGHT * this.renderScale);
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.ctx.imageSmoothingEnabled = false;
    this.onStatus = onStatus;
    this.onFinish = onFinish;
    this.audio = new HellAudioEngine();

    this.currentTheme = CONFIG.SECTOR_THEMES[0];
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
    this.texturePixels = {};
    for (const tid of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
      this.texturePixels[tid] = this.textures[tid].getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    }
    this.floorTexture = makeFloorTexture();
    this.floorPixels = this.floorTexture.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    this.ceilingTexture = makeCeilingTexture();
    this.ceilingPixels = this.ceilingTexture.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    this.sceneImageData = this.ctx.createImageData(this.worldW, this.worldH);

    this.animSets = {
      IMP: makeEnemyAnimationSet('IMP', '#8a4f2b'),
      RIFLEMAN: makeEnemyAnimationSet('RIFLEMAN', '#3f5e45'),
      SNIPER: makeEnemyAnimationSet('SNIPER', '#252936'),
      TURRET: makeEnemyAnimationSet('TURRET', '#5c6773'),
      CACODEMON: makeEnemyAnimationSet('CACODEMON', '#d90429'),
      BRUTE: makeEnemyAnimationSet('BARON', '#7a2832'),
      MANCUBUS: makeEnemyAnimationSet('MANCUBUS', '#b87d56'),
      HELL_KNIGHT: makeEnemyAnimationSet('HELL_KNIGHT', '#9e8c82'),
      SPECTRE: makeEnemyAnimationSet('SPECTRE', '#3c2a4d'),
      CYBERDEMON: makeEnemyAnimationSet('CYBERDEMON', '#8a3228'),
      SUMMONER: makeEnemyAnimationSet('SUMMONER', '#4b2d7a'),
      LOST_SOUL: makeEnemyAnimationSet('LOST_SOUL', '#ff4d00'),
      SHIELD: makeEnemyAnimationSet('SHIELD', '#495057'),
      PINKY: makeEnemyAnimationSet('PINKY', '#b5174b'),
      REVENANT: makeEnemyAnimationSet('REVENANT', '#adb5bd'),
      BOSS_CHAMPION: makeEnemyAnimationSet('BOSS_CHAMPION', '#6c242b'),
      BOSS_PYRO: makeEnemyAnimationSet('BOSS_PYRO', '#9e1919'),
      BOSS_NECRO: makeEnemyAnimationSet('BOSS_NECRO', '#2c1654'),
      BOSS_CYBER: makeEnemyAnimationSet('BOSS_CYBER', '#a31621'),
      BOSS_VOID: makeEnemyAnimationSet('BOSS_VOID', '#3d0c59'),
      BOSS_ICON: makeEnemyAnimationSet('BOSS_ICON', '#6e1423')
    };

    if (CONFIG.DEBUG_SPRITES && typeof document !== 'undefined') {
      const sheet = document.createElement('canvas');
      HellfallGame.debugSpriteSheet(sheet);
      this._debugSpriteSheet = sheet;
    }

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
    this.rocketSprites = [makeRocketProjectileSprite(0), makeRocketProjectileSprite(1)];
    this.plasmaSprites = [makePlasmaBoltSprite(0), makePlasmaBoltSprite(1)];
    this.bfgSprites = [makeBfgOrbSprite(0), makeBfgOrbSprite(1)];
    this.weaponPickupSprites = {
      2: [makeWeaponPickupSprite(2, 0), makeWeaponPickupSprite(2, 1)],
      3: [makeWeaponPickupSprite(3, 0), makeWeaponPickupSprite(3, 1)],
      4: [makeWeaponPickupSprite(4, 0), makeWeaponPickupSprite(4, 1)],
      5: [makeWeaponPickupSprite(5, 0), makeWeaponPickupSprite(5, 1)],
      6: [makeWeaponPickupSprite(6, 0), makeWeaponPickupSprite(6, 1)],
      7: [makeWeaponPickupSprite(7, 0), makeWeaponPickupSprite(7, 1)]
    };
    this.generatorSprites = {
      alive: [makeGeneratorSprite(true, 0), makeGeneratorSprite(true, 1)],
      dead: makeGeneratorSprite(false, 0)
    };
    this.pylonSprites = {
      active: [makePylonSprite(true, 0), makePylonSprite(true, 1)],
      inactive: makePylonSprite(false, 0)
    };
    this.vipSprites = {
      trapped: [makeVipSprite(false, 0), makeVipSprite(false, 1)],
      rescued: [makeVipSprite(true, 0), makeVipSprite(true, 1)]
    };
    this.coloredKeySprites = {
      RED: [makeColoredKeySprite('RED', 0), makeColoredKeySprite('RED', 1)],
      BLUE: [makeColoredKeySprite('BLUE', 0), makeColoredKeySprite('BLUE', 1)],
      YELLOW: [makeColoredKeySprite('YELLOW', 0), makeColoredKeySprite('YELLOW', 1)]
    };
    this.coreSprites = {
      idle: [makeCoreSprite(false, 0), makeCoreSprite(false, 1)],
      active: [makeCoreSprite(true, 0), makeCoreSprite(true, 1)]
    };
    this.orbSprites = {
      IMP: makeDemonOrbSprite('#ff4d00', '#ffbe0b'),
      CACODEMON: makeDemonOrbSprite('#00b4d8', '#caf0f8'),
      BRUTE: makeDemonOrbSprite('#38b000', '#ccff33'),
      HELL_KNIGHT: makeDemonOrbSprite('#00f5d4', '#70e000'),
      MANCUBUS: makeDemonOrbSprite('#ff4d00', '#fff3b0'),
      TURRET: makeDemonOrbSprite('#ff003c', '#ffbe0b'),
      CYBERDEMON: makeRocketProjectileSprite(0),
      SUMMONER: makeDemonOrbSprite('#70e000', '#ccff33'),
      SHIELD: makeDemonOrbSprite('#00b4d8', '#caf0f8'),
      REVENANT: makeDemonOrbSprite('#ff9e00', '#fff3b0'),
      BOSS: makeDemonOrbSprite('#ff0055', '#ffbe0b'),
      BOSS_NECRO: makeDemonOrbSprite('#70e000', '#ccff33'),
      BOSS_VOID: makeDemonOrbSprite('#9d4edd', '#00f5d4'),
      BOSS_ICON: makeDemonOrbSprite('#ff003c', '#ffbe0b')
    };
    this.weaponSprites = makeWeaponSprites();

    this.characterGender = 'male';
    this.characterProfile = getCharacterProfile('male');

    this.keys = new Set();
    this.zBuffer = new Float32Array(this.worldW);
    this._colStart = new Int16Array(this.worldW);
    this._colEnd = new Int16Array(this.worldW);
    this._bbPool = [];
    this._bbList = [];
    this._partPool = [];
    this._partList = [];
    this._hpBars = [];
    this._activeLights = [];
    this.map = [];
    this.mapSize = CONFIG.MAP_SIZE;
    this.doors = new Map();
    this.chests = [];
    this.armorPickups = [];
    this.powerups = [];
    this.weaponPickups = [];
    this.coins = [];
    this.barrels = [];
    this.teleporters = [];
    this.teleportPortals = [];
    this.monsterClosets = [];
    this.generators = [];
    this.arenaPylons = [];
    this.coloredKeys = [];
    this.vip = null;
    this.escapeCore = null;
    this.survivalState = null;
    this.sectorObjective = { type: 'BOSS_KEY', complete: false, label: 'BOSS + LLAVE' };
    this.runPlan = [];
    this.nextRouteChoice = null;
    this.director = { intensity: 0.2, state: 'BUILD', nextWaveAt: 0, reservePool: [], ambushesTriggered: 0, lastCombatAt: 0 };
    this.meteorStrikes = [];
    this.meteorTimer = 4.0;
    this.flowDist = [];
    this.flowTimer = 0;
    this.merchant = null;
    this.shockwaves = [];
    this.floorCracks = [];
    this.bloodPools = [];
    this.keyItem = null;
    this.fireProps = [];
    this.ammoPacks = [];
    this.medkits = [];
    this.flameProjectiles = [];
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.hitscanTracers = [];
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
        const im = this.intermission;
        if (im.stage === 'ROUTE') {
          const routes = im.routeChoices || [];
          if (routes.length > 0 && cy >= 56 && cy <= 138) {
            const count = routes.length;
            const totalW = WIDTH - 24;
            const gap = 6;
            const cardW = Math.floor((totalW - gap * (count - 1)) / count);
            for (let i = 0; i < count; i++) {
              const x0 = 12 + i * (cardW + gap);
              if (cx >= x0 && cx <= x0 + cardW) {
                this.selectRouteChoice(i);
                return;
              }
            }
          }
          return;
        }
        const choices = im.upgradeChoices || [];
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
        if (!im.upgradeSelected && cy >= 48 && cy <= 61 && cx >= 216 && cx <= 308) {
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
      if (this.shopOpen) {
        if (event.button === 0 && cx >= 24 && cx <= WIDTH - 24) {
          if (cy >= 27 && cy < 146) {
            const idx = Math.floor((cy - 27) / 17);
            if (idx >= 0 && idx < 7) {
              this.buyMerchantItem(idx + 1);
            }
          } else if (cy >= 146) {
            this.closeShop();
          }
        } else if (event.button === 2) {
          this.closeShop();
        }
        return;
      }

      if (this.paused) {
        if (cx >= 46 && cx <= 274) {
          if (cy >= 46 && cy <= 65) {
            this.resume();
            this.safeRequestPointerLock();
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
        this.safeRequestPointerLock();
        return;
      }

      const wasLocked = document.pointerLockElement === this.canvas;
      if (!wasLocked) this.safeRequestPointerLock();
      if (event.button === 2) {
        this.triggerPunch(false);
      } else if (event.button === 0) {
        this.mouseDown = true;
        this.shoot();
      }
    };

    this.onMouseUp = (event) => {
      if (!event || event.button === 0) this.mouseDown = false;
    };
    this.onWindowBlur = () => {
      this.keys.clear();
      this.mouseDown = false;
    };
    this.onWheel = (e) => {
      if (!this.running || this.paused || this.finished || this.intermission || this.shopOpen || this.mapOpen || this.deathSequence) return;
      const dir = Math.sign(e.deltaY);
      if (dir !== 0 && this.player) {
        const owned = [1, 2, 3, 4, 5, 6, 7].filter((w) => this.isWeaponOwned(w));
        if (owned.length > 1) {
          const curIdx = Math.max(0, owned.indexOf(this.player.weapon));
          const nextW = owned[(curIdx + dir + owned.length) % owned.length];
          this.selectWeapon(nextW);
        }
      }
    };

    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('contextmenu', this.onContextMenu);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('blur', this.onWindowBlur);
    window.addEventListener('wheel', this.onWheel);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', this.onPointerLockChange);
    this.renderAttractScreen();
  }

  safeRequestPointerLock() {
    try {
      if (this.canvas && this.canvas.requestPointerLock && document.pointerLockElement !== this.canvas) {
        const res = this.canvas.requestPointerLock();
        if (res && typeof res.catch === 'function') res.catch(() => {});
      }
    } catch (_) {}
  }

  safeExitPointerLock() {
    try {
      if (document.pointerLockElement === this.canvas && document.exitPointerLock) {
        document.exitPointerLock();
      }
    } catch (_) {}
  }

  setupFullscreenSupport() {
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

  setLogicalTransform() {
    this.ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  resetIdentityTransform() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  }

  static debugSpriteSheet(canvas) {
    const species = Object.keys(VOXEL_SPECIES_SPECS);
    const cols = 11;
    const cellW = 88;
    const cellH = 112;
    canvas.width = cols * cellW;
    canvas.height = species.length * cellH + 24;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#140c10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const headers = ['0°', '45°', '90°', '135°', '180°', '225°', '270°', '315°', 'CARGA', 'DAÑO', 'GORE'];
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#ffbe0b';
    headers.forEach((h, i) => ctx.fillText(h, i * cellW + 8, 16));

    species.forEach((kind, row) => {
      const y0 = 24 + row * cellH;
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.strokeRect(0, y0, canvas.width, cellH);
      for (let d = 0; d < 8; d++) {
        const sp = getOrBakeVoxelSprite(kind, 'walk', d, 0);
        const dx = d * cellW + Math.floor((cellW - sp.width) / 2);
        const dy = y0 + cellH - sp.height;
        ctx.drawImage(sp, dx, dy);
      }
      const chg = getOrBakeVoxelSprite(kind, 'charge', 0, 0);
      ctx.drawImage(chg, 8 * cellW + Math.floor((cellW - chg.width) / 2), y0 + cellH - chg.height);
      const pain = getOrBakeVoxelSprite(kind, 'pain', 0, 0);
      ctx.drawImage(pain, 9 * cellW + Math.floor((cellW - pain.width) / 2), y0 + cellH - pain.height);
      const death = getOrBakeVoxelSprite(kind, 'death', 0, 3);
      ctx.drawImage(death, 10 * cellW + Math.floor((cellW - death.width) / 2), y0 + cellH - death.height);
      ctx.fillStyle = '#00f5d4';
      ctx.fillText(kind, 4, y0 + 14);
    });
    return canvas;
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
    for (const tid of [1, 2, 3, 6, 7, 8, 9]) {
      this.texturePixels[tid] = this.textures[tid].getContext('2d', { willReadFrequently: true }).getImageData(0, 0, 64, 64).data;
    }
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
    snap.width = this.canvas.width;
    snap.height = this.canvas.height;
    const sctx = snap.getContext('2d');
    sctx.drawImage(this.canvas, 0, 0);
    if (tintColor) {
      sctx.fillStyle = tintColor;
      sctx.fillRect(0, 0, snap.width, snap.height);
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
      elapsed: 0,
      startedAt: performance.now()
    };
    this.audio.playMelt(type === 'DEATH');
  }

  updateAndDrawMelt(dt) {
    if (!this.melt) return false;
    const m = this.melt;
    const effDt = Math.max(dt || 0, 0.008);
    m.elapsed += effDt;
    this.setLogicalTransform();
    const c = this.ctx;
    const s = m.fromCanvas.width / WIDTH;
    const colW = m.colWidth;
    const speed = m.type === 'DEATH' ? 195 : 235;
    let allDone = true;

    for (let i = 0; i < m.cols.length; i++) {
      let y = m.cols[i];
      if (y < HEIGHT) {
        allDone = false;
        const step = y < 0 ? speed * 0.52 * effDt : (speed + Math.min(180, y * 1.45)) * effDt;
        y += step;
        m.cols[i] = y;
      }
      const drawY = Math.max(0, Math.floor(y));
      if (drawY < HEIGHT) {
        const x = i * colW;
        const srcX = Math.floor(x * s);
        const srcW = Math.max(1, Math.floor(colW * s));
        const srcH = Math.max(1, Math.floor((HEIGHT - drawY) * s));
        c.drawImage(m.fromCanvas, srcX, 0, srcW, srcH, x, drawY, colW, HEIGHT - drawY);
        if (drawY > 0) {
          c.fillStyle = m.type === 'DEATH' ? '#d90429' : (m.type === 'VICTORY' ? '#70e000' : '#ff4d00');
          c.fillRect(x, drawY, colW, 3);
          c.fillStyle = m.type === 'DEATH' ? '#780000' : '#ffbe0b';
          c.fillRect(x, Math.max(0, drawY - 2), colW, 2);
        }
      }
    }

    if (allDone || m.elapsed > 1.75 || (m.startedAt && performance.now() - m.startedAt > 2000)) {
      this.melt = null;
      return false;
    }
    return true;
  }

  setCharacter(gender) {
    this.characterGender = gender === 'female' ? 'female' : 'male';
    this.characterProfile = getCharacterProfile(this.characterGender);
  }

  isWeaponOwned(num) {
    if (!this.player) return num === 1;
    if (num === 4) {
      return this.player.kills >= CONFIG.CHAINSAW_UNLOCK_KILLS || this.player.unlockedWeapons?.has(4);
    }
    return this.player.unlockedWeapons ? this.player.unlockedWeapons.has(num) : num === 1;
  }

  unlockWeapon(num, viaPickup = true) {
    if (!this.player) return;
    if (!this.player.unlockedWeapons) this.player.unlockedWeapons = new Set([1]);
    const already = this.player.unlockedWeapons.has(num);
    this.player.unlockedWeapons.add(num);

    const ammoBonuses = {
      2: () => { this.player.reserve = Math.min(this.getMaxReserve(), this.player.reserve + (already ? 18 : 24)); },
      3: () => { this.player.fuel = Math.min(MAX_FUEL, this.player.fuel + (already ? 35 : 45)); },
      4: () => { this.chainsawAnnounced = true; },
      5: () => { this.player.rockets = Math.min(MAX_ROCKETS, (this.player.rockets || 0) + (already ? 5 : 8)); },
      6: () => { this.player.cells = Math.min(MAX_CELLS, (this.player.cells || 0) + (already ? 40 : 60)); },
      7: () => { this.player.cells = Math.min(MAX_CELLS, (this.player.cells || 0) + (already ? 45 : 75)); }
    };
    if (ammoBonuses[num]) ammoBonuses[num]();

    const meta = {
      2: { title: 'AMETRALLADORA CHAINGUN [2]', sub: '+24 CARTUCHOS · ALTA CADENCIA', col: '#ffbe0b' },
      3: { title: 'LANZALLAMAS INFERNAL [3]', sub: '+45% GASOLINA · IGNICIÓN CONTINUA', col: '#ff4d00' },
      4: { title: 'MOTOSIERRA INFERNAL [4]', sub: 'DESMIEMBRA Y COSECHA MUNICIÓN', col: '#d90429' },
      5: { title: 'LANZACOHETES PESADO [5]', sub: '+8 COHETES EXPLOSIVOS DE ÁREA', col: '#70e000' },
      6: { title: 'RIFLE DE PLASMA UAC [6]', sub: '+60 CELDAS DE PLASMA DE ALTA VELOCIDAD', col: '#00f5d4' },
      7: { title: 'BFG-9000 ABISAL [7]', sub: '+75 CELDAS · CAÑÓN DE ENERGÍA DEVASTADOR', col: '#ccff33' }
    }[num];

    if (viaPickup && meta) {
      this.audio.playWeaponPickup();
      this.pickupFlashTime = performance.now();
      this.evilGrinUntil = performance.now() + 1800;
      if (!already) {
        this.player.weapon = num;
        this.pushLootNotification(`🔫 NUEVA ARMA: ${meta.title}`, [meta.sub], meta.col);
        this.onStatus(`🔫 ¡ARMA ENCONTRADA! ${meta.title} (${meta.sub})`);
      } else {
        this.pushLootNotification(`📦 MUNICIÓN DE ${meta.title}`, [meta.sub], meta.col);
        this.onStatus(`📦 Munición extra recogida para ${meta.title}`);
      }
    }
  }

  selectWeapon(num) {
    if (!this.player) return;
    if (!this.isWeaponOwned(num)) {
      this.audio.playEmptyClip();
      if (num === 4) {
        const faltan = Math.max(0, CONFIG.CHAINSAW_UNLOCK_KILLS - this.player.kills);
        this.onStatus(`MOTOSIERRA [4] BLOQUEADA: ${faltan} bajas más o encuéntrala en una cámara`);
      } else {
        const missingNames = {
          2: 'CHAINGUN [2]',
          3: 'LANZALLAMAS [3]',
          5: 'LANZACOHETES [5]',
          6: 'RIFLE DE PLASMA [6]',
          7: 'BFG-9000 [7]'
        };
        this.onStatus(`${missingNames[num] || `ARMA [${num}]`} NO ENCONTRADA AÚN: explora salas y cofres del sector`);
      }
      return;
    }
    this.player.weapon = num;
    const names = {
      1: 'Arma [1]: SUPER ESCOPETA DOOM (7 perdigones reales en abanico)',
      2: 'Arma [2]: AMETRALLADORA CHAINGUN (Alta cadencia)',
      3: 'Arma [3]: LANZALLAMAS INFERNAL (Chorro ígneo con ignición)',
      4: 'Arma [4]: MOTOSIERRA INFERNAL (Cosecha munición y celdas al desmembrar)',
      5: 'Arma [5]: LANZACOHETES PESADO (Explosión de área y derribo)',
      6: 'Arma [6]: RIFLE DE PLASMA UAC (Proyectiles rápidos, bonus vs escudos/torretas)',
      7: 'Arma [7]: BFG-9000 ABISAL (Rayos en cadena + detonación masiva)'
    };
    this.onStatus(names[num] || names[1]);
  }

  spawnBloodPool(x, y, radius = 0.45, colorOverride = null) {
    if (this.isWall(x, y)) return;
    if (this.bloodPools.length >= 90) this.bloodPools.shift();
    this.bloodPools.push({
      x,
      y,
      radius: clamp(radius, 0.2, 1.05),
      seed: Math.random() * 12,
      dark: colorOverride ? colorOverride : '#4a0006',
      mid: colorOverride ? colorOverride : '#8f0310',
      bright: colorOverride ? '#ffffff' : '#d90429',
      custom: Boolean(colorOverride)
    });
  }

  spawnBlood(x, y, count = 12, colorOverride = null, createPool = true) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (this.bloodParticles.length > 220) {
      this.bloodParticles.splice(0, this.bloodParticles.length - 180);
    }
    const palette = colorOverride
      ? [colorOverride]
      : ['#4a0006', '#780009', '#b80c09', '#d90429', '#ff2a2a'];
    const capped = Math.min(count, 28);
    for (let i = 0; i < capped; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.7 + Math.random() * 2.9;
      this.bloodParticles.push({
        x: x + (Math.random() - 0.5) * 0.16,
        y: y + (Math.random() - 0.5) * 0.16,
        z: (Math.random() - 0.35) * 0.45,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: -0.9 - Math.random() * 1.4,
        life: 0.36 + Math.random() * 0.38,
        size: 1 + Math.floor(Math.random() * 3),
        color: palette[Math.floor(Math.random() * palette.length)],
        poolColor: colorOverride || null,
        spawnedPool: false
      });
    }
    if (createPool && count >= 10) {
      this.spawnBloodPool(
        x + (Math.random() - 0.5) * 0.3,
        y + (Math.random() - 0.5) * 0.3,
        0.32 + Math.min(0.55, count * 0.02),
        colorOverride
      );
    }
  }

  spawnWallSparks(x, y, count = 6, colorOverride = null) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    if (this.wallSparks.length > 220) {
      this.wallSparks.splice(0, this.wallSparks.length - 180);
    }
    const capped = Math.min(count, 24);
    for (let i = 0; i < capped; i++) {
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
  // PLANIFICACIÓN ALEATORIA DE PARTIDA, EVENTOS Y RUTAS (ESTILO HADES / SLAY)
  // ============================================================================
  // Azar del plan de la partida (sectores y rutas) y del mapa de cada sector. Sin semilla es Math.random().
  azarPlan() {
    return this.rngPlan ? this.rngPlan() : Math.random();
  }

  azarMapa() {
    return this.rngMapa ? this.rngMapa() : Math.random();
  }

  initRunPlan() {
    const shuffle = (arr) => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(this.azarPlan() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const layouts = ['GRID', 'RING', 'CORRIDORS', 'CROSS', 'CITADEL'];
    const eventsPool = shuffle(CONFIG.SECTOR_EVENTS_POOL);
    const themeOrder = [0, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8]), 9];
    const objectivePool = ['GENERATORS', 'SURVIVAL_WAVES', 'ESCORT_RESCUE', 'ESCAPE_COUNTDOWN', 'THREE_KEYS', 'BOSS_KEY'];

    this.runPlan = [];
    for (let lvl = 1; lvl <= MAX_LEVELS; lvl++) {
      const themeIdx = themeOrder[lvl - 1] ?? ((lvl - 1) % CONFIG.SECTOR_THEMES.length);
      const layout = lvl === 1 ? 'GRID' : (lvl === 10 ? 'CITADEL' : layouts[Math.floor(this.azarPlan() * layouts.length)]);
      const event = lvl === 10
        ? { type: 'APOCALYPSE', label: 'CATACLISMO ABISAL', short: 'ABISMO', detail: 'Tormenta de fuego y energía en el trono del Icon of Sin' }
        : (lvl === 1
          ? { ...eventsPool.find((e) => e.type === 'PATROL' || e.type === 'AMBUSH') || eventsPool[0] }
          : { ...eventsPool[(lvl - 1 + Math.floor(this.azarPlan() * 2)) % eventsPool.length] });
      const objectiveType = lvl === 1
        ? 'BOSS_KEY'
        : (lvl === 10 ? 'FINAL_ICON' : objectivePool[(lvl + Math.floor(this.azarPlan() * objectivePool.length)) % objectivePool.length]);

      this.runPlan.push({
        level: lvl,
        themeIndex: themeIdx,
        layout,
        event,
        objectiveType,
        routeMod: null
      });
    }
    this.nextRouteChoice = null;
  }

  generateRouteChoices(nextLevel) {
    if (nextLevel >= MAX_LEVELS) {
      return [{
        routeMod: CONFIG.ROUTE_MODIFIERS.ELITE,
        themeIndex: 9,
        themeName: CONFIG.SECTOR_THEMES[9].name,
        layout: 'CITADEL',
        objectiveType: 'FINAL_ICON',
        event: { type: 'APOCALYPSE', label: 'CATACLISMO ABISAL', short: 'ABISMO', detail: 'Combate final multi-fase contra Icon of Sin' },
        isFinal: true
      }];
    }
    const modKeys = ['TREASURE', 'MERCHANT', 'ELITE', 'ARCANE'];
    for (let i = modKeys.length - 1; i > 0; i--) {
      const j = Math.floor(this.azarPlan() * (i + 1));
      [modKeys[i], modKeys[j]] = [modKeys[j], modKeys[i]];
    }
    const layouts = ['GRID', 'RING', 'CORRIDORS', 'CROSS', 'CITADEL'];
    const objPool = ['BOSS_KEY', 'GENERATORS', 'SURVIVAL_WAVES', 'ESCORT_RESCUE', 'ESCAPE_COUNTDOWN', 'THREE_KEYS'];
    for (let i = objPool.length - 1; i > 0; i--) {
      const j = Math.floor(this.azarPlan() * (i + 1));
      [objPool[i], objPool[j]] = [objPool[j], objPool[i]];
    }
    const evPool = [...CONFIG.SECTOR_EVENTS_POOL].sort(() => this.azarPlan() - 0.5);
    const themePool = [1, 2, 3, 4, 5, 6, 7, 8].sort(() => this.azarPlan() - 0.5);

    const doorCount = 3;
    const choices = [];
    for (let i = 0; i < doorCount; i++) {
      const modKey = modKeys[i];
      const themeIndex = themePool[i % themePool.length];
      choices.push({
        routeMod: CONFIG.ROUTE_MODIFIERS[modKey],
        themeIndex,
        themeName: CONFIG.SECTOR_THEMES[themeIndex].name,
        layout: layouts[(nextLevel + i + Math.floor(this.azarPlan() * 3)) % layouts.length],
        objectiveType: objPool[i % objPool.length],
        event: { ...evPool[i % evPool.length] },
        isFinal: false
      });
    }
    return choices;
  }

  getSectorEventForLevel(level) {
    if (this.nextRouteChoice?.event) return this.nextRouteChoice.event;
    if (this.runPlan && this.runPlan[level - 1]?.event) return this.runPlan[level - 1].event;
    const pool = CONFIG.SECTOR_EVENTS_POOL;
    return pool[Math.floor(this.azarMapa() * pool.length)];
  }

  // ============================================================================
  // GENERADOR DE SECTORES CON PLANTILLAS VARIADAS, MONSTER CLOSETS Y OBJETIVOS
  // ============================================================================
  generateProceduralMap(level) {
    const size = CONFIG.MAP_SIZE;
    this.mapSize = size;
    this.doors.clear();
    this.chests = [];
    this.armorPickups = [];
    this.powerups = [];
    this.weaponPickups = [];
    this.coins = [];
    this.barrels = [];
    this.teleporters = [];
    this.teleportPortals = [];
    this.monsterClosets = [];
    this.generators = [];
    this.arenaPylons = [];
    this.coloredKeys = [];
    this.vip = null;
    this.escapeCore = null;
    this.survivalState = null;
    this.meteors = [];
    this.merchant = null;
    this.shockwaves = [];
    this.floorCracks = [];
    this.bloodPools = [];

    const plan = this.nextRouteChoice || this.runPlan?.[level - 1] || {};
    const themeIdx = plan.themeIndex !== undefined ? plan.themeIndex : ((level - 1) % CONFIG.SECTOR_THEMES.length);
    const routeMod = plan.routeMod || null;
    this.activeRouteMod = routeMod;
    this.applySectorTheme(themeIdx + 1);
    const theme = this.currentTheme || CONFIG.SECTOR_THEMES[0];
    const layoutType = plan.layout || theme.layout || 'GRID';
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

    if (layoutType === 'RING') {
      const ringPairs = [[0, 1], [1, 2], [2, 5], [5, 8], [8, 7], [7, 6], [6, 3], [3, 0]];
      for (const [a, b] of ringPairs) carveTunnel(nodes[a].cx, nodes[a].cy, nodes[b].cx, nodes[b].cy, 1);
      if (this.azarMapa() < 0.5) {
        carveTunnel(nodes[1].cx, nodes[1].cy, nodes[4].cx, nodes[4].cy, 1);
        carveTunnel(nodes[7].cx, nodes[7].cy, nodes[4].cx, nodes[4].cy, 1);
      } else {
        carveTunnel(nodes[3].cx, nodes[3].cy, nodes[4].cx, nodes[4].cy, 1);
        carveTunnel(nodes[5].cx, nodes[5].cy, nodes[4].cx, nodes[4].cy, 1);
      }
    } else if (layoutType === 'CROSS') {
      carveTunnel(nodes[1].cx, nodes[1].cy, nodes[7].cx, nodes[7].cy, 2);
      carveTunnel(nodes[3].cx, nodes[3].cy, nodes[5].cx, nodes[5].cy, 2);
      for (const [a, b] of [[0, 1], [2, 1], [6, 3], [8, 5], [0, 3], [2, 5]]) {
        carveTunnel(nodes[a].cx, nodes[a].cy, nodes[b].cx, nodes[b].cy, 1);
      }
    } else if (layoutType === 'CORRIDORS') {
      for (let r = 0; r < 3; r++) {
        carveTunnel(nodes[r * 3].cx, nodes[r * 3].cy, nodes[r * 3 + 2].cx, nodes[r * 3 + 2].cy, 1);
      }
      carveTunnel(nodes[0].cx, nodes[0].cy, nodes[3].cx, nodes[3].cy, 1);
      carveTunnel(nodes[2].cx, nodes[2].cy, nodes[5].cx, nodes[5].cy, 1);
      carveTunnel(nodes[4].cx, nodes[4].cy, nodes[7].cx, nodes[7].cy, 1);
      carveTunnel(nodes[3].cx, nodes[3].cy, nodes[6].cx, nodes[6].cy, 1);
      carveTunnel(nodes[5].cx, nodes[5].cy, nodes[8].cx, nodes[8].cy, 1);
    } else {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.abs(nodes[i].r - nodes[j].r) + Math.abs(nodes[i].c - nodes[j].c) === 1) {
            carveTunnel(nodes[i].cx, nodes[i].cy, nodes[j].cx, nodes[j].cy, 1);
          }
        }
      }
    }

    const secretPool = [
      { roomX: 8, roomY: 2, w: 5, h: 4, doorX: 10, doorY: 6, orient: 'H', secret: true },
      { roomX: 35, roomY: 2, w: 5, h: 4, doorX: 38, doorY: 6, orient: 'H', secret: true },
      { roomX: 2, roomY: 8, w: 4, h: 5, doorX: 6, doorY: 10, orient: 'V', secret: true },
      { roomX: 16, roomY: 43, w: 5, h: 3, doorX: 18, doorY: 42, orient: 'H', secret: true }
    ];
    const secStart = Math.floor(this.azarMapa() * secretPool.length);
    const secA = secretPool[secStart % secretPool.length];
    const secB = secretPool[(secStart + 1) % secretPool.length];
    const secC = secretPool[(secStart + 2) % secretPool.length];

    const merchantAtNorth = this.azarMapa() < 0.5;
    const vaultSpecs = [
      { roomX: 22, roomY: 2, w: 5, h: 4, doorX: 24, doorY: 6, orient: 'H', secret: false, merchant: merchantAtNorth },
      { roomX: 2, roomY: 22, w: 4, h: 5, doorX: 6, doorY: 24, orient: 'V', secret: false },
      { roomX: 43, roomY: 22, w: 3, h: 5, doorX: 42, doorY: 24, orient: 'V', secret: false },
      { roomX: 22, roomY: 43, w: 5, h: 3, doorX: 24, doorY: 42, orient: 'H', secret: false, merchant: !merchantAtNorth },
      secA,
      secB
    ];
    if (routeMod?.id === 'ARCANE') vaultSpecs.push(secC);

    const mandatoryTargets = [];
    const regularVaultCenters = [];
    const secretVaultCenters = [];

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
        secretVaultCenters.push({ x: cx, y: cy });
      } else {
        regularVaultCenters.push({ x: cx, y: cy });
      }
    }

    // Monster Closets: 2-3 compartimentos sellados ocultos en muros que se abren en emboscadas
    const closetCandidates = [
      { roomX: 16, roomY: 16, w: 3, h: 3, doorX: 17, doorY: 19, orient: 'H', triggerX: 17.5, triggerY: 24.5 },
      { roomX: 29, roomY: 16, w: 3, h: 3, doorX: 30, doorY: 19, orient: 'H', triggerX: 24.5, triggerY: 24.5 },
      { roomX: 16, roomY: 29, w: 3, h: 3, doorX: 17, doorY: 28, orient: 'H', triggerX: 24.5, triggerY: 24.5 }
    ];
    for (const cl of closetCandidates) {
      for (let y = cl.roomY - 1; y <= cl.roomY + cl.h; y++) {
        for (let x = cl.roomX - 1; x <= cl.roomX + cl.w; x++) {
          if (y > 2 && y < size - 3 && x > 2 && x < size - 3) grid[y][x] = '8';
        }
      }
      carveRect(cl.roomX, cl.roomY, cl.w, cl.h);
      grid[cl.doorY][cl.doorX] = '7';
      const outsideY = cl.doorY === 19 ? 20 : 27;
      grid[outsideY][cl.doorX] = '0';
      this.doors.set(`${cl.doorX},${cl.doorY}`, {
        open: 0,
        target: 0,
        x: cl.doorX,
        y: cl.doorY,
        orient: cl.orient,
        isSecret: true,
        isCloset: true,
        discovered: false
      });
      this.monsterClosets.push({
        doorKey: `${cl.doorX},${cl.doorY}`,
        doorX: cl.doorX,
        doorY: cl.doorY,
        spawnX: cl.roomX + 1.5,
        spawnY: cl.roomY + 1.5,
        triggerX: cl.triggerX,
        triggerY: cl.triggerY,
        opened: false
      });
    }

    const chestLimit = CONFIG.CHEST_COUNT + (routeMod?.id === 'TREASURE' ? 2 : 0);
    regularVaultCenters.sort(() => this.azarMapa() - 0.5);
    for (let i = 0; i < Math.min(chestLimit, regularVaultCenters.length); i++) {
      const vc = regularVaultCenters[i];
      this.chests.push({ x: vc.x, y: vc.y, opened: false, trapped: i % 2 === 1 });
    }
    if (routeMod?.id === 'TREASURE' || routeMod?.id === 'ARCANE') {
      // Cofres adicionales en salas laterales del 3x3
      this.chests.push({ x: nodes[2].cx + 1.5, y: nodes[2].cy + 0.5, opened: false, trapped: true });
      if (routeMod?.id === 'TREASURE') {
        this.chests.push({ x: nodes[5].cx + 0.5, y: nodes[5].cy + 1.5, opened: false, trapped: false });
      }
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
      const dirs = [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }, { dx: -1, dy: 0 }, { dx: 1, dy: 0 }];
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

    const isFinalLevel = level === MAX_LEVELS;
    const swapArenas = !isFinalLevel && level % 2 === 0;

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

    // Arena Sureste (en Sector 10 aún más imponente x: 30..45, y: 30..45)
    const seMin = isFinalLevel ? 30 : 32;
    for (let y = seMin; y <= 45; y++) {
      for (let x = seMin; x <= 45; x++) {
        grid[y][x] = (y === seMin || y === 45 || x === seMin || x === 45) ? (swapArenas ? '2' : '1') : '0';
      }
    }
    grid[seMin][37] = '9'; grid[seMin][38] = '6'; grid[seMin][39] = '9';
    grid[37][seMin] = '9'; grid[38][seMin] = '6'; grid[39][seMin] = '9';
    this.doors.set(`38,${seMin}`, { open: 0, target: 0, x: 38, y: seMin, orient: 'H', isSecret: false, isBossGate: true });
    this.doors.set(`${seMin},38`, { open: 0, target: 0, x: seMin, y: 38, orient: 'V', isSecret: false, isBossGate: true });

    const swArena = {
      cx: nodes[6].cx + 0.5,
      cy: nodes[6].cy + 0.5,
      bounds: { minX: 5.7, maxX: 14.3, minY: 33.7, maxY: 42.3 }
    };
    const seArena = {
      cx: isFinalLevel ? 38.0 : (nodes[8].cx + 0.5),
      cy: isFinalLevel ? 38.0 : (nodes[8].cy + 0.5),
      bounds: { minX: seMin + 0.7, maxX: 44.3, minY: seMin + 0.7, maxY: 44.3 }
    };

    this.championArena = swapArenas ? seArena : swArena;
    this.bossArena = swapArenas ? swArena : seArena;

    const doorTileChar = isFinalLevel ? '5' : '4';
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

    this.teleporters = [];
    this.map = grid.map((row) => row.join(''));
    return {
      startPos: { x: nodes[0].cx + 0.5, y: nodes[0].cy + 0.5 },
      emptyCells,
      exitDoor,
      nodes,
      secretVaultCenters,
      regularVaultCenters
    };
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
      const j = Math.floor(this.azarMapa() * (i + 1));
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
      const radius = CONFIG.HAZARD_RADIUS[0] + this.azarMapa() * (CONFIG.HAZARD_RADIUS[1] - CONFIG.HAZARD_RADIUS[0]);
      this.hazards.push({
        x: cell.x,
        y: cell.y,
        radius,
        kind: evType,
        phase: this.azarMapa() * 10
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
      rockets: CONFIG.START_ROCKETS,
      cells: CONFIG.START_CELLS,
      weapon: 1,
      unlockedWeapons: new Set([1]),
      kills: 0,
      coins: 0,
      hasKey: false,
      coloredKeys: { RED: false, BLUE: false, YELLOW: false },
      berserkUntil: 0,
      invulnerableUntil: 0
    };
    this.rngPlan = this.seed == null ? null : crearAleatorio(mezclarSemilla(this.seed, 0));
    this.initRunPlan();
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

  openMonsterCloset(closet, reason = 'EMBOSCADA') {
    if (!closet || closet.opened) return false;
    closet.opened = true;
    const door = this.doors.get(closet.doorKey);
    if (door) {
      door.target = 1;
      door.discovered = true;
    }
    let released = 0;
    for (const e of this.enemies) {
      if (e.closetKey === closet.doorKey && e.alive) {
        e.dormantCloset = false;
        e.alerted = true;
        released++;
      }
    }
    if (released > 0) {
      this.audio.playAlarm();
      this.audio.playDoorSlide();
      this.spawnWallSparks(closet.spawnX, closet.spawnY, 14, '#ff4d00');
      this.pushLootNotification(`🚨 ¡${reason}!`, ['MURO TRAMPA ABIERTO · REFUERZOS EN CAMINO'], '#ff0055');
      this.onStatus(`🚨 ¡EMBOSCADA! Se ha abierto un compartimento oculto con ${released} hostiles`);
    }
    return released > 0;
  }

  spawnTeleportWave(cx, cy, count = 2, speciesList = null, label = 'TELETRANSPORTE DEMONÍACO') {
    const valid = [];
    for (let attempt = 0; attempt < 40 && valid.length < count; attempt++) {
      const ang = Math.random() * Math.PI * 2;
      const dist = 3.2 + Math.random() * 6.5;
      const tx = cx + Math.cos(ang) * dist;
      const ty = cy + Math.sin(ang) * dist;
      if (
        !this.isWall(tx, ty) &&
        this.canEnemyMoveTo(tx, ty, 0.34) &&
        distance(tx, ty, this.player.x, this.player.y) > 4.2 &&
        !this.isCellInsideArena(tx, ty)
      ) {
        valid.push({ x: tx, y: ty });
      }
    }
    if (valid.length === 0) return 0;

    const pool = speciesList || this.getSectorEnemyPool(this.level);
    for (const pos of valid) {
      const spec = pool[Math.floor(Math.random() * pool.length)] || 'IMP';
      this.teleportPortals.push({
        x: pos.x,
        y: pos.y,
        timer: 1.05,
        maxTimer: 1.05,
        specKey: spec,
        isElite: this.level >= 4 && Math.random() < 0.22
      });
    }
    this.audio.playTeleport();
    if (label) {
      this.pushLootNotification(`🌀 ${label}`, [`+${valid.length} HOSTILES TELETRANSPORTÁNDOSE`], '#9d4edd');
    }
    return valid.length;
  }

  getSectorEnemyPool(level) {
    const theme = this.currentTheme || CONFIG.SECTOR_THEMES[0];
    const base = [...(theme.commons || ['IMP']), ...(theme.signature || ['IMP'])];
    return base.filter((k) => {
      if (k === 'CYBERDEMON') return level >= 6;
      if (k === 'HELL_KNIGHT' || k === 'MANCUBUS') return level >= 2;
      if (k === 'SNIPER' || k === 'SPECTRE') return level >= 2;
      if (k === 'SUMMONER' || k === 'REVENANT') return level >= 3;
      return true;
    });
  }

  prebakeSectorSprites() {
    const seen = new Set();
    for (let i = 0; i < this.enemies.length; i++) {
      const anim = this.enemies[i]?.anims;
      if (!anim || seen.has(anim)) continue;
      seen.add(anim);
      for (let d = 0; d < 8; d++) {
        for (let f = 0; f < 4; f++) anim.getWalk(d, f);
        anim.getPain(d);
      }
    }
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
    this.playerProjectiles = [];
    this.enemyProjectiles = [];
    this.hitscanTracers = [];
    this.bloodParticles = [];
    this.bloodPools = [];
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
    this.player.coloredKeys = { RED: false, BLUE: false, YELLOW: false };
    this.player.invulnerableUntil = 0;
    this.levelStartTime = performance.now();
    this.rngMapa = this.seed == null ? null : crearAleatorio(mezclarSemilla(this.seed, this.level));
    this.sectorEvent = this.getSectorEventForLevel(this.level);

    const plan = this.nextRouteChoice || this.runPlan?.[this.level - 1] || {};
    const objectiveType = this.level === MAX_LEVELS ? 'FINAL_ICON' : (plan.objectiveType || plan.objective || 'BOSS_KEY');
    this.nextRouteChoice = null;

    const mapData = this.generateProceduralMap(this.level);
    const { startPos, emptyCells, exitDoor, nodes, secretVaultCenters, regularVaultCenters } = mapData;
    this.player.x = startPos.x;
    this.player.y = startPos.y;
    this.exitDoor = exitDoor;
    this.initAutomap();
    this.generateSectorHazards(emptyCells, exitDoor);
    this.runStats.secretsTotal += 2 + (this.activeRouteMod?.id === 'ARCANE' ? 1 : 0);

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
      return farFloorCells.splice(Math.floor(this.azarMapa() * farFloorCells.length), 1)[0];
    };

    const ammoPacksCount = 1 + Math.floor((this.level - 1) / 3) + (this.activeRouteMod?.id === 'TREASURE' ? 1 : 0);
    for (let i = 0; i < ammoPacksCount; i++) {
      const cell = takeCell();
      if (!cell) break;
      this.ammoPacks.push({
        x: cell.x,
        y: cell.y,
        amount: CONFIG.FLOOR_AMMO_AMOUNT + Math.floor(this.level / 2),
        fuelAmount: CONFIG.FLOOR_FUEL_AMOUNT,
        rocketAmount: this.level >= 2 ? 2 : 0,
        cellAmount: this.level >= 3 ? 18 : 0,
        active: true
      });
    }

    const medkitCount = this.level >= 4 && this.azarMapa() < CONFIG.FLOOR_MEDKIT_CHANCE ? 2 : 1;
    for (let i = 0; i < medkitCount; i++) {
      if (i > 0 && this.azarMapa() > CONFIG.FLOOR_MEDKIT_CHANCE) break;
      const cell = takeCell();
      if (!cell) break;
      this.medkits.push({ x: cell.x, y: cell.y, active: true });
    }

    if (this.player.ammo === 0 && this.player.reserve === 0) this.player.ammo = 6;

    // Colocar armas encontrables en el mapa
    const weaponQueue = [];
    if (!this.isWeaponOwned(2) && this.level >= 1) weaponQueue.push(2);
    if (!this.isWeaponOwned(3) && this.level >= 1) weaponQueue.push(3);
    if (!this.isWeaponOwned(5) && this.level >= 2) weaponQueue.push(5);
    if (!this.isWeaponOwned(6) && this.level >= 3) weaponQueue.push(6);
    if (!this.isWeaponOwned(7) && this.level >= 5) weaponQueue.push(7);
    if (!this.isWeaponOwned(4) && this.level >= 4) weaponQueue.push(4);

    if (weaponQueue.length === 0) {
      const bonusChoices = [5, 6, 7].filter((w) => this.isWeaponOwned(w));
      if (bonusChoices.length > 0) {
        weaponQueue.push(bonusChoices[Math.floor(this.azarMapa() * bonusChoices.length)]);
      }
    }

    const weaponSpots = [];
    if (regularVaultCenters?.length) weaponSpots.push(...regularVaultCenters);
    if (secretVaultCenters?.length) weaponSpots.push(...secretVaultCenters);
    if (nodes?.[1]) weaponSpots.push({ x: nodes[1].cx + 0.5, y: nodes[1].cy + 0.5 });
    if (nodes?.[3]) weaponSpots.push({ x: nodes[3].cx + 0.5, y: nodes[3].cy + 0.5 });

    const maxWeaponsHere = this.level === 1 ? 2 : (this.activeRouteMod?.id === 'TREASURE' ? 2 : 1);
    for (let wi = 0; wi < Math.min(maxWeaponsHere, weaponQueue.length); wi++) {
      const spot = weaponSpots[wi] || takeCell();
      if (spot) {
        this.weaponPickups.push({
          x: spot.x + (wi === 0 ? 0.45 : -0.45),
          y: spot.y,
          weaponId: weaponQueue[wi],
          active: true
        });
      }
    }

    const totalUpgrades = this.getTotalUpgradeRanks();
    const upgP = CONFIG.UPGRADE_PRESSURE;
    const isEliteRoute = this.activeRouteMod?.id === 'ELITE';
    const extraEnemies = Math.floor(totalUpgrades * upgP.EXTRA_ENEMIES) + (this.sectorEvent?.type === 'AMBUSH' ? 3 : 0) + (isEliteRoute ? 3 : 0);

    this.enemies = [];
    const spawns = emptyCells.filter(
      (c) =>
        distance(c.x, c.y, this.player.x, this.player.y) > 7.5 &&
        !this.isCellInsideArena(c.x, c.y)
    );
    const totalBudget = Math.min(
      CONFIG.MAX_REGULAR_ENEMIES + 6,
      CONFIG.BASE_ENEMIES + Math.floor(this.level * CONFIG.ENEMIES_PER_LEVEL) + extraEnemies
    );
    const initialCount = Math.max(6, Math.round(totalBudget * 0.58));
    const reserveCount = Math.max(3, totalBudget - initialCount);

    const hpScale = 1 + (this.level - 1) * CONFIG.LEVEL_HP_SCALE + totalUpgrades * upgP.HP;
    const dmgScale = 1 + (this.level - 1) * CONFIG.LEVEL_DMG_SCALE + totalUpgrades * upgP.DAMAGE;
    const spdScale = 1 + (this.level - 1) * CONFIG.LEVEL_SPEED_SCALE + totalUpgrades * upgP.SPEED;
    this.pressurePct = Math.round((hpScale - 1) * 100);

    let nextEnemyId = 1;
    const buildRegularEnemy = (specKey, pos, isElite = false) => {
      const cfg = CONFIG.ENEMIES[specKey] || CONFIG.ENEMIES.IMP;
      const eliteHpMult = isElite ? 1.7 : 1;
      const eliteDmgMult = isElite ? 1.3 : 1;
      const eliteSpeedMult = isElite ? 1.08 : 1;
      const overchargeSpd = this.sectorEvent?.type === 'OVERCHARGE' ? 1.22 : 1.0;
      return {
        id: nextEnemyId++,
        x: pos.x,
        y: pos.y,
        kind: specKey,
        elite: isElite,
        movePattern: (specKey === 'IMP' || specKey === 'REVENANT' || specKey === 'RIFLEMAN') ? 'STRAFE'
          : (specKey === 'CACODEMON' ? 'HOVER'
            : (specKey === 'LOST_SOUL' || specKey === 'PINKY' || specKey === 'SPECTRE' ? 'RUSH'
              : (specKey === 'SUMMONER' || specKey === 'SNIPER' ? 'FLEE' : (specKey === 'TURRET' ? 'STATIC' : 'MARCH')))),
        anims: this.animSets[specKey] || this.animSets.IMP,
        health: cfg.hp * hpScale * eliteHpMult,
        maxHealth: cfg.hp * hpScale * eliteHpMult,
        speedMultiplier: cfg.speed * spdScale * eliteSpeedMult,
        damage: Math.round(cfg.meleeDmg * dmgScale * eliteDmgMult),
        projSpeed: (cfg.projSpeed || 0) * (1 + totalUpgrades * 0.015) * overchargeSpd,
        projDamage: Math.round((cfg.projDmg || 0) * dmgScale * eliteDmgMult),
        painChance: Math.max(0.05, cfg.painChance - (isElite ? 0.12 : 0)),
        scale: cfg.scale * (isElite ? 1.16 : 1),
        zOffset: (specKey === 'CACODEMON' || specKey === 'LOST_SOUL') ? -0.14 : 0,
        isBoss: false,
        holdsKey: false,
        holdsArsenal: false,
        invisible: Boolean(cfg.invisible),
        isTurret: Boolean(cfg.turret),
        isHitscan: Boolean(cfg.hitscan),
        isSniper: Boolean(cfg.sniper),
        isMancubus: Boolean(cfg.mancubus),
        isHellKnight: Boolean(cfg.hellKnight),
        isCyberRocket: Boolean(cfg.cyberRocket),
        aimTimer: 0,
        aimDirX: 0,
        aimDirY: 0,
        burstLeft: 0,
        burstCd: 0,
        alive: true,
        state: 'ALIVE',
        alerted: this.sectorEvent?.type !== 'PATROL',
        dormantCloset: false,
        closetKey: null,
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
        reviveCd: specKey === 'SUMMONER' ? 2.4 + this.azarMapa() * 2.2 : 0,
        reviveCount: 0,
        rangedCooldown: cfg.rangedCd[0] + this.azarMapa() * (cfg.rangedCd[1] - cfg.rangedCd[0]),
        dashChance: Math.min(0.85, (cfg.dashChance || 0) + (this.level - 1) * 0.03 + totalUpgrades * 0.015),
        dashCooldown: 1.8 + this.azarMapa() * 2.6,
        dashTime: 0,
        dashDirX: 0,
        dashDirY: 0,
        walkCycle: this.azarMapa() * 10,
        strafeDir: nextEnemyId % 2 === 0 ? 1 : -1,
        growlTimer: 2 + this.azarMapa() * 4,
        cooldown: 0
      };
    };
    this.buildRegularEnemy = buildRegularEnemy;

    const eliteChance =
      CONFIG.ELITE_CHANCE +
      Math.max(0, this.level - CONFIG.ELITE_START_LEVEL) * 0.025 +
      totalUpgrades * upgP.ELITE +
      (isEliteRoute ? 0.16 : 0);

    const sectorPool = this.getSectorEnemyPool(this.level);
    const sigPool = (this.currentTheme?.signature || ['IMP']).filter((k) => sectorPool.includes(k));
    const maxSummoners = this.level >= 6 ? 2 : 1;
    let summonersSpawned = 0;

    for (let i = 0; i < initialCount && spawns.length > 0; i++) {
      let chosenIdx = Math.floor(this.azarMapa() * spawns.length);
      for (let attempt = 0; attempt < 25; attempt++) {
        const testIdx = Math.floor(this.azarMapa() * spawns.length);
        if (!this.enemies.some((e) => distance(e.x, e.y, spawns[testIdx].x, spawns[testIdx].y) < CONFIG.MIN_ENEMY_SPACING)) {
          chosenIdx = testIdx;
          break;
        }
      }
      const pos = spawns.splice(chosenIdx, 1)[0];
      const isElite = (this.level >= CONFIG.ELITE_START_LEVEL || totalUpgrades >= 2 || isEliteRoute) && this.azarMapa() < eliteChance;

      let specKey;
      if (i % 3 === 0 && sigPool.length > 0) {
        specKey = sigPool[Math.floor(this.azarMapa() * sigPool.length)];
      } else {
        specKey = sectorPool[Math.floor(this.azarMapa() * sectorPool.length)] || 'IMP';
      }
      if (specKey === 'SUMMONER') {
        if (summonersSpawned >= maxSummoners) specKey = sigPool[0] || 'IMP';
        else summonersSpawned++;
      }
      if (specKey === 'CYBERDEMON' && this.enemies.some((e) => e.kind === 'CYBERDEMON')) {
        specKey = 'MANCUBUS';
      }

      const allowElite = isElite && !['SUMMONER', 'LOST_SOUL', 'TURRET', 'CYBERDEMON'].includes(specKey);
      this.enemies.push(buildRegularEnemy(specKey, pos, allowElite));

      if (specKey === 'LOST_SOUL') {
        const offsets = [[0.55, 0.2], [-0.5, 0.4]];
        for (const offset of offsets) {
          const px = pos.x + offset[0];
          const py = pos.y + offset[1];
          this.enemies.push(buildRegularEnemy('LOST_SOUL', this.isWall(px, py) ? pos : { x: px, y: py }, false));
        }
      }
    }

    // Monster Closets sellados
    for (const closet of this.monsterClosets) {
      const closetSpecA = sigPool[0] || sectorPool[0] || 'IMP';
      const closetSpecB = sectorPool[Math.floor(this.azarMapa() * sectorPool.length)] || 'PINKY';
      const e1 = buildRegularEnemy(closetSpecA === 'TURRET' ? 'PINKY' : closetSpecA, { x: closet.spawnX - 0.35, y: closet.spawnY }, false);
      const e2 = buildRegularEnemy(closetSpecB === 'TURRET' ? 'RIFLEMAN' : closetSpecB, { x: closet.spawnX + 0.35, y: closet.spawnY }, false);
      for (const ce of [e1, e2]) {
        ce.dormantCloset = true;
        ce.closetKey = closet.doorKey;
        ce.alerted = false;
        this.enemies.push(ce);
      }
    }

    const reserveSpecs = [];
    for (let r = 0; r < reserveCount; r++) {
      const sp = sectorPool[Math.floor(this.azarMapa() * sectorPool.length)] || 'IMP';
      reserveSpecs.push(sp === 'TURRET' ? 'RIFLEMAN' : sp);
    }
    this.director = {
      intensity: 0.2,
      state: 'BUILD',
      nextWaveAt: performance.now() + 9000,
      reservePool: reserveSpecs,
      ambushesTriggered: 0,
      lastCombatAt: performance.now()
    };

    const tier = (this.level - 1) / Math.max(1, MAX_LEVELS - 1);
    const bossUpgradeMult = 1 + totalUpgrades * upgP.BOSS_HP;
    const bossHpMult = (1 + tier * 1.55) * bossUpgradeMult;
    const bossSpdMult = 1 + tier * 0.62 + totalUpgrades * 0.015;
    const bossDmgMult = 1 + tier * 0.75 + totalUpgrades * 0.03;

    this.setupSectorObjective(objectiveType, {
      emptyCells,
      nodes,
      exitDoor,
      bossHpMult,
      bossSpdMult,
      bossDmgMult,
      tier
    });

    this.sectorStats = {
      kills: 0,
      totalKills: this.enemies.length + reserveCount,
      items: 0,
      totalItems: this.chests.length + 1,
      secrets: 0,
      totalSecrets: 2 + (this.activeRouteMod?.id === 'ARCANE' ? 1 : 0)
    };

    this.updateFlowField();
    this.prebakeSectorSprites();

    this.ambientEmbers = Array.from({ length: 18 }, () => ({
      x: this.player.x + (this.azarMapa() - 0.5) * 10,
      y: this.player.y + (this.azarMapa() - 0.5) * 10,
      z: (this.azarMapa() - 0.5) * 0.8,
      vz: -0.15 - this.azarMapa() * 0.25
    }));

    const sectorName = this.currentTheme?.name || CONFIG.SECTOR_NAMES[(this.level - 1) % CONFIG.SECTOR_NAMES.length];
    const objMeta = CONFIG.OBJECTIVE_LABELS[objectiveType] || CONFIG.OBJECTIVE_LABELS.BOSS_KEY;
    const sigTxt = (this.currentTheme?.signature || []).join(' · ');
    this.onStatus(`SECTOR ${this.level}/${MAX_LEVELS}: ${sectorName} // ${objMeta.short} // ${this.sectorEvent?.label || ''}`);
    this.pushLootNotification(
      `SECTOR ${this.level}: ${objMeta.name}`,
      [objMeta.desc, `AMENAZAS EXCLUSIVAS: ${sigTxt}`],
      '#ffbe0b'
    );
  }

  setupSectorObjective(objectiveType, ctx) {
    const { nodes, bossHpMult, bossSpdMult, bossDmgMult, tier } = ctx;
    const objMeta = CONFIG.OBJECTIVE_LABELS[objectiveType] || CONFIG.OBJECTIVE_LABELS.BOSS_KEY;
    this.sectorObjective = {
      type: objectiveType,
      complete: false,
      label: objMeta.short,
      escapeTimer: 0,
      escapeStarted: false
    };

    const makeBossEntity = (id, arena, name, arch, animKey, holdsKey, holdsArsenal, cfgOverride = null) => {
      const bCfg = cfgOverride || (holdsKey ? CONFIG.ENEMIES.BOSS : CONFIG.ENEMIES.CHAMPION);
      const hp = Math.round(bCfg.hp * (cfgOverride ? (1 + this.getTotalUpgradeRanks() * CONFIG.UPGRADE_PRESSURE.BOSS_HP) : bossHpMult));
      return {
        id,
        x: arena.cx,
        y: arena.cy,
        arenaBounds: arena.bounds,
        kind: name,
        bossArchetype: arch,
        bossSpriteKey: animKey,
        movePattern: 'BOSS_ADVANCED',
        anims: this.animSets[animKey] || this.animSets.BOSS_CYBER,
        dormant: true,
        alerted: true,
        wakeFlash: 0,
        health: hp,
        maxHealth: hp,
        speedMultiplier: bCfg.speed * bossSpdMult,
        damage: Math.round(bCfg.meleeDmg * bossDmgMult),
        projSpeed: bCfg.projSpeed + tier * 3.0,
        projDamage: Math.round(bCfg.projDmg * bossDmgMult),
        painChance: Math.max(0.06, bCfg.painChance - tier * 0.14),
        scale: bCfg.scale,
        isBoss: true,
        isFinalIcon: animKey === 'BOSS_ICON',
        phase: 1,
        shieldActive: false,
        holdsKey,
        holdsArsenal,
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
        strafeDir: holdsKey ? -1 : 1,
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
      };
    };

    const chArena = this.championArena || { cx: 10.5, cy: 38.5, bounds: { minX: 5.7, maxX: 14.3, minY: 33.7, maxY: 42.3 } };
    this.enemies.push(makeBossEntity(998, chArena, 'ARCH-CHAMPION', 'GLADIATOR', 'BOSS_CHAMPION', false, true));

    const bArena = this.bossArena || { cx: 38.5, cy: 38.5, bounds: { minX: 32.7, maxX: 44.3, minY: 32.7, maxY: 44.3 } };

    if (objectiveType === 'FINAL_ICON') {
      this.enemies.push(makeBossEntity(999, bArena, 'ICON OF SIN [FINAL]', 'ICON_OF_SIN', 'BOSS_ICON', true, false, CONFIG.ENEMIES.ICON_OF_SIN));
      const b = bArena.bounds;
      const pylonOffsets = [
        { x: b.minX + 1.8, y: b.minY + 1.8 },
        { x: b.maxX - 1.8, y: b.minY + 1.8 },
        { x: b.minX + 1.8, y: b.maxY - 1.8 },
        { x: b.maxX - 1.8, y: b.maxY - 1.8 }
      ];
      this.arenaPylons = pylonOffsets.map((p, idx) => ({
        id: idx + 1,
        x: p.x,
        y: p.y,
        hp: 7,
        maxHp: 7,
        active: false,
        destroyed: false
      }));
      return;
    }

    if (objectiveType === 'BOSS_KEY') {
      const bossSpecs = [
        { name: 'INFERNAL PYROMANCER [KEY]', arch: 'PYROMANCER', anim: 'BOSS_PYRO' },
        { name: 'NECRO-ARCHON [KEY]', arch: 'SUMMONER_LORD', anim: 'BOSS_NECRO' },
        { name: 'CYBER-TYRANT [KEY]', arch: 'CYBER_ARTILLERY', anim: 'BOSS_CYBER' },
        { name: 'VOID STALKER [KEY]', arch: 'VOID_STALKER', anim: 'BOSS_VOID' },
        { name: 'MAGMA COLOSSUS [KEY]', arch: 'PYROMANCER', anim: 'BOSS_PYRO' },
        { name: 'SOUL HARVESTER [KEY]', arch: 'SUMMONER_LORD', anim: 'BOSS_NECRO' },
        { name: 'MECHA-BEHEMOTH [KEY]', arch: 'CYBER_ARTILLERY', anim: 'BOSS_CYBER' },
        { name: 'ABYSS PHANTOM [KEY]', arch: 'VOID_STALKER', anim: 'BOSS_VOID' },
        { name: 'HELLFIRE MONARCH [KEY]', arch: 'PYROMANCER', anim: 'BOSS_PYRO' }
      ];
      const spec = bossSpecs[(this.level - 1) % bossSpecs.length];
      this.enemies.push(makeBossEntity(999, bArena, spec.name, spec.arch, spec.anim, true, false));
      return;
    }

    if (objectiveType === 'GENERATORS') {
      const genSpots = [nodes[2], nodes[4], nodes[5]];
      if (this.level >= 5 && nodes[7]) genSpots.push(nodes[7]);
      this.generators = genSpots.map((n, idx) => ({
        id: idx + 1,
        x: n.cx + 0.5,
        y: n.cy + 0.5,
        hp: 10 + this.level * 1.4,
        maxHp: 10 + this.level * 1.4,
        alive: true,
        hitFlash: 0
      }));
      this.keyItem.active = false;
      return;
    }

    if (objectiveType === 'SURVIVAL_WAVES') {
      const hub = nodes[4] || { cx: 24, cy: 24 };
      this.survivalState = {
        cx: hub.cx + 0.5,
        cy: hub.cy + 0.5,
        started: false,
        wave: 0,
        maxWaves: 3,
        waveTimer: 0,
        completed: false
      };
      this.keyItem.active = false;
      return;
    }

    if (objectiveType === 'ESCORT_RESCUE') {
      const vipNode = nodes[2] || { cx: 38, cy: 10 };
      this.vip = {
        x: vipNode.cx + 0.5,
        y: vipNode.cy + 0.5,
        hp: 85,
        maxHp: 85,
        rescued: false,
        alive: true,
        walkCycle: 0,
        hitFlash: 0
      };
      this.keyItem.active = false;
      return;
    }

    if (objectiveType === 'ESCAPE_COUNTDOWN') {
      this.escapeCore = {
        x: bArena.cx,
        y: bArena.cy,
        triggered: false,
        hp: 8
      };
      this.sectorObjective.escapeTimer = 68;
      this.keyItem.active = false;
      return;
    }

    if (objectiveType === 'THREE_KEYS') {
      const spots = [nodes[2], nodes[5], { cx: Math.floor(bArena.cx), cy: Math.floor(bArena.cy) }];
      const colors = ['RED', 'BLUE', 'YELLOW'];
      this.coloredKeys = colors.map((col, idx) => ({
        color: col,
        x: spots[idx].cx + 0.5,
        y: spots[idx].cy + 0.5,
        active: true
      }));
      this.keyItem.active = false;
    }
  }

  start({ showBriefing = false, character = null, seed = null } = {}) {
    if (this.frameId) cancelAnimationFrame(this.frameId);
    if (character) this.setCharacter(character);
    // Desafío diario: con semilla, el plan de sectores y los mapas salen iguales para todos.
    this.seed = Number.isInteger(seed) ? seed >>> 0 : null;
    const snap = this.captureCurrentScreen();
    this.reset();
    this.running = true;
    this.paused = false;
    this.briefingOpen = Boolean(showBriefing);
    this.lastTime = performance.now();
    globalDoomMusic.startMatch();
    this.audio.startAmbience();
    if (!this.briefingOpen) {
      this.startScreenMelt('SECTOR', snap);
    } else {
      this.onStatus(`${this.characterProfile.name} listo // Pulsa [ESPACIO], [ENTER] o haz clic para desplegarte`);
    }
    this.enterFullscreenOnStart();
    this.frameId = requestAnimationFrame(this.boundLoop);
  }

  dismissBriefing() {
    if (!this.briefingOpen) return;
    this.downloadBriefingSnap = this.captureCurrentScreen();
    this.briefingOpen = false;
    this.keys.clear();
    this.mouseDown = false;
    this.lastTime = performance.now();
    this.startTime = this.lastTime;
    this.levelStartTime = this.lastTime;
    this.audio.playShotgun();
    this.startScreenMelt('SECTOR', this.downloadBriefingSnap);
    this.safeRequestPointerLock();
    const sectorName = this.currentTheme?.name || CONFIG.SECTOR_NAMES[(this.level - 1) % CONFIG.SECTOR_NAMES.length];
    this.onStatus(`SECTOR ${this.level}/${MAX_LEVELS}: ${sectorName} // ¡COMBATE ACTIVO!`);
  }

  enterFullscreenOnStart() {
    const target = this.canvas.parentElement || this.canvas;
    const reqTarget = target.requestFullscreen ? target : this.canvas;
    if (!document.fullscreenElement && reqTarget.requestFullscreen) {
      reqTarget.requestFullscreen()
        .then(() => {
          this.updateFullscreenLayout();
          if (this.running && !this.paused && !this.briefingOpen && !this.intermission && !this.deathSequence && !this.victorySequence) {
            this.safeRequestPointerLock();
          }
        })
        .catch(() => {
          if (this.running && !this.paused && !this.briefingOpen && !this.intermission) {
            this.safeRequestPointerLock();
          }
        });
    } else if (this.running && !this.paused && !this.briefingOpen && !this.intermission) {
      this.safeRequestPointerLock();
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
    this.keys.clear();
    this.audio.stopAmbience();
    globalDoomMusic.stopMatch();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.safeExitPointerLock();
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
    this.keys.clear();
    this.audio.stopAmbience();
    globalDoomMusic.stopMatch();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('contextmenu', this.onContextMenu);
    window.removeEventListener('mouseup', this.onMouseUp);
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('pointerlockchange', this.onPointerLockChange);
    if (this.updateFullscreenLayout) {
      document.removeEventListener('fullscreenchange', this.updateFullscreenLayout);
      window.removeEventListener('resize', this.updateFullscreenLayout);
    }
    this.safeExitPointerLock();
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
      this.keys.clear();
      this.wasPointerLocked = false;
      this.safeExitPointerLock();
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
      if (['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7'].includes(e.code)) {
        this.buyMerchantItem(Number(e.code.slice(-1)));
        return;
      }
      if (e.code === 'Space') e.preventDefault();
      return;
    }

    if (this.intermission) {
      const im = this.intermission;
      if (im.stage === 'ROUTE') {
        if (['Digit1', 'Digit2', 'Digit3'].includes(e.code)) {
          this.selectRouteChoice(Number(e.code.slice(-1)) - 1);
          return;
        }
        if ((e.code === 'Space' || e.code === 'Enter') && im.routeChoices?.length === 1) {
          e.preventDefault();
          this.selectRouteChoice(0);
          return;
        }
        return;
      }
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
        if (im.upgradeChoices?.length > 0 && !im.upgradeSelected) {
          this.audio.playEmptyClip();
          this.onStatus(`ALTAR DE MEJORA: elige [1]${im.upgradeChoices.length >= 3 ? ', [2] o [3]' : ' o [2]'} antes de continuar`);
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
      if (this.paused) {
        if (performance.now() - (this._lastPointerUnlockAt || 0) > 150) {
          this.resume();
        }
      } else {
        this.pause();
      }
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
          this.safeRequestPointerLock();
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
      if (e.code === 'Digit5') this.selectWeapon(5);
      if (e.code === 'Digit6') this.selectWeapon(6);
      if (e.code === 'Digit7') this.selectWeapon(7);
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
    if (this.running && !this.paused && !this.intermission && !this.shopOpen && !this.mapOpen && !this.deathSequence && !this.victorySequence && document.pointerLockElement === this.canvas) {
      const mx = clamp(Number(e.movementX) || 0, -240, 240);
      this.player.angle += mx * 0.0023 * (this.mouseSens || 1.0);
    }
  }

  handlePointerLockChange() {
    const locked = document.pointerLockElement === this.canvas;
    if (!locked && this.wasPointerLocked) {
      this._lastPointerUnlockAt = performance.now();
    }
    if (
      this.wasPointerLocked &&
      !locked &&
      this.running &&
      !this.finished &&
      !this.paused &&
      !this.briefingOpen &&
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
    this.keys.clear();
    this.mapOpen = false;
    this.audio.setAmbiencePaused(true);
    globalDoomMusic.setPaused(true);
    this.onStatus('Pausado (ESC/Enter: Seguir | F: Pantalla Completa / Minimizar | Q: Salir)');
    this.safeExitPointerLock();
    this.drawPauseScreen();
  }

  resume() {
    if (!this.running || this.finished) return;
    this.paused = false;
    this.audio.setAmbiencePaused(false);
    globalDoomMusic.setPaused(false);
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

  triggerEscapeCountdown(now = performance.now()) {
    if (!this.escapeCore || this.escapeCore.triggered) return;
    this.escapeCore.triggered = true;
    this.sectorObjective.escapeStarted = true;
    this.sectorObjective.escapeTimer = 65.0;
    this.player.hasKey = true;
    this.audio.playAlarm();
    this.screenShake = Math.max(this.screenShake, 0.5);
    this.pushLootNotification('☢️ ¡NÚCLEO EN FUSIÓN! (65s)', ['EXIT DESBLOQUEADO · CORRE HACIA LA SALIDA'], '#ff003c');
    this.onStatus('☢️ ¡CUENTA ATRÁS INICIADA! Escapa por EXIT antes de que detone el sector');
    this.spawnTeleportWave(this.player.x, this.player.y, 3, null, 'INTERCEPTORES EN CAMINO');
  }

  startNextSurvivalWave(now = performance.now()) {
    const sv = this.survivalState;
    if (!sv || sv.completed) return;
    sv.started = true;
    sv.wave++;
    sv.waveTimer = 18.0 + sv.wave * 3;
    const count = 3 + sv.wave;
    this.audio.playAlarm();
    this.spawnTeleportWave(sv.cx, sv.cy, count, null, `OLEADA ${sv.wave}/${sv.maxWaves}`);
    this.onStatus(`⚔️ OLEADA ${sv.wave}/${sv.maxWaves} INICIADA · ¡RESISTE!`);
    // Suministro de emergencia entre oleadas
    if (sv.wave > 1) {
      this.ammoPacks.push({ x: sv.cx + 0.6, y: sv.cy, amount: 8, fuelAmount: 16, rocketAmount: 2, cellAmount: 15, active: true });
      this.medkits.push({ x: sv.cx - 0.6, y: sv.cy, active: true });
    }
  }

  interact() {
    if (!this.player) return;

    const gloryTarget = this.findGloryTarget();
    if (gloryTarget) {
      this.executeGloryKill(gloryTarget, false);
      return;
    }

    if (this.vip && this.vip.alive && !this.vip.rescued && distance(this.player.x, this.player.y, this.vip.x, this.vip.y) < 2.5) {
      this.vip.rescued = true;
      this.audio.playKeyPickup();
      this.pushLootNotification('🧬 ¡CIENTÍFICO RESCATADO!', ['ESCOLTALO VIVO HASTA LA PUERTA EXIT'], '#00f5d4');
      this.onStatus('🧬 VIP rescatado: ¡guíalo hasta la compuerta EXIT!');
      this.spawnTeleportWave(this.vip.x, this.vip.y, 2, null, 'EMBOSCADA AL RESCATE');
      return;
    }

    if (this.escapeCore && !this.escapeCore.triggered && distance(this.player.x, this.player.y, this.escapeCore.x, this.escapeCore.y) < 2.6) {
      this.triggerEscapeCountdown();
      return;
    }

    if (this.survivalState && !this.survivalState.started && distance(this.player.x, this.player.y, this.survivalState.cx, this.survivalState.cy) < 2.8) {
      this.startNextSurvivalWave();
      return;
    }

    if (this.merchant && distance(this.player.x, this.player.y, this.merchant.x, this.merchant.y) < 2.4) {
      this.openShop();
      return;
    }

    for (const door of this.doors.values()) {
      if (distance(this.player.x, this.player.y, door.x + 0.5, door.y + 0.5) < 2.8 && door.target === 0) {
        door.target = 1;
        if (door.isCloset) {
          const cl = this.monsterClosets.find((c) => c.doorKey === `${door.x},${door.y}`);
          if (cl) this.openMonsterCloset(cl, 'MURO TRAMPA DESCUBIERTO');
        } else if (door.isSecret && !door.discovered) {
          door.discovered = true;
          this.sectorStats.secrets++;
          this.runStats.secretsFound = (this.runStats.secretsFound || 0) + 1;
          this.audio.playSecretFound();
          this.pushLootNotification('¡CÁMARA SECRETA DESCUBIERTA!', ['MURO OCULTO DESLIZADO'], '#00f5d4');
          this.onStatus('🔥 ¡SECRETO DESCUBIERTO! Muro oculto deslizado');
        } else if (door.isBossGate) {
          this.audio.playDoorSlide();
          this.onStatus('👁️ COMPUERTA DE ARENA ABIERTA: El Boss aguarda en el centro. Entra para combatir');
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

  activateIconPylons(count = 2) {
    if (!this.arenaPylons || this.arenaPylons.length === 0) return false;
    const avail = this.arenaPylons.filter((p) => !p.destroyed && !p.active);
    if (avail.length === 0) return false;
    for (let i = 0; i < Math.min(count, avail.length); i++) {
      avail[i].active = true;
      avail[i].hp = avail[i].maxHp;
      this.spawnWallSparks(avail[i].x, avail[i].y, 14, '#00f5d4');
    }
    return true;
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
      sub: enemy.isFinalIcon ? '¡FASE 1: EL TITÁN DEL ABISMO DESPIERTA!' : (enemy.holdsKey ? '¡GUARDIÁN DE LA LLAVE ACTIVADO!' : '¡SEÑOR DE LA ARENA DESPIERTA!'),
      until: now + 2400
    };
    this.pushLootNotification(
      `👁️ ¡${enemy.kind} DESPIERTA!`,
      [enemy.isFinalIcon ? 'DESTRUYE LOS PILONES SI ACTIVA SU ESCUDO' : 'HAS ENTRADO EN LA ARENA · EL BOSS PASA AL ATAQUE'],
      '#d90429'
    );
    this.onStatus(`⚠️ ¡${enemy.kind} SE HA ACTIVADO Y TE ATACA!`);
  }

  applyKnockback(enemy, dirX, dirY, force, stunSec = 0.45) {
    if (!enemy || !enemy.alive || enemy.isTurret) return;
    const len = Math.hypot(dirX, dirY) || 1;
    const nx = dirX / len;
    const ny = dirY / len;
    const mult = enemy.isBoss ? 0.34 : (enemy.kind === 'SHIELD' || enemy.kind === 'MANCUBUS' || enemy.kind === 'CYBERDEMON' ? 0.58 : 1.0);
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
      if (!enemy.alive || enemy.dormantCloset) continue;
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
        const effDmg = enemy.shieldActive ? baseDmg * dmgMult * 0.25 : baseDmg * dmgMult;
        enemy.health -= effDmg;
        enemy.hitFlash = 0.22;
        enemy.shieldFlash = 0;
        this.applyKnockback(enemy, Math.cos(ang), Math.sin(ang), force, empowered ? 0.9 : 0.45);
        this.spawnBlood(enemy.x, enemy.y, empowered ? 18 : 10, enemy.isTurret ? '#ffbe0b' : null);
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
      if (!enemy.alive || enemy.dormantCloset) continue;
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
    const rocketAdd = this.level >= 2 || this.isWeaponOwned(5) ? randInt(2, 3) : 0;
    const cellAdd = this.level >= 3 || this.isWeaponOwned(6) || this.isWeaponOwned(7) ? randInt(15, 25) : 0;

    this.player.reserve = Math.min(this.getMaxReserve(), this.player.reserve + ammoAdd);
    this.player.fuel = Math.min(MAX_FUEL, this.player.fuel + fuelAdd);
    this.player.coins = (this.player.coins || 0) + coinAdd;
    if (rocketAdd > 0) this.player.rockets = Math.min(MAX_ROCKETS, (this.player.rockets || 0) + rocketAdd);
    if (cellAdd > 0) this.player.cells = Math.min(MAX_CELLS, (this.player.cells || 0) + cellAdd);
    gainedItems.push(`+${ammoAdd} CART · +${fuelAdd}% GAS · +${coinAdd} MONEDAS${rocketAdd ? ` · +${rocketAdd} COH` : ''}${cellAdd ? ` · +${cellAdd} CEL` : ''}`);

    if (Math.random() < CONFIG.CHEST_HEALTH_CHANCE) {
      this.player.health = Math.min(100, this.player.health + CONFIG.CHEST_HEALTH_AMOUNT);
      gainedItems.push(`+${CONFIG.CHEST_HEALTH_AMOUNT}% SALUD DE EMERGENCIA`);
    }
    if (Math.random() < CONFIG.CHEST_ARMOR_CHANCE) {
      this.player.armor = Math.min(100, (this.player.armor || 0) + CONFIG.CHEST_ARMOR_AMOUNT);
      gainedItems.push(`+${CONFIG.CHEST_ARMOR_AMOUNT}% PLACA DE BLINDAJE`);
    }

    this.pushLootNotification('📦 ¡COFRE UAC ABIERTO!', gainedItems, '#ffbe0b');
    this.spawnBlood(chest.x, chest.y, 12, '#ffbe0b', false);
    this.onStatus(`¡COFRE UAC! ${gainedItems.join(' · ')}`);

    // Emboscada al abrir cofres trampa o activar un Monster Closet cercano
    if (chest.trapped) {
      const closedCloset = this.monsterClosets.find((c) => !c.opened);
      if (closedCloset) {
        this.openMonsterCloset(closedCloset, 'TRAMPA DE COFRE');
      } else {
        this.spawnTeleportWave(chest.x, chest.y, 2, null, 'EMBOSCADA DE SUMINISTROS');
      }
    }
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
      },
      {
        ...m.ROCKETS,
        canBuy: () => (this.player.rockets || 0) < MAX_ROCKETS,
        apply: () => { this.player.rockets = Math.min(MAX_ROCKETS, (this.player.rockets || 0) + m.ROCKETS.amount); }
      },
      {
        ...m.CELLS,
        canBuy: () => (this.player.cells || 0) < MAX_CELLS,
        apply: () => { this.player.cells = Math.min(MAX_CELLS, (this.player.cells || 0) + m.CELLS.amount); }
      }
    ];
  }

  openShop() {
    if (this.shopOpen) return;
    this.shopOpen = true;
    this.mouseDown = false;
    this.keys.clear();
    this.wasPointerLocked = false;
    this.safeExitPointerLock();
    this.shopNotice = 'ELIGE CON [1]-[7] O CLIC · [E] O [ESC] PARA SALIR';
    this.audio.playChestOpen();
    this.onStatus('MERCADER DE ALMAS: compra munición, cohetes, celdas o mejoras [1]-[7]');
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
    if (this.director) this.director.intensity = Math.min(1, this.director.intensity + 0.12);

    if (sourceX !== null && sourceY !== null) {
      const angleToSource = Math.atan2(sourceY - this.player.y, sourceX - this.player.x);
      const rel = Math.atan2(Math.sin(angleToSource - this.player.angle), Math.cos(angleToSource - this.player.angle));
      this.damageAngle = rel;
      this.damageDir = rel < -0.35 ? -1 : (rel > 0.35 ? 1 : 0);
    } else {
      this.damageAngle = 0;
      this.damageDir = 0;
    }
    this.audio.playHurt(this.characterProfile?.hurtPitch || 1.0);

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
    if (!Number.isFinite(x) || !Number.isFinite(y) || !this.map || this.map.length === 0) return true;
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
    if (!Number.isFinite(dx) || !Number.isFinite(dy) || !this.player) return;
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
    if (!enemy || !Number.isFinite(dx) || !Number.isFinite(dy)) return { movedX: false, movedY: false, hitWall: false };
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
    const extras = [`+${gainedShells} CARTUCHOS`, `+${fuel}% GASOLINA`];
    if (this.isWeaponOwned(5) && this.player.rockets < this.getMaxRockets()) {
      const rGain = Math.min(this.getMaxRockets() - this.player.rockets, 1);
      this.player.rockets += rGain;
      if (rGain > 0) extras.push(`+${rGain} COHETE`);
    }
    if ((this.isWeaponOwned(6) || this.isWeaponOwned(7)) && this.player.cells < this.getMaxCells()) {
      const cBefore = this.player.cells;
      this.player.cells = Math.min(this.getMaxCells(), this.player.cells + 14);
      const cGain = this.player.cells - cBefore;
      if (cGain > 0) extras.push(`+${cGain} CÉLULAS`);
    }
    this.pushLootNotification(
      '🪚 MOTOSIERRA: COSECHA DE MUNICIÓN',
      [extras.join(' · '), 'EL DEMONIO HA SIDO DESMEMBRADO'],
      '#ff4d00'
    );
    this.onStatus(`🪚 MOTOSIERRA: ${extras.join(' / ')} extraídos del cadáver`);
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
    enemy.shieldActive = false;
    enemy.aimTimer = 0;
    this.lastKillSource = source;

    // Hit-stop al matar de cerca y cámara lenta al abatir a un Jefe
    if (enemy.isBoss) {
      this.slowMoUntil = now + (enemy.isFinalIcon ? 1400 : 900);
    } else if (['PUNCH', 'GLORY', 'CHAINSAW', 'DASH'].includes(source)) {
      this.hitStopUntil = now + 38;
    }

    // Evita farmear bajas duplicadas cuando un Invocador revive un cadáver
    if (byPlayer && !enemy.wasRevived) {
      this.player.kills += enemy.isFinalIcon ? 10 : (enemy.isBoss ? 5 : 1);
      this.sectorStats.kills++;
      if (source === 'CHAINSAW') this.runStats.chainsawKills = (this.runStats.chainsawKills || 0) + 1;
      if (source === 'FLAME' || source === 'BURN') this.runStats.flamerKills = (this.runStats.flamerKills || 0) + 1;
      if (source === 'GLORY') this.runStats.gloryKills = (this.runStats.gloryKills || 0) + 1;
      if (source === 'PUNCH' || source === 'KINETIC' || source === 'DASH') {
        this.runStats.meleeKills = (this.runStats.meleeKills || 0) + 1;
      }
      if (source === 'EXPLOSION' || source === 'ROCKET') {
        this.runStats.explosionKills = (this.runStats.explosionKills || 0) + 1;
      }
      if (source === 'PLASMA' || source === 'BFG') {
        this.runStats.energyKills = (this.runStats.energyKills || 0) + 1;
      }
      if (enemy.isBoss) this.runStats.bossKills = (this.runStats.bossKills || 0) + 1;

      if (!this.chainsawAnnounced && this.player.kills >= CONFIG.CHAINSAW_UNLOCK_KILLS) {
        this.chainsawAnnounced = true;
        this.unlockWeapon(4, true);
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
    this.spawnBlood(enemy.x, enemy.y, enemy.isBoss ? 36 : 18);

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

    const coinMult =
      this.activeRouteMod?.id === 'MERCHANT' ||
      this.activeRouteMod?.id === 'ELITE' ||
      this.sectorEvent?.type === 'OVERCHARGE'
        ? 1.5
        : 1.0;

    if (enemy.isBoss) {
      const baseCoins = randInt(CONFIG.BOSS_COIN_RANGE[0], CONFIG.BOSS_COIN_RANGE[1]);
      this.coins.push({
        x: enemy.x,
        y: enemy.y,
        amount: Math.round(baseCoins * coinMult * (enemy.isFinalIcon ? 2.5 : 1)),
        active: true
      });
    } else if (!enemy.wasRevived && Math.random() < (enemy.elite ? 1 : CONFIG.ENEMY_COIN_CHANCE + this.level * 0.01)) {
      const amt = randInt(CONFIG.ENEMY_COIN_RANGE[0], CONFIG.ENEMY_COIN_RANGE[1]);
      this.coins.push({
        x: enemy.x + (Math.random() - 0.5) * 0.4,
        y: enemy.y + (Math.random() - 0.5) * 0.4,
        amount: Math.max(1, Math.round(amt * coinMult)),
        active: true
      });
    }

    if (enemy.isFinalIcon) {
      for (const pylon of this.arenaPylons) {
        if (!pylon.destroyed) {
          pylon.destroyed = true;
          pylon.active = false;
          this.spawnWallSparks(pylon.x, pylon.y, 16, '#9d4edd');
          this.shockwaves.push({ x: pylon.x, y: pylon.y, radius: 0.4, maxRadius: 2.8, life: 0.45, maxLife: 0.45, color: '#00f5d4' });
        }
      }
      this.shockwaves.push({ x: enemy.x, y: enemy.y, radius: 0.5, maxRadius: 6.5, life: 0.85, maxLife: 0.85, color: '#ffbe0b' });
      this.audio.playExplosion();
    }

    if (enemy.holdsKey) {
      if (this.sectorObjective?.type === 'THREE_KEYS') {
        const missingKey = this.coloredKeys.find((k) => k.active);
        if (missingKey) {
          missingKey.x = enemy.x;
          missingKey.y = enemy.y;
        } else {
          this.player.hasKey = true;
        }
        this.audio.playKeyPickup();
        this.pushLootNotification('💀 ¡GUARDIÁN ABATIDO!', ['🔑 LLAVE DE ACCESO ASEGURADA'], '#ffbe0b');
        this.onStatus('🔑 ¡GUARDIÁN ABATIDO! Recoge las LLAVES DE COLORES y ve a EXIT');
      } else {
        this.keyItem = { x: enemy.x, y: enemy.y, active: true };
        this.audio.playKeyPickup();
        this.pushLootNotification(
          enemy.isFinalIcon ? '👑 ¡ICON OF SIN EXTERMINADO!' : '💀 ¡BOSS GUARDIÁN DERROTADO!',
          ['🔑 HA SOLTADO LA LLAVE CALAVERA DORADA'],
          '#ffbe0b'
        );
        this.onStatus('🔑 ¡BOSS ABATIDO! Recoge la LLAVE CALAVERA Dorada que ha dejado caer');
      }
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
    enemy.specialCd = enemy.enraged ? 4.8 : 6.8;

    if (arch === 'ICON_OF_SIN') {
      const phase = enemy.phase || 1;
      const orbSprite = this.orbSprites.BOSS_ICON || this.orbSprites.BOSS;
      if (phase === 1) {
        // Fase 1: Onda en espiral + invocación de almas errantes
        const count = 6;
        for (let i = 0; i < count; i++) {
          const ang = Math.atan2(toY, toX) + (i - (count - 1) / 2) * 0.22;
          const spd = 6.2;
          this.enemyProjectiles.push({
            ownerId: enemy.id,
            ownerKind: enemy.kind,
            ownerRef: enemy,
            x: enemy.x + Math.cos(ang) * 0.55,
            y: enemy.y + Math.sin(ang) * 0.55,
            vx: Math.cos(ang) * spd,
            vy: Math.sin(ang) * spd,
            life: 3.1,
            damage: enemy.projDamage || 13,
            sprite: orbSprite
          });
        }
        if (this.buildRegularEnemy && this.enemies.filter((e) => e.alive && !e.isBoss).length < 5) {
          for (const ox of [-1.4, 1.4]) {
            if (this.canEnemyMoveTo(enemy.x + ox, enemy.y, 0.28)) {
              const minion = this.buildRegularEnemy('LOST_SOUL', { x: enemy.x + ox, y: enemy.y }, false);
              minion.wasRevived = true;
              minion.alerted = true;
              this.enemies.push(minion);
            }
          }
          this.audio.playSummon();
        }
        this.onStatus('👹 ¡ICON OF SIN FASE I: OLEADA DE FUEGO Y ALMAS ERRANTES!');
      } else if (phase === 2) {
        // Fase 2: Lluvia de meteoros + cohetes del abismo + Caballero del Infierno
        for (let m = 0; m < 3; m++) {
          const ang = Math.random() * Math.PI * 2;
          const d = 1.2 + Math.random() * 4.2;
          const mx = this.player.x + Math.cos(ang) * d;
          const my = this.player.y + Math.sin(ang) * d;
          if (!this.isWall(mx, my)) {
            this.meteorStrikes.push({ x: mx, y: my, radius: 2.3, timer: 1.15 + m * 0.25, maxTimer: 1.4 });
          }
        }
        const baseA = Math.atan2(toY, toX);
        for (const off of [-0.22, 0.22]) {
          const a = baseA + off;
          this.enemyProjectiles.push({
            ownerId: enemy.id,
            ownerKind: enemy.kind,
            ownerRef: enemy,
            x: enemy.x + Math.cos(a) * 0.55,
            y: enemy.y + Math.sin(a) * 0.55,
            vx: Math.cos(a) * 6.8,
            vy: Math.sin(a) * 6.8,
            explosive: true,
            explodeRadius: 2.1,
            life: 2.9,
            damage: 14,
            sprite: this.orbSprites.CYBERDEMON || this.orbSprites.BOSS_CYBER || orbSprite
          });
        }
        if (this.buildRegularEnemy && this.enemies.filter((e) => e.alive && !e.isBoss).length < 4) {
          if (this.canEnemyMoveTo(enemy.x, enemy.y + 1.5, 0.3)) {
            const knight = this.buildRegularEnemy('HELL_KNIGHT', { x: enemy.x, y: enemy.y + 1.5 }, false);
            knight.wasRevived = true;
            knight.alerted = true;
            this.enemies.push(knight);
            this.spawnWallSparks(knight.x, knight.y, 12, '#70e000');
          }
        }
        this.audio.playDemonFireball(dist);
        this.onStatus('☄️ ¡ICON OF SIN FASE II: LLUVIA DE METEOROS Y COHETES ABISALES!');
      } else {
        // Fase 3: Espiral apocalíptica + grietas de lava + teletransporte táctico
        enemy.specialCd = 4.2;
        for (let i = 0; i < 10; i++) {
          const ang = (i / 10) * Math.PI * 2 + (now * 0.002);
          this.enemyProjectiles.push({
            ownerId: enemy.id,
            ownerKind: enemy.kind,
            ownerRef: enemy,
            x: enemy.x + Math.cos(ang) * 0.55,
            y: enemy.y + Math.sin(ang) * 0.55,
            vx: Math.cos(ang) * 6.4,
            vy: Math.sin(ang) * 6.4,
            life: 2.7,
            damage: enemy.projDamage || 14,
            sprite: orbSprite
          });
        }
        if (!this.isWall(this.player.x, this.player.y) && this.hazards.length < 18) {
          this.hazards.push({ x: this.player.x, y: this.player.y, radius: 1.5, kind: 'LAVA', tempUntil: now + 9000 });
        }
        this.shockwaves.push({ x: enemy.x, y: enemy.y, radius: 0.4, maxRadius: 4.5, life: 0.45, maxLife: 0.45, color: '#ff0055' });
        this.audio.playExplosion();
        this.onStatus('💀 ¡ICON OF SIN FASE III: APOCALIPSIS INFERNAL!');
      }
      return;
    }

    if (arch === 'SUMMONER_LORD') {
      if (this.buildRegularEnemy) {
        const offsets = [[1.2, 0], [-1.2, 0]];
        let spawned = 0;
        for (const [ox, oy] of offsets) {
          const sx = enemy.x + ox;
          const sy = enemy.y + oy;
          if (this.canEnemyMoveTo(sx, sy, 0.28)) {
            const minionKind = spawned === 0 ? (this.level >= 5 ? 'SPECTRE' : 'IMP') : 'LOST_SOUL';
            const minion = this.buildRegularEnemy(minionKind, { x: sx, y: sy }, false);
            minion.wasRevived = true;
            minion.alerted = true;
            this.enemies.push(minion);
            this.spawnWallSparks(sx, sy, 10, '#70e000');
            spawned++;
          }
        }
        const corpse = this.findRevivableCorpse(enemy);
        if (corpse) this.reviveCorpse(corpse, enemy);
        if (spawned > 0) {
          this.audio.playSummon();
          this.onStatus(`☠️ ¡${enemy.kind} INVOCA ESBIRROS Y ALZA MUERTOS!`);
        }
      }
    } else if (arch === 'CYBER_ARTILLERY') {
      const baseAngle = Math.atan2(toY, toX);
      for (const offset of [-0.16, 0, 0.16]) {
        const ang = baseAngle + offset;
        this.enemyProjectiles.push({
          ownerId: enemy.id,
          ownerKind: enemy.kind,
          ownerRef: enemy,
          x: enemy.x + Math.cos(ang) * 0.5,
          y: enemy.y + Math.sin(ang) * 0.5,
          vx: Math.cos(ang) * 6.4,
          vy: Math.sin(ang) * 6.4,
          speed: 6.4,
          explosive: true,
          explodeRadius: 1.9,
          life: 3.0,
          damage: enemy.projDamage || 13,
          sprite: this.orbSprites.CYBERDEMON || this.orbSprites.BOSS_CYBER || this.orbSprites.BOSS
        });
      }
      this.audio.playRocketLauncher();
      this.onStatus(`🚀 ¡${enemy.kind} DESCARGA ANDANADA DE COHETES EXPLOSIVOS!`);
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
            this.audio.playTeleport();
            for (let k = 0; k < 4; k++) {
              const va = (k / 4) * Math.PI * 2 + Math.PI / 4;
              this.enemyProjectiles.push({
                ownerId: enemy.id,
                ownerKind: enemy.kind,
                ownerRef: enemy,
                x: tx + Math.cos(va) * 0.45,
                y: ty + Math.sin(va) * 0.45,
                vx: Math.cos(va) * 5.8,
                vy: Math.sin(va) * 5.8,
                life: 2.4,
                damage: enemy.projDamage || 10,
                sprite: this.orbSprites.BOSS_VOID || this.orbSprites.BOSS
              });
            }
            this.onStatus(`🌀 ¡${enemy.kind} SE TELETRANSPORTA CON DESCARGA DEL VACÍO!`);
            break;
          }
        }
      }
    } else if (arch === 'GLADIATOR') {
      // Campeón: onda expansiva de acero + ráfaga triple + carga inmediata
      this.shockwaves.push({ x: enemy.x, y: enemy.y, radius: 0.4, maxRadius: 3.4, life: 0.4, maxLife: 0.4, color: '#ffbe0b' });
      const baseA = Math.atan2(toY, toX);
      for (const off of [-0.2, 0, 0.2]) {
        const a = baseA + off;
        this.enemyProjectiles.push({
          ownerId: enemy.id,
          ownerKind: enemy.kind,
          ownerRef: enemy,
          x: enemy.x + Math.cos(a) * 0.45,
          y: enemy.y + Math.sin(a) * 0.45,
          vx: Math.cos(a) * 6.8,
          vy: Math.sin(a) * 6.8,
          life: 2.3,
          damage: enemy.projDamage || 10,
          sprite: this.orbSprites.BOSS_CHAMPION || this.orbSprites.BOSS
        });
      }
      this.audio.playBossDash(dist);
      this.onStatus(`⚔️ ¡${enemy.kind} EJECUTA ARREMETIDA DE GLADIADOR!`);
    } else {
      // PYROMANCER: Anillo de 8 orbes de fuego + grieta de lava bajo el jugador
      for (let i = 0; i < 8; i++) {
        const ang = (i / 8) * Math.PI * 2 + (now * 0.001);
        const spd = (enemy.projSpeed || 6.2) * 0.84;
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
          sprite: this.orbSprites.BOSS_PYRO || this.orbSprites.IMP
        });
      }
      if (!this.isWall(this.player.x, this.player.y) && this.hazards.length < 18) {
        this.hazards.push({ x: this.player.x, y: this.player.y, radius: 1.35, kind: 'LAVA', tempUntil: now + 8000 });
      }
      this.shockwaves.push({ x: enemy.x, y: enemy.y, radius: 0.4, maxRadius: 3.4, life: 0.45, maxLife: 0.45, color: '#ff4d00' });
      this.audio.playDemonFireball(dist);
      this.onStatus(`🔥 ¡${enemy.kind} DESATA UNA NOVA DE FUEGO Y GRIETA DE LAVA!`);
    }
  }

  // Disparo del Boss escalado por sector y arquetipo único
  fireBossSpreadBarrage(enemy, toPlayerX, toPlayerY, dist) {
    const baseAngle = Math.atan2(toPlayerY, toPlayerX);
    const pSpeed = enemy.projSpeed || 6.5;
    let spreadAngles;

    if (enemy.isFinalIcon && (enemy.phase || 1) >= 2) {
      spreadAngles = enemy.phase >= 3 ? [-0.36, -0.18, 0, 0.18, 0.36] : [-0.26, -0.09, 0.09, 0.26];
    } else if (this.level <= 2) {
      spreadAngles = (this.level === 2 && enemy.enraged) ? [-0.14, 0.14] : [0];
    } else if (this.level <= 5) {
      spreadAngles = enemy.enraged ? [-0.2, 0, 0.2] : [-0.12, 0.12];
    } else if (this.level <= 8) {
      spreadAngles = enemy.enraged ? [-0.26, -0.09, 0.09, 0.26] : [-0.2, 0, 0.2];
    } else {
      spreadAngles = enemy.enraged ? [-0.3, -0.15, 0, 0.15, 0.3] : [-0.24, -0.08, 0.08, 0.24];
    }

    const orbSprite = this.orbSprites[enemy.bossSpriteKey] || this.orbSprites.BOSS;
    const isCyber = enemy.bossArchetype === 'CYBER_ARTILLERY';
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
        explosive: isCyber && offset === 0,
        explodeRadius: isCyber ? 1.6 : 0,
        life: 2.8,
        damage: enemy.projDamage || 11,
        sprite: orbSprite
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
    if (this.activeRouteMod?.id === 'ELITE') {
      this.bonusPoints += 300;
    }
    const sec = Math.max(1, Math.round((now - this.levelStartTime) / 1000));
    const choices = this.rollUpgradeChoices();
    const routeChoices = this.generateRouteChoices(this.level + 1);

    this.intermission = {
      startTime: now,
      sector: this.level,
      perfectSector: (this.sectorDamageTaken || 0) === 0,
      killsPct: Math.min(100, Math.round((this.sectorStats.kills / Math.max(1, this.sectorStats.totalKills)) * 100)),
      itemsPct: Math.min(100, Math.round((this.sectorStats.items / Math.max(1, this.sectorStats.totalItems)) * 100)),
      secretsPct: Math.min(100, Math.round((this.sectorStats.secrets / Math.max(1, this.sectorStats.totalSecrets)) * 100)),
      timeSec: sec,
      lastTick: 0,
      stage: choices.length > 0 ? 'UPGRADE' : 'ROUTE',
      upgradeChoices: choices,
      upgradeSelected: null,
      routeChoices,
      selectedRouteIdx: null
    };
    this.mapOpen = false;
    this.mouseDown = false;
    this.keys.clear();
    this.wasPointerLocked = false;
    this.safeExitPointerLock();
    this.audio.playSectorPortal();
    this.onStatus(
      this.intermission.stage === 'UPGRADE'
        ? `SECTOR ${this.level} COMPLETADO // Elige 1 mejora con [1]-[3] o [R] Reroll (${CONFIG.REROLL_COST} monedas)`
        : `SECTOR ${this.level} COMPLETADO // Elige la puerta al Sector ${this.level + 1} con [1]-[3]`
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
    im.stage = 'ROUTE';
    this.audio.playUpgrade();
    this.onStatus(`⚡ ${upgrade.label} (NV.${nextRank}) instalada // ELIGE TU PRÓXIMA PUERTA DE SECTOR [1]-[3]`);
  }

  selectRouteChoice(index) {
    const im = this.intermission;
    if (!im || im.stage !== 'ROUTE') return;
    const chosen = im.routeChoices?.[index];
    if (!chosen) {
      this.audio.playEmptyClip();
      return;
    }
    this.nextRouteChoice = chosen;
    im.selectedRouteIdx = index;
    const snap = this.captureCurrentScreen();
    this.audio.playDoorSlide();
    this.intermission = null;
    this.level++;
    this.player.health = Math.min(100, this.player.health + 15);
    this.player.invulnerableUntil = 0;
    this.startLevel();
    this.startScreenMelt('SECTOR', snap);
  }

  advanceFromIntermission() {
    if (!this.intermission) return;
    const im = this.intermission;
    if (im.stage === 'UPGRADE' && im.upgradeChoices?.length > 0 && !im.upgradeSelected) {
      this.audio.playEmptyClip();
      this.onStatus(`ALTAR DE MEJORA: elige [1]${im.upgradeChoices.length >= 3 ? ', [2] o [3]' : ' o [2]'} antes de cruzar`);
      return;
    }
    if (im.stage === 'ROUTE') {
      this.selectRouteChoice(0);
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

  applyEnemyDamage(enemy, rawDmg, source = 'SHOT', now = performance.now()) {
    if (!enemy || !enemy.alive) return false;
    if (enemy.isBoss && enemy.dormant) this.awakenBoss(enemy, now);
    enemy.alerted = true;
    enemy.targetEnemy = null;

    let effDmg = rawDmg;
    if (enemy.shieldActive) {
      effDmg *= 0.1;
      enemy.shieldFlash = 0.25;
      if (now - (this.lastShieldStatusAt || 0) > 1200) {
        this.lastShieldStatusAt = now;
        this.onStatus('🛡️ ¡ESCUDO DEL ICON OF SIN ACTIVO! Destruye los PILONES DE ALMA de las esquinas');
      }
    }

    enemy.health -= effDmg;
    enemy.hitFlash = 0.18;
    if (this.director) {
      this.director.lastCombatAt = now;
      this.director.intensity = Math.min(1.0, (this.director.intensity || 0) + 0.04);
    }
    if (enemy.health <= 0) {
      this.killEnemy(enemy, source);
      return true;
    }
    return false;
  }

  damageGenerator(gen, dmg, now = performance.now()) {
    if (!gen || !gen.alive) return false;
    gen.hp -= dmg;
    gen.hitFlash = 0.22;
    this.hitmarkerUntil = now + 100;
    this.audio.playHitmarker();
    this.spawnWallSparks(gen.x, gen.y, 6, '#00f5d4');
    if (gen.hp <= 0) {
      gen.alive = false;
      this.audio.playExplosion();
      this.screenShake = Math.max(this.screenShake, 0.35);
      this.shockwaves.push({ x: gen.x, y: gen.y, radius: 0.3, maxRadius: 3.2, life: 0.45, maxLife: 0.45, color: '#00f5d4' });
      const rem = this.generators.filter((g) => g.alive).length;
      if (rem === 0) {
        this.player.hasKey = true;
        this.audio.playKeyPickup();
        this.pushLootNotification('💥 ¡TODOS LOS GENERADORES DESTRUIDOS!', ['COMPUERTA EXIT DESBLOQUEADA · CORRE A SALIR'], '#70e000');
        this.onStatus('💥 ¡REACTORES EXTERMINADOS! Compuerta EXIT desbloqueada');
      } else {
        this.pushLootNotification(`⚡ REACTOR #${gen.id} DESTRUIDO`, [`QUEDAN ${rem} GENERADORES ACTIVOS`], '#00f5d4');
        this.onStatus(`⚡ Generador destruido · Quedan ${rem}`);
        if (this.director && this.director.reservePool.length > 0) {
          this.spawnTeleportWave(gen.x, gen.y, Math.min(2, this.director.reservePool.length), null, 'CONTRAATAQUE DEL REACTOR');
        }
      }
      return true;
    }
    return false;
  }

  damagePylon(pylon, dmg, now = performance.now()) {
    if (!pylon || pylon.destroyed || !pylon.active) return false;
    pylon.hp -= dmg;
    this.hitmarkerUntil = now + 100;
    this.audio.playHitmarker();
    this.spawnWallSparks(pylon.x, pylon.y, 7, '#ff00ff');
    if (pylon.hp <= 0) {
      pylon.destroyed = true;
      pylon.active = false;
      this.audio.playExplosion();
      this.screenShake = Math.max(this.screenShake, 0.35);
      this.shockwaves.push({ x: pylon.x, y: pylon.y, radius: 0.4, maxRadius: 3.4, life: 0.45, maxLife: 0.45, color: '#00f5d4' });
      const activeLeft = this.arenaPylons.filter((p) => p.active && !p.destroyed).length;
      if (activeLeft === 0) {
        const icon = this.enemies.find((e) => e.isFinalIcon && e.alive);
        if (icon) {
          icon.shieldActive = false;
          icon.stunTimer = 1.4;
          icon.wakeFlash = 0.65;
        }
        this.pushLootNotification('🔮 ¡PILONES DESTRUIDOS!', ['EL ESCUDO DEL ICON OF SIN HA CAÍDO · ¡ATACA AHORA!'], '#00f5d4');
        this.onStatus('🔮 ¡ESCUDO ROTO! El ICON OF SIN es vulnerable — ¡descarga toda tu potencia!');
      } else {
        this.onStatus(`🔮 Pilón de Alma destruido · Queda ${activeLeft} pilón activo`);
      }
      return true;
    }
    return false;
  }

  killVipWardenFallback(now = performance.now()) {
    if (!this.vip || !this.vip.alive) return;
    this.vip.alive = false;
    this.audio.playPlayerDeath();
    this.spawnBlood(this.vip.x, this.vip.y, 18);
    // Para evitar bloqueo del nivel, el Guardián Demoníaco más cercano o un Boss invocado porta ahora la llave de emergencia
    const carrier = this.enemies.find((e) => e.alive && !e.isBoss && !e.dormantCloset);
    if (carrier) {
      carrier.holdsKey = true;
      carrier.elite = true;
      carrier.health = Math.max(carrier.health, carrier.maxHealth * 1.4);
      carrier.scale *= 1.15;
    } else {
      this.keyItem = { x: this.vip.x, y: this.vip.y, active: true };
    }
    this.pushLootNotification('💀 ¡EL CIENTÍFICO VIP HA MUERTO!', ['ABATE AL DEMONIO PORTADOR DE LA LLAVE DE EMERGENCIA'], '#ff003c');
    this.onStatus('💀 ¡VIP caído! Elimina al portador con la LLAVE de emergencia para escapar');
  }

  updateDirector(dt, now) {
    const dir = this.director;
    if (!dir) return;

    // Decaimiento gradual de intensidad entre combates
    dir.intensity = Math.max(0.08, dir.intensity - dt * 0.045);

    // Procesar portales de teletransporte activos
    for (let i = this.teleportPortals.length - 1; i >= 0; i--) {
      const tp = this.teleportPortals[i];
      tp.timer -= dt;
      if (Math.random() < 0.4) {
        this.wallSparks.push({
          x: tp.x + (Math.random() - 0.5) * 0.4,
          y: tp.y + (Math.random() - 0.5) * 0.4,
          z: 0.25,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          vz: -0.9,
          life: 0.25,
          color: '#00f5d4'
        });
      }
      if (tp.timer <= 0) {
        this.teleportPortals.splice(i, 1);
        if (this.buildRegularEnemy && !this.isWall(tp.x, tp.y)) {
          const spawned = this.buildRegularEnemy(tp.specKey || 'IMP', { x: tp.x, y: tp.y }, Boolean(tp.isElite));
          spawned.alerted = true;
          spawned.wakeFlash = 0.5;
          this.enemies.push(spawned);
          this.shockwaves.push({ x: tp.x, y: tp.y, radius: 0.25, maxRadius: 1.7, life: 0.35, maxLife: 0.35, color: '#9d4edd' });
          this.spawnWallSparks(tp.x, tp.y, 10, '#00f5d4');
        }
      }
    }

    // Proximidad a Monster Closets (emboscadas ocultas al avanzar por el mapa)
    for (const closet of this.monsterClosets) {
      if (!closet.opened && distance(this.player.x, this.player.y, closet.triggerX, closet.triggerY) < 4.4) {
        this.openMonsterCloset(closet, 'COMPARTIMENTO TRAMPA ABIERTO');
      }
    }

    // Ritmo del AI Director: lanza refuerzos desde reservePool en momentos de calma o picos
    if (dir.reservePool.length > 0 && now >= dir.nextWaveAt) {
      const activeEnemies = this.enemies.filter((e) => e.alive && !e.isBoss && !e.dormantCloset).length;
      if (activeEnemies <= 6 && !this.isCellInsideArena(this.player.x, this.player.y)) {
        const batch = Math.min(dir.reservePool.length, this.level >= 6 ? 3 : 2);
        const specs = dir.reservePool.splice(0, batch);
        const spawned = this.spawnTeleportWave(this.player.x, this.player.y, specs.length, specs, 'DIRECTOR // REFUERZOS INFERNALES');
        dir.nextWaveAt = now + (spawned > 0 ? 15000 : 5000);
        dir.intensity = Math.min(1, dir.intensity + 0.28);
      } else {
        dir.nextWaveAt = now + 4500;
      }
    }
  }

  updateObjectives(dt, now) {
    const obj = this.sectorObjective;
    if (!obj) return;

    // Fases del Icon of Sin (Sector 10)
    if (obj.type === 'FINAL_ICON') {
      const icon = this.enemies.find((e) => e.isFinalIcon && e.alive);
      if (icon && !icon.dormant) {
        const hpRatio = icon.health / Math.max(1, icon.maxHealth);
        if (icon.phase === 1 && hpRatio <= 0.65) {
          icon.phase = 2;
          icon.shieldActive = this.activateIconPylons(2);
          icon.enraged = true;
          this.audio.playBossAwaken();
          this.screenShake = Math.max(this.screenShake, 0.65);
          this.pushLootNotification('👹 ¡ICON OF SIN · FASE II!', ['DESTRUYE LOS 2 PILONES DE ALMA PARA ROMPER SU ESCUDO'], '#ff00ff');
          this.onStatus('🛡️ ¡ICON OF SIN FASE II! Su escudo es casi impenetrable: destruye los PILONES en las esquinas');
        } else if (icon.phase === 2 && hpRatio <= 0.3) {
          icon.phase = 3;
          icon.shieldActive = this.activateIconPylons(2);
          icon.speedMultiplier *= 1.18;
          this.audio.playAlarm();
          this.screenShake = Math.max(this.screenShake, 0.75);
          this.pushLootNotification('💀 ¡ICON OF SIN · FASE III FINAL!', ['DESTRUYE LOS PILONES RESTANTES · TORMENTA DE METEOROS'], '#ff003c');
          this.onStatus('💀 ¡FASE III! Destruye los pilones restantes y acaba con el Icon of Sin');
        }
        // Meteoros periódicos en Fase 2 y 3 del Icon of Sin
        if (icon.phase >= 2 && Math.random() < dt * (icon.phase === 3 ? 0.85 : 0.45)) {
          const ang = Math.random() * Math.PI * 2;
          const d = 1.4 + Math.random() * 4.0;
          const mx = this.player.x + Math.cos(ang) * d;
          const my = this.player.y + Math.sin(ang) * d;
          if (!this.isWall(mx, my)) {
            this.meteorStrikes.push({ x: mx, y: my, radius: 2.0, timer: 1.25, maxTimer: 1.25 });
          }
        }
      }
    }

    if (obj.type === 'SURVIVAL_WAVES' && this.survivalState) {
      const sv = this.survivalState;
      if (sv.started && !sv.completed) {
        const hostilesNear = this.enemies.filter((e) => e.alive && !e.isBoss && !e.dormantCloset).length;
        sv.waveTimer -= dt;
        if ((sv.waveTimer <= 0 || (sv.waveTimer < 14 && hostilesNear === 0 && this.teleportPortals.length === 0))) {
          if (sv.wave < sv.maxWaves) {
            this.startNextSurvivalWave(now);
          } else {
            sv.completed = true;
            this.player.hasKey = true;
            this.audio.playKeyPickup();
            this.pushLootNotification('🏆 ¡3 OLEADAS SOBREVIVIDAS!', ['COMPUERTA EXIT DESBLOQUEADA · DIRÍGETE A LA SALIDA'], '#70e000');
            this.onStatus('🏆 ¡OLEADAS SUPERADAS! Corre a la compuerta EXIT');
          }
        }
      }
    }

    if (obj.type === 'ESCAPE_COUNTDOWN' && obj.escapeStarted) {
      obj.escapeTimer = Math.max(0, obj.escapeTimer - dt);
      if (Math.random() < dt * 0.8) {
        this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.04 : 0.16);
      }
      if (obj.escapeTimer <= 10 && Math.floor((obj.escapeTimer + dt)) !== Math.floor(obj.escapeTimer)) {
        this.audio.playTurretBeep();
      }
      if (obj.escapeTimer <= 0) {
        this.damagePlayer(999, this.player.x, this.player.y, now);
        this.onStatus('☢️ ¡EL SECTOR HA EXPLOTADO ANTES DE TU EVACUACIÓN!');
      }
    }

    if (obj.type === 'ESCORT_RESCUE' && this.vip) {
      const vip = this.vip;
      vip.hitFlash = Math.max(0, (vip.hitFlash || 0) - dt);
      if (vip.alive && vip.rescued) {
        const dPlayer = distance(this.player.x, this.player.y, vip.x, vip.y);
        if (dPlayer > 1.8) {
          const dirX = (this.player.x - vip.x) / dPlayer;
          const dirY = (this.player.y - vip.y) / dPlayer;
          const step = Math.min(3.15, dPlayer > 5 ? 3.5 : 2.65) * dt;
          if (this.canEnemyMoveTo(vip.x + dirX * step, vip.y, 0.24)) vip.x += dirX * step;
          if (this.canEnemyMoveTo(vip.x, vip.y + dirY * step, 0.24)) vip.y += dirY * step;
          vip.walkCycle += dt * 7;
        }
        if (this.exitDoor && distance(vip.x, vip.y, this.exitDoor.x, this.exitDoor.y) < 2.2) {
          if (!this.player.hasKey) {
            this.player.hasKey = true;
            this.audio.playKeyPickup();
            this.pushLootNotification('🧬 ¡VIP EN ZONA DE EXTRACCIÓN!', ['LLAVE DE SALIDA CONCEDIDA · CRUZA EXIT'], '#70e000');
            this.onStatus('🧬 ¡Científico UAC a salvo en EXIT! Cruza la puerta para extraer');
          }
        }
      }
    }

    if (obj.type === 'THREE_KEYS') {
      for (const k of this.coloredKeys) {
        if (k.active && distance(this.player.x, this.player.y, k.x, k.y) < 0.95) {
          k.active = false;
          this.sectorStats.items++;
          this.pickupFlashTime = now;
          this.audio.playKeyPickup();
          const colMap = { RED: ['#ff003c', 'ROJA'], BLUE: ['#00b4d8', 'AZUL'], YELLOW: ['#ffbe0b', 'AMARILLA'] };
          const [hex, esName] = colMap[k.color] || ['#ffbe0b', k.color];
          this.spawnWallSparks(k.x, k.y, 12, hex);
          const remaining = this.coloredKeys.filter((c) => c.active).length;
          if (remaining === 0) {
            this.player.hasKey = true;
            this.pushLootNotification('🗝️ ¡3 LLAVES REUNIDAS!', ['COMPUERTA EXIT DESBLOQUEADA'], '#70e000');
            this.onStatus('🗝️ ¡3 Llaves recogidas! Corre hacia EXIT');
          } else {
            this.pushLootNotification(`🗝️ LLAVE ${esName} RECOGIDA`, [`FALTAN ${remaining} LLAVES PARA EXIT`], hex);
            this.onStatus(`🗝️ Llave ${esName} recogida · Faltan ${remaining}`);
          }
          // Emboscada del Director al coger llave en sectores altos
          if (this.director && this.director.reservePool.length > 0 && Math.random() < 0.7) {
            this.spawnTeleportWave(this.player.x, this.player.y, 2, null, 'EMBOSCADA DE LLAVE');
          }
        }
      }
    }
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

    this.updateDirector(dt, now);
    this.updateObjectives(dt, now);
    if (player.health <= 0) {
      this.startDeathSequence(now);
      return;
    }

    this.flowTimer = (this.flowTimer || 0) - dt;
    if (this.flowTimer <= 0) {
      this.flowTimer = 0.22;
      this.updateFlowField();
    this.prebakeSectorSprites();
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

    for (let hi = this.hazards.length - 1; hi >= 0; hi--) {
      if (this.hazards[hi].tempUntil && now >= this.hazards[hi].tempUntil) {
        this.hazards.splice(hi, 1);
      }
    }
    const evType = this.sectorEvent?.type;
    if ((evType === 'TOXIC' || evType === 'LAVA' || evType === 'APOCALYPSE' || this.hazards.some((h) => h.tempUntil)) && this.hazards.length > 0) {
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
      if (this.director && this.director.reservePool.length > 0 && Math.random() < 0.65) {
        this.spawnTeleportWave(player.x, player.y, Math.min(2, this.director.reservePool.length), null, 'EMBOSCADA AL COGER LA LLAVE');
      }
    }

    // Recogida de armas nuevas en pedestales del mapa
    for (const wp of this.weaponPickups) {
      if (!wp.active) continue;
      if (distance(player.x, player.y, wp.x, wp.y) < 0.95) {
        wp.active = false;
        this.sectorStats.items++;
        this.pickupFlashTime = now;
        this.evilGrinUntil = now + 1600;
        if (!this.isWeaponOwned(wp.weaponId)) {
          this.unlockWeapon(wp.weaponId, true);
        } else {
          if (wp.weaponId === 5) player.rockets = Math.min(this.getMaxRockets(), player.rockets + 5);
          else if (wp.weaponId === 6 || wp.weaponId === 7) player.cells = Math.min(this.getMaxCells(), player.cells + 35);
          this.audio.playPickup();
          this.pushLootNotification('📦 MUNICIÓN DE ARSENAL', ['+MUNICIÓN PESADA RECOGIDA'], '#00f5d4');
        }
      }
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
      for (const gen of this.generators) {
        if (gen.alive && !p.hitSet.has(`g_${gen.id}`) && Math.hypot(p.x - gen.x, p.y - gen.y) < hitRadius) {
          p.hitSet.add(`g_${gen.id}`);
          this.damageGenerator(gen, p.damage * 0.85, now);
        }
      }
      for (const enemy of this.enemies) {
        if (enemy.alive && !enemy.dormantCloset && !p.hitSet.has(enemy.id) && Math.hypot(p.x - enemy.x, p.y - enemy.y) < hitRadius) {
          p.hitSet.add(enemy.id);
          enemy.burnTimer = 2.4;
          this.hitmarkerUntil = now + 80;
          if (now - this.lastHitmarkerSound > 90) {
            this.lastHitmarkerSound = now;
            this.audio.playHitmarker();
          }
          this.spawnWallSparks(enemy.x, enemy.y, 3, '#ff4d00');
          this.applyEnemyDamage(enemy, p.damage, 'FLAME', now);
        }
      }
    }

    // Proyectiles especiales del Jugador: Cohete [5], Plasma [6] y BFG-9000 [7]
    for (let i = this.playerProjectiles.length - 1; i >= 0; i--) {
      const pp = this.playerProjectiles[i];
      const nextX = pp.x + pp.vx * dt;
      const nextY = pp.y + pp.vy * dt;
      pp.x = nextX;
      pp.y = nextY;
      pp.life -= dt;

      // Chispas de estela según el tipo de proyectil
      if (Math.random() < (pp.kind === 'ROCKET' ? 0.8 : 0.4)) {
        this.wallSparks.push({
          x: pp.x,
          y: pp.y,
          z: 0,
          vx: -pp.vx * 0.08 + (Math.random() - 0.5) * 0.4,
          vy: -pp.vy * 0.08 + (Math.random() - 0.5) * 0.4,
          vz: -0.25,
          life: 0.18,
          color: pp.kind === 'ROCKET' ? '#ff9e00' : (pp.kind === 'BFG' ? '#70e000' : '#00f5d4')
        });
      }

      // Rayos verdes automáticos del BFG-9000 mientras vuela
      if (pp.kind === 'BFG') {
        pp.zapTimer = (pp.zapTimer || 0) - dt;
        if (pp.zapTimer <= 0) {
          pp.zapTimer = 0.16;
          for (const enemy of this.enemies) {
            if (!enemy.alive || enemy.dormantCloset) continue;
            const d = distance(pp.x, pp.y, enemy.x, enemy.y);
            if (d <= CONFIG.BFG_ZAP_RADIUS && this.lineOfSight(pp.x, pp.y, enemy.x, enemy.y)) {
              this.hitscanTracers.push({ x1: pp.x, y1: pp.y, x2: enemy.x, y2: enemy.y, color: '#70e000', life: 0.14, maxLife: 0.14 });
              this.spawnWallSparks(enemy.x, enemy.y, 4, '#70e000');
              this.applyEnemyDamage(enemy, CONFIG.BFG_ZAP_DAMAGE * (pp.dmgMult || 1), 'BFG', now);
            }
          }
          for (const gen of this.generators) {
            if (gen.alive && distance(pp.x, pp.y, gen.x, gen.y) <= CONFIG.BFG_ZAP_RADIUS) {
              this.hitscanTracers.push({ x1: pp.x, y1: pp.y, x2: gen.x, y2: gen.y, color: '#70e000', life: 0.14, maxLife: 0.14 });
              this.damageGenerator(gen, 2.2, now);
            }
          }
        }
      }

      let detonate = pp.life <= 0 || this.isWall(pp.x, pp.y);
      let directEnemy = null;

      if (!detonate) {
        for (const barrel of this.barrels) {
          if (!barrel.exploded && distance(pp.x, pp.y, barrel.x, barrel.y) < 0.6) {
            this.explodeBarrel(barrel, now);
            detonate = true;
            break;
          }
        }
      }
      if (!detonate) {
        for (const gen of this.generators) {
          if (gen.alive && distance(pp.x, pp.y, gen.x, gen.y) < 0.72) {
            this.damageGenerator(gen, pp.damage, now);
            detonate = true;
            break;
          }
        }
      }
      if (!detonate) {
        for (const pylon of this.arenaPylons) {
          if (!pylon.destroyed && pylon.active && distance(pp.x, pp.y, pylon.x, pylon.y) < 0.72) {
            this.damagePylon(pylon, pp.damage, now);
            detonate = true;
            break;
          }
        }
      }
      if (!detonate && this.escapeCore && !this.escapeCore.triggered && distance(pp.x, pp.y, this.escapeCore.x, this.escapeCore.y) < 0.75) {
        this.triggerEscapeCountdown(now);
        detonate = true;
      }
      if (!detonate) {
        for (const enemy of this.enemies) {
          if (!enemy.alive || enemy.dormantCloset) continue;
          const hitDist = enemy.isBoss ? 0.72 : 0.56;
          if (distance(pp.x, pp.y, enemy.x, enemy.y) < hitDist) {
            directEnemy = enemy;
            detonate = true;
            break;
          }
        }
      }

      if (detonate) {
        this.playerProjectiles.splice(i, 1);
        if (pp.kind === 'PLASMA') {
          this.spawnWallSparks(pp.x, pp.y, 7, '#00f5d4');
          this.shockwaves.push({ x: pp.x, y: pp.y, radius: 0.15, maxRadius: 0.75, life: 0.16, maxLife: 0.16, color: '#00f5d4' });
          if (directEnemy) {
            const shieldMult = (directEnemy.kind === 'SHIELD' || directEnemy.isTurret) ? 1.4 : 1.0;
            if (!directEnemy.isBoss && Math.random() < 0.38) directEnemy.stunTimer = Math.max(directEnemy.stunTimer || 0, 0.25);
            this.hitmarkerUntil = now + 90;
            this.audio.playHitmarker();
            this.spawnBlood(directEnemy.x, directEnemy.y, 6, '#00f5d4');
            this.applyEnemyDamage(directEnemy, pp.damage * shieldMult, 'PLASMA', now);
          }
        } else if (pp.kind === 'ROCKET') {
          const rad = CONFIG.ROCKET_SPLASH_RADIUS;
          this.audio.playExplosion();
          this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.12 : 0.36);
          this.shockwaves.push({ x: pp.x, y: pp.y, radius: 0.3, maxRadius: rad, life: 0.42, maxLife: 0.42, color: '#ff4d00' });
          this.spawnWallSparks(pp.x, pp.y, 16, '#ffbe0b');
          const dP = distance(pp.x, pp.y, player.x, player.y);
          if (dP < rad * 0.85) {
            this.damagePlayer(Math.max(3, Math.round(14 * (1 - dP / rad))), pp.x, pp.y, now);
          }
          for (const barrel of this.barrels) {
            if (!barrel.exploded && distance(pp.x, pp.y, barrel.x, barrel.y) <= rad) this.explodeBarrel(barrel, now);
          }
          for (const gen of this.generators) {
            if (gen.alive && distance(pp.x, pp.y, gen.x, gen.y) <= rad) this.damageGenerator(gen, pp.damage * 0.75, now);
          }
          for (const pylon of this.arenaPylons) {
            if (!pylon.destroyed && pylon.active && distance(pp.x, pp.y, pylon.x, pylon.y) <= rad) this.damagePylon(pylon, pp.damage * 0.75, now);
          }
          for (const enemy of this.enemies) {
            if (!enemy.alive || enemy.dormantCloset) continue;
            const dE = distance(pp.x, pp.y, enemy.x, enemy.y);
            if (dE <= rad) {
              const falloff = enemy === directEnemy ? 1.0 : Math.max(0.35, 1 - dE / (rad * 1.15));
              this.applyKnockback(enemy, enemy.x - pp.x, enemy.y - pp.y, 6.2 * falloff, 0.35);
              this.spawnBlood(enemy.x, enemy.y, 12);
              this.hitmarkerUntil = now + 110;
              this.applyEnemyDamage(enemy, pp.damage * falloff, 'ROCKET', now);
            }
          }
        } else if (pp.kind === 'BFG') {
          const rad = CONFIG.BFG_SPLASH_RADIUS;
          this.audio.playBfgDetonate();
          this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.16 : 0.6);
          this.shockwaves.push({ x: pp.x, y: pp.y, radius: 0.4, maxRadius: rad, life: 0.58, maxLife: 0.58, color: '#70e000' });
          this.spawnWallSparks(pp.x, pp.y, 24, '#70e000');
          for (const barrel of this.barrels) {
            if (!barrel.exploded && distance(pp.x, pp.y, barrel.x, barrel.y) <= rad) this.explodeBarrel(barrel, now);
          }
          for (const gen of this.generators) {
            if (gen.alive && distance(pp.x, pp.y, gen.x, gen.y) <= rad) this.damageGenerator(gen, pp.damage * 0.7, now);
          }
          for (const pylon of this.arenaPylons) {
            if (!pylon.destroyed && pylon.active && distance(pp.x, pp.y, pylon.x, pylon.y) <= rad) this.damagePylon(pylon, pp.damage * 0.75, now);
          }
          for (const enemy of this.enemies) {
            if (!enemy.alive || enemy.dormantCloset) continue;
            const dE = distance(pp.x, pp.y, enemy.x, enemy.y);
            if (dE <= rad) {
              const falloff = enemy === directEnemy ? 1.0 : Math.max(0.45, 1 - dE / (rad * 1.15));
              this.hitscanTracers.push({ x1: pp.x, y1: pp.y, x2: enemy.x, y2: enemy.y, color: '#70e000', life: 0.25, maxLife: 0.25 });
              this.applyKnockback(enemy, enemy.x - pp.x, enemy.y - pp.y, 8.0 * falloff, 0.5);
              this.spawnBlood(enemy.x, enemy.y, 16, '#70e000');
              this.hitmarkerUntil = now + 140;
              this.applyEnemyDamage(enemy, pp.damage * falloff, 'BFG', now);
            }
          }
        }
      }
    }

    for (let i = this.hitscanTracers.length - 1; i >= 0; i--) {
      this.hitscanTracers[i].life -= dt;
      if (this.hitscanTracers[i].life <= 0) this.hitscanTracers.splice(i, 1);
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
      const explodeAt = (hitX, hitY) => {
        const r = ep.explodeRadius || 1.8;
        this.audio.playExplosion();
        this.shockwaves.push({ x: hitX, y: hitY, radius: 0.25, maxRadius: r, life: 0.36, maxLife: 0.36, color: '#ff4d00' });
        this.spawnWallSparks(hitX, hitY, 10, '#ff9e00');
        const dp = distance(hitX, hitY, player.x, player.y);
        if (dp < r) {
          this.damagePlayer(Math.max(4, Math.round(ep.damage * (1 - (dp / r) * 0.65))), hitX, hitY, now);
        }
      };

      if (ep.life <= 0 || this.isWall(ep.x, ep.y)) {
        if (ep.explosive) explodeAt(ep.x, ep.y);
        else this.spawnWallSparks(ep.x, ep.y, 4);
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (this.vip && this.vip.alive && this.vip.rescued && distance(ep.x, ep.y, this.vip.x, this.vip.y) < 0.5) {
        this.vip.hp -= ep.damage * 0.65;
        this.vip.hitFlash = 0.2;
        this.spawnBlood(this.vip.x, this.vip.y, 6);
        if (this.vip.hp <= 0) this.killVipWardenFallback(now);
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      let hitOtherDemon = false;
      for (const other of this.enemies) {
        if (other.alive && !other.dormantCloset && other.id !== ep.ownerId && other.kind !== ep.ownerKind && distance(ep.x, ep.y, other.x, other.y) < 0.65) {
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
        if (ep.explosive) explodeAt(ep.x, ep.y);
        else this.damagePlayer(ep.damage, ep.x, ep.y, now);
        this.enemyProjectiles.splice(i, 1);
      }
    }

    for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
      const bp = this.bloodParticles[i];
      bp.x += bp.vx * dt;
      bp.y += bp.vy * dt;
      bp.vz = (bp.vz || 0) - 5.2 * dt;
      bp.z -= bp.vz * dt;
      bp.life -= dt;
      if (bp.z >= 0.44 || bp.life <= 0) {
        if (bp.poolOnLand && this.bloodPools.length < 180) {
          this.spawnBloodPool(bp.x, bp.y, 0.24 + Math.random() * 0.18, bp.color);
        }
        this.bloodParticles.splice(i, 1);
      }
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
        const extraLines = [`+${pack.amount} CARTUCHOS`, `+${pack.fuelAmount || 12}% GASOLINA`];
        if (this.isWeaponOwned(5) || pack.rocketAmount) {
          const rGain = Math.min(this.getMaxRockets() - player.rockets, pack.rocketAmount || 1);
          player.rockets += Math.max(0, rGain);
          if (rGain > 0) extraLines.push(`+${rGain} COHETE`);
        }
        if (this.isWeaponOwned(6) || this.isWeaponOwned(7) || pack.cellAmount) {
          const cGain = Math.min(this.getMaxCells() - player.cells, pack.cellAmount || 10);
          player.cells += Math.max(0, cGain);
          if (cGain > 0) extraLines.push(`+${cGain} CÉLULAS`);
        }
        pack.active = false;
        this.pickupFlashTime = now;
        this.evilGrinUntil = now + 900;
        this.audio.playPickup();
        this.pushLootNotification('📦 RESERVA DE MUNICIÓN', extraLines, '#ffbe0b');
        this.onStatus(`Reserva recogida (${extraLines.join(' / ')})`);
      }
    }

    // IA de Demonios y Bosses con Pathfinding BFS, Colisión con Radio, Alerta y Mecánicas Únicas
    const activeEnemyLen = this.enemies.length;
    for (let ei = 0; ei < activeEnemyLen; ei++) {
      const enemy = this.enemies[ei];
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
      if (!enemy.alive || enemy.dormantCloset) continue;

      // Los Bosses permanecen parados en el centro de la sala hasta que el jugador entra en la sala
      if (enemy.isBoss && enemy.dormant) {
        enemy.walkCycle = 0;
        if (this.isPlayerInBossArena(enemy)) {
          this.awakenBoss(enemy, now);
        } else {
          continue;
        }
      }

      if (enemy.painTimer > 0 || enemy.stunTimer > 0) {
        enemy.aimTimer = 0;
        enemy.burstLeft = 0;
        continue;
      }

      if (enemy.targetEnemy && !enemy.targetEnemy.alive) enemy.targetEnemy = null;
      let targetX = enemy.targetEnemy ? enemy.targetEnemy.x : player.x;
      let targetY = enemy.targetEnemy ? enemy.targetEnemy.y : player.y;
      let targetIsVip = false;
      if (!enemy.targetEnemy && this.vip && this.vip.alive && this.vip.rescued) {
        const dp = distance(enemy.x, enemy.y, player.x, player.y);
        const dv = distance(enemy.x, enemy.y, this.vip.x, this.vip.y);
        if (dv < dp * 0.72) {
          targetX = this.vip.x;
          targetY = this.vip.y;
          targetIsVip = true;
        }
      }

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
        } else if (!enemy.isTurret) {
          // Patrulla lenta sin atravesar paredes
          enemy.walkCycle += dt * 2.5;
          const pAngle = (enemy.facingAngle || 0) + Math.sin(now * 0.001 + enemy.id) * 0.3;
          const res = this.moveEnemyWithCollision(enemy, Math.cos(pAngle) * 0.35 * dt, Math.sin(pAngle) * 0.35 * dt, 0.28);
          if (res.hitWall) enemy.facingAngle = (enemy.facingAngle || 0) + Math.PI * 0.65;
          continue;
        } else {
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
        const bossTargetFace = (enemy.bossState === 'WINDUP' || enemy.bossState === 'CHARGE')
          ? Math.atan2(enemy.chargeDirY || toY, enemy.chargeDirX || toX)
          : Math.atan2(toY, toX);
        this.turnEnemyFacing(enemy, bossTargetFace, dt, 7.5);

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
        // Demonios regulares con Pathfinding BFS y comportamientos especializados del Bestiario
        enemy.dashCooldown = Math.max(0, (enemy.dashCooldown || 0) - dt);

        if (enemy.kind === 'SHIELD') {
          const targetAngle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
          const diff = Math.atan2(Math.sin(targetAngle - enemy.facingAngle), Math.cos(targetAngle - enemy.facingAngle));
          const maxTurn = dt * 2.4;
          enemy.facingAngle += clamp(diff, -maxTurn, maxTurn);
        }

        if (enemy.kind === 'LOST_SOUL') {
          this.updateLostSoul(enemy, player, dt, now, dist, toX, toY);
          continue;
        }

        if (enemy.isTurret) {
          this.turnEnemyFacing(enemy, Math.atan2(targetY - enemy.y, targetX - enemy.x), dt, 4.8);
          if (hasLOS && dist < 15.5 && enemy.rangedCooldown <= 0) {
            enemy.rangedCooldown = 1.15 + Math.random() * 0.35;
            const aim = Math.atan2(toY, toX);
            const pSpeed = enemy.projSpeed || 9.2;
            for (const lat of [-0.14, 0.14]) {
              const px = enemy.x + Math.cos(aim + Math.PI / 2) * lat + toX * 0.35;
              const py = enemy.y + Math.sin(aim + Math.PI / 2) * lat + toY * 0.35;
              this.enemyProjectiles.push({
                ownerId: enemy.id,
                ownerKind: enemy.kind,
                ownerRef: enemy,
                x: px,
                y: py,
                vx: toX * pSpeed,
                vy: toY * pSpeed,
                life: 2.1,
                damage: enemy.projDamage || 7,
                sprite: this.orbSprites.TURRET || this.orbSprites.IMP
              });
            }
            this.audio.playTurretBeep();
          }
          continue;
        }

        if (enemy.isSniper) {
          this.turnEnemyFacing(enemy, Math.atan2(targetY - enemy.y, targetX - enemy.x), dt, 6.2);
          if (enemy.aimTimer > 0) {
            enemy.aimTimer -= dt;
            if (!hasLOS) {
              enemy.aimTimer = 0;
            } else if (enemy.aimTimer <= 0) {
              // Disparo hitscan letal a lo largo del láser apuntado
              const sx = enemy.aimDirX || toX;
              const sy = enemy.aimDirY || toY;
              const endX = enemy.x + sx * 19;
              const endY = enemy.y + sy * 19;
              this.hitscanTracers.push({ x1: enemy.x, y1: enemy.y, x2: endX, y2: endY, color: '#ff003c', life: 0.28, maxLife: 0.28 });
              this.audio.playSniperShot(dist);
              const px = targetX - enemy.x;
              const py = targetY - enemy.y;
              const projAlong = px * sx + py * sy;
              const perp = Math.abs(px * -sy + py * sx);
              if (projAlong > 0 && perp < 0.56 && hasLOS) {
                if (targetIsVip && this.vip) {
                  this.vip.hp -= (enemy.projDamage || 18) * 0.6;
                  if (this.vip.hp <= 0) this.killVipWardenFallback(now);
                } else {
                  this.damagePlayer(enemy.projDamage || 18, enemy.x, enemy.y, now);
                }
              }
              enemy.rangedCooldown = 2.8 + Math.random() * 0.9;
            }
            continue;
          } else if (hasLOS && dist > 3.5 && dist < 18.0 && enemy.rangedCooldown <= 0) {
            enemy.aimTimer = 1.15;
            enemy.aimDirX = toX;
            enemy.aimDirY = toY;
            this.audio.playSniperLock();
            continue;
          }
        }

        if (enemy.isHitscan) {
          if (enemy.burstLeft > 0) {
            enemy.burstCd -= dt;
            if (enemy.burstCd <= 0) {
              enemy.burstLeft--;
              enemy.burstCd = 0.13;
              const spread = (Math.random() - 0.5) * 0.12;
              const shotAng = Math.atan2(targetY - enemy.y, targetX - enemy.x) + spread;
              const sx = Math.cos(shotAng);
              const sy = Math.sin(shotAng);
              const endX = enemy.x + sx * 15;
              const endY = enemy.y + sy * 15;
              this.hitscanTracers.push({ x1: enemy.x, y1: enemy.y, x2: endX, y2: endY, color: '#ffbe0b', life: 0.12, maxLife: 0.12 });
              this.audio.playRifleBurst(dist);
              const px = targetX - enemy.x;
              const py = targetY - enemy.y;
              const projAlong = px * sx + py * sy;
              const perp = Math.abs(px * -sy + py * sx);
              if (hasLOS && projAlong > 0 && perp < 0.52) {
                if (targetIsVip && this.vip) {
                  this.vip.hp -= (enemy.projDamage || 6) * 0.5;
                  if (this.vip.hp <= 0) this.killVipWardenFallback(now);
                } else {
                  this.damagePlayer(enemy.projDamage || 6, enemy.x, enemy.y, now);
                }
              }
            }
          } else if (hasLOS && dist > 1.8 && dist < 15.0 && enemy.rangedCooldown <= 0) {
            enemy.burstLeft = 3;
            enemy.burstCd = 0.25;
            enemy.rangedCooldown = 2.0 + Math.random() * 1.1;
          }
        }

        if (enemy.kind === 'SUMMONER') {
          this.updateSummoner(enemy, player, dt, now, dist, hasLOS, toX, toY);
        } else if (enemy.dashTime > 0) {
          enemy.dashTime -= dt;
          const dSpeed = ((enemy.kind === 'PINKY' || enemy.kind === 'SPECTRE') ? 5.6 : 4.8) * dt;
          const res = this.moveEnemyWithCollision(enemy, enemy.dashDirX * dSpeed, enemy.dashDirY * dSpeed, 0.27);
          if (res.hitWall) enemy.dashTime = 0;
          enemy.facingAngle = Math.atan2(enemy.dashDirY, enemy.dashDirX);
          enemy.walkCycle += dt * 18;
          if (Math.random() < 0.5) this.spawnWallSparks(enemy.x, enemy.y, 2, enemy.invisible ? '#9d4edd' : '#ff4d00');
        } else {
          const canDash =
            hasLOS &&
            dist > 1.4 &&
            dist < 9.5 &&
            enemy.dashCooldown <= 0 &&
            Math.random() < (enemy.dashChance || 0);
          if (canDash) {
            enemy.dashTime = (enemy.kind === 'PINKY' || enemy.kind === 'SPECTRE') ? 0.36 : 0.28;
            enemy.dashDirX = toX;
            enemy.dashDirY = toY;
            enemy.dashCooldown = ((enemy.kind === 'PINKY' || enemy.kind === 'SPECTRE') ? 2.1 : 3.4) + Math.random() * 1.8;
            this.audio.playBossDash(dist);
            this.spawnWallSparks(enemy.x, enemy.y, 6, '#ff4d00');
          }

          if (!enemy.isHitscan && !enemy.isSniper && !enemy.isTurret && hasLOS && enemy.projSpeed > 0 && dist > 2.2 && dist < 15.5 && enemy.rangedCooldown <= 0) {
            enemy.rangedCooldown = (enemy.isCyberRocket ? 2.4 : 2.1) + Math.random() * 1.1;
            const pSpeed = enemy.projSpeed || 6.5;
            const key = enemy.kind || 'IMP';
            const isHoming = key === 'REVENANT';
            const baseA = Math.atan2(toY, toX);
            if (enemy.isMancubus) {
              for (const off of [-0.24, 0, 0.24]) {
                const a = baseA + off;
                this.enemyProjectiles.push({
                  ownerId: enemy.id, ownerKind: enemy.kind, ownerRef: enemy,
                  x: enemy.x + Math.cos(a) * 0.48, y: enemy.y + Math.sin(a) * 0.48,
                  vx: Math.cos(a) * pSpeed, vy: Math.sin(a) * pSpeed,
                  life: 2.5, damage: enemy.projDamage || 10, sprite: this.orbSprites.MANCUBUS || this.orbSprites.IMP
                });
              }
              this.audio.playDemonFireball(dist);
            } else if (enemy.isHellKnight) {
              for (const off of [-0.09, 0.09]) {
                const a = baseA + off;
                this.enemyProjectiles.push({
                  ownerId: enemy.id, ownerKind: enemy.kind, ownerRef: enemy,
                  x: enemy.x + Math.cos(a) * 0.42, y: enemy.y + Math.sin(a) * 0.42,
                  vx: Math.cos(a) * pSpeed, vy: Math.sin(a) * pSpeed,
                  life: 2.4, damage: enemy.projDamage || 11, sprite: this.orbSprites.HELL_KNIGHT || this.orbSprites.SUMMONER
                });
              }
              this.audio.playDemonFireball(dist);
            } else if (enemy.isCyberRocket) {
              this.enemyProjectiles.push({
                ownerId: enemy.id, ownerKind: enemy.kind, ownerRef: enemy,
                x: enemy.x + toX * 0.5, y: enemy.y + toY * 0.5,
                vx: toX * pSpeed, vy: toY * pSpeed,
                explosive: true, explodeRadius: 1.9,
                life: 3.1, damage: enemy.projDamage || 16, sprite: this.orbSprites.CYBERDEMON || this.orbSprites.BOSS_CYBER
              });
              this.audio.playRocketLauncher();
            } else {
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
          }

          if (dist > 0.95) {
            const step = 0.78 * enemy.speedMultiplier * dt;
            let dirX = toX;
            let dirY = toY;

            // Francotiradores retroceden si el jugador se acerca demasiado
            if (enemy.isSniper && hasLOS && dist < 7.5) {
              dirX = -toX;
              dirY = -toY;
            } else if (!hasLOS && !enemy.targetEnemy) {
              const flow = this.getFlowStep(enemy.x, enemy.y);
              if (flow) {
                dirX = flow.dirX;
                dirY = flow.dirY;
              }
            }

            let mx = dirX * step;
            let my = dirY * step;
            if (hasLOS && (enemy.movePattern === 'STRAFE' || enemy.invisible)) {
              const w = Math.sin(now * 0.005 + enemy.walkCycle) * enemy.strafeDir;
              mx += -dirY * step * 0.82 * w;
              my += dirX * step * 0.82 * w;
            } else if (hasLOS && enemy.movePattern === 'HOVER') {
              mx += -dirY * step * 0.48 * enemy.strafeDir;
              my += dirX * step * 0.48 * enemy.strafeDir;
            }

            // Separación suave entre demonios para que te rodeen en vez de apilarse en el mismo punto
            for (const other of this.enemies) {
              if (other === enemy || !other.alive || other.dormantCloset) continue;
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
              const flow = this.getFlowStep(enemy.x, enemy.y);
              if (flow) {
                this.moveEnemyWithCollision(enemy, flow.dirX * step, flow.dirY * step, 0.27);
              }
            }
            if (enemy.kind !== 'SHIELD' && Math.hypot(mx, my) > 0.0001) {
              this.turnEnemyFacing(enemy, Math.atan2(my, mx), dt, (enemy.kind === 'PINKY' || enemy.kind === 'SPECTRE') ? 8.5 : 6.2);
            }
            enemy.walkCycle += dt * ((enemy.kind === 'PINKY' || enemy.kind === 'SPECTRE') ? 8.2 : 5.4);
          } else if (enemy.kind !== 'SHIELD') {
            this.turnEnemyFacing(enemy, Math.atan2(toY, toX), dt, 7.5);
          }
        }
      }

      if (!enemy.targetEnemy && dist <= 1.15 && enemy.cooldown <= 0) {
        if (targetIsVip && this.vip && this.vip.alive) {
          this.vip.hp -= enemy.damage * 0.65;
          this.vip.hitFlash = 0.25;
          this.spawnBlood(this.vip.x, this.vip.y, 8);
          if (this.vip.hp <= 0) this.killVipWardenFallback(now);
        } else {
          this.damagePlayer(enemy.damage, enemy.x, enemy.y, now);
        }
        enemy.cooldown = (enemy.kind === 'PINKY' || enemy.kind === 'SPECTRE') ? 0.75 : 0.95;
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
        const objType = this.sectorObjective?.type || 'BOSS_KEY';
        const lockMsgs = {
          GENERATORS: '🔒 EXIT BLOQUEADO: Destruye todos los GENERADORES ⚡ del sector',
          SURVIVAL_WAVES: '🔒 EXIT BLOQUEADO: Activa el NEXUS central [E] y sobrevive las 3 oleadas',
          ESCORT_RESCUE: '🔒 EXIT BLOQUEADO: Rescata al CIENTÍFICO VIP [E] y escoltalo hasta EXIT',
          ESCAPE_COUNTDOWN: '🔒 EXIT BLOQUEADO: Sabotea el NÚCLEO DE FUSIÓN [E] antes de evacuar',
          THREE_KEYS: '🔒 EXIT BLOQUEADO: Reúne las 3 LLAVES (Roja, Azul y Amarilla)',
          FINAL_ICON: '🔒 EXIT BLOQUEADO: Extermina al ICON OF SIN y recoge su llave',
          BOSS_KEY: '🔒 COMPUERTA EXIT BLOQUEADA: Derrota al BOSS GUARDIÁN y recoge su LLAVE 🔑'
        };
        this.onStatus(lockMsgs[objType] || lockMsgs.BOSS_KEY);
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

  turnEnemyFacing(enemy, targetAngle, dt, rate = 6.5) {
    const cur = enemy.facingAngle || 0;
    const diff = Math.atan2(Math.sin(targetAngle - cur), Math.cos(targetAngle - cur));
    const maxTurn = dt * rate;
    enemy.facingAngle = cur + clamp(diff, -maxTurn, maxTurn);
  }

  updateLostSoul(enemy, player, dt, now, dist, toX, toY) {
    enemy.walkCycle += dt * 14;
    this.turnEnemyFacing(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x), dt, 8.5);

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
    this.turnEnemyFacing(enemy, Math.atan2(player.y - enemy.y, player.x - enemy.x), dt, 5.5);

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
    if (!this.isWeaponOwned(w)) return;
    const dmgMult = (now < this.player.berserkUntil ? 2.0 : 1.0) * (1 + (this.weaponDamageBonus || 0));

    // Alerta por sonido a los demonios cercanos al disparar
    this.alertNearbyEnemies(this.player.x, this.player.y, w === 4 ? 7 : 15);

    if (w === 4) {
      this.shotUntil = now + CONFIG.CHAINSAW_COOLDOWN_MS;
      this.shotStartTime = now;
      this.recoil = 0.22;
      this.muzzleFlash = Math.max(this.muzzleFlash, 0.32);
      this.audio.playChainsaw();

      let hitTarget = false;
      for (const gen of this.generators) {
        if (gen.alive && distance(this.player.x, this.player.y, gen.x, gen.y) <= CONFIG.CHAINSAW_RANGE + 0.25) {
          this.damageGenerator(gen, CONFIG.CHAINSAW_DAMAGE * dmgMult, now);
          hitTarget = true;
          break;
        }
      }
      if (!hitTarget) {
        for (const pylon of this.arenaPylons) {
          if (!pylon.destroyed && pylon.active && distance(this.player.x, this.player.y, pylon.x, pylon.y) <= CONFIG.CHAINSAW_RANGE + 0.25) {
            this.damagePylon(pylon, CONFIG.CHAINSAW_DAMAGE * dmgMult, now);
            hitTarget = true;
            break;
          }
        }
      }

      let target = null;
      let bestDist = Infinity;
      for (const enemy of this.enemies) {
        if (!enemy.alive || enemy.dormantCloset) continue;
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
        const isGlory = target.gloryUntil > now;
        this.spawnBlood(target.x, target.y, 10);
        this.hitmarkerUntil = now + 100;
        if (now - this.lastHitmarkerSound > 80) {
          this.lastHitmarkerSound = now;
          this.audio.playHitmarker();
        }
        if (isGlory) {
          this.executeGloryKill(target, true);
        } else {
          this.applyEnemyDamage(target, CONFIG.CHAINSAW_DAMAGE * dmgMult, 'CHAINSAW', now);
        }
      } else if (!hitTarget) {
        const wallDist = Math.min(CONFIG.CHAINSAW_RANGE, this.zBuffer[Math.floor(this.worldW / 2)] || 1.4);
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

    // Armas de energía y explosivos [5] Lanzacohetes, [6] Rifle Plasma, [7] BFG-9000
    if (w === 5) {
      if (this.player.rockets <= 0) {
        this.audio.playEmptyClip();
        this.shotUntil = now + 260;
        this.onStatus('¡SIN COHETES! Busca cajas de munición, usa la Motosierra [4] o compra al Mercader [E]');
        return;
      }
      this.player.rockets -= 1;
      this.shotUntil = now + CONFIG.ROCKET_COOLDOWN_MS;
      this.shotStartTime = now;
      this.recoil = 1.05;
      this.muzzleFlash = 1.0;
      this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.06 : 0.22);
      this.audio.playRocketLauncher();
      const ang = this.player.angle;
      this.playerProjectiles.push({
        kind: 'ROCKET',
        x: this.player.x + Math.cos(ang) * 0.35,
        y: this.player.y + Math.sin(ang) * 0.35,
        vx: Math.cos(ang) * CONFIG.ROCKET_SPEED,
        vy: Math.sin(ang) * CONFIG.ROCKET_SPEED,
        damage: CONFIG.ROCKET_DAMAGE * dmgMult,
        life: 3.2,
        sprite: this.rocketSprites?.[0]
      });
      return;
    }

    if (w === 6) {
      if (this.player.cells < CONFIG.PLASMA_CELL_COST) {
        this.audio.playEmptyClip();
        this.shotUntil = now + 220;
        this.onStatus('¡SIN CÉLULAS DE ENERGÍA! Compra al Mercader [E] o abre cofres');
        return;
      }
      this.player.cells -= CONFIG.PLASMA_CELL_COST;
      this.shotUntil = now + CONFIG.PLASMA_COOLDOWN_MS;
      this.shotStartTime = now;
      this.recoil = 0.38;
      this.muzzleFlash = 0.85;
      this.audio.playPlasma();
      const ang = this.player.angle + (Math.random() - 0.5) * 0.025;
      this.playerProjectiles.push({
        kind: 'PLASMA',
        x: this.player.x + Math.cos(ang) * 0.32,
        y: this.player.y + Math.sin(ang) * 0.32,
        vx: Math.cos(ang) * CONFIG.PLASMA_SPEED,
        vy: Math.sin(ang) * CONFIG.PLASMA_SPEED,
        damage: CONFIG.PLASMA_DAMAGE * dmgMult,
        life: 2.0,
        sprite: this.plasmaSprites?.[0]
      });
      return;
    }

    if (w === 7) {
      if (this.player.cells < CONFIG.BFG_CELL_COST) {
        this.audio.playEmptyClip();
        this.shotUntil = now + 350;
        this.onStatus(`¡BFG-9000 NECESITA ${CONFIG.BFG_CELL_COST} CÉLULAS DE ENERGÍA!`);
        return;
      }
      this.player.cells -= CONFIG.BFG_CELL_COST;
      this.shotUntil = now + CONFIG.BFG_COOLDOWN_MS;
      this.shotStartTime = now;
      this.recoil = 1.25;
      this.muzzleFlash = 1.15;
      this.screenShake = Math.max(this.screenShake, this.reducedEffects ? 0.1 : 0.35);
      this.audio.playPlasma();
      this.audio.playBossAwaken();
      const ang = this.player.angle;
      this.playerProjectiles.push({
        kind: 'BFG',
        x: this.player.x + Math.cos(ang) * 0.4,
        y: this.player.y + Math.sin(ang) * 0.4,
        vx: Math.cos(ang) * CONFIG.BFG_SPEED,
        vy: Math.sin(ang) * CONFIG.BFG_SPEED,
        damage: CONFIG.BFG_DAMAGE * dmgMult,
        dmgMult,
        zapTimer: 0.05,
        life: 3.4,
        sprite: this.bfgSprites?.[0]
      });
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
    const hitGenSet = new Set();
    const hitPylonSet = new Set();
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

      // Impacto en Generadores, Pilones y Núcleo de Fusión
      for (const gen of this.generators) {
        if (!gen.alive) continue;
        const gd = distance(this.player.x, this.player.y, gen.x, gen.y);
        if (gd > 17) continue;
        const gAng = Math.atan2(gen.y - this.player.y, gen.x - this.player.x);
        const gDelta = Math.abs(Math.atan2(Math.sin(gAng - rayAngle), Math.cos(gAng - rayAngle)));
        if (gDelta < Math.max(0.06, 0.25 / Math.max(1, gd)) && this.lineOfSight(this.player.x, this.player.y, gen.x, gen.y)) {
          hitGenSet.add(gen);
        }
      }
      for (const pylon of this.arenaPylons) {
        if (pylon.destroyed || !pylon.active) continue;
        const pd = distance(this.player.x, this.player.y, pylon.x, pylon.y);
        if (pd > 18) continue;
        const pAng = Math.atan2(pylon.y - this.player.y, pylon.x - this.player.x);
        const pDelta = Math.abs(Math.atan2(Math.sin(pAng - rayAngle), Math.cos(pAng - rayAngle)));
        if (pDelta < Math.max(0.06, 0.25 / Math.max(1, pd)) && this.lineOfSight(this.player.x, this.player.y, pylon.x, pylon.y)) {
          hitPylonSet.add(pylon);
        }
      }
      if (this.escapeCore && !this.escapeCore.triggered) {
        const cd = distance(this.player.x, this.player.y, this.escapeCore.x, this.escapeCore.y);
        if (cd < 16) {
          const cAng = Math.atan2(this.escapeCore.y - this.player.y, this.escapeCore.x - this.player.x);
          const cDelta = Math.abs(Math.atan2(Math.sin(cAng - rayAngle), Math.cos(cAng - rayAngle)));
          if (cDelta < Math.max(0.06, 0.24 / Math.max(1, cd)) && this.lineOfSight(this.player.x, this.player.y, this.escapeCore.x, this.escapeCore.y)) {
            this.triggerEscapeCountdown(now);
          }
        }
      }

      let selected = null;
      let bestEnemyDist = Infinity;
      for (const enemy of this.enemies) {
        if (!enemy.alive || enemy.dormantCloset) continue;
        const dist = distance(this.player.x, this.player.y, enemy.x, enemy.y);
        if (dist >= 18 || dist >= bestEnemyDist) continue;
        const angle = Math.atan2(enemy.y - this.player.y, enemy.x - this.player.x);
        const delta = Math.abs(Math.atan2(Math.sin(angle - rayAngle), Math.cos(angle - rayAngle)));
        const cone = enemy.isBoss ? 0.36 : (isChaingun ? 0.16 : 0.26);
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
        const colX = clamp(Math.floor(this.worldW / 2 + ratio * 48 * this.renderScale), 0, this.worldW - 1);
        const wallDist = Math.min(12, this.zBuffer[colX] || 4);
        const hx = this.player.x + Math.cos(rayAngle) * (wallDist - 0.15);
        const hy = this.player.y + Math.sin(rayAngle) * (wallDist - 0.15);
        this.spawnWallSparks(hx, hy, 1);
      }
    }

    const baseObjDmg = isChaingun ? CONFIG.CHAINGUN_DAMAGE * 2 : CONFIG.SHOTGUN_PELLET_DAMAGE * 4;
    for (const gen of hitGenSet) this.damageGenerator(gen, baseObjDmg * dmgMult, now);
    for (const pylon of hitPylonSet) this.damagePylon(pylon, baseObjDmg * dmgMult, now);

    if (shieldBlocked && hitMap.size === 0) {
      if (now - this.lastShieldBlockAt > 140) {
        this.lastShieldBlockAt = now;
        this.audio.playShieldBlock();
      }
      if (now - (this.lastShieldStatusAt || 0) > 1100) {
        this.lastShieldStatusAt = now;
        this.onStatus('🛡️ EL DEMONIO CON ESCUDO BLOQUEA EL FUEGO FRONTAL: rodéalo, quémalo o usa Plasma/Motosierra');
      }
      this.hitmarkerUntil = now + 80;
    }

    if (hitMap.size > 0 || hitAnyBarrel || hitGenSet.size > 0 || hitPylonSet.size > 0) {
      this.hitmarkerUntil = now + 110;
      if (now - this.lastHitmarkerSound > 70) {
        this.lastHitmarkerSound = now;
        this.audio.playHitmarker();
      }
    }

    for (const [selected, info] of hitMap.entries()) {
      if (!selected.alive) continue;
      const pelletDmg = isChaingun ? CONFIG.CHAINGUN_DAMAGE : (CONFIG.SHOTGUN_PELLET_DAMAGE || 0.44);
      const closeBonus = !isChaingun && info.dist < 4.2 ? 1.32 : 1.0;
      const totalDmg = pelletDmg * info.pellets * closeBonus * dmgMult;
      this.spawnBlood(selected.x, selected.y, isChaingun ? 8 : Math.min(18, 4 + info.pellets * 2));
      const died = this.applyEnemyDamage(selected, totalDmg, 'SHOT', now);

      if (!died && selected.alive) {
        const dodgeChance = 0.1 + ((this.level - 1) / Math.max(1, MAX_LEVELS - 1)) * 0.38;
        if (selected.isBoss && selected.bossState === 'CHASE' && selected.reactDashCd <= 0 && Math.random() < dodgeChance) {
          selected.reactDashCd = 2.8 - ((this.level - 1) / Math.max(1, MAX_LEVELS - 1)) * 1.3;
          const toX = (this.player.x - selected.x) / Math.max(0.001, info.dist);
          const toY = (this.player.y - selected.y) / Math.max(0.001, info.dist);
          this.triggerBossDash(selected, toX, toY, 'LATERAL');
        } else if (!isChaingun && Math.random() < (selected.painChance || 0.45)) {
          selected.painTimer = 0.22;
        }
      }
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
    this.keys.clear();
    this.wasPointerLocked = false;
    this.safeExitPointerLock();
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
    this.setLogicalTransform();
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
      c.fillText(`${m.icon || '★'} ${m.name}`, bx + 5, by + 8, 128);
      c.font = '5.6px monospace';
      c.fillStyle = '#d8d2c5';
      c.fillText(m.desc, bx + 5, by + 16, 128);
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
    this.keys.clear();
    this.wasPointerLocked = false;
    this.safeExitPointerLock();
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
    this.setLogicalTransform();
    const c = this.ctx;
    c.fillStyle = '#090103';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

    // Cortinas orgánicas de sangre arterial coagulada cayendo en cascada realista
    const tSec = now * 0.001;
    const strands = 54;
    for (let i = 0; i < strands; i++) {
      const bx = i * 6 + ((i * 7) % 3);
      const w = 3 + ((i * 11) % 4);
      const dripProg = Math.min(1, (tSec * 0.45 + (i * 0.17)) % 1.35);
      const baseLen = 14 + ((i * 37) % 58) + Math.sin(tSec * 2.2 + i * 1.7) * 5;
      const len = Math.min(VIEW_HEIGHT - 12, baseLen + dripProg * 28);
      // Borde oscuro coagulado
      c.fillStyle = 'rgba(72, 2, 10, 0.88)';
      c.fillRect(bx, 0, w, len);
      // Núcleo venoso
      c.fillStyle = 'rgba(138, 4, 22, 0.84)';
      c.fillRect(bx + 1, 0, Math.max(1, w - 2), len - 2);
      // Brillo arterial húmedo
      c.fillStyle = 'rgba(218, 18, 44, 0.72)';
      c.fillRect(bx + 1, Math.max(0, len - 10), Math.max(1, w - 2), 6);
      // Gota esférica brillante en la punta
      c.fillStyle = '#ff384c';
      c.fillRect(bx + Math.floor(w / 3), Math.max(0, len - 3), Math.max(2, Math.floor(w / 2)), 3);
      if (i % 3 === 0) {
        c.fillStyle = '#ff8a95';
        c.fillRect(bx + Math.floor(w / 3), Math.max(0, len - 3), 1, 1);
      }
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

    c.font = 'bold 7.2px monospace';
    c.fillStyle = '#ffbe0b';
    const secName = this.currentTheme?.name || CONFIG.SECTOR_NAMES[(this.level - 1) % CONFIG.SECTOR_NAMES.length];
    const callsign = this.characterProfile?.callsign || 'MARINE';
    c.fillText(`${callsign} CAÍDO EN SECTOR ${String(this.level).padStart(2, '0')} · ${secName}`, WIDTH / 2, 58);

    const pts = this.player.kills * 100 + Math.min(this.bonusPoints, this.player.kills * 250);
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
      c.fillText(`${m.icon || '★'} ${m.name}`, bx + 5, by + 8, 126);
      c.font = '5.6px monospace';
      c.fillStyle = '#d8d2c5';
      c.fillText(m.desc, bx + 5, by + 16, 126);
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
    this.keys.clear();
    this.wasPointerLocked = false;
    this.audio.stopAmbience();
    globalDoomMusic.stopMatch();
    if (this.frameId) cancelAnimationFrame(this.frameId);
    this.safeExitPointerLock();
    const now = performance.now();
    const medals = this.computeMedals(won);
    this.earnedMedals = medals;
    if (won) {
      this.drawVictoryScreen(now);
    } else {
      this.drawDeathScreen(now);
    }
    this.drawHUD(now);
    const cappedBonus = Math.min(Math.max(0, Math.round(this.bonusPoints)), this.player.kills * 250);
    this.onStatus(won ? '¡LOS 10 SECTORES CONQUISTADOS! Partida guardada' : 'MUERTO // Agente caído — Partida guardada');
    this.onFinish({
      won,
      level: this.level,
      kills: this.player.kills,
      bonusPoints: cappedBonus,
      points: this.player.kills * 100 + cappedBonus,
      durationMs: Math.max(1000, Math.round(now - this.startTime)),
      medals,
      characterName: this.characterProfile?.callsign || 'MARCUS VANE',
      characterGender: this.characterGender,
      runStats: { ...this.runStats }
    });
  }

  loop(now) {
    if (!this.running || this.paused || this.finished) return;
    const dt = clamp((now - this.lastTime) / 1000, 0, 0.045);
    this.lastTime = now;
    try {
      this.update(dt, now);
      if (!this.finished) {
        this.setLogicalTransform();
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
      }
    } catch (err) {
      console.error('HELLFALL loop error recovered:', err);
    }
    if (!this.finished && this.running && !this.paused) {
      this.frameId = requestAnimationFrame(this.boundLoop);
    }
  }

  drawBriefingScreen(now = performance.now()) {
    this.setLogicalTransform();
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
    c.font = 'bold 9.5px monospace';
    c.fillStyle = '#ffbe0b';
    const charLabel = this.characterProfile?.callsign || 'MARCUS VANE';
    c.fillText(`HELLFALL // MANUAL TÁCTICO · ${charLabel}`, WIDTH / 2, 15.5);

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
      ['[1]-[4]', 'Escopeta/Chain/Flamer/Sierra'],
      ['[5]-[7]', 'Cohetes / Plasma / BFG-9000'],
      ['[V / Clic Der]', 'Puñetazo (empuja/estampa)'],
      ['[E] Interactuar', 'Puertas/Cofres/VIP/Núcleo'],
      ['[C] Embestida', 'Dash (Altar de Mejoras)'],
      ['[TAB] / [F]', 'Automapa / Pant. Completa'],
      ['[ESC] / [H]', 'Pausa y Ajustes / Ayuda']
    ];
    controls.forEach(([key, desc], idx) => {
      const y = 39 + idx * 8.8;
      c.font = 'bold 5.3px monospace';
      c.fillStyle = '#ffbe0b';
      c.fillText(key, 14, y);
      c.font = '5.1px monospace';
      c.fillStyle = '#fff3b0';
      c.fillText(desc, 68, y);
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
      { title: '1. ENCUENTRA ARSENAL [1-7]:', l1: 'Empiezas con Super Escopeta.', l2: 'Busca pedestales de armas y cofres.' },
      { title: '2. MERCADER DE ALMAS:', l1: 'Compra munición pesada [1-7],', l2: 'blindaje, vida o +12% daño.' },
      { title: '3. MISIONES Y RUTAS:', l1: 'Reactores, oleadas, escolta VIP,', l2: 'cuenta atrás, 3 llaves y puertas.' },
      { title: '4. DIRECTOR Y JEFES:', l1: 'Cuidado con emboscadas ocultas.', l2: 'Sector 10: ICON OF SIN en 3 fases.' }
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
    this.setLogicalTransform();
    this.drawBriefingScreen(performance.now());
    const c = this.ctx;
    c.fillStyle = '#2b1214';
    c.fillRect(0, VIEW_HEIGHT, WIDTH, HUD_HEIGHT);
  }

  /** Precalcula hasta 6 luces puntuales activas más cercanas al jugador (cero allocs). */
  collectActiveLights(px, py) {
    const out = this._activeLights;
    out.length = 0;
    const addLight = (x, y, rad, r, g, b, intensity) => {
      const dx = x - px;
      const dy = y - py;
      const d = Math.hypot(dx, dy);
      if (d > 14 + rad) return;
      if (out.length < 6) {
        out.push({ x, y, rad, r, g, b, intensity, playerDist: d, invRad2: 1 / (rad * rad) });
      } else {
        let maxIdx = 0;
        for (let i = 1; i < out.length; i++) {
          if (out[i].playerDist > out[maxIdx].playerDist) maxIdx = i;
        }
        if (d < out[maxIdx].playerDist) {
          out[maxIdx].x = x;
          out[maxIdx].y = y;
          out[maxIdx].rad = rad;
          out[maxIdx].r = r;
          out[maxIdx].g = g;
          out[maxIdx].b = b;
          out[maxIdx].intensity = intensity;
          out[maxIdx].playerDist = d;
          out[maxIdx].invRad2 = 1 / (rad * rad);
        }
      }
    };

    if (this.muzzleFlash > 0.08) {
      addLight(px, py, 6.2, 1.0, 0.72, 0.25, this.muzzleFlash * 0.95);
    }
    for (let i = 0; i < this.fireProps.length; i++) {
      const f = this.fireProps[i];
      addLight(f.x, f.y, 4.6, 1.0, 0.42, 0.08, 0.78);
    }
    for (let i = 0; i < this.flameProjectiles.length; i++) {
      const fp = this.flameProjectiles[i];
      addLight(fp.x, fp.y, 3.6, 1.0, 0.5, 0.1, 0.72);
    }
    for (let i = 0; i < this.enemyProjectiles.length; i++) {
      const ep = this.enemyProjectiles[i];
      if (ep.ownerKind === 'SUMMONER' || ep.ownerKind === 'BRUTE') {
        addLight(ep.x, ep.y, 3.8, 0.45, 0.95, 0.05, 0.75);
      } else if (ep.ownerKind === 'CACODEMON' || ep.ownerKind === 'SHIELD') {
        addLight(ep.x, ep.y, 3.8, 0.05, 0.75, 0.95, 0.75);
      } else if (ep.ownerKind && ep.ownerKind.startsWith('BOSS')) {
        addLight(ep.x, ep.y, 4.2, 1.0, 0.15, 0.45, 0.85);
      } else {
        addLight(ep.x, ep.y, 3.6, 1.0, 0.48, 0.08, 0.72);
      }
    }
    return out;
  }

  renderWorld(now) {
    const c = this.ctx;
    const S = this.renderScale;
    const W = this.worldW;
    const H = this.worldH;
    const px = this.player.x;
    const py = this.player.y;
    const dirX = Math.cos(this.player.angle);
    const dirY = Math.sin(this.player.angle);
    const planeX = -dirY * FOV_PLANE;
    const planeY = dirX * FOV_PLANE;
    const effShake = this.reducedEffects ? this.screenShake * 0.25 : this.screenShake;
    const shakeY = effShake > 0 ? Math.round((Math.random() - 0.5) * effShake * 10) : 0;
    const horizon = clamp(Math.floor(VIEW_HEIGHT / 2) + shakeY, 44, VIEW_HEIGHT - 44);
    const horizonPx = Math.round(horizon * S);

    const floorPixels = this.floorPixels;
    const ceilingPixels = this.ceilingPixels;
    const sceneData = this.sceneImageData.data;
    const rayDirX0 = dirX - planeX;
    const rayDirY0 = dirY - planeY;
    const rayDirX1 = dirX + planeX;
    const rayDirY1 = dirY + planeY;
    const fireDrift = Math.floor(now * 0.028);
    const flicker = this.reducedEffects ? 0.96 : (0.93 + Math.sin(now * 0.018) * 0.07);
    const darknessEvent = this.sectorEvent?.type === 'DARKNESS';
    const bloodFogEvent = this.sectorEvent?.type === 'BLOOD_FOG';
    const useDither = CONFIG.ENABLE_DITHER && !this.reducedEffects;

    const theme = this.currentTheme || CONFIG.SECTOR_THEMES[0];
    const tTint = theme.tint || [255, 255, 255];
    const tMulR = 0.86 + (tTint[0] / 255) * 0.14;
    const tMulG = 0.86 + (tTint[1] / 255) * 0.14;
    const tMulB = 0.86 + (tTint[2] / 255) * 0.14;
    const tFog = darknessEvent ? [4, 2, 3] : (bloodFogEvent ? [58, 6, 14] : (theme.fog || [20, 7, 8]));
    const fogR = tFog[0];
    const fogG = tFog[1];
    const fogB = tFog[2];

    const lights = this.collectActiveLights(px, py);
    const nLights = lights.length;
    const rowLights = [];
    const colStart = this._colStart;
    const colEnd = this._colEnd;

    // 1. Columnas de paredes primero sobre ImageData (llena zBuffer y límites verticales por columna)
    const wallFalloff = darknessEvent ? 0.34 : (bloodFogEvent ? 0.105 : 0.052);
    const wallMin = darknessEvent ? 0.012 : 0.18;
    const wallFogSpan = darknessEvent ? 0.22 : (bloodFogEvent ? 0.085 : 0.042);
    const fogMax = darknessEvent ? 0.95 : (bloodFogEvent ? 0.86 : 0.72);
    const doorLockPulse = !this.player.hasKey ? (0.32 + 0.14 * Math.sin(now * 0.014)) : 0;
    const aoBand = Math.max(2, Math.round(2 * S));

    for (let x = 0; x < W; x++) {
      const camX = (2 * x) / W - 1;
      const rdx = dirX + planeX * camX;
      const rdy = dirY + planeY * camX;
      let mapX = Math.floor(px);
      let mapY = Math.floor(py);
      const ddx = Math.abs(1 / (rdx || 0.00001));
      const ddy = Math.abs(1 / (rdy || 0.00001));
      let sdx = rdx < 0 ? (px - mapX) * ddx : (mapX + 1 - px) * ddx;
      let sdy = rdy < 0 ? (py - mapY) * ddy : (mapY + 1 - py) * ddy;
      const stepX = rdx < 0 ? -1 : 1;
      const stepY = rdy < 0 ? -1 : 1;
      let side = 0;
      let steps = 0;
      let doorOffset = 0;
      let passedThroughDoor = false;

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
      const wallH = Math.min(H * 3, Math.floor((H * WALL_SCALE) / wallDist));
      const rawTop = horizonPx - wallH / 2;
      const drawStart = Math.max(0, Math.floor(rawTop));
      const drawEnd = Math.min(H - 1, Math.floor(horizonPx + wallH / 2));
      colStart[x] = drawStart;
      colEnd[x] = drawEnd;

      let wallX = side === 0 ? py + wallDist * rdy : px + wallDist * rdx;
      wallX = wallX - Math.floor(wallX) - doorOffset;
      let texX = clamp(Math.floor(wallX * 64), 0, 63);
      const rawTile = Number(this.map[mapY]?.[mapX] || '1');
      if (rawTile !== 6 && rawTile !== 7 && ((side === 0 && rdx > 0) || (side === 1 && rdy < 0))) {
        texX = 63 - texX;
      }
      const texPix = this.texturePixels[rawTile] || this.texturePixels[1];

      const sectorFlicker = rawTile === 3 && !this.reducedEffects ? 0.14 * Math.sin(now * 0.025 + mapX) : 0;
      const baseLight = clamp(1 - wallDist * wallFalloff + sectorFlicker, wallMin, 0.98) * (side === 1 ? 0.76 : 1);

      const wallWx = px + wallDist * rdx;
      const wallWy = py + wallDist * rdy;
      let colR = baseLight;
      let colG = baseLight;
      let colB = baseLight;
      let lightBoost = 0;
      for (let li = 0; li < nLights; li++) {
        const L = lights[li];
        const lx = wallWx - L.x;
        const ly = wallWy - L.y;
        const d2 = lx * lx + ly * ly;
        const norm = 1 - d2 * L.invRad2;
        if (norm > 0) {
          const contrib = norm * L.intensity;
          colR += L.r * contrib;
          colG += L.g * contrib;
          colB += L.b * contrib;
          lightBoost += contrib;
        }
      }

      const rawFog = (wallDist - 1.8) * wallFogSpan;
      const clampedFog = rawFog > fogMax ? fogMax : (rawFog < 0 ? 0 : rawFog);
      const fMix = clampedFog * (lightBoost > 0 ? Math.max(0.22, 1 - lightBoost * 0.5) : 1);
      const invF = 1 - fMix;
      const lockedRed = (rawTile === 4 || rawTile === 5) && !this.player.hasKey ? doorLockPulse : 0;
      const doorCyan = passedThroughDoor && wallDist < 6 ? 0.06 : 0;
      const hasAO = (drawEnd - drawStart) > 8 * S;
      const texStep = 64 / Math.max(1, wallH);
      let texPos = (drawStart - rawTop) * texStep;
      const wMulR = tMulR * colR * invF;
      const wMulG = tMulG * colG * invF;
      const wMulB = tMulB * colB * invF;
      const fAddR = fogR * fMix;
      const fAddG = fogG * fMix;
      const fAddB = fogB * fMix;

      for (let y = drawStart; y <= drawEnd; y++) {
        const texY = Math.floor(texPos) & 63;
        texPos += texStep;
        const srcIdx = (texY * 64 + texX) * 4;
        const ao = (hasAO && (y - drawStart < aoBand || drawEnd - y < aoBand)) ? 0.58 : 1;
        const dth = useDither ? BAYER_4X4[((y & 3) << 2) | (x & 3)] : 0;

        let rr = texPix[srcIdx] * wMulR * ao + fAddR + dth;
        let gg = texPix[srcIdx + 1] * wMulG * ao + fAddG + dth;
        let bb = texPix[srcIdx + 2] * wMulB * ao + fAddB + dth;

        if (lockedRed > 0) {
          rr = rr * (1 - lockedRed) + 217 * lockedRed;
          gg = gg * (1 - lockedRed) + 4 * lockedRed;
          bb = bb * (1 - lockedRed) + 41 * lockedRed;
        } else if (doorCyan > 0) {
          gg = gg * (1 - doorCyan) + 245 * doorCyan;
          bb = bb * (1 - doorCyan) + 212 * doorCyan;
        }

        const outIdx = (y * W + x) * 4;
        sceneData[outIdx] = rr > 255 ? 255 : (rr < 0 ? 0 : rr);
        sceneData[outIdx + 1] = gg > 255 ? 255 : (gg < 0 ? 0 : gg);
        sceneData[outIdx + 2] = bb > 255 ? 255 : (bb < 0 ? 0 : bb);
        sceneData[outIdx + 3] = 255;
      }
    }

    // 2. Suelo y techo omitiendo los píxeles ya ocluidos por muros (~60% menos trabajo)
    const maxP = Math.max(horizonPx, H - horizonPx);
    const rowFalloff = darknessEvent ? 0.34 : (bloodFogEvent ? 0.11 : 0.055);
    const rowMin = darknessEvent ? 0.015 : 0.2;
    const fogSpan = darknessEvent ? 0.22 : (bloodFogEvent ? 0.088 : 0.044);

    for (let p = 1; p <= maxP; p++) {
      const rowDist = (0.5 * H * WALL_SCALE) / p;
      const stepX = (rowDist * (rayDirX1 - rayDirX0)) / W;
      const stepY = (rowDist * (rayDirY1 - rayDirY0)) / W;
      let wx = px + rowDist * rayDirX0;
      let wy = py + rowDist * rayDirY0;
      const rawS = (1 - rowDist * rowFalloff);
      const shade = ((rawS > 0.95 ? 0.95 : (rawS < rowMin ? rowMin : rawS)) * flicker);
      const rawFM = (rowDist - 1.8) * fogSpan;
      const baseFogMix = rawFM > fogMax ? fogMax : (rawFM < 0 ? 0 : rawFM);
      const yFloor = horizonPx + p - 1;
      const yCeil = horizonPx - p;
      const fRowOk = yFloor >= 0 && yFloor < H;
      const cRowOk = yCeil >= 0 && yCeil < H;
      const yFloorOff = yFloor * W;
      const yCeilOff = yCeil * W;

      rowLights.length = 0;
      for (let li = 0; li < nLights; li++) {
        const L = lights[li];
        if (Math.abs(rowDist - L.playerDist) <= L.rad) {
          rowLights.push(L);
        }
      }
      const nRL = rowLights.length;

      for (let x = 0; x < W; x++) {
        const doF = fRowOk && yFloor > colEnd[x];
        const doC = cRowOk && yCeil < colStart[x];
        if (!doF && !doC) {
          wx += stepX;
          wy += stepY;
          continue;
        }

        const cellX = Math.floor(wx);
        const cellY = Math.floor(wy);
        const tx = Math.floor(64 * (wx - cellX)) & 63;
        const ty = Math.floor(64 * (wy - cellY)) & 63;

        let lR = shade;
        let lG = shade;
        let lB = shade;
        let boost = 0;
        for (let li = 0; li < nRL; li++) {
          const L = rowLights[li];
          const lx = wx - L.x;
          const ly = wy - L.y;
          if (lx > -L.rad && lx < L.rad && ly > -L.rad && ly < L.rad) {
            const d2 = lx * lx + ly * ly;
            const norm = 1 - d2 * L.invRad2;
            if (norm > 0) {
              const contrib = norm * L.intensity;
              lR += L.r * contrib;
              lG += L.g * contrib;
              lB += L.b * contrib;
              boost += contrib;
            }
          }
        }
        const fMix = baseFogMix * (boost > 0 ? Math.max(0.25, 1 - boost * 0.5) : 1);
        const invF = 1 - fMix;
        const pMulR = tMulR * lR * invF;
        const pMulG = tMulG * lG * invF;
        const pMulB = tMulB * lB * invF;
        const pAddR = fogR * fMix;
        const pAddG = fogG * fMix;
        const pAddB = fogB * fMix;

        if (doF) {
          const isLavaVein = (tx >= 29 && tx <= 34) || (ty >= 29 && ty <= 34);
          const ftx = isLavaVein ? (tx + fireDrift) & 63 : tx;
          const fty = isLavaVein ? (ty + fireDrift) & 63 : ty;
          const fIdx = (fty * 64 + ftx) * 4;
          const outF = (yFloorOff + x) * 4;
          const dth = useDither ? BAYER_4X4[((yFloor & 3) << 2) | (x & 3)] : 0;
          const rr = floorPixels[fIdx] * pMulR + pAddR + dth;
          const gg = floorPixels[fIdx + 1] * pMulG + pAddG + dth;
          const bb = floorPixels[fIdx + 2] * pMulB + pAddB + dth;
          sceneData[outF] = rr > 255 ? 255 : (rr < 0 ? 0 : rr);
          sceneData[outF + 1] = gg > 255 ? 255 : (gg < 0 ? 0 : gg);
          sceneData[outF + 2] = bb > 255 ? 255 : (bb < 0 ? 0 : bb);
          sceneData[outF + 3] = 255;
        }
        if (doC) {
          const isFire = tx > 4 && tx < 28 && ty > 4 && ty < 28;
          const cxT = isFire ? (tx + fireDrift) & 63 : tx;
          const cyT = isFire ? (ty + (fireDrift >> 1)) & 63 : ty;
          const cIdx = (cyT * 64 + cxT) * 4;
          const outC = (yCeilOff + x) * 4;
          const dth = useDither ? BAYER_4X4[((yCeil & 3) << 2) | (x & 3)] : 0;
          const rr = ceilingPixels[cIdx] * pMulR + pAddR + dth;
          const gg = ceilingPixels[cIdx + 1] * pMulG + pAddG + dth;
          const bb = ceilingPixels[cIdx + 2] * pMulB + pAddB + dth;
          sceneData[outC] = rr > 255 ? 255 : (rr < 0 ? 0 : rr);
          sceneData[outC + 1] = gg > 255 ? 255 : (gg < 0 ? 0 : gg);
          sceneData[outC + 2] = bb > 255 ? 255 : (bb < 0 ? 0 : bb);
          sceneData[outC + 3] = 255;
        }
        wx += stepX;
        wy += stepY;
      }
    }

    this.resetIdentityTransform();
    c.putImageData(this.sceneImageData, 0, 0);
    this.setLogicalTransform();

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
    const txt = `${arrow} ${label} ${dist}m`;

    c.font = 'bold 6.5px monospace';
    const textW = Math.ceil(c.measureText(txt).width);
    const boxW = textW + 10;
    const bounds = this._topBarBounds || { leftEnd: 112, rightStart: 256 };
    const availW = bounds.rightStart - bounds.leftEnd;
    if (availW < boxW) return;

    const centerBounds = (bounds.leftEnd + bounds.rightStart) / 2;
    const maxShift = Math.max(0, (availW - boxW) / 2);
    const cx = centerBounds + clamp(rel / 1.1, -1, 1) * Math.min(18, maxShift);
    const boxX = Math.floor(cx - boxW / 2);

    c.fillStyle = 'rgba(16, 6, 8, 0.85)';
    c.fillRect(boxX, 4, boxW, 14);
    c.strokeStyle = color;
    c.lineWidth = 1;
    c.strokeRect(boxX, 4, boxW, 14);

    c.fillStyle = color;
    c.textAlign = 'center';
    c.fillText(txt, cx, 13.5);
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
    const phaseTag = activeBoss.isFinalIcon ? ` · FASE ${['I', 'II', 'III'][(activeBoss.phase || 1) - 1]}` : '';
    const title = `${activeBoss.kind}${phaseTag}${activeBoss.enraged ? ' · FURIA' : ''}`;
    c.font = 'bold 6.2px monospace';
    const barW = clamp(Math.ceil(c.measureText(title).width) + 28, 134, 210);
    const barH = 10;
    const bx = Math.floor((WIDTH - barW) / 2);
    const by = 21;

    c.fillStyle = 'rgba(14, 4, 6, 0.9)';
    c.fillRect(bx - 2, by - 1, barW + 4, barH + 8);
    c.strokeStyle = activeBoss.shieldActive ? '#00f5d4' : (activeBoss.enraged ? '#ff0055' : (activeBoss.holdsKey ? '#ffd700' : '#d90429'));
    c.lineWidth = 1;
    c.strokeRect(bx - 1.5, by - 0.5, barW + 3, barH + 7);

    const ratio = clamp(activeBoss.health / activeBoss.maxHealth, 0, 1);
    c.fillStyle = '#26090d';
    c.fillRect(bx, by + 6, barW, 6);
    c.fillStyle = activeBoss.shieldActive ? '#00b4d8' : (activeBoss.enraged ? '#ff0055' : (activeBoss.holdsKey ? '#ffbe0b' : '#d90429'));
    c.fillRect(bx, by + 6, Math.floor(barW * ratio), 6);
    c.fillStyle = 'rgba(255, 255, 255, 0.25)';
    c.fillRect(bx, by + 6, Math.floor(barW * ratio), 2);

    c.textAlign = 'center';
    c.fillStyle = '#fff3b0';
    c.fillText(title, WIDTH / 2, by + 4.5);

    if (activeBoss.shieldActive) {
      c.font = 'bold 5.5px monospace';
      c.fillStyle = '#00f5d4';
      c.fillText('🛡️ ESCUDO ACTIVO — DESTRUYE LOS PILONES DE LAS ESQUINAS', WIDTH / 2, by + 23);
    }
  }

  drawBossAwakenBanner(now) {
    const b = this.bossAwakenBanner;
    if (!b || now >= b.until) return;
    const c = this.ctx;
    const alpha = clamp((b.until - now) / 400, 0, 1);
    const title = `⚠️ ${b.name} ⚠️`;
    c.save();
    c.globalAlpha = alpha;
    c.font = 'bold 9px monospace';
    const w1 = c.measureText(title).width;
    c.font = 'bold 6px monospace';
    const w2 = b.sub ? c.measureText(b.sub).width : 0;
    const boxW = clamp(Math.ceil(Math.max(w1, w2)) + 20, 130, WIDTH - 20);
    const boxX = Math.floor(WIDTH / 2 - boxW / 2);

    c.fillStyle = 'rgba(20, 4, 8, 0.92)';
    c.fillRect(boxX, 38, boxW, 24);
    c.strokeStyle = '#ff0055';
    c.lineWidth = 1.5;
    c.strokeRect(boxX, 38, boxW, 24);
    c.textAlign = 'center';
    c.font = 'bold 9px monospace';
    c.fillStyle = '#ffbe0b';
    c.fillText(title, WIDTH / 2, 48);
    c.font = 'bold 6px monospace';
    c.fillStyle = '#fff3b0';
    if (b.sub) c.fillText(b.sub, WIDTH / 2, 57);
    c.restore();
  }

  drawInteractionPrompt() {
    const c = this.ctx;
    let promptTxt = null;

    if (this.findGloryTarget()) {
      promptTxt = `[E] EJECUCIÓN (+${CONFIG.GLORY_HEAL} HP)`;
    }

    if (!promptTxt && this.vip && this.vip.alive && !this.vip.rescued && distance(this.player.x, this.player.y, this.vip.x, this.vip.y) < 2.5) {
      promptTxt = '[E] RESCATAR CIENTÍFICO VIP';
    }

    if (!promptTxt && this.escapeCore && !this.escapeCore.triggered && distance(this.player.x, this.player.y, this.escapeCore.x, this.escapeCore.y) < 2.6) {
      promptTxt = '☢️ [E] SABOTEAR NÚCLEO (65s ESCAPE)';
    }

    if (!promptTxt && this.survivalState && !this.survivalState.started && distance(this.player.x, this.player.y, this.survivalState.cx, this.survivalState.cy) < 2.8) {
      promptTxt = '⚔️ [E] INICIAR OLEADAS DE RESISTENCIA';
    }

    if (!promptTxt && this.merchant && distance(this.player.x, this.player.y, this.merchant.x, this.merchant.y) < 2.4) {
      promptTxt = '[E] MERCADER';
    }

    for (const chest of this.chests) {
      if (promptTxt) break;
      if (!chest.opened && distance(this.player.x, this.player.y, chest.x, chest.y) < 2.2) {
        promptTxt = '[E] ABRIR COFRE';
        break;
      }
    }
    if (!promptTxt) {
      for (const door of this.doors.values()) {
        if (door.open < 0.2 && distance(this.player.x, this.player.y, door.x + 0.5, door.y + 0.5) < 2.8) {
          promptTxt = door.isSecret
            ? '[E] MURO SECRETO'
            : (door.isBossGate
              ? '⚠️ [E] ARENA DEL BOSS'
              : (door.isMerchant ? '[E] SALA MERCADER' : '[E] ABRIR PUERTA'));
          break;
        }
      }
    }
    if (!promptTxt) return;

    c.font = 'bold 7px monospace';
    const textW = Math.ceil(c.measureText(promptTxt).width);
    const boxW = clamp(textW + 16, 72, WIDTH - 20);
    const boxX = Math.floor(WIDTH / 2 - boxW / 2);

    c.fillStyle = 'rgba(20, 7, 8, 0.88)';
    c.fillRect(boxX, VIEW_HEIGHT - 64, boxW, 14);
    c.strokeStyle = '#ffbe0b';
    c.lineWidth = 1;
    c.strokeRect(boxX, VIEW_HEIGHT - 64, boxW, 14);
    c.textAlign = 'center';
    c.fillStyle = '#fff3b0';
    c.fillText(promptTxt, WIDTH / 2, VIEW_HEIGHT - 54.5);
  }

  drawLootNotifications() {
    if (this.lootNotifications.length === 0) return;
    const c = this.ctx;
    // Solo muestra el aviso más reciente en la franja superior para mantener el visor limpio
    const notif = this.lootNotifications[0];
    const alpha = clamp(notif.timer / 0.6, 0, 1);

    c.save();
    c.globalAlpha = alpha;
    c.font = 'bold 7px monospace';
    let maxW = c.measureText(notif.title).width;
    c.font = 'bold 6.4px monospace';
    for (let i = 0; i < Math.min(2, notif.items.length); i++) {
      maxW = Math.max(maxW, c.measureText(notif.items[i]).width);
    }

    const linesToShow = notif.items.slice(0, 2);
    const boxW = clamp(Math.ceil(maxW) + 18, 86, WIDTH - 56);
    const boxH = 14 + linesToShow.length * 8.5;
    const boxX = Math.floor((WIDTH - boxW) / 2);
    const yOffset = 22;

    c.fillStyle = 'rgba(16, 6, 8, 0.9)';
    c.fillRect(boxX, yOffset, boxW, boxH);
    c.strokeStyle = notif.color;
    c.lineWidth = 1;
    c.strokeRect(boxX, yOffset, boxW, boxH);

    c.font = 'bold 7px monospace';
    c.textAlign = 'center';
    c.fillStyle = notif.color;
    c.fillText(notif.title, WIDTH / 2, yOffset + 9.5);

    c.font = 'bold 6.4px monospace';
    c.fillStyle = '#fff3b0';
    linesToShow.forEach((line, idx) => {
      c.fillText(line, WIDTH / 2, yOffset + 18.5 + idx * 8.5);
    });
    c.restore();
  }

  spriteDir(enemy) {
    const toPlayer = Math.atan2(this.player.y - enemy.y, this.player.x - enemy.x);
    const rel = Math.atan2(
      Math.sin((enemy.facingAngle || 0) - toPlayer),
      Math.cos((enemy.facingAngle || 0) - toPlayer)
    );
    return Math.round(((rel % (Math.PI * 2)) + Math.PI * 2) / (Math.PI * 0.25)) & 7;
  }

  _acquireBB(idx) {
    let slot = this._bbPool[idx];
    if (!slot) {
      slot = {
        x: 0, y: 0, distSq: 0, type: 'enemy', sprite: null, scale: 1, stepBounce: 0, zOffset: 0,
        floating: false, gloryReady: false, hitFlash: 0, wakeFlash: 0, isBoss: false, dormant: false,
        stunTimer: 0, shieldFlash: 0, bossState: '', dashTime: 0, burnTimer: 0, enraged: false,
        alive: false, health: 0, maxHealth: 1, holdsKey: false
      };
      this._bbPool[idx] = slot;
    }
    this._bbList[idx] = slot;
    return slot;
  }

  renderBillboards(dirX, dirY, planeX, planeY, horizon, now) {
    const c = this.ctx;
    const S = this.renderScale;
    const W = this.worldW;
    const H = this.worldH;
    const horizonPx = Math.round(horizon * S);
    const px = this.player.x;
    const py = this.player.y;
    const animFrame = Math.floor(now / 110) % 3;
    const pulseFrame = Math.floor(now / 220) % 2;
    const itemBob = Math.sin(now * 0.006) * 3;
    const darknessEvent = this.sectorEvent?.type === 'DARKNESS';

    this.resetIdentityTransform();
    const list = this._bbList;
    let count = 0;

    const pushItem = (x, y, type, sprite, scale, stepBounce = 0, zOffset = 0, objHpRatio = -1) => {
      if (!sprite) return;
      const o = this._acquireBB(count++);
      const dx = x - px;
      const dy = y - py;
      o.x = x;
      o.y = y;
      o.distSq = dx * dx + dy * dy;
      o.type = type;
      o.sprite = sprite;
      o.scale = scale;
      o.stepBounce = stepBounce;
      o.zOffset = zOffset;
      o.floating = false;
      o.gloryReady = false;
      o.hitFlash = 0;
      o.wakeFlash = 0;
      o.isBoss = false;
      o.dormant = false;
      o.stunTimer = 0;
      o.shieldFlash = 0;
      o.bossState = '';
      o.dashTime = 0;
      o.burnTimer = 0;
      o.enraged = false;
      o.alive = false;
      o.holdsKey = false;
      o.invisible = false;
      o.shieldActive = false;
      o.objHpRatio = objHpRatio;
    };

    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.dormantCloset) continue;
      let sprite;
      let stepBounce = 0;
      const dir = this.spriteDir(e);
      if (e.state === 'ALIVE') {
        if (e.isBoss && e.dormant) {
          sprite = e.anims.getWalk(dir, 0);
          stepBounce = 0;
        } else if (e.painTimer > 0 && e.anims.pain) {
          sprite = e.anims.getPain(dir);
        } else if (e.isBoss && (e.bossState === 'WINDUP' || e.bossState === 'CHARGE' || e.bossState === 'DASH')) {
          sprite = e.anims.getCharge(dir, Math.floor(now / 70) % 2);
        } else {
          const walkIdx = Math.floor(e.walkCycle) % 4;
          sprite = e.anims.getWalk(dir, walkIdx);
          stepBounce = e.movePattern === 'HOVER'
            ? -8 + Math.sin(now * 0.006 + e.walkCycle) * 5
            : (e.kind === 'LOST_SOUL' ? -6 + Math.sin(now * 0.01 + e.walkCycle) * 4 : ((walkIdx % 2 === 1) ? -2 : 0));
        }
      } else {
        sprite = e.anims.getDeath(clamp(Math.floor(e.deathTimer), 0, 3));
      }
      const o = this._acquireBB(count++);
      const dx = e.x - px;
      const dy = e.y - py;
      o.x = e.x;
      o.y = e.y;
      o.distSq = dx * dx + dy * dy;
      o.type = 'enemy';
      o.sprite = sprite;
      o.scale = e.scale || 0.95;
      o.stepBounce = stepBounce;
      o.zOffset = e.zOffset || 0;
      o.floating = e.kind === 'CACODEMON' || e.kind === 'LOST_SOUL';
      o.gloryReady = e.state === 'ALIVE' && now < (e.gloryUntil || 0);
      o.hitFlash = e.hitFlash || 0;
      o.wakeFlash = e.wakeFlash || 0;
      o.isBoss = !!e.isBoss;
      o.dormant = !!e.dormant;
      o.stunTimer = e.stunTimer || 0;
      o.shieldFlash = e.shieldFlash || 0;
      o.bossState = e.bossState || '';
      o.dashTime = e.dashTime || 0;
      o.burnTimer = e.burnTimer || 0;
      o.enraged = !!e.enraged;
      o.alive = !!e.alive;
      o.health = e.health;
      o.maxHealth = e.maxHealth;
      o.holdsKey = !!e.holdsKey;
      o.invisible = !!e.invisible && e.alive;
      o.shieldActive = !!e.shieldActive;
      o.objHpRatio = -1;
    }

    const barrels = this.barrels || [];
    for (let i = 0; i < barrels.length; i++) {
      const b = barrels[i];
      if (!b.exploded) pushItem(b.x, b.y, 'barrel', this.barrelSprites[(pulseFrame + Math.floor(b.phase || 0)) % 2], 0.68);
    }
    if (this.merchant) {
      pushItem(this.merchant.x, this.merchant.y, 'merchant', this.merchantSprites[pulseFrame], 1.05, Math.sin(now * 0.003) * 1.5);
    }
    for (let i = 0; i < this.coins.length; i++) {
      const cn = this.coins[i];
      if (cn.active) pushItem(cn.x, cn.y, 'coin', this.coinSprites[pulseFrame], 0.42, itemBob);
    }
    for (let i = 0; i < this.chests.length; i++) {
      const ch = this.chests[i];
      pushItem(ch.x, ch.y, 'chest', ch.opened ? this.chestOpenSprite : this.chestClosedSprite, 0.74);
    }
    if (this.keyItem && this.keyItem.active) {
      pushItem(this.keyItem.x, this.keyItem.y, 'key', this.keySprites[pulseFrame], 0.68, itemBob);
    }
    for (const ck of this.coloredKeys) {
      if (ck.active) pushItem(ck.x, ck.y, 'key', this.coloredKeySprites?.[ck.color]?.[pulseFrame] || this.keySprites[pulseFrame], 0.66, itemBob);
    }
    for (const wp of this.weaponPickups) {
      if (wp.active && this.weaponPickupSprites?.[wp.weaponId]) {
        pushItem(wp.x, wp.y, 'key', this.weaponPickupSprites[wp.weaponId][pulseFrame], 0.76, itemBob);
      }
    }
    for (const gen of this.generators) {
      if (gen.alive) {
        pushItem(gen.x, gen.y, 'barrel', this.generatorSprites?.alive?.[pulseFrame], 0.92, 0, 0, clamp(gen.hp / Math.max(1, gen.maxHp), 0, 1));
      }
    }
    for (const pyl of this.arenaPylons) {
      if (!pyl.destroyed) {
        const ratio = pyl.active ? clamp(pyl.hp / Math.max(1, pyl.maxHp), 0, 1) : -1;
        const pSprite = pyl.active ? this.pylonSprites?.active?.[pulseFrame] : this.pylonSprites?.inactive;
        pushItem(pyl.x, pyl.y, 'key', pSprite, 0.95, pyl.active ? itemBob * 0.5 : 0, 0, ratio);
      }
    }
    if (this.vip && this.vip.alive && this.vipSprites) {
      const vFrame = this.vip.rescued ? Math.floor(this.vip.walkCycle) % 2 : 0;
      const vSprite = (this.vip.rescued ? this.vipSprites.rescued : this.vipSprites.trapped)?.[vFrame];
      pushItem(this.vip.x, this.vip.y, 'merchant', vSprite, 0.78, 0, 0, clamp(this.vip.hp / Math.max(1, this.vip.maxHp), 0, 1));
    }
    if (this.escapeCore && this.coreSprites) {
      const cSprite = (this.escapeCore.triggered ? this.coreSprites.active : this.coreSprites.idle)?.[pulseFrame];
      pushItem(this.escapeCore.x, this.escapeCore.y, 'key', cSprite, 0.92);
    }
    for (let i = 0; i < this.armorPickups.length; i++) {
      const a = this.armorPickups[i];
      if (a.active) pushItem(a.x, a.y, 'armor', this.armorSprites[pulseFrame], 0.62, itemBob);
    }
    for (let i = 0; i < this.powerups.length; i++) {
      const p = this.powerups[i];
      if (p.active) pushItem(p.x, p.y, 'powerup', this.soulsphereSprites[pulseFrame], 0.66, itemBob);
    }
    for (let i = 0; i < this.medkits.length; i++) {
      const m = this.medkits[i];
      if (m.active) pushItem(m.x, m.y, 'medkit', this.medkitSprites[pulseFrame], 0.62, itemBob);
    }
    for (let i = 0; i < this.ammoPacks.length; i++) {
      const a = this.ammoPacks[i];
      if (a.active) pushItem(a.x, a.y, 'ammo', this.ammoSprites[pulseFrame], 0.66, itemBob);
    }
    for (let i = 0; i < this.fireProps.length; i++) {
      const f = this.fireProps[i];
      pushItem(f.x, f.y, 'fire', this.fireFrames[(animFrame + f.phase) % 3], 0.74);
    }
    for (let i = 0; i < this.flameProjectiles.length; i++) {
      const fp = this.flameProjectiles[i];
      const ratio = clamp(fp.age / fp.maxLife, 0, 0.99);
      const stage = ratio < 0.3 ? 0 : (ratio < 0.7 ? 1 : 2);
      pushItem(fp.x, fp.y, 'orb', this.flameBallSprites[stage], fp.scale || 0.54, 0, fp.zOffset || 0);
    }
    for (let i = 0; i < this.playerProjectiles.length; i++) {
      const pp = this.playerProjectiles[i];
      const sc = pp.kind === 'BFG' ? 0.9 : (pp.kind === 'ROCKET' ? 0.56 : 0.44);
      const ppSprite =
        (pp.kind === 'BFG'
          ? this.bfgSprites?.[pulseFrame]
          : (pp.kind === 'ROCKET' ? this.rocketSprites?.[pulseFrame] : this.plasmaSprites?.[pulseFrame])) || pp.sprite;
      pushItem(pp.x, pp.y, 'orb', ppSprite, sc);
    }
    for (let i = 0; i < this.enemyProjectiles.length; i++) {
      const ep = this.enemyProjectiles[i];
      pushItem(ep.x, ep.y, 'orb', ep.sprite, ep.explosive ? 0.64 : 0.5);
    }

    list.length = count;
    list.sort((a, b) => b.distSq - a.distSq);

    const invDet = 1.0 / (planeX * dirY - dirX * planeY);
    const hpBars = this._hpBars;
    let hpCount = 0;
    const zLen = Math.min(W, this.zBuffer.length);

    for (let i = 0; i < count; i++) {
      const obj = list[i];
      const sx = obj.x - px;
      const sy = obj.y - py;
      const tx = invDet * (dirY * sx - dirX * sy);
      const ty = invDet * (-planeY * sx + planeX * sy);
      if (!Number.isFinite(ty) || !Number.isFinite(tx) || ty <= 0.15 || ty > 28) continue;

      const sp = obj.sprite;
      if (!sp || !sp.width || !sp.height) continue;
      const screenX = Math.floor((W / 2) * (1 + tx / ty));
      const wallSpan = Math.abs(Math.floor((H * WALL_SCALE) / ty));
      let spriteH = Math.abs(Math.floor(H / ty)) * (obj.scale || 0.95);
      if (obj.type === 'enemy' && spriteH > wallSpan * 0.92) {
        spriteH = Math.floor(wallSpan * 0.92);
      }
      const spriteW = Math.max(1, Math.floor(spriteH * (sp.width / Math.max(1, sp.height))));
      const floorY = Math.floor(horizonPx + wallSpan / 2);
      const ceilY = Math.floor(horizonPx - wallSpan / 2);
      const bouncePx = (obj.stepBounce || 0) * S;
      const rawStartY = obj.type === 'orb'
        ? Math.floor(horizonPx - spriteH / 2 + ((obj.zOffset || 0) * H) / ty)
        : Math.max(ceilY + 2 * S, Math.floor(floorY - spriteH + bouncePx));

      const rawEndY = Math.floor(rawStartY + spriteH);
      const startY = clamp(rawStartY, 0, H - 1);
      const endY = clamp(rawEndY, 0, H - 1);
      const dstH = endY - startY;
      const rawLeftX = Math.floor(screenX - spriteW / 2);
      const startX = clamp(rawLeftX, 0, zLen - 1);
      const endX = clamp(Math.floor(screenX + spriteW / 2), 0, zLen - 1);
      if (dstH < 1 || endX < startX || !Number.isFinite(startX) || !Number.isFinite(endX)) continue;

      // Sombra de contacto oscura en el suelo respetando zBuffer
      if (obj.type === 'enemy' || obj.type === 'merchant' || obj.type === 'barrel') {
        const shRx = Math.max(2, Math.floor(spriteW * (obj.floating ? 0.28 : 0.34)));
        const shRy = clamp(Math.floor(spriteW * (obj.floating ? 0.055 : 0.07)), 1, 6 * S);
        const shY = clamp(floorY - Math.floor(shRy * 0.4), 0, H - 1);
        const shLeft = clamp(screenX - shRx, 0, W - 1);
        const shRight = clamp(screenX + shRx, 0, W - 1);
        c.globalAlpha = obj.floating ? 0.2 : 0.36;
        c.fillStyle = '#080305';
        for (let col = shLeft; col <= shRight; col++) {
          if (ty >= this.zBuffer[col]) continue;
          const nx = (col - screenX) / shRx;
          const hHalf = Math.max(1, Math.round(shRy * Math.sqrt(Math.max(0, 1 - nx * nx))));
          c.fillRect(col, shY - hHalf, 1, hHalf * 2);
        }
        c.globalAlpha = 1;
      }

      // Color e intensidad de overlay por silueta (cero rectángulos sobre transparencia)
      let tintCol = null;
      let tintAlpha = 0;
      if (obj.type === 'enemy') {
        if (obj.hitFlash > 0) {
          tintCol = '#fff3b0';
          tintAlpha = 0.58;
        } else if (obj.wakeFlash > 0) {
          tintCol = '#ff0055';
          tintAlpha = clamp(obj.wakeFlash * 0.65, 0, 0.65);
        } else if (obj.isBoss && obj.dormant) {
          tintCol = '#120818';
          tintAlpha = 0.38 + 0.12 * Math.sin(now * 0.005);
        } else if (obj.gloryReady) {
          tintCol = Math.floor(now / 110) % 2 === 0 ? '#00b4d8' : '#ff7800';
          tintAlpha = 0.56;
        } else if (obj.stunTimer > 0) {
          tintCol = '#ffbe0b';
          tintAlpha = 0.35;
        } else if (obj.shieldFlash > 0) {
          tintCol = '#00b4d8';
          tintAlpha = 0.5;
        } else if (obj.bossState === 'DASH' || obj.dashTime > 0) {
          tintCol = '#ff4d00';
          tintAlpha = 0.3;
        } else if (obj.burnTimer > 0 || obj.enraged) {
          tintCol = obj.enraged ? '#d90429' : '#ff5a00';
          tintAlpha = obj.enraged ? 0.25 : 0.28;
        }
      }

      let darkAlpha = 0;
      const glowing = obj.type === 'fire' || obj.type === 'orb' || obj.type === 'coin' || obj.type === 'powerup' || obj.type === 'key' || obj.type === 'barrel';
      if (darknessEvent && !glowing) {
        const light = this.getSectorLightLevel(obj.x, obj.y, now);
        if (light < 0.97) {
          if (obj.type === 'enemy') {
            const cue = obj.gloryReady ? 0.28 : (obj.shieldFlash > 0 ? 0.55 : 1);
            darkAlpha = (1 - light) * 0.9 * cue;
          } else {
            darkAlpha = (1 - light) * 0.93;
          }
        }
      }

      const tintSprite = tintCol ? getTintedSprite(sp, tintCol) : null;
      const darkSprite = darkAlpha > 0.02 ? getTintedSprite(sp, '#040203') : null;
      const emissiveSprite = (darkAlpha > 0.05 || (obj.isBoss && obj.dormant)) && sp._emissive ? sp._emissive : null;

      const srcY = clamp(((startY - rawStartY) / Math.max(1, spriteH)) * sp.height, 0, sp.height - 0.1);
      const srcH = clamp((dstH / Math.max(1, spriteH)) * sp.height, 0.1, sp.height - srcY);

      let visible = false;
      let col = startX;
      const baseAlpha = obj.invisible
        ? (obj.hitFlash > 0 || obj.burnTimer > 0 || obj.gloryReady ? 0.62 : clamp(0.16 + Math.sin(now * 0.014) * 0.06, 0.08, 0.28))
        : 1;
      while (col <= endX) {
        const zVal = this.zBuffer[col];
        if (!(ty < zVal)) {
          col++;
          continue;
        }
        visible = true;
        const runStart = col;
        while (col <= endX && ty < this.zBuffer[col]) col++;
        if (col <= runStart) col = runStart + 1;
        const runW = col - runStart;
        const srcX = clamp(((runStart - rawLeftX) / Math.max(1, spriteW)) * sp.width, 0, sp.width - 0.1);
        const srcW = clamp((runW / Math.max(1, spriteW)) * sp.width, 0.1, sp.width - srcX);

        c.globalAlpha = baseAlpha;
        c.drawImage(sp, srcX, srcY, srcW, srcH, runStart, startY, runW, dstH);
        if (tintSprite) {
          c.globalAlpha = Math.min(baseAlpha, tintAlpha);
          c.drawImage(tintSprite, srcX, srcY, srcW, srcH, runStart, startY, runW, dstH);
        }
        if (darkSprite && !obj.invisible) {
          c.globalAlpha = darkAlpha;
          c.drawImage(darkSprite, srcX, srcY, srcW, srcH, runStart, startY, runW, dstH);
        }
        if (emissiveSprite && !obj.invisible) {
          c.globalAlpha = 1;
          c.drawImage(emissiveSprite, srcX, srcY, srcW, srcH, runStart, startY, runW, dstH);
        }
        c.globalAlpha = 1;
      }

      if (visible && ((obj.type === 'enemy' && obj.alive && (obj.isBoss || obj.health < obj.maxHealth)) || obj.objHpRatio >= 0)) {
        let slot = hpBars[hpCount];
        if (!slot) {
          slot = {};
          hpBars[hpCount] = slot;
        }
        slot.screenX = screenX / S;
        slot.barW = clamp(Math.floor((spriteW / S) * 0.85), 18, 54);
        slot.barY = Math.max(4, Math.floor(startY / S) - 6);
        slot.ratio = obj.objHpRatio >= 0 ? obj.objHpRatio : clamp(obj.health / obj.maxHealth, 0, 1);
        slot.dormant = obj.dormant;
        slot.holdsKey = obj.holdsKey || obj.objHpRatio >= 0;
        slot.isBoss = obj.isBoss;
        slot.gloryReady = obj.gloryReady;
        slot.isShielded = !!obj.shieldActive;
        slot.showIdleTag = obj.isBoss && obj.dormant && ty < 12;
        hpCount++;
      }
    }

    // Rayos 3D proyectados (láser de Francotiradores, tracers hitscan, relámpagos BFG y tethers de Pilones)
    const drawWorldSegment = (x1, y1, z1, x2, y2, z2, color, width = 1.6, alpha = 0.85) => {
      const p1x = x1 - px, p1y = y1 - py;
      const p2x = x2 - px, p2y = y2 - py;
      const tx1 = invDet * (dirY * p1x - dirX * p1y);
      const ty1 = invDet * (-planeY * p1x + planeX * p1y);
      const tx2 = invDet * (dirY * p2x - dirX * p2y);
      const ty2 = invDet * (-planeY * p2x + planeX * p2y);
      if (!Number.isFinite(ty1) || !Number.isFinite(ty2) || (ty1 <= 0.2 && ty2 <= 0.2)) return;
      const safeT1 = Math.max(0.25, ty1);
      const safeT2 = Math.max(0.25, ty2);
      const sx1 = (W / 2) * (1 + tx1 / safeT1);
      const sy1 = horizonPx + (z1 * H) / safeT1;
      const sx2 = (W / 2) * (1 + tx2 / safeT2);
      const sy2 = horizonPx + (z2 * H) / safeT2;
      if (!Number.isFinite(sx1) || !Number.isFinite(sy1) || !Number.isFinite(sx2) || !Number.isFinite(sy2)) return;
      c.save();
      c.globalAlpha = alpha;
      c.strokeStyle = color;
      c.lineWidth = width * S;
      c.beginPath();
      c.moveTo(sx1, sy1);
      c.lineTo(sx2, sy2);
      c.stroke();
      c.restore();
    };

    for (let i = 0; i < this.hitscanTracers.length; i++) {
      const tr = this.hitscanTracers[i];
      const alpha = clamp(tr.life / Math.max(0.05, tr.maxLife), 0.1, 1);
      drawWorldSegment(tr.x1, tr.y1, 0.04, tr.x2, tr.y2, 0.08, tr.color || '#ffbe0b', 1.8, alpha);
    }
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i];
      if (e.alive && e.isSniper && e.aimTimer > 0 && !e.dormantCloset) {
        const endX = e.x + (e.aimDirX || 1) * 18;
        const endY = e.y + (e.aimDirY || 0) * 18;
        const pulse = Math.floor(now / 70) % 2 === 0 ? 0.9 : 0.45;
        drawWorldSegment(e.x, e.y, -0.05, endX, endY, 0.02, '#ff003c', 1.4, pulse);
      }
    }
    if (this.arenaPylons.length > 0) {
      const icon = this.enemies.find((e) => e.isFinalIcon && e.alive);
      if (icon && icon.shieldActive) {
        for (const pyl of this.arenaPylons) {
          if (!pyl.destroyed && pyl.active) {
            drawWorldSegment(pyl.x, pyl.y, -0.1, icon.x, icon.y, -0.15, '#00f5d4', 2.2, 0.78);
          }
        }
      }
    }

    // Partículas 3D en espacio del mundo (pool sin allocations)
    const pSize = Math.max(1, Math.round(2 * S));
    const emberSize = Math.max(1, Math.round(S));
    const drawParticles = (arr, size, fixedCol) => {
      for (let i = 0; i < arr.length; i++) {
        const bp = arr[i];
        const sx = bp.x - px;
        const sy = bp.y - py;
        const tx = invDet * (dirY * sx - dirX * sy);
        const ty = invDet * (-planeY * sx + planeX * sy);
        if (ty <= 0.15) continue;
        const screenX = Math.floor((W / 2) * (1 + tx / ty));
        const screenY = Math.floor(horizonPx + (bp.z * H) / ty);
        if (screenX >= 0 && screenX < W && screenY >= 0 && screenY < H && ty < this.zBuffer[screenX]) {
          c.fillStyle = fixedCol || bp.color;
          c.fillRect(screenX, screenY, size, size);
        }
      }
    };
    drawParticles(this.bloodParticles, pSize, null);
    drawParticles(this.wallSparks, pSize, null);
    drawParticles(this.ambientEmbers, emberSize, '#ff4d00');

    // Restaurar transform lógico para barras de vida nítidas
    this.setLogicalTransform();
    for (let i = 0; i < hpCount; i++) {
      const b = hpBars[i];
      const barX = Math.floor(b.screenX - b.barW / 2);
      c.fillStyle = '#140708';
      c.fillRect(barX - 1, b.barY - 1, b.barW + 2, 4);
      c.fillStyle = b.dormant ? '#7a6a58' : (b.holdsKey ? '#ffd700' : (b.isBoss ? '#d90429' : '#ffbe0b'));
      c.fillRect(barX, b.barY, Math.floor(b.barW * b.ratio), 2);
      if (b.showIdleTag) {
        c.textAlign = 'center';
        c.font = 'bold 5.5px monospace';
        c.fillStyle = '#ffbe0b';
        c.fillText('DORMIDO', b.screenX, Math.max(7, b.barY - 3));
      } else if (b.gloryReady) {
        c.fillStyle = Math.floor(now / 110) % 2 === 0 ? '#00b4d8' : '#ff4d00';
        c.fillRect(barX - 1, b.barY - 3, b.barW + 2, 1);
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
      if (ty > this.zBuffer[clamp(Math.floor(screenX * this.renderScale), 0, this.worldW - 1)] + 0.8) return null;
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
    for (const pp of this.playerProjectiles) {
      const p = project(pp.x, pp.y);
      if (!p) continue;
      const radius = clamp((pp.kind === 'BFG' ? 110 : 62) / p.ty, 10, 110);
      if (pp.kind === 'BFG') glow(p.screenX, horizon, radius, 112, 224, 0, 0.34 * intensity);
      else if (pp.kind === 'PLASMA') glow(p.screenX, horizon, radius, 0, 245, 212, 0.28 * intensity);
      else glow(p.screenX, horizon, radius, 255, 120, 15, 0.25 * intensity);
    }
    for (const tp of this.teleportPortals) {
      const p = project(tp.x, tp.y);
      if (!p) continue;
      const radius = clamp(68 / p.ty, 8, 78);
      glow(p.screenX, p.floorY - 12, radius, 157, 78, 221, 0.28 * intensity);
    }
    for (const pyl of this.arenaPylons) {
      if (pyl.destroyed || !pyl.active) continue;
      const p = project(pyl.x, pyl.y);
      if (!p) continue;
      glow(p.screenX, p.floorY - 10, clamp(72 / p.ty, 10, 80), 0, 245, 212, 0.28 * intensity);
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
      if (ty >= this.zBuffer[clamp(Math.floor(screenX * this.renderScale), 0, this.worldW - 1)]) return null;
      const floorY = horizon + (VIEW_HEIGHT * WALL_SCALE * 0.5) / ty;
      return { screenX, floorY, ty };
    };

    // Charcos orgánicos persistentes de sangre en el suelo
    for (let bi = 0; bi < this.bloodPools.length; bi++) {
      const bp = this.bloodPools[bi];
      const p = project(bp.x, bp.y);
      if (!p || p.ty > 16) continue;
      const rx = clamp((bp.radius / p.ty) * (VIEW_HEIGHT * 0.88), 2, 42);
      c.save();
      c.translate(p.screenX, p.floorY);
      c.scale(1, 0.3);
      c.fillStyle = bp.color ? 'rgba(60, 140, 15, 0.55)' : 'rgba(92, 4, 14, 0.85)';
      c.beginPath();
      c.arc(0, 0, rx, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = bp.color ? 'rgba(112, 224, 0, 0.55)' : 'rgba(155, 10, 24, 0.8)';
      c.beginPath();
      c.arc(-rx * 0.22, rx * 0.14, rx * 0.65, 0, Math.PI * 2);
      c.fill();
      c.restore();
    }

    // Portales de teletransporte demoníaco activos
    for (let ti = 0; ti < this.teleportPortals.length; ti++) {
      const tp = this.teleportPortals[ti];
      const p = project(tp.x, tp.y);
      if (!p) continue;
      const rx = clamp((1.1 / p.ty) * (VIEW_HEIGHT * 0.92), 5, WIDTH);
      const pulse = 0.5 + 0.4 * Math.sin(now * 0.02);
      c.save();
      c.translate(p.screenX, p.floorY);
      c.scale(1, 0.32);
      c.fillStyle = `rgba(157, 78, 221, ${pulse * 0.48})`;
      c.beginPath();
      c.arc(0, 0, rx, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#00f5d4';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, 0, rx * (1 - clamp(tp.timer / tp.maxTimer, 0, 1) * 0.5), 0, Math.PI * 2);
      c.stroke();
      c.restore();
    }

    // Anillo del Nexus de Supervivencia cuando este objetivo está activo
    if (this.survivalState && this.sectorObjective?.type === 'SURVIVAL_WAVES') {
      const sv = this.survivalState;
      const p = project(sv.cx, sv.cy);
      if (p) {
        const rx = clamp((1.8 / p.ty) * (VIEW_HEIGHT * 0.92), 6, WIDTH);
        c.save();
        c.translate(p.screenX, p.floorY);
        c.scale(1, 0.32);
        c.strokeStyle = sv.started ? '#ff4d00' : '#00f5d4';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(0, 0, rx, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }
    }

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
    const obj = this.sectorObjective || { type: 'BOSS_KEY' };
    let statusText;
    if (this.player.hasKey) {
      if (obj.type === 'ESCAPE_COUNTDOWN' && obj.escapeStarted) {
        statusText = `⏱️ ESCAPA: ${Math.max(0, obj.escapeTimer).toFixed(1)}s`;
      } else {
        statusText = '🔑 VE A EXIT';
      }
    } else if (this.keyItem && this.keyItem.active) {
      statusText = '🔑 COGE LA LLAVE';
    } else if (obj.type === 'GENERATORS') {
      const aliveG = this.generators.filter((g) => g.alive).length;
      statusText = `⚡ REACTORES: ${this.generators.length - aliveG}/${this.generators.length}`;
    } else if (obj.type === 'SURVIVAL_WAVES') {
      const sv = this.survivalState;
      statusText = sv?.started
        ? `⚔️ OLEADA ${sv.wave}/${sv.maxWaves} (${Math.max(0, Math.ceil(sv.waveTimer))}s)`
        : '⚔️ ACTIVA NEXUS [E]';
    } else if (obj.type === 'ESCORT_RESCUE') {
      if (this.vip && !this.vip.alive) {
        statusText = '💀 MATA AL PORTADOR';
      } else if (this.vip?.rescued) {
        statusText = `🧬 VIP ${Math.max(0, Math.round((this.vip.hp / this.vip.maxHp) * 100))}% -> EXIT`;
      } else {
        statusText = '🧬 RESCATA AL VIP [E]';
      }
    } else if (obj.type === 'ESCAPE_COUNTDOWN') {
      statusText = '☢️ SABOTEA EL NÚCLEO [E]';
    } else if (obj.type === 'THREE_KEYS') {
      const rem = this.coloredKeys.filter((k) => k.active).length;
      statusText = `🗝️ 3 LLAVES (${3 - rem}/3)`;
    } else if (obj.type === 'FINAL_ICON') {
      statusText = '👹 MATA AL ICON OF SIN';
    } else {
      statusText = '⚔️ MATA AL BOSS';
    }
    if (now < this.player.berserkUntil) statusText += ' · 🔥BERSERK';

    const urgentCountdown = obj.type === 'ESCAPE_COUNTDOWN' && obj.escapeStarted && obj.escapeTimer <= 15;
    c.font = 'bold 6.5px monospace';
    const objW = clamp(Math.ceil(c.measureText(statusText).width) + 12, 74, 160);
    c.fillStyle = urgentCountdown ? 'rgba(62, 6, 12, 0.92)' : 'rgba(20, 7, 8, 0.85)';
    c.fillRect(4, 4, objW, 14);
    c.strokeStyle = urgentCountdown ? '#ff003c' : (this.player.hasKey ? '#ffbe0b' : '#ff4d00');
    c.lineWidth = 1;
    c.strokeRect(4, 4, objW, 14);
    c.textAlign = 'left';
    c.fillStyle = urgentCountdown ? '#ff8fa3' : (this.player.hasKey ? '#fff3b0' : '#ffbe0b');
    c.fillText(statusText, 9, 13.5, objW - 10);

    let evtW = 0;
    let evtTxt = '';
    let evtStroke = '#70e000';
    let evtFill = '#ccff33';
    if (this.sectorEvent) {
      const dark = this.sectorEvent.type === 'DARKNESS';
      evtTxt = this.sectorEvent.short;
      evtStroke = dark ? '#00b4d8' : '#70e000';
      evtFill = dark ? '#caf0f8' : '#ccff33';
    } else if (this.activeRouteMod) {
      evtTxt = this.activeRouteMod.short;
      evtStroke = this.activeRouteMod.color || '#ffbe0b';
      evtFill = '#fff3b0';
    } else if (this.pressurePct > 0) {
      evtTxt = `AMENAZA +${this.pressurePct}%`;
      evtStroke = '#ff9e00';
      evtFill = '#ffbe0b';
    }
    if (evtTxt) {
      evtW = clamp(Math.ceil(c.measureText(evtTxt).width) + 12, 46, 108);
      const evtX = WIDTH - 4 - evtW;
      c.fillStyle = 'rgba(20, 7, 8, 0.85)';
      c.fillRect(evtX, 4, evtW, 14);
      c.strokeStyle = evtStroke;
      c.strokeRect(evtX, 4, evtW, 14);
      c.textAlign = 'center';
      c.fillStyle = evtFill;
      c.fillText(evtTxt, evtX + evtW / 2, 13.5, evtW - 8);
    }

    if (!this._topBarBounds) this._topBarBounds = { leftEnd: 0, rightStart: 0 };
    this._topBarBounds.leftEnd = 4 + objW + 4;
    this._topBarBounds.rightStart = evtW > 0 ? WIDTH - 4 - evtW - 4 : WIDTH - 4;
  }

  drawComboBanner(now) {
    const combo = this.combo;
    if (!combo || combo.count < 2 || now > combo.expires) return;
    const c = this.ctx;
    const remaining = clamp((combo.expires - now) / CONFIG.COMBO_WINDOW_MS, 0, 1);

    // Posición limpia a la izquierda del mini-radar (WIDTH - 46) para cero solapamiento
    const comboTxt = `COMBO x${combo.count}`;
    c.font = 'bold 6.8px monospace';
    const boxW = Math.max(54, Math.ceil(c.measureText(comboTxt).width) + 10);
    const rx = WIDTH - 46;
    c.fillStyle = 'rgba(16, 6, 8, 0.82)';
    c.fillRect(rx - boxW, 21, boxW, 13);
    c.strokeStyle = '#ff4d00';
    c.lineWidth = 1;
    c.strokeRect(rx - boxW, 21, boxW, 13);

    c.textAlign = 'center';
    c.fillStyle = '#ffbe0b';
    c.fillText(comboTxt, rx - boxW / 2, 29.5);
    c.fillStyle = '#26282a';
    c.fillRect(rx - boxW + 3, 31.5, boxW - 6, 2);
    c.fillStyle = '#ff4d00';
    c.fillRect(rx - boxW + 3, 31.5, Math.floor((boxW - 6) * remaining), 2);

    if (combo.bannerText && now < combo.bannerUntil) {
      const alpha = clamp((combo.bannerUntil - now) / 260, 0, 1);
      c.save();
      c.globalAlpha = alpha;
      c.textAlign = 'center';
      c.font = 'bold 17px monospace';
      c.fillStyle = '#140708';
      c.fillText(combo.bannerText, WIDTH / 2 + 1.5, 63);
      c.fillStyle = combo.bannerText === 'HELLBREAKER'
        ? '#ff4d00'
        : (combo.bannerText === 'RAMPAGE' ? '#ffbe0b' : '#00f5d4');
      c.fillText(combo.bannerText, WIDTH / 2, 61.5);
      const subTxt = `RACHA · +${combo.bannerBonus || 0} PTS`;
      c.font = 'bold 6.5px monospace';
      const sw = Math.ceil(c.measureText(subTxt).width) + 12;
      c.fillStyle = 'rgba(14, 4, 6, 0.85)';
      c.fillRect(WIDTH / 2 - sw / 2, 65, sw, 10);
      c.fillStyle = '#fff3b0';
      c.fillText(subTxt, WIDTH / 2, 72.5);
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

    const sp = this.punchEmpowered ? this.weaponSprites.fist.empowered : this.weaponSprites.fist.normal;
    c.save();
    c.translate(fx, fy);
    if (side < 0) c.scale(-1, 1);
    c.drawImage(sp, -sp.width / 4, -24, sp.width / 2, sp.height / 2);
    c.restore();
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
    const ws = this.weaponSprites;

    c.save();
    c.beginPath();
    c.rect(0, 0, WIDTH, VIEW_HEIGHT);
    c.clip();

    if (w === 4) {
      const revving = now - this.shotStartTime < 150;
      const jitter = revving ? Math.floor(Math.sin(now * 0.12) * 2) : 0;
      const chainIdx = Math.floor(now / 26) % 4;
      const sx = cx + jitter;
      const sy = baseY;
      if (revving) {
        const rev = ws.chainsaw.rev;
        c.drawImage(rev, sx - rev.width / 4, sy - 98, rev.width / 2, rev.height / 2);
      }
      const sp = ws.chainsaw.frames[chainIdx];
      c.drawImage(sp, sx - sp.width / 4, sy - sp.height / 2, sp.width / 2, sp.height / 2);
      this.drawPunchOverlay(c, now);
      c.restore();
      return;
    }

    if (w === 2) {
      if (this.muzzleFlash > 0.12) {
        const fl = ws.chaingun.flash;
        c.drawImage(fl, cx - fl.width / 4, baseY - 72, fl.width / 2, fl.height / 2);
      }
      const spinOffset = Math.floor(now / 35) % 4;
      const sp = ws.chaingun.spin[spinOffset];
      c.drawImage(sp, cx - sp.width / 4, baseY - sp.height / 2, sp.width / 2, sp.height / 2);
      this.drawPunchOverlay(c, now);
      c.restore();
      return;
    }

    if (w === 3) {
      const idx = Math.floor(now / 55) % 3;
      if (this.muzzleFlash > 0.1) {
        const bl = ws.flamer.blast[idx];
        c.drawImage(bl, cx - bl.width / 4, baseY - 102, bl.width / 2, bl.height / 2);
      } else {
        const pil = ws.flamer.pilot[idx];
        c.drawImage(pil, cx - pil.width / 4, baseY - 70, pil.width / 2, pil.height / 2);
      }
      const sp = ws.flamer.body;
      c.drawImage(sp, cx - sp.width / 4, baseY - sp.height / 2, sp.width / 2, sp.height / 2);
      this.drawPunchOverlay(c, now);
      c.restore();
      return;
    }

    if (w === 5 && ws.rocket) {
      if (this.muzzleFlash > 0.14) {
        const fl = ws.rocket.flash;
        c.drawImage(fl, cx - fl.width / 4, baseY - 94, fl.width / 2, fl.height / 2);
      }
      const sinceShot = now - this.shotStartTime;
      const sp = sinceShot < 220 ? ws.rocket.fire : ws.rocket.idle;
      c.drawImage(sp, cx - sp.width / 4, baseY - sp.height / 2, sp.width / 2, sp.height / 2);
      this.drawPunchOverlay(c, now);
      c.restore();
      return;
    }

    if (w === 6 && ws.plasma) {
      if (this.muzzleFlash > 0.1) {
        const fl = ws.plasma.flash;
        c.drawImage(fl, cx - fl.width / 4, baseY - 86, fl.width / 2, fl.height / 2);
      }
      const frame = Math.floor(now / 65) % 2;
      const sp = ws.plasma.frames[frame];
      c.drawImage(sp, cx - sp.width / 4, baseY - sp.height / 2, sp.width / 2, sp.height / 2);
      this.drawPunchOverlay(c, now);
      c.restore();
      return;
    }

    if (w === 7 && ws.bfg) {
      if (this.muzzleFlash > 0.1) {
        const fl = ws.bfg.flash;
        c.drawImage(fl, cx - fl.width / 4, baseY - 108, fl.width / 2, fl.height / 2);
      }
      const frame = Math.floor(now / 90) % 2;
      const sp = ws.bfg.frames[frame];
      c.drawImage(sp, cx - sp.width / 4, baseY - sp.height / 2, sp.width / 2, sp.height / 2);
      this.drawPunchOverlay(c, now);
      c.restore();
      return;
    }

    const sinceShot = now - this.shotStartTime;
    const isPumping = sinceShot > 110 && sinceShot < 390;
    if (this.muzzleFlash > 0.12) {
      const fl = ws.shotgun.flash;
      c.drawImage(fl, cx - fl.width / 4, baseY - 82, fl.width / 2, fl.height / 2);
    }

    const pumpShiftX = isPumping ? -6 : 0;
    const pumpShiftY = isPumping ? -5 : 0;
    const sx = cx + pumpShiftX;
    const sy = baseY + pumpShiftY;
    const sp = !isPumping
      ? ws.shotgun.idle
      : (sinceShot < 250 ? ws.shotgun.pump0 : ws.shotgun.pump1);
    c.drawImage(sp, sx - sp.width / 4, sy - sp.height / 2, sp.width / 2, sp.height / 2);

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

    this.drawPunchOverlay(c, now);
    c.restore();
  }

  drawIntermissionScreen(now) {
    this.setLogicalTransform();
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

    if (im.stage === 'ROUTE' && im.routeChoices?.length > 0) {
      const rChoices = im.routeChoices;
      const count = rChoices.length;
      const totalW = WIDTH - 24;
      const gap = 6;
      const cardW = Math.floor((totalW - gap * (count - 1)) / count);
      const cardH = 74;
      const cardY = 63;

      c.textAlign = 'left';
      c.font = 'bold 6.2px monospace';
      c.fillStyle = '#00f5d4';
      c.fillText(`ELIGE TU RUTA AL SECTOR ${this.level + 1} CON [1]..[${count}] O CLIC:`, 14, 57);

      rChoices.forEach((rc, idx) => {
        const cardX = 12 + idx * (cardW + gap);
        const mod = rc.routeMod || { label: 'ESTÁNDAR', hint: '', color: '#ffbe0b', short: 'RUTA' };
        const objMeta = CONFIG.OBJECTIVE_LABELS[rc.objectiveType || rc.objective] || CONFIG.OBJECTIVE_LABELS.BOSS_KEY;

        c.fillStyle = 'rgba(20, 12, 18, 0.96)';
        c.fillRect(cardX, cardY, cardW, cardH);
        c.strokeStyle = mod.color || '#ffbe0b';
        c.lineWidth = 1.5;
        c.strokeRect(cardX + 0.5, cardY + 0.5, cardW - 1, cardH - 1);

        // Barra superior puerta con tecla
        c.fillStyle = mod.color || '#ffbe0b';
        c.fillRect(cardX + 4, cardY + 4, 14, 10);
        c.fillStyle = '#140708';
        c.font = 'bold 6.5px monospace';
        c.textAlign = 'center';
        c.fillText(`[${idx + 1}]`, cardX + 11, cardY + 11.5);

        c.textAlign = 'right';
        c.font = 'bold 5.2px monospace';
        c.fillStyle = mod.color || '#ffbe0b';
        c.fillText(mod.short || 'PUERTA', cardX + cardW - 4, cardY + 11);

        c.textAlign = 'left';
        c.font = 'bold 5.8px monospace';
        c.fillStyle = '#fff3b0';
        c.fillText(mod.label, cardX + 4, cardY + 22, cardW - 8);

        c.fillStyle = 'rgba(255, 190, 11, 0.25)';
        c.fillRect(cardX + 4, cardY + 25, cardW - 8, 1);

        c.font = 'bold 5.2px monospace';
        c.fillStyle = '#00f5d4';
        c.fillText(`MISION: ${objMeta.short}`, cardX + 4, cardY + 34, cardW - 8);
        c.font = '5.1px monospace';
        c.fillStyle = '#ffbe0b';
        c.fillText(`EVENTO: ${rc.event?.short || 'LIMPIO'}`, cardX + 4, cardY + 43, cardW - 8);
        c.fillStyle = '#d8d2c5';
        const lines = wrapLines(mod.hint || rc.themeName || rc.theme?.name || '', count === 3 ? 21 : 30);
        lines.slice(0, 2).forEach((ln, lIdx) => {
          c.fillText(ln, cardX + 4, cardY + 52 + lIdx * 7.5, cardW - 8);
        });

        c.textAlign = 'center';
        c.font = 'bold 5.4px monospace';
        c.fillStyle = mod.color || '#70e000';
        c.fillText(`CRUZAR PUERTA [${idx + 1}]`, cardX + cardW / 2, cardY + 70);
      });

      c.textAlign = 'center';
      c.font = 'bold 6px monospace';
      c.fillStyle = '#00f5d4';
      c.fillText('SELECCIONA UNA PUERTA [1]-[3] O HAZ CLIC PARA DESPLEGAR', WIDTH / 2, 156);
      return;
    }

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
    const isHit = now - this.lastDamageTime < 450;
    const isGrin = now < this.evilGrinUntil;
    const isFiring = this.muzzleFlash > 0.1 || this.recoil > 0.35;
    const lookDir = isHit ? this.damageDir : (isFiring || isGrin ? 0 : (Math.floor(now / 850) % 3) - 1);
    drawCharacterFace(c, x, y, {
      gender: this.characterGender,
      hp: this.player.health,
      isHit,
      isGrin,
      isFiring,
      lookDir,
      now
    });
  }

  drawHUD(now = performance.now()) {
    this.setLogicalTransform();
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

    const wpn = this.player.weapon;
    if (wpn === 4) {
      drawDoomNum('∞', 28, VIEW_HEIGHT + 17, '#ff4d00');
    } else if (wpn === 3) {
      drawDoomNum(`${Math.ceil(this.player.fuel)}%`, 28, VIEW_HEIGHT + 17, '#ff4d00');
    } else if (wpn === 5) {
      drawDoomNum(`🚀${this.player.rockets || 0}`, 28, VIEW_HEIGHT + 17, (this.player.rockets || 0) <= 2 ? '#ffbe0b' : '#ff4d00');
    } else if (wpn === 6 || wpn === 7) {
      drawDoomNum(`${this.player.cells || 0}`, 28, VIEW_HEIGHT + 17, wpn === 7 ? '#70e000' : '#00f5d4');
    } else {
      const totalAmmo = this.player.ammo + this.player.reserve;
      drawDoomNum(`${this.player.ammo}/${this.player.reserve}`, 28, VIEW_HEIGHT + 17, totalAmmo <= 6 ? '#ffbe0b' : '#d90429');
    }

    const hpColor = this.player.health > 100 ? '#00f5d4' : (this.player.health > 30 ? '#d90429' : '#ffbe0b');
    drawDoomNum(`${Math.max(0, this.player.health)}%`, 84, VIEW_HEIGHT + 17, hpColor);

    c.font = 'bold 6.4px monospace';
    [1, 2, 3, 4, 5, 6, 7].forEach((num, idx) => {
      const row = idx < 4 ? 0 : 1;
      const col = idx < 4 ? idx : idx - 4;
      const bx = 114 + col * 7;
      const by = VIEW_HEIGHT + 3 + row * 10;
      const owned = this.isWeaponOwned(num);
      const active = this.player.weapon === num;
      c.fillStyle = active ? '#ffbe0b' : (!owned ? '#160d0f' : '#26282a');
      c.fillRect(bx, by, 6.5, 8.5);
      c.fillStyle = active ? '#140708' : (!owned ? '#4a3538' : (num === 7 ? '#70e000' : (num === 6 ? '#00f5d4' : (num >= 4 ? '#ff4d00' : '#adb5bd'))));
      c.fillText(String(num), bx + 3.25, by + 6.5);
    });

    c.font = 'bold 13px monospace';
    drawDoomNum(`${this.player.armor || 0}%`, 204, VIEW_HEIGHT + 17, '#70e000');

    c.fillStyle = '#140708';
    c.fillRect(236, VIEW_HEIGHT + 5, 12, 22);
    if (this.sectorObjective?.type === 'THREE_KEYS' && this.coloredKeys.length > 0) {
      const kCols = { RED: '#ff003c', BLUE: '#00b4d8', YELLOW: '#ffbe0b' };
      this.coloredKeys.forEach((ck, idx) => {
        c.fillStyle = !ck.active ? kCols[ck.color] : '#2b2224';
        c.fillRect(238, VIEW_HEIGHT + 7 + idx * 6.5, 8, 5);
      });
    } else if (this.player.hasKey) {
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

    c.font = 'bold 6.2px monospace';
    c.fillStyle = '#d8d2c5';
    c.fillText(wpn === 5 ? 'ROCKETS' : (wpn >= 6 ? 'CELLS' : 'AMMO'), 28, VIEW_HEIGHT + 28);
    c.fillText('HEALTH', 84, VIEW_HEIGHT + 28);
    c.fillText('ARMS', 128, VIEW_HEIGHT + 28);
    c.fillText('ARMOR', 204, VIEW_HEIGHT + 28);
    c.fillText('KEY · KILLS · COINS', 276, VIEW_HEIGHT + 28);
  }

  drawShopScreen() {
    this.setLogicalTransform();
    const c = this.ctx;
    c.save();
    c.fillStyle = 'rgba(8, 3, 4, 0.94)';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

    c.strokeStyle = '#ffbe0b';
    c.lineWidth = 1;
    c.strokeRect(14, 4, WIDTH - 28, VIEW_HEIGHT - 8);

    c.textAlign = 'center';
    c.fillStyle = '#ff4d00';
    c.font = 'bold 11px monospace';
    c.fillText('MERCADER DE ALMAS', WIDTH / 2, 15);
    c.fillStyle = '#ffbe0b';
    c.font = 'bold 7px monospace';
    c.fillText(`MONEDAS: ${this.player.coins || 0} · DAÑO ARSENAL: +${Math.round((this.weaponDamageBonus || 0) * 100)}%`, WIDTH / 2, 24);

    const items = this.merchantItems();
    items.forEach((item, idx) => {
      const y = 27 + idx * 17;
      const affordable = (this.player.coins || 0) >= item.price && item.canBuy();
      c.fillStyle = affordable ? 'rgba(74, 37, 17, 0.92)' : 'rgba(30, 18, 18, 0.92)';
      c.fillRect(24, y, WIDTH - 48, 15.5);
      c.strokeStyle = affordable ? '#ffbe0b' : '#4a2c30';
      c.strokeRect(24, y, WIDTH - 48, 15.5);

      c.textAlign = 'left';
      c.font = 'bold 6.2px monospace';
      c.fillStyle = affordable ? '#fff3b0' : '#8d7b6a';
      c.fillText(`[${idx + 1}] ${item.label}`, 29, y + 6.5);
      c.font = '5.1px monospace';
      c.fillStyle = affordable ? '#d8d2c5' : '#6b5a4a';
      c.fillText(item.detail, 29, y + 12.8);

      c.textAlign = 'right';
      c.font = 'bold 7.5px monospace';
      c.fillStyle = affordable ? '#ffbe0b' : '#6b5a4a';
      c.fillText(`${item.price}`, WIDTH - 30, y + 10.5);
    });

    c.textAlign = 'center';
    c.font = 'bold 6px monospace';
    c.fillStyle = this.shopNotice.startsWith('FALTAN') || this.shopNotice.startsWith('YA ESTÁ')
      ? '#ff4d00'
      : '#70e000';
    c.fillText(this.shopNotice, WIDTH / 2, 151);

    c.fillStyle = '#adb5bd';
    c.font = 'bold 5.8px monospace';
    c.fillText('[1]-[7] COMPRAR · [E] O [ESC] SALIR', WIDTH / 2, 160);
    c.restore();
  }

  drawAutomap(now) {
    this.setLogicalTransform();
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
    for (const wp of this.weaponPickups) {
      const gx = Math.floor(wp.x), gy = Math.floor(wp.y);
      if (wp.active && explored[gy]?.[gx]) mark(gx, gy, '#00f5d4', 3);
    }
    for (const gen of this.generators) {
      const gx = Math.floor(gen.x), gy = Math.floor(gen.y);
      if (gen.alive) mark(gx, gy, '#00b4d8', 3);
    }
    for (const ck of this.coloredKeys) {
      if (ck.active) {
        const kCols = { RED: '#ff003c', BLUE: '#00b4d8', YELLOW: '#ffbe0b' };
        mark(Math.floor(ck.x), Math.floor(ck.y), kCols[ck.color] || '#ffd700', 3);
      }
    }
    if (this.vip && this.vip.alive) {
      mark(Math.floor(this.vip.x), Math.floor(this.vip.y), '#00f5d4', 3);
    }
    if (this.escapeCore && !this.escapeCore.triggered) {
      mark(Math.floor(this.escapeCore.x), Math.floor(this.escapeCore.y), '#ff0055', 3);
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
    this.setLogicalTransform();
    const c = this.ctx;
    const isFs = Boolean(document.fullscreenElement);
    c.fillStyle = 'rgba(14, 4, 6, 0.92)';
    c.fillRect(0, 0, WIDTH, VIEW_HEIGHT);

    c.strokeStyle = '#ff4d00';
    c.lineWidth = 1.5;
    c.strokeRect(24, 6, WIDTH - 48, VIEW_HEIGHT - 12);

    c.fillStyle = '#ff4d00';
    c.font = 'bold 14px monospace';
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
      c.font = 'bold 6.8px monospace';
      const boxW = Math.max(228, Math.ceil(c.measureText(opt.label).width) + 20);
      const boxX = Math.floor(WIDTH / 2 - Math.min(256, boxW) / 2);
      const clampedW = Math.min(256, boxW);
      c.fillStyle = opt.bg;
      c.fillRect(boxX, opt.y, clampedW, 19);
      c.strokeStyle = active ? '#ffffff' : opt.border;
      c.lineWidth = active ? 2 : 1;
      c.strokeRect(boxX, opt.y, clampedW, 19);
      c.fillStyle = active ? '#ffbe0b' : '#ffffff';
      c.fillText(opt.label, WIDTH / 2, opt.y + 12.5, clampedW - 10);
    });

    this.drawHUD(performance.now());
  }
}