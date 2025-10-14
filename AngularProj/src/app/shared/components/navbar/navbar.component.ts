import { Component, OnInit } from '@angular/core';
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
export class NavbarComponent implements OnInit {
	isOpen = false;
	isDarkMode = false;

	constructor(public auth: AuthService, private router: Router) {}

	ngOnInit() {
		const savedMode = localStorage.getItem('darkMode');
		this.isDarkMode = savedMode === 'true';
		this.applyDarkMode();
	}

	toggleMenu() {
		this.isOpen = !this.isOpen;
	}

	toggleDarkMode() {
		this.isDarkMode = !this.isDarkMode;
		localStorage.setItem('darkMode', this.isDarkMode.toString());
		this.applyDarkMode();
	}

	private applyDarkMode() {
		if (this.isDarkMode) {
			document.body.classList.add('dark-mode');
		} else {
			document.body.classList.remove('dark-mode');
		}
	}

	logout() {
		this.auth.logout();
	}

		onUserNameClick() {
			if (this.auth.currentUser?.role === 'Organizer') {
				this.router.navigate(['/dashboard']);
			} else if (this.auth.currentUser?.role === 'Guest') {
				this.router.navigate(['/user/dashboard']);
			} else {
				this.router.navigate(['/profile']);
			}
		}
}
