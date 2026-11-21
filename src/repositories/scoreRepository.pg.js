import { randomUUID } from 'node:crypto';
import { generateRandomNickname } from '../utils/nickname.js';

export class ScoreRepositoryPg {
  constructor(pool) {
    this.pool = pool;
  }

  async create({ userId, kills, points, durationMs, nickname, sector = 1, isDaily = false }) {
    const id = randomUUID();
    let finalNickname = typeof nickname === 'string' && nickname.trim() ? nickname.trim() : null;
    if (finalNickname) {
      await this.pool.query('UPDATE users SET nickname = $1 WHERE id = $2', [finalNickname, userId]);
    } else {
      const userRes = await this.pool.query('SELECT nickname FROM users WHERE id = $1 LIMIT 1', [userId]);
      finalNickname = userRes.rows[0]?.nickname?.trim() || generateRandomNickname();
      if (!userRes.rows[0]?.nickname?.trim()) {
        await this.pool.query('UPDATE users SET nickname = $1 WHERE id = $2', [finalNickname, userId]);
      }
    }
    const safeSector = Math.max(1, Math.min(10, Number.parseInt(sector, 10) || 1));
    const { rows } = await this.pool.query(
      `INSERT INTO scores (id, user_id, kills, points, duration_ms, nickname, sector, is_daily)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, kills, points, duration_ms, nickname, sector, is_daily, created_at`,
      [id, userId, kills, points, durationMs, finalNickname, safeSector, Boolean(isDaily)]
    );
    const row = rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      kills: row.kills,
      points: row.points,
      durationMs: row.duration_ms,
      nickname: row.nickname,
      sector: row.sector || 1,
      isDaily: Boolean(row.is_daily),
      createdAt: row.created_at.toISOString()
    };
  }

  async mine(userId) {
    const { rows } = await this.pool.query(
      `SELECT s.id, s.user_id, s.kills, s.points, s.duration_ms, s.sector, s.is_daily, s.created_at,
              COALESCE(NULLIF(TRIM(s.nickname), ''), NULLIF(TRIM(u.nickname), '')) AS nickname
       FROM scores s JOIN users u ON u.id = s.user_id
       WHERE s.user_id = $1 AND u.status <> 'deleted'
       ORDER BY s.points DESC, s.duration_ms ASC LIMIT 50`,
      [userId]
    );
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      nickname: row.nickname || 'Slayer',
      sector: row.sector || 1,
      isDaily: Boolean(row.is_daily),
      kills: row.kills,
      points: row.points,
      durationMs: row.duration_ms,
      createdAt: row.created_at?.toISOString?.() ?? row.created_at
    }));
  }

  async top(limitOrOpts = 10) {
    const opts = typeof limitOrOpts === 'number' ? { limit: limitOrOpts } : (limitOrOpts || {});
    const safeLimit = Math.max(1, Math.min(200, Number.parseInt(opts.limit ?? 10, 10) || 10));
    const period = ['day', 'week', 'all'].includes(opts.period) ? opts.period : 'all';
    const dailyOnly = Boolean(opts.dailyOnly);

    const filters = ["u.status <> 'deleted'", 's.points > 0'];
    if (period === 'day') {
      filters.push("(s.created_at AT TIME ZONE 'Europe/Madrid')::date = (NOW() AT TIME ZONE 'Europe/Madrid')::date");
    } else if (period === 'week') {
      filters.push("s.created_at >= NOW() - INTERVAL '7 days'");
    }
    if (dailyOnly) {
      filters.push('s.is_daily = TRUE');
    }

    const { rows } = await this.pool.query(
      `SELECT u.id AS user_id,
              COALESCE(
                NULLIF(TRIM(u.nickname), ''),
                (ARRAY_AGG(NULLIF(TRIM(s.nickname), '') ORDER BY s.points DESC, s.created_at ASC))[1]
              ) AS nickname,
              u.email,
              MAX(s.points)::int AS points,
              (ARRAY_AGG(s.kills ORDER BY s.points DESC, s.created_at ASC))[1] AS kills,
              (ARRAY_AGG(s.sector ORDER BY s.points DESC, s.created_at ASC))[1] AS sector,
              (ARRAY_AGG(s.duration_ms ORDER BY s.points DESC, s.created_at ASC))[1] AS duration_ms,
              MAX(s.created_at) AS created_at
       FROM scores s
       JOIN users u ON u.id = s.user_id
       WHERE ${filters.join(' AND ')}
       GROUP BY u.id, u.email, u.nickname
       ORDER BY MAX(s.points) DESC, MIN(s.duration_ms) ASC
       LIMIT $1`,
      [safeLimit]
    );
    return rows.map((row) => ({
      userId: row.user_id,
      nickname: row.nickname || null,
      email: row.email,
      points: row.points,
      kills: row.kills,
      sector: row.sector || 1,
      durationMs: row.duration_ms,
      createdAt: row.created_at?.toISOString?.() ?? row.created_at
    }));
  }

  async stats() {
    const { rows } = await this.pool.query(
      `SELECT
         (SELECT COUNT(*)::int FROM scores s JOIN users u ON u.id = s.user_id WHERE u.status <> 'deleted') AS matches_played,
         (SELECT COALESCE(SUM(s.kills), 0)::int FROM scores s JOIN users u ON u.id = s.user_id WHERE u.status <> 'deleted') AS total_kills,
         (SELECT COALESCE(MAX(s.sector), 0)::int FROM scores s JOIN users u ON u.id = s.user_id WHERE u.status <> 'deleted') AS max_sector,
         (SELECT COUNT(*)::int FROM users WHERE status <> 'deleted') AS registered_players`
    );
    const row = rows[0] || {};
    return {
      matchesPlayed: row.matches_played || 0,
      totalKills: row.total_kills || 0,
      maxSector: row.max_sector || 0,
      registeredPlayers: row.registered_players || 0
    };
  }
}
