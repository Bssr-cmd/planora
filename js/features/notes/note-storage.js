export class NoteStorage {
  constructor(namespace = 'planora_note_') {
    this.namespace = namespace;
  }

  async saveNote(note) {
    try {
      localStorage.setItem(this.namespace + note.id, JSON.stringify(note));
      return true;
    } catch (e) {
      console.error('Failed to save note', e);
      return false;
    }
  }

  async loadNote(id) {
    try {
      const data = localStorage.getItem(this.namespace + id);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Failed to load note', e);
      return null;
    }
  }

  async loadAllNotes() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.namespace));
      const notes = [];
      for (const k of keys) {
        const item = localStorage.getItem(k);
        if (item) notes.push(JSON.parse(item));
      }
      return notes;
    } catch(e) {
      console.error('Failed to load all notes', e);
      return [];
    }
  }

  async deleteNote(id) {
    try {
      localStorage.removeItem(this.namespace + id);
      return true;
    } catch (e) {
      console.error('Failed to delete note', e);
      return false;
    }
  }
}
