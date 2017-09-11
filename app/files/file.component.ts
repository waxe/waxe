import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

import { File, Folder } from './file';
import { FileSelectionService } from './file-selection.service';
import { FileService } from './file.service';
import { UrlService } from '../url.service';

@Component({
  moduleId: module.id,
  selector: 'waxe-file',
  template: `
  <span [ngSwitch]="file.type">
    <a href="#" (click)="select(file, $event)" (dblclick)="fileService.open(file)" [class.selected]="fileSelectionService.shouldHighlight(file)">
      <i class="fa fa-folder-o" *ngSwitchCase="'folder'"></i>
      <i class="fa fa-file-o" *ngSwitchCase="'file'"></i>
      {{file.name}}
    </a>
  </span>
  `
})
export class FileComponent {

  // We need to have it public to acces it in the mouse directive
  @Input() public file: File;

  private preventClick: boolean = false;
  private timer: any;

  constructor(private router: Router, private urlService: UrlService, public fileSelectionService: FileSelectionService, public fileService: FileService) {}


  public select(file: File, event: MouseEvent): boolean {
    if (event.shiftKey) {
      this.fileSelectionService.selectUntil(file);
    }
    else if (event.ctrlKey) {
      this.fileSelectionService.toggleSelect(file);
    }
    else {
      this.fileSelectionService.select(file);
    }
    return false;
  }

}
