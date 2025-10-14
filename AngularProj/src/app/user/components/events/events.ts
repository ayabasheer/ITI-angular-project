import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

interface GuestInvitation {
  id: number;
  userId: string;
  eventName: string;
  eventDate: string;
  location: string;
  status: 'pending' | 'accepted' | 'declined';
  description?: string;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class Events implements OnInit {
  searchQuery: string = '';
  userId: string = '';
  invitations: GuestInvitation[] = [];

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    const userData = localStorage.getItem('currentUser');
    if (userData) this.userId = JSON.parse(userData).id;

    const storedInvitations = localStorage.getItem('invitations');
    if (storedInvitations) {
      this.invitations = JSON.parse(storedInvitations).filter((inv: GuestInvitation) => inv.userId === this.userId);
    }
  }

  get filteredInvitations() {
    if (!this.searchQuery.trim()) return this.invitations;
    return this.invitations.filter(inv =>
      inv.eventName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      inv.location.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  accept(inv: GuestInvitation) {
    inv.status = 'accepted';
    this.updateLocalStorage();
  }

  decline(inv: GuestInvitation) {
    inv.status = 'declined';
    this.updateLocalStorage();
  }

  // Open Event as a modal (inline template)
  openEventDetail(inv: GuestInvitation) {
    const dialogRef = this.dialog.open(EventDetailModal, {
      width: '400px',
      data: inv
    });
  }

  private updateLocalStorage() {
    const allInvitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    const updatedInvitations = allInvitations.map((i: GuestInvitation) =>
      i.id === i.id ? i : i
    );
    localStorage.setItem('invitations', JSON.stringify(updatedInvitations));
  }
}

// Modal component defined inside the same file
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'event-detail-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.eventName }}</h2>
    <mat-dialog-content>
      <p><strong>Date:</strong> {{ data.eventDate }}</p>
      <p><strong>Location:</strong> {{ data.location }}</p>
      <p><strong>Status:</strong> {{ data.status }}</p>
      <p *ngIf="data.description"><strong>Description:</strong> {{ data.description }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `
})
export class EventDetailModal {
  constructor(
    public dialogRef: MatDialogRef<EventDetailModal>,
    @Inject(MAT_DIALOG_DATA) public data: GuestInvitation
  ) {}
}
