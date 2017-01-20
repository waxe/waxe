import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';

import { Observable } from 'rxjs';

import { UrlService } from '../url.service';
import { File } from './file';


@Injectable()
export class FileService {

  constructor(private http: Http, private urlService: UrlService) {}

  getFiles(path: string=null): Observable<File[]> {
    console.log('path', path);
    let params: URLSearchParams = new URLSearchParams();
    if (path) {
      params.set('path', path);
    }
    return this.http
      .get(this.urlService.API_URLS.files.list, {search: params})
      .map((res: Response) => res.json() as File[]);
  }

}
