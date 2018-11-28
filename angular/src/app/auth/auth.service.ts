import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { UrlService } from '../url.service';

import { catchError, map, tap } from 'rxjs/operators';


class LoggedUser {
  username: string;
  roles: Array<string>;
}



@Injectable()
export class AuthService {

  loggedUser = null;

  constructor(private http: HttpClient, private urlService: UrlService) {}

  login(username, password): Observable<any> {
    return this.http
      .post(this.urlService.API_URLS.auth.login, {username, password})
      .pipe(
        tap(res => this.loggedUser = res as LoggedUser)
      );
  }

  logout(): Observable<any> {
    return this.http
      .post(this.urlService.API_URLS.auth.logout, {})
      .pipe(
        tap(res => this.loggedUser = null)
      );
  }

  getLogin(): Observable<any> {
    return this.http.get(this.urlService.API_URLS.auth.login).pipe(
      tap(res => this.loggedUser = res as LoggedUser)
    );
  }

  isLoggedIn(): Observable<boolean> {
    if (this.loggedUser) {
      return Observable.of(true);
    }
    return this.getLogin().pipe(
      map(res => {
        return true;
      }),
      catchError(res => {
        return Observable.of(false);
      })
    );
  }

  hasRole(role): Observable<any> {
    return this.isLoggedIn().pipe(
      map(res => {
        if (res) {
          if (! role) { return true; }
          return this.loggedUser.roles.indexOf(role) !== -1;
        }
        return false;
      })
    );
  }
}
