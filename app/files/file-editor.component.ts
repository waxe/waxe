import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { FileService } from './file.service';


@Component({
  moduleId: module.id,
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div ace-editor style="min-height: 200px; width:100%; overflow: auto;" class="flex-1"
       [text]="text" [readOnly]="true" [theme]="'chrome'"></div>
  `
})
export class FileEditorComponent implements OnInit {
  path: string;
  text:string = "Hello world";

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .switchMap((params: Params) => {
        this.path = params['path'];
        return this.fileService.getSource(params['path'])
      })
      .subscribe((source: string) => {
        this.text = source;
      });
  }
}
