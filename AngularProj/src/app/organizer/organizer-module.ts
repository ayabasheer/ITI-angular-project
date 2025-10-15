import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizerRoutingModule } from './organizer-routing-module';
import { RouterModule, Routes } from '@angular/router';
import { routes } from "./organizer-routing-module";



@NgModule({
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    OrganizerRoutingModule
  ],

  exports: [RouterModule]
})
export class OrganizerModule {}
