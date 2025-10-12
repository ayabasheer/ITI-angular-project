import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Profile } from './components/profile/profile';
import { Event } from '../shared/services/event';
import { Dashboard } from './components/dashboard/dashboard';

const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'events', component: Event },
  { path: 'profile', component: Profile },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
