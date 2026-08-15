export function render() {
  return `
    <div class="view view--weekly h-full flex flex-col" style="max-width: 1200px; margin: 0 auto; padding-bottom: 30px;">
      <div class="view__header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-xl font-bold">Weekly Planner</h1>
          <p class="text-xs text-secondary mt-1">Map out your week, distribute workload, and balance priorities.</p>
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-plan-week-assistant" class="btn btn--secondary btn--sm" style="background: rgba(108, 99, 255, 0.1); color: var(--accent-primary); font-weight: 600;">
            ✦ Plan My Week
          </button>
          
          <div class="flex items-center gap-2 bg-bg-secondary p-1 rounded-lg border border-border">
            <button id="weekly-prev" class="btn btn--icon btn--ghost p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <span id="weekly-date-label" class="font-medium text-sm min-w-[150px] text-center cursor-pointer hover:text-accent-primary">This Week</span>
            <button id="weekly-next" class="btn btn--icon btn--ghost p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
        </div>
      </div>
      
      <div class="flex-1 overflow-x-auto pb-4">
        <div class="weekly-grid flex h-full min-w-[900px] gap-4" id="weekly-grid-container" style="min-height: 520px;">
          <!-- Columns generated here -->
        </div>
      </div>
    </div>
  `;
}

let unsubTasks = null;
let currentWeekStart = getMonday(new Date());

export function mount() {
  currentWeekStart = getMonday(new Date());
  unsubTasks = window.store.subscribe('tasks', renderWeekly);
  
  document.getElementById('weekly-prev')?.addEventListener('click', () => changeWeek(-7));
  document.getElementById('weekly-next')?.addEventListener('click', () => changeWeek(7));
  document.getElementById('weekly-date-label')?.addEventListener('click', () => {
    currentWeekStart = getMonday(new Date());
    renderWeekly();
  });
  
  document.getElementById('btn-plan-week-assistant')?.addEventListener('click', showPlanWeekAssistantModal);

  renderWeekly();
}

export function unmount() {
  if (unsubTasks) unsubTasks();
}

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
  return new Date(d.setDate(diff));
}

function changeWeek(days) {
  currentWeekStart.setDate(currentWeekStart.getDate() + days);
  renderWeekly();
}

function formatDateStr(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function renderWeekly() {
  const endOfWeek = new Date(currentWeekStart);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  const label = document.getElementById('weekly-date-label');
  if (label) {
    const opts = { month: 'short', day: 'numeric' };
    label.textContent = `${currentWeekStart.toLocaleDateString(undefined, opts)} - ${endOfWeek.toLocaleDateString(undefined, opts)}`;
  }
  
  const container = document.getElementById('weekly-grid-container');
  if (!container) return;
  
  const tasks = window.store.get('tasks') || [];
  const todayStr = window.store.today();
  
  let html = '';
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    const dateStr = formatDateStr(d);
    const isToday = dateStr === todayStr;
    
    const dayTasks = tasks.filter(t => t.scheduledDate === dateStr && !t.completed);
    
    html += `
      <div class="day-column flex-1 flex flex-col bg-bg-elevated rounded-xl border ${isToday ? 'border-accent-primary shadow-sm' : 'border-border'} overflow-hidden" data-date="${dateStr}">
        <div class="p-3 text-center border-b ${isToday ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border bg-bg-secondary'} font-medium">
          <div class="text-xs uppercase tracking-wider font-bold">${dayNames[i]}</div>
          <div class="text-lg font-bold">${d.getDate()}</div>
        </div>
        <div class="flex-1 p-2 space-y-2 overflow-y-auto">
          ${dayTasks.map(t => `
            <div class="card p-3 shadow-sm border border-border cursor-pointer hover:border-accent-primary transition-colors text-sm rounded-lg" onclick="window.app.navigate('tasks')">
              <div class="font-semibold text-primary">${t.title}</div>
              <div class="flex justify-between items-center mt-1 text-xs text-tertiary">
                <span>${t.estimatedMinutes || 30}m</span>
                <span class="capitalize text-accent-primary font-medium">${t.priority || 'medium'}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="p-2 border-t border-border">
          <button class="btn btn--ghost btn--sm w-full add-weekly-task" data-date="${dateStr}">+ Add Task</button>
        </div>
      </div>
    `;
  }
  
  container.innerHTML = html;
  
  document.querySelectorAll('.add-weekly-task').forEach(btn => {
    btn.addEventListener('click', () => {
      const dateStr = btn.dataset.date;
      showAddWeeklyTaskModal(dateStr);
    });
  });
}

function showAddWeeklyTaskModal(dateStr) {
  window.app.showModal(`
    <div style="padding: 10px;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 12px;">Add Task for ${dateStr}</h2>
      <input type="text" id="weekly-task-title" class="input" placeholder="Task title..." autofocus style="width: 100%; margin-bottom: 12px;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Estimated Minutes</label>
          <input type="number" id="weekly-task-est" class="input" value="45" style="margin-top: 4px;">
        </div>
        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Priority</label>
          <select id="weekly-task-priority" class="input" style="margin-top: 4px;">
            <option value="high">High</option>
            <option value="medium" selected>Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="btn-save-weekly-task">Add Task</button>
      </div>
    </div>
  `);

  document.getElementById('btn-save-weekly-task')?.addEventListener('click', () => {
    const title = document.getElementById('weekly-task-title')?.value;
    if (!title || !title.trim()) return;

    window.store.addTask({
      title: title.trim(),
      scheduledDate: dateStr,
      estimatedMinutes: parseInt(document.getElementById('weekly-task-est')?.value || 45, 10),
      priority: document.getElementById('weekly-task-priority')?.value || 'medium'
    });

    window.app.showToast('Task added to weekly schedule', 'success');
    window.app.hideModal();
  });
}

function showPlanWeekAssistantModal() {
  const incomplete = window.store.getIncompleteTasks();
  const activeProjects = window.store.getActiveProjects();
  const goals = window.store.get('goals') || [];

  window.app.showModal(`
    <div style="padding: 14px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase;">
        ✦ PLAN MY WEEK ASSISTANT
      </div>
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-top: 4px;">
        Distribute Backlog Across Your Week
      </h2>
      <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">
        You have ${incomplete.length} backlog task${incomplete.length !== 1 ? 's' : ''}, ${activeProjects.length} active project${activeProjects.length !== 1 ? 's' : ''}, and ${goals.length} active goal${goals.length !== 1 ? 's' : ''}.
      </p>

      <div style="background: var(--bg-secondary); padding: 14px; border-radius: var(--radius-md); margin-top: 14px;">
        <div style="font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
          Planora Smart Balancing Recommendation:
        </div>
        <ul style="padding-left: 18px; margin: 0; font-size: var(--text-xs); color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px;">
          <li>Focus on high-priority deadlines during Monday – Wednesday mornings.</li>
          <li>Reserve Thursday afternoon for deep project review & documentation.</li>
          <li>Keep Friday lighter for retrospective & weekly wrap-up.</li>
        </ul>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Close</button>
        <button class="btn btn--primary" onclick="window.app.hideModal(); window.app.showToast('Weekly focus balance applied!', 'success');">Apply Weekly Schedule</button>
      </div>
    </div>
  `);
}
