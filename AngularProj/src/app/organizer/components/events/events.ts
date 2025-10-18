import { EventService } from './../../../shared/services/event';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventModel } from '../../../shared/models/interfaces';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css']
})
export class Events implements OnInit {
  events: EventModel[] = [];
  defaultImage = 'https://via.placeholder.com/400x250?text=Event';

  constructor(private eventService: EventService, private auth: AuthService) {}

  ngOnInit() {
    this.loadEvents();
  }

  loadEvents() {
    const all = this.eventService.getAll();
    const user = this.auth.currentUser;

    console.log('All events:', all);
    console.log('Current user:', user);

    if (user && user.role === 'Organizer') {
      const userId = Number(user.id); // ✅ تأكدنا أنه رقم
      this.events = all.filter(e => Number(e.createdBy) === userId);
      console.log('Filtered events:', this.events);
    } else {
      this.events = [];
    }
  }
}
