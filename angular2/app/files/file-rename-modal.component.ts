import {Component, Input} from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { File } from './file';
import { FileService } from './file.service';


@Component({
  moduleId: module.id,
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Rename</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <form (submit)="rename()">
      <div class="modal-body">
        <div class="form-group" [class.has-danger]="formErrors.name">
          <label for="name">Rename {{file.name}}</label>
          <input type="text" class="form-control form-control-danger" id="name" name="name" [(ngModel)]="name">
          <div class="form-control-feedback" *ngIf="formErrors.name">{{formErrors.name}}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="activeModal.close()">Close</button>
        <button type="button" class="btn btn-primary" (click)="rename()">Rename</button>
      </div>
    </form>
  `
})
export class FileRenameModalComponent {
  private _file: File;
  name: string;
  formErrors: {} = {};

  @Input()
  set file(file: File) {
    this._file = file;
    this.name = file.name;
  }

  get file() {
    return this._file;
  }

  constructor(public activeModal: NgbActiveModal, private fileService: FileService) {}


  rename(): void {
    this.fileService.rename(this.file.path, this.name).subscribe((res: {}) => {
      this.activeModal.close();
    },
    (error: {}) => {
      if (typeof error['errors'] !== 'undefined') {
        this.formErrors = error['errors'];
      }
    });
  }
}
