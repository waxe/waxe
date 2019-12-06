import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

import * as InlineEditor from '@ckeditor/ckeditor5-build-inline';

import { Subject, Subscription, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';

import { FileService } from '../file.service';
import { MessagesServive } from '../../messages/messages.service';
import { StatusService } from '../../header/status.service';

import { SocketService } from '../socket.service';


@Component({
  template: `
  <breadcrumb [path]="path"></breadcrumb>
  <div class="no-overflow flex files-editor-po" *ngIf="groupedEntries">
    <div class="flex flex-row">
      <div class="files-editor-sidebar" *ngIf="groupedEntries.length > 1">
        <ul class="nav nav-pills flex-column">
          <li class="nav-item" *ngFor="let group of groupedEntries">
            <a class="nav-link" [class.active]="group.group_id === group_id"
              [routerLink]="" queryParamsHandling="merge" [fragment]="group.group_id">{{ group.group_id }}</a>
          </li>
        </ul>
      </div>
      <div class="po-editor-container">
        <div class="po-viewer" *ngIf="iframeUrl">
          <h4 class="text-center" *ngIf="loading">Loading...</h4>
          <iframe #iframe [src]="iframeUrl" frameborder="0" width="100%" height="100%" *ngIf="!loading"></iframe>
        </div>
        <div #poEditorContainer class="po-entries">
          <div *ngFor="let entry of entries" class="po-entry">
            <div class="badge badge-info" *ngIf="entry.msgctxt">{{entry.msgctxt}}</div>
            <div [innerHTML]="entry.msgid"></div>

            <div [class.entry-disabled]="entry.isLocked">
              <span class="locked-by"><i class="fas fa-lock"></i> {{ entry.lockedBy }}</span>
              <div [innerHTML]="entry.msgstr" (mouseenter)="entry.showCKEditor=true"
                *ngIf="!entry.showCKEditor" class="po-editor-div-translation"></div>

              <ckeditor *ngIf="entry.showCKEditor" [editor]="HTMLEditor" [config]="HTMLEditorConfig"
                [disabled]="entry.isLocked" [(ngModel)]="entry.msgstr" (ngModelChange)="entryChange(entry)"
                (focus)="getLock(entry)" (blur)="releaseLock(entry)"></ckeditor>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
})
export class FileEditorPoComponent implements OnDestroy, OnInit {
  @ViewChild('poEditorContainer') poEditorContainer;
  @HostListener('window:beforeunload')
  quitPage() {
    // When closing the page be sure to release the lock and leave the room
    if (this.currentEntry) {
      this.releaseLock(this.currentEntry);
    }

    if (this.path) {
     this.socketService.leaveRoom(this.path).subscribe();
    }
  }

  HTMLEditor = InlineEditor;
  HTMLEditorConfig = {
    toolbar: [ 'bold', 'italic', 'underline', 'bulletedList' ]
  };

  path: string;
  groupedEntries: Array<any>;
  group_id: string;
  entries: Array<any>;
  textChanged: Subject<any> = new Subject<any>();
  iframeUrl = null;
  loading = false;

  private currentEntry = null;
  private stackLockData = [];

  private routeSub: Subscription;
  private textChangedSub: Subscription;
  private connectSub: Subscription;
  private lockChangeSub: Subscription;
  private objChangeSub: Subscription;

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private fileService: FileService,
    private messagesService: MessagesServive,
    private socketService: SocketService,
    private statusService: StatusService,
  ){}


  ngOnInit(): void {
    this.lockChangeSub = this.socketService.onLockChange().subscribe((lockData: any) => {
      if (!this.groupedEntries) {
        // We didn't get the entries from the API
        // TODO: also use stackLockData to be sure the interface is up to date?
        return;
      }
      this.groupedEntries.map((dict: any) => {
        dict.entries.map((entry) => {
          if (entry.id === lockData.id) {
            entry.isLocked = lockData.status;
            entry.lockedBy = lockData.username;
            return;
          }
        });
      });
    });

    this.objChangeSub = this.socketService.onObjectChange().subscribe((entryData: any) => {
      // TODO: we should use the same subscription for onLockChange &
      // onObjectChange and merge the object properly
      if (!this.groupedEntries) {
        // We didn't get the entries from the API so the store the entry data to apply the change after the loading.
        this.stackLockData.push(entryData);
        return;
      }
      this.groupedEntries.map((dict: any) => {
        dict.entries.map((entry) => {
          if (entry.id === entryData.id) {
            // TODO: we should merge the entry
            entry.msgstr = entryData.msgstr;
            return;
          }
        });
      });
    });

    this.connectSub = this.socketService.onConnect().subscribe(() => {
      // TODO: Reload properly the entries
      window.location.reload();
    });

    this.routeSub = combineLatest(this.route.queryParams, this.route.fragment).pipe(
      switchMap(([params, fragment]) => {
        this.loading = true;
        this.group_id = fragment;
        const previousPath = this.path;
        this.path = params['path'];

        return this.socketService.enterRoom(this.path, previousPath).pipe(
          switchMap(() => {
            // this.sleep(10000);
            return this.fileService.getPo(this.path);
          })
        );
      })
    )
    .subscribe((groupedEntries: Array<any>) => {
      if (this.stackLockData.length) {
        this.stackLockData.map((ent) => {
          groupedEntries.map((dict) => {
            dict.entries.map((entry) => {
              if(entry.id === ent.id) {
                // TODO: we should merge the entry
                entry.msgstr = ent.msgstr;
              }
            });
          });
        });
      }
      this.stackLockData = [];

      this.groupedEntries = groupedEntries;
      if (this.groupedEntries.length) {
        if (! this.group_id) {
          this.group_id = groupedEntries[0].group_id;
        }
        let groups = groupedEntries.filter(dict => dict.group_id === this.group_id);
        if (!groups.length) {
          // The group doesn't exist, get the first one.
          // TODO: support empty po
          this.group_id = groupedEntries[0].group_id;
          groups = [groupedEntries[0]];
        }
        // TODO: what to do if no entries
        this.entries = groups[0].entries;
        if (groups[0].viewer_url) {
          this.iframeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(groups[0].viewer_url);
          this.loading = false;
        }
        if (this.poEditorContainer) {
          // On the first load the ViewChild is not loaded
          this.poEditorContainer.nativeElement.scrollTop = 0;
        }
      }
    });

    this.textChangedSub = this.textChanged.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(([msgstr, entry]) => {
      this.loading = true;
      this.statusService.setLoading();
      this.fileService.updatePo(this.path, entry).subscribe(() => {
        this.socketService.objectChange(this.path, entry);
        this.loading = false;
        this.statusService.setSaved();
      });
    });
  }

  entryChange(entry: any) {
    // NOTE: we pass the msgstr to be sure distinctUntilChanged since we always
    // pass the same object
    this.textChanged.next([entry.msgstr, entry]);
  }

  getLock(entry: any) {
    this.socketService.acquireLock(this.path, entry.id).subscribe((v) => {
      entry.isLocked = !v;
      this.currentEntry = entry;
    });
  }

  releaseLock(entry: any) {
    this.socketService.releaseLock(this.path, entry.id).subscribe((v) => {
      entry.isLocked = !v;
      this.currentEntry = null;
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
    this.textChangedSub.unsubscribe();
    this.connectSub.unsubscribe();
    this.lockChangeSub.unsubscribe();
    this.objChangeSub.unsubscribe();
    this.socketService.leaveRoom(this.path).subscribe();
  }

  sleep(milliseconds) {
    // To be removed use for debugging purpose
    const date = Date.now();
    let currentDate = null;
    do {
    currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  }
}
