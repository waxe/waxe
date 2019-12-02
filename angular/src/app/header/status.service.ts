import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';


@Injectable()
export class StatusService {

  public loading = false;
  public saved = false;


  public setLoading() {
    this.loading = true;
    this.saved = false;
  }

  public setSaved() {
    this.loading = false;
    this.saved = true;
  }

}
