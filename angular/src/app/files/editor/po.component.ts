import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';

import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { FileService } from '../file.service';
import { MessagesServive } from '../../messages/messages.service';


@Component({
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div class="no-overflow flex files-editor-po">
    <div *ngFor="let entry of entries">
      <div class="badge badge-info" *ngIf="entry.msgctxt">{{entry.msgctxt}}</div>
      <div [innerHTML]="entry.msgid"></div>

      <div [innerHTML]="entry.msgstr" (mouseenter)="entry.showCKEditor=true"
        *ngIf="!entry.showCKEditor"></div>

      <ckeditor *ngIf="entry.showCKEditor" [editor]="HTMLEditor" [config]="HTMLEditorConfig"
        [(ngModel)]="entry.msgstr" (ngModelChange)="entryChange(entry)"></ckeditor>

    </div>
  </div>
  `
})
export class FileEditorPoComponent implements OnDestroy, OnInit {

  HTMLEditor = InlineEditor;
  HTMLEditorConfig = {
    toolbar: [ 'bold', 'italic', 'underline', 'bulletedList' ]
  };

  path: string;
  entries: Array<any>;
  textChanged: Subject<any> = new Subject<any>();

  private routeSub: Subscription;
  private textChangedSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private messagesService: MessagesServive,
  ) {}


  ngOnInit(): void {
    this.routeSub = this.route.queryParams.pipe(
      switchMap((params) => {
        return this.fileService.getPo(params['path']).pipe(
          map(res => {
            this.path = params['path'];
            return res;
          })
        );
      })
    )
    .subscribe((entries: Array<any>) => {
      this.entries = entries;
    });

    this.textChangedSub = this.textChanged.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(([msgstr, entry]) => {
      this.fileService.updatePo(this.path, entry).subscribe(() => {
        this.messagesService.add({
          type: 'success',
          txt: 'Saved!',
        });
      });
    });
  }

  entryChange(entry: any) {
    // NOTE: we pass the msgstr to be sure distinctUntilChanged since we always
    // pass the same object
    this.textChanged.next([entry.msgstr, entry]);
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.textChangedSub.unsubscribe();
  }
}
