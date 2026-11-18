import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepositoryMemory } from '../src/repositories/userRepository.memory.js';
import { ScoreRepositoryMemory } from '../src/repositories/scoreRepository.memory.js';
import { UserService } from '../src/services/userService.js';
import { ScoreService } from '../src/services/scoreService.js';
import { loadConfig } from '../src/config/env.js';

let scoreService;
let actor;

beforeEach(async () => {
  const userRepo = new UserRepositoryMemory();
  const userService = new UserService(userRepo, { bcryptRounds: 4 });
  const scoreRepo = new ScoreRepositoryMemory(userRepo);
  scoreService = new ScoreService(scoreRepo);
  const created = await userService.register({ email: 'slayer@test.local', password: 'marine-password-123' });
  actor = { id: created.id, role: 'user' };
});

describe('ScoreService y configuración de límite de bajas', () => {
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
