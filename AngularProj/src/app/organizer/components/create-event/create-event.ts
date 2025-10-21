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
    }, { validators: this.dateRangeValidator });
  }

  // Custom validator for date range
  dateRangeValidator(group: any): any {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    if (start && end && new Date(start) >= new Date(end)) {
      return { dateRangeInvalid: true };
    }
    return null;
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

  // Remove expense form group
  removeExpense(index: number): void {
    this.expenses.removeAt(index);
  }

  // Refactored onSubmit: separate create and update logic
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

    if (!this.eventForm.valid) return;

    const formValue = this.eventForm.value;
    const guestEmails = formValue.guestEmails.split(',').map((email: string) => email.trim());
    const guestIds: number[] = [];

    // Handle guests and users
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
          status: 'Accepted',
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

    // Calculate status
    const startDate = new Date(formValue.startDate);
    const endDate = new Date(formValue.endDate);
    const today = new Date();
    let status: 'Upcoming' | 'InProgress' | 'Completed' | 'Cancelled' = 'Upcoming';
    if (endDate < today) {
      status = 'Completed';
    } else if (startDate <= today) {
      status = 'InProgress';
    }

    // Get or create event ID
    const existingEvents = JSON.parse(localStorage.getItem('events') || '[]');
    const eventId = this.editing && this.editingEventId ? this.editingEventId : (existingEvents.length ? Math.max(...existingEvents.map((e: any) => e.id)) + 1 : 1);

    // Create event object
    const event: EventModel = {
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
      tasks: [],
      expenses: [],
      feedbacks: [],
      status,
      budget: formValue.budget,
      createdAt: this.editing ? (existingEvents.find((e: any) => e.id === eventId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Handle tasks and expenses
    if (this.editing && this.editingEventId) {
      // Delete old tasks/expenses
      const oldTasks = this.taskService.getForEvent(this.editingEventId) || [];
      oldTasks.forEach((ot: any) => this.taskService.delete(ot.id));
      const oldExpenses = this.expenseService.getForEvent(this.editingEventId) || [];
      oldExpenses.forEach((oe: any) => this.expenseService.delete(oe.id));
    }

    // Create new tasks
    const taskIds: number[] = [];
    (formValue.tasks || []).forEach((taskData: any) => {
      const task: Task = {
        id: 0,
        eventId: event.id,
        title: taskData.title,
        description: taskData.description,
        assignedTo: null,
        priority: taskData.priority,
        deadline: (taskData.deadline instanceof Date) ? taskData.deadline.toISOString() : new Date(taskData.deadline).toISOString(),
        status: 'Not Started',
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const createdTask = this.taskService.create(task);
      taskIds.push(createdTask.id);
    });

    // Create new expenses
    const expenseIds: number[] = [];
    (formValue.expenses || []).forEach((expenseData: any) => {
      const expense: Expense = {
        id: 0,
        eventId: event.id,
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category,
        date: (expenseData.date instanceof Date) ? expenseData.date.toISOString() : new Date(expenseData.date).toISOString(),
        notes: expenseData.notes
      };
      const createdExpense = this.expenseService.create(expense);
      expenseIds.push(createdExpense.id);
    });

    event.tasks = taskIds;
    event.expenses = expenseIds;

    // Persist event
    if (this.editing && this.editingEventId) {
      const idx = existingEvents.findIndex((e: any) => Number(e.id) === Number(this.editingEventId));
      if (idx !== -1) {
        existingEvents[idx] = event;
      } else {
        existingEvents.push(event);
      }
    } else {
      existingEvents.push(event);
    }
    localStorage.setItem('events', JSON.stringify(existingEvents));

    // Handle invitations
    const existingInvitations = JSON.parse(localStorage.getItem('invitations') || '[]');
    guestIds.forEach((guestId, index) => {
      const already = existingInvitations.some((i: any) => Number(i.eventId) === Number(event.id) && (Number(i.guestId) === Number(guestId) || i.email === guestEmails[index]));
      if (!already) {
        const newInvitation = {
          id: existingInvitations.length ? Math.max(...existingInvitations.map((i: any) => i.id)) + 1 : 1,
          eventId: event.id,
          guestId,
          email: guestEmails[index],
          status: 'Pending',
          createdAt: new Date().toISOString()
        };
        existingInvitations.push(newInvitation);
      }
    });
    localStorage.setItem('invitations', JSON.stringify(existingInvitations));

    // Update guests' eventIds
    const guestsUpdated = existingGuests.map((g: any) => {
      if (guestIds.includes(g.id)) {
        const currentEventIds = Array.isArray(g.eventIds) ? g.eventIds : (g.eventId ? [g.eventId] : []);
        if (!currentEventIds.includes(event.id)) {
          currentEventIds.push(event.id);
        }
        return { ...g, eventIds: currentEventIds, eventId: event.id };
      }
      return g;
    });
    localStorage.setItem('guests', JSON.stringify(guestsUpdated));

    // Success notification
    const title = this.editing ? 'Event Updated!' : 'Event Created!';
    const text = this.editing ? 'The event has been updated successfully.' : 'The event, invitations, tasks, and expenses have been created successfully.';
    Swal.fire({
      icon: 'success',
      title,
      text,
      confirmButtonText: 'OK'
    }).then(() => {
      this.router.navigate(['/dashboard/events'], { queryParams: { refresh: Date.now() } });
    });
  }
}
