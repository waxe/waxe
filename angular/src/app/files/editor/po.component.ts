import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';

import { Subject, Subscription, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { FileService } from '../file.service';
import { MessagesServive } from '../../messages/messages.service';


@Component({
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div class="no-overflow flex files-editor-po">
    <div class="container-fluid" *ngIf="groupedEntries">
      <div class="row">
        <div class="col-sm-2" *ngIf="groupedEntries.length > 1">
          <ul class="nav nav-pills flex-column">
            <li class="nav-item" *ngFor="let group of groupedEntries">
              <a class="nav-link" [class.active]="group.group_id === group_id"
                [routerLink]="" queryParamsHandling="merge" [fragment]="group.group_id">{{ group.group_id }}</a>
            </li>
          </ul>
        </div>
        <div class="po-editor-container" [class.col-sm-10]="groupedEntries.length > 1" [class.col-sm-12]="groupedEntries.length < 2">
          <div *ngFor="let entry of entries">
            <div class="badge badge-info" *ngIf="entry.msgctxt">{{entry.msgctxt}}</div>
            <div [innerHTML]="entry.msgid"></div>

            <div [innerHTML]="entry.msgstr" (mouseenter)="entry.showCKEditor=true"
              *ngIf="!entry.showCKEditor"></div>

            <ckeditor *ngIf="entry.showCKEditor" [editor]="HTMLEditor" [config]="HTMLEditorConfig"
              [(ngModel)]="entry.msgstr" (ngModelChange)="entryChange(entry)"></ckeditor>
          </div>
        </div>
      </div>
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
  groupedEntries: Array<any>;
  group_id: string;
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
    this.routeSub = combineLatest(this.route.queryParams, this.route.fragment).pipe(
      switchMap(([params, fragment]) => {
        this.group_id = fragment;
        return this.fileService.getPo(params['path']).pipe(
          map(res => {
            this.path = params['path'];
            return res;
          })
        );
      })
    )
    .subscribe((groupedEntries: Array<any>) => {
      this.groupedEntries = groupedEntries;
      if (this.groupedEntries.length) {
        if (! this.group_id) {
          this.group_id = groupedEntries[0].group_id;
        }
        const group = groupedEntries.filter(dict => dict.group_id === this.group_id);
        // TODO: what to do if no entries
        this.entries = group[0].entries;
      }
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
