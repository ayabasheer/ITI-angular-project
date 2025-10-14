import { Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { FooterComponent } from "../../../shared/components/footer/footer.component";

@Component({
	selector: 'app-contact',
	standalone: true,
	templateUrl: './contact.component.html',
 imports: [NavbarComponent, FooterComponent]
})
export class ContactComponent {}
