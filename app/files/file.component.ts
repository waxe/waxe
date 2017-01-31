import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { File, Folder } from './file';
import { FileSelectionService } from './file-selection.service';
import { FileService } from './file.service';
import { UrlService } from '../url.service';

@Component({
  moduleId: module.id,
  selector: 'waxe-file',
  template: `
  <span [ngSwitch]="file.type" (mouseenter)="visibleCheckbox=true" (mouseleave)="visibleCheckbox=false">
    <input type="checkbox" [style.visibility]="(fileSelectionService.visible || visibleCheckbox)? 'visible': 'hidden'" [checked]="fileSelectionService.selected.indexOf(file) !== -1" (click)="fileSelectionService.toggleSelect($event, file)">
    <a [routerLink]="urlService.URLS.files.list" [queryParams]="{path: file.path}" *ngSwitchCase="'folder'">
      <i class="fa fa-folder-o"></i> {{file.name}}
    </a>
    <a [routerLink]="urlService.URLS.files.view" [queryParams]="{path: file.path}" *ngSwitchCase="'file'">
      <i class="fa fa-file-o"></i> {{file.name}}
    </a>
  </span>
  `
})
export class FileComponent implements OnInit {

  @Input() file: File;
  visibleCheckbox: boolean = false;

  constructor(private fileService: FileService, public urlService: UrlService, public fileSelectionService: FileSelectionService) {}

  ngOnInit(): void {
  }

  toggleVisibility() {
    this.visibleCheckbox = !this.visibleCheckbox;
  }
}
