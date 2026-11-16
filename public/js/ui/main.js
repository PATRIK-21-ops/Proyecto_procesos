import { HellfallGame } from '../game/game.js';

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const noticeEl = document.getElementById('notice');
  const overlayEl = document.getElementById('game-overlay');
  const startBtn = document.getElementById('start-game');
  const statusEl = document.getElementById('game-status');

  const authSection = document.getElementById('auth-section');
  const userSection = document.getElementById('user-section');
  const adminSection = document.getElementById('admin-section');
  const userEmailSpan = document.getElementById('user-email');
  const userRoleSpan = document.getElementById('user-role');

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const logoutBtn = document.getElementById('logout-btn');
  const deleteAccountBtn = document.getElementById('delete-account-btn');
  const sessionBadge = document.getElementById('session-badge');

  const scoresBody = document.getElementById('scores-body');
  const refreshScoresBtn = document.getElementById('refresh-scores');
  const usersBody = document.getElementById('users-body');
  const refreshUsersBtn = document.getElementById('refresh-users');
  const checkActiveForm = document.getElementById('check-active-form');
  const activeStatusResult = document.getElementById('active-status-result');

  let gameInstance = null;
  let currentUser = null;
  let csrfToken = '';

  function showNotice(msg, isError = false) {
    if (!noticeEl) return;
    noticeEl.textContent = msg;
    noticeEl.style.borderColor = isError ? '#d90429' : '#ffbe0b';
    noticeEl.classList.remove('hidden');
    setTimeout(() => {
      noticeEl.classList.add('hidden');
    }, 6000);
  }

  // Comprobar parámetros de la URL (éxito de confirmación por correo, oauth o errores)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('confirmed') === 'success') {
    showNotice('✅ ¡Cuenta confirmada y activada con éxito! Ya puedes iniciar sesión.');
    window.history.replaceState({}, document.title, '/');
  } else if (urlParams.get('error') === 'invalid_confirmation_token') {
    showNotice('❌ El enlace de activación ha caducado o no es válido.', true);
    window.history.replaceState({}, document.title, '/');
  } else if (urlParams.get('oauth') === 'success') {
    showNotice('🌐 ¡Autenticación con Google completada con éxito!');
    window.history.replaceState({}, document.title, '/');
  } else if (urlParams.get('error')) {
    showNotice(`❌ Error de acceso: ${urlParams.get('error')}`, true);
    window.history.replaceState({}, document.title, '/');
  }

  // Obtener token CSRF y estado de la sesión actual
  async function fetchSession() {
    try {
      const res = await fetch('/api/user/me', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        currentUser = data.user || data;
        renderAuthUI();
        if (currentUser.role === 'admin') {
          loadAdminUsers();
        }
      } else {
        currentUser = null;
        renderAuthUI();
      }
    } catch {
      currentUser = null;
      renderAuthUI();
    }

    try {
      const csrfRes = await fetch('/api/csrf-token', { credentials: 'same-origin' });
      if (csrfRes.ok) {
        const csrfData = await csrfRes.json();
        csrfToken = csrfData.csrfToken || '';
      }
    } catch {}
  }

  function renderAuthUI() {
    if (currentUser) {
      if (authSection) authSection.classList.add('hidden');
      if (userSection) userSection.classList.remove('hidden');
      if (userEmailSpan) userEmailSpan.textContent = currentUser.email;
      if (userRoleSpan) userRoleSpan.textContent = currentUser.role;
      if (sessionBadge) sessionBadge.textContent = `AGENTE: ${currentUser.email.toUpperCase()}`;

      if (currentUser.role === 'admin' && adminSection) {
        adminSection.classList.remove('hidden');
      } else if (adminSection) {
        adminSection.classList.add('hidden');
      }
    } else {
      if (authSection) authSection.classList.remove('hidden');
      if (userSection) userSection.classList.add('hidden');
      if (adminSection) adminSection.classList.add('hidden');
      if (sessionBadge) sessionBadge.textContent = 'AGENTE: INVITADO';
    }
  }

  // Inicio de sesión local
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm.email.value.trim();
      const password = loginForm.password.value;

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
          },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || data.message || 'Credenciales incorrectas o cuenta pendiente de activar.');
        }

        currentUser = data;
        renderAuthUI();
        showNotice('🔓 ¡Inicio de sesión correcto! Bienvenido al frente.');
        loginForm.reset();
        loadLeaderboard();
      } catch (err) {
        showNotice(`❌ ${err.message}`, true);
      }
    });
  }

  // Registro de nuevo usuario (maneja cuenta pendiente de activación por email)
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = registerForm.email.value.trim();
      const password = registerForm.password.value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'CSRF-Token': csrfToken
          },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || data.message || 'Error al registrar la cuenta.');
        }

        if (data.pendingConfirmation) {
          showNotice(`📩 ${data.message || 'Se ha enviado un enlace de activación a tu correo. Revisa tu bandeja.'}`);
          registerForm.reset();
          return;
        }

        currentUser = data;
        renderAuthUI();
        showNotice('✅ ¡Cuenta creada y activada con éxito!');
        registerForm.reset();
      } catch (err) {
        showNotice(`❌ ${err.message}`, true);
      }
    });
  }

  // Cierre de sesión
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'CSRF-Token': csrfToken },
          credentials: 'same-origin'
        });
        currentUser = null;
        renderAuthUI();
        showNotice('🔒 Sesión cerrada correctamente.');
      } catch (err) {
        showNotice('❌ Error al cerrar sesión.', true);
      }
    });
  }

  // Eliminación de cuenta
  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async () => {
      if (!currentUser) return;
      if (!confirm('¿Estás seguro de que deseas eliminar tu expediente y dar de baja tu cuenta UAC?')) return;

      try {
        const res = await fetch(`/api/user/${currentUser.id}`, {
          method: 'DELETE',
          headers: { 'CSRF-Token': csrfToken },
          credentials: 'same-origin'
        });
        if (!res.ok) throw new Error('No se pudo eliminar la cuenta.');

        currentUser = null;
        renderAuthUI();
        showNotice('🗑️ Cuenta eliminada correctamente.');
      } catch (err) {
        showNotice(`❌ ${err.message}`, true);
      }
    });
  }

  // Cargar tabla de clasificación (Hall of Fame)
  async function loadLeaderboard() {
    if (!scoresBody) return;
    try {
      const res = await fetch('/api/scores', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('No se pudo cargar el ranking.');
      const scores = await res.json();

      if (!Array.isArray(scores) || scores.length === 0) {
        scoresBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-dim);">No hay registros de combate todavía.</td></tr>';
        return;
      }

      scoresBody.innerHTML = scores.map((s, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td style="color: var(--cream);">${s.email || s.userEmail || 'Marine UAC'}</td>
          <td style="color: var(--amber); font-weight: bold;">${s.kills}</td>
          <td>${s.won ? '🏆 Conquistado' : '💀 Caído'}</td>
          <td>${Math.round((s.durationMs || s.duration_ms || 1000) / 1000)}s</td>
        </tr>
      `).join('');
    } catch {
      scoresBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--accent-red);">Error al sincronizar el Hall of Fame.</td></tr>';
    }
  }

  if (refreshScoresBtn) {
    refreshScoresBtn.addEventListener('click', loadLeaderboard);
  }

  // Cargar lista de usuarios (Panel Admin)
  async function loadAdminUsers() {
    if (!usersBody) return;
    try {
      const res = await fetch('/api/admin/users', { credentials: 'same-origin' });
      if (!res.ok) throw new Error('Acceso no autorizado.');
      const users = await res.json();

      if (!Array.isArray(users)) return;

      usersBody.innerHTML = users.map((u) => `
        <tr>
          <td style="font-size: 0.7rem; color: var(--text-dim);">${u.id.substring(0, 8)}...</td>
          <td>${u.email}</td>
          <td style="color: var(--amber);">${u.role}</td>
          <td>${u.status}</td>
          <td>
            <button class="btn btn-danger btn-sm delete-target-user" data-id="${u.id}" style="padding: 2px 6px; font-size: 0.68rem;">Baja</button>
          </td>
        </tr>
      `).join('');

      document.querySelectorAll('.delete-target-user').forEach((btn) => {
        btn.addEventListener('click', async (evt) => {
          const targetId = evt.target.getAttribute('data-id');
          if (!confirm(`¿Dar de baja al usuario con ID ${targetId}?`)) return;
          try {
            const delRes = await fetch(`/api/user/${targetId}`, {
              method: 'DELETE',
              headers: { 'CSRF-Token': csrfToken },
              credentials: 'same-origin'
            });
            if (!delRes.ok) throw new Error('Fallo al eliminar usuario.');
            showNotice('🛡️ Usuario dado de baja correctamente.');
            loadAdminUsers();
          } catch (err) {
            showNotice(`❌ ${err.message}`, true);
          }
        });
      });
    } catch {}
  }

  if (refreshUsersBtn) {
    refreshUsersBtn.addEventListener('click', loadAdminUsers);
  }

  if (checkActiveForm) {
    checkActiveForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const targetId = checkActiveForm.userId.value.trim();
      if (!targetId || !activeStatusResult) return;

      try {
        const res = await fetch(`/api/admin/users/${targetId}/active`, { credentials: 'same-origin' });
        if (!res.ok) throw new Error('Usuario no encontrado o sin permisos.');
        const data = await res.json();
        activeStatusResult.textContent = `Estado ID ${targetId.substring(0, 8)}: ${data.active ? '🟢 Activo' : '🔴 Inactivo / Eliminado'}`;
      } catch (err) {
        activeStatusResult.textContent = `❌ ${err.message}`;
      }
    });
  }

  // Guardar puntuación al finalizar partida en el servidor
  async function saveGameScore({ won, kills, durationMs }) {
    if (!currentUser) {
      showNotice('⚠️ Partida completada en modo invitado (Inicia sesión para guardar récords en el Hall of Fame).');
      return;
    }

    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'CSRF-Token': csrfToken
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          kills,
          points: kills * 150 + (won ? 2500 : 0),
          durationMs,
          won
        })
      });

      if (!res.ok) throw new Error('No se pudo guardar la puntuación.');
      showNotice('🏆 ¡Puntuación registrada en el Hall of Fame de la UAC!');
      loadLeaderboard();
    } catch (err) {
      showNotice(`❌ ${err.message}`, true);
    }
  }

  // Arranque del juego HELLFALL
  if (startBtn && canvas) {
    startBtn.addEventListener('click', () => {
      if (overlayEl) overlayEl.classList.add('hidden');

      if (gameInstance) {
        gameInstance.destroy();
      }

      gameInstance = new HellfallGame(canvas, {
        onStatus: (msg) => {
          if (statusEl) statusEl.textContent = msg;
        },
        onFinish: ({ won, kills, durationMs }) => {
          if (overlayEl) overlayEl.classList.remove('hidden');
          if (startBtn) startBtn.textContent = '▶ VOLVER A DESPLEGAR';
          saveGameScore({ won, kills, durationMs });
        }
      });

      gameInstance.start();
    });
  }

  // Inicialización general al cargar la página
  fetchSession();
  loadLeaderboard();
});