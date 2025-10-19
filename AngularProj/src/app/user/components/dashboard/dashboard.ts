import { Component, OnInit, HostListener, ViewChild, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

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
    FeedbackComponent,
    EventsComponent,
    ProfileComponent,
    OverviewComponent,
    InvitationsComponent
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
    this.restoreLastTab(); // ✅ Restore last tab when reloading
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

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    if (this.sidenav) {
      if (this.sidebarOpen) this.sidenav.open();
      else this.sidenav.close();
    }
    localStorage.setItem('sidebarOpen', JSON.stringify(this.sidebarOpen));
  }

  selectTab(tab: 'overview' | 'feedback' | 'events' | 'invitations' | 'profile') {
    this.currentTab = tab;
    localStorage.setItem('lastOpenedTab', tab); // ✅ Save tab when changed
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

  onBackdropClick() {
    this.sidebarOpen = false;
    if (this.sidenav) this.sidenav.close();
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('themeMode', this.darkMode ? 'dark' : 'light');

    const dashboardEl = document.querySelector('.dashboard');
    if (this.darkMode) dashboardEl?.classList.add('dark');
    else dashboardEl?.classList.remove('dark');

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
    if (this.darkMode) dashboardEl?.classList.add('dark');
    else dashboardEl?.classList.remove('dark');

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
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.darkMode = true;
        const dashboardEl = document.querySelector('.dashboard');
        dashboardEl?.classList.add('dark');
        localStorage.setItem('themeMode', 'dark');
      }
    }
  }
}
