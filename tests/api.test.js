import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createApp } from '../src/app.js';
import { UserRepositoryMemory } from '../src/repositories/userRepository.memory.js';
import { ScoreRepositoryMemory } from '../src/repositories/scoreRepository.memory.js';
import { UserService } from '../src/services/userService.js';
import { ScoreService } from '../src/services/scoreService.js';

let app, repo, userService, admin, user;
const logger = pino({ level: 'silent' });
const ADMIN_PASSWORD = 'admin-password-1234';
const USER_PASSWORD = 'marine-password-123';

async function csrf(agent) {
  const response = await agent.get('/api/auth/csrf');
  expect(response.status).toBe(200);
  return response.body.csrfToken;
}
async function login(agent, email, password) {
  let token = await csrf(agent);
  const response = await agent.post('/api/auth/login').set('X-CSRF-Token', token).send({ email, password });
  return response;
}

beforeEach(async () => {
  repo = new UserRepositoryMemory();
  userService = new UserService(repo, { bcryptRounds: 4 });
  const scoreRepo = new ScoreRepositoryMemory(repo);
  app = createApp({ userService, scoreService: new ScoreService(scoreRepo), sessionSecret: 'unit-test-session-secret-long-enough', production: false, logger });
  admin = await userService.ensureAdmin('admin@hellfall.test', ADMIN_PASSWORD);
  user = await userService.register({ email: 'player@hellfall.test', password: USER_PASSWORD });
});

describe('API HTTP', () => {
  it('expone health check', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('no acepta modificación sin token CSRF', async () => {
    const agent = request.agent(app);
    const response = await agent.post('/api/auth/login').send({ email: 'player@hellfall.test', password: USER_PASSWORD });
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CSRF_TOKEN_REQUIRED');
  });

  it('registra, inicia sesión y mantiene la sesión al consultar /me', async () => {
    const agent = request.agent(app);
    const token = await csrf(agent);
    const registerResponse = await agent.post('/api/auth/register').set('X-CSRF-Token', token).send({ email: 'new@hellfall.test', password: USER_PASSWORD });
    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.user.email).toBe('new@hellfall.test');
    const loginResponse = await login(agent, 'new@hellfall.test', USER_PASSWORD);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.role).toBe('user');
    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe('new@hellfall.test');
  });

  it('requiere autenticación para consultar el perfil', async () => {
    const response = await request(app).get('/api/auth/me');
    expect(response.status).toBe(401);
  });

  it('usuario normal no puede listar usuarios', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);
    const response = await agent.get('/api/users');
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('ADMIN_REQUIRED');
  });

  it('administrador puede listar usuarios', async () => {
    const agent = request.agent(app);
    await login(agent, 'admin@hellfall.test', ADMIN_PASSWORD);
    const response = await agent.get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body.users.map((item) => item.email)).toContain('player@hellfall.test');
    expect(response.body.users[0]).not.toHaveProperty('passwordHash');
  });

  it('usuario no puede eliminar la cuenta de otro usuario', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);
    const me = await agent.get('/api/auth/me');
    const response = await agent.delete(`/api/users/${admin.id}`).set('X-CSRF-Token', me.body.csrfToken).send({});
    expect(response.status).toBe(403);
  });

  it('usuario puede guardar una puntuación autenticado y el servidor calcula el total', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);
    const me = await agent.get('/api/auth/me');
    const response = await agent.post('/api/scores').set('X-CSRF-Token', me.body.csrfToken).send({ kills: 3, durationMs: 12000, points: 999999 });
    expect(response.status).toBe(201);
    expect(response.body.score.points).toBe(300);
  });

  it('rechaza número de bajas fuera del límite', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);
    const me = await agent.get('/api/auth/me');
    const response = await agent.post('/api/scores').set('X-CSRF-Token', me.body.csrfToken).send({ kills: 1000000, durationMs: 12000 });
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_KILLS');
  });

  it('cerrar sesión invalida el acceso protegido', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);
    const me = await agent.get('/api/auth/me');
    const out = await agent.post('/api/auth/logout').set('X-CSRF-Token', me.body.csrfToken).send({});
    expect(out.status).toBe(200);
    const again = await agent.get('/api/auth/me');
    expect(again.status).toBe(401);
  });
});
