import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';
import { EventService } from '../../../shared/services/event';
import { Feedback as FeedbackModel } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class OrganizerFeedback implements OnInit {
  feedbacks: any[] = [];
  events: any[] = [];
  guests: any[] = [];

  constructor(private auth: AuthService, private eventService: EventService) {}

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user && user.role === 'Organizer') {
      const myEventIds = new Set<number>(
        this.eventService
          .getAll()
          .filter(e => e.createdBy === user.id)
          .map(e => e.id)
      );
      this.events = this.eventService.getAll().filter(e => myEventIds.has(e.id));

      const rawFeedbacks = localStorage.getItem('feedbacks');
      const allFeedbacks = rawFeedbacks ? JSON.parse(rawFeedbacks) : [];

      const rawGuests = localStorage.getItem('guests');
      this.guests = rawGuests ? JSON.parse(rawGuests) : [];

  this.feedbacks = allFeedbacks.filter((f: FeedbackModel) => typeof f.eventId === 'number' && myEventIds.has(f.eventId));
    } else {
      this.feedbacks = [];
    }
  }

  getEventName(eventId?: number | null): string {
    if (typeof eventId !== 'number') return 'Unknown Event';
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  }

  getGuestName(guestId: number): string {
    const guest = this.guests.find(g => g.id === guestId);
    return guest ? guest.name : 'Unknown Guest';
  }
}
