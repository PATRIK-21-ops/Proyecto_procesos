import { Router } from 'express';

export function challengeRoutes({ challengeService }) {
  const router = Router();
  // Público: la semilla del día no es un secreto, lo secreto es cómo se calcula la de otros días.
  router.get('/today', (_req, res) => {
    res.json(challengeService.today());
  });
  return router;
}
