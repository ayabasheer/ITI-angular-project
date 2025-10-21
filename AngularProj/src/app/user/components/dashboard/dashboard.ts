import { Component, OnInit, HostListener, ViewChild, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import Swal from 'sweetalert2';

import { GuestUser } from '../../interfaces/guest.interface';
import { FeedbackComponent } from '../feedback/feedback';
import { EventsComponent } from '../events/events';
import { ProfileComponent } from '../profile/profile';
import { OverviewComponent } from '../overview/overview';
import { InvitationsComponent } from '../invitations/invitations';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatCardModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  sidebarOpen = true;
  darkMode = false;
  isMobile = false;

  currentTab: 'overview' | 'feedback' | 'events' | 'invitations' | 'profile' = 'overview';

  tabComponents: Record<string, Type<any>> = {
    overview: OverviewComponent,
    feedback: FeedbackComponent,
    events: EventsComponent,
    profile: ProfileComponent,
    invitations: InvitationsComponent
  };

  get currentComponent(): Type<any> {
    return this.tabComponents[this.currentTab];
  }

  currentUser: GuestUser | null = null;

  ngOnInit(): void {
    this.loadUser();
    this.loadThemeMode();
    this.applySystemThemePreference();
    this.checkScreenSize();
    this.restoreLastTab();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth <= 992;
    const saved = localStorage.getItem('sidebarOpen');
    if (this.isMobile) {
      this.sidebarOpen = false;
    } else {
      this.sidebarOpen = saved ? JSON.parse(saved) : true;
    }
  }



  selectTab(tab: 'overview' | 'feedback' | 'events' | 'invitations' | 'profile') {
    this.currentTab = tab;
    localStorage.setItem('lastOpenedTab', tab);
    if (this.isMobile && this.sidenav) {
      this.sidenav.close();
      this.sidebarOpen = false;
    }
  }

  private restoreLastTab(): void {
    const lastTab = localStorage.getItem('lastOpenedTab') as
      | 'overview'
      | 'feedback'
      | 'events'
      | 'invitations'
      | 'profile'
      | null;
    if (lastTab && this.tabComponents[lastTab]) {
      this.currentTab = lastTab;
    }
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('themeMode', this.darkMode ? 'dark' : 'light');

    const dashboardEl = document.querySelector('.dashboard');
    this.darkMode
      ? dashboardEl?.classList.add('dark')
      : dashboardEl?.classList.remove('dark');

    this.updateCSSVariables();
  }

  private loadThemeMode(): void {
    const savedTheme = localStorage.getItem('themeMode');

    if (savedTheme) this.darkMode = savedTheme === 'dark';
    else {
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      localStorage.setItem('themeMode', this.darkMode ? 'dark' : 'light');
    }

    const dashboardEl = document.querySelector('.dashboard');
    this.darkMode
      ? dashboardEl?.classList.add('dark')
      : dashboardEl?.classList.remove('dark');

    this.updateCSSVariables();
  }

  private updateCSSVariables(): void {
    const root = document.documentElement;
    if (this.darkMode) {
      root.style.setProperty('--bg', '#121212');
      root.style.setProperty('--paper', '#1e1e1e');
      root.style.setProperty('--text', '#f5f5f5');
      root.style.setProperty('--accent', '#d4b07b');
    } else {
      root.style.setProperty('--bg', '#f6f3ef');
      root.style.setProperty('--paper', '#ffffff');
      root.style.setProperty('--text', '#2b2b2b');
      root.style.setProperty('--accent', '#c8a97e');
    }
  }

  private loadUser(): void {
    const user = localStorage.getItem('currentUser');
    this.currentUser = user ? JSON.parse(user) : null;
  }

  private applySystemThemePreference(): void {
    if (!localStorage.getItem('themeMode')) {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.darkMode = true;
        document.querySelector('.dashboard')?.classList.add('dark');
        localStorage.setItem('themeMode', 'dark');
      }
    }
  }

  logout(): void {
    Swal.fire({
      title: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, log out',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#b08d57'
    }).then(result => {
      if (result.isConfirmed) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('lastOpenedTab');
        Swal.fire('Logged out!', 'You have been logged out successfully.', 'success')
          .then(() => {
            window.location.href = '/login';
          });
      }
    });
  }
  toggleSidebar(): void {
  this.sidebarOpen = !this.sidebarOpen;
  if (this.sidenav) {
    this.sidebarOpen ? this.sidenav.open() : this.sidenav.close();
  }
  localStorage.setItem('sidebarOpen', JSON.stringify(this.sidebarOpen));
}

onBackdropClick(): void {
  this.sidebarOpen = false;
  if (this.sidenav) {
    this.sidenav.close();
  }
}

}
