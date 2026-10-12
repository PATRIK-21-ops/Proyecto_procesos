import { badRequest, unauthorized } from '../utils/AppError.js';

/**
 * El servidor calcula los puntos a partir del número de bajas y no acepta un total de puntos del cliente.
 * Como el motor de juego se ejecuta en el navegador, esta protección no impide trampas sofisticadas;
 * un juego competitivo requeriría validar la partida en un servidor autoritativo.
 */
export class ScoreService {
  constructor(scoreRepository, { maxKills = 100 } = {}) {
    this.scoreRepository = scoreRepository;
    this.maxKills = maxKills;
  }

  async submit(actor, { kills, durationMs }) {
    if (!actor?.id) throw unauthorized();
    if (!Number.isInteger(kills) || kills < 0 || kills > this.maxKills) {
      throw badRequest(`Las bajas deben ser un entero entre 0 y ${this.maxKills}.`, 'INVALID_KILLS');
    }
    if (!Number.isInteger(durationMs) || durationMs < 1000 || durationMs > 24 * 60 * 60 * 1000) {
      throw badRequest('La duración de la partida no es válida.', 'INVALID_DURATION');
    }
    const points = kills * 100;
    return this.scoreRepository.create({ userId: actor.id, kills, points, durationMs });
  }

  async mine(actor) {
    if (!actor?.id) throw unauthorized();
    return this.scoreRepository.mine(actor.id);
  }

  async top(limit = 10) {
    return this.scoreRepository.top(limit);
  }
}
