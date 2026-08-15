export function render() {
  return `
    <div class="view view--daily h-full flex flex-col">
      <div class="view__header flex justify-between items-center mb-6">
        <h1 class="text-xl font-bold">Daily Planner</h1>
        <div class="flex items-center gap-4 bg-bg-secondary p-1 rounded-lg">
          <button id="daily-prev" class="btn btn--icon btn--ghost p-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
          <span id="daily-date-label" class="font-medium text-sm min-w-[120px] text-center cursor-pointer hover:text-accent-primary">Today</span>
          <button id="daily-next" class="btn btn--icon btn--ghost p-2"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
        </div>
      </div>
      
      <div class="flex-1 flex overflow-hidden gap-6">
        <div class="w-1/4 flex flex-col border border-border rounded-xl bg-bg-elevated overflow-hidden">
          <div class="p-4 border-b border-border bg-bg-secondary font-medium text-sm">Unscheduled Tasks</div>
          <div id="daily-unscheduled" class="flex-1 overflow-y-auto p-4 space-y-3">
            <!-- Unscheduled tasks draggable -->
          </div>
        </div>
        
        <div class="w-3/4 overflow-y-auto border border-border rounded-xl bg-bg-elevated relative" id="daily-timeline-container">
          <div class="timeline p-4">
            <!-- Timeline slots generated here -->
            <div id="daily-now-line" class="absolute left-16 right-0 h-px bg-accent-danger z-10 pointer-events-none shadow-sm shadow-accent-danger" style="display:none;">
               <div class="w-2 h-2 rounded-full bg-accent-danger absolute -left-1 -top-1"></div>
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
  currentDate = new Date(); // reset to today
  unsubTasks = window.store.subscribe('tasks', renderDaily);
  
  document.getElementById('daily-prev')?.addEventListener('click', () => changeDate(-1));
  document.getElementById('daily-next')?.addEventListener('click', () => changeDate(1));
  document.getElementById('daily-date-label')?.addEventListener('click', () => {
    currentDate = new Date();
    renderDaily();
  });
  
  renderTimelineSlots();
  renderDaily();
  updateNowLine();
  intervalId = setInterval(updateNowLine, 60000); // update every minute
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
  return \`\${yyyy}-\${mm}-\${dd}\`;
}

function renderTimelineSlots() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  
  let html = '';
  // 6 AM to 11 PM
  for (let i = 6; i <= 23; i++) {
    const ampm = i >= 12 ? 'PM' : 'AM';
    const hour = i > 12 ? i - 12 : i;
    const label = \`\${hour} \${ampm}\`;
    
    html += \`
      <div class="timeline__row flex border-b border-border-light relative h-16" data-hour="\${i}">
        <div class="w-16 flex-shrink-0 text-xs text-tertiary pr-2 text-right py-2 relative -top-3 bg-bg-elevated">\${label}</div>
        <div class="flex-1 border-l border-border-light relative hover:bg-bg-tertiary transition-colors cursor-pointer timeline-slot" data-time="\${String(i).padStart(2, '0')}:00"></div>
      </div>
    \`;
  }
  
  const existingRows = timeline.querySelectorAll('.timeline__row');
  existingRows.forEach(r => r.remove()); // clear old
  timeline.insertAdjacentHTML('beforeend', html);
  
  document.querySelectorAll('.timeline-slot').forEach(slot => {
    slot.addEventListener('click', (e) => {
      if (e.target !== slot) return; // Ignore clicks on tasks inside
      const time = slot.dataset.time;
      const dateStr = formatDateStr(currentDate);
      // Quick add task
      const title = prompt(\`Add task for \${time}\`);
      if (title) {
        window.store.addTask({ title, scheduledDate: dateStr, scheduledTime: time, estimatedMinutes: 60 });
      }
    });
  });
}

function renderDaily() {
  const dateStr = formatDateStr(currentDate);
  const tasks = window.store.get('tasks') || [];
  
  // Update header
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
  
  // Render unscheduled
  const unschedEl = document.getElementById('daily-unscheduled');
  if (unschedEl) {
    if (unscheduled.length === 0) {
      unschedEl.innerHTML = '<p class="text-tertiary text-sm text-center py-4">No unscheduled tasks.</p>';
    } else {
      unschedEl.innerHTML = unscheduled.map(t => \`
        <div class="card p-3 shadow-sm border border-border cursor-move bg-bg-primary hover:border-accent-primary transition-colors text-sm" draggable="true" data-id="\${t.id}">
          <div class="font-medium">\${t.title}</div>
          \${t.estimatedMinutes ? \`<div class="text-xs text-tertiary mt-1">\${t.estimatedMinutes}m</div>\` : ''}
        </div>
      \`).join('');
    }
  }
  
  // Clear existing scheduled blocks
  document.querySelectorAll('.timeline-task').forEach(el => el.remove());
  
  // Render scheduled
  scheduled.forEach(t => {
    const [hours, mins] = t.scheduledTime.split(':').map(Number);
    if (hours >= 6 && hours <= 23) {
      const row = document.querySelector(\`.timeline__row[data-hour="\${hours}"]\`);
      if (row) {
        const slot = row.querySelector('.timeline-slot');
        const duration = t.estimatedMinutes || 60;
        const heightPx = (duration / 60) * 64; // 64px is h-16
        const topPx = (mins / 60) * 64;
        
        const block = document.createElement('div');
        block.className = 'timeline-task absolute left-1 right-1 rounded-md p-2 text-sm shadow-sm cursor-pointer overflow-hidden border border-surface-glass-border backdrop-blur-md z-0';
        block.style.top = \`\${topPx}px\`;
        block.style.height = \`\${heightPx - 2}px\`;
        block.style.backgroundColor = 'var(--accent-primary)';
        block.style.color = '#fff';
        block.style.opacity = '0.9';
        block.innerHTML = \`<div class="font-medium truncate">\${t.title}</div>\`;
        
        block.addEventListener('click', (e) => {
          e.stopPropagation();
          // Open task edit (could link to real modal)
          window.app.navigate('tasks'); // simplification
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
    // Calculate total pixels from top of timeline
    // Each row is 64px. 6AM is row 0.
    const rowOffset = hours - 6;
    const topPx = (rowOffset * 64) + ((mins / 60) * 64);
    // +1rem padding in timeline container
    line.style.top = \`calc(1rem + \${topPx}px)\`;
  } else {
    line.style.display = 'none';
  }
}
