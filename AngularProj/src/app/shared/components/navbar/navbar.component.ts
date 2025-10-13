import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';

@Component({
	selector: 'app-navbar',
	standalone: true,
		imports: [CommonModule, RouterLink, RouterLinkActive],
	templateUrl: './navbar.component.html',
	styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
	isOpen = false;

	constructor(public auth: AuthService, private router: Router) {}

	toggleMenu() {
		this.isOpen = !this.isOpen;
	}

	logout() {
		this.auth.logout();
	}
}
