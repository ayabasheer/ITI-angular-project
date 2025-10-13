import { Component } from '@angular/core';
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
  rating = 5;
  comment = '';
  message = '';
  ok = false;
  eventId = 0;

  constructor(private route: ActivatedRoute, private feedback: FeedbackService, private router: Router) {
    const id = this.route.snapshot.paramMap.get('id');
    this.eventId = id ? +id : 0;
  }

  submit(e: Event) {
    e.preventDefault();
    const payload = { guestId: Number(this.guestId), eventId: this.eventId, rating: Number(this.rating), comment: this.comment };
    const res = this.feedback.submitFeedback(payload);
    if (res.success) {
      this.ok = true; this.message = 'Feedback submitted — thank you!';
    } else {
      this.ok = false; this.message = res.message || 'Error';
    }
  }
}
