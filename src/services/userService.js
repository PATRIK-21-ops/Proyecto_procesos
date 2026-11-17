import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { badRequest, conflict, forbidden, notFound, unauthorized } from '../utils/AppError.js';
import { EmailService } from './emailService.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function cleanBaseUrl(rawUrl) {
  const str = String(rawUrl || 'https://hellfall-game.onrender.com').trim();
  const withoutMarkdown = str.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  const match = withoutMarkdown.match(/https?:\/\/[^\s)\]]+/);
  return (match ? match[0] : 'https://hellfall-game.onrender.com').replace(/\/$/, '');
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
  constructor(userRepository, { bcryptRounds = 12, requireEmailConfirmation = null } = {}) {
    this.userRepository = userRepository;
    this.bcryptRounds = bcryptRounds;
    this.requireEmailConfirmation = requireEmailConfirmation;
    this.emailService = new EmailService();
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

    const dominioVerif = this.verificarDominioEmail(normalizedEmail);
    if (!dominioVerif.permitido) {
      throw forbidden('El dominio de correo no está permitido.', 'DOMAIN_NOT_ALLOWED');
    }

    const existing = await this.userRepository.findByEmail(normalizedEmail);

    const requireEmailConfirmation =
      this.requireEmailConfirmation !== null
        ? Boolean(this.requireEmailConfirmation)
        : process.env.REQUIRE_EMAIL_CONFIRMATION === 'true' &&
          process.env.NODE_ENV !== 'test' &&
          !process.env.VITEST;
          
    // 1. MODO TEST / SIN CONFIRMACIÓN DE CORREO (Crea el usuario 'active' directamente)
    if (!requireEmailConfirmation) {
      if (existing && existing.status !== 'deleted') {
        throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');
      }

      const passwordHash = await bcrypt.hash(password, this.bcryptRounds);

      try {
        if (existing && existing.status === 'deleted') {
          return await this.userRepository.update(existing.id, {
            status: 'active',
            passwordHash
          });
        }
        return await this.userRepository.create({
          email: normalizedEmail,
          passwordHash,
          role: 'user',
          status: 'active'
        });
      } catch (error) {
        if (error.code === '23505') {
          throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');
        }
        throw error;
      }
    }

    // 2. MODO PRODUCCIÓN CON BREVO (Render: REQUIRE_EMAIL_CONFIRMATION=true)
    if (existing && existing.status === 'active') {
      throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, this.bcryptRounds);

    const token = this.emailService.createConfirmationToken({
      email: normalizedEmail,
      passwordHash
    });
    const baseUrl = cleanBaseUrl(process.env.APP_BASE_URL);
    const confirmUrl = `${baseUrl}/api/auth/confirm?token=${encodeURIComponent(token)}`;

    try {
      await this.emailService.sendConfirmationEmail({
        toEmail: normalizedEmail,
        confirmUrl
      });
    } catch (emailError) {
      console.error('Error real de Brevo:', emailError);
      throw badRequest(`Fallo al enviar el correo (${emailError.code || emailError.message}).`, 'BREVO_FAILED');
    }

    try {
      if (existing) {
        await this.userRepository.update(existing.id, { status: 'pending', passwordHash });
      } else {
        await this.userRepository.create({
          email: normalizedEmail,
          passwordHash,
          role: 'user',
          status: 'pending'
        });
      }
    } catch (error) {
      if (error.code === '23505') throw conflict('Ya existe una cuenta con ese correo.', 'EMAIL_EXISTS');
      throw error;
    }

    return {
      pendingConfirmation: true,
      email: normalizedEmail,
      message: `Se ha enviado un correo de verificación a ${normalizedEmail}. Revisa tu bandeja de entrada (y Spam) para activar tu cuenta.`
    };
  }

  async confirmEmailToken(token) {
    const payload = this.emailService.verifyConfirmationToken(token);
    if (!payload || !payload.email || !payload.passwordHash) {
      throw badRequest('El enlace de activación no es válido o ha caducado.', 'INVALID_CONFIRMATION_TOKEN');
    }

    let user = await this.userRepository.findByEmail(payload.email);
    if (!user) {
      user = await this.userRepository.create({
        email: payload.email,
        passwordHash: payload.passwordHash,
        role: 'user',
        status: 'active'
      });
      return user;
    }

    if (user.status === 'active') {
      return user;
    }

    const updated = await this.userRepository.update(user.id, {
      status: 'active',
      passwordHash: payload.passwordHash
    });
    return updated;
  }

  async authenticate({ email, password }) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || typeof password !== 'string') {
      throw unauthorized('Correo o contraseña incorrectos.', 'INVALID_CREDENTIALS');
    }
    const user = await this.userRepository.findByEmail(normalizedEmail);

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
        const randomPassword = crypto.randomUUID();
        const passwordHash = await bcrypt.hash(randomPassword, this.bcryptRounds);
        return await this.userRepository.update(existing.id, {
          status: 'active',
          passwordHash
        });
      }
      if (existing.status !== 'active') {
        return await this.userRepository.update(existing.id, { status: 'active' });
      }
      return existing;
    }

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