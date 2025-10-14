import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GuestFeedback } from '../../interfaces/guest.interface';

@Component({
  selector: 'app-feedback',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './feedback.html',
  styleUrl: './feedback.css'
})
export class Feedback {
  feedbackForm!: FormGroup;
  showFeedbackForm: boolean = false;
  stars = [1, 2, 3, 4, 5];

  // Available events for feedback
  availableEvents = [
    { id: 1, name: 'Summer Wedding Reception', date: new Date('2024-06-15') },
    { id: 2, name: 'Corporate Annual Meeting', date: new Date('2024-05-20') },
    { id: 3, name: 'Birthday Party', date: new Date('2024-07-10') },
    { id: 4, name: 'Charity Fundraiser Gala', date: new Date('2024-08-25') }
  ];

  // Sample feedback data
  feedbackList: GuestFeedback[] = [
    {
      id: 1,
      eventId: 1,
      eventName: 'Summer Wedding Reception',
      rating: 5,
      comment: 'Absolutely beautiful wedding! The venue was perfect and the food was delicious. Everything was well organized.',
      createdAt: new Date('2024-06-16')
    },
    {
      id: 2,
      eventId: 2,
      eventName: 'Corporate Annual Meeting',
      rating: 4,
      comment: 'Great presentation and networking opportunities. The venue was professional and well-equipped.',
      createdAt: new Date('2024-05-21')
    }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.feedbackForm = this.fb.group({
      eventId: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onAddFeedback(): void {
    this.showFeedbackForm = true;
    this.feedbackForm.reset();
  }

  onCancelFeedback(): void {
    this.showFeedbackForm = false;
    this.feedbackForm.reset();
  }

  setRating(rating: number): void {
    this.feedbackForm.patchValue({ rating });
  }

  onSubmitFeedback(): void {
    if (this.feedbackForm.valid) {
      const formValue = this.feedbackForm.value;
      const selectedEvent = this.availableEvents.find(e => e.id === formValue.eventId);
      
      if (selectedEvent) {
        const newFeedback: GuestFeedback = {
          id: this.feedbackList.length + 1,
          eventId: formValue.eventId,
          eventName: selectedEvent.name,
          rating: formValue.rating,
          comment: formValue.comment,
          createdAt: new Date()
        };

        this.feedbackList.unshift(newFeedback);
        this.showFeedbackForm = false;
        this.feedbackForm.reset();

        alert('Your feedback has been submitted successfully!');
      }
    }
  }

  onEditFeedback(feedback: GuestFeedback): void {
    const newComment = prompt('Edit your comment:', feedback.comment);
    if (newComment && newComment.length >= 10) {
      feedback.comment = newComment;
      alert('Your feedback has been updated!');
    } else if (newComment) {
      alert('Comment must be at least 10 characters long');
    }
  }

  onDeleteFeedback(feedback: GuestFeedback): void {
    if (confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      const index = this.feedbackList.findIndex(f => f.id === feedback.id);
      if (index > -1) {
        this.feedbackList.splice(index, 1);
      }
      alert('Your feedback has been deleted!');
    }
  }

  getStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'filled' : 'empty');
    }
    return stars;
  }

  // Navigation methods
  onNavItemClick(item: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    console.log(`Navigation to ${item} clicked`);
    
    switch (item) {
      case 'Events':
        this.router.navigate(['/user/events']);
        break;
      case 'Profile':
        this.router.navigate(['/user/profile']);
        break;
    }
  }

  onUserProfileClick(): void {
    console.log('User profile dropdown clicked');
  }

  onViewProfile(): void {
    console.log('View profile clicked');
    this.router.navigate(['/user/profile']);
  }

  onSettings(): void {
    console.log('Settings clicked');
  }

  onLogout(): void {
    console.log('Logout clicked');
    if (confirm('Are you sure you want to logout?')) {
      alert('You have been logged out successfully!');
    }
  }

  onDarkModeToggle(): void {
    console.log('Dark mode toggle clicked');
  }
}
