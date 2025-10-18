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
import { RouterModule, Router } from '@angular/router';
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
  styleUrl: './create-event.css'
})
export class CreateEvent implements OnInit {
  eventForm: FormGroup;
  currentUser: User | null = null;
  selectedImageName: string = '';

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private guestService: GuestService,
    private authService: AuthService,
    private router: Router
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

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
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

  // ✅ حفظ الحدث في localStorage
  onSubmit(): void {
    if (this.eventForm.valid && this.currentUser) {
      const formValue = this.eventForm.value;
      const guestEmails = formValue.guestEmails.split(',').map((email: string) => email.trim());
      const guestIds: number[] = [];

      // 🧩 جلب المستخدمين والضيوف الحاليين
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

      // ✅ تحديث بيانات المستخدمين والضيوف
      localStorage.setItem('users', JSON.stringify(existingUsers));
      localStorage.setItem('guests', JSON.stringify(existingGuests));

      // ✅ إنشاء الحدث الجديد
      const existingEvents = JSON.parse(localStorage.getItem('events') || '[]');
      const newEventId = existingEvents.length ? Math.max(...existingEvents.map((e: any) => e.id)) + 1 : 1;

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
        status: 'Upcoming',
        budget: formValue.budget,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      existingEvents.push(event);
      localStorage.setItem('events', JSON.stringify(existingEvents));

      // ✅ تحديث eventId للضيوف
      const updatedGuests = existingGuests.map((g: any) =>
        guestIds.includes(g.id) ? { ...g, eventId: event.id } : g
      );
      localStorage.setItem('guests', JSON.stringify(updatedGuests));

      // ✅ إشعار النجاح
      Swal.fire({
        icon: 'success',
        title: 'Event Created!',
        text: 'The event has been created and invitations sent.',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/dashboard/events'], { queryParams: { refresh: Date.now() } });
      });
    }
  }
}
