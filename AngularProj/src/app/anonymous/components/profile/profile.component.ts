import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  events: any[] = [];
  guests: any[] = [];
  invitedEvents: any[] = [];

  constructor(public auth: AuthService) {
    try {
      const rawE = localStorage.getItem('events');
      const rawG = localStorage.getItem('guests');
      this.events = rawE ? JSON.parse(rawE) : [];
      this.guests = rawG ? JSON.parse(rawG) : [];
    } catch {
      this.events = [];
      this.guests = [];
    }

    this.computeInvitedEvents();
  }

  private computeInvitedEvents() {
    const user = this.auth.currentUser;
    if (!user) {
      this.invitedEvents = [];
      return;
    }

    const invitedMap = new Map<number, any>();

    // 1) Events where current user is the organizer/creator
    this.events.forEach((ev: any) => {
      if (ev.createdBy && ev.createdBy === user.id) invitedMap.set(ev.id, ev);
      if (ev.guests && Array.isArray(ev.guests) && ev.guests.includes(user.id)) invitedMap.set(ev.id, ev);
    });

    // 2) Events where there's a guest record matching user's email or id
    this.guests.forEach((g: any) => {
      if (g && (g.email === user.email || g.id === user.id)) {
        const ev = this.events.find((e: any) => e.id === g.eventId);
        if (ev) invitedMap.set(ev.id, ev);
      }
    });

    this.invitedEvents = Array.from(invitedMap.values()).sort((a, b) => {
      // sort by startDate if present
      const da = new Date(a.startDate || 0).getTime();
      const db = new Date(b.startDate || 0).getTime();
      return da - db;
    });
  }

  logout() {
    this.auth.logout();
    window.location.href = '/';
  }
}
