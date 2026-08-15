let unsubscribe = null;
let currentGoals = [];
let currentTab = 'all';

export function render() {
  return `
    <div class="view view--goals" style="max-width: 1200px; margin: 0 auto; padding-bottom: 30px;">
      <header class="view__header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Goal Architecture</h1>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">Connect long-term vision down to daily execution.</p>
        </div>

        <div style="display: flex; gap: 10px;">
          <button class="btn btn--secondary" id="btn-goals-plan-roadmap" style="background: rgba(108, 99, 255, 0.1); color: var(--accent-primary); font-weight: 600;">
            ◇ Plan Goal Roadmap
          </button>
          <button class="btn btn--primary" id="btn-new-goal">
            + New Goal
          </button>
        </div>
      </header>

      <div style="margin-bottom: 20px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px;" class="scroll-hidden">
        ${['all', 'long-term', 'yearly', 'quarterly', 'monthly', 'weekly', 'daily'].map(tab => `
          <button class="btn btn--sm ${currentTab === tab ? 'btn--secondary' : 'btn--ghost'}" data-tab="${tab}" style="text-transform: capitalize; border-radius: 20px; font-size: 12px; padding: 4px 14px; ${currentTab === tab ? 'background: var(--bg-secondary); font-weight: 600;' : ''}">
            ${tab.replace('-', ' ')}
          </button>
        `).join('')}
      </div>

      <div class="view__content" id="goals-content">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
}

function renderContent() {
  const container = document.getElementById('goals-content');
  if (!container) return;

  const filteredGoals = currentTab === 'all' 
    ? currentGoals 
    : currentGoals.filter(g => g.type === currentTab);

  if (filteredGoals.length === 0) {
    container.innerHTML = `
      <div class="card empty-state" style="padding: 48px; text-align: center;">
        <div class="empty-state__icon" style="font-size: 3rem; margin-bottom: 12px;">🎯</div>
        <h3 class="empty-state__title" style="font-size: var(--text-lg); font-weight: 700;">No Goals in this Hierarchy</h3>
        <p class="empty-state__message" style="font-size: var(--text-xs); color: var(--text-secondary);">Set your first goal and connect it to projects and tasks.</p>
        <button class="btn btn--primary" id="btn-new-goal-empty" style="margin-top: 16px;">+ Create Goal</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
      ${filteredGoals.map(g => `
        <div class="card" style="padding: 20px; border-radius: var(--radius-lg); background: var(--bg-elevated); border: 1px solid var(--border-light); display: flex; flex-direction: column; gap: 14px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: var(--text-base); font-weight: 700; color: var(--text-primary);">${g.title}</h3>
              <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
                <span class="tag" style="font-size: 10px; background: var(--bg-tertiary); text-transform: uppercase; font-weight: 600; padding: 2px 8px; color: var(--text-secondary);">${g.type}</span>
                ${g.deadline ? `<span style="font-size: 11px; color: var(--accent-primary); font-weight: 500;">Due ${g.deadline}</span>` : ''}
              </div>
            </div>
            <button class="btn btn--icon btn--ghost btn--sm btn-delete-goal" data-id="${g.id}" style="color: var(--text-tertiary);" title="Delete Goal">
              <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          
          ${g.notes ? `<p style="font-size: var(--text-xs); color: var(--text-secondary); margin: 0; line-height: 1.5;">${g.notes}</p>` : ''}
          
          <div style="margin-top: auto; border-top: 1px solid var(--border-light); padding-top: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 6px; color: var(--text-secondary); font-weight: 600;">
              <span>Automatic Task Cascade</span>
              <span style="color: var(--accent-primary); font-weight: 700;">${g.progress || 0}%</span>
            </div>
            <div class="progress-bar" style="height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; background: var(--accent-primary); width: ${g.progress || 0}%; transition: width 0.4s ease;"></div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function mount() {
  currentGoals = window.store.get('goals') || [];
  
  unsubscribe = window.store.subscribe('goals', (newGoals) => {
    currentGoals = newGoals;
    renderContent();
    bindEvents();
  });

  renderContent();
  bindEvents();
}

function bindEvents() {
  const root = document.querySelector('.view--goals');
  if (!root) return;

  root.querySelectorAll('[data-tab]').forEach(btn => {
    btn.onclick = (e) => {
      currentTab = e.currentTarget.dataset.tab;
      renderContent();
      bindEvents();
    };
  });

  document.getElementById('btn-goals-plan-roadmap')?.addEventListener('click', () => {
    window.app.navigate('roadmap');
  });

  const btnNew = root.querySelector('#btn-new-goal');
  if (btnNew) btnNew.onclick = showNewGoalModal;

  const btnNewEmpty = root.querySelector('#btn-new-goal-empty');
  if (btnNewEmpty) btnNewEmpty.onclick = showNewGoalModal;

  root.querySelectorAll('.btn-delete-goal').forEach(btn => {
    btn.onclick = (e) => {
      const id = e.currentTarget.dataset.id;
      window.app.showModal(`
        <div style="padding: 10px;">
          <h2 style="font-size: var(--text-base); font-weight: 700;">Delete Goal?</h2>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">Are you sure you want to remove this goal?</p>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
            <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
            <button class="btn btn--danger" id="confirm-del-goal">Delete</button>
          </div>
        </div>
      `);
      document.getElementById('confirm-del-goal')?.addEventListener('click', () => {
        window.store.deleteGoal(id);
        window.app.showToast('Goal deleted', 'info');
        window.app.hideModal();
      });
    };
  });
}

function showNewGoalModal() {
  window.app.showModal(`
    <div style="padding: 10px;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 12px;">Create Goal</h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Goal Title</label>
          <input type="text" id="new-goal-title" class="input" style="width: 100%; margin-top: 4px;" placeholder="e.g. Master Modern Web Development" autofocus>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Hierarchy Level</label>
            <select id="new-goal-type" class="input" style="width: 100%; margin-top: 4px;">
              <option value="long-term">Long-term</option>
              <option value="yearly">Yearly</option>
              <option value="quarterly" selected>Quarterly</option>
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>

          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Deadline</label>
            <input type="date" id="new-goal-deadline" class="input" style="width: 100%; margin-top: 4px;">
          </div>
        </div>

        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Notes</label>
          <textarea id="new-goal-notes" class="input" rows="2" placeholder="Goal details..." style="width: 100%; margin-top: 4px;"></textarea>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="btn-save-goal">Create Goal</button>
      </div>
    </div>
  `);

  document.getElementById('btn-save-goal')?.addEventListener('click', () => {
    const title = document.getElementById('new-goal-title')?.value;
    if (!title || !title.trim()) return;

    window.store.addGoal({
      title: title.trim(),
      type: document.getElementById('new-goal-type')?.value || 'monthly',
      deadline: document.getElementById('new-goal-deadline')?.value || null,
      notes: document.getElementById('new-goal-notes')?.value || ''
    });

    window.app.showToast('Goal created', 'success');
    window.app.hideModal();
  });
}

export function unmount() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
