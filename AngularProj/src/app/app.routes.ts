import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./anonymous/anonymous-module').then(m => m.AnonymousModule)
  },
  {
    path: 'user',
    loadChildren: () =>
      import('./user/user-module').then(m => m.UserModule)
  },
  {
    path: 'organizer',
    loadChildren: () =>
      import('./organizer/organizer-module').then(m => m.OrganizerModule)
  },
  {
    path: '**',
    redirectTo: '',
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
