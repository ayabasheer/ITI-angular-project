import { EventService } from './../../../shared/services/event';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EventModel } from '../../../shared/models/interfaces';
import { AuthService } from '../../../shared/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class Events implements OnInit, OnDestroy {
  events: EventModel[] = [];
  // filter state
  query: string = '';
  category: string = 'all';
  status: string = 'all';
  categories: string[] = [];
  statuses: string[] = [];
  defaultImage = 'https://via.placeholder.com/400x250?text=Event';

  private statusInterval: any;

  constructor(private eventService: EventService, private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  private computeStatus(start?: Date, end?: Date, now = new Date()):
    'Upcoming' | 'InProgress' | 'Completed' | 'Cancelled' {
    const s = start ? new Date(start) : undefined;
    const e = end ? new Date(end) : undefined;
    if (e && now > e) return 'Completed';
    if (s && now < s) return 'Upcoming';
    if (s && e && now >= s && now <= e) return 'InProgress';
    if (s && !e && now >= s) return 'InProgress';
    return 'Upcoming';
  }

  // Updates ALL events in storage every tick (global behavior)
  private updateAllEventStatuses(): void {
    const events = JSON.parse(localStorage.getItem('events') || '[]');
    if (!Array.isArray(events) || events.length === 0) return;

    const now = new Date();
    const updated = events.map((ev: any) => {
      const nextStatus = this.computeStatus(
        ev.startDate ? new Date(ev.startDate) : undefined,
        ev.endDate ? new Date(ev.endDate) : undefined,
        now
      );
      return (ev.status === nextStatus) ? ev : { ...ev, status: nextStatus, updatedAt: new Date().toISOString() };
    });

    const changed = JSON.stringify(events) !== JSON.stringify(updated);
    if (changed) localStorage.setItem('events', JSON.stringify(updated));
  }

  canModify(event: EventModel): boolean {
    const user = this.auth.currentUser;
    if (!user || !event) return false;
    return user.role === 'Organizer' && Number(user.id) === Number(event.createdBy) && event.status !== 'Completed';
  }

  editEvent(event: EventModel) {
    if (!this.canModify(event)) return;
    this.router.navigate(['/dashboard/create-event'], { queryParams: { id: event.id } });
  }

  async deleteEvent(event: EventModel) {
    if (!event) return;
    if (event.status === 'Completed') {
      Swal.fire({ icon: 'warning', title: 'Cannot delete', text: 'Completed events cannot be deleted.' });
      return;
    }
    const result = await Swal.fire({
      title: 'Delete event?',
      text: `Are you sure you want to delete "${event.name}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      const updated = events.filter((e: any) => e.id !== event.id);
      localStorage.setItem('events', JSON.stringify(updated));
      // reload local list
      this.loadEvents();
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Event deleted.' });
    }
  }

  ngOnInit() {
    this.loadEvents();

    // Live refresh loop (1s): update statuses for ALL events, then reload this list
    this.statusInterval = setInterval(() => {
      this.updateAllEventStatuses();
      this.loadEvents();
    }, 1000);

    // Listen for 'refresh' query param so returned navigations can trigger reload
    this.route.queryParamMap.subscribe(params => {
      const refresh = params.get('refresh');
      if (refresh) {
        this.loadEvents();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
      this.statusInterval = null;
    }
  }

  loadEvents() {
    const all = this.eventService.getAll();
    const user = this.auth.currentUser;

    if (user && user.role === 'Organizer') {
      const userId = Number(user.id); // ✅ ensure number
      this.events = all.filter(e => Number(e.createdBy) === userId);
    } else {
      this.events = [];
    }

    // derive available categories and statuses for filters
    const cats = new Set<string>();
    const stats = new Set<string>();
    for (const e of this.events) {
      if (e?.category) cats.add(e.category);
      if (e?.status) stats.add(e.status);
    }
    this.categories = Array.from(cats).sort();
    this.statuses = Array.from(stats).sort();
  }

  // computed filtered list
  get filteredEvents(): EventModel[] {
    const q = (this.query || '').trim().toLowerCase();
    return this.events.filter(e => {
      if (this.category !== 'all' && e.category !== this.category) return false;
      if (this.status !== 'all' && e.status !== this.status) return false;
      if (!q) return true;
      return (
        (e.name || '').toLowerCase().includes(q) ||
        (e.description || '').toLowerCase().includes(q) ||
        (e.location || '').toLowerCase().includes(q)
      );
    });
  }
}
