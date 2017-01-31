import './rxjs-extensions';
import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule }      from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ContextMenuModule } from 'angular2-contextmenu';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent }  from './app.component';

import { FilesModule } from './files/files.module';
import { UrlService }  from './url.service';


@NgModule({
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    RouterModule,
    ContextMenuModule.forRoot({
      useBootstrap4: true,
    }),
    NgbModule.forRoot(),
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
