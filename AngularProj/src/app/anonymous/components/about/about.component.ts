import { Component } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';

@Component({
	selector: 'app-about',
 	standalone: true,
 	imports: [NavbarComponent , FooterComponent],
 	templateUrl: './about.component.html'
})
export class AboutComponent {}
