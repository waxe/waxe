import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { UrlService } from '../url.service';


export class FileStatus {
  path: string;
  old_path: string;
  status: string;
}


@Injectable()
export class VersioningService {

  constructor(private http: HttpClient, private urlService: UrlService) {}

  getStatus(): Observable<FileStatus[]> {
    return this.http
      .get<FileStatus[]>(this.urlService.API_URLS.versioning.status);
  }

  pull(): Observable<FileStatus[]> {
    return this.http
      .get<FileStatus[]>(this.urlService.API_URLS.versioning.pull);
  }

  commit(paths) {
    const data: string = JSON.stringify({
      'paths': paths,
    });
    return this.http
      .post(this.urlService.API_URLS.versioning.commit, data);
  }
}
