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

  private saveAll(expenses: any[]) {
    try {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    } catch (e) {
      console.warn('Failed to save expenses', e);
    }
  }

  create(expense: any) {
    const all = this.getAll();
    const nextId = all.length ? Math.max(...all.map((e: any) => e.id)) + 1 : 1;
    const toSave = { ...expense, id: nextId };
    all.push(toSave);
    this.saveAll(all);
    return toSave;
  }

  update(id: number, patch: any) {
    const all = this.getAll();
    const idx = all.findIndex((e: any) => e.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch };
    this.saveAll(all);
    return all[idx];
  }

  delete(id: number) {
    const all = this.getAll();
    const updated = all.filter((e: any) => e.id !== id);
    this.saveAll(updated);
    return true;
  }

  getById(id: number) {
    const all = this.getAll();
    return all.find((e: any) => e.id === id) || null;
  }

  getForEvent(eventId: number) {
    const all = this.getAll();
    return all.filter((e: any) => Number(e.eventId) === Number(eventId));
  }

  totalsByCategory(eventId: number) {
    const ex = this.getForEvent(eventId);
    const totals: Record<string, number> = {};
    let total = 0;
    for (const e of ex) {
      const amt = Number(e.amount) || 0;
      total += amt;
      totals[e.category] = (totals[e.category] || 0) + amt;
    }
    return { total, byCategory: totals };
  }
}
