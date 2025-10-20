import { Component ,ViewEncapsulation } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-contact',
	standalone: true,
	templateUrl: './contact.component.html',
		imports: [CommonModule, NavbarComponent, FooterComponent, FormsModule],
	styleUrls: ['./contact.component.css', '../../anonstyles.css'],
	encapsulation: ViewEncapsulation.None
})
export class ContactComponent {
	model = { name: '', email: '', message: '' };
	submitted = false;

	// Name must start with a letter and only contain letters and spaces
	isNameInvalid(): boolean {
		const name = (this.model.name || '').trim();
		if (!name) return false; // empty handled by form required validators if any
		return !/^[A-Za-z][A-Za-z ]*$/.test(name);
	}

	// Email must start with a letter and match a basic email pattern
	isEmailInvalid(): boolean {
		const email = (this.model.email || '').trim();
		if (!email) return false;
		if (!/^[A-Za-z]/.test(email)) return true;
		return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	}

	submit(form: any) {
		if (!form || !form.valid) return;
		// Validate fields
		if (this.isNameInvalid()) {
			alert('Name must start with a letter and contain only letters and spaces.');
			return;
		}
		if (this.isEmailInvalid()) {
			alert('Email must start with a letter and be a valid email address.');
			return;
		}
		try {
			const existing = JSON.parse(localStorage.getItem('contacts') || '[]');
			existing.push({ ...this.model, createdAt: new Date().toISOString() });
			localStorage.setItem('contacts', JSON.stringify(existing));
		} catch (e) {
			console.warn('Unable to save contact', e);
		}
		this.submitted = true;
		this.model = { name: '', email: '', message: '' };
	}
}
