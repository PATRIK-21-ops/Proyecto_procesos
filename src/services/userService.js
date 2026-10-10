import bcrypt from 'bcryptjs';
import { badRequest, conflict, forbidden, notFound, unauthorized } from '../utils/AppError.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export class UserService {
  /** El repositorio se inyecta: la lógica no depende de si los datos están en memoria o PostgreSQL. */
  constructor(userRepository, { bcryptRounds = 12 } = {}) {
    this.userRepository = userRepository;
    this.bcryptRounds = bcryptRounds;
  }

  async register({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 254) {
      throw badRequest('Introduce una dirección de correo válida.', 'INVALID_EMAIL');
    }
    if (typeof password !== 'string' || password.length < 8) {
      throw badRequest('La contraseña debe tener al menos 8 caracteres.', 'WEAK_PASSWORD');
    }
    if (Buffer.byteLength(password, 'utf8') > 72) {
      throw badRequest('La contraseña no puede superar 72 bytes.', 'PASSWORD_TOO_LONG');
    }
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');

    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);
    try {
      // En Hito 2 se permite activación inmediata; la confirmación por correo queda para el Hito 4.
      return await this.userRepository.create({ email: normalizedEmail, passwordHash, role: 'user', status: 'active' });
    } catch (error) {
      // Cubre la carrera entre dos registros simultáneos con el mismo email en PostgreSQL.
      if (error.code === '23505') throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');
      throw error;
    }
  }

  async authenticate({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || typeof password !== 'string') {
      throw unauthorized('Correo o contraseña incorrectos.', 'INVALID_CREDENTIALS');
    }
    const user = await this.userRepository.findByEmail(normalizedEmail);
    // Respuesta genérica para evitar revelar si un email está registrado.
    if (!user || user.status === 'deleted' || !(await bcrypt.compare(password, user.passwordHash))) {
      throw unauthorized('Correo o contraseña incorrectos.', 'INVALID_CREDENTIALS');
    }
    if (user.status !== 'active') {
      throw forbidden('La cuenta todavía no está activa.', 'ACCOUNT_NOT_ACTIVE');
    }
    return user;
  }

  async getCurrentUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user || user.status === 'deleted') throw unauthorized('La sesión ya no es válida.', 'INVALID_SESSION');
    return user;
  }

  assertAdmin(actor) {
    if (!actor || actor.role !== 'admin') throw forbidden('Esta operación requiere el rol de administrador.', 'ADMIN_REQUIRED');
  }

  async listUsers(actor) {
    this.assertAdmin(actor);
    return this.userRepository.list();
  }

  async isActive(actor, id) {
    this.assertAdmin(actor);
    const user = await this.userRepository.findById(id);
    if (!user) throw notFound('No existe ese usuario.', 'USER_NOT_FOUND');
    return user.status === 'active';
  }

  async deleteUser(actor, id) {
    if (!actor) throw unauthorized();
    const target = await this.userRepository.findById(id);
    if (!target) throw notFound('No existe ese usuario.', 'USER_NOT_FOUND');
    if (target.status === 'deleted') return target;
    if (actor.role !== 'admin' && actor.id !== target.id) {
      throw forbidden('Un usuario normal solo puede eliminar su propia cuenta.', 'CANNOT_DELETE_OTHER_USER');
    }
    const updated = await this.userRepository.update(id, { status: 'deleted' });
    return updated;
  }

  async ensureAdmin(email, password) {
    const normalizedEmail = normalizeEmail(email);
    if (!EMAIL_RE.test(normalizedEmail) || typeof password !== 'string' || password.length < 12 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new Error('ADMIN_EMAIL debe ser un correo válido y ADMIN_PASSWORD debe tener entre 12 y 72 bytes.');
    }
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      return this.userRepository.update(existing.id, { role: 'admin', status: 'active' });
    }
    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);
    return this.userRepository.create({ email: normalizedEmail, passwordHash, role: 'admin', status: 'active' });
  }
}
