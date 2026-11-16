-- Esquema de HELLFALL. Se puede ejecutar más de una vez (idempotente).
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deleted')),
  confirmation_token TEXT,
  confirmation_expires_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si la tabla users ya existía previamente, añade las columnas de confirmación sin fallar ni borrar datos
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmation_expires_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS users_status_idx ON users (status);
CREATE INDEX IF NOT EXISTS users_confirmation_token_idx ON users (confirmation_token) WHERE confirmation_token IS NOT NULL;

-- Tabla de confirmaciones de correo (para enlaces de activación de un solo uso con caducidad)
CREATE TABLE IF NOT EXISTS email_confirmations (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(254) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS email_confirmations_user_idx ON email_confirmations (user_id);
CREATE INDEX IF NOT EXISTS email_confirmations_expires_idx ON email_confirmations (expires_at);

CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  kills INTEGER NOT NULL CHECK (kills >= 0),
  points INTEGER NOT NULL CHECK (points >= 0),
  duration_ms INTEGER NOT NULL CHECK (duration_ms >= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS scores_points_idx ON scores (points DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS scores_user_idx ON scores (user_id);

-- connect-pg-simple usa esta tabla para persistir sesiones. Columnas compatibles con el paquete.
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS session_expire_idx ON session (expire);