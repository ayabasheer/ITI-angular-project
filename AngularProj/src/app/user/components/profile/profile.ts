import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { GuestUser } from '../../interfaces/guest.interface';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class ProfileComponent implements OnInit {
  currentUser: GuestUser | null = null;
  editableUser: GuestUser | null = null;
  isDarkMode = false;

  // Regex patterns
  emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  phonePattern = /^\+\d{10,15}$/;
  namePattern = /^[A-Za-z ]{3,}$/;
  passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;

  ngOnInit(): void {
    this.isDarkMode = localStorage.getItem('themeMode') === 'dark';
    this.loadUserData();
  }

  loadUserData(): void {
    const current = localStorage.getItem('currentUser');
    const guestsData = localStorage.getItem('guests');

    if (!current || !guestsData) {
      Swal.fire({
        icon: 'error',
        title: 'No user data found',
        text: 'Please log in again.',
      });
      return;
    }

    const currentUser = JSON.parse(current);
    const guests: GuestUser[] = JSON.parse(guestsData);

    const guestData = guests.find(g => Number(g.id) === Number(currentUser.id));
    if (!guestData) {
      Swal.fire({
        icon: 'error',
        title: 'User not found',
        text: 'Your account may have been removed.',
      });
      return;
    }

    this.currentUser = guestData;
    this.editableUser = { ...guestData };
  }

  // ✅ Regex validation
  isNameValid(name: string | undefined): boolean {
    return !!name && this.namePattern.test(name);
  }

  isEmailValid(email: string | undefined): boolean {
    return !!email && this.emailPattern.test(email);
  }

  isPhoneValid(phone: string | undefined): boolean {
    return !!phone && this.phonePattern.test(phone);
  }

  isPasswordValid(password: string | undefined): boolean {
    return !!password && this.passwordPattern.test(password);
  }

  // ✅ Full form validation
  isFormValid(): boolean {
    return !!this.editableUser &&
      this.isNameValid(this.editableUser.name) &&
      this.isEmailValid(this.editableUser.email) &&
      this.isPhoneValid(this.editableUser.phone) &&
      this.isPasswordValid(this.editableUser.password);
  }

  // ✅ Save both currentUser and guests
  saveProfile(form: NgForm): void {
    if (!this.isFormValid() || !this.editableUser) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Data',
        text: 'Please correct the errors before saving.',
      });
      return;
    }

    const guests: GuestUser[] = JSON.parse(localStorage.getItem('guests') || '[]');
    const editableId = Number(this.editableUser.id);
    const index = guests.findIndex(g => Number(g.id) === editableId);

    if (index !== -1) {
      guests[index] = { ...this.editableUser };
    } else {
      guests.push({ ...this.editableUser });
    }

    localStorage.setItem('guests', JSON.stringify(guests));
    localStorage.setItem('currentUser', JSON.stringify(this.editableUser));
    this.currentUser = { ...this.editableUser };

    Swal.fire({
      icon: 'success',
      title: 'Profile Updated',
      text: 'Your information has been successfully updated!',
    });
  }

  // ✅ Reset form
  resetForm(form: NgForm): void {
    form.resetForm(this.currentUser);
    this.editableUser = { ...this.currentUser! };
  }
}
