import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgForOf } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ExpenseService } from '../../../shared/services/expense';
import { Expense } from '../../../shared/models/interfaces';
import { EventService } from '../../../shared/services/event';
import { AuthService } from '../../../shared/services/auth.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, NgIf, NgForOf, RouterModule, FormsModule],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css']
})
export class Expenses implements OnInit {
  isDark = false;
  expenses: Expense[] = [];
  events: any[] = [];
  // UI & state
  selectedEventId: number | null = null;
  eventExpenses: Expense[] = [];
  newExpense: Partial<Expense> = { name: '', amount: 0, category: 'Miscellaneous', date: new Date().toISOString(), notes: '' };
  editingExpenseId: number | null = null;
  totalExpense = 0;
  byCategory: Record<string, number> = {};

  constructor(private expenseService: ExpenseService, private eventService: EventService, private auth: AuthService) {}

  ngOnInit() {
    this.isDark = localStorage.getItem('darkMode') === 'true';
    const allExpenses = this.expenseService.getAll() || [];
    const allEvents = this.eventService.getAll() || [];
    const user = this.auth.currentUser;
    if (user && user.role === 'Organizer') {
      const myEventIds = new Set((allEvents.filter(e => e.createdBy === user.id) || []).map(e => e.id));
      this.events = allEvents.filter(e => myEventIds.has(e.id));
  this.expenses = allExpenses.filter((ex: any) => typeof ex.eventId === 'number' && myEventIds.has(ex.eventId));
    } else {
      this.expenses = [];
    }
    // select first event by default (if any)
    if (this.events.length) {
      this.selectedEventId = this.events[0].id;
      this.loadEventExpenses();
    }
  }

  private loadEventExpenses() {
    if (!this.selectedEventId) {
      this.eventExpenses = [];
      this.totalExpense = 0;
      this.byCategory = {};
      return;
    }
    this.eventExpenses = (this.expenseService.getForEvent(this.selectedEventId) || []).map((e: any) => ({ ...e }));
    const totals = this.expenseService.totalsByCategory(this.selectedEventId);
    this.totalExpense = totals.total;
    this.byCategory = totals.byCategory;
    // update chart if present
    setTimeout(() => this.renderChart(), 0);
  }

  selectEvent(id: number | null) {
    this.selectedEventId = id;
    this.loadEventExpenses();
  }

  startEdit(exp: Expense) {
    this.editingExpenseId = exp.id;
    this.newExpense = { ...exp };
  }

  cancelEdit() {
    this.editingExpenseId = null;
    this.newExpense = { name: '', amount: 0, category: 'Miscellaneous', date: new Date().toISOString(), notes: '' };
  }

  saveExpense() {
    if (!this.selectedEventId) return;
    const toSave: any = {
      eventId: this.selectedEventId,
      name: this.newExpense.name || 'Unnamed',
      amount: Number(this.newExpense.amount) || 0,
      category: (this.newExpense.category as any) || 'Miscellaneous',
      date: (this.newExpense.date as any) || new Date().toISOString(),
      notes: this.newExpense.notes || ''
    };
    if (this.editingExpenseId) {
      this.expenseService.update(this.editingExpenseId, toSave);
      Swal.fire({ icon: 'success', title: 'Updated', text: 'Expense updated.' });
    } else {
      const created = this.expenseService.create(toSave);
      // ensure event.expenses array contains this id
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      const evIdx = events.findIndex((e: any) => e.id === this.selectedEventId);
      if (evIdx !== -1) {
        events[evIdx].expenses = events[evIdx].expenses || [];
        events[evIdx].expenses.push(created.id);
        localStorage.setItem('events', JSON.stringify(events));
      }
      Swal.fire({ icon: 'success', title: 'Created', text: 'Expense added.' });
    }
    this.cancelEdit();
    this.loadEventExpenses();
  }

  async removeExpense(id: number) {
    const r = await Swal.fire({ title: 'Delete expense?', text: 'This action cannot be undone.', showCancelButton: true, confirmButtonText: 'Delete' });
    if (!r.isConfirmed) return;
    this.expenseService.delete(id);
    // remove id from event.expenses
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    const ev = events.find((e: any) => e.id === this.selectedEventId);
    if (ev && Array.isArray(ev.expenses)) {
      ev.expenses = ev.expenses.filter((eid: number) => eid !== id);
      localStorage.setItem('events', JSON.stringify(events));
    }
    this.loadEventExpenses();
    Swal.fire({ icon: 'success', title: 'Deleted', text: 'Expense removed.' });
  }

  // Render a pie chart using Chart.js if available
  renderChart() {
    try {
      // Use local Chart import (ensures chart.js is available even if not attached to window)
      if (!Chart) return;
      const canvasId = 'expensePieChart';
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null;
      if (!canvas) return;
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      if (!ctx) return;
      // Destroy previous chart instance if stored on the canvas
      // @ts-ignore
      if ((canvas as any).__chart) {
        // @ts-ignore
        (canvas as any).__chart.destroy();
        // @ts-ignore
        (canvas as any).__chart = null;
      }
      const labels = Object.keys(this.byCategory);
      const data = labels.map(l => this.byCategory[l]);
      const palette = ['#d4af37', '#b9975b', '#a67c52', '#8b6a3f'];
      const bg = labels.map((_, idx) => palette[idx % palette.length]);
      // @ts-ignore
      const ch = new Chart(ctx, {
        type: 'pie',
        data: {
          labels,
          datasets: [{ data, backgroundColor: bg }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
      // @ts-ignore
      (canvas as any).__chart = ch;
    } catch (e) {
      console.warn('Unable to render expense chart', e);
    }
  }

  getEventName(eventId?: number | null): string {
    if (typeof eventId !== 'number') return 'Unknown Event';
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  }

  // exposed to template to avoid complex inline expressions
  get selectedEventBudget(): number {
    if (!this.selectedEventId) return 0;
    const ev = this.events.find(e => e.id === this.selectedEventId);
    return ev ? Number(ev.budget || 0) : 0;
  }

  get remainingBudget(): number {
    return this.selectedEventBudget - this.totalExpense;
  }
}
