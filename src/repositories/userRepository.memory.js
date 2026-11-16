import { randomUUID } from 'node:crypto';

/** Implementación de desarrollo/pruebas. Tiene la misma interfaz que userRepository.pg.js. */
export class UserRepositoryMemory {
  constructor(seed = []) {
    this.users = seed.map((user) => ({ ...user }));
  }

  async create({ id = randomUUID(), email, passwordHash, role = 'user', status = 'active', createdAt = new Date().toISOString(), confirmationToken = null, confirmationExpiresAt = null, confirmedAt = null }) {
    if (this.users.some((user) => user.email === email)) {
      const error = new Error('El correo ya está registrado.');
      error.code = '23505';
      throw error;
    }
    const user = { id, email, passwordHash, role, status, createdAt, confirmationToken, confirmationExpiresAt, confirmedAt };
    this.users.push(user);
    return { ...user };
  }

  async findByEmail(email) {
    const user = this.users.find((item) => item.email === email);
    return user ? { ...user } : null;
  }

  async findById(id) {
    const user = this.users.find((item) => item.id === id);
    return user ? { ...user } : null;
  }

  async list() {
    return this.users
      .slice()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .map((user) => ({ ...user }));
  }

  async update(id, patch) {
    const index = this.users.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...patch };
    return { ...this.users[index] };
  }

  async findByConfirmationTokenHash(tokenHash) {
    const user = this.users.find((item) => item.confirmationToken === tokenHash);
    return user ? { ...user } : null;
  }

  async findByVerificationTokenHash(tokenHash) {
    return this.findByConfirmationTokenHash(tokenHash);
  }

  async activateUser(id) {
    const user = await this.update(id, { status: 'active', confirmationToken: null, confirmationExpiresAt: null, confirmedAt: new Date().toISOString() });
    return user;
  }
}
