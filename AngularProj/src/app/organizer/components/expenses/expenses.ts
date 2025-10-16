import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ExpenseService } from '../../../shared/services/expense';
import { Expense } from '../../../shared/models/interfaces';
import { EventService } from '../../../shared/services/event';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css']
})
export class Expenses implements OnInit {
  expenses: Expense[] = [];
  events: any[] = [];

  constructor(private expenseService: ExpenseService, private eventService: EventService, private auth: AuthService) {}

  ngOnInit() {
    const allExpenses = this.expenseService.getAll() || [];
    const allEvents = this.eventService.getAll() || [];
    const user = this.auth.currentUser;
    if (user && user.role === 'Organizer') {
      const myEventIds = new Set((allEvents.filter(e => e.createdBy === user.id) || []).map(e => e.id));
      this.events = allEvents.filter(e => myEventIds.has(e.id));
      this.expenses = allExpenses.filter((ex: any) => myEventIds.has(ex.eventId));
    } else {
      this.expenses = [];
    }
  }

  getEventName(eventId: number): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  }
}
