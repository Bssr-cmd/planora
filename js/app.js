import { Store } from './store.js';
import { springAnimate } from './spring.js';
import { NotesService } from './features/notes/notes-service.js';

window.store = new Store();
window.notesService = new NotesService(window.store);

const viewModules = {};
async function loadView(name) {
  if (!viewModules[name]) {
    try {
      viewModules[name] = await import(`./views/${name}.js`);
    } catch (e) {
      console.warn(`View "${name}" failed to load, using fallback`, e);
      viewModules[name] = {
        render: () => `
          <div class="view view--fallback">
            <div class="empty-state">
              <div class="empty-state__icon">🚧</div>
              <div class="empty-state__title">${name.charAt(0).toUpperCase() + name.slice(1)}</div>
              <div class="empty-state__message">This module is coming soon.</div>
            </div>
          </div>
        `,
        mount: () => {},
        unmount: () => {}
      };
    }
  }
  return viewModules[name];
}

async function loadComponent(name) {
  try {
    return await import(`./components/${name}.js`);
  } catch (e) {
    console.warn(`Component "${name}" failed to load`, e);
    return null;
  }
}

/* ── Route aliases ─────────────────────────────── */
const routeAliases = {
  'today': 'daily-planner',
  'daily': 'daily-planner',
  'weekly': 'weekly-planner',
};

function resolveViewName(route) {
  return routeAliases[route] || route;
}

/* ── App ───────────────────────────────────────── */
const app = {
  currentRoute: null,
  currentViewModule: null,
  store: window.store,
  _commandPalette: null,
  _notificationCenter: null,

  async navigate(route) {
    if (this.currentViewModule && this.currentViewModule.unmount) {
      try { this.currentViewModule.unmount(); } catch (e) { console.warn('unmount error', e); }
    }

    this.currentRoute = route;
    const viewName = resolveViewName(route);
    const view = await loadView(viewName);
    this.currentViewModule = view;

    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const doRender = () => {
      mainContent.innerHTML = view.render();
      if (view.mount) view.mount();
    };

    if (document.startViewTransition) {
      document.startViewTransition(doRender);
    } else {
      doRender();
    }

    this._updateNavState(route);
    window.location.hash = route;
  },

  _updateNavState(route) {
    document.querySelectorAll('.sidebar__item[data-route]').forEach(el => {
      el.classList.toggle('sidebar__item--active', el.dataset.route === route);
    });
    document.querySelectorAll('.bottom-nav__item[data-route]').forEach(el => {
      el.classList.toggle('bottom-nav__item--active', el.dataset.route === route);
    });
  },

  /* ── Modal system ──────────────────────────── */
  showModal(htmlContent) {
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('modal');
    if (!backdrop || !modal) return;

    modal.innerHTML = htmlContent;
    backdrop.classList.add('modal-backdrop--open');

    modal.style.opacity = '0';
    modal.style.transform = 'translateY(16px) scale(0.96)';

    requestAnimationFrame(() => {
      springAnimate(modal, { opacity: 1, transform: 'translateY(0px) scale(1)' }, {
        damping: 0.85,
        response: 0.35
      });
    });
  },

  hideModal() {
    const backdrop = document.getElementById('modal-backdrop');
    const modal = document.getElementById('modal');
    if (!backdrop || !modal) return;

    springAnimate(modal, { opacity: 0, transform: 'translateY(16px) scale(0.96)' }, {
      damping: 1.0,
      response: 0.2,
      onComplete: () => {
        backdrop.classList.remove('modal-backdrop--open');
        modal.innerHTML = '';
      }
    });
  },

  /* ── Toast system ──────────────────────────── */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span>${message}</span>
      <button class="btn btn--icon btn--ghost" style="margin-left:auto;min-width:24px;width:24px;height:24px;padding:0" onclick="this.closest('.toast').remove()">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    container.appendChild(toast);

    toast.style.transform = 'translateX(110%)';
    toast.style.opacity = '0';
    requestAnimationFrame(() => {
      springAnimate(toast, { transform: 'translateX(0%)', opacity: 1 }, { damping: 0.8, response: 0.4 });
    });

    setTimeout(() => {
      if (!toast.parentNode) return;
      springAnimate(toast, { opacity: 0, transform: 'translateX(30px)' }, {
        damping: 1.0,
        response: 0.25,
        onComplete: () => toast.remove()
      });
    }, 4000);
  },

  /* ── Command Palette ───────────────────────── */
  async showCommandPalette() {
    if (!this._commandPalette) {
      this._commandPalette = await loadComponent('command-palette');
    }
    if (this._commandPalette && this._commandPalette.show) {
      this._commandPalette.show();
    } else {
      // Fallback if component not loaded
      const backdrop = document.getElementById('command-palette-backdrop');
      if (backdrop) backdrop.classList.add('command-palette-backdrop--open');
    }
  },

  hideCommandPalette() {
    if (this._commandPalette && this._commandPalette.hide) {
      this._commandPalette.hide();
    } else {
      const backdrop = document.getElementById('command-palette-backdrop');
      if (backdrop) backdrop.classList.remove('command-palette-backdrop--open');
    }
  },

  /* ── Theme ─────────────────────────────────── */
  getActiveTheme() {
    return this.store.getSetting('theme') || 'calm-light';
  },

  setTheme(theme) {
    this.store.setSetting('theme', theme);
    document.body.setAttribute('data-theme', theme);
    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#141416' : '#FAFAF8';
  },

  toggleTheme() {
    const current = this.getActiveTheme();
    this.setTheme(current === 'dark' ? 'calm-light' : 'dark');
  }
};

window.app = app;

/* ── Initialization ──────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize NotesService
  await window.notesService.init();

  // Apply saved theme
  const initialTheme = app.getActiveTheme();
  document.body.setAttribute('data-theme', initialTheme);

  // Apply saved font size
  const fontSize = app.store.getSetting('fontSize') || 'medium';
  document.body.setAttribute('data-font-size', fontSize);

  // Beginner vs Advanced Mode Sidebar Filtering
  const updateSidebarMode = () => {
    const isAdvanced = app.store.getSetting('advancedMode') !== false;
    document.querySelectorAll('[data-section="plan"], [data-section="track"]').forEach(el => {
      el.style.display = isAdvanced ? '' : 'none';
    });
  };
  updateSidebarMode();
  app.store.subscribe('settings', () => updateSidebarMode());

  // Sidebar navigation
  document.querySelectorAll('.sidebar__item[data-route]').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      if (route) app.navigate(route);
      // Close mobile sidebar if open
      document.getElementById('sidebar')?.classList.remove('sidebar--open');
    });
  });

  // Notification Bell Handler
  const bellBtn = document.getElementById('header-bell');
  if (bellBtn) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (app._notificationCenter && app._notificationCenter.togglePanel) {
        app._notificationCenter.togglePanel();
      }
    });
  }

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => app.toggleTheme());
  }

  // Bottom nav
  document.querySelectorAll('.bottom-nav__item[data-route]').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      if (route) app.navigate(route);
    });
  });

  // Mobile "More" button
  const moreBtn = document.getElementById('mobile-more-btn');
  if (moreBtn) {
    moreBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.toggle('sidebar--open');
    });
  }

  // Modal backdrop click-to-close
  const modalBackdrop = document.getElementById('modal-backdrop');
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) app.hideModal();
    });
  }

  // Command palette backdrop click-to-close
  const cmdBackdrop = document.getElementById('command-palette-backdrop');
  if (cmdBackdrop) {
    cmdBackdrop.addEventListener('click', (e) => {
      if (e.target === cmdBackdrop) app.hideCommandPalette();
    });
  }

  // Global keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl+K → Command Palette
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      app.showCommandPalette();
    }
    // Escape → Close overlays
    if (e.key === 'Escape') {
      const tsOverlay = document.getElementById('total-screen-focus-overlay');
      if (tsOverlay) {
        import('./views/focus.js').then(m => m.closeTotalScreenFocus && m.closeTotalScreenFocus()).catch(() => tsOverlay.remove());
      }
      app.hideCommandPalette();
      app.hideModal();
    }
    // N → Quick add task (when not in an input)
    if (e.key === 'n' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      app.navigate('tasks');
      setTimeout(() => {
        const addBtn = document.getElementById('new-task-btn');
        if (addBtn) addBtn.click();
      }, 300);
    }
  });

  // Hash change handler
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash && hash !== app.currentRoute) {
      app.navigate(hash);
    }
  });

  // Initialize components
  app._commandPalette = await loadComponent('command-palette');
  if (app._commandPalette && app._commandPalette.init) {
    app._commandPalette.init();
  }

  app._notificationCenter = await loadComponent('notification-center');
  if (app._notificationCenter && app._notificationCenter.init) {
    app._notificationCenter.init();
  }

  // Navigate to initial route
  const hash = window.location.hash.replace('#', '');
  const initialRoute = hash || 'dashboard';
  app.navigate(initialRoute);
});
