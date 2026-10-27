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

    // Si vuelve a entrar con el mismo correo de Google, devuelve el mismo usuario sin duplicarlo
    const user2 = await service.loginWithGoogle({ email: 'jugador@gmail.com' });
    expect(user2.id).toBe(user1.id);
  });
});
