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
      const allGuests = this.guestService.getAll();
      // Some guests may have eventId undefined or null; ensure it's a number before checking the Set
      this.guests = allGuests.filter((g: Guest) =>
        typeof g.eventIds[0] === 'number' && myEventIds.has(g.eventIds[0])
      );
    } else {
      this.guests = [];
    }
  }

  // Accept nullable eventId because templates may pass undefined/null while
  // type narrowing in component logic doesn't affect template type checking.
  getEventName(eventId?: number | null): string {
    if (typeof eventId !== 'number') {
      return 'Unknown Event';
    }
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  }
}
