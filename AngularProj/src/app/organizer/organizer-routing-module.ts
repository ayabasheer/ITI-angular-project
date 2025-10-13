import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CreateEvent } from './components/create-event/create-event';
import { ManageEvents } from './components/manage-events/manage-events';
import { Expenses } from './components/expenses/expenses';
import { Guests } from './components/guest/guest';
import { Tasks } from './components/tasks/tasks';




const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: Dashboard },
  { path: 'events', component: ManageEvents },
  { path: 'events/create', component: CreateEvent },
  { path: 'events/edit/:id', component: CreateEvent } ,// reuse create for edit
  {path: 'expenses', component: Expenses},
  {path: 'guests', component: Guests},
  {path: 'tasks', component: Tasks}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizerRoutingModule { }
