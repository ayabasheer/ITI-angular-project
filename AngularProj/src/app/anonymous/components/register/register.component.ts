import { Component ,ViewEncapsulation} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { LastRouteService } from '../../../shared/services/last-route.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule , RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css', '../../anonstyles.css'],
	encapsulation: ViewEncapsulation.None
})
export class RegisterComponent {
  roleSelected = '';
  name = '';
  email = '';
  password = '';
  isDarkMode = false;

  // Helper used by the template to validate email (keeps template expressions simple)
  isEmailInvalid(): boolean {
    if (!this.email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(this.email);
  }

  // Name must start with a letter and only contain letters and spaces
  isNameInvalid(): boolean {
    if (!this.name) return false;
    const nameRegex = /^[A-Za-z][A-Za-z ]*$/;
    return !nameRegex.test(this.name);
  }

  // Password must be at least 6 characters and contain letters and numbers
  isPasswordInvalid(): boolean {
    if (!this.password) return false;
    if (this.password.length < 6) return true;
    const hasLetter = /[A-Za-z]/.test(this.password);
    const hasNumber = /[0-9]/.test(this.password);
    return !(hasLetter && hasNumber);
  }

  constructor(private auth: AuthService, private router: Router, private lastRoute: LastRouteService) {}

  ngOnInit() {
    const saved = localStorage.getItem('darkMode');
    this.isDarkMode = saved === 'true';
    this.applyDarkMode();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyDarkMode();
  }

  private applyDarkMode() {
    if (this.isDarkMode) document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');
  }

  selectRole(r: string) {
    this.roleSelected = r;
  }

  reset() {
    this.roleSelected = '';
  }

  onSubmit(e: Event) {
    e.preventDefault();
    const roleKeyMap: Record<string, string> = { Organizer: 'organizers', Guest: 'guests', Admin: 'admins' };
    const key = roleKeyMap[this.roleSelected] || null;
    if (!key) {
      alert('Please select a valid role');
      return;
    }

    try {
      // Validate inputs per requirements
      if (this.isNameInvalid()) {
        alert('Name must start with a letter and contain only letters and spaces.');
        return;
      }
      // Email must start with a letter
      if (!this.email || !/^[A-Za-z]/.test(this.email) || this.isEmailInvalid()) {
        alert('Email must start with a letter and be a valid email address.');
        return;
      }
      if (this.isPasswordInvalid()) {
        alert('Password must be at least 6 characters and contain both letters and numbers.');
        return;
      }
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];

      // prevent duplicate email for the same role
      if (arr.find((u: any) => u.email === this.email)) {
        alert('An account with this email already exists for the selected role.');
        return;
      }

      // auto-increment id (use numeric ids used elsewhere)
      const newId = arr.length ? (Math.max(...arr.map((u: any) => u.id || 0)) + 1) : 1;

      const now = new Date().toISOString();

      // construct role-specific record (include password for demo)
      let record: any = { id: newId, name: this.name, email: this.email, password: this.password, role: this.roleSelected, createdAt: now };
      if (this.roleSelected === 'Guest') {
        record = { ...record, status: 'Pending', feedbackId: null, eventIds: [] };
      }

      arr.push(record);
      localStorage.setItem(key, JSON.stringify(arr));

      // Save minimal session for app usage
      const sessionUser = { id: record.id, name: record.name, email: record.email, role: record.role };
      this.auth.register(sessionUser);

      const redirect = this.lastRoute.get() || '/';
      this.lastRoute.clear();
      this.router.navigateByUrl(redirect);
    } catch (err) {
      console.error('Registration error', err);
      alert('Registration failed');
    }
  }
}
