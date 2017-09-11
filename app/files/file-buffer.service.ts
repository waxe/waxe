import { Injectable } from '@angular/core';

import { File } from './file';


@Injectable()
export class FileBufferService {

  public files: File[] = [];
  public cut: boolean;

  public reset(): void {
    this.files = [];
  }

  public setFiles(files: File[]): void {
    this.files = files.slice(0);
  }

  public setCopyFiles(files: File[]): void {
    this.setFiles(files);
    this.cut = false;
  }

  public setCutFiles(files: File[]): void {
    this.setFiles(files);
    this.cut = true;
  }

  isEmpty(): boolean {
    return this.files.length === 0
  }
}
