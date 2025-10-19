import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: "event-details.html",
  styleUrls: ['event-details.css']
})
export class EventDetails {
  event: any = null;
  organizer: any = null;
  feedbacks: any[] = [];
  guests: any[] = [];
  defaultImage = 'https://via.placeholder.com/400x250?text=Event';

  constructor(private route: ActivatedRoute, private router: Router, private auth: AuthService) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const rawE = localStorage.getItem('events');
    const rawO = localStorage.getItem('organizers');
    const rawF = localStorage.getItem('feedbacks');
    const rawG = localStorage.getItem('guests');
    const events = rawE ? JSON.parse(rawE) : [];
    const organizers = rawO ? JSON.parse(rawO) : [];
    const feedbacks = rawF ? JSON.parse(rawF) : [];
    const guests = rawG ? JSON.parse(rawG) : [];
    this.event = events.find((e: any) => e.id === id);
    this.organizer = this.event ? organizers.find((o: any) => o.id === this.event.organizerId) : null;
    this.feedbacks = this.event && this.event.feedbacks ? this.event.feedbacks.map((fid: number) => feedbacks.find((f: any) => f.id === fid)).filter((f: any) => f) : [];
    this.guests = guests;
  }

  canModify(): boolean {
    const user = this.auth.currentUser;
    if (!user || !this.event) return false;
    // Only organizer who created the event may modify it
    return user.role === 'Organizer' && Number(user.id) === Number(this.event.createdBy) && this.event.status !== 'Completed';
  }

  async deleteEvent() {
    if (!this.event) return;
    if (this.event.status === 'Completed') {
      Swal.fire({ icon: 'warning', title: 'Cannot delete', text: 'Completed events cannot be deleted.' });
      return;
    }
    const result = await Swal.fire({
      title: 'Delete event?',
      text: `Are you sure you want to delete "${this.event.name || this.event.title}"? This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel'
    });
    if (result.isConfirmed) {
      const rawE = localStorage.getItem('events');
      const events = rawE ? JSON.parse(rawE) : [];
      const updated = events.filter((e: any) => e.id !== this.event.id);
      localStorage.setItem('events', JSON.stringify(updated));
      Swal.fire({ icon: 'success', title: 'Deleted', text: 'Event deleted.' });
      this.router.navigate(['/dashboard/events']);
    }
  }

  editEvent() {
    if (!this.event) return;
    // Navigate to create-event with query param id to edit
    this.router.navigate(['/dashboard/create-event'], { queryParams: { id: this.event.id } });
  }

  getGuestName(guestId: number) {
    const g = this.guests.find((x: any) => x.id === guestId);
    return g ? g.name || g.email || ('Guest #' + g.id) : 'Guest';
  }
}
