import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GuestService } from '../../../shared/services/guest';
import { Guest } from '../../../shared/models/interfaces';
import { EventService } from '../../../shared/services/event';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-guest',
  imports: [CommonModule, RouterModule],
  standalone: true,
  templateUrl: './guest.html',
  styleUrls: ['./guest.css']
})
export class Guests implements OnInit {
  guests: Guest[] = [];
  events: any[] = [];

  constructor(
    private guestService: GuestService,
    private eventService: EventService,
    private auth: AuthService
  ) {}

  goBack() {
    window.history.back();
  }

  goForward() {
    window.history.forward();
  }

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
      // gather guests for all organizer events
      const guestsForAll: Guest[] = [];
      for (const id of myEventIds) {
        const gs = this.guestService.getForEvent(id);
        gs.forEach((g: Guest) => {
          // avoid duplicates
          if (!guestsForAll.find(x => x.id === g.id)) guestsForAll.push(g);
        });
      }
      this.guests = guestsForAll;
    } else {
      this.guests = [];
    }
  }

  // Accept nullable eventId because templates may pass undefined/null while
  // type narrowing in component logic doesn't affect template type checking.
  // Accept either a single eventId or an array of eventIds; used by templates.
  getEventName(eventRef?: number | number[] | null): string {
    const user = this.auth.currentUser;
    if (!user) return 'No Events';
    const myEventIds = new Set<number>(
      this.eventService
        .getAll()
        .filter(e => e.createdBy === user.id)
        .map(e => e.id)
    );

    if (Array.isArray(eventRef) && eventRef.length > 0) {
      // Multiple events: show names of events created by this organizer
      const filteredIds = eventRef.filter(id => myEventIds.has(id));
      const eventNames = filteredIds.map(id => {
        const event = this.events.find((e: any) => e.id === id);
        return event ? `${event.name} — ${event.category}` : 'Unknown Event';
      });
      return eventNames.length ? eventNames.join(', ') : 'No Events';
    } else if (typeof eventRef === 'number') {
      // Single event
      if (!myEventIds.has(eventRef)) return 'No Events';
      const event = this.events.find((e: any) => e.id === eventRef);
      return event ? `${event.name} — ${event.category}` : 'Unknown Event';
    } else {
      return 'No Events';
    }
  }
}
