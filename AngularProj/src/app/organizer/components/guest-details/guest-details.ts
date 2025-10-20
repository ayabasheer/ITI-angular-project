import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Guest } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-guest-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest-details.html',
  styleUrls: ['./guest-details.css']
})
export class GuestDetails {
  guest: Guest | null = null;
  event: any = null;
  feedback: any = null;

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const rawG = localStorage.getItem('guests');
    const rawE = localStorage.getItem('events');
    const rawF = localStorage.getItem('feedbacks');
    const guests = rawG ? JSON.parse(rawG) : [];
    const events = rawE ? JSON.parse(rawE) : [];
    const feedbacks = rawF ? JSON.parse(rawF) : [];
    this.guest = guests.find((g: Guest) => g.id === id) || null;
    if (this.guest) {
      // Get all events the guest is invited to, but filter to only show organizer's events
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (currentUser.role === 'Organizer') {
        const myEvents = events.filter((e: any) => e.createdBy === currentUser.id);
        const guestEventIds = Array.isArray(this.guest.eventIds) ? this.guest.eventIds : (this.guest.eventId ? [this.guest.eventId] : []);
        const myGuestEvents = myEvents.filter((e: any) => guestEventIds.includes(e.id));
        this.event = myGuestEvents.length ? myGuestEvents : null; // Set to array or null
      } else {
        this.event = null;
      }
      this.feedback = this.guest!.feedbackId ? feedbacks.find((f: any) => f.id === this.guest!.feedbackId) : null;
    }
  }
}
