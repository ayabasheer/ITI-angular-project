import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Expense } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-expense-details',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './expense-details.html',
  styleUrls: ['./expense-details.css']
})
export class ExpenseDetails {
  expense: Expense | null = null;
  event: any = null;

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const rawEx = localStorage.getItem('expenses');
    const rawE = localStorage.getItem('events');
    const expenses = rawEx ? JSON.parse(rawEx) : [];
    const events = rawE ? JSON.parse(rawE) : [];
    this.expense = expenses.find((ex: Expense) => ex.id === id) || null;
    if (this.expense) {
      this.event = events.find((e: any) => e.id === this.expense!.eventId) || null;
    }
  }
}
