import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { File, Folder } from './file';
import { FileService } from './file.service';

@Component({
  moduleId: module.id,
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div *ngFor="let file of files">
    <waxe-file [file]="file"></waxe-file>
  </div>
  `
})
export class FileListComponent implements OnInit {
  folders: Folder[];
  files: File[];
  path: string;

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .switchMap((params: Params) => {
        this.path = params['path'];
        return this.fileService.getFiles(params['path'])
      })
      .subscribe((files: File[]) => this.files = files);
  }
}
