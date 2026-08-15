let unsubVault = null;
let currentNoteId = null;
let currentViewMode = 'edit'; // 'edit', 'preview', 'graph'
let searchQuery = '';

export function render() {
  return `
    <style>
      /* Strict Application Workspace Layout */
      .kh-workspace {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 240px; /* Sidebar width */
        display: flex;
        flex-direction: column;
        background: var(--bg-primary);
        z-index: 10;
        overflow: hidden;
      }
      .kh-grid {
        display: grid;
        grid-template-columns: 260px minmax(0, 1fr);
        flex: 1;
        overflow: hidden;
      }
      .kh-pane {
        height: 100%;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
      }
      
      @media (max-width: 1024px) {
        .kh-grid { grid-template-columns: 260px minmax(0, 1fr); }
      }
      @media (max-width: 768px) {
        .kh-workspace { left: 0; bottom: calc(60px + env(safe-area-inset-bottom)); }
        .kh-grid { display: flex; flex-direction: column; overflow-y: auto; }
        .kh-pane { height: auto; overflow: visible; flex-shrink: 0; }
        .kh-editor { min-height: 80vh; }
      }
    </style>

    <div class="view view--knowledge-hub kh-workspace">
      <header class="flex justify-between items-center px-6 py-3 border-b border-border bg-bg-surface flex-shrink-0">
        <div class="flex items-center gap-3">
          <div style="background: rgba(108, 99, 255, 0.12); padding: 8px; border-radius: 8px; color: var(--accent-primary);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div>
            <h1 class="text-xl font-bold flex items-center gap-2 m-0 leading-tight">Notes</h1>
            <p class="text-xs text-secondary mt-0.5 m-0">Your ideas and daily thoughts.</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <button id="btn-new-vault-note" class="btn btn--primary flex items-center gap-2 font-bold px-4 py-2 rounded-lg shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            New Note
          </button>
        </div>
      </header>

      <div class="kh-grid bg-bg-primary">
        <nav class="kh-pane border-r border-border bg-bg-surface/50">
          <div class="p-4 pb-2 flex-shrink-0">
            <input type="text" id="vault-search-input" class="input input--search text-xs py-2.5 w-full bg-bg-surface border-border/50 shadow-sm" placeholder="Search notes..." value="${searchQuery}" />
          </div>
          <div class="flex-1 overflow-y-auto p-4 pt-2 space-y-6" id="vault-navigation"></div>
        </nav>

        <main class="kh-pane kh-editor relative bg-bg-primary" id="obsidian-center-pane">
        </main>
      </div>
    </div>
  `;
}

export function mount() {
    const pendingNoteId = window.store.get('__pendingNoteSelection');
    if (pendingNoteId) {
       currentNoteId = pendingNoteId;
       window.store.set('__pendingNoteSelection', null);
    }

  document.getElementById('btn-new-vault-note')?.addEventListener('click', createNewNote);
  document.getElementById('vault-search-input')?.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase();
      renderNavigation();
  });

  const notes = window.notesService.getAllNotes();
  if (notes.length > 0 && !currentNoteId) {
    currentNoteId = notes[0].id;
  }

  renderVaultWorkspace();
}

export function unmount() {
  if (unsubVault) unsubVault();
}

function renderVaultWorkspace() {
  renderNavigation();
  renderCenterPane();
}

async function createNewNote() {
  const note = await window.notesService.createNote({
    title: 'Untitled Note',
    folder: 'General',
    content: ``
  });
  currentNoteId = note.id;
  renderVaultWorkspace();
}

function renderNavigation() {
  const navEl = document.getElementById('vault-navigation');
  if (!navEl) return;

  const notes = window.notesService.getAllNotes();
  
  if (searchQuery) {
      const filtered = notes.filter(n => n.title.toLowerCase().includes(searchQuery) || n.content.toLowerCase().includes(searchQuery));
      navEl.innerHTML = `
        <div>
            <div class="text-[10px] font-bold text-tertiary uppercase tracking-wider mb-2">Search Results</div>
            <div class="space-y-1">
                ${filtered.length === 0 ? '<div class="text-xs text-tertiary">No results.</div>' : filtered.map(n => renderNoteNavItem(n)).join('')}
            </div>
        </div>
      `;
      bindNavClicks(navEl);
      return;
  }

  const folders = {};
  notes.forEach(n => {
    const f = n.folder || 'General';
    if (!folders[f]) folders[f] = [];
    folders[f].push(n);
  });

  navEl.innerHTML = Object.keys(folders).sort().map(fName => `
        <div class="mt-2">
            <div class="text-[10px] font-bold text-tertiary uppercase tracking-wider mb-2">${fName}</div>
            <div class="space-y-0.5">
                ${folders[fName].map(n => renderNoteNavItem(n)).join('')}
            </div>
        </div>
  `).join('');
  bindNavClicks(navEl);
}

function renderNoteNavItem(n) {
    return `
      <div class="vault-note-item p-1.5 px-2 rounded-lg cursor-pointer text-xs flex items-center gap-2 transition-all ${n.id === currentNoteId ? 'bg-accent-lavender text-accent-primary font-bold shadow-xs' : 'hover:bg-bg-tertiary/50 text-secondary hover:text-primary font-medium'}" data-id="${n.id}">
        <span class="truncate">${n.title}</span>
      </div>
    `;
}

function bindNavClicks(navEl) {
    navEl.querySelectorAll('.vault-note-item').forEach(item => {
        item.addEventListener('click', async () => {
          if (item.dataset.id) {
              currentNoteId = item.dataset.id;
              renderVaultWorkspace();
          }
        });
      });
}

function renderCenterPane() {
  const pane = document.getElementById('obsidian-center-pane');
  if (!pane) return;

  const activeNote = window.notesService.getNote(currentNoteId);

  if (!activeNote) {
    pane.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full bg-bg-primary">
         <div class="p-4 bg-accent-lavender/30 rounded-full text-accent-primary mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
         </div>
         <h2 class="text-lg font-bold text-primary mb-2">Select a note to begin.</h2>
      </div>
    `;
    return;
  }

  pane.innerHTML = `
      <div class="px-8 py-5 flex flex-col gap-2 border-b border-border/50 flex-shrink-0">
        <input type="text" id="obs-title-input" class="input text-3xl font-bold border-none bg-transparent p-0 m-0 w-full focus:ring-0 text-primary tracking-tight" value="${activeNote.title.replace(/"/g, '&quot;')}" placeholder="Untitled Note" style="box-shadow: none;">
      </div>
      <div class="flex-1 relative overflow-hidden flex flex-col bg-bg-primary">
         <textarea id="obs-content-input" class="w-full flex-1 p-8 lg:px-12 bg-transparent border-none outline-none text-[15px] text-primary font-mono leading-relaxed resize-none overflow-y-auto block" placeholder="Write note...">${activeNote.content || ''}</textarea>
      </div>
    `;

    document.getElementById('obs-title-input')?.addEventListener('input', (e) => {
      window.notesService.saveNote(activeNote.id, { title: e.target.value });
      renderNavigation();
    });

    // Folder autosave
    document.getElementById('obs-folder-input')?.addEventListener('input', (e) => {
      window.notesService.saveNote(activeNote.id, { folder: e.target.value });
      renderNavigation();
    });

    // Content autosave
    let saveDebounce;
    document.getElementById('obs-content-input')?.addEventListener('input', (e) => {
      const status = document.getElementById('save-status');
      if (status) status.innerText = 'Saving...';
      
      const val = e.target.value;
      const cursorPos = e.target.selectionStart;
      const textBeforeCursor = val.substring(0, cursorPos);
      const lastWord = textBeforeCursor.split(/[\s\n]+/).pop();
      
      const autocompleteEl = document.getElementById('obs-autocomplete');
      if (lastWord.startsWith('[[') && lastWord.indexOf(']]') === -1) {
          const query = lastWord.substring(2).toLowerCase();
          const matchNotes = window.notesService.getAllNotes().filter(n => n.title.toLowerCase().includes(query)).slice(0, 5);
          if (matchNotes.length > 0) {
              autocompleteEl.innerHTML = matchNotes.map(n => `<div class="px-3 py-2 hover:bg-bg-tertiary cursor-pointer text-primary truncate ac-item" data-val="${n.title}">📄 ${n.title}</div>`).join('');
              autocompleteEl.classList.remove('hidden');
          } else {
              autocompleteEl.classList.add('hidden');
          }
      } else if (lastWord.startsWith('#') && lastWord.length > 1) {
          const query = lastWord.substring(1).toLowerCase();
          const allNotes = window.notesService.getAllNotes();
          const allTags = new Set();
          allNotes.forEach(n => (n.tags || []).forEach(t => allTags.add(t)));
          const matchTags = Array.from(allTags).filter(t => t.toLowerCase().includes(query)).slice(0, 5);
          if (matchTags.length > 0) {
              autocompleteEl.innerHTML = matchTags.map(t => `<div class="px-3 py-2 hover:bg-bg-tertiary cursor-pointer text-accent-primary truncate ac-item" data-val="${t}">#${t}</div>`).join('');
              autocompleteEl.classList.remove('hidden');
          } else {
              autocompleteEl.classList.add('hidden');
          }
      } else {
          autocompleteEl.classList.add('hidden');
      }

      clearTimeout(saveDebounce);
      saveDebounce = setTimeout(async () => {
         await window.notesService.saveNote(activeNote.id, { content: e.target.value });
         if (status) status.innerText = 'Saved';
         renderContextPane(); // Update backlinks/tags dynamically
      }, 500);
    });

    document.getElementById('obs-autocomplete')?.addEventListener('click', (e) => {
        const item = e.target.closest('.ac-item');
        if (!item) return;
        const val = item.dataset.val;
        const ta = document.getElementById('obs-content-input');
        const text = ta.value;
        const cursorPos = ta.selectionStart;
        const textBeforeCursor = text.substring(0, cursorPos);
        const lastWord = textBeforeCursor.split(/[\s\n]+/).pop();
        
        let replacement = '';
        if (lastWord.startsWith('[[')) replacement = `[[${val}]] `;
        else if (lastWord.startsWith('#')) replacement = `#${val} `;
        
        const newBefore = textBeforeCursor.substring(0, textBeforeCursor.length - lastWord.length) + replacement;
        ta.value = newBefore + text.substring(cursorPos);
        
        document.getElementById('obs-autocomplete').classList.add('hidden');
        ta.focus();
        ta.selectionStart = ta.selectionEnd = newBefore.length;
        ta.dispatchEvent(new Event('input'));
    });

    document.getElementById('obs-btn-fav')?.addEventListener('click', async () => {
      await window.notesService.saveNote(activeNote.id, { favorite: !activeNote.favorite });
      renderVaultWorkspace();
    });

    document.getElementById('obs-btn-pin')?.addEventListener('click', async () => {
      await window.notesService.saveNote(activeNote.id, { pinned: !activeNote.pinned });
      renderVaultWorkspace();
    });

    const moreMenu = document.getElementById('obs-more-menu');
    document.getElementById('obs-btn-more')?.addEventListener('click', () => {
        moreMenu.classList.toggle('hidden');
    });

    document.getElementById('obs-menu-dup')?.addEventListener('click', async () => {
        const newN = await window.notesService.duplicateNote(activeNote.id);
        currentNoteId = newN.id;
        renderVaultWorkspace();
    });

    document.getElementById('obs-menu-convert')?.addEventListener('click', async () => {
        const content = activeNote.content;
        const taskRegex = /- \[ \] (.*$)/gim;
        let match;
        let count = 0;
        const today = window.store.today();
        
        while ((match = taskRegex.exec(content)) !== null) {
            const taskTitle = match[1].trim();
            if (taskTitle) {
                window.store.addTask({
                    title: taskTitle,
                    notes: `Created from Note: [[${activeNote.title}]]`,
                    priority: 'medium',
                    energyLevel: 'medium',
                    scheduledDate: today
                });
                count++;
            }
        }
        
        if (count > 0) {
            window.app.showToast(`Converted ${count} checklist items to tasks`, 'success');
        } else {
            window.app.showToast('No pending checklist items found', 'info');
        }
        moreMenu.classList.add('hidden');
    });

    document.getElementById('obs-menu-del')?.addEventListener('click', async () => {
        const incoming = window.notesService.getBacklinks(activeNote.id);
        if (incoming.length > 0) {
            const confirmDel = confirm(`Delete "${activeNote.title}"?\n\n${incoming.length} notes currently link to this note.\nThose links will become unresolved.`);
            if (!confirmDel) return;
        } else {
            const confirmDel = confirm(`Delete "${activeNote.title}"?`);
            if (!confirmDel) return;
        }
        await window.notesService.deleteNote(activeNote.id);
        const remaining = window.notesService.getAllNotes();
        currentNoteId = remaining[0] ? remaining[0].id : null;
        renderVaultWorkspace();
    });

    bindFormattingToolbar();

}

function bindFormattingToolbar() {
  const textarea = document.getElementById('obs-content-input');
  if (!textarea) return;

  document.querySelectorAll('.fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.fmt;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = textarea.value;
      const selected = text.substring(start, end);

      let replacement = '';
      if (type === 'bold') replacement = `**${selected || 'bold text'}**`;
      else if (type === 'italic') replacement = `*${selected || 'italic text'}*`;
      else if (type === 'h2') replacement = `## ${selected || 'Heading 2'}\n`;
      else if (type === 'list') replacement = `- ${selected || 'List item'}\n`;
      else if (type === 'task') replacement = `- [ ] ${selected || 'New task'}\n`;
      else if (type === 'template') replacement = `## Project Brief\n- **Goal**: \n- **Timeline**: \n- **Key Deliverables**: \n\n## Action Items\n- [ ] `;

      textarea.value = text.substring(0, start) + replacement + text.substring(end);
      textarea.dispatchEvent(new Event('input'));
    });
  });
}

function parseObsidianMarkdown(md, notes) {
  let html = md
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-primary mb-2 mt-4">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-primary mb-2 mt-3">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-primary mb-1 mt-2">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/> (.*$)/gim, '<blockquote class="p-2 my-2 bg-bg-secondary border-l-4 border-border text-xs">$1</blockquote>')
    
    // Checklists
    .replace(/- \[x\] (.*$)/gim, '<div class="flex items-center gap-2 text-xs text-tertiary line-through my-1"><input type="checkbox" checked disabled> $1</div>')
    .replace(/- \[ \] (.*$)/gim, '<div class="flex items-center gap-2 text-xs text-primary my-1"><input type="checkbox" disabled> $1</div>')
    .replace(/- (.*$)/gim, '<li class="text-xs text-primary ml-4 list-disc">$1</li>')
    
    // Code blocks
    .replace(/```([a-z]*)\n([\s\S]*?)\n```/gim, '<pre class="bg-bg-secondary p-3 rounded-md text-xs font-mono my-2 overflow-x-auto border border-border"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-bg-secondary px-1 py-0.5 rounded text-[11px] text-accent-primary font-mono">$1</code>')
    
    // Tags
    .replace(/(?:\s|^)(#[a-zA-Z0-9_-]+)/g, ' <span class="text-accent-primary font-semibold hover:underline cursor-pointer">$1</span>');

  return html;
}
