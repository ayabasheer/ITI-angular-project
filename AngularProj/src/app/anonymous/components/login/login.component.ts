import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { LastRouteService } from '../../../shared/services/last-route.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  roleSelected = '';
  email = '';
  password = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private lastRoute: LastRouteService
  ) {}

  selectRole(r: string) {
    this.roleSelected = r;
  }

  reset() {
    this.roleSelected = '';
  }

  onSubmit(e: Event) {
    e.preventDefault();
    // Attempt to find a matching user in localStorage for the selected role
    const roleKeyMap: Record<string, string> = { Organizer: 'organizers', Guest: 'guests', Admin: 'admins' };
    const key = roleKeyMap[this.roleSelected] || null;
    if (!key) {
      alert('Please select a valid role');
      return;
    }
    try {
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      const matched = arr.find((u: any) => u.email === this.email && (u.password === this.password));
      if (!matched) {
        alert('Invalid credentials');
        return;
      }
      // Only store a minimal user object in AuthService
      const user = { id: matched.id, name: matched.name, email: matched.email, role: matched.role };
      this.auth.login(user);
      const redirect = this.lastRoute.get() || '/';
      this.lastRoute.clear();
      this.router.navigateByUrl(redirect);
    } catch (err) {
      console.error('Login error', err);
      alert('Login failed');
    }
  }
}
