import { Component, OnInit, AfterViewInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { EventService } from '../../../shared/services/event';
import { GuestService } from '../../../shared/services/guest';
import { TaskService } from '../../../shared/services/task';
import { ExpenseService } from '../../../shared/services/expense';
import { AuthService, User } from '../../../shared/services/auth.service';

import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatIconModule, MatButtonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  // Canvas refs for Chart.js
  @ViewChild('expenseCanvas') expenseCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventCanvas') eventCanvas!: ElementRef<HTMLCanvasElement>;

  // Keep chart instances to safely destroy/rebuild
  private expenseChart?: Chart;
  private eventChart?: Chart;

  // interval for live status updates
  private statusInterval: any;

  total = 0;
  upcoming = 0;
  completed = 0;
  totalGuests = 0;
  progress = 0;
  currentUser: User | null = null;
  isDarkMode = false;
  sidebarOpen = true;
  isMobile = false;
  expensePercentages: number[] = [40, 25, 20, 15];
  eventsByMonth: number[] = new Array(12).fill(0);

  constructor(
    private eventService: EventService,
    private guestService: GuestService,
    private taskService: TaskService,
    private expenseService: ExpenseService,
    public router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadStats();

    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    this.applyTheme();

    this.checkScreenSize();

    // 🔁 Start global 1s ticker that updates ALL events' statuses
    this.statusInterval = setInterval(() => {
      this.updateAllEventStatuses();
      // Recompute dashboard numbers after status changes
      this.loadStats();
    }, 1000);
  }

  ngAfterViewInit(): void {
    // View is now in the DOM; if canvases are present, init charts
    this.initChartsIfReady();
  }

  ngOnDestroy(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
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

  // --- Status compute + storage update (ALL events) ---
  private computeStatus(start?: Date, end?: Date, now = new Date()):
    'Upcoming' | 'InProgress' | 'Completed' | 'Cancelled' {
    const s = start ? new Date(start) : undefined;
    const e = end ? new Date(end) : undefined;
    if (e && now > e) return 'Completed';
    if (s && now < s) return 'Upcoming';
    if (s && e && now >= s && now <= e) return 'InProgress';
    // If only start provided and now >= start, consider in-progress until end is known
    if (s && !e && now >= s) return 'InProgress';
    return 'Upcoming';
  }

  private updateAllEventStatuses(): void {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    if (!Array.isArray(events) || events.length === 0) return;

    const now = new Date();
    const updated = events.map((ev: any) => {
      const nextStatus = this.computeStatus(ev.startDate ? new Date(ev.startDate) : undefined,
                                            ev.endDate ? new Date(ev.endDate) : undefined,
                                            now);
      return (ev.status === nextStatus) ? ev : { ...ev, status: nextStatus, updatedAt: new Date().toISOString() };
    });

    // Only write if something actually changed (optional micro-optimization)
    const changed = JSON.stringify(events) !== JSON.stringify(updated);
    if (changed) {
      localStorage.setItem('events', JSON.stringify(updated));
    }
  }

  // Load statistics and compute dataset for charts
  loadStats() {
    const allEvents = this.eventService.getAll();
    const allGuests = this.guestService.getAll();
    const allExpenses = this.expenseService.getAll();
    const allTasks = this.taskService.getAll(); // currently unused, but you may use it later

    const user = this.currentUser;
    if (user && user.role === 'Organizer') {
      const myEvents = allEvents.filter((e: any) => e.createdBy === user.id);
      this.total = myEvents.length;
      this.upcoming = myEvents.filter((e: any) => e.status === 'Upcoming').length;
      this.completed = myEvents.filter((e: any) => e.status === 'Completed').length;

      // Progress percentage (completed events)
      this.progress = this.total > 0 ? Math.round((this.completed / this.total) * 100) : 0;

      const myEventIds = new Set<number>(myEvents.map((e: any) => e.id));

      // Guests for organizer's events - handle guests that may have eventIds array or single eventId
      this.totalGuests = allGuests.filter((g: any) => {
        const gid = Array.isArray(g.eventIds) && g.eventIds.length ? g.eventIds[0] : g.eventId;
        return typeof gid === 'number' && myEventIds.has(gid);
      }).length;

      // Expenses
      const expenses = allExpenses.filter(
        (exp: any) => typeof exp.eventId === 'number' && myEventIds.has(exp.eventId)
      );
      const categories: string[] = ['Venue', 'Decoration', 'Food', 'Music'];
      const totalExpense = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
      this.expensePercentages = categories.map((cat) => {
        const catTotal = expenses
          .filter((exp: any) => exp.category === cat)
          .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
        return totalExpense > 0 ? Math.round((catTotal / totalExpense) * 100) : 0;
      });

      // Events by month
      const monthCounts = new Array(12).fill(0);
      myEvents.forEach((event: any) => {
        if (event.startDate) {
          const month = new Date(event.startDate).getMonth();
          if (!Number.isNaN(month)) monthCounts[month]++;
        }
      });
      this.eventsByMonth = monthCounts;
    } else {
      this.total = 0;
      this.upcoming = 0;
      this.completed = 0;
      this.progress = 0;
      this.totalGuests = 0;
      this.expensePercentages = [0, 0, 0, 0];
      this.eventsByMonth = new Array(12).fill(0);
    }

    // Charts can be (re)initialized now that data is ready
    this.initChartsIfReady();
  }

  // Initialize charts only if canvases/contexts are present; destroy previous instances first
  private initChartsIfReady() {
    const expenseCanvasEl = this.expenseCanvas?.nativeElement;
    const eventCanvasEl = this.eventCanvas?.nativeElement;

    if (!expenseCanvasEl || !eventCanvasEl) {
      // canvases may be hidden or not yet rendered if not on /dashboard
      return;
    }

    const expenseCtx = expenseCanvasEl.getContext('2d');
    const eventCtx = eventCanvasEl.getContext('2d');
    if (!expenseCtx || !eventCtx) return;

    // Destroy previous instances to prevent duplicates
    this.expenseChart?.destroy();
    this.eventChart?.destroy();

    // Donut Chart (Expenses)
    this.expenseChart = new Chart(expenseCtx, {
      type: 'doughnut',
      data: {
        labels: ['Venue', 'Decoration', 'Food', 'Music'],
        datasets: [
          {
            data: this.expensePercentages,
            backgroundColor: ['#d4af37', '#b9975b', '#a67c52', '#8b6a3f'],
            borderWidth: 0
          }
        ]
      },
      options: {
        plugins: { legend: { position: 'right' } },
        maintainAspectRatio: false
      }
    });

    // Bar Chart (Events by Month)
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    this.eventChart = new Chart(eventCtx, {
      type: 'bar',
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: 'Events',
            data: this.eventsByMonth,
            backgroundColor: '#d4af37'
          }
        ]
      },
      options: {
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
        maintainAspectRatio: false
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();

    // notify other parts of the app that theme changed
    try {
      window.dispatchEvent(new CustomEvent('theme:changed', { detail: { dark: this.isDarkMode } }));
    } catch {
      // ignore in environments without CustomEvent
    }
  }

  applyTheme() {
    const dashboardEl = document.querySelector('.dashboard-wrapper');
    if (this.isDarkMode) {
      dashboardEl?.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      dashboardEl?.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
