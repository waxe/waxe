import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth/auth.service';
import { FileService } from './files/file.service';
import { SocketService } from './files/socket.service';
import { StatusService } from './header/status.service';
import { UrlService } from './url.service';
import { VersioningService } from './versioning/versioning.service';


@Component({
  selector: 'waxe-app',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {

  public data: any = {};

  constructor(private router: Router, public fileService: FileService, public urlService: UrlService,
              public authService: AuthService, public socketService: SocketService,
              public statusService: StatusService, public versioningService: VersioningService) {
    this.socketService.initSocket();
  }

  ngOnInit() {
    this.versioningService.getBranches().subscribe(res => this.data = res);
  }


  switchBranch(branchName) {
    this.versioningService.switchBranch(branchName).subscribe(() => {
      this.data.current = branchName;
      // NOTE: pass the query param to be sure angular reload the page
      this.router.navigate(['/'], {'queryParams': {'reload': branchName}});
    });
    return false;
  }

  logout() {
    this.authService.logout().subscribe(res => {
      this.router.navigate([this.urlService.URLS.auth.login]);
    });
  }
}
