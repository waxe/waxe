import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { File, Folder } from './file';
import { FileService } from './file.service';
import { UrlService } from '../url.service';

@Component({
  moduleId: module.id,
  selector: 'waxe-file',
  template: `
  <ng-container [ngSwitch]="file.type">
    <a [routerLink]="urlService.URLS.files.list" [queryParams]="{path: file.path}" *ngSwitchCase="'folder'">Folder {{file.name}}</a>
    <a [routerLink]="urlService.URLS.files.view" [queryParams]="{path: file.path}" *ngSwitchCase="'file'">File {{file.name}}</a>
  </ng-container>
  `
})
export class FileComponent implements OnInit {

  @Input() file: File;

  constructor(private fileService: FileService, public urlService: UrlService) {}

  ngOnInit(): void {
  }
}
