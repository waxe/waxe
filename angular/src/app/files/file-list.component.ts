import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { NgbModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

import { File, Folder } from './file';
import { FileBufferService } from './file-buffer.service';
import { FileSelectionService } from './file-selection.service';
import { FileService } from './file.service';
import { UrlService } from '../url.service';
import { CreateFileModalComponent } from './create-file-modal.component';
import { CreateFolderModalComponent } from './create-folder-modal.component';
import { FileRenameModalComponent } from './file-rename-modal.component';

import { Observable, Subscription, fromEvent, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter,  map, switchMap } from 'rxjs/operators';


@Component({
  providers: [ContextMenuService],
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div class="search-input-container">
    <input type="text" class="form-control search-input" #input="ngbTypeahead" #inputElt hidden (blur)="closeSearch()" [(ngModel)]="model" (selectItem)="onSelectItem($event)" [ngbTypeahead]="search">
  </div>
  <div class="container-fluid flex overflow" [contextMenu]="fileMenu" [contextMenuSubject]="{}" (contextmenu)="deSelectAll()">
    <div class="row files" [mouseSelection]="fileMenu">
      <div *ngFor="let column of columns" class="col-sm-6 ">
        <div *ngFor="let file of column" class="file">
          <waxe-file [contextMenu]="fileMenu" [contextMenuSubject]="file" [file]="file" mouseSelectable></waxe-file>
        </div>
      </div>
    </div>
  </div>

  <context-menu>
    <ng-template contextMenuItem let-item [visible]="isItemNotDefinedBound" (execute)="createFolder()">
      New folder
    </ng-template>
    <ng-template contextMenuItem let-item [visible]="isItemNotDefinedBound" (execute)="createFile()">
      New file
    </ng-template>
    <ng-template contextMenuItem [visible]="false" divider="true"></ng-template>
    <ng-template contextMenuItem let-item [visible]="isItemDefinedBound" (execute)="fileService.open($event.item)">
      Open
    </ng-template>
    <ng-template contextMenuItem [visible]="isItemDefinedBound" (execute)="rename($event.item);">
      Rename
    </ng-template>
    <ng-template contextMenuItem [visible]="false" divider="true"></ng-template>
    <ng-template contextMenuItem let-item [visible]="false" (execute)="copy()">
      Copy
    </ng-template>
    <ng-template contextMenuItem let-item [visible]="false" (execute)="cut()">
      Cut
    </ng-template>
    <ng-template contextMenuItem [visible]="false" [enabled]="isPasteEnableBound" (execute)="paste($event.item)">
      Paste
    </ng-template>
    <ng-template contextMenuItem [visible]="false" divider="true"></ng-template>
    <ng-template contextMenuItem [visible]="false" (execute)="selectAll()">
      Select all
    </ng-template>
    <ng-template contextMenuItem [visible]="false" [enabled]="hasFileSelectedBound" (execute)="deSelectAll()">
      Deselect all
    </ng-template>
    <ng-template contextMenuItem divider="true" [visible]="false"></ng-template>
    <ng-template contextMenuItem [visible]="false" waxeConfirm (confirm)="remove()">
      Delete
    </ng-template>
  </context-menu>
  `
})
export class FileListComponent implements OnDestroy, OnInit {
  @ViewChild(ContextMenuComponent) public fileMenu: ContextMenuComponent;

  @ViewChild('input') ngbTypeahead: NgbTypeahead;
  @ViewChild('inputElt') inputElRef: ElementRef;

  columns: File[][];
  path: string;
  nbCols = 2;

  keyDownSub: Subscription;

  inputVisible = false;

  public model: any;

  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private router: Router,
    private fileBufferService: FileBufferService,
    public fileService: FileService,
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
        return of(this.path);
      }).subscribe(() => this.fetch());

      this.keyDownSub = fromEvent(document, 'keydown').subscribe(event => {
        const key = (event['key'] || event['which']);
        if (this.inputVisible) {
          if (key === 'Escape') {
            this.closeSearch();
          }
        } else {
          const NOT_ALLOWED = ['Control', 'Escape', 'Alt', 'Shift'];
          if (NOT_ALLOWED.indexOf(key) < 0) {
            this.renderer.removeAttribute(this.inputElRef.nativeElement, 'hidden');
            this.inputElRef.nativeElement.focus();
            this.inputVisible = true;
          }
        }
      });
  }

  ngOnDestroy() {
    this.keyDownSub.unsubscribe();
  }

  search = (text$: Observable<string>) => {
    return text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      switchMap(term => this.fileService.getAllFiles().pipe(
          map((v: any) => v.filter(a => a.toLowerCase().indexOf(term.toLowerCase()) > -1)))
      ),
    );
  }

  closeSearch() {
    this.renderer.setAttribute(this.inputElRef.nativeElement, 'hidden', 'hidden');
    this.inputElRef.nativeElement.value = '';
    this.ngbTypeahead.dismissPopup();
    this.inputVisible = false;
  }

  onSelectItem($event) {
    this.fileService.open({
      name: $event.item,
      path: $event.item,
      type: 'file',
    });
  }

  public isItemDefinedBound = this.isItemDefined.bind(this);
  private isItemDefined(file: File) {
    // Returns true if the context menu is opened when clicking on a file
    return typeof file.name !== 'undefined';
  }

  public isItemNotDefinedBound = this.isItemNotDefined.bind(this);
  private isItemNotDefined(file: File) {
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

  createFile(): void {
    const modalRef = this.modalService.open(CreateFileModalComponent);
    modalRef.componentInstance.path = this.path;
    // TODO: open the created file?
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

  remove(): void {
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
