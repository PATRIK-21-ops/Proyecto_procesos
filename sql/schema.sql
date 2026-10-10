-- Esquema de HELLFALL. Se puede ejecutar más de una vez.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(16) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(16) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS users_status_idx ON users (status);

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
