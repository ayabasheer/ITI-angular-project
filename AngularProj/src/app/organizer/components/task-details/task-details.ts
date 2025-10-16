import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Task } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './task-details.html',
  styleUrls: ['./task-details.css']
})
export class TaskDetails {
  task: Task | null = null;
  event: any = null;
  assignedTo: any = null;

  constructor(private route: ActivatedRoute) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const rawT = localStorage.getItem('tasks');
    const rawE = localStorage.getItem('events');
    const rawU = localStorage.getItem('organizers');
    const tasks = rawT ? JSON.parse(rawT) : [];
    const events = rawE ? JSON.parse(rawE) : [];
    const users = rawU ? JSON.parse(rawU) : [];
    this.task = tasks.find((t: Task) => t.id === id) || null;
    if (this.task) {
      this.event = events.find((e: any) => e.id === this.task!.eventId) || null;
      this.assignedTo = this.task!.assignedTo ? users.find((u: any) => u.id === this.task!.assignedTo) || null : null;
    }
  }
}
