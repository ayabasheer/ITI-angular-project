import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { EventService } from '../../../shared/services/event';
import { EventModel } from '../../../shared/models/interfaces';
import { EventGeneratorService } from '../../../shared/services/event-generator.service';
import { GuestService } from '../../../shared/services/guest';
import { TaskService } from '../../../shared/services/task';
import { ExpenseService } from '../../../shared/services/expense';
import { Chart, registerables } from 'chart.js';
import { DatePipe } from '@angular/common';
import { AuthService, User } from '../../../shared/services/auth.service';
Chart.register(...registerables);


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  total = 0;
  upcoming = 0;
  completed = 0;
  totalGuests = 0;
  currentUser: User | null = null;
  isDarkMode = false;
  sidebarOpen = true;
  isMobile = false;
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
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.applyTheme();
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 992;
    const saved = localStorage.getItem('sidebarOpen');
    if (this.isMobile) {
      this.sidebarOpen = false;
    } else {
      this.sidebarOpen = saved ? JSON.parse(saved) : true;
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidenav) {
      if (this.sidebarOpen) this.sidenav.open();
      else this.sidenav.close();
    }
    localStorage.setItem('sidebarOpen', JSON.stringify(this.sidebarOpen));
  }

  closeSidebarOnMobile() {
    if (this.isMobile && this.sidenav) {
      this.sidenav.close();
      this.sidebarOpen = false;
    }
  }

  onBackdropClick() {
    this.sidebarOpen = false;
    if (this.sidenav) this.sidenav.close();
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
            backgroundColor: ['#d4af37', '#b9975b', '#a67c52', '#8b6a3f'],
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
            backgroundColor: '#d4af37',
          },
        ],
      },
      options: {
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
      },
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();
  }

  applyTheme() {
    const dashboardEl = document.querySelector('.dashboard-wrapper');
    if (this.isDarkMode) {
      dashboardEl?.classList.add('dark');
    } else {
      dashboardEl?.classList.remove('dark');
    }
  }
}
