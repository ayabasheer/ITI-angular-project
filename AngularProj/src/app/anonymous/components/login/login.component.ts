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
    const user = { id: Date.now(), email: this.email, role: this.roleSelected };
    this.auth.login(user);
    const redirect = this.lastRoute.get() || '/';
    this.lastRoute.clear();
    this.router.navigateByUrl(redirect);
  }
}
