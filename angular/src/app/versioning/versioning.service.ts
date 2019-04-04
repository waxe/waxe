import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';


import { MessagesServive } from '../messages/messages.service';
import { UrlService } from '../url.service';


export class FileStatus {
  path: string;
  old_path: string;
  status: string;
}


@Injectable()
export class VersioningService {

  private cache$: Observable<any>;

  constructor(private http: HttpClient, private messagesService: MessagesServive, private urlService: UrlService) {}

  getStatus(): Observable<FileStatus[]> {
    return this.http
      .get<FileStatus[]>(this.urlService.API_URLS.versioning.status);
  }

  getBranches(): Observable<string[]> {
    return this.http
      .get<string[]>(this.urlService.API_URLS.versioning.branches);
  }

  switchBranch(branchName) {
    return this.http
      .post(this.urlService.API_URLS.versioning.branches, {'branch': branchName}).pipe(
        catchError((res) => {
          this.messagesService.addError(res.error.error);
          return of();
        })
      );
  }

  pull(): Observable<FileStatus[]> {
    return this.http
      .get<FileStatus[]>(this.urlService.API_URLS.versioning.pull);
  }

  commit(paths, message) {
    const data: string = JSON.stringify({
      'paths': paths,
      'message': message,
    });
    return this.http
      .post(this.urlService.API_URLS.versioning.commit, data);
  }

  get_status() {
    return this.http
      .get<boolean>(this.urlService.API_URLS.versioning.check);
  }


  forceReload() {
    this.cache$ = null;
  }

  check(): Observable<boolean> {
    if (!this.cache$) {
      this.cache$  = this.get_status().pipe(
        shareReplay(1)
      );
    }
    return this.cache$;
  }
}
