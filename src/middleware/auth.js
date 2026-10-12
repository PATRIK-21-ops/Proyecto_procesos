import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export function requireAuth(userService) {
  return asyncHandler(async (req, res, next) => {
    const userId = req.session?.userId;
    if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Debes iniciar sesión.');
    try {
      req.currentUser = await userService.getCurrentUser(userId);
    } catch (error) {
      if (req.session) await new Promise((resolve) => req.session.destroy(() => resolve()));
      throw error;
    }
    next();
  });
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.currentUser || req.currentUser.role !== role) {
      return next(new AppError(403, 'ROLE_REQUIRED', 'No tienes permisos para realizar esta operación.'));
    }
    return next();
  };
}
