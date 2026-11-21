// Números aleatorios con semilla para el desafío diario.
// Con la misma semilla salen siempre los mismos números, así todos los jugadores
// juegan el mismo plan de sectores y los mismos mapas.

/** Generador mulberry32: rápido, pequeño y determinista. Devuelve números en [0, 1). */
export function crearAleatorio(semilla) {
  let a = semilla >>> 0;
  return function aleatorio() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Combina la semilla de la partida con un número (el sector) para que cada sector tenga su propia secuencia. */
export function mezclarSemilla(semilla, n) {
  let h = (semilla ^ Math.imul(n + 1, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}
