let unsubscribe = null;
let currentHabits = [];

export function render() {
  return `
    <div class="view view--habits">
      <header class="view__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Habits</h1>
        <button class="btn btn--primary" id="btn-new-habit">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
          New Habit
        </button>
      </header>
      <div class="view__content" id="habits-content">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
}

function renderContent() {
  const container = document.getElementById('habits-content');
  if (!container) return;

  if (currentHabits.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🌱</div>
        <p class="empty-state__message">Build new routines by tracking your daily habits.</p>
        <button class="btn btn--primary mt-4" id="btn-new-habit-empty">Create Habit</button>
      </div>
    `;
    return;
  }

  const todayStr = window.store.today ? window.store.today() : new Date().toISOString().split('T')[0];

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      ${currentHabits.map(h => {
        const isCompletedToday = (h.completedDates || []).includes(todayStr);
        return `
          <div class="card" style="padding: 16px; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 16px;">
              <button class="btn-toggle-habit" data-id="${h.id}" style="width: 32px; height: 32px; border-radius: 50%; border: 2px solid ${isCompletedToday ? 'var(--accent-success)' : 'var(--border)'}; background: ${isCompletedToday ? 'var(--accent-success)' : 'transparent'}; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; transition: all 0.2s;">
                ${isCompletedToday ? '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>' : ''}
              </button>
              <div>
                <div style="font-weight: 500; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                  <span>${h.icon || '📌'}</span> ${h.name}
                </div>
                <div style="font-size: 12px; color: var(--text-tertiary); margin-top: 4px;">Streak: 🔥 ${(h.completedDates || []).length} days</div>
              </div>
            </div>
            
            <div style="display: flex; gap: 4px;">
              ${Array.from({length: 7}).map((_, i) => {
                // Mock last 7 days
                const d = new Date();
                d.setDate(d.getDate() - (6 - i));
                const dStr = d.toISOString().split('T')[0];
                const completed = (h.completedDates || []).includes(dStr);
                return `
                  <div style="width: 12px; height: 12px; border-radius: 2px; background: ${completed ? 'var(--accent-success)' : 'var(--bg-tertiary)'};" title="${dStr}"></div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

export function mount() {
  currentHabits = window.store.get('habits') || [];
  
  unsubscribe = window.store.subscribe('habits', (newHabits) => {
    currentHabits = newHabits;
    renderContent();
    bindEvents();
  });

  renderContent();
  bindEvents();
}

function bindEvents() {
  const root = document.querySelector('.view--habits');
  if (!root) return;

  const btnNew = root.querySelector('#btn-new-habit');
  if (btnNew) btnNew.onclick = showNewHabitModal;

  const btnNewEmpty = root.querySelector('#btn-new-habit-empty');
  if (btnNewEmpty) btnNewEmpty.onclick = showNewHabitModal;

  root.querySelectorAll('.btn-toggle-habit').forEach(btn => {
    btn.onclick = (e) => {
      const id = e.currentTarget.dataset.id;
      const todayStr = window.store.today ? window.store.today() : new Date().toISOString().split('T')[0];
      
      if (window.store.toggleHabitDay) {
        window.store.toggleHabitDay(id, todayStr);
      } else {
        const habit = currentHabits.find(h => h.id === id);
        if (habit) {
          const dates = habit.completedDates || [];
          const newDates = dates.includes(todayStr) 
            ? dates.filter(d => d !== todayStr)
            : [...dates, todayStr];
          
          const updatedHabits = currentHabits.map(h => h.id === id ? {...h, completedDates: newDates} : h);
          window.store.set('habits', updatedHabits);
        }
      }
    };
  });
}

function showNewHabitModal() {
  const modalHtml = `
    <div style="padding: 24px;">
      <h2 style="margin: 0 0 16px 0;">New Habit</h2>
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Habit Name</label>
          <input type="text" id="new-habit-name" class="input" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);" placeholder="E.g., Read 10 pages">
        </div>
        <div>
          <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Icon</label>
          <input type="text" id="new-habit-icon" class="input" style="width: 100%; padding: 8px; border: 1px solid var(--border); border-radius: var(--radius-sm);" placeholder="📚" value="📚">
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 16px;">
          <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
          <button class="btn btn--primary" id="btn-save-habit">Save Habit</button>
        </div>
      </div>
    </div>
  `;
  window.app.showModal(modalHtml);

  setTimeout(() => {
    const btnSave = document.getElementById('btn-save-habit');
    if (btnSave) {
      btnSave.onclick = () => {
        const name = document.getElementById('new-habit-name').value;
        const icon = document.getElementById('new-habit-icon').value;
        
        if (name.trim()) {
          const habit = {
            id: window.store.generateId(),
            name,
            icon: icon || '📌',
            frequency: 'daily',
            completedDates: [],
            createdAt: new Date().toISOString()
          };
          
          if (window.store.addHabit) {
            window.store.addHabit(habit);
          } else {
            const current = window.store.get('habits') || [];
            window.store.set('habits', [...current, habit]);
          }
          
          window.app.hideModal();
          window.app.showToast('Habit created', 'success');
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
