import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { File, Folder } from './file';
import { FileService } from './file.service';

@Component({
  moduleId: module.id,
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div class="container-fluid">
    <div class="row files">
      <div *ngFor="let column of columns" class="col-sm-6 ">
        <div *ngFor="let file of column" class="file">
          <waxe-file [file]="file"></waxe-file>
        </div>
      </div>
    </div>
  </div>
  `
})
export class FileListComponent implements OnInit {
  columns: File[][];
  path: string;
  nbCols: number = 2;

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
      .subscribe((files: File[]) => {
        let nbPerCol: number = Math.ceil(files.length / this.nbCols);
        this.columns = [];
        for (var i=0, len=files.length;  i<len; i+=nbPerCol) {
          this.columns.push(files.slice(i, i+nbPerCol));
        }
      });
  }
}
