import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BreadcrumbModule } from '../breadcrumb/breadcrumb.module';

import { VersioningService } from './versioning.service';
import { VersioningStatusComponent } from './status.component';
import { VersioningStatusBadgeComponent } from './status-badge.component';
import { VersioningUpdateComponent } from './update.component';


const routes: Routes = [
  { path: 'versioning',  component: VersioningStatusComponent },
  { path: 'versioning/update',  component: VersioningUpdateComponent },
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(routes),

    NgbModule,

    BreadcrumbModule,
  ],
  declarations: [
    VersioningStatusComponent,
    VersioningStatusBadgeComponent,
    VersioningUpdateComponent,
  ],
  providers: [
    VersioningService,
  ],
  entryComponents: [
  ]
})
export class VersioningModule {}
