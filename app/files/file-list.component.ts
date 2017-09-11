import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ContextMenuComponent, ContextMenuService } from 'angular2-contextmenu';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { File, Folder } from './file';
import { FileBufferService } from './file-buffer.service';
import { FileSelectionService } from './file-selection.service';
import { FileService } from './file.service';
import { UrlService } from '../url.service';
import { CreateFolderModalComponent } from './create-folder-modal.component';
import { FileRenameModalComponent } from './file-rename-modal.component';

import { Observable } from 'rxjs/Rx';

@Component({
  moduleId: module.id,
  providers: [ContextMenuService],
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div class="container-fluid flex" [contextMenu]="fileMenu" [contextMenuSubject]="{}">
    <div class="row files" [mouseSelection]="fileMenu">
      <div *ngFor="let column of columns" class="col-sm-6 ">
        <div *ngFor="let file of column" class="file">
          <waxe-file [contextMenu]="fileMenu" [contextMenuSubject]="file" [file]="file" mouseSelectable></waxe-file>
        </div>
      </div>
    </div>
  </div>

  <context-menu>
    <template contextMenuItem let-item [visible]="isItemNotDefined" (execute)="createFolder()">
      New folder
    </template>
    <template contextMenuItem [visible]="isItemNotDefined" divider="true"></template>
    <template contextMenuItem let-item [visible]="isItemDefined" (execute)="fileService.open($event.item)">
      Open
    </template>
    <template contextMenuItem [visible]="isItemDefined" (execute)="rename($event.item);">
      Rename
    </template>
    <template contextMenuItem [enabled]="isBulkActionEnableBound" (execute)="inDevelopmentMsg('Copy');">
      Copy
    </template>
    <template contextMenuItem [enabled]="isBulkActionEnableBound" (execute)="inDevelopmentMsg('Cut');">
      Cut
    </template>
    <template contextMenuItem [visible]="isItemNotDefined" [enabled]="isPasteEnableBound" (execute)="inDevelopmentMsg('Paste');">
      Paste
    </template>
    <template contextMenuItem divider="true"></template>
    <template contextMenuItem (execute)="selectAll()">
      Select all
    </template>
    <template contextMenuItem [enabled]="isBulkActionEnableBound" (execute)="deSelectAll()">
      Deselect all
    </template>
    <template contextMenuItem divider="true"></template>
    <template contextMenuItem [enabled]="isBulkActionEnableBound" (execute)="remove($event.item)">
      Delete
    </template>
  </context-menu>
  `
})
export class FileListComponent implements OnInit {
  @ViewChild(ContextMenuComponent) public fileMenu: ContextMenuComponent;

  files: File[];
  columns: File[][];
  path: string;
  nbCols: number = 2;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fileBufferService: FileBufferService,
    private fileService: FileService,
    private fileSelectionService: FileSelectionService,
    private modalService: NgbModal,
    private contextMenuService: ContextMenuService,
    private urlService: UrlService,
  ) {}


  fetch(): void {
    this.fileService.getFiles(this.path).subscribe((files: File[]) => {
        this.files = files;
        this.fileSelectionService.destroy();
        this.fileSelectionService.files = files;
        let nbPerCol: number = Math.ceil(files.length / this.nbCols);
        this.columns = [];
        for (var i=0, len=files.length;  i<len; i+=nbPerCol) {
          this.columns.push(files.slice(i, i+nbPerCol));
        }
      });
  }

  ngOnInit(): void {
    this.route.queryParams
      .switchMap((params: Params) => {
        this.path = params['path'];
        return Observable.of(this.path);
      }).subscribe(() => this.fetch());
  }

  public isItemDefined(file: File) {
    // Returns true if the context menu is opened when clicking on a file
    return typeof file.name !== 'undefined';
  }

  public isItemNotDefined(file: File) {
    // Returns true if the context menu is opened when clicking everywhere but not on a file
    return typeof file.name === 'undefined';
  }

  public isBulkActionEnableBound = this.isBulkActionEnable.bind(this);
  isBulkActionEnable(file: File) {
    return (typeof file.name !== 'undefined') || this.fileSelectionService.selected.length;
  }

  public isPasteEnableBound = this.isPasteEnable.bind(this);
  isPasteEnable(file: File) {
    return this.fileBufferService.copyFiles.length || this.fileBufferService.cutFiles.length;
  }

  inDevelopmentMsg(msg: string) {
    alert(msg + ': Feature in development');
  }

  createFolder(): void {
    const modalRef = this.modalService.open(CreateFolderModalComponent);
    modalRef.componentInstance.path = this.path;
    modalRef.result.then(() => this.fetch());
  }

  rename(file: File): void {
    const modalRef = this.modalService.open(FileRenameModalComponent);
    modalRef.componentInstance.file = file;
    modalRef.result.then(() => this.fetch());
  }

  remove(file: File): void {
    // TODO: we should display a message when it's done
    // We should also subscribe properly on error
    if (typeof file.name !== 'undefined') {
      this.fileService.remove([file]).subscribe(() => this.fetch());
      return;
    }
    if (!this.fileSelectionService.selected.length) {
      // TODO: display an error message
      return;
    }

    this.fileService.remove(this.fileSelectionService.selected).subscribe(() => this.fetch());
  }

  selectAll(): void {
    this.fileSelectionService.selectAll();
  }

  deSelectAll(): void {
    this.fileSelectionService.deselectAll();
  }
}
