import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-events',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class Events {
  searchQuery: string = '';
  selectedFilter: string = 'all';
  isLoading: boolean = false;

  // Sample guest invitations data
  invitations: GuestInvitation[] = [
    {
      id: 1,
      eventId: 101,
      eventName: 'Summer Wedding Reception',
      eventDescription: 'Beautiful outdoor wedding reception with garden party theme',
      eventDate: new Date('2024-06-15'),
      eventTime: '6:00 PM',
      location: 'Garden Venue, Downtown',
      organizerName: 'Sarah Johnson',
      status: 'pending',
      invitedDate: new Date('2024-05-01'),
      respondedDate: null,
      canProvideFeedback: false,
      eventImage: null
    },
    {
      id: 2,
      eventId: 102,
      eventName: 'Corporate Annual Meeting',
      eventDescription: 'Annual company meeting with presentations and networking',
      eventDate: new Date('2024-05-20'),
      eventTime: '9:00 AM',
      location: 'Convention Center',
      organizerName: 'Mike Chen',
      status: 'accepted',
      invitedDate: new Date('2024-04-15'),
      respondedDate: new Date('2024-04-16'),
      canProvideFeedback: true,
      eventImage: null
    },
    {
      id: 3,
      eventId: 103,
      eventName: 'Birthday Party',
      eventDescription: 'Planning a surprise birthday party for milestone celebration',
      eventDate: new Date('2024-07-10'),
      eventTime: '7:00 PM',
      location: 'Private Residence',
      organizerName: 'Emma Wilson',
      status: 'accepted',
      invitedDate: new Date('2024-06-01'),
      respondedDate: new Date('2024-06-02'),
      canProvideFeedback: false,
      eventImage: null
    },
    {
      id: 4,
      eventId: 104,
      eventName: 'Charity Fundraiser Gala',
      eventDescription: 'Elegant gala event to raise funds for local charity',
      eventDate: new Date('2024-08-25'),
      eventTime: '7:30 PM',
      location: 'Grand Hotel Ballroom',
      organizerName: 'David Brown',
      status: 'declined',
      invitedDate: new Date('2024-07-01'),
      respondedDate: new Date('2024-07-02'),
      canProvideFeedback: false,
      eventImage: null
    },
    {
      id: 5,
      eventId: 105,
      eventName: 'Product Launch Event',
      eventDescription: 'Launch event for new product line with media coverage',
      eventDate: new Date('2024-09-05'),
      eventTime: '2:00 PM',
      location: 'Tech Hub Auditorium',
      organizerName: 'Lisa Anderson',
      status: 'pending',
      invitedDate: new Date('2024-08-01'),
      respondedDate: null,
      canProvideFeedback: false,
      eventImage: null
    }
  ];

  get filteredInvitations(): GuestInvitation[] {
    let filtered = this.invitations;

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(invitation => 
        invitation.eventName.toLowerCase().includes(query) ||
        invitation.eventDescription.toLowerCase().includes(query) ||
        invitation.location.toLowerCase().includes(query) ||
        invitation.organizerName.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(invitation => invitation.status === this.selectedFilter);
    }

    return filtered;
  }

  constructor(private router: Router) {
    this.loadInvitations();
  }

  private loadInvitations(): void {
    this.isLoading = true;
    // Simulate API call to load guest invitations
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  onRefreshInvitations(): void {
    console.log('Refresh invitations clicked');
    this.loadInvitations();
  }

  onInvitationClick(invitation: GuestInvitation): void {
    console.log('Invitation clicked:', invitation);
    // Navigate to event details page or show invitation details
  }

  onAcceptInvitation(invitation: GuestInvitation, event: Event): void {
    event.stopPropagation();
    console.log('Accept invitation:', invitation);
    
    // Update invitation status
    invitation.status = 'accepted';
    invitation.respondedDate = new Date();
    
    // In a real application, this would call an API
    // this.guestService.acceptInvitation(invitation.id).subscribe(...)
  }

  onDeclineInvitation(invitation: GuestInvitation, event: Event): void {
    event.stopPropagation();
    console.log('Decline invitation:', invitation);
    
    // Update invitation status
    invitation.status = 'declined';
    invitation.respondedDate = new Date();
    
    // In a real application, this would call an API
    // this.guestService.declineInvitation(invitation.id).subscribe(...)
  }

  onProvideFeedback(invitation: GuestInvitation, event: Event): void {
    event.stopPropagation();
    console.log('Provide feedback for:', invitation);
    // Open feedback modal or navigate to feedback page
  }

  onSearchChange(): void {
    // Search is handled by the filteredInvitations getter
    console.log('Search query changed:', this.searchQuery);
  }

  onFilterChange(filter: string): void {
    this.selectedFilter = filter;
    console.log('Filter changed to:', filter);
  }

  trackByInvitationId(index: number, invitation: GuestInvitation): number {
    return invitation.id;
  }

  // Navigation methods
  onNavItemClick(item: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    console.log(`Navigation to ${item} clicked`);
    
    // Navigate to the appropriate route
    switch (item) {
      case 'Dashboard':
        this.router.navigate(['/user/dashboard']);
        break;
      case 'Invitations':
        this.router.navigate(['/user/invitations']);
        break;
      case 'Upcoming':
        this.router.navigate(['/user/upcoming']);
        break;
      case 'Attended':
        this.router.navigate(['/user/attended']);
        break;
      case 'Feedback':
        this.router.navigate(['/user/feedback']);
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
    // Navigate to settings page
  }

  onLogout(): void {
    console.log('Logout clicked');
    if (confirm('Are you sure you want to logout?')) {
      // Perform logout
    }
  }

  onDarkModeToggle(): void {
    console.log('Dark mode toggle clicked');
    // Toggle dark mode
  }

  // Page title and subtitle methods
  getPageTitle(): string {
    const currentUrl = this.router.url;
    if (currentUrl.includes('invitations')) return 'My Invitations';
    if (currentUrl.includes('upcoming')) return 'Upcoming Events';
    if (currentUrl.includes('attended')) return 'Attended Events';
    if (currentUrl.includes('feedback')) return 'My Feedback';
    return 'My Invitations';
  }

  getPageSubtitle(): string {
    const currentUrl = this.router.url;
    if (currentUrl.includes('invitations')) return 'View and manage your event invitations';
    if (currentUrl.includes('upcoming')) return 'Events you have accepted and will attend';
    if (currentUrl.includes('attended')) return 'Events you have already attended';
    if (currentUrl.includes('feedback')) return 'Feedback you have provided for events';
    return 'View and manage your event invitations';
  }
}

interface GuestInvitation {
  id: number;
  eventId: number;
  eventName: string;
  eventDescription: string;
  eventDate: Date;
  eventTime: string;
  location: string;
  organizerName: string;
  status: 'pending' | 'accepted' | 'declined';
  invitedDate: Date;
  respondedDate: Date | null;
  canProvideFeedback: boolean;
  eventImage: string | null;
}
