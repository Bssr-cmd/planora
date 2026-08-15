let unsubscribe = null;
let currentGoals = [];
let currentTab = 'all';

export function render() {
  return `
    <div class="view view--goals">
      <header class="view__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Goals</h1>
        <button class="btn btn--primary" id="btn-new-goal">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Goal
        </button>
      </header>

      <div style="margin-bottom: 24px; display: flex; gap: 8px; overflow-x: auto; padding-bottom: 8px;" class="scroll-hidden">
        ${['all', 'long-term', 'yearly', 'quarterly', 'monthly', 'weekly', 'daily'].map(tab => `
          <button class="btn btn--sm ${currentTab === tab ? 'btn--secondary' : 'btn--ghost'}" data-tab="${tab}" style="text-transform: capitalize; border-radius: 20px;">
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
      <div class="empty-state">
        <div class="empty-state__icon">🎯</div>
        <p class="empty-state__message">Set your first goal and start working toward it.</p>
        <button class="btn btn--primary mt-4" id="btn-new-goal-empty">Create Goal</button>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
      ${filteredGoals.map(g => `
        <div class="card" style="padding: 16px; display: flex; flex-direction: column; gap: 12px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600;">${g.title}</h3>
              <div style="display: flex; gap: 8px; align-items: center;">
                <span class="tag" style="font-size: 10px; background: var(--bg-tertiary);">${g.type}</span>
                ${g.deadline ? `<span style="font-size: 11px; color: var(--text-tertiary);">Due ${new Date(g.deadline).toLocaleDateString()}</span>` : ''}
              </div>
            </div>
            <button class="btn btn--icon btn--ghost btn--sm btn-delete-goal" data-id="${g.id}" style="color: var(--text-tertiary);">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
          
          ${g.notes ? `<p style="font-size: 13px; color: var(--text-secondary); margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${g.notes}</p>` : ''}
          
          <div style="margin-top: auto;">
            <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; color: var(--text-tertiary);">
              <span>Progress</span>
              <span>${g.progress || 0}%</span>
            </div>
            <div class="progress-bar" style="height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; background: var(--accent-primary); width: ${g.progress || 0}%; transition: width 0.3s ease;"></div>
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
      currentTab = e.target.dataset.tab;
      document.querySelector('.view--goals').outerHTML = render();
      renderContent();
      bindEvents();
    };
  });

  const btnNew = root.querySelector('#btn-new-goal');
  if (btnNew) btnNew.onclick = showNewGoalModal;

  const btnNewEmpty = root.querySelector('#btn-new-goal-empty');
  if (btnNewEmpty) btnNewEmpty.onclick = showNewGoalModal;

  root.querySelectorAll('.btn-delete-goal').forEach(btn => {
    btn.onclick = (e) => {
      const id = e.currentTarget.dataset.id;
      if (confirm('Delete this goal?')) {
        if (window.store.deleteGoal) {
           window.store.deleteGoal(id);
        } else {
           // Fallback if helper missing
           const updated = currentGoals.filter(g => g.id !== id);
           window.store.set('goals', updated);
        }
        window.app.showToast('Goal deleted', 'success');
      }
    };
  });
}

function showNewGoalModal() {
  const modalHtml = `
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px 0;">New Goal</h2>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Title</label>
          <input type="text" id="new-goal-title" class="input" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);" placeholder="E.g., Learn Spanish">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Type</label>
          <select id="new-goal-type" class="input" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);">
            <option value="long-term">Long-term</option>
            <option value="yearly">Yearly</option>
            <option value="quarterly">Quarterly</option>
            <option value="monthly">Monthly</option>
            <option value="weekly">Weekly</option>
            <option value="daily">Daily</option>
          </select>
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Progress (%)</label>
          <input type="number" id="new-goal-progress" class="input" min="0" max="100" value="0" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
          <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
          <button class="btn btn--primary" id="btn-save-goal">Save Goal</button>
        </div>
      </div>
    </div>
  `;
  window.app.showModal(modalHtml);

  setTimeout(() => {
    const btnSave = document.getElementById('btn-save-goal');
    if (btnSave) {
      btnSave.onclick = () => {
        const title = document.getElementById('new-goal-title').value;
        const type = document.getElementById('new-goal-type').value;
        const progress = parseInt(document.getElementById('new-goal-progress').value, 10) || 0;
        
        if (title.trim()) {
          const goal = {
            id: window.store.generateId(),
            title,
            type,
            progress,
            createdAt: new Date().toISOString()
          };
          
          if (window.store.addGoal) {
            window.store.addGoal(goal);
          } else {
            const current = window.store.get('goals') || [];
            window.store.set('goals', [...current, goal]);
          }
          
          window.app.hideModal();
          window.app.showToast('Goal created', 'success');
        }
      };
    }
  }, 0);
}

export function unmount() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
