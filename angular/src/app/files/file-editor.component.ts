import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subject, Subscription } from 'rxjs';

import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { FileService } from './file.service';
import { MessagesServive } from '../messages/messages.service';
import { StatusService } from '../header/status.service';


@Component({
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div class="no-overflow flex">
    <ngx-monaco-editor class="my-code-editor" [options]="editorOptions"
      [(ngModel)]="text" (ngModelChange)="change($event)" (onInit)="onInit($event)"></ngx-monaco-editor>
  </div>
  `
})
export class FileEditorComponent implements OnDestroy, OnInit {
  @ViewChild('editor') editor;

  path: string;
  text: string;
  textChanged: Subject<string> = new Subject<string>();

  private routeSub: Subscription;
  private textChangedSub: Subscription;

  editorOptions: {} = null;

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private messagesService: MessagesServive,
    private statusService: StatusService,
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParams.pipe(
      switchMap((params: Params) => {
        this.path = params['path'];
        return this.fileService.getSource(params['path']);
      })
    )
    .subscribe((source: string) => {
      this.fileService.currentPath = this.path;
      this.editorOptions = {
        wordWrap: 'on',
        scrollBeyondLastLine: false,
      };
      this.text = source;
    });

      this.textChangedSub = this.textChanged.pipe(
        debounceTime(500),
        distinctUntilChanged(),
      ).subscribe(text => {
          this.statusService.setLoading();
          this.fileService.update(this.path, text).subscribe(() => {
            this.statusService.setSaved();
          });
        });
  }

  _findLanguage(ext) {
    const languages = monaco.languages.getLanguages();
    for (const d of languages) {
      if (d['extensions'].indexOf(`.${ext}`) !== -1) {
        return d['id'];
      }
    }
    return 'plaintext';
  }

  onInit(editor) {
    // Monaco is not defined before the init so we need to wait to set the
    // language.
    const ext = this.path.split('.').pop();
    const id = this._findLanguage(ext);
    monaco.editor.setModelLanguage(editor.getModel(), id);
  }

  change(text: string) {
    this.textChanged.next(text);
  }

  ngOnDestroy() {
    this.fileService.currentPath = null;
    this.routeSub.unsubscribe();
    this.textChangedSub.unsubscribe();
  }

}
