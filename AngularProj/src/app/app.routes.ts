import { Routes } from '@angular/router';

import { HomeComponent } from './anonymous/components/home/home.component';
import { AboutComponent } from './anonymous/components/about/about.component';
import { ContactComponent } from './anonymous/components/contact/contact.component';
import { LoginComponent } from './anonymous/components/login/login.component';
import { RegisterComponent } from './anonymous/components/register/register.component';
import { FeedbackComponent } from './anonymous/components/feedback/feedback.component';
import { EventsComponent } from './anonymous/components/events/events.component';
import { EventDetailComponent } from './anonymous/components/events/event-detail.component';
import { CreateEvent } from './organizer/components/create-event/create-event';
import { UserModule } from './user/user-module';
import { OrganizerGuard, UserGuard } from './shared/guards/auth.guard';



export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'contact', component: ContactComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'events/:id/feedback', component: FeedbackComponent },
	{ path: 'events/:id', component: EventDetailComponent },
	{ path: 'events', component: EventsComponent },
	{ path: 'create-event', component: CreateEvent },
	{path:"dashboard", loadChildren: () => import('./organizer/organizer-module').then(m => m.OrganizerModule), canActivate: [OrganizerGuard]},
	{path:"user", loadChildren: () => import('./user/user-module').then(m => m.UserModule), canActivate: [UserGuard]},
	{ path: '**', redirectTo: '' }
];
