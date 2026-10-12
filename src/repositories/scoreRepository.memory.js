import { randomUUID } from 'node:crypto';

export class ScoreRepositoryMemory {
  constructor(userRepository) {
    this.userRepository = userRepository;
    this.scores = [];
  }

  async create({ userId, kills, points, durationMs }) {
    const score = { id: randomUUID(), userId, kills, points, durationMs, createdAt: new Date().toISOString() };
    this.scores.push(score);
    return { ...score };
  }

  async mine(userId) {
    const user = await this.userRepository.findById(userId);
    if (!user || user.status === 'deleted') return [];
    return this.scores.filter((score) => score.userId === userId).slice().sort((a, b) => b.points - a.points || a.durationMs - b.durationMs);
  }

  async top(limit = 10) {
    const users = await this.userRepository.list();
    const byId = new Map(users.map((user) => [user.id, user]));
    const best = new Map();
    for (const score of this.scores) {
      const user = byId.get(score.userId);
      if (!user || user.status === 'deleted') continue;
      const current = best.get(score.userId);
      if (!current || score.points > current.points) {
        best.set(score.userId, { email: user.email, points: score.points, kills: score.kills, durationMs: score.durationMs, createdAt: score.createdAt });
      }
    }
    return [...best.values()].sort((a, b) => b.points - a.points || a.durationMs - b.durationMs).slice(0, limit);
  }
}
