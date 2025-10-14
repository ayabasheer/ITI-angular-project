import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {
  user: UserProfile = { id: '', name: '', email: '', phone: '' };
  editMode: boolean = false;

  ngOnInit() {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.user = JSON.parse(storedUser);
    }
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  saveProfile() {
    if (!this.user.name.trim() || !this.user.email.trim()) {
      Swal.fire('Error', 'Name and email are required', 'error');
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify(this.user));
    Swal.fire('Success', 'Profile updated successfully', 'success');
    this.editMode = false;
  }
}
