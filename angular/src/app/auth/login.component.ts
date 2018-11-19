import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  template: `
  <br>
  <br>
  <form (submit)="onSubmit()">
    <div class="form-group">
      <label for="exampleInputEmail1">Username</label>
      <input type="text" class="form-control" required="required"
        id="exampleInputEmail1" placeholder="Username" name="username" [(ngModel)]="username">
    </div>
    <div class="form-group">
      <label for="exampleInputPassword1">Password</label>
      <input type="password" required="required" class="form-control"
        id="exampleInputPassword1" placeholder="Password" name="password" [(ngModel)]="password">
    </div>
    <button type="submit" class="btn btn-primary">Login</button>
  </form>
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
