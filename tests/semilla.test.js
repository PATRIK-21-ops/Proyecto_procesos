import { beforeAll, describe, expect, it } from 'vitest';
import { crearAleatorio, mezclarSemilla } from '../public/js/game/rng.js';

describe('Generador con semilla (rng.js)', () => {
  it('con la misma semilla da la misma secuencia', () => {
    const a = crearAleatorio(42);
    const b = crearAleatorio(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it('con otra semilla da otra secuencia y siempre en [0, 1)', () => {
    const a = crearAleatorio(42);
    const b = crearAleatorio(43);
    const serieA = Array.from({ length: 20 }, () => a());
    const serieB = Array.from({ length: 20 }, () => b());
    expect(serieA).not.toEqual(serieB);
    for (const n of [...serieA, ...serieB]) {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it('mezclarSemilla da una semilla distinta para cada sector', () => {
    const semillas = new Set(Array.from({ length: 10 }, (_, sector) => mezclarSemilla(123456, sector)));
    expect(semillas.size).toBe(10);
  });
});

// El motor del juego dibuja en un canvas: para generar sectores en Node basta con un
// canvas y un audio de mentira que acepten cualquier llamada.
function prepararNavegadorFalso() {
  const ctx = new Proxy(function () {}, {
    get: (_t, clave) => {
      if (clave === 'canvas') return { width: 1, height: 1 };
      if (clave === 'getImageData' || clave === 'createImageData') return () => ({ data: new Uint8ClampedArray(4096 * 4096) });
      return ctx;
    },
    set: () => true,
    apply: () => ctx
  });
  const crearCanvas = () => ({ width: 0, height: 0, style: {}, getContext: () => ctx, addEventListener() {}, getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 400 }) });
  globalThis.window = globalThis;
  globalThis.document = { getElementById: () => null, createElement: crearCanvas, addEventListener() {} };
  globalThis.addEventListener = () => {};
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => {};
  globalThis.OffscreenCanvas = class { constructor(w, h) { this.width = w; this.height = h; } getContext() { return ctx; } };
  globalThis.Audio = class { addEventListener() {} play() { return Promise.resolve(); } pause() {} };
  globalThis.AudioContext = class {
    createGain() { return ctx; } createOscillator() { return ctx; } createBiquadFilter() { return ctx; }
    createBufferSource() { return ctx; } createBuffer() { return { getChannelData: () => new Float32Array(10) }; }
    get destination() { return ctx; } get currentTime() { return 0; } get sampleRate() { return 44100; }
  };
  return crearCanvas;
}

describe('Sectores con semilla (desafío diario)', () => {
  let HellfallGame;
  let crearCanvas;

  beforeAll(async () => {
    crearCanvas = prepararNavegadorFalso();
    ({ HellfallGame } = await import('../public/js/game/game.js'));
  });

  const partida = (seed) => {
    const juego = new HellfallGame(crearCanvas(), {});
    juego.seed = seed;
    juego.reset();
    return juego;
  };
  const foto = (juego) => JSON.stringify({
    plan: juego.runPlan,
    mapa: juego.map,
    evento: juego.sectorEvent,
    inicio: [juego.player.x, juego.player.y],
    enemigos: juego.enemies.map((e) => [Math.round(e.x * 100), Math.round(e.y * 100), Boolean(e.isElite)])
  });

  it('con la misma semilla, el plan, el mapa y los enemigos del sector salen iguales', () => {
    expect(foto(partida(20261120))).toBe(foto(partida(20261120)));
  });

  it('también son iguales los sectores siguientes', () => {
    const a = partida(777);
    const b = partida(777);
    for (const juego of [a, b]) {
      juego.level = 2;
      juego.startLevel();
    }
    expect(foto(a)).toBe(foto(b));
  });

  it('con otra semilla o sin semilla, la partida cambia', () => {
    expect(foto(partida(1))).not.toBe(foto(partida(2)));
    expect(foto(partida(null))).not.toBe(foto(partida(null)));
  });
});
