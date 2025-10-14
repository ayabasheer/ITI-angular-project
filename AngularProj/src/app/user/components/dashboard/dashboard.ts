import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Events } from '../events/events';
import { Feedback } from '../feedback/feedback';
import { Profile } from '../profile/profile';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, Events, Feedback, Profile],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  isDarkMode = false;
  activeTab: 'Dashboard' | 'Events' | 'Feedback' | 'Profile' = 'Dashboard';
  sidebarOpen: boolean = true;

  userData: any = {};
  invitations: any[] = [];

  constructor() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) this.userData = JSON.parse(storedUser);

    const darkPref = localStorage.getItem('darkMode');
    this.isDarkMode = darkPref === 'true';

    const storedInvitations = localStorage.getItem('invitations');
    if (storedInvitations) this.invitations = JSON.parse(storedInvitations)
      .filter((inv: any) => inv.userId === this.userData.id);
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', String(this.isDarkMode));
  }

  onNavItemClick(tab: 'Dashboard' | 'Events' | 'Feedback' | 'Profile') {
    this.activeTab = tab;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get acceptedEventsCount() {
    return this.invitations.filter(i => i.status === 'accepted').length;
  }

  get pendingEventsCount() {
    return this.invitations.filter(i => i.status === 'pending').length;
  }

  get declinedEventsCount() {
    return this.invitations.filter(i => i.status === 'declined').length;
  }
}
