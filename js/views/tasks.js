export function render() {
  return `
    <div class="view view--tasks h-full flex flex-col">
      <div class="view__header flex justify-between items-center mb-6">
        <div>
          <h1 class="text-xl font-bold mb-2">Tasks</h1>
          <div class="flex gap-4 border-b border-border text-sm" id="tasks-tabs">
            <button class="pb-2 border-b-2 border-accent-primary font-medium" data-tab="all">All</button>
            <button class="pb-2 border-b-2 border-transparent text-tertiary" data-tab="today">Today</button>
            <button class="pb-2 border-b-2 border-transparent text-tertiary" data-tab="upcoming">Upcoming</button>
            <button class="pb-2 border-b-2 border-transparent text-tertiary" data-tab="completed">Completed</button>
          </div>
        </div>
        <button id="tasks-new-btn" class="btn btn--primary flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          New Task
        </button>
      </div>
      
      <div class="flex items-center gap-4 mb-4">
        <input type="text" id="tasks-search" placeholder="Search tasks..." class="input input--search flex-1" />
        <select id="tasks-sort" class="input">
          <option value="created">Created Date</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      <div class="view__content flex-1 overflow-y-auto">
        <div id="tasks-list" class="space-y-2"></div>
        <div id="tasks-empty" class="empty-state hidden flex flex-col items-center justify-center py-12 text-tertiary">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <p>No tasks found. Start by adding your first task.</p>
        </div>
      </div>
    </div>
  `;
}

let unsubTasks = null;
let currentTab = 'all';
let currentSearch = '';
let currentSort = 'created';

export function mount() {
  unsubTasks = window.store.subscribe('tasks', renderTasks);
  
  document.getElementById('tasks-new-btn')?.addEventListener('click', () => openTaskModal());
  document.getElementById('tasks-search')?.addEventListener('input', (e) => {
    currentSearch = e.target.value.toLowerCase();
    renderTasks();
  });
  document.getElementById('tasks-sort')?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderTasks();
  });

  const tabs = document.querySelectorAll('#tasks-tabs button');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => {
        t.classList.remove('border-accent-primary', 'font-medium');
        t.classList.add('border-transparent', 'text-tertiary');
      });
      e.target.classList.remove('border-transparent', 'text-tertiary');
      e.target.classList.add('border-accent-primary', 'font-medium');
      currentTab = e.target.dataset.tab;
      renderTasks();
    });
  });

  renderTasks();
}

export function unmount() {
  if (unsubTasks) unsubTasks();
}

function renderTasks() {
  let tasks = window.store.get('tasks') || [];
  const todayStr = window.store.today();

  // Filter by Tab
  if (currentTab === 'today') {
    tasks = tasks.filter(t => !t.completed && (t.scheduledDate === todayStr || t.deadline === todayStr));
  } else if (currentTab === 'upcoming') {
    tasks = tasks.filter(t => !t.completed && t.deadline && t.deadline > todayStr);
  } else if (currentTab === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }

  // Search
  if (currentSearch) {
    tasks = tasks.filter(t => t.title.toLowerCase().includes(currentSearch));
  }

  // Sort
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (currentSort === 'priority') {
      const pMap = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    if (currentSort === 'dueDate') {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    }
    if (currentSort === 'alpha') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const listEl = document.getElementById('tasks-list');
  const emptyEl = document.getElementById('tasks-empty');

  if (tasks.length === 0) {
    listEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
  } else {
    listEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
    
    listEl.innerHTML = tasks.map(t => {
      const isChecked = t.completed ? 'checked' : '';
      const pColor = getPriorityColor(t.priority);
      return \`
        <div class="task-item card p-4 flex items-center gap-4 group cursor-pointer hover:bg-bg-tertiary transition-colors" data-id="\${t.id}">
          <div class="checkbox task-cb \${isChecked ? 'checkbox--checked' : ''}" data-id="\${t.id}">
            \${isChecked ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="20 6 9 17 4 12"></polyline></svg>' : ''}
          </div>
          <div class="priority-dot rounded-full w-2 h-2 flex-shrink-0" style="background-color: \${pColor}"></div>
          <div class="flex-1 truncate">
            <div class="task-item__title text-base \${isChecked ? 'line-through text-tertiary' : 'text-primary'}">\${t.title}</div>
            <div class="task-item__meta text-xs text-tertiary mt-1 flex gap-3">
              \${t.deadline ? \`<span class="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>\${t.deadline}</span>\` : ''}
              \${t.estimatedMinutes ? \`<span class="flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>\${t.estimatedMinutes}m</span>\` : ''}
              \${t.tags && t.tags.length > 0 ? \`<span>🏷️ \${t.tags.join(', ')}</span>\` : ''}
            </div>
          </div>
          <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button class="btn btn--icon btn--ghost task-edit" data-id="\${t.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn--icon btn--ghost task-delete text-accent-danger" data-id="\${t.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      \`;
    }).join('');

    // Attach events
    document.querySelectorAll('.task-cb').forEach(cb => {
      cb.addEventListener('click', (e) => {
        e.stopPropagation();
        window.store.toggleTask(cb.dataset.id);
      });
    });

    document.querySelectorAll('.task-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const task = window.store.get('tasks').find(t => t.id === btn.dataset.id);
        openTaskModal(task);
      });
    });

    document.querySelectorAll('.task-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if(confirm('Delete this task?')) {
          window.store.deleteTask(btn.dataset.id);
          window.app.showToast('Task deleted', 'info');
        }
      });
    });
    
    document.querySelectorAll('.task-item').forEach(item => {
      item.addEventListener('click', (e) => {
        // Prevent opening if clicking on buttons/checkbox
        if (!e.target.closest('button') && !e.target.closest('.checkbox')) {
          const task = window.store.get('tasks').find(t => t.id === item.dataset.id);
          openTaskModal(task);
        }
      });
    });
  }
}

function getPriorityColor(priority) {
  const map = {
    critical: 'var(--accent-danger)',
    high: 'var(--accent-warning)',
    medium: 'var(--accent-primary)',
    low: 'var(--accent-success)',
    none: 'var(--text-tertiary)'
  };
  return map[priority] || map.none;
}

function openTaskModal(task = null) {
  const isEdit = !!task;
  const t = task || { title: '', priority: 'none', estimatedMinutes: '', deadline: '', notes: '', tags: [] };
  
  const html = \`
    <div class="modal__header mb-4">
      <h2 class="text-xl font-bold">\${isEdit ? 'Edit Task' : 'New Task'}</h2>
    </div>
    <div class="modal__body space-y-4">
      <div>
        <label class="block text-sm text-tertiary mb-1">Title</label>
        <input type="text" id="modal-task-title" class="input w-full" value="\${t.title}" placeholder="Task title...">
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm text-tertiary mb-1">Priority</label>
          <select id="modal-task-priority" class="input w-full">
            <option value="none" \${t.priority === 'none' ? 'selected' : ''}>None</option>
            <option value="low" \${t.priority === 'low' ? 'selected' : ''}>Low</option>
            <option value="medium" \${t.priority === 'medium' ? 'selected' : ''}>Medium</option>
            <option value="high" \${t.priority === 'high' ? 'selected' : ''}>High</option>
            <option value="critical" \${t.priority === 'critical' ? 'selected' : ''}>Critical</option>
          </select>
        </div>
        <div>
          <label class="block text-sm text-tertiary mb-1">Estimated Minutes</label>
          <input type="number" id="modal-task-est" class="input w-full" value="\${t.estimatedMinutes || ''}" placeholder="e.g. 30">
        </div>
      </div>
      <div>
        <label class="block text-sm text-tertiary mb-1">Deadline</label>
        <input type="date" id="modal-task-deadline" class="input w-full" value="\${t.deadline || ''}">
      </div>
      <div>
        <label class="block text-sm text-tertiary mb-1">Tags (comma separated)</label>
        <input type="text" id="modal-task-tags" class="input w-full" value="\${t.tags ? t.tags.join(', ') : ''}" placeholder="work, urgent">
      </div>
      <div>
        <label class="block text-sm text-tertiary mb-1">Notes</label>
        <textarea id="modal-task-notes" class="textarea w-full" rows="3" placeholder="Add some notes...">\${t.notes || ''}</textarea>
      </div>
    </div>
    <div class="modal__footer mt-6 flex justify-end gap-3">
      <button id="modal-btn-cancel" class="btn btn--ghost">Cancel</button>
      <button id="modal-btn-save" class="btn btn--primary">Save</button>
    </div>
  \`;
  
  window.app.showModal(html);
  
  document.getElementById('modal-btn-cancel').addEventListener('click', () => {
    window.app.hideModal();
  });
  
  document.getElementById('modal-btn-save').addEventListener('click', () => {
    const title = document.getElementById('modal-task-title').value.trim();
    if (!title) return window.app.showToast('Title is required', 'error');
    
    const updates = {
      title,
      priority: document.getElementById('modal-task-priority').value,
      estimatedMinutes: parseInt(document.getElementById('modal-task-est').value) || null,
      deadline: document.getElementById('modal-task-deadline').value || null,
      tags: document.getElementById('modal-task-tags').value.split(',').map(s => s.trim()).filter(Boolean),
      notes: document.getElementById('modal-task-notes').value.trim()
    };
    
    if (isEdit) {
      window.store.updateTask(task.id, updates);
      window.app.showToast('Task updated', 'success');
    } else {
      window.store.addTask(updates);
      window.app.showToast('Task created', 'success');
    }
    
    window.app.hideModal();
  });
}
