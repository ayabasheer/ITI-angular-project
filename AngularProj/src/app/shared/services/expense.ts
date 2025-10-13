import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  getAll() {
    try {
      const raw = localStorage.getItem('expenses');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}
