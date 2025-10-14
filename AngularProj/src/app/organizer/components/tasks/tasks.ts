import { TaskService } from './../../../shared/services/task';
import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../shared/models/interfaces';
@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tasks.html',
  styleUrls: ['./tasks.css'] // ✅ كانت styleUrl بالغلط 
})
export class Tasks implements OnInit {
  tasks: Task[] = [];

  constructor(private taskService: TaskService) {}

  ngOnInit() {
    this.tasks = this.taskService.getAll();
  }
}
