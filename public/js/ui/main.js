import { api, ApiError } from '../api/apiClient.js';
import { HellfallGame, globalDoomMusic } from '../game/game.js';
import { DoomFireEffect } from '../game/fireMenu.js';
import { CHARACTERS, drawCharacterFace } from '../game/portrait.js';
import { renderBestiaryPortraits, startHeroGameplayDemo, stopHeroGameplayDemo } from './heroDemo.js';

const $ = (selector) => document.querySelector(selector);
const views = ['home', 'lore', 'guide', 'ranking', 'legal', 'login', 'register', 'game', 'profile', 'admin'];
const LORE_TABS = {
  origin: { crumb: 'HELLFALL / UNIVERSO / EL ORIGEN DE SLAYER', label: 'El Origen de Slayer' },
  sectors: { crumb: 'HELLFALL / UNIVERSO / LOS DIEZ SECTORES', label: 'Los Diez Sectores' },
  threats: { crumb: 'HELLFALL / UNIVERSO / BESTIARIO Y ESCUDOS', label: 'Bestiario y Escudos' }
};
const LEGAL_TABS = ['aviso', 'privacidad', 'cookies', 'contacto'];
let activeView = 'home';
let activeLoreTab = 'origin';
let activeRankingPeriod = 'all';
let activeDailyRun = false;
let cachedDailyChallenge = null;
let pendingMatchResult = null;
let heroArtMode = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'svg' : 'demo';
let dailyCountdownTimer = null;
const routeStack = [{ view: 'home', sub: '' }];
let currentUser = null;
let game = null;
let noticeTimer = null;
let selectedGender = 'slayer';
let fireEffect = null;
let portraitFrameId = null;

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

function isReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

function renderHomeHeroVisual() {
  const demoCanvas = $('#hero-demo-canvas');
  const svgScene = $('#hero-svg-scene');
  const toggleBtn = $('#hero-demo-toggle');
  if (!demoCanvas || !svgScene) return;

  if (isReducedMotion()) {
    svgScene.querySelectorAll('animate').forEach((anim) => anim.remove());
  }

  if (activeView === 'home' && heroArtMode === 'demo') {
    demoCanvas.classList.remove('hidden');
    svgScene.classList.add('hidden');
    if (toggleBtn) toggleBtn.textContent = '🖼️ VER ARTE';
    startHeroGameplayDemo(demoCanvas, { reducedMotion: isReducedMotion() });
  } else {
    stopHeroGameplayDemo();
    demoCanvas.classList.add('hidden');
    svgScene.classList.remove('hidden');
    if (toggleBtn) toggleBtn.textContent = '▶ DEMO EN VIVO';
  }
}

function parseHashRoute(rawHash = window.location.hash) {
  const cleaned = String(rawHash || '').replace(/^#\/?/, '').trim().toLowerCase();
  if (!cleaned) return { view: 'home', sub: '' };
  const [rawView, rawSub = ''] = cleaned.split('/');
  const view = views.includes(rawView) ? rawView : 'home';
  let sub = '';
  if (view === 'lore') sub = LORE_TABS[rawSub] ? rawSub : 'origin';
  else if (view === 'legal' && LEGAL_TABS.includes(rawSub)) sub = rawSub;
  return { view, sub };
}

function updateNavHighlight(name) {
  document.querySelectorAll('.topbar-nav .nav-tab').forEach((tab) => {
    tab.classList.toggle('active', tab.dataset.view === name);
  });
}

function setLoreTab(tab = 'origin') {
  const nextTab = LORE_TABS[tab] ? tab : 'origin';
  activeLoreTab = nextTab;
  document.querySelectorAll('.lore-tab-btn').forEach((btn) => {
    const isSel = btn.dataset.loreTab === nextTab;
    btn.classList.toggle('active', isSel);
    btn.setAttribute('aria-selected', isSel ? 'true' : 'false');
  });
  Object.keys(LORE_TABS).forEach((key) => {
    const panel = $(`#lore-panel-${key}`);
    if (panel) panel.classList.toggle('hidden', key !== nextTab);
  });
  const crumb = $('#lore-breadcrumb');
  if (crumb) crumb.textContent = LORE_TABS[nextTab].crumb;
}

function showView(name, { sub = '', push = true, replace = false } = {}) {
  if (!views.includes(name)) name = 'home';
  if (name !== 'game') {
    stopMetalMenuEffects();
    if (game?.running && !game.paused && !game.finished) game.pause();
    if (game?.isFullscreenActive?.()) game.exitFullscreenClean();
    globalDoomMusic.setPaused(true);
  }
  if (name !== 'home') {
    stopHeroGameplayDemo();
  }
  if (name === 'game' && !currentUser) {
    showNotice('Inicia sesión o crea una cuenta para acceder al juego.', 'error');
    name = 'login';
    sub = '';
  }
  if (name === 'admin' && currentUser?.role !== 'admin') {
    showNotice('Esta sección está reservada al administrador.', 'error');
    name = 'home';
    sub = '';
  }
  const nextSub = name === 'lore'
    ? (LORE_TABS[sub] ? sub : (activeLoreTab || 'origin'))
    : (name === 'legal' && LEGAL_TABS.includes(sub) ? sub : '');
  const targetHash = `#${name}${nextSub ? `/${nextSub}` : ''}`;
  const sameRoute = activeView === name && (name !== 'lore' || activeLoreTab === nextSub);

  activeView = name;
  views.forEach((view) => $(`#view-${view}`)?.classList.toggle('hidden', view !== name));
  updateNavHighlight(name);

  if (name === 'home') {
    renderHomeHeroVisual();
    renderBestiaryPortraits();
    loadHomeStats();
    loadDailyChallengeHome();
  }
  if (name === 'lore') {
    setLoreTab(nextSub);
    drawSlayerPortraits(performance.now());
  }
  if (name === 'legal' && nextSub) {
    const targetCard = $(`#legal-${nextSub}`);
    if (targetCard) setTimeout(() => targetCard.scrollIntoView({ behavior: isReducedMotion() ? 'auto' : 'smooth', block: 'start' }), 30);
  }
  if (name === 'profile') renderProfile();
  if (name === 'admin') loadAdminUsers();
  if (name === 'home' || name === 'ranking') loadTopScores(activeRankingPeriod);
  if (name === 'game') prepareGameView();

  if (replace) {
    routeStack.splice(0, routeStack.length, { view: name, sub: nextSub });
    window.history.replaceState({ view: name, sub: nextSub }, document.title, targetHash);
  } else if (push && !sameRoute) {
    routeStack.push({ view: name, sub: nextSub });
    window.history.pushState({ view: name, sub: nextSub }, document.title, targetHash);
  }
  window.scrollTo({ top: 0, behavior: isReducedMotion() ? 'auto' : 'smooth' });
}

function goBackInApp() {
  if (routeStack.length > 1) {
    routeStack.pop();
    const prev = routeStack[routeStack.length - 1] || { view: 'home', sub: '' };
    window.history.back();
    setTimeout(() => {
      if (activeView !== prev.view || (activeView === 'lore' && activeLoreTab !== prev.sub)) {
        showView(prev.view, { sub: prev.sub, push: false, replace: true });
      }
    }, 60);
  } else if (activeView !== 'home') {
    showView('home', { push: true });
  }
}

function syncNicknameUI(nickname = '') {
  const clean = typeof nickname === 'string' ? nickname.trim() : '';
  if (currentUser && clean) currentUser.nickname = clean;
  if ($('#session-badge')) {
    $('#session-badge').textContent = currentUser ? (clean || currentUser.nickname || 'SLAYER') : 'INVITADO';
  }
  if ($('#profile-nickname-display')) {
    $('#profile-nickname-display').textContent = clean || currentUser?.nickname || 'SLAYER';
  }
  if ($('#profile-nickname-input') && clean) {
    $('#profile-nickname-input').value = clean;
  }
  if ($('#metal-nickname-input') && clean) {
    $('#metal-nickname-input').value = clean;
  }
  if ($('#score-nickname-input') && !pendingMatchResult?.saved && clean) {
    $('#score-nickname-input').value = clean;
  }
}

function setCurrentUser(user) {
  currentUser = user || null;

  syncNicknameUI(currentUser?.nickname || '');

  $('#nav-profile').classList.toggle('hidden', !currentUser);
  $('#nav-admin').classList.toggle('hidden', currentUser?.role !== 'admin');
  $('#home-play').textContent = '▶ DESPLEGAR SLAYER';

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
  if (!container) return;
  container.replaceChildren();
  const visible = personal ? (scores || []) : (scores || []).filter((s) => (s.points ?? 0) > 0);
  if (!visible.length) {
    const empty = document.createElement('div');
    empty.className = 'leaderboard-empty';
    empty.textContent = personal
      ? 'Aún no has registrado partidas. Entra en el sector y establece tu primera marca.'
      : 'Aún no hay puntuaciones (> 0 pts) en este periodo. ¡Sé el primero en marcar récord!';
    container.append(empty);
    return;
  }
  const table = document.createElement('table');
  table.className = 'leaderboard-table';
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['#', 'NICKNAME', 'SECTOR', 'PUNTOS', 'BAJAS', 'FECHA'].forEach((label) => {
    const th = document.createElement('th');
    th.textContent = label;
    headerRow.append(th);
  });
  thead.append(headerRow);
  const tbody = document.createElement('tbody');
  visible.forEach((score, index) => {
    const row = document.createElement('tr');
    if (score.isCurrentUser) row.classList.add('is-current-user');
    row.append(createCell(String(index + 1)));
    const playerLabel = score.nickname || score.alias || (personal ? (currentUser?.nickname || 'Slayer') : 'Slayer');
    row.append(createCell(score.isCurrentUser ? `${playerLabel} (TÚ)` : playerLabel));
    row.append(createCell(`S${String(score.sector || 1).padStart(2, '0')}`));
    row.append(createCell(String(score.points ?? 0), 'score'));
    row.append(createCell(String(score.kills ?? 0)));
    row.append(createCell(formatDate(score.createdAt)));
    tbody.append(row);
  });
  table.append(thead, tbody);
  container.append(table);
}

function renderViewerRankBanner(el, viewerRank) {
  if (!el) return;
  if (!currentUser) {
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  if (!viewerRank) {
    el.textContent = `Aún no tienes marca positiva en este periodo como ${currentUser.nickname || 'Slayer'}.`;
    return;
  }
  if (viewerRank.rank === 1) {
    el.textContent = `🏆 Lideras el ranking en el puesto #1 con ${viewerRank.points} pts.`;
  } else {
    el.textContent = `Tu puesto actual: #${viewerRank.rank} (${viewerRank.points} pts) · Te faltan ${viewerRank.pointsToNextRank} pts para el puesto #${viewerRank.nextRank}.`;
  }
}

async function loadTopScores(period = activeRankingPeriod) {
  activeRankingPeriod = ['day', 'week', 'all'].includes(period) ? period : 'all';
  document.querySelectorAll('[data-ranking-period]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.rankingPeriod === activeRankingPeriod);
  });
  try {
    const { scores, viewerRank } = await api.topScores(10, { period: activeRankingPeriod });
    renderLeaderboard($('#home-leaderboard'), scores);
    renderLeaderboard($('#ranking-leaderboard'), scores);
    renderViewerRankBanner($('#home-rank-status'), viewerRank);
    renderViewerRankBanner($('#ranking-viewer-status'), viewerRank);
  } catch { /* Portada visible aunque no haya API */ }
}

async function loadHomeStats() {
  try {
    const { stats } = await api.scoreStats();
    if (!stats) return;
    if ($('#stat-matches')) $('#stat-matches').textContent = String(stats.matchesPlayed ?? 0);
    if ($('#stat-kills')) $('#stat-kills').textContent = Number(stats.totalKills ?? 0).toLocaleString('es-ES');
    if ($('#stat-players')) $('#stat-players').textContent = String(stats.registeredPlayers ?? 0);
    if ($('#stat-sector')) $('#stat-sector').textContent = stats.maxSector > 0 ? `S${String(stats.maxSector).padStart(2, '0')}` : 'S01';
  } catch { /* Valores por defecto si no hay API */ }
}

function startDailyCountdown() {
  const update = () => {
    const el = $('#daily-countdown');
    if (!el) return;
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Madrid',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(new Date());
    const val = (t) => Number(parts.find((p) => p.type === t)?.value || 0);
    const elapsed = (val('hour') % 24) * 3600 + val('minute') * 60 + val('second');
    const rem = Math.max(0, 86400 - elapsed);
    const hh = String(Math.floor(rem / 3600)).padStart(2, '0');
    const mm = String(Math.floor((rem % 3600) / 60)).padStart(2, '0');
    const ss = String(rem % 60).padStart(2, '0');
    el.textContent = `⏱ Reinicia en ${hh}:${mm}:${ss}`;
  };
  update();
  if (!dailyCountdownTimer) {
    dailyCountdownTimer = setInterval(update, 1000);
  }
}

async function loadDailyChallengeHome() {
  startDailyCountdown();
  try {
    const challenge = await api.challengeToday();
    if (challenge?.date && Number.isInteger(challenge?.seed)) {
      cachedDailyChallenge = challenge;
    }
    if ($('#daily-home-date') && challenge?.date) {
      $('#daily-home-date').textContent = `HOY · ${challenge.date}`;
    }
  } catch { /* ignore */ }
  const listEl = $('#home-daily-top3');
  if (!listEl) return;
  try {
    let { scores } = await api.topScores(3, { period: 'day', dailyOnly: true });
    if (!scores?.length) {
      ({ scores } = await api.topScores(3, { period: 'day' }));
    }
    listEl.replaceChildren();
    if (!scores?.length) {
      const li = document.createElement('li');
      li.className = 'daily-top3-item';
      li.innerHTML = '<span>Aún sin marcas hoy</span><span>¡Sé el #1!</span>';
      listEl.append(li);
      return;
    }
    scores.slice(0, 3).forEach((s, idx) => {
      const li = document.createElement('li');
      li.className = 'daily-top3-item';
      const left = document.createElement('strong');
      left.textContent = `#${idx + 1} ${s.nickname || 'Slayer'} · S${String(s.sector || 1).padStart(2, '0')}`;
      const right = document.createElement('span');
      right.textContent = `${s.points} pts`;
      li.append(left, right);
      listEl.append(li);
    });
  } catch { /* fallback */ }
}

async function renderProfile() {
  if (!currentUser) return showView('login');
  syncNicknameUI(currentUser.nickname || '');
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
  try {
    const { stats } = await api.myStats();
    renderProfileStats(stats);
  } catch (error) { showApiError(error); }
}

function formatPlayTime(ms) {
  const totalMinutes = Math.floor((ms || 0) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (totalMinutes > 0) return `${minutes} min`;
  return `${Math.floor((ms || 0) / 1000)} s`;
}

function renderProfileStats(stats = {}) {
  const grid = $('#profile-stats-grid');
  const trend = $('#profile-trend');
  const streakTag = $('#profile-streak-tag');
  if (!grid || !trend) return;
  const current = stats.currentStreak || 0;
  if (streakTag) streakTag.textContent = `RACHA ${current} ${current === 1 ? 'DÍA' : 'DÍAS'}`;

  const items = [
    ['PARTIDAS', stats.matchesPlayed || 0],
    ['BAJAS TOTALES', stats.totalKills || 0],
    ['MEJOR PUNTUACIÓN', `${stats.bestPoints || 0} PTS`],
    ['MEDIA / PARTIDA', `${stats.averagePoints || 0} PTS`],
    ['SECTOR MÁXIMO', stats.maxSector ? `S${String(stats.maxSector).padStart(2, '0')}` : '—'],
    ['TIEMPO EN COMBATE', formatPlayTime(stats.totalDurationMs)],
    ['DESAFÍOS DIARIOS', stats.dailyMatches || 0],
    ['MEJOR RACHA', `${stats.bestStreak || 0} ${(stats.bestStreak || 0) === 1 ? 'DÍA' : 'DÍAS'}`]
  ];
  grid.replaceChildren(...items.map(([label, value]) => {
    const chip = document.createElement('div');
    chip.className = 'profile-stat-chip';
    const span = document.createElement('span');
    span.textContent = label;
    const strong = document.createElement('strong');
    strong.textContent = String(value);
    chip.append(span, strong);
    return chip;
  }));

  const recent = Array.isArray(stats.recent) ? stats.recent : [];
  trend.replaceChildren();
  if (!recent.length) {
    trend.classList.add('leaderboard-empty');
    trend.textContent = 'Juega una partida para ver tu progresión.';
    return;
  }
  trend.classList.remove('leaderboard-empty');
  const maxPoints = Math.max(1, ...recent.map((r) => r.points || 0));
  recent.forEach((match) => {
    const col = document.createElement('div');
    col.className = `profile-trend-col${match.isDaily ? ' is-daily' : ''}`;
    col.title = `${match.points || 0} pts · ${match.kills || 0} bajas · S${String(match.sector || 1).padStart(2, '0')} · ${formatDate(match.createdAt)}${match.isDaily ? ' · Desafío diario' : ''}`;
    const value = document.createElement('small');
    value.textContent = String(match.points || 0);
    const bar = document.createElement('div');
    bar.className = 'profile-trend-bar';
    bar.style.height = `${Math.max(4, Math.round(((match.points || 0) / maxPoints) * 100))}%`;
    col.append(value, bar);
    trend.append(col);
  });
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

function renderCombatReport(result) {
  const container = $('#combat-report');
  if (!container) return;
  container.replaceChildren();

  const bonus = result.bonusPoints || 0;
  const points = result.points ?? (result.kills * 100 + bonus);
  const stats = result.runStats || {};
  const medals = Array.isArray(result.medals) ? result.medals : [];

  const statsGrid = document.createElement('div');
  statsGrid.className = 'combat-stats-row';
  const statItems = [
    { label: 'SLAYER', value: (result.characterName || CHARACTERS.slayer?.name || 'SLAYER').toUpperCase() },
    { label: 'PUNTOS', value: String(points) },
    { label: 'BAJAS', value: String(result.kills ?? 0) },
    { label: 'SECTOR / JEFES', value: `${result.level || 1}/10 (${stats.bossKills || 0}J)` },
    { label: 'SECRETOS', value: `${stats.secretsFound || 0}/${stats.secretsTotal || 1}` }
  ];
  statItems.forEach((st) => {
    const cell = document.createElement('div');
    cell.className = 'combat-stat-chip';
    const small = document.createElement('span');
    small.textContent = st.label;
    const strong = document.createElement('strong');
    strong.textContent = st.value;
    cell.append(small, strong);
    statsGrid.append(cell);
  });
  container.append(statsGrid);

  if (medals.length > 0) {
    const title = document.createElement('p');
    title.className = 'medal-heading';
    title.textContent = 'MEDALLAS Y TÍTULOS DE COMBATE';
    container.append(title);

    const grid = document.createElement('div');
    grid.className = 'medal-grid';
    medals.forEach((m) => {
      const badge = document.createElement('div');
      badge.className = 'medal-badge';
      if (m.color) badge.style.borderColor = m.color;
      const name = document.createElement('strong');
      name.textContent = `${m.icon || '★'} ${m.name}`;
      if (m.color) name.style.color = m.color;
      const desc = document.createElement('small');
      desc.textContent = m.desc || '';
      badge.append(name, desc);
      grid.append(badge);
    });
    container.append(grid);
  }

  container.classList.remove('hidden');
}

function stopMetalMenuEffects() {
  if (fireEffect) {
    fireEffect.stop();
  }
  if (portraitFrameId) {
    cancelAnimationFrame(portraitFrameId);
    portraitFrameId = null;
  }
}

function drawSlayerPortraits(now = performance.now()) {
  document.querySelectorAll('[data-portrait="slayer"], .char-portrait-canvas').forEach((cv) => {
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const scaleX = cv.width / 32;
    const scaleY = cv.height / 30;
    ctx.imageSmoothingEnabled = false;
    ctx.save();
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.scale(scaleX, scaleY);
    drawCharacterFace(ctx, 0, 0, {
      hp: 100,
      isHit: false,
      isGrin: Math.floor(now / 1600) % 4 === 0,
      isFiring: false,
      lookDir: ((Math.floor(now / 1200) % 3) - 1),
      now
    });
    ctx.restore();
  });
}

function startMetalMenuEffects() {
  stopMetalMenuEffects();
  const fireCanvas = $('#metal-fire-canvas');
  if (fireCanvas) {
    if (!fireEffect || fireEffect.canvas !== fireCanvas) {
      fireEffect = new DoomFireEffect(fireCanvas);
    }
    fireEffect.start();
  }

  const renderPortraits = (now) => {
    const metalMenu = $('#metal-menu');
    if (!metalMenu || metalMenu.classList.contains('hidden')) {
      portraitFrameId = null;
      return;
    }
    drawSlayerPortraits(now);
    portraitFrameId = requestAnimationFrame(renderPortraits);
  };
  portraitFrameId = requestAnimationFrame(renderPortraits);
}

function showMetalMenu() {
  globalDoomMusic.stopMatch();
  if (game?.isFullscreenActive?.()) game.exitFullscreenClean();
  pendingMatchResult = null;
  syncNicknameUI(currentUser?.nickname || '');
  $('#game-status').textContent = 'SLAYER READY';
  $('#game-status-text').textContent = `Slayer listo: ${currentUser?.nickname || 'SLAYER'}`;
  $('#game-message').textContent = 'Pulsa INICIAR PARTIDA cuando quieras desplegarte.';
  if ($('#metal-menu')) $('#metal-menu').classList.remove('hidden');
  if ($('#briefing-box')) $('#briefing-box').classList.add('hidden');
  if ($('#combat-report')) $('#combat-report').classList.add('hidden');
  $('#game-overlay').classList.remove('hidden');
  startMetalMenuEffects();
}

function prepareGameView() {
  showMetalMenu();
}

// challenge = { date, seed } en el desafío diario; null en una partida normal (mapas aleatorios).
async function startGame({ challenge = null } = {}) {
  if (!currentUser) return showView('login');
  const typedNick = $('#metal-nickname-input')?.value?.trim();
  if (typedNick && typedNick !== currentUser.nickname) {
    try {
      const updated = await api.updateNickname(typedNick);
      syncNicknameUI(updated.user?.nickname || typedNick);
    } catch (error) {
      showApiError(error);
      return;
    }
  }
  stopMetalMenuEffects();
  pendingMatchResult = null;
  activeDailyRun = Boolean(challenge);
  $('#game-overlay').classList.add('hidden');
  if ($('#metal-menu')) $('#metal-menu').classList.add('hidden');
  if ($('#briefing-box')) $('#briefing-box').classList.add('hidden');
  if ($('#combat-report')) $('#combat-report').classList.add('hidden');
  const charMeta = CHARACTERS.slayer || CHARACTERS.male;
  const activeNick = currentUser.nickname || charMeta.callsign;
  $('#game-status').textContent = 'IN PROGRESS';
  $('#game-status-text').textContent = `${activeNick} desplegado`;
  $('#game-message').textContent = 'Elimina a los hostiles. Haz clic en el juego para capturar el ratón.';
  if (!game) {
    game = new HellfallGame($('#game-canvas'), {
      onStatus: (status) => {
        $('#game-status').textContent = status.toUpperCase();
        $('#game-status-text').textContent = status;
      },
      onQuit: () => showMetalMenu(),
      onFinish: async (result) => {
        $('#game-overlay').classList.remove('hidden');
        if ($('#metal-menu')) $('#metal-menu').classList.add('hidden');
        if ($('#briefing-box')) $('#briefing-box').classList.remove('hidden');
        if ($('#back-to-metal-menu')) $('#back-to-metal-menu').classList.remove('hidden');
        $('#start-game').textContent = 'VOLVER A JUGAR';
        $('#game-status-text').textContent = result.won ? 'Sector despejado' : 'MUERTO — Agente caído';
        const bonus = result.bonusPoints || 0;
        const points = result.points ?? (result.kills * 100 + bonus);
        const medalNames = (result.medals || []).map((m) => m.name).join(' · ');
        const slayerName = currentUser?.nickname || result.characterName || charMeta.callsign;
        if ($('#overlay-eyebrow')) {
          $('#overlay-eyebrow').textContent = result.won ? `${slayerName} // 10 SECTORES CONQUISTADOS` : `${slayerName} // CAÍDO EN COMBATE`;
        }
        if ($('#overlay-title')) {
          $('#overlay-title').innerHTML = result.won ? '¡VICTORIA <span>INFERNAL!</span>' : '<span>MUERTO</span>';
        }
        if ($('#overlay-desc')) {
          $('#overlay-desc').textContent = result.won
            ? `${slayerName} ha sobrevivido al infierno con ${points} puntos y ${result.kills} bajas.`
            : `${slayerName} cayó en el Sector ${result.level || 1}. Bajas: ${result.kills} · Puntos: ${points}.`;
        }
        renderCombatReport(result);
        $('#game-message').textContent = `Bajas: ${result.kills} · Puntos: ${points}${bonus > 0 ? ` (bonus combo: +${bonus})` : ''}${medalNames ? ` · Títulos: ${medalNames}` : ''}.`;
        $('#game-status').textContent = result.won ? 'CLEAR' : 'MUERTO';

        pendingMatchResult = {
          kills: result.kills,
          bonusPoints: bonus,
          durationMs: result.durationMs,
          sector: result.level || 1,
          isDaily: activeDailyRun,
          saved: false
        };
        const nickInput = $('#score-nickname-input');
        const saveBtn = $('#save-score-btn');
        const feedback = $('#score-save-feedback');
        if (nickInput) {
          nickInput.disabled = false;
          nickInput.value = currentUser?.nickname || '';
          nickInput.focus();
          nickInput.select();
        }
        if (saveBtn) {
          saveBtn.disabled = false;
          saveBtn.textContent = '💾 GUARDAR PUNTUACIÓN';
        }
        if (feedback) {
          feedback.className = 'score-save-feedback';
          feedback.textContent = 'Introduce o modifica tu nickname para registrar esta partida en la base de datos.';
        }
      }
    });
  }
  if (challenge) {
    $('#game-status-text').textContent = `${activeNick} desplegado // DESAFÍO DIARIO ${challenge.date}`;
    $('#game-message').textContent = `Desafío diario del ${challenge.date}: mismos sectores para todos hoy.`;
  }
  game.start({ character: selectedGender, seed: challenge ? challenge.seed : null });
}

function getMadridDateStr() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const val = (type) => parts.find((p) => p.type === type)?.value || '';
  return `${val('year')}-${val('month')}-${val('day')}`;
}

async function startDailyChallenge() {
  if (!currentUser) return showView('login');
  if (cachedDailyChallenge?.date && cachedDailyChallenge.date === getMadridDateStr()) {
    startGame({ challenge: cachedDailyChallenge });
    return;
  }
  try {
    const challenge = await api.challengeToday();
    cachedDailyChallenge = challenge;
    startGame({ challenge });
  } catch (error) { showApiError(error); }
}

for (const button of document.querySelectorAll('[data-view]')) {
  button.addEventListener('click', (event) => {
    event.preventDefault();
    const targetView = button.dataset.view;
    const sub = button.dataset.legalTab || button.dataset.loreTab || (targetView === 'lore' ? activeLoreTab : '');
    showView(targetView, { sub });
  });
}
for (const button of document.querySelectorAll('[data-ranking-period]')) {
  button.addEventListener('click', () => loadTopScores(button.dataset.rankingPeriod));
}
$('#hero-demo-toggle')?.addEventListener('click', () => {
  heroArtMode = heroArtMode === 'demo' ? 'svg' : 'demo';
  renderHomeHeroVisual();
});
$('#home-daily-play')?.addEventListener('click', () => {
  if (!currentUser) {
    showNotice('Inicia sesión para competir en el Desafío de Hoy.', 'error');
    return showView('login');
  }
  showView('game');
  startDailyChallenge();
});
for (const button of document.querySelectorAll('[data-lore-tab]')) {
  button.addEventListener('click', () => {
    if (button.hasAttribute('data-view')) return;
    showView('lore', { sub: button.dataset.loreTab || 'origin' });
  });
}
for (const button of document.querySelectorAll('.back-nav-btn')) {
  button.addEventListener('click', () => goBackInApp());
}
window.addEventListener('popstate', (event) => {
  const fromState = event.state && typeof event.state.view === 'string'
    ? event.state
    : parseHashRoute();
  if (routeStack.length > 1) routeStack.pop();
  showView(fromState.view, { sub: fromState.sub, push: false });
});
$('#metal-start-btn')?.addEventListener('click', () => startGame());
$('#metal-daily-btn')?.addEventListener('click', startDailyChallenge);
$('#back-to-metal-menu')?.addEventListener('click', showMetalMenu);

async function handleNicknameUpdate(rawValue) {
  const clean = String(rawValue || '').trim();
  try {
    const res = await api.updateNickname(clean);
    syncNicknameUI(res.user?.nickname || clean);
    showNotice(`Nickname actualizado: ${res.user?.nickname || clean}`, 'success');
    await loadTopScores();
  } catch (error) {
    showApiError(error);
  }
}

$('#metal-nickname-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleNicknameUpdate($('#metal-nickname-input')?.value);
});

$('#profile-nickname-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  await handleNicknameUpdate($('#profile-nickname-input')?.value);
  if (activeView === 'profile') await renderProfile();
});

$('#score-submit-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!pendingMatchResult || pendingMatchResult.saved) return;
  const nickInput = $('#score-nickname-input');
  const saveBtn = $('#save-score-btn');
  const feedback = $('#score-save-feedback');
  const nickname = String(nickInput?.value || '').trim();
  if (nickname.length < 2) {
    if (feedback) {
      feedback.className = 'score-save-feedback error';
      feedback.textContent = 'Introduce un nickname de al menos 2 caracteres.';
    }
    return;
  }
  if (saveBtn) saveBtn.disabled = true;
  try {
    const saved = await api.submitScore({
      kills: pendingMatchResult.kills,
      bonusPoints: pendingMatchResult.bonusPoints,
      durationMs: pendingMatchResult.durationMs,
      sector: pendingMatchResult.sector || 1,
      isDaily: Boolean(pendingMatchResult.isDaily),
      nickname
    });
    pendingMatchResult.saved = true;
    const savedNick = saved.score?.nickname || nickname;
    syncNicknameUI(savedNick);
    if (nickInput) nickInput.disabled = true;
    if (saveBtn) saveBtn.textContent = '✓ GUARDADA';
    if (feedback) {
      feedback.className = 'score-save-feedback saved';
      feedback.textContent = `✓ Puntuación (${saved.score.points} pts) guardada como ${savedNick}.`;
    }
    showNotice(`Puntuación guardada como ${savedNick}: ${saved.score.points} pts.`, 'success');
    await Promise.all([loadTopScores(activeRankingPeriod), loadHomeStats(), loadDailyChallengeHome()]);
  } catch (error) {
    if (saveBtn) saveBtn.disabled = false;
    if (feedback) {
      feedback.className = 'score-save-feedback error';
      feedback.textContent = error.message || 'No se pudo guardar la puntuación.';
    }
    showApiError(error);
  }
});
$('#nav-profile').addEventListener('click', () => showView('profile'));
$('#nav-admin').addEventListener('click', () => showView('admin'));
$('#home-play').addEventListener('click', () => currentUser ? showView('game') : showView('login'));
$('#start-game').addEventListener('click', () => startGame());
$('#start-daily')?.addEventListener('click', startDailyChallenge);
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
  const terminalLine = $('#login-terminal-line');
  const errorMessages = {
    oauth_not_configured: 'El inicio de sesión con Google no está configurado en el servidor.',
    oauth_cancelled: 'Has cancelado el inicio de sesión con Google.',
    oauth_token_failed: 'No se pudo verificar la credencial con Google. Inténtalo de nuevo.',
    oauth_profile_failed: 'No se pudo obtener tu perfil desde Google.',
    oauth_account_inactive: 'Tu cuenta está desactivada o ha sido eliminada.',
    oauth_server_error: 'Error interno al autenticar con Google.',
    invalid_confirmation_token: 'El enlace de activación no es válido o ha caducado.'
  };

  if (confirmed === 'success') {
    showNotice('¡Cuenta confirmada y activada con éxito! Ya puedes iniciar sesión.', 'success', 12000);
  } else if (oauth === 'success') {
    showNotice('Sesión iniciada correctamente con Google.', 'success', 8000);
  } else if (error) {
    showNotice(errorMessages[error] || 'No se pudo completar la autenticación.', 'error', 10000);
    if (terminalLine) terminalLine.textContent = `> ERROR: ${error.toUpperCase()}`;
  }

  if (confirmed || oauth || error) {
    window.history.replaceState({}, document.title, `${window.location.pathname}${window.location.hash}`);
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
  const initialRoute = parseHashRoute();
  if (initialRoute.view !== 'home') {
    window.history.replaceState({ view: 'home', sub: '' }, document.title, '#home');
    routeStack.splice(0, routeStack.length, { view: 'home', sub: '' });
    showView(initialRoute.view, { sub: initialRoute.sub, push: true });
  } else {
    showView('home', { push: false, replace: true });
  }
  await Promise.all([loadTopScores(activeRankingPeriod), loadHomeStats(), loadDailyChallengeHome()]);
}
boot();