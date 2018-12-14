import { Injectable } from '@angular/core';

import { Observable, Subject } from 'rxjs';


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
    // TODO: Don't delete the error message?
    this._messages = [message];
    this._messagesSubject.next(this._messages);

    setTimeout(() => {
      this.remove(message);
    }, 1500);
  }

  public remove(message: IMessage) {
    const index: number = this._messages.indexOf(message);
    this._messages.splice(index, 1);
    this._messagesSubject.next(this._messages);
  }

}
