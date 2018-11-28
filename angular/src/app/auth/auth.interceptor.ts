import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { UrlService } from '../url.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private urlService: UrlService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(request).pipe(
        catchError(response => {
          if (response instanceof HttpErrorResponse) {
            if (response.status === 403) {
              this.router.navigate([this.urlService.URLS.auth.login]);
            }
          }
          return Observable.of(response);
        })
      );
  }
}
