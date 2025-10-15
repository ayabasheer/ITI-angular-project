import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GuestService } from '../../../shared/services/guest';
import { Guest } from '../../../shared/models/interfaces';
import { EventService } from '../../../shared/services/event';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-guest',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './guest.html',
  styleUrls: ['./guest.css']
})
export class Guests implements OnInit {
  guests: Guest[] = [];

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
  const allGuests = this.guestService.getAll();
  this.guests = allGuests.filter((g: Guest) => myEventIds.has(g.eventId));
    } else {
      this.guests = [];
    }
  }
}
