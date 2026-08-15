export function render() {
  const store = window.store;
  const roadmaps = store.get('roadmaps') || [];

  return `
    <div class="view roadmap-view">
      <header class="view__header">
        <div>
          <h1 class="view__title">◇ Goal Roadmaps</h1>
          <p class="view__subtitle">Transform high-level ambitions into structured week-by-week action plans.</p>
        </div>
        <div class="view__actions">
          <button class="btn btn--primary" id="btn-create-roadmap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Create Roadmap
          </button>
        </div>
      </header>

      <!-- ROADMAP LIST -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        ${roadmaps.length === 0 ? `
          <div class="card empty-state" style="padding: 48px; text-align: center;">
            <div class="empty-state__icon" style="font-size: 3rem; margin-bottom: 12px;">◇</div>
            <h3 class="empty-state__title">No Roadmaps Yet</h3>
            <p class="empty-state__message">Turn your goals into automated projects and scheduled tasks.</p>
            <button class="btn btn--primary" id="btn-empty-create-roadmap" style="margin-top: 16px;">Create Your First Roadmap</button>
          </div>
        ` : roadmaps.map(rm => `
          <div class="card" style="padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <h2 style="font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); margin: 0;">${rm.title}</h2>
                  ${rm.converted ? '<span class="tag tag--low" style="background: rgba(67, 160, 71, 0.15); color: #43A047; font-weight: 600;">Active Plan</span>' : '<span class="tag tag--high">Draft Roadmap</span>'}
                </div>
                <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
                  Target Goal: <strong>${rm.goalTitle}</strong> · Duration: ${rm.durationDays || 30} days
                </p>
              </div>

              <div style="display: flex; gap: 8px;">
                ${!rm.converted ? `
                  <button class="btn btn--primary btn-convert-roadmap" data-id="${rm.id}">
                    ⚡ Convert Roadmap to Active Plan
                  </button>
                ` : `
                  <button class="btn btn--secondary" onclick="window.app.navigate('projects')">
                    View Project Workspace →
                  </button>
                `}
                <button class="btn btn--danger btn--icon btn-delete-roadmap" data-id="${rm.id}" title="Delete Roadmap">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>

            <!-- WEEKS BREAKDOWN GRID -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 16px;">
              ${rm.weeks.map(w => `
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--radius-md); border-top: 3px solid var(--accent-primary);">
                  <div style="font-size: var(--text-xs); font-weight: 700; color: var(--accent-primary); text-transform: uppercase;">Week ${w.week}</div>
                  <div style="font-size: var(--text-base); font-weight: 600; margin: 4px 0 12px 0;">${w.title}</div>
                  <ul style="padding-left: 18px; margin: 0; font-size: var(--text-xs); color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px;">
                    ${w.tasks.map(t => `<li>${t}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function mount() {
  const store = window.store;

  // Convert roadmap to active plan
  document.querySelectorAll('.btn-convert-roadmap').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const project = store.convertRoadmapToPlan(id);
      if (project) {
        window.app.showToast(`Roadmap converted into project "${project.name}" with tasks scheduled!`, 'success');
        window.app.navigate('roadmap');
      }
    });
  });

  // Delete roadmap
  document.querySelectorAll('.btn-delete-roadmap').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      store.deleteRoadmap(id);
      window.app.showToast('Roadmap removed', 'info');
      window.app.navigate('roadmap');
    });
  });

  // Create new roadmap modal
  const createBtn = document.getElementById('btn-create-roadmap');
  const emptyCreateBtn = document.getElementById('btn-empty-create-roadmap');

  const openCreateModal = () => {
    window.app.showModal(`
      <div style="padding: 10px;">
        <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 16px;">Create Goal Roadmap</h2>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Roadmap Title</label>
            <input type="text" id="rm-title" class="input" placeholder="e.g. 30-Day Mobile App Launch" style="margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Target Goal</label>
            <input type="text" id="rm-goal" class="input" placeholder="e.g. Launch iOS MVP" style="margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Duration</label>
            <select id="rm-duration" class="input" style="margin-top: 4px;">
              <option value="30">30 Days (4 Weeks)</option>
              <option value="60">60 Days (8 Weeks)</option>
              <option value="90">90 Days (12 Weeks)</option>
            </select>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
          <button class="btn btn--primary" id="btn-save-roadmap">Generate Roadmap</button>
        </div>
      </div>
    `);

    document.getElementById('btn-save-roadmap')?.addEventListener('click', () => {
      const title = document.getElementById('rm-title')?.value;
      const goalTitle = document.getElementById('rm-goal')?.value;
      const durationDays = parseInt(document.getElementById('rm-duration')?.value || 30, 10);

      if (!title || !title.trim()) return;

      store.addRoadmap({
        title: title.trim(),
        goalTitle: goalTitle || title,
        durationDays,
        weeks: [
          { week: 1, title: 'Discovery & Architecture', tasks: ['Requirements & research', 'Core schema design', 'Setup workspace'] },
          { week: 2, title: 'Core Implementation', tasks: ['Build foundational modules', 'Integrate reactive data store', 'Style components'] },
          { week: 3, title: 'Refinement & Testing', tasks: ['User flows & polish', 'Cross-browser testing', 'Performance optimizations'] },
          { week: 4, title: 'Launch & Review', tasks: ['Deploy release build', 'Collect feedback', 'Retrospective review'] }
        ]
      });

      window.app.showToast('Roadmap generated!', 'success');
      window.app.hideModal();
      window.app.navigate('roadmap');
    });
  };

  if (createBtn) createBtn.addEventListener('click', openCreateModal);
  if (emptyCreateBtn) emptyCreateBtn.addEventListener('click', openCreateModal);
}

export function unmount() {}
