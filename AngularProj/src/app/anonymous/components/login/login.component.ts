import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { LastRouteService } from '../../../shared/services/last-route.service';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule ,RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
