import { randomUUID } from 'node:crypto';

const COLUMNS = {
  email: 'email',
  passwordHash: 'password_hash',
  role: 'role',
  status: 'status',
  confirmationToken: 'confirmation_token',
  confirmationExpiresAt: 'confirmation_expires_at',
  confirmedAt: 'confirmed_at'
};

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    confirmationToken: row.confirmation_token ?? null,
    confirmationExpiresAt: row.confirmation_expires_at instanceof Date ? row.confirmation_expires_at.toISOString() : (row.confirmation_expires_at ?? null),
    confirmedAt: row.confirmed_at instanceof Date ? row.confirmed_at.toISOString() : (row.confirmed_at ?? null),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

/** Implementación PostgreSQL. Mantén esta interfaz alineada con UserRepositoryMemory. */
export class UserRepositoryPg {
  constructor(pool) {
    this.pool = pool;
  }

  async create({ id = randomUUID(), email, passwordHash, role = 'user', status = 'active', confirmationToken = null, confirmationExpiresAt = null, confirmedAt = null }) {
    const { rows } = await this.pool.query(
      `INSERT INTO users (id, email, password_hash, role, status, confirmation_token, confirmation_expires_at, confirmed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, email, password_hash, role, status, confirmation_token, confirmation_expires_at, confirmed_at, created_at`,
      [id, email, passwordHash, role, status, confirmationToken, confirmationExpiresAt, confirmedAt]
    );
    return mapUser(rows[0]);
  }

  async findByEmail(email) {
    const { rows } = await this.pool.query(
      'SELECT id, email, password_hash, role, status, confirmation_token, confirmation_expires_at, confirmed_at, created_at FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return mapUser(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      'SELECT id, email, password_hash, role, status, confirmation_token, confirmation_expires_at, confirmed_at, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return mapUser(rows[0]);
  }

  async list() {
    const { rows } = await this.pool.query(
      'SELECT id, email, password_hash, role, status, confirmation_token, confirmation_expires_at, confirmed_at, created_at FROM users ORDER BY created_at DESC'
    );
    return rows.map(mapUser);
  }

  async update(id, patch) {
    const entries = Object.entries(patch).filter(([key]) => Object.hasOwn(COLUMNS, key));
    if (entries.length === 0) return this.findById(id);
    const assignments = entries.map(([key], index) => `${COLUMNS[key]} = $${index + 2}`);
    const values = entries.map(([, value]) => value);
    const { rows } = await this.pool.query(
      `UPDATE users SET ${assignments.join(', ')} WHERE id = $1 RETURNING id, email, password_hash, role, status, confirmation_token, confirmation_expires_at, confirmed_at, created_at`,
      [id, ...values]
    );
    return mapUser(rows[0]);
  }

  async findByConfirmationTokenHash(tokenHash) {
    const { rows } = await this.pool.query(
      `SELECT id, email, password_hash, role, status, confirmation_token, confirmation_expires_at, confirmed_at, created_at
       FROM users
       WHERE confirmation_token = $1
       LIMIT 1`,
      [tokenHash]
    );
    return mapUser(rows[0]);
  }

  async findByVerificationTokenHash(tokenHash) {
    return this.findByConfirmationTokenHash(tokenHash);
  }

  async activateUser(id) {
    return this.update(id, { status: 'active', confirmationToken: null, confirmationExpiresAt: null, confirmedAt: new Date().toISOString() });
  }
}
