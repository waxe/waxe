import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { IMessage, MessagesServive } from './messages.service';
import { Subscription } from 'rxjs/Subscription';


@Component({
  moduleId: module.id,
  selector: 'waxe-messages',
  template: `
    <div>
      <ngb-alert [type]="message.type" *ngFor="let message of messages" (close)="removeMessage(message)">{{message.txt}}</ngb-alert>
    </div>
  `,
})
export class MessagesComponent implements OnInit, OnDestroy {

  public messages: IMessage[] = [];
  private sub: Subscription;


  constructor(private messagesService: MessagesServive) {}


  ngOnInit() {
    this.sub = this.messagesService.message.subscribe((message: IMessage) => this.messages.push(message));
  }

  ngOnDestroy () {
    this.sub.unsubscribe();
  }

  public removeMessage(message: IMessage) {
    const index: number = this.messages.indexOf(message);
    this.messages.splice(index, 1);
  }

}
