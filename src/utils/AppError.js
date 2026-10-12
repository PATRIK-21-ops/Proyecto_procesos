export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (message, code = 'BAD_REQUEST') => new AppError(400, code, message);
export const unauthorized = (message = 'Debes iniciar sesión.', code = 'UNAUTHORIZED') => new AppError(401, code, message);
export const forbidden = (message = 'No tienes permisos para realizar esta operación.', code = 'FORBIDDEN') => new AppError(403, code, message);
export const notFound = (message = 'No se ha encontrado el recurso.', code = 'NOT_FOUND') => new AppError(404, code, message);
export const conflict = (message, code = 'CONFLICT') => new AppError(409, code, message);
