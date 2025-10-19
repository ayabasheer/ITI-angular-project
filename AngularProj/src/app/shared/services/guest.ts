import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GuestService {
  getAll() {
    try {
      const raw = localStorage.getItem('guests');
      const arr = raw ? JSON.parse(raw) : [];
      return arr.map((g: any) => ({ ...g }));
    } catch {
      return [];
    }
  }

  /** Return guests invited to the given event id. Handles both legacy `eventId` and `eventIds` arrays. */
  getForEvent(eventId: number) {
    if (typeof eventId !== 'number') return [];
    const all = this.getAll();
    return all.filter((g: any) => {
      // if guest has eventIds array, check it; otherwise fall back to single eventId
      if (Array.isArray(g.eventIds) && g.eventIds.length) {
        return g.eventIds.includes(eventId);
      }
      return typeof g.eventId === 'number' && g.eventId === eventId;
    });
  }
}
