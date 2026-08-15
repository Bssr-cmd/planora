let unsubscribe = null;
let currentSettings = {};

export function render() {
  return `
    <div class="view view--settings">
      <header class="view__header" style="margin-bottom: 32px;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Settings</h1>
      </header>
      <div class="view__content" id="settings-content" style="max-width: 600px;">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
}

function renderContent() {
  const container = document.getElementById('settings-content');
  if (!container) return;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 24px;">
      
      <section class="card" style="padding: 24px;">
        <h2 style="font-size: 18px; margin: 0 0 20px 0;">Appearance</h2>
        
        <div style="margin-bottom: 20px;">
          <label style="display: block; font-weight: 500; margin-bottom: 12px; font-size: 14px;">Theme</label>
          <div style="display: flex; gap: 16px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="theme" value="calm-light" ${currentSettings.theme !== 'dark' ? 'checked' : ''}> Light
            </label>
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="theme" value="dark" ${currentSettings.theme === 'dark' ? 'checked' : ''}> Dark
            </label>
          </div>
        </div>

        <div>
          <label style="display: block; font-weight: 500; margin-bottom: 12px; font-size: 14px;">Font Size</label>
          <select id="setting-font-size" class="input" style="width: 100%; max-width: 200px; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);">
            <option value="small" ${currentSettings.fontSize === 'small' ? 'selected' : ''}>Small</option>
            <option value="medium" ${(currentSettings.fontSize === 'medium' || !currentSettings.fontSize) ? 'selected' : ''}>Medium</option>
            <option value="large" ${currentSettings.fontSize === 'large' ? 'selected' : ''}>Large</option>
          </select>
        </div>
      </section>

      <section class="card" style="padding: 24px;">
        <h2 style="font-size: 18px; margin: 0 0 20px 0;">Focus & Pomodoro</h2>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <div>
            <label style="display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px;">Focus Duration (min)</label>
            <input type="number" id="setting-pomodoro-work" class="input" value="${currentSettings.pomodoroWork || 25}" min="1" max="120" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);">
          </div>
          <div>
            <label style="display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px;">Short Break (min)</label>
            <input type="number" id="setting-pomodoro-break" class="input" value="${currentSettings.pomodoroBreak || 5}" min="1" max="30" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);">
          </div>
          <div>
            <label style="display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px;">Long Break (min)</label>
            <input type="number" id="setting-pomodoro-long-break" class="input" value="${currentSettings.pomodoroLongBreak || 15}" min="1" max="60" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);">
          </div>
          <div>
            <label style="display: block; font-weight: 500; margin-bottom: 8px; font-size: 14px;">Sessions until Long Break</label>
            <input type="number" id="setting-pomodoro-interval" class="input" value="${currentSettings.pomodorosUntilLong || 4}" min="1" max="10" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);">
          </div>
        </div>
      </section>

      <section class="card" style="padding: 24px;">
        <h2 style="font-size: 18px; margin: 0 0 20px 0;">App Mode</h2>
        
        <label style="display: flex; align-items: flex-start; gap: 12px; cursor: pointer;">
          <input type="checkbox" id="setting-advanced-mode" class="checkbox" ${currentSettings.advancedMode ? 'checked' : ''} style="margin-top: 4px;">
          <div>
            <div style="font-weight: 500;">Advanced Mode</div>
            <div style="font-size: 13px; color: var(--text-secondary); margin-top: 4px;">Unlocks Goals, Analytics, and Habits features in the sidebar.</div>
          </div>
        </label>
      </section>

      <section class="card" style="padding: 24px;">
        <h2 style="font-size: 18px; margin: 0 0 20px 0; color: var(--accent-danger);">Data Management</h2>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn--secondary" id="btn-export-data">Export Data</button>
          <button class="btn btn--danger" id="btn-clear-data">Clear All Data</button>
        </div>
      </section>
      
    </div>
  `;
}

export function mount() {
  currentSettings = window.store.get('settings') || {};
  
  unsubscribe = window.store.subscribe('settings', (newSettings) => {
    currentSettings = newSettings;
    renderContent();
    bindEvents();
  });

  renderContent();
  bindEvents();
}

function updateSetting(key, value) {
  if (window.store.setSetting) {
    window.store.setSetting(key, value);
  } else {
    const updated = { ...currentSettings, [key]: value };
    window.store.set('settings', updated);
  }
}

function bindEvents() {
  const root = document.querySelector('.view--settings');
  if (!root) return;

  root.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.onchange = (e) => {
      if (e.target.checked) {
        updateSetting('theme', e.target.value);
        if (window.app && window.app.setTheme) {
          window.app.setTheme(e.target.value);
        } else {
          document.body.dataset.theme = e.target.value;
        }
      }
    };
  });

  const fontSizeSelect = root.querySelector('#setting-font-size');
  if (fontSizeSelect) {
    fontSizeSelect.onchange = (e) => {
      updateSetting('fontSize', e.target.value);
      document.body.dataset.fontSize = e.target.value;
    };
  }

  const inputs = [
    { id: 'setting-pomodoro-work', key: 'pomodoroWork' },
    { id: 'setting-pomodoro-break', key: 'pomodoroBreak' },
    { id: 'setting-pomodoro-long-break', key: 'pomodoroLongBreak' },
    { id: 'setting-pomodoro-interval', key: 'pomodorosUntilLong' }
  ];

  inputs.forEach(({id, key}) => {
    const el = root.querySelector(`#${id}`);
    if (el) {
      el.onchange = (e) => {
        updateSetting(key, parseInt(e.target.value, 10));
      };
    }
  });

  const advancedToggle = root.querySelector('#setting-advanced-mode');
  if (advancedToggle) {
    advancedToggle.onchange = (e) => {
      updateSetting('advancedMode', e.target.checked);
      // Let app router handle sidebar updates
    };
  }

  const btnExport = root.querySelector('#btn-export-data');
  if (btnExport) {
    btnExport.onclick = () => {
      const data = localStorage.getItem('planora_state');
      if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `planora_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        window.app.showToast('Data exported successfully', 'success');
      }
    };
  }

  const btnClear = root.querySelector('#btn-clear-data');
  if (btnClear) {
    btnClear.onclick = () => {
      if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
        localStorage.removeItem('planora_state');
        window.location.reload();
      }
    };
  }
}

export function unmount() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
