import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'breadcrumb',
  template: `
  <nav class="breadcrumb">
    <a class="breadcrumb-item" *ngFor="let path of paths; let last=last" [class.active]="last" [routerLink]="['/']" [queryParams]="path.path?{'path': path.path}:null">{{path.name}}</a>
  </nav>`
})
export class BreadcrumbComponent {

  public paths: {}[];

  @Input()
  set path(path: string) {
    this.paths = [{
      'name': 'Home',
      'path': null,
    }];
    if (! path) { return; }
    let paths = path.split('/');
    paths.map((name, index) => {
      this.paths.push({
        name: name,
        path: paths.slice(0, index+1).join('/'),
      });
    });
  }
}
