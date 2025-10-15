import { EventService } from './../../../shared/services/event';
import { Component ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventModel } from '../../../shared/models/interfaces';
import { AuthService } from '../../../shared/services/auth.service';
@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './events.html',
  styleUrls: ['./events.css'] // ✅ كانت styleUrl بالغلط
})
export class Events implements OnInit {
  events: EventModel[] = [];
  defaultImage = 'https://via.placeholder.com/400x250?text=Event';

  constructor(private eventService: EventService, private auth: AuthService) {}

  ngOnInit() {
    const all = this.eventService.getAll();
    const user = this.auth.currentUser;
    if (user && user.role === 'Organizer') {
      this.events = all.filter(e => e.createdBy === user.id);
    } else {
      this.events = [];
    }
  }
}
