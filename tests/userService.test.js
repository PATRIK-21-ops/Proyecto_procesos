import { describe, it, expect, beforeEach } from 'vitest';
import { UserRepositoryMemory } from '../src/repositories/userRepository.memory.js';
import { UserService } from '../src/services/userService.js';

const ADMIN_EMAIL = 'admin@test.local';
const ADMIN_PASSWORD = 'admin-password-test-123';
const USER_PASSWORD = 'marine-password-123';

let repo;
let service;
let admin;
let user;

beforeEach(async () => {
  repo = new UserRepositoryMemory();
  service = new UserService(repo, { bcryptRounds: 4 });
  admin = await service.ensureAdmin(ADMIN_EMAIL, ADMIN_PASSWORD);
  user = await service.register({ email: 'marine@test.local', password: USER_PASSWORD });
});

describe('UserService — reglas de negocio (PBI 1, 8, 9, 10, 12)', () => {
  it('registra usuario y guarda hash, nunca la contraseña original', async () => {
    const created = await service.register({ email: '  New@Test.Local ', password: USER_PASSWORD });
    expect(created.email).toBe('new@test.local');
    expect(created.passwordHash).not.toBe(USER_PASSWORD);
    expect(created.passwordHash).toMatch(/^\$2[aby]\$/);
    expect(created.role).toBe('user');
    expect(created.status).toBe('active');
  });

  it('rechaza email duplicado incluso si cambia mayúsculas', async () => {
    await expect(service.register({ email: 'MARINE@test.local', password: USER_PASSWORD }))
      .rejects.toMatchObject({ status: 409, code: 'EMAIL_EXISTS' });
  });

  it('rechaza un email inválido', async () => {
    await expect(service.register({ email: 'no-es-un-email', password: USER_PASSWORD }))
      .rejects.toMatchObject({ status: 400, code: 'INVALID_EMAIL' });
  });

  it('rechaza contraseña demasiado corta', async () => {
    await expect(service.register({ email: 'a@test.local', password: '123' }))
      .rejects.toMatchObject({ status: 400, code: 'WEAK_PASSWORD' });
  });

  it('autentica con la contraseña correcta', async () => {
    const authenticated = await service.authenticate({ email: 'MARINE@test.local', password: USER_PASSWORD });
    expect(authenticated.id).toBe(user.id);
  });

  it('rechaza contraseña incorrecta con respuesta genérica', async () => {
    await expect(service.authenticate({ email: 'marine@test.local', password: 'wrong-password' }))
      .rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('rechaza inicio de sesión con un usuario inexistente', async () => {
    await expect(service.authenticate({ email: 'missing@test.local', password: USER_PASSWORD }))
      .rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('solo el administrador puede listar usuarios', async () => {
    const users = await service.listUsers({ id: admin.id, role: 'admin' });
    expect(users.map((item) => item.email)).toContain(user.email);
    await expect(service.listUsers({ id: user.id, role: 'user' }))
      .rejects.toMatchObject({ status: 403, code: 'ADMIN_REQUIRED' });
  });

  it('solo el administrador puede comprobar actividad', async () => {
    await expect(service.isActive({ id: user.id, role: 'user' }, user.id))
      .rejects.toMatchObject({ status: 403, code: 'ADMIN_REQUIRED' });
    await expect(service.isActive({ id: admin.id, role: 'admin' }, user.id)).resolves.toBe(true);
  });

  it('responde not found al consultar un id inexistente', async () => {
    await expect(service.isActive({ id: admin.id, role: 'admin' }, 'missing-id'))
      .rejects.toMatchObject({ status: 404, code: 'USER_NOT_FOUND' });
  });

  it('un usuario normal no puede eliminar otra cuenta', async () => {
    await expect(service.deleteUser({ id: user.id, role: 'user' }, admin.id))
      .rejects.toMatchObject({ status: 403, code: 'CANNOT_DELETE_OTHER_USER' });
  });

  it('un usuario puede eliminar su propia cuenta mediante borrado lógico', async () => {
    const deleted = await service.deleteUser({ id: user.id, role: 'user' }, user.id);
    expect(deleted.status).toBe('deleted');
    await expect(service.isActive({ id: admin.id, role: 'admin' }, user.id)).resolves.toBe(false);
    await expect(service.authenticate({ email: user.email, password: USER_PASSWORD }))
      .rejects.toMatchObject({ status: 401, code: 'INVALID_CREDENTIALS' });
  });

  it('el administrador puede eliminar a cualquier usuario', async () => {
    const deleted = await service.deleteUser({ id: admin.id, role: 'admin' }, user.id);
    expect(deleted.status).toBe('deleted');
  });

  it('no permite acceder a una sesión asociada con una cuenta eliminada', async () => {
    await service.deleteUser({ id: admin.id, role: 'admin' }, user.id);
    await expect(service.getCurrentUser(user.id)).rejects.toMatchObject({ status: 401, code: 'INVALID_SESSION' });
  });

  it('crea administrador inicial y lo marca como admin', async () => {
    expect(admin.role).toBe('admin');
    expect((await repo.findByEmail(ADMIN_EMAIL)).role).toBe('admin');
  });

  it('no permite que la contraseña del primer administrador sea corta', async () => {
    await expect(service.ensureAdmin('second@test.local', 'short'))
      .rejects.toThrow(/ADMIN_EMAIL debe ser un correo válido y la contraseña debe tener al menos 12 caracteres./);
  });

  it('registra o autentica correctamente a un usuario mediante Google OAuth', async () => {
    const user1 = await service.loginWithGoogle({ email: 'jugador@gmail.com' });
    expect(user1.email).toBe('jugador@gmail.com');
    expect(user1.id).toBeDefined();

    const user2 = await service.loginWithGoogle({ email: 'jugador@gmail.com' });
    expect(user2.id).toBe(user1.id);
  });
});

describe('UserService — Confirmación de correo electrónico (Brevo)', () => {
  function createTestSetup() {
    const confirmRepo = new UserRepositoryMemory();
    const confirmService = new UserService(confirmRepo, {
      bcryptRounds: 4,
      requireEmailConfirmation: true
    });

    let sentEmailData = null;
    confirmService.emailService.sendConfirmationEmail = async ({ toEmail, confirmUrl }) => {
      sentEmailData = { toEmail, confirmUrl };
    };

    return {
      service: confirmService,
      repo: confirmRepo,
      getSentEmail: () => sentEmailData
    };
  }

  it('deja la cuenta en estado pending al registrarse y genera el enlace con token de activación', async () => {
    const { service: confirmService, repo: confirmRepo, getSentEmail } = createTestSetup();

    const result = await confirmService.register({
      email: 'recluta@gmail.com',
      password: 'PasswordSegura123'
    });

    expect(result.pendingConfirmation).toBe(true);
    expect(result.email).toBe('recluta@gmail.com');

    const storedUser = await confirmRepo.findByEmail('recluta@gmail.com');
    expect(storedUser).not.toBeNull();
    expect(storedUser.status).toBe('pending');

    const sent = getSentEmail();
    expect(sent).not.toBeNull();
    expect(sent.toEmail).toBe('recluta@gmail.com');
    expect(sent.confirmUrl).toContain('/api/auth/confirm?token=');
  });

  it('bloquea el inicio de sesión si la cuenta aún está pendiente de confirmar por correo', async () => {
    const { service: confirmService } = createTestSetup();

    await confirmService.register({
      email: 'pendiente@gmail.com',
      password: 'PasswordSegura123'
    });

    await expect(
      confirmService.authenticate({
        email: 'pendiente@gmail.com',
        password: 'PasswordSegura123'
      })
    ).rejects.toMatchObject({
      status: 403,
      code: 'ACCOUNT_PENDING_CONFIRMATION'
    });
  });

  it('activa la cuenta al confirmar el token del correo y permite iniciar sesión después', async () => {
    const { service: confirmService, repo: confirmRepo, getSentEmail } = createTestSetup();

    await confirmService.register({
      email: 'activar@gmail.com',
      password: 'PasswordSegura123'
    });

    const { confirmUrl } = getSentEmail();
    const urlObj = new URL(confirmUrl);
    const token = urlObj.searchParams.get('token');

    const activatedUser = await confirmService.confirmEmailToken(token);
    expect(activatedUser.status).toBe('active');

    const storedUser = await confirmRepo.findByEmail('activar@gmail.com');
    expect(storedUser.status).toBe('active');

    const loggedIn = await confirmService.authenticate({
      email: 'activar@gmail.com',
      password: 'PasswordSegura123'
    });
    expect(loggedIn.email).toBe('activar@gmail.com');
    expect(loggedIn.status).toBe('active');
  });

  it('rechaza un token de confirmación inválido o manipulado', async () => {
    const { service: confirmService } = createTestSetup();

    await expect(
      confirmService.confirmEmailToken('token-falso.firma-invalida')
    ).rejects.toMatchObject({
      status: 400,
      code: 'INVALID_CONFIRMATION_TOKEN'
    });
  });
});