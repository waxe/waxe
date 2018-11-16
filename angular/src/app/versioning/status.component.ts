import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';

import { FileStatus, VersioningService } from './versioning.service';


@Component({
  template: `
  <div class="container-fluid flex overflow">
    <div *ngIf="empty">
      The repository is clean.
    </div>
    <form [formGroup]="form" (submit)="onSubmit()" *ngIf="!empty">
      <ng-template ngFor let-fileStatus [ngForOf]="files" let-i="index">
        <div formArrayName="files">
          <input type="checkbox" [formControlName]="i" />
          <status-badge [status]="fileStatus.status"></status-badge>
          <ng-template [ngIf]="fileStatus.old_path">
            {{fileStatus.old_path}} ->
          </ng-template>
          {{fileStatus.path}}
        </div>
      </ng-template>
      <button type="submit" class="btn btn-success">Commit</button>
    </form>
  </div>
  `
})
export class VersioningStatusComponent implements OnInit {

  public files: FileStatus[];
  public form: FormGroup;
  public empty = false;

  constructor(
    private formBuilder: FormBuilder,
    private versioningService: VersioningService,
  ) {
    this.form = new FormGroup({
      'files': new FormArray([])
    });
  }

  init(): void {
    this.versioningService.getStatus().subscribe((res: any) => {
      const files = res.status;
      if (files.length === 0) {
        this.empty = true;
      } else {
        const controls = files.map(c => new FormControl(false));
        this.form = this.formBuilder.group({
          files: new FormArray(controls)
        });
        this.files = files;
      }
    });
  }

  ngOnInit(): void {
    this.init();
  }

  onSubmit(evt) {
    const paths = this.form.value.files
                          .map((v, i) => v ? this.files[i].path : null)
                          .filter(v => v !== null);

    this.versioningService.commit(paths).subscribe(() => {this.init(); });
  }

}
