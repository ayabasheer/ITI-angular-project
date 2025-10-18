import { Injectable } from '@angular/core';
import { EventModel } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class EventService {
  private storageKey = 'events';

  // ✅ تحميل كل الأحداث من localStorage
  getAll(): EventModel[] {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  // ✅ الحصول على حدث معين
  getById(id: number): EventModel | undefined {
    const events = this.getAll();
    return events.find(e => e.id === id);
  }

  // ✅ إنشاء حدث جديد
  create(event: EventModel): EventModel {
    const events = this.getAll();

    // توليد ID جديد
    const newId = events.length ? Math.max(...events.map(e => e.id)) + 1 : 1;
    const newEvent = { ...event, id: newId };

    // حفظ في localStorage
    events.push(newEvent);
    localStorage.setItem(this.storageKey, JSON.stringify(events));

    return newEvent;
  }

  // ✅ تحديث حدث
  update(updatedEvent: EventModel): void {
    const events = this.getAll().map(e =>
      e.id === updatedEvent.id ? { ...updatedEvent, updatedAt: new Date().toISOString() } : e
    );
    localStorage.setItem(this.storageKey, JSON.stringify(events));
  }

  // ✅ حذف حدث
  delete(id: number): void {
    const events = this.getAll().filter(e => e.id !== id);
    localStorage.setItem(this.storageKey, JSON.stringify(events));
  }

  // ✅ الحصول على أحداث مستخدم معين
  getByUser(userId: number): EventModel[] {
    return this.getAll().filter(e => e.createdBy === userId);
  }
}
