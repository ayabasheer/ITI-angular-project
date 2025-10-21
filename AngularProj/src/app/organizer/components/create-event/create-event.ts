import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
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
import { EventModel, Task, Expense, Priority, ExpenseCategory } from '../../../shared/models/interfaces';
import { TaskService } from '../../../shared/services/task';
import { ExpenseService } from '../../../shared/services/expense';
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
  selectedImageName = '';

  // editing state
  editing = false;
  editingEventId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private guestService: GuestService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private taskService: TaskService,
    private expenseService: ExpenseService
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
      guestEmails: ['', [Validators.required, this.emailListValidator]],
      tasks: this.fb.array([]),
      expenses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    if ((this.currentUser.role || '').toLowerCase() !== 'organizer') {
      this.router.navigate(['/dashboard']);
      return;
    }

    // detect edit mode via query param id and pre-fill form
    this.route.queryParamMap.subscribe(params => {
      const id = params.get('id');
      if (id != null) {
        const eid = Number(id);
        if (!Number.isNaN(eid)) {
          const found = (this.eventService.getAll() || []).find((e: any) => Number(e.id) === eid);
          if (found) {
            this.editing = true;
            this.editingEventId = eid;

            this.eventForm.patchValue({
              name: found.name || '',
              description: found.description || '',
              category: found.category || '',
              location: found.location || '',
              startDate: found.startDate ? new Date(found.startDate) : '',
              endDate: found.endDate ? new Date(found.endDate) : '',
              budget: found.budget || 0,
              image: found.image || ''
            });

            // guest emails
            try {
              const allGuests = this.guestService.getAll() || [];
              const emails = (found.guests || []).map((gid: any) => {
                const g = allGuests.find((x: any) => Number(x.id) === Number(gid));
                return g ? g.email : undefined;
              }).filter(Boolean) as string[];
              this.eventForm.patchValue({ guestEmails: emails.join(', ') });
            } catch {}

            // tasks
            const existingTasks = this.taskService.getForEvent(eid) || [];
            while (this.tasks.length) this.tasks.removeAt(0);
            for (const t of existingTasks) {
              this.tasks.push(this.fb.group({
                title: [t.title || '', Validators.required],
                description: [t.description || ''],
                priority: [t.priority || 'Medium', Validators.required],
                deadline: [t.deadline ? new Date(t.deadline) : '', Validators.required]
              }));
            }

            // expenses
            const existingExpenses = this.expenseService.getForEvent(eid) || [];
            while (this.expenses.length) this.expenses.removeAt(0);
            for (const ex of existingExpenses) {
              this.expenses.push(this.fb.group({
                name: [ex.name || '', Validators.required],
                amount: [ex.amount || 0, [Validators.required, Validators.min(0)]],
                category: [ex.category || 'Miscellaneous', Validators.required],
                date: [ex.date ? new Date(ex.date) : '', Validators.required],
                notes: [ex.notes || '']
              }));
            }
          }
        }
      }
    });
  }

  // validators
  emailListValidator(control: any) {
    if (!control.value) return null;
    const emails = control.value.split(',').map((email: string) => email.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalid = emails.filter((email: string) => !emailRegex.test(email));
    return invalid.length ? { invalidEmails: invalid } : null;
  }

  // image input
  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedImageName = file.name;
      const reader = new FileReader();
      reader.onload = e => {
        this.eventForm.patchValue({ image: (e.target?.result as string) || '' });
      };
      reader.readAsDataURL(file);
    }
  }

  // getters
  get tasks(): FormArray {
    return this.eventForm.get('tasks') as FormArray;
  }
  get expenses(): FormArray {
    return this.eventForm.get('expenses') as FormArray;
  }

  addTask(): void {
    this.tasks.push(this.fb.group({
      title: ['', Validators.required],
      description: [''],
      priority: ['Medium' as Priority, Validators.required],
      deadline: ['', Validators.required]
    }));
  }
  removeTask(i: number): void { this.tasks.removeAt(i); }

  addExpense(): void {
    this.expenses.push(this.fb.group({
      name: ['', Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      category: ['Miscellaneous' as ExpenseCategory, Validators.required],
      date: ['', Validators.required],
      notes: ['']
    }));
  }
  removeExpense(i: number): void { this.expenses.removeAt(i); }

  // SAVE
  onSubmit(): void {
    if (!this.currentUser || (this.currentUser.role || '').toLowerCase() !== 'organizer') {
      Swal.fire({ icon: 'error', title: 'Not authorized', text: 'Only organizers can create or edit events.' });
      return;
    }
    if (this.eventForm.invalid) return;

    // ===== 1) Prepare guest users/guests =====
    const formValue = this.eventForm.value;
    const guestEmails: string[] = (formValue.guestEmails || '')
      .split(',')
      .map((e: string) => e.trim())
      .filter(Boolean);

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const guests = this.guestService.getAll() || [];
    const guestIds: number[] = [];

    for (const email of guestEmails) {
      let user = users.find((u: any) => u.email === email);
      if (!user) {
        const newUserId = users.length ? Math.max(...users.map((u: any) => Number(u.id) || 0)) + 1 : 1;
        user = {
          id: newUserId,
          name: email.split('@')[0],
          email,
          role: 'Guest',
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        users.push(user);
      }

      let guest = guests.find((g: any) => g.email === email);
      if (!guest) {
        const newGuestId = guests.length ? Math.max(...guests.map((g: any) => Number(g.id) || 0)) + 1 : 1;
        guest = {
          id: newGuestId,
          name: user.name,
          email,
          status: 'Accepted',
          role: 'Guest',
          eventId: null,
          createdAt: new Date().toISOString()
        };
        guests.push(guest);
      }

      guestIds.push(Number(user.id));
    }

    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('guests', JSON.stringify(guests));

    // ===== 2) Decide eventId (before creating tasks/expenses) =====
    const allEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const newId = allEvents.length ? Math.max(...allEvents.map((e: any) => Number(e.id) || 0)) + 1 : 1;
    const eventId = this.editing && this.editingEventId ? this.editingEventId : newId;

    // ===== 3) Status calculation =====
    const startDate = new Date(formValue.startDate);
    const today = new Date();
    let status: 'Upcoming' | 'InProgress' | 'Completed' | 'Cancelled' = 'Upcoming';
    if (startDate.toDateString() === today.toDateString()) status = 'InProgress';
    else if (startDate < today) status = 'Completed';

    // ===== 4) If editing: clean old tasks/expenses ONCE to avoid duplicates =====
    if (this.editing && this.editingEventId) {
      const oldTasks = this.taskService.getForEvent(this.editingEventId) || [];
      for (const ot of oldTasks) { try { this.taskService.delete(ot.id); } catch {} }
      const oldExpenses = this.expenseService.getForEvent(this.editingEventId) || [];
      for (const oe of oldExpenses) { try { this.expenseService.delete(oe.id); } catch {} }
    }

    // ===== 5) Create tasks/expenses referencing eventId =====
    const taskIds: number[] = [];
    (formValue.tasks || []).forEach((t: any) => {
      const task: Task = {
        id: 0,
        eventId,
        title: t.title,
        description: t.description,
        assignedTo: null,
        priority: t.priority,
        deadline: (t.deadline instanceof Date) ? t.deadline.toISOString() : new Date(t.deadline).toISOString(),
        status: 'Not Started',
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const created = this.taskService.create(task);
      taskIds.push(created.id);
    });

    const expenseIds: number[] = [];
    (formValue.expenses || []).forEach((ex: any) => {
      const expense: Expense = {
        id: 0,
        eventId,
        name: ex.name,
        amount: ex.amount,
        category: ex.category,
        date: (ex.date instanceof Date) ? ex.date.toISOString() : new Date(ex.date).toISOString(),
        notes: ex.notes
      };
      const created = this.expenseService.create(expense);
      expenseIds.push(created.id);
    });

    // ===== 6) Assemble final event object (single source of truth) =====
    const nowIso = new Date().toISOString();
    const baseEvent: EventModel = {
      id: eventId,
      name: formValue.name,
      description: formValue.description,
      category: formValue.category,
      location: formValue.location,
      image: formValue.image || undefined,
      startDate: (formValue.startDate instanceof Date) ? formValue.startDate.toISOString() : new Date(formValue.startDate).toISOString(),
      endDate: (formValue.endDate instanceof Date) ? formValue.endDate.toISOString() : new Date(formValue.endDate).toISOString(),
      createdBy: this.currentUser.id,
      guestCount: guestIds.length,
      guests: guestIds,
      tasks: taskIds,
      expenses: expenseIds,
      feedbacks: [],
      status,
      budget: formValue.budget,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Preserve original createdAt when editing
    if (this.editing && this.editingEventId) {
      const existing = allEvents.find((e: any) => Number(e.id) === Number(this.editingEventId));
      if (existing?.createdAt) baseEvent.createdAt = existing.createdAt;
    }

    // ===== 7) Write event ONCE (replace or push) =====
    let nextEvents: any[];
    if (this.editing && this.editingEventId) {
      const idx = allEvents.findIndex((e: any) => Number(e.id) === Number(this.editingEventId));
      nextEvents = [...allEvents];
      if (idx !== -1) nextEvents[idx] = baseEvent; else nextEvents.push(baseEvent);
    } else {
      nextEvents = [...allEvents, baseEvent];
    }
    localStorage.setItem('events', JSON.stringify(nextEvents));

    // ===== 8) Invitations (create ONCE with de-duplication) =====
    const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    for (let i = 0; i < guestIds.length; i++) {
      const guestId = guestIds[i];
      const email = guestEmails[i];
      const exists = invitations.some((inv: any) =>
        Number(inv.eventId) === Number(eventId) && (Number(inv.guestId) === Number(guestId) || inv.email === email)
      );
      if (!exists) {
        const newInvId = invitations.length ? Math.max(...invitations.map((x: any) => Number(x.id) || 0)) + 1 : 1;
        invitations.push({
          id: newInvId,
          eventId,
          guestId,
          email,
          status: 'Pending',
          createdAt: nowIso
        });
      }
    }
    localStorage.setItem('invitations', JSON.stringify(invitations));

    // ===== 9) Update guests eventIds mapping ONCE =====
    const guestsAfter = (guests || []).map((g: any) => {
      if (guestIds.includes(Number(g.id))) {
        const list = Array.isArray(g.eventIds) ? g.eventIds.slice() : (g.eventId ? [g.eventId] : []);
        if (!list.includes(eventId)) list.push(eventId);
        return { ...g, eventIds: list, eventId }; // keep eventId for backward compat
      }
      return g;
    });
    localStorage.setItem('guests', JSON.stringify(guestsAfter));

    // ===== 10) Done UI =====
    Swal.fire({
      icon: 'success',
      title: this.editing ? 'Event Updated!' : 'Event Created!',
      text: this.editing
        ? 'Your changes have been saved.'
        : 'The event, invitations, tasks, and expenses have been created.',
      confirmButtonText: 'OK'
    }).then(() => {
      this.router.navigate(['/dashboard/events'], { queryParams: { refresh: Date.now() } });
    });
  }
}
