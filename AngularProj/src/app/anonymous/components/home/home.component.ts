
import { Component, AfterViewInit, ElementRef, ViewChild , ViewEncapsulation} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, RouterLink , NavbarComponent ,FooterComponent],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css', '../../anonstyles.css'],
	encapsulation: ViewEncapsulation.None
})
export class HomeComponent {
	events: any[] = [];
	feedbacks: any[] = [];
	feedbackEntries: Array<{ feedback: any; event: any }> = [];
	featuredEvents: any[] = [];
	isPlaying = false;
	isMuted = true;

	@ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

	constructor() {
		try {
			const raw = localStorage.getItem('events');
			this.events = raw ? JSON.parse(raw) : [];
			const rawF = localStorage.getItem('feedbacks');
			this.feedbacks = rawF ? JSON.parse(rawF) : [];
			this.buildFeedbackEntries();
		} catch {
			this.events = [];
		}
	}

	private buildFeedbackEntries() {
		try {
			const mapEv = new Map<number, any>();
			this.events.forEach(e => mapEv.set(e.id, e));
			// build 5-star feedback entries but avoid repeating the same guest/comment
			const entries = this.feedbacks
				.filter((f: any) => f.rating === 5)
				.map((f: any) => ({ feedback: f, event: mapEv.get(f.eventId) || null }))
				.filter((x: any) => x.event);

			const seenGuests = new Set<number>();
			const seenComments = new Set<string>();
			this.feedbackEntries = [];
			for (const eEntry of entries) {
				const gid = eEntry.feedback?.guestId;
				const comment = (eEntry.feedback?.comment || '').trim();
				// prefer to dedupe by guest id, fallback to unique comment
				if (gid && seenGuests.has(gid)) continue;
				if (!gid && comment && seenComments.has(comment)) continue;

				if (gid) seenGuests.add(gid);
				if (comment) seenComments.add(comment);

				this.feedbackEntries.push(eEntry);
				if (this.feedbackEntries.length >= 8) break;
			}

			try {
				const fiveStarEventIds = new Set<number>();
				this.feedbacks.forEach((f: any) => {
					if (f.rating === 5 && f.eventId != null) fiveStarEventIds.add(f.eventId);
				});
				this.featuredEvents = Array.from(fiveStarEventIds)
					.map(id => mapEv.get(id))
					.filter(Boolean)
					.slice(0, 3);
			} catch {
				this.featuredEvents = [];
			}
		} catch (e) {
			this.feedbackEntries = [];
		}
	}

	ngAfterViewInit(): void {
		try {
			const video = this.heroVideo?.nativeElement;
			if (video) {
				video.muted = true;
				this.isMuted = true;

				const tryPlay = () => {
					const p = video.play();
					if (p && typeof p.then === 'function') {
						p.then(() => this.isPlaying = true).catch(() => {
							this.isPlaying = false;
						});
					}
				};

				if (video.readyState >= 2) {
					tryPlay();
				} else {
					video.addEventListener('canplay', tryPlay, { once: true });
					setTimeout(tryPlay, 250);
				}
			}
		} catch {
		}
	}

	playToggle(): void {
		try {
			const video = this.heroVideo?.nativeElement;
			if (!video) return;
			if (video.paused) {
				video.play().then(() => this.isPlaying = true).catch(() => {});
			} else {
				video.pause();
				this.isPlaying = false;
			}
		} catch {}
	}

	toggleMute(): void {
		try {
			const video = this.heroVideo?.nativeElement;
			if (!video) return;
			video.muted = !video.muted;
			this.isMuted = video.muted;
		} catch {}
	}
}

