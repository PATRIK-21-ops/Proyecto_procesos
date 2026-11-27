import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createApp } from '../src/app.js';
import { UserRepositoryMemory } from '../src/repositories/userRepository.memory.js';
import { ScoreRepositoryMemory } from '../src/repositories/scoreRepository.memory.js';
import { UserService } from '../src/services/userService.js';
import { ScoreService, computePlayStreaks } from '../src/services/scoreService.js';

const PASSWORD = 'marine-password-123';

describe('computePlayStreaks (rachas de días jugados)', () => {
  it('devuelve 0/0 sin días jugados o con entradas inválidas', () => {
    expect(computePlayStreaks([], '2026-11-27')).toEqual({ currentStreak: 0, bestStreak: 0 });
    expect(computePlayStreaks(null, '2026-11-27')).toEqual({ currentStreak: 0, bestStreak: 0 });
    expect(computePlayStreaks(['no-es-fecha', 42, '2026/11/27'], '2026-11-27')).toEqual({ currentStreak: 0, bestStreak: 0 });
  });

  it('cuenta una racha de 1 si solo se ha jugado hoy', () => {
    expect(computePlayStreaks(['2026-11-27'], '2026-11-27')).toEqual({ currentStreak: 1, bestStreak: 1 });
  });

  it('mantiene viva la racha si el último día jugado fue ayer', () => {
    expect(computePlayStreaks(['2026-11-24', '2026-11-25', '2026-11-26'], '2026-11-27')).toEqual({ currentStreak: 3, bestStreak: 3 });
  });

  it('rompe la racha actual tras un hueco pero conserva la mejor racha histórica', () => {
    const days = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-20', '2026-11-21'];
    expect(computePlayStreaks(days, '2026-11-21')).toEqual({ currentStreak: 2, bestStreak: 4 });
    expect(computePlayStreaks(days, '2026-11-25')).toEqual({ currentStreak: 0, bestStreak: 4 });
  });

  it('ignora duplicados y el orden de entrada', () => {
    expect(computePlayStreaks(['2026-11-27', '2026-11-26', '2026-11-27', '2026-11-26'], '2026-11-27')).toEqual({ currentStreak: 2, bestStreak: 2 });
  });

  it('encadena días a través de cambio de mes, de año y de 29 de febrero', () => {
    expect(computePlayStreaks(['2025-12-31', '2026-01-01'], '2026-01-01').currentStreak).toBe(2);
    expect(computePlayStreaks(['2028-02-28', '2028-02-29', '2028-03-01'], '2028-03-01').currentStreak).toBe(3);
  });

  it('no cuenta como viva una racha si "hoy" es anterior o no es válido', () => {
    expect(computePlayStreaks(['2026-11-27'], 'invalid').currentStreak).toBe(0);
    expect(computePlayStreaks(['2026-11-27'], '2026-11-25').currentStreak).toBe(0);
  });
});

describe('ScoreService.personalStats', () => {
  let userRepo;
  let scoreService;
  let actor;

  async function playAt(iso, data, who = actor) {
    vi.setSystemTime(new Date(iso));
    return scoreService.submit(who, { durationMs: 60_000, ...data });
  }

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-11-20T10:00:00Z'));
    userRepo = new UserRepositoryMemory();
    const userService = new UserService(userRepo, { bcryptRounds: 4 });
    scoreService = new ScoreService(new ScoreRepositoryMemory(userRepo));
    const created = await userService.register({ email: 'stats@test.local', password: PASSWORD });
    actor = { id: created.id, role: 'user' };
  });

  afterEach(() => vi.useRealTimers());

  it('exige un actor autenticado', async () => {
    await expect(scoreService.personalStats(null)).rejects.toMatchObject({ status: 401 });
  });

  it('devuelve todo a cero para un jugador sin partidas (sin dividir por cero)', async () => {
    const stats = await scoreService.personalStats(actor);
    expect(stats).toEqual({
      matchesPlayed: 0, totalKills: 0, totalPoints: 0, bestPoints: 0, averagePoints: 0,
      maxSector: 0, totalDurationMs: 0, dailyMatches: 0, daysPlayed: 0,
      currentStreak: 0, bestStreak: 0, recent: []
    });
  });

  it('agrega totales, media redondeada, máximos y desafíos diarios', async () => {
    await playAt('2026-11-25T10:00:00Z', { kills: 1, sector: 2 });                         // 100 pts
    await playAt('2026-11-26T10:00:00Z', { kills: 1, sector: 5, isDaily: true });         // 100 pts
    await playAt('2026-11-27T10:00:00Z', { kills: 1, bonusPoints: 50, durationMs: 90_000, sector: 3 }); // 150 pts

    const stats = await scoreService.personalStats(actor);
    expect(stats.matchesPlayed).toBe(3);
    expect(stats.totalKills).toBe(3);
    expect(stats.totalPoints).toBe(350);
    expect(stats.bestPoints).toBe(150);
    expect(stats.averagePoints).toBe(117); // 116.67 redondeado
    expect(stats.maxSector).toBe(5);
    expect(stats.totalDurationMs).toBe(210_000);
    expect(stats.dailyMatches).toBe(1);
    expect(stats.daysPlayed).toBe(3);
    expect(stats.currentStreak).toBe(3);
    expect(stats.bestStreak).toBe(3);
  });

  it('cuenta varias partidas del mismo día como un único día de racha', async () => {
    await playAt('2026-11-27T08:00:00Z', { kills: 1 });
    await playAt('2026-11-27T09:00:00Z', { kills: 2 });
    await playAt('2026-11-27T10:00:00Z', { kills: 3 });
    const stats = await scoreService.personalStats(actor);
    expect(stats.matchesPlayed).toBe(3);
    expect(stats.daysPlayed).toBe(1);
    expect(stats.currentStreak).toBe(1);
  });

  it('usa el calendario de España: 23:30 UTC ya es el día siguiente en Madrid', async () => {
    await playAt('2026-11-26T12:00:00Z', { kills: 1 });
    await playAt('2026-11-26T23:30:00Z', { kills: 1 }); // 27/11 00:30 en Madrid (UTC+1)
    vi.setSystemTime(new Date('2026-11-27T12:00:00Z'));
    const stats = await scoreService.personalStats(actor);
    expect(stats.daysPlayed).toBe(2);
    expect(stats.currentStreak).toBe(2);
  });

  it('la racha actual cae a 0 si pasa más de un día sin jugar', async () => {
    await playAt('2026-11-20T10:00:00Z', { kills: 1 });
    await playAt('2026-11-21T10:00:00Z', { kills: 1 });
    vi.setSystemTime(new Date('2026-11-27T10:00:00Z'));
    const stats = await scoreService.personalStats(actor);
    expect(stats.currentStreak).toBe(0);
    expect(stats.bestStreak).toBe(2);
  });

  it('limita la progresión a las 10 últimas partidas en orden cronológico ascendente', async () => {
    for (let i = 1; i <= 12; i += 1) {
      await playAt(`2026-11-27T${String(i).padStart(2, '0')}:00:00Z`, { kills: i });
    }
    const { recent } = await scoreService.personalStats(actor);
    expect(recent).toHaveLength(10);
    expect(recent.map((r) => r.kills)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(recent[0]).toEqual(expect.objectContaining({ points: 300, sector: 1, isDaily: false }));
    expect(recent[0]).not.toHaveProperty('userId');
  });

  it('no mezcla partidas de otros jugadores', async () => {
    const userService = new UserService(userRepo, { bcryptRounds: 4 });
    const other = await userService.register({ email: 'other@test.local', password: PASSWORD });
    await playAt('2026-11-27T10:00:00Z', { kills: 40 }, { id: other.id, role: 'user' });
    await playAt('2026-11-27T11:00:00Z', { kills: 2 });
    const stats = await scoreService.personalStats(actor);
    expect(stats.matchesPlayed).toBe(1);
    expect(stats.totalKills).toBe(2);
  });

  it('devuelve estadísticas vacías para una cuenta eliminada', async () => {
    await playAt('2026-11-27T10:00:00Z', { kills: 5 });
    await userRepo.update(actor.id, { status: 'deleted' });
    const stats = await scoreService.personalStats(actor);
    expect(stats.matchesPlayed).toBe(0);
    expect(stats.recent).toEqual([]);
  });

  it('degrada a cero si el repositorio no implementa personalStats', async () => {
    const legacy = new ScoreService({});
    const stats = await legacy.personalStats(actor);
    expect(stats.matchesPlayed).toBe(0);
    expect(stats.currentStreak).toBe(0);
  });
});

describe('GET /api/scores/mine/stats', () => {
  let app;

  beforeEach(async () => {
    const userRepo = new UserRepositoryMemory();
    const userService = new UserService(userRepo, { bcryptRounds: 4 });
    const scoreService = new ScoreService(new ScoreRepositoryMemory(userRepo));
    app = createApp({ userService, scoreService, sessionSecret: 'unit-test-session-secret-long-enough', production: false, logger: pino({ level: 'silent' }) });
    await userService.register({ email: 'api-stats@test.local', password: PASSWORD });
  });

  async function loggedAgent() {
    const agent = request.agent(app);
    const { body } = await agent.get('/api/auth/csrf');
    const login = await agent.post('/api/auth/login').set('X-CSRF-Token', body.csrfToken).send({ email: 'api-stats@test.local', password: PASSWORD });
    expect(login.status).toBe(200);
    return { agent, token: login.body.csrfToken || body.csrfToken };
  }

  it('responde 401 sin sesión', async () => {
    const response = await request(app).get('/api/scores/mine/stats');
    expect(response.status).toBe(401);
  });

  it('devuelve las estadísticas del jugador autenticado sin exponer su email', async () => {
    const { agent } = await loggedAgent();
    const csrfRes = await agent.get('/api/auth/csrf');
    const save = await agent.post('/api/scores').set('X-CSRF-Token', csrfRes.body.csrfToken)
      .send({ kills: 7, bonusPoints: 30, durationMs: 45_000, sector: 4, isDaily: true, nickname: 'Doomguy' });
    expect(save.status).toBe(201);

    const response = await agent.get('/api/scores/mine/stats');
    expect(response.status).toBe(200);
    expect(response.body.stats).toEqual(expect.objectContaining({
      matchesPlayed: 1, totalKills: 7, totalPoints: 730, bestPoints: 730, averagePoints: 730,
      maxSector: 4, totalDurationMs: 45_000, dailyMatches: 1, daysPlayed: 1, currentStreak: 1, bestStreak: 1
    }));
    expect(response.body.stats.recent).toHaveLength(1);
    expect(JSON.stringify(response.body)).not.toContain('api-stats@test.local');
  });

  it('no interfiere con GET /api/scores/mine', async () => {
    const { agent } = await loggedAgent();
    const response = await agent.get('/api/scores/mine');
    expect(response.status).toBe(200);
    expect(response.body.scores).toEqual([]);
  });
});
