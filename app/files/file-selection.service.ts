import { Injectable } from '@angular/core';
import { Http, URLSearchParams, Response } from '@angular/http';

import { Observable } from 'rxjs';

import { UrlService } from '../url.service';
import { File } from './file';


@Injectable()
export class FileSelectionService {

  visible: boolean = false;
  selected: File[] = [];

  constructor(private http: Http, private urlService: UrlService) {}

  reset(): void {
    this.selected = [];
    this.setVisible();
  }

  setVisible(): void {
    this.visible = !!this.selected.length;
  }

  add(file: File): void {
    this.selected.push(file);
  }

  toggleSelect(e: any, file: File): void {
    if (e.target.checked) {
      this.add(file);
    }
    else {
      let index: number = this.selected.indexOf(file);
      if (index !== 1) {
        this.selected.splice(index, 1);
      }
    }

    this.setVisible();
  }

}
