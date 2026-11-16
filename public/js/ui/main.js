import { HellfallGame } from '../game/game.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const noticeEl = document.getElementById('notice');
  const overlayEl = document.getElementById('game-overlay');
  const startBtn = document.getElementById('start-game');
  const statusEl = document.getElementById('game-status');

  const userEmailSpan = document.getElementById('profile-email');
  const userRoleSpan = document.getElementById('profile-role-text');
  const userStatusSpan = document.getElementById('profile-status');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const logoutBtn = document.getElementById('logout-btn');
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  const sessionBadge = document.getElementById('session-badge');

  const scoresBody = document.getElementById('scores-body');
  const usersBody = document.getElementById('users-body');
  const refreshUsersBtn = document.getElementById('refresh-users');

  const navProfile = document.getElementById('nav-profile');
  const navAdmin = document.getElementById('nav-admin');

  let gameInstance = null;
  let currentUser = null;
  let csrfToken = '';

  function showNotice(msg, isError = false) {
    if (!noticeEl) return;
    noticeEl.textContent = msg;
    noticeEl.className = isError ? 'notice error' : 'notice success';
    setTimeout(() => { noticeEl.classList.add('hidden'); }, 6000);
  }

  // --- Sistema de Vistas SPA ---
  const views = document.querySelectorAll('.view');
  function switchView(viewId) {
    views.forEach(v => v.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) target.classList.remove('hidden');
  }

  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchView(btn.getAttribute('data-view'));
    });
  });

  if (navProfile) navProfile.addEventListener('click', () => switchView('profile'));
  if (navAdmin) navAdmin.addEventListener('click', () => switchView('admin'));
  const homePlayBtn = document.getElementById('home-play');
  if (homePlayBtn) homePlayBtn.addEventListener('click', () => switchView('game'));

  // Obtener Token CSRF y Sesión
  async function refreshCsrfToken() {
    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'same-origin' });
      if (csrfRes.ok) {
        const csrfData = await csrfRes.json();
        csrfToken = csrfData.csrfToken || '';
      }
    } catch {}
    return csrfToken;
  }

  async function ensureCsrfToken() {
    if (!csrfToken) await refreshCsrfToken();
    return csrfToken;
  }

  async function fetchSession() {
    await refreshCsrfToken();

    try {
      const res = await fetch('/api/user/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        currentUser = data;
        renderAuthUI();
        if (currentUser.role === 'admin') loadAdminUsers();
      } else {
        currentUser = null;
        renderAuthUI();
      }
    } catch {
      currentUser = null;
      renderAuthUI();
    }
  }

  function renderAuthUI() {
    if (currentUser) {
      if (sessionBadge) sessionBadge.textContent = `AGENTE: ${currentUser.email.toUpperCase()}`;
      if (navProfile) navProfile.classList.remove('hidden');
      if (currentUser.role === 'admin' && navAdmin) navAdmin.classList.remove('hidden');
      if (userEmailSpan) userEmailSpan.textContent = currentUser.email;
      if (userRoleSpan) userRoleSpan.textContent = currentUser.role;
      if (userStatusSpan) userStatusSpan.textContent = currentUser.status;
    } else {
      if (sessionBadge) sessionBadge.textContent = 'INVITADO';
      if (navProfile) navProfile.classList.add('hidden');
      if (navAdmin) navAdmin.classList.add('hidden');
    }
  }

  // Login Local
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await ensureCsrfToken();
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
            'csrf-token': csrfToken,
            'CSRF-Token': csrfToken
          },
          credentials: 'same-origin',
          body: JSON.stringify({ email: loginForm.email.value.trim(), password: loginForm.password.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || data.message || 'Credenciales incorrectas.');

        currentUser = data;
        // El login regenera la sesión en el servidor: obtenemos un CSRF nuevo.
        await refreshCsrfToken();
        renderAuthUI();
        showNotice('🔓 ¡Inicio de sesión correcto!');
        loginForm.reset();
        switchView('home');
        loadLeaderboard();
      } catch (err) {
        showNotice(`❌ ${err.message}`, true);
      }
    });
  }

  // Registro Local
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await ensureCsrfToken();
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
            'csrf-token': csrfToken,
            'CSRF-Token': csrfToken
          },
          credentials: 'same-origin',
          body: JSON.stringify({ email: registerForm.email.value.trim(), password: registerForm.password.value })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || data.message || 'Error al registrar.');

        if (data.pendingConfirmation) {
          showNotice(`📩 ${data.message}`);
          registerForm.reset();
          return;
        }
        showNotice('✅ ¡Cuenta creada con éxito!');
        registerForm.reset();
        switchView('login');
      } catch (err) {
        showNotice(`❌ ${err.message}`, true);
      }
    });
  }

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await ensureCsrfToken();
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'x-csrf-token': csrfToken, 'csrf-token': csrfToken, 'CSRF-Token': csrfToken },
          credentials: 'same-origin'
        });
        currentUser = null;
        csrfToken = '';
        await refreshCsrfToken();
        renderAuthUI();
        showNotice('🔒 Sesión cerrada.');
        switchView('home');
      } catch {
        showNotice('❌ Error al cerrar sesión.', true);
      }
    });
  }

  // Eliminar Cuenta
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      if (!currentUser || !confirm('¿Eliminar cuenta permanentemente?')) return;
      try {
        await ensureCsrfToken();
        const res = await fetch(`/api/user/${currentUser.id}`, {
          method: 'DELETE',
          headers: { 'x-csrf-token': csrfToken, 'csrf-token': csrfToken, 'CSRF-Token': csrfToken },
          credentials: 'same-origin'
        });
        if (!res.ok) throw new Error('No se pudo eliminar.');
        currentUser = null;
        csrfToken = '';
        await refreshCsrfToken();
        renderAuthUI();
        showNotice('🗑️ Cuenta eliminada.');
        switchView('home');
      } catch (err) {
        showNotice(`❌ ${err.message}`, true);
      }
    });
  }

  // Hall of Fame
  async function loadLeaderboard() {
    if (!scoresBody) return;
    try {
      const res = await fetch('/api/scores', { credentials: 'same-origin' });
      if (!res.ok) throw new Error();
      const scores = await res.json();
      if (!Array.isArray(scores) || scores.length === 0) {
        scoresBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No hay registros de combate.</td></tr>';
        return;
      }
      scoresBody.innerHTML = scores.map((s, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${s.email || s.userEmail || 'Marine UAC'}</td>
          <td style="color: var(--amber);">${s.kills}</td>
          <td>${s.won ? '🏆 Conquistado' : '💀 Caído'}</td>
          <td>${Math.round((s.durationMs || 1000) / 1000)}s</td>
        </tr>
      `).join('');
    } catch {
      scoresBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--accent-red);">Error al cargar ranking.</td></tr>';
    }
  }

  // Admin Users
  async function loadAdminUsers() {
    if (!usersBody) return;
    try {
      const res = await fetch('/api/admin/users', { credentials: 'same-origin' });
      if (!res.ok) return;
      const users = await res.json();
      usersBody.innerHTML = users.map(u => `
        <tr>
          <td>${u.id.substring(0, 8)}...</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>${u.status}</td>
          <td><button class="button button-danger button-small del-user" data-id="${u.id}">Baja</button></td>
        </tr>
      `).join('');

      document.querySelectorAll('.del-user').forEach(btn => {
        btn.addEventListener('click', async () => {
          const targetId = btn.getAttribute('data-id');
          if (!confirm(`¿Dar de baja al usuario?`)) return;
          await ensureCsrfToken();
          await fetch(`/api/user/${targetId}`, {
            method: 'DELETE',
            headers: { 'x-csrf-token': csrfToken, 'csrf-token': csrfToken, 'CSRF-Token': csrfToken },
            credentials: 'same-origin'
          });
          loadAdminUsers();
        });
      });
    } catch {}
  }

  if (refreshUsersBtn) refreshUsersBtn.addEventListener('click', loadAdminUsers);

  // Mensajes de retorno (confirmación de correo, OAuth, etc.)
  const params = new URLSearchParams(window.location.search);
  if (params.get('confirmed') === 'success') {
    showNotice('✅ ¡Correo confirmado! Ya puedes iniciar sesión.');
    history.replaceState({}, '', window.location.pathname);
    switchView('login');
  } else if (params.get('error') === 'invalid_confirmation_token') {
    showNotice('❌ El enlace de activación no es válido o ha caducado.', true);
    history.replaceState({}, '', window.location.pathname);
  }

  // Inicialización
  fetchSession();
  loadLeaderboard();
});