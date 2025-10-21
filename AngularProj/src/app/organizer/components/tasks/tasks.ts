import { TaskService } from './../../../shared/services/task';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../shared/models/interfaces';
import { EventService } from '../../../shared/services/event';
import { AuthService } from '../../../shared/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css'] // ✅ كانت styleUrl بالغلط
})
export class Tasks implements OnInit {
  tasks: Task[] = [];
  events: any[] = [];
  query: string = '';
  priorityFilter: string = 'all';
  statusFilter: string = 'all';

  constructor(
    private taskService: TaskService,
    private eventService: EventService,
    private auth: AuthService,
    private router: Router
  ) {}

  goBack() {
    window.history.back();
  }

  goForward() {
    window.history.forward();
  }

  addTask() {
    // Navigate to create task page or open modal
    this.router.navigate(['/dashboard/create-task']);
  }

  editTask(task: Task) {
    this.router.navigate(['/dashboard/tasks', task.id, 'edit']);
  }

  deleteTask(task: Task) {
    // Implement delete logic
    console.log('Delete task:', task);
  }

  get filteredTasks(): Task[] {
    return this.tasks.filter(task => {
      const matchesQuery = !this.query || task.title.toLowerCase().includes(this.query.toLowerCase()) || (task.description && task.description.toLowerCase().includes(this.query.toLowerCase()));
      const matchesPriority = this.priorityFilter === 'all' || task.priority === this.priorityFilter;
      const matchesStatus = this.statusFilter === 'all' || task.status === this.statusFilter;
      return matchesQuery && matchesPriority && matchesStatus;
    });
  }

  ngOnInit() {
    const user = this.auth.currentUser;
    if (user && user.role === 'Organizer') {
      const myEventIds = new Set<number>(
        this.eventService
          .getAll()
          .filter(e => e.createdBy === user.id)
          .map(e => e.id)
      );
      this.events = this.eventService.getAll().filter(e => myEventIds.has(e.id));
      const allTasks = this.taskService.getAll();
      this.tasks = allTasks.filter((t: Task) => typeof t.eventId === 'number' && myEventIds.has(t.eventId));
    } else {
      this.tasks = [];
    }
  }

  getEventName(eventId?: number | null): string {
    if (typeof eventId !== 'number') return 'Unknown Event';
    const event = this.events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown Event';
  }
}
