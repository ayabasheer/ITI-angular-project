import { Component , OnInit} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { ExpenseService } from '../../../shared/services/expense';  
import { Expense } from '../../../shared/models/interfaces';




@Component({
  selector: 'app-expenses',
  imports: [CommonModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css'
})
export class Expenses implements OnInit {
  expenses: Expense[] = [];

  constructor(private expenseService: ExpenseService) {}

  ngOnInit() {
    this.expenses = this.expenseService.getAll();
  }
}