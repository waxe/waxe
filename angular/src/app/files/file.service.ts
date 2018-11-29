import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';

import { UrlService } from '../url.service';
import { File } from './file';


@Injectable()
export class FileService {

  // This is used in the file editor to have the preview button.
  public currentPath: string;

  constructor(private http: HttpClient, private router: Router, private urlService: UrlService) {}

  getFiles(path: string = null): Observable<File[]> {
    const params = path ? new HttpParams().set('path', path) : {};
    return this.http
      .get<File[]>(this.urlService.API_URLS.files.list, {params});
  }


  getSource(path: string): Observable<string> {
    const params = new HttpParams().set('path', path);

    return this.http
      .get<{source}>(this.urlService.API_URLS.files.source, {params}).map(res => res.source);
  }


  update(path: string, source: string): Observable<string> {
    const data: string = JSON.stringify({
      'path': path,
      'source': source,
    });

    return this.http
      .put<string>(this.urlService.API_URLS.files.list, data);
  }


  createFolder(path: string, name: string): Observable<{}> {
    const data: string = JSON.stringify({
      'path': path,
      'name': name,
    });
    return this.http
      .post<{}>(this.urlService.API_URLS.files.folder, data)
      .catch((error) => {
        return Observable.throw(error.json());
      });
  }

  createFile(path: string, name: string): Observable<{}> {
    const data: string = JSON.stringify({
      'path': path,
      'name': name,
    });
    return this.http
      .post<{}>(this.urlService.API_URLS.files.list, data)
      .catch((error) => {
        return Observable.throw(error.json());
      });
  }

  delete(files: File[]): Observable<{}> {
    const body: string = JSON.stringify({'path': files.map((file: File) => file.path)});
    const httpOptions = {
      headers: new HttpHeaders({'Content-Type': 'application/json'}),
      body: body,
    };
    return this.http
      .delete<{}>(this.urlService.API_URLS.files.list, httpOptions)
      .catch((error) => {
        return Observable.throw(error.json());
      });
  }

  rename(path: string, name: string): Observable<{}> {
    const data: string = JSON.stringify({
      'path': path,
      'name': name,
    });
    return this.http
      .post<{}>(this.urlService.API_URLS.files.rename, data)
      .catch((error) => {
        return Observable.throw(error.json());
      });
  }

  copy(files: File[], path: string): Observable<{}> {
    const data: string = JSON.stringify({
      'path': files.map((file: File) => file.path),
      'dst': path,
    });
    return this.http
      .post<{}>(this.urlService.API_URLS.files.copy, data)
      .catch((error) => {
        return Observable.throw(error.json());
      });
  }

  move(files: File[], path: string) {
    const data: string = JSON.stringify({
      'path': files.map((file: File) => file.path),
      'dst': path,
    });
    return this.http
      .post(this.urlService.API_URLS.files.move, data)
      .catch((error) => {
        return Observable.throw(error.json());
      });
  }

  open(file: File): void {
    if (file.type === 'folder') {
      this.router.navigate([this.urlService.URLS.files.list], {queryParams: {path: file.path}});
    } else {
      this.router.navigate([this.urlService.URLS.files.view], {queryParams: {path: file.path}});
    }
  }
}
