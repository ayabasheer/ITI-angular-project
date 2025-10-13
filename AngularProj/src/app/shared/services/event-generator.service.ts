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

	clearSeed() {
		localStorage.removeItem(this.snapshotKey);
		['organizers','admins','guests','events','tasks','expenses','feedbacks'].forEach(k => localStorage.removeItem(k));
	}
}
