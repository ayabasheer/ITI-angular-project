import { Injectable } from '@angular/core';

export interface User {
  id: number;
  name?: string;
  email?: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private key = 'currentUser';

  get currentUser(): User | null {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  login(user: User) {
    try {
      localStorage.setItem(this.key, JSON.stringify(user));
    } catch {}
  }

  register(user: User) {
    // for this demo, registration is same as login
    this.login(user);
  }

  logout() {
    // Only remove the current session, not user data
    try {
      localStorage.removeItem(this.key);
    } catch {}
  }
}
