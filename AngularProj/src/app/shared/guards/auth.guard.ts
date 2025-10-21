import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class OrganizerGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRaw = localStorage.getItem('currentUser');
    if (!userRaw) {
      this.router.navigate(['/login']);
      return false;
    }
    const user = JSON.parse(userRaw);
    if (user.role !== 'Organizer') {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRaw = localStorage.getItem('currentUser');
    if (!userRaw) {
      this.router.navigate(['/login']);
      return false;
    }
    const user = JSON.parse(userRaw);
    if (user.role !== 'Guest') {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
