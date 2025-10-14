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
}
