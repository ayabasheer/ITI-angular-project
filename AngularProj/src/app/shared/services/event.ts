import { Injectable } from '@angular/core';
import type { EventModel } from '../models/interfaces';

const EVENTS_KEY = 'events';

@Injectable({ providedIn: 'root' })
export class EventService {
  private parse<T>(v: string | null): T | null {
    if (!v) return null;
    try { return JSON.parse(v); } catch { return null; }
  }

  getAll(): EventModel[] {
    return this.parse<EventModel[]>(localStorage.getItem(EVENTS_KEY)) ?? [];
  }

  getById(id: number): EventModel | undefined {
    return this.getAll().find(e => e.id === id);
  }

  saveAll(events: EventModel[]) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  create(event: EventModel) {
    const arr = this.getAll();
    // ensure unique id
    const nextId = arr.length ? Math.max(...arr.map(e => e.id)) + 1 : 1;
    event.id = nextId;
    arr.push(event);
    this.saveAll(arr);
  }

  update(id: number, patch: Partial<EventModel>) {
    const arr = this.getAll();
    const idx = arr.findIndex(e => e.id === id);
    if (idx === -1) return false;
    arr[idx] = { ...arr[idx], ...patch };
    this.saveAll(arr);
    return true;
  }

  delete(id: number) {
    const arr = this.getAll().filter(e => e.id !== id);
    this.saveAll(arr);
  }
}