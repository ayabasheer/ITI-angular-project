import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Profile } from './components/profile/profile';
import { Events } from './components/events/events';
import { Dashboard } from './components/dashboard/dashboard';
import { Feedback } from './components/feedback/feedback';

const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'events', component: Events },
  { path: 'feedback', component: Feedback },
  { path: 'profile', component: Profile },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
