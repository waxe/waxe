import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

import { MessagesServive } from './messages/messages.service';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private messagesService: MessagesServive) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      return next.handle(request).pipe(
        catchError(response => {
          if (response instanceof HttpErrorResponse) {
            if (response.status === 500) {
              this.messagesService.addError(response.error.error);
              // TODO: check if we really need to throw the exection here,
              // perhaps we can stop the propagation
            }
          }
          return throwError(response);
        })
      );
  }
}
