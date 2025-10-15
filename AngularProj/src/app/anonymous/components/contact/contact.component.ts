import { Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-contact',
	standalone: true,
	templateUrl: './contact.component.html',
	 imports: [CommonModule, NavbarComponent, FooterComponent, FormsModule],
	 styleUrls: ['./contact.component.css']
})
export class ContactComponent {
	model = { name: '', email: '', message: '' };
	submitted = false;

	submit(form: any) {
		if (!form || !form.valid) return;
		// For demo: persist message to localStorage under 'contacts'
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
