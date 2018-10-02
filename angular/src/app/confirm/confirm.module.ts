import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { ConfirmComponent, ConfirmDirective }  from './confirm';


@NgModule({
  imports:      [
    CommonModule,
    NgbModule,
  ],
  declarations: [ ConfirmDirective, ConfirmComponent ],
  exports: [
    ConfirmDirective,
  ],
  entryComponents: [
    ConfirmComponent,
  ],
})
export class ConfirmModule { }
