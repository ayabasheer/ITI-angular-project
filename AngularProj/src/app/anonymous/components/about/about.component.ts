import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-about',
	standalone: true,
		imports: [CommonModule, NavbarComponent , FooterComponent],
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
	eventsCount = 0;
	clientsCount = 0;
	years = 0;
	testimonials: Array<{ comment: string; guestName?: string; eventTitle?: string }> = [];

	ngOnInit(): void {
		try {
			const events = JSON.parse(localStorage.getItem('events') || '[]');
			const guests = JSON.parse(localStorage.getItem('guests') || '[]');
			const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');

			this.eventsCount = Array.isArray(events) ? events.length : 0;
			this.clientsCount = Array.isArray(guests) ? guests.length : 0;
			this.years = 5; // default baseline; could be computed from data

			// pick up to 4 top testimonials by rating
			const topFeedbacks = Array.isArray(feedbacks) ? feedbacks.slice(0, 6) : [];
			for (const fb of topFeedbacks) {
				const guest = guests.find((g: any) => g.id === fb.guestId) || {};
				this.testimonials.push({ comment: fb.comment || '', guestName: guest.name || ('Guest ' + fb.guestId) });
			}
		} catch (e) {
			console.warn('Unable to load about metrics from localStorage', e);
		}

		this.animateCounters();
	}

	private animateCounters() {
		// simple incremental animation
		const dur = 800;
		const steps = 30;
		const eStep = Math.max(1, Math.floor(this.eventsCount / steps));
		const cStep = Math.max(1, Math.floor(this.clientsCount / steps));
		let e = 0, c = 0;
		const iv = setInterval(() => {
			e = Math.min(this.eventsCount, e + eStep);
			c = Math.min(this.clientsCount, c + cStep);
			this.eventsCount = e;
			this.clientsCount = c;
			if (e >= this.eventsCount && c >= this.clientsCount) {
				clearInterval(iv);
			}
		}, Math.max(10, Math.floor(dur / steps)));
	}
}
