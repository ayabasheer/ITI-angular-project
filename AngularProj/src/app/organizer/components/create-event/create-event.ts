import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { EventService } from '../../../shared/services/event';
import { GuestService } from '../../../shared/services/guest';
import { AuthService, User } from '../../../shared/services/auth.service';
import { EventModel } from '../../../shared/models/interfaces';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './create-event.html',
  styleUrls: ['./create-event.css']
})
export class CreateEvent implements OnInit {
  eventForm: FormGroup;
  currentUser: User | null = null;
  selectedImageName: string = '';
  editMode = false;
  editingEventId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private guestService: GuestService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.eventForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      location: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      budget: [0, [Validators.required, Validators.min(0)]],
      image: [''],
      guestEmails: ['', [Validators.required, this.emailListValidator]]
    });
  }

  // Open the user's mail client with a prefilled invitation. Uses BCC so
  // recipient emails are hidden from each other. This does not send mail
  // automatically; it requires the user to confirm/send in their mail app.
  private sendInvitations(guestEmails: string[], event: EventModel) {
    if (!guestEmails || guestEmails.length === 0) return;
    const subject = encodeURIComponent(`You're invited: ${event.name}`);
    const bodyLines = [
      `Hello,`,
      `\nYou are invited to the event: ${event.name}.`,
      `\nWhen: ${new Date(event.startDate).toLocaleString()} - ${new Date(event.endDate).toLocaleString()}`,
      `\nWhere: ${event.location}`,
      `\n\nDetails: ${event.description || 'No description provided.'}`,
      `\n\nPlease RSVP.`
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));

    // Prepare BCC batches to avoid overly long mailto URLs which some mail clients/browsers may reject.
    const BATCH_SIZE = 15; // safe small batch
    const batches: string[][] = [];
    for (let i = 0; i < guestEmails.length; i += BATCH_SIZE) {
      batches.push(guestEmails.slice(i, i + BATCH_SIZE));
    }

    const openedWindows: Window[] = [];
    const mailtoUrls: string[] = [];
    for (const batch of batches) {
      const bcc = encodeURIComponent(batch.join(','));
      const mailto = `mailto:?bcc=${bcc}&subject=${subject}&body=${body}`;
      mailtoUrls.push(mailto);
      try {
  // Avoid opening windows when running unit tests (karma) or when the
  // dev/test server is at localhost:9876 which indicates a test run.
  const isTestEnv = typeof window !== 'undefined' && ((window as any).__karma__ || location.host.includes('localhost:9876'));
        if (!isTestEnv) {
          const w = window.open(mailto, '_blank');
          if (w) openedWindows.push(w);
        }
      } catch (e) {
        console.warn('Unable to open mail client window for invitations', e);
      }
    }

    // Notify the user that mail drafts were opened and they must send them.
    // If we skipped opening windows due to test env, provide the mailto URLs in console and an informative alert
    if (mailtoUrls.length && (window as any).__karma__) {
      // print to console for tests
      console.info('Mailto drafts generated (skipped opening during tests):', mailtoUrls);
      Swal.fire({ icon: 'info', title: 'Invitations (test mode)', text: 'Mailto drafts were generated but not opened while running tests.' });
      return;
    }

    const msg = openedWindows.length > 0
      ? 'Invitation drafts were opened in your mail client. Please review and send them.'
      : 'Unable to open your mail client automatically. Please copy the guest emails and send invitations from your email client.';
    Swal.fire({ icon: 'info', title: 'Invitations', text: msg, confirmButtonText: 'OK' });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    if (this.currentUser.role !== 'Organizer') {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Check for edit mode
    const idParam = this.route.snapshot.queryParamMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      const events = JSON.parse(localStorage.getItem('events') || '[]');
      const ev = events.find((e: any) => e.id === id);
      if (ev) {
        // Prevent editing completed events
        if (ev.status === 'Completed') {
          Swal.fire({ icon: 'warning', title: 'Cannot edit', text: 'Completed events cannot be edited.' });
          this.router.navigate(['/dashboard/events']);
          return;
        }
        this.editMode = true;
        this.editingEventId = id;
        // populate form
        this.eventForm.patchValue({
          name: ev.name,
          description: ev.description,
          category: ev.category,
          location: ev.location,
          startDate: new Date(ev.startDate),
          endDate: new Date(ev.endDate),
          budget: ev.budget,
          image: ev.image || ''
        });
        // populate guest emails box
        const guests = JSON.parse(localStorage.getItem('guests') || '[]');
        const guestEmails = (ev.guests || []).map((gid: number) => {
          const g = guests.find((x: any) => x.id === gid);
          return g ? g.email : '';
        }).filter((x: string) => x);
        this.eventForm.patchValue({ guestEmails: guestEmails.join(', ') });
      }
    }
  }

  // ✅ Validator لتأكيد صحة الإيميلات
  emailListValidator(control: any) {
    if (!control.value) return null;
    const emails = control.value.split(',').map((email: string) => email.trim());
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = emails.filter((email: string) => !emailRegex.test(email));
    return invalidEmails.length > 0 ? { invalidEmails: invalidEmails } : null;
  }

  // ✅ رفع صورة وتحويلها لـ base64
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImageName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.eventForm.patchValue({
          image: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  }

  // ✅ حفظ الحدث في localStorage + تحديد الحالة تلقائيًا
  onSubmit(): void {
    if (!this.currentUser || this.currentUser.role !== 'Organizer') {
      Swal.fire({ icon: 'error', title: 'Not authorized', text: 'Only organizers can create events.' });
      return;
    }

    if (this.eventForm.valid && this.currentUser) {
      const formValue = this.eventForm.value;
      const guestEmails = formValue.guestEmails.split(',').map((email: string) => email.trim());
      const guestIds: number[] = [];

      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const existingGuests = this.guestService.getAll();

      guestEmails.forEach((email: string) => {
        let user = existingUsers.find((u: any) => u.email === email);
        if (!user) {
          const newUserId = existingUsers.length ? Math.max(...existingUsers.map((u: any) => u.id)) + 1 : 1;
          user = {
            id: newUserId,
            name: email.split('@')[0],
            email,
            role: 'Guest',
            status: 'Pending',
            createdAt: new Date().toISOString()
          };
          existingUsers.push(user);
        }

        let guest = existingGuests.find((g: any) => g.email === email);
        if (!guest) {
          const newGuestId = existingGuests.length ? Math.max(...existingGuests.map((g: any) => g.id)) + 1 : 1;
          guest = {
            id: newGuestId,
            name: user.name,
            email,
            status: 'Pending',
            role: 'Guest',
            eventId: null,
            createdAt: new Date().toISOString()
          };
          existingGuests.push(guest);
        }

        guestIds.push(user.id);
      });

      localStorage.setItem('users', JSON.stringify(existingUsers));
      localStorage.setItem('guests', JSON.stringify(existingGuests));

      // Update existing event if in edit mode
      const existingEvents = JSON.parse(localStorage.getItem('events') || '[]');
      if (this.editMode && this.editingEventId) {
        const idx = existingEvents.findIndex((e: any) => e.id === this.editingEventId);
        if (idx !== -1) {
          const evToUpdate = existingEvents[idx];
          if (evToUpdate.status === 'Completed') {
            Swal.fire({ icon: 'warning', title: 'Cannot edit', text: 'Completed events cannot be edited.' });
            return;
          }
          evToUpdate.name = formValue.name;
          evToUpdate.description = formValue.description;
          evToUpdate.category = formValue.category;
          evToUpdate.location = formValue.location;
          evToUpdate.image = formValue.image || undefined;
          evToUpdate.startDate = formValue.startDate.toISOString();
          evToUpdate.endDate = formValue.endDate.toISOString();
          evToUpdate.budget = formValue.budget;
          evToUpdate.updatedAt = new Date().toISOString();
          evToUpdate.guests = guestIds;
          evToUpdate.guestCount = guestIds.length;
          existingEvents[idx] = evToUpdate;
          localStorage.setItem('events', JSON.stringify(existingEvents));
          // send invitations to new guest emails if any
          this.sendInvitations(guestEmails, evToUpdate);
          Swal.fire({ icon: 'success', title: 'Event Updated!', text: 'Event updated and invitations sent.' }).then(() => {
            this.router.navigate(['/dashboard/events'], { queryParams: { refresh: Date.now() } });
          });
          return;
        }
      }

      // ✅ create new event
      const newEventId = existingEvents.length ? Math.max(...existingEvents.map((e: any) => e.id)) + 1 : 1;
      const startDate = new Date(formValue.startDate);
      const today = new Date();

      let status: 'Upcoming' | 'InProgress' | 'Completed' | 'Cancelled' = 'Upcoming';

      if (startDate.toDateString() === today.toDateString()) {
        status = 'InProgress';
      } else if (startDate < today) {
        status = 'Completed';
      }

      const event: EventModel = {
        id: newEventId,
        name: formValue.name,
        description: formValue.description,
        category: formValue.category,
        location: formValue.location,
        image: formValue.image || undefined,
        startDate: formValue.startDate.toISOString(),
        endDate: formValue.endDate.toISOString(),
        createdBy: this.currentUser.id,
        guestCount: guestIds.length,
        guests: guestIds,
        tasks: [],
        expenses: [],
        feedbacks: [],
        status,
        budget: formValue.budget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      existingEvents.push(event);
      localStorage.setItem('events', JSON.stringify(existingEvents));

      // send invitations
      this.sendInvitations(guestEmails, event);
      // ✅ إنشاء الدعوات وربطها بالحدث
      const existingInvitations = JSON.parse(localStorage.getItem('invitations') || '[]');
      guestIds.forEach((guestId, index) => {
        const newInvitation = {
          id: existingInvitations.length
            ? Math.max(...existingInvitations.map((i: any) => i.id)) + 1
            : 1,
          eventId: event.id,
          guestId,
          email: guestEmails[index],
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        existingInvitations.push(newInvitation);
      });
      localStorage.setItem('invitations', JSON.stringify(existingInvitations));

      // update guest eventId mapping
      const updatedGuests = existingGuests.map((g: any) =>
        guestIds.includes(g.id) ? { ...g, eventId: event.id } : g
      );
      localStorage.setItem('guests', JSON.stringify(updatedGuests));

      Swal.fire({
        icon: 'success',
        title: 'Event Created!',
        text: 'The event and invitations have been created successfully.',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/dashboard/events'], { queryParams: { refresh: Date.now() } });
      });
    }
  }
}
