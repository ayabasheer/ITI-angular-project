import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CreateEvent } from './components/create-event/create-event';
import { ManageEvents } from './components/manage-events/manage-events';

const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'create-event', component: CreateEvent },
  { path: 'manage-events', component: ManageEvents },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizerModule {}
