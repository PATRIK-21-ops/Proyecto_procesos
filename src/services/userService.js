import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { badRequest, conflict, forbidden, notFound, unauthorized } from '../utils/AppError.js';
import { EmailService } from './emailService.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function verificarDominioEmail(email) {
  if (typeof email !== 'string' || !email.includes('@')) {
    const error = new Error('El campo email es obligatorio y debe contener @');
    error.statusCode = 400;
    throw error;
  }

  const partes = email.trim().split('@');
  if (partes.length !== 2 || !partes[0] || !partes[1]) {
    const error = new Error('Formato de email inválido');
    error.statusCode = 400;
    throw error;
  }

  const dominioEmail = partes[1].trim().toLowerCase();

  const rawAllowed = process.env.ALLOWED_DOMAINS || '';
  const dominiosPermitidos = rawAllowed
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);

  if (dominiosPermitidos.length === 0) {
    return { permitido: true };
  }

  const permitido = dominiosPermitidos.includes(dominioEmail);
  return { permitido };
}

export class UserService {
  /** El repositorio se inyecta: la lógica no depende de si los datos están en memoria o PostgreSQL. */
  constructor(userRepository, { bcryptRounds = 12, config = process.env } = {}) {
    this.userRepository = userRepository;
    this.bcryptRounds = bcryptRounds;
    this.config = config;
    this.emailService = new EmailService(config);
  }

  verificarDominioEmail(email) {
    return verificarDominioEmail(email);
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

    // Comprobación de dominio permitido si está configurado
    const dominioVerif = this.verificarDominioEmail(normalizedEmail);
    if (!dominioVerif.permitido) {
      throw forbidden('El dominio de correo no está permitido.', 'DOMAIN_NOT_ALLOWED');
    }

    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing && existing.status !== 'deleted') {
      throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);
    const requireEmailConfirmation = String(this.config.REQUIRE_EMAIL_CONFIRMATION ?? 'true').toLowerCase() !== 'false';

    if (requireEmailConfirmation) {
      const { raw, hash, expiresAt } = this.emailService.createConfirmationToken();
      try {
        let user;
        if (existing && existing.status === 'deleted' && typeof this.userRepository.update === 'function') {
          user = await this.userRepository.update(existing.id, {
            passwordHash,
            role: 'user',
            status: 'pending',
            confirmationToken: hash,
            confirmationExpiresAt: expiresAt,
            confirmedAt: null
          });
        } else {
          user = await this.userRepository.create({
            email: normalizedEmail,
            passwordHash,
            role: 'user',
            status: 'pending',
            confirmationToken: hash,
            confirmationExpiresAt: expiresAt,
            confirmedAt: null
          });
        }
        await this.emailService.sendVerificationEmail(normalizedEmail, raw);
        return {
          pendingConfirmation: true,
          email: normalizedEmail,
          message: 'Te hemos enviado un correo de confirmación. Revisa tu bandeja de entrada para activar la cuenta.'
        };
      } catch (error) {
        if (error.code === '23505') throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');
        throw error;
      }
    }

    try {
      const user = existing && existing.status === 'deleted' && typeof this.userRepository.update === 'function'
        ? await this.userRepository.update(existing.id, { passwordHash, role: 'user', status: 'active', confirmationToken: null, confirmationExpiresAt: null, confirmedAt: new Date().toISOString() })
        : await this.userRepository.create({ email: normalizedEmail, passwordHash, role: 'user', status: 'active' });
      return user;
    } catch (error) {
      if (error.code === '23505') throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');
      throw error;
    }
  }

  async confirmEmailToken(token) {
    const rawToken = typeof token === 'string' ? token.trim() : '';
    if (!rawToken) {
      throw badRequest('El enlace de activación no es válido o ha caducado.', 'INVALID_CONFIRMATION_TOKEN');
    }
    const tokenHash = this.emailService.hashToken(rawToken);
    const user = await this.userRepository.findByConfirmationTokenHash(tokenHash);
    if (!user) {
      throw badRequest('El enlace de activación no es válido o ha caducado.', 'INVALID_CONFIRMATION_TOKEN');
    }

    const expiresAt = user.confirmationExpiresAt ? new Date(user.confirmationExpiresAt).getTime() : 0;
    if (!expiresAt || expiresAt < Date.now()) {
      throw badRequest('El enlace de activación no es válido o ha caducado.', 'INVALID_CONFIRMATION_TOKEN');
    }

    if (user.status === 'active' && !user.confirmationToken) {
      return user;
    }

    const updated = await this.userRepository.update(user.id, {
      status: 'active',
      confirmationToken: null,
      confirmationExpiresAt: null,
      confirmedAt: new Date().toISOString()
    });
    return updated;
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
    if (user.status === 'pending') {
      throw forbidden('La cuenta todavía no está activa. Revisa tu correo.', 'ACCOUNT_PENDING_CONFIRMATION');
    }
    if (user.status !== 'active') {
      throw forbidden('La cuenta todavía no está activa.', 'ACCOUNT_NOT_ACTIVE');
    }
    return user;
  }

  async loginWithGoogle({ email }) {
    const normalizedEmail = normalizeEmail(email);
    if (!EMAIL_RE.test(normalizedEmail) || normalizedEmail.length > 254) {
      throw badRequest('Google no proporcionó una dirección de correo válida.', 'OAUTH_INVALID_EMAIL');
    }

    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      if (existing.status === 'deleted') {
        // Permitimos reactivar o recrear la identidad si fue eliminada previamente
        const randomPassword = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(randomPassword, this.bcryptRounds);
        return await this.userRepository.update(existing.id, {
          status: 'active',
          passwordHash
        });
      }
      if (existing.status !== 'active') {
        // Si estaba pendiente de confirmación local, Google OAuth la valida automáticamente
        return await this.userRepository.update(existing.id, { status: 'active' });
      }
      return existing;
    }

    // Generamos una contraseña aleatoria de 36 bytes para cumplir con el esquema sin superar los 72 bytes de bcrypt
    const randomPassword = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(randomPassword, this.bcryptRounds);

    try {
      return await this.userRepository.create({
        email: normalizedEmail,
        passwordHash,
        role: 'user',
        status: 'active'
      });
    } catch (error) {
      if (error.code === '23505') {
        const row = await this.userRepository.findByEmail(normalizedEmail);
        if (row && row.status !== 'active') {
          return await this.userRepository.update(row.id, { status: 'active' });
        }
        return row;
      }
      throw error;
    }
  }

  async getCurrentUser(id) {
    const user = await this.userRepository.findById(id);
    if (!user || user.status === 'deleted' || user.status !== 'active') {
      throw unauthorized('La sesión ya no es válida.', 'INVALID_SESSION');
    }
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
      throw new Error('ADMIN_EMAIL debe ser un correo válido y la contraseña debe tener al menos 12 caracteres.');
    }
    const existing = await this.userRepository.findByEmail(normalizedEmail);
    if (existing) {
      return this.userRepository.update(existing.id, { role: 'admin', status: 'active' });
    }
    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);
    return this.userRepository.create({ email: normalizedEmail, passwordHash, role: 'admin', status: 'active' });
  }
}