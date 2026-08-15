let unsubEvents = null;
let unsubTasks = null;
let unsubHabits = null;
let unsubFocus = null;

let currentView = 'month'; // 'month', 'week', 'day', 'agenda'
let currentDate = new Date();
let miniCalDate = new Date();

// Category filter toggles (Google Calendar style "My Calendars")
const filters = {
  events: true,
  tasks: true,
  focus: true,
  deadlines: true,
  habits: true
};

export function render() {
  return `
    <div class="gcal-wrapper flex flex-col h-full w-full bg-bg-primary text-primary" style="max-width: 1350px; margin: 0 auto; min-height: 720px; padding-bottom: 24px;">
      
      <!-- GOOGLE CALENDAR TOP NAVBAR -->
      <div class="gcal-header flex justify-between items-center px-4 py-3 border border-border bg-bg-elevated rounded-xl mb-4 gap-4 flex-wrap shadow-sm">
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <div style="background: rgba(26, 115, 232, 0.1); padding: 8px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2.2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <span class="font-bold text-lg text-primary tracking-tight">Calendar</span>
          </div>

          <button id="gcal-today-btn" class="btn btn--secondary btn--sm font-semibold px-3 py-1.5 border border-border rounded-md hover:bg-bg-tertiary">
            Today
          </button>

          <div class="flex items-center gap-1">
            <button id="gcal-prev" class="btn btn--icon btn--ghost p-1 rounded-full"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
            <button id="gcal-next" class="btn btn--icon btn--ghost p-1 rounded-full"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
          </div>

          <h2 id="gcal-title" class="text-lg font-bold text-primary min-w-[160px]">
            August 2026
          </h2>
        </div>

        <div class="flex items-center gap-3">
          <!-- VIEW SELECTOR -->
          <div class="flex bg-bg-secondary p-1 rounded-lg border border-border text-xs font-medium">
            <button class="gcal-view-btn px-3 py-1 rounded-md transition-all ${currentView === 'day' ? 'bg-bg-elevated text-accent-primary font-bold shadow-xs' : 'text-secondary'}" data-view="day">Day</button>
            <button class="gcal-view-btn px-3 py-1 rounded-md transition-all ${currentView === 'week' ? 'bg-bg-elevated text-accent-primary font-bold shadow-xs' : 'text-secondary'}" data-view="week">Week</button>
            <button class="gcal-view-btn px-3 py-1 rounded-md transition-all ${currentView === 'month' ? 'bg-bg-elevated text-accent-primary font-bold shadow-xs' : 'text-secondary'}" data-view="month">Month</button>
            <button class="gcal-view-btn px-3 py-1 rounded-md transition-all ${currentView === 'agenda' ? 'bg-bg-elevated text-accent-primary font-bold shadow-xs' : 'text-secondary'}" data-view="agenda">Agenda</button>
          </div>
        </div>
      </div>

      <!-- MAIN CONTAINER: SIDEBAR + GRID -->
      <div class="flex-1 flex flex-col md:flex-row gap-4 border border-border bg-bg-elevated rounded-xl overflow-hidden shadow-sm" style="min-height: 620px;">
        
        <!-- GOOGLE CALENDAR LEFT SIDEBAR -->
        <div class="w-full md:w-[250px] border-r border-border p-4 flex flex-col gap-6 bg-bg-secondary/40 flex-shrink-0">
          
          <!-- GOOGLE CALENDAR FAB CREATE BUTTON -->
          <button id="gcal-create-btn" class="btn btn--primary flex items-center justify-center gap-2 px-5 py-3 rounded-full shadow-md hover:shadow-lg font-bold text-sm transition-all" style="background: #1a73e8; color: white;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Create
          </button>

          <!-- MINI CALENDAR WIDGET -->
          <div style="background: var(--bg-elevated); padding: 12px; border-radius: var(--radius-lg); border: 1px solid var(--border);">
            <div class="flex justify-between items-center mb-3 px-1">
              <span id="mini-cal-label" class="text-xs font-bold text-primary">Aug 2026</span>
              <div class="flex gap-1">
                <button id="mini-prev" class="p-1 text-tertiary hover:text-primary rounded-full hover:bg-bg-tertiary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
                <button id="mini-next" class="p-1 text-tertiary hover:text-primary rounded-full hover:bg-bg-tertiary"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
              </div>
            </div>

            <!-- EXPLICIT CSS GRID FOR MINI CALENDAR -->
            <div id="mini-cal-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-size: 11px; row-gap: 4px; gap-column: 2px;">
              <!-- Mini calendar cells -->
            </div>
          </div>

          <!-- MY CALENDARS (CATEGORY FILTER TOGGLES) -->
          <div style="background: var(--bg-elevated); padding: 14px; border-radius: var(--radius-lg); border: 1px solid var(--border);">
            <div class="text-xs font-bold text-tertiary uppercase tracking-wider mb-3">My Calendars</div>
            <div class="space-y-2 text-xs font-medium">
              <label class="flex items-center gap-2 cursor-pointer hover:bg-bg-tertiary/50 p-1.5 rounded-md transition-colors">
                <input type="checkbox" id="filter-events" ${filters.events ? 'checked' : ''} class="accent-[#1a73e8] w-4 h-4">
                <span class="w-2.5 h-2.5 rounded-full bg-[#1a73e8] flex-shrink-0"></span>
                <span class="text-primary font-medium">Events</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer hover:bg-bg-tertiary/50 p-1.5 rounded-md transition-colors">
                <input type="checkbox" id="filter-tasks" ${filters.tasks ? 'checked' : ''} class="accent-[#6c63ff] w-4 h-4">
                <span class="w-2.5 h-2.5 rounded-full bg-[#6c63ff] flex-shrink-0"></span>
                <span class="text-primary font-medium">Tasks</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer hover:bg-bg-tertiary/50 p-1.5 rounded-md transition-colors">
                <input type="checkbox" id="filter-focus" ${filters.focus ? 'checked' : ''} class="accent-[#f57c00] w-4 h-4">
                <span class="w-2.5 h-2.5 rounded-full bg-[#f57c00] flex-shrink-0"></span>
                <span class="text-primary font-medium">Focus Blocks</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer hover:bg-bg-tertiary/50 p-1.5 rounded-md transition-colors">
                <input type="checkbox" id="filter-deadlines" ${filters.deadlines ? 'checked' : ''} class="accent-[#d93025] w-4 h-4">
                <span class="w-2.5 h-2.5 rounded-full bg-[#d93025] flex-shrink-0"></span>
                <span class="text-primary font-medium">Deadlines</span>
              </label>

              <label class="flex items-center gap-2 cursor-pointer hover:bg-bg-tertiary/50 p-1.5 rounded-md transition-colors">
                <input type="checkbox" id="filter-habits" ${filters.habits ? 'checked' : ''} class="accent-[#0f9d58] w-4 h-4">
                <span class="w-2.5 h-2.5 rounded-full bg-[#0f9d58] flex-shrink-0"></span>
                <span class="text-primary font-medium">Habits</span>
              </label>
            </div>
          </div>

        </div>

        <!-- MAIN CALENDAR DISPLAY AREA -->
        <div class="flex-1 flex flex-col overflow-hidden bg-bg-elevated" id="gcal-main">
          <!-- Rendered view content -->
        </div>

      </div>

    </div>
  `;
}

export function mount() {
  currentDate = new Date();
  miniCalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

  unsubEvents = window.store.subscribe('events', updateGCalView);
  unsubTasks = window.store.subscribe('tasks', updateGCalView);
  unsubHabits = window.store.subscribe('habits', updateGCalView);
  unsubFocus = window.store.subscribe('focusSessions', updateGCalView);

  document.getElementById('gcal-today-btn')?.addEventListener('click', () => {
    currentDate = new Date();
    miniCalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    updateGCalView();
  });

  document.getElementById('gcal-prev')?.addEventListener('click', () => changeDate(-1));
  document.getElementById('gcal-next')?.addEventListener('click', () => changeDate(1));
  document.getElementById('gcal-create-btn')?.addEventListener('click', () => openGoogleEventModal());

  document.querySelectorAll('.gcal-view-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentView = e.currentTarget.dataset.view;
      document.querySelectorAll('.gcal-view-btn').forEach(b => {
        b.classList.remove('bg-bg-elevated', 'text-accent-primary', 'font-bold', 'shadow-xs');
        b.classList.add('text-secondary');
      });
      e.currentTarget.classList.add('bg-bg-elevated', 'text-accent-primary', 'font-bold', 'shadow-xs');
      e.currentTarget.classList.remove('text-secondary');
      updateGCalView();
    });
  });

  document.getElementById('mini-prev')?.addEventListener('click', () => {
    miniCalDate.setMonth(miniCalDate.getMonth() - 1);
    renderMiniCalendar();
  });
  document.getElementById('mini-next')?.addEventListener('click', () => {
    miniCalDate.setMonth(miniCalDate.getMonth() + 1);
    renderMiniCalendar();
  });

  ['events', 'tasks', 'focus', 'deadlines', 'habits'].forEach(key => {
    document.getElementById(`filter-${key}`)?.addEventListener('change', (e) => {
      filters[key] = e.target.checked;
      updateGCalView();
    });
  });

  updateGCalView();
}

export function unmount() {
  if (unsubEvents) unsubEvents();
  if (unsubTasks) unsubTasks();
  if (unsubHabits) unsubHabits();
  if (unsubFocus) unsubFocus();
}

function changeDate(delta) {
  if (currentView === 'month') {
    currentDate.setMonth(currentDate.getMonth() + delta);
    miniCalDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  } else if (currentView === 'week') {
    currentDate.setDate(currentDate.getDate() + (delta * 7));
  } else {
    currentDate.setDate(currentDate.getDate() + delta);
  }
  updateGCalView();
}

function updateGCalView() {
  renderMiniCalendar();
  renderHeaderTitle();

  const main = document.getElementById('gcal-main');
  if (!main) return;

  if (currentView === 'month') {
    main.innerHTML = renderGoogleMonthView();
  } else if (currentView === 'week') {
    main.innerHTML = renderGoogleWeekView();
  } else if (currentView === 'day') {
    main.innerHTML = renderGoogleDayView();
  } else {
    main.innerHTML = renderGoogleAgendaView();
  }

  bindGCalInteractions();
}

function renderHeaderTitle() {
  const titleEl = document.getElementById('gcal-title');
  if (!titleEl) return;

  if (currentView === 'month') {
    titleEl.textContent = currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } else if (currentView === 'week') {
    const mon = getMonday(currentDate);
    const sun = new Date(mon);
    sun.setDate(sun.getDate() + 6);
    titleEl.textContent = `${mon.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${sun.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`;
  } else if (currentView === 'day') {
    titleEl.textContent = currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  } else {
    titleEl.textContent = 'Agenda View';
  }
}

function formatDateStr(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/* ── MINI CALENDAR WIDGET ── */
function renderMiniCalendar() {
  const label = document.getElementById('mini-cal-label');
  const grid = document.getElementById('mini-cal-grid');
  if (!label || !grid) return;

  label.textContent = miniCalDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  const year = miniCalDate.getFullYear();
  const month = miniCalDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  let html = `
    <div style="font-weight: 700; color: var(--text-tertiary);">S</div>
    <div style="font-weight: 700; color: var(--text-tertiary);">M</div>
    <div style="font-weight: 700; color: var(--text-tertiary);">T</div>
    <div style="font-weight: 700; color: var(--text-tertiary);">W</div>
    <div style="font-weight: 700; color: var(--text-tertiary);">T</div>
    <div style="font-weight: 700; color: var(--text-tertiary);">F</div>
    <div style="font-weight: 700; color: var(--text-tertiary);">S</div>
  `;

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div style="color: var(--text-tertiary); opacity: 0.35; padding: 4px 0;">${daysInPrev - i}</div>`;
  }

  const todayStr = window.store.today();
  const selectedStr = formatDateStr(currentDate);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = formatDateStr(dateObj);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedStr;

    let style = 'cursor: pointer; padding: 3px 0; border-radius: 50%; font-weight: 500; text-align: center; ';
    if (isToday) style += 'background: #1a73e8; color: white; font-weight: 700; ';
    else if (isSelected) style += 'background: rgba(108, 99, 255, 0.15); color: var(--accent-primary); font-weight: 700; ';
    else style += 'color: var(--text-primary); ';

    html += `<div style="${style}" class="mini-date-cell" data-date="${dateStr}">${d}</div>`;
  }

  grid.innerHTML = html;

  grid.querySelectorAll('.mini-date-cell').forEach(cell => {
    cell.addEventListener('click', () => {
      const parts = cell.dataset.date.split('-');
      currentDate = new Date(parts[0], parts[1] - 1, parts[2]);
      updateGCalView();
    });
  });
}

/* ── GOOGLE CALENDAR MONTH VIEW ── */
function renderGoogleMonthView() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: new Date(year, month - 1, daysInPrev - i), inMonth: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ date: new Date(year, month, i), inMonth: true });
  }
  let nextDay = 1;
  while (cells.length < 35 || (cells.length < 42 && cells.length % 7 !== 0)) {
    cells.push({ date: new Date(year, month + 1, nextDay++), inMonth: false });
  }

  const todayStr = window.store.today();
  const allEvents = window.store.get('events') || [];
  const allTasks = window.store.get('tasks') || [];
  const allFocus = window.store.get('focusSessions') || [];
  const allHabits = window.store.get('habits') || [];

  return `
    <div style="display: flex; flex-direction: column; height: 100%; width: 100%;">
      
      <!-- DAY NAME HEADERS -->
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid var(--border); background: var(--bg-secondary); text-align: center; font-size: 11px; font-weight: 700; color: var(--text-tertiary); padding: 8px 0;">
        <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
      </div>

      <!-- 7-COLUMN MONTH GRID -->
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: 1fr; flex: 1; width: 100%; min-height: 540px;">
        ${cells.map(cell => {
          const dateStr = formatDateStr(cell.date);
          const isToday = dateStr === todayStr;

          const items = [];
          if (filters.events) {
            allEvents.filter(e => e.date === dateStr).forEach(e => {
              items.push({ type: 'event', id: e.id, title: e.title, time: e.startTime, color: e.color || '#1a73e8', raw: e });
            });
          }
          if (filters.tasks) {
            allTasks.filter(t => (t.scheduledDate === dateStr || t.deadline === dateStr) && !t.completed).forEach(t => {
              items.push({ type: 'task', id: t.id, title: t.title, time: t.scheduledTime || 'Task', color: '#6c63ff', raw: t });
            });
          }
          if (filters.focus) {
            allFocus.filter(f => f.startTime && f.startTime.startsWith(dateStr)).forEach(f => {
              items.push({ type: 'focus', id: f.id, title: `Focus ${f.duration || 25}m`, time: 'Focus', color: '#f57c00', raw: f });
            });
          }
          if (filters.deadlines) {
            allTasks.filter(t => t.deadline === dateStr && !t.completed).forEach(t => {
              items.push({ type: 'deadline', id: t.id, title: `📌 Due: ${t.title}`, time: 'Due', color: '#d93025', raw: t });
            });
          }
          if (filters.habits) {
            allHabits.filter(h => (h.completedDates || []).includes(dateStr)).forEach(h => {
              items.push({ type: 'habit', id: h.id, title: `🌱 ${h.name}`, time: 'Habit', color: '#0f9d58', raw: h });
            });
          }

          return `
            <div class="gcal-cell" data-date="${dateStr}" style="border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 6px; display: flex; flex-direction: column; overflow: hidden; background: ${!cell.inMonth ? 'rgba(0,0,0,0.02)' : 'var(--bg-elevated)'}; cursor: pointer;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; font-size: 12px; font-weight: 700; border-radius: 50%; ${isToday ? 'background: #1a73e8; color: white;' : cell.inMonth ? 'color: var(--text-primary);' : 'color: var(--text-tertiary);'}">${cell.date.getDate()}</span>
              </div>

              <div style="flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden;">
                ${items.slice(0, 3).map(item => `
                  <div class="gcal-chip gcal-item-chip" data-type="${item.type}" data-id="${item.id}" style="background-color: ${item.color}; color: white; border-radius: 4px; padding: 2px 6px; font-size: 11px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; cursor: pointer;">
                    ${item.time ? `<strong style="opacity: 0.85; margin-right: 3px;">${item.time}</strong>` : ''}${item.title}
                  </div>
                `).join('')}

                ${items.length > 3 ? `<div style="font-size: 10px; font-weight: 700; color: var(--accent-primary); padding-left: 2px;">+${items.length - 3} more</div>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ── GOOGLE CALENDAR WEEK VIEW ── */
function renderGoogleWeekView() {
  const mon = getMonday(currentDate);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon);
    d.setDate(d.getDate() + i);
    days.push(d);
  }

  const allEvents = window.store.get('events') || [];
  const allTasks = window.store.get('tasks') || [];

  return `
    <div style="display: flex; flex-direction: column; height: 100%; overflow-x: auto;">
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); border-bottom: 1px solid var(--border); background: var(--bg-secondary); text-align: center; padding: 10px 0; min-width: 700px;">
        ${days.map(d => {
          const dateStr = formatDateStr(d);
          const isToday = dateStr === window.store.today();
          return `
            <div style="font-size: 12px; font-weight: 600; ${isToday ? 'color: #1a73e8;' : 'color: var(--text-primary);'}">
              <div style="text-transform: uppercase; font-size: 10px; color: var(--text-tertiary); font-weight: 700;">${d.toLocaleDateString(undefined, { weekday: 'short' })}</div>
              <div style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; font-size: 14px; font-weight: 700; margin-top: 2px; ${isToday ? 'background: #1a73e8; color: white; border-radius: 50%;' : ''}">${d.getDate()}</div>
            </div>
          `;
        }).join('')}
      </div>

      <div style="display: grid; grid-template-columns: repeat(7, 1fr); flex: 1; min-width: 700px; overflow-y: auto; padding: 8px;">
        ${days.map(d => {
          const dateStr = formatDateStr(d);
          const dayEvents = allEvents.filter(e => e.date === dateStr);
          const dayTasks = allTasks.filter(t => t.scheduledDate === dateStr && !t.completed);

          return `
            <div class="gcal-cell" data-date="${dateStr}" style="border-right: 1px solid var(--border); padding: 8px; display: flex; flex-direction: column; gap: 8px;">
              ${dayEvents.map(e => `
                <div class="gcal-item-chip" data-type="event" data-id="${e.id}" style="background: ${e.color || '#1a73e8'}; color: white; padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                  <div>${e.title}</div>
                  <div style="font-size: 10px; opacity: 0.85; margin-top: 2px;">${e.startTime} - ${e.endTime}</div>
                </div>
              `).join('')}

              ${dayTasks.map(t => `
                <div class="gcal-item-chip" data-type="task" data-id="${t.id}" style="background: var(--bg-secondary); border: 1px solid var(--border); color: var(--text-primary); padding: 8px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;">
                  <div>✓ ${t.title}</div>
                  <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 2px;">${t.scheduledTime || 'Task'}</div>
                </div>
              `).join('')}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/* ── GOOGLE CALENDAR DAY VIEW ── */
function renderGoogleDayView() {
  const dateStr = formatDateStr(currentDate);
  const events = (window.store.get('events') || []).filter(e => e.date === dateStr);
  const tasks = (window.store.get('tasks') || []).filter(t => t.scheduledDate === dateStr || t.deadline === dateStr);

  return `
    <div style="padding: 24px; overflow-y: auto; max-width: 800px; margin: 0 auto; width: 100%;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="font-size: var(--text-xl); font-weight: 700; color: var(--text-primary); margin: 0;">${currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h2>
        <div style="display: flex; gap: 8px;">
           <button class="btn btn--secondary btn--sm" id="btn-open-daily-note" data-date="${dateStr}">📝 Daily Note</button>
           <button class="btn btn--primary btn--sm" onclick="openGoogleEventModal('${dateStr}')">+ Add Event</button>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <h3 style="font-size: 11px; font-weight: 700; color: var(--text-tertiary); text-transform: uppercase; letter-spacing: 1px; margin: 0;">Scheduled Events & Blocks</h3>
        ${events.length === 0 && tasks.length === 0 ? '<p style="font-size: var(--text-xs); color: var(--text-tertiary); padding: 16px 0;">No events or tasks scheduled for today.</p>' : ''}
        
        ${events.map(e => `
          <div class="gcal-item-chip" data-type="event" data-id="${e.id}" style="background-color: ${e.color || '#1a73e8'}; color: white; padding: 16px; border-radius: var(--radius-lg); display: flex; justify-content: space-between; align-items: center; cursor: pointer;">
            <div>
              <div style="font-weight: 700; font-size: var(--text-base);">${e.title}</div>
              <div style="font-size: var(--text-xs); opacity: 0.9; margin-top: 4px;">🕒 ${e.startTime} - ${e.endTime}</div>
            </div>
            <button class="btn btn--ghost text-white btn-edit-event" data-id="${e.id}">Edit ✏️</button>
          </div>
        `).join('')}

        ${tasks.map(t => `
          <div class="card" style="padding: 16px; border-radius: var(--radius-lg); background: var(--bg-secondary); border: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary); ${t.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.title}</div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 4px;">⏱️ ${t.estimatedMinutes || 30} mins · ${t.priority || 'Medium'} Priority</div>
            </div>
            <span class="tag tag--medium capitalize">${t.priority || 'medium'}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/* ── GOOGLE CALENDAR AGENDA VIEW ── */
function renderGoogleAgendaView() {
  const events = window.store.get('events') || [];
  const tasks = window.store.get('tasks') || [];
  const todayStr = window.store.today();

  const items = [
    ...events.map(e => ({ type: 'Event', id: e.id, date: e.date, title: e.title, detail: `${e.startTime} - ${e.endTime}`, color: e.color || '#1a73e8', raw: e })),
    ...tasks.filter(t => !t.completed).map(t => ({ type: 'Task', id: t.id, date: t.scheduledDate || t.deadline || todayStr, title: t.title, detail: `${t.estimatedMinutes || 30} mins`, color: '#6c63ff', raw: t }))
  ].sort((a, b) => a.date.localeCompare(b.date));

  return `
    <div style="padding: 24px; overflow-y: auto; max-width: 800px; margin: 0 auto; width: 100%;">
      <h2 style="font-size: var(--text-xl); font-weight: 700; margin: 0 0 16px 0;">Agenda Schedule</h2>
      
      <div style="display: flex; flex-direction: column; gap: 12px;">
        ${items.length === 0 ? '<p style="font-size: var(--text-xs); color: var(--text-tertiary);">No upcoming agenda items.</p>' : items.map(item => `
          <div class="card gcal-item-chip" data-type="${item.type.toLowerCase()}" data-id="${item.id}" style="padding: 16px; border-radius: var(--radius-lg); background: var(--bg-elevated); border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; cursor: pointer;">
            <div style="width: 12px; height: 40px; border-radius: 6px; background-color: ${item.color}; flex-shrink: 0;"></div>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: var(--text-sm); color: var(--text-primary);">${item.title}</div>
              <div style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 2px;">🗓️ ${item.date} · ${item.detail}</div>
            </div>
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 4px 8px; background: var(--bg-secondary); border-radius: 4px; color: var(--text-secondary);">${item.type}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function bindGCalInteractions() {
  document.querySelectorAll('.gcal-cell').forEach(cell => {
    cell.addEventListener('click', (e) => {
      if (e.target.closest('.gcal-item-chip') || e.target.closest('button')) return;
      const dateStr = cell.dataset.date;
      if (dateStr) openGoogleEventModal(dateStr);
    });
  });

  document.querySelectorAll('.gcal-item-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const type = chip.dataset.type;
      const id = chip.dataset.id;
      if (type === 'event' && id) {
        const events = window.store.get('events') || [];
        const existingEvent = events.find(ev => ev.id === id);
        if (existingEvent) {
          openGoogleEventModal(existingEvent.date, existingEvent);
        }
      }
    });
  });

  document.querySelectorAll('.btn-edit-event').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = e.currentTarget.dataset.id;
      const events = window.store.get('events') || [];
      const existingEvent = events.find(ev => ev.id === id);
      if (existingEvent) {
        openGoogleEventModal(existingEvent.date, existingEvent);
      }
    });
  });

  document.getElementById('btn-open-daily-note')?.addEventListener('click', async (e) => {
     const dateStr = e.currentTarget.dataset.date;
     const dailyTitle = `Daily Note: ${dateStr}`;
     let note = window.notesService.getAllNotes().find(n => n.title === dailyTitle);
     if (!note) {
        note = await window.notesService.createNote({
           title: dailyTitle,
           content: `# ${dailyTitle}\n\n## Tasks for today\n\n- [ ] \n\n## Journal\n\n`
        });
     }
     window.store.set('__pendingNoteSelection', note.id);
     window.app.navigate('notes');
  });
}

function getMonday(d) {
  d = new Date(d);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

/* ── GOOGLE CALENDAR STYLE EVENT CREATION & EDITING MODAL ── */
function openGoogleEventModal(dateStr = null, existingEvent = null) {
  const isEdit = !!existingEvent;
  const defaultDate = existingEvent ? existingEvent.date : (dateStr || window.store.today());
  const title = existingEvent ? existingEvent.title : '';
  const startTime = existingEvent ? existingEvent.startTime : '10:00';
  const endTime = existingEvent ? existingEvent.endTime : '11:00';
  const color = existingEvent ? existingEvent.color : '#1a73e8';
  const notes = existingEvent ? (existingEvent.notes || '') : '';

  window.app.showModal(`
    <div style="padding: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 11px; font-weight: 700; color: #1a73e8; text-transform: uppercase; letter-spacing: 1px;">
          ${isEdit ? '✏️ Edit Calendar Event' : '✦ New Calendar Event'}
        </span>
        ${isEdit ? `
          <button id="btn-del-modal-event" class="btn btn--danger btn--sm" style="font-weight: 600;">Delete Event</button>
        ` : ''}
      </div>

      <input type="text" id="gcal-event-title" class="input" placeholder="Add title" value="${title}" autofocus style="font-size: 1.25rem; font-weight: 700; border: none; border-bottom: 2px solid #1a73e8; background: transparent; padding: 6px 0; border-radius: 0; margin-bottom: 16px;">

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600;">Date</label>
            <input type="date" id="gcal-event-date" class="input" value="${defaultDate}" style="margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600;">Start Time</label>
            <input type="time" id="gcal-event-start" class="input" value="${startTime}" style="margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600;">End Time</label>
            <input type="time" id="gcal-event-end" class="input" value="${endTime}" style="margin-top: 4px;">
          </div>
        </div>

        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600;">Color Tag</label>
          <div style="display: flex; gap: 10px; margin-top: 6px;">
            ${[
              { color: '#1a73e8', label: 'Blueberry' },
              { color: '#6c63ff', label: 'Lavender' },
              { color: '#8e24aa', label: 'Grape' },
              { color: '#d93025', label: 'Flamingo' },
              { color: '#f57c00', label: 'Tangerine' },
              { color: '#0f9d58', label: 'Sage' }
            ].map((c) => `
              <div class="gcal-color-picker" data-color="${c.color}" style="width: 26px; height: 26px; border-radius: 50%; background-color: ${c.color}; cursor: pointer; border: 2px solid ${c.color === color ? 'var(--text-primary)' : 'transparent'};"></div>
            `).join('')}
          </div>
        </div>

        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary); font-weight: 600;">Description / Notes</label>
          <textarea id="gcal-event-notes" class="input" rows="2" placeholder="Add description..." style="margin-top: 4px;">${notes}</textarea>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="btn-save-gcal-event" style="background: #1a73e8; font-weight: 600; padding: 8px 20px;">${isEdit ? 'Save Changes' : 'Save'}</button>
      </div>
    </div>
  `);

  let selectedColor = color;

  document.querySelectorAll('.gcal-color-picker').forEach(picker => {
    picker.addEventListener('click', (e) => {
      document.querySelectorAll('.gcal-color-picker').forEach(p => p.style.borderColor = 'transparent');
      e.currentTarget.style.borderColor = 'var(--text-primary)';
      selectedColor = e.currentTarget.dataset.color;
    });
  });

  document.getElementById('btn-save-gcal-event')?.addEventListener('click', () => {
    const newTitle = document.getElementById('gcal-event-title')?.value;
    if (!newTitle || !newTitle.trim()) return window.app.showToast('Please add a title', 'error');

    const eventPayload = {
      title: newTitle.trim(),
      date: document.getElementById('gcal-event-date')?.value || defaultDate,
      startTime: document.getElementById('gcal-event-start')?.value || '10:00',
      endTime: document.getElementById('gcal-event-end')?.value || '11:00',
      color: selectedColor,
      notes: document.getElementById('gcal-event-notes')?.value || ''
    };

    if (isEdit) {
      window.store.updateEvent(existingEvent.id, eventPayload);
      window.app.showToast('Event updated', 'success');
    } else {
      window.store.addEvent(eventPayload);
      window.app.showToast('Event created in Calendar', 'success');
    }

    window.app.hideModal();
    updateGCalView();
  });

  document.getElementById('btn-del-modal-event')?.addEventListener('click', () => {
    if (existingEvent) {
      window.store.deleteEvent(existingEvent.id);
      window.app.showToast('Event deleted', 'info');
      window.app.hideModal();
      updateGCalView();
    }
  });
}
