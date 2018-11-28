import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Rx';

import { UrlService } from '../url.service';


export class FileStatus {
  path: string;
  old_path: string;
  status: string;
}


@Injectable()
export class VersioningService {

  constructor(private http: Http, private urlService: UrlService) {}

  getStatus(): Observable<FileStatus[]> {
    return this.http
      .get(this.urlService.API_URLS.versioning.status)
      .map((res: Response) => res.json() as FileStatus[]);
  }

  pull(): Observable<FileStatus[]> {
    return this.http
      .get(this.urlService.API_URLS.versioning.pull)
      .map((res: Response) => res.json() as FileStatus[]);
  }

  commit(paths) {
    const data: string = JSON.stringify({
      'paths': paths,
    });
    return this.http
      .post(this.urlService.API_URLS.versioning.commit, data);
  }
}
