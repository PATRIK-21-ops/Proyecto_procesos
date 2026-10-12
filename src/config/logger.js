import pino from 'pino';

export function createLogger(level = process.env.LOG_LEVEL || 'info') {
  return pino({
    level,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'passwordHash', 'SESSION_SECRET'],
      censor: '[REDACTED]'
    },
    base: { app: 'hellfall-pixel-siege' },
    timestamp: pino.stdTimeFunctions.isoTime
  });
}
