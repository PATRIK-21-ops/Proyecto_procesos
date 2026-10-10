import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { createApp } from './app.js';
import { loadConfig } from './config/env.js';
import { createLogger } from './config/logger.js';
import { UserRepositoryMemory } from './repositories/userRepository.memory.js';
import { UserRepositoryPg } from './repositories/userRepository.pg.js';
import { ScoreRepositoryMemory } from './repositories/scoreRepository.memory.js';
import { ScoreRepositoryPg } from './repositories/scoreRepository.pg.js';
import { UserService } from './services/userService.js';
import { ScoreService } from './services/scoreService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = loadConfig();
const logger = createLogger(config.logLevel);
const { Pool } = pg;
let pool;
let sessionStore;

async function main() {
  let userRepository;
  let scoreRepository;
  if (config.databaseUrl) {
    const ssl = config.pgSsl === 'disable' ? false : (config.pgSsl === 'require' ? { rejectUnauthorized: false } : false);
    pool = new Pool({ connectionString: config.databaseUrl, ssl, max: 10, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 10_000 });
    pool.on('error', (error) => logger.error({ event: 'postgres.pool.error', err: error }, 'Error inesperado en el pool de PostgreSQL'));
    await pool.query('SELECT 1');
    const schema = await readFile(path.resolve(__dirname, '../sql/schema.sql'), 'utf8');
    await pool.query(schema);
    userRepository = new UserRepositoryPg(pool);
    scoreRepository = new ScoreRepositoryPg(pool);
    const PgStore = connectPgSimple(session);
    sessionStore = new PgStore({ pool, tableName: 'session', createTableIfMissing: true, pruneSessionInterval: 15 * 60 });
    logger.info({ event: 'storage.ready', mode: 'postgresql' }, 'PostgreSQL preparado');
  } else {
    userRepository = new UserRepositoryMemory();
    scoreRepository = new ScoreRepositoryMemory(userRepository);
    logger.warn({ event: 'storage.memory' }, 'Sin DATABASE_URL: se usa memoria y se perderán los datos al reiniciar. Configura PostgreSQL para el Hito 3.');
  }

  const userService = new UserService(userRepository);
  const scoreService = new ScoreService(scoreRepository, { maxKills: config.maxScoreKills });
  if (config.adminEmail && config.adminPassword) {
    const admin = await userService.ensureAdmin(config.adminEmail, config.adminPassword);
    logger.info({ event: 'admin.ready', userId: admin.id }, 'Cuenta de administrador preparada');
  } else {
    logger.warn({ event: 'admin.not_configured' }, 'Configura ADMIN_EMAIL y ADMIN_PASSWORD para crear el primer administrador.');
  }

  const app = createApp({
    userService,
    scoreService,
    sessionStore,
    sessionSecret: config.sessionSecret,
    production: config.production,
    logger
  });
  const server = app.listen(config.port, () => {
    logger.info({ event: 'server.ready', port: config.port, mode: config.nodeEnv }, `HELLFALL disponible en http://localhost:${config.port}`);
  });

  const shutdown = async (signal) => {
    logger.info({ event: 'server.shutdown', signal }, 'Cerrando servidor');
    server.close(async () => {
      try {
        if (sessionStore?.close) await new Promise((resolve) => sessionStore.close(resolve));
        if (pool) await pool.end();
      } finally {
        process.exit(0);
      }
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.fatal({ event: 'server.startup.failed', err: error }, 'No se pudo iniciar el servidor');
  process.exit(1);
});
