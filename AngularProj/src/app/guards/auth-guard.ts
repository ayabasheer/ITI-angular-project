import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
      // Not logged in
      return this.router.parseUrl('/login');
    }

    const user = JSON.parse(userStr);
    const role = user.role?.toLowerCase(); 

    const url = state.url.toLowerCase();

    // Check role-based access
    if (role === 'guest' && url.startsWith('/dashboard')) {
      // Guest cannot access organizer dashboard
      return this.router.parseUrl('/');   
    }

    if (role === 'organizer' && url.startsWith('/user')) {
      // Organizer cannot access user dashboard
      return this.router.parseUrl('/'); 
    }

    // Access granted
    return true;
  }
}
