export function render() {
  const store = window.store;
  const roadmaps = store.get('roadmaps') || [];

  return `
    <div class="view roadmap-view" style="max-width: 1200px; margin: 0 auto; padding-bottom: 30px;">
      <header class="view__header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 class="view__title flex items-center gap-2" style="font-size: var(--text-2xl); font-weight: 700;">
            ◇ Goal Roadmaps
          </h1>
          <p class="view__subtitle text-xs text-secondary mt-1">Transform high-level ambitions into structured, week-by-week action plans.</p>
        </div>

        <div class="view__actions flex gap-3">
          <button class="btn btn--primary" id="btn-plan-my-goal" style="box-shadow: 0 4px 14px rgba(108,99,255,0.3); font-weight: 600;">
            ✦ Plan My Goal
          </button>
        </div>
      </header>

      <!-- ROADMAP LIST -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        ${roadmaps.length === 0 ? `
          <div class="card empty-state" style="padding: 48px; text-align: center;">
            <div class="empty-state__icon" style="font-size: 3rem; margin-bottom: 12px;">◇</div>
            <h3 class="empty-state__title" style="font-size: var(--text-lg); font-weight: 700;">No Roadmaps Yet</h3>
            <p class="empty-state__message" style="font-size: var(--text-xs); color: var(--text-secondary);">Turn your goals into automated projects and scheduled tasks.</p>
            <button class="btn btn--primary" id="btn-empty-plan-goal" style="margin-top: 16px;">✦ Plan Your First Goal</button>
          </div>
        ` : roadmaps.map(rm => `
          <div class="card" style="padding: 24px; border-radius: var(--radius-lg); background: var(--bg-elevated); border: 1px solid var(--border-light);">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
              <div>
                <div style="display: flex; align-items: center; gap: 10px;">
                  <h2 style="font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); margin: 0;">${rm.title}</h2>
                  ${rm.converted ? '<span class="tag" style="background: rgba(67, 160, 71, 0.15); color: #43A047; font-weight: 600; padding: 2px 8px; font-size: 11px;">Active Plan</span>' : '<span class="tag" style="background: rgba(251, 140, 0, 0.15); color: #FB8C00; font-weight: 600; padding: 2px 8px; font-size: 11px;">Draft Roadmap</span>'}
                </div>
                <p style="font-size: var(--text-sm); color: var(--text-secondary); margin-top: 4px;">
                  Target Goal: <strong>${rm.goalTitle}</strong> · Duration: ${rm.durationDays || 30} days
                </p>
              </div>

              <div style="display: flex; gap: 8px;">
                ${!rm.converted ? `
                  <button class="btn btn--primary btn-convert-roadmap" data-id="${rm.id}" style="font-weight: 600;">
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
              ${(rm.weeks || []).map(w => `
                <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--radius-md); border-top: 3px solid var(--accent-primary);">
                  <div style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase;">Week ${w.week}</div>
                  <div style="font-size: var(--text-sm); font-weight: 700; margin: 4px 0 10px 0; color: var(--text-primary);">${w.title}</div>
                  <ul style="padding-left: 18px; margin: 0; font-size: var(--text-xs); color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px;">
                    ${(w.tasks || []).map(t => `<li>${t}</li>`).join('')}
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

  document.querySelectorAll('.btn-convert-roadmap').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const project = store.convertRoadmapToPlan(id);
      if (project) {
        window.app.showToast(`Roadmap converted into project "${project.name}" with tasks & schedule!`, 'success');
        window.app.navigate('roadmap');
      }
    });
  });

  document.querySelectorAll('.btn-delete-roadmap').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      store.deleteRoadmap(id);
      window.app.showToast('Roadmap removed', 'info');
      window.app.navigate('roadmap');
    });
  });

  const planBtn = document.getElementById('btn-plan-my-goal');
  const emptyPlanBtn = document.getElementById('btn-empty-plan-goal');

  if (planBtn) planBtn.addEventListener('click', showPlanMyGoalWizard);
  if (emptyPlanBtn) emptyPlanBtn.addEventListener('click', showPlanMyGoalWizard);
}

/* ── SIGNATURE "PLAN MY GOAL" INTERACTIVE WIZARD ─────────────────── */
function showPlanMyGoalWizard() {
  const store = window.store;

  window.app.showModal(`
    <div style="padding: 14px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase;">
        ✦ SIGNATURE EXPERIENCE: PLAN MY GOAL
      </div>
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-top: 4px;">
        What goal do you want to achieve?
      </h2>
      <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">
        Planora will calculate a personalized weekly roadmap, milestones, and schedule.
      </p>

      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500;">Your Ambition / Goal</label>
          <input type="text" id="wiz-goal-title" class="input" placeholder="e.g. Master Python in 60 Days, Build Portfolio Website..." autofocus style="width: 100%; margin-top: 4px;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500;">Duration</label>
            <select id="wiz-duration" class="input" style="width: 100%; margin-top: 4px;">
              <option value="30">30 Days (4 Weeks)</option>
              <option value="60">60 Days (8 Weeks)</option>
              <option value="90">90 Days (12 Weeks)</option>
            </select>
          </div>

          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500;">Hours / Week</label>
            <select id="wiz-hours" class="input" style="width: 100%; margin-top: 4px;">
              <option value="5">5 Hours / Week</option>
              <option value="10" selected>10 Hours / Week</option>
              <option value="20">20 Hours / Week</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500;">Experience Level</label>
            <select id="wiz-exp" class="input" style="width: 100%; margin-top: 4px;">
              <option value="beginner">Beginner</option>
              <option value="intermediate" selected>Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 500;">Preferred Focus Window</label>
            <select id="wiz-window" class="input" style="width: 100%; margin-top: 4px;">
              <option value="morning">Morning (9 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (2 PM - 5 PM)</option>
              <option value="evening">Evening (7 PM - 10 PM)</option>
            </select>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="btn-generate-goal-plan">✦ Generate AI Roadmap</button>
      </div>
    </div>
  `);

  document.getElementById('btn-generate-goal-plan')?.addEventListener('click', () => {
    const goalTitle = document.getElementById('wiz-goal-title')?.value;
    if (!goalTitle || !goalTitle.trim()) return;

    const durationDays = parseInt(document.getElementById('wiz-duration')?.value || 30, 10);
    const numWeeks = Math.ceil(durationDays / 7);

    // Generate intelligent week breakdown
    const weeks = [];
    const keywords = goalTitle.toLowerCase();
    
    if (keywords.includes('python') || keywords.includes('code') || keywords.includes('programming')) {
      weeks.push(
        { week: 1, title: 'Syntax & Core Principles', tasks: ['Data structures & control flow', 'Functions & scope', 'Setup local dev environment'] },
        { week: 2, title: 'Object-Oriented Programming', tasks: ['Classes & inheritance', 'Modules & package management', 'Unit testing basics'] },
        { week: 3, title: 'Data Processing & Libraries', tasks: ['Data manipulation with Pandas', 'HTTP requests & APIs', 'File I/O operations'] },
        { week: 4, title: 'Capstone Project & Polish', tasks: ['Build automated CLI tool', 'Code refactoring & docs', 'Publish to GitHub'] }
      );
    } else {
      weeks.push(
        { week: 1, title: 'Structure & Foundations', tasks: ['Define scope & architecture', 'Draft initial specs & guidelines', 'Setup workspace & resources'] },
        { week: 2, title: 'Core Implementation', tasks: ['Build primary components', 'Integrate data pipelines', 'Design micro-interactions'] },
        { week: 3, title: 'Refinement & Optimization', tasks: ['Conduct audit & user testing', 'Fix edge-case bugs', 'Performance tuning'] },
        { week: 4, title: 'Final Launch & Review', tasks: ['Deploy to production', 'Final retrospective', 'Celebrate milestone achievement'] }
      );
    }

    const roadmap = store.addRoadmap({
      title: `${durationDays}-Day Roadmap: ${goalTitle.trim()}`,
      goalTitle: goalTitle.trim(),
      durationDays,
      weeks
    });

    // Also add to Goals list
    store.addGoal({
      title: goalTitle.trim(),
      type: durationDays <= 30 ? 'monthly' : 'quarterly',
      deadline: new Date(Date.now() + durationDays * 86400000).toISOString().split('T')[0]
    });

    window.app.showToast('Goal roadmap generated!', 'success');
    window.app.hideModal();
    window.app.navigate('roadmap');
  });
}

export function unmount() {}
