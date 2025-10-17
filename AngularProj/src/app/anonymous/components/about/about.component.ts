import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-about',
	standalone: true,
		imports: [CommonModule, NavbarComponent , FooterComponent],
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.css', '../../anonstyles.css'],
	encapsulation: ViewEncapsulation.None
})
export class AboutComponent implements OnInit {
	eventsCount = 0;
	clientsCount = 0;
	years = 0;
	testimonials: Array<{ comment: string; guestName?: string; eventTitle?: string }> = [];
	topFeedbacks: Array<{ rating: number; comment?: string; guestName?: string; eventTitle?: string }> = [];

	ngOnInit(): void {
		try {
			const events = JSON.parse(localStorage.getItem('events') || '[]');
			const guests = JSON.parse(localStorage.getItem('guests') || '[]');
			const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');

			this.eventsCount = Array.isArray(events) ? events.length : 0;
			this.clientsCount = Array.isArray(guests) ? guests.length *7: 0;
			this.years = 5;

			const recentFeedbacks = Array.isArray(feedbacks) ? feedbacks.slice(-6).reverse() : [];
			for (const fb of recentFeedbacks) {
				const guest = (Array.isArray(guests) ? guests.find((g: any) => g.id === fb.guestId) : null) || {};
				const event = (Array.isArray(events) ? events.find((e: any) => e.id === fb.eventId) : null) || {};
				this.testimonials.push({ comment: fb.comment || '', guestName: guest.name || ('Guest ' + fb.guestId), eventTitle: event.name || '' });
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
		const eTarget = this.eventsCount;
		const cTarget = this.clientsCount;
		const eStep = Math.max(1, Math.floor(eTarget / steps));
		const cStep = Math.max(1, Math.floor(cTarget / steps));
		let e = 0, c = 0;
		const iv = setInterval(() => {
			e = Math.min(eTarget, e + eStep);
			c = Math.min(cTarget, c + cStep);
			this.eventsCount = e;
			this.clientsCount = c;
			if (e >= eTarget && c >= cTarget) {
				clearInterval(iv);
			}
		}, Math.max(10, Math.floor(dur / steps)));
	}
}
