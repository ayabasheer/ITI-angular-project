import { EventService } from './../../../shared/services/event';
import { Component, OnInit } from '@angular/core';
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
export class Events implements OnInit {
  events: EventModel[] = [];
  // filter state
  query: string = '';
  category: string = 'all';
  status: string = 'all';
  categories: string[] = [];
  statuses: string[] = [];
  defaultImage = 'https://via.placeholder.com/400x250?text=Event';
  themeMode: string = 'light';

  constructor(private eventService: EventService, private auth: AuthService, private router: Router, private route: ActivatedRoute) {}

  goBack() {
    window.history.back();
  }

  goForward() {
    window.history.forward();
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
    this.themeMode = localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light';
    window.addEventListener('theme:changed', (e: any) => {
      this.themeMode = e.detail.dark ? 'dark' : 'light';
    });

    this.loadEvents();
    // Listen for 'refresh' query param so returned navigations can trigger reload
    this.route.queryParamMap.subscribe(params => {
      const refresh = params.get('refresh');
      if (refresh) {
        this.loadEvents();
      }
    });
  }

  loadEvents() {
    const all = this.eventService.getAll();
    const user = this.auth.currentUser;

    console.log('All events:', all);
    console.log('Current user:', user);

    if (user && user.role === 'Organizer') {
      const userId = Number(user.id); // ✅ تأكدنا أنه رقم
      this.events = all.filter(e => Number(e.createdBy) === userId);
      console.log('Filtered events:', this.events);
    } else {
      this.events = [];
    }
    // derive available categories and statuses for filters
    const cats = new Set<string>();
    const stats = new Set<string>();
    for (const e of this.events) {
      if (e.category) cats.add(e.category);
      if (e.status) stats.add(e.status);
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
