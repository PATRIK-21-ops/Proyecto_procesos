export function loadConfig(env = process.env) {
  const nodeEnv = env.NODE_ENV || 'development';
  const production = nodeEnv === 'production';
  const sessionSecret = env.SESSION_SECRET || (production ? '' : 'local-only-secret-change-before-deploy-please');
  if (production && sessionSecret.length < 32) {
    throw new Error('En producción, SESSION_SECRET debe configurarse y tener al menos 32 caracteres.');
  }
  if (production && /CAMBIA|CHANGE_ME|EXAMPLE|LOCAL_ONLY/i.test(sessionSecret)) {
    throw new Error('Sustituye el valor de ejemplo de SESSION_SECRET por un secreto aleatorio antes de desplegar.');
  }
  if (production && !env.DATABASE_URL) {
    throw new Error('En producción, DATABASE_URL es obligatorio para que los datos sean persistentes.');
  }
  if (Boolean(env.ADMIN_EMAIL) !== Boolean(env.ADMIN_PASSWORD)) {
    throw new Error('Configura ADMIN_EMAIL y ADMIN_PASSWORD juntos.');
  }
  if (production && (!env.ADMIN_EMAIL || !env.ADMIN_PASSWORD)) {
    throw new Error('En producción debes configurar ADMIN_EMAIL y ADMIN_PASSWORD para disponer de una cuenta administradora.');
  }
  const parsedMaxKills = Number.parseInt(env.MAX_SCORE_KILLS || '100', 10);
  const maxScoreKills = Number.isSafeInteger(parsedMaxKills) && parsedMaxKills > 0 ? Math.min(parsedMaxKills, 1000) : 100;
  const parsedPort = Number.parseInt(env.PORT || '8080', 10);
  const port = Number.isSafeInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535 ? parsedPort : 8080;
  return {
    nodeEnv,
    production,
    port,
    sessionSecret,
    databaseUrl: env.DATABASE_URL || '',
    pgSsl: (env.PGSSL || 'require').toLowerCase(),
    adminEmail: env.ADMIN_EMAIL || '',
    adminPassword: env.ADMIN_PASSWORD || '',
    logLevel: env.LOG_LEVEL || 'info',
    maxScoreKills
  };
}
