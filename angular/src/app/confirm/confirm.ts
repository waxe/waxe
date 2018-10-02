import { Component, Directive, ElementRef, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Directive({ selector: '[waxeConfirm]' })
export class ConfirmDirective {

    @Output() confirm: EventEmitter<any> = new EventEmitter();
    @Output() reject: EventEmitter<any> = new EventEmitter();

    @Input('waxeConfirm') body: string;

    @HostListener('execute', ['$event'])
    @HostListener('click', ['$event'])
    onClick(e: any) {
      let modalRef = this.modalService.open(ConfirmComponent, {});
      modalRef.componentInstance.body = this.body;
      modalRef.result.then(() => {
        this.confirm.emit();
      }).catch(() => {
          this.reject.emit();
      });
    }

    constructor(private modalService: NgbModal) {}
}


@Component({
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Confirm</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <template [ngIf]="body">{{body}}</template>
      <template [ngIf]="!body">Are you sure?</template>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-primary" (click)="activeModal.close()">Yes</button>
    </div>
  `,
})
export class ConfirmComponent {

  @Input() body: string;

  constructor(public activeModal: NgbActiveModal) {}
}
