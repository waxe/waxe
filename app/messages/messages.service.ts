import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


export interface IMessage {
  type: string;
  txt: string;
}


@Injectable()
export class MessagesServive {

  private _message: Subject<IMessage> = new Subject<IMessage>();
  public message: Observable<IMessage> = this._message.asObservable();


  public add(message: IMessage) {
    this._message.next(message);
  }

}
