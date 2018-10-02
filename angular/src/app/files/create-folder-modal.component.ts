import {Component, Input} from '@angular/core';

import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import { File } from './file';
import { FileService } from './file.service';


@Component({
  template: `
    <div class="modal-header">
      <h4 class="modal-title">New folder</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <form (submit)="createFolder()">
      <div class="modal-body">
        <div class="form-group" [class.has-danger]="formErrors.name">
          <label for="name">Name</label>
          <input type="text" class="form-control form-control-danger" id="name" name="name" [(ngModel)]="name">
          <div class="form-control-feedback" *ngIf="formErrors.name">{{formErrors.name}}</div>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Close</button>
        <button type="submit" class="btn btn-primary">Create folder</button>
      </div>
    </form>
  `
})
export class CreateFolderModalComponent {
  name: string;
  formErrors: {} = {};

  @Input() path: string;

  constructor(public activeModal: NgbActiveModal, private fileService: FileService) {}


  createFolder(): void {
    this.fileService.createFolder(this.path, this.name).subscribe((res: {}) => {
      this.activeModal.close();
    },
    (error: {}) => {
      if (typeof error['errors'] !== 'undefined') {
        this.formErrors = error['errors'];
      }
    });
  }
}
