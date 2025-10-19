import { Component, OnInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { Event, GuestUser } from '../../interfaces/guest.interface';
import { InvitationService, InvitationRecord } from '../../../shared/services/invitation.service';

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

  constructor(private invitationService: InvitationService) {}

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
    const allInvitations = this.invitationService.getAll();
    const storedEvents = localStorage.getItem('events');
    const allEvents: Event[] = storedEvents ? JSON.parse(storedEvents) : [];

    if (!allInvitations.length || !this.currentUser) {
      this.invitations = [];
      return;
    }

    // ✅ Get only invitations sent to the logged guest
    let filtered = allInvitations.filter(inv => inv.guestId === this.currentUser!.id);
    // Fallback: some stored invitations may include email instead of guestId
    if (!filtered.length) {
      const userEmail = this.currentUser!.email;
      if (userEmail) filtered = allInvitations.filter((inv: any) => inv.email === userEmail);
    }

    this.invitations = filtered.map(inv => ({
      id: inv.id,
      eventId: inv.eventId,
      guestId: inv.guestId,
      status: (inv.status as 'Pending' | 'Accepted' | 'Refused'),
      eventDetails: allEvents.find(e => e.id === inv.eventId)
    }));
  }

  acceptInvitation(inv: Invitation): void {
    // Permission check: must be the invited guest (uses canAct for flexible matching)
    if (!this.canAct(inv)) {
      Swal.fire('Not authorized', 'You must be the invited guest to accept this invitation.', 'error');
      return;
    }

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
    // Permission check: must be logged in as the invited guest
    if (!this.currentUser || this.currentUser.role !== 'Guest' || this.currentUser.id !== inv.guestId) {
      Swal.fire('Not authorized', 'You must be the invited guest to refuse this invitation.', 'error');
      return;
    }

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
    // Merge the current user's invitation changes into the global invitations list
    const global = this.invitationService.getAll();
    const updatedMap = new Map<number, any>();
    global.forEach(g => updatedMap.set(Number(g.id), { ...g }));

    // Write back current user's states
    this.invitations.forEach(i => {
      updatedMap.set(i.id, { id: i.id, eventId: i.eventId, guestId: i.guestId, status: i.status, email: (this.currentUser?.email || undefined) });
    });

    const merged = Array.from(updatedMap.values());
    this.invitationService.save(merged as any);
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

  // Returns true if the current user is allowed to act on this invitation
  canAct(inv: Invitation): boolean {
    if (!this.currentUser) return false;

    // Prefer numeric id matching but fallback to email matching for legacy records
    const invGuestId = Number((inv as any).guestId || 0);
    const currentId = Number((this.currentUser as any).id || 0);
    if (invGuestId && currentId && invGuestId === currentId) return true;

    const invEmail = (inv as any).email || (inv.eventDetails && (inv as any).email);
    const userEmail = (this.currentUser as any).email;
    if (invEmail && userEmail && invEmail === userEmail) return true;

    // Fallback: allow if the logged-in user's role explicitly equals 'Guest'
    const role = (this.currentUser.role || '').toString().toLowerCase();
    return role === 'guest';
  }
}
