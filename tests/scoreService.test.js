import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepositoryMemory } from '../src/repositories/userRepository.memory.js';
import { ScoreRepositoryMemory } from '../src/repositories/scoreRepository.memory.js';
import { UserService } from '../src/services/userService.js';
import { ScoreService, formatPublicAlias } from '../src/services/scoreService.js';
import { loadConfig } from '../src/config/env.js';

let userService;
let scoreService;
let actor;

beforeEach(async () => {
  const userRepo = new UserRepositoryMemory();
  userService = new UserService(userRepo, { bcryptRounds: 4 });
  const scoreRepo = new ScoreRepositoryMemory(userRepo);
  scoreService = new ScoreService(scoreRepo);
  const created = await userService.register({ email: 'slayer@test.local', password: 'marine-password-123' });
  actor = { id: created.id, role: 'user' };
});

describe('ScoreService, nicknames y configuración de límite de bajas', () => {
  it('asigna nickname aleatorio a usuarios nuevos, guarda el nickname al enviar puntuación y nunca expone el email en top()', async () => {
    expect(formatPublicAlias('slayer@hellfall.test')).toBe('sla***');
    expect(formatPublicAlias('ab@hellfall.test')).toBe('ab***');
    expect(formatPublicAlias(null)).toBe('Slayer');

    const defaultNickUser = await userService.register({ email: 'sin_nick@test.local', password: 'marine-password-123' });
    expect(defaultNickUser.nickname).toMatch(/^[A-Za-z]+-\d{3}$/);

    await scoreService.submit({ id: defaultNickUser.id, role: 'user' }, { kills: 50, bonusPoints: 500, durationMs: 60000 });
    await scoreService.submit(actor, { kills: 10, bonusPoints: 0, durationMs: 12000, nickname: 'DoomPatrik' });

    const top = await scoreService.top(10);
    expect(top).toHaveLength(2);
    expect(top[0].nickname).toBe(defaultNickUser.nickname);
    expect(top[0].email).toBeUndefined();
    expect(top[1].nickname).toBe('DoomPatrik');
    expect(top[1].email).toBeUndefined();
  });

  it('permite cambiar el nickname cuando el jugador vuelve a guardar puntuación y rechaza nicknames inválidos', async () => {
    await scoreService.submit(actor, { kills: 20, durationMs: 15000, nickname: 'Cazador01', sector: 4 });
    await scoreService.submit(actor, { kills: 35, durationMs: 25000, nickname: 'Slayer Supremo', sector: 8 });
    const top = await scoreService.top(10);
    expect(top[0].nickname).toBe('Slayer Supremo');
    expect(top[0].sector).toBe(8);
    expect(top[0].email).toBeUndefined();

    await expect(scoreService.submit(actor, { kills: 5, durationMs: 10000, nickname: 'x' }))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_NICKNAME' });
    await expect(scoreService.submit(actor, { kills: 5, durationMs: 10000, sector: 15 }))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_SECTOR' });
  });

  it('filtra partidas con 0 puntos en top(), calcula estadísticas y muestra brecha al siguiente puesto', async () => {
    const rival = await userService.register({ email: 'rival@test.local', password: 'marine-password-123' });
    await scoreService.submit(actor, { kills: 0, durationMs: 10000, sector: 1 });
    expect(await scoreService.top(10)).toHaveLength(0);

    await scoreService.submit(actor, { kills: 10, durationMs: 20000, sector: 5, nickname: 'SlayerAlfa' });
    await scoreService.submit({ id: rival.id, role: 'user' }, { kills: 25, durationMs: 30000, sector: 9, nickname: 'RivalTop', isDaily: true });

    const summary = await scoreService.rankingSummary({ limit: 10, period: 'day', viewerUserId: actor.id });
    expect(summary.scores).toHaveLength(2);
    expect(summary.scores[0].isCurrentUser).toBe(false);
    expect(summary.scores[1].isCurrentUser).toBe(true);
    expect(summary.viewerRank).toMatchObject({ rank: 2, nextRank: 1, pointsToNextRank: 1501 });

    const dailyOnly = await scoreService.rankingSummary({ limit: 3, period: 'day', dailyOnly: true });
    expect(dailyOnly.scores).toHaveLength(1);
    expect(dailyOnly.scores[0].nickname).toBe('RivalTop');

    const stats = await scoreService.stats();
    expect(stats).toMatchObject({ matchesPlayed: 3, totalKills: 35, maxSector: 9, registeredPlayers: 2 });
  });
  it('usa un límite amplio por defecto (100000) y permite configurar hasta 500000', () => {
    expect(loadConfig({ NODE_ENV: 'development' }).maxScoreKills).toBe(100000);
    expect(loadConfig({ NODE_ENV: 'development', MAX_SCORE_KILLS: '25000' }).maxScoreKills).toBe(25000);
    expect(loadConfig({ NODE_ENV: 'development', MAX_SCORE_KILLS: '999999' }).maxScoreKills).toBe(500000);
  });

  it('permite guardar partidas frenéticas con cientos o miles de bajas sin lanzar error', async () => {
    const s1 = await scoreService.submit(actor, { kills: 280, bonusPoints: 1450, durationMs: 420000 });
    expect(s1.kills).toBe(280);
    expect(s1.points).toBe(29450);

    const s2 = await scoreService.submit(actor, { kills: 3500, bonusPoints: 15000, durationMs: 1800000 });
    expect(s2.kills).toBe(3500);
    expect(s2.points).toBe(365000);
  });

  it('rechaza valores negativos, decimales o desbordamientos extremos', async () => {
    await expect(scoreService.submit(actor, { kills: -1, durationMs: 10000 }))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_KILLS' });
    await expect(scoreService.submit(actor, { kills: 12.5, durationMs: 10000 }))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_KILLS' });
    await expect(scoreService.submit(actor, { kills: 1000000, durationMs: 10000 }))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_KILLS' });
  });
});
