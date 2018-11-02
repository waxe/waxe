import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';

import { IMessage, MessagesServive } from './messages.service';
import { Subscription } from 'rxjs/Subscription';


@Component({
  selector: 'waxe-messages',
  template: `
    <div>
      <ngb-alert [type]="message.type" *ngFor="let message of messages"
        (close)="messagesService.remove(message)">{{message.txt}}</ngb-alert>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesComponent implements OnInit, OnDestroy {

  public messages: IMessage[] = [];
  private sub: Subscription;

  constructor(private ref: ChangeDetectorRef, private messagesService: MessagesServive) {}

  ngOnInit() {
    this.sub = this.messagesService.messages.subscribe((res) => {
      this.messages = res;
      this.ref.detectChanges();
    });
  }

  ngOnDestroy () {
    this.sub.unsubscribe();
  }
}
