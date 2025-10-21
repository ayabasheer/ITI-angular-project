import { Component, OnInit } from '@angular/core';
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
export class GuestDetails implements OnInit {
  guest: Guest | null = null;
  event: any = null;
  feedback: any = null;
  isDarkMode: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    window.addEventListener('theme:changed', (e: any) => {
      this.isDarkMode = e.detail.dark;
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    const rawG = localStorage.getItem('guests');
    const rawE = localStorage.getItem('events');
    const rawF = localStorage.getItem('feedbacks');
    const guests = rawG ? JSON.parse(rawG) : [];
    const events = rawE ? JSON.parse(rawE) : [];
    const feedbacks = rawF ? JSON.parse(rawF) : [];
    this.guest = guests.find((g: Guest) => g.id === id) || null;
    if (this.guest) {
      const gid = Array.isArray(this.guest.eventIds) && this.guest.eventIds.length ? this.guest.eventIds[0] : this.guest.eventId;
      this.event = events.find((e: any) => e.id === gid) || null;
      this.feedback = this.guest!.feedbackId ? feedbacks.find((f: any) => f.id === this.guest!.feedbackId) : null;
    }
  }

  goBack() {
    window.history.back();
  }

  goForward() {
    window.history.forward();
  }
}
