import { randomUUID } from 'node:crypto';
import { generateRandomNickname } from '../utils/nickname.js';

const MADRID_DATE_FMT = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' });

export class ScoreRepositoryMemory {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.scores = [];
  }

  async create({ userId, kills, points, durationMs, nickname, sector = 1, isDaily = false }) {
    const user = await this.userRepository.findById(userId);
    const resolvedNickname = (typeof nickname === 'string' && nickname.trim())
      ? nickname.trim()
      : (user?.nickname || generateRandomNickname());
    if (user && (nickname || !user.nickname)) {
      await this.userRepository.update(userId, { nickname: resolvedNickname });
    }
    const safeSector = Math.max(1, Math.min(10, Number.parseInt(sector, 10) || 1));
    const score = {
      id: randomUUID(),
      userId,
      kills,
      points,
      durationMs,
      nickname: resolvedNickname,
      sector: safeSector,
      isDaily: Boolean(isDaily),
      createdAt: new Date().toISOString()
    };
    this.scores.push(score);
    return { ...score };
  }

  async mine(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.status === 'deleted') return [];
    return this.scores
      .filter((score) => score.userId === userId)
      .map((score) => ({ ...score, nickname: score.nickname || user.nickname || 'Slayer', sector: score.sector || 1 }))
      .sort((a, b) => b.points - a.points || a.durationMs - b.durationMs);
  }

  async top(limitOrOpts = 10) {
    const opts = typeof limitOrOpts === 'number' ? { limit: limitOrOpts } : (limitOrOpts || {});
    const safeLimit = Math.max(1, Math.min(200, Number.parseInt(opts.limit ?? 10, 10) || 10));
    const period = ['day', 'week', 'all'].includes(opts.period) ? opts.period : 'all';
    const dailyOnly = Boolean(opts.dailyOnly);
    const todayMadrid = MADRID_DATE_FMT.format(new Date());
    const weekAgoMs = Date.now() - 7 * 86400 * 1000;

    const users = await this.userRepository.list();
    const byId = new Map(users.map((user) => [user.id, user]));
    const best = new Map();
    for (const score of this.scores) {
      if ((score.points || 0) <= 0) continue;
      if (dailyOnly && !score.isDaily) continue;
      if (period === 'day') {
        const d = MADRID_DATE_FMT.format(new Date(score.createdAt));
        if (d !== todayMadrid) continue;
      } else if (period === 'week') {
        if (Date.parse(score.createdAt) < weekAgoMs) continue;
      }
      const user = byId.get(score.userId);
      if (!user || user.status === 'deleted') continue;
      const current = best.get(score.userId);
      if (!current || score.points > current.points || (score.points === current.points && score.durationMs < current.durationMs)) {
        best.set(score.userId, {
          userId: user.id,
          nickname: user.nickname || score.nickname || null,
          email: user.email,
          points: score.points,
          kills: score.kills,
          sector: score.sector || 1,
          durationMs: score.durationMs,
          createdAt: score.createdAt
        });
      }
    }
    return [...best.values()].sort((a, b) => b.points - a.points || a.durationMs - b.durationMs).slice(0, safeLimit);
  }

  async personalStats(userId, { recentLimit = 10 } = {}) {
    const user = await this.userRepository.findById(userId);
    const own = (!user || user.status === 'deleted') ? [] : this.scores.filter((score) => score.userId === userId);
    const days = new Set(own.map((score) => MADRID_DATE_FMT.format(new Date(score.createdAt))));
    const chronological = own
      .map((score, index) => ({ score, index }))
      .sort((a, b) => Date.parse(a.score.createdAt) - Date.parse(b.score.createdAt) || a.index - b.index)
      .map(({ score }) => score);
    return {
      matchesPlayed: own.length,
      totalKills: own.reduce((acc, s) => acc + (s.kills || 0), 0),
      totalPoints: own.reduce((acc, s) => acc + (s.points || 0), 0),
      bestPoints: own.reduce((max, s) => Math.max(max, s.points || 0), 0),
      maxSector: own.reduce((max, s) => Math.max(max, s.sector || 1), 0),
      totalDurationMs: own.reduce((acc, s) => acc + (s.durationMs || 0), 0),
      dailyMatches: own.filter((s) => s.isDaily).length,
      playedDays: [...days].sort(),
      recent: chronological.slice(-recentLimit).map((s) => ({
        points: s.points,
        kills: s.kills,
        sector: s.sector || 1,
        isDaily: Boolean(s.isDaily),
        createdAt: s.createdAt
      }))
    };
  }

  async stats() {
    const users = await this.userRepository.list();
    const activeIds = new Set(users.filter((u) => u.status !== 'deleted').map((u) => u.id));
    const validScores = this.scores.filter((s) => activeIds.has(s.userId));
    return {
      matchesPlayed: validScores.length,
      totalKills: validScores.reduce((acc, s) => acc + (s.kills || 0), 0),
      maxSector: validScores.reduce((max, s) => Math.max(max, s.sector || 1), 0),
      registeredPlayers: activeIds.size
    };
  }
}
