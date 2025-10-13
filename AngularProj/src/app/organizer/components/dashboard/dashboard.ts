import { Component, OnInit } from '@angular/core';
import { EventService } from '../../../shared/services/event';
import { EventModel } from '../../../shared/models/interfaces';
import { EventGeneratorService } from '../../../shared/services/event-generator.service';
import { CommonModule } from '@angular/common'; // ✅ DatePipe جاي مع CommonModule}
import { GuestService } from '../../../shared/services/guest';
import { TaskService } from '../../../shared/services/task';
import { ExpenseService } from '../../../shared/services/expense';  // ✅
import { RouterModule } from '@angular/router';




@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,RouterModule], // ✅ لازم تضيفها هنا
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'] // ✅ كانت styleUrl بالغلط
})
export class Dashboard implements OnInit {
  total = 0;
  upcoming = 0;
  completed = 0;
  totalGuests = 0;

 constructor(
    private eventService: EventService,
    private guestService: GuestService,
    private taskService: TaskService,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

    loadStats() {
    const events = this.eventService.getAll();
    this.total = events.length;
    this.upcoming = events.filter(e => e.status === 'Upcoming').length;
    this.completed = events.filter(e => e.status === 'Completed').length;

    const guests = this.guestService.getAll();
    this.totalGuests = guests.length;
  }
}
