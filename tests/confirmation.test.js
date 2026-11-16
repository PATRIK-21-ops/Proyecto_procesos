import { beforeEach, describe, expect, it } from 'vitest';
import { UserRepositoryMemory } from '../src/repositories/userRepository.memory.js';
import { UserService } from '../src/services/userService.js';

const PASSWORD = 'marine-password-123';

let repo;
let service;
let sentEmails;

function createService({ requireConfirmation = true } = {}) {
  const userService = new UserService(repo, {
    bcryptRounds: 4,
    config: { REQUIRE_EMAIL_CONFIRMATION: String(requireConfirmation) }
  });
  userService.emailService.sendVerificationEmail = async (toEmail, rawToken) => {
    sentEmails.push({ toEmail, rawToken });
    return { simulated: true };
  };
  return userService;
}

beforeEach(() => {
  repo = new UserRepositoryMemory();
  sentEmails = [];
  service = createService();
});

describe('Confirmación de correo — reglas de negocio', () => {
  it('registra la cuenta como pendiente, guarda solo el hash y envía el token', async () => {
    const result = await service.register({ email: 'nuevo@uclm.es', password: PASSWORD });

    expect(result.pendingConfirmation).toBe(true);
    expect(result.email).toBe('nuevo@uclm.es');
    expect(sentEmails).toHaveLength(1);
    expect(sentEmails[0].toEmail).toBe('nuevo@uclm.es');
    expect(sentEmails[0].rawToken).toMatch(/^[a-f0-9]{64}$/);

    const stored = await repo.findByEmail('nuevo@uclm.es');
    expect(stored.status).toBe('pending');
    expect(stored.confirmationToken).toBe(service.emailService.hashToken(sentEmails[0].rawToken));
    expect(stored.confirmationToken).not.toBe(sentEmails[0].rawToken);
    expect(new Date(stored.confirmationExpiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('no permite iniciar sesión hasta confirmar el correo', async () => {
    await service.register({ email: 'nuevo@uclm.es', password: PASSWORD });

    await expect(service.authenticate({ email: 'nuevo@uclm.es', password: PASSWORD }))
      .rejects.toMatchObject({ status: 403, code: 'ACCOUNT_PENDING_CONFIRMATION' });
  });

  it('activa la cuenta con un token válido y permite el login posterior', async () => {
    await service.register({ email: 'nuevo@uclm.es', password: PASSWORD });
    const rawToken = sentEmails[0].rawToken;

    const confirmed = await service.confirmEmailToken(rawToken);
    expect(confirmed.status).toBe('active');
    expect(confirmed.confirmationToken).toBeNull();
    expect(confirmed.confirmationExpiresAt).toBeNull();
    expect(confirmed.confirmedAt).toBeTruthy();

    const authenticated = await service.authenticate({ email: 'nuevo@uclm.es', password: PASSWORD });
    expect(authenticated.email).toBe('nuevo@uclm.es');
    expect(authenticated.status).toBe('active');
  });

  it('acepta el token con espacios alrededor', async () => {
    await service.register({ email: 'nuevo@uclm.es', password: PASSWORD });
    const confirmed = await service.confirmEmailToken(`  ${sentEmails[0].rawToken}  `);
    expect(confirmed.status).toBe('active');
  });

  it('rechaza un token inexistente o vacío', async () => {
    await expect(service.confirmEmailToken('token-que-no-existe'))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_CONFIRMATION_TOKEN' });
    await expect(service.confirmEmailToken(''))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_CONFIRMATION_TOKEN' });
  });

  it('rechaza un token caducado y deja la cuenta pendiente', async () => {
    await service.register({ email: 'nuevo@uclm.es', password: PASSWORD });
    const stored = await repo.findByEmail('nuevo@uclm.es');
    await repo.update(stored.id, { confirmationExpiresAt: new Date(Date.now() - 1000).toISOString() });

    await expect(service.confirmEmailToken(sentEmails[0].rawToken))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_CONFIRMATION_TOKEN' });

    const after = await repo.findByEmail('nuevo@uclm.es');
    expect(after.status).toBe('pending');
  });

  it('permite re-registrar una cuenta pendiente y renueva el token', async () => {
    await service.register({ email: 'nuevo@uclm.es', password: PASSWORD });
    const firstToken = sentEmails[0].rawToken;

    const second = await service.register({ email: 'nuevo@uclm.es', password: 'otra-password-123' });
    expect(second.pendingConfirmation).toBe(true);
    expect(sentEmails).toHaveLength(2);
    expect(sentEmails[1].rawToken).not.toBe(firstToken);

    await expect(service.confirmEmailToken(firstToken))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_CONFIRMATION_TOKEN' });

    const confirmed = await service.confirmEmailToken(sentEmails[1].rawToken);
    expect(confirmed.status).toBe('active');

    const authenticated = await service.authenticate({ email: 'nuevo@uclm.es', password: 'otra-password-123' });
    expect(authenticated.status).toBe('active');
  });

  it('registra directamente como activo cuando la confirmación está desactivada', async () => {
    const serviceWithoutConfirmation = createService({ requireConfirmation: false });

    const user = await serviceWithoutConfirmation.register({ email: 'activo@uclm.es', password: PASSWORD });

    expect(user.status).toBe('active');
    expect(user.confirmationToken).toBeNull();
    expect(sentEmails).toHaveLength(0);
    await expect(serviceWithoutConfirmation.authenticate({ email: 'activo@uclm.es', password: PASSWORD }))
      .resolves.toMatchObject({ email: 'activo@uclm.es' });
  });
});
