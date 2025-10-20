import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { Event, Feedback, GuestStats, GuestUser } from '../../interfaces/guest.interface';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class OverviewComponent implements OnInit {
  currentUser: GuestUser | null = null;
  events: Event[] = [];
  feedbacks: Feedback[] = [];

  stats: GuestStats = {
    totalInvitations: 0,
    acceptedEvents: 0,
    averageRatingGiven: 0,
    feedbackProvided: 0
  };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadEvents();
    this.loadFeedbacks();
    this.calculateStats();
  }

  private loadUser(): void {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUser = storedUser ? JSON.parse(storedUser) : null;
  }

  private loadEvents(): void {
    const storedEvents = localStorage.getItem('events');
    this.events = storedEvents ? JSON.parse(storedEvents) : [];
  }

  private loadFeedbacks(): void {
    const storedFeedbacks = localStorage.getItem('feedbacks');
    this.feedbacks = storedFeedbacks ? JSON.parse(storedFeedbacks) : [];
  }

  private calculateStats(): void {
    if (!this.currentUser) return;

    const guestId = this.currentUser.id;
    const invitedEvents = this.events.filter(e => (e.guests || []).includes(guestId));

    this.stats.totalInvitations = invitedEvents.length;
    this.stats.acceptedEvents = invitedEvents.filter(e => e.status === 'Completed').length;

    const userFeedbacks = this.feedbacks.filter(fb => fb.guestId === guestId);
    this.stats.feedbackProvided = userFeedbacks.length;
    this.stats.averageRatingGiven = userFeedbacks.length
      ? Number((userFeedbacks.reduce((acc, f) => acc + f.rating, 0) / userFeedbacks.length).toFixed(1))
      : 0;
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'Completed': return 'check_circle';
      case 'InProgress': return 'schedule';
      case 'Cancelled': return 'cancel';
      default: return 'help_outline';
    }
  }

  getStatusColor(status?: string): string {
    switch (status) {
      case 'InProgress': return '#FFA000';
      case 'Completed': return '#4CAF50';
      case 'Cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  goToEvents(): void {
    this.router.navigate(['/events'], { queryParams: { tab: 'events' } });
  }
}
