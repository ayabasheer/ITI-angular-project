import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../shared/services/event';
import { EventModel } from '../../../shared/models/interfaces';
import { EventGeneratorService } from '../../../shared/services/event-generator.service';
import { CommonModule } from '@angular/common'; // ✅ DatePipe جاي مع CommonModule}
import { GuestService } from '../../../shared/services/guest';
import { TaskService } from '../../../shared/services/task';
import { ExpenseService } from '../../../shared/services/expense';  // ✅
import { RouterModule, Router } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import Charthart from 'chart.js/auto';
import { DatePipe } from '@angular/common';
import { AuthService, User } from '../../../shared/services/auth.service';
Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule], //
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  total = 0;
  upcoming = 0;
  completed = 0;
  totalGuests = 0;
  currentUser: User | null = null;
  expensePercentages: number[] = [40, 25, 20, 15]; // Default, will be updated
  eventsByMonth: number[] = [2, 3, 4, 3, 2]; // Default, will be updated

  constructor(
    private eventService: EventService,
    private guestService: GuestService,
    private taskService: TaskService,
    private expenseService: ExpenseService,
    public router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadStats();
    setTimeout(() => this.initCharts(), 300);

  }

  loadStats() {
    const allEvents = this.eventService.getAll();
    const allGuests = this.guestService.getAll();
    const allExpenses = this.expenseService.getAll();
    const allTasks = this.taskService.getAll();

    const user = this.currentUser;
    if (user && user.role === 'Organizer') {
      const myEvents = allEvents.filter(e => e.createdBy === user.id);
      this.total = myEvents.length;
      this.upcoming = myEvents.filter(e => e.status === 'Upcoming').length;
      this.completed = myEvents.filter(e => e.status === 'Completed').length;

      const myEventIds = new Set<number>(myEvents.map(e => e.id));

      // Guests for organizer's events
      this.totalGuests = allGuests.filter((g: any) => myEventIds.has(g.eventId)).length;

      // Expenses for organizer's events
      const expenses = allExpenses.filter((exp: any) => myEventIds.has(exp.eventId));
      const categories: string[] = ['Venue', 'Decoration', 'Food', 'Music'];
      const totalExpense = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
      this.expensePercentages = categories.map(cat => {
        const catTotal = expenses
          .filter((exp: any) => exp.category === cat)
          .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
        return totalExpense > 0 ? Math.round((catTotal / totalExpense) * 100) : 0;
      });

      // Events by month (Jan-May) for organizer events
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May'];
      this.eventsByMonth = months.map(month => {
        return myEvents.filter(event => {
          if (!event.startDate) return false;
          const eventDate = new Date(event.startDate);
          const eventMonth = eventDate.toLocaleString('default', { month: 'short' });
          return eventMonth === month;
        }).length;
      });

      // Optionally use tasks for other UI pieces - filter tasks to organizer events
      const tasks = allTasks.filter((t: any) => myEventIds.has(t.eventId));
      // (No direct UI binding yet, but data is available if needed)
    } else {
      // Not an organizer or not authenticated — show empty stats
      this.total = 0;
      this.upcoming = 0;
      this.completed = 0;
      this.totalGuests = 0;
      this.expensePercentages = [0, 0, 0, 0];
      this.eventsByMonth = [0, 0, 0, 0, 0];
    }
  }

  initCharts() {
    // Donut Chart (Expenses) - using computed percentages
    new Chart('expenseChart', {
      type: 'doughnut',
      data: {
        labels: ['Venue', 'Decoration', 'Food', 'Music'],
        datasets: [
          {
            data: this.expensePercentages,
            backgroundColor: ['#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        plugins: { legend: { position: 'right' } },
      },
    });

    // Bar Chart (Events by Month) - using computed counts
    new Chart('eventChart', {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
          {
            label: 'Events',
            data: this.eventsByMonth,
            backgroundColor: '#3B82F6',
          },
        ],
      },
      options: {
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }
}
