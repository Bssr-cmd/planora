export function render() {
  return `
    <div class="view view--inbox h-full flex flex-col max-w-3xl mx-auto w-full">
      <div class="view__header flex justify-between items-center mb-8">
        <div>
          <h1 class="text-2xl font-bold">Inbox</h1>
          <p class="text-tertiary text-sm mt-1">Capture thoughts before they slip away.</p>
        </div>
        <div id="inbox-count" class="bg-bg-tertiary px-3 py-1 rounded-full text-sm font-medium">0 items</div>
      </div>
      
      <div class="mb-8 relative">
        <input type="text" id="inbox-input" class="input w-full text-lg py-4 pl-4 pr-12 shadow-sm rounded-xl border-border focus:border-accent-primary" placeholder="Capture a thought, task, or idea..." autocomplete="off">
        <button id="inbox-submit" class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-accent-primary hover:bg-bg-tertiary rounded-full transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
      </div>

      <div class="view__content flex-1 overflow-y-auto">
        <div id="inbox-list" class="space-y-3"></div>
        <div id="inbox-empty" class="empty-state hidden flex flex-col items-center justify-center py-16 text-tertiary">
          <div class="w-20 h-20 bg-bg-tertiary rounded-full flex items-center justify-center mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
          </div>
          <h3 class="text-lg font-medium text-primary mb-2">Your inbox is clear! 🎉</h3>
          <p>You've processed all your captured thoughts.</p>
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
  window.app.showToast('Added to inbox', 'success');
}

function renderInbox() {
  const allItems = window.store.get('inbox') || [];
  const items = allItems.filter(i => !i.converted);
  
  const countEl = document.getElementById('inbox-count');
  if (countEl) countEl.textContent = \`\${items.length} item\${items.length !== 1 ? 's' : ''}\`;
  
  const listEl = document.getElementById('inbox-list');
  const emptyEl = document.getElementById('inbox-empty');
  
  if (items.length === 0) {
    listEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
  } else {
    listEl.classList.remove('hidden');
    emptyEl.classList.add('hidden');
    
    // Sort by newest first
    items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    listEl.innerHTML = items.map(item => {
      const timeAgo = getRelativeTime(item.createdAt);
      return \`
        <div class="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow group">
          <div class="flex-1">
            <p class="text-base text-primary leading-relaxed break-words">\${item.text}</p>
            <p class="text-xs text-tertiary mt-2">\${timeAgo}</p>
          </div>
          <div class="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="btn btn--secondary btn--sm inbox-convert-task" data-id="\${item.id}">To Task</button>
            <button class="btn btn--icon btn--ghost text-accent-danger inbox-delete" data-id="\${item.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      \`;
    }).join('');
    
    document.querySelectorAll('.inbox-convert-task').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const item = items.find(i => i.id === id);
        if (item) {
          window.store.addTask({ title: item.text });
          window.store.convertInboxItem(id, 'task');
          window.app.showToast('Converted to task', 'success');
        }
      });
    });
    
    document.querySelectorAll('.inbox-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        window.store.deleteInboxItem(id);
        window.app.showToast('Item deleted', 'info');
      });
    });
  }
}

function getRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return \`\${diffInMinutes} minute\${diffInMinutes > 1 ? 's' : ''} ago\`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return \`\${diffInHours} hour\${diffInHours > 1 ? 's' : ''} ago\`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 7) return \`\${diffInDays} days ago\`;
  
  return date.toLocaleDateString();
}
