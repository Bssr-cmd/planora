export function render() {
  return `
    <div class="view view--tasks h-full flex flex-col" style="max-width: 1200px; margin: 0 auto; padding-bottom: 30px;">
      <div class="view__header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-xl font-bold mb-2">Tasks Workspace</h1>
          <div class="flex gap-4 border-b border-border text-sm" id="tasks-tabs">
            <button class="pb-2 border-b-2 border-accent-primary font-semibold" data-tab="all">All Tasks</button>
            <button class="pb-2 border-b-2 border-transparent text-tertiary font-medium" data-tab="today">Today</button>
            <button class="pb-2 border-b-2 border-transparent text-tertiary font-medium" data-tab="upcoming">Upcoming</button>
            <button class="pb-2 border-b-2 border-transparent text-tertiary font-medium" data-tab="completed">Completed</button>
          </div>
        </div>
        <button id="tasks-new-btn" class="btn btn--primary flex items-center gap-2" style="font-weight: 600;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          + New Task
        </button>
      </div>
      
      <div class="flex items-center gap-4 mb-4 flex-wrap">
        <input type="text" id="tasks-search" placeholder="Search tasks by title or tag..." class="input input--search flex-1" style="min-width: 220px;" />
        
        <select id="tasks-sort" class="input" style="padding: 8px 12px; font-size: var(--text-xs);">
          <option value="created">Created Date</option>
          <option value="priority">Priority</option>
          <option value="energy">Energy Level</option>
          <option value="dueDate">Due Date</option>
          <option value="alpha">Alphabetical</option>
        </select>
      </div>

      <div class="view__content flex-1 overflow-y-auto">
        <div id="tasks-list" class="space-y-2"></div>
        <div id="tasks-empty" class="empty-state hidden flex flex-col items-center justify-center py-16 text-tertiary">
          <div class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          </div>
          <p class="text-sm font-medium text-primary mb-1">No tasks found</p>
          <p class="text-xs text-tertiary">Start by creating your first task above.</p>
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
        t.classList.remove('border-accent-primary', 'font-semibold');
        t.classList.add('border-transparent', 'text-tertiary', 'font-medium');
      });
      e.target.classList.remove('border-transparent', 'text-tertiary', 'font-medium');
      e.target.classList.add('border-accent-primary', 'font-semibold');
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

  if (currentTab === 'today') {
    tasks = tasks.filter(t => !t.completed && (t.scheduledDate === todayStr || t.deadline === todayStr));
  } else if (currentTab === 'upcoming') {
    tasks = tasks.filter(t => !t.completed && t.deadline && t.deadline > todayStr);
  } else if (currentTab === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }

  if (currentSearch) {
    tasks = tasks.filter(t => t.title.toLowerCase().includes(currentSearch) || (t.tags && t.tags.some(tag => tag.toLowerCase().includes(currentSearch))));
  }

  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (currentSort === 'priority') {
      const pMap = { critical: 4, high: 3, medium: 2, low: 1, none: 0 };
      return (pMap[b.priority] || 0) - (pMap[a.priority] || 0);
    }
    if (currentSort === 'energy') {
      const eMap = { high: 3, medium: 2, low: 1 };
      return (eMap[b.energyLevel] || 0) - (eMap[a.energyLevel] || 0);
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

  if (!listEl || !emptyEl) return;

  if (tasks.length === 0) {
    listEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
  } else {
    listEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
    
    listEl.innerHTML = tasks.map(t => {
      const isChecked = t.completed ? 'checked' : '';
      const pColor = getPriorityColor(t.priority);
      const project = t.projectId ? window.store.get('projects').find(p => p.id === t.projectId) : null;

      return `
        <div class="task-item card p-4 flex items-center gap-4 group cursor-pointer hover:bg-bg-tertiary/60 transition-all rounded-lg" data-id="${t.id}">
          <input type="checkbox" class="task-cb" data-id="${t.id}" ${isChecked} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-primary);">
          
          <div class="priority-dot rounded-full w-2.5 h-2.5 flex-shrink-0" style="background-color: ${pColor}"></div>
          
          <div class="flex-1 truncate">
            <div class="task-item__title text-sm font-medium ${isChecked ? 'line-through text-tertiary opacity-70' : 'text-primary'}">${t.title}</div>
            
            <div class="task-item__meta text-xs text-tertiary mt-1 flex gap-3 flex-wrap align-center">
              ${t.deadline ? `<span>🗓️ Due ${t.deadline}</span>` : ''}
              ${t.estimatedMinutes ? `<span>⏱️ ${t.estimatedMinutes}m</span>` : ''}
              ${t.energyLevel ? `<span class="capitalize">⚡ ${t.energyLevel} Energy</span>` : ''}
              ${project ? `<span style="color: var(--accent-primary); font-weight: 500;">📁 ${project.name}</span>` : ''}
              ${t.tags && t.tags.length > 0 ? `<span>🏷️ ${t.tags.join(', ')}</span>` : ''}
            </div>
          </div>

          <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <button class="btn btn--icon btn--ghost task-edit" data-id="${t.id}" title="Edit Task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="btn btn--icon btn--ghost task-delete text-accent-danger" data-id="${t.id}" title="Delete Task">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.task-cb').forEach(cb => {
      cb.addEventListener('change', (e) => {
        e.stopPropagation();
        window.store.toggleTask(cb.dataset.id);
        window.app.showToast('Task updated', 'success');
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
        const id = btn.dataset.id;
        window.app.showModal(`
          <div style="padding: 10px;">
            <h2 style="font-size: var(--text-base); font-weight: 700;">Delete Task?</h2>
            <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">Are you sure you want to remove this task?</p>
            <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px;">
              <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
              <button class="btn btn--danger" id="confirm-delete-task">Delete</button>
            </div>
          </div>
        `);
        document.getElementById('confirm-delete-task')?.addEventListener('click', () => {
          window.store.deleteTask(id);
          window.app.showToast('Task deleted', 'info');
          window.app.hideModal();
        });
      });
    });
    
    document.querySelectorAll('.task-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (!e.target.closest('button') && !e.target.closest('.task-cb')) {
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
  const t = task || { title: '', priority: 'medium', energyLevel: 'medium', estimatedMinutes: '', deadline: '', notes: '', tags: [], projectId: '' };
  const projects = window.store.getActiveProjects();
  
  const html = `
    <div style="padding: 10px;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 14px;">${isEdit ? 'Edit Task' : 'New Task'}</h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Task Title</label>
          <input type="text" id="modal-task-title" class="input w-full" value="${t.title}" placeholder="Task title..." autofocus style="margin-top: 4px;">
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Priority</label>
            <select id="modal-task-priority" class="input w-full" style="margin-top: 4px;">
              <option value="none" ${t.priority === 'none' ? 'selected' : ''}>None</option>
              <option value="low" ${t.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${t.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high" ${t.priority === 'high' ? 'selected' : ''}>High</option>
              <option value="critical" ${t.priority === 'critical' ? 'selected' : ''}>Critical</option>
            </select>
          </div>

          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Energy Requirement</label>
            <select id="modal-task-energy" class="input w-full" style="margin-top: 4px;">
              <option value="low" ${t.energyLevel === 'low' ? 'selected' : ''}>⚡ Low Energy</option>
              <option value="medium" ${t.energyLevel === 'medium' || !t.energyLevel ? 'selected' : ''}>⚡ Medium Energy</option>
              <option value="high" ${t.energyLevel === 'high' ? 'selected' : ''}>⚡ High Focus</option>
            </select>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Duration (mins)</label>
            <input type="number" id="modal-task-est" class="input w-full" value="${t.estimatedMinutes || ''}" placeholder="30" style="margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Due Date</label>
            <input type="date" id="modal-task-deadline" class="input w-full" value="${t.deadline || ''}" style="margin-top: 4px;">
          </div>
        </div>

        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Project</label>
          <select id="modal-task-project" class="input w-full" style="margin-top: 4px;">
            <option value="">None</option>
            ${projects.map(p => `<option value="${p.id}" ${p.id === t.projectId ? 'selected' : ''}>${p.name}</option>`).join('')}
          </select>
        </div>

        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Tags (comma separated)</label>
          <input type="text" id="modal-task-tags" class="input w-full" value="${t.tags ? t.tags.join(', ') : ''}" placeholder="design, frontend" style="margin-top: 4px;">
        </div>

        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Notes</label>
          <textarea id="modal-task-notes" class="input w-full" rows="3" placeholder="Add task notes..." style="margin-top: 4px;">${t.notes || ''}</textarea>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button id="modal-btn-cancel" class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button id="modal-btn-save" class="btn btn--primary">${isEdit ? 'Save Changes' : 'Create Task'}</button>
      </div>
    </div>
  `;
  
  window.app.showModal(html);
  
  document.getElementById('modal-btn-save')?.addEventListener('click', () => {
    const title = document.getElementById('modal-task-title').value.trim();
    if (!title) return window.app.showToast('Title is required', 'error');
    
    const updates = {
      title,
      priority: document.getElementById('modal-task-priority').value,
      energyLevel: document.getElementById('modal-task-energy').value,
      estimatedMinutes: parseInt(document.getElementById('modal-task-est').value) || null,
      deadline: document.getElementById('modal-task-deadline').value || null,
      projectId: document.getElementById('modal-task-project').value || null,
      tags: document.getElementById('modal-task-tags').value.split(',').map(s => s.trim()).filter(Boolean),
      notes: document.getElementById('modal-task-notes').value.trim()
    };
    
    if (isEdit) {
      window.store.updateTask(task.id, updates);
      window.app.showToast('Task updated', 'success');
    } else {
      window.store.addTask({ ...updates, scheduledDate: window.store.today() });
      window.app.showToast('Task created', 'success');
    }
    
    window.app.hideModal();
  });
}
