import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TaskService {
  getAll() {
    try {
      const raw = localStorage.getItem('tasks');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveAll(tasks: any[]) {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn('Failed to save tasks', e);
    }
  }

  create(task: any) {
    const all = this.getAll();
    const nextId = all.length ? Math.max(...all.map((t: any) => t.id)) + 1 : 1;
    const toSave = { ...task, id: nextId };
    all.push(toSave);
    this.saveAll(all);
    return toSave;
  }

  update(id: number, patch: any) {
    const all = this.getAll();
    const idx = all.findIndex((t: any) => t.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    this.saveAll(all);
    return all[idx];
  }

  delete(id: number) {
    const all = this.getAll();
    const updated = all.filter((t: any) => t.id !== id);
    this.saveAll(updated);
    return true;
  }

  getById(id: number) {
    const all = this.getAll();
    return all.find((t: any) => t.id === id) || null;
  }

  getForEvent(eventId: number) {
    const all = this.getAll();
    return all.filter((t: any) => Number(t.eventId) === Number(eventId));
  }
}
