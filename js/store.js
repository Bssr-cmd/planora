export class Store {
  constructor() {
    this.state = {};
    this.subscribers = {};
    const todayStr = new Date().toISOString().split('T')[0];

    this.defaults = {
      tasks: [
        {
          id: 't-1',
          title: 'Finish portfolio homepage',
          priority: 'high',
          deadline: todayStr,
          estimatedMinutes: 45,
          projectId: 'p-1',
          completed: false,
          scheduledDate: todayStr,
          scheduledTime: '10:00',
          createdAt: new Date().toISOString(),
          tags: ['design', 'frontend'],
          notes: 'Ensure responsive design and fluid spring micro-interactions.'
        },
        {
          id: 't-2',
          title: 'Study React Server Components',
          priority: 'medium',
          deadline: todayStr,
          estimatedMinutes: 60,
          projectId: 'p-2',
          completed: false,
          scheduledDate: todayStr,
          scheduledTime: '14:00',
          createdAt: new Date().toISOString(),
          tags: ['learning'],
          notes: 'Focus on cache dynamics and data fetching patterns.'
        },
        {
          id: 't-3',
          title: 'Submit quarterly assignment',
          priority: 'critical',
          deadline: todayStr,
          estimatedMinutes: 30,
          projectId: 'p-2',
          completed: true,
          completedAt: new Date().toISOString(),
          scheduledDate: todayStr,
          scheduledTime: '11:30',
          createdAt: new Date().toISOString(),
          tags: ['academic']
        },
        {
          id: 't-4',
          title: 'Deep Work — Core Engine Specs',
          priority: 'high',
          deadline: todayStr,
          estimatedMinutes: 90,
          projectId: 'p-1',
          completed: true,
          completedAt: new Date().toISOString(),
          scheduledDate: todayStr,
          scheduledTime: '09:00',
          createdAt: new Date().toISOString()
        },
        {
          id: 't-5',
          title: 'Design System Typography Audit',
          priority: 'low',
          deadline: null,
          estimatedMinutes: 25,
          projectId: 'p-1',
          completed: false,
          scheduledDate: todayStr,
          createdAt: new Date().toISOString()
        }
      ],
      projects: [
        {
          id: 'p-1',
          name: 'Portfolio Website',
          description: 'Personal interactive design showcase with fluid Apple-style animations.',
          color: '#6C63FF',
          status: 'active',
          deadline: '2026-08-30',
          createdAt: new Date().toISOString()
        },
        {
          id: 'p-2',
          name: 'Exam Preparation',
          description: 'Comprehensive study plan for upcoming senior certifications.',
          color: '#FB8C00',
          status: 'active',
          deadline: '2026-09-15',
          createdAt: new Date().toISOString()
        },
        {
          id: 'p-3',
          name: 'Personal Finance & Health',
          description: 'Tracking investments, habits, and wellness goals.',
          color: '#43A047',
          status: 'active',
          deadline: '2026-12-31',
          createdAt: new Date().toISOString()
        }
      ],
      roadmaps: [
        {
          id: 'r-1',
          title: '30-Day Portfolio Launch',
          goalTitle: 'Build a World-Class Portfolio',
          durationDays: 30,
          weeks: [
            { week: 1, title: 'Structure & Content', tasks: ['Define site architecture', 'Draft copy for key pages', 'Gather asset library'] },
            { week: 2, title: 'UI & Design Tokens', tasks: ['Design high-fidelity mockups', 'Build CSS color & type tokens', 'Create spring physics specs'] },
            { week: 3, title: 'Frontend Development', tasks: ['Implement responsive shell', 'Build interactive project grid', 'Integrate ambient focus mode'] },
            { week: 4, title: 'Launch & Polish', tasks: ['Performance CWV audit', 'Cross-browser testing', 'Deploy to production'] }
          ],
          converted: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'r-2',
          title: '60-Day Python & Machine Learning',
          goalTitle: 'Master Python & ML Basics',
          durationDays: 60,
          weeks: [
            { week: 1, title: 'Python Core', tasks: ['Data structures & control flow', 'OOP principles in Python'] },
            { week: 2, title: 'Data Analysis', tasks: ['Pandas & NumPy deep dive', 'Data visualization with Matplotlib'] },
            { week: 3, title: 'ML Fundamentals', tasks: ['Scikit-learn regression models', 'Classification & evaluation'] }
          ],
          converted: false,
          createdAt: new Date().toISOString()
        }
      ],
      goals: [
        {
          id: 'g-1',
          title: 'Build a World-Class Portfolio',
          type: 'monthly',
          deadline: '2026-08-31',
          progress: 78,
          completed: false,
          notes: 'Showcase design, spring animations, and responsive layout.'
        },
        {
          id: 'g-2',
          title: 'Master Modern Web Development',
          type: 'quarterly',
          deadline: '2026-09-30',
          progress: 52,
          completed: false
        }
      ],
      habits: [
        {
          id: 'h-1',
          name: 'Morning Meditation & Planning',
          icon: '🧘',
          frequency: 'daily',
          completedDates: [todayStr],
          createdAt: new Date().toISOString()
        },
        {
          id: 'h-2',
          name: 'Deep Work (2+ Hours)',
          icon: '⚡',
          frequency: 'daily',
          completedDates: [todayStr],
          createdAt: new Date().toISOString()
        },
        {
          id: 'h-3',
          name: 'Read 20 Pages',
          icon: '📚',
          frequency: 'daily',
          completedDates: [],
          createdAt: new Date().toISOString()
        }
      ],
      focusSessions: [
        {
          id: 'f-1',
          taskId: 't-4',
          startTime: `${todayStr}T09:00:00`,
          endTime: `${todayStr}T09:45:00`,
          duration: 45,
          targetDuration: 45,
          type: 'pomodoro',
          completed: true,
          interrupted: false
        },
        {
          id: 'f-2',
          taskId: 't-3',
          startTime: `${todayStr}T11:30:00`,
          endTime: `${todayStr}T12:15:00`,
          duration: 45,
          targetDuration: 45,
          type: 'pomodoro',
          completed: true,
          interrupted: false
        },
        {
          id: 'f-3',
          taskId: 't-1',
          startTime: `${todayStr}T13:00:00`,
          endTime: `${todayStr}T13:50:00`,
          duration: 50,
          targetDuration: 50,
          type: 'pomodoro',
          completed: true,
          interrupted: false
        }
      ],
      events: [
        {
          id: 'e-1',
          title: 'Team Sync & Product Review',
          date: todayStr,
          startTime: '11:30',
          endTime: '12:00',
          color: '#6C63FF',
          category: 'meeting'
        },
        {
          id: 'e-2',
          title: 'React Study Workshop',
          date: todayStr,
          startTime: '14:00',
          endTime: '15:00',
          color: '#FB8C00',
          category: 'learning'
        }
      ],
      inbox: [
        {
          id: 'i-1',
          text: 'Research static site hosting options (Vercel vs Netlify)',
          createdAt: new Date().toISOString(),
          converted: false
        },
        {
          id: 'i-2',
          text: 'Idea: Add dark mode particle effect to focus timer',
          createdAt: new Date().toISOString(),
          converted: false
        }
      ],
      projectNotes: [
        {
          id: 'n-1',
          projectId: 'p-1',
          title: 'Portfolio Design System Specs',
          content: `# Portfolio Design System Specs\n\n## Color Palette\n- Accent: #6C63FF (Muted Indigo/Lavender)\n- Background: #FAFAF8 (Warm Off-White)\n- Glass: Glassmorphic Translucent Blur\n\n## Typography & Motion\nUse Inter font with tight heading tracking.\nAll micro-interactions must use critically damped spring physics.\n\n> Note: Maintain a calm, peaceful visual atmosphere.`,
          pinned: true,
          updatedAt: new Date().toISOString()
        },
        {
          id: 'n-2',
          projectId: 'p-1',
          title: 'Architecture & Component Breakdown',
          content: `## Core Modules\n- Store.js — Pub/Sub Reactive State Engine\n- Spring.js — Interruptible Physics Solver\n- Drag.js — Pointer Gesture Engine\n\n## Task Checklist\n- [x] HTML App Shell\n- [x] Custom CSS Design System\n- [x] Focus Timer Soundscapes\n- [ ] Final CWV Audit`,
          pinned: false,
          updatedAt: new Date().toISOString()
        }
      ],
      vaultNotes: [
        {
          id: 'v-1',
          title: 'Welcome to Obsidian Vault',
          folder: 'General',
          content: `# Welcome to Obsidian Vault in Planora 🧠\n\nThis is your interconnected knowledge base powered by bi-directional [[WikiLinks]] and an interactive **Knowledge Graph**.\n\n## Key Features\n- **Bi-directional Links**: Use \`[[Note Title]]\` syntax to link notes together.\n- **Knowledge Graph**: Click the **Graph View** button to visualize your neural network of ideas.\n- **Live Markdown**: Full support for headers, lists, checklists, callouts, and code blocks.\n- **Backlinks Panel**: See every document referencing the active note in real-time.\n\nRelated notes:\n- See [[Project System Architecture]] for technical design.\n- See [[Daily Mental Retrospective]] for daily journal entries.`,
          pinned: true,
          tags: ['obsidian', 'knowledge', 'guide'],
          updatedAt: new Date().toISOString()
        },
        {
          id: 'v-2',
          title: 'Project System Architecture',
          folder: 'Engineering',
          content: `# Project System Architecture ⚡\n\nConnected to [[Welcome to Obsidian Vault]] and [[Daily Mental Retrospective]].\n\n## Tech Stack\n- **State Engine**: Pub/Sub Reactive Store\n- **Physics Engine**: Spring Animation Mechanics\n- **Knowledge Engine**: Inter-connected Wiki Graph\n\n> [!NOTE]\n> Every [[WikiLink]] automatically generates canvas graph edges!`,
          pinned: false,
          tags: ['engineering', 'architecture'],
          updatedAt: new Date().toISOString()
        },
        {
          id: 'v-3',
          title: 'Daily Mental Retrospective',
          folder: 'Personal',
          content: `# Daily Mental Retrospective 🧘\n\nReviewing daily focus momentum and system productivity.\n\nLinked references:\n- Check [[Welcome to Obsidian Vault]] for guidelines.\n- Check [[Project System Architecture]] for pending tasks.\n\n## Checklist\n- [x] Morning focus block\n- [x] Project review\n- [ ] Evening rollover`,
          pinned: false,
          tags: ['journal', 'personal'],
          updatedAt: new Date().toISOString()
        }
      ],
      settings: {
        userName: 'Alex',
        theme: 'calm-light',
        accentColor: '#6C63FF',
        pomodoroWork: 25,
        pomodoroBreak: 5,
        pomodoroLongBreak: 15,
        pomodorosUntilLong: 4,
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        advancedMode: true,
        fontSize: 'medium',
        activeEnvironment: 'minimal'
      }
    };

    for (const key of Object.keys(this.defaults)) {
      this.state[key] = this._load(key, this.defaults[key]);
      this.subscribers[key] = [];
    }
  }

  // Core reactive API
  get(key) {
    return this.state[key] || [];
  }

  set(key, value) {
    this.state[key] = value;
    this._persist(key);
    this._notify(key);
  }

  subscribe(key, callback) {
    if (!this.subscribers[key]) {
      this.subscribers[key] = [];
    }
    this.subscribers[key].push(callback);
    return () => {
      this.subscribers[key] = this.subscribers[key].filter(cb => cb !== callback);
    };
  }

  _persist(key) {
    try {
      localStorage.setItem('planora_' + key, JSON.stringify(this.state[key]));
    } catch (e) {
      console.error('Failed to persist state to localStorage', e);
    }
  }

  _load(key, defaultValue) {
    try {
      const stored = localStorage.getItem('planora_' + key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (e) {
      console.error(`Failed to load ${key} from localStorage`, e);
      return defaultValue;
    }
  }

  _notify(key) {
    if (this.subscribers[key]) {
      this.subscribers[key].forEach(callback => callback(this.state[key]));
    }
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  today() {
    return new Date().toISOString().split('T')[0];
  }

  // Task helpers
  addTask({ title, priority = 'none', deadline = null, startDate = null, estimatedMinutes = null, projectId = null, energyLevel = null, pomodoroEstimate = null, tags = [], notes = '', subtasks = [], scheduledDate = null, scheduledTime = null }) {
    const tasks = this.get('tasks');
    const newTask = {
      id: this.generateId(),
      title,
      priority,
      deadline,
      startDate,
      estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes, 10) : null,
      projectId,
      energyLevel,
      pomodoroEstimate: pomodoroEstimate ? parseInt(pomodoroEstimate, 10) : null,
      tags,
      notes,
      subtasks,
      scheduledDate: scheduledDate || this.today(),
      scheduledTime,
      completed: false,
      createdAt: new Date().toISOString(),
      order: tasks.length
    };
    this.set('tasks', [...tasks, newTask]);
    return newTask;
  }

  updateTask(id, updates) {
    const tasks = this.get('tasks');
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      const updatedTasks = [...tasks];
      updatedTasks[index] = { ...updatedTasks[index], ...updates };
      this.set('tasks', updatedTasks);
      return updatedTasks[index];
    }
    return null;
  }

  deleteTask(id) {
    this.set('tasks', this.get('tasks').filter(t => t.id !== id));
  }

  toggleTask(id) {
    const tasks = this.get('tasks');
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      const updatedTasks = [...tasks];
      const task = updatedTasks[index];
      const completed = !task.completed;
      updatedTasks[index] = {
        ...task,
        completed,
        completedAt: completed ? new Date().toISOString() : null
      };
      this.set('tasks', updatedTasks);

      // Cascade update to projects & goals
      this._notify('projects');
      
      // Auto-update goals progress based on completed project tasks
      const goals = this.get('goals');
      if (goals && goals.length > 0) {
        const updatedGoals = goals.map(g => {
          const totalTasks = updatedTasks.length;
          const doneTasks = updatedTasks.filter(t => t.completed).length;
          const autoProgress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
          return { ...g, progress: autoProgress };
        });
        this.set('goals', updatedGoals);
      }

      return updatedTasks[index];
    }
    return null;
  }

  getTasksByDate(dateStr) {
    return this.get('tasks').filter(t => t.scheduledDate === dateStr || t.deadline === dateStr);
  }

  getTasksByProject(projectId) {
    return this.get('tasks').filter(t => t.projectId === projectId);
  }

  getTodayTasks() {
    const todayStr = this.today();
    return this.get('tasks').filter(t => t.scheduledDate === todayStr || t.deadline === todayStr);
  }

  getOverdueTasks() {
    const todayStr = this.today();
    return this.get('tasks').filter(t => !t.completed && t.deadline && t.deadline < todayStr);
  }

  getCompletedTasks() {
    return this.get('tasks').filter(t => t.completed);
  }

  getTasksByPriority(priority) {
    return this.get('tasks').filter(t => t.priority === priority);
  }

  getIncompleteTasks() {
    return this.get('tasks').filter(t => !t.completed);
  }

  reorderTasks(taskIds) {
    const tasks = this.get('tasks');
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    const reordered = taskIds.map((id, index) => {
      const task = taskMap.get(id);
      return task ? { ...task, order: index } : null;
    }).filter(Boolean);
    this.set('tasks', reordered);
  }

  // Project helpers
  addProject({ name, description = '', color = '#6C63FF', deadline = null }) {
    const projects = this.get('projects');
    const newProject = {
      id: this.generateId(),
      name,
      description,
      color,
      deadline,
      milestones: [],
      status: 'active',
      createdAt: new Date().toISOString()
    };
    this.set('projects', [...projects, newProject]);
    return newProject;
  }

  updateProject(id, updates) {
    const projects = this.get('projects');
    const index = projects.findIndex(p => p.id === id);
    if (index !== -1) {
      const updatedProjects = [...projects];
      updatedProjects[index] = { ...updatedProjects[index], ...updates };
      this.set('projects', updatedProjects);
      return updatedProjects[index];
    }
    return null;
  }

  deleteProject(id) {
    this.set('projects', this.get('projects').filter(p => p.id !== id));
  }

  getActiveProjects() {
    return this.get('projects').filter(p => p.status === 'active');
  }

  getProjectProgress(id) {
    const projectTasks = this.getTasksByProject(id);
    if (projectTasks.length === 0) return 0;
    const completedCount = projectTasks.filter(t => t.completed).length;
    return Math.round((completedCount / projectTasks.length) * 100);
  }

  // Roadmap helpers
  addRoadmap({ title, goalTitle, durationDays = 30, weeks = [] }) {
    const roadmaps = this.get('roadmaps');
    const newRoadmap = {
      id: this.generateId(),
      title,
      goalTitle,
      durationDays,
      weeks,
      converted: false,
      createdAt: new Date().toISOString()
    };
    this.set('roadmaps', [...roadmaps, newRoadmap]);
    return newRoadmap;
  }

  convertRoadmapToPlan(roadmapId) {
    const roadmaps = this.get('roadmaps');
    const rm = roadmaps.find(r => r.id === roadmapId);
    if (!rm) return null;

    // Create a new project for this roadmap
    const project = this.addProject({
      name: rm.title,
      description: `Generated from roadmap: ${rm.goalTitle}`,
      color: '#6C63FF'
    });

    // Create tasks for each item in the weeks
    const todayStr = this.today();
    rm.weeks.forEach((w, wIdx) => {
      w.tasks.forEach((taskTitle, tIdx) => {
        // Offset date by week
        const taskDate = new Date();
        taskDate.setDate(taskDate.getDate() + (wIdx * 7) + (tIdx * 2));
        const dateStr = taskDate.toISOString().split('T')[0];

        this.addTask({
          title: taskTitle,
          projectId: project.id,
          priority: wIdx === 0 ? 'high' : 'medium',
          estimatedMinutes: 45,
          scheduledDate: dateStr,
          tags: [`week-${w.week}`]
        });
      });
    });

    // Update roadmap as converted
    const index = roadmaps.findIndex(r => r.id === roadmapId);
    if (index !== -1) {
      const updated = [...roadmaps];
      updated[index] = { ...updated[index], converted: true };
      this.set('roadmaps', updated);
    }

    return project;
  }

  deleteRoadmap(id) {
    this.set('roadmaps', this.get('roadmaps').filter(r => r.id !== id));
  }

  // Goal helpers
  addGoal({ title, type = 'monthly', parentGoalId = null, deadline = null, notes = '' }) {
    const goals = this.get('goals');
    const newGoal = {
      id: this.generateId(),
      title,
      type,
      parentGoalId,
      deadline,
      notes,
      progress: 0,
      projectIds: [],
      completed: false,
      createdAt: new Date().toISOString()
    };
    this.set('goals', [...goals, newGoal]);
    return newGoal;
  }

  updateGoal(id, updates) {
    const goals = this.get('goals');
    const index = goals.findIndex(g => g.id === id);
    if (index !== -1) {
      const updatedGoals = [...goals];
      updatedGoals[index] = { ...updatedGoals[index], ...updates };
      this.set('goals', updatedGoals);
      return updatedGoals[index];
    }
    return null;
  }

  deleteGoal(id) {
    this.set('goals', this.get('goals').filter(g => g.id !== id));
  }

  getGoalsByType(type) {
    return this.get('goals').filter(g => g.type === type);
  }

  // Habit helpers
  addHabit({ name, icon = '✓', frequency = 'daily' }) {
    const habits = this.get('habits');
    const newHabit = {
      id: this.generateId(),
      name,
      icon,
      frequency,
      completedDates: [],
      createdAt: new Date().toISOString()
    };
    this.set('habits', [...habits, newHabit]);
    return newHabit;
  }

  toggleHabitDay(id, dateStr) {
    const habits = this.get('habits');
    const index = habits.findIndex(h => h.id === id);
    if (index !== -1) {
      const habit = habits[index];
      const completedDates = habit.completedDates.includes(dateStr)
        ? habit.completedDates.filter(d => d !== dateStr)
        : [...habit.completedDates, dateStr];

      const updatedHabits = [...habits];
      updatedHabits[index] = { ...habit, completedDates };
      this.set('habits', updatedHabits);
      return updatedHabits[index];
    }
    return null;
  }

  getHabitStreak(id) {
    const habit = this.get('habits').find(h => h.id === id);
    if (!habit || !habit.completedDates || habit.completedDates.length === 0) return 0;
    
    const sorted = [...habit.completedDates].sort().reverse();
    let streak = 0;
    let checkDate = new Date();

    for (let i = 0; i < 30; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sorted.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // If today isn't done yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  deleteHabit(id) {
    this.set('habits', this.get('habits').filter(h => h.id !== id));
  }

  // Focus session helpers
  addFocusSession({ taskId = null, startTime, endTime = null, duration, targetDuration, type = 'pomodoro', completed = false, interrupted = false }) {
    const focusSessions = this.get('focusSessions');
    const newSession = {
      id: this.generateId(),
      taskId,
      startTime,
      endTime: endTime || new Date().toISOString(),
      duration: duration || 25,
      targetDuration: targetDuration || 25,
      type,
      completed,
      interrupted
    };
    this.set('focusSessions', [...focusSessions, newSession]);
    return newSession;
  }

  getFocusStats(period = 'today') {
    const sessions = this.get('focusSessions');
    const todayStr = this.today();
    
    let filtered = sessions;
    if (period === 'today') {
      filtered = sessions.filter(s => s.startTime && s.startTime.startsWith(todayStr));
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStr = weekAgo.toISOString().split('T')[0];
      filtered = sessions.filter(s => s.startTime && s.startTime >= weekStr);
    }

    const totalMinutes = filtered.reduce((acc, s) => acc + (s.duration || 0), 0);
    const sessionCount = filtered.length;
    const completedCount = filtered.filter(s => s.completed).length;
    const interruptedCount = filtered.filter(s => s.interrupted).length;
    const avgLength = sessionCount > 0 ? Math.round(totalMinutes / sessionCount) : 0;

    return { totalMinutes, sessionCount, completedCount, interruptedCount, avgLength };
  }

  getTodayFocusMinutes() {
    return this.getFocusStats('today').totalMinutes;
  }

  // Calendar event helpers
  addEvent({ title, date, startTime, endTime, color = '#6C63FF', category = '', notes = '' }) {
    const events = this.get('events');
    const newEvent = {
      id: this.generateId(),
      title,
      date,
      startTime,
      endTime,
      color,
      category,
      notes
    };
    this.set('events', [...events, newEvent]);
    return newEvent;
  }

  updateEvent(id, updates) {
    const events = this.get('events');
    const index = events.findIndex(e => e.id === id);
    if (index !== -1) {
      const updatedEvents = [...events];
      updatedEvents[index] = { ...updatedEvents[index], ...updates };
      this.set('events', updatedEvents);
      return updatedEvents[index];
    }
    return null;
  }

  deleteEvent(id) {
    this.set('events', this.get('events').filter(e => e.id !== id));
  }

  getEventsByDate(dateStr) {
    return this.get('events').filter(e => e.date === dateStr);
  }

  getEventsByDateRange(startDate, endDate) {
    return this.get('events').filter(e => e.date >= startDate && e.date <= endDate);
  }

  // Inbox helpers
  addInboxItem({ text }) {
    const inbox = this.get('inbox');
    const newItem = {
      id: this.generateId(),
      text,
      createdAt: new Date().toISOString(),
      converted: false,
      convertedTo: null
    };
    this.set('inbox', [...inbox, newItem]);
    return newItem;
  }

  deleteInboxItem(id) {
    this.set('inbox', this.get('inbox').filter(i => i.id !== id));
  }

  convertInboxItem(id, type) {
    const inbox = this.get('inbox');
    const index = inbox.findIndex(i => i.id === id);
    if (index !== -1) {
      const updatedInbox = [...inbox];
      updatedInbox[index] = { ...updatedInbox[index], converted: true, convertedTo: type };
      this.set('inbox', updatedInbox);
      return updatedInbox[index];
    }
    return null;
  }

  getUnconvertedInbox() {
    return this.get('inbox').filter(i => !i.converted);
  }

  // Project Note helpers (Advanced Project Notes)
  addProjectNote({ projectId, title, content = '', pinned = false }) {
    const notes = this.get('projectNotes') || [];
    const newNote = {
      id: this.generateId(),
      projectId,
      title: title || 'Untitled Note',
      content,
      pinned,
      updatedAt: new Date().toISOString()
    };
    this.set('projectNotes', [...notes, newNote]);
    return newNote;
  }

  updateProjectNote(id, updates) {
    const notes = this.get('projectNotes') || [];
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      const updatedNotes = [...notes];
      updatedNotes[index] = {
        ...updatedNotes[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.set('projectNotes', updatedNotes);
      return updatedNotes[index];
    }
    return null;
  }

  deleteProjectNote(id) {
    const notes = this.get('projectNotes') || [];
    this.set('projectNotes', notes.filter(n => n.id !== id));
  }

  getProjectNotes(projectId) {
    const notes = this.get('projectNotes') || [];
    return notes.filter(n => n.projectId === projectId);
  }

  // Vault Notes (Obsidian) helpers are now handled by NotesService (js/features/notes/notes-service.js)
  // which synchronizes with the 'vaultNotes' store state for reactive UI updates.

  // Settings
  getSetting(key) {
    const settings = this.get('settings');
    return settings ? settings[key] : undefined;
  }

  setSetting(key, value) {
    const settings = { ...this.get('settings') };
    settings[key] = value;
    this.set('settings', settings);
  }
}
