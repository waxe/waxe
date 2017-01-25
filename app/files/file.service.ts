import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';

import { Observable } from 'rxjs';

import { UrlService } from '../url.service';
import { File } from './file';


@Injectable()
export class FileService {

  constructor(private http: Http, private urlService: UrlService) {}

  getFiles(path: string=null): Observable<File[]> {
    let params: URLSearchParams = new URLSearchParams();
    if (path) {
      params.set('path', path);
    }
    return this.http
      .get(this.urlService.API_URLS.files.list, {search: params})
      .map((res: Response) => res.json() as File[]);
  }


  getSource(path: string): Observable<string> {
    let params: URLSearchParams = new URLSearchParams();
    params.set('path', path);

    return this.http
      .get(this.urlService.API_URLS.files.source, {search: params})
      .map((res: Response) => res.json()['source']);
  }

}
