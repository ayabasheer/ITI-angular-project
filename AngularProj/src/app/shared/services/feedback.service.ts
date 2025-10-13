import { Injectable } from '@angular/core';
import type { FeedbackPayload } from '../models/interfaces';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private keys = {
    guests: 'guests',
    events: 'events',
    feedbacks: 'feedbacks',
    snapshot: 'event_planner_seed'
  };

  private load<T>(key: string): T[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) as T[] : [];
    } catch {
      return [];
    }
  }

  private save<T>(key: string, arr: T[]) {
    localStorage.setItem(key, JSON.stringify(arr));
  }

  submitFeedback(payload: FeedbackPayload) {
    const guests = this.load<any>(this.keys.guests);
    const events = this.load<any>(this.keys.events);
    const feedbacks = this.load<any>(this.keys.feedbacks);

    const guest = guests.find(g => g.id === payload.guestId);
    if (!guest) return { success: false, message: 'Guest not found' };

    // Ensure guest belongs to the event
    if (guest.eventId !== payload.eventId) {
      return { success: false, message: 'Guest not associated with this event' };
    }

    const event = events.find(e => e.id === payload.eventId);
    if (!event) return { success: false, message: 'Event not found' };

    // Only allow feedback if event status is Completed
    if (event.status !== 'Completed') {
      return { success: false, message: 'Feedback allowed only for completed events' };
    }

    // Prevent duplicate feedback from same guest
    if (guest.feedbackId) {
      return { success: false, message: 'Guest has already submitted feedback' };
    }

    const nextId = feedbacks.length ? Math.max(...feedbacks.map(f => f.id)) + 1 : 1;
    const fb = {
      id: nextId,
      guestId: payload.guestId,
      eventId: payload.eventId,
      rating: payload.rating,
      comment: payload.comment || '',
      createdAt: new Date().toISOString()
    };

    feedbacks.push(fb);
    this.save(this.keys.feedbacks, feedbacks);

    // update guest
    guest.feedbackId = fb.id;
    this.save(this.keys.guests, guests);

    // update event feedbacks array
    event.feedbacks = event.feedbacks || [];
    event.feedbacks.push(fb.id);
    this.save(this.keys.events, events);

    // update snapshot
    const snapshot = {
      organizers: localStorage.getItem('organizers') ? JSON.parse(localStorage.getItem('organizers') as string) : [],
      admins: localStorage.getItem('admins') ? JSON.parse(localStorage.getItem('admins') as string) : [],
      guests,
      events,
      tasks: localStorage.getItem('tasks') ? JSON.parse(localStorage.getItem('tasks') as string) : [],
      expenses: localStorage.getItem('expenses') ? JSON.parse(localStorage.getItem('expenses') as string) : [],
      feedbacks,
      generatedAt: new Date().toISOString()
    };
    localStorage.setItem(this.keys.snapshot, JSON.stringify(snapshot));

    return { success: true, feedback: fb };
  }
}
