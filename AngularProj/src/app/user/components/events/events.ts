import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { Event, GuestUser } from '../../interfaces/guest.interface';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  currentUser: GuestUser | null = null;
  selectedEvent: Event | null = null;
  activeTab: 'All' | 'Pending' | 'Accepted' | 'Refused' = 'All';
  themeMode: 'dark' | 'light' = 'light'; // 👈 added

  ngOnInit(): void {
    this.loadTheme();     // 👈 load dark mode from localStorage
    this.loadUser();
    this.loadEvents();
    this.filterEvents();
  }

  // ✅ Load theme mode from localStorage
  private loadTheme(): void {
    const storedTheme = localStorage.getItem('themeMode');
    this.themeMode = storedTheme === 'dark' ? 'dark' : 'light';
    document.body.classList.toggle('dark-body', this.themeMode === 'dark');
  }

  private loadUser(): void {
    const user = localStorage.getItem('currentUser');
    this.currentUser = user ? JSON.parse(user) : null;
  }

  private loadEvents(): void {
    const stored = localStorage.getItem('events');
    if (!stored || !this.currentUser) return;
    const allEvents: Event[] = JSON.parse(stored);
    this.events = allEvents.filter(e => Array.isArray(e.guests) && e.guests.includes(this.currentUser!.id));
  }

  viewDetails(event: Event): void {
    this.selectedEvent = event;
  }

  closeDetails(): void {
    this.selectedEvent = null;
  }

  setTab(tab: 'All' | 'Pending' | 'Accepted' | 'Refused'): void {
    this.activeTab = tab;
    this.filterEvents();
  }

  private filterEvents(): void {
    if (this.activeTab === 'All') {
      this.filteredEvents = [...this.events];
    } else {
      this.filteredEvents = this.events.filter(e => e.status === this.activeTab);
    }
  }

  acceptEvent(event: Event): void {
    Swal.fire({
      icon: 'question',
      title: 'Accept Event',
      text: `Are you sure you want to accept "${event.name}"?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, accept',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        event.status = 'Accepted';
        this.saveEvents();
        this.filterEvents();
        Swal.fire('Accepted!', `You accepted "${event.name}".`, 'success');
      }
    });
  }

  refuseEvent(event: Event): void {
    Swal.fire({
      icon: 'warning',
      title: 'Refuse Event',
      text: `Are you sure you want to refuse "${event.name}"?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, refuse',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        event.status = 'Refused';
        this.saveEvents();
        this.filterEvents();
        Swal.fire('Refused!', `You refused "${event.name}".`, 'success');
      }
    });
  }

  private saveEvents(): void {
    localStorage.setItem('events', JSON.stringify(this.events));
  }
}
