import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, interval } from 'rxjs';

/**
 * Processes a list of items (events) at a fixed rate.
 * Usage:
 *  const svc = injector.get(EventProcessorService);
 *  svc.onEvent$.subscribe(e => console.log('got', e));
 *  svc.start(eventsArray, 1000);
 */
@Injectable({ providedIn: 'root' })
export class EventProcessorService implements OnDestroy {
  private events: any[] = [];
  private index = 0;
  private tickSub: Subscription | null = null;
  private eventSubject = new Subject<any>();
  readonly onEvent$ = this.eventSubject.asObservable();

  private stateSubject = new BehaviorSubject<'stopped' | 'running' | 'paused'>('stopped');
  readonly state$ = this.stateSubject.asObservable();

  constructor() {}

  /** Start processing a copy of the events array at intervalMs milliseconds. */
  start(events: any[], intervalMs: number): void {
    this.stop();
    this.events = Array.isArray(events) ? events.slice() : [];
    this.index = 0;
    if (this.events.length === 0) {
      this.stateSubject.next('stopped');
      return;
    }
    this.stateSubject.next('running');
    this.tickSub = interval(intervalMs).subscribe(() => this.emitNext());
  }

  /** Pause processing (keeps current index). */
  pause(): void {
    if (this.tickSub) {
      this.tickSub.unsubscribe();
      this.tickSub = null;
      this.stateSubject.next('paused');
    }
  }

  /** Resume processing using the same interval (supply intervalMs to resume with a new rate). */
  resume(intervalMs: number): void {
    if (this.stateSubject.value !== 'paused') return;
    if (this.index >= this.events.length) {
      this.stop();
      return;
    }
    this.stateSubject.next('running');
    this.tickSub = interval(intervalMs).subscribe(() => this.emitNext());
  }

  /** Stop processing and reset state. */
  stop(): void {
    if (this.tickSub) {
      this.tickSub.unsubscribe();
      this.tickSub = null;
    }
    this.events = [];
    this.index = 0;
    this.stateSubject.next('stopped');
  }

  /** Emit the next event in the list; called internally by the interval subscription. */
  private emitNext(): void {
    if (this.index >= this.events.length) {
      this.stop();
      return;
    }
    try {
      const e = this.events[this.index];
      this.eventSubject.next(e);
    } finally {
      this.index += 1;
      if (this.index >= this.events.length) {
        // complete after last emission
        this.stop();
      }
    }
  }

  /** Helper that returns a Promise resolved when processing completes. */
  processAllWithCallback(events: any[], intervalMs: number, cb: (ev: any) => void): Promise<void> {
    return new Promise((resolve) => {
      const sub = this.onEvent$.subscribe(ev => cb(ev));
      this.start(events, intervalMs);
      const s2 = this.state$.subscribe(state => {
        if (state === 'stopped') {
          sub.unsubscribe();
          s2.unsubscribe();
          resolve();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.stop();
    this.eventSubject.complete();
    this.stateSubject.complete();
  }
}
