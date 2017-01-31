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

  reset() {
    this.visible = false;
    this.selected = [];
  }

  toggleSelect(e: any, file: File) {
    if (e.target.checked) {
      this.selected.push(file);
    }
    else {
      let index: number = this.selected.indexOf(file);
      if (index !== 1) {
        this.selected.splice(index, 1);
      }
    }

    this.visible = !!this.selected.length;
  }

}
