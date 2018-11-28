import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  template: `
  <div class="block-signin">
    <form (submit)="onSubmit()" class="form-signin">
      <h1 class="h3 mb-3 font-weight-normal text-center">Please sign in</h1>
      <label for="email" class="sr-only">Username</label>
      <input type="text" class="form-control" required="required"
        id="email" placeholder="Username" name="username" [(ngModel)]="username">
      <label for="password" class="sr-only">Password</label>
      <input type="password" required="required" class="form-control"
        id="password" placeholder="Password" name="password" [(ngModel)]="password">
      <button type="submit" class="btn btn-primary btn-block mt-3">Sign in</button>
    </form>
  </div>
  `
})
export class LoginComponent {

  public username: string;
  public password: string;

  constructor(private router: Router, private authService: AuthService) {}

  onSubmit() {
    this.authService.login(this.username, this.password).subscribe((res) => {
      this.router.navigate(['/']);
    });
  }
}
