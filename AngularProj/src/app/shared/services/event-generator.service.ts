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
      const demoEvents = [
        { id: 1, title: 'Demo Event 1', date: '2025-10-13' },
        { id: 2, title: 'Demo Event 2', date: '2025-10-14' }
      ];
      localStorage.setItem('events', JSON.stringify(demoEvents));
    }
  }

	clearSeed() {
		localStorage.removeItem(this.snapshotKey);
		['organizers','admins','guests','events','tasks','expenses','feedbacks'].forEach(k => localStorage.removeItem(k));
	}
}
