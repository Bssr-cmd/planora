let unsubscribe = null;
let currentView = 'grid'; // 'grid', 'board', 'notes'
let selectedProjectId = null;
let selectedNoteId = null;
let isNotePreviewMode = false;
let currentTasks = [];
let currentProjects = [];

export function render() {
  return `
    <div class="view view--projects">
      <header class="view__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div style="display: flex; align-items: center; gap: 16px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Projects Workspace</h1>
          ${selectedProjectId ? `
            <button class="btn btn--ghost btn--icon" id="btn-back-projects" aria-label="Back to Projects" title="Back to Projects Grid">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
          ` : ''}
        </div>

        <div style="display: flex; gap: 12px; align-items: center;">
          ${selectedProjectId ? `
            <div class="view-toggle" style="display: flex; background: var(--bg-secondary); border-radius: var(--radius-sm); padding: 3px; border: 1px solid var(--border);">
              <button class="btn btn--ghost btn--sm ${currentView === 'grid' ? 'is-active' : ''}" id="btn-view-grid" style="padding: 4px 12px; ${currentView === 'grid' ? 'background: var(--bg-elevated); box-shadow: var(--shadow-sm); font-weight: 600;' : ''}">Overview</button>
              <button class="btn btn--ghost btn--sm ${currentView === 'board' ? 'is-active' : ''}" id="btn-view-board" style="padding: 4px 12px; ${currentView === 'board' ? 'background: var(--bg-elevated); box-shadow: var(--shadow-sm); font-weight: 600;' : ''}">Kanban Board</button>
              <button class="btn btn--ghost btn--sm ${currentView === 'notes' ? 'is-active' : ''}" id="btn-view-notes" style="padding: 4px 12px; ${currentView === 'notes' ? 'background: var(--bg-elevated); box-shadow: var(--shadow-sm); font-weight: 600;' : ''}">📝 Notes & Wiki</button>
            </div>
            <button class="btn btn--danger btn--sm" id="btn-delete-project">Delete Project</button>
          ` : `
            <button class="btn btn--primary" id="btn-new-project">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
              + Create Project
            </button>
          `}
        </div>
      </header>

      <div class="view__content" id="projects-content">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
}

function renderContent() {
  const container = document.getElementById('projects-content');
  if (!container) return;

  if (!selectedProjectId) {
    container.innerHTML = renderProjectsGrid();
  } else if (currentView === 'grid') {
    container.innerHTML = renderProjectDetail();
  } else if (currentView === 'board') {
    container.innerHTML = renderProjectBoard();
  } else if (currentView === 'notes') {
    container.innerHTML = renderProjectNotes();
  }
}

function renderProjectsGrid() {
  if (currentProjects.length === 0) {
    return `
      <div class="card empty-state" style="padding: 48px; text-align: center;">
        <div class="empty-state__icon" style="font-size: 3rem; margin-bottom: 12px;">📁</div>
        <h3 class="empty-state__title">No Projects Yet</h3>
        <p class="empty-state__message">Turn your goals into active projects and track task progress.</p>
        <button class="btn btn--primary" id="btn-new-project-empty" style="margin-top: 16px;">+ Create Project</button>
      </div>
    `;
  }

  const cards = currentProjects.map(p => {
    const pTasks = currentTasks.filter(t => t.projectId === p.id);
    const completed = pTasks.filter(t => t.completed).length;
    const total = pTasks.length;
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    const pNotes = window.notesService.getAllNotes().filter(n => n.projectId === p.id);
    
    return `
      <div class="card card--interactive project-card" data-id="${p.id}" style="border-top: 4px solid ${p.color || 'var(--accent-primary)'}; padding: 20px; cursor: pointer; border-radius: var(--radius-lg);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: var(--text-base); font-weight: 700; color: var(--text-primary);">${p.name}</h3>
          <span class="tag" style="font-size: 10px; padding: 2px 8px; background: rgba(108, 99, 255, 0.1); color: var(--accent-primary); font-weight: 600;">${p.status || 'Active'}</span>
        </div>

        <p style="color: var(--text-secondary); font-size: var(--text-xs); margin: 0 0 16px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 36px;">
          ${p.description || 'No description added yet.'}
        </p>
        
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); margin-bottom: 6px; color: var(--text-secondary); font-weight: 600;">
            <span>Progress</span>
            <span style="color: var(--accent-primary);">${progress}%</span>
          </div>
          <div class="progress-bar" style="height: 6px; background: var(--bg-tertiary);">
            <div style="height: 100%; background: ${p.color || 'var(--accent-primary)'}; width: ${progress}%; border-radius: var(--radius-full); transition: width 0.4s ease;"></div>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--text-xs); color: var(--text-tertiary); border-top: 1px solid var(--border-light); padding-top: 10px;">
          <span>✓ ${completed}/${total} tasks</span>
          <span>📝 ${pNotes.length} notes</span>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
      ${cards}
    </div>
  `;
}

function renderProjectDetail() {
  const p = currentProjects.find(p => p.id === selectedProjectId);
  if (!p) return '';

  const pTasks = currentTasks.filter(t => t.projectId === p.id);
  const pNotes = window.notesService.getAllNotes().filter(n => n.projectId === p.id);

  return `
    <div class="project-detail" style="max-width: 960px; margin: 0 auto;">
      
      <!-- PROJECT HEADER -->
      <div style="background: var(--bg-elevated); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-light); margin-bottom: 24px; border-left: 6px solid ${p.color || 'var(--accent-primary)'};">
        <h2 style="margin: 0 0 8px 0; font-size: var(--text-2xl); font-weight: 700; color: var(--text-primary);">${p.name}</h2>
        <p style="color: var(--text-secondary); margin: 0; font-size: var(--text-sm);">${p.description || 'No description provided.'}</p>
        
        <div style="display: flex; gap: 16px; margin-top: 16px; font-size: var(--text-xs); color: var(--text-tertiary);">
          <span>Deadline: ${p.deadline || 'No deadline set'}</span>
          <span>·</span>
          <span>${pTasks.length} tasks scheduled</span>
          <span>·</span>
          <span>${pNotes.length} notes documented</span>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        
        <!-- TASKS COLUMN -->
        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="font-size: var(--text-base); font-weight: 700; margin: 0;">Tasks (${pTasks.length})</h3>
            <button class="btn btn--primary btn--sm" id="btn-add-project-task">+ Add Task</button>
          </div>

          <div class="task-list" style="display: flex; flex-direction: column; gap: 8px;">
            ${pTasks.length === 0 ? `
              <div class="empty-state" style="padding: 24px 0; text-align: center; background: var(--bg-secondary); border-radius: var(--radius-md);">
                <p class="empty-state__message" style="font-size: var(--text-xs); color: var(--text-secondary);">No tasks in this project yet.</p>
              </div>
            ` : pTasks.map(t => `
              <div class="task-item ${t.completed ? 'task-item--completed' : ''}" style="display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: var(--bg-elevated); border-radius: var(--radius-md); border: 1px solid var(--border-light);">
                <input type="checkbox" class="task-checkbox" data-id="${t.id}" ${t.completed ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-primary);">
                <div style="flex: 1; font-size: var(--text-sm); font-weight: 500; ${t.completed ? 'text-decoration: line-through; color: var(--text-tertiary);' : 'color: var(--text-primary);'}">
                  ${t.title}
                </div>
                ${t.estimatedMinutes ? `<span style="font-size: var(--text-xs); color: var(--text-tertiary);">${t.estimatedMinutes}m</span>` : ''}
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SIDEBAR: NOTES PREVIEW & MILESTONES -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- QUICK NOTES PREVIEW CARD -->
          <div class="card" style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <h3 style="font-size: var(--text-sm); font-weight: 700; margin: 0;">📝 Project Notes</h3>
              <button class="btn btn--ghost btn--sm" id="btn-open-notes-tab" style="font-size: 11px; color: var(--accent-primary);">Open Notes →</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${pNotes.length === 0 ? `
                <div style="font-size: var(--text-xs); color: var(--text-tertiary);">No notes documented yet.</div>
              ` : pNotes.slice(0, 3).map(n => `
                <div class="project-note-preview-item" data-note-id="${n.id}" style="padding: 8px 10px; background: var(--bg-secondary); border-radius: var(--radius-sm); cursor: pointer;">
                  <div style="font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); flex: 1;">${n.title}</div>
                  <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 2px;">Updated ${new Date(n.updatedAt).toLocaleDateString()}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- MILESTONES CARD -->
          <div class="card" style="padding: 16px;">
            <h3 style="font-size: var(--text-sm); font-weight: 700; margin: 0 0 12px 0;">Milestones</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(p.milestones || []).map(m => `
                <div style="display: flex; align-items: center; gap: 8px; font-size: var(--text-xs);">
                  <input type="checkbox" ${m.completed ? 'checked' : ''} disabled>
                  <span style="text-decoration: ${m.completed ? 'line-through' : 'none'}; color: var(--text-secondary);">${m.name}</span>
                </div>
              `).join('')}
              ${(!p.milestones || p.milestones.length === 0) ? '<span style="font-size: var(--text-xs); color: var(--text-tertiary);">No milestones defined yet.</span>' : ''}
            </div>
          </div>

        </div>

      </div>
    </div>
  `;
}

function renderProjectBoard() {
  const p = currentProjects.find(p => p.id === selectedProjectId);
  if (!p) return '';

  const pTasks = currentTasks.filter(t => t.projectId === p.id);
  const columns = [
    { id: 'backlog', title: 'Backlog' },
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'review', title: 'Review' },
    { id: 'done', title: 'Done' }
  ];

  const getTaskCol = (t) => {
    if (t.completed) return 'done';
    if (t.boardStatus) return t.boardStatus;
    return 'todo';
  };

  return `
    <div class="kanban" style="display: flex; gap: 16px; overflow-x: auto; padding-bottom: 16px; min-height: calc(100vh - 200px);">
      ${columns.map(col => {
        const colTasks = pTasks.filter(t => getTaskCol(t) === col.id);
        return `
          <div class="kanban__column" data-status="${col.id}" style="flex: 0 0 260px; background: var(--bg-secondary); border-radius: var(--radius-lg); padding: 14px; display: flex; flex-direction: column;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-weight: 700; font-size: var(--text-sm);">
              <span>${col.title} <span class="badge" style="background: var(--bg-tertiary); color: var(--text-secondary); margin-left: 6px;">${colTasks.length}</span></span>
              <button class="btn btn--icon btn--ghost btn--sm btn-add-kanban-task" data-status="${col.id}" style="width: 24px; height: 24px; padding: 0;">+</button>
            </div>
            
            <div class="kanban__dropzone" data-status="${col.id}" style="flex: 1; display: flex; flex-direction: column; gap: 8px; min-height: 100px;">
              ${colTasks.map(t => `
                <div class="kanban__card card" draggable="true" data-id="${t.id}" style="padding: 12px; cursor: grab; background: var(--bg-elevated); border-radius: var(--radius-md);">
                  <div style="font-size: var(--text-sm); font-weight: 500; margin-bottom: 6px;">${t.title}</div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: var(--text-xs); color: var(--text-tertiary);">
                    ${t.priority && t.priority !== 'none' ? `<span style="font-weight: 600; text-transform: capitalize; color: var(--accent-${t.priority === 'critical' || t.priority === 'high' ? 'danger' : 'warning'});">${t.priority}</span>` : '<span></span>'}
                    ${t.estimatedMinutes ? `<span>${t.estimatedMinutes}m</span>` : ''}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ── ADVANCED PROJECT NOTES & WIKI WORKSPACE ─────────────────── */
function renderProjectNotes() {
  const store = window.store;
  const p = currentProjects.find(p => p.id === selectedProjectId);
  if (!p) return '';

  const notes = window.notesService.getAllNotes().filter(n => n.projectId === selectedProjectId);
  if (!selectedNoteId && notes.length > 0) {
    selectedNoteId = notes[0].id;
  }

  const activeNote = notes.find(n => n.id === selectedNoteId) || {
    id: null,
    title: '',
    content: ''
  };

  return `
    <div class="project-notes-workspace" style="display: grid; grid-template-columns: 260px 1fr; gap: 20px; min-height: calc(100vh - 200px);">
      
      <!-- NOTES SIDEBAR NAV -->
      <div style="background: var(--bg-secondary); border-radius: var(--radius-lg); padding: 16px; border: 1px solid var(--border-light); display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <span style="font-size: var(--text-xs); font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Documents</span>
          <button class="btn btn--primary btn--sm" id="btn-create-note" style="font-size: 11px; padding: 4px 10px;">+ New Note</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 6px; overflow-y: auto; flex: 1;">
          ${notes.length === 0 ? `
            <div style="font-size: var(--text-xs); color: var(--text-tertiary); text-align: center; padding: 20px 0;">No notes yet. Click + New Note above.</div>
          ` : notes.map(n => `
            <div class="note-list-item ${n.id === selectedNoteId ? 'note-list-item--active' : ''}" data-id="${n.id}" style="padding: 10px 12px; border-radius: var(--radius-md); background: ${n.id === selectedNoteId ? 'var(--bg-elevated)' : 'transparent'}; cursor: pointer; display: flex; justify-content: space-between; align-items: center; border: 1px solid ${n.id === selectedNoteId ? 'var(--border)' : 'transparent'};">
              <div style="min-width: 0; flex: 1;">
                <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${n.pinned ? '📌 ' : ''}${n.title}
                </div>
                <div style="font-size: 10px; color: var(--text-tertiary); margin-top: 2px;">
                  ${new Date(n.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MAIN NOTE EDITOR / PREVIEW AREA -->
      <div style="background: var(--bg-elevated); border-radius: var(--radius-lg); padding: 24px; border: 1px solid var(--border-light); display: flex; flex-direction: column;">
        ${!activeNote.id ? `
          <div class="empty-state" style="margin: auto; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">📝</div>
            <h3 style="font-size: var(--text-base); font-weight: 700;">No Document Selected</h3>
            <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">Create or select a note from the left sidebar to start documenting.</p>
            <button class="btn btn--primary btn--sm" id="btn-create-first-note" style="margin-top: 14px;">+ Create Note</button>
          </div>
        ` : `
          <!-- EDITOR HEADER TOOLBAR -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 10px; border-bottom: 1px solid var(--border-light); padding-bottom: 14px;">
            
            <input type="text" id="note-title-input" class="input" value="${activeNote.title}" placeholder="Note Title..." style="font-size: var(--text-xl); font-weight: 700; border: none; background: transparent; padding: 0; flex: 1; min-width: 200px; color: var(--text-primary);">

            <div style="display: flex; align-items: center; gap: 8px;">
              <!-- FORMATTING QUICK TOOLBAR -->
              <div style="display: flex; background: var(--bg-secondary); border-radius: var(--radius-sm); padding: 2px;">
                <button class="btn btn--ghost btn--sm btn-fmt" data-fmt="bold" style="padding: 2px 8px; font-weight: 700;" title="Bold">B</button>
                <button class="btn btn--ghost btn--sm btn-fmt" data-fmt="italic" style="padding: 2px 8px; font-style: italic;" title="Italic">I</button>
                <button class="btn btn--ghost btn--sm btn-fmt" data-fmt="h2" style="padding: 2px 8px; font-weight: 700;" title="Heading">H2</button>
                <button class="btn btn--ghost btn--sm btn-fmt" data-fmt="list" style="padding: 2px 8px;" title="Bullet List">• List</button>
                <button class="btn btn--ghost btn--sm btn-fmt" data-fmt="callout" style="padding: 2px 8px;" title="Callout">> Note</button>
              </div>

              <!-- PREVIEW TOGGLE -->
              <button class="btn btn--secondary btn--sm" id="btn-toggle-note-preview" style="font-size: var(--text-xs);">
                ${isNotePreviewMode ? '✏️ Edit Mode' : '👁️ Rendered Preview'}
              </button>

              <button class="btn btn--danger btn--icon btn--sm" id="btn-delete-note" title="Delete Note">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>

          <!-- EDITOR CONTENT OR RENDERED PREVIEW -->
          <div style="flex: 1; display: flex; flex-direction: column;">
            ${isNotePreviewMode ? `
              <div class="note-rendered-markdown" style="flex: 1; font-size: var(--text-sm); line-height: 1.7; color: var(--text-primary); overflow-y: auto; padding: 10px 0;">
                ${renderSimpleMarkdown(activeNote.content)}
              </div>
            ` : `
              <textarea id="note-content-textarea" class="input" placeholder="Start typing rich notes or markdown specs..." style="flex: 1; width: 100%; height: 100%; border: none; background: transparent; resize: none; font-family: monospace; font-size: 14px; line-height: 1.6; color: var(--text-primary); padding: 0;" autofocus>${activeNote.content}</textarea>
            `}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderSimpleMarkdown(content) {
  if (!content) return '<p style="color: var(--text-tertiary);">Empty note.</p>';
  let html = content
    .replace(/^# (.*$)/gim, '<h1 style="font-size: var(--text-xl); font-weight: 700; margin: 16px 0 8px 0;">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 style="font-size: var(--text-lg); font-weight: 700; margin: 14px 0 6px 0;">$1</h2>')
    .replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid var(--accent-primary); padding-left: 12px; margin: 12px 0; color: var(--text-secondary); background: var(--bg-secondary); padding: 8px 12px; border-radius: var(--radius-sm);">$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/`- \[x\] (.*$)/gim, '<div style="display:flex; gap:6px; margin:4px 0;"><span style="color:var(--accent-success);">✓</span> <span style="text-decoration:line-through;">$1</span></div>')
    .replace(/`- \[ \] (.*$)/gim, '<div style="display:flex; gap:6px; margin:4px 0;"><span>○</span> <span>$1</span></div>')
    .replace(/^- (.*$)/gim, '<li style="margin-left: 18px;">$1</li>');

  return html;
}

export function mount() {
  currentTasks = window.store.get('tasks') || [];
  currentProjects = window.store.get('projects') || [];
  
  unsubscribe = window.store.subscribe('tasks', (newTasks) => {
    currentTasks = newTasks;
    renderContent();
    bindEvents();
  });
  
  const unsubProjects = window.store.subscribe('projects', (newProjects) => {
    currentProjects = newProjects;
    renderContent();
    bindEvents();
  });

  renderContent();
  bindEvents();

  const oldUnsub = unsubscribe;
  unsubscribe = () => {
    if (oldUnsub) oldUnsub();
    if (unsubProjects) unsubProjects();
  };
}

function bindEvents() {
  const root = document.querySelector('.view--projects');
  if (!root) return;

  // View toggles
  document.getElementById('btn-view-grid')?.addEventListener('click', () => { currentView = 'grid'; renderContent(); bindEvents(); });
  document.getElementById('btn-view-board')?.addEventListener('click', () => { currentView = 'board'; renderContent(); bindEvents(); });
  document.getElementById('btn-view-notes')?.addEventListener('click', () => { currentView = 'notes'; renderContent(); bindEvents(); });
  
  document.getElementById('btn-back-projects')?.addEventListener('click', () => {
    selectedProjectId = null;
    selectedNoteId = null;
    currentView = 'grid';
    renderContent();
    bindEvents();
  });

  document.getElementById('btn-open-notes-tab')?.addEventListener('click', () => {
    currentView = 'notes';
    renderContent();
    bindEvents();
  });

  // Project card selection
  root.querySelectorAll('.project-card').forEach(card => {
    card.onclick = (e) => {
      selectedProjectId = e.currentTarget.dataset.id;
      currentView = 'grid';
      renderContent();
      bindEvents();
    };
  });

  // Project Note Preview Items
  root.querySelectorAll('.project-note-preview-item').forEach(item => {
    item.onclick = (e) => {
      selectedNoteId = e.currentTarget.dataset.noteId;
      currentView = 'notes';
      renderContent();
      bindEvents();
    };
  });

  // Note list item select
  root.querySelectorAll('.note-list-item').forEach(item => {
    item.onclick = (e) => {
      selectedNoteId = e.currentTarget.dataset.id;
      renderContent();
      bindEvents();
    };
  });

  // Create Note
  const createNoteBtn = document.getElementById('btn-create-note') || document.getElementById('btn-create-first-note');
  if (createNoteBtn) {
    createNoteBtn.onclick = async () => {
      const newNote = await window.notesService.createNote({
        projectId: selectedProjectId,
        title: 'New Document Note',
        content: '# New Note Title\n\nStart typing specification details...'
      });
      selectedNoteId = newNote.id;
      renderContent();
      bindEvents();
    };
  }

  // Delete Note
  document.getElementById('btn-delete-note')?.addEventListener('click', async () => {
    if (selectedNoteId) {
      await window.notesService.deleteNote(selectedNoteId);
      selectedNoteId = null;
      window.app.showToast('Note deleted', 'info');
      renderContent();
      bindEvents();
    }
  });

  // Note Title / Content Auto Save
  const titleInput = document.getElementById('note-title-input');
  if (titleInput) {
    titleInput.oninput = (e) => {
      if (selectedNoteId) {
        window.notesService.saveNote(selectedNoteId, { title: e.target.value });
      }
    };
  }

  const contentTextarea = document.getElementById('note-content-textarea');
  if (contentTextarea) {
    contentTextarea.oninput = (e) => {
      if (selectedNoteId) {
        window.notesService.saveNote(selectedNoteId, { content: e.target.value });
      }
    };
  }

  // Toggle Markdown Preview Mode
  document.getElementById('btn-toggle-note-preview')?.addEventListener('click', () => {
    isNotePreviewMode = !isNotePreviewMode;
    renderContent();
    bindEvents();
  });

  // Quick Formatting Toolbar
  root.querySelectorAll('.btn-fmt').forEach(btn => {
    btn.onclick = (e) => {
      const fmt = e.currentTarget.dataset.fmt;
      const ta = document.getElementById('note-content-textarea');
      if (!ta || !selectedNoteId) return;

      let prefix = '';
      if (fmt === 'bold') prefix = '**Bold Text**';
      if (fmt === 'italic') prefix = '*Italic Text*';
      if (fmt === 'h2') prefix = '\n## Heading 2\n';
      if (fmt === 'list') prefix = '\n- Item 1\n- Item 2\n';
      if (fmt === 'callout') prefix = '\n> Note: Highlight text\n';

      ta.value += prefix;
      window.notesService.saveNote(selectedNoteId, { content: ta.value });
      renderContent();
      bindEvents();
    };
  });

  // New project modal
  const newProjBtn = document.getElementById('btn-new-project') || document.getElementById('btn-new-project-empty');
  if (newProjBtn) {
    newProjBtn.onclick = () => showCreateProjectModal();
  }

  // Delete project
  document.getElementById('btn-delete-project')?.addEventListener('click', () => {
    if (selectedProjectId) {
      window.store.deleteProject(selectedProjectId);
      selectedProjectId = null;
      window.app.showToast('Project deleted', 'info');
      renderContent();
      bindEvents();
    }
  });

  // Task check toggle inside project
  root.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.onchange = (e) => {
      window.store.toggleTask(e.target.dataset.id);
      renderContent();
      bindEvents();
    };
  });

  // Add project task
  document.getElementById('btn-add-project-task')?.addEventListener('click', () => {
    window.app.navigate('tasks');
  });
}

function showCreateProjectModal() {
  const store = window.store;

  window.app.showModal(`
    <div style="padding: 10px;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 16px;">Create Project</h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <input type="text" id="new-proj-name" class="input" placeholder="Project Name..." autofocus>
        <textarea id="new-proj-desc" class="input" placeholder="Project Description..." rows="3"></textarea>
        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Accent Color</label>
          <input type="color" id="new-proj-color" value="#6C63FF" style="width: 100%; height: 38px; border-radius: var(--radius-sm); border: 1px solid var(--border); cursor: pointer; margin-top: 4px;">
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="btn-save-new-project">Create Project</button>
      </div>
    </div>
  `);

  document.getElementById('btn-save-new-project')?.addEventListener('click', () => {
    const name = document.getElementById('new-proj-name')?.value;
    if (!name || !name.trim()) return;

    store.addProject({
      name: name.trim(),
      description: document.getElementById('new-proj-desc')?.value || '',
      color: document.getElementById('new-proj-color')?.value || '#6C63FF'
    });

    window.app.showToast('Project created!', 'success');
    window.app.hideModal();
    renderContent();
    bindEvents();
  });
}

export function unmount() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
}
