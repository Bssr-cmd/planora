let unsubscribe = null;
let currentTab = 'timer'; // timer, breathing, sessions, stats
let timerInterval = null;
let timerState = 'idle'; // idle, running, paused
let currentPhase = 'focus'; // focus, break, long-break
let customDurationMins = 25;
let timeLeft = 25 * 60; // seconds
let sessionCount = 0;
let currentEnvironment = 'minimal';
let selectedTaskId = null;
let isBreathingActive = false;
let breathingPhase = 'Inhale'; // Inhale (4s), Hold (7s), Exhale (8s)
let breathingTimer = null;

let settings = {};

// Web Audio API Ambient Noise Synthesizer
let audioCtx = null;
let ambientSource = null;
let ambientGain = null;
let currentSound = 'off'; // off, noise, waves, chime

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  return audioCtx;
}

export function startAmbientSound(type) {
  stopAmbientSound();
  currentSound = type;
  if (type === 'off') return;

  const ctx = getAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume();

  ambientGain = ctx.createGain();
  ambientGain.gain.setValueAtTime(0.05, ctx.currentTime);
  ambientGain.connect(ctx.destination);

  if (type === 'noise' || type === 'waves' || type === 'forest') {
    const bufferSize = ctx.sampleRate * 5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      const factor = type === 'forest' ? 0.01 : 0.02;
      data[i] = (lastOut + (factor * white)) / 1.02;
      lastOut = data[i];
      data[i] *= (type === 'forest' ? 2.2 : 3.5);
    }

    ambientSource = ctx.createBufferSource();
    ambientSource.buffer = buffer;
    ambientSource.loop = true;
    ambientSource.connect(ambientGain);
    ambientSource.start();
  } else if (type === 'chime') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime);
    
    ambientGain.gain.setValueAtTime(0.08, ctx.currentTime);
    ambientGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4);
    
    osc.connect(ambientGain);
    osc.start();
    osc.stop(ctx.currentTime + 4);
  }
}

export function stopAmbientSound() {
  if (ambientSource) {
    try { ambientSource.stop(); } catch (e) {}
    ambientSource = null;
  }
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function setCustomDuration(minutes) {
  const mins = parseInt(minutes, 10);
  if (isNaN(mins) || mins <= 0) return;
  customDurationMins = mins;
  timeLeft = mins * 60;
  timerState = 'idle';
  if (timerInterval) clearInterval(timerInterval);
  updateTimerDisplay();
}

export function render() {
  return `
    <div class="view view--focus env-${currentEnvironment}" style="min-height: 100%; transition: background 0.5s ease; padding-bottom: 40px;">
      <header class="view__header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <div>
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Focus Workspace</h1>
          <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-top: 2px;">Deep work, custom timers, ambient soundscapes, and breathing exercises.</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn--primary" id="btn-fullscreen-focus" style="box-shadow: 0 4px 14px rgba(108,99,255,0.3); font-weight: 600;">
            ⛶ Enter Total Screen Focus Mode
          </button>
        </div>
      </header>
      
      <div style="display: flex; justify-content: center; margin-bottom: 28px;">
        <div class="view-toggle" style="display: flex; background: var(--surface-glass); backdrop-filter: blur(20px); border-radius: var(--radius-sm); padding: 4px; border: 1px solid var(--surface-glass-border);">
          <button class="btn btn--ghost btn--sm ${currentTab === 'timer' ? 'is-active' : ''}" data-tab="timer" style="padding: 6px 16px; ${currentTab === 'timer' ? 'background: var(--bg-elevated); box-shadow: var(--shadow-sm); font-weight: 600;' : ''}">Timer & Sound</button>
          <button class="btn btn--ghost btn--sm ${currentTab === 'breathing' ? 'is-active' : ''}" data-tab="breathing" style="padding: 6px 16px; ${currentTab === 'breathing' ? 'background: var(--bg-elevated); box-shadow: var(--shadow-sm); font-weight: 600;' : ''}">🧘 Breathing</button>
          <button class="btn btn--ghost btn--sm ${currentTab === 'sessions' ? 'is-active' : ''}" data-tab="sessions" style="padding: 6px 16px; ${currentTab === 'sessions' ? 'background: var(--bg-elevated); box-shadow: var(--shadow-sm); font-weight: 600;' : ''}">Sessions</button>
          <button class="btn btn--ghost btn--sm ${currentTab === 'stats' ? 'is-active' : ''}" data-tab="stats" style="padding: 6px 16px; ${currentTab === 'stats' ? 'background: var(--bg-elevated); box-shadow: var(--shadow-sm); font-weight: 600;' : ''}">Stats</button>
        </div>
      </div>

      <div class="view__content" id="focus-content">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;
}

function renderContent() {
  const container = document.getElementById('focus-content');
  if (!container) return;

  if (currentTab === 'timer') {
    container.innerHTML = renderTimer();
  } else if (currentTab === 'breathing') {
    container.innerHTML = renderBreathing();
  } else if (currentTab === 'sessions') {
    container.innerHTML = renderSessions();
  } else {
    container.innerHTML = renderStats();
  }
}

function renderTimer() {
  const tasks = window.store.get('tasks') || [];
  const activeTasks = tasks.filter(t => !t.completed);
  
  let phaseColor = 'var(--accent-primary)';
  if (currentPhase === 'break') phaseColor = 'var(--accent-success)';
  if (currentPhase === 'long-break') phaseColor = 'var(--accent-warning)';

  const totalTime = currentPhase === 'focus' ? customDurationMins * 60 : 
                    currentPhase === 'break' ? (settings.pomodoroBreak || 5) * 60 : 
                    (settings.pomodoroLongBreak || 15) * 60;
  
  const progress = timeLeft / totalTime;
  const dashArray = 2 * Math.PI * 120;
  const dashOffset = dashArray * (1 - progress);

  return `
    <div style="display: flex; flex-direction: column; align-items: center; max-width: 540px; margin: 0 auto;">
      
      <!-- TASK SELECTOR -->
      <div style="width: 100%; margin-bottom: 20px;">
        <select id="focus-task-select" class="input" style="width: 100%; padding: 12px; font-size: 15px; background: var(--surface-glass); backdrop-filter: blur(10px); border: 1px solid var(--border);">
          <option value="">Free Focus (No specific task)</option>
          ${activeTasks.map(t => `<option value="${t.id}" ${t.id === selectedTaskId ? 'selected' : ''}>${t.title}</option>`).join('')}
        </select>
      </div>

      <!-- CUSTOM DURATION SELECTOR BAR -->
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px; background: var(--bg-secondary); padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-light); flex-wrap: wrap; justify-content: center;">
        <span style="font-size: var(--text-xs); font-weight: 700; color: var(--text-tertiary); text-transform: uppercase;">Duration:</span>
        ${[15, 25, 45, 60, 90].map(m => `
          <button class="btn btn--sm btn-duration-preset ${customDurationMins === m ? 'btn--primary' : 'btn--ghost'}" data-mins="${m}" style="font-size: 12px; padding: 3px 10px;">
            ${m}m
          </button>
        `).join('')}
        <div style="display: flex; align-items: center; gap: 4px; margin-left: 4px;">
          <input type="number" id="custom-mins-input" placeholder="Custom" min="1" max="300" style="width: 60px; padding: 4px 6px; font-size: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-primary);">
          <span style="font-size: 11px; color: var(--text-tertiary);">m</span>
          <button class="btn btn--secondary btn--sm" id="btn-apply-custom-mins" style="font-size: 11px; padding: 4px 8px;">Set</button>
        </div>
      </div>

      <!-- TIMER CIRCLE -->
      <div class="timer-container" style="position: relative; width: 280px; height: 280px; margin-bottom: 28px;">
        <svg width="280" height="280" viewBox="0 0 300 300" style="transform: rotate(-90deg);">
          <circle cx="150" cy="150" r="120" fill="none" stroke="var(--bg-tertiary)" stroke-width="8" />
          <circle id="timer-progress-ring" cx="150" cy="150" r="120" fill="none" stroke="${phaseColor}" stroke-width="8" 
                  stroke-linecap="round" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" 
                  style="transition: stroke-dashoffset 0.5s linear;" />
        </svg>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <div id="timer-text-display" style="font-size: 58px; font-weight: 700; font-variant-numeric: tabular-nums; line-height: 1;">${formatTime(timeLeft)}</div>
          <div style="font-size: 14px; color: ${phaseColor}; margin-top: 8px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">${currentPhase.replace('-', ' ')}</div>
        </div>
      </div>

      <!-- CONTROLS -->
      <div style="display: flex; gap: 16px; margin-bottom: 28px;">
        <button class="btn btn--ghost btn--icon" id="btn-timer-reset" style="width: 52px; height: 52px; border-radius: 50%;" title="Reset">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </button>
        <button class="btn ${timerState === 'running' ? 'btn--secondary' : 'btn--primary'}" id="btn-timer-toggle" style="min-width: 140px; height: 52px; border-radius: 26px; font-size: 16px; font-weight: 600;">
          ${timerState === 'running' ? '⏸ Pause' : '▶ Start Focus'}
        </button>
        <button class="btn btn--ghost btn--icon" id="btn-timer-skip" style="width: 52px; height: 52px; border-radius: 50%;" title="Skip">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
        </button>
      </div>

      <!-- AMBIENT SOUNDSCAPE SELECTOR -->
      <div style="width: 100%; background: var(--bg-secondary); padding: 14px; border-radius: var(--radius-lg); border: 1px solid var(--border-light);">
        <div style="font-size: var(--text-xs); text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 1px; font-weight: 700; margin-bottom: 8px; text-align: center;">
          🔊 Ambient Soundscapes
        </div>
        <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
          ${[
            { id: 'off', label: 'Off' },
            { id: 'noise', label: '🌧 Brown Rain' },
            { id: 'waves', label: '🌊 Soft Waves' },
            { id: 'forest', label: '🌲 Calm Forest' },
            { id: 'chime', label: '🔔 Solfeggio Chime' }
          ].map(s => `
            <button class="btn btn--sm ${currentSound === s.id ? 'btn--primary' : 'btn--ghost'}" data-sound="${s.id}" style="font-size: 12px; padding: 4px 12px;">
              ${s.label}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderBreathing() {
  return `
    <div style="display: flex; flex-direction: column; align-items: center; max-width: 440px; margin: 0 auto; text-align: center;">
      <h2 style="font-size: var(--text-lg); font-weight: 700; margin-bottom: 6px;">4-7-8 Calm Breathing</h2>
      <p style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: 32px;">Inhale for 4s · Hold for 7s · Exhale for 8s</p>

      <div class="breathing-circle-wrapper" style="position: relative; width: 220px; height: 220px; display: flex; align-items: center; justify-content: center; margin-bottom: 36px;">
        <div class="breathing-ring" style="position: absolute; width: 180px; height: 180px; border-radius: 50%; background: var(--accent-lavender); opacity: 0.6; transition: transform 4s ease-in-out;"></div>
        <div style="position: relative; z-index: 2; font-size: 24px; font-weight: 700; color: var(--accent-primary);" id="breathing-text">
          ${breathingPhase}
        </div>
      </div>

      <button class="btn btn--primary" id="btn-toggle-breathing" style="padding: 10px 24px; font-weight: 600;">
        ${isBreathingActive ? 'Stop Breathing Exercise' : '▶ Start Breathing'}
      </button>
    </div>
  `;
}

function renderSessions() {
  const sessions = window.store.get('focusSessions') || [];
  const sorted = [...sessions].sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  
  if (sorted.length === 0) {
    return `<div class="empty-state" style="padding: 32px 0;"><div class="empty-state__icon">⏱️</div><p class="empty-state__message">No focus sessions recorded yet.</p></div>`;
  }

  return `
    <div style="max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 12px;">
      ${sorted.map(s => {
        const t = (window.store.get('tasks') || []).find(t => t.id === s.taskId);
        return `
          <div class="card" style="padding: 14px 18px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; font-size: var(--text-sm); margin-bottom: 2px;">${t ? t.title : 'Free Focus'}</div>
              <div style="font-size: 11px; color: var(--text-tertiary);">${new Date(s.startTime).toLocaleString()}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="tag" style="background: ${s.completed ? 'rgba(82, 183, 136, 0.15)' : 'rgba(229, 57, 53, 0.15)'}; color: ${s.completed ? 'var(--accent-success)' : 'var(--accent-danger)'};">${s.completed ? 'Completed' : 'Interrupted'}</span>
              <span style="font-weight: 700; font-size: var(--text-sm); font-variant-numeric: tabular-nums;">${s.duration || 25} min</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderStats() {
  const stats = window.store.getFocusStats ? window.store.getFocusStats('today') : { totalMinutes: 0, sessionCount: 0 };
  
  return `
    <div style="max-width: 600px; margin: 0 auto;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
        <div class="stat-card card" style="padding: 20px; text-align: center;">
          <div style="font-size: 36px; font-weight: 800; color: var(--accent-primary); line-height: 1; margin-bottom: 6px;">${stats.totalMinutes || 0}</div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary);">Focus Minutes Today</div>
        </div>
        <div class="stat-card card" style="padding: 20px; text-align: center;">
          <div style="font-size: 36px; font-weight: 800; color: var(--accent-success); line-height: 1; margin-bottom: 6px;">${stats.sessionCount || 0}</div>
          <div style="font-size: var(--text-xs); color: var(--text-secondary);">Sessions Completed</div>
        </div>
      </div>
    </div>
  `;
}

export function mount() {
  settings = window.store.get('settings') || {};
  if (timerState === 'idle' && currentPhase === 'focus') {
    timeLeft = (settings.pomodoroWork || customDurationMins || 25) * 60;
  }

  unsubscribe = window.store.subscribe('settings', (newSettings) => {
    settings = newSettings;
    if (timerState === 'idle') resetTimer();
  });

  renderContent();
  bindEvents();
}

function updateTimerDisplay() {
  const timeStr = formatTime(timeLeft);
  document.title = `(${timeStr}) Planora Focus`;

  const normalTimerEl = document.getElementById('timer-text-display');
  if (normalTimerEl) normalTimerEl.textContent = timeStr;

  const totalScreenTimerEl = document.getElementById('ts-timer-display');
  if (totalScreenTimerEl) totalScreenTimerEl.textContent = timeStr;

  // Update Normal View Toggle Button
  const normalBtnToggle = document.getElementById('btn-timer-toggle');
  if (normalBtnToggle) {
    normalBtnToggle.textContent = timerState === 'running' ? '⏸ Pause' : '▶ Start Focus';
    if (timerState === 'running') {
      normalBtnToggle.classList.remove('btn--primary');
      normalBtnToggle.classList.add('btn--secondary');
    } else {
      normalBtnToggle.classList.remove('btn--secondary');
      normalBtnToggle.classList.add('btn--primary');
    }
  }

  // Update Fullscreen Overlay Toggle Button
  const tsBtnToggle = document.getElementById('ts-btn-toggle');
  if (tsBtnToggle) {
    tsBtnToggle.textContent = timerState === 'running' ? '⏸ Pause' : '▶ Start Focus';
  }

  // Update ring offset if present
  const ring = document.getElementById('timer-progress-ring');
  if (ring) {
    const totalTime = currentPhase === 'focus' ? customDurationMins * 60 : (settings.pomodoroBreak || 5) * 60;
    const progress = timeLeft / totalTime;
    const dashArray = 2 * Math.PI * 120;
    ring.style.strokeDashoffset = dashArray * (1 - progress);
  }
}

function bindEvents() {
  const root = document.querySelector('.view--focus');
  if (!root) return;

  root.querySelectorAll('[data-tab]').forEach(btn => {
    btn.onclick = (e) => {
      currentTab = e.currentTarget.dataset.tab;
      renderContent();
      bindEvents();
    };
  });

  // Duration Presets
  root.querySelectorAll('.btn-duration-preset').forEach(btn => {
    btn.onclick = (e) => {
      const mins = parseInt(e.currentTarget.dataset.mins, 10);
      setCustomDuration(mins);
      renderContent();
      bindEvents();
    };
  });

  // Custom Minutes Input
  const btnApplyCustom = root.querySelector('#btn-apply-custom-mins');
  if (btnApplyCustom) {
    btnApplyCustom.onclick = () => {
      const inp = root.querySelector('#custom-mins-input');
      if (inp && inp.value) {
        setCustomDuration(inp.value);
        renderContent();
        bindEvents();
      }
    };
  }

  const taskSelect = root.querySelector('#focus-task-select');
  if (taskSelect) {
    taskSelect.onchange = (e) => {
      selectedTaskId = e.target.value;
    };
  }

  const btnToggle = root.querySelector('#btn-timer-toggle');
  if (btnToggle) {
    btnToggle.onclick = () => {
      if (timerState === 'running') pauseTimer();
      else startTimer();
    };
  }

  const btnReset = root.querySelector('#btn-timer-reset');
  if (btnReset) btnReset.onclick = () => resetTimer();

  const btnSkip = root.querySelector('#btn-timer-skip');
  if (btnSkip) btnSkip.onclick = () => skipPhase();

  root.querySelectorAll('[data-sound]').forEach(btn => {
    btn.onclick = (e) => {
      const snd = e.currentTarget.dataset.sound;
      startAmbientSound(snd);
      renderContent();
      bindEvents();
    };
  });

  // Breathing toggle
  const btnBreathing = root.querySelector('#btn-toggle-breathing');
  if (btnBreathing) {
    btnBreathing.onclick = () => {
      isBreathingActive = !isBreathingActive;
      if (isBreathingActive) startBreathingLoop();
      else stopBreathingLoop();
      renderContent();
      bindEvents();
    };
  }

  // Fullscreen Focus Mode
  const btnFullscreen = root.querySelector('#btn-fullscreen-focus');
  if (btnFullscreen) {
    btnFullscreen.onclick = () => openTotalScreenFocus();
  }
}

function startBreathingLoop() {
  let step = 0;
  const phases = [
    { text: 'Inhale...', duration: 4000, scale: 1.4 },
    { text: 'Hold...', duration: 7000, scale: 1.4 },
    { text: 'Exhale...', duration: 8000, scale: 1.0 }
  ];

  const cycle = () => {
    if (!isBreathingActive) return;
    const current = phases[step];
    const textEl = document.getElementById('breathing-text');
    const ringEl = document.querySelector('.breathing-ring');

    if (textEl) textEl.textContent = current.text;
    if (ringEl) {
      ringEl.style.transition = `transform ${current.duration}ms ease-in-out`;
      ringEl.style.transform = `scale(${current.scale})`;
    }

    breathingTimer = setTimeout(() => {
      step = (step + 1) % 3;
      cycle();
    }, current.duration);
  };

  cycle();
}

function stopBreathingLoop() {
  if (breathingTimer) clearTimeout(breathingTimer);
  isBreathingActive = false;
}

let onFullscreenChangeHandler = null;
let onFullscreenKeydownHandler = null;

/* ── TOTAL SCREEN FULLSCREEN FOCUS OVERLAY ─────────────────── */
export function openTotalScreenFocus(taskId = null) {
  if (taskId) selectedTaskId = taskId;

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }

  let overlay = document.getElementById('total-screen-focus-overlay');
  if (overlay) overlay.remove();

  overlay = document.createElement('div');
  overlay.id = 'total-screen-focus-overlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    background: #0A0A0E;
    color: #F0F0F5;
    z-index: 999999;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 32px;
    box-sizing: border-box;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  `;

  document.body.appendChild(overlay);

  const renderOverlayHTML = () => {
    const tasks = window.store.get('tasks') || [];
    const activeTask = tasks.find(t => t.id === selectedTaskId) || { title: 'Free Deep Focus Session' };

    overlay.innerHTML = `
      <!-- Ambient Backglow -->
      <div style="position: absolute; width: 400px; height: 400px; background: radial-gradient(circle, rgba(108, 99, 255, 0.25) 0%, transparent 70%); pointer-events: none; z-index: 1;"></div>

      <div style="position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; max-width: 600px; text-align: center;">
        
        <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #8176FF; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 12px;">
          ✦ TOTAL SCREEN FOCUS MODE
        </div>

        <h1 style="font-size: clamp(1.8rem, 3.5vw, 2.5rem); font-weight: 700; margin-bottom: 20px; color: #FFFFFF; letter-spacing: -0.02em;">
          ${activeTask.title}
        </h1>

        <!-- Giant Timer Display -->
        <div id="ts-timer-display" style="font-size: clamp(5rem, 14vw, 9rem); font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1; color: #FFFFFF; letter-spacing: -0.04em; margin-bottom: 28px; text-shadow: 0 4px 30px rgba(108, 99, 255, 0.4);">
          ${formatTime(timeLeft)}
        </div>

        <!-- Controls Row -->
        <div style="display: flex; gap: 16px; margin-bottom: 32px; flex-wrap: wrap; justify-content: center;">
          <button class="btn" id="ts-btn-toggle" style="background: #6C63FF; color: #FFF; padding: 14px 36px; border-radius: 30px; font-size: 18px; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(108,99,255,0.4);">
            ${timerState === 'running' ? '⏸ Pause' : '▶ Start Focus'}
          </button>
          
          <button class="btn" id="ts-btn-complete" style="background: rgba(255,255,255,0.1); color: #FFF; padding: 14px 24px; border-radius: 30px; font-size: 16px; font-weight: 600; border: 1px solid rgba(255,255,255,0.2); cursor: pointer;">
            ✓ Complete Task
          </button>
        </div>

        <!-- Ambient Sound Toggle Bar -->
        <div style="display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.06); padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); margin-bottom: 36px;">
          <span style="font-size: 11px; color: #A0A0B0; text-transform: uppercase; font-weight: 700;">Soundscape:</span>
          ${[
            { id: 'off', label: 'Off' },
            { id: 'noise', label: '🌧 Rain' },
            { id: 'waves', label: '🌊 Waves' },
            { id: 'chime', label: '🔔 Chime' }
          ].map(s => `
            <button class="btn btn-ts-sound" data-sound="${s.id}" style="background: ${currentSound === s.id ? '#6C63FF' : 'transparent'}; color: #FFF; border: none; padding: 4px 10px; border-radius: 12px; font-size: 12px; cursor: pointer;">
              ${s.label}
            </button>
          `).join('')}
        </div>

        <!-- Exit Fullscreen Button -->
        <button class="btn" id="ts-btn-exit" style="background: transparent; color: #A0A0B0; border: none; font-size: 14px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          ⛶ Exit Total Screen Focus (ESC)
        </button>
      </div>
    `;

    document.getElementById('ts-btn-toggle')?.addEventListener('click', () => {
      if (timerState === 'running') pauseTimer();
      else startTimer();
    });

    document.getElementById('ts-btn-complete')?.addEventListener('click', () => {
      if (selectedTaskId) {
        window.store.toggleTask(selectedTaskId);
        window.app.showToast('Task marked complete!', 'success');
      }
      closeTotalScreenFocus();
    });

    document.getElementById('ts-btn-exit')?.addEventListener('click', () => {
      closeTotalScreenFocus();
    });

    overlay.querySelectorAll('.btn-ts-sound').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const snd = e.currentTarget.dataset.sound;
        startAmbientSound(snd);
        renderOverlayHTML();
      });
    });
  };

  renderOverlayHTML();

  // Handle native ESC & Fullscreen Exits
  onFullscreenChangeHandler = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      closeTotalScreenFocus();
    }
  };

  onFullscreenKeydownHandler = (e) => {
    if (e.key === 'Escape') {
      closeTotalScreenFocus();
    }
  };

  document.addEventListener('fullscreenchange', onFullscreenChangeHandler);
  document.addEventListener('webkitfullscreenchange', onFullscreenChangeHandler);
  document.addEventListener('keydown', onFullscreenKeydownHandler);
  
  if (timerState !== 'running') {
    startTimer();
  }
}

export function closeTotalScreenFocus() {
  const overlay = document.getElementById('total-screen-focus-overlay');
  if (overlay) overlay.remove();

  if (onFullscreenChangeHandler) {
    document.removeEventListener('fullscreenchange', onFullscreenChangeHandler);
    document.removeEventListener('webkitfullscreenchange', onFullscreenChangeHandler);
    onFullscreenChangeHandler = null;
  }
  if (onFullscreenKeydownHandler) {
    document.removeEventListener('keydown', onFullscreenKeydownHandler);
    onFullscreenKeydownHandler = null;
  }
  
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  } else if (document.webkitFullscreenElement && document.webkitExitFullscreen) {
    document.webkitExitFullscreen().catch(() => {});
  }
}

function startTimer() {
  if (timerState === 'running') return;
  timerState = 'running';
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      completePhase();
    } else {
      updateTimerDisplay();
    }
  }, 1000);
  updateTimerDisplay();
}

function pauseTimer() {
  if (timerState !== 'running') return;
  timerState = 'paused';
  if (timerInterval) clearInterval(timerInterval);
  updateTimerDisplay();
}

function resetTimer() {
  timerState = 'idle';
  if (timerInterval) clearInterval(timerInterval);
  setPhase(currentPhase);
  updateTimerDisplay();
}

function skipPhase() {
  timerState = 'idle';
  if (timerInterval) clearInterval(timerInterval);
  
  if (currentPhase === 'focus') {
    sessionCount++;
    const targetCount = settings.pomodoroWork || 4;
    if (sessionCount > 0 && sessionCount % targetCount === 0) {
      setPhase('long-break');
    } else {
      setPhase('break');
    }
  } else {
    setPhase('focus');
  }
  
  updateTimerDisplay();
}

function completePhase() {
  if (timerInterval) clearInterval(timerInterval);
  timerState = 'idle';
  
  if (currentPhase === 'focus') {
    const duration = customDurationMins * 60;
    const session = {
      id: window.store.generateId(),
      taskId: selectedTaskId,
      startTime: new Date(Date.now() - duration * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: duration,
      targetDuration: duration,
      type: 'pomodoro',
      completed: true,
      interrupted: false
    };
    if (window.store.addFocusSession) window.store.addFocusSession(session);
    
    window.app.showToast('Focus session completed! Time for a break.', 'success');
  } else {
    window.app.showToast('Break over! Ready to focus?', 'info');
  }

  skipPhase();
}

function setPhase(phase) {
  currentPhase = phase;
  if (phase === 'focus') timeLeft = customDurationMins * 60;
  else if (phase === 'break') timeLeft = (settings.pomodoroBreak || 5) * 60;
  else if (phase === 'long-break') timeLeft = (settings.pomodoroLongBreak || 15) * 60;
}

export function unmount() {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  stopAmbientSound();
  stopBreathingLoop();
  timerState = 'idle';
}
