import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { Event, GuestUser } from '../../interfaces/guest.interface';

interface Invitation {
  id: number;
  eventId: number;
  guestId: number;
  status: 'Pending' | 'Accepted' | 'Refused';
  eventDetails?: Event;
}

@Component({
  selector: 'app-invitations',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './invitations.html',
  styleUrls: ['./invitations.css']
})
export class InvitationsComponent implements OnInit {
  invitations: Invitation[] = [];
  filteredInvitations: Invitation[] = [];
  currentUser: GuestUser | null = null;
  selectedFilter: 'All' | 'Pending' | 'Accepted' | 'Refused' = 'All';

  @HostBinding('class.dark-mode') isDarkMode = false;

  ngOnInit(): void {
    this.loadDarkMode();
    this.loadUser();
    this.loadInvitations();
    this.applyFilter();
  }

  private loadDarkMode(): void {
    const mode = localStorage.getItem('theme');
    this.isDarkMode = mode === 'dark';
  }

  private loadUser(): void {
    const user = localStorage.getItem('currentUser');
    this.currentUser = user ? JSON.parse(user) : null;
  }

  private loadInvitations(): void {
    const storedInvitations = localStorage.getItem('invitations');
    const storedEvents = localStorage.getItem('events');

    if (!storedInvitations || !this.currentUser) return;

    const allInvitations: Invitation[] = JSON.parse(storedInvitations);
    const allEvents: Event[] = storedEvents ? JSON.parse(storedEvents) : [];

    // ✅ Get only invitations sent to the logged guest
    this.invitations = allInvitations
      .filter(inv => inv.guestId === this.currentUser!.id)
      .map(inv => ({
        ...inv,
        eventDetails: allEvents.find(e => e.id === inv.eventId)
      }));

    this.saveInvitations();
  }

  acceptInvitation(inv: Invitation): void {
    Swal.fire({
      icon: 'question',
      title: 'Accept Invitation',
      text: `Do you want to accept "${inv.eventDetails?.name}" invitation?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, accept',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        inv.status = 'Accepted';
        this.saveInvitations();
        this.applyFilter();
        Swal.fire('Accepted!', `You accepted "${inv.eventDetails?.name}".`, 'success');
      }
    });
  }

  refuseInvitation(inv: Invitation): void {
    Swal.fire({
      icon: 'warning',
      title: 'Refuse Invitation',
      text: `Do you want to refuse "${inv.eventDetails?.name}" invitation?`,
      showCancelButton: true,
      confirmButtonText: 'Yes, refuse',
      cancelButtonText: 'Cancel'
    }).then(result => {
      if (result.isConfirmed) {
        inv.status = 'Refused';
        this.saveInvitations();
        this.applyFilter();
        Swal.fire('Refused!', `You refused "${inv.eventDetails?.name}".`, 'success');
      }
    });
  }

  private saveInvitations(): void {
    localStorage.setItem('invitations', JSON.stringify(this.invitations));
  }

  applyFilter(): void {
    if (this.selectedFilter === 'All') {
      this.filteredInvitations = this.invitations;
    } else {
      this.filteredInvitations = this.invitations.filter(i => i.status === this.selectedFilter);
    }
  }

  changeFilter(filter: 'All' | 'Pending' | 'Accepted' | 'Refused'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }
}
