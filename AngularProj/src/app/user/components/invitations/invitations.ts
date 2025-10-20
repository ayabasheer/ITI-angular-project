import { Component, OnInit, Renderer2, HostBinding, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { Event, GuestUser } from '../../interfaces/guest.interface';
import { InvitationService } from '../../../shared/services/invitation.service';

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
export class InvitationsComponent implements OnInit, OnDestroy {
  invitations: Invitation[] = [];
  filteredInvitations: Invitation[] = [];
  currentUser: GuestUser | null = null;
  selectedFilter: 'All' | 'Pending' | 'Accepted' | 'Refused' = 'All';

  @HostBinding('class.dark-mode') isDarkMode = false;
  themeMode: 'light' | 'dark' = 'light';

  private themeListener: any;

  constructor(
    private invitationService: InvitationService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.loadUser();
    this.loadInvitations();
    this.applyFilter();
    this.loadTheme();

    // Listen for global theme changes dispatched from dashboard
    this.themeListener = (e: any) => {
      const dark = e?.detail?.dark;
      if (typeof dark === 'boolean') {
        this.ngZone.run(() => {
          this.isDarkMode = dark;
          this.themeMode = dark ? 'dark' : 'light';
          if (dark) this.renderer.addClass(document.body, 'dark-body');
          else this.renderer.removeClass(document.body, 'dark-body');
          this.cdr.detectChanges();
        });
      }
    };
    window.addEventListener('theme:changed', this.themeListener);
  }

  ngOnDestroy(): void {
    if (this.themeListener) window.removeEventListener('theme:changed', this.themeListener);
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

    let filtered = allInvitations.filter(inv => inv.guestId === this.currentUser!.id);
    if (!filtered.length) {
      const userEmail = this.currentUser!.email;
      if (userEmail) filtered = allInvitations.filter((inv: any) => inv.email === userEmail);
    }

    this.invitations = filtered.map(inv => ({
      id: inv.id,
      eventId: inv.eventId,
      guestId: inv.guestId,
      status: inv.status as 'Pending' | 'Accepted' | 'Refused',
      eventDetails: allEvents.find(e => e.id === inv.eventId)
    }));
  }

  acceptInvitation(inv: Invitation): void {
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
    if (!this.canAct(inv)) {
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
    const global = this.invitationService.getAll();
    const updatedMap = new Map<number, any>();
    global.forEach(g => updatedMap.set(Number(g.id), { ...g }));

    this.invitations.forEach(i => {
      updatedMap.set(i.id, { ...i, email: this.currentUser?.email });
    });

    this.invitationService.save(Array.from(updatedMap.values()) as any);
  }

  applyFilter(): void {
    this.filteredInvitations = this.selectedFilter === 'All'
      ? this.invitations
      : this.invitations.filter(i => i.status === this.selectedFilter);
  }

  changeFilter(filter: 'All' | 'Pending' | 'Accepted' | 'Refused'): void {
    this.selectedFilter = filter;
    this.applyFilter();
  }

  private loadTheme(): void {
    const storedTheme = localStorage.getItem('themeMode');
    this.themeMode = storedTheme === 'dark' ? 'dark' : 'light';
    this.isDarkMode = this.themeMode === 'dark';
    if (this.isDarkMode) this.renderer.addClass(document.body, 'dark-body');
    else this.renderer.removeClass(document.body, 'dark-body');
    this.cdr.detectChanges();
  }



  canAct(inv: Invitation): boolean {
    if (!this.currentUser) return false;
    const sameId = Number(inv.guestId) === Number(this.currentUser.id);
    const sameEmail = (inv as any).email === this.currentUser.email;
    const isGuest = this.currentUser.role?.toLowerCase() === 'guest';
    return sameId || sameEmail || isGuest;
  }
}
