import { Injectable } from '@angular/core';
import { generateAndSaveAllWithImages } from './events-data-generator';

@Injectable({ providedIn: 'root' })
export class EventGeneratorService {
	private snapshotKey = 'event_planner_seed';

	isSeeded(): boolean {
		return !!localStorage.getItem(this.snapshotKey);
	}
	generateAndSaveAll(): Promise<any> {
		return generateAndSaveAllWithImages();
	}
	 async ensureDemoData(): Promise<void> {
			const data = localStorage.getItem('events');
			if (!data) {
				// Generate and persist a full demo dataset
				try {
					await generateAndSaveAllWithImages();
				} catch (e) {
					console.warn('Failed to generate demo data', e);
				}
			}
		}

	clearSeed() {
		localStorage.removeItem(this.snapshotKey);
		['organizers','admins','guests','events','tasks','expenses','feedbacks'].forEach(k => localStorage.removeItem(k));
	}
}
