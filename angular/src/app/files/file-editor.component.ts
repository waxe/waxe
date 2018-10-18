import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import 'brace/theme/chrome';


import { FileService } from './file.service';


@Component({
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <ace-editor #editor class="editor-container" [text]="text" [readOnly]="true"
              [theme]="'chrome'" [options]="options" mode="text"></ace-editor>
  `
})
export class FileEditorComponent implements OnInit {
  @ViewChild('editor') editor;

  path: string;
  text: string ;
  options: {} = {
    wrap: true,
  };

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

  ngAfterViewInit() {
    // Hack to have the good height on the editor
    this.editor.getEditor().resize();
  }
}
