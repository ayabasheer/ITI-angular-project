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

  constructor(private auth: AuthService, private router: Router, private lastRoute: LastRouteService) {}

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
        record = { ...record, status: 'Pending', feedbackId: null, eventId: 0 };
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
