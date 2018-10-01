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

import { MessagesComponent } from './messages/messages.component';
import { MessagesServive } from './messages/messages.service';


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
    MessagesComponent,
  ],
  providers: [
    UrlService,
    MessagesServive,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
