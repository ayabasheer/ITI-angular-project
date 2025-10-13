import { Component ,OnInit} from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { GuestService } from '../../../shared/services/guest';
import { Guest } from '../../../shared/models/interfaces';

@Component({
  selector: 'app-guest',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './guest.html',
  styleUrl: './guest.css'
})
export class Guests implements OnInit {
  guests: Guest[] = [];

  constructor(private guestService: GuestService) {}

  ngOnInit() {
    this.guests = this.guestService.getAll();
  }
}