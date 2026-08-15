import { NoteStorage } from './note-storage.js';

export class NotesService {
  constructor(store) {
    this.store = store; // The main Planora store
    this.storage = new NoteStorage();
    this.notes = new Map();
  }

  async init() {
    const loadedNotes = await this.storage.loadAllNotes();
    for (const note of loadedNotes) {
      this.notes.set(note.id, note);
    }
    this._syncToStore();
  }

  generateId() {
    return 'note_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  _syncToStore() {
    // Sync array back to store for UI reactiveness
    const arr = Array.from(this.notes.values());
    this.store.set('vaultNotes', arr);
  }

  async saveNote(noteId, updates) {
    const note = this.notes.get(noteId);
    if (!note) return null;
    
    const updatedNote = { ...note, ...updates, updatedAt: new Date().toISOString() };
    this.notes.set(noteId, updatedNote);
    await this.storage.saveNote(updatedNote);
    
    this._syncToStore();
    return updatedNote;
  }

  async markOpened(noteId) {
    const note = this.notes.get(noteId);
    if (!note) return;
    note.lastOpenedAt = new Date().toISOString();
    await this.storage.saveNote(note);
    this._syncToStore();
  }

  async createNote(data) {
    const note = {
        id: this.generateId(),
        title: data.title || 'Untitled Note',
        content: data.content || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastOpenedAt: new Date().toISOString(),
        tags: [],
        folder: data.folder || 'General',
        projectId: data.projectId || null,
        goalId: data.goalId || null,
        taskIds: data.taskIds || [],
        pinned: data.pinned || false,
        favorite: data.favorite || false,
        dailyNote: data.dailyNote || false
    };

    this.notes.set(note.id, note);
    await this.storage.saveNote(note);
    
    this._syncToStore();
    return note;
  }

  async duplicateNote(noteId) {
    const original = this.notes.get(noteId);
    if (!original) return null;
    return await this.createNote({
        title: original.title + ' (Copy)',
        content: original.content,
        folder: original.folder,
        projectId: original.projectId,
        goalId: original.goalId
    });
  }

  async deleteNote(noteId) {
    this.notes.delete(noteId);
    await this.storage.deleteNote(noteId);
    this._syncToStore();
  }

  getNote(noteId) {
      return this.notes.get(noteId);
  }

  getNoteByTitle(title) {
      const lower = title.toLowerCase();
      for (const note of this.notes.values()) {
          if (note.title.toLowerCase() === lower) return note;
      }
      return null;
  }

  getAllNotes() {
      return Array.from(this.notes.values());
  }

  getRecentNotes() {
      return this.getAllNotes()
          .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())
          .slice(0, 10);
  }
}
