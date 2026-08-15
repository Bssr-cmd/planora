export function render() {
  return `
    <div class="view view--weekly h-full flex flex-col">
      <div class="view__header flex justify-between items-center mb-6">
        <h1 class="text-xl font-bold">Weekly Planner</h1>
        <div class="flex items-center gap-4 bg-bg-secondary p-1 rounded-lg">
          <button id="weekly-prev" class="btn btn--icon btn--ghost p-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
          <span id="weekly-date-label" class="font-medium text-sm min-w-[150px] text-center cursor-pointer hover:text-accent-primary">This Week</span>
          <button id="weekly-next" class="btn btn--icon btn--ghost p-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
        </div>
      </div>
      
      <div class="flex-1 overflow-x-auto pb-4">
        <div class="weekly-grid flex h-full min-w-[900px] gap-4" id="weekly-grid-container">
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
  return \`\${yyyy}-\${mm}-\${dd}\`;
}

function renderWeekly() {
  const endOfWeek = new Date(currentWeekStart);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  
  const label = document.getElementById('weekly-date-label');
  if (label) {
    const opts = { month: 'short', day: 'numeric' };
    label.textContent = \`\${currentWeekStart.toLocaleDateString(undefined, opts)} - \${endOfWeek.toLocaleDateString(undefined, opts)}\`;
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
    
    html += \`
      <div class="day-column flex-1 flex flex-col bg-bg-elevated rounded-xl border \${isToday ? 'border-accent-primary' : 'border-border'} overflow-hidden" data-date="\${dateStr}">
        <div class="p-3 text-center border-b \${isToday ? 'border-accent-primary bg-accent-primary/10 text-accent-primary' : 'border-border bg-bg-secondary'} font-medium">
          <div class="text-xs uppercase tracking-wider">\${dayNames[i]}</div>
          <div class="text-lg">\${d.getDate()}</div>
        </div>
        <div class="flex-1 p-2 space-y-2 overflow-y-auto">
          \${dayTasks.map(t => \`
            <div class="card p-3 shadow-sm border border-border cursor-pointer hover:border-accent-primary transition-colors text-sm" onclick="window.app.navigate('tasks')">
              <div class="font-medium">\${t.title}</div>
              \${t.estimatedMinutes ? \`<div class="text-xs text-tertiary mt-1">\${t.estimatedMinutes}m</div>\` : ''}
            </div>
          \`).join('')}
        </div>
        <div class="p-2 border-t border-border">
          <button class="btn btn--ghost btn--sm w-full add-weekly-task" data-date="\${dateStr}">+ Add</button>
        </div>
      </div>
    \`;
  }
  
  container.innerHTML = html;
  
  document.querySelectorAll('.add-weekly-task').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dateStr = btn.dataset.date;
      const title = prompt('New task title:');
      if (title) {
        window.store.addTask({ title, scheduledDate: dateStr });
      }
    });
  });
}
