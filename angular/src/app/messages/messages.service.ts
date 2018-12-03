import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


export interface IMessage {
  type: string;
  txt: string;
}


@Injectable()
export class MessagesServive {

  private _messagesSubject: Subject<IMessage[]> = new Subject<IMessage[]>();
  public messages: Observable<IMessage[]> = this._messagesSubject.asObservable();
  private _messages: IMessage[] = [];


  public add(message: IMessage) {
    this._messages = [message];
    this._messagesSubject.next(this._messages);

    if (message.type !== 'danger') {
      setTimeout(() => {
        this.remove(message);
      }, 1500);
    }
  }

  public addError(txt: string) {
    this.add({type: 'danger', txt} as IMessage);
  }

  public remove(message: IMessage) {
    const index: number = this._messages.indexOf(message);
    this._messages.splice(index, 1);
    this._messagesSubject.next(this._messages);
  }

}
