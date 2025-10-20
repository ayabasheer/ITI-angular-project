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

  // 🔹 Validation patterns
  private readonly patterns = {
    name: /^[A-Za-z ]{3,}$/,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+\d{10,15}$/,
    password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/
  };

  ngOnInit(): void {
    this.applyTheme();
    this.loadUserData();
  }

  // ✅ Apply dark mode from localStorage
  private applyTheme(): void {
    const mode = localStorage.getItem('themeMode');
    this.isDarkMode = mode === 'dark';
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  // ✅ Load user data safely
  private loadUserData(): void {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const guests: GuestUser[] = JSON.parse(localStorage.getItem('guests') || '[]');

      if (!currentUser || !guests.length) {
        this.showError('No user data found', 'Please log in again.');
        return;
      }

      const foundUser = guests.find(g => g.id === currentUser.id);
      if (!foundUser) {
        this.showError('User not found', 'Your account may have been removed.');
        return;
      }

      this.currentUser = foundUser;
      this.editableUser = { ...foundUser };
    } catch (error) {
      this.showError('Error loading profile', 'Data might be corrupted.');
      console.error('Profile Load Error:', error);
    }
  }

  // ✅ Validation helpers
  isValid(field: keyof GuestUser, value: string | undefined): boolean {
    const pattern = this.patterns[field as keyof typeof this.patterns];
    return !!value && !!pattern?.test(value);
  }

  // Backward compatibility for template checks
  isNameValid(value: string | undefined) { return this.isValid('name', value); }
  isEmailValid(value: string | undefined) { return this.isValid('email', value); }
  isPhoneValid(value: string | undefined) { return this.isValid('phone', value); }
  isPasswordValid(value: string | undefined) { return this.isValid('password', value); }

  // ✅ Full form validation
  isFormValid(): boolean {
    const u = this.editableUser;
    return !!u &&
      this.isValid('name', u.name) &&
      this.isValid('email', u.email) &&
      this.isValid('phone', u.phone) &&
      this.isValid('password', u.password);
  }

  // ✅ Save profile
  saveProfile(form: NgForm): void {
    if (!this.isFormValid() || !this.editableUser) {
      this.showError('Invalid Data', 'Please correct the errors before saving.');
      return;
    }

    try {
      const guests: GuestUser[] = JSON.parse(localStorage.getItem('guests') || '[]');
      const idx = guests.findIndex(g => g.id === this.editableUser!.id);

      if (idx !== -1) guests[idx] = { ...this.editableUser };
      else guests.push({ ...this.editableUser });

      localStorage.setItem('guests', JSON.stringify(guests));
      localStorage.setItem('currentUser', JSON.stringify(this.editableUser));

      this.currentUser = { ...this.editableUser };
      this.showSuccess('Profile Updated', 'Your information has been successfully updated!');
    } catch (error) {
      this.showError('Error saving profile', 'Please try again.');
      console.error('Save Error:', error);
    }
  }

  // ✅ Reset form to last saved version
  resetForm(form: NgForm): void {
    if (this.currentUser) {
      this.editableUser = { ...this.currentUser };
      form.resetForm(this.editableUser);
    }
  }

  // ✅ SweetAlert helpers
  private showError(title: string, text: string): void {
    Swal.fire({
      icon: 'error',
      title,
      text,
      background: this.isDarkMode ? '#2c2c2c' : '#fff',
      color: this.isDarkMode ? '#fff' : '#000'
    });
  }

  private showSuccess(title: string, text: string): void {
    Swal.fire({
      icon: 'success',
      title,
      text,
      background: this.isDarkMode ? '#2c2c2c' : '#fff',
      color: this.isDarkMode ? '#fff' : '#000',
      timer: 2000,
      showConfirmButton: false
    });
  }
}
