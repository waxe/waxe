import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';

import { Observable } from 'rxjs';

import { UrlService } from '../url.service';
import { File } from './file';


@Injectable()
export class FileBufferService {

  copyFiles: File[] = [];
  cutFiles: File[] = [];

  constructor(private http: Http, private urlService: UrlService) {}

  reset(): void {
    this.copyFiles = [];
    this.cutFiles = [];
  }

  selectCopyFiles(files: File[]): void {
    this.reset();
    files.map((file: File) => this.copyFiles.push(file));
  }

  selectCutFiles(files: File[]): void {
    this.reset();
    files.map((file: File) => this.cutFiles.push(file));
  }

  isEmpty(): boolean {
    if (!this.copyFiles.length && !this.cutFiles.length) {
      return true;
    }
    return false;
  }

}
