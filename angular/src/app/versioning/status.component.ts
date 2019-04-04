import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { FileStatus, VersioningService } from './versioning.service';


@Component({
  template: `
  <breadcrumb [path]="''"></breadcrumb>
  <div class="container-fluid flex overflow">
    <div *ngIf="empty">
      The repository is clean.
    </div>
    <form [formGroup]="form" (submit)="onSubmit()" *ngIf="!empty" class="form-status">
      <ng-template ngFor let-fileStatus [ngForOf]="files" let-i="index">
        <div formArrayName="files" class="form-group form-check">
          <input type="checkbox" [formControlName]="i" class="form-check-input" />
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

  <ng-template #content let-modal>
    <div class="modal-header">
      <h4 class="modal-title">Commit</h4>
      <button type="button" class="close" aria-label="Close" (click)="modal.dismiss('')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div class="form-group">
        <label>Commit message (optional):</label>
        <textarea class="form-control" [(ngModel)]="commitMessage"></textarea>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="modal.close()">Commit</button>
    </div>
  </ng-template>

  `
})
export class VersioningStatusComponent implements OnInit {

  public files: FileStatus[];
  public form: FormGroup;
  public empty = false;
  public commitMessage = '';

  @ViewChild('content') modal: TemplateRef<any>;

  constructor(
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private versioningService: VersioningService,
  ) {
    this.form = new FormGroup({
      'files': new FormArray([])
    });
  }

  init(): void {
    this.commitMessage = '';
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

    this.modalService.open(this.modal).result.then((result) => {
      this.versioningService.commit(paths, this.commitMessage).subscribe(() => this.init());
    });
  }

}
