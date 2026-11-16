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
  const response = await agent.get('/api/csrf-token');
  expect(response.status).toBe(200);
  return response.body.csrfToken;
}

async function login(agent, email, password) {
  const token = await csrf(agent);
  return agent.post('/api/auth/login').set('X-CSRF-Token', token).send({ email, password });
}

function buildApp(service) {
  return createApp({
    userService: service,
    scoreService: new ScoreService(new ScoreRepositoryMemory(repo), { maxKills: 100 }),
    sessionSecret: 'unit-test-session-secret-long-enough',
    production: false,
    logger
  });
}

beforeEach(async () => {
  repo = new UserRepositoryMemory();
  userService = new UserService(repo, {
    bcryptRounds: 4,
    config: { REQUIRE_EMAIL_CONFIRMATION: 'false' }
  });
  app = buildApp(userService);
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

  it('registra, inicia sesión y mantiene la sesión al consultar el perfil', async () => {
    const agent = request.agent(app);
    const token = await csrf(agent);
    const registerResponse = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', token)
      .send({ email: 'new@hellfall.test', password: USER_PASSWORD });

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body.email).toBe('new@hellfall.test');
    expect(registerResponse.body.status).toBe('active');

    const loginResponse = await login(agent, 'new@hellfall.test', USER_PASSWORD);
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.role).toBe('user');

    const me = await agent.get('/api/user/me');
    expect(me.status).toBe(200);
    expect(me.body.email).toBe('new@hellfall.test');
  });

  it('devuelve null en el perfil y 401 en rutas protegidas sin sesión', async () => {
    const me = await request(app).get('/api/user/me');
    expect(me.status).toBe(200);
    expect(me.body).toBeNull();

    const protectedResponse = await request(app).get('/api/scores/mine');
    expect(protectedResponse.status).toBe(401);
    expect(protectedResponse.body.error.code).toBe('UNAUTHORIZED');
  });

  it('usuario normal no puede listar usuarios', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);

    const response = await agent.get('/api/users');
    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('ADMIN_REQUIRED');
  });

  it('administrador puede listar usuarios sin exponer hashes', async () => {
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
    const token = await csrf(agent);

    const response = await agent
      .delete(`/api/user/${admin.id}`)
      .set('X-CSRF-Token', token)
      .send({});

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe('CANNOT_DELETE_OTHER_USER');
  });

  it('usuario puede guardar una puntuación y el servidor calcula el total', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);
    const token = await csrf(agent);

    const response = await agent
      .post('/api/scores')
      .set('X-CSRF-Token', token)
      .send({ kills: 3, durationMs: 12000, points: 999999 });

    expect(response.status).toBe(201);
    expect(response.body.score.points).toBe(300);
    expect(response.body.score.kills).toBe(3);
  });

  it('rechaza número de bajas fuera del límite', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);
    const token = await csrf(agent);

    const response = await agent
      .post('/api/scores')
      .set('X-CSRF-Token', token)
      .send({ kills: 1000000, durationMs: 12000 });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('INVALID_KILLS');
  });

  it('cerrar sesión invalida el acceso protegido', async () => {
    const agent = request.agent(app);
    await login(agent, 'player@hellfall.test', USER_PASSWORD);
    const token = await csrf(agent);

    const out = await agent.post('/api/auth/logout').set('X-CSRF-Token', token).send({});
    expect(out.status).toBe(200);

    const again = await agent.get('/api/scores/mine');
    expect(again.status).toBe(401);
  });

  it('el administrador puede consultar el estado y eliminar a otro usuario', async () => {
    const agent = request.agent(app);
    await login(agent, 'admin@hellfall.test', ADMIN_PASSWORD);
    const token = await csrf(agent);

    const activeBefore = await agent.get(`/api/users/${user.id}/active`);
    expect(activeBefore.status).toBe(200);
    expect(activeBefore.body.active).toBe(true);

    const deleted = await agent.delete(`/api/users/${user.id}`).set('X-CSRF-Token', token).send({});
    expect(deleted.status).toBe(200);
    expect(deleted.body.deleted).toBe(true);

    const activeAfter = await agent.get(`/api/users/${user.id}/active`);
    expect(activeAfter.body.active).toBe(false);
  });

  it('devuelve 501 en /api/auth/google cuando OAuth no está configurado', async () => {
    const response = await request(app).get('/api/auth/google');
    expect(response.status).toBe(501);
    expect(response.body.error).toBe('OAuth no configurado.');
  });
});

describe('API HTTP — confirmación de correo', () => {
  it('registro pendiente, confirmación por enlace y login', async () => {
    const confirmationRepo = new UserRepositoryMemory();
    const confirmationService = new UserService(confirmationRepo, {
      bcryptRounds: 4,
      config: { REQUIRE_EMAIL_CONFIRMATION: 'true' }
    });
    let rawToken = '';
    confirmationService.emailService.sendVerificationEmail = async (toEmail, token) => {
      rawToken = token;
      return { simulated: true, verifyUrl: `http://localhost/api/auth/confirm?token=${token}` };
    };
    const confirmationApp = buildApp(confirmationService);
    const agent = request.agent(confirmationApp);
    const token = await csrf(agent);

    const register = await agent
      .post('/api/auth/register')
      .set('X-CSRF-Token', token)
      .send({ email: 'confirmar@uclm.es', password: USER_PASSWORD });

    expect(register.status).toBe(202);
    expect(register.body.pendingConfirmation).toBe(true);
    expect(register.body.email).toBe('confirmar@uclm.es');
    expect(rawToken).toMatch(/^[a-f0-9]{64}$/);

    const loginBefore = await login(agent, 'confirmar@uclm.es', USER_PASSWORD);
    expect(loginBefore.status).toBe(403);
    expect(loginBefore.body.error.code).toBe('ACCOUNT_PENDING_CONFIRMATION');

    const confirm = await agent.get(`/api/auth/confirm?token=${rawToken}`);
    expect(confirm.status).toBe(302);
    expect(confirm.headers.location).toBe('/?confirmed=success');

    const loginAfter = await login(agent, 'confirmar@uclm.es', USER_PASSWORD);
    expect(loginAfter.status).toBe(200);
    expect(loginAfter.body.status).toBe('active');
  });

  it('redirige con error si el token de confirmación no es válido', async () => {
    const response = await request(app).get('/api/auth/confirm?token=invalido');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/?error=invalid_confirmation_token');
  });
});
