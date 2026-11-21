import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createApp } from '../src/app.js';
import { ChallengeService } from '../src/services/challengeService.js';
import { UserRepositoryMemory } from '../src/repositories/userRepository.memory.js';
import { ScoreRepositoryMemory } from '../src/repositories/scoreRepository.memory.js';
import { UserService } from '../src/services/userService.js';
import { ScoreService } from '../src/services/scoreService.js';

const SECRETO = 'secreto-de-pruebas-para-el-desafio';

describe('ChallengeService (desafío diario)', () => {
  it('el mismo día da siempre la misma semilla', () => {
    const servicio = new ChallengeService({ secret: SECRETO, now: () => new Date('2026-11-20T10:00:00Z') });
    const a = servicio.today();
    const b = servicio.today();
    expect(a).toEqual(b);
    expect(a.date).toBe('2026-11-20');
    expect(Number.isInteger(a.seed)).toBe(true);
    expect(a.seed).toBeGreaterThanOrEqual(0);
    expect(a.seed).toBeLessThan(2 ** 32);
  });

  it('cada día tiene una semilla distinta', () => {
    const servicio = new ChallengeService({ secret: SECRETO });
    expect(servicio.semillaDe('2026-11-20')).not.toBe(servicio.semillaDe('2026-11-21'));
  });

  it('la semilla depende del secreto del servidor', () => {
    const a = new ChallengeService({ secret: SECRETO });
    const b = new ChallengeService({ secret: 'otro-secreto-distinto' });
    expect(a.semillaDe('2026-11-20')).not.toBe(b.semillaDe('2026-11-20'));
  });

  it('el día cambia a medianoche en España, no en UTC', () => {
    // 23:30 UTC del 20/11 son las 00:30 del 21/11 en Madrid
    const servicio = new ChallengeService({ secret: SECRETO, now: () => new Date('2026-11-20T23:30:00Z') });
    expect(servicio.today().date).toBe('2026-11-21');
  });

  it('exige un secreto', () => {
    expect(() => new ChallengeService({})).toThrow();
  });
});

describe('GET /api/challenge/today', () => {
  it('es público y devuelve la fecha y la semilla del día', async () => {
    const repo = new UserRepositoryMemory();
    const app = createApp({
      userService: new UserService(repo, { bcryptRounds: 4 }),
      scoreService: new ScoreService(new ScoreRepositoryMemory(repo)),
      challengeService: new ChallengeService({ secret: SECRETO, now: () => new Date('2026-11-20T10:00:00Z') }),
      sessionSecret: 'unit-test-session-secret-long-enough',
      logger: pino({ level: 'silent' })
    });
    const response = await request(app).get('/api/challenge/today');
    expect(response.status).toBe(200);
    expect(response.body.date).toBe('2026-11-20');
    expect(response.body.seed).toBe(new ChallengeService({ secret: SECRETO }).semillaDe('2026-11-20'));
  });
});
