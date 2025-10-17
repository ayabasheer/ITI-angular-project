import { Component ,ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent ,FooterComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css', '../../anonstyles.css'],
	encapsulation: ViewEncapsulation.None
})
export class EventsComponent {
  events: any[] = [];
  sortedEvents: any[] = [];
  pagedEvents: any[] = [];
  currentPage = 1;
  pageSize = 9;
  totalPages = 1;
  guests: any[] = [];
  organizers: any[] = [];
  feedbacks: any[] = [];
  defaultImage = 'https://via.placeholder.com/400x250?text=Event';

  constructor(private router: Router, private auth: AuthService) {
    try {
      const rawE = localStorage.getItem('events');
      const rawG = localStorage.getItem('guests');
      const rawO = localStorage.getItem('organizers');
      const rawF = localStorage.getItem('feedbacks');

  const allEvents = rawE ? JSON.parse(rawE) : [];
  this.events = allEvents.filter((e: any) => e.status === 'Completed');
      this.guests = rawG ? JSON.parse(rawG) : [];
      this.organizers = rawO ? JSON.parse(rawO) : [];
      this.feedbacks = rawF ? JSON.parse(rawF) : [];

      // Compute average rating for each event
      this.sortedEvents = this.events.map(event => {
        let avgRating = 0;
        if (event.feedbacks && event.feedbacks.length > 0) {
          const ratings = event.feedbacks
            .map((fid: number) => {
              const fb = this.feedbacks.find((f: any) => f.id === fid);
              return fb ? fb.rating : null;
            })
            .filter((r: number | null) => r !== null);
          if (ratings.length > 0) {
            avgRating = ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length;
          }
        }
        return { ...event, avgRating };
      })
      .sort((a, b) => b.avgRating - a.avgRating);

      this.totalPages = Math.ceil(this.sortedEvents.length / this.pageSize);
      this.setPage(1);
    } catch (err) {
      this.events = [];
      this.guests = [];
      this.organizers = [];
      this.feedbacks = [];
      this.sortedEvents = [];
      this.pagedEvents = [];
      this.totalPages = 1;
    }
  }

  setPage(page: number) {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;
    this.currentPage = page;
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.pagedEvents = this.sortedEvents.slice(start, end);
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

  onLeaveFeedback(eventId: number, $event: Event) {
    $event.stopPropagation();
    $event.preventDefault();
    const user = this.auth.currentUser;
    if (!user || user.role !== 'Guest') {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/events', eventId, 'feedback']);
  }
}
