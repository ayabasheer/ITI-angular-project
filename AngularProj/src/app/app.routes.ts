import { Routes } from '@angular/router';

import { HomeComponent } from './anonymous/components/home/home.component';
import { AboutComponent } from './anonymous/components/about/about.component';
import { ContactComponent } from './anonymous/components/contact/contact.component';
import { LoginComponent } from './anonymous/components/login/login.component';
import { RegisterComponent } from './anonymous/components/register/register.component';
import { FeedbackComponent } from './anonymous/components/feedback/feedback.component';
import { EventsComponent } from './anonymous/components/events/events.component';
import { EventDetailComponent } from './anonymous/components/events/event-detail.component';
import { ProfileComponent } from './anonymous/components/profile/profile.component';
import { CreateEvent } from './organizer/components/create-event/create-event';



export const routes: Routes = [
	{ path: '', component: HomeComponent },
	{ path: 'about', component: AboutComponent },
	{ path: 'contact', component: ContactComponent },
	{ path: 'login', component: LoginComponent },
	{ path: 'register', component: RegisterComponent },
	{ path: 'profile', component: ProfileComponent },
	{ path: 'events/:id/feedback', component: FeedbackComponent },
	{ path: 'events/:id', component: EventDetailComponent },
	{ path: 'events', component: EventsComponent },
	{ path: 'create-event', component: CreateEvent },
	{path:"dashboard", loadChildren: () => import('./organizer/organizer-module').then(m => m.OrganizerModule)},
	{ path: '**', redirectTo: '' }
];
