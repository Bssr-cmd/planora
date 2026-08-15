export function render() {
  return `
    <div class="view view--calendar h-full flex flex-col">
      <div class="view__header flex justify-between items-center mb-6">
        <h1 class="text-xl font-bold">Calendar</h1>
        
        <div class="flex items-center gap-2">
          <div class="flex items-center gap-1 bg-bg-secondary p-1 rounded-lg mr-4">
            <button id="cal-prev" class="btn btn--icon btn--ghost p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <span id="cal-month-label" class="font-medium text-sm min-w-[100px] text-center">Month Year</span>
            <button id="cal-next" class="btn btn--icon btn--ghost p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>
          <button class="btn btn--primary flex items-center gap-2" id="cal-add-btn">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
             New Event
          </button>
        </div>
      </div>
      
      <div class="flex-1 bg-bg-elevated border border-border rounded-xl overflow-hidden flex flex-col">
        <div class="grid grid-cols-7 border-b border-border bg-bg-secondary">
          <div class="p-2 text-center text-xs font-medium text-tertiary">Sun</div>
          <div class="p-2 text-center text-xs font-medium text-tertiary">Mon</div>
          <div class="p-2 text-center text-xs font-medium text-tertiary">Tue</div>
          <div class="p-2 text-center text-xs font-medium text-tertiary">Wed</div>
          <div class="p-2 text-center text-xs font-medium text-tertiary">Thu</div>
          <div class="p-2 text-center text-xs font-medium text-tertiary">Fri</div>
          <div class="p-2 text-center text-xs font-medium text-tertiary">Sat</div>
        </div>
        <div class="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6" id="cal-grid">
          <!-- Calendar cells generated here -->
        </div>
      </div>
    </div>
  `;
}

let unsubEvents = null;
let unsubTasks = null;
let currentMonthDate = new Date();

export function mount() {
  currentMonthDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  
  unsubEvents = window.store.subscribe('events', renderCalendar);
  unsubTasks = window.store.subscribe('tasks', renderCalendar);
  
  document.getElementById('cal-prev')?.addEventListener('click', () => changeMonth(-1));
  document.getElementById('cal-next')?.addEventListener('click', () => changeMonth(1));
  document.getElementById('cal-add-btn')?.addEventListener('click', () => {
    const today = window.store.today();
    window.store.addEvent({ title: 'New Event', date: today, startTime: '12:00', endTime: '13:00', color: '#6C63FF' });
    window.app.showToast('Dummy event added', 'success');
  });
  
  renderCalendar();
}

export function unmount() {
  if (unsubEvents) unsubEvents();
  if (unsubTasks) unsubTasks();
}

function changeMonth(delta) {
  currentMonthDate.setMonth(currentMonthDate.getMonth() + delta);
  renderCalendar();
}

function formatDateStr(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return \`\${yyyy}-\${mm}-\${dd}\`;
}

function renderCalendar() {
  const label = document.getElementById('cal-month-label');
  if (label) {
    label.textContent = currentMonthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  }
  
  const grid = document.getElementById('cal-grid');
  if (!grid) return;
  
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay(); // 0-6 (Sun-Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  
  const cells = [];
  
  // Previous month padding
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    cells.push({ date: d, currentMonth: false });
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    cells.push({ date: d, currentMonth: true });
  }
  
  // Next month padding (to fill 42 cells = 6 rows)
  let nextDays = 1;
  while (cells.length < 42) {
    const d = new Date(year, month + 1, nextDays++);
    cells.push({ date: d, currentMonth: false });
  }
  
  const todayStr = window.store.today();
  const allEvents = window.store.get('events') || [];
  const allTasks = window.store.get('tasks') || [];
  
  grid.innerHTML = cells.map(cell => {
    const dateStr = formatDateStr(cell.date);
    const isToday = dateStr === todayStr;
    const cellEvents = allEvents.filter(e => e.date === dateStr);
    const cellTasks = allTasks.filter(t => (t.scheduledDate === dateStr || t.deadline === dateStr) && !t.completed);
    
    let itemsHtml = '';
    
    cellEvents.slice(0, 2).forEach(e => {
      itemsHtml += \`<div class="text-[10px] truncate rounded px-1 mb-1 text-white" style="background-color: \${e.color || 'var(--accent-primary)'}">\${e.startTime} \${e.title}</div>\`;
    });
    
    if (cellTasks.length > 0) {
      itemsHtml += \`<div class="text-[10px] truncate text-tertiary flex items-center gap-1"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>\${cellTasks.length} task\${cellTasks.length > 1 ? 's' : ''}</div>\`;
    }
    
    return \`
      <div class="calendar-cell border-r border-b border-border p-1 md:p-2 hover:bg-bg-tertiary transition-colors cursor-pointer \${!cell.currentMonth ? 'bg-bg-primary/50 text-tertiary' : ''}">
        <div class="flex justify-between items-start mb-1">
          <span class="inline-flex items-center justify-center w-6 h-6 text-sm \${isToday ? 'bg-accent-primary text-white rounded-full font-bold' : ''}">\${cell.date.getDate()}</span>
        </div>
        <div class="calendar-cell-items overflow-hidden">
          \${itemsHtml}
        </div>
      </div>
    \`;
  }).join('');
}
