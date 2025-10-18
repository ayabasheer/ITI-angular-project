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
      this.guests = allGuests.filter((g: Guest) => {
        // guest.eventId may be optional (legacy single-event usage)
        if (g.eventId != null) return myEventIds.has(g.eventId as number);
        // otherwise check eventIds array if present
        if (Array.isArray((g as any).eventIds)) {
          return (g as any).eventIds.some((id: number) => myEventIds.has(id));
        }
        return false;
      });
    } else {
      this.guests = [];
    }
  }

  getEventName(eventId?: number | null): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  }
}
