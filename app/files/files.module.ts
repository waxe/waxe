import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

import { FileComponent } from './file.component';
import { FileListComponent } from './file-list.component';
import { FileService } from './file.service';
import { BreadcrumbComponent } from './breadcrumb.component';


const routes: Routes = [
  { path: '',  component: FileListComponent },
];


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    RouterModule.forRoot(routes),
  ],
  declarations: [
    BreadcrumbComponent,
    FileComponent,
    FileListComponent,
  ],
  providers: [
    FileService,
  ],
})
export class FilesModule {}
