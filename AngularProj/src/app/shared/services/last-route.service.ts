import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LastRouteService {
  private key = 'lastRoute';

  set(url: string) {
    try {
      localStorage.setItem(this.key, url);
    } catch (e) {}
  }

  get(): string | null {
    return localStorage.getItem(this.key);
  }

  clear() {
    localStorage.removeItem(this.key);
  }
}
