# Planora — Complete UI, UX & Implementation Change Specification

## 1. Overall Product Direction

Planora should be developed as a **calm, intelligent, premium productivity workspace**, not as a conventional admin dashboard.

The current interface is a good structural starting point, but the final product must communicate three things immediately:

1. **What do I need to do today?**
2. **What should I focus on right now?**
3. **Am I making progress toward my larger goals?**

The application should connect:

**Goals → Roadmaps → Projects → Tasks → Calendar → Focus Sessions → Progress → Review**

Every major feature should share the same underlying data rather than behaving like separate independent pages.

The overall visual inspiration should be:

**Apple + Linear + Notion + Calm**

The interface should be minimal, spacious, elegant, responsive, and animated without becoming distracting.

---

# 2. Major Change to the Current UI

The current screenshot has a clean sidebar, but the main dashboard is empty and displays:

> Dashboard
> This module is coming soon.

This should be completely replaced.

The Dashboard must become the user's **personal command center**.

When the user opens Planora, they should immediately see:

* Greeting
* Date
* Today's priorities
* Recommended next task
* Focus button
* Today's tasks
* Calendar timeline
* Progress
* Active projects
* Upcoming deadlines

The user should never land on an empty screen.

---

# 3. New Dashboard Structure

The dashboard should be organized into a hierarchy.

## Header

Display:

**Good morning, [Name]**

Then:

**Saturday, August 15**

Underneath:

> "Let's make today count."

The greeting can change based on time:

* Good morning
* Good afternoon
* Good evening

The date should update automatically.

---

# 4. "Focus Now" Hero Card

This should be the most important element on the dashboard.

Example:

### Your next best task

**Finish portfolio homepage**

High Priority · 45 min · Due tomorrow

**[ Start Focus ]**

The task should be selected intelligently based on:

* Priority
* Deadline
* Estimated duration
* Current time
* Available calendar space
* Project importance
* Goal relevance

This feature should eventually become the signature Planora experience.

---

# 5. "What Should I Do Now?" Feature

Add a prominent action:

**What should I do now?**

When clicked, Planora analyzes the current schedule and recommends one task.

Example:

> **Finish portfolio homepage**
>
> 45 minutes
>
> High priority
>
> Due tomorrow
>
> Best suited for your current available time.

Buttons:

**Start Focus**

**Choose Another**

**Schedule Later**

This should be available from:

* Dashboard
* Today
* Focus
* Command Palette

---

# 6. Today's Tasks Card

Display the most important tasks for the current day.

Example:

### Today

* ○ Finish portfolio UI
* ○ Study React
* ○ Submit assignment
* ○ Review project notes

Each task should show optional metadata:

* Priority
* Time estimate
* Project
* Deadline

A completed task should animate smoothly.

Do not show every task on the dashboard.

Display approximately 3–6 important tasks and provide:

**View all tasks →**

---

# 7. Today's Progress Card

Create a compact progress section.

Example:

### Today's Progress

**72%**

Tasks
8 / 11 completed

Focus
2h 35m

The progress indicator should animate when values change.

Use a circular progress ring or elegant horizontal progress indicator.

---

# 8. Focus Statistics Card

Display:

### Focus Today

🍅 5 sessions

**2h 05m focused**

**+18% vs yesterday**

This should be connected to the actual Pomodoro session tracker.

The original specification already includes session tracking, including total focus time and completed tasks.

---

# 9. Today's Timeline

Add a timeline below the primary dashboard cards.

Example:

### Your Day

09:00
**Deep Work**

10:00
**Portfolio Design**

11:00
**Break**

11:30
**Meeting**

14:00
**React Study**

The timeline should display:

* Calendar events
* Tasks
* Focus sessions
* Breaks

This makes the dashboard immediately useful.

---

# 10. Active Projects

Display 2–4 active projects.

Example:

### Active Projects

**Portfolio Website**

78%
████████░░

**Exam Preparation**

52%
█████░░░░░

**Personal Finance**

31%
███░░░░░░

Each project card should show:

* Project name
* Progress
* Deadline
* Remaining tasks

Clicking the project opens its project workspace.

---

# 11. Upcoming Deadlines

Add a small section for upcoming important deadlines.

Example:

### Coming Up

**Tomorrow**
Portfolio submission

**Aug 19**
Project presentation

**Aug 22**
Exam

Only important deadlines should appear here.

---

# 12. Sidebar Improvements

Keep the existing sidebar concept because it is clean and understandable.

However, improve the organization.

## MAIN

* Dashboard
* Today
* Tasks
* Inbox
* Projects
* Calendar
* Focus

## PLAN

* Goals
* Roadmap

## TRACK

* Habits
* Analytics

## Bottom

* Settings
* Theme
* User profile

The current sidebar already contains most of these core destinations, so this is primarily a hierarchy and presentation improvement rather than a complete redesign.

---

# 13. Add Roadmap to the Main Product

Roadmap should not remain merely a future UI shell.

It is one of Planora's differentiating features.

The user should be able to say:

> "I want to build a portfolio website in 30 days."

Planora generates:

### 30-Day Roadmap

**Week 1 — Structure**

Research
Content
Site architecture

**Week 2 — Design**

Wireframes
UI
Responsive design

**Week 3 — Development**

Frontend
Animations
Testing

**Week 4 — Launch**

Optimization
Final review
Deployment

The user then clicks:

**Create Plan**

and Planora converts the roadmap into:

* Projects
* Milestones
* Tasks
* Calendar blocks
* Focus sessions

---

# 14. Roadmap → Calendar

This should become a major product interaction.

The roadmap should not simply be a visual timeline.

It should be actionable.

Example:

**Goal**

Learn React

↓

**Roadmap**

4 weeks

↓

**Week 1**

Components

↓

**Tasks**

Study components — 45 min

Practice props — 60 min

Build mini project — 90 min

↓

**Calendar**

Automatically suggest available time slots.

The user must approve the generated schedule before it is committed.

---

# 15. Today Page

Create a dedicated Today page.

It should be more detailed than Dashboard.

Structure:

### Today

**Top priorities**

1. Important task
2. Important task
3. Important task

### Timeline

08:00
09:00
10:00
11:00
...

### Tasks

All tasks scheduled for today.

### Focus

Current/recommended focus session.

### Evening Review

At the end of the day:

> "You completed 7 of 9 tasks."

Then provide:

**Reschedule remaining tasks**

---

# 16. Tasks Page

The Tasks page should be powerful but clean.

Support:

* Create
* Edit
* Delete
* Complete
* Subtasks
* Priority
* Due date
* Start date
* Estimated duration
* Project
* Tags
* Notes
* Energy level

Allow:

* Filtering
* Sorting
* Searching
* Drag-and-drop ordering
* Inline editing

The current specification already defines these task fields and interactions.

---

# 17. Quick Add Task

Create a global floating/keyboard-friendly quick-add action.

User clicks:

**+**

Then enters:

> Finish homepage tomorrow 45m high priority

Planora should eventually understand:

* Task
* Deadline
* Duration
* Priority

For the first implementation, structured fields can be used.

Natural-language parsing can be added later.

---

# 18. Inbox

Keep Inbox extremely simple.

It should be the place where users dump things without organizing them.

Example:

> "Need to research hosting."

> "Idea for portfolio."

> "Call Alex."

Each item can later become:

* Task
* Note
* Event
* Project item

Add:

**Process Inbox**

to help the user organize captured items.

---

# 19. Project Workspace

Each project should have:

### Header

Project name
Description
Deadline
Progress

### Tabs

* Overview
* Tasks
* Board
* Timeline
* Calendar
* Notes

### Overview

Show:

* Progress
* Milestones
* Upcoming tasks
* Deadline
* Focus hours

---

# 20. Kanban Board

Use:

**Backlog → To Do → In Progress → Review → Done**

Cards should support:

* Dragging
* Priority
* Deadline
* Assignee later
* Project
* Pomodoro count

The existing specification already calls for these Kanban states and drag interactions.

---

# 21. Calendar Redesign

Calendar should combine everything.

Display:

* Events
* Tasks
* Focus sessions
* Deadlines
* Habits

Views:

* Month
* Week
* Day
* Agenda

The user should not have to switch between a "task calendar" and an "event calendar."

---

# 22. Time Blocking

Users should be able to drag a task into the calendar.

Example:

Task:

**Study React — 60 min**

Drag onto:

**14:00–15:00**

The task becomes a scheduled calendar block.

Dragging it elsewhere updates its schedule.

---

# 23. Weekly Planner

The weekly planner should have:

Monday → Sunday

Each day shows:

* Tasks
* Events
* Deadlines
* Focus sessions

Allow users to drag tasks between days.

Add:

**Plan My Week**

This opens a planning assistant showing:

* Unfinished tasks
* Upcoming deadlines
* Active projects
* Goals

The user can then distribute them across the week.

---

# 24. Monthly Planner

Show:

### August 2026

**Top goals**

* Finish portfolio
* Complete course
* Exercise 20 times

**Major projects**

* Portfolio
* Exam preparation

**Important dates**

* Submission
* Presentation
* Exam

Then display monthly completion progress.

---

# 25. Pomodoro / Focus Page

The Focus page should feel completely different from the normal application.

When entering Focus Mode:

* Hide sidebar
* Hide unnecessary controls
* Darken or soften background
* Center the task
* Large circular timer
* Progress ring
* Pause
* Complete
* Exit Focus

Example:

**Finish Portfolio Homepage**

**24:32**

`████████████░░`

**Pause**

---

# 26. Pomodoro Modes

Support:

* 15 / 5
* 25 / 5
* 50 / 10
* 90 / 20
* Custom

Also provide:

* Pomodoro
* Deep Focus
* Stopwatch
* Countdown

These are already part of the proposed Focus module and should remain.

---

# 27. Ambient Focus Environments

Add optional environments:

**Forest**

**Ocean**

**Rain**

**Night Sky**

**Minimal**

The animations should be slow and subtle.

The environment must never interfere with the timer or task.

---

# 28. Animation System

The application needs much more motion than the current screenshot, but the motion must remain calm.

Use animation for:

* Page transitions
* Task completion
* Cards
* Buttons
* Progress
* Calendar interactions
* Dragging
* Modals
* Notifications
* Pomodoro
* Sidebar
* Theme changes

The existing specification's principles of interruptible motion, direct manipulation, spring behavior, and reduced-motion support should remain.

---

# 29. Avoid Over-Engineering Animation

Do not create a custom physics engine for every interaction.

Use:

* CSS transitions for simple interactions
* Web Animations API for more complex transitions
* Spring-style motion where appropriate
* Pointer-driven physics for actual drag interactions

Use real physics mainly for:

* Dragging
* Sheets
* Panels
* Calendar movement

Simple buttons do not need physics.

---

# 30. Task Completion Animation

When the user completes a task:

1. Checkbox animates.
2. Checkmark appears.
3. Task content subtly changes.
4. Progress indicator updates.
5. Task moves/fades naturally.
6. Small celebratory effect appears.

Do not use excessive confetti.

The feeling should be:

**"Nice, progress made."**

not:

**"GAME ACHIEVEMENT UNLOCKED!!!"**

---

# 31. Typography

Use a premium modern font system.

Recommended:

* Inter
* SF Pro where available
* system UI fallback

Headings should have slightly tighter tracking.

Body text should remain comfortable and readable.

Avoid excessive font weights.

Use:

* Regular
* Medium
* Semibold

for most UI.

---

# 32. Color System

Keep the current general palette.

### Light

Warm off-white background
Soft cream surfaces
Muted indigo accent
Soft lavender secondary
Sage success
Peach warning
Soft coral danger

### Dark

Charcoal background
Dark elevated surfaces
Soft lavender/indigo accent
Muted text

The existing color specification is already aligned with this direction.

---

# 33. Reduce Visual Noise

Do not put every color everywhere.

The interface should primarily use:

**Background + Surface + Text + One Accent**

Semantic colors should only appear when necessary.

For example:

* Red = genuinely urgent
* Orange = warning
* Green = success
* Purple = primary action

This will make Planora feel much more premium.

---

# 34. Cards

Avoid making every tiny section a floating card.

Use cards only when they provide meaningful grouping.

Good:

**Focus Now**

**Today's Progress**

**Active Project**

Bad:

Every individual task surrounded by a giant shadowed box.

Use whitespace and subtle dividers to create hierarchy.

---

# 35. Glass / Translucent Materials

Use glass effects selectively.

Good places:

* Sidebar
* Floating command palette
* Modal
* Focus overlay
* Floating toolbar
* Notification center

Do not make the entire application transparent.

The current specification's translucent-material approach can remain, but it should be used strategically.

---

# 36. Responsive Design

Desktop:

Sidebar + full dashboard.

Tablet:

Collapsible sidebar.

Mobile:

Bottom navigation.

Mobile navigation:

**Home | Today | Tasks | Focus | More**

The current specification already calls for desktop sidebar, tablet collapse, and mobile bottom navigation.

---

# 37. Mobile Focus Mode

Focus Mode should be especially good on mobile.

Show:

Task

Timer

Progress

Pause

Complete

Exit

Nothing unnecessary.

---

# 38. Command Palette

Keep:

**Cmd/Ctrl + K**

It should search:

* Tasks
* Projects
* Goals
* Events
* Notes

And support actions:

* New task
* New project
* New event
* Start focus
* Open calendar
* Open today's plan

The existing specification already defines this interaction.

---

# 39. Smart Reminders

Notifications should be contextual.

Instead of constantly notifying users:

> "Task due tomorrow."

Use:

> "Your portfolio deadline is tomorrow. You still have 2 hours of work remaining. Schedule a focus session?"

This should eventually become part of the intelligence layer.

---

# 40. Smart Rollover

When a task isn't completed:

Do not automatically move everything to tomorrow.

Instead:

> **3 tasks weren't completed.**

Options:

**Schedule Tomorrow**

**Schedule This Week**

**Choose Date**

**Keep in Backlog**

**Delete**

The system can recommend the best option.

---

# 41. Goals

Goals should connect directly to projects and tasks.

Hierarchy:

**Long-term**

↓

**Yearly**

↓

**Quarterly**

↓

**Monthly**

↓

**Weekly**

↓

**Daily**

The existing goals design already uses this hierarchy.

---

# 42. Analytics

Do not make analytics feel like a business dashboard.

Instead of dozens of charts, show useful insights.

Example:

### This Week

**14h 20m Focused**

**42 Tasks Completed**

**82% Completion Rate**

Then:

> "You're most productive between 9 AM and 12 PM."

> "You have been over-scheduling Tuesdays."

Insights are more valuable than charts alone.

---

# 43. Habits

Keep habits lightweight.

Show:

* Habit
* Today's status
* Streak
* Weekly consistency

Do not let the habit system overwhelm the core task/productivity system.

---

# 44. Beginner / Advanced Mode

This should be retained.

### Beginner

Show:

* Home
* Today
* Tasks
* Projects
* Calendar
* Focus

### Advanced

Reveal:

* Roadmap
* Analytics
* Habits
* Energy planning
* Smart scheduling
* Advanced project views

This prevents feature overload.

---

# 45. Empty States

Every page needs a beautiful empty state.

Do not display:

> "This module is coming soon."

Instead:

### No Projects Yet

> Start with something you're working toward.

**+ Create Project**

Similarly:

### No Tasks Today

> Your day is clear. Enjoy the space.

**+ Add Task**

Empty states should feel encouraging.

---

# 46. Loading States

Use skeleton loading or subtle animated placeholders where appropriate.

Avoid large blank white spaces.

---

# 47. Error States

Errors should be friendly.

Example:

> Something didn't save.

**Try again**

Do not expose raw JavaScript errors to users.

---

# 48. Data Architecture

Keep the existing central store architecture.

All major entities should have relationships:

```text
Goal
 ↓
Roadmap
 ↓
Project
 ↓
Milestone
 ↓
Task
 ↓
Calendar Block
 ↓
Focus Session
```

This relationship is critical.

If a task is completed:

* Project progress updates
* Goal progress updates
* Daily progress updates
* Weekly progress updates
* Analytics update

All automatically.

---

# 49. Local Storage

Keep localStorage for the first version.

Persist:

* Tasks
* Projects
* Goals
* Calendar events
* Focus sessions
* Habits
* Settings
* Theme
* Preferences

The existing implementation already specifies localStorage-backed reactive state.

---

# 50. Architecture Improvement

Keep the modular JavaScript architecture, but organize it around features.

Recommended:

```text
js/
├── app.js
├── store.js
├── router.js
├── utils.js
│
├── core/
│   ├── dates.js
│   ├── storage.js
│   └── notifications.js
│
├── features/
│   ├── tasks/
│   ├── projects/
│   ├── planner/
│   ├── calendar/
│   ├── focus/
│   ├── goals/
│   └── reminders/
│
└── components/
    ├── modal.js
    ├── task-card.js
    ├── command-palette.js
    └── notification-center.js
```

This will make future development easier.

---

# 51. Implementation Priority

Do not implement everything simultaneously.

## Phase 1 — Core Product

Build completely:

1. Dashboard
2. Today
3. Tasks
4. Inbox
5. Projects
6. Calendar
7. Daily planner
8. Weekly planner
9. Focus/Pomodoro
10. Goals
11. Reminders
12. Themes
13. Responsive design
14. localStorage

The goal is a fully usable productivity application.

---

# 52. Phase 2 — Planora Intelligence

Build:

1. Roadmap generation
2. Roadmap → calendar
3. Smart task prioritization
4. "What should I do now?"
5. Smart scheduling
6. Overload detection
7. Smart rollover
8. Weekly review
9. Monthly review
10. Energy-based planning
11. Analytics
12. Habit tracker

This is where Planora becomes genuinely differentiated.

---

# 53. Phase 3 — Advanced Platform

Later add:

1. AI assistant
2. Natural-language task creation
3. Google Calendar integration
4. Apple Calendar integration
5. Outlook integration
6. Cloud sync
7. Offline PWA
8. Collaboration
9. Advanced analytics
10. Cross-device synchronization

The existing specification currently defers these capabilities, which is appropriate.

---

# 54. The Most Important User Flow

The entire application should be designed around this flow:

### Step 1

User creates a goal.

**Build my portfolio.**

↓

### Step 2

Planora creates a roadmap.

**30 days**

↓

### Step 3

Roadmap becomes project milestones.

↓

### Step 4

Milestones become tasks.

↓

### Step 5

Tasks are placed into the weekly plan.

↓

### Step 6

Tasks become calendar blocks.

↓

### Step 7

User clicks:

**Start Focus**

↓

### Step 8

Pomodoro begins.

↓

### Step 9

Task completes.

↓

### Step 10

Progress automatically updates everywhere.

↓

### Step 11

Weekly review evaluates progress.

↓

### Step 12

Planora adjusts the next week.

This should be the fundamental architecture of Planora.

---

# 55. Signature Planora Experience

Planora needs one interaction users remember.

That interaction should be:

## "Plan my goal."

User writes:

> "I want to learn Python in 60 days."

Planora asks:

* How many hours per week?
* Current experience?
* Target outcome?
* Preferred days?
* Preferred focus time?

Then creates:

**60-Day Roadmap**

→ Monthly goals

→ Weekly milestones

→ Projects

→ Tasks

→ Calendar schedule

→ Focus sessions

The user clicks:

**Accept Plan**

and the entire system is populated.

This should eventually become the core differentiator of Planora.

---

# 56. Visual Personality

The final product should feel:

**Calm**

**Intelligent**

**Premium**

**Friendly**

**Focused**

**Minimal**

It should NOT feel:

* Corporate
* Overly colorful
* Gamified
* Cluttered
* Mechanical
* Like an admin dashboard

---

# 57. Animation Personality

Animations should communicate:

**Flow**

rather than:

**Flashiness**

Use:

* Soft fades
* Gentle slides
* Spring interactions
* Smooth progress
* Subtle scaling
* Breathing motion
* Fluid drag-and-drop

Avoid:

* Constant bouncing
* Excessive particles
* Long transitions
* Huge animations
* Distracting page effects

---

# 58. Final Design Target

The final Planora interface should look like a combination of:

**Apple's refinement**

*

**Linear's clean information architecture**

*

**Notion's flexibility**

*

**Calm's peaceful atmosphere**

*

**A smart personal assistant**

The current screenshot is therefore **the skeleton, not the final design**.

Keep its:

* Sidebar
* Basic navigation
* Branding
* Whitespace
* General simplicity

But transform the main experience from:

**"Dashboard / module coming soon"**

into:

**"Here is what matters today, here is what you should focus on, and here is how you're progressing toward your goals."**

---

# Final Product Principle

Every feature should answer one of these questions:

### Where am I going?

**Goals / Roadmap**

### What am I building?

**Projects**

### What do I need to do?

**Tasks**

### When should I do it?

**Calendar / Planner**

### What should I do right now?

**Focus / Smart Recommendation**

### Am I making progress?

**Dashboard / Analytics**

### What should I change?

**Weekly / Monthly Review**

That gives Planora a coherent product instead of a collection of productivity features.

## The final core loop

**Goal → Roadmap → Project → Task → Schedule → Focus → Complete → Review → Improve**

That loop should be the foundation of the entire implementation.

