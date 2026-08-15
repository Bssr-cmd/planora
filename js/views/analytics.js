let unsubscribeTasks = null;
let unsubscribeFocus = null;
let currentPeriod = 'this-week';

export function render() {
  return `
    <div class="view view--analytics">
      <header class="view__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Analytics</h1>
        <select id="analytics-period" class="input" style="padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-elevated);">
          <option value="today">Today</option>
          <option value="this-week" selected>This Week</option>
          <option value="this-month">This Month</option>
        </select>
      </header>
      <div class="view__content" id="analytics-content">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
}

function renderContent() {
  const container = document.getElementById('analytics-content');
  if (!container) return;

  const tasks = window.store.get('tasks') || [];
  const sessions = window.store.get('focusSessions') || [];

  const completedTasks = tasks.filter(t => t.completed).length;
  const focusMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60;
  const focusHours = (focusMinutes / 60).toFixed(1);
  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px;">
      <div class="stat-card card" style="padding: 20px;">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Tasks Completed</div>
        <div style="font-size: 32px; font-weight: 600; color: var(--text-primary);">${completedTasks}</div>
      </div>
      <div class="stat-card card" style="padding: 20px;">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Focus Hours</div>
        <div style="font-size: 32px; font-weight: 600; color: var(--text-primary);">${focusHours}</div>
      </div>
      <div class="stat-card card" style="padding: 20px;">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Completion Rate</div>
        <div style="font-size: 32px; font-weight: 600; color: var(--text-primary);">${completionRate}%</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr; gap: 24px;">
      <div class="card" style="padding: 24px;">
        <h3 style="margin: 0 0 16px 0; font-size: 16px;">Focus Time (Last 7 Days)</h3>
        ${renderBarChart(sessions)}
      </div>
    </div>
  `;
}

function renderBarChart(sessions) {
  // Simple CSS bar chart
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [0,0,0,0,0,0,0]; // Mock array for days
  
  // Aggregate mock
  sessions.forEach(s => {
    if (s.startTime) {
      const d = new Date(s.startTime).getDay();
      data[d] += (s.duration || 0) / 60;
    }
  });

  const maxVal = Math.max(...data, 1);

  return `
    <div style="display: flex; align-items: flex-end; gap: 12px; height: 200px; padding-top: 20px;">
      ${data.map((val, i) => {
        const height = (val / maxVal) * 100;
        return `
          <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="width: 100%; background: var(--bg-tertiary); border-radius: 4px 4px 0 0; position: relative; height: 100%; display: flex; align-items: flex-end;">
              <div style="width: 100%; background: var(--accent-primary); border-radius: 4px 4px 0 0; height: ${height}%; transition: height 0.5s ease;"></div>
            </div>
            <div style="font-size: 12px; color: var(--text-secondary);">${days[i]}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function mount() {
  unsubscribeTasks = window.store.subscribe('tasks', () => renderContent());
  unsubscribeFocus = window.store.subscribe('focusSessions', () => renderContent());

  renderContent();
  bindEvents();
}

function bindEvents() {
  const root = document.querySelector('.view--analytics');
  if (!root) return;

  const select = root.querySelector('#analytics-period');
  if (select) {
    select.onchange = (e) => {
      currentPeriod = e.target.value;
      renderContent();
    };
  }
}

export function unmount() {
  if (unsubscribeTasks) unsubscribeTasks();
  if (unsubscribeFocus) unsubscribeFocus();
}
