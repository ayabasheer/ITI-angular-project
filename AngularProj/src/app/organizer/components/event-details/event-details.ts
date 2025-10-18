import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "event-details.html",
  styleUrls: ['event-details.css']
})
export class EventDetails {
  event: any = null;
  organizer: any = null;
  feedbacks: any[] = [];
  guests: any[] = [];
  defaultImage = 'https://via.placeholder.com/400x250?text=Event';

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const rawE = localStorage.getItem('events');
    const rawO = localStorage.getItem('organizers');
    const rawF = localStorage.getItem('feedbacks');
    const rawG = localStorage.getItem('guests');
    const events = rawE ? JSON.parse(rawE) : [];
    const organizers = rawO ? JSON.parse(rawO) : [];
    const feedbacks = rawF ? JSON.parse(rawF) : [];
    const guests = rawG ? JSON.parse(rawG) : [];
    this.event = events.find((e: any) => e.id === id);
    this.organizer = this.event ? organizers.find((o: any) => o.id === this.event.organizerId) : null;
    this.feedbacks = this.event && this.event.feedbacks ? this.event.feedbacks.map((fid: number) => feedbacks.find((f: any) => f.id === fid)).filter((f: any) => f) : [];
    this.guests = guests;
  }

  getGuestName(guestId: number) {
    const g = this.guests.find((x: any) => x.id === guestId);
    return g ? g.name || g.email || ('Guest #' + g.id) : 'Guest';
  }
}
