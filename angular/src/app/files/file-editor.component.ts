import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import 'brace/theme/chrome';


import { FileService } from './file.service';
import { MessagesServive } from '../messages/messages.service';


@Component({
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <ace-editor #editor class="editor-container" [text]="text"
              [durationBeforeCallback]="1000"
              (textChanged)="onChange($event)"
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
    private messagesService: MessagesServive
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .switchMap((params: Params) => {
        this.path = params['path'];
        return this.fileService.getSource(params['path']);
      })
      .subscribe((source: string) => {
        this.fileService.currentPath = this.path;
        this.text = source;
      });
  }

  ngAfterViewInit() {
    // Hack to have the good height on the editor
    this.editor.getEditor().resize();
  }

  onChange(code) {
    // NOTE: onChange is triggered on load, don't update if nothing has changed.
    if (this.text !== code) {
      this.fileService.update(this.path, code).subscribe(() => {
        this.messagesService.add({
          type: 'success',
          txt: 'Saved!',
        });
      });
    }
  }

  ngOnDestroy() {
    this.fileService.currentPath = null;
  }

}
