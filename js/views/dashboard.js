export function render() {
  const store = window.store;
  const userName = store.getSetting('userName') || 'Alex';
  
  // Dashboard Widget Visibility Config
  const defaultWidgets = {
    focus: true,
    today: true,
    progress: true,
    timeline: true,
    projects: true,
    roadmap: true
  };
  const widgetConfig = store.getSetting('dashboardWidgets') || defaultWidgets;

  const todayTasks = store.getTodayTasks();
  const completedTasks = todayTasks.filter(t => t.completed);
  const incompleteToday = todayTasks.filter(t => !t.completed);
  
  const percentComplete = todayTasks.length > 0
    ? Math.round((completedTasks.length / todayTasks.length) * 100)
    : 0;

  const focusStats = store.getFocusStats('today');
  const focusHours = Math.floor(focusStats.totalMinutes / 60);
  const focusMins = focusStats.totalMinutes % 60;
  const focusTimeFormatted = focusHours > 0 ? `${focusHours}h ${focusMins}m` : `${focusMins}m`;

  // Calculate planned capacity
  const totalPlannedMins = todayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 30), 0);
  const plannedHours = (totalPlannedMins / 60).toFixed(1);
  const isOverloaded = totalPlannedMins > 360;

  // Urgent deadline today task check
  const deadlineTodayTasks = incompleteToday.filter(t => t.deadline === store.today());

  // Find top focus task
  const incompleteTasks = store.getIncompleteTasks();
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'none': 4 };
  const focusTask = deadlineTodayTasks[0] || incompleteTasks.sort((a, b) => (priorityOrder[a.priority] ?? 4) - (priorityOrder[b.priority] ?? 4))[0] || {
    id: null,
    title: 'No active focus task. Add one below!',
    estimatedMinutes: 25,
    priority: 'low',
    deadline: null,
    projectId: null
  };

  const focusProject = focusTask.projectId ? store.get('projects').find(p => p.id === focusTask.projectId) : null;
  const activeProjects = store.getActiveProjects().slice(0, 3);
  const activeRoadmap = (store.get('roadmaps') || [])[0] || {
    id: 'r-1',
    title: '30-Day Portfolio Launch',
    goalTitle: 'Build a World-Class Portfolio',
    durationDays: 30,
    weeks: [
      { week: 1, title: 'Structure & Content' },
      { week: 2, title: 'UI & Design Tokens' },
      { week: 3, title: 'Frontend Development' },
      { week: 4, title: 'Launch & Polish' }
    ]
  };

  // Time of day greeting
  const now = new Date();
  const hour = now.getHours();
  let greeting = 'Good morning';
  if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
  else if (hour >= 17) greeting = 'Good evening';

  const fullDateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((dayOfYear + startOfYear.getDay() + 1) / 7);
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();

  const eventsToday = store.getEventsByDate(store.today());
  const scheduledTasks = todayTasks.filter(t => t.scheduledTime);
  const timelineItems = [
    ...eventsToday.map(e => ({ time: e.startTime, title: e.title, type: 'event', color: e.color || '#6C63FF' })),
    ...scheduledTasks.map(t => ({ time: t.scheduledTime, title: t.title, type: 'task', color: '#8176FF' }))
  ].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  return `
    <div class="view dashboard-view" style="max-width: 1200px; margin: 0 auto; padding-bottom: 40px;">
      
      <!-- HEADER & PERSONALIZATION -->
      <header class="view__header animate-fade-up animate-stagger-1" style="align-items: flex-start; margin-bottom: 20px;">
        <div>
          <h1 class="view__title" style="font-size: clamp(1.6rem, 2.5vw, 2.25rem); font-weight: 700; letter-spacing: -0.02em;">${greeting}, ${userName}</h1>
          <p style="font-size: var(--text-sm); font-weight: 500; color: var(--accent-primary); margin-top: 2px; font-style: italic;">
            "Let's make today count."
          </p>
          <p class="view__subtitle" style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 6px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span>${fullDateStr}</span>
            <span style="color: var(--text-tertiary);">•</span>
            <span class="badge" style="background: var(--bg-tertiary); color: var(--text-secondary); font-size: 11px; font-weight: 500;">Week ${weekNum} · Day ${dayOfWeek}</span>
            <span style="color: var(--text-tertiary);">•</span>
            <span style="color: var(--accent-primary); font-weight: 500;">${incompleteToday.length} priorities</span>
            <span style="color: var(--text-tertiary);">•</span>
            <span>${focusTimeFormatted} focused</span>
          </p>
        </div>

        <div class="view__actions" style="gap: 10px;">
          <button class="btn btn--ghost" id="btn-customize-dashboard" title="Customize Dashboard Widgets" style="font-size: var(--text-xs); color: var(--text-secondary);">
            ⚙ Customize
          </button>
          <button class="btn btn--secondary" id="btn-smart-recommend" style="background: var(--accent-lavender); color: var(--accent-primary); border: 1px solid rgba(108, 99, 255, 0.2); font-weight: 600;">
            ✦ What should I do now?
          </button>
          <button class="btn btn--primary" id="btn-quick-add-task">
            + Add Task
          </button>
        </div>
      </header>

      <!-- ADAPTIVE STATE BANNER: OVERLOADED OR CLEAR -->
      ${isOverloaded ? `
        <div class="animate-fade-up animate-stagger-1" style="margin-bottom: 20px; padding: 12px 16px; background: rgba(229, 57, 53, 0.08); border: 1px solid rgba(229, 57, 53, 0.25); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: var(--text-xs); color: var(--text-primary);">
            <span style="font-weight: 700; color: var(--accent-danger);">⚠️ Your day looks overloaded</span>
            <span style="color: var(--text-secondary);">— ${plannedHours}h planned · 6.0h available</span>
          </div>
          <button class="btn btn--ghost btn--sm" id="btn-review-schedule" style="font-size: var(--text-xs); padding: 4px 10px; color: var(--accent-danger);">
            Rebalance Schedule →
          </button>
        </div>
      ` : todayTasks.length === 0 ? `
        <div class="animate-fade-up animate-stagger-1" style="margin-bottom: 20px; padding: 12px 16px; background: rgba(82, 183, 136, 0.08); border: 1px solid rgba(82, 183, 136, 0.25); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: var(--text-xs); color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
            <span style="font-weight: 700; color: var(--accent-success);">🌿 Your day is clear</span>
            <span style="color: var(--text-secondary);">Take space to think, rest, or plan your next goal roadmap.</span>
          </div>
          <button class="btn btn--ghost btn--sm" id="btn-create-roadmap-clear" style="font-size: var(--text-xs); color: var(--accent-success);">
            Plan Goal Roadmap →
          </button>
        </div>
      ` : ''}

      <!-- WIDGET 1: YOUR FOCUS NOW (LEVEL 1 HERO) -->
      ${widgetConfig.focus !== false ? `
        <section class="focus-hero-card animate-fade-up animate-stagger-2" style="padding: 24px; margin-bottom: 28px; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 280px;">
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--accent-primary); text-transform: uppercase; display: flex; align-items: center; gap: 4px;">
                  ✦ YOUR FOCUS NOW
                </span>
                <span style="font-size: var(--text-xs); color: var(--text-secondary); background: rgba(255,255,255,0.6); padding: 2px 8px; border-radius: var(--radius-full);">
                  ${focusTask.estimatedMinutes || 25} min
                </span>
              </div>

              <h2 style="font-size: clamp(1.25rem, 2vw, 1.5rem); font-weight: 700; color: var(--text-primary); margin-bottom: 6px; letter-spacing: -0.01em;">
                ${focusTask.title}
              </h2>

              <div style="display: flex; align-items: center; gap: 12px; font-size: var(--text-xs); color: var(--text-secondary); flex-wrap: wrap;">
                <span style="font-weight: 600; color: ${focusTask.priority === 'high' || focusTask.priority === 'critical' ? 'var(--accent-danger)' : focusTask.priority === 'medium' ? 'var(--accent-warning)' : 'var(--text-secondary)'};">
                  ${focusTask.priority ? focusTask.priority.toUpperCase() : 'MEDIUM'} PRIORITY
                </span>
                <span>·</span>
                <span>${focusTask.deadline ? `Due ${focusTask.deadline === store.today() ? 'Today' : focusTask.deadline}` : 'Scheduled for Today'}</span>
                ${focusProject ? `
                  <span>·</span>
                  <span class="tag" style="background: rgba(108, 99, 255, 0.1); color: var(--accent-primary); font-weight: 500;">📁 ${focusProject.name}</span>
                ` : ''}
              </div>
            </div>

            <div>
              <button class="btn btn--primary btn-focus-hover-compact" id="btn-start-focus" data-task-id="${focusTask.id || ''}" style="box-shadow: 0 4px 16px rgba(108, 99, 255, 0.3); padding: 12px 20px; font-weight: 600; min-width: 140px; justify-content: center;">
                <span class="btn-text-default">▶ Start Focus</span>
              </button>
            </div>
          </div>
        </section>
      ` : ''}

      <!-- TWO COLUMN GRID: TODAY & YOUR PROGRESS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; margin-bottom: 24px;">
        
        <!-- WIDGET 2: TODAY'S TASKS -->
        ${widgetConfig.today !== false ? `
          <div class="animate-fade-up animate-stagger-3" style="background: var(--bg-elevated); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;">
                <span>☀ TODAY</span>
                <span class="badge" style="background: var(--bg-tertiary); color: var(--text-secondary); font-size: 11px;">${todayTasks.length}</span>
              </h3>
              <button class="btn btn--ghost btn--sm" id="btn-view-all-tasks" style="font-size: var(--text-xs); color: var(--accent-primary);">View all tasks →</button>
            </div>

            <div class="today-tasks-list" style="display: flex; flex-direction: column; gap: 8px;">
              ${todayTasks.length === 0 ? `
                <div class="empty-state" style="padding: 24px 0; text-align: center;">
                  <p class="empty-state__message" style="font-size: var(--text-sm); color: var(--text-secondary);">Your day is clear 🌿 — Take space to think or plan ahead.</p>
                </div>
              ` : todayTasks.slice(0, 5).map(task => {
                const project = task.projectId ? store.get('projects').find(p => p.id === task.projectId) : null;
                const priorityColor = task.priority === 'high' || task.priority === 'critical'
                  ? '#E53935'
                  : task.priority === 'medium'
                    ? '#FB8C00'
                    : '#5C6BC0';

                return `
                  <div class="task-item ${task.completed ? 'task-item--completed' : ''}" data-task-id="${task.id}" style="padding: 10px 12px; border-radius: var(--radius-md); background: var(--bg-secondary); display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" class="task-checkbox" data-id="${task.id}" ${task.completed ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--accent-primary);">
                    
                    <div style="flex: 1; min-width: 0;">
                      <div class="task-item__title" style="font-size: var(--text-sm); font-weight: 500; ${task.completed ? 'text-decoration: line-through; color: var(--text-secondary); opacity: 0.72;' : 'color: var(--text-primary);'}">
                        ${task.title}
                      </div>
                      
                      <div style="font-size: var(--text-xs); color: var(--text-tertiary); display: flex; align-items: center; gap: 8px; margin-top: 2px;">
                        ${task.estimatedMinutes ? `<span>${task.estimatedMinutes} min</span>` : ''}
                        <span>·</span>
                        <span style="font-weight: 600; color: ${priorityColor}; text-transform: capitalize;">${task.priority || 'Medium'}</span>
                        ${project ? `
                          <span>·</span>
                          <span style="color: var(--accent-primary); font-weight: 500;">📁 ${project.name}</span>
                        ` : ''}
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <button class="btn btn--ghost btn--sm" id="btn-add-today-task" style="width: 100%; margin-top: 14px; border: 1px dashed var(--border); justify-content: center; color: var(--text-secondary); font-weight: 500;">
              + Add task
            </button>
          </div>
        ` : ''}

        <!-- WIDGET 3: YOUR PROGRESS (COMPACT NO WASTED SPACE) -->
        ${widgetConfig.progress !== false ? `
          <div class="animate-fade-up animate-stagger-3" style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
            <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">
              📊 YOUR PROGRESS
            </h3>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
              <div>
                <div style="font-size: var(--text-3xl); font-weight: 800; color: var(--text-primary); line-height: 1;">${percentComplete}%</div>
                <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 4px;">${completedTasks.length} / ${todayTasks.length} completed</div>
              </div>

              <div style="width: 100px;">
                <div class="progress-bar" style="height: 10px; background: var(--border);">
                  <div class="progress-bar__fill" style="width: ${percentComplete}%; background: var(--accent-primary);"></div>
                </div>
                <div style="font-size: 10px; color: var(--accent-success); font-weight: 600; text-align: right; margin-top: 4px;">
                  ${percentComplete >= 100 ? '🎉 All done!' : 'On track'}
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; border-top: 1px solid var(--border); padding-top: 14px;">
              <div style="background: var(--bg-elevated); padding: 8px 10px; border-radius: var(--radius-sm); text-align: center;">
                <div style="font-size: 10px; color: var(--text-tertiary);">Focus Today</div>
                <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${focusTimeFormatted}</div>
              </div>

              <div style="background: var(--bg-elevated); padding: 8px 10px; border-radius: var(--radius-sm); text-align: center;">
                <div style="font-size: 10px; color: var(--text-tertiary);">Sessions</div>
                <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${focusStats.sessionCount}</div>
              </div>

              <div style="background: var(--bg-elevated); padding: 8px 10px; border-radius: var(--radius-sm); text-align: center;">
                <div style="font-size: 10px; color: var(--text-tertiary);">Remaining</div>
                <div style="font-size: var(--text-sm); font-weight: 700; color: var(--text-primary);">${incompleteToday.length}</div>
              </div>
            </div>
          </div>
        ` : ''}

      </div>

      <!-- SECOND GRID: YOUR DAY & ACTIVE PROJECTS -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 24px; margin-bottom: 24px;">
        
        <!-- WIDGET 4: YOUR DAY TIMELINE -->
        ${widgetConfig.timeline !== false ? `
          <div class="animate-fade-up animate-stagger-4" style="background: var(--bg-elevated); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
              <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0;">
                🕒 YOUR DAY
              </h3>
              <span style="font-size: var(--text-xs); color: var(--accent-danger); font-weight: 700;">${currentTimeStr} NOW</span>
            </div>

            ${timelineItems.length === 0 ? `
              <div class="empty-state" style="padding: 16px 0; text-align: center;">
                <p class="empty-state__message" style="font-size: var(--text-sm); color: var(--text-secondary);">No scheduled events yet for today.</p>
                <button class="btn btn--ghost btn--sm" id="btn-open-planner" style="margin-top: 8px;">Open Daily Planner →</button>
              </div>
            ` : `
              <div style="position: relative; padding-left: 20px; display: flex; flex-direction: column; gap: 16px;">
                <div style="position: absolute; left: 6px; top: 10px; bottom: 10px; width: 2px; background: var(--border);"></div>

                ${timelineItems.map((item, idx) => `
                  <div style="position: relative; display: flex; align-items: flex-start; gap: 12px;">
                    <div style="position: absolute; left: -20px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background: ${item.color}; border: 2px solid var(--bg-elevated); z-index: 2;"></div>
                    
                    <div style="width: 48px; font-size: var(--text-xs); font-weight: 700; color: var(--text-primary); margin-top: 1px;">
                      ${item.time}
                    </div>

                    <div style="flex: 1; background: var(--bg-secondary); padding: 8px 12px; border-radius: var(--radius-sm);">
                      <div style="font-size: var(--text-sm); font-weight: 600; color: var(--text-primary);">${item.title}</div>
                      <div style="font-size: 10px; color: var(--text-tertiary); text-transform: uppercase; margin-top: 2px;">${item.type}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            `}
          </div>
        ` : ''}

        <!-- WIDGET 5: ACTIVE PROJECTS & COMING UP -->
        ${widgetConfig.projects !== false ? `
          <div class="animate-fade-up animate-stagger-4" style="display: flex; flex-direction: column; gap: 24px;">
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0;">
                  📁 ACTIVE PROJECTS
                </h3>
                <button class="btn btn--ghost btn--sm" id="btn-view-projects" style="font-size: var(--text-xs); color: var(--accent-primary);">View all →</button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 14px;">
                ${activeProjects.length === 0 ? `
                  <div class="empty-state" style="padding: 20px 0; text-align: center;">
                    <p class="empty-state__message" style="font-size: var(--text-xs); color: var(--text-secondary);">No active projects yet.</p>
                    <p style="font-size: var(--text-xs); color: var(--text-tertiary); margin-top: 4px;">Turn a goal into your first project.</p>
                    <button class="btn btn--primary btn--sm" id="btn-create-project-empty" style="margin-top: 10px;">+ Create Project</button>
                  </div>
                ` : activeProjects.map(proj => {
                  const progress = store.getProjectProgress(proj.id);
                  return `
                    <div class="project-progress-item" data-id="${proj.id}" style="cursor: pointer; padding: 10px; background: var(--bg-elevated); border-radius: var(--radius-md); transition: transform 150ms;">
                      <div style="display: flex; justify-content: space-between; font-size: var(--text-sm); font-weight: 600; margin-bottom: 6px;">
                        <span>${proj.name}</span>
                        <span style="color: var(--accent-primary); font-weight: 700;">${progress}%</span>
                      </div>
                      <div class="progress-bar" style="height: 6px; background: var(--border);">
                        <div class="progress-bar__fill" style="width: ${progress}%; background: ${proj.color || 'var(--accent-primary)'};"></div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <!-- COMING UP / UPCOMING DEADLINES CARD -->
            <div style="background: var(--bg-elevated); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 6px;">
                  <span>📌 COMING UP</span>
                </h3>
                <button class="btn btn--ghost btn--sm" onclick="window.app.navigate('tasks')" style="font-size: var(--text-xs); color: var(--accent-primary);">Tasks →</button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${(() => {
                  const upcoming = store.get('tasks').filter(t => !t.completed && t.deadline).sort((a,b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);
                  if (upcoming.length === 0) {
                    return '<p style="font-size: var(--text-xs); color: var(--text-tertiary); text-align: center; margin: 8px 0;">No upcoming deadlines scheduled.</p>';
                  }
                  return upcoming.map(t => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-secondary); border-radius: var(--radius-sm);">
                      <div>
                        <div style="font-size: var(--text-xs); font-weight: 600; color: var(--text-primary);">${t.title}</div>
                        <div style="font-size: 10px; color: var(--accent-danger); font-weight: 500;">Due ${t.deadline}</div>
                      </div>
                      <span class="badge" style="font-size: 10px; text-transform: uppercase; background: var(--bg-tertiary); color: var(--text-secondary);">${t.priority || 'medium'}</span>
                    </div>
                  `).join('');
                })()}
              </div>
            </div>
          </div>
        ` : ''}

      </div>

      <!-- WIDGET 6: YOUR ROADMAP (RECOMMENDED DASHBOARD LAYOUT FEATURE) -->
      ${widgetConfig.roadmap !== false ? `
        <section class="animate-fade-up animate-stagger-4" style="background: var(--bg-elevated); padding: 20px 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-light); box-shadow: var(--shadow-sm);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase; letter-spacing: 0.08em;">
                ◇ YOUR ROADMAP
              </div>
              <h3 style="font-size: var(--text-base); font-weight: 700; color: var(--text-primary); margin-top: 2px;">
                ${activeRoadmap.title} · Week 2 of ${activeRoadmap.weeks ? activeRoadmap.weeks.length : 4}
              </h3>
            </div>
            <button class="btn btn--ghost btn--sm" onclick="window.app.navigate('roadmap')" style="font-size: var(--text-xs); color: var(--accent-primary);">
              Open Roadmap →
            </button>
          </div>

          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 6px;">
              <span>Current Milestone: <strong>${activeRoadmap.weeks ? activeRoadmap.weeks[1]?.title : 'UI & Design Tokens'}</strong></span>
              <span style="font-weight: 700; color: var(--accent-primary);">68%</span>
            </div>
            <div class="progress-bar" style="height: 8px; background: var(--bg-tertiary);">
              <div class="progress-bar__fill" style="width: 68%; background: var(--accent-primary);"></div>
            </div>
          </div>
        </section>
      ` : ''}

    </div>
  `;
}

export function mount() {
  const store = window.store;

  // Task check toggle (Triggers Automated Reactive Cascade to Progress, Projects, & Goals)
  document.querySelectorAll('.task-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const taskId = e.target.dataset.id;
      store.toggleTask(taskId);
      window.app.showToast('Task updated · Progress cascaded to Projects & Goals', 'success');
      window.app.navigate('dashboard');
    });
  });

  // Start Focus session (Total Screen Mode)
  const focusBtn = document.getElementById('btn-start-focus');
  if (focusBtn) {
    focusBtn.addEventListener('click', async () => {
      const taskId = focusBtn.dataset.taskId;
      try {
        const focusModule = await import('./focus.js');
        if (focusModule.openTotalScreenFocus) {
          focusModule.openTotalScreenFocus(taskId);
        } else {
          window.app.navigate('focus');
        }
      } catch (e) {
        window.app.navigate('focus');
      }
    });
  }

  // Quick add task
  document.getElementById('btn-quick-add-task')?.addEventListener('click', showQuickAddModal);
  document.getElementById('btn-add-today-task')?.addEventListener('click', showQuickAddModal);

  // Smart recommend dialog
  document.getElementById('btn-smart-recommend')?.addEventListener('click', showSmartRecommendModal);

  // Customize Dashboard dialog
  document.getElementById('btn-customize-dashboard')?.addEventListener('click', showCustomizeDashboardModal);

  // Review schedule / create roadmap
  document.getElementById('btn-review-schedule')?.addEventListener('click', () => window.app.navigate('daily'));
  document.getElementById('btn-create-roadmap-clear')?.addEventListener('click', () => window.app.navigate('roadmap'));

  // Navigation helpers
  document.getElementById('btn-view-all-tasks')?.addEventListener('click', () => window.app.navigate('tasks'));
  document.getElementById('btn-view-projects')?.addEventListener('click', () => window.app.navigate('projects'));
  document.getElementById('btn-open-planner')?.addEventListener('click', () => window.app.navigate('daily'));
  document.getElementById('btn-create-project-empty')?.addEventListener('click', () => window.app.navigate('projects'));

  document.querySelectorAll('.project-progress-item').forEach(item => {
    item.addEventListener('click', () => {
      window.app.navigate('projects');
    });
  });
}

function showCustomizeDashboardModal() {
  const store = window.store;
  const currentWidgets = store.getSetting('dashboardWidgets') || {
    focus: true,
    today: true,
    progress: true,
    timeline: true,
    projects: true,
    roadmap: true
  };

  const widgetLabels = {
    focus: '✦ Your Focus Now',
    today: '☀ Today\'s Priorities',
    progress: '📊 Your Progress & Stats',
    timeline: '🕒 Your Day Timeline',
    projects: '📁 Active Projects',
    roadmap: '◇ Your Roadmap'
  };

  window.app.showModal(`
    <div style="padding: 10px;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 8px;">⚙ Customize Dashboard Layout</h2>
      <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 16px;">
        Choose which widget sections appear on your personal command center.
      </p>

      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${Object.keys(widgetLabels).map(key => `
          <label style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-secondary); border-radius: var(--radius-md); cursor: pointer;">
            <span style="font-size: var(--text-sm); font-weight: 500;">${widgetLabels[key]}</span>
            <input type="checkbox" class="widget-toggle-cb" data-key="${key}" ${currentWidgets[key] !== false ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--accent-primary);">
          </label>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="btn-save-widgets">Save Layout</button>
      </div>
    </div>
  `);

  document.getElementById('btn-save-widgets')?.addEventListener('click', () => {
    const newConfig = {};
    document.querySelectorAll('.widget-toggle-cb').forEach(cb => {
      newConfig[cb.dataset.key] = cb.checked;
    });
    store.setSetting('dashboardWidgets', newConfig);
    window.app.showToast('Dashboard layout saved!', 'success');
    window.app.hideModal();
    window.app.navigate('dashboard');
  });
}

function showQuickAddModal() {
  const store = window.store;
  const projects = store.getActiveProjects();

  const content = `
    <div style="padding: 10px;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 16px;">Quick Add Task</h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <input type="text" id="quick-task-title" class="input" placeholder="Task title..." autofocus style="font-size: var(--text-base);">
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Priority</label>
            <select id="quick-task-priority" class="input" style="margin-top: 4px;">
              <option value="high">High</option>
              <option value="medium" selected>Medium</option>
              <option value="low">Low</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div>
            <label style="font-size: var(--text-xs); color: var(--text-secondary);">Duration (mins)</label>
            <input type="number" id="quick-task-duration" class="input" value="30" style="margin-top: 4px;">
          </div>
        </div>

        <div>
          <label style="font-size: var(--text-xs); color: var(--text-secondary);">Project</label>
          <select id="quick-task-project" class="input" style="margin-top: 4px;">
            <option value="">None</option>
            ${projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Cancel</button>
        <button class="btn btn--primary" id="modal-save-task-btn">Add Task</button>
      </div>
    </div>
  `;

  window.app.showModal(content);

  document.getElementById('modal-save-task-btn')?.addEventListener('click', () => {
    const title = document.getElementById('quick-task-title')?.value;
    if (!title || !title.trim()) return;

    store.addTask({
      title: title.trim(),
      priority: document.getElementById('quick-task-priority')?.value || 'medium',
      estimatedMinutes: document.getElementById('quick-task-duration')?.value || 30,
      projectId: document.getElementById('quick-task-project')?.value || null,
      scheduledDate: store.today()
    });

    window.app.showToast('Task added for Today!', 'success');
    window.app.hideModal();
    window.app.navigate('dashboard');
  });
}

function showSmartRecommendModal() {
  const store = window.store;
  const incomplete = store.getIncompleteTasks();
  
  if (incomplete.length === 0) {
    window.app.showModal(`
      <div style="padding: 20px; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🌿</div>
        <h2 style="font-size: var(--text-lg); font-weight: 700;">Your day is clear!</h2>
        <p style="color: var(--text-secondary); margin-top: 6px;">You have completed all your tasks. Enjoy your space!</p>
        <button class="btn btn--primary" style="margin-top: 16px;" onclick="window.app.hideModal()">Awesome</button>
      </div>
    `);
    return;
  }

  const recommended = incomplete[0];
  const project = recommended.projectId ? store.get('projects').find(p => p.id === recommended.projectId) : null;

  window.app.showModal(`
    <div style="padding: 14px;">
      <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; font-weight: 700; color: var(--accent-primary); text-transform: uppercase;">
        ✦ PLANORA INTELLIGENT RECOMMENDATION
      </div>
      
      <p style="color: var(--text-secondary); font-size: var(--text-xs); margin-top: 4px;">
        Based on your deadlines, available time, and priorities:
      </p>

      <div style="background: var(--bg-secondary); padding: 16px; border-radius: var(--radius-md); margin-top: 14px; border-left: 4px solid var(--accent-primary);">
        <h2 style="font-size: var(--text-lg); font-weight: 700; color: var(--text-primary);">${recommended.title}</h2>
        
        <div style="display: flex; gap: 10px; font-size: var(--text-xs); color: var(--text-secondary); margin-top: 6px;">
          <span>${recommended.estimatedMinutes || 30} min</span>
          <span>·</span>
          <span style="font-weight: 600; text-transform: capitalize; color: var(--accent-warning);">${recommended.priority || 'Medium'} Priority</span>
          ${project ? `<span>·</span><span>📁 ${project.name}</span>` : ''}
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
        <button class="btn btn--primary" id="btn-rec-start-focus" style="flex: 1;">▶ Start Focus</button>
        <button class="btn btn--secondary" id="btn-rec-another">Choose Another</button>
        <button class="btn btn--ghost" onclick="window.app.hideModal()">Close</button>
      </div>
    </div>
  `);

  document.getElementById('btn-rec-start-focus')?.addEventListener('click', async () => {
    window.app.hideModal();
    try {
      const focusModule = await import('./focus.js');
      if (focusModule.openTotalScreenFocus) {
        focusModule.openTotalScreenFocus(recommended.id);
      } else {
        window.app.navigate('focus');
      }
    } catch (e) {
      window.app.navigate('focus');
    }
  });

  document.getElementById('btn-rec-another')?.addEventListener('click', () => {
    window.app.hideModal();
    window.app.navigate('tasks');
  });
}

export function unmount() {}
