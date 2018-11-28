import { Component, OnInit } from '@angular/core';

import { FileStatus, VersioningService } from './versioning.service';


@Component({
  template: `
  <breadcrumb [path]="''"></breadcrumb>
  <div class="container-fluid flex overflow">
    <p *ngIf="msg">{{ msg }}</p>
    <div *ngFor="let fileStatus of files">
          <status-badge [status]="fileStatus.status"></status-badge>
          {{fileStatus.path}}
    </div>
  </div>
  `
})
export class VersioningUpdateComponent implements OnInit {

  public msg: string;
  public files: FileStatus[];

  constructor(
    private versioningService: VersioningService,
  ) { }

  ngOnInit(): void {
    this.versioningService.pull().subscribe((res: any) => {
      this.msg = res.msg;
      this.files = res.status;
    });
  }

}
