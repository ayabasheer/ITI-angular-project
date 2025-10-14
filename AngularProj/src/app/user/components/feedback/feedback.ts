import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface FeedbackItem {
  id: number;
  userId: string;
  eventName: string;
  comment: string;
  rating: number; // 1-5
}

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feedback.html',
  styleUrls: ['./feedback.css']
})
export class Feedback implements OnInit {
  userId: string = '';
  feedbacks: FeedbackItem[] = [];
  newComment: string = '';
  newRating: number = 5;
  selectedEvent: string = '';

  constructor() {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    if (userData) this.userId = JSON.parse(userData).id;

    const storedFeedbacks = localStorage.getItem('feedbacks');
    if (storedFeedbacks) {
      this.feedbacks = JSON.parse(storedFeedbacks).filter((f: FeedbackItem) => f.userId === this.userId);
    }
  }

  submitFeedback() {
    if (!this.selectedEvent || !this.newComment.trim()) {
      Swal.fire('Error', 'Please select an event and write a comment', 'error');
      return;
    }

    const id = Date.now();
    const feedback: FeedbackItem = {
      id,
      userId: this.userId,
      eventName: this.selectedEvent,
      comment: this.newComment,
      rating: this.newRating
    };

    this.feedbacks.push(feedback);
    this.updateLocalStorage();

    Swal.fire('Success', 'Your feedback has been submitted!', 'success');

    // Reset form
    this.newComment = '';
    this.newRating = 5;
    this.selectedEvent = '';
  }

  private updateLocalStorage() {
    const allFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    allFeedbacks.push(this.feedbacks[this.feedbacks.length - 1]);
    localStorage.setItem('feedbacks', JSON.stringify(allFeedbacks));
  }

  getEventsForUser(): string[] {
    const storedInvitations = localStorage.getItem('invitations');
    if (!storedInvitations) return [];
    const userInvitations = JSON.parse(storedInvitations).filter((inv: any) => inv.userId === this.userId);
    return userInvitations.map((inv: any) => inv.eventName);
  }
}
