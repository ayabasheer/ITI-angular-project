import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth.service';
import { LastRouteService } from '../../../shared/services/last-route.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
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
    const user = { id: Date.now(), name: this.name, email: this.email, role: this.roleSelected };
    this.auth.register(user);
    const redirect = this.lastRoute.get() || '/';
    this.lastRoute.clear();
    this.router.navigateByUrl(redirect);
  }
}
