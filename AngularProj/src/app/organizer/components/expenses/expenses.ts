import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpenseService } from '../../../shared/services/expense';
import { Expense } from '../../../shared/models/interfaces';
import { EventService } from '../../../shared/services/event';
import { AuthService } from '../../../shared/services/auth.service';




@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses.html',
  styleUrls: ['./expenses.css']
})
export class Expenses implements OnInit {
  expenses: Expense[] = [];

  constructor(private expenseService: ExpenseService, private eventService: EventService, private auth: AuthService) {}

  ngOnInit() {
    const allExpenses = this.expenseService.getAll() || [];
    const allEvents = this.eventService.getAll() || [];
    const user = this.auth.currentUser;
    if (user && user.role === 'Organizer') {
      const myEventIds = new Set((allEvents.filter(e => e.createdBy === user.id) || []).map(e => e.id));
      this.expenses = allExpenses.filter((ex: any) => myEventIds.has(ex.eventId));
    } else {
      this.expenses = [];
    }
  }
}
