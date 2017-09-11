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
  <div class="container-fluid flex" [contextMenu]="fileMenu" [contextMenuSubject]="{}" (contextmenu)="deSelectAll()">
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
    <template contextMenuItem let-item [visible]="isSimpleActionEnableBound" (execute)="fileService.open($event.item)">
      Open
    </template>
    <template contextMenuItem [visible]="isSimpleActionEnableBound" (execute)="rename($event.item);">
      Rename
    </template>
    <template contextMenuItem [visible]="isSimpleActionEnableBound" divider="true"></template>
    <template contextMenuItem let-item [visible]="isItemDefined" (execute)="copy()">
      Copy
    </template>
    <template contextMenuItem let-item [visible]="isItemDefined" (execute)="cut()">
      Cut
    </template>
    <template contextMenuItem [visible]="isPasteVisibleBound" [enabled]="isPasteEnableBound" (execute)="paste($event.item)">
      Paste
    </template>
    <template contextMenuItem [visible]="isItemNotDefined" divider="true"></template>
    <template contextMenuItem [visible]="isItemNotDefined" (execute)="selectAll()">
      Select all
    </template>
    <template contextMenuItem [visible]="isItemNotDefined" [enabled]="hasFileSelectedBound" (execute)="deSelectAll()">
      Deselect all
    </template>
    <template contextMenuItem divider="true" [visible]="isItemDefined"></template>
    <template contextMenuItem [visible]="isItemDefined" (execute)="remove()">
      Delete
    </template>
  </context-menu>
  `
})
export class FileListComponent implements OnInit {
  @ViewChild(ContextMenuComponent) public fileMenu: ContextMenuComponent;

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

  public isSimpleActionEnableBound = this.isSimpleActionEnable.bind(this);
  private isSimpleActionEnable(file: File) {
    return this.isItemDefined(file) && this.fileSelectionService.selected.length === 1;
  }

  public hasFileSelectedBound = this.hasFileSelected.bind(this);
  private hasFileSelected(file: File) {
    return !!this.fileSelectionService.selected.length;
  }

  public isPasteVisibleBound = this.isPasteVisible.bind(this);
  isPasteVisible(file: File) {
    return ((file.name && file.type === 'folder') || !file.name)
  }

  public isPasteEnableBound = this.isPasteEnable.bind(this);
  isPasteEnable(file: File) {
    return !this.fileBufferService.isEmpty();
  }

  createFolder(): void {
    const modalRef = this.modalService.open(CreateFolderModalComponent);
    modalRef.componentInstance.path = this.path;
    modalRef.result.then(() => this.fetch());
  }

  rename(file: File): void {
    const modalRef = this.modalService.open(FileRenameModalComponent);
    modalRef.componentInstance.file = file;
    modalRef.result.then(() => {
      this.fetch();
      // Since we use the file path we can't copy/paste a renamed file
      this.fileBufferService.reset();
    });
  }

  remove(file: File): void {
    if (this.fileSelectionService.selected.length === 0) {
      // Should never comes since the option is not displayed in the context
      // menu if nothing is selected.
      return;
    }

    this.fileService.delete(this.fileSelectionService.selected).subscribe(() => this.fetch());
  }

  selectAll(): void {
    this.fileSelectionService.selectAll();
  }

  deSelectAll(): void {
    this.fileSelectionService.deselectAll();
  }

  copy(): void {
    this.fileBufferService.setCopyFiles(this.fileSelectionService.selected);
  }

  cut(): void {
    this.fileBufferService.setCutFiles(this.fileSelectionService.selected);
  }

  paste(file: File): void {
    if (this.fileBufferService.isEmpty()) {
      // Should never comes since the option is not displayed in the context
      // menu if nothing in the buffer.
      return;
    }
    const dst: string = file.path? file.path: this.path;
    if (this.fileBufferService.cut) {
      this.fileService.move(this.fileBufferService.files, dst).subscribe((res: any) => {
        this.fetch();
      });
    }
    else {
      this.fileService.copy(this.fileBufferService.files, dst).subscribe((res: any) => {
        this.fetch();
      });
    }
  }
}
