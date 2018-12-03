import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AuthGuard } from '../auth/auth.guard';

import { BreadcrumbModule } from '../breadcrumb/breadcrumb.module';

import { VersioningService } from './versioning.service';
import { VersioningStatusComponent } from './status.component';
import { VersioningStatusBadgeComponent } from './status-badge.component';
import { VersioningUpdateComponent } from './update.component';


const routes: Routes = [
  {
    path: 'versioning',
    component: VersioningStatusComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'versioning/update',
    component: VersioningUpdateComponent,
    canActivate: [AuthGuard],
  },
];


@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    ReactiveFormsModule,
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
