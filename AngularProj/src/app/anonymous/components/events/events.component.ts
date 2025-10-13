import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './events.component.html'
})
export class EventsComponent {
  events: any[] = [];
  guests: any[] = [];
  organizers: any[] = [];
  feedbacks: any[] = [];
  defaultImage = 'https://via.placeholder.com/400x250?text=Event';

  constructor() {
    try {
      const rawE = localStorage.getItem('events');
      const rawG = localStorage.getItem('guests');
      const rawO = localStorage.getItem('organizers');
      const rawF = localStorage.getItem('feedbacks');

  const allEvents = rawE ? JSON.parse(rawE) : [];
  // show all events (do not filter by status)
  this.events = allEvents;
      this.guests = rawG ? JSON.parse(rawG) : [];
      this.organizers = rawO ? JSON.parse(rawO) : [];
      this.feedbacks = rawF ? JSON.parse(rawF) : [];
    } catch (err) {
      this.events = [];
      this.guests = [];
      this.organizers = [];
      this.feedbacks = [];
    }
  }

  getOrganizerName(id: number) {
    const o = this.organizers.find((x: any) => x.id === id);
    return o ? o.name || o.email || 'Organizer' : 'Organizer';
  }

  getFeedbackById(id: number) {
    return this.feedbacks.find((f: any) => f.id === id) || null;
  }

  getGuestNameByFeedbackId(fid: number) {
    const fb = this.getFeedbackById(fid);
    if (!fb) return 'Guest';
    const g = this.guests.find((x: any) => x.id === fb.guestId);
    return g ? g.name || g.email || ('Guest #' + g.id) : 'Guest';
  }
}
