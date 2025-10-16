import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { CreateEvent } from './components/create-event/create-event';
import { Expenses } from './components/expenses/expenses';
import { Guests } from './components/guest/guest';
import { Tasks } from './components/tasks/tasks';
import { Events } from './components/events/events';
import { EventDetails } from './components/event-details/event-details';
import { GuestDetails } from './components/guest-details/guest-details';
import { TaskDetails } from './components/task-details/task-details';
import { ExpenseDetails } from './components/expense-details/expense-details';
import { OrganizerFeedback } from './components/feedback/feedback';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
    children: [
      { path: 'events', component: Events },
      { path: 'events/:id', component: EventDetails},
      { path: 'guests', component: Guests },
      { path: 'guests/:id', component: GuestDetails },
      { path: 'tasks', component: Tasks },
      { path: 'tasks/:id', component: TaskDetails },
      { path: 'expenses', component: Expenses },
      { path: 'expenses/:id', component: ExpenseDetails },
      { path: 'feedback', component: OrganizerFeedback },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizerRoutingModule { }
