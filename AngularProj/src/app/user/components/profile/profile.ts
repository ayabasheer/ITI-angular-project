import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  isEditMode: boolean = false;
  isEditing: boolean = false;
  profileForm!: FormGroup;
  isDarkMode: boolean = false;
  activeTab: string = 'Profile';

  // User profile data
  userProfile = {
    name: 'Eslam Ghanem',
    email: 'eslam.ghanem@example.com',
    phone: '+20 111 234 5678',
    location: 'Cairo, Egypt',
    dateOfBirth: '1998-03-15',
    occupation: 'Full Stack Web Developer',
    company: 'Freelancer / ITI Trainee',
    bio: 'Motivated Full Stack Developer skilled in PHP and modern JavaScript frameworks. Passionate about clean code, responsive design, and creating user-focused solutions.',
    role: 'Event Guest',
    avatar: null,
    twoFactorEnabled: false,
    emailNotifications: true
  };

  // Guest statistics
  guestStats = {
    totalInvitations: 12,
    acceptedEvents: 8,
    averageRatingGiven: 4.2,
    feedbackProvided: 6
  };

  // Recent feedback data
  recentFeedback: GuestFeedback[] = [
    {
      id: 1,
      eventId: 102,
      eventName: 'Corporate Annual Meeting',
      rating: 5,
      comment: 'Excellent event with great networking opportunities. The venue was perfect and the presentations were very informative.',
      createdAt: new Date('2024-05-22')
    },
    {
      id: 2,
      eventId: 101,
      eventName: 'Summer Wedding Reception',
      rating: 4,
      comment: 'Beautiful wedding reception! The garden setting was lovely and the food was delicious. Great celebration.',
      createdAt: new Date('2024-06-16')
    },
    {
      id: 3,
      eventId: 103,
      eventName: 'Birthday Party',
      rating: 5,
      comment: 'Amazing surprise party! Everything was perfectly organized and the birthday person was truly surprised.',
      createdAt: new Date('2024-07-11')
    }
  ];

  constructor(private fb: FormBuilder, private router: Router) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      name: [this.userProfile.name, [Validators.required, Validators.minLength(2)]],
      email: [this.userProfile.email, [Validators.required, Validators.email]],
      phone: [this.userProfile.phone],
      company: [this.userProfile.company],
      bio: [this.userProfile.bio]
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.initializeForm();
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.profileForm.reset();
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      // Update user profile with form data
      this.userProfile = {
        ...this.userProfile,
        ...this.profileForm.value
      };
      
      this.isEditMode = false;
      console.log('Profile updated:', this.userProfile);
      
      // In a real application, you would call a service to save the data
      // this.userService.updateProfile(this.userProfile).subscribe(...)
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to show validation errors
      Object.keys(this.profileForm.controls).forEach(key => {
        this.profileForm.get(key)?.markAsTouched();
      });
    }
  }

  onChangePassword(): void {
    console.log('Change password clicked');
    // Open change password modal or navigate to change password page
  }

  onToggleTwoFactor(): void {
    console.log('Two-factor authentication toggled:', this.userProfile.twoFactorEnabled);
    // In a real application, you would call a service to update the setting
    // this.userService.updateTwoFactor(this.userProfile.twoFactorEnabled).subscribe(...)
  }

  onToggleEmailNotifications(): void {
    console.log('Email notifications toggled:', this.userProfile.emailNotifications);
    // In a real application, you would call a service to update the setting
    // this.userService.updateEmailNotifications(this.userProfile.emailNotifications).subscribe(...)
  }

  onExportData(): void {
    console.log('Export data clicked');
    // In a real application, you would call a service to generate and download data export
    // this.userService.exportData().subscribe(...)
  }

  onAvatarUpload(): void {
    console.log('Avatar upload clicked');
    // Handle avatar upload logic
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
    this.activeTab = item;
    console.log(`Navigation to ${item} clicked`);
    
    // Navigate to the appropriate route
    switch (item) {
      case 'Dashboard':
        this.router.navigate(['/user/dashboard']);
        break;
      case 'Events':
        this.router.navigate(['/user/events']);
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

  // New methods for enhanced profile
  editProfile(): void {
    this.isEditing = !this.isEditing;
    console.log('Edit profile mode:', this.isEditing);
  }

  changeAvatar(): void {
    console.log('Change avatar clicked');
    // In a real app, this would open a file picker
    alert('Avatar change functionality would be implemented here');
  }


  toggleDarkMode(): void {
    this.isDarkMode = !this.isDarkMode;
    console.log('Dark mode toggled:', this.isDarkMode);
  }

  // Statistics getters
  get totalEvents(): number {
    return this.guestStats.totalInvitations;
  }

  get completedEvents(): any[] {
    return []; // This would come from actual data
  }

  get feedbackList(): any[] {
    return this.recentFeedback;
  }

  getAverageRating(): number {
    if (this.recentFeedback.length === 0) return 0;
    const total = this.recentFeedback.reduce((sum, feedback) => sum + feedback.rating, 0);
    return Math.round((total / this.recentFeedback.length) * 10) / 10;
  }
}

interface GuestFeedback {
  id: number;
  eventId: number;
  eventName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}
