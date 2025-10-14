import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { EventDetails, GuestInvitation, UpcomingEvent, GuestFeedback } from '../../interfaces/guest.interface';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  // Dark mode state
  isDarkMode: boolean = false;
  
  // Active tab state
  activeTab: string = 'Dashboard';
  
  // Event filter state
  eventFilter: string = 'all';

  // Dashboard metrics matching the image design
  totalEvents: number = 5;
  upcomingEvents: number = 3;
  completedEventsCount: number = 2;
  totalGuests: number = 25;
  totalExpenses: number = 12500;
  eventProgress: number = 80;

  // Monthly events data for bar chart
  monthlyEvents = [
    { label: 'Jan', value: 2 },
    { label: 'Feb', value: 1 },
    { label: 'Mar', value: 4 },
    { label: 'Apr', value: 3 },
    { label: 'May', value: 2 }
  ];

  // Events data
  allEvents: any[] = [
    {
      id: 1,
      name: 'Summer Wedding Reception',
      description: 'A beautiful outdoor wedding reception with garden setting and live music.',
      date: new Date('2024-06-15'),
      time: '6:00 PM - 11:00 PM',
      location: 'Garden Venue, Downtown',
      status: 'completed',
      organizer: 'Sarah Johnson',
      guestCount: 150,
      budget: 25000
    },
    {
      id: 2,
      name: 'Corporate Annual Meeting',
      description: 'Annual company meeting with presentations and networking.',
      date: new Date('2024-05-20'),
      time: '9:00 AM - 5:00 PM',
      location: 'Convention Center',
      status: 'completed',
      organizer: 'Tech Solutions Inc.',
      guestCount: 200,
      budget: 15000
    },
    {
      id: 3,
      name: 'Birthday Party',
      description: 'Surprise birthday party for a close friend.',
      date: new Date('2024-07-10'),
      time: '7:00 PM - 12:00 AM',
      location: 'Private Residence',
      status: 'declined',
      organizer: 'Mike Wilson',
      guestCount: 30,
      budget: 2000
    },
    {
      id: 4,
      name: 'Charity Fundraiser Gala',
      description: 'Elegant gala event to raise funds for local charity.',
      date: new Date('2024-08-25'),
      time: '7:30 PM - 11:30 PM',
      location: 'Grand Hotel Ballroom',
      status: 'accepted',
      organizer: 'David Brown',
      guestCount: 300,
      budget: 50000
    },
    {
      id: 5,
      name: 'Product Launch Event',
      description: 'Launch of new product line with demonstrations and networking.',
      date: new Date('2024-09-15'),
      time: '2:00 PM - 6:00 PM',
      location: 'Innovation Center',
      status: 'pending',
      organizer: 'Innovation Corp',
      guestCount: 100,
      budget: 12000
    }
  ];

  // Feedback data
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
      eventId: 4,
      eventName: 'Charity Fundraiser Gala',
      rating: 4,
      comment: 'Great event for a good cause. The atmosphere was elegant and the entertainment was wonderful.',
      createdAt: new Date('2024-08-26')
    }
  ];

  get maxMonthlyEvents(): number {
    return Math.max(...this.monthlyEvents.map(m => m.value));
  }

  get acceptedEvents(): any[] {
    return this.allEvents.filter(event => event.status === 'accepted');
  }

  get pendingEvents(): any[] {
    return this.allEvents.filter(event => event.status === 'pending');
  }

  get declinedEvents(): any[] {
    return this.allEvents.filter(event => event.status === 'declined');
  }

  get completedEvents(): any[] {
    return this.allEvents.filter(event => event.status === 'completed');
  }

  get filteredEvents(): any[] {
    if (this.eventFilter === 'all') {
      return this.allEvents;
    }
    return this.allEvents.filter(event => event.status === this.eventFilter);
  }

  // Upcoming events for timeline
  upcomingEventsList: UpcomingEvent[] = [
    {
      id: 101,
      name: 'Summer Wedding Reception',
      startDate: new Date('2024-06-15'),
      status: 'accepted'
    },
    {
      id: 103,
      name: 'Birthday Party',
      startDate: new Date('2024-07-10'),
      status: 'accepted'
    },
    {
      id: 105,
      name: 'Product Launch Event',
      startDate: new Date('2024-09-05'),
      status: 'pending'
    }
  ];

  constructor(private router: Router) {
    // Initialize dashboard data
  }

  onViewInvitations(): void {
    console.log('View invitations clicked');
    // Navigate to invitations page or open modal
  }

  // Dark mode toggle
  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    console.log('Dark mode toggled:', this.isDarkMode);
  }

  // Navigation methods
  onNavItemClick(item: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeTab = item;
    console.log(`Navigation to ${item} clicked`);
  }

  // Event filtering
  setEventFilter(filter: string): void {
    this.eventFilter = filter;
    console.log('Event filter changed to:', filter);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'accepted': return 'badge bg-success';
      case 'pending': return 'badge bg-warning';
      case 'declined': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  // Event details popup
  showEventDetails(event: any): void {
    const eventDetails: EventDetails = {
      id: event.id,
      name: event.name,
      description: event.description,
      category: 'Event',
      location: event.location,
      startDate: event.date,
      endDate: event.date,
      time: event.time,
      organizerName: 'Event Organizer',
      guestCount: 150,
      budget: 25000,
      progress: 75,
      status: 'upcoming',
      image: null,
      tasks: [],
      expenses: []
    };

    // Simple alert for now - can be replaced with SweetAlert later
    const message = `
Event: ${eventDetails.name}
Description: ${eventDetails.description}
Date: ${eventDetails.startDate.toLocaleDateString()}
Time: ${eventDetails.time}
Location: ${eventDetails.location}
Organizer: ${eventDetails.organizerName}
Guests: ${eventDetails.guestCount}
Budget: $${eventDetails.budget.toLocaleString()}
Progress: ${eventDetails.progress}%
    `;
    
    alert(message);
  }

  // Feedback methods
  showAddFeedbackModal(event?: any): void {
    if (event) {
      // Direct feedback for specific event
      this.addFeedback(event);
    } else {
      // Show modal to select event
      const eventOptions = this.allEvents
        .filter(event => event.status === 'completed')
        .map(event => `${event.id}:${event.name}`)
        .join('\n');
      
      const eventId = prompt(`Select a completed event to provide feedback:\n${eventOptions}\n\nEnter event ID:`);
      if (eventId) {
        const selectedEvent = this.allEvents.find(e => e.id == eventId);
        if (selectedEvent) {
          this.addFeedback(selectedEvent);
        }
      }
    }
  }

  addFeedback(event: any): void {
    const ratingInput = prompt('Rate this event (1-5 stars):');
    if (ratingInput) {
      const rating = parseInt(ratingInput);
      if (rating >= 1 && rating <= 5) {
        const comment = prompt('Add your comment:');
        if (comment && comment.length >= 10) {
          const newFeedback: GuestFeedback = {
            id: this.feedbackList.length + 1,
            eventId: event.id,
            eventName: event.name,
            rating: rating,
            comment: comment,
            createdAt: new Date()
          };
          this.feedbackList.unshift(newFeedback);
          alert('Feedback added successfully!');
        } else {
          alert('Comment must be at least 10 characters long');
        }
      } else {
        alert('Please enter a valid rating between 1 and 5');
      }
    }
  }

  editFeedback(feedback: GuestFeedback): void {
    const newComment = prompt('Edit your comment:', feedback.comment);
    if (newComment && newComment.length >= 10) {
      feedback.comment = newComment;
      alert('Feedback updated successfully!');
    } else if (newComment) {
      alert('Comment must be at least 10 characters long');
    }
  }

  deleteFeedback(feedback: GuestFeedback): void {
    if (confirm('Are you sure you want to delete this feedback?')) {
      const index = this.feedbackList.findIndex(f => f.id === feedback.id);
      if (index > -1) {
        this.feedbackList.splice(index, 1);
        alert('Feedback deleted successfully!');
      }
    }
  }

  getStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'filled' : 'empty');
    }
    return stars;
  }

  getAverageRating(): number {
    if (this.feedbackList.length === 0) return 0;
    const total = this.feedbackList.reduce((sum, feedback) => sum + feedback.rating, 0);
    return Math.round((total / this.feedbackList.length) * 10) / 10;
  }

  onUserProfileClick(): void {
    console.log('User profile dropdown clicked');
  }

  onViewProfile(): void {
    console.log('View profile clicked');
    // Navigate to profile page
  }

  onSettings(): void {
    console.log('Settings clicked');
    // Navigate to settings page
  }

  onLogout(): void {
    console.log('Logout clicked');
    if (confirm('Are you sure you want to logout?')) {
      alert('You have been logged out successfully!');
      // Perform actual logout logic here
    }
  }

  onDarkModeToggle(): void {
    console.log('Dark mode toggle clicked');
    // Toggle dark mode
  }

}

