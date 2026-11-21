import { beforeEach, describe, expect, it, vi } from 'vitest';

function createMockEnvironment() {
  const fillTexts = [];
  const docListeners = new Map();
  const winListeners = new Map();

  const ctx = new Proxy(function () {}, {
    get: (_t, key) => {
      if (key === 'canvas') return { width: 640, height: 400 };
      if (key === 'getImageData' || key === 'createImageData') {
        return () => ({ data: new Uint8ClampedArray(4096 * 4096) });
      }
      if (key === 'measureText') return () => ({ width: 80 });
      if (key === 'fillText') {
        return (text) => {
          fillTexts.push(String(text));
        };
      }
      return ctx;
    },
    set: () => true,
    apply: () => ctx
  });

  const classes = new Set();
  const bodyClasses = new Set();
  const makeClassList = (set) => ({
    add: (c) => set.add(c),
    remove: (c) => set.delete(c),
    toggle: (c, force) => {
      if (force === undefined) {
        if (set.has(c)) set.delete(c);
        else set.add(c);
      } else if (force) set.add(c);
      else set.delete(c);
    },
    contains: (c) => set.has(c)
  });

  const keyboardLock = vi.fn(() => Promise.resolve());
  const keyboardUnlock = vi.fn();

  const parentEl = {
    classList: makeClassList(classes),
    requestFullscreen: vi.fn(() => {
      globalThis.document.fullscreenElement = parentEl;
      for (const fn of docListeners.get('fullscreenchange') || []) fn();
      return Promise.resolve();
    })
  };

  const createCanvas = () => ({
    width: 640,
    height: 400,
    parentElement: parentEl,
    style: {
      setProperty: vi.fn(),
      removeProperty: vi.fn()
    },
    getContext: () => ctx,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    requestPointerLock: vi.fn(() => Promise.resolve()),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 640, height: 400 })
  });

  globalThis.window = globalThis;
  globalThis.innerWidth = 1280;
  globalThis.innerHeight = 800;
  globalThis.addEventListener = (type, fn) => {
    if (!winListeners.has(type)) winListeners.set(type, new Set());
    winListeners.get(type).add(fn);
  };
  globalThis.removeEventListener = (type, fn) => {
    winListeners.get(type)?.delete(fn);
  };
  globalThis.requestAnimationFrame = () => 1;
  globalThis.cancelAnimationFrame = () => {};
  globalThis.OffscreenCanvas = class {
    constructor(w, h) {
      this.width = w;
      this.height = h;
    }
    getContext() {
      return ctx;
    }
  };
  globalThis.Audio = class {
    addEventListener() {}
    play() { return Promise.resolve(); }
    pause() {}
  };
  globalThis.AudioContext = class {
    createGain() { return ctx; }
    createOscillator() { return ctx; }
    createBiquadFilter() { return ctx; }
    createBufferSource() { return ctx; }
    createBuffer() { return { getChannelData: () => new Float32Array(10) }; }
    get destination() { return ctx; }
    get currentTime() { return 0; }
    get sampleRate() { return 44100; }
  };

  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: {
      keyboard: {
        lock: keyboardLock,
        unlock: keyboardUnlock
      }
    }
  });

  const exitFullscreen = vi.fn(() => {
    globalThis.document.fullscreenElement = null;
    for (const fn of docListeners.get('fullscreenchange') || []) fn();
    return Promise.resolve();
  });

  globalThis.document = {
    fullscreenElement: null,
    pointerLockElement: null,
    body: { classList: makeClassList(bodyClasses) },
    activeElement: null,
    getElementById: () => null,
    createElement: createCanvas,
    exitFullscreen,
    exitPointerLock: vi.fn(),
    addEventListener: (type, fn) => {
      if (!docListeners.has(type)) docListeners.set(type, new Set());
      docListeners.get(type).add(fn);
    },
    removeEventListener: (type, fn) => {
      docListeners.get(type)?.delete(fn);
    }
  };

  return {
    createCanvas,
    fillTexts,
    parentEl,
    keyboardLock,
    keyboardUnlock,
    exitFullscreen,
    dispatchDocEvent: (type) => {
      for (const fn of docListeners.get(type) || []) fn();
    }
  };
}

function makeKeyEvent(code, extra = {}) {
  return {
    code,
    repeat: false,
    target: { tagName: 'BODY', isContentEditable: false },
    preventDefault: vi.fn(),
    ...extra
  };
}

describe('Inicio directo sin comandos y pausa/pantalla completa (ESC vs F)', () => {
  let env;
  let HellfallGame;

  beforeEach(async () => {
    env = createMockEnvironment();
    ({ HellfallGame } = await import('../public/js/game/game.js'));
  });

  it('no dibuja los comandos al crear el juego ni al darle a iniciar', () => {
    const game = new HellfallGame(env.createCanvas(), {});
    expect(game.briefingOpen).toBe(false);
    expect(env.fillTexts.some((t) => t.includes('COMANDOS DE COMBATE'))).toBe(false);

    game.start({ showBriefing: true });
    expect(game.running).toBe(true);
    expect(game.paused).toBe(false);
    expect(game.briefingOpen).toBe(false);
    expect(game.melt).toBeNull();
    expect(env.fillTexts.some((t) => t.includes('COMANDOS DE COMBATE'))).toBe(false);
    game.destroy();
  });

  it('al iniciar entra en pantalla completa, bloquea ESC y ESC pausa/reanuda sin salir de pantalla completa', async () => {
    const game = new HellfallGame(env.createCanvas(), {});
    game.start();
    await Promise.resolve();

    expect(env.parentEl.requestFullscreen).toHaveBeenCalledTimes(1);
    expect(env.keyboardLock).toHaveBeenCalledWith(['Escape']);
    expect(game.isFullscreenActive()).toBe(true);

    // Pulsar ESC en pantalla completa pausa sin salir de pantalla completa
    const escPause = makeKeyEvent('Escape');
    game.handleKeyDown(escPause);
    expect(escPause.preventDefault).toHaveBeenCalled();
    expect(game.paused).toBe(true);
    expect(env.exitFullscreen).not.toHaveBeenCalled();
    expect(game.isFullscreenActive()).toBe(true);

    // Repetición de tecla ESC (mantener pulsado brevemente) no despausa accidentalmente
    const escRepeat = makeKeyEvent('Escape', { repeat: true });
    game.handleKeyDown(escRepeat);
    expect(game.paused).toBe(true);

    // Pulsar ESC de nuevo tras el debounce reanuda sin salir de pantalla completa
    game._lastPauseAt = performance.now() - 500;
    const escResume = makeKeyEvent('Escape');
    game.handleKeyDown(escResume);
    expect(game.paused).toBe(false);
    expect(env.exitFullscreen).not.toHaveBeenCalled();
    expect(game.isFullscreenActive()).toBe(true);

    game.destroy();
  });

  it('solo la tecla F minimiza / sale de pantalla completa', async () => {
    const game = new HellfallGame(env.createCanvas(), {});
    game.start();
    await Promise.resolve();

    expect(game.isFullscreenActive()).toBe(true);

    // Escribir 'f' dentro de un input no minimiza la pantalla
    const fInInput = makeKeyEvent('KeyF', { target: { tagName: 'INPUT' } });
    game.handleKeyDown(fInInput);
    expect(env.exitFullscreen).not.toHaveBeenCalled();
    expect(game.isFullscreenActive()).toBe(true);

    // Pulsar F fuera de inputs sí minimiza / sale de pantalla completa
    const fKey = makeKeyEvent('KeyF');
    game.handleKeyDown(fKey);
    await Promise.resolve();

    expect(fKey.preventDefault).toHaveBeenCalled();
    expect(env.exitFullscreen).toHaveBeenCalledTimes(1);
    expect(env.keyboardUnlock).toHaveBeenCalled();
    expect(game.isFullscreenActive()).toBe(false);
    expect(game.fullscreenDesired).toBe(false);

    game.destroy();
  });

  it('si el navegador fuerza salida de fullscreen sin pulsar F, pausa el juego y mantiene vista expandida hasta pulsar F', async () => {
    const game = new HellfallGame(env.createCanvas(), {});
    game.start();
    await Promise.resolve();

    expect(game.paused).toBe(false);
    expect(globalThis.document.fullscreenElement).toBe(env.parentEl);

    // Simular navegador sin Keyboard Lock saliendo de fullscreen nativo al pulsar ESC
    globalThis.document.fullscreenElement = null;
    env.dispatchDocEvent('fullscreenchange');

    expect(game.paused).toBe(true);
    expect(game.isViewportFullscreen).toBe(true);
    expect(game.isFullscreenActive()).toBe(true);

    // Ahora al pulsar F sí minimiza por completo
    game.handleKeyDown(makeKeyEvent('KeyF'));
    expect(game.isViewportFullscreen).toBe(false);
    expect(game.isFullscreenActive()).toBe(false);

    game.destroy();
  });

  it('quitWithoutSaving sale de pantalla completa, llama a onQuit y no dibuja comandos', async () => {
    const onQuit = vi.fn();
    const game = new HellfallGame(env.createCanvas(), { onQuit });
    game.start();
    await Promise.resolve();

    env.fillTexts.length = 0;
    game.quitWithoutSaving();
    await Promise.resolve();

    expect(onQuit).toHaveBeenCalledTimes(1);
    expect(env.exitFullscreen).toHaveBeenCalledTimes(1);
    expect(game.isFullscreenActive()).toBe(false);
    expect(env.fillTexts.some((t) => t.includes('COMANDOS DE COMBATE'))).toBe(false);

    game.destroy();
  });
});
