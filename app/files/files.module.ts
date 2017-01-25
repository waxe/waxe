import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule } from '@angular/http';

import { AceEditorDirective } from 'ng2-ace-editor';

import { FileComponent } from './file.component';
import { FileEditorComponent } from './file-editor.component';
import { FileListComponent } from './file-list.component';
import { FileService } from './file.service';
import { BreadcrumbComponent } from './breadcrumb.component';


const routes: Routes = [
  { path: '',  component: FileListComponent },
  { path: 'edit/txt',  component: FileEditorComponent },
];


@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    RouterModule.forRoot(routes),
  ],
  declarations: [
    AceEditorDirective,
    BreadcrumbComponent,
    FileComponent,
    FileEditorComponent,
    FileListComponent,
  ],
  providers: [
    FileService,
  ],
})
export class FilesModule {}
