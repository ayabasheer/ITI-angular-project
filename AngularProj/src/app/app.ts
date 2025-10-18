import { Component, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { EventGeneratorService } from './shared/services/event-generator.service';
import { LastRouteService } from './shared/services/last-route.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [RouterOutlet, ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('AngularProj');
  constructor(
    eventGen: EventGeneratorService,
    router: Router,
    lastRoute: LastRouteService
  ) {
    // Only ensure demo data exists; do not unconditionally overwrite existing events
    // This prevents user-created events from being erased on reload.
    eventGen.ensureDemoData();

    router.events.subscribe((evt) => {
      if (evt instanceof NavigationEnd) {
        const url = evt.urlAfterRedirects || evt.url;
        if (!url.startsWith('/login') && !url.startsWith('/register')) {
          lastRoute.set(url);
        }
      }
    });
  }
}
