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
}
