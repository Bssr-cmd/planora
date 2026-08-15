let notifications = [];

export function init() {
  generateNotifications();
  
  // Create UI container if it doesn't exist
  if (!document.getElementById('notification-panel')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div id="notification-panel" class="fixed top-16 right-4 w-80 bg-bg-elevated border border-surface-glass-border shadow-xl rounded-xl z-40 hidden flex-col max-h-[80vh]">
        <div class="px-4 py-3 border-b border-border flex justify-between items-center">
          <h3 class="font-semibold">Notifications</h3>
          <button id="noti-clear-all" class="text-xs text-tertiary hover:text-primary">Clear all</button>
        </div>
        <div id="notification-list" class="overflow-y-auto flex-1"></div>
      </div>
    `);
    
    document.getElementById('noti-clear-all').addEventListener('click', () => {
      notifications = [];
      renderPanel();
      updateBadge();
    });
    
    // Clicking outside closes it
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('notification-panel');
      const bell = document.getElementById('header-bell'); // assuming there's a bell with this id
      if (panel && !panel.classList.contains('hidden')) {
        if (!panel.contains(e.target) && (!bell || !bell.contains(e.target))) {
          panel.classList.add('hidden');
        }
      }
    });
  }
}

export function togglePanel() {
  const panel = document.getElementById('notification-panel');
  if (panel) {
    if (panel.classList.contains('hidden')) {
      renderPanel();
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }
}

export function getNotifications() {
  return notifications;
}

export function markRead(id) {
  notifications = notifications.filter(n => n.id !== id);
  renderPanel();
  updateBadge();
}

function generateNotifications() {
  notifications = [];
  const tasks = window.store.get('tasks') || [];
  const todayStr = window.store.today();
  
  let overdueCount = 0;
  let upcomingCount = 0;
  
  tasks.forEach(t => {
    if (!t.completed && t.deadline) {
      if (t.deadline < todayStr) {
        overdueCount++;
        notifications.push({
          id: 'overdue-' + t.id,
          type: 'warning',
          message: \`Task "\${t.title}" is overdue (was due \${t.deadline})\`,
          time: 'Overdue'
        });
      } else if (t.deadline === window.store.today()) {
        upcomingCount++;
      }
    }
  });
  
  if (upcomingCount > 0) {
    notifications.push({
      id: 'upcoming-today',
      type: 'info',
      message: \`You have \${upcomingCount} task\${upcomingCount > 1 ? 's' : ''} due today.\`,
      time: 'Today'
    });
  }
  
  // Weekly planning prompt (Monday check)
  const d = new Date();
  if (d.getDay() === 1) {
    notifications.push({
      id: 'plan-week',
      type: 'primary',
      message: 'Start planning your week!',
      time: 'Just now'
    });
  }
  
  updateBadge();
}

function renderPanel() {
  const listEl = document.getElementById('notification-list');
  if (!listEl) return;
  
  if (notifications.length === 0) {
    listEl.innerHTML = '<div class="p-6 text-center text-tertiary text-sm">No new notifications</div>';
    return;
  }
  
  listEl.innerHTML = notifications.map(n => \`
    <div class="p-4 border-b border-border hover:bg-bg-tertiary transition-colors flex items-start gap-3">
      <div class="mt-1">\${getIcon(n.type)}</div>
      <div class="flex-1">
        <p class="text-sm text-primary leading-tight">\${n.message}</p>
        <p class="text-xs text-tertiary mt-1">\${n.time}</p>
      </div>
      <button class="text-tertiary hover:text-primary noti-dismiss" data-id="\${n.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  \`).join('');
  
  document.querySelectorAll('.noti-dismiss').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      markRead(btn.dataset.id);
    });
  });
}

function updateBadge() {
  // Try to find a badge element in the app shell
  const badge = document.getElementById('notification-badge');
  if (badge) {
    if (notifications.length > 0) {
      badge.textContent = notifications.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
}

function getIcon(type) {
  const c = type === 'warning' ? 'text-accent-warning' : type === 'primary' ? 'text-accent-primary' : 'text-accent-success';
  return \`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="\${c}"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>\`;
}
