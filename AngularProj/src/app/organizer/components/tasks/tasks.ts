import { TaskService } from './../../../shared/services/task';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../shared/models/interfaces';
import { EventService } from '../../../shared/services/event';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css'] // ✅ كانت styleUrl بالغلط
})
export class Tasks implements OnInit {
  tasks: Task[] = [];

  constructor(
    private taskService: TaskService,
    private eventService: EventService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user && user.role === 'Organizer') {
      const myEventIds = new Set<number>(
        this.eventService
          .getAll()
          .filter(e => e.createdBy === user.id)
          .map(e => e.id)
      );
      const allTasks = this.taskService.getAll();
      this.tasks = allTasks.filter((t: Task) => myEventIds.has(t.eventId));
    } else {
      this.tasks = [];
    }
  }
}
