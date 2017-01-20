import './rxjs-extensions';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule }      from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent }  from './app.component';

import { FilesModule } from './files/files.module';
import { UrlService }  from './url.service';


@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    RouterModule,

    FilesModule,
  ],
  declarations: [
    AppComponent,
  ],
  providers: [
    UrlService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
