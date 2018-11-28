import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { FileService } from './files/file.service';
import { UrlService } from './url.service';


@Component({
  selector: 'waxe-app',
  templateUrl: './app.component.html',
})
export class AppComponent {

  constructor(private router: Router, public fileService: FileService, public urlService: UrlService, public authService: AuthService) {}

  logout() {
    this.authService.logout().subscribe(res => {
      this.router.navigate([this.urlService.URLS.auth.login]);
    });
  }
}
