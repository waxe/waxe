import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginComponent } from './login.component';


const routes: Routes = [
  { path: 'login',  component: LoginComponent },
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forRoot(routes),
  ],
  declarations: [
    LoginComponent,
  ],
  providers: [
    AuthGuard,
    AuthService,
  ],
})
export class AuthModule {}
