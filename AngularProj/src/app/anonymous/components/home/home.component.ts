
import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
	selector: 'app-home',
	standalone: true,
	imports: [CommonModule, RouterLink , NavbarComponent ,FooterComponent],
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
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
			this.feedbackEntries = this.feedbacks
				.filter((f: any) => f.rating === 5)
				.map((f: any) => ({ feedback: f, event: mapEv.get(f.eventId) || null }))
				.filter((x: any) => x.event)
				.slice(0, 8);

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
		// Attempt to autoplay the hero video on initial load. Browsers allow autoplay if muted.
		try {
			const video = this.heroVideo?.nativeElement;
			if (video) {
				// ensure muted so autoplay is permitted
				video.muted = true;
				this.isMuted = true;

				const tryPlay = () => {
					const p = video.play();
					if (p && typeof p.then === 'function') {
						p.then(() => this.isPlaying = true).catch(() => {
							// Autoplay failed (likely due to browser policy); keep muted and wait for user interaction.
							this.isPlaying = false;
						});
					}
				};

				if (video.readyState >= 2) {
					tryPlay();
				} else {
					// Play when enough data is available
					video.addEventListener('canplay', tryPlay, { once: true });
					// Fallback: try after a short delay
					setTimeout(tryPlay, 250);
				}
			}
		} catch {
			// ignore failures
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

