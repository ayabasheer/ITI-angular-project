import { Injectable } from '@angular/core';

export type InvitationStatus = 'Pending' | 'Accepted' | 'Refused';

export interface InvitationRecord {
  id: number;
  eventId: number;
  guestId: number;
  status: InvitationStatus | string;
}

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private key = 'invitations';

  getAll(): InvitationRecord[] {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as any[];
      // normalize shapes and types
      return parsed.map(p => ({
        id: Number(p.id),
        eventId: Number(p.eventId),
        guestId: Number(p.guestId),
        status: p.status,
        // preserve any extra fields (email, createdAt) by spreading
        ...(p.email ? { email: p.email } : {}),
        ...(p.createdAt ? { createdAt: p.createdAt } : {})
      } as InvitationRecord));
    } catch (e) {
      console.warn('Failed to parse invitations from localStorage', e);
      return [];
    }
  }

  save(all: InvitationRecord[]): void {
    try {
      localStorage.setItem(this.key, JSON.stringify(all));
    } catch (e) {
      console.warn('Failed to save invitations to localStorage', e);
    }
  }
}
