/** Único módulo del frontend que conoce fetch y la API HTTP. */
let csrfToken = null;

export class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function readResponse(response) {
  let body = {};
  try { body = await response.json(); } catch { /* respuestas sin JSON */ }
  if (!response.ok) {
    throw new ApiError(response.status, body?.error?.code || 'REQUEST_FAILED', body?.error?.message || 'La petición no ha podido completarse.');
  }
  if (body?.csrfToken) csrfToken = body.csrfToken;
  return body;
}

async function ensureCsrf() {
  if (csrfToken) return csrfToken;
  const response = await fetch('/api/auth/csrf', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
  const body = await readResponse(response);
  csrfToken = body.csrfToken;
  return csrfToken;
}

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const normalizedMethod = method.toUpperCase();
  const requestHeaders = { Accept: 'application/json', ...headers };
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
  if (!['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod)) requestHeaders['X-CSRF-Token'] = await ensureCsrf();
  const response = await fetch(`/api${path}`, {
    method: normalizedMethod,
    credentials: 'same-origin',
    headers: requestHeaders,
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  return readResponse(response);
}

export const api = {
  request,
  health: () => request('/health'),
  csrf: async () => { csrfToken = null; return ensureCsrf(); },
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: (data) => request('/auth/login', { method: 'POST', body: data }),
  me: () => request('/auth/me'),
  logout: async () => { const result = await request('/auth/logout', { method: 'POST', body: {} }); csrfToken = null; return result; },
  users: () => request('/users'),
  deleteUser: async (id) => { const result = await request(`/users/${encodeURIComponent(id)}`, { method: 'DELETE', body: {} }); csrfToken = null; return result; },
  topScores: (limit = 10) => request(`/scores/top?limit=${encodeURIComponent(limit)}`),
  myScores: () => request('/scores/mine'),
  submitScore: (data) => request('/scores', { method: 'POST', body: data })
};
