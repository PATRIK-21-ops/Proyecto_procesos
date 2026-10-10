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
  notice.textContent = message;
  notice.className = `notice${type ? ` ${type}` : ''}`;
  notice.classList.remove('hidden');
  clearTimeout(noticeTimer);
  if (timeout > 0) noticeTimer = setTimeout(() => notice.classList.add('hidden'), timeout);
}
function hideNotice() { $('#notice').classList.add('hidden'); }
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
}
function showApiError(error) {
  const message = error instanceof ApiError ? error.message : 'No se ha podido completar la operación. Revisa la conexión e inténtalo de nuevo.';
  showNotice(message, 'error');
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
  ['#', 'JUGADOR', 'PUNTOS', 'BAJAS', 'FECHA'].forEach((label) => { const th = document.createElement('th'); th.textContent = label; headerRow.append(th); });
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
  } catch { /* La portada sigue visible aunque no haya API disponible temporalmente. */ }
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
      const row = document.createElement('tr'); row.append(createCell('No hay usuarios.', '',)); body.append(row); return;
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
        button.type = 'button'; button.className = 'button button-danger button-small'; button.textContent = 'ELIMINAR';
        button.dataset.deleteUser = user.id;
        button.dataset.userEmail = user.email;
        actionCell.append(button);
      } else actionCell.textContent = '—';
      row.append(actionCell);
      body.append(row);
    });
  } catch (error) {
    body.replaceChildren();
    const row = document.createElement('tr'); row.append(createCell('No se ha podido cargar el listado.')); body.append(row);
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
        $('#game-message').textContent = `Bajas: ${result.kills} · Puntuación: ${result.kills * 100}.`;
        $('#game-status').textContent = result.won ? 'CLEAR' : 'KIA';
        try {
          const saved = await api.submitScore({ kills: result.kills, durationMs: result.durationMs });
          showNotice(`Partida guardada. Puntuación: ${saved.score.points}.`, 'success');
        } catch (error) { showApiError(error); }
      }
    });
  }
  game.start();
}

// Navegación de pantallas
for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', () => showView(button.dataset.view));
}
$('#nav-profile').addEventListener('click', () => showView('profile'));
$('#nav-admin').addEventListener('click', () => showView('admin'));
$('#home-play').addEventListener('click', () => currentUser ? showView('game') : showView('login'));
$('#start-game').addEventListener('click', startGame);
$('#refresh-users').addEventListener('click', loadAdminUsers);

$('#register-form').addEventListener('submit', async (event) => {
  event.preventDefault(); hideNotice();
  const form = new FormData(event.currentTarget);
  const email = String(form.get('email') || '');
  const password = String(form.get('password') || '');
  const passwordConfirm = String(form.get('passwordConfirm') || '');
  if (password !== passwordConfirm) return showNotice('Las contraseñas no coinciden.', 'error');
  try {
    await api.register({ email, password });
    event.currentTarget.reset();
    showView('login');
    showNotice('Cuenta creada correctamente. Ya puedes iniciar sesión.', 'success');
  } catch (error) { showApiError(error); }
});

$('#login-form').addEventListener('submit', async (event) => {
  event.preventDefault(); hideNotice();
  const form = new FormData(event.currentTarget);
  try {
    const { user } = await api.login({ email: String(form.get('email') || ''), password: String(form.get('password') || '') });
    setCurrentUser(user);
    event.currentTarget.reset();
    showView('home');
    showNotice(`Sesión iniciada. Bienvenido, ${user.email}.`, 'success');
  } catch (error) { showApiError(error); }
});

$('#logout-button').addEventListener('click', async () => {
  try {
    await api.logout(); setCurrentUser(null); showView('home'); showNotice('Has cerrado sesión.', 'success');
  } catch (error) { showApiError(error); }
});
$('#delete-account-button').addEventListener('click', async () => {
  if (!currentUser || !window.confirm('¿Seguro que quieres eliminar tu cuenta? No podrás volver a iniciar sesión con ella.')) return;
  try {
    const result = await api.deleteUser(currentUser.id);
    if (result.deletedCurrentUser) {
      setCurrentUser(null); showView('home'); showNotice('Tu cuenta ha sido eliminada.', 'success');
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

// Al iniciar, se pregunta al backend si existe una sesión anterior (PBI 6).
async function boot() {
  try {
    const { user } = await api.me();
    setCurrentUser(user);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) showApiError(error);
    setCurrentUser(null);
  }
  await loadTopScores();
}
boot();
