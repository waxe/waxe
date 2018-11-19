import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { ContextMenuModule } from 'ngx-contextmenu';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BreadcrumbModule } from '../breadcrumb/breadcrumb.module';

import { ConfirmModule } from '../confirm/confirm.module';

import { AuthGuard } from '../auth/auth.guard';
import { FileBufferService } from './file-buffer.service';
import { FileComponent } from './file.component';
import { FileEditorComponent } from './file-editor.component';
import { FileListComponent } from './file-list.component';
import { CreateFileModalComponent } from './create-file-modal.component';
import { CreateFolderModalComponent } from './create-folder-modal.component';
import { FileRenameModalComponent } from './file-rename-modal.component';
import { FileSelectionService } from './file-selection.service';
import { FileService } from './file.service';

import { MouseSelectionDirective, MouseSelectableDirective } from './file-mouse-selection.directive';


const routes: Routes = [
  { path: '',  component: FileListComponent, canActivate: [AuthGuard]},
  { path: 'edit/txt',  component: FileEditorComponent },
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(routes),

    ContextMenuModule,
    MonacoEditorModule,
    NgbModule,

    BreadcrumbModule,
    ConfirmModule,
  ],
  declarations: [
    FileComponent,
    FileEditorComponent,
    FileListComponent,
    CreateFileModalComponent,
    CreateFolderModalComponent,
    FileRenameModalComponent,

    MouseSelectionDirective,
    MouseSelectableDirective,
  ],
  providers: [
    FileBufferService,
    FileSelectionService,
    FileService,
  ],
  entryComponents: [
    CreateFileModalComponent,
    CreateFolderModalComponent,
    FileRenameModalComponent,
  ]
})
export class FilesModule {}
