import { Component } from '@angular/core';
import { AuthService } from '../../../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FeedbackService } from '../../../shared/services/feedback.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.component.html'
})
export class FeedbackComponent {
  guestId = '';
  isGuest = false;
  canLeaveFeedback = false;
  event: any = null;
  rating = 5;
  comment = '';
  message = '';
  ok = false;
  eventId = 0;

  constructor(private route: ActivatedRoute, private feedback: FeedbackService, private router: Router, private auth: AuthService) {
    const id = this.route.snapshot.paramMap.get('id');
    this.eventId = id ? +id : 0;

    // Get current user from session
    const user = this.auth.currentUser;
    this.isGuest = !!user && user.role === 'Guest';
    if (this.isGuest && user) {
      this.guestId = String(user.id);
    }

    // Load event and check eligibility
    const rawE = localStorage.getItem('events');
    const rawG = localStorage.getItem('guests');
    const events = rawE ? JSON.parse(rawE) : [];
    const guests = rawG ? JSON.parse(rawG) : [];
    this.event = events.find((e: any) => e.id === this.eventId);
    const guest = guests.find((g: any) => g.id === (user?.id));
    this.canLeaveFeedback = !!(
      this.isGuest &&
      this.event &&
      this.event.status === 'Completed' &&
      guest &&
      guest.eventId === this.eventId
    );
  }

  submit(e: Event) {
    e.preventDefault();
    if (!this.canLeaveFeedback) {
      this.ok = false;
      this.message = 'You are not allowed to leave feedback for this event.';
      return;
    }
    const payload = { guestId: Number(this.guestId), eventId: this.eventId, rating: Number(this.rating), comment: this.comment };
    const res = this.feedback.submitFeedback(payload);
    if (res.success) {
      this.ok = true; this.message = 'Feedback submitted — thank you!';
    } else {
      this.ok = false; this.message = res.message || 'Error';
    }
  }
}
