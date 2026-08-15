export function init() {
  document.body.insertAdjacentHTML('beforeend', `
    <div id="cmd-palette-backdrop" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 hidden opacity-0 transition-opacity duration-200 flex items-start justify-center pt-[20vh]">
      <div id="cmd-palette" class="bg-bg-elevated w-full max-w-2xl rounded-2xl shadow-2xl border border-surface-glass-border overflow-hidden transform scale-95 transition-transform duration-200">
        <div class="flex items-center px-4 py-3 border-b border-border">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-tertiary mr-3"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="cmd-input" class="w-full bg-transparent border-none outline-none text-lg text-primary placeholder-tertiary" placeholder="Search tasks, projects, or type a command...">
          <div class="text-xs text-tertiary bg-bg-secondary px-2 py-1 rounded font-mono">ESC</div>
        </div>
        <div id="cmd-results" class="max-h-[60vh] overflow-y-auto py-2">
          <!-- Results populated here -->
        </div>
      </div>
    </div>
  `);

  const backdrop = document.getElementById('cmd-palette-backdrop');
  const palette = document.getElementById('cmd-palette');
  const input = document.getElementById('cmd-input');

  // Listen for Cmd+K or Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      toggle();
    }
    if (e.key === 'Escape' && !backdrop.classList.contains('hidden')) {
      hide();
    }
  });

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) hide();
  });

  input.addEventListener('input', () => {
    renderResults(input.value);
  });
  
  input.addEventListener('keydown', (e) => {
    const items = document.querySelectorAll('.cmd-item');
    if (items.length === 0) return;
    
    let currentIndex = Array.from(items).findIndex(el => el.classList.contains('bg-accent-primary/10'));
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (currentIndex >= 0) items[currentIndex].classList.remove('bg-accent-primary/10');
      currentIndex = (currentIndex + 1) % items.length;
      items[currentIndex].classList.add('bg-accent-primary/10');
      items[currentIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (currentIndex >= 0) items[currentIndex].classList.remove('bg-accent-primary/10');
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      items[currentIndex].classList.add('bg-accent-primary/10');
      items[currentIndex].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (currentIndex >= 0) {
        items[currentIndex].click();
      } else {
        items[0].click();
      }
    }
  });
}

function toggle() {
  const backdrop = document.getElementById('cmd-palette-backdrop');
  if (backdrop.classList.contains('hidden')) show();
  else hide();
}

export function show() {
  const backdrop = document.getElementById('cmd-palette-backdrop');
  const palette = document.getElementById('cmd-palette');
  const input = document.getElementById('cmd-input');
  
  backdrop.classList.remove('hidden');
  // trigger reflow
  void backdrop.offsetWidth;
  
  backdrop.classList.remove('opacity-0');
  palette.classList.remove('scale-95');
  
  input.value = '';
  renderResults('');
  input.focus();
}

export function hide() {
  const backdrop = document.getElementById('cmd-palette-backdrop');
  const palette = document.getElementById('cmd-palette');
  
  backdrop.classList.add('opacity-0');
  palette.classList.add('scale-95');
  
  setTimeout(() => {
    backdrop.classList.add('hidden');
  }, 200);
}

function renderResults(query) {
  const resultsContainer = document.getElementById('cmd-results');
  const q = query.toLowerCase();
  
  const defaultActions = [
    { type: 'action', title: 'New Task', icon: 'check-square', action: () => { window.app.navigate('tasks'); hide(); } },
    { type: 'action', title: 'Start Focus Session', icon: 'clock', action: () => { window.app.navigate('focus'); hide(); } },
    { type: 'action', title: 'Plan Week', icon: 'calendar', action: () => { window.app.navigate('weekly'); hide(); } },
    { type: 'action', title: 'Settings', icon: 'settings', action: () => { window.app.navigate('settings'); hide(); } }
  ];
  
  let results = [];
  
  if (!q) {
    results = defaultActions;
  } else {
    // Fuzzy match tasks
    const tasks = window.store.get('tasks') || [];
    tasks.forEach(t => {
      if (fuzzyMatch(q, t.title.toLowerCase())) {
        results.push({ type: 'task', title: t.title, meta: 'Task', action: () => { window.app.navigate('tasks'); hide(); } });
      }
    });
    
    // Fuzzy match projects
    const projects = window.store.get('projects') || [];
    projects.forEach(p => {
      if (fuzzyMatch(q, p.name.toLowerCase())) {
        results.push({ type: 'project', title: p.name, meta: 'Project', action: () => { window.app.navigate('projects'); hide(); } });
      }
    });
    
    // Filter actions
    defaultActions.forEach(a => {
      if (fuzzyMatch(q, a.title.toLowerCase())) results.push(a);
    });
  }
  
  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="px-4 py-8 text-center text-tertiary">No results found</div>';
    return;
  }
  
  resultsContainer.innerHTML = results.map((r, i) => \`
    <div class="cmd-item px-4 py-3 mx-2 rounded-lg flex items-center cursor-pointer \${i === 0 ? 'bg-accent-primary/10' : 'hover:bg-bg-tertiary'} transition-colors" data-index="\${i}">
      \${getIcon(r.type || r.icon)}
      <div class="ml-3 flex-1">
        <div class="text-primary font-medium">\${r.title}</div>
        \${r.meta ? \`<div class="text-xs text-tertiary">\${r.meta}</div>\` : ''}
      </div>
    </div>
  \`).join('');
  
  // Attach events
  document.querySelectorAll('.cmd-item').forEach((el, index) => {
    el.addEventListener('click', () => {
      results[index].action();
    });
    el.addEventListener('mouseenter', () => {
      document.querySelectorAll('.cmd-item').forEach(item => item.classList.remove('bg-accent-primary/10'));
      el.classList.add('bg-accent-primary/10');
    });
  });
}

function fuzzyMatch(pattern, str) {
  let pIdx = 0;
  for (let i = 0; i < str.length && pIdx < pattern.length; i++) {
    if (str[i] === pattern[pIdx]) pIdx++;
  }
  return pIdx === pattern.length;
}

function getIcon(type) {
  const svgOpen = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-tertiary">';
  if (type === 'task' || type === 'check-square') return \`\${svgOpen}<polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>\`;
  if (type === 'project') return \`\${svgOpen}<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>\`;
  if (type === 'clock') return \`\${svgOpen}<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>\`;
  if (type === 'calendar') return \`\${svgOpen}<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>\`;
  if (type === 'settings') return \`\${svgOpen}<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>\`;
  return \`\${svgOpen}<circle cx="12" cy="12" r="10"></circle></svg>\`;
}
