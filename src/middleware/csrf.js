import { randomBytes, timingSafeEqual } from 'node:crypto';
import { AppError } from '../utils/AppError.js';

export function issueCsrfToken(session) {
  const token = randomBytes(32).toString('hex');
  session.csrfToken = token;
  return token;
}

export function csrfProtection(req, res, next) {
  const expected = req.session?.csrfToken;
  const provided = req.get('X-CSRF-Token');
  if (!expected || !provided) {
    return next(new AppError(403, 'CSRF_TOKEN_REQUIRED', 'Falta el token de seguridad. Recarga la página e inténtalo de nuevo.'));
  }
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length || !timingSafeEqual(expectedBuffer, providedBuffer)) {
    return next(new AppError(403, 'CSRF_TOKEN_INVALID', 'El token de seguridad ha caducado. Recarga la página.'));
  }
  return next();
}
