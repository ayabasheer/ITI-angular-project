import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CreateEvent } from './components/create-event/create-event';
import { Expenses } from './components/expenses/expenses';
import { Guests } from './components/guest/guest';
import { Tasks } from './components/tasks/tasks';
import { Events } from './components/events/events';
import { FeedbackComponent } from '../anonymous/components/feedback/feedback.component';
import { EventDetailComponent } from '../anonymous/components/events/event-detail.component';




export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: 'events', component: Events },
      { path: 'events/:id', component: EventDetailComponent },
      { path: 'guests', component: Guests },
      { path: 'tasks', component: Tasks },
      { path: 'expenses', component: Expenses },
      { path: 'feedback', component: FeedbackComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizerRoutingModule { }
