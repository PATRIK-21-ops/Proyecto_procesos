import { api, ApiError } from '../api/apiClient.js';
import { HellfallGame } from '../game/game.js';

const $ = (selector) => document.querySelector(selector);
const views = ['home', 'login', 'register', 'game', 'profile', 'admin'];
let currentUser = null;
let game = null;
let noticeTimer = null;

function escapeText(value) { return String(value ?? ''); }

function showNotice(message, type = '', timeout = 5000) {
  const notice = $('#notice');
  if (!notice) return;
  notice.textContent = message;
  notice.className = `notice${type ? ` ${type}` : ''}`;
  notice.classList.remove('hidden');
  clearTimeout(noticeTimer);
  if (timeout > 0) noticeTimer = setTimeout(() => notice.classList.add('hidden'), timeout);
}

function hideNotice() {
  const notice = $('#notice');
  if (notice) notice.classList.add('hidden');
}

function showRegisterBox(message, type = 'success') {
  const alertBox = $('#register-alert');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = `notice ${type}`;
  alertBox.classList.remove('hidden');
}

function hideRegisterBox() {
  const alertBox = $('#register-alert');
  if (alertBox) alertBox.classList.add('hidden');
}

function showView(name) {
  if (!views.includes(name)) name = 'home';
  if (name !== 'game' && game?.running && !game.paused && !game.finished) game.pause();
  if (name === 'game' && !currentUser) {
    showNotice('Inicia sesión o crea una cuenta para acceder al juego.', 'error');
    name = 'login';
  }
  if (name === 'admin' && currentUser?.role !== 'admin') {
    showNotice('Esta sección está reservada al administrador.', 'error');
    name = 'home';
  }
  views.forEach((view) => $(`#view-${view}`).classList.toggle('hidden', view !== name));
  if (name === 'profile') renderProfile();
  if (name === 'admin') loadAdminUsers();
  if (name === 'home') loadTopScores();
  if (name === 'game') prepareGameView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setCurrentUser(user) {
  currentUser = user || null;

  $('#session-badge').textContent = currentUser ? currentUser.email : 'INVITADO';

  $('#nav-profile').classList.toggle('hidden', !currentUser);
  $('#nav-admin').classList.toggle('hidden', currentUser?.role !== 'admin');
  $('#home-play').textContent = currentUser ? '▶ CONTINUAR' : '▶ JUGAR';

  document.querySelectorAll('[data-view="login"]').forEach((el) => {
    el.classList.toggle('hidden', currentUser !== null);
  });

  document.querySelectorAll('[data-view="register"]').forEach((el) => {
    el.classList.toggle('hidden', currentUser !== null);
  });
}

function showApiError(error) {
  const isApiError = error.name === 'ApiError' || error instanceof ApiError;
  const message = isApiError ? error.message : 'No se ha podido completar la operación. Revisa la conexión e inténtalo de nuevo.';
  if (!isApiError) console.error('Error nativo interceptado:', error);
  showNotice(message, 'error', 8000);
}

function createCell(text, className = '') {
  const td = document.createElement('td');
  td.textContent = escapeText(text);
  if (className) td.className = className;
  return td;
}

function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-ES');
}

function renderLeaderboard(container, scores, { personal = false } = {}) {
  container.replaceChildren();
  if (!scores?.length) {
    const empty = document.createElement('div');
    empty.className = 'leaderboard-empty';
    empty.textContent = personal ? 'Aún no has registrado partidas. Entra en el sector y establece tu primera marca.' : 'Aún no hay puntuaciones. Sé el primero en entrar.';
    container.append(empty);
    return;
  }
  const table = document.createElement('table');
  table.className = 'leaderboard-table';
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['#', 'JUGADOR', 'PUNTOS', 'BAJAS', 'FECHA'].forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label;
    headerRow.append(th);
  });
  thead.append(headerRow);
  const tbody = document.createElement('tbody');
  scores.forEach((score, index) => {
    const row = document.createElement('tr');
    row.append(createCell(String(index + 1)));
    row.append(createCell(score.email || currentUser?.email || 'Marine'));
    row.append(createCell(String(score.points ?? 0), 'score'));
    row.append(createCell(String(score.kills ?? 0)));
    row.append(createCell(formatDate(score.createdAt)));
    tbody.append(row);
  });
  table.append(thead, tbody);
  container.append(table);
}

async function loadTopScores() {
  try {
    const { scores } = await api.topScores(10);
    renderLeaderboard($('#home-leaderboard'), scores);
  } catch { /* Portada visible aunque no haya API */ }
}

async function renderProfile() {
  if (!currentUser) return showView('login');
  $('#profile-email').textContent = currentUser.email;
  $('#profile-role').textContent = currentUser.role.toUpperCase();
  $('#profile-role-text').textContent = currentUser.role.toUpperCase();
  $('#profile-status').textContent = currentUser.status.toUpperCase();
  $('#profile-created').textContent = formatDate(currentUser.createdAt);
  try {
    const { scores } = await api.myScores();
    renderLeaderboard($('#profile-leaderboard'), scores, { personal: true });
    const best = scores.reduce((max, score) => Math.max(max, score.points || 0), 0);
    $('#personal-best').textContent = `${best} PTS`;
  } catch (error) { showApiError(error); }
}

async function loadAdminUsers() {
  const body = $('#admin-users-body');
  body.replaceChildren();
  const loading = document.createElement('tr');
  loading.append(createCell('Cargando usuarios…'));
  body.append(loading);
  try {
    const { users } = await api.users();
    body.replaceChildren();
    if (users.length === 0) {
      const row = document.createElement('tr');
      row.append(createCell('No hay usuarios.'));
      body.append(row);
      return;
    }
    users.forEach((user) => {
      const row = document.createElement('tr');
      row.append(createCell(user.email));
      row.append(createCell(user.role.toUpperCase(), user.role === 'admin' ? 'role-admin' : ''));
      row.append(createCell(user.status.toUpperCase(), user.status === 'active' ? 'status-active' : user.status === 'deleted' ? 'status-deleted' : ''));
      row.append(createCell(formatDate(user.createdAt)));
      const actionCell = document.createElement('td');
      if (user.status !== 'deleted' && user.id !== currentUser.id) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'button button-danger button-small';
        button.textContent = 'ELIMINAR';
        button.dataset.deleteUser = user.id;
        button.dataset.userEmail = user.email;
        actionCell.append(button);
      } else {
        actionCell.textContent = '—';
      }
      row.append(actionCell);
      body.append(row);
    });
  } catch (error) {
    body.replaceChildren();
    const row = document.createElement('tr');
    row.append(createCell('No se ha podido cargar el listado.'));
    body.append(row);
    showApiError(error);
  }
}

function prepareGameView() {
  $('#game-status').textContent = 'READY';
  $('#game-status-text').textContent = 'A la espera del despliegue';
  $('#game-message').textContent = 'Inicia la misión cuando estés preparado.';
  $('#game-overlay').classList.remove('hidden');
  $('#start-game').textContent = 'INICIAR MISIÓN';
}

function startGame() {
  if (!currentUser) return showView('login');
  $('#game-overlay').classList.add('hidden');
  $('#game-status').textContent = 'IN PROGRESS';
  $('#game-status-text').textContent = 'Agente desplegado';
  $('#game-message').textContent = 'Elimina a los hostiles. Haz clic en el juego para capturar el ratón.';
  if (!game) {
    game = new HellfallGame($('#game-canvas'), {
      onStatus: (status) => {
        $('#game-status').textContent = status.toUpperCase();
        $('#game-status-text').textContent = status;
      },
      onFinish: async (result) => {
        $('#game-overlay').classList.remove('hidden');
        $('#start-game').textContent = 'VOLVER A JUGAR';
        $('#game-status-text').textContent = result.won ? 'Sector despejado' : 'Agente caído';
        const bonus = result.bonusPoints || 0;
        const points = result.points ?? (result.kills * 100 + bonus);
        $('#game-message').textContent = `Bajas: ${result.kills} · Puntos: ${points}${bonus > 0 ? ` (bonus combo: +${bonus})` : ''}.`;
        $('#game-status').textContent = result.won ? 'CLEAR' : 'KIA';
        try {
          const saved = await api.submitScore({ kills: result.kills, bonusPoints: bonus, durationMs: result.durationMs });
          showNotice(`Partida guardada. Puntuación: ${saved.score.points}.`, 'success');
        } catch (error) { showApiError(error); }
      }
    });
  }
  game.start();
}

for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => showView(button.dataset.view));
}
$('#nav-profile').addEventListener('click', () => showView('profile'));
$('#nav-admin').addEventListener('click', () => showView('admin'));
$('#home-play').addEventListener('click', () => currentUser ? showView('game') : showView('login'));
$('#start-game').addEventListener('click', startGame);
$('#refresh-users').addEventListener('click', loadAdminUsers);

// REGISTRO CON AVISO EN PANTALLA
$('#register-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  hideNotice();
  hideRegisterBox();

  const formElement = event.target;
  const form = new FormData(formElement);

  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  const passwordConfirm = String(form.get('passwordConfirm') || '');

  if (password !== passwordConfirm) {
    showRegisterBox('Las contraseñas no coinciden.', 'error');
    showNotice('Las contraseñas no coinciden.', 'error');
    return;
  }

  try {
    showNotice(`Enviando correo de verificación a ${email}...`, '', 10000);
    const result = await api.register({ email, password });

    if (result && result.pendingConfirmation) {
      formElement.reset();
      const msg = `Se ha enviado un correo de verificación a ${email}. Revisa tu bandeja de entrada (y Spam) y pulsa en "ACTIVAR CUENTA".`;
      showRegisterBox(msg, 'success');
      showNotice(msg, 'success', 20000);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    formElement.reset();
    showView('login');
    showNotice('Cuenta creada correctamente. Ya puedes iniciar sesión.', 'success');
  } catch (error) {
    showRegisterBox(error.message || 'Error al registrar la cuenta.', 'error');
    showApiError(error);
  }
});

// LOGIN
$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  hideNotice();

  const formElement = event.target;
  const form = new FormData(formElement);

  try {
    await api.login({
      email: String(form.get('email') || ''),
      password: String(form.get('password') || '')
    });

    const { user } = await api.me();
    setCurrentUser(user);

    formElement.reset();
    showNotice('Logueado correctamente.', 'success');
    showView('home');
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') {
      showNotice('Correo o contraseña incorrectos (o la cuenta ha sido eliminada).', 'error');
    } else {
      showApiError(error);
    }
  }
});

$('#logout-button').addEventListener('click', async () => {
  try {
    await api.logout();
    setCurrentUser(null);
    showView('home');
    showNotice('Has cerrado sesión.', 'success');
  } catch (error) { showApiError(error); }
});

$('#delete-account-button').addEventListener('click', async () => {
  if (!currentUser || !window.confirm('¿Seguro que quieres eliminar tu cuenta? No podrás volver a iniciar sesión con ella.')) return;
  try {
    const result = await api.deleteUser(currentUser.id);
    if (result.deletedCurrentUser) {
      setCurrentUser(null);
      showView('home');
      showNotice('Tu cuenta ha sido eliminada.', 'success');
    }
  } catch (error) { showApiError(error); }
});

$('#admin-users-body').addEventListener('click', async (event) => {
  const button = event.target.closest('[data-delete-user]');
  if (!button) return;
  if (!window.confirm(`¿Eliminar la cuenta ${button.dataset.userEmail}?`)) return;
  try {
    await api.deleteUser(button.dataset.deleteUser);
    showNotice('Cuenta eliminada.', 'success');
    await loadAdminUsers();
  } catch (error) { showApiError(error); }
});

function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const confirmed = params.get('confirmed');
  const oauth = params.get('oauth');
  const error = params.get('error');

  if (confirmed === 'success') {
    showNotice('¡Cuenta verificada y activada correctamente! Ya estás conectado.', 'success', 12000);
  } else if (oauth === 'success') {
    showNotice('Sesión iniciada con Google correctamente.', 'success', 8000);
  } else if (error === 'invalid_confirmation_token') {
    showNotice('El enlace de activación no es válido o ha caducado.', 'error', 10000);
  } else if (error) {
    showNotice('No se pudo completar la autenticación.', 'error', 8000);
  }

  if (confirmed || oauth || error) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}

async function boot() {
  try {
    const { user } = await api.me();
    setCurrentUser(user);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) showApiError(error);
    setCurrentUser(null);
  }
  handleUrlParams();
  await loadTopScores();
}
boot();