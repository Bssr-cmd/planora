export function render() {
  return `
    <div class="view view--daily h-full flex flex-col" style="max-width: 1200px; margin: 0 auto; padding-bottom: 30px;">
      <div class="view__header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-xl font-bold">Today & Daily Planner</h1>
          <p class="text-xs text-secondary mt-1">Structure your hours, time-block tasks, and review your day.</p>
        </div>

        <div class="flex items-center gap-3">
          <button id="btn-evening-review" class="btn btn--secondary btn--sm" style="background: rgba(108, 99, 255, 0.1); color: var(--accent-primary); font-weight: 600;">
            🌙 Evening Review
          </button>
          
          <div class="flex items-center gap-2 bg-bg-secondary p-1 rounded-lg border border-border">
            <button id="daily-prev" class="btn btn--icon btn--ghost p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <span id="daily-date-label" class="font-medium text-sm min-w-[120px] text-center cursor-pointer hover:text-accent-primary">Today</span>
            <button id="daily-next" class="btn btn--icon btn--ghost p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
        </div>
      </div>
      
      <div class="flex-1 flex flex-col md:flex-row overflow-hidden gap-6" style="min-height: 600px;">
        
        <!-- UNSCHEDULED TASKS SIDEBAR -->
        <div class="w-full md:w-1/3 flex flex-col border border-border rounded-xl bg-bg-elevated overflow-hidden shadow-sm">
          <div class="p-4 border-b border-border bg-bg-secondary flex justify-between items-center font-semibold text-sm">
            <span>Unscheduled Tasks</span>
            <button class="btn btn--ghost btn--sm text-accent-primary" id="btn-add-unscheduled">+ Add</button>
          </div>
          
          <div id="daily-unscheduled" class="flex-1 overflow-y-auto p-4 space-y-3">
            <!-- Unscheduled tasks draggable -->
          </div>
        </div>
        
        <!-- TIMELINE CONTAINER -->
        <div class="w-full md:w-2/3 overflow-y-auto border border-border rounded-xl bg-bg-elevated relative shadow-sm" id="daily-timeline-container">
          <div class="timeline p-4">
            <!-- Timeline slots generated here -->
            <div id="daily-now-line" class="absolute left-16 right-0 h-px bg-accent-danger z-10 pointer-events-none shadow-sm shadow-accent-danger" style="display:none;">
               <div class="w-2.5 h-2.5 rounded-full bg-accent-danger absolute -left-1 -top-1"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;
}

let unsubTasks = null;
let currentDate = new Date();
let intervalId = null;

export function mount() {
  currentDate = new Date();
  unsubTasks = window.store.subscribe('tasks', renderDaily);
  
  document.getElementById('daily-prev')?.addEventListener('click', () => changeDate(-1));
  document.getElementById('daily-next')?.addEventListener('click', () => changeDate(1));
  document.getElementById('daily-date-label')?.addEventListener('click', () => {
    currentDate = new Date();
    renderDaily();
  });
  
  document.getElementById('btn-evening-review')?.addEventListener('click', showEveningReviewModal);
  document.getElementById('btn-add-unscheduled')?.addEventListener('click', showAddUnscheduledTaskModal);
  
  renderTimelineSlots();
  renderDaily();
  updateNowLine();
  intervalId = setInterval(updateNowLine, 60000);
}

export function unmount() {
  if (unsubTasks) unsubTasks();
  if (intervalId) clearInterval(intervalId);
}

function changeDate(days) {
  currentDate.setDate(currentDate.getDate() + days);
  renderDaily();
}

function formatDateStr(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function renderTimelineSlots() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  
  let html = '';
  for (let i = 6; i <= 23; i++) {
    const ampm = i >= 12 ? 'PM' : 'AM';
    const hour = i > 12 ? i - 12 : i;
    const label = `${hour} ${ampm}`;
    const timeVal = `${String(i).padStart(2, '0')}:00`;
    
    html += `
      <div class="timeline__row flex border-b border-border-light relative h-16" data-hour="${i}">
        <div class="w-16 flex-shrink-0 text-xs text-tertiary pr-2 text-right py-2 relative -top-3 bg-bg-elevated font-mono">${label}</div>
        <div class="flex-1 border-l border-border-light relative hover:bg-bg-tertiary/50 transition-colors cursor-pointer timeline-slot" data-time="${timeVal}"></div>
      </div>
    `;
  }
  
  const existingRows = timeline.querySelectorAll('.timeline__row');
  existingRows.forEach(r => r.remove());
  timeline.insertAdjacentHTML('beforeend', html);
  
  document.querySelectorAll('.timeline-slot').forEach(slot => {
    slot.addEventListener('click', (e) => {
      if (e.target !== slot) return;
      const time = slot.dataset.time;
      const dateStr = formatDateStr(currentDate);
      showScheduleTaskModal(time, dateStr);
    });

    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.style.background = 'rgba(108, 99, 255, 0.1)';
    });

    slot.addEventListener('dragleave', () => {
      slot.style.background = '';
    });

    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.style.background = '';
      const taskId = e.dataTransfer.getData('text/plain');
      const time = slot.dataset.time;
      const dateStr = formatDateStr(currentDate);
      if (taskId) {
        window.store.updateTask(taskId, { scheduledDate: dateStr, scheduledTime: time });
        window.app.showToast('Task time-blocked!', 'success');
      }
    });
  });
}

function renderDaily() {
  const dateStr = formatDateStr(currentDate);
  const tasks = window.store.get('tasks') || [];
  
  const todayStr = window.store.today();
  const label = document.getElementById('daily-date-label');
  if (label) {
    if (dateStr === todayStr) {
      label.textContent = "Today";
    } else {
      label.textContent = currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }
  
  const dailyTasks = tasks.filter(t => t.scheduledDate === dateStr || t.deadline === dateStr);
  const unscheduled = dailyTasks.filter(t => !t.scheduledTime && !t.completed);
  const scheduled = dailyTasks.filter(t => t.scheduledTime && !t.completed);
  
  const unschedEl = document.getElementById('daily-unscheduled');
  if (unschedEl) {
    if (unscheduled.length === 0) {
      unschedEl.innerHTML = `
        <div class="text-center py-8">
          <p class="text-tertiary text-xs">No unscheduled tasks for today.</p>
          <button class="btn btn--ghost btn--sm mt-2 text-accent-primary" id="btn-empty-unsched-add">+ Add Task</button>
        </div>
      `;
      document.getElementById('btn-empty-unsched-add')?.addEventListener('click', showAddUnscheduledTaskModal);
    } else {
      unschedEl.innerHTML = unscheduled.map(t => `
        <div class="card p-3 shadow-sm border border-border cursor-grab bg-bg-primary hover:border-accent-primary transition-colors text-sm rounded-lg" draggable="true" data-id="${t.id}">
          <div class="font-semibold text-primary">${t.title}</div>
          <div class="flex justify-between items-center mt-2 text-xs text-tertiary">
            <span>${t.estimatedMinutes || 30} min</span>
            <span class="font-medium capitalize text-accent-primary">${t.priority || 'medium'}</span>
          </div>
        </div>
      `).join('');

      unschedEl.querySelectorAll('[draggable="true"]').forEach(el => {
        el.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', el.dataset.id);
        });
      });
    }
  }
  
  document.querySelectorAll('.timeline-task').forEach(el => el.remove());
  
  scheduled.forEach(t => {
    const [hours, mins] = t.scheduledTime.split(':').map(Number);
    if (hours >= 6 && hours <= 23) {
      const row = document.querySelector(`.timeline__row[data-hour="${hours}"]`);
      if (row) {
        const slot = row.querySelector('.timeline-slot');
        const duration = t.estimatedMinutes || 60;
        const heightPx = (duration / 60) * 64;
        const topPx = (mins / 60) * 64;
        
        const block = document.createElement('div');
        block.className = 'timeline-task absolute left-1 right-1 rounded-md p-2 text-xs shadow-md cursor-pointer overflow-hidden border border-surface-glass-border backdrop-blur-md z-0 transition-transform hover:scale-[1.01]';
        block.style.top = `${topPx}px`;
        block.style.height = `${heightPx - 2}px`;
        block.style.backgroundColor = 'var(--accent-primary)';
        block.style.color = '#fff';
        block.innerHTML = `
          <div class="font-semibold truncate">${t.title}</div>
          <div class="text-[10px] opacity-80 mt-0.5">${t.scheduledTime} · ${duration}m</div>
        `;
        
        block.addEventListener('click', (e) => {
          e.stopPropagation();
          window.app.navigate('tasks');
        });
        
        slot.appendChild(block);
      }
    }
  });
  
  updateNowLine();
}

function updateNowLine() {
  const line = document.getElementById('daily-now-line');
  if (!line) return;
  
  const todayStr = window.store.today();
  const dateStr = formatDateStr(currentDate);
  
  if (todayStr !== dateStr) {
    line.style.display = 'none';
    return;
  }
  
  const now = new Date();
  const hours = now.getHours();
  const mins = now.getMinutes();
  
  if (hours >= 6 && hours <= 23) {
    line.style.display = 'block';
    const rowOffset = hours - 6;
    const topPx = (rowOffset * 64) + ((mins / 60) * 64);
    line.style.top = `calc(1rem + ${topPx}px)`;
  } else {
    line.style.display = 'none';
  }
}

function showScheduleTaskModal(time, dateStr) {
  window.app.showModal(`
    <div style="padding: 10px;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 12px;">Schedule Task for ${time}</h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <input type="text" id="sched-task-title" class="input" placeholder="Task title..." autofocus>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Duration (mins)</label>
            <input type="number" id="sched-task-duration" class="input" value="60" style="margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Priority</label>
            <select id="sched-task-priority" class="input" style="margin-top: 4px;">
              <option value="high">High</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>
      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="btn-save-sched-task">Schedule Block</button>
      </div>
    </div>
  `);

  document.getElementById('btn-save-sched-task')?.addEventListener('click', () => {
    const title = document.getElementById('sched-task-title')?.value;
    if (!title || !title.trim()) return;

    window.store.addTask({
      title: title.trim(),
      scheduledDate: dateStr,
      scheduledTime: time,
      estimatedMinutes: parseInt(document.getElementById('sched-task-duration')?.value || 60, 10),
      priority: document.getElementById('sched-task-priority')?.value || 'medium'
    });

    window.app.showToast(`Scheduled "${title}" at ${time}`, 'success');
    window.app.hideModal();
  });
}

function showAddUnscheduledTaskModal() {
  const dateStr = formatDateStr(currentDate);
  window.app.showModal(`
    <div style="padding: 10px;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 12px;">Add Unscheduled Task</h2>
      <input type="text" id="unsched-title" class="input" placeholder="Task title..." autofocus style="width: 100%; margin-bottom: 12px;">
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="btn-save-unsched">Add Task</button>
      </div>
    </div>
  `);

  document.getElementById('btn-save-unsched')?.addEventListener('click', () => {
    const title = document.getElementById('unsched-title')?.value;
    if (!title || !title.trim()) return;

    window.store.addTask({
      title: title.trim(),
      scheduledDate: dateStr
    });

    window.app.showToast('Unscheduled task added', 'success');
    window.app.hideModal();
  });
}

/* ── SMART EVENING REVIEW & ROLLOVER FLOW ─────────────────── */
function showEveningReviewModal() {
  const todayTasks = window.store.getTodayTasks();
  const completed = todayTasks.filter(t => t.completed);
  const incomplete = todayTasks.filter(t => !t.completed);

  window.app.showModal(`
    <div style="padding: 14px;">
      <div style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase;">
        🌙 EVENING REVIEW & SMART ROLLOVER
      </div>
      <h2 style="font-size: var(--text-xl); font-weight: 700; margin-top: 4px; color: var(--text-primary);">
        You completed ${completed.length} of ${todayTasks.length} tasks today.
      </h2>

      ${incomplete.length === 0 ? `
        <p style="color: var(--text-secondary); font-size: var(--text-sm); margin-top: 8px;">
          🎉 Outstanding work! All tasks for today have been completed. Rest well!
        </p>
        <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
          <button class="btn btn--primary" onclick="window.app.hideModal()">Complete Review</button>
        </div>
      ` : `
        <p style="color: var(--text-secondary); font-size: var(--text-xs); margin-top: 6px;">
          Select how you want to rebalance your ${incomplete.length} uncompleted task${incomplete.length > 1 ? 's' : ''}:
        </p>

        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 14px; max-height: 240px; overflow-y: auto;">
          ${incomplete.map(t => `
            <div style="background: var(--bg-secondary); padding: 10px; border-radius: var(--radius-md); display: flex; justify-content: space-between; align-items: center; font-size: var(--text-xs);">
              <span style="font-weight: 600; color: var(--text-primary);">${t.title}</span>
              <select class="rollover-action-select input" data-task-id="${t.id}" style="font-size: 11px; padding: 2px 6px;">
                <option value="tomorrow">Tomorrow</option>
                <option value="week">This Week</option>
                <option value="backlog">Backlog</option>
                <option value="delete">Delete</option>
              </select>
            </div>
          `).join('')}
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
          <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
          <button class="btn btn--primary" id="btn-apply-rollover">Apply Smart Rollover</button>
        </div>
      `}
    </div>
  `);

  document.getElementById('btn-apply-rollover')?.addEventListener('click', () => {
    const selects = document.querySelectorAll('.rollover-action-select');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const weekLater = new Date();
    weekLater.setDate(weekLater.getDate() + 5);
    const weekLaterStr = weekLater.toISOString().split('T')[0];

    selects.forEach(sel => {
      const id = sel.dataset.taskId;
      const action = sel.value;

      if (action === 'tomorrow') {
        window.store.updateTask(id, { scheduledDate: tomorrowStr });
      } else if (action === 'week') {
        window.store.updateTask(id, { scheduledDate: weekLaterStr });
      } else if (action === 'backlog') {
        window.store.updateTask(id, { scheduledDate: null, scheduledTime: null });
      } else if (action === 'delete') {
        window.store.deleteTask(id);
      }
    });

    window.app.showToast('Schedule rebalanced & rolled over!', 'success');
    window.app.hideModal();
  });
}
