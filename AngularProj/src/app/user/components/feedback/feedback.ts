import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Event, Feedback, GuestUser } from '../../interfaces/guest.interface';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, FormsModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class FeedbackComponent implements OnInit {
  feedbacks: Feedback[] = [];
  events: Event[] = [];
  currentUser: GuestUser | null = null;

  newComment: string = '';
  newRating: number = 0;
  selectedEventId: number = 0;

  stars: number[] = [1, 2, 3, 4, 5];
  userEvents: Event[] = [];

  ngOnInit(): void {
    this.loadUser();
    this.loadEvents();
    this.loadFeedbacks();
    this.prepareUserEvents();
  }

  private loadUser(): void {
    const user = localStorage.getItem('currentUser');
    this.currentUser = user ? JSON.parse(user) : null;
  }

  private loadEvents(): void {
    const stored = localStorage.getItem('events');
    this.events = stored ? JSON.parse(stored) : [];
  }

  private loadFeedbacks(): void {
    const stored = localStorage.getItem('feedbacks');
    const allFeedbacks: Feedback[] = stored ? JSON.parse(stored) : [];
    if (this.currentUser) {
      this.feedbacks = allFeedbacks
        .filter(f => Number(f.guestId) === Number(this.currentUser!.id))
        .map(f => ({ ...f, rating: Number(f.rating) }));
    }
  }

  private prepareUserEvents(): void {
    if (!this.currentUser) return;
    const now = new Date();

    this.userEvents = this.events.filter(ev => {
      const guestIds = (ev.guests as (GuestUser | number)[] | undefined)
        ?.map(g => typeof g === 'number' ? g : g.id) || [];

      return guestIds.includes(this.currentUser!.id) &&
             new Date(ev.endDate) <= now &&
             !this.feedbacks.some(fb => fb.eventId === ev.id);
    });

    if (this.userEvents.length > 0) {
      this.selectedEventId = this.userEvents[0].id;
    }
  }

  getEventName(eventId?: number | null): string {
    if (typeof eventId !== 'number') return 'Unknown Event';
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  }

  selectRating(rating: number): void {
    this.newRating = rating;
  }

  addFeedback(): void {
    if (!this.newComment.trim() || this.newRating < 1 || this.newRating > 5 || !this.selectedEventId) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Feedback',
        text: 'Please enter a comment, select an event, and choose a rating between 1 and 5.',
      });
      return;
    }

    const allFeedbacksStored: Feedback[] = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const lastId = allFeedbacksStored.length ? Math.max(...allFeedbacksStored.map(f => f.id)) : 0;

    const newFb: Feedback = {
      id: lastId + 1,
      guestId: Number(this.currentUser!.id),
      eventId: this.selectedEventId,
      comment: this.newComment.trim(),
      rating: this.newRating,
      createdAt: new Date().toISOString()
    };

    console.log('Saving feedback:', newFb); // Debugging

    this.feedbacks.push(newFb);
    allFeedbacksStored.push(newFb);
    localStorage.setItem('feedbacks', JSON.stringify(allFeedbacksStored));

    Swal.fire({
      icon: 'success',
      title: 'Feedback Submitted',
      text: 'Your feedback has been successfully added!',
    });

    this.newComment = '';
    this.newRating = 0;

    this.prepareUserEvents();
  }
}
