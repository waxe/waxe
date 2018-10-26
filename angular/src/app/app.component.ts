import { Component } from '@angular/core';

import { FileService } from './files/file.service';
import { UrlService } from './url.service';


@Component({
  selector: 'waxe-app',
  templateUrl: './app.component.html',
})
export class AppComponent {

  constructor(public fileService: FileService, public urlService: UrlService) {}
}
