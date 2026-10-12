import { randomUUID } from 'node:crypto';

export class ScoreRepositoryPg {
  constructor(pool) {
    this.pool = pool;
  }

  async create({ userId, kills, points, durationMs }) {
    const id = randomUUID();
    const { rows } = await this.pool.query(
      `INSERT INTO scores (id, user_id, kills, points, duration_ms)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, kills, points, duration_ms, created_at`,
      [id, userId, kills, points, durationMs]
    );
    const row = rows[0];
    return { id: row.id, userId: row.user_id, kills: row.kills, points: row.points, durationMs: row.duration_ms, createdAt: row.created_at.toISOString() };
  }

  async mine(userId) {
    const { rows } = await this.pool.query(
      `SELECT s.id, s.user_id, s.kills, s.points, s.duration_ms, s.created_at, u.email
       FROM scores s JOIN users u ON u.id = s.user_id
       WHERE s.user_id = $1 AND u.status <> 'deleted'
       ORDER BY s.points DESC, s.duration_ms ASC LIMIT 50`,
      [userId]
    );
    return rows.map((row) => ({ id: row.id, userId: row.user_id, email: row.email, kills: row.kills, points: row.points, durationMs: row.duration_ms, createdAt: row.created_at?.toISOString?.() ?? row.created_at }));
  }

  async top(limit = 10) {
    const safeLimit = Math.max(1, Math.min(50, Number.parseInt(limit, 10) || 10));
    const { rows } = await this.pool.query(
      `SELECT u.email, MAX(s.points)::int AS points,
              (ARRAY_AGG(s.kills ORDER BY s.points DESC, s.created_at ASC))[1] AS kills,
              (ARRAY_AGG(s.duration_ms ORDER BY s.points DESC, s.created_at ASC))[1] AS duration_ms,
              MAX(s.created_at) AS created_at
       FROM scores s
       JOIN users u ON u.id = s.user_id
       WHERE u.status <> 'deleted'
       GROUP BY u.id, u.email
       ORDER BY MAX(s.points) DESC, MIN(s.duration_ms) ASC
       LIMIT $1`,
      [safeLimit]
    );
    return rows.map((row) => ({ email: row.email, points: row.points, kills: row.kills, durationMs: row.duration_ms, createdAt: row.created_at?.toISOString?.() ?? row.created_at }));
  }
}
