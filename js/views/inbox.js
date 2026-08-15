export function render() {
  return `
    <div class="view view--inbox h-full flex flex-col max-w-3xl mx-auto w-full" style="padding-bottom: 30px;">
      <div class="view__header flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 class="text-2xl font-bold">Inbox</h1>
          <p class="text-tertiary text-sm mt-1">Capture thoughts instantly. Organize and process them into your system when ready.</p>
        </div>
        
        <div class="flex items-center gap-3">
          <button id="btn-process-inbox" class="btn btn--secondary btn--sm" style="background: rgba(108, 99, 255, 0.1); color: var(--accent-primary); font-weight: 600;">
            ⚡ Process Inbox
          </button>
          <div id="inbox-count" class="bg-bg-tertiary px-3 py-1 rounded-full text-xs font-semibold text-secondary">0 items</div>
        </div>
      </div>
      
      <div class="mb-6 relative">
        <input type="text" id="inbox-input" class="input w-full text-base py-3 pl-4 pr-12 shadow-sm rounded-xl border-border focus:border-accent-primary" placeholder="Dump a thought, task, or idea..." autocomplete="off">
        <button id="inbox-submit" class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-accent-primary hover:bg-bg-tertiary rounded-full transition-colors" title="Capture">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>

      <div class="view__content flex-1 overflow-y-auto">
        <div id="inbox-list" class="space-y-3"></div>
        <div id="inbox-empty" class="empty-state hidden flex flex-col items-center justify-center py-16 text-tertiary">
          <div class="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3 class="text-base font-semibold text-primary mb-1">Your inbox is clear! 🎉</h3>
          <p class="text-xs">You have processed all captured thoughts.</p>
        </div>
      </div>
    </div>
  `;
}

let unsubInbox = null;

export function mount() {
  unsubInbox = window.store.subscribe('inbox', renderInbox);
  
  const input = document.getElementById('inbox-input');
  if (input) {
    input.focus();
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && input.value.trim()) {
        addInboxItem();
      }
    });
  }
  
  document.getElementById('inbox-submit')?.addEventListener('click', addInboxItem);
  document.getElementById('btn-process-inbox')?.addEventListener('click', showProcessInboxWizard);
  
  renderInbox();
}

export function unmount() {
  if (unsubInbox) unsubInbox();
}

function addInboxItem() {
  const input = document.getElementById('inbox-input');
  const text = input.value.trim();
  if (!text) return;
  
  window.store.addInboxItem({ text });
  input.value = '';
  window.app.showToast('Captured in Inbox', 'success');
}

function renderInbox() {
  const allItems = window.store.get('inbox') || [];
  const items = allItems.filter(i => !i.converted);
  
  const countEl = document.getElementById('inbox-count');
  if (countEl) countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
  
  const listEl = document.getElementById('inbox-list');
  const emptyEl = document.getElementById('inbox-empty');
  
  if (!listEl || !emptyEl) return;

  if (items.length === 0) {
    listEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
  } else {
    listEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
    
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    listEl.innerHTML = items.map(item => {
      const timeAgo = getRelativeTime(item.createdAt);
      return `
        <div class="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow group rounded-lg">
          <div class="flex-1">
            <p class="text-sm font-medium text-primary leading-relaxed break-words">${item.text}</p>
            <p class="text-xs text-tertiary mt-1">${timeAgo}</p>
          </div>
          <div class="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="btn btn--secondary btn--sm inbox-convert-task" data-id="${item.id}">To Task</button>
            <button class="btn btn--ghost btn--sm inbox-convert-note" data-id="${item.id}">To Note</button>
            <button class="btn btn--icon btn--ghost text-accent-danger inbox-delete" data-id="${item.id}" title="Delete">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    document.querySelectorAll('.inbox-convert-task').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = items.find(i => i.id === id);
        if (item) {
          window.store.addTask({ title: item.text, scheduledDate: window.store.today() });
          window.store.convertInboxItem(id, 'task');
          window.app.showToast('Converted to Task!', 'success');
        }
      });
    });

    document.querySelectorAll('.inbox-convert-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = items.find(i => i.id === id);
        if (item) {
          const projects = window.store.getActiveProjects();
          const targetProj = projects[0] ? projects[0].id : null;
          if (targetProj && window.store.addProjectNote) {
            window.store.addProjectNote({ projectId: targetProj, title: item.text.slice(0, 30), content: item.text });
            window.store.convertInboxItem(id, 'note');
            window.app.showToast('Converted to Project Note!', 'success');
          } else {
            window.app.showToast('Create a project first to attach notes', 'warning');
          }
        }
      });
    });
    
    document.querySelectorAll('.inbox-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        window.store.deleteInboxItem(id);
        window.app.showToast('Item deleted', 'info');
      });
    });
  }
}

/* ── PROCESS INBOX WIZARD ─────────────────── */
function showProcessInboxWizard() {
  const allItems = window.store.get('inbox') || [];
  const items = allItems.filter(i => !i.converted);

  if (items.length === 0) {
    window.app.showModal(`
      <div style="padding: 20px; text-align: center;">
        <div style="font-size: 2.5rem; margin-bottom: 8px;">🎉</div>
        <h2 style="font-size: var(--text-base); font-weight: 700;">Your Inbox is Clean!</h2>
        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">No unprocessed items remaining.</p>
        <button class="btn btn--primary" style="margin-top: 14px;" onclick="window.app.hideModal()">Awesome</button>
      </div>
    `);
    return;
  }

  let index = 0;

  const renderCurrentItem = () => {
    const item = items[index];
    if (!item) {
      window.app.showToast('All inbox items processed!', 'success');
      window.app.hideModal();
      return;
    }

    window.app.showModal(`
      <div style="padding: 14px;">
        <div style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase;">
          ⚡ PROCESS INBOX (${index + 1} of ${items.length})
        </div>

        <div style="background: var(--bg-secondary); padding: 18px; border-radius: var(--radius-md); margin-top: 12px; border-left: 4px solid var(--accent-primary);">
          <p style="font-size: var(--text-base); font-weight: 600; color: var(--text-primary); margin: 0; line-height: 1.5;">"${item.text}"</p>
        </div>

        <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 14px; font-weight: 500;">
          What would you like to do with this item?
        </p>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px;">
          <button class="btn btn--primary" id="wiz-btn-task">Convert to Task</button>
          <button class="btn btn--secondary" id="wiz-btn-note">Convert to Note</button>
          <button class="btn btn--ghost" id="wiz-btn-skip">Skip for Later</button>
          <button class="btn btn--danger" id="wiz-btn-delete">Delete Item</button>
        </div>
      </div>
    `);

    document.getElementById('wiz-btn-task')?.addEventListener('click', () => {
      window.store.addTask({ title: item.text, scheduledDate: window.store.today() });
      window.store.convertInboxItem(item.id, 'task');
      index++;
      renderCurrentItem();
    });

    document.getElementById('wiz-btn-note')?.addEventListener('click', () => {
      const projects = window.store.getActiveProjects();
      if (projects.length > 0 && window.store.addProjectNote) {
        window.store.addProjectNote({ projectId: projects[0].id, title: item.text.slice(0, 30), content: item.text });
        window.store.convertInboxItem(item.id, 'note');
      }
      index++;
      renderCurrentItem();
    });

    document.getElementById('wiz-btn-skip')?.addEventListener('click', () => {
      index++;
      renderCurrentItem();
    });

    document.getElementById('wiz-btn-delete')?.addEventListener('click', () => {
      window.store.deleteInboxItem(item.id);
      index++;
      renderCurrentItem();
    });
  };

  renderCurrentItem();
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}
