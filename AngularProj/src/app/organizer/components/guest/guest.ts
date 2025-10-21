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
  isDarkMode: boolean = false;

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
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    window.addEventListener('theme:changed', (e: any) => {
      this.isDarkMode = e.detail.dark;
    });

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
    let ids: number[] = [];
    if (typeof eventRef === 'number') ids = [eventRef];
    else if (Array.isArray(eventRef)) ids = eventRef;
    else return 'Unknown Event';

    // Find the first event ID that belongs to the current organizer's events
    for (const id of ids) {
      const event = this.events.find((e: any) => e.id === id);
      if (event) return event.name;
    }
    return 'Unknown Event';
  }
}
