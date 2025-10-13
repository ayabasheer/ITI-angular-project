import { EventService } from './../../../shared/services/event';
import { Component ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventModel } from '../../../shared/models/interfaces';
@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css'] // ✅ كانت styleUrl بالغلط
})
export class Events implements OnInit {
  events: EventModel[] = [];

  constructor(private eventService: EventService) {}

  ngOnInit() {
    this.events = this.eventService.getAll();
  }
}
