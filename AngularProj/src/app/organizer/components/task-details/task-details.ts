import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { Task } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-details.html',
  styleUrls: ['./task-details.css']
})
export class TaskDetails implements OnInit {
  task: Task | null = null;
  event: any = null;
  assignedTo: any = null;
  isDarkMode: boolean = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.isDarkMode = localStorage.getItem('darkMode') === 'true';
    window.addEventListener('theme:changed', (e: any) => {
      this.isDarkMode = e.detail.dark;
    });

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

  goBack() {
    window.history.back();
  }

  goForward() {
    window.history.forward();
  }
}
