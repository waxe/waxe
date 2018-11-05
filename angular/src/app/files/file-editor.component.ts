import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';

import { FileService } from './file.service';
import { MessagesServive } from '../messages/messages.service';


@Component({
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div class="no-overflow flex">
    <ngx-monaco-editor class="my-code-editor" [options]="editorOptions"
      [(ngModel)]="text" (ngModelChange)="change($event)"></ngx-monaco-editor>
  </div>
  `
})
export class FileEditorComponent implements OnInit {
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
    private messagesService: MessagesServive
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.queryParams
      .switchMap((params: Params) => {
        this.path = params['path'];
        return this.fileService.getSource(params['path']);
      })
      .subscribe((source: string) => {
        this.fileService.currentPath = this.path;
        this.editorOptions = {
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          // TODO: better language support
          language: this.path.endsWith('.html') ? 'html' : 'text/plain',
        };
        this.text = source;
      });

      this.textChangedSub = this.textChanged
        .debounceTime(500)
        .distinctUntilChanged()
        .subscribe(text => {
          this.fileService.update(this.path, text).subscribe(() => {
            this.messagesService.add({
              type: 'success',
              txt: 'Saved!',
            });
          });
        });
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
