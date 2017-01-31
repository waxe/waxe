import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AceEditorDirective } from 'ng2-ace-editor';
import { ContextMenuModule } from 'angular2-contextmenu';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { FileBufferService } from './file-buffer.service';
import { FileComponent } from './file.component';
import { FileEditorComponent } from './file-editor.component';
import { FileListComponent } from './file-list.component';
import { CreateFolderModalComponent } from './create-folder-modal.component';
import { FileRenameModalComponent } from './file-rename-modal.component';
import { FileSelectionService } from './file-selection.service';
import { FileService } from './file.service';
import { BreadcrumbComponent } from './breadcrumb.component';


const routes: Routes = [
  { path: '',  component: FileListComponent },
  { path: 'edit/txt',  component: FileEditorComponent },
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),

    ContextMenuModule,
    NgbModule,
  ],
  declarations: [
    AceEditorDirective,
    BreadcrumbComponent,
    FileComponent,
    FileEditorComponent,
    FileListComponent,
    CreateFolderModalComponent,
    FileRenameModalComponent,
  ],
  providers: [
    FileBufferService,
    FileSelectionService,
    FileService,
  ],
  entryComponents: [
    CreateFolderModalComponent,
    FileRenameModalComponent,
  ]
})
export class FilesModule {}
