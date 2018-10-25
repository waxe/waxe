import { Injectable } from '@angular/core';
import { Headers, Http, URLSearchParams, Response } from '@angular/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Rx';

import { UrlService } from '../url.service';
import { File } from './file';


@Injectable()
export class FileService {

  // TODO: use headers
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http, private router: Router, private urlService: UrlService) {}

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


  update(path: string, source: string): Observable<string> {
    let data: string = JSON.stringify({
      'path': path,
      'source': source,
    });

    return this.http
      .put(this.urlService.API_URLS.files.list, data)
      .map((res: Response) => res.json());
  }


  createFolder(path: string, name: string): Observable<{}> {
    let data: string = JSON.stringify({
      'path': path,
      'name': name,
    });
    return this.http
      .post(this.urlService.API_URLS.files.folder, data)
      .map((res: Response) => res.json())
      .catch((error: Response) => {
        return Observable.throw(error.json())
      });
  }

  createFile(path: string, name: string): Observable<{}> {
    let data: string = JSON.stringify({
      'path': path,
      'name': name,
    });
    return this.http
      .post(this.urlService.API_URLS.files.list, data)
      .map((res: Response) => res.json())
      .catch((error: Response) => {
        return Observable.throw(error.json());
      });
  }

  delete(files: File[]): Observable<{}> {
    let body: string = JSON.stringify({'path': files.map((file: File) => file.path)});
    return this.http
      .delete(this.urlService.API_URLS.files.list, {body: body, headers: this.headers})
      .map((res: Response) => res.json())
      .catch((error: Response) => {
        return Observable.throw(error.json())
      });
  }

  rename(path: string, name: string): Observable<{}> {
    let data: string = JSON.stringify({
      'path': path,
      'name': name,
    });
    return this.http
      .post(this.urlService.API_URLS.files.rename, data)
      .map((res: Response) => res.json())
      .catch((error: Response) => {
        return Observable.throw(error.json())
      });
  }

  copy(files: File[], path: string): Observable<{}> {
    let data: string = JSON.stringify({
      'path': files.map((file: File) => file.path),
      'dst': path,
    });
    return this.http
      .post(this.urlService.API_URLS.files.copy, data)
      .map((res: Response) => res.json())
      .catch((error: Response) => {
        return Observable.throw(error.json())
      });
  }

  move(files: File[], path: string) {
    let data: string = JSON.stringify({
      'path': files.map((file: File) => file.path),
      'dst': path,
    });
    return this.http
      .post(this.urlService.API_URLS.files.move, data)
      .map((res: Response) => res.json())
      .catch((error: Response) => {
        return Observable.throw(error.json())
      });
  }

  open(file: File): void {
    if (file.type === 'folder') {
      this.router.navigate([this.urlService.URLS.files.list], {queryParams: {path: file.path}});
    }
    else {
      this.router.navigate([this.urlService.URLS.files.view], {queryParams: {path: file.path}});
    }
  }
}
