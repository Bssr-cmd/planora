# PLANORA KNOWLEDGE HUB
## Complete Obsidian-Style Notes & Knowledge Graph Implementation Specification

You are extending an existing productivity application called **Planora**.

Planora is an all-in-one productivity application containing:

- Dashboard
- Today
- Tasks
- Inbox
- Projects
- Calendar
- Focus / Pomodoro
- Goals
- Roadmap
- Habits
- Analytics
- Settings

The application uses a calm, premium visual style inspired by:

**Apple + Linear + Notion + Calm + Obsidian's knowledge-linking philosophy**

Your task is to implement a complete **Obsidian-style Notes and Knowledge Hub** inside Planora.

IMPORTANT:

**Do NOT build a separate standalone notes application.**

The Notes system must become deeply integrated with Planora's existing:

**Goals → Roadmaps → Projects → Tasks → Calendar → Focus → Notes**

ecosystem.

The final result should feel like:

> **Planora + Obsidian-style knowledge management**

rather than an Obsidian clone.

---

# 1. CORE PRODUCT IDEA

Planora Notes should be a **personal knowledge management system** where users can:

- Write notes
- Organize notes
- Search notes
- Link notes together
- Use `[[Wiki Links]]`
- Automatically generate backlinks
- Use tags
- Create folders
- Create daily notes
- Create templates
- Link notes to tasks
- Link notes to projects
- Link notes to goals
- View related knowledge
- Explore a visual knowledge graph
- Search across their entire knowledge base

The fundamental concept is:

> **Write → Link → Connect → Discover → Apply**

The notes system should help users connect knowledge with actual productivity.

For example:

```text
Goal:
Become a Full-Stack Developer

        ↓

Project:
Build Portfolio

        ↓

Notes:
React Architecture
Authentication
Database Design
Deployment

        ↓

Tasks:
Build authentication
Create database schema
Deploy application

        ↓

Calendar:
Tuesday 10:00–11:00

        ↓

Focus:
45-minute Pomodoro
```

Everything should be connected through shared data.

---

# 2. IMPORTANT DESIGN PRINCIPLE

Do not copy Obsidian's visual design.

Copy the **knowledge model**, not the appearance.

Planora should retain its own visual identity:

- Warm off-white backgrounds
- Soft lavender
- Muted indigo
- Sage green
- Subtle gradients
- Translucent surfaces
- Elegant typography
- Soft shadows
- Rounded but restrained corners
- Smooth spring-like animations
- Calm transitions
- Minimal visual noise

The Notes section should feel like a natural part of Planora.

---

# 3. ADD NOTES TO THE SIDEBAR

Update the existing Planora sidebar.

Recommended structure:

```text
MAIN

Home
Today
Tasks
Inbox
Projects
Calendar
Focus

PLAN

Goals
Roadmap

KNOWLEDGE

Notes

TRACK

Habits
Analytics

────────────

Settings
Toggle Theme
```

Use the same icon style and typography as the existing Planora interface.

Do not redesign the entire sidebar.

Add Notes naturally into the existing navigation.

---

# 4. NOTES WORKSPACE

Clicking **Notes** should open a dedicated Notes workspace.

Desktop layout:

```text
┌────────────────┬────────────────────────────────┬──────────────────┐
│ NOTE NAVIGATION│ NOTE EDITOR                    │ CONTEXT          │
│                │                                │                  │
│ Search         │ React Architecture             │ Backlinks        │
│                │                                │                  │
│ All Notes      │ # React Architecture           │ Outgoing Links   │
│ Recent         │                                │                  │
│ Favorites      │ React is...                    │ Related Notes    │
│ Daily Notes    │                                │                  │
│                │ ## Components                  │ Tags             │
│ Folders        │                                │                  │
│                │ [[React]]                      │ Related Tasks    │
│ Projects       │ [[Next.js]]                    │                  │
│                │                                │ Related Project  │
└────────────────┴────────────────────────────────┴──────────────────┘
```

Use a three-column layout on desktop.

On tablet:

- Collapse the right context panel.
- Keep note navigation collapsible.

On mobile:

- Show one panel at a time.
- Use navigation buttons to switch between:
  - Notes
  - Editor
  - Context

The editor must remain comfortable to use on mobile.

---

# 5. LEFT NOTES NAVIGATION

The left panel should contain:

## Search

A prominent search input.

Placeholder:

> Search notes...

Support keyboard shortcut:

**Cmd/Ctrl + K**

for global search.

Also support:

**Cmd/Ctrl + Shift + N**

for new note.

---

## Quick Access

Display:

- All Notes
- Recent
- Favorites
- Pinned
- Daily Notes

---

## Folders

Example:

```text
Folders

▾ Personal
▾ Learning
▾ Projects
▾ Ideas
▾ Resources
```

Allow:

- Create folder
- Rename folder
- Delete folder
- Move note into folder
- Drag note into folder

Avoid deeply nested folder systems.

Folders are optional.

Links and tags remain more important than folders.

---

# 6. NOTE LIST

The note list should show:

- Note title
- Short preview
- Last modified time
- Tags
- Favorite state

Example:

```text
React Server Components
React components rendered on...
2 min ago

#react #nextjs
```

When selected:

- Apply subtle lavender background.
- Smooth transition.
- Do not use a heavy border.

---

# 7. NOTE DATA MODEL

Create a dedicated Notes data model.

Example:

```js
{
  id: "note_001",
  title: "React Server Components",

  content: "# React Server Components\n\n...",

  createdAt: "2026-08-15T09:00:00Z",
  updatedAt: "2026-08-15T12:00:00Z",

  tags: [
    "react",
    "nextjs",
    "web-development"
  ],

  folderId: "folder_learning",

  projectId: "project_portfolio",

  goalId: null,

  taskIds: [],

  pinned: false,
  favorite: false,

  dailyNote: false,

  templateId: null
}
```

Do NOT make notes merely a property of projects or tasks.

Notes must be first-class entities.

---

# 8. MARKDOWN AS THE SOURCE OF TRUTH

The note content should be stored as Markdown.

Example:

```markdown
# React Server Components

React Server Components allow components to run on the server.

## Benefits

- Smaller client bundle
- Server-side data fetching
- Better performance

## Related

[[React]]
[[Next.js]]
[[Portfolio Architecture]]

#react
#web-development
```

Markdown should remain the underlying data format even if the editor visually renders rich formatting.

This gives the system flexibility and makes the notes portable.

---

# 9. EDITOR

Create a high-quality Markdown editor.

The editor should support:

- Headings
- Bold
- Italic
- Strikethrough
- Bulleted lists
- Numbered lists
- Checklists
- Quotes
- Code blocks
- Links
- Horizontal rules
- Tables
- Images
- Callouts

Provide three editor modes:

### Edit

Raw Markdown.

### Preview

Rendered Markdown.

### Split

Markdown on the left and rendered preview on the right.

Default to:

**Edit mode**

for simplicity.

---

# 10. AUTOSAVE

Notes must autosave automatically.

Do not require a Save button.

Display a tiny status:

```text
Saving...
```

then:

```text
Saved
```

Autosave should be debounced.

Do not save on every keystroke.

Suggested debounce:

**300–700ms**

Do not interrupt typing.

---

# 11. NEW NOTE

Provide:

**+ New Note**

When clicked:

1. Create a new note.
2. Give it a temporary title.
3. Focus the editor.
4. Place cursor in title.
5. Save automatically.

Default title:

> Untitled Note

If the user starts writing and doesn't specify a title, derive the title from the first heading or first meaningful line.

---

# 12. WIKI LINKS

Implement Obsidian-style links:

```text
[[React]]
```

The system must recognize these links automatically.

When rendered, display:

**React**

as a clickable internal link.

Clicking it opens the React note.

---

# 13. WIKI LINK AUTOCOMPLETE

When the user types:

```text
[[
```

show a floating autocomplete menu.

Example:

```text
Link to note

Search notes...

React
React Hooks
React Server Components
Next.js
Portfolio Architecture
JavaScript
```

Typing:

```text
[[rea
```

should filter results.

Keyboard navigation must work:

- Arrow Up
- Arrow Down
- Enter
- Escape

Pressing Enter inserts:

```text
[[React]]
```

---

# 14. CREATE MISSING NOTE

If the user enters:

```text
[[JavaScript Closures]]
```

and the note doesn't exist, show:

```text
JavaScript Closures

Note not found.

+ Create note
```

Clicking Create Note should:

1. Create the note.
2. Give it the title "JavaScript Closures".
3. Save it.
4. Open it.
5. Replace the unresolved link with a valid internal link.

---

# 15. LINK ALIASES

Support later:

```text
[[React Server Components|RSC]]
```

The link should display:

**RSC**

but open:

**React Server Components**

Do not prioritize this above normal Wiki Links.

---

# 16. OUTGOING LINKS

For the currently open note, detect all:

```text
[[...]]
```

links.

Display:

### Outgoing Links

- React
- Next.js
- Portfolio Architecture

Each item must be clickable.

---

# 17. BACKLINKS

Automatically calculate backlinks.

If:

```text
React Server Components
```

contains:

```text
[[React]]
```

then the React note should automatically display:

### Backlinks

**React Server Components**

with a small content preview.

Do NOT require the user to manually maintain backlinks.

Backlinks should be derived from the actual note contents.

---

# 18. BACKLINK DATA

Do not treat backlinks as the primary source of truth.

The source of truth is:

```text
Note content
```

The application parses outgoing Wiki Links.

Then backlinks are derived.

For example:

```text
Note A
  ↓
[[React]]

Note B
  ↓
[[React]]
```

Opening React automatically finds:

```text
Note A
Note B
```

as backlinks.

For larger databases, backlinks can be cached for performance.

---

# 19. TAGS

Support tags:

```text
#react
#javascript
#learning
#project
```

Tags should be automatically extracted from note content.

Display tags in the context panel.

Clicking a tag opens a filtered list of all notes containing it.

---

# 20. TAG AUTOCOMPLETE

When typing:

```text
#
```

inside a suitable context, show existing tags.

Example:

```text
Tags

#react
#javascript
#web-development
#learning
#portfolio
```

Allow creating a new tag.

---

# 21. DAILY NOTES

Implement automatic daily notes.

Every date can have a corresponding note.

Example:

```text
Daily Notes

August 13
August 14
August 15
```

When the user clicks:

**Today's Note**

create/open:

```text
# Saturday, August 15, 2026
```

---

# 22. DAILY NOTE CONTENT

A daily note should optionally include:

```markdown
# Saturday, August 15, 2026

## Today's Priorities

- [ ] Finish portfolio
- [ ] Study React

## Schedule

09:00 — Deep Work
10:00 — Portfolio
11:30 — Team Sync

## Notes

Write anything here...

## Reflection

What went well?

## Tomorrow

What needs to continue?
```

The task and calendar sections should ideally be generated from actual Planora data rather than duplicated manually.

---

# 23. NOTE TEMPLATES

Create a Templates system.

Initial templates:

## Daily Note

## Meeting Note

## Project Note

## Learning Note

## Research Note

## Book Note

## Idea

## Journal Entry

Example Learning template:

```markdown
# {{title}}

## Concept

## Explanation

## Example

## Questions

## Key Takeaways

## Related Notes

#learning
```

Template variables:

- `{{title}}`
- `{{date}}`
- `{{time}}`
- `{{project}}`

---

# 24. PROJECT INTEGRATION

Projects must have a Notes section.

Example:

```text
Portfolio Website

Overview
Tasks
Board
Calendar
Notes
```

The Notes tab should display:

```text
Project Notes

Architecture
Design System
React Decisions
Deployment
Research
Meeting Notes
```

A note can be associated with a project without duplicating the note.

---

# 25. TASK INTEGRATION

When opening a task, provide:

### Related Notes

Example:

```text
Finish authentication

Related Notes

Authentication Architecture
JWT Notes
Security Checklist

+ Link Note
```

The user can attach existing notes.

Also provide:

**Create Note**

which creates a note automatically associated with the task/project.

---

# 26. GOAL INTEGRATION

Goals should be able to show relevant knowledge.

Example:

```text
Goal

Become a Full-Stack Developer

Knowledge

React
Node.js
Database Design
System Design
Authentication
```

Notes can be explicitly associated with goals.

---

# 27. RELATED NOTES

Planora should intelligently show related notes.

When viewing:

**React Server Components**

display:

### Related Notes

- React
- Next.js
- Server-side Rendering
- Portfolio Architecture

Initially determine relationships using:

1. Explicit Wiki Links
2. Shared tags
3. Shared project
4. Shared goal

Later, AI-based semantic similarity can be added.

Do not require AI for the initial implementation.

---

# 28. KNOWLEDGE GRAPH

Create a dedicated:

**Graph**

view inside Notes.

The graph should visualize relationships between notes.

Example:

```text
              React
             /     \
            /       \
       Next.js      Hooks
          |           |
          |           |
      Portfolio ── Components
```

Nodes represent notes.

Lines represent Wiki Links.

---

# 29. GRAPH REQUIREMENTS

Use a 2D interactive graph.

Support:

- Pan
- Zoom
- Click node
- Hover node
- Drag node
- Search
- Highlight connected nodes
- Focus current note

Do NOT build a 3D graph.

Keep it calm and readable.

---

# 30. LOCAL GRAPH

When viewing a note, allow:

**Open Local Graph**

Only display:

- Current note
- Direct links
- Backlinks
- Nearby connected notes

This should be the default graph.

---

# 31. FULL GRAPH

Also provide:

**Full Knowledge Graph**

Show all notes.

Unrelated nodes should be visually muted.

The currently selected node should be highlighted.

---

# 32. GRAPH FILTERING

Allow filtering by:

- Notes
- Projects
- Tasks
- Goals

Eventually:

```text
● Notes
■ Projects
◆ Goals
□ Tasks
```

This turns the graph into a true **Planora productivity graph**.

---

# 33. PRODUCTIVITY KNOWLEDGE GRAPH

Eventually the graph should be able to represent:

```text
Goal
  ↓
Project
  ↓
Task
  ↓
Note
  ↓
Related Note
```

Example:

```text
             Goal
              │
              ▼
        Learn React
              │
              ▼
       Portfolio Project
          /          \
         /            \
      Task            Note
   Build UI      React Architecture
                      │
                      ▼
                    React
```

This is a major differentiator.

---

# 34. SLASH COMMANDS

Inside the editor, typing:

```text
/
```

should display:

```text
Insert

Heading 1
Heading 2
Heading 3
Bullet List
Numbered List
Checklist
Quote
Code Block
Table
Divider
Callout
Link
Image
```

Keyboard navigation must work.

---

# 35. CALLOUTS

Support:

- Info
- Tip
- Warning
- Important
- Question

Example:

```markdown
> [!TIP]
> Server Components can reduce client-side JavaScript.
```

Render these beautifully using Planora's design language.

---

# 36. CODE BLOCKS

Support fenced code:

```text
```js
function hello() {
  console.log("Hello");
}
```
```

Render with syntax highlighting.

Do not allow code styling to break the overall visual design.

---

# 37. IMAGES AND ATTACHMENTS

Eventually allow:

- Drag-and-drop images
- Paste images
- Attach files
- Embed images

For the initial local version, store references appropriately.

Do not place large binary data directly into localStorage.

Use IndexedDB or an appropriate browser storage mechanism for larger content.

---

# 38. SEARCH SYSTEM

Global Notes search must search:

- Title
- Content
- Tags
- Folder
- Linked notes

Search results should show:

```text
React Server Components

...components can run on the server...

#react #nextjs
```

Highlight matching terms.

---

# 39. ADVANCED SEARCH

Later support filters:

```text
tag:react
project:portfolio
folder:learning
```

and combinations:

```text
tag:react project:portfolio
```

Do not make this necessary for normal users.

---

# 40. COMMAND PALETTE INTEGRATION

Extend the existing Planora command palette.

Add:

```text
New Note
Search Notes
Open Recent Note
Open Favorites
Open Daily Note
Open Knowledge Graph
Create Note from Template
```

Existing Planora commands must continue working.

---

# 41. NOTE FAVORITES

Allow:

**Favorite**

and:

**Unfavorite**

Favorites appear under Quick Access.

---

# 42. PINNED NOTES

Allow users to pin important notes.

Pinned notes should appear at the top of the note navigation.

Example:

```text
Pinned

Project Architecture
Important Ideas
Current Study Plan
```

---

# 43. RECENT NOTES

Automatically track recently opened notes.

Show:

```text
Recent

React
Portfolio Architecture
JavaScript
Meeting Notes
```

Limit the visible list to a reasonable number.

---

# 44. NOTE CONTEXT PANEL

The right-side context panel should contain:

### Backlinks

### Outgoing Links

### Related Notes

### Tags

### Related Tasks

### Project

### Goal

### Created

### Last Modified

Do not show everything if empty.

The panel should dynamically adapt to the selected note.

---

# 45. NOTE HEADER

At the top of the editor:

```text
React Server Components

[★ Favorite] [••• More]
```

Below:

```text
#react  #nextjs  #learning
```

Then:

```text
Last edited 2 minutes ago · Saved
```

Keep metadata subtle.

---

# 46. NOTE CONTEXT ACTIONS

The More menu should contain:

- Rename
- Move
- Duplicate
- Favorite
- Pin
- Add to Project
- Add to Goal
- Export
- Delete

Deletion must require confirmation.

---

# 47. NOTE EXPORT

Eventually support:

- Markdown
- HTML
- PDF

For the first implementation, Markdown export is enough.

---

# 48. DATA STORAGE

For the initial application:

Use the existing Planora persistence architecture.

Notes must persist across page refreshes.

For small data, localStorage is acceptable.

However, design the Notes repository so it can later move to IndexedDB without rewriting the UI.

Recommended abstraction:

```text
UI
 ↓
Notes Service
 ↓
Storage Adapter
 ↓
localStorage / IndexedDB
```

Do not directly access localStorage from every component.

---

# 49. SEARCH INDEX

Maintain a lightweight search index.

When a note changes:

1. Save note.
2. Parse Wiki Links.
3. Parse tags.
4. Update search index.
5. Update backlink relationships.
6. Update graph relationships.
7. Update related entities.

This should happen automatically.

---

# 50. LINK PARSER

Whenever a note changes, detect:

```text
[[React]]
[[Next.js]]
[[Portfolio Architecture]]
```

Extract the link targets.

Normalize names.

Resolve them against existing notes.

Do not break links when a note is renamed.

This is important.

If:

```text
[[React]]
```

is renamed to:

```text
React Fundamentals
```

the system should update references or maintain a stable note ID behind the scenes.

Never rely purely on titles as permanent identifiers.

---

# 51. STABLE NOTE IDS

Every note must have a permanent internal ID.

For example:

```text
note_8d72a
```

The visible title can change.

Links should internally reference the stable ID.

This prevents broken relationships when notes are renamed.

---

# 52. NOTE RENAMING

If:

```text
React
```

becomes:

```text
React Fundamentals
```

Planora should automatically update:

- Backlinks
- Wiki Links
- Graph relationships
- Related note references

The user should never have to manually repair links.

---

# 53. NOTE DELETION

When deleting a note:

Show:

> Delete "React"?

Then:

> 7 notes currently link to this note.

Options:

**Delete**

**Cancel**

Do not silently destroy linked knowledge.

After deletion, unresolved Wiki Links should remain visible rather than silently disappearing.

---

# 54. PERFORMANCE REQUIREMENTS

The Notes system should remain responsive with:

- 100 notes
- 500 notes
- 1,000 notes

The editor must never lag because of link parsing.

Use debounced parsing.

Do not recalculate the entire graph on every keystroke.

Only update relationships after the note changes.

---

# 55. MOBILE EXPERIENCE

On mobile:

Default to the note editor.

Top bar:

```text
← Notes        •••
```

A button can open:

- Note list
- Backlinks
- Related information

Use bottom sheets for context.

Do not attempt to display three columns simultaneously on mobile.

---

# 56. ANIMATIONS

The Notes system should use Planora's existing motion language.

Use subtle animations for:

- Opening a note
- Switching notes
- Opening search
- Opening backlinks
- Opening graph
- Creating a note
- Saving
- Linking notes
- Opening command palette

Use:

- Fade
- Translate
- Scale
- Spring-like easing

Avoid long animations.

Everything should feel immediate.

---

# 57. REDUCED MOTION

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

When enabled:

- Remove graph animations
- Remove large transitions
- Replace movement with fades
- Reduce editor UI motion

Accessibility must remain intact.

---

# 58. EMPTY STATES

Never show:

> Module coming soon.

For Notes:

### No Notes Yet

> Your knowledge space is empty.

> Capture your first idea, lesson, or project note.

**+ Create Note**

For Backlinks:

> No notes link here yet.

For Graph:

> Create a few linked notes to see your knowledge graph grow.

---

# 59. DEMO DATA

If the application uses demo data, use realistic examples.

Do NOT use meaningless values such as:

```text
yui
fdg
dyjtj
```

Use:

```text
React Architecture
Portfolio Website
Study Plan
JavaScript Notes
Design System
Project Research
```

The application should always look production-ready.

---

# 60. PLANORA-SPECIFIC "RELATED KNOWLEDGE"

When a user opens a task such as:

**Build authentication**

show:

```text
Related Knowledge

Authentication Architecture
JWT Notes
Security Checklist
OAuth Research

[+ Link Note]
```

When the user starts Focus on that task, the related notes should optionally be accessible from Focus Mode without leaving the session.

Example:

```text
Focus

Build Authentication

45:00

Related Knowledge
▸ Authentication Architecture
```

Clicking it can open a lightweight reference panel without fully leaving Focus Mode.

---

# 61. RESEARCH WORKFLOW

Support this workflow:

```text
Create Research Note
        ↓
Collect information
        ↓
Link related concepts
        ↓
Add tags
        ↓
Connect to project
        ↓
Extract tasks
        ↓
Schedule tasks
        ↓
Focus
```

This makes Notes useful for actual work.

---

# 62. MEETING WORKFLOW

A meeting note should connect directly to Planora.

Example:

```text
# Team Sync

## Discussion

...

## Decisions

...

## Action Items

- [ ] Update landing page
- [ ] Review API
- [ ] Prepare demo
```

Eventually, checklist items can be converted into actual Planora tasks.

Provide:

**Convert to Tasks**

---

# 63. LEARNING WORKFLOW

A learning note can contain:

```text
# React Server Components

## Concept

...

## Example

...

## Questions

...

## Key Takeaways

...

## Related

[[React]]
[[Next.js]]
[[Server Rendering]]
```

Then associate it with:

**Goal: Learn React**

and optionally:

**Project: Portfolio Website**

This creates a useful connection between knowledge and learning goals.

---

# 64. NOTE → TASK CONVERSION

Allow users to select text or checklist items and choose:

**Convert to Task**

Example:

```text
- [ ] Build authentication
```

becomes:

```text
Task:
Build authentication

Project:
Portfolio Website

Source Note:
Authentication Architecture
```

The source note remains connected.

---

# 65. TASK → NOTE CONVERSION

From a task:

**Create Related Note**

creates a note with:

```text
# Build authentication

## Context

Task: Build authentication
Project: Portfolio Website

## Notes

```

This creates a two-way relationship.

---

# 66. PROJECT → NOTE CREATION

From a project:

**+ New Project Note**

opens a template:

```text
# {{project}}

## Objective

## Current Status

## Architecture

## Decisions

## Tasks

## Resources

## Related Notes
```

Automatically associate the note with the project.

---

# 67. GOAL → NOTE CREATION

From a goal:

**+ Knowledge Note**

creates a note associated with that goal.

This is particularly useful for learning goals.

---

# 68. FINAL NOTES NAVIGATION

The finished Notes section should contain:

```text
Notes

Search

Quick Access
├── All Notes
├── Recent
├── Favorites
├── Pinned
└── Daily Notes

Folders
├── Personal
├── Learning
├── Projects
├── Research
└── Ideas

Special
└── Knowledge Graph
```

---

# 69. FINAL USER EXPERIENCE

The final Notes system should allow a user to do this:

### User creates a note

**React Server Components**

↓

Writes:

```text
[[React]]
[[Next.js]]
[[Portfolio Architecture]]
```

↓

Planora recognizes the links.

↓

Backlinks are automatically generated.

↓

Tags are detected.

↓

The note appears in:

**Portfolio Website → Notes**

↓

The note becomes visible under:

**Goal → Learn React**

↓

Related tasks appear.

↓

The note appears in the knowledge graph.

↓

The user creates a task:

**Build RSC example**

↓

The task enters the Planora task system.

↓

The task gets scheduled on the calendar.

↓

The user starts a Pomodoro.

↓

Focus session is recorded.

↓

Task completion updates project and goal progress.

This is the complete Planora experience.

---

# 70. IMPLEMENTATION ORDER

Do not attempt all features at once.

Implement in this exact order.

## Stage 1 — Foundation

1. Notes data model
2. Notes storage service
3. Notes sidebar
4. Notes workspace
5. Note list
6. Create/edit/delete
7. Markdown editor
8. Autosave

## Stage 2 — Knowledge Features

9. Wiki Links
10. Link autocomplete
11. Missing-note creation
12. Backlinks
13. Outgoing links
14. Tags
15. Search
16. Favorites
17. Pinned notes
18. Recent notes

## Stage 3 — Organization

19. Folders
20. Daily notes
21. Templates
22. Note metadata
23. Note context panel

## Stage 4 — Planora Integration

24. Task ↔ Note links
25. Project ↔ Note links
26. Goal ↔ Note links
27. Related knowledge
28. Note → Task conversion
29. Task → Note creation
30. Project note templates
31. Goal knowledge

## Stage 5 — Knowledge Graph

32. Local graph
33. Full graph
34. Graph navigation
35. Graph filtering
36. Task/project/goal graph nodes

## Stage 6 — Advanced Editor

37. Slash commands
38. Callouts
39. Code blocks
40. Images
41. Embeds
42. Link aliases
43. Block links
44. Version history
45. Export

---

# 71. IMPORTANT DEVELOPMENT RULES

Do NOT:

- Break existing Planora features.
- Replace the existing dashboard.
- Create a separate Notes application.
- Duplicate tasks/projects inside Notes.
- Store backlinks manually as the primary data source.
- Make folders the only organization system.
- Make the graph mandatory.
- Make AI mandatory for basic functionality.
- Overload the interface with controls.
- Use meaningless demo data.
- Introduce excessive animations.
- Put large note content into a single huge localStorage object without an abstraction layer.

DO:

- Reuse Planora's existing design system.
- Reuse existing command palette.
- Reuse existing modal/sheet components.
- Reuse existing storage/state architecture where appropriate.
- Keep Notes modular.
- Use stable IDs.
- Make links resilient to renaming.
- Autosave.
- Make the editor fast.
- Make the system responsive.
- Make the knowledge graph optional.
- Keep the experience calm and focused.

---

# 72. DEFINITION OF DONE

The implementation is considered successful when a user can:

1. Open Planora.
2. Navigate to Notes.
3. Create a note.
4. Write Markdown.
5. Save automatically.
6. Search notes.
7. Create tags.
8. Link notes with `[[Wiki Links]]`.
9. Get automatic backlinks.
10. Create a missing note from a Wiki Link.
11. Favorite and pin notes.
12. Create daily notes.
13. Use templates.
14. Link notes to projects.
15. Link notes to tasks.
16. Link notes to goals.
17. See related knowledge from a task.
18. Convert a note checklist into tasks.
19. See notes inside projects.
20. Open the local knowledge graph.
21. Navigate between linked notes through the graph.
22. Use the system comfortably on mobile.
23. Refresh the browser without losing notes.
24. Rename notes without breaking relationships.
25. Delete notes while being warned about backlinks.

Most importantly:

**The Notes system must feel like it belongs inside Planora.**

It should not look or behave like an unrelated application.

---

# 73. FINAL PRODUCT CONCEPT

The final Planora architecture should conceptually become:

```text
                         PLANORA
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
        PLAN              WORK             KNOWLEDGE
          │                 │                 │
       Goals            Projects            Notes
          │                 │                 │
      Roadmaps           Tasks            Wiki Links
          │                 │                 │
      Calendar          Focus             Backlinks
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                     KNOWLEDGE GRAPH
                            │
                     PROGRESS & REVIEW
```

The central philosophy is:

> **Your knowledge should help you plan. Your plans should create action. Your actions should create progress.**

Planora Notes should therefore become more than a note-taking feature.

It should become the **knowledge layer of the entire Planora productivity system**.

The final experience should allow users to move naturally between:

**Idea → Note → Link → Project → Task → Calendar → Focus → Completion → Review**

without feeling like they are switching between different applications.