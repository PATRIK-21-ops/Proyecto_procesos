import { badRequest, unauthorized } from '../utils/AppError.js';
import { isValidNickname, normalizeNickname } from '../utils/nickname.js';

/**
 * El servidor calcula los puntos a partir del número de bajas y de los bonus de combo,
 * y no acepta un total de puntos del cliente.
 * Como el motor de juego se ejecuta en el navegador, esta protección no impide trampas sofisticadas;
 * un juego competitivo requeriría validar la partida en un servidor autoritativo.
 */
export function formatPublicAlias(email) {
  if (typeof email !== 'string' || !email.includes('@')) return 'Slayer';
  const local = email.split('@')[0].trim();
  if (!local) return 'Slayer';
  return `${local.slice(0, 3)}***`;
}

export class ScoreService {
  constructor(scoreRepository, { maxKills = 100000 } = {}) {
    this.scoreRepository = scoreRepository;
    this.maxKills = maxKills;
  }

  async submit(actor, { kills, durationMs, bonusPoints = 0, nickname, sector = 1, isDaily = false } = {}) {
    if (!actor?.id) throw unauthorized();
    if (!Number.isInteger(kills) || kills < 0 || kills > this.maxKills) {
      throw badRequest(`Las bajas deben ser un entero no negativo (máx. ${this.maxKills}).`, 'INVALID_KILLS');
    }
    if (!Number.isInteger(durationMs) || durationMs < 1000 || durationMs > 24 * 60 * 60 * 1000) {
      throw badRequest('La duración de la partida no es válida.', 'INVALID_DURATION');
    }
    if (!Number.isInteger(bonusPoints) || bonusPoints < 0 || bonusPoints > kills * 250) {
      throw badRequest('Los puntos extra de combo no son válidos.', 'INVALID_BONUS_POINTS');
    }
    const parsedSector = sector === undefined || sector === null ? 1 : Number(sector);
    if (!Number.isInteger(parsedSector) || parsedSector < 1 || parsedSector > 10) {
      throw badRequest('El sector alcanzado debe estar entre 1 y 10.', 'INVALID_SECTOR');
    }
    let cleanNickname;
    if (nickname !== undefined && nickname !== null) {
      cleanNickname = normalizeNickname(nickname);
      if (!isValidNickname(cleanNickname)) {
        throw badRequest('El nickname debe tener entre 2 y 24 caracteres válidos (letras, números, espacios, _, -, .).', 'INVALID_NICKNAME');
      }
    }
    const points = kills * 100 + bonusPoints;
    return this.scoreRepository.create({
      userId: actor.id,
      kills,
      points,
      durationMs,
      nickname: cleanNickname,
      sector: parsedSector,
      isDaily: Boolean(isDaily)
    });
  }

  async mine(actor) {
    if (!actor?.id) throw unauthorized();
    return this.scoreRepository.mine(actor.id);
  }

  _sanitizeRows(rows, viewerUserId = null) {
    return (rows || [])
      .filter((row) => (row.points ?? 0) > 0)
      .map(({ userId, email, nickname, ...rest }) => {
        const publicName = normalizeNickname(nickname) || formatPublicAlias(email);
        return {
          ...rest,
          sector: rest.sector || 1,
          nickname: publicName,
          alias: publicName,
          isCurrentUser: Boolean(viewerUserId && userId && userId === viewerUserId)
        };
      });
  }

  async top(limit = 10, { period = 'all', dailyOnly = false, viewerUserId = null } = {}) {
    const repoArg = (period === 'all' && !dailyOnly && !viewerUserId) ? limit : { limit, period, dailyOnly };
    const rows = await this.scoreRepository.top(repoArg);
    return this._sanitizeRows(rows, viewerUserId).slice(0, limit);
  }

  async rankingSummary({ limit = 10, period = 'all', dailyOnly = false, viewerUserId = null } = {}) {
    const safeLimit = Math.max(1, Math.min(50, Number.parseInt(limit, 10) || 10));
    const fetchLimit = viewerUserId ? Math.max(safeLimit, 150) : safeLimit;
    const rows = await this.scoreRepository.top({ limit: fetchLimit, period, dailyOnly });
    const filtered = rows.filter((row) => (row.points ?? 0) > 0);
    let viewerRank = null;
    if (viewerUserId) {
      const idx = filtered.findIndex((row) => row.userId && row.userId === viewerUserId);
      if (idx !== -1) {
        const me = filtered[idx];
        const above = idx > 0 ? filtered[idx - 1] : null;
        viewerRank = {
          rank: idx + 1,
          totalRanked: filtered.length,
          points: me.points,
          nextRank: idx > 0 ? idx : null,
          pointsToNextRank: above ? Math.max(1, above.points - me.points + 1) : 0
        };
      }
    }
    return {
      scores: this._sanitizeRows(filtered.slice(0, safeLimit), viewerUserId),
      viewerRank
    };
  }

  async stats() {
    if (typeof this.scoreRepository.stats !== 'function') {
      return { matchesPlayed: 0, totalKills: 0, maxSector: 0, registeredPlayers: 0 };
    }
    return this.scoreRepository.stats();
  }
}
