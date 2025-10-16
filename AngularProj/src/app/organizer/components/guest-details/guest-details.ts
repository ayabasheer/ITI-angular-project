import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Guest } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-guest-details',
  standalone: true,
  imports: [CommonModule, FooterComponent],
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
      this.event = events.find((e: any) => e.id === this.guest!.eventId) || null;
      this.feedback = this.guest!.feedbackId ? feedbacks.find((f: any) => f.id === this.guest!.feedbackId) : null;
    }
  }
}
