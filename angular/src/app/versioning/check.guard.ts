import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { MessagesServive } from '../messages/messages.service';
import { VersioningService } from '../versioning/versioning.service';


@Injectable()
export class VersioningCheckGuard implements CanActivate {
  constructor(private messagesService: MessagesServive, private versioningService: VersioningService) {}

  canActivate( next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

    return this.versioningService.check().pipe(
      tap(v => {
        if (!v) {
          this.messagesService.addError('The repo is conflicted, please contact administrator.');
        }
      })
    );
  }
}
