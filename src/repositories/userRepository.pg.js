import { randomUUID } from 'node:crypto';

const COLUMNS = {
  email: 'email',
  passwordHash: 'password_hash',
  role: 'role',
  status: 'status'
};

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    status: row.status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

/** Implementación PostgreSQL. Mantén esta interfaz alineada con UserRepositoryMemory. */
export class UserRepositoryPg {
  constructor(pool) {
    this.pool = pool;
  }

  async create({ id = randomUUID(), email, passwordHash, role = 'user', status = 'active' }) {
    const { rows } = await this.pool.query(
      `INSERT INTO users (id, email, password_hash, role, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, password_hash, role, status, created_at`,
      [id, email, passwordHash, role, status]
    );
    return mapUser(rows[0]);
  }

  async findByEmail(email) {
    const { rows } = await this.pool.query(
      'SELECT id, email, password_hash, role, status, created_at FROM users WHERE email = $1 LIMIT 1',
      [email]
    );
    return mapUser(rows[0]);
  }

  async findById(id) {
    const { rows } = await this.pool.query(
      'SELECT id, email, password_hash, role, status, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );
    return mapUser(rows[0]);
  }

  async list() {
    const { rows } = await this.pool.query(
      'SELECT id, email, password_hash, role, status, created_at FROM users ORDER BY created_at DESC'
    );
    return rows.map(mapUser);
  }

  async update(id, patch) {
    const entries = Object.entries(patch).filter(([key]) => Object.hasOwn(COLUMNS, key));
    if (entries.length === 0) return this.findById(id);
    const assignments = entries.map(([key], index) => `${COLUMNS[key]} = $${index + 2}`);
    const values = entries.map(([, value]) => value);
    const { rows } = await this.pool.query(
      `UPDATE users SET ${assignments.join(', ')} WHERE id = $1 RETURNING id, email, password_hash, role, status, created_at`,
      [id, ...values]
    );
    return mapUser(rows[0]);
  }
}
