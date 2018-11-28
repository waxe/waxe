import './rxjs-extensions';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ContextMenuModule } from 'ngx-contextmenu';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';

import { FilesModule } from './files/files.module';
import { VersioningModule } from './versioning/versioning.module';
import { UrlService } from './url.service';

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
    MonacoEditorModule.forRoot(),
    NgbModule.forRoot(),
    FilesModule,
    VersioningModule,
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
